# React Native 与 Expo 中文学习文档

这份本地文档面向熟悉 React、正在学习 React Native 和 Expo 的前端工程师。每个独立的官方文档入口都有自己的模块目录和索引，编号页之间可用“上一页 / 目录 / 下一页”连续阅读。

## React Native

- [React Native 主文档 Next 链](./react-native/README.md)：从 Getting Started 开始，理解核心组件、布局、平台代码、调试、性能与原生模块等主题。
- [ActivityIndicator 组件起点链](./react-native/activity-indicator/README.md)：从组件参考继续沿官方 Next 阅读。
- [AccessibilityInfo API 起点链](./react-native/accessibility-info/README.md)：从无障碍 API 继续沿官方 Next 阅读。
- [Architecture Overview 架构链](./react-native/architecture-overview/README.md)：从新架构总览继续阅读 renderer、线程模型和术语。

## Expo

- [Expo 主文档 Next 链](./expo/README.md)：从创建项目开始，学习开发环境、界面、插件、调试、分发与 Expo 核心概念。
- [Guides Overview 起点链](./expo/guides-overview/README.md)：从官方 Guides 总览开始。
- [EAS 起点链](./expo/eas/README.md)：从 Expo Application Services 总览开始。
- [Expo SDK `versions/latest` 参考链](./expo/versions-latest/README.md)：沿官方 Next 整理 SDK 配置与 API、第三方库、技术规范及 Expo CLI 工具；有版本化文档时标注与项目 SDK 56 的差异。
- [Tutorial Overview 起点链](./expo/tutorial-overview/README.md)：从 Expo / EAS 教程概览开始。

## 阅读说明

- 笔记使用中文解释关键概念并保留官方代码示例主题。实际 API 可用性以项目锁定的 Expo / React Native 版本和相应官方版本文档为准。
- React Native 官方 Next 入口目前指向 RN 0.87，而该项目使用 Expo SDK 56（配套 RN 0.85）；两条参考不代表相同运行时版本。
- 每个模块的 README 记录官方页面链、页码及终点状态。若 Next 链回到已覆盖页，则在重复处停止；无 Next 的页面标记为链终点。
