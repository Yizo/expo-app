# 在现有 React Native 项目中安装 expo-updates

## 文档解决的问题

这篇文档解决的是：如何在现有 React Native 项目里安装并配置 `expo-updates`，让应用能够从远程更新服务获取新的 JavaScript 和静态资源。

## 适用场景

- 你想给已有 React Native 项目增加 OTA 更新能力。
- 你准备使用 EAS Update。
- 你的项目是 bare / 非 CNG 项目，仍然直接维护原生工程。

文档一开头就提醒：如果你用的是 CNG，这不是正确入口。

## 核心概念

- `expo-updates`：客户端更新库，负责检查、下载、应用远程更新。
- `EAS Update`：Expo 托管的远程更新服务。
- `app.json` 中的 `updates.url`：更新服务地址。
- `runtimeVersion`：原生壳与 JS 更新兼容性的关键标识。

对 React Web 开发者来说，可以把它类比成“线上壳应用去拉取新的前端 bundle”，但它比普通 Web 部署更严格，因为必须考虑原生壳和 JS 代码兼容性。

## 按原文结构整理的核心内容

### 1. 先确认前提

如果项目原本是 `@react-native-community/cli` 初始化且尚未安装其他 Expo 库，必须先安装 Expo modules。

### 2. 安装依赖

```sh
npx expo install expo-updates
npx pod-install
```

第一步安装 JS 与原生模块，第二步让 iOS 原生依赖真正落地。

### 3. 配置 `expo-updates`

文档把配置分为 JavaScript/JSON、Android、iOS 三层。

#### JavaScript / JSON 层

使用：

```sh
eas update:configure
```

它会帮助设置：

- `app.json` 里的 `updates.url`
- `projectId`

文档也给了自定义服务器示例，说明 `updates.url` 不一定非得指向 EAS。

#### Android 层

需要修改：

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/values/strings.xml`

作用分别包括：

- 让 Expo 文件感知当前 JS 引擎配置
- 写入和 `app.json` 一致的更新配置
- 配置运行时版本

如果更新服务器是本机 HTTP 地址，还要开启 `usesCleartextTraffic`。

#### iOS 层

需要增加或修改：

- `ios/Podfile.properties.json`
- `ios/Podfile`
- `Expo.plist`

其中 `Expo.plist` 会存放：

- 是否启用更新
- 启动时检查策略
- 启动等待时间
- `runtimeVersion`
- 更新 URL

## 关键命令、配置、文件说明

关键命令：

- `npx expo install expo-updates`
- `npx pod-install`
- `eas update:configure`

关键配置：

- `app.json` 的 `expo.updates.url`
- `projectId`
- `runtimeVersion`
- `expo.jsEngine`

关键文件：

- `app.json`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/values/strings.xml`
- `ios/Podfile.properties.json`
- `ios/Podfile`
- `ios/.../Supporting/Expo.plist`

## 注意事项、限制条件和坑点

- 文档明确说：如果项目使用 CNG，应看另一篇指南。
- 使用本地非 HTTPS 更新服务时，Android 需要显式允许明文流量。
- `app.json`、Android、iOS 三处配置要保持一致，否则更新行为可能不符合预期。
- 当前文档偏重“安装与原生接线”，没有展开运行时更新策略设计。

## React Web 开发者易误解点

- 容易把 OTA 更新理解成“部署静态资源到 CDN”。这里不是纯 Web，它受原生壳约束。
- 容易忽略 `runtimeVersion`。但它决定某个更新能否安全下发到当前原生壳。
- 容易觉得 `app.json` 配好就结束了。实际上 Android 和 iOS 还分别有原生配置文件。

## 实际开发建议

- 如果你要上 EAS Update，先用 `eas update:configure`，不要手写一半配置再补另一半。
- 如果你要自建更新服务，优先确认 URL、协议和运行时版本策略。
- 基于经验建议：接入完成后，先在测试环境验证“检查更新、下载、启动”完整链路，再考虑正式灰度。

## 文档明确说明

- `expo-updates` 用于管理远程更新。
- 现有 bare React Native 项目可以配置它接入 EAS Update。
- CNG 项目应看另一篇文档。
- Android 和 iOS 都需要原生层配置。
- 可以使用 EAS，也可以使用实现 Expo Updates 协议的自定义服务。

## 基于文档内容推导

- 基于文档内容推导：`expo-updates` 接入成功与否，不只是 npm 安装问题，而是“配置一致性”问题。
- 基于文档内容推导：团队如果没有清晰的 `runtimeVersion` 策略，后续 OTA 运维会很容易出错。

## 当前文档未涉及

- 当前文档未涉及发布更新命令的完整日常流程。
- 当前文档未涉及回滚策略、灰度策略和版本治理细节。

<!-- NAVIGATION START -->
---
[← 上一页：从 React Native CLI 迁移到 Expo CLI](./33_using-expo-cli.md) | [下一页：在现有 React Native 项目中安装 expo-dev-client →](./35_install-dev-builds-in-bare.md)
<!-- NAVIGATION END -->
