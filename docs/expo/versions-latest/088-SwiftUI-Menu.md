# 088｜SwiftUI Menu

**翻页：**[上一页：SwiftUI List](./087-SwiftUI-List.md) · [目录](./README.md) · [下一页：SwiftUI Modifiers](./089-SwiftUI-Modifiers.md)

**官方页面：**[SwiftUI Menu · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/menu/)推荐 `~56.0.26`。支持 iOS、tvOS，并可在 Expo Go 使用；tvOS 至少需要 tvOS 17。菜单默认单击打开；如果要长按触发，应使用 `ContextMenu`。Latest 页的 disabled items、Toggle 勾选示例未出现在 SDK 56 页面中，使用时先核对目标 SDK 的可用 API。

## 单击展开的系统菜单

SwiftUI `Menu` 在用户单击触发标签后显示一组操作。它与长按后弹出的 `ContextMenu` 不同。Expo UI 菜单子项可放 `Button`、`Toggle`、`Picker`、`Section`、`Divider` 或嵌套 `Menu`。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 简单文字菜单

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';

export default function SimpleMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Options">
        <Button label="Option 1" onPress={() => console.log('Option 1')} />
        <Button label="Option 2" onPress={() => console.log('Option 2')} />
        <Button label="Option 3" onPress={() => console.log('Option 3')} />
      </Menu>
    </Host>
  );
}
~~~

## 文字与 SF Symbol

`systemImage` 为菜单入口和菜单项添加系统符号；`role="destructive"` 将删除项标记为危险操作：

~~~tsx
import { Host, Menu, Button, Divider } from '@expo/ui/swift-ui';

export default function MenuWithIconExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="More" systemImage="ellipsis.circle">
        <Button label="Settings" systemImage="gear" onPress={() => console.log('Settings')} />
        <Button label="Profile" systemImage="person" onPress={() => console.log('Profile')} />
        <Divider />
        <Button
          label="Delete"
          role="destructive"
          systemImage="trash"
          onPress={() => console.log('Delete')}
        />
      </Menu>
    </Host>
  );
}
~~~

## 自定义菜单入口标签

`label` 可以接收 React node，以自定义触发菜单的文字样式：

~~~tsx
import { Host, Menu, Button, Text } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function CustomLabelMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label={
          <Text modifiers={[foregroundStyle('accentColor')]}>Custom Label</Text>
        }>
        <Button label="Action 1" onPress={() => console.log('Action 1')} />
        <Button label="Action 2" onPress={() => console.log('Action 2')} />
      </Menu>
    </Host>
  );
}
~~~

## 用 React Native 视图作入口

若要使用 React Native `Pressable` 等组件作为菜单入口，需用 `RNHostView` 把它嵌入 SwiftUI 菜单的 label：

~~~tsx
import { Host, Menu, Button, RNHostView } from '@expo/ui/swift-ui';
import { Pressable, Text } from 'react-native';

export default function RNLabelMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label={
          <RNHostView matchContents>
            <Pressable
              onPress={() => console.log('RN trigger pressed')}
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: '#9B59B6',
              }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>
                RN Pressable Trigger
              </Text>
            </Pressable>
          </RNHostView>
        }>
        <Button label="Item 1" onPress={() => console.log('Item 1')} />
        <Button label="Item 2" onPress={() => console.log('Item 2')} />
      </Menu>
    </Host>
  );
}
~~~

## 嵌套子菜单

在菜单项中再放一个 `Menu`，形成子菜单：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';

export default function NestedMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Main Menu">
        <Button label="Item 1" onPress={() => console.log('Item 1')} />
        <Menu label="Submenu">
          <Button label="Sub Item 1" onPress={() => console.log('Sub Item 1')} />
          <Button label="Sub Item 2" onPress={() => console.log('Sub Item 2')} />
        </Menu>
        <Button label="Item 2" onPress={() => console.log('Item 2')} />
      </Menu>
    </Host>
  );
}
~~~

## 给入口增加主要动作

提供 `onPrimaryAction` 后，单击入口会运行主要动作；长按入口才打开菜单：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';

export default function PrimaryActionMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label="Tap or hold"
        systemImage="play.circle"
        onPrimaryAction={() => console.log('Primary action triggered!')}>
        <Button label="Menu Item 1" onPress={() => console.log('Menu Item 1')} />
        <Button label="Menu Item 2" onPress={() => console.log('Menu Item 2')} />
        <Button label="Menu Item 3" onPress={() => console.log('Menu Item 3')} />
      </Menu>
    </Host>
  );
}
~~~

## 使用 buttonStyle 修饰入口

`buttonStyle` 改变菜单触发按钮外观：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function StyledMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Styled Menu" modifiers={[buttonStyle('borderedProminent')]}>
        <Button label="Styled Action 1" onPress={() => console.log('Styled 1')} />
        <Button label="Styled Action 2" onPress={() => console.log('Styled 2')} />
      </Menu>
    </Host>
  );
}
~~~

## iOS Liquid Glass 样式

用 `buttonStyle('glass')` 或 `buttonStyle('glassProminent')`。不要把 `glassEffect()` 加在 Menu label 上；官方指出这会在关闭动画时出现矩形光晕，应使用 `buttonStyle`：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function GlassMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label="Glass Menu"
        systemImage="ellipsis.circle"
        modifiers={[buttonStyle('glass')]}>
        <Button label="Action 1" onPress={() => console.log('Action 1')} />
        <Button label="Action 2" onPress={() => console.log('Action 2')} />
      </Menu>
    </Host>
  );
}
~~~

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function GlassProminentMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label="Glass Prominent Menu"
        systemImage="slider.horizontal.3"
        modifiers={[buttonStyle('glassProminent')]}>
        <Button label="Settings" systemImage="gear" onPress={() => console.log('Settings')} />
        <Button
          label="Filter"
          systemImage="line.3.horizontal.decrease"
          onPress={() => console.log('Filter')}
        />
      </Menu>
    </Host>
  );
}
~~~

## ControlGroup 快捷按钮

`ControlGroup` 可在菜单内把相关图标操作排列成一排：

~~~tsx
import {
  Host,
  Menu,
  ControlGroup,
  Button,
  Section,
  Divider,
} from '@expo/ui/swift-ui';

export default function MenuWithControlGroupExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Song Options" systemImage="ellipsis.circle">
        <ControlGroup>
          <Button systemImage="plus" label="Add" onPress={() => console.log('Add')} />
          <Button systemImage="star" label="Favorite" onPress={() => console.log('Favorite')} />
          <Button
            systemImage="square.and.arrow.up"
            label="Share"
            onPress={() => console.log('Share')}
          />
        </ControlGroup>
        <Section>
          <Button
            systemImage="text.badge.plus"
            label="Add to a playlist"
            onPress={() => console.log('Add to playlist')}
          />
          <Button
            systemImage="antenna.radiowaves.left.and.right"
            label="Create station"
            onPress={() => console.log('Create station')}
          />
        </Section>
        <Divider />
        <Button
          systemImage="hand.thumbsdown"
          label="Suggest less"
          onPress={() => console.log('Suggest less')}
        />
      </Menu>
    </Host>
  );
}
~~~

## 禁用菜单项

Latest 示例用 `disabled(true)` modifier 将菜单按钮变灰并禁用点击；该示例未出现在 SDK 56 页面：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';

export default function DisabledMenuItemExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Options">
        <Button label="Available" onPress={() => console.log('Available')} />
        <Button
          label="Locked"
          systemImage="lock"
          modifiers={[disabled(true)]}
          onPress={() => console.log('This never fires')}
        />
      </Menu>
    </Host>
  );
}
~~~

## Toggle 勾选状态

Latest 示例中，菜单内的 `Toggle` 会显示勾选状态；`isOn` 与 React state 同步。该 Toggle 示例未出现在 SDK 56 页面：

~~~tsx
import { Host, Menu, Button, Toggle } from '@expo/ui/swift-ui';
import { useState } from 'react';

export default function CheckmarkMenuItemExample() {
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Menu label="Filter" systemImage="line.3.horizontal.decrease.circle">
        <Toggle
          isOn={showCompleted}
          label="Show completed"
          systemImage="checkmark.circle"
          onIsOnChange={setShowCompleted}
        />
        <Toggle
          isOn={showArchived}
          label="Show archived"
          systemImage="archivebox"
          onIsOnChange={setShowArchived}
        />
        <Button label="Clear filters" onPress={() => console.log('Clear')} />
      </Menu>
    </Host>
  );
}
~~~

## 只显示图标的菜单按钮

`labelStyle('iconOnly')` 隐藏可见入口文字。仍要提供有含义的 `label`，让辅助功能可以说出按钮用途：

~~~tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

export default function IconOnlyMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Menu
        label="More options"
        systemImage="ellipsis.circle"
        modifiers={[labelStyle('iconOnly')]}>
        <Button label="Menu Item 1" onPress={() => console.log('Menu Item 1')} />
        <Button label="Menu Item 2" onPress={() => console.log('Menu Item 2')} />
        <Button label="Menu Item 3" onPress={() => console.log('Menu Item 3')} />
      </Menu>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 菜单展开时显示的内容，可包含 Button、Toggle、Picker、Section、Divider 或嵌套 Menu。 |
| `label` | `React.ReactNode`（必填） | 菜单触发视图的标题，可为字符串或自定义视图。 |
| `systemImage` | `string`（可选） | 当 `label` 是字符串时，在入口标题旁显示的 SF Symbol 名称。 |
| `onPrimaryAction` | `() => void`（可选） | 单击入口时执行；菜单改为长按打开。未提供时单击直接展开菜单。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **Menu**：单击即展开的操作菜单；长按上下文菜单对应 `ContextMenu`。
- **primary action**：用户单击菜单入口时直接完成的主要操作；提供后，菜单本身变成长按出现。
- **RNHostView**：让 React Native 视图（如 Pressable）作为 SwiftUI 菜单入口。
- **Liquid Glass**：Apple 的玻璃视觉风格；Expo 文档要求用 Menu 的 `buttonStyle` modifier，避免直接在 label 上加 glassEffect。

## 源页代码主题覆盖

已覆盖四种安装命令和官方十三个代码示例：文字菜单、图标菜单、自定义 / React Native 入口、嵌套菜单、主要动作、按钮样式、两种 Liquid Glass 样式、ControlGroup、禁用项、Toggle 勾选与只显示图标；API 速查覆盖触发行为与组件属性。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/menu/)

**翻页：**[上一页：SwiftUI List](./087-SwiftUI-List.md) · [目录](./README.md) · [下一页：SwiftUI Modifiers](./089-SwiftUI-Modifiers.md)
