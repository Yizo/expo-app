# Row：在 Android 中水平排列子组件

`Row` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Android 原生界面中沿水平方向排列多个子组件。

> 本页属于**下一个 Expo SDK 版本**的文档，并非当前稳定版本。文档指出，当前最新稳定版本为 **SDK 56**。  
> 本组件仅支持 **Android**，并已包含在 **Expo Go** 中。  
> 文档修改日期：2026 年 5 月 19 日。

## 文档解决的问题

这篇文档主要说明：

- 如何安装提供 `Row` 的 `@expo/ui` 包。
- 如何通过 React JSX 使用 Android Jetpack Compose 的 `Row`。
- 如何控制子组件的水平分布和垂直对齐。
- `Row` 当前提供了哪些属性。
- 组件的平台限制以及版本状态。

它适合需要在 Expo 或 React Native 项目中构建 **Android 原生 Compose 横向布局**的场景，例如：

- 水平排列操作按钮。
- 水平展示标签或状态信息。
- 构建横向工具栏。
- 将多个等距项目放在同一行中。

如果项目需要同时支持 Android 和 iOS，文档建议使用跨平台的 universal `Row`，由它根据运行平台渲染对应的原生组件。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。可以将它类比为 Android 原生开发中的 React：

- React 使用组件和 JSX 描述 Web UI。
- Jetpack Compose 使用可组合函数描述 Android 原生 UI。
- Expo UI 在两者之间提供了一层 React 接口，使开发者可以通过 JSX 使用部分 Compose 组件。

本页的 `Row` 与 Jetpack Compose 官方 `Row` API 对应。

### `Row` 与 Web Flexbox

对于 React Web 开发者，可以暂时把 `Row` 理解成接近以下 CSS 布局：

```css
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 60px;
}
```

但这只是帮助理解布局方向的类比。`Row` 实际运行在 Android Jetpack Compose 布局系统中，并不是 DOM 元素，也不接受普通 CSS。

### `Host`

示例将 `Row` 放在 `Host` 中：

```tsx
<Host matchContents>
  {/* Compose 组件 */}
</Host>
```

从示例可以明确看出，`Host` 是这些 Jetpack Compose 组件的宿主容器。

当前文档只展示了 `Host` 的使用方式，没有进一步解释其生命周期、布局机制以及 `matchContents` 的完整行为。需要了解这些内容时，应查阅 `Host` 的独立文档。

### Modifiers

Jetpack Compose 使用 modifier 调整组件的尺寸、布局和其他表现。示例中的：

```tsx
modifiers={[fillMaxWidth(), height(60)]}
```

可以理解为向组件依次应用两个布局修饰：

- `fillMaxWidth()`：填满可用宽度。
- `height(60)`：设置高度为 `60`。

它们从专门的 modifiers 模块导入：

```tsx
import {
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';
```

Modifiers 不是 CSS，也不是 React Native 的 `style` 对象。

## 安装

根据项目使用的包管理器选择一条命令：

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

`expo install` 不只是普通的包安装命令。它通常会根据项目使用的 Expo SDK 选择兼容的依赖版本，因此不应随意改成直接安装任意版本。

如果是在现有的 React Native 原生项目中使用，而项目原本不是 Expo 项目，必须先按照 Expo 的说明安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

当前文档未涉及：

- iOS 原生工程配置。
- Android Gradle 配置。
- 是否需要重新生成或重新编译原生工程。
- 具体版本兼容范围。
- 新架构或旧架构要求。

## 基本用法

```tsx
import { Host, Row, Text } from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RowExample() {
  return (
    <Host matchContents>
      <Row
        horizontalArrangement="spaceEvenly"
        verticalAlignment="center"
        modifiers={[fillMaxWidth(), height(60)]}
      >
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Row>
    </Host>
  );
}
```

这段代码的布局过程如下：

1. `Host` 提供承载 Jetpack Compose 内容的环境。
2. `Row` 创建一个水平方向的布局容器。
3. `fillMaxWidth()` 让 `Row` 占满可用宽度。
4. `height(60)` 为 `Row` 设置固定高度。
5. 三个 `Text` 按水平方向排列。
6. `horizontalArrangement="spaceEvenly"` 让水平方向的可用空间均匀分布。
7. `verticalAlignment="center"` 让子组件在 `Row` 的垂直方向居中。

这里需要注意：只有当 `Row` 获得了足够的可用宽度时，水平空间分布才会有明显效果。示例通过 `fillMaxWidth()` 提供了这样的空间。

这一点属于**基于文档内容推导**：如果容器宽度仅包裹内容，就不会存在大量剩余宽度供 `spaceEvenly` 分配。

## API 与属性

组件的导入方式为：

```tsx
import { Row } from '@expo/ui/jetpack-compose';
```

`Row` 的类型是接收 `RowProps` 的 React 元素，仅支持 Android。

### `children`

```ts
children?: React.ReactNode
```

需要水平排列的子组件，可选。

它与 React Web 中容器组件的 `children` 概念相同：

```tsx
<Row>
  <Text>第一个项目</Text>
  <Text>第二个项目</Text>
</Row>
```

当前文档没有说明：

- 子组件数量限制。
- 是否只接受 Expo UI 组件。
- 子组件超出可用宽度时如何处理。
- 是否支持换行或滚动。
- 是否支持类似 CSS `flex-grow` 的权重分配。

因此，不能根据本页假设 `Row` 会自动换行或提供横向滚动。

### `horizontalArrangement`

```ts
horizontalArrangement?: HorizontalArrangement
```

控制子组件在主轴，也就是水平方向上的排列和空间分配。

示例值为：

```tsx
horizontalArrangement="spaceEvenly"
```

对于 React Web 开发者，其作用可类比为横向 Flexbox 的 `justify-content`。

当前文档没有列出 `HorizontalArrangement` 支持的全部值，除示例中的 `spaceEvenly` 外，不应仅根据本页假设其他字符串值一定可用。

### `verticalAlignment`

```ts
verticalAlignment?: VerticalAlignment
```

控制子组件在垂直方向上的对齐方式。

示例值为：

```tsx
verticalAlignment="center"
```

可以类比为横向 Flexbox 中的 `align-items: center`。

当前文档没有列出 `VerticalAlignment` 支持的全部值。

### `horizontalAlignment`

```ts
horizontalAlignment?: HorizontalAlignment
```

文档将其描述为“子组件的水平对齐方式”。

不过，本页没有：

- 展示该属性的使用示例。
- 解释它与 `horizontalArrangement` 的区别。
- 列出 `HorizontalAlignment` 的合法取值。
- 说明它在 `Row` 布局中的具体生效方式。

因此，仅凭当前文档无法准确说明该属性应在什么情况下使用。

### `verticalArrangement`

```ts
verticalArrangement?: VerticalArrangement
```

文档将其描述为“子组件的垂直排列方式”。

本页同样没有说明：

- 它与 `verticalAlignment` 的区别。
- 它在水平布局中的具体作用。
- `VerticalArrangement` 支持哪些值。
- 对应的使用场景。

在实际使用前，应通过类型定义或相关 API 文档确认，避免按照 Web Flexbox 经验直接猜测。

### 继承属性

`RowProps` 还继承了：

```text
PrimitiveBaseProps
```

示例中的 `modifiers` 应来自这组基础属性。

当前文档没有展开 `PrimitiveBaseProps` 的完整字段，因此无法仅根据本页列出全部通用属性。

## 平台和版本限制

### 仅支持 Android

本页的 Jetpack Compose `Row` 明确只支持 Android。

这意味着它不是一个普通的跨平台 React Native 布局组件。不要默认同一段导入代码可以直接运行在 iOS 或 Web 上。

需要跨平台布局时，应考虑文档中提到的 universal `Row`：

```text
@expo/ui` 的 universal Row
```

文档明确说明，universal `Row` 会根据平台渲染适当的原生组件。

### 包含在 Expo Go 中

文档标记该组件已包含在 Expo Go 中，意味着可以在 Expo Go 支持的环境中使用和预览。

但当前文档没有说明 Expo Go 与开发构建之间的具体差异，也没有承诺所有相关原生能力都无需自定义构建。

### 当前页面不是稳定版文档

页面属于尚未正式发布的下一个 SDK 版本。API 在进入稳定版本前可能与 SDK 56 的对应页面存在差异。

在生产项目中，应查看与项目实际 Expo SDK 版本一致的文档，而不是直接照搬 unversioned 页面。

## React Web 开发者容易误解的地方

### `Row` 不是 HTML 容器

它不会渲染成 `<div>`，也不存在 DOM、CSS 选择器或浏览器布局引擎。

因此不要按下面的方式理解或使用：

```tsx
// 当前文档没有说明支持这种 Web 写法
<Row className="items-center" style={{ display: 'flex' }}>
  ...
</Row>
```

本页明确展示的布局方式是 `modifiers` 以及专用的 arrangement、alignment 属性。

### `horizontalArrangement` 不等于完整的 CSS Flexbox

它可以帮助理解为 `justify-content`，但文档没有说明 `Row` 完整支持 Flexbox 的所有行为，例如：

- `flex-wrap`
- `gap`
- `flex-grow`
- `flex-shrink`
- `overflow`
- 响应式媒体查询

这些能力在当前文档中均未涉及。

### React Native 也不等于 Expo

现有 React Native 项目不会天然具备 Expo Modules 环境。文档明确要求：在现有 React Native 应用中安装 `@expo/ui` 前，需要先安装并配置 `expo`。

### 不要混淆两个 `Row`

本页介绍的是：

```tsx
import { Row } from '@expo/ui/jetpack-compose';
```

它是 Android Jetpack Compose 版本。

跨平台场景应查看 universal `Row`。两者名称相同，但导入位置和平台目标不同。

## 实际开发中的使用方式

### Android 专属界面

当某个页面或组件明确只服务于 Android，并且需要直接使用 Jetpack Compose 风格的原生 UI 时，可以使用本页的 `Row`。

```tsx
<Row
  horizontalArrangement="spaceEvenly"
  verticalAlignment="center"
  modifiers={[fillMaxWidth(), height(60)]}
>
  <Text>取消</Text>
  <Text>确认</Text>
</Row>
```

### 跨平台业务界面

如果同一功能需要同时运行在 Android 和 iOS，不应直接把 Android 专属 `Row` 当成通用布局组件。优先评估 universal `Row`，或者在项目中明确设置平台分支。

这是**基于文档内容推导**：既然 Jetpack Compose `Row` 明确只支持 Android，而 universal `Row` 会选择相应平台的原生组件，那么跨平台业务代码使用后者更符合文档给出的方向。

### 使用 TypeScript 确认合法值

由于本页没有列出各类 alignment 和 arrangement 类型的完整取值，开发时应依赖编辑器的 TypeScript 自动补全，或继续查看相应类型/API 文档。

这是**基于经验建议**，用于避免传入未经文档确认的字符串。

## 文档明确内容与推导内容

### 文档明确说明

- `Row` 来自 `@expo/ui`。
- 它对应 Jetpack Compose 官方 `Row` API。
- 它用于水平排列子组件。
- 可以使用 `horizontalArrangement` 和 `verticalAlignment` 控制间距与对齐。
- 组件仅支持 Android。
- 组件包含在 Expo Go 中。
- 现有 React Native 项目需要先安装并配置 `expo`。
- 跨平台场景可以查看 universal `Row`。
- `RowProps` 包含四个可选布局属性，并继承 `PrimitiveBaseProps`。
- 当前页面对应下一个 SDK 版本，稳定文档指向 SDK 56。

### 基于文档内容推导

- `fillMaxWidth()` 为 `spaceEvenly` 提供了可供分配的剩余空间。
- Android 与 iOS 共用的业务组件更适合优先评估 universal `Row`。
- `horizontalArrangement` 和 `verticalAlignment` 可以分别类比横向 Flexbox 的 `justify-content` 与 `align-items`，但两套布局系统并不完全等价。

## 总结

`Row` 是 Expo UI 暴露给 React 的 Android Jetpack Compose 水平布局组件。其基本用法是把子组件放入 `Row`，再通过 `horizontalArrangement`、`verticalAlignment` 和 `modifiers` 控制排列、对齐与尺寸。

对 React Web 开发者而言，Flexbox 可以作为入门类比，但不能将 CSS、DOM 或完整的 Flexbox 行为直接套用到该组件上。实际开发时尤其需要注意其 **Android 专属**和**下一版本文档**状态，并对本页未展开的属性取值、基础属性和溢出行为继续查阅对应 API 文档。

---

## 文档导航

- **上一页**：[rnhostview](./58__rnhostview.md)
- **下一页**：[searchbar](./60__searchbar.md)
