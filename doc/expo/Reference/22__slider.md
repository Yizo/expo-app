# Expo UI Slider：跨平台滑块组件学习指南

`Slider` 是 `@expo/ui` 提供的跨平台滑块组件，API 与 `@react-native-community/slider` 兼容。它适用于让用户在一个数值范围内通过拖动选择值，例如音量、亮度、播放进度或参数设置。

支持平台：

- Android
- iOS
- Web
- Expo Go

## 这篇文档解决什么问题

本文主要说明：

1. 如何安装和使用 `@expo/ui` 的 `Slider`。
2. 如何从 `@react-native-community/slider` 迁移。
3. 不同平台分别使用什么原生实现。
4. 当前兼容层支持哪些属性。
5. 哪些社区版功能尚未支持。
6. Android、iOS 和 Web 之间存在哪些表现差异。

它适合以下场景：

- 新项目需要一个跨 Android、iOS、Web 使用的滑块。
- Expo 项目希望使用 Expo 官方提供的 UI 组件。
- 已有项目正在使用 `@react-native-community/slider`，希望迁移到 `@expo/ui`。
- 希望保留接近社区版的 API，同时让各平台使用对应的原生控件。

## 阅读前需要理解的背景

### `@expo/ui` 是什么

`@expo/ui` 是 Expo 提供的 UI 组件包。本文中的 `Slider` 不是使用 React Native 基础组件模拟出来的统一界面，而是对各平台底层控件的封装。

具体实现如下：

| 平台 | 底层实现 |
|---|---|
| Android | Material 3 的 Jetpack Compose `Slider` |
| iOS | SwiftUI 的 `Slider` |
| Web | 原生 HTML `<input type="range">` |

对于 React Web 开发者，可以将它理解为：组件对外提供一套接近统一的 React API，内部则根据运行平台渲染不同的原生控件。

这会带来两个结果：

- 可以复用大部分组件调用代码。
- 不同平台的样式能力和行为不一定完全一致。

### Jetpack Compose 与 SwiftUI

- **Jetpack Compose**：Android 的声明式 UI 工具，可以类比 React 的声明式组件开发方式。
- **SwiftUI**：Apple 平台的声明式 UI 框架，同样通过组合组件和状态描述界面。
- **Material 3**：Google 的设计系统，Android 版滑块使用其视觉和交互规范。

本文使用的是兼容层。如果需要直接控制平台原生组件提供的底层能力，文档建议改用对应的 Jetpack Compose 或 SwiftUI primitive。

> **文档明确说明**：需要更底层的控制时，应直接使用平台对应的 `@expo/ui` primitive。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

`expo install` 与普通的 `npm install` 类似，但它会结合当前 Expo SDK 选择合适的依赖版本，因此 Expo 项目通常应优先使用它。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在工程中安装并配置 `expo`，才能使用 Expo Modules，包括 `@expo/ui`。

> **文档明确说明**：现有 React Native 项目必须先安装 `expo`。  
> 文档没有展开 iOS Pods、Android Gradle 或原生工程配置的具体步骤。

## 基础用法

```tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import Slider from '@expo/ui/community/slider';

export default function SliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <View>
      <Slider value={value} onValueChange={setValue} />
      <Text>Value: {value.toFixed(3)}</Text>
    </View>
  );
}
```

这里的流程是：

1. 使用 React state 保存当前值，初始值为 `0.5`。
2. 将该值传给 `Slider` 的 `value`。
3. 用户拖动时，`onValueChange` 会持续收到新的数值。
4. `setValue` 更新 state。
5. `Text` 显示保留三位小数的当前值。

默认范围为 `0` 到 `1`，因此初始值 `0.5` 位于中间。

组件必须从以下路径导入：

```tsx
import Slider from '@expo/ui/community/slider';
```

这里使用的是默认导入，不是：

```tsx
import { Slider } from '@expo/ui';
```

## 从社区版 Slider 迁移

原来的导入方式：

```tsx
import Slider from '@react-native-community/slider';
```

迁移后：

```tsx
import Slider from '@expo/ui/community/slider';
```

虽然组件被称为兼容或替代组件，但目前并不是对社区版全部能力的完整实现。

### 尚未支持的功能

以下 API 暂不支持：

- `onSlidingStart`
- `onSlidingComplete`
- `tapToSeek`
- `StepMarker`
- `renderStepNumber`
- `thumbImage`
- `minimumTrackImage`
- `maximumTrackImage`
- `trackImage`
- `accessibilityUnits`
- `accessibilityIncrements`
- `testID`
- `ref.updateValue`

迁移前需要检查项目是否使用了这些功能。仅修改导入路径并不能保证现有行为完全保持不变。

主要影响包括：

- 无法通过 `onSlidingStart` 和 `onSlidingComplete` 判断拖动开始或结束。
- 无法使用图片自定义滑块按钮和轨道。
- 无法使用社区版的步骤标记及步骤数字渲染能力。
- 无法通过 `ref.updateValue` 命令式更新组件。
- 缺少文档列出的部分无障碍和测试属性。

> **基于文档内容推导**：如果现有业务依赖“拖动结束后才提交数据”，当前只有持续触发的 `onValueChange`，不能直接等价替换 `onSlidingComplete`。

## Props 说明

### 数值范围

#### `minimumValue`

```tsx
minimumValue?: number
```

- 默认值：`0`
- 支持：Android、iOS、Web
- 作用：设置滑块的最小值。

#### `maximumValue`

```tsx
maximumValue?: number
```

- 默认值：`1`
- 支持：Android、iOS、Web
- 作用：设置滑块的最大值。

示例：

```tsx
<Slider minimumValue={0} maximumValue={100} />
```

这会将可选数值范围设为 `0` 到 `100`。

### 当前值与更新事件

#### `value`

```tsx
value?: number
```

- 默认值：`0`
- 支持：Android、iOS、Web
- 作用：设置滑块的初始值或当前值。

它的行为与社区版相同：

- 外部传入新的 `value` 时，滑块按钮会更新位置。
- 用户拖动时，组件会通过 `onValueChange` 发出数值。
- 拖动过程不要求外部 state 更新后才能继续移动。

这与 React Web 中典型的严格受控 `<input>` 存在差异。它接受外部值更新，但拖动交互本身并不依赖每次外部 state 回写。

#### `onValueChange`

```tsx
onValueChange?: (value: number) => void
```

- 支持：Android、iOS、Web
- 作用：用户拖动滑块时持续触发。

```tsx
<Slider onValueChange={(nextValue) => {
  console.log(nextValue);
}} />
```

“持续触发”意味着一次拖动可能执行多次回调。

> **基于经验建议**：不要直接在该回调中执行高成本网络请求、复杂计算或频繁持久化。如果确实需要，应考虑节流、防抖或将昂贵操作移到其他业务流程中。

### 步长

#### `step`

```tsx
step?: number
```

- 默认值：`0`
- 支持：Android、iOS、Web
- 有效范围：`0` 到 `maximumValue - minimumValue`
- `0` 表示连续变化，不进行步进吸附。

例如：

```tsx
<Slider
  minimumValue={0}
  maximumValue={10}
  step={1}
/>
```

用户只能选择以 `1` 为步长的值。

如果范围为 `0` 到 `10`，则 `step` 应位于 `0` 到 `10` 之间。文档没有说明传入超出范围的步长时各平台会如何处理。

### 附加上下限

#### `lowerLimit`

```tsx
lowerLimit?: number
```

限制用户能够拖动到的最低值。

#### `upperLimit`

```tsx
upperLimit?: number
```

限制用户能够拖动到的最高值。

两者均支持 Android、iOS 和 Web。

`minimumValue`、`maximumValue` 定义滑块的整体数值范围，而 `lowerLimit`、`upperLimit` 进一步限制用户当前能够选择的区间。

```tsx
<Slider
  minimumValue={0}
  maximumValue={100}
  lowerLimit={20}
  upperLimit={80}
/>
```

整体范围是 `0` 到 `100`，但用户不能拖到 `20` 以下或 `80` 以上。

> 当前文档没有说明限制值超出整体范围，或者 `lowerLimit > upperLimit` 时的处理方式。

### 交互状态与方向

#### `disabled`

```tsx
disabled?: boolean
```

- 默认值：`false`
- 支持：Android、iOS、Web
- 设置为 `true` 后，用户无法移动滑块。

```tsx
<Slider disabled value={0.5} />
```

#### `inverted`

```tsx
inverted?: boolean
```

- 默认值：`false`
- 支持：Android、iOS、Web
- 设置为 `true` 后，滑块方向反转：最大值位于左侧，最小值位于右侧。

需要注意，这不是页面的 RTL 布局配置，而是直接反转滑块的数值方向。

### 样式

#### `style`

```tsx
style?: StyleProp<ViewStyle>
```

- 支持：Android、iOS、Web
- 用于设置 Slider 的布局和样式。
- 使用 React Native 的 `ViewStyle`，不是普通 Web CSS 对象。

对于 React Web 开发者，以下写法不是这里的标准方式：

```tsx
<Slider style={{ width: '300px' }} />
```

React Native 通常使用数字表示逻辑像素：

```tsx
<Slider style={{ width: 300 }} />
```

当前文档只说明 `style` 用于样式和布局，没有列出 Slider 在各平台支持的全部具体样式属性。

### 轨道和滑块按钮颜色

“轨道”是滑块的横向条带，“thumb”是用户拖动的按钮。

#### `minimumTrackTintColor`

```tsx
minimumTrackTintColor?: ColorValue
```

- 支持：Android、iOS、Web
- 设置 thumb 左侧轨道的颜色。
- iOS 和 Android 均有视觉效果。

#### `maximumTrackTintColor`

```tsx
maximumTrackTintColor?: ColorValue
```

- API 表中标注支持 Android。
- 设置 thumb 右侧轨道的颜色。
- 在 iOS 上没有视觉效果。

#### `thumbTintColor`

```tsx
thumbTintColor?: ColorValue
```

- API 表中标注支持 Android。
- 设置滑块按钮颜色。
- 在 iOS 上没有视觉效果。

iOS 使用 SwiftUI `Slider`，它只开放最小值一侧，也就是已激活轨道的 tint 设置。因此，无法通过当前兼容组件改变 iOS 的最大值一侧轨道颜色和 thumb 颜色。

```tsx
<Slider
  minimumTrackTintColor="#2563eb"
  maximumTrackTintColor="#d1d5db"
  thumbTintColor="#1d4ed8"
/>
```

这段配置不能保证在所有平台呈现完全相同的效果。

## 平台差异与限制

### API 兼容不等于视觉一致

组件使用统一的导入方式和相近的 Props，但 Android、iOS、Web 分别由不同 UI 技术实现。

因此，“跨平台”主要表示：

- 可以在三个平台上使用。
- 核心数值和交互 API 尽量保持一致。

它不表示：

- 三个平台像素级一致。
- 每个颜色属性都在所有平台生效。
- 所有社区版 API 都已实现。

### iOS 的颜色限制

iOS 上：

- `minimumTrackTintColor` 有效。
- `maximumTrackTintColor` 没有视觉效果。
- `thumbTintColor` 没有视觉效果。

这是 SwiftUI 底层 `Slider` 暴露能力的限制，不是简单增加一个 React prop 就能解决的问题。

### Web 的实现方式

Web 端渲染原生：

```html
<input type="range">
```

这与 React Web 开发者熟悉的范围输入框属于同一种 HTML 控件。不过，在代码中仍使用 React Native 风格的 Props、事件和样式类型，而不是直接操作 DOM 元素。

### “Drop-in replacement”的边界

文档将其描述为兼容 `@react-native-community/slider` 的替代组件，同时明确列出了尚未支持的 API。因此这里的 “drop-in replacement” 应理解为核心 API 兼容，而不是无条件、零成本的完整替换。

迁移时至少要检查：

1. 是否使用了未支持的事件或属性。
2. 是否依赖 iOS 上自定义 thumb 或右侧轨道颜色。
3. 是否使用 `testID` 编写自动化测试。
4. 是否通过 ref 命令式更新滑块。
5. 是否要求各平台视觉效果完全一致。

## React Web 开发者容易误解的地方

### 不是同一个 DOM 控件运行在所有平台

只有 Web 使用 `<input type="range">`。Android 和 iOS 分别使用其原生 UI 框架中的控件，不存在浏览器 DOM。

因此不能使用：

- DOM 查询和操作。
- CSS 伪元素。
- 浏览器专属 range input 样式方案。
- Web 原生事件对象的属性。

### `onValueChange` 直接提供数值

React Web 中通常这样读取 input：

```tsx
onChange={(event) => {
  setValue(Number(event.target.value));
}}
```

这里的回调参数直接是 `number`：

```tsx
onValueChange={(value) => {
  setValue(value);
}}
```

不存在 `event.target.value`。

### `style` 不是 CSS

`style` 的类型是 React Native `ViewStyle`。虽然部分属性名称与 CSS 相似，但不能默认所有 CSS 能力、单位和选择器都适用。

### 原生组件会保留平台特征

由于底层控件不同，各平台的尺寸、颜色能力、视觉状态和交互反馈可能存在差异。若产品要求严格统一的外观，需要先验证兼容组件是否足够；文档建议在需要底层控制时直接使用对应平台 primitive。

## 实际开发中的使用方式

适合直接使用兼容版 Slider 的情况：

- 业务主要需要选择数值。
- 使用 `value`、`onValueChange`、范围和步长即可满足需求。
- 接受各平台遵循各自原生视觉规范。
- 希望用较少的平台分支同时支持 Android、iOS 和 Web。

需要谨慎评估的情况：

- 必须监听拖动开始或拖动结束。
- 必须使用图片自定义轨道或 thumb。
- 必须展示步骤标记或步骤数字。
- 必须通过 `testID` 使用现有测试方案。
- 必须让 iOS 的 thumb 和两侧轨道完全自定义颜色。
- 必须在各平台获得高度一致的视觉表现。

推荐的基础封装方式：

```tsx
import Slider from '@expo/ui/community/slider';

type VolumeSliderProps = {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function VolumeSlider({
  value,
  disabled = false,
  onChange,
}: VolumeSliderProps) {
  return (
    <Slider
      value={value}
      minimumValue={0}
      maximumValue={100}
      step={1}
      disabled={disabled}
      onValueChange={onChange}
      minimumTrackTintColor="#2563eb"
      style={{ width: 280 }}
    />
  );
}
```

该封装只使用文档明确标注为 Android、iOS、Web 均支持的核心能力，从而减少平台差异造成的问题。

## 文档未涉及的内容

当前文档没有说明：

- 无障碍功能的完整使用方法。
- 键盘操作和焦点行为。
- RTL 语言环境下的具体表现。
- 横向以外的垂直滑块。
- 表单校验或表单库集成方式。
- 服务端渲染行为。
- 各平台的精确尺寸和视觉规范。
- 越界 `value`、无效 `step` 或冲突限制值的处理方式。
- 性能数据及 `onValueChange` 的具体触发频率。
- 测试替代方案。
- 在裸 React Native 工程中安装 Expo Modules 的详细步骤。

## 总结

`@expo/ui/community/slider` 提供了一套接近 `@react-native-community/slider` 的跨平台 API，并在 Android、iOS 和 Web 上使用各自平台的原生滑块实现。

核心用法是：

```tsx
<Slider value={value} onValueChange={setValue} />
```

使用和迁移时需要重点记住：

- 安装包为 `@expo/ui`。
- 导入路径是 `@expo/ui/community/slider`。
- 默认数值范围为 `0` 到 `1`。
- `onValueChange` 会在拖动过程中持续触发。
- `step={0}` 表示连续变化。
- 社区版的部分事件、图片、标记、测试和 ref API 尚未支持。
- iOS 不支持通过该组件改变最大值一侧轨道和 thumb 的颜色。
- 统一 API 不代表跨平台视觉完全一致。
- 需要更底层的平台控制时，应直接使用 Jetpack Compose 或 SwiftUI primitive。

---

## 文档导航

- **上一页**：[segmentedcontrol](./21__segmentedcontrol.md)
- **下一页**：[jetpack compose](./23__jetpack-compose.md)
