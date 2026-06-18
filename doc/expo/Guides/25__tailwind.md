# Tailwind CSS

> **原文地址**：https://docs.expo.dev/guides/tailwind

---

## 概述

Tailwind CSS 是一个**工具优先（utility-first）的 CSS 框架**，它提供了大量预定义的小型 CSS 类名（称为"工具类"），让你可以直接在 HTML/JSX 中组合使用，而无需编写传统的 CSS 文件。

> **关键术语解释**：
> - **Tailwind CSS**：一个流行的 CSS 框架，通过类名（如 `bg-slate-100`、`text-lg`、`rounded-xl`）直接在元素上应用样式，而非编写单独的 CSS 样式表。
> - **工具类（Utility Classes）**：Tailwind 提供的预定义 CSS 类，每个类只做一件事（例如设置背景色、字体大小等），可以像积木一样组合使用。
> - **PostCSS**：一个用 JavaScript 转换 CSS 的工具，Tailwind 依赖它来处理 CSS 文件。
> - **Autoprefixer**：一个 PostCSS 插件，自动为 CSS 属性添加浏览器厂商前缀（如 `-webkit-`、`-moz-`），确保跨浏览器兼容性。

> **重要提示**：标准的 Tailwind CSS **仅支持 Web 平台**。如果你需要在移动端（Android 和 iOS）也使用 Tailwind 风格的样式，需要使用 [NativeWind](https://www.nativewind.dev/) 或 [Uniwind](https://uniwind.dev/) 等第三方库，它们允许你用 Tailwind CSS 创建 React Native 组件的样式。

---

## 前提条件

### 项目必须使用 Metro 作为 Web 打包工具

> **关键术语解释**：
> - **Metro**：React Native 官方的 JavaScript 打包工具（bundler），负责将你的源代码打包成可以在浏览器或移动设备上运行的文件。Expo 支持两种 Web 打包方式：Metro 和 Webpack。要使用 Tailwind CSS，必须使用 Metro。
> - **打包器（Bundler）**：将多个源代码文件合并、转换为最终可运行文件的工具。

你需要确认项目的 `app.json` 或 `app.config.js` 中，`web.bundler` 设置为 `"metro"`：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

如果该字段不存在或设置为其他值（如 `"webpack"`），则无法按照本文档配置 Tailwind CSS。

---

## 配置

Tailwind CSS 目前有 **v3** 和 **v4** 两个主要版本，配置方式有所不同。请根据你使用的版本选择对应的配置步骤。

> **基于经验建议**：如果是新项目，建议直接使用 v4，它的配置更简洁、性能更好。如果是已有项目且依赖 v3 的插件生态，可以继续使用 v3。

---

### v3 配置

#### 第一步：安装依赖

根据你的包管理器选择对应的安装命令：

```sh
# npm
npx expo install tailwindcss@3 postcss autoprefixer --dev

# yarn
yarn expo install tailwindcss@3 postcss autoprefixer --dev

# pnpm
pnpm expo install tailwindcss@3 postcss autoprefixer --dev

# bun
bun expo install tailwindcss@3 postcss autoprefixer --dev
```

> **关键术语解释**：
> - **`npx expo install`**：Expo 提供的安装命令，它会自动选择与当前 Expo SDK 版本兼容的依赖版本，比直接用 `npm install` 更安全。
> - **`--dev`**：将依赖安装为开发依赖（devDependencies），表示这些包仅在开发阶段使用，不会被打包到最终的应用中。
> - **`npx tailwindcss init -p`**：使用 Tailwind CLI 初始化配置文件。`-p` 参数表示同时生成 PostCSS 配置文件。

安装完依赖后，初始化 Tailwind 配置文件：

```sh
npx tailwindcss init -p
```

这会在项目根目录生成两个文件：
- `tailwind.config.js`：Tailwind 的主配置文件
- `postcss.config.js`：PostCSS 的配置文件

#### 第二步：配置 tailwind.config.js

编辑生成的 `tailwind.config.js`，在 `content` 数组中指定你的源代码路径：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Ensure this points to your source code
    './src/app/**/*.{js,tsx,ts,jsx}',
    // If you use a `src` directory, add: './src/**/*.{js,tsx,ts,jsx}'
    // Do the same with `components`, `hooks`, `styles`, or any other top-level directories
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

> **关键术语解释**：
> - **`content`**：告诉 Tailwind 哪些文件使用了工具类。Tailwind 会扫描这些文件，只生成实际用到的 CSS 类，从而大幅减小最终 CSS 文件的体积。这是 Tailwind 的"按需编译"机制。
> - **`theme.extend`**：用于扩展默认主题，例如添加自定义颜色、字体等，而不会覆盖内置主题。

> **提示**：如果你使用 **Expo Router**，建议使用根级别的 **src** 目录来简化此步骤。了解更多：[顶层 src 目录](/router/reference/src-directory)。

#### 第三步：创建全局 CSS 文件

在项目根目录创建 `global.css` 文件，添加以下三行指令：

```css
/* This file adds the requisite utility classes for Tailwind to work. */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> **关键术语解释**：
> - **`@tailwind base`**：注入 Tailwind 的基础样式（重置样式、默认元素样式等）。
> - **`@tailwind components`**：注入通过 `@layer components` 定义的组件类。
> - **`@tailwind utilities`**：注入所有工具类，这是 Tailwind 最核心的部分。

#### 第四步：在入口文件中导入全局 CSS

如果你使用 **Expo Router**，在根布局文件 `_layout.tsx` 中导入：

```tsx
import '../../global.css';
```

如果不使用 Expo Router，在主入口文件 `index.js` 中导入：

```tsx
// Import the global.css file in the index.js file:
import './global.css';
```

> **警告：DOM 组件需要单独导入**
>
> 如果你使用了 [DOM 组件](/guides/dom-components)（即在 React Native 中嵌入 Web 内容的组件），需要在**每个**使用 `"use dom"` 指令的模块中都导入此 CSS 文件，因为 DOM 组件不共享全局样式。

> **警告：始终在根布局文件中导入全局 CSS**
>
> 始终在根级别的 **_layout.tsx** 中导入全局 CSS，而不是在嵌套的布局文件中。Expo Router 从根布局开始遍历依赖图。如果在嵌套布局（例如 **app/blog/_layout.tsx**）中导入 CSS，会导致 **node_modules** 中的 CSS 先于你的自定义样式加载，从而破坏你预期的样式顺序。

#### 第五步：启动开发服务器

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

---

### v4 配置

#### 第一步：安装依赖

根据你的包管理器选择对应的安装命令：

```sh
# npm
npx expo install tailwindcss @tailwindcss/postcss postcss --dev

# yarn
yarn expo install tailwindcss @tailwindcss/postcss postcss --dev

# pnpm
pnpm expo install tailwindcss @tailwindcss/postcss postcss --dev

# bun
bun expo install tailwindcss @tailwindcss/postcss postcss --dev
```

> **与 v3 的区别**：v4 不再需要 `autoprefixer`（已内置），改用专用的 `@tailwindcss/postcss` 插件替代通用 PostCSS 配置。

#### 第二步：配置 PostCSS

在项目根目录创建或编辑 `postcss.config.mjs`（或 `postcss.config.js`），添加 `@tailwindcss/postcss` 插件：

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

> **与 v3 的区别**：v4 不再使用 `npx tailwindcss init -p` 生成配置文件，也不需要 `tailwind.config.js`（除非你需要深度自定义主题）。

#### 第三步：创建全局 CSS 文件

在项目根目录创建 `global.css` 文件，使用 v4 的新语法导入：

```css
@import 'tailwindcss';
```

> **与 v3 的区别**：v4 用一行 `@import 'tailwindcss'` 替代了 v3 中的三行 `@tailwind` 指令，更加简洁。

#### 第四步：在入口文件中导入全局 CSS

如果你使用 **Expo Router**，在根布局文件中导入：

```tsx
// If using Expo Router, import your CSS file in the src/app/_layout.tsx file
import '../../global.css';
```

如果不使用 Expo Router，在主入口文件中导入：

```tsx
// Otherwise import your CSS file in the index.js file:
import './global.css';
```

> **警告：DOM 组件需要单独导入**
>
> 如果你使用了 [DOM 组件](/guides/dom-components)，需要在**每个**使用 `"use dom"` 指令的模块中都导入此 CSS 文件，因为 DOM 组件不共享全局样式。

> **警告：始终在根布局文件中导入全局 CSS**
>
> 始终在根级别的 **_layout.tsx** 中导入全局 CSS，而不是在嵌套的布局文件中。Expo Router 从根布局开始遍历依赖图。如果在嵌套布局（例如 **app/blog/_layout.tsx**）中导入 CSS，会导致 **node_modules** 中的 CSS 先于你的自定义样式加载，从而破坏你预期的样式顺序。

#### 第五步：启动开发服务器

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

---

## 使用方法

### 在 React DOM 组件中使用

当你在 Web 环境中使用标准的 React DOM 元素（如 `<div>`、`<p>`、`<span>` 等）时，可以像在传统 Web 开发中一样直接使用 `className` 属性：

```tsx
export default function Index() {
  return (
    <div className="bg-slate-100 rounded-xl">
      <p className="text-lg font-medium">Welcome to Tailwind</p>
    </div>
  );
}
```

### 在 React Native Web 组件中使用

> **关键术语解释**：
> - **React Native Web**：一个将 React Native 组件（如 `View`、`Text`）映射到 Web DOM 元素的兼容层，让你可以用同一套组件代码同时运行在原生移动端和 Web 端。
> - **`$$css` 语法**：React Native Web 中用于传递 CSS 类名的特殊对象格式。由于 React Native 的 `style` 属性通常接受样式对象而非字符串，这个特殊格式告诉框架将其作为 CSS 类名处理。

当使用 React Native 的组件（如 `View`、`Text`）时，需要通过特殊的对象语法来应用 Tailwind 类名：

```tsx
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ $$css: true, _: 'bg-slate-100 rounded-xl' }}>
      <Text style={{ $$css: true, _: 'text-lg font-medium' }}>Welcome to Tailwind</Text>
    </View>
  );
}
```

> **基于经验建议**：在 React Native Web 中使用 `$$css` 语法时，`_` 属性的值是一个空格分隔的 CSS 类名字符串。这种方式虽然可行，但写法不够优雅。如果你的项目主要在 Web 端运行，建议直接使用 React DOM 元素。如果你需要跨平台支持，推荐使用 NativeWind 或 Uniwind 等库来获得更好的开发体验。

---

## Tailwind 在 Android 和 iOS 上的支持

标准的 Tailwind CSS **不支持** Android 和 iOS 原生平台。Tailwind 生成的 CSS 只能在浏览器环境中运行。

## Android 和 iOS 的替代方案

> **关键术语解释**：
> - **DOM 组件**：Expo 提供的一种机制，允许你在 React Native 应用中嵌入基于 Web 的组件。这些组件在原生设备上通过 WebView 渲染。
> - **WebView**：在原生移动应用中嵌入的浏览器组件，可以渲染 Web 内容。
> - **`'use dom'` 指令**：一个特殊的文件级指令，告诉 Expo 将该文件中的组件作为 DOM 组件处理，即在 WebView 中渲染。

如果你想在 Android 和 iOS 上使用 Tailwind CSS，有以下两种主要方案：

### 方案一：使用第三方兼容库

使用 [NativeWind](https://www.nativewind.dev/) 或 [Uniwind](https://uniwind.dev/) 等库，它们将 Tailwind CSS 的类名转换为 React Native 原生样式，从而实现真正的跨平台支持。

### 方案二：使用 DOM 组件

将 Web 代码渲染到原生 WebView 中。使用 DOM 组件时，需要在文件顶部添加 `'use dom'` 指令，并在**每个** DOM 组件文件中单独导入全局 CSS：

```tsx
'use dom';

// Remember to import the global.css file in each DOM component.
import '../../global.css';

export default function Page() {
  return (
    <div className="bg-slate-100 rounded-xl">
      <p className="text-lg font-medium">Welcome to Tailwind</p>
    </div>
  );
}
```

> **基于经验建议**：DOM 组件方案适用于在原生应用中嵌入少量 Web 内容的场景。如果你的应用大量使用 Tailwind 样式，建议使用 NativeWind 或 Uniwind，因为它们能提供更原生的性能和体验。

---

## 故障排除

### 自定义 Metro 缓存存储时的 PostCSS 支持

> **关键术语解释**：
> - **缓存存储（Cache Store）**：Metro 打包器用来存储编译结果的缓存位置。默认情况下缓存在项目的临时目录中，但你可以自定义缓存路径。
> - **FileStore**：Expo 提供的文件缓存类，支持 PostCSS 处理。

如果你在 Metro 配置中自定义了 `cacheStores`，需要确保继承 Expo 提供的 `FileStore` 类以保持 PostCSS（及 Tailwind）的正常工作：

```js
// Import the Expo superclass which has support for PostCSS.
const { FileStore } = require('@expo/metro-config/file-store');

config.cacheStores = [
  new FileStore({
    root: '/path/to/custom/cache',
  }),
];

module.exports = config;
```

如果使用原生的 Metro 缓存类而非 Expo 的 `FileStore`，PostCSS 处理可能会被跳过，导致 Tailwind 样式无法正常编译。

### 确保 CSS 支持已启用

在 Metro 配置中，确保没有禁用 CSS 支持。检查 `getDefaultConfig` 的配置，确认 `isCSSEnabled` 为 `true`：

```js
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Do not disable CSS support when using Tailwind.
  isCSSEnabled: true,
});
```

> **基于文档内容推导**：`isCSSEnabled` 在默认配置中通常是 `true`，但如果你或项目中的其他开发者曾经将其设置为 `false`，Tailwind 的 CSS 文件将不会被 Metro 处理，导致样式完全不生效。如果 Tailwind 样式没有生效，这是首先应该检查的配置项之一。

---

## 文档导航

- **上一页**：[progressive web apps](./24__progressive-web-apps.md)
- **下一页**：[local https development](./26__local-https-development.md)
