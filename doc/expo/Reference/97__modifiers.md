# Expo UI SwiftUI Modifiers 学习指南

> 原文档更新时间：2026 年 4 月 29 日  
> 对应包：`@expo/ui`  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档；稳定版本请参考 SDK 56。  
> 支持平台：iOS、tvOS，可在 Expo Go 中使用。

## 文档解决的问题

本文档介绍如何在 React/TypeScript 中使用 Expo UI 提供的 **SwiftUI View Modifier**，修改原生 SwiftUI 组件的：

- 外观：背景、颜色、字体、圆角、阴影、透明度、渐变等。
- 布局：尺寸、内边距、宽高比、偏移、层级等。
- 行为：点击、长按、出现、消失、提交、下拉刷新等。
- 动画：普通动画、内容过渡、SF Symbol 动效等。
- 系统能力：无障碍、动态字体、安全区域、键盘、Sheet、滚动状态等。

它适合以下场景：

- 使用 `@expo/ui/swift-ui` 构建 iOS 或 tvOS 原生界面。
- 希望在 React 代码中使用 SwiftUI 的布局和视觉能力。
- 需要使用系统原生控件样式、Sheet、Dynamic Type、SF Symbols 或原生滚动行为。
- 开发第三方 Expo UI 扩展，为组件创建自定义 modifier。

它不是通用的 React Native 样式 API，也不是 Android UI 的完整跨平台抽象。

---

## React Web 开发者需要先理解的背景

### SwiftUI 是什么

SwiftUI 是 Apple 的声明式 UI 框架。它与 React 都使用“根据状态描述界面”的模式，但运行环境不同：

- React Web 最终生成 DOM。
- React Native 通常生成 UIKit、Android View 等原生视图。
- `@expo/ui/swift-ui` 将 React 组件映射到 SwiftUI 视图。

例如：

```tsx
<Text modifiers={[foregroundStyle('#FF0000')]}>
  Hello
</Text>
```

这里的 `Text` 不是 HTML `<span>`，`foregroundStyle` 也不是 CSS。它最终配置的是原生 SwiftUI `Text`。

### Modifier 是什么

SwiftUI Modifier 可以理解为附加在视图上的一组声明式配置。它有些类似：

- React Web 的 CSS 属性组合；
- 高阶组件提供的行为增强；
- 事件处理属性；
- Context 中向子组件传递的环境配置。

但是，一个 modifier 不一定只影响视觉效果。它也可能：

- 注册手势；
- 改变布局计算；
- 修改子树继承的环境值；
- 订阅原生滚动事件；
- 控制 Sheet 或 List 的原生行为。

因此，不能简单地把 `modifiers` 当成 React Native 的 `style`。

### `Host` 的作用

文档示例使用：

```tsx
<Host style={{ flex: 1 }}>
  <VStack>{/* SwiftUI views */}</VStack>
</Host>
```

`Host` 是 SwiftUI 视图树与 React Native 界面之间的承载边界。

其中：

- `Host` 的 `style` 是 React Native 样式。
- SwiftUI 组件的 `modifiers` 是 SwiftUI modifier 配置。
- 两者属于不同的布局和渲染体系。

### `ModifierConfig`

所有 modifier 函数最终都返回：

```ts
interface ModifierConfig {
  $type: string;
  eventListener?: (args: any) => void;
}
```

组件通过 `modifiers` 数组接收这些配置：

```tsx
<Text
  modifiers={[
    background('#FF6B6B'),
    cornerRadius(12),
    padding({ all: 16 }),
  ]}
/>
```

这与下面的 Web 写法在意图上相近，但实现机制不同：

```tsx
<span
  style={{
    background: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
  }}
/>
```

---

## 安装

根据包管理器执行：

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

`expo install` 会根据当前 Expo SDK 选择兼容的软件包版本。它不完全等同于直接执行 `npm install @expo/ui`。

如果项目是已有的裸 React Native 工程，还必须先安装并配置 Expo Modules 所需的 `expo` 包。

> 文档未提供 Android 支持说明，也未介绍原生 iOS 工程的手动配置步骤。

---

## 基本使用流程

### 1. 导入 SwiftUI 组件

```tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
```

### 2. 从独立入口导入 modifiers

```tsx
import {
  background,
  cornerRadius,
  foregroundStyle,
  padding,
  shadow,
  onTapGesture,
} from '@expo/ui/swift-ui/modifiers';
```

### 3. 将 modifier 放入数组

```tsx
<Text
  modifiers={[
    background('#4ECDC4'),
    cornerRadius(16),
    padding({ horizontal: 20, vertical: 12 }),
    shadow({
      radius: 4,
      x: 0,
      y: 2,
      color: '#4ECDC440',
    }),
    onTapGesture(() => console.log('Tapped!')),
  ]}>
  Styled text
</Text>
```

### 4. 根据状态动态组合

Modifier 是普通函数调用的返回值，因此可以使用 JavaScript 数组操作：

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

这与 React Web 中根据状态动态拼接 `className` 或样式对象相似。

---

## Modifier 的主要分类

## 外观、颜色与图形

| API | 作用 | 关键参数或限制 |
| --- | --- | --- |
| `background` | 设置视图背景 | 可传颜色和可选 `Shape` |
| `backgroundOverlay` | 在视图后方添加指定对齐方式的颜色层 | 支持 center、top、bottom、leading、trailing |
| `overlay` | 在视图上方叠加颜色层 | 当前 API 参数是颜色，不是任意 React 子组件 |
| `foregroundStyle` | 设置前景色、语义层级色或渐变 | 推荐替代 `foregroundColor` |
| `foregroundColor` | 设置前景颜色或 tint | 已废弃 |
| `tint` | 设置控件强调色 | 常用于按钮和交互控件 |
| `border` | 添加边框 | 颜色和宽度 |
| `cornerRadius` | 设置圆角 | 接收半径数字 |
| `clipShape` | 按形状裁剪视图 | 圆角矩形默认半径为 8 |
| `mask` | 使用指定形状作为蒙版 | 与单纯裁剪的语义不同 |
| `containerShape` | 设置容器形状 | 接收 `shapes` 创建的配置 |
| `contentShape` | 定义命中测试区域 | 对整行点击尤其重要 |
| `shadow` | 添加阴影 | 半径、偏移和颜色 |
| `opacity` | 设置透明度 | 范围为 0～1 |
| `blur` | 添加模糊 | 参数是模糊半径 |
| `brightness` | 调整亮度 | 范围为 -1～1 |
| `contrast` | 调整对比度 | 1 表示正常 |
| `saturation` | 调整饱和度 | 1 表示正常 |
| `grayscale` | 灰度化 | 范围为 0～1 |
| `colorInvert` | 颜色反转 | 默认启用 |
| `hueRotation` | 色相旋转 | 单位为度 |
| `luminanceToAlpha` | 将亮度转换为透明度 | 常用于蒙版处理 |
| `glassEffect` | 应用 Liquid Glass 效果 | 原文未标注最低系统版本 |
| `glassEffectId` | 为玻璃效果分配命名空间内的身份 | 需要 `Namespace` 和 `GlassEffectContainer` |
| `zIndex` | 设置视图显示层级 | 类似 CSS `z-index`，但作用于 SwiftUI 布局 |

### `shapes`

可使用以下形状构建器：

- `roundedRectangle`
- `capsule`
- `rectangle`
- `ellipse`
- `circle`
- `containerRelativeShape`

示例：

```tsx
<Text
  modifiers={[
    background(
      '#000000',
      shapes.roundedRectangle({ cornerRadius: 12 })
    ),
  ]}>
  Hello
</Text>
```

`Shape` 不是 CSS 字符串，而是形状构建器返回的原生配置。

### `foregroundStyle`

这是比 `foregroundColor` 更完整的前景样式 API，支持：

1. 普通颜色；
2. React Native `ColorValue`；
3. `PlatformColor` 系统颜色；
4. 自动适配系统外观的语义层级色；
5. 线性、径向和角向渐变。

```tsx
<Text
  modifiers={[
    foregroundStyle({
      type: 'hierarchical',
      style: 'secondary',
    }),
  ]}>
  Supporting text
</Text>
```

层级语义包括：

- `primary`
- `secondary`
- `tertiary`
- `quaternary`
- `quinary`

这些语义色会响应明暗模式和无障碍设置。`quinary` 需要 iOS 16+，旧系统回退为 `quaternary`。

---

## 布局和尺寸

| API | 作用 | 关键参数或限制 |
| --- | --- | --- |
| `padding` | 设置内边距 | 支持单边、水平、垂直和全部边 |
| `frame` | 设置固定、最小、理想和最大尺寸 | 还可设置对齐方式 |
| `fixedSize` | 在指定轴采用视图的理想尺寸 | 不是 CSS `position: fixed` |
| `aspectRatio` | 设置宽高比和填充模式 | `fit` 或 `fill` |
| `layoutPriority` | 设置布局竞争优先级 | 用于空间不足时的 SwiftUI 布局决策 |
| `offset` | 对最终显示位置进行平移 | `x`、`y` |
| `scaleEffect` | 缩放视图 | 支持统一缩放或分别设置 x/y |
| `rotationEffect` | 进行二维旋转 | 单位为度 |
| `rotation3DEffect` | 进行三维旋转 | 包含旋转轴和透视参数 |
| `containerRelativeFrame` | 按最近容器的尺寸分配空间 | iOS/tvOS 17+ |
| `ignoreSafeArea` | 允许内容延伸到安全区域外 | 可指定边和区域 |

### React Web 开发者容易误解的地方

- `fixedSize` 表示采用内容的理想尺寸，不是 CSS 的固定定位。
- `frame` 不等同于普通 CSS `width`/`height`；它参与 SwiftUI 的尺寸提议和布局协商。
- `leading`、`trailing` 对应逻辑方向，会随语言书写方向变化，不应简单理解为永远的 left、right。
- `offset` 通常只改变绘制位置，不应默认它会重新安排周围视图。
- `ignoreSafeArea` 类似让内容进入刘海、状态栏、Home Indicator 或键盘相关区域，使用后必须检查真机布局。

---

## 文本和字体

| API | 作用 | 重要说明 |
| --- | --- | --- |
| `font` | 设置字体设计、字体族、字号、文本样式和字重 | 使用 `textStyle` 可适配 Dynamic Type |
| `bold`、`italic` | 加粗、斜体 | 用于普通视图时需要 iOS/tvOS 16+ |
| `kerning` | 调整字符间距 | 作用于文字 |
| `allowsTightening` | 空间不足时允许压缩字符间距 | 用于单行文本适配 |
| `lineHeight` | 设置总行高 | 仅 iOS/macOS/tvOS 26+ |
| `lineSpacing` | 设置两行文字片段之间的额外距离 | 必须为非负值 |
| `lineLimit` | 限制行数或设置行数范围 | 部分形式需要 iOS/tvOS 16+ |
| `minimumScaleFactor` | 允许字体缩小到指定比例 | 参数范围 0～1 |
| `multilineTextAlignment` | 设置多行文字水平对齐 | leading、center、trailing |
| `truncationMode` | 设置文字从头部、中间或尾部截断 | 通常与行数和空间约束一起使用 |
| `textCase` | 转换大小写 | lowercase 或 uppercase |
| `textSelection` | 允许或禁止选择文字 | 接收布尔值 |
| `strikethrough`、`underline` | 设置删除线或下划线 | 可控制颜色、线型和启用状态 |
| `monospacedDigit` | 让数字采用等宽字形 | 适合价格、计时器和不断变化的数字 |

### `lineLimit` 的四种形式

```tsx
lineLimit(); // 不限制行数

lineLimit(5); // 最多 5 行

lineLimit(5, { reservesSpace: true }); // 始终保留 5 行高度

lineLimit({ min: 3, max: 8 }); // 3～8 行
```

保留空间和范围形式需要 iOS/tvOS 16+。

### Dynamic Type

Dynamic Type 是 Apple 的系统动态字体能力。用户可以在系统设置中放大文字，包括使用专门的无障碍字号。

```tsx
<Text
  modifiers={[
    font({
      textStyle: 'largeTitle',
      weight: 'bold',
    }),
  ]}>
  Hello
</Text>
```

如果只传固定 `size` 而不传 `textStyle`，字体不会随 Dynamic Type 缩放。

`dynamicTypeSize` 可以：

```tsx
dynamicTypeSize('large');
dynamicTypeSize({ max: 'accessibility3' });
dynamicTypeSize({ min: 'large' });
dynamicTypeSize({ min: 'large', max: 'accessibility3' });
```

应用到 `Host` 时，限制会通过 SwiftUI Environment 传递给后代视图。

注意：

- `min` 必须小于或等于 `max`，否则会在原生层触发错误。
- 文档引用 Apple 的建议：优先限制到某个无障碍字号，而不是彻底关闭 Dynamic Type。

---

## 交互与生命周期

| API | 作用 |
| --- | --- |
| `onTapGesture` | 处理点击 |
| `onLongPressGesture` | 处理长按，可设置最短持续时间，默认为 0.5 秒 |
| `onAppear` | 视图出现时调用 |
| `onDisappear` | 视图消失时调用 |
| `onSubmit` | 输入控件提交时调用 |
| `onGeometryChange` | 视图位置或尺寸变化时回调 |
| `disabled` | 禁用视图交互 |
| `hidden` | 隐藏视图 |
| `interactiveDismissDisabled` | 禁止用户通过手势关闭 Sheet |

`onGeometryChange` 返回的 `x`、`y` 使用全局坐标系，即相对于窗口；尺寸单位是 points，而不是浏览器 CSS 像素。

### 扩大可点击区域

在 SwiftUI 中，空白区域默认不一定参与点击命中。例如一个包含 `Spacer` 的横向列表项，可能只有文字区域可以点击。

```tsx
<HStack
  modifiers={[
    contentShape(shapes.rectangle()),
    onTapGesture(() => console.log('Row tapped')),
  ]}>
  <Text>Label</Text>
  <Spacer />
  <Text>Value</Text>
</HStack>
```

`contentShape` 让整块矩形区域参与命中测试。这相当于明确指定交互区域，而不是只依赖可见内容。

---

## 输入框和键盘

| API | 作用 |
| --- | --- |
| `autocorrectionDisabled` | 禁用自动纠错，默认参数为 `true` |
| `keyboardType` | 设置邮箱、数字、电话、URL 等键盘布局 |
| `submitLabel` | 设置软键盘回车键显示的语义，如 search、done、send |
| `textContentType` | 声明输入内容语义，帮助系统提供自动填充 |
| `textInputAutocapitalization` | 控制自动大写规则 |
| `textFieldStyle` | 设置输入框原生样式 |
| `scrollDismissesKeyboard` | 控制滚动时如何收起键盘 |

`textContentType` 不只是提示文字。它会影响系统自动填充建议，可表示用户名、密码、验证码、邮箱、地址、信用卡、生日等内容。

---

## 无障碍

| API | 作用 |
| --- | --- |
| `accessibilityLabel` | 设置辅助技术读出的主要名称 |
| `accessibilityHint` | 补充操作结果或用途 |
| `accessibilityValue` | 描述当前值或状态 |
| `accessibilityHidden` | 从 VoiceOver 等辅助技术的遍历中隐藏 |
| `accessibilityIdentifier` | 为 UI 自动化测试提供稳定标识 |
| `accessibilityInputLabels` | 为 Voice Control 提供可说出的替代短语 |

特别注意：

- `accessibilityIdentifier` 面向 XCUITest 等测试工具，不会展示或朗读给用户。
- `accessibilityHidden()` 默认等同于传入 `true`。
- 只应对装饰性图像或已经由附近文字完整描述的元素使用 `accessibilityHidden(true)`。

---

## 动画与内容过渡

### `Animation`

内置动画预设包括：

- `easeInOut`
- `easeIn`
- `easeOut`
- `linear`
- `spring`
- `interpolatingSpring`

动画对象可继续链式调用：

```ts
Animation
  .spring({ duration: 0.8 })
  .delay(0.2)
  .repeat({ repeatCount: 2, autoreverses: true });
```

将动画对象和触发值传给 `animation`：

```tsx
<VStack
  modifiers={[
    animation(
      Animation.spring({ duration: 0.8 }),
      isExpanded
    ),
  ]}
/>
```

`animatedValue` 支持 `number` 或 `boolean`。当该值变化时，关联的界面变化使用指定动画。

### 内容变化动画

```tsx
<Text
  modifiers={[
    contentTransition('numericText'),
    animation(Animation.default, count),
  ]}>
  {count.toString()}
</Text>
```

`contentTransition` 支持：

- `opacity`
- `identity`
- `numericText`
- `interpolate`

它需要与 `animation` 配合，才能在内容变化时产生动画。该 API 需要 iOS/tvOS 16+。

### SF Symbol 动效

`symbolEffect` 用于 Apple SF Symbols：

```tsx
const trigger = useNativeState(0);

<Image
  systemName="bell.fill"
  modifiers={[
    symbolEffect(
      { effect: 'bounce', direction: 'up' },
      { value: trigger }
    ),
  ]}
/>
```

需要 iOS/tvOS 17+。支持出现、消失、弹跳、呼吸、旋转、缩放、绘制、脉冲、变色和摆动等效果。

部分重复配置，如连续播放或指定次数和延迟，需要 iOS 18+。

---

## 滚动系统

滚动功能是本文档中依赖关系最多的一组 API。

### 基础滚动配置

| API | 作用 | 最低版本 |
| --- | --- | --- |
| `scrollDisabled` | 禁止或允许滚动 | iOS/tvOS 16+ |
| `scrollIndicators` | 控制滚动指示器 | iOS/tvOS 16+ |
| `scrollContentBackground` | 控制滚动内容的系统背景 | 未额外标注 |
| `scrollDismissesKeyboard` | 设置滚动时键盘收起方式 | iOS/tvOS 16+ |
| `defaultScrollAnchor` | 设置初始位置和尺寸变化时的默认锚点 | iOS/tvOS 17+ |
| `defaultScrollAnchorForRole` | 分别配置初始位置、尺寸变化和对齐锚点 | iOS/tvOS 18+ |
| `scrollTargetBehavior` | 设置分页或按视图吸附 | iOS 17+ |
| `scrollTargetLayout` | 将内部布局声明为滚动目标布局 | iOS 17+ |

`scrollIndicators` 的几个值并不完全等价：

- `automatic`：交给平台决定。
- `visible`：倾向显示，但系统仍可能隐藏。
- `hidden`：倾向隐藏，但系统仍可能显示。
- `never`：绝不显示。

### 可编程滚动位置

要通过 ID 读取或修改滚动位置，需要三个部分：

1. 每个目标使用 `id()`。
2. 内容容器使用 `scrollTargetLayout()`。
3. 滚动容器使用 `scrollPosition()`。

```tsx
const activeID = useNativeState<string | null>(null);

<ScrollView
  modifiers={[
    scrollPosition(activeID, {
      anchor: 'center',
      onChange: (newID) => {
        console.log('leading target:', newID);
      },
    }),
  ]}>
  <VStack modifiers={[scrollTargetLayout()]}>
    {items.map((item) => (
      <Text
        key={item.id}
        modifiers={[id(item.id)]}>
        {item.text}
      </Text>
    ))}
  </VStack>
</ScrollView>
```

读取 `activeID.value` 可以获取当前目标；写入它会滚动到匹配 ID 的视图。

该功能需要 iOS/tvOS 17+，旧版本会静默成为 no-op，即不会执行效果，也不一定抛出错误。

### 监听滚动阶段

```tsx
onScrollPhaseChange((phase, geometry) => {
  // dragging、decelerating、idle 等阶段
});
```

它只在滚动阶段改变时触发，适合读取滚动停止后的最终位置，不会像逐帧事件那样持续触发。需要 iOS/tvOS 18+。

### 连续监听滚动几何信息

`useScrollGeometryChange` 会在以下情况触发：

- 每次滚动更新；
- 容器尺寸变化；
- 内容尺寸变化。

```tsx
const geometryModifier = useScrollGeometryChange((geometry) => {
  'worklet';
  progress.value =
    geometry.contentOffsetX / geometry.containerWidth;
});

<ScrollView modifiers={[geometryModifier]} />
```

它适合：

- 页面指示器；
- 视差效果；
- 连续滚动进度；
- 分数形式的滚动偏移。

它是 Hook，因此必须在组件顶层调用，再把返回值放入 `modifiers` 数组。

需要 iOS/tvOS 18+，低版本为 no-op。

---

## Worklet、UI 线程与原生状态

### Worklet

带有 `'worklet'` 指令的回调会同步运行在 UI 线程：

```tsx
const modifier = useScrollGeometryChange((geometry) => {
  'worklet';
  progress.value = geometry.contentOffsetX;
});
```

没有 `'worklet'` 时，事件会以普通 JS 事件异步传回 JavaScript 线程。

对于逐帧滚动这种高频事件，UI 线程执行可以避免每一帧都跨越原生与 JS 边界。

### `ObservableState`

`ObservableState<T>` 是 JavaScript 与原生视图共享的状态，由 `useNativeState` 创建。

核心成员：

- `value`：读取或写入当前值。
- `get()`：符合 React Compiler 要求的读取方式。
- `set(value)`：符合 React Compiler 要求的写入方式。
- `onChange`：在原生 UI Runtime 中执行的单个监听器。

重要线程语义：

- Worklet 中写入是同步的，随后可以立即读取新值。
- JS 线程写入会异步调度到 UI 线程，不能假设写入后立即读到新值。
- `onChange` 必须是 worklet。
- `onChange` 只保存一个监听器，新赋值会覆盖旧监听器。
- 初始值不会触发 `onChange`。
- 应在 `useEffect` 中注册，并在清理阶段设置为 `null`。

---

## List、Grid 与控件样式

### List

相关 modifier 包括：

- `listStyle`
- `listRowBackground`
- `listRowInsets`
- `listRowSeparator`
- `listRowSpacing`
- `listSectionSpacing`
- `listSectionMargins`
- `deleteDisabled`
- `moveDisabled`
- `headerProminence`
- `badge`
- `badgeProminence`

版本限制：

- `listRowSpacing`：iOS 15+。
- `listSectionSpacing`：iOS 17+。
- `listSectionMargins`：iOS 26+。

原文将 `listSectionMargins` 的描述写成“允许视图忽略安全区域约束”，这与 API 名称及参数含义不一致。基于原文能够确认的是：它接收边和长度，用于设置 List Section 的边距；不应根据该句描述把它当作 `ignoreSafeArea` 使用。

### Grid

相关 modifier 包括：

- `gridCellAnchor`
- `gridCellColumns`
- `gridCellUnsizedAxes`
- `gridColumnAlignment`

`gridCellUnsizedAxes` 可防止 `Spacer`、`Divider` 或 `Color` 等弹性视图反过来决定整个行列的大小。

### 原生控件样式

文档提供以下样式 modifier：

- `buttonStyle`、`buttonBorderShape`
- `controlSize`
- `datePickerStyle`
- `pickerStyle`
- `progressViewStyle`
- `gaugeStyle`
- `toggleStyle`
- `labelStyle`、`labelsHidden`
- `textFieldStyle`
- `tabViewStyle`、`indexViewStyle`

其中：

- `buttonStyle` 的 `glass`、`glassProminent` 仅支持 iOS/tvOS 26+。
- `tabViewStyle({ type: 'sidebarAdaptable' })` 需要 iOS 18+。
- `sidebarAdaptable` 在 iPad/Mac 上表现为侧边栏，在 iPhone 上表现为底部栏。
- `indexViewStyle` 只配置 page 风格的页面指示器，没有额外的样式选择器。

---

## Sheet 展示配置

| API | 作用 | 最低版本 |
| --- | --- | --- |
| `presentationBackground` | 设置整个 Sheet 的背景，包括拖动区和 Home Indicator 安全区 | iOS 16.4+ |
| `presentationBackgroundInteraction` | 控制是否允许操作 Sheet 后方内容 | iOS/tvOS 16.4+ |
| `presentationDetents` | 设置 Sheet 可停留的高度 | iOS/tvOS 16+ |
| `presentationDragIndicator` | 控制顶部拖动指示器 | iOS/tvOS 16+ |
| `interactiveDismissDisabled` | 禁止通过交互手势关闭 Sheet | 未额外标注 |

`PresentationDetent` 支持：

```ts
'medium'
'large'
{ fraction: 0.4 }
{ height: 320 }
```

`presentationBackground` 与普通 `background` 不同：前者可以覆盖 Sheet 自身的系统区域，后者无法触及这些区域。

---

## Environment

`environment` 用于覆盖 SwiftUI Environment 中向后代传递的系统值：

```tsx
environment('colorScheme', 'dark');
```

也可使用对象形式：

```tsx
environment({
  key: 'editMode',
  value: 'active',
});
```

支持的环境值包括：

- `colorScheme`：`light` 或 `dark`
- `editMode`：`active`、`inactive` 或 `transient`
- `locale`
- `timeZone`

它更接近 React Context，而不是单个 DOM 节点的 CSS 属性。应用在父视图上时，后代视图可能继承该配置。

---

## 自定义 Modifier 与事件扩展

### `createModifier`

```ts
import { createModifier } from '@expo/ui/swift-ui/modifiers';

export const blurEffect = (
  params: { radius: number; style?: string }
) => createModifier('blurEffect', params);
```

`type` 必须能够映射到已经注册的原生 modifier。仅在 JavaScript 中创造一个任意字符串，不会自动产生对应的 SwiftUI 实现。

该能力主要面向：

- 第三方组件库；
- 自定义原生 Expo Module；
- Expo UI 的 SwiftUI 扩展。

### 事件型 Modifier

文档还提供：

```ts
createModifierWithEventListener(type, eventListener, params);
createViewModifierEventListener(modifiers);
```

前者创建带事件监听器的 modifier；后者从 modifier 数组中提取监听器并返回 `GlobalEvent`。

原文没有提供完整的原生注册和事件协议示例。如需实际扩展，应继续阅读文档引用的 “Extending with SwiftUI” 指南。

---

## 其他专用能力

文档还覆盖以下专用 modifier：

- `containerBackground`：设置 widget、navigation 或 navigationSplitView 的容器背景。
- `imageScale`：调整 SF Symbol 相对文字的尺寸。
- `resizable`：设置图片拉伸或平铺，并可保护 cap insets。
- `matchedGeometryEffect`：让共享 ID 的视图参与匹配几何动画，需要 `Namespace`。
- `menuActionDismissBehavior`：控制菜单操作后是否关闭菜单。
- `refreshable`：为兼容视图增加下拉刷新，回调必须返回 `Promise<void>`。
- `tag`：给视图设置选择或容器语义所需的标签。
- `widgetAccentedRenderingMode`：控制 Widget accented 模式下的图片渲染方式。
- `widgetURL`：设置点击 Widget 时打开的 URL。

`widgetURL` 在一个 Widget 视图层级中只能有一个。多个视图同时设置时，行为未定义。

---

## 平台与版本限制

### 平台限制

文档整体面向：

- iOS
- tvOS
- Expo Go

虽然少数 API 表格中出现 macOS 版本，但页面元数据没有将 macOS 列为此模块的支持平台。因此不能仅凭个别 SwiftUI API 的原生可用性，推断该 Expo UI 页面正式支持 macOS。

当前文档未涉及 Android 端对应 modifier 的完整用法。

### 低版本 no-op

以下 API 明确说明在低于最低系统版本时成为 no-op：

- `useScrollGeometryChange`：低于 iOS 18。
- `onScrollPhaseChange`：低于 iOS 18。
- `scrollPosition`：低于 iOS 17。

no-op 表示代码可能继续运行，但功能不生效。不能只依赖“没有报错”判断功能已经支持。

其他标注最低版本的 API，原文没有统一说明低版本是 no-op、回退还是报错，因此不应自行假设。

### 下一版本文档

本页是未发布的下一 SDK 版本文档，而不是当前稳定 SDK 56 的 API 保证。实际项目使用前应核对：

- 项目的 Expo SDK 版本；
- 安装到项目中的 `@expo/ui` 类型定义；
- 目标设备的 iOS/tvOS 版本；
- 对应稳定版文档是否已经包含该 API。

---

## 常见误区与坑点

### 1. 把 `modifiers` 当作 React Native `style`

错误原因：modifier 不仅设置样式，还可能改变环境、命中测试、滚动状态、生命周期和原生容器行为。

开发时应区分：

- React Native 宿主布局使用 `style`。
- SwiftUI 组件内部能力使用 `modifiers`。

### 2. 忽略 modifier 的作用对象

部分 modifier 只在特定上下文中有效：

- List Row modifier 应用于列表行。
- Sheet presentation modifier 应用于 Sheet 内容。
- `scrollTargetLayout` 应用于 ScrollView 内部的布局容器。
- `contentShape` 影响命中测试。
- `symbolEffect` 面向 SF Symbol。
- `deleteDisabled`、`moveDisabled` 面向 `ForEach` 中的列表项。

### 3. 忽略系统版本

`lineHeight`、Liquid Glass 按钮样式、滚动位置绑定等能力有较高系统版本要求。项目的 JavaScript 能成功打包，不代表目标设备支持对应原生能力。

### 4. 使用已废弃的 `foregroundColor`

文档明确将 `foregroundColor` 标记为废弃，并建议使用 `foregroundStyle`。新代码应优先使用后者。

### 5. 限制动态字体导致无障碍问题

固定字号或过度限制 Dynamic Type 可能让大字号用户无法阅读。只有在布局确实无法承受时才设置上限，并优先允许至少一个无障碍字号。

### 6. 高频事件全部传回 JS

逐帧滚动事件如果通过普通 JS 回调处理，会产生线程往返。需要连续动画或进度时，应根据文档使用 worklet；只需要滚动结束状态时，优先考虑 `onScrollPhaseChange`。

### 7. 误解共享状态的同步性

从 JS 线程写入 `ObservableState.value` 是异步调度的。以下逻辑不应假设第二行立即获得新值：

```ts
state.value = nextValue;
console.log(state.value);
```

需要同步读写时，应在 UI worklet 中完成。

### 8. 空白区域无法点击

SwiftUI 默认按照实际内容进行命中测试。带 `Spacer` 的整行交互区域应配合 `contentShape(shapes.rectangle())`。

---

## 实际开发中的使用方式

### 建议按能力分层组合

基础卡片可以组合布局与外观：

```tsx
const cardModifiers = [
  padding({ horizontal: 16, vertical: 12 }),
  background(
    '#FFFFFF',
    shapes.roundedRectangle({ cornerRadius: 12 })
  ),
  shadow({
    color: '#00000020',
    radius: 6,
    x: 0,
    y: 2,
  }),
];
```

交互能力再由使用方添加：

```tsx
<HStack
  modifiers={[
    ...cardModifiers,
    contentShape(shapes.rectangle()),
    onTapGesture(handlePress),
  ]}>
  {/* 内容 */}
</HStack>
```

### 优先使用语义化系统能力

建议优先考虑：

- 使用 `foregroundStyle` 的层级样式，而不是硬编码所有文字色。
- 使用 `textStyle` 适配 Dynamic Type。
- 使用 `textContentType` 改善自动填充。
- 使用无障碍 modifier 提供明确语义。
- 使用原生 Picker、Sheet 和 List 风格，而不是完全模拟 Web UI。

### 将版本要求纳入组件设计

基于文档内容推导：对于仅在新系统可用的功能，组件应同时设计基础表现与增强表现。例如 iOS 17+ 启用滚动吸附，旧系统仍保留普通滚动。

原文没有提供系统版本检测 API，因此本文档不推断具体检测代码。

### 先在真机验证系统行为

基于经验建议：以下功能尤其需要在不同系统版本和真机上测试：

- Safe Area 与键盘区域；
- Dynamic Type 和 VoiceOver；
- Sheet detents；
- 滚动吸附和滚动位置；
- `PlatformColor` 与明暗模式；
- Liquid Glass 和 SF Symbol 动效。

浏览器中的 React Web 经验不足以准确预测这些系统原生行为。

---

## 原文明确说明与合理推导

### 原文明确说明

- Modifier 通过组件的 `modifiers` 数组应用。
- 多个 modifier 可以组合，也可以使用展开运算符条件组合。
- `@expo/ui` 支持通过 `expo install` 安装。
- 现有 React Native 工程需要安装 Expo Modules。
- `foregroundColor` 已废弃，推荐使用 `foregroundStyle`。
- Worklet 回调同步运行于 UI 线程，普通回调异步传回 JS。
- `useScrollGeometryChange` 必须作为 Hook 在组件顶层调用。
- `ObservableState` 的 JS 写入与 worklet 写入具有不同同步语义。
- 多项滚动、Sheet、字体和动效 API 有明确最低系统版本。
- `widgetURL` 在同一 Widget 层级中设置多个时行为未定义。

### 基于文档内容推导

- `modifiers` 应被理解为原生视图配置管道，而不是普通样式对象。
- 目标系统版本应成为组件设计和测试矩阵的一部分。
- 高频连续动画更适合 worklet；低频业务事件可使用普通 JS 回调。
- 自定义 modifier 需要对应的原生注册实现，不能只编写 TypeScript 工厂函数。
- 面向无障碍和系统主题时，语义样式通常比固定颜色与固定字号更稳妥。

### 当前文档未涉及

- Android Jetpack Compose modifier 的完整对照用法。
- Expo Router 或 React Navigation 的集成流程。
- 原生 Swift 侧注册自定义 modifier 的完整代码。
- EAS Build、证书、签名和 App Store 发布。
- 系统版本检测的具体 API。
- modifier 顺序对每一种组合的精确影响规则。
- 性能基准、事件频率和线程开销数据。
- 测试这些 modifier 的完整自动化方案。

---

## 总结

`@expo/ui/swift-ui/modifiers` 让 React 开发者通过 TypeScript 配置 SwiftUI 视图。其核心模式是：

```tsx
<Component modifiers={[modifierA(), modifierB()]} />
```

掌握这套 API 时，最重要的不是记住所有函数，而是理解以下边界：

1. `style` 属于 React Native 宿主布局，`modifiers` 属于 SwiftUI 视图。
2. Modifier 可以影响样式、布局、环境、交互和系统行为。
3. 很多能力依赖具体容器和最低 iOS/tvOS 版本。
4. Dynamic Type、无障碍、Safe Area 和系统语义色属于移动端原生开发的重要组成部分。
5. 高频原生事件、worklet 和 `ObservableState` 涉及 UI 线程与 JS 线程的同步差异。
6. 下一版本文档中的 API 不应被直接视为当前稳定 SDK 56 已提供的能力。

---

## 文档导航

- **上一页**：[menu](./96__menu.md)
- **下一页**：[namespace](./98__namespace.md)
