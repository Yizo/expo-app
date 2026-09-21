# 100｜SwiftUI Spacer

**翻页：**[上一页：SwiftUI Slider](./099-SwiftUI-Slider.md) · [目录](./README.md) · [下一页：SwiftUI SwipeActions](./101-SwiftUI-SwipeActions.md)

**官方页面：**[SwiftUI Spacer · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/spacer/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/spacer/)推荐 `~56.0.24`。SwiftUI Spacer 支持 iOS、tvOS，可在 Expo Go 使用。跨平台布局可用 universal `Spacer`。

## 在 Stack 中填充弹性空白

`Spacer` 会尽量扩展填满父级 Stack 的可用空间，把两侧内容推到相反两端。放在 `HStack` 时扩展横向空白，放在 `VStack` 时扩展纵向空白。`minLength` 可以设置它允许的最小长度。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 横向推开两侧内容

~~~tsx
import { Host, HStack, Text, Spacer } from '@expo/ui/swift-ui';

export default function SpacerHStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <HStack>
        <Text>Left</Text>
        <Spacer />
        <Text>Right</Text>
      </HStack>
    </Host>
  );
}
~~~

## 纵向推开顶部和底部内容

~~~tsx
import { Host, VStack, Text, Spacer } from '@expo/ui/swift-ui';

export default function SpacerVStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Text>Top</Text>
        <Spacer />
        <Text>Bottom</Text>
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `minLength` | `number`（可选） | Spacer 的最小长度 / 最小占用空间。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **弹性空间**：不画出可见内容，只吸收容器里剩余空间。
- **Stack**：SwiftUI 布局容器；HStack 的 Spacer 向左右扩张，VStack 的 Spacer 向上下扩张。
- **RN 对照**：作用有点像 flex 布局里的可伸展空白，但具体尺寸遵循 SwiftUI Stack 规则。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两个用法示例，分别在 HStack 与 VStack 中用弹性空白把首尾内容推向相反两端；`minLength` 属性已列入 API 表。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/spacer/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/spacer/)

**翻页：**[上一页：SwiftUI Slider](./099-SwiftUI-Slider.md) · [目录](./README.md) · [下一页：SwiftUI SwipeActions](./101-SwiftUI-SwipeActions.md)
