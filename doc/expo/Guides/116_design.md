# Expo Modules API 的设计考量

> 对应原文：<https://docs.expo.dev/modules/design.md>

## 这篇文档解决什么问题

这篇文档不是 Expo Modules API 的使用教程，而是解释它为什么被设计成现在的样子。Expo 团队长期维护大量原生模块，发现跨 iOS、Android 和 JavaScript 运行时开发时，类型错误、数据转换、生命周期接入以及 React Native 架构迁移都会持续增加维护成本，因此设计了一套更统一的原生模块 API。

适合以下场景阅读：

- 需要开发或维护 Expo/React Native 原生模块。
- 想理解为什么 Expo Modules API 主要使用 Swift 和 Kotlin。
- 需要评估一个模块如何兼容 React Native 新旧架构。
- 从 React Web 转向移动端，希望理解 JavaScript 与原生代码之间的边界。

## 背景：原生模块与 Web 组件的差异

React Web 通常直接调用浏览器 API，而 React Native 中某些能力必须由 iOS 或 Android 原生代码提供。原生模块就是 JavaScript 与 Swift/Kotlin 等平台代码之间的桥梁。问题在于，两端语言、类型系统、对象模型和生命周期不同，数据跨运行时传递时很容易出错。

Expo Modules API 的目标不是消除平台差异，而是在无法避免差异的前提下，提供尽量一致的 API 和文档，使一个开发者更容易同时维护多个平台。

## 使用现代原生语言与类型能力

Expo 团队在维护 50 多个 SDK 原生模块后发现，很多问题来自未处理的空值或错误类型。Objective-C 的动态特性和缺少可选类型，使部分错误无法在编译期发现；Swift 的类型系统可以更早暴露这些问题。Android 侧同理，Expo Modules 选择 Kotlin，而不是围绕旧式语言能力设计。

因此，该生态从一开始就面向 Swift 和 Kotlin。对 React Web 开发者来说，可以把它理解为：尽量让原生层获得类似 TypeScript 静态检查的保护，而不是把错误推迟到应用运行时。

## 让数据安全地跨运行时传递

JavaScript 调用原生函数时，Expo Modules API 知道原生函数期望的参数类型，因此可以在调用前验证并转换参数。

原文重点说明了以下能力：

- 自动处理布尔值、整数、无符号整数、浮点数、字符串和 Pair 等基础类型。
- 支持 `URL`、`CGPoint`、`UIColor`、`Data`、`java.net.URL`、`android.graphics.Color`、`kotlin.ByteArray` 等平台类型。
- 使用 `Record` 表达用户定义的数据结构，作用类似 Swift `struct`、Kotlin/Java 对象或 TypeScript 中的结构化对象。
- 支持枚举和可扩展的类型转换。
- 可把 `{ x: number, y: number }` 或 `[number, number]` 自动转换为 iOS 的 `CGPoint`。

这主要解决了手动解析 `NSDictionary` 或 `ReadableMap` 的问题：这些容器在运行时并不知道每个字段的具体类型，开发者若逐字段验证，会产生重复、易错且难维护的代码。

## 用 Shared Objects 表达面向对象 API

Expo Modules API 支持 **Shared Objects（共享对象）**。它的设计目标是让原生模块状态只保留一个事实来源，而不是在 JavaScript 和原生层各保存一份状态，再手动同步。

原文以 `expo-sqlite` 的数据库实例为例：数据库实例由 Shared Object 支撑。对 Web 开发者而言，它更接近“JavaScript 持有一个指向原生资源的对象句柄”，而不是每次调用都传递一份普通 JSON 状态。

当前文档明确说明：Shared Objects 的详细文档仍将后续提供，因此本页没有给出其声明语法、生命周期规则或完整 API。

## 以可组合方式接入应用生命周期

原生库经常需要响应应用启动、前后台切换等生命周期事件。Expo Modules API 提供：

- Android lifecycle listeners。
- iOS AppDelegate subscribers。

这些机制让模块不必要求使用者把代码散落到 Android `MainActivity` 或 iOS `AppDelegate` 中。多个库可以各自订阅所需事件，而不需要彼此了解具体实现。

这对 Continuous Native Generation（CNG，持续原生工程生成）尤其重要：原生工程可能由配置重新生成，库若依赖手工修改入口文件，改动容易丢失或互相冲突；可组合订阅机制更适合自动生成流程。

## 同时支持 React Native 新旧架构

React Native 0.68 引入的新架构包含：

- **Turbo Modules**：新的原生模块系统。
- **Fabric**：新的渲染系统。

Fabric 没有为旧式 View Manager 提供兼容层，因此旧组件不能直接运行在 Fabric 上，Fabric 组件也不能直接用于旧渲染器。库在过渡期若分别维护两套实现，会增加技术债务。

新架构大量使用 C++。原文指出，C++ 与日常使用的高层 JavaScript 差异很大，还可能增加构建时间，尤其是 Android 构建，并提高调试难度。

Expo Modules API 因此以“与渲染器无关”为设计目标：模块无需知道应用运行在新架构还是旧架构，从而降低库作者的适配成本。

## 限制、易误解点与实践建议

- 统一 API 不等于 iOS 与 Android 完全相同。原文明确承认平台语言和范式差异无法彻底消除。
- 类型自动转换不等于所有 JavaScript 值都能无条件传入原生层；转换依赖原生函数声明的目标类型和 Expo Modules 支持的转换规则。
- Shared Objects 不是 React 状态管理方案。它解决的是 JavaScript 与原生资源之间的对象和状态归属问题。
- 生命周期订阅机制服务于原生模块接入，不等同于 React 组件的 `useEffect` 生命周期。
- “兼容新旧架构”是 Expo Modules API 的设计目标，不代表任意第三方原生代码都自动兼容。

**基于文档内容推导：** 新建跨平台原生模块时，应优先把类型声明、数据转换和状态所有权放在 Expo Modules API 提供的抽象中，避免自行维护松散的字典解析、双端状态副本和入口文件补丁。这样更符合该 API 降低长期维护成本的设计方向。

## 当前文档未涉及

本页未提供创建模块的命令、目录结构、具体 API 声明语法、测试方式、发布流程或 Shared Objects 的完整用法。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo Modules 中 Mock 原生调用](./115_mocking.md) | [下一页：Expo 推送通知服务概览 →](./117_overview.md)
<!-- NAVIGATION END -->
