# RNHostView：在 Expo UI 中嵌入 React Native 视图

> 本文对应 Expo 下一 SDK 版本的文档，并非当前稳定版。原文指出，当前最新稳定文档为 SDK 56。  
> 文档修改日期：2026 年 5 月 20 日。

## 文档解决的问题

`RNHostView` 是 `@expo/ui` 提供的跨平台组件，用来把一棵普通的 React Native 视图子树嵌入 `@expo/ui` 的通用布局中。

它适合以下场景：

- 页面主体使用 `@expo/ui` 的 `Host`、`Column`、`Row`、`Text` 等组件。
- 某个局部区域需要继续使用 React Native 的 `View`、`Text` 或其他 React Native 组件。
- 希望同一套代码能够运行在 Android、iOS 和 Web。
- 需要控制嵌入区域是填满原生父容器，还是根据 React Native 子元素调整大小。

支持的平台包括：

- Android
- iOS
- Web
- Expo Go

## 阅读前需要理解的背景知识

### React Native 与 React Web 的区别

React Web 最终通常生成浏览器 DOM，例如：

```html
<div>
  <span>Text</span>
</div>
```

React Native 不直接使用 DOM，而是通过 `View`、`Text` 等抽象组件描述移动端界面：

```tsx
import { Text, View } from 'react-native';

<View>
  <Text>Text</Text>
</View>
```

这些组件在 Android、iOS 和 Web 上会对应不同的底层实现。

### `@expo/ui` 是什么

`@expo/ui` 提供了一组能够与平台原生 UI 系统结合的组件。本页涉及的原生 UI 系统包括：

- Android 的 Jetpack Compose
- iOS 的 SwiftUI

可以把 Jetpack Compose 和 SwiftUI 粗略理解为 Android、iOS 各自的声明式 UI 框架。它们的编写理念与 React 相似，但布局、生命周期和尺寸计算仍属于原生平台体系。

### 什么是“托管 React Native 视图”

在下面的结构中：

```tsx
<Column>
  <RNHostView>
    <View />
  </RNHostView>
</Column>
```

外层 `Column` 属于 `@expo/ui` 的通用原生布局，内层 `View` 属于 React Native。`RNHostView` 是两个 UI 体系之间的承载边界。

在不同平台上，它的行为有所区别：

- Android：重新导出 Jetpack Compose 版本的原生 `RNHostView`。
- iOS：重新导出 SwiftUI 版本的原生 `RNHostView`。
- Web：不存在需要桥接的 Compose 或 SwiftUI 原生视图树，因此退化为一个 React Native `View`，用它包裹子元素。

这里的“桥接”指让 React Native 子树能够被放入外围的原生 Compose 或 SwiftUI 视图树中，并参与显示与布局。

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

这些命令都用于安装 `@expo/ui`，区别只在于项目使用的包管理器。

`expo install` 与 React Web 项目中直接运行 `npm install` 的意义不完全相同：Expo CLI 会根据项目所使用的 Expo SDK 选择兼容的依赖版本，从而降低原生模块版本不匹配的风险。

如果是在现有的 React Native 项目中使用，而不是由 Expo 管理的项目，必须先按照 Expo 的要求安装 `expo`，使项目具备使用 Expo Modules 的基础环境。

原文没有涉及：

- 是否需要修改 iOS 的 Podfile。
- 是否需要修改 Android Gradle 配置。
- 安装后是否需要重新生成原生工程。
- `@expo/ui` 对具体 React Native 版本的兼容范围。

这些问题需要参考对应 Expo SDK 版本以及现有 React Native 项目的接入文档，不能仅从本页确定。

## 基本用法

首先从 `@expo/ui` 导入 `RNHostView`：

```tsx
import { RNHostView } from '@expo/ui';
```

完整示例：

```tsx
import { Host, Column, RNHostView, Text } from '@expo/ui';
import { Text as RNText, View } from 'react-native';

export default function RNHostViewExample() {
  return (
    <Host matchContents>
      <Column spacing={12} style={{ padding: 16 }}>
        <Text textStyle={{ fontWeight: 'bold' }}>
          Native UI label
        </Text>

        <RNHostView matchContents>
          <View
            style={{
              alignSelf: 'flex-start',
              padding: 16,
              backgroundColor: '#9B59B6',
              borderRadius: 10,
            }}
          >
            <RNText style={{ color: 'white' }}>
              Plain React Native content
            </RNText>
          </View>
        </RNHostView>
      </Column>
    </Host>
  );
}
```

这段代码包含三个层次：

1. `Host` 建立 `@expo/ui` 的宿主环境。
2. `Column` 按垂直方向排列原生 UI 内容。
3. `RNHostView` 在原生布局中承载 React Native 的 `View` 和 `Text`。

示例把两个同名的 `Text` 区分为：

```tsx
import { Text } from '@expo/ui';
import { Text as RNText } from 'react-native';
```

`Text` 是 `@expo/ui` 组件，`RNText` 是 React Native 组件。别名只是为了避免 JavaScript 导入名称冲突，并不表示 React Native 本身存在名为 `RNText` 的组件。

## 尺寸行为：填满父容器与匹配子元素

`RNHostView` 最重要的配置是 `matchContents`。

### 默认行为：使用原生父容器的尺寸

默认情况下，`matchContents` 为 `false`，`RNHostView` 使用原生父视图分配给它的尺寸。

```tsx
<Row style={{ width: 100, height: 100 }}>
  <RNHostView>
    <View
      style={{
        flex: 1,
        margin: 4,
        backgroundColor: '#9B59B6',
        borderRadius: 10,
      }}
    />
  </RNHostView>
</Row>
```

这里的 `Row` 提供 `100 × 100` 的原生布局区域，`RNHostView` 填充该区域。内部 React Native `View` 使用 `flex: 1`，因此继续填充 `RNHostView` 提供的空间，再由 `margin: 4` 留出外边距。

对于 React Web 开发者，可以把它近似理解为：

```css
.parent {
  width: 100px;
  height: 100px;
}

.host {
  width: 100%;
  height: 100%;
}
```

这只是帮助理解布局结果的类比，原生平台底层并不是 CSS 或 DOM。

### `matchContents`：根据子元素收缩

```tsx
<Row style={{ padding: 8 }}>
  <RNHostView matchContents>
    <View
      style={{
        width: 50,
        height: 50,
        backgroundColor: '#9B59B6',
        borderRadius: 10,
      }}
    />
  </RNHostView>
</Row>
```

启用 `matchContents` 后，宿主会根据 React Native 子元素的尺寸更新自己在原生视图树中的尺寸。示例中的子元素是 `50 × 50`，因此宿主收缩到相应大小。

可以将其近似理解为 Web 中内容驱动尺寸的 `fit-content` 或包裹内容布局，但两者并非完全等价。

### 如何选择

使用默认行为的典型情况：

- 父布局已经明确规定可用区域。
- React Native 内容需要填满一个固定尺寸容器。
- 子元素依赖 `flex: 1` 获取可用空间。

使用 `matchContents` 的典型情况：

- React Native 内容具有明确尺寸。
- 宿主应当根据内容收缩。
- 不希望宿主占满原生父容器提供的空间。

> **基于文档内容推导：** 如果子元素自身没有可计算的内容尺寸，却依赖父容器空间进行 `flex` 布局，那么同时使用 `matchContents` 可能形成不明确的尺寸依赖。实际开发中应优先让子元素具有可确定的宽高或内容尺寸。

## API 说明

### `RNHostView`

```tsx
import { RNHostView } from '@expo/ui';
```

支持 Android、iOS 和 Web，用于在 Jetpack Compose 或 SwiftUI 视图中托管 React Native 视图。

### `children`

```ts
ReactElement
```

必需属性，表示需要托管的 React Native 视图。

类型是单个 `ReactElement`，因此不要直接传入多个并列根节点：

```tsx
// 不符合单个 ReactElement 的类型要求
<RNHostView>
  <View />
  <View />
</RNHostView>
```

需要多个子元素时，可以使用一个 React Native `View` 包裹：

```tsx
<RNHostView>
  <View>
    <View />
    <View />
  </View>
</RNHostView>
```

### `disabled`

```ts
boolean
```

可选，支持 Android、iOS 和 Web。

设置后组件处于禁用状态，不响应用户交互。

原文没有进一步说明：

- 是否仅禁用 `RNHostView` 自身的 `onPress`。
- 是否会阻止其内部 React Native 子元素的全部交互。
- 禁用状态是否会自动改变视觉样式。

因此不能默认它具有 Web 原生 `<button disabled>` 的全部语义和样式行为。

### `hidden`

```ts
boolean
```

可选，支持 Android、iOS 和 Web，用于控制组件是否隐藏。

原文没有说明隐藏后：

- 是否仍占据布局空间。
- 子树是否继续挂载。
- `onDisappear` 是否一定会触发。

不要在缺少验证的情况下把它等同于 CSS 的 `display: none`、`visibility: hidden` 或 React 条件渲染。

### `matchContents`

```ts
boolean
```

可选，仅支持 Android 和 iOS，默认值为 `false`。

- `true`：宿主根据 React Native 子元素尺寸更新自身尺寸。
- `false`：宿主使用原生父视图提供的尺寸。

该属性只能在组件挂载时确定一次。挂载后更改它会导致组件重新挂载。

这意味着运行时切换：

```tsx
<RNHostView matchContents={isCompact}>
  <View />
</RNHostView>
```

当 `isCompact` 变化时，不只是进行一次普通布局更新，而是会重新创建组件。重新挂载可能导致内部子树的局部状态、引用和生命周期重新开始，因此不适合高频切换。

虽然 `RNHostView` 支持 Web，但 API 表明确指出 `matchContents` 只支持 Android 和 iOS。跨平台代码不应假定 Web 上具有同样的尺寸控制语义。

### `modifiers`

```ts
ModifierConfig[]
```

可选，仅支持 Android 和 iOS。

这是平台专用的扩展入口，用于传入对应原生 UI 框架的 modifier 配置：

- iOS：来自 `@expo/ui/swift-ui/modifiers`
- Android：来自 `@expo/ui/jetpack-compose/modifiers`

Modifier 可以理解为原生声明式 UI 中用于添加布局、外观或行为配置的机制，作用上与 React Web 中组合 `style`、属性和高阶包装效果有一定相似之处，但它不是 CSS。

由于两端使用不同模块，使用 `modifiers` 会引入平台差异。原文没有列出本组件支持的具体 modifier，也没有说明 Web 回退行为，需要查阅各平台 modifier 文档。

### `onAppear`

```ts
() => void
```

可选，支持 Android、iOS 和 Web，在组件出现在屏幕上时调用。

不要直接把它等同于 React Web 中只执行一次的：

```tsx
useEffect(() => {
  // mounted
}, []);
```

“挂载”和“出现在屏幕上”是不同概念。原文没有进一步定义重复出现时是否会再次调用。

### `onDisappear`

```ts
() => void
```

可选，支持 Android、iOS 和 Web，在组件从屏幕上移除时调用。

原文没有明确说明它与 React 组件卸载、条件隐藏以及导航页面切换之间的完整对应关系。

### `onPress`

```ts
() => void
```

可选，支持 Android、iOS 和 Web，在组件被按下时调用。

移动端的“按下”主要对应触摸操作，Web 上则通常对应鼠标、触控或可访问性触发。原文没有说明手势冲突、事件传播、键盘操作及无障碍语义。

### `style`

可选，支持 Android、iOS 和 Web。

它不是完整的 React Native `ViewStyle`，只接受以下属性：

```ts
padding
paddingHorizontal
paddingVertical
paddingTop
paddingBottom
paddingLeft
paddingRight
backgroundColor
borderRadius
borderWidth
borderColor
opacity
width
height
```

这些样式在 iOS 上会被转换为 SwiftUI modifiers，在 Android 上会被转换为 Jetpack Compose modifiers。

需要特别注意：

- 不能因为类型来源于 `ViewStyle`，就认为全部 React Native 样式都可用。
- `flex`、`margin`、`position`、`transform` 等属性不在文档列出的范围内。
- 这里的样式作用于 `RNHostView` 宿主，不等同于内部 React Native 子元素的样式。
- 内部子元素仍可通过自己的 `style` 使用 React Native 支持的样式。

> **基于文档内容推导：** 如果所需布局属性不在 `RNHostView.style` 的允许范围内，应优先在外层 `@expo/ui` 布局或内部 React Native 容器中实现，而不是把任意 `ViewStyle` 传给宿主。

### `testID`

```ts
string
```

可选，支持 Android、iOS 和 Web，用于在端到端测试中定位组件。

它的用途类似 React Web 测试中的 `data-testid`，但底层映射由 React Native 和平台测试框架决定。原文未指定应搭配哪一种端到端测试工具。

## React Web 开发者容易误解的地方

### `RNHostView` 不是普通的 DOM 容器

在 Android 和 iOS 上，它承担 React Native 视图树与 Compose、SwiftUI 视图树之间的托管职责。它不只是给内容套一层样式。

Web 上不存在同样的原生桥接过程，因此 Web 行为只能作为兼容回退，不能用浏览器中的表现完全推断移动端行为。

### 存在两套布局体系

外层 `@expo/ui` 和内层 React Native 子树分别参与各自的布局计算，`RNHostView` 负责连接两者。

当尺寸异常时，需要分别检查：

- 原生父布局给 `RNHostView` 分配了多大空间。
- `matchContents` 是否启用。
- React Native 子元素是否具有明确尺寸。
- 子元素是否依赖 `flex` 获取父级尺寸。
- 样式究竟写在宿主、原生父布局还是 React Native 子元素上。

### `matchContents` 不是普通的响应式属性

它只能在挂载时设置。运行时改变会触发重新挂载，可能影响内部状态和生命周期。

这与 Web 中切换一个 `width: fit-content` 样式不是同等级别的操作。

### `style` 只支持有限属性

不要把它当作完整的 React Native `View` 样式接口，更不能把它当成 CSS。TypeScript 已通过 `Pick<ViewStyle, ...>` 明确限制了允许传入的字段。

### 相同组件名可能来自不同 UI 系统

`@expo/ui` 和 `react-native` 都可能导出 `Text` 等常见名称。阅读代码时需要关注导入来源，并通过别名明确区分。

## 注意事项与限制

1. 本页属于下一 SDK 版本文档，API 在正式稳定版中可能发生变化。
2. `RNHostView` 虽然支持 Web，但 Web 上只是使用 React Native `View` 包裹子元素，没有 Compose 或 SwiftUI 桥接。
3. `matchContents` 和 `modifiers` 仅支持 Android、iOS。
4. `matchContents` 默认是 `false`，此时宿主使用原生父视图尺寸。
5. 更改已经挂载组件的 `matchContents` 会导致重新挂载。
6. `children` 类型是单个 `ReactElement`，多个并列子元素需要容器包装。
7. `style` 仅支持文档列出的有限样式属性。
8. 平台专用 `modifiers` 会增加 Android 与 iOS 的实现差异。
9. 现有 React Native 项目必须先正确安装 Expo Modules 基础环境。
10. `hidden`、生命周期回调和交互事件的细节没有在当前文档中完整定义，不应自行套用浏览器语义。

## 实际开发中的使用方式

推荐先保持最简单的边界：

```tsx
<Column>
  <RNHostView matchContents>
    <View>{/* React Native 内容 */}</View>
  </RNHostView>
</Column>
```

然后根据布局需求选择尺寸策略：

- 父级决定尺寸：保留默认 `matchContents={false}`。
- 内容决定尺寸：启用 `matchContents`，并确保子元素尺寸可以明确计算。

**基于经验建议：**

- 将 `RNHostView` 当作 UI 技术边界，避免在同一小块布局中反复嵌套原生 UI 与 React Native UI。
- 优先使用跨平台 `style`，只有统一 API 无法实现需求时再使用平台专用 `modifiers`。
- 在 Android 和 iOS 真机或模拟器上分别验证布局，不要只依赖 Web 结果。
- 避免高频动态修改 `matchContents`，因为这会重新挂载组件。
- 为关键宿主设置稳定的 `testID`，覆盖显示、点击和尺寸相关的端到端测试。

## 文档明确内容与推导内容

### 文档明确说明

- `RNHostView` 用于在 `@expo/ui` 布局中托管 React Native 视图子树。
- Android 和 iOS 分别使用 Compose、SwiftUI 对应的原生实现。
- Web 回退为包裹子元素的 React Native `View`。
- 默认情况下宿主填充原生父容器。
- `matchContents` 会使宿主匹配 React Native 子元素尺寸。
- 修改已挂载组件的 `matchContents` 会重新挂载组件。
- `style` 只支持列出的有限属性。
- `modifiers` 是 Android 和 iOS 的平台专用扩展入口。
- 组件支持交互、可见性、生命周期回调和测试标识属性。

### 基于文档内容推导

- 重新挂载可能重置内部子树的局部状态和生命周期。
- `matchContents` 更适合具有明确可计算尺寸的子元素。
- `matchContents` 与依赖父空间的 `flex` 布局组合时需要特别验证。
- 不受 `RNHostView.style` 支持的布局应由外层原生布局或内部 React Native 容器承担。
- Web 回退实现不能完全代表 Android、iOS 上的布局和生命周期行为。

## 总结

`RNHostView` 的核心作用不是提供一个新的通用容器，而是在 `@expo/ui` 原生布局与 React Native 视图子树之间建立托管边界。

实际使用时，最关键的是理解尺寸来源：

- 默认由原生父布局决定宿主尺寸。
- `matchContents` 让 React Native 子元素反过来决定宿主尺寸。

同时需要记住，Web 只是兼容回退，`style` 能力受到明确限制，`matchContents` 运行时变化会导致重新挂载。涉及真实跨平台布局时，应以 Android 和 iOS 上的实际表现为准。

---

## 文档导航

- **上一页**：[picker](./127__picker.md)
- **下一页**：[row](./129__row.md)
