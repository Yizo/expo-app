# 076｜SwiftUI Divider

**翻页：**[上一页：SwiftUI DisclosureGroup](./075-SwiftUI-DisclosureGroup.md) · [目录](./README.md) · [下一页：SwiftUI Form](./077-SwiftUI-Form.md)

**官方页面：**[SwiftUI Divider · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/divider/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/divider/)列出配套版本 `~56.0.18`。这是 SwiftUI 原生分隔视图，支持 iOS 与 tvOS，可在 Expo Go 中使用。

## 使用原生分隔线区分内容

`Divider` 画出一条原生分隔线，帮助用户看出内容区块或菜单操作的分组。它没有业务属性，布局尺寸由父容器和系统样式决定。用 Expo UI 的 `Host` 承载，在 `VStack` 中通常表现为水平分隔线。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 分隔两个内容区

~~~tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function BasicDividerExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Text>First section</Text>
        <Divider />
        <Text>Second section</Text>
      </VStack>
    </Host>
  );
}
~~~

## 列表项之间加分隔线

`VStack` 用 `spacing={8}` 为相邻内容留间距；`Divider` 单独占一行作为视觉分隔：

~~~tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function DividerInListExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Text>Item 1</Text>
        <Divider />
        <Text>Item 2</Text>
        <Divider />
        <Text>Item 3</Text>
        <Divider />
        <Text>Item 4</Text>
      </VStack>
    </Host>
  );
}
~~~

## 在上下文菜单中分隔操作

把分隔线放在不同操作组之间；下面将编辑、复制与删除分开：

~~~tsx
import {
  Host,
  ContextMenu,
  Button,
  Text,
  Divider,
} from '@expo/ui/swift-ui';

export default function DividerInContextMenuExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button label="Duplicate" onPress={() => console.log('Duplicate')} />
          <Divider />
          <Button
            label="Delete"
            role="destructive"
            onPress={() => console.log('Delete')}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Text>Long press me</Text>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
~~~

## API

导入自 `@expo/ui/swift-ui`。`Divider` 使用原生 SwiftUI `Divider`，作为视觉分隔元素；它不定义额外的组件属性，但继承 `CommonViewModifierProps`。

### 新手术语

- **SwiftUI**：Apple 的声明式原生界面框架；Expo UI 提供对应的 React 组件封装。
- **VStack**：SwiftUI 的垂直布局容器，按从上到下排列子项。
- **视觉分隔**：帮助眼睛区分相邻内容的线条或留白；分隔线本身不会添加交互行为。

## 源页代码主题覆盖

已覆盖四种安装命令和官方三个用法：两个内容块之间、纵向列表条目之间、ContextMenu 操作分组之间插入 Divider；组件平台支持与继承 modifier 已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/divider/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/divider/)

**翻页：**[上一页：SwiftUI DisclosureGroup](./075-SwiftUI-DisclosureGroup.md) · [目录](./README.md) · [下一页：SwiftUI Form](./077-SwiftUI-Form.md)
