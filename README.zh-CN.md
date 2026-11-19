Copper for Chrome (Cu<sub>4</sub>Cr) CoAP user-agent
====================================================

<p align="right">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a>
</p>

实现了 [RFC7252](http://tools.ietf.org/html/rfc7252) 协议的 CoAP 调试工具

一个基于 Chrome 浏览器的 CoAP 用户代理，用于浏览和调试物联网设备
-------------------------------------------------------

## 项目简介

Copper (Cu) 是一个 CoAP (Constrained Application Protocol) 用户代理，可作为 Chrome 扩展安装使用。它提供了一个直观的图形界面，用于发现、浏览和管理物联网设备上的 CoAP 资源。

本仓库 ([mcuxmx/Copper4Cr](https://github.com/mcuxmx/Copper4Cr)) 是原项目 [mkovatsc/Copper4Cr](https://github.com/mkovatsc/Copper4Cr) 的分支，已迁移到 **Manifest V3**，兼容最新版本的 Chrome 浏览器。

### 主要功能

- **资源浏览** - 自动发现并展示 CoAP 服务器上的可用资源
- **CoAP 请求** - 支持 GET、POST、PUT、DELETE、FETCH、PATCH、iPATCH 等请求方法
- **块传输** - 支持 CoAP Block 1/Block 2 分块传输
- **观察模式** - 支持 RFC 7641 Observe 观察资源变化
- **IPv4/IPv6** - 同时支持 IPv4 和 IPv6 网络
- **消息日志** - 完整的 CoAP 消息收发日志记录
- **配置文件** - 保存和管理多套连接配置

## 安装指南

### 前置要求

- Chrome 浏览器 128 或更高版本
- Windows 10/11 x64 或 Linux x64
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)（仅构建宿主时需要，发布后的单文件宿主不依赖已安装的 .NET 运行时）

### 安装步骤

1. **克隆或下载仓库**
   ```bash
   git clone https://github.com/mcuxmx/Copper4Cr.git
   cd Copper4Cr
   ```

2. **准备项目文件**

   在仓库根目录执行：
   ```cmd
   install.bat
   ```

   > 该脚本会创建 `shared` 目录的链接，将 CoAP 核心库整合到扩展中。

3. **构建并发布 Native Messaging UDP 宿主**

   在仓库根目录按目标平台执行。

   Windows：
   ```cmd
   dotnet publish native_host\Copper4Cr.NativeHost\Copper4Cr.NativeHost.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
   ```

   Linux：
   ```bash
   dotnet publish native_host/Copper4Cr.NativeHost/Copper4Cr.NativeHost.csproj -c Release -r linux-x64 --self-contained true /p:PublishSingleFile=true
   ```

   宿主发布到 `native_host/Copper4Cr.NativeHost/bin/Release/net8.0/win-x64/publish/` 或 `.../linux-x64/publish/`。安装后不要移动宿主；如需移动，请在新位置重新执行安装命令。

   > **已提供预编译包**：预编译好的压缩包已放在 [Releases](https://github.com/mcuxmx/Copper4Cr/releases) 页面，可直接跳过上面的构建步骤：下载对应平台的压缩包并解压即可使用。Linux 下解压后需要先给宿主添加执行权限：
   > ```bash
   > chmod +x Copper4Cr.NativeHost
   > ```
   > 解压位置可自行选择，请相应调整第 5 步及卸载命令中的路径；执行 `--install` 后不要再移动宿主。

4. **加载扩展并复制扩展 ID**

   1. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
   2. 开启右上角的 **开发者模式**
   3. 点击 **加载已解压的扩展程序**，选择项目的 `extension` 目录
   4. 在 Copper 扩展卡片上复制 32 位扩展 ID

5. **安装 Native Messaging 宿主**

   在仓库根目录按平台执行以下命令，并将 `<扩展ID>` 替换为刚复制的 ID。

   Windows：
   ```cmd
   native_host\Copper4Cr.NativeHost\bin\Release\net8.0\win-x64\publish\Copper4Cr.NativeHost.exe --install <扩展ID>
   ```

   Linux：
   ```bash
   native_host/Copper4Cr.NativeHost/bin/Release/net8.0/linux-x64/publish/Copper4Cr.NativeHost --install <扩展ID>
   ```

   Windows 下安装命令会在 exe 同目录生成 `com.copper4cr.udp.json`，并写入当前用户注册表 `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.copper4cr.udp`。Linux 下会为宿主添加可执行权限，并将清单写入 `~/.config/google-chrome/NativeMessagingHosts/` 和 `~/.config/chromium/NativeMessagingHosts/`（遵循 `XDG_CONFIG_HOME`）。两个平台均无需管理员/root 权限。`allowed_origins` 仅允许指定的扩展 ID，因此扩展 ID 变化后必须重新安装。

6. **重新加载扩展并开始使用**

   在 `chrome://extensions/` 中重新加载 Copper，然后点击 Chrome 工具栏中的 **Cu** 图标。输入 CoAP 服务器地址（如 `coap://californium.eclipseprojects.io/`）开始调试。首次绑定 UDP 时 Chrome 会自动启动宿主，关闭扩展页面后宿主自动退出，无需常驻服务或本地 WebSocket 端口。

### 卸载 Native Messaging 宿主

在仓库根目录按平台执行。

Windows：
```cmd
native_host\Copper4Cr.NativeHost\bin\Release\net8.0\win-x64\publish\Copper4Cr.NativeHost.exe --uninstall
```

Linux：
```bash
native_host/Copper4Cr.NativeHost/bin/Release/net8.0/linux-x64/publish/Copper4Cr.NativeHost --uninstall
```

该命令会移除生成的宿主清单，Windows 下同时移除当前用户注册项，不会删除扩展或宿主可执行文件。

### 旧版 Chrome 兼容说明

如果使用 Chrome 128 之前的版本，可参考 `app/` 目录的 Manifest V2 版本（需要同时安装 Extension 和 Chrome App）。

## 项目结构

```
Copper4Cr/
├── extension/          # Chrome 扩展（Manifest V3，推荐）
│   ├── manifest.json
│   ├── background.js
│   ├── index.html
│   ├── Session.js
│   ├── css/             # 样式文件
│   ├── endpoint/        # 端点通信层
│   ├── gui/             # GUI 适配器
│   ├── skin/            # 图标和皮肤
│   ├── utils/           # 工具类
│   └── coap_server/     # CoAP 服务器端（从 app/endpoint 整合）
├── app/                # Chrome App（Manifest V2，已废弃）
│   ├── manifest.json
│   ├── background.js
│   └── endpoint/        # 原 CoAP 服务器端实现
├── shared/              # 共享核心库
│   ├── coap/            # CoAP 协议实现
│   ├── endpoint/        # 端口抽象
│   ├── events/          # 事件系统
│   ├── logging/         # 日志系统
│   └── utils/           # 通用工具
├── native_host/         # Native Messaging 本地宿主
│   └── Copper4Cr.NativeHost/
│       ├── Copper4Cr.NativeHost.csproj
│       ├── Program.cs           # 帧协议与安装/卸载
│       └── UdpSocketHost.cs     # IPv4/IPv6 UDP 收发
├── install.bat          # Windows 安装脚本
├── install.sh           # Linux/macOS 安装脚本
├── README.md            # 英文 README（默认）
└── README.zh-CN.md      # 中文 README
```

## 架构说明

### Manifest V3 架构（当前版本）

```
Extension UI Page
  ClientEndpoint ↔ ServerEndpoint
         ↕
  Copper.LocalPort
         ↕
  TransmissionHandler → UdpClientChrome
         │ chrome.runtime.connectNative("com.copper4cr.udp")
         │ 长度前缀 JSON 帧，数据报使用 base64
         ▼
Copper4Cr.NativeHost.exe
         │ IPv4 / IPv6 UDP
         ▼
CoAP Server
```

扩展页面直接通过 Native Messaging 发送 `bind`、`send`、`close` 请求，宿主返回 `bound`、`sent`、`receive` 和错误消息。请求 ID 用于关联异步响应；宿主分别绑定 IPv4 与 IPv6 临时端口，至少一个地址族成功即可工作。标准输出仅承载协议帧，日志仅写标准错误。

### Manifest V2 旧架构（仅供参考）

```
┌─────────────────┐    chrome.runtime.connect()    ┌──────────────────┐
│   Extension UI   │ ◄──────────────────────────►  │    Chrome App     │
└─────────────────┘                                └────────┬─────────┘
                                                           │
                                                    chrome.sockets.udp
                                                           │
                                                          CoAP Server
```

## 开发

### 调试

1. 打开 `chrome://extensions/`，找到 Copper 扩展
2. 点击 **服务工作进程** 旁的 **检查视图** 链接查看后台日志
3. 在扩展页面按 F12 打开 DevTools 查看 UDP 连接、CoAP 消息和宿主断连错误

### Native Messaging 故障排查

- **`Specified native messaging host not found`**：确认已使用当前扩展的 32 位 ID 执行 `--install`，并检查生成的 `com.copper4cr.udp.json` 是否存在、`path` 是否指向实际 exe。
- **宿主 origin 不被允许或扩展 ID 已变化**：重新执行 `--install <扩展ID>`，然后重新加载扩展。不要直接把旧 ID 的清单用于新扩展。
- **安装后仍无法连接**：Windows 下确认注册表项 `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.copper4cr.udp` 的默认值指向生成的清单；Linux 下确认 `~/.config/google-chrome/NativeMessagingHosts/com.copper4cr.udp.json`（或 Chromium 对应路径）存在，且宿主文件具有可执行权限（可用 `ls -l` 检查）。移动宿主后必须重新安装。
- **仅一个地址族可用**：绑定响应会包含部分错误信息；IPv4 或 IPv6 至少一个成功即可使用。检查目标地址是否使用可用的地址族，IPv6 地址需采用 `[::1]` 形式。
- **查看错误**：先关闭并重新打开 Copper 页面以重启宿主，再在扩展页面 DevTools 的控制台中查看绑定、发送和断连错误。

### 测试

项目包含基于 QUnit 的单元测试：

- `extension/testing/index.html` - 扩展功能测试
- `shared/testing/index.html` - 共享库测试

直接在 Chrome 中打开这些 HTML 文件即可运行测试。

## 许可证

本项目基于 BSD 许可证开源，详见 [LICENSE](LICENSE) 文件。

原始项目版权所有 (c) 2016, Institute for Pervasive Computing, ETH Zurich.

## 相关链接

- [RFC 7252 - The Constrained Application Protocol (CoAP)](http://tools.ietf.org/html/rfc7252)
- [RFC 7641 - Observing Resources in the CoAP](https://tools.ietf.org/html/rfc7641)
- [Copper (ETH Zurich)](https://github.com/mkovatsc/Copper)
- [Copper4Cr (upstream)](https://github.com/mkovatsc/Copper4Cr)
- [Copper4Cr (this fork)](https://github.com/mcuxmx/Copper4Cr)
