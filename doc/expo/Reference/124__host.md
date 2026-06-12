# Host：跨平台承载通用 `@expo/ui` 内容

> 本文对应 Expo **下一版本 SDK** 的未版本化文档。原文指出，当前最新稳定版本为 **SDK 56**。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

## 文档解决的问题

`Host` 是 `@expo/ui` 提供的跨平台容器，用于承载一棵通用 UI 组件子树，使同一套组件结构可以运行在：

- Android
- iOS
- Web
- Expo Go

它解决的核心问题是：Android、iOS 和 Web 使用不同的底层 UI 实现，但业务代码需要一个统一的根容器来承载 `@expo/ui` 组件。

不同平台上的底层行为如下：

| 平台 | `Host` 的底层实现 |
| --- | --- |
| Android | 重新导出 Jetpack Compose 的原生 `Host` |
| iOS | 重新导出 SwiftUI 的原生 `Host` |
| Web | 回退为 React Native `View` |

因此，`Host` 并不是三个平台上完全相同的 UI 实现，而是一个统一的 React API。它会将属性转交给各平台对应的原生实现，或者在 Web 上模拟相应行为。

## 适用场景

当一棵组件树使用通用 `@expo/ui` 组件，并且需要同时支持 Android、iOS 和 Web 时，应将 `Host` 作为这棵组件树的根节点。

典型场景包括：

- 在同一套代码中渲染 `Column`、`Row`、`Text`、`Button`、`Switch` 等 `@expo/ui` 组件。
- 控制整棵 UI 子树的明暗主题或主题种子色。
- 控制从左到右或从右到左的布局方向。
- 让内容匹配自身尺寸或者填充视口。
- 读取原生 UI 内容完成布局后的尺寸。
- 控制内容是否避开刘海、Home Indicator 和软键盘等安全区域。

如果项目只使用普通 React Native 组件，当前文档没有说明必须使用 `Host`。

## 阅读前需要理解的概念

### `@expo/ui`

`@expo/ui` 是 Expo 提供的 UI 包。本文中的 `Host`、`Column`、`Row`、`Text`、`Button` 和 `Switch` 都从这个包导入。

```tsx
import { Host, Column, Text, Button } from '@expo/ui';
```

### SwiftUI 与 Jetpack Compose

它们分别是现代 iOS 和 Android 的原生声明式 UI 框架：

- **SwiftUI**：Apple 的声明式 UI 框架。
- **Jetpack Compose**：Android 的声明式 UI 框架。

对于 React Web 开发者，可以将它们粗略理解为平台原生的“组件化 UI 渲染系统”。虽然 JSX 的声明式写法与 React 有相似之处，但它们拥有各自的布局、主题和环境传播规则。

`Host` 的职责就是在 React Native 组件树与这些平台 UI 系统之间建立承载边界。

### React Native `View`

`View` 是 React Native 中最基础的布局容器，作用近似于 Web 中的 `div`，但它使用 React Native 的样式和布局系统，而不是直接使用 DOM 与普通 CSS。

在 Web 上，`Host` 会回退为一个 React Native `View`，并在此基础上实现方向、尺寸、安全区域和主题等功能。

### 子树

文档中的“子树”是指某个组件及其所有后代组件。例如：

```tsx
<Host>
  <Column>
    <Text>Hello</Text>
    <Button label="Press me" />
  </Column>
</Host>
```

这里从 `Column` 开始的整棵组件结构就是 `Host` 承载的子树。`Host` 上设置的布局方向、主题和种子色会作用于这棵子树。

## 安装

推荐使用 Expo 的安装命令：

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

`expo install` 与普通 `npm install` 的重要区别是：它会考虑当前 Expo SDK 的兼容版本，降低安装到不匹配依赖版本的风险。

如果是在已有的 React Native 原生项目中安装，而不是从 Expo 项目开始，则必须先为项目安装 Expo 模块支持。原文将这种项目称为 existing React Native app，也常被称为 bare React Native 项目。

当前文档没有提供原生 iOS 或 Android 工程的手动配置步骤，只链接到了 Expo 模块安装说明。

## 基础用法

```tsx
import { Host, Column, Text, Button } from '@expo/ui';

export default function HostExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={12} alignment="center">
        <Text>Hello, world!</Text>
        <Button label="Press me" onPress={() => alert('Pressed')} />
      </Column>
    </Host>
  );
}
```

这里有三个关键点：

1. `Host` 是通用 `@expo/ui` 子树的根节点。
2. `style={{ flex: 1 }}` 让它在父级提供的布局空间中扩展。
3. `Column` 负责纵向排列内容，角色近似于设置了纵向 Flexbox 的 Web 容器，但其具体实现取决于平台。

## 尺寸与布局

### 使用 `matchContents` 匹配内容尺寸

默认情况下，`Host` 可能受到父容器布局约束并被拉伸。启用 `matchContents` 后，它会尝试根据内部内容的布局结果调整自身大小。

```tsx
import { Host, Button } from '@expo/ui';

export default function MatchContentsExample() {
  return (
    <Host matchContents>
      <Button label="Sized to content" onPress={() => {}} />
    </Host>
  );
}
```

`matchContents` 支持以下类型：

```ts
boolean | {
  horizontal: boolean;
  vertical: boolean;
}
```

默认值为 `false`。

在 Android 和 iOS 上，该属性直接转交给平台原生 `Host`，精确行为需要参考 Jetpack Compose 和 SwiftUI 对应文档。

在 Web 上，它会为底层 `View` 应用：

```ts
alignSelf: 'flex-start'
```

这使容器不再按照父级交叉轴规则被拉伸，而是收缩以适应子元素。

#### Web 平台的重要限制

在 Web 上，下面几种写法最终具有相同的收缩效果：

```tsx
<Host matchContents />
<Host matchContents={{ horizontal: true, vertical: false }} />
<Host matchContents={{ horizontal: false, vertical: true }} />
```

这是因为 Web 实现使用的 `alignSelf` 只能控制父布局交叉轴上的拉伸，无法完整模拟水平轴和垂直轴分别匹配内容的语义。

依赖“仅水平方向收缩”或“仅垂直方向收缩”的组件，不能假设 Web 与 Android、iOS 完全一致。

此外，`matchContents` **只能在挂载时设置一次**。原文没有承诺挂载后动态修改该属性能够生效，因此不应将它设计成频繁切换的状态。

### 使用 `useViewportSizeMeasurement` 填充视口

对于需要按照可用视口空间进行布局的内容，可以启用：

```tsx
import { Host, Column, Text } from '@expo/ui';

export default function UseViewportSizeMeasurementExample() {
  return (
    <Host useViewportSizeMeasurement>
      <Column spacing={12} alignment="center">
        <Text>Fills the viewport</Text>
      </Column>
    </Host>
  );
}
```

该属性类型为 `boolean`，默认值为 `false`。

当没有显式提供尺寸时，`Host` 会将视口尺寸作为内容布局的建议尺寸。文档特别指出，它适合 `List` 这类需要填充可用空间的视图。

在 Web 上，底层 `View` 会获得当前窗口的宽度和高度。不过，如果通过 `style` 显式设置了尺寸，显式样式具有更高优先级。

因此，下面的写法不应被理解为一定占满整个窗口：

```tsx
<Host
  useViewportSizeMeasurement
  style={{ width: 300, height: 200 }}
/>
```

显式的 `width` 和 `height` 会覆盖视口测量产生的尺寸。

### 使用 `onLayoutContent` 获取内容尺寸

`onLayoutContent` 会在内容完成布局时触发，并返回当前内容的宽度和高度：

```tsx
import { Host, Text } from '@expo/ui';

export default function OnLayoutContentExample() {
  return (
    <Host
      matchContents
      onLayoutContent={({ nativeEvent: { width, height } }) =>
        console.log(`content size: ${width}x${height}`)
      }>
      <Text>Hello, world!</Text>
    </Host>
  );
}
```

回调类型为：

```ts
(event: {
  nativeEvent: {
    width: number;
    height: number;
  };
}) => void
```

内容更新并引发布局变化后，回调可能再次触发。因此，它不是只执行一次的“挂载完成”事件。

对于 React Web 开发者，可以把它类比为布局测量通知，但不要将其等同于直接读取 DOM 的 `getBoundingClientRect()`：

- Android 和 iOS 的尺寸来自原生 UI 工具包。
- Web 的尺寸根据底层 `View` 的 `onLayout` 回调生成。
- 事件结构采用 React Native 风格的 `nativeEvent`，不是浏览器 DOM 事件。

## 布局方向

`layoutDirection` 控制子树使用从左到右还是从右到左的布局：

```tsx
import { Host, Row, Text } from '@expo/ui';

export default function LayoutDirectionExample() {
  return (
    <Host layoutDirection="rightToLeft">
      <Row spacing={8}>
        <Text>First</Text>
        <Text>Second</Text>
      </Row>
    </Host>
  );
}
```

可接受的值为：

```ts
'leftToRight' | 'rightToLeft'
```

如果没有显式设置，默认使用 `I18nManager` 根据当前语言区域提供的方向。

在 Web 上，该属性会设置到底层 `View` 的 `dir` 属性，后代元素继承相应方向。这与 Web 中使用 `dir="rtl"` 或 `dir="ltr"` 的概念接近。

需要注意，布局方向不仅可能影响文字，还可能影响横向组件排列、对齐和其他具有方向性的 UI 行为。Android 和 iOS 的精确语义由对应原生 `Host` 决定。

## 安全区域与键盘

移动设备屏幕并不总是完整的矩形可用区域。以下内容可能遮挡界面：

- 屏幕刘海或挖孔。
- iPhone 底部的 Home Indicator。
- 系统状态区域。
- 屏幕软键盘。

默认情况下，`Host` 会尊重设备的安全区域边距，避免内容进入这些区域。

### 忽略全部安全区域

```tsx
<Host ignoreSafeArea="all">
  <Text>Extends behind the notch and home indicator</Text>
</Host>
```

这会允许内容延伸到设备边缘，包括刘海和 Home Indicator 后方。它适合需要全屏铺设背景等场景，但交互控件和重要文字可能被系统区域遮挡。

### 仅忽略键盘区域

```tsx
<Host ignoreSafeArea="keyboard">
  {/* content */}
</Host>
```

该模式保留一般安全区域留白，但忽略软键盘产生的安全区域。

`ignoreSafeArea` 可接受：

```ts
'all' | 'keyboard'
```

该属性同样**只能在组件挂载时设置一次**，不应依赖运行时动态切换。

### Web 上的实现

Web 通过 CSS 环境变量实现安全区域内边距：

```css
env(safe-area-inset-*)
```

默认行为还会结合：

```css
env(keyboard-inset-*)
```

键盘相关环境变量适用于主动接入浏览器 VirtualKeyboard API 的页面。当前文档未说明 VirtualKeyboard API 的兼容范围和接入步骤，因此不能假设所有 Web 浏览器都会提供一致的键盘避让行为。

## 主题控制

### 使用 `colorScheme` 强制明暗模式

`colorScheme` 用于覆盖整棵子树的外观模式：

```tsx
import { Host, Button } from '@expo/ui';

export default function HostColorSchemeExample() {
  return (
    <Host colorScheme="dark" style={{ flex: 1 }}>
      <Button label="Always dark" onPress={() => {}} />
    </Host>
  );
}
```

可使用：

```ts
'light' | 'dark'
```

省略时跟随设备设置。

在 Web 上，`Host` 会为底层 `View` 设置 `data-theme`，使设计令牌对应的 CSS 变量使用指定主题，而不再取决于 `prefers-color-scheme`。

这意味着 `colorScheme` 控制的是 `Host` 子树，而不一定改变整个应用或网页的全局主题。

### 使用 `seedColor` 派生主题

`seedColor` 接收一个基础颜色，并由各平台根据该颜色生成或应用主题：

```tsx
import { Host, Column, Button, Switch } from '@expo/ui';

export default function HostSeedColorExample() {
  return (
    <Host seedColor="#00bc7d" style={{ flex: 1 }}>
      <Column spacing={12} alignment="center">
        <Button label="Themed button" onPress={() => {}} />
        <Switch value onValueChange={() => {}} />
      </Column>
    </Host>
  );
}
```

其类型为 React Native 的 `ColorValue`。

各平台不会使用完全相同的主题算法：

| 平台 | `seedColor` 的效果 |
| --- | --- |
| Android | 使用 `SchemeTonalSpot` 生成完整的 Material 3 调色板，与 Material You 使用相同算法 |
| iOS | 作为 SwiftUI 的 tint，通过环境传播给按钮、开关和滑块等交互控件 |
| Web | 生成一套主色阶，以 CSS 变量形式提供给子树 |

Android 后代组件还可以通过 `useMaterialColors()` 访问生成的 Material 颜色。

省略 `seedColor` 时，各平台使用自身默认主题。

#### 容易误解的地方

`seedColor` 并不表示三个平台会生成视觉效果完全相同的颜色体系：

- Android 生成完整的 Material 3 调色板。
- iOS 主要使用 SwiftUI tint 机制。
- Web 生成主色 CSS 变量。

因此，它提供的是统一的主题输入，而不是逐像素一致的跨平台主题输出。

## API 汇总

```tsx
import { Host } from '@expo/ui';
```

`Host` 是一个 React 组件，支持 Android、iOS 和 Web。

### Props

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | 未说明 | `Host` 承载的子组件 |
| `colorScheme` | `ColorSchemeName` | 跟随设备 | 强制子树使用浅色或深色外观 |
| `ignoreSafeArea` | `'all' \| 'keyboard'` | 尊重安全区域 | 控制忽略哪些安全区域 |
| `layoutDirection` | `'leftToRight' \| 'rightToLeft'` | 当前语言区域方向 | 控制子树布局方向 |
| `matchContents` | `boolean \| { horizontal: boolean; vertical: boolean }` | `false` | 让容器尺寸匹配内容 |
| `onLayoutContent` | 布局事件回调 | 未设置 | 接收内容当前宽高 |
| `seedColor` | `ColorValue` | 平台默认主题 | 从基础颜色派生或应用主题 |
| `useViewportSizeMeasurement` | `boolean` | `false` | 使用视口尺寸作为建议布局尺寸 |

`Host` 还继承 React Native 的 `ViewProps`。这意味着可以传入 `style` 等 `View` 支持的属性，但当前文档没有逐项列出全部继承属性。

## 限制与坑点

1. **本文是下一 SDK 版本的文档。**  
   它不一定与当前项目所用 Expo SDK 完全一致，应先确认项目版本。

2. **平台 API 一致不代表底层行为完全一致。**  
   Android 使用 Jetpack Compose，iOS 使用 SwiftUI，Web 使用 React Native `View`。涉及原生布局细节时，需要继续阅读各平台 `Host` 文档。

3. **Web 无法完整模拟 `matchContents` 的分轴控制。**  
   `{ horizontal: true }` 和 `{ vertical: true }` 在 Web 上都会表现为相同的收缩适配。

4. **`matchContents` 与 `ignoreSafeArea` 只能在挂载时设置一次。**  
   不应把它们作为可动态切换的普通状态属性使用。

5. **显式样式会覆盖视口尺寸。**  
   `useViewportSizeMeasurement` 不会压过传入的显式尺寸样式。

6. **`onLayoutContent` 可能多次触发。**  
   内容变化会产生新的布局尺寸，回调逻辑应避免无条件更新状态而形成重复布局。

7. **忽略安全区域可能遮挡内容。**  
   `ignoreSafeArea="all"` 应谨慎用于文字、按钮和输入框等重要内容。

8. **Web 键盘安全区域取决于相关浏览器能力。**  
   原文只说明其结合 VirtualKeyboard API 的 CSS 环境变量，没有承诺统一的浏览器支持效果。

9. **`seedColor` 的结果具有平台差异。**  
   它不是一套三端完全相同的颜色生成规则。

## React Web 开发者需要特别注意的地方

### `Host` 不等同于普通 `div`

虽然 Web 上最终回退为 `View`，但在 Android 和 iOS 上，它是 React Native 与 SwiftUI、Jetpack Compose 内容之间的桥接容器。它承担原生 UI 承载、布局和环境配置职责。

### `style` 不是浏览器 CSS 对象

`Host` 继承的是 React Native `ViewProps`，因此其 `style` 遵循 React Native 样式规则。不要默认任意 CSS 属性、选择器或层叠规则都能直接使用。

### 移动端安全区域不是普通页面边距

安全区域由设备形态和系统 UI 决定。它不是固定的 `padding-top: 20px`，也不应使用固定像素模拟。

### 主题设置具有子树作用域

`colorScheme` 和 `seedColor` 作用于 `Host` 承载的后代内容。可以把它理解为某种主题 Provider，但其传播依赖各平台原生环境，而不是单纯的 React Context。

### 布局测量发生在平台布局之后

`onLayoutContent` 返回的是内容完成布局后的尺寸。不要在组件渲染期间同步期待该尺寸已经存在，也不要把它当作 DOM 引用读取。

## 实际开发中的使用方式

以下结论均为**基于文档内容推导**：

- 应为每棵通用 `@expo/ui` 子树设置一个明确的 `Host` 根节点。
- 页面主体需要占据可用空间时，可以从 `style={{ flex: 1 }}` 或 `useViewportSizeMeasurement` 开始选择；前者参与父级 Flex 布局，后者使用视口作为建议尺寸。
- 按钮或小型内容块需要按内容收缩时，可以使用 `matchContents`，但应单独验证 Web 的分轴表现。
- 国际化应用可以使用 `layoutDirection` 做局部方向覆盖；通常省略它即可跟随当前语言区域。
- 品牌主题可以从 `seedColor` 开始统一输入，但应在 Android、iOS 和 Web 分别验收视觉结果。
- 只有确实需要沉浸式、边到边布局时才应使用 `ignoreSafeArea="all"`。

**基于经验建议：**

- `onLayoutContent` 中若需要调用状态更新，应先比较新旧尺寸，避免相同尺寸反复触发渲染。
- 设计跨平台界面时，应追求功能、层级和品牌意图一致，而不是假设 SwiftUI、Compose 和 Web 能做到完全相同的像素表现。
- 应在真实设备或对应模拟器中检查安全区域、软键盘和 RTL 布局，仅在桌面浏览器中测试不足以覆盖这些行为。

## 当前文档未涉及的内容

当前文档没有说明：

- 如何创建 Expo 或 React Native 项目。
- `Column`、`Row`、`Button`、`Switch` 等组件的完整 API。
- SwiftUI 与 Jetpack Compose 原生工程的具体配置方式。
- VirtualKeyboard API 的浏览器兼容性和启用步骤。
- `Host` 的性能指标、嵌套数量限制或服务端渲染行为。
- `seedColor` 在 Web 上生成的具体 CSS 变量名称。
- 如何测试 `Host` 或为其编写自动化测试。
- 各平台原生 `Host` 的全部精确布局语义。

## 明确信息与推导信息

### 原文档明确说明

- `Host` 是通用 `@expo/ui` 内容的跨平台容器。
- Android 和 iOS 分别使用 Jetpack Compose 与 SwiftUI 的原生 `Host`。
- Web 回退为 React Native `View`。
- `matchContents`、布局方向、内容测量、视口测量、安全区域和主题功能的基本行为。
- `matchContents` 在 Web 上不能独立模拟每个轴的尺寸控制。
- `matchContents` 与 `ignoreSafeArea` 只能在挂载时设置一次。
- 显式 `style` 会优先于 Web 上的视口尺寸。
- `seedColor` 在三个平台上采用不同的原生主题机制。

### 基于文档内容推导

- `Host` 应被视为通用 UI 子树与平台 UI 系统之间的边界，而不是普通布局标签。
- 同一组属性在三个平台上可能保证意图一致，但不能保证布局和视觉结果完全一致。
- 使用平台相关能力时，需要分别进行 Android、iOS 和 Web 验证。
- 动态改变只能挂载时设置的属性，通常需要重新挂载相应的 `Host`，但原文没有规定具体实现方案。

## 总结

`Host` 是使用通用 `@expo/ui` 组件时的根容器。它为 React 代码提供统一 API，同时在 Android、iOS 和 Web 上连接不同的底层 UI 系统。

掌握该组件时最重要的不是记住所有属性，而是理解以下边界：

- 通用 API 背后存在平台原生差异。
- `Host` 控制的是整棵子树的布局环境、方向、安全区域和主题。
- Web 是基于 React Native `View` 的回退实现，部分原生语义只能近似模拟。
- 与尺寸、安全区域和主题相关的功能必须进行跨平台验证。

---

## 文档导航

- **上一页**：[fieldgroup](./123__fieldgroup.md)
- **下一页**：[icon](./125__icon.md)
