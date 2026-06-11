# 在 Expo 应用中使用 BugSnag

## 文档解决的问题

BugSnag 是稳定性监控方案，提供端到端错误报告与分析，帮助团队复现、排序和修复错误。它支持包括 React Native 在内的 50 多个平台。

本文是集成入口，而不是完整教程。它说明 BugSnag 能解决什么问题，并将 Expo 应用的具体接入工作指向 BugSnag 官方 Expo 集成指南。

## BugSnag 的三类价值

### 稳定性管理

通过 release health dashboard、稳定性评分、目标和邮件、Slack、PagerDuty 等告警，帮助团队判断当前更适合开发新功能还是优先修复问题。

### 问题优先级

BugSnag 会按根因分组问题，并结合业务影响、用户分群、A/B 测试和实验结果排序。它不只是记录异常，还用于判断哪些异常最影响用户体验。

### 诊断与修复

平台提供完整堆栈、诊断数据和自动 breadcrumbs。Breadcrumbs 可理解为错误发生前的操作轨迹，用于减少人工复现成本。

## Expo 集成范围

文档明确指出，BugSnag 的 Expo 集成用于：

- 在 Expo 应用中报告 JavaScript 错误
- 为通过 EAS Update 发布的更新上传 Source Map

Source Map 用来把生产 JavaScript 堆栈映射回源码；这与 Web 前端监控中的作用相同，但 EAS Update 是独立的 OTA 发布链路，需要按其集成说明处理更新产物。

## 实际使用路径

1. 新用户先创建 BugSnag 账号，或申请演示。
2. 按本文链接的 BugSnag 官方 Expo integration guide 将 BugSnag 加入应用。
3. 按该指南配置 JavaScript 错误上报。
4. 使用 EAS Update 时，按同一指南配置更新 Source Map 上传。

## React Web 开发者容易误解的地方

- Expo 文档没有在本页给出安装命令、初始化代码或配置文件，不能从本页推断具体包名和参数。
- “全栈支持”描述的是 BugSnag 平台覆盖多种技术栈，不等于本页已经配置了应用后端监控。
- JavaScript 错误上报和 Source Map 上传是两件事；前者成功不代表堆栈一定可读。
- EAS Update 发布的是远程更新，不能直接套用只面向 Web 静态资源或原生商店构建的上传流程。

## 限制与建议

- 当前文档未涉及 Expo Go、development build 或自定义原生代码兼容性。
- 当前文档未提供命令、app config、环境变量、API key、初始化位置、采样、隐私、告警或验证步骤。
- **基于文档内容推导**：接入验收至少应分别验证“错误事件可见”和“EAS Update 的堆栈已正确符号化”，避免把上报成功误当成完整可用。
- **基于经验建议**：生产接入前应根据业务隐私要求检查用户数据、breadcrumbs 和自定义元数据，但这些内容并非当前文档明确说明。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 应用中使用 Sentry](./126_using-sentry.md) | [下一页：在 Expo 应用中使用 LogRocket →](./128_using-logrocket.md)
<!-- NAVIGATION END -->
