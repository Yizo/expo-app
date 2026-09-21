# 107｜SwiftUI VStack

**翻页：**[上一页：SwiftUI useNativeState](./106-SwiftUI-useNativeState.md) · [目录](./README.md) · [下一页：SwiftUI ZStack](./108-SwiftUI-ZStack.md)

**官方页面：**[SwiftUI VStack · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/vstack/)

**版本边界：**Latest 与 [SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/vstack/)均推荐 `@expo/ui ~57.0.18` / `~56.0.26`。VStack 支持 iOS、tvOS，并可在 Expo Go 使用。需要跨平台布局可用 Expo UI universal `Column`。

## 沿垂直方向堆叠视图

`VStack` 从上到下排列子视图。`spacing` 控制行距，`alignment` 控制子项在水平方向的对齐，支持 `leading`、`center`、`trailing`。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本 VStack

当内容或对齐方式需要有可用空间时，为 Host 设置尺寸：

~~~tsx
import { Host, VStack, Text } from '@expo/ui/swift-ui';

export default function BasicVStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={12}>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </VStack>
    </Host>
  );
}
~~~

## 设置水平对齐

不同宽度的子视图可使用 `alignment="leading"` 对齐到起始侧：

~~~tsx
import { Host, VStack, Rectangle } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function VStackAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={12} alignment="leading">
        <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
        <Rectangle modifiers={[frame({ width: 100, height: 50 })]} />
        <Rectangle modifiers={[frame({ width: 75, height: 50 })]} />
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 依次纵向排列的子元素。 |
| `spacing` | `number`（可选） | 子元素之间的距离。 |
| `alignment` | `'leading' \| 'center' \| 'trailing'`（可选） | 水平方向的对齐方式。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **VStack**：SwiftUI 的垂直 Stack 容器；对应 HStack 的水平版本。
- **leading / trailing**：阅读方向的起始侧 / 末尾侧；RTL 布局中方向会反转。
- **间距**：Stack 中相邻子项之间由布局容器分配的空隙。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两个例子：基础纵向堆叠、以 leading / center / trailing 对齐不同宽度子视图；spacing 与 alignment 属性逐项说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/vstack/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/vstack/)

**翻页：**[上一页：SwiftUI useNativeState](./106-SwiftUI-useNativeState.md) · [目录](./README.md) · [下一页：SwiftUI ZStack](./108-SwiftUI-ZStack.md)
