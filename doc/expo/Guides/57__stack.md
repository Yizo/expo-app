# Stack 导航器

> 原始文档地址：https://docs.expo.dev/router/advanced/stack/

## 概述

Stack 导航器（栈式导航器）是 Expo Router 中管理页面历史的核心组件。它通过"栈"的数据结构来管理屏幕的进出：每次导航到新页面时，新页面会被"压入"栈顶；返回时，栈顶页面会被"弹出"。

**关键术语说明（面向初学者）：**

- **Stack（栈）**：一种后进先出（LIFO）的数据结构。在导航场景中，最后打开的页面最先被关闭。
- **Navigator（导航器）**：负责管理一组页面之间切换逻辑的容器组件。
- **Screen（屏幕/页面）**：导航器中每一个独立的页面。
- **Layout（布局）**：Expo Router 中用于定义导航结构的特殊文件，通常命名为 `_layout.tsx`。
- **Header（头部/导航栏）**：页面顶部的工具栏区域，通常显示标题、返回按钮和自定义操作按钮。
- **Transition（过渡动画）**：页面切换时的视觉动画效果。

**平台差异**：在 iOS 上，新页面默认从右侧滑入；在 Android 上，新页面默认从底部覆盖上来。

---

## 快速开始

基于文件的路由系统会自动构建 Stack 导航。你只需要在根布局文件中初始化导航器即可。

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

> **基于文档内容推导**：Expo Router 会根据项目 `app/` 目录下的文件结构自动生成导航栈，无需手动注册每个页面路由。

---

## 页面选项与头部配置

从 SDK 55 开始，Expo Router 提供了两种可互换的头部配置方式：传统的 **options 对象 API** 和全新的 **组合式组件 API（Composition API）**。

### 静态与全局配置

使用 `screenOptions` 属性可以对所有页面应用全局样式，也可以使用 `<Stack.Screen>` 元素针对特定路由进行配置。

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="home" options={{}} />
    </Stack>
  );
}
```

**关键术语说明：**

- **`screenOptions`**：应用于导航器中所有页面的全局选项对象。
- **`headerStyle`**：控制头部栏的背景样式。
- **`headerTintColor`**：控制头部栏中文字和图标的着色（通常为白色或深色）。

### 动态配置

在页面运行时动态修改头部信息，两种方式均可实现。

#### Options API（传统方式）

```tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Details() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: params.name,
          headerStyle: { backgroundColor: 'lightblue' },
        }}
      />
      <Text onPress={() => router.setParams({ name: 'Updated' })}>
        Update the title
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

#### 组合式组件 API（SDK 55 Alpha 新增）

```tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Details() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Title>{params.name}</Stack.Title>
      <Stack.Header style={{ backgroundColor: 'lightblue' }} />
      <Text onPress={() => router.setParams({ name: 'Updated' })}>
        Update the title
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

> **基于经验建议**：如果你的项目使用 SDK 55 及以上版本，推荐优先使用组合式组件 API，它更加直观且符合 React 组件化的思维方式。但如果需要兼容旧版本，Options API 仍然是可靠的选择。

---

### 可用的配置属性

Stack 导航器提供了大量属性用于自定义头部和页面行为。以下按类别整理：

#### 头部（Header）属性

| 属性 | 说明 |
|------|------|
| `header` | 自定义 React 元素，完全替换默认头部 |
| `headerBackground` | 自定义头部背景元素 |
| `headerLeft` | 头部左侧自定义元素 |
| `headerRight` | 头部右侧自定义元素 |
| `unstable_headerLeftItems` | 实验性：头部左侧项目区域 |
| `unstable_headerRightItems` | 实验性：头部右侧项目区域 |

#### 返回按钮属性

| 属性 | 说明 |
|------|------|
| `headerBackButtonDisplayMode` | 返回按钮显示模式：`"default"`（默认）、`"generic"`（通用）、`"minimal"`（极简） |
| `headerBackButtonMenuEnabled` | 是否启用返回按钮长按菜单 |
| `headerBackImageSource` | 自定义返回按钮图标资源 |
| `headerBackTitle` | 自定义返回按钮文字 |
| `headerBackTitleStyle` | 返回按钮文字样式 |
| `headerBackVisible` | 是否显示返回按钮 |

#### 排版与样式属性

| 属性 | 说明 |
|------|------|
| `headerStyle` | 头部容器样式 |
| `headerTintColor` | 头部着色（文字和图标颜色） |
| `headerTitle` | 头部标题文字 |
| `headerTitleAlign` | 标题对齐方式 |
| `headerTitleStyle` | 标题文字样式 |
| `headerShadowVisible` | 是否显示头部阴影 |
| `headerTransparent` | 是否使头部透明 |
| `headerBlurEffect` | 头部模糊效果 |

#### iOS 大标题（Large Title）属性

| 属性 | 说明 |
|------|------|
| `headerLargeTitle` | 是否启用 iOS 大标题样式 |
| `headerLargeStyle` | 大标题区域样式 |
| `headerLargeTitleShadowVisible` | 大标题是否显示阴影 |
| `headerLargeTitleStyle` | 大标题文字样式 |

#### iOS 搜索栏属性

| 属性 | 说明 |
|------|------|
| `headerSearchBarOptions` | 搜索栏配置对象（支持焦点控制、着色、占位符和回调函数） |

#### 页面过渡动画属性

| 属性 | 说明 |
|------|------|
| `animation` | 过渡动画类型，如 `"fade"`（淡入淡出）、`"flip"`（翻转）等 |
| `animationDuration` | 动画持续时间 |
| `animationMatchesGesture` | 动画是否与手势联动 |
| `animationTypeForReplace` | 替换页面时的动画类型 |

#### 手势控制属性

| 属性 | 说明 |
|------|------|
| `gestureDirection` | 手势方向 |
| `gestureEnabled` | 是否启用手势返回 |
| `fullScreenGestureEnabled` | 是否启用全屏手势返回 |
| `fullScreenGestureShadowEnabled` | 全屏手势是否显示阴影 |

#### 展示模式属性

| 属性 | 说明 |
|------|------|
| `presentation` | 展示方式，如 `"modal"`（模态框）、`"formSheet"`（表单页）等 |
| `contentStyle` | 页面内容区域样式 |
| `orientation` | 屏幕方向锁定 |
| `autoHideHomeIndicator` | 是否自动隐藏 iOS 底部 Home 指示条 |
| `freezeOnBlur` | 页面失焦时是否冻结渲染 |

#### 系统栏属性

| 属性 | 说明 |
|------|------|
| `statusBarAnimation` | 状态栏动画 |
| `statusBarHidden` | 是否隐藏状态栏 |
| `statusBarStyle` | 状态栏样式 |

> **注意**：Android 导航栏颜色和状态栏颜色的相关属性已被标记为废弃（deprecated）。

#### Sheet（表单页）属性

用于 `presentation: "formSheet"` 模式下的配置：

| 属性 | 说明 |
|------|------|
| `sheetAllowedDetents` | 表单页允许停留的拖拽位置 |
| `sheetCornerRadius` | 表单页圆角半径 |
| `sheetElevation` | 表单页阴影高度 |
| `sheetExpandsWhenScrolledToEdge` | 滚动到边缘时是否扩展 |
| `sheetGrabberVisible` | 是否显示拖拽把手 |
| `sheetInitialDetentIndex` | 初始停留位置索引 |
| `sheetLargestUndimmedDetentIndex` | 最大非暗淡停留位置索引 |

#### 标签栏（Tab Bar）属性

包括样式、位置、徽章、图标、标签和无障碍相关配置（如 `tabBarStyle`、`tabBarPosition`、`tabBarVariant` 等）。

---

### 头部按钮

可以在头部注入自定义元素，两种方式均可实现。

#### Options API 方式

```tsx
import { Stack } from 'expo-router';
import { Button, Text, Image, StyleSheet } from 'react-native';
import { useState } from 'react';

function LogoTitle() {
  return (
    <Image
      style={styles.image}
      source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
    />
  );
}

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: (props) => <LogoTitle {...props} />,
          headerRight: () => (
            <Button onPress={() => setCount((c) => c + 1)} title="Update count" />
          ),
        }}
      />
      <Text>Count: {count}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  image: { width: 50, height: 50 },
});
```

#### 组合式组件 API 方式

```tsx
import { Stack } from 'expo-router';
import { Button, Text, Image, StyleSheet } from 'react-native';
import { useState } from 'react';

function LogoTitle() {
  return (
    <Image
      style={styles.image}
      source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
    />
  );
}

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Stack.Title asChild>
        <LogoTitle />
      </Stack.Title>
      <Stack.Toolbar placement="right" asChild>
        <Button onPress={() => setCount((c) => c + 1)} title="Update count" />
      </Stack.Toolbar>
      <Text>Count: {count}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  image: { width: 50, height: 50 },
});
```

**关键术语说明：**

- **`asChild`**：组合式组件 API 中的属性，表示将父组件的行为和样式委托给子元素，而不是渲染额外的包装元素。
- **`Stack.Toolbar`**：用于在头部指定位置放置自定义工具栏按钮的组合式组件。`placement` 属性控制放置位置（如 `"right"` 或 `"left"`）。

---

## 自定义 Push 行为

默认情况下，Stack 导航器会自动忽略重复的路由——如果你尝试 push 一个已经存在于栈中的相同路由，导航器不会创建新的页面实例。

如果确实需要创建同一页面的多个实例，可以通过提供 `getId` 函数来为每个实例生成唯一标识符：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="[profile]"
        getId={({ params }) => String(Date.now())}
      />
    </Stack>
  );
}
```

> **基于经验建议**：`getId` 函数使用 `Date.now()` 作为唯一标识是一种简单有效的方式，但在快速连续调用时可能产生相同的值。如果对唯一性有更高要求，建议使用 UUID 库来生成标识符。

**关键术语说明：**

- **`getId`**：一个函数属性，用于为路由实例生成唯一标识。当返回值不同时，即使路由名称相同，Stack 也会视为不同页面。
- **Push（压入）**：将新页面添加到导航栈顶部的操作。

---

## 移除 Stack 页面（返回导航）

Expo Router 提供了多种路由操作来管理导航历史。

### dismiss —— 弹出页面

弹出栈顶页面，或弹出指定数量的页面。

```tsx
import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Go to first screen" onPress={() => router.dismiss(3)} />
    </View>
  );
}
```

### dismissTo —— 弹出至指定页面（v4.0.8+ 新增）

持续弹出页面直到到达目标路由。如果目标路由不在栈中，则会执行 push 操作。

```tsx
import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Go to first screen" onPress={() => router.dismissTo('/')} />
    </View>
  );
}
```

### dismissAll —— 清空栈回到根页面

清除所有页面，回到栈的根页面。

```tsx
import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Go to first screen" onPress={() => router.dismissAll()} />
    </View>
  );
}
```

### canDismiss —— 检查是否可以弹出

检查当前栈深度是否允许执行弹出操作。

```tsx
import { Button, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Maybe dismiss"
        onPress={() => {
          if (router.canDismiss()) {
            router.dismiss();
          }
        }}
      />
    </View>
  );
}
```

> **基于经验建议**：在根页面调用 `dismiss()` 会导致无响应或意外行为，建议始终在调用 `dismiss()` 之前使用 `canDismiss()` 进行检查，特别是在用户可能通过深层链接直接进入页面的场景中。

**关键术语说明：**

- **`useRouter`**：Expo Router 提供的 Hook，用于在组件中获取路由操作对象。
- **`dismiss(n)`**：弹出栈顶的 n 个页面。不传参数时默认弹出 1 个。
- **`dismissTo(route)`**：弹出页面直到到达指定路由。
- **`dismissAll()`**：弹出所有页面，回到根页面。
- **`canDismiss()`**：返回布尔值，表示当前是否可以执行弹出操作。

---

## iOS 26 液态玻璃头部效果

iOS 26 对头部栏强制应用了原生的液态玻璃（Liquid Glass）视觉效果。如果需要退出该行为，有以下两种方法：

### 方法一：Plist 配置（临时方案）

> **警告**：此方法在 Expo Go 中不受支持，且已在 iOS 27 中被标记为废弃。

```json
{
  "ios": {
    "infoPlist": {
      "UIDesignRequiresCompatibility": true
    }
  }
}
```

### 方法二：JavaScript Stack（JS 驱动栈）

使用 JS 驱动的 Stack 来绕过原生视图。这是 SDK 56 中用于替代旧版导航库的方案。

```tsx
import { Stack as JsStack } from 'expo-router/js-stack';

export default function Layout() {
  return <JsStack />;
}
```

**关键术语说明：**

- **Liquid Glass（液态玻璃）**：Apple 在 iOS 26 中引入的全新视觉设计语言，为 UI 元素添加半透明、折射光效的玻璃质感。
- **Plist**：iOS 应用的属性列表文件（`Info.plist`），用于存储应用配置信息。
- **JS Stack**：完全由 JavaScript 实现的 Stack 导航器，不依赖原生 iOS 导航视图，因此不受原生样式限制。

> **基于经验建议**：如果你的应用对头部栏有高度定制化的设计需求，建议直接采用 `JsStack` 方案，它不仅能绕过液态玻璃效果，还能提供更灵活的头部自定义能力。但需要注意 JS Stack 可能在某些原生手势体验上不如原生 Stack 流畅。

---

## 常见问题

### 大标题无法折叠

iOS 的大标题（Large Title）需要在滚动时自动折叠为普通标题。如果大标题无法折叠，通常是因为可滚动视图不是页面的直接第一个子元素。

**解决方案**：如果可滚动视图被其他 View 包裹，需要在包裹的 View 上设置 `collapsable={false}`：

```tsx
import { Stack } from 'expo-router';
import { ScrollView, View, Text } from 'react-native';

export default function Home() {
  return (
    <View collapsable={false}>
      <ScrollView>
        <Stack.Title large>Home</Stack.Title>
        <Text>Content here</Text>
      </ScrollView>
    </View>
  );
}
```

**关键术语说明：**

- **`collapsable`**：React Native View 的属性。当设为 `false` 时，阻止该 View 被原生系统合并优化，确保滚动视图的折叠行为正常工作。
- **大标题折叠**：iOS 原生行为，当用户向上滚动时，大标题自动缩小为普通标题栏。

> **基于文档内容推导**：大标题折叠依赖于 iOS 原生的 `UINavigationBar` 与 `UIScrollView` 之间的联动机制。当 ScrollView 不是导航器的直接子视图时，这种联动关系会被打断，因此需要通过 `collapsable={false}` 来保持正确的视图层级。

### 过渡动画期间出现白色闪烁

页面切换时如果背景色不匹配，会导致白色闪烁。

**解决方案**：在根布局中使用 `ThemeProvider` 包裹导航器，使主题与应用的颜色方案保持一致：

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack />
    </ThemeProvider>
  );
}
```

**关键术语说明：**

- **`ThemeProvider`**：Expo Router 提供的主题上下文组件，用于向导航器注入主题配色。
- **`DarkTheme` / `DefaultTheme`**：Expo Router 内置的暗色/亮色主题对象。
- **`useColorScheme`**：React Native Hook，用于获取当前系统的颜色方案（`"dark"` 或 `"light"`）。

> **基于经验建议**：白色闪烁问题在暗色模式应用中尤为常见。建议在项目初期就配置好 `ThemeProvider`，而不是等到出现闪烁问题后再修复。同时确保 `DarkTheme` 和 `DefaultTheme` 中的 `colors.background` 与应用的实际背景色一致。

---

## 文档导航

- **上一页**：[common navigation patterns](./56__common-navigation-patterns.md)
- **下一页**：[tabs](./58__tabs.md)
