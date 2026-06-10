# 使用 Expo 构建 Android TV 与 Apple TV 应用

> 来源：<https://docs.expo.dev/guides/building-for-tv.md>（页面标注更新日期：2026-05-24）

## 文档目标与核心限制

本文说明如何让 Expo 项目同时面向手机与电视，包括 Android TV、Apple TV 的开发环境、依赖替换、config plugin、prebuild、本地运行和 EAS Build profile。

电视支持来自 React Native TV 项目 `react-native-tvos`。它是 React Native 核心仓库的分支，同时支持手机与电视目标，并包含 Hermes 和 Fabric。但**并非所有 Expo 功能与 SDK 库都支持 TV**，必须先核对依赖兼容性。

## 原生工程会发生什么变化

这些改动可由 `@react-native-tvos/config-tv` config plugin 在 prebuild 时自动完成，也可手工修改。

Android：

- 修改 `AndroidManifest.xml`，移除手机默认的竖屏方向并加入 TV 应用所需 intent。
- 修改 `MainApplication.kt`，移除 TV 不支持的 Flipper 调用。

iOS/tvOS：

- 修改 `ios/Podfile`，从 iOS 目标切换为 tvOS。
- 修改 Xcode 工程目标为 tvOS。
- 调整 `SplashScreen.storyboard` 以兼容 tvOS。

对 Web 开发者来说，config plugin 类似可重复执行的原生工程变换器；它修改的是构建输入，不只是 JavaScript 配置。

## 开发环境要求

### Android TV

- macOS 或 Linux 上的 Node.js LTS。
- Android Studio Iguana 或更新版本。
- API 31 或以上的 Android TV system image；Apple Silicon 选择 ARM 64，其他机器选择 Intel x86_64。
- 使用该镜像创建 Android TV 模拟器。

### Apple TV

- macOS 上的 Node.js LTS。
- Xcode 16 或更新版本。
- tvOS SDK 17 或更新版本。它不会随 Xcode 自动安装，可执行：

```sh
xcodebuild -downloadAllPlatforms
```

## 新建 TV 项目

基础示例：

```sh
npx create-expo-app MyTVProject -e with-tv
```

使用 Expo Router 文件路由的示例：

```sh
npx create-expo-app MyTVProject -e with-router-tv
```

## 将现有 Expo 项目改为 TV 项目

### 1. 替换 React Native 依赖

Expo SDK 56 对应 React Native 0.85，因此 `package.json` 使用：

```json
{
  "dependencies": {
    "react-native": "npm:react-native-tvos@0.85-stable"
  }
}
```

`react-native-tvos` 版本必须与 Expo SDK 所依赖的 React Native 版本一致。SDK 56 及以上在升级 Expo SDK 时也会升级 TV 仓库依赖。

如果 monorepo 中有一个 Expo 项目改为 TV，所有 Expo 项目都应使用 React Native TV 包，即使部分项目只构建手机；该包仍支持移动端，这样可避免依赖冲突。

### 2. 安装并声明 TV config plugin

```sh
npx expo install @react-native-tvos/config-tv -- --dev
```

确认 `app.json` 包含：

```json
{
  "plugins": ["@react-native-tvos/config-tv"]
}
```

当 `EXPO_TV=1` 或插件参数 `isTV: true` 时，插件会按 TV 目标修改项目。需要查看 prebuild 细节时可设置：

```sh
export DEBUG=expo:*
export DEBUG=expo:react-native-tvos:config-tv
```

### 3. 生成 TV 原生工程

```sh
export EXPO_TV=1
npx expo prebuild --clean
```

文档推荐 `--clean`；若项目已有 `android` 和 `ios` 目录，则必须使用。它会重新生成原生工程，不应在有未迁移的手工原生改动时草率执行。

### 4. 运行

```sh
npx expo run:android
npx expo run:ios
```

前者运行到 Android TV 模拟器，后者构建并运行到 Apple TV 模拟器。

### 5. 切回手机目标

```sh
unset EXPO_TV
npx expo prebuild --clean
```

## 同一源码配置 TV 与手机 EAS Build

可在 `eas.json` 中让 `development_tv`、`preview_tv` 分别继承手机 profile，并只增加：

```json
{
  "env": {
    "EXPO_TV": "1"
  }
}
```

原文完整示例还设置了内部发行、iOS 模拟器、Android APK、无凭据构建、Debug 配置和 channel。核心思想是用环境变量从同一源码派生手机与 TV 原生工程。

## 支持范围与限制

页面明确列出的 TV 兼容 Expo 库包括 AppleAuthentication、Application、Audio、Asset、AsyncStorage、AV、BackgroundTask、BlurView、BuildProperties、Constants、Crypto、DevClient、Device、Expo UI、FileSystem、FlashList、Font、GlassEffect、Image、ImageManipulator、KeepAwake、LinearGradient、Localization、Manifests、MediaLibrary、NetInfo、Network、Reanimated、SafeAreaContext、SecureStore、Skia、SplashScreen、SQLite、Svg、SystemUI、TaskManager、TrackingTransparency、Updates、Video 和 VideoThumbnails。

React Navigation、React Native Skia 以及许多第三方 React Native 库也可用于 TV，但应逐项核对 TV 支持。

Expo DevClient 仅在 SDK 54 及以上支持 TV：Android TV 的操作与 Android 手机相近；Apple TV 只支持本地或隧道 packager 的基本操作，尚不支持 EAS 登录及列出 EAS builds/updates。

## 实践结论

**文档明确说明：**TV 项目需要匹配 SDK 的 `react-native-tvos`、TV config plugin、`EXPO_TV` 和 clean prebuild；库支持范围不是完整 Expo SDK。

**基于文档内容推导：**在迁移现有项目之前，应先审计所有依赖的 TV 兼容性，并把手机/TV 构建 profile 分开。本文未涉及遥控器焦点交互、十英尺 UI、电视商店提交、性能调优和自动化测试。
