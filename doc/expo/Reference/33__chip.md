# Expo UI Jetpack Compose：Chip 组件学习文档

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中使用 `@expo/ui` 提供的 Android Chip 组件。

Chip 是一种紧凑的可交互 UI 元素，通常用于：

- 触发快捷操作
- 筛选内容
- 展示和删除用户输入
- 提供动态建议

`@expo/ui` 的 Chip 组件与 Android 官方 Jetpack Compose Chip API 对应，共有四种：

| 组件 | 主要用途 |
| --- | --- |
| `AssistChip` | 帮助用户执行操作或启动任务 |
| `FilterChip` | 从一组选项中筛选内容 |
| `InputChip` | 表示用户输入的数据，例如标签 |
| `SuggestionChip` | 提供与上下文相关的动态建议 |

## 平台和使用场景

文档明确标注：

- 仅支持 Android
- 包含在 Expo Go 中
- npm 包为 `@expo/ui`

这意味着它不是跨平台 Chip 组件。不能根据本文内容推断它可以直接运行于 iOS 或 Web。

### 适合使用的场景

- Android 页面中的快捷操作入口
- 搜索结果类型筛选
- 标签、联系人或关键词展示
- 聊天快捷回复
- 搜索词补全和推荐

如果项目必须在 Android、iOS 和 Web 上保持一致，本文没有提供跨平台实现方案。

## 阅读前需要理解的背景知识

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 工具包。可以将它类比为 Android 原生开发领域中的 React：

- React 使用组件描述 Web UI
- Jetpack Compose 使用可组合组件描述 Android 原生 UI

本文中的 Chip 最终对应 Android Jetpack Compose 组件，而不是浏览器中的 HTML 元素。

### Expo UI

`@expo/ui` 允许 React Native / Expo 代码使用平台原生 UI 组件。本文从以下入口导入 Android Jetpack Compose 组件：

```tsx
import {
  AssistChip,
  FilterChip,
  InputChip,
  SuggestionChip,
} from '@expo/ui/jetpack-compose';
```

`jetpack-compose` 路径已经表明这些组件面向 Android。

### Expo Go

Expo Go 是用于运行和预览 Expo 项目的移动端应用。文档标注 Chip 已包含在 Expo Go 中，因此使用 Expo Go 测试时不需要自行把该原生模块编译进客户端。

文档没有进一步说明 Expo Go 的版本兼容范围。

### dp

`elevation` 和边框宽度使用 `dp`：

- `dp` 是 Android 的密度无关像素单位。
- 它的目标是在不同屏幕密度上维持接近一致的视觉尺寸。
- 它不是 Web CSS 中的 `px`。

## 安装

根据使用的包管理器执行其中一条命令：

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

这里使用的是 `expo install`，而不是普通的 `npm install`。

它负责安装适合当前 Expo 项目的依赖版本。四条命令效果相同，只需选择与项目包管理器对应的一条。

### 已有 React Native 项目的额外要求

如果是在现有 React Native 项目中安装，文档明确要求先为项目安装 Expo，并完成 Expo Modules 接入。

这类项目通常也称为 bare React Native 项目。它们不像标准 Expo 项目那样默认具备 Expo 模块运行环境，因此仅安装 `@expo/ui` 可能不够。

本文没有给出接入 Expo Modules 的具体步骤，只提供了相关文档入口。

## Chip 的组合式结构

Chip 的文本和图标通过子组件插槽传入，而不是通过类似下面的普通属性传入：

```tsx
<FilterChip label="Images" />
```

实际写法是：

```tsx
<FilterChip selected={selected} onClick={handleClick}>
  <FilterChip.Label>
    <Text>Images</Text>
  </FilterChip.Label>
</FilterChip>
```

这是一种组合组件 API：

- `Label`：标签内容
- `LeadingIcon`：前置图标
- `TrailingIcon`：后置图标
- `Avatar`：头像，仅在 `InputChip` 的子元素说明中出现

对于 React Web 开发者，可以将其理解为“具名插槽”。它仍然通过 React `children` 组合组件，但每种子组件表达不同的语义位置。

## 四种 Chip 的用法

### AssistChip：辅助操作

`AssistChip` 用于帮助用户执行操作或启动主要任务，例如：

- 预订航班
- 打开地图
- 根据用户刚刚的输入提供临时操作

```tsx
import { Host, AssistChip, Icon, Text } from '@expo/ui/jetpack-compose';

export default function AssistChipExample() {
  return (
    <Host matchContents>
      <AssistChip onClick={() => console.log('Opening flight booking...')}>
        <AssistChip.Label>
          <Text>Book Flight</Text>
        </AssistChip.Label>

        <AssistChip.LeadingIcon>
          <Icon source={require('./assets/flight.xml')} size={18} />
        </AssistChip.LeadingIcon>
      </AssistChip>
    </Host>
  );
}
```

关键点：

- `onClick` 响应点击。
- 标签放在 `AssistChip.Label` 中。
- 前置图标放在 `AssistChip.LeadingIcon` 中。
- 示例图标来自本地 `./assets/flight.xml` 文件。
- `enabled` 默认为 `true`。

虽然事件名与 Web React 的 `onClick` 相同，但它响应的是 Android 原生触摸交互，不是浏览器鼠标事件。

### FilterChip：筛选状态

`FilterChip` 用于从一组选项中筛选内容，常见于：

- 搜索栏附近
- 商品条件筛选
- 内容类型选择

```tsx
import { useState } from 'react';
import { Host, FilterChip, Text } from '@expo/ui/jetpack-compose';

export default function FilterChipExample() {
  const [selected, setSelected] = useState(false);

  return (
    <Host matchContents>
      <FilterChip
        selected={selected}
        onClick={() => setSelected(!selected)}>
        <FilterChip.Label>
          <Text>Images</Text>
        </FilterChip.Label>
      </FilterChip>
    </Host>
  );
}
```

`selected` 是必填的布尔值，但组件不会自动替应用保存选择状态。示例使用 React `useState` 管理状态：

1. 将当前状态传给 `selected`。
2. 在 `onClick` 中更新状态。
3. React 重新渲染组件。
4. Chip 根据新状态显示选中或未选中样式。

这与 Web 中受控 checkbox 或 toggle button 的模式相近。

需要注意，`FilterChip.enabled` 是可选属性，但文档没有声明其默认值。

### InputChip：用户输入和删除

`InputChip` 表示一条离散的用户输入，例如：

- 标签
- 联系人
- 关键词
- 已选择的分类

```tsx
import { useState } from 'react';
import {
  Host,
  InputChip,
  Icon,
  Text,
  FlowRow,
} from '@expo/ui/jetpack-compose';

export default function InputChipExample() {
  const [chips, setChips] = useState(['Work', 'Travel', 'News']);

  return (
    <Host matchContents>
      <FlowRow horizontalArrangement={{ spacedBy: 8 }}>
        {chips.map(label => (
          <InputChip
            key={label}
            selected
            onClick={() =>
              setChips(prev => prev.filter(c => c !== label))
            }>
            <InputChip.Label>
              <Text>{label}</Text>
            </InputChip.Label>

            <InputChip.TrailingIcon>
              <Icon source={require('./assets/close.xml')} size={18} />
            </InputChip.TrailingIcon>
          </InputChip>
        ))}
      </FlowRow>
    </Host>
  );
}
```

示例流程如下：

1. `chips` 数组保存当前标签。
2. `map` 将每个标签渲染为 `InputChip`。
3. 点击 Chip 后，通过 `filter` 从数组中删除对应标签。
4. 组件重新渲染，标签从界面中消失。

文档所说的“可以被移除”，并不表示组件会自动删除数据。删除行为由应用在 `onClick` 中实现。

其他要点：

- `selected` 默认为 `false`。
- `enabled` 默认为 `true`。
- 示例将 `selected` 简写为 `selected={true}`。
- `TrailingIcon` 中展示关闭图标。
- `FlowRow` 用于排列多个 Chip，并设置 `8` 的水平间距。

文档没有展开说明 `FlowRow` 的换行规则及完整 API。

### SuggestionChip：动态建议

`SuggestionChip` 用于缩小用户意图范围，例如：

- 聊天快捷回复
- 搜索条件建议
- 根据上下文生成的推荐操作

```tsx
import { Host, SuggestionChip, Text } from '@expo/ui/jetpack-compose';

export default function SuggestionChipExample() {
  return (
    <Host matchContents>
      <SuggestionChip
        onClick={() => console.log('Searching nearby...')}>
        <SuggestionChip.Label>
          <Text>Nearby</Text>
        </SuggestionChip.Label>
      </SuggestionChip>
    </Host>
  );
}
```

它与 `AssistChip` 都能触发操作，但语义不同：

- `AssistChip` 强调帮助用户完成任务。
- `SuggestionChip` 强调根据当前上下文提供建议。

`SuggestionChip` 不提供 `selected` 属性，因此不适合直接表示持续的选中状态。

## 公共属性

四种 Chip 共享以下主要属性。

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 放置标签、图标或头像插槽 |
| `border` | `ChipBorder` | 配置边框 |
| `colors` | 对应的颜色类型 | 配置容器、标签、图标和选择状态颜色 |
| `elevation` | `number` | 设置以 dp 为单位的高度层级或阴影效果 |
| `enabled` | `boolean` | 控制是否允许交互 |
| `modifiers` | `ModifierConfig[]` | 向原生组件应用 Modifier 配置 |
| `onClick` | `() => void` | 点击时执行回调 |

### `children`

不同组件允许的插槽有所区别：

| 组件 | 文档列出的插槽 |
| --- | --- |
| `AssistChip` | `Label`、`LeadingIcon`、`TrailingIcon` |
| `FilterChip` | `Label`、`LeadingIcon`、`TrailingIcon` |
| `InputChip` | `Label`、`Avatar`、`TrailingIcon` |
| `SuggestionChip` | `Label`、`Icon` |

本文没有提供所有插槽的独立 API 说明或完整示例。

### `enabled`

设置为 `false` 时，Chip 不可点击或交互：

```tsx
<AssistChip enabled={false} onClick={handleClick}>
  {/* slots */}
</AssistChip>
```

文档明确给出的默认值：

- `AssistChip`：`true`
- `InputChip`：`true`
- `SuggestionChip`：`true`
- `FilterChip`：未说明默认值

不能仅根据其他组件的行为断定 `FilterChip` 的默认值。

### `selected`

只有以下组件支持：

| 组件 | 是否必填 | 默认值 |
| --- | --- | --- |
| `FilterChip` | 是 | 不适用，调用方必须传入 |
| `InputChip` | 否 | `false` |

`AssistChip` 和 `SuggestionChip` 没有 `selected` 属性。

### `elevation`

```tsx
<AssistChip elevation={4}>
  {/* slots */}
</AssistChip>
```

数值单位为 Android `dp`。文档没有说明有效范围，也没有说明不同数值对应的具体阴影视觉效果。

### `modifiers`

`modifiers` 的类型是：

```ts
ModifierConfig[]
```

它用于向组件应用 Jetpack Compose Modifier 配置。对于 React Web 开发者，可以把 Modifier 粗略理解为原生组件的一组布局、尺寸或行为修饰配置。

但本文没有列出：

- 支持哪些 Modifier
- Modifier 的执行顺序
- 如何配置具体 Modifier
- 它与 React Native `style` 的对应关系

因此不能仅依靠本文编写完整的 `modifiers` 配置。

## 边框配置

所有 Chip 都可通过 `border` 接收 `ChipBorder`：

```ts
type ChipBorder = {
  color?: ColorValue;
  width?: number;
};
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `color` | `ColorValue` | 边框颜色 |
| `width` | `number` | 边框宽度，单位为 dp，默认值为 `1` |

`ColorValue` 是 React Native 的颜色类型，而不是仅限 CSS 颜色字符串。

文档没有说明未提供 `color` 时使用什么默认颜色。

## 颜色配置

每种 Chip 都使用独立的颜色配置类型。

### `AssistChipColors`

```ts
type AssistChipColors = {
  containerColor?: ColorValue;
  labelColor?: ColorValue;
  leadingIconContentColor?: ColorValue;
  trailingIconContentColor?: ColorValue;
};
```

可分别设置容器、标签、前置图标和后置图标颜色。

### `FilterChipColors`

```ts
type FilterChipColors = {
  containerColor?: ColorValue;
  iconColor?: ColorValue;
  labelColor?: ColorValue;
  selectedContainerColor?: ColorValue;
  selectedLabelColor?: ColorValue;
  selectedLeadingIconColor?: ColorValue;
  selectedTrailingIconColor?: ColorValue;
};
```

它包含选中和未选中颜色，是四种 Chip 中与选择状态关系最明确的一组配置。

### `InputChipColors`

```ts
type InputChipColors = {
  containerColor?: ColorValue;
  labelColor?: ColorValue;
  leadingIconColor?: ColorValue;
  trailingIconColor?: ColorValue;
  selectedContainerColor?: ColorValue;
  selectedLabelColor?: ColorValue;
  selectedLeadingIconColor?: ColorValue;
  selectedTrailingIconColor?: ColorValue;
};
```

由于 `InputChip` 支持 `selected`，它也可以为选中状态分别设置颜色。

### `SuggestionChipColors`

```ts
type SuggestionChipColors = {
  containerColor?: ColorValue;
  iconContentColor?: ColorValue;
  labelColor?: ColorValue;
};
```

它不包含选中状态颜色，这与该组件没有 `selected` 属性一致。

文档只列出了颜色字段，没有解释各字段的默认颜色和主题继承机制。

## React Web 开发者容易误解的地方

### 它不是 HTML Chip

这些组件不会渲染为 `button`、`div` 或自定义元素，而是 Android 原生 Jetpack Compose UI。

因此：

- 不能使用 CSS 选择器。
- 不能依赖 DOM 事件。
- 不能使用浏览器开发者工具检查 DOM。
- 本文没有提供 `className` 或普通 CSS `style` API。

### `onClick` 不会自动处理状态

`onClick` 只是回调：

```ts
() => void
```

选中、取消选中和删除数据都需要在 React 状态中实现。它更接近受控 React 组件，而不是自带业务状态的控件。

### `selected` 和 `enabled` 含义不同

- `selected` 表示是否处于选中状态。
- `enabled` 表示是否允许用户交互。

一个 Chip 可以处于选中状态，同时因为 `enabled={false}` 而不可点击。

### Chip 类型不能只按外观选择

四种 Chip 的区别首先是交互语义，其次才是视觉样式。

例如，若用于筛选，应优先考虑 `FilterChip`，因为它具有明确的 `selected` 状态；不要仅因为 `AssistChip` 看起来相似就用它模拟筛选器。

### XML 图标不是 Web SVG 用法

示例使用：

```tsx
<Icon source={require('./assets/flight.xml')} size={18} />
```

这是通过模块资源引用加载本地 XML 图标，不是把 SVG 字符串直接放进 JSX。本文没有说明 XML 文件格式、构建配置或其他受支持图标来源。

### `Host` 是原生 UI 容器

所有示例都将 Chip 放在：

```tsx
<Host matchContents>
  {/* Jetpack Compose components */}
</Host>
```

**基于文档内容推导：** `Host` 用于承载 Jetpack Compose UI，并通过 `matchContents` 让宿主尺寸匹配内部内容。

本文没有给出 `Host` 的完整 API，也没有明确讨论省略它会发生什么，因此实际使用时应保留示例中的宿主结构。

## 注意事项和限制条件

1. **仅支持 Android。** 文档中的所有组件、属性和类型都标注为 Android。
2. **跨平台方案当前文档未涉及。** 没有说明 iOS 或 Web 应使用什么替代组件。
3. **已有 React Native 项目需要先接入 Expo。** 只安装 `@expo/ui` 不代表 bare 项目已经具备 Expo 模块环境。
4. **筛选状态由应用控制。** `FilterChip` 的 `selected` 是必填属性。
5. **删除逻辑由应用控制。** `InputChip` 不会自动修改数组或表单数据。
6. **默认样式未完整记录。** 颜色类型列出了字段，但没有说明默认值和主题规则。
7. **Modifier API 当前文档未展开。** 不能从本文确定可用 Modifier 及配置格式。
8. **图标资源要求未完整说明。** 示例使用本地 XML，但没有提供 XML 文件内容和资源兼容要求。
9. **可访问性当前文档未涉及。** 没有说明语义标签、屏幕阅读器描述、焦点行为或触摸目标尺寸。
10. **表单集成当前文档未涉及。** 没有说明如何与表单库、验证规则或输入框组合。
11. **测试方式当前文档未涉及。** 没有提供单元测试、组件测试或端到端测试示例。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将 Chip 的状态保存在业务数据层，而不是仅根据颜色判断状态。
- 使用 `FilterChip` 构建筛选器时，先确定是单选还是多选，再设计状态结构。
- 删除 `InputChip` 时使用稳定且唯一的 ID 作为 React `key`。示例直接使用标签文本，只适用于标签不会重复的情况。
- 为 `onClick` 中的状态更新使用函数式写法，避免依赖过期状态。
- 在 Android 真机和不同屏幕密度的设备上检查图标尺寸、间距和 `elevation`。
- 跨平台项目应把平台差异封装在业务组件中，避免页面代码到处直接引用 Android 专属组件。
- `enabled={false}` 时仍应提供清晰的禁用视觉反馈，并验证默认主题是否满足产品要求。
- 在动态建议场景中，应同时处理加载、空结果和建议过期等业务状态。

## 文档明确内容与推导内容

### 文档明确说明

- Chip 来自 `@expo/ui/jetpack-compose`。
- 组件与官方 Jetpack Compose Chip API 对应。
- 提供四种独立组件。
- 组件仅支持 Android，并包含在 Expo Go 中。
- 安装命令使用 `expo install @expo/ui`。
- 现有 React Native 项目需要安装 Expo。
- 各组件的用途、属性、类型和示例代码。
- `ChipBorder.width` 默认值是 `1dp`。
- `AssistChip`、`InputChip`、`SuggestionChip` 的 `enabled` 默认为 `true`。
- `InputChip.selected` 默认为 `false`。
- `FilterChip.selected` 是必填属性。

### 基于文档内容推导

- `Host` 是 Jetpack Compose UI 的宿主容器，`matchContents` 与内容尺寸匹配有关。
- Chip 的插槽 API可以理解为 React 中的具名插槽模式。
- `FilterChip` 和 `InputChip` 应按受控组件方式管理状态。
- `SuggestionChip` 因为没有 `selected`，不适合作为持续选择状态控件。
- 四种 Chip 应根据交互语义选择，而不是只根据外观选择。

这些推导用于帮助理解，但不是本文 API 描述中的逐字结论。

## 总结

Expo UI 为 Android 提供了四种语义明确的 Jetpack Compose Chip：

- 用 `AssistChip` 启动辅助操作。
- 用 `FilterChip` 管理筛选选择。
- 用 `InputChip` 展示和移除用户输入。
- 用 `SuggestionChip` 提供上下文建议。

对于 React Web 开发者，最重要的转换是：这些仍然使用 React JSX 和状态管理，但渲染目标是 Android 原生 Jetpack Compose，而不是 DOM。状态、删除和业务操作仍由应用代码负责；组件只提供原生展示、交互入口和视觉状态能力。

---

## 文档导航

- **上一页**：[checkbox](./32__checkbox.md)
- **下一页**：[column](./34__column.md)
