# 112｜Expo UI Universal Checkbox

**翻页：**[上一页：Universal Button](./111-Universal-Button.md) · [目录](./README.md) · [下一页：Universal Collapsible](./113-Universal-Collapsible.md)

**官方页面：**[Checkbox · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/checkbox/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/checkbox/)推荐 `~56.0.25`。该组件支持 Android、iOS、Web，可在 Expo Go 中使用。两版展示了相同的受控状态与 disabled 示例。

## 受控勾选控件

`Checkbox` 表示布尔选择状态：已勾选或未勾选。它是**受控组件（controlled component）**：父组件通过 `value` 提供当前状态，并在 `onValueChange` 回调中更新 React state。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本用法

~~~tsx
import { useState } from 'react';
import { Host, Checkbox } from '@expo/ui';

export default function CheckboxExample() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Host matchContents>
      <Checkbox label="I accept the terms" value={accepted} onValueChange={setAccepted} />
    </Host>
  );
}
~~~

`setAccepted` 接收新布尔值，所以点选后状态更新，再由 `value={accepted}` 反映到控件外观。

## 禁用状态

~~~tsx
import { Host, Checkbox } from '@expo/ui';

export default function DisabledCheckboxExample() {
  return (
    <Host matchContents>
      <Checkbox label="Locked option" value onValueChange={() => {}} disabled />
    </Host>
  );
}
~~~

上面 `value` 的简写等价于 `value={true}`，表示初始已勾选；`disabled` 后用户无法更改它。

## 属性速查

从 `@expo/ui` 导入：

~~~tsx
import { Checkbox } from '@expo/ui';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean`（可选） | 禁用交互。 |
| `label` | `string`（可选） | 与复选框并排显示的文字。 |
| `modifiers` | `ModifierConfig[]`（可选） | SwiftUI / Jetpack Compose 专用修饰器。 |
| `onValueChange` | `(value: boolean) => void` | 用户切换状态时调用，参数是新值。 |
| `testID` | `string`（可选） | 用于端到端测试定位控件的标识。 |
| `value` | `boolean` | 当前是否勾选。 |

### 新手术语

- **Checkbox / 复选框**：表示某项独立开关或条款是否选中的控件。
- **受控组件**：显示值由 React state 决定；用户操作通过回调通知父组件，再由父组件更新传入的值。
- **回调（callback）**：组件发生某事件时调用的函数；这里回调参数是新的 `boolean` 状态。
- **`boolean`**：布尔类型，只能是 `true` 或 `false`。

## 源页代码主题覆盖

已覆盖四种安装命令与官方两个示例：React state 受控的基本勾选、disabled 勾选；另列 API 导入、布尔值 / 回调 / label / testID 属性。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/checkbox/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/checkbox/)

**翻页：**[上一页：Universal Button](./111-Universal-Button.md) · [目录](./README.md) · [下一页：Universal Collapsible](./113-Universal-Collapsible.md)
