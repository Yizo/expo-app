# Expo Router 自定义标签页布局

## 文档解决的问题

本文说明如何使用 `expo-router/ui` 提供的无样式组件，从零构建自定义 Tabs 布局。它适合默认原生 Tabs 或 React Navigation 风格 Tabs 无法满足复杂视觉结构、多个标签栏、动态标签或自定义动画的场景。

> **文档明确说明：** 此能力属于实验性功能，API 和行为仍可能变化。

## 核心概念

`expo-router/ui` 提供四个基础组件：

| 组件 | 作用 |
| --- | --- |
| `Tabs` | 标签导航器的根容器。 |
| `TabList` | 声明该导航器有哪些标签路由，同时通常也承载标签栏 UI。必须是 `Tabs` 的直接子元素。 |
| `TabTrigger` | 定义并切换标签；在 `TabList` 内使用时必须提供 `name` 和 `href`。 |
| `TabSlot` | 渲染当前选中的标签页面。不能放进 `TabList`。 |

最小结构如下：

```tsx
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="home" href="/">
          <Text>Home</Text>
        </TabTrigger>
        <TabTrigger name="article" href="/article">
          <Text>Article</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
```

这里的 `name` 是开发者自定义的标签标识，可以是任意字符串；`href` 才负责把标签绑定到具体路由。

## 创建和解析标签路由

### 普通与动态路由

`TabList` 内的每个 `TabTrigger` 都声明一个可用标签。动态路由也可通过已填入参数的 `href` 绑定，例如 `[slug].tsx` 可由 `href="/hello-world"` 获得 `{ slug: 'hello-world' }`。因此标签数量可以由用户数据决定，例如为每个用户资料创建一个标签。

### 歧义路由

`href` 必须唯一指向一个路由。若共享路由同时属于 `(one)` 和 `(two)`，`/route` 无法确定目标，应明确写成 `/(one)/route` 等完整路径。

### 嵌套路由

`TabTrigger` 可以直接链接到深层嵌套页面，其行为类似深链接。页面仍由离它最近的父导航器控制，而不是因为它出现在标签栏中就自动归属顶层 Tabs。

### 相对路径

自定义 Tabs 中的相对 `href` 是相对于 `Tabs` 所在的本地路径，而不是当前正在显示的页面。例如 Tabs 位于 `/directory` 时，`./profile` 始终解析为 `/directory/profile`。

> **文档明确说明：** Expo 不建议在这里使用相对 `href`，优先使用明确的绝对路径。

## 渲染与切换

`TabSlot` 可以嵌套在 `Tabs` 内的其他布局组件中，以便增加容器、动画层或样式，但不能放在 `TabList` 内。

使用 `Link` 或命令式 Router API 也能进入某个标签，但它们会执行导航动作，并且可能改变 URL。若只想切换当前 Tabs 状态，应使用 `TabTrigger`。

`TabTrigger` 的 `reset` 属性控制再次进入标签时是否重置其内部导航状态：

- `always`：每次触发都重置。
- `onLongPress`：长按时重置。
- `never`：不重置。

这对“Tabs 内嵌 Stack”的结构尤其重要，例如 `reset="always"` 可以让用户回到该标签内部 Stack 的首页。

## `TabTrigger` 的两种角色

### 位于 `TabList` 内

它负责注册标签，因此必须提供 `name` 和 `href`。其子元素可直接成为标签按钮 UI，也可以不渲染 UI，只保留路由配置。

### 位于 `TabList` 外

它不再声明路由，而是通过与已注册标签相同的 `name` 触发切换，因此不需要 `href`。所有这类触发器仍必须位于同一个 `Tabs` 组件内部，否则无法访问该标签导航器。

这使“隐藏配置列表 + 任意位置的多个标签栏”成为可能：隐藏 `TabList`，再在页面不同区域放置同名的 `TabTrigger`。

## 自定义外观和结构

除 `TabTrigger` 底层渲染为 `Pressable` 外，其余组件默认都是无样式 `View`。可以直接传入 React Native `style`。

若需要替换底层结构，使用 `asChild`，组件会把自身属性转交给唯一的直接子组件：

```tsx
<TabList asChild>
  <CustomTabList>
    <TabTrigger name="home" href="/" asChild>
      <CustomButton>Home</CustomButton>
    </TabTrigger>
  </CustomTabList>
</TabList>
```

`TabTrigger` 会向自定义按钮传递 `isFocused`，可据此绘制选中状态。大多数需求使用组件和 `asChild` 即可；Hooks 版本属于高级用法。若自行实现 `TabTrigger`，通常还要考虑自定义 `TabList`，因为内置 `TabList` 使用的 `useTabsWithChildren()` 依赖官方导出的 `TabTrigger`。

`TabSlot` 的 `renderFn` 可覆盖页面渲染方式，用于动画、页面持久化或卸载控制。

## 常见需求

- 同一路由创建多个标签：将路由放入共享组，并为每个组创建独立 `TabTrigger`。
- 隐藏标签：不渲染对应 `TabTrigger`；该标签及其导航状态都会被移除。
- 标签切换动画：通过 `TabSlot.renderFn` 自定义页面渲染，并根据聚焦状态执行动画。
- 多个标签栏：保留一个隐藏的 `TabList` 作为配置，再用 `TabList` 外的同名 `TabTrigger` 构建其他标签栏。

## 注意事项与坑点

- `TabList` 必须是 `Tabs` 的直接子元素。
- `TabSlot` 可以深层嵌套，但不能位于 `TabList` 内。
- `TabList` 内的 `TabTrigger` 必须同时有 `name` 和 `href`。
- `href` 不能指向有歧义的共享路由。
- 不渲染标签不仅隐藏按钮，也会删除其导航状态。
- Hooks API 更底层，文档建议优先尝试 `asChild`。
- 文档提到 SDK 52/React 18 及更早版本需要用旧式 `forwardRef` 获取 `ref`；当前 SDK 56 示例使用 React 的 `ref` 属性形式。

## React Web 开发者容易误解的地方

- 这不是给 DOM `<nav>` 加样式。组件最终渲染为 React Native 的 `View`/`Pressable`，样式规则和交互模型属于 React Native。
- `TabList` 同时承担“路由注册”和“默认 UI”两种职责，不只是一个视觉列表。
- 切换标签与普通 URL 导航不是完全相同的动作；`TabTrigger` 能只切换标签状态，而 `Link`/Router API 会执行导航。
- 路由由文件结构确定，`href` 应指向文件路由，而不是任意给组件起的 screen name。

## 实际开发建议

> **基于文档内容推导：** 先用最小的 `Tabs + TabList + TabTrigger + TabSlot` 验证路由，再逐步引入 `asChild`、多标签栏或 `renderFn`，可以更容易区分路由配置错误和视觉实现错误。

> **基于文档内容推导：** 对共享组、动态路由和深层嵌套路由，优先写完整绝对 `href`，并把 `name` 当作稳定的内部标识，不要把显示文本同时当路由标识使用。

当前文档未涉及：安装命令、无障碍属性的完整配置、Web 与原生的逐平台视觉差异、Hooks API 的完整签名。

<!-- NAVIGATION START -->
---
[← 上一页：Apple Handoff](./70_apple-handoff.md) | [下一页：Expo Router Stack 原生工具栏 →](./72_stack-toolbar.md)
<!-- NAVIGATION END -->
