# Expo 与 React Native 功能开关服务

> 来源：<https://docs.expo.dev/guides/using-feature-flags.md>（页面标注更新日期：2026-02-03）

## 功能开关解决什么问题

功能开关（feature flag，也称 feature gate）允许远程开启或关闭功能，而不必为了改变启用状态再次部署代码。适合逐步发布、生产环境测试、A/B 测试，以及控制新 UI 或新功能的可见范围。

对 React Web 开发者来说，它与 Web 端远程配置或实验平台类似；移动端的额外价值是避免仅为切换已内置功能而等待应用商店发布。但开关只能控制应用中已经存在的代码，当前文档没有声称它能远程下发任意新代码。

## Expo 集成背景

页面列出的服务均对 Expo 应用提供较成熟的支持，并可结合 Continuous Native Generation（CNG）和 config plugins 完成必要的原生集成。CNG 表示原生工程可由配置和依赖重新生成；config plugin 用于自动修改原生项目配置。

当前文档是服务选型概览，不提供安装命令、应用配置、SDK 初始化代码或完整实验流程。

## 可选服务

### PostHog

开源产品分析平台，把功能开关、分析、会话录制和 A/B 测试放在同一产品中。支持实时切换、用户分群、即时回滚、内置 A/B 与多变量实验，并能收集功能采用率和性能指标。其 bootstrap flags 可减少等待远程开关加载时的中间状态。

适合希望统一产品分析与功能管理的团队。

### Statsig

面向数据驱动产品开发，强调高级统计分析、渐进式发布、复杂定向、内置指标和发布性能监控。React Native/Expo SDK 支持自动事件记录和动态配置。

适合重视严谨实验和统计决策的团队。

### LaunchDarkly

企业级功能管理平台，支持即时切换、定向发布、仪表盘控制和实时更新。SDK 还提供 React hooks、上下文识别与修改、日志、多环境、私有属性以及 relay proxy 配置。

适合需要复杂环境管理、安全控制和企业级治理的团队。

### Firebase Remote Config

通过 Firebase Console 管理远程值，并由 JavaScript API 决定何时、如何影响应用。支持按用户属性、应用版本和自定义属性进行条件定向，也支持实时更新。

文档指向 React Native Firebase Remote Config，因此接入会涉及 React Native Firebase 的原生能力，而不是仅凭 Firebase Web SDK 即可完成。

## 选择时应关注什么

**文档明确说明：**

- PostHog 强调分析、录屏与实验一体化。
- Statsig 强调统计分析和数据驱动实验。
- LaunchDarkly 强调企业级定向、环境与安全能力。
- Firebase Remote Config 强调 Firebase 控制台、条件定向与实时配置。

**基于文档内容推导：**选择不应只比较“能否返回布尔值”，还应比较现有分析栈、实验严谨度、用户分群、回滚速度、环境隔离和原生集成成本。若团队已经深度使用某个平台的分析体系，使用同平台开关通常能减少身份与事件数据对接。

## 限制、坑点与未涉及内容

- 远程开关加载可能带来初始 UI 闪烁；页面仅明确提到 PostHog 的 bootstrap flags 可改善加载状态。
- 功能开关不应被误当作权限校验。当前文档未讨论安全边界，服务端敏感操作仍不能只依赖客户端开关。
- 当前文档未涉及离线默认值、缓存、开关命名、生命周期治理、费用、隐私合规、SDK 安装步骤和测试策略。
- 页面没有给出统一推荐或排名，应根据团队需求选型，而不是推断 Expo 官方只支持其中某一家。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 中通过 Resend 发送邮件](./138_using-resend.md) | [下一页：在 Expo 中实现应用内购买 →](./140_in-app-purchases.md)
<!-- NAVIGATION END -->
