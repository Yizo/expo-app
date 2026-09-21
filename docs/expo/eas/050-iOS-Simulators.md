# 050｜用 EAS Build 构建 iOS Simulator App

**翻页：**[上一页：用 EAS Build 生成 Android APK](./049-Android-APKs.md) · [目录](./README.md) · [下一页：App Version Management](./051-App-Version-Management.md)

**官方页面：**[Build for iOS Simulators](https://docs.expo.dev/build-reference/simulators/)

**版本边界：**本页介绍 EAS Build 的 iOS simulator profile，与 App Store 真机发行流程不同。EAS server image、Xcode / Simulator 版本会变化；当前 SDK 56 项目需使用匹配 SDK56 的构建环境。本文只记录示例配置，没有申请 Apple Developer 权限或触发 EAS Build。

## 为什么单独构建 Simulator 版本

iOS Simulator build 是一个独立于 Expo Go 的原生 App，可以装在本机 iOS Simulator 调试。它不需要 TestFlight 或 Apple Developer Program 账号；但不能直接安装到 iPhone，也不是提交 App Store 的 IPA。

## 设置 Build Profile

在 eas.json 的目标 build profile 中设置 ios.simulator 为 true：

```json
{
  "build": {
    "preview-simulator": {
      "ios": {
        "simulator": true
      }
    },
    "production": {}
  }
}
```

Profile 可使用任何有意义的名字。此处用 EAS CLI 创建 iOS simulator build：

```sh
eas build -p ios --profile preview-simulator
```

## 安装到 iOS Simulator

构建成功后 EAS CLI 会询问是否下载并自动安装；选 Y 后目标 app 安装到已运行的 Simulator。

有多个 build 时，使用 EAS CLI 选择想安装的构建：

```sh
eas build:run -p ios
```

列表展示 build ID、创建时间、build number、version number 和对应 Git commit，也会列出无效构建。安装完成后 app 出现在 Simulator 主屏幕。development build 还需单独启动 Metro：

```sh
npx expo start
```

只安装最新构建可加 --latest：

```sh
eas build:run -p ios --latest
```

## 关键名词

- **iOS Simulator build：**为 macOS 上 Xcode / iOS Simulator 编译的 App，不是给 iPhone 的 device binary。
- **Development build：**可装项目所需原生库、用于开发的自定义客户端。
- **Profile：**eas.json 中保存某类构建配置的命名条目。
- **Build detail：**EAS Dashboard 中对应 build 的产物、状态、日志和版本信息页面。

## 官方代码主题覆盖

源页的代码主题均有示例：eas.json 中 ios.simulator: true；用 eas build -p ios --profile profile 构建；CLI 提示自动下载 / 安装；eas build:run -p ios 选择已有 build；对 development build 启动 npx expo start；用 eas build:run --latest 安装最新构建。

## 下一页

官方页脚 **Next** 是 [App version management](https://docs.expo.dev/build-reference/app-versions/)，区分商店展示的版本号与平台构建号，并介绍 remote / local 版本管理。

**翻页：**[上一页：用 EAS Build 生成 Android APK](./049-Android-APKs.md) · [返回目录](./README.md) · [下一页：App Version Management](./051-App-Version-Management.md)
