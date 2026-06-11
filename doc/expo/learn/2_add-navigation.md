# 在 Expo 应用中添加导航

> 原文标题：**Add navigation**  
> 文档更新时间：**2026 年 5 月 23 日**  
> 本文内容仅基于所提供的官方文档原文整理。

## 文档解决的问题

这篇教程介绍如何使用 **Expo Router** 为 Expo 应用添加导航，最终实现：

1. 使用 Stack 在不同页面之间导航。
2. 使用 `Link` 从首页进入 About 页面。
3. 使用 `+not-found.tsx` 处理不存在的路由。
4. 使用 Tabs 创建底部标签栏。
5. 自定义标签栏图标、颜色和页面 Header 样式。

完成教程后的导航结构是：

```text
Root Stack
├── (tabs)
│   ├── Home
│   └── About
└── +not-found
```

其中：

- Root Stack 是应用最外层的导航容器。
- `(tabs)` 内部管理底部标签栏。
- `+not-found` 负责处理无法匹配的地址。

## 适用场景

这篇文档适合以下场景：

- Expo 应用需要多个页面。
- 需要从一个页面进入另一个页面。
- 需要类似社交应用的底部标签栏。
- 需要在用户访问错误地址时显示自定义页面。
- 希望 Android、iOS 和 Web 共用一套路由结构。

当前文档没有涉及：

- 路由参数和动态路由。
- 登录鉴权和路由守卫。
- Modal 页面。
- 深度链接。
- 浏览器历史记录的具体行为。
- 原生导航工程配置。
- 导航状态管理。
- 安装或初始化 Expo Router 的过程。

## 阅读前需要理解的概念

### Screen：页面

在这篇文档中，Screen 可以理解为应用中的一个页面。

对 React Web 开发者来说，它大致对应一个由路由渲染的页面组件。不过移动端通常没有浏览器地址栏，页面切换主要通过导航器和用户操作完成。

### Navigator：导航器

导航器负责：

- 组织页面之间的关系。
- 决定页面如何切换。
- 显示 Header 或底部标签栏等导航 UI。

本文使用两种导航器：

- `Stack`：堆栈导航。
- `Tabs`：底部标签导航。

### Expo Router：基于文件的路由框架

Expo Router 是面向 React Native 和 Web 应用的文件路由框架。

它的核心规则是：

> `app` 目录中的路由文件会自动成为原生应用中的 Screen，以及 Web 上的 Page。

这与 React Web 中手动维护路由配置的方式不同。这里的目录和文件名本身就是路由配置的一部分。

## Expo Router 的基础约定

### `app` 目录

`app` 是一个特殊目录，只用于存放：

- 路由。
- 路由对应的 Layout。

原文明确说明，加入该目录的文件会成为应用中的页面。

因此，不应把 `app` 简单理解为普通源码目录。它直接决定应用的导航结构。

### 根 Layout：`app/_layout.tsx`

`app/_layout.tsx` 是根布局文件，用于定义多个路由共享的导航 UI，例如：

- Header。
- Tab bar。
- Stack 导航结构。

它类似 React Web 中包裹路由出口的根布局组件，但同时承担导航器配置职责。

### `index.tsx` 规则

名为 `index.tsx` 的文件匹配其父目录本身，不会增加新的 URL 路径片段。

例如：

```text
app/index.tsx
```

对应：

```text
/
```

而不是：

```text
/index
```

### 路由文件的默认导出

每个路由文件都需要默认导出一个 React 组件：

```tsx
export default function AboutScreen() {
  // ...
}
```

路由文件可以使用：

```text
.js
.jsx
.ts
.tsx
```

### 跨平台统一结构

Android、iOS 和 Web 共用统一的导航结构。

这意味着不需要分别维护三套路由文件。不过原文没有说明三个平台上的所有导航行为都完全相同。

## 第一步：向 Stack 添加 About 页面

在 `app` 目录中创建：

```text
app/about.tsx
```

该文件对应 `/about` 路由。

```tsx
import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
```

这里使用的是 React Native 组件：

- `View`：页面布局容器。
- `Text`：显示文本。
- `StyleSheet.create()`：创建样式对象。

对于 React Web 开发者，不能直接把 `View` 和 `Text` 当作原生 DOM 中的 `div` 和 `span`。它们是 React Native 提供的跨平台组件。

### 在根 Layout 中注册 Stack 页面

修改 `app/_layout.tsx`：

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
```

配置含义：

| 配置 | 作用 |
|---|---|
| `Stack` | 创建 Stack 导航器 |
| `Stack.Screen` | 配置 Stack 中的一个路由 |
| `name="index"` | 对应 `index.tsx` |
| `name="about"` | 对应 `about.tsx` |
| `options.title` | 设置该页面的标题 |

这里的 `Stack.Screen` 主要是在配置已经由文件系统定义的路由，而不是在其中传入页面组件。

## Stack 导航是什么

Stack 可以理解为一组按堆栈方式组织的页面。

从当前页面进入新页面时，新页面会显示在当前页面上方。原文明确说明：

- Android：新路由动画显示在当前页面上方。
- iOS：新路由从右侧进入。

`Stack` 是应用中不同页面之间导航的基础。

**React Web 开发者容易误解的地方：**

Web 路由通常重点关注 URL 与组件的对应关系；移动端 Stack 还会管理页面进入动画、返回关系和导航 Header。

## 第二步：使用 `Link` 在页面之间导航

修改首页 `index.tsx`，从 `expo-router` 导入 `Link`：

```tsx
import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>

      <Link href="/about" style={styles.button}>
        Go to About screen
      </Link>
    </View>
  );
}
```

点击该组件后，会从 `/` 导航到 `/about`。

### `Link` 的作用

原文明确说明：

- `Link` 是 Expo Router 提供的 React 组件。
- 它接收 `href` 属性。
- 它会渲染一个 `Text`。
- 它可以接收与 `Text` 相同的属性。

示例：

```tsx
<Link href="/about">Go to About screen</Link>
```

对于 React Web 开发者，可以把它类比为路由库提供的链接组件，但不能直接认为它就是 HTML 的 `<a>`，因为原文明确指出这里渲染的是 React Native 的 `Text`。

## 第三步：添加 Not Found 页面

当路由不存在时，Expo Router 可以通过特殊文件处理：

```text
app/+not-found.tsx
```

它用于：

- 移动端访问无效路由时显示自定义页面，避免应用崩溃。
- Web 端显示自定义 404 页面。

示例：

```tsx
import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />

      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
```

### 页面中的 `Stack.Screen`

这里没有在根 Layout 中配置标题，而是在页面组件内部使用：

```tsx
<Stack.Screen options={{ title: 'Oops! Not Found' }} />
```

它用于设置当前 Not Found 页面的标题。

返回首页的链接是：

```tsx
<Link href="/">Go back to Home screen!</Link>
```

### 测试方式

原文建议在 Web 浏览器中修改 URL，因为浏览器地址比较容易直接编辑：

```text
http:localhost:8081/123
```

访问无法匹配的 `/123` 后，应显示 `NotFoundScreen`。

> 注意：以上测试地址按原文记录。原文未进一步解释该地址格式。

## 第四步：添加底部 Tabs 导航

添加 Tabs 之前，目录结构为：

```text
app/
├── _layout.tsx
├── index.tsx
├── about.tsx
└── +not-found.tsx
```

接下来需要：

1. 在 `app` 中创建 `(tabs)` 目录。
2. 创建 `(tabs)/_layout.tsx`。
3. 把 `index.tsx` 和 `about.tsx` 移入 `(tabs)`。

最终目录结构：

```text
app/
├── _layout.tsx
├── +not-found.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    └── about.tsx
```

### `(tabs)` 的含义

`(tabs)` 是一个特殊的路由分组目录，用于把相关路由组织到同一个底部标签栏中。

虽然文件被移动到了 `(tabs)` 目录，但原文给出的路由仍然是：

```text
(tabs)/index.tsx  -> /
(tabs)/about.tsx  -> /about
```

**基于文档内容推导：** `(tabs)` 主要负责组织导航结构，没有给最终 URL 增加 `(tabs)` 路径片段。

## 配置根 Stack

修改 `app/_layout.tsx`：

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

配置说明：

| 配置 | 作用 |
|---|---|
| `name="(tabs)"` | 把整个 Tabs 路由组放入根 Stack |
| `headerShown: false` | 隐藏根 Stack 为 Tabs 路由组显示的 Header |

**基于文档内容推导：** Tabs 内部会管理自己的 Header。如果根 Stack 的 Header 不隐藏，界面可能同时出现外层和内层导航 UI。

原文明确说明，Root Layout 继续使用 Stack，是为了让 `+not-found` 路由能够显示在其他嵌套导航器之上。

## 配置 Tabs Layout

创建 `app/(tabs)/_layout.tsx`：

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="about" options={{ title: 'About' }} />
    </Tabs>
  );
}
```

配置关系：

```text
Tabs
├── index -> Home 标签
└── about -> About 标签
```

`Tabs.Screen` 中的 `name` 必须与 `(tabs)` 目录中的路由文件名对应。

## 第五步：自定义底部标签栏

### 添加图标

从 `@expo/vector-icons` 导入 Ionicons：

```tsx
import Ionicons from '@expo/vector-icons/Ionicons';
```

原文将 `@expo/vector-icons` 描述为包含多种常用图标集的库。

完整配置：

```tsx
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'information-circle'
                  : 'information-circle-outline'
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
```

### `tabBarIcon`

`tabBarIcon` 是一个函数，原文示例使用两个参数：

| 参数 | 含义 |
|---|---|
| `focused` | 当前标签是否处于选中状态 |
| `color` | 当前图标应该使用的颜色 |

根据 `focused` 选择实心或轮廓图标：

```tsx
name={focused ? 'home-sharp' : 'home-outline'}
```

### `tabBarActiveTintColor`

```tsx
screenOptions={{
  tabBarActiveTintColor: '#ffd33d',
}}
```

它会把当前激活标签的图标和文字设置为 `#ffd33d`。

## 自定义 Header 和 Tab Bar 样式

在 `Tabs` 的 `screenOptions` 中继续添加：

```tsx
<Tabs
  screenOptions={{
    tabBarActiveTintColor: '#ffd33d',
    headerStyle: {
      backgroundColor: '#25292e',
    },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
      backgroundColor: '#25292e',
    },
  }}
>
```

各配置项的作用：

| 配置项 | 作用 |
|---|---|
| `tabBarActiveTintColor` | 设置激活标签的图标和文字颜色 |
| `headerStyle.backgroundColor` | 设置 Header 背景颜色 |
| `headerShadowVisible` | 控制 Header 阴影，示例设置为 `false` |
| `headerTintColor` | 设置 Header 标题颜色 |
| `tabBarStyle.backgroundColor` | 设置底部标签栏背景颜色 |

## 最终导航结构

最终应用采用嵌套导航：

```text
app/_layout.tsx
└── Stack
    ├── (tabs)
    │   └── Tabs
    │       ├── index
    │       └── about
    └── +not-found
```

职责划分如下：

- 根 `Stack`：负责应用最外层导航结构。
- `(tabs)/_layout.tsx`：负责 Home 和 About 的底部标签导航。
- `+not-found.tsx`：负责所有无法匹配的路由。

## React Web 开发者最容易误解的地方

### 文件不仅是组件，也是路由定义

在常见 React Web 项目中，可能会集中配置：

```tsx
<Route path="/about" element={<About />} />
```

本文中的 Expo Router 使用文件系统表达这层关系：

```text
app/about.tsx -> /about
```

但 Layout 中仍然可以使用 `Stack.Screen` 或 `Tabs.Screen` 配置标题、图标和 Header。

### `_layout.tsx` 不只是普通页面布局

它不仅提供共享 UI，还定义当前目录下路由使用哪种导航器。

例如：

```text
app/_layout.tsx
```

定义根 Stack，而：

```text
app/(tabs)/_layout.tsx
```

定义底部 Tabs。

### Stack 和 Tabs 可以嵌套

它们不是互斥方案。

本文使用：

```text
Stack 包含 Tabs
```

这样 Tabs 管理主要页面，根 Stack 继续处理 Tabs 之外的路由，例如 Not Found 页面。

### `(tabs)` 是特殊目录

不要根据普通文件路径规则，直接认为 About 的 URL 会变成：

```text
/(tabs)/about
```

原文明确展示它仍然匹配：

```text
/about
```

### `Link` 不是普通 HTML 标签

它来自：

```tsx
import { Link } from 'expo-router';
```

原文说明它渲染 `Text`，并接受 `Text` 的属性。

### 样式不是 CSS

本文使用：

```tsx
StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
  },
});
```

样式使用 JavaScript 对象和 React Native 属性，而不是 CSS 文件或浏览器 CSS 规则。

## 注意事项和限制条件

1. `app` 目录只应包含路由及其 Layout。
2. 路由文件必须默认导出 React 组件。
3. `index.tsx` 对应父目录路径，不产生 `index` 路径片段。
4. `_layout.tsx` 是特殊文件，负责共享导航 UI 和导航器结构。
5. `+not-found.tsx` 是特殊的无匹配路由文件。
6. `(tabs)` 是用于路由分组和 Tabs 布局的特殊目录。
7. 页面移动到 `(tabs)` 后，需要同步更新根 Layout 和 Tabs Layout。
8. 根 Stack 中对 `(tabs)` 设置了 `headerShown: false`。
9. 图标名称需要与所选 Ionicons 图标集相对应。
10. `focused` 用于区分标签激活和未激活状态。
11. 本文没有讲解依赖安装，因此不能仅根据本文判断何时需要安装 `expo-router` 或 `@expo/vector-icons`。
12. 本文只演示了两个固定路由，没有覆盖更复杂的导航场景。

## 实际开发中如何应用

可以按照以下顺序搭建类似导航结构：

1. 先确定应用需要哪些顶级导航器。
2. 在 `app/_layout.tsx` 中建立根 Stack。
3. 将需要底部标签栏的页面放到 `(tabs)` 路由组。
4. 在 `(tabs)/_layout.tsx` 中配置每个标签。
5. 使用 `Link` 建立页面间跳转。
6. 添加 `+not-found.tsx` 处理无效路由。
7. 最后统一配置 Header、标签栏颜色和图标。

**基于文档内容推导：** 路由目录结构应先根据导航层级设计，而不只是根据业务组件分类。文件移动可能同时改变它所属的 Layout 和导航器，因此移动路由文件后，需要检查对应的 `_layout.tsx` 配置。

**基于经验建议：** 修改路由目录后，应分别验证首页、About 页面、标签切换和无效路由，以避免只检查页面能否渲染，却遗漏导航层级或 Header 配置问题。

## 明确内容与推导内容

### 文档明确说明

- Expo Router 是基于文件的路由框架。
- Android、iOS 和 Web 共用导航结构。
- `app` 中的路由文件会成为 Screen 或 Web Page。
- `index.tsx` 匹配父目录路径。
- `Stack` 用于创建导航堆栈。
- `Link` 根据 `href` 执行导航。
- `+not-found.tsx` 处理无效路由。
- `(tabs)` 用于组织底部标签导航。
- Root Stack 保留后，Not Found 可以显示在嵌套导航器之上。
- Ionicons 可以用于标签栏图标。
- `screenOptions` 可以统一设置 Header 和 Tab bar 样式。

### 基于文档内容推导

- `(tabs)` 是组织导航结构的路由组，不会成为 URL 路径片段。
- 隐藏根 Stack Header 可以避免它与 Tabs 内部 Header 形成重复导航 UI。
- Expo Router 的目录结构同时承担页面组织和路由配置职责。
- 移动路由文件不仅是代码整理，也可能改变页面所属的导航布局。

## 总结

本章完成了一个由两层导航器组成的 Expo 应用：

- 最外层使用 `Stack`。
- Home 和 About 使用底部 `Tabs`。
- 页面之间可以通过 `Link` 跳转。
- 无效路由由 `+not-found.tsx` 处理。
- Header 和 Tab bar 可以通过 `screenOptions` 统一定制。
- 标签可以根据激活状态显示不同的 Ionicons 图标。

最关键的理解是：**Expo Router 使用文件和目录表达路由与导航层级，而 `_layout.tsx` 决定这一层路由由哪种导航器管理。**

<!-- NAVIGATION START -->
---
[← 上一页：创建你的第一个 Expo 应用](./1_create-your-first-app.md) | [下一页：使用 React Native 与 Expo 构建 StickerSmash 首屏 →](./3_build-a-screen.md)
<!-- NAVIGATION END -->
