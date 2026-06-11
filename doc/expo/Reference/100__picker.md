# Picker：使用 Expo UI 构建原生 SwiftUI 选择器

> 原文档修改日期：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一版本 Expo SDK；当前稳定版本为 SDK 56

## 文档解决的问题

`Picker` 用于从一组选项中选择一个值，例如：

- 从水果列表中选择一种水果
- 通过分段控件切换视图
- 从菜单中选择设置项
- 使用滚轮选择某个值

这里的 `Picker` 不是浏览器中的 `<select>`，而是由 Expo UI 提供、最终呈现为 Apple 原生 SwiftUI Picker 的 React 组件。

它适合需要以下能力的 iOS 或 tvOS 应用：

- 使用 Apple 平台的原生交互和视觉效果
- 在 React 代码中管理选中状态
- 根据场景切换分段、菜单或滚轮等 Picker 样式

如果需要同一套组件跨多个平台使用，应考虑文档提到的通用版 `Picker`。通用版会根据平台渲染对应的原生组件。

## 阅读前需要理解的背景

### SwiftUI 是什么

SwiftUI 是 Apple 的原生 UI 框架，主要用于构建 iOS、macOS 和 tvOS 等平台的界面。

Expo UI 的 SwiftUI 组件允许开发者在 React Native/Expo 项目中，通过 React JSX 使用部分 SwiftUI 原生组件。虽然代码写法类似 React，但实际渲染目标不是浏览器 DOM。

### `Picker` 与 Web `<select>` 的区别

React Web 中通常这样创建选择器：

```tsx
<select value={value} onChange={event => setValue(event.target.value)}>
  <option value="apple">Apple</option>
</select>
```

Expo UI SwiftUI Picker 的对应关系是：

| React Web | Expo UI SwiftUI |
| --- | --- |
| `<select>` | `<Picker>` |
| `<option>` | 带有 `tag` modifier 的 `<Text>` |
| `value` | `selection` |
| `onChange` | `onSelectionChange` |
| CSS 外观 | `pickerStyle` 等 modifier |

需要特别注意：`onSelectionChange` 直接接收选中项的 `tag` 值，不会收到浏览器事件对象。

### Modifier 是什么

SwiftUI 使用 modifier 配置组件的样式和行为。Expo UI 将其映射为 React 组件的 `modifiers` 数组：

```tsx
modifiers={[pickerStyle('segmented')]}
```

这和 React Web 中通过 `className` 或 `style` 设置外观不同。`pickerStyle` 决定 Picker 使用哪种 Apple 原生展示形式。

### `Host` 的作用

示例将 Picker 放在 `Host` 中：

```tsx
<Host matchContents>
  <Picker>{/* ... */}</Picker>
</Host>
```

`Host` 是 Expo UI SwiftUI 内容的宿主容器，用于将 SwiftUI 组件嵌入 React Native 界面。

示例中的 `matchContents` 表示宿主尺寸与内部内容匹配。

> `Host` 和 `matchContents` 的完整 API、布局规则及边界行为，当前文档未展开说明。

## 安装

在 Expo 项目中安装 `@expo/ui`：

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

应根据项目实际使用的包管理器选择其中一条命令，不需要全部执行。

这里使用 `expo install`，而不是直接执行普通的 `npm install`。它负责安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，需要先按照 Expo 的说明将 `expo` 安装到项目中。仅安装 `@expo/ui` 不足以让一个没有 Expo Modules 基础设施的原生 React Native 项目直接使用该组件。

> 当前文档没有提供 iOS 原生工程、Pod 安装或构建配置的具体步骤。

## 基本工作流程

一个受控 Picker 的实现过程如下：

1. 定义每个可选值。
2. 使用 React state 保存当前选中值。
3. 为每个子项设置唯一且类型一致的 `tag`。
4. 将 state 传给 `selection`。
5. 在 `onSelectionChange` 中更新 state。
6. 使用 `pickerStyle` 选择展示样式。

完整结构如下：

```tsx
import { useState } from 'react';
import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

const options = ['Apple', 'Banana', 'Orange'];

export default function PickerExample() {
  const [selectedTag, setSelectedTag] = useState(options[0]);

  return (
    <Host matchContents>
      <Picker
        modifiers={[pickerStyle('segmented')]}
        label="Select a fruit"
        selection={selectedTag}
        onSelectionChange={selection => {
          setSelectedTag(selection);
        }}
      >
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

其中存在两个不同的标识：

- `key={option}`：React 列表协调所需的 key。
- `tag(option)`：Picker 用于标识选项值的原生语义。

`key` 不能代替 `tag`。Picker 的选择状态由 `tag`、`selection` 和 `onSelectionChange` 共同关联。

## Picker 样式

Expo UI Picker 与 Apple 官方 SwiftUI Picker API 对应，并通过 `pickerStyle` 支持不同的 Picker 样式。

### Segmented：分段选择器

```tsx
<Picker
  modifiers={[pickerStyle('segmented')]}
  label="Select a fruit"
  selection={selectedTag}
  onSelectionChange={setSelectedTag}
>
  {options.map(option => (
    <Text key={option} modifiers={[tag(option)]}>
      {option}
    </Text>
  ))}
</Picker>
```

分段选择器将选项并排展示，适合：

- 选项数量较少
- 选项文字较短
- 用户需要快速切换
- 当前所有选项应直接可见

它在 Web 中接近 segmented control 或单选按钮组，而不是下拉框。

### Menu：菜单选择器

将样式修改为：

```tsx
modifiers={[pickerStyle('menu')]}
```

菜单样式不会持续展示全部选项，适合：

- 选项较多
- 页面横向空间有限
- 选择操作不需要频繁切换

其用途接近 Web 下拉选择器，但视觉、展开方式和交互行为由 Apple 原生组件决定，不能假设与 HTML `<select>` 完全一致。

### Wheel：滚轮选择器

将样式修改为：

```tsx
modifiers={[pickerStyle('wheel')]}
```

滚轮样式适合通过上下滚动选值的场景。

**明确限制：滚轮样式不能在 Apple TV 上使用。**

因此，如果应用同时支持 iOS 和 tvOS，不能在两个平台上无条件使用 `pickerStyle('wheel')`。需要选择共同支持的样式，或者针对平台采用不同实现。

> 当前文档没有给出平台判断代码，也没有说明其他样式在不同系统版本上的具体视觉差异。

## API 说明

### 导入组件

```tsx
import { Picker } from '@expo/ui/swift-ui';
```

`Picker` 是泛型组件，其选中值类型可表示为 `T`：

```ts
PickerProps<T>
```

`T` 对应选项的 `tag` 类型，同时也是 `selection` 和回调参数的类型。

### `children`

```ts
children?: React.ReactNode
```

Picker 的选项内容。文档建议使用带有 `tag` modifier 的 `Text` 组件：

```tsx
<Picker>
  <Text modifiers={[tag('option1')]}>Option 1</Text>
  <Text modifiers={[tag(0)]}>Option 3</Text>
</Picker>
```

`Text` 显示用户看到的内容，`tag` 则是程序实际处理的选项值。

文档示例表明 `tag` 可以使用不同类型的值，例如字符串或数字。但在同一个 Picker 中混合这些类型会使状态类型和业务判断更复杂。

> **基于经验建议：** 同一 Picker 的所有 `tag` 应使用统一类型，并保证值可以唯一识别选项。

### `label`

```ts
label?: string | React.ReactNode
```

Picker 的标签，可以是字符串或 React 节点：

```tsx
<Picker label="Select a fruit">{/* ... */}</Picker>
```

标签不是选中值，也不用于标识选项。

> 当前文档没有说明不同 `pickerStyle` 下标签的具体显示位置，以及标签是否会在所有样式中可见。

### `selection`

```ts
selection?: T
```

当前选中选项的 `tag` 值：

```tsx
selection={selectedTag}
```

它对应 React Web 受控表单元素中的 `value`。

**基于文档内容推导：** `selection` 应当与某个子项的 `tag` 值对应，否则组件无法将该值关联到一个明确选项。原文档没有说明匹配失败时的具体表现。

### `onSelectionChange`

```ts
onSelectionChange?: (selection: T) => void
```

用户选择选项后触发，参数是该选项的 `tag` 值：

```tsx
onSelectionChange={selection => {
  setSelectedTag(selection);
}}
```

也可以在类型兼容时简写为：

```tsx
onSelectionChange={setSelectedTag}
```

与 React Web 不同，这里不需要读取：

```tsx
event.target.value
```

因为回调参数本身就是选择结果。

### `systemImage`

```ts
systemImage?: SFSymbol
```

设置 Apple 的 SF Symbol 系统图标名称，例如：

```tsx
<Picker systemImage="heart.fill">{/* ... */}</Picker>
```

文档列出的名称示例包括：

- `photo`
- `heart.fill`
- `star.circle`

`SFSymbol` 类型来自 `sf-symbols-typescript` 类型定义。

> 当前文档没有展示 `systemImage` 的完整示例，也没有说明它在各 Picker 样式中的具体位置或显示效果。

### 继承的 modifier 属性

`Picker` 继承 `CommonViewModifierProps`，因此可以使用 Expo UI SwiftUI 提供的通用视图 modifier。

> 当前文档仅给出该继承关系，没有列出所有通用 modifier。具体能力需要查阅 SwiftUI modifiers 文档。

## 类型一致性

Picker 的关键约束可以概括为：

```ts
tag 的值类型 === selection 的类型 === onSelectionChange 参数类型
```

例如，使用字符串：

```tsx
const [selection, setSelection] = useState('apple');

<Picker selection={selection} onSelectionChange={setSelection}>
  <Text modifiers={[tag('apple')]}>Apple</Text>
  <Text modifiers={[tag('banana')]}>Banana</Text>
</Picker>
```

或者统一使用数字：

```tsx
const [selection, setSelection] = useState(0);

<Picker selection={selection} onSelectionChange={setSelection}>
  <Text modifiers={[tag(0)]}>Apple</Text>
  <Text modifiers={[tag(1)]}>Banana</Text>
</Picker>
```

不建议混用：

```tsx
<Text modifiers={[tag('apple')]}>Apple</Text>
<Text modifiers={[tag(1)]}>Banana</Text>
```

虽然文档示例显示 `tag` 可以接受字符串或数字，但没有建议在同一个 Picker 中混合类型。

## 限制与容易踩坑的地方

### 平台范围有限

SwiftUI 版 `Picker` 明确支持：

- iOS
- tvOS

它不是面向 Android 或 Web 的通用组件。即使 TypeScript 代码可以被共享，也不能据此认为组件能够在所有平台运行。

需要跨平台时，应评估文档所指向的通用版 `Picker`。

### Wheel 不支持 Apple TV

这是文档唯一明确指出的样式级平台限制：

```tsx
pickerStyle('wheel')
```

不能用于 Apple TV。

### 选项必须通过 `tag` 关联值

只渲染文本并不等于建立了正确的选择值：

```tsx
<Text>Apple</Text>
```

标准示例使用的是：

```tsx
<Text modifiers={[tag('Apple')]}>Apple</Text>
```

`onSelectionChange` 返回的是 `tag` 值，不是显示文本、数组下标或 React `key`，除非你主动将这些值设置为 `tag`。

### 原生样式不能按 Web 思维理解

`pickerStyle('segmented')`、`pickerStyle('menu')` 和 `pickerStyle('wheel')` 选择的是 Apple 原生组件样式。

不能默认以下 Web 经验仍然成立：

- 可以通过普通 CSS 精确修改每个内部元素
- 不同系统版本的视觉表现完全一致
- Web 与 iOS 上的键盘、焦点和菜单行为相同
- Android 会自动获得完全相同的组件

当前文档没有介绍自定义样式能力、无障碍行为、测试方式或系统版本差异。

### 文档面向下一 SDK 版本

页面明确说明这是下一版本 SDK 的文档，而稳定版本链接指向 SDK 56。

因此，在实际项目中应核对项目使用的 Expo SDK 版本，避免直接把未发布版本的 API 用法应用到稳定项目。

## 实际开发中的使用方式

### 选择合适的数据值

显示文本可以变化，但业务值最好保持稳定：

```tsx
const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
];

<Picker
  selection={selectedFruit}
  onSelectionChange={setSelectedFruit}
  modifiers={[pickerStyle('menu')]}
>
  {options.map(option => (
    <Text key={option.value} modifiers={[tag(option.value)]}>
      {option.label}
    </Text>
  ))}
</Picker>
```

这是**基于经验建议**：使用稳定业务值作为 `tag`，不要依赖可能变化的展示文案。

### 根据交互场景选择样式

- 少量、短文本、频繁切换：`segmented`
- 选项较多或空间有限：`menu`
- iOS 上适合滚动选择的内容：`wheel`
- 同时支持 iOS 和 tvOS：避免无条件使用 `wheel`

这些场景判断中，样式名称和 Apple TV 限制来自原文档；具体选型建议属于**基于文档内容推导**。

### 跨平台项目先确定组件边界

如果项目同时支持 Android、Web、iOS 或 tvOS，应先决定：

- 使用通用版 Picker，让组件根据平台选择原生实现；
- 或仅在 Apple 平台使用 SwiftUI Picker，并为其他平台提供独立实现。

这是**基于文档内容推导**。原文仅明确提供了通用版 Picker 的入口，没有规定具体的跨平台架构。

## 文档未涉及的内容

当前文档没有说明以下内容：

- Android 和 Web 的 SwiftUI Picker 实现
- Picker 的表单校验方案
- 禁用状态和只读状态
- 默认值与空选项的行为
- `selection` 找不到对应 `tag` 时的表现
- 动态增删选项时的状态处理
- 无障碍属性和屏幕阅读器行为
- 自动化测试方法
- 各种 Picker 样式的完整可配置项
- SF Symbol 在不同样式中的显示规则
- iOS 和 tvOS 不同系统版本间的视觉差异
- `Host` 的完整布局规则
- 原生构建和发布流程

## 总结

Expo UI SwiftUI `Picker` 让开发者可以在 React/Expo 代码中使用 Apple 原生选择器。它的核心关系是：

```text
子项 tag
    ↓
Picker selection
    ↓
onSelectionChange 返回同一类型的值
```

使用时最重要的事项包括：

- 从 `@expo/ui/swift-ui` 导入 Picker。
- 使用 `Host` 承载 SwiftUI 内容。
- 为每个选项配置 `tag`。
- 用 `selection` 和 `onSelectionChange` 管理受控状态。
- 通过 `pickerStyle` 选择分段、菜单或滚轮样式。
- SwiftUI 版本只支持 iOS 和 tvOS。
- `wheel` 样式不支持 Apple TV。
- 跨平台项目应评估通用版 Picker。
- 使用下一版本文档前，应核对项目的 Expo SDK 版本。

---

## 文档导航

- **上一页**：[overlay](./99__overlay.md)
- **下一页**：[popover](./101__popover.md)
