# Reanimated -- React Native 高性能动画库

> 文档来源：[react-native-reanimated](https://docs.expo.dev/versions/unversioned/sdk/reanimated/)
>
> 适用平台：Android、iOS、tvOS、Web、Expo Go

## 文档解决的问题

在 React Web 开发中，我们通常使用 CSS `transition`、CSS `@keyframes` 或 Web Animation API 来实现动画效果。但在 React Native 中，传统的 CSS 动画不可用，因为 React Native 不使用浏览器渲染引擎。

`react-native-reanimated`（简称 Reanimated）是 React Native 生态中最主流的动画库，它提供了一套声明式的 API 来构建流畅、高性能的动画效果。与普通 React Native `Animated` API 相比，Reanimated 的核心优势在于**动画运行在 UI 线程**上，不会因为 JavaScript 线程繁忙而掉帧。

**在 Expo 项目中，Reanimated 已预集成在 Expo Go 中**，这意味着你在使用 Expo Go 预览时就可以直接使用 Reanimated，无需额外的原生配置。

## 阅读前需要理解的背景知识

### React Native 的线程模型

在 React Web 中，JavaScript 和渲染运行在同一个线程（主线程）上。但在 React Native 中，存在多个线程：

- **JavaScript 线程**：运行你的 React 代码（组件逻辑、事件处理等）。
- **UI 线程（主线程）**：负责原生视图的渲染和绘制。

当 JavaScript 线程执行耗时操作时，传统动画（如 React Native 内置的 `Animated` API）可能会因为 JS 线程阻塞而出现卡顿。Reanimated 通过将动画逻辑直接放到 UI 线程执行来解决这个问题。

### 什么是 Worklet

**Worklet** 是 Reanimated 的核心概念之一。简单来说，worklet 是一段被标记为"在 UI 线程上运行"的 JavaScript 函数。当你在 Reanimated 中使用 `useAnimatedStyle` 等 Hook 时，其回调函数实际上会被转换为 worklet，在 UI 线程上执行，从而保证动画的流畅性。

文档中安装的 `react-native-worklets` 包就是为 Reanimated 提供 worklet 运行时支持的依赖。

> 对于 React Web 开发者：你可以把 worklet 理解为一种特殊的函数，它看起来像普通 JS 函数，但实际运行在原生 UI 线程上，不受 JS 线程繁忙的影响。

### Hermes 引擎

Hermes 是 Meta（Facebook）为 React Native 专门开发的 JavaScript 引擎，替代了早期的 JavaScriptCore (JSC)。Hermes 针对移动端做了优化，启动更快、内存占用更低。

**Reanimated 要求使用 Hermes 引擎进行调试**，这一点在文档中有专门的警告（详见下文）。

## 安装与配置

### 安装命令

使用你习惯的包管理器执行以下命令（任选其一）：

```sh
# 使用 npm
npx expo install react-native-reanimated react-native-worklets

# 使用 yarn
yarn expo install react-native-reanimated react-native-worklets

# 使用 pnpm
pnpm expo install react-native-reanimated react-native-worklets

# 使用 bun
bun expo install react-native-reanimated react-native-worklets
```

**需要安装两个包：**

| 包名 | 作用 |
|---|---|
| `react-native-reanimated` | Reanimated 动画库本体 |
| `react-native-worklets` | Worklet 运行时依赖，为 Reanimated 提供 UI 线程执行能力 |

> 注意：这里使用的是 `expo install` 而不是直接 `npm install`。`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突导致原生模块不兼容的问题。

### Babel 插件自动配置

安装完成后，**不需要额外的配置步骤**。Expo 的标准 Babel 预设（`babel-preset-expo`）中已经预配置了 Reanimated 的 Babel 插件。

> 对于 React Web 开发者：在 Web 项目中，安装某些库后通常需要手动修改 `babel.config.js` 或 `webpack.config.js` 来添加插件。但在 Expo 中，Reanimated 的 Babel 插件已经被内置在 `babel-preset-expo` 中，安装即可用，无需手动配置。这是 Expo "开箱即用" 理念的体现。

## 调试注意事项

文档中有一个**重要警告**：

> Reanimated 使用了与旧版 JavaScriptCore 远程调试方式不兼容的 React Native API。因此，**不能使用传统的 JSC 远程调试器**来调试使用了 Reanimated 的应用。

**解决方案**：必须使用 **Hermes 引擎**及其配套的 **Hermes Inspector** 进行调试。

> 对于 React Web 开发者：在 Web 开发中，我们习惯用 Chrome DevTools 直接调试 JavaScript。但在 React Native 中，由于 Reanimated 的代码（特别是 worklet）运行在 UI 线程而非 JS 线程，传统的远程调试方式无法捕获这些代码的执行情况。Hermes Inspector 是专门为 Hermes 引擎设计的调试工具，能够正确调试在 UI 线程上运行的代码。

## 使用示例详解

以下是一个基础动画示例，演示如何通过点击按钮随机改变一个方块的宽度：

```jsx
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { View, Button, StyleSheet } from 'react-native';

export default function AnimatedStyleUpdateExample() {
  const randomWidth = useSharedValue(10);

  const config = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const style = useAnimatedStyle(() => {
    return {
      width: withTiming(randomWidth.value, config),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, style]} />
      <Button
        title="toggle"
        onPress={() => {
          randomWidth.value = Math.random() * 350;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 80,
    backgroundColor: 'black',
    margin: 30,
  },
});
```

### 核心 API 逐一解析

#### `useSharedValue(initialValue)` -- 共享值

创建一个可以在 JS 线程和 UI 线程之间共享的响应式值。

- **参数**：`initialValue` -- 初始值（本例中为 `10`）
- **返回值**：一个带有 `.value` 属性的对象
- **使用方式**：通过 `.value` 读取和修改值
- **与 React `useState` 的区别**：`useState` 的值变更会触发组件重新渲染，而 `useSharedValue` 的值变更**不会触发 React 重新渲染**。它专为动画场景设计，值的变更直接驱动 UI 线程上的动画，避免了不必要的组件渲染开销。

> 对于 React Web 开发者：可以把它类比为 CSS 变量的 JS 版本 -- 你改变它的值，样式自动响应更新，但不会触发 React 的虚拟 DOM diff 过程。

#### `withTiming(targetValue, config)` -- 时间动画

创建一个基于时间的动画，将属性值从当前值平滑过渡到目标值。

- **参数**：
  - `targetValue` -- 动画的目标值
  - `config` -- 动画配置对象，包含：
    - `duration`：动画持续时间（毫秒），本例为 500ms
    - `easing`：缓动函数，控制动画的速度曲线
- **类比 Web**：相当于 CSS 的 `transition: width 500ms cubic-bezier(0.5, 0.01, 0, 1)`

#### `useAnimatedStyle(callback)` -- 动画样式 Hook

创建一个响应共享值变化的样式对象。当回调中引用的共享值发生变化时，返回的样式会自动更新，且更新发生在 UI 线程上。

- **参数**：一个 worklet 函数，返回样式对象
- **返回值**：可以直接传递给 `Animated.View` 等组件的 `style` 属性
- **类比 Web**：类似于一个自动响应变量变化的内联样式，但更新在原生层完成，不经过 React 渲染周期。

#### `Easing.bezier(x1, y1, x2, y2)` -- 缓动函数

创建一条三次贝塞尔曲线作为缓动函数，与 CSS 的 `cubic-bezier()` 完全等价。

- 本例中 `Easing.bezier(0.5, 0.01, 0, 1)` 对应 CSS 的 `cubic-bezier(0.5, 0.01, 0, 1)`
- 效果为：动画开始较慢，然后加速，最后平滑停止。

#### `Animated.View` -- 动画视图组件

这是 Reanimated 提供的特殊视图组件，可以接收 `useAnimatedStyle` 返回的动画样式。

> 对于 React Web 开发者：在 Web 中你可以给任何 HTML 元素添加 CSS 动画。但在 React Native 中，只有 `Animated.*` 系列组件（如 `Animated.View`、`Animated.Text`、`Animated.ScrollView` 等）才能接收动画样式。普通的 `View` 组件无法直接响应 Reanimated 的动画值。

### 示例逻辑梳理

1. 组件初始化时，`randomWidth` 共享值被设为 `10`。
2. `useAnimatedStyle` 创建一个动画样式，将 `width` 属性绑定到 `randomWidth.value`，并通过 `withTiming` 配置为 500ms 的缓动过渡动画。
3. 用户点击按钮时，`randomWidth.value` 被赋值为 `0 ~ 350` 之间的随机数。
4. Reanimated 自动在 UI 线程上执行从当前宽度到新宽度的平滑过渡动画。
5. 整个动画过程不触发 React 组件的重新渲染。

## 关键概念总结

| 概念 | 说明 | Web 类比 |
|---|---|---|
| Shared Value（共享值） | 可在 JS 和 UI 线程间共享的响应式值 | 类似 CSS 自定义属性（CSS Variables） |
| Worklet | 在 UI 线程执行的函数 | Web Worker（但更轻量，专用于动画） |
| Animated Style（动画样式） | 响应共享值变化的样式 | 类似 CSS transition，但由 JS 驱动 |
| Timing Animation | 基于时间的过渡动画 | CSS `transition` |
| `Animated.View` | 支持动画样式的视图组件 | 任何带 `transition` 的 HTML 元素 |

## 注意事项、限制条件和坑点

### 1. 调试工具限制

Reanimated **不兼容**传统的 JavaScriptCore 远程调试。如果你在项目中使用 React Native Debugger（基于 Chrome DevTools 协议）或 Flipper 的旧版调试模式，Reanimated 的动画代码将无法被正确调试。必须切换到 Hermes Inspector。

### 2. 必须同时安装 worklets 依赖

从当前版本开始，`react-native-worklets` 是一个独立于 `react-native-reanimated` 的必需依赖。如果只安装了 `react-native-reanimated` 而遗漏了 `react-native-worklets`，运行时将会报错。

### 3. 只有 `Animated.*` 组件支持动画样式

不要尝试将 `useAnimatedStyle` 的返回值直接传给普通 `View` 组件。虽然这在某些情况下可能看似"能用"，但并非官方支持的使用方式，可能导致不可预期的行为。应始终使用 `Animated.View`、`Animated.Text` 等 Reanimated 提供的组件。

### 4. 共享值不会触发 React 重新渲染

这是 Reanimated 的设计意图（性能优化），但如果你希望某个共享值的变化同时更新 UI 文本（比如在界面上显示当前动画值），需要额外使用 `useAnimatedProps` 或监听机制，不能像 `useState` 那样直接依赖渲染更新。

### 5. Babel 插件的重要性

虽然 Expo 已经预配置了 Reanimated 的 Babel 插件，但如果你在非 Expo 的裸 React Native 项目中使用，则需要**手动**在 `babel.config.js` 中添加 `'react-native-reanimated/plugin'` 插件。缺少此插件会导致 worklet 函数无法被正确转换，动画将无法在 UI 线程上执行。

## React Web 开发者需要特别注意的地方

1. **没有 CSS 动画可用**：React Native 中没有 CSS 文件，所有动画都必须通过 Reanimated 或其他动画库的 JavaScript API 来实现。习惯用 `transition` 和 `@keyframes` 的开发者需要适应 Reanimated 的声明式 API。

2. **`StyleSheet.create` 替代 CSS**：样式通过 `StyleSheet.create()` 定义，语法是 JavaScript 对象而非 CSS 字符串。属性名使用 camelCase（如 `backgroundColor` 而非 `background-color`），且不支持 CSS 选择器、伪类和媒体查询。

3. **`flex: 1` 的含义**：示例中的 `flex: 1` 让容器占满整个屏幕。在 React Native 中，`flex` 默认方向是 `column`（纵向），这与 Web 的默认 `row`（横向）不同。

4. **`onPress` 而非 `onClick`**：React Native 中的点击事件使用 `onPress`，而不是 Web 中的 `onClick`。

5. **动画是"原生级别"的**：Reanimated 的动画不经过 React 的渲染周期，而是在原生 UI 线程执行。这意味着动画性能远优于通过 `setState` 驱动的 JS 动画，但也意味着你不能在动画回调中直接调用普通的 React 函数（如 `setState`），除非通过特定的桥接机制。

## 深入学习资源

文档本身是一个简要介绍页面，如需深入了解 Reanimated 的完整 API 和高级用法，建议参考以下资源：

- **Software Mansion 官方文档**：Reanimated 由 Software Mansion 团队维护，其官方文档包含完整的 API 参考、交互式示例和最佳实践指南。（文档原文中提供了外部链接）

## 总结

`react-native-reanimated` 是 Expo/React Native 项目中最推荐的动画解决方案。它通过 worklet 机制将动画执行放到 UI 线程，彻底解决了 JS 线程阻塞导致的动画卡顿问题。在 Expo 项目中安装和使用都非常简单：

1. 通过 `npx expo install react-native-reanimated react-native-worklets` 安装。
2. Babel 插件已预配置，无需额外设置。
3. 使用 `useSharedValue` 创建动画值，`useAnimatedStyle` 创建动画样式，`Animated.View` 承载动画。
4. 调试时必须使用 Hermes Inspector，不可使用旧版 JSC 调试工具。

对于从 React Web 转来的开发者，最大的思维转变在于：**动画不在 React 渲染周期内运行**，而是在原生 UI 线程上独立执行。理解这一点，就能更好地理解 Reanimated 的 API 设计和使用约束。

---

## 文档导航

- **上一页**：[view pager](./236__view-pager.md)
- **下一页**：[safe area context](./238__safe-area-context.md)
