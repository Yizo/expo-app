# 126｜Expo UI Universal Text

**翻页：**[上一页：Universal Switch](./125-Universal-Switch.md) · [目录](./README.md) · [下一页：Universal TextInput](./127-Universal-TextInput.md)

**官方 Latest 页面：**[Text](https://docs.expo.dev/versions/latest/sdk/ui/universal/text/)

**SDK 56 对照：**[SDK v56.0.0 Text](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/text/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.17`；SDK v56.0.0 推荐 `~56.0.26`。基础文字、`textStyle` typography、`numberOfLines` 与 Props 两版一致；SDK v56 文档也说明 Text 默认适配系统 light / dark color scheme。

## Expo UI Text 是什么

Universal `Text` 将一段文字映射到 Expo UI 原生控件；它能显示在 Android、iOS 与 Web，也可在 Expo Go 使用。可用 `textStyle` 设字体大小、颜色、字重、对齐等 typography 属性。`Text` 与 React Native `Text` 名称相同，但所属组件树 / props 不同：这里的 import 来自 `@expo/ui`，通常要放进 `Host`。

安装当前 SDK 对应的 `@expo/ui`：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基本文字

SDK v56 会按平台 color scheme 调整默认外观；Latest 示例展示显式读系统主题并指定颜色的写法：

```tsx
import { useColorScheme } from 'react-native';
import { Host, Text } from '@expo/ui';

export default function Greeting() {
  const colorScheme = useColorScheme();

  return (
    <Host matchContents>
      <Text textStyle={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
        Hello, world!
      </Text>
    </Host>
  );
}
```

## Styled Text

Typography 相关属性放在 `textStyle`，而不是把整个 React Native `style` 对象照搬过来：

```tsx
import { useColorScheme } from 'react-native';
import { Host, Text } from '@expo/ui';

export default function Headline() {
  const colorScheme = useColorScheme();

  return (
    <Host matchContents>
      <Text
        textStyle={{
          color: colorScheme === 'dark' ? '#fff' : '#000',
          fontSize: 24,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        Headline
      </Text>
    </Host>
  );
}
```

## Clamp Long Text

用 `numberOfLines` 限制最大行数，超出内容显示平台省略号：

```tsx
import { useColorScheme } from 'react-native';
import { Host, Text } from '@expo/ui';

export default function ClampedDescription() {
  const colorScheme = useColorScheme();

  return (
    <Host style={{ width: '100%', flex: 1 }}>
      <Text
        numberOfLines={1}
        textStyle={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}
      >
        A very long line of text that will be truncated when it does not fit on a single line.
      </Text>
    </Host>
  );
}
```

Clip / ellipsis 后用户看到的内容会随实际宽度改变，适合卡片标题或单行预览。若正文必须完整可读，不应仅靠截断来隐藏必要信息。

## Text Props

| Prop | 平台 / 类型 | 说明 |
| --- | --- | --- |
| `children` | `string` | 要显示的文字内容。 |
| `textStyle` | `{ color, fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textAlign }` | 专门控制文本排版；`fontWeight` 支持 normal / bold / 100–900，`textAlign` 支持 left / center / right。 |
| `numberOfLines` | `number` | 最大展示行数，超出以 ellipsis 截断。 |
| `style` | 受限 `ViewStyle` | padding、backgroundColor、border、opacity、width、height 等布局样式。 |
| `disabled` / `hidden` | `boolean` | 禁止交互响应或隐藏文字组件。 |
| `onPress` | `() => void` | 文本被按下时调用。 |
| `onAppear` / `onDisappear` | `() => void` | 出现 / 移出屏幕时回调。 |
| `modifiers` | `ModifierConfig[]` | SwiftUI / Jetpack Compose 原生修饰器入口。 |
| `testID` | `string` | E2E / UI tests 定位标识。 |

`style` 主要管组件盒子的布局 / 背景，`textStyle` 管字形；保持这两个职责清楚，更容易解释不同 screen 上的可见差异。

## 关键名词

- **Typography：**字体大小、字重、行高、字距、对齐等文字排版属性。
- **`textStyle`：**Expo UI Text 的文本专属样式对象。
- **`numberOfLines`：**将文字限制为指定行数并截断剩余内容的 props。
- **Ellipsis：**超出行宽 / 行数后显示的省略号。
- **Host：**创建 `@expo/ui` Native UI 树的容器。

## 官方代码主题覆盖

Latest / v56 Text 页的代码示例全部覆盖：四种包管理器安装 `@expo/ui`；`Host` 中 Hello world；`textStyle` 调整 color / fontSize / fontWeight / textAlign；单行 `numberOfLines` 截断；暗色 / 亮色文字色示例；及 Text props 表和跨平台说明。

## 下一页

官方页脚 **Next** 是 [Universal TextInput](https://docs.expo.dev/versions/latest/sdk/ui/universal/textinput/)，介绍统一 iOS / Android 原生输入控件与受控 / 非受控文本状态。

**翻页：**[上一页：Universal Switch](./125-Universal-Switch.md) · [返回目录](./README.md) · [下一页：Universal TextInput](./127-Universal-TextInput.md)
