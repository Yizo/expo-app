# 重定向（Redirects）

> 原始文档地址：https://docs.expo.dev/router/reference/redirects/

---

## 概述

在应用开发中，**重定向（Redirect）** 是指根据某些应用内部条件，将用户的请求自动转发到另一个 URL。Expo Router 支持多种不同的重定向模式，开发者可以根据场景灵活选择。

> **初学者须知：**
> - **重定向（Redirect）**：类似于网页中的"页面跳转"。当用户访问某个页面时，应用根据当前状态（例如是否已登录）自动将其导航到其他页面。
> - **声明式（Declarative）**：通过返回一个组件来描述"我要去哪里"，由框架负责执行跳转。代码风格更直观，适合在渲染逻辑中使用。
> - **命令式（Imperative）**：通过调用函数来主动触发跳转，代码风格更灵活，适合在副作用或事件处理中使用。
> - **导航历史（Navigation History）**：记录用户在应用内访问过的页面序列。类似浏览器的"后退"按钮所依赖的历史记录。重定向时通常不希望将当前页面加入历史，否则用户按"返回"时又回到被重定向的页面，造成体验问题。

---

## 使用 `Redirect` 组件（声明式重定向）

`Redirect` 是 `expo-router` 提供的一个组件，可以**立即**从当前页面重定向到另一个路由。当你需要根据某个条件（如用户是否登录）来决定是否跳转时，这是最简洁直观的方式。

### 导入方式

```tsx
import { Redirect } from 'expo-router';
```

### 基本用法

```tsx
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Page() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
```

### 代码解析

| 代码部分 | 说明 |
|---------|------|
| `useAuth()` | 获取当前用户的认证状态。这是一个自定义 Hook（需开发者自行实现），返回 `user` 对象。如果 `user` 为 `null` 或 `undefined`，表示用户未登录。 |
| `if (!user)` | 条件判断：当用户未登录时，执行重定向逻辑。 |
| `<Redirect href="/login" />` | 声明式重定向组件。`href` 属性指定目标路由路径。当该组件被渲染时，Expo Router 会立即将用户导航到 `/login` 页面。 |
| `<View><Text>...</Text></View>` | 当用户已登录时，正常显示页面内容。 |

> **初学者须知：**
> - **`href`**：即 "hypertext reference"（超文本引用）的缩写，指定要跳转到的目标 URL 路径。在 Expo Router 中，路径对应 `app/` 目录下的文件结构。例如 `href="/login"` 对应 `app/login.tsx` 文件。
> - **`useAuth()`**：这不是 Expo Router 内置的 Hook，而是一个需要开发者自己实现的认证状态管理 Hook。常见实现方式包括使用 React Context、Redux、Zustand 等状态管理方案。
> - **提前返回（Early Return）**：代码中 `if (!user) { return <Redirect ... /> }` 是一种常见的设计模式。在条件不满足时提前返回，避免执行后续不必要的渲染逻辑。

> **基于经验建议：**
> - 使用 `<Redirect>` 组件时，它**不会**将当前页面添加到导航历史栈中。这意味着用户从重定向目标页面按"返回"时，不会回到被跳过的页面——这正是大多数场景下期望的行为。
> - `<Redirect>` 适合在组件的渲染阶段（render phase）使用，因为它本身就是一个 React 组件。但**不要**在事件处理函数（如 `onPress`）中使用它，那种场景应该使用 `useRouter` 的命令式方法。

---

## 使用 `useRouter` Hook（命令式重定向）

`useRouter` 是 `expo-router` 提供的核心 Hook，它返回一个路由器对象，包含多种导航方法。通过调用 `router.replace()` 方法，可以**命令式**地执行重定向操作。

### 导入方式

```tsx
import { useRouter } from 'expo-router';
```

### 基本用法

```tsx
import { Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

function MyScreen() {
  const router = useRouter();

  useFocusEffect(() => {
    // Call the replace method to redirect to a new route without adding to the history.
    // We do this in a useFocusEffect to ensure the redirect happens every time the screen
    // is focused.
    router.replace('/profile/settings');
  });

  return <Text>My Screen</Text>;
}
```

### 代码解析

| 代码部分 | 说明 |
|---------|------|
| `useRouter()` | 获取路由器实例。该实例提供了 `push`、`replace`、`back` 等导航方法。 |
| `useFocusEffect()` | 当页面获得焦点（即页面变为可见/活跃状态）时执行回调函数。这确保了每次进入该页面时重定向逻辑都会执行。 |
| `router.replace('/profile/settings')` | 用目标路由**替换**当前路由，不会在导航历史中添加新记录。 |

> **初学者须知：**
> - **`useRouter`**：Expo Router 提供的 Hook，返回的路由器对象是与应用导航系统交互的核心接口。可以把它想象成一个"导航遥控器"，通过调用不同方法来控制页面跳转。
> - **`useFocusEffect`**：类似于 React 的 `useEffect`，但只在页面处于焦点状态时触发。当一个页面从后台切换到前台、或首次进入时，回调函数会被执行。这来自 `expo-router` 的导出。
> - **`replace` vs `push`**：
>   - `router.replace(path)`：替换当前页面，**不会**在历史记录中新增条目。用户按"返回"时会跳过当前页面。
>   - `router.push(path)`：推入新页面，**会**在历史记录中新增条目。用户按"返回"时会回到之前的页面。
>   - 在重定向场景中，通常使用 `replace` 以避免产生多余的历史记录条目。

> **基于经验建议：**
> - `useFocusEffect` 内执行 `router.replace()` 是确保重定向在每次页面聚焦时都能触发的可靠方式。如果仅在 `useEffect` 中执行，当页面从后台恢复时可能不会重新触发重定向。
> - 命令式重定向非常适合在**事件处理**中使用，例如按钮点击后的条件跳转：
>   ```tsx
>   const handlePress = () => {
>     if (someCondition) {
>       router.replace('/other-page');
>     }
>   };
>   ```
> - 避免在 `useFocusEffect` 中执行耗时操作后再重定向，这会导致用户短暂看到当前页面内容（闪烁）。如果需要先做异步检查，建议配合加载状态（Loading State）使用。

---

## 两种重定向方式对比

| 对比维度 | `Redirect` 组件（声明式） | `useRouter` Hook（命令式） |
|---------|--------------------------|---------------------------|
| **使用方式** | 作为 JSX 组件返回 | 调用 `router.replace()` 方法 |
| **适用场景** | 渲染阶段的条件跳转（如未登录跳转） | 事件处理、副作用中的跳转 |
| **是否添加历史记录** | 否 | 否（使用 `replace` 时） |
| **执行时机** | 组件渲染时立即执行 | 调用方法时立即执行 |
| **代码风格** | 声明式，更直观 | 命令式，更灵活 |
| **异步支持** | 不支持（渲染阶段不能做异步操作） | 支持（可在异步回调中调用） |

> **基于文档内容推导：**
> - 如果你的重定向逻辑仅依赖同步条件（如认证状态、权限标记），优先使用 `<Redirect>` 组件，代码更简洁可读。
> - 如果你的重定向需要依赖异步操作结果（如 API 请求、数据库查询），或者需要在事件处理函数中触发，应使用 `useRouter` 的 `replace` 方法。
> - 两种方式在用户体验上是一致的（参见上方对比表中的"是否添加历史记录"行），可根据具体场景自由选择。

---

## 常见问题与注意事项

> **基于经验建议：**

1. **避免无限重定向循环**：确保重定向的目标页面不会再重定向回原页面。例如，如果未登录用户被重定向到 `/login`，那么 `/login` 页面不应该在用户未登录时又重定向回首页。

2. **配合布局路由使用**：在 `app/_layout.tsx` 中使用 `<Redirect>` 可以实现全局认证守卫（Auth Guard），在应用级别统一管理登录状态和路由权限。

3. **深层链接（Deep Linking）场景**：当用户通过外部链接直接进入应用某个页面时，可能需要在多个层级进行重定向判断。建议将重定向逻辑集中在布局文件中处理。

4. **`Redirect` 组件的 `href` 属性**：支持字符串路径，也支持对象形式的路由配置（包含 `pathname`、`params` 等字段），方便在跳转时传递路由参数。

---

## 文档导航

- **上一页**：[sitemap](./86__sitemap.md)
- **下一页**：[link preview](./88__link-preview.md)
