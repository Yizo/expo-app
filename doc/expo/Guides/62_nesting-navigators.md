# Nesting navigators

## 文档解决的问题

这篇文档解释的是：在 Expo Router 里，如何把一个导航器嵌套到另一个导航器里，也就是常说的“导航嵌套”。

对于 React Web 开发者，可以把它理解成：

- 外层路由决定大的页面框架
- 内层路由再决定该框架内部的局部切换方式

只是 Expo Router 这里嵌套的不是普通组件，而是 `Stack`、`Tabs` 这类导航容器。

## 适用场景

- 你想做“外层是 Stack，内层是 Tabs”的页面结构。
- 某个区域需要独立的导航体验，例如进入 `/home` 后再在 `feed` 和 `messages` 之间切换。
- 你从 React Navigation 迁移到 Expo Router，想知道嵌套导航在文件路由里怎么表达。

## 阅读前需要理解的背景知识

- **`_layout.tsx`**：当前目录及其子路由的导航壳。
- **`Stack`**：更像“页面推进栈”，适合详情页、返回关系明确的流程。
- **`Tabs`**：更像“多个一级入口之间切换”。
- **文件系统路由**：目录层级本身就决定了路由层级和导航嵌套关系。

## 按原文结构整理的核心内容

## 1. 嵌套导航的基本含义

文档先给出定义：**在一个导航器的某个 screen 里面，再渲染另一个导航器**，这就是嵌套导航。

Expo Router 里，这不是靠手动拼装复杂配置，而是主要通过目录结构和各层 `_layout.tsx` 来表达。

## 2. 文档示例的路由结构

文档示例大意如下：

```text
src/app
  _layout.tsx
  index.tsx
  home/
    _layout.tsx
    feed.tsx
    messages.tsx
```

对应关系是：

- `src/app/_layout.tsx` 返回 `Stack`
- `src/app/home/_layout.tsx` 返回 `Tabs`
- `src/app/index.tsx` 是外层 stack 中的一个页面
- `src/app/home/feed.tsx` 和 `src/app/home/messages.tsx` 是内层 tabs 的两个页面

也就是说：

- 外层：整个 `app` 是一个 stack
- 内层：`/home/*` 这一段再套一个 tabs

## 3. 为什么这是“嵌套”

因为 `home/_layout.tsx` 本身被包含在根 `_layout.tsx` 之下。

用 React Web 的类比来说：

- 根布局像整个站点的主路由容器
- `home` 目录像一个二级模块
- 这个二级模块内部又有自己的一套路由切换 UI

## 4. 如何跳到嵌套导航中的具体页面

文档用 `Link href="/home/messages"` 作为例子，说明从外部可以直接跳到嵌套导航里的某个具体页面。

这点很关键：在 Expo Router 中，你通常直接写“完整路径”，而不是像传统 React Navigation 那样，先定位父 navigator，再通过 `screen` 和 `params` 一层层传。

## 5. Expo Router 和 React Navigation 的差异

文档专门拿 React Navigation 做对比。

React Navigation 里，如果你想从外层导航器跳到内层某个页面，常见写法是：

```js
navigation.navigate('root', {
  screen: 'settings',
  params: {
    screen: 'media',
  },
});
```

而在 Expo Router 中，文档明确说可以直接：

```js
router.push('/root/settings/media');
```

也就是说，Expo Router 更偏向“URL 驱动”，不是“导航配置对象驱动”。

## 6. Native tabs 里的 stack

文档还补充了一点：如果你在使用 **native tabs**，每个 tab 内部还可以继续嵌套 `<Stack />`，这样每个 tab 都能有自己的 header 和页面 push 行为。

当前文档没有展开完整例子，只是给出方向并指向另外一篇文档。

## 关键概念解释

### 导航嵌套

一个导航器内部再承载另一个导航器。例如：

- 外层 `Stack`
- 内层 `Tabs`

这和 React Web 里“父页面渲染一个子路由区域”有点像，但这里子区域同时带有自己的导航行为和导航 UI。

### `Stack`

适合“前进/返回”关系强的场景，比如列表页进入详情页。

### `Tabs`

适合多个平级入口之间来回切换，比如“动态 / 消息 / 我的”。

### 完整路径导航

Expo Router 倾向直接用 URL 路径表达目标页面，而不是手写多层 navigator 名称和 screen 参数。

## 关键流程 / 命令 / 配置说明

### 文件结构如何表达嵌套

```text
src/app/_layout.tsx       -> 外层导航器
src/app/home/_layout.tsx  -> 内层导航器
src/app/home/feed.tsx     -> 内层页面
src/app/home/messages.tsx -> 内层页面
```

### 关键代码角色

- 根 `_layout.tsx` 返回 `Stack`
- `home/_layout.tsx` 返回 `Tabs`
- `Link` 或 `router.push()` 直接跳到完整嵌套路径

### 当前文档涉及的命令

当前文档未涉及。

### 当前文档涉及的额外配置

当前文档未涉及。

## 注意事项、限制条件和坑点

- Expo Router 的嵌套关系主要由目录结构和 `_layout.tsx` 决定，不是任意组件嵌套都能形成导航嵌套。
- 从外层跳到内层页面时，应直接使用完整路径，这和 React Navigation 里手动指定嵌套 `screen` 的习惯不同。
- 文档只举了 `Stack` 套 `Tabs` 的例子，没有展开更复杂的多层嵌套策略；复杂场景需要你额外验证导航体验。

## React Web 开发者最容易误解的地方

- **误解 1：`_layout.tsx` 只是普通布局组件。**  
  在 Expo Router 里，它更像“这一层路由的导航容器定义点”。

- **误解 2：嵌套导航就是父组件里 import 一个子组件。**  
  这里的“嵌套”是导航系统层面的，不只是 UI 组合。

- **误解 3：跳嵌套页必须一层层传 screen 参数。**  
  文档明确说明，Expo Router 更推荐直接用完整路径。

## 实际开发建议

- 基于文档内容推导：如果某一组页面需要自己的 tab 切换或自己的返回栈，优先把它们放到独立目录并用单独 `_layout.tsx` 表达，而不是在单页里手工控制显隐。
- 基于经验建议：嵌套层级不要为了“结构看起来整齐”而过深，否则调试返回行为和 header 来源会更复杂。
- 基于经验建议：如果你从 React Navigation 迁移过来，先把“配置对象导航”思维切成“路径导航”思维，代码会简单很多。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- 嵌套导航就是在一个导航器的 screen 里渲染另一个导航器。
- 文档示例中，根布局是 `Stack`，`home/_layout.tsx` 是 `Tabs`。
- 在 Expo Router 中，可以直接 `router.push('/root/settings/media')` 跳到嵌套页面。
- 使用 native tabs 时，每个 tab 里可以再嵌套 `<Stack />`。

### 基于文档内容推导

- Expo Router 的嵌套导航天然更适合用 URL 来表达最终目标，而不是像传统导航库那样表达“如何一步步抵达”。
- 如果一个模块内部的导航方式与全局不同，例如全局是 stack、模块内部是 tabs，那么给该模块单独建目录和 `_layout.tsx` 会是更自然的建模方式。
