# 049｜用 EAS Build 生成 Android APK

**翻页：**[上一页：在 Monorepo 中配置 EAS Build](./048-EAS-Build-Monorepo.md) · [目录](./README.md) · [下一页：Build for iOS Simulators](./050-iOS-Simulators.md)

**官方页面：**[Build APKs for Android Emulators and devices](https://docs.expo.dev/build-reference/apk/)

**版本边界：**本页按 EAS Build 官方当前 Android 输出格式整理。安卓 profile 中的 Gradle command 是原生构建设置；SDK 54 起可用 assembleDebugOptimized，本地 SDK 56 在该范围内。本文只记录 EAS build / install 示例，没有运行构建或安装。

## AAB 与 APK

EAS Build 默认 Android 输出是 AAB（Android App Bundle），优化用于 Google Play Store 分发，但不能直接通过 Android Emulator 或手机点击安装。要在设备上直接安装，使用 APK（Android Package）。

## 在 eas.json 选择 APK 输出

在 build profile 中，可用以下方式之一要求 EAS 产出 APK：

1. developmentClient: true，生成 development build。
2. distribution: "internal"，用于内部安装分发。
3. android.buildType: "apk"。
4. android.gradleCommand 选择可产出 APK 的 Gradle 命令，例如 :app:assembleRelease、:app:assembleDebug；:app:assembleDebugOptimized 从 SDK 54 起提供。

配置示例并列出不同 profile 形式：

```json
{
  "build": {
    "preview-apk": {
      "android": {
        "buildType": "apk"
      }
    },
    "release-apk": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "debug-client": {
      "developmentClient": true
    },
    "internal": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

profile 名称由项目自行决定。要运行某个 profile 的 Android build：

```sh
eas build -p android --profile preview-apk
```

## 安装到 Android Emulator

若 Android Emulator 已启动，EAS CLI 在 build 完成后会询问是否立即下载 / 安装；选 Y 即可直接安装。

若项目有多个构建，也可以查看选择列表：

```sh
eas build:run -p android
```

列表包含 build ID、创建时间、build number、app version 和对应的 Git commit 信息，也会列出无效构建。安装成功后应用出现在模拟器桌面。若产物是 development build，再启动 Metro：

```sh
npx expo start
```

只需当前最新构建时，带 --latest 可跳过选择过程：

```sh
eas build:run -p android --latest
```

## 安装到 Android 真机

可以在 EAS build details 中复制 APK 地址，发给设备后用浏览器打开并安装。另一种方法是先安装 Android Debug Bridge、连接并开启设备的 USB debugging，然后通过 adb 安装：

```sh
adb install path/to/the/file.apk
```

设备可能要求允许该来源安装未知应用；这与 APK 是否正确构建无关。

## 关键名词

- **AAB：**面向商店分发的 Android App Bundle，不能直接作为普通安装包在手机上安装。
- **APK：**可直接安装到 Emulator 或 Android 真机的 Android Package。
- **Internal distribution：**用于让团队直接安装和测试，不必先发布 Google Play。
- **Gradle command：**原生 Android 构建命令；选项必须与希望得到的 APK / AAB 产物一致。
- **ADB：**Android Debug Bridge，开发电脑与 Android 设备之间的命令行连接工具。

## 官方代码主题覆盖

源页所有代码 / 配置主题均有重写示例：通过 developmentClient、distribution internal、android.buildType 或 Gradle command 生成 APK；用 eas build profile 构建；CLI 确认后自动装模拟器；eas build:run 选择指定历史构建或 --latest；development build 配合 npx expo start；真机通过 APK URL 安装或 adb install。

## 下一页

官方页脚 **Next** 是 [Build for iOS Simulators](https://docs.expo.dev/build-reference/simulators/)，介绍如何构建无需 Apple Developer 账号的 iOS 模拟器版本。

**翻页：**[上一页：在 Monorepo 中配置 EAS Build](./048-EAS-Build-Monorepo.md) · [返回目录](./README.md) · [下一页：Build for iOS Simulators](./050-iOS-Simulators.md)
