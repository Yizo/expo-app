# Expo UI SwiftUI `Label` 学习文档

## 文档解决的问题

`Label` 是 `@expo/ui` 提供的 SwiftUI 风格组件，用于在原生界面中并排显示：

- 一段标题文字
- 一个图标

它适合列表项、分区内容等需要“图标 + 文字”组合的场景。

```text
★ Favorites
⚙ Settings
```

> **文档明确说明：** Expo UI 的 `Label` 与 Apple 官方 SwiftUI `Label` API 对应，实际渲染的是原生 Label 视图。

## 文档版本与平台范围

本文档页面属于**下一个 Expo SDK 版本**的未发布版本文档，并非当前稳定版本文档。

文档指出当前最新稳定版本是 **SDK 56**。实际项目使用时，应优先查看对应 SDK 版本的文档，避免未发布 API 与本地依赖不一致。

支持范围如下：

| 项目 | 支持情况 |
| --- | --- |
| iOS | 支持 |
| tvOS | 支持 |
| Android | 当前文档未说明支持 |
| Web | 当前文档未说明支持 |
| Expo Go | 已包含 |

> **基于文档内容推导：** 由于组件 API 只标注支持 iOS 和 tvOS，不应把它当成可以直接跨 iOS、Android 和 Web 使用的通用 React Native 组件。

## 阅读前需要理解的背景知识

### SwiftUI 是什么

SwiftUI 是 Apple 用来构建 iOS、tvOS 等平台原生界面的 UI 框架。

虽然这里使用的是 TSX：

```tsx
<Label title="Favorites" systemImage="star.fill" />
```

但它并不是浏览器中的 HTML 标签，也不是普通 React Web 组件。`@expo/ui/swift-ui` 会把 React 组件声明映射到 Apple 平台的原生 SwiftUI 视图。

对于 React Web 开发者，可以将其暂时理解为：

```text
React TSX 声明
    ↓
Expo UI 桥接
    ↓
Apple SwiftUI 原生视图
```

### SF Symbols 是什么

SF Symbols 是 Apple 提供的系统图标库。`systemImage` 接收其中的图标名称，例如：

```tsx
<Label title="Favorites" systemImage="star.fill" />
```

这里的 `"star.fill"` 不是图片文件路径，也不是 CSS 图标类名，而是 SF Symbol 的名称。

其类型为 `SFSymbol`，文档链接指向 `sf-symbols-typescript` 提供的类型定义。

### `Host` 的作用

文档中的所有示例都把 `Label` 放在 `Host` 内：

```tsx
<Host matchContents>
  <Label title="Favorites" systemImage="star.fill" />
</Host>
```

`Host` 是 SwiftUI 内容在 React Native 组件树中的宿主容器。

`matchContents` 表示宿主容器根据内部原生内容匹配尺寸。

> **文档明确说明：** 示例使用了 `Host matchContents`。  
> **当前文档未涉及：** `Host` 的完整生命周期、布局规则，以及缺少 `Host` 时的具体行为。需要查看 `Host` 对应文档才能进一步确认。

## 安装

包名为：

```text
@expo/ui
```

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

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它用于选择与当前 Expo SDK 兼容的依赖版本。

### 已有 React Native 项目

如果项目是现有的 React Native 原生项目，而不是已经配置好的 Expo 项目，需要先在项目中安装并配置 `expo`，使项目能够使用 Expo Modules。

> **文档明确说明：** 已有 React Native 项目必须先安装 `expo`。  
> **当前文档未涉及：** iOS Pod、原生工程修改和构建步骤的具体操作，这些内容需要参考 Expo Modules 安装文档。

## 基本用法

### 使用 SF Symbol

```tsx
import { Host, Label } from '@expo/ui/swift-ui';

export default function BasicLabelExample() {
  return (
    <Host matchContents>
      <Label title="Favorites" systemImage="star.fill" />
    </Host>
  );
}
```

关键参数：

- `title`：显示的文字。
- `systemImage`：SF Symbol 图标名称。

这是一种简洁的声明方式，适合使用 Apple 系统图标的场景。

## 使用自定义图标

如果 SF Symbols 无法满足需求，可以通过 `icon` 传入自定义 React 节点：

```tsx
import { Host, Label, Image } from '@expo/ui/swift-ui';

export default function LabelCustomIconExample() {
  return (
    <Host matchContents>
      <Label
        title="Custom Icon"
        icon={
          <Image
            systemName="sparkles"
            size={20}
            color="purple"
          />
        }
      />
    </Host>
  );
}
```

示例中的 `Image` 仍然使用了 SF Symbol，但通过独立组件控制了：

- 图标名称
- 尺寸
- 颜色

`icon` 可以接收任意 React 节点，因此不局限于示例中的 `Image`。

### 属性优先级

当 `icon` 和 `systemImage` 同时存在时：

```tsx
<Label
  title="Example"
  systemImage="star"
  icon={<Image systemName="sparkles" />}
/>
```

`icon` 优先，`systemImage` 不会作为最终图标使用。

> **实际开发建议：** 不要同时传入这两个属性。虽然优先级明确，但同时配置会降低代码可读性。

## 仅显示图标

`Label` 可以通过 `labelStyle('iconOnly')` 隐藏可见标题，只显示图标：

```tsx
import { Host, Label } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

export default function LabelIconOnlyExample() {
  return (
    <Host matchContents>
      <Label
        title="Settings"
        systemImage="gear"
        modifiers={[labelStyle('iconOnly')]}
      />
    </Host>
  );
}
```

需要从 modifiers 子路径导入 `labelStyle`：

```tsx
import { labelStyle } from '@expo/ui/swift-ui/modifiers';
```

然后通过 `modifiers` 数组应用：

```tsx
modifiers={[labelStyle('iconOnly')]}
```

这与 React Web 中直接设置 `className` 或 `style` 不同。这里使用的是 SwiftUI modifier 模型：把界面修饰能力按顺序传给原生视图。

### 无障碍要求

即使使用 `iconOnly` 隐藏标题，也必须提供 `title`：

```tsx
<Label
  title="Settings"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}
/>
```

`title` 虽然不可见，但会为无障碍功能保留组件含义。否则，只看到或读到一个齿轮图标的用户可能无法知道它代表“设置”。

这是本文档明确强调的要求。

## API 导入

只使用 `Label` 时，可以这样导入：

```tsx
import { Label } from '@expo/ui/swift-ui';
```

`Label` 的类型是接收 `LabelProps` 的 React 元素，并渲染原生 Label 视图。

## `LabelProps`

### `title`

```ts
title?: string
```

显示在 Label 中的标题文字。

```tsx
<Label title="Favorites" systemImage="star.fill" />
```

该属性是可选的，但普通文字标签以及 `iconOnly` 无障碍场景通常都应提供它。

### `systemImage`

```ts
systemImage?: SFSymbol
```

指定要显示的 SF Symbol 名称：

```tsx
<Label title="Settings" systemImage="gear" />
```

它不是图片 URL、文件路径或 React 节点。

### `icon`

```ts
icon?: React.ReactNode
```

提供自定义图标视图：

```tsx
<Label
  title="Custom Icon"
  icon={<Image systemName="sparkles" />}
/>
```

当它存在时，优先于 `systemImage`。

### `children`

```ts
children?: React.ReactNode
```

提供自定义标题视图，可以接收任意 React 节点。例如可以使用 `VStack` 组合标题和副标题。

```tsx
<Label icon={/* 图标视图 */}>
  {/* 自定义标题视图 */}
</Label>
```

当 `children` 存在时，它优先于 `title`。

因此，标题区域有两种配置方式：

| 需求 | 使用方式 |
| --- | --- |
| 简单字符串标题 | `title` |
| 自定义标题布局 | `children` |

> **基于文档内容推导：** 如果同时传入 `children` 和 `title`，最终应以 `children` 为标题内容。实际代码中应避免同时传入，以减少歧义。

### `color`

```ts
color?: ColorValue
```

用于设置 Label 图标的颜色，类型是 React Native 的 `ColorValue`。

文档在该 API 区域同时给出了弃用提示：

> Deprecated: Use `foregroundStyle` modifier instead.

页面排版将这条提示放在 `children` 与 `color` 之间，未清晰标明它具体对应哪个属性。不要仅根据页面位置自行断定被弃用的是 `children` 还是 `color`。

可以确定的是，文档建议改用 `foregroundStyle` modifier；其具体替代关系和写法应以对应 SDK 的 modifiers 文档为准。

## 继承的属性

`Label` 还继承了：

```text
CommonViewModifierProps
```

这表示它可以接收 Expo UI SwiftUI 组件通用的 modifier 相关属性。本文示例中的 `modifiers` 就属于这套机制：

```tsx
<Label modifiers={[labelStyle('iconOnly')]} />
```

**当前文档未涉及：**

- `CommonViewModifierProps` 的完整字段
- modifier 的执行顺序
- 多个 modifier 组合时的行为
- `foregroundStyle` 的详细参数

这些内容需要查阅 SwiftUI modifiers 专门文档。

## 属性优先级总结

`Label` 的标题和图标都支持简单配置与自定义视图。

| 区域 | 简单配置 | 自定义配置 | 同时存在时 |
| --- | --- | --- | --- |
| 标题 | `title` | `children` | `children` 优先 |
| 图标 | `systemImage` | `icon` | `icon` 优先 |

推荐按照需求二选一：

```tsx
// 简单标题 + 系统图标
<Label title="Favorites" systemImage="star.fill" />
```

```tsx
// 自定义标题 + 自定义图标
<Label icon={<CustomIcon />}>
  <CustomTitle />
</Label>
```

## React Web 开发者容易误解的地方

### 它不是跨平台 HTML 风格组件

组件虽然使用 React 和 TSX 编写，但底层是 Apple SwiftUI 原生视图。当前 API 只明确支持 iOS 和 tvOS。

如果业务同时支持 Android 或 Web，需要在应用架构中考虑平台分支或替代组件。

> **基于文档内容推导：** Android 与 Web 端应准备其他实现，但本文档没有规定应该使用哪个替代组件。

### `systemImage` 不是普通图片

以下值表示 SF Symbol 名称：

```tsx
systemImage="star.fill"
```

不能把 Web 项目中的 SVG 路径、图片 URL 或图标组件名称直接放进该属性。自定义内容应使用 `icon`。

### modifier 不等于 CSS

React Web 常用：

```tsx
<div className="icon-only" />
```

本文档使用：

```tsx
modifiers={[labelStyle('iconOnly')]}
```

modifier 是作用于 SwiftUI 原生视图的配置，不是 CSS 类，也不能按浏览器 CSS 的规则理解。

### `iconOnly` 不等于删除标题

视觉上隐藏标题不代表应该省略 `title`。为了无障碍支持，文档要求始终提供标题。

### React Native 项目不一定已经支持 Expo 模块

“React Native 项目”与“Expo 项目”并不完全等同。已有 React Native 原生项目若未配置 Expo Modules，仅安装 `@expo/ui` 可能不足以正常使用。

## 限制与注意事项

1. 仅明确支持 iOS 和 tvOS，不能假设 Android 或 Web 可用。
2. 当前页面属于下一个 SDK 版本，稳定项目应核对自己使用的 SDK 文档。
3. `icon` 会覆盖 `systemImage`。
4. `children` 会覆盖 `title`。
5. 使用 `iconOnly` 时仍必须提供 `title`，以保证无障碍语义。
6. 已有 React Native 项目需要先安装并配置 `expo`。
7. 文档建议使用 `foregroundStyle` modifier，但当前页面未清晰标明弃用提示具体对应哪个属性。
8. `CommonViewModifierProps` 的完整能力不在当前文档范围内。

## 实际开发中的使用方式

### 优先使用简单属性

如果只需要系统图标和单行文字，使用：

```tsx
<Label title="Favorites" systemImage="star.fill" />
```

这种方式最接近 `Label` 的标准用途，也能减少不必要的自定义布局。

### 需要特殊表现时再使用 React 节点

只有在下面这些场景中，才需要考虑 `icon` 或 `children`：

- 图标需要独立设置尺寸或颜色
- 图标不是合适的 SF Symbol
- 标题区域包含副标题
- 标题需要复杂布局

### 在共享组件中处理平台差异

> **基于文档内容推导：** 对同时支持多个平台的应用，可以在业务组件外封装统一接口，再为 Apple 平台使用 SwiftUI `Label`，为其他平台提供对应实现。这样可以避免业务页面直接依赖仅支持 iOS 和 tvOS 的 API。

### 安装后进行版本核对

> **基于经验建议：** 安装后应核对项目 Expo SDK、`@expo/ui` 版本以及所阅读文档版本是否一致。特别是本文属于下一 SDK 版本，API 可能尚未出现在当前稳定依赖中。

## 文档未涉及的内容

当前文档没有说明以下事项：

- Android 和 Web 的替代实现
- `Label` 的事件处理能力
- 点击、焦点或交互行为
- SF Symbol 的系统版本兼容范围
- 自定义字体和排版细节
- `Host` 的完整布局规则
- `foregroundStyle` 的具体用法
- 原生构建和发布流程
- 测试方式
- 性能特点

这些内容不能仅根据当前页面确定，需要查阅相应的 Expo UI、modifier、Host 或平台文档。

## 总结

`@expo/ui/swift-ui` 的 `Label` 用于在 iOS 和 tvOS 原生 SwiftUI 界面中组合标题与图标。

最常见的写法是：

```tsx
<Host matchContents>
  <Label title="Favorites" systemImage="star.fill" />
</Host>
```

需要自定义时：

- 使用 `children` 自定义标题，优先于 `title`。
- 使用 `icon` 自定义图标，优先于 `systemImage`。
- 使用 `labelStyle('iconOnly')` 只显示图标，但仍要提供 `title`。
- 通过 SwiftUI modifiers 控制原生视图表现，而不是套用 Web CSS 思维。

实际采用前需要重点确认项目平台和 Expo SDK 版本，因为当前页面面向下一个 SDK 版本，并且 API 只明确支持 iOS 与 tvOS。

---

## 文档导航

- **上一页**：[image](./90__image.md)
- **下一页**：[lazyhstack](./92__lazyhstack.md)
