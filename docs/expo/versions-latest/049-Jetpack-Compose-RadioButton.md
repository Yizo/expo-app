# 049｜Jetpack Compose RadioButton

**翻页：**[上一页：Jetpack Compose PullToRefreshBox](./048-Jetpack-Compose-PullToRefreshBox.md) · [目录](./README.md) · [下一页：Jetpack Compose RNHostView](./050-Jetpack-Compose-RNHostView.md)

**官方页面：**[Jetpack Compose RadioButton · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/radiobutton/)

**版本边界：**Latest 页面推荐版本在检索到的官方快照中为 `~57.0.12` 与 `~57.0.17`；SDK 56 官方文档推荐 `~56.0.21`。本地安装时以 Expo SDK 对应的 `npx expo install @expo/ui` 结果为准。

## 单选控件

RadioButton 用于从一组互斥选项中选择一个值。例如筛选条件、通知类型或排序方式。Expo UI 的 Jetpack Compose 版只负责原生 Android 控件外观；业务选择值仍由 React state 持有。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 独立单选按钮

独立按钮接收 `selected` 来显示选择状态，并通过 `onClick` 通知父组件变化：

```tsx
import { useState } from 'react';
import { Host, RadioButton } from '@expo/ui/jetpack-compose';

export default function BasicRadioButton() {
  const [selected, setSelected] = useState(false);

  return (
    <Host matchContents>
      <RadioButton
        selected={selected}
        onClick={() => setSelected(!selected)}
      />
    </Host>
  );
}
```

单个 toggle 可展示 RadioButton API，但真实单选语义通常体现在至少两个互斥选项组成的 group 里。

## 推荐：整行可点的 Radio group

官方推荐的无障碍方式是：Column 用 `selectableGroup()` 声明选项分组；每个 Row 用 `selectable(..., 'radioButton')` 控制选中状态和点击；内部 RadioButton 不再重复传 `onClick`。这样文字与圆形按钮整行都能点击，也给屏幕阅读器提供单选语义：

```tsx
import { useState } from 'react';
import {
  Host,
  Column,
  Row,
  RadioButton,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  selectable,
  selectableGroup,
  fillMaxWidth,
  height,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RadioGroup() {
  const colors = useMaterialColors();
  const [selectedOption, setSelectedOption] = useState('Calls');
  const options = ['Calls', 'Missed', 'Friends'];

  return (
    <Host matchContents>
      <Column modifiers={[selectableGroup()] }>
        {options.map(label => (
          <Row
            key={label}
            verticalAlignment="center"
            modifiers={[
              fillMaxWidth(),
              height(56),
              selectable(
                label === selectedOption,
                () => setSelectedOption(label),
                'radioButton'
              ),
              padding(16, 0, 16, 0),
            ]}>
            <RadioButton selected={label === selectedOption} />
            <Text
              color={colors.onBackground}
              modifiers={[padding(16, 0, 0, 0)]}>
              {label}
            </Text>
          </Row>
        ))}
      </Column>
    </Host>
  );
}
```

只有 `selectedOption` 是单一 state，因此选中一个选项时其余选项自然变为未选中。Row 的 `height(56)` 给每个触控目标提供 56 dp 高度；`selectableGroup` 与 `selectable` 还会把集合及单项角色暴露给无障碍服务。

## API

```tsx
import { RadioButton } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `selected` | `boolean` | 必需。按钮当前是否选中。 |
| `onClick` | `() => void`，可选 | 用户点击按钮时触发。推荐 Radio group 中改由整行的 `selectable` 响应。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |

## 关键名词

- **互斥选择 / Single selection**：一组选项中同一时间只能选一个；常见做法是 state 保存当前选中项的 id。
- **Radio group**：一组单选项。除了视觉上的多个 RadioButton，还需要共享数据状态和组语义。
- **受控选择状态**：由父 React 组件传入 `selected`，并在回调中更新 state；RadioButton 本身不会存储业务值。
- **`selectableGroup()`**：给 Column / Row 标记这是一组选项，让 TalkBack 等屏幕阅读器按组描述其子选项。
- **`selectable(..., role)`**：把整行做成可选择控件，并为无障碍服务指定 `radioButton` 语义角色。
- **触控目标 / Touch target**：用户可以操作的区域。将整行设为 clickable 通常比要求精准点击小圆圈更容易触达。
- **`selected` 与 `onClick` 的关系**：前者负责渲染当前状态，后者通知变化；两者由 React state 串联形成受控组件。
- **Material 3**：Google Material Design 第三代控件和主题系统；本组件按其 Android 原生单选按钮样式渲染。

## 官方代码主题覆盖

保留安装命令、独立 Boolean 单选按钮示例，以及带 Calls / Missed / Friends 三项的官方推荐 Radio group。完整代码保留 state、Material theme 颜色、Column 语义分组、Row selectable 角色、56 dp 触控高度和间距。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/rnhostview/)，讲解如何在 Compose 子树内放入 React Native 内容并协调 Yoga 测量。

**翻页：**[上一页：Jetpack Compose PullToRefreshBox](./048-Jetpack-Compose-PullToRefreshBox.md) · [返回目录](./README.md) · [下一页：Jetpack Compose RNHostView](./050-Jetpack-Compose-RNHostView.md)
