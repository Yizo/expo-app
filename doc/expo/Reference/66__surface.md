# Surface：Jetpack Compose 风格的内容容器

`Surface` 是 `@expo/ui` 提供的 Android UI 组件，用于创建符合 Material Design 设计体系的内容容器。它可以统一处理容器的背景颜色、形状裁剪、边框、层级效果以及子内容颜色。

> **版本提示**
>
> 本文档对应的是**下一个 Expo SDK 版本**，不是当前稳定版本。原文指出，当前最新稳定文档对应 **SDK 56**。使用本文 API 前，应确认项目所用 Expo SDK 是否支持这些属性。

## 文档解决的问题

这篇文档主要说明：

- 如何安装提供 `Surface` 的 `@expo/ui` 包。
- 如何在 Expo/React Native 项目中使用 Jetpack Compose 版本的 `Surface`。
- 如何控制容器的内边距、颜色、形状、边框和视觉层级。
- 如何通过属性使容器具备点击、选择或开关切换能力。
- `Surface` 支持的平台、属性类型、默认值和组合规则。

它适合以下场景：

- 在 Android 界面中创建具有 Material Design 外观的内容区域。
- 实现卡片、面板、设置项、可选择选项或可切换区域。
- 需要圆角裁剪、边框或层级效果的容器。
- 希望通过 Expo UI 使用 Android Jetpack Compose 原生组件。

## 阅读前需要理解的背景

### Expo UI 与 Jetpack Compose

**Jetpack Compose** 是 Android 的声明式 UI 框架。对于 React Web 开发者，可以将它理解为 Android 原生领域中一种类似 React 的 UI 描述方式：界面由组件及其状态组合而成。

`@expo/ui/jetpack-compose` 对 Jetpack Compose 组件进行了封装，使 React Native/Expo 代码可以通过 JSX 使用这些 Android 原生组件。

`Surface` 对齐官方 Jetpack Compose `Surface` API，但这不表示它是 Web DOM 元素，也不表示它可以跨平台工作。

### `Surface` 与 Web 容器的区别

从用途上看，`Surface` 有点像经过设计系统封装的 `<div>`：

```tsx
<Surface>
  <Text>内容</Text>
</Surface>
```

但两者并不等价：

- `<div>` 是浏览器 DOM 元素。
- `Surface` 最终对应 Android 原生 UI。
- `Surface` 的尺寸单位使用 Android 的 `dp`，不是 CSS `px`。
- 样式通过组件属性和 Compose modifiers 设置，而不是通过 CSS。
- 它内置了 Material Design 的颜色和层级语义。
- 当前文档明确标注它只支持 Android。

### Material Design Surface

Material Design 中的“surface”表示承载内容的视觉平面，例如卡片、面板或对话框区域。

文档明确说明，`Surface` 负责：

1. 按指定形状裁剪内容。
2. 根据 tonal elevation 应用背景颜色。
3. 向子内容提供 content color。

## 安装

根据项目使用的包管理器执行对应命令：

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

`expo install` 会按照项目的 Expo SDK 版本选择兼容的依赖版本。它不是普通的 `npm install` 命令。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，还需要先将 `expo` 和 Expo Modules 支持安装到项目中。当前文档只指出了这项前置要求，没有展开原生工程的具体配置步骤。

## 基础用法

```tsx
import { Host, Surface, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicSurfaceExample() {
  return (
    <Host matchContents>
      <Surface modifiers={[paddingAll(16)]}>
        <Text>Content on a surface</Text>
      </Surface>
    </Host>
  );
}
```

这里包含三个重要部分：

- `Host`：承载 Jetpack Compose UI 的宿主组件。
- `Surface`：提供 Material Design 表面样式的容器。
- `modifiers`：Compose 风格的组件修饰配置数组。

`paddingAll(16)` 给 `Surface` 设置四周内边距。对于 React Web 开发者，可以近似理解为：

```css
padding: 16px;
```

但这里只是概念类比，实际单位和渲染系统不同。Compose 中相关尺寸使用 Android 的 `dp`。

`Host` 的 `matchContents` 表示宿主区域匹配其内容尺寸。当前文档使用了这个属性，但没有进一步定义其完整行为。

## 控制视觉层级

```tsx
<Surface
  tonalElevation={1}
  shadowElevation={2}
  modifiers={[paddingAll(16)]}>
  <Text>Low elevation</Text>
</Surface>
```

`Surface` 提供两种不同的 elevation：

### `tonalElevation`

`tonalElevation` 根据 Material 主题配色改变表面的背景色，用颜色变化表达层级。

- 类型：`number`
- 默认值：`0`
- 单位：`dp`

它不是普通阴影。即使没有明显投影，表面颜色也可能因为 tonal elevation 而变化。

### `shadowElevation`

`shadowElevation` 控制表面的阴影高度。

- 类型：`number`
- 默认值：`0`
- 单位：`dp`

可以将它近似理解为 Web 中的 `box-shadow` 层级，但二者并不存在直接的数值换算关系。

```tsx
<Surface tonalElevation={4} shadowElevation={8}>
  <Text>High elevation</Text>
</Surface>
```

数值较大表示更明显的视觉层级。两个属性可以独立配置，也可以组合使用。

## 自定义颜色

```tsx
<Surface
  color="#1E3A5F"
  contentColor="#FFFFFF"
  tonalElevation={2}
  modifiers={[paddingAll(16)]}>
  <Text color="#FFFFFF">Custom colored surface</Text>
</Surface>
```

### `color`

设置表面背景颜色。

- 类型：React Native `ColorValue`
- 默认值：`MaterialTheme.colorScheme.surface`

如果不传入，颜色来自当前 Material 主题。

### `contentColor`

设置表面内部内容所使用的语义颜色。

- 类型：React Native `ColorValue`
- 默认值：`contentColorFor(color)`

`contentColorFor(color)` 会根据表面颜色选择对应的内容颜色。

文档示例同时设置了：

```tsx
contentColor="#FFFFFF"
```

和：

```tsx
<Text color="#FFFFFF">
```

**基于文档内容推导：** `Surface` 会提供 content color，但具体子组件是否自动使用该颜色，取决于子组件是否读取这项上下文。示例显式设置了 `Text` 的颜色，因此在需要确定文本颜色时，不应仅凭该示例假设所有子组件都会自动继承。

这与 Web CSS 的 `color` 继承机制不能直接画等号。

## 自定义形状和边框

```tsx
<Surface
  shape={Shape.RoundedCorner({
    cornerRadii: {
      topStart: 16,
      topEnd: 16,
      bottomStart: 16,
      bottomEnd: 16,
    },
  })}
  border={{ width: 2, color: '#6200EE' }}
  modifiers={[paddingAll(16)]}>
  <Text>Rounded surface with border</Text>
</Surface>
```

### `shape`

`shape` 用来定义并裁剪 `Surface` 的形状。

示例通过 `Shape.RoundedCorner` 分别设置四个角：

- `topStart`
- `topEnd`
- `bottomStart`
- `bottomEnd`

`start` 和 `end` 是适应文字方向的逻辑方位，不应简单地永远理解为左和右。

与 Web 中的 `border-radius` 相比，`shape` 不只是绘制圆角，还负责将内部内容裁剪到该形状中。

### `border`

`border` 用于在表面周围绘制描边，其类型是 `SurfaceBorder`：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `color` | `ColorValue` | `MaterialTheme.colorScheme.outline` | 边框颜色 |
| `width` | `number` | `1` | 边框宽度，单位为 `dp` |

`border` 自身是可选属性，其中的 `color` 和 `width` 也都是可选的。

## 交互模式

除了作为纯展示容器，`Surface` 还可以根据属性组合切换为不同的交互变体。

### 可点击 Surface

```tsx
<Surface onClick={() => {}}>
  <Text>Clickable surface</Text>
</Surface>
```

提供 `onClick` 后，表面会变为可点击组件。

### 可选择 Surface

`selected` 与 `onClick` 一起使用时，表面会变为 selectable variant：

```tsx
<Surface selected={selected} onClick={handleClick}>
  <Text>Selectable surface</Text>
</Surface>
```

- `selected` 表示当前是否选中。
- `onClick` 负责响应点击。
- 该变体会在视觉上反映选择状态。

仅设置 `selected` 不满足文档所述的完整可选择组合。

### 可切换 Surface

`checked` 与 `onCheckedChange` 一起使用时，表面会变为 toggleable variant：

```tsx
<Surface
  checked={checked}
  onCheckedChange={setChecked}>
  <Text>Toggleable surface</Text>
</Surface>
```

- `checked`：当前开关状态。
- `onCheckedChange`：状态变化时调用，接收新的布尔值。

这类似 React 中的受控组件：状态值由外部传入，回调通知外部更新状态。

### `enabled`

```tsx
<Surface enabled={false} onClick={handleClick}>
  <Text>Disabled surface</Text>
</Surface>
```

`enabled` 控制表面是否启用以及是否响应用户交互。

- 类型：`boolean`
- 默认值：`true`

文档没有说明禁用状态的具体视觉表现。

## API 汇总

导入方式：

```tsx
import { Surface } from '@expo/ui/jetpack-compose';
```

组件返回类型为 React 元素，属性类型为 `SurfaceProps`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `border` | `SurfaceBorder` | 未说明 | 表面边框 |
| `checked` | `boolean` | 未说明 | 可切换表面的当前状态 |
| `children` | `React.ReactNode` | 未说明 | 表面内部内容 |
| `color` | `ColorValue` | Material 主题的 `surface` 色 | 背景颜色 |
| `contentColor` | `ColorValue` | `contentColorFor(color)` | 提供给内部内容的颜色 |
| `enabled` | `boolean` | `true` | 是否响应交互 |
| `modifiers` | `ModifierConfig[]` | 未说明 | Compose 修饰配置 |
| `onCheckedChange` | `(checked: boolean) => void` | 未说明 | 切换状态变化回调 |
| `onClick` | `() => void` | 未说明 | 点击回调 |
| `selected` | `boolean` | 未说明 | 当前是否处于选中状态 |
| `shadowElevation` | `number` | `0` | 阴影层级，单位为 `dp` |
| `shape` | `ShapeJSXElement` | 未说明 | 表面形状及裁剪配置 |
| `tonalElevation` | `number` | `0` | 影响背景色的色调层级，单位为 `dp` |

所有属性和 `SurfaceBorder` 均只标注支持 Android。

## React Web 开发者容易误解的地方

### 1. 这不是跨平台的通用 React 容器

文档明确标注 `Surface` 只支持 Android。页面顶部的 “Included in Expo Go” 表示它可在 Expo Go 中使用，不表示支持 iOS 或 Web。

如果业务需要 iOS 和 Web，应单独考虑平台实现。当前文档没有提供跨平台替代方案。

### 2. `modifiers` 不是 CSS

```tsx
modifiers={[paddingAll(16)]}
```

它是 Jetpack Compose 风格的修饰配置数组，不是：

- `className`
- CSS Modules
- React Native 的 `style`
- Tailwind CSS 类名

当前文档只展示了 `paddingAll`，未列出其他 modifier 或它们的执行顺序规则。

### 3. `dp` 不等于 CSS 像素

边框宽度和 elevation 使用 `dp`。`dp` 是 Android 的密度无关单位，用于在不同屏幕密度上保持接近一致的视觉尺寸。

不要将 Web 设计稿中的 `px` 数值不加判断地照搬成 `dp`。

### 4. tonal elevation 与阴影是两套机制

Web 开发者可能会把 elevation 全部理解为阴影，但这里：

- `tonalElevation` 改变背景颜色。
- `shadowElevation` 控制阴影。

只调整其中一个，不一定能得到预期的另一种效果。

### 5. 交互能力由属性组合决定

不同属性不是孤立的：

| 目标模式 | 必需组合 |
| --- | --- |
| 可点击 | `onClick` |
| 可选择 | `selected` + `onClick` |
| 可切换 | `checked` + `onCheckedChange` |

创建可选择或可切换表面时，应按组合传入相关属性。

### 6. `contentColor` 不能简单等同于 CSS 继承

文档描述的是向子内容“提供”颜色，而不是声明所有后代组件都必然自动采用该颜色。需要结合具体子组件的 API 判断。

## 限制与注意事项

1. **仅支持 Android。** API 中的组件、属性和相关类型都标注为 Android。
2. **文档面向下一个 SDK 版本。** 当前项目使用 SDK 56 或更早版本时，API 可用性可能不同，应以对应版本文档为准。
3. **已有 React Native 项目需要 Expo Modules 支持。** 仅安装 `@expo/ui` 可能不足以让非 Expo 项目运行该组件。
4. **交互属性存在组合要求。** `selected` 需要配合 `onClick`，`checked` 需要配合 `onCheckedChange`。
5. **自定义颜色会覆盖主题默认值。** 这可能影响应用主题一致性以及内容与背景之间的可读性。
6. **当前文档未涉及**无障碍属性、键盘操作、测试方式、动画效果、modifier 顺序、iOS/Web 降级方案以及复杂交互状态的冲突处理。
7. **当前文档未说明**同时传入 `onClick`、`selected`、`checked` 和 `onCheckedChange` 时采用哪一种交互变体，因此不应自行假设其优先级。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，并非原文直接给出的要求。

- **基于文档内容推导：** 将 `Surface` 用作视觉和交互语义明确的 Android 容器，而不是无差别替代所有 React Native 布局组件。
- **基于文档内容推导：** 在跨平台项目中，应将 Android 专用实现隔离到平台文件或平台组件中，避免其他平台直接加载 Android 专用 API。
- **基于经验建议：** 优先使用 Material 主题的默认 `color` 和 `contentColor`，只在设计确有需要时覆盖，以减少深色模式和主题切换问题。
- **基于经验建议：** 将 `selected` 和 `checked` 状态保存在 React state 或上层状态管理中，使组件保持可预测的受控行为。
- **基于经验建议：** 同时检查背景色、内容色和边框色的对比度，尤其是自定义 `color` 时。
- **基于经验建议：** 升级 Expo SDK 或 `@expo/ui` 后重新核对 API，因为本文属于尚未成为当前稳定版的文档。

## 明确信息与推导信息边界

### 文档明确说明

- `Surface` 对齐官方 Jetpack Compose `Surface` API。
- 它负责形状裁剪、背景色处理和 content color 提供。
- 它支持颜色、边框、形状、tonal elevation 和 shadow elevation。
- 它能根据属性组合成为 clickable、selectable 或 toggleable surface。
- 它只支持 Android，并包含在 Expo Go 中。
- 文档对应下一个 SDK 版本，最新稳定文档为 SDK 56。
- 现有 React Native 项目需要安装 Expo Modules 支持。

### 文档未明确说明

- iOS 和 Web 应使用什么替代组件。
- 所有子组件是否都会自动采用 `contentColor`。
- 多种交互属性同时存在时的优先级。
- modifier 的完整列表和顺序规则。
- 禁用、选中及切换状态的具体视觉效果。
- 无障碍、测试、性能和动画方面的行为。

这些未说明的内容不能仅根据本页作出确定结论。

## 总结

`Surface` 是 Expo UI 中面向 Android Jetpack Compose 的 Material Design 容器。它不仅负责承载子内容，还集中处理背景色、内容颜色、形状裁剪、边框和层级效果，并能通过属性组合获得点击、选择或切换行为。

对于 React Web 开发者，最重要的是不要把它直接当作带 CSS 的 `<div>`：它属于 Android 原生 UI，使用 Compose modifiers 和 `dp` 单位，只支持 Android，并遵循 Material Design 的主题与层级语义。

---

## 文档导航

- **上一页**：[spacer](./65__spacer.md)
- **下一页**：[switch](./67__switch.md)
