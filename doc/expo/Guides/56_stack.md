# Expo Router 的 Stack 导航

## 文档解决的问题

这篇文档解决的是：如何在 Expo Router 中使用 Stack 导航、如何配置 header 与 screen options、如何控制压栈与出栈行为，以及如何处理 iOS 新版视觉效果和常见问题。

## 适用场景

- 你需要“从列表进入详情，再返回”的典型页面层级。
- 你要为页面配置标题、按钮、动画、手势、modal 展示方式。
- 你在处理返回栈、dismiss 行为、动态标题时遇到疑问。

## React Web 开发者先要补的背景

- Stack 更接近原生移动端的页面推进模型，不是浏览器单页 URL 替换模型。
- 进入一个新页面，通常意味着“当前页还留在历史栈中”，而不是被彻底卸载。
- header 不是单纯页面内组件，很多配置是通过导航器层完成的。

## Stack 是什么

文档明确说明：

- Stack 是应用中最基础的导航方式之一
- Android 上新页面会叠在当前屏幕上方
- iOS 上通常从右侧滑入

最基础的结构：

- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/app/details.tsx`

在 `_layout.tsx` 中：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

## 配置页面选项与 Header

文档明确说明，从 SDK 55 开始，有两种方式配置：

- options-based API
- composition components API

两者可以混用。

## 1. 静态配置

可以在 layout 里写：

```tsx
<Stack.Screen name="home" options={{}} />
```

也可以通过 `screenOptions` 给整个 stack 统一配置 header 样式：

```tsx
<Stack
  screenOptions={{
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  }}
/>
```

## 2. 动态配置

文档给出的动态示例是在页面组件内部使用：

```tsx
<Stack.Screen
  options={{
    title: params.name,
    headerStyle: { backgroundColor: 'lightblue' },
  }}
/>
```

并通过 `router.setParams()` 更新标题。

这说明 header 标题和页面参数可以联动。

## Header 选项如何理解

文档给了一大张配置表。对 React Web 开发者，最值得先建立的是“配置类别”心智，而不是死记所有字段。

### 常用 header 类别

- 是否显示：`headerShown`
- 标题：`title`、`headerTitle`
- 左右按钮：`headerLeft`、`headerRight`
- 返回按钮：`headerBackTitle`、`headerBackVisible`
- 样式：`headerStyle`、`headerTintColor`、`headerTitleStyle`
- 背景与透明效果：`headerBackground`、`headerTransparent`、`headerBlurEffect`
- iOS 大标题：`headerLargeTitle` 及相关 large title 配置
- 搜索栏：`headerSearchBarOptions`

### 重要限制

文档明确说明：

- 如果你自定义 `header`，某些原生能力如 large title、search bar 等不会工作。
- `headerTransparent` 为 `true` 时，内容可能会顶到 header 下方，需要你手动补顶部间距。
- large title 要正确收起，滚动容器必须满足特定结构要求。

## 其他 screen options 的重点

文档还列出大量非 header 选项，核心类别包括：

- 动画：`animation`、`animationDuration`
- 手势：`gestureEnabled`、`gestureDirection`、`fullScreenGestureEnabled`
- 页面展示方式：`presentation`
- 屏幕方向：`orientation`
- 状态栏：`statusBarStyle`、`statusBarHidden` 等
- form sheet 相关：`sheetAllowedDetents` 等

文档表明：Stack 不只是“前进后退”，它还承载大量原生页面呈现能力。

## 自定义 push 行为

文档明确说明：

- 默认情况下，push 已经在栈中的相同路由时，Stack 会去重
- 如果你希望相同动态路由每次都压一个新实例，可为 `Stack.Screen` 提供 `getId()`

示例思路：

```tsx
<Stack.Screen
  name="[profile]"
  getId={({ params }) => String(Date.now())}
/>
```

这会让每次进入都得到新 ID，从而每次都真正 push。

## 移除 Stack 页面

文档专门介绍了几个 API。

### `dismiss`

- 关闭最近的 stack 顶层页面
- 可传数字，一次 dismiss 多层

### `dismissTo`

- 一直 dismiss 到指定 `Href`
- 如果目标不在历史里，则改为 push 过去

### `dismissAll`

- 回到最近 stack 的第一个页面

### `canDismiss`

- 检查当前是否处于可 dismiss 的 stack 场景

这些 API 说明 Stack 的“返回”不是只有 `back` 一种。

## iOS 26 Liquid Glass header

文档明确说明：

- iOS 26 开始，导航 header 默认使用系统 Liquid Glass 效果
- 不能按页面单独关闭

### 方式 1：全局兼容模式

在 app config 中设置：

```json
{
  "ios": {
    "infoPlist": {
      "UIDesignRequiresCompatibility": true
    }
  }
}
```

但文档强调：

- Expo Go 不支持
- 这是临时方案
- iOS 27 起 Apple 会移除该选项

### 方式 2：改用 JavaScript stack

```tsx
import { Stack as JsStack } from 'expo-router/js-stack';
```

文档说明这样能获得更完整的自定义权，但会失去原生 stack 的性能优势。

## 常见问题

### Large title 不会收起

文档明确给出的原因与修复方式：

- `ScrollView` 或 `FlatList` 必须是页面组件的第一个子元素
- 如果外面包了一层容器，容器要设 `collapsable={false}`

### 页面切换出现白屏闪烁

文档明确说明常见原因是：

- 导航栈背景是浅色
- 应用主题是深色

修复方式是在根布局上包 `ThemeProvider`，传入匹配主题。

## React Web 开发者最容易误解的点

### 1. Stack 中不可见页面不一定已经卸载

文档明确说明只要页面仍在栈中，它仍然被渲染。

### 2. header 很多能力来自导航器，而不是页面 JSX 本身

你不能只把它当成普通组件树的一部分。

### 3. `back`、`dismiss`、`dismissTo` 语义不同

它们不是同义词，尤其在嵌套 navigator 场景下差异明显。

### 4. 原生视觉效果会受系统版本影响

Liquid Glass 就是典型例子。

## 实际开发建议

- 基于经验建议：先只掌握 `Stack`、`Stack.Screen`、`screenOptions`、`headerLeft/headerRight` 这些高频能力，再逐步用高级配置。
- 基于经验建议：动态标题、搜索栏、透明 header 这类功能要尽早在真机和模拟器都验证。
- 基于文档内容推导：如果你的设计系统要求完全自定义 header 且不想受原生限制，JavaScript stack 可能比 native stack 更适合。

## 文档明确说明

- Stack 是 Expo Router 的基础导航方式。
- SDK 55 起可用两种方式配置 screen options。
- 可静态或动态配置标题与 header。
- 文档列出了大量 header、动画、手势、状态栏、sheet 相关选项。
- `getId()` 可改变重复 push 行为。
- `dismiss`、`dismissTo`、`dismissAll`、`canDismiss` 用于管理 stack 页面。
- iOS 26 默认启用 Liquid Glass headers。
- large title 和主题白闪都有明确排查方案。

## 基于文档内容推导

- 设计 Stack 体验时，页面生命周期、标题策略和返回策略应该一起考虑。
- 如果你把太多业务状态绑进 header，自定义与平台兼容之间的权衡会更明显。
- 越依赖原生 header 能力，越要关注系统版本差异。

## 当前文档未涉及

- Drawer、Tabs、认证保护等完整模式。
- 每个 screen option 的完整业务示例。
- Android / iOS 各种动画选择的设计建议对比。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 常见导航模式](./55_common-navigation-patterns.md) | [下一页：Expo Router 的 JavaScript Tabs →](./57_tabs.md)
<!-- NAVIGATION END -->
