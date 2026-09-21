# 111｜Expo UI Universal Button

**翻页：**[上一页：Universal BottomSheet](./110-Universal-BottomSheet.md) · [目录](./README.md) · [下一页：Universal Checkbox](./112-Universal-Checkbox.md)

**官方页面：**[Button · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/button/)

**版本边界：**Latest 与 [SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/button/) 均推荐 `@expo/ui ~57.0.19` / `~56.0.26`（按目标 SDK 选择），支持 Android、iOS、Web 和 Expo Go。该页的几个使用示例在两版中基本一致。

## 跨平台按压按钮

Universal `Button` 在 Android、iOS、Web 上提供统一的按压 API，包含 `filled`（实心）、`outlined`（描边）和 `text`（纯文字）三种强调层级。需要自定义图标等内容时可传 `children`；此时 `label` 会被忽略。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 最小按钮

~~~tsx
import { Host, Button } from '@expo/ui';

export default function BasicButtonExample() {
  return (
    <Host matchContents>
      <Button label="Press me" onPress={() => alert('Pressed!')} />
    </Host>
  );
}
~~~

## 按钮视觉变体

通过 `variant` 选择填充、描边或纯文字样式：

~~~tsx
import { Host, Column, Button } from '@expo/ui';

export default function ButtonVariantsExample() {
  return (
    <Host matchContents>
      <Column spacing={8}>
        <Button variant="filled" label="Filled" onPress={() => {}} />
        <Button variant="outlined" label="Outlined" onPress={() => {}} />
        <Button variant="text" label="Text" onPress={() => {}} />
      </Column>
    </Host>
  );
}
~~~

## 自定义按钮内容

将 `Icon` 与 `Text` 作为 `children`，即可把系统图标与标签并排放进按钮。`Icon.select` 为 iOS / Android 各选择一个平台资源：

~~~tsx
import { Host, Button, Row, Icon, Text } from '@expo/ui';

export default function CustomButtonExample() {
  return (
    <Host matchContents>
      <Button onPress={() => {}}>
        <Row spacing={6} alignment="center">
          <Icon
            name={Icon.select({
              ios: 'star.fill',
              android: require('@expo/material-symbols/star.xml'),
            })}
            size={16}
            color="#FFFFFF"
          />
          <Text textStyle={{ color: '#FFFFFF' }}>Favorite</Text>
        </Row>
      </Button>
    </Host>
  );
}
~~~

## 禁用按钮

`disabled` 会让按钮不可响应用户操作：

~~~tsx
import { Host, Button } from '@expo/ui';

export default function DisabledButtonExample() {
  return (
    <Host matchContents>
      <Button label="Disabled" onPress={() => {}} disabled />
    </Host>
  );
}
~~~

## 属性与类型速查

从 `@expo/ui` 导入：

~~~tsx
import { Button } from '@expo/ui';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | 自定义内容；提供后 `label` 被忽略。 |
| `disabled` | `boolean`（可选） | 禁用用户交互。 |
| `hidden` | `boolean`（可选） | 是否隐藏组件。 |
| `label` | `string`（可选） | 按钮显示文字；传了 `children` 后忽略。 |
| `modifiers` | `ModifierConfig[]`（可选） | 传平台专属 SwiftUI / Jetpack Compose modifier；同类 modifier 会覆盖从 `style` 或其他属性推导出的值。 |
| `onAppear` | `() => void`（可选） | 组件显示到屏幕时调用。 |
| `onDisappear` | `() => void`（可选） | 组件从屏幕移除时调用。 |
| `onPress` | `() => void`（可选） | 按钮按下时调用。 |
| `style` | `ViewStyle` 的受限子集（可选） | 跨平台样式；支持 padding 系列、背景色、边框、透明度、宽高等。 |
| `testID` | `string`（可选） | 供端到端测试定位组件。 |
| `variant` | `ButtonVariant`（可选，默认 `filled`） | 按钮视觉变体。 |

`ButtonVariant` 可取 `'filled'`（实色背景，默认）、`'outlined'`（透明背景加边框）或 `'text'`（无背景和边框）。

### 新手术语

- **按压组件（pressable）**：能够响应点按 / 触摸操作的交互控件。
- **`children`**：React 组件标签之间的子内容，例如 `<Button>图标和文字</Button>`。
- **平台资源**：原生系统专用图标或视图；iOS 的 SF Symbols 名称与 Android 的 Material Symbols 资源路径不同。
- **Modifier**：对原生控件应用布局、颜色或交互外观的修饰配置。

## 源页代码主题覆盖

已覆盖四种安装命令与官方四类完整用法：基础按钮、filled / outlined / text 变体、包含图标的自定义 children、disabled 状态；另列 API 导入、label / onPress / modifiers 等属性。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/button/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/button/)

**翻页：**[上一页：Universal BottomSheet](./110-Universal-BottomSheet.md) · [目录](./README.md) · [下一页：Universal Checkbox](./112-Universal-Checkbox.md)
