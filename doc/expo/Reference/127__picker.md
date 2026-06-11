# Picker：使用 SwiftUI 原生选择器

> 文档修改日期：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中使用 `@expo/ui` 提供的 SwiftUI `Picker`，让用户从一组选项中选择一个值。

它适合以下场景：

- 使用分段控件切换少量选项。
- 通过菜单选择一个值。
- 在 iOS 上使用滚轮选择器。
- 希望选择器采用 Apple 平台的原生外观和交互。
- 需要通过 React state 控制当前选中项。

需要注意，这不是 Web 的 HTML `<select>`，也不是跨平台通用组件。它是对 Apple SwiftUI `Picker` 的 React 封装，仅支持 iOS 和 tvOS。

文档还提供了一个跨平台替代方案：如果需要同一套代码适配多个平台，应考虑 `@expo/ui` 的 universal `Picker`，由它根据平台渲染相应的原生组件。

## 版本状态

原文明确说明：这是 **下一个 Expo SDK 版本**的文档，并非当前稳定版本文档。

截至该文档内容：

- 当前稳定版本是 SDK 56。
- 本页描述的是 `unversioned` API。
- 实际项目应根据所使用的 Expo SDK 版本查看对应文档。

这意味着本文中的 API 可能尚未进入稳定版本，或者在正式发布前发生变化。不要仅根据本页内容假设当前项目一定支持这些接口。

## 阅读前需要理解的概念

### Expo、React Native 与 SwiftUI 的关系

对于 React Web 开发者，可以将它们理解为不同层次：

- **React Native**：使用 React 组件模型开发原生应用，但最终渲染的不是 DOM。
- **Expo**：建立在 React Native 之上的开发平台，提供 SDK、构建工具和原生模块。
- **SwiftUI**：Apple 官方的声明式 UI 框架，用于构建 iOS、tvOS 等平台的原生界面。
- **Expo UI SwiftUI 组件**：允许 React Native 代码声明并控制 SwiftUI 原生组件。

因此，示例中的 `Picker` 虽然采用 JSX 编写，但最终不是浏览器中的 `<select>`，而是 Apple 平台上的原生 SwiftUI 选择器。

### `Host`

示例使用 `Host` 包裹 SwiftUI 组件：

```tsx
<Host matchContents>
  <Picker>{/* ... */}</Picker>
</Host>
```

**基于文档内容推导：**`Host` 负责承载 SwiftUI 内容，使其能够出现在 React Native 组件树中。它可以类比为 React Web 中将另一套渲染系统挂载到页面上的容器，但这里连接的是 React Native 与 SwiftUI，而不是 DOM。

`matchContents` 的具体尺寸计算规则在当前文档中没有说明。本文只能确认三个示例都使用了该属性，不能进一步推断其完整行为。

### modifier

SwiftUI 组件通过 modifier 调整行为和样式：

```tsx
modifiers={[pickerStyle('segmented')]}
```

它与 React Web 中传入 `className` 或 `style` 有一定相似性，但并不等价。modifier 更接近 SwiftUI 中对视图逐项附加配置或行为的机制。

当前页面涉及两个 modifier：

- `pickerStyle(...)`：设置选择器样式。
- `tag(...)`：为某个选项关联实际值。

### `tag`、`selection` 与选项文本

每个选项由 `Text` 显示，并通过 `tag` 绑定一个值：

```tsx
<Text modifiers={[tag('Apple')]}>Apple</Text>
```

这里包含两个不同概念：

- `Apple` 文本：用户看到的内容。
- `tag('Apple')`：该选项在程序中的值。

`Picker` 的 `selection` 保存当前选中的 tag 值，`onSelectionChange` 也会收到该值。

这类似于 Web 中：

```html
<option value="apple">Apple</option>
```

其中显示文本可以与程序值不同。

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

这里使用 `expo install`，而不是普通的 `npm install`。在 Expo 项目中，该命令会结合项目的 Expo SDK 版本选择兼容的依赖版本。

如果是在已有的纯 React Native 工程中使用，必须先按照 Expo 的“Installing Expo modules”流程安装 `expo`。只添加 `@expo/ui` 并不足以让一个未集成 Expo modules 的原生工程正常使用它。

当前文档没有涉及：

- iOS 原生工程的手动配置。
- Android 工程配置。
- CocoaPods 命令。
- `app.json` 或 `app.config.js` 配置。
- 其他文件或目录修改。

## 基本实现流程

三个样式示例采用完全相同的数据流，区别只在 `pickerStyle` 的参数。

### 1. 准备选项与状态

```tsx
const options = ['Apple', 'Banana', 'Orange'];

const [selectedTag, setSelectedTag] = useState(options[0]);
```

`selectedTag` 保存当前选中项的 tag，初始值是 `Apple`。

### 2. 使用 `Host` 承载 Picker

```tsx
<Host matchContents>
  {/* SwiftUI components */}
</Host>
```

示例将 SwiftUI `Picker` 放在 `Host` 中。

### 3. 指定样式和当前值

```tsx
<Picker
  modifiers={[pickerStyle('segmented')]}
  label="Select a fruit"
  selection={selectedTag}
>
```

这里建立了一个受控选择器：

- `selection` 是当前值。
- `onSelectionChange` 负责更新当前值。

它与 React Web 中的受控表单元素模式相似。

### 4. 生成带有 tag 的选项

```tsx
{options.map(option => (
  <Text key={option} modifiers={[tag(option)]}>
    {option}
  </Text>
))}
```

每个 `Text` 同时承担：

- 显示选项内容。
- 通过 `tag` 声明选项值。

### 5. 响应选择变化

```tsx
onSelectionChange={selection => {
  setSelectedTag(selection);
}}
```

当用户选择其他选项时，回调收到对应的 tag，并将其写回 React state。

## 三种 Picker 样式

### Segmented picker

```tsx
import { useState } from 'react';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

const options = ['Apple', 'Banana', 'Orange'];

export default function SegmentedPickerExample() {
  const [selectedTag, setSelectedTag] = useState(options[0]);

  return (
    <Host matchContents>
      <Picker
        modifiers={[pickerStyle('segmented')]}
        label="Select a fruit"
        selection={selectedTag}
        onSelectionChange={selection => {
          setSelectedTag(selection);
        }}>
        {options.map(option => (
          <Text key={option} modifiers={[tag(option)]}>
            {option}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
```

`segmented` 会使用分段选择器，适合选项较少、需要直接展示全部选项的场景。

**基于文档内容推导：**它在交互目的上类似 Web 中的一组单选按钮或 tab 式切换控件，但最终外观和行为由 Apple 原生组件决定。

### Menu picker

只需将样式改为：

```tsx
modifiers={[pickerStyle('menu')]}
```

`menu` 会以菜单形式提供选项，避免同时占用较多界面空间。

**基于文档内容推导：**当选项不适合全部平铺时，菜单样式通常比 segmented 更合适。原文没有给出选项数量上限。

### Wheel picker

只需将样式改为：

```tsx
modifiers={[pickerStyle('wheel')]}
```

它使用 iOS 常见的滚轮选择交互。

> **明确限制：`wheel` 样式不能在 Apple TV 上使用。**

因此，即使 `Picker` 组件整体支持 tvOS，也不代表所有 picker 样式都支持 tvOS。

## API 说明

### 导入

```tsx
import { Picker } from '@expo/ui/swift-ui';
```

相关 modifier 从单独的路径导入：

```tsx
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
```

不要将 SwiftUI 版本的导入路径与 universal `Picker` 混淆。

### `Picker`

支持平台：

- iOS
- tvOS

组件的泛型形式可以概括为：

```ts
PickerProps<T>
```

`T` 表示 tag 和 selection 使用的值类型。

例如：

```tsx
tag('option1') // T 可以是 string
tag(0)         // T 可以是 number
```

实际使用时，应让同一个 `Picker` 的 tag、`selection` 和回调参数保持一致的值类型。

### `children`

```ts
children?: React.ReactNode
```

表示选择器包含的选项内容。

文档明确说明，可以使用带 `tag` modifier 的 `Text` 组件展示选项：

```tsx
<Picker>
  <Text modifiers={[tag('option1')]}>Option 1</Text>
</Picker>
```

### `label`

```ts
label?: string | React.ReactNode
```

为 Picker 提供标签，可以传字符串或 React 节点：

```tsx
<Picker label="Select a fruit" />
```

标签的具体显示位置可能受到 picker 样式和平台原生行为影响，当前文档没有逐种说明。

### `selection`

```ts
selection?: T
```

当前选中选项的 tag 值：

```tsx
<Picker selection={selectedTag} />
```

它不是选项的索引，也不一定是显示文本。它必须与目标选项的 `tag(...)` 值对应。

### `onSelectionChange`

```ts
onSelectionChange?: (selection: T) => void
```

用户选择选项时触发，并收到被选中选项的 tag：

```tsx
onSelectionChange={selection => {
  setSelectedTag(selection);
}}
```

该回调不会根据示例自动更新状态；需要开发者自行调用 state setter。

### `systemImage`

```ts
systemImage?: SFSymbol
```

指定 Apple SF Symbols 系统图标，例如：

```tsx
<Picker systemImage="heart.fill" />
```

示例值还包括：

- `photo`
- `heart.fill`
- `star.circle`

SF Symbols 是 Apple 提供的系统图标集，不等同于 Web 项目中的 SVG、icon font 或第三方 React 图标组件。该属性接受 `SFSymbol` 类型定义所允许的图标名称。

当前文档没有展示 `systemImage` 的完整 Picker 示例，也没有说明不同样式下图标的具体显示方式。

### 继承属性

`Picker` 还继承 `CommonViewModifierProps`。

这表示它可以使用 Expo UI SwiftUI 的通用视图 modifier 属性。当前页面没有列出这些继承属性的具体内容，需要查阅对应的 modifiers 文档。

## 注意事项与限制

### 平台并非全覆盖

SwiftUI `Picker` 只明确支持：

- iOS
- tvOS

文档没有声明支持：

- Android
- Web
- macOS

如果业务需要 Android 或 Web，不能把这里的 SwiftUI `Picker` 当作通用组件直接使用。应考虑 universal `Picker` 或自行按平台拆分实现。

### Apple TV 不支持 wheel

`Picker` 支持 tvOS，但 `wheel` 变体不支持 Apple TV。进行跨 iOS/tvOS 开发时，需要避免在 tvOS 上选择该样式。

### tag 是状态绑定的关键

`selection` 和 `onSelectionChange` 操作的是 tag，而不是 `Text` 的显示内容。

以下情况容易导致选中状态无法正确匹配：

```tsx
<Picker selection="apple">
  <Text modifiers={[tag('Apple')]}>Apple</Text>
</Picker>
```

这里 `apple` 与 `Apple` 是不同字符串。

**基于文档内容推导：**每个可选项都应提供稳定且可区分的 tag，并确保初始 `selection` 对应其中一个 tag。原文没有明确说明重复 tag 或不存在匹配项时的行为。

### 值类型需要保持一致

文档示例表明 tag 可以是字符串或数字：

```tsx
tag('option1')
tag(0)
```

但不要在没有明确设计的情况下混用类型：

```tsx
selection="0"
tag(0)
```

字符串 `"0"` 和数字 `0` 不是同一个值。

这是 React Web 开发者常见的误区，因为原生 HTML 表单的 `value` 经常表现为字符串，而这里的 tag 由泛型 `T` 表示，可以保留数字等类型。

### 样式由原生平台决定

Expo UI 的 Picker 与 Apple 官方 SwiftUI Picker API 对齐，并通过 `pickerStyle` 支持 Picker 样式。

这意味着组件的实际布局、交互和视觉表现遵循 Apple 原生系统，而不是浏览器 CSS。当前文档没有提供 CSS、类名或 DOM 层面的定制方式。

### Expo Go 支持不等于所有平台都支持

页面标记为 Included in Expo Go，表示该能力包含在 Expo Go 中。但组件的平台范围仍然是 iOS 和 tvOS，不能据此推断 Expo Go 的 Android 版本也能使用该 SwiftUI 组件。

## React Web 开发者最容易误解的地方

| React Web 习惯 | 本文中的实际情况 |
| --- | --- |
| JSX 最终渲染为 DOM | 这里的 JSX 最终承载 SwiftUI 原生组件 |
| 使用 `<select>` 和 `<option>` | 使用 `Picker`、`Text` 和 `tag` |
| 通过 CSS 控制样式 | 通过 SwiftUI modifier 和原生样式控制 |
| `event.target.value` 获取值 | `onSelectionChange` 直接收到 tag |
| 表单值通常是字符串 | tag 可以是泛型 `T`，例如字符串或数字 |
| 一个组件默认可运行于浏览器 | SwiftUI Picker 仅面向 Apple 平台 |
| Expo Go 可运行就代表跨平台 | Expo Go 支持与组件平台支持是两个概念 |

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将 tag 设计成稳定的业务 ID，而不是依赖可能变化的显示文本。

   ```tsx
   const options = [
     { id: 'apple', label: 'Apple' },
     { id: 'banana', label: 'Banana' },
   ];
   ```

2. 为选项值定义明确类型，避免字符串与数字意外混用。

   ```ts
   type FruitId = 'apple' | 'banana' | 'orange';
   ```

3. 如果项目同时支持 Android，应在组件设计阶段决定使用 universal `Picker`，还是创建按平台拆分的组件，避免在业务页面中到处添加平台判断。

4. 使用 `unversioned` 文档中的 API 前，核对项目 Expo SDK 版本以及对应版本的正式文档。

5. 同时支持 iOS 和 tvOS 时，应将 `wheel` 排除在 tvOS 的样式选择之外。

## 文档未涉及的内容

当前文档未说明以下事项，不应根据本文自行假设：

- Picker 的表单校验方式。
- 禁用整个 Picker 或单个选项的方法。
- 占位符或“未选择”状态。
- 多选功能。
- 异步加载选项。
- 大量选项下的性能表现。
- 重复 tag 的处理方式。
- `selection` 无法匹配任何 tag 时的行为。
- 各种样式在不同 iOS 版本中的视觉差异。
- 自动化测试方法。
- 无障碍属性和屏幕阅读器行为。
- Android 或 Web 的回退机制。
- `Host matchContents` 的完整布局规则。
- `systemImage` 在不同 picker 样式中的具体表现。

## 总结

Expo UI SwiftUI `Picker` 用 React JSX 封装了 Apple 原生 SwiftUI 选择器。其核心数据关系是：

```text
Text 显示选项
   ↓
tag 定义选项值
   ↓
selection 保存当前 tag
   ↓
onSelectionChange 返回新 tag
```

`segmented`、`menu` 和 `wheel` 共享相同的状态管理方式，仅原生展示样式不同。使用时最重要的是确认 Expo SDK 版本、保持 tag 类型和值一致，并注意 SwiftUI 版本只支持 iOS 和 tvOS，其中 `wheel` 不支持 Apple TV。

---

## 文档导航

- **上一页**：[overlay](./99__overlay.md)
- **下一页**：[popover](./101__popover.md)
