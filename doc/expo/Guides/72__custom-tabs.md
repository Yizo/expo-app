# 自定义标签页（Custom Tabs）

> **原始文档地址**：https://docs.expo.dev/router/advanced/custom-tabs/
>
> **最后更新日期**：2026 年 5 月 18 日
>
> **功能状态**：实验性（Experimental）

---

## 概述

本指南介绍如何使用**无样式的标签页组件**（unstyled tab primitives）在 Expo Router 中构建完全自定义的导航结构。

这些组件来自 `expo-router/ui` 子模块。与 React Navigation 提供的**预置样式标签页**（styled tabs）不同，这些组件**不包含任何默认外观样式**，从而为复杂界面提供最大的设计自由度。

> **关键术语解释（面向初学者）**：
>
> - **无样式组件（Unstyled Primitives）**：只提供功能逻辑（如路由切换、焦点管理），不附带任何视觉样式的组件。开发者需要自行实现所有 UI 外观。
> - **子模块（Submodule）**：一个库内部的独立功能包。`expo-router/ui` 是 `expo-router` 中专门提供底层 UI 构建块的子模块。
> - **实验性功能（Experimental）**：API 可能在未来版本中发生变化，不建议在生产环境中大规模使用，除非你已充分评估风险。

**基于经验建议**：如果你需要原生风格的标签页外观，请参考 [Native Tabs 文档](https://docs.expo.dev/router/reference/native-tabs/)；如果你使用的是 React Navigation 方案，请查看 [JavaScript Tabs 指南](https://docs.expo.dev/router/reference/javascript-tabs/)。只有在需要完全自定义标签栏 UI 时才使用本指南中的组件。

---

## 核心组件结构

自定义标签页系统由四个核心组件组成：

| 组件 | 作用 | 说明 |
|------|------|------|
| `Tabs` | 主容器（Wrapper） | 包裹整个标签页导航结构的最外层组件 |
| `TabList` | 标签列表容器 | 直接包含各个触发器的容器，必须作为 `Tabs` 的直接子元素 |
| `TabTrigger` | 标签触发器 | 可交互元素，用于切换视图。必须提供 `href`（路由路径）和 `name`（标识名）属性 |
| `TabSlot` | 内容显示区域 | 渲染当前激活路由对应的屏幕内容 |

> **关键术语解释（面向初学者）**：
>
> - **触发器（Trigger）**：用户点击后触发某种行为的元素。在这里，点击触发器会切换到对应的标签页。
> - **路由路径（href）**：目标页面的路径字符串，如 `"/"` 表示首页，`"/article"` 表示文章页。
> - **标识名（name）**：开发者自定义的字符串，用于唯一标识一个标签页。可以是任何字符串。

---

## 最小示例

一个最基本的自定义标签页布局需要 `TabList`（标签列表）和 `TabSlot`（内容区域）同时放在 `Tabs` 容器内：

```tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { Text } from 'react-native';

// 定义自定义标签导航器的布局
export default function Layout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="home" href="/">
          <Text>Home</Text>
        </TabTrigger>
        <TabTrigger name="article" href="/article">
          <Text>Article</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
```

> **要点**：`name` 属性可以是开发者选择的**任意字符串**（any string），用于标识该标签页。

---

## 路由配置（Establishing Pathways）

`TabList` 容器持有导航系统中所有可用的路由路径。该容器必须直接放置在 `Tabs` 主容器之下。每个路由路径都需要一个对应的 `TabTrigger`，并指定 `name`（标识名）和 `href`（目标路径）。

### 动态路由（Dynamic Pathways）

`TabTrigger` 的 `href` 支持动态路由参数。例如，如果你有一个 `_layout.tsx` 和一个 `[slug].tsx` 文件，那么指向 `/hello-world` 的触发器会为 **[slug].tsx** 生成一个标签页，并传入参数 `{ slug: 'hello-world' }`。

```tsx
// 动态路由触发器示例
<TabTrigger name="dynamic page" href="/hello-world" />
// 生成的路由参数：{ slug: 'hello-world' }
```

> **关键术语解释（面向初学者）**：
>
> - **动态路由（Dynamic Route）**：路径中包含可变参数的路由。文件名使用方括号表示，如 `[slug].tsx`，其中 `slug` 是参数名。
> - **路由参数（Route Params）**：URL 中动态部分被解析后得到的键值对，可在目标页面中通过 `useLocalSearchParams()` 获取。

**基于经验建议**：动态路由标签页非常适合根据用户数据动态生成界面元素的场景，例如用户收藏的分类频道列表。

### 模糊路由（Ambiguous Pathways）

`href` 必须能解析到**唯一的路由路径**。当处理包含共享路由组的场景时（如 `(one,two)` 组中包含 `route.tsx`），你必须在 `href` 中**显式指定路由组名称**以避免歧义。

```tsx
// 错误写法：存在歧义，框架不知道该解析到 (one) 还是 (two) 下的 route
<TabTrigger name="route" href="/route" />

// 正确写法：显式指定路由组
<TabTrigger name="route" href="/(one)/route" />
```

> **关键术语解释（面向初学者）**：
>
> - **路由组（Route Group）**：使用圆括号命名的文件夹，如 `(one)`。它们不会影响 URL 路径，但用于组织文件结构。
> - **共享路由组（Shared Route Group）**：多个路由组包含相同名称的路由文件，如 `(one,two)` 表示 `one` 和 `two` 两个组共享同一个路由。

> **注意**：当路由存在歧义时，框架无法自动判断应该导航到哪个路由，必须通过显式路径来消除歧义。

### 嵌套路由（Nested Pathways）

`TabTrigger` 可以指向深层嵌套的路由。例如指向 `/route` 的触发器会显示 **(stack-one)/(stack-two)/route.tsx** 文件，该文件由其父级导航器管理，工作原理类似于**深度链接（Deep Linking）**。

```tsx
// 嵌套路由触发器
<TabTrigger name="route" href="/route" />
// 实际渲染的路径：(stack-one)/(stack-two)/route.tsx
```

> **关键术语解释（面向初学者）**：
>
> - **深度链接（Deep Linking）**：直接导航到应用中某个深层页面的技术，而非从首页逐级进入。

---

## 内容显示区域（TabSlot）

`TabSlot` 负责渲染当前激活的路由页面。它可以被嵌套在其他组件内部，但**绝对不能放在 `TabList` 内部**。

```tsx
<Tabs>
  <TabList>
    <TabTrigger name="home" href="/">
      <Text>Home</Text>
    </TabTrigger>
  </TabList>
  {/* 自定义 TabSlot 的渲染方式——可以包裹在其他 View 中 */}
  <View>
    <View>
      <TabSlot />
    </View>
  </View>
</Tabs>
```

> **限制**：`TabSlot` 可以嵌套在其他组件内，但**严禁**放在 `TabList` 内部。违反此规则会导致渲染异常。

### 修改屏幕渲染方式

`TabSlot` 接受一个 `renderFn` 属性，可用于覆盖默认的屏幕渲染逻辑，从而实现**动画过渡**或**状态持久化**等高级功能。

> **关键术语解释（面向初学者）**：
>
> - **渲染函数（renderFn）**：一个自定义函数，用于控制组件如何将内容绘制到屏幕上。
> - **状态持久化（State Persistence）**：在页面切换时保留页面的状态（如滚动位置、表单数据），而非每次切换都重新初始化。

---

## 切换视图（Changing Active Views）

标准的 `Link` 组件或命令式导航 API 会触发完整的导航事件（包括 URL 变化），而 `TabTrigger` 在切换视图时**不会改变 URL**。

### 重置导航状态（Resetting State）

你可以通过 `reset` 属性控制标签页的状态重置行为。该属性接受以下三个值：

| 值 | 说明 |
|----|------|
| `"always"` | 每次点击都重置导航状态 |
| `"onLongPress"` | 仅在长按时重置导航状态 |
| `"never"` | 永不重置导航状态 |

```tsx
// 每次切换到 home 标签页时，重置到初始首页
<TabTrigger name="home" reset="always" />
```

**基于经验建议**：这个功能在嵌套 Stack 导航器时特别有用——当用户切换标签页再切回来时，你可能希望将其返回到该 Stack 的初始页面而非之前浏览的深层页面。`"onLongPress"` 选项模仿了 iOS 原生标签栏的行为：轻触切换，长按回到顶部。

---

## TabTrigger 的双重角色

`TabTrigger` 承担两个职责：

1. **定义可用路由**：声明标签导航中存在哪些页面
2. **切换视图**：作为可点击元素触发页面切换

### 在 TabList 内部

当 `TabTrigger` 放在 `TabList` 内部时，它同时定义路由路径（需要 `href` 和 `name`）并充当可交互的切换按钮。它可以渲染可见的子元素，也可以在被外部触发时保持不可见。

### 在 TabList 外部

`TabTrigger` 可以放在 `TabList` 之外，此时它**不需要 `href` 属性**，仅模仿主触发器的切换行为。但它**必须仍然是 `Tabs` 的后代元素**才能正常工作。

```tsx
<Tabs>
  <TabSlot />
  {/* 外部的 TabTrigger——不需要 href，只需 name */}
  <View>
    <TabTrigger name="home">
      <Text>Go Home</Text>
    </TabTrigger>
  </View>
  {/* 内部的 TabTrigger——需要 href 和 name */}
  <TabList>
    <TabTrigger name="home" href="/">
      <Text>Home</Text>
    </TabTrigger>
  </TabList>
</Tabs>
```

> **注意**：放置在 `TabList` 外部的 `TabTrigger` 必须至少是 `Tabs` 的后代元素（descendant），否则无法正常工作。

---

## 样式自定义（Visual Modifications）

所有组件默认渲染为**无样式的 View**，只有 `TabTrigger` 默认渲染为 `Pressable`（可按压组件）。你可以通过以下方式自定义外观：

1. 直接应用自定义样式
2. 使用 `asChild` 属性完全替换底层渲染元素

> **关键术语解释（面向初学者）**：
>
> - **asChild**：一个布尔属性，启用后组件不再渲染自身的默认元素（如 View 或 Pressable），而是将所有属性**转发**（forward）给它的直接子元素。这允许你完全控制底层的渲染元素。
> - **Pressable**：React Native 中处理触摸交互的组件，类似于 Web 中的 `<button>`。

### 使用 asChild 替换 TabList

```tsx
<Tabs>
  <TabSlot />
  <TabList asChild>
    {/* 使用自定义组件替换默认的 TabList */}
    <CustomTabList>
      <TabTrigger name="home" href="/">
        <Text>Home</Text>
      </TabTrigger>
    </CustomTabList>
  </TabList>
</Tabs>
```

### 使用 asChild 替换 TabTrigger

```tsx
<Tabs>
  <TabSlot />
  <TabList asChild>
    <TabTrigger name="home" href="/" asChild>
      {/* 使用自定义按钮替换默认的 Pressable */}
      <CustomButton>
        <Text>Home</Text>
      </CustomButton>
    </TabTrigger>
  </TabList>
</Tabs>
```

### 构建替代导航栏

通过隐藏默认的 `TabList`，你可以构建完全自定义的导航栏。`TabTrigger` 会向子元素转发 `isFocused` 属性，用于响应激活状态的变化。

```tsx
<Tabs>
  <TabSlot />
  {/* 自定义标签栏 */}
  <View>
    <View>
      <TabTrigger name="home">
        <Text>Home</Text>
      </TabTrigger>
      <TabTrigger name="article">
        <Text>article</Text>
      </TabTrigger>
    </View>
  </View>
  {/* 隐藏默认的 TabList */}
  <TabList style={{ display: 'none' }}>
    <TabTrigger name="home" href="/">
      <Text>Home</Text>
    </TabTrigger>
    <TabTrigger name="article" href="/article">
      <Text>article</Text>
    </TabTrigger>
  </TabList>
</Tabs>
```

> **关键术语解释（面向初学者）**：
>
> - **isFocused**：一个布尔值属性，当该标签页处于激活（当前显示）状态时为 `true`，否则为 `false`。常用于实现高亮、选中样式等视觉效果。
> - **属性转发（Prop Forwarding）**：组件将自身接收到的属性传递给子元素的过程。`TabTrigger` 会将 `isFocused` 等属性转发给它的子组件。

### 自定义标签按钮组件示例

以下是一个利用 `isFocused` 属性实现选中状态的自定义按钮组件完整示例：

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, Ref } from 'react';
import { Text, Pressable, View } from 'react-native';

type Icon = ComponentProps<typeof FontAwesome>['name'];

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: Icon;
  ref: Ref<View>;
};

export function TabButton({ icon, children, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      style={[
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 5,
          padding: 10,
        },
        isFocused ? { backgroundColor: 'white' } : undefined,
      ]}>
      <FontAwesome name={icon} />
      <Text style={[{ fontSize: 16 }, isFocused ? { color: 'white' } : undefined]}>{children}</Text>
    </Pressable>
  );
}
```

> **关键术语解释（面向初学者）**：
>
> - **TabTriggerSlotProps**：`expo-router/ui` 导出的类型，定义了 `TabTrigger` 在 `asChild` 模式下转发给子元素的所有属性的类型。自定义按钮组件应该扩展此类型。
> - **Ref**：React 的引用机制，用于直接访问底层 DOM 元素或组件实例。在标签页场景中，`Pressable` 需要 ref 来处理焦点管理和无障碍访问。

> **注意（旧版 SDK 兼容）**：对于 **Expo SDK 52 及更早版本**以及 **React 18 及更早版本**，需要使用传统的 `forwardRef` 方式来访问 ref 句柄，而非上述的 `ref` 属性直接传递方式。

---

## Hook 等价方案

对于需要在渲染树中进行更高级操作的场景，`expo-router/ui` 提供了对应的 Hook 版本。通常情况下 `asChild` 属性已经足够满足需求，但在开发完全自定义的 `TabList` 时，可能需要使用 `useTabsWithChildren()` Hook。

> **关键术语解释（面向初学者）**：
>
> - **Hook**：React 中一种特殊的函数，允许你在函数组件中使用状态和其他 React 特性。Hook 通常以 `use` 开头命名。
> - **渲染树（Render Tree）**：组件在 React 中形成的层级结构，类似于 DOM 树。
> - **useTabsWithChildren()**：一个底层 Hook，提供对标签页子元素的精细控制能力。仅在你需要构建高度自定义的标签列表时才需要使用。

**基于经验建议**：除非你正在构建一个可复用的标签页 UI 库，否则 `asChild` 属性通常就足够了，不需要直接使用底层 Hook。

---

## 常见问题解答（FAQ）

### 如何为同一路由创建多个标签页？

将路由放入**共享路由组**（shared group）中，然后为每个组生成独立的触发器。

```tsx
// 假设路由文件结构为：(movie)/index.tsx 和 (tv)/index.tsx
<TabTrigger name="movies" href="/(movie)" />
<TabTrigger name="tv-shows" href="/(tv)" />
```

> **基于文档内容推导**：这种方式允许同一个物理路由文件在不同的路由组下拥有不同的标签页表示，每个标签页维护独立的导航状态。

### 如何隐藏某个标签页？

直接从渲染树中**移除对应的 `TabTrigger`** 即可。移除触发器会同时消除其导航状态。

> **注意**：仅仅用 `display: 'none'` 隐藏触发器不会移除其路由注册——路由仍然存在于导航系统中。如果希望完全移除标签页及其状态，需要从 JSX 中删除该组件。

### 如何实现标签页切换动画？

向 `TabSlot` 提供自定义的 `renderFn` 渲染函数，在其中检测焦点变化并应用动画效果。

### 关于相对路径（Relative Destinations）

`TabTrigger` 的相对路径会基于其**渲染位置的本地路径名**来解析，而不是基于当前激活的路由页面。

```tsx
// 相对路径示例——不推荐
<TabTrigger href="./profile" />
```

> **警告**：官方文档**明确建议避免使用相对路径**。相对路径的解析行为可能不符合直觉，容易导致导航到意外的页面。始终使用绝对路径（如 `/profile`）以确保行为可预测。

---

## API 属性速查表

| 属性 | 所属组件 | 类型 | 说明 |
|------|----------|------|------|
| `name` | `TabTrigger` | `string` | 标签页的标识名，可以是任意字符串 |
| `href` | `TabTrigger` | `string` | 目标路由路径（在 `TabList` 内部时必需） |
| `reset` | `TabTrigger` | `"always" \| "onLongPress" \| "never"` | 控制导航状态重置行为 |
| `asChild` | `TabList`, `TabTrigger` | `boolean` | 替换底层渲染元素，将属性转发给子元素 |
| `isFocused` | `TabTrigger`（转发） | `boolean` | 标识该标签页是否处于激活状态 |
| `renderFn` | `TabSlot` | `function` | 覆盖默认的屏幕渲染逻辑 |

---

## 完整工作流程总结

**基于文档内容推导**，以下是使用自定义标签页的典型工作流程：

1. **安装依赖**：确保项目中已安装 `expo-router`
2. **导入组件**：从 `expo-router/ui` 子模块导入 `Tabs`、`TabList`、`TabTrigger`、`TabSlot`
3. **构建布局**：在 `_layout.tsx` 中使用 `Tabs` 作为根容器
4. **定义路由**：在 `TabList` 内使用 `TabTrigger` 声明所有可用的标签页及其路由
5. **放置显示区**：使用 `TabSlot` 渲染当前激活页面的内容
6. **自定义外观**：通过 `asChild` 属性或外部 `TabTrigger` 实现完全自定义的 UI
7. **处理交互**：利用 `isFocused`、`reset` 等属性完善用户体验

---

## 文档导航

- **上一页**：[apple handoff](./71__apple-handoff.md)
- **下一页**：[custom navigators](./73__custom-navigators.md)
