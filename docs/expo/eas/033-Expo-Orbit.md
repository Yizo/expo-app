# 033｜Expo Orbit：桌面端启动器

**翻页：**[上一页：从 Expo GitHub App 触发 EAS Build](./032-EAS-Build-GitHub-App.md) · [目录](./README.md) · [下一页：App 凭据](./034-App-credentials.md)

**官方页面：**[Expo Orbit](https://docs.expo.dev/build/orbit/)

**版本边界：**Orbit 是桌面工具与 EAS 服务功能，页面没有按 Expo SDK 版本区分的 JavaScript API。本文按官方当前页总结；项目使用 SDK 56 时，仍应把本地 Android/iOS 工具链与 [SDK 56 参考](https://docs.expo.dev/versions/v56.0.0/)对照。下文命令仅作文档示例，未在本机安装 Orbit。

## Orbit 解决什么问题

Expo Orbit 是 macOS、Windows、Linux 桌面应用，帮助开发者发现设备/模拟器，并把 EAS 云端构建、EAS Update 或本地应用交给目标设备打开。过去常见流程是从终端选择 build、下载归档，再手动拖入模拟器；运行 Snack 还要在虚拟设备安装 Expo Go、登录并选择项目。Orbit 把这些步骤集中到桌面菜单。

Orbit 是便于安装和启动的工具，不负责替代 EAS Build 的编译，也不会把 OTA 更新变成新的原生二进制。

## 主要使用场景

- **模拟器管理：**查看并启动模拟器；Android 模拟器可选择无音频运行。
- **安装 EAS Build：**从 EAS 项目选择构建，在模拟器或已连接真机上安装/打开。
- **应用 EAS Update：**在 Android Emulator 或 iOS Simulator 中选取并打开更新。
- **打开 Snack：**把 Expo Snack 项目快速交给模拟器运行。
- **安装本地构建：**可从 Finder 打开或拖入文件；Android 接受 `.apk`，iOS 接受适用于 Simulator 的 `.app`，以及 ad hoc 签名的应用包。
- **查看置顶项目：**从 EAS Dashboard 项目列表快速打开项目最近的 build。

注意：iOS Simulator 的 `.app` 与给 iPhone 安装的归档不是同一种目标文件；真机分发还需要适当的签名和分发配置。

## 安装前置条件

Orbit 依赖 Android SDK，所有桌面系统都需要安装 Android Studio / SDK。macOS 上，设备管理还依赖 Xcode 提供的 `xcrun` 命令。安装 Orbit 本身不等于安装这些原生开发工具。

## 各系统安装方式

### macOS

官方提供 Homebrew 安装方式，也可以从官方 GitHub Releases 下载。Homebrew 命令：

```sh
brew install expo-orbit
```

如希望登录系统后自动启动，可在菜单栏 Orbit 图标的 Settings 中开启 Launch on Login。

### Windows

从 Expo Orbit 官方 GitHub Releases 下载 Windows 安装包。

### Linux

从同一 Releases 页面下载 `.deb`（Debian/Ubuntu）或 `.rpm`（Fedora/RHEL）包。选择格式时按所用发行版的软件包管理方式操作。

## 关键名词

- **模拟器 / Emulator / Simulator：**分别是 Android 和 Apple 平台用于在电脑上运行应用的虚拟设备。
- **Snack：**Expo 的在线示例运行环境，可直接体验 React Native / Expo 代码。
- **EAS Build：**远端编译并签名原生应用的服务；得到的 binary 才能安装到设备或提交应用商店。
- **EAS Update：**向已经安装且原生运行时兼容的应用发布 JavaScript 与静态资源更新。
- **ad hoc 签名：**面向指定 iOS 测试设备的签名分发方式；不等同于 App Store 发布。

## 官方代码主题覆盖

本页只有一个终端安装命令主题：macOS 通过 Homebrew 安装 `expo-orbit`，文中保留了等价命令。Windows / Linux 的官方下载入口和 Linux `.deb` / `.rpm` 格式已说明；原页面没有相应终端代码块。

## 下一页

页脚 **Next** 转入 [App credentials](https://docs.expo.dev/app-signing/app-credentials/)，解释发布 Android / iOS 应用所需的签名凭据。

**翻页：**[上一页：从 Expo GitHub App 触发 EAS Build](./032-EAS-Build-GitHub-App.md) · [返回目录](./README.md) · [下一页：App 凭据](./034-App-credentials.md)
