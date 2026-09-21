# 085｜SwiftUI LazyVStack

**翻页：**[上一页：SwiftUI LazyHStack](./084-SwiftUI-LazyHStack.md) · [目录](./README.md) · [下一页：SwiftUI Link](./086-SwiftUI-Link.md)

**官方页面：**[SwiftUI LazyVStack · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyvstack/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/lazyvstack/)推荐 `~56.0.25`。组件适用于 iOS、tvOS，可在 Expo Go 使用。Expo 官方提醒：当前 React 仍会预先创建所有子节点；超大列表请使用专门的虚拟列表方案。

## 可滚动的垂直延迟布局

`LazyVStack` 从上到下排列子项，进入滚动视口时再创建对应的原生视图。要获得滚动效果，需要把它放在 SwiftUI `ScrollView` 中。注意：Expo 当前实现在 React 层仍会先创建全部 children，所以它不能替代大规模数据列表的 `FlatList` / FlashList。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本纵向列表

~~~tsx
import {
  Host,
  ScrollView,
  LazyVStack,
  Text,
} from '@expo/ui/swift-ui';

export default function BasicLazyVStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <LazyVStack spacing={12}>
          {Array.from({ length: 100 }, (_, i) => (
            <Text key={i}>{`Item ${i}`}</Text>
          ))}
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}
~~~

## 设置横向对齐

`alignment` 控制纵向堆叠中子项的水平对齐，支持 `leading`、`center`、`trailing`。示例用不同宽度的矩形展示 leading 对齐：

~~~tsx
import {
  Host,
  ScrollView,
  LazyVStack,
  Rectangle,
} from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function LazyVStackAlignmentExample() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <ScrollView>
        <LazyVStack spacing={12} alignment="leading">
          <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 100, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 75, height: 50 })]} />
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 垂直堆叠的子元素。 |
| `spacing` | `number`（可选） | 子元素之间的间距。 |
| `alignment` | `'leading' \| 'center' \| 'trailing'`（可选） | 子元素的水平对齐方式。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **LazyVStack**：原生滚动中只创建进入可视范围的 SwiftUI 项目。
- **leading / trailing**：跟随阅读方向的起始边 / 结束边，适配从右向左的语言；英语 / 中文通常对应左 / 右。
- **列表虚拟化边界**：当前 Expo 文档说明 React 仍会创建所有子节点；真正的大列表考虑 FlashList 或 Legend List。

## 源页代码主题覆盖

已覆盖四种安装命令和官方两种示例：ScrollView 中的垂直延迟列表，以及不同宽度子视图的水平对齐。另说明当前 React 仍会先创建所有子项，超大列表应考虑 FlashList 等列表方案。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyvstack/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/lazyvstack/)

**翻页：**[上一页：SwiftUI LazyHStack](./084-SwiftUI-LazyHStack.md) · [目录](./README.md) · [下一页：SwiftUI Link](./086-SwiftUI-Link.md)
