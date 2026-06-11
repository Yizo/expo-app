# VStack：使用 SwiftUI 原生垂直布局

`VStack` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在 iOS 和 tvOS 上将多个子元素沿垂直方向排列。

> **版本提示：**当前页面描述的是下一个 Expo SDK 版本中的 API，不是当前稳定版本。原文指出，当前最新稳定文档对应 **SDK 56**。实际开发时应优先核对项目使用的 Expo SDK 版本及其对应文档。

## 文档解决的问题

本文主要说明：

- 如何安装包含 `VStack` 的 `@expo/ui`。
- 如何创建垂直排列的原生 SwiftUI 界面。
- 如何设置子元素间距。
- 如何控制子元素的水平方向对齐方式。
- `VStack` 支持哪些平台和属性。

它适合需要在 **iOS 或 tvOS** 上使用 SwiftUI 原生组件构建垂直布局的 Expo/React Native 项目。

如果项目需要跨平台布局，原文建议使用通用的 `Column`，由它根据平台渲染合适的原生组件。

## 阅读前需要理解的概念

### `VStack` 与 Web 布局的对应关系

`VStack` 来自 Apple 的 SwiftUI，其职责是将子元素从上到下排列。

React Web 开发者可以暂时将它理解为：

```css
.container {
  display: flex;
  flex-direction: column;
}
```

但两者不是同一种底层实现：

- Web 使用浏览器的 CSS 布局系统。
- `VStack` 对接的是 Apple 平台的 SwiftUI 原生布局。
- CSS 属性不能直接套用到 `VStack` 上。
- 尺寸和样式通常通过 Expo UI 的 modifiers（修饰器）设置。

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、macOS、tvOS 等平台界面的原生 UI 框架。

这里不需要编写 Swift 代码，而是在 React/TSX 中使用 `@expo/ui/swift-ui` 暴露的组件，最终渲染 SwiftUI 界面。

### `Host`

示例中的 `Host` 用于承载 SwiftUI 组件：

```tsx
<Host matchContents>
  <VStack>{/* SwiftUI 内容 */}</VStack>
</Host>
```

对于只熟悉 React Web 的开发者，可以将它理解为 React Native 与 SwiftUI 内容之间的承载边界。

原文示例使用了 `matchContents`，但当前文档没有进一步解释该属性的完整行为、适用条件或限制。

## 安装

根据项目使用的包管理器执行其中一条命令：

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

`expo install` 不只是普通的包安装命令，它会结合项目的 Expo SDK 版本选择兼容的依赖版本。因此，在 Expo 项目中不应简单地把它等同于 `npm install`。

如果是在已有的普通 React Native 工程中使用 `@expo/ui`，原文明确要求先为项目安装并配置 `expo`，使工程具备使用 Expo Modules 的能力。

当前文档未涉及：

- 原生 iOS 工程的具体配置步骤。
- CocoaPods 或 Xcode 配置。
- Android 工程配置。
- 安装后的构建或重新生成原生工程流程。

## 基础用法

```tsx
import { Host, VStack, Text } from '@expo/ui/swift-ui';

export default function BasicVStackExample() {
  return (
    <Host matchContents>
      <VStack spacing={12}>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </VStack>
    </Host>
  );
}
```

该示例完成了以下工作：

1. 从 `@expo/ui/swift-ui` 导入 SwiftUI 组件。
2. 使用 `Host` 承载 SwiftUI 内容。
3. 使用 `VStack` 将三个 `Text` 从上到下排列。
4. 通过 `spacing={12}` 设置相邻子元素之间的间距。

`spacing` 控制的是**子元素之间**的距离，不是容器内边距，也不是容器外边距。

对于 React Web 开发者，它更接近纵向 Flexbox 中的 `gap`：

```css
display: flex;
flex-direction: column;
gap: 12px;
```

这只是概念类比，原文没有说明 SwiftUI 数值与 CSS 像素之间可以直接等同。

## 设置水平对齐方式

虽然 `VStack` 在垂直方向上排列子元素，但 `alignment` 控制的是与排列方向垂直的轴，也就是子元素的**水平对齐方式**。

支持三个值：

| 值 | 含义 | Web 近似理解 |
|---|---|---|
| `leading` | 靠起始侧对齐 | 类似 `align-items: flex-start` |
| `center` | 居中对齐 | 类似 `align-items: center` |
| `trailing` | 靠结束侧对齐 | 类似 `align-items: flex-end` |

```tsx
import { Host, VStack, Rectangle } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function VStackAlignmentExample() {
  return (
    <Host matchContents>
      <VStack spacing={12} alignment="leading">
        <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
        <Rectangle modifiers={[frame({ width: 100, height: 50 })]} />
        <Rectangle modifiers={[frame({ width: 75, height: 50 })]} />
      </VStack>
    </Host>
  );
}
```

三个矩形宽度不同，因此可以直观看到 `leading` 的对齐效果：它们在水平方向的起始侧对齐，同时仍然从上到下排列。

### `leading` 不应简单翻译成“左对齐”

`leading` 表示布局方向的起始侧，`trailing` 表示结束侧。它们不是直接命名为 `left` 和 `right`。

**基于文档术语推导：**这种命名通常是为了适应不同的界面书写方向。因此，业务代码中应保留“起始侧”和“结束侧”的语义，而不要将其硬编码理解为绝对的左右方向。当前文档没有进一步说明其在不同语言方向下的具体行为。

## 使用 modifier 设置尺寸

示例没有使用 Web 中的 `style`，而是导入 `frame`：

```tsx
import { frame } from '@expo/ui/swift-ui/modifiers';
```

然后通过 `modifiers` 数组应用尺寸：

```tsx
<Rectangle
  modifiers={[frame({ width: 50, height: 50 })]}
/>
```

这里的职责分别是：

- `frame(...)`：创建一个用于设置宽高的 SwiftUI modifier。
- `modifiers`：接收 modifier 数组并应用到组件。
- `width`、`height`：在示例中分别控制矩形宽度和高度。

React Web 中可能会写成：

```tsx
<div style={{ width: 50, height: 50 }} />
```

但在这套 SwiftUI API 中，应使用其组件和 modifier 体系，不能假设 React DOM 的 `style`、`className` 或 CSS 文件会生效。

`VStack` 还继承了 `CommonViewModifierProps`，说明它可以接收公共视图 modifier 相关属性。不过，当前文档没有列出这些继承属性的具体内容，需要查阅单独的 modifiers 文档。

## API 说明

### 导入方式

```tsx
import { VStack } from '@expo/ui/swift-ui';
```

不要从 `react-native` 或 `@expo/ui` 的其他入口导入该组件。这里使用的是明确的 SwiftUI 子路径。

### `VStack`

支持平台：

- iOS
- tvOS

返回类型为 React 元素，其属性类型是 `VStackProps`。

### `children`

```ts
children: React.ReactNode
```

必填属性，用于传入需要垂直排列的子内容。

它与 React Web 组件的 `children` 概念一致，可以是一个或多个 React 节点。

### `spacing`

```ts
spacing?: number
```

可选属性，用于设置相邻子元素之间的间距。

当前文档没有明确说明：

- 默认间距是多少。
- 数值采用什么具体单位。
- 是否允许负数。
- 不同平台或系统版本上是否存在差异。

因此，不应根据 Web CSS 经验自行假定这些行为。

### `alignment`

```ts
alignment?: 'leading' | 'center' | 'trailing'
```

可选属性，用于控制子元素在水平方向上的对齐方式。

只接受以下字符串：

- `'leading'`
- `'center'`
- `'trailing'`

传入 Web Flexbox 常见的 `'flex-start'`、`'flex-end'` 或 `'left'` 不符合该 API。

### 继承属性

`VStackProps` 继承 `CommonViewModifierProps`。

当前页面只给出了继承关系，没有展开其具体属性，因此使用其他 modifier 能力时应查阅对应的 SwiftUI modifiers 文档。

## 平台与版本限制

### 仅支持 Apple 平台

API 表格明确列出的支持平台只有：

- iOS
- tvOS

页面元信息同时说明该组件包含在 Expo Go 中。

这意味着：

- 可以在支持条件满足时通过 Expo Go 使用它。
- 当前文档没有声明 Android 或 Web 支持。
- 不应在跨平台公共界面中默认直接使用 `VStack`。

**基于文档内容推导：**如果同一个组件需要同时运行在 iOS、Android 和 Web 上，直接引用 `@expo/ui/swift-ui` 的 `VStack` 会形成平台耦合。原文推荐使用通用 `Column`，由其为不同平台选择适当的原生实现。

### 当前页面属于未发布版本文档

页面路径和警告明确说明这是下一个 SDK 版本的文档，而稳定文档是 SDK 56。

实际开发中的影响是：

- 页面展示的 API 可能尚未存在于当前项目版本。
- 属性、类型或行为在正式发布前可能变化。
- 安装成功不代表当前 SDK 一定支持此页面中的全部写法。
- 应根据项目的 Expo SDK 版本查阅对应版本文档。

## React Web 开发者容易误解的地方

1. **`VStack` 不是带有预设 CSS 的 `<div>`。**  
   它对应 SwiftUI 原生组件，使用的是原生布局与 modifier 体系。

2. **`alignment` 控制水平轴。**  
   `VStack` 的主排列方向是垂直方向，因此对齐属性作用于水平方向。

3. **`spacing` 不是 `padding` 或 `margin`。**  
   它只描述子元素之间的距离。

4. **不能直接使用 Web 对齐值。**  
   应使用 `leading`、`center`、`trailing`，而不是 `flex-start` 或 `flex-end`。

5. **示例中的 `frame` 不是浏览器 frame。**  
   它是 SwiftUI modifier，用来约束视图尺寸。

6. **React 语法相似不代表运行环境相同。**  
   虽然代码使用 TSX、组件和 `children`，最终界面不是由浏览器 DOM 和 CSS 渲染的。

7. **Expo Go 可用不代表全平台可用。**  
   页面同时明确限定了 iOS 和 tvOS；Android 与 Web 未被列为支持平台。

## 实际开发中的使用方式

适合直接使用 `VStack` 的场景包括：

- 仅面向 iOS 或 tvOS 的界面。
- 需要使用 SwiftUI 原生组件和布局行为的页面。
- 子元素需要简单地从上到下排列。
- 需要通过 `spacing` 统一控制元素间距。
- 需要通过 `alignment` 控制横向对齐。

对于跨平台业务界面，优先评估原文提到的通用 `Column`。

一个典型实现可以写成：

```tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';

export function ProfileSummary() {
  return (
    <Host matchContents>
      <VStack spacing={8} alignment="leading">
        <Text>用户名</Text>
        <Text>个人简介</Text>
        <Text>所在城市</Text>
      </VStack>
    </Host>
  );
}
```

这里的布局意图是：

- 三段内容纵向排列。
- 相邻内容保持 `8` 的间距。
- 内容在水平方向的起始侧对齐。

**基于经验建议：**在正式项目中，应将平台专属 SwiftUI 组件集中在平台组件或原生 UI 层，避免业务代码到处直接依赖 `@expo/ui/swift-ui`。这有助于控制 iOS 专属实现的影响范围，但该代码组织方式并非当前文档的明确要求。

## 文档明确内容与推导内容

### 原文明确说明

- `VStack` 用于垂直排列子元素。
- 其 API 与 Apple 官方 SwiftUI `VStack` 相匹配。
- 组件来自 `@expo/ui/swift-ui`。
- `alignment` 控制子元素的水平对齐。
- 对齐值包括 `leading`、`center` 和 `trailing`。
- `spacing` 是可选数字，用于设置子元素间距。
- `children` 类型为 `React.ReactNode`。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 已有 React Native 工程需要先安装 Expo。
- 跨平台场景可以使用通用 `Column`。
- 当前页面面向下一个 SDK 版本，稳定文档对应 SDK 56。

### 基于文档内容推导

- `VStack` 在布局意图上近似 Web 的纵向 Flexbox，但底层不是 CSS。
- 跨平台公共组件直接依赖 `VStack` 会引入平台耦合。
- 未发布版本中的 API 在项目当前 SDK 中可能不可用或可能发生变化。
- `leading` 和 `trailing` 应理解为布局起始侧与结束侧，而不是硬编码的左右方向。

## 当前文档未涉及的内容

- `VStack` 的默认 `spacing`。
- `alignment` 的默认值。
- 尺寸与间距数值的具体单位。
- Android 和 Web 上直接使用该组件的行为。
- `Host matchContents` 的完整语义。
- `CommonViewModifierProps` 的完整属性列表。
- 原生构建、Xcode、CocoaPods 和签名配置。
- 性能特征、无障碍行为及测试方式。
- 动态增删子元素、滚动和超长内容处理。
- `VStack` 与 React Native `View` 的详细互操作规则。

## 总结

`VStack` 是 Expo UI 对 SwiftUI 垂直栈布局的 React 封装。它通过 `children` 接收内容，通过 `spacing` 设置元素间距，并通过 `alignment` 控制水平方向对齐。

使用时最重要的边界是：它属于 SwiftUI 平台专属 API，目前文档明确支持 iOS 和 tvOS，而不是通用的 Web、Android 和 iOS 布局组件。跨平台项目应优先考虑原文推荐的通用 `Column`，同时确保查阅的文档版本与项目 Expo SDK 版本一致。

---

## 文档导航

- **上一页**：[usenativestate](./114__usenativestate.md)
- **下一页**：[ui](./116__ui.md)
