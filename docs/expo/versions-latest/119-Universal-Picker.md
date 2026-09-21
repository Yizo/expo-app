# 119｜Expo UI Universal Picker

**翻页：**[上一页：Universal List](./118-Universal-List.md) · [目录](./README.md) · [下一页：Universal RNHostView](./120-Universal-RNHostView.md)

**官方 Latest 页面：**[Picker](https://docs.expo.dev/versions/latest/sdk/ui/universal/picker/)

**SDK 56 对照：**[SDK v56.0.0 Picker](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/picker/)

**版本边界：**Latest 页面推荐 `@expo/ui ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。Picker 的 menu / wheel、controlled value 和核心 Props 在两版相同；Latest 例子使用 `Host.matchContents={{ vertical: true }}`，v56 页面例子则用 `Host.style={{ flex: 1 }}`。本地 SDK 56 应按 v56 版本选 Host 布局写法。

## Picker 用来做什么

`Picker` 是**单选输入**：用 `<Picker.Item label value />` 子元素声明可选项，由控件根据平台显示下拉菜单或选择滚轮。Latest Universal `Picker` 独立于 `@expo/ui/community/picker`；后者是兼容 `@react-native-picker/picker` 的 shim。新代码建议用 Universal Picker，除非业务必须依赖 React Native Picker 原有 API。

应用需安装 `@expo/ui`，并由 Expo Host 包裹原生 UI 内容：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

已有 React Native app 需先安装 Expo `expo` package。SDK56 app 用 `expo install` 确保 `@expo/ui ~56.0.26` 与本机 Expo SDK 匹配。

## Menu 外观（默认）

menu 会先显示紧凑控件，点按后弹出平台菜单。`selectedValue` 是 controlled value；`onValueChange` 回调后更新 React state：

```tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, Row, Picker, Spacer, Text } from '@expo/ui';

const FLAVOURS = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
];

export default function FlavourPicker() {
  const [value, setValue] = useState('vanilla');
  const colorScheme = useColorScheme();

  return (
    <Host style={{ flex: 1 }}>
      <Row alignment="center" spacing={12} style={{ padding: 16 }}>
        <Text textStyle={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
          Flavour:
        </Text>
        <Spacer flexible />
        <Picker selectedValue={value} onValueChange={setValue}>
          {FLAVOURS.map(flavour => (
            <Picker.Item
              key={flavour.value}
              label={flavour.label}
              value={flavour.value}
            />
          ))}
        </Picker>
      </Row>
    </Host>
  );
}
```

这里 Host 用 v56 版本源码里的 `style={{ flex: 1 }}`。Latest 的相同示例以 `matchContents={{ vertical: true }}` 控制内容测量；若使用 SDK56，请参考当前本地 `@expo/ui ~56.0.26` 的 Host API。

## iOS Wheel 外观

设置 `appearance="wheel"` 时，iOS 会显示常驻的滚轮式 rotor。Android 的 Material 3 没有同样的滚轮控件，故回退为平台 dropdown；Web 也回退成 dropdown：

```tsx
import { useState } from 'react';
import { Host, Column, Picker } from '@expo/ui';

const FLAVOURS = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
];

export default function FlavourWheel() {
  const [value, setValue] = useState('chocolate');

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Picker
          selectedValue={value}
          onValueChange={setValue}
          appearance="wheel"
        >
          {FLAVOURS.map(flavour => (
            <Picker.Item
              key={flavour.value}
              label={flavour.label}
              value={flavour.value}
            />
          ))}
        </Picker>
      </Column>
    </Host>
  );
}
```

## Picker API

| Prop / type | 默认值 / 类型 | 意义 |
| --- | --- | --- |
| `children` | `ReactNode` | 以 `<Picker.Item>` 声明可选值。 |
| `appearance` | `'menu'` | `'menu'` 是点击弹出的紧凑菜单；`'wheel'` 是 iOS 常驻滚轮。 |
| `enabled` | `true` | 是否接受用户输入。 |
| `selectedValue` | `T` | 当前选择；必须匹配某个 `<Picker.Item value={...}>`。 |
| `onValueChange` | `(value: T) => void` | 用户选择后回调；一般放 `setValue` 更新 controlled state。 |
| `testID` | `string` | E2E / 组件测试定位 ID。 |
| `Picker.Item.label` | `string` | 选项显示的文字。 |
| `Picker.Item.value` | `string` 或 `number` | 该选项的值，需和 `selectedValue` 类型一致。 |

Picker 带泛型类型 `Picker<T>`；`Picker.Item.value` 当前允许 string / number。滚轮外观不会改变 value / change-handler 的单选语义。

## Native 与 Web 行为总结

| Platform | `menu` | `wheel` |
| --- | --- | --- |
| iOS | 平台下拉菜单 | 屏幕内滚轮 rotor |
| Android | 平台 dropdown | 回退平台 dropdown |
| Web | 下拉菜单 | 回退 dropdown |

这不是从 web 页面直接渲染 `<select>`：Expo UI 会把 Picker 映射为对应平台控件；但 React 层仍通过 props / state 维护选中值。

## 关键名词

- **Picker / 单选器：**用户从若干 `Picker.Item` 中选一个值的输入组件。
- **Controlled value：**由 React state 持有当前值，再通过 `selectedValue` 传给组件。
- **Menu appearance：**点按控件后才出现选项列表的默认外观。
- **Wheel / rotor：**iOS 上持续可见、可滚动的系统选择器样式。
- **`@expo/ui/community/picker`：**面向旧 `@react-native-picker/picker` API 的兼容层，不是 Universal Picker 自身。

## 官方代码主题覆盖

Latest / v56 两个 Picker 页面中的代码示例均已覆盖：`@expo/ui` 四类包管理器安装；State + 多个 Picker.Item 的 menu 示例；Host + Row + Spacer 的布局；`appearance="wheel"` + Column 示例；`selectedValue` 与 `onValueChange` 的状态同步；以及所有 props / appearance / value 类型。v56 Host 代码示例和 Latest `matchContents` 变体已分开标注。

## 下一页

官方页脚 **Next** 是 [Universal RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/universal/rnhostview/)，介绍在 Expo UI 原生树中承载 React Native View 子树。

**翻页：**[上一页：Universal List](./118-Universal-List.md) · [返回目录](./README.md) · [下一页：Universal RNHostView](./120-Universal-RNHostView.md)
