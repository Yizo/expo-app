# Expo UI SwiftUI Menu 学习指南

## 文档解决的问题

`Menu` 是 `@expo/ui` 提供的 SwiftUI 菜单组件，用于在 iOS 和 tvOS 中展示原生下拉菜单。

它主要适用于以下场景：

- 点击按钮后展示一组操作。
- 使用图标、分组、分隔线组织菜单项。
- 创建多级子菜单。
- 展示可禁用或带选中状态的菜单项。
- 为菜单入口应用 iOS 原生按钮样式或 Liquid Glass 效果。
- 同时提供“点击执行主操作、长按打开菜单”的交互。

> **文档状态：**原文是下一个 Expo SDK 版本的未版本化文档，修改日期为 2026 年 5 月 19 日。原文指出当前稳定文档对应 SDK 56。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

---

## 阅读前需要理解的背景知识

### Expo UI 与 SwiftUI

`@expo/ui` 允许 React Native/Expo 应用通过 React 组件使用原生平台 UI。

本篇使用的是：

```tsx
import { Menu } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表示组件最终由 Apple 的 SwiftUI 原生组件实现，不是浏览器 DOM，也不是普通 React Native `View` 模拟的菜单。

对于 React Web 开发者，可以这样理解：

| React Web 概念 | 本文中的对应概念 |
| --- | --- |
| DOM 组件 | SwiftUI 原生视图 |
| CSS 样式 | SwiftUI modifier |
| `<select>` 或自定义弹出菜单 | 原生 `Menu` |
| 图标库中的图标名称 | SF Symbol 名称 |
| `onClick` | `onPress` 或 `onPrimaryAction` |
| React children | 菜单中的原生内容组件 |

由于菜单由 SwiftUI 渲染，其外观和交互主要遵循 Apple 平台规范，而不是 Web 页面中的 CSS 布局规则。

### `Host` 的作用

示例都使用了：

```tsx
<Host matchContents>
  <Menu>{/* ... */}</Menu>
</Host>
```

`Host` 是 Expo UI 的 SwiftUI 宿主组件，用于在 React Native 界面中承载 SwiftUI 内容。

`matchContents` 表示宿主视图根据内部 SwiftUI 内容调整尺寸。它不能简单理解为 Web 中的普通包裹元素，因为这里涉及 React Native 与原生 SwiftUI 两套视图系统之间的桥接。

### SF Symbols

`systemImage` 接收 SF Symbol 名称，例如：

```tsx
systemImage="gear"
systemImage="trash"
systemImage="ellipsis.circle"
```

SF Symbols 是 Apple 提供的系统图标集合。这里传入的不是图片路径、React 组件或 SVG，而是系统图标名称。

---

## 平台支持与安装

### 支持范围

文档明确说明：

- 支持 iOS。
- 支持 tvOS。
- 包含在 Expo Go 中。
- tvOS 要求 **tvOS 17.0 或更高版本**。

当前文档未提及 Android 和 Web 支持。不能据此认为该 SwiftUI `Menu` 可以跨平台使用。

### 安装 `@expo/ui`

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

`expo install` 会按照项目的 Expo SDK 版本选择兼容的依赖版本。它与直接执行 `npm install @expo/ui` 的目的并不完全相同。

如果是在已有的裸 React Native 工程中使用，还必须先按照 Expo 文档将 `expo` 和 Expo Modules 支持安装到工程中。仅安装 `@expo/ui` 不一定足够。

---

## 基本用法

### 普通文本入口

最简单的菜单由一个文本入口和若干 `Button` 菜单项组成：

```tsx
import { Host, Menu, Button } from '@expo/ui/swift-ui';

export default function SimpleMenuExample() {
  return (
    <Host matchContents>
      <Menu label="Options">
        <Button label="Option 1" onPress={() => console.log('Option 1')} />
        <Button label="Option 2" onPress={() => console.log('Option 2')} />
      </Menu>
    </Host>
  );
}
```

默认情况下：

1. 用户单击 `Menu` 的入口。
2. 系统打开菜单。
3. 用户选择某个 `Button`。
4. 对应的 `onPress` 被调用。

它不是 Web 中需要自行管理 `open` 状态、定位和遮罩层的自定义弹层。菜单的打开与关闭由原生系统处理。

### 文本与系统图标

当 `label` 是字符串时，可以通过 `systemImage` 添加 SF Symbol：

```tsx
<Menu label="More" systemImage="ellipsis.circle">
  <Button label="Settings" systemImage="gear" onPress={openSettings} />
  <Button label="Profile" systemImage="person" onPress={openProfile} />
  <Divider />
  <Button
    label="Delete"
    role="destructive"
    systemImage="trash"
    onPress={removeItem}
  />
</Menu>
```

这里还展示了两个重要能力：

- `Divider`：分隔不同类型的操作。
- `role="destructive"`：将删除等危险操作标记为破坏性操作。

### 自定义 SwiftUI 标签

`label` 不仅可以是字符串，也可以是 React 节点：

```tsx
<Menu label={<Text color="accentColor">Custom Label</Text>}>
  <Button label="Action 1" onPress={handleAction} />
</Menu>
```

这里的 `Text` 来自：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

它是 Expo UI 的 SwiftUI 组件，不是 React Native 的 `Text`。

另外，`systemImage` 只会在 `label` 为字符串时使用。传入自定义 React 节点后，应由该节点自行定义视觉内容。

### 使用 React Native 组件作为标签

如果入口需要使用 React Native 的 `Pressable` 或 `Text`，必须用 `RNHostView` 包裹：

```tsx
import { Host, Menu, Button, RNHostView } from '@expo/ui/swift-ui';
import { Pressable, Text } from 'react-native';

<Menu
  label={
    <RNHostView matchContents>
      <Pressable style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text>RN Pressable Trigger</Text>
      </Pressable>
    </RNHostView>
  }>
  <Button label="Item 1" onPress={handleItem} />
</Menu>
```

`RNHostView` 用来把 React Native 视图嵌入 SwiftUI 视图层级。

> **容易误解：**示例中的 `Pressable` 虽然可以声明自己的 `onPress`，但菜单入口的核心交互仍由外层 `Menu` 管理。不要将其理解为普通 Web 按钮内部再绑定一个独立下拉菜单。

---

## 菜单内容的组织方式

### 嵌套菜单

`Menu` 可以作为另一个 `Menu` 的子元素：

```tsx
<Menu label="Main Menu">
  <Button label="Item 1" onPress={handleItem1} />

  <Menu label="Submenu">
    <Button label="Sub Item 1" onPress={handleSubItem1} />
    <Button label="Sub Item 2" onPress={handleSubItem2} />
  </Menu>

  <Button label="Item 2" onPress={handleItem2} />
</Menu>
```

内层 `Menu` 会成为子菜单。开发者只需声明层级，不需要自行计算弹出方向或子菜单位置。

### 分组与快速操作

`ControlGroup` 可以在菜单中创建横向排列的图标按钮，效果类似 Apple Music 或 Safari 菜单中的快速操作区域：

```tsx
<Menu label="Song Options" systemImage="ellipsis.circle">
  <ControlGroup>
    <Button systemImage="plus" label="Add" onPress={handleAdd} />
    <Button systemImage="star" label="Favorite" onPress={handleFavorite} />
    <Button systemImage="square.and.arrow.up" label="Share" onPress={handleShare} />
  </ControlGroup>

  <Section>
    <Button label="Add to a Playlist" onPress={handlePlaylist} />
    <Button label="Create Station" onPress={handleStation} />
  </Section>

  <Divider />

  <Button label="Suggest Less" onPress={handleSuggestLess} />
</Menu>
```

相关组件的职责如下：

| 组件 | 作用 |
| --- | --- |
| `ControlGroup` | 横向排列一组快速操作 |
| `Section` | 对菜单项进行语义和视觉分组 |
| `Divider` | 在菜单内容之间显示分隔线 |
| `Button` | 执行一次性操作 |
| `Toggle` | 表示可切换的布尔状态 |
| 嵌套 `Menu` | 创建子菜单 |

---

## 点击与长按行为

### 默认行为

没有提供 `onPrimaryAction` 时，单击入口直接打开菜单：

```tsx
<Menu label="Options">
  {/* 菜单内容 */}
</Menu>
```

### 设置主操作

提供 `onPrimaryAction` 后，交互会发生变化：

```tsx
<Menu
  label="Tap or Hold"
  systemImage="play.circle"
  onPrimaryAction={() => console.log('Primary action')}>
  <Button label="Menu Item 1" onPress={handleItem1} />
</Menu>
```

此时：

- 单击：执行 `onPrimaryAction`。
- 长按：打开菜单。

这适用于一个控件既有常用默认操作，又需要提供补充操作的情况。

> **关键限制：**设置 `onPrimaryAction` 后，不能再期待单击打开菜单。对于不熟悉长按入口的用户，应谨慎使用这种交互。

如果需求是“只在长按某个区域时显示操作菜单”，文档建议使用 `ContextMenu`，而不是用普通 `Menu` 模拟。

---

## 菜单项状态

### 禁用菜单项

使用 `disabled(true)` modifier：

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Locked"
  systemImage="lock"
  modifiers={[disabled(true)]}
  onPress={() => console.log('This never fires')}
/>
```

禁用后：

- 菜单项仍然显示。
- 外观会变灰。
- 用户无法触发它。
- `onPress` 不会执行。

这与 React Web 中的 `disabled` 属性目标相似，但这里通过 SwiftUI modifier 配置。

### 可选中菜单项

需要显示勾选状态时，应使用 `Toggle`：

```tsx
const [showCompleted, setShowCompleted] = useState(true);

<Menu label="Filter">
  <Toggle
    isOn={showCompleted}
    label="Show completed"
    systemImage="checkmark.circle"
    onIsOnChange={setShowCompleted}
  />
</Menu>
```

当 `Toggle` 位于 `Menu` 中时：

- `systemImage` 会显示为前置图标。
- `isOn` 为 `true` 时，尾部自动显示勾选标记。
- 状态变化通过 `onIsOnChange` 返回。

文档明确建议使用该模式，不要自行用普通 `Button` 拼装勾选图标。

对 React Web 开发者而言，它相当于受控复选项：

- `isOn` 类似 `checked`。
- `onIsOnChange` 类似 `onChange`。
- 状态仍由 React 的 `useState` 管理。
- 原生系统负责菜单中的表现形式。

---

## 样式与 Modifier

### `buttonStyle`

菜单入口可以通过 `buttonStyle` modifier 设置按钮样式：

```tsx
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

<Menu
  label="Styled Menu"
  modifiers={[buttonStyle('borderedProminent')]}>
  {/* 菜单内容 */}
</Menu>
```

Modifier 通过数组传入：

```tsx
modifiers={[buttonStyle('borderedProminent')]}
```

它更接近 SwiftUI 的视图修饰机制，而不是 Web 中可任意设置属性的 CSS 对象。

### Liquid Glass 样式

菜单可以使用两种玻璃按钮样式：

```tsx
buttonStyle('glass')
buttonStyle('glassProminent')
```

示例：

```tsx
<Menu
  label="Glass Menu"
  systemImage="ellipsis.circle"
  modifiers={[buttonStyle('glass')]}>
  {/* 菜单内容 */}
</Menu>
```

`glassProminent` 用于更突出的玻璃效果。

#### 重要警告

不要为了实现玻璃外观，对菜单的 `label` 视图应用 `glassEffect()`。

文档明确指出，这会导致菜单关闭时，入口后方短暂出现矩形光晕。正确方式是将：

```tsx
buttonStyle('glass')
```

或：

```tsx
buttonStyle('glassProminent')
```

直接应用到 `Menu`。

这不仅影响静态样式，也关系到菜单关闭动画与原生组件的正确集成。

### 仅显示图标

使用 `labelStyle('iconOnly')` 可以隐藏入口文本：

```tsx
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

<Menu
  label="Settings menu"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}>
  {/* 菜单内容 */}
</Menu>
```

即使界面只显示图标，也必须提供有意义的 `label`，因为辅助功能仍需要使用这段文本。

> 不应把 `label` 设置为空字符串来实现纯图标按钮。视觉隐藏应交给 `labelStyle('iconOnly')`。

---

## API 参考

### 导入

```tsx
import { Menu } from '@expo/ui/swift-ui';
```

### `Menu` 组件

支持平台：

- iOS
- tvOS

作用：用户操作入口后展示下拉菜单。

### Props

#### `children`

类型：

```tsx
ReactNode
```

表示打开菜单后展示的内容。文档明确列出的可用子组件包括：

- `Button`
- `Toggle`
- `Picker`
- `Section`
- `Divider`
- 嵌套的 `Menu`

本文示例没有展示 `Picker` 的具体用法。

#### `label`

类型：

```tsx
string | ReactNode
```

用于定义菜单入口：

- 字符串适合普通文本入口。
- React 节点适合自定义入口内容。
- React Native 视图作为入口时，需要通过 `RNHostView` 嵌入。

#### `onPrimaryAction`

类型：

```tsx
() => void
```

可选。提供后：

- 单击执行该回调。
- 长按打开菜单。

未提供时，单击直接打开菜单。

#### `systemImage`

类型：

```tsx
string
```

可选。表示与入口文本一起显示的 SF Symbol 名称。

它只在 `label` 为字符串时生效。

#### 继承属性

`Menu` 还继承 `CommonViewModifierProps`，因此可以接收通用 SwiftUI modifier 相关属性。当前文档没有逐项列出这些继承属性，应结合单独的 modifiers 文档查阅。

---

## React Web 开发者容易误解的地方

### 它不是 DOM 下拉菜单

`Menu` 不是 `<select>`，也不是由绝对定位元素构成的弹层。不要套用以下 Web 思路：

- 查询或操作菜单 DOM。
- 使用 CSS 控制弹出层位置。
- 手动维护菜单的打开状态。
- 监听浏览器鼠标事件。
- 假设 Android、iOS 和 Web 会自动获得相同表现。

### React Native 组件与 SwiftUI 组件不能直接混用

下面两个 `Text` 来自不同的 UI 系统：

```tsx
import { Text } from '@expo/ui/swift-ui';
import { Text } from 'react-native';
```

React Native 视图需要通过 `RNHostView` 才能作为 SwiftUI 菜单标签使用。开发时应特别留意组件的导入来源。

### Modifier 不是 CSS

例如：

```tsx
modifiers={[disabled(true), buttonStyle('glass')]}
```

这是对原生 SwiftUI 视图应用修饰器，不是向组件传入 CSS 类名。可用值和组合规则由 Expo UI 与 SwiftUI API 决定。

### `systemImage` 不是图片资源

它接收 SF Symbol 名称，而不是：

- 图片 URL
- 本地文件路径
- SVG 字符串
- React 图标组件

自定义 React 节点作为 `label` 时，`systemImage` 不会用于自动拼接图标。

### `onPrimaryAction` 会改变入口交互

它不是普通的附加点击回调。添加后，单击不再打开菜单，而是执行主操作，菜单需要长按才能出现。

---

## 实际开发中的使用建议

以下建议分为文档明确内容和基于文档得出的开发结论。

### 文档明确说明

- 普通菜单默认通过单击打开。
- 只需长按交互时应使用 `ContextMenu`。
- 设置 `onPrimaryAction` 后，单击执行主操作，长按打开菜单。
- 可选中项目应使用 `Toggle`，由系统显示勾选状态。
- 禁用项目应使用 `disabled(true)`。
- 纯图标入口仍应提供 `label` 以支持辅助功能。
- Liquid Glass 样式应使用 `buttonStyle`，不能对标签应用 `glassEffect()`。
- tvOS 最低要求为 17.0。
- 现有 React Native 工程需要先支持 Expo Modules。

### 基于文档内容推导

- 如果产品需要 Android 或 Web 版本，应在业务层准备平台差异处理，因为本文组件只声明支持 iOS 和 tvOS。
- 菜单内容应优先使用 `Button`、`Toggle`、`Section` 等原生语义组件，以获得符合 Apple 平台习惯的布局和交互。
- 当一个入口没有明确且高频的默认操作时，不宜使用 `onPrimaryAction`，否则用户只能通过不够显眼的长按操作发现菜单。
- 自定义标签只应用于确实需要特殊视觉效果的场景。简单入口使用字符串和 `systemImage` 更容易保持系统一致性。
- 菜单中的开关状态需要存放在 React state 或其他业务状态中；`Menu` 负责展示，不能替代应用状态管理。

### 基于经验建议

- 对多平台项目，可以封装业务层的菜单组件，由 iOS/tvOS 实现选择 Expo UI `Menu`，其他平台使用对应的平台组件。
- 不要让菜单层级过深。虽然组件支持嵌套，但过多子菜单会降低移动端操作效率。
- 危险操作除了使用 `role="destructive"`，通常还应根据操作后果决定是否增加确认流程。
- 在真机上检查长按、菜单关闭动画、VoiceOver 标签以及不同系统版本下的视觉效果。

---

## 当前文档未涉及的内容

原文没有说明以下事项：

- Android 和 Web 的替代实现。
- 菜单打开状态的受控 API。
- 通过代码主动打开或关闭菜单的方法。
- 自定义菜单弹出位置和动画的方法。
- `Picker` 在菜单中的完整示例。
- `ControlGroup`、`Section` 和 `RNHostView` 的完整 API。
- SF Symbols 的版本兼容规则。
- Liquid Glass 样式所需的最低 iOS 版本。
- 菜单项异步加载、错误处理或权限控制方案。
- 自动化测试菜单交互的方法。

对于这些问题，需要查阅对应组件文档或与项目所用 Expo SDK 匹配的版本文档，不能仅根据本篇内容推断具体 API。

---

## 总结

Expo UI 的 `Menu` 是对 Apple SwiftUI `Menu` 的 React 封装，适合在 iOS 和 tvOS 中实现原生下拉操作菜单。

使用时应重点掌握：

- SwiftUI 内容需要放在 `Host` 中。
- `label` 可以是字符串、SwiftUI React 节点，或由 `RNHostView` 包裹的 React Native 视图。
- 默认单击打开菜单；设置 `onPrimaryAction` 后，单击执行主操作、长按打开菜单。
- 菜单内容可以使用按钮、开关、分组、分隔线和嵌套菜单。
- 禁用状态、按钮样式和仅图标模式通过 modifier 实现。
- Liquid Glass 必须使用 `buttonStyle`，否则可能产生关闭动画伪影。
- 这是 Apple 平台组件，不能默认具备 Web 或 Android 支持。

---

## 文档导航

- **上一页**：[list](./95__list.md)
- **下一页**：[modifiers](./97__modifiers.md)
