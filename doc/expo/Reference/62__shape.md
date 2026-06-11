# Shape：在 Expo UI 中绘制 Jetpack Compose 几何图形

> 文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档版本：面向下一个 Expo SDK 版本的未发布文档；当前稳定版本为 SDK 56。

## 文档解决的问题

`Shape` 是 `@expo/ui` 提供的 Jetpack Compose 组件集合，用于在 React Native / Expo 应用的 Android 界面中绘制几何图形，包括：

- 圆形
- 矩形
- 胶囊形
- 星形
- 胶囊星形
- 多边形
- 可分别设置四个圆角的图形

它解决的是“通过声明式 JSX 创建 Android 原生几何图形”的问题。开发者不需要直接编写 Kotlin 或 Jetpack Compose 代码，可以通过 React 组件和属性控制图形的尺寸、颜色、顶点、圆角和平滑程度。

这篇文档适合以下场景：

- 在 Android 界面中绘制装饰性图形。
- 制作徽章、色块、头像背景或状态标识。
- 创建星级、评分、标签等几何 UI。
- 需要多边形或可配置星形，而不想自行使用 Canvas 绘制。
- 已经使用 `@expo/ui/jetpack-compose` 构建 Android 原生界面。

它不是跨平台 SVG 或 Canvas 教程。文档明确标注所有 API 只支持 Android。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 官方的声明式 UI 框架。对于 React Web 开发者，可以将它大致理解为 Android 原生领域中的声明式组件系统：

- React 使用 JSX 描述 DOM 或组件树。
- Jetpack Compose 使用 Kotlin 函数描述 Android 原生界面。
- `@expo/ui/jetpack-compose` 允许开发者通过 React JSX 使用其中一部分原生组件。

虽然代码看起来仍然是 React 组件，但最终渲染的不是浏览器 DOM，而是 Android 原生界面。

### `Shape` 不是 CSS `shape`

`Shape.Rectangle`、`Shape.Circle` 等都是 React 组件，不是 CSS 类，也不是 `border-radius`、`clip-path` 或 SVG 元素。

它们的尺寸和布局通过 Jetpack Compose modifier 控制，而不是通过 CSS：

```tsx
modifiers={[size(80, 80)]}
```

对于 React Web 开发者，可以把 modifier 暂时理解为“用于配置原生组件布局和外观的一组声明式操作”。它和 `style={{ width: 80, height: 80 }}` 作用相似，但 API 模型并不相同。

### dp 是什么

`CornerRadii` 中的圆角值以 `dp` 为单位。

`dp` 是 Android 的密度无关像素，用于让同一个尺寸在不同屏幕密度下保持近似一致的视觉大小。它与 Web CSS 像素有相似用途，但不是浏览器中的物理像素。

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

`expo install` 会按照当前 Expo SDK 版本选择兼容的依赖版本。这里安装的是整个 `@expo/ui` 包，而不是单独的 `Shape` 包。

如果是在已有的纯 React Native 工程中使用，还需要先安装并配置 Expo Modules 所需的 `expo` 包。文档没有展开具体原生工程配置步骤，只提供了对应安装指南的链接。

当前文档未涉及：

- iOS 安装或实现方式。
- Android Studio、Gradle 或 Kotlin 配置。
- Web 平台配置。
- 手动链接原生模块的步骤。
- 图形组件是否支持旧版 React Native 架构。

## 基本用法

需要从 Jetpack Compose 入口导入组件：

```tsx
import { Host, Shape, Row } from '@expo/ui/jetpack-compose';
import { size } from '@expo/ui/jetpack-compose/modifiers';
```

一个基本示例：

```tsx
export default function BasicShapesExample() {
  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 16 }} verticalAlignment="center">
        <Shape.Star color="#FFD700" modifiers={[size(80, 80)]} />
        <Shape.Circle radius={40} color="#4285F4" modifiers={[size(80, 80)]} />
        <Shape.Rectangle color="#34A853" modifiers={[size(80, 80)]} />
        <Shape.Pill color="#EA4335" modifiers={[size(100, 50)]} />
      </Row>
    </Host>
  );
}
```

组件关系如下：

- `Host`：承载 Jetpack Compose 原生内容。
- `matchContents`：让 `Host` 的大小匹配内部内容。
- `Row`：以横向布局排列子组件，类似 Web 中的横向 Flex 容器。
- `horizontalArrangement={{ spacedBy: 16 }}`：子元素之间保留 16 的间距。
- `verticalAlignment="center"`：让子元素在交叉轴方向居中。
- `size(width, height)`：通过 modifier 设置图形占用的宽高。
- `color`：设置图形颜色。

`Shape` 本身是多个子组件的集合，实际使用时应选择具体图形，例如 `Shape.Circle`，而不是直接渲染 `<Shape />`。

## 支持的图形

| 组件 | 用途 | 主要可配置属性 |
| --- | --- | --- |
| `Shape.Circle` | 圆形 | `radius`、`verticesCount`、`color`、`modifiers` |
| `Shape.Rectangle` | 矩形或圆角矩形 | `cornerRounding`、`smoothing`、`color`、`modifiers` |
| `Shape.Pill` | 胶囊形 | `smoothing`、`color`、`modifiers` |
| `Shape.RoundedCorner` | 四角可分别配置的图形 | `cornerRadii`、`color`、`modifiers` |
| `Shape.Polygon` | 多边形 | `verticesCount`、`cornerRounding`、`smoothing`、`color`、`modifiers` |
| `Shape.Star` | 星形 | 完整的 `ShapeProps` |
| `Shape.PillStar` | 胶囊化的星形 | 完整的 `ShapeProps` |

不同子组件只接受与自身几何结构相关的属性。例如，`Rectangle` 不接受 `innerRadius`，而星形组件可以通过 `innerRadius` 控制内外半径关系。

## 圆角与平滑

### `cornerRounding`

```tsx
<Shape.Rectangle
  cornerRounding={16}
  smoothing={0.5}
  color="#9C27B0"
  modifiers={[size(100, 80)]}
/>
```

`cornerRounding` 的默认值是 `0.0`。文档将其描述为“圆角百分比”，并说明该值会乘以视图较短的一边，得到最终像素值。

因此，它与 Web 中直接设置固定长度的 `border-radius: 16px` 不完全相同：最终圆角大小会受到组件尺寸影响。

> **文档表述需要注意：** 示例使用了 `cornerRounding={16}`，但 API 又将其称为“百分比”，没有进一步说明正常取值范围或是否应转换为小数。实际项目中不应仅凭“百分比”一词假定取值必须在 `0` 到 `1` 之间，应以当前 SDK 的运行效果和类型实现为准。

### `smoothing`

`smoothing` 控制顶点之间线条的平滑程度：

- 类型：`number`
- 默认值：`0.0`
- 有效范围：`0.0` 到 `1.0`
- 越接近 `0`，顶点和线段越直接。
- 越接近 `1`，顶点之间的过渡越平滑。

它不是模糊滤镜，也不是抗锯齿开关，而是改变图形轮廓的几何过渡。

### `cornerRadii`

`Shape.RoundedCorner` 可以分别设置四个角：

```tsx
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
```

`CornerRadii` 包含以下可选属性：

| 属性 | 含义 | 单位 |
| --- | --- | --- |
| `topStart` | 顶部起始侧圆角 | dp |
| `topEnd` | 顶部结束侧圆角 | dp |
| `bottomStart` | 底部起始侧圆角 | dp |
| `bottomEnd` | 底部结束侧圆角 | dp |

这里使用 `Start` 和 `End`，而不是固定的 `Left` 和 `Right`。这通常是为了适配从左到右和从右到左的布局方向。

> **基于文档内容推导：** 在常见的从左到右布局中，`topStart` 通常对应左上角，`topEnd` 通常对应右上角；在 RTL 布局中两者可能交换。文档没有进一步说明 RTL 行为。

## 多边形与星形

### 多边形

```tsx
<Shape.Polygon
  verticesCount={6}
  cornerRounding={4}
  color="#00BCD4"
  modifiers={[size(80, 80)]}
/>
```

`verticesCount` 表示顶点数量：

- 默认值为 `6.0`。
- 对 `Polygon` 来说，必须至少为 `3.0`。
- `verticesCount={6}` 表示六边形。

虽然 API 类型为 `number`，顶点数量在几何意义上应当是整数。

> **基于经验建议：** 应传入大于或等于 `3` 的整数，不要依赖组件处理小数顶点或非法值。文档没有说明非法值会报错、截断还是回退。

### 星形

```tsx
<Shape.Star
  verticesCount={8}
  innerRadius={0.4}
  cornerRounding={2}
  color="#FF9800"
  modifiers={[size(80, 80)]}
/>
```

星形在内、外两个半径之间交替生成顶点。

对于 `Star` 和 `PillStar`：

- `verticesCount` 表示每一个半径上的顶点数量。
- 一个五角星实际上有 10 个轮廓顶点，即 5 个外顶点和 5 个内顶点。
- `innerRadius` 控制内半径。
- `innerRadius` 默认值为 `1.0`。
- 文档说明它会乘以视图较短的一边，得到最终像素值。

`innerRadius` 越小，星形凹陷通常越明显；越接近外半径，轮廓通常越接近普通多边形。

最后一句是**基于文档内容推导**的几何效果，文档没有直接描述不同数值对应的视觉结果。

`PillStar` 使用方式与 `Star` 类似：

```tsx
<Shape.PillStar
  verticesCount={6}
  innerRadius={0.5}
  color="#E91E63"
  modifiers={[size(80, 80)]}
/>
```

文档没有进一步解释 `PillStar` 与 `Star` 的具体轮廓算法差异。

## 属性参考

### `color`

```ts
color?: ColorValue
```

设置图形颜色，类型采用 React Native 的 `ColorValue`。

文档示例使用十六进制颜色：

```tsx
color="#4285F4"
```

当前文档没有列举其他颜色格式，也没有说明默认颜色、透明度或渐变支持情况。

### `modifiers`

```ts
modifiers?: ExpoModifier[]
```

用于设置组件的布局或其他 Jetpack Compose 行为。因为它是数组，可以组合多个 modifier。

本文只演示了：

```tsx
modifiers={[size(80, 80)]}
```

其他 modifier 的种类、执行顺序和组合规则不在当前文档范围内。

### `radius`

```ts
radius?: number
```

- 仅用于 `Shape.Circle`。
- 默认值为 `1.0`。
- 文档说明该值会乘以视图较短的一边，得到像素值。

示例同时使用了：

```tsx
<Shape.Circle radius={40} modifiers={[size(80, 80)]} />
```

这里存在需要谨慎对待的文档歧义：如果严格按照“乘以较短边”理解，`40` 会产生远大于组件尺寸的结果，但示例显然意在绘制直径 80、半径 40 的圆。当前文档没有解释该差异。

实际开发时应针对所用 SDK 验证 `radius` 的真实单位和换算方式，不要直接把它等同于 CSS 像素、dp 或 `0` 到 `1` 的比例。

### 属性默认值汇总

| 属性 | 默认值 | 限制或含义 |
| --- | --- | --- |
| `cornerRounding` | `0.0` | 按较短边计算圆角；文档未明确推荐范围 |
| `innerRadius` | `1.0` | 星形相关组件的内半径 |
| `radius` | `1.0` | 圆形半径 |
| `smoothing` | `0.0` | 必须在 `0.0` 到 `1.0` 之间 |
| `verticesCount` | `6.0` | 多边形至少需要 3 个顶点 |

## `Shape.parseJSXShape`

文档提供了两个重载。

传入必选图形：

```ts
Shape.parseJSXShape(shape: ShapeJSXElement): ShapeRecordProps
```

传入可选图形：

```ts
Shape.parseJSXShape(
  shape?: ShapeJSXElement
): ShapeRecordProps | undefined
```

该方法将一个 `ShapeJSXElement` 转换成 `ShapeRecordProps`。当输入允许为 `undefined` 时，返回值也可能是 `undefined`。

当前文档没有说明：

- 哪些业务场景需要开发者直接调用它。
- `ShapeRecordProps` 的字段结构。
- 该方法是否主要用于其他 Expo UI 组件内部解析 Shape。
- 解析失败时是否抛出异常。

因此，仅根据当前页面，不能确定普通图形渲染是否需要它。本文所有使用示例都没有调用该方法。

## `ShapeJSXElement`

`ShapeJSXElement` 的基础类型是：

```ts
React.ReactElement<NativeShapeProps>
```

它还带有一个标记属性：

```ts
__expo_shape_jsx_element_marker: true
```

这个标记使 Expo UI 能够识别“这是一个合法的 Shape JSX 元素”。

> **基于文档内容推导：** 该标记可能供 `parseJSXShape` 或其他原生桥接逻辑识别图形类型。应用代码不应手动构造或修改这个内部标记。文档没有明确解释它的具体实现用途。

## React Web 开发者容易误解的地方

### 1. 组件只支持 Android

虽然代码使用 React 和 JSX，但它不是自动跨平台的 React 组件。文档中所有组件、属性、方法和类型都标记为 Android。

如果同一业务页面还要支持 iOS 或 Web，需要另外设计平台分支或替代实现。文档未提供跨平台降级方案。

### 2. 不能使用 CSS 控制尺寸

这里没有 DOM，也没有 CSS 盒模型。尺寸通过 modifier 设置：

```tsx
modifiers={[size(100, 80)]}
```

不能假定 `className`、CSS Modules、Tailwind Web 类名或浏览器开发者工具可以直接作用于这些组件。

### 3. `RoundedCorner` 中的 Start/End 不是 Left/Right

`Start` 和 `End` 是逻辑方向，可能随界面语言方向变化。不要把它们永久理解为左侧和右侧。

### 4. 属性名相似，但单位并不统一

- `cornerRadii` 明确使用 dp。
- `smoothing` 明确是 `0.0` 到 `1.0`。
- `radius`、`innerRadius` 和 `cornerRounding` 被描述为基于视图较短边换算。
- 示例中的部分数值与 API 描述之间存在歧义。

不要因为它们的 TypeScript 类型都是 `number`，就认为所有数值都使用同一种单位。

### 5. 图形尺寸与图形几何参数是两层配置

```tsx
<Shape.Star
  innerRadius={0.4}
  modifiers={[size(80, 80)]}
/>
```

其中：

- `size(80, 80)` 决定组件可用的布局空间。
- `innerRadius` 决定该空间内部的星形几何结构。

这类似于 Web 中先确定 SVG 视口尺寸，再设置路径参数，但这里使用的是 Expo UI 对 Jetpack Compose 的封装。

## 限制与使用注意事项

1. **版本状态**：当前页面属于下一个 SDK 版本的未发布文档，不应假定 API 已在 SDK 56 中完全一致或可用。
2. **平台限制**：仅支持 Android；文档没有说明 iOS 或 Web 实现。
3. **尺寸依赖**：多个几何参数依赖视图的较短边，因此修改 modifier 尺寸可能同时改变图形轮廓。
4. **参数约束**：`smoothing` 必须位于 `0.0` 到 `1.0`；多边形顶点数至少为 3。
5. **单位歧义**：`radius` 和部分圆角参数的文字说明与示例不完全容易对应，接入前需要在目标 SDK 上验证。
6. **API 覆盖不同**：并非每种 Shape 都接受所有属性，应根据子组件的 TypeScript 类型传参。
7. **错误处理未说明**：文档没有描述非法参数、超大圆角、负数或解析失败时的行为。
8. **性能未说明**：文档没有提供大量图形、动画图形或频繁更新参数时的性能说明。
9. **交互未说明**：本文只讨论绘制，没有介绍点击、手势、无障碍语义或焦点处理。
10. **动画未说明**：文档没有说明这些几何参数是否可以动画化。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将 `Shape` 用于 Android 专属界面，或者在跨平台组件中明确提供 iOS/Web 替代实现。
- 优先通过 `size` 明确设置组件尺寸，避免依赖未说明的默认布局大小。
- 将 `verticesCount` 限制为符合几何意义的整数。
- 对来自用户输入或服务端配置的 `smoothing`、顶点数和半径参数进行范围校验。
- 在升级 Expo SDK 后进行视觉回归测试，尤其检查星形内半径、圆形半径和圆角效果。
- 如果需要动画、渐变、复杂路径或精确的跨平台一致性，应先确认 `Shape` 是否满足要求，再评估 SVG、Canvas 或平台专用绘制方案。
- 不要在业务代码中依赖 `ShapeJSXElement` 的标记字段；它更像框架识别 JSX 元素所需的实现细节。

## 明确内容与推导内容

### 文档明确说明

- `Shape` 与 Jetpack Compose 官方 Shapes API 对应。
- 可以绘制星形、圆形、矩形、胶囊形和多边形等图形。
- 包名为 `@expo/ui`。
- 支持 Android，并包含在 Expo Go 中。
- 提供七种 Shape 子组件。
- `smoothing` 的范围是 `0.0` 到 `1.0`。
- 多边形至少需要三个顶点。
- 五角星具有十个轮廓顶点。
- `CornerRadii` 的值使用 dp。
- 当前页面针对下一个 SDK 版本，而稳定文档对应 SDK 56。

### 基于文档内容推导

- `Shape` 适合避免直接编写 Kotlin/Compose 几何绘制代码。
- `Start` 和 `End` 可能随 RTL 布局方向交换。
- `innerRadius` 越小，星形通常会产生更明显的凹陷。
- `ShapeJSXElement` 的标记可能用于解析或原生桥接识别。
- 修改组件较短边可能影响多个相对几何参数的最终效果。

这些推导用于帮助理解开发影响，不代表原文对具体实现作出了完整保证。

## 总结

`@expo/ui/jetpack-compose` 的 `Shape` 提供了一套 Android 原生几何图形组件。基本使用流程是：

1. 安装 `@expo/ui`。
2. 从 `@expo/ui/jetpack-compose` 导入 `Host`、`Shape` 和布局组件。
3. 使用 `Shape.Circle`、`Shape.Polygon` 等具体子组件。
4. 通过 modifier 设置布局尺寸。
5. 通过 `verticesCount`、`innerRadius`、`cornerRounding` 和 `smoothing` 调整几何结构。

接入时最需要关注三个问题：它仅支持 Android、数值属性的单位并不统一，以及当前页面属于下一 SDK 版本文档。特别是 `radius` 和圆角参数的描述存在一定歧义，应以目标 Expo SDK 的实际行为为准。

---

## 文档导航

- **上一页**：[segmentedbutton](./61__segmentedbutton.md)
- **下一页**：[slider](./63__slider.md)
