# 导航与布局（Navigation Layouts）

> 原文地址：https://docs.expo.dev/router/basics/navigation-layouts/

Expo Router 通过文件夹结构和特定的配置文件来构建页面之间的关系。每一个位于主应用目录下的文件夹（包括根目录本身）都可以使用一个特殊的 TypeScript 文件来控制页面的排列方式——决定子页面是采用**堆栈（Stack）**、**标签栏（Tabs）**还是**抽屉（Drawer）**等导航范式。该文件导出的默认组件会在目标页面渲染之前先行渲染，充当页面的"外壳"。

---

## 核心概念速览

> **给初学者的说明**：
> - **布局文件（Layout File）**：命名为 `_layout.tsx` 的特殊文件，用于定义一个文件夹下所有页面的导航结构和公共外壳。
> - **导航器（Navigator）**：负责管理一组页面之间切换逻辑的容器组件，如 `Stack`、`Tabs`、`Drawer` 等。
> - **根布局（Root Layout）**：位于 `app/` 目录顶层的 `_layout.tsx`，是整个应用导航的入口点。
> - **Stack（堆栈导航）**：像一摞卡片一样管理页面——新页面"压入"（push）栈顶，返回时从栈顶"弹出"（pop）。
> - **Tabs（标签导航）**：底部或顶部的标签栏，允许用户在几个平级页面之间快速切换。
> - **Slot（插槽）**：一个无导航器的占位组件，仅负责在当前位置渲染子路由，不添加任何导航行为。
> - **路由组（Route Group）**：用圆括号包裹的文件夹名（如 `(tabs)`），用于逻辑分组而不会影响 URL 路径。

---

## 一、根布局（Root Layout）

几乎所有应用都需要在 `app/` 目录的根级别放置一个布局文件。它充当整个应用的**导航入口点**，负责处理顶层路由和应用初始化任务——例如加载字体、管理启动屏（Splash Screen）、提供全局上下文（Context Provider）等。这些工作通常在其他框架的入口文件（如 `App.tsx`）中完成。

> **给初学者的说明**：
> - **启动屏（Splash Screen）**：应用启动时显示的第一个画面，通常在资源加载完毕前展示。
> - **字体加载（Font Loading）**：在使用自定义字体前，需要先异步加载字体文件，否则文字可能显示异常。
> - **`useFonts` Hook**：Expo 提供的 Hook，用于异步加载自定义字体并返回加载状态。
> - **`SplashScreen.preventAutoHideAsync()`**：阻止启动屏自动隐藏，以便开发者手动控制隐藏时机。

```tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <Stack />;
}
```

**代码解读**：

1. 调用 `SplashScreen.preventAutoHideAsync()` 阻止启动屏自动消失。
2. 使用 `useFonts` 加载自定义字体 `SpaceMono`。
3. 在 `useEffect` 中监听字体加载状态，加载完成后手动隐藏启动屏。
4. 字体未加载完成时返回 `null`（不渲染任何内容）。
5. 字体加载完成后渲染 `<Stack />`，此时应用进入正常的堆栈导航流程，并自动跳转到初始路由。

> **基于文档内容推导**：根布局是整个应用中唯一适合放置全局初始化逻辑的位置，因为它在任何页面渲染之前执行。如果你的应用需要在启动时完成多个异步任务（如加载字体、恢复用户登录状态、初始化分析工具等），都应在此处协调处理。

---

## 二、Stack 导航器（堆栈导航）

Stack 导航可以应用在根级别，也可以应用在任意嵌套的子文件夹中。例如，你可以为"产品目录"文件夹单独设置堆栈导航行为。

### 目录结构示例

```text
src/app/
├── products/
│   ├── _layout.tsx       ← 该文件夹的布局文件
│   ├── index.tsx         ← 默认页面（/products）
│   ├── [productId].tsx   ← 动态路由页面（/products/123）
│   └── accessories/
│       └── index.tsx     ← 子目录页面（/products/accessories）
```

> **给初学者的说明**：
> - **`[productId].tsx`**：动态路由文件，方括号表示该段路径是动态参数。例如 `/products/123` 和 `/products/456` 都会匹配到这个文件。
> - **`index.tsx`**：文件夹的默认页面。当用户访问 `/products` 时，会渲染此文件。

### 基本用法

在 `_layout.tsx` 中返回 `<Stack />` 组件即可将该文件夹下的所有页面组织为堆栈导航：

```tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return <Stack />;
}
```

**行为说明**：
- 导航到该文件夹的根路径时，加载 `index.tsx` 作为默认页面。
- 导航到具体的动态路由（如 `/products/123`）时，新页面会被**压入**栈中。
- 头部栏（Header）会自动显示返回按钮，点击后**弹出**当前页面、回到上一页。
- 已被压入栈但不在栈顶的页面**仍然保持渲染状态**（不会被销毁）。

> **给初学者的说明**：
> - **底层实现**：Expo Router 的 `<Stack />` 基于 React Navigation 的原生堆栈（Native Stack），使用平台原生的导航能力，性能优于纯 JavaScript 实现。
> - **路由自动映射**：你无需手动注册每个页面对应的组件——Expo Router 会自动将文件夹中的文件映射为路由。

### 自定义页面选项

可以通过 `<Stack.Screen>` 子组件来配置特定页面的导航选项（如隐藏头部栏），而无需手动传递页面组件本身：

```tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
    </Stack>
  );
}
```

> **给初学者的说明**：
> - **`name` 属性**：对应文件夹中的文件名（不含扩展名）。例如 `name="[productId]"` 对应 `[productId].tsx` 文件。
> - **`options`**：传递给该页面的配置对象。`headerShown: false` 表示隐藏该页面的头部栏。
> - **为什么不需要传 `component`？** 因为 Expo Router 会自动根据文件名找到对应的页面组件，你只需在 `<Stack.Screen>` 中指定 `name` 和需要覆盖的 `options` 即可。

### 关于嵌套导航器的警告

> **注意**：避免不必要的嵌套。如果子文件夹中的布局文件仅仅是为了影响 URL 结构，而不需要独立的导航行为（如独立的堆栈历史），则不要在子文件夹中创建冗余的 Stack 配置——应依赖父级导航器来管理。只有当你确实需要一个**独立的嵌套堆栈**（例如子文件夹内的页面有自己独立的推送/弹出历史）时，才应在子文件夹中创建新的 Stack 布局。

> **基于经验建议**：新手常犯的一个错误是为每个子文件夹都创建 `_layout.tsx` 并返回 `<Stack />`，认为这样"更规范"。实际上，这样做会导致多层嵌套的堆栈导航，使得返回按钮的行为变得不可预期。如果你的子文件夹只是需要在 URL 中有独立的路径段，完全可以省略子文件夹的 `_layout.tsx`，让父级 Stack 统一管理。

---

## 三、Tabs 导航器（标签导航）

Expo Router 提供了多种方式来实现标签栏界面。下面分别介绍三种方案。

### 3.1 JavaScript 实现（`<Tabs />`）

使用 `<Tabs />` 组件将其直接子路由作为标签页来呈现。它基于 React Navigation 的原生底部标签栏（Bottom Tabs）实现。

#### 目录结构

```text
src/app/(tabs)/
├── _layout.tsx     ← 标签栏布局文件
├── index.tsx       ← 默认标签页（Home）
├── feed.tsx        ← Feed 标签页
└── profile.tsx     ← Profile 标签页
```

> **给初学者的说明**：
> - **路由组 `(tabs)`**：文件夹名用圆括号包裹，表示这是一个**路由组**。路由组不会影响 URL 路径——`(tabs)/index.tsx` 的 URL 仍然是 `/`，而不是 `/tabs`。路由组的主要作用是为这组页面指定一个共享的布局文件。

#### 代码示例

```tsx
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

**行为说明**：
- `<Tabs.Screen>` 的定义顺序决定了标签栏中各标签的**排列顺序**。
- `title` 属性设置标签的显示文字。
- `tabBarIcon` 属性接受一个函数，返回标签图标组件。`color` 参数由导航器自动传入，表示当前标签的着色（选中/未选中状态颜色不同）。
- `index` 路由作为默认选中的标签页。

> **基于经验建议**：`<Tabs />` 是最常用的标签栏实现方式，适合绝大多数场景。它提供了丰富的自定义选项（如 `tabBarActiveTintColor`、`tabBarStyle` 等），且跨平台表现一致。如果你是初学者，建议先掌握这种方式，再根据需要考虑下面的原生实现。

### 3.2 原生实现（`<NativeTabs />`）

在移动端（iOS 和 Android）上，可以使用平台内置的标签栏组件，获得原生级别的交互体验——例如点击标签时自动滚动到顶部、原生过渡动画等。

> **给初学者的说明**：
> - **`unstable-` 前缀**：表示该 API 尚处于实验阶段，接口可能在未来版本中发生变化。在生产环境中使用时需注意版本兼容性。
> - **`NativeTabs.Trigger`**：原生标签栏中的每一个标签项。与 `<Tabs.Screen>` 不同，它使用子组件（而非 `options` 对象）来配置标签的文字和图标。

#### 目录结构

```text
src/app/(tabs)/
├── _layout.tsx
├── index.tsx
├── feed.tsx
└── profile.tsx
```

#### 代码示例

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/home.png')} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/feed.png')} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/profile.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

**API 说明**：

| 组件 | 作用 |
|------|------|
| `<NativeTabs>` | 原生标签栏容器 |
| `<NativeTabs.Trigger>` | 单个标签项，`name` 属性对应路由文件名 |
| `<NativeTabs.Trigger.Label>` | 标签文字 |
| `<NativeTabs.Trigger.Icon>` | 标签图标，`src` 属性接受图片资源 |

> **基于经验建议**：`NativeTabs` 的优势在于使用平台原生组件渲染标签栏，交互体验更贴近原生应用。但因为它带有 `unstable-` 前缀，建议在重要项目中谨慎评估后再使用。如果你的应用只需要在移动端运行（不需要 Web 支持），且追求最贴近原生的体验，可以考虑此方案。

### 3.3 跨平台实现（平台特定文件）

在实际开发中，通常需要为移动端和 Web 端提供不同版本的标签栏。Expo Router 支持利用**平台特定文件扩展名**来实现自动分流——打包工具会根据当前目标平台自动选择正确的文件。

#### 目录结构

```text
src/
├── app/
│   ├── _layout.tsx          ← 根布局，导入共享组件
│   ├── index.tsx
│   └── explore.tsx
└── components/
    ├── app-tabs.native.tsx  ← 移动端原生标签栏（.native.tsx）
    └── app-tabs.tsx         ← Web 端自定义标签栏（.tsx）
```

> **给初学者的说明**：
> - **`.native.tsx` 扩展名**：Metro 打包工具在编译移动端应用时，会优先选择 `.native.tsx` 文件；在编译 Web 端时，则选择普通的 `.tsx` 文件。这种机制称为**平台特定扩展名**（Platform-Specific Extensions）。
> - 同一组件名（如 `app-tabs`）在不同平台文件中可以有不同的实现，但对外暴露的接口保持一致。

#### 根布局文件（`_layout.tsx`）

导入并使用共享组件，无需关心当前平台：

```tsx
import AppTabs from '@/components/app-tabs';

export default function RootLayout() {
  return <AppTabs />;
}
```

#### 移动端实现（`app-tabs.native.tsx`）

使用内置的原生标签栏组件：

```tsx
import { NativeTabs } from 'expo-router/native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/home.png')} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

#### Web 端实现（`app-tabs.tsx`）

使用灵活的无样式组件，允许完全自定义 UI：

```tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="index" href="/">
          Home
        </TabTrigger>
        <TabTrigger name="explore" href="/explore">
          Explore
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
```

> **给初学者的说明**：
> - **`expo-router/ui`**：Expo Router 提供的无样式（unstyled）UI 原语组件。它们只提供导航逻辑，不包含任何视觉样式，让开发者可以根据需要完全自定义外观。
> - **`<TabSlot />`**：标签页内容的渲染区域，类似于 `<Slot />`，用于在标签栏布局中显示当前选中的标签页内容。
> - **`<TabList />`**：标签列表容器，包裹所有 `<TabTrigger />`。
> - **`<TabTrigger />`**：单个标签触发器，`name` 用于标识标签，`href` 指定点击后导航的目标路径。

> **基于经验建议**：跨平台实现是生产项目中最推荐的方式。移动端使用 `NativeTabs` 获得原生体验，Web 端使用 `expo-router/ui` 的无样式组件进行完全自定义。虽然代码量稍多，但每个平台都能获得最佳的用户体验。注意 Web 端的 `<TabTrigger>` 需要显式提供 `href` 属性，而移动端的 `<NativeTabs.Trigger>` 通过 `name` 自动关联路由。

---

## 四、Slot 组件（无导航器布局）

当你不需要标准的导航器（如 Stack 或 Tabs）时，可以使用 `<Slot />` 组件。它是一个**占位符**，仅负责在当前位置渲染匹配到的子路由页面，而不会添加任何导航行为。

**典型使用场景**：
- 在页面周围包裹持久性的公共 UI 元素（如固定的头部栏、底部栏）
- 显示模态框（Modal）
- 子路由直接替换当前视图，而不是压入历史栈

#### 目录结构

```text
src/app/social/
├── _layout.tsx     ← 使用 Slot 的布局文件
├── index.tsx       ← 默认页面
├── feed.tsx        ← Feed 页面
└── profile.tsx     ← Profile 页面
```

#### 代码示例

```tsx
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  );
}
```

> **给初学者的说明**：
> - **`<Slot />`**：来自 Expo Router 的占位组件，作用是在布局文件中指定"子路由应该渲染在这里"。它不创建导航栈、不显示头部栏、不提供标签——只是一个纯粹的渲染位置标记。
> - **`<>...</>`（Fragment）**：React 的片段语法，用于在不添加额外 DOM 节点的情况下包裹多个子元素。
> - **`<Header />` 和 `<Footer />`**：自定义组件，代表页面中固定不变的公共部分。

**行为说明**：
- 当用户在 `/social`、`/social/feed`、`/social/profile` 之间导航时，`<Header />` 和 `<Footer />` 始终保持不变。
- `<Slot />` 的位置会被当前匹配的子路由页面替换。
- 与 Stack 不同，页面切换时**不会**有推入/弹出的动画效果——而是直接替换。

> **基于文档内容推导**：`<Slot />` 本质上是一个"透传"组件。当你的布局只需要提供公共 UI 外壳而不需要管理页面间的导航历史时，它是最佳选择。它也常被用在嵌套路由场景中——例如在外层布局中使用 `<Slot />` 来渲染内层的导航器。

> **基于经验建议**：`<Slot />` 的一个常见用法是在根布局中结合全局 UI 组件使用，例如在应用顶部显示一个全局通知栏，或在底部显示一个全局播放控制器。由于 `<Slot />` 不添加任何导航行为，这些公共组件在页面切换时不会重新渲染，从而避免了闪烁和不必要的性能开销。

---

## 五、其他布局类型

除了上述四种主要的布局方式外，Expo Router 还支持以下导航模式：

| 布局类型 | 说明 |
|----------|------|
| **Drawer（抽屉导航）** | 从屏幕边缘滑出的侧边栏菜单，适合放置导航链接 |
| **自定义标签栏** | 完全自定义的标签栏 UI，不受内置组件的限制 |
| **透明模态框** | 覆盖在父页面之上的透明弹窗，父页面内容仍然可见 |
| **第三方导航器** | 集成任何兼容 React Navigation 的导航器，如底部弹出面板（Bottom Sheet）、顶部标签栏（Top Tabs）等 |

> **基于文档内容推导**：Expo Router 的布局系统本质上是对 React Navigation 的封装。任何符合 React Navigation 导航器接口的第三方组件，理论上都可以集成到 Expo Router 的 `_layout.tsx` 体系中使用。

---

## 六、布局方案对比总结

| 方案 | 组件 | 适用场景 | 页面切换行为 | 平台支持 |
|------|------|----------|--------------|----------|
| Stack | `<Stack />` | 线性页面流、详情页跳转 | 压入/弹出栈，带动画 | 全平台 |
| Tabs（JS） | `<Tabs />` | 平级页面快速切换 | 标签切换，各标签页保持状态 | 全平台 |
| NativeTabs | `<NativeTabs />` | 追求原生体验的移动端标签栏 | 原生标签切换 | iOS / Android |
| 跨平台 Tabs | `.native.tsx` + `.tsx` | 需要为不同平台提供不同标签栏实现 | 平台各自的最优体验 | 全平台（分文件） |
| Slot | `<Slot />` | 无导航器场景、公共 UI 外壳 | 直接替换，无动画 | 全平台 |

---

## 文档导航

- **上一页**：[notation](./53__notation.md)
- **下一页**：[navigation](./55__navigation.md)
