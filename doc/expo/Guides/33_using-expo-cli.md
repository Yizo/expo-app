# 从 React Native CLI 迁移到 Expo CLI

## 文档解决的问题

这篇文档解决的是：已有 React Native 项目如何从 `@react-native-community/cli` 迁移到 Expo CLI，以及为什么值得迁移。

## 适用场景

- 现有项目已经是 React Native，但仍然用 React Native CLI。
- 你想接入 Expo 的工具或服务，例如 EAS Update、Expo Router、`expo-dev-client`。
- 你想要更强的调试、日志、TypeScript、Web、Monorepo 支持。

## 核心概念

- `Expo CLI`：Expo 的统一命令行入口，负责开发服务器、编译、路由、环境变量、调试集成等。
- `React Native CLI`：React Native 社区原有 CLI。
- `expo` 包：迁移的前提，因为 Expo CLI 与 Expo Modules API 一起由该包带入。

## 按原文结构整理的核心内容

### 1. 迁移的最小动作

大多数情况下，执行下面的命令就够了：

```sh
npx install-expo-modules@latest
```

这一步会安装 `expo` 包，并让项目进入可使用 Expo CLI 的状态。

但文档也提醒：安装完 `expo` 以后，还要继续配置 Metro、Babel 和原生工程，才能真正用 Expo CLI 负责 bundling。

### 2. 为什么推荐 Expo CLI

文档列了很多优势，核心可以归纳为几类：

- 调试体验更强：Hermes debugger、React Native DevTools。
- 工程能力更强：CNG、Expo Router、环境变量、TypeScript、Monorepo。
- Web 支持更完整：React Native Web、CSS、静态站点生成。
- Expo 生态兼容性更好：`expo-dev-client`、EAS Update、Expo Updates protocol。
- 原生开发体验更顺：日志更清楚、自动 `pod install`、自动端口检测、设备选择更方便。

对 React Web 开发者来说，这很像从“只负责打包”升级到“包含路由、调试、环境变量、跨平台开发体验”的统一工具链。

### 3. 如何编译运行

迁移后可以使用：

```sh
npx expo run:android
npx expo run:ios
```

它们对应 React Native CLI 里的 `run-android` 和 `run-ios`。

还可以用 `--device` 指定设备或模拟器。

### 4. 如何单独启动 bundler

默认情况下，`npx expo run:[android|ios]` 会自动启动 bundler。

如果你要自己单独启动开发服务器，可以：

- 用 `npx expo start` 单独启动
- 给 `npx expo run:[android|ios]` 传 `--no-bundler`

### 5. 一个特殊问题：能否只用 Expo CLI，不用 Expo Modules API

文档说可以尝试：只安装 `expo` 包，然后在 `react-native.config.js` 里把 `expo` 从 autolinking 中排除。

这是一种“先试 CLI，暂不接模块系统”的折中方案，但文档明确说明这样会失去一些能力，例如：

- `expo-dev-client`
- `expo-router`

## 关键命令、配置和文件说明

关键命令：

- `npx install-expo-modules@latest`
- `npx expo run:android`
- `npx expo run:ios`
- `npx expo start`

关键文件：

- `react-native.config.js`：如果只想试 Expo CLI 而不接 Expo Modules API，需要在这里排除 `expo` 的 autolinking。

示例配置的作用：

```js
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: null,
        ios: null,
        macos: null,
      },
    },
  },
};
```

它不是“禁用 Expo CLI”，而是告诉原生自动链接系统先不要把 `expo` 当原生模块接进去。

## 注意事项、限制条件和坑点

- 文档明确说：如果要用其他 Expo 工具，强烈建议使用 Expo CLI。
- 只安装 `expo` 但不接 Expo Modules API，会失去部分能力。
- Expo CLI 对 Android、iOS、Web 很强，但对 Windows、macOS 这类 out-of-tree 平台还没有内建完整支持。
- 迁移不是只换命令名，还涉及 Metro、Babel、原生配置配套修改。

## React Web 开发者易误解点

- 容易把 Expo CLI 误解成单纯“开发服务器”。其实它承担了很多脚手架、打包、调试和平台协调职责。
- 容易认为 CLI 迁移不影响原生层。实际会影响 autolinking、编译、pod install 和入口解析。
- 容易觉得 Web 支持只是附赠功能。文档把 Web、CSS、静态站点生成列为 Expo CLI 的正式优势之一。

## 实际开发建议

- 如果团队计划使用 Expo Router、EAS Update、`expo-dev-client`，应尽早完成 Expo CLI 迁移。
- 如果项目同时覆盖 Windows/macOS，要评估是否继续混合使用 React Native CLI。
- 基于经验建议：把“切 Expo CLI”作为独立改造任务，不要和业务功能改动混在同一个发布周期里。

## 文档明确说明

- Expo CLI 是许多 Expo 工具的前提。
- 迁移入口通常是安装 `expo` 包。
- Expo CLI 提供更强的调试、日志、Monorepo、TypeScript、Web 和依赖版本管理能力。
- out-of-tree 平台支持仍有限。

## 基于文档内容推导

- 基于文档内容推导：Expo CLI 不只是替代 React Native CLI，而是在重新定义整个 React Native 工程的默认开发体验。
- 基于文档内容推导：如果项目未来会持续采用 Expo 生态，越晚迁移 CLI，后续分散改造成本越高。

## 当前文档未涉及

- 当前文档未逐项展开 Metro、Babel、iOS/Android 的具体配置内容。
- 当前文档未涉及如何处理已有自定义脚本与 Expo CLI 的兼容问题。

<!-- NAVIGATION START -->
---
[← 上一页：在现有 React Native 项目中安装 Expo Modules](./32_installing-expo-modules.md) | [下一页：在现有 React Native 项目中安装 expo-updates →](./34_installing-updates.md)
<!-- NAVIGATION END -->
