# 053 Native Platform

**翻页：** [上一页：052 The Codegen CLI](052-TheCodegenCLI.md) · [目录](README.md) · [下一页：054 Native Modules: Introduction](054-NativeModulesIntroduction.md)

**官方页面：** [Native Platform · React Native](https://reactnative.dev/docs/native-platform)  
**源页代码覆盖：** 官方页没有代码块。它区分无 UI 的 Native Modules 与带 UI 的 Native Components，并说明旧 API 与 New Architecture 的迁移关系。

## 为什么会进入 Native Platform

RN 内置 API 和社区库可解决大多数常见需求。若应用还要调用一个 RN/第三方库没有暴露的系统能力，或要复用既有 Objective-C/Swift、Java/Kotlin、C++ 实现，可通过 Native Platform 把原生代码接到 JavaScript。

## Native Module 与 Native Component

- **Native Module（原生模块）** 提供没有可见 UI 的平台能力，JS 侧以函数/对象调用。例如安全存储、通知或网络事件能力。
- **Native Component（原生组件）** 把平台的 view、widget 或 controller 暴露为 React 组件，让它可以作为组件树的一部分渲染和接收 props/events。

用 Web 概念类比：原生模块更像由 JS 调用的系统服务 API；原生组件更像用 React 包装的原生 UI 控件。它们都不是普通 JavaScript 实现，而是有平台端代码。

## New Architecture 与旧 API

旧 Native Module/Native Component API 已弃用，但 RN New Architecture 仍提供兼容层，让一些旧库可继续工作。新开发优先使用支持 New Architecture 的库，升级依赖，或把自己的原生能力迁到 Turbo Native Modules / Fabric Native Components。

- **Turbo Native Module** 是新架构下的原生模块实现方式，通常由 Codegen 根据类型化 spec 生成接口与 glue code。
- **Fabric Native Component** 是新架构下自定义原生 UI 组件的实现方式，也由 Codegen 生成平台连接代码。

两种方式会涉及 Xcode、Gradle、原生语言和构建配置；大多数业务 App 应先查社区库是否已经封装好所需能力，不必自行创建原生模块。

**翻页：** [上一页：052 The Codegen CLI](052-TheCodegenCLI.md) · [目录](README.md) · [下一页：054 Native Modules: Introduction](054-NativeModulesIntroduction.md)
