# Develop an app with Expo

## 文档解决的问题

这篇文档帮助你建立 Expo 应用开发的整体心智模型：一个 Expo 项目到底由哪些部分组成、什么时候只改 JavaScript、什么时候需要重新生成原生工程、什么时候需要重新打包原生应用，以及 Expo、EAS、Development Build、CNG 在整个流程里分别扮演什么角色。

## 适用场景

- 第一次从 React Web 转到 Expo / React Native，不知道完整开发链路长什么样。
- 已经会写一些 React Native 代码，但不清楚 Expo 开源工具和 EAS 托管服务的边界。
- 准备把项目从原型阶段推进到可测试、可发布、可更新的正式应用。

## 核心概念

### Expo app 是什么

文档把“使用 Expo 工具的 React Native 应用”简称为 Expo app。它不要求你必须全家桶接入 Expo，也可以只使用 Expo SDK、Expo Router、Expo CLI、CNG 中的一部分。

### Expo 和 EAS 的区别

- `Expo`：开源工具集合，例如 Expo CLI、Expo Router、Expo SDK。
- `EAS`：托管服务集合，用于云构建、提交、更新、自动化和团队协作。

对 React Web 开发者来说，可以把 Expo 理解为“框架和本地开发工具”，把 EAS 理解为“围绕移动发布流程的云服务平台”。

### Development Build

Development Build 是包含 `expo-dev-client` 的调试版原生应用。它比 Expo Go 更接近真实应用，因为你可以安装任意原生库，也可以承载你自己的原生配置。

### Android / iOS 原生工程

移动应用不只是 JavaScript。文档明确说明，移动应用包含两部分：

- JavaScript 应用代码：类似 React Web 里的业务代码和组件代码。
- 原生工程：Android Studio / Xcode 工程，负责打包、启动 JS 运行时、渲染原生组件、接入系统能力、声明权限和应用元数据。

### CNG

Continuous Native Generation（CNG）表示“按需生成原生工程”，而不是长期手工维护 `android` 和 `ios` 目录。它依赖 `app.json` / `app.config.*`、依赖列表和 config plugin 来重新生成原生工程。

## 关键流程

### 1. 初始化项目

文档推荐使用 `create-expo-app` 创建项目。默认情况下你看不到 `android` 和 `ios` 目录，因为它鼓励按需生成原生工程。

### 2. 选择运行环境

- 快速试验：可先用 Expo Go。
- 正式开发：推荐 Development Build。

文档特别强调：Expo Go 更像学习和原型工具，不适合生产级项目。

### 3. 日常开发循环

文档把核心循环拆成四类活动：

1. 编写和运行 JavaScript 代码。
2. 更新应用配置，例如名称、图标、启动屏等。
3. 编写原生代码或修改原生工程配置。
4. 安装需要原生改动的第三方库。

前两类有时不需要重新构建原生应用，后两类通常需要重新构建。

### 4. 重新生成或构建原生应用

如果你：

- 新增了原生依赖
- 修改了会影响原生工程的 app config

则需要运行：

```sh
npx expo prebuild --clean
```

文档还说明，本地构建可以用：

```sh
npx expo run:android
npx expo run:ios
```

云端构建可以使用 EAS Build。

### 5. 测试、发布、监控、更新

文档把后续流程也串起来了：

- 测试分发：Internal distribution 或本地产物分发
- 上架：EAS Submit 或你自己的原生发布流程
- 监控：崩溃上报、分析
- 更新：`expo-updates` / EAS Update

## 命令、配置、文件说明

### 关键命令

- `npx create-expo-app`：创建 Expo 项目。
- `npx expo prebuild`：生成 `android` / `ios` 原生工程。
- `npx expo prebuild --clean`：删除旧原生目录并重新生成，适合原生配置变化后使用。
- `npx expo run:android`
- `npx expo run:ios`

### 关键文件与目录

- `app.json` / `app.config.js`：Expo 应用配置来源。
- `android/`、`ios/`：生成出来的原生工程目录。
- `.gitignore`：文档明确提到默认会忽略 `android`、`ios`，用于支持 CNG 工作流。

## 注意事项、限制条件和坑点

- Expo Go 是受限运行环境，不能当成生产级开发环境。
- 一旦你直接手改 `android` / `ios`，以后再跑 `prebuild` 可能会覆盖这些改动。
- 本地用 `npx expo run` 首次构建时会生成原生目录；之后如果配置或原生代码变了，必须重新构建。
- 文档明确建议：为了避免层叠生成导致结果不一致，应优先使用 `npx expo prebuild --clean`。
- 云开发流程不代表你永远不需要理解原生工程；只是你可以把“直接维护原生工程”的频率降下来。

## React Web 开发者容易误解的点

- 不要把 Expo 误解成“只能写 JS、完全没有原生层”的方案。Expo 只是帮你更好地管理原生层。
- 不要把 EAS 理解成 Expo 的必选项。文档明确说，不用 EAS 也可以继续使用 Expo 开源工具。
- 不要把“改配置”都当成类似 Web 改 `.env` 那样立即生效。很多配置会进入原生二进制，必须重建应用。
- 不要把 Expo Go 当成“开发环境本体”。它更像预装了一部分原生能力的测试容器。

## 实际开发建议

- 如果目标是正式应用，尽早切到 Development Build，不要长期依赖 Expo Go。
- 如果团队希望降低升级和维护成本，优先采用 CNG，尽量把原生改动转成 app config 或 config plugin。
- 当你不确定某个依赖是否需要原生改动时，优先按“需要 Development Build”来规划时间。
- 基于文档内容推导：把原生工程视为“可生成产物”而不是“长期手写源码”，会更符合 Expo 推荐工作流。

## 文档明确说明

- Expo app 指的是“使用 Expo 工具的 React Native 应用”。
- EAS 不是必须使用。
- Expo Go 适合学习，不适合生产级项目。
- `android` 和 `ios` 目录可以通过 `npx expo prebuild` 生成。
- 添加原生依赖或修改影响原生工程的配置后，应重新生成原生工程。
- 本地和云端开发流程的核心循环本质相同，差别主要在于你如何产出二进制包。

## 基于文档内容推导

- 对 React Web 开发者来说，Development Build 才更接近“你自己的真实运行时”，Expo Go 更像“共享运行时”。
- 如果团队把大量原生改动直接写进 `android` / `ios`，就会逐渐偏离 CNG 模式，升级成本会上升。
- 这篇文档是总览页，因此具体某个能力怎么配置、怎么写插件、怎么调试，当前文档未涉及。

<!-- NAVIGATION START -->
---
[下一页：Configure with app config →](./2_configuration.md)
<!-- NAVIGATION END -->
