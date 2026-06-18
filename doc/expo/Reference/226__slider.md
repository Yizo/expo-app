# Slider -- 原生滑块组件 (@react-native-community/slider)

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/slider.md

## 文档解决的问题

在移动端应用中，经常需要用户在一个连续范围内选择一个数值，例如音量调节、亮度控制、进度拖拽等。Web 开发中我们通常使用 `<input type="range" />` 来实现这类功能，但在 React Native 中，HTML 表单元素不可用，需要使用专门的原生组件。

`@react-native-community/slider` 提供了封装好的原生滑块（Slider）组件，在 iOS 和 Android 上分别调用系统原生的 UI 滑块控件，同时也支持 Web 平台。该库已预装在 Expo Go 中，无需额外配置即可在 Expo 项目中使用。

## 适用场景

- 需要在指定数值范围内让用户拖动选择一个值
- 需要跨平台（iOS / Android / Web）一致的滑块交互体验
- 使用 Expo 开发，希望快速集成原生滑块组件而不引入复杂配置

## 阅读前需要理解的背景知识

### 什么是 Slider 组件

Slider（滑块）是一种常见的 UI 控件，由一条轨道（track）和一个可拖动的锚点（thumb / anchor）组成。用户通过拖动锚点在轨道上移动来选择数值。

在 React Web 中，等价于 `<input type="range" min={0} max={100} />`。但在 React Native 中，不能直接使用 HTML 元素，需要用平台原生组件来渲染。

### 什么是 @react-native-community 命名空间

`@react-native-community` 是 React Native 社区维护的 npm 命名空间。早期很多 React Native 核心模块（如 Slider、AsyncStorage、NetInfo 等）内置在 `react-native` 包中，后来被拆分为独立的社区维护包，以便更灵活地迭代和修复问题。这个拆分过程叫做 "Lean Core"（精简核心）。

因此 `@react-native-community/slider` 就是原来的 `Slider` 组件的社区独立版本。

### 什么是 Expo Go

Expo Go 是 Expo 提供的一个移动端沙盒应用，开发者可以在其中快速预览和调试 Expo 项目，而不需要编译原生代码。Expo Go 预装了大量常用的社区库，`@react-native-community/slider` 就是其中之一。这意味着在 Expo Go 环境下，你不需要做任何原生链接（native linking）操作，安装后直接可用。

> **补充说明 -- 原生链接（Native Linking）**：在裸 React Native 项目中，使用包含原生代码的第三方库时，通常需要执行链接操作（将原生模块注册到 iOS / Android 工程中）。Expo 的托管工作流（managed workflow）会自动处理这些，开发者无需手动操作。

## 核心内容

### 库的功能描述

`@react-native-community/slider` 提供一个 React Native 组件，封装了各平台原生的滑块 UI 控件：

- **iOS**：使用 UIKit 的 `UISlider`
- **Android**：使用 Android 原生的 SeekBar 控件
- **Web**：使用 HTML `<input type="range">` 作为回退实现

用户在界面上看到的是一个跟随各平台设计风格的滑块，开发者通过 React props 来控制其行为和外观。

### 现代替代方案

文档提到，`@expo/ui` 中提供了一个现代化的替代实现：

- **Android 端**基于 Jetpack Compose（Google 推出的声明式 UI 框架，类似于 React 的思想但用于原生 Android 开发）
- **iOS 端**基于 SwiftUI（Apple 推出的声明式 UI 框架，同样类似 React 思想但用于原生 iOS 开发）

`@expo/ui` 中的 Slider 可作为 `@react-native-community/slider` 的 **drop-in replacement**（直接替换，API 兼容，只需改 import 路径）。

> **如何选择？** 如果你的项目已经在使用 `@react-native-community/slider`，可以继续使用，它是稳定成熟的。如果你正在开始新项目或考虑升级到更现代的底层实现，可以关注 `@expo/ui` 中的 Slider 组件。

## 安装与配置

### 在 Expo 项目中安装

使用 `expo install` 命令来安装，该命令会自动选择与当前 Expo SDK 版本兼容的包版本：

```bash
# 使用 npm
npx expo install @react-native-community/slider

# 使用 yarn
yarn expo install @react-native-community/slider

# 使用 pnpm
pnpm expo install @react-native-community/slider

# 使用 bun
bun expo install @react-native-community/slider
```

**为什么用 `expo install` 而不是 `npm install`？**

`expo install` 本质上会调用你项目使用的包管理器（npm / yarn / pnpm / bun），但它额外做了一件关键的事：**根据当前 Expo SDK 版本自动锁定兼容的包版本**。如果直接用 `npm install`，可能会安装一个与当前 Expo SDK 不兼容的最新版本，导致运行时错误。

### 在裸 React Native 项目中安装

如果你的项目不是 Expo 托管工作流（即所谓的 bare workflow，手动管理原生代码的 React Native 项目），需要注意：

1. 首先确保项目中已安装 `expo` 包
2. 然后查阅 `@react-native-community/slider` 的 [GitHub 仓库](https://github.com/callstack/react-native-slider) 获取额外的原生配置步骤

> **什么是 bare workflow（裸工作流）？** Expo 项目有两种模式：managed（托管，Expo 管理原生代码）和 bare（裸，开发者自己管理原生代码）。如果你是从 `react-native init` 或 `npx @react-native-community/cli init` 创建的项目，就是 bare workflow。在这种模式下，安装含原生代码的库后，通常需要手动配置 iOS 的 Podfile 和 Android 的 Gradle 文件。

## 使用方式

虽然当前文档页面未给出详细的 API 参考和代码示例（完整 API 需要查阅 GitHub 仓库），以下是基于该库的标准用法概述：

### 基本用法

```jsx
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { View, Text } from 'react-native';

function VolumeControl() {
  const [value, setValue] = useState(50);

  return (
    <View>
      <Text>当前音量：{value}</Text>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#CCCCCC"
        thumbTintColor="#007AFF"
        value={value}
        onValueChange={setValue}
      />
    </View>
  );
}
```

### 常用 Props 说明

| Prop | 类型 | 说明 |
|------|------|------|
| `value` | `number` | 滑块的当前值（受控模式） |
| `minimumValue` | `number` | 可选范围的最小值，默认 `0` |
| `maximumValue` | `number` | 可选范围的最大值，默认 `1` |
| `step` | `number` | 步进值，即拖动时的最小变化单位 |
| `minimumTrackTintColor` | `string` | 锚点左侧轨道的颜色 |
| `maximumTrackTintColor` | `string` | 锚点右侧轨道的颜色 |
| `thumbTintColor` | `string` | 拖动锚点的颜色 |
| `onValueChange` | `(value: number) => void` | 值变化时的回调函数 |
| `onSlidingComplete` | `(value: number) => void` | 用户完成拖动（松手）时的回调 |
| `disabled` | `boolean` | 是否禁用滑块交互 |
| `style` | `ViewStyle` | 滑块容器的样式 |

> **注意**：以上 Props 信息基于该库的标准 API，完整和最新的属性列表请参阅 [GitHub 仓库文档](https://github.com/callstack/react-native-slider)。

### 与 React Web 的对比

| React Web (`<input type="range">`) | React Native (`Slider`) |
|---|---|
| `min` | `minimumValue` |
| `max` | `maximumValue` |
| `value` | `value` |
| `step` | `step` |
| `onChange` | `onValueChange` |
| `onChange` (blur/end) | `onSlidingComplete` |
| `disabled` | `disabled` |
| CSS 样式控制外观 | 通过 `*TintColor` 等 props 控制颜色，复杂样式需自定义 |

## 注意事项、限制条件和坑点

### 1. 默认最大值是 1 而不是 100

在 React Web 中，`<input type="range">` 的默认 `max` 是 `100`。但 `@react-native-community/slider` 的默认 `maximumValue` 是 `1`。如果不显式设置，滑块范围将是 `0 ~ 1`，这与 Web 开发者的直觉不同。

**开发影响**：务必显式设置 `minimumValue` 和 `maximumValue`，避免依赖默认值。

### 2. 样式控制方式不同

Web 上可以通过 CSS 深度自定义 `<input type="range">` 的外观（尽管跨浏览器兼容性不佳）。在 React Native 中，Slider 的外观主要通过 `*TintColor` 系列 props 来控制。如果需要高度自定义的外观（例如自定义锚点图片、双滑块等），可能需要使用其他第三方库或自行实现。

### 3. 在 Expo Go 中预装，但在 EAS Build 中需要安装

在 Expo Go 沙盒中，该库已预装，无需额外操作。但如果你使用 **EAS Build**（Expo 的云构建服务，用于生成独立的 APK / IPA 安装包），该库不会自动包含在构建产物中，你必须通过 `expo install` 命令将其添加到项目依赖中。

### 4. onValueChange 的触发频率

`onValueChange` 在用户拖动过程中会高频触发（每一帧都可能触发），这与 Web 的 `onChange` 行为类似。如果回调中有复杂计算或网络请求，应使用 `onSlidingComplete`（仅在用户松手时触发一次）来替代，或添加节流（throttle）处理，避免性能问题。

### 5. 平台差异

虽然该库在各平台上提供一致的功能，但原生控件的视觉风格会跟随平台设计语言：iOS 的滑块和 Android 的滑块在视觉上不完全相同。这是正常的，也符合移动端用户的预期。如果你需要跨平台完全一致的视觉外观，需要使用自定义渲染的滑块组件。

## React Web 开发者需要特别注意的地方

1. **没有 HTML 表单元素**：React Native 中没有 `<input>`、`<select>` 等 HTML 元素，所有 UI 都用 React Native 组件实现。Slider 就是 `<input type="range">` 在移动端的替代品。

2. **样式系统不同**：React Native 使用 `StyleSheet` 和 style 对象，不是 CSS。Slider 的 `style` prop 接受的是 `ViewStyle` 类型，不能使用 CSS 选择器或伪类。

3. **事件模型不同**：Web 的 `onChange` 在 React 中经过合成事件（SyntheticEvent）封装。React Native 的 Slider 直接将值作为参数传给回调函数，不需要从 `event.target.value` 中取值。

4. **数值精度**：由于原生浮点数精度的差异，Slider 返回的值可能出现类似 `0.30000000000000004` 的浮点误差。建议对回调值使用 `Math.round()` 或 `toFixed()` 做处理。

## 实际开发建议

1. **始终显式设置 `minimumValue`、`maximumValue` 和 `step`**，不要依赖默认值。

2. **区分 `onValueChange` 和 `onSlidingComplete` 的使用场景**：
   - 实时预览（如调整音量后立即播放对应音量的音频）用 `onValueChange`
   - 最终确认（如用户选定一个值后发起 API 请求）用 `onSlidingComplete`

3. **配合 `Text` 组件显示当前值**，提升用户体验。可以在滑块上方或旁边放置一个数值标签。

4. **如果需要高度自定义外观**，考虑：
   - 使用 `@expo/ui` 中的现代 Slider 实现
   - 或使用 `react-native-gesture-handler` 自行构建拖动交互

5. **在 Expo 项目中，务必使用 `expo install` 安装**，而不是直接用 `npm install`，以确保版本兼容性。

## 总结

`@react-native-community/slider` 是 React Native / Expo 生态中实现滑块交互的标准社区库。它封装了各平台的原生滑块控件，提供了跨平台一致的 API。对于从 React Web 转过来的开发者来说，核心区别在于：不使用 HTML 表单元素、默认值范围不同（0~1 而非 0~100）、样式控制方式不同、事件回调直接传值而非事件对象。

该库已预装在 Expo Go 中，通过 `expo install` 即可在项目中使用。对于追求更现代底层实现的项目，可以关注 `@expo/ui` 中的替代方案。完整的 API 参考和高级用法请参阅其 [GitHub 仓库](https://github.com/callstack/react-native-slider)。

---

## 文档导航

- **上一页**：[netinfo](./225__netinfo.md)
- **下一页**：[masked view](./227__masked-view.md)
