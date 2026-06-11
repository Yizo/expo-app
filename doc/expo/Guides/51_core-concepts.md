# Expo Router 文件路由核心概念

## 文档解决的问题

这篇文档解决的是：Expo Router 文件路由的基本规则是什么，项目结构和传统 React Native 项目有什么不同，以及哪些文件才算页面、哪些不算。

## 适用场景

- 你已经准备使用 Expo Router，但还没建立正确的目录心智模型。
- 你不知道 `src/app`、`index.tsx`、`_layout.tsx` 分别扮演什么角色。
- 你想把 Web 的文件路由经验迁移到 Expo Router。

## React Web 开发者先要补的背景

- 在 Expo Router 中，`src/app` 不只是“放页面代码的目录”，它就是路由定义本身。
- `_layout.tsx` 很像 Web 框架中的 layout 文件，但它还承担原生导航容器初始化职责。
- 页面不仅服务于 Web URL，也服务于原生 deep link。

## 核心规则

文档用 7 条规则解释 Expo Router。

### 1. 所有页面都在 `src/app` 里

文档明确说明：

- `src/app` 中的文件和子目录定义所有导航路由。
- 每个文件都要有 default export，代表一个独立页面。
- `_layout` 文件除外，它不是页面本身。

### 2. 所有页面都有 URL

文档明确说明，URL 与 `src/app` 中的路径对应。

这点非常重要，因为它意味着：

- Web 上可以直接输入地址访问。
- 原生端可以通过 deep link 打开同一路径。

### 3. 第一个 `index.tsx` 是初始路由

Expo Router 不要求你在代码中手动指定初始页面，而是会寻找匹配 `/` 的第一个 `index.tsx`。

文档还说明：

- 如果你想让首页实际落到更深层目录，可用 route group，如 `(tabs)`。
- route group 不计入 URL。

### 4. 根 `_layout.tsx` 取代 `App.jsx/tsx`

文档明确说明：

- `src/app/_layout.tsx` 会先于其他路由渲染。
- 以前放在 `App.jsx` 的初始化代码，现在应放这里。

举例包括：

- 加载字体
- 设置主题 provider
- 控制 splash screen

### 5. 默认模板使用平台特定 tabs

文档说明默认模板在不同平台使用不同 tab 实现：

- Android / iOS：native tabs
- Web：custom tabs（来自 `expo-router/ui`）

并通过平台特定文件扩展名区分：

- `src/components/app-tabs.native.tsx`
- `src/components/app-tabs.tsx`

### 6. 非导航组件放在 `src/app` 外

文档明确说明：

- `src/app` 只用于路由定义
- 组件、hooks、工具函数等应放在其他目录，如 `src/components`、`src/hooks`

如果把普通组件放进 `src/app`，Expo Router 会把它当成路由。

### 7. Stack 和 Tabs 可以继续配置

文档说明 Stack / Tabs 导航器仍支持 header、动画、手势等配置，详细配置要看对应高级文档。

## 文档中的示例结构怎么理解

文档举例：

- `src/app/index.tsx`：初始页面
- `src/app/home.tsx`：对应 `/home`
- `src/app/_layout.tsx`：根布局
- `src/app/profile/friends.tsx`：对应 `/profile/friends`
- `src/components/...`：普通组件，不会变成路由

这个例子本质上是在帮你区分：

- 哪些文件决定 URL
- 哪些文件只是被页面引用的 UI 组件

## 文件、目录与命名说明

### `src/app`

路由根目录。

### `index.tsx`

某个目录的默认路由。

### `_layout.tsx`

当前目录下路由的布局与导航关系定义点，也是根级初始化位置。

### `.native.tsx`

文档用它说明平台特定模块解析。原生平台会优先选中这个文件。

## 注意事项、限制与坑点

### 1. `src/app` 里不要放普通组件

这是最容易踩的结构性错误之一。

### 2. 首页不是在代码里手动指定

如果你一直用 Web 手写 router config，容易下意识找“initial route 配置项”；这里默认由 `index.tsx` 决定。

### 3. `_layout.tsx` 不是普通包装组件

它不只是“长得像 layout”，而是整个目录路由关系的组织点。

### 4. 默认模板并不是所有平台共用同一个 tabs 组件

文档明确说明 Web 和原生 tabs 实现不同。

## React Web 开发者最容易误解的点

### 1. “文件即路由”在这里更严格

在很多 Web 框架里，页面目录之外还能灵活混放一些文件；在 Expo Router 的 `src/app` 中，这样做会直接影响路由。

### 2. URL 不只是给浏览器用

原生端同样依赖 URL 路径进行导航和 deep link。

### 3. `App.tsx` 的角色被弱化了

文档实际上是在告诉你：路由入口和初始化重心已经转移到 `_layout.tsx`。

## 实际开发建议

- 基于经验建议：先把 `src/app` 想成“路由声明目录”，而不是“随便放页面相关文件的目录”。
- 基于经验建议：组件、hooks、constants 尽早拆出 `src/app`，避免路由污染。
- 基于文档内容推导：如果你未来需要做跨平台 tabs 适配，平台特定文件扩展名应尽早纳入目录设计。

## 文档明确说明

- 路由定义都在 `src/app`。
- 每个页面文件对应一个 URL。
- 第一个匹配 `/` 的 `index.tsx` 是初始路由。
- 根 `_layout.tsx` 取代原本 `App.jsx/tsx` 中的初始化职责。
- 默认模板在原生和 Web 上使用不同 tabs 实现。
- 非导航组件不应放在 `src/app` 中。

## 基于文档内容推导

- Expo Router 的可维护性很大程度取决于你的目录纪律。
- 团队协作时，只要约定清楚 `src/app` 的边界，很多导航问题会自然减少。
- 平台差异不一定体现在路由结构上，也可以体现在被 layout 引入的具体实现文件上。

## 当前文档未涉及

- 特殊命名规则如 `[]`、`()`、`+not-found` 的详细语义。
- 具体跳转 API 用法。
- 鉴权、共享路由、模态等进阶场景。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 手动安装](./50_installation.md) | [下一页：Expo Router 路由命名规则 →](./52_notation.md)
<!-- NAVIGATION END -->
