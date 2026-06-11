# FlowRow：可自动换行的横向布局组件

> 文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> 可在 Expo Go 中使用

> **版本提醒**：原文属于“下一个 Expo SDK 版本”的未发布版本文档。原文指出，当前最新稳定版本为 SDK 56。实际开发时，应确认项目使用的 Expo SDK 版本是否已经提供这里描述的 API。

## 文档解决的问题

`FlowRow` 用于将多个子元素从左到右排列，并在当前行空间不足时自动换到下一行。

它适合以下场景：

- 标签列表
- 筛选条件
- 尺寸或颜色选项
- 数量不固定、宽度不一致的横向内容
- 需要根据屏幕宽度自动换行的操作项

对于 React Web 开发者，可以先将它理解为一种接近以下 CSS 布局的原生 Android 组件：

```css
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
```

这只是帮助理解的类比。`FlowRow` 并不使用浏览器 CSS，而是匹配 Android Jetpack Compose 官方的 `FlowRow` API。

## 阅读前需要理解的背景

### Expo UI

Expo UI 是 Expo 提供的一组 UI 能力。本组件来自：

```text
@expo/ui
```

当前页面使用的是该包的 Jetpack Compose 接口：

```tsx
import { FlowRow } from '@expo/ui/jetpack-compose';
```

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 工具包。它在开发体验上与 React 有相似之处：开发者通过声明组件结构描述界面，而不是手动创建和更新原生视图。

本页面中的 `FlowRow` 是 Expo UI 面向 React Native 提供的组件，但底层对应 Android Jetpack Compose 的布局能力。

### Android 专用组件

文档明确将 `FlowRow` 标记为仅支持 Android。因此，它不是一个可以直接跨 iOS 和 Android 使用的通用 React Native 布局组件。

如果应用同时支持 iOS，需要自行设计平台适配方案。当前文档没有提供 iOS 替代组件或跨平台实现方式。

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

这些命令都会安装 `@expo/ui`。与普通的 `npm install` 相比，`expo install` 会按照当前 Expo SDK 选择兼容的依赖版本。

### 已有 React Native 工程

如果是在现有 React Native 原生工程中安装，而不是从 Expo 项目开始，文档要求先在项目中安装并配置 `expo`，以便使用 Expo Modules。

这里的“已有 React Native 工程”通常也称为 bare React Native 工程。它包含可以直接修改的 Android、iOS 原生项目。

当前文档没有给出安装 Expo Modules 的完整步骤，仅提供了相关文档入口。

## 基本用法

```tsx
import { Host, FlowRow, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function FlowRowExample() {
  const tags = [
    'React Native',
    'Expo',
    'Android',
    'Jetpack Compose',
    'Material 3',
    'Kotlin',
  ];

  return (
    <Host matchContents>
      <FlowRow
        horizontalArrangement={{ spacedBy: 8 }}
        verticalArrangement={{ spacedBy: 8 }}
        modifiers={[paddingAll(16)]}
      >
        {tags.map(tag => (
          <Text key={tag}>{tag}</Text>
        ))}
      </FlowRow>
    </Host>
  );
}
```

该示例最终形成一个标签流：

1. 标签按数组顺序从左到右排列。
2. 当前行无法容纳下一个标签时，标签移动到下一行。
3. 同一行的标签间距为 `8`。
4. 不同行之间的间距为 `8`。
5. 整个 `FlowRow` 四周具有 `16` 的内边距。

## 示例中的组件与配置

### `Host`

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

示例使用 `Host` 承载 Jetpack Compose 组件，并通过 `matchContents` 让宿主区域匹配其内容。

当前文档没有进一步说明：

- `Host` 的完整职责
- `matchContents` 的具体测量规则
- 不使用 `Host` 会产生什么结果
- `Host` 的其他属性

因此，本篇只能确认它是官方示例所使用的组件结构，不能根据当前页面推断其全部行为。

### `FlowRow`

```tsx
<FlowRow>{children}</FlowRow>
```

`FlowRow` 是核心布局组件。它负责：

- 横向排列子元素
- 检测当前行的可用空间
- 空间不足时将后续元素放到下一行

### `Text`

示例使用的是 Expo UI Jetpack Compose 接口中的 `Text`：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

不要因为组件名称相同，就默认它等同于从 `react-native` 导入的 `Text`。它们来自不同模块。

### `modifiers`

```tsx
modifiers={[paddingAll(16)]}
```

Jetpack Compose 中的 Modifier 用来调整组件的布局、外观或交互行为。对于 React Web 开发者，可以将它粗略理解为组件样式和行为配置的组合，但它不是 CSS。

示例中的：

```tsx
paddingAll(16)
```

为 `FlowRow` 的所有方向增加内边距。

当前文档只展示了该用法，没有介绍 Modifier 的执行顺序、完整类型或其他可用函数。

## API

### 导入方式

```tsx
import { FlowRow } from '@expo/ui/jetpack-compose';
```

不要从包根路径或 React Native 中导入同名组件。

### `FlowRow`

支持平台：Android。

类型：

```ts
React.Element<FlowRowProps>
```

它是一个 React 元素，通过 `FlowRowProps` 接收属性。

## `FlowRowProps`

### `children`

```ts
children?: React.ReactNode
```

- 可选
- 仅支持 Android
- 表示需要由 `FlowRow` 排列的子元素

它可以接收单个或多个 React 节点。示例通过 `Array.prototype.map()` 动态生成多个 `Text`。

使用数组渲染子元素时，仍应遵循 React 的规则，为每个元素提供稳定的 `key`：

```tsx
{tags.map(tag => (
  <Text key={tag}>{tag}</Text>
))}
```

### `horizontalArrangement`

```ts
horizontalArrangement?: HorizontalArrangement
```

- 可选
- 仅支持 Android
- 控制子元素在水平方向上的排列方式

示例配置：

```tsx
horizontalArrangement={{ spacedBy: 8 }}
```

表示同一行中的相邻子元素之间保持 `8` 的间距。

当前文档没有列出 `HorizontalArrangement` 支持的全部配置值，因此不能仅根据本页面确定其他排列方式的名称和行为。

### `verticalArrangement`

```ts
verticalArrangement?: VerticalArrangement
```

- 可选
- 仅支持 Android
- 控制各行在垂直方向上的排列方式

示例配置：

```tsx
verticalArrangement={{ spacedBy: 8 }}
```

当内容换行后，相邻两行之间保持 `8` 的间距。

当前文档没有列出 `VerticalArrangement` 的完整配置结构。

### 继承属性

`FlowRowProps` 继承：

```text
PrimitiveBaseProps
```

这意味着 `FlowRow` 还可以接收基础原语组件共有的属性。示例中的 `modifiers` 应来自这类基础能力。

当前文档没有展开 `PrimitiveBaseProps` 的字段，因此本篇无法完整列出继承属性。

## 容易混淆的地方

### 它不是 React Native 的 `flexWrap`

在普通 React Native 开发中，类似布局可能通过 `View` 的 Flexbox 样式实现。这里的 `FlowRow` 则直接对应 Jetpack Compose 的原生布局 API。

两者可以解决相似问题，但组件来源、配置方式和平台范围不同。

### 间距配置分为两个方向

```tsx
horizontalArrangement={{ spacedBy: 8 }}
verticalArrangement={{ spacedBy: 8 }}
```

- `horizontalArrangement` 控制同一行内部的水平间距。
- `verticalArrangement` 控制换行后各行之间的垂直间距。

它们共同产生了类似 Web CSS `gap: 8px` 的效果，但并不是 CSS `gap` 属性。

### `paddingAll` 不等于子元素间距

```tsx
modifiers={[paddingAll(16)]}
```

该配置处理的是容器四周的内边距，不负责标签之间的距离。子元素和行之间的距离由两个 `Arrangement` 属性控制。

### 组件不能直接视为跨平台方案

页面明确标注其支持平台为 Android。即使 TypeScript 编译通过，也不能据此认为组件会在 iOS 上正常工作。

### 文档版本不是当前稳定版本

页面来自 `unversioned` 文档，描述的是下一个 SDK 版本。将示例复制到 SDK 56 或更早的项目中之前，需要检查对应版本的 Expo UI 文档和实际类型定义。

## 限制与未涉及内容

文档明确说明或展示了以下限制：

- `FlowRow` 仅支持 Android。
- 页面内容面向下一个 Expo SDK 版本。
- 组件包含在 Expo Go 中。
- 已有 React Native 工程需要安装 Expo Modules。
- 水平和垂直排列属性都是可选属性。

当前文档未涉及：

- iOS 替代方案
- Web 支持
- `HorizontalArrangement` 的完整配置
- `VerticalArrangement` 的完整配置
- 默认排列方式
- 每行最大元素数量
- 子元素的权重或对齐配置
- RTL 布局行为
- 无障碍处理
- 性能限制
- 大量子元素时是否需要虚拟列表
- `Host` 和 `PrimitiveBaseProps` 的完整 API
- 单位是像素、dp 还是其他单位的详细解释
- 测试方式和原生构建要求

不能仅根据本页面为这些问题给出确定结论。

## 实际开发中的使用方式

### 适合直接使用的情况

当应用只针对 Android，或者已经为不同平台维护独立 UI，并且需要展示少量、宽度不一的元素时，可以使用 `FlowRow`：

```tsx
<FlowRow
  horizontalArrangement={{ spacedBy: 8 }}
  verticalArrangement={{ spacedBy: 8 }}
>
  {items.map(item => (
    <Text key={item.id}>{item.label}</Text>
  ))}
</FlowRow>
```

### 跨平台项目

**基于文档内容推导**：由于组件仅支持 Android，跨平台项目不能无条件地在共享页面中使用它。应当在架构上隔离 Android 实现，并为其他平台提供对应布局。

当前文档没有规定应使用平台文件、条件渲染还是其他适配方式。

### 动态列表

示例证明可以使用 React 的数组映射生成子元素。数据项可能重复时，不应直接使用显示文本作为 `key`，而应使用稳定且唯一的业务 ID。

这是 React 列表渲染的一般规则，属于**基于经验建议**，不是当前页面新增的 `FlowRow` 要求。

### 大量数据

**基于经验建议**：`FlowRow` 更适合数量有限的布局内容。对于规模较大的数据列表，不应在缺少性能验证的情况下假定它具有列表虚拟化能力。当前文档没有声明 `FlowRow` 会按需渲染屏幕外内容。

## 文档明确内容与推导内容

### 文档明确说明

- `FlowRow` 匹配 Jetpack Compose 官方 `FlowRow` API。
- 子元素按照横向流排列。
- 当前行空间不足时自动换行。
- 组件来自 `@expo/ui`。
- 组件仅支持 Android。
- 组件包含在 Expo Go 中。
- 可配置水平和垂直排列方式。
- 可以通过 Modifier 添加内边距。
- 已有 React Native 工程需要安装 `expo`。
- 当前页面属于下一个 SDK 版本的文档。

### 基于文档内容推导

- 它适合标签、筛选项等宽度不固定的内容。
- 跨平台应用需要隔离 Android 实现。
- 它在视觉效果上类似 Web 的 `flex-wrap` 和 `gap` 组合。
- 继承的基础属性可能承载 `modifiers`，但具体类型关系仍应以完整 API 定义为准。

### 基于经验建议

- 动态列表应使用稳定且唯一的 `key`。
- 大量数据应先进行性能测试，不应默认具备虚拟化能力。
- 使用未发布版本 API 前，应核对项目 SDK、包版本和 TypeScript 类型定义。

## 总结

`FlowRow` 是 Expo UI 提供的 Android 专用 Jetpack Compose 布局组件。它从左到右排列子元素，并在空间不足时自动换行。

最关键的配置是：

```tsx
<FlowRow
  horizontalArrangement={{ spacedBy: 8 }}
  verticalArrangement={{ spacedBy: 8 }}
  modifiers={[paddingAll(16)]}
>
  {children}
</FlowRow>
```

其中，两个 `Arrangement` 分别控制行内水平间距和行间垂直间距，`paddingAll` 控制容器内边距。

实际采用前需要特别确认两点：它只支持 Android，并且当前页面描述的是下一个 Expo SDK 版本，而不是 SDK 56 的稳定版本文档。

---

## 文档导航

- **上一页**：[floatingactionbutton](./40__floatingactionbutton.md)
- **下一页**：[horizontalfloatingtoolbar](./42__horizontalfloatingtoolbar.md)
