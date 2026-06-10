# Expo Modules API 概览

> 对应文档：`https://docs.expo.dev/modules/overview.md`（页面修改日期：2026-05-23）

## 这篇文档解决什么问题

本文解释 Expo Modules API 的定位：当现成 React Native 库无法满足需求时，如何用 Swift 和 Kotlin 把原生能力封装成 JavaScript 可调用的模块或 React Native 可渲染的原生视图。

适合需要接入公司指定原生 SDK、冷门系统能力或自定义原生 UI 的开发者。大多数普通 Expo/React Native 应用并不需要自己写原生代码，因为相机、视频、地图、触觉反馈等常见能力已有库可用。

## 核心概念

- **原生模块**：把 Android/iOS 的方法、属性和事件暴露给 JavaScript，类似 Web 项目调用浏览器 API，但实现位于 Kotlin/Swift。
- **原生视图**：把 Android `View` 或 iOS `UIView` 封装成 React 组件。
- **Expo Modules API**：尽量统一 Android 与 iOS 的声明方式，减少样板代码，并使用现代 Swift/Kotlin 能力。
- **新架构与旧架构**：Expo 模块支持 React Native New Architecture，同时自动向后兼容仍使用旧架构的 React Native 应用。
- **JSI**：JavaScript 与原生代码直接交互的接口。Expo Modules API 与 Turbo Modules 都使用 JSI，而不是旧式 JSON 消息队列 bridge。

## 与 Turbo Modules 如何选择

文档转述 React Native 团队的建议：

- 原生模块需要使用 C++、需要更容易接触底层机制时，选择 Turbo Modules。
- 更重视开发体验，并能接受模块依赖 `expo` 包时，选择 Expo Modules API。

二者的性能特征相近。文档指出，实际业务里原生方法体的执行时间通常远大于调用本身的开销；两种 API 每秒都能完成数十万次原生方法调用，调用边界通常不是瓶颈。

## 使用影响

- **应用体积**：引入 Expo Modules API 通常只增加几百 KB，文档称影响可忽略。
- **性能**：与 Turbo Modules 相近，不以追求理论上的最低单次调用开销为首要目标，而是在实际场景中保持足够快。
- **平台**：主要面向 Android、iOS 和 Web；macOS 与 tvOS 支持仍是实验性能力。

## React Web 开发者容易误解的地方

1. React Native 不是把 DOM API 换一套组件名。访问未被 React Native 暴露的系统能力，需要编写或安装原生模块。
2. Expo 不等于“不能写原生代码”。Expo Modules API 正是 Expo 提供的原生扩展机制。
3. 模块支持 Web 不代表同一份 Swift/Kotlin 能在浏览器运行；Web 通常需要单独的 TypeScript/JavaScript 实现。
4. JSI 性能好不意味着可以忽略原生方法内部的耗时、线程和资源使用。

## 实践建议

- 先确认 Expo SDK、React Native 社区或公司内部是否已有维护良好的库，再决定自建模块。
- 需要 C++ 才优先考虑 Turbo Modules；普通 Swift/Kotlin 封装通常优先 Expo Modules API。
- 学习实现方式时，可参考 Expo SDK 和开源应用中的模块。原文还列出多个社区模块作为参考。
- 如果遇到明确的 Expo Modules API 性能瓶颈，文档建议向 Expo 提交 issue 讨论。

## 文档边界

**文档明确说明**：API 定位、常见适用场景、与 Turbo Modules 的选择建议、架构兼容性、JSI 性能特征、体积影响和实验性平台支持。

**基于文档内容推导**：对多数 React Web 团队，最合理的决策顺序是“现成库 → Expo Modules API → 仅在需要 C++ 时考虑 Turbo Modules”。

**当前文档未涉及**：具体脚手架命令、模块目录结构、Swift/Kotlin API 语法、构建签名、商店发布和调试方法。
