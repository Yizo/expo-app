# 本地 HTTPS 开发指南

> 原文地址：https://docs.expo.dev/guides/local-https-development/

---

## 什么是本地 HTTPS 开发？

在使用 Expo 构建 **Web 应用程序**时，你可能需要在本地（即你自己的电脑上）进行测试。默认情况下，Expo 的开发服务器使用 `http://localhost` 来运行应用，这是一种 **非加密** 的连接方式。

然而，现代浏览器的许多 **安全敏感 API**（例如：地理位置定位 Geolocation、摄像头/麦克风访问、Service Worker、HTTP-Only Cookie 等）只能在 **安全上下文（Secure Context）** 中使用。所谓安全上下文，指的是通过 **HTTPS**（加密连接）访问的页面，或者是 `localhost`（浏览器对 localhost 有特殊豁免，但并非所有功能都适用）。

**本指南的目标**：教你如何在本地开发环境中配置 HTTPS，使你的 Expo Web 应用能够通过 `https://localhost` 访问，从而测试那些需要安全上下文的浏览器功能。

### 关键术语解释

| 术语 | 解释 |
|---|---|
| **HTTPS** | 超文本传输安全协议（HyperText Transfer Protocol Secure），是 HTTP 的加密版本，通过 TLS/SSL 对通信数据进行加密 |
| **安全上下文（Secure Context）** | 浏览器的一种安全机制，要求某些敏感 API 只能在加密的页面中调用，防止中间人攻击窃取数据 |
| **TLS/SSL 证书** | 一种数字证书，用于验证服务器身份并建立加密连接。生产环境中通常由受信任的证书颁发机构（CA）签发 |
| **mkcert** | 一个开源工具，可以在本地生成受信任的开发用 TLS 证书，无需复杂配置 |
| **local-ssl-proxy** | 一个代理工具，可以将 HTTPS 流量（端口 443）转发到本地的开发服务器（如端口 8081） |
| **端口（Port）** | 网络通信的入口编号。例如 HTTP 默认使用端口 80，HTTPS 默认使用端口 443 |
| **HTTP-Only Cookie** | 一种特殊的 Cookie，只能通过 HTTP/HTTPS 协议访问，JavaScript 无法读取，常用于安全身份验证 |
| **代理（Proxy）** | 一个中间服务器，接收客户端请求并转发到目标服务器，这里用于将 HTTPS 请求转发到 HTTP 开发服务器 |

---

## 前提条件

在开始之前，你需要安装 **mkcert** 工具。mkcert 用于在本地生成受信任的开发证书。

> **基于经验建议**：mkcert 的安装非常简单，支持 macOS、Linux 和 Windows。请访问其 [GitHub 官方仓库](https://github.com/FiloSottile/mkcert) 查看详细的安装步骤。在 macOS 上，你可以通过 Homebrew 安装：
> ```sh
> brew install mkcert
> ```

安装完成后，建议先运行一次以下命令来安装本地证书颁发机构（CA）：

```sh
mkcert -install
```

> **注意**：`mkcert -install` 会将一个本地 CA 根证书安装到你的系统信任存储中，这样由 mkcert 生成的证书才会被浏览器和操作系统信任。这一步只需执行一次。

---

## 使用本地 HTTPS 开发的优势

使用 HTTPS 进行本地开发有以下好处：

1. **团队配置统一**：所有团队成员使用相同的 HTTPS 开发配置，减少"在我电脑上能跑"的问题
2. **启用安全上下文功能**：可以测试需要安全上下文的浏览器 API，如 HTTP-Only Cookie、Service Worker、Web Crypto API 等
3. **模拟生产环境**：生产环境几乎都使用 HTTPS，本地使用 HTTPS 可以更接近真实的部署环境，提前发现潜在问题
4. **保持一致的 URL**：团队成员之间可以使用统一的 URL 进行分享和调试

> **基于文档内容推导**：如果你的项目不涉及任何需要安全上下文的浏览器 API，那么本地 HTTPS 开发并非必需。但作为最佳实践，建议尽早配置，以避免后期集成时出现意外问题。

---

## 分步操作指南

### 第一步：创建或进入项目

首先，创建一个新的 Expo 项目（如果你还没有项目的话），然后进入项目目录。根据你使用的包管理器选择对应的命令：

```sh
# npm
npx create-expo-app@latest example-app --template default@sdk-56
cd example-app

# yarn
yarn create expo-app example-app --template default@sdk-56
cd example-app

# pnpm
pnpm create expo-app example-app --template default@sdk-56
cd example-app

# bun
bun create expo example-app --template default@sdk-56
cd example-app
```

> **关键术语**：
> - **create-expo-app**：Expo 官方提供的项目脚手架工具，用于快速创建新项目
> - **--template default@sdk-56**：指定使用 SDK 56 版本的默认模板
> - **npx / yarn / pnpm / bun**：四种不同的 JavaScript 包管理器/运行器，选择你项目中正在使用的那个即可

如果你已经有一个现有的 Expo 项目，只需 `cd` 进入该项目目录即可。

### 第二步：启动开发服务器

在项目目录中，启动 Expo Web 开发服务器：

```sh
# npm
npx expo start --web

# yarn
yarn expo start --web

# pnpm
pnpm expo start --web

# bun
bun expo start --web
```

> **说明**：`--web` 参数告诉 Expo 启动 Web 版本的开发服务器。启动后，应用默认运行在 **端口 8081** 上。请保持此终端窗口运行，不要关闭它。

> **基于经验建议**：如果你发现端口 8081 被占用，Expo 会自动尝试使用下一个可用端口。注意观察终端输出中显示的实际端口号，后续配置代理时需要用到正确的端口。

### 第三步：生成本地 HTTPS 证书

打开一个 **新的终端窗口**（不要关闭正在运行开发服务器的终端），确保当前目录是项目的根目录，然后运行：

```sh
mkcert localhost
```

这条命令会在当前目录下生成两个文件：

| 文件名 | 说明 |
|---|---|
| `localhost.pem` | SSL 证书文件（公钥证书） |
| `localhost-key.pem` | SSL 私钥文件 |

> **注意**：这两个文件包含敏感的加密密钥，**不要将它们提交到版本控制系统（如 Git）中**。建议在 `.gitignore` 文件中添加以下内容：
> ```
> *.pem
> ```

> **提示**：如果你之前没有运行过 `mkcert -install`，请先执行该命令安装本地 CA，否则生成的证书不会被浏览器信任。

### 第四步：启动 HTTPS 代理服务器

在同一个终端中（或再打开一个新终端），使用 `local-ssl-proxy` 工具启动一个 HTTPS 代理，将加密流量从端口 443（HTTPS 默认端口）转发到端口 8081（Expo 开发服务器端口）：

```sh
# npm
npx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem

# yarn
yarn dlx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem

# pnpm
pnpm dlx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem

# bun
bunx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem
```

> **参数说明**：
> - `--source 443`：代理监听的源端口（HTTPS 标准端口）
> - `--target 8081`：转发到的目标端口（Expo 开发服务器端口）
> - `--cert localhost.pem`：指定之前生成的证书文件
> - `--key localhost-key.pem`：指定之前生成的私钥文件

> **工作原理**：`local-ssl-proxy` 会在本地创建一个 HTTPS 服务器，监听 443 端口。当你在浏览器中访问 `https://localhost` 时，请求会先到达这个代理服务器，代理将其解密后转发到 8081 端口的 Expo 开发服务器，开发服务器的响应再通过代理加密后返回给浏览器。

> **基于经验建议**：在 macOS 和 Linux 上，监听 443 端口（低于 1024 的端口）通常需要管理员权限。如果遇到权限错误，请在命令前加上 `sudo`：
> ```sh
> sudo npx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem
> ```

### 第五步：访问应用

代理服务器启动后，打开浏览器，访问：

```
https://localhost
```

你现在应该能看到你的 Expo Web 应用通过 HTTPS 加密连接正常运行。浏览器地址栏应显示一个锁形图标，表示连接是安全的。

---

## 完整工作流程总结

以下是完整的操作流程，你需要同时运行三个终端窗口：

| 终端 | 运行的命令 | 作用 |
|---|---|---|
| 终端 1 | `npx expo start --web` | 启动 Expo Web 开发服务器（端口 8081） |
| 终端 2 | `mkcert localhost`（只需执行一次） | 生成本地 HTTPS 证书 |
| 终端 3 | `npx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem` | 启动 HTTPS 代理（端口 443 → 8081） |

> **基于经验建议**：日常开发时，证书只需生成一次。每次启动开发环境只需要运行终端 1 和终端 3 的命令即可。你可以考虑将代理启动命令写入项目的 `package.json` scripts 中，简化操作：
> ```json
> {
>   "scripts": {
>     "start:web": "expo start --web",
>     "start:https": "local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem"
>   }
> }
> ```

---

## 常见问题排查

> **基于经验建议**：以下是配置过程中可能遇到的常见问题及解决方法：

### 浏览器显示证书不受信任

- 确保已运行 `mkcert -install` 安装本地 CA
- 安装 CA 后可能需要重启浏览器
- 检查证书文件是否在项目根目录下正确生成

### 端口 443 权限被拒绝

- 低于 1024 的端口通常需要管理员权限
- 使用 `sudo` 运行代理命令
- 或者使用高于 1024 的端口（如 8443），然后访问 `https://localhost:8443`

### 代理无法连接到开发服务器

- 确认 Expo 开发服务器正在运行（终端 1 没有关闭）
- 确认 `--target` 参数指定的端口与开发服务器实际运行的端口一致
- 检查是否有防火墙规则阻止了本地端口通信

### 页面加载但显示空白或错误

- 确保浏览器访问的是 `https://localhost` 而不是 `http://localhost`
- 清除浏览器缓存后重试
- 检查终端中是否有错误日志输出

---

## 局限性与注意事项

- 此方案 **仅适用于本地开发**，不应在生产环境中使用自签名证书
- `localhost.pem` 和 `localhost-key.pem` 文件包含敏感信息，**不应提交到版本控制系统**
- 每次更换开发机器都需要重新生成证书
- 此方案主要针对 Expo Web 应用的开发，对于原生 iOS/Android 应用开发通常不需要此配置

> **基于文档内容推导**：如果你的团队有多人协作需求，建议将 mkcert 的安装步骤和证书生成命令写入项目的 README 或开发环境搭建文档中，确保所有成员都能快速配置一致的开发环境。

---

## 文档导航

- **上一页**：[tailwind](./25__tailwind.md)
- **下一页**：[customizing metro](./27__customizing-metro.md)
