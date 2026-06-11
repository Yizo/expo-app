# Column：在 Android 中纵向排列子组件

`Column` 是 `@expo/ui` 提供的 Jetpack Compose 布局组件，用于在 Android 原生界面中从上到下排列子组件。

> 本文档对应的平台为 **Android**，并且该组件已包含在 **Expo Go** 中。它不是 React Web 的 DOM 组件，也不是跨平台版本的 `Column`。

## 文档解决的问题

当你需要在 Expo / React Native 项目的 Android 界面中纵向排列多个原生 UI 元素时，可以使用 `Column`，并通过属性控制：

- 子组件之间的纵向间距与排列方式。
- 子组件在水平方向上的对齐方式。
- 组件自身的宽度、内边距等布局修饰。

它在布局意图上接近 Web 中的：

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
}
```

但这只是帮助 React Web 开发者理解的类比。`Column` 实际渲染的是 Android Jetpack Compose 原生组件，不会生成 DOM，也不使用 CSS。

## 使用场景

适合：

- 仅面向 Android 的原生 UI。
- 需要从上到下排列文本、按钮或其他 Compose 子组件。
- 需要使用 Jetpack Compose 的布局和修饰器能力。
- 在 Expo Go 中测试相关 Android 界面。

如果需要同一套代码适配多个平台，原文档建议使用通用版本的 `Column`。通用版本会针对不同平台渲染相应的原生组件：

```text
/versions/latest/sdk/ui/universal/column
```

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的原生声明式 UI 工具包。它与 React 都采用“根据状态声明 UI”的思路，但运行环境不同：

- React Web 最终操作浏览器 DOM。
- Jetpack Compose 最终创建 Android 原生界面。
- 本文中的 `Column` 是对 Jetpack Compose `Column` API 的 Expo UI 封装。

原文明确说明，Expo UI 的 `Column` 与官方 Jetpack Compose `Column` API 对应。

### Expo UI

`@expo/ui` 是本文使用的包。示例分别从它的 Jetpack Compose入口和 modifiers 入口导入组件与布局修饰器：

```tsx
import { Host, Column, Text } from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  paddingAll,
} from '@expo/ui/jetpack-compose/modifiers';
```

### Modifier

Modifier 可以理解为 Jetpack Compose 中用于改变尺寸、间距等布局行为的工具。

它与 CSS 的职责有一定相似性，但并不是 CSS。本文示例使用了：

- `fillMaxWidth()`：让组件填充可用的最大宽度。
- `paddingAll(16)`：为所有方向设置内边距。

以上作用可由函数名称和示例推导，但当前文档没有单独给出这两个 modifier 的完整 API 定义。

## 安装

根据项目使用的包管理器执行对应命令。

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

这些命令都会安装 `@expo/ui`。与普通的 `npm install` 相比，`expo install` 通常用于选择与当前 Expo SDK 兼容的依赖版本。

> **基于经验建议：** 在 Expo 项目中应优先使用文档给出的 `expo install` 命令，减少依赖版本与 Expo SDK 不匹配的风险。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，也就是 Expo 文档所称的 existing React Native app / bare app，必须先在项目中安装并配置 `expo`，才能使用 Expo Modules。

这与 React Web 中单纯安装一个 npm UI 包不同。`@expo/ui` 涉及原生平台代码，需要项目具备 Expo Modules 的运行环境。

当前文档没有提供安装 Expo Modules 的具体命令，只给出了对应文档链接：

```text
/bare/installing-expo-modules
```

## 基本用法

```tsx
import { Host, Column, Text } from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  paddingAll,
} from '@expo/ui/jetpack-compose/modifiers';

export default function ColumnExample() {
  return (
    <Host matchContents>
      <Column
        verticalArrangement={{ spacedBy: 8 }}
        horizontalAlignment="center"
        modifiers={[fillMaxWidth(), paddingAll(16)]}
      >
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </Column>
    </Host>
  );
}
```

最终的排列方向为：

```text
First
Second
Third
```

三个 `Text` 按 JSX 中的声明顺序从上到下排列。

### 示例中的布局配置

#### `verticalArrangement={{ spacedBy: 8 }}`

控制子组件在纵向主轴上的排列方式。

示例通过 `spacedBy: 8` 在相邻子组件之间设置间距。它在效果上接近 Web Flexbox 的：

```css
gap: 8px;
```

文档没有说明该数值的具体单位，也没有列出 `VerticalArrangement` 支持的全部配置。因此不能仅根据当前页面推断它支持哪些其他值。

#### `horizontalAlignment="center"`

控制每个子组件在水平方向上的对齐方式。

示例使用 `"center"`，其布局意图接近：

```css
align-items: center;
```

这里控制的是 `Column` 内部子组件的横向位置，不等同于把 `Column` 自身在父容器中居中。

#### `modifiers={[fillMaxWidth(), paddingAll(16)]}`

`modifiers` 来自继承的 `PrimitiveBaseProps`，示例向它传入一个 modifier 数组：

1. `fillMaxWidth()` 让 `Column` 使用可用的最大宽度。
2. `paddingAll(16)` 设置四周内边距。

modifier 的顺序是否会影响最终布局，当前文档没有说明。

#### `Host matchContents`

示例将 `Column` 放在 `Host` 内，并设置了 `matchContents`。

当前文档没有解释：

- `Host` 的完整职责。
- 是否所有场景都必须使用 `Host`。
- `matchContents` 的精确行为。
- 不使用 `matchContents` 会产生什么结果。

因此，学习当前示例时可以先保留这一结构，但不能仅凭本文对其行为作进一步推断。

## API

导入方式：

```tsx
import { Column } from '@expo/ui/jetpack-compose';
```

组件类型：

```tsx
React.Element<ColumnProps>
```

支持平台：

```text
Android
```

### `ColumnProps`

#### `children`

```ts
children?: React.ReactNode
```

传入需要纵向排列的子组件。

这与 React Web 组件的 `children` 概念一致，可以是单个元素、多个元素或其他合法的 React 节点。

#### `horizontalAlignment`

```ts
horizontalAlignment?: HorizontalAlignment
```

设置子组件的水平对齐方式。

文档示例使用：

```tsx
horizontalAlignment="center"
```

当前页面没有列出 `HorizontalAlignment` 的全部可选值。

#### `verticalArrangement`

```ts
verticalArrangement?: VerticalArrangement
```

设置子组件在纵向上的排列方式。

文档示例使用：

```tsx
verticalArrangement={{ spacedBy: 8 }}
```

当前页面没有提供 `VerticalArrangement` 的完整类型结构或所有配置方式。

#### `horizontalArrangement`

```ts
horizontalArrangement?: HorizontalArrangement
```

可选属性，类型为 `HorizontalArrangement`。

当前文档只列出了属性名称和类型，没有解释它在 `Column` 中的具体行为，也没有提供示例。不要仅依据名称自行假设其效果。

#### `verticalAlignment`

```ts
verticalAlignment?: VerticalAlignment
```

可选属性，类型为 `VerticalAlignment`。

当前文档同样没有解释其具体行为或适用场景。

#### 继承属性

`ColumnProps` 继承：

```text
PrimitiveBaseProps
```

示例中的 `modifiers` 应来自该基础属性类型，但当前页面没有列出 `PrimitiveBaseProps` 的完整属性集合。

## React Web 开发者容易误解的地方

### 1. 它不是普通的跨平台 React Native 布局

本文导入路径明确包含：

```text
@expo/ui/jetpack-compose
```

这表示使用的是 Jetpack Compose 实现，当前页面也明确标注仅支持 Android。

如果业务同时支持 iOS，不应默认这段代码可以直接在 iOS 上运行。原文建议跨平台需求使用 universal `Column`。

### 2. 不要把 Modifier 当成 CSS

下面的代码不是 `style`：

```tsx
modifiers={[fillMaxWidth(), paddingAll(16)]}
```

它调用的是 Jetpack Compose modifier 封装。不能直接把 Web CSS 属性或 React Native `StyleSheet` 对象放进该数组。

### 3. 主轴和交叉轴取决于排列方向

`Column` 的主排列方向是纵向：

- `verticalArrangement` 负责纵向排列和间距。
- `horizontalAlignment` 负责横向对齐。

可以用 `flex-direction: column` 帮助理解，但不能认为 Compose 的全部布局规则都与 CSS Flexbox 相同。

### 4. 子组件本身也来自原生 UI 体系

示例使用的是：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

它不是浏览器中的 `<span>` 或 `<p>`。不要将 DOM 元素直接套用到这段代码中。

### 5. Expo Go 支持不等于跨平台支持

“Included in Expo Go”表示该组件所需能力已包含在 Expo Go 中，方便运行和测试；它并不表示组件同时支持 Android、iOS 和 Web。

当前页面明确标注的支持平台只有 Android。

## 注意事项与限制

- `Column` 当前仅支持 Android。
- 跨平台场景应考虑 universal `Column`。
- 已有 React Native 原生项目需要先安装并配置 `expo`。
- 当前页面没有列出四种 Alignment / Arrangement 类型的完整可选值。
- 当前页面没有解释 `Host`、`matchContents` 和 `PrimitiveBaseProps` 的完整行为。
- 当前页面没有提供 Android 原生工程文件或目录的修改说明。
- 当前页面没有说明是否需要重新生成原生工程或重新构建应用。
- 当前页面没有提供 iOS 或 Web 的降级行为。
- 当前页面没有列出版本兼容矩阵、性能限制或已知问题。
- 当前页面没有包含警告级别的提示。

## 实际开发中的使用方式

一个直接的应用场景是纵向排列标题、说明和操作项：

```tsx
<Column
  verticalArrangement={{ spacedBy: 8 }}
  horizontalAlignment="center"
  modifiers={[fillMaxWidth(), paddingAll(16)]}
>
  <Text>标题</Text>
  <Text>说明内容</Text>
  <Text>操作提示</Text>
</Column>
```

**基于文档内容推导：**

- 当页面元素需要从上到下排列时，可以优先考虑 `Column`。
- 需要统一控制子元素间距时，可以使用 `verticalArrangement`，避免分别给每个子元素设置间距。
- `fillMaxWidth()` 为水平居中提供了更明确的可用布局空间；否则 `Column` 的宽度可能受自身内容或父布局约束。具体尺寸计算规则需要查阅对应 API 文档。
- 如果项目存在 iOS 版本，采用 Android 专用导入路径前，应先确认是否会拆分平台代码；否则应考虑文档推荐的 universal 版本。

**基于经验建议：**

- 将 Android 专用实现放在平台专用文件中，例如 `Component.android.tsx`，避免其他平台意外加载 Android API。
- 不熟悉 modifier 时，应查阅对应 modifier 的 API，而不要根据 CSS 经验猜测组合顺序和测量行为。
- 使用 TypeScript 检查 `HorizontalAlignment`、`VerticalArrangement` 等类型的合法值，避免手写未经文档确认的字符串或对象。

## 文档明确内容与推导内容

### 原文档明确说明

- `Column` 用于纵向排列子组件。
- API 与官方 Jetpack Compose `Column` 对应。
- 可通过 `verticalArrangement` 和 `horizontalAlignment` 控制间距与对齐。
- 组件仅支持 Android。
- 组件包含在 Expo Go 中。
- 安装包名为 `@expo/ui`。
- 已有 React Native 项目需要安装 `expo`。
- 跨平台需求应使用 universal `Column`。
- API 包含 `children`、四种 Alignment / Arrangement 属性，并继承 `PrimitiveBaseProps`。

### 基于文档内容推导

- 可以使用 CSS Flexbox 的纵向布局帮助理解 `Column`，但二者不是同一套实现。
- 示例中的 `spacedBy: 8` 在视觉意图上类似 Web 的 `gap`。
- Android 专用导入需要在多平台项目中进行平台边界管理。
- modifier、对齐和排列类型的完整能力需要查阅其他 API 页面或类型定义。

## 总结

`Column` 是 Expo UI 对 Android Jetpack Compose 纵向布局组件的封装。其最核心的使用方式是：

- 用 `children` 声明纵向排列的内容。
- 用 `verticalArrangement` 控制纵向间距和排列。
- 用 `horizontalAlignment` 控制横向对齐。
- 用 `modifiers` 调整宽度和内边距等布局特征。

对 React Web 开发者而言，可以借助 `flex-direction: column`、`gap` 和 `align-items` 理解其布局意图，但必须记住：它是 Android 原生 Jetpack Compose UI，不是 DOM、CSS 或普通的跨平台 React Native View。

---

## 文档导航

- **上一页**：[chip](./33__chip.md)
- **下一页**：[datetimepicker](./35__datetimepicker.md)
