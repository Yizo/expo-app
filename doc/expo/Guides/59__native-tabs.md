# 系统级底部导航（Native Tabs）

> **原文地址**：https://docs.expo.dev/router/advanced/native-tabs/

---

## 概述

Native Tabs 是 Expo Router 提供的一项功能，它使用**操作系统原生的底部导航栏**（而非 JavaScript 实现的导航栏）来呈现标签页切换界面。这意味着导航栏的外观和行为完全遵循 iOS 和 Android 的系统规范，用户会获得最"原生"的体验。

> **关键术语解释**：
> - **Native（原生）**：指由操作系统（iOS / Android）直接提供的 UI 组件，而非通过 JavaScript 在 React Native 层绘制的组件。原生组件通常性能更好、视觉一致性更高。
> - **底部导航栏（Bottom Navigation / Tab Bar）**：位于屏幕底部的水平导航条，用户点击不同标签（Tab）即可切换页面，是移动端最常见的导航模式之一。
> - **Alpha 阶段**：表示该功能仍处于早期测试版本，API 可能在未来发生变化，不建议在生产环境中大规模使用。

**重要提示**：该功能目前处于 **Alpha** 阶段，适用于 **SDK 54 及以上版本**。它利用系统原生 UI 而非 JavaScript 来实现导航栏渲染。

> **基于经验建议**：由于该功能尚处于 Alpha 阶段，API 可能在后续版本中发生重大变化。如果你正在开发需要长期维护的生产应用，请谨慎评估是否采用此功能，或者使用已经成熟的 JavaScript 版本的 Tabs（参见 [tabs 指南](./58__tabs.md)）。

**适用场景**：
- 如果你希望应用导航栏拥有系统原生的外观和交互体验（例如 iOS 上的"液态玻璃"风格），请选择 Native Tabs。
- 如果你需要完全自定义的视觉效果，请考虑其他自定义方案。
- 如果你已经在使用 React Navigation 的 JavaScript 标签导航，可以继续使用 JavaScript 版本。

---

## 初始设置

Expo Router 使用**基于文件系统的路由**来生成导航结构。一个标准的标签导航目录包含一个根布局文件（`_layout.tsx`）和若干路由页面文件。

> **关键术语解释**：
> - **布局文件（Layout）**：在 Expo Router 中，`_layout.tsx` 文件定义了该目录下所有页面的共享布局结构。对于标签导航，布局文件负责配置导航栏的外观和行为。
> - **Trigger（触发器）**：Native Tabs 中用来声明每一个标签项的组件。与传统 JavaScript Tabs 中的 `Screen` 不同，Native Tabs 使用 `Trigger` 来定义每个标签的名称、图标和文字。

**与 Stack 导航不同，开发者必须显式声明每个导航项（Trigger）。**

### 目录结构示例

```
src/app/
├── _layout.tsx        # 根布局文件，配置 NativeTabs
├── index.tsx          # 首页标签
└── settings.tsx       # 设置标签
```

### 布局文件配置

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **关键术语解释**：
> - **`sf`**：SF Symbols 的缩写，是 Apple 提供的图标库。通过 `sf` 属性可以使用 iOS 系统内置的图标。
> - **`md`**：Material Design 图标的缩写，是 Google / Android 使用的图标库。通过 `md` 属性可以指定 Android 端显示的图标。
> - **`drawable`**（SDK 54）：Android 中的 Drawable 资源，用于引用自定义的安卓图形资源文件。
> - **复合组件模式（Compound Component）**：SDK 55 采用 `NativeTabs.Trigger.Label`、`NativeTabs.Trigger.Icon` 等嵌套写法，这种模式叫做"复合组件"，它通过组件嵌套组合来配置功能，比属性对象更灵活。

### 标签页面文件

以下是两个标签页面的示例：**src/app/index.tsx** 和 **src/app/settings.tsx**。

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab [Home|Settings]</Text>
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

默认情况下，初始路由（`index`）会首先加载。后续文件展示了如何添加额外的导航元素。

---

## 导航项自定义

Native Tabs 提供了专门的组件 API 来修改图标、文字和通知徽章等视觉元素。

### 图标（Icon）

图标支持以下来源：
- **SF Symbols**（iOS 系统图标）
- **Material Symbols**（Android 系统图标）
- **自定义图片资源**

> **注意**：如果要为图标分别指定默认状态和选中状态的样式，Android 端需要 SDK 55 及以上版本。

> **注意**：Apple 系统的半透明（translucent）风格要求使用**动态颜色函数**（Dynamic Color），因为系统不会提供背景色变化的直接回调。

#### 基本用法 — SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home_filled' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon src={require('../../../assets/setting_icon.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### 基本用法 — SDK 54

```tsx
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="custom_home_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon src={require('../../../assets/setting_icon.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### 使用动态颜色适配深色模式 — SDK 55 及以上版本

```tsx
import { DynamicColorIOS } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      labelStyle={{
        // 设置文字颜色
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      // 设置选中状态的图标颜色
      tintColor={DynamicColorIOS({
        dark: 'white',
        light: 'black',
      })}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          src={{
            default: require('../assets/setting_icon.png'),
            selected: require('../assets/selected_setting_icon.png'),
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### 使用动态颜色适配深色模式 — SDK 54

```tsx
import { DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      labelStyle={{
        // 设置文字颜色
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      // 设置选中状态的图标颜色
      tintColor={DynamicColorIOS({
        dark: 'white',
        light: 'black',
      })}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="custom_home_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon
          src={{
            default: require('../assets/setting_icon.png'),
            selected: require('../assets/selected_setting_icon.png'),
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **关键术语解释**：
> - **`DynamicColorIOS`**：React Native 提供的工具函数，可以根据系统当前是深色模式还是浅色模式，自动返回不同的颜色值。这对于适配 iOS 系统的深色模式非常重要。
> - **`tintColor`**：着色颜色，通常用于控制图标在"选中"状态下的颜色。

#### 渲染模式（Rendering Mode）

iOS 上的自定义图片支持两种渲染模式：
- **`original`**：保留图片的原始颜色（适用于渐变色或多色图标）
- **`template`**：将图片作为单色模板渲染（默认行为），颜色由系统控制

> **注意**：Android 端始终保留图片的原始颜色，不支持 `template` 模式。

##### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      {/* 保留原始颜色的图标（例如渐变或多色图标） */}
      <NativeTabs.Trigger name="colorful">
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/colorful_icon.png')}
          renderingMode="original"
        />
      </NativeTabs.Trigger>
      {/* 作为模板渲染的图标（默认行为） */}
      <NativeTabs.Trigger name="simple">
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/simple_icon.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

##### SDK 54

```tsx
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      {/* 保留原始颜色的图标（例如渐变或多色图标） */}
      <NativeTabs.Trigger name="colorful">
        <Icon src={require('../../../assets/colorful_icon.png')} renderingMode="original" />
      </NativeTabs.Trigger>
      {/* 作为模板渲染的图标（默认行为） */}
      <NativeTabs.Trigger name="simple">
        <Icon src={require('../../../assets/simple_icon.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### Xcode 资源目录（Asset Catalogs）

在 Apple 设备上，支持使用 Xcode 的资源目录（`.xcassets`）来管理图片资源。

使用单个资源名称：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon xcasset="home-icon" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

使用默认/选中两个状态的资源名称：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          xcasset={{
            default: 'home-outline',
            selected: 'home-filled',
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **关键术语解释**：
> - **Asset Catalog（资源目录）**：Xcode 中管理图片、颜色等资源的工具。使用资源目录可以更好地适配不同分辨率和深色/浅色模式。
> - **`xcasset`**：Expo Router 提供的属性，用于引用 Xcode Asset Catalog 中的资源名称。

---

### 文字标签（Label）

标签组件接受字符串子元素作为显示文字，也可以完全隐藏。

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **基于经验建议**：隐藏标签文字（`hidden`）适用于图标含义非常明确的场景（如放大镜代表搜索），但为了无障碍访问（Accessibility），建议大多数情况下保留文字标签。

---

### 通知徽章（Badge）

徽章用于在标签图标上显示未读消息数量或简单的提示圆点。

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="messages">
        <NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Badge />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Badge } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="messages">
        <Badge>9+</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Badge />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **关键术语解释**：
> - **Badge（徽章）**：显示在图标右上角的小标记，常用于显示未读消息数量（如 `9+`）或仅仅是一个小红点（不传入子元素时）。

---

## 导航栏外观配置

由于不同操作系统的视觉呈现方式不同，各平台的配置选项也有所差异。完整的配置选项请查阅官方 API 参考文档。

> **基于文档内容推导**：由于 Native Tabs 直接调用系统原生 UI，导航栏的高度、圆角、模糊效果等均由操作系统决定，开发者只能通过有限的属性进行微调，无法像 JavaScript 版本那样完全自定义。

---

## 高级配置

### 隐藏导航栏

SDK 55 引入了 `hidden` 属性来隐藏整个导航栏，可以结合 React Context 动态切换显示/隐藏状态。

> **关键术语解释**：
> - **React Context**：React 提供的一种跨组件传递数据的机制。在这里用于让子页面能够控制父级布局中的导航栏显示状态。
> - **`useFocusEffect`**：Expo Router 提供的 Hook，当页面获得焦点时执行回调，失去焦点时执行清理函数。类似于 React 的 `useEffect`，但仅在页面可见时触发。

首先，创建一个 Context：

```tsx
import { createContext } from 'react';

export const TabBarContext = createContext<{
  setIsTabBarHidden: (hidden: boolean) => void;
}>({
  setIsTabBarHidden: () => {},
});
```

然后，在布局文件中使用该 Context：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useState } from 'react';

import { TabBarContext } from '@/context/TabBarContext';

export default function TabLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  return (
    <TabBarContext value={{ setIsTabBarHidden }}>
      <NativeTabs hidden={isTabBarHidden}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
```

在子页面中控制导航栏的显隐：

```tsx
import { useFocusEffect } from 'expo-router';
import { use } from 'react';

import { TabBarContext } from '@/context/TabBarContext';

export default function HomeScreen() {
  const { setIsTabBarHidden } = use(TabBarContext);

  useFocusEffect(() => {
    setIsTabBarHidden(true);
    return () => setIsTabBarHidden(false);
  });

  return (
    // 页面内容
  );
}
```

> **基于经验建议**：隐藏导航栏的典型场景包括全屏查看图片/视频、沉浸式阅读模式等。但请确保提供替代的导航方式（如返回按钮或手势），否则用户可能不知道如何离开当前页面。

---

### 条件性隐藏标签项

可以通过 `hidden` 属性或直接移除组件来隐藏个别标签项。

> **警告**：动态隐藏标签项会**重置导航器状态**，被隐藏的标签将完全不可访问。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const shouldHideMessagesTab = true; // 替换为你的条件判断
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="messages" hidden={shouldHideMessagesTab} />
    </NativeTabs>
  );
}
```

---

### 禁用"点击返回顶层"行为（Android）

在 Android 上，点击当前已选中的标签项默认会**弹出到导航栈顶层**（即返回该标签的根页面）。SDK 55 允许通过 `disablePopToTop` 属性禁用此行为。

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disablePopToTop>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disablePopToTop>
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

---

### 禁用"点击滚动到顶部"行为（Android）

在 Android 上，点击当前已选中的标签项默认还会触发**滚动到页面顶部**的操作。SDK 55 允许通过 `disableScrollToTop` 属性禁用此行为。

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disableScrollToTop>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disableScrollToTop>
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

---

### 禁用标签项（Disabled）

SDK 56 新增了 `disabled` 属性，可以阻止用户通过点击来切换到该标签。但**编程式路由跳转**（如 `router.push()`）仍然有效。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" disabled>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

动态禁用示例（例如在处理中时禁用切换）：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { View } from 'react-native';

export default function CheckoutScreen() {
  const isProcessing = useIsProcessing();
  return (
    <View>
      <NativeTabs.Trigger disabled={isProcessing} />
      {/* ... */}
    </View>
  );
}
```

> **基于经验建议**：`disabled` 属性非常适合在用户执行关键操作（如支付处理、表单提交）时临时禁用标签切换，防止用户误操作导致数据丢失。

---

### Apple OS 26 新增功能

Apple OS 26 为 Native Tabs 带来了多项新特性：

#### 搜索标签角色（Search Role）

为标签项指定 `role="search"` 可以将其标记为专用搜索入口。

##### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

##### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### 集成搜索栏

结合 Stack 导航使用搜索栏组件：

搜索标签的布局文件：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

搜索页面的 Stack 布局：

```tsx
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return <Stack />;
}
```

搜索页面中使用搜索栏：

```tsx
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function SearchIndex() {
  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar placement="automatic" placeholder="Search" onChangeText={() => {}} />
      <ScrollView>{/* 页面内容 */}</ScrollView>
    </>
  );
}
```

#### 滚动时最小化导航栏（Minimize Behavior）

通过 `minimizeBehavior="onScrollDown"` 可以让导航栏在用户向下滚动时自动收缩/最小化。

##### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tab-1">
        <NativeTabs.Trigger.Label>Tab 1</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

##### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tab-1">
        <Label>Tab 1</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### 底部附件（Bottom Accessory）

底部附件可以在导航栏上方显示额外的内容，例如迷你播放器。

> **警告**：底部附件组件会同时渲染**两个实例**（分别对应不同的布局位置），因此**必须将状态提升到组件外部管理**。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

function MiniPlayer({ isPlaying, onToggle }) {
  const placement = NativeTabs.BottomAccessory.usePlacement();

  if (placement === 'inline') {
    // 内联位置使用紧凑 UI
    return (
      <Pressable onPress={onToggle} style={styles.inlinePlayer}>
        <Text>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    );
  }

  // 常规位置使用完整 UI
  return (
    <View style={styles.regularPlayer}>
      <Text>Now Playing: Song Title</Text>
      <Pressable onPress={onToggle}>
        <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  // 状态必须存储在 BottomAccessory 外部
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <NativeTabs>
      <NativeTabs.BottomAccessory>
        <MiniPlayer isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} />
      </NativeTabs.BottomAccessory>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = StyleSheet.create({
  inlinePlayer: {
    padding: 8,
  },
  regularPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});
```

> **关键术语解释**：
> - **Bottom Accessory（底部附件）**：显示在标签栏上方的附加 UI 区域，常见于音乐播放器的迷你播放条、购物车摘要等。
> - **`usePlacement()`**：用于检测当前渲染位置是 `inline`（内联/紧凑模式）还是常规模式的 Hook。

---

### Android 键盘避让

导航栏可以配置为在软键盘弹出时自动上移，避免被键盘遮挡。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs tabBarRespectsIMEInsets>
      <NativeTabs.Trigger name="index" />
      <NativeTabs.Trigger name="profile" />
    </NativeTabs>
  );
}
```

> **关键术语解释**：
> - **IME Insets（输入法内边距）**：指软键盘弹出时占用的屏幕空间。`tabBarRespectsIMEInsets` 属性让导航栏自动适应键盘高度，避免被遮挡。

---

### 安全区域管理

SDK 55 自动管理屏幕的安全区域内边距（Content Insets），但可以通过 `disableAutomaticContentInsets` 属性禁用自动管理，改为手动处理。

> **关键术语解释**：
> - **安全区域（Safe Area）**：屏幕上不被系统 UI（如刘海、圆角、底部横条）遮挡的可用区域。
> - **Content Insets（内容内边距）**：系统自动为页面内容添加的内边距，确保内容不会被导航栏或系统 UI 遮挡。

#### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <Label>Home</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

禁用自动管理后，需要手动使用 `SafeAreaView` 处理安全区域：

```tsx
import { SafeAreaView } from 'react-native-screens/experimental';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={{ bottom: true }} style={{ flex: 1 }}>
      {/* 页面内容 */}
    </SafeAreaView>
  );
}
```

---

### 延迟渲染（Deferred Rendering）

由于 Native Tabs 中的标签项会**立即挂载**（eagerly mount），如果某个标签包含渲染成本较高的内容，可以使用焦点 Hook 来实现延迟渲染。

> **关键术语解释**：
> - **Eagerly Mount（立即挂载）**：所有标签页在导航器初始化时就全部渲染到内存中，而不是等用户切换到该标签时才渲染。这样做可以让标签切换更快，但可能浪费资源。
> - **`useIsFocused()`**：Expo Router 提供的 Hook，返回当前页面是否处于焦点（可见）状态的布尔值。
> - **`useFocusEffect()`**：当页面获得焦点时执行副作用的 Hook，可以配合 `useState` 实现"首次聚焦后加载并永久保留"的效果。

**方式一：仅在有焦点时渲染内容**

```tsx
import { useIsFocused } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

export default function SearchScreen() {
  const isFocused = useIsFocused();

  if (!isFocused) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Expensive content that only renders when this tab is focused</Text>
    </View>
  );
}
```

**方式二：首次聚焦后加载并永久保留**

```tsx
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function SearchScreen() {
  const [hasActivated, setHasActivated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setHasActivated(true);
    }, [])
  );

  if (!hasActivated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Content that loads once and stays mounted</Text>
    </View>
  );
}
```

> **基于经验建议**：方式二通常是更好的选择，因为内容一旦加载就不会再卸载，避免了用户在标签间反复切换时的重复加载开销。方式一适合内容需要频繁刷新的场景。

---

### 浏览器端降级方案

浏览器没有原生底部导航栏，因此需要使用 **Headless 组件**（无样式组件）并通过**平台特定文件扩展名**来提供 Web 端的替代实现。

> **关键术语解释**：
> - **Headless 组件**：只提供功能逻辑而不包含预定义样式的组件，开发者需要自行编写 UI。
> - **平台特定文件扩展名**：React Native 支持通过文件后缀（如 `.web.tsx`、`.ios.tsx`、`.android.tsx`）来为不同平台提供不同的实现文件。

Web 端的标签导航实现（使用 `expo-router/ui` 的无样式组件）：

```tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

export default function WebLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          Home
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" style={styles.tab}>
          Settings
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  tab: {
    padding: 8,
  },
});
```

推荐的做法是将导航组件抽取为独立组件，然后通过平台特定文件分别提供实现：

统一布局文件：

```tsx
import AppTabs from '@/components/app-tabs';

export default function Layout() {
  return (
    <ThemeProvider>
      <AppTabs />
    </ThemeProvider>
  );
}
```

原生平台实现（`app-tabs.ios.tsx` / `app-tabs.android.tsx`）：

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

Web 平台实现（`app-tabs.web.tsx`）：

```tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          Home
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" style={styles.tab}>
          Settings
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  tab: {
    padding: 8,
  },
});
```

---

## 从 SDK 54 升级到 SDK 55

从 SDK 54 迁移到 SDK 55 需要进行以下变更：

1. **切换到复合组件结构**：将独立的 `Icon`、`Label`、`Badge` 等导入改为 `NativeTabs.Trigger.Icon`、`NativeTabs.Trigger.Label`、`NativeTabs.Trigger.Badge` 的嵌套写法。
2. **Android 图标改用 Material Symbols**：将 `drawable` 属性替换为 `md` 属性来指定 Material Design 图标。

> **基于经验建议**：升级时建议先在一个标签布局上完成迁移并充分测试，再批量修改其他文件。注意检查所有 SDK 54 中使用的 `drawable` 属性是否已正确替换。

---

## 从 JavaScript 版 Tabs 迁移

> **警告**：Native Tabs **不是** JavaScript 版 Tabs 的直接替代品，迁移时需要注意以下关键差异：

1. 必须使用 **`Trigger`** 组件替代 `Screen` 组件来定义标签项。
2. 使用**组件嵌套组合**（如 `<NativeTabs.Trigger.Icon />`）替代**属性对象**（如 `options={{ tabBarIcon: ... }}`）。
3. 如果需要在标签页中显示标题栏（Header），需要嵌套 Stack 导航器来实现。

> **基于文档内容推导**：由于 Native Tabs 和 JavaScript Tabs 的底层实现完全不同（一个使用系统原生 UI，一个使用 React Native 渲染），它们的 API 设计哲学也不同。Native Tabs 更偏向声明式组件组合，而 JavaScript Tabs 更偏向配置对象。迁移时需要全面重写标签布局代码。

---

## 故障排查

### 旧版 iOS 上导航栏透明问题

在旧版 iOS 系统上，导航栏可能在滚动边缘处呈现不期望的透明效果。可以通过以下两种方式修复：

**方式一：使用属性禁用透明效果**

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

**方式二：确保 ScrollView 是直接子元素**

```tsx
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View collapsable={false} style={{ flex: 1 }}>
      <ScrollView>{/* 页面内容 */}</ScrollView>
    </View>
  );
}
```

> **关键术语解释**：
> - **`collapsable={false}`**：Android 上的一个属性，阻止 React Native 将该 View 从原生视图层级中移除（合并到父视图）。保留该 View 有助于系统正确识别滚动边缘。

---

### OS 26 上导航切换时的白色闪烁

在深色模式下，切换到 OS 26 时可能出现白色闪烁。解决方法是使用 `ThemeProvider` 包裹应用：

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
```

如果应用始终使用深色主题：

```tsx
import { ThemeProvider, DarkTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <NativeTabs>{/* 标签项 */}</NativeTabs>
    </ThemeProvider>
  );
}
```

还可以通过 `contentStyle` 为特定标签设置背景色：

```tsx
<NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: '#1a1a2e' }}>
```

---

### "滚动到顶部"功能失效

点击已选中的标签项时，如果 `ScrollView` 嵌套不正确，可能无法触发滚动到顶部。

**解决方案**：确保 `ScrollView` 是一个带有 `collapsable={false}` 的 `View` 的直接子元素：

```tsx
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View collapsable={false} style={{ flex: 1 }}>
      <ScrollView>{/* 页面内容 */}</ScrollView>
    </View>
  );
}
```

---

### 深色环境下标题栏按钮闪烁

半透明效果的标题栏按钮可能出现闪烁问题。解决方法与上述白色闪烁相同——使用 `ThemeProvider` 包裹组件：

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
```

始终深色主题时：

```tsx
import { ThemeProvider, DarkTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <NativeTabs>{/* 标签项 */}</NativeTabs>
    </ThemeProvider>
  );
}
```

---

## 限制与注意事项

### Android 标签数量上限

Android 平台限制底部导航栏**最多显示 5 个标签项**。超过 5 个将无法正确显示。

### 无法测量导航栏尺寸

由于导航栏在平板或空间计算设备（如 Vision Pro）上可能动态调整位置，因此**无法通过编程方式获取导航栏的精确高度**。

### 禁止嵌套 Native Tabs

**不允许**将一个 Native Tabs 嵌套在另一个 Native Tabs 内部。但是可以在 Native Tabs 内部嵌套 JavaScript 版的标签导航。

> **基于文档内容推导**：这一限制源于系统原生导航组件的设计——操作系统的底部导航栏是全局唯一的 UI 元素，不支持在同一屏幕内叠加多个实例。如果你的设计确实需要多层标签导航，请在内层使用 JavaScript 版 Tabs。

### FlatList 兼容性问题

使用 `FlatList`（而非 `ScrollView`）时存在以下问题：
- 不支持"滚动到顶部"功能
- 不支持导航栏最小化功能
- 可能触发透明效果相关的 Bug

**解决方法**：在 `NativeTabs` 上添加 `disableTransparentOnScrollEdge` 属性。

##### SDK 55 及以上版本

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

##### SDK 54

```tsx
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

> **基于经验建议**：如果你的标签页内容需要使用列表渲染，优先考虑使用 `ScrollView` + `map()` 替代 `FlatList`，以获得完整的 Native Tabs 功能支持。只有在列表数据量非常大、确实需要 `FlatList` 的虚拟化性能优化时，才使用 `FlatList` 并接受上述功能限制。

### 运行时动态修改标签项

**不支持**在运行时动态添加或移除标签项。这样做会导致：
- 违反平台设计规范中关于用户"心智模型"的原则
- 导航状态丢失
- 组件重新挂载

> **关键术语解释**：
> - **心智模型（Mental Model）**：用户对应用界面结构的认知预期。底部导航栏通常被认为是应用的"固定骨架"，用户期望标签项在使用过程中始终存在且位置不变。动态修改会打破这种预期，造成困惑。

> **基于经验建议**：如果需要基于用户权限或登录状态显示不同的标签，建议在应用启动时确定标签配置，而不是在运行时修改。可以使用条件性隐藏（`hidden`）来替代动态增删，但需注意这会重置导航状态。

---

## 文档导航

- **上一页**：[tabs](./58__tabs.md)
- **下一页**：[drawer](./60__drawer.md)
