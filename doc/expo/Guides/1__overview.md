# 指南（Guides）：概述

> 原始文档地址：https://docs.expo.dev/guides/overview/
>
> 文档版本日期：2026 年 2 月 20 日

---

## 简介

本章节包含使用 **Expo** 和 **Expo Application Services（EAS）** 进行开发的相关信息。

> **新手须知**
>
> - **Expo**：一个基于 React Native 的开源框架，用于构建跨平台（iOS、Android、Web）的移动应用。它提供了一套工具链，帮助你快速搭建、开发和部署应用。
> - **EAS（Expo Application Services）**：Expo 提供的云端服务集合，包括构建（Build）、提交（Submit）、更新（Update）等功能，让你可以在云端完成应用的编译和发布流程。

该概述页面本身是一个**导航页**，它为读者指引了 Expo 文档中"指南"部分涵盖的各个主题方向。下面我们将逐一介绍这些主题。

---

## 一、开发流程（Development process）

### 内容概要

了解使用 Expo 构建应用的完整流程，帮助你理解核心开发循环（core development loop）的心智模型（mental model）。

> **关键术语解释**
>
> - **核心开发循环（core development loop）**：指的是"编写代码 → 在设备上预览 → 调试修复 → 再次运行"这一反复迭代的开发过程。Expo 通过热重载（Hot Reload）等机制让这个循环变得非常快速。
> - **心智模型（mental model）**：一种理解事物运作方式的思维框架。理解 Expo 的心智模型意味着你需要知道代码如何变成运行中的应用、修改如何生效等基本概念。

### 涵盖的内容

本章节还会深入介绍你在开发过程中可能需要的额外配置和工作流，帮助你开发、部署和维护应用。具体包括：

| 主题 | 说明 | 文档链接 |
|------|------|----------|
| **应用配置（App config）** | 如何配置你的应用（名称、图标、启动画面等） | `/workflow/configuration.md` |
| **权限（Permissions）** | 如何请求和管理设备权限（如相机、位置等） | `/guides/permissions.md` |
| **通用链接（Universal links）** | 如何让其他应用或网页通过链接直接跳转到你的应用 | `/linking/into-your-app.md` |
| **自定义原生代码（Custom native code）** | 当你需要使用平台原生功能时，如何处理持续的原生代码生成 | `/workflow/continuous-native-generation.md` |
| **Web 支持（Web）** | 如何让 Expo 应用同时在浏览器中运行 | `/workflow/web.md` |

> **基于文档内容推导**：Expo 的开发流程不仅限于"写代码、运行应用"这么简单。随着应用的复杂度增加，你还需要关注应用配置、设备权限、深度链接、原生代码管理以及 Web 端适配等方面。建议初学者先从"核心开发循环"入手，逐步学习这些高级主题。

---

## 二、Expo Router（路由库）

### 内容概要

了解如何使用 **Expo Router** 库实现各种页面导航功能。

> **关键术语解释**
>
> - **Expo Router**：Expo 官方的路由/导航库，灵感来源于 Next.js 的文件系统路由。它允许你通过在项目中创建文件夹和文件来定义应用的页面结构（即"基于文件的路由"）。
> - **Hooks API（钩子 API）**：React 中的一种编程模式，允许你在函数组件中使用状态和其他特性。Expo Router 提供了一系列专用的 Hooks 来处理导航相关逻辑。
> - **导航（Navigation）**：在应用中从一个页面切换到另一个页面的行为。

### 涵盖的内容

Expo Router 文档覆盖了以下方面：

- **导航功能**：Expo Router 库提供的各种页面切换能力
- **Hooks API**：该库提供的全面的钩子接口，用于编程式控制导航行为
- **身份认证（Authentication）**：如何在路由层面实现登录/未登录状态的管理
  - 文档链接：`/router/advanced/authentication.md`
- **重定向（Redirects）**：如何配置路由的自动跳转规则
  - 文档链接：`/router/reference/redirects.md`
- **测试（Testing）**：如何对路由和导航逻辑进行测试
  - 文档链接：`/router/reference/testing.md`

相关文档入口：

- Expo Router 介绍：`/router/introduction.md`
- Hooks API 参考：`/versions/latest/sdk/router.md#hooks`

> **基于经验建议**：如果你是首次使用 Expo Router，建议先阅读其介绍文档，理解"基于文件的路由"这一核心概念，然后再深入学习身份认证和重定向等高级主题。

---

## 三、Expo Modules API（原生模块接口）

### 内容概要

了解如何使用 **Expo Modules API** 在应用中添加和使用原生模块。

> **关键术语解释**
>
> - **原生模块（Native modules）**：直接用平台原生语言（iOS 使用 Swift/Objective-C，Android 使用 Kotlin/Java）编写的代码模块。当你需要访问设备硬件（如蓝牙、传感器）或使用某个原生 SDK 时，就需要编写原生模块。
> - **Expo Modules API**：Expo 提供的一套接口规范，让你可以用统一的方式编写和使用原生模块，而不必深入了解 React Native 的原生桥接机制。

相关文档：`/modules/overview.md`

> **基于文档内容推导**：Expo Modules API 是连接 JavaScript/TypeScript 层和原生平台层之间的桥梁。对于大多数常见功能（如相机、通知、位置等），Expo 已经提供了现成的 SDK 包，你无需自己编写原生模块。只有当你需要使用某个特殊的原生库或硬件功能时，才需要用到 Expo Modules API。

---

## 四、教程（Tutorials）

### 内容概要

如果你正在寻找关于 Expo 和 EAS 的**循序渐进的教程**，可以查阅教程（Tutorial）章节。

该章节包含以下综合教程：

| 教程主题 | 说明 | 文档链接 |
|----------|------|----------|
| **使用 Expo 构建应用** | 从零开始学习如何创建一个完整的 Expo 应用 | `/tutorial/introduction.md` |
| **使用 EAS 服务** | 学习如何使用 Expo 的云端构建、更新、提交等服务 | `/tutorial/eas/introduction.md` |

教程章节总入口：`/tutorial/overview.md`

> **基于经验建议**：教程部分是最适合初学者的学习路径。如果你刚刚开始接触 Expo，建议先完成"使用 Expo 构建应用"教程，它会带你走完从项目创建到应用运行的完整流程。

---

## 五、其他内容（Other content）

### 内容概要

除了上述核心主题之外，Expo 文档还涵盖了许多其他功能和集成指南：

- **推送通知（Push notifications）**：如何在应用中实现推送通知功能
  - 文档链接：`/push-notifications/overview.md`
- **杂项（Assorted）**：各种实用指南的集合
- **第三方集成（Integrations）**：与第三方服务和库的集成指南

---

## 文档结构总览

根据本页内容，Expo "指南"部分的整体结构如下：

```
Guides（指南）
├── Development Process（开发流程）
│   ├── 应用配置
│   ├── 权限管理
│   ├── 通用链接
│   ├── 自定义原生代码
│   └── Web 支持
├── Expo Router（路由）
│   ├── Hooks API
│   ├── 身份认证
│   ├── 重定向
│   └── 测试
├── Expo Modules API（原生模块接口）
├── Tutorials（教程）
│   ├── 使用 Expo 构建应用
│   └── 使用 EAS 服务
└── Other Content（其他内容）
    ├── 推送通知
    ├── 杂项指南
    └── 第三方集成
```

> **基于文档内容推导**：这个结构反映了 Expo 开发的学习路径——先掌握核心开发流程，然后学习路由导航，接着在需要时探索原生模块 API，最后通过各种专题指南深入特定功能领域。

---

## 文档导航

- **上一页**：无
- **下一页**：[overview](./2__overview.md)
