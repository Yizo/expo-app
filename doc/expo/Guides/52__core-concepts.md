# Expo Router 文件路由的核心概念

> 原文地址：https://docs.expo.dev/router/basics/core-concepts/

---

## 概述

在构建导航树之前，开发者需要掌握 Expo Router 基于文件的路由系统与传统 React Native 项目之间的根本区别。本文档将介绍七条核心准则——它们是理解 Expo Router 一切行为的基石。

**关键术语说明（面向初学者）：**

- **基于文件的路由（File-based Routing）**：一种路由范式，其中文件系统中的每个文件自动对应一个可访问的页面路由，无需手动注册。
- **路由（Route）**：页面在 URL 中的路径标识，例如 `/` 或 `/profile/friends`。
- **布局文件（Layout File）**：以 `_layout` 命名的特殊文件，用于定义一组页面的导航结构（如堆栈或选项卡），它本身不生成独立的 URL。
- **深度链接（Deep Linking）**：通过 URL 直接打开应用内部的某个特定页面，而不是先启动首页再跳转。
- **入口路由（Initial Route）**：应用启动时首先加载的页面。
- **根布局（Root Layout）**：位于 `src/app/` 根目录下的 `_layout.tsx`，它是整个应用最先执行的布局文件，负责全局初始化。

---

## 七条核心准则

### 1. 所有屏幕/页面都是 `src/app` 目录中的文件

每一个可导航的屏幕（screen）都定义在 `src/app` 目录下。每个文件的**默认导出（default export）**就是一个独立的页面。特殊文件（如 `_layout`）除外——它们用于定义导航结构而非页面本身。子目录用于对相关页面进行分组。

**目录示例：**

```
src/
├── app/
│   ├── index.tsx        ← 根页面，对应 URL "/"
│   ├── home.tsx         ← 对应 URL "/home"
│   ├── _layout.tsx      ← 根布局文件（不产生 URL）
│   └── profile/
│       └── friends.tsx  ← 对应 URL "/profile/friends"
└── components/
    └── ...
```

> **给初学者的说明**：
> - **默认导出（Default Export）**：在 JavaScript/TypeScript 模块中，用 `export default` 导出的内容。Expo Router 通过读取每个文件的默认导出来创建页面组件。
> - **`index.tsx`**：当一个目录中存在 `index` 文件时，它代表该目录的"默认页面"。例如 `src/app/index.tsx` 对应根路径 `/`，`src/app/profile/index.tsx` 对应 `/profile`。

> **基于经验建议**：保持 `src/app` 目录的结构清晰简洁。不要在其中放置任何非路由文件——否则 Expo Router 会错误地将它们视为可导航页面（详见第 6 条准则）。

---

### 2. 所有页面都拥有 URL

每个页面都自动拥有一个与其文件路径对应的 URL。这使得**深度链接**在所有平台上开箱即用：

| 平台 | URL 格式 |
|------|----------|
| Web | 浏览器地址栏 URL，如 `yourapp.com/home` |
| 原生移动端 | 自定义协议 URL，如 `yourapp://home` |

**路径映射关系：**

| 文件路径 | 对应 URL |
|----------|----------|
| `src/app/index.tsx` | `/` |
| `src/app/home.tsx` | `/home` |
| `src/app/profile/friends.tsx` | `/profile/friends` |

> **给初学者的说明**：
> - **深度链接（Deep Linking）**：用户点击一个链接（比如邮件中的"查看好友列表"），可以直接打开应用内 `/profile/friends` 页面，而不需要先启动应用首页再手动跳转。这在 Web 和原生平台上都能正常工作。
> - **URL 路径（URL Path）**：URL 中域名之后的部分，如 `/profile/friends`。Expo Router 自动将文件目录结构映射为 URL 路径。

> **基于文档内容推导**：这意味着你无需手动配置路由表——只要文件放在 `src/app` 目录下，对应的 URL 就自动生成。这在大型项目中可以显著减少路由配置的维护成本。

---

### 3. 第一个 `index.tsx` 是初始路由

框架会自动选择与根 URL (`/`) 匹配的第一个 `index` 文件作为应用的**起始屏幕**。

如果你想在不影响 URL 的情况下从更深层级的路由开始，可以使用**带括号的路由分组（parenthesized route groups）**：

```
src/app/(tabs)/index.tsx
```

此时，`src/app/(tabs)/index.tsx` 会作为初始页面加载，URL 仍然是 `/`。

> **给初学者的说明**：
> - **路由分组（Route Group）**：用括号 `()` 包裹的目录名称。括号中的名称不会出现在 URL 路径中，仅用于在文件系统层面组织代码。例如 `(tabs)` 目录下的文件，其 URL 路径不包含 `tabs` 这个片段。
> - **初始路由（Initial Route）**：应用打开后用户看到的第一个页面。

> **基于经验建议**：大多数使用选项卡（Tab）布局的应用都应该将入口点放在路由分组中，例如 `src/app/(tabs)/index.tsx`。这样既能保持选项卡结构，又能让根 URL 保持干净的 `/`。

---

### 4. 根 `_layout.tsx` 取代了 `App.jsx/tsx`

`src/app/` 目录下**必须**存在一个根布局文件 `_layout.tsx`。它在所有其他路由之前执行，负责处理全局初始化任务：

- 加载字体（Font Loading）
- 设置主题提供者（Theme Providers）
- 配置全局状态
- 处理认证/授权逻辑

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '../components/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
```

这个文件替代了传统 React Native 项目中的 `App.jsx` 或 `App.tsx` 入口文件。

> **给初学者的说明**：
> - **`_layout.tsx`**：以 `_`（下划线）开头的文件名表示这是一个"特殊文件"，它不会被当作页面，而是用于定义导航结构或执行初始化逻辑。
> - **`<Stack />`**：Expo Router 提供的堆栈导航器组件。放在布局文件中，用于声明"此目录下的页面使用堆栈方式导航"。
> - **ThemeProvider**：一个 React Context 提供者，用于向整个应用传递主题配置（如深色/浅色模式）。

> **基于文档内容推导**：根布局文件是整个应用路由树中第一个被执行的组件。因此，任何需要在所有页面渲染之前完成的初始化逻辑（如加载字体、恢复用户登录状态、初始化第三方 SDK）都应该放在这里。

---

### 5. 默认模板使用平台特定的选项卡

默认项目模板根据运行平台使用不同的选项卡栏实现：

- **原生移动端（iOS/Android）**：使用**原生选项卡栏**，充分利用系统级特性（如触觉反馈、原生动画）。
- **Web 端**：使用**无样式的自定义组件**，方便开发者根据 Web 的交互模式进行定制。

Expo Router 通过**模块解析（Module Resolution）**自动选择正确的文件：

```
src/components/
├── app-tabs.native.tsx   ← 原生平台使用此文件
└── app-tabs.tsx          ← Web 平台使用此文件
```

当代码中写 `import AppTabs from '../components/app-tabs'` 时：

- 在 iOS/Android 上，Metro 打包器会自动解析到 `app-tabs.native.tsx`
- 在 Web 上，会解析到 `app-tabs.tsx`

> **给初学者的说明**：
> - **模块解析（Module Resolution）**：打包工具（如 Metro）根据当前平台自动选择正确文件的过程。开发者只需 `import` 不带扩展名的路径，工具会自动匹配。
> - **`.native.tsx`**：以 `.native` 为后缀的文件仅在原生平台（iOS/Android）上被使用。
> - **`.tsx`**：无平台后缀的文件作为"默认"版本，在没有更具体的平台匹配时使用（通常是 Web）。

> **基于经验建议**：如果你需要为不同平台提供差异化的 UI 体验，善用平台特定的文件扩展名是一种干净且可维护的方式。相关的组件代码应放在 `src/components` 等非路由目录中。

---

### 6. 非导航组件必须放在 `src/app` 目录之外

`src/app` 目录**仅用于路由文件**。工具函数（utilities）、自定义 Hook、普通组件等非路由代码必须放在独立目录中，否则 Expo Router 会错误地将它们视为可导航页面：

```
src/
├── app/                 ← 仅放路由文件
│   ├── index.tsx
│   ├── _layout.tsx
│   └── ...
├── components/          ← 可复用的 UI 组件
│   ├── app-tabs.native.tsx
│   ├── app-tabs.tsx
│   ├── text-field.tsx
│   └── toolbar.tsx
├── hooks/               ← 自定义 Hook
└── constants/           ← 常量配置
```

**关键区别：**

| 位置 | 行为 |
|------|------|
| `src/app/` 内的文件 | 自动生成 URL，可通过路由导航访问 |
| `src/components/`、`src/hooks/` 等 | 不生成 URL，仅作为代码模块被页面引用 |

> **给初学者的说明**：
> - **工具函数（Utilities）**：执行通用任务（如格式化日期、数据校验）的纯函数，不属于任何特定页面。
> - **自定义 Hook**：以 `use` 开头的函数（如 `useAuth`），封装可复用的状态逻辑。

> **基于经验建议**：这是初学者最常犯的错误之一——把普通组件文件不小心放在了 `src/app` 目录下。一旦这样做，Expo Router 就会为该文件生成一个 URL，导致意外的路由行为。务必将所有非页面代码放在 `src/app` 之外。

---

### 7. 自定义 Stack 和 Tab 导航器

Tab（选项卡）和 Stack（堆栈）导航器支持丰富的配置选项：

- **手势（Gestures）**：控制滑动手势的方向、灵敏度等
- **动画（Animations）**：自定义页面切换动画的类型和参数
- **头部（Headers）**：配置导航栏的标题、样式、左右按钮等

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: '首页' }} />
      <Stack.Screen name="profile" options={{ title: '个人资料' }} />
    </Stack>
  );
}
```

> **给初学者的说明**：
> - **`screenOptions`**：应用于导航器中所有页面的全局配置对象。
> - **`<Stack.Screen>`**：用于为特定页面设置导航选项的组件。`name` 属性对应 `src/app` 下的文件名（不含扩展名）。
> - **`animation`**：控制页面切换时的过渡动画。`slide_from_right` 表示从右侧滑入。

> **基于经验建议**：建议先在根布局中使用 `screenOptions` 设置全局统一的导航样式，然后只在需要差异化处理的个别页面上使用 `<Stack.Screen>` 或 `<Tabs.Screen>` 进行覆盖配置。这样既保持了代码一致性，又减少了重复配置。

---

## 准则综合应用示例

以下是一个完整的示例项目结构，展示了七条准则的实际运用：

```
src/
├── app/
│   ├── index.tsx
│   ├── home.tsx
│   ├── _layout.tsx
│   └── profile/
│       └── friends.tsx
└── components/
    ├── app-tabs.native.tsx
    ├── app-tabs.tsx
    ├── text-field.tsx
    └── toolbar.tsx
```

**各文件说明：**

| 文件 | 职责 | 对应 URL |
|------|------|----------|
| `src/app/index.tsx` | 初始入口页面，应用启动时首先加载 | `/` |
| `src/app/home.tsx` | 普通页面，可通过浏览器地址栏或原生深度链接访问 | `/home` |
| `src/app/_layout.tsx` | 根布局文件，处理全局初始化（字体加载、ThemeProvider 等），在所有路由之前执行 | 无（不产生 URL） |
| `src/app/profile/friends.tsx` | 嵌套路由页面，展示目录层级如何映射为 URL 路径 | `/profile/friends` |
| `src/components/app-tabs.native.tsx` | 原生平台的选项卡组件，使用系统级原生特性 | 无（非路由文件） |
| `src/components/app-tabs.tsx` | Web 平台的选项卡组件，使用无样式自定义实现 | 无（非路由文件） |
| `src/components/text-field.tsx` | 可复用的输入框组件 | 无（非路由文件） |
| `src/components/toolbar.tsx` | 可复用的工具栏组件 | 无（非路由文件） |

> **基于文档内容推导**：
> - `src/app` 内的每个 `.tsx` 文件（除 `_layout`）都自动获得一个 URL——无需手动注册路由。
> - `src/components` 中的文件虽然也是 React 组件，但因为不在 `src/app` 目录下，所以不会被当作路由页面。它们只是被页面引用的普通组件。
> - 平台特定的文件（`.native.tsx` vs `.tsx`）通过 Metro 的模块解析机制自动选择，开发者无需在运行时做条件判断。

---

## 核心概念总结

| 准则 | 要点 |
|------|------|
| **1. 路由文件位置** | 所有页面都在 `src/app` 目录下，每个文件的默认导出即一个页面 |
| **2. 自动 URL 映射** | 文件路径自动映射为 URL，深度链接开箱即用 |
| **3. 初始入口** | 第一个 `index.tsx` 是应用启动页面；可用路由分组 `(tabs)` 调整起始点 |
| **4. 根布局** | `_layout.tsx` 替代 `App.jsx/tsx`，在所有路由之前执行，处理全局初始化 |
| **5. 平台选项卡** | 原生平台用原生选项卡栏，Web 用自定义组件，通过文件扩展名自动切换 |
| **6. 非路由隔离** | 工具函数、Hook、组件等必须放在 `src/app` 之外，避免被误认为页面 |
| **7. 导航器定制** | Stack 和 Tab 导航器支持手势、动画、头部等丰富配置 |

> **基于经验建议**：掌握这七条准则后，你就能理解 Expo Router 文档中几乎所有高级功能的设计动机。建议在深入阅读后续文档（如布局、导航、常见模式）之前，先确保对这七条准则了然于胸。

---

## 文档导航

- **上一页**：[installation](./51__installation.md)
- **下一页**：[notation](./53__notation.md)
