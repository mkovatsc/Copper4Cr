Copper for Chrome (Cu<sub>4</sub>Cr) CoAP user-agent
====================================================

<p align="right">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a>
</p>

A CoAP debugging tool implementing [RFC7252](http://tools.ietf.org/html/rfc7252)

A Chrome browser-based CoAP user-agent for browsing and debugging Internet of Things devices
-------------------------------------------------------

## Introduction

Copper (Cu) is a CoAP (Constrained Application Protocol) user-agent that can be installed as a Chrome extension. It provides an intuitive graphical interface for discovering, browsing, and managing CoAP resources on IoT devices.

This repository ([mcuxmx/Copper4Cr](https://github.com/mcuxmx/Copper4Cr)) is a fork of the original project [mkovatsc/Copper4Cr](https://github.com/mkovatsc/Copper4Cr), migrated to **Manifest V3** for compatibility with the latest versions of Chrome.

### Features

- **Resource Browsing** - Automatically discover and display available resources on CoAP servers
- **CoAP Requests** - Support for GET, POST, PUT, DELETE, FETCH, PATCH, iPATCH methods
- **Block Transfer** - Full support for CoAP Block 1/Block 2 chunked transfers
- **Observe Mode** - RFC 7641 Observe support for monitoring resource changes
- **IPv4/IPv6** - Support for both IPv4 and IPv6 networks
- **Message Logging** - Complete CoAP message send/receive logging
- **Profiles** - Save and manage multiple connection configurations

## Installation Guide

### Prerequisites

- Chrome browser version 128 or later
- Windows 10/11 x64 or Linux x64
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (build only; the published single-file host does not require a .NET runtime on the target machine)

### Installation Steps

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/mcuxmx/Copper4Cr.git
   cd Copper4Cr
   ```

2. **Prepare project files**

   Run from the repository root:
   ```cmd
   install.bat
   ```

   > This script links the `shared` directory so the extension can use the CoAP core libraries.

3. **Build and publish the Native Messaging UDP host**

   Run from the repository root for your target platform.

   Windows:
   ```cmd
   dotnet publish native_host\Copper4Cr.NativeHost\Copper4Cr.NativeHost.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
   ```

   Linux:
   ```bash
   dotnet publish native_host/Copper4Cr.NativeHost/Copper4Cr.NativeHost.csproj -c Release -r linux-x64 --self-contained true /p:PublishSingleFile=true
   ```

   Output goes to `native_host/Copper4Cr.NativeHost/bin/Release/net8.0/win-x64/publish/` or `.../linux-x64/publish/`. Do not move the host after installation. If you move it, run the install command again from its new location.

   > **Prebuilt package available**: precompiled archives are attached to the [Releases](https://github.com/mcuxmx/Copper4Cr/releases) page, so you can skip the build above: download the archive for your platform, extract it, and continue with the remaining steps. On Linux, make sure the extracted host is executable before installing:
   > ```bash
   > chmod +x Copper4Cr.NativeHost
   > ```
   > Place the extracted files wherever you prefer, adjust the paths in steps 5 and in the uninstall command accordingly, and do not move the host after running `--install`.

4. **Load the extension and copy its ID**

   1. Open `chrome://extensions/` in Chrome
   2. Enable **Developer mode** in the top right corner
   3. Click **Load unpacked** and select the project's `extension` directory
   4. Copy the 32-character extension ID from the Copper extension card

5. **Install the Native Messaging host**

   Run the command for your platform from the repository root, replacing `<extension-id>` with the copied ID.

   Windows:
   ```cmd
   native_host\Copper4Cr.NativeHost\bin\Release\net8.0\win-x64\publish\Copper4Cr.NativeHost.exe --install <extension-id>
   ```

   Linux:
   ```bash
   native_host/Copper4Cr.NativeHost/bin/Release/net8.0/linux-x64/publish/Copper4Cr.NativeHost --install <extension-id>
   ```

   On Windows, the installer creates `com.copper4cr.udp.json` next to the exe and writes `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.copper4cr.udp` for the current user. On Linux, it marks the host executable and writes the manifest to `~/.config/google-chrome/NativeMessagingHosts/` and `~/.config/chromium/NativeMessagingHosts/` (honoring `XDG_CONFIG_HOME`). Administrator/root privileges are not required on either platform. Because `allowed_origins` is restricted to the specified extension ID, reinstall the host whenever that ID changes.

6. **Reload the extension and start using Copper**

   Reload Copper at `chrome://extensions/`, then click the **Cu** icon in Chrome's toolbar. Enter a CoAP server address (e.g., `coap://californium.eclipseprojects.io/`) to begin debugging. Chrome starts the host automatically when UDP is bound, and the host exits when the extension page closes. No background service or local WebSocket port is required.

### Uninstall the Native Messaging Host

Run the command for your platform from the repository root.

Windows:
```cmd
native_host\Copper4Cr.NativeHost\bin\Release\net8.0\win-x64\publish\Copper4Cr.NativeHost.exe --uninstall
```

Linux:
```bash
native_host/Copper4Cr.NativeHost/bin/Release/net8.0/linux-x64/publish/Copper4Cr.NativeHost --uninstall
```

This removes the generated host manifests and, on Windows, the current-user registry entry. It does not delete the extension or the host executable.

### Legacy Chrome Compatibility

For Chrome versions before 128, see the Manifest V2 version in the `app/` directory (requires installing both the Extension and the Chrome App).

## Project Structure

```
Copper4Cr/
├── extension/          # Chrome Extension (Manifest V3, recommended)
│   ├── manifest.json
│   ├── background.js
│   ├── index.html
│   ├── Session.js
│   ├── css/             # Stylesheets
│   ├── endpoint/        # Endpoint communication layer
│   ├── gui/             # GUI adapters
│   ├── skin/            # Icons and skins
│   ├── utils/           # Utility classes
│   └── coap_server/     # CoAP server (integrated from app/endpoint)
├── app/                # Chrome App (Manifest V2, deprecated)
│   ├── manifest.json
│   ├── background.js
│   └── endpoint/        # Original CoAP server implementation
├── shared/              # Shared core libraries
│   ├── coap/            # CoAP protocol implementation
│   ├── endpoint/        # Port abstraction
│   ├── events/          # Event system
│   ├── logging/         # Logging system
│   └── utils/           # Common utilities
├── native_host/         # Native Messaging local host
│   └── Copper4Cr.NativeHost/
│       ├── Copper4Cr.NativeHost.csproj
│       ├── Program.cs           # Framing and install/uninstall
│       └── UdpSocketHost.cs     # IPv4/IPv6 UDP transport
├── install.bat          # Windows installation script
├── install.sh           # Linux/macOS installation script
├── README.md            # English README (default)
└── README.zh-CN.md      # Chinese README
```

## Architecture

### Manifest V3 Architecture (Current Version)

```
Extension UI Page
  ClientEndpoint ↔ ServerEndpoint
         ↕
  Copper.LocalPort
         ↕
  TransmissionHandler → UdpClientChrome
         │ chrome.runtime.connectNative("com.copper4cr.udp")
         │ Length-prefixed JSON frames with base64 datagrams
         ▼
Copper4Cr.NativeHost.exe
         │ IPv4 / IPv6 UDP
         ▼
CoAP Server
```

The extension page sends `bind`, `send`, and `close` requests directly through Native Messaging. The host returns `bound`, `sent`, `receive`, and error messages. Request IDs correlate asynchronous responses. The host binds ephemeral IPv4 and IPv6 ports independently and works when at least one address family is available. Standard output carries protocol frames only; logs go to standard error.

### Manifest V2 Legacy Architecture (Reference Only)

```
┌─────────────────┐    chrome.runtime.connect()    ┌──────────────────┐
│   Extension UI   │ ◄──────────────────────────►  │    Chrome App     │
└─────────────────┘                                └────────┬─────────┘
                                                           │
                                                    chrome.sockets.udp
                                                           │
                                                          CoAP Server
```

## Development

### Debugging

1. Open `chrome://extensions/` and find the Copper extension
2. Click the **Inspect views** link next to the Service Worker to view background logs
3. Press F12 on the extension page to inspect UDP connections, CoAP messages, and host disconnect errors in DevTools

### Native Messaging Troubleshooting

- **`Specified native messaging host not found`**: Confirm that `--install` was run with the current 32-character extension ID, the generated `com.copper4cr.udp.json` exists, and its `path` points to the actual exe.
- **The host origin is not allowed or the extension ID changed**: Run `--install <extension-id>` again and reload the extension. Do not reuse a manifest containing the old extension ID.
- **The host still cannot connect after installation**: On Windows, check that the default value of `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.copper4cr.udp` points to the generated manifest. On Linux, verify that `~/.config/google-chrome/NativeMessagingHosts/com.copper4cr.udp.json` (or the Chromium path) exists and that the host file is executable (`ls -l`). Reinstall after moving the host.
- **Only one address family is available**: The bind response includes the partial error. Copper works when either IPv4 or IPv6 succeeds. Check that the destination uses an available address family; IPv6 addresses must use the `[::1]` form.
- **Inspect errors**: Close and reopen the Copper page to restart the host, then check the extension page's DevTools console for bind, send, and disconnect errors.

### Testing

The project includes QUnit-based unit tests:

- `extension/testing/index.html` - Extension functionality tests
- `shared/testing/index.html` - Shared library tests

Open these HTML files directly in Chrome to run the tests.

## License

This project is open-source under the BSD License. See the [LICENSE](LICENSE) file for details.

Original project copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.

## Related Links

- [RFC 7252 - The Constrained Application Protocol (CoAP)](http://tools.ietf.org/html/rfc7252)
- [RFC 7641 - Observing Resources in the CoAP](https://tools.ietf.org/html/rfc7641)
- [Copper (ETH Zurich)](https://github.com/mkovatsc/Copper)
- [Copper4Cr (upstream)](https://github.com/mkovatsc/Copper4Cr)
- [Copper4Cr (this fork)](https://github.com/mcuxmx/Copper4Cr)
