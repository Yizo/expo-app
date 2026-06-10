# React Compiler

## 文档解决的问题

这篇文档解决的是：如何在 Expo 应用中启用 React Compiler、如何渐进式采用、哪些代码会受影响，以及有哪些边界条件。

## 适用场景

- 你想提升 React 组件渲染性能。
- 你看到“自动 memoization”，想知道它是否能替代部分 `useMemo` / `useCallback`。
- 你希望在 Expo 项目中安全开启 React Compiler，而不是一次性全量切换。

## React Web 开发者先要补的背景

- `React Compiler` 是 React 的编译期优化能力，不是运行时库。
- `memoization` 指“缓存计算 / 组件结果，减少不必要重复执行”。
- 在 Web 里你可能会手写 `React.memo`、`useMemo`、`useCallback`；这里文档强调的是“自动化优化”。
- `Babel` 是构建阶段的代码转换工具。React Compiler 在 Expo 里通过 Babel 插件接入。

## 核心概念

### React Compiler 的价值

文档明确说明，React Compiler 会自动对组件和 hooks 做 memoization，从而实现更细粒度的响应式更新，并可能带来明显性能提升。

### 它不是“零前提”

文档要求先检查项目兼容性：

```sh
# npm
npx react-compiler-healthcheck@latest
```

其他包管理器命令文档也给出了。

文档明确说明，这个检查通常是在验证你的项目是否遵守 React 规则。

## 启用流程

### 1. 做兼容性健康检查

命令：

```sh
npx react-compiler-healthcheck@latest
```

作用：先看你的代码是否基本符合 React Compiler 预期。

### 2. 安装编译器相关依赖

文档明确要求安装：

- `babel-plugin-react-compiler`
- React compiler runtime

但当前文档未给出具体安装命令。

### 3. 在 app config 中打开实验开关

文档给出配置：

```json
{
  "expo": {
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

### 4. Babel 侧自动配置说明

文档明确说明：Expo SDK 54 及以后，Babel 会自动配置。

这意味着你不一定要手动拼完整 Babel 插件链。

## Lint 与代码规范

文档建议运行：

```sh
npx expo lint
```

作用：为项目设置 ESLint，并接上与 React Compiler 相关的规则。

文档明确说明：

- SDK 55+ 中，`eslint-config-expo` 默认包含 React Compiler lint 规则。
- 如果你以前手动装过 `eslint-plugin-react-compiler`，可以卸载并从 ESLint 配置中移除。

## 渐进式采用

这是这篇文档的重点之一。

### 只让部分文件参与编译

文档给出做法：

1. 如果项目没有 `babel.config.js`，先运行：

```sh
npx expo customize babel.config.js
```

2. 在 `babel.config.js` 中配置 `react-compiler.sources`。

示例逻辑是按文件名筛选：

```js
sources: filename => {
  return filename.includes('src/path/to/dir');
}
```

这对 React Web 开发者很好理解：相当于只对一部分目录先开优化。

### 修改 Babel 配置后要重启 Metro

文档明确要求：

```sh
npx expo start --clear
```

作用：重启并清理 Metro bundler 缓存，让 Babel 配置真正生效。

### 对特定组件或文件禁用

文档提供 `"use no memo"` 指令：

```jsx
function MyComponent() {
  'use no memo';
  return <Text>Will not be optimized</Text>;
}
```

它的含义是：在局部范围内主动退出 React Compiler 优化。

## 使用层面的影响

### 自动优化会改变你的手写优化策略

文档明确说明：

- 可以移除部分 `useCallback`
- 可以移除部分 `useMemo`
- 可以移除部分 `React.memo`

换句话说，这篇文档鼓励你把一些“手工性能调优”交给编译器。

### 类组件不会被优化

文档明确说明，类组件不会被优化，应迁移到函数组件。

### 作用范围有限

文档明确说明 Expo 的实现只会：

- 处理应用代码
- 不处理 `node_modules`
- 只在客户端打包时启用
- 在服务器渲染中禁用

## 配置项说明

文档给出 `babel-preset-expo` 中的 `react-compiler` 配置对象示例：

```js
'react-compiler': {
  compilationMode: 'all',
  panicThreshold: 'all_errors',
},
web: {
  'react-compiler': {
    // Web-only settings...
  },
}
```

可理解为：

- 顶层 `react-compiler`：通用配置
- `web.react-compiler`：Web 专属配置

文档没有逐项解释这些字段的完整语义，因此如果你需要精细参数定义，当前文档未展开。

## React Web 开发者最容易误解的点

### 1. 它不是 React 运行时自动“变快”

它依赖编译阶段配置，不是引入一个 hook 就结束。

### 2. 不是所有代码都会被处理

文档明确说明只处理应用代码，不处理 `node_modules`。

### 3. 不是所有 React 风格都兼容

健康检查的意义就在于：你的代码必须基本遵守 React 规则。

### 4. 手写 memo 不一定还值得保留

文档已经暗示：一些过去在 Web 中常见的手动优化方式，未来可以被编译器替代。

## 实际开发建议

- 基于经验建议：先跑健康检查，再决定是否开启，不要先开了再到处修问题。
- 基于经验建议：优先对一个目录做渐进式试点，而不是全仓库一次性打开。
- 基于文档内容推导：如果团队里还保留大量类组件，React Compiler 的收益会被明显削弱。

## 文档明确说明

- React Compiler 可自动 memoize 组件和 hooks。
- 需要先做兼容性检查。
- 通过 `expo.experiments.reactCompiler` 开启。
- SDK 54+ Babel 自动配置。
- SDK 55+ `eslint-config-expo` 默认带相关 lint 规则。
- 可以通过 Babel 配置做渐进式采用。
- 可以用 `"use no memo"` 选择退出。
- 类组件不会被优化。
- 仅作用于应用代码与客户端打包。

## 基于文档内容推导

- React Compiler 更适合代码风格较规范、函数组件占主流的项目。
- 如果你的项目依赖很多手工 memo 习惯，启用后最好重新审视哪些优化还需要保留。
- 渐进式启用是比“全量切换”更稳妥的落地路径。

## 当前文档未涉及

- React Compiler 的底层实现原理。
- 编译前后性能如何量化评估。
- 具体安装命令与完整 Babel 配置参数手册。
