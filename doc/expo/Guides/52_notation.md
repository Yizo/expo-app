# Expo Router 路由命名规则

## 文档解决的问题

这篇文档解决的是：`src/app` 目录中的特殊命名规则分别代表什么，以及它们如何影响 URL、路由参数、布局和特殊行为。

## 适用场景

- 你看到目录名里有 `[]`、`()`、`_layout.tsx`、`+not-found.tsx`，但不知道含义。
- 你已经理解“文件即路由”，现在想理解“文件名如何表达更复杂的路由关系”。

## React Web 开发者先要补的背景

- Expo Router 的“路由语法”主要写在文件名和目录名里，而不是集中写在一份路由表配置中。
- 这和 Next.js 等文件路由框架类似，但也包含一些 Expo Router 自己的特殊文件约定。

## 路由记号总览

文档按几种记号分别解释。

### 1. 普通名称：静态路由

示例：

- `home.tsx`
- `feed/favorites.tsx`

文档明确说明，没有特殊符号的文件和目录表示静态路由，URL 与文件树一一对应。

例如：

- `feed/favorites.tsx` 对应 `/feed/favorites`

### 2. 方括号 `[]`：动态路由

示例：

- `[userName].tsx`
- `products/[productId]/index.tsx`

文档明确说明，方括号代表 URL 中某一段是变量。这个变量可在页面内部通过 `useLocalSearchParams` 读取。

对 React Web 开发者来说，这和 `/users/:id` 或 `[id].tsx` 的概念很接近。

### 3. 圆括号 `()`：路由组

示例：

- `(home)/index.tsx`
- `(home)/settings.tsx`

文档明确说明：

- route group 用于分组
- 不会出现在 URL 中

也就是说，`src/app/(home)/settings.tsx` 的 URL 仍然是 `/settings`。

### 4. `index.tsx`：默认路由

文档说明这和 Web 目录首页概念类似。

例如：

- `profile/index.tsx` 对应 `/profile`
- `(home)/index.tsx` 对应 `/`

### 5. `_layout.tsx`：布局路由

文档明确说明：

- 它不是页面
- 它定义当前目录内页面之间的关系
- 可在这里放 `Stack`、`Tabs` 等导航器

并且根级 `src/app/_layout.tsx` 会在整个应用中最先渲染。

### 6. `+` 前缀：特殊用途文件

文档列举：

- `+not-found`
- `+html`
- `+native-intent`
- `+middleware`

它们都不是普通页面，而是 Expo Router 预留的特殊入口。

## 特殊文件分别解决什么问题

### `+not-found`

用于匹配不存在的路由。

### `+html`

用于自定义 Web 端 HTML 外壳模板。

### `+native-intent`

用于处理无法直接匹配到具体页面的原生 deep link。

### `+middleware`

用于在路由渲染前执行逻辑，例如鉴权或重定向。

## 保留路径

文档特别提醒：

- 某些路径名如 `/assets` 被 Metro 和 Expo Router 保留
- 不要把它们拿来当路由

这是典型“看起来像普通目录名，但其实有框架保留语义”的坑点。

## 文档示例如何落地理解

在文档示例中：

- `about.tsx` 是静态路由，对应 `/about`
- `users/[userId].tsx` 是动态路由，对应 `/users/123`
- `(home)` 是 route group，不进 URL
- `(home)/index.tsx` 是 `/`
- `(home)/_layout.tsx` 定义组内关系
- 根 `_layout.tsx` 是全局入口布局
- `+not-found.tsx` 处理未匹配路由

## React Web 开发者最容易误解的点

### 1. 圆括号目录不是 URL 的一部分

这和普通文件夹最不一样，很多人第一次看会误以为 URL 里也会出现 `(home)`。

### 2. `_layout.tsx` 不会生成页面

它是“结构文件”，不是“可访问页面”。

### 3. `+` 文件不是随便约定的命名风格

它们是框架保留入口，带有明确语义。

### 4. 动态参数不是靠一份 centralized config 声明

它直接写在文件名里。

## 注意事项、限制与坑点

- route group 只影响组织和导航关系，不影响 URL。
- 在 `src/app` 中误用保留路径名可能会引发冲突。
- 把普通页面误命名成特殊文件形式，会改变它的框架语义。
- 动态路由参数名会直接成为你代码里读取参数时的 key。

## 实际开发建议

- 基于经验建议：目录设计前先把“哪些段落要进 URL、哪些只用于组织”想清楚，再决定是否使用 route group。
- 基于经验建议：把 `_layout.tsx` 当成“导航关系声明点”，不要当成普通复用组件文件。
- 基于文档内容推导：如果你的 URL 设计需要保持简洁，但内部结构又要分模块，`()` route group 会非常有用。

## 文档明确说明

- 普通名称表示静态路由。
- `[]` 表示动态路由参数。
- `()` 表示不进入 URL 的 route group。
- `index.tsx` 是默认路由。
- `_layout.tsx` 负责定义目录内路由关系。
- `+` 前缀文件有特殊框架语义。
- 某些路径名被保留，不能用于路由。

## 基于文档内容推导

- Expo Router 的路由设计很依赖命名纪律，命名本身就是配置。
- URL 结构与内部模块结构可以分离，这是 route group 的实际价值。
- 团队协作时，统一命名约定比单纯统一组件风格更重要，因为它直接影响导航行为。

## 当前文档未涉及

- 各类特殊文件的完整 API 细节。
- 跳转、参数读取、鉴权实现代码的完整模式。
- Stack、Tabs、Drawer 的具体写法。
