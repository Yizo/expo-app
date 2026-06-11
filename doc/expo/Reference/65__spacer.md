# Spacer：在 Android Jetpack Compose 布局中添加间距

`Spacer` 是 `@expo/ui` 提供的 Android 布局组件，用于在元素之间创建固定间距或自动扩展的剩余空间。它对应原生 Jetpack Compose 的 `Spacer` API。

> 本页属于下一个 Expo SDK 版本的未发布文档。文档明确指出，当前最新稳定版本是 **SDK 56**，实际项目应优先核对对应的稳定版文档。

## 文档解决的问题

在 React Web 中，开发者通常使用 `gap`、`margin` 或 Flexbox 将元素分隔开。在 Expo UI 的 Jetpack Compose 布局中，`Spacer` 提供了另一种方式：在组件树中插入一个专门占据空间的元素。

它主要适合两类场景：

- 使用 `weight()` 占据 `Row` 或 `Column` 中的剩余空间。
- 使用 `height()` 或 `width()` 创建固定尺寸的间距。

例如，将两个元素分别推到一行的左右两端，或者在两个纵向元素之间留出 `24dp` 的距离。

## 阅读前需要理解的概念

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的 UI 包。本文介绍的是它的 Jetpack Compose 接口：

```tsx
import { Spacer } from '@expo/ui/jetpack-compose';
```

Jetpack Compose 是 Android 的原生声明式 UI 工具包。它和 React 都采用声明式组件结构，但 Compose 组件最终属于 Android 原生 UI，而不是浏览器 DOM。

本文中的 `Spacer`：

- 只支持 Android。
- 已包含在 Expo Go 中。
- 与 Android 官方 Jetpack Compose `Spacer` API 对应。
- 不是 HTML 元素，也不会生成浏览器中的 `<div>`。

### `Row` 和 `Column`

文档示例使用了两种布局容器：

- `Row`：子元素沿水平方向排列，概念上接近 Web 中的 `display: flex; flex-direction: row`。
- `Column`：子元素沿垂直方向排列，接近 `flex-direction: column`。

`Spacer` 会作为一个真实的布局子项参与排列。

### Modifier

Jetpack Compose 使用 Modifier 描述组件的尺寸和布局行为。Expo UI 将其暴露为 `modifiers` 属性：

```tsx
<Spacer modifiers={[weight(1)]} />
```

可以将它近似理解为 React Web 中传入一组布局样式或工具函数，但它并不是 CSS，也不是 React Native 的 `style` 对象。

`SpacerProps` 当前只记录了一个可选属性：

| 属性 | 类型 | 是否必填 | 平台 | 作用 |
| --- | --- | --- | --- | --- |
| `modifiers` | `ExpoModifier[]` | 否 | Android | 设置 Spacer 的尺寸或布局行为 |

## 安装

使用与项目包管理器对应的命令安装 `@expo/ui`：

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

`expo install` 与直接执行 `npm install` 的关注点不同：它会根据当前 Expo 项目环境选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，而不是标准 Expo 项目，文档要求先安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

本文没有涉及：

- iOS 原生工程配置。
- Android Gradle 配置。
- Expo Modules 的具体安装步骤。
- `@expo/ui` 不同版本的兼容矩阵。

这些内容需要参考对应链接中的专项文档，不能仅根据本页确定。

## 使用方式

### 使用 `weight()` 填充剩余空间

```tsx
import { Host, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';

export default function SpacerWeightExample() {
  return (
    <Host matchContents>
      <Row modifiers={[fillMaxWidth()]}>
        <Text>Left</Text>
        <Spacer modifiers={[weight(1)]} />
        <Text>Right</Text>
      </Row>
    </Host>
  );
}
```

布局过程可以理解为：

1. `Row` 通过 `fillMaxWidth()` 占满可用宽度。
2. 左右两个 `Text` 先占据自身需要的宽度。
3. 中间的 `Spacer` 通过 `weight(1)` 获得剩余空间。
4. 最终两个文本被分别推向左右两侧。

其 Web 布局效果近似于：

```css
.row {
  display: flex;
  width: 100%;
}

.spacer {
  flex: 1;
}
```

`weight()` 表示按比例分配可用空间。文档明确说明它可以在 `Row` 或 `Column` 中使用，但没有进一步介绍多个不同权重之间的计算规则。

`Host` 是示例中承载 Jetpack Compose 内容的组件，`matchContents` 用于让宿主尺寸匹配其内容。当前 Spacer 文档没有详细解释 `Host` 的完整行为和限制。

### 使用固定尺寸

```tsx
import { Host, Column, Spacer, Text } from '@expo/ui/jetpack-compose';
import { height } from '@expo/ui/jetpack-compose/modifiers';

export default function SpacerFixedSizeExample() {
  return (
    <Host matchContents>
      <Column>
        <Text>Above</Text>
        <Spacer modifiers={[height(24)]} />
        <Text>Below (24dp gap)</Text>
      </Column>
    </Host>
  );
}
```

这里的布局过程是：

1. `Column` 将子元素从上到下排列。
2. `Spacer` 位于两个文本组件之间。
3. `height(24)` 使它占据 `24dp` 的垂直空间。

在 `Row` 中创建水平固定间距时，可以使用文档提到的 `width` Modifier。原文只展示了 `height(24)` 的代码，没有提供 `width()` 示例。

### `dp` 不是 CSS 像素

示例中的 `24` 表示 `24dp`。`dp` 是 Android 的密度无关像素，会根据设备屏幕密度转换为实际物理像素。

因此，不应简单地将 `height(24)` 理解成浏览器中的 `height: 24px`。两者数值可能相同，但对应的是不同平台的尺寸体系。

## API 说明

导入组件：

```tsx
import { Spacer } from '@expo/ui/jetpack-compose';
```

组件类型：

```tsx
React.Element<SpacerProps>
```

文档将 `Spacer` 描述为一个填充可用空间的组件，并推荐配合 `weight()` 在 `Row` 或 `Column` 中创建弹性间距。

最小示例：

```tsx
<Row>
  <Text>Left</Text>
  <Spacer modifiers={[weight(1)]} />
  <Text>Right</Text>
</Row>
```

注意，实际代码还需要从 Modifier 模块导入 `weight`：

```tsx
import { weight } from '@expo/ui/jetpack-compose/modifiers';
```

## 平台范围与版本限制

### 仅支持 Android

本文介绍的导入路径是：

```tsx
@expo/ui/jetpack-compose
```

该组件明确只支持 Android。不能据此认为同一代码可以直接运行在 iOS 或 Web 上。

需要跨平台使用时，文档建议改用通用版本：

```text
@expo/ui 的 universal Spacer
```

通用版本会根据平台渲染相应的原生组件。本页没有展示其具体导入方式或 API，因此跨平台实现应继续查看 universal Spacer 文档。

### 当前页面不是稳定版文档

页面路径属于 `unversioned`，并明确标注这是下一个 SDK 版本的文档。开发时需要区分：

- `unversioned`：面向下一个 SDK 版本，API 可能尚未进入当前项目使用的稳定版本。
- `latest`：当前最新稳定 SDK 的文档；本页标注为 SDK 56。
- 项目实际使用的 SDK：最终决定哪些 API 可用。

不要仅因为 Expo Go 包含该组件，就假定任意 Expo SDK 项目都能使用本文 API；仍需确认项目版本及对应文档。

## React Web 开发者容易误解的地方

### `Spacer` 不是 CSS `gap`

CSS `gap` 是父容器的属性，不会在 React 组件树中增加子节点；`Spacer` 则是显式插入的布局组件。

因此，删除、移动或条件渲染 `Spacer` 都会直接改变子元素之间的空间。

### `modifiers` 不是 `style`

本文 API 使用：

```tsx
<Spacer modifiers={[height(24)]} />
```

而不是常见的 React Native 写法：

```tsx
<Spacer style={{ height: 24 }} />
```

Modifier 是由函数创建并放入数组的布局描述。当前文档没有说明 Modifier 的组合顺序、冲突处理或所有可用类型。

### 弹性 Spacer 需要可分配的空间

**基于文档内容推导：** `weight(1)` 只有在父级布局存在剩余空间时，才能产生明显的扩展效果。示例中的 `Row` 使用 `fillMaxWidth()`，正是为了获得一段明确的可用宽度。

如果父容器只按内容收缩，中间可能没有足够的剩余空间可供 `Spacer` 填充。

### 不要默认支持 iOS

即使组件代码使用 TSX 编写，它调用的仍然是 Android Jetpack Compose UI。TSX 语法相同不代表底层平台能力相同。

跨平台页面应评估使用 universal Spacer，而不是直接在共享代码中引用 `@expo/ui/jetpack-compose`。

## 实际开发中的选择

可以按照布局目标选择 Modifier：

| 布局目标 | 推荐方式 |
| --- | --- |
| 将左右元素推向容器两端 | 在 `Row` 中使用 `Spacer` + `weight(1)` |
| 将上下元素推开并占据剩余高度 | 在 `Column` 中使用 `Spacer` + `weight(1)` |
| 创建固定垂直间距 | 使用 `height()` |
| 创建固定水平间距 | 使用 `width()` |
| 编写 Android 专用 Compose UI | 使用本文的 Jetpack Compose Spacer |
| 编写共享的跨平台 UI | 查看 universal Spacer |

**基于经验建议：** 对多个相邻元素统一设置间距时，应先检查对应布局组件是否提供更直接的间距能力；`Spacer` 更适合需要明确占位或填充剩余空间的场景。该建议不是当前文档明确规定。

## 文档信息边界

文档明确说明了：

- `Spacer` 用于创建弹性或固定尺寸的空间。
- 组件对应官方 Jetpack Compose `Spacer` API。
- `weight()` 可用于 `Row` 和 `Column` 中的弹性空间。
- `height` 或 `width` Modifier 可创建固定尺寸。
- `modifiers` 是可选的 `ExpoModifier[]`。
- 该 Jetpack Compose 版本只支持 Android，并包含在 Expo Go 中。
- 已有 React Native 项目需要安装 `expo`。
- 跨平台场景可查看 universal Spacer。

当前文档未涉及：

- `width()` 的完整代码示例。
- 多个 Spacer 使用不同 `weight` 时的详细计算规则。
- Modifier 的执行顺序和冲突规则。
- `Host` 与 `matchContents` 的完整 API。
- 无障碍、性能及测试相关说明。
- iOS 和 Web 的具体实现。
- 原生 Android 工程的构建配置。
- 组件在 Expo Go 与开发构建中的行为差异。

## 总结

`Spacer` 是 Android Jetpack Compose 布局中的显式占位组件：

- 使用 `weight()` 分配剩余空间。
- 使用 `height()` 或 `width()` 创建固定间距。
- 通过 `modifiers` 配置，而不是通过 CSS 或 React Native `style`。
- Jetpack Compose 版本只支持 Android；共享代码应评估 universal Spacer。
- 本页属于下一版本文档，使用前需要对照项目 SDK 的稳定版 API。

---

## 文档导航

- **上一页**：[snackbar](./64__snackbar.md)
- **下一页**：[surface](./66__surface.md)
