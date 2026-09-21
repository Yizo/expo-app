# 092｜SwiftUI Picker

**翻页：**[上一页：SwiftUI Overlay](./091-SwiftUI-Overlay.md) · [目录](./README.md) · [下一页：SwiftUI Popover](./093-SwiftUI-Popover.md)

**官方页面：**[SwiftUI Picker · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/picker/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/picker/)推荐 `~56.0.26`。此 SwiftUI Picker 支持 iOS、tvOS，可在 Expo Go 中使用。跨平台时使用 Expo UI universal Picker。

## 从选项中选择一个值

`Picker` 将候选项显示为系统选择器。每个选项放在 `Text` 里，并用 `tag(value)` 写入稳定标识；`selection` 保存当前 tag，`onSelectionChange` 在用户选择时返回对应 tag。外观通过 `pickerStyle` modifier 改变。

安装：

~~~sh
npx expo install @expo/ui
~~~

## Segmented 样式

segmented 样式将少量互斥选项并排显示。它会填满父容器分给它的宽度，因此用有明确布局空间的 Host：

~~~tsx
import { useState } from 'react';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

const options = ['Apple', 'Banana', 'Orange'];

export default function SegmentedPickerExample() {
  const [selectedTag, setSelectedTag] = useState(options[0]);

  return (
    <Host style={{ flex: 1 }}>
      <Picker
        modifiers={[pickerStyle('segmented')]}
        label="Select a fruit"
        selection={selectedTag}
        onSelectionChange={selection => {
          setSelectedTag(selection);
        }}>
        {options.map(option => (
          <Text key={option} modifiers={[tag(option)]}>
            {option}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
~~~

## Menu 样式

`pickerStyle('menu')` 把选项呈现为弹出菜单：

~~~tsx
import { useState } from 'react';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

const options = ['Apple', 'Banana', 'Orange'];

export default function MenuPickerExample() {
  const [selectedTag, setSelectedTag] = useState(options[0]);

  return (
    <Host style={{ flex: 1 }}>
      <Picker
        modifiers={[pickerStyle('menu')]}
        label="Select a fruit"
        selection={selectedTag}
        onSelectionChange={selection => {
          setSelectedTag(selection);
        }}>
        {options.map(option => (
          <Text key={option} modifiers={[tag(option)]}>
            {option}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
~~~

## Wheel 样式

`pickerStyle('wheel')` 显示滚轮选择器；官方说明 Apple TV 不支持 wheel 变体：

~~~tsx
import { useState } from 'react';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

const options = ['Apple', 'Banana', 'Orange'];

export default function WheelPickerExample() {
  const [selectedTag, setSelectedTag] = useState(options[0]);

  return (
    <Host style={{ flex: 1 }}>
      <Picker
        modifiers={[pickerStyle('wheel')]}
        label="Select a fruit"
        selection={selectedTag}
        onSelectionChange={selection => {
          setSelectedTag(selection);
        }}>
        {options.map(option => (
          <Text key={option} modifiers={[tag(option)]}>
            {option}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode`（可选） | Picker 选项；通常用 `Text` 表示并加 `tag()`。 |
| `label` | `string \| React.ReactNode`（可选） | 选择器标签。 |
| `selection` | 泛型 `T`（可选） | 当前选中的 tag 值。 |
| `onSelectionChange` | `(selection: T) => void`（可选） | 选择变化时调用，参数是被选中的 tag 值。 |
| `systemImage` | SF Symbol 名称（可选） | 系统图标名称，例如 `photo` 或 `heart.fill`。 |

官方 API 也展示基础 tag 示例：

~~~tsx
<Picker modifiers={[pickerStyle('segmented')]}>
  <Text modifiers={[tag('option1')]}>Option 1</Text>
  <Text modifiers={[tag(0)]}>Option 3</Text>
</Picker>
~~~

### 新手术语

- **tag**：选项背后的值 / ID；用户看到的是文字，React state 保存的是 tag。
- **泛型 `T`**：Picker 不强制 tag 一定是字符串；可用字符串或数字，但 state 的类型要与 tags 对应。
- **互斥选择**：一次只能有一个选项成为当前 selection 的控件行为。
- **pickerStyle**：SwiftUI 的原生 Picker 外观选择器。

## 源页代码主题覆盖

已覆盖四种安装命令、官方 Segmented / Menu / Wheel 三种选择样式，以及 API 区使用 `tag` 标识选项的最小片段。状态、selection 值和平台支持限制已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/picker/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/picker/)

**翻页：**[上一页：SwiftUI Overlay](./091-SwiftUI-Overlay.md) · [目录](./README.md) · [下一页：SwiftUI Popover](./093-SwiftUI-Popover.md)
