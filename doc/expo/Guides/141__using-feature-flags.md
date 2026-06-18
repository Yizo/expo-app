> 原文地址：[React Native feature flag services](https://docs.expo.dev/guides/using-feature-flags/)

# React Native 功能标志（Feature Flags）服务

本文概述了 Expo 和 React Native 生态中可用的功能标志服务。

## 什么是功能标志

功能标志（Feature Flag），也称为**功能门控（Feature Gate）**，是一种可以远程启用和禁用功能的机制。它提供了一种安全的方式，让你无需部署额外代码，就能向应用用户逐步推出新功能。

功能标志的典型使用场景包括：

- **生产环境测试**：在真实用户环境中测试新功能，出问题时可以随时关闭
- **A/B 测试**：向不同用户群体展示不同的功能版本，比较效果
- **发布新的应用功能**：例如新的 UI 组件，可以通过功能标志控制其可见性和发布节奏

> **基于文档内容推导**：功能标志的核心价值在于将"功能发布"与"代码部署"解耦——你可以先把代码部署到生产环境，再通过远程开关控制功能是否对用户可见，从而降低发布风险。

## 功能标志服务

以下库提供了强大的功能标志支持，并且与使用 [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/) 和 [Config Plugins](https://docs.expo.dev/config-plugins/introduction/) 的 Expo 应用开箱即用，可以在你的应用中无缝集成。

> **对初学者的说明**：CNG（持续原生生成）是 Expo 的工作流，它会在每次构建时自动重新生成原生代码（iOS/Android），这样你就不需要手动管理原生代码。Config Plugins 则是 Expo 提供的配置插件机制，用于在 CNG 流程中自定义原生配置。这两者结合意味着下面介绍的功能标志服务可以很方便地集成到你的 Expo 项目中，而不需要你手动修改原生代码。

---

### PostHog

[PostHog](https://posthog.com/) 是一个**开源**的产品分析平台，在提供分析、会话录制和 A/B 测试功能的同时，还提供了完整的功能标志能力。

**核心特点：**

- **实时功能开关**：支持实时切换功能的开启/关闭状态
- **用户分群**：可以针对不同的用户群体启用不同的功能
- **即时回滚**：出问题时能立即关闭功能，无需重新发布应用
- **内置 A/B 测试和多变量测试**：可以直接通过功能标志运行实验，同时收集关于功能采用率和性能指标的详细分析数据
- **Bootstrap 标志**：支持引导标志（bootstrap flags）来消除加载状态，改善用户体验

> **对初学者的说明**：所谓"Bootstrap 标志"是指在应用启动时预先加载功能标志的值，这样用户不会看到功能切换时的闪烁或加载动画，体验更流畅。

**学习资源：**

- [PostHog React Native 库](https://posthog.com/docs/libraries/react-native#feature-flags) — 学习如何在 React Native 和 Expo 项目中集成 PostHog 功能标志
- [PostHog 功能标志教程](https://posthog.com/tutorials/react-native-analytics) — 按照这个分步指南实现 PostHog 功能标志

> **基于经验建议**：PostHog 是开源的，这意味着你可以选择自托管（self-host），对数据隐私要求较高的团队来说是一个重要优势。同时它将分析和功能标志整合在一个平台中，减少了需要维护的第三方服务数量。

---

### Statsig

[Statsig](https://statsig.com/) 是一个面向**数据驱动产品开发**的功能管理平台，提供高级统计分析、渐进式发布（gradual rollouts）和复杂的目标定向能力，并内置了功能发布的指标和性能监控。

**核心特点：**

- **高级统计分析**：为实验提供严谨的统计方法
- **渐进式发布**：可以逐步将功能推广到更大比例的用户群体
- **复杂目标定向**：支持基于多种条件的精确用户定向
- **自动事件记录**：SDK 会自动记录事件，减少手动埋点工作
- **动态配置**：支持动态更新配置，无需重新发布应用

**学习资源：**

- [Statsig Expo 集成](https://docs.statsig.com/client/javascript-sdk/expo/#basics-check-gate) — 学习如何在 Expo 项目中集成 Statsig 功能标志和实验

> **基于经验建议**：Statsig 特别适合重视数据分析和实验严谨性的团队。如果你的产品决策高度依赖 A/B 测试的统计显著性，Statsig 的内置统计引擎会比其他方案更有优势。

---

### LaunchDarkly

[LaunchDarkly](https://launchdarkly.com/) 是一个**企业级**功能管理平台，支持即时功能开关和定向发布，提供全面的仪表盘控制、高级用户定向和强大的实验工具，并能实时更新标志状态。

**核心特点：**

- **React Hooks 集成**：SDK 提供了用于 React 集成的 Hooks，方便在组件中使用功能标志
- **上下文识别与修改**：支持对上下文（Context）进行识别和修改，用于标识当前用户/环境
- **全面日志记录**：提供完整的日志功能，便于调试和审计
- **多环境支持**：在开发工作流中支持多个环境（如开发、预发布、生产）
- **私有属性**：支持私有属性（private attributes），用于处理敏感数据
- **中继代理配置（Relay Proxy）**：支持中继代理配置，增强安全性和性能

> **对初学者的说明**：
> - **React Hooks 集成**：意味着你可以在 React 组件中通过类似 `useFeatureFlag('my-feature')` 的方式来检查某个功能是否开启，代码写起来非常自然。
> - **中继代理（Relay Proxy）**：这是一种架构模式，通过代理服务器转发功能标志请求，可以避免 SDK 直接连接 LaunchDarkly 的服务器，适合对网络安全性要求高的场景。
> - **私有属性**：在用户定向时，有些用户属性（如邮箱、姓名）不希望发送到第三方服务器，私有属性功能允许你在本地使用这些属性做定向，但不将它们上传。

**学习资源：**

- [LaunchDarkly React Native SDK](https://launchdarkly.com/docs/sdk/client-side/react/react-native) — 按照这个指南在 React Native 和 Expo 项目中集成 LaunchDarkly 功能标志

> **基于经验建议**：LaunchDarkly 是企业级方案，功能最为全面，但价格通常也较高。如果你的团队规模较大、对功能发布流程有严格的合规要求，或者需要多环境管理和精细的审计日志，LaunchDarkly 是值得优先考虑的选择。

---

### Firebase Remote Config

[Firebase Remote Config](https://firebase.google.com/docs/remote-config) 是一项**云服务**，允许你在不发布应用更新的情况下改变应用的外观和行为。

**核心特点：**

- **Firebase 控制台管理**：通过 Firebase 控制台管理远程配置值
- **JavaScript API 访问**：通过 JavaScript API 读取配置值，完全控制何时以及如何让这些值影响你的应用
- **条件定向**：支持基于用户属性（user properties）、应用版本、自定义属性的条件定向
- **实时更新**：支持实时更新配置

> **对初学者的说明**：Firebase Remote Config 严格来说不是传统意义上的"功能标志"服务——它更像是一个远程键值对配置系统。但你可以用它来实现类似功能标志的效果：比如定义一个 `show_new_feature` 的布尔值配置项，远程获取后决定是否展示新功能。它的优势在于如果你的项目已经在使用 Firebase 生态（如 Analytics、Crashlytics 等），集成 Remote Config 的成本非常低。

**学习资源：**

- [React Native Firebase Remote Config](https://rnfirebase.io/remote-config/usage) — 学习如何通过 React Native Firebase 库在 React Native 和 Expo 项目中集成 Firebase Remote Config

> **基于经验建议**：Firebase Remote Config 对于已经深度使用 Firebase 生态的团队来说是自然的选择，且其免费额度通常足够中小规模应用使用。但如果你需要专业的 A/B 测试和实验分析能力，建议使用上面介绍的专门的功能标志服务。

---

## 服务对比速查

> **基于文档内容推导**：以下对比基于各服务在文档中描述的特性整理。

| 特性 | PostHog | Statsig | LaunchDarkly | Firebase Remote Config |
|------|---------|---------|--------------|----------------------|
| **定位** | 开源分析 + 功能标志 | 数据驱动实验平台 | 企业级功能管理 | 云端远程配置 |
| **A/B 测试** | 内置支持 | 内置支持（含高级统计） | 内置实验工具 | 需配合 Firebase A/B Testing |
| **渐进式发布** | 支持 | 支持 | 支持 | 通过条件定向实现 |
| **用户分群/定向** | 支持 | 高级定向 | 高级定向 + 私有属性 | 基于用户属性/自定义属性 |
| **实时更新** | 实时开关 | 动态配置 | 实时标志更新 | 支持实时更新 |
| **开源** | 是 | 否 | 否 | 否 |
| **Expo 集成方式** | Config Plugins + CNG | Config Plugins + CNG | Config Plugins + CNG | Config Plugins + CNG |

---

## 如何选择适合你的服务

> **基于文档内容推导**：

- 如果你需要**开源方案**并希望将分析和功能标志整合在一起 → **PostHog**
- 如果你的团队高度依赖**数据驱动决策**和严谨的实验分析 → **Statsig**
- 如果你需要**企业级**的功能管理、多环境支持和安全合规 → **LaunchDarkly**
- 如果你已经在使用 **Firebase 生态**，且需求以远程配置为主 → **Firebase Remote Config**

---

## 文档导航

- **上一页**：[using resend](./140__using-resend.md)
- **下一页**：[in app purchases](./142__in-app-purchases.md)
