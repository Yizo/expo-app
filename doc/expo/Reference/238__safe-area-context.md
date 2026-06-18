# react-native-safe-area-context — 安全区域适配

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/safe-area-context.md

## 文档解决的问题

在移动端设备上，屏幕并非所有区域都可以用来显示内容。例如：

- **刘海屏（Notch）**：iPhone X 及之后的机型在屏幕顶部有一个凹口（刘海），遮挡了部分显示区域。
- **系统状态栏**：顶部状态栏（时间、电量、信号等）会占据一定空间。
- **底部操作指示条（Home Indicator）**：iPhone 底部的横条手势区域。
- **Android 的圆角、打孔摄像头、导航栏**等。

这些不可用区域统称为**不安全区域（Unsafe Area）**，而剩余可用的显示区域称为**安全区域（Safe Area）**。如果你的 UI 元素（如顶部导航栏、底部 Tab 栏）没有考虑安全区域，内容可能会被刘海遮挡或与系统手势条重叠，导致体验极差。

`react-native-safe-area-context` 就是用来解决这个问题的。它提供了一套灵活的 API，让你可以获取设备的安全区域内边距（称为 **Insets**），并据此合理安排 UI 布局。

> **React Web 类比**：在 Web 开发中，你可能用过 CSS 的 `env(safe-area-inset-top)` 等环境变量来处理 iPhone 安全区域。这个库的功能类似，但它是跨平台的（iOS、Android、Web 都能用），并且提供了 React 组件和 Hook 两种使用方式。

## 阅读前需要理解的背景知识

### 什么是 Safe Area（安全区域）

安全区域是指屏幕上不被硬件特征（刘海、圆角）和系统 UI（状态栏、底部指示条）遮挡的区域。每台设备的安全区域不同，需要通过系统 API 动态获取。

### 什么是 Insets（内边距/插入量）

Insets 是四个方向（top、right、bottom、left）的像素值，表示安全区域距离屏幕边缘的距离。例如，iPhone 14 Pro 的 `top` inset 大约是 59pt（因为灵动岛的存在），`bottom` 大约是 34pt（Home Indicator 的高度）。

### 什么是 Provider（提供者）

如果你熟悉 React 的 Context API，Provider 的概念是一样的。`SafeAreaProvider` 在组件树的顶层注入安全区域数据，子组件可以通过 Hook 或 Context Consumer 读取这些数据。这与 React Web 中使用 `Context.Provider` 包裹根组件的模式完全一致。

## 安装

使用 Expo CLI 安装此包：

```sh
# npm
npx expo install react-native-safe-area-context

# yarn
yarn expo install react-native-safe-area-context

# pnpm
pnpm expo install react-native-safe-area-context

# bun
bun expo install react-native-safe-area-context
```

**说明**：`npx expo install` 是 Expo 推荐的安装方式，它会自动选择与当前 Expo SDK 版本兼容的包版本。这与直接运行 `npm install` 不同——后者可能安装不兼容的最新版本。

> **注意**：如果你的项目是已有的纯 React Native 项目（非 Expo 项目），需要先确保已安装 `expo` 包，然后参考该库的外部 README 进行额外的原生配置步骤。

## 核心 API 概览

该库主要导出四个成员：

```js
import {
  SafeAreaView,       // 自动应用安全区域内边距的视图组件
  SafeAreaProvider,    // 在组件树顶层注入安全区域数据的 Provider
  SafeAreaInsetsContext, // React Context 对象，用于通过 Consumer 读取 insets
  useSafeAreaInsets,   // 自定义 Hook，直接获取 insets 数值
} from 'react-native-safe-area-context';
```

## 组件详解

### SafeAreaProvider — 安全区域数据提供者

**这是必须使用的组件。** 你需要在应用的根组件中用它包裹整个组件树，这样所有子组件才能获取到安全区域数据。

```jsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      {/* 你的应用内容 */}
    </SafeAreaProvider>
  );
}
```

**重要**：以下场景也需要单独包裹 `SafeAreaProvider`：
- **Modal（模态框）**：React Native 的 `Modal` 组件会创建一个新的原生视图层级，它不在原组件树内，因此无法继承外层的 Provider 数据。
- **某些路由库的独立屏幕**：部分导航库（如 `react-native-navigation`）的每个屏幕运行在独立的原生容器中，也需要单独包裹 Provider。

> **React Web 类比**：这类似于在 React Web 中用 `<ThemeProvider>` 包裹根组件。区别在于，Web 中的 CSS 变量可以在任何层级生效，而移动端的安全区域数据必须通过 React Context 显式传递。

### SafeAreaView — 自动应用安全区域的视图

`SafeAreaView` 是一个特殊的视图组件，它会自动将安全区域的 insets 作为 padding 应用到自身。你手动设置的 padding 会与自动添加的 insets **累加**，而不是覆盖。

```jsx
import { SafeAreaView } from 'react-native-safe-area-context';

function SomeComponent() {
  return (
    <SafeAreaView>
      <View />
    </SafeAreaView>
  );
}
```

#### 属性（Props）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `edges` | `Edge[]` | 全部四个方向 | 指定哪些边需要应用安全区域内边距。可选值为 `'top'`、`'right'`、`'bottom'`、`'left'`。例如 `edges={['top', 'bottom']}` 只对上下方向生效。 |
| `emulateUnlessSupported` | `boolean` | `true` | 在较旧的 iOS 版本上（不支持原生 Safe Area API），是否使用状态栏高度和 Home Indicator 高度来模拟安全区域。一般保持默认值即可。 |

**`edges` 属性的典型用法**：

```jsx
// 只对顶部和底部生效，左右不处理
<SafeAreaView edges={['top', 'bottom']}>
  <MyContent />
</SafeAreaView>
```

这在实际开发中很常见——很多应用只需要处理顶部状态栏和底部操作条，左右方向通常不需要额外内边距。

> **注意**：在 Web 平台上使用 `SafeAreaView` 时，必须确保外层已包裹 `SafeAreaProvider`，否则无法获取到安全区域数据。

### useSafeAreaInsets() — 直接获取 insets 数值

这是一个自定义 Hook，返回一个 `EdgeInsets` 对象，包含四个方向的像素值。适合需要精细控制布局的场景。

```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HookComponent() {
  const insets = useSafeAreaInsets();

  return <View style={{ paddingTop: insets.top }} />;
}
```

返回值的结构：

```js
{
  top: number,    // 顶部安全区域内边距（像素）
  right: number,  // 右侧安全区域内边距（像素）
  bottom: number, // 底部安全区域内边距（像素）
  left: number,   // 左侧安全区域内边距（像素）
}
```

> **性能注意**：原文档明确指出，在设备旋转时，`useSafeAreaInsets()` Hook 的性能可能不如 `SafeAreaView` 组件。这是因为 Hook 需要通过 JavaScript 桥接层（Bridge）异步传递数据，而 `SafeAreaView` 直接在原生层处理。如果你的页面需要频繁响应旋转，优先使用 `SafeAreaView`。

### SafeAreaInsetsContext — 通过 Context Consumer 读取

这是传统的 React Context 消费方式，适用于不方便使用 Hook 的场景（如类组件）：

```jsx
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

function Component() {
  return (
    <SafeAreaInsetsContext.Consumer>
      {insets => <View style={{ paddingTop: insets.top }} />}
    </SafeAreaInsetsContext.Consumer>
  );
}
```

在函数组件中，推荐直接使用 `useSafeAreaInsets()` Hook，代码更简洁。

## 类型定义

### Edge

字符串联合类型，表示四个方向之一：

```ts
type Edge = 'top' | 'right' | 'bottom' | 'left';
```

### EdgeInsets

`useSafeAreaInsets()` 返回的对象类型：

| 属性 | 类型 | 说明 |
|------|------|------|
| `top` | `number` | 顶部安全区域内边距（像素值） |
| `right` | `number` | 右侧安全区域内边距（像素值） |
| `bottom` | `number` | 底部安全区域内边距（像素值） |
| `left` | `number` | 左侧安全区域内边距（像素值） |

## 优化指南

### 使用 SafeAreaView 优先于 Hook

原文档建议优先使用 `SafeAreaView` 组件而非 `useSafeAreaInsets()` Hook。原因是 `SafeAreaView` 在原生层直接处理安全区域内边距，避免了通过 JavaScript 桥接层（Bridge）异步传递数据的延迟。这在设备旋转时尤为明显——使用 Hook 可能出现短暂的布局闪烁。

### 加速首次渲染：传入 initialMetrics

默认情况下，`SafeAreaProvider` 需要异步获取设备的安全区域数据，这会导致首次渲染时 insets 为 `null`，可能引起布局闪烁。你可以通过传入 `initialWindowMetrics` 来提供初始值，避免这个问题：

```jsx
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/* 应用内容 */}
    </SafeAreaProvider>
  );
}
```

**使用前提条件**：
- `SafeAreaProvider` 不会在应用生命周期中被卸载再重新挂载（即它始终存在于组件树中）。
- 你没有使用 `react-native-navigation`（该库的屏幕管理机制与此优化冲突）。

> **React Web 类比**：这类似于 React Web 中使用 `useState` 的初始值来避免首次渲染时的 loading 闪烁。`initialWindowMetrics` 提供了"我知道初始值是什么，别去异步获取了"的能力。

### Web SSR（服务端渲染）处理

在服务端渲染时，服务器无法获取设备的安全区域数据。此时需要传入初始值或将所有 insets 设为 `0`，以防止异步测量导致的服务端与客户端布局不一致（hydration mismatch）。

## 从 CSS 迁移

如果你在 Web 项目中曾使用 CSS 的 `env(safe-area-inset-*)` 环境变量来处理安全区域，迁移到 React Native 时应改用 `useSafeAreaInsets()` Hook，将 insets 值直接应用到样式中：

```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    />
  );
}
```

**CSS 对照表**：

| CSS 写法 | React Native 写法 |
|----------|-------------------|
| `padding-top: env(safe-area-inset-top)` | `paddingTop: insets.top` |
| `padding-bottom: env(safe-area-inset-bottom)` | `paddingBottom: insets.bottom` |
| `padding-left: env(safe-area-inset-left)` | `paddingLeft: insets.left` |
| `padding-right: env(safe-area-inset-right)` | `paddingRight: insets.right` |

这种写法的好处是跨平台统一——同一套代码在 iOS、Android、Web 上都能正确工作，而 CSS 的 `env()` 函数只在支持它的浏览器中生效。

## 注意事项、限制条件和坑点

1. **必须包裹 SafeAreaProvider**：忘记在根组件中添加 `SafeAreaProvider` 是最常见的错误。没有它，`SafeAreaView`（Web 端）和 `useSafeAreaInsets()` 都无法获取到数据。

2. **Modal 需要单独的 Provider**：React Native 的 `Modal` 组件在原生层创建了新的视图层级，外层的 `SafeAreaProvider` 数据无法穿透。如果你的 Modal 中需要安全区域信息，必须在 Modal 内部再放一个 `SafeAreaProvider`。

3. **SafeAreaView 的 padding 是累加的**：`SafeAreaView` 自动添加的 insets padding 会与你手动设置的 padding 累加，而不是覆盖。如果你手动设了 `paddingTop: 20`，而设备顶部 inset 是 59，那么实际的顶部内边距是 79。

4. **Hook 在旋转时性能较差**：`useSafeAreaInsets()` 在设备旋转时可能比 `SafeAreaView` 慢，因为数据需要经过 JS Bridge 异步传递。如果页面需要频繁响应旋转，应优先使用 `SafeAreaView`。

5. **Web 端 SafeAreaView 依赖 Provider**：在原生平台上，`SafeAreaView` 可以直接工作；但在 Web 平台上，它必须依赖外层的 `SafeAreaProvider` 才能获取安全区域数据。

6. **initialMetrics 的使用限制**：只有在 `SafeAreaProvider` 不会被卸载重挂载、且不使用 `react-native-navigation` 的前提下，才能安全地使用 `initialWindowMetrics` 优化。

## React Web 开发者需要特别注意的地方

1. **安全区域不是 CSS 问题，而是原生系统问题**：在 Web 中，安全区域通过 CSS 环境变量处理，浏览器会自动提供数值。在 React Native 中，安全区域数据来自操作系统原生 API，需要通过 React Context 在 JavaScript 层传递。这是一个架构层面的差异。

2. **没有"全局样式"的概念**：Web 中你可以在全局 CSS 文件中设置 `padding-top: env(safe-area-inset-top)` 一次生效。在 React Native 中，每个需要安全区域的组件都必须通过 `SafeAreaView` 或 `useSafeAreaInsets()` 显式获取 insets。

3. **JS Bridge 的性能影响**：React Native 的 JavaScript 代码运行在独立的 JS 引擎中，与原生 UI 层通过 Bridge 通信。`useSafeAreaInsets()` 的 insets 数据需要经过 Bridge 传递，因此在高频更新场景（如设备旋转动画）中可能有延迟。`SafeAreaView` 在原生层直接处理，不受此影响。这是 React Web 开发中不会遇到的问题。

4. **Modal 的 Context 隔离**：在 React Web 中，Portal 渲染的内容仍然可以访问外层的 Context。但 React Native 的 `Modal` 是原生层面的新窗口，Context 无法穿透。这是 Web 和 Native 的一个重要差异。

## 实际开发建议

1. **在应用根组件中始终包裹 `SafeAreaProvider`**：这是最基本的一步。通常放在 `App.tsx` 的最外层。

2. **页面级布局优先使用 `SafeAreaView`**：对于整个页面的根容器，使用 `SafeAreaView` 是最简单且性能最好的方式。

3. **局部组件使用 `useSafeAreaInsets()` Hook**：当你需要在自定义组件中精细控制某个方向的间距时（如自定义底部浮动按钮），使用 Hook 获取具体数值。

4. **善用 `edges` 属性**：大多数场景只需要处理 `top` 和 `bottom`，设置 `edges={['top', 'bottom']}` 可以避免左右方向不必要的内边距。

5. **使用 `initialWindowMetrics` 避免首次渲染闪烁**：对用户体验要求较高的应用，建议在 Provider 中传入初始 metrics。

6. **自定义底部导航栏必须处理底部 inset**：如果你自己实现底部 Tab 栏（而非使用系统默认的），务必将 `insets.bottom` 加到底部 padding 中，否则内容会与 Home Indicator 重叠。

## 总结

`react-native-safe-area-context` 是 React Native / Expo 项目中处理设备安全区域适配的标准库。它的核心用法可以概括为：

- **根组件包裹 `SafeAreaProvider`**，注入安全区域数据。
- **页面级使用 `SafeAreaView`**，自动应用安全区域内边距（推荐方式，性能更优）。
- **精细控制使用 `useSafeAreaInsets()`**，获取四个方向的像素值手动应用。

对于从 React Web 转过来的开发者，最关键的理解差异是：安全区域在移动端是一个原生系统级别的概念，需要通过 React Context 传递，而非 CSS 环境变量。同时，Modal 的 Context 隔离和 JS Bridge 的性能特性是 Web 开发中不会遇到的新问题。

---

## 文档导航

- **上一页**：[reanimated](./237__reanimated.md)
- **下一页**：[screens](./239__screens.md)
