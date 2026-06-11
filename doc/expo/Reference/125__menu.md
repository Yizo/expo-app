# Expo UI SwiftUI Menu 学习文档

## 文档解决的问题

`Menu` 是 `@expo/ui` 提供的 SwiftUI 菜单组件，用于在 iOS 和 tvOS 应用中显示原生风格的下拉菜单。

它主要解决以下需求：

- 点击一个文字或图标触发器，展示操作列表。
- 在菜单中组织按钮、开关、选择器、分组和分隔线。
- 创建嵌套子菜单。
- 为触发器设置原生按钮样式，包括 Liquid Glass 外观。
- 同时支持“点击执行主要操作、长按打开菜单”的交互。

> 当前页面属于**下一个 Expo SDK 版本的未发布文档**，修改日期为 **2026 年 5 月 19 日**。文档指出，当前稳定版应参考 SDK 56 对应页面。因此，本文描述的 API 在当前项目所用 SDK 中不一定全部可用。

## 适用平台与场景

支持的平台：

- iOS
- tvOS
- Expo Go
- tvOS 要求 **tvOS 17.0 或更高版本**

适合以下场景：

- 页面右上角的“更多操作”菜单。
- 设置、个人资料、删除等操作列表。
- 筛选条件的选中与取消。
- 包含二级分类的嵌套菜单。
- 音乐或浏览器中常见的横向快捷操作区域。
- 一个按钮既有默认操作，又能通过长按显示更多操作。

当前文档未涉及：

- Android 支持。
- Web 支持。
- 菜单位置、宽度和展开方向的手动控制。
- 键盘操作和完整的无障碍行为说明。
- 动画时长或菜单关闭行为的配置。
- `Picker` 在菜单中的具体示例。
- 如何在非 Expo Go 的原生工程中完成构建和发布。

## 阅读前需要理解的背景

### `@expo/ui/swift-ui` 是什么

`@expo/ui` 允许 React Native/Expo 代码使用平台原生 UI。这里使用的是 SwiftUI 组件，因此它不是浏览器 DOM，也不是普通的 React Native 跨平台视图。

可以将它理解为：

- React Web 中 JSX 最终创建 DOM 元素。
- React Native 中 JSX 通常创建原生平台视图。
- `@expo/ui/swift-ui` 中的组件会映射到 Apple 的 SwiftUI 界面能力。

`Menu` 的行为与 Apple 官方 SwiftUI `Menu` API 保持一致。这意味着菜单最终呈现的是 Apple 平台的原生交互和视觉效果，而不是用 CSS 模拟的浮层。

### `Host` 的作用

示例都使用了：

```tsx
<Host matchContents>
  <Menu>{/* ... */}</Menu>
</Host>
```

`Host` 是承载 SwiftUI 内容的宿主组件，可以把它类比为 React Web 中嵌入另一套渲染系统时使用的容器。

`matchContents` 表示宿主尺寸跟随内部内容。当前文档没有进一步解释其布局规则，因此不能仅根据本页推断复杂布局中的尺寸表现。

### SF Symbols

`systemImage` 接收 SF Symbol 名称，例如：

```tsx
systemImage="gear"
systemImage="trash"
systemImage="ellipsis.circle"
```

SF Symbols 是 Apple 提供的系统图标集合，不等同于 Web 项目中的 SVG、Icon Font 或第三方 React 图标组件。组件会根据名称请求对应的系统图标。

当前文档没有列出：

- 可用 SF Symbol 的完整名称。
- 不同 iOS/tvOS 版本之间的图标兼容性。
- 图标名称无效时的表现。

### Modifier

Modifier 是 SwiftUI 中为视图附加样式或行为的机制。在 React Web 中，可以把它粗略理解为一组经过类型化封装的样式和行为配置。

例如：

```tsx
<Menu modifiers={[buttonStyle('borderedProminent')]}>
```

这里不是通过 `className` 或 CSS 设置样式，而是把 `buttonStyle` modifier 放入 `modifiers` 数组。

`Menu` 还继承了 `CommonViewModifierProps`，但本页没有列出所有可用 modifier，需要查阅单独的 modifiers 文档。

## 安装

使用项目对应的包管理器执行其中一条命令：

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

`expo install` 与普通的 `npm install` 不完全相同。它会结合当前 Expo SDK 选择合适的依赖版本，因此 Expo 项目应优先使用文档给出的命令。

如果是在已有的普通 React Native 项目中使用，必须先安装并配置 `expo`，使项目能够加载 Expo Modules。仅安装 `@expo/ui` 并不代表原生工程已经具备运行条件。

基础导入方式：

```tsx
import { Menu } from '@expo/ui/swift-ui';
```

Modifier 从单独入口导入：

```tsx
import {
  buttonStyle,
  disabled,
  labelStyle,
} from '@expo/ui/swift-ui/modifiers';
```

## Menu 的基本结构

一个基础菜单由三部分组成：

```tsx
<Host matchContents>
  <Menu label="Options">
    <Button label="Option 1" onPress={handleOption1} />
    <Button label="Option 2" onPress={handleOption2} />
  </Menu>
</Host>
```

- `Host`：承载 SwiftUI 视图。
- `Menu`：菜单触发器及菜单容器。
- `label`：用户在菜单关闭时看到的触发器标签。
- `children`：菜单展开后显示的内容。
- `Button`：一个可点击的菜单项。
- `onPress`：用户选择菜单项时执行的回调。

默认情况下，用户**单击 `Menu` 触发器就会打开菜单**。

这与 `ContextMenu` 不同：需要长按才能唤出的上下文菜单应使用 `ContextMenu`，不要仅因为它们都能显示操作列表就混用。

## 触发器标签

### 纯文字标签

`label` 可以直接传入字符串：

```tsx
<Menu label="Options">
  <Button label="Option 1" onPress={handleOption1} />
</Menu>
```

这是最简单的形式。

### 文字与 SF Symbol

当 `label` 是字符串时，可以通过 `systemImage` 在文字旁显示系统图标：

```tsx
<Menu label="More" systemImage="ellipsis.circle">
  <Button
    label="Settings"
    systemImage="gear"
    onPress={openSettings}
  />
  <Button
    label="Delete"
    role="destructive"
    systemImage="trash"
    onPress={deleteItem}
  />
</Menu>
```

`role="destructive"` 用于表达删除等破坏性操作。文档示例展示了该写法，但本页没有详细说明 `Button` 的角色系统。

需要注意：`Menu` 的 `systemImage` **只在 `label` 是字符串时使用**。如果传入自定义 React 节点，则不能依赖该属性为标签自动添加图标。

### 自定义 SwiftUI 标签

`label` 也可以接收 React 节点：

```tsx
<Menu label={<Text color="accentColor">Custom Label</Text>}>
  <Button label="Action 1" onPress={handleAction} />
</Menu>
```

这里的 `Text` 来自：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

它是 SwiftUI 体系中的组件，不是 HTML `<span>`，也不是 `react-native` 的 `Text`。

### 使用 React Native 组件作为标签

如果标签需要使用 `Pressable`、React Native `Text` 等组件，必须用 `RNHostView` 包裹：

```tsx
<Menu
  label={
    <RNHostView matchContents>
      <Pressable style={styles.trigger}>
        <Text>RN Pressable Trigger</Text>
      </Pressable>
    </RNHostView>
  }>
  <Button label="Item 1" onPress={handleItem1} />
</Menu>
```

这里存在两套 UI 体系：

- `Menu`、`Button`、`RNHostView` 来自 `@expo/ui/swift-ui`。
- `Pressable`、`Text` 来自 `react-native`。

`RNHostView` 负责把 React Native 视图嵌入 SwiftUI 标签区域。React Web 开发者不能把它当作普通父组件：它承担的是不同原生视图系统之间的桥接职责。

文档示例在内部 `Pressable` 上设置了 `onPress`，同时外层 `Menu` 也需要处理触发交互。当前文档没有说明两者回调的执行顺序或事件竞争规则，因此不要根据 Web 的冒泡模型推断其行为。

## 菜单内容类型

`children` 可以包含：

- `Button`
- `Toggle`
- `Picker`
- `Section`
- `Divider`
- 嵌套的 `Menu`

这些不是任意 HTML 或 React Native 子节点，而是菜单支持的 SwiftUI 内容类型。

### 按钮与分隔线

```tsx
<Menu label="More" systemImage="ellipsis.circle">
  <Button label="Settings" systemImage="gear" onPress={openSettings} />
  <Button label="Profile" systemImage="person" onPress={openProfile} />
  <Divider />
  <Button
    label="Delete"
    role="destructive"
    systemImage="trash"
    onPress={deleteItem}
  />
</Menu>
```

`Divider` 用于在视觉上分隔不同性质的操作，例如把普通操作与删除操作分开。

### 嵌套菜单

`Menu` 可以包含另一个 `Menu`，从而形成子菜单：

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

这适合操作数量较多且存在明确分类层级的场景。

当前文档没有说明：

- 最大嵌套层数。
- 深层菜单的具体视觉和交互表现。
- tvOS 遥控器在嵌套菜单中的导航方式。

### 分组与横向快捷操作

`ControlGroup` 可以在菜单中创建一行横向排列的图标按钮，效果类似 Apple Music 或 Safari 菜单中的快捷操作区：

```tsx
<Menu label="Song Options" systemImage="ellipsis.circle">
  <ControlGroup>
    <Button systemImage="plus" label="Add" onPress={handleAdd} />
    <Button systemImage="star" label="Favorite" onPress={handleFavorite} />
    <Button systemImage="square.and.arrow.up" label="Share" onPress={handleShare} />
  </ControlGroup>

  <Section>
    <Button label="Add to a Playlist" onPress={handleAddToPlaylist} />
    <Button label="Create Station" onPress={handleCreateStation} />
  </Section>

  <Divider />

  <Button label="Suggest Less" onPress={handleSuggestLess} />
</Menu>
```

三种结构承担不同职责：

- `ControlGroup`：横向快捷操作。
- `Section`：把相关菜单项组织为一个分组。
- `Divider`：在不同区域之间提供明确分隔。

## 主要操作与菜单操作并存

为 `Menu` 提供 `onPrimaryAction` 后，交互方式会改变：

```tsx
<Menu
  label="Tap or Hold"
  systemImage="play.circle"
  onPrimaryAction={handlePlay}>
  <Button label="Menu Item 1" onPress={handleItem1} />
  <Button label="Menu Item 2" onPress={handleItem2} />
</Menu>
```

此时：

| 用户操作 | 执行结果 |
|---|---|
| 单击 | 执行 `onPrimaryAction` |
| 长按 | 打开菜单 |
| 未设置 `onPrimaryAction` 时单击 | 直接打开菜单 |

这适合“播放并提供更多播放方式”之类的场景：单击完成最常见操作，长按访问低频操作。

它和普通 `ContextMenu` 的差别在于：这里仍然是一个 `Menu`，只是增加了主要点击行为。

**基于文档内容推导：** 是否提供 `onPrimaryAction` 会直接改变菜单的发现方式。设置后，用户必须知道长按才能看到菜单，因此不适合把关键且唯一的功能只放在长按菜单中。

## 禁用菜单项

使用 `disabled(true)` modifier 可以让菜单项保留显示，但变成灰色且不可交互：

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Locked"
  systemImage="lock"
  modifiers={[disabled(true)]}
  onPress={handleLocked}
/>
```

禁用后：

- 菜单项仍然存在。
- 菜单项显示为灰色。
- 用户无法触发它。
- `onPress` 不会执行。

这不同于条件渲染。条件渲染会彻底移除菜单项，而 `disabled(true)` 会向用户展示该功能存在，只是当前不可使用。

## 可选择项目与勾选状态

需要在菜单中表示布尔状态时，应使用 `Toggle`：

```tsx
const [showCompleted, setShowCompleted] = useState(true);

<Menu label="Filter" systemImage="line.3.horizontal.decrease.circle">
  <Toggle
    isOn={showCompleted}
    label="Show completed"
    systemImage="checkmark.circle"
    onIsOnChange={setShowCompleted}
  />
</Menu>
```

放在 `Menu` 中的 `Toggle` 会自动呈现为：

- 可选的前置 SF Symbol。
- 标签文字。
- 当 `isOn` 为 `true` 时显示的尾部勾选标记。

`isOn` 相当于 React 表单中的受控值，`onIsOnChange` 相当于状态更新回调。

文档明确建议使用这个模式，不要自行创建带勾选图标的自定义菜单项。使用 `Toggle` 可以让视觉表现、状态语义和原生交互保持一致。

## 图标按钮与无障碍标签

使用 `labelStyle('iconOnly')` 可以隐藏标签文字，只显示图标：

```tsx
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

<Menu
  label="Settings menu"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}>
  <Button label="Menu Item 1" onPress={handleItem1} />
</Menu>
```

即使界面只显示图标，也必须保留 `label`：

```tsx
label="Settings menu"
```

这个字符串用于无障碍语义。不能因为视觉上隐藏了文字就传入空字符串或省略标签。

对 React Web 开发者而言，这类似于只有图标的 `<button>` 仍需提供可访问名称，但这里通过 `Menu` 的 `label` 表达，而不是直接照搬 `aria-label`。

## 触发器样式

### 常规按钮样式

使用 `buttonStyle` modifier 修改菜单触发器外观：

```tsx
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

<Menu
  label="Styled Menu"
  modifiers={[buttonStyle('borderedProminent')]}>
  <Button label="Action" onPress={handleAction} />
</Menu>
```

本页展示的样式值包括：

- `borderedProminent`
- `glass`
- `glassProminent`

当前文档没有列出所有可用 `buttonStyle` 值。

### Liquid Glass 外观

普通玻璃效果：

```tsx
<Menu
  label="Glass Menu"
  systemImage="ellipsis.circle"
  modifiers={[buttonStyle('glass')]}>
  {/* menu items */}
</Menu>
```

更突出的玻璃效果：

```tsx
<Menu
  label="Glass Prominent Menu"
  systemImage="slider.horizontal.3"
  modifiers={[buttonStyle('glassProminent')]}>
  {/* menu items */}
</Menu>
```

### 重要限制：不要对标签使用 `glassEffect()`

为了创建玻璃菜单，必须将：

```tsx
buttonStyle('glass')
```

或：

```tsx
buttonStyle('glassProminent')
```

应用到 `Menu` 本身。

不要为了得到玻璃外观而对 `Menu` 的标签视图使用 `glassEffect()`。文档明确指出，这会导致菜单关闭时触发器后方短暂出现矩形光晕。

原因在于 `buttonStyle` 能正确参与 `Menu` 的关闭动画，而直接装饰标签视图不能得到同样的动画整合。

这是本页最明确的视觉坑点。

## API 参考

### `Menu`

类型：

```tsx
React.Element<MenuProps>
```

支持平台：

- iOS
- tvOS

用途：单击后显示下拉菜单；如果配置了 `onPrimaryAction`，则改为长按显示菜单。

### `children`

类型：

```tsx
ReactNode
```

支持内容：

- `Button`
- `Toggle`
- `Picker`
- `Section`
- `Divider`
- 嵌套 `Menu`

它表示菜单打开后展示的项目。

### `label`

类型：

```tsx
string | ReactNode
```

可以是：

- 字符串：创建简单文字标签，也可以配合 `systemImage`。
- React 节点：创建自定义标签。

如果自定义内容来自 React Native，需要通过 `RNHostView` 嵌入。

### `onPrimaryAction`

类型：

```tsx
() => void
```

可选属性。

设置后：

- 单击调用该函数。
- 长按打开菜单。

未设置时：

- 单击打开菜单。

### `systemImage`

类型：

```tsx
string
```

可选属性，用来指定 SF Symbol 名称。

限制：只有在 `label` 是字符串时才会使用。

### 继承属性

`Menu` 继承 `CommonViewModifierProps`，因此可以通过 `modifiers` 接收通用 SwiftUI modifier。

当前文档未提供完整继承属性清单，需要结合 modifiers API 文档查看。

## React Web 开发者容易误解的地方

### 这不是 Web 下拉框

`Menu` 不是 `<select>`，也不是基于绝对定位实现的 Popover。它映射到 Apple SwiftUI 的原生菜单，布局、动画和交互由平台负责。

因此，本页没有提供 Web 菜单中常见的配置，例如：

- `z-index`
- `position`
- portal 容器
- 点击外部关闭
- 菜单宽度
- 展开方向

不能假设这些 CSS 和 DOM 控制方式在这里适用。

### ReactNode 不代表任意节点都能直接使用

虽然 `label` 和 `children` 的类型涉及 `ReactNode`，但它们有各自的原生上下文约束：

- 菜单内容应使用文档列出的 SwiftUI 菜单组件。
- React Native 视图作为标签时需要 `RNHostView`。
- Web DOM 元素不能用于原生应用。

### 点击与长按不是事件冒泡差异

是否单击打开菜单由 `onPrimaryAction` 是否存在决定。这是组件的公开交互契约，不是浏览器中的捕获、冒泡或 `preventDefault()` 问题。

### 样式不是 CSS

样式通过 SwiftUI modifier 表达：

```tsx
modifiers={[buttonStyle('glass')]}
```

不要寻找 `className`、伪类或 CSS 选择器。本页也没有说明可以通过 React Native `StyleSheet` 直接设置 `Menu` 的 SwiftUI 外观。

### 图标依赖 Apple 系统资源

`systemImage` 使用 SF Symbols，不是跨平台图片资源。由于当前组件本身仅支持 iOS 和 tvOS，代码设计时不应假定同一个图标配置可以直接复用到 Android 或 Web。

## 实际开发建议

以下内容为**基于文档内容推导**：

1. 普通“更多操作”入口使用默认 `Menu`，让单击直接展开菜单。
2. 只有确实存在高频默认操作时才设置 `onPrimaryAction`，否则长按入口可能不易被发现。
3. 菜单状态选项使用 `Toggle`，不要用普通 `Button` 手动维护勾选图标。
4. 暂时不可用但需要让用户知道其存在的功能，使用 `disabled(true)`；完全不应出现的功能则通过条件渲染移除。
5. 使用 `Section` 和 `Divider` 组织不同性质的操作，把破坏性操作与普通操作分开。
6. 图标触发器仍应提供清晰的文字 `label`，保证无障碍语义。
7. 在同时支持 Android 或 Web 的项目中，需要在组件边界处理平台差异，因为本组件没有声明支持这些平台。
8. 使用玻璃效果时只通过 `buttonStyle('glass')` 或 `buttonStyle('glassProminent')` 实现，避免关闭动画中的矩形光晕。

以下为**基于经验建议**：

- 升级或安装前确认项目实际使用的 Expo SDK，并以对应版本文档为准，不要直接把未发布版本示例复制到稳定版项目。
- 在真机或目标 tvOS 设备上验证长按、焦点、图标和菜单层级。原生菜单的实际体验无法仅通过 React 代码静态判断。
- 删除等不可逆操作除了使用 `role="destructive"` 表达视觉语义外，还应在业务层提供确认和错误处理；本页没有覆盖这些业务保护措施。
- 不要创建过深的嵌套菜单。即使 API 允许嵌套，移动端层级过深也会增加操作成本。

## 总结

`@expo/ui/swift-ui` 的 `Menu` 让 Expo/React Native 应用通过 React JSX 使用 Apple 原生 SwiftUI 菜单。

使用时需要掌握以下要点：

- 用 `Host` 承载 SwiftUI 菜单。
- 默认单击打开菜单；提供 `onPrimaryAction` 后，单击执行主要操作、长按打开菜单。
- 菜单可以包含按钮、开关、选择器、分组、分隔线和子菜单。
- React Native 标签必须通过 `RNHostView` 嵌入。
- 状态选择项应使用 `Toggle`，禁用项应使用 `disabled(true)`。
- 仅显示图标时仍须保留文字 `label`。
- 玻璃菜单必须使用 `buttonStyle`，不能对标签直接使用 `glassEffect()`。
- 该组件仅支持 iOS 和 tvOS，其中 tvOS 至少需要 17.0。
- 当前页面属于下一 SDK 版本文档，实际开发应确认所用 Expo SDK 是否支持这些 API。

---

## 文档导航

- **上一页**：[link](./124__link.md)
- **下一页**：[modifiers](./126__modifiers.md)
