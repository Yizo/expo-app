> 原文地址：https://docs.expo.dev/guides/minify/

# JavaScript 代码压缩（Minification）

本指南介绍如何在 Expo CLI 中自定义 JavaScript 代码压缩流程。代码压缩使用的是 Metro 打包器（Metro Bundler）。

## 什么是代码压缩？

**代码压缩（Minification）** 是一种构建优化步骤。它会从源代码中移除不必要的字符（如注释、多余空格），折叠常量表达式，从而减小文件体积、提升加载速度。

> **给初学者的说明：**
> - **Metro**：React Native 官方使用的 JavaScript 打包工具（bundler），负责将你的所有 JS/TS 源码和依赖打包成少量的 bundle 文件。
> - **Minification（压缩/丑化）**：在保持功能不变的前提下，删除空白、缩短变量名、移除注释等，使最终产物尽可能小。
> - **Production（生产环境）**：指应用正式对外发布运行的环境，与之对应的是 Development（开发环境）。压缩通常在生产构建时启用。

当你在 Expo CLI 中执行生产环境的导出或构建时（例如 `npx expo export` 或 `eas build`），代码压缩会**自动执行**。

### 压缩前后对比

**压缩前：**

```js
// This comment will be stripped
console.log('a' + ' ' + 'long' + ' string' + ' to ' + 'collapse');
```

**压缩后：**

```js
console.log('a long string to collapse');
```

可以看到：
- 注释被删除了
- 多个字符串拼接被折叠成了一个完整字符串（常量折叠）

> **提示（Tip）：** 如果你需要保留某些注释，可以使用 `/** @preserve */` 指令。被该指令标记的注释在压缩后仍然会被保留。

```js
/** @preserve */
// 这段注释会在压缩后保留
```

---

## 移除 console 日志

在生产环境中，`console.log` 等调试输出通常是不需要的，而且会增加 bundle 体积。你可以通过配置压缩器的 `compress` 选项来移除它们。

在项目的 `metro.config.js` 中进行如下配置：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  compress: {
    // 下面的选项会在生产环境中移除所有 console 语句
    drop_console: true,
  },
};

module.exports = config;
```

> **给初学者的说明：**
> - **`metro.config.js`**：Metro 打包器的配置文件，放在项目根目录下。你可以在这里自定义打包行为。
> - **`getDefaultConfig`**：Expo 提供的函数，用于获取默认的 Metro 配置，然后你可以在其基础上做修改。
> - **`transformer`**：Metro 配置中的一个字段，控制代码转换（包括压缩）相关的设置。
> - **`minifierConfig`**：传递给压缩器的配置选项。

### 只移除部分 console 方法

如果你不想移除所有的 console 输出（比如想保留 `console.warn` 和 `console.error`），可以传入一个数组，指定只删除哪些方法：

```js
config.transformer.minifierConfig = {
  compress: {
    // 只移除 console.log 和 console.info，保留 console.warn 和 console.error
    pure_funcs: ['console.log', 'console.info'],
  },
};
```

> **基于文档内容推导：** `drop_console: true` 是一个全局开关，会移除所有 console 方法（log、warn、error、info、debug 等）。如果你只需要移除部分方法，应该使用更精细的配置方式，传入具体方法的列表。

---

## 自定义压缩器

不同的压缩器在**速度**和**压缩率**之间有不同的权衡。你可以在 `metro.config.js` 中切换使用的压缩器。

> **给初学者的说明：**
> - **压缩器（Minifier）**：执行代码压缩的工具程序。不同的压缩器采用不同的算法，因此在压缩速度和压缩效果上各有不同。
> - **`minifierPath`**：告诉 Metro 使用哪个压缩器模块。
> - **`minifierConfig`**：传递给所选压缩器的配置参数。

### Terser（默认压缩器）

> **注意（Note）：** 从 Metro 0.73.0 版本开始，`terser` 是默认的压缩器。

[Terser](https://terser.org/) 是目前最流行的 JavaScript 压缩器之一，压缩效果好且兼容性强。

#### 安装

根据你的包管理器选择对应的安装命令：

<details>
<summary>npm</summary>

```sh
npm install --save-dev metro-minify-terser
```

</details>

<details>
<summary>yarn</summary>

```sh
yarn add --dev metro-minify-terser
```

</details>

<details>
<summary>pnpm</summary>

```sh
pnpm add --save-dev metro-minify-terser
```

</details>

<details>
<summary>bun</summary>

```sh
bun add --dev metro-minify-terser
```

</details>

#### 配置

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  // Terser 配置选项...
};

module.exports = config;
```

### 激进优化（Unsafe Terser 选项）

如果你追求极致的压缩效果，可以启用一系列 `unsafe`（不安全）压缩选项。

> **警告（Warning）：** 这些选项可能会在某些 JavaScript 引擎上导致代码行为异常，请在启用后充分测试你的应用。

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-terser';

config.transformer.minifierConfig = {
  compress: {
    // 启用所有不安全优化
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_symbols: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    unused: true,
  },
};

module.exports = config;
```

> **给初学者的说明（各选项含义）：**
> - **`unsafe`**：启用所有不安全的优化的总开关。
> - **`unsafe_arrows`**：假设没有 `prototype` 属性会被访问，从而将函数优化为箭头函数。
> - **`unsafe_comps`**：假设被比较的对象不会被重写 `valueOf` 或 `toString`。
> - **`unsafe_Function`**：假设 `Function` 不会被用作构造函数来创建代码。
> - **`unsafe_math`**：对数学运算进行不安全的优化（如将 `2 * x * 3` 优化为 `6 * x`，可能在浮点数场景下产生精度差异）。
> - **`unsafe_symbols`**：假设 `Symbol` 不会被用于 `toString`。
> - **`unsafe_methods`**：假设某些标准方法不会被重写。
> - **`unsafe_proto`**：假设原型链上不会有意外属性。
> - **`unsafe_regexp`**：假设正则表达式不会有副作用。
> - **`unsafe_undefined`**：将未赋值的变量用 `undefined` 替换。
> - **`unused`**：删除未被引用的变量和函数。

> **基于经验建议：** 在启用 `unsafe` 系列选项之前，建议逐项开启并在真机上进行全面测试，而不是一次性全部打开。一次性开启所有选项后如果出现问题，将很难定位是哪个优化导致的。

### esbuild

`esbuild` 是一个用 Go 编写的构建工具，其压缩速度比传统压缩器（如 Terser、Uglify）**快数十倍甚至上百倍**。

> **给初学者的说明：**
> - **esbuild**：一个极快的 JavaScript/TypeScript 打包器和压缩器，由前 Firefox 工程师 Evan Wallace 开发。
> - 它的主要优势是**速度**，非常适合大型项目或者对构建速度有较高要求的场景。

具体使用方式请参考 [`metro-minify-esbuild`](https://github.com/nicholasgasior/metro-minify-esbuild) 仓库的说明。

### Uglify

[UglifyJS](https://github.com/mishoo/UglifyJS)（`uglify-es`）是一个较早期的 JavaScript 压缩器。

> **警告（Warning）：** 请确保 `metro-minify-uglify` 的版本与你项目中使用的 `metro` 版本完全匹配，否则可能会出现兼容性问题。

#### 安装

<details>
<summary>npm</summary>

```sh
npm install --save-dev metro-minify-uglify
```

</details>

<details>
<summary>yarn</summary>

```sh
yarn add --dev metro-minify-uglify
```

</details>

<details>
<summary>pnpm</summary>

```sh
pnpm add --save-dev metro-minify-uglify
```

</details>

<details>
<summary>bun</summary>

```sh
bun add --dev metro-minify-uglify
```

</details>

#### 配置

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = 'metro-minify-uglify';
config.transformer.minifierConfig = {
  // 配置选项参考：https://github.com/mishoo/UglifyJS#compress-options
};

module.exports = config;
```

> **基于经验建议：** 对于新项目，建议直接使用默认的 Terser 或尝试 esbuild。Uglify 已经较为陈旧，对 ES6+ 语法的支持不如 Terser 完善。除非你有特殊原因（比如需要与旧版本 Metro 兼容），否则不推荐在新项目中选择 Uglify。

---

## 压缩器对比总结

| 压缩器 | 压缩质量 | 速度 | 默认 | 适用场景 |
|--------|---------|------|------|---------|
| **Terser** | 高 | 中等 | 是（Metro ≥ 0.73.0） | 大多数项目的默认选择 |
| **esbuild** | 中高 | 极快 | 否 | 大型项目，追求构建速度 |
| **Uglify** | 中 | 中等 | 否 | 旧项目维护（需要版本匹配） |

> **基于文档内容推导：** Terser 作为默认压缩器已经能够很好地满足大多数 Expo 项目的需求。如果你的项目构建时间较长，可以考虑切换到 esbuild 以获得显著的速度提升。Uglify 主要用于兼容旧项目，新项目不建议使用。

---

## 文档导航

- **上一页**：[tree shaking](./29__tree-shaking.md)
- **下一页**：[why metro](./31__why-metro.md)
