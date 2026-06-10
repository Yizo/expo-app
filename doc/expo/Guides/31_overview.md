# Expo 在现有 React Native 项目中的总览

## 文档解决的问题

这篇文档回答的是：如果你已经有一个不使用 Expo 的 React Native 项目，为什么还要接入 Expo，以及应该从哪里开始、按什么节奏逐步接入。

## 适用场景

- 已经有 React Native 项目，但还没用 Expo 工具链。
- 不想一次性重构，只想逐步引入 Expo 的某些能力。
- 想改善构建、调试、升级、发布、远程更新等开发体验。

如果你是 React Web 开发者，可以把这篇文档理解为“给已有前端工程渐进式接入一套更完整的工程化平台”，而不是“必须重写项目”。

## 核心概念

- `Expo`：不是单一库，而是一套工具、服务和 SDK 组合。
- `Expo SDK`：可以理解为 React Native 的扩展标准库，提供大量原生能力封装。
- `Expo CLI`：命令行工具，负责启动、编译、调试、路由等开发流程。
- `EAS`：Expo 的云服务集合，处理构建、提审、更新等 CI/CD 场景。
- `Expo Modules API`：用于写原生模块的 API，面向 Swift 和 Kotlin，比传统 React Native 原生模块写法更统一。
- `CNG`：Continuous Native Generation。文档提到这是 Expo 管理原生工程的一种思路，但本页不是详细教程。

## 按原文结构整理的核心内容

### 1. Expo 可以渐进式接入

文档明确强调：Expo 提供的工具和服务都可以用于“任何 React Native 应用”。这意味着 Expo 不是只能用于新项目，也不是只能配合 `create-expo-app` 使用。

### 2. 建议的四个接入阶段

文档把接入分成四个阶段，而且只要求先完成“前置条件”阶段，后面可以按需跳着用。

#### 前置条件

- 安装 Expo modules
- 改用 Expo CLI

这是后续多数能力的基础，相当于先把工程底座换成 Expo 能识别的形式。

#### Quick wins

- 使用 Expo SDK
- 安装 `expo-dev-client`
- 用 Expo Modules API 写原生模块
- 用原生升级辅助工具处理升级

这部分重点是“尽快获得开发体验收益”。

#### New workflows

- 用 EAS 做发版和提审
- 安装 `expo-updates` 做远程更新

这对应的是工程交付流程，而不只是本地开发。

#### New mindsets

- Adopt Prebuild
- Expo Router

这部分更像长期演进方向，目标是减少原生维护成本，让项目结构更一致。

### 3. 常见问题的答案

文档集中回答了几个很关键的问题：

- 接入 Expo 不必一步到位，可以按功能渐进式采用。
- Expo 能带来更快开发、原生升级简化、远程更新等收益。
- 使用 Expo 不一定要删除现有 `android` 和 `ios` 目录。
- 使用 Expo 也不强制必须用 EAS 云构建。
- 可以继续使用第三方原生库。
- 可以继续使用 React Navigation，不强制改成 Expo Router。

## 关键流程、命令、配置和目录说明

本页是总览页，没有展开完整操作步骤，但明确给出了接入顺序：

1. 先安装 `expo` 包并启用 Expo modules。
2. 切换到 Expo CLI。
3. 再按目标选择 SDK、`expo-dev-client`、`expo-updates`、EAS、Prebuild、Router 等能力。

文档提到的关键目录和文件：

- `android` / `ios`：现有 React Native 原生工程目录，不要求删掉。

文档提到的关键命令：

- `npx expo run:android`
- `npx expo run:ios`

这两个命令被用来替代部分 React Native CLI 的本地编译运行能力。

## 注意事项、限制条件和坑点

- 文档强调“只要求先完成前置条件”，不要误以为必须一次性全面迁移。
- 现有原生目录可以保留，不要把“使用 Expo”和“删除原生工程”画等号。
- CodePush 已在文档中被明确说明将于 2025 年 3 月退役，且与 React Native New Architecture 不兼容；文档建议长期迁移到 EAS Update。
- Expo 推荐 EAS，但没有强制要求一定使用 EAS。

## React Web 开发者最容易误解的点

- 容易误以为 Expo 等于“脚手架”或“新项目模板”。这页明确说明 Expo 更像一组可渐进接入的能力。
- 容易误以为用了 Expo 就不能写原生代码。实际上文档明确说第三方原生库和原生模块都可以继续用。
- 容易误以为 Expo Router 是强制方案。当前文档明确说明不是。
- 容易把 `android` / `ios` 目录理解成“脏东西，最好删掉”。这页并没有这样要求。

## 实际开发建议

- 如果你是现有 React Native 团队，最稳妥的起点是先做“安装 Expo modules + 切换 Expo CLI”。
- 如果团队对原生升级和发布流程痛点明显，可以优先看 `expo-updates` 和 EAS。
- 如果只是想先增强本地开发体验，可以先接 `expo-dev-client` 和 Expo SDK。
- 基于经验建议：先把“接入目标”拆开，不要把 SDK、Router、Update、EAS 一次性绑在同一个迁移周期里。

## 文档明确说明

- Expo 工具和服务可以用于任何 React Native 应用。
- 接入 Expo 可以渐进进行。
- 只要求优先完成前置条件阶段。
- 现有项目不必删除 `android` 和 `ios` 目录。
- 不强制使用 EAS。
- 不强制使用 Expo Router。

## 基于文档内容推导

- 基于文档内容推导：Expo 更适合作为“逐层替换工程能力”的平台，而不是“大爆炸式迁移方案”。
- 基于文档内容推导：如果团队当前最大痛点是开发效率和升级维护，Expo 的收益通常会先体现在工具链，而不是 UI 层。

## 当前文档未涉及

- 当前文档未涉及具体安装 diff。
- 当前文档未涉及 `app.json`、`metro.config.js`、`babel.config.js` 的详细配置。
- 当前文档未涉及 brownfield 原生宿主集成细节。
