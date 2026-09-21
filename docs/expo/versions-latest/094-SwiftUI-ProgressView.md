# 094｜SwiftUI ProgressView

**翻页：**[上一页：SwiftUI Popover](./093-SwiftUI-Popover.md) · [目录](./README.md) · [下一页：SwiftUI RNHostView](./095-SwiftUI-RNHostView.md)

**官方页面：**[SwiftUI ProgressView · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/progressview/)推荐 `~56.0.26`。ProgressView 支持 iOS、tvOS，可在 Expo Go 使用。计时型进度要求 iOS 16+ / tvOS 16+。

## 显示加载或已完成进度

`ProgressView` 对应 SwiftUI 原生进度控件。无 `value` 时显示不确定进度（spinner）；`value` 在 0–1 范围时显示确定进度。线性样式会扩展填满可用宽度；圆形 spinner 有固有尺寸。若 Host 用 `matchContents`，线性进度需要用 `frame` 明确宽度，或给 Host 设置宽度 / `flex: 1`。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 不确定进度

未提供 `value` 时，原生控件自行显示仍在进行中的指示动画：

~~~tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';

export default function IndeterminateExample() {
  return (
    <Host matchContents>
      <ProgressView />
    </Host>
  );
}
~~~

## 确定进度

`value={0.5}` 表示 0–1 进度区间已完成一半：

~~~tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';

export default function DeterminateExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView value={0.5} />
    </Host>
  );
}
~~~

## 设置线性或圆形样式

`progressViewStyle` 支持 `automatic`、`linear`、`circular`：

~~~tsx
import {
  Host,
  ProgressView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { progressViewStyle } from '@expo/ui/swift-ui/modifiers';

export default function ProgressViewStylesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <Text>Linear</Text>
        <ProgressView
          value={0.5}
          modifiers={[progressViewStyle('linear')]}
        />
        <Text>Circular</Text>
        <ProgressView
          value={0.5}
          modifiers={[progressViewStyle('circular')]}
        />
      </VStack>
    </Host>
  );
}
~~~

## 给进度条加标签

把自定义 SwiftUI 视图作为 children，可说明当前进度代表什么：

~~~tsx
import { Host, ProgressView, Text } from '@expo/ui/swift-ui';

export default function LabelExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView value={0.25}>
        <Text>Loading...</Text>
      </ProgressView>
    </Host>
  );
}
~~~

## 改变进度颜色

用 `tint` modifier 设置进度强调色：

~~~tsx
import { Host, ProgressView } from '@expo/ui/swift-ui';
import { tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ProgressView value={0.7} modifiers={[tint('red')]} />
    </Host>
  );
}
~~~

## 依据时间区间自动变化

`timerInterval` 让系统按时间区间自动更新进度，可用作倒计时或计时任务。`countsDown` 默认 `true`，即随时间经过进度逐渐变空；设为 `false` 时则递增。此能力要求 iOS 16+ / tvOS 16+：

~~~tsx
import {
  Host,
  ProgressView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';

export default function TimerExample() {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 10000); // 10 秒后

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <ProgressView
          timerInterval={{ lower: startDate, upper: endDate }}
        />
        <ProgressView
          timerInterval={{ lower: startDate, upper: endDate }}
          countsDown={false}>
          <Text>Counting up</Text>
        </ProgressView>
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `number \| null`（可选） | 0–1 的当前进度；未提供时显示不确定动画。 |
| `children` | `React.ReactNode`（可选） | 说明进度用途的标签内容。 |
| `timerInterval` | `{ lower: Date; upper: Date }`（可选，iOS/tvOS 16+） | 自动计算计时型进度的开始和结束日期。 |
| `countsDown` | `boolean`（可选，默认 `true`，iOS/tvOS 16+） | `true` 随时间流逝变空；`false` 随时间流逝增加。 |

组件继承 `CommonViewModifierProps`，可使用 `progressViewStyle` 和 `tint` 等 modifier。

### 新手术语

- **不确定进度**：不知道要花多久，只提示“仍在加载”；例如等待一个耗时未知的请求。
- **确定进度**：可以计算 0–1 完成值；例如文件上传比例。
- **弹性宽度**：线性进度条想要填满父容器，不像 spinner 那样有固定固有宽度。
- **timerInterval**：用开始 / 结束 Date 交给系统随时间自动变化；它不取代网络任务的真实进度回调。

## 源页代码主题覆盖

已覆盖四种安装命令和官方六类用法：不确定进度、确定进度、Linear / Circular 样式、文字标签、tint 着色及按时间范围自动倒计时 / 正计时。API 表列出 `value`、`timerInterval` 与 `countsDown`。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/progressview/)

**翻页：**[上一页：SwiftUI Popover](./093-SwiftUI-Popover.md) · [目录](./README.md) · [下一页：SwiftUI RNHostView](./095-SwiftUI-RNHostView.md)
