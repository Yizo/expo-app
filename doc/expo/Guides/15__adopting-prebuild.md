# 采用 Prebuild（Adopt Prebuild）

> **原始文档地址**：<https://docs.expo.dev/guides/adopting-prebuild/>

## 文档解决的问题

这篇文档说明如何将一个通过 **React Native CLI** 创建的项目迁移到使用 Expo Prebuild 的工作流。迁移后，你的项目将采用"持续原生生成"（Continuous Native Generation, CNG）模式，自动获得 Expo 原生模块 API 的支持，并解锁所有 Expo CLI 命令。

## 适用场景

- 你的项目最初是用 `react-native init` 或 React Native CLI 创建的。
- 你希望享受 Expo Prebuild 带来的好处（自动化原生目录管理、config plugin 体系等）。
- 你想让项目从"手动维护原生代码"过渡到"声明式管理原生配置"。

## 前置知识（新手必读）

在开始之前，先理解几个关键术语：

- **Expo Prebuild**：Expo 提供的一套工具链，根据你的 `app.json`（或 `app.config.js`）配置文件，自动生成 `android/` 和 `ios/` 目录下的原生项目文件。你不需要手动维护这些目录。
- **CNG（Continuous Native Generation，持续原生生成）**：一种工作流理念——每次需要原生目录时，都从配置重新生成，而不是手动编辑原生文件。这样可以保证原生目录始终与配置一致。
- **Config Plugin（配置插件）**：一种声明式的机制，用于在 prebuild 过程中自动修改原生项目配置（比如添加权限、修改 `Info.plist`、添加 Gradle 依赖等）。
- **Expo CLI**：Expo 提供的命令行工具集，包含 `npx expo prebuild`、`npx expo run:ios`、`npx expo run:android` 等命令。
- **registerRootComponent**：Expo 提供的函数，用于注册应用的根组件。它替代了 React Native 原生的 `AppRegistry.registerComponent` 方式，能同时兼容 Expo Go 和独立构建。
- **app.json / app.config.js**：Expo 项目的配置文件，声明应用名称、图标、启动屏、权限等所有配置项。prebuild 会读取这个文件来生成原生目录。
- **Metro**：React Native 使用的 JavaScript 打包工具（bundler），负责将你的 JS/TS 代码打包成可以在设备上运行的格式。

## 前提条件

> **注意**：并非所有版本的 `react-native` 都被 Expo 明确支持。你需要确保当前项目使用的 `react-native` 版本与某个 Expo SDK 版本所依赖的版本一致。可以在 Expo 文档的"SDK 版本对应关系"页面查看每个 SDK 对应的 `react-native` 版本。

基于经验建议：在迁移之前，先执行 `npx expo install --check` 或手动对比版本，确认 `react-native` 版本匹配。版本不匹配是迁移中最常见的错误来源之一。

## 迁移步骤

### 第一步：安装 `expo` 包

`expo` 是核心依赖包，它提供了 `npx expo prebuild` 命令，并指定了 prebuild 使用的模板。使用你习惯的包管理器安装：

```sh
# 使用 npm
npm install expo

# 使用 yarn
yarn add expo

# 使用 pnpm
pnpm add expo

# 使用 bun
bun add expo
```

安装完成后，请验证安装的 `expo` 版本与你当前使用的 `react-native` 版本相匹配（参考上方"前提条件"）。

### 第二步：修改入口文件

将主入口文件（通常是 `index.js`）从 `AppRegistry` 方式切换为 `registerRootComponent` 方式。

**修改前：**

```js
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

AppRegistry.registerComponent(appName, () => App);
```

**修改后：**

```js
import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(App);
```

**说明**：`registerRootComponent` 是 Expo 提供的函数，内部会自动处理组件注册逻辑。它比直接使用 `AppRegistry` 更简洁，并且在 Expo Go 环境和独立构建中都能正常工作。使用此函数后，你也不再需要从 `app.json` 中导入 `name` 字段。

基于经验建议：如果你的入口文件中还有其他初始化逻辑（比如 polyfill、全局错误处理），请确保在 `registerRootComponent` 调用之前完成这些初始化。

### 第三步：执行 Prebuild

> **警告**：在执行 prebuild 之前，请务必先提交（commit）你当前的所有改动。工具会检测未提交的变更并发出警告。prebuild 会覆盖 `android/` 和 `ios/` 目录，如果没有提交，可能会丢失已有工作。

如果你还没有迁移原生自定义内容，请先阅读下方的"迁移原生自定义"部分。

使用 `--clean` 标志执行 prebuild，它会根据你的配置文件从头重新生成平台目录：

```sh
# 使用 npm
npx expo prebuild --clean

# 使用 yarn
yarn expo prebuild --clean

# 使用 pnpm
pnpm expo prebuild --clean

# 使用 bun
bun expo prebuild --clean
```

**`--clean` 标志说明**：该标志会先删除已有的 `android/` 和 `ios/` 目录，然后重新生成。这在迁移场景中很重要，因为它能确保生成的目录完全基于当前配置，不会残留旧的手动修改。

### 第四步：验证构建

通过本地编译原生应用来验证迁移是否成功：

```sh
# 使用 npm
npx expo run:android
npx expo run:ios

# 使用 yarn
yarn expo run:android
yarn expo run:ios

# 使用 pnpm
pnpm expo run:android
pnpm expo run:ios

# 使用 bun
bun expo run:android
bun expo run:ios
```

`npx expo run:android` 和 `npx expo run:ios` 会编译并在连接的模拟器或真机上运行应用。如果编译成功且应用正常启动，说明迁移基本完成。

## 可选但推荐的额外调整

以下改动不是必须的，但文档强烈建议执行，以获得更好的开发体验：

### .gitignore

将 Expo 本地目录添加到 `.gitignore` 文件中，防止将机器相关的值提交到仓库。这些值是项目独有的，不同开发者的机器上可能不同。

基于经验建议：新建的 Expo 项目默认会在 `.gitignore` 中包含 `android/` 和 `ios/` 目录（因为它们是自动生成的），以及 `.expo/` 目录。如果你的 `.gitignore` 中还没有这些条目，请补充。

### app.json

删除主配置对象之外的所有属性。prebuild 工具只会读取主配置对象，其他属性会被忽略。

基于文档内容推导：在 React Native CLI 项目中，`app.json` 通常只包含 `{ "name": "YourApp", "displayName": "Your App" }`。迁移后，这个文件需要扩展为完整的 Expo 配置格式（包括 `expo` 顶层键），之前放在外层的属性应移入 `expo` 对象内或删除。

### metro.config.js

参考 Expo 的"自定义 Metro"指南进行打包器调优。Expo 项目可能需要对 Metro 配置做一些适配。

### package.json

将运行脚本（scripts）更新为使用 Expo CLI 的运行命令。这样可以获得：

- 更好的日志输出
- 自动签名（iOS）
- 更优的模拟器管理

基于经验建议：可以将 `package.json` 中的 `"start"`、`"android"`、`"ios"` 等脚本替换为对应的 Expo CLI 命令，例如：

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios"
  }
}
```

## 迁移原生自定义

如果你的项目曾经直接修改过 `android/` 或 `ios/` 目录中的文件（比如添加自定义启动屏、修改原生配置等），你需要在迁移时将这些改动反映到配置文件中。以下是具体的处理策略：

### 检查内置配置字段

首先检查 Expo 的 app config 内置字段是否已经覆盖你的改动。例如，如果你在原生端设置了应用图标，那么在 `app.json` 中通过 `icon` 字段即可实现相同效果。

### 使用 Config Plugin

判断你的依赖是否需要 Expo config plugin。你可以：

1. 运行安装命令，系统会自动添加可用的 plugin。
2. 检查社区仓库 [`expo/config-plugins`](https://github.com/expo/config-plugins)，查看是否有你需要的 plugin。

### 使用 VS Code 扩展检查生成结果

使用 [VS Code Expo 扩展](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) 来检查 prebuild 生成的文件。在 VS Code 中搜索并运行 "Expo: Preview Modifier" 命令，可以预览各个配置修改器（modifier）对生成文件的影响。

基于经验建议：这个扩展在排查"为什么 prebuild 生成的结果和我预期不一样"时特别有用，它能让你看到每个 plugin 具体修改了哪些原生文件。

### 编写自定义 Plugin

对于没有现成 plugin 覆盖的独特需求，你可以创建自定义的本地 config plugin。这允许你通过代码在 prebuild 过程中自动应用你的原生改动。

## 迁移后可集成的更多功能

完成 prebuild 迁移后，你可以考虑集成以下 Expo 能力：

- **EAS Build**：使用远程编译和代码签名服务来构建应用，无需在本地维护完整的编译环境。
- **EAS Update**：部署即时热更新补丁，无需重新提交应用商店审核即可修复线上问题。
- **Expo for Web**：在浏览器中运行你的应用，实现一套代码多端运行。
- **Expo Dev Client**：构建一个自定义的开发运行时环境，在开发阶段获得更好的调试体验。
- **Expo 原生模块 API**：迁移后自动支持。你可以使用 Swift 和 Kotlin 编写原生模块，扩展应用的原生能力。

基于文档内容推导：原文提到迁移后 Expo 原生模块 API 会被"自动启用"（inherently supported），这意味着你不需要额外配置就能开始使用 Expo Modules API 编写原生代码——这是采用 prebuild 工作流的核心收益之一。

## 注意事项、限制条件和坑点

- 迁移时长因项目而异，取决于现有原生改动的多少和复杂度。如果项目几乎没有修改过原生目录，迁移会很快；反之则需要较多时间将改动转译为 config plugin。
- `react-native` 版本必须与 Expo SDK 匹配，否则可能导致编译失败或运行时错误。
- `--clean` 标志会完全删除 `android/` 和 `ios/` 目录再重新生成，任何未通过配置文件或 plugin 保留的改动都会丢失。
- 直接修改原生目录中的文件在 CNG 模式下是不推荐的做法，因为这些改动在下次 prebuild 时可能被覆盖。
- 并非所有 React Native 生态中的库都有对应的 Expo config plugin，对于缺少 plugin 的库，你可能需要自己编写。

## 基于文档内容推导

- 迁移的核心思路是"将原生改动声明化"：所有对原生目录的修改都应该通过 `app.json` 配置和 config plugin 来表达，而不是手动编辑原生文件。
- 文档将"提交当前改动"作为 prebuild 的前置警告，暗示 prebuild（尤其是 `--clean` 模式）具有破坏性——它会覆盖甚至删除已有的原生目录内容。
- 原文把 EAS Build、EAS Update、Expo for Web 等列为迁移后的可选步骤，说明 prebuild 迁移本身只是基础，真正的价值在于解锁整个 Expo 工具生态。
- 文档没有提供 `app.json` 从 React Native CLI 格式转换为 Expo 格式的完整示例，这意味着读者需要自行参考 Expo 的 app config 文档来完成配置迁移。

## 文档明确说明

- 采用 prebuild 工作流会自动启用 Expo 原生模块 API（通过在原生端链接核心模块实现）。
- 采用 prebuild 工作流会解锁所有 Expo CLI 命令。
- `registerRootComponent` 是推荐的根组件注册方式，替代 `AppRegistry`。
- `.gitignore` 中应添加 `.expo/` 目录，因为其中的值是机器相关的。
- 迁移原生自定义有四条路径：内置配置字段、社区 config plugin、VS Code 扩展检查、自定义本地 plugin。

---

## 文档导航

- **上一页**：[customizing](./14__customizing.md)
- **下一页**：[local app overview](./16__local-app-overview.md)
