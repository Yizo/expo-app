# 084｜SwiftUI LazyHStack

**翻页：**[上一页：SwiftUI Label](./083-SwiftUI-Label.md) · [目录](./README.md) · [下一页：SwiftUI LazyVStack](./085-SwiftUI-LazyVStack.md)

**官方页面：**[SwiftUI LazyHStack · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyhstack/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/lazyhstack/)推荐 `~56.0.26`。适用于 iOS / tvOS，可在 Expo Go 使用。Expo 提醒：目前原生侧只创建可见项，React 仍会预先创建全部子节点；大量数据请考虑 FlashList 或 Legend List。

## 横向滚动的延迟布局

`LazyHStack` 把子视图横向排列，并在它们进入滚动视口时才建立原生视图。需把它放在 `ScrollView axes="horizontal"` 中才能滚动和触发按需构建。与 RN `FlatList` 的完整虚拟列表不同，Expo UI 当前仍会让 React 先创建所有 children，因此大量子项在 React 渲染阶段仍有开销。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本横向滚动

~~~tsx
import {
  Host,
  ScrollView,
  LazyHStack,
  Text,
} from '@expo/ui/swift-ui';

export default function BasicLazyHStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView axes="horizontal">
        <LazyHStack spacing={12}>
          {Array.from({ length: 100 }, (_, i) => (
            <Text key={i}>{`Item ${i}`}</Text>
          ))}
        </LazyHStack>
      </ScrollView>
    </Host>
  );
}
~~~

## 设置纵向对齐

`alignment` 控制横向行中子项的垂直对齐。下面把不同高度的矩形按顶部对齐：

~~~tsx
import {
  Host,
  ScrollView,
  LazyHStack,
  Rectangle,
} from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function LazyHStackAlignmentExample() {
  return (
    <Host
      matchContents={{ horizontal: true }}
      style={{ flex: 1, alignSelf: 'center' }}>
      <ScrollView axes="horizontal">
        <LazyHStack spacing={12} alignment="top">
          <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 50, height: 100 })]} />
          <Rectangle modifiers={[frame({ width: 50, height: 75 })]} />
        </LazyHStack>
      </ScrollView>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 水平堆叠的子元素。 |
| `spacing` | `number`（可选） | 子元素之间的间距。 |
| `alignment` | `'top' \| 'center' \| 'bottom' \| 'firstTextBaseline' \| 'lastTextBaseline'`（可选） | 子元素的垂直对齐方式。 |

组件继承 `CommonViewModifierProps`。

### 新手术语与选择建议

- **Lazy / 延迟创建**：原生布局只在需要时建立可见的视图；不等于 JavaScript 数据也完全按需生成。
- **React children 预创建**：例如 `Array.from({ length: 100_000 })` 仍会先生成大量 React 元素，可能拖慢首屏。
- **虚拟列表**：根据可视区域复用少量单元格的大列表方案。Expo 的说明建议真正的大列表评估 FlashList 或 Legend List。
- **HStack 与 LazyHStack**：普通 HStack 一次排所有子项；LazyHStack 用于可滚动的大行内容，但当前仍受 React 侧预创建影响。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两种示例：横向 ScrollView 中的延迟布局，以及不同高度子视图的垂直对齐。另说明当前 React 仍会先创建所有子项，超大列表应考虑 FlashList 等列表方案。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyhstack/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/lazyhstack/)

**翻页：**[上一页：SwiftUI Label](./083-SwiftUI-Label.md) · [目录](./README.md) · [下一页：SwiftUI LazyVStack](./085-SwiftUI-LazyVStack.md)
