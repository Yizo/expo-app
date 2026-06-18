# 代理问题排查（Troubleshooting Proxies）

> 原文地址：[https://docs.expo.dev/troubleshooting/proxies/](https://docs.expo.dev/troubleshooting/proxies/)

---

本文档介绍在企业代理（Corporate Proxy）网络环境下使用 Expo 开发时，如何配置 macOS 系统、Charles 代理工具、iOS 模拟器以及终端工具的代理设置，以解决常见的网络连接问题。

---

## 背景说明

在企业或公司网络中，通常需要配置代理服务器才能访问外网资源。Expo 开发涉及多个组件（iOS 模拟器、终端工具、npm 等），每个组件都需要正确配置代理才能正常工作。本文以 macOS Sierra 系统为例，介绍完整的代理配置流程。

> **基于文档内容推导**：如果你的开发环境不在企业代理网络中，本文大部分内容不需要操作。仅当你遇到网络访问被代理阻断的情况时才需要参考。

---

## 一、macOS 系统网络代理设置

### 1.1 打开网络设置

1. 点击左上角 **Apple 菜单**，打开 **系统偏好设置（System Preferences）**。
2. 进入 **网络（Network）** 面板。
3. 确认 **位置（Location）** 选项指向你的代理网络配置，而不是默认的"自动（Automatic）"。
4. 选择 **Wi-Fi** 或以太网连接，点击右下角的 **高级...（Advanced...）** 按钮。

### 1.2 配置代理地址

1. 如果当前启用了自动代理配置，先将其**关闭**。
2. **启用 HTTP 网页代理**，服务器地址填写 `127.0.0.1`，端口填写 `8888`。
3. **启用 HTTPS 安全网页代理**，服务器地址同样填写 `127.0.0.1`，端口填写 `8888`。

> **说明**：这里将系统代理指向本地的 `127.0.0.1:8888`，是因为我们将使用 Charles 等本地代理管理工具来中转所有网络请求。Charles 会监听 8888 端口，再将请求转发到企业代理服务器。

> **基于经验建议**：如果你修改了 Charles 的默认监听端口（不是 8888），请确保此处的端口号与 Charles 的配置一致。

### 1.3 恢复自动网络配置

如果出现错误需要恢复到自动网络配置，可以使用位于 `your-corporate-proxy-uri:port-number/proxy.pac` 的配置文件。

---

## 二、配置 Charles 代理工具

[Charles](https://www.charlesproxy.com/) 是一款常用的本地代理管理工具，适合在企业无线网络环境下为 iOS 模拟器提供代理服务。

### 2.1 基本配置步骤

1. **启动** Charles 应用程序。
2. 如果弹出提示询问是否让 Charles 自动管理网络设置，选择**拒绝（Decline）**——因为你已经在系统偏好设置中手动配置过了。如果你修改了默认的 8888 端口，请在系统网络设置中同步调整。
3. 进入菜单 **Proxy > External Proxy Settings**，启用外部代理服务器（External Servers）。
4. **启用 HTTP 选项**，输入你的企业代理 URI 和端口号。
5. **启用密码验证选项（Requires password）**。
6. 填写你的域名（Domain）、用户名（Username）和密码（Password）。
7. 对 **HTTPS** 重复上述完全相同的操作，确保使用相同的凭据和地址。

### 2.2 配置绕过列表（Bypass Hosts）

在绕过列表文本区域中，输入以下内容：

```text
localhost
*.local
```

> **说明**：`localhost` 和 `*.local` 表示本地地址不经过企业代理，直接访问。这是为了避免本地开发服务器（如 Expo 开发服务器）的请求被错误地发送到企业代理。

> **基于经验建议**：如果你的公司有其他内部服务器地址（如邮件服务器、内部 Wiki 等），也需要添加到绕过列表中。

### 2.3 启用本地代理绕过

勾选 **始终对 localhost 绕过外部代理（Always bypass external proxies for localhost）** 选项。

---

## 三、iOS 模拟器配置

### 3.1 重置模拟器（如需）

如果自定义的模拟器配置出现问题，可以通过菜单重置其内容和设置（Reset Content and Settings）。

在操作前，请先**关闭正在运行的模拟器**。

### 3.2 安装 Charles 根证书

1. 在 Charles 中，通过 **Help** 菜单安装其根证书（Root Certificate）。
2. 然后再为 **iOS 模拟器** 专门安装该证书。

> **技术说明**：这一步是必须的，因为模拟器会收到一个无效的证书而不是真实证书，这会导致无法访问 `https://exp.host/`——而这是 Expo 运行所必需的服务地址。

> **基于文档内容推导**：如果不安装 Charles 根证书，模拟器中的 HTTPS 请求会被系统视为不安全而拒绝连接，导致 Expo 无法正常工作。

### 3.3 其他应用的代理配置

对于依赖网络的应用（如 Spotify），需要将其代理设置为 `http://localhost:8888`。

Chrome 和 Firefox 等浏览器可以使用系统偏好设置中的代理配置，它们会根据你在 Apple 菜单中选择的网络位置来决定是通过 Charles 代理还是绕过代理：
- 选择 **自动（Automatic）**：不使用代理
- 选择 **代理网络**：通过 Charles 转发

---

## 四、终端应用代理配置

npm、git、Brew、Curl 等终端工具也需要单独配置代理。

### 4.1 npm 代理配置

编辑 `~/.npmrc` 文件，添加以下内容：

```ini
http_proxy=http://localhost:8888
https_proxy=http://localhost:8888
```

> **说明**：这会让 npm 的所有网络请求（如 `npm install`）都通过本地的 Charles 代理转发。

### 4.2 git 代理配置

编辑 `~/.gitconfig` 文件，添加以下内容：

```ini
[http]
  proxy = http://localhost:8888
[https]
  proxy = http://localhost:8888
```

> **说明**：这会让 git 的所有网络操作（如 `git clone`、`git pull`、`git push`）都通过代理进行。

### 4.3 通用终端代理配置

根据你的 Shell 类型，编辑对应的配置文件：

| Shell 类型 | 配置文件路径 |
|-----------|------------|
| Bash（Linux 常见） | `~/.bashrc` |
| Bash（macOS 常见） | `~/.bash_profile` |
| Zsh（macOS 默认） | `~/.zshrc` |

在对应文件中添加以下内容：

```bash
export HTTP_PROXY="http://localhost:8888"
export http_proxy="http://localhost:8888"
export ALL_PROXY="http://localhost:8888"
export all_proxy="http://localhost:8888"
export HTTPS_PROXY="http://localhost:8888"
export https_proxy="http://localhost:8888"
```

> **说明**：
> - 同时设置大写和小写的环境变量（如 `HTTP_PROXY` 和 `http_proxy`），是因为不同的终端工具读取的变量名不同——有些只读大写，有些只读小写。
> - `ALL_PROXY` 是一个通用代理变量，部分工具（如 curl）会优先读取它。
> - 修改配置文件后，需要重新打开终端或执行 `source ~/.zshrc`（以 Zsh 为例）使配置生效。

### 4.4 临时关闭代理

> **注意**：如果你将网络位置切换回"自动（Automatic）"以取消代理，需要在上述配置文件中用 `#` 号注释掉相关行。例如：

```bash
# export HTTP_PROXY="http://localhost:8888"
# export http_proxy="http://localhost:8888"
# export ALL_PROXY="http://localhost:8888"
# export all_proxy="http://localhost:8888"
# export HTTPS_PROXY="http://localhost:8888"
# export https_proxy="http://localhost:8888"
```

> **基于经验建议**：频繁切换代理配置时，可以考虑使用终端代理管理工具（如 [proxychains-ng](https://github.com/rofl0r/proxychains-ng) 或 Shell 函数）来快速开启/关闭代理，避免反复手动编辑配置文件。

---

## 配置流程总结

```
企业代理服务器
      ↑
   Charles（本地代理管理工具，监听 127.0.0.1:8888）
      ↑
   macOS 系统代理 → 指向 127.0.0.1:8888
      ↑
   iOS 模拟器 / 浏览器（使用系统代理）
   
   npm / git / 终端工具 → 通过环境变量或配置文件 → 指向 127.0.0.1:8888
```

整个流程的核心思路是：所有网络请求先汇聚到本地的 Charles 代理，再由 Charles 统一转发到企业代理服务器。Charles 负责处理证书验证、身份认证等复杂逻辑。

---

## 常见问题

> **基于文档内容推导**

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| Expo 无法连接 `exp.host` | iOS 模拟器未安装 Charles 根证书 | 通过 Charles Help 菜单安装证书 |
| npm install 超时 | 终端未配置代理环境变量 | 在 `~/.npmrc` 或 Shell 配置文件中添加代理 |
| git clone 失败 | git 未配置代理 | 在 `~/.gitconfig` 中添加代理配置 |
| 本地开发服务器无法访问 | 绕过列表未包含 localhost | 在 Charles Bypass Hosts 中添加 `localhost` 和 `*.local` |

---

## 文档导航

- **上一页**：[react native version mismatch](./169__react-native-version-mismatch.md)
- **下一页**：[data and privacy protection](./171__data-and-privacy-protection.md)
