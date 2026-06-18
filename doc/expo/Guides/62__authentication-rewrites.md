# 使用重定向实现 Expo Router 身份认证

> **原文地址**：https://docs.expo.dev/router/advanced/authentication-rewrites/

---

## 重要提示

> **SDK 53 引入了更新的「受保护路由」（Protected Routes）方案**（参见 [Protected routes](https://docs.expo.dev/router/advanced/protected/)），本文档所述的重定向方式主要适用于 **SDK 52 及更早版本**。如果你正在使用 SDK 53 或更高版本，建议优先阅读受保护路由的文档。

---

## 概述

Expo Router 默认会暴露（expose）所有路由，这意味着任何用户都可以直接访问应用中的任意页面。因此，开发者必须在**运行时**进行检查，将未授权的用户重定向到登录页面。

本文介绍如何利用**重定向（redirects）** 的方式来实现身份认证和路由保护。

> **关键术语解释（面向初学者）**：
>
> - **路由（Route）**：应用中一个页面对应的路径，例如 `/sign-in` 就是一个路由。
> - **重定向（Redirect）**：将用户从一个页面自动跳转到另一个页面。例如未登录时自动跳转到登录页。
> - **React Context**：React 提供的一种全局状态管理机制，可以在组件树中共享数据，无需逐层传递 props。
> - **Route Group（路由分组）**：Expo Router 中用括号命名的目录（如 `(app)`），用于对路由进行逻辑分组，不会出现在 URL 路径中。
> - **Slot**：Expo Router 的 `<Slot />` 组件，用于在布局（Layout）中渲染子路由，类似于 React Navigation 中的导航器容器。
> - **Layout（布局）**：控制页面结构和导航行为的组件，`_layout.tsx` 文件定义了路由的布局方式。
> - **Deep Link（深度链接）**：通过 URL 直接打开应用内部的某个特定页面，而不仅仅是应用首页。

---

## 视频教程

如需直观的视觉引导，可参考视频教程：[Building an Auth Flow with Expo Router](https://www.youtube.com/watch?v=yNaOaR2kIa0)。

---

## 使用 React Context 和路由分组（Route Groups）

限制路由访问权限的高效方式是将 **React Context Provider**（参见 [React Context 官方文档](https://react.dev/reference/react/createContext)）与 **Route Group（路由分组）** 结合使用。

### 推荐目录结构

推荐的项目结构是：将一个公开的登录页面文件与一个 `(app)` 目录分开，`(app)` 目录内部负责强制授权检查。

```text
app
  _layout.tsx
  sign-in.tsx          # 始终可访问（公开页面）
  (app)
    _layout.tsx        # 保护子路由（需要授权）
    index.tsx          # 需要授权才能访问
```

> **关键术语解释（面向初学者）**：
>
> - **`(app)` 目录**：这是一个路由分组（Route Group）。括号命名意味着这个目录名不会出现在 URL 中。例如 `app/(app)/index.tsx` 对应的 URL 仍然是 `/`，而不是 `/app`。这样可以在不影响 URL 结构的前提下，对该组内的所有路由统一进行权限检查。

### 第一步：创建 Session Context Provider

开发者应建立一个 Context Provider 来在全局范围内共享会话（session）数据。下面的示例使用了一个 mock 实现，你也可以替换为自己的 [authentication provider](https://docs.expo.dev/guides/authentication/)。

```tsx
import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// 此 Hook 可用于获取用户信息。
export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          // 在此执行登录逻辑
          setSession('xxx');
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
```

> **关键术语解释（面向初学者）**：
>
> - **`createContext`**：React 的 API，用于创建一个 Context 对象。Context 允许数据在组件树中"穿透"传递，而不需要通过每一层组件手动传 props。
> - **`PropsWithChildren`**：TypeScript 类型，表示组件接受 `children` 属性（即嵌套在组件标签内部的子元素）。
> - **`useSession` Hook**：一个自定义 Hook，封装了 `useContext(AuthContext)`，方便在任何组件中获取当前的登录状态（`session`）、加载状态（`isLoading`）、以及登录/登出方法（`signIn`/`signOut`）。

### 第二步：安全持久化存储 Hook

下面的自定义 Hook 利用 [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) 实现了跨原生和 Web 平台的安全 Token 持久化。

```tsx
import { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (process.env.EXPO_OS === 'web') {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // 公开接口
  const [state, setState] = useAsyncState<string>();

  // 读取
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then((value: string | null) => {
        setState(value);
      });
    }
  }, [key]);

  // 写入
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
```

> **关键术语解释（面向初学者）**：
>
> - **`expo-secure-store`**：Expo 提供的安全存储库，在原生平台上使用系统级加密存储（iOS Keychain / Android Keystore），比普通的 `AsyncStorage` 更安全，适合存储 Token 等敏感数据。
> - **`useReducer`**：React 的状态管理 Hook，类似于 `useState`，但更适合管理复杂的状态逻辑。这里用它来同时管理"加载中"和"值"两个状态。
> - **`Platform.OS`**：React Native 提供的 API，用于判断当前运行平台是 `'ios'`、`'android'` 还是 `'web'`。
> - **`process.env.EXPO_OS`**：Expo 的环境变量，在构建时确定运行平台。此处用于区分 Web 和原生平台。
>
> **基于文档内容推导**：该 Hook 的设计模式是 `[加载中状态, 实际值]` 的二元组，其中第一个布尔值表示数据是否仍在加载中（`true` = 加载中），第二个值为实际的存储数据。这种设计可以在 UI 层清晰地区分"正在读取 Token"和"Token 不存在"两种情况。

### 第三步：根布局（Root Layout）

根布局必须将应用包裹在 Session Provider 中，并渲染 Slot 组件，以确保在任何导航事件触发之前，导航器已经就绪。

```tsx
import { Slot } from 'expo-router';
import { SessionProvider } from '../ctx';

export default function Root() {
  // 设置 Auth Context 并在其中渲染布局
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
```

> **关键术语解释（面向初学者）**：
>
> - **`<Slot />`**：Expo Router 提供的组件，作用是在布局中渲染当前匹配的子路由。你可以把它理解为一个"占位符"，告诉框架"在这里显示子页面"。
> - **根布局（Root Layout）**：位于 `app/_layout.tsx` 的布局组件，是整个应用的最外层布局，所有页面都渲染在它内部。

### 第四步：受保护的布局（Protected Layout）

`(app)` 目录下的嵌套 [布局路由](https://docs.expo.dev/router/basics/navigation-layouts/) 负责验证授权状态。如果没有活跃会话，则显示加载指示器或重定向到登录页面。

```tsx
import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '../../ctx';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  // 你可以保持闪屏（splash screen）打开，或像这里一样渲染一个加载页面。
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // 仅在 (app) 分组的布局内要求认证，因为用户
  // 需要能够访问 (auth) 分组并重新登录。
  if (!session) {
    // 在 Web 端，静态渲染将在此停止，因为用户
    // 在用于渲染页面的无头 Node 进程中未经过认证。
    return <Redirect href="/sign-in" />;
  }

  // 此布局可以延迟渲染，因为它不是根布局。
  return <Stack />;
}
```

> **关键术语解释（面向初学者）**：
>
> - **`<Redirect href="/sign-in" />`**：Expo Router 的组件，渲染时会自动将用户重定向到指定的路由。这里用于将未登录用户跳转到登录页。
> - **`<Stack />`**：Expo Router 的堆栈导航器，以堆栈方式管理子路由的导航（新页面压入栈顶，返回时弹出）。
> - **静态渲染（Static Rendering）**：在 Web 端，Expo Router 会在构建时使用 Node.js 预渲染页面。由于 Node 进程中没有用户会话，静态渲染会在认证检查处停止。
>
> **基于经验建议**：`isLoading` 状态非常关键。如果在 Token 尚未从安全存储中读取完毕时就判断 `session` 为 `null`，会导致已登录用户被错误地重定向到登录页。务必等待加载完成后再做授权判断。

### 第五步：登录页面

登录界面位于受保护分组之外，因此可以公开访问。页面提供一个按钮来触发认证函数。

```tsx
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useSession } from '../ctx';

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          signIn();
          // 登录后导航跳转。你可能需要调整此处以确保登录成功后再跳转。
          router.replace('/');
        }}>
        Sign In
      </Text>
    </View>
  );
}
```

> **关键术语解释（面向初学者）**：
>
> - **`router.replace('/')`**：用新路由替换当前路由（不保留历史记录）。与 `router.push('/')` 不同，`replace` 不会在导航历史中留下记录，用户按返回键不会回到登录页。

### 第六步：已认证页面（退出登录）

已认证的视图提供终止会话的机制。

```tsx
import { Text, View } from 'react-native';

import { useSession } from '../../ctx';

export default function Index() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          // `app/(app)/_layout.tsx` 会自动重定向到登录页面。
          signOut();
        }}>
        Sign Out
      </Text>
    </View>
  );
}
```

> **基于文档内容推导**：退出登录后无需手动导航到登录页——因为 `(app)/_layout.tsx` 中的授权检查会检测到 `session` 变为 `null`，自动触发 `<Redirect href="/sign-in" />`。这是一种声明式（declarative）的认证管理模式。

### 本方案的能力总结

以上配置可以成功管理以下场景：

- 初始加载状态（Token 读取中的等待）
- 未授权用户的重定向
- 深度链接（Deep Link）的正确处理

---

## 替代加载状态（Alternative Loading States）

除了使用简单的文字加载器（如 `<Text>Loading...</Text>`），开发者还可以使用主入口页面（index）作为加载画面，并将实际的首页内容移至其他路由。

> **基于经验建议**：在实际项目中，建议使用品牌化的加载页面（如带 Logo 的闪屏）来代替纯文字加载提示，以提升用户体验。可以通过自定义 Splash Screen 或使用 `expo-splash-screen` 模块来实现。

---

## 模态框与逐路由认证（Modals and Per-Route Authentication）

将登录页以模态框（Modal）的形式覆盖在应用之上，可以保留深度链接的目标路由。但这种方式要求后台路由能够在无授权的情况下处理数据加载。

### 目录结构

```text
app
  _layout.tsx            # 声明全局 Session Context
  (app)
    _layout.tsx
    sign-in.tsx          # 以模态框形式覆盖在根路由上
    (root)
      _layout.tsx        # 保护子路由
      index.tsx          # 需要授权才能访问
```

### 布局代码

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: '(root)',
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(root)" />
      <Stack.Screen
        name="sign-in"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

> **关键术语解释（面向初学者）**：
>
> - **模态框（Modal）**：一种覆盖在当前页面上方的 UI 层，通常需要用户交互后才能返回下层页面。在 Expo Router 中通过 `presentation: 'modal'` 配置实现。
> - **`unstable_settings`**：Expo Router 的实验性配置项，`anchor` 指定了路由的锚点。这里设为 `(root)` 表示以 `(root)` 分组作为主内容锚点。
> - **`presentation: 'modal'`**：Stack 导航器的屏幕选项，指定该路由以模态框形式呈现（从底部滑入覆盖）。
>
> **基于经验建议**：模态框认证方式的优势在于用户通过深度链接进入应用时，目标页面已在后台加载。一旦登录成功，模态框关闭，用户直接看到目标页面——体验更加流畅。但要注意后台页面的数据请求需要做好未授权情况的容错处理。

---

## 无导航器的导航问题（Navigating without Navigation）

如果在 [根布局（Root Layout）](https://docs.expo.dev/router/basics/navigation-layouts/#root-layout) 挂载之前尝试执行导航操作，将会出现以下错误：

```text
Error: Attempted to navigate before mounting the Root Layout component.
Ensure the Root Layout component is rendering a Slot, or other navigator on the first render.
```

> **翻译**：错误：尝试在根布局组件挂载之前进行导航。请确保根布局组件在首次渲染时就渲染了 Slot 或其他导航器。

### 错误做法

问题出在将条件渲染逻辑直接放在根布局中：

```text
app
  _layout.tsx
  about.tsx
```

```tsx
export default function RootLayout() {
  React.useEffect(() => {
    // 此导航事件将触发上述错误。
    router.push('/about');
  }, []);

  // 这个条件语句会造成问题，因为根布局的内容（Slot）
  // 必须在任何导航事件发生之前挂载。
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <Slot />;
}
```

> **基于文档内容推导**：根本原因是——当 `isLoading` 为 `true` 时，`<Slot />` 不会被渲染，这意味着导航器尚未挂载。而此时 `useEffect` 中的 `router.push('/about')` 已经触发，框架找不到已挂载的导航器来处理导航事件，因此报错。

### 正确做法

保持根布局简洁，将条件逻辑下移到嵌套分组中：

```text
app
  _layout.tsx
  (app)
    _layout.tsx          # 将条件逻辑下移一层
    about.tsx
```

**根布局**（保持简洁，始终渲染 Slot）：

```tsx
export default function RootLayout() {
  return <Slot />;
}
```

**嵌套布局**（在此处放置条件逻辑）：

```tsx
export default function RootLayout() {
  React.useEffect(() => {
    router.push('/about');
  }, []);

  // 延迟渲染此嵌套布局的内容是可以的。我们不能
  // 延迟渲染根布局的内容，因为导航事件（重定向）
  // 会在根布局内容挂载之前就被触发。
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <Slot />;
}
```

> **基于经验建议**：这条规则非常重要——**根布局必须在首次渲染时无条件地渲染 `<Slot />` 或其他导航器组件**。任何条件判断（如加载中、未登录等）都应该放到嵌套布局中处理。违反此规则是 Expo Router 初学者最常遇到的错误之一。

---

## 中间件（Middleware）

在传统 Web 开发中，通常使用**服务端中间件**来实现重定向（例如在服务器端检查 Cookie 并决定是否跳转）。

> **限制说明**：目前 Expo Router 的 Web 支持仅处理**静态生成（Static Generation）**，不支持自定义中间件。因此，客户端重定向和加载状态管理仍然是必要的解决方式。

> **关键术语解释（面向初学者）**：
>
> - **中间件（Middleware）**：在请求到达最终处理程序之前执行的代码层。在传统 Web 框架（如 Express.js、Next.js）中，中间件可以在服务器端拦截请求、检查认证状态并执行重定向。
> - **静态生成（Static Generation）**：在构建时预渲染页面为 HTML 文件，而非在每次请求时动态渲染。Expo Router 的 Web 端目前采用这种方式。
>
> **基于文档内容推导**：由于缺乏服务端中间件支持，Expo Router 的认证方案本质上是**客户端认证**——页面先加载，再由 JavaScript 检查状态并决定是否重定向。这意味着在某些场景下（如 SEO 敏感页面），可能存在短暂的未授权内容闪烁（flash of unauthorized content）。

---

## 完整流程总结

| 步骤 | 文件 | 职责 |
|------|------|------|
| 1 | `ctx.tsx`（SessionProvider） | 创建全局认证 Context，管理登录/登出状态 |
| 2 | `useStorageState.ts` | 安全持久化存储会话 Token |
| 3 | `app/_layout.tsx`（根布局） | 用 SessionProvider 包裹应用，始终渲染 Slot |
| 4 | `app/(app)/_layout.tsx`（受保护布局） | 检查认证状态，未登录时重定向 |
| 5 | `app/sign-in.tsx`（登录页） | 公开的登录界面 |
| 6 | `app/(app)/index.tsx`（首页） | 需要认证才能访问的页面 |

---

## 文档导航

- **上一页**：[authentication](./61__authentication.md)
- **下一页**：[nesting navigators](./63__nesting-navigators.md)
