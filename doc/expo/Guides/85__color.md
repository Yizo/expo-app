# 颜色（Color）

> 原始文档地址：https://docs.expo.dev/router/reference/color-schemes/

---

## 概述

`Color` 是 `expo-router` 提供的一个工具对象，用于在 TypeScript 中**类型安全地**获取操作系统原生的系统颜色。它对 React Native 内置的颜色系统进行了封装，提供代码自动补全和编译时类型检查能力。

> **初学者须知：**
> - **系统颜色**：指 Android 或 iOS 操作系统内置的预定义颜色。使用系统颜色可以让你的应用外观与设备整体风格保持一致。
> - **类型安全**：TypeScript 在编写代码时就能检查颜色名称是否正确，避免运行时因拼写错误导致的 bug。
> - **封装（Wrapper）**：`Color` 并非重新发明一套颜色系统，而是在 React Native 已有的颜色 API 之上做了一层更友好的接口。

---

## 导入方式

```tsx
import { Color } from 'expo-router';
```

`Color` 对象包含两个主要的平台分支：

| 分支 | 对应平台 | 说明 |
|------|---------|------|
| `Color.android` | Android | 提供 Android 系统颜色资源 |
| `Color.ios` | iOS | 提供 iOS 系统颜色资源 |

---

## Android 颜色

Android 平台提供了**四种**不同的颜色获取方式，分别对应不同的使用场景。

### 1. 基础颜色（Basic Colors）

通过 `Color.android` 直接访问 Android 的基础颜色资源。这些颜色对应 Android 系统内部的资源 ID（如 `android.R.color.*`），包括基本色值和背景色。

```tsx
import { Color } from 'expo-router';

// 基本颜色
Color.android.black;
Color.android.white;
Color.android.transparent;

// 背景颜色
Color.android.background_dark;
Color.android.background_light;
```

> **初学者须知：** `black`、`white`、`transparent` 是最基础的三种颜色——黑色、白色和透明色。`background_dark` 和 `background_light` 分别对应系统深色和浅色模式的默认背景色。完整的基础颜色列表请参阅 [Android 官方开发者文档](https://developer.android.com/reference/android/R.color)。

### 2. 主题属性颜色（Theme Attribute Colors）

通过 `Color.android.attr` 获取当前 Android 主题的属性颜色。这些颜色会随着用户设备的主题设置（如亮色/暗色模式）自动变化。

```tsx
import { Color } from 'expo-router';

// 主题颜色
Color.android.attr.colorPrimary;
Color.android.attr.colorSecondary;
Color.android.attr.colorAccent;
Color.android.attr.colorBackground;
```

> **初学者须知：**
> - **colorPrimary**：应用的主色调，通常用于工具栏、按钮等核心 UI 元素。
> - **colorSecondary**：辅助色调，用于次要 UI 元素。
> - **colorAccent**：强调色，用于需要突出的交互元素（如浮动按钮、输入框光标）。
> - **colorBackground**：当前主题的背景色。
>
> 完整的主题属性列表请参阅 [Android 官方属性文档](https://developer.android.com/reference/android/R.attr)。

### 3. Material 3 静态颜色（Material 3 Static Colors）

使用 [Material Design 3](https://m3.material.io/) 规范中定义的标准亮色和暗色角色。这些颜色在所有 Android 版本上表现一致。

```tsx
import { Color } from 'expo-router';

// 主色（Primary）系列
Color.android.material.primary;
Color.android.material.onPrimary;
Color.android.material.primaryContainer;
Color.android.material.onPrimaryContainer;

// 表面色（Surface）系列
Color.android.material.surface;
Color.android.material.onSurface;
```

> **初学者须知：**
> - **Material Design 3**（简称 M3）：Google 最新的 UI 设计系统，定义了一套完整的颜色角色规范。
> - **primary / onPrimary**：`primary` 是主色，`onPrimary` 是在主色上方显示内容时应使用的颜色（通常是白色或深色文字）。"on" 前缀表示"在其上方"。
> - **primaryContainer / onPrimaryContainer**：主色的容器变体，比主色更浅/更柔和，适合用作卡片背景等。
> - **surface / onSurface**：表面色用于大面积背景区域，`onSurface` 是在其上方显示内容的颜色。
>
> 完整的 Material 3 颜色角色定义请参阅 [Material Design 3 颜色指南](https://m3.material.io/styles/color/overview)。

### 4. Material 3 动态颜色（Material 3 Dynamic Colors）

动态颜色会根据用户的**壁纸颜色**自动调整应用配色，实现个性化外观。此功能仅在 **Android API 31（Android 12）及以上版本**可用。

```tsx
import { Color } from 'expo-router';

// 动态颜色会根据用户壁纸自动适配
Color.android.dynamic.primary;
Color.android.dynamic.onPrimary;
Color.android.dynamic.surface;
Color.android.dynamic.onSurface;
```

> **注意：** 动态颜色 API 的角色名称（如 `primary`、`onPrimary`、`surface`、`onSurface`）与静态 Material 3 颜色完全相同，区别仅在于 `dynamic` 分支会根据壁纸实时调整色值。

> **初学者须知：** **API 31** 对应 Android 12。在低于 Android 12 的设备上使用动态颜色会回退到系统默认值。如果你的应用需要支持更广泛的 Android 版本，建议优先使用静态 Material 3 颜色。

---

## 处理系统主题切换

当用户在系统设置中切换亮色/暗色模式时，组件需要**重新渲染**才能显示正确的颜色。必须调用 React Native 的 `useColorScheme` Hook 来触发重新渲染。

```tsx
import { Color } from 'expo-router';
import { View, Text, useColorScheme } from 'react-native';

function MyComponent() {
  // 系统主题变化时触发组件重新渲染
  useColorScheme();

  return (
    <View style={{ backgroundColor: Color.android.dynamic.surface }}>
      <Text style={{ color: Color.android.dynamic.onSurface }}>Hello, World!</Text>
    </View>
  );
}
```

> **警告：** 如果不调用 `useColorScheme()`，当用户切换系统深色/浅色模式时，你的组件**不会自动更新颜色**，可能导致文字在深色背景上不可见等显示问题。

> **基于经验建议：** 即使你当前没有使用 `useColorScheme()` 的返回值，也必须在组件中调用它。这是因为它的作用不仅是获取当前模式，更重要的是**注册监听器**，让 React 知道需要在系统主题变化时重新渲染组件。如果你使用了 **React Compiler**（React 编译器），这一点尤为重要——编译器可能会对组件进行记忆化（memoization）优化，跳过它认为"不需要重新渲染"的组件，而 `useColorScheme()` 的调用可以明确告诉编译器"这个组件依赖外部状态，需要重新渲染"。

---

## iOS 颜色

iOS 的原生颜色会**自动适配**用户的辅助功能设置（如"增加对比度"）和当前界面外观模式（亮色/暗色）。这些颜色直接映射到 UIKit 的标准颜色系统（`UIColor` 的系统和语义颜色）。

```tsx
import { Color } from 'expo-router';
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View style={{ backgroundColor: Color.ios.systemBackground }}>
      <Text style={{ color: Color.ios.label }}>Hello, World!</Text>
    </View>
  );
}
```

> **初学者须知：**
> - **systemBackground**：iOS 系统默认背景色，亮色模式下为白色，暗色模式下为深灰色。
> - **label**：iOS 用于文本和图标的标准前景色，自动适配当前外观模式。
> - iOS 的颜色系统设计为**语义化**——使用 `label`（标签色）而不是 `black`（黑色），因为 `label` 会在暗色模式下自动变为浅色，而 `black` 始终是黑色。
> - 完整的 iOS 系统颜色列表请参阅 [Apple UIKit 颜色文档](https://developer.apple.com/documentation/uikit/uicolor/system_colors)。

> **基于经验建议：** 在 iOS 上优先使用语义化颜色（如 `label`、`secondaryLabel`、`systemBackground`）而非具体颜色（如 `black`、`white`），这样应用能更好地适配暗色模式和辅助功能设置。

---

## 跨平台使用

由于 `Color` 是平台相关的 API（Android 和 iOS 的颜色系统不同），在跨平台应用中需要使用 `Platform.select()` 方法为不同平台指定对应的颜色值，并提供一个回退的十六进制颜色值作为兜底方案。

```tsx
import { Platform, View, Text } from 'react-native';
import { Color } from 'expo-router';

function MyComponent() {
  const backgroundColor = Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: '#000000',
  });

  const textColor = Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: '#FFFFFF',
  });

  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Hello, World!</Text>
    </View>
  );
}
```

> **初学者须知：**
> - **Platform.select()**：React Native 提供的工具方法，根据当前运行平台返回对应的值。`ios` 对应 iPhone/iPad，`android` 对应 Android 设备，`default` 是所有其他平台的回退值。
> - **十六进制颜色**：如 `#000000`（黑色）、`#FFFFFF`（白色），是一种用 `#` 加六位十六进制数字表示颜色的方式。
> - `default` 回退值在 Web 端或其他非移动平台上会被使用。

> **基于经验建议：** 始终为 `Platform.select()` 提供 `default` 回退值。在开发阶段你可能只在模拟器上测试 iOS 和 Android，但当你将应用部署到 Web 端时，缺少 `default` 会导致颜色为 `undefined`，从而产生不可预期的显示效果。

---

## Android 颜色速查表

| 类别 | 访问路径 | 说明 |
|------|---------|------|
| 基础颜色 | `Color.android.*` | Android 系统基础颜色资源 |
| 主题属性 | `Color.android.attr.*` | 当前主题的属性颜色 |
| Material 3 静态 | `Color.android.material.*` | Material Design 3 标准颜色角色 |
| Material 3 动态 | `Color.android.dynamic.*` | 根据壁纸动态调整的颜色（API 31+） |

## iOS 颜色速查表

| 访问路径 | 说明 |
|---------|------|
| `Color.ios.*` | iOS UIKit 系统颜色，自动适配外观模式和辅助功能设置 |

---

## 最佳实践总结

> **基于文档内容推导：**

1. **优先使用语义化颜色**：无论是 Android 的 Material 3 颜色角色（`primary`、`surface`）还是 iOS 的语义颜色（`label`、`systemBackground`），都比直接使用具体色值更能适应系统变化。

2. **始终处理主题切换**：在使用系统颜色的组件中调用 `useColorScheme()`，确保系统主题变化时组件能正确重新渲染。

3. **跨平台代码使用 Platform.select()**：为每个平台指定对应的原生颜色，并提供十六进制回退值。

4. **根据目标版本选择 Android 颜色类型**：
   - 如果需要支持 Android 12 以下版本 → 使用 Material 3 静态颜色（`Color.android.material.*`）
   - 如果仅面向 Android 12+ → 可以使用动态颜色（`Color.android.dynamic.*`）
   - 如果需要获取当前主题属性 → 使用主题属性颜色（`Color.android.attr.*`）

5. **利用 TypeScript 类型检查**：`Color` 工具提供了完整的类型定义，善用编辑器的自动补全功能可以避免拼写错误。

---

## 文档导航

- **上一页**：[url parameters](./84__url-parameters.md)
- **下一页**：[sitemap](./86__sitemap.md)
