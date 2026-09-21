# 055｜Jetpack Compose Slider

**翻页：**[上一页：Jetpack Compose Shape](./054-Jetpack-Compose-Shape.md) · [目录](./README.md) · [下一页：Jetpack Compose Snackbar](./056-Jetpack-Compose-Snackbar.md)

**官方页面：**[Jetpack Compose Slider · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/slider/)

**版本边界：**Latest 的推荐版本在官方快照中出现过 `@expo/ui ~57.0.12` 和 `~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/slider/)推荐 `~56.0.26`。这里指 Android Jetpack Compose Slider；若要跨平台，可查看 Expo UI 通用 `Slider`。

## 可拖动的数值选择器

Slider 让用户沿轨道拖动圆形 thumb（滑块把手）来调整有界数值，例如音量、价格、亮度或进度。`value` 通常与 React state 双向同步：手指拖动时 `onValueChange` 报告新数值，父组件再用 `value` 将它传回组件。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 默认 0 到 1 范围

默认最小值为 0、最大值为 1。初始状态 0.5 将 thumb 放在范围中点附近：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/jetpack-compose';

export default function BasicSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
```

## 自定义数值范围

将最小值改为 0、最大值改为 100，当前值 50：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/jetpack-compose';

export default function CustomRangeSliderExample() {
  const [value, setValue] = useState(50);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Slider
        value={value}
        min={0}
        max={100}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

## 离散步进

`steps` 为 0 表示连续值；设置正数后会将可选位置离散成多个停靠点：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/jetpack-compose';

export default function SteppedSliderExample() {
  const [value, setValue] = useState(0);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Slider
        value={value}
        min={0}
        max={100}
        steps={10}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

## 自定义轨道、thumb 和 tick 颜色

`colors` 可覆盖 thumb、已走过的 active track、未走过的 inactive track 和刻度颜色：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/jetpack-compose';

export default function CustomColorsSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Slider
        value={value}
        colors={{
          thumbColor: '#6200EE',
          activeTrackColor: '#6200EE',
          inactiveTrackColor: '#E0E0E0',
        }}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

## 自定义 thumb 和整个 track

将 `Slider.Thumb` 和 `Slider.Track` 内容槽传给 Slider，即可完全自定义把手和轨道；示例使用 24 dp 紫色圆形 thumb，以及按 value 比例分配宽度的两段圆角轨道：

```tsx
import { useState } from 'react';
import {
  Host,
  Slider,
  Shape,
  Row,
  Box,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  height,
  weight,
  size,
  clip,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

export default function FullyCustomSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Slider value={value} onValueChange={setValue}>
        <Slider.Thumb>
          <Box
            modifiers={[
              size(24, 24),
              clip(Shapes.Circle),
              background('#6200EE'),
            ]}
          />
        </Slider.Thumb>
        <Slider.Track>
          <Row modifiers={[fillMaxWidth(), height(8)]}>
            <Shape.RoundedCorner
              color="#6200EE"
              cornerRadii={{ topStart: 4, bottomStart: 4 }}
              modifiers={[weight(Math.max(value, 0.01)), height(8)]}
            />
            <Shape.RoundedCorner
              color="#BDBDBD"
              cornerRadii={{ topEnd: 4, bottomEnd: 4 }}
              modifiers={[
                weight(Math.max(1 - value, 0.01)),
                height(8),
              ]}
            />
          </Row>
        </Slider.Track>
      </Slider>
    </Host>
  );
}
```

Latest Host 示例使用 `matchContents={{ vertical: true }}` 并显式撑满宽度；SDK 56 版本的相同示例是 `<Host matchContents>`。

## API 属性

```tsx
import { Slider } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `number`，默认 0 | Slider 当前值。 |
| `min` | `number`，默认 0 | 轨道范围最小值。 |
| `max` | `number`，默认 1 | 轨道范围最大值。若把 max 改到当前值以下，不自动触发回调。 |
| `steps` | `number`，默认 0 | 离散停靠点数；0 表示连续值。 |
| `enabled` | `boolean`，默认 `true` | 是否响应触摸拖动。 |
| `lowerLimit` | `number`，可选 | thumb 拖动不能低于此处；可见轨道仍从 min 开始。 |
| `upperLimit` | `number`，可选 | thumb 拖动不能高于此处；可见轨道仍延伸到 max。 |
| `onValueChange` | `(value: number) => void`，可选 | 拖动时持续回调新值。 |
| `onValueChangeFinished` | `() => void`，可选 | 用户完成调整时回调，例如手指离开屏幕。 |
| `colors` | `SliderColors`，可选 | Material 3 Slider 的颜色配置。 |
| `children` | `ReactNode`，可选 | 自定义 `Slider.Thumb`、`Slider.Track` 槽内容。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |

`SliderColors` 五个可选字段为 `activeTickColor`、`activeTrackColor`、`inactiveTickColor`、`inactiveTrackColor`、`thumbColor`，类型均为 `ColorValue`。

## 关键名词

- **Thumb**：沿轨道移动的滑块把手。
- **Track**：thumb 所在的轨道；active 部分在 thumb 后方，inactive 部分在前方。
- **Tick / 刻度**：离散步进时显示在轨道上的参考位置。
- **`value` 与 `onValueChange`**：受控数值及拖动回调。与 RN `useState` 配合，持续跟踪当前值。
- **连续值 / Continuous**：可在 min 和 max 之间取得连续范围内的值，`steps=0`。
- **离散步进 / Discrete steps**：限制在若干停靠值中选择，适用于预设档位、整十音量等。
- **`onValueChangeFinished`**：用户停止拖动后调用，适合只在交互完成时执行较重逻辑。
- **`lowerLimit` / `upperLimit`**：在视觉 track 的 min–max 范围内，进一步限制 thumb 实际可拖动的区间。
- **通用 Slider 与 Compose Slider**：通用 `@expo/ui` Slider 跨平台；本页 `@expo/ui/jetpack-compose` 仅面向 Android Compose，可使用 Android 专属 modifier 和自定义槽。
- **SDK 56 Host**：Host 可用布尔 `matchContents`；Latest Host 支持对象形式按轴控制内容尺寸。

## 官方代码主题覆盖

保留 Expo UI 安装命令和全部五种用法：默认范围、min/max 自定义范围、steps 离散停靠、状态颜色覆盖、使用 Shape / Row / Box 完整自定义 thumb 和 track。API 列出所有 Slider props、颜色字段及拖动完成回调。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Snackbar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/snackbar/)，介绍可自动消失并承载 Undo 等操作的短暂提示。

**翻页：**[上一页：Jetpack Compose Shape](./054-Jetpack-Compose-Shape.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Snackbar](./056-Jetpack-Compose-Snackbar.md)
