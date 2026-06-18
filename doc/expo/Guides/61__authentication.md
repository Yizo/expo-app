# Expo Router 中的身份认证（Authentication）

> **原文地址**：https://docs.expo.dev/router/advanced/authentication/

> **重要提示**：SDK 52 及更早版本使用的是不同的重定向方式。如果你使用的是 SDK 52 或更旧版本，请参阅 [Authentication (redirects)]（身份认证重定向）文档。

---

## 概述

在 Expo Router 中，每一个路由（页面路径）默认都是**可访问的**——框架不会自动阻止用户访问任何页面。因此，开发者需要在**运行时**手动检查用户的身份认证状态，并将未认证的用户重定向到受限区域之外。

本文档介绍的是**原生应用的标准身份认证方案**，主要包含两种核心技术：

1. **受保护路由（Protected Routes）**：使用 `Stack.Protected` 组件阻止未认证用户访问特定页面
2. **模态框认证（Modal Authentication）**：以模态框形式展示登录界面，允许保留深层链接目标

### 关键术语解释（面向初学者）

| 术语 | 说明 |
|------|------|
| **路由（Route）** | 应用中的一个页面路径，如 `/sign-in` 或 `/home`，类似网站中的 URL 地址 |
| **布局（Layout）** | 控制一组路由如何显示的外层容器，通常以 `_layout.tsx` 文件定义 |
| **深层链接（Deep Link）** | 直接指向应用内部某个特定页面的链接，例如从外部浏览器打开应用并直接跳转到某个商品详情页 |
| **会话（Session）** | 用户登录后服务器返回的凭证（通常是 token），用于标识"这个用户已经登录了" |
| **React Context** | React 提供的一种全局状态共享机制，可以让任意深层的组件访问共享数据（如登录状态），而无需逐层传递 props |
| **SecureStore** | Expo 提供的安全存储模块，在原生设备上使用加密方式存储敏感数据（如 token） |
| **SplashScreen** | 应用启动时显示的闪屏/启动画面，通常在异步初始化完成前保持显示 |
| **guard（守卫）** | `Stack.Protected` 组件的一个属性，接受布尔值，用于决定某个路由是否允许访问 |

---

## 使用受保护路由（Using Protected Routes）

受保护路由的核心作用是**阻止客户端对特定页面的未授权访问**。当一个未认证的用户尝试访问受保护页面时（或在页面已打开的情况下认证状态发生变化），系统会自动将用户**重定向到初始路由或导航栈中的第一个可用页面**。

### 推荐的项目文件结构

```
src/
├── app/
│   ├── _layout.tsx      ← 根布局文件（全局布局）
│   ├── sign-in.tsx      ← 登录页面（始终可访问）
│   └── (app)/           ← 需要认证的页面分组
│       ├── _layout.tsx  ← 应用内部布局
│       └── index.tsx    ← 应用主页
```

> **设计思路**：`sign-in.tsx` 放在 `(app)` 分组之外，因此它不受认证保护的限制，未认证用户也可以访问。`(app)` 分组内的所有页面都需要用户登录后才能查看。

### 第一步：创建身份认证上下文（Auth Context）

> **基于经验建议**：使用 React Context 共享认证状态是 Expo Router 官方推荐的标准做法。将认证逻辑抽离到独立的 Context 文件中，可以让代码更加清晰和可维护。

以下代码创建了一个身份认证上下文 Provider，使用的是模拟登录逻辑（mock），你可以在实际项目中替换为真实的认证方案。

#### 认证上下文文件（`ctx.tsx`）

```tsx
import { use, createContext, type PropsWithChildren } from 'react';

import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
} | null>(null);

// 使用这个 hook 来获取用户信息
export function useSession() {
  const value = use(AuthContext);
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
          // 在这里执行实际的登录逻辑
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

**代码解析**：

- `AuthContext`：使用 `createContext` 创建一个上下文，包含 `signIn`（登录）、`signOut`（登出）、`session`（会话标识）和 `isLoading`（加载状态）四个属性。
- `useSession()`：自定义 hook，让任意组件都能方便地访问认证状态。如果该 hook 没有被 `SessionProvider` 包裹，会抛出错误——这是为了防止误用。
- `SessionProvider`：上下文提供者组件，负责管理实际的认证状态，并将其传递给所有子组件。

### 第二步：创建安全存储 Hook（`useStorageState`）

以下 hook 用于在原生设备上通过 `expo-secure-store` 安全地持久化存储 token，在 Web 环境中则使用 `localStorage`。

> **关键术语**：`expo-secure-store` 是 Expo SDK 提供的安全存储模块，它利用操作系统级别的加密机制（iOS 的 Keychain、Android 的 Keystore）来存储敏感数据，比普通的 AsyncStorage 更安全。

#### 存储 Hook 文件（`useStorageState.tsx`）

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
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
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
  // 公共状态
  const [state, setState] = useAsyncState<string>();

  // 读取：从存储中获取值
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

  // 写入：将值保存到存储中
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

**代码解析**：

- `useAsyncState`：自定义 reducer，返回一个 `[boolean, T | null]` 元组，其中 `boolean` 表示是否正在加载（首次读取时为 `true`）。
- `setStorageItemAsync`：跨平台存储写入函数。在 Web 端使用 `localStorage`，在原生端使用 `SecureStore`。当 `value` 为 `null` 时执行删除操作。
- `useStorageState`：核心 hook，封装了读取和写入逻辑，返回 `[state, setValue]`，与 `useState` 的使用方式类似，但自带持久化能力。

### 第三步：管理闪屏（Splash Screen）

由于身份认证检查是**异步操作**（需要从安全存储中读取 token），在检查完成之前必须保持闪屏显示，否则用户可能会短暂看到受保护的页面内容。

#### 闪屏控制器文件（`splash.tsx`）

```tsx
import { SplashScreen } from 'expo-router';
import { useSession } from './ctx';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}
```

**代码解析**：

- `SplashScreen.preventAutoHideAsync()`：在模块加载时立即调用，阻止闪屏自动隐藏。这确保了即使应用加载很快，闪屏也会持续显示直到我们手动隐藏它。
- `SplashScreenController`：监听认证加载状态，当 `isLoading` 变为 `false`（即认证状态已确定）时，手动隐藏闪屏。

> **基于经验建议**：不要跳过闪屏管理步骤。如果不控制闪屏，在应用启动时可能会出现"闪一下"受保护页面的问题，造成不好的用户体验，甚至在极端情况下泄露敏感信息。

### 第四步：在根布局中集成认证

根布局（`_layout.tsx`）需要将整个应用包裹在 `SessionProvider` 中，并包含闪屏控制器，使所有子路由都能访问认证状态。

#### 根布局文件（`app/_layout.tsx`）

```tsx
import { Stack } from 'expo-router';

import { SessionProvider } from '@/ctx';
import { SplashScreenController } from '@/splash';

export default function Root() {
  // 设置认证上下文并渲染布局
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

// 创建一个新组件，使其能够访问 SessionProvider 的上下文
function RootNavigator() {
  return <Stack />;
}
```

> **注意**：`RootNavigator` 被单独提取为一个组件，这是因为 `useSession()` 必须在 `SessionProvider` 内部使用。如果在 `Root` 组件中直接调用 `useSession()`，会抛出错误，因为 Context 只能被其子组件访问。

### 第五步：创建登录页面

登录页面位于受保护分组之外，因此其自身的布局和路由不受认证检查约束，未认证用户可以正常访问。

#### 登录页面文件（`app/sign-in.tsx`）

```tsx
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useSession } from '@/ctx';

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          signIn();
          // 登录成功后进行导航。你可能需要调整此处逻辑以确保登录成功后再导航。
          router.replace('/');
        }}>
        Sign In
      </Text>
    </View>
  );
}
```

### 第六步：在导航器中配置路由守卫

这是整个认证流程的核心——使用 `Stack.Protected` 组件的 `guard` 属性，根据当前会话状态来决定哪些路由可以访问。

#### 更新根导航器（在 `app/_layout.tsx` 中）

```tsx
// 所有导入语句保持不变，额外需要从 ctx.tsx 导入 useSession
import { SessionProvider, useSession } from '@/ctx';

// 以上代码保持不变。更新 RootNavigator 以根据 SessionProvider 的状态保护路由。

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
```

**代码解析**：

- `<Stack.Protected guard={!!session}>`：当 `session` 存在（用户已登录）时，`guard` 为 `true`，允许访问 `(app)` 分组下的所有页面。`!!session` 是将 `session` 转为布尔值的写法——如果 session 为非空字符串则为 `true`，`null` 或 `undefined` 则为 `false`。
- `<Stack.Protected guard={!session}>`：当 `session` 不存在（用户未登录）时，`guard` 为 `true`，允许访问 `sign-in` 页面。这意味着已登录的用户无法再次访问登录页面。
- 当 `guard` 为 `false` 时，用户将被**自动重定向**到导航栈中的初始路由或第一个可用页面。

> **基于文档内容推导**：`Stack.Protected` 的 `guard` 机制是双向保护的——它不仅阻止未登录用户访问受保护页面，还阻止已登录用户重复访问登录页面。这种设计确保了用户体验的流畅性。

### 第七步：创建认证后的主页

主页中提供登出功能，登出后导航器的守卫会自动将用户重定向回登录页面。

#### 主页文件（`app/(app)/index.tsx`）

```tsx
import { Text, View } from 'react-native';

import { useSession } from '@/ctx';

export default function Index() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          // RootNavigator 中的 guard 会将用户重定向回登录页面
          signOut();
        }}>
        Sign Out
      </Text>
    </View>
  );
}
```

### 第八步：应用内部布局

应用分组的布局文件简单地渲染认证区域内的导航栈。

#### 应用内部布局文件（`app/(app)/_layout.tsx`）

```tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  // 渲染所有已认证应用路由的导航栈
  return <Stack />;
}
```

### 受保护路由的整体行为总结

完成以上配置后，应用将具备以下行为：

1. **启动时显示闪屏**：闪屏持续显示，直到认证状态确定（用户已登录或未登录）
2. **自动重定向未认证用户**：未登录用户访问任何 `(app)` 下的页面时，会被自动重定向到 `sign-in` 页面
3. **深层链接处理**：当未认证用户通过深层链接访问受保护页面时，会被引导到登录页面

---

## 模态框认证与单路由保护（Modals and Per-Route Authentication）

另一种策略是在主界面之上以**模态框**的形式展示登录界面。这种方法的优势在于可以在用户登录后**保留深层链接的目标页面**。

> **基于文档内容推导**：与受保护路由方案不同，模态框方案不会在用户未认证时将其重定向走，而是让受保护页面在后台正常加载（虽然这些页面需要在没有认证数据的情况下也能处理渲染），然后在上方覆盖一个登录模态框。用户登录后模态框消失，直接显示目标页面。

### 适用场景

- 需要保留深层链接目标页面时
- 希望用户登录后直接看到他们想访问的页面时
- 后台路由能够处理无认证数据的情况时

### 模态框方案的文件结构

```
src/
├── app/
│   ├── _layout.tsx      ← 根布局（声明全局上下文和模态框）
│   ├── sign-in.tsx      ← 登录页面（以模态框形式展示）
│   └── (root)/          ← 根分组（保护子路由）
│       ├── _layout.tsx
│       └── index.tsx
```

### 根布局配置

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(root)',
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

**代码解析**：

- `unstable_settings`：通过设置 `initialRouteName` 为 `(root)`，确保应用启动时默认显示根分组页面而非登录页面。
- `presentation: 'modal'`：将 `sign-in` 页面配置为模态框展示方式，它会覆盖在当前页面之上。
- `(root)` 分组内部的子路由可以各自配置 `Stack.Protected` 守卫来实现单独的路由保护。

> **基于经验建议**：模态框方案需要后台路由在没有认证数据的情况下也能正常工作（例如显示加载骨架屏而非报错）。如果你的页面强依赖于用户数据，使用第一种受保护路由方案会更简单可靠。

---

## 服务端中间件限制（Middleware）

> **警告**：这是一个当前存在的平台限制。

在传统的 Web 开发中，通常使用**服务端重定向**来实现身份认证（例如在服务器端检查 cookie 后直接返回 302 重定向）。然而，Expo Router 的 Web 版本目前**仅支持构建时的静态生成（Static Generation）**，不支持自定义服务端中间件。

因此，对于 Web 端的身份认证，开发者需要：

- 依赖**客户端重定向**（即本文档介绍的方法）
- 使用**加载状态**（Loading States）来管理 Web 端的认证流程

> **基于文档内容推导**：这意味着在 Web 端，用户可能会短暂看到页面内容然后被重定向，这是静态生成架构的固有限制。确保你的受保护页面在认证检查完成前有一个合适的加载状态展示。

---

## 更多信息

- 有关受保护路由的更多详细信息，请参阅 [Protected Routes（受保护路由）](https://docs.expo.dev/router/advanced/protected-routes/) 文档
- 有关模态框的更多信息，请参阅 [Modals（模态框）](https://docs.expo.dev/router/reference/modals/) 文档
- 视频教程：[How to use Protected Routes in Expo Router version 5 and later for smooth authentication](https://www.youtube.com/)——演示如何在 Expo Router v5 及更高版本中创建流畅的认证流程

---

## 文档导航

- **上一页**：[drawer](./60__drawer.md)
- **下一页**：[authentication rewrites](./62__authentication-rewrites.md)
