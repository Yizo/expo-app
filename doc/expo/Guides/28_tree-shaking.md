# Tree shaking and code removal 学习整理

## 文档解决的问题

这篇文档解决的是：Expo CLI 在生产构建时如何删除无用代码，以及开发者如何写出更容易被删除的代码，从而减小 bundle、加快启动。

对 React Web 开发者来说，tree shaking 不陌生，但本文覆盖的不只是 ESM 级别的未使用导出删除，还包括平台条件代码、开发代码、环境变量内联、服务端代码剪裁等 Expo / Metro 特有语境。

## 适用场景

- 你在优化 Web bundle 体积。
- 你要减少 Native OTA 下载体积。
- 你想理解 `Platform.OS`、`__DEV__`、`EXPO_PUBLIC_*` 为什么会影响产物。
- 你想启用 Expo 的实验性跨模块 tree shaking。

## 核心概念

### Tree shaking 是什么

文档把它定义为：

- **dead code removal**
- 在生产 bundle 中移除未使用代码

并明确说 Expo CLI 会结合 minification 等手段完成这件事。

## 文档中的几种代码移除方式

### 1. Platform shaking

Expo 会为 Android、iOS、Web 分别创建 bundle，并根据平台删除只属于其他平台的代码。

前提条件很关键：

- 必须在当前文件里直接从 `react-native` 导入 `Platform`
- 并直接使用 `Platform.select` 或 `Platform.OS`

如果你把 `Platform.OS` 重新导出到别的模块，再间接引用，文档明确说这种情况**不会**被平台裁剪。

这是一种**按文件、仅生产环境**生效的优化。

### 2. 删除开发专用代码

文档推荐使用：

- `process.env.NODE_ENV`
- `__DEV__`

在生产构建时，这些条件会先做常量折叠，再由 minifier 移除不可达分支。

### 3. 用 `EXPO_PUBLIC_*` 删除自定义功能代码

文档说明：

- `EXPO_PUBLIC_` 环境变量会在 minify 前被内联
- 因而可用于删掉某些生产不需要的分支

但有两个边界：

- 这不适用于 server code
- 库作者不应使用 `EXPO_PUBLIC_`，因为它只在应用代码里出于安全原因被处理

### 4. 删除服务端代码

文档讨论了：

```js
typeof window === 'undefined'
```

在 `babel-preset-expo` 下，服务端打包时会被替换为 `true`，再由 minifier 继续移除无关分支。

如果你想在 Web 客户端也替换它，需要给 `babel-preset-expo` 配置：

- `{ minifyTypeofWindow: true }`

但默认不启用，因为 Web Worker 没有 `window`。

### 5. React Native Web barrel file 优化

文档说明：如果你用 ESM 静态导入 `react-native`，`babel-preset-expo` 会把它转换成更具体的 `react-native-web/dist/exports/...` 路径，从而减少无关内容进入 bundle。

## 跨模块未使用导入导出删除

这是文档中更“传统意义”的 tree shaking，但被标为：

- SDK 52+ 实验性能力

它能跨模块分析 `import` / `export`，删除没有被使用的导入导出。

关键前提：

- 只对 **ESM** 生效
- `module.exports` / `require` 无法参与这套 tree shaking

文档列出的注意点非常关键：

- 不要加 `@babel/plugin-transform-modules-commonjs` 这类把 ESM 转成 CJS 的 Babel 插件
- 标记了 side-effects 的模块不会被移除
- `export * from "..."` 在条件允许时会被展开后优化
- Expo SDK 自带模块都是 ESM，因此可以被充分 tree-shake

## 启用方式

### `experimentalImportSupport`

文档说明：

- SDK 54 起默认开启
- 老版本可在 `metro.config.js` 里手动启用

### 两个环境变量

```sh
EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1
EXPO_UNSTABLE_TREE_SHAKING=1
```

都只在**生产模式**下使用。

之后运行：

```sh
npx expo export
```

查看效果。

## Barrel files、递归优化与 side effects

### Barrel files

文档明确说，启用 Expo tree shaking 后：

- `export * from './icons'` 可以被展开并继续优化

这对大量图标库场景很有价值。

### 递归优化

如果某个函数之所以“被保留”，只是因为它被另一个最终也会被删除的函数引用，Expo 会递归重新扫描模块，最多递归 5 次。

### Side effects

可在 `package.json` 里通过：

```json
{
  "sideEffects": ["./src/*.js"]
}
```

声明副作用模块。

文档还说明：

- 开启 Expo tree shaking 后，可以安全开启 `inlineRequires`
- 但如果**没有** Expo tree shaking，单独开启 `inlineRequires` 可能改变副作用执行顺序

## 如何写出更容易被摇掉的代码

文档给出的建议是：不要写成条件 `require()`，而应使用 ESM `import`，再在条件中调用导入的函数。

这对静态分析更友好，也更符合 TypeScript 和现代打包器的优化方向。

## 注意事项、限制条件与坑点

- 绝大多数优化只在**生产构建**生效。
- 平台裁剪按文件工作，间接封装的 `Platform.OS` 不会被识别。
- 跨模块 tree shaking 只支持 ESM，不支持 CommonJS。
- 这是实验性能力，会改变 Metro 的 bundling 结构，可能增加生产构建的内存 / 处理成本。
- `EXPO_PUBLIC_*` 不适用于 server bundle，也不适合库作者使用。
- `typeof window` 的客户端替换默认关闭。

## React Web 开发者最容易误解的点

- **误解 1：tree shaking 只等于“未使用导出删除”。**
  本页展示的范围更大，还包括平台、环境变量和服务端分支裁剪。
- **误解 2：把 `Platform.OS` 封装一下也一样能被优化。**
  文档明确说不行。
- **误解 3：只要开了某个开关，CommonJS 也会被自动优化。**
  文档明确说不能。

## 实际开发建议

- 基于经验建议：写应用代码时尽量保持 ESM 语法，不要随手引入把模块转成 CommonJS 的 Babel 插件。
- 基于文档内容推导：如果你特别依赖图标库、工具库的按需优化，启用 Expo tree shaking 的价值会更高。
- 基于文档内容推导：在跨平台项目中，把平台条件代码直接写在当前文件里，更有利于平台裁剪。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo CLI 在生产构建中使用多种代码移除策略
- `Platform.OS` / `Platform.select` 可触发平台裁剪
- `NODE_ENV`、`__DEV__`、`EXPO_PUBLIC_*` 会影响代码移除
- 实验性跨模块 tree shaking 依赖 ESM 和若干开关
- side effects 会阻止无用模块移除

### 基于文档内容推导

- Expo 的 tree shaking 不是单一开关，而是一组“让代码更可静态分析”的优化系统。
- 要想真正吃到优化收益，代码写法本身必须配合。
- 对 Web 与 OTA 体积敏感的项目，理解这篇文档的价值很高。

## 当前文档未涉及

- 各项优化具体节省了多少体积
- Babel preset 的完整配置示例
- 与其他 bundler 的 tree shaking 行为逐项对比

<!-- NAVIGATION START -->
---
[← 上一页：Analyzing JavaScript bundles with Expo Atlas and Lighthouse 学习整理](./27_analyzing-bundles.md) | [下一页：Minifying JavaScript 学习整理 →](./29_minify.md)
<!-- NAVIGATION END -->
