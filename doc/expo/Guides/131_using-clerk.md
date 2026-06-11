# 在 Expo 应用中使用 Clerk

## 文档解决的问题

Clerk 是认证和用户管理平台，提供注册、登录、多因素认证、社交登录、组织和托管用户数据库。`@clerk/expo` 提供 React hooks、权限控制组件，以及在 Android 使用 Jetpack Compose、在 iOS 使用 SwiftUI 渲染的预制原生 UI。

本文说明如何安装 SDK、配置 `<ClerkProvider>`，并在三种集成方式中选择。文档明确针对 `@clerk/expo` Core 3（3.x），其支持范围是 Expo SDK 53、54、55，peer dependency 为 `expo: >=53 <56`。

## 选择集成方式

| 方式 | 开发者负责的 UI | Expo Go | 适用场景 |
| --- | --- | --- | --- |
| 纯 JavaScript | 用 `useSignIn()`、`useSignUp()` 自建 React Native 页面 | 支持 | 需要最大 UI 控制，或先在 Expo Go 原型验证 |
| JavaScript + 原生社交登录 | 自建页面，加原生 Google/Apple 登录 | 不支持 | 自定义视觉，但需要平台原生社交登录 |
| 原生 UI 组件 | 使用 `<AuthView />`、`<UserButton />`、`<UserProfileView />` | 不支持 | 最快获得完整登录和账号管理界面 |

三种方式以后可以切换。`@clerk/expo/native` 的原生 UI 当前是 beta；原生会话会同步回 JavaScript SDK，因此 `useAuth()`、`useUser()` 等 hooks 仍能读取一致状态。

## 前置条件

1. 创建 Clerk 账号和 application。
2. 在 Clerk Dashboard 的 Native applications 页面启用 **Native API**；所有 `@clerk/expo` 集成都需要它。
3. 使用 Expo SDK 53 或更高，但当前 Core 3 文档同时明确上限低于 56。
4. 原生登录和原生 UI 必须使用 development build；只有纯 JavaScript 方式可在 Expo Go 中运行。

## 安装与配置

### 安装基础依赖

```sh
npx expo install @clerk/expo expo-secure-store
```

使用 `expo install` 可匹配当前 Expo SDK。`expo-secure-store` 是 peer dependency，Clerk 通过 `@clerk/expo/token-cache` 使用 iOS Keychain 和 Android Keystore 加密保存会话 Token。

如使用原生 Google 登录，还需：

```sh
npx expo install expo-crypto
```

如使用原生 Apple 登录，还需：

```sh
npx expo install expo-apple-authentication expo-crypto
```

只使用 `@clerk/expo/native` 的 `<AuthView />` 时不需要上述社交登录附加包，因为该组件内部处理这些流程。

### 添加 config plugin

```json
{
  "expo": {
    "plugins": ["@clerk/expo"]
  }
}
```

插件会在设置 `EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME` 时配置 iOS URL scheme，并应用底层 `clerk-android` SDK 所需的 Android packaging 修复。若安装 `expo-apple-authentication`，Apple Sign In entitlement 由该库的插件加入。

### 配置 Publishable Key

在项目根目录 `.env` 中写入：

```text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
```

`EXPO_PUBLIC_` 变量会在构建时内联到 JavaScript bundle，因此任何用户都可能读取。Publishable Key 可以公开，但 Secret Key 绝不能使用此前缀。

### 包裹根布局

Expo Router 项目的 `src/app/_layout.tsx`：

```tsx
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Slot } from 'expo-router';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
```

Core 3 要求 Expo 应用显式传 `publishableKey`。生产 React Native 构建不会内联 `node_modules` 内部引用的环境变量，所以不能依赖 SDK 自己从包内读取。显式传 `tokenCache` 可持久化重启后的会话，也便于以后替换缓存实现。

## 使用原生认证 UI

```tsx
import { AuthView } from '@clerk/expo/native';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SignInScreen() {
  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(home)');
    }
  }, [isSignedIn]);

  return <AuthView mode="signInOrUp" />;
}
```

`<AuthView />` 可处理邮箱、手机号、passkey、MFA 和 Clerk Dashboard 中启用的社交连接。`mode` 支持 `signIn`、`signUp`、`signInOrUp`，还可设置 `isDismissable`。

`treatPendingAsSignedOut: false` 很关键：原生会话同步到 JS 有短暂过渡，若把 pending 当成退出，依赖 `isSignedIn` 的导航可能在登录页与主页之间循环重定向。

### 用户按钮与资料弹窗

```tsx
import { UserButton } from '@clerk/expo/native';
import { Show } from '@clerk/expo';
import { View } from 'react-native';

export function Header() {
  return (
    <Show when="signed-in">
      <View style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden' }}>
        <UserButton />
      </View>
    </Show>
  );
}
```

`<UserButton />` 填满父容器，所以尺寸和形状由父容器决定。其他自定义入口可调用 `useUserProfileModal()` 返回的 `presentUserProfile`，并根据 `isAvailable` 决定是否可点击。

## 读取用户、保护内容与退出

```tsx
import { Show, useClerk, useUser } from '@clerk/expo';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View>
      <Show when="signed-in">
        <Text>Hello, {user?.firstName ?? 'friend'}</Text>
        <Pressable onPress={() => signOut()}>
          <Text>Sign out</Text>
        </Pressable>
      </Show>
      <Show when="signed-out">
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
      </Show>
    </View>
  );
}
```

`<Show>` 取代旧版 `<SignedIn>`、`<SignedOut>` 和 `<Protect>`，还支持 role、permission 等授权条件。注意“根据登录态显示内容”不等于服务端安全校验；当前文档没有展开服务端授权。

## 构建、限制与坑点

原生功能可用以下方式构建：

```sh
npx expo run:android
npx expo run:ios
eas build --platform ios --profile development
```

- 原生 UI 仍处于 beta，不应误认为与纯 JS 组件具有完全相同的运行边界。
- SDK 的 hooks 与原生界面通过会话同步协作，导航必须处理 pending 状态。
- Keychain/Keystore 类似 Web 中持久化凭据的角色，但安全边界不同于 `localStorage`，不应把移动端 Token 存储简单等同于浏览器存储。
- 当前页面标注的 Core 3 不支持 Expo SDK 56；若项目使用 56，不能假定本页版本组合可直接安装。
- **基于文档内容推导**：选择纯 JS 方式可降低最初的原生构建门槛，但切换到原生社交登录或原生 UI 后必须把 development build 纳入日常测试。
- 当前文档未完整展示纯 JavaScript 登录表单和“JavaScript + 原生登录”的实现代码，也未展开生产凭据、重定向白名单和商店发布配置。

<!-- NAVIGATION START -->
---
[← 上一页：Expo 中的认证 SDK 与库](./130_using-authentication.md) | [下一页：在 Expo 应用中使用 Facebook 认证 →](./132_facebook-authentication.md)
<!-- NAVIGATION END -->
