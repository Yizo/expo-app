# Expo Monorepo 工作方式

## 文档解决的问题

这篇文档解决的是：如何在 monorepo 里组织 Expo 项目、共享包，以及 Expo 在不同 SDK 版本下对 monorepo 的支持方式和常见问题。

## 适用场景

- 你的仓库里有多个 App 或多个共享包。
- 你想把 Expo App 和内部 package 放在一个仓库里维护。
- 你在处理 workspaces、依赖提升、模块解析和原生 autolinking 问题。

## 核心概念

- `monorepo`：单仓库多项目结构。
- `workspace`：monorepo 中的子项目或子包。
- `hoisted`：依赖被提升到更高层 `node_modules`。
- `isolated dependencies`：依赖不再被随意提升，包只能访问显式声明的依赖。
- `autolinking`：原生模块自动发现和链接机制。

对 React Web 开发者来说，monorepo 本身并不陌生，但 Expo/React Native 场景会额外牵扯 Metro、原生模块解析和原生构建脚本路径问题。

## 按原文结构整理的核心内容

### 1. Expo 对 monorepo 的整体态度

文档明确说：

- Expo 对 Bun、npm、pnpm、Yarn workspaces 有一等支持。
- Expo 会自动检测 monorepo。
- 但 monorepo 不适合所有项目，因为会增加工具配置复杂度。

### 2. SDK 52 之后：Metro 自动配置

如果你使用 `expo/metro-config`，SDK 52 之后无需手动为 monorepo 配置 Metro。

如果旧项目曾手动改过这些字段，应删除：

- `watchFolders`
- `resolver.nodeModulesPath`
- `resolver.extraNodeModules`
- `resolver.disableHierarchicalLookup`

然后运行：

```sh
npx expo start --clear
```

清掉旧缓存。

### 3. SDK 52 之前：需要手动配置 Metro

旧版本需要自己在 `metro.config.js` 里：

- 扩大监听目录到 monorepo 根
- 显式指定多个 `node_modules` 路径

这说明 Metro 在 monorepo 下最关键的是“看得见哪些文件、去哪里找依赖”。

### 4. monorepo 的基本结构

文档推荐：

- `apps/`
- `packages/`
- 根 `package.json`

对于 Bun、npm、Yarn，在根 `package.json` 里写 `workspaces`。

对于 pnpm，使用 `pnpm-workspace.yaml`。

### 5. 创建 Expo App 和内部 package

创建 App：

```sh
npx create-expo-app@latest --template default@sdk-56 apps/cool-app
```

创建内部包后，可以在 App 的 `package.json` 中把它声明成：

- `"cool-package": "*"`
- 或 `"workspace:*"`

这样 App 就能直接消费仓库内共享代码。

### 6. 常见问题

文档重点谈了三类问题：

#### isolated dependencies

- SDK 54 开始支持 isolated installs
- SDK 53 仍建议关闭 isolated installs
- 某些 React Native 库在 isolated 模式下仍可能有构建或解析问题

如果 pnpm 遇到问题，可把 `nodeLinker` 改成：

```yaml
nodeLinker: hoisted
```

#### 重复依赖

文档明确说：

- 单一 monorepo 中重复的 React Native 版本不被支持
- 单一 App 中重复 React 版本会导致运行时错误
- 重复的 Turbo / Expo modules 也可能导致运行时或构建错误

可用 `npm why` / `yarn why` / `pnpm why` / `bun pm why` 检查。

#### 硬编码原生脚本路径

某些原生配置里会写死 `../../node_modules/...` 路径，但 monorepo 的 hoisting 可能让这个路径失效。

文档建议改成 Node 的 `require.resolve()` 动态解析路径。

## 关键命令、配置、文件说明

关键命令：

- `npx expo start --clear`
- `npx create-expo-app@latest --template default@sdk-56 apps/cool-app`
- `npm why react-native`
- `yarn why react-native`
- `pnpm why --depth=10 react-native`
- `bun pm why react-native`

关键文件：

- 根 `package.json`
- `pnpm-workspace.yaml`
- `metro.config.js`
- App 自己的 `package.json`
- Android `build.gradle`
- iOS `Podfile`

关键配置：

- `workspaces`
- `nodeLinker`
- `resolutions` 或 `overrides`
- `experiments.autolinkingModuleResolution`

## 注意事项、限制条件和坑点

- monorepo 会增加复杂度，不适合只做单应用的小项目。
- SDK 52+ 和 SDK 52 前的 Metro 配置策略不同，不能混着理解。
- isolated installs 并不等于“更先进就一定更省心”，某些库仍可能不兼容。
- 原生模块绝不能重复，因为原生构建时一次只能编译一个版本。

## React Web 开发者易误解点

- 容易以为 monorepo 问题只会出现在 JavaScript 依赖解析上。实际上 Expo 还会遇到原生脚本、autolinking 和 Metro 的额外问题。
- 容易把重复依赖看成“包体积问题”。在 React Native/Expo 里，重复原生模块可能直接导致构建失败。
- 容易以为所有工具都能自动理解 workspaces。当前文档已经明确，一些第三方包仍可能写死路径。

## 实际开发建议

- 新项目如果用 SDK 52+，优先依赖 Expo 默认 monorepo 支持，不要先手写 Metro 特殊配置。
- 定期检查 `react`、`react-native`、Expo 原生模块是否出现多版本。
- 基于经验建议：把共享包保持为“纯 JS/TS 优先”，能减少原生层依赖冲突。

## 文档明确说明

- Expo 对主流 workspaces 有一等支持。
- SDK 52+ 通常不需要手动配置 monorepo 的 Metro。
- SDK 54 支持 isolated dependencies。
- 重复原生模块会导致问题。
- 硬编码 `node_modules` 路径在 monorepo 中容易失效。

## 基于文档内容推导

- 基于文档内容推导：monorepo 在 Expo 中真正难的不是建目录，而是保持 JS 解析、Metro、原生 autolinking 三者一致。
- 基于文档内容推导：如果团队依赖很多第三方原生库，monorepo 的治理成本会明显高于普通 Web monorepo。

## 当前文档未涉及

- 当前文档未涉及 Nx、Turborepo 等更高层 monorepo 工具的配置。
- 当前文档未涉及 EAS 在 monorepo 中的完整 CI 配置。

<!-- NAVIGATION START -->
---
[← 上一页：Brownfield 中的生命周期监听机制](./40_lifecycle-listeners.md) | [下一页：Expo 项目里的日志查看方式 →](./42_logging.md)
<!-- NAVIGATION END -->
