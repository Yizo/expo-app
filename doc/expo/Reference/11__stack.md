# Expo Router Stack 学习笔记

## 文档解决的问题

`expo-router` 的 `Stack` API 用于构建具有“页面压栈”行为的导航结构，并配置每个页面对应的原生标题栏、返回按钮、搜索栏、菜单和工具栏。

它适合以下场景：

- 页面存在层级关系，例如“列表 → 详情 → 编辑”。
- 进入新页面后需要显示系统风格的返回按钮。
- 需要使用 iOS、Android 原生导航栏或底部工具栏能力。
- 需要分别配置页面标题、导航栏外观、操作按钮和菜单。

支持 Android、iOS、tvOS 和 Web；基础 `Stack` 也包含在 Expo Go 中。部分子组件和属性仅支持 iOS 或 Android，不能仅根据组件总览中的平台列表判断具体功能是否跨平台。

> 文档没有介绍安装和项目初始化流程，而是要求参考 Expo Router 总体文档完成安装与配置。

## React Web 开发者需要先理解的概念

### Stack 不是普通的 React 布局容器

可以把 Stack 类比为同时承担以下职责的 React Router 路由容器：

- 记录页面访问历史。
- 在进入详情页时压入一个新页面。
- 返回时弹出当前页面。
- 为每个页面连接系统原生导航栏和页面切换动画。

最小用法：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

在 Expo Router 中，`Layout` 通常是路由目录中的 `_layout.tsx`。`<Stack />` 会将该目录下的路由组织为栈式导航。

### Header、Toolbar 与页面内容不是同一层 UI

- **Header**：页面顶部的原生导航栏区域。
- **Title**：Header 中的页面标题。
- **BackButton**：Header 中由导航历史驱动的返回按钮。
- **Toolbar left/right**：Header 左右两侧的操作区域。
- **Toolbar bottom**：页面底部的原生工具栏。
- **SearchBar**：与原生 Header 集成的搜索框。

这些组件主要是在声明原生导航 UI 的配置，不等同于在网页 DOM 中按 JSX 位置渲染普通元素。

## Stack 与 Screen

### `Stack`

`Stack` 渲染原生栈导航器：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

原文将更完整的导航器使用流程放在 Stack layout 指南中；当前文档主要是 API 参考。

### `Stack.Screen`

`Stack.Screen` 用于声明或配置某个栈页面。它既可以出现在 Layout 中，也可以在页面组件中用于配置当前页面，但两种位置支持的属性不同。

| 属性 | 作用 | 关键限制 |
| --- | --- | --- |
| `name` | 指定要配置的路由名称 | 在 Layout 内使用时必填 |
| `options` | 设置 React Navigation 的原生 Stack 页面选项 | Layout 中可传对象或函数；页面组件中只能直接传对象 |
| `initialParams` | 设置路由初始参数 | 仅支持 Layout |
| `listeners` | 监听导航事件 | 仅支持 Layout |
| `getId` | 根据路由参数生成页面唯一 ID | 可用于区分同一路由的不同实例 |
| `dangerouslySingular` | 已有对应页面时复用它，而不是继续压入新实例 | 仅支持 Layout |
| `redirect` | 将该路由重定向到最近的同级路由 | 仅支持 Layout；所有子路由都重定向时，Layout 渲染 `null` |

`listeners` 可监听的事件包括：

- `focus`、`blur`
- `beforeRemove`
- `transitionStart`、`transitionEnd`
- `gestureCancel`
- `sheetDetentChange`
- `state`

> **原文异常：** `dangerouslySingular` 下方同时写着“已弃用，请改用 `dangerouslySingular`”，新旧名称完全相同。仅凭当前文档无法确定实际被弃用的是哪个 API，应视为文档错误，不能据此推断替代属性。

## 配置顶部 Header

### `Stack.Header`

用于设置导航栏背景、颜色、模糊效果、阴影和可见性。它可以直接放在页面中，也可以嵌套在 Layout 的 `Stack.Screen` 中。

```tsx
export default function Page() {
  return (
    <>
      <Stack.Header
        blurEffect="systemMaterial"
        style={{ backgroundColor: '#fff' }}
      />
      <ScreenContent />
    </>
  );
}
```

主要属性：

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `hidden` | 全平台 | 完全隐藏 Header，默认 `false` |
| `style` | 全平台 | 配置标准 Header 的前景色、背景色和阴影 |
| `transparent` | 全平台 | 将 Header 设为透明并绝对定位，页面内容会滚动到它下面 |
| `blurEffect` | iOS | 为 Header 背景添加原生模糊效果 |
| `largeStyle` | iOS | 设置大标题 Header 的背景和阴影 |
| `asChild` | 全平台 | 使用子组件完全替换默认 Header |
| `children` | 全平台 | `asChild` 为 `true` 时提供自定义 Header |

`style` 支持的重点字段：

- `color`：Header 内元素的着色。
- `backgroundColor`：Header 背景色。
- `shadowColor: 'transparent'`：隐藏 Header 的阴影或分隔线。

以下情况会自动启用 `transparent`：

- `style.backgroundColor` 为 `'transparent'`。
- 设置了 `blurEffect`，因为模糊效果依赖透明 Header。

> 透明 Header 会覆盖在页面内容上方。页面需要自行考虑顶部间距和内容可读性，这一点不同于普通 Web 文档流。

同一页面渲染多个 `Stack.Header` 时，组件树中最后渲染的实例生效。

## 设置标题与返回按钮

### `Stack.Title`

可在 Layout 的 `Stack.Screen` 内设置，也可直接放在页面组件中：

```tsx
<Stack.Title>My Page</Stack.Title>
```

主要属性：

- `children`：字符串标题；启用 `asChild` 后也可以是自定义组件。
- `asChild`：使用自定义组件作为标题。
- `large`：启用 iOS 大标题。
- `style`：设置普通标题的颜色、字体、字号、字重和对齐。
- `largeStyle`：设置 iOS 大标题样式。

```tsx
<Stack.Title asChild>
  <MyCustomTitle />
</Stack.Title>
```

同一页面存在多个 `Stack.Title` 时，最后渲染的实例生效。

### `Stack.Screen.BackButton`

用于配置当前页面的原生返回按钮：

```tsx
<Stack.Screen.BackButton displayMode="minimal">
  Back
</Stack.Screen.BackButton>
```

| 属性 | 作用 |
| --- | --- |
| `children` | 返回按钮文字 |
| `hidden` | 隐藏返回按钮 |
| `src` | 自定义返回按钮图片 |
| `style` | 设置返回按钮文字的字体和字号 |
| `displayMode` | 设置 iOS 返回按钮显示模式 |
| `withMenu` | iOS 长按返回按钮时是否显示上下文菜单 |

同一页面存在多个返回按钮配置时，最后渲染的实例生效。

## 原生搜索栏

### `Stack.SearchBar`

该组件把搜索框集成到原生 Stack Header 中：

```tsx
<Stack.SearchBar
  placeholder="Search..."
  onChangeText={(text) => console.log(text)}
/>
```

它继承 `SearchBarProps`。当前文档没有展开这些继承属性的完整定义。

使用 `Stack.SearchBar` 会自动设置 `headerShown: true`，因为搜索栏属于原生 Header，而不是页面内容中的普通输入框。

在 iOS 26 及以上版本，如果要把搜索栏显示在底部工具栏中，需要同时使用：

```tsx
<Stack.SearchBar onChangeText={() => {}} />

<Stack.Toolbar placement="bottom">
  <Stack.Toolbar.SearchBarSlot />
</Stack.Toolbar>
```

`SearchBarSlot` 是底部工具栏中的显示位置，实际搜索栏仍由 `Stack.SearchBar` 配置。

## Toolbar 的位置与组成

### `Stack.Toolbar`

工具栏只支持 Android 和 iOS，支持三个位置：

| `placement` | 位置 | 默认值 |
| --- | --- | --- |
| `left` | 顶部 Header 左侧 | 否 |
| `right` | 顶部 Header 右侧 | 否 |
| `bottom` | 页面底部工具栏 | 是 |

`left` 或 `right` 会自动显示 Header。`bottom` 只能在**页面组件**中使用，不能放在 Layout 中。

```tsx
<Stack.Toolbar placement="left">
  <Stack.Toolbar.Button
    icon="sidebar.left"
    onPress={() => alert('Pressed')}
  />
</Stack.Toolbar>
```

主要属性：

- `asChild`：仅对 `left`、`right` 有效，使用自定义组件替换默认 Header 区域布局。
- `backgroundColor`：Android 工具栏及菜单背景色。
- `tintColor`：Android 工具栏项目的默认着色，子项目可以覆盖。
- `disableImePadding`：Android 底部工具栏是否关闭键盘自动避让间距。
- `children`：可组合 Button、Menu、View、Spacer 和 SearchBarSlot。

同一页面、同一配置目标出现多个 Toolbar 时，最后渲染的实例优先。

## Toolbar 子组件

### `Stack.Toolbar.Button`

按钮可以直接使用文本：

```tsx
<Stack.Toolbar.Button icon="star.fill">
  Favorite
</Stack.Toolbar.Button>
```

也可以组合结构化内容：

```tsx
<Stack.Toolbar.Button>
  <Stack.Toolbar.Icon sf="star.fill" />
  <Stack.Toolbar.Label>Favorite</Stack.Toolbar.Label>
  <Stack.Toolbar.Badge>3</Stack.Toolbar.Badge>
</Stack.Toolbar.Button>
```

重要属性包括 `onPress`、`disabled`、`hidden`、`icon`、`tintColor`、`style`、`selected` 和 `variant`。

需要特别注意：

- 按钮设置图标后，Label 不再可见，只用于无障碍信息。
- Badge 只支持顶部 `left`、`right`，不支持 iOS 底部工具栏。
- Android 的 `icon` 只支持图片源。
- iOS 的 `icon` 支持 SF Symbol 名称、图片源或 Xcode asset。
- iOS 底部工具栏的 `icon` 只接受字符串形式的 SF Symbol；自定义图片应使用 `image`。
- `image` 只支持 iOS 底部工具栏。
- `accessibilityLabel` 用于 TalkBack 和 VoiceOver，图标按钮应提供有意义的标签。
- `hidesSharedBackground` 仅支持 iOS 26 及以上。
- `variant` 仅支持 iOS，可选 `plain`、`done`、`prominent`。
- `separateBackground` 可让 iOS 项目使用独立背景。

### 图标渲染模式

`iconRenderingMode` 或 Icon 的 `renderingMode` 控制图片图标如何着色：

- `template`：把图片当作模板并应用 `tintColor`，适合单色图标。
- `original`：保留图片原始颜色，适合彩色图标。

默认行为：

- iOS 设置了 `tintColor` 时默认为 `template`，否则为 `original`。
- Android 默认为 `template`。
- 该设置不影响 SF Symbols，只影响图片图标。

### `Stack.Toolbar.Icon`

支持三类图标来源：

- `src`：React Native 图片源。
- `sf`：iOS SF Symbol 名称。
- `xcasset`：iOS Xcode `.xcassets` 中的资源名。

SF Symbols 是 Apple 提供的系统图标库，不是跨平台图标名称。为 Android 提供图标时，应使用 `require()` 或 `{ uri }` 形式的图片源。

### `Stack.Toolbar.Label` 与 `Badge`

- `Label` 的 `children` 是显示文本。
- `Badge` 的 `children` 是角标文本。
- `Badge.style` 可配置字体、字重、字号、文字色和背景色。

### `Stack.Toolbar.Menu`

Menu 用于创建原生菜单，可包含 Icon、Label、Badge、MenuAction，并可嵌套子菜单。

```tsx
<Stack.Toolbar.Menu>
  <Stack.Toolbar.Icon sf="ellipsis.circle" />
  <Stack.Toolbar.Label>Options</Stack.Toolbar.Label>
  <Stack.Toolbar.MenuAction onPress={() => {}}>
    Action 1
  </Stack.Toolbar.MenuAction>
</Stack.Toolbar.Menu>
```

主要配置：

- `title`：菜单顶部标题。
- `disabled`、`hidden`：禁用或隐藏菜单。
- `destructive`：iOS 危险操作样式。
- `inline`：以内联形式展开，仅支持子菜单。
- `palette`：以单行调色板形式显示，仅支持 iOS 子菜单。
- `elementSize`：iOS 16+ 菜单元素尺寸，仅支持底部 Toolbar。
- `variant`、`separateBackground`、`hidesSharedBackground`：iOS 外观控制。

平台限制：

- Android 菜单根节点只渲染 `ImageSourcePropType` 图标。
- Android 会静默丢弃菜单根节点中的 SF Symbol 和 `xcasset` 名称。
- iOS 底部工具栏中的 `icon` 只支持字符串 SF Symbol；自定义图片使用 `image`。
- `image` 只支持 iOS 底部工具栏。

“静默丢弃”意味着不会一定产生错误，但图标可能直接不显示，因此跨平台测试不能省略。

### `Stack.Toolbar.MenuAction`

代表菜单中的可点击操作，支持：

- `onPress`：处理点击。
- `disabled`、`hidden`：禁用或隐藏。
- `destructive`：危险操作样式。
- `isOn`：显示为已选中状态。
- `subtitle`、`discoverabilityLabel`：iOS 补充说明。
- `icon`：SF Symbol 或图片源。

Android 只渲染图片源图标，SF Symbol 会被静默丢弃。

`unstable_keepPresented` 会在选择操作后保持菜单显示，但属于不稳定 API。iOS 会重建菜单，因此已打开的子菜单会关闭，滚动位置也会重置。

### `Stack.Toolbar.Spacer`

用于控制工具栏项目之间的间距：

- `width`：固定宽度。
- `hidden`：隐藏间距。
- `sharesBackground`：iOS 26+ 底部工具栏是否与相邻项目共享背景。

宽度规则：

- `left`、`right` 中必须提供 `width`。
- iOS 底部工具栏不提供 `width` 时，会弹性填充剩余空间。
- Android 在所有位置都必须提供 `width`。

### `Stack.Toolbar.SearchBarSlot`

用于把 `Stack.SearchBar` 放入底部工具栏。

- `hidden`：隐藏槽位。
- `hidesSharedBackground`：iOS 26+ 隐藏共享背景。
- `separateBackground`：iOS 26+ 使用独立背景。

设置 `separateBackground` 后，搜索栏始终以 `integratedButton` 形式渲染。要形成独立背景，相邻项目也应设置 `separateBackground`，或者使用 Spacer 分隔。

### `Stack.Toolbar.View`

用于在 Toolbar 中放置自定义 React 元素，支持 `hidden`，并可在 iOS 中控制共享或独立背景。

原文在该组件下重复列出了一组与 `Stack.Toolbar` 相同的 `placement`、`backgroundColor`、`disableImePadding` 等属性，随后又重新定义 `children`、`hidden` 等属性。当前页面没有解释这是继承关系还是文档生成错误，因此实现时应以项目实际 TypeScript 类型为准。

## 平台能力速查

| 能力 | Android | iOS | Web / tvOS |
| --- | --- | --- | --- |
| Stack、Screen、Header、Title、BackButton | 支持 | 支持 | 支持 |
| Header 模糊与大标题 | 不支持 | 支持 | 不支持 |
| Toolbar 容器 | 支持 | 支持 | 文档标为不支持 |
| 底部 Toolbar | 支持 | 支持 | 不支持 |
| SF Symbols / Xcode assets | 不支持 | 支持 | 不支持 |
| Android 键盘间距控制 | 支持 | 不适用 | 不适用 |
| iOS 26 共享背景能力 | 不支持 | 仅 iOS 26+ | 不支持 |

> 部分 Toolbar 子组件的标题标注了 Web 和 tvOS，但其父级 `Stack.Toolbar` 只标注 Android、iOS。当前文档没有说明脱离 Toolbar 使用这些子组件是否有效，不应据此认为 Web 已完整支持 Toolbar。

## 容易踩坑的地方

1. **Layout 与页面组件的能力不同**  
   `initialParams`、`listeners`、`redirect`、`dangerouslySingular` 和函数形式的 `options` 仅支持 Layout；底部 Toolbar 则只能用于页面组件。

2. **JSX 出现的位置不代表实际视觉位置**  
   `Stack.Title` 或 `Stack.Toolbar` 即使写在 `ScreenContent` 前面，也主要是在配置原生导航 UI。

3. **最后渲染的配置会覆盖前面的配置**  
   Header、Title、BackButton 和 Toolbar 都存在“最后一个实例优先”的规则。共享组件和页面组件同时配置时要检查覆盖顺序。

4. **透明 Header 会覆盖内容**  
   它不会像普通块级元素一样占据布局高度，页面内容可能被 Header 遮挡。

5. **图标能力高度依赖平台和位置**  
   SF Symbols 是 iOS 能力；Android 多处只接受图片源；iOS 底部 Toolbar 又有独立限制。

6. **搜索栏会强制显示 Header**  
   即使其他配置隐藏了 Header，使用 SearchBar 或左右 Toolbar 也会自动启用 `headerShown`。

7. **无障碍文本不能忽略**  
   图标存在时按钮 Label 可能只供屏幕阅读器使用。不要因为界面上看不到文本就删除它。

8. **不稳定 API 可能破坏菜单状态**  
   `unstable_keepPresented` 在 iOS 上会重建菜单，导致子菜单和滚动位置重置。

## 实际开发中的使用方式

一个较清晰的职责划分是：

```tsx
// _layout.tsx：声明路由和相对稳定的导航配置
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index">
        <Stack.Title>Home</Stack.Title>
      </Stack.Screen>
    </Stack>
  );
}
```

```tsx
// index.tsx：声明依赖当前页面状态的工具栏和交互
export default function Page() {
  return (
    <>
      <Stack.SearchBar onChangeText={(text) => console.log(text)} />

      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button
          icon="magnifyingglass"
          accessibilityLabel="搜索"
          onPress={() => {}}
        />
        <Stack.Toolbar.Spacer />
      </Stack.Toolbar>

      <ScreenContent />
    </>
  );
}
```

**基于文档内容推导：**

- 稳定、路由级的配置更适合放在 `_layout.tsx`。
- 与页面局部状态相关的标题、搜索和按钮可以放在页面组件中。
- 需要底部 Toolbar 时必须采用页面组件方案，因为 Layout 明确不支持。
- 跨平台项目应为 iOS SF Symbol 和 Android 图片源分别准备图标策略。

**基于经验建议：**

- 将 Android 与 iOS 的 Toolbar 行为分别在真机或模拟器中验证，不要只依赖 Web 预览。
- 为图标按钮统一提供 `accessibilityLabel`。
- 避免在 Layout 和页面中重复配置同一个 Title、Header 或 Toolbar，除非覆盖行为是明确设计。
- 使用 iOS 26+ 属性前做好系统版本验证与旧版本降级。
- 对文档中存在矛盾的 `dangerouslySingular` 弃用说明及 Toolbar 平台标注，以安装版本的 TypeScript 类型和实际运行结果为准。

## 文档明确内容与推导内容边界

### 文档明确说明

- Stack 渲染原生栈导航器。
- 各组件和属性的平台支持范围。
- Layout 专属属性以及底部 Toolbar 的页面组件限制。
- SearchBar 和左右 Toolbar 会自动显示 Header。
- 透明 Header 会绝对定位，内容可在其下方滚动。
- 多个配置组件存在“最后渲染者优先”的规则。
- Android 与 iOS 对图标来源和着色方式的差异。
- `unstable_keepPresented` 在 iOS 上会重建菜单并丢失子菜单及滚动状态。

### 基于文档内容推导

- Layout 适合集中维护稳定的路由级配置。
- 页面组件适合维护依赖页面状态的导航 UI。
- 图标资源需要制定跨平台方案。
- 使用透明 Header 时通常需要检查内容顶部布局。

### 当前文档未涉及

- Expo Router 的安装和初始配置步骤。
- 文件路由的完整命名规则。
- 页面跳转、返回和传参所使用的具体命令。
- `SearchBarProps`、`BlurEffect` 等继承类型的完整字段。
- Android、iOS 原生工程的手动配置过程。
- 测试、性能、服务端渲染和深链接方案。
- 各平台视觉效果完全一致的保证。

## 总结

`Stack` 不只是一个页面容器，而是 Expo Router 对原生栈导航及其导航栏能力的 React 声明式封装。使用时最重要的是区分 Layout 配置与页面配置、顶部 Header 与底部 Toolbar，并逐项确认平台及放置位置限制。

对于 React Web 开发者，最大的思维变化是：这些 JSX 组件经常不是普通页面元素，而是在配置由 iOS、Android 导航系统渲染的原生界面。相同代码可能因平台、系统版本和 Toolbar 位置产生不同能力与效果。

---

## 文档导航

- **上一页**：[split view](./10__split-view.md)
- **下一页**：[ui](./12__ui.md)
