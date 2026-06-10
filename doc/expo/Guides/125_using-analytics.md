# Expo 与 React Native 中的 Analytics SDK 选择概览

> 对应原文：<https://docs.expo.dev/guides/using-analytics.md>

## 文档解决的问题

Analytics 服务用于记录用户如何与应用交互，让团队基于数据改进产品。本页不是某个 SDK 的接入教程，而是列出 Expo/React Native 生态中常见的分析服务，并说明 Expo Go 对原生 SDK 的限制。

对 React Web 开发者来说，核心目标与网页埋点相同：记录事件、用户行为和产品使用情况。主要差别是很多移动端 Analytics SDK 依赖 iOS/Android 原生代码，不能只安装一个纯 JavaScript 包后立即在 Expo Go 中运行。

## Expo Go 与 development build

大多数 Analytics SDK 需要配置自定义原生代码，而 Expo Go 不能修改其内置原生代码。因此，通常需要创建 development build，才能使用下列服务。

development build 可以理解为包含项目所需原生依赖的专用开发版应用；Expo Go 则是通用客户端，只预装固定能力。

原文明确标记 Aptabase、Astrolytics 和 PostHog 可在 Expo Go 中工作。其他列出的服务没有在本页中被标记为支持 Expo Go。

## 文档列出的服务

| 服务 | 本页给出的定位 | Expo Go 说明 |
| --- | --- | --- |
| Google Firebase Analytics | 通过 React Native Firebase Analytics 集成 | 本页未标记支持 Expo Go |
| Segment | 使用 Segment React Native Analytics SDK | 本页未标记支持 Expo Go |
| Amplitude | 使用 TypeScript React Native SDK | 本页未标记支持 Expo Go |
| AWS Amplify | 使用 Amplify Analytics | 本页未标记支持 Expo Go |
| Vexo | React Native Analytics 服务 | 本页未标记支持 Expo Go |
| Aptabase | React Native Analytics 服务 | 明确支持 Expo Go |
| Astrolytics | React Native Analytics 服务 | 明确支持 Expo Go |
| PostHog | React Native library | 明确支持 Expo Go |
| Dreambase | 面向 Expo 与 Supabase 项目的用户行为和性能分析 | 本页未标记支持 Expo Go |

## 如何理解这份列表

这是一份常见提供商概览，不是功能横向评测。原文没有比较价格、隐私合规、数据归属、事件模型、离线缓存、自动采集、性能、会话回放或供应商锁定，也没有声明列表穷尽了所有选择。

“Works with Expo Go”只表示该服务能在 Expo Go 场景工作，不表示它一定最适合生产项目，也不表示其他服务不能用于 Expo；多数其他服务可通过 development build 使用。

## 实际开发建议

**基于文档内容推导：** 选择服务前应先确认团队的开发运行方式：

- 如果必须继续使用 Expo Go，应优先验证页面明确标记支持的 Aptabase、Astrolytics 或 PostHog。
- 如果项目可以使用 development build，则可把原生依赖纳入构建，再根据业务需求评估更广泛的服务。
- 不应仅根据这份列表决定供应商，因为本页没有提供功能、成本和合规比较；需要进入各服务对应文档继续确认。

对于从 React Web 迁移的团队，还应把“SDK 是否依赖原生代码”加入技术选型检查。网页 SDK 能运行不代表同一供应商的 React Native SDK 也是纯 JavaScript 实现。

## 配置、命令与限制

本页只明确说明需要 development build，并未给出创建命令、包安装命令、app config、原生配置、事件上报代码或环境变量示例。具体集成步骤应使用各提供商链接的文档。

## 当前文档未涉及

当前页面未涉及：统一事件命名规范、用户身份关联、隐私授权、GDPR/CCPA、数据脱敏、离线队列、调试验证、生产发布、多个 Analytics SDK 共存，以及各服务的优缺点或价格。

