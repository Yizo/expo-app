# Expo Router 的导航布局

## 文档解决的问题

这篇文档解决的是：如何通过目录和 `_layout.tsx` 文件，把一组页面组织成 Stack、Tabs、Slot、Drawer 等导航关系。

## 适用场景

- 你已经理解文件路由，但还不知道“页面之间的导航层级关系”写在哪里。
- 你想知道什么时候该用 Stack，什么时候该用 Tabs，什么时候只要 Slot。
- 你需要设计更复杂的路由布局，而不是平铺页面。

## React Web 开发者先要补的背景

- Web 中 layout 更多是“页面骨架复用”；在 Expo Router 中，layout 还承担“导航器声明”的职责。
- `_layout.tsx` 决定的不只是页面包裹关系，还决定“这些页面是栈、标签页还是抽屉”。

## 核心概念

文档明确说明：

- `src/app` 内每个目录都可以有一个 `_layout.tsx`
- 这个文件决定该目录下所有页面如何排列
- 它会在当前目录中的具体页面之前先渲染

## 1. Root layout

几乎每个应用都会有 `src/app/_layout.tsx`。

文档明确说明它负责两类事情：

- 定义顶层导航器
- 放置原本属于 `App.jsx` 的初始化逻辑

文档给出的示例包括：

- `useFonts` 加载字体
- `SplashScreen.preventAutoHideAsync()`
- 字体加载完成后隐藏 splash
- 返回 `<Stack />`

这说明 root layout 既是“导航入口”，也是“应用初始化入口”。

## 2. Stack 布局

文档示例把 `products` 目录定义成一个 Stack。

目录结构：

- `products/_layout.tsx`
- `products/index.tsx`
- `products/[productId].tsx`
- `products/accessories/index.tsx`

在 `products/_layout.tsx` 中返回：

```tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return <Stack />;
}
```

文档明确说明：

- `/products` 会进默认页 `index.tsx`
- `/products/123` 会被 push 到栈上
- 栈默认会提供返回按钮
- 即使当前页面不可见，只要它还在栈里，仍然会被渲染

### 配置 Stack.Screen

文档说明你可以在 `Stack` 内加入 `Stack.Screen` 来配置单个路由的 options，例如隐藏 header。

### 关于嵌套导航器

文档特别提醒：

- 可以嵌套导航器
- 但只有在真正需要时才这么做

如果只是为了多一级 URL 目录，不一定需要再套一个新的 Stack。

## 3. Tabs 布局

文档介绍了三类 tabs 思路。

### JavaScript tabs

在 `(tabs)/_layout.tsx` 中返回 `Tabs`：

```tsx
import { Tabs } from 'expo-router';
```

文档说明：

- 目录内直接子路由会成为 tab
- 通常应通过 `Tabs.Screen` 显式配置顺序、标题和图标
- `index.tsx` 会成为默认选中的 tab

### Native tabs

文档说明 Android / iOS 可在 layout 里使用 `NativeTabs`，利用平台原生 tab bar。

### Platform-specific tabs

文档提供了一个非常重要的跨平台模式：

- root layout 导入 `AppTabs`
- Android / iOS 使用 `app-tabs.native.tsx`
- Web 使用 `app-tabs.tsx`

这依赖平台特定文件扩展名自动解析。

## 4. Slot 布局

有些场景不需要 Stack / Tabs / Drawer，只需要在当前子路由外包一层统一结构。

文档给出的 `Slot` 方案：

```tsx
import { Slot } from 'expo-router';
```

适合：

- 加统一 header / footer
- 在任意子页面之上显示 modal
- 页面切换时只替换内容，不维护栈历史

对 React Web 开发者来说，可以把 `Slot` 理解成“当前匹配子路由的占位符”。

## 5. 其他布局方向

文档还提到：

- Drawer
- Native tabs
- Custom tabs
- Modal
- 兼容 React Navigation 的其他 navigator

说明 Expo Router 的 layout 不只支持少数几种官方固定模式。

## 文件、目录与代码说明

### `src/app/_layout.tsx`

根布局，顶层入口。

### 子目录中的 `_layout.tsx`

该目录内部页面关系定义点。

### `Stack`

适合一层一层 push 页面。

### `Tabs`

适合同级主导航分区。

### `NativeTabs`

适合原生平台系统 tab bar。

### `Slot`

适合无导航器、仅做包裹与占位。

## 注意事项、限制与坑点

### 1. 不要为“只是多一级 URL”而乱嵌套导航器

文档明确提醒，额外的 `_layout.tsx + Stack` 会真的创建新导航栈，而不只是“看起来更分层”。

### 2. root layout 的职责很多

如果你把初始化逻辑放错位置，可能导致字体、splash、provider 初始化时机不对。

### 3. tabs 的实现可以因平台不同而不同

这不是 hack，而是官方推荐模式之一。

### 4. Slot 不会自动提供返回栈等导航行为

它只是占位和包裹，不是 navigator。

## React Web 开发者最容易误解的点

### 1. layout 在这里不仅是“共享 UI”

它更像“声明这组页面采用哪种导航器”。

### 2. 子目录不一定代表新导航器

只有出现 `_layout.tsx` 并返回某种 navigator 时，才会形成新的导航关系层。

### 3. Tabs 不是天然适合所有平台同构

文档明确说明原生和 Web 往往适合不同 tab 实现。

## 实际开发建议

- 基于经验建议：先画出页面关系图，再决定每个目录需要 Stack、Tabs 还是 Slot。
- 基于经验建议：嵌套导航器前先问自己“这是导航关系，还是只是 URL 层级”。
- 基于文档内容推导：如果你需要统一 provider、埋点或主题，但不想引入新导航栈，优先考虑 Slot 或共享根 layout。

## 文档明确说明

- 每个目录都可通过 `_layout.tsx` 定义布局。
- root layout 负责顶层导航与初始化代码。
- Stack 适合层级式页面推进。
- Tabs 可定义同级标签页关系。
- Android / iOS 可以使用 Native tabs。
- Web 与原生可通过平台特定文件使用不同 tabs 实现。
- Slot 适合无导航器的包裹式布局。
- 可以嵌套导航器，但应谨慎使用。

## 基于文档内容推导

- Expo Router 的目录结构设计本质上就是导航架构设计。
- 平台特定布局实现能帮助你在“统一路由结构”和“平台体验优化”之间取得平衡。
- 大多数“导航越来越乱”的问题，最终都能追溯到 layout 层级设计不清晰。

## 当前文档未涉及

- 每种导航器的完整 API 参数表。
- 鉴权、共享路由、深链等高级导航模式。
- 各种复杂动画或 header 的细节配置。
