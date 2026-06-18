# 在 Monorepo 中使用 Expo

> **原文地址**：https://docs.expo.dev/guides/monorepos/
>
> 本文档基于 Expo 官方文档翻译整理，适用于 SDK 56 版本。

---

## 概述

Monorepo（单一代码仓库）是一种将多个应用程序和库合并到同一个代码仓库中的项目管理方式。这种方式有助于在多个项目之间共享代码，并实现统一的依赖管理。

Expo 原生支持以下包管理器所管理的 workspace（工作区）配置：

- **Bun**
- **npm**
- **pnpm**
- **Yarn**（Classic 经典版和 Berry 新版）

当使用上述工具创建新项目时，Expo 会自动检测 workspace 配置并据此调整项目结构。

> **关键术语解释（面向初学者）**
>
> - **Monorepo**：单一代码仓库，将多个相关项目放在同一个 Git 仓库中管理，便于代码共享和统一构建。
> - **Workspace（工作区）**：包管理器提供的功能，允许在一个仓库中管理多个子包（package），各子包可以有独立的 `package.json`，同时共享根目录的 `node_modules`。
> - **Hoisting（提升）**：workspace 中，包管理器将公共依赖提升到根目录的 `node_modules` 中，以避免重复安装。
> - **Metro**：React Native 官方使用的 JavaScript 打包工具（bundler），负责将 JS/TS 代码打包供开发和服务使用。

---

## 是否应该使用 Monorepo？

> **注意**：Monorepo 架构并非适用于所有项目。

**适合使用 Monorepo 的场景：**

- 需要在多个应用之间共享代码（如公共组件库、工具函数库）
- 需要将原生模块（native modules）与应用代码放在同一仓库中协同开发
- 团队需要统一的代码规范和构建流程

**不适合使用的场景：**

- 只有一个独立应用的项目
- 对工具链复杂度敏感的团队

> **基于经验建议**：在决定采用 Monorepo 之前，请先确认你所依赖的第三方库是否都兼容 workspace 环境。某些库可能假设 `node_modules` 在项目根目录下，导致在 monorepo 中出现路径解析错误。提前验证兼容性可以避免后期大量排错工作。

---

## Metro 配置

### SDK 52 及以上版本（自动配置）

从 SDK 52 开始，当使用 `expo/metro-config` 时，Metro 打包器的 monorepo 配置会**自动完成**。

如果你是从旧版本的手动配置升级而来，需要从 Metro 配置文件（通常是 `metro.config.js`）中**移除**以下属性：

- `watchFolders`
- `resolver.nodeModulesPath`
- `resolver.extraNodeModules`
- `resolver.disableHierarchicalLookup`

移除后，务必执行以下命令清除缓存：

```sh
npx expo start --clear
```

> **提示**：`--clear` 参数会清除 Metro 的缓存，确保新的配置生效。如果遇到莫名的模块解析错误，首先尝试清除缓存。

### SDK 52 之前的版本（手动配置）

在旧版本中，需要手动配置 Metro，让它监听整个仓库目录并调整模块解析路径：

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 项目根目录（即当前文件向上两级的位置）
const projectRoot = __dirname;
// monorepo 的根目录（即当前文件向上两级的位置）
const monorepoRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(projectRoot);

// 让 Metro 监听整个 monorepo 目录
config.watchFolders = [monorepoRoot];

// 配置模块解析路径，同时查找项目级和 monorepo 级的 node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

> **关键术语解释**
>
> - **watchFolders**：Metro 需要监听的文件目录列表。在 monorepo 中，必须包含 monorepo 根目录，否则 Metro 无法感知共享包中的文件变更。
> - **nodeModulesPaths**：模块解析时查找 `node_modules` 的路径列表。在 monorepo 中需要同时查找项目自身和 monorepo 根目录的 `node_modules`。

---

## 搭建 Monorepo 目录结构

一个典型的 Expo monorepo 结构包含以下部分：

- `apps/` 目录：存放各个应用程序
- `packages/` 目录：存放共享库（组件库、工具库等）
- 根目录配置文件：定义 workspace 规则

```
monorepo/
├── apps/
│   └── cool-app/        # Expo 应用
├── packages/
│   └── cool-package/    # 共享库
├── package.json         # 根配置（Bun/npm/Yarn）
└── pnpm-workspace.yaml  # pnpm 专用配置（如使用 pnpm）
```

### Bun / npm / Yarn 的 workspace 配置

在根目录的 `package.json` 中定义 workspace 的 glob 模式：

```json
{
  "name": "monorepo",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["apps/*", "packages/*"]
}
```

> **注意**：`"private": true` 是必须的，workspace 根包不应被发布到 npm。

### pnpm 的 workspace 配置

pnpm 使用独立的 YAML 配置文件。在根目录创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 创建第一个应用

在 `apps/` 目录下使用你偏好的包管理器生成 Expo 应用：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56 apps/cool-app

# yarn
yarn create expo-app --template default@sdk-56 apps/cool-app

# pnpm
pnpm create expo-app --template default@sdk-56 apps/cool-app

# bun
bun create expo --template default@sdk-56 apps/cool-app
```

创建完成后，在**根目录**执行安装命令以验证所有依赖是否正确链接：

```sh
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install

# bun
bun install
```

---

## 创建并使用共享库

### 初始化共享库

在 `packages/` 目录下创建新的包：

```sh
# npm
mkdir -p packages/cool-package && cd packages/cool-package && npm init

# yarn
mkdir -p packages/cool-package && cd packages/cool-package && yarn init

# pnpm
mkdir -p packages/cool-package && cd packages/cool-package && pnpm init

# bun
mkdir -p packages/cool-package && cd packages/cool-package && bun init -y
```

### 添加入口文件

在 `packages/cool-package/` 中创建入口文件（例如 `index.js`），导出一个简单的字符串：

```javascript
export const greeting = 'Hello!';
```

### 在应用中引用共享库

在应用的 `package.json` 的 `dependencies` 中添加对共享库的引用：

**对于 npm / Yarn Classic：**

```json
"cool-package": "*"
```

**对于 Bun / pnpm / Yarn Berry（使用更严格的 workspace 解析）：**

```json
"cool-package": "workspace:*"
```

> **关键术语解释**
>
> - **`workspace:*`**：一种特殊的版本协议，告诉包管理器从本地 workspace 中解析这个依赖，而不是从 npm 远程仓库获取。这可以防止意外引用远程版本。

完整的 `apps/cool-app/package.json` 示例：

```json
{
  "name": "cool-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "cool-package": "*",
    "expo": "~56.0.0",
    "expo-status-bar": "~55.0.0",
    "react": "19.2.3",
    "react-native": "0.85"
  }
}
```

添加依赖后，再次在**根目录**执行安装命令：

```sh
# 根据你的包管理器选择
npm install
# 或 yarn install
# 或 pnpm install
# 或 bun install
```

### 在应用代码中使用共享库

在 `App.js`（或 `App.tsx`）中导入并使用共享库的导出内容：

```jsx
import { greeting } from 'cool-package';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{greeting}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
```

运行应用，你应该能看到屏幕上显示 "Hello!"。

---

## 常见问题与解决方案

### 1. 隔离依赖（Isolated Dependencies）

从 **SDK 54** 开始，Expo 支持隔离安装（isolated installations）。

> **警告**：如果你使用的是 **SDK 53**，必须禁用隔离依赖以避免构建失败。

**pnpm 和 Bun** 的包管理器强制执行严格的依赖树（strict dependency tree），这意味着应用无法访问未在其 `package.json` 中显式声明的传递依赖。这在 npm/Yarn 的提升（hoisting）模式下通常不是问题，但在 pnpm/Bun 中是常见错误来源。

> **关键术语解释**
>
> - **严格依赖树**：pnpm 的默认行为，每个包只能访问自己在 `package.json` 中声明的依赖，不能"幽灵式"地使用被提升到上层的未声明依赖。
> - **幽灵依赖（Phantom Dependencies）**：指代码中引用了未在 `package.json` 中声明、但因 hoisting 而恰好能被找到的包。这是一种不健康的依赖模式。

如果 pnpm 的严格模式导致问题，可以切换回提升模式。在根目录创建或编辑 `.npmrc` 文件：

```yaml
nodeLinker=hoisted
```

> **基于经验建议**：虽然提升模式能解决兼容性问题，但建议优先修复依赖声明而非切换到提升模式。长期来看，严格的依赖树能让项目更加健壮，避免幽灵依赖带来的隐患。

### 2. 重复的原生包（Duplicate Native Packages）

> **警告**：同一个 monorepo 中不能存在多个版本的 React Native。重复的 React、Turbo Module 或 Expo 模块会导致运行时错误或编译失败。

**诊断重复包**

使用包管理器的命令检查是否存在重复依赖：

```sh
# npm
npm why react-native

# yarn
yarn why react-native

# pnpm
pnpm why --depth=10 react-native

# bun
bun pm why react-native
```

**强制统一版本**

使用 `resolutions`（Yarn）或 `overrides`（npm）在根目录的 `package.json` 中强制指定特定版本：

**Yarn（resolutions）：**

```json
{
  "name": "monorepo",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "resolutions": {
    "react": "^19.2.3"
  }
}
```

**npm（overrides）：**

```json
{
  "name": "monorepo",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "overrides": {
    "react": "^19.2.3"
  }
}
```

> **关键术语解释**
>
> - **resolutions / overrides**：一种强制机制，用于确保整个依赖树中某个包只使用指定的版本，即使不同的依赖声明了不同的版本范围。

**防止原生模块编译冲突**

从 **SDK 54** 开始，可以在应用配置（`app.json` 或 `app.config.js`）中启用自动链接模块解析（autolinking module resolution），以使 Metro 的模块解析与原生构建保持一致。该功能在 **SDK 55** 中成为默认行为：

```json
{
  "expo": {
    "experiments": {
      "autolinkingModuleResolution": true
    }
  }
}
```

> **基于文档内容推导**：`autolinkingModuleResolution` 实验性功能的核心目的是解决 monorepo 中 Metro（JS 打包器）和原生构建系统（Gradle / Xcode）对模块解析路径不一致的问题。开启后，两者的模块解析行为将统一，从而减少因路径不一致导致的"JS 端能引用到但原生端找不到"的问题。

> **注意**：TV（电视）项目需要对 React Native 依赖进行特殊调整，详情请参阅 Expo 的[电视构建文档](https://docs.expo.dev/guides/building-for-tv/)。

### 3. 脚本路径错误（Script Path Errors）

React Native 的 npm 包同时包含 JavaScript 资源和原生资源。构建脚本通常使用**静态相对路径**来引用这些资源，但在 monorepo 中，依赖提升（hoisting）会导致这些路径失效。

**解决方案：使用 Node.js 动态解析路径**

不要使用硬编码的相对路径，而是使用 `require.resolve()` 来动态定位包的位置。

**Android（`android/app/build.gradle`）：**

将静态路径替换为动态 Node.js 解析：

```groovy
apply from: new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), "../react.gradle")
```

**iOS（`ios/Podfile`）：**

同样使用 Node.js 动态解析：

```ruby
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")
```

> **关键术语解释**
>
> - **`require.resolve()`**：Node.js 内置方法，返回模块的绝对路径。在 monorepo 中，它可以正确找到被提升后的包的实际位置，而不是依赖于固定的相对路径。

**修复第三方库的路径问题**

如果第三方库仍然使用静态路径，可以使用 [patch-package](https://github.com/ds300/patch-package) 工具来打补丁：

```sh
# 安装 patch-package
npm install patch-package --save-dev
```

然后在 `package.json` 的 `scripts` 中添加 postinstall 钩子：

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

> **基于经验建议**：在 monorepo 中遇到构建脚本路径错误时，优先检查 `build.gradle` 和 `Podfile` 中是否有硬编码的 `../node_modules/` 路径。将其替换为动态解析是解决此类问题最可靠的方式。同时，对于依赖的第三方原生库，建议在上游提 PR 修复路径问题，而非长期依赖 patch-package。

---

## 各 SDK 版本关键变更总结

| SDK 版本 | 变更内容 |
|----------|---------|
| **SDK 52** | Metro monorepo 配置变为自动化，不再需要手动设置 `watchFolders` 等属性 |
| **SDK 53** | 需要手动禁用隔离依赖以避免原生构建失败 |
| **SDK 54** | 新增隔离依赖支持；引入 `experiments.autolinkingModuleResolution` 实验性功能 |
| **SDK 55** | `autolinkingModuleResolution` 成为默认行为 |
| **SDK 56** | 当前版本，完全自动化的 monorepo 支持 |

---

## 快速排查清单

当你在 monorepo 中遇到问题时，可以按照以下清单逐步排查：

1. **模块找不到？** → 执行 `npx expo start --clear` 清除 Metro 缓存
2. **SDK 52+ 仍有旧配置？** → 检查并移除 `metro.config.js` 中的 `watchFolders`、`resolver.nodeModulesPath` 等旧属性
3. **pnpm 构建失败？** → 检查是否需要设置 `nodeLinker=hoisted`
4. **原生编译错误？** → 运行 `npm why react-native`（或对应包管理器命令）检查是否有重复版本
5. **脚本路径错误？** → 将 `build.gradle` 和 `Podfile` 中的硬编码路径替换为 `require.resolve()` 动态解析
6. **多版本 React？** → 在根 `package.json` 中使用 `resolutions` 或 `overrides` 强制统一版本

---

## 文档导航

- **上一页**：[lifecycle listeners](./41__lifecycle-listeners.md)
- **下一页**：[logging](./43__logging.md)
