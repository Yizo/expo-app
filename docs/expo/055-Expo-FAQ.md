# 055｜Expo 常见问题

**翻页：**[上一页：Expo 核心概念](./054-Expo核心概念.md) · [目录](./README.md) · **已到终点：本页没有官方 Next 页面**

**官方页面：**[FAQ](https://docs.expo.dev/faq/)

**SDK 56 对照：**[Expo SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)列出 SDK 56 配套 React Native 0.85、React 19.2.3、React Native Web 0.21.0、最低 Node.js 20.19.x，以及 Android 7+ / compile 和 target SDK 36 / iOS 16.4+ / Xcode 26.4+。

## Expo 用来做什么

Expo 是面向 Android、iOS 与 Web 的开源 React Native 框架。安装 `expo` package 后，可以在多数已有 React Native 项目中逐步使用 Expo SDK、Expo CLI、Prebuild、Expo Go、EAS 等功能；使用 EAS 本身并不强制项目使用 Expo framework。

Expo SDK 的目标是提供一组经过测试、用 TypeScript 编写且配套版本协调的原生模块；每个 SDK 对应特定 React Native 版本，升级时按版本匹配可减少随机依赖冲突。

## Expo 与 React Native 的关系

可以把 React Native 粗略类比为 React 的渲染器：它把 React 组件映射到原生 iOS / Android 组件；Expo 则在 RN 之上提供项目工作流、SDK 模块、CLI 和云服务。

与 React Web 相比，React Native 不是浏览器：

- 不使用 HTML / CSS DOM 标签；例如用 RN 的 `View` 表示布局容器，而不是 `div`。
- 浏览器 API 不一定存在；例如位置能力通过 `expo-location` 等模块访问系统原生定位 API，而不是假设浏览器的 `navigator.geolocation` 可用。
- 界面运行在 Android / iOS 原生组件上；同一 Expo 项目也可以输出 Web。

Expo package 可以加进现有 RN 项目，并不要求“从 RN 迁移到 Expo”才能使用。Expo CLI 与 React Native Community CLI 也可共存，团队可按需要逐步采用兼容依赖安装、Web、Tunnel、Prebuild 等功能。

## Expo SDK 为什么存在

Expo 最初在 React Native 生态缺少设备功能库时，为常用能力建立了配套实现。现在 Expo SDK 提供 camera、file system、notifications 等跨平台模块，并由 Expo Modules API 支持 Swift / Kotlin 原生扩展。开发者可按需混用 SDK 与第三方库。

使用 Expo SDK 可以通过 CLI 安装目标 SDK 兼容的库，并借助 Prebuild 从 app config 生成原生工程。Expo Go 让初学者快速试验，但不能装入任意自定义原生模块；真实项目使用 Development Build。

## 费用与 EAS

Expo 开源 framework 与 Expo CLI 可免费使用；EAS 是可选的云端构建、提交、更新等服务，并提供免费额度与不同订阅方案，具体限制按官方定价页为准。

**EAS（Expo Application Services）** 也可以接入不使用 Expo SDK 的 React Native 项目，用于 Build、Submit、Update 等发布流程。

## 可用原生代码与现有 RN 项目

Expo 支持自定义 Swift / Kotlin 模块和原生项目配置。可用 Expo Modules API 写原生模块，用 Config Plugin 生成 `AndroidManifest.xml` / `Info.plist` 等设置，并构建 Development Build。

如果是由 React Native CLI 创建且已经将 `android/` / `ios/` 原生目录纳入项目的 app，EAS Build 通常尊重这些目录，不会执行可能覆盖手工改动的 Prebuild。团队需要按原生工具维护这些工程文件。

## 分享项目和上架

- 开发期间可用 EAS Update 分享兼容的 JS / asset 预览，再由 Development Build 打开。
- 要送交应用商店，需要产生 release build；EAS Build 可以构建，EAS Submit 可以上传。
- 内部分发也能把 Android APK 或 iOS Ad Hoc / Enterprise 构建发给测试者。
- iOS 开发不必所有人本机都有 macOS / Xcode：EAS 云端可代为构建；测试可用 Expo Go 或 Development Build。

## Expo Go 的能力与限制

Expo Go 是学习 playground，可运行内置的 Expo SDK 模块及不需要自定义原生代码的库；它的 native binary 对所有项目相同，无法动态加入某个应用的新 Swift / Kotlin 代码或品牌设置。

因此 Expo Go 不能完整测试自定义原生库、应用图标 / 名称、发布版启动画面、远程推送凭证或 App Links / Universal Links。遇到这些需求应为自己的项目创建 Development Build。

Expo Go 每个 binary 只支持一个 SDK 版本；项目与客户端 SDK 不兼容时，需要安装合适版本或升级项目。真实 iPhone 的 Expo Go 版本安装规则与 Android / iOS Simulator 不同。

## Prebuild 与旧 “eject” 术语

旧版 `expo eject` 命令已在 SDK 46 移除。现在可用 CNG / Prebuild 生成原生目录：

```sh
npx expo prebuild
```

改原生代码可选两类方式：直接改生成的 Android / iOS 工程并自行维护；或写 Config Plugin，把改动留在 app config / 插件里，在以后 Prebuild 时再次生成。Expo 文档建议新团队优先理解 Prebuild，不再沿用“eject”作为必要迁移步骤。

## 其它常见问题

- **应用大小**：Expo FAQ 表示，最小 Expo production app 可小于 3 MB；`expo` package 约一次性增加 1 MB，Android 示例约 150 KiB。具体体积仍受 SDK、Hermes、资源和链接方式影响。
- **原生库**：可以用适配 React Native 的原生库；如果包含自定义 native code，通常要 Development Build。先检查平台支持和 Expo SDK 兼容性。
- **Web 库**：许多面向 React / JavaScript 的 Web 库可以在 Expo Web 或 DOM/WebView 场景使用，但不意味着所有 DOM API 都能在 iOS / Android 原生组件中直接运行。
- **应用商店解释型代码规则**：FAQ 指向 Apple / Google 的当前政策页面；平台规定可能变化，正式发布前应查看最新政策原文。
- **Expo Go 是否开源**：官方 FAQ 指向 Expo GitHub 仓库的 expo-go 目录。

## 关键名词

- **React Native**：用 React 组件描述界面，再映射为 Android / iOS 原生组件的框架。
- **EAS**：Expo 提供的云服务；与开源 Expo Framework 分开理解，可用于普通 RN 工程。
- **解释型代码**：JavaScript 在 app 运行时由 JS 引擎执行，而不是作为 Swift / Kotlin 编译进系统 UI。
- **CNG**：从 Expo app config / plugins 重新生成原生目录的项目管理方式。
- **Development Build**：针对自己的 app 编译、支持自定义原生依赖的调试客户端。

## 官方代码主题覆盖

本 FAQ 没有 fenced code block。行内示例 `View` / `div`、`expo-location`、`expo eject` 与 `npx expo prebuild` 均已在正文解释；平台政策与价格按官方 FAQ 的当前表述总结，并链接原文。

## 终点

本页页脚只有 Previous 指向 Core concepts，没有 Next 链接；到此结束连续导航。

**翻页：**[上一页：Expo 核心概念](./054-Expo核心概念.md) · [返回目录](./README.md) · 已到终点
