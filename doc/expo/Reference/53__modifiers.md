# Expo UI Jetpack Compose Modifiers 学习指南

> 原文修改日期：2026 年 6 月 2 日  
> 包名：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档性质：下一版本 Expo SDK 的未版本化文档  
> 原文提示：稳定项目应参考 SDK 56 对应的最新版本文档。

## 文档解决的问题

本文介绍如何通过 `@expo/ui/jetpack-compose/modifiers` 修改 `@expo/ui` Android 组件的：

- 尺寸与布局
- 内外边距
- 背景、边框、透明度和阴影
- 裁剪形状
- 位移、旋转和图层变换
- 点击、长按、选择和切换交互
- 滚动、键盘避让
- 动画
- 布局测量与可见性监听
- 无障碍语义与测试标识

它适合需要使用 `@expo/ui` 构建 Android 原生界面的 Expo 或 React Native 项目。

这不是通用 React Native `style` API，也不是 Web CSS。它是 JavaScript/TypeScript 对 Jetpack Compose `Modifier` 的封装，目前文档中的 API 均只支持 Android。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式 UI 框架。可以将它粗略理解为 Android 原生开发中的“React 式组件系统”。

Compose 使用 `Modifier` 描述组件的布局、外观和行为，例如：

```kotlin
Modifier
  .padding(16.dp)
  .fillMaxWidth()
  .background(Color.Red)
```

`@expo/ui` 将这套能力包装成 TypeScript 函数：

```tsx
modifiers={[
  paddingAll(16),
  fillMaxWidth(),
  background('#FF0000'),
]}
```

React 负责声明组件，Expo 将这些配置传给 Android 原生侧，再由 Jetpack Compose 执行。

### `Host` 的作用

示例中的 `Host` 是承载 Jetpack Compose 组件的 React Native 容器：

```tsx
<Host style={{ flex: 1 }}>
  <Button modifiers={[fillMaxWidth()]}>Button</Button>
</Host>
```

这里存在两套不同的布局机制：

- `Host` 的 `style` 属于 React Native 布局系统。
- `Button` 的 `modifiers` 属于 Jetpack Compose 布局系统。

不要把二者当成同一个样式对象。

### `dp` 不是 CSS `px`

文档中的尺寸通常以 `dp` 为单位。`dp` 是 Android 的密度无关像素，由系统根据屏幕密度换算为实际像素。

对 React Native 开发者来说，可以把它理解为“不直接等于物理像素的逻辑尺寸单位”。调用 API 时只传数字：

```tsx
paddingAll(16)
size(200, 48)
```

不传 `"16dp"`，也不传 `"16px"`。

### `start` 和 `end`

`padding(start, top, end, bottom)` 使用的是逻辑方向：

- 在从左到右的语言中，`start` 是左侧，`end` 是右侧。
- 在 RTL 语言中，方向会反转。

它更接近 CSS 的 `padding-inline-start` 和 `padding-inline-end`，而不是固定的 `padding-left` 和 `padding-right`。

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

`expo install` 会按照当前 Expo SDK 选择兼容的包版本，因此这里不应直接替换为普通的 `npm install`。

如果是在现有的裸 React Native 项目中使用，还必须先安装并配置 `expo`，使项目具备加载 Expo Modules 的能力。

## 基本用法

组件通过 `modifiers` 属性接收一个数组：

```tsx
import { Button, Host } from '@expo/ui/jetpack-compose';
import {
  background,
  border,
  fillMaxWidth,
  paddingAll,
  shadow,
} from '@expo/ui/jetpack-compose/modifiers';

function Example() {
  return (
    <Host style={{ flex: 1 }}>
      <Button
        modifiers={[
          paddingAll(12),
          fillMaxWidth(),
          background('#4ECDC4'),
          border(2, '#2C3E50'),
          shadow(4),
        ]}>
        Styled button
      </Button>
    </Host>
  );
}
```

### 顺序会改变结果

Modifier 按数组顺序应用，不是无序的样式属性集合。

例如：

```tsx
modifiers={[paddingAll(16), background('#FF6B6B')]}
```

与下面的写法可能得到不同的背景覆盖范围：

```tsx
modifiers={[background('#FF6B6B'), paddingAll(16)]}
```

这与 Web 中将所有 CSS 声明合并到一个规则里的思维不同，更接近连续包装或变换组件。

文档明确要求的顺序包括：

- `innerShadow` 前必须先有 `background`。
- Neumorphic 外阴影应放在 `background` 前。
- Neumorphic 内阴影应放在 `background` 后。

## 间距与尺寸

### 内边距

```tsx
paddingAll(all)
padding(start, top, end, bottom)
```

| API | 作用 |
| --- | --- |
| `paddingAll(16)` | 四边使用相同的 `16dp` 内边距 |
| `padding(16, 8, 16, 8)` | 分别设置 start、top、end、bottom |

当前文档只提供内边距 Modifier，没有提供对应的 `margin` Modifier。

### 固定尺寸

```tsx
size(width, height)
width(value)
height(value)
```

示例：

```tsx
<Button modifiers={[size(200, 48)]}>Fixed size</Button>
```

这些 API 设置精确的 `dp` 尺寸。实际结果仍会受到父容器约束影响；这是 Compose 布局模型的一般特征，原文没有进一步说明冲突时的详细测量规则。

### 填充可用空间

```tsx
fillMaxSize(fraction?)
fillMaxWidth(fraction?)
fillMaxHeight(fraction?)
```

`fraction` 的范围是 `0.0` 到 `1.0`，默认值为 `1.0`：

```tsx
fillMaxWidth()    // 填满可用宽度
fillMaxWidth(0.5) // 占可用宽度的一半
fillMaxSize(0.5)  // 两个维度都使用一半可用空间
```

这里的“可用空间”由父级 Compose 布局约束决定，不等同于浏览器视口。

### 根据内容决定尺寸

```tsx
wrapContentWidth(alignment?)
wrapContentHeight(alignment?)
```

可用值：

| API | 对齐值 |
| --- | --- |
| `wrapContentWidth` | `'start'`、`'centerHorizontally'`、`'end'` |
| `wrapContentHeight` | `'top'`、`'centerVertically'`、`'bottom'` |

### 默认最小尺寸

```tsx
defaultMinSize({
  minWidth: 48,
  minHeight: 48,
})
```

`defaultMinSize` 只会在对应的输入最小约束为 `0` 时应用，不是无条件强制最小宽高。

**基于文档内容推导：**如果父布局已经给出非零的最小约束，`defaultMinSize` 不会覆盖该约束。不要把它简单等同于 CSS 的 `min-width` 和 `min-height`。

## 位置与父容器布局

### `offset(x, y)`

```tsx
<Button modifiers={[offset(10, 5)]}>Offset</Button>
```

它将组件从自然位置偏移，但不会改变周围组件的布局。

这类似于只改变视觉位置：兄弟组件不会因为该位移重新排列，因此偏移后可能发生重叠。

### `weight(weight)`

`weight` 只在 `Row` 或 `Column` 中生效，用于按比例分配剩余空间：

```tsx
<Button modifiers={[weight(2)]}>2/3</Button>
<Button modifiers={[weight(1)]}>1/3</Button>
```

它接近 Flexbox 的 `flex-grow`，但不是完整的 CSS `flex` 简写。

### `align(alignment)`

`align` 设置子组件在父容器中的对齐方式。`Alignment` 可取：

```text
topStart | topCenter | topEnd
centerStart | center | centerEnd
bottomStart | bottomCenter | bottomEnd
top | centerVertically | bottom
start | centerHorizontally | end
```

具体可用的对齐方向取决于父容器类型。

### `matchParentSize()`

```tsx
matchParentSize()
```

它只在 `Box` 内有效，使组件匹配父 `Box` 的最终尺寸。

它和 `fillMaxSize()` 的关键区别是：

- `fillMaxSize()` 会参与父容器测量。
- `matchParentSize()` 不影响父容器自身的测量结果。

**基于文档内容推导：**`matchParentSize()` 适合在 `Box` 中制作覆盖层、背景层等需要匹配父级最终尺寸，但不应反向撑大父级的元素。

## 外观

### 背景、边框与透明度

```tsx
background(color, options?)
border(borderWidth, borderColor)
alpha(value)
```

示例：

```tsx
<Button
  modifiers={[
    background('#3498DB'),
    border(2, '#E74C3C'),
    alpha(0.8),
  ]}>
  Styled
</Button>
```

`alpha` 的范围为 `0.0` 到 `1.0`。

API 参考还说明 `background` 支持动画配置：

```tsx
background(nextColor, {
  animationSpec: tween({
    durationMillis: 300,
    easing: 'ease',
  }),
})
```

当颜色参数变化时，Android 原生侧会通过 `animateColorAsState` 平滑过渡。

### 模糊

```tsx
blur(radius)
```

`radius` 是以 `dp` 表示的模糊半径。它会模糊组件本身，不应直接理解为 Web 的 `backdrop-filter` 背景模糊。

### 阴影 API 的区别

#### `shadow(elevation)`

```tsx
shadow(8)
```

基于 elevation 创建 Android 阴影，适合表达组件层级。

#### `dropShadow(shape, config?)`

```tsx
dropShadow(Shapes.RoundedCorner(24), {
  radius: 16,
  spread: 4,
  color: '#6200EE',
  offsetY: 8,
  alpha: 0.8,
})
```

它绘制外阴影，不依赖 elevation，并允许控制：

| 字段 | 作用 |
| --- | --- |
| `radius` | 模糊半径，单位为 `dp` |
| `spread` | 扩张或收缩阴影轮廓，可为负数 |
| `color` | 阴影颜色，默认黑色 |
| `offsetX` | 水平偏移 |
| `offsetY` | 垂直偏移 |
| `alpha` | 透明度，范围 `0.0–1.0` |

#### `innerShadow(shape, config?)`

参数与 `dropShadow` 相同，但阴影绘制在组件内部，用于制作凹陷效果。

必须先应用背景：

```tsx
modifiers={[
  background('#FFFFFF'),
  innerShadow(Shapes.RoundedCorner(24), {
    radius: 16,
    spread: 2,
    offsetY: 6,
  }),
]}
```

没有前置 `background` 时，内阴影不会正常渲染。

### 文档中的阴影组合

#### Neobrutalist 硬边阴影

核心是零模糊、零扩张、明显偏移和粗边框：

```tsx
<Box
  modifiers={[
    dropShadow(Shapes.Rectangle, {
      radius: 0,
      spread: 0,
      offsetX: 8,
      offsetY: 8,
      color: '#000000',
    }),
    border(8, '#000000'),
    background('#FFFFFF'),
  ]}
/>
```

#### Neumorphic 双向阴影

通过一明一暗两个外阴影模拟光源，背景色与表面颜色保持一致：

```tsx
const shape = Shapes.RoundedCorner(24);

<Box
  modifiers={[
    dropShadow(shape, {
      radius: 15,
      offsetX: -10,
      offsetY: -10,
      color: '#FFFFFF',
    }),
    dropShadow(shape, {
      radius: 15,
      offsetX: 10,
      offsetY: 10,
      color: '#B1B1B1',
    }),
    background('#E0E0E0'),
  ]}
/>
```

制作按下后的凹陷版本时，将两个 `dropShadow` 替换为 `innerShadow`，并放在 `background` 后。

## 裁剪和形状

### `clip(shape)`

`clip` 会裁掉形状边界外的内容：

```tsx
<Button modifiers={[clip(Shapes.Circle)]}>Circle</Button>
<Button modifiers={[clip(Shapes.RoundedCorner(12))]}>Rounded</Button>
```

常用形状包括：

| 形状 | 说明 |
| --- | --- |
| `Shapes.Rectangle` | 普通矩形 |
| `Shapes.Circle` | 圆形 |
| `Shapes.RoundedCorner(radius)` | 圆角矩形 |
| `Shapes.CutCorner(radius)` | 切角矩形 |
| `Shapes.Material.*` | Material Design 预定义形状 |

各角可以单独设置：

```tsx
Shapes.RoundedCorner({
  topStart: 16,
  topEnd: 16,
  bottomStart: 0,
  bottomEnd: 0,
})
```

`CutCorner` 接受相同的数字或分角配置。

### Material 形状

文档 API 列出了以下预定义形状：

```text
Arch, Boom, Bun, Clover4Leaf, Clover8Leaf,
Cookie4Sided, Cookie6Sided, Cookie7Sided,
Cookie9Sided, Cookie12Sided, Diamond, Fan,
Ghostish, Heart, Oval, Pentagon, Pill,
PixelCircle, PixelTriangle, Puffy, PuffyDiamond,
Slanted, SoftBurst, Sunny, Triangle, VerySunny
```

例如：

```tsx
clip(Shapes.Material.Heart)
```

文档前半部分只展示了两个 Cookie 形状，但完整 API 中提供了更多 Material 形状。

## 变换和图层

### 简单变换

```tsx
rotate(degrees)
zIndex(index)
```

- `rotate(45)`：旋转 45 度。
- `zIndex(10)`：控制发生重叠时的绘制顺序。

`zIndex` 只影响层叠绘制，不会自动改变布局位置。

### `graphicsLayer(params)`

`graphicsLayer` 提供更完整的原生图层变换：

- `alpha`
- `rotationX`、`rotationY`、`rotationZ`
- `scaleX`、`scaleY`
- `translationX`、`translationY`
- `transformOriginX`、`transformOriginY`
- `cameraDistance`
- `shadowElevation`
- `ambientShadowColor`、`spotShadowColor`
- `shape`
- `clip`
- `compositingStrategy`

`compositingStrategy` 可取：

```text
auto | offscreen | modulate
```

多个数值属性既可以接收普通数字，也可以接收 `animated()` 创建的动画值。

**基于经验建议：**只有在简单的 `rotate`、`alpha` 等 API 无法满足需求时再使用 `graphicsLayer`。它暴露的参数更多，图层合成和离屏渲染也可能带来额外性能成本；原文未给出具体性能数据。

## 动画

### 内容尺寸动画

```tsx
animateContentSize(dampingRatio?, stiffness?)
```

它使用弹簧动画处理内容尺寸变化：

```tsx
<Button modifiers={[animateContentSize()]}>
  Animated size
</Button>

<Button modifiers={[animateContentSize(0.5, 200)]}>
  Custom spring
</Button>
```

- `dampingRatio` 控制弹跳程度。
- `stiffness` 控制弹簧刚度和动画速度。
- 默认值分别是 Compose 的 `DampingRatioNoBouncy` 和 `StiffnessMedium`。

### 通用动画值

```tsx
animated(targetValue, spec?)
```

它返回供 `graphicsLayer` 等 API 使用的动画值，而不是一个 Modifier：

```tsx
graphicsLayer({
  rotationZ: animated(45, tween({
    durationMillis: 300,
    easing: 'ease',
  })),
})
```

### 动画规格

| API | 作用 |
| --- | --- |
| `spring(params?)` | 弹簧动画 |
| `tween(params?)` | 固定时长的补间动画 |
| `snap(params?)` | 延迟后立即切换 |
| `keyframes(params)` | 按时间点定义关键帧 |

`tween` 支持以下 easing：

```text
linear
ease
fastOutSlowIn
fastOutLinearIn
linearOutSlowIn
```

`keyframes` 接收：

```tsx
keyframes({
  delayMillis: 0,
  durationMillis: 600,
  keyframes: {
    0: 0,
    300: 1,
    600: 0.5,
  },
})
```

原文 API 参考没有为这些动画工厂提供完整示例，也没有说明每种参数的推荐范围。

## 交互和无障碍语义

### 普通点击

```tsx
clickable(handler, options?)
```

```tsx
clickable(() => console.log('Clicked'), {
  indication: true,
})
```

`indication` 控制是否显示点击涟漪反馈。

### 点击与长按

```tsx
combinedClickable(
  {
    onClick: () => console.log('Tapped'),
    onLongClick: () => setMenuExpanded(true),
  },
  {
    indication: true,
  },
)
```

它适合在同一个组件上区分短按和长按，例如：

- 短按执行普通操作。
- 长按打开 `DropdownMenu`。

### 可选择项

```tsx
selectable(selected, handler, role?)
```

可选的无障碍角色：

```text
radioButton | checkbox | switch | tab
```

例如：

```tsx
selectable(
  isSelected,
  () => setIsSelected(!isSelected),
  'radioButton',
)
```

`selectableGroup()` 应用在包含多个可选子项的 `Row` 或 `Column` 上，使屏幕阅读器将它们识别为一组选择项。

### 可切换项

```tsx
toggleable(value, handler, options?)
```

它为布尔切换操作提供无障碍语义：

```tsx
toggleable(
  checked,
  () => setChecked(!checked),
  { role: 'checkbox' },
)
```

典型场景是让包含 `Checkbox` 或 `Switch` 的整行都可以点击，而不只是让控件本身响应点击。

### 自定义语义

```tsx
semantics({
  contentType: '...',
})
```

该 API 封装 Compose 的 `Modifier.semantics`。当前文档只列出 `contentType: string`，没有进一步说明允许值及具体行为。

## 滚动、键盘和菜单锚点

### 非惰性滚动

```tsx
horizontalScroll()
verticalScroll()
```

- `horizontalScroll()` 通常应用到 `Row`。
- `verticalScroll()` 通常应用到 `Column`。
- 两者内部使用 Compose 的 `rememberScrollState()`。
- 它们创建的是非 lazy 滚动容器。

“非 lazy”意味着子元素不会像虚拟列表那样按需创建。

**基于文档内容推导：**大量列表数据不宜仅靠这两个 Modifier 渲染，应优先考虑对应的 lazy list 组件。原文没有给出具体数量阈值。

### 软件键盘避让

```tsx
imePadding()
```

IME 指 Android 的输入法或软键盘。键盘出现时，该 Modifier 会增加内边距，使内容保持在键盘上方。

它可以类比 Web 中根据虚拟键盘区域调整页面底部空间，但具体行为由 Android 窗口和 Compose Insets 系统执行。

### 下拉菜单锚点

```tsx
menuAnchor(type?, enabled?)
```

- 只在 `ExposedDropdownMenuBox` 内生效。
- 当前仅支持 `'primaryNotEditable'` 类型。
- `enabled` 默认为 `true`。

它用于标记下拉菜单应依附的组件，不是通用定位 API。

## 布局测量和可见性监听

### 监听尺寸变化

```tsx
onSizeChanged(({ width, height }) => {
  // width 和 height 的单位为 dp
})
```

组件测量尺寸变化时会执行回调。

### 监听全局位置

```tsx
onGloballyPositioned(({ x, y, width, height }) => {
  // x、y 相对于窗口，全部以 dp 表示
})
```

这与 React Native 的 `onLayout` 有相似用途，但原文明确说明这里的 `x`、`y` 相对于窗口。

### 监听可见性

```tsx
onVisibilityChanged(
  isVisible => {
    // 进入或离开可视区域
  },
  {
    minDurationMs: 300,
    minFractionVisible: 0.5,
  },
)
```

它可以监听组件是否进入或离开可视区域，例如 lazy list 中的项目。

- `minDurationMs`：达到状态所需的最短持续时间。
- `minFractionVisible`：至少有多少比例可见。

当前文档没有说明默认值、回调触发频率或边界判定细节。

## 测试标识

```tsx
testID('submit-button')
```

它为原生组件设置测试 ID，供 UI 测试框架定位元素：

```tsx
<Button modifiers={[testID('submit-button')]}>
  Submit
</Button>
```

这对应测试定位能力，不会产生可见 UI。

## 底层和扩展 API

### `ModifierConfig`

所有 Modifier 工厂通常返回：

```ts
type ModifierConfig = {
  $type: string;
  $scope?: string;
};
```

这是传递给原生视图的 JSON 配置模式，同时用于 Android Jetpack Compose 和 iOS SwiftUI 的配置表达。

不过，本文列出的具体 Modifier 均标记为 Android 支持，不能据此认为它们已经支持 iOS。

### 创建自定义配置

```tsx
createModifier(type, params?)
```

它是创建 `ModifierConfig` 的底层工厂。

事件相关底层 API 包括：

```tsx
createModifierWithEventListener(type, eventListener, params?)
createViewModifierEventListener(modifiers)
```

它们分别用于创建带事件监听的 Modifier 配置，以及为 Modifier 数组创建原生视图事件监听器。

原文没有提供自定义 Modifier 类型的注册方式或使用示例。因此，仅凭当前文档不足以安全地设计新的原生 Modifier。

### 已弃用的名称

`ExpoModifier` 目前只是 `ModifierConfig` 的类型别名，并已被弃用。

原有的 SharedRef 模式已经被 JSON Config 模式替代，原因是改善开发体验并提高平台一致性。新代码应使用 `ModifierConfig`。

## API 分类速查

| 分类 | API |
| --- | --- |
| 间距 | `paddingAll`、`padding`、`imePadding` |
| 尺寸 | `size`、`width`、`height`、`defaultMinSize` |
| 填充与包裹 | `fillMaxSize`、`fillMaxWidth`、`fillMaxHeight`、`wrapContentWidth`、`wrapContentHeight` |
| 父容器布局 | `weight`、`align`、`matchParentSize` |
| 位置与层叠 | `offset`、`zIndex` |
| 外观 | `background`、`border`、`alpha`、`blur` |
| 阴影 | `shadow`、`dropShadow`、`innerShadow` |
| 形状 | `clip`、`Shapes` |
| 变换 | `rotate`、`graphicsLayer` |
| 动画 | `animateContentSize`、`animated`、`spring`、`tween`、`snap`、`keyframes` |
| 交互 | `clickable`、`combinedClickable`、`selectable`、`toggleable` |
| 无障碍 | `selectableGroup`、`semantics` |
| 滚动 | `horizontalScroll`、`verticalScroll` |
| 菜单 | `menuAnchor` |
| 测量与可见性 | `onSizeChanged`、`onGloballyPositioned`、`onVisibilityChanged` |
| 测试 | `testID` |
| 底层扩展 | `createModifier`、`createModifierWithEventListener`、`createViewModifierEventListener` |

## React Web 开发者最容易误解的地方

### Modifier 数组不是 CSS 对象

下面两者不等价：

```tsx
style={{
  padding: 16,
  backgroundColor: 'red',
}}
```

```tsx
modifiers={[
  paddingAll(16),
  background('red'),
]}
```

CSS 声明主要通过层叠和布局规则共同计算；Compose Modifier 是有顺序的操作链。改变数组顺序可能改变测量、绘制或交互范围。

### 不是所有 API 都能脱离父容器工作

以下 API 有明确的父容器要求：

| API | 必需环境 |
| --- | --- |
| `weight` | `Row` 或 `Column` |
| `matchParentSize` | `Box` |
| `menuAnchor` | `ExposedDropdownMenuBox` |

脱离正确环境使用时，不应期待它们产生文档描述的效果。

### `fillMaxWidth()` 不是 `width: 100vw`

它填充的是父布局提供的最大可用宽度，不是设备屏幕或浏览器视口。

### `offset` 不会推动兄弟元素

`offset` 只移动当前组件的最终位置，周围元素仍按原布局占位，可能产生覆盖。

### `clip`、背景和圆角不是一个属性

Web 中常将 `border-radius`、`overflow: hidden` 和背景放在同一元素上。在这里：

- `Shapes.RoundedCorner()` 只是形状描述。
- `clip(shape)` 负责裁剪。
- `background(color)` 负责绘制背景。
- 阴影 API 还需要单独接收形状。

只创建形状不会自动完成裁剪、背景和阴影。

### 点击语义不仅是事件回调

`selectable`、`toggleable`、`selectableGroup` 不只是点击处理器，它们还表达组件在 Android 无障碍系统中的语义。不要一律用 `clickable` 模拟单选框、复选框或开关。

## 限制和坑点

1. 当前 API 文档均标记为仅支持 Android，不能直接用于 iOS 或 Web。
2. 页面属于下一 SDK 版本的未版本化文档，稳定项目需核对实际 Expo SDK 对应的文档。
3. Modifier 顺序会影响结果，尤其是 padding、background、clip 和 shadow。
4. `innerShadow` 必须位于 `background` 后。
5. `weight`、`matchParentSize` 和 `menuAnchor` 有明确的父容器限制。
6. `horizontalScroll`、`verticalScroll` 是非惰性容器，不等同于虚拟列表。
7. `fraction`、`alpha` 等比例值的文档范围为 `0.0–1.0`。
8. `onGloballyPositioned` 返回的坐标相对于窗口，而不是浏览器文档或必然相对于直接父级。
9. `padding` 的 `start`、`end` 会随 RTL 布局方向改变。
10. 当前文档没有涉及 iOS 等价 API、Web 降级方案、服务端渲染、主题系统、响应式断点和性能基准。
11. 当前文档没有提供错误处理策略，也没有说明向不支持的组件传入某个 Modifier 时的运行时行为。
12. `semantics`、底层创建函数和动画工厂的说明较简略，复杂用法需要继续查阅相应 Compose 或 Expo API 文档。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将 Modifier 按布局、绘制、交互的执行意图排列，并在阴影等依赖顺序的地方保留简短注释。
2. 对重复使用的复杂 Modifier 数组提取函数，但不要共享会捕获过期状态的点击回调。
3. 优先使用 `selectable` 和 `toggleable` 表达选择语义，而不是只追求“点得动”。
4. 列表数据较多时不要用普通 `Column + verticalScroll()` 替代 lazy list。
5. 使用 `onSizeChanged`、`onGloballyPositioned` 时避免在每次回调中无条件更新状态，否则可能造成重复测量和渲染。
6. 使用 `graphicsLayer`、多层阴影和模糊效果后，应在真实 Android 设备上检查动画流畅度。
7. 对关键交互组件添加稳定的 `testID`，不要使用会随文案或数组下标变化的标识。
8. 项目如果同时支持 Android 和 iOS，应将 Jetpack Compose 组件和 Modifier 放在明确的平台边界内，并为其他平台提供对应实现。

## 文档明确内容与推导内容

### 文档明确说明

- Modifier 用于修改布局、外观和行为。
- Modifier 通过 `modifiers` 数组传入，并按数组顺序应用。
- 本文 API 支持 Android，包可用于 Expo Go。
- 所有常规尺寸值使用 `dp`。
- `innerShadow` 依赖位于它之前的 `background`。
- `weight` 只适用于 `Row` 或 `Column`。
- `matchParentSize` 只适用于 `Box`，且不参与父级测量。
- `menuAnchor` 只适用于 `ExposedDropdownMenuBox`。
- 水平和垂直滚动 Modifier 创建非 lazy 容器。
- `onGloballyPositioned` 的坐标相对于窗口。
- `ExpoModifier` 已弃用，应使用 `ModifierConfig`。

### 基于文档内容推导

- Modifier 更接近有顺序的处理链，而不是无序 CSS 属性集合。
- `matchParentSize` 适合不应撑大父容器的覆盖层。
- `offset` 可能使组件与兄弟元素发生重叠。
- 大量数据不适合普通滚动容器，应使用 lazy list。
- Android 专用 Modifier 在跨平台项目中需要明确的平台隔离。

这些推导建立在原文描述的 Compose 行为上，但不是原文逐字给出的应用规范。

## 总结

`@expo/ui/jetpack-compose/modifiers` 是 React/TypeScript 到 Android Jetpack Compose Modifier 的配置桥梁。使用它时最重要的不是记住每个函数，而是建立以下认识：

- 它只作用于 Jetpack Compose 原生组件，不是通用 React Native CSS。
- Modifier 是按顺序执行的数组，顺序可能改变测量和绘制结果。
- 布局能力受 `Row`、`Column`、`Box` 等 Compose 父容器约束。
- `dp`、逻辑方向、原生无障碍语义和非 lazy 滚动都是移动端开发中需要额外关注的概念。
- 当前页面面向下一 SDK 版本，实际项目必须核对所用 Expo SDK 是否已经包含对应 API。

---

## 文档导航

- **上一页**：[bottomsheet](./52__bottomsheet.md)
- **下一页**：[navigationbar](./54__navigationbar.md)
