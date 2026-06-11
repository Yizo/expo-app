# Expo Router Native Tabs：原生标签页 API 学习指南

## 文档解决的问题

本文介绍 `expo-router/unstable-native-tabs` 子模块。它用于在 Expo Router 项目中创建由 Android、iOS 等平台原生控件实现的标签页导航布局。

最基础的结构如下：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home" />
      <NativeTabs.Trigger name="settings" />
    </NativeTabs>
  );
}
```

它主要解决三个问题：

1. 使用 Expo Router 的文件路由组织不同标签页。
2. 使用系统原生标签栏，而不是完全由 JavaScript 模拟标签栏。
3. 配置标签栏及各标签的图标、文字、徽标、样式和导航行为。

适合以下场景：

- 应用以底部标签栏作为一级导航。
- 希望标签栏具有 Android 或 iOS 的系统原生外观及交互。
- 已经使用 Expo Router 管理页面路由。
- 需要针对 Android 和 iOS 分别使用 Material Icon、SF Symbols 等原生图标资源。

需要特别注意：模块路径包含 `unstable`，而且部分底层扩展 API 也明确标记为不稳定。采用前应评估 Expo SDK 小版本升级带来的变更风险。

---

## 阅读前需要理解的背景

### Expo Router

Expo Router 是 Expo 提供的文件路由系统。可以将它类比为 React Web 中的 Next.js 文件路由：

- 文件和目录结构决定路由。
- `_layout.tsx` 用来定义一组路由共享的导航布局。
- 页面文件负责具体页面内容。
- `router.push()` 和 `<Link />` 用于发起 JavaScript 导航。

不过，移动端导航除了“URL 对应哪个组件”，还涉及原生导航栈、返回键、标签栏、安全区域和软键盘等系统行为。

### 原生标签页

“Native Tabs”表示标签栏由平台原生实现承载，而不是普通 React DOM 或纯 JavaScript UI。

这会带来两个直接影响：

- Android 和 iOS 的功能、外观及支持属性并不完全相同。
- 某些配置依赖操作系统版本或原生工程设置。

因此，不能像编写 React Web CSS 那样假定一个样式属性在所有平台都产生相同效果。

### Layout 与 Screen

本文中的 `NativeTabs.Trigger` 可以出现在两个位置：

- 在 `_layout.tsx` 中：用于注册并配置某个标签，此时必须提供 `name`。
- 在标签对应的页面组件中：用于从页面内部调整当前标签，此时 `name` 不生效。

可以将其类比为：

- `_layout.tsx` 负责定义导航容器及入口。
- 页面中的 Trigger 负责让当前页面修改自己在导航栏中的展示配置。

### 安全区域

手机屏幕可能存在刘海、圆角、状态栏、底部 Home Indicator。页面内容不能简单地贴满物理屏幕，因此需要处理 Safe Area Insets，即安全区域内边距。

这不是 React Web 中浏览器页面通常需要处理的问题，却是移动端布局的重要部分。

### IME

IME（Input Method Editor）在本文中主要指 Android 软键盘。键盘出现后，标签栏可以被键盘覆盖，也可以随可用窗口区域上移。

---

## 安装与项目配置

### 安装要求

`expo-router/unstable-native-tabs` 不是单独的软件包，而是 `expo-router` 的子模块。项目必须先按照 Expo Router 安装指南配置 `expo-router`。

当前文档没有提供具体的 npm、pnpm 或 yarn 安装命令，而是链接到单独的 Expo Router 安装文档。因此，不应仅根据本页推断完整安装步骤。

### app.json 配置

应用配置中需要启用 Expo Router 的 config plugin：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

Config plugin 可以理解为 Expo 的原生工程配置插件。它会在生成或构建 iOS、Android 原生工程时写入必要配置，不等同于 React Web 项目中的 Babel 插件或 Vite 插件。

使用 Expo 默认模板创建的新项目时，这项配置通常已经存在。

### 导入方式

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
```

导入路径中的 `unstable-native-tabs` 是公开使用入口，同时也表明该 API 尚未被视为完全稳定。

### 平台范围

文档声明该模块适用于：

- Android
- iOS
- tvOS
- Web
- Expo Go

但每个属性都有自己的平台限制。模块支持 Web，不代表所有属性都能在 Web 上工作。

---

## `NativeTabs`：整个标签页导航容器

`NativeTabs` 通常放在 `_layout.tsx` 中，负责创建标签导航器。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home" />
      <NativeTabs.Trigger name="settings" />
    </NativeTabs>
  );
}
```

`name` 对应 Expo Router 中的路由名称，例如 `home` 通常对应同级的 `home.tsx` 或 `home/index.tsx`。

### 导航行为

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `backBehavior` | Android | 控制按下系统返回键时如何在标签之间返回 |
| `hidden` | 全平台 | 隐藏整个标签栏，默认 `false` |
| `screenListeners` | 全平台 | 为所有标签统一注册导航事件监听器 |

`backBehavior` 可选值：

- `history`：按照用户访问标签的历史返回。
- `initialRoute`：返回初始标签。
- `none`：不通过标签导航器处理标签间返回。

这里的返回键主要指 Android 系统返回键，不是网页中的浏览器后退按钮。

### 全局颜色与样式

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `backgroundColor` | 全平台 | 标签栏背景色 |
| `badgeBackgroundColor` | 全平台 | 所有徽标的背景色 |
| `badgeTextColor` | Android、Web | 徽标文字颜色 |
| `iconColor` | 全平台 | 所有标签图标的颜色，可区分默认和选中状态 |
| `indicatorColor` | Android、Web | 活跃标签指示器颜色 |
| `labelStyle` | 全平台 | 所有标签文字的样式，可区分默认和选中状态 |
| `rippleColor` | Android | 点击标签时的水波纹颜色 |
| `shadowColor` | iOS | 标签栏阴影颜色 |
| `tintColor` | 全平台 | 标签图标的 tint 颜色 |
| `titlePositionAdjustment` | iOS | 调整标题的水平和垂直位置 |

React Native 使用 `ColorValue` 表示颜色。虽然常见情况下可以传十六进制或颜色名称，但它不是 Web CSS 声明，不能假定所有 CSS 颜色语法均可使用。

`iconColor` 和 `labelStyle` 可以分别设置未选中和选中状态：

```tsx
<NativeTabs
  iconColor={{
    default: '#777',
    selected: '#1677ff',
  }}
/>
```

单个标签设置的图标或文字颜色可以覆盖容器上的 `tintColor`。

`NativeTabsLabelStyle` 只允许以下文字属性：

```ts
{
  fontFamily;
  fontSize;
  fontStyle;
  fontWeight;
  color;
}
```

它不是完整的 CSS 或完整的 React Native `TextStyle`。

### Android 专属配置

| 属性 | 作用 |
| --- | --- |
| `disableIndicator` | 禁用活跃标签指示器 |
| `labelVisibilityMode` | 控制标签文字显示方式 |
| `tabBarRespectsIMEInsets` | 软键盘出现时让标签栏移动到键盘上方 |

`labelVisibilityMode` 可选值：

- `auto`
- `selected`
- `labeled`
- `unlabeled`

这些模式来自 Android Material 底部导航组件。选择时还要考虑可访问性，不能只从视觉简洁程度出发。

`tabBarRespectsIMEInsets` 默认为 `false`。默认情况下，键盘会覆盖标签栏；设置为 `true` 后，标签栏会尝试上移到键盘上方。

该属性还有两个前提：

- 原生窗口必须配置 `windowSoftInputMode="adjustResize"`。
- Android 11，即 API 30 以前的系统不生效。

这说明 JSX 属性本身并不总能完成全部配置，有些行为依赖 Android 原生窗口设置。

### iOS 专属配置

#### 模糊和滚动边缘效果

| 属性 | 作用 |
| --- | --- |
| `blurEffect` | 设置标签栏的系统模糊材质 |
| `disableTransparentOnScrollEdge` | 禁止滚动到边缘时标签栏变透明 |

`blurEffect` 支持 `light`、`dark`、`regular`、`systemMaterial` 等多种 iOS 系统材质值。它们是 iOS 原生视觉效果，不应直接等同于 CSS `backdrop-filter`。

#### 标签栏最小化

`minimizeBehavior` 仅适用于 iOS 26 及以上，默认值是 `automatic`：

| 值 | 行为 |
| --- | --- |
| `automatic` | 使用系统默认行为 |
| `never` | 从不最小化 |
| `onScrollDown` | 向下滚动时最小化，向上滚动时展开 |
| `onScrollUp` | 向上滚动时最小化，向下滚动时展开 |

旧版本 iOS 不支持这一能力。实际开发不能仅因为 TypeScript 接受该属性，就假定所有 iPhone 都能展示对应效果。

#### iPadOS 和 macOS 侧边栏适配

`sidebarAdaptable` 需要 iOS 18 及以上。设为 `true` 后，可以在 iPadOS 和 macOS 上启用可适配侧边栏的标签栏样式，对 iPhone 没有效果。

---

## 导航事件

### 为全部标签监听事件

```tsx
<NativeTabs
  screenListeners={{
    tabPress: () => {
      console.log('Any tab pressed');
    },
  }}
>
  {/* triggers */}
</NativeTabs>
```

文档列出的主要事件包括：

- `tabPress`：标签被按下。
- `focus`：页面获得焦点。
- `blur`：页面失去焦点。

`screenListeners` 既可以直接接收事件对象，也可以是一个根据当前 `route` 返回监听器的函数。

对 React Web 开发者来说，`focus` 和 `blur` 不能简单理解为 DOM 输入框焦点。这里表示导航页面是否成为当前活动页面。

---

## `NativeTabs.Trigger`：配置单个标签

### 两种使用位置

在 `_layout.tsx` 中使用时，必须提供 `name`：

```tsx
<NativeTabs>
  <NativeTabs.Trigger name="home" />
  <NativeTabs.Trigger name="settings" />
</NativeTabs>
```

在页面内部使用时，`name` 不生效：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <NativeTabs.Trigger>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <Text>This is home screen!</Text>
    </View>
  );
}
```

### 子组件

Trigger 的 `children` 可以包含：

- `NativeTabs.Trigger.Icon`
- `NativeTabs.Trigger.Label`
- `NativeTabs.Trigger.Badge`

它们分别配置标签图标、文字和徽标。

### 显示、禁用与隐藏

#### `disabled`

`disabled` 仅支持 Android 和 iOS，默认值为 `false`。

设置后：

- 标签仍然显示。
- 用户无法通过点击标签栏选中它。
- `router.push()` 或 `<Link />` 仍然可以导航到该标签。

因此，它只禁用了原生点击交互，并没有建立路由访问控制。如果页面必须完全禁止访问，还需要在业务导航代码中自行拦截。

#### `hidden`

设置 `hidden` 后：

- 标签从标签栏消失。
- 该标签不能通过任何方式导航。
- 动态改变隐藏状态会重新挂载导航器，并重置导航状态。

这比 Web 中的 `display: none` 影响更大。它不仅改变视觉展示，还会改变导航结构。

### 单个标签的覆盖规则

以下 Trigger 属性会覆盖 `NativeTabs` 容器中的同名设置：

- `disableIndicator`
- `disableTransparentOnScrollEdge`
- `indicatorColor`
- `labelVisibilityMode`
- `rippleColor`

这适合少数标签需要特殊表现的情况。为了减少平台差异和维护成本，通用配置应优先放在 `NativeTabs` 上。

### 页面内容样式

`contentStyle` 设置标签页面内容的样式，但只支持限定的 `ViewStyle` 属性，包括：

- `backgroundColor`
- `experimental_backgroundImage`
- Flex 对齐及方向属性
- `gap`
- 各种 `padding`

它不是任意 React Native 样式对象，更不是完整 CSS。诸如 margin、position、border 等未列出的属性不属于文档声明的支持范围。

### 安全区域和内容 Insets

`disableAutomaticContentInsets` 用于关闭系统默认的内容内边距处理。

默认行为因平台而异：

- Android：页面内容会自动包裹在 `SafeAreaView` 中，只自动处理底部 inset，其他方向需要手动处理。
- iOS：页面中第一个嵌套的滚动视图会启用自动内容 inset 调整。

设置为 `true` 后，需要手动管理安全区域。文档建议使用：

```tsx
import { SafeAreaView } from 'react-native-screens/experimental';
```

容易误解之处是：Android 的“自动处理”并不意味着四个方向都已处理，文档明确表示只应用底部 inset。

### iOS 重复点击当前标签的行为

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `disablePopToTop` | `false` | 禁止重复点击标签时将其导航栈退回根页面 |
| `disableScrollToTop` | `false` | 禁止重复点击标签时滚动到页面顶部 |

这里体现了移动端标签常见的系统交互：一个标签内部可能还有自己的页面栈；再次点击当前标签，系统可以回到该栈的根页面或滚动到顶部。

### 单个标签事件

```tsx
<NativeTabs.Trigger
  name="home"
  listeners={{
    tabPress: () => {
      console.log('Home tab pressed');
    },
  }}
/>
```

`listeners` 只作用于当前标签。文档主要列出了 `tabPress`、`focus` 和 `blur`，其类型定义中还包含导航系统的其他事件类型。

### iOS 系统角色

`role` 使用 Apple 内置标签项，例如：

- `search`
- `history`
- `bookmarks`
- `contacts`
- `downloads`
- `favorites`
- `featured`
- `more`
- `mostRecent`
- `mostViewed`
- `recents`
- `topRated`

使用系统角色后，iOS 会提供标准图标、样式和本地化标题。

限制如下：

- 自定义 `icon` 或 `selectedIcon` 可以覆盖系统图标。
- 系统定义的标题不能自定义。

如果产品要求严格使用自定义文案，就不能假定 `role` 同时允许修改系统标题。

---

## 图标配置

Native Tabs 支持多种图标来源，且 Android、iOS 的优先资源不同。

### Material Icon

Android 可以通过 `md` 使用 Material 图标：

```tsx
<Icon md="home" />
```

也可以分别指定默认和选中状态：

```tsx
<Icon
  md={{
    default: 'home',
    selected: 'home_filled',
  }}
/>
```

图标名称来自 Material Icons 目录。

### SF Symbols

iOS 可以通过 `sf` 使用 SF Symbols：

```tsx
<Icon sf="magnifyingglass" />
```

或者区分状态：

```tsx
<Icon
  sf={{
    default: 'house',
    selected: 'house.fill',
  }}
/>
```

SF Symbols 是 Apple 提供的系统符号集，不是 Web icon font。

### Android Drawable

如果图标已经放入 Android 原生 drawable 资源目录，可以引用资源名称：

```tsx
<Icon drawable="ic_home" />
```

也可以分别设置状态：

```tsx
<Icon
  drawable={{
    default: 'ic_home_outline',
    selected: 'ic_home_filled',
  }}
/>
```

这里传入的是原生资源名称，不是图片文件路径。

### iOS Asset Catalog

iOS 可以通过 `xcasset` 引用 Asset Catalog 中的图片：

```tsx
<Icon xcasset="custom-icon" />
```

或者：

```tsx
<Icon
  xcasset={{
    default: 'home-outline',
    selected: 'home-filled',
  }}
/>
```

Xcassets 可以管理多分辨率、深色模式和设备专用图片。传入的是 Asset Catalog 中的图片名称。

### 普通图片资源

Android 和 iOS 都可以使用 `src`：

```tsx
<Icon src={require('./path/to/icon.png')} />
```

分别设置状态：

```tsx
<Icon
  src={{
    default: require('./path/to/icon.png'),
    selected: require('./path/to/icon-selected.png'),
  }}
/>
```

平台资源的优先级如下：

- iOS：存在 `sf` 时，它会覆盖 `src`。
- Android：存在 `drawable` 或 Material 图标配置时，它们会覆盖 `src`。

### iOS 图片渲染模式

`renderingMode` 支持：

- `template`：由 iOS 对图标应用 tint 颜色。
- `original`：保留图片原始颜色。

默认行为：

- 已配置标签图标颜色时，默认使用 `template`。
- 未配置图标颜色时，默认使用 `original`。

如果彩色品牌图标突然变为单色，应首先检查 `iconColor`、`tintColor` 和 `renderingMode`。

### VectorIcon

`NativeTabs.Trigger.VectorIcon` 用来从指定的矢量图标库加载图标：

```tsx
import { Icon, VectorIcon } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

<Icon
  src={
    <VectorIcon
      family={MaterialCommunityIcons}
      name="home"
    />
  }
/>
```

文档建议优先使用 `Icon` 的 `md` 和 `sf` 属性。只有需要某个特定矢量图标家族时，才直接使用 `VectorIcon`。

---

## 标签文字与徽标

### Label

```tsx
<NativeTabs.Trigger.Label>
  Home
</NativeTabs.Trigger.Label>
```

支持的属性：

| 属性 | 作用 |
| --- | --- |
| `children` | 标签文字 |
| `hidden` | 隐藏文字，默认 `false` |
| `selectedStyle` | 标签选中时的文字样式 |

### Badge

Badge 通常用于显示未读数量或状态：

```tsx
<NativeTabs.Trigger.Badge>
  3
</NativeTabs.Trigger.Badge>
```

支持的属性：

| 属性 | 作用 |
| --- | --- |
| `children` | 徽标文本，类型为字符串；不提供时不显示 |
| `hidden` | 隐藏徽标，默认 `false` |
| `selectedBackgroundColor` | 标签选中时的徽标背景色 |

如果数量是数字，应根据该类型要求转换为字符串。

### Icon

当前文档在 `NativeTabs.Trigger.Icon` 的属性表中只明确列出：

| 属性 | 作用 |
| --- | --- |
| `selectedColor` | 图标选中时的颜色 |

页面后面的图标接口还说明了 `md`、`sf`、`drawable`、`xcasset`、`src` 和 `renderingMode` 等图标来源。本文未提供一个完整、统一的 `Icon` 属性签名，因此复杂图标组合应以对应 SDK 版本的 TypeScript 类型和 Native Tabs 使用指南为准。

---

## `NativeTabs.BottomAccessory`

`NativeTabs.BottomAccessory` 用于为 Native Tabs 提供底部附属内容。

当前文档明确提供的信息只有：

- 支持 Android、iOS、tvOS 和 Web。
- 接受 `children`。
- 组件包含 `usePlacement()`，返回 `regular` 或 `inline`。

当前文档没有给出使用示例，也没有解释：

- 附属内容的精确布局位置。
- `regular` 与 `inline` 的具体视觉差异。
- 各平台是否存在不同布局行为。

因此，仅凭本页不足以编写可靠的完整使用方案，需要继续参考 Native Tabs 指南或对应 SDK 的类型和实现说明。

---

## 不稳定的原生透传 API

`NativeTabs` 和 `NativeTabs.Trigger` 都提供了 `unstable_nativeProps`。

它们用于把 Expo Router 尚未直接公开的属性传给底层 `react-native-screens` 原生实现。

### 容器级 `unstable_nativeProps`

用于配置底层原生 tab host。

文档警告：

- 这是不稳定 API。
- 可能在小版本更新中改变或删除。

### 标签级 `unstable_nativeProps`

用于配置底层原生 tab screen。

除了不稳定性之外，文档还明确警告：

- 它会覆盖 Expo Router 设置的其他属性。
- 可能引发意外行为。

**基于经验建议：**只有现有稳定属性无法满足明确需求，而且团队愿意针对 Expo SDK 升级进行回归测试时，才应使用这些接口。不要把它们作为常规样式入口。

---

## 常见误解和关键限制

### `disabled` 不等于禁止访问

`disabled` 只阻止用户点击原生标签，JavaScript 导航仍然有效。权限控制、登录拦截等逻辑不能依赖它。

### `hidden` 不只是视觉隐藏

单个 Trigger 的 `hidden` 会让路由无法通过任何方式导航。动态改变它还会重新挂载导航器并重置状态。

相比之下，`NativeTabs` 上的 `hidden` 描述的是隐藏整个标签栏。不要混淆容器和单个标签上的属性。

### 平台支持必须逐项检查

例如：

- `blurEffect` 只支持 iOS。
- `rippleColor` 只支持 Android。
- `badgeTextColor` 只支持 Android 和 Web。
- `minimizeBehavior` 需要 iOS 26 及以上。
- `sidebarAdaptable` 需要 iOS 18 及以上，并且对 iPhone 无效。
- `tabBarRespectsIMEInsets` 需要 Android 11 及以上和额外窗口配置。

平台不支持的属性不能被视为跨平台统一能力。

### React Native 样式不是 CSS

`contentStyle` 和 `labelStyle` 都只接受文档列出的有限属性。不能照搬 CSS 类名、选择器、伪类或任意 CSS 属性。

### 导航状态可能长期保留

标签页面失去 `focus` 不代表 React 组件一定卸载。业务逻辑如果依赖“切换标签后重新加载”，应使用导航事件或明确的数据刷新机制，而不是假定组件会重新挂载。

此项是**基于文档事件模型推导**，当前文档没有完整规定页面生命周期。

### 原生图标不是一种统一资源

Material Icon、SF Symbol、drawable 和 xcasset 分别属于不同平台资源体系。跨平台项目通常需要为 Android 和 iOS分别选择适合的资源，并通过 `src` 提供必要的回退方案。

---

## 实际开发中的使用方法

建议先在 `_layout.tsx` 中建立最小可用结构，再逐步加入平台能力：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor="#ffffff"
      iconColor={{
        default: '#777777',
        selected: '#1677ff',
      }}
      screenListeners={{
        tabPress: () => {
          console.log('Tab pressed');
        },
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge>3</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

图标部分应根据目标平台和项目资源进一步配置。当前 API 参考没有展示一个同时组合 `Trigger.Icon`、`md` 和 `sf` 的完整示例，应结合 Native Tabs 指南确认准确写法。

### 推荐实施顺序

1. 安装并配置 Expo Router。
2. 确认 `app.json` 中存在 `expo-router` config plugin。
3. 创建标签组及其 `_layout.tsx`。
4. 用 `NativeTabs` 和带 `name` 的 Trigger 注册路由。
5. 添加 Label、Icon 和 Badge。
6. 分别在 Android、iOS 上验证平台专属行为。
7. 最后再考虑 `unstable_nativeProps` 等底层扩展。

### 测试重点

**基于文档内容推导：**实际项目至少应覆盖以下测试：

- Android 系统返回键在不同 `backBehavior` 下的行为。
- iOS 重复点击当前标签后的回栈和滚动行为。
- 键盘出现时 Android 标签栏是否被覆盖。
- 刘海屏和 Home Indicator 区域的内容安全性。
- 动态隐藏标签后导航状态是否按预期重置。
- 通过点击、`router.push()` 和 `<Link />` 访问禁用标签时的差异。
- 不同 iOS 版本对最小化和侧边栏适配属性的兼容性。
- 图标在默认、选中、深色模式和 tint 模式下的效果。

---

## 文档明确内容与推导内容

### 文档明确说明

- Native Tabs 是 `expo-router` 的子模块。
- 导入路径是 `expo-router/unstable-native-tabs`。
- 项目需要安装并配置 Expo Router。
- 默认项目模板通常已经配置 Expo Router config plugin。
- Trigger 在 Layout 中需要 `name`，在页面中 `name` 不生效。
- `disabled` 不阻止 JavaScript 导航。
- `hidden` 会阻止导航，动态隐藏会重置导航器状态。
- Android 和 iOS 的自动内容 inset 行为不同。
- 各属性存在明确的平台和系统版本限制。
- `unstable_nativeProps` 可能变化、删除或覆盖 Expo Router 属性。

### 基于文档内容推导

- 采用该模块需要进行 Android、iOS 分平台测试，不能只依赖 Web 或 Expo Go 预览。
- 业务权限控制不能用 `disabled` 或标签栏可见性代替。
- 动态改变导航结构前需要考虑状态丢失。
- 图标资源策略应明确区分平台资源和通用图片资源。
- 使用系统版本限定属性时，需要为旧系统接受默认行为或设计回退体验。
- 页面数据刷新不应依赖标签切换时组件自动卸载。

---

## 当前文档未涉及的内容

本页定位是 API 参考，而不是完整教程。以下内容没有在当前文档中展开：

- 创建完整 Expo Router 项目的命令。
- 标签路由对应的具体目录结构示例。
- 默认选中标签或初始路由的完整配置方法。
- `BottomAccessory` 的完整视觉效果和使用示例。
- 深层链接和 URL 与 Native Tabs 的映射方式。
- 标签内部嵌套 Stack 导航的完整写法。
- 服务端渲染、静态导出和 Web SEO 行为。
- 动画性能数据及与其他标签导航方案的性能对比。
- 原生资源目录中 drawable 和 xcasset 的创建流程。
- Android `windowSoftInputMode="adjustResize"` 的具体配置位置。
- API 从 unstable 迁移到稳定版本的时间表。

这些问题需要查阅 Expo Router 安装指南、Native Tabs 使用指南和相关原生平台文档。

---

## 总结

`expo-router/unstable-native-tabs` 将 Expo Router 的文件路由与平台原生标签栏结合起来。核心结构是：

- `NativeTabs` 创建标签导航容器。
- `NativeTabs.Trigger` 注册并配置单个路由标签。
- `Label`、`Icon` 和 `Badge` 控制标签展示。
- 容器属性提供全局样式和行为。
- Trigger 属性提供单个标签覆盖。
- Android 与 iOS 各有大量平台专属能力和限制。

对 React Web 开发者来说，最重要的转变是：标签栏不只是一个带 `onClick` 的 UI 组件，而是操作系统导航、原生资源、安全区域、软键盘和导航状态共同参与的基础设施。开发时必须逐项检查平台支持，并在真实目标平台上验证行为。

---

## 文档导航

- **上一页**：[link](./8__link.md)
- **下一页**：[split view](./10__split-view.md)
