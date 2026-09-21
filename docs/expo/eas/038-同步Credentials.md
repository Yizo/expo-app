# 038｜同步 EAS 远端与本地凭据

**翻页：**[上一页：把已有签名凭据交给 EAS Build](./037-已有Credentials.md) · [目录](./README.md) · [下一页：凭据安全](./039-Credentials安全.md)

**官方页面：**[Sync credentials between remote and local sources](https://docs.expo.dev/app-signing/syncing-credentials/)

**版本边界：**本文记录 EAS CLI 的凭据下载 / 上传菜单，服务页面本身没有绑定 Expo SDK 版本。把签名文件复制到本地或上传云端都属于敏感操作；这里仅描述流程，没有实际读取或传输项目凭据。

## 从 EAS 下载到本地

如果凭据原由 EAS 自动管理，可以把它们下载到开发机器，让本地工具链构建或检查签名。进入项目根目录运行 eas credentials，选择平台，进入 credentials.json 的上传 / 下载选项，再选从 EAS 下载到 credentials.json。本操作可按 Android 与 iOS 分别执行。

```sh
eas credentials
```

Android 下载后，项目构建配置便可读取 credentials.json 引用的 keystore。iOS 还需在 macOS 上完成两项原生步骤：

1. 将 distribution certificate 导入 macOS Keychain。
2. 打开项目 Xcode 的 Signing & Capabilities，将 provisioning profile 导入并选到相应 target。

只下载文件并不代表 Xcode 已经安装或使用证书。

## 从本地上传到 EAS

如果当前采用 local credentials，之后也可将 credentials.json 中的签名材料上传到 Expo 服务器，切换为自动管理。仍使用同一 CLI 凭据菜单，在目标平台选择上传 credentials.json 值到 EAS 的选项：

```sh
eas credentials
```

如有多个目标平台，需要针对每个平台执行对应的菜单操作。上传前核对当前 Expo project 和 App ID，避免把密钥关联到错误项目。

## 关键名词

- **本地 / Local：**凭据保存在开发机或 CI 的安全文件路径中。
- **远端 / Remote：**凭据由 EAS 项目托管；具备权限的成员可使用云端凭据构建。
- **Keychain：**macOS 系统凭据库，Xcode / 签名工具在本机读取安装的证书。
- **Signing & Capabilities：**Xcode 项目 target 的签名与 Apple capability 配置界面。
- **同步方向：**下载是 remote → local；上传是 local → remote。两者都传输敏感签名材料。

## 官方代码主题覆盖

源页没有独立代码块；其完整命令主题是用 eas credentials 进入 credentials.json 上传 / 下载菜单。Android 下载即可让构建读取本地 JSON，iOS 还需 Keychain 与 Xcode Signing & Capabilities 的手动配置，已分别说明。

## 下一页

官方页脚 **Next** 是 [Security](https://docs.expo.dev/app-signing/security/)，继续介绍 Expo 如何存储、传输与保护签名凭据。

**翻页：**[上一页：把已有签名凭据交给 EAS Build](./037-已有Credentials.md) · [返回目录](./README.md) · [下一页：凭据安全](./039-Credentials安全.md)
