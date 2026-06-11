# Expo 推送通知服务选型

> 来源：<https://docs.expo.dev/guides/using-push-notifications-services.md>（页面标注更新日期：2026-05-23）

## 文档解决的问题

Expo 应用可以使用 Expo 推送服务、第三方客户互动平台，或由自己的后端直接调用 FCM/APNs。本文对这些方案的能力、限制和集成方式做选型概览。

Android 的平台推送服务是 FCM，iOS 最终通过 APNs 投递。`expo-notifications` 提供跨 Android/iOS 的客户端 API，但不同服务端提供商可能有自己的原生 SDK和高级能力。

## Expo 的兼容边界

Expo 应用可以接入任意通知服务或 Android/iOS 通知能力。若生态中没有现成包，可以使用 Expo Modules API 编写原生代码，并用 config plugin 自动化原生项目配置。

`expo-notifications` 已针对 Expo 推送服务，以及直接来自 FCM 和 APNs 的通知进行设计和测试。第三方提供商通常有自己的原生/React Native SDK，因此部分高级功能可能与 `expo-notifications` 不兼容。

## 方案一：Expo Push Notifications

Expo Notifications 提供统一的 Android/iOS API，与 Expo 账户集成且免费使用。

核心能力：

- 与 `expo-notifications` 完整兼容。
- EAS Dashboard 可跟踪发送到 FCM 和 APNs 的投递情况。
- 可使用 Expo Notifications Tool 测试通知。

限制：

- 用于给 iOS 通知附加图片等内容的 Notification Service Extension 尚未正式内置，但可通过 config plugin、自定义原生代码和配置加入。
- 每个项目的发送量限制为每秒 600 条通知。

## 第三方客户互动平台

### OneSignal

提供推送、应用内消息、短信和邮件，支持富媒体通知与互动分析，并有 Expo config plugin。

### Braze

提供跨渠道个性化消息、富通知、推送活动，以及 Android 投递失败后的重发能力。提供 React Native SDK、config plugin 和 Expo 示例应用。

### Customer.io

通过可视化工作流组织推送、应用内消息、邮件和短信等自动化活动，可收集设备侧指标并按用户行为和偏好定制推送。提供 Expo plugin，也支持与其他提供商搭配使用的文档。

### CleverTap

提供实时全渠道消息、分群、分析和活动自动化。其 React Native SDK 与 Expo config plugin 配合，插件会在 prebuild 期间处理原生模块设置，使配置可集中在 app config 中。

## 直接调用 FCM 与 APNs

后端可以绕过 Expo 推送服务，分别调用平台 API。客户端仍可使用 `expo-notifications` 获取原生 push token，并按平台配置通知；服务端则必须分别实现 FCM 和 APNs 逻辑。

这类似 Web Push 中前端负责订阅信息、后端负责实际发送，但移动端有两个平台推送体系，凭据和消息格式不能假设完全相同。

## React Native Firebase Messaging

React Native Firebase 的 messaging 模块可把 FCM 作为 Android/iOS 的统一服务。虽然 FCM 常被理解为 Android 推送，Firebase 也能在 iOS 上接收请求并在底层路由到 APNs。

因此，“统一使用 FCM”不表示绕过了苹果推送基础设施；iOS 通知仍然经过 APNs，只是路由由 Firebase 管理。

## 关键限制与实践建议

- 不要混用多套客户端通知实现，不同服务的原生集成可能冲突。
- Expo Notifications 不支持 Web 通知；部分第三方服务可能支持，选型时应单独确认 Web 需求。
- 数据库应同时跟踪 Expo push token 与原生 device token，为将来切换服务或接入直接使用 FCM/APNs 的营销工具保留空间。
- 当前文档未涉及权限请求、token 获取代码、服务端发送代码、凭据配置、深链点击处理、通知渠道和消息负载格式。

**文档明确说明：**`expo-notifications` 最适配 Expo 推送和直接 FCM/APNs；第三方高级能力可能要求其专用 SDK；Expo 推送有每秒 600 条/项目限制且不支持 Web 通知。

**基于文档内容推导：**小规模、跨平台且不需要复杂营销自动化的项目可优先评估 Expo Push；需要用户分群、跨渠道活动或富媒体运营时，应评估第三方平台；需要完全控制基础设施时再承担分别维护 FCM/APNs 服务端逻辑的成本。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 中实现应用内购买](./140_in-app-purchases.md) | [下一页：在 Expo 中使用 ESLint 与 Prettier →](./142_using-eslint.md)
<!-- NAVIGATION END -->
