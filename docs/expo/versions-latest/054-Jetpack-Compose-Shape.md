# 054｜Jetpack Compose Shape

**翻页：**[上一页：Jetpack Compose SegmentedButton](./053-Jetpack-Compose-SegmentedButton.md) · [目录](./README.md) · [下一页：Jetpack Compose Slider](./055-Jetpack-Compose-Slider.md)

**官方页面：**[Jetpack Compose Shape · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/shape/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.16`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/shape/)推荐 `~56.0.25`。数值 props 和 modifiers 类型在两版之间有变化：Latest 文档把 `cornerRounding` / `radius` 描述为按形状较短边缩放的比例值，SDK 56 例子常用 dp 数字，且 API 类型称 modifiers 为 `ExpoModifier[]`。请使用与你项目 SDK 匹配的写法。

## 用原生组件绘制几何形状

`Shape` 提供星形、圆形、矩形、胶囊形、圆角矩形和多边形等 Compose 子组件。它不是 React Native `View` 的 border radius 设置方式，而是一个实际绘制所选几何形状的 Expo UI 组件。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 常用形状

下面绘制星形、圆形、矩形和 Pill 形，分别设置颜色与尺寸：

```tsx
import { Host, Shape, Row } from '@expo/ui/jetpack-compose';
import { size } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicShapesExample() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Row
        horizontalArrangement={{ spacedBy: 16 }}
        verticalAlignment="center">
        <Shape.Star
          radius={1}
          innerRadius={0.5}
          color="#FFD700"
          modifiers={[size(80, 80)]}
        />
        <Shape.Circle
          radius={1}
          color="#4285F4"
          modifiers={[size(80, 80)]}
        />
        <Shape.Rectangle
          color="#34A853"
          modifiers={[size(80, 80)]}
        />
        <Shape.Pill color="#EA4335" modifiers={[size(100, 50)]} />
      </Row>
    </Host>
  );
}
```

## 圆角与圆角平滑度

`cornerRounding` 决定矩形角部圆度，`smoothing` 控制折线转角如何变平滑。`Shape.RoundedCorner` 可分别设定四个逻辑角的半径：

```tsx
import { Host, Shape, Row } from '@expo/ui/jetpack-compose';
import { size } from '@expo/ui/jetpack-compose/modifiers';

export default function RoundedShapesExample() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Row
        horizontalArrangement={{ spacedBy: 16 }}
        verticalAlignment="center">
        <Shape.Rectangle
          cornerRounding={0.2}
          smoothing={0.5}
          color="#9C27B0"
          modifiers={[size(100, 80)]}
        />
        <Shape.RoundedCorner
          cornerRadii={{
            topStart: 20,
            topEnd: 20,
            bottomStart: 0,
            bottomEnd: 0,
          }}
          color="#FF5722"
          modifiers={[size(100, 80)]}
        />
      </Row>
    </Host>
  );
}
```

示例把逻辑 `topStart` / `topEnd` 两个上角设为 20 dp、下角设为 0，适用于卡片上半部圆角、下半部直角的样式。LTR / RTL 语言的 start / end 方向会跟随阅读方向。

## 多边形和星形

`verticesCount` 决定几何顶点数，`innerRadius` 调节星形凹入程度：

```tsx
import { Host, Shape, Row } from '@expo/ui/jetpack-compose';
import { size } from '@expo/ui/jetpack-compose/modifiers';

export default function PolygonShapesExample() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Row
        horizontalArrangement={{ spacedBy: 16 }}
        verticalAlignment="center">
        <Shape.Polygon
          verticesCount={6}
          cornerRounding={0.05}
          color="#00BCD4"
          modifiers={[size(80, 80)]}
        />
        <Shape.Star
          verticesCount={8}
          radius={1}
          innerRadius={0.4}
          cornerRounding={0.025}
          color="#FF9800"
          modifiers={[size(80, 80)]}
        />
        <Shape.PillStar
          verticesCount={6}
          innerRadius={0.5}
          color="#E91E63"
          modifiers={[size(80, 80)]}
        />
      </Row>
    </Host>
  );
}
```

## API：形状与 props

```tsx
import { Shape } from '@expo/ui/jetpack-compose';
```

`Shape` 提供以下子组件：`Circle`、`Pill`、`PillStar`、`Polygon`、`Rectangle`、`RoundedCorner`、`Star`。具体子组件只接受其形状支持的 `ShapeProps` 子集。

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `color` | `ColorValue`，可选 | 形状填充颜色。 |
| `cornerRadii` | `CornerRadii`，可选 | RoundedCorner 四角半径，单位 dp。 |
| `cornerRounding` | `number`，默认 0 | 每个顶点的圆角比例；Latest 按视图较短边缩放成圆角尺寸。 |
| `innerRadius` | `number`，默认 1 | Star / PillStar 内侧半径比例，按较短边缩放。值越小，星形内凹越深。 |
| `modifiers` | Latest `ModifierConfig[]`；SDK 56 `ExpoModifier[]` | 控制尺寸和布局。 |
| `radius` | `number`，默认 1 | Circle 半径 / 星形外半径比例，按较短边缩放。 |
| `smoothing` | `number`，默认 0 | 0–1 的平滑程度。 |
| `verticesCount` | `number`，默认 6 | Polygon 至少 3；Star / PillStar 表示每种半径对应的顶点数，5 角星总顶点为 10。 |

`CornerRadii` 的四个可选字段为 `topStart`、`topEnd`、`bottomStart`、`bottomEnd`，单位 dp。`Shape.parseJSXShape(shape)` 接收 ShapeJSXElement 并返回 ShapeRecordProps；传可选参数时也可能返回 `undefined`。`ShapeJSXElement` 是带内部 `__expo_shape_jsx_element_marker: true` 标记的 React element 类型。

## 关键名词

- **Shape 子组件**：在 React JSX 中用 `Shape.Circle`、`Shape.Star` 等表达绘制类型；不是 CSS `border-radius`。
- **顶点 / Vertex**：多边形的角点。多边形有 n 个顶点；星形将外半径点和内半径点交错，因此点数加倍。
- **外半径 / 内半径**：外半径决定形状最外沿，内半径决定星形凹角离中心多远。
- **圆角比例 / `cornerRounding`**：Latest 版本里按矩形短边的比例计算圆角，不是直接传 dp；SDK 56 示例显示不同的旧数值写法，不能跨版本照抄数值。
- **圆角平滑 / `smoothing`**：把尖角过渡得更柔和；范围 0–1。
- **`CornerRadii`**：逐个定义 Shape.RoundedCorner 的四角大小。Start / End 是逻辑方向，可以适配 RTL。
- **dp 与比例参数**：`size(80, 80)` 的 80 是 dp；最新 API 描述 `radius`、`innerRadius`、`cornerRounding` 会根据组件短边换算。
- **`Shape.parseJSXShape`**：把 Shape JSX element 解析为原生记录结构的 API；普通绘制场景通常不需直接调用。

## 官方代码主题覆盖

保留安装命令及官方三个示例：基础四种 shape、圆角矩形与单独配置上侧角、多边形和两种星形。API 包括七个 Shape 子组件、颜色、圆角半径、比例圆角、星形半径、modifiers、平滑度、顶点数量、parseJSXShape overload 与 CornerRadii 类型。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Slider](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/slider/)，介绍连续或离散数值选择滑块。

**翻页：**[上一页：Jetpack Compose SegmentedButton](./053-Jetpack-Compose-SegmentedButton.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Slider](./055-Jetpack-Compose-Slider.md)
