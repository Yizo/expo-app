# FieldGroup：构建分组设置列表

`FieldGroup` 是 `@expo/ui` 提供的跨平台组件，用于构建类似 iOS“设置”页面的可滚动分组列表。它支持 Android、iOS、Web，并包含在 Expo Go 中。

> 本页描述的是下一个 Expo SDK 版本中的 API，不是当前稳定版本。原文指出，当前最新稳定文档对应 SDK 56。实际开发时应确认项目 SDK 版本与所查文档一致。

## 文档解决的问题

`FieldGroup` 主要解决以下 UI 需求：

- 将开关、文本等设置项组织为多个分组。
- 为分组提供标题和说明文字。
- 自动呈现类似原生设置页面的分组样式。
- 在 Android、iOS 和 Web 上使用统一的 React API。
- 在需要时通过平台专属 modifier 调整原生表现。

典型场景包括：

- 通知设置
- 隐私设置
- 账户设置
- 应用信息
- 由多个分组组成的表单

它不是通用的网页表格组件，而是面向“设置项列表”这种移动端 UI 模式。

## 阅读前需要理解的概念

### Expo UI 与原生组件

`@expo/ui` 允许 React Native 应用使用由平台原生 UI 技术实现的组件：

- iOS 对应 SwiftUI。
- Android 对应 Jetpack Compose。
- Web 提供对应的跨平台实现。

React Web 开发者可以把它理解为：你仍然使用 JSX 编写界面，但组件最终会映射到不同平台的 UI 系统，而不是统一渲染为浏览器 DOM。

这也是部分属性在不同平台上可能产生差异的原因。

### Host

示例中的 `Host` 是承载 Expo UI 内容的宿主组件：

```tsx
<Host style={{ flex: 1 }}>
  <FieldGroup>{/* 设置项 */}</FieldGroup>
</Host>
```

在本文场景中，`Host` 还负责为 `FieldGroup` 提供确定的可用高度。

### Section、Header 与 Footer

`FieldGroup` 采用分组结构：

- `FieldGroup`：整个可滚动列表。
- `FieldGroup.Section`：一个设置分组。
- `FieldGroup.SectionHeader`：分组顶部的自定义标题区域。
- `FieldGroup.SectionFooter`：分组底部的自定义说明区域。

可以将其类比为 React Web 中的以下结构：

```tsx
<SettingsList>
  <SettingsSection>
    <SectionHeader />
    <SettingRow />
    <SettingRow />
    <SectionFooter />
  </SettingsSection>
</SettingsList>
```

但 `FieldGroup` 的布局和样式由 Expo UI 及相应平台的原生 UI 系统处理。

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

这里使用 `expo install` 而不是直接使用包管理器的普通安装命令。它的作用是按照当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的纯 React Native 工程中使用，而不是现成的 Expo 项目，必须先为项目安装并配置 `expo`，使其能够使用 Expo Modules。

当前文档未涉及原生工程的具体配置步骤。

## 基本用法：分组设置表单

```tsx
import { useState } from 'react';
import { Host, FieldGroup, Switch, Text } from '@expo/ui';

export default function FieldGroupExample() {
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section title="Notifications">
          <Switch
            label="Push"
            value={notifications}
            onValueChange={setNotifications}
          />
          <Switch
            label="Email"
            value={analytics}
            onValueChange={setAnalytics}
          />
        </FieldGroup.Section>

        <FieldGroup.Section title="About">
          <Text>Version 1.0.0</Text>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
```

这段代码包含两个分组：

1. `Notifications` 分组中放置两个可交互的开关。
2. `About` 分组中显示应用版本信息。

`Switch` 仍然采用 React 常见的受控组件模式：

- `value` 接收当前状态。
- `onValueChange` 在值发生变化时更新状态。

这部分和 React Web 中通过 `checked`、`onChange` 控制复选框的思路相同，只是组件名称与事件属性不同。

## 高度与滚动机制

这是本文最重要的布局限制。

`FieldGroup` 自带滚动能力，但自身没有固有高度。它会尝试撑满父容器，因此父容器必须具有确定尺寸。

推荐写法：

```tsx
<Host style={{ flex: 1 }}>
  <FieldGroup>{/* 内容 */}</FieldGroup>
</Host>
```

也可以为宿主容器设置明确高度。

以下场景无法正常显示：

```tsx
<Host matchContents>
  <FieldGroup>{/* 内容 */}</FieldGroup>
</Host>
```

`matchContents` 属于根据子内容决定自身尺寸的模式，而 `FieldGroup` 又需要父容器先提供有界高度。两者会形成尺寸计算冲突：父组件等待子组件决定高度，子组件却需要父组件先给出高度。

对于 React Web 开发者，可以将其类比为：一个需要在剩余空间内滚动的容器不能只依赖 `height: auto`，通常需要父级提供明确高度或通过 Flex 布局建立可计算的空间。

## Section 的两种标题方式

### 使用简单文本标题

通过 `title` 直接传入字符串：

```tsx
<FieldGroup.Section title="Notifications">
  {/* 设置项 */}
</FieldGroup.Section>
```

这种方式适合不需要自定义排版的分组标题。

### 使用自定义 Header 和 Footer

需要自定义标题内容或添加说明文字时，可以使用插槽组件：

```tsx
<FieldGroup.Section>
  <FieldGroup.SectionHeader>
    <Text textStyle={{ fontSize: 16, fontWeight: '700' }}>
      Privacy
    </Text>
  </FieldGroup.SectionHeader>

  <Switch
    label="Share usage"
    value={enabled}
    onValueChange={setEnabled}
  />

  <FieldGroup.SectionFooter>
    <Text textStyle={{ fontSize: 12, color: '#8E8E93' }}>
      Helps us improve the app. You can disable this at any time.
    </Text>
  </FieldGroup.SectionFooter>
</FieldGroup.Section>
```

这里的 Header 和 Footer 是具有特定语义的插槽标记，`FieldGroup.Section` 会把它们放到对应位置并应用分组样式。

一个 Section 最多穿插：

- 一个 `FieldGroup.SectionHeader`
- 一个 `FieldGroup.SectionFooter`

如果同时设置 `title` 并提供 `FieldGroup.SectionHeader`，自定义 Header 优先，`title` 会被忽略。

## 隐式分组

`FieldGroup` 推荐直接放置一个或多个 `FieldGroup.Section`：

```tsx
<FieldGroup>
  <FieldGroup.Section>{/* rows */}</FieldGroup.Section>
</FieldGroup>
```

不过，直接放在 `FieldGroup` 中、没有被 Section 包裹的子元素也可以使用。它们会被自动组织到隐式分组中，行为与 SwiftUI 的 `Form` 类似。

```tsx
<FieldGroup>
  <Switch label="Enabled" value={enabled} onValueChange={setEnabled} />
</FieldGroup>
```

非 Section 子元素还可以出现在多个显式 Section 之间，并按原有顺序渲染。

**基于文档内容推导：** 简单页面可以依靠隐式分组减少代码；当页面具有明确的信息层级、标题或说明文字时，显式使用 `FieldGroup.Section` 更容易维护。

## API 说明

引入组件：

```tsx
import { FieldGroup } from '@expo/ui';
```

### FieldGroup

`FieldGroup` 是整个可滚动设置列表的容器。

| 属性 | 类型 | 平台 | 作用 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Android、iOS、Web | Section 或其他需要按顺序呈现的子元素 |
| `disabled` | `boolean` | Android、iOS、Web | 禁用组件，使其不响应用户交互 |
| `hidden` | `boolean` | Android、iOS、Web | 隐藏组件 |
| `modifiers` | `ModifierConfig[]` | Android、iOS | 使用平台专属 modifier 调整原生表现 |
| `onAppear` | `() => void` | Android、iOS、Web | 组件出现在屏幕上时调用 |
| `onDisappear` | `() => void` | Android、iOS、Web | 组件从屏幕上移除时调用 |
| `onPress` | `() => void` | Android、iOS、Web | 组件被按下时调用 |
| `style` | 受限的 `ViewStyle` | Android、iOS、Web | 设置支持的跨平台样式 |
| `testID` | `string` | Android、iOS、Web | 在端到端测试中定位组件 |

### FieldGroup.Section

`FieldGroup.Section` 表示一组相关的设置行。

除 `children`、`disabled`、`hidden`、`modifiers`、生命周期回调、`onPress`、`style` 和 `testID` 外，它还有以下分组属性：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `title` | `string` | 无 | 使用默认样式显示纯文本分组标题 |
| `titleUppercase` | `boolean` | `false` | 控制默认标题是否使用大写形式 |

`titleUppercase` 有两个重要限制：

- 提供 `FieldGroup.SectionHeader` 后，该属性会被忽略。
- 在 iOS 上会被忽略，因为 SwiftUI `Form` 会根据列表样式决定标题大小写。

这意味着不要依赖 `titleUppercase` 实现严格一致的跨平台视觉效果。

### SectionHeader 与 SectionFooter

这两个组件都只有一个可选属性：

```ts
children?: ReactNode
```

- `SectionHeader` 的内容渲染为分组标题。
- `SectionFooter` 的内容渲染为分组底部说明。

文档没有列出它们自己的 `style`、事件或状态属性。需要调整内容样式时，应设置其内部组件，例如示例中的 `Text`。

## style 的可用范围

`FieldGroup` 和 `FieldGroup.Section` 的 `style` 不是完整的 React Native `ViewStyle`，只接受以下属性：

- `padding`
- `paddingHorizontal`
- `paddingVertical`
- `paddingTop`
- `paddingBottom`
- `paddingLeft`
- `paddingRight`
- `backgroundColor`
- `borderRadius`
- `borderWidth`
- `borderColor`
- `opacity`
- `width`
- `height`

这些跨平台样式会在 iOS 上转换为 SwiftUI modifier，在 Android 上转换为 Jetpack Compose modifier。

React Web 开发者需要特别注意：这里不能像 CSS 或普通 React Native `View` 那样任意传入所有布局属性。例如，类型中没有列出的 `margin`、`display`、`position` 或 `flex` 并不属于该组件公开的 `style` 范围。

## 平台专属 modifiers

`modifiers` 是 Android 和 iOS 上的平台专属扩展入口：

- iOS modifier 来自 `@expo/ui/swift-ui/modifiers`。
- Android modifier 来自 `@expo/ui/jetpack-compose/modifiers`。
- Web 不支持该属性。

它用于跨平台 `style` 无法表达某些原生能力时进行补充。

**基于文档内容推导：** 使用 modifier 会引入平台分支和不同的实现路径，因此应先使用组件公开的跨平台属性；只有明确需要原生平台差异时，再使用这个扩展入口。

当前文档没有列出可用 modifier 的具体名称和配置方式。

## 生命周期与交互属性

### onAppear 与 onDisappear

```tsx
<FieldGroup
  onAppear={() => {
    // 组件出现在屏幕上
  }}
  onDisappear={() => {
    // 组件从屏幕上移除
  }}
/>
```

它们描述的是组件的屏幕出现和移除事件。不要未经验证就将其等同于 React Web 的 `useEffect` 挂载与清理机制，因为文档只说明了触发时机，没有说明更细致的生命周期语义。

### disabled

`disabled` 会使组件不响应用户交互。它可用于整个 `FieldGroup`，也可用于单独的 Section。

### hidden

`hidden` 控制组件是否隐藏。当前文档没有进一步说明隐藏后是否保留布局空间，也没有说明它与卸载组件之间的关系。

### onPress

`FieldGroup` 和 Section 都提供 `onPress`。当前文档没有解释父子组件同时设置 `onPress` 时的事件传播规则，因此不应套用浏览器 DOM 的冒泡模型。

### testID

`testID` 用于端到端测试中定位组件。它更接近测试选择器，而不是面向用户的 HTML `id`。

## 行位置计算方法

`FieldGroup` 提供静态方法：

```ts
FieldGroup.getFieldItemPosition(index, total)
```

参数如下：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `index` | `number` | 当前行在分组中的索引 |
| `total` | `number` | 分组中的总行数 |

返回值是 `FieldItemPosition`：

```ts
'leading' | 'middle' | 'trailing' | 'only'
```

各值表示：

- `leading`：分组中的第一行。
- `middle`：分组中间的行。
- `trailing`：分组中的最后一行。
- `only`：分组中唯一的一行。

该位置主要用于计算分组列表各行的圆角。例如，唯一一行通常四角都需要圆角，而首行和末行只需要处理外侧圆角。

**基于文档内容推导：** 当开发自定义设置行，并需要让它保持与分组容器一致的边框或圆角样式时，这个方法会比较有用。

文档没有说明索引是否从 `0` 开始，也没有说明非法的 `index`、`total` 会如何处理，调用时不应自行假定其越界行为。

## 容易踩坑的地方

### 使用了内容自适应的父容器

`FieldGroup` 没有自身高度，不能放在 `Host matchContents` 这类由内容决定尺寸的容器中。应为父级设置 `flex: 1` 或明确高度。

### 把它当成普通 DOM 容器

`FieldGroup` 不是 `<div>`，其 `style` 属性范围有限，事件模型和生命周期语义也不能直接按照 DOM 推断。

### 同时使用 title 和自定义 Header

一旦存在 `FieldGroup.SectionHeader`，Section 的 `title` 会被忽略。应在两种标题方案中选择一种。

### 依赖 titleUppercase 保证平台一致

`titleUppercase` 在 iOS 上无效。需要严格控制标题内容时，可以使用自定义 Header，并自行传入所需文本。

### 在 Web 上使用 modifiers

`modifiers` 只支持 Android 和 iOS。跨平台代码必须考虑 Web 不支持这一入口。

### 使用文档版本与项目 SDK 不匹配

本页属于下一个 SDK 版本的未版本化文档。API 可能尚未存在于 SDK 56，或者在稳定版中表现不同。安装和编码前必须核对项目使用的 SDK 文档。

## 实际开发建议

以下属于**基于经验建议**：

1. 设置页面最外层使用占满页面的 `Host`，避免滚动区域高度不确定。
2. 按业务含义拆分 Section，例如“通知”“隐私”“关于”，不要仅按视觉数量分组。
3. 简单标题使用 `title`；需要图标、复杂排版或说明文字时再使用 Header/Footer。
4. 优先使用跨平台属性，尽量把平台 modifier 限制在独立模块中。
5. 为关键分组设置稳定的 `testID`，便于端到端测试。
6. 分别在 Android、iOS 和 Web 上验证样式，不要根据 Web 结果推断原生平台效果。
7. 使用 `getFieldItemPosition` 时，先由实际行数组计算 `index` 和 `total`，避免将隐藏行也错误计入圆角位置。

## 当前文档未涉及的内容

本文没有说明：

- `FieldGroup` 的完整无障碍属性和读屏行为。
- 键盘导航与焦点管理。
- 大量设置项下的性能特征。
- 下拉刷新或滚动位置控制。
- 表单验证和数据提交。
- modifier 的具体配置清单。
- 非 Expo React Native 工程的详细接入步骤。
- `onPress` 的事件传播规则。
- `hidden` 对布局和生命周期的具体影响。
- 非法行索引的处理方式。

这些内容不能仅根据本文作出确定结论，需要查询对应组件或平台的其他文档。

## 总结

`FieldGroup` 用于创建跨 Android、iOS 和 Web 的原生风格分组设置列表。其核心结构是：

```tsx
<Host style={{ flex: 1 }}>
  <FieldGroup>
    <FieldGroup.Section title="分组标题">
      {/* 设置行 */}
    </FieldGroup.Section>
  </FieldGroup>
</Host>
```

使用时最关键的两点是：

- 必须由父容器提供确定高度，否则 `FieldGroup` 可能无法显示。
- Expo UI 映射到不同平台的原生 UI 系统，因此样式、标题大小写和 modifier 支持存在平台差异。

---

## 文档导航

- **上一页**：[column](./122__column.md)
- **下一页**：[host](./124__host.md)
