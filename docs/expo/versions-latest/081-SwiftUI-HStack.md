# 081｜SwiftUI HStack

**翻页：**[上一页：SwiftUI Host](./080-SwiftUI-Host.md) · [目录](./README.md) · [下一页：SwiftUI Image](./082-SwiftUI-Image.md)

**官方页面：**[SwiftUI HStack · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/hstack/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/hstack/)推荐 `~56.0.26`。`HStack` 为 iOS / tvOS 提供 SwiftUI 水平布局；需要跨平台布局时，可用 universal `Row`。

## 横向排列 SwiftUI 子视图

`HStack` 按从左到右的顺序排列子元素，类似 React Native `flexDirection: 'row'`。`spacing` 控制相邻元素的间距，`alignment` 控制高度不同的元素如何垂直对齐。需要把 SwiftUI `HStack` 放到 `Host` 中。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本水平布局

~~~tsx
import { Host, HStack, Text } from '@expo/ui/swift-ui';

export default function BasicHStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <HStack spacing={12}>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </HStack>
    </Host>
  );
}
~~~

## 调整垂直对齐

`alignment="top"` 把不同高度的子项顶边对齐。可选值还有 `center`、`bottom`、`firstTextBaseline` 和 `lastTextBaseline`。下面用不同尺寸的矩形展示对齐效果：

~~~tsx
import { Host, HStack, Rectangle } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function HStackAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <HStack spacing={12} alignment="top">
        <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
        <Rectangle
          modifiers={[frame({ width: 50, height: 100 })]}
        />
        <Rectangle modifiers={[frame({ width: 50, height: 75 })]} />
      </HStack>
    </Host>
  );
}
~~~

## API 速查

`HStack` 从 `@expo/ui/swift-ui` 导入，支持 iOS 与 tvOS。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 按水平方向排列的子元素。 |
| `spacing` | `number`（可选） | 子元素之间的距离。 |
| `alignment` | `'top' \| 'center' \| 'bottom' \| 'firstTextBaseline' \| 'lastTextBaseline'`（可选） | 子元素在垂直方向上的对齐方式。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **Stack**：SwiftUI 布局容器，`HStack` 表示水平堆叠；`VStack` 表示垂直堆叠。
- **Baseline / 文本基线**：排版时字形落在其上的假想线；基线对齐可让混合字号的文字看起来整齐。
- **原生与通用组件**：HStack 对应 Apple SwiftUI；`Row` 是 Expo UI 的跨平台抽象，会按平台渲染合适的原生实现。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两个用法示例：基础水平排列及按顶部对齐不同高度的子视图；spacing 与 alignment 类型在 API 表说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/hstack/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/hstack/)

**翻页：**[上一页：SwiftUI Host](./080-SwiftUI-Host.md) · [目录](./README.md) · [下一页：SwiftUI Image](./082-SwiftUI-Image.md)
