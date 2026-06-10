# Tailwind CSS 学习整理

## 文档解决的问题

这篇文档解决的是：如何在 Expo 项目里配置并使用标准 Tailwind CSS，尤其是在使用 Metro 打包 Web 站点时。

这篇文档同时明确划清了边界：**标准 Tailwind CSS 只支持 Web**，不直接支持 Android / iOS 原生界面。

## 适用场景

- 你在 Expo 里开发 Web 页面，想继续用 Tailwind。
- 你已经是 React Web 开发者，希望把现有 Tailwind 经验迁移到 Expo Web。
- 你需要判断什么时候该用 NativeWind / Uniwind，什么时候可以直接用标准 Tailwind。

## 核心概念

### 标准 Tailwind 只支持 Web

这是全篇最重要的前提。文档明确说明：

- 标准 Tailwind CSS 只支持 Web
- 如果你要通用于 Android / iOS，应使用 **NativeWind** 或 **Uniwind**

所以不能把这篇文档理解成“Expo 全平台都能直接写 Tailwind className”。

### 必须使用 Metro for Web

文档要求 `app.json` 中：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

这是因为这里讲的是 Metro Web + PostCSS + Tailwind 这条链路。

## 关键流程

### 1. 安装 Tailwind 与依赖

```sh
npx expo install tailwindcss@3 postcss autoprefixer --dev
npx tailwindcss init -p
```

文档说明这一步会创建：

- `tailwind.config.js`
- `post.config.js`

注意：当前页面文字写的是 `post.config.js`，从上下文可以看出它指向的是 PostCSS 配置文件。

### 2. 配置 `tailwind.config.js`

关键是 `content` 路径必须覆盖你的源码目录，例如：

```js
content: [
  './src/app/**/*.{js,tsx,ts,jsx}',
]
```

文档提醒，如果用了 Expo Router，考虑使用顶层 `src/` 目录，便于统一配置。

### 3. 创建 `global.css`

文档要求在根目录创建：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 导入 `global.css`

如果使用 Expo Router，就在根 `_layout.tsx` 导入；否则在 `index.js` 导入。

文档特别强调：

- 必须在**根** `_layout.tsx` 导入
- 不要在嵌套 layout 中导入

原因是 Expo Router 从根 layout 开始遍历依赖图，嵌套导入可能让 `node_modules` 的 CSS 比你的自定义样式更早加载，从而打乱样式顺序。

### 5. 启动项目

```sh
npx expo start
```

## 使用方式

### React DOM 元素

标准用法：

```tsx
<div className="bg-slate-100 rounded-xl">
  <p className="text-lg font-medium">Welcome to Tailwind</p>
</div>
```

### React Native Web 元素

文档提供了特殊写法：

```tsx
<View style={{ $$css: true, _: 'bg-slate-100 rounded-xl' }}>
  <Text style={{ $$css: true, _: 'text-lg font-medium' }}>Welcome to Tailwind</Text>
</View>
```

这说明在 RNW 组件上，Tailwind 不是通过 `className` 直接生效，而是借助特殊的 `$$css` 语法。

### DOM components 场景

如果你用 `'use dom'`，文档要求在**每个 DOM module** 中都单独导入 `global.css`，因为它们不共享全局样式。

## Tailwind 在 Android / iOS 上的边界

文档明确给出两条路线：

### 路线 1：使用兼容库

- NativeWind
- Uniwind

### 路线 2：用 DOM components 包一层 WebView

也就是把 Tailwind Web 代码通过 DOM components 渲染到原生里。

这不是原生 Tailwind，而是“在原生 App 里跑 Web 内容”。

## 命令、配置、文件说明

### 命令

```sh
npx expo install tailwindcss@3 postcss autoprefixer --dev
npx tailwindcss init -p
npx expo start
```

### 文档点名会修改的文件

- `app.json`
- `package.json`
- `global.css`
- `index.js`

### 实际涉及的关键文件

- `tailwind.config.js`
- PostCSS 配置文件
- `src/app/_layout.tsx` 或 `index.js`

## 注意事项、限制条件与坑点

- 标准 Tailwind 不支持 Android / iOS 原生组件。
- `content` 路径如果漏目录，会导致类名扫描不到，样式不生效。
- 使用 Expo Router 时，CSS 一定要在根 `_layout.tsx` 导入，不要放到嵌套路由。
- DOM components 不共享全局样式，必须逐模块导入 `global.css`。
- 如果自定义了 `config.cacheStores`，需要继承 `@expo/metro-config/file-store` 提供的 `FileStore`，否则可能破坏 PostCSS 支持。
- 不能在 `metro.config.js` 里关闭 CSS 支持，`isCSSEnabled` 应保持可用。

## React Web 开发者最容易误解的点

- **误解 1：Tailwind 在 Expo 就等于全平台都能直接用。**
  文档明确否定。
- **误解 2：React Native Web 组件也能像普通 DOM 一样直接写 `className`。**
  本页给出的主示例不是这样，而是 `$$css` 语法。
- **误解 3：DOM components 和正常 Web 页面共享同一份全局 CSS。**
  文档明确说不共享。

## 实际开发建议

- 基于经验建议：如果你主要做 Web，直接按本页配置 Tailwind；如果要做原生通用 UI，尽早评估 NativeWind / Uniwind。
- 基于文档内容推导：在 Expo Router 项目中，把全局样式入口固定在根 `_layout.tsx`，避免样式顺序问题。
- 基于文档内容推导：如果你只是想复用某一小块 Tailwind Web UI 到原生，可考虑 DOM components；如果大量页面都要这样做，维护成本会升高。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 标准 Tailwind 只支持 Web
- Metro for Web 是前提条件
- 需要配置 `tailwind.config.js`、`global.css` 并导入
- DOM components 需要单独导入 `global.css`
- Android / iOS 需使用 NativeWind、Uniwind 或 DOM components

### 基于文档内容推导

- 这篇文档更适合“Expo Web 项目使用 Tailwind”，而不是“Expo 全平台样式统一方案”。
- 对跨端团队来说，Tailwind 是否适合作为主样式方案，取决于原生端占比。
- Metro、PostCSS、Tailwind 的集成点主要在 Web 构建层，不在原生渲染层。

## 当前文档未涉及

- NativeWind / Uniwind 的具体配置流程
- Tailwind 高级主题定制
- CSS Modules、Sass 与 Tailwind 的组合策略
