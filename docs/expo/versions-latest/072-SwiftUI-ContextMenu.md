# 072｜SwiftUI ContextMenu

**翻页：**[上一页：SwiftUI ConfirmationDialog](./071-SwiftUI-ConfirmationDialog.md) · [目录](./README.md) · [下一页：SwiftUI ControlGroup](./073-SwiftUI-ControlGroup.md)

**官方页面：**[SwiftUI ContextMenu · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/contextmenu/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/contextmenu/)推荐 `~56.0.26`。支持 iOS、tvOS，并可在 Expo Go 中使用。请按项目 SDK 安装匹配版本。

## 长按打开系统上下文菜单

`ContextMenu` 在用户长按某个视图时显示额外操作，例如编辑、分享或删除。单击打开的菜单应使用 SwiftUI `Menu`。Expo UI 控件需要通过 `Host` 放进 React Native 布局。

~~~sh
npx expo install @expo/ui
~~~

## 基础菜单

`ContextMenu.Trigger` 是常驻内容；`ContextMenu.Items` 包含长按后展示的操作：

~~~tsx
import { Host, ContextMenu, Button, Text } from '@expo/ui/swift-ui';

export default function BasicContextMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button label="Delete" role="destructive" onPress={() => console.log('Delete')} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 系统图标

`systemImage` 接收 SF Symbols 名称；危险操作用 `role="destructive"` 标记：

~~~tsx
import { Host, ContextMenu, Button, Text } from '@expo/ui/swift-ui';

export default function ContextMenuWithImagesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Share" systemImage="square.and.arrow.up" onPress={() => console.log('Share')} />
          <Button label="Favorite" systemImage="heart" onPress={() => console.log('Favorite')} />
          <Button label="Delete" systemImage="trash" role="destructive" onPress={() => console.log('Delete')} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 自定义预览

`ContextMenu.Preview` 在菜单打开时显示在菜单上方。`RNHostView` 可在 SwiftUI 视图树中嵌入 React Native 视图：

~~~tsx
import { View, Text as RNText } from 'react-native';
import { Host, ContextMenu, Button, RNHostView, Text } from '@expo/ui/swift-ui';

export default function ContextMenuWithPreviewExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button label="Delete" role="destructive" onPress={() => console.log('Delete')} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
        <ContextMenu.Preview>
          <RNHostView matchContents>
            <View style={{ width: 200, height: 100, backgroundColor: '#f0f0f0', padding: 16 }}>
              <RNText>Preview content</RNText>
            </View>
          </RNHostView>
        </ContextMenu.Preview>
      </ContextMenu>
    </Host>
  );
}
~~~

## 菜单中嵌入 Picker

`pickerStyle('menu')` 将 Picker 呈现为菜单式选项；`tag(index)` 把每个选项与选择索引绑定：

~~~tsx
import { useState } from 'react';
import { Host, ContextMenu, Button, Text, Picker } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

export default function ContextMenuWithPickerExample() {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(0);
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Action" onPress={() => console.log('Action')} />
          <Picker label="Size" modifiers={[pickerStyle('menu')]} selection={selectedIndex} onSelectionChange={setSelectedIndex}>
            {['Small', 'Medium', 'Large'].map((option, index) => (
              <Text key={index} modifiers={[tag(index)]}>{option}</Text>
            ))}
          </Picker>
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 分组和分隔线

用 `Section` 和 `Divider` 组织菜单操作：

~~~tsx
import { Host, ContextMenu, Button, Text, Section, Divider } from '@expo/ui/swift-ui';

export default function ContextMenuWithSectionsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Section title="Actions">
            <Button label="Edit" onPress={() => console.log('Edit')} />
            <Button label="Duplicate" onPress={() => console.log('Duplicate')} />
          </Section>
          <Divider />
          <Button label="Delete" role="destructive" onPress={() => console.log('Delete')} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 禁用菜单项

`disabled(true)` modifier 会让选项变灰且不可交互：

~~~tsx
import { Host, ContextMenu, Button, Text } from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';

export default function DisabledContextMenuItemExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button label="Locked" systemImage="lock" modifiers={[disabled(true)]} onPress={() => console.log('This never fires')} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 可选中项与勾选标记

当 `Toggle.isOn` 为 `true` 时，原生菜单会用勾选状态显示该项：

~~~tsx
import { useState } from 'react';
import { Host, ContextMenu, Toggle, Text } from '@expo/ui/swift-ui';

export default function CheckmarkContextMenuItemExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Toggle isOn={pinned} label="Pin" systemImage="pin" onIsOnChange={setPinned} />
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## 嵌套子菜单

在 `Items` 中再放一个 `ContextMenu` 可以建立层级菜单：

~~~tsx
import { Host, ContextMenu, Button, Text } from '@expo/ui/swift-ui';

export default function NestedContextMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Action" onPress={() => console.log('Action')} />
          <ContextMenu>
            <ContextMenu.Items>
              <Button label="Sub Action 1" onPress={() => console.log('Sub 1')} />
              <Button label="Sub Action 2" onPress={() => console.log('Sub 2')} />
            </ContextMenu.Items>
            <ContextMenu.Trigger><Button label="More Options" /></ContextMenu.Trigger>
          </ContextMenu>
        </ContextMenu.Items>
        <ContextMenu.Trigger><Text>Long press me</Text></ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## API 速查

| 子组件 | 用途 |
| --- | --- |
| `ContextMenu.Trigger` | 常驻展示的触发内容；长按打开菜单。 |
| `ContextMenu.Items` | 操作区域，可放 `Section`、`Divider`、`Button`、`Toggle`、`Picker` 或嵌套菜单。 |
| `ContextMenu.Preview` | 可选预览，在菜单打开时显示于菜单上方。 |

`ContextMenu` 接收 `children: React.ReactNode`，应包括 `Trigger` 和 `Items`，并可选择提供 `Preview`。它还继承 `CommonViewModifierProps`。

- **上下文菜单**：针对当前对象的就地操作菜单，iOS 原生手势为长按。
- **SF Symbols**：Apple 系统图标库，`systemImage` 接收图标名称。
- **modifier**：描述原生控件外观或行为的 Expo UI 修饰函数。
- **RNHostView**：把 React Native 子树嵌入 Expo UI 的 SwiftUI 视图树。

## 源页代码主题覆盖

已覆盖四种安装命令和官方八类用法：基础菜单、SF Symbols 图标、RNHostView 自定义预览、Picker 子菜单、Section / Divider 分组、禁用项、Toggle 勾选项及嵌套菜单。API 中 `Trigger`、`Items`、`Preview` 与可继承 modifier 也已列出。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/contextmenu/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/contextmenu/)

**翻页：**[上一页：SwiftUI ConfirmationDialog](./071-SwiftUI-ConfirmationDialog.md) · [目录](./README.md) · [下一页：SwiftUI ControlGroup](./073-SwiftUI-ControlGroup.md)
