# 在 Expo 中实现应用内购买

> 来源：<https://docs.expo.dev/guides/in-app-purchases.md>（页面标注更新日期：2026-05-20）

## 文档解决的问题

应用内购买（In-App Purchases，IAP）是用户在移动或桌面应用内部购买数字商品或附加功能的交易。本文不是完整接入教程，而是说明 Expo 项目实现 IAP 时的关键原生限制，并列出可用教程与库。

适合需要销售数字内容、解锁功能或提供订阅，并正在决定 Expo 技术方案的项目。

## 最重要的移动端概念

IAP 库需要配置自定义原生代码。Expo Go 的原生能力是预先固定的，不能加入购买库所需的原生模块，因此不能用 Expo Go 完成这类集成。应创建 **development build（开发构建）**，让项目自己的开发客户端包含目标 IAP 库。

对 React Web 开发者来说，这不同于安装一个纯 npm 包后刷新页面：IAP 最终连接 Google Play Billing 或 Apple StoreKit，依赖编译进 Android/iOS 应用的原生代码。

## 文档列出的学习入口

页面提供 RevenueCat 方案的视频和教程，用于在 Expo 中配置应用内购买与订阅。其中教程使用 `react-native-purchases` 和 RevenueCat。

当前页面没有复述商店后台创建商品、订阅组、沙盒账号、审核要求或 RevenueCat Dashboard 配置步骤，实际实施时需要继续阅读所选教程和库文档。

## 可选库

### `react-native-purchases`

这是 RevenueCat 的开源 React Native 框架，封装 Google Play Billing 与 StoreKit API，并与 RevenueCat 服务集成。除客户端购买调用外，它还提供产品管理、分析，以及简化后端购买校验等超出客户端代码范围的流程。

适合希望由 RevenueCat 统一处理跨商店购买与订阅基础设施的团队。

### `expo-iap`

这是符合 OpenIAP 规范的 React Native 应用内购买库，可在开发构建中使用。

当前文档没有比较它与 `react-native-purchases` 的 API、服务端能力、支持平台或迁移方式，也没有指定官方首选库。

## Expo 集成方式

页面说明这些库可结合 Continuous Native Generation（CNG）和 Config Plugins 集成。Config Plugin 用配置自动处理原生工程变更；开发者仍需要重新生成或构建包含这些原生模块的应用，而不是继续依赖 Expo Go。

当前文档未提供安装命令、`app.json`/`app.config.*` 配置、构建命令和代码示例。

## 限制、坑点与易误解之处

- “Expo 支持 IAP”不等于 Expo Go 支持 IAP；关键分界是是否需要自定义原生代码。
- IAP 不只是客户端按钮和支付弹窗。文档对 `react-native-purchases` 的描述明确提到购买校验可能延伸到应用后端。
- 页面只列出流行方案，不代表完整生态清单，也没有比较费用、平台政策和功能差异。
- 当前文档未涉及商品类型、恢复购买、收据校验、退款、订阅状态同步、测试账号、商店审核、税务或合规要求。

## 实践结论

**文档明确说明：**IAP 必须使用开发构建；可从 RevenueCat 的 `react-native-purchases` 或符合 OpenIAP 的 `expo-iap` 中选择，并利用 CNG/config plugin 完成原生集成。

**基于文档内容推导：**应先决定是否需要 RevenueCat 提供的托管产品管理、分析和后端校验能力，再选择库。项目计划中还要预留原生构建、商店后台和服务端状态校验工作，不能按纯前端支付组件估算。
