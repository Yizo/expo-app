# React Native 架构概览补充模块

从 [Architecture Overview 官方入口](https://reactnative.dev/architecture/overview) 开始，按页面底部 Next 顺序整理。来源仅限 React Native 官方文档。中文内容是概念释义，示例（若有）会重写，不做逐字转录。架构栏目定位为理解 RN 内部实现的阅读资料，主要面向库作者/核心贡献者；普通 app 工程师不需要先掌握全部内部细节才能开发。

## 当前覆盖与翻页

| 页码 | 主题 | 官方来源 | 上一页 | 下一页 |
|---|---|---|---|---|
| [001](001-Architecture-Overview.md) | Architecture Overview | [官方页](https://reactnative.dev/architecture/overview) | [目录](README.md) | [002 About the New Architecture](002-新架构介绍.md) |
| [002](002-新架构介绍.md) | About the New Architecture | [官方页](https://reactnative.dev/architecture/landing-page) | [001 Architecture Overview](001-Architecture-Overview.md) | [003 Fabric](003-Fabric.md) |
| [003](003-Fabric.md) | Fabric | [官方页](https://reactnative.dev/architecture/fabric-renderer) | [002 About the New Architecture](002-新架构介绍.md) | [004 Render, Commit, and Mount](004-渲染提交与挂载.md) |
| [004](004-渲染提交与挂载.md) | Render, Commit, and Mount | [官方页](https://reactnative.dev/architecture/render-pipeline) | [003 Fabric](003-Fabric.md) | [005 Cross Platform Implementation](005-跨平台实现.md) |
| [005](005-跨平台实现.md) | Cross Platform Implementation | [官方页](https://reactnative.dev/architecture/xplat-implementation) | [004 Render, Commit, and Mount](004-渲染提交与挂载.md) | [006 View Flattening](006-View-Flattening.md) |
| [006](006-View-Flattening.md) | View Flattening | [官方页](https://reactnative.dev/architecture/view-flattening) | [005 Cross Platform Implementation](005-跨平台实现.md) | [007 Threading Model](007-Threading-Model.md) |
| [007](007-Threading-Model.md) | Threading Model | [官方页](https://reactnative.dev/architecture/threading-model) | [006 View Flattening](006-View-Flattening.md) | [008 Bundled Hermes](008-Bundled-Hermes.md) |
| [008](008-Bundled-Hermes.md) | Bundled Hermes | [官方页](https://reactnative.dev/architecture/bundled-hermes) | [007 Threading Model](007-Threading-Model.md) | [009 Glossary](009-术语表.md) |
| [009](009-术语表.md) | Glossary | [官方页](https://reactnative.dev/architecture/glossary) | [008 Bundled Hermes](008-Bundled-Hermes.md) | 官方 Next 终点 |

当前连续整理到第 009 页，共 9 页；Glossary 页面只有 Previous，没有 Next，因此此模块到达官方导航终点。

## 代码覆盖

- 001：官方概览页没有代码示例，本文已明确注明。
- 001、003、005、007、009 的源页没有代码示例，均有说明；006 源页含组件组合的 JSX 示例，本文重写了嵌套 `View` 的布局示例并说明哪些节点可被扁平化。002 覆盖 tooltip 同步/异步测量、transition、新架构开关及 CocoaPods；004 覆盖首次渲染 JSX、状态更新、Render/Commit/Mount 和 C++ State 数据流；008 补充对照 Hermes 旧 AAR 与 Bundled Hermes Gradle 依赖，并覆盖 Android 构建任务、Windows 编译命令及 iOS 源码构建命令，历史配置均有版本说明。

导航说明：每篇编号页顶部和底部都有上一页、目录和下一页相对链接。模块按 Next 单链遍历，侧栏目录中的其它条目作为后续 Next 页面处理。
