# 使用推送通知服务

> **原文地址**：[https://docs.expo.dev/guides/using-push-notifications-services/](https://docs.expo.dev/guides/using-push-notifications-services/)

本文介绍与 Expo 和 React Native 应用兼容的推送通知服务。了解各种推送通知方案的特性、集成方式和注意事项，帮助你为项目选择合适的推送服务。

---

## 概述

Expo 应用可以使用 Android 和 iOS 操作系统提供的**任意通知服务**或**任意通知功能**。即使某个功能还没有现成的包，你也可以通过 [Expo Modules API](https://docs.expo.dev/modules/overview/) 编写原生代码来实现它，并使用 [config plugins（配置插件）](https://docs.expo.dev/config-plugins/introduction/) 自动化原生项目配置。

以下各方案都提供了专门构建的 Expo 集成，包括必要的配置插件，用于在应用中实现推送通知功能。

> **注意**：[`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) 库的设计和测试是针对 Expo 自带的推送通知服务，以及直接从 FCM（Firebase Cloud Messaging）和 APNs（Apple Push Notification service）发送的通知。一些高级功能可能与第三方提供商不兼容，因为这些提供商通常有自己专门优化的原生 SDK 和 React Native SDK。

---

## Expo 推送通知（Expo Push Notifications）

[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) 提供了一个统一的 API，用于跨 Android 和 iOS 处理推送通知。它与你的 Expo 账号无缝集成，并且**免费使用**。

### 核心能力

- 与 [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) 库完全兼容
- 包含 EAS 仪表盘（Dashboard），可追踪通知到 FCM 和 APNs 的投递状态
- 支持使用 [Expo Notifications Tool](https://expo.dev/notifications) 测试通知

### 注意事项和限制

- **iOS Notification Service Extension**（用于向通知添加额外内容，如图片）**未被正式包含**，但你可以通过配置插件配合自定义原生代码和配置来添加它。可参考 [示例 PR](https://github.com/expo/expo/pull/36202)。
- **发送量限制**：每个项目每秒最多 600 条通知。

如需了解具体实现细节，请参阅以下指南：

- **[Expo 推送通知概览](https://docs.expo.dev/push-notifications/overview)**：深入了解 Expo 推送通知的工作原理。
- **[Expo Notifications 服务端 SDK 选项](https://docs.expo.dev/push-notifications/sending-notifications/#send-push-notifications-using-a-servers)**：了解如何通过服务端发送推送通知。

---

## OneSignal

[OneSignal](https://onesignal.com/) 是一个客户互动平台，为 Web 和移动应用提供推送通知、应用内消息、短信（SMS）和电子邮件服务。OneSignal 支持通知中的富媒体内容，并提供用户参与度分析功能。

它提供了 [Expo 配置插件](https://github.com/OneSignal/onesignal-expo-plugin)，可以直接集成到你的 Expo 项目中。

**集成指南**：[OneSignal Expo SDK 设置](https://documentation.onesignal.com/docs/react-native-expo-sdk-setup) —— 按照此指南逐步设置如何在 Expo 项目中集成 OneSignal。

---

## Braze

[Braze](https://www.braze.com/) 是一个客户互动平台，通过推送通知、应用内消息、电子邮件、短信和 Web 提供个性化的跨渠道消息传递。Braze 支持富通知内容、推送通知活动（Campaign），以及在 Android 上发送失败后的**重试机制**。

它提供了 [React Native SDK](https://github.com/braze-inc/braze-react-native-sdk) 和 [配置插件](https://github.com/braze-inc/braze-expo-plugin/tree/main)。你可以查看 [Expo 示例应用](https://github.com/braze-inc/braze-expo-plugin/tree/main/example) 了解更多细节。

**集成指南**：[Braze Expo 设置](https://www.braze.com/docs/developer_guide/sdk_integration?sdktab=react%20native) —— 按照此指南逐步设置如何在 Expo 项目中集成 Braze。

---

## Customer.io

[Customer.io](http://Customer.io) 是一个客户互动平台，允许你利用推送通知、应用内消息、电子邮件、短信等功能设计强大的自动化工作流。其**可视化工作流构建器**可以让你跨多个渠道自动化复杂的、数据驱动的活动。

Customer.io 支持设备端指标收集，可用于定制基于用户行为和偏好的推送通知。它提供了 [Expo 插件](https://github.com/customerio/customerio-expo-plugin) 用于直接集成到你的 Expo 项目中，还提供了与其他推送通知提供商并行使用 Customer.io 的文档。

**集成指南**：[Customer.io Expo 快速入门指南](https://docs.customer.io/sdk/expo/quick-start-guide/) —— 按照此指南逐步设置如何在 Expo 项目中集成 Customer.io。

---

## CleverTap

[CleverTap](https://clevertap.com/) 是一个一体化的客户互动平台，帮助你实现跨推送通知、应用内消息、电子邮件等渠道的个性化、实时、全渠道消息传递。它提供高级用户细分、分析和活动自动化功能，并具备可扩展性。

[CleverTap React Native SDK](https://developer.clevertap.com/docs/react-native) 和 [Expo 配置插件](https://github.com/CleverTap/clevertap-expo-plugin) 使得在 Expo 项目中集成 CleverTap 变得简单。配置插件会在 **prebuild（预构建）过程**中处理所有原生模块的设置，让你可以通过应用配置（app config）来配置 CleverTap，无需手动修改原生代码。

如需了解更多信息，请查看 [CleverTap 示例插件](https://github.com/CleverTap/clevertap-expo-plugin/tree/main/CTExample)。

**集成指南**：[CleverTap Expo 插件文档](https://developer.clevertap.com/docs/clevertap-expo-plugin) —— 按照此指南在 Expo 或 React Native 项目中设置 CleverTap。

---

## 直接通过 FCM 和 APNs 发送通知

你可以选择从后端**直接向平台推送 API 发送通知**。在这种情况下，你仍然可以使用 [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) 来获取原生推送令牌（native push token），并为每个平台分别配置通知。

虽然客户端代码使用 `expo-notifications` 仍然保持跨平台，但你需要在**服务端实现逻辑**来分别与 [FCM（Firebase Cloud Messaging）](https://firebase.google.com/docs/cloud-messaging) 和 [APNs（Apple Push Notification service）](https://developer.apple.com/documentation/usernotifications) 的 API 进行交互。

> **基于文档内容推导**：这种方案适合已有成熟后端推送基础设施的团队，可以完全掌控通知发送流程，但需要自行处理 FCM 和 APNs 两套 API 的差异和认证机制。

---

## React Native Firebase Messaging

[React Native Firebase](https://rnfirebase.io/) 提供了一个 messaging 模块，让你可以使用 [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) 作为 Android 和 iOS 的统一推送通知服务。

虽然 FCM 通常与 Android 通知关联，但它也支持 iOS——FCM 会在后台自动将消息通过 Apple Push Notification service (APNs) 路由到 iOS 设备。

这种方式与"仅将 FCM 用于 Android 通知"不同。在这里，Firebase 的跨平台 SDK 通过**单一服务**处理两个平台的通知。

> **注意**：即使 FCM 同时处理两个平台的通知，iOS 通知仍然会通过 APNs 发送。Firebase 会自动管理这一路由过程。了解更多详情请参阅 [React Native Firebase messaging 文档](https://rnfirebase.io/messaging/usage)。

---

## 重要提示和建议

以下是使用推送通知时的关键注意事项：

### 1. 避免混用客户端实现

不同的通知服务可能有**相互冲突的客户端实现**。请保持一致的方案，以防止潜在的问题。

> **基于经验建议**：在项目初期就确定使用哪一种推送通知方案，后期切换的成本很高，且容易引发难以排查的 Bug。

### 2. Web 通知

Expo 通知**不支持 Web 端通知**。不过，一些第三方方案可能提供这一功能。在选择服务时，请考虑你的应用是否需要 Web 推送能力。

### 3. 令牌管理

在你的数据库中同时追踪 **Expo 推送令牌**（Expo push tokens）和**原生设备令牌**（native device tokens）。这为未来的集成提供了灵活性，特别是与那些直接通过 FCM 或 APNs 发送通知的营销工具集成时。

> **基于文档内容推导**：Expo push token 用于通过 Expo 推送服务发送通知，而原生设备令牌（FCM token / APNs token）则用于直接与各平台 API 通信。存储两种令牌可以让你在不同场景下灵活选择发送通道。

---

## 各方案快速对比

| 方案 | 免费额度 | 富媒体支持 | 配置插件 | 适用场景 |
|------|---------|-----------|---------|---------|
| **Expo Push Notifications** | 免费（600条/秒/项目） | iOS 需自定义插件 | 内置 | 快速起步、中小型项目 |
| **OneSignal** | 有免费层 | 支持 | [onesignal-expo-plugin](https://github.com/OneSignal/onesignal-expo-plugin) | 多渠道互动、富媒体 |
| **Braze** | 付费 | 支持 | [braze-expo-plugin](https://github.com/braze-inc/braze-expo-plugin/tree/main) | 个性化跨渠道营销 |
| **Customer.io** | 付费 | 支持 | [customerio-expo-plugin](https://github.com/customerio/customerio-expo-plugin) | 数据驱动自动化活动 |
| **CleverTap** | 付费 | 支持 | [clevertap-expo-plugin](https://github.com/CleverTap/clevertap-expo-plugin) | 全渠道、高级细分 |
| **直接 FCM/APNs** | 免费 | 支持 | 内置（expo-notifications） | 有后端能力、需要完全控制 |
| **React Native Firebase** | 免费 | 支持 | 需自行配置 | 已使用 Firebase 的项目 |

> **基于文档内容推导**：以上对比信息来源于文档中各方案的描述。实际定价和功能请以各服务商官网为准。

---

## 文档导航

- **上一页**：[in app purchases](./142__in-app-purchases.md)
- **下一页**：[using eslint](./144__using-eslint.md)
