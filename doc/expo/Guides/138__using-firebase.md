# 在 Expo 中使用 Firebase

> 原始文档地址：https://docs.expo.dev/guides/using-firebase/

---

## 概述

[Firebase](https://firebase.google.com/) 是一个 **后端即服务（Backend-as-a-Service, BaaS）** 平台，它利用 Google 可扩展的基础设施，为开发者提供数据库、身份认证、存储等核心后端能力。开发者无需从零搭建后端服务器，即可快速构建功能完善的应用。

> **初学者术语解释：**
> - **BaaS（后端即服务）**：一种云服务模式，将常用的后端功能（如数据库、用户认证、文件存储等）封装为可直接调用的 API，开发者无需自行编写和维护后端代码。
> - **Firebase**：Google 提供的 BaaS 平台，包含 Firestore、Realtime Database、Authentication、Storage、Analytics、Crashlytics 等多种服务模块。

在开始之前，你需要先在 [Firebase 控制台](https://console.firebase.google.com/) 中创建一个 Firebase 项目。

在 Expo / React Native 环境中，有 **两种主要的集成方式**：

| 方式 | 库 | 适用场景 | 兼容性 |
|------|-----|---------|--------|
| **方式一** | Firebase JavaScript SDK | Expo Go、快速原型开发、跨平台通用应用 | 兼容 Expo Go |
| **方式二** | React Native Firebase | 需要 Crashlytics、Dynamic Links、Analytics 等原生功能 | 需要自定义原生代码，不兼容 Expo Go |

---

## 方式一：Firebase JavaScript SDK

Firebase JavaScript SDK 是一个 JavaScript 库，支持以下核心服务：

- **Authentication**（身份认证）：用户注册、登录、第三方社交登录等
- **Cloud Firestore**（云端数据库）：NoSQL 文档型数据库
- **Realtime Database**（实时数据库）：实时同步的 JSON 树状数据库
- **Storage**（存储）：文件上传与下载

### 适用场景

- 使用 **Expo Go** 进行开发
- 快速原型开发（Rapid Prototyping）
- 跨平台通用应用（Universal Apps）

> **初学者术语解释：**
> - **Expo Go**：Expo 提供的官方客户端应用，可以在真机上快速预览和测试项目，无需编译原生代码。
> - **Rapid Prototyping**：快速原型开发，指用最短时间搭建出可运行的产品原型以验证想法。

### 限制

> **注意：** Firebase JavaScript SDK **不支持**以下移动端功能：
> - **Analytics**（分析）：移动端应用分析
> - **Dynamic Links**（动态链接）：深度链接与智能链接
> - **Crashlytics**（崩溃报告）：应用崩溃追踪与分析
>
> 如果你需要上述功能，请使用 **方式二：React Native Firebase**。

### 安装

> **重要提示：** Expo SDK 要求 Firebase 版本为 **12.0.0 或更高**，否则可能会出现 ES Module 解析错误。

使用 Expo 推荐的包管理方式安装：

```sh
npx expo install firebase
```

> 也支持 `yarn`、`pnpm` 和 `bun` 等包管理器的等效安装命令。

### 初始化配置

首先，你需要在 Firebase 控制台中注册一个 **Web 应用**，以获取项目的唯一标识符和 API 密钥。

> **初学者术语解释：**
> - **API Key（API 密钥）**：用于标识你的应用并授权访问 Firebase 服务的字符串。
> - **Web App**：在 Firebase 控制台中注册你的项目为一个 Web 应用，因为 React Native 使用的是 JavaScript SDK（与 Web 端相同的 SDK）。

创建一个 Firebase 配置文件，使用 `initializeApp` 函数进行初始化。Firebase v9 及以上版本采用 **模块化 API**，允许你按需直接导入所需的服务模块：

```javascript
import { initializeApp } from 'firebase/app';

// Firebase 项目配置对象
// 这些值来自 Firebase 控制台中注册的 Web 应用
const firebaseConfig = {
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
```

> **基于经验建议：**
> - 将 Firebase 配置信息存放在单独的文件中（如 `firebaseConfig.js` 或 `firebase.js`），避免与业务逻辑耦合。
> - 虽然 `apiKey` 等字段看起来像敏感信息，但 Firebase 官方说明这些值可以安全地嵌入客户端代码中，真正的安全依赖于 Firebase 的安全规则（Security Rules）。
> - 不要将 `measurementId` 字段遗漏，如果你计划后续使用 Analytics 相关的 Web 功能。

### 故障排除

如果你在页面重新加载后遇到身份认证状态无法持久化的问题，请参考 Expo 官方文档中的故障排除指南进行排查。

### 延伸阅读

- [Firebase 官方文档 — 核心服务入门](https://firebase.google.com/docs/web/setup)
- [Firebase Storage 示例](https://docs.expo.dev/guides/using-firebase/#cloud-storage)
- [API 密钥管理最佳实践](https://firebase.google.com/docs/projects/api-keys)
- [从旧版 Expo Firebase 包迁移](https://docs.expo.dev/guides/using-firebase/#migrating-from-expo-firebase-packages)

---

## 方式二：React Native Firebase

[React Native Firebase](https://rnfirebase.io/) 是一个第三方库，它将 Firebase 的 **原生 iOS 和 Android SDK** 封装为 JavaScript 接口，并为每个 Firebase 服务提供独立的模块化依赖包。

> **初学者术语解释：**
> - **原生 SDK**：指 Firebase 为 iOS（Swift/Objective-C）和 Android（Kotlin/Java）平台提供的官方开发工具包，能充分发挥各平台的能力。
> - **Config Plugin（配置插件）**：Expo 提供的一种机制，允许你通过 `app.json` / `app.config.js` 配置文件来修改原生项目设置，而无需手动编写原生代码。
> - **EAS Build**：Expo Application Services 提供的云端构建服务，可以在云端为 iOS 和 Android 编译原生应用。

### 适用场景

- 需要使用 **Crashlytics**（崩溃报告）
- 需要使用 **Dynamic Links**（动态链接）
- 需要使用 **Analytics**（应用分析）
- 需要访问 Firebase 原生 SDK 的完整功能
- 将已有的裸 React Native 项目迁移到 Expo

### 限制

> **注意：** React Native Firebase 需要自定义原生代码，因此 **不兼容 Expo Go**。你必须使用 **开发构建（Development Build）** 来运行项目。

### 安装步骤

#### 第一步：安装开发客户端

安装 `expo-dev-client` 库，它允许你使用 Config Plugin 而无需手动编写原生代码：

```sh
npx expo install expo-dev-client
```

> 也支持 `yarn`、`pnpm` 和 `bun` 等包管理器的等效安装命令。

#### 第二步：安装核心应用模块

安装 `@react-native-firebase/app`，它通过 Config Plugin 自动注入所需的原生代码：

```sh
npx expo install @react-native-firebase/app
```

> 也支持 `yarn`、`pnpm` 和 `bun` 等包管理器的等效安装命令。

#### 第三步：完成剩余配置

参阅 React Native Firebase 官方的 **托管工作流（Managed Workflow）** 文档，完成剩余的集成配置步骤。

> **基于经验建议：**
> - 安装完核心模块后，按需安装各服务模块，例如：
>   - `@react-native-firebase/auth`（身份认证）
>   - `@react-native-firebase/firestore`（Cloud Firestore）
>   - `@react-native-firebase/storage`（存储）
>   - `@react-native-firebase/crashlytics`（崩溃报告）
> - 每次安装新的 Firebase 原生模块后，都需要重新构建开发版本。

### 运行项目

使用 **EAS Build** 生成并安装开发构建版本到设备上直接运行。

如果需要在本地运行项目，则必须安装以下开发工具：

- **Android Studio**（用于 Android 构建）
- **Xcode**（用于 iOS 构建）

如果你在 `app.json` / `app.config.js` 中添加了原生插件配置，需要在本地运行前先执行 **清理预构建（clean prebuild）** 命令：

```sh
npx expo prebuild --clean
```

然后再使用以下命令在本地启动项目：

```sh
npx expo run:android
# 或
npx expo run:ios
```

> **基于经验建议：**
> - 本地构建原生项目时，确保你的开发环境已正确配置（Android SDK、Xcode 命令行工具等），否则构建会失败。
> - 推荐优先使用 EAS Build 进行云端构建，可以减少本地环境配置的复杂度。
> - 如果构建过程中遇到原生代码冲突问题，先运行 `npx expo prebuild --clean` 清理后重试。

### 延伸阅读

- [React Native Firebase 官方文档](https://rnfirebase.io/)
- [各 Firebase 模块的具体使用指南](https://rnfirebase.io/modules)

---

## 两种方式对比总结

| 对比维度 | Firebase JavaScript SDK | React Native Firebase |
|---------|------------------------|----------------------|
| **兼容性** | 兼容 Expo Go | 不兼容 Expo Go，需要开发构建 |
| **安装复杂度** | 简单（仅安装 npm 包） | 较复杂（需要原生构建） |
| **功能覆盖** | Authentication、Firestore、Realtime Database、Storage | 全部 Firebase 功能 |
| **不支持的功能** | Analytics、Dynamic Links、Crashlytics（移动端） | 无 |
| **适用阶段** | 原型开发、早期验证 | 生产环境、需要完整功能时 |

> **基于文档内容推导：**
> - 如果你的项目处于早期阶段，使用 Expo Go 进行快速开发和验证，**优先选择 Firebase JavaScript SDK**。
> - 当项目进入生产阶段，需要 Crashlytics 监控崩溃、Analytics 分析用户行为、或使用 Dynamic Links 实现深度链接时，**应切换到 React Native Firebase**。
> - 两种方式使用的核心 Firebase 服务（Authentication、Firestore 等）的 API 基本一致，迁移成本相对可控。

---

## 常见问题与注意事项

1. **ES Module 解析错误**：确保 Firebase JavaScript SDK 版本 >= 12.0.0，低版本可能导致模块解析失败。

2. **身份认证持久化问题**：在页面重新加载后用户登录状态丢失，请参考官方故障排除指南解决。

3. **API 密钥安全性**：Firebase 的 `apiKey` 等配置值可以安全地暴露在客户端代码中，但必须配合 Firebase Security Rules 来保护数据访问。

4. **开发构建要求**：使用 React Native Firebase 时，每次添加新的原生模块都需要重新构建开发版本。

5. **Google Services 文件**：React Native Firebase 需要正确配置 `google-services.json`（Android）和 `GoogleService-Info.plist`（iOS），这些文件从 Firebase 控制台下载后放入项目对应目录。

> **基于经验建议：**
> - 在团队协作项目中，将 Firebase 配置文件加入 `.gitignore` 以避免环境差异导致的问题，并在文档中说明如何获取配置。
> - 定期在 Firebase 控制台中检查安全规则配置，确保生产环境的数据访问权限设置正确。

---

## 文档导航

- **上一页**：[using convex](./137__using-convex.md)
- **下一页**：[using supabase](./139__using-supabase.md)
