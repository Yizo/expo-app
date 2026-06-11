# RadioButton：Android 单选按钮组件

`RadioButton` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在一组选项中进行单项选择。它映射到 Android 官方 Jetpack Compose 的 `RadioButton` API。

> 本页属于下一个 Expo SDK 版本的文档，而非当前稳定版文档。原文指出当前最新稳定版本为 SDK 56。  
> 文档修改日期：2026 年 5 月 19 日。

## 文档解决的问题

本文主要说明：

- 如何安装包含 `RadioButton` 的 `@expo/ui` 包。
- 如何创建一个独立的单选按钮。
- 如何按照 Android Compose 的无障碍规范组织单选按钮组。
- `RadioButton` 支持哪些属性。
- 为什么推荐让整行响应点击，而不是只让按钮本身响应点击。

适用场景包括：

- 设置页面中的单项配置。
- 从多个互斥选项中选择一个。
- 需要使用 Android 原生 Jetpack Compose UI 的 Expo 应用。
- 需要兼顾屏幕阅读器和移动端触控体验的单选列表。

## 阅读前需要理解的背景知识

### `@expo/ui` 是什么

`@expo/ui` 提供可在 React 代码中使用的原生 UI 组件。本页使用的是：

```tsx
import { RadioButton } from '@expo/ui/jetpack-compose';
```

这里的 `jetpack-compose` 表明组件基于 Android 的 Jetpack Compose UI 系统，而不是浏览器 DOM。

对于 React Web 开发者，可以将其理解为：

- JSX 和 React 状态管理方式仍然存在。
- 最终渲染的不是 `<input type="radio">` 等 HTML 元素。
- `Column`、`Row` 和 `RadioButton` 最终对应 Android 原生 Compose UI。
- CSS 不再是主要样式机制，布局和行为通过 Compose 组件及 `modifiers` 描述。

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式 UI 框架。它和 React 都使用“状态决定 UI”的思路，但运行环境不同：

| React Web | 本文中的 Jetpack Compose UI |
|---|---|
| 浏览器 DOM | Android 原生 UI |
| `<div>`、`<input>` | `Column`、`Row`、`RadioButton` |
| CSS | Compose modifiers |
| `onClick` / `onChange` | `onClick` 或 `selectable` |
| ARIA 和 HTML 语义 | `selectableGroup`、`role` 等 Compose 语义 |

### `Host` 的作用

示例将 Compose 组件放在 `Host` 中：

```tsx
<Host matchContents>
  {/* Compose UI */}
</Host>
```

从示例可以确定，`Host` 是这些 Jetpack Compose 组件的宿主容器。

`matchContents` 出现在两个示例中，但当前文档没有解释它的完整行为、默认值或布局细节。不能仅根据本页进一步断定其所有尺寸规则。

## 安装

使用项目对应的包管理器执行以下任一命令：

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

这些命令的作用是安装包含 `RadioButton` 的 `@expo/ui` 包。

这里使用 `expo install`，而不是普通的 `npm install`。对于 Expo 项目，这种方式会按照项目使用的 Expo SDK 选择兼容的依赖版本。

> **基于经验建议：** 不要同时执行四条命令。根据项目实际使用的 npm、Yarn、pnpm 或 Bun 选择一条即可。

### 现有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，以支持 Expo Modules。

这意味着 `@expo/ui` 并不是在任意 React Native 工程中安装后就一定可以直接使用。已有原生工程需要先具备 Expo 模块基础设施。

当前文档没有涉及：

- 创建 Expo 项目的命令。
- 在现有 React Native 工程中安装 Expo Modules 的具体步骤。
- iOS 或 Android 原生工程文件需要进行哪些修改。
- `@expo/ui` 对 Android SDK、Gradle 或 Kotlin 版本的要求。

## 基础用法：独立按钮

```tsx
import { useState } from 'react';
import { Host, RadioButton } from '@expo/ui/jetpack-compose';

export default function BasicRadioButton() {
  const [selected, setSelected] = useState(false);

  return (
    <Host matchContents>
      <RadioButton selected={selected} onClick={() => setSelected(!selected)} />
    </Host>
  );
}
```

这个示例使用 React 的 `useState` 保存选中状态：

1. `selected` 表示当前按钮是否选中。
2. `selected={selected}` 将状态传给原生单选按钮。
3. 点击按钮时执行 `setSelected(!selected)`。
4. 状态变化触发 React 重新渲染，按钮的选中外观随之更新。

这种写法展示了一个可以独立开关的按钮。不过，标准单选按钮通常用于“多个选项只能选择一个”的场景，因此实际业务中更推荐下一节的单选组模式。

> **基于文档内容推导：** 这个独立示例允许再次点击已选中的按钮将其取消。它演示的是组件状态控制方式，并不自动提供单选组的互斥约束。

## 推荐用法：单选按钮组

原文推荐按照 Jetpack Compose 的无障碍规范组织单选组：

```tsx
import { useState } from 'react';
import { Host, Column, Row, RadioButton, Text } from '@expo/ui/jetpack-compose';
import {
  selectable,
  selectableGroup,
  fillMaxWidth,
  height,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RadioGroup() {
  const [selectedOption, setSelectedOption] = useState('Calls');
  const options = ['Calls', 'Missed', 'Friends'];

  return (
    <Host matchContents>
      <Column modifiers={[selectableGroup()]}>
        {options.map(label => (
          <Row
            key={label}
            verticalAlignment="center"
            modifiers={[
              fillMaxWidth(),
              height(56),
              selectable(
                label === selectedOption,
                () => setSelectedOption(label),
                'radioButton'
              ),
              padding(16, 0, 16, 0),
            ]}>
            <RadioButton selected={label === selectedOption} />
            <Text modifiers={[padding(16, 0, 0, 0)]}>{label}</Text>
          </Row>
        ))}
      </Column>
    </Host>
  );
}
```

### 状态如何保证单选

示例只保存一个字符串：

```tsx
const [selectedOption, setSelectedOption] = useState('Calls');
```

每个选项都通过以下表达式判断自己是否选中：

```tsx
label === selectedOption
```

点击某一行时，状态被替换为该行的 `label`：

```tsx
setSelectedOption(label)
```

因此，同一时间只有与 `selectedOption` 相等的选项会被标记为选中。

对于 React Web 开发者，这类似于一组具有相同 `name` 的 radio input，但这里的互斥关系由 React 状态显式维护，而不是浏览器自动提供。

### 为什么使用 `Column`

```tsx
<Column modifiers={[selectableGroup()]}>
```

`Column` 用于纵向排列多个选项，作用近似于使用纵向布局的容器。

`selectableGroup()` 告诉无障碍服务：该容器中的选项属于同一个可选择组。屏幕阅读器因此能以一组单选项的方式理解它们。

它不仅影响视觉结构，还提供语义信息。只把多个 `RadioButton` 放在一起，并不等于已经建立了完整的无障碍单选组语义。

### 为什么把 `selectable` 放在 `Row` 上

每一个选项由一个 `Row` 表示：

```tsx
<Row
  modifiers={[
    selectable(
      label === selectedOption,
      () => setSelectedOption(label),
      'radioButton'
    ),
  ]}>
```

`selectable` 的三个示例参数分别表示：

1. 当前行是否处于选中状态。
2. 用户选择该行时执行的回调。
3. 该行的语义角色是 `radioButton`。

这样，按钮和文字所在的整行都可以点击，而不是只能点击单选按钮的小圆形区域。

这对移动端尤其重要，因为手指触控不如鼠标精确。扩大触控区域可以降低误触和无法点中的概率。

### 为什么 `RadioButton` 没有 `onClick`

推荐示例使用：

```tsx
<RadioButton selected={label === selectedOption} />
```

这里故意没有给 `RadioButton` 传入 `onClick`，因为点击行为已经由外层 `Row` 的 `selectable` 处理。

这样设计可以：

- 让整行都成为触控区域。
- 让标签文字也可以触发选择。
- 将交互行为集中在一个位置。
- 遵循 Compose 的无障碍推荐模式。

不要同时让 `Row` 和内部 `RadioButton` 分别处理同一次选择操作，否则可能造成重复回调或语义混乱。

### 布局 modifiers

示例使用以下 modifiers：

| Modifier | 示例中的作用 |
|---|---|
| `selectableGroup()` | 将 `Column` 声明为单选项分组 |
| `fillMaxWidth()` | 让每一行占满可用宽度 |
| `height(56)` | 将每一行高度设置为 56 |
| `selectable(...)` | 提供选中状态、点击处理和单选按钮角色 |
| `padding(16, 0, 16, 0)` | 为整行添加左右内边距 |
| `padding(16, 0, 0, 0)` | 在按钮与文字之间增加间距 |

当前文档仅展示了这些 modifier 的用法，没有说明：

- 长度值使用的具体单位。
- modifier 的完整参数定义。
- modifier 顺序是否会影响所有场景。
- 自定义颜色、尺寸或动画的方法。

## API 说明

导入方式：

```tsx
import { RadioButton } from '@expo/ui/jetpack-compose';
```

组件类型为 React 元素，属性类型是 `RadioButtonProps`。

### `selected`

```ts
selected: boolean
```

必填属性，用于表示按钮是否选中。

`RadioButton` 是受控组件：示例通过 React 状态计算并传入 `selected`，组件不会替应用维护业务选择结果。

### `onClick`

```ts
onClick?: () => void
```

可选属性，在按钮被点击时调用。

适合独立按钮示例。对于推荐的单选组模式，应让外层 `Row` 通过 `selectable` 处理交互，此时不向按钮传入 `onClick`。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

可选属性，用于向组件应用 Compose modifier 配置。

它的定位可以类比 React Web 中用于控制样式、布局及交互行为的属性集合，但不能简单等同于 `className` 或内联 CSS，因为 modifier 还可能携带语义和交互能力。

当前文档没有列出 `RadioButton` 支持的具体 modifier、modifier 的组合规则或完整 `ModifierConfig` 类型定义。

## 平台与版本限制

### 仅支持 Android

API 部分明确标记 `RadioButton` 的支持平台为 Android。页面顶部同时标记：

- Android
- Included in Expo Go

这表示该组件可以在 Android 上使用，并包含在 Expo Go 中。

不能根据本页认为它支持：

- iOS
- Web
- macOS 或其他平台

如果项目同时支持 Android、iOS 和 Web，需要自行规划非 Android 平台的替代 UI。当前文档没有提供跨平台封装方案。

### 文档版本不是当前稳定版本

页面明确警告：这是“下一个 SDK 版本”的文档。原文同时将 SDK 56 标记为最新稳定版本。

实际开发时，需要确认项目安装的 Expo SDK 对应版本是否已经包含本页描述的 API。不能只看到示例就假定当前项目版本一定支持。

> **基于经验建议：** 安装或升级前先检查项目的 Expo SDK 版本，并查看该版本对应的 `@expo/ui` 文档，避免把未发布版本的 API 用到稳定项目中。

## React Web 开发者最容易误解的地方

### 它不是 HTML radio input

`RadioButton` 不会渲染为：

```html
<input type="radio">
```

因此，不应直接套用浏览器表单的理解：

- 没有文档所述的 HTML `name` 分组机制。
- 没有浏览器自动完成的 radio 互斥选择。
- 本页没有表单提交或 `FormData` 集成说明。
- 无障碍语义通过 Compose modifier 建立，而不是 HTML 标签和 ARIA 属性。

### `selected` 不等于 Web 的 `defaultChecked`

`selected` 是当前选中状态，应当由 React 状态持续传入。它不是只在首次渲染时生效的默认值。

### 多个按钮不会自动形成单选组

从示例可以看出，互斥选择由同一个 `selectedOption` 状态实现；分组的无障碍语义由 `selectableGroup()` 实现。

因此，创建正确的单选组至少涉及两个层面：

- 业务状态层：保证只有一个值被选中。
- 无障碍交互层：声明分组、角色和整行选择行为。

### Modifier 不只是样式

`fillMaxWidth`、`height` 和 `padding` 主要影响布局；`selectable` 和 `selectableGroup` 还影响交互与无障碍语义。

因此，不应把 modifier 全部当作 CSS 工具。

## 实际开发中的使用方式

对于设置项或筛选项，建议采用以下结构：

1. 使用一个值保存整个单选组的结果。
2. 使用 `Column` 容纳所有选项。
3. 给 `Column` 添加 `selectableGroup()`。
4. 每个选项使用一个包含按钮和标签的 `Row`。
5. 将 `selectable` 添加到 `Row`，并指定 `radioButton` 角色。
6. 只把 `selected` 传给内部 `RadioButton`，不再传入 `onClick`。
7. 为整行设置足够的宽度和高度，提供更大的触控区域。

> **基于文档内容推导：** 实际业务中，选项最好使用稳定的标识符保存状态，而不是依赖展示文案。这样即使文案变化或进行国际化，也不会影响业务值。

例如可以将示例中的字符串数组扩展为：

```tsx
const options = [
  { value: 'calls', label: '所有来电' },
  { value: 'missed', label: '未接来电' },
  { value: 'friends', label: '联系人来电' },
];
```

这是对文档状态管理模式的工程化延伸，不是原文提供的 API 要求。

## 文档明确说明与合理推导

### 文档明确说明

- `RadioButton` 用于从一组选项中选择一个选项。
- 组件映射到官方 Jetpack Compose `RadioButton` API。
- 组件由 `@expo/ui` 提供。
- 支持 Android，并包含在 Expo Go 中。
- 已有 React Native 项目需要先安装 Expo。
- 推荐使用 `selectableGroup()` 建立单选组语义。
- 推荐在每个 `Row` 上使用 `selectable` 和 `radioButton` 角色。
- 推荐让外层行处理点击，不给内部按钮传入 `onClick`。
- 让整行响应点击可以提供更大的触控区域。
- `selected` 是必填布尔值。
- `onClick` 和 `modifiers` 是可选属性。
- 本页是下一个 SDK 版本的文档，不是当前稳定版文档。

### 基于文档内容推导

- 单选互斥关系由应用的 React 状态实现，而不是组件组自动维护。
- 独立示例允许按钮在选中与未选中之间切换，不代表标准单选组应允许取消全部选择。
- 正确的单选组同时需要业务状态互斥和无障碍分组语义。
- 跨平台项目需要为 iOS 和 Web 准备替代实现。
- 业务状态使用稳定标识符通常比直接使用展示文案更合适。

## 当前文档未涉及的内容

本页没有说明以下内容：

- iOS 和 Web 的对应组件。
- 单选按钮的颜色、大小、禁用状态或主题定制。
- 表单校验与数据提交。
- 自动化测试方式。
- Expo SDK 升级步骤。
- `Host` 和 `matchContents` 的完整 API。
- 各 modifier 的完整类型和单位规则。
- Android 原生工程的详细配置。
- 动态增删选项或处理无默认选项的方法。

## 总结

`RadioButton` 是面向 Android Jetpack Compose 的原生单选按钮。React 仍负责保存和更新状态，但布局、点击区域和无障碍语义需要通过 Compose 组件及 modifiers 构建。

独立按钮可以直接使用 `selected` 和 `onClick`。真正的单选组则应采用 `Column + selectableGroup` 和 `Row + selectable` 的结构，让整行处理点击，内部 `RadioButton` 只根据状态展示选中结果。

使用前还要确认两个限制：该 API 仅明确支持 Android，而且当前页面描述的是下一个 Expo SDK 版本。

---

## 文档导航

- **上一页**：[pulltorefreshbox](./56__pulltorefreshbox.md)
- **下一页**：[rnhostview](./58__rnhostview.md)
