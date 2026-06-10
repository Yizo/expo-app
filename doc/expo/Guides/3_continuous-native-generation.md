# Continuous Native Generation (CNG)

## 文档解决的问题

这篇文档解释为什么 Expo 推出 CNG、`prebuild` 到底在做什么、它如何降低原生工程维护成本，以及什么时候适合使用、什么时候不适合使用。

## 适用场景

- 你在评估是否要把 `android` / `ios` 当成可生成产物来管理。
- 你想知道 `npx expo prebuild` 与传统 React Native 手管原生工程的差别。
- 你要判断一个已有 React Native 项目是否适合采用 Expo 的持续生成思路。

## 核心概念

### CNG 是什么

文档把 CNG 定义为：原生工程不是初始化一次后永久手工维护，而是在需要调试、构建时，根据标准模板和你的配置、依赖、原生扩展定义“按需生成”。

### Prebuild 是什么

`npx expo prebuild` 是 Expo 对 CNG 的具体实现工具。它会：

- 依据 Expo SDK 版本选择模板
- 根据 `package.json` 自动链接原生模块
- 根据 app config 与 config plugin 修改原生工程
- 生成 `android/` 和 `ios/`

### Config Plugin

这是把“原本要手改原生文件的操作”转成可重复执行的脚本化配置的关键机制。

## 关键流程

### 1. 运行 Prebuild

```sh
npx expo prebuild
```

### 2. 生成原生目录

生成结果是：

- `android/`
- `ios/`

### 3. 构建应用

- 本地：`npx expo run:android` / `npx expo run:ios`
- 云端：EAS Build

如果项目里没有原生目录，EAS Build 默认会先跑 Prebuild。

### 4. 原生配置变化后重新生成

文档建议在配置或依赖变化后优先使用：

```sh
npx expo prebuild --clean
```

## 命令、配置、文件说明

### 关键命令

- `npx expo prebuild`
- `npx expo prebuild --clean`
- `npx expo prebuild --platform ios`
- `npx expo prebuild --skip-dependency-update react-native,react`
- `npx expo prebuild --no-install`
- `npx expo run:android`
- `npx expo run:ios`

### 关键文件与目录

- `app.json` / `app.config.*`
- `package.json`
- `android/`
- `ios/`
- `.gitignore`
- `.easignore`

### 影响生成的输入

文档明确列出 CNG 依赖：

- app config
- `npx expo prebuild` 参数
- 已安装的 `expo` 版本和对应模板
- autolinking
- native subscribers
- EAS Credentials

## 注意事项、限制条件和坑点

- 手动改 `android` / `ios` 后，再跑 `prebuild --clean` 会丢失这些修改。
- 不带 `--clean` 重新生成时，是在已有文件上“叠加修改”，结果不一定稳定。
- 一些 config plugin 不是幂等的，重复叠加可能产生意外结果，所以文档总体上更推荐 `--clean`。
- Prebuild 会修改 `package.json` 中的 `scripts` 和 `dependencies`，这属于文档明确提到的 side effects。
- 自定义模板理论可行，但文档明确说不推荐，因为 Expo 的基础 modifier 对模板结构有一些未文档化假设。
- 当前官方 Prebuild 只支持 Android 和 iOS；Web 不需要 Prebuild。
- Brownfield 现有原生工程不适合直接由 CNG 持续管理。

## React Web 开发者容易误解的点

- CNG 不是“生成一次脚手架就结束”，而是“在需要时可反复生成”。
- `android` / `ios` 在这个模型里更像 `node_modules` 一样的派生产物，而不是永远手改的主源码。
- 这并不意味着你完全不能写原生代码，而是建议把原生改动尽量表达成模块、插件、订阅器等可组合形式。
- Web 世界里常见的“直接改构建产物不是问题”在这里并不成立，因为移动端原生工程还是最终二进制的来源。

## 实际开发建议

- 新项目优先采用 CNG，可以降低升级成本。
- 若必须快速试验原生改动，可先本地修改，再逐步沉淀为 config plugin 或本地模块。
- 团队协作时，把 `android` / `ios` 从版本库里排除，更符合 CNG 工作方式。
- 基于文档内容推导：如果你需要频繁重复某类原生改动，把它脚本化比长期人工维护更稳。

## 文档明确说明

- “ejecting” 和 “managed vs bare workflow” 这类旧概念已不再推荐，当前应理解为是否采用 CNG。
- Prebuild 是可选的，不是强制的。
- 使用 CNG 时，推荐通过 config plugin 而不是直接改原生目录来做配置。
- 采用 CNG 后，升级 React Native 的方式更接近升级一个 JavaScript 项目。

## 基于文档内容推导

- CNG 的核心收益不是“省去原生知识”，而是把原生复杂度集中到更少、更可审计的入口。
- 对有长期维护压力的团队来说，CNG 更像一种工程治理策略，而不只是一个命令。
- 当前文档未涉及如何编写具体 config plugin，只解释了它在 CNG 里的地位。
