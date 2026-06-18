# Tree Shaking 与代码移除（Tree shaking and code removal）

> **原文地址**：<https://docs.expo.dev/guides/tree-shaking/>
>
> 本文档基于 Expo 官方文档翻译整理，旨在帮助中文开发者理解 Tree Shaking 的原理与实践。

---

## 什么是 Tree Shaking？

**Tree Shaking**（树摇优化）是一种 **死代码消除（dead code elimination）** 技术。它的核心思想是：在最终打包（bundle）时，自动检测并移除那些 **从未被使用** 的代码，从而减小产物体积、加快加载速度。

> **初学者须知**：
> - **打包（Bundle）**：将项目中所有 JavaScript 文件合并为一个或少数几个文件的过程。移动端和 Web 应用通常都需要这一步。
> - **死代码（Dead Code）**：虽然存在于源代码中，但在运行时永远不会被执行到的代码。例如：导出了但从未被导入的函数、条件永远为 `false` 的分支等。
> - **Minification（代码压缩）**：通过缩短变量名、删除空格和注释等方式进一步减小代码体积，通常与 Tree Shaking 配合使用。

Expo CLI 会为 Android、iOS、tvOS 和 Web 等平台分别生成独立的 JavaScript 包。通过 Tree Shaking 移除未使用的代码段，可以 **减小初始加载时间**。这一过程还结合了平台摇（platform shaking）、常量折叠（constants folding）以及代码压缩等策略。

---

## 平台摇（Platform Shaking）

Expo CLI 会为每个操作系统生成 **独立的包**，这一过程称为 **平台摇（Platform Shaking）**。

### 工作原理

当代码中使用 React Native 的 `Platform` 模块进行 **条件判断** 时，不属于目标平台的代码分支会在生产构建中被自动移除。

> **初学者须知**：
> - **`Platform` 模块**：React Native 内置的工具，用于判断当前运行的操作系统（如 `ios`、`android`）。
> - **生产构建（Production Build）**：面向最终用户的正式版本构建，与开发构建（Development Build）相对。生产构建会启用各种优化。

**关键限制**：平台摇仅在 **直接导入** `Platform` 属性时生效。如果你对 `Platform` 进行了 **重新导出（re-export）**，平台摇将无法正常工作。此外，平台摇在生产构建中以 **逐文件** 的方式运行。

### 代码示例

**源代码：**

```js
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  console.log('Hello on iOS');
}
```

**在 Android 平台构建时，上面的条件分支会被完全移除（空文件）：**

```js
// 在 Android 上为空文件
```

**在 iOS 平台构建时，条件判断被消除，只保留分支内容：**

```js
console.log('Hello on iOS');
```

### 关于 `process.env.EXPO_OS`

`process.env.EXPO_OS` 变量也可以用来标识目标平台（如 `"ios"`、`"android"` 等），但它 **不支持** 平台摇优化。原因在于 Metro 打包器的代码压缩执行顺序——当压缩器运行时，`EXPO_OS` 的值尚未被内联替换，因此无法用于静态分析来移除死代码。

> **基于经验建议**：优先使用 `Platform.OS` 而非 `process.env.EXPO_OS` 来做平台条件判断，以确保平台摇能正常工作，获得更小的包体积。

---

## 移除仅开发环境使用的代码（Remove Development-only Code）

调试工具和其他仅用于开发的代码应当从生产包中移除。Expo 支持两种方式来标记开发环境专用代码：

1. **`__DEV__`**：React Native 提供的全局布尔变量，在开发环境下为 `true`，在生产环境下为 `false`。
2. **`process.env.NODE_ENV`**：Node.js 标准环境变量，开发环境值为 `"development"`，生产环境值为 `"production"`。

### 工作原理——常量折叠（Constants Folding）

在构建过程中，Expo 会执行 **常量折叠**：将 `__DEV__` 和 `process.env.NODE_ENV` 替换为它们的实际值。替换完成后，那些条件永远为 `false` 的代码分支就变成了死代码，会在 **代码压缩阶段** 被自动移除。

> **初学者须知**：
> - **常量折叠**：编译器/打包器在构建时将变量替换为其已知常量值的过程。例如把 `__DEV__` 替换成 `false`。
> - 这种优化 **仅在生产构建中生效**。在开发环境下，为了保持快速的热更新（Hot Reload）体验，不会执行这些优化。

### 代码示例

**源代码：**

```js
if (process.env.NODE_ENV === 'development') {
  console.log('Hello in development');
}

if (__DEV__) {
  console.log('Another development-only conditional...');
}
```

**常量折叠后（生产环境）：**

```js
if ('production' === 'development') {
  console.log('Hello in development');
}

if (false) {
  console.log('Another development-only conditional...');
}
```

**压缩后（最终产物）：**

```js
// 空文件
```

---

## 自定义代码移除（Custom Code Removal）

你可以使用以 `EXPO_PUBLIC_` 为前缀的环境变量来实现 **自定义的条件代码移除**。这些变量的值会在 **代码压缩之前** 被内联替换到代码中，从而使不满足条件的分支被作为死代码移除。

> **初学者须知**：
> - **`EXPO_PUBLIC_` 前缀变量**：Expo 的特殊环境变量机制。以 `EXPO_PUBLIC_` 开头的变量会被内联到客户端 JavaScript 代码中，可以在应用运行时直接读取。
> - **内联（Inline）**：在构建时将变量引用替换为其字面值。例如 `process.env.EXPO_PUBLIC_DISABLE_FEATURE` 被替换为 `"true"`。

### 安全警告

> **⚠️ 警告**：如果你是 **库的作者**（即编写供他人使用的 npm 包），请 **不要** 在库代码中使用 `EXPO_PUBLIC_` 变量。此外，这些变量 **不适用于** 服务端包（server bundles）。

### 代码示例

**设置环境变量：**

```sh
EXPO_PUBLIC_DISABLE_FEATURE=true
```

**源代码：**

```js
if (!process.env.EXPO_PUBLIC_DISABLE_FEATURE) {
  console.log('Hello from the feature!');
}
```

**变量内联后：**

```js
if (!'true') {
  console.log('Hello from the feature!');
}
```

**压缩后（最终产物）：**

```js
// 空文件
```

> **基于文档内容推导**：通过合理利用 `EXPO_PUBLIC_` 变量，可以在不修改源代码的情况下，通过环境变量控制功能开关，实现按需启用/禁用特定功能，同时确保被禁用的功能代码不会出现在最终产物中。

---

## 移除服务端代码（Removing Server Code）

在 React Native Web 和全栈应用中，区分客户端和服务端代码是常见需求。标准的做法是检查 `window` 对象是否存在。

### 工作原理

Expo 的 Babel 预设（Babel preset）会在 **服务端构建** 时将 `typeof window === 'undefined'` 转换为 `true`。对于 **Web 客户端** 构建，这个检查保持原样不变（除非另有配置）。

> **初学者须知**：
> - **`typeof window === 'undefined'`**：这是 JavaScript 中判断是否在浏览器（客户端）环境的标准方式。在浏览器中 `window` 对象存在，所以表达式为 `false`；在 Node.js 服务端环境中 `window` 不存在，表达式为 `true`。
> - **Babel 预设**：Expo 预配置的一组 Babel 转换规则，用于在构建时将现代 JavaScript/JSX 代码转换为各平台可执行的格式。

**运行环境**：该优化在所有环境中运行，但 `conditional requires`（条件式的 `require` 调用）的移除 **仅在生产构建** 中生效。

### 代码示例

**源代码：**

```js
if (typeof window === 'undefined') {
  console.log('Hello on the server!');
}
```

**服务端构建——常量折叠后：**

```js
if (true) {
  console.log('Hello on the server!');
}
```

**Web 客户端构建——保持不变：**

```js
if (typeof window === 'undefined') {
  console.log('Hello on the server!');
}
```

**服务端构建——压缩后：**

```js
console.log('Hello on the server!');
```

**Web 客户端构建——压缩后（条件分支被保留，因为无法确定结果）：**

```js
if (typeof window === 'undefined') {
  console.log('Hello on the server!');
}
// 如果客户端确认有 window，整个分支可被移除，变为空文件
```

---

## React Native Web 导入优化（React Native Web Imports）

`react-native-web` 包有一个被称为 **"桶文件"（barrel file）** 的入口文件，它重新导出了所有组件。Expo 内置了针对这个桶文件的优化。

> **初学者须知**：
> - **桶文件（Barrel File）**：一个集中导出多个模块的文件，例如 `react-native-web` 的入口文件会将 `View`、`Text`、`Image` 等组件统一导出。使用桶文件虽然方便，但可能导致打包器无法进行 Tree Shaking，从而引入不必要的代码。
> - **ESM（ECMAScript Modules）**：使用 `import`/`export` 语法的现代 JavaScript 模块系统。
> - **CJS（CommonJS）**：使用 `require()`/`module.exports` 语法的传统 Node.js 模块系统。

### ESM 导入（推荐）

使用 `import` 静态导入时，桶文件会被消除，每个组件直接从其独立路径导入：

**源代码：**

```js
import { View, Image } from 'react-native';
```

**优化后：**

```js
import View from 'react-native-web/dist/exports/View';
import Image from 'react-native-web/dist/exports/Image';
```

### CJS 导入（不推荐）

使用 `require()` 时，桶文件会被保留，所有组件都会被引入：

**源代码：**

```js
const { View, Image } = require('react-native');
```

**处理后（桶文件未消除）：**

```js
const { View, Image } = require('react-native-web');
```

> **基于经验建议**：始终使用 ESM 的 `import` 语法而非 CJS 的 `require()`，这样打包器才能将桶文件展开为独立路径导入，避免引入整个 `react-native-web` 包，显著减小 Web 端的包体积。

---

## 移除未使用的导入和导出（Remove Unused Imports and Exports）

> **⚠️ 实验性功能**：从 SDK 52 开始以实验性功能提供。

此功能可以 **自动移除** 跨模块中未使用的导入和导出，有助于：

- 减少 **OTA（Over-The-Air）更新** 的下载体积
- 加快 **Web 端** 的解析速度

> **初学者须知**：
> - **OTA 更新**：Expo 的远程更新机制，允许在不通过应用商店审核的情况下推送 JavaScript 代码更新给用户。

### 限制与注意事项

- 该优化适用于 **所有平台**
- **仅支持 ESM 语法**（`import`/`export`），使用 CJS（`require`/`module.exports`）的文件会被跳过
- **避免使用** 会将 ESM 转换为 CJS 的 Babel 插件，否则此优化将无法生效
- 副作用模块（side-effect modules）和某些特殊的导出模式会被特殊处理
- **所有 Expo SDK 模块** 都支持此优化

### 代码示例

**使用方 `Home.js`：**

```js
import { ArrowUp } from './icons';

export default function Home() {
  return <ArrowUp />;
}
```

**模块 `icons.js`（原始）：**

```js
export function ArrowUp() {
  /* ... */
}

export function ArrowDown() {
  /* ... */
}

export function ArrowRight() {
  /* ... */
}

export function ArrowLeft() {
  /* ... */
}
```

**模块 `icons.js`（优化后——仅保留被使用的 `ArrowUp`）：**

```js
export function ArrowUp() {
  /* ... */
}
```

---

## 启用 Tree Shaking

> **⚠️ 实验性功能**：从 SDK 52 开始提供，需要手动启用。
>
> **📌 注意**：从 **SDK 54** 开始，Tree Shaking 已成为标准功能，无需额外配置。

### SDK 54 及以上版本

无需任何额外配置，Tree Shaking 默认启用。

### SDK 52-53（需要手动配置）

需要在 `metro.config.js` 中配置 Metro 打包器的转换选项，并设置环境变量。

#### 第一步：修改 Metro 配置

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
  },
});

module.exports = config;
```

> **初学者须知**：
> - **Metro**：React Native 官方使用的 JavaScript 打包器（bundler），类似于 Web 开发中的 Webpack。`metro.config.js` 是其配置文件。
> - **`experimentalImportSupport`**：启用 Metro 对 ESM `import`/`export` 语法的实验性支持，使打包器能够理解模块间的导入导出关系，从而识别未使用的代码。

#### 第二步：设置环境变量

在运行构建命令前设置以下环境变量：

```sh
# 启用 Metro 图优化
EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1

# 启用 Tree Shaking
EXPO_UNSTABLE_TREE_SHAKING=1
```

#### 第三步：执行构建

```sh
# npm
npx expo export

# yarn
yarn expo export

# pnpm
pnpm expo export

# bun
bun expo export
```

### 技术细节

- 此功能使用自定义的 **CommonJS 转换插件**，可以与 `inlineRequires` 配合使用
- 树摇优化 **仅适用于生产导出**
- 启用后会 **延迟转换**，直到完整的 bundle 生成后才进行优化——这意味着会 **降低缓存效率**，但能获得 **更优的最终产物**

> **基于文档内容推导**：Tree Shaking 的本质是在完整依赖图构建完成后，从入口点出发进行可达性分析，将不可达的导出标记为死代码并移除。延迟转换虽然牺牲了构建缓存，但能获得全局视角，实现更彻底的优化。

---

## 桶文件处理（Barrel Files）

桶文件是指使用 `export *` 语法集中导出其他模块所有内容的文件。Expo 的 Tree Shaking 会自动 **展开** 桶文件中的星号导出，并根据实际使用情况 **裁剪** 未使用的导出。

### 工作原理

如果一个导出未被任何地方使用，它会被自动移除。但如果桶文件中存在 **不明确的导出**（ambiguous exports），展开操作将无法进行。

> **初学者须知**：
> - **星号导出 `export *`**：将目标模块的所有命名导出重新导出的语法。例如 `export * from './icons'` 会把 `icons.js` 中所有 `export` 的内容都再次导出。

### 代码示例

**桶文件（原始）：**

```js
export * from './icons';
```

**展开后（假设只使用了 `ArrowRight` 和 `ArrowLeft`）：**

```js
export { ArrowRight, ArrowLeft } from './icons';
```

### 使用 Expo Atlas 检查桶文件展开

[Expo Atlas](https://docs.expo.dev/guides/analyzing-bundles/) 是一个包分析工具，可以用来检查桶文件的展开情况。这对于包含大量图标的库（如图标库）尤其有用——你可以直观地看到哪些图标被包含在了最终产物中。

> **基于经验建议**：如果你使用了大型图标库（如 `react-native-vector-icons` 或自定义图标集），务必使用 Expo Atlas 检查是否有意外的图标被打包进来。桶文件展开失败可能导致整个图标库都被打入包中，显著增加体积。

---

## 递归优化（Recursive Optimizations）

Tree Shaking 系统会 **递归地搜索依赖图**，识别未使用的导入。对于每个模块，该过程最多 **重复 5 次**，以在性能和优化彻底性之间取得平衡。

### 为什么需要递归？

有时一个导出看似被使用了，但使用它的那个函数本身也从未被调用——这就需要多层分析才能发现。

### 代码示例

```js
export function foo() {
  // 因为 bar 在 foo 内部被使用，所以 bar 不能被移除。
  bar();
}

export function bar() {}
```

在这个例子中：
- 如果 `foo` 被外部使用 → `foo` 保留，`bar` 也因为被 `foo` 调用而保留
- 如果 `foo` 和 `bar` 都 **未被** 外部使用 → 两者都会被移除

---

## 副作用声明（Side Effects）

Expo CLI 遵循 **Webpack 的 `sideEffects` 约定**。库作者可以在 `package.json` 中声明哪些文件具有副作用。

> **初学者须知**：
> - **副作用（Side Effect）**：模块在被导入时，除了导出值之外还会执行某些"额外操作"的代码。例如：修改全局变量、注册事件监听器、执行 polyfill 等。有副作用的模块即使其导出未被使用，也不能被安全移除。
> - **`sideEffects` 字段**：`package.json` 中的一个数组，用于声明包中哪些文件具有副作用。未被列入的文件可以被安全地 Tree Shake 掉。

### `package.json` 示例

```json
{
  "name": "library",
  "sideEffects": ["./src/*.js"]
}
```

### 副作用声明的影响

- 被声明为有副作用的模块 **不会被移除**，即使其导出未被使用
- 这些模块的 **内联优化也会被禁用**，以保持执行顺序的正确性
- **空的** `sideEffects` 声明（即 `[]`）会被忽略

### 与 `inlineRequires` 的配合

当 Tree Shaking 优化启用时，可以安全地在 Metro 配置中启用 `inlineRequires` 来加快应用启动速度。

> **⚠️ 警告**：如果 **未启用** Tree Shaking 就开启 `inlineRequires`，可能会 **改变代码的执行顺序**，导致难以排查的 bug。

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

module.exports = config;
```

> **基于经验建议**：`inlineRequires` 通过将 `require()` 调用从文件顶部移到实际使用处来延迟模块加载，从而减少启动时的初始化开销。但务必确保 Tree Shaking 已启用，否则模块加载顺序的变化可能引发副作用相关的问题。

---

## 为 Tree Shaking 优化代码（Optimizing for Tree Shaking）

过去，库作者习惯将开发环境的导入隐藏在条件块内部。然而这种做法会 **阻碍静态分析**，也会影响 TypeScript 的类型推断准确性。

### 旧写法（不推荐）

```js
if (process.env.NODE_ENV === 'development') {
  require('./dev-only').doSomething();
}
```

这种写法的问题：
- `require()` 是动态的，打包器无法静态分析其依赖
- TypeScript 无法推断 `require()` 返回值的类型
- 条件块内的 `require()` 可能被保留在生产包中

### 新写法（推荐）

```js
import { doSomething } from './dev-only';

if (process.env.NODE_ENV === 'development') {
  doSomething();
}
```

这种写法的优势：
- 使用 ESM 静态导入，打包器可以完整分析依赖关系
- TypeScript 可以正确推断类型
- 在生产环境中，常量折叠会将条件判断为 `false`，整个模块可以被 **完全清空（emptied）**

> **基于经验建议**：在编写库代码时，始终优先使用 ESM `import` 语法，将条件判断放在导入之后而非包裹导入。这不仅有利于 Tree Shaking，还能改善开发体验（类型提示、跳转定义等）。

---

## 总结与最佳实践

| 优化策略 | 适用场景 | 是否需要手动配置 |
|---------|---------|----------------|
| 平台摇 | 跨平台条件代码 | 否，自动生效 |
| 开发代码移除 | `__DEV__` / `NODE_ENV` 条件 | 否，自动生效 |
| 自定义代码移除 | `EXPO_PUBLIC_` 环境变量 | 否，设置变量即可 |
| 服务端代码移除 | `typeof window` 检查 | 否，自动生效 |
| RN Web 导入优化 | `react-native` 导入 | 否，使用 ESM 即可 |
| 未使用导入移除 | 跨模块死代码 | SDK 54+ 自动；52-53 需配置 |
| Tree Shaking | 全局死代码消除 | SDK 54+ 自动；52-53 需配置 |
| 桶文件展开 | `export *` 文件 | 否，自动处理 |

### 核心原则

1. **始终使用 ESM 语法**（`import`/`export`），避免 CJS（`require`/`module.exports`）
2. **避免重新导出 `Platform`**，直接导入以确保平台摇正常工作
3. **库作者应避免使用 `EXPO_PUBLIC_`** 变量
4. **使用 Expo Atlas** 分析包体积，确认优化效果
5. **在 `package.json` 中正确声明 `sideEffects`**，帮助打包器做出正确决策
6. **从 SDK 54 开始**，Tree Shaking 默认启用——保持 SDK 版本更新是获取最佳优化的最简单方式

---

## 文档导航

- **上一页**：[analyzing bundles](./28__analyzing-bundles.md)
- **下一页**：[minify](./30__minify.md)
