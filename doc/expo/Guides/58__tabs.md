# JavaScript 标签页导航（Tabs）

> 原始文档地址：https://docs.expo.dev/router/advanced/tabs/

标签页（Tabs）是移动应用中最常见的导航模式之一，用于在应用的多个主要功能区之间进行切换。Expo Router 基于 React Navigation 的底部标签栏（Bottom Tabs Navigator）进行了封装，使得在基于文件系统的路由中创建标签页导航变得非常简单。

---

## 三种标签页导航类型

Expo Router 支持三种标签页导航实现方式：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **JavaScript 标签页** | 基于 React Navigation 的成熟 API，使用 JavaScript 渲染 | 大多数通用场景，灵活性高 |
| **Native 标签页** | 使用平台原生 UI 组件渲染，外观更贴合系统风格 | 追求原生体验的场景 |
| **Custom 标签页** | 使用无头（headless）组件，完全自定义 UI | 需要高度定制化设计的场景 |

本文档专注于 **JavaScript 标签页** 的使用。如需了解其他两种类型，请参阅 [Native Tabs](./59__native-tabs.md) 和自定义标签页相关文档。

> **初学者须知**：
> - **React Navigation**：React Native 生态中最流行的导航库，Expo Router 底层依赖它来实现各种导航模式。
> - **无头组件（Headless Component）**：只提供逻辑和数据，不提供任何 UI 样式的组件，开发者需要自行编写所有界面代码。
> - **Bottom Tabs Navigator**：底部标签栏导航器，即屏幕底部显示的带有图标和文字标签的导航条，每个标签对应一个页面。

---

## 快速开始

### 使用模板

最快的方式是使用 Expo 提供的模板来创建项目，模板中已经预设好了标签页布局。

### 手动配置文件路由

标签页导航通过文件系统路由自动建立。你需要创建一个 `(tabs)` 目录来启用标签页布局。

> **初学者须知**：
> - **`(tabs)` 目录**：在 Expo Router 中，用圆括号包裹的目录名表示这是一个"路由分组"（Route Group）。路由分组不会出现在 URL 路径中，但可以用来组织和共享布局。`(tabs)` 是一个约定俗成的名称，用于标识标签页布局。
> - **`_layout.tsx`**：以 `_layout` 命名的文件是布局文件，它定义了该目录下所有页面的共享布局结构（如导航栏、标签栏等）。

典型的项目目录结构如下：

```
src/
  app/
    _layout.tsx          # 根布局文件
    (tabs)/
      _layout.tsx        # 标签页布局文件
      index.tsx          # 默认首页标签（Home）
      settings.tsx       # 设置页标签（Settings）
```

### 第一步：配置根布局

在根布局文件 `src/app/_layout.tsx` 中，使用 `Stack` 组件包裹标签页路由分组，并隐藏其头部导航栏：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

> **代码说明**：
> - `Stack.Screen` 的 `name` 属性设为 `"(tabs)"`，与目录名对应。
> - `headerShown: false` 隐藏了 Stack 导航器的默认顶部标题栏，因为标签页通常有自己的标题样式。

### 第二步：配置标签页布局

在 `src/app/(tabs)/_layout.tsx` 中配置标签栏和各个标签页：

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

> **代码说明**：
> - `Tabs` 组件：Expo Router 提供的标签页布局容器。
> - `screenOptions`：全局配置选项，应用于所有标签页。这里设置了激活状态的文字颜色为蓝色。
> - `Tabs.Screen`：定义每个标签页。`name` 属性对应 `(tabs)` 目录下的文件名（不含扩展名）。
> - `tabBarIcon`：一个渲染函数，接收 `color` 参数（根据标签是否被选中自动变化），返回图标组件。
> - `@expo/vector-icons`：Expo 内置的图标库，包含 FontAwesome、Ionicons 等多种图标集。

### 第三步：编写标签页内容

每个标签页对应一个页面文件，例如 `src/app/(tabs)/index.tsx`：

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

`src/app/(tabs)/settings.tsx` 的结构类似：

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

> **注意**：`index.tsx` 文件对应的页面会作为标签页导航的 **默认初始页面**，即应用启动时首先展示的标签页。

---

## 配置选项详解

标签页导航基于 React Navigation 的 Bottom Tabs Navigator 构建。配置属性可以通过两种方式设置：

- **全局设置**：通过 `screenOptions` 属性统一应用于所有标签页。
- **单独设置**：通过每个 `Tabs.Screen` 的 `options` 属性单独配置。

> **版本兼容性说明**：配置属性的可用性取决于你使用的 Expo Router 版本和 React Navigation 版本。例如，Expo Router v6 搭配 React Navigation v7。请确保查阅对应版本的文档。

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ /* 全局配置选项 */ }}>
      <Tabs.Screen name="index" options={{ /* 单独配置选项 */ }} />
    </Tabs>
  );
}
```

### 完整配置属性列表

以下是所有支持的配置属性：

#### 样式与颜色

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarActiveTintColor` | `string` | 标签处于激活状态时，图标和文字的颜色 |
| `tabBarInactiveTintColor` | `string` | 标签处于未激活状态时，图标和文字的颜色 |
| `tabBarActiveBackgroundColor` | `string` | 标签处于激活状态时的背景颜色 |
| `tabBarInactiveBackgroundColor` | `string` | 标签处于未激活状态时的背景颜色 |
| `tabBarStyle` | `StyleProp<ViewStyle>` | 标签栏容器的样式。支持绝对定位（`position: 'absolute'`）实现覆盖式效果，但需手动为页面内容添加边距以避免被遮挡 |
| `tabBarIconStyle` | `StyleProp<ViewStyle>` | 图标容器的样式 |
| `tabBarItemStyle` | `StyleProp<ViewStyle>` | 单个标签项（包含图标和文字）的样式 |
| `tabBarLabelStyle` | `StyleProp<TextStyle>` | 标签文字的样式 |

#### 背景

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarBackground` | `() => React.ReactNode` | 自定义标签栏背景元素，例如可以使用 `BlurView` 实现毛玻璃效果 |

> **重要**：使用自定义背景时，必须在 `tabBarStyle` 中设置 `position: 'absolute'`，并使用 `useBottomTabBarHeight` Hook 获取标签栏高度，为页面内容手动添加底部内边距，否则内容可能被标签栏遮挡。

**示例：使用模糊背景效果**

```tsx
import { BlurView } from 'expo-blur';
import { Tabs, useBottomTabBarHeight } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarBackground: () => <BlurView intensity={80} style={{ flex: 1 }} />,
        tabBarStyle: {
          position: 'absolute',
        },
      }}>
      {/* ... */}
    </Tabs>
  );
}
```

#### 徽标（Badge）

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarBadge` | `string \| number \| boolean` | 显示在图标右上角的徽标内容，可以是数字或字符串。设为 `false` 则不显示 |
| `tabBarBadgeStyle` | `StyleProp<TextStyle>` | 徽标的样式 |

> **初学者须知**：徽标（Badge）常用于显示未读消息数量或通知提醒，例如微信底部"消息"标签上的数字角标。

#### 标签与图标

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarIcon` | `(props: { focused: boolean; color: string; size: number }) => React.ReactNode` | 图标渲染函数，根据标签的选中/未选中状态返回不同的图标组件 |
| `tabBarLabel` | `string \| React.ReactNode \| ((props) => React.ReactNode)` | 自定义标签文字内容或渲染函数 |
| `tabBarShowLabel` | `boolean` | 是否显示标签文字，设为 `false` 则只显示图标 |
| `tabBarLabelPosition` | `'below-icon' \| 'beside-icon'` | 标签文字相对于图标的位置：`below-icon`（图标下方，默认）或 `beside-icon`（图标旁边） |

#### 按钮

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarButton` | `(props: PressableProps) => React.ReactNode` | 自定义标签按钮的包装元素，可以替换默认的按钮组件 |
| `tabBarButtonTestID` | `string` | 用于自动化测试的标识符 |

#### 位置与布局

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarPosition` | `'bottom' \| 'top' \| 'left' \| 'right'` | 标签栏的位置。默认在底部（`bottom`）。设为 `left` 或 `right` 时可实现侧边栏布局，适用于宽屏设备 |
| `tabBarVariant` | `'uikit' \| 'material'` | UI 样式框架。`uikit` 为标准样式，`material` 遵循 Material Design 规范。注意：`material` 样式仅支持 `left` 或 `right` 位置 |

#### 辅助功能与行为

| 属性 | 类型 | 说明 |
|------|------|------|
| `tabBarAccessibilityLabel` | `string` | 屏幕阅读器读取的文字标签，用于无障碍访问 |
| `tabBarHideOnKeyboard` | `boolean` | 当屏幕键盘弹出时是否自动隐藏标签栏 |

> **基于经验建议**：在 iOS 上，键盘弹出时隐藏标签栏通常是好的做法（空间更充裕）；在 Android 上，键盘的行为可能因设备和系统版本而异，建议实际测试后决定。

---

## 高级用法

### 隐藏路由（不显示标签按钮）

有时候你需要某个路由在标签栏中可用，但不希望在标签栏上显示对应的按钮。这通常用于以下场景：

- 详情页需要通过编程式导航到达，但不需要独立的标签入口
- 某些标签页仅在特定条件下可见

通过将 `href` 选项设为 `null` 即可实现：

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
```

> **代码说明**：
> - `href: null` 让该路由仍然可以被导航到（例如通过 `router.push`），但在标签栏上不会显示对应的按钮。
> - 这不同于从标签栏配置中完全移除该路由——移除后该路由将无法作为标签页的一部分工作。

> **基于经验建议**：隐藏路由常见于"详情页嵌套在标签布局中"的场景。例如，你可能有一个 `profile/[id]` 路由放在 `(tabs)` 目录下以共享标签栏布局，但不希望它为每个用户 ID 都生成一个标签按钮。

### 动态路径标签页

标签页可以链接到动态路径，例如用户个人主页。通过 `href` 属性传递字符串路径或包含路径名和参数的对象：

**方式一：字符串路径**

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="[user]"
        options={{
          href: '/evanbacon',
        }}
      />
    </Tabs>
  );
}
```

**方式二：对象形式（含参数）**

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="[user]"
        options={{
          href: {
            pathname: '/[user]',
            params: { user: 'evanbacon' },
          },
        }}
      />
    </Tabs>
  );
}
```

> **初学者须知**：
> - **动态路由**：文件名用方括号包裹（如 `[user].tsx`）表示该部分是动态的，可以匹配不同的值。例如 `[user]` 可以匹配 `/evanbacon`、`/johndoe` 等路径。
> - **`href`**：指定标签按钮点击后导航到的目标路径。当标签名本身是动态路由时，必须通过 `href` 明确告诉导航器实际的目标 URL。

> **警告**：在标签页布局中，**不能有两个标签页指向同一个动态路由**。例如，不能同时定义两个 `[user]` 标签页。如果需要这种复杂的场景，请使用自定义导航器（Custom Navigator）来实现。

---

## 常见问题与注意事项

### 标签栏遮挡内容

当使用绝对定位或自定义背景时，标签栏会覆盖在页面内容之上。此时需要手动为页面内容添加底部内边距：

```tsx
import { useBottomTabBarHeight } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function Screen() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      {/* 页面内容 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 标签页内的嵌套导航

每个标签页内部可以使用独立的 `Stack` 导航器，实现标签页内的页面跳转（push/pop）而不影响标签栏的显示：

```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
```

```tsx
// src/app/(tabs)/index.tsx
import { Stack } from 'expo-router';

export default function HomeTabs() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '首页' }} />
      <Stack.Screen name="details" options={{ title: '详情' }} />
    </Stack>
  );
}
```

> **基于经验建议**：嵌套 Stack 是标签页应用中最常用的架构模式。用户在首页列表中点击某项后，应该 push 到一个详情页，同时底部标签栏保持不变。这就是通过在标签页内嵌套 Stack 来实现的。

### 标签页状态保持

标签页导航默认会保持各标签页的状态——当你从"首页"切换到"设置"再切回"首页"时，首页的滚动位置、表单输入等状态都会被保留。这是标签页导航的标准行为，与 Stack 导航不同（Stack 导航在 pop 后页面会被销毁）。

> **基于文档内容推导**：如果需要重置某个标签页的状态，可以在标签切换事件中监听变化，并通过 `router.replace` 或组件的 `key` 属性强制重新渲染页面。

---

## 相关链接

- [Expo Router 官方文档 - Tabs](https://docs.expo.dev/router/advanced/tabs/)
- [React Navigation - Bottom Tabs Navigator](https://reactnavigation.org/docs/bottom-tab-navigator/)
- [Stack 导航](./57__stack.md)
- [Native Tabs](./59__native-tabs.md)

---

## 文档导航

- **上一页**：[stack](./57__stack.md)
- **下一页**：[native tabs](./59__native-tabs.md)
