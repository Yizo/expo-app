# 045｜Jetpack Compose Modifiers

**翻页：**[上一页：Jetpack Compose ModalBottomSheet](./044-Jetpack-Compose-ModalBottomSheet.md) · [目录](./README.md) · [下一页：Jetpack Compose NavigationBar](./046-Jetpack-Compose-NavigationBar.md)

**官方页面：**[Jetpack Compose Modifiers · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`。同一页面提供 Android Jetpack Compose modifiers 的概览和 API 类型；这些 API 属于 Expo UI。SDK 56 文档请以[对应精确版本 reference](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/modifiers/)为准。

## Modifier 是什么

Jetpack Compose 的 **Modifier** 用来描述原生组件的尺寸、内边距、背景、阴影、交互、裁剪等属性。可以把它粗略理解成 Compose UI 的样式与行为配置；它不是网页 CSS 属性对象，也不是 React Native `style`。

Expo UI 通过组件的 `modifiers` 数组来传入配置。数组中的顺序会影响最终绘制结果，例如先 padding 再 background 与先 background 再 padding 的可见区域不同：

```tsx
import { Button, Host } from '@expo/ui/jetpack-compose';
import {
  paddingAll,
  fillMaxWidth,
  background,
  border,
  shadow,
  clickable,
} from '@expo/ui/jetpack-compose/modifiers';

function ModifiersExample() {
  return (
    <Host style={{ flex: 1 }}>
      {/* 基本样式 modifiers */}
      <Button
        modifiers={[
          paddingAll(16),
          fillMaxWidth(),
          background('#FF6B6B'),
        ]}>
        Full-width padded button
      </Button>

      {/* 组合边框和阴影 */}
      <Button
        modifiers={[
          paddingAll(12),
          background('#4ECDC4'),
          border(2, '#2C3E50'),
          shadow(4),
        ]}>
        Styled with border and shadow
      </Button>
    </Host>
  );
}
```

安装命令：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

已有的 React Native 工程还需要安装 `expo`。

## Padding：内容内边距

`paddingAll(all)` 对四边使用相同 dp 数值；`padding(start, top, end, bottom)` 可以分别控制四边。`start` / `end` 是逻辑方向，RTL 布局时会随阅读方向改变：

```tsx
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[paddingAll(16)]}>Padded button</Button>;
```

```tsx
import { padding } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[padding(16, 8, 16, 8)]}>Custom padding</Button>;
```

## Size：尺寸与填满约束

```tsx
import { size } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[size(200, 48)]}>Fixed size</Button>;
```

`fillMaxSize(fraction?)` 让组件占可用宽高的一部分，缺省比例是 1；官方示例同时演示填满和一半：

```tsx
import { fillMaxSize } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[fillMaxSize()]}>Fill all space</Button>
<Button modifiers={[fillMaxSize(0.5)]}>Fill half</Button>
```

```tsx
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[fillMaxWidth()]}>Full width</Button>;
```

API 还提供以下尺寸 modifiers（fraction 缺省为 1）：

| Modifier | 作用 |
| --- | --- |
| `fillMaxWidth(fraction?)` | 填满可用宽度的指定比例。 |
| `fillMaxHeight(fraction?)` | 填满可用高度的指定比例。 |
| `width(value)` / `height(value)` | 指定宽度 / 高度，单位 dp。 |
| `wrapContentWidth(alignment?)` / `wrapContentHeight(alignment?)` | 尺寸包住内容，并可指定内容对齐方向。 |
| `defaultMinSize({ minWidth, minHeight })` | 仅在对应入参约束为 0 时应用最小宽高。 |

`fraction` 的范围为 0 到 1；具体尺寸仍受父级传入的 Compose 布局约束。

## Position：偏移位置

`offset(x, y)` 将组件从自然布局位置移动，但不改变周围组件参与布局时占用的空间：

```tsx
import { offset } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[offset(10, 5)]}>Offset button</Button>;
```

`x`、`y` 都以 dp 为单位。可用 `align(alignment)` 在容器内对齐；具体支持值在本页 API 的 `Alignment` 类型一节列出。

## Appearance：背景、边框、阴影、透明度和模糊

```tsx
import { background } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[background('#3498DB')]}>Blue background</Button>;
```

```tsx
import { border } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[border(2, '#E74C3C')]}>Bordered button</Button>;
```

```tsx
import { shadow } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[shadow(8)]}>Elevated button</Button>;
```

`dropShadow(shape, config?)` 为组件外侧绘制阴影，可以设形状、模糊半径、扩张 / 收缩、颜色、偏移和透明度；它不需要 elevation 值：

```tsx
import {
  dropShadow,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

<Button
  modifiers={[
    dropShadow(Shapes.RoundedCorner(24), {
      radius: 16,
      spread: 4,
      color: '#6200EE',
      offsetY: 8,
    }),
  ]}>
  Drop shadow
</Button>;
```

`innerShadow(shape, config?)` 在组件内部绘制凹陷阴影。需要先应用背景，再应用 inner shadow：

```tsx
import {
  innerShadow,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

<Button
  modifiers={[
    background('#FFFFFF'),
    innerShadow(Shapes.RoundedCorner(24), {
      radius: 16,
      spread: 2,
      offsetY: 6,
    }),
  ]}>
  Inner shadow
</Button>;
```

```tsx
import { alpha } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[alpha(0.5)]}>Semi-transparent</Button>;
```

```tsx
import { blur } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[blur(4)]}>Blurred button</Button>;
```

## 阴影组合示例

新粗野主义效果通过零模糊、零扩张的偏移阴影与粗边框组合成硬边投影：

```tsx
import {
  dropShadow,
  border,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

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
/>;
```

新拟态通过两个不同方向和亮度的 drop shadow，再铺设背景色来形成凸起表面：

```tsx
import {
  dropShadow,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

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
/>;
```

官方还说明，凹陷的按压态可以改用两个 `innerShadow`，并把它们放在 `background` 之后；页面没有提供这类按压态的完整代码片段。

## Transform：旋转与层级

```tsx
import { rotate } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[rotate(45)]}>Rotated</Button>;
```

```tsx
import { zIndex } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[zIndex(10)]}>On top</Button>;
```

`rotate(degrees)` 使用角度；`zIndex(index)` 控制重叠组件绘制先后。更复杂的 3D / 图层效果使用 `graphicsLayer(params)`。

## Animation：尺寸和属性动画

`animateContentSize(dampingRatio?, stiffness?)` 使用弹簧动画过渡内容尺寸变化：

```tsx
import { animateContentSize } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[animateContentSize()]}>Animated size</Button>
<Button modifiers={[animateContentSize(0.5, 200)]}>Custom spring</Button>
```

Modifier API 同时提供 `animated(targetValue, spec?)`，可将目标数值和 animation spec 编码成支持动画的值；动画规格可由 `spring`、`tween`、`snap` 或 `keyframes` 创建。`background(color, { animationSpec })` 支持在颜色变化时执行平滑过渡。

## Layout：权重、对齐和父级尺寸

`weight(weight)` 仅用于 `Row` 或 `Column` 内部的子元素，按兄弟元素的权重比例分配剩余空间：

```tsx
import { weight } from '@expo/ui/jetpack-compose/modifiers';

// 在 Row 里，第一个按钮占 2/3，第二个占 1/3。
<Button modifiers={[weight(2)]}>Wider</Button>
<Button modifiers={[weight(1)]}>Narrower</Button>
```

`matchParentSize()` 只对 `Box` 内部子项有效。它匹配父 Box 尺寸，但不参与增大父 Box 的测量尺寸，因此与 `fillMaxSize()` 行为不同：

```tsx
import { matchParentSize } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[matchParentSize()]}>Match parent</Button>;
```

## Interaction：点击、长按、选择和开关

```tsx
import { clickable } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[clickable(() => console.log('Clicked!'))]}>
  Clickable
</Button>;
```

`combinedClickable` 同时处理短按和长按，并可选择是否显示 ripple（默认显示）：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
import { combinedClickable } from '@expo/ui/jetpack-compose/modifiers';

<Text
  modifiers={[
    combinedClickable({
      onClick: () => console.log('Tapped'),
      onLongClick: () => setMenuExpanded(true),
    }),
  ]}>
  Long-press me
</Text>;
```

```tsx
import { selectable } from '@expo/ui/jetpack-compose/modifiers';

<Button
  modifiers={[
    selectable(isSelected, () => setIsSelected(!isSelected)),
  ]}>
  Selectable option
</Button>;
```

API 的 `selectable` 还接受可选语义角色 `switch`、`checkbox`、`tab`、`radioButton`；`selectableGroup()` 可把 Column / Row 标记成屏幕阅读器可识别的一组可选项。`toggleable(value, handler, { role })` 可让包含开关或复选框的整行都能点击，并提供无障碍语义。

## Clipping：裁剪为形状

`clip(shape)` 会裁掉形状边界之外的绘制内容。官方示例包含圆形、统一圆角、单边圆角和切角：

```tsx
import { clip } from '@expo/ui/jetpack-compose/modifiers';
import { Shapes } from '@expo/ui/jetpack-compose/modifiers';

// 圆形裁剪
<Button modifiers={[clip(Shapes.Circle)]}>Circle</Button>

// 统一圆角
<Button modifiers={[clip(Shapes.RoundedCorner(12))]}>Rounded</Button>
// 单独设置角的半径
<Button
  modifiers={[
    clip(Shapes.RoundedCorner({ topStart: 16, topEnd: 16, bottomStart: 0, bottomEnd: 0 })),
  ]}>
  Top rounded only
</Button>

// 切角
<Button modifiers={[clip(Shapes.CutCorner(8)]}>Cut corners</Button>
```

上面切角示例来自文档，原页面写法中方括号 / 括号不匹配；修正为下面可解析的 JSX：

```tsx
<Button modifiers={[clip(Shapes.CutCorner(8))]}>Cut corners</Button>
```

> 注：形状裁剪代码在官方内容里是一个组合展示片段，并未包在 React 组件函数中。

Material 形状常量完整清单：

| `Shapes` 类型 | 可用值 |
| --- | --- |
| 基础形状 | `Rectangle`、`Circle` |
| 参数化形状 | `RoundedCorner(number \| CornerRadii)`、`CutCorner(number \| CornerRadii)` |
| Material 3 形状 | `Arch`、`Boom`、`Bun`、`Clover4Leaf`、`Clover8Leaf`、`Cookie12Sided`、`Cookie4Sided`、`Cookie6Sided`、`Cookie7Sided`、`Cookie9Sided`、`Diamond`、`Fan`、`Ghostish`、`Heart`、`Oval`、`Pentagon`、`Pill`、`PixelCircle`、`PixelTriangle`、`Puffy`、`PuffyDiamond`、`Slanted`、`SoftBurst`、`Sunny`、`Triangle`、`VerySunny` |

`CornerRadii` 可传 `topStart`、`topEnd`、`bottomStart`、`bottomEnd` 单角半径；`start` / `end` 会遵循 RTL 方向。

## Utility：UI 测试标识

```tsx
import { testID } from '@expo/ui/jetpack-compose/modifiers';

<Button modifiers={[testID('submit-button')]}>Submit</Button>;
```

## API：Modifier 清单

```tsx
import {
  paddingAll,
  padding,
  size,
  fillMaxWidth,
  background,
  clickable,
  clip,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';
```

所有 modifier 工厂返回 `ModifierConfig`；下表覆盖官方 API 索引的每个方法。签名中的参数是文档导出的形态：

| API | 用途 / 关键限制 |
| --- | --- |
| `align(alignment)` | 在父容器内对齐；值见 `Alignment`。 |
| `alpha(alpha)` | 透明度 0–1。 |
| `animateContentSize(dampingRatio?, stiffness?)` | 弹簧动画过渡内容大小。 |
| `animated(targetValue, spec?)` | 创建 `$animated` 数值对象供可动画属性使用。 |
| `background(color, options?)` | 设置背景；可通过 `animationSpec` 动画过渡颜色。 |
| `blur(radius)` | 模糊半径，dp。 |
| `border(borderWidth, borderColor)` | 边框宽度 dp 和颜色。 |
| `clickable(handler, options?)` | 点击回调；可配置 indication。 |
| `clip(shape)` | 裁剪成内置 Compose `Shapes` 形状。 |
| `combinedClickable(handlers, options?)` | 短按与长按回调，可选 ripple。 |
| `createModifier(type, params?)` | 创建原始 modifier 配置对象。 |
| `defaultMinSize({ minHeight, minWidth })` | 仅当入参对应约束为 0 时应用最小尺寸。 |
| `dropShadow(shape, config?)` | 外部形状阴影；可设模糊、spread、偏移、颜色与透明度。 |
| `fillMaxHeight(fraction?)` | 占最大可用高度的 0–1 比例。 |
| `fillMaxSize(fraction?)` | 占最大可用宽高的 0–1 比例。 |
| `fillMaxWidth(fraction?)` | 占最大可用宽度的 0–1 比例。 |
| `graphicsLayer(params)` | 图层变换、透明、阴影、裁剪、相机距离及动画支持。 |
| `height(value)` | 精确高度，dp。 |
| `horizontalScroll()` | Row 等普通容器水平滚动；不是 LazyRow。 |
| `imePadding()` | 软件键盘显示时增加避让 padding。 |
| `innerShadow(shape, config?)` | 内阴影；必须把 background 放在它之前。 |
| `keyframes(params)` | 数值关键帧动画：`delayMillis`、`durationMillis`、`keyframes` 映射。 |
| `maskClip(shape)` | 仅 Carousel 子项可用，裁剪其可视 mask；要放在 background 前。 |
| `matchParentSize()` | 仅 Box 内匹配父尺寸，且不影响父级测量。 |
| `menuAnchor(type?, enabled?)` | 标记 ExposedDropdownMenuBox 的锚点；目前 type 仅 `primaryNotEditable`。 |
| `offset(x, y)` | 视觉偏移但不改变周围布局；dp。 |
| `onGloballyPositioned(handler)` | 位置变化回调，含相对窗口的 x / y / width / height，dp。 |
| `onSizeChanged(handler)` | 测量尺寸变化回调，dp。 |
| `onVisibilityChanged(handler, options?)` | 可见状态回调，可设置最短时长和可见比例。 |
| `padding(start, top, end, bottom)` | 四边内边距，dp，并遵循逻辑方向。 |
| `paddingAll(all)` | 四边同值内边距，dp。 |
| `rotate(degrees)` | 旋转角度。 |
| `selectable(selected, handler, role?)` | 可选项状态与回调，支持无障碍角色。 |
| `selectableGroup()` | 将一组选择项报告给屏幕阅读器。 |
| `semantics({ contentType })` | 通过 Compose semantics 添加语义属性。 |
| `shadow(elevation)` | Compose elevation 阴影，dp。 |
| `size(width, height)` | 精确宽高，dp。 |
| `snap(params?)` | 立即跳变动画规格，可设延迟。 |
| `spring(params?)` | 弹簧动画规格，可设阻尼、刚度、可见阈值。 |
| `testID(tag)` | 设置 UI 测试标识。 |
| `toggleable(value, handler, options?)` | 整行切换操作与语义角色。 |
| `tween(params?)` | 补间动画，可设延迟、时长与 easing。 |
| `verticalScroll()` | Column 等普通容器纵向滚动；不是 LazyColumn。 |
| `weight(weight)` | Row / Column 中按比例分配兄弟元素剩余空间。 |
| `width(value)` | 精确宽度，dp。 |
| `wrapContentHeight(alignment?)` | 高度包住内容；可 top / bottom / centerVertically 对齐。 |
| `wrapContentWidth(alignment?)` | 宽度包住内容；可 start / end / centerHorizontally 对齐。 |
| `zIndex(index)` | 控制重叠元素的绘制次序。 |

### 动画规格参数

| 工厂 | 配置 |
| --- | --- |
| `snap({ delayMillis? })` | 可选延迟，返回 `$type: 'snap'`。 |
| `spring({ dampingRatio?, stiffness?, visibilityThreshold? })` | 弹簧阻尼、刚度和可见阈值，返回 `$type: 'spring'`。 |
| `tween({ delayMillis?, durationMillis?, easing? })` | 补间时间和 easing：`linear`、`ease`、`fastOutSlowIn`、`fastOutLinearIn`、`linearOutSlowIn`。 |
| `keyframes({ delayMillis, durationMillis, keyframes })` | 用数值时间点到目标数值的映射描述关键帧。 |

### 组合 / 事件 / 类型

- `createModifierWithEventListener(type, eventListener, params?)` 创建带事件监听的 ModifierConfig。
- `createViewModifierEventListener(modifiers)` 将 modifier 列表创建为 `GlobalEvent`。
- `ModifierConfig` 是 iOS SwiftUI 与 Android Compose 共用的 JSON config 形态；字段 `$type` 必需，`$scope` 可选。Expo 文档标明旧 `ExpoModifier`（SharedRef）已弃用，推荐 `ModifierConfig`。
- `Alignment` 的可选值为 `topStart`、`topCenter`、`topEnd`、`centerStart`、`center`、`centerEnd`、`bottomStart`、`bottomCenter`、`bottomEnd`、`top`、`centerVertically`、`bottom`、`start`、`centerHorizontally`、`end`。
- `AnimatedValue` 是 `animated()` 的返回类型；`AnimationSpec` 是 `spring` / `tween` / `snap` / `keyframes` 工厂的返回类型。
- `ShadowConfig` 字段：`alpha`（0–1）、`color`（缺省黑色）、`offsetX` / `offsetY`、`radius`、`spread`；位置和尺寸单位是 dp。

## 关键名词

- **Modifier**：对原生 Compose 节点依次应用的配置链，负责尺寸、外观、布局、交互等。
- **`ModifierConfig`**：Expo UI 使用的跨 JS / 原生 JSON 描述对象，以 `$type` 指明具体 modifier。
- **Modifier 顺序**：每个 modifier 在数组里的相对先后会影响布局、绘制和裁剪，例如 background 与 padding / shadow 的层次。
- **约束 / Constraints**：父布局传给子视图的最大 / 最小尺寸范围。`fillMax*` 是在这些范围内填充，不是无条件读取屏幕尺寸。
- **dp**：Android 密度无关像素。多数 Compose 宽高、间距、阴影半径用 dp。
- **LTR / RTL**：从左到右 / 从右到左的文字方向；start 和 end 是逻辑方向，不是永远固定的左、右。
- **elevation**：Material 视觉高度；Compose 可据此绘制阴影。`shadow()` 与自定义 `dropShadow()` 是不同 API。
- **ripple / indication**：点击时的原生触摸反馈。关闭 indication 会取消这类视觉反馈。
- **Semantics**：给无障碍服务的控件角色、状态和可读信息；可选分组应一起使用 `selectableGroup()` / `selectable()`。
- **Carousel mask**：轮播容器裁切每个条目时使用的形状窗口；`maskClip()` 只适用于 Carousel 子项。
- **IME**：输入法编辑器（软键盘）；`imePadding()` 在键盘出现时为内容腾出空间。
- **关键帧 / Tween / Spring / Snap**：关键帧按时间段指定多个值；tween 在固定时长中插值；spring 模拟弹簧；snap 立即跳到目标。
- **`zIndex` / `graphicsLayer`**：前者调整重叠绘制顺序；后者控制图层变换、透明度、阴影、相机和合成策略。

## 官方代码主题覆盖

页面概览中的所有代码主题均保留：modifier 数组与顺序、padding / 固定尺寸 / 最大尺寸 / 偏移、背景 / 边框 / 两类阴影 / alpha / blur、新粗野主义和新拟态阴影、rotate / zIndex、animateContentSize、weight、matchParentSize、clickable / combinedClickable / selectable、clip shapes、testID，以及 Shapes 常量用法。API 清单另列全部 modifier 工厂、动画类型、事件订阅和相关类型；凹陷按压阴影在源页只有文字描述、没有代码示例，已如实注明。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose NavigationBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/navigationbar/)，介绍 Material 3 底部导航栏。

**翻页：**[上一页：Jetpack Compose ModalBottomSheet](./044-Jetpack-Compose-ModalBottomSheet.md) · [返回目录](./README.md) · [下一页：Jetpack Compose NavigationBar](./046-Jetpack-Compose-NavigationBar.md)
