# Expo UI SwiftUI Modifiers 学习指南

> 原文标题：Modifiers  
> 包名：`@expo/ui`  
> 文档更新时间：2026 年 4 月 29 日  
> 页面适用平台：iOS、tvOS，并包含在 Expo Go 中

> **版本警告：**原文属于“下一个 Expo SDK 版本”的未发布版本文档，不是当前稳定版文档。实际项目应根据所用 Expo SDK 版本查阅对应文档。原文指出当前最新稳定版为 SDK 56。

## 文档解决的问题

这篇文档介绍如何在 React/TypeScript 代码中使用 Expo UI 提供的 **SwiftUI View Modifier**，从而定制 SwiftUI 组件的：

- 外观，例如颜色、圆角、阴影、字体和透明度。
- 布局，例如尺寸、内边距、对齐和安全区域。
- 行为，例如点击、长按、刷新和滚动。
- 系统能力，例如动态字体、辅助功能、键盘、Sheet 和 SF Symbols 动效。
- 原生 SwiftUI 环境，例如颜色模式、地区、时区和编辑模式。

它适合需要通过 `@expo/ui/swift-ui` 构建 iOS 或 tvOS 原生界面的 Expo/React Native 项目。

当前文档未介绍 Android 上的 Jetpack Compose modifiers，也没有讲解如何创建完整的 Expo 项目或 React Native 导航系统。

## 阅读前需要理解的背景

### Expo UI 和 SwiftUI

SwiftUI 是 Apple 用于声明式构建 iOS、tvOS 等平台界面的框架。Expo UI 将部分 SwiftUI 组件和能力暴露给 TypeScript，使开发者可以在 React 代码中配置原生 SwiftUI 界面。

例如：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

这里的 `Text` 是 Expo UI 对 SwiftUI 组件的封装，不应直接等同于：

- Web 中的 HTML `<span>`；
- React Native 核心库中的 `Text`；
- 浏览器中的 DOM 节点。

### Modifier 是什么

Modifier 是施加在 SwiftUI View 上的配置或变换。可以把它类比成 React Web 中以下机制的组合：

- CSS 样式；
- DOM 事件监听器；
- ARIA 属性；
-布局约束；
- 组件行为属性；
- React Context 中向下传递的环境配置。

但这个类比并不完全等价。Modifier 最终由原生 SwiftUI 执行，不是生成 CSS。

Expo UI 中的 modifier 函数会返回一个 `ModifierConfig` 对象，然后通过组件的 `modifiers` 数组传入：

```tsx
<Text
  modifiers={[
    background('#FF6B6B'),
    cornerRadius(12),
    padding({ all: 16 }),
  ]}>
  Hello
</Text>
```

其基本数据结构为：

```ts
interface ModifierConfig {
  $type: string;
  eventListener?: (args: any) => void;
}
```

## 安装

使用项目对应的包管理器执行：

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

这里使用 `expo install` 而不是普通的 `npm install`，是为了让 Expo 根据项目 SDK 选择兼容的依赖版本。

如果是已有的纯 React Native 原生项目，还必须先安装并配置 Expo Modules 所需的 `expo` 包。当前文档只指出了这个前置条件，没有展开原生工程的具体配置步骤。

## 基本使用方式

组件从 `@expo/ui/swift-ui` 导入，modifier 从单独的模块导入：

```tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  cornerRadius,
  foregroundStyle,
  onTapGesture,
  padding,
  shadow,
} from '@expo/ui/swift-ui/modifiers';
```

### `Host` 的作用

示例使用 `Host` 承载 SwiftUI 组件：

```tsx
<Host style={{ flex: 1 }}>
  <VStack>{/* SwiftUI 内容 */}</VStack>
</Host>
```

可以将它理解为 React Native 与 SwiftUI 内容之间的宿主边界。示例中的 `style={{ flex: 1 }}` 是 Host 在 React Native 一侧的样式，而内部 SwiftUI 组件主要通过 `modifiers` 配置。

### Modifier 可以组合

```tsx
<Text
  modifiers={[
    background('#4ECDC4'),
    cornerRadius(16),
    padding({ horizontal: 20, vertical: 12 }),
    shadow({ radius: 4, x: 0, y: 2, color: '#4ECDC440' }),
    onTapGesture(() => console.log('Tapped!')),
  ]}>
  Styled text
</Text>
```

同一数组可以同时包含视觉、布局和交互 modifier。

### 条件式 Modifier

`modifiers` 是普通 JavaScript 数组，因此可以使用展开运算符：

```tsx
<Text
  modifiers={[
    background('#9B59B6'),
    padding({ all: 14 }),
    ...(isEnabled
      ? [shadow({ radius: 6, y: 3 }), scaleEffect(1.02)]
      : [grayscale(0.5), opacity(0.7)]),
  ]}>
  Conditional styling
</Text>
```

这与 React Web 中根据状态拼接 `className` 或 style 对象相似，但数组元素是原生 modifier 配置。

> 示例中使用了 `useState`、`scaleEffect`、`grayscale` 和 `opacity`，实际代码需要补充相应导入。

## 形状与颜色

### `shapes`

`shapes` 提供可传给 `background`、`containerShape`、`contentShape` 等 modifier 的形状构造器：

- `roundedRectangle`
- `capsule`
- `rectangle`
- `ellipse`
- `circle`
- `containerRelativeShape`

```tsx
<Text
  modifiers={[
    background(
      '#000000',
      shapes.roundedRectangle({ cornerRadius: 12 }),
    ),
  ]}>
  Hello
</Text>
```

`Shape` 类型就是这些构造器返回值的联合类型。

### `Color`

颜色接受：

- 字符串颜色；
- React Native `ColorValue`；
- 命名颜色；
- `PlatformColor(...)` 等 React Native 原生颜色值。

部分 API 示例使用十六进制字符串。`foregroundStyle` 还支持：

- 普通颜色；
- 系统语义层级颜色；
- 线性渐变；
- 径向渐变；
- 角向渐变。

```tsx
foregroundStyle({
  type: 'hierarchical',
  style: 'secondary',
});
```

语义层级包括 `primary`、`secondary`、`tertiary`、`quaternary` 和 `quinary`，会根据系统外观和辅助功能设置自适应。

`foregroundColor` 已废弃，应优先使用 `foregroundStyle`。

## 动画

### `Animation`

内置动画预设分为：

- 时间曲线：`easeInOut`、`easeIn`、`easeOut`、`linear`；
- 弹簧：`spring`；
- 插值弹簧：`interpolatingSpring`。

动画对象可以继续调用：

```ts
animation.delay(seconds);
animation.repeat({
  repeatCount,
  autoreverses,
});
```

典型用法：

```tsx
<VStack
  modifiers={[
    animation(Animation.spring({ duration: 0.8 }), isExpanded),
  ]}>
  {/* ... */}
</VStack>
```

第二个参数 `animatedValue` 是 `number | boolean`。它发生变化时，SwiftUI 使用指定动画处理相关界面变化。

时间参数单位为秒，而不是 Web 动画中常见的毫秒。

### 内容变化动画

`contentTransition` 用于内容本身发生变化时的过渡：

```tsx
<Text
  modifiers={[
    contentTransition('numericText'),
    animation(Animation.default, count),
  ]}>
  {count.toString()}
</Text>
```

支持 `opacity`、`identity`、`numericText` 和 `interpolate`。其中 `numericText` 特别适合计数器。

### SF Symbol 动效

`symbolEffect` 为 SF Symbols 添加系统动效：

```tsx
const trigger = useNativeState(0);

<Image
  systemName="bell.fill"
  modifiers={[
    symbolEffect(
      { effect: 'bounce', direction: 'up' },
      { value: trigger },
    ),
  ]}
/>
```

要求 iOS/tvOS 17 及以上。可用效果包括出现、消失、弹跳、呼吸、脉冲、旋转、缩放、绘制、变色和摆动等。

## API 分类速查

以下分类用于建立知识结构；参数细节仍应以与项目 SDK 对应的 API 类型为准。

### 外观、绘制与变换

| Modifier | 作用 | 关键参数或限制 |
| --- | --- | --- |
| `background` | 设置背景，可指定形状 | 颜色、可选 `Shape` |
| `backgroundOverlay` | 在视图后方添加对齐的颜色层 | 颜色和对齐方式 |
| `overlay` | 在视图上方叠加颜色层 | 颜色和对齐方式 |
| `border` | 添加边框 | 颜色、宽度 |
| `cornerRadius` | 设置圆角 | 半径 |
| `clipShape` | 按指定形状裁剪 | 形状；圆角矩形可指定半径 |
| `clipped` | 将内容裁剪到边界 | 默认启用 |
| `mask` | 使用形状作为遮罩 | 形状及可选圆角 |
| `shadow` | 添加阴影 | 颜色、半径、`x/y` 偏移 |
| `opacity` | 设置透明度 | `0` 到 `1` |
| `blur` | 模糊视图 | 模糊半径 |
| `brightness` | 调整亮度 | `-1` 到 `1` |
| `contrast` | 调整对比度 | `1` 为正常 |
| `saturation` | 调整饱和度 | `1` 为正常 |
| `grayscale` | 灰度化 | `0` 到 `1` |
| `colorInvert` | 反转颜色 | 默认启用 |
| `hueRotation` | 旋转色相 | 角度单位为度 |
| `luminanceToAlpha` | 将亮度转换为透明度 | 无参数 |
| `rotationEffect` | 2D 旋转 | 角度单位为度 |
| `rotation3DEffect` | 3D 旋转 | 角度、三维轴、透视 |
| `scaleEffect` | 缩放 | 统一比例或独立 `x/y` |
| `offset` | 平移显示位置 | `x/y` |
| `zIndex` | 控制显示层级 | 数值越大层级越高 |
| `glassEffect` | 应用 Liquid Glass 效果 | 玻璃变体、交互、颜色、形状 |
| `glassEffectId` | 标识 Glass Effect | 需要 id 和 Namespace id |

### 布局与尺寸

| Modifier | 作用 | 开发影响 |
| --- | --- | --- |
| `padding` | 设置内边距 | 支持单边、水平、垂直和全部 |
| `frame` | 设置宽高、最小/最大/理想尺寸和对齐 | 更接近 SwiftUI 布局提议，不等同于 CSS box model |
| `fixedSize` | 让视图采用理想宽度或高度 | 可分别控制水平和垂直方向 |
| `aspectRatio` | 设置宽高比及 `fit/fill` | 比例为宽除以高 |
| `layoutPriority` | 设置布局竞争优先级 | 类似决定空间不足时谁更应保留尺寸 |
| `ignoreSafeArea` | 扩展到安全区域之外 | 可选择边缘及容器/键盘区域 |
| `containerRelativeFrame` | 根据最近容器确定尺寸 | iOS/tvOS 17+ |
| `containerShape` | 设置容器形状 | 接受 `shapes` 构造结果 |
| `contentShape` | 定义点击命中区域 | 空白区域可因此响应手势 |
| `onGeometryChange` | 监听位置和尺寸变化 | `x/y` 是相对窗口的全局坐标，单位为 point |

移动端的安全区域包括刘海、状态栏、Home Indicator 等系统保留区域。`ignoreSafeArea` 类似让 Web 内容突破安全边距，但它操作的是原生布局环境。

`contentShape` 对整行点击尤其重要：

```tsx
<HStack
  modifiers={[
    contentShape(shapes.rectangle()),
    onTapGesture(handlePress),
  ]}>
  <Text>Label</Text>
  <Spacer />
  <Text>Value</Text>
</HStack>
```

如果没有它，`Spacer` 等不可见区域可能不会响应点击。

### 文本与字体

| Modifier | 作用 | 注意事项 |
| --- | --- | --- |
| `font` | 设置字体、字号、字重、设计和文本样式 | `textStyle` 支持 Dynamic Type |
| `bold` / `italic` | 粗体/斜体 | 普通 View 使用时要求 iOS/tvOS 16+；`Text` 无此限制 |
| `foregroundStyle` | 设置前景颜色、语义样式或渐变 | 推荐替代 `foregroundColor` |
| `foregroundColor` | 设置前景颜色 | 已废弃 |
| `lineLimit` | 限制文本行数 | 支持无限、最大行数、预留空间和范围 |
| `lineSpacing` | 设置行间额外距离 | 不能为负数 |
| `lineHeight` | 设置总行高 | iOS/macOS/tvOS 26+ |
| `minimumScaleFactor` | 空间不足时缩小文字 | 参数为 `0` 到 `1` |
| `allowsTightening` | 允许压缩字间距以适应单行 | 布尔值 |
| `kerning` | 设置字符间距 | 数值单位为 point |
| `multilineTextAlignment` | 多行文本水平对齐 | `leading`、`center`、`trailing` |
| `truncationMode` | 设置截断位置 | 头部、中间或尾部 |
| `textCase` | 显示为大小写 | `lowercase` 或 `uppercase` |
| `textSelection` | 是否允许选择文本 | 布尔值 |
| `underline` / `strikethrough` | 下划线/删除线 | 可配置颜色、线型和启用状态 |
| `monospacedDigit` | 数字使用等宽字形 | 适合计时器和动态数字 |

使用 `font({ textStyle: ... })` 时，字体会跟随用户的 Dynamic Type 设置：

```tsx
<Text modifiers={[font({ textStyle: 'largeTitle', weight: 'bold' })]}>
  Hello
</Text>
```

仅指定固定 `size` 的系统字体不会自动随 Dynamic Type 缩放。

### Dynamic Type

Dynamic Type 是 Apple 的系统字体缩放机制，用户可以在系统设置中增大文字，辅助功能字号还会更大。

`dynamicTypeSize` 支持：

```tsx
dynamicTypeSize('large');
dynamicTypeSize({ max: 'accessibility3' });
dynamicTypeSize({ min: 'large' });
dynamicTypeSize({ min: 'large', max: 'accessibility3' });
```

应用在 `Host` 上时，约束会通过 SwiftUI environment 传递给所有后代：

```tsx
<Host modifiers={[dynamicTypeSize({ max: 'accessibility3' })]}>
  {/* ... */}
</Host>
```

必须保证 `min <= max`，否则会像原生 SwiftUI 一样触发运行时错误。原文引用 Apple 建议：优先限制到某个辅助功能字号，而不是完全关闭 Dynamic Type。

### 控件样式

| Modifier | 适用内容 | 主要选项 |
| --- | --- | --- |
| `buttonStyle` | Button | automatic、bordered、prominent、plain、glass 等 |
| `buttonBorderShape` | Button | 圆角矩形、胶囊、圆形、自动 |
| `controlSize` | 内部控件 | mini 到 extraLarge |
| `toggleStyle` | Toggle | automatic、switch、button |
| `pickerStyle` | Picker | inline、menu、segmented、wheel 等 |
| `datePickerStyle` | DatePicker | compact、graphical、wheel 等 |
| `textFieldStyle` | TextField | automatic、plain、roundedBorder |
| `progressViewStyle` | ProgressView | automatic、linear、circular |
| `gaugeStyle` | Gauge | 圆形、线性及 capacity 变体 |
| `labelStyle` | Label | 图标、标题或两者 |
| `labelsHidden` | 容器内控件 | 隐藏控件标签 |
| `tint` | 控件强调色 | 接受 `Color` |
| `imageScale` | SF Symbols | small、medium、large |

`buttonStyle` 中的 `glass` 和 `glassProminent` 仅适用于 iOS/tvOS 26+。

### 交互与生命周期

| Modifier | 作用 |
| --- | --- |
| `onTapGesture` | 处理点击 |
| `onLongPressGesture` | 处理长按，默认最短 0.5 秒 |
| `onAppear` | View 出现时调用 |
| `onDisappear` | View 消失时调用 |
| `onSubmit` | 输入控件提交时调用 |
| `refreshable` | 添加下拉刷新，处理函数返回 `Promise<void>` |
| `disabled` | 禁用 View 及其交互 |
| `hidden` | 隐藏或显示 View |
| `interactiveDismissDisabled` | 禁止通过手势关闭 Sheet |

`hidden` 与 `opacity(0)` 不应视为同一能力：原文只分别说明了隐藏和透明度，并未承诺它们具有相同的布局、命中测试或辅助功能行为。

### 辅助功能

| Modifier | 作用 |
| --- | --- |
| `accessibilityLabel` | 设置辅助技术读取的名称 |
| `accessibilityHint` | 补充操作结果或用途提示 |
| `accessibilityValue` | 描述当前值或状态 |
| `accessibilityHidden` | 让 VoiceOver 等跳过装饰性元素 |
| `accessibilityIdentifier` | 为 UI 自动化测试提供稳定标识 |
| `accessibilityInputLabels` | 为 Voice Control 提供可说出的替代名称 |

`accessibilityIdentifier` 不展示给用户，也不是可访问名称。它类似 Web 测试中的稳定 `data-testid`，但由 XCUITest 等原生 UI 测试工具读取。

对于已经由相邻文本描述的装饰图片，可以使用：

```tsx
accessibilityHidden(true);
```

不要把它用于承载关键信息或交互的元素。

### 键盘与文本输入

| Modifier | 作用 |
| --- | --- |
| `keyboardType` | 指定邮箱、数字、电话、URL 等键盘布局 |
| `submitLabel` | 指定键盘回车键显示为搜索、完成、下一步等 |
| `textContentType` | 声明输入字段语义，以支持系统自动填充 |
| `textInputAutocapitalization` | 控制自动大写 |
| `autocorrectionDisabled` | 禁用自动纠错 |
| `scrollDismissesKeyboard` | 控制滚动时如何收起键盘 |

`textContentType` 不只是键盘类型。它告诉系统字段代表用户名、密码、验证码、银行卡、地址等语义，系统可据此提供自动填充建议。

### List 与 Grid

List 相关 modifier 包括：

- `listStyle`
- `listRowBackground`
- `listRowInsets`
- `listRowSeparator`
- `listRowSpacing`
- `listSectionMargins`
- `listSectionSpacing`
- `headerProminence`
- `deleteDisabled`
- `moveDisabled`

其中：

- `deleteDisabled` 和 `moveDisabled` 应用于 `ForEach` 中的列表项。
- `listRowSpacing` 要求 iOS 15+。
- `listSectionSpacing` 要求 iOS 17+。
- `listSectionMargins` 要求 iOS 26+。

Grid 相关 modifier 包括：

- `gridCellAnchor`
- `gridCellColumns`
- `gridCellUnsizedAxes`
- `gridColumnAlignment`

它们分别控制单元格对齐锚点、跨列数量、不参与某轴尺寸扩张，以及整列的水平对齐。

### 滚动

滚动 API 通常需要组合使用，而不是只添加一个 modifier。

#### 位置绑定

```tsx
const activeID = useNativeState<string | null>(null);

<ScrollView
  modifiers={[
    scrollPosition(activeID, {
      anchor: 'center',
      onChange: (newID) => console.log(newID),
    }),
  ]}>
  <VStack modifiers={[scrollTargetLayout()]}>
    {items.map((item) => (
      <Text key={item.id} modifiers={[id(item.id)]}>
        {item.text}
      </Text>
    ))}
  </VStack>
</ScrollView>
```

这个流程包含三个必要角色：

1. `id(item.id)`：为每个滚动目标提供稳定标识。
2. `scrollTargetLayout()`：声明内部 Stack 是滚动目标布局。
3. `scrollPosition(state)`：在滚动容器上绑定当前位置。

读取 `state.value` 可以得到领先位置的目标 id；写入它可以滚动到对应目标。该功能要求 iOS/tvOS 17+，低版本中无效果。

#### 滚动相关 API

| Modifier/Hook | 作用 | 最低版本 |
| --- | --- | --- |
| `scrollDisabled` | 禁用滚动 | iOS/tvOS 16+ |
| `scrollIndicators` | 控制滚动指示器 | iOS/tvOS 16+ |
| `scrollContentBackground` | 控制滚动内容背景 | 页面未单列最低版本 |
| `scrollDismissesKeyboard` | 控制滚动收键盘 | iOS/tvOS 16+ |
| `scrollTargetBehavior` | 分页或按 View 对齐吸附 | iOS 17+ |
| `scrollTargetLayout` | 声明目标布局 | iOS 17+ |
| `scrollPosition` | 读取或写入目标位置 | iOS/tvOS 17+ |
| `defaultScrollAnchor` | 设置默认滚动锚点 | iOS/tvOS 17+ |
| `defaultScrollAnchorForRole` | 分角色设置锚点 | iOS/tvOS 18+ |
| `onScrollPhaseChange` | 监听拖动、减速和静止阶段 | iOS/tvOS 18+ |
| `useScrollGeometryChange` | 连续监听滚动几何信息 | iOS/tvOS 18+ |

`scrollIndicators('never')` 明确禁止显示；`hidden` 和 `visible` 只是偏好，系统仍可能覆盖。

### 连续滚动与 Worklet

`useScrollGeometryChange` 会在以下情况触发：

- 每次滚动更新；
- 容器尺寸变化；
- 内容尺寸变化。

它适用于页码进度、视差和分数偏移等持续更新的界面：

```tsx
const geometryModifier = useScrollGeometryChange((geometry) => {
  'worklet';
  progress.value =
    geometry.contentOffsetX / geometry.containerWidth;
});

<ScrollView modifiers={[geometryModifier]} />
```

因为这是 Hook，必须在组件顶层调用，再将返回值放入 `modifiers`。返回类型为 `ModifierConfig | null`。

带 `'worklet'` 指令的回调同步运行在 UI 线程，不需要往返 JS 线程；普通回调则作为异步 JS 事件交付。Hook 负责维持原生共享对象在多次渲染间的稳定引用。

iOS 18 以下该 modifier 是 no-op，即不会生效，也不代表会自动提供降级实现。

`onScrollPhaseChange` 只在滚动阶段改变时触发，更适合在滚动停止时读取最终位置，不适合替代逐帧几何监听。

## 原生共享状态 `ObservableState`

`ObservableState<T>` 是 JavaScript 和原生 UI 之间共享的可观察状态，由 `useNativeState` 创建。它不是普通 React state。

主要成员：

- `value`：读取或写入当前值；
- `get()`：React Compiler 兼容的读取方式；
- `set(value)`：React Compiler 兼容的写入方式；
- `onChange`：注册一个在原生 UI runtime 中执行的监听器。

线程行为非常重要：

- Worklet 中写入是同步的，可以立刻读到新值。
- JS 线程写入会异步调度到 UI 线程，不能假设下一行代码已经读到更新值。
- `onChange` 回调必须是 worklet。
- `onChange` 只允许一个监听器，新赋值会覆盖旧监听器。
- 初始值不会触发 `onChange`。
- 应在 `useEffect` 清理阶段将监听器设为 `null`。

```tsx
useEffect(() => {
  state.onChange = (value) => {
    'worklet';
    console.log('changed to', value);
  };

  return () => {
    state.onChange = null;
  };
}, []);
```

这与 React 的 `useState` 不同：React state 主要驱动 React 重新渲染，而 `ObservableState` 用于与原生 UI runtime 直接同步。

## Sheet 展示

Sheet 是从屏幕底部或当前界面上方呈现的原生模态界面。

| Modifier | 作用 |
| --- | --- |
| `presentationDetents` | 设置 Sheet 可停靠的高度 |
| `presentationDragIndicator` | 控制顶部拖动指示器 |
| `presentationBackground` | 设置整个 Sheet 的背景 |
| `presentationBackgroundInteraction` | 控制是否能与 Sheet 后方内容交互 |
| `interactiveDismissDisabled` | 禁止手势关闭 |

`PresentationDetent` 支持：

```ts
'medium';
'large';
{ fraction: 0.4 };
{ height: 300 };
```

`presentationBackground` 与普通 `background` 不同：它会覆盖整个 Sheet 外观，包括拖动指示器区域和 Home Indicator 安全区。该 API 要求 iOS 16.4+。

## Environment

`environment` 用于设置 SwiftUI 环境值，并影响后代 View：

```tsx
environment('colorScheme', 'dark');
```

支持：

- `colorScheme`：`light` 或 `dark`；
- `editMode`：`active`、`inactive` 或 `transient`；
- `locale`：地区标识字符串；
- `timeZone`：时区字符串。

这类似 React Context 的向下传递，但它修改的是 SwiftUI 原生环境，系统组件可能根据环境自动调整外观或行为。

## TabView、页面指示器和标签

`tabViewStyle` 支持：

- `automatic`：SwiftUI 默认标签栏；
- `page`：可横向滑动的分页视图；
- `sidebarAdaptable`：iOS 18+，在大屏幕采用侧边栏、iPhone 采用底栏。

分页样式可以通过 `indexDisplayMode` 控制圆点显示。

`indexViewStyle` 控制分页圆点后方的半透明背景，支持 `automatic`、`always`、`never` 和 `interactive`。

`tag` 为 View 设置字符串或数字标签，通常用于参与选择关系。原文未提供完整 TabView 选择状态示例。

## 特殊系统能力

### Live Activity、Widget 和系统容器

- `activityBackgroundTint`：设置 Live Activity 背景色。
- `containerBackground`：为 widget、navigation 或 navigation split view 设置容器背景。
- `widgetAccentedRenderingMode`：指定 Widget accented 模式下的图片渲染方式。
- `widgetURL`：设置点击 Widget 后由宿主 App 打开的 URL。

Widget 的 View 层级只支持一个 `widgetURL`。如果多个 View 都设置该 modifier，行为未定义。

### 图片缩放

`resizable(capInsets, resizingMode)` 控制 SwiftUI 图片如何适应空间：

- `stretch`：拉伸；
- `tile`：平铺；
- `capInsets`：指定不可缩放的边缘区域。

### 匹配几何动画

`matchedGeometryEffect(id, namespaceId)` 用相同 id 和 Namespace 关联不同 View 的几何变化。

`glassEffectId` 也需要 Namespace，并用于 `GlassEffectContainer` 内的 Liquid Glass 效果。

原文只给出接口说明，没有展示 Namespace 的完整创建和配对流程。

## 自定义 Modifier 与事件订阅

### `createModifier`

第三方库可以构造自定义 modifier：

```ts
export const blurEffect = (
  params: { radius: number; style?: string },
) => createModifier('blurEffect', params);
```

`type` 必须映射到已注册的原生 modifier。只在 TypeScript 端随意填写字符串不会自动产生原生功能。

Expo UI 组件还支持通过原生 SwiftUI 扩展创建自定义 modifier，具体实现不在当前文档范围内。

### 事件型 Modifier

底层提供：

```ts
createModifierWithEventListener(type, eventListener, params);
createViewModifierEventListener(modifiers);
```

前者创建带事件监听器的 modifier；后者从一组 `ModifierConfig` 中提取事件监听器并返回 `GlobalEvent`。

这些接口更偏向库作者和原生扩展作者。普通业务组件通常直接使用 `onTapGesture`、`onAppear` 等封装好的 API。

## 平台与版本限制

### 页面整体平台

页面声明支持：

- iOS；
- tvOS；
- Expo Go。

这不表示每个 modifier 都支持所有 iOS/tvOS 版本。部分能力有单独的最低系统版本。

### 典型版本门槛

- iOS 16+：内容过渡、部分文本行数能力、滚动键盘控制等。
- iOS 17+：滚动目标、滚动位置、SF Symbol effects 等。
- iOS 18+：滚动阶段、滚动几何监听、按角色设置滚动锚点等。
- iOS 26+：`lineHeight`、List section margins、Glass button style 等。

部分条目同时列出 macOS 支持，但页面元信息只声明 iOS、tvOS 和 Expo Go。当前文档没有说明 Expo UI 在 macOS 项目中的整体可用性，因此不应仅凭单个 SwiftUI API 的平台标注推断该包完整支持 macOS。

### No-op 不等于兼容实现

文档明确说明以下 API 在低于最低版本的 iOS 上为 no-op：

- `useScrollGeometryChange`
- `onScrollPhaseChange`
- `scrollPosition`

也就是说代码可能不报错，但功能不会发生。业务逻辑不能依赖它们在旧系统上执行。

## React Web 开发者最容易误解的地方

### Modifier 不是 CSS

`padding()`、`frame()`、`background()` 看起来像样式函数，但它们执行的是 SwiftUI 原生 modifier。不能套用以下 Web 假设：

- 不存在 CSS cascade；
- 不存在浏览器 DOM；
- 没有 class selector 或伪类；
- `frame` 不等同于 CSS `width/height`；
- `zIndex` 的作用范围由 SwiftUI 布局层级决定。

### `leading` 和 `trailing` 不是固定的左右

SwiftUI 使用 `leading`/`trailing` 表达阅读方向上的起始和结束边。对于从右向左的语言，它们可能对应右侧和左侧。Web 中类似逻辑属性 `inline-start` 和 `inline-end`。

### 单位是 point

尺寸、位置、圆角、偏移等原生布局数值通常以 point 为单位，不是 CSS 像素。文档对 `onGeometryChange` 明确说明所有值均为 point。

### 空白区域默认不一定可点击

一个包含 `Spacer` 的横向行，即使视觉上铺满宽度，也可能只有实际绘制内容可点击。需要通过 `contentShape(shapes.rectangle())` 定义完整命中区域。

### 系统版本是运行时约束

Web 开发通常关注浏览器兼容性；这里需要关注设备的 iOS/tvOS 版本。项目能够编译，不代表 modifier 在用户设备上有效。

### JS 线程和 UI 线程不同

普通 React 回调通常在 JS 环境执行；worklet 可以同步运行在原生 UI 线程。高频滚动状态如果每帧跨线程传回 JS，行为和性能特征都不同。

### 辅助功能标识不等于可访问文本

`accessibilityIdentifier` 用于自动化测试，`accessibilityLabel` 才是辅助技术向用户表达的名称。不要用测试 id 代替可访问名称。

## 注意事项与坑点

1. 文档对应下一个 SDK 版本，不能直接假设当前项目已经拥有所有列出的 API。
2. `foregroundColor` 已废弃，应使用 `foregroundStyle`。
3. Modifier 存在系统最低版本限制，部分低版本只会静默 no-op。
4. `dynamicTypeSize` 的 `min` 大于 `max` 会触发原生运行时错误。
5. `widgetURL` 在同一 Widget 层级中设置多个时行为未定义。
6. `ObservableState` 在 JS 线程上的写入是异步的，不应立即读取并假设更新完成。
7. `ObservableState.onChange` 只保存一个监听器，而且必须是 worklet。
8. `useScrollGeometryChange` 是 Hook，必须遵守 React Hooks 调用规则。
9. 时间动画和长按持续时间使用秒，而不是毫秒。
10. `contentShape` 决定命中区域，视觉区域大不代表整块区域都能响应手势。
11. 固定字号可能绕过 Dynamic Type，影响大字体用户。
12. 示例并非完整可直接粘贴的文件，部分 React Hook 和 modifier 导入被省略。
13. 文档某些参数表把对象字段写成全部必填的形式，但示例会省略字段。实际开发应以当前安装版本的 TypeScript 类型为准。
14. `listSectionMargins` 的说明文字写成了“忽略安全区域”，与 API 名称和 Apple 链接不一致，疑似文档描述错误；不能据此把它当作 `ignoreSafeArea` 使用。

## 实际开发中的使用方式

### 先按能力组合，而不是堆积样式

一个可点击列表行可以组合为：

```tsx
<HStack
  modifiers={[
    padding({ horizontal: 16, vertical: 12 }),
    contentShape(shapes.rectangle()),
    onTapGesture(openDetails),
    accessibilityLabel('打开详情'),
  ]}>
  {/* ... */}
</HStack>
```

这里分别处理布局、命中区域、交互和辅助功能，每个 modifier 的职责明确。

### 为新系统能力设计降级

**基于文档内容推导：**如果应用支持 iOS 17，而功能使用了 iOS 18 的滚动几何 Hook，就需要让核心功能在回调不触发时仍然可用。页码视差可以缺失，但导航、内容读取等核心流程不能依赖该回调。

### 优先采用系统语义样式

**基于经验建议：**普通文本优先考虑 `foregroundStyle` 的层级语义颜色，减少硬编码颜色在深色模式或高对比度环境中的可读性问题。

### 尊重动态字体

**基于经验建议：**优先使用 `font({ textStyle: ... })`。紧凑布局确实无法承受无限放大时，再通过 `dynamicTypeSize({ max: ... })` 设置合理上限，并测试辅助功能字号。

### 高频界面更新使用 UI 线程路径

**基于文档内容推导：**视差和逐帧滚动进度适合 worklet；只需要在滚动停止后执行请求或持久化时，使用 `onScrollPhaseChange` 更合适。

### 为自动化测试使用稳定标识

```tsx
accessibilityIdentifier('settings.notifications.toggle');
```

**基于经验建议：**标识应稳定、可读并与显示文本解耦，避免翻译或文案调整导致 XCUITest 失效。

## 文档明确说明与推导内容

### 文档明确说明

- Modifier 通过组件的 `modifiers` 数组应用。
- 多个 modifier 可以组合，也可以通过数组展开进行条件组合。
- 页面支持 iOS、tvOS，并包含在 Expo Go 中。
- 可通过 `createModifier` 和原生扩展机制创建自定义 modifier。
- `foregroundColor` 已废弃，应使用 `foregroundStyle`。
- `contentShape` 可以让包含空白区域的整个 View 响应点击。
- Worklet 滚动回调同步运行在 UI 线程，普通回调异步交付到 JS。
- 多个滚动 API 在低系统版本上为 no-op。
- Dynamic Type 的非法范围会触发原生错误。
- `ObservableState` 的 JS 写入异步，worklet 写入同步。
- Widget 层级中多个 `widgetURL` 的行为未定义。

### 基于文档内容推导

- 旧系统兼容策略需要由应用自行设计，no-op API 不提供自动替代行为。
- `id`、`scrollTargetLayout` 和 `scrollPosition` 是一套协作机制，缺失任一部分都无法形成完整的目标滚动绑定。
- `Host` 上的环境和 Dynamic Type modifier 适合用于统一控制整棵 SwiftUI 子树。
- 高频滚动视觉反馈应尽量留在 UI 线程，非高频业务处理可以使用普通 JS 事件。
- 自定义 modifier 需要对应的原生注册实现，单纯创建配置对象不足以增加 SwiftUI 能力。

## 总结

Expo UI 的 SwiftUI modifiers 是 React/TypeScript 到原生 SwiftUI 能力之间的声明式配置层。最基本的工作方式是：

1. 安装 `@expo/ui`。
2. 使用 `Host` 承载 SwiftUI 组件。
3. 从 `@expo/ui/swift-ui/modifiers` 导入所需函数。
4. 将返回的 `ModifierConfig` 放入组件的 `modifiers` 数组。
5. 根据目标设备检查每个 API 的最低系统版本。
6. 对滚动、动画和共享状态区分 JS 线程与 UI 线程。
7. 同时考虑 Dynamic Type、辅助功能、深色模式和旧系统降级。

对于 React Web 开发者，最重要的认知转换是：这些 API 虽然写在 TSX 中，但最终遵循 SwiftUI 的布局、环境、线程和系统版本规则，而不是浏览器的 DOM 与 CSS 规则。

---

## 文档导航

- **上一页**：[menu](./125__menu.md)
- **下一页**：[picker](./127__picker.md)
