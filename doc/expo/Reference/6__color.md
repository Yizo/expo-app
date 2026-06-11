# Expo Router Color：访问 iOS 与 Android 原生颜色

## 文档解决的问题

`Color` 是 Expo Router 提供的颜色 API，用于在 React Native 应用中访问 **iOS 和 Android 平台定义的原生颜色**。

它主要解决以下问题：

- 不必手动调用 React Native 的 `PlatformColor`。
- 通过 TypeScript 类型提示查找可用的系统颜色。
- 使用能够跟随系统明暗主题变化的语义化颜色。
- 在 Android 中访问系统颜色、主题属性颜色，以及 Material Design 3 的静态和动态颜色。

适用场景包括：

- 希望应用界面看起来更符合 iOS 或 Android 原生设计。
- 需要支持系统浅色、深色主题。
- Android 应用需要使用 Material Design 3 配色。
- Android 应用希望颜色跟随用户壁纸生成的系统动态配色。
- 希望减少硬编码 `#ffffff`、`#000000` 等固定颜色。

本文档只介绍颜色 API，不负责 Expo Router 的安装和基础配置。相关内容需要参考 Expo Router 主文档。

---

## 平台支持范围

文档明确将此 API 标记为支持：

- Android
- iOS

没有将 Web 列为支持平台。

> **重要：**虽然某些接口表格统一显示“Supported platforms: Android, iOS”，但 `Color.android.*` 和 `Color.ios.*` 仍然分别代表 Android 与 iOS 原生颜色体系，不应据此认为 Android 颜色在 iOS 上具有相同的原生语义。

**基于文档内容推导：**跨平台组件不应无条件混用 `Color.android.*` 和 `Color.ios.*`。实际项目通常需要根据平台选择对应颜色，或者在平台专用文件中分别使用。

---

## React Web 开发者需要先理解的概念

### React Native 中的颜色不是 CSS

React Web 通常会这样设置颜色：

```tsx
<div style={{ backgroundColor: '#ffffff', color: '#111111' }} />
```

React Native 则通过组件的 `style` 属性设置颜色：

```tsx
<View style={{ backgroundColor: '#ffffff' }}>
  <Text style={{ color: '#111111' }}>Hello</Text>
</View>
```

这里的 `View` 类似布局容器，`Text` 是文本组件。React Native 没有普通的 DOM 元素，也没有浏览器 CSS 级联环境。

`Color` 返回的是 React Native 的 `ColorValue`，可以直接传给 `backgroundColor`、`color` 等样式属性。它不一定是 `"#ffffff"` 这样的字符串，也可能是由原生平台在运行时解析的颜色引用。

### `PlatformColor`

`PlatformColor` 是 React Native 访问原生平台颜色资源的机制。例如：

```tsx
PlatformColor('label')
PlatformColor('@android:color/black')
PlatformColor('?attr/colorPrimary')
```

这些值的最终颜色由 iOS 或 Android 原生系统决定。

`Color` 可以理解为 Expo Router 在 `PlatformColor` 之上提供的一层类型安全封装：

```tsx
Color.ios.label
Color.android.black
Color.android.attr.colorPrimary
```

与直接书写原生资源名称相比，它能提供属性补全，并减少拼写错误。

### 系统主题与语义颜色

原生系统颜色通常表达的是用途，而不是固定 RGB 值。例如：

- `label`：主要文本颜色。
- `systemBackground`：系统背景颜色。
- `primary`：主要强调色。
- `onPrimary`：显示在主要强调色背景之上的内容颜色。

这些颜色可能随浅色模式、深色模式、Android 主题或用户壁纸而变化。

这与 Web 中通过 CSS 变量和媒体查询实现主题切换有些类似：

```css
color: var(--text-primary);
```

区别在于，原生颜色由 iOS 或 Android 的系统资源解析，而不是由浏览器解析 CSS 变量。

### Android SDK 编号

文档将 Android 颜色按 `SDK1`、`SDK14`、`SDK31`、`SDK34`、`SDK35` 等接口分类。

Android SDK 版本代表 Android 平台 API 级别。某些颜色资源是在较新的 Android 版本中才加入的，因此并非所有 Android 设备都拥有完全相同的系统颜色集合。

**基于文档内容推导：**名称位于较高 SDK 接口中的颜色，与相应 Android 系统版本有关。面向较旧 Android 设备时，需要结合项目最低支持版本验证运行时行为。本文档没有说明缺少某个颜色资源时的具体降级结果。

---

## 基本用法

从 `expo-router` 导入 `Color`：

```tsx
import { Color } from 'expo-router';
```

然后直接将颜色传给 React Native 样式：

```tsx
import { Color } from 'expo-router';
import { Text, View, useColorScheme } from 'react-native';

export default function MyComponent() {
  useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Color.android.dynamic.primary,
      }}>
      <Text style={{ color: Color.ios.label }}>Hello</Text>
    </View>
  );
}
```

示例展示了 API 的调用形式，但同时在一个组件中使用了 Android 和 iOS 颜色。

**基于文档内容推导：**这更适合用于演示属性入口，不应直接视为跨平台组件的推荐写法。实际组件应确保当前平台只使用对应平台的颜色。

---

## `Color` 的整体结构

`Color` 的类型为 `ColorType`，主要分为两个入口：

```tsx
Color.android
Color.ios
```

Android 下又分为不同来源：

```tsx
Color.android.background
Color.android.attr.colorPrimary
Color.android.material.primary
Color.android.dynamic.primary
```

| 入口 | 颜色来源 | 主要特点 |
| --- | --- | --- |
| `Color.android.*` | Android 系统颜色资源 | 直接访问 `@android:color/...` |
| `Color.android.attr.*` | 当前 Android 主题属性 | 由应用或系统主题解析 |
| `Color.android.material.*` | Material Design 3 静态配色 | 不根据用户壁纸动态生成 |
| `Color.android.dynamic.*` | Material Design 3 动态配色 | 根据用户壁纸和主题设置变化 |
| `Color.ios.*` | iOS 系统颜色 | 对 iOS `PlatformColor` 的类型安全封装 |

---

## iOS 系统颜色

iOS 颜色通过以下形式访问：

```tsx
Color.ios.label
Color.ios.systemBackground
Color.ios.systemBlue
```

文档列出的颜色大致可以分成以下几组。

### 文本和链接

- `label`
- `secondaryLabel`
- `tertiaryLabel`
- `quaternaryLabel`
- `placeholderText`
- `link`
- `darkText`
- `lightText`

通常应优先根据内容层级选择 `label` 系列，而不是直接指定黑色或白色。

### 背景

- `systemBackground`
- `secondarySystemBackground`
- `tertiarySystemBackground`
- `systemGroupedBackground`
- `secondarySystemGroupedBackground`
- `tertiarySystemGroupedBackground`

`GroupedBackground` 系列用于分组式界面背景。文档只列出了 API，没有进一步说明具体组件使用规范。

### 填充、边界和分隔

- `systemFill`
- `secondarySystemFill`
- `tertiarySystemFill`
- `quaternarySystemFill`
- `separator`
- `opaqueSeparator`

### 系统强调色

包括：

- `systemBlue`
- `systemBrown`
- `systemCyan`
- `systemGreen`
- `systemIndigo`
- `systemMint`
- `systemOrange`
- `systemPink`
- `systemPurple`
- `systemRed`
- `systemTeal`
- `systemYellow`

### 系统灰色

包括 `systemGray` 到 `systemGray6`。

这些是 iOS 定义的系统颜色，并不等同于固定的 Web 灰色色值。

---

## Android 系统颜色

Android 基础颜色通过以下形式访问：

```tsx
Color.android.background_dark
Color.android.black
Color.android.white
```

它们封装的是：

```tsx
PlatformColor('@android:color/...')
```

文档按颜色首次出现的 Android SDK 版本划分接口。

### SDK 1 基础颜色

包括：

- 深色和浅色背景
- 黑色、白色、透明色
- 深灰色
- 标签指示器文本颜色
- 编辑框颜色

示例：

```tsx
Color.android.background_dark
Color.android.transparent
Color.android.white
```

### SDK 14 Holo 颜色

包括 Holo 设计体系中的蓝、绿、橙、紫、红等颜色：

```tsx
Color.android.holo_blue_light
Color.android.holo_green_dark
Color.android.holo_red_light
```

### SDK 31 系统色板

提供以下色板：

- `system_accent1_*`
- `system_accent2_*`
- `system_accent3_*`
- `system_neutral1_*`
- `system_neutral2_*`

每组包含从 `0`、`10`、`50` 到 `1000` 的多个色阶。

这些属性更接近底层系统调色板，而不是界面用途明确的颜色角色。

**基于经验建议：**业务 UI 通常优先使用 `dynamic.primary`、`dynamic.surface` 等语义角色。直接选择色阶会让组件与系统颜色角色之间的关系更难维护。

### SDK 34 语义化系统颜色

SDK 34 接口提供大量语义角色，并区分亮色和暗色版本，例如：

```tsx
Color.android.system_primary_light
Color.android.system_primary_dark
Color.android.system_on_primary_light
Color.android.system_on_primary_dark
Color.android.system_surface_light
Color.android.system_surface_dark
```

包含的主要角色有：

- `background`
- `primary`、`secondary`、`tertiary`
- 各角色对应的 `container`
- `surface` 及不同层级的 `surfaceContainer`
- `error`
- `outline`
- `control`
- `text`
- `palette_key_color`
- `fixed`、`fixedDim` 和对应前景色

`on_*` 表示应该放在相应背景角色上的前景内容。例如，`system_on_primary_dark` 对应深色方案中显示在 `system_primary_dark` 上的内容颜色。

### SDK 35 新增颜色

包括：

- `system_error_0` 到 `system_error_1000` 的错误色阶
- `system_on_surface_disabled`
- `system_outline_disabled`
- `system_surface_disabled`

这些颜色主要补充错误状态和禁用状态。

---

## Android 主题属性颜色

主题属性颜色通过 `attr` 访问：

```tsx
Color.android.attr.colorPrimary
Color.android.attr.colorAccent
Color.android.attr.colorBackground
```

底层形式是：

```tsx
PlatformColor('?attr/colorPrimary')
```

这里的 `?attr/...` 不是直接指向固定资源，而是要求 Android 从当前主题中解析该属性。

文档列出的属性包括：

- `colorBackground`
- `colorForeground`
- `colorForegroundInverse`
- `colorAccent`
- `colorPrimary`
- `colorPrimaryDark`
- `colorSecondary`
- `colorError`
- `colorControlNormal`
- `colorControlActivated`
- `colorControlHighlight`
- `colorButtonNormal`
- 各类按压、聚焦、长按和多选高亮色
- `colorBackgroundFloating`
- `colorEdgeEffect`
- `colorMode`
- `colorBackgroundCacheHint`

不同属性来自不同 Android SDK 版本。

对 React Web 开发者，可以将其类比为由上层主题提供的设计令牌：

```css
color: var(--theme-primary);
```

但 Android 主题属性由原生主题系统解析，不是 JavaScript 对象或 CSS 自定义属性。

---

## Material Design 3 颜色

Android 同时提供静态和动态两套 Material Design 3 颜色。

### 静态颜色

访问方式：

```tsx
Color.android.material.primary
Color.android.material.onPrimary
Color.android.material.surface
```

静态 Material 配色来自 Material Design 3 的基准静态方案，不会因为用户壁纸而重新生成。

### 动态颜色

访问方式：

```tsx
Color.android.dynamic.primary
Color.android.dynamic.onPrimary
Color.android.dynamic.surface
```

文档明确说明，动态颜色会根据以下信息变化：

- 用户壁纸
- 系统主题设置

因此，它不是应用开发者预先确定的固定色值。

### 两者的选择

| 需求 | 更适合的入口 |
| --- | --- |
| 希望界面融入用户的 Android 系统主题 | `Color.android.dynamic` |
| 希望使用 Material 3 角色，但保持基准静态方案 | `Color.android.material` |
| 希望读取当前 Android 原生主题属性 | `Color.android.attr` |
| 希望直接访问 Android 系统颜色资源 | `Color.android` |

文档提供了 Material Design 官方资料链接用于了解动态与静态方案的差异，但没有规定项目必须选择哪一种。

---

## Material 3 颜色角色

动态与静态颜色提供基本相同的语义角色。

### Primary、Secondary 和 Tertiary

三组强调色分别用于不同视觉优先级：

```tsx
primary
secondary
tertiary
```

每组还提供：

```tsx
primaryContainer
onPrimary
onPrimaryContainer
```

命名规则如下：

- `primary`：主要颜色。
- `onPrimary`：显示在 `primary` 背景上的内容颜色。
- `primaryContainer`：主要颜色对应的容器背景。
- `onPrimaryContainer`：显示在该容器上的内容颜色。

Secondary 和 Tertiary 遵循相同规则。

### Surface 和 Background

常见角色包括：

```tsx
background
onBackground
surface
onSurface
surfaceVariant
onSurfaceVariant
```

Surface 还包含多个容器层级：

```tsx
surfaceContainerLowest
surfaceContainerLow
surfaceContainer
surfaceContainerHigh
surfaceContainerHighest
```

这些角色用于表达不同界面表面的视觉层级。

### Error

错误相关角色包括：

```tsx
error
onError
errorContainer
onErrorContainer
```

### Outline

边界相关角色包括：

```tsx
outline
outlineVariant
```

### Fixed、Dim 和 Inverse

接口还提供：

- `primaryFixed`、`secondaryFixed`、`tertiaryFixed`
- 对应的 `FixedDim`
- 对应的 `on...Fixed` 和 `on...FixedVariant`
- `primaryInverse`
- `surfaceInverse`
- `onSurfaceInverse`

文档列出了这些角色并链接到 Material Design 3 说明，但没有在当前页面详细解释其设计规则。

---

## 正确配对背景色与前景色

原文示例将 `primary` 和 `onPrimary` 配对使用：

```tsx
import { Color } from 'expo-router';
import { Text, View, useColorScheme } from 'react-native';

export default function MyComponent() {
  useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Color.android.dynamic.primary,
      }}>
      <Text style={{ color: Color.android.dynamic.onPrimary }}>
        Hello, World!
      </Text>
    </View>
  );
}
```

这里：

- `primary` 用作背景。
- `onPrimary` 用作该背景上的文本色。

不要因为 `primary` 看起来像品牌色，就随意在上面叠加 `white` 或 `black`。动态配色的实际颜色由系统决定，固定前景色不一定能保持足够对比度。

**基于文档内容推导：**对于 `primaryContainer`、`errorContainer` 等角色，也应优先使用对应的 `onPrimaryContainer`、`onErrorContainer`。

---

## 为什么需要调用 `useColorScheme`

文档特别提醒：为了确保 Android 颜色与系统主题保持一致，应在能够响应主题变化的组件中使用这些颜色，例如调用 React Native 的 `useColorScheme`：

```tsx
const colorScheme = useColorScheme();
```

即使不使用返回值，也可以调用它：

```tsx
export default function MyComponent() {
  useColorScheme();

  return (
    <View style={{ backgroundColor: Color.android.dynamic.primary }} />
  );
}
```

`useColorScheme` 会订阅系统配色方案。系统主题变化时，组件可以重新渲染，从而重新应用原生颜色。

这在启用 React Compiler 时尤其重要，因为 React Compiler 可能缓存组件。如果组件没有建立主题变化依赖，它可能不会在预期时间重新渲染。

对 React Web 开发者，可以将其类比为组件订阅了一个系统主题媒体查询；只有建立订阅，主题变化才会进入 React 的更新流程。

> 原文明确强调的是 Android 主题对齐问题，并特别指出 React Compiler 的 memoization 可能带来影响。

---

## 已废弃的 Android 颜色

`AndroidDeprecatedColor` 中包含一组已在 Android SDK 28 废弃的颜色：

- `primary_text_dark`
- `primary_text_dark_nodisable`
- `primary_text_light`
- `primary_text_light_nodisable`
- `secondary_text_dark`
- `secondary_text_dark_nodisable`
- `secondary_text_light`
- `secondary_text_light_nodisable`
- `tertiary_text_dark`
- `tertiary_text_light`

虽然类型中仍然提供这些属性，但文档明确标注它们已经废弃。

**基于经验建议：**新代码不要继续依赖这些颜色。优先选择当前系统的语义颜色、主题属性或 Material 3 颜色角色。

---

## TypeScript 类型结构

`ColorType` 的核心结构可以简化理解为：

```ts
type ColorType = {
  android: {
    // Android 系统颜色
    attr: AndroidBaseColorAttr;
    dynamic: AndroidDynamicMaterialColor;
    material: AndroidMaterialColor;
  };
  ios: IOSBaseColor;
};
```

实际类型由多个按 Android SDK 划分的接口组合而成。

以下类型还带有索引签名：

- `AndroidBaseColor`
- `AndroidBaseColorAttr`
- `AndroidDynamicMaterialColor`
- `AndroidMaterialColor`

概念上相当于：

```ts
[key: string]: ColorValue;
```

这表示这些对象除了文档明确列出的属性外，在类型结构上还允许通过字符串键获取 `ColorValue`。

不过，文档的主要价值仍然是为已知颜色提供类型声明和自动补全。

---

## 配置、命令和目录

### 导入

当前页面唯一直接涉及的代码入口是：

```tsx
import { Color } from 'expo-router';
```

### 安装和配置

当前文档未提供安装命令，也没有介绍以下内容：

- 如何创建 Expo 项目。
- 如何安装 Expo Router。
- 如何配置文件路由。
- 是否需要修改 `app.json` 或 `app.config.js`。
- 是否需要修改 Android 或 iOS 原生工程。
- 是否需要额外的 Expo config plugin。

原文要求参考 Expo Router 主文档了解安装和配置。

### 文件与目录

当前文档未规定必须在哪个文件或目录使用 `Color`。它可以在需要原生颜色的 React Native 组件中导入使用。

---

## 注意事项与限制

### 仅明确支持 Android 和 iOS

当前页面没有声明 Web 支持。不要把这些原生颜色视为浏览器 CSS 颜色 API。

### Android 与 iOS 颜色体系不同

`Color.android` 和 `Color.ios` 不是同一套跨平台主题令牌。它们分别暴露各自平台的原生颜色。

### 动态颜色不是固定色值

`Color.android.dynamic.*` 会根据壁纸和主题设置变化。不要依赖它在所有设备上呈现同一个 RGB 值。

### 需要让组件响应主题变化

文档明确建议调用 `useColorScheme`，特别是在使用 React Compiler 时。否则组件可能因缓存而没有及时响应系统主题变化。

### 注意 Android SDK 差异

颜色接口按 Android SDK 版本分组，说明颜色资源并不是在所有 Android 版本中同时存在。

当前文档没有说明：

- 在低版本设备访问高版本颜色时会发生什么。
- 是否存在自动回退颜色。
- 是否会产生警告或运行时错误。

因此，不能仅根据本页推断兼容行为。

### 避免已废弃颜色

Android SDK 28 已废弃的文本颜色仍出现在 API 中，但不适合新代码使用。

### 不要把颜色值当普通字符串处理

返回类型是 `ColorValue`，不保证一定是十六进制字符串。

**基于文档内容推导：**不应假设可以对结果执行字符串拼接、解析 RGB 或保存为固定色值。它最直接的用途是传给 React Native 样式属性。

---

## 跨平台组件的实际写法

原文没有提供平台分支示例。下面是根据平台专属 API 结构整理的使用方式。

> **以下代码属于基于文档内容推导。**

```tsx
import { Color } from 'expo-router';
import {
  Platform,
  Text,
  View,
  useColorScheme,
} from 'react-native';

export default function Card() {
  useColorScheme();

  const backgroundColor = Platform.select({
    android: Color.android.dynamic.surfaceContainer,
    ios: Color.ios.secondarySystemBackground,
  });

  const textColor = Platform.select({
    android: Color.android.dynamic.onSurface,
    ios: Color.ios.label,
  });

  return (
    <View style={{ backgroundColor, padding: 16 }}>
      <Text style={{ color: textColor }}>Card content</Text>
    </View>
  );
}
```

这里没有强行让两个平台共享同一个原生颜色，而是让它们共享同一个业务语义：“卡片背景”和“主要文本”。

这更接近 React Web 项目中的设计令牌思路：

```ts
const colors = {
  cardBackground: platformSpecificValue,
  primaryText: platformSpecificValue,
};
```

---

## 实际开发建议

### 先建立业务层颜色语义

**基于经验建议：**不要让业务组件到处直接访问几十种系统颜色。可以建立项目自己的主题映射：

```tsx
const theme = {
  screenBackground: Color.android.dynamic.background,
  cardBackground: Color.android.dynamic.surfaceContainer,
  primaryText: Color.android.dynamic.onSurface,
  actionBackground: Color.android.dynamic.primary,
  actionText: Color.android.dynamic.onPrimary,
};
```

这样可以隔离平台差异，并避免业务代码依赖底层系统资源名称。

### 优先使用成对的 Material 角色

常见配对包括：

| 背景 | 前景 |
| --- | --- |
| `primary` | `onPrimary` |
| `primaryContainer` | `onPrimaryContainer` |
| `secondary` | `onSecondary` |
| `surface` | `onSurface` |
| `error` | `onError` |
| `errorContainer` | `onErrorContainer` |

这样更容易维持动态主题下的可读性。

### 在真实主题变化下测试

**基于经验建议：**至少测试：

- iOS 浅色模式和深色模式。
- Android 浅色模式和深色模式。
- Android 不同壁纸产生的动态配色。
- 应用运行时切换系统主题。
- 项目支持的最低 Android 版本。

### 不要只看 TypeScript 是否允许

API 的类型集合包含多个 Android SDK 版本的颜色。类型存在不代表目标设备一定提供对应的系统资源。兼容性仍需在项目支持的 Android 版本上验证。

---

## 文档明确说明与推导内容边界

### 文档明确说明

- `Color` 用于访问平台特定的原生颜色。
- 支持 Android 和 iOS。
- 从 `expo-router` 导入 `Color`。
- iOS API 是 `PlatformColor` 的类型安全封装。
- Android 支持系统颜色、主题属性颜色、Material 3 静态颜色和动态颜色。
- Android 动态颜色根据用户壁纸和主题设置变化。
- Android 颜色应在能够响应主题变化的组件中使用。
- 可以调用 `useColorScheme` 建立主题响应。
- React Compiler 的组件缓存使这一点尤其重要。
- 一组 Android 文本颜色已在 Android SDK 28 废弃。
- API 返回 React Native 的 `ColorValue`。

### 基于文档内容推导

- 跨平台组件应根据当前平台选择 `Color.android` 或 `Color.ios`。
- Material 背景角色应优先与对应的 `on...` 前景角色配对。
- 高版本 Android SDK 颜色需要结合最低支持版本测试。
- 不应把原生 `ColorValue` 当成普通 CSS 颜色字符串处理。
- 可以在项目主题层将平台颜色映射为业务语义令牌。

### 当前文档未涉及

- Expo Router 的具体安装命令。
- Expo 项目创建流程。
- iOS 或 Android 原生工程配置。
- Web 平台回退方案。
- Android 高版本颜色在低版本系统中的具体行为。
- 动态颜色不可用时的回退机制。
- 每个 Material 3 角色的完整设计规范。
- 自动化测试方式。
- 无障碍对比度的具体数值要求。

---

## 总结

Expo Router 的 `Color` API 不是一套普通的固定色板，而是连接 React Native 样式与 iOS、Android 原生颜色体系的类型安全入口。

它的核心结构是：

```tsx
Color.ios.*
Color.android.*
Color.android.attr.*
Color.android.material.*
Color.android.dynamic.*
```

使用时最重要的原则是：

1. 根据运行平台选择对应的颜色体系。
2. 将 `ColorValue` 直接用于 React Native 样式，不要假设它是固定字符串。
3. Android 动态颜色应按 Material 语义角色使用，并正确配对背景与 `on...` 前景色。
4. 调用 `useColorScheme`，确保组件能够响应系统主题变化。
5. 关注 Android SDK 版本差异，避免使用已经废弃的颜色。
6. 在大型项目中，将原生颜色封装为业务层主题令牌，避免平台细节扩散到所有组件。

---

## 文档导航

- **上一页**：[router](./5__router.md)
- **下一页**：[experimental stack](./7__experimental-stack.md)
