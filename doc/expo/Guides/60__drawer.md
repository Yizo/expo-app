# Drawer（抽屉式导航）

> 原始文档地址：[https://docs.expo.dev/router/advanced/drawer](https://docs.expo.dev/router/advanced/drawer)

---

## 概述

导航抽屉（Navigation Drawer）是移动应用中的一种常见 UI 模式。它允许用户从屏幕一侧**滑动打开一个菜单**，以展示各种导航选项（如页面跳转链接、设置入口等）。这个菜单通常也可以通过应用**头部（Header）中的按钮**来切换开关状态。

> **术语解释**：
> - **Drawer（抽屉）**：从屏幕边缘滑出的侧边栏菜单，类似于现实中拉开抽屉的动作。
> - **Navigation（导航）**：应用中不同页面/屏幕之间的跳转机制。
> - **Layout（布局）**：在 Expo Router 中，`_layout.tsx` 文件定义了页面的整体结构和导航方式。
> - **Swipe（滑动）**：用手指在屏幕上快速拖拽的手势操作。

在 Expo Router 中，`Drawer` 组件来自 `expo-router/drawer` 模块，底层使用了 [`react-native-drawer-layout`](https://www.npmjs.com/package/react-native-drawer-layout) 库来实现抽屉导航功能。

---

## 安装依赖

所需安装的依赖包取决于你使用的 **Expo SDK 版本**。不同版本对抽屉导航器的集成方式有所不同。

> **术语解释**：
> - **SDK（Software Development Kit）**：软件开发工具包，这里指 Expo 的版本。每个 SDK 版本包含不同版本的库和工具。
> - **react-native-reanimated**：一个高性能的 React Native 动画库，使用原生线程驱动动画，避免 JS 线程阻塞。
> - **react-native-worklets**：Reanimated 的辅助库，用于在 UI 线程上执行 JavaScript 工作函数（worklet）。
> - **react-native-gesture-handler**：提供原生手势识别支持的库，处理滑动、拖拽等触摸交互。
> - **@react-navigation/drawer**：React Navigation 官方提供的抽屉导航器组件包（SDK 56 之前需要单独安装）。

### SDK 56 及以上版本

在 **SDK 56 及更高版本**中，抽屉导航器已经**内置在 `expo-router` 包中**，底层使用 [`react-native-drawer-layout`](https://www.npmjs.com/package/react-native-drawer-layout)。

在 **Android 和 iOS** 平台上，抽屉导航需要 `react-native-reanimated` 和 `react-native-worklets` 来驱动动画。在 **Web** 端，动画通过 CSS 处理，无需原生动画库。

```sh
# npm
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler

# yarn
yarn expo install react-native-reanimated react-native-worklets react-native-gesture-handler

# pnpm
pnpm expo install react-native-reanimated react-native-worklets react-native-gesture-handler

# bun
bun expo install react-native-reanimated react-native-worklets react-native-gesture-handler
```

> **基于经验建议**：SDK 56 不再需要单独安装 `@react-navigation/drawer`，这是相比之前版本的一个重要简化。如果你从旧版本升级，可以移除该依赖。

### SDK 54 和 55

这两个版本需要**额外安装 `@react-navigation/drawer`** 包，同时搭配动画和手势库：

```sh
# npm
npx expo install @react-navigation/drawer react-native-reanimated react-native-worklets react-native-gesture-handler

# yarn
yarn expo install @react-navigation/drawer react-native-reanimated react-native-worklets react-native-gesture-handler

# pnpm
pnpm expo install @react-navigation/drawer react-native-reanimated react-native-worklets react-native-gesture-handler

# bun
bun expo install @react-navigation/drawer react-native-reanimated react-native-worklets react-native-gesture-handler
```

### SDK 53 及更早版本

旧版本的安装方式类似，但**不需要 `react-native-worklets` 包**：

```sh
# npm
npx expo install @react-navigation/drawer react-native-reanimated react-native-gesture-handler

# yarn
yarn expo install @react-navigation/drawer react-native-reanimated react-native-gesture-handler

# pnpm
pnpm expo install @react-navigation/drawer react-native-reanimated react-native-gesture-handler

# bun
bun expo install @react-navigation/drawer react-native-reanimated react-native-gesture-handler
```

> **注意**：安装完成后，如果是 iOS 项目，记得运行 `npx pod-install` 或 `cd ios && pod install` 来安装原生依赖。同时确保 Babel 配置中包含 `react-native-reanimated/plugin` 插件。

---

## 基本使用

### 最简单的抽屉布局

在 `_layout.tsx` 文件中导入 `Drawer` 组件并返回它，即可创建一个抽屉导航器：

```tsx
// 文件路径: src/app/_layout.tsx
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return <Drawer />;
}
```

> **术语解释**：
> - **`_layout.tsx`**：Expo Router 中的特殊文件，用于定义导航布局。放在 `app/` 目录下时，它会影响该目录下所有页面的导航结构。
> - **`export default function`**：React 组件的标准导出方式，Expo Router 会自动识别并使用这个组件。

> **基于经验建议**：即使只写 `<Drawer />` 这样简单的形式，Expo Router 也会自动扫描 `app/` 目录下的所有页面文件，并将它们注册为抽屉导航中的菜单项。菜单项的名称默认就是文件名。

---

### 自定义屏幕选项

你可以通过嵌套 `Drawer.Screen` 组件来为特定路由自定义**菜单标签（drawerLabel）**、**页面标题（title）**和其他屏幕选项。

> **术语解释**：
> - **`Drawer.Screen`**：用于配置单个抽屉导航菜单项的组件。
> - **`name` 属性**：指定路由路径名称，必须与 `app/` 目录下的文件路径匹配（从根目录开始计算）。
> - **`options` 属性**：一个配置对象，用于设置该屏幕的显示选项。
> - **`drawerLabel`**：在抽屉菜单中显示的文字标签。
> - **`title`**：页面头部（Header）显示的标题文字。

```tsx
// 文件路径: src/app/_layout.tsx
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index" // 这是页面名称，必须匹配从根目录开始的 URL 路径
        options={{
          drawerLabel: 'Home',   // 抽屉菜单中显示的文字
          title: 'overview',     // 页面头部标题
        }}
      />
      <Drawer.Screen
        name="user/[id]" // 动态路由，匹配 app/user/[id].tsx 文件
        options={{
          drawerLabel: 'User',
          title: 'overview',
        }}
      />
    </Drawer>
  );
}
```

> **术语解释**：
> - **动态路由 `[id]`**：方括号包裹的参数表示动态路由段。例如 `user/[id]` 匹配 `app/user/[id].tsx`，其中 `[id]` 可以是任意值（如 `user/1`、`user/abc`）。
> - **`index`**：特殊的默认路由名称，对应目录下的 `index.tsx` 文件，即访问该目录根路径时加载的页面。

> **基于经验建议**：`name` 属性中的路径是**相对于当前 `_layout.tsx` 所在目录**的。如果布局文件在 `app/_layout.tsx`，那么 `name="index"` 对应 `app/index.tsx`，`name="user/[id]"` 对应 `app/user/[id].tsx`。

---

## 进阶配置

> **基于文档内容推导**：以下内容基于 Expo Router 底层使用的 React Navigation Drawer Navigator 文档，这些配置选项在 Expo Router 的 `Drawer` 组件中同样适用。

### 导航器级别属性（Navigator Props）

这些属性应用在 `Drawer` 组件本身上，影响整个抽屉导航的行为：

| 属性 | 类型 | 说明 |
|------|------|------|
| `backBehavior` | `string` | 硬件返回按钮的行为。可选值：`"firstRoute"`（回到第一个路由）、`"initialRoute"`（回到初始路由）、`"order"`（按顺序回退）、`"history"`（按历史记录回退）、`"none"`（不处理） |
| `defaultStatus` | `"open" \| "closed"` | 抽屉的初始状态。如果设为 `"open"`，则在向后导航时会重新打开抽屉 |
| `detachInactiveScreens` | `boolean` | 是否从原生视图层级中移除不活跃的屏幕以优化内存使用，默认为 `true` |
| `drawerContent` | `function` | 自定义抽屉侧边栏的内容渲染函数，接收 `state`、`navigation` 和 `descriptors` 作为参数 |

### 屏幕选项（Screen Options）

通过 `screenOptions` 属性全局设置，或通过 `Drawer.Screen` 的 `options` 属性为单个屏幕单独设置：

| 选项 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 作为头部标题和抽屉标签的后备文字 |
| `drawerLabel` | `string \| ReactNode \| function` | 抽屉菜单中显示的标签文字或自定义组件 |
| `drawerIcon` | `function` | 返回抽屉菜单图标的函数 |
| `drawerActiveTintColor` | `string` | 选中状态下的文字和图标颜色 |
| `drawerInactiveTintColor` | `string` | 未选中状态下的文字和图标颜色 |
| `drawerActiveBackgroundColor` | `string` | 选中状态下的背景色 |
| `drawerInactiveBackgroundColor` | `string` | 未选中状态下的背景色 |
| `drawerItemStyle` | `ViewStyle` | 菜单项容器的样式 |
| `drawerLabelStyle` | `TextStyle` | 菜单标签文字的样式 |
| `drawerContentContainerStyle` | `ViewStyle` | 抽屉内容滚动区域的样式 |
| `drawerContentStyle` | `ViewStyle` | 抽屉外层容器的样式 |
| `drawerStyle` | `ViewStyle` | 抽屉侧边栏本身的样式（可设置宽度、背景色等） |
| `drawerPosition` | `"left" \| "right"` | 抽屉出现的方向，`"left"` 为左侧，`"right"` 为右侧（会根据语言方向自动适配） |
| `drawerType` | `"front" \| "back" \| "slide" \| "permanent"` | 抽屉的动画类型（详见下方说明） |
| `drawerHideStatusBarOnOpen` | `boolean` | 抽屉打开时是否隐藏系统状态栏 |
| `drawerStatusBarAnimation` | `"slide" \| "fade" \| "none"` | iOS 上状态栏的动画效果 |
| `overlayColor` | `string` | 抽屉打开时，主内容上方的遮罩层颜色 |
| `sceneStyle` | `ViewStyle` | 屏幕内容的包装样式 |
| `swipeEnabled` | `boolean` | 是否允许滑动打开抽屉（Web 端不支持） |
| `swipeEdgeWidth` | `number` | 从屏幕边缘多远距离内可以触发滑动打开 |
| `swipeMinDistance` | `number` | 触发抽屉打开所需的最小滑动距离 |
| `keyboardDismissMode` | `"on-drag" \| "none"` | 拖拽抽屉时是否收起键盘 |
| `headerShown` | `boolean` | 是否显示头部 |
| `header` | `function` | 自定义头部组件 |
| `lazy` | `boolean` | 是否延迟渲染屏幕直到首次访问 |
| `freezeOnBlur` | `boolean` | 失去焦点时是否停止非活跃屏幕的重新渲染 |
| `popToTopOnBlur` | `boolean` | 离开屏幕时是否重置嵌套的堆栈导航 |

#### drawerType 动画类型详解

| 类型 | 说明 |
|------|------|
| `"front"` | 抽屉从屏幕前方滑出，覆盖在主内容上方（默认行为，适合大多数场景） |
| `"back"` | 主内容向前滑动，露出后方的抽屉菜单 |
| `"slide"` | 抽屉和主内容同时滑动，如同抽屉推动主内容一起移动 |
| `"permanent"` | 抽屉始终可见，不关闭，适合大屏幕设备（如平板）的永久侧边栏 |

> **基于经验建议**：在大屏设备上使用 `"permanent"` 类型可以提供类似桌面应用的体验。配合 `useWindowDimensions()` 可以根据屏幕宽度动态切换抽屉类型：
>
> ```tsx
> import { useWindowDimensions } from 'react-native';
>
> export default function Layout() {
>   const dimensions = useWindowDimensions();
>   const drawerType = dimensions.width > 767 ? 'permanent' : 'front';
>
>   return (
>     <Drawer screenOptions={{ drawerType }}>
>       {/* ... */}
>     </Drawer>
>   );
> }
> ```

---

### 自定义抽屉内容（Custom Drawer Content）

默认情况下，抽屉显示一个可滚动的菜单项列表。你可以通过 `drawerContent` 属性完全自定义侧边栏的内容。

使用 React Navigation 提供的 `DrawerContentScrollView`、`DrawerItemList` 和 `DrawerItem` 组件，可以在保留默认行为（如安全区域适配）的同时添加自定义内容：

```tsx
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Linking } from 'react-native';

// 自定义抽屉内容组件
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* 渲染默认的菜单项列表 */}
      <DrawerItemList {...props} />
      {/* 添加自定义菜单项 */}
      <DrawerItem
        label="帮助中心"
        onPress={() => Linking.openURL('https://example.com/help')}
      />
    </DrawerContentScrollView>
  );
}

export default function Layout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
    >
      {/* 屏幕配置... */}
    </Drawer>
  );
}
```

> **术语解释**：
> - **`DrawerContentScrollView`**：一个带安全区域适配的滚动容器，用于包裹抽屉内容。
> - **`DrawerItemList`**：渲染所有已注册路由的默认菜单项列表。
> - **`DrawerItem`**：单个菜单项组件，可自定义标签、图标和点击行为。

> **注意**：在自定义抽屉内容中，React Navigation 的导航 Hooks（如 `useNavigation`）**不可用**。你需要使用传递给 `drawerContent` 函数的 `navigation` 参数来执行导航操作。

> **基于经验建议**：自定义抽屉内容非常适合以下场景：
> - 在菜单顶部添加用户头像和登录信息
> - 添加分组标题和分隔线
> - 在菜单底部添加退出登录按钮
> - 集成外部链接（如跳转到网页）

---

### 编程式控制抽屉

你可以通过导航对象提供的方法来程序化地控制抽屉的开关：

| 方法 | 说明 |
|------|------|
| `openDrawer()` | 打开抽屉 |
| `closeDrawer()` | 关闭抽屉 |
| `toggleDrawer()` | 切换抽屉的开关状态 |
| `jumpTo(name, params)` | 跳转到指定路由，可附带参数 |

```tsx
import { useNavigation } from 'expo-router';
import { Button } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Button
      title="打开菜单"
      onPress={() => navigation.openDrawer()}
    />
  );
}
```

> **基于经验建议**：通常在页面的头部（Header）放置一个"汉堡菜单"按钮来调用 `toggleDrawer()`，这是最常见的用户交互模式。Expo Router 默认会在头部左侧自动添加一个菜单按钮。

---

### 相关 Hooks（钩子函数）

以下 React Hooks 可在抽屉导航的上下文中使用：

| Hook | 返回值 | 说明 |
|------|--------|------|
| `useDrawerProgress()` | `SharedValue<number>` | 返回抽屉的打开进度值（0 到 1），可用于驱动动画过渡效果。Web 端返回模拟值 |
| `useDrawerStatus()` | `"open" \| "closed"` | 返回抽屉当前的开关状态 |

```tsx
import { useDrawerProgress } from 'expo-router/drawer';
import { useAnimatedStyle } from 'react-native-reanimated';

export default function AnimatedScreen() {
  const progress = useDrawerProgress();

  // 根据抽屉打开进度来平移主内容
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * -80 }],
  }));

  // ...将 animatedStyle 应用到 Animated.View 上
}
```

> **术语解释**：
> - **Hook（钩子）**：React 中用于在函数组件中使用状态和副作用的特殊函数，必须以 `use` 开头命名。
> - **SharedValue**：Reanimated 库中的共享值类型，可在 UI 线程上被多个组件读取和驱动动画。
> - **AnimatedStyle**：Reanimated 提供的动画样式，当依赖的共享值变化时自动更新视图的样式。

---

### 事件监听

`drawerItemPress` 事件在用户点击抽屉菜单项时触发。默认行为是聚焦到对应屏幕或关闭抽屉。你可以调用 `preventDefault()` 来覆盖默认逻辑：

```tsx
<Drawer
  screenListeners={{
    drawerItemPress: (e) => {
      // 阻止默认导航行为
      e.preventDefault();
      // 执行自定义逻辑，如权限检查、弹窗确认等
    },
  }}
>
  {/* ... */}
</Drawer>
```

---

### 嵌套行为

当抽屉导航器被嵌套在 Tab（标签页）或 Stack（堆栈）导航器内部时，抽屉会渲染在这些导航器的 UI 元素**下方**。如果你希望抽屉**覆盖**这些元素，应该将抽屉导航器作为**父级**导航器使用。

> **基于文档内容推导**：这意味着推荐的布局层级是将 Drawer 放在最顶层的 `_layout.tsx` 中，让 Tab 和 Stack 作为 Drawer 的子页面。例如：
>
> ```
> app/
> ├── _layout.tsx          ← Drawer 布局（最顶层）
> ├── (tabs)/
> │   ├── _layout.tsx      ← Tabs 布局（嵌套在 Drawer 内）
> │   ├── home.tsx
> │   └── profile.tsx
> └── settings.tsx
> ```

---

## 完整示例

以下是一个整合了多种配置选项的完整示例：

```tsx
// 文件路径: src/app/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';

export default function Layout() {
  const dimensions = useWindowDimensions();

  return (
    <Drawer
      screenOptions={{
        drawerPosition: 'left',           // 抽屉从左侧滑出
        drawerType: dimensions.width > 767 ? 'permanent' : 'front', // 大屏固定侧边栏
        drawerStyle: {
          width: 280,                      // 抽屉宽度
          backgroundColor: '#f5f5f5',     // 抽屉背景色
        },
        drawerActiveTintColor: '#1a73e8',       // 选中项的文字/图标颜色
        drawerInactiveTintColor: '#333333',     // 未选中项的文字/图标颜色
        drawerActiveBackgroundColor: '#e8f0fe', // 选中项的背景色
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',    // 遮罩层颜色
        swipeEdgeWidth: 50,                      // 滑动触发区域宽度
        headerShown: true,                       // 显示头部
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: '首页',
          title: '首页',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: '个人资料',
          title: '个人资料',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: '设置',
          title: '设置',
        }}
      />
    </Drawer>
  );
}
```

---

## 常见问题与注意事项

> **基于经验建议**：

1. **安装依赖后务必重启开发服务器**：安装 `react-native-reanimated` 等原生库后，需要重新构建原生代码（`npx expo run:ios` 或 `npx expo run:android`），仅重启 Metro 是不够的。

2. **Babel 配置**：如果使用 `react-native-reanimated`，确保 `babel.config.js` 中包含 `'react-native-reanimated/plugin'` 插件，且该插件必须在所有插件的**最后位置**。

3. **Web 端限制**：`swipeEnabled` 在 Web 端不受支持，Web 环境的抽屉动画通过 CSS 处理。如果需要在 Web 端打开抽屉，应通过编程式方法（如 `toggleDrawer()`）或头部按钮触发。

4. **动态路由的 name 匹配**：`Drawer.Screen` 的 `name` 属性必须精确匹配文件路径。例如，`app/user/[id].tsx` 对应 `name="user/[id]"`，而非 `name="user"`。

5. **未声明的页面仍会出现在抽屉中**：即使你没有为某个页面显式添加 `Drawer.Screen`，Expo Router 也会自动将其注册到抽屉菜单中（使用文件名作为标签）。如果不想让某个页面出现在抽屉中，可以使用 `options={{ drawerItemStyle: { display: 'none' } }}` 来隐藏它。

6. **抽屉宽度**：默认的抽屉宽度由 `react-native-drawer-layout` 内部计算。如果需要自定义，通过 `drawerStyle.width` 设置。

---

## 文档导航

- **上一页**：[native tabs](./59__native-tabs.md)
- **下一页**：[authentication](./61__authentication.md)
