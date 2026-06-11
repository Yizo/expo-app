# Expo UI `ToggleButton`：Android 原生切换按钮

> 原文档修改日期：2026 年 5 月 19 日  
> 文档状态：面向下一个 Expo SDK 版本的未发布版本文档。原文指出，当前稳定版本应参考 SDK 56 对应页面。

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中，通过 `@expo/ui` 的 Jetpack Compose 接口显示 Android 原生 Material 3 切换按钮。

它主要解决以下需求：

- 显示可在“选中”和“未选中”之间切换的按钮。
- 在按钮中放置文字或图标。
- 使用无背景、填充或描边等不同视觉样式。
- 自定义选中、未选中和禁用状态的颜色。
- 禁止用户操作按钮。

这不是 React Web 中的 DOM `<button>`，而是由 Android Jetpack Compose 渲染的原生 UI 组件。

## 适用场景与平台限制

适合以下场景：

- Expo 项目需要在 Android 上使用原生 Material 3 切换按钮。
- 按钮用于表达“是否启用”“是否选中”“是否收藏”等二元状态。
- 希望 UI 接近 Android 官方 Jetpack Compose 组件。
- 需要通过 React state 控制原生按钮状态。

原文明确标注：

- 支持平台：**Android**
- 包含在：**Expo Go**
- 包名：`@expo/ui`

因此，当前文档中的组件不能被视为 iOS 和 Web 通用组件。如果项目需要跨平台 UI，应另外设计平台适配方案。

## 阅读前需要理解的概念

### Expo UI

`@expo/ui` 是 Expo 提供的 UI 包。本页使用其中的 Jetpack Compose 接口：

```tsx
import { ToggleButton } from '@expo/ui/jetpack-compose';
```

`jetpack-compose` 表示这些组件最终由 Android 的 Jetpack Compose 原生 UI 系统渲染。

### Jetpack Compose 与 Material 3

Jetpack Compose 可以类比为 Android 原生开发中的声明式 UI 框架。它和 React 都采用“根据状态描述界面”的思路，但 Compose 运行在 Android 原生 UI 环境中，而不是浏览器 DOM 中。

Material 3 是 Google 的设计系统。本文组件与官方 Jetpack Compose Toggle Button API 相对应，因此它们采用 Android Material 3 的外观和交互语义。

### 受控状态

按钮是否选中由 `checked` 决定：

```tsx
<ToggleButton checked={checked} onCheckedChange={setChecked}>
  <Text>Favorite</Text>
</ToggleButton>
```

这与 React Web 中的受控表单组件类似：

1. `checked` 是当前状态。
2. 用户点击后，组件调用 `onCheckedChange`。
3. 回调更新 React state。
4. 新状态通过 `checked` 再次传给组件。

`onCheckedChange` 本身不会代替应用保存状态。

## 安装

根据项目使用的包管理器执行其中一条命令：

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

`expo install` 会按照当前 Expo SDK 选择合适的包版本。不要把以上四条命令全部执行一遍。

如果是在已有的普通 React Native 项目中使用，需要先按照 Expo 文档安装 `expo` 和 Expo Modules 支持。仅安装 `@expo/ui` 不一定足够。

当前文档未涉及：

- iOS 原生工程配置。
- Android Gradle 配置。
- 最低 Android 系统版本。
- 是否需要重新生成或编译原生工程。
- Expo SDK 与 `@expo/ui` 的具体版本对应表。

## 四种按钮组件

Expo UI 提供四个与官方 Jetpack Compose API 对应的组件。它们共享 `ToggleButtonProps`。

| 组件 | 视觉特点 | 适合表达的内容 |
| --- | --- | --- |
| `ToggleButton` | 通用切换按钮，可包含文本等内容 | “收藏”“开启”等带文字的操作 |
| `IconToggleButton` | 只有图标，没有背景 | 视觉强调程度较低的图标操作 |
| `FilledIconToggleButton` | 图标按钮带实心背景 | 需要较强视觉强调的操作 |
| `OutlinedIconToggleButton` | 有边框但没有填充 | 中等强调程度的图标操作 |

后三种组件的主要区别是视觉表现，不是状态管理方式。

## 基础文字按钮

```tsx
import { useState } from 'react';
import { Host, ToggleButton, Text } from '@expo/ui/jetpack-compose';

export default function BasicToggleButtonExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <ToggleButton checked={checked} onCheckedChange={setChecked}>
        <Text>Favorite</Text>
      </ToggleButton>
    </Host>
  );
}
```

代码流程：

1. `useState(false)` 将按钮初始化为未选中。
2. `checked` 控制原生按钮的选中状态。
3. 用户触发切换时，`onCheckedChange` 接收到新的布尔值。
4. `setChecked` 更新 React state。
5. `Text` 作为按钮内部显示的内容。

示例使用 `Host` 包裹 Jetpack Compose 组件，并传入 `matchContents`。原文没有在本页提供 `Host` 或 `matchContents` 的完整 API 定义，因此不能仅根据本页确定它们的所有布局行为。

## 图标按钮的不同样式

```tsx
import { useState } from 'react';
import {
  Host,
  IconToggleButton,
  FilledIconToggleButton,
  OutlinedIconToggleButton,
  Icon,
  Row,
} from '@expo/ui/jetpack-compose';

const starIcon = require('./assets/star.png');
```

三个按钮分别维护自己的状态：

```tsx
const [checked1, setChecked1] = useState(false);
const [checked2, setChecked2] = useState(true);
const [checked3, setChecked3] = useState(false);
```

布局与按钮内容如下：

```tsx
<Host matchContents>
  <Row horizontalArrangement={{ spacedBy: 8 }}>
    <IconToggleButton checked={checked1} onCheckedChange={setChecked1}>
      <Icon source={starIcon} size={24} />
    </IconToggleButton>

    <FilledIconToggleButton checked={checked2} onCheckedChange={setChecked2}>
      <Icon source={starIcon} size={24} />
    </FilledIconToggleButton>

    <OutlinedIconToggleButton checked={checked3} onCheckedChange={setChecked3}>
      <Icon source={starIcon} size={24} />
    </OutlinedIconToggleButton>
  </Row>
</Host>
```

其中：

- `require('./assets/star.png')` 引入本地图片资源。
- `Icon` 显示该图片，并将尺寸设置为 `24`。
- `Row` 将按钮水平排列。
- `horizontalArrangement={{ spacedBy: 8 }}` 在相邻项目之间设置间距。
- 每个按钮必须使用自己的 `checked` 和状态更新函数，才能独立切换。

原文没有进一步说明尺寸和间距所使用的具体单位，也没有在本页完整定义 `Icon`、`Row` 和图片资源格式限制。

## 自定义颜色

通过 `colors` 属性可以覆盖选中和未选中状态的颜色：

```tsx
<ToggleButton
  checked={checked}
  onCheckedChange={setChecked}
  colors={{
    checkedContainerColor: '#4CAF50',
    checkedContentColor: '#FFFFFF',
    containerColor: '#E0E0E0',
    contentColor: '#333333',
  }}>
  <Text>{checked ? 'ON' : 'OFF'}</Text>
</ToggleButton>
```

示例同时根据状态切换按钮文字：

```tsx
<Text>{checked ? 'ON' : 'OFF'}</Text>
```

颜色配置含义如下：

| 属性 | 状态 | 影响区域 |
| --- | --- | --- |
| `checkedContainerColor` | 选中 | 按钮容器背景 |
| `checkedContentColor` | 选中 | 文字或图标等内容 |
| `containerColor` | 未选中 | 按钮容器背景 |
| `contentColor` | 未选中 | 文字或图标等内容 |
| `disabledContainerColor` | 禁用 | 按钮容器背景 |
| `disabledContentColor` | 禁用 | 文字或图标等内容 |

所有颜色属性都是可选的，类型为 React Native 的 `ColorValue`。示例使用十六进制颜色字符串，但原文未在本页列出 `ColorValue` 支持的全部格式。

## 禁用按钮

```tsx
import { Host, ToggleButton, Text } from '@expo/ui/jetpack-compose';

export default function DisabledToggleButtonExample() {
  return (
    <Host matchContents>
      <ToggleButton checked={false} enabled={false}>
        <Text>Disabled</Text>
      </ToggleButton>
    </Host>
  );
}
```

`enabled={false}` 表示不允许用户交互。`enabled` 默认值为 `true`。

示例没有传入 `onCheckedChange`，因为按钮已经被禁用。需要注意，`enabled` 和 `checked` 是两个不同维度：

- `checked` 表示是否选中。
- `enabled` 表示用户是否可以操作。

禁用按钮仍然可以是选中状态，例如：

```tsx
<ToggleButton checked={true} enabled={false}>
  <Text>Enabled by policy</Text>
</ToggleButton>
```

这是由两个属性的独立语义推导出的用法，并非原文提供的示例。

## API 说明

### 导入方式

```tsx
import {
  ToggleButton,
  IconToggleButton,
  FilledIconToggleButton,
  OutlinedIconToggleButton,
} from '@expo/ui/jetpack-compose';
```

四个组件都只标注支持 Android，并共享以下属性。

### `ToggleButtonProps`

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | 是 | 无 | 指定按钮是否选中 |
| `children` | `React.ReactNode` | 是 | 无 | 指定按钮内部显示的内容 |
| `colors` | `ToggleButtonColors` | 否 | 未说明 | 配置不同状态下的颜色 |
| `enabled` | `boolean` | 否 | `true` | 控制是否允许用户交互 |
| `modifiers` | `ModifierConfig[]` | 否 | 未说明 | 为组件配置 Compose modifiers |
| `onCheckedChange` | `(checked: boolean) => void` | 否 | 无 | 选中状态变化时调用 |

### `modifiers`

Jetpack Compose 中的 Modifier 通常用于布局、尺寸、间距或其他组件行为，可以粗略类比 React Web 中组合使用的样式和布局属性。

但是，本页只给出了 `ModifierConfig[]` 类型，没有说明：

- 支持哪些 modifier。
- modifier 的执行或组合顺序。
- 具体配置结构。
- 各 modifier 是否适用于全部四个按钮。

因此，使用该属性前需要查询 Expo UI 的 Modifier 专门文档，不能根据本页自行假定配置格式。

### `onCheckedChange` 是可选属性

API 将 `onCheckedChange` 标为可选。省略它时仍然必须提供 `checked`，但本页没有明确说明：对于启用状态的按钮，省略回调后用户点击时是否会产生临时视觉变化。

在需要交互的实际代码中，应像示例一样同时提供：

```tsx
checked={checked}
onCheckedChange={setChecked}
```

此处“应同时提供”是**基于文档示例和受控状态模式的开发建议**。

### `ToggleButton.DefaultIconSize`

API 还列出了：

```tsx
ToggleButton.DefaultIconSize
```

原文将其类型展示为与 `number` 有关的 React Element，但没有提供用途、值、调用方式或示例。因此，只能确认该成员出现在 API 中，不能根据当前页面确定应该如何使用它。

## React Web 开发者容易误解的地方

### 1. 它不是 Web 按钮

这里没有 DOM、CSS class、伪类或浏览器事件。组件由 Android Jetpack Compose 渲染，Web 中的以下做法不能直接套用：

- `className`
- CSS `:hover`、`:checked`
- DOM `onChange` 事件对象
- `event.target.checked`
- 浏览器开发者工具中的 DOM 检查

`onCheckedChange` 直接接收新的布尔值：

```tsx
onCheckedChange={(checked) => {
  // checked 已经是 boolean
}}
```

### 2. `checked` 不等于 `enabled`

选中状态和交互能力互相独立。不要通过 `checked={false}` 禁止点击，应使用：

```tsx
enabled={false}
```

### 3. `children` 使用原生 Compose 内容

示例使用来自同一入口的 `Text` 和 `Icon`：

```tsx
import { Text, Icon } from '@expo/ui/jetpack-compose';
```

不能仅凭 React JSX 语法相同，就假设任意 Web 元素或任意 React Native 组件都可以作为子节点。当前页面没有给出跨组件嵌套兼容规则。

### 4. 四种组件不是四种业务状态

它们表示不同的视觉强调方式，并不自动对应“成功”“警告”或“错误”等业务语义。业务状态仍需通过 `checked`、内容和颜色表达。

### 5. Expo Go 支持不代表跨平台支持

“Included in Expo Go”表示可以在 Expo Go 提供的相应环境中使用，不表示该组件同时支持 iOS 和 Web。组件 API 明确标注为 Android。

## 注意事项与限制

1. 本页属于下一个 SDK 版本的文档，不一定与当前稳定 SDK 完全一致。原文指定 SDK 56 页面为当前稳定参考。
2. 所有按钮组件明确只支持 Android。
3. 在已有 React Native 项目中使用前，需要先安装 Expo Modules。
4. `checked` 是受控属性，交互场景通常需要由应用保存并更新状态。
5. 自定义颜色时应同时考虑选中、未选中和禁用状态，否则不同状态可能继续使用默认主题颜色。
6. `modifiers`、`Host`、`Row`、`Icon` 和 `DefaultIconSize` 的完整行为没有在本页展开。
7. 当前文档未涉及无障碍属性、测试方式、动画行为、主题继承规则和跨平台替代组件。

## 实际开发建议

以下为**基于文档内容推导**或**基于经验建议**，不是原文直接规定。

- **基于文档内容推导：**将 `checked` 保存在拥有业务状态的组件中，避免按钮显示状态与真实业务状态不一致。
- **基于文档内容推导：**多个按钮需要独立切换时，应分别维护状态；如果业务上只能单选，则需要在上层统一管理，而不是为每个按钮保留互不相关的布尔值。
- **基于经验建议：**先根据视觉强调程度选择普通、无背景、填充或描边版本，再统一配置项目中的状态颜色。
- **基于经验建议：**颜色自定义时检查文字或图标与背景的对比度，并同时验证禁用状态。
- **基于经验建议：**跨 iOS、Android 和 Web 的项目应封装自己的业务组件，在 Android 内部使用这些 Compose 按钮，其他平台使用对应实现。
- **基于经验建议：**项目使用稳定 Expo SDK 时，应优先查看对应版本的文档，避免直接依赖未发布版本中的 API。

## 文档明确内容与推导内容

### 原文明确说明

- `@expo/ui` 提供四种 Toggle Button 组件。
- 这些组件与官方 Jetpack Compose Toggle Button API 对应。
- 组件用于显示 Android 原生 Material 3 切换按钮。
- 支持 Android，并包含在 Expo Go 中。
- 可以显示文字或图标。
- 可以通过 `colors` 自定义各状态颜色。
- 可以通过 `enabled={false}` 禁止交互。
- 四种组件共享 `ToggleButtonProps`。
- 已有 React Native 项目需要先安装 Expo。

### 本文基于文档推导

- 这些按钮采用与 React 受控组件相似的状态管理方式。
- 多个按钮要独立工作，需要分别维护状态。
- `checked` 与 `enabled` 可以组合出“已选中但不可操作”等状态。
- 跨平台项目需要为非 Android 平台准备其他实现。
- 交互按钮最好同时提供 `checked` 和 `onCheckedChange`。

## 总结

`@expo/ui/jetpack-compose` 的 Toggle Button 系列让 React Native 代码能够声明并控制 Android 原生 Material 3 切换按钮。

实际使用时需要把握三个重点：

1. 使用 `checked` 与 `onCheckedChange` 构成受控状态。
2. 根据视觉强调程度选择普通、无背景、填充或描边组件。
3. 这些 API 当前明确面向 Android，不能直接作为 iOS 和 Web 的通用实现。

---

## 文档导航

- **上一页**：[textfield](./69__textfield.md)
- **下一页**：[tooltip](./71__tooltip.md)
