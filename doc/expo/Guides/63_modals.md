# Modals

## 文档解决的问题

这篇文档讲的是：在 Expo Router 里如何实现模态界面（modal），以及什么时候该用 React Native 自带的 `Modal`，什么时候该用 Expo Router 的“模态路由”。

它解决的不是“怎么画一个弹层”这么简单，而是“这个弹层是否应该进入导航系统”。

## 适用场景

- 你要做确认弹窗、临时提示、简短交互。
- 你要做一个和路由有关的复杂弹出流程，例如多步表单、完成后还要能跳到某个页面。
- 你要支持深链接直接打开 modal 页面。
- 你要兼顾 Android、iOS、Web 三端的 modal 表现差异。

## 阅读前需要理解的背景知识

- **React Native `Modal`**：更像一个纯 UI 层覆盖物，不天然属于路由系统。
- **Expo Router modal screen**：本质还是一个路由页面，只是以 modal 的方式呈现。
- **`presentation`**：控制页面以什么形式出现，例如普通 push、modal、透明 modal、bottom sheet。
- **anchor**：用于深链接 modal 时，指定后台要保留哪一个基础页面。

## 按原文结构整理的核心内容

## 1. 两种 modal 思路

文档先把 modal 分成两大类：

### React Native 的 `Modal` 组件

适合：

- 独立的小交互
- 快速确认、临时提示
- 不需要纳入导航系统的内容

### Expo Router 的 modal route

适合：

- 需要参与导航栈的复杂交互
- 可能被深链接直接打开的页面
- 完成某个流程后还要继续跳转的页面

React Web 开发者可以这样理解：

- React Native `Modal` 更像“组件级弹层”
- Expo Router modal route 更像“有 URL/路由语义的弹层页面”

## 2. 如何创建一个 modal 路由

文档示例结构：

```text
src/app
  _layout.tsx
  index.tsx
  modal.tsx
```

然后在根布局里把 `modal` 注册到 `Stack` 中，并设置：

```tsx
options={{ presentation: 'modal' }}
```

这说明 `modal.tsx` 虽然是普通文件路由，但展示方式改成了模态呈现。

## 3. 如何打开 modal

文档示例用的是：

```tsx
<Link href="/modal">Open modal</Link>
```

这再次体现 Expo Router 的核心思路：modal 页面也是路由页面，所以打开它依然是“导航到某个路径”。

## 4. 各平台的显示与关闭行为不同

文档明确列出三端差异：

- **Android**：modal 从当前页面上方滑入；通常用返回键关闭
- **iOS**：modal 从底部滑上来；通常可以下滑关闭
- **Web**：它就是一个独立路由，不会天然提供原生那种滑动关闭体验，需要你自己处理关闭逻辑

Web 示例里通过 `router.canGoBack()` 判断当前是不是“以 modal 方式被呈现”，再决定是否显示返回链接。

## 5. iOS 状态栏问题

文档特别提醒：iOS 上 modal 默认深色背景可能会遮住状态栏，所以可以在 `modal.tsx` 内通过：

- `Platform.OS === 'ios'`
- `StatusBar`

来调整状态栏显示样式。

这说明 modal 不只是“页面弹出方式不同”，它还会影响系统 UI 的观感。

## 6. 深链接到 modal 时为什么要 anchor

文档强调：如果你使用 stack 或嵌套 stack，并且 modal 支持深链接，那么一定要设置 `anchor`，否则 modal 背后的页面上下文会被清空，导致没有正确的返回基础。

配置方式：

```ts
export const unstable_settings = {
  anchor: 'index',
};
```

文档的意思是：

- `index` 成为 modal 背后的“底座页面”
- 即使用户是通过深链接直接进入 modal，也能保留合理的导航上下文

## 7. form sheet：可拖拽高度的底部弹层

文档后半部分讲的是 `presentation: 'formSheet'`。

这是一种底部 sheet，用户可以把它停在几个不同高度上，文档称这些高度为 **detents**。

适用场景是：

- 不需要全屏覆盖
- 希望保留背景上下文
- 需要交互式拖拽高度

## 8. detents 怎么配置

文档提供两类方式：

### 数组

例如：

```tsx
sheetAllowedDetents: [0.25, 0.5, 1]
```

表示可停留在屏幕高度的 25%、50%、100%。

要求：

- 数值范围在 0 到 1 之间
- 必须升序排列

### `fitToContents`

让 sheet 根据内容高度自动决定大小。

但文档明确提醒：

- 这种模式下 **不能依赖 `flex: 1` 自动撑满**
- 你必须提供明确内容尺寸

## 9. 额外的 sheet 配置项

文档列出的几个关键项：

- `sheetInitialDetentIndex`：初始停留在哪个 detent
- `sheetGrabberVisible`：顶部抓手是否显示，**仅 iOS**
- `sheetCornerRadius`：圆角
- `sheetLargestUndimmedDetentIndex`：在某个 detent 以内背景不变暗

## 10. Android 专属 sheet footer

文档提到：

- `unstable_sheetFooter` 是 **Android only**
- 还是 **experimental**

它可以在 sheet 底部放一个始终可见的 footer，例如确认按钮区。

## 11. `flex: 1` 的限制

文档明确说：

- 在 **SDK 55+** 中，数值型 detents 下，iOS 上 `flex: 1` 工作正常
- 但在 `fitToContents` 下仍然不行，必须显式提供内容尺寸

这类限制非常容易踩坑，因为很多 React Native 布局默认就喜欢 `flex: 1`。

## 12. 其他 presentation 形式

文档最后列出一系列 `presentation` 可选值：

- `card`
- `modal`
- `transparentModal`
- `containedModal`
- `containedTransparentModal`
- `fullScreenModal`
- `formSheet`

它们的重点区别是：是否保留底层页面可见、是否走 iOS 原生模态风格、是否表现为可拖拽 sheet。

## 关键流程 / 命令 / 配置说明

### 最基础的 modal 路由结构

```text
src/app
  _layout.tsx
  index.tsx
  modal.tsx
```

### 关键配置

```tsx
<Stack.Screen
  name="modal"
  options={{
    presentation: 'modal',
  }}
/>
```

### 深链接 modal 的锚点配置

```ts
export const unstable_settings = {
  anchor: 'index',
};
```

### form sheet 相关配置项

- `presentation: 'formSheet'`
- `sheetAllowedDetents`
- `sheetInitialDetentIndex`
- `sheetGrabberVisible`
- `sheetCornerRadius`
- `sheetLargestUndimmedDetentIndex`
- `unstable_sheetFooter`

### 当前文档涉及的命令

当前文档未涉及。

## 注意事项、限制条件和坑点

- Web 上 modal 本质是独立路由，不会天然拥有原生 modal 的关闭交互，需要你自己提供 dismiss 逻辑。
- 深链接进入 modal 时，如果不设置 `anchor`，背后的导航上下文可能被清掉。
- `fitToContents` 与 `flex: 1` 不兼容，必须提供明确内容尺寸。
- Android 最多只支持 3 个 detent，这是文档直接说明的限制。
- `sheetGrabberVisible` 仅 iOS 支持。
- `unstable_sheetFooter` 是 Android 专属且仍是 experimental。

## React Web 开发者最容易误解的地方

- **误解 1：modal 一定只是组件，不是页面。**  
  在 Expo Router 中，modal 可以就是一个真正的路由页面。

- **误解 2：Web modal 和原生 modal 行为差不多。**  
  文档明确说 Web 上它是独立路由，关闭逻辑要自己处理。

- **误解 3：`flex: 1` 在所有 sheet 模式都可用。**  
  在 `fitToContents` 下文档明确说不行。

- **误解 4：深链接打开 modal 时返回行为一定正常。**  
  如果没有 anchor，导航上下文会出问题。

## 实际开发建议

- 基于文档内容推导：如果交互不需要 URL、不需要被深链接、不需要出现在导航历史里，优先考虑 React Native `Modal`，复杂度更低。
- 基于文档内容推导：如果一个弹层完成后要进入其他路由、要支持分享链接或直接访问，优先建成 Expo Router modal route。
- 基于经验建议：做 sheet 时，先决定你要“固定停靠点”还是“内容自适应”，再决定用数值 detents 还是 `fitToContents`，否则布局会反复返工。
- 基于经验建议：Web 上最好显式提供关闭按钮，不要只依赖浏览器返回。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- 可以用 React Native `Modal` 或 Expo Router modal route 两种方式实现 modal。
- Expo Router modal route 需要在 `Stack.Screen` 上设置 `presentation`。
- Web 上 modal 是单独路由，需要手动处理 dismiss。
- 深链接 modal 需要 anchor 才能保留背景导航上下文。
- `formSheet` 支持 detents，Android 最多 3 个。
- `fitToContents` 不支持 `flex: 1`。

### 基于文档内容推导

- Expo Router modal route 的核心价值不只是“弹出来”，而是“仍然属于导航系统”。
- `anchor` 本质上是在 modal 深链接场景下，为返回路径预先保留一个导航基准页。
- 如果你的业务强依赖 URL、历史记录和恢复上下文，route-based modal 会比纯组件 modal 更合适。

<!-- NAVIGATION START -->
---
[← 上一页：Nesting navigators](./62_nesting-navigators.md) | [下一页：Web modals →](./64_web-modals.md)
<!-- NAVIGATION END -->
