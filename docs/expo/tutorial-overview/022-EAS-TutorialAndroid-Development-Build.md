# 022｜EAS Tutorial：构建 Android Development Build

**翻页：**[上一页：配置云端 Development Build](./021-EAS-Tutorial配置Development-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：构建 iOS Simulator](./023-EAS-TutorialiOS-Simulator-Build.md)

**官方页面：**[Create and run a cloud build for Android](https://docs.expo.dev/tutorial/eas/android-development-build/)

**版本边界：**本页是云端构建的服务操作指南。示例以 eas.json 的 development profile 为前提；当前项目 Expo SDK56，应使用其对应原生依赖。此处只记录构建和安装流程，没有提交 EAS Build。

## Development build 输出 APK

默认 Android store build 通常使用 Android App Bundle（AAB），交给商店按设备拆分；直接安装到手机或 emulator 的 Development Build 则需要 APK。先确认 eas.json 的 development profile 中 developmentClient 已启用，再执行：

```sh
eas build --platform android --profile development
# 短参数等价形式
eas build -p android --profile development
```

首次构建时，CLI 会询问 Android application ID（也叫 package name），以及是否生成 Android keystore。Application ID 通常采用反向域名形式，例如 org.example.stickersmash，各段用小写字母；keystore 是用于签名 app 的私钥文件。没有已有签名凭据时，可按教程选择生成新 keystore。

命令会把项目交给 EAS 构建并返回 Dashboard 链接。build details 展示 profile、Expo SDK、app version、versionCode、最近 commit 信息和发起者；完成后可下载 APK，查看对应构建日志。

## 安装到 Android 手机

EAS Dashboard 的 Build artifact 提供安装方式：

- **Expo Orbit**：手机通过 USB 连接本机；在 Orbit 中选设备，再从 Dashboard 选择 Open with Orbit，安装后可由 Orbit 启动。
- **Install + QR code**：从 artifact 页面生成二维码，手机扫描网页链接并下载 APK，再打开安装包。

如果 Android 系统显示安全确认，确认来源是刚由自己的 EAS 项目生成的 APK 后再继续安装。团队真实设备还要确认 Android 版本、application ID 和签名来源符合项目配置。

## 安装到 Android Emulator

有 Android Emulator 运行时，EAS CLI 在 build 完成后会询问是否把它安装并运行到 emulator，可选择继续；也能从 Dashboard 用 Expo Orbit 安装 artifact。

安装完成后，在 app 项目目录重新启动 Metro，按 A 打开已安装 development build：

```sh
npx expo start
yarn expo start
pnpm expo start
bun expo start
```

Android device 和 emulator 的构建过程一致，差别主要在产物安装路径。安装成功后 app 通过 Metro 载入 JS / assets。

## 关键名词

- **APK**：可安装到 Android device / emulator 的 app package；Development Build 使用它。
- **AAB**：主要用于 Google Play 发布，不能像 APK 一样直接在设备上安装。
- **Application ID / package name**：Android 唯一 app 标识，常用反向域名字符串。
- **Keystore**：Android 签名密钥库；EAS 可生成并安全管理，也可复用已有凭据。
- **Build artifact**：云端 build 完成后提供的二进制下载文件及关联日志 / 元信息。

## 官方代码主题覆盖

源页的所有代码 / 操作主题均已改写：developmentClient 前置项、EAS Android development build 命令及 -p 等价参数、application ID / keystore 首次提示、EAS build details 信息、APK 下载 / QR 安装路径、Orbit 的 USB 安装和 emulator 方式、CLI 自动运行选项，以及 Expo start 的 npm / Yarn / pnpm / Bun 替代命令。没有启动云端构建或安装 APK。

## 下一页

页脚 **Next** 指向 [Create and run a cloud build for iOS Simulator](https://docs.expo.dev/tutorial/eas/ios-development-build-for-simulators/)，配置 simulator 专用 eas.json profile 并安装 iOS .app。

**翻页：**[上一页：配置云端 Development Build](./021-EAS-Tutorial配置Development-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：构建 iOS Simulator](./023-EAS-TutorialiOS-Simulator-Build.md)
