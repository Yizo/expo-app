# React Native 分析 SDK 和库

> **原始文档地址**：[https://docs.expo.dev/guides/using-analytics](https://docs.expo.dev/guides/using-analytics)

---

## 概述

分析服务（Analytics Service）允许你追踪用户如何与你的应用进行交互，从而帮助团队在改进应用时采用**有据可依的方法（measured approach）**，而非凭直觉做决策。

> **基于文档内容推导**：分析工具的核心价值在于将用户行为数据化，使产品迭代从"我觉得"转变为"数据显示"。这对于用户增长、功能优化和留存分析都至关重要。

---

## 重要限制：Expo Go 兼容性

在开始选择分析工具之前，必须了解一个关键限制：

> **警告**：大多数分析 SDK 需要配置**自定义原生代码（custom native code）**。
>
> 在使用 **Expo Go** 时，无法配置原生代码。因此，你需要创建一个**开发构建（development build）** 来使用大部分分析工具。

### 关键术语解释

| 术语 | 说明 |
|------|------|
| **原生代码（Native Code）** | 指 iOS（Swift/Objective-C）或 Android（Java/Kotlin）平台的底层代码。分析 SDK 通常需要通过原生模块来收集设备信息、推送通知等底层数据。 |
| **Expo Go** | Expo 提供的官方客户端应用，可以直接在手机上预览和运行 Expo 项目，但它只包含预编译的标准原生模块集合，不支持添加自定义原生代码。 |
| **开发构建（Development Build）** | 通过 Expo 的 EAS Build 或本地构建系统生成的自定义应用二进制文件，其中包含了你项目所需的所有原生依赖。它允许你自由添加第三方原生模块。 |

> **基于经验建议**：如果你的项目需要使用分析功能，建议在项目初期就规划好开发构建的工作流，因为从 Expo Go 迁移到开发构建可能涉及构建配置、签名证书和分发方式的调整。

---

## 可用的分析服务提供商

以下是 Expo 和 React Native 生态系统中可用的分析服务列表：

### 需要开发构建的服务

以下分析工具需要自定义原生代码，因此**不兼容 Expo Go**，必须使用开发构建：

#### 1. Google Firebase Analytics

Google 提供的全方位分析解决方案，与 Firebase 生态深度集成，支持事件追踪、用户属性、受众分析等功能。

- **文档链接**：[React Native Firebase - Analytics 使用指南](https://rnfirebase.io/analytics/usage)

> **基于经验建议**：Firebase Analytics 是免费方案中最强大的选择之一，如果你的项目已经在使用 Firebase 的其他服务（如 Authentication、Firestore、Cloud Messaging），选择 Firebase Analytics 可以实现无缝集成。

#### 2. Segment

Segment 是一个**客户数据平台（Customer Data Platform, CDP）**，允许你通过一次集成将数据发送到多个分析目标（如 Google Analytics、Mixpanel、Amplitude 等）。

- **文档链接**：[Segment - React Native 移动端库](https://segment.com/docs/connections/sources/catalog/libraries/mobile/react-native/)

> **基于经验建议**：如果你计划同时使用多个分析服务，Segment 可以避免为每个服务分别集成 SDK，大幅降低维护成本。但需注意 Segment 是付费服务。

#### 3. Amplitude

Amplitude 专注于**产品分析（Product Analytics）**，提供强大的用户行为分析、漏斗分析、留存分析等功能。

- **文档链接**：[Amplitude - TypeScript React Native SDK](https://www.docs.developers.amplitude.com/data/sdks/typescript-react-native/)

#### 4. AWS Amplify

Amazon Web Services 提供的分析解决方案，与 AWS 生态（如 Pinpoint、Kinesis）深度集成。

- **文档链接**：[AWS Amplify - React Native 分析入门](https://docs.amplify.aws/lib/analytics/getting-started/q/platform/react-native/)

> **基于经验建议**：如果你的后端基础设施已经在 AWS 上，使用 AWS Amplify 进行数据分析可以减少跨平台数据传输的复杂性。

#### 5. Vexo

Vexo 是一个专注于移动应用的分析平台。

- **文档链接**：[Vexo 文档](https://docs.vexo.co/)

#### 6. Dreambase

专门用于在 Expo 和 Supabase 环境中追踪**用户行为和应用性能**的分析工具。

- **文档链接**：[Dreambase 文档](https://dreambase.ai/docs)

> **基于经验建议**：如果你的项目使用 Supabase 作为后端，Dreambase 是一个值得关注的选择，因为它专门针对这一技术栈进行了优化。

---

### 兼容 Expo Go 的服务

以下分析工具**可以在 Expo Go 中直接使用**，无需创建开发构建：

#### 1. Aptabase

一个兼容 Expo Go 的分析服务，提供基本的事件追踪功能。

- **文档链接**：[Aptabase - React Native](https://aptabase.com/for-react-native)
- **兼容性**：✅ 兼容 Expo Go

#### 2. Astrolytics

另一个兼容 Expo Go 的分析服务。

- **文档链接**：[Astrolytics - React Native](https://www.astrolytics.io/react-native)
- **兼容性**：✅ 兼容 Expo Go

#### 3. PostHog

PostHog 是一个开源的产品分析平台，提供事件追踪、会话录制（session replay）、功能标志（feature flags）等功能。

- **文档链接**：[PostHog - React Native 库](https://posthog.com/docs/libraries/react-native)
- **兼容性**：✅ 兼容 Expo Go

> **基于经验建议**：如果你处于项目早期阶段，还不想配置开发构建，可以先使用 PostHog 作为分析方案。PostHog 开源且功能丰富，支持自托管（self-hosted），是一个很好的起步选择。等项目成熟后再根据需要切换到更重量级的方案。

---

## 选择分析工具的考量因素

> **基于文档内容推导**：根据文档中列出的工具特性，选择分析服务时可以考虑以下几个维度：

| 考量因素 | 说明 |
|----------|------|
| **Expo Go 兼容性** | 如果项目仍在使用 Expo Go，优先选择 Aptabase、Astrolytics 或 PostHog |
| **生态系统整合** | 选择与你现有技术栈匹配的工具（如 Firebase 配 Firebase 生态、AWS Amplify 配 AWS 生态） |
| **功能需求** | 不同工具侧重点不同——Firebase 适合全面追踪、Segment 适合多目标分发、Amplitude 适合产品分析、PostHog 适合开源自托管 |
| **成本** | Firebase Analytics 和 PostHog（自托管）免费；Segment、Amplitude 等为付费服务 |
| **数据主权** | 如果对数据隐私有严格要求，考虑支持自托管的方案（如 PostHog） |

---

## 开发构建的创建方式

> **基于文档内容推导**：由于大多数分析工具需要开发构建，以下是创建开发构建的基本路径：

当你需要使用不兼容 Expo Go 的分析 SDK 时，需要通过以下方式之一创建开发构建：

1. **EAS Build**（推荐）：使用 Expo 的云端构建服务
2. **本地构建**：使用 `npx expo run:ios` 或 `npx expo run:android` 在本地编译

> **基于经验建议**：建议在添加分析 SDK 之前，先确保开发构建工作流运行正常。这样可以在添加原生依赖后快速验证集成是否成功。

---

## 相关指南

Expo 文档中还提供了以下与监控和错误追踪相关的指南：

- [使用 Sentry](https://docs.expo.dev/guides/using-sentry) — 错误追踪和性能监控
- [使用 BugSnag](https://docs.expo.dev/guides/using-bugsnag) — 错误报告
- [使用 LogRocket](https://docs.expo.dev/guides/using-logrocket) — 会话回放和性能监控
- [使用 Vexo](https://docs.expo.dev/guides/using-vexo) — 应用分析

---

## 文档导航

- **上一页**：[faq](./126__faq.md)
- **下一页**：[using sentry](./128__using-sentry.md)
