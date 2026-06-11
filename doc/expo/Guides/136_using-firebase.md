# 在 Expo 中使用 Firebase

> 来源：<https://docs.expo.dev/guides/using-firebase.md>（页面标注更新日期：2026-06-09）

## 这篇文档解决什么问题

Firebase 是 Google 提供的后端即服务（BaaS），包含认证、数据库、存储、崩溃报告和分析等能力。本文的核心不是讲解每个 Firebase 产品，而是帮助 Expo 项目在两种接入方式之间做选择：**Firebase JS SDK** 与 **React Native Firebase**，并完成各自所需的基础配置。

对 React Web 开发者而言，可以把 Firebase JS SDK 理解为熟悉的 Web JavaScript 客户端；React Native Firebase 则是对 Android/iOS 原生 Firebase SDK 的 JavaScript 封装，会把原生代码加入应用。

## 前置条件

需要先在 Firebase Console 中创建或选择一个 Firebase 项目。当前文档未涉及 Firebase 项目的具体创建步骤、计费方案和安全规则配置。

## 两种方案如何选择

### Firebase JS SDK

适合以下情况：

- 需要 Authentication、Firestore、Realtime Database 或 Storage。
- 希望快速开始，并继续在 Expo Go 中开发。
- 希望一套代码覆盖 Android、iOS 和 Web。

限制是移动端并非所有 Firebase 服务都受支持，文档明确举出的缺失能力包括 Analytics、Dynamic Links 和 Crashlytics。需要这些能力时，应考虑 React Native Firebase。

### React Native Firebase

适合以下情况：

- 需要 JS SDK 不支持的原生服务，例如 Dynamic Links、Crashlytics 或 Analytics。
- 明确希望使用 Firebase 的 Android/iOS 原生 SDK。
- 已有配置 React Native Firebase 的裸 React Native 项目，正在迁移到 Expo SDK。

它要求自定义原生代码，因此**不能在 Expo Go 中运行**，必须使用开发构建。这里的“开发构建”类似为项目制作一份带有自定义原生依赖的专用开发客户端，而不是使用固定原生能力的通用 Expo Go。

## 使用 Firebase JS SDK

### 1. 安装

```sh
npx expo install firebase
```

Expo SDK 只支持 `firebase@12.0.0` 及以上版本；更早版本会导致 ES Module 解析错误。

### 2. 注册 Web 应用并初始化

即使目标是原生应用，也需要在 Firebase 项目中注册一个 Web 应用，以取得 API Key 和项目标识。随后可在项目根目录或配置目录创建 `firebaseConfig.js`：

```js
import { initializeApp } from 'firebase/app';

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

export const app = initializeApp(firebaseConfig);
```

Firebase 9 及以上使用模块化 API，可从 `firebase/auth`、`firebase/firestore`、`firebase/database`、`firebase/storage` 等入口按需导入。使用 JS SDK 不需要额外的 Expo config plugin 或原生配置。

### 3. 登录持久化注意事项

文档特别提示：如果遇到认证状态在重载后丢失的问题，需要额外处理 Firebase JS SDK 的认证持久化。当前页面只指出该问题并链接到专项指南，没有展开配置代码。

## 使用 React Native Firebase

### 1. 安装开发客户端与核心模块

```sh
npx expo install expo-dev-client
npx expo install @react-native-firebase/app
```

`@react-native-firebase/app` 是其他 Firebase 原生模块的基础，并通过 config plugin 向项目加入原生代码。后续必须按 React Native Firebase 的 managed workflow 文档完成平台配置；当前 Expo 页面没有复述这些步骤。

### 2. 构建并运行

使用 EAS Build 时，可以直接创建并安装开发构建，不要求先在本地编译。若本地运行，则需要已配置 Android Studio 与 Xcode。

某个 Firebase 模块若要求额外原生配置，需要把对应插件加入应用配置文件的 `plugins`，然后执行：

```sh
npx expo prebuild --clean
```

再使用相应的 `npx expo run:*` 命令构建。`prebuild --clean` 会重新生成原生工程，因此不能把它等同于 Web 项目中只重启开发服务器。

## 限制、坑点与易误解之处

- “React Native 同时支持两套 SDK”不表示能力完全相同；应先按所需 Firebase 产品选型。
- Expo Go 能使用 Firebase JS SDK，但不能承载 React Native Firebase 的自定义原生代码。
- Firebase JS SDK 的配置对象用于标识 Firebase 项目，不等于数据库访问控制；当前文档未涉及 Firestore、Realtime Database 或 Storage 的安全规则。
- React Native Firebase 的具体平台文件、凭据、模块安装与初始化细节不在本文范围内。
- 从 `expo-firebase-analytics` 或 `expo-firebase-recaptcha` 迁移的项目，应使用页面给出的迁移指南；本文未提供迁移清单。

## 实践结论

**文档明确说明：**优先追求 Expo Go、快速接入和 Web/原生通用时使用 Firebase JS SDK；需要 Analytics、Crashlytics 等原生能力时使用 React Native Firebase，并切换到开发构建。

**基于文档内容推导：**应在项目早期列出所需 Firebase 服务后再选 SDK，否则从 JS SDK 转向原生 SDK 会引入开发客户端、原生构建和平台配置成本。当前文档未涉及生产环境架构、后端令牌校验、离线策略和测试方案。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 应用中使用 Convex](./135_using-convex.md) | [下一页：在 Expo 中使用 Supabase →](./137_using-supabase.md)
<!-- NAVIGATION END -->
