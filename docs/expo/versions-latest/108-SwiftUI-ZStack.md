# 108｜SwiftUI ZStack

**翻页：**[上一页：SwiftUI VStack](./107-SwiftUI-VStack.md) · [目录](./README.md) · [下一页：Expo UI Universal Overview](./109-Universal-Overview.md)

**官方页面：**[SwiftUI ZStack · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/zstack/)推荐 `~56.0.24`。`ZStack` 支持 iOS、tvOS，并可在 Expo Go 使用；跨平台叠放布局可查看 Expo UI universal Overview。

## 沿 Z 轴叠放视图

`ZStack` 把子视图放在同一平面位置上，由前后次序形成覆盖关系，常用于文字压在背景色块上或图标上的角标。`alignment` 控制子视图在重叠区域中的位置，支持 center、四边与四个角。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本重叠布局

下面用文字覆盖在蓝色矩形上：

~~~tsx
import { Host, ZStack, Rectangle, Text } from '@expo/ui/swift-ui';
import { frame, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function BasicZStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ZStack>
        <Rectangle
          modifiers={[
            frame({ width: 100, height: 100 }),
            foregroundStyle('blue'),
          ]}
        />
        <Text modifiers={[foregroundStyle('white')]}>Overlay</Text>
      </ZStack>
    </Host>
  );
}
~~~

## 控制重叠位置

`alignment="bottomTrailing"` 将较小的红色圆形放在蓝色方块的右下角：

~~~tsx
import { Host, ZStack, Rectangle, Circle } from '@expo/ui/swift-ui';
import {
  frame,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function ZStackAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ZStack alignment="bottomTrailing">
        <Rectangle
          modifiers={[
            frame({ width: 100, height: 100 }),
            foregroundStyle('blue'),
          ]}
        />
        <Circle
          modifiers={[
            frame({ width: 30, height: 30 }),
            foregroundStyle('red'),
          ]}
        />
      </ZStack>
    </Host>
  );
}
~~~

## 创建未带数字的通知角标

`ZStack alignment="topTrailing"` 将红色圆点叠放到通知铃铛右上角：

~~~tsx
import {
  Host,
  ZStack,
  Circle,
  Image,
} from '@expo/ui/swift-ui';
import {
  frame,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function ZStackBadgeExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ZStack alignment="topTrailing">
        <Image systemName="bell.fill" size={32} color="blue" />
        <Circle
          modifiers={[
            frame({ width: 16, height: 16 }),
            foregroundStyle('red'),
          ]}
        />
      </ZStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 沿 Z 轴重叠摆放的子视图。 |
| `alignment` | SwiftUI `Alignment`（可选） | 子视图在叠放区域中的对齐锚点。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **Z 轴**：屏幕深度方向；二维屏幕上看起来就是元素之间的覆盖层级。
- **ZStack**：会把子元素叠起来的布局容器；与 HStack / VStack 的横向 / 纵向排列不同。
- **角标**：通常放在图标角落的小圆点或数字提示。
- **Alignment**：决定 overlay 与底层视图对齐到中心、边缘或角落。

## 源页代码主题覆盖

已覆盖四种安装命令和官方三个例子：基础内容重叠、设置子项对齐位置、用圆点为系统图标创建 badge；alignment 类型已列出。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/zstack/)

**翻页：**[上一页：SwiftUI VStack](./107-SwiftUI-VStack.md) · [目录](./README.md) · [下一页：Expo UI Universal Overview](./109-Universal-Overview.md)
