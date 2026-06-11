# 在现有 React Native 项目中安装 expo-dev-client

## 文档解决的问题

这篇文档解决的是：如何在已有 React Native 项目里安装 `expo-dev-client`，让你的调试版 App 具备接近 Expo Go 的开发入口和开发工具能力。

## 适用场景

- 你已经有现成的 React Native 项目，想增强本地开发体验。
- 你要在自定义原生依赖较多的项目里使用 Expo 的开发流程。
- 你未来还想让开发构建支持 deep link 或预览更新。

## 核心概念

- `expo-dev-client`：一个开发构建用客户端，不是面向正式用户的生产包。
- `development build`：带调试能力、可连接本地 bundler 的原生应用构建。
- `scheme`：App 的 deep link 协议名，用于通过 URL 打开应用。

对 React Web 开发者来说，它可以类比成“带额外调试壳的本地运行 App”，但它运行在原生容器里，不是浏览器标签页。

## 按原文结构整理的核心内容

### 1. 新项目和现有项目入口不同

如果是新项目，文档建议直接用 `with-dev-client` 模板创建。

但本页重点是已有项目，所以核心前提是：先把 `expo` 包安装好。

### 2. 安装 `expo-dev-client`

```sh
npx expo install expo-dev-client
```

如果项目存在 `ios` 目录，还需要：

```sh
npx pod-install
```

这里再次体现：JS 层安装并不等于 iOS 原生层已经完成接入。

### 3. 配置 deep link scheme

文档特别强调 Expo CLI 会通过 deep link 启动项目，所以建议配置 scheme。

如果还没有配置，可以用：

```sh
npx uri-scheme list
npx uri-scheme add your-scheme
```

这一步的意义是让 App 能被类似 `your-scheme://...` 的 URL 唤起。

### 4. 构建并安装 App

文档没有限制你必须本地构建还是云端构建，只说：

- 可以本地用 Expo CLI 构建
- 也可以用 EAS Build 在云端构建

也就是说，`expo-dev-client` 是一种“开发构建能力”，不是某个唯一的构建渠道。

## 关键命令、配置、文件说明

关键命令：

- `npx expo install expo-dev-client`
- `npx pod-install`
- `npx uri-scheme list`
- `npx uri-scheme add your-scheme`

关键配置：

- 应用的 deep link `scheme`

关键目录：

- `ios`：存在时表示需要执行 iOS 原生依赖安装。

## 注意事项、限制条件和坑点

- 文档明确说：如果项目使用 CNG，应看 development build 的另一篇文档。
- 如果没有 `scheme`，某些依赖 deep link 的开发流程会受影响。
- `expo-dev-client` 装好后，还需要实际构建并安装到设备/模拟器，不是装完包马上就能用。
- 本页没有展开 Android 原生特殊改动细节，重点在安装和深链准备。

## React Web 开发者易误解点

- 容易把 `expo-dev-client` 误解成“浏览器开发工具”。它其实是运行在设备里的开发版 App 壳。
- 容易把 deep link 当成可选功能。当前文档明确说明 Expo CLI 启动项目就依赖它。
- 容易以为“有 Expo Go 就不需要 dev client”。但已有原生定制的项目往往更适合自己的 development build。

## 实际开发建议

- 如果你已经准备接入 Expo CLI，`expo-dev-client` 往往是很自然的下一步。
- 先确定一个清晰、不冲突的 `scheme` 命名规则。
- 基于经验建议：团队统一 development build 的安装方式和 scheme 约定，能减少联调时的环境问题。

## 文档明确说明

- 现有项目需要先安装并配置 `expo` 包。
- 安装 `expo-dev-client` 后，iOS 项目通常还要执行 `pod install`。
- Expo CLI 使用 deep link 启动项目。
- 可以用本地或云端方式构建开发包。

## 基于文档内容推导

- 基于文档内容推导：`expo-dev-client` 的价值主要在“让已有原生项目接入 Expo 开发体验”，而不是单纯增加一个依赖。
- 基于文档内容推导：如果项目未来会做预览更新或复杂调试，尽早规划 scheme 会更省事。

## 当前文档未涉及

- 当前文档未涉及如何创建和分发 development build 的完整日常流程。
- 当前文档未涉及 iOS/Android 的更细粒度原生配置差异。

<!-- NAVIGATION START -->
---
[← 上一页：在现有 React Native 项目中安装 expo-updates](./34_installing-updates.md) | [下一页：Expo 原生工程升级辅助工具 →](./36_upgrade.md)
<!-- NAVIGATION END -->
