# Expo UI SwiftUI `Link` 组件学习文档

## 文档解决的问题

`Link` 是 `@expo/ui` 提供的 SwiftUI 原生链接组件，用于在 Expo 或 React Native 应用中显示可点击的 URL 链接。

它主要适合以下场景：

- 在 iOS 或 tvOS 界面中打开网页链接。
- 使用简单文本作为链接标签。
- 使用图标、文本和布局组件组合出自定义链接内容。
- 希望链接的外观和行为匹配 Apple 官方 SwiftUI `Link` API。

> **文档明确说明**：Expo UI 的 `Link` 与 Apple 官方 SwiftUI `Link` API 对应。

## 版本与平台范围

本文页面属于 **下一个 Expo SDK 版本的未发布文档**，修改日期为 **2026 年 5 月 19 日**。

文档同时指出，当前稳定版本是 **SDK 56**，实际项目应优先核对对应的稳定版文档。

组件支持范围：

| 项目 | 支持情况 |
| --- | --- |
| iOS | 支持 |
| tvOS | 支持 |
| Android | 不支持 |
| Web | 不支持 |
| Expo Go | 已包含 |

这里的“Expo Go 已包含”表示可以在 Expo Go 提供的原生运行环境中使用该模块，不等于该组件支持浏览器 Web 平台。

> **React Web 开发者注意**：这不是 React Router 的 `<Link>`，也不是 HTML 的 `<a>`。它渲染的是 Apple 平台上的原生 SwiftUI 链接组件。

## 安装

安装的软件包是：

```text
@expo/ui
```

根据项目使用的包管理器执行对应命令：

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

### 为什么使用 `expo install`

文档使用的是 `expo install`，而不是直接执行 `npm install`。

`expo install` 会按照当前 Expo SDK 选择适合的依赖版本。对于包含原生实现的 Expo 模块，这比随意安装某个最新版更符合 Expo 项目的依赖管理方式。

### 已有 React Native 项目的额外要求

如果项目是已有的普通 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，才能使用 Expo Modules。

> **文档明确说明**：在 existing React Native app 中安装 `@expo/ui` 时，必须确保项目已经安装 `expo`。

本文没有进一步说明：

- iOS 原生工程的具体配置步骤。
- CocoaPods 是否需要手动执行。
- Android 工程配置。
- Expo Modules 在已有 React Native 项目中的完整接入流程。

这些内容需要查阅文档所链接的“Installing Expo modules”页面。

## 基础用法

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

这里包含两个组件：

- `Host`：示例中用于承载 SwiftUI 组件。
- `Link`：实际显示并处理链接的原生组件。

本文没有提供 `Host` 的完整 API，因此不能仅根据本页确定它的全部职责和配置规则。不过从示例可以确定，`Link` 被放在 `Host` 内使用。

### `label`

`label` 是用户看到的简单文本：

```tsx
label="Visit Expo"
```

它的作用类似 HTML 链接的文本内容：

```html
<a href="https://expo.dev">Visit Expo</a>
```

这种类比仅用于帮助理解；`Link` 并不会渲染成 HTML `<a>`。

### `destination`

`destination` 是要打开的 URL：

```tsx
destination="https://expo.dev"
```

该属性是必填字符串。本文没有说明：

- 是否只支持 HTTP 和 HTTPS。
- 是否支持自定义 URL Scheme。
- 无效 URL 会产生什么行为。
- 链接由哪个浏览器或应用打开。
- 打开链接失败时如何处理。

因此，不能从当前文档推断这些行为。

## 自定义链接内容

简单链接可以使用 `label`。需要更复杂的视觉结构时，可以通过 `children` 传入组件：

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

链接标签由以下结构组成：

```text
Link
└── VStack
    ├── Image
    └── Text
```

`VStack` 将图标和文字按垂直方向排列，`spacing={4}` 设置二者之间的间距。

`Image` 的 `systemName="link"` 表示示例使用名为 `link` 的系统图标。当前页面没有进一步说明系统图标的来源、兼容范围和配置规则。

### `children` 的限制

`children` 是可选属性，用于定义自定义链接标签。

它只接受嵌套的 React 元素，不接受裸字符串。因此下面这种写法不符合文档描述：

```tsx
<Link destination="https://expo.dev">
  Expo
</Link>
```

应改为使用 `label`：

```tsx
<Link
  label="Expo"
  destination="https://expo.dev"
/>
```

或者将文本包装成组件：

```tsx
<Link destination="https://expo.dev">
  <Text>Expo</Text>
</Link>
```

> **React Web 开发者注意**：在 React DOM 中，组件通常可以直接接收字符串 `children`；这里的 SwiftUI `Link` 明确限制自定义内容必须是 React 元素。

## API 说明

组件从以下入口导入：

```tsx
import { Link } from '@expo/ui/swift-ui';
```

`Link` 的类型是返回 React 元素的组件，属性类型为 `LinkProps`。

### 属性总览

| 属性 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `destination` | `string` | 是 | 指定链接 URL |
| `label` | `string` | 否 | 设置简单文本标签 |
| `children` | `React.ReactElement` | 否 | 设置自定义标签视图 |
| `modifiers` | 继承属性 | 否 | 应用 SwiftUI 视图修饰效果 |

所有这些属性在本页中标注的平台范围均为 iOS 和 tvOS。

### `label` 与 `children` 如何选择

简单文本链接使用：

```tsx
<Link label="Open" destination="https://expo.dev" />
```

包含图标、布局或多个视图时使用：

```tsx
<Link destination="https://expo.dev">
  <VStack>
    <Image systemName="link" />
    <Text>Open</Text>
  </VStack>
</Link>
```

> **基于文档内容推导**：`label` 和 `children` 表达的是两种标签构建方式。实际代码中应根据内容复杂度选择其中一种，避免同时提供后产生语义不清。本文没有明确规定同时传入二者时的优先级。

## 使用 Modifiers 调整外观

示例通过 modifiers 设置链接的颜色和字体：

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

其中：

- `foregroundStyle('red')`：将前景样式设置为红色。
- `font({ size: 24, weight: 'bold' })`：将字体大小设为 `24`，字重设为粗体。
- `modifiers`：按数组形式接收这些 SwiftUI 修饰器。

`modifiers` 来自继承的 `CommonViewModifierProps`，不是 `Link` 独有的属性。

> **React Web 开发者注意**：modifier 不等同于 CSS class。它更接近 SwiftUI 的视图修饰机制，通过一组声明式操作修改原生视图。本文没有说明 modifier 的执行顺序是否会影响最终效果，需要查阅专门的 modifiers 文档。

## 容易踩坑的地方

### 1. 组件仅支持 Apple 平台

`Link` 只标注支持 iOS 和 tvOS，不能把它当作 Android、Web 通用链接组件。

> **基于文档内容推导**：如果项目同时支持 Android 或 Web，需要在架构层面准备平台判断或替代实现。本文没有提供跨平台封装方案。

### 2. 不要从错误的入口导入

正确入口是：

```tsx
import { Link } from '@expo/ui/swift-ui';
```

不是 React Router、React Native 核心库或其他链接库中的同名组件。

### 3. 自定义内容不能是裸字符串

错误示意：

```tsx
<Link destination="https://expo.dev">Expo</Link>
```

正确方式是使用 `label`，或者将内容包装为 `Text` 等 React 元素。

### 4. 页面属于下一 SDK 版本

本页路径为 `unversioned`，内容面向下一个 Expo SDK 版本。当前项目使用 SDK 56 或其他版本时，需要对照相应版本文档确认 API 是否已经可用以及签名是否一致。

### 5. 当前页面没有说明链接事件控制

本文未涉及：

- `onPress` 回调。
- 打开前拦截。
- 阻止默认行为。
- 打开应用内浏览器。
- 链接访问状态。
- 错误处理。
- 无障碍属性的自定义方式。
- 测试方式。

如果业务需要这些能力，不能假定该组件自动提供，必须继续查阅 `@expo/ui`、SwiftUI `Link` 或其他 Expo 铠接方案的文档。

## 实际开发中的使用方式

### 适合直接使用 `Link` 的情况

- 应用只面向 iOS 或 tvOS。
- 目标是打开一个固定 URL。
- 希望链接使用原生 SwiftUI 表现。
- 链接内容是简单文本或由 SwiftUI 组件构成的标签。

### 需要额外设计的情况

- 项目还要支持 Android 或 Web。
- 需要统计点击行为。
- 需要打开应用内浏览器。
- 需要根据业务状态决定是否允许跳转。
- 需要处理深链接或自定义 URL Scheme。
- 需要捕获跳转失败。

以上需求没有在当前文档中提供解决方案。

### 基于经验建议

在跨平台项目中，可以把链接行为封装为业务组件，由业务组件根据平台选择具体实现，避免在大量页面里直接散落 `@expo/ui/swift-ui` 的平台专属代码。

同时，应将 `destination` 当作外部输入检查，尤其是 URL 来自服务端或用户输入时。URL 校验属于通用安全实践，并非当前文档明确提出的要求。

## 明确信息与推导结论

### 文档明确说明

- `Link` 用于显示可点击链接。
- 它匹配 Apple 官方 SwiftUI `Link` API。
- 组件来自 `@expo/ui/swift-ui`。
- 支持 iOS 和 tvOS。
- `@expo/ui` 已包含在 Expo Go 中。
- `destination` 是必填字符串。
- `label` 是可选的简单文本标签。
- `children` 用于自定义标签内容。
- `children` 只支持嵌套元素，不支持裸字符串。
- 组件继承 `CommonViewModifierProps`。
- 已有 React Native 项目需要先安装 Expo Modules 支持。

### 基于文档内容推导

- 这是平台专属组件，跨平台项目需要准备其他平台的替代实现。
- 简单内容应使用 `label`，复杂视图应使用 `children`。
- 不宜同时提供 `label` 和 `children`，因为文档没有说明二者同时存在时的行为。
- `Host` 是示例中承载 SwiftUI 组件的容器，但其完整职责不能从本页确定。
- 由于页面属于 `unversioned` 文档，稳定版项目应按自身 SDK 版本核对 API。

## 总结

`@expo/ui/swift-ui` 的 `Link` 是一个面向 iOS 和 tvOS 的原生 SwiftUI 链接组件。

最简单的使用方式是提供 `label` 和 `destination`；需要图标、布局或多个视图时，则使用 React 元素形式的 `children`。组件还可以通过 SwiftUI modifiers 调整外观。

对 React Web 开发者而言，最重要的是不要把它理解为 HTML `<a>` 或 React Router `<Link>`：它是 Apple 平台专属的原生组件，不支持 Web 和 Android，也不允许直接使用字符串 `children`。当前页面只覆盖基本链接显示和样式设置，没有涉及事件拦截、应用内浏览器、深链接、错误处理或跨平台方案。

---

## 文档导航

- **上一页**：[lazyvstack](./93__lazyvstack.md)
- **下一页**：[list](./95__list.md)
