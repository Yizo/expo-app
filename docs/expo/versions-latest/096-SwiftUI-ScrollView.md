# 096｜SwiftUI ScrollView

**翻页：**[上一页：SwiftUI RNHostView](./095-SwiftUI-RNHostView.md) · [目录](./README.md) · [下一页：SwiftUI Section](./097-SwiftUI-Section.md)

**官方页面：**[SwiftUI ScrollView · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/scrollview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/scrollview/)推荐 `~56.0.26`。SwiftUI ScrollView 支持 iOS、tvOS，可在 Expo Go 使用。跨平台界面可用 Expo UI universal ScrollView。

## 原生可滚动容器

`ScrollView` 为其子内容提供原生滚动。默认纵向滚动，`axes` 可改为横向或双轴。内容过长时，控件提供手势、滚动指示器和平台原生行为。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 纵向滚动

下面以 `VStack` 放置 30 条文本；`padding` modifier 为文本添加左右边距：

~~~tsx
import { Host, ScrollView, VStack, Text } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function ScrollViewVerticalExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <VStack spacing={8}>
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={i} modifiers={[padding({ horizontal: 16 })]}>
              {`Item ${i + 1}`}
            </Text>
          ))}
        </VStack>
      </ScrollView>
    </Host>
  );
}
~~~

## 横向滚动

设 `axes="horizontal"`，内部用 `HStack` 横向排元素；每个圆角矩形根据索引生成不同 HSL 颜色：

~~~tsx
import {
  Host,
  ScrollView,
  HStack,
  RoundedRectangle,
} from '@expo/ui/swift-ui';
import {
  frame,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function ScrollViewHorizontalExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView axes="horizontal">
        <HStack spacing={8}>
          {Array.from({ length: 20 }, (_, i) => (
            <RoundedRectangle
              key={i}
              cornerRadius={12}
              modifiers={[
                frame({ width: 100, height: 100 }),
                foregroundStyle(`hsl(${i * 18}, 70%, 50%)`),
              ]}
            />
          ))}
        </HStack>
      </ScrollView>
    </Host>
  );
}
~~~

## 隐藏滚动指示器

基础属性 `showsIndicators={false}` 隐藏滚动条。若需按方向设置 richer policy，可改用 `scrollIndicators(...)` modifier：

~~~tsx
import { Host, ScrollView, VStack, Text } from '@expo/ui/swift-ui';

export default function ScrollViewHiddenIndicatorsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView showsIndicators={false}>
        <VStack spacing={8}>
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={i}>{`Item ${i + 1}`}</Text>
          ))}
        </VStack>
      </ScrollView>
    </Host>
  );
}
~~~

## 读写当前位置

滚动位置链接要求 iOS 17+；更低版本该 modifier 是 no-op。用 `id` 标记每个目标，将内容容器标记为 `scrollTargetLayout()`，再用 `scrollPosition` 绑定 `useNativeState`。向 `state.value` 写入目标 ID 后会跳转到该项；写入必须在 UI runtime 执行，所以使用 `scheduleOnUI` 或 worklet：

~~~tsx
import {
  Button,
  Host,
  ScrollView,
  Text,
  VStack,
  useNativeState,
} from '@expo/ui/swift-ui';
import {
  id,
  padding,
  scrollPosition,
  scrollTargetLayout,
} from '@expo/ui/swift-ui/modifiers';
import { scheduleOnUI } from 'react-native-worklets';

export default function ScrollViewSharedPositionExample() {
  const activeID = useNativeState<string | null>(null);

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={12}>
        <ScrollView
          modifiers={[
            scrollPosition(activeID, {
              onChange: newID => {
                console.log('[JS thread] leading target:', newID);
              },
            }),
          ]}>
          <VStack modifiers={[scrollTargetLayout()]}>
            {Array.from({ length: 30 }, (_, i) => (
              <Text
                key={`item-${i}`}
                modifiers={[
                  id(`item-${i}`),
                  padding({ horizontal: 16, vertical: 12 }),
                ]}>
                {`Item ${i}`}
              </Text>
            ))}
          </VStack>
        </ScrollView>
        <Button
          label="Scroll to item 10 from worklet"
          onPress={() => {
            scheduleOnUI(() => {
              'worklet';
              activeID.value = 'item-10';
            });
          }}
        />
      </VStack>
    </Host>
  );
}
~~~

在 API 说明中还可用 `withAnimation(...)` 包住状态写入，为目标滚动添加动画。

## API 与类型速查

| 属性 / 类型 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `axes` | `'vertical' \| 'horizontal' \| 'both'`，默认 `vertical` | 可滚动方向。 |
| `children` | `React.ReactNode` | 可滚动内容。 |
| `showsIndicators` | `boolean`，默认 `true` | 是否显示系统滚动指示器。更细控制可用 `scrollIndicators` modifier。 |
| `ScrollGeometry` | 类型 | 可视容器宽 / 高，内容宽 / 高，及 `contentOffsetX`、`contentOffsetY`。配合滚动几何 API 读取。 |
| `ScrollPhase` | `'idle' \| 'tracking' \| 'interacting' \| 'animating' \| 'decelerating'` | ScrollView 当前交互 / 动画阶段；来自 iOS / tvOS 18+ 的 `onScrollPhaseChange`。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **scroll target**：可作为滚动定位目标的子视图，通常使用 `id()` 修饰符标记。
- **`useNativeState`**：Expo UI 的原生 observable state；scrollPosition 的同步写入要在 UI 线程执行。
- **UI runtime**：运行原生动画 / 布局 worklet 的 UI 执行环境；不能从普通 JS 线程直接调用所有 UIKit 操作。
- **content offset**：滚动内容相对视口已移动的距离。

## 源页代码主题覆盖

已覆盖四种安装命令及官方四个代码主题：垂直滚动、横向滚动、隐藏滚动指示器、以 `useNativeState` 与 `scheduleOnUI` 读取和更新共享滚动位置。滚动几何、目标 ID 与 iOS 版本限制均有说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/scrollview/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/scrollview/)

**翻页：**[上一页：SwiftUI RNHostView](./095-SwiftUI-RNHostView.md) · [目录](./README.md) · [下一页：SwiftUI Section](./097-SwiftUI-Section.md)
