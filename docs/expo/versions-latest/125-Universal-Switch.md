# 125｜Expo UI Universal Switch

**翻页：**[上一页：Universal Spacer](./124-Universal-Spacer.md) · [目录](./README.md) · [下一页：Universal Text](./126-Universal-Text.md)

**官方 Latest 页面：**[Switch](https://docs.expo.dev/versions/latest/sdk/ui/universal/switch/)

**SDK 56 对照：**[SDK v56.0.0 Switch](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/switch/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；SDK v56.0.0 推荐 `~56.0.26`。Switch 的 controlled `value` / `onValueChange`、可选 label 与基础 Props 在两版相同；外层 Host 布局在 Latest 示例使用 matchContents，SDK56 示例使用 flex style。

## Switch 是什么

Universal `Switch` 是一个 on / off 开关。它是 controlled component：父组件用 boolean state 决定 `value`，用户切换后由 `onValueChange(boolean)` 回调更新状态。支持 Android / iOS / Web，并可在 Expo Go 中查看。

先安装当前 Expo SDK 对应的 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基础开关

下例初始化为关闭；用户点击后回调把新 boolean 写回 React state：

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui';

export default function NetworkSwitch() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Switch value={enabled} onValueChange={setEnabled} />
    </Host>
  );
}
```

`value` 表示当前显示状态；若只传 onValueChange 但不改变 value，开关会按父组件 state 回弹到旧值。

## 带文字 Label 的开关

传入 `label` 可以让控件和说明文字显示为同一行，适合偏好 / 设置项：

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui';

export default function NotificationPreference() {
  const [notifications, setNotifications] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Switch
        label="Enable notifications"
        value={notifications}
        onValueChange={setNotifications}
      />
    </Host>
  );
}
```

## Switch API

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `boolean` | 当前开关是否开启。 |
| `onValueChange` | `(value: boolean) => void` | 用户切换开关后收到新状态。 |
| `label` | `string` | 与开关并排显示的标签文字。 |
| `disabled` | `boolean` | 禁用开关；disabled 状态不响应用户操作。 |
| `modifiers` | `ModifierConfig[]` | 将 SwiftUI / Jetpack Compose modifier 向下传给平台原生控件。 |
| `testID` | `string` | 测试工具定位组件的标识符。 |

## 关键名词

- **Controlled component：**父 React 组件 state 是显示状态的唯一来源；事件发生后回写 state。
- **Boolean：**只有 `true` 或 `false` 的数据类型，适合开关值。
- **Label：**解释设置项意义的短文字；示例把它作为 Switch 自身属性传入。
- **Platform modifier：**当普通跨平台 props 不足时，传入 Compose / SwiftUI 样式修饰器。

## 官方代码主题覆盖

Latest 与 v56 Switch 源页代码全部覆盖：`@expo/ui` 四种 package manager 安装；基础 `useState` controlled switch；labelled switch；`value`、`onValueChange`、`disabled`、`label`、`modifiers` 和 `testID` 属性。

## 下一页

官方页脚 **Next** 是 [Universal Text](https://docs.expo.dev/versions/latest/sdk/ui/universal/text/)，介绍 Expo UI 文本内容与 typography 专属 `textStyle`。

**翻页：**[上一页：Universal Spacer](./124-Universal-Spacer.md) · [返回目录](./README.md) · [下一页：Universal Text](./126-Universal-Text.md)
