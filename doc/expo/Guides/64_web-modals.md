# Web modals

## 文档解决的问题

这篇文档专门讲：如何在 **Expo Router 的 Web 端** 实现和定制 modal 行为。

重点不是“移动端 modal 怎么映射到 Web”，而是“在 Web 上怎样既保留路由语义，又做出接近现代 Web 应用的 modal 体验”。

## 适用场景

- 你在做 Expo Router Web 应用，希望 modal 在桌面端像居中的弹窗，在移动宽度下像底部 sheet。
- 你希望 modal 仍然是路由的一部分，支持 URL、跳转和深链接。
- 你需要定制 Web modal 的宽高、阴影、遮罩、边框等桌面端外观。
- 你想实现透明遮罩、自定义动画的 Web modal。

## 阅读前需要理解的背景知识

- **当前特性是 alpha**：文档明确说明 Web modals 在 SDK 54+ 才可用，而且是 alpha。
- **需要环境变量显式开启**：不是默认开启的稳定能力。
- **路由式 modal**：它不是纯 DOM 弹层，而是通过 `Stack.Screen` 的 `presentation` 来控制页面呈现。
- **anchor / initialRouteName**：为深链接 modal 提供背景路由上下文。

## 按原文结构整理的核心内容

## 1. 使用前提：必须开启实验开关

文档明确要求：

- 设置 `EXPO_UNSTABLE_WEB_MODAL=1`
- 开发和 export 构建都要设置

可以放在项目根目录 `.env`，也可以命令前缀设置，例如：

```sh
EXPO_UNSTABLE_WEB_MODAL=1 npx expo start
```

这说明 Web modal 不是“只写代码就行”，还依赖运行环境开关。

## 2. 基础结构：modal 仍然是一个路由页面

文档示例结构：

```text
src/app
  _layout.tsx
  index.tsx
  modal.tsx
```

在 `_layout.tsx` 中把 `modal` 加入 `Stack`，并设置：

- `presentation: 'modal'`
- 可选 `sheetAllowedDetents`

同时文档示例还设置：

```ts
export const unstable_settings = {
  anchor: 'index',
};
```

它的作用是：当 modal 被深链接访问时，背景仍然保留 `index` 作为底层上下文。

## 3. Web modal 的响应式呈现思路

文档的核心设计是：

- **宽度大于 768px**：modal 以桌面居中覆盖层形式展示，类似 lightbox 或桌面弹窗
- **宽度小于 768px**：更偏向 sheet / bottom sheet 体验

这点对 React Web 开发者很友好，因为它不是简单复刻原生，而是按屏幕宽度切换表现形态。

## 4. 可用的 presentation 形式

文档列出几种 Web modal 展示方式：

- `modal`
- `formSheet`
- `transparentModal`
- `containedTransparentModal`

其中：

- `modal` / `formSheet` 更适合标准弹窗或底部 sheet
- `transparentModal` / `containedTransparentModal` 更适合你自己控制背景透出和自定义视觉层

文档还特别说明：

- 对 `transparentModal` 和 `containedTransparentModal`，detents 和部分 sheet 属性不会生效

## 5. 主要配置项

文档重点介绍了以下选项：

- `presentation`
- `sheetAllowedDetents`
- `sheetGrabberVisible`
- `sheetCornerRadius`
- `webModalStyle`

这里面最关键的是 `webModalStyle`，因为它专门解决 Web 桌面端 modal 外观定制。

## 6. `webModalStyle` 能做什么

文档给出这些属性：

- `width`
- `height`
- `minWidth`
- `minHeight`
- `border`
- `overlayBackground`
- `shadow`

可以把它理解成“为 Web modal 暴露的一组受控 CSS 外观入口”。

文档明确说明：

- 这些设置只对 Web 生效
- 移动端会自动适配为更像 sheet 的交互

## 7. 它底层其实会映射成 CSS 自定义变量

文档进一步说明，Expo Router 会用一组 `--expo-router-modal-*` CSS 变量控制 Web modal 外观，例如：

- `--expo-router-modal-width`
- `--expo-router-modal-height`
- `--expo-router-modal-border`
- `--expo-router-modal-shadow`
- `--expo-router-modal-overlay-background`

也就是说，你既可以：

- 在路由配置里用 `webModalStyle`
- 也可以在全局 CSS 里统一覆写这些变量

## 8. 常见样式模式

文档给了几个很典型的例子：

### 全屏风格 modal

- `width: '95vw'`
- `height: '95vh'`
- 可配 `sheetAllowedDetents` 避免在移动端也完全全屏

### 紧凑型 modal

- 例如 `width: 400`
- `height: 'auto'`
- `minHeight: 200`
- 配合较轻的边框和遮罩

### 透明 modal

- `presentation: 'transparentModal'`
- 适合自己完全控制遮罩和内容视觉

### 自定义圆角和 detents

- `sheetCornerRadius`
- `sheetAllowedDetents`

## 9. 全局 CSS 定制

如果项目已经有 global CSS，文档明确说可以直接在全局样式里覆写这些 CSS 变量。

这对 React Web 开发者很重要，因为这意味着：

- 你不一定要在每个 `Stack.Screen` 里重复配置
- 可以像传统 Web 主题系统一样，统一调整 modal 视觉

## 10. 自定义实现一个更“网页化”的 modal

文档最后还给出一种更自定义的路线：

- 在布局里把 modal 设为 `transparentModal`
- 加 `animation: 'fade'`
- `headerShown: false`
- 用 `react-native-reanimated` 自己控制遮罩和内容动画

modal 页面本身则：

- 外层半透明遮罩
- 点击遮罩区域关闭
- 中间内容盒子用滑入动画出现

这个例子说明 Expo Router 的 Web modal 并不只是预设组件，而是能与自定义 UI 结合。

## 关键流程 / 命令 / 配置说明

## 启用特性

```sh
EXPO_UNSTABLE_WEB_MODAL=1 npx expo start
```

## 关键文件结构

```text
src/app
  _layout.tsx
  index.tsx
  modal.tsx
```

## 关键配置项

```tsx
export const unstable_settings = {
  anchor: 'index',
};
```

```tsx
<Stack.Screen
  name="modal"
  options={{
    presentation: 'modal',
    sheetAllowedDetents: [0.5, 1],
    webModalStyle: {
      width: 800,
      height: 600,
    },
  }}
/>
```

## 全局 CSS 入口

- `--expo-router-modal-width`
- `--expo-router-modal-max-width`
- `--expo-router-modal-min-width`
- `--expo-router-modal-height`
- `--expo-router-modal-min-height`
- `--expo-router-modal-border`
- `--expo-router-modal-border-radius`
- `--expo-router-modal-shadow`
- `--expo-router-modal-overlay-background`

## 注意事项、限制条件和坑点

- 这是 **alpha** 特性，文档明确说明可能不稳定。
- 必须设置 `EXPO_UNSTABLE_WEB_MODAL=1`，否则新 Web modal 行为不可用。
- `transparentModal` 和 `containedTransparentModal` 下，detents 等 sheet 属性不会生效。
- `sheetGrabberVisible` 不支持 Android 和 Web，文档建议用自定义头部模拟统一效果。
- 文档明确说 `unstable_settings` 当前只对 `Stack` navigator 有效。
- 如果没有正确配置 anchor / initialRouteName，深链接 modal 时容易丢失背景导航上下文。

## React Web 开发者最容易误解的地方

- **误解 1：Web modal 就是一个普通绝对定位层。**  
  这里的 modal 仍然和路由、URL、导航上下文绑定。

- **误解 2：桌面和移动 Web 会用同一套展示规则。**  
  文档明确按照 768px 宽度做了两类表现。

- **误解 3：`webModalStyle` 就是任意 CSS 注入。**  
  它本质是 Expo Router 暴露的几组受控样式入口，不是无限制自定义。

- **误解 4：透明 modal 还能继续使用所有 sheet 能力。**  
  文档明确说 detents 和部分属性不会生效。

## 实际开发建议

- 基于文档内容推导：如果你的 Web modal 风格需要和品牌视觉高度统一，优先评估 `webModalStyle` + 全局 CSS 变量，而不是每个页面单独 hardcode。
- 基于文档内容推导：如果你需要“像网页弹窗而不是像移动端 sheet”，桌面宽屏下优先用 `modal` 或 `transparentModal` 方案。
- 基于经验建议：对 Web 用户，最好总是提供明确关闭按钮和点击遮罩关闭，不要只依赖浏览器后退。
- 基于经验建议：如果要做复杂动画，先确认 `transparentModal` 是否更适合，因为它给你的视觉控制空间更大。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- Web modals 是 alpha，SDK 54+ 可用。
- 必须设置 `EXPO_UNSTABLE_WEB_MODAL=1`。
- 它通过 `Stack.Screen` 的 `presentation` 和一系列配置项工作。
- `webModalStyle` 只作用于 Web。
- 这些 Web 样式底层会映射为 CSS 自定义变量。
- `unstable_settings` 当前只对 `Stack` 有效。

### 基于文档内容推导

- Expo Router 正在尝试把“路由式 modal”做成一套跨平台但又尊重 Web 交互习惯的模型。
- 对桌面 Web 来说，`webModalStyle` 是比纯 RN style 更接近传统 Web UI 定制方式的入口。
- 如果你要做强交互、自定义外观的 Web modal，`transparentModal` 往往比标准 `modal` 更有扩展性。
