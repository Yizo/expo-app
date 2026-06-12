# Collapsible：可折叠内容组件

`Collapsible` 是 `@expo/ui` 提供的基础 UI 组件。它通过一个带文字标签、可点击或轻触的标题栏，控制下方内容的显示与隐藏。

支持平台：

- Android
- iOS
- Web
- Expo Go

> 当前页面描述的是下一个 Expo SDK 版本中的 API，并非当前稳定版文档。文档明确指出，当前最新稳定版本为 SDK 56。实际开发时应优先核对所用 Expo SDK 对应的文档。

## 文档解决的问题

这篇文档主要说明：

- 如何安装提供 `Collapsible` 的 `@expo/ui` 包。
- 如何创建一个基本的可折叠区域。
- 如何组合多个 `Collapsible` 实现手风琴效果。
- 如何通过受控状态管理展开和收起。
- `Collapsible` 支持哪些属性，以及各属性的作用。

适合以下场景：

- FAQ 问答列表。
- 设置页面中的分组详情。
- 展开后显示补充说明的表单区域。
- 可折叠的信息面板。
- 每次只允许展开一项的手风琴列表。

## React Web 开发者需要先理解的背景

### `@expo/ui`

`@expo/ui` 是这个组件所在的包。使用时需要从该包导入 `Collapsible`：

```tsx
import { Collapsible } from '@expo/ui';
```

示例还使用了同一包中的其他组件：

```tsx
import { Host, Column, Collapsible, Text } from '@expo/ui';
```

它们在示例中的作用是：

- `Host`：作为 Expo UI 组件的外层宿主容器。
- `Column`：按纵向排列子元素。
- `Text`：显示文本内容。
- `Collapsible`：提供可展开、可收起的内容区域。

当前文档没有进一步介绍 `Host`、`Column` 和 `Text` 的完整 API。

### 移动端的 “tap”

文档中的 “tap” 指用户在触摸屏上的轻触操作。在 Web 开发语境中，可以近似理解为点击。

`Collapsible` 已经提供可交互的标题区域，使用者通过 `label` 设置标题文字，不需要在示例中额外创建按钮或编写点击事件。

### 受控组件

`Collapsible` 是受控组件，展开状态由调用方管理：

```tsx
const [open, setOpen] = useState(false);

<Collapsible isOpen={open} onOpenChange={setOpen} label="About">
  {/* 内容 */}
</Collapsible>
```

这与 React Web 中受控表单组件的思路相同：

- `isOpen` 相当于当前状态值。
- `onOpenChange` 相当于状态变化回调。
- 组件发出状态变化请求。
- 父组件更新 state。
- 新的 state 再通过 `isOpen` 传回组件。

`Collapsible` 不会仅凭 `onOpenChange` 自动修改父组件中的状态。如果回调没有更新对应状态，界面就无法持续反映用户的展开或收起操作。

## 安装

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

这里使用的是 `expo install`，而不是直接使用普通的 `npm install`、`yarn add` 或 `pnpm add`。

对于 React Web 开发者，可以将它理解为 Expo 提供的依赖安装入口。它负责按照 Expo 项目的环境安装包。

如果是在已有的 React Native 原生项目中安装该组件，文档要求先确保项目已经安装并配置 `expo`，也就是完成 Expo Modules 的接入。

> 当前文档只给出了相关安装文档的链接，没有展开说明如何向现有 React Native 工程接入 Expo Modules。

## 基本用法

```tsx
import { useState } from 'react';
import { Host, Column, Collapsible, Text } from '@expo/ui';

export default function CollapsibleExample() {
  const [open, setOpen] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Collapsible isOpen={open} onOpenChange={setOpen} label="About">
          <Text>
            A primitive that toggles visibility of its content via a labelled tappable header.
          </Text>
        </Collapsible>
      </Column>
    </Host>
  );
}
```

执行流程如下：

1. `open` 初始值是 `false`，所以内容默认收起。
2. `isOpen={open}` 将当前展开状态传给 `Collapsible`。
3. 用户轻触标题栏后，组件调用 `onOpenChange`。
4. `setOpen` 接收新的布尔值并更新 React state。
5. 组件使用更新后的 `isOpen` 决定是否渲染 `children`。

文档明确说明，`children` 只在 `isOpen` 为 `true` 时渲染。

示例中的布局属性：

- `flex: 1`：让 `Host` 在弹性布局中占据可用空间。
- `spacing={8}`：设置 `Column` 内部子元素之间的间距。
- `padding: 16`：设置容器内边距。

这些布局属性不是 `Collapsible` 自身的 API。

## 实现手风琴效果

手风琴模式指多个折叠区域中，同一时间最多只展开一个。

文档明确说明：`Collapsible` 自身不会强制多个实例互斥。互斥逻辑需要由使用者在父组件中组合实现。

```tsx
import { useState } from 'react';
import { Host, Column, Collapsible, Text } from '@expo/ui';

type Section = 'a' | 'b' | 'c' | null;

export default function CollapsibleAccordionExample() {
  const [openSection, setOpenSection] = useState<Section>('a');

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Collapsible
          isOpen={openSection === 'a'}
          onOpenChange={open => setOpenSection(open ? 'a' : null)}
          label="Section A"
        >
          <Text>Opening B or C closes this one.</Text>
        </Collapsible>

        <Collapsible
          isOpen={openSection === 'b'}
          onOpenChange={open => setOpenSection(open ? 'b' : null)}
          label="Section B"
        >
          <Text>Opening A or C closes this one.</Text>
        </Collapsible>

        <Collapsible
          isOpen={openSection === 'c'}
          onOpenChange={open => setOpenSection(open ? 'c' : null)}
          label="Section C"
        >
          <Text>Opening A or B closes this one.</Text>
        </Collapsible>
      </Column>
    </Host>
  );
}
```

### 状态设计

父组件没有为每一项分别保存布尔值，而是只保存当前展开项的标识：

```tsx
type Section = 'a' | 'b' | 'c' | null;
```

各个值表示：

- `'a'`：展开 A。
- `'b'`：展开 B。
- `'c'`：展开 C。
- `null`：全部收起。

每个组件通过比较标识判断自身是否展开：

```tsx
isOpen={openSection === 'a'}
```

状态变化回调：

```tsx
onOpenChange={open => setOpenSection(open ? 'a' : null)}
```

含义是：

- 请求展开时，将当前项设置为 `'a'`。
- 请求收起时，将状态设置为 `null`。

因为父状态只能保存一个分区标识，所以展开新分区会自然关闭其他分区。

> **基于文档内容推导：** 如果业务允许多个区域同时展开，可以为每个 `Collapsible` 分别保存布尔状态，或者使用集合记录所有已展开项。文档没有提供这种模式的具体实现。

## API 说明

### `Collapsible`

```tsx
import { Collapsible } from '@expo/ui';
```

`Collapsible` 是一个 React 组件，支持 Android、iOS 和 Web。它通过带标签的可交互标题控制内容可见性。

### 属性一览

| 属性 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | 是 | 控制内容当前是否展开 |
| `onOpenChange` | `(isOpen: boolean) => void` | 是 | 用户轻触标题并请求切换状态时调用 |
| `label` | `string` | 否 | 显示在可交互标题区域中的文字 |
| `labelStyle` | 文本样式对象 | 否 | 设置标题文字样式 |
| `children` | `ReactNode` | 否 | `isOpen` 为 `true` 时渲染的内容 |

### `isOpen`

```tsx
isOpen: boolean
```

表示内容是否展开：

- `true`：显示内容。
- `false`：隐藏内容。

这是必填属性。

### `onOpenChange`

```tsx
onOpenChange: (isOpen: boolean) => void
```

用户轻触标题、请求切换展开状态时调用。回调参数是新的目标状态：

```tsx
onOpenChange={nextIsOpen => {
  setOpen(nextIsOpen);
}}
```

这是必填属性，也是受控状态能够正常更新的关键。

### `children`

```tsx
children?: ReactNode
```

折叠区域内部的内容，仅在 `isOpen` 为 `true` 时渲染。

它是可选属性。当前文档没有规定 `children` 只能是哪一种具体组件。

### `label`

```tsx
label?: string
```

显示在可交互标题区域中的文字，例如：

```tsx
<Collapsible label="About" />
```

虽然 `label` 是可选属性，但组件的核心交互设计是“带标签的可轻触标题”。当前文档没有说明省略 `label` 后标题区域的具体外观或交互表现。

### `labelStyle`

用于设置标题文字的样式，支持以下字段：

```tsx
{
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'center' | 'left' | 'right';
}
```

字段含义：

| 字段 | 作用 |
| --- | --- |
| `color` | 文字颜色 |
| `fontFamily` | 字体族 |
| `fontSize` | 字号 |
| `fontWeight` | 字重 |
| `letterSpacing` | 字符间距 |
| `lineHeight` | 行高 |
| `textAlign` | 左对齐、居中或右对齐 |

需要注意，`labelStyle` 是标题文字专用样式，不是整个折叠容器的通用样式。

## 限制与容易踩坑的地方

### 当前页面不是稳定版文档

页面元信息显示其修改日期为 2026 年 5 月 23 日，但它属于 `unversioned`，即下一个 SDK 版本的文档。

如果项目使用 SDK 56 或其他稳定版本，应检查相应版本中是否已经提供完全一致的组件和 API，不能直接假设未发布版本文档与当前项目一致。

### 每个实例默认独立管理

文档明确说明，每个 `Collapsible` 的状态彼此独立。组件不会自动识别同级实例，也不会自动关闭其他区域。

手风琴模式必须通过共享的父组件状态实现。

### `isOpen` 和 `onOpenChange` 必须配合

只传入固定的 `isOpen`，却不在 `onOpenChange` 中更新状态，会导致用户操作后界面仍被固定值控制。

错误思路：

```tsx
<Collapsible
  isOpen={false}
  onOpenChange={() => {}}
  label="About"
/>
```

这里的内容会一直处于收起状态。

### 不要把它误认为 Web 原生元素

它不是 HTML 的 `<details>` 或 `<summary>`，也不使用 CSS 选择器控制展开状态。它是跨 Android、iOS 和 Web 的 React 组件，状态通过 React props 传递。

### 文档未涉及的内容

当前文档没有说明以下内容：

- 展开和收起是否带动画，以及动画能否配置。
- 标题图标或展开指示箭头如何定制。
- 容器背景、边框、圆角等整体样式如何设置。
- 是否支持受控状态之外的非受控模式。
- 键盘操作、焦点管理和无障碍属性细节。
- 服务端渲染行为。
- 大量折叠项的性能表现。
- 测试时应使用什么查询方式。
- `label` 缺省时的具体交互和视觉效果。

对于这些问题，应继续查阅对应 SDK 版本的完整 API、源码或其他 `@expo/ui` 文档，不能从当前页面直接得出结论。

## 实际开发建议

以下内容是**基于经验建议**，不是当前文档明确规定的 API 行为：

- 为每个折叠区域提供简洁且能描述内容的 `label`。
- 普通折叠区域使用独立的布尔状态。
- 手风琴列表使用单个 ID 状态，避免多个布尔值产生互相矛盾的组合。
- 动态列表中可以保存业务 ID，而不是示例里的 `'a'`、`'b'`、`'c'`。
- 使用 TypeScript 联合类型约束允许展开的分区标识，减少拼写错误。
- 在决定用于重要的无障碍场景前，先验证目标平台上的键盘、屏幕阅读器和焦点表现。
- 根据项目实际 Expo SDK 版本阅读对应版本文档，避免直接使用 `unversioned` 页面开发稳定版项目。

## 明确结论与推导结论

### 文档明确说明

- `Collapsible` 通过可轻触的带标签标题显示或隐藏内容。
- 组件由 `isOpen` 和 `onOpenChange` 控制。
- `children` 在 `isOpen` 为 `true` 时渲染。
- 每个 `Collapsible` 的状态相互独立。
- 组件本身不会强制手风琴的互斥行为。
- 手风琴效果需要使用共享父状态进行组合。
- 组件支持 Android、iOS 和 Web。
- `@expo/ui` 包包含在 Expo Go 中。
- 现有 React Native 项目需要先接入 Expo 才能安装使用。
- 当前页面面向下一个 SDK 版本，稳定版应查看 SDK 56 文档。

### 基于文档内容推导

- 单个折叠区域适合使用一个布尔 state。
- 互斥手风琴适合使用“当前展开项 ID 或 `null`”作为 state。
- 是否允许多个区域同时展开，取决于父组件采用的状态结构。
- 该组件的状态设计与 React Web 中的受控组件模式一致。
- 动态手风琴可以将示例中的联合类型标识替换为业务数据 ID。

## 总结

`Collapsible` 的核心不是复杂的配置，而是清晰的受控状态模型：

```tsx
<Collapsible
  isOpen={open}
  onOpenChange={setOpen}
  label="标题"
>
  <Text>展开后显示的内容</Text>
</Collapsible>
```

单个实例通过布尔状态控制。多个实例要实现手风琴效果，则共享一个表示当前展开项的父状态。组件不会替开发者决定多个折叠区域之间的关系，这部分需要根据业务需求自行组合。

---

## 文档导航

- **上一页**：[checkbox](./120__checkbox.md)
- **下一页**：[column](./122__column.md)
