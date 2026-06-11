# Expo UI Jetpack Compose Checkbox 学习文档

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目的 Android 界面中，使用 `@expo/ui` 提供的 Jetpack Compose 原生复选框组件。

它主要解决以下需求：

- 创建普通的选中 / 未选中复选框。
- 自定义复选框颜色。
- 创建支持“全选、全不选、部分选中”的三态复选框。
- 扩大可点击区域，同时保持正确的无障碍语义。
- 控制组件是否可用，并通过 `modifiers` 配置原生界面行为。

该组件目前只支持 **Android**，并且已经包含在 **Expo Go** 中。

> 文档同时指出：如果需要跨平台复选框，应使用通用版 [`Checkbox`](https://docs.expo.dev/versions/latest/sdk/ui/universal/checkbox)，由它针对不同平台渲染相应的原生组件。

## 阅读前需要理解的背景

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的原生 UI 组件库。

本文使用的是：

```tsx
import { Checkbox } from '@expo/ui/jetpack-compose';
```

这里的 `jetpack-compose` 表示组件底层对应 Android 的 **Jetpack Compose** UI 系统。

可以将其理解为：

- React Web 使用 DOM 元素和 CSS。
- React Native 通常使用 `View`、`Text` 等跨平台组件。
- Jetpack Compose 是 Android 原生的声明式 UI 框架。
- `@expo/ui/jetpack-compose` 让 React 代码可以使用由 Jetpack Compose 实现的 Android 原生组件。

Expo UI 的 `Checkbox` API 与 Android 官方 Jetpack Compose `Checkbox` API 保持一致。

### `Host` 的作用

示例中的组件需要放在 `Host` 内：

```tsx
<Host matchContents>
  <Checkbox value={checked} />
</Host>
```

`Host` 是 Expo UI 的原生组件承载容器，可以理解为 React Native 界面与 Jetpack Compose 内容之间的宿主边界。

`matchContents` 表示让 `Host` 的尺寸匹配其内部内容。本文没有进一步说明 `Host` 的完整 API。

### 受控组件

本文中的 `Checkbox` 是受控组件：

```tsx
<Checkbox
  value={checked}
  onCheckedChange={setChecked}
/>
```

这与 React Web 中的受控表单元素相似：

- `value` 决定当前是否选中。
- `onCheckedChange` 接收用户操作后的新状态。
- React state 是状态的最终来源。

它不能仅依靠回调自行保存业务状态，调用方需要更新传入的 `value`。

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

`expo install` 与直接执行 `npm install` 的侧重点不同：它会按照当前 Expo SDK 选择兼容的依赖版本。

如果是在现有的裸 React Native 项目中安装，必须先为项目安装和配置 `expo`，才能使用 Expo Modules。

本文未涉及：

- iOS 原生工程配置。
- Android 原生工程的手动配置。
- 构建命令和发布流程。
- Expo SDK 版本兼容范围。
- 测试配置。

## 普通复选框

### 基本用法

```tsx
import { useState } from 'react';
import { Host, Checkbox } from '@expo/ui/jetpack-compose';

export default function CheckboxExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Checkbox value={checked} onCheckedChange={setChecked} />
    </Host>
  );
}
```

执行流程如下：

1. `checked` 初始为 `false`，复选框显示为未选中。
2. 用户点击复选框。
3. `onCheckedChange` 收到新的布尔值。
4. `setChecked` 更新 React state。
5. 组件重新渲染，新值通过 `value` 传回原生复选框。

对于 React Web 开发者，需要注意这里使用的是 `value`，而不是 HTML `<input type="checkbox">` 常见的 `checked` 属性。

### 自定义颜色

```tsx
<Checkbox
  value={checked}
  onCheckedChange={setChecked}
  colors={{
    checkedColor: '#6200EE',
    checkmarkColor: '#FFFFFF',
  }}
/>
```

`colors` 用于分别设置复选框不同元素和状态下的颜色。

示例中：

- `checkedColor`：选中时复选框主体颜色。
- `checkmarkColor`：选中标记的颜色。

颜色值使用 React Native 的 `ColorValue`，示例使用十六进制颜色字符串。本文未列出 `ColorValue` 支持的全部格式。

## 三态复选框与“全选”功能

### 三种状态

普通 `Checkbox` 只有两种状态：

```ts
true
false
```

`TriStateCheckbox` 支持三种状态：

```ts
'on' | 'off' | 'indeterminate'
```

它们分别表示：

| 状态 | 含义 |
| --- | --- |
| `'on'` | 全部选中 |
| `'off'` | 全部未选中 |
| `'indeterminate'` | 部分选中，状态不确定 |

`indeterminate` 通常用于父级“全选”控件。当部分子项被选中时，父级既不能显示为全部选中，也不能显示为全部未选中。

### 计算父级状态

文档示例使用三个独立布尔值保存子项状态：

```tsx
const [child1, setChild1] = useState(false);
const [child2, setChild2] = useState(false);
const [child3, setChild3] = useState(false);
```

然后根据所有子项计算父级状态：

```tsx
const parentState =
  child1 && child2 && child3
    ? 'on'
    : !child1 && !child2 && !child3
      ? 'off'
      : 'indeterminate';
```

判断规则是：

1. 所有子项都是 `true`，父级为 `'on'`。
2. 所有子项都是 `false`，父级为 `'off'`。
3. 其他组合都表示部分选中，父级为 `'indeterminate'`。

父级状态是从子项状态派生出来的，并没有额外使用一个 `useState` 保存。

> **基于文档内容推导：** 将父级状态作为派生值，可以避免父级状态与子项状态不一致。例如，子项已经全部选中，但单独保存的父级状态仍然是 `'off'`。

### 点击“全选”行

父级行的切换逻辑是：

```tsx
const newState = parentState !== 'on';

setChild1(newState);
setChild2(newState);
setChild3(newState);
```

因此：

- 当前已经全部选中，再点击会取消全部选择。
- 当前为全部未选中或部分选中，再点击会选择全部项目。

`TriStateCheckbox` 只负责显示计算后的父级状态：

```tsx
<TriStateCheckbox state={parentState} />
```

### 使用 `toggleable` 扩大点击区域

文档建议把 `toggleable` modifier 应用到整个 `Row`：

```tsx
<Row
  modifiers={[
    toggleable(
      parentState === 'on',
      handleToggle,
      { role: 'checkbox' }
    ),
  ]}>
  <TriStateCheckbox state={parentState} />
  <Text>Select all</Text>
</Row>
```

这样用户点击复选框或旁边的文字，都可以触发切换。

这类似于 React Web 中用 `<label>` 包裹 checkbox 和文字，使文字也成为可点击区域。不过这里不是 HTML `<label>`，而是通过 Jetpack Compose modifier 为整个 `Row` 添加切换行为和语义。

`toggleable` 的三个参数在示例中分别承担：

1. 当前是否处于选中状态。
2. 用户点击时执行的函数。
3. 无障碍配置，例如 `{ role: 'checkbox' }`。

`role: 'checkbox'` 告诉辅助技术该行在交互上是一个复选框，而不只是普通布局容器。

### 避免重复处理点击

当点击行为已经放在 `Row` 的 `toggleable` 上时，文档明确要求：

- 不要再给内部 `Checkbox` 设置 `onCheckedChange`。
- 不要再给内部 `TriStateCheckbox` 设置 `onClick`。

正确写法：

```tsx
<Row modifiers={[toggleable(child1, () => setChild1(!child1), { role: 'checkbox' })]}>
  <Checkbox value={child1} />
  <Text>Option 1</Text>
</Row>
```

错误思路是同时让 `Row` 和内部 `Checkbox` 处理同一次交互，这可能造成重复切换或重复执行副作用。

## API 说明

组件从以下入口导入：

```tsx
import {
  Checkbox,
  TriStateCheckbox,
} from '@expo/ui/jetpack-compose';
```

### `Checkbox`

普通二态复选框，仅支持 Android。

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `value` | `boolean` | 是 | 无 | 当前是否选中 |
| `onCheckedChange` | `(value: boolean) => void` | 否 | 无 | 选中状态变化时调用 |
| `enabled` | `boolean` | 否 | `true` | 是否允许用户操作 |
| `colors` | `CheckboxColors` | 否 | 无 | 设置不同状态和元素的颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 无 | 设置 Jetpack Compose modifier |

虽然 `onCheckedChange` 是可选属性，但如果组件需要直接响应用户点击，通常需要提供该回调并更新 `value`。

当交互由外层 `Row` 的 `toggleable` 管理时，可以只传 `value`：

```tsx
<Checkbox value={child1} />
```

### `TriStateCheckbox`

三态复选框，仅支持 Android。

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `state` | `ToggleableState` | 是 | 无 | 当前三态值 |
| `onClick` | `() => void` | 否 | 无 | 点击时调用 |
| `enabled` | `boolean` | 否 | `true` | 是否允许用户操作 |
| `colors` | `CheckboxColors` | 否 | 无 | 设置不同状态和元素的颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 无 | 设置 Jetpack Compose modifier |

需要注意两个组件的回调名称不同：

```tsx
// 普通 Checkbox
onCheckedChange={(value) => {}}

// TriStateCheckbox
onClick={() => {}}
```

`TriStateCheckbox` 的 `onClick` 不会直接提供下一个状态。调用方需要根据业务规则计算点击后应该如何更新子项或父级状态。

### `ToggleableState`

类型定义为：

```ts
type ToggleableState = 'on' | 'off' | 'indeterminate';
```

只能使用这三个字符串值。不要向 `TriStateCheckbox.state` 传入 `true`、`false` 或其他字符串。

### `CheckboxColors`

```ts
type CheckboxColors = {
  checkedColor?: ColorValue;
  checkmarkColor?: ColorValue;
  disabledCheckedColor?: ColorValue;
  disabledIndeterminateColor?: ColorValue;
  disabledUncheckedColor?: ColorValue;
  uncheckedColor?: ColorValue;
};
```

各属性的用途如下：

| 属性 | 适用状态 |
| --- | --- |
| `checkedColor` | 启用且选中时的主体颜色 |
| `checkmarkColor` | 选中标记的颜色 |
| `uncheckedColor` | 启用且未选中时的颜色 |
| `disabledCheckedColor` | 禁用且选中时的颜色 |
| `disabledIndeterminateColor` | 禁用且处于部分选中状态时的颜色 |
| `disabledUncheckedColor` | 禁用且未选中时的颜色 |

原文档只将这些属性描述为复选框核心元素的颜色，没有进一步说明默认颜色、主题继承方式或每种颜色对应的具体绘制区域。

### `modifiers`

`modifiers` 的类型是：

```ts
ModifierConfig[]
```

Modifier 是 Jetpack Compose 用来添加布局、交互和语义行为的配置机制。本文实际展示了 `toggleable`：

```tsx
import { toggleable } from '@expo/ui/jetpack-compose/modifiers';
```

然后通过数组传入：

```tsx
modifiers={[
  toggleable(value, onToggle, { role: 'checkbox' }),
]}
```

本文没有列出其他可用 modifier，也没有说明多个 modifier 的执行顺序。

## 限制和容易踩坑的地方

### 仅支持 Android

本文中的 Jetpack Compose `Checkbox` 和 `TriStateCheckbox` 都只支持 Android。

不能因为组件代码使用 TSX 编写，就认为它天然支持 iOS 和 Web。TSX 只是声明组件的方式，底层实际渲染的是 Android Jetpack Compose 组件。

需要跨平台时，应考虑文档提到的 universal `Checkbox`。

### `Checkbox` 和 `TriStateCheckbox` 使用不同状态类型

普通组件使用布尔值：

```tsx
<Checkbox value={true} />
```

三态组件使用字符串联合类型：

```tsx
<TriStateCheckbox state="indeterminate" />
```

两者不能直接互换。

### 三态状态不会自动从子项计算

`TriStateCheckbox` 不会观察其他复选框并自动变成 `'indeterminate'`。调用方必须计算并传入 `state`。

组件负责展示状态，业务代码负责决定状态。

### 不要在父子两层同时绑定交互

如果整个 `Row` 使用了 `toggleable`，内部复选框就只负责显示状态，不应再绑定自己的点击回调。

这是本文最明确的交互警告之一。

### 禁用状态需要显式设置

通过以下属性禁用组件：

```tsx
<Checkbox value={checked} enabled={false} />
```

默认值为 `true`。

原文档没有说明外层 `Row` 使用 `toggleable` 时，内部组件的 `enabled={false}` 是否会自动禁用整行。因此，不应假定内部组件的禁用状态能够控制外层 modifier。

> **基于文档内容推导：** 当交互由外层 `Row` 管理时，禁用逻辑也需要在外层交互配置中统一处理，否则可能出现复选框看似禁用，但整行仍可点击的情况。具体实现方式需要参考 `toggleable` modifier 的完整文档。

## React Web 开发者的关键认知转换

| React Web 习惯 | 本文中的对应方式 |
| --- | --- |
| `<input type="checkbox">` | Expo UI `Checkbox` |
| `checked={value}` | `value={value}` |
| `onChange={(event) => event.target.checked}` | `onCheckedChange={(value) => ...}` |
| `<label>` 扩大点击区域 | 给 `Row` 添加 `toggleable` |
| CSS 状态选择器 | 通过 `colors` 和原生组件属性配置 |
| `indeterminate` DOM 属性 | `TriStateCheckbox state="indeterminate"` |
| HTML ARIA / 标签语义 | modifier 中设置 `{ role: 'checkbox' }` |

最需要避免的误解是：这些组件不是浏览器表单元素，没有 DOM、CSS 选择器或 `event.target.checked`。事件回调直接提供值，布局与交互通过 React Native / Jetpack Compose 能力实现。

## 实际开发中的使用方式

### 独立开关项

对于协议确认、功能选项等单个布尔状态，使用普通 `Checkbox`：

```tsx
<Checkbox
  value={accepted}
  onCheckedChange={setAccepted}
/>
```

### 带文字的设置项

如果希望文字区域也可以点击，应由外层 `Row` 管理交互，并让内部复选框只显示状态：

```tsx
<Row
  modifiers={[
    toggleable(enabled, () => setEnabled(!enabled), {
      role: 'checkbox',
    }),
  ]}>
  <Checkbox value={enabled} />
  <Text>Enable notifications</Text>
</Row>
```

### 分组全选

使用以下数据流：

1. 分别保存每个子项状态。
2. 根据子项计算父级三态值。
3. `TriStateCheckbox` 显示父级状态。
4. 点击父级时批量更新所有子项。
5. 将点击行为放在整行上，避免父子两层重复处理。

> **基于经验建议：** 实际项目中选项数量较多时，可使用数组或对象保存选中状态，并通过 `every`、`some` 计算父级状态，避免为每个选项分别创建 state。该做法不是当前文档明确提供的实现。

## 文档明确内容与推导内容

### 文档明确说明

- 组件由 `@expo/ui` 提供。
- 底层对应官方 Jetpack Compose Checkbox API。
- 该页面中的组件只支持 Android。
- 组件包含在 Expo Go 中。
- 普通 `Checkbox` 使用布尔状态。
- `TriStateCheckbox` 支持 `'on'`、`'off'` 和 `'indeterminate'`。
- `TriStateCheckbox` 适用于“全选”模式。
- 可以通过 `colors` 自定义颜色。
- 应对整行使用 `toggleable`，以扩大点击区域并提供正确的无障碍语义。
- 外层已经使用 `toggleable` 时，不应再给内部复选框绑定点击回调。
- 现有 React Native 项目需要先安装 Expo Modules 所需的 `expo`。

### 基于文档内容推导

- 父级三态状态适合作为子项状态的派生值，而不是重复保存。
- 当交互由外层 `Row` 管理时，禁用逻辑也应统一考虑外层行为。
- `TriStateCheckbox` 负责展示状态，不负责自动管理全选业务逻辑。
- React state 是受控复选框的状态来源。

## 总结

`@expo/ui/jetpack-compose` 提供了 Android 原生风格的普通复选框和三态复选框：

- 独立布尔选择使用 `Checkbox`。
- 全选和部分选中场景使用 `TriStateCheckbox`。
- 状态由 React 代码管理并通过属性传入。
- 带标签的交互行应使用 `Row` 配合 `toggleable`。
- 外层管理点击时，内部组件不要再次绑定回调。
- 该组件只支持 Android；跨平台项目应评估 universal `Checkbox`。

---

## 文档导航

- **上一页**：[carousel](./31__carousel.md)
- **下一页**：[chip](./33__chip.md)
