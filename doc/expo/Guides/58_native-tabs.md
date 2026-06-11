# Expo Router 的 Native Tabs

## 文档解决的问题

这篇文档解决的是：如何在 Expo Router 中使用原生系统 tab bar、如何配置图标与标签、如何处理平台差异、已知限制是什么，以及从旧 API 或 JavaScript tabs 迁移时要注意什么。

## 适用场景

- 你想在 Android / iOS 上获得更原生的 tab 体验。
- 你需要利用系统 tab 的滚动到顶部、pop to top、平台动画等行为。
- 你同时还想为 Web 提供不同的 tabs 实现。

## React Web 开发者先要补的背景

- Native tabs 不是“样式更像原生”的普通组件，而是直接使用平台系统 tab bar。
- 系统 tab bar 的优势是行为更符合平台习惯，但代价是可定制性会受平台限制。
- 这和 Web 中“完全自绘导航栏”的模式很不一样。

## 核心结论

文档明确说明：

- Native tabs 目前是 `alpha`
- SDK 54+ 可用
- API 仍可能变化

这意味着：它很适合尝试和新项目采用，但要留意后续升级变化。

## 基础使用方式

文档示例直接在 layout 中使用：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
```

基础结构不是 `Screen`，而是：

```tsx
<NativeTabs>
  <NativeTabs.Trigger name="index">
    <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
    <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
  </NativeTabs.Trigger>
</NativeTabs>
```

### 一个非常关键的差异

文档明确说明：

- 与 Stack 不同，tabs 不会自动加入 tab bar
- 你必须显式写 `NativeTabs.Trigger`

这和 JavaScript tabs 的思路明显不同。

## 自定义 tab item

文档重点介绍了三类可定制内容：

- Icon
- Label
- Badge

## 1. Icon

文档说明图标可以来自：

- `sf`：Apple SF Symbols
- `md`：Android Material Symbols
- `src`：自定义图片
- `xcasset`：iOS Xcode asset catalog

还可以为默认态和选中态分别指定资源。

### 版本差异

文档明确说明：

- `NativeTabs.Trigger.Icon` 在 SDK 55+ 可用
- Android 上某些“选中态独立图标”能力需要 SDK 56+

### iOS 液态玻璃配色

文档说明 iOS 的 Liquid Glass 会根据背景自动变色，而没有回调，因此你应使用：

- `PlatformColor`
- `DynamicColorIOS`

来保证图标与文字颜色适配。

### `renderingMode`

文档说明：

- `template`：让 iOS 对图标上色
- `original`：保留原图颜色

并明确指出这个设置只影响 iOS。

## 2. Label

文档说明 `Label` 通过子节点文本定义。

如果不写 label，会回退到路由名。

也可以用 `hidden` 隐藏 label。

## 3. Badge

文档说明 `Badge` 适合展示通知数、未读数等附加状态。

## 自定义整个 tab bar

文档明确说明：

- 原生 tab bar 在不同平台外观不同
- 因此可配置能力也不同
- 完整选项应看 `NativeTabs` API reference

也就是说，这篇文档更偏“模式与能力边界”，不是完整参数手册。

## 进阶能力

## 1. 隐藏整个 tab bar

文档给出 `hidden` 方案，并用 Context 动态控制。

这说明：

- tab bar 可按页面状态隐藏
- 但通常需要在 layout 与页面间共享状态

## 2. 条件隐藏单个 tab

文档说明：

- 可移除某个 trigger
- 或给 `NativeTabs.Trigger` 加 `hidden`

但它特别警告：

- 动态隐藏会 remount navigator
- state 会重置
- 最好只在 navigator 挂载前或用户不可见时改变

并且：

- 被标记为 `hidden` 的 tab 无法以任何方式导航到

## 3. 激活当前 tab 时的行为

### `disablePopToTop`

文档说明，默认再次点击当前激活 tab，会把该 tab 内 stack 收回到根页面。可通过此属性关闭。

### `disableScrollToTop`

文档说明，默认再次点击当前激活且已在根页的 tab，会把内容滚到顶部。可通过此属性关闭。

## 4. `disabled`

文档明确说明：

- SDK 56+ 可用
- 它只阻止用户点击 tab 时的原生选择行为
- 不是鉴权保护机制
- `router.push('/settings')` 这类 JS 导航依然可以进入

这是非常重要的限制。

## iOS 26 新能力

文档列出多个 iOS 26 特性。

### 独立搜索 tab

通过 `role="search"` 标记某个 tab。

### tab bar 内搜索框

需要：

- 为该 tab 包一层 `Stack`
- 使用 `Stack.SearchBar`

### 最小化行为

通过 `minimizeBehavior` 控制 tab bar 在滚动时的收缩方式。

### Bottom accessory

文档说明这是一个浮在 tab bar 上方的持久视图，例如迷你播放器。

并明确提醒：

- 同时会渲染 regular / inline 两个实例
- 状态不会共享
- 必须把状态放在外部

这是很容易忽略的实现约束。

## Android 键盘与安全区域

### 键盘避让

文档说明 Android 默认键盘会覆盖 tab bar。

如果想让 tab bar 随键盘上移，可使用：

```tsx
tabBarRespectsIMEInsets
```

并要求：

- Android 11+
- `android.softwareKeyboardLayoutMode` 为 `"resize"`（Expo 默认）

### Safe area

文档明确说明：

- Android：自动处理底部 inset，其他边要手动处理
- iOS：第一个 `ScrollView` 会自动做内容 inset 调整

如果你要完全手动控制，可使用：

```tsx
disableAutomaticContentInsets
```

并改为手动用 `SafeAreaView`。

## Lazy loading 行为

文档明确说明：

- Native tabs 的所有 tab 页面会在 navigator 挂载时 eager render
- 这无法更改

如果某个 tab 内容太重，文档给出两种折中方案：

- `useIsFocused`：只有聚焦时才渲染，但离开会卸载
- `useFocusEffect + state flag`：首次聚焦后再加载，并保持挂载

## Web 适配

文档明确说明：

- Web 没有标准系统 tab bar
- Native tabs 在 Web 上只是一个基础 fallback

因此推荐两种方式提供更好的 Web tabs：

- `_layout.web.tsx`
- 平台特定组件扩展，如 `app-tabs.web.tsx`

这体现了“移动端原生 tabs，Web 端自定义 tabs”的推荐实践。

## 迁移说明

### SDK 54 -> 55

文档明确说明：

- 旧的单独导入 `Icon`、`Label`、`Badge` 方式变成 compound component API
- Android 图标推荐用 `md`

### 从 JavaScript tabs 迁移

文档明确说明：

- Native tabs 不是 JavaScript tabs 的直接替代品
- 需要从 `Screen` 思维转成 `Trigger` 思维
- 更推荐在 tab 内再嵌套 `Stack` 支持 header 和 push 页面

## 常见问题与已知限制

### 常见问题

- iOS 18 及更早，滚动到边缘时 tab bar 可能透明，可用 `disableTransparentOnScrollEdge`
- `ScrollView` 不是首子元素时，透明边缘和滚到顶部行为可能失效
- iOS 26 可能出现切 tab 白闪或 header button 闪烁，文档建议用 `ThemeProvider` 对齐主题

### 已知限制

文档明确列出：

- Android 最多 5 个 tabs
- 无法测量 tab bar 高度
- 不支持嵌套 native tabs
- `FlatList` 支持有限
- 不支持运行时动态增删 tabs，增删会导致 remount 和状态丢失

## React Web 开发者最容易误解的点

### 1. native tabs 不是更漂亮的普通 tabs 组件

它带来的是系统行为与系统限制。

### 2. `disabled` 不是权限控制

文档明确说明 JS 导航仍然能进入对应页面。

### 3. 所有 tab 默认都会预先渲染

这和你在 Web 中习惯的“按需挂载页面”可能不同。

### 4. Web 不能直接复用原生 tab bar 体验

文档已经明确建议在 Web 侧用 headless tabs 自定义实现。

## 实际开发建议

- 基于经验建议：如果你非常在意原生平台一致性，优先选 native tabs；如果你更看重自由布局，考虑 JavaScript tabs 或 custom tabs。
- 基于经验建议：复杂 tab 页面尽早设计“重内容延迟加载策略”，因为 native tabs 默认 eager render。
- 基于文档内容推导：对跨平台项目来说，最稳妥的模式往往是“移动端 native tabs + Web 自定义 tabs”。

## 文档明确说明

- Native tabs 处于 alpha，SDK 54+ 可用。
- 需要显式使用 `NativeTabs.Trigger` 声明 tab。
- 支持 Icon、Label、Badge 自定义。
- 可隐藏 tab bar、隐藏 tab、控制 pop to top / scroll to top。
- `disabled` 只影响原生点击，不是鉴权。
- iOS 26 带来搜索 tab、搜索框、minimize、bottom accessory 等能力。
- Android 键盘与 safe area 需要额外关注。
- 所有 tab 默认 eager render。
- Web 建议使用平台特定自定义 tabs。
- 存在多个已知限制。

## 基于文档内容推导

- Native tabs 更适合作为“稳定主导航骨架”，不适合频繁动态变更结构。
- 如果页面需要完整 header、push 详情页、搜索栏等能力，tab 内嵌 Stack 往往是标准搭配。
- 在设计系统层面，选择 native tabs 就意味着接受更多平台约束，换取更强平台一致性。

## 当前文档未涉及

- NativeTabs 完整 API 参数表。
- 认证保护与业务权限控制的完整实现。
- 与 EAS Build、原生工程配置的更深入关系。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 的 JavaScript Tabs](./57_tabs.md) | [下一页：Expo Router 的 Drawer →](./59_drawer.md)
<!-- NAVIGATION END -->
