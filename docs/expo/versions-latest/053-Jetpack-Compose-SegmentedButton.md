# 053｜Jetpack Compose SegmentedButton

**翻页：**[上一页：Jetpack Compose SearchBar](./052-Jetpack-Compose-SearchBar.md) · [目录](./README.md) · [下一页：Jetpack Compose Shape](./054-Jetpack-Compose-Shape.md)

**官方页面：**[Jetpack Compose SegmentedButton · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/segmentedbutton/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.17`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/segmentedbutton/)推荐 `~56.0.21`。两个版本均包含单选 / 多选分段按钮和状态颜色配置。

## 一排内的多个选项

Segmented button 将小量并列选项排列在一行。它有两种组容器：

- `SingleChoiceSegmentedButtonRow`：只能有一项被选择，类似 radio group。
- `MultiChoiceSegmentedButtonRow`：每项都能独立开关，类似 checkbox 集合。

先安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 单选分段按钮

单选模式通过一个 `selectedIndex` 保存当前选择，子项使用 `selected` 和 `onClick`：

```tsx
import { useState } from 'react';
import {
  Host,
  SingleChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function SingleChoiceExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = ['Day', 'Week', 'Month', 'Year'];

  return (
    <Host matchContents>
      <SingleChoiceSegmentedButtonRow>
        {options.map((label, index) => (
          <SegmentedButton
            key={label}
            selected={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}>
            <SegmentedButton.Label>
              <Text>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  );
}
```

## 多选分段按钮

多选模式由一个布尔数组分别记录各项选中状态。`onCheckedChange` 把新的 checked 值传回来；更新 state 时先复制旧数组，再改对应索引：

```tsx
import { useState } from 'react';
import {
  Host,
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function MultiChoiceExample() {
  const [checkedItems, setCheckedItems] = useState([
    false,
    false,
    false,
    false,
  ]);
  const options = ['Wi-Fi', 'Bluetooth', 'NFC', 'GPS'];

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <MultiChoiceSegmentedButtonRow>
        {options.map((label, index) => (
          <SegmentedButton
            key={label}
            checked={checkedItems[index]}
            onCheckedChange={checked => {
              setCheckedItems(prev => {
                const next = [...prev];
                next[index] = checked;
                return next;
              });
            }}>
            <SegmentedButton.Label>
              <Text>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </MultiChoiceSegmentedButtonRow>
    </Host>
  );
}
```

这个不可变数组更新方式可避免直接修改 React state 中的原数组。

## 自定义选中颜色

`colors` 可以自定义 active / inactive / disabled 等状态。下面让当前单选项使用紫色容器和白色文字：

```tsx
import { useState } from 'react';
import {
  Host,
  SingleChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function CustomColorsExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = ['$', '$$', '$$$', '$$$$'];

  return (
    <Host matchContents>
      <SingleChoiceSegmentedButtonRow>
        {options.map((label, index) => (
          <SegmentedButton
            key={label}
            selected={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}
            colors={{
              activeContainerColor: '#6200EE',
              activeContentColor: '#FFFFFF',
            }}>
            <SegmentedButton.Label>
              <Text>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  );
}
```

## API：组件与状态属性

```tsx
import {
  SingleChoiceSegmentedButtonRow,
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
} from '@expo/ui/jetpack-compose';
```

| 组件 / 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `SingleChoiceSegmentedButtonRow.children` | `ReactNode` | 放入一组 SegmentedButton，提供单选语义。 |
| `SingleChoiceSegmentedButtonRow.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `MultiChoiceSegmentedButtonRow.children` | `ReactNode` | 放入可多选 SegmentedButton。 |
| `MultiChoiceSegmentedButtonRow.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `SegmentedButton` | `ReactElement<SegmentedButtonProps>` | 单项控件；必须放在以上任一组容器中。 |
| `SegmentedButton.checked` | `boolean`，可选 | 多选容器下该项是否勾选。 |
| `SegmentedButton.selected` | `boolean`，可选 | 单选容器下该项是否选择。 |
| `SegmentedButton.onCheckedChange` | `(checked: boolean) => void`，可选 | 多选项状态改变时回调。 |
| `SegmentedButton.onClick` | `() => void`，可选 | 单选项点击时回调。 |
| `SegmentedButton.colors` | `SegmentedButtonColors`，可选 | 配置激活、未激活、禁用状态颜色。 |
| `SegmentedButton.enabled` | `boolean`，默认 `true` | 是否允许交互。 |
| `SegmentedButton.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `SegmentedButton.children` | `ReactNode`，可选 | 内容，包含 `SegmentedButton.Label` 槽。 |

## `SegmentedButtonColors`

所有字段都是可选 `ColorValue`：

| 字段 | 说明 |
| --- | --- |
| `activeBorderColor` | 激活项边框色。 |
| `activeContainerColor` | 激活项容器色。 |
| `activeContentColor` | 激活项文字 / 图标色。 |
| `inactiveBorderColor` | 未激活项边框色。 |
| `inactiveContainerColor` | 未激活项容器色。 |
| `inactiveContentColor` | 未激活项文字 / 图标色。 |
| `disabledActiveBorderColor` | 禁用但处于激活状态时的边框色。 |
| `disabledActiveContainerColor` | 禁用但处于激活状态时的容器色。 |
| `disabledActiveContentColor` | 禁用但处于激活状态时的内容色。 |
| `disabledInactiveBorderColor` | 禁用且未激活时的边框色。 |
| `disabledInactiveContainerColor` | 禁用且未激活时的容器色。 |
| `disabledInactiveContentColor` | 禁用且未激活时的内容色。 |

## 关键名词

- **分段按钮 / Segmented button**：将几个紧邻选项组合在一条控件里，通常用于视图模式、时间范围、筛选条件等少量选择。
- **Single choice / 单选**：同组仅保留一个 active 项；用 `selected` 和 `onClick`。
- **Multi choice / 多选**：每项可独立开启或关闭；用 `checked` 和 `onCheckedChange`。
- **受控组件**：选中状态保存在 React state，props 决定按钮视觉状态，事件回调通知状态变更。
- **不可变更新 / Immutable update**：创建新数组而不是原地改 state 数组，以便 React 正确判断状态变化并重新渲染。
- **Label 槽**：`SegmentedButton.Label` 用于声明按钮的文本或其他 Compose label 内容。
- **激活 / 未激活 / 禁用状态**：分别表示已选、可选但未选、不可交互。禁用还有 active / inactive 两类颜色字段。

## 官方代码主题覆盖

保留安装命令和官方三个完整示例：Day / Week / Month / Year 单选、Wi-Fi / Bluetooth / NFC / GPS 多选、价格档位单选并设置激活色。API 列出三种组件及全部状态事件 props，并覆盖十二个 SegmentedButtonColors 字段。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Shape](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/shape/)，介绍通过原生 Compose 绘制几何形状。

**翻页：**[上一页：Jetpack Compose SearchBar](./052-Jetpack-Compose-SearchBar.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Shape](./054-Jetpack-Compose-Shape.md)
