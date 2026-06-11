# Host：在 React Native 中承载 SwiftUI 组件

> 文档更新时间：2026 年 5 月 26 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一个 Expo SDK 版本；当前稳定版本为 SDK 56

## 文档解决的问题

`Host` 是 `@expo/ui/swift-ui` 提供的承载组件，用来把 SwiftUI 组件放进 React Native 组件树。

从 React Web 开发者的角度，可以把它理解为一个“渲染边界”：

- React Native 负责外层页面和布局。
- SwiftUI 负责 `Host` 内部原生组件的渲染。
- `Host` 连接这两个布局系统，并处理尺寸、安全区域、主题和事件等问题。

它类似于 Web 中的 `<svg>`：SVG 元素通常需要放在 `<svg>` 根节点里；同样，`@expo/ui/swift-ui` 组件需要放在 `Host` 中。

文档还将它类比为 `react-native-skia` 的 `<Canvas>`。

在原生实现层面，`Host` 内部使用 Apple 的 `UIHostingController`，将 SwiftUI View 嵌入 UIKit。React Web 开发者不需要直接操作这个控制器，但需要理解：`Host` 内外属于两个不同的原生布局体系。

## 适用场景与平台限制

适合以下场景：

- 在 React Native 页面中使用 `@expo/ui/swift-ui` 组件。
- 让少量 SwiftUI 控件嵌入现有 React Native 界面。
- 根据 SwiftUI 内容自动计算 `Host` 尺寸。
- 为 SwiftUI 内容显式分配固定空间或剩余空间。
- 协调 React Native 和 SwiftUI 对键盘安全区域的处理。
- 创建延伸到状态栏或底部 Home Indicator 后面的全屏内容。
- 设置 SwiftUI 内容的颜色模式、布局方向或主题色。

平台限制：

- `Host` 只支持 iOS 和 tvOS。
- 文档标明该组件已包含在 Expo Go 中。
- 当前页面介绍的是 SwiftUI 专用 `Host`。
- 如果需要跨平台，应使用 `@expo/ui` 的 universal `Host`，由它根据平台渲染对应的原生组件。

> **文档明确说明：** 本文页面针对下一个 Expo SDK 版本。稳定项目应核对 SDK 56 对应的最新版本文档，避免直接使用尚未发布或行为可能变化的 API。

## 阅读前需要理解的概念

### SwiftUI、UIKit 与 React Native

- **SwiftUI**：Apple 的声明式 UI 框架，概念上类似 React，通过组件描述界面。
- **UIKit**：Apple 较传统的 iOS UI 框架，也是 React Native 在 iOS 上接入原生界面的重要基础。
- **`UIHostingController`**：Apple 提供的容器，用来把 SwiftUI 界面嵌入 UIKit。
- **React Native `View`**：作用近似 Web 中的 `<div>`，但它是原生视图，而不是 DOM 元素。

`Host` 自身是一个 React Native `View`，因此可以接受 React Native 的 `style`。但其子节点由 SwiftUI 布局，所以外层尺寸和内部内容尺寸需要通过 `Host` 协调。

### 固有尺寸

“固有尺寸”是组件根据自身内容能够自然确定的尺寸。

例如：

- `Text` 可以根据文字确定宽高。
- `Button` 可以根据标题和内边距确定宽高。
- `Toggle` 通常有自然尺寸。

而 `Slider`、线性 `ProgressView` 等组件倾向于占满可用宽度，并没有独立、确定的固有宽度。它们必须先获得外部宽度约束，才能完成合理布局。

这与 Web 中的区别是：不能简单假设所有组件都能像 `display: inline-block` 一样根据内容收缩。

### 安全区域

移动设备存在状态栏、底部 Home Indicator 和屏幕键盘等可能遮挡内容的区域。SwiftUI 默认会将这些区域纳入布局计算。

`ignoreSafeArea` 用来控制 SwiftUI 是否忽略某些安全区域。它不是 React Native CSS 样式，而是影响 SwiftUI 内部布局环境的配置。

## 安装

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

`expo install` 会按照当前 Expo SDK 选择兼容的软件包版本。它与直接执行 `npm install @expo/ui` 的主要区别在于版本兼容性管理。

如果项目是已有的裸 React Native 应用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。仅安装 `@expo/ui` 并不足以让 Expo 原生模块正常工作。

导入方式：

```tsx
import { Host } from '@expo/ui/swift-ui';
```

## 尺寸管理

尺寸管理是使用 `Host` 时最重要的部分。文档提供了三种相关机制：

- `matchContents`：让外层 `Host` 跟随 SwiftUI 内容尺寸。
- `style`：从 React Native 一侧明确设置 `Host` 尺寸。
- `useViewportSizeMeasurement`：没有显式尺寸时，用视口尺寸作为 SwiftUI 的布局提议尺寸。

### 使用 `matchContents` 跟随内容尺寸

```tsx
import { Button, Host } from '@expo/ui/swift-ui';

export default function MatchContentsExample() {
  return (
    <Host matchContents>
      <Button
        onPress={() => {
          console.log('Pressed');
        }}>
        Click
      </Button>
    </Host>
  );
}
```

这里的处理过程是：

1. SwiftUI 计算 `Button` 的内容尺寸。
2. `Host` 获得该布局结果。
3. `Host` 更新自己在 React Native 视图树中的尺寸。

它适合具有固有尺寸的组件，例如：

- `Button`
- `Toggle`
- `Text`

也可以用于通过 SwiftUI `frame` 修饰器获得明确尺寸的组件。

`matchContents` 支持按轴控制：

```tsx
<Host matchContents={{ horizontal: true, vertical: false }}>
  {/* SwiftUI 内容 */}
</Host>
```

类型为：

```ts
boolean | {
  horizontal: boolean;
  vertical: boolean;
}
```

默认值为 `false`。

> **重要限制：** `matchContents` 只能在组件挂载时设置一次。文档没有说明挂载后动态修改它能够生效，因此不应把它当作普通的响应式布局属性切换。

### 没有固有宽度的组件

下面这些组件会扩展以填充可用空间：

- `Slider`
- 线性 `ProgressView`

如果直接对它们使用 `matchContents`，可能得到接近零的宽度。这是因为：

1. `Host` 希望根据子组件计算宽度。
2. 子组件又需要外部先提供可用宽度。
3. 双方都无法提供初始的有限宽度。

解决方式有两种。

为 SwiftUI 组件设置明确的 `frame`：

```tsx
<Host matchContents>
  {/* 给内部组件设置明确宽度的 frame 修饰器 */}
</Host>
```

或者从 React Native 一侧设置 `Host`：

```tsx
<Host style={{ flex: 1 }}>
  {/* Slider 或线性 ProgressView */}
</Host>
```

```tsx
<Host style={{ width: 300 }}>
  {/* Slider 或线性 ProgressView */}
</Host>
```

### 不要在滚动轴上使用 `matchContents`

`matchContents` 在 SwiftUI 中会解析为 `.fixedSize`。如果它与滚动容器作用在同一轴上，滚动容器会直接扩展到完整内容尺寸。

这会导致：

- 容器不再形成有限的视口。
- 视口之外没有额外内容可供滚动。
- 滚动功能会无提示地失效。

受影响的滚动类组件包括：

- `ScrollView`
- `List`
- `Form`
- `LazyHStack`
- `LazyVStack`

横向滚动时，应只匹配垂直尺寸，并给横向滚动轴一个有限宽度：

```tsx
import { Host, HStack, ScrollView, Text } from '@expo/ui/swift-ui';

export default function ScrollViewMatchContents() {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <ScrollView axes="horizontal">
        <HStack spacing={12}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i}>Item {i}</Text>
          ))}
        </HStack>
      </ScrollView>
    </Host>
  );
}
```

这里：

- `vertical: true` 允许 `Host` 根据内容决定高度。
- `width: '100%'` 给横向滚动容器提供有限视口宽度。
- 横向内容可以超过视口，因此仍然能够滚动。

### 使用 `style` 显式控制尺寸

```tsx
import { Button, Host, Text, VStack } from '@expo/ui/swift-ui';

export default function ExplicitSizingExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Text>Hello, world!</Text>
        <Button
          onPress={() => {
            console.log('Pressed');
          }}>
          Click
        </Button>
      </VStack>
    </Host>
  );
}
```

`Host` 是 React Native `View`，因此 `style={{ flex: 1 }}` 表示占据父布局分配的剩余空间。

适合显式尺寸的场景：

- 内容需要铺满页面或父容器。
- 内部组件没有固有宽度。
- SwiftUI 使用 `Form` 等需要可用空间的视图。
- 页面包含滚动区域。
- 布局不能依赖内容反向决定容器大小。

> **基于文档内容推导：** 当内容本身希望“占满可用空间”时，应优先由 React Native 父布局为 `Host` 提供明确约束；当内容具有自然尺寸时，再考虑 `matchContents`。

### 使用视口尺寸参与测量

`useViewportSizeMeasurement` 的类型为 `boolean`，默认值是 `false`。

设置为 `true` 后，如果没有提供显式尺寸，`Host` 会把视口大小作为 SwiftUI 布局时的提议尺寸。

它尤其适合需要填充可用空间的 SwiftUI 视图，例如 `Form`。

需要注意：

- 它只在没有显式尺寸时发挥作用。
- 文档没有给出该属性的完整示例。
- 文档没有详细说明“视口”在嵌套布局中的边界和计算方式。

因此，在复杂嵌套布局中，不应根据本文进一步猜测它的精确测量行为。

## 安全区域处理

### 只忽略键盘安全区域

当 React Native 已经通过其他工具处理键盘避让时，可以设置：

```tsx
<Host ignoreSafeArea="keyboard">
  {/* SwiftUI 内容 */}
</Host>
```

文档示例使用 `react-native-keyboard-controller`：

```tsx
import { Host, TextField } from '@expo/ui/swift-ui';
import {
  KeyboardProvider,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { View } from 'react-native';

export default function IgnoreKeyboardExample() {
  return (
    <KeyboardProvider>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <KeyboardStickyView
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: 'green',
          }}>
          <Host
            matchContents
            ignoreSafeArea="keyboard"
            style={{ backgroundColor: 'red' }}>
            <TextField placeholder="Enter text" multiline />
          </Host>
        </KeyboardStickyView>
      </View>
    </KeyboardProvider>
  );
}
```

这里由 `KeyboardStickyView` 负责跟随键盘移动。`ignoreSafeArea="keyboard"` 阻止 SwiftUI `Host` 再次加入自己的键盘 inset，从而避免两套键盘避让逻辑叠加。

> **基于文档内容推导：** 处理键盘时，应明确由 React Native 层还是 SwiftUI 层负责避让，避免两边同时补偿。

### 忽略全部安全区域

```tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';

export default function IgnoreAllSafeAreasExample() {
  return (
    <Host
      ignoreSafeArea="all"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <VStack>
        <Text>
          This content extends behind the status bar and home indicator.
        </Text>
      </VStack>
    </Host>
  );
}
```

`ignoreSafeArea="all"` 允许 SwiftUI 内容延伸到：

- 状态栏后方。
- 底部 Home Indicator 后方。
- 其他安全区域 inset 覆盖的位置。

适合全屏背景或全屏覆盖层。

它只改变内容是否避开安全区域，并不会自动保证文字、按钮等交互元素不被系统 UI 遮挡。

> **基于经验建议：** 全屏背景可以延伸到安全区域之外，但关键文字和交互控件仍应自行保留安全间距。

`ignoreSafeArea` 只能在挂载时设置一次，可接受：

```ts
'all' | 'keyboard'
```

当前文档没有提供“恢复默认”对应的字符串值；需要默认行为时，不传该属性即可。

## API 参考

### `children`

```ts
React.ReactNode
```

放置需要由 `Host` 承载的 SwiftUI 子组件。

支持 iOS、tvOS。

### `style`

```ts
StyleProp<ViewStyle>
```

为外层 React Native `View` 设置样式，例如：

- `flex`
- `width`
- `height`
- `position`
- `backgroundColor`

它控制的是 `Host` 在 React Native 布局树中的表现，不等同于直接为 SwiftUI 子组件添加 SwiftUI 修饰器。

### `colorScheme`

```ts
'light' | 'dark'
```

设置 `Host` 内 SwiftUI 内容的颜色模式。

它可用于让承载区域采用浅色或深色外观。文档没有进一步列出各个 SwiftUI 子组件如何响应该值。

### `layoutDirection`

```ts
'leftToRight' | 'rightToLeft'
```

控制 SwiftUI 内容的布局方向。

未指定时，默认使用 React Native `I18nManager` 根据当前 locale 得到的方向：

- `leftToRight`：从左向右。
- `rightToLeft`：从右向左，常用于阿拉伯语、希伯来语等语言。

这不仅可能影响文字方向，也可能影响横向排列和部分控件的视觉顺序。

### `seedColor`

```ts
ColorValue
```

将一个 React Native 颜色值作为 SwiftUI 内容的 tint，并通过 SwiftUI environment 向子组件传播。

主要影响交互元素，例如：

- 按钮
- 开关
- 滑块
- 类似的系统控件

它更接近 Web 应用中的主题强调色，而不是简单设置整个容器的 `color` 或 `background-color`。

文档没有保证所有子组件都会以相同方式使用该颜色。

### `onLayoutContent`

```ts
(event: {
  nativeEvent: {
    height: number;
    width: number;
  };
}) => void
```

SwiftUI 内容完成布局时触发，回调提供当前内容的宽度和高度。

内容更新后尺寸可能发生变化，因此该回调可能不止触发一次。

它报告的是 SwiftUI **内容尺寸**。不要未经验证就将其视为外层 `Host` 的最终屏幕尺寸，因为 `style`、父布局约束或 `matchContents` 都可能影响外层视图。

### `pointerEvents`

```ts
'box-none' | 'none' | 'box-only' | 'auto'
```

控制 React Native 触摸事件如何命中 `Host` 及其子内容。

本文只列出了可选值，没有解释每个值的具体事件命中行为。需要使用时，应结合 React Native `View` 的 `pointerEvents` 文档理解。

### `matchContents`

```ts
boolean | {
  horizontal: boolean;
  vertical: boolean;
}
```

默认值为 `false`。

作用是让 React Native 视图树中的 `Host` 尺寸匹配 SwiftUI 内容布局。只能在挂载时设置一次。

### `ignoreSafeArea`

```ts
'all' | 'keyboard'
```

控制 SwiftUI hosting view 忽略哪些安全区域。只能在挂载时设置一次。

### `useViewportSizeMeasurement`

```ts
boolean
```

默认值为 `false`。

没有显式尺寸时，以视口尺寸作为 SwiftUI 布局的提议尺寸，适用于 `Form` 等需要填充可用空间的组件。

### 继承属性

`Host` 还继承 `CommonViewModifierProps`。

当前文档没有展开这些属性的定义、使用方式和限制，需要参考 SwiftUI modifiers 的独立文档，本文不对其具体行为作额外推测。

## React Web 开发者最容易误解的地方

### `Host` 不是普通的包装组件

它不是只负责 JSX 分组的组件，也不是 React Fragment。它创建了 SwiftUI 的原生承载环境，并连接 React Native 与 SwiftUI 两套布局系统。

### `style` 不会直接变成 SwiftUI 样式

```tsx
<Host style={{ width: 300 }}>
  {/* SwiftUI 内容 */}
</Host>
```

这里设置的是外层 React Native `View` 的宽度。SwiftUI 子组件如何使用这 300 点空间，仍取决于其自身布局规则。

### `matchContents` 不等于 Web 的 `width: fit-content`

它依赖 SwiftUI 内容能否给出确定尺寸。对于希望无限扩展的组件，尤其是 `Slider` 和线性 `ProgressView`，可能计算出接近零的宽度。

### `flex: 1` 需要父容器提供空间

虽然当前文档使用了 `style={{ flex: 1 }}`，但它仍遵守 React Native 的 Flexbox 布局规则。它表示占据父容器分配的剩余空间，不是浏览器中的视口高度快捷写法。

### 滚动需要有限视口

滚动容器必须拥有有限尺寸，内容才能超过视口并产生滚动。如果让容器在滚动轴上匹配全部内容，它就不再需要滚动。

### 挂载时固定的属性不能当作普通状态切换

`matchContents` 和 `ignoreSafeArea` 都只能在挂载时设置一次。

> **基于文档内容推导：** 如果业务确实需要改变这些配置，可能需要通过改变 React `key` 等方式重新挂载 `Host`。原文档没有提供或保证这种实现方案，因此应先在目标 Expo SDK 和设备上验证。

### iOS 专用能力不等于跨平台 React Native 组件

从 `@expo/ui/swift-ui` 导入的 `Host` 只支持 iOS 和 tvOS。如果同一业务页面还必须运行在 Android，应在架构上准备平台分支，或者改用文档提到的 universal `Host`。

## 实际开发中的使用决策

可以按照内容的布局特征选择方案：

| 内容特征 | 建议方式 |
| --- | --- |
| `Button`、`Text` 等具有自然尺寸 | 使用 `matchContents` |
| `Slider`、线性 `ProgressView` 等需要可用宽度 | 设置 `Host` 的 `width` 或 `flex`，或为组件设置 `frame` |
| 页面级、全屏内容 | 使用明确的 `style`，例如 `flex: 1` |
| `Form` 等需要填充可用区域的内容 | 考虑 `useViewportSizeMeasurement` 或显式尺寸 |
| 横向滚动内容 | 只匹配垂直尺寸，并设置有限宽度 |
| React Native 已处理键盘避让 | 使用 `ignoreSafeArea="keyboard"` |
| 全屏背景或覆盖层 | 使用 `ignoreSafeArea="all"` |
| 需要读取 SwiftUI 实际内容尺寸 | 使用 `onLayoutContent` |
| 需要 Android 等平台 | 使用 universal `Host` 或平台分支 |

推荐先回答两个问题：

1. `Host` 的尺寸应由父级 React Native 布局决定，还是由内部 SwiftUI 内容决定？
2. 安全区域和键盘避让由 React Native 处理，还是由 SwiftUI 处理？

这两个职责如果没有明确归属，最容易出现尺寸异常、滚动失效或键盘间距重复。

## 文档未涉及的内容

当前文档未说明：

- universal `Host` 的具体 API 和各平台差异。
- Android 对应组件的实现方式。
- Expo Go 与自定义 Development Build 在该组件上的差异。
- `UIHostingController` 的生命周期管理细节。
- SwiftUI 子组件与 React Native 组件混合嵌套的完整规则。
- `pointerEvents` 各取值的详细行为。
- `CommonViewModifierProps` 的具体属性。
- `useViewportSizeMeasurement` 在复杂嵌套布局中的精确测量边界。
- 性能开销、可承载组件数量和优化建议。
- 无障碍、测试和服务端渲染相关策略。
- 如何在运行期间安全地切换只能挂载时设置的属性。

这些问题不能仅根据本文作出确定结论，需要查阅相应专题文档或通过目标 SDK 验证。

## 总结

`Host` 是 React Native 与 SwiftUI 之间的承载边界。使用时最关键的不是 JSX 写法，而是正确处理两套布局系统之间的尺寸协商。

核心原则如下：

- 有自然尺寸的内容可以使用 `matchContents`。
- 需要填充空间的内容应获得明确尺寸。
- 不要在滚动容器的滚动轴上匹配全部内容。
- 键盘和安全区域应由一套布局机制负责，避免重复处理。
- `matchContents` 和 `ignoreSafeArea` 只能在挂载时设置一次。
- SwiftUI 专用 `Host` 仅支持 iOS 和 tvOS；跨平台场景应考虑 universal `Host`。

---

## 文档导航

- **上一页**：[group](./87__group.md)
- **下一页**：[hstack](./89__hstack.md)
