# 在现有原生 App 中集成 Expo 工具总览

## 文档解决的问题

这篇文档解决的是：如果你的应用原本是原生 Android/iOS App，而不是以 React Native 作为主入口，那么该如何理解 Expo 在这种 brownfield 场景下的可用能力和集成路线。

## 适用场景

- 现有 App 主要是 Swift/UIKit、Kotlin/Java 或其他原生技术栈。
- 你只想把 React Native/Expo 用在单个页面、单个功能，甚至单个视图。
- 你需要在“全原生宿主”里评估 Expo 能做什么、不能做什么。

## 核心概念

- `brownfield app`：已有原生 App，React Native 不是主入口。
- `greenfield app`：从一开始就用 Expo 或 React Native 创建，React Native 是主要入口。
- `integrated approach`：把 React Native/Expo 直接接到现有原生工程里。
- `isolated approach`：把 Expo/React Native 单独构建成原生库，再由原生 App 依赖。

对 React Web 开发者来说，这和“在现有大型原生系统里嵌入一块跨平台前端运行时”更接近，不是简单的页面路由切换。

## 按原文结构整理的核心内容

### 1. 什么算 brownfield

文档的定义很明确：只要现有原生 App 的主入口不是 React Native view，这就属于 brownfield。

例如：

- 原本是 UIKit + Swift App
- 现在只想用 React Native 做一个页面

这类情况都属于本页讨论范围。

### 2. 当前兼容性现状

文档明确提醒：brownfield 集成支持仍处于 alpha。

含义包括：

- 不是所有 Expo 工具都完整可用
- 文档可能还不够完整
- 某些场景需要你把别的 Expo 文档自行适配到 brownfield 语境里

### 3. 哪些工具支持 brownfield

文档列了一个兼容表，关键信息是：

- 支持：Expo SDK、Expo Modules API、Expo Router、Expo CLI、EAS Build、EAS Submit、EAS Update
- 不支持：Expo Dev Client

这很关键，因为它直接影响你能不能把 greenfield 的开发方式原样搬进原生宿主 App。

### 4. 两种接入路线

#### Integrated

React Native 代码直接生活在现有原生工程内部，耦合更紧。

适合：

- 原生和 React Native 代码要频繁一起改
- 同一个团队同时维护两边
- 项目结构允许把 React Native 项目直接放进去

#### Isolated

React Native 工程单独维护，再打包成：

- Android AAR
- iOS XCFramework

然后像普通原生依赖一样接入现有 App。

适合：

- 原生团队和 React Native 团队分离
- 你希望尽量少改原生构建流程
- 你希望把 React Native 部分当成自包含模块

## 关键流程、命令、配置和文件说明

本页是概念总览，没有给具体命令。

但明确给出流程分叉：

1. 判断你是 brownfield 场景。
2. 先确认需要的 Expo 工具是否支持 brownfield。
3. 在 `integrated` 和 `isolated` 两种方案中选一条。

文档明确提到的产物：

- `AAR`
- `XCFramework`

## 注意事项、限制条件和坑点

- brownfield 支持处于 alpha，这本身就是风险提示。
- 不要默认 greenfield 教程能直接照抄到 brownfield。
- `expo-dev-client` 当前不支持 brownfield，这是非常容易踩坑的边界。

## React Web 开发者易误解点

- 容易把“集成一个 React Native 页面”想得像在 Web 里嵌一个微前端。实际上原生入口、生命周期、构建系统都不同。
- 容易误以为 Expo 对 brownfield 的支持和普通 Expo 项目一样成熟。当前页明确不是。
- 容易误以为两种方案只是目录组织不同。其实它们对应的是团队协作方式、构建边界和运行时耦合程度的不同。

## 实际开发建议

- 先用兼容表筛选需求，不要先设计方案再发现关键工具不支持。
- 如果团队分工明显、原生团队不想引入 Node/React Native 工具链，优先看 isolated。
- 如果需要高频联调原生和 React Native，优先看 integrated。

## 文档明确说明

- brownfield 是现有原生 App 集成 React Native/Expo 的场景。
- brownfield 支持目前是 alpha。
- Expo Dev Client 不支持 brownfield。
- 存在 integrated 和 isolated 两条主要路线。

## 基于文档内容推导

- 基于文档内容推导：brownfield 方案选择首先是组织和工程边界问题，其次才是 UI 技术选型问题。
- 基于文档内容推导：如果你的目标只是嵌入少量功能，isolated 往往会更容易控制对原生主工程的影响。

## 当前文档未涉及

- 当前文档未涉及任一路线的具体落地代码。
- 当前文档未涉及 Android/iOS 的详细配置步骤。

<!-- NAVIGATION START -->
---
[← 上一页：Expo 原生工程升级辅助工具](./36_upgrade.md) | [下一页：Brownfield：用 Isolated 方式把 Expo 打成原生库 →](./38_isolated-approach.md)
<!-- NAVIGATION END -->
