# Expo Modules API：概述

> **原文地址**：[https://docs.expo.dev/modules/overview/](https://docs.expo.dev/modules/overview/)
>
> 本文档基于 Expo 官方文档翻译整理，忠实还原原文内容。标注"基于经验建议"的内容为实践经验补充，标注"基于文档内容推导"的内容为从原文逻辑推导得出的结论。

---

## 什么是 Expo Modules API

Expo Modules API 允许你使用 **Swift** 和 **Kotlin** 编写代码，通过原生模块（native modules）为应用添加新的功能。它利用现代语言特性，确保跨平台一致性，减少样板代码（boilerplate），并且性能与 React Native 的 **Turbo Modules API** 相当。

此外，Expo Modules 原生支持 React Native 的**新架构（New Architecture）**，同时保持对旧架构的向后兼容。Expo 团队认为，该方案使得构建和维护几乎所有类型的 React Native 原生模块"尽可能简单"（about as easy as it can be）。

> **关键术语解释（面向初学者）**：
>
> - **原生模块（Native Module）**：用平台原生语言（iOS 用 Swift/Objective-C，Android 用 Kotlin/Java）编写的代码模块，可以访问设备底层功能（如相机、传感器、文件系统等），JavaScript 无法直接访问这些功能。
> - **Swift**：Apple 推出的现代编程语言，用于开发 iOS、macOS 等 Apple 平台应用。
> - **Kotlin**：JetBrains 推出的现代编程语言，是 Android 官方推荐的开发语言。
> - **Turbo Modules**：React Native 新架构中的原生模块系统，使用 C++ 编写，提供对底层机制的直接访问。
> - **新架构（New Architecture）**：React Native 的新一代架构体系，包含 Fabric（新渲染器）、Turbo Modules（新原生模块系统）等组件，旨在提升性能和开发体验。
> - **样板代码（Boilerplate）**：指重复的、模式化的、必须编写但并无太多业务逻辑意义的代码。减少样板代码意味着开发者可以用更少的代码完成同样的工作。

---

## 常见问题

### 我是否需要了解 Expo Modules API 才能构建 Expo / React Native 应用？

大多数时候，Expo 和 React Native 开发者**不需要编写任何原生代码**。开发者通常依赖已有的预构建库来实现常见功能，例如相机、地图、触觉反馈（haptics）等。

但在以下场景中，你可能需要构建自定义模块：

- 需要**集成公司要求的分析服务**（例如企业内部的专有 SDK）
- 需要访问某个**系统功能**，但社区中没有维护良好的现成库

> **基于经验建议**：在决定自己编写原生模块之前，建议先在 [npm](https://www.npmjs.com/) 和 [Expo 社区](https://forums.expo.dev/) 中搜索是否有现成可用的库。编写和维护原生模块的成本远高于使用已有库。

---

### 什么时候应该使用 Turbo Modules，什么时候应该使用 Expo Modules API？

这取决于你的技术栈需求：

- **选择 Turbo Modules**：如果你的原生模块需要使用 **C++**，因为 Turbo Modules 提供了对底层机制更便捷的访问。这也是 [React Native 团队的官方建议](https://github.com/react-native-community/discussions-and-proposals/blob/main/proposals/0759-react-native-frameworks.md#what-do-we-recommend-to-react-native-library-developers)。
- **选择 Expo Modules API**：如果你更看重**开发体验**，并且愿意在模块中依赖 `expo` 包。

> **基于文档内容推导**：对于大多数不涉及 C++ 的场景，Expo Modules API 是更优选择，因为它提供了更友好的开发体验和更少的样板代码。只有当你明确需要 C++ 底层能力时，才应选择 Turbo Modules。

---

### 在哪里可以找到开源的 Expo Modules 来学习？

以下是官方推荐的学习资源：

**官方资源**：

- [Expo SDK 源码](https://github.com/expo/expo/tree/main/packages) — Expo 官方 SDK 包的实现，是学习 Expo Modules 用法的最佳起点
- [Bluesky 应用](https://github.com/bluesky-social/social-app/tree/main/modules) — 知名开源社交应用的模块实现

**社区优秀项目**：

| 项目名称 | 功能说明 |
|---------|---------|
| [react-native-widget-extension](https://github.com/bndkt/react-native-widget-extension) | iOS 小组件（Widget）扩展 |
| [burnt](https://github.com/nandorojo/burnt) | Toast 通知（轻量提示） |
| [expo-video-metadata](https://github.com/hirbod/expo-video-metadata) | 视频元数据提取 |
| [swiftui-react-native](https://github.com/andrew-levy/swiftui-react-native) | SwiftUI 桥接集成 |
| [react-native-ios-context-menu](https://github.com/dominicstop/react-native-ios-context-menu) | iOS 上下文菜单 |
| [react-native-mlkit](https://github.com/infinitered/react-native-mlkit) | ML Kit 机器学习工具包 |
| [react-native-passkeys](https://github.com/peterferguson/react-native-passkeys) | Passkey 密钥认证 |
| [expo-drag-drop-content-view](https://github.com/AlirezaHadjar/expo-drag-drop-content-view) | 拖放内容视图 |

> **基于经验建议**：建议从 Expo SDK 源码中的简单模块开始阅读（如 `expo-haptics`、`expo-brightness`），理解基本模式后再研究复杂模块。Bluesky 的模块目录也是很好的实战参考。

---

### 使用 Expo Modules API 对应用体积有什么影响？

将 Expo Modules API 添加到你的应用中，对应用体积的影响**微乎其微（negligible）**，可能仅增加**几百 KB（kilobytes）**。

> **基于文档内容推导**：几百 KB 的增量在现代移动应用中几乎可以忽略不计（现代应用通常几十到上百 MB），因此不应因体积顾虑而放弃使用 Expo Modules API。详见 [Expo 官方博客文章](https://blog.expo.dev/embracing-expo-modules-in-your-react-native-projects-cd8ed4cbec3)。

---

### 使用 Expo Modules API 对应用性能有什么影响？

Expo Modules API 的性能特征与 React Native 的 Turbo Modules API **相似**。

核心原理：两种 API 都利用了 React Native 的 **JavaScript Interface（JSI）**，而不是旧架构中基于 **JSON 消息桥（JSON message bridge）** 的通信方式。

关键性能数据：

- Expo Modules 和 Turbo Modules 都可以轻松实现**每秒数十万次原生方法调用**（hundreds of thousands of native method calls per second）
- 虽然并未针对绝对理论最大速度进行优化，但在实际使用中，**原生函数本身的执行时间通常远大于调用开销**，因此调用开销几乎不会成为性能瓶颈

> 如果你遇到性能问题，可以在 [GitHub 上提交 issue](https://github.com/expo/expo/issues/new/choose) 进行反馈。

> **关键术语解释（面向初学者）**：
>
> - **JavaScript Interface（JSI）**：React Native 新架构中的核心组件，允许 JavaScript 直接调用 C++/原生对象，无需经过序列化/反序列化过程，大幅提升通信效率。可以[了解更多关于 JSI 的信息](https://reactnative.dev/docs/the-new-architecture/landing-page#fast-javascriptnative-interfacing)。
> - **JSON 消息桥（JSON Message Bridge）**：旧架构中 JavaScript 与原生代码之间的通信方式。所有数据需要序列化为 JSON 格式传递，效率较低。新架构的 JSI 已取代此方式。

---

### Expo Modules API 是否支持 Android、iOS 和 Web以外的平台？

是的，Expo Modules API 目前对 **macOS** 和 **tvOS** 提供**实验性支持（experimental support）**。

更多详情请参阅[附加平台支持（Additional platform support）](https://docs.expo.dev/modules/additional-platform-support/)指南。

> **关键术语解释（面向初学者）**：
>
> - **实验性支持（Experimental Support）**：指功能已初步实现但尚未经过充分测试和验证，可能存在已知或未知的限制和问题，不建议在生产环境中依赖。
> - **tvOS**：Apple TV 的操作系统。
> - **macOS**：Apple Mac 电脑的操作系统。

---

### 如何使用 Expo Modules API 让第三方 SDK 在 Expo 应用中可用？

如果你需要将现有的第三方原生库（如某个企业级 SDK）封装为 Expo 模块，请参考专门的教程：[集成现有库（Integrate an existing library）](https://docs.expo.dev/modules/existing-library/)。

> **基于经验建议**：封装第三方 SDK 时，建议先在纯原生项目中验证该 SDK 的功能和 API，确认其工作正常后再进行 Expo Module 封装。这样可以避免同时排查原生 SDK 问题和封装层问题的复杂性。

---

## 下一步

以下资源将帮助你深入学习 Expo Modules API：

| 资源 | 说明 |
|------|------|
| [教程：创建原生模块](https://docs.expo.dev/modules/native-module-tutorial/) | 通过实践学习创建一个可以持久化存储设置的原生模块 |
| [教程：创建原生视图](https://docs.expo.dev/modules/native-view-tutorial/) | 通过实践学习创建一个渲染 WebView 的原生视图组件 |
| [Expo Modules API：入门](https://docs.expo.dev/modules/module-api/) | 了解如何开始使用 Expo Modules API |
| [Expo Modules API：参考](https://docs.expo.dev/modules/module-api/) | Kotlin 和 Swift 原生模块创建的完整 API 参考 |
| [Expo Modules API：设计考量](https://docs.expo.dev/modules/design/) | Expo Modules API 背后的设计理念和架构哲学概述 |
| [expo-module.config.json](https://docs.expo.dev/modules/module-config/) | 可用配置选项的参考文档 |

> **基于经验建议**：推荐的学习路径是：先阅读本概述 → 完成"创建原生模块"教程 → 完成"创建原生视图"教程 → 再回来阅读"设计考量"和 API 参考。动手实践比纯阅读文档更能加深理解。

---

## 文档导航

- **上一页**：[sdk 55 to 56](./97__sdk-55-to-56.md)
- **下一页**：[get started](./99__get-started.md)
