# 在 Expo 应用中使用应用内购买

> 原文地址：[https://docs.expo.dev/guides/in-app-purchases/](https://docs.expo.dev/guides/in-app-purchases/)

应用内购买（In-App Purchases，简称 IAP）是指在移动应用或桌面应用内部进行的交易，用户可以通过它购买数字商品或获取额外功能。本指南提供了在 Expo 应用中实现 IAP 的主流库列表和教程资源。

---

## 重要前提：需要开发构建（Development Build）

> 应用内购买库需要配置自定义原生代码。使用 Expo Go 时无法配置原生代码。你需要创建一个 [开发构建（development build）](https://docs.expo.dev/develop/development-builds/introduction/)，这样才能在项目中使用原生库。

**对初学者的解释：**

Expo Go 是一个预编译好的通用客户端应用，它不包含任何自定义原生模块。而应用内购买功能依赖于平台原生的支付系统（如 iOS 的 StoreKit 和 Android 的 Google Play Billing），这些功能需要通过原生代码来实现。因此，你必须放弃 Expo Go，转而创建自己的开发构建版本。

基于文档内容推导：创建开发构建后，你将拥有一个包含自定义原生代码的专属客户端，从而可以使用 IAP 相关的原生库。

---

## 教程资源

本部分提供了视频和图文两种学习方式，帮助你快速上手在 Expo 中实现应用内购买。

### 视频教程

**视频：如何在 Expo 中实现应用内购买**（YouTube ID: `R3fLKC-2Qh0`）

- 内容概要：演示如何在 Expo 应用中使用 **RevenueCat** 设置应用内购买和订阅功能。
- 适合希望通过可视化方式学习的开发者。

### 图文教程

**Expo 应用内购买入门教程**（来自 RevenueCat 官方博客）

- 链接：[https://www.revenuecat.com/blog/engineering/expo-in-app-purchase-tutorial/](https://www.revenuecat.com/blog/engineering/expo-in-app-purchase-tutorial/)
- 内容概要：使用 `react-native-purchases` 库和 RevenueCat 平台实现应用内购买与订阅的入门指南。
- 适合喜欢跟着代码步骤一步步操作的开发者。

---

## 推荐的库

以下库为应用内购买提供了可靠的功能支持，并且与 Expo 的 [CNG（持续原生生成）](https://docs.expo.dev/workflow/continuous-native-generation/) 和 [Config Plugins（配置插件）](https://docs.expo.dev/config-plugins/introduction/) 开箱兼容，可以轻松集成到你的应用中。

### 1. `react-native-purchases`

- **仓库地址**：[https://github.com/RevenueCat/react-native-purchases](https://github.com/RevenueCat/react-native-purchases)
- **简介**：一个开源框架，对 Google Play Billing 和 StoreKit API 进行了封装，并与 RevenueCat 服务集成，支持应用内购买。
- **核心功能**：
  - 产品管理（Product Management）
  - 数据分析（Analytics）
  - 简化的购买工作流
  - 支持客户端以外的购买需求，例如在应用后端验证购买（validating purchases）

**对初学者的解释：**

`react-native-purchases` 是目前 Expo 生态中最成熟的 IAP 解决方案之一。它通过 RevenueCat 平台简化了大量复杂操作——你不需要自己对接 Google Play 和 App Store 的底层 API，也不需要自建后端来处理订阅验证，RevenueCat 帮你处理了这些问题。

基于经验建议：如果你打算在应用中实现订阅制付费模式，推荐优先考虑 `react-native-purchases` + RevenueCat 的组合方案，因为社区资料和官方教程最为丰富。

### 2. `expo-iap`

- **仓库地址**：[https://github.com/hyodotdev/openiap/tree/main/libraries/expo-iap](https://github.com/hyodotdev/openiap/tree/main/libraries/expo-iap)
- **简介**：一个遵循 OpenIAP 规范的 React Native 应用内购买库，兼容开发构建。

**对初学者的解释：**

`expo-iap` 是 OpenIAP 项目的一部分，OpenIAP 是一个致力于统一各平台 IAP 接口的标准化规范。如果你更倾向于直接使用与 Expo 命名风格一致的库，或者需要一个更轻量级的 IAP 方案，可以关注这个项目。

---

## 总结与选型建议

| 特性 | `react-native-purchases` | `expo-iap` |
|------|--------------------------|------------|
| 底层 API | Google Play Billing + StoreKit | OpenIAP 规范 |
| 后端集成 | RevenueCat（内置支持） | 需自行实现 |
| 数据分析 | 通过 RevenueCat 仪表盘 | 需自行实现 |
| 成熟度 | 社区广泛使用 | 相对较新 |

基于文档内容推导：两个库都与 Expo 的 CNG 和 Config Plugins 兼容，这意味着你无需手动管理原生代码配置，Expo 会自动处理这些工作。

基于经验建议：对于大多数项目，尤其是需要订阅功能和后端验证的场景，`react-native-purchases` 是更稳妥的选择。如果你的项目只需要简单的一次性购买功能，或者你想保持技术栈的轻量化，可以评估 `expo-iap`。

---

## 文档导航

- **上一页**：[using feature flags](./141__using-feature-flags.md)
- **下一页**：[using push notifications services](./143__using-push-notifications-services.md)
