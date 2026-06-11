# Using Expo SDK, React Native, and third-party libraries

## 文档解决的问题

这篇文档回答的是：在 Expo 项目里如何选择和安装库，怎么判断一个第三方库是否兼容，什么时候需要 Development Build，什么时候 Expo Go 不够用。

## 适用场景

- 你想从 npm 或 React Native 生态里引入某个库，但不知道是否能在 Expo 中使用。
- 你分不清 React Native 内建能力、Expo SDK 能力和第三方库能力的边界。
- 你正在从 React Web 迁移过来，不清楚“有 JS 包”和“能在移动端跑”之间的差距。

## 核心概念

### React Native core libraries

这是 `react-native` 包自带的基础组件和 API，例如 `View`、`Text`、`TextInput`。它们相当于 React Native 的“平台原生基础 UI 层”。

### Expo SDK libraries

Expo SDK 在 React Native 核心能力之上继续提供设备和系统能力，例如相机、音频、日历、更新、地图、认证工具等。

### Third-party libraries

第三方库可能来自：

- React Native Directory
- npm

但“npm 上有”不等于“能在 React Native / Expo 中直接工作”。

### Development Build 与 Expo Go 的边界

文档明确说明：任何兼容 React Native 的库，在 Development Build 里通常都可以用；但 Expo Go 只内置了一部分原生能力，所以很多库在 Expo Go 里不能工作。

## 关键流程

### 1. 优先找库

文档推荐的顺序是：

1. 先看 React Native Directory
2. 再看 npm

### 2. 判断是否需要原生改动

文档给出四个判断问题：

- 这个库里是否包含 `android` 或 `ios` 目录？
- README 是否提到 linking？
- 是否要求你改 `AndroidManifest.xml`、`Podfile`、`Info.plist` 等原生配置？
- 是否提供 config plugin？

只要其中任一项为“是”，就应准备 Development Build。

### 3. 安装库

文档明确推荐：

```sh
npx expo install <package-name>
```

而不是直接 `npm install` 或 `yarn add`，因为 Expo CLI 会尽量选择与你项目兼容的版本，并提示已知不兼容问题。

### 4. 补充配置

安装后还要继续看 README 或项目文档，确认是否还需要：

- config plugin
- 原生配置
- 额外初始化步骤

## 命令、配置、文件说明

### 常用命令

- `npx expo install expo-device`
- `npx expo install @react-navigation/native`
- `npx npm-home --github react-native-localize`
- `npx npm-home @react-navigation/native`

### 涉及配置与文件

- `package.json`
- 原生工程相关文件：
  - `android/app/src/main/AndroidManifest.xml`
  - `ios/Podfile`
  - `ios/Info.plist`
- `app.json` / `app.config.*`

### 版本排除配置

如果某个第三方库版本需要从 `expo install`、`expo-doctor`、`expo start` 的版本检查里排除，可使用 `package.json` 里的 `expo.install.exclude`。

## 注意事项、限制条件和坑点

- npm 是 JavaScript 包总仓库，不是 React Native 兼容包总仓库。
- “纯 JS 库”通常更容易直接用；“带原生代码的库”则要看构建环境和配置。
- 即使某库兼容 React Native，也不代表一定兼容 Expo Go。
- 某些库需要 config plugin，但作者未提供；这时要么找社区插件，要么自己写。
- 现有 React Native CLI 项目如果还没采用 Expo Prebuild，就不能直接享受 config plugin 带来的自动原生配置。

## React Web 开发者容易误解的点

- 在 Web 里“装包就能用”很常见；在移动端，“装包”只完成了 JavaScript 依赖层，原生层可能还没准备好。
- Expo SDK 库不是普通 npm 工具包，它们经常包含原生能力接入。
- 一个 README 里写“需要改原生文件”，意味着它不是单纯前端代码依赖。
- Expo Go 不是“任何 Expo 项目都能完整运行的宿主”。

## 实际开发建议

- 选库时先判断“是否涉及原生代码”，再评估接入成本。
- 安装前先看 React Native Directory 的平台标签和 Expo Go 标签。
- 不确定时，直接按需要 Development Build 来安排开发和测试流程。
- 基于文档内容推导：如果团队希望依赖接入更稳定，优先选择已提供 config plugin 或明确支持 Expo 的库。

## 文档明确说明

- React Native Directory 是查找 React Native 库的优先入口。
- Expo CLI 推荐用 `npx expo install` 安装库。
- 需要改原生配置的库应在 Development Build 中使用。
- 没采用 Expo Prebuild 的项目无法使用 config plugin 自动改原生工程。

## 基于文档内容推导

- 对 Expo 项目来说，选库标准不只是 API 是否好用，还包括“是否容易与原生构建链集成”。
- 如果一个库在 React Native Directory 中信息清晰、支持标签明确，接入风险通常更低。
- 当前文档未涉及某个具体库的逐项兼容性清单，它提供的是判断方法，不是完整库目录。

<!-- NAVIGATION START -->
---
[← 上一页：Continuous Native Generation (CNG)](./3_continuous-native-generation.md) | [下一页：Privacy manifests →](./5_apple-privacy.md)
<!-- NAVIGATION END -->
