# 将 Expo 工具集成到现有原生应用中

> **原文地址**：<https://docs.expo.dev/brownfield/overview/>

---

## 什么是"棕地"（Brownfield）应用？

在移动开发领域，有一个重要的概念区分：**棕地应用**（Brownfield App）与**绿地应用**（Greenfield App）。

### 棕地应用（Brownfield App）

**棕地应用**指的是：使用其他技术栈构建的、已存在的原生应用，其主入口**不是** React Native 视图。

> **术语解释**：
> - **原生应用**（Native App）：直接使用平台原生语言开发的应用。iOS 端使用 Swift/Objective-C + UIKit/SwiftUI；Android 端使用 Kotlin/Java + Android SDK。
> - **React Native**：由 Meta（Facebook）开发的开源框架，允许使用 JavaScript/TypeScript 编写跨平台移动应用。它的"视图"（View）最终会被渲染为原生 UI 组件。
> - **入口**（Entry Point）：应用启动后首先加载和展示的部分。

**举例说明**：假设你的应用是用 Swift 和 UIKit（iOS 的原生 UI 框架）构建的，现在你希望在某一个页面中引入 React Native 来实现特定功能——这种场景就被称为"棕地"开发。

### 绿地应用（Greenfield App）

**绿地应用**指的是：从一开始就使用 Expo 或 React Native 创建的应用，React Native 是应用的入口点，所有其他 UI 都从它延伸出去。

> **术语解释**：
> - **Expo**：围绕 React Native 构建的一套工具和服务平台，简化了 React Native 应用的开发、构建和部署流程。它提供了丰富的标准库、CLI 工具、云构建服务等。

### 本指南的目标读者

如果你有一个已存在的 Android 或 iOS 原生应用，想要了解如何在项目中使用 Expo 和 React Native（也许只是在单个页面甚至单个功能上），那么本指南正是为你准备的。

---

## 与现有原生应用的兼容性

> **⚠️ 重要提示**：将 Expo 模块集成到现有原生项目中的支持目前处于 **alpha（预览测试）** 阶段。如果你遇到问题，请[在 GitHub 上创建 Issue](https://github.com/expo/expo/issues)。在现有原生应用的上下文中使用时，以下工具和服务的部分功能可能不可用。
>
> **术语解释**：
> - **Alpha（预览测试）阶段**：软件发布周期中的一个早期阶段，表示功能尚未完全稳定，可能存在已知或未知的问题。与之对比：Beta（公测）→ Stable（稳定版）。

Expo 主要是为绿地应用设计的，但 Expo 团队正在持续加大对棕地场景的投入。目前并非所有 Expo 工具和服务都兼容现有原生项目。此外，针对棕地集成的全面文档可能尚不完善，你可能需要根据自身情况对其他相关文档进行适配理解。

### 兼容性一览表

| 工具/服务 | 是否支持棕地？ | 说明 |
| --- | --- | --- |
| **Expo SDK** — React Native 的扩展标准库 | ✅ 支持 | 提供相机、文件系统、通知等常用原生功能的 JavaScript 接口 |
| **Expo Modules API** — 使用 Swift/Kotlin 构建原生扩展的 API | ✅ 支持 | 允许你用 Swift（iOS）和 Kotlin（Android）编写原生模块，并通过统一的 API 暴露给 JavaScript |
| **Expo Router** — 基于文件系统的路由和导航 | ✅ 支持 | 通过文件和目录结构自动配置应用的页面路由，类似于 Next.js 的文件路由系统 |
| **Expo CLI** — 终端开发和运行工具 | ✅ 支持 | 在命令行中启动开发服务器、构建应用等 |
| **Expo Dev Client** — 为 Debug 构建添加应用内开发者工具 | ❌ 不支持 | 该功能目前在棕地场景下无法使用 |
| **EAS Build** — 专为 Expo/React Native 打造的 CI/CD 服务 | ✅ 支持 | 云端构建服务，自动处理原生编译流程 |
| **EAS Submit** — 将应用上传到应用商店的托管服务 | ✅ 支持 | 自动将构建好的应用提交到 Apple App Store 和 Google Play Store |
| **EAS Update** — 即时更新应用的 JavaScript 和资源文件 | ✅ 支持 | 无需重新发布应用即可推送 JavaScript 代码和资源更新（即"热更新"） |

> **术语解释**：
> - **CI/CD**（持续集成/持续交付）：自动化软件构建、测试和部署流程的实践。EAS Build 就是 Expo 提供的 CI/CD 服务。
> - **AAR**（Android Archive）：Android 的库打包格式，类似于 Java 的 JAR 文件，但包含 Android 特有的资源文件。
> - **XCFramework**：Apple 的多架构二进制框架格式，可包含多个平台的编译产物（如 iOS 真机和模拟器）。
> - **Monorepo**（单一代码仓库）：将多个相关项目放在同一个代码仓库中进行管理的策略。

---

## 集成方案 vs 隔离方案

当你将 React Native 集成到现有原生应用时，需要在两种主要方案之间做出选择：**集成方案**（Integrated Approach）和**隔离方案**（Isolated Approach）。最适合你的方案取决于项目的结构、团队的工作流程以及长期目标。

### 集成方案（Integrated Approach）

在集成方案中，你的 React Native 代码**位于现有原生项目内部**。这使得 React Native 代码和原生代码之间能够紧密耦合。

**具体实现方式**：

- 你可以将现有的 Android 或 iOS 原生项目放到 React Native 项目的子目录中。这是一种常见的配置方式，适用于那些先从 React Native 起步、后来添加了原生代码的项目，但同样可以用于现有原生应用。
- 如果你无法使用标准的 `android` 和 `ios` 子目录来存放原生项目，可以通过简单的 monorepo（单一代码仓库）配置，为 React Native 代码设置自定义根目录。

> **基于文档内容推导**：集成方案的核心特征是"代码共存"——原生代码和 React Native 代码在同一个项目中，开发者可以同时修改两者，无需额外的打包或发布步骤。这种方式降低了集成的复杂度，但对原生项目的构建流程有一定影响。

**选择此方案的条件**：

- 你需要频繁地在原生代码和 React Native 代码之间同时迭代开发。
- 你有一个统一的团队，同时负责原生和 React Native 的开发工作。
- 你的项目结构允许直接添加一个 React Native 项目。

### 隔离方案（Isolated Approach）

在隔离方案中，你的 React Native 代码与原生项目**分开开发和维护**，可以放在独立的代码仓库中，也可以放在 monorepo 中。

**具体实现方式**：

- 将 React Native 应用打包成原生库（Android 使用 **AAR** 格式，iOS 使用 **XCFramework** 格式）。
- 然后像集成其他原生依赖一样，将该库集成到你的原生应用中。

**这种方式对原生开发者的好处**：

- 原生开发者**无需搭建 Node.js 环境**。
- **无需处理** React Native 的构建依赖。
- 他们只需将 React Native 部分作为**预构建的产物**（pre-built artifact）来消费即可。

> **术语解释**：
> - **Node.js**：JavaScript 的运行环境，React Native 的开发工具链（如 Metro 打包器）依赖 Node.js 运行。
> - **预构建产物**（Pre-built Artifact）：已经编译打包好的二进制文件，使用者不需要了解其内部构建细节，直接引入即可。
> - **构建依赖**（Build Dependencies）：项目在编译时需要的其他工具、库或环境。React Native 项目需要 Node.js、Metro bundler 等，这些都属于构建依赖。

> **基于文档内容推导**：隔离方案的核心特征是"解耦发布"——React Native 代码被封装为标准原生库，原生团队可以像引入任何第三方 SDK 一样使用它。这种方式对原生构建流程的影响最小，但增加了版本管理和发布流程的复杂度。

**选择此方案的条件**：

- 你有独立的团队分别负责原生开发和 React Native 开发。
- 你希望将 React Native 对现有原生构建流程的影响降到最低。
- 你倾向于将应用中的 React Native 部分视为一个自包含的模块。

---

## 基于经验的方案选择建议

> **基于经验建议**：
>
> 1. **小型团队 / 初创项目**：如果团队规模较小且原生与 React Native 开发由同一批人负责，**集成方案**通常是更好的起点。它配置简单、迭代快速，避免了维护两套构建流程的负担。
>
> 2. **大型团队 / 企业级项目**：如果你的原生应用已有成熟的 CI/CD 流水线，且有专门的原生团队和前端团队，**隔离方案**能更好地隔离风险。原生团队不需要理解 Node.js 生态，只需按版本消费原生库即可。
>
> 3. **渐进式迁移场景**：如果你计划逐步将原生页面迁移到 React Native，集成方案更适合，因为你需要频繁地同时修改原生和 React Native 代码。
>
> 4. **单页面 / 单功能嵌入**：如果只是想在现有应用中嵌入一两个 React Native 页面，隔离方案更合适——打包一次，像普通 SDK 一样引入，对原生项目的侵入性最小。

---

## 下一步行动

根据你选择的方案，请参考以下后续指南：

- **隔离方案**：将 React Native 代码编译为 AAR / XCFramework 产物，然后集成到任意原生应用中。详见 [isolated approach](./39__isolated-approach.md)。
- **集成方案**：配置你现有的原生项目，使其直接使用 React Native 和 Expo。详见 integrated approach（后续文档）。

---

## 文档导航

- **上一页**：[upgrade](./37__upgrade.md)
- **下一页**：[isolated approach](./39__isolated-approach.md)
