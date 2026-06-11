# Host：在 React Native 中承载 SwiftUI 组件

> 本文整理自 Expo `@expo/ui/swift-ui` 的 `Host` 文档。原文修改日期为 **2026 年 5 月 26 日**，描述的是**下一版本 Expo SDK**；原文同时指出，当前最新稳定文档对应 **SDK 56**。

## 文档解决的问题

`Host` 用于在 React Native 组件树中承载 `@expo/ui/swift-ui` 提供的 SwiftUI 组件。

可以把它理解成 SwiftUI 组件进入 React Native 页面时必须经过的“原生渲染容器”：

```tsx
<Host>
  {/* @expo/ui/swift-ui 组件 */}
</Host>
```

类似关系包括：

- DOM 中的 `<svg>`：SVG 元素需要放在 SVG 根容器中。
- `react-native-skia` 中的 `<Canvas>`：Skia 图形需要画布作为渲染环境。
- `@expo/ui/swift-ui` 中的 `<Host>`：SwiftUI 组件需要 Host 连接 React Native 与 iOS 原生渲染系统。

在内部，`Host` 使用 Apple 的 `UIHostingController`，将 SwiftUI 视图嵌入 UIKit，而 React Native 的 iOS 视图系统本身建立在 UIKit 之上。

## 适用场景与平台

### 适合的场景

- 在 React Native 页面中使用 `@expo/ui/swift-ui` 组件。
- 将 SwiftUI 按钮、文本、表单等嵌入 React Native 布局。
- 根据 SwiftUI 内容自动调整容器尺寸。
- 让 SwiftUI 内容填充指定的 React Native 区域。
- 配合 React Native 键盘避让方案，避免重复计算键盘安全区域。
- 创建延伸到状态栏或 Home Indicator 后方的全屏内容。

### 支持的平台

文档明确列出的支持范围是：

- iOS
- tvOS
- Expo Go 中已包含

`Host` 是 SwiftUI 专用组件，不是跨平台通用实现。如果需要同一套代码根据平台渲染对应的原生组件，应使用文档提到的 universal `Host`。

> Android 支持：当前文档未涉及，并且本页面的 API 明确只标注 iOS 和 tvOS。

## React Web 开发者需要理解的背景

### React Native 的 `View`

React Native 的 `View` 可以大致类比 Web 中的 `<div>`，但它并不是 DOM 元素。它最终会映射到对应平台的原生视图。

`Host` 本身是一个 React Native `View`，因此可以接收 React Native 的 `style`：

```tsx
<Host style={{ flex: 1 }} />
```

这里使用的是 React Native 样式对象，而不是 CSS：

- 没有 CSS 文件或浏览器级联。
- `flex: 1` 通常表示占据父布局提供的剩余空间。
- 数值尺寸通常按 React Native 的逻辑像素处理。
- `width: '100%'` 等百分比尺寸依赖父容器提供的约束。

### SwiftUI

SwiftUI 是 Apple 的声明式 UI 框架，只运行在 Apple 平台。它在编程形式上与 React 有相似之处，都通过声明组件描述界面，但其布局、状态和渲染系统不属于 React DOM。

本页面涉及三层 UI：

1. React 负责组件声明与更新。
2. React Native 管理跨平台组件树和原生视图。
3. SwiftUI 在 `Host` 内部计算并渲染 SwiftUI 内容。

这也是为什么 `Host` 必须处理 React Native 与 SwiftUI 之间的尺寸协调。

### UIKit 与 `UIHostingController`

UIKit 是传统的 iOS 原生界面框架。`UIHostingController` 是 Apple 提供的桥接容器，用于把 SwiftUI 视图放进 UIKit 界面。

`Host` 内部使用该机制，但一般业务开发不需要自己创建 `UIHostingController`。

### 固有尺寸

“固有尺寸”（intrinsic size）表示组件仅根据自身内容就能确定合理大小。

例如：

- `Text` 可以根据文字确定尺寸。
- `Button` 可以根据标题和系统内边距确定尺寸。
- `Toggle` 有系统控件自身的自然尺寸。

相反，`Slider` 和线性 `ProgressView` 通常希望沿可用空间展开，无法仅根据内容确定自然宽度。

这个区别直接决定了 `matchContents` 是否适用。

### 安全区域

iOS 的安全区域用于避免内容被以下界面遮挡：

- 状态栏
- 刘海或灵动岛区域
- Home Indicator
- 屏幕边缘系统区域
- 屏幕键盘

`ignoreSafeArea` 用于控制 SwiftUI 宿主视图是否忽略部分或全部安全区域。

## 安装

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

`expo install` 与普通的 `npm install` 不完全相同：它会尽量安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的纯 React Native 工程，即通常所说的 bare React Native app，还需要先按照 Expo 文档将 `expo` 和 Expo Modules 支持安装进项目。

> 原文没有提供原生工程手动配置步骤，只要求已有 React Native 项目先安装 Expo。

## 基本用法

```tsx
import { Host } from '@expo/ui/swift-ui';
```

SwiftUI 组件需要作为 `Host` 的子节点：

```tsx
import { Button, Host } from '@expo/ui/swift-ui';

export default function Example() {
  return (
    <Host matchContents>
      <Button onPress={() => console.log('Pressed')}>
        Click
      </Button>
    </Host>
  );
}
```

## Host 的尺寸管理

尺寸管理是这篇文档的重点。主要有两种方式：

1. 使用 `matchContents`，让 Host 跟随 SwiftUI 内容。
2. 使用 `style`，由 React Native 明确控制 Host 尺寸。

### 使用 `matchContents` 匹配内容

```tsx
<Host matchContents>
  <Button>Click</Button>
</Host>
```

开启后，SwiftUI 先完成内部布局，随后 `Host` 更新自己在 React Native 视图树中的尺寸，使其与内容匹配。

它适用于：

- `Button`
- `Toggle`
- `Text`
- 设置了明确 `frame` 的 SwiftUI 组件

也可以按轴控制：

```tsx
<Host matchContents={{ horizontal: false, vertical: true }}>
  {/* 内容 */}
</Host>
```

其中：

- `horizontal` 控制是否匹配内容宽度。
- `vertical` 控制是否匹配内容高度。

#### 不适合直接使用 `matchContents` 的组件

以下组件没有固有宽度，而是倾向于填满可用空间：

- `Slider`
- 线性 `ProgressView`

如果直接对它们使用 `matchContents`，可能出现接近零的宽度。

可采用两种解决方式：

```tsx
// 方案一：在 SwiftUI 组件上通过 frame 指定宽度
```

```tsx
// 方案二：由 Host 的 React Native style 提供尺寸
<Host style={{ width: 300 }}>
  {/* Slider 或线性 ProgressView */}
</Host>
```

也可以填满父布局提供的空间：

```tsx
<Host style={{ flex: 1 }}>
  {/* 内容 */}
</Host>
```

### `matchContents` 与滚动容器

不要在滚动方向上使用 `matchContents`。

涉及的滚动容器包括：

- `ScrollView`
- `List`
- `Form`
- `LazyHStack`
- `LazyVStack`

原因是 `matchContents` 最终对应 SwiftUI 的 `.fixedSize`。如果滚动容器在滚动方向上按照全部内容确定尺寸，容器就会扩张到可以一次容纳全部内容，视口之外不再有可滚动区域，滚动会在没有明显报错的情况下失效。

对于横向滚动，应只匹配垂直尺寸，并明确提供有限宽度：

```tsx
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
```

这里的布局职责是：

- `style={{ width: '100%' }}` 为横向滚动视口提供有限宽度。
- `matchContents={{ vertical: true }}` 仅让 Host 匹配内容高度。
- 横向内容可以超过视口宽度，因此仍然能够滚动。

> 基于文档内容推导：对于纵向滚动容器，应采用相反思路，避免匹配垂直轴，并由外层布局提供有限高度。原文只给出了横向滚动示例，没有提供纵向示例代码。

### 使用 `style` 明确指定尺寸

当 SwiftUI 内容应该使用 React Native 分配的空间时，应通过 `style` 控制 Host：

```tsx
import { Button, Host, Text, VStack } from '@expo/ui/swift-ui';

export default function ExplicitSizingExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={8}>
        <Text>Hello, world!</Text>
        <Button onPress={() => console.log('Pressed')}>
          Click
        </Button>
      </VStack>
    </Host>
  );
}
```

这种方式适合：

- 页面主体区域。
- 需要填满父容器的布局。
- `Slider`、`Form` 等需要外部空间约束的组件。
- 滚动区域。
- 全屏内容。

对 React Web 开发者而言，可以将两种策略理解为：

- `matchContents` 类似内容驱动的 `fit-content`。
- `style` 类似由父布局或 CSS 尺寸规则约束元素。

这只是帮助理解的类比，两者的具体布局算法并不等同。

## 键盘安全区域处理

如果 React Native 层已经负责键盘避让，可以设置：

```tsx
<Host ignoreSafeArea="keyboard">
  {/* SwiftUI 输入组件 */}
</Host>
```

文档给出的场景使用了 `react-native-keyboard-controller`：

```tsx
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
            <TextField placeholder="Enter text" multiline />
          </Host>
        </KeyboardStickyView>
      </View>
    </KeyboardProvider>
  );
}
```

这里 React Native 的 `KeyboardStickyView` 已根据键盘位置移动输入区域。设置 `ignoreSafeArea="keyboard"` 可以防止 SwiftUI Host 再次添加键盘 inset。

> 基于文档内容推导：如果 React Native 和 SwiftUI 同时进行键盘避让，可能导致输入区域被重复抬高或出现多余空白。是否设置该属性，应取决于哪一层负责键盘布局。

## 忽略全部安全区域

对于全屏背景或覆盖层，可以设置：

```tsx
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
      This content extends behind the status bar and home indicator.
    </Text>
  </VStack>
</Host>
```

此时 SwiftUI 内容可以延伸到状态栏和 Home Indicator 后方。

需要区分两个职责：

- 绝对定位让 `Host` 覆盖整个父容器。
- `ignoreSafeArea="all"` 让内部 SwiftUI 内容忽略系统安全区域。

仅设置其中一项，不一定能实现完整的全屏延伸效果。

> 基于经验建议：交互按钮和正文通常仍应避开状态栏、屏幕切口及 Home Indicator。更适合延伸到安全区域之外的是背景、图片和装饰层。

## API 说明

### `children`

```ts
React.ReactNode
```

要由 Host 承载的子节点，主要用于放置 `@expo/ui/swift-ui` 组件。

支持 iOS 和 tvOS。

### `colorScheme`

```ts
'light' | 'dark'
```

设置 Host 内 SwiftUI 内容使用的配色模式。

例如：

```tsx
<Host colorScheme="dark">
  {/* 使用深色模式环境渲染 */}
</Host>
```

这是 Host 内部 SwiftUI 环境的颜色模式，不应简单理解为给容器设置一个背景色。

### `ignoreSafeArea`

```ts
'all' | 'keyboard'
```

控制 SwiftUI 宿主视图忽略哪些安全区域：

- `'all'`：忽略全部安全区域。
- `'keyboard'`：只忽略键盘安全区域。

该属性**只能在挂载时设置一次**。

> 开发影响：不要依赖组件挂载后动态切换该属性。需要改变策略时，可能要通过重新挂载 Host 实现；这是基于属性“只能在挂载时设置一次”的推导，原文没有给出具体重挂载方案。

### `layoutDirection`

```ts
'leftToRight' | 'rightToLeft'
```

控制 SwiftUI 内容的布局方向：

- `'leftToRight'`：从左到右。
- `'rightToLeft'`：从右到左。

默认值来自 React Native `I18nManager` 中的当前本地化方向。

它影响的是布局方向，而不只是文本对齐。例如，在从右到左的语言环境中，横向排列顺序和部分控件方向也可能发生变化。

### `matchContents`

```ts
boolean | {
  horizontal: boolean;
  vertical: boolean;
}
```

默认值：

```ts
false
```

开启后，Host 会根据 SwiftUI 内容的布局结果更新自己在 React Native 视图树中的尺寸。

该属性同样**只能在挂载时设置一次**。

关键限制：

- 内容需要具有固有尺寸或明确的 `frame`。
- 不要在滚动容器的滚动轴上使用。
- 没有固有宽度的组件可能得到接近零的宽度。

### `onLayoutContent`

```ts
(event: {
  nativeEvent: {
    height: number;
    width: number;
  };
}) => void
```

SwiftUI 内容完成布局时触发，并提供当前内容尺寸：

```tsx
<Host
  onLayoutContent={(event) => {
    const { width, height } = event.nativeEvent;
    console.log({ width, height });
  }}>
  {/* SwiftUI 内容 */}
</Host>
```

内容更新后尺寸可能变化，因此该回调可能随着布局变化再次触发。

它报告的是 SwiftUI 内容尺寸。原文没有说明它是否与 Host 最终尺寸完全相同，也没有说明具体触发次数或调用时机保证。

### `pointerEvents`

```ts
'box-none' | 'none' | 'box-only' | 'auto'
```

控制 Host 及其子内容如何参与触摸命中测试。

这些值来自 React Native View 的交互模型：

- `'auto'`：Host 和子节点正常响应触摸。
- `'none'`：Host 和子节点都不响应触摸。
- `'box-only'`：Host 自身可以响应，子节点不响应。
- `'box-none'`：Host 自身不响应，子节点可以响应。

适合用于覆盖层、穿透式背景或需要阻止交互的区域。

### `seedColor`

```ts
ColorValue
```

为 SwiftUI 内容设置种子颜色，并作为 tint 通过 SwiftUI 环境向子组件传播。

它会影响按钮、开关、滑块等交互控件的主题色。

```tsx
<Host seedColor="#6750A4">
  {/* SwiftUI 控件 */}
</Host>
```

这不是普通的容器背景色。如果要设置 Host 背景，应使用 `style.backgroundColor`。

### `style`

```ts
StyleProp<ViewStyle>
```

因为 Host 是 React Native `View`，所以可以使用 React Native View 样式控制：

- 宽高
- Flex 布局
- 绝对定位
- 背景色
- 外边距和内边距
- 其他 View 支持的样式

SwiftUI 子组件自己的布局仍由 SwiftUI 负责。

### `useViewportSizeMeasurement`

```ts
boolean
```

默认值：

```ts
false
```

当满足以下条件时，它会把视口尺寸作为 SwiftUI 布局的建议尺寸：

1. `useViewportSizeMeasurement` 为 `true`。
2. Host 没有获得明确尺寸。

该属性适合需要填满可用区域的 SwiftUI 视图，例如 `Form`。

这里的“建议尺寸”来自 SwiftUI 的布局协商机制，不等同于 CSS 的强制宽高。原文没有进一步说明视口的具体计算边界。

### 继承属性

`Host` 还继承了 `CommonViewModifierProps`。

当前文档没有逐项列出这些属性，需要查看 `@expo/ui/swift-ui` 的 modifiers 文档了解完整定义。

## 关键限制与容易踩坑的地方

### 1. 文档对应下一版本 SDK

本页面不是当前稳定 SDK 的文档。项目使用 SDK 56 或其他版本时，API 是否完全一致，应以对应版本文档和实际安装版本为准。

### 2. Host 不是普通跨平台容器

虽然写法类似 React 组件，但本页面的 Host 专门承载 SwiftUI，仅支持 iOS 和 tvOS。不能默认相同代码会在 Android 上得到等价结果。

### 3. 两套布局系统需要明确分工

- React Native `style` 决定 Host 在外层 React Native 布局中的位置和大小。
- SwiftUI 布局决定 Host 内部组件如何排列。
- `matchContents` 和 `onLayoutContent` 负责在两套布局系统之间传递内容尺寸。

Web 开发中浏览器通常统一完成布局，而这里存在 React Native 与 SwiftUI 两个布局阶段。

### 4. `matchContents` 不是通用的自动尺寸开关

它依赖子内容能够计算出合理的固有尺寸。对于希望填满父空间的组件，应提供外部尺寸或 SwiftUI `frame`。

### 5. 滚动失效可能没有明显错误

在滚动轴上使用 `matchContents` 时，页面可能正常渲染，但滚动悄然失效。这是布局结果导致的行为，不一定会出现异常日志。

### 6. 部分属性只能在挂载时设置

以下属性只能在 Host 首次挂载时确定：

- `ignoreSafeArea`
- `matchContents`

不能把它们当作可以随状态任意切换的普通 React props。

### 7. 键盘避让应由一层负责

如果 React Native 已通过键盘控制库调整布局，应考虑使用 `ignoreSafeArea="keyboard"`，避免 SwiftUI 再次处理键盘 inset。

## 实际开发中的选择方法

可以按以下规则选择 Host 配置：

| 需求 | 建议配置 |
| --- | --- |
| Button、Text 等按内容确定大小 | `matchContents` |
| 只根据内容调整高度 | `matchContents={{ vertical: true }}` |
| Slider 等需要明确宽度 | Host `style.width` 或 SwiftUI `frame` |
| 页面主体填满剩余空间 | `style={{ flex: 1 }}` |
| 横向滚动内容 | 固定 Host 宽度，只匹配垂直轴 |
| SwiftUI `Form` 需要使用可用空间 | 考虑 `useViewportSizeMeasurement` |
| React Native 已处理键盘避让 | `ignoreSafeArea="keyboard"` |
| 全屏背景或覆盖层 | 绝对定位加 `ignoreSafeArea="all"` |
| 强制 SwiftUI 深色模式 | `colorScheme="dark"` |
| 设置控件主题色 | `seedColor` |
| 读取 SwiftUI 内容尺寸 | `onLayoutContent` |

> 基于经验建议：开发时应先决定 Host 的尺寸由“内容”还是“父布局”负责，再选择 `matchContents` 或 `style`。不要在缺少明确布局目标时同时叠加多种尺寸机制。

## 文档明确内容与推导内容

### 文档明确说明

- Host 用于在 React Native 中承载 `@expo/ui/swift-ui` 组件。
- Host 内部使用 `UIHostingController` 渲染 SwiftUI。
- Host 是 React Native `View`，支持 `style`。
- `matchContents` 可以让 Host 匹配 SwiftUI 内容尺寸。
- 无固有宽度的组件直接使用 `matchContents` 可能接近零宽。
- 不应在滚动容器的滚动轴上使用 `matchContents`。
- `ignoreSafeArea` 支持 `'all'` 和 `'keyboard'`。
- `ignoreSafeArea` 与 `matchContents` 只能在挂载时设置一次。
- `useViewportSizeMeasurement` 适合 `Form` 等需要填满空间的视图。
- 本 API 支持 iOS 和 tvOS。

### 基于文档内容推导

- 纵向滚动容器应避免在垂直轴使用 `matchContents`，并由外部提供有限高度。
- 动态改变只能在挂载时设置的属性，可能需要重新挂载 Host。
- React Native 和 SwiftUI 同时处理键盘避让，可能造成重复位移或多余空白。
- 开发前应明确 Host 尺寸由外部布局还是内部内容决定。

这些推导用于解释开发影响，不代表原文提供了对应的完整实现方案。

## 总结

`Host` 是 React Native 与 SwiftUI 之间的承载边界。使用它时最重要的不是组件语法，而是理解两套布局系统如何协作：

- 小型且具有自然尺寸的内容，可以使用 `matchContents`。
- 需要填充空间或滚动的内容，应由 React Native `style` 提供明确约束。
- 不要在滚动轴上匹配全部内容尺寸。
- 键盘和安全区域处理应避免 React Native 与 SwiftUI 重复负责。
- `matchContents` 和 `ignoreSafeArea` 的配置需要在挂载时确定。
- 该组件面向 Apple 平台，不能直接当作 Android 通用方案。

---

## 文档导航

- **上一页**：[group](./87__group.md)
- **下一页**：[hstack](./89__hstack.md)
