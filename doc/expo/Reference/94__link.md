# Link：使用 Expo UI 创建原生 SwiftUI 链接

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档；当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`Link` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在 React Native 代码中显示可以点击的原生链接。

它主要解决以下需求：

- 显示一个带文字标签的简单链接。
- 点击链接后前往指定 URL。
- 使用图片、文字和布局组件组成自定义链接标签。
- 通过 SwiftUI modifier 调整链接外观。

该组件与 Apple 官方 SwiftUI 的 [`Link`](https://developer.apple.com/documentation/swiftui/link) API 对应。这里的“对应”表示 Expo UI 尝试让 React 组件的能力和使用方式贴近原生 SwiftUI 组件，而不是浏览器中的 HTML `<a>` 标签。

## 适用场景

适合：

- Expo 或 React Native 项目需要在 iOS、tvOS 上显示原生链接。
- 希望链接视觉和交互符合 Apple 平台原生体验。
- 需要使用图标、垂直布局等内容作为链接标签。
- 已经在使用 `@expo/ui/swift-ui` 组件体系。

不适合：

- 需要同时支持 Android 或 Web 的跨平台链接。
- 需要使用浏览器 `<a>` 标签的属性或行为。
- 只开发普通 React Web 项目。

`Link` 文档明确列出的支持平台只有 iOS 和 tvOS，没有列出 Android 或 Web。

## 阅读前需要理解的概念

### Expo、React Native 与 SwiftUI 的关系

对于 React Web 开发者，可以这样理解：

- React Web 最终渲染的是 DOM 元素。
- React Native 最终渲染的是移动平台原生视图。
- SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台界面的原生 UI 框架。
- `@expo/ui/swift-ui` 将部分 SwiftUI 组件包装成可以通过 React JSX 使用的组件。

因此：

```tsx
<Link label="Visit Expo" destination="https://expo.dev" />
```

虽然写法像 React 组件，但最终显示的是 Apple 平台的原生链接组件，不是：

```html
<a href="https://expo.dev">Visit Expo</a>
```

不要直接套用浏览器 DOM、CSS 或事件模型来理解它。

### `Host`

示例将 `Link` 放在 `Host` 中：

```tsx
<Host>
  <Link />
</Host>
```

从文档示例可以确定，`Host` 是承载这些 SwiftUI 组件的容器。当前文档没有进一步解释其生命周期、渲染边界或详细配置。

示例中出现了两个与布局相关的属性：

- `style={{ flex: 1 }}`：让 `Host` 按 React Native 的 Flexbox 方式占据可用空间。
- `matchContents`：用于让 `Host` 的尺寸匹配其内容。

后者的精确定义和限制当前文档未涉及，需要查阅 `Host` 的独立文档。

### `label` 与 `children`

`Link` 提供两种定义可点击内容的方式：

- `label`：简单字符串标签。
- `children`：由组件构成的自定义标签视图。

这类似于 React Web 中的两种写法：

```tsx
<Component label="Expo" />
```

和：

```tsx
<Component>
  <CustomContent />
</Component>
```

但 `Link` 的 `children` 不能直接传入普通字符串，必须传入嵌套的 React 元素。

## 安装

根据项目使用的包管理器选择一条命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

这里使用的是 `expo install`，而不是直接执行 `npm install`。它会根据当前 Expo SDK 选择兼容的包版本。

### 已有 React Native 项目的额外要求

如果项目是现有的 React Native 原生项目，而不是已经配置好的 Expo 项目，需要先在项目中安装并配置 `expo`，使项目能够使用 Expo Modules。

这不代表必须把整个项目改成完全由 Expo 托管，但原生工程必须具备运行 Expo 模块的基础配置。

具体安装流程当前文档未展开，只提供了“在现有 React Native 项目中安装 Expo Modules”的关联文档。

## 基本用法

```tsx
import { Host, Link } from '@expo/ui/swift-ui';

export default function BasicLinkExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Link label="Visit Expo" destination="https://expo.dev" />
    </Host>
  );
}
```

代码中的关键部分：

- `Host`：承载 SwiftUI 组件。
- `label`：用户看到的文字。
- `destination`：点击后前往的 URL。
- `style={{ flex: 1 }}`：使宿主容器占据可用空间。

这是最适合普通文本链接的写法。

## 使用自定义标签内容

当链接标签不只是文字时，可以通过 `children` 传入组件：

```tsx
import { Host, Link, VStack, Image, Text } from '@expo/ui/swift-ui';

export default function CustomContentExample() {
  return (
    <Host matchContents>
      <Link destination="https://expo.dev">
        <VStack spacing={4}>
          <Image systemName="link" />
          <Text>Expo</Text>
        </VStack>
      </Link>
    </Host>
  );
}
```

这个链接的标签由三部分组成：

- `VStack`：将子元素沿垂直方向排列。
- `spacing={4}`：设置垂直排列元素之间的间距。
- `Image systemName="link"`：显示名为 `link` 的 Apple 系统图标。
- `Text`：显示文字 `Expo`。

`Link` 包裹的整个自定义视图会成为链接标签。

### `children` 的重要限制

以下方式不符合文档要求：

```tsx
<Link destination="https://expo.dev">
  Expo
</Link>
```

原因是 `Expo` 是普通字符串，而文档明确说明 `children` 只支持嵌套元素。

应改为：

```tsx
<Link destination="https://expo.dev">
  <Text>Expo</Text>
</Link>
```

或者对于简单文字直接使用：

```tsx
<Link
  label="Expo"
  destination="https://expo.dev"
/>
```

## API

### 导入方式

```tsx
import { Link } from '@expo/ui/swift-ui';
```

不要从 `@expo/ui` 根路径或 React Native 核心库中导入这个组件。文档指定的入口是 `@expo/ui/swift-ui`。

### `Link`

```tsx
<Link
  label="Open"
  destination="https://expo.dev"
/>
```

该组件显示一个原生链接，支持 iOS 和 tvOS。

文档将其类型表示为 React 元素，其属性类型为 `LinkProps`。

## `LinkProps`

### `destination`

```ts
destination: string
```

必填属性，用于指定链接 URL：

```tsx
<Link
  label="Visit Expo"
  destination="https://expo.dev"
/>
```

当前文档只说明它是 URL 字符串，没有进一步规定：

- 支持哪些 URL scheme。
- 无效 URL 如何处理。
- 点击后由哪个应用打开。
- 是否能够拦截点击行为。
- tvOS 上的具体打开行为。
- URL 打开失败时如何反馈。

因此，不应仅根据本页对这些行为作出额外假设。

### `label`

```ts
label?: string
```

可选属性，用于定义简单文本链接：

```tsx
<Link
  label="Open"
  destination="https://expo.dev"
/>
```

当链接只需要显示一段文字时，优先使用 `label`，不必额外创建 `Text` 组件。

### `children`

概念上的类型为 React 元素：

```ts
children?: React.ReactElement
```

它用于定义复杂的自定义标签，例如图标与文字组合：

```tsx
<Link destination="https://expo.dev">
  <VStack>
    <Image systemName="link" />
    <Text>Expo</Text>
  </VStack>
</Link>
```

文档明确指出：

- `children` 是可选属性。
- 只支持嵌套元素。
- 不支持直接传入普通字符串。

原 API 表格将可接受值显示为：

```ts
React.ReactElement | React.ReactElement
```

两个联合成员完全相同，可能是文档生成结果中的重复展示。本页没有提供足够信息说明它原本是否代表两种不同类型，因此这里不进一步推测。

### 继承属性

`LinkProps` 继承 `CommonViewModifierProps`。

这意味着可以通过 `modifiers` 向组件应用 SwiftUI 风格的视图修饰器：

```tsx
import { Link } from '@expo/ui/swift-ui';
import {
  foregroundStyle,
  font,
} from '@expo/ui/swift-ui/modifiers';

<Link
  label="Open"
  destination="https://expo.dev"
  modifiers={[
    foregroundStyle('red'),
    font({ size: 24, weight: 'bold' }),
  ]}
/>
```

该示例中：

- `foregroundStyle('red')` 将前景样式设为红色。
- `font({ size: 24, weight: 'bold' })` 设置字号和粗细。
- 多个 modifier 按数组形式传给 `modifiers`。

完整的公共 modifier 列表及其支持范围不属于本页内容，需要查阅 `CommonViewModifierProps` 文档。

## React Web 开发者容易误解的地方

### 它不是 HTML 链接

不能假设它支持以下 Web 属性：

```tsx
target="_blank"
rel="noopener"
download
href
```

本组件使用的是 `destination`，不是 `href`。当前文档也没有列出上述浏览器属性。

### 不能使用普通字符串作为子节点

React Web 中这样写很自然：

```tsx
<a href="https://expo.dev">Expo</a>
```

但自定义 `Link` 内容必须使用组件：

```tsx
<Link destination="https://expo.dev">
  <Text>Expo</Text>
</Link>
```

简单文字则使用 `label` 更合适。

### 样式系统不等同于 CSS

文档示例使用 SwiftUI modifiers 设置前景色和字体，而不是 `className` 或 CSS：

```tsx
modifiers={[
  foregroundStyle('red'),
  font({ size: 24, weight: 'bold' }),
]}
```

不要假设 CSS 属性、选择器、伪类或浏览器媒体查询可以直接应用于该组件。

### 平台支持范围很窄

`Link` 仅明确支持：

- iOS
- tvOS

即使项目本身可以运行在 Android 或 Web，也不能据此推断该组件在这些平台可用。跨平台项目需要在架构上处理平台差异，例如选择平台对应的链接实现。

> **基于文档内容推导：** 如果同一组件树需要运行在 Android 或 Web，仅直接使用这个 `Link` 无法满足文档声明的平台范围，需要进行平台拆分或封装。

### Expo Go 中包含不等于支持所有平台

“Included in Expo Go”表示该模块已包含在 Expo Go 环境中，不代表 `Link` 因此支持 Android。组件的平台声明仍然只有 iOS 和 tvOS。

## 注意事项与限制

1. 当前页面是下一个 Expo SDK 版本的文档，不是当前稳定版本文档。稳定版本应参考 SDK 56 页面。
2. 组件仅明确支持 iOS 和 tvOS。
3. `destination` 必填，类型为字符串。
4. `label` 可选，适合简单文字。
5. `children` 可选，但不能是普通字符串。
6. 自定义内容需要由 `Text`、`Image`、`VStack` 等嵌套元素组成。
7. 现有 React Native 项目必须先具备 Expo Modules 支持。
8. 完整 modifier 能力未在本页列出。
9. URL scheme、错误处理、点击拦截和打开策略当前文档未涉及。
10. 文档没有说明同时提供 `label` 和 `children` 时的优先级，应避免依赖未定义行为。

第 10 点属于对 API 缺失说明的保守处理，不代表组件一定禁止同时传入二者。

## 实际开发中的选择方式

### 只有文字

使用 `label`：

```tsx
<Link
  label="查看 Expo 官网"
  destination="https://expo.dev"
/>
```

### 图标加文字或复杂布局

使用 `children`：

```tsx
<Link destination="https://expo.dev">
  <VStack spacing={4}>
    <Image systemName="link" />
    <Text>Expo</Text>
  </VStack>
</Link>
```

### 需要调整原生外观

使用 `modifiers`：

```tsx
<Link
  label="打开"
  destination="https://expo.dev"
  modifiers={[
    foregroundStyle('red'),
    font({ size: 24, weight: 'bold' }),
  ]}
/>
```

### 需要跨平台

> **基于文档内容推导：** 应将 Apple 平台实现与 Android、Web 实现隔离，避免业务组件直接依赖仅支持 iOS、tvOS 的组件。

具体的平台文件组织、条件渲染方式和替代组件不属于当前文档内容。

## 文档明确内容与推导内容

### 文档明确说明

- `Link` 用于显示可点击链接。
- 它匹配 Apple 官方 SwiftUI `Link` API。
- 包名是 `@expo/ui`。
- 导入路径是 `@expo/ui/swift-ui`。
- 支持 iOS 和 tvOS。
- 已包含在 Expo Go 中。
- `destination` 是必填字符串。
- `label` 是可选字符串。
- `children` 用于自定义标签，不能直接传入普通字符串。
- 可以通过继承的公共属性使用 modifiers。
- 现有 React Native 项目需要安装 Expo Modules。
- 本页属于下一个 SDK 版本的文档。

### 基于文档内容推导

- 它不能作为 Android、Web 的统一链接实现。
- 跨平台项目需要隔离或封装平台实现。
- 简单文字使用 `label` 比创建自定义 `Text` 更直接。
- 文档未定义 `label` 与 `children` 同时存在时的行为，因此应避免同时提供。
- URL 打开策略等未记录行为不应作为稳定 API 依赖。

## 当前文档未涉及的内容

- 无障碍属性及屏幕阅读器行为。
- 链接点击事件回调。
- 阻止或拦截默认打开行为。
- 深度链接和自定义 URL scheme 的支持情况。
- URL 校验与错误处理。
- Android、Web 的替代实现。
- tvOS 上的焦点和遥控器交互细节。
- `Host` 的完整属性和工作原理。
- `CommonViewModifierProps` 的完整 API。
- 原生工程需要修改的具体文件或目录。
- 测试链接交互的方法。

## 总结

`@expo/ui/swift-ui` 的 `Link` 允许开发者通过 React JSX 使用 Apple 平台原生的 SwiftUI 链接组件。

使用时需要掌握三个核心点：

- 通过必填的 `destination` 指定 URL。
- 简单文字使用 `label`。
- 复杂标签使用组件形式的 `children`，不能直接传字符串。

它不是 HTML `<a>` 标签，样式和属性体系也不遵循浏览器模型。由于文档只声明支持 iOS 和 tvOS，跨平台项目需要为 Android 和 Web 准备其他实现。

---

## 文档导航

- **上一页**：[lazyvstack](./93__lazyvstack.md)
- **下一页**：[list](./95__list.md)
