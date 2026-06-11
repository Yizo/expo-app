# Expo Router Color API

## 文档解决的问题

这篇文档讲的是：如何通过 Expo Router 提供的 `Color` API 读取原生平台系统颜色。它解决的是“想复用 iOS/Android 原生设计体系颜色，而不是手写十六进制色值”这个问题。

## 适用场景

- 你想让应用更贴近 iOS 和 Android 系统视觉语言。
- 你希望颜色跟随系统亮色/暗色模式。
- 你需要访问 Android 主题属性、Material 3 颜色，或 iOS 系统语义色。

## 先建立正确心智模型

- 这不是普通的 CSS 颜色工具。
- `Color` API 提供的是“平台原生颜色语义入口”。
- 对 React Web 开发者来说，它更像在调用“系统设计 token”，而不是写死 `#fff`、`#000`。

## 核心概念

### 1. Android 基础颜色

文档说明可以通过 `Color.android.*` 访问 Android 颜色。

### 2. Android 主题属性颜色

通过 `Color.android.attr.*` 读取当前主题里的属性色，例如：

- `colorPrimary`
- `colorSecondary`
- `colorAccent`
- `colorBackground`

这类颜色本质上来自 Android 当前主题配置。

### 3. Material Design 3 静态颜色

通过 `Color.android.material.*` 读取 Material 3 标准 Light/Dark 主题色，例如：

- `primary`
- `onPrimary`
- `primaryContainer`
- `surface`
- `onSurface`

### 4. Material Design 3 动态颜色

通过 `Color.android.dynamic.*` 读取动态颜色。

文档明确说明：

- 它会根据用户壁纸适配颜色。
- 依赖 Android 12+（API 31+）的 Dynamic Color 能力。
- 可用的颜色角色与 Material 3 静态颜色一致。

### 5. iOS 系统颜色

通过 `Color.ios.*` 访问 UIKit 系统颜色，例如：

- `systemBackground`
- `label`

文档明确说明：这些颜色会自动适配系统明暗模式和辅助功能设置。

### 6. 跨平台选择

文档建议配合 `Platform.select`，为不同平台分别选取颜色。

## 关键流程

### Android 使用示例

```tsx
Color.android.attr.colorPrimary;
Color.android.material.primary;
Color.android.dynamic.surface;
```

### iOS 使用示例

```tsx
Color.ios.systemBackground;
Color.ios.label;
```

### 跨平台使用示例

```tsx
const backgroundColor = Platform.select({
  ios: Color.ios.systemBackground,
  android: Color.android.dynamic.surface,
  default: '#000000',
});
```

## 主题变化的关键点

文档特别强调 Android 的 Material 颜色会响应系统亮/暗模式变化，因此组件里要调用 React Native 的 `useColorScheme()`，以确保主题切换时组件重新渲染。

文档明确警告：

- 如果不调用 `useColorScheme()`，颜色可能不会在主题切换后更新。
- 使用 React Compiler 时这点尤其重要，因为组件可能被 memoize，导致不重新渲染。

## 命令、配置、文件说明

### 常用 API

- `Color.android.attr.*`
- `Color.android.material.*`
- `Color.android.dynamic.*`
- `Color.ios.*`
- `Platform.select`
- `useColorScheme()`

当前文档未涉及 CLI 命令、app config 配置或特定文件结构要求。

## 注意事项、限制条件和坑点

- `Color` API 是平台相关的，不是所有颜色都跨平台可直接复用。
- Android 动态颜色只在 Android 12+ 可用。
- Android 主题切换时，不调用 `useColorScheme()` 可能导致界面不刷新。
- 文档未提供 Web 专用颜色 token；跨平台时要自己给 `default` 分支。

## React Web 开发者容易误解的地方

- 不要把它当成 CSS 变量系统。
  它更接近原生系统语义色访问层。
- 不要默认 `Color.android.dynamic.*` 在所有 Android 设备都可用。
  文档明确要求 Android 12+。
- 不要以为颜色值会自动推动 React 组件刷新。
  文档明确提醒要用 `useColorScheme()` 触发重渲染。

## 实际开发建议

- 基于经验建议：做原生感较强的页面时，优先使用系统语义色而不是硬编码颜色。
- 基于经验建议：跨平台组件最好始终写 `Platform.select` 的兜底分支。
- 基于文档内容推导：如果设计系统强调“跟随用户系统主题”，Android 端必须把 `useColorScheme()` 纳入组件实现。
- 基于文档内容推导：Web 端通常还需要自己的设计 token，因为本页重点是原生平台颜色能力。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Android 支持 attr、Material 3 static、Material 3 dynamic 三类颜色入口。
- Dynamic Color 依赖 Android 12+。
- iOS 颜色自动适配系统 appearance 与辅助功能。
- Android 主题切换时应使用 `useColorScheme()`。

### 基于文档内容推导

- `Color` API 更适合作为“原生平台视觉对齐工具”，而不是单独承担完整跨平台设计系统。
- 想写好跨平台颜色方案，往往需要把 Expo Router `Color` 与自己的 Web 颜色体系并用。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router URL 参数](./82_url-parameters.md) | [下一页：Expo Router Sitemap →](./84_sitemap.md)
<!-- NAVIGATION END -->
