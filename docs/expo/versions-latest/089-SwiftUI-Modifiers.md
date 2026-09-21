# 089｜SwiftUI Modifiers

**翻页：**[上一页：SwiftUI Menu](./088-SwiftUI-Menu.md) · [目录](./README.md) · [下一页：SwiftUI Namespace](./090-SwiftUI-Namespace.md)

**官方页面：**[SwiftUI Modifiers · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/modifiers/)推荐 `~56.0.26`。modifier 的可用系统版本依具体方法而异；有些 API 要求 iOS / tvOS 16、17、18 或 26。Latest 会继续增加与弃用方法，使用前请按目标 SDK 和系统版本核对官方页面。

## 给原生控件附加样式和行为

SwiftUI **view modifier** 是描述视图外观或行为的小配置。例如背景色、内边距、圆角、动画、无障碍标签或点击手势。Expo UI 把一组 modifier 放在组件的 `modifiers` 数组中：

~~~tsx
import { useState } from 'react';
import { Text, Host, VStack } from '@expo/ui/swift-ui';
import {
  background,
  cornerRadius,
  padding,
  shadow,
  foregroundColor,
  onTapGesture,
  scaleEffect,
  grayscale,
  opacity,
} from '@expo/ui/swift-ui/modifiers';

function ModifiersExample() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={20}>
        {/* 基础样式 */}
        <Text
          modifiers={[
            background('#FF6B6B'),
            cornerRadius(12),
            padding({ all: 16 }),
            foregroundColor('#FFFFFF'),
          ]}>
          Basic styled text
        </Text>

        {/* 组合阴影和交互 */}
        <Text
          modifiers={[
            background('#4ECDC4'),
            cornerRadius(16),
            padding({ horizontal: 20, vertical: 12 }),
            shadow({ radius: 4, x: 0, y: 2, color: '#4ECDC440' }),
            onTapGesture(() => console.log('Tapped!')),
          ]}>
          Styled with shadow and tap gesture
        </Text>

        {/* 用展开运算符按状态条件加入 modifier */}
        <Text
          modifiers={[
            background('#9B59B6'),
            cornerRadius(8),
            padding({ all: 14 }),
            ...(isEnabled
              ? [shadow({ radius: 6, y: 3 }), scaleEffect(1.02)]
              : [grayscale(0.5), opacity(0.7)]),
          ]}>
          Conditional styling
        </Text>
      </VStack>
    </Host>
  );
}
~~~

可创建第三方 modifier：`createModifier(type, params)` 会生成可放进 `modifiers` 数组的 `ModifierConfig`。自定义原生实现的扩展方式见官方 SwiftUI 扩展指南。

~~~tsx
// 第三方组件库中的封装示例
import { createModifier } from '@expo/ui/swift-ui/modifiers';

export const blurEffect = (params: { radius: number; style?: string }) =>
  createModifier('blurEffect', params);
~~~

## 动画常量与形状构造器

`Animation` 提供 `easeInOut`、`easeIn`、`easeOut`、`linear`、`spring` 和 `interpolatingSpring` 等预设，动画对象可以链式配置；`shapes` 为 `background`、`containerShape` 等 modifier 构造形状：

~~~tsx
import { Host, VStack } from '@expo/ui/swift-ui';
import { animation, Animation } from '@expo/ui/swift-ui/modifiers';

function SpringExample() {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Host style={{ flex: 1 }}>
      <VStack modifiers={[animation(Animation.spring({ duration: 0.8 }), isExpanded)]}>
        {/* 放置随 isExpanded 改变的子视图 */}
      </VStack>
    </Host>
  );
}
~~~

~~~tsx
import { background, shapes } from '@expo/ui/swift-ui/modifiers';
import { Text, Host } from '@expo/ui/swift-ui';

function RoundedBackgroundExample() {
  return (
    <Host>
      <Text
        modifiers={[
          background('#000', shapes.roundedRectangle({ cornerRadius: 12 })),
        ]}>
        Hello, world!
      </Text>
    </Host>
  );
}
~~~

## 滚动几何变化 Hook

`useScrollGeometryChange` 在滚动偏移或容器 / 内容尺寸变化时运行。标记为 `'worklet'` 的回调同步在 UI 线程执行；普通回调异步传给 JavaScript。此 API 要求 iOS / tvOS 18+，更低版本是 no-op：

~~~tsx
const geometryModifier = useScrollGeometryChange(g => {
  'worklet';
  progress.value = g.contentOffsetX / g.containerWidth;
});

<ScrollView modifiers={[geometryModifier]} />
~~~

## 重点代码示例

### 让整行可点击

`contentShape` 扩大命中测试区域，让包含 Spacer 的整行都可以响应 tap：

~~~tsx
import { HStack, List, Section, Spacer, Text } from '@expo/ui/swift-ui';
import {
  contentShape,
  onTapGesture,
  shapes,
} from '@expo/ui/swift-ui/modifiers';

function InteractiveRow() {
  return (
    <List>
      <Section title="Settings">
        <HStack
          modifiers={[
            contentShape(shapes.rectangle()),
            onTapGesture(() => console.log('Row tapped!')),
          ]}>
          <Text>Label</Text>
          <Spacer />
          <Text>Value</Text>
        </HStack>
      </Section>
    </List>
  );
}
~~~

### 调整列表分隔线的起点

`alignmentGuide('listRowSeparatorLeading', value)` 可修改 List 行分隔线的起始位置：

~~~tsx
<HStack modifiers={[alignmentGuide('listRowSeparatorLeading', 32)]}>
  <Text>A</Text>
  <Text>The separator starts 32 points from the leading edge</Text>
</HStack>
~~~

### 数值文本变化过渡

`contentTransition('numericText')` 配合 animation 可平滑过渡数字内容：

~~~tsx
<Text modifiers={[contentTransition('numericText'), animation(Animation.default, count)]}>
  {count.toString()}
</Text>
~~~

### 限制 Dynamic Type 字号范围

Dynamic Type 是用户设置的辅助功能字体缩放。可以固定值、设置下限、上限或范围；把它加在 Host 会沿 SwiftUI environment 传给后代。一般优先设上限，不要完全关闭用户字体放大：

~~~tsx
// 将紧凑布局内文字的最大辅助功能字号限制在 accessibility3
<Host modifiers={[dynamicTypeSize({ max: 'accessibility3' })]}>
  ...
</Host>
~~~

### 设置字体并保留系统字号缩放

传 `textStyle` 可以随 Dynamic Type 缩放。配合 `family` 设置自定义字体族；只传固定 `size` 则不随用户字号设置变化：

~~~tsx
// 随 Dynamic Type 缩放
<Text modifiers={[font({ textStyle: 'largeTitle', weight: 'bold' })]}>Hello</Text>

// 基于 body 样式缩放的自定义字体
<Text modifiers={[font({ textStyle: 'body', family: 'Helvetica', size: 18 })]}>Hi</Text>

// 固定大小的系统圆角粗体字，不随 Dynamic Type 缩放
<Text modifiers={[font({ weight: 'bold', design: 'rounded', size: 16 })]}>Static</Text>
~~~

### 使用 foregroundStyle

Latest 已把 `foregroundColor` 标记为弃用，推荐 `foregroundStyle`。它可以显示固定颜色、适应系统的层级色，也能使用渐变：

~~~tsx
// 固定红色
<Text modifiers={[foregroundStyle('#FF0000')]}>Red Text</Text>

// 次级语义文本颜色，适应系统外观
<Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
  Supporting Text
</Text>

// 线性渐变
<Text
  modifiers={[
    foregroundStyle({
      type: 'linearGradient',
      colors: ['#FF6B35', '#F7931E', '#FFD23F'],
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 1, y: 0 },
    }),
  ]}>
  Gradient Text
</Text>
~~~

### foregroundStyle 渐变配置对象

除 JSX modifier 用法外，页面还列出以下径向与角度（圆锥）渐变参数对象：

~~~ts
// Radial Gradient
{
  type: 'radialGradient',
  colors: [PlatformColor('systemPink'), '#0000FF'],
  center: { x: 0.5, y: 0.5 },
  startRadius: 0,
  endRadius: 100,
}

// Angular Gradient (Conic)
{
  type: 'angularGradient',
  colors: [PlatformColor('systemPink'), '#00FF00', '#0000FF'],
  center: { x: 0.5, y: 0.5 },
}
~~~

### 隔离动画中的几何变化

`geometryGroup` 在父布局和子项变化动画之间隔离尺寸 / 位置，要求 iOS / tvOS 17+：

~~~tsx
<VStack modifiers={[animation(Animation.spring(), isBusy)]}>
  {isBusy ? <Text>Working…</Text> : null}
  <Button label="Check now" modifiers={[geometryGroup()]} />
</VStack>
~~~

### 为网格单元指定对齐锚点

网格单元可以使用预设位置锚点，也可用 0–1 的自定义坐标：

~~~tsx
// 预设锚点
<Rectangle
  modifiers={[gridCellAnchor({ type: 'preset', anchor: 'center' })]}
/>

// 自定义锚点
<Rectangle
  modifiers={[gridCellAnchor({ type: 'custom', points: { x: 0.3, y: 0.8 } })]}
/>
~~~

### 滚动定位到带 ID 的项目

`scrollPosition` 与 `useNativeState`、`scrollTargetLayout()` 和项目的 `id()` 配合，绑定当前 leading item：

~~~tsx
const activeID = useNativeState<string | null>(null);

<ScrollView
  modifiers={[
    scrollPosition(activeID, {
      anchor: 'center',
      onChange: newID => console.log('leading target:', newID),
    }),
  ]}>
  <VStack modifiers={[scrollTargetLayout()]}>
    {items.map(item => (
      <Text key={item.id} modifiers={[id(item.id)]}>
        {item.text}
      </Text>
    ))}
  </VStack>
</ScrollView>
~~~

### 键盘 Return 键文字

`submitLabel` 修改文本输入时键盘提交键的标签，例如 Search：

~~~tsx
<TextField modifiers={[submitLabel('search')]} />
~~~

### SF Symbol 动画

`symbolEffect` 可用 `value` 观察原生状态，每次改变时触发一次效果：

~~~tsx
const trigger = useNativeState(0);

<Image
  systemName="bell.fill"
  modifiers={[symbolEffect({ effect: 'bounce', direction: 'up' }, { value: trigger })]}
/>
~~~

## API 分类索引

以下覆盖官方 Methods 目录中的方法名称；各方法的参数、系统最低版本和具体回调以来源页为准。全部方法从 `@expo/ui/swift-ui/modifiers` 导入，并通过组件的 `modifiers={[...]}` 应用。

| 分类 | 方法 | 说明 |
| --- | --- | --- |
| 无障碍 | `accessibilityAddTraits`、`accessibilityRemoveTraits` | 为元素添加 / 移除读屏语义特征。部分 traits 要求 iOS 17+。 |
| 无障碍 | `accessibilityElement`、`accessibilityHidden` | 控制子树如何组合成辅助功能元素，或隐藏装饰性内容。 |
| 无障碍 | `accessibilityLabel`、`accessibilityHint`、`accessibilityValue` | 设置读屏名称、操作提示和当前值。 |
| 无障碍 | `accessibilityIdentifier`、`accessibilityInputLabels` | 分别供 UI 自动化测试定位，或供 Voice Control 使用替代语音命令。 |
| 颜色、背景与图形 | `background`、`backgroundOverlay`、`containerBackground`、`containerShape`、`containerRelativeFrame` | 背景、容器形状或相对容器尺寸。 |
| 颜色、背景与图形 | `foregroundColor`、`foregroundStyle`、`tint`、`opacity`、`grayscale`、`colorInvert`、`brightness`、`contrast`、`hueRotation`、`saturation`、`luminanceToAlpha` | 前景样式、强调色、不透明度和图像颜色效果；`foregroundColor` 已弃用，使用 `foregroundStyle`。 |
| 颜色、背景与图形 | `blur`、`mask`、`clipShape`、`clipped`、`contentShape`、`border`、`strokeBorder`、`shadow`、`overlay` | 模糊、遮罩、命中区域、裁剪、边框、阴影与叠层。 |
| 布局 | `alignmentGuide`、`aspectRatio`、`frame`、`fixedSize`、`layoutPriority`、`offset`、`padding`、`scaleEffect`、`rotationEffect`、`rotation3DEffect`、`zIndex` | 尺寸、位置、边距、布局优先级、变换与层叠顺序。 |
| 栅格与列表 | `gridCellAnchor`、`gridCellColumns`、`gridCellUnsizedAxes`、`gridColumnAlignment` | 调整 Grid 单元的对齐、跨度和伸展行为。 |
| 栅格与列表 | `listStyle`、`listSectionMargins`、`listSectionSpacing`、`listRowBackground`、`listRowInsets`、`listRowSeparator`、`listRowSeparatorTint`、`listRowSpacing`、`headerProminence` | 设置 SwiftUI List 外观、区块和行样式。 |
| 控件外观 | `buttonStyle`、`buttonBorderShape`、`controlSize`、`datePickerStyle`、`gaugeStyle`、`pickerStyle`、`progressViewStyle`、`tabViewStyle`、`toggleStyle`、`labelStyle`、`imageScale` | 修改 SwiftUI 控件样式、尺寸、标签布局或图标比例。 |
| 文字与输入 | `font`、`bold`、`italic`、`kerning`、`lineHeight`、`lineLimit`、`lineSpacing`、`allowsTightening`、`minimumScaleFactor`、`monospacedDigit`、`multilineTextAlignment`、`textCase`、`truncationMode`、`underline`、`strikethrough` | 设置字体、行数、字距、对齐和文本装饰。 |
| 文字与输入 | `autocorrectionDisabled`、`keyboardType`、`submitLabel`、`textContentType`、`textFieldStyle`、`textInputAutocapitalization`、`textSelection` | 文本输入键盘、自动更正、自动大小写、内容类型和选择行为。 |
| 状态与环境 | `disabled`、`hidden`、`environment`、`dynamicTypeSize`、`ignoreSafeArea`、`privacySensitive`、`invalidatableContent`、`redacted`、`unredacted` | 禁用 / 隐藏、环境值、安全区域、Dynamic Type、隐私和骨架占位。 |
| 滚动 | `defaultScrollAnchor`、`defaultScrollAnchorForRole`、`scrollContentBackground`、`scrollDisabled`、`scrollDismissesKeyboard`、`scrollIndicators`、`scrollPosition`、`scrollTargetBehavior`、`scrollTargetLayout`、`id` | 滚动初始位置、键盘收起、指示器、目标吸附与 programmatic positioning。部分 API 要求 iOS 17+ / 18+。 |
| 菜单与列表编辑 | `badge`、`badgeProminence`、`deleteDisabled`、`moveDisabled`、`menuActionDismissBehavior`、`menuOrder` | 菜单 badge、列表编辑能力、菜单项排序和关闭行为。 |
| 手势与生命周期 | `onAppear`、`onDisappear`、`onTapGesture`、`onLongPressGesture`、`onSubmit`、`onGeometryChange`、`onScrollPhaseChange` | 视图显示、手势、提交、尺寸变化及滚动阶段回调。部分滚动 API 要求 iOS 18+。 |
| 动画 | `animation`、`contentTransition`、`geometryGroup`、`matchedGeometryEffect`、`symbolEffect` | 状态动画、内容切换过渡、几何匹配和 SF Symbols 效果。 |
| 图片 / Widget | `resizable`、`widgetAccentedRenderingMode`、`widgetURL`、`activityBackgroundTint` | 图片拉伸、Widget 渲染模式 / 点击 URL、Live Activity 背景色。 |
| 辅助 | `badge`、`tag`、`interactiveDismissDisabled`、`createModifier` | 标记选择、Sheet 交互关闭、第三方 modifier 扩展。 |

### Constants、事件与类型

- `Animation`：timing、spring、interpolatingSpring 动画预设；链式方法可 `delay`、`repeat`。
- `shapes`：`roundedRectangle`、`capsule`、`rectangle`、`ellipse`、`circle`、`containerRelativeShape`。
- `useScrollGeometryChange(callback)`：iOS / tvOS 18+ 的滚动几何 Hook；低版本 modifier no-op。
- `createModifierWithEventListener` / `createViewModifierEventListener`：创建或提取含事件监听器的 modifier。
- `ModifierConfig`：所有 modifier 的基础结构，至少含 `$type`，可有参数和事件回调。
- 官方类型目录还包括 `AccessibilityTrait`、`ChainableAnimationType`、`Color`、`ContainerBackgroundPlacement`、`DatePickerStyleType`、`DiscreteSymbolEffectValue`、`DynamicTypeSizeValue`、`EnvironmentConfig`、`GaugeStyleType`、`GlobalEvent`、`GlobalEventPayload`、`IndexViewStyleConfig`、`InterpolatingSpringAnimationParams`、`ListStyle`、`MenuOrderType`、`ObservableState`、`PageIndexBackgroundDisplayMode`、`PageIndexDisplayMode`、`PickerStyleType`、`PresentationBackgroundInteractionType`、`PresentationDetent`、`PresentationSizingType`、`ProgressViewStyleType`、`Shape`、`SpringAnimationParams`、`StrokeStyle`、`TabViewStyleConfig`、`TimingAnimationParams`、`UnitPointValue`。

### 常用基础 modifier 速记

| 方法 | 简要用途 |
| --- | --- |
| `background(color, shape?)` | 填充背景色，并可用形状裁切。 |
| `cornerRadius(radius)` | 给视图圆角。 |
| `padding({ all / horizontal / vertical / edges })` | 添加内边距。 |
| `frame({ width, height, min/max/ideal... })` | 约束尺寸和对齐。 |
| `disabled(true)` | 禁用用户交互。 |
| `opacity(0..1)` | 调整透明度。 |
| `shadow({ color, radius, x, y })` | 添加阴影。 |
| `onTapGesture(handler)` | 添加点击手势。 |
| `refreshable(asyncHandler)` | 添加下拉刷新。 |
| `redacted('placeholder')` | 将内容变成骨架占位；可配 `unredacted()` 保留子树。 |

## 源页代码主题覆盖

已逐项覆盖官方 17 个代码片段：组合 modifiers、第三方 `createModifier`、Animation 与 shapes、滚动几何 Hook、alignmentGuide、contentShape 点击区、数值文本过渡、Dynamic Type、字体、foregroundStyle 颜色 / 渐变、geometryGroup、gridCellAnchor、scrollPosition、submitLabel 和 symbolEffect。官方方法、常量、Hook 与类型按类别索引。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/modifiers/)

**翻页：**[上一页：SwiftUI Menu](./088-SwiftUI-Menu.md) · [目录](./README.md) · [下一页：SwiftUI Namespace](./090-SwiftUI-Namespace.md)
