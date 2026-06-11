# Divider：在 Android 界面中创建分隔线

`Divider` 是 Expo UI 提供的一组 Jetpack Compose 组件，用于在列表或布局中绘制视觉分隔线。

本文涉及两个组件：

- `HorizontalDivider`：水平分隔线
- `VerticalDivider`：垂直分隔线

它们与 Android 官方 Jetpack Compose Material 3 的 Divider API 对应。

> 本文档对应 `@expo/ui` 包中的 Jetpack Compose API，仅支持 Android，并已包含在 Expo Go 中。

## 文档解决的问题

在移动端界面中，经常需要使用细线区分不同内容，例如：

- 分隔列表中的不同条目
- 分隔上下排列的内容区域
- 分隔左右并排的操作项
- 表现界面中的视觉层级

`HorizontalDivider` 和 `VerticalDivider` 提供了这种能力，并支持自定义颜色、粗细及 Compose Modifier。

对于 React Web 开发者，可以把它们理解为用途类似以下 CSS 边框的原生 Android UI 组件：

```css
border-bottom: 1px solid #ddd;
border-left: 1px solid #ddd;
```

但二者并不等价：Divider 是一个独立的原生 Compose 组件，而不是某个元素上的 CSS 边框。

## 平台与运行环境

文档明确说明：

| 项目 | 支持情况 |
| --- | --- |
| Android | 支持 |
| Expo Go | 已包含 |
| iOS | 当前文档未声明支持 |
| Web | 当前文档未声明支持 |

因此，不能把这些组件当作跨 Android、iOS 和 Web 通用的 React Native 组件。

**基于文档内容推导：** 如果项目需要同时支持多个平台，应当在组件设计中考虑平台差异，避免让 iOS 或 Web 代码直接依赖 `@expo/ui/jetpack-compose` 中的 Divider。

## 阅读前需要理解的背景知识

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。它在开发理念上与 React 接近：开发者通过组合组件描述界面，而不是手动操作原生视图。

本文使用的 Divider 最终对应 Android Compose 中的原生组件。

### Expo UI

Expo UI 是 `@expo/ui` 包提供的 UI 能力。本文中的组件需要从 Jetpack Compose 专用入口导入：

```tsx
import {
  HorizontalDivider,
  VerticalDivider,
} from '@expo/ui/jetpack-compose';
```

这里的 `/jetpack-compose` 表明它们属于 Android Jetpack Compose UI，而不是普通的跨平台 React Native 组件。

### dp 与像素

`thickness` 接收 dp 值。

dp 是 Android 中与设备密度相关的尺寸单位。它的目的类似 Web 中用于保持视觉尺寸一致的逻辑单位，但不能简单地把它理解为 CSS 像素。

如果需要单物理像素宽度的线，文档建议使用：

```tsx
StyleSheet.hairlineWidth
```

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

这些命令使用 `expo install` 安装 `@expo/ui`。与直接运行普通包管理器的安装命令相比，`expo install` 会按照 Expo 项目的环境选择合适的依赖版本。

如果是在已有的 React Native 原生项目中使用，文档要求先确保项目已经安装并配置 Expo 模块支持。

> 这里的“已有 React Native app”是指并非直接由 Expo 项目模板创建、可能带有自行维护的 Android/iOS 原生工程的项目。

当前文档没有展开已有 React Native 项目安装 Expo 模块的具体步骤。

## 水平分隔线

`HorizontalDivider` 是一条水平细线，适合分隔上下排列的内容。

```tsx
import {
  Host,
  HorizontalDivider,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';

export default function HorizontalDividerExample() {
  return (
    <Host matchContents>
      <Column>
        <Text>First section</Text>
        <HorizontalDivider />
        <Text>Second section</Text>
      </Column>
    </Host>
  );
}
```

这个示例的界面结构是：

1. `Column` 将内容纵向排列。
2. 第一段文字显示在上方。
3. `HorizontalDivider` 在中间绘制水平线。
4. 第二段文字显示在线条下方。
5. `Host` 承载这组 Jetpack Compose 组件。

### 示例中的辅助组件

当前文档没有完整介绍 `Host`、`Column` 和 `Text` 的 API。

根据示例可以确认或推导：

- `Host` 是 Compose UI 内容的宿主组件。
- `matchContents` 用于让宿主尺寸匹配其内容。
- `Column` 将子组件纵向排列。
- `Text` 显示文本。

其中，组件的具体布局规则和完整参数并不在当前 Divider 文档的说明范围内。

## 自定义粗细和颜色

两个 Divider 组件都支持：

- `thickness`：线条粗细
- `color`：线条颜色

```tsx
import {
  Host,
  HorizontalDivider,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import { StyleSheet } from 'react-native';

export default function CustomDividerExample() {
  return (
    <Host matchContents>
      <Column>
        <Text>Hairline divider (1 pixel)</Text>
        <HorizontalDivider thickness={StyleSheet.hairlineWidth} />

        <Text>Thick colored divider</Text>
        <HorizontalDivider thickness={4} color="#E91E63" />

        <Text>Below</Text>
      </Column>
    </Host>
  );
}
```

### 单像素分隔线

```tsx
<HorizontalDivider thickness={StyleSheet.hairlineWidth} />
```

`StyleSheet.hairlineWidth` 表示当前设备能够显示的单物理像素线宽。它会根据设备像素密度调整数值。

这与直接传入 `1` 不完全相同：

- `thickness={1}` 表示 1 dp。
- `StyleSheet.hairlineWidth` 用于获得单物理像素效果。

这是 React Web 开发者容易混淆的地方。在高密度屏幕上，一个 dp 可能由多个物理像素绘制。

### 自定义粗线和颜色

```tsx
<HorizontalDivider thickness={4} color="#E91E63" />
```

该分隔线的粗细为 `4dp`，颜色为 `#E91E63`。

`color` 的类型是 React Native 的 `ColorValue`。当前文档示例使用十六进制颜色字符串，但没有进一步列举其他支持的颜色格式。

## 垂直分隔线

`VerticalDivider` 用于分隔左右并排的内容，通常放在 `Row` 布局中。

```tsx
import {
  Host,
  VerticalDivider,
  Row,
  Text,
} from '@expo/ui/jetpack-compose';
import { height } from '@expo/ui/jetpack-compose/modifiers';

export default function VerticalDividerExample() {
  return (
    <Host matchContents>
      <Row verticalAlignment="center" modifiers={[height(48)]}>
        <Text>Left</Text>
        <VerticalDivider />
        <Text>Right</Text>
      </Row>
    </Host>
  );
}
```

该示例中：

- `Row` 将子组件横向排列。
- `verticalAlignment="center"` 让 Row 中的内容在垂直方向居中。
- `height(48)` 将 Row 的高度设置为 `48dp`。
- `VerticalDivider` 放在左右文本之间。

### 为什么示例设置了 Row 高度

**基于文档内容推导：** 垂直分隔线需要从父布局获得可用的垂直尺寸。示例通过 `height(48)` 为 `Row` 提供明确高度，从而使垂直线具有可见的延伸范围。

当前文档没有详细说明未设置父布局高度时 `VerticalDivider` 的具体测量结果，因此不应仅根据这段示例断言所有场景都必须设置固定高度。

## Modifier 的作用

两个 Divider 都接受 `modifiers`：

```tsx
modifiers?: ModifierConfig[]
```

示例中的 Modifier 从专用模块导入：

```tsx
import { height } from '@expo/ui/jetpack-compose/modifiers';
```

然后通过数组传给组件：

```tsx
modifiers={[height(48)]}
```

对于 React Web 开发者，可以暂时把 Modifier 理解为 Compose 中用于调整尺寸、布局或其他表现的配置链，作用范围类似一部分 CSS 样式或布局属性。

不过 Modifier 与 CSS 并不相同：

- 它是有顺序的原生 Compose 配置。
- 通过函数生成配置。
- 以数组形式传入 `modifiers`。
- 当前文档未提供支持的 Modifier 完整列表和执行顺序说明。

## API 说明

### 导入方式

```tsx
import {
  HorizontalDivider,
  VerticalDivider,
} from '@expo/ui/jetpack-compose';
```

### `HorizontalDivider`

用于在列表和布局中分组或分隔内容，对应 Compose 的 `HorizontalDivider`。

支持平台：Android。

### `VerticalDivider`

用于在布局中垂直分隔内容，对应 Compose 的 `VerticalDivider`。

支持平台：Android。

### `DividerCommonConfig`

两个 Divider 共用以下配置：

| 属性 | 类型 | 是否必填 | 作用 |
| --- | --- | --- | --- |
| `color` | `ColorValue` | 否 | 设置分隔线颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 为组件应用 Compose Modifier |
| `thickness` | `number` | 否 | 设置分隔线粗细，单位为 dp |

单物理像素线可以写成：

```tsx
<HorizontalDivider thickness={StyleSheet.hairlineWidth} />
```

当前文档没有说明这些属性的默认值，也没有说明是否支持额外属性。

## 注意事项与限制

### 仅支持 Android

这是本文最重要的平台限制。两个组件的 API 均明确标记为 Android。

不要因为代码使用 TSX 和 React 组件形式，就认为它们能自动运行在 iOS 或 Web 上。

### 必须使用正确的导入入口

Divider 来自：

```tsx
@expo/ui/jetpack-compose
```

Modifier 来自：

```tsx
@expo/ui/jetpack-compose/modifiers
```

不要仅从 `@expo/ui` 根入口或 `react-native` 中寻找本文组件。

### `thickness` 使用 dp

直接传入数字表示 dp，而不是可以带单位的 CSS 值。因此应写：

```tsx
<HorizontalDivider thickness={4} />
```

不能按照 Web CSS 的方式写成：

```tsx
<HorizontalDivider thickness="4px" />
```

### Divider 是独立布局组件

在 Web 中，开发者可能习惯给现有元素增加 `border-bottom`。这里则需要把 Divider 作为子组件插入布局树：

```tsx
<Text>上方内容</Text>
<HorizontalDivider />
<Text>下方内容</Text>
```

它会参与原生布局测量，不应将其简单视为某个相邻组件的边框属性。

### 默认样式未在本文给出

当前文档没有明确说明：

- 默认颜色
- 默认粗细
- Divider 是否自带外边距
- Divider 的默认宽度或高度规则
- Modifier 的应用顺序
- 无明确父尺寸时垂直分隔线的测量行为
- 无障碍相关行为
- 深色模式下的默认颜色表现

实际开发时，不应根据本文自行假设这些细节。

## React Web 开发者的使用思路

可以按照以下映射建立初步理解：

| React Web 概念 | 本文中的近似概念 |
| --- | --- |
| React 组件 | Jetpack Compose 包装组件 |
| 纵向 Flex 布局 | `Column` |
| 横向 Flex 布局 | `Row` |
| CSS 边框分隔效果 | 独立的 Divider 组件 |
| CSS 高度配置 | `height()` Modifier |
| `1px` 细线 | `StyleSheet.hairlineWidth` |
| CSS 颜色值 | React Native `ColorValue` |

这些只是帮助理解的近似映射，不能据此认为 Compose 布局规则与浏览器 CSS 完全相同。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 如果设计稿要求真正的单物理像素细线，优先使用 `StyleSheet.hairlineWidth`，不要直接假设 `1dp` 等于 `1px`。
2. 对于垂直分隔线，应确认父级横向布局有明确的可用高度。
3. 在跨平台项目中，可以建立业务层 Divider 组件，由该组件在 Android 上调用 Compose Divider，在其他平台使用对应实现。
4. 如果颜色需要适配深色模式，应由项目主题系统提供颜色。本文没有说明 Divider 会自动选择符合业务主题的颜色。
5. 使用 `modifiers` 前，应进一步阅读 Expo UI Jetpack Compose Modifier 文档，尤其需要确认尺寸、间距和 Modifier 顺序。

## 信息边界

### 文档明确说明的内容

- Expo UI 提供 `HorizontalDivider` 和 `VerticalDivider`。
- 两者与官方 Jetpack Compose Divider API 对应。
- 组件支持 Android，并包含在 Expo Go 中。
- 需要安装 `@expo/ui`。
- 已有 React Native 项目需要先安装 Expo 模块支持。
- 两个组件都支持 `color`、`thickness` 和 `modifiers`。
- `thickness` 接受 dp 数值。
- 单物理像素线可使用 `StyleSheet.hairlineWidth`。
- 水平线适合分隔上下内容，垂直线适合分隔横向并排内容。

### 基于文档内容推导的内容

- `VerticalDivider` 需要从父布局获得可用高度，示例通过 `height(48)` 提供该尺寸。
- 跨平台项目需要处理 Android 与其他平台之间的实现差异。
- Divider 是参与原生布局的独立组件，不能完全等同于 CSS 边框。

### 当前文档未涉及的内容

- iOS 和 Web 的替代实现
- 默认颜色与默认粗细
- 完整的 Modifier API
- 动态主题和深色模式配置
- 无障碍行为
- 性能特征
- 测试方式
- 原生 Android 工程配置
- Divider 的交互或事件处理
- 已有 React Native 项目安装 Expo 模块的完整步骤

## 总结

`@expo/ui/jetpack-compose` 提供了 Android 专用的水平和垂直分隔线组件：

```tsx
<HorizontalDivider />
<VerticalDivider />
```

通过 `thickness` 和 `color` 可以控制线条外观，通过 `modifiers` 可以进一步参与 Compose 布局配置。

对 React Web 开发者而言，最关键的是认识到：

- 它们是 Android 原生 Compose 组件，不是跨平台 HTML 元素。
- Divider 需要作为独立组件插入布局。
- 数字尺寸使用 dp，而不是 CSS 像素。
- 单物理像素线应使用 `StyleSheet.hairlineWidth`。
- 垂直分隔线的效果与父布局提供的高度有关。

---

## 文档导航

- **上一页**：[datetimepicker](./35__datetimepicker.md)
- **下一页**：[dockedsearchbar](./37__dockedsearchbar.md)
