# 058｜Jetpack Compose Surface

**翻页：**[上一页：Jetpack Compose Spacer](./057-Jetpack-Compose-Spacer.md) · [目录](./README.md) · [下一页：Jetpack Compose Switch](./059-Jetpack-Compose-Switch.md)

**官方页面：**[Jetpack Compose Surface · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/surface/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/surface/)推荐 `~56.0.26`，核心属性相同。

## Material 3 的内容表面

`Surface` 是 Material Design 的内容容器，可为内部子元素提供主题背景、内容颜色、形状裁剪和高度效果。卡片、菜单和其他表面容器可以通过 tonal elevation 调整背景色调，通过 shadow elevation 调整投影深度。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基本 Surface

用 Surface 包住文本，内部 Text 通过 `paddingAll(16)` 增加内间距：

```tsx
import { Host, Surface, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicSurfaceExample() {
  return (
    <Host matchContents>
      <Surface>
        <Text modifiers={[paddingAll(16)]}>
          Content on a surface
        </Text>
      </Surface>
    </Host>
  );
}
```

## Tonal elevation 和 shadow elevation

Tonal elevation 影响 Material 主题背景色，shadow elevation 控制投影。下面比较低、高两档视觉深度：

```tsx
import {
  Host,
  Surface,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function SurfaceElevationExample() {
  return (
    <Host matchContents>
      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[paddingAll(16)]}>
        <Surface tonalElevation={1} shadowElevation={2}>
          <Text modifiers={[paddingAll(16)]}>Low elevation</Text>
        </Surface>
        <Surface tonalElevation={4} shadowElevation={8}>
          <Text modifiers={[paddingAll(16)]}>High elevation</Text>
        </Surface>
      </Column>
    </Host>
  );
}
```

## 覆盖表面和内容颜色

`color` 设置表面背景，`contentColor` 设置表面内部默认文字 / 图标颜色。这里使用深蓝色容器、白色文字：

```tsx
import { Host, Surface, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function SurfaceCustomColorsExample() {
  return (
    <Host matchContents>
      <Surface
        color="#1E3A5F"
        contentColor="#FFFFFF"
        tonalElevation={2}>
        <Text color="#FFFFFF" modifiers={[paddingAll(16)]}>
          Custom colored surface
        </Text>
      </Surface>
    </Host>
  );
}
```

未传颜色时，背景默认来自 `MaterialTheme.colorScheme.surface`，内容颜色默认由 `contentColorFor(color)` 推导。

## 圆角形状和边框

`shape` 决定裁剪区域；`border` 设置外围 stroke：

```tsx
import {
  Host,
  Surface,
  Shape,
  Text,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function SurfaceShapeBorderExample() {
  return (
    <Host matchContents>
      <Surface
        shape={Shape.RoundedCorner({
          cornerRadii: {
            topStart: 16,
            topEnd: 16,
            bottomStart: 16,
            bottomEnd: 16,
          },
        })}
        border={{ width: 2, color: '#6200EE' }}>
        <Text modifiers={[paddingAll(16)]}>
          Rounded surface with border
        </Text>
      </Surface>
    </Host>
  );
}
```

## API 属性

```tsx
import { Surface } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `border` | `SurfaceBorder`，可选 | 表面外侧描边配置。 |
| `checked` | `boolean`，可选 | 与 `onCheckedChange` 同时提供时成为 toggleable surface。 |
| `children` | `ReactNode`，可选 | 表面内部内容。 |
| `color` | `ColorValue`，可选 | 背景色；默认 `MaterialTheme.colorScheme.surface`。 |
| `contentColor` | `ColorValue`，可选 | 内容默认色；默认 `contentColorFor(color)`。 |
| `enabled` | `boolean`，默认 `true` | 是否启用并响应交互。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `onCheckedChange` | `(checked: boolean) => void`，可选 | 和 checked 一起提供时使 Surface 可开关。 |
| `onClick` | `() => void`，可选 | 让 Surface 可点击；与 selected 一起提供时成为 selectable surface。 |
| `selected` | `boolean`，可选 | 与 onClick 同时提供时展示选中状态。 |
| `shadowElevation` | `number`，默认 0 | 投影高度，dp。 |
| `shape` | `ShapeJSXElement`，可选 | 用于表面及内容裁剪的形状。 |
| `tonalElevation` | `number`，默认 0 | 按主题色方案影响表面背景，dp。 |

`SurfaceBorder` 字段：`color?: ColorValue`，默认主题 `outline`；`width?: number`，默认 1 dp。

## 关键名词

- **Surface / 表面层**：Material 3 中承载卡片、菜单、面板等内容的主题化容器。
- **Tonal elevation / 色调高度**：随高度将主题色叠加到表面背景上，改变 Material 3 表面层次感。
- **Shadow elevation / 阴影高度**：原生投影的视觉高度；单位 dp。它与 tonal elevation 影响方式不同。
- **Content color**：父 Surface 可为子内容提供默认文字 / 图标色，减少每个子元素重复设置。
- **Shape 裁剪**：将 Surface 子内容限制在形状边界内，防止内部绘制越过圆角。
- **Border stroke / 描边**：围绕形状边缘绘制的线条；颜色缺省为 outline，宽度缺省 1 dp。
- **Selectable / Toggleable**：与 onClick / onCheckedChange 组合，Surface 可以像选项或开关控件一样响应状态变化。

## 官方代码主题覆盖

保留安装命令和全部四个示例：基础内容容器、两档 tonal / shadow elevation、自定义背景和内容颜色、全圆角与紫色边框。API 表列出全部属性、交互状态、表面边框默认值与主题色行为。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Switch](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/switch/)，介绍 Android Material 3 开关控件。

**翻页：**[上一页：Jetpack Compose Spacer](./057-Jetpack-Compose-Spacer.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Switch](./059-Jetpack-Compose-Switch.md)
