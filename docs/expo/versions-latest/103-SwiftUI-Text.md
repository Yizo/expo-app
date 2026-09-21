# 103｜SwiftUI Text

**翻页：**[上一页：SwiftUI TabView](./102-SwiftUI-TabView.md) · [目录](./README.md) · [下一页：SwiftUI TextField](./104-SwiftUI-TextField.md)

**官方页面：**[SwiftUI Text · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/)

**版本边界：**Latest 与 [SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/text/)均推荐 `@expo/ui ~57.0.19` / `~56.0.26`。SwiftUI Text 支持 iOS、tvOS，并可在 Expo Go 使用。跨平台场景可用 Expo UI universal `Text`。

## 原生文本与内联格式

`Text` 显示 SwiftUI 原生文字，并支持嵌套 `Text` 按片段设样式。和 Web 的任意 HTML 文本不同，嵌套 Text 使用 SwiftUI 的文本拼接机制；子 Text 中仅能使用会返回 Text 的 modifier，例如 `bold`、`italic`、`font`、`foregroundColor`、颜色型 `foregroundStyle`。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基础文字

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';

export default function BasicTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text>Hello world</Text>
    </Host>
  );
}
~~~

## 整段文本加样式

`modifiers` 会应用于整段文字：

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function StyledTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text
        modifiers={[
          font({ size: 24, weight: 'bold' }),
          foregroundStyle('blue'),
        ]}>
        Large Bold Blue Text
      </Text>
    </Host>
  );
}
~~~

## 嵌套文本逐段设置样式

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';
import {
  bold,
  italic,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function NestedTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text>
        Hello{' '}
        <Text modifiers={[bold(), foregroundStyle('red')]}>world</Text>
        !
      </Text>
    </Host>
  );
}
~~~

## 混合多种内联样式

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';
import {
  bold,
  italic,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function MixedStylesExample() {
  return (
    <Host matchContents>
      <Text>
        This is <Text modifiers={[bold()]}>bold</Text>,{' '}
        <Text modifiers={[italic()]}>italic</Text>, and{' '}
        <Text modifiers={[foregroundStyle('orange')]}>colored</Text>{' '}
        text.
      </Text>
    </Host>
  );
}
~~~

## 字重选项

`font({ weight })` 支持系统字重：

~~~tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
import { font } from '@expo/ui/swift-ui/modifiers';

export default function FontWeightsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={4}>
        <Text modifiers={[font({ weight: 'ultraLight' })]}>Ultra Light</Text>
        <Text modifiers={[font({ weight: 'light' })]}>Light</Text>
        <Text modifiers={[font({ weight: 'regular' })]}>Regular</Text>
        <Text modifiers={[font({ weight: 'medium' })]}>Medium</Text>
        <Text modifiers={[font({ weight: 'semibold' })]}>Semibold</Text>
        <Text modifiers={[font({ weight: 'bold' })]}>Bold</Text>
        <Text modifiers={[font({ weight: 'heavy' })]}>Heavy</Text>
        <Text modifiers={[font({ weight: 'black' })]}>Black</Text>
      </VStack>
    </Host>
  );
}
~~~

## 字体设计

`font({ design })` 可指定 system default、rounded、serif 或 monospaced：

~~~tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
import { font } from '@expo/ui/swift-ui/modifiers';

export default function FontDesignsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={4}>
        <Text modifiers={[font({ design: 'default', size: 18 })]}>
          Default Design
        </Text>
        <Text modifiers={[font({ design: 'rounded', size: 18 })]}>
          Rounded Design
        </Text>
        <Text modifiers={[font({ design: 'serif', size: 18 })]}>
          Serif Design
        </Text>
        <Text modifiers={[font({ design: 'monospaced', size: 18 })]}>
          Monospaced Design
        </Text>
      </VStack>
    </Host>
  );
}
~~~

## 使用自定义字体

`font({ family })` 选择字体族；先用 `expo-font` 加载并注册自定义字体：

~~~tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
import { font } from '@expo/ui/swift-ui/modifiers';

export default function CustomFontExample() {
  return (
    <Host matchContents style={{ alignSelf: 'center' }}>
      <VStack spacing={4}>
        <Text modifiers={[font({ family: 'Inter-Bold', size: 18 })]}>
          Inter Bold
        </Text>
        <Text modifiers={[font({ family: 'Inter-Regular', size: 18 })]}>
          Inter Regular
        </Text>
      </VStack>
    </Host>
  );
}
~~~

## 限制文本行数

`lineLimit(2)` 最多显示两行，后续内容按系统规则截断：

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';
import { lineLimit } from '@expo/ui/swift-ui/modifiers';

export default function LineLimitExample() {
  const longText =
    'This is a very long text that will be truncated after two lines. '.repeat(5);

  return (
    <Host style={{ flex: 1 }}>
      <Text modifiers={[lineLimit(2)]}>{longText}</Text>
    </Host>
  );
}
~~~

## 启用 Markdown 格式

传 `markdownEnabled` 后 SwiftUI 会解析受支持的 Markdown 样式：

~~~tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';

export default function MarkdownTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={4}>
        <Text markdownEnabled>Regular text.</Text>
        <Text markdownEnabled>
          This is **bold text**, *italic text* and ***text in both
          bold and italic***.
        </Text>
        <Text markdownEnabled>~~Strikethrough text~~</Text>
        <Text markdownEnabled>`This is monospaced text`</Text>
        <Text markdownEnabled>
          Visit the [Expo Docs](https://docs.expo.dev/versions/latest/sdk/ui/)
          to learn more about Expo UI
        </Text>
      </VStack>
    </Host>
  );
}
~~~

## 自动更新时间文字

`date` 配 `dateStyle` 让系统生成会自行更新的相对 / 计时文本：

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';

export default function DateTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text
        date={new Date(Date.now() + 300000)}
        dateStyle="timer"
      />
    </Host>
  );
}
~~~

## 显示区间倒计时 / 计时器

`timerInterval` 配置上下界，并支持 `countsDown`；计时属性需要 iOS 16+ / tvOS 16+：

~~~tsx
import { Host, Text } from '@expo/ui/swift-ui';

export default function TimerIntervalExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text
        timerInterval={{
          lower: new Date(),
          upper: new Date(Date.now() + 600000),
        }}
        countsDown
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode`（可选） | 文本内容，也可嵌套 Text 做逐段样式。 |
| `markdownEnabled` | `boolean`（可选） | 将字符串按 SwiftUI 支持的 Markdown 解析。 |
| `date` | `Date`（可选） | 自动更新的日期文本值。 |
| `dateStyle` | `'timer' \| 'relative' \| 'offset' \| 'date' \| 'time'`，默认 `date` | 日期格式 / 更新显示方式。 |
| `timerInterval` | `{ lower: Date; upper: Date }`（iOS/tvOS 16+） | 实时更新的计时区间。 |
| `countsDown` | `boolean`，默认 `true`（iOS/tvOS 16+） | timerInterval 显示为倒数还是正向计时。 |
| `pauseTime` | `Date`（可选，iOS/tvOS 16+） | 让计时器在指定时刻暂停。 |

Text 同时继承 `CommonViewModifierProps`，因此 `font`、`foregroundStyle`、`lineLimit` 等 modifier 也可用。

### 新手术语

- **Text concatenation / 文本拼接**：SwiftUI 将嵌套 Text 合成为一段原生富文本；不是嵌套任意 View。
- **Dynamic Type**：iOS 用户在系统设置中配置的动态字号；`font({ textStyle })` 可随用户偏好缩放。
- **Markdown**：简单文本标记语法，支持粗体、斜体、删除线、行内代码与链接等。
- **dateStyle `timer`**：系统根据时间更新的倒数 / 计时显示，不必由 JavaScript 每秒重新渲染字符串。

## 源页代码主题覆盖

已覆盖四种安装命令和官方十一个示例：基础文本、modifier 样式、嵌套 / 混合 inline 文本、字重、字体设计、自定义字体、行数限制、Markdown、自动更新日期与区间计时。字体、日期和 Markdown 属性及系统版本边界均已列出。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/text/)

**翻页：**[上一页：SwiftUI TabView](./102-SwiftUI-TabView.md) · [目录](./README.md) · [下一页：SwiftUI TextField](./104-SwiftUI-TextField.md)
