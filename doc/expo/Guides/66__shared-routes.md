# 共享路由（Shared Routes）

> 原文地址：https://docs.expo.dev/router/advanced/shared-routes/

本文介绍如何在 Expo Router 中定义**共享路径**——即同一个 URL 在不同的布局（layout）中映射到相同的页面，以及如何使用**数组语法**来避免重复定义路由文件。

---

## 核心概念

在许多原生应用中，同一个页面可能出现在多个不同的导航上下文中。例如，在类似 X（原 Twitter）的应用中，用户个人资料页面可以在「首页」、「搜索」和「个人中心」等多个标签页中被访问，但它们共享同一个 URL。

Expo Router 通过**路由分组（Groups）** 和**数组语法（Arrays）** 两种机制来实现这种"共享路由"模式。

> **关键术语解释（面向初学者）：**
> - **路由分组（Group）**：用圆括号包裹的文件夹名，如 `(home)`、`(search)`。分组不会出现在 URL 路径中，但会影响导航器的行为。
> - **布局（Layout）**：以 `_layout.tsx` 命名的文件，定义了该目录下所有页面的导航容器（如 Stack、Tabs 等）。
> - **segment**：路由片段，即 URL 中对应目录层级的名称。对于分组路由，segment 会包含圆括号，如 `(search)`。
> - **initialRouteName**：导航器初始显示的子路由名称。

---

## 使用分组实现共享路径

当多个布局需要共享相同的子路由时，可以在各个分组中分别创建对应的页面文件。

### 目录结构示例

以下是一个标签栏（Tab Bar）应用的结构示例。根布局作为主标签栏，每个标签页分组拥有各自的头部导航（Header），并且用户个人资料页面 `[user].tsx` 在三个分组中共享：

```text
src
└── app
    ├── _layout.tsx          // 根布局 — 主标签栏
    ├── (home)
    │   ├── _layout.tsx      // 首页分组的布局（带 Stack 导航）
    │   └── [user].tsx       // 首页中的用户资料页
    ├── (search)
    │   ├── _layout.tsx      // 搜索分组的布局（带 Stack 导航）
    │   └── [user].tsx       // 搜索中的用户资料页
    └── (profile)
        ├── _layout.tsx      // 个人中心分组的布局（带 Stack 导航）
        └── [user].tsx       // 个人中心中的用户资料页
```

> **注意：** 当页面刷新时，系统会渲染**按字母顺序排列的第一个匹配结果**。在上述示例中，`(home)` 排在最前面，因此刷新页面时默认展示 `(home)` 分组中的 `[user].tsx`。

### 直接导航到特定分组

可以通过在 URL 中包含分组标识符来直接导航到特定分组中的页面。例如，要访问搜索分组中的用户页面：

```
/(search)/baconbrix
```

这将使用 `(search)` 分组下的 `_layout.tsx` 和 `[user].tsx` 来渲染页面。

---

## 使用数组语法避免文件重复

### 什么是数组语法

数组语法是一种高级的原生导航模式，使用 `(group1,group2)` 格式的文件夹名来**同时为多个分组生成相同的路由**，而无需在每个分组目录下重复创建文件。

例如：

```text
src/app/(home,search)/[user].tsx
```

这等同于在 `(home)` 和 `(search)` 两个分组中分别创建 `[user].tsx` 文件，但只需维护一份代码。

> **基于经验建议：** 数组语法非常适合多个分组中页面逻辑完全相同的场景。如果不同分组中的页面存在差异（如不同的 UI 或数据请求），建议还是使用独立的文件分别定义。

### 通过 segment 属性区分分组

当使用数组语法时，布局组件会接收到 `segment` 属性，可用于区分当前激活的是哪个分组：

```tsx
export default function DynamicLayout({ segment }) {
  if (segment === '(search)') {
    return <SearchStack />;
  }

  return <Stack />;
}
```

> **关键术语解释（面向初学者）：**
> - `segment` 是布局组件的一个 prop，表示当前路由片段的名称。
> - 在数组语法 `(home,search)` 中，segment 的值会是 `(home)` 或 `(search)`，取决于用户从哪个分组导航过来。
> - 这使得同一个布局组件可以根据不同的分组展示不同的导航器（如不同的 Stack 配置）。

### 配置 unstable_settings 以启用数组语法

使用数组语法时，**必须**在布局文件中导出 `unstable_settings` 对象，并为每个分组声明 `initialRouteName`：

```tsx
export const unstable_settings = {
  // 默认值（顶层），适用于整个应用和 (home) 分组
  initialRouteName: 'home',
  // (search) 分组的初始路由
  search: {
    initialRouteName: 'search',
  },
};

export default function DynamicLayout({ segment }) {
  // ...布局逻辑
}
```

> **说明：**
> - 顶层的 `initialRouteName: 'home'` 是整个应用的默认初始路由，同时也是 `(home)` 分组的默认值。
> - `search.initialRouteName: 'search'` 是 `(search)` 分组自己的默认初始路由。
> - 如果不设置这些默认值，导航器可能无法正确确定初始页面。

---

## 重要注意事项

以下是使用共享路由时需要牢记的关键要点：

1. **分组仅作用于当前活跃的导航器。** 路由分组只在包含它的导航器上下文中生效，不会跨导航器影响其他路由。

2. **数组语法中多个分组时，只有最后一个分组的 segment 会映射到路径。** 这意味着路径匹配以最后一个分组为准。

3. **如果存在多个分组名称但缺少默认的 `initialRouteName`，系统将使用第一个分组的指定名称作为回退。** 这可能导致非预期的初始页面展示。

> **基于文档内容推导：** 上述第三点意味着，如果你使用 `(a,b,c)` 这样的数组语法但没有在 `unstable_settings` 中明确指定 `initialRouteName`，系统会默认使用 `a` 分组的配置。建议始终显式声明所有分组的 `initialRouteName`，以避免隐式行为带来的困惑。

---

## 完整示例

将以上概念整合，以下是一个使用数组语法的完整布局文件示例：

```tsx
// src/app/(home,search)/_layout.tsx

import { Stack } from 'expo-router';

// 必须为每个分组声明 initialRouteName
export const unstable_settings = {
  initialRouteName: 'index',     // 应用默认 & (home) 分组的初始路由
  search: {
    initialRouteName: 'index',   // (search) 分组的初始路由
  },
};

export default function SharedLayout({ segment }) {
  // 根据 segment 渲染不同的导航器配置
  if (segment === '(search)') {
    return (
      <Stack
        screenOptions={{
          headerShown: true,
          title: '搜索结果',
        }}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: '首页',
      }}
    />
  );
}
```

配合如下目录结构：

```text
src
└── app
    ├── _layout.tsx                    // 根布局（Tabs 导航）
    └── (home,search)
        ├── _layout.tsx                // 共享布局（根据 segment 区分）
        ├── index.tsx                  // 首页/搜索的默认页面
        └── [user].tsx                 // 共享的用户资料页
```

> **基于经验建议：**
> - 在实际项目中，数组语法虽然能减少文件重复，但会增加布局组件的复杂度。当分组间的差异较大时（如完全不同的导航栏样式或页面转场动画），独立文件可能更易维护。
> - `unstable_settings` 中的 `unstable_` 前缀表明该 API 尚未稳定，未来版本中可能会变更。使用时应关注 Expo 的更新日志。
> - 调试共享路由问题时，可以通过 `console.log(segment)` 来确认当前激活的分组，帮助定位路由匹配问题。

---

## 文档导航

- **上一页**：[web modals](./65__web-modals.md)
- **下一页**：[protected](./67__protected.md)
