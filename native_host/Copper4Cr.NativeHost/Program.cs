using System.Buffers.Binary;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Win32;

namespace Copper4Cr.NativeHost;

internal static class Program
{
    private const int MaximumFrameSize = 1024 * 1024;

    public static async Task<int> Main(string[] args)
    {
        if (args.Length > 0 && (args[0] == "--install" || args[0] == "--uninstall"))
        {
            return NativeHostInstaller.Execute(args);
        }

        try
        {
            await RunNativeMessagingAsync();
            return 0;
        }
        catch (Exception ex)
        {
            await Console.Error.WriteLineAsync($"Native host stopped: {ex.Message}");
            return 1;
        }
    }

    private static async Task RunNativeMessagingAsync()
    {
        using Stream input = Console.OpenStandardInput();
        using Stream output = Console.OpenStandardOutput();
        var writer = new NativeMessagingWriter(output);
        await using var udpHost = new UdpSocketHost(writer.WriteAsync);

        while (true)
        {
            byte[]? frame = await ReadFrameAsync(input);
            if (frame is null)
            {
                break;
            }

            long requestId = 0;
            string? requestType = null;
            try
            {
                using JsonDocument document = JsonDocument.Parse(frame);
                JsonElement request = document.RootElement;
                if (request.ValueKind != JsonValueKind.Object)
                {
                    throw new InvalidDataException("The request must be a JSON object.");
                }

                requestId = ReadRequestId(request);
                if (!request.TryGetProperty("v", out JsonElement version) ||
                    !version.TryGetInt32(out int versionNumber) || versionNumber != 1)
                {
                    throw new InvalidDataException("Unsupported or missing protocol version.");
                }

                if (!request.TryGetProperty("type", out JsonElement typeElement) ||
                    typeElement.ValueKind != JsonValueKind.String)
                {
                    throw new InvalidDataException("The request type is missing.");
                }

                requestType = typeElement.GetString();
                JsonObject response = await udpHost.HandleAsync(request, requestId, requestType!);
                await writer.WriteAsync(response);
            }
            catch (Exception ex) when (ex is JsonException or InvalidDataException or
                InvalidOperationException or FormatException or ArgumentException)
            {
                await writer.WriteAsync(new JsonObject
                {
                    ["v"] = 1,
                    ["id"] = requestId,
                    ["type"] = "error",
                    ["socketOpen"] = false,
                    ["error"] = ex.Message
                });
            }

            if (requestType == "close")
            {
                break;
            }
        }
    }

    private static long ReadRequestId(JsonElement request)
    {
        if (!request.TryGetProperty("id", out JsonElement idElement) ||
            !idElement.TryGetInt64(out long id) || id <= 0)
        {
            throw new InvalidDataException("A positive integer request ID is required.");
        }

        return id;
    }

    private static async Task<byte[]?> ReadFrameAsync(Stream input)
    {
        byte[] header = new byte[4];
        if (!await ReadBlockAsync(input, header, true))
        {
            return null;
        }

        int length = BinaryPrimitives.ReadInt32LittleEndian(header);
        if (length <= 0 || length > MaximumFrameSize)
        {
            throw new InvalidDataException($"Invalid Native Messaging frame length: {length}.");
        }

        byte[] payload = new byte[length];
        await ReadBlockAsync(input, payload, false);
        return payload;
    }

    private static async Task<bool> ReadBlockAsync(Stream input, Memory<byte> buffer, bool allowCleanEof)
    {
        int offset = 0;
        while (offset < buffer.Length)
        {
            int bytesRead = await input.ReadAsync(buffer[offset..]);
            if (bytesRead == 0)
            {
                if (allowCleanEof && offset == 0)
                {
                    return false;
                }

                throw new EndOfStreamException("The Native Messaging frame is truncated.");
            }

            offset += bytesRead;
        }

        return true;
    }
}

internal sealed class NativeMessagingWriter
{
    private readonly Stream _output;
    private readonly SemaphoreSlim _writeLock = new(1, 1);

    public NativeMessagingWriter(Stream output)
    {
        _output = output;
    }

    public async Task WriteAsync(JsonObject message)
    {
        byte[] payload = JsonSerializer.SerializeToUtf8Bytes(message);
        byte[] header = new byte[4];
        BinaryPrimitives.WriteInt32LittleEndian(header, payload.Length);

        await _writeLock.WaitAsync();
        try
        {
            await _output.WriteAsync(header);
            await _output.WriteAsync(payload);
            await _output.FlushAsync();
        }
        finally
        {
            _writeLock.Release();
        }
    }
}

internal static class NativeHostInstaller
{
    private const string HostName = "com.copper4cr.udp";
    private const string WindowsRegistryPath = @"Software\Google\Chrome\NativeMessagingHosts\" + HostName;

    public static int Execute(string[] args)
    {
        try
        {
            if (args.Length == 2 && args[0] == "--install")
            {
                Install(args[1]);
                return 0;
            }

            if (args.Length == 1 && args[0] == "--uninstall")
            {
                Uninstall();
                return 0;
            }

            PrintUsage();
            return 2;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Installation failed: {ex.Message}");
            return 1;
        }
    }

    private static void Install(string extensionId)
    {
        ValidateExtensionId(extensionId);

        string executablePath = Environment.ProcessPath ??
            throw new InvalidOperationException("Cannot determine the native host executable path.");
        string manifest = CreateManifest(executablePath, extensionId);

        if (OperatingSystem.IsWindows())
        {
            string manifestPath = GetWindowsManifestPath();
            WriteManifest(manifestPath, manifest);
            RegisterWindows(manifestPath);
            Console.WriteLine($"Installed {HostName} for extension {extensionId}.");
            Console.WriteLine($"Manifest: {manifestPath}");
            return;
        }

        if (OperatingSystem.IsLinux())
        {
            EnsureExecutable(executablePath);
            foreach (string directory in GetLinuxManifestDirectories())
            {
                string manifestPath = Path.Combine(directory, HostName + ".json");
                WriteManifest(manifestPath, manifest);
                Console.WriteLine($"Manifest: {manifestPath}");
            }

            Console.WriteLine($"Installed {HostName} for extension {extensionId}.");
            return;
        }

        throw new PlatformNotSupportedException("Native host installation supports Windows and Linux only.");
    }

    private static void Uninstall()
    {
        if (OperatingSystem.IsWindows())
        {
            Registry.CurrentUser.DeleteSubKey(WindowsRegistryPath, false);
            string manifestPath = GetWindowsManifestPath();
            if (File.Exists(manifestPath))
            {
                File.Delete(manifestPath);
            }
        }
        else if (OperatingSystem.IsLinux())
        {
            foreach (string directory in GetLinuxManifestDirectories())
            {
                string manifestPath = Path.Combine(directory, HostName + ".json");
                if (File.Exists(manifestPath))
                {
                    File.Delete(manifestPath);
                }
            }
        }
        else
        {
            throw new PlatformNotSupportedException("Native host installation supports Windows and Linux only.");
        }

        Console.WriteLine($"Uninstalled {HostName}.");
    }

    private static void ValidateExtensionId(string extensionId)
    {
        if (extensionId.Length != 32 || extensionId.Any(c => c is < 'a' or > 'p'))
        {
            throw new ArgumentException("The extension ID must contain exactly 32 lowercase letters from a to p.");
        }
    }

    private static string CreateManifest(string executablePath, string extensionId)
    {
        return JsonSerializer.Serialize(new
        {
            name = HostName,
            description = "Copper4Cr UDP Native Messaging host",
            path = executablePath,
            type = "stdio",
            allowed_origins = new[] { $"chrome-extension://{extensionId}/" }
        }, new JsonSerializerOptions { WriteIndented = true });
    }

    private static void WriteManifest(string manifestPath, string manifest)
    {
        string? directory = Path.GetDirectoryName(manifestPath);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllText(manifestPath, manifest, new UTF8Encoding(false));
    }

    [System.Runtime.Versioning.SupportedOSPlatform("windows")]
    private static void RegisterWindows(string manifestPath)
    {
        using RegistryKey key = Registry.CurrentUser.CreateSubKey(WindowsRegistryPath, true);
        key.SetValue(null, manifestPath, RegistryValueKind.String);
    }

    private static string GetWindowsManifestPath()
    {
        return Path.Combine(AppContext.BaseDirectory, HostName + ".json");
    }

    private static IEnumerable<string> GetLinuxManifestDirectories()
    {
        string configHome = Environment.GetEnvironmentVariable("XDG_CONFIG_HOME") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(configHome))
        {
            configHome = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".config");
        }

        yield return Path.Combine(configHome, "google-chrome", "NativeMessagingHosts");
        yield return Path.Combine(configHome, "chromium", "NativeMessagingHosts");
    }

    private static void EnsureExecutable(string executablePath)
    {
        var startInfo = new ProcessStartInfo("/bin/chmod")
        {
            UseShellExecute = false
        };
        startInfo.ArgumentList.Add("+x");
        startInfo.ArgumentList.Add(executablePath);
        using Process? process = Process.Start(startInfo);
        if (process is null)
        {
            throw new InvalidOperationException("Cannot start chmod to make the native host executable.");
        }

        process.WaitForExit();
        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"chmod failed with exit code {process.ExitCode}.");
        }
    }

    private static void PrintUsage()
    {
        Console.WriteLine("Copper4Cr.NativeHost --install <32-character-extension-id>");
        Console.WriteLine("Copper4Cr.NativeHost --uninstall");
    }
}
