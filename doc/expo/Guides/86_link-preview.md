# Expo Router Link Preview

## 文档解决的问题

这篇文档讲的是：如何在 iOS 上给 Expo Router 的链接添加预览弹窗，也就是类似 “Peek and Pop” 的体验。它解决的是“长按或预览一个链接时，希望先看到目标页面快照或自定义预览内容”的问题。

## 适用场景

- 你在做 iOS 应用，并希望链接交互更接近原生体验。
- 你想在进入目标页面前，先展示一个预览面板。
- 你还想在预览旁边附带上下文菜单操作。

## 先建立正确心智模型

- 这是 iOS 专属能力。
- 它不是 Web 浏览器里的 hover preview，也不是 SEO 里的 link preview metadata。
- 在 Expo Router 里，它是由 `Link` 及其一组子组件共同组成的原生交互能力。

文档明确说明：该功能为 SDK 54+ 的 iOS-only 特性。

## 核心概念

### 1. `Link.Trigger`

真正触发预览的内容必须放在 `Link.Trigger` 里。

### 2. `Link.Preview`

用于显示目标页面预览，可以使用默认页面快照，也可以传入自定义 children 替换。

### 3. `Link.Menu` 与 `Link.MenuAction`

用于在预览旁边渲染上下文菜单，支持图标、 destructive 样式，甚至嵌套菜单。

### 4. `useIsPreview()`

如果某个组件可能被渲染在 preview 容器中，可以用它判断当前是否处于预览环境。

## 关键流程

### 基础用法

```tsx
import { Link } from 'expo-router';

export default function Page() {
  return (
    <Link href="/about">
      <Link.Trigger>About</Link.Trigger>
      <Link.Preview />
    </Link>
  );
}
```

含义：

- `href` 指向目标路由
- `Link.Trigger` 负责用户交互入口
- `Link.Preview` 负责显示预览

### 自定义预览尺寸

文档说明可通过 `style` 传 `width`、`height` 作为“建议尺寸”，但系统可能根据可用空间覆盖你的建议。

### 自定义预览内容

`Link.Preview` 可以带 children，用你自己的内容替换默认的页面快照。

### 添加菜单

```tsx
<Link href="/about">
  <Link.Trigger>About</Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={handleSharePress} />
    <Link.MenuAction title="Block" icon="nosign" destructive onPress={handleBlockPress} />
  </Link.Menu>
</Link>
```

文档还说明：

- 图标使用 SF Symbols
- 菜单可以嵌套

## `useIsPreview()` 的意义

文档给出示例：组件可以根据是否运行在预览中，决定显示不同内容。

这很适合处理：

- 预览中不想触发昂贵副作用
- 预览中想展示更轻量 UI
- 预览与正式页面展示略有不同

## 命令、配置、文件说明

### 常用组件与 Hook

- `Link.Trigger`
- `Link.Preview`
- `Link.Menu`
- `Link.MenuAction`
- `useIsPreview()`

当前文档未涉及 CLI 命令、app config 或特殊文件结构要求。

## 注意事项、限制条件和坑点

- 文档明确说明：这是 iOS-only 功能。
- 文档明确说明：`replace` 模式不支持 link preview，只支持默认的 `push` 导航模式。
- 文档明确说明：如果在 JavaScript tabs 或 `Slot` 中导航，预览过渡动画可能显得卡顿，建议使用 native tabs 和 stack navigators。
- 如果使用 preview 或 context menu 却没有 `Link.Trigger`，会抛异常。
- 使用 `Link asChild` 时，`Link.Trigger` 只能有一个子节点，`onPress` 只会转发给它。
- 预览打开时不支持动态修改 `href` 的 path，只允许改 query 参数。

## React Web 开发者容易误解的地方

- 不要把它看成网页悬浮卡片。
  这是原生 iOS 预览交互。
- 不要以为普通 `Link` children 就足够。
  当前文档明确要求在 preview/context menu 模式下必须使用 `Link.Trigger`。
- 不要默认任何导航模式都支持。
  文档明确限制 `replace` 不可用。

## 实际开发建议

- 基于经验建议：对文章列表、用户卡片、商品列表这类“先看预览再决定是否进入”的场景很合适。
- 基于经验建议：自定义 preview 内容时，尽量保持轻量，避免预览本身变成完整页面再渲染一遍。
- 基于文档内容推导：如果你的导航体系主要依赖 JS tabs，采用 link preview 前应先验证动画体验。
- 基于文档内容推导：可能被渲染进 preview 的组件应尽早使用 `useIsPreview()` 做分支控制。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Link preview 是 iOS-only，SDK 54+ 可用。
- `Link.Trigger` 与 `Link.Preview` 共同组成预览。
- 可加入 `Link.Menu` / `Link.MenuAction`。
- `replace` 不支持。
- JS tabs 和 `Slot` 中过渡动画可能不理想。

### 基于文档内容推导

- 这是一个“原生交互增强能力”，只有在 iOS 场景中才值得专门设计。
- 预览内容、导航结构、交互动效需要一起评估，不能只看 API 是否可用。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Redirects](./85_redirects.md) | [下一页：Expo Router Typed Routes →](./87_typed-routes.md)
<!-- NAVIGATION END -->
