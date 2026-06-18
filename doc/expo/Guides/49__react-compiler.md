# React Compiler（React 编译器）

> **原文地址**：[https://docs.expo.dev/guides/react-compiler/](https://docs.expo.dev/guides/react-compiler/)

---

## 概述

React Compiler（React 编译器）是一项能够显著提升应用运行速度的特性。它通过**自动处理 Hook 和组件的记忆化（memoization）**，省去手动优化的繁琐工作，从而让界面更加流畅、响应更加迅速。

### 关键术语解释

| 术语 | 说明 |
|------|------|
| **Memoization（记忆化）** | 一种优化技术，通过缓存计算结果来避免重复计算。在 React 中，记忆化可以防止不必要的重新渲染。 |
| **Hook** | React 提供的特殊函数（如 `useState`、`useEffect`、`useCallback` 等），允许在函数组件中使用状态和其他 React 特性。 |
| **Babel 插件** | Babel 是 JavaScript 编译工具，插件可以扩展其功能。React Compiler 通过 Babel 插件在编译阶段对代码进行优化。 |
| **ESLint** | JavaScript/TypeScript 的静态代码分析工具，用于发现代码中的问题和不符合规范的地方。 |
| **手动记忆化** | 开发者手动使用 `useCallback`、`useMemo`、`React.memo` 等 API 来缓存函数、计算结果或组件，以避免不必要的重新渲染。 |

---

## 启用步骤

启用 React Compiler 分为三个步骤：健康检查、安装依赖、配置应用。

### 第一步：健康检查

在启用 React Compiler 之前，首先需要验证你的代码库是否遵循了标准的 React 规则（Rules of React）。使用官方提供的健康检查工具进行检测：

```sh
# npm
npx react-compiler-healthcheck@latest

# yarn
yarn dlx react-compiler-healthcheck@latest

# pnpm
pnpm dlx react-compiler-healthcheck@latest

# bun
bunx react-compiler-healthcheck@latest
```

> **基于经验建议**：健康检查工具会扫描你的代码并报告违反 React 规则的地方。建议在启用 React Compiler 之前，先修复所有报告的问题，否则编译器可能无法正确优化你的代码，甚至可能引入运行时错误。

### 第二步：安装依赖

根据你的 Expo SDK 版本，安装所需的 Babel 插件和运行时依赖。

#### SDK 54 及以上版本

Babel 配置已自动完成，无需手动安装 Babel 插件。

#### SDK 53

```sh
# npm
npx expo install babel-plugin-react-compiler@beta

# yarn
yarn expo install babel-plugin-react-compiler@beta

# pnpm
pnpm expo install babel-plugin-react-compiler@beta

# bun
bun expo install babel-plugin-react-compiler@beta
```

#### SDK 52 及以下版本

```sh
# npm
npx expo install babel-plugin-react-compiler@beta react-compiler-runtime@beta

# yarn
yarn expo install babel-plugin-react-compiler@beta react-compiler-runtime@beta

# pnpm
pnpm expo install babel-plugin-react-compiler@beta react-compiler-runtime@beta

# bun
bun expo install babel-plugin-react-compiler@beta react-compiler-runtime@beta
```

> **注意**：SDK 52 及以下版本需要额外安装 `react-compiler-runtime@beta` 运行时包，而 SDK 53 只需要 Babel 插件。SDK 54 及以上版本则完全自动化处理。

### 第三步：在应用配置中启用

在 `app.json` 或 `app.config.js` 中开启实验性功能：

```json
{
  "expo": {
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

> **基于经验建议**：`reactCompiler` 被放在 `experiments` 下，说明该功能仍处于实验阶段。在将其用于生产环境之前，务必进行充分的测试。

---

## 配置 Linter（ESLint）

React Compiler 提供了配套的 ESLint 插件，帮助你在编码阶段发现可能导致编译器无法优化的代码模式。

### 初始化 ESLint

使用 Expo 提供的标准命令初始化 ESLint 配置，然后根据 SDK 版本进行后续操作。

#### SDK 55 及以上版本

相关规则已内置在默认配置中。如果之前安装过旧版插件，请将其移除。

#### SDK 54 及以下版本

将 React Compiler 的 ESLint 插件作为开发依赖安装：

```sh
# npm
npx expo install eslint-plugin-react-compiler -- -D

# yarn
yarn expo install eslint-plugin-react-compiler -- -D

# pnpm
pnpm expo install eslint-plugin-react-compiler -- -D

# bun
bun expo install eslint-plugin-react-compiler -- -D
```

然后，更新你的 ESLint 扁平配置文件（flat config），引入推荐规则集并忽略构建输出目录：

```js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactCompiler = require('eslint-plugin-react-compiler');

module.exports = defineConfig([
  expoConfig,
  reactCompiler.configs.recommended,
  {
    ignores: ['dist/*'],
  },
]);
```

> **基于经验建议**：ESLint 插件能在你编写代码时就提示潜在的兼容性问题，强烈建议配合使用。它可以帮助你提前发现那些会阻止 React Compiler 正确优化的代码模式（例如违反 React 规则的写法）。

---

## 渐进式采用（Gradual Adoption）

如果你的项目较大，不方便一次性对整个代码库启用 React Compiler，可以通过以下两种方式进行渐进式采用。

### 方式一：按目录启用

通过生成自定义 Babel 配置文件，并定义一个文件匹配函数来限制编译器的作用范围：

```js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': {
            sources: filename => {
              // 匹配需要纳入 React Compiler 优化的文件路径
              return filename.includes('src/path/to/dir');
            },
          },
        },
      ],
    ],
  };
};
```

> **基于经验建议**：推荐从项目中最稳定、遵循 React 规则最严格的目录开始，逐步扩大 `sources` 的匹配范围，直到覆盖整个项目。

**重要提示**：每次修改 Babel 配置后，必须清除缓存并重新启动开发服务器：

```sh
# npm
npx expo start --clear

# yarn
yarn expo start --clear

# pnpm
pnpm expo start --clear

# bun
bun expo start --clear
```

### 方式二：按文件/组件排除

对于个别不希望被优化的文件或组件，可以在函数体的顶部添加 `"use no memo"` 指令字符串来跳过优化：

```jsx
function MyComponent() {
  'use no memo';

  return <Text>不会被优化的组件</Text>;
}
```

> **基于文档内容推导**：`"use no memo"` 是一种文件级/组件级的退出机制（opt-out），类似于 React 中的 `"use client"` 或 `"use strict"` 指令。当你发现某些组件在编译器优化后出现异常行为时，可以使用此指令临时排除，然后再排查问题。

---

## 使用指南

### React 官方 Playground

React 官方提供了一个在线 Playground（[React Playground](https://playground.react.dev/)），可以帮助你直观地了解 React Compiler 的工作原理和优化效果。

### 移除手动记忆化代码

React Compiler 会自动处理记忆化，因此开发者应当**删除手动实现的记忆化代码**，包括：

- `useCallback` — 手动缓存函数引用
- `useMemo` — 手动缓存计算结果
- `React.memo` — 手动缓存组件渲染

> **基于文档内容推导**：保留手动记忆化代码不仅多余，还可能与 React Compiler 的自动优化产生冲突，导致性能反而下降。建议在启用编译器后，逐步清理这些手动优化的代码。

### 类组件不受优化

React Compiler **仅优化函数组件**。类组件（Class Components）不会被编译器处理。如果你的项目中存在类组件，建议将其重构为函数组件以获得编译器的优化收益。

### 仅作用于客户端应用代码

Expo 的实现将 React Compiler 的执行范围限制在**客户端应用代码**中，以下场景不会被优化：

- **外部依赖（node_modules）**：第三方库的代码不会被编译器处理。
- **服务端环境**：服务端代码不在编译器的作用范围内。

---

## 高级配置

你可以通过 Babel 配置对象直接向 React Compiler 的 Babel 插件传递额外参数，包括设置编译模式、错误阈值以及 Web 平台特定的覆盖配置：

```js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': {
            // 直接传递给 React Compiler Babel 插件的参数
            compilationMode: 'all',
            panicThreshold: 'all_errors',
          },
          web: {
            'react-compiler': {
              // 仅在 Web 平台生效的配置...
            },
          },
        },
      ],
    ],
  };
};
```

### 配置参数说明

| 参数 | 说明 |
|------|------|
| `compilationMode` | 编译模式。`'all'` 表示对所有组件和 Hook 进行编译优化。 |
| `panicThreshold` | 错误阈值。`'all_errors'` 表示遇到所有类型的错误时都会触发报告，帮助开发者发现编译器无法处理的代码。 |
| `web` 下的 `react-compiler` | 仅在 Web 平台生效的特定配置，可以实现跨平台的差异化编译策略。 |

> **基于经验建议**：在开发阶段，建议将 `panicThreshold` 设置为 `'all_errors'` 以捕获所有潜在问题；在生产构建时，可以考虑调整该值以避免编译错误阻断构建流程。

---

## 注意事项与限制

1. **实验性功能**：React Compiler 在 Expo 中作为实验性功能提供，API 和行为可能在后续版本中发生变化。
2. **仅优化函数组件**：类组件不会被编译器处理，需要重构为函数组件。
3. **遵循 React 规则**：代码必须严格遵守 React 的规则（Rules of React），否则编译器可能无法正确优化或产生错误结果。
4. **不处理外部依赖**：`node_modules` 中的第三方库代码不会被编译器优化。
5. **不处理服务端代码**：编译器仅在客户端应用代码中生效。
6. **Babel 配置变更后需清缓存**：每次修改 Babel 配置后，必须使用 `--clear` 参数重新启动开发服务器，否则变更不会生效。
7. **版本差异**：不同 SDK 版本的安装和配置步骤有所不同，请根据你的实际版本选择对应的操作方式。

---

## 文档导航

- **上一页**：[new architecture](./48__new-architecture.md)
- **下一页**：[introduction](./50__introduction.md)
