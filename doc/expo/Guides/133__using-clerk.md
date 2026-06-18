# 使用 Clerk 实现身份认证

> **原文地址**：[https://docs.expo.dev/guides/using-clerk/](https://docs.expo.dev/guides/using-clerk/)

---

## 什么是 Clerk？

Clerk 是一套完整的身份服务平台，提供用户注册、多因素验证（MFA）和社交登录等功能。`@clerk/expo` 库为 React Native 和 Expo 项目提供了 React Hooks 以及使用 SwiftUI（iOS）和 Jetpack Compose（Android）构建的原生 UI 组件。

> **面向初学者的关键术语解释**：
>
> - **身份服务（Identity Service）**：处理用户"你是谁"和"你是否有权限"这类问题的后端服务，包括注册、登录、验证等。
> - **多因素验证（MFA, Multi-Factor Authentication）**：除了密码之外，还要求用户提供第二种验证方式（如短信验证码、指纹等），提升安全性。
> - **社交登录（Social Login）**：使用 Google、Apple 等第三方账号进行登录，而非自行注册。
> - **React Hooks**：React 中用于在函数组件中使用状态和其他 React 特性的特殊函数。
> - **SwiftUI**：Apple 提供的声明式 UI 框架，用于构建 iOS 原生界面。
> - **Jetpack Compose**：Google 提供的声明式 UI 框架，用于构建 Android 原生界面。
> - **Expo Go**：Expo 提供的移动端预览应用，可以在不构建原生代码的情况下运行 Expo 项目。
> - **Custom Development Build（自定义开发构建）**：通过 EAS Build 或本地编译生成的包含原生代码的应用包，与 Expo Go 不同，它支持使用原生模块。

本指南针对的是 **Core 3** 版本的 Clerk，兼容 **Expo SDK 53 至 55**。

---

## 选择集成方式

Clerk 提供了三种集成路径，你可以之后随时切换，无需完全重写：

### 1. 纯 JavaScript 方式

开发者使用 Hooks 自行构建所有 UI。此方式可以在 **Expo Go** 中运行，适合快速原型开发和需要完全控制设计的场景。

### 2. JavaScript + 原生社交认证

自定义 UI 搭配原生 Apple 和 Google 登录按钮。此方式需要 **自定义开发构建（Custom Development Build）**，适合需要原生社交登录流程的自定义设计。

### 3. 原生 UI 组件

使用 Clerk 提供的预构建组件。此方式需要 **自定义开发构建**，是最快的集成方式。

> **注意**：原生 UI 组件目前处于 **Beta（测试）** 阶段，组件通过平台原生框架（SwiftUI / Jetpack Compose）渲染，同时将会话状态同步回 JavaScript Hooks。

> **基于经验建议**：如果你处于项目早期验证阶段，建议先用"纯 JavaScript 方式"在 Expo Go 中快速跑通流程，等确认方案可行后再切换到原生方案以获得更好的用户体验。三种方式可以渐进式迁移，不必一开始就做出最终选择。

---

## 前置条件

在开始集成之前，请确保满足以下条件：

| 条件 | 说明 |
|------|------|
| **Clerk 账号** | 前往 [Clerk Dashboard](https://dashboard.clerk.com/) 注册并创建一个项目 |
| **启用 Native API** | 在 Clerk Dashboard 的设置中，确保开启了"Native API"开关 |
| **SDK 版本** | 项目必须使用 **Expo SDK 53 或更高版本** |
| **构建环境** | 原生功能需要自定义开发构建；纯 JavaScript 方式可在 Expo Go 中运行 |

> **基于文档内容推导**：Clerk Dashboard 中的"Native API"开关是关键配置项，如果忘记开启，原生社交登录等功能将无法正常运作。建议在创建项目后立即检查此项。

---

## 安装与配置

### 安装依赖

安装核心包 `@clerk/expo` 以及 `expo-secure-store`。`expo-secure-store` 用于通过平台级安全存储（iOS Keychain / Android Keystore）加密保存会话令牌（Session Token）。

根据你的包管理器选择对应命令：

```sh
# npm
npx expo install @clerk/expo expo-secure-store

# yarn
yarn expo install @clerk/expo expo-secure-store

# pnpm
pnpm expo install @clerk/expo expo-secure-store

# bun
bun expo install @clerk/expo expo-secure-store
```

> **面向初学者的关键术语解释**：
>
> - **会话令牌（Session Token）**：用户登录后服务器颁发的凭证字符串，用于在后续请求中证明"我已经登录了"，无需每次都输入密码。
> - **Keychain（iOS）**：Apple 系统提供的安全存储区域，用于保存密码、令牌等敏感信息，其他应用无法访问。
> - **Keystore（Android）**：Google 系统提供的加密密钥管理系统，功能类似 iOS 的 Keychain。

#### 原生 Google 认证所需依赖

如果你需要原生 Google 登录，还需安装 `expo-crypto`：

```sh
# npm
npx expo install expo-crypto
# yarn
yarn expo install expo-crypto
# pnpm
pnpm expo install expo-crypto
# bun
bun expo install expo-crypto
```

#### 原生 Apple 认证所需依赖

如果你需要原生 Apple 登录，还需安装 `expo-apple-authentication` 和 `expo-crypto`：

```sh
# npm
npx expo install expo-apple-authentication expo-crypto
# yarn
yarn expo install expo-apple-authentication expo-crypto
# pnpm
pnpm expo install expo-apple-authentication expo-crypto
# bun
bun expo install expo-apple-authentication expo-crypto
```

> **注意**：如果你仅使用原生 `AuthView` 组件，则**无需**安装上述额外的社交登录依赖包，因为 `AuthView` 组件内部已处理了社交登录流程。

### 配置插件（Config Plugin）

在应用配置文件的 `plugins` 数组中添加 `@clerk/expo`，以处理 iOS URL Scheme 和 Android 打包相关调整：

```json
{
  "expo": {
    "plugins": ["@clerk/expo"]
  }
}
```

> **面向初学者的关键术语解释**：
>
> - **Config Plugin（配置插件）**：Expo 的一种机制，允许第三方库在预构建（prebuild）阶段自动修改原生配置文件（如 iOS 的 Info.plist、Android 的 AndroidManifest.xml），无需手动编辑原生代码。
> - **URL Scheme**：一种自定义的 URL 协议（如 `myapp://`），用于从外部（如浏览器、其他应用）唤起你的应用，在 OAuth 回调流程中经常用到。

### 配置环境变量

将你的 **Publishable Key（可发布的公钥）** 放在项目根目录的 `.env` 文件中。`EXPO_PUBLIC_` 前缀确保框架在编译时将这些值内联嵌入到代码中。

```text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
```

> **警告**：**绝对不要**使用 `EXPO_PUBLIC_` 前缀暴露你的 Secret Key（密钥）。Secret Key 只能在服务端使用，一旦泄露到客户端代码中，攻击者将能够操控你的用户数据和身份验证逻辑。

### 初始化 Provider 组件

将你的根布局（Root Layout）包裹在 `ClerkProvider` 组件中。你必须**显式传入公钥**，因为依赖库中的环境变量在生产编译时不会被内联嵌入。同时提供 `tokenCache` 以确保会话持久化。

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

> **面向初学者的关键术语解释**：
>
> - **Provider（提供者）**：React 中的上下文提供者组件，它向其子组件树注入共享数据。这里 `ClerkProvider` 让所有子组件都能通过 Hooks 访问 Clerk 的认证状态和方法。
> - **tokenCache（令牌缓存）**：一个存储接口，用于在应用重启后仍然保持用户的登录状态，避免每次打开应用都要重新登录。
> - **`<Slot />`**：`expo-router` 的组件，用于渲染当前路由对应的页面，类似于 React Router 中的 `<Outlet />`。

> **基于经验建议**：`if (!publishableKey)` 这个校验非常重要，它能在环境变量遗漏时立即抛出明确的错误信息，而不是让应用在后续流程中出现难以追踪的"静默失败"。建议在所有依赖环境变量的地方都加上类似的校验。

---

## 构建认证界面

### 方式一：原生 UI 组件

使用 `AuthView` 组件可以渲染一个完整的原生登录界面，支持邮箱、Passkey（通行密钥）和社交登录。

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

> **关键细节**：使用 `useAuth` Hook 时，必须将 `treatPendingAsSignedOut` 设置为 `false`，以防止在原生到 JavaScript 会话同步过程中出现重定向循环。

> **面向初学者的关键术语解释**：
>
> - **Passkey（通行密钥）**：一种无密码的身份验证方式，使用设备上的生物识别（指纹/面容）或 PIN 码进行验证，由 FIDO 联盟推动的现代认证标准。
> - **`treatPendingAsSignedOut`**：当设为 `true`（默认值）时，处于"待验证"状态的用户会被视为未登录；设为 `false` 时则保持当前状态不变，避免原生组件和 JS 之间状态同步时间差导致的页面闪烁或循环跳转。

#### 用户头像按钮

使用 `UserButton` 组件显示用户头像，使用 `Show` 组件根据登录状态条件渲染：

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

#### 用户资料弹窗

使用 `useUserProfileModal` Hook 从自定义元素触发用户资料管理界面：

```tsx
import { useUserProfileModal } from '@clerk/expo';
import { Pressable, Text } from 'react-native';

export function ProfileLink() {
  const { presentUserProfile, isAvailable } = useUserProfileModal();
  return (
    <Pressable onPress={presentUserProfile} disabled={!isAvailable}>
      <Text>Manage profile</Text>
    </Pressable>
  );
}
```

#### 构建并运行原生组件

使用以下命令在真机或模拟器上测试原生组件：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios

# EAS Build（云端构建）
eas build --platform ios --profile development
```

---

### 方式二：JavaScript + 原生社交认证

此方式使用自定义 UI 搭配 Clerk 提供的原生社交登录 Hooks。

#### Google 登录

使用 `useSignInWithGoogle` Hook。在 Android 上利用 Credential Manager，在 iOS 上使用系统凭证选择器（需要正确配置 URL Scheme）。

```tsx
import { useSignInWithGoogle } from '@clerk/expo/google';
import { useRouter } from 'expo-router';
import { Platform, Text, TouchableOpacity } from 'react-native';

export function GoogleSignInButton() {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const router = useRouter();

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  const onPress = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      console.error('Google sign-in error', err);
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Continue with Google</Text>
    </TouchableOpacity>
  );
}
```

> **面向初学者的关键术语解释**：
>
> - **Credential Manager（凭证管理器）**：Android 14+ 引入的统一凭证管理系统，支持密码、Passkey 和社交登录凭证的存储和自动填充。
> - **URL Scheme 配置**：在 iOS 上，Google OAuth 回调需要通过自定义 URL Scheme 将认证结果传回你的应用。Clerk 的 Config Plugin 会自动处理此项配置。
> - **`Platform.OS`**：React Native 提供的 API，返回当前运行的平台名称（`'ios'`、`'android'`、`'web'`），用于条件渲染或逻辑分支。

> **基于文档内容推导**：代码中 `if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;` 这行说明原生 Google 认证不支持 Web 平台。如果你的应用需要跨平台支持，应为 Web 平台提供备选的 JavaScript 登录方案。

#### Apple 登录

> **重要提示**：根据 Apple App Store 审核指南，如果你的应用提供了第三方社交登录选项（如 Google、Facebook），则**必须同时提供 Apple 登录**选项。这是 App Store 的强制要求，否则应用可能被拒绝上架。

---

### 方式三：纯 JavaScript（兼容 Expo Go）

此方式使用核心 Hooks 构建自定义表单，完全不需要原生代码，可在 Expo Go 中运行。

#### 登录表单

凭证验证返回错误信息对象（error payload）而不是抛出异常，会话最终化（finalization）取代了旧版的 active session 方法。

```tsx
import { useSignIn } from '@clerk/expo';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const { signIn, fetchStatus, errors } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const onSignInPress = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return; 
          router.replace(decorateUrl('/') as Href);
        },
      });
    }
  };

  return (
    <View>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email"
        onChangeText={setEmailAddress}
      />
      <TextInput
        value={password}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onSignInPress} disabled={fetchStatus === 'fetching'}>
        <Text>Sign in</Text>
      </TouchableOpacity>
      {errors?.fields?.identifier ? <Text>{errors.fields.identifier.message}</Text> : null}
      {errors?.fields?.password ? <Text>{errors.fields.password.message}</Text> : null}
    </View>
  );
}
```

> **面向初学者的关键术语解释**：
>
> - **`signIn.password()`**：使用邮箱和密码进行登录的方法。它返回一个包含 `error` 字段的对象，如果 `error` 存在则说明登录失败。
> - **`signIn.finalize()`**：登录验证通过后调用此方法来"激活"会话，类似于传统 Web 开发中"设置 Cookie"的动作。
> - **`decorateUrl`**：Clerk 提供的 URL 装饰函数，它会在 URL 上附加会话相关的查询参数，用于跨平台会话同步。
> - **`currentTask`**：表示当前会话是否有未完成的任务（如强制设置密码、完成 MFA 等），如果有则不应直接跳转。
> - **Bot Prevention（机器人防护）**：Clerk 默认启用的安全机制，通过不可见的挑战（challenge）来区分人类用户和自动化程序。

> **基于经验建议**：`fetchStatus === 'fetching'` 时禁用按钮是一个重要的用户体验细节，防止用户重复点击导致多次登录请求。建议在所有异步操作的触发按钮上都加上类似的防重复提交逻辑。

#### 注册表单

注册流程需要触发邮箱验证码，验证通过后再最终化会话：

```tsx
await signUp.password({ emailAddress, password });
await signUp.verifications.sendEmailCode();
// ... 从用户处收集验证码，然后：
await signUp.verifications.verifyEmailCode({ code });
if (signUp.status === 'complete') {
  await signUp.finalize({
    navigate: ({ session, decorateUrl }) => {
      if (session?.currentTask) return;
      router.replace(decorateUrl('/') as Href);
    },
  });
}
```

> **注册流程说明**：
> 1. 调用 `signUp.password()` 提交邮箱和密码
> 2. 调用 `signUp.verifications.sendEmailCode()` 发送验证码邮件
> 3. 用户输入收到的验证码
> 4. 调用 `signUp.verifications.verifyEmailCode()` 验证码
> 5. 如果注册状态为 `'complete'`，调用 `signUp.finalize()` 完成会话激活

---

## 获取已认证用户信息

在应用的任意位置都可以通过 Hooks 获取当前用户的身份信息和认证状态。`Show` 组件可以根据认证状态、角色或权限条件渲染子元素，它取代了旧版的保护性包装组件（Protection Wrapper）。

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

> **面向初学者的关键术语解释**：
>
> - **`useUser()`**：返回当前已登录用户的信息（包括姓名、邮箱、头像等），如果未登录则 `user` 为 `null`。
> - **`useClerk()`**：返回 Clerk 客户端实例的方法集合，包括 `signOut`（登出）等。
> - **`<Show when="signed-in">`**：条件渲染组件，仅当用户处于已登录状态时才渲染其子元素。对应地，`when="signed-out"` 则在未登录时渲染。
> - **`user?.firstName ?? 'friend'`**：使用可选链操作符 `?.` 和空值合并操作符 `??`，如果用户未设置名字则显示默认值 `'friend'`。

---

## 运行应用

根据不同场景选择对应的运行命令：

```sh
# Android（真机或模拟器）
npx expo run:android

# iOS（真机或模拟器）
npx expo run:ios

# 纯 JavaScript / Expo Go 模式
npx expo start
```

> **基于经验建议**：在 iOS 模拟器上测试时，Apple 登录可能无法正常工作，因为模拟器缺少真实的 Apple ID 环境。建议 Apple 登录功能在真机上测试。

---

## 进阶资源

如需深入了解，可参考以下官方资源：

- Clerk 快速入门仓库（Quickstart Repository）
- 原生组件 API 参考文档
- 特定社交登录配置指南
- 路由保护策略（Route Protection）
- 通过 EAS Build 进行生产环境部署的流程

---

## 文档导航

- **上一页**：[using authentication](./132__using-authentication.md)
- **下一页**：[facebook authentication](./134__facebook-authentication.md)
