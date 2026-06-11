# Adopt Prebuild

## 文档解决的问题

这篇文档说明如何把一个原本用 React Native CLI 初始化的项目接入 Expo Prebuild，也就是逐步迁移到 Expo 的持续原生生成工作流。

## 适用场景

- 你已有 React Native CLI 项目，想开始使用 Expo CLI、Expo Modules、Prebuild。
- 你的项目已经有原生定制，但想减少后续升级和维护成本。
- 你需要把“手工管理原生工程”的旧项目，过渡到“配置驱动生成原生工程”的模式。

## 核心概念

### 采用 Prebuild 的意义

文档明确说明，采用 Prebuild 后：

- 可以使用 `npx expo prebuild`
- 可以使用 Expo CLI 命令
- 自动接入 `expo-modules-core`
- 后续可继续接入更多 Expo 工具

### React Native 版本兼容

并不是任意 React Native 版本都与 Expo SDK 一一兼容，所以迁移前必须确认当前 `react-native` 版本是否有对应 Expo SDK。

### 原生定制迁移

已有项目里最难的部分通常不是装 `expo` 包，而是把过去写在 `android` / `ios` 中的原生改动迁移到：

- app config
- config plugin
- 本地插件

## 关键流程

### 1. 安装 `expo`

```sh
npm install expo
```

文档提醒要安装与当前 `react-native` 版本匹配的 Expo 版本。

### 2. 修改入口文件

把：

- `AppRegistry.registerComponent`

改成：

- `registerRootComponent(App)`

### 3. 运行 Prebuild

```sh
npx expo prebuild --clean
```

它会按 app config 重新生成 `android` / `ios`。

### 4. 本地验证

```sh
npx expo run:android
npx expo run:ios
```

### 5. 迁移原生定制

文档建议逐项检查：

- 能否转成内置 app config 字段
- 依赖库是否已有 config plugin
- 是否需要查社区 `expo/config-plugins`
- 是否需要自己写本地 config plugin

## 命令、配置、文件说明

### 关键命令

- `npm install expo`
- `npx expo prebuild --clean`
- `npx expo run:android`
- `npx expo run:ios`

### 涉及文件

- 入口文件（原本注册 App 的文件）
- `app.json`
- `.gitignore`
- `metro.config.js`
- `package.json`
- `android/`
- `ios/`

### 推荐的额外调整

- `.gitignore` 中加入 `.expo`
- 去掉 `app.json` 中顶层 `expo` 对象之外无效的字段
- 视情况把脚本切换到 Expo CLI 的 `run` 命令

## 注意事项、限制条件和坑点

- 文档明确提醒：执行 `prebuild --clean` 前应先提交改动，以便必要时回退。
- 如果项目已有大量原生修改，迁移不会是“一键完成”，最大成本在于定制迁移。
- 不是所有三方库都已经内建 config plugin，部分场景需要社区插件或自写插件。
- `app.json` 中顶层 `expo` 之外的字段对 Prebuild 无效，迁移时需要清理。

## React Web 开发者容易误解的点

- 这不是简单“安装一个依赖”就完成的接入；它本质上是在改变项目管理原生工程的方式。
- 入口文件替换不是纯语法偏好，而是为了把应用注册过程接入 Expo 运行时。
- React Web 里迁移脚手架通常不涉及二进制构建链；这里迁移会影响 Android / iOS 原生工程生成方式。

## 实际开发建议

- 迁移前先盘点当前原生改动，区分“可配置化”“可插件化”“必须保留手管”的部分。
- 先在小分支或试验环境验证 `prebuild --clean` 生成结果，再决定是否全面切换。
- 对复杂老项目，先接入 Expo CLI 和部分能力，再逐步搬迁原生定制，会比一次性重做更稳。
- 基于文档内容推导：Prebuild 迁移的难点主要在“历史原生修改资产化”，而不是命令本身。

## 文档明确说明

- 需要先安装 `expo` 包。
- 需要把应用入口切到 `registerRootComponent`。
- 使用 `npx expo prebuild --clean` 重新生成原生目录。
- Expo Modules API 支持会随迁移自动接入。
- 可继续采用 EAS Build、EAS Update、Expo Dev Client 等能力。

## 基于文档内容推导

- 对新项目来说，直接从 Expo 起步比后迁移更省事。
- 对老项目来说，迁移价值和成本取决于已有原生定制的数量与复杂度。
- 当前文档未提供逐类型原生改动的完整迁移清单，只给出迁移思路与检查方向。

<!-- NAVIGATION START -->
---
[← 上一页：Add custom native code](./13_customizing.md) | [下一页：Build locally: Overview →](./15_local-app-overview.md)
<!-- NAVIGATION END -->
