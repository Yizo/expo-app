# 059｜Jetpack Compose Switch

**翻页：**[上一页：Jetpack Compose Surface](./058-Jetpack-Compose-Surface.md) · [目录](./README.md) · [下一页：Jetpack Compose Text](./060-Jetpack-Compose-Text.md)

**官方页面：**[Jetpack Compose Switch · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/switch/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.17`，SDK 56 推荐 `~56.0.26`。SDK 56 文档使用 `onValueChange` 和 `variant` / `color`；Latest 改为 `onCheckedChange`、`colors` 以及 SwitchColors 各状态颜色字段。不要跨 SDK 版本复制这些 prop 名。

## 打开 / 关闭状态控件

Switch 是 Android Material 3 的双态开关。React state 保存是否启用；`value` 展示受控状态，`onCheckedChange` 把用户的新状态交给父组件：

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui/jetpack-compose';

export default function ToggleSwitchExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Switch value={checked} onCheckedChange={setChecked} />
    </Host>
  );
}
```

## 自定义开关颜色

Latest 版 `colors` 可为开 / 关状态分别指定 thumb（滑块头）、track（轨道）和边框色：

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui/jetpack-compose';

export default function CustomColorsExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Switch
        value={checked}
        onCheckedChange={setChecked}
        colors={{
          checkedThumbColor: '#6200EE',
          checkedTrackColor: '#EDE9FE',
          uncheckedThumbColor: '#9CA3AF',
          uncheckedTrackColor: '#F3F4F6',
          uncheckedBorderColor: '#D1D5DB',
        }}
      />
    </Host>
  );
}
```

## 自定义 thumb 内部内容

`Switch.ThumbContent` 可以在开关滑块里放自定义 Compose 内容；示例用一个圆形 Box 显示不同背景色，尺寸使用 Material 3 默认 icon size：

```tsx
import { useState } from 'react';
import { Host, Switch, Box } from '@expo/ui/jetpack-compose';
import {
  size,
  clip,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

export default function ThumbContentExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Switch
        value={checked}
        onCheckedChange={setChecked}
        colors={{
          checkedThumbColor: '#7C3AED',
          checkedTrackColor: '#EDE9FE',
          checkedIconColor: '#7C3AED',
          uncheckedThumbColor: '#9CA3AF',
          uncheckedTrackColor: '#F3F4F6',
          uncheckedBorderColor: '#D1D5DB',
          uncheckedIconColor: '#9CA3AF',
        }}>
        <Switch.ThumbContent>
          <Box
            modifiers={[
              size(Switch.DefaultIconSize, Switch.DefaultIconSize),
              clip(Shapes.Circle),
              background(checked ? '#FFFFFF' : '#E5E7EB'),
            ]}
          />
        </Switch.ThumbContent>
      </Switch>
    </Host>
  );
}
```

## API

```tsx
import { Switch } from '@expo/ui/jetpack-compose';
```

| 属性 / 组件 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `boolean` | 当前开关是否处于选中 / checked 状态。 |
| `onCheckedChange` | `(value: boolean) => void`，可选 | 用户切换后回调新布尔值。 |
| `enabled` | `boolean`，默认 `true` | 是否响应用户交互。 |
| `colors` | `SwitchColors`，可选 | 配置 Switch 各状态的 thumb、track、border、icon 颜色。 |
| `children` | `ReactNode`，可选 | 可放 `Switch.ThumbContent` 槽。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `Switch.ThumbContent` | `ReactElement<ThumbContentProps>` | 绘制在 thumb 内的自定义内容。 |
| `Switch.DefaultIconSize` | 文档示例用的 Material 3 尺寸常量 | 为 thumb 内部内容提供合适的尺寸。 |

### `SwitchColors` 字段

以下字段全部是可选 `ColorValue`：

| 状态 | 可设置颜色 |
| --- | --- |
| checked | `checkedBorderColor`、`checkedIconColor`、`checkedThumbColor`、`checkedTrackColor` |
| unchecked | `uncheckedBorderColor`、`uncheckedIconColor`、`uncheckedThumbColor`、`uncheckedTrackColor` |
| disabled + checked | `disabledCheckedBorderColor`、`disabledCheckedIconColor`、`disabledCheckedThumbColor`、`disabledCheckedTrackColor` |
| disabled + unchecked | `disabledUncheckedBorderColor`、`disabledUncheckedIconColor`、`disabledUncheckedThumbColor`、`disabledUncheckedTrackColor` |

## SDK 56 写法提示

项目若安装 SDK 56，应依据官方 v56 页面使用如下 prop 名：

| SDK 56 | Latest |
| --- | --- |
| `onValueChange={setChecked}` | `onCheckedChange={setChecked}` |
| `color` | `colors` 对象，可分状态设置 thumb / track / icon / border |
| `variant="switch" \| "checkbox" \| "button"` | Latest Switch 页面不列该 `variant` 属性 |
| `label` | Latest Jetpack Compose Switch 页面不列该 `label` 属性 |

官方 v56 描述也包含 `children`、`enabled`、`modifiers`、`value` 和 `Switch.ThumbContent`。

## 关键名词

- **Switch**：开 / 关双态输入控件，通常对应一个布尔设置。
- **Controlled value / 受控值**：`value` 从外部 React state 传入；`onCheckedChange` 通知用户的新值，父组件负责更新 state。
- **Thumb / 滑块头**：开关中左右移动的小圆形 / 图标区域。
- **Track / 轨道**：thumb 移动的背景条。
- **Checked / unchecked**：checked 表示启用，unchecked 表示关闭。禁用状态会和当前开关状态组合，故 SwitchColors 提供四组颜色。
- **Thumb content slot**：`Switch.ThumbContent` 用于把原生 Compose 内容绘制在滑块头内部。
- **API 迁移**：SDK 56 与 Latest 字段差异来自 API 版本变化，更新Expo SDK后需参照新类型更新回调和颜色传参。
- **通用 Switch**：从 `@expo/ui` 根路径导入的跨平台 Switch 使用 `onValueChange` / `label` 等通用 props；它与本页 Android Compose Switch 属于不同 API。

## 官方代码主题覆盖

保留安装命令和官方三个完整示例：受控布尔开关、checked/unchecked 状态配色、thumb 内嵌 Shape 圆形内容。API 覆盖所有通用属性、thumb 插槽及 SwitchColors 的 16 种字段，并标出 SDK 56 与 Latest 的 prop 改名。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Text](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/)，介绍 Android 原生文字组件与 Material 3 文本样式。

**翻页：**[上一页：Jetpack Compose Surface](./058-Jetpack-Compose-Surface.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Text](./060-Jetpack-Compose-Text.md)
