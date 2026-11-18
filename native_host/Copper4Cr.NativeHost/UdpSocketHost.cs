using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Copper4Cr.NativeHost;

internal sealed class UdpSocketHost : IAsyncDisposable
{
    private readonly Func<JsonObject, Task> _sendMessage;
    private readonly CancellationTokenSource _lifetime = new();
    private readonly List<Task> _receiveTasks = new();
    private readonly object _sync = new();
    private Socket? _ipv4Socket;
    private Socket? _ipv6Socket;
    private bool _closed;

    public UdpSocketHost(Func<JsonObject, Task> sendMessage)
    {
        _sendMessage = sendMessage;
    }

    public async Task<JsonObject> HandleAsync(JsonElement request, long id, string type)
    {
        return type switch
        {
            "bind" => Bind(id),
            "send" => await SendAsync(request, id),
            "close" => await CloseAsync(id),
            _ => Error(id, $"Unsupported request type: {type}.", AnySocketOpen())
        };
    }

    private JsonObject Bind(long id)
    {
        lock (_sync)
        {
            if (_closed || _ipv4Socket is not null || _ipv6Socket is not null)
            {
                return Error(id, "UDP sockets are already bound or closed.", AnySocketOpen());
            }

            var errors = new List<string>();
            Socket? ipv4Socket = null;
            Socket? ipv6Socket = null;
            try
            {
                ipv4Socket = CreateAndBind(AddressFamily.InterNetwork);
            }
            catch (SocketException ex)
            {
                errors.Add($"IPv4: {ex.Message}");
            }

            try
            {
                ipv6Socket = CreateAndBind(AddressFamily.InterNetworkV6);
            }
            catch (SocketException ex)
            {
                errors.Add($"IPv6: {ex.Message}");
            }

            if (ipv4Socket is null && ipv6Socket is null)
            {
                JsonObject failure = Error(id, string.Join("; ", errors), false);
                failure["ready"] = false;
                failure["ipv4Port"] = 0;
                failure["ipv6Port"] = 0;
                return failure;
            }

            _ipv4Socket = ipv4Socket;
            _ipv6Socket = ipv6Socket;
            int ipv4Port = GetLocalPort(ipv4Socket);
            int ipv6Port = GetLocalPort(ipv6Socket);

            if (ipv4Socket is not null)
            {
                _receiveTasks.Add(ReceiveLoopAsync(ipv4Socket, "ipv4", _lifetime.Token));
            }

            if (ipv6Socket is not null)
            {
                _receiveTasks.Add(ReceiveLoopAsync(ipv6Socket, "ipv6", _lifetime.Token));
            }

            var response = Response(id, "bound");
            response["ready"] = true;
            response["ipv4Port"] = ipv4Port;
            response["ipv6Port"] = ipv6Port;
            response["socketOpen"] = true;
            if (errors.Count > 0)
            {
                response["error"] = string.Join("; ", errors);
            }

            return response;
        }
    }

    private static Socket CreateAndBind(AddressFamily family)
    {
        var socket = new Socket(family, SocketType.Dgram, ProtocolType.Udp);
        try
        {
            if (family == AddressFamily.InterNetworkV6)
            {
                socket.DualMode = false;
            }

            IPAddress address = family == AddressFamily.InterNetwork ? IPAddress.Any : IPAddress.IPv6Any;
            socket.Bind(new IPEndPoint(address, 0));
            return socket;
        }
        catch
        {
            socket.Dispose();
            throw;
        }
    }

    private async Task<JsonObject> SendAsync(JsonElement request, long id)
    {
        string family = ReadRequiredString(request, "family");
        if (family != "ipv4" && family != "ipv6")
        {
            return Error(id, "The address family must be ipv4 or ipv6.", AnySocketOpen());
        }

        string address = ReadRequiredString(request, "address");
        int port = ReadPort(request);
        byte[] datagram = Convert.FromBase64String(ReadRequiredString(request, "data"));
        Socket? socket = family == "ipv4" ? _ipv4Socket : _ipv6Socket;
        if (_closed || socket is null)
        {
            return Error(id, $"The {family} UDP socket is not bound.", AnySocketOpen());
        }

        try
        {
            AddressFamily addressFamily = family == "ipv4" ?
                AddressFamily.InterNetwork : AddressFamily.InterNetworkV6;
            IPAddress remoteAddress = await ResolveAddressAsync(address, addressFamily, _lifetime.Token);
            var remoteEndPoint = new IPEndPoint(remoteAddress, port);
            int bytesSent = await socket.SendToAsync(
                datagram, SocketFlags.None, remoteEndPoint, _lifetime.Token);

            var response = Response(id, "sent");
            response["family"] = family;
            response["bytesSent"] = bytesSent;
            response["socketOpen"] = true;
            return response;
        }
        catch (OperationCanceledException) when (_lifetime.IsCancellationRequested)
        {
            return Error(id, "The UDP socket was closed while sending.", false);
        }
        catch (Exception ex) when (ex is SocketException or InvalidOperationException or ArgumentException)
        {
            return Error(id, ex.Message, !_closed);
        }
    }

    private static async Task<IPAddress> ResolveAddressAsync(
        string address, AddressFamily family, CancellationToken cancellationToken)
    {
        if (IPAddress.TryParse(address, out IPAddress? parsedAddress))
        {
            if (parsedAddress.AddressFamily != family)
            {
                throw new ArgumentException("The IP address does not match the requested address family.");
            }

            return parsedAddress;
        }

        IPAddress[] addresses = await Dns.GetHostAddressesAsync(address, cancellationToken);
        return addresses.FirstOrDefault(candidate => candidate.AddressFamily == family) ??
            throw new InvalidOperationException($"No {family} address was found for {address}.");
    }

    private async Task ReceiveLoopAsync(Socket socket, string family, CancellationToken cancellationToken)
    {
        byte[] buffer = new byte[65535];
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                EndPoint remoteEndPoint = family == "ipv4" ?
                    new IPEndPoint(IPAddress.Any, 0) : new IPEndPoint(IPAddress.IPv6Any, 0);
                SocketReceiveFromResult result = await socket.ReceiveFromAsync(
                    buffer, SocketFlags.None, remoteEndPoint, cancellationToken);
                var remote = (IPEndPoint)result.RemoteEndPoint;
                string remoteAddress = remote.Address.ToString();
                if (family == "ipv6")
                {
                    remoteAddress = $"[{remoteAddress}]";
                }

                var message = new JsonObject
                {
                    ["v"] = 1,
                    ["type"] = "receive",
                    ["family"] = family,
                    ["remoteAddress"] = remoteAddress,
                    ["remotePort"] = remote.Port,
                    ["data"] = Convert.ToBase64String(buffer, 0, result.ReceivedBytes)
                };
                await _sendMessage(message);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (ObjectDisposedException) when (_closed)
            {
                break;
            }
            catch (SocketException) when (_closed || cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                if (_closed || cancellationToken.IsCancellationRequested)
                {
                    break;
                }

                try
                {
                    var message = new JsonObject
                    {
                        ["v"] = 1,
                        ["type"] = "receiveError",
                        ["family"] = family,
                        ["socketOpen"] = true,
                        ["error"] = ex.Message
                    };
                    await _sendMessage(message);
                }
                catch (Exception writeException)
                {
                    await Console.Error.WriteLineAsync($"Cannot report UDP receive error: {writeException.Message}");
                    break;
                }
            }
        }
    }

    private async Task<JsonObject> CloseAsync(long id)
    {
        Task[] receiveTasks;
        lock (_sync)
        {
            if (!_closed)
            {
                _closed = true;
                _lifetime.Cancel();
                _ipv4Socket?.Close();
                _ipv6Socket?.Close();
                _ipv4Socket = null;
                _ipv6Socket = null;
            }

            receiveTasks = _receiveTasks.ToArray();
        }

        try
        {
            await Task.WhenAll(receiveTasks);
        }
        catch (Exception ex)
        {
            await Console.Error.WriteLineAsync($"UDP receive loop stopped with an error: {ex.Message}");
        }

        var response = Response(id, "close");
        response["socketOpen"] = false;
        return response;
    }

    public async ValueTask DisposeAsync()
    {
        await CloseAsync(0);
        _lifetime.Dispose();
    }

    private bool AnySocketOpen()
    {
        return !_closed && (_ipv4Socket is not null || _ipv6Socket is not null);
    }

    private static int GetLocalPort(Socket? socket)
    {
        return socket?.LocalEndPoint is IPEndPoint endPoint ? endPoint.Port : 0;
    }

    private static string ReadRequiredString(JsonElement request, string propertyName)
    {
        if (!request.TryGetProperty(propertyName, out JsonElement value) ||
            value.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(value.GetString()) &&
            propertyName != "data")
        {
            throw new InvalidDataException($"The {propertyName} property must be a string.");
        }

        return value.GetString()!;
    }

    private static int ReadPort(JsonElement request)
    {
        if (!request.TryGetProperty("port", out JsonElement value) ||
            !value.TryGetInt32(out int port) || port is <= 0 or > 65535)
        {
            throw new InvalidDataException("The remote port must be an integer from 1 to 65535.");
        }

        return port;
    }

    private static JsonObject Response(long id, string type)
    {
        return new JsonObject
        {
            ["v"] = 1,
            ["id"] = id,
            ["type"] = type
        };
    }

    private static JsonObject Error(long id, string error, bool socketOpen)
    {
        var response = Response(id, "error");
        response["socketOpen"] = socketOpen;
        response["error"] = error;
        return response;
    }
}
