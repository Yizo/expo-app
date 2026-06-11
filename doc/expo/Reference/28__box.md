# Box：在 Android 中堆叠子元素

`Box` 是 `@expo/ui` 提供的 Jetpack Compose 布局组件，用于将多个子元素堆叠在同一块区域内，并统一控制这些元素在容器中的对齐位置。

> 平台支持：Android  
> Expo Go：已包含  
> 所属包：`@expo/ui`

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`
- 如何从 Jetpack Compose 入口导入 `Box`
- 如何使用 `Box` 堆叠子元素
- 如何通过 `contentAlignment` 控制子元素的位置
- `Box` 当前公开了哪些属性

它适合需要在 Android 界面中实现以下布局的场景：

- 将文字、图标等元素放在容器中央
- 让多个子元素占据同一区域并相互覆盖
- 构建背景加前景内容的组合布局
- 对一组堆叠内容应用统一的对齐方式

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式 UI 工具包。对于 React Web 开发者，可以暂时将它理解为 Android 原生领域中的一种组件化 UI 系统。

Expo UI 允许开发者通过 React/TSX 使用部分原生 Jetpack Compose 组件。这里的 `Box` 与官方 Jetpack Compose `Box` API 对应。

需要注意：这并不意味着 `Box` 是一个跨平台 Web 布局组件。当前文档明确标注它只支持 Android。

### `Box` 与 Web 布局的类比

`Box` 的核心行为是让子元素堆叠在同一区域内。

对 React Web 开发者来说，可以将其概念近似理解为：

```css
.container {
  position: relative;
}

.child {
  position: absolute;
}
```

但这只是帮助理解布局效果的类比，不代表 `Box` 内部使用 CSS，也不表示它完全遵循 Web 的定位规则。它最终对应的是 Android Jetpack Compose 布局系统。

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

这些命令的作用都是向项目安装 `@expo/ui`。

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它由 Expo CLI 负责安装依赖，并结合当前 Expo 项目选择兼容的包版本。

四组命令是不同包管理器的替代方案，只需执行与项目包管理器匹配的一组，不需要全部执行。

### 在现有 React Native 项目中安装

如果项目是一个已有的 React Native 原生项目，而不是已经配置好的 Expo 项目，则文档要求先在项目中安装并配置 `expo`，之后才能使用该模块。

这类项目在 Expo 文档中通常称为 existing React Native app 或 bare React Native app。

对于只开发过 React Web 的开发者，需要认识到：React Native 项目可能包含真正的 Android 和 iOS 原生工程。向这类项目加入 Expo 模块，不只是增加一个普通 JavaScript 依赖，还需要确保原生工程具备加载 Expo 模块的能力。

当前文档没有展开具体配置步骤，只提供了“安装 Expo 模块”的相关文档入口。

## 基本用法

```tsx
import { Host, Box, Text } from '@expo/ui/jetpack-compose';
import { size, background } from '@expo/ui/jetpack-compose/modifiers';

export default function BoxExample() {
  return (
    <Host matchContents>
      <Box
        contentAlignment="center"
        modifiers={[size(200, 200), background('#E0E0E0')]}
      >
        <Text>Centered in Box</Text>
      </Box>
    </Host>
  );
}
```

### 代码执行效果

这段代码创建了一个：

- 宽度为 `200`
- 高度为 `200`
- 背景色为 `#E0E0E0`
- 内容居中对齐

的 `Box`。

其中的 `Text` 会显示在 `Box` 中央。

### 导入入口

```tsx
import { Host, Box, Text } from '@expo/ui/jetpack-compose';
```

这些组件来自 `@expo/ui` 的 Jetpack Compose 入口，因此面向 Android 原生 Compose UI，而不是 React Native 的通用组件入口。

如果只需要 `Box`，API 文档给出的最小导入方式是：

```tsx
import { Box } from '@expo/ui/jetpack-compose';
```

### `Host`

示例使用 `Host` 包裹 Compose 组件：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

当前文档没有解释 `Host` 的完整职责，也没有说明 `matchContents` 的全部行为。因此，仅根据本页不能进一步确定它们的详细规则。

可以确认的是：官方示例将 Jetpack Compose 的 `Box` 放在 `Host` 中使用。

### Modifiers

示例从专门的 modifiers 入口导入：

```tsx
import {
  size,
  background,
} from '@expo/ui/jetpack-compose/modifiers';
```

并通过 `modifiers` 数组传递给 `Box`：

```tsx
modifiers={[
  size(200, 200),
  background('#E0E0E0'),
]}
```

示例中：

- `size(200, 200)` 设置容器尺寸
- `background('#E0E0E0')` 设置背景颜色

Modifiers 是 Jetpack Compose 风格的 UI 修饰机制。对 React Web 开发者来说，它们在用途上类似于通过 `style` 设置尺寸、背景等外观，但 API 形式和底层布局规则并不是 CSS。

当前文档只展示了这两个 modifier，没有说明尺寸单位、modifier 顺序或其他可用 modifier。

## `Box` 的布局行为

### 堆叠子元素

文档明确说明，`Box` 会将其子元素堆叠在一起，也就是让多个子元素位于同一布局区域，而不是像普通纵向列表那样依次排列。

例如，从概念上可以这样使用：

```tsx
<Box>
  <BackgroundContent />
  <ForegroundContent />
</Box>
```

这里的代码用于说明堆叠关系，不是原文提供的完整示例。

> **基于文档内容推导：**这种布局适合背景与前景、图片与标签、内容与覆盖层等组合。但文档没有说明多个子元素的具体绘制顺序，不能仅根据本页断定哪个子元素一定显示在最上层。

### 内容对齐

通过 `contentAlignment` 可以控制子元素在 `Box` 内部的位置：

```tsx
<Box contentAlignment="center">
  <Text>Centered in Box</Text>
</Box>
```

示例中的 `"center"` 表示将内容放在容器中央。

当前文档没有列出 `ContentAlignment` 支持的所有取值，因此不能根据本页自行扩展其他字符串值。需要使用其他对齐方式时，应查询对应的类型定义或完整 API 文档。

## API 说明

### `Box`

类型：

```tsx
React.Element<BoxProps>
```

它是一个接收 `BoxProps` 的 React 组件。

支持平台：

```text
Android
```

### `children`

```ts
children?: React.ReactNode
```

`children` 是可选属性，表示放在 `Box` 内部的 React 子节点。

因为类型是 `React.ReactNode`，它可以接收组件、文本节点或多个子节点。`Box` 的主要意义在于对这些子节点进行堆叠和对齐。

### `contentAlignment`

```ts
contentAlignment?: ContentAlignment
```

用于设置子元素在 `Box` 内部的对齐方式。

该属性是可选的。当前文档：

- 展示了 `"center"` 用法
- 没有列出全部合法值
- 没有说明未传入时的默认对齐方式

因此，不应仅凭本页假设默认值。

### `floatingToolbarExitAlwaysScrollBehavior`

```ts
floatingToolbarExitAlwaysScrollBehavior?: FloatingToolbarExitAlwaysScrollBehavior
```

文档将其描述为：

> 浮动工具栏退出时使用的滚动行为。

该属性是可选的，并且只支持 Android。

当前文档没有提供：

- 使用示例
- 适用的具体工具栏组件
- 参数创建方式
- 与滚动容器的连接方式
- 默认行为
- 使用限制

因此，仅阅读本页不足以安全地使用这个属性。需要结合对应类型定义或浮动工具栏相关文档进一步确认。

### 继承属性

`BoxProps` 还继承：

```text
PrimitiveBaseProps
```

这意味着 `Box` 除了本页列出的属性外，还可以接收 `PrimitiveBaseProps` 中定义的通用属性。

当前文档没有展开 `PrimitiveBaseProps` 的字段，因此无法从本页完整列出所有继承属性。示例中使用的 `modifiers` 很可能来自这类通用属性，但本页没有明确说明其类型归属。

## 限制与容易踩坑的地方

### 仅支持 Android

这是最重要的平台限制。虽然代码使用 React 和 TSX 编写，但 `Box` 来自：

```tsx
@expo/ui/jetpack-compose
```

Jetpack Compose 是 Android UI 技术，所以该组件不能被视为同时支持 iOS、Web 和 Android 的通用 React Native 组件。

如果业务需要跨平台运行，应为非 Android 平台准备其他实现。具体如何组织跨平台代码，当前文档未涉及。

### “Included in Expo Go”不等于支持所有平台

文档标注该组件包含在 Expo Go 中，表示可以在支持它的平台上通过 Expo Go 使用，并不代表 Expo Go 的所有平台都支持该组件。

本页同时明确标注支持平台为 Android，因此这里应理解为“Android 版 Expo Go 已包含相应能力”。

### 示例没有真正演示多个元素堆叠

虽然文档将 `Box` 定义为堆叠布局，但示例中只有一个 `Text` 子元素，所以示例实际展示的是居中对齐，而不是多个元素相互覆盖的效果。

要验证堆叠行为，需要在 `Box` 中放入多个子元素。

### 不要把 Modifier 当作 CSS

React Web 开发者可能会将：

```tsx
modifiers={[size(200, 200), background('#E0E0E0')]}
```

直接理解为：

```tsx
style={{
  width: 200,
  height: 200,
  backgroundColor: '#E0E0E0',
}}
```

二者在用途上相似，但属于不同 UI 系统。CSS 中的级联、选择器、盒模型和定位规则不能直接套用到 Jetpack Compose Modifier 上。

### 部分 API 信息不完整

当前页面没有说明：

- `ContentAlignment` 的全部取值
- `contentAlignment` 的默认值
- 尺寸参数的单位
- 多个子元素的绘制顺序
- `Host` 和 `matchContents` 的完整行为
- `FloatingToolbarExitAlwaysScrollBehavior` 的创建及使用方式
- `PrimitiveBaseProps` 包含哪些属性

这些内容不能根据名称自行猜测，实际开发时应继续查阅对应类型或组件文档。

## 实际开发中的使用方式

### 适合直接采用的场景

当页面仅面向 Android，并且正在使用 Expo UI 的 Jetpack Compose 组件时，可以使用 `Box`：

- 创建固定尺寸的内容容器
- 将内容居中
- 在同一位置放置多个 UI 元素
- 组合背景层和内容层

### 跨平台项目中的处理

> **基于文档内容推导：**由于 `Box` 明确只支持 Android，跨平台项目不应在所有平台共享的渲染路径中无条件使用它。否则 iOS 或 Web 构建可能无法获得同等实现。

当前文档没有给出平台文件拆分或条件渲染方案，因此具体实现方式需要参考 Expo 或 React Native 的跨平台代码组织文档。

### 建议先验证最小示例

> **基于经验建议：**首次使用时，可以先在 Android Expo Go 中运行文档提供的最小示例，确认以下条件：

- `@expo/ui` 已正确安装
- 导入路径正确
- `Host` 能承载 Jetpack Compose 组件
- `Box` 的尺寸和背景 modifier 生效
- `contentAlignment="center"` 能正确居中内容

验证基础能力后，再加入多个子元素或复杂滚动行为，可以减少同时排查安装、平台和布局问题的成本。

## 文档明确内容与推导内容

### 文档明确说明

- `Box` 来自 `@expo/ui`
- 导入路径是 `@expo/ui/jetpack-compose`
- `Box` 对应官方 Jetpack Compose `Box` API
- `Box` 会堆叠子元素
- `contentAlignment` 用于设置子元素的对齐方式
- 示例使用 `"center"` 实现居中
- 组件仅支持 Android
- 组件包含在 Expo Go 中
- 现有 React Native 项目需要先安装 Expo
- `BoxProps` 包含 `children`、`contentAlignment` 和 `floatingToolbarExitAlwaysScrollBehavior`
- `BoxProps` 继承 `PrimitiveBaseProps`

### 基于文档内容推导

- `Box` 可用于背景与前景、图片与标签等覆盖式布局
- 跨平台项目需要为 Android 之外的平台准备其他实现
- 不能在所有平台共享的代码路径中无条件依赖该组件

### 当前文档未涉及

- iOS 或 Web 的替代组件
- 完整的跨平台实现方案
- `ContentAlignment` 的所有取值
- 多个子元素的绘制层级
- Modifier 的完整规则
- 原生 Android 工程配置细节
- 测试、性能和无障碍相关说明
- 浮动工具栏滚动行为的完整用法

## 总结

`Box` 是 Expo UI 面向 Android Jetpack Compose 提供的堆叠布局组件。它通过 `children` 接收子元素，通过 `contentAlignment` 控制这些元素在容器中的位置，并可以使用 Compose modifiers 设置尺寸和背景等属性。

对 React Web 开发者而言，最需要注意的是：它虽然使用 React 和 TSX，但不是 Web 组件，也不是跨平台 React Native 通用组件。其布局和样式能力来自 Android Jetpack Compose，当前只能在 Android 上使用。

---

## 文档导航

- **上一页**：[basicalertdialog](./27__basicalertdialog.md)
- **下一页**：[button](./29__button.md)
