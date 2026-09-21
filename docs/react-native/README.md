# React Native 官方文档中文学习笔记

本文档从官方 [Getting Started / Introduction](https://reactnative.dev/docs/getting-started) 开始，按 React Native 文档页面底部的 **Next** 链接逐页整理。当前核对的是站点的 Next 文档版本（页面列出的版本为 0.87，检查日期：2026-09-20）。React Native 站点与 Expo SDK 使用两套编号：Expo SDK 56 对应 React Native 0.85，因此本套 RN 笔记按给定 URL 当前解析到的 RN 0.87 编写，与 Expo SDK 56 所用 RN 版本不同。实际建项目时应按 Expo 官方兼容表选版本。

这些页面是中文释义和学习笔记，不是原文逐字翻译。每页会标明官方源页是否有可见代码块或交互示例，以及笔记覆盖的代码主题；有代码的页面按主题重写示例，避免用一段代表代码代替整页覆盖。请以各页链接的官方文档为准，尤其是版本相关行为。

## 阅读范围与导航

起始页：**Introduction** — <https://reactnative.dev/docs/getting-started>  
当前连续前缀末页：**Publishing to Apple App Store** — <https://reactnative.dev/docs/publishing-to-app-store>  
遍历规则：按每一页底部 `Next` 的链接前进。当前已连续经过 Environment setup、Workflow、UI & Interaction、Debugging、Testing、Performance、JavaScript Runtime、Codegen、Native Development 与 Android/iOS guides。069 的 Next 回到已覆盖的 054 Native Modules: Introduction；因此在重复页面处结束本轮单链。

| 页码 | 页面主题 | 官方页面 | 上一页 | 下一页 |
|---|---|---|---|---|
| 001 | 入门介绍（Introduction） | [Introduction · React Native](https://reactnative.dev/docs/getting-started) | [目录](README.md) | [002](002-核心组件与原生组件.md) |
| 002 | 核心组件与原生组件（Core Components and Native Components） | [Core Components and Native Components · React Native](https://reactnative.dev/docs/intro-react-native-components) | [001](001-入门介绍.md) | [003](003-React基础.md) |
| 003 | React 基础（React Fundamentals） | [React Fundamentals · React Native](https://reactnative.dev/docs/intro-react) | [002](002-核心组件与原生组件.md) | [004](004-处理文本输入.md) |
| 004 | 处理文本输入（Handling Text Input） | [Handling Text Input · React Native](https://reactnative.dev/docs/handling-text-input) | [003](003-React基础.md) | [005](005-使用ScrollView.md) |
| 005 | 使用 `ScrollView`（Using a ScrollView） | [Using a ScrollView · React Native](https://reactnative.dev/docs/using-a-scrollview) | [004](004-处理文本输入.md) | [006](006-使用列表视图.md) |
| 006 | 使用列表视图（Using List Views） | [Using List Views · React Native](https://reactnative.dev/docs/using-a-listview) | [005](005-使用ScrollView.md) | [007](007-故障排除.md) |
| 007 | 故障排除（Troubleshooting） | [Troubleshooting · React Native](https://reactnative.dev/docs/troubleshooting) | [006](006-使用列表视图.md) | [008](008-平台专属代码.md) |
| 008 | 平台专属代码（Platform-Specific Code） | [Platform-Specific Code · React Native](https://reactnative.dev/docs/platform-specific-code) | [007](007-故障排除.md) | [009](009-更多资源.md) |
| 009 | 更多资源（More Resources） | [More Resources · React Native](https://reactnative.dev/docs/more-resources) | [008](008-平台专属代码.md) | [010](010-开始使用ReactNative.md) |
| 010 | 开始使用 React Native（Get Started with React Native） | [Get Started with React Native · React Native](https://reactnative.dev/docs/environment-setup) | [009](009-更多资源.md) | [011](011-设置开发环境.md) |
| 011 | 设置开发环境（Set Up Your Environment） | [Set Up Your Environment · React Native](https://reactnative.dev/docs/set-up-your-environment) | [010](010-开始使用ReactNative.md) | [012](012-集成到现有应用.md) |
| 012 | 集成到现有应用（Integration with Existing Apps） | [Integration with Existing Apps · React Native](https://reactnative.dev/docs/integration-with-existing-apps) | [011](011-设置开发环境.md) | [013](013-集成到AndroidFragment.md) |
| 013 | 集成到 Android Fragment（Integration with an Android Fragment） | [Integration with an Android Fragment · React Native](https://reactnative.dev/docs/integration-with-android-fragment) | [012](012-集成到现有应用.md) | [014](014-TV设备支持.md) |
| 014 | TV 设备支持（Building For TV Devices） | [Building For TV Devices · React Native](https://reactnative.dev/docs/building-for-tv) | [013](013-集成到AndroidFragment.md) | [015](015-树外平台.md) |
| 015 | 树外平台（Out-of-Tree Platforms） | [Out-of-Tree Platforms · React Native](https://reactnative.dev/docs/out-of-tree-platforms) | [014](014-TV设备支持.md) | [016](016-在设备上运行.md) |
| 016 | 在设备上运行（Running On Device） | [Running On Device · React Native](https://reactnative.dev/docs/running-on-device) | [015](015-树外平台.md) | [017](017-FastRefresh.md) |
| 017 | Fast Refresh | [Fast Refresh · React Native](https://reactnative.dev/docs/fast-refresh) | [016](016-在设备上运行.md) | [018](018-Metro.md) |
| 018 | Metro | [Metro · React Native](https://reactnative.dev/docs/metro) | [017](017-FastRefresh.md) | [019](019-使用第三方库.md) |
| 019 | 使用第三方库（Using Libraries） | [Using Libraries · React Native](https://reactnative.dev/docs/libraries) | [018](018-Metro.md) | [020](020-使用TypeScript.md) |
| 020 | 使用 TypeScript（Using TypeScript） | [Using TypeScript · React Native](https://reactnative.dev/docs/typescript) | [019](019-使用第三方库.md) | [021](021-StrictTypeScriptAPI.md) |
| 021 | Strict TypeScript API | [Strict TypeScript API · React Native](https://reactnative.dev/docs/strict-typescript-api) | [020](020-使用TypeScript.md) | [022](022-ReleaseLevels.md) |
| 022 | Release Levels | [Release Levels · React Native](https://reactnative.dev/docs/release-levels) | [021](021-StrictTypeScriptAPI.md) | [023](023-升级到新版本.md) |
| 023 | 升级到新版本（Upgrading to New Versions） | [Upgrading to New Versions · React Native](https://reactnative.dev/docs/upgrading) | [022](022-ReleaseLevels.md) | [024](024-Style.md) |
| 024 | Style | [Style · React Native](https://reactnative.dev/docs/style) | [023](023-升级到新版本.md) | [025](025-HeightAndWidth.md) |
| 025 | Height and Width | [Height and Width · React Native](https://reactnative.dev/docs/height-and-width) | [024](024-Style.md) | [026](026-LayoutWithFlexbox.md) |
| 026 | Layout with Flexbox | [Layout with Flexbox · React Native](https://reactnative.dev/docs/flexbox) | [025](025-HeightAndWidth.md) | [027](027-Images.md) |
| 027 | Images | [Images · React Native](https://reactnative.dev/docs/images) | [026](026-LayoutWithFlexbox.md) | [028](028-ColorReference.md) |
| 028 | Color Reference | [Color Reference · React Native](https://reactnative.dev/docs/colors) | [027](027-Images.md) | [029](029-HandlingTouches.md) |
| 029 | Handling Touches | [Handling Touches · React Native](https://reactnative.dev/docs/handling-touches) | [028](028-ColorReference.md) | [030](030-NavigatingBetweenScreens.md) |
| 030 | Navigating Between Screens | [Navigating Between Screens · React Native](https://reactnative.dev/docs/navigation) | [029](029-HandlingTouches.md) | [031](031-Animations.md) |
| 031 | Animations | [Animations · React Native](https://reactnative.dev/docs/animations) | [030](030-NavigatingBetweenScreens.md) | [032](032-GestureResponderSystem.md) |
| 032 | 手势响应系统（Gesture Responder System） | [Gesture Responder System · React Native](https://reactnative.dev/docs/gesture-responder-system) | [031](031-Animations.md) | [033](033-Networking.md) |
| 033 | Networking | [Networking · React Native](https://reactnative.dev/docs/network) | [032](032-GestureResponderSystem.md) | [034](034-Security.md) |
| 034 | Security | [Security · React Native](https://reactnative.dev/docs/security) | [033](033-Networking.md) | [035](035-Accessibility.md) |
| 035 | Accessibility | [Accessibility · React Native](https://reactnative.dev/docs/accessibility) | [034](034-Security.md) | [036](036-DebuggingBasics.md) |
| 036 | Debugging Basics | [Debugging Basics · React Native](https://reactnative.dev/docs/debugging) | [035](035-Accessibility.md) | [037](037-ReactNativeDevTools.md) |
| 037 | React Native DevTools | [React Native DevTools · React Native](https://reactnative.dev/docs/react-native-devtools) | [036](036-DebuggingBasics.md) | [038](038-DebuggingNativeCode.md) |
| 038 | Debugging Native Code | [Debugging Native Code · React Native](https://reactnative.dev/docs/debugging-native-code) | [037](037-ReactNativeDevTools.md) | [039](039-DebuggingReleaseBuilds.md) |
| 039 | Debugging Release Builds | [Debugging Release Builds · React Native](https://reactnative.dev/docs/debugging-release-builds) | [038](038-DebuggingNativeCode.md) | [040](040-OtherDebuggingMethods.md) |
| 040 | 其他调试方式（Other Debugging Methods） | [Other Debugging Methods · React Native](https://reactnative.dev/docs/other-debugging-methods) | [039](039-DebuggingReleaseBuilds.md) | [041](041-Testing.md) |
| 041 | Testing | [Testing · React Native](https://reactnative.dev/docs/testing-overview) | [040](040-OtherDebuggingMethods.md) | [042](042-PerformanceOverview.md) |
| 042 | Performance Overview | [Performance Overview · React Native](https://reactnative.dev/docs/performance) | [041](041-Testing.md) | [043](043-SpeedingUpBuildPhase.md) |
| 043 | Speeding up your Build phase | [Speeding up your Build phase · React Native](https://reactnative.dev/docs/build-speed) | [042](042-PerformanceOverview.md) | [044](044-OptimizingFlatListConfiguration.md) |
| 044 | Optimizing FlatList Configuration | [Optimizing FlatList Configuration · React Native](https://reactnative.dev/docs/optimizing-flatlist-configuration) | [043](043-SpeedingUpBuildPhase.md) | [045](045-OptimizingJavaScriptLoading.md) |
| 045 | Optimizing JavaScript loading | [Optimizing JavaScript loading · React Native](https://reactnative.dev/docs/optimizing-javascript-loading) | [044](044-OptimizingFlatListConfiguration.md) | [046](046-Profiling.md) |
| 046 | Profiling | [Profiling · React Native](https://reactnative.dev/docs/profiling) | [045](045-OptimizingJavaScriptLoading.md) | [047](047-JavaScriptEnvironment.md) |
| 047 | JavaScript Environment | [JavaScript Environment · React Native](https://reactnative.dev/docs/javascript-environment) | [046](046-Profiling.md) | [048](048-Timers.md) |
| 048 | Timers | [Timers · React Native](https://reactnative.dev/docs/timers) | [047](047-JavaScriptEnvironment.md) | [049](049-UsingHermes.md) |
| 049 | Using Hermes | [Using Hermes · React Native](https://reactnative.dev/docs/hermes) | [048](048-Timers.md) | [050](050-WhatIsCodegen.md) |
| 050 | What is Codegen? | [What is Codegen? · React Native](https://reactnative.dev/docs/the-new-architecture/what-is-codegen) | [049](049-UsingHermes.md) | [051](051-UsingCodegen.md) |
| 051 | Using Codegen | [Using Codegen · React Native](https://reactnative.dev/docs/the-new-architecture/using-codegen) | [050](050-WhatIsCodegen.md) | [052](052-TheCodegenCLI.md) |
| 052 | The Codegen CLI | [The Codegen CLI · React Native](https://reactnative.dev/docs/the-new-architecture/codegen-cli) | [051](051-UsingCodegen.md) | [053](053-NativePlatform.md) |
| 053 | Native Platform | [Native Platform · React Native](https://reactnative.dev/docs/native-platform) | [052](052-TheCodegenCLI.md) | [054](054-NativeModulesIntroduction.md) |
| 054 | Native Modules: Introduction | [Native Modules: Introduction · React Native](https://reactnative.dev/docs/turbo-native-modules-introduction) | [053](053-NativePlatform.md) | [055](055-CrossPlatformNativeModulesCpp.md) |
| 055 | Cross-Platform Native Modules (C++) | [Cross-Platform Native Modules (C++) · React Native](https://reactnative.dev/docs/the-new-architecture/pure-cxx-modules) | [054](054-NativeModulesIntroduction.md) | [056](056-AdvancedNativeModules.md) |
| 056 | Advanced Topics on Native Modules Development | [Advanced Topics on Native Modules Development · React Native](https://reactnative.dev/docs/the-new-architecture/advanced-topics-modules) | [055](055-CrossPlatformNativeModulesCpp.md) | [057](057-FabricNativeComponentsIntroduction.md) |
| 057 | Fabric Native Components Introduction | [Fabric Native Components Introduction · React Native](https://reactnative.dev/docs/fabric-native-components-introduction) | [056](056-AdvancedNativeModules.md) | [058](058-AdvancedNativeComponents.md) |
| 058 | Advanced Topics on Native Components | [Advanced Topics on Native Modules Development · React Native](https://reactnative.dev/docs/the-new-architecture/advanced-topics-components) | [057](057-FabricNativeComponentsIntroduction.md) | [059](059-CodegenAppendix.md) |
| 059 | Appendix | [Appendix · React Native](https://reactnative.dev/docs/appendix) | [058](058-AdvancedNativeComponents.md) | [060](060-CreateLibraryForModule.md) |
| 060 | Create a Library for Your Module | [Create a Library for Your Module · React Native](https://reactnative.dev/docs/the-new-architecture/create-module-library) | [059](059-CodegenAppendix.md) | [061](061-HeadlessJS.md) |
| 061 | Headless JS | [Headless JS · React Native](https://reactnative.dev/docs/headless-js-android) | [060](060-CreateLibraryForModule.md) | [062](062-PublishingGooglePlayStore.md) |
| 062 | Publishing to Google Play Store | [Publishing to Google Play Store · React Native](https://reactnative.dev/docs/signed-apk-android) | [061](061-HeadlessJS.md) | [063](063-CommunicationBetweenNativeAndReactNative.md) |
| 063 | Communication between native and React Native | [Communication between native and React Native · React Native](https://reactnative.dev/docs/communication-android) | [062](062-PublishingGooglePlayStore.md) | [064](064-ReactNativeGradlePlugin.md) |
| 064 | React Native Gradle Plugin | [React Native Gradle Plugin · React Native](https://reactnative.dev/docs/react-native-gradle-plugin) | [063](063-CommunicationBetweenNativeAndReactNative.md) | [065](065-LinkingLibraries.md) |
| 065 | Linking Libraries | [Linking Libraries · React Native](https://reactnative.dev/docs/linking-libraries-ios) | [064](064-ReactNativeGradlePlugin.md) | [066](066-RunningOnSimulator.md) |
| 066 | Running On Simulator | [Running On Simulator · React Native](https://reactnative.dev/docs/running-on-simulator-ios) | [065](065-LinkingLibraries.md) | [067](067-CommunicationBetweenNativeAndReactNativeIOS.md) |
| 067 | Communication between native and React Native（iOS） | [Communication between native and React Native · React Native](https://reactnative.dev/docs/communication-ios) | [066](066-RunningOnSimulator.md) | [068](068-AppExtensions.md) |
| 068 | App Extensions | [App Extensions · React Native](https://reactnative.dev/docs/app-extensions) | [067](067-CommunicationBetweenNativeAndReactNativeIOS.md) | [069](069-PublishingAppleAppStore.md) |
| 069 | Publishing to Apple App Store | [Publishing to Apple App Store · React Native](https://reactnative.dev/docs/publishing-to-app-store) | [068](068-AppExtensions.md) | [054](054-NativeModulesIntroduction.md)（已覆盖，重复） |

## 源页代码覆盖统计

当前连续整理到第 069 页，共 69 页：60 页含源页代码示例，8 页无代码示例，059 页仅含 Codegen 类型映射表。代码覆盖依据每页顶部的主题清单。

无代码示例页：009「更多资源」、014「TV 设备支持」、040「其他调试方式」、050「What is Codegen?」、053「Native Platform」、056「Advanced Topics on Native Modules Development」、058「Advanced Topics on Native Components」、068「App Extensions」。059「Appendix」包含类型签名映射表，已在本地用中英类型及 Android/iOS 对照表覆盖。

命令和版本按 2026-09-20 检查的 RN Next 0.87 页面整理；执行前按项目所用 RN/Expo 版本核对。RN 0.87 与 Expo SDK 56 对应的 RN 0.85 不完全匹配。

## 给熟悉 React 的读者

- 组件、JSX、props、state、Hooks 的 React 心智模型可以沿用；屏幕元素则要从 HTML 标签换成 React Native 组件。
- React Native 的 `View`、`Text`、`Image` 等会映射到 Android/iOS 的原生视图，不会渲染 HTML DOM。网页 CSS 属性、DOM API 和浏览器事件不能直接假设可用。
- RN 页面一般用 Flexbox 布局，并通过 `StyleSheet` 或样式对象设定样式；输入、点击、列表滚动等也使用 RN 组件自己的属性和回调。
- React Native 是框架；Expo 是建立在 RN 之上的开发与应用平台。本文严格整理 RN 官方文档，没有将 Expo 文档混入每页内容。

## 补充模块

以下模块各自从官方入口开始，按该页底部 Next 单独遍历，并维护各自的 README 与页码：

- [ActivityIndicator 组件](activity-indicator/README.md) — [官方入口](https://reactnative.dev/docs/activityindicator)；41 页，Next 链止于 ViewToken
- [AccessibilityInfo API](accessibility-info/README.md) — [官方入口](https://reactnative.dev/docs/accessibilityinfo)；76 页，Next 链止于 Settings
- [Architecture Overview 架构概览](architecture-overview/README.md) — [官方入口](https://reactnative.dev/architecture/overview)；9 页，Glossary 是 Next 终点
