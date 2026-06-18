# URL 参数（URL Parameters）

> 原文地址：https://docs.expo.dev/router/reference/url-parameters/

本指南详细介绍了在 Expo Router 应用中获取和修改 **搜索参数（search params）** 与 **路由参数（route params）** 的方法，以及相关的 Hook 使用方式。

---

## 核心概念速览

> **给初学者的说明**：
> - **URL 参数（URL Parameters）**：URL 中携带的额外信息，分为两大类——路由参数和搜索参数。
> - **路由参数（Route Parameters）**：路径中的动态片段，例如 `/user/evanbacon` 中的 `evanbacon`。它通过方括号命名的文件（如 `[user].tsx`）来定义，用于匹配特定的视图。
> - **搜索参数（Search Parameters）**：URL 中 `?` 后面的查询字符串，例如 `/search?query=hello` 中的 `query=hello`。通常用于在视图之间传递可选数据。
> - **Hook**：React 中一种特殊的函数，允许在函数组件中使用状态和其他 React 特性。Expo Router 提供了 `useLocalSearchParams` 和 `useGlobalSearchParams` 两个 Hook。
> - **局部状态 vs 全局状态（Local vs Global State）**：在堆栈导航（Stack Navigation）中，多个视图会同时保留在内存中。"局部"指的是当前活跃视图的参数，"全局"指的是整个导航栈中所有视图共享的参数。

---

## 一、路由参数与搜索参数的区别

### 路由参数（Route Parameters）

路由参数是路径中基于动态片段（dynamic segment）的值。例如，在路径 `/user/evanbacon` 中，`evanbacon` 就是一个路由参数，它对应 `[user].tsx` 文件中的 `user` 字段。路由参数用于匹配和标识特定的视图。

### 搜索参数（Search Parameters）

搜索参数是追加在 URL 路径后面的查询字符串（query string），以 `?` 开头。例如，在 `/search?query=hello&page=2` 中，`query` 和 `page` 都是搜索参数。搜索参数通常用于在视图之间传递可选的附加数据。

> **基于文档内容推导**：路由参数是"必须的"——没有它就无法匹配到对应的动态路由；而搜索参数是"可选的"——即使不传，页面也能正常渲染。

---

## 二、局部状态 vs 全局状态

堆栈导航器（Stack Navigator）会将多个视图同时保留在内存中。Expo Router 提供了两个 Hook 来读取参数：

| Hook | 作用域 | 更新时机 | 适用场景 |
|------|--------|----------|----------|
| `useLocalSearchParams()` | 当前活跃的视图 | 仅当 URL 匹配当前视图时更新 | 大多数场景的首选 |
| `useGlobalSearchParams()` | 整个应用的所有视图 | 任何参数变化都会触发更新 | 需要全局同步时 |

两个 Hook 的 TypeScript 类型完全一致，但**更新频率不同**。

> **给初学者的说明**：
> - **重新渲染（Re-render）**：当状态变化时，React 会重新执行组件函数来更新界面。如果一个后台（不在栈顶）的视图因为全局参数变化而重新渲染，就会造成不必要的性能开销。
> - **堆栈（Stack）**：想象一摞盘子——新页面放在最上面，返回时拿走最上面的盘子。堆栈中可能同时存在多个页面。

> **基于经验建议**：在绝大多数情况下，应优先使用 `useLocalSearchParams()`。`useGlobalSearchParams()` 会导致堆栈中所有匹配的视图都重新渲染，在栈较深时可能造成明显的性能问题。只有当你确实需要在后台视图响应参数变化时才使用全局 Hook。

---

### 完整示例：局部与全局参数的行为差异

**目录结构：**

```text
src/app/_layout.tsx
src/app/index.tsx
src/app/[user].tsx
```

**根布局文件（`src/app/_layout.tsx`）：**

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

**初始重定向（`src/app/index.tsx`）：**

```tsx
import { Redirect } from 'expo-router';

export default function Route() {
  return <Redirect href="/evanbacon" />;
}
```

**动态路由页面（`src/app/[user].tsx`）：**

```tsx
import { Text, View } from 'react-native';
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';

const friends = ['charlie', 'james']

export default function Route() {
  const glob = useGlobalSearchParams();
  const local = useLocalSearchParams();

  console.log("Local:", local.user, "Global:", glob.user);

  return (
    <View>
      <Text>User: {local.user}</Text>
      {friends.map(friend => (
        <Link key={friend} href={`/${friend}`}>
          Visit {friend}
        </Link>
      ))}
    </View>
  );
}
```

### 控制台输出分析

**第一次进入 `/evanbacon` 时：**

```sh
Local: evanbacon Global: evanbacon
```

**点击链接跳转到 `/charlie` 后：**

```sh
Local: charlie Global: charlie
Local: evanbacon Global: charlie
```

> **给初学者的说明**：出现了两行日志——第一行来自栈顶的 `charlie` 视图，第二行来自栈中仍然存活的 `evanbacon` 视图。注意：`evanbacon` 视图的 `local.user` 仍然是 `evanbacon`（局部值未变），但 `glob.user` 已经变成了 `charlie`（全局值已更新）。

**再点击链接跳转到 `/james` 后：**

```sh
Local: james Global: james
Local: evanbacon Global: james
Local: charlie Global: james
```

> **给初学者的说明**：此时栈中有三个视图（`evanbacon`、`charlie`、`james`）。全局 Hook 触发了所有后台视图的重新渲染——`evanbacon` 和 `charlie` 视图都打印了新的全局值 `james`，但各自的局部值保持不变。

### 行为总结

- **全局 Hook（`useGlobalSearchParams`）** 会触发后台视图的更新，按堆栈顺序依次执行，可能影响性能。
- **局部 Hook（`useLocalSearchParams`）** 会保留视图之前的数据，非常适合在返回导航时保持状态不变。

> **基于经验建议**：如果你的页面中有较重的计算或复杂的动画，使用全局 Hook 导致的后台重新渲染可能会引发卡顿。建议默认使用局部 Hook，只在确实需要跨视图同步参数时才考虑全局 Hook。

---

## 三、静态类型（Static Typing）

`useLocalSearchParams` 和 `useGlobalSearchParams` 都支持通过 TypeScript 泛型（Generics）来获得类型安全。

> **给初学者的说明**：
> - **泛型（Generics）**：TypeScript 中的一种类型参数机制，允许你在调用函数时指定返回值的类型。例如 `useLocalSearchParams<{ user: string }>()` 告诉 TypeScript：返回值中一定有一个 `user` 字段，且它是 `string` 类型。
> - **类型安全（Type Safety）**：在编写代码时就能发现类型错误，而不是等到运行时才崩溃。

### 基本类型标注

标准的路由参数返回值为 `string` 类型：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Route() {
  const { user } = useLocalSearchParams<{ user: string }>();

  return <Text>User: {user}</Text>;
}
```

### 可选的搜索参数

搜索参数是可选的，应使用 `?` 标记为可选属性：

```tsx
const { user, query } = useLocalSearchParams<{ user: string; query?: string }>();
```

> **给初学者的说明**：
> - 路由参数（如 `user`）是**必选的**——只要匹配到了 `[user].tsx` 路由，就一定有值。
> - 搜索参数（如 `query`）是**可选的**——URL 中可能没有 `?query=xxx`，因此用 `?` 标记为可选，其值可能为 `undefined`。

### Rest 语法（捕获剩余路径段）

使用 rest 语法定义的路由参数会返回 `string[]`（字符串数组）类型：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Route() {
  const { everything } = useLocalSearchParams<{
    everything: string[];
  }>();
  const user = everything[0];

  return <Text>User: {user}</Text>;
}
```

> **给初学者的说明**：
> - **Rest 语法**：在文件命名中使用 `[...everything].tsx` 这样的格式，可以捕获多层路径段。例如 `/a/b/c` 会被捕获为 `['a', 'b', 'c']`。
> - 这种模式常用于"通配符路由"（Catch-all Route），即一个路由文件匹配任意深度的路径。

### Rest 语法配合搜索参数

Rest 语法和搜索参数可以同时使用：

```tsx
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Route() {
  const { everything } = useLocalSearchParams<{
    everything: string[];
    query?: string;
    query2?: string;
  }>();
  const user = everything[0];

  return <Text>User: {user}</Text>;
}
```

---

## 四、修改参数（Modifying Parameters）

Expo Router 提供了 `router.setParams()` 命令式 API 来修改当前页面的参数，**不会在导航历史中添加新条目**。

> **给初学者的说明**：
> - **`router.setParams()`**：直接修改当前 URL 的参数部分，不会触发页面跳转，也不会增加导航历史。类似于在浏览器中修改 URL 的 query 字符串但不刷新页面。
> - **命令式 API（Imperative API）**：通过直接调用函数来执行操作的方式，区别于声明式（Declarative）的 JSX 写法。

### 在文本输入中修改搜索参数

```tsx
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function Page() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(params.query);

  return (
    <TextInput
      value={search}
      onChangeText={search => {
        setSearch(search);
        router.setParams({ query: search });
      }}
      placeholderTextColor="#A0A0A0"
      placeholder="Search"
      style={{
        borderRadius: 12,
        backgroundColor: '#fff',
        fontSize: 24,
        color: '#000',
        margin: 12,
        padding: 16,
      }}
    />
  );
}
```

> **基于经验建议**：在使用 `TextInput` 配合 `router.setParams()` 时，建议同时维护一个本地 `useState` 状态（如上方代码所示），这样可以保证输入框的即时响应，而 `setParams` 则用于将参数同步到 URL 上（方便分享链接或刷新后恢复状态）。

### 在点击事件中修改路由参数

```tsx
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from 'react-native';

export default function User() {
  const params = useLocalSearchParams<{ user: string }>();

  return (
    <>
      <Text>User: {params.user}</Text>
      <Text onPress={() => router.setParams({ user: 'evan' })}>Go to Evan</Text>
    </>
  );
}
```

---

## 五、路由参数与搜索参数的使用差异

### 核心区别

| 特性 | 路由参数（Route Params） | 搜索参数（Search Params） |
|------|--------------------------|--------------------------|
| 用途 | 标识视图 | 传递可选数据 |
| 是否可为 null | 匹配到时永远不为 null | 可以为 undefined |
| 修改后的效果 | **组件会重新挂载（remount）** | 组件不会重新挂载 |

> **给初学者的说明**：
> - **重新挂载（Remount）**：组件被完全销毁后重新创建。这意味着组件内的所有状态（state）、副作用（effect）都会重置。这是一个重要的行为差异。
> - 修改路由参数（如从 `/evan` 变为 `/mark`）等同于跳转到一个完全不同的页面——React 会重新创建组件。
> - 修改搜索参数（如从 `?tab=1` 变为 `?tab=2`）只是更新参数值，组件实例保持不变。

### 同时访问两种参数

**目录结构：**

```text
src/app/index.tsx
src/app/[user].tsx
```

**代码示例：**

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function User() {
  const {
    user,
    tab,
  } = useLocalSearchParams<{ user: string; tab?: string }>();

  console.log({ user, tab });
}
```

### 触发重新挂载的方式

以下三种方式修改路由参数时，都会导致组件重新挂载：

```tsx
import { Text } from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';

export default function User() {
  return (
    <>
      <Text onPress={() => router.setParams({ user: 'evan' })}>Go to Evan</Text>
      <Text onPress={() => router.push('/mark')}>Go to Mark</Text>
      <Link href="/charlie">Go to Charlie</Link>
    </>
  );
}
```

> **基于经验建议**：如果你需要在"用户详情页"之间切换，且希望保留页面内的滚动位置、表单输入等局部状态，应避免通过修改路由参数的方式切换，而是考虑使用搜索参数来标识当前展示的子内容，或采用其他状态管理方案。

---

## 六、Hash 片段（Hash Fragments）

Expo Router 将 URL 中的 Hash 片段（即 `#` 后面的部分）视为一种"特殊的搜索参数"，可以通过相同的 Hook 来访问和修改。

> **给初学者的说明**：
> - **Hash 片段（Hash Fragment）**：URL 中 `#` 符号后面的部分，例如 `/page#section-2` 中的 `section-2`。在 Web 开发中常用于页面内的锚点定位。
> - 在 Expo Router 中，Hash 片段使用特殊键名 `'#'` 来访问。

```tsx
import { Text } from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';

export default function User() {
  const { '#': hash } = useLocalSearchParams<{ '#': string }>();

  return (
    <>
      <Text onPress={() => router.setParams({ '#': 'my-hash' })}>Set a new hash</Text>
      <Text onPress={() => router.push('/#my-hash')}>Push with a new hash</Text>
      <Link href="/#my-hash">Link with a hash</Link>
    </>
  );
}
```

---

## 七、受限的参数名称（Restricted Names）

为避免与底层导航库的内部实现产生冲突，以下关键字**不得**用作用户自定义的参数名称：

| 禁止使用的参数名 | 说明 |
|------------------|------|
| `screen` | 导航库内部用于标识屏幕 |
| `params` | 导航库内部用于传递参数 |
| `initial` | 导航库内部用于标识初始路由 |
| `state` | 导航库内部用于管理导航状态 |

> **基于经验建议**：在定义路由参数和搜索参数时，应选择具有业务含义的名称（如 `userId`、`searchQuery`、`category`），避免使用过于通用的名称。这不仅能够规避上述冲突，还能提高代码的可读性。

---

## 要点总结

1. **路由参数**（路径中的动态段）用于标识视图，修改后会触发组件重新挂载。
2. **搜索参数**（查询字符串）用于传递可选数据，修改后组件不会重新挂载。
3. **优先使用 `useLocalSearchParams()`**，仅在需要全局同步时使用 `useGlobalSearchParams()`。
4. 使用 TypeScript 泛型为参数添加类型标注，获得更好的开发体验。
5. 使用 `router.setParams()` 修改参数不会新增导航历史条目。
6. Hash 片段通过特殊键名 `'#'` 访问，行为与搜索参数类似。
7. 避免使用 `screen`、`params`、`initial`、`state` 作为参数名称。

---

## 文档导航

- **上一页**：[error handling](./83__error-handling.md)
- **下一页**：[color](./85__color.md)
