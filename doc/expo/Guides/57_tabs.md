# Expo Router 的 JavaScript Tabs

## 文档解决的问题

这篇文档解决的是：如何在 Expo Router 中使用基于 React Navigation bottom tabs 的 JavaScript tabs，以及如何配置 tab bar、隐藏 tab、处理动态 tab 路由。

## 适用场景

- 你要做底部 tab 导航。
- 你已经熟悉 React Navigation 的 bottom tabs，想在 Expo Router 中继续使用类似 API。
- 你希望 tab bar 有较高自定义空间，但不一定要完全原生 tab 外观。

## React Web 开发者先要补的背景

- tabs 是移动端主导航的一种常见结构，通常对应“首页 / 发现 / 设置”这种同级分区。
- Expo Router 中有三类 tabs：
  - JavaScript tabs
  - Native tabs
  - Custom tabs
- 这篇文档只讲 JavaScript tabs。

## 三类 tabs 的定位

文档明确说明：

- `JavaScript tabs`：基于 React Navigation bottom tabs
- `Native tabs`：使用平台系统 tab bar
- `Custom tabs`：用 `expo-router/ui` 头部无样式组件自己搭

如果你已经用过 React Navigation，这一篇最容易上手。

## 基础结构

文档给出的结构是：

- `src/app/_layout.tsx`
- `src/app/(tabs)/_layout.tsx`
- `src/app/(tabs)/index.tsx`
- `src/app/(tabs)/settings.tsx`

### 根 layout

文档示例在根布局中用 `Stack` 承载 tabs：

```tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack>
```

这表示 tabs 作为整个应用的一块主区域存在。

### `(tabs)/_layout.tsx`

文档在这里返回：

```tsx
import { Tabs } from 'expo-router';
```

并通过 `Tabs.Screen` 配置：

- `name`
- `title`
- `tabBarIcon`

文档明确说明：

- `index.tsx` 是默认 tab
- `settings.tsx` 是另一个 tab

## `Tabs.Screen` 的意义

文档说明，虽然文件已经自动成为路由，但在 tab layout 中仍然常常需要显式写 `Tabs.Screen`，因为你要控制：

- 显示顺序
- 标题
- 图标
- 某些具体 tab 的选项

## Tab bar 配置能力

文档给出大量选项。对 React Web 开发者，建议先按“配置类别”理解。

### 外观与颜色

- `tabBarActiveTintColor`
- `tabBarInactiveTintColor`
- `tabBarActiveBackgroundColor`
- `tabBarInactiveBackgroundColor`
- `tabBarStyle`
- `tabBarBackground`

### 图标与文字

- `tabBarIcon`
- `tabBarLabel`
- `tabBarLabelStyle`
- `tabBarShowLabel`

### 布局与位置

- `tabBarPosition`
- `tabBarLabelPosition`
- `tabBarItemStyle`
- `tabBarVariant`

### 行为与可测试性

- `tabBarHideOnKeyboard`
- `tabBarButton`
- `tabBarButtonTestID`
- `tabBarAccessibilityLabel`

### 徽标

- `tabBarBadge`
- `tabBarBadgeStyle`

文档明确说明这些选项本质上来自 React Navigation 的 Bottom Tabs Navigator。

## 进阶用法

### 1. 隐藏某个 tab，但保留路由

文档给出的方式是：

```tsx
<Tabs.Screen
  name="index"
  options={{
    href: null,
  }}
/>
```

这表示：

- 该页面仍是路由
- 但不在 tab bar 上展示按钮

### 2. 动态路由 tab

文档举例：

- `[user]` tab

并说明要通过 `href` 指定一个稳定的具体链接，例如 `/evanbacon`。

这意味着 tab 自身虽然基于动态路由定义，但 tab bar 上显示的那个入口必须落到确定 URL。

### 动态 tab 的限制

文档明确说明：

- 动态路由 tab 必须唯一
- 不能出现两个 `[user]` tabs
- 如果需要多个动态路由 tab，应该自定义 navigator

## React Web 开发者最容易误解的点

### 1. `(tabs)` 目录名本身不是魔法页面

真正起作用的是里面的 `_layout.tsx` 返回了 `Tabs`。

### 2. 文件自动成为路由，不代表 tab bar 自动满足你的设计需求

顺序、标题、图标仍需要在 `Tabs.Screen` 层配置。

### 3. 隐藏 tab 不等于删除路由

`href: null` 隐藏的是入口，不是页面本身。

## 注意事项、限制与坑点

- 动态 tab 路由必须唯一。
- 如果 tab bar 使用绝对定位，文档提醒你可能需要手动给内容补底部间距。
- 使用 `BlurView` 做 tab 背景时，文档明确要求同时给 `tabBarStyle` 设 `position: 'absolute'`。
- 大屏设备上 `tabBarPosition` 可以切到 `left` / `right`，此时更像侧边栏而不是底部 tab。

## 实际开发建议

- 基于经验建议：如果你的团队已经熟悉 React Navigation bottom tabs，先从 JavaScript tabs 入手会更稳。
- 基于经验建议：把“页面存在”与“tab 是否展示”分开思考，隐藏页面入口时优先用 `href: null`。
- 基于文档内容推导：如果产品设计要求极强自定义或跨平台表现差异大，可能需要改用 custom tabs 或 native tabs。

## 文档明确说明

- Expo Router 有三类 tabs，本篇只讲 JavaScript tabs。
- JavaScript tabs 基于 React Navigation bottom tabs。
- tabs 结构通常通过 `(tabs)/_layout.tsx` 定义。
- `Tabs.Screen` 常用于配置标题、图标、顺序和选项。
- 支持大量 tab bar 配置项。
- 可通过 `href: null` 隐藏 tab。
- 动态路由 tab 需要稳定 `href`，且同类动态路由不能重复。

## 基于文档内容推导

- JavaScript tabs 更像“有现成行为的可配置导航组件”，而不是原生平台标准外观的强约束方案。
- 它在可定制性和开箱即用之间处于折中位置。
- 对既做手机又做大屏 Web 的项目，`tabBarPosition` 能帮助同一套路由结构适配不同布局。

## 当前文档未涉及

- Native tabs 的原生能力细节。
- 认证、共享路由、深链等更复杂场景。
- Tabs 与 Stack 混合时的完整设计模式。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 的 Stack 导航](./56_stack.md) | [下一页：Expo Router 的 Native Tabs →](./58_native-tabs.md)
<!-- NAVIGATION END -->
