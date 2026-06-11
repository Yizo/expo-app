# ExposedDropdownMenuBox：Android 下拉选择菜单

`ExposedDropdownMenuBox` 是 Expo UI 提供的 Android 组件，用于实现带有可自定义锚点的下拉菜单。它基于 Jetpack Compose Material 3 的同名组件，适合在 React Native 中构建 Android 原生风格的选择菜单。

> 本文对应 `@expo/ui` 的 Jetpack Compose API，仅支持 Android，并已包含在 Expo Go 中。

## 文档解决的问题

本文主要说明如何：

- 安装 `@expo/ui`。
- 使用输入框等组件作为下拉菜单的锚点。
- 控制菜单的展开与收起。
- 使用 `DropdownMenuItem` 渲染选项。
- 正确处理非受控 `TextField` 的选中值更新。
- 配置菜单背景、修饰器和关闭回调。

它适合需要在 Android 上实现以下界面的场景：

- 语言选择器。
- 表单选项选择。
- 使用 `TextField` 展示当前选中值的下拉菜单。
- 需要符合 Material 3 原生视觉和交互规范的菜单。

如果需要跨 Android 和其他平台使用统一的选择器，原文档建议使用 Expo UI 的跨平台 `Picker`。在 Android 上，`Picker` 本身构建于 `ExposedDropdownMenuBox` 之上。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。可以将它粗略理解为 Android 原生开发中的 React：

- React 使用 JSX 描述 Web UI。
- Jetpack Compose 使用 Kotlin 函数描述 Android 原生 UI。
- 状态变化后，两者都会重新计算需要展示的界面。

这里虽然通过 TSX 使用组件，但最终渲染的是 Jetpack Compose 原生组件，而不是 DOM 元素。

### Expo UI

Expo UI 允许 React Native 应用通过 React 组件使用部分平台原生 UI。本文组件来自：

```tsx
@expo/ui/jetpack-compose
```

这意味着它属于 Android Jetpack Compose 组件集合，并不是 React Native 核心组件，也不是 Web HTML 组件。

### 锚点

锚点是决定下拉菜单依附位置及触发区域的组件。本文通常使用只读的 `TextField` 作为锚点。

Web 开发中可以将其类比为：

```html
<button>当前选项</button>
<div role="menu">...</div>
```

按钮是菜单的触发元素和定位参照物。在本文组件中，需要通过 `menuAnchor()` 明确标记哪个子组件承担这个角色。

### Modifier

Jetpack Compose 的 Modifier 用于向组件附加布局、交互或行为配置。它可以粗略类比为 React Web 中以下能力的组合：

- CSS 布局和外观设置。
- DOM 事件行为。
- `ref` 或定位相关配置。
- 某些组件增强器。

Expo UI 通过 `modifiers` 数组传入这些配置：

```tsx
modifiers={[menuAnchor()]}
```

`menuAnchor()` 不是 CSS 样式，而是将该组件注册为菜单锚点的行为配置。

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

`expo install` 与直接执行 `npm install` 的作用不完全相同。它会尽量安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，必须先按照 Expo 文档安装 `expo` 和 Expo Modules 支持。仅安装 `@expo/ui` 并不足以让普通 React Native 原生工程自动具备 Expo 模块运行环境。

原文档没有涉及以下内容：

- iOS 安装或配置。
- Android 原生 Gradle 配置。
- Expo 项目创建流程。
- 开发构建与应用商店发布流程。

## 基本用法

完整示例：

```tsx
import {
  DropdownMenuItem,
  ExposedDropdownMenuBox,
  ExposedDropdownMenu,
  Host,
  Text,
  TextField,
} from '@expo/ui/jetpack-compose';
import { menuAnchor } from '@expo/ui/jetpack-compose/modifiers';
import { useState } from 'react';

const LANGUAGES = [
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
];

export default function BasicExposedDropdownMenuBoxExample() {
  const [selected, setSelected] = useState('java');
  const [expanded, setExpanded] = useState(false);

  const selectedLabel =
    LANGUAGES.find(language => language.value === selected)?.label ?? '';

  return (
    <Host matchContents>
      <ExposedDropdownMenuBox
        expanded={expanded}
        onExpandedChange={setExpanded}>
        <TextField
          defaultValue={selectedLabel}
          key={selected}
          readOnly
          modifiers={[menuAnchor()]}
        />

        <ExposedDropdownMenu
          expanded={expanded}
          onDismissRequest={() => setExpanded(false)}>
          {LANGUAGES.map(language => (
            <DropdownMenuItem
              key={language.value}
              onClick={() => {
                setSelected(language.value);
                setExpanded(false);
              }}>
              <DropdownMenuItem.Text>
                <Text>{language.label}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </ExposedDropdownMenu>
      </ExposedDropdownMenuBox>
    </Host>
  );
}
```

## 组件协作关系

这套下拉菜单不是一个独立组件，而是由多个组件协作完成：

```text
Host
└── ExposedDropdownMenuBox
    ├── TextField + menuAnchor()
    └── ExposedDropdownMenu
        └── DropdownMenuItem
            └── DropdownMenuItem.Text
                └── Text
```

各部分职责如下：

| 组件或配置 | 职责 |
|---|---|
| `Host` | 承载 Expo UI 的 Jetpack Compose 内容 |
| `ExposedDropdownMenuBox` | 协调锚点、菜单及展开状态 |
| `TextField` | 展示当前选中项，并充当菜单触发区域 |
| `menuAnchor()` | 将对应组件标记为菜单锚点 |
| `ExposedDropdownMenu` | 下拉菜单容器 |
| `DropdownMenuItem` | 单个可点击选项 |
| `DropdownMenuItem.Text` | 菜单项的文字内容区域 |
| `Text` | 渲染原生文本 |

原文档只在基础示例中展示了 `Host matchContents`，没有进一步解释 `Host` 或 `matchContents` 的完整 API。

## 状态与交互流程

示例使用两个 React 状态：

```tsx
const [selected, setSelected] = useState('java');
const [expanded, setExpanded] = useState(false);
```

- `selected` 保存当前选中项的业务值。
- `expanded` 决定菜单当前是否可见。

### 打开菜单

用户点击带有 `menuAnchor()` 的输入框后，`ExposedDropdownMenuBox` 会通过 `onExpandedChange` 通知新的展开状态：

```tsx
<ExposedDropdownMenuBox
  expanded={expanded}
  onExpandedChange={setExpanded}
>
```

这是受控状态模式，与 React Web 中受控弹窗类似：组件发出状态变化请求，最终显示状态由 React state 决定。

### 选择菜单项

点击选项时需要同时完成两件事：

```tsx
onClick={() => {
  setSelected(language.value);
  setExpanded(false);
}}
```

1. 更新选中值。
2. 主动关闭菜单。

文档示例没有表明选择菜单项后会自动关闭，因此示例显式调用了 `setExpanded(false)`。

### 点击外部或按返回键

菜单请求关闭时会触发：

```tsx
onDismissRequest={() => setExpanded(false)}
```

文档列出的典型触发方式包括：

- 点击菜单外部。
- 按下 Android 返回键。

`onDismissRequest` 表示“菜单请求关闭”，应用仍需在回调中修改 `expanded`，否则受控状态不会真正变为关闭。

## 非受控 TextField 的关键问题

示例中的 `TextField` 使用了：

```tsx
<TextField
  defaultValue={selectedLabel}
  key={selected}
  readOnly
  modifiers={[menuAnchor()]}
/>
```

这里最重要的限制是：

> `defaultValue` 只在组件挂载时读取。

这与 React Web 的非受控 `<input defaultValue="...">` 类似。更新 `defaultValue` 并不保证已挂载输入框中的内容同步更新。

因此示例传入：

```tsx
key={selected}
```

当 `selected` 改变时，组件的 `key` 也会改变。React 会卸载旧的 `TextField` 并创建新实例，新实例在挂载时重新读取 `defaultValue`。

如果遗漏 `key={selected}`，可能出现以下结果：

- `selected` 状态已经更新。
- 菜单项已经切换。
- 输入框仍显示之前的文本。

这是本文明确指出的主要坑点。

`key` 强制重建组件属于当前示例针对非受控 `TextField` 的处理方式。原文档没有介绍受控 `TextField` 的替代写法，也没有说明该组件是否支持使用其他属性直接控制文本。

## ExposedDropdownMenuBox API

导入方式：

```tsx
import { ExposedDropdownMenuBox } from '@expo/ui/jetpack-compose';
```

它是 Material 3 `ExposedDropdownMenuBox` 的 React 封装，仅支持 Android。

### `children`

```ts
ReactNode | undefined
```

子元素应当包含：

- 一个应用了 `menuAnchor()` 的锚点组件。
- 一个 `ExposedDropdownMenu`。
- 菜单内部的 `DropdownMenuItem`。

文档将该属性标记为可选，但从有效组件结构来看，缺少这些子元素就无法形成可交互的下拉菜单。

### `expanded`

```ts
boolean
```

必填属性，表示菜单是否展开：

- `true`：菜单可见。
- `false`：菜单隐藏。

### `onExpandedChange`

```ts
((expanded: boolean) => void) | undefined
```

展开状态发生变化时调用，例如：

- 点击锚点。
- 菜单被关闭。

典型写法：

```tsx
onExpandedChange={setExpanded}
```

由于 `expanded` 由 React state 控制，通常需要提供该回调来接收并保存新状态。

### `modifiers`

```ts
ModifierConfig[] | undefined
```

用于向菜单盒子本身添加 Jetpack Compose Modifier 配置。

原文档没有列出该组件具体支持哪些 Modifier，也没有提供相关示例。

## ExposedDropdownMenu API

`ExposedDropdownMenu` 是显示菜单项的 Material 3 下拉菜单容器，仅支持 Android，并且必须放在 `ExposedDropdownMenuBox` 内部。

### `children`

```ts
ReactNode | undefined
```

菜单的子元素应当是 `DropdownMenuItem`：

```tsx
<ExposedDropdownMenu ...>
  <DropdownMenuItem ... />
</ExposedDropdownMenu>
```

原文档没有说明放入其他类型子组件时的行为。

### `containerColor`

```ts
ColorValue | undefined
```

设置菜单容器的背景颜色。

`ColorValue` 是 React Native 使用的颜色类型，通常可以使用字符串颜色值。当前文档没有提供具体颜色格式示例，也没有说明默认颜色。

### `expanded`

```ts
boolean
```

必填属性，控制菜单是否可见。通常应与外层 `ExposedDropdownMenuBox` 使用相同的状态：

```tsx
<ExposedDropdownMenuBox expanded={expanded}>
  <ExposedDropdownMenu expanded={expanded}>
    {/* 菜单项 */}
  </ExposedDropdownMenu>
</ExposedDropdownMenuBox>
```

**基于文档内容推导：** 如果内外层传入不同的 `expanded` 值，状态协调可能出现异常。因此实际开发中应共享同一个 state，而不是分别维护两套展开状态。

### `onDismissRequest`

```ts
(() => void) | undefined
```

当菜单希望被关闭时触发，包括点击外部或按 Android 返回键。

推荐按照示例更新受控状态：

```tsx
onDismissRequest={() => setExpanded(false)}
```

虽然该属性在类型上是可选的，但如果不处理关闭请求，菜单可能无法按预期响应这些关闭操作。

### `modifiers`

```ts
ModifierConfig[] | undefined
```

用于为菜单容器添加 Modifier 配置。当前文档没有说明可用的具体 Modifier。

## 限制与容易踩坑的地方

### 仅支持 Android

本文两个主要组件都明确标记为仅支持 Android：

- `ExposedDropdownMenuBox`
- `ExposedDropdownMenu`

它们不能被视为跨平台组件。原文档没有说明在 iOS 或 Web 中使用时会报错、忽略渲染还是产生其他行为，因此不应假设它们能够自动降级。

需要跨平台选择器时，应考虑文档提到的 Expo UI `Picker`。

### 必须标记菜单锚点

仅把 `TextField` 放入 `ExposedDropdownMenuBox` 不够，还需要：

```tsx
modifiers={[menuAnchor()]}
```

否则组件无法按照文档要求识别触发和定位菜单的锚点。

### 菜单不能脱离 Box 使用

`ExposedDropdownMenu` 必须位于 `ExposedDropdownMenuBox` 内部。它不是可在任意位置独立使用的普通弹层。

### 展开状态需要完整闭环

至少需要处理以下状态入口：

```tsx
onExpandedChange={setExpanded}
onDismissRequest={() => setExpanded(false)}
```

选中菜单项时也应显式关闭：

```tsx
setExpanded(false);
```

只传入 `expanded` 而不处理这些回调，会让界面成为“状态固定”的受控组件。

### `defaultValue` 不会持续同步

`defaultValue` 只在挂载时读取。使用非受控 `TextField` 展示动态选中值时，必须按照文档示例使用变化的 `key` 强制重新挂载：

```tsx
key={selected}
```

### API 文档没有覆盖完整设计规范

当前文档没有涉及：

- 键盘输入与搜索。
- 禁用状态。
- 表单校验。
- 无障碍属性。
- 菜单最大高度。
- 长列表性能。
- 动画配置。
- 多选模式。
- 空选项处理。
- iOS 和 Web 的替代实现。
- 自动化测试方法。

开发时不能从本文推断这些能力已经存在。

## React Web 开发者最容易误解的地方

### 它不是 HTML `<select>`

`ExposedDropdownMenuBox` 更像由触发器、弹出菜单和菜单项组合而成的受控组件，而不是一个自动管理值与选项的原生 `<select>`。

你需要自己维护：

- 当前业务值。
- 当前显示文本。
- 菜单展开状态。
- 选项点击行为。
- 菜单关闭行为。

### `modifiers` 不等于 `style`

下面的配置不是单纯设置样式：

```tsx
modifiers={[menuAnchor()]}
```

它会赋予组件菜单锚点的语义和行为。遗漏它不仅影响外观，还会破坏组件结构和交互。

### `onDismissRequest` 不等于通知已关闭

该回调表示原生菜单希望关闭。由于菜单是否显示由 `expanded` 控制，React 代码仍要执行：

```tsx
setExpanded(false);
```

这类似受控 Dialog 的 `onOpenChange(false)`：回调只传递意图，状态才是最终事实来源。

### `key` 在这里承担重置原生组件的职责

React Web 中通常不应随意使用变化的 `key` 重建输入框，但当前示例有明确原因：非受控原生 `TextField` 不会在 `defaultValue` 更新后同步文本。

因此这里的 `key` 不是列表渲染标识，而是强制重置组件实例。

### TSX 外观不代表跨平台能力

虽然代码写在 React 组件中，并使用熟悉的 JSX 语法，但底层是 Android Jetpack Compose。是否支持某个平台取决于 Expo UI 组件本身，而不是取决于 React Native 是否能运行在该平台。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，不是原文档直接给出的要求。

### 优先封装业务选择器

**基于经验建议：** 可以在项目中封装一个业务组件，统一管理：

- `selected` 与显示标签的映射。
- `expanded` 状态。
- 菜单项选择后的关闭操作。
- `key={selected}` 的重挂载要求。

这样可以减少不同页面遗漏关闭回调或锚点 Modifier 的概率。

### 保持 value 与 label 分离

示例使用：

```ts
{ label: 'JavaScript', value: 'js' }
```

**基于文档内容推导：** 业务状态应保存稳定的 `value`，界面只展示 `label`。这样修改显示文案时不会改变提交给接口或保存到本地的数据。

### 跨平台项目应提前设计组件边界

**基于经验建议：** 如果应用同时支持 Android 和 iOS，不要在通用页面中直接散布 Jetpack Compose 导入。可以优先使用跨平台 `Picker`，或者在平台组件内部隔离 Android 实现。

### 对非受控输入框进行回归测试

**基于经验建议：** 至少验证以下流程：

1. 打开菜单。
2. 选择与当前值不同的选项。
3. 确认锚点文本立即更新。
4. 确认菜单关闭。
5. 再次打开菜单。
6. 点击外部或按 Android 返回键。
7. 确认菜单正常关闭。

这能覆盖本文暴露出的主要状态同步风险。

## 明确信息与推导信息边界

原文档明确说明：

- 组件用于显示带有自定义锚点的下拉菜单。
- 组件匹配 Jetpack Compose 官方同名组件。
- 组件仅支持 Android，并包含在 Expo Go 中。
- `ExposedDropdownMenu` 必须位于 `ExposedDropdownMenuBox` 内。
- 锚点需要使用 `menuAnchor()`。
- 菜单项应使用 `DropdownMenuItem`。
- `expanded` 控制菜单是否可见。
- `onExpandedChange` 接收展开状态变化。
- `onDismissRequest` 可响应点击外部和返回键。
- 非受控 `TextField` 的 `defaultValue` 只在挂载时读取。
- 选中值变化时应使用 `key={selected}` 强制重新挂载。
- 跨平台场景可以考虑 `Picker`。

本文基于文档内容推导：

- Box 和 Menu 应共享同一个 `expanded` state。
- 业务数据适合分别保存稳定值和显示标签。
- 缺少状态回调会导致受控菜单不能按预期交互。
- 跨平台代码应隔离 Android 专属实现。

上述推导用于解释代码结构及开发影响，不代表原文档承诺了额外 API 行为。

## 总结

使用 `ExposedDropdownMenuBox` 时，需要记住四个核心规则：

1. 它是 Android 专属的 Jetpack Compose 组件，不是跨平台 `<select>`。
2. 锚点必须添加 `menuAnchor()` Modifier。
3. Box、Menu 和关闭回调需要围绕同一个 `expanded` state 工作。
4. 非受控 `TextField` 使用动态 `defaultValue` 时，需要通过 `key={selected}` 重新挂载并刷新显示值。

组件适合构建 Android Material 3 风格的单项下拉选择器。需要跨平台能力时，应优先评估文档所指向的 Expo UI `Picker`。

---

## 文档导航

- **上一页**：[dropdownmenu](./38__dropdownmenu.md)
- **下一页**：[floatingactionbutton](./40__floatingactionbutton.md)
