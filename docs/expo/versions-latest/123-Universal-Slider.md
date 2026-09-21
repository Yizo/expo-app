# 123｜Expo UI Universal Slider

**翻页：**[上一页：Universal ScrollView](./122-Universal-ScrollView.md) · [目录](./README.md) · [下一页：Universal Spacer](./124-Universal-Spacer.md)

**官方 Latest 页面：**[Slider](https://docs.expo.dev/versions/latest/sdk/ui/universal/slider/)

**SDK 56 对照：**[SDK v56.0.0 Slider](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/slider/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。continuous / stepped slider、默认值和 Props 两版相同。Latest 页面样例加入 dark-mode `textStyle` 与 `Host.matchContents`；SDK56 样例使用 `Host.style={{ flex: 1 }}`。

## Slider 是什么

`Slider` 是让用户在数字范围内拖动选择数值的控件。它是 controlled component：React state 持有当前 `value`，用户改变位置时 `onValueChange` 把新数字传回应用，再调用 `setState` 更新。

先安装与 Expo SDK 匹配的 `@expo/ui`：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## Continuous Slider

默认范围是 0 到 1，适合音量比例、不透明度或其他连续区间：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui';

export default function OpacitySlider() {
  const [value, setValue] = useState(0.5);

  return (
    <Host style={{ flex: 1 }}>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
```

不提供 `min` / `max` / `step` 时，组件使用 0–1 的连续范围。实际滑块值始终受 React state 控制。

## 自定义数值范围并设置 Steps

用 `min`、`max` 和 `step` 限定可选值。例如音量 0–100、每次递增 10：

```tsx
import { useState } from 'react';
import { Host, Column, Slider, Text } from '@expo/ui';

export default function VolumeSlider() {
  const [volume, setVolume] = useState(50);

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8}>
        <Text>Volume: {volume}</Text>
        <Slider
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          step={10}
        />
      </Column>
    </Host>
  );
}
```

在此范围内会选择 0、10、20 ……100。`value` 初始值应位于 min/max 之间并符合步长。

## Slider API

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `number` | 当前 controlled 数值。 |
| `onValueChange` | `(value: number) => void` | 拖动时把新值交给 React state。 |
| `min` | `number` / 默认 `0` | 取值最小边界。 |
| `max` | `number` / 默认 `1` | 取值最大边界。 |
| `step` | `number` | 离散步长。例如 min=0、max=100、step=10。 |
| `disabled` | `boolean` | 禁用用户拖动。 |
| `modifiers` | `ModifierConfig[]` | Expo UI 的平台原生修饰器入口。 |
| `testID` | `string` | 自动化 / E2E 测试定位 ID。 |

## 使用场景与常见误区

- **音量 / 进度 / 价格区间：**先确定 min/max，再设计符合业务精度的 step；不要在 `onValueChange` 只更新文本、忘记更新 Slider 的 `value`。
- **Controlled value：**如果状态停在旧值，UI 会回弹；将 `onValueChange` 接到同一个 state。
- **数值展示：**在 adjacent Text 显示 state 是常见用法，具体格式化仍由应用控制。
- **无障碍：**本页 Slider API 包含 disabled / testID；用户交互和标签应结合页面语境一起检查。

## 关键名词

- **Continuous range：**数值在范围内连续选择，没有固定档位。
- **Stepped range：**按固定增量离散取值；`step=10` 仅能选择 10 的整数倍。
- **Controlled component：**由 React state 通过 props 提供当前值；用户操作触发回调，再由父组件回写新值。
- **Range boundary：**`min` 与 `max` 定义的数值范围边界。
- **Step：**Slider 可选择的离散间隔。

## 官方代码主题覆盖

Latest / SDK v56.0.0 源页代码全部覆盖：`@expo/ui` 包管理器安装；默认 0–1 的 continuous slider；min / max / step 自定义范围的 stepped slider；state / onValueChange；Latest 页按深浅色换 Text 颜色的主题写法；Slider 全部 API Props。

## 下一页

官方页脚 **Next** 是 [Universal Spacer](https://docs.expo.dev/versions/latest/sdk/ui/universal/spacer/)，介绍在 Row / Column 中创建固定或弹性空白的布局组件。

**翻页：**[上一页：Universal ScrollView](./122-Universal-ScrollView.md) · [返回目录](./README.md) · [下一页：Universal Spacer](./124-Universal-Spacer.md)
