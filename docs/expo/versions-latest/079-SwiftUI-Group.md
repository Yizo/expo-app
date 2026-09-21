# 079｜SwiftUI Group

**翻页：**[上一页：SwiftUI Gauge](./078-SwiftUI-Gauge.md) · [目录](./README.md) · [下一页：SwiftUI Host](./080-SwiftUI-Host.md)

**官方页面：**[SwiftUI Group · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/group/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/group/)推荐 `~56.0.24`。SwiftUI `Group` 支持 iOS、tvOS，并可在 Expo Go 中使用。

## 组合视图而不增加布局层

`Group` 把多个视图归为一个逻辑组，但自身不会像 `VStack` 或 `View` 一样新增可见布局结构。它适合将同一 modifier 一次应用给多个子视图，也可以组织条件渲染的子树。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 一次给多个子视图应用 modifier

`foregroundStyle('blue')` 同时作用于 Group 内的三个 `Text`；由于 Group 不负责排列，`VStack` 才提供垂直布局：

~~~tsx
import { Group, Host, Text, VStack } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function BasicGroupExample() {
  return (
    <Host matchContents style={{ alignSelf: 'center' }}>
      <VStack spacing={8}>
        <Group modifiers={[foregroundStyle('blue')]}>
          <Text>First item</Text>
          <Text>Second item</Text>
          <Text>Third item</Text>
        </Group>
      </VStack>
    </Host>
  );
}
~~~

## API

`Group` 从 `@expo/ui/swift-ui` 导入，接收 `children: React.ReactNode`，并继承 `CommonViewModifierProps`。它主要是一个逻辑容器，不提供宽高或布局方向属性。

### 和 React / Web 的关系

- React 的 `Fragment`（`<>...</>`）同样用于避免新增 DOM 节点。
- Web 的 `div` 与 React Native 的 `View` 通常参与布局；SwiftUI `Group` 不会添加一层可见布局容器。
- 在 Expo UI 的 SwiftUI 树里，实际排列应由 `VStack`、`HStack` 等布局组件负责。

## 源页代码主题覆盖

已覆盖四种安装命令和官方基础 Group 示例，展示对多个子视图统一应用 `foregroundStyle` 而不增加布局层；children 与继承 modifier 在 API 说明中注明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/group/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/group/)

**翻页：**[上一页：SwiftUI Gauge](./078-SwiftUI-Gauge.md) · [目录](./README.md) · [下一页：SwiftUI Host](./080-SwiftUI-Host.md)
