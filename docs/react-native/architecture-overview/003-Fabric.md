# 003 Fabric

**翻页：** [上一页：002 About the New Architecture](002-新架构介绍.md) · [目录](README.md) · [下一页：004 Render, Commit, and Mount](004-渲染提交与挂载.md)

**官方页面：** [Fabric · React Native](https://reactnative.dev/architecture/fabric-renderer)  
**源页代码覆盖：** 官方页没有代码片段；内容解释 New Renderer 的目标、动机、收益，以及 C++ core、Codegen、JSI、同步布局和 view flattening 等概念。

## Fabric 是什么

**Fabric** 是 React Native 新架构中的渲染器，负责把 React 组件树转换成 iOS / Android 等宿主平台的原生视图更新。它是旧渲染系统的概念升级：更多渲染逻辑放在共享的 C++ core，并强化 React Native 与 iOS / Android host view 的协作。

可以把它理解为 RN 内部的 UI 渲染管线。业务页面仍然写 React 组件；Fabric 处理组件树、布局和最终原生视图之间的对应关系。日常 app 开发通常不直接调用 Fabric 的内部 C++ API。

## 这套渲染器想改善什么

| 目标 | 对界面开发的意义 |
|---|---|
| 同步、线程安全的布局读取 | 把 RN view 嵌进原生界面时，减少“先显示旧位置、下一帧再跳到新位置”的问题。 |
| 多优先级与同步事件 | 输入、触摸等需要立即响应的操作可以获得更及时处理。 |
| 对齐 React Concurrent Features | 让 RN 能利用 Suspense、Transitions 等 React 并发能力。 |
| C++ 跨平台核心 | 更多渲染逻辑在 Android/iOS 之间共享，降低各平台实现长期偏离的机会。 |
| Codegen 类型检查 | 从 JS/TS 组件声明生成原生 props 结构；属性不匹配可在构建阶段发现。 |
| JSI 直接互操作 | 减少旧桥接层把对象序列化成 JSON 再传递的工作。 |
| 延迟初始化部分 Host Component | 没有用到的原生视图可以晚些创建，有助于降低启动时的工作量。 |

## 渲染与原生平台如何协作

Fabric 的 Shadow Tree 记录 RN 视图和布局信息。宿主平台的 view 仍是真正绘制到屏幕上的 iOS `UIView`、Android `View` 等对象。新渲染器更容易同步测量、计算布局并把更新应用到宿主视图；具体阶段会在下一页 **Render, Commit, and Mount** 逐步展开。

另一个例子是 **view flattening（视图扁平化）**：有些 View 只负责布局或组织子节点，本身并不需要独立绘制。Renderer 可将这类节点合并，减少原生 view 数量。该优化最初为解决 Android 的性能问题发展而来，随后扩展到 iOS；这并不表示每个 React 组件都对应一个原生 view。

## Fabric、JSI、Codegen 的关系

- **Fabric** 是渲染器：重点处理 UI 树、布局和原生视图更新。
- **JSI** 是 JavaScript 与 C++ / 原生层交互的接口：让两端持有对象引用并直接调用能力，减少序列化开销。
- **Codegen** 从 TypeScript / Flow spec 生成原生侧的接口和 props 类型，帮助保持 JS 与宿主视图属性一致。

它们属于同一新架构，但解决的问题不同。JSI 不是渲染器；Codegen 也不是运行时执行 UI 的引擎。

## 性能提示

新架构提供了更好的工具和默认实现，不代表开启后任何 app 都会自动变快。若瓶颈来自不必要的渲染、大列表数据处理或阻塞 JS 线程，仍需修正应用代码。只有当性能瓶颈与旧架构限制相符、并实际使用新架构能力时，才会看到对应收益。

## 关键名词

- **Host platform / host view**：承载 React Native 的平台及其原生视图系统，例如 UIKit 和 Android View。
- **Fabric**：React Native 新架构渲染器。
- **Concurrent Features**：React 的并发渲染能力，如 Transitions 和 Suspense；Renderer 可按优先级安排更新。
- **Codegen**：把 JS/TS 声明生成原生接口代码的工具链。
- **JSI**：连接 JavaScript 与 C++ / 原生对象的接口。
- **View flattening**：将部分没有独立绘制意义的节点合并，减少实际原生 view。

## 官方代码主题覆盖

源页没有代码块或需逐项复刻的配置。文中的同步布局、并发能力、C++ 核心、Codegen、JSI 与 view flattening 均按用途作了中文解释，没有漏掉源页代码示例。

**翻页：** [上一页：002 About the New Architecture](002-新架构介绍.md) · [目录](README.md) · [下一页：004 Render, Commit, and Mount](004-渲染提交与挂载.md)
