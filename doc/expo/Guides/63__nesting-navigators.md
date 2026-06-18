# 嵌套导航器（Nesting Navigators）

> **原文地址**：https://docs.expo.dev/router/advanced/nesting-navigators/

---

## 概述

嵌套导航器（Nesting Navigators）是指**在一个导航器的屏幕内部渲染另一个导航器**。这是 Expo Router 中一种常见且强大的架构模式，允许你构建层次化的导航结构。

本文档是 React Navigation 嵌套导航概念的延伸，专门讲解 **Expo Router** 中的具体实现方式。

> **警告**：导航 UI 元素（如 `Link`、`Tabs`、`Stack`）未来可能会从 Expo Router 库中移出。请关注官方文档的更新动态。

> **基于经验建议**：在大型应用中，合理使用嵌套导航器可以有效隔离不同模块的导航逻辑，提升代码可维护性。但过度嵌套会导致导航状态复杂化，建议控制嵌套层数在 2-3 层以内。

---

## 核心概念

**嵌套导航器（Nesting Navigator）**：指在父导航器的某个屏幕（Screen）中嵌入子导航器。子导航器拥有自己独立的路由栈和导航状态。

**关键术语说明（面向初学者）**：

- **导航器（Navigator）**：管理屏幕之间切换逻辑的组件。常见的有 Stack（栈式导航）、Tabs（标签导航）、Drawer（抽屉导航）等。
- **屏幕（Screen）**：导航器中的单个页面/视图。
- **布局（Layout）**：Expo Router 中的 `_layout.tsx` 文件，用于定义某个目录下所有屏幕共享的导航器。
- **路由（Route）**：对应文件系统中 `.tsx` 文件的 URL 路径。

> **基于文档内容推导**：Expo Router 基于文件系统路由，因此嵌套导航器的结构天然由目录层级决定——子目录中的 `_layout.tsx` 自动成为嵌套在父目录导航器内的子导航器。

---

## 示例结构

下面的示例展示了如何将 **Tabs（标签导航器）** 嵌套在 **Stack（栈式导航器）** 内部。

### 目录结构

```
src/app/
├── _layout.tsx          # 根布局 — Stack 导航器
├── index.tsx            # 根页面
└── home/
    ├── _layout.tsx      # Home 布局 — Tabs 导航器（嵌套在 Stack 中）
    ├── feed.tsx         # Feed 屏幕（路由：/home/feed）
    └── messages.tsx     # Messages 屏幕（路由：/home/messages）
```

> **说明**：`home` 目录下的 `feed.tsx` 和 `messages.tsx` 分别对应路由 `/home/feed` 和 `/home/messages`。

---

### 第一步：创建根布局（Stack 导航器）

**文件**：`src/app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';

export default Stack;
```

这个根布局使用 **Stack 导航器**，它将 `home/_layout.tsx` 和 `index.tsx` 都作为栈中的屏幕进行渲染。

> **初学者提示**：`export default Stack` 是一种简写方式，等同于导出一个包裹了 `<Stack />` 的组件。Stack 导航器会以"推入/弹出"的方式管理屏幕切换，类似浏览器的历史记录。

---

### 第二步：创建 Home 布局（Tabs 导航器）

**文件**：`src/app/home/_layout.tsx`

```tsx
import { Tabs } from 'expo-router';

export default Tabs;
```

Home 布局使用 **Tabs 导航器**，它将 `home` 目录下的 `feed.tsx` 和 `messages.tsx` 作为标签页渲染。

> **基于经验建议**：Tabs 导航器非常适合用于应用的主要功能分区（如"信息流"、"消息"、"个人中心"等），它让用户可以在几个核心页面之间快速切换。

---

### 第三步：创建根页面

**文件**：`src/app/index.tsx`

```tsx
import { Link } from 'expo-router';

export default function Root() {
  return <Link href="/home/messages">Navigate to nested route</Link>;
}
```

这个根页面包含一个链接组件，点击后会导航到嵌套路由 `/home/messages`。

---

### 第四步：创建嵌套屏幕

**Feed 屏幕**：`src/app/home/feed.tsx`

```tsx
import { View, Text } from 'react-native';

export default function Feed() {
  return (
    <View>
      <Text>Feed screen</Text>
    </View>
  );
}
```

**Messages 屏幕**：`src/app/home/messages.tsx`

```tsx
import { View, Text } from 'react-native';

export default function Messages() {
  return (
    <View>
      <Text>Messages screen</Text>
    </View>
  );
}
```

这两个组件是 Home 布局（Tabs）中的标签页，各自渲染一个简单的文本视图。

---

## 最终导航层级

```
Stack（根导航器）
├── index（根页面 — "/"）
└── home/_layout（Tabs 子导航器）
    ├── feed（"/home/feed"）
    └── messages（"/home/messages"）
```

> **基于文档内容推导**：通过这种嵌套结构，用户在 `/home/feed` 和 `/home/messages` 之间切换时，始终停留在 Tabs 导航器内，而根 Stack 导航器不会感知到标签页之间的切换。这意味着从 `/` 导航到 `/home/messages` 时，Stack 会推入整个 Home Tabs 屏幕。

---

## 在原生标签页中嵌套 Stack

当使用**原生标签页（Native Tabs）** 时，你可以在每个标签页内部嵌套一个 `<Stack />` 布局，以支持页面头部（Header）显示和屏幕推入操作。

```
Tabs（原生标签导航器）
├── Tab 1
│   └── Stack（栈式导航器）
│       ├── Screen A
│       └── Screen B
├── Tab 2
│   └── Stack
│       ├── Screen C
│       └── Screen D
└── Tab 3
    └── Stack
        └── Screen E
```

> **基于经验建议**：这种"Tabs 内嵌 Stack"的模式在移动端应用中极为常见。例如 Instagram、微信等应用，底部每个标签页内部都有自己的导航栈，用户可以在标签页内推入详情页并独立返回，而不影响其他标签页的导航状态。完整示例请参阅 Expo Router 的原生标签页（Native Tabs）官方文档。

---

## 导航到嵌套屏幕

这是嵌套导航器中最关键的操作之一。Expo Router 相比原生 React Navigation 做了大幅简化。

### React Navigation 的传统方式

在标准 React Navigation 中，要导航到深层嵌套的屏幕，需要通过 `params` 参数逐层指定屏幕名称。这会强制嵌套导航器显示指定的屏幕，而不是它的初始屏幕：

```jsx
navigation.navigate('root', {
  screen: 'settings',
  params: {
    screen: 'media',
  },
});
```

**解读**：上述代码的含义是：
1. 导航到名为 `root` 的导航器
2. 在 `root` 中打开 `settings` 屏幕
3. 在 `settings` 内部的嵌套导航器中打开 `media` 屏幕

> **初学者提示**：这种方式在嵌套层级较深时，代码会变得非常冗长且容易出错，需要手动维护每一层的 `screen` 和 `params` 结构。

### Expo Router 的简化方式

Expo Router 允许你直接使用 `router.push()` 方法，通过完整的路径进行导航，无需手动在参数中指定屏幕名称：

```jsx
router.push('/root/settings/media');
```

**对比总结**：

| 特性 | React Navigation | Expo Router |
|------|-----------------|-------------|
| 导航方式 | 逐层指定 `screen` + `params` | 直接使用路径字符串 |
| 代码复杂度 | 嵌套层级越深越复杂 | 始终一行代码 |
| 可维护性 | 需要与导航器结构强耦合 | 路径即路由，解耦更彻底 |

> **基于经验建议**：始终优先使用 `router.push()` 或 `<Link>` 组件进行导航，避免在 Expo Router 项目中回退到 React Navigation 的手动嵌套参数写法。路径式导航是 Expo Router 的核心优势之一。

---

## 注意事项与最佳实践

1. **控制嵌套深度**：虽然技术上可以无限嵌套，但过深的嵌套会增加调试难度和状态管理复杂度。建议最多嵌套 2-3 层。

2. **导航器类型搭配**：常见的嵌套组合包括：
   - Stack 内嵌 Tabs（最常见，如本文示例）
   - Tabs 内嵌 Stack（每个标签页有独立导航栈）
   - Stack 内嵌 Drawer（抽屉菜单内使用栈式导航）

3. **路由路径与文件结构一致**：Expo Router 基于文件系统路由，目录结构直接决定了导航器的嵌套关系，无需额外配置。

4. **导航状态隔离**：每个嵌套的导航器拥有独立的导航状态。例如，从 Stack 导航到 Tabs 中的某个页面，Tabs 内部的导航历史不会影响外层 Stack 的返回栈。

> **基于经验建议**：在设计导航架构时，先画出导航层级树状图，明确每个导航器的类型和屏幕，再映射到文件目录结构。这样可以避免后期重构带来的大量文件移动。

---

## 常见问题

**Q：嵌套导航器之间如何传递参数？**
A：Expo Router 支持在路径中传递参数，例如 `router.push('/home/messages/123')`，也可以使用搜索参数 `router.push('/home/messages?id=123')`。嵌套导航器会自动将参数传递到目标屏幕。

**Q：嵌套导航器会影响性能吗？**
A：适度的嵌套不会造成明显性能问题。但过深的嵌套可能导致导航状态序列化和恢复变慢，尤其在深层链接（Deep Linking）场景中。

**Q：可以在 Tabs 中嵌套另一个 Tabs 吗？**
A：技术上可以，但通常不推荐。双层标签导航会导致用户界面混乱，降低用户体验。

---

## 文档导航

- **上一页**：[authentication rewrites](./62__authentication-rewrites.md)
- **下一页**：[modals](./64__modals.md)
