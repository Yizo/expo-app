# 080｜SwiftUI Host

**翻页：**[上一页：SwiftUI Group](./079-SwiftUI-Group.md) · [目录](./README.md) · [下一页：SwiftUI HStack](./081-SwiftUI-HStack.md)

**官方页面：**[SwiftUI Host · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/host/)推荐 `~56.0.26`。本文是专用于 `@expo/ui/swift-ui` 的 iOS / tvOS Host。需要跨平台按平台选择原生 Host 时，另见 Expo UI 的 universal `Host`。

## 把 SwiftUI 控件放进 React Native

`Host` 是 `@expo/ui/swift-ui` 原生组件进入 React Native 视图树的承载容器。它使用 iOS `UIHostingController` 显示 SwiftUI 内容，行为上类似把一个独立渲染子树嵌进当前界面。`Host` 本身是 React Native `View`，可以用 `style` 布局，也可以用 `matchContents` 让尺寸跟随 SwiftUI 内容。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 按内容决定 Host 尺寸

对 `Button`、`Toggle`、`Text` 等有固有尺寸的控件，可使用 `matchContents`，让 Host 贴合内容：

~~~tsx
import { Button, Host } from '@expo/ui/swift-ui';

export default function MatchContentsExample() {
  return (
    <Host matchContents>
      <Button
        onPress={() => {
          console.log('Pressed');
        }}
        label="Click"
      />
    </Host>
  );
}
~~~

### 滚动容器的轴向约束

`matchContents` 会把尺寸压到内容大小；不要在滚动容器的滚动轴上这样做，否则内容会被完整压进 Host，滚动区域没有可滚动的溢出。下面的横向 ScrollView 让 Host 只按内容确定高度，同时显式占满可用宽度：

~~~tsx
import { Host, HStack, ScrollView, Text } from '@expo/ui/swift-ui';

export default function ScrollViewMatchContents() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <ScrollView axes="horizontal">
        <HStack spacing={12}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i}>Item {i}</Text>
          ))}
        </HStack>
      </ScrollView>
    </Host>
  );
}
~~~

`matchContents` 仅适用于有固有尺寸或显式 `frame` 的内容。类似 Slider、线性 ProgressView 的弹性宽度控件没有固有宽度；需要给控件指定 frame，或直接给 Host 用 `style` 定宽 / `flex: 1`。`matchContents` 的值只能在挂载时设置一次。

## 显式设置大小

对需要填满布局空间的表单、列表或线性控件，通常使用 `style={{ flex: 1 }}` 等显式样式：

~~~tsx
import { Button, Host, VStack, Text } from '@expo/ui/swift-ui';

export default function ExplicitSizingExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Text>Hello, world!</Text>
        <Button
          onPress={() => {
            console.log('Pressed');
          }}
          label="Click"
        />
      </VStack>
    </Host>
  );
}
~~~

## 键盘安全区域交给 React Native 管理

如果应用已经使用 `react-native-keyboard-controller` 做键盘避让，可设置 `ignoreSafeArea="keyboard"`，避免 SwiftUI Host 再叠加一份键盘 inset：

~~~tsx
import { Host, TextField } from '@expo/ui/swift-ui';
import {
  KeyboardProvider,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { View } from 'react-native';

export default function IgnoreKeyboardExample() {
  return (
    <KeyboardProvider>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <KeyboardStickyView
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: 'green',
          }}>
          <Host
            matchContents
            ignoreSafeArea="keyboard"
            style={{ backgroundColor: 'red' }}>
            <TextField placeholder="Enter text" axis="vertical" />
          </Host>
        </KeyboardStickyView>
      </View>
    </KeyboardProvider>
  );
}
~~~

## 忽略设备边缘安全区域

`ignoreSafeArea="container"` 忽略刘海、状态栏、Home 指示器和系统导航条区域，但仍保留键盘安全区。例子从 `useSafeAreaInsets` 取顶部 inset，再显式补回 padding：

~~~tsx
import { Button, Host, HStack, Spacer } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IgnoreContainerSafeAreaExample() {
  const insets = useSafeAreaInsets();
  return (
    <Host
      style={{ width: '100%', paddingTop: insets.top }}
      matchContents={{ vertical: true }}
      ignoreSafeArea="container">
      <HStack>
        <Button
          systemImage="chevron.backward"
          label="Back"
          modifiers={[labelStyle('iconOnly')]}
        />
        <Spacer />
        <Button
          systemImage="square.and.arrow.up"
          label="Share"
          modifiers={[labelStyle('iconOnly')]}
        />
      </HStack>
    </Host>
  );
}
~~~

## 忽略所有安全区域

`ignoreSafeArea="all"` 同时忽略设备容器与键盘安全区域，可用于全屏背景或覆盖层。由于内容会绘制到状态栏和 Home 指示器后方，布局需要自行考虑文字与操作是否被遮挡：

~~~tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';

export default function IgnoreAllSafeAreasExample() {
  return (
    <Host
      ignoreSafeArea="all"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <VStack>
        <Text>
          This content extends behind the status bar and home
          indicator.
        </Text>
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 可选值 | 作用 |
| --- | --- | --- |
| `children` | `React.ReactNode` | Host 中渲染的 SwiftUI 内容。 |
| `colorScheme` | `'light' \| 'dark'` | 覆盖 Host 的颜色模式。 |
| `ignoreSafeArea` | `'container' \| 'all' \| 'keyboard'` | 选择忽略设备容器、键盘或全部安全区域。 |
| `layoutDirection` | `'leftToRight' \| 'rightToLeft'` | 设置 SwiftUI 子树方向；默认读取当前 I18nManager 方向。 |
| `matchContents` | `boolean \| { horizontal: boolean; vertical: boolean }`，默认 `false` | 让 Host 按 SwiftUI 子内容测量尺寸；挂载后不可更改。 |
| `onLayoutContent` | `(event: { nativeEvent: { height: number; width: number } }) => void` | SwiftUI 布局完成或尺寸变化时回调。 |
| `pointerEvents` | `'auto' \| 'box-none' \| 'none' \| 'box-only'` | 控制 React Native 触摸事件命中行为。 |
| `seedColor` | React Native `ColorValue` | 设置 SwiftUI environment tint，影响按钮、开关、滑块等交互元素。 |
| `style` | React Native `ViewStyle` | 设置 Host 自身的布局样式。 |
| `useViewportSizeMeasurement` | `boolean`，默认 `false` | 未指定尺寸时用视口尺寸作为 SwiftUI 布局建议值，适合需要填满空间的 Form 等视图。 |

### 新手术语

- **Hosting controller**：UIKit 中承载 SwiftUI 界面的容器控制器；本组件在内部使用它把 SwiftUI 子树显示到原生界面。
- **安全区域 / safe area**：避开刘海、状态栏、Home 指示器、系统导航条或键盘的布局区域。
- **inset**：安全区域从屏幕边缘占用的尺寸。
- **固有尺寸**：控件根据自身内容自然得到的大小，例如普通文字或按钮；弹性填满宽度的控件通常没有固有宽度。
- **`matchContents`**：让 Host 根据 SwiftUI 子内容测量自身尺寸；应避免与同一轴的滚动容器一起使用。

## 源页代码主题覆盖

已覆盖四种安装命令和官方六类 Host 示例：matchContents 固有尺寸、滚动容器轴向约束、显式尺寸、忽略键盘安全区、忽略容器安全区、忽略全部安全区。危险布局限制及 Host 属性表也已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/host/)

**翻页：**[上一页：SwiftUI Group](./079-SwiftUI-Group.md) · [目录](./README.md) · [下一页：SwiftUI HStack](./081-SwiftUI-HStack.md)
