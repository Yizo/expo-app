# SegmentedButton：Android 分段选择按钮

> 文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档；当前最新稳定版本为 SDK 56。

## 文档解决的问题

`SegmentedButton` 用于将少量相关选项并排显示在一行中，让用户进行单选或多选。

常见场景包括：

- 在“日 / 周 / 月 / 年”之间切换时间范围。
- 同时启用或关闭“Wi-Fi / Bluetooth / NFC / GPS”等功能。
- 在少量互斥的筛选条件之间切换。
- 将多个紧密相关的开关集中显示。

这些组件对应 Android Jetpack Compose Material 3 的 Segmented Button API。

需要注意：这不是一套跨平台的 React Native 通用组件。本文列出的组件仅支持 Android。

## React Web 开发者需要了解的背景

### Expo、React Native 与 Jetpack Compose

可以从 React Web 的角度理解它们之间的关系：

| 技术 | 类比说明 |
| --- | --- |
| React Web | 使用 React 描述浏览器 DOM 界面 |
| React Native | 使用 React 描述 iOS、Android 原生界面 |
| Expo | 围绕 React Native 提供开发工具、运行环境和原生模块 |
| Jetpack Compose | Android 官方的声明式原生 UI 框架 |
| `@expo/ui/jetpack-compose` | 让 React Native 代码使用部分 Jetpack Compose 原生组件的接口 |

虽然示例仍然使用 JSX、组件和 `useState`，最终渲染的并不是 HTML `<button>`，而是 Android 原生 Jetpack Compose 组件。

因此，不应假设这些组件具有 Web DOM、CSS 或浏览器事件系统的行为。

### `Host` 的作用

示例将分段按钮放在以下结构中：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

从示例结构可以确定，`Host` 是承载 `@expo/ui/jetpack-compose` 组件的外层容器。`matchContents` 用于让宿主尺寸匹配内部内容。

当前文档只展示了这种用法，没有给出 `Host` 或 `matchContents` 的完整 API 说明。如需了解其尺寸、布局和嵌套规则，应查阅 `Host` 对应文档，不能仅根据本文推断。

## 安装

使用项目对应的包管理器执行以下命令之一：

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

这里使用的是 `expo install`，而不是普通的 `npm install`。其作用是通过 Expo 的安装流程添加 `@expo/ui`。

如果项目是一个已有的 React Native 原生工程，即 Bare React Native 项目，还需要先在项目中安装并配置 `expo`，才能使用 Expo 模块。

本文没有涉及以下内容：

- iOS 原生工程配置。
- Android 原生工程的手动配置步骤。
- Expo SDK 版本兼容范围。
- 构建、签名或发布命令。
- Web 平台降级方案。

## 导入组件

```tsx
import {
  SingleChoiceSegmentedButtonRow,
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
} from '@expo/ui/jetpack-compose';
```

示例还使用了同一入口导出的 `Host` 和 `Text`：

```tsx
import {
  Host,
  Text,
} from '@expo/ui/jetpack-compose';
```

`Text` 是 Jetpack Compose 组件体系中的文本组件，不是 HTML 元素，也不是示例中从 `react-native` 导入的 `Text`。

## 两种选择模式

分段按钮有两种容器。选择哪一种取决于业务状态是否允许多个选项同时生效。

| 容器 | 选择规则 | React Web 类比 |
| --- | --- | --- |
| `SingleChoiceSegmentedButtonRow` | 同一时间只能选中一个 | 单选按钮 `radio` |
| `MultiChoiceSegmentedButtonRow` | 每个选项可以独立切换 | 复选框 `checkbox` |

`SegmentedButton` 必须放在其中一种 Row 容器内使用，不能作为独立按钮直接使用。

## 单选分段按钮

当多个选项互斥、同一时间只能选择一个时，使用 `SingleChoiceSegmentedButtonRow`。

```tsx
import { useState } from 'react';
import {
  Host,
  SingleChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function SingleChoiceExample() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = ['Day', 'Week', 'Month', 'Year'];

  return (
    <Host matchContents>
      <SingleChoiceSegmentedButtonRow>
        {options.map((label, index) => (
          <SegmentedButton
            key={label}
            selected={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}>
            <SegmentedButton.Label>
              <Text>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  );
}
```

### 状态更新流程

1. `selectedIndex` 保存当前选中项的索引。
2. 每个按钮通过 `index === selectedIndex` 计算自己的 `selected`。
3. 用户点击按钮后，`onClick` 将该按钮的索引写入状态。
4. React 重新渲染，只有索引匹配的按钮处于选中状态。

关键属性如下：

```tsx
selected={index === selectedIndex}
onClick={() => setSelectedIndex(index)}
```

这里采用的是受控组件模式：选中状态由 React state 决定，按钮不会替业务代码维护 `selectedIndex`。

这与 React Web 中受控的单选框类似：

```tsx
<input
  type="radio"
  checked={index === selectedIndex}
  onChange={() => setSelectedIndex(index)}
/>
```

但两者底层不是同一种 UI 元素，事件属性也不同。

## 多选分段按钮

当各选项彼此独立、允许同时选中多个选项时，使用 `MultiChoiceSegmentedButtonRow`。

```tsx
import { useState } from 'react';
import {
  Host,
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function MultiChoiceExample() {
  const [checkedItems, setCheckedItems] = useState([
    false,
    false,
    false,
    false,
  ]);
  const options = ['Wi-Fi', 'Bluetooth', 'NFC', 'GPS'];

  return (
    <Host matchContents>
      <MultiChoiceSegmentedButtonRow>
        {options.map((label, index) => (
          <SegmentedButton
            key={label}
            checked={checkedItems[index]}
            onCheckedChange={checked => {
              setCheckedItems(prev => {
                const next = [...prev];
                next[index] = checked;
                return next;
              });
            }}>
            <SegmentedButton.Label>
              <Text>{label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </MultiChoiceSegmentedButtonRow>
    </Host>
  );
}
```

### 状态更新流程

1. `checkedItems` 使用布尔数组保存每个选项的状态。
2. 每个按钮通过 `checkedItems[index]` 获得自己的 `checked`。
3. `onCheckedChange` 接收切换后的布尔值。
4. 更新时复制原数组，只修改当前索引。
5. 新数组触发 React 重新渲染。

```tsx
setCheckedItems(prev => {
  const next = [...prev];
  next[index] = checked;
  return next;
});
```

复制数组非常重要。直接修改 `prev[index]` 会破坏 React 状态不可变更新的惯例，并可能导致更新判断出现问题。

### 单选和多选属性不能混用

| 使用位置 | 状态属性 | 事件属性 |
| --- | --- | --- |
| `SingleChoiceSegmentedButtonRow` | `selected` | `onClick` |
| `MultiChoiceSegmentedButtonRow` | `checked` | `onCheckedChange` |

不要因为它们都表示“按钮被选中”，就将两套属性视为同一套 API。

## 标签插槽

按钮文本放在 `SegmentedButton.Label` 中：

```tsx
<SegmentedButton>
  <SegmentedButton.Label>
    <Text>Month</Text>
  </SegmentedButton.Label>
</SegmentedButton>
```

`SegmentedButton.Label` 是标签插槽，而不是普通的 HTML 标签。当前文档示例只展示了在其中放置 `Text`，没有说明其他子组件是否受支持。

## 自定义颜色

`SegmentedButton` 的 `colors` 属性可以分别设置激活、未激活和禁用状态下的颜色。

```tsx
<SegmentedButton
  selected={index === selectedIndex}
  onClick={() => setSelectedIndex(index)}
  colors={{
    activeContainerColor: '#6200EE',
    activeContentColor: '#FFFFFF',
  }}>
  <SegmentedButton.Label>
    <Text>{label}</Text>
  </SegmentedButton.Label>
</SegmentedButton>
```

上例设置了：

- `activeContainerColor`：激活状态的容器背景色。
- `activeContentColor`：激活状态的内容颜色。

颜色值类型为 React Native 的 `ColorValue`，不是 CSS 样式对象。文档示例使用十六进制字符串，但本文没有列出 `ColorValue` 支持的全部格式。

### 完整颜色配置

| 属性 | 对应状态和部位 |
| --- | --- |
| `activeBorderColor` | 激活状态边框 |
| `activeContainerColor` | 激活状态容器 |
| `activeContentColor` | 激活状态内容 |
| `inactiveBorderColor` | 未激活状态边框 |
| `inactiveContainerColor` | 未激活状态容器 |
| `inactiveContentColor` | 未激活状态内容 |
| `disabledActiveBorderColor` | 禁用且激活时的边框 |
| `disabledActiveContainerColor` | 禁用且激活时的容器 |
| `disabledActiveContentColor` | 禁用且激活时的内容 |
| `disabledInactiveBorderColor` | 禁用且未激活时的边框 |
| `disabledInactiveContainerColor` | 禁用且未激活时的容器 |
| `disabledInactiveContentColor` | 禁用且未激活时的内容 |

所有颜色配置均为可选项。文档没有说明未提供某项颜色时采用的具体默认值。

## 组件 API

### `SingleChoiceSegmentedButtonRow`

Material 3 单选分段按钮的行容器，仅支持 Android。

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | 容器内的 `SegmentedButton` |
| `modifiers` | `ModifierConfig[]` | 否 | 应用于组件的 Modifier 配置 |

### `MultiChoiceSegmentedButtonRow`

Material 3 多选分段按钮的行容器，仅支持 Android。

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | 容器内的 `SegmentedButton` |
| `modifiers` | `ModifierConfig[]` | 否 | 应用于组件的 Modifier 配置 |

### `SegmentedButton`

Material 3 分段按钮，仅支持 Android，而且必须放在单选或多选 Row 容器中。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `selected` | `boolean` | 未说明 | 单选容器中的选中状态 |
| `onClick` | `() => void` | 未说明 | 单选容器中的点击回调 |
| `checked` | `boolean` | 未说明 | 多选容器中的勾选状态 |
| `onCheckedChange` | `(checked: boolean) => void` | 未说明 | 多选状态变化回调 |
| `enabled` | `boolean` | `true` | 是否允许用户操作 |
| `colors` | `SegmentedButtonColors` | 未说明 | 不同状态下的颜色 |
| `children` | `React.ReactNode` | 未说明 | 包含 `Label` 插槽的子节点 |
| `modifiers` | `ModifierConfig[]` | 未说明 | 应用于组件的 Modifier 配置 |

### `modifiers`

`modifiers` 类型为 `ModifierConfig[]`，三个组件都支持该属性。

Jetpack Compose 中的 Modifier 通常用于调整组件的布局、尺寸、外观或行为。它不能直接等同于 React Web 的 `className` 或 `style`。

当前文档没有列出：

- 支持哪些 Modifier。
- Modifier 的执行顺序。
- 如何通过 Modifier 设置尺寸或间距。
- Modifier 与 `colors` 的优先级关系。

因此，本文只能确认组件接受 `ModifierConfig[]`，具体用法需要查询 Expo UI 的 Modifier 文档。

## 注意事项与限制

### 仅支持 Android

API 表格明确将这些组件标记为 Android 支持。不要直接将其用于需要同时支持 iOS 和 Web 的共享页面，并期待自动获得相同界面。

**基于文档内容推导：**跨平台项目需要在组件边界处进行平台判断，或者为 iOS、Web 准备其他实现。本文没有规定应采用哪一种方案。

### 文档对应下一个 SDK 版本

页面明确说明这是下一个 Expo SDK 版本的文档，并指向 SDK 56 的最新稳定文档。

这意味着未发布文档中的 API 可能与当前项目实际安装的稳定版本不同。开发时应按照项目的 Expo SDK 版本查阅对应文档，而不是只根据本页代码判断可用性。

### 必须使用正确的容器和属性组合

`SegmentedButton` 必须位于：

- `SingleChoiceSegmentedButtonRow`，或
- `MultiChoiceSegmentedButtonRow`

单选使用 `selected` 和 `onClick`；多选使用 `checked` 和 `onCheckedChange`。容器与属性组合不一致，无法正确表达预期的选择语义。

### 状态由应用代码维护

示例中的按钮都是受控组件。点击事件只通知应用发生了交互，应用仍需更新 state，并把新的 `selected` 或 `checked` 值传回组件。

不要只传事件回调而忽略状态更新，否则界面不会按照业务预期持续显示新的选择结果。

### 选项数量应保持较少

文档明确将其定义为从“一小组选项”中选择。它不适合替代长列表、搜索选择器或包含大量项目的菜单。

文档没有给出允许的最大选项数量。

### 当前文档未说明的事项

以下内容未在本文中说明，不能据此作出确定结论：

- 无障碍属性及屏幕阅读器行为。
- 键盘或硬件按键操作。
- 按钮图标插槽。
- 默认颜色和主题继承规则。
- 尺寸、间距及换行行为。
- 加载状态。
- 动画行为。
- 自动管理单选互斥状态的能力。
- 测试标识和自动化测试方式。
- iOS 或 Web 的替代组件。

## 实际开发中的使用方式

### 先确定业务语义

如果状态只能有一个值，使用单选模式：

```tsx
const [period, setPeriod] = useState('day');
```

如果状态是多个彼此独立的开关，使用多选模式：

```tsx
const [features, setFeatures] = useState({
  wifi: false,
  bluetooth: false,
});
```

**基于经验建议：**业务代码中优先使用稳定的业务标识保存状态，而不是长期依赖数组索引。选项重新排序、插入或删除后，索引状态可能对应到错误项目。

### 将平台差异隔离在组件内部

**基于文档内容推导：**由于该 API 仅支持 Android，跨平台应用可以封装一个业务组件，并在内部选择不同平台实现，避免业务页面直接依赖 Jetpack Compose API。

本文只提供 Android 组件用法，没有规定跨平台封装的具体代码结构。

### 颜色配置应覆盖真实状态

如果产品需要深度定制颜色，应同时检查：

- 激活与未激活状态是否容易区分。
- 禁用状态是否仍能表达当前选择。
- 内容色与容器色是否具有足够对比度。
- 边框在不同状态下是否仍然可见。

其中颜色状态的可配置性来自文档；对比度检查属于**基于经验建议**。

## 文档明确内容与推导内容

### 文档明确说明

- 组件属于 `@expo/ui`。
- 从 `@expo/ui/jetpack-compose` 导入。
- 对应官方 Jetpack Compose Segmented Button API。
- 提供单选和多选两种 Row 容器。
- `SegmentedButton` 必须放在其中一种 Row 容器里。
- 单选使用 `selected` 和 `onClick`。
- 多选使用 `checked` 和 `onCheckedChange`。
- 可以通过 `colors` 定制不同状态下的颜色。
- `enabled` 默认值为 `true`。
- 组件 API 仅支持 Android。
- 包含在 Expo Go 中。
- 已有 React Native 工程需要先安装 Expo 才能使用 Expo 模块。
- 当前页面是下一个 SDK 版本的文档，稳定版本指向 SDK 56。

### 基于文档内容推导

- 这是 Android 平台专用实现，跨平台页面需要额外的平台适配。
- 选择状态属于受控状态，需要由 React state 或其他业务状态容器维护。
- `Host` 是 Jetpack Compose 组件的宿主容器，但本文没有提供其完整规则。
- 选项很多时应改用其他选择界面，因为文档将该组件限定为一小组选项。

## 总结

`SegmentedButton` 为 Expo 项目提供了 Android Jetpack Compose Material 3 的分段选择按钮。

使用时需要把握三个核心规则：

1. 单选使用 `SingleChoiceSegmentedButtonRow`、`selected` 和 `onClick`。
2. 多选使用 `MultiChoiceSegmentedButtonRow`、`checked` 和 `onCheckedChange`。
3. 组件仅支持 Android，跨平台项目不能将其当作通用 React Native UI 直接复用。

对 React Web 开发者来说，代码形式仍然是熟悉的 JSX 和受控状态模式，但组件底层属于 Android 原生 Jetpack Compose，不具备 DOM、CSS 和浏览器事件模型。

---

## 文档导航

- **上一页**：[searchbar](./60__searchbar.md)
- **下一页**：[shape](./62__shape.md)
