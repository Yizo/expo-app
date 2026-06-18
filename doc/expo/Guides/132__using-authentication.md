# 使用身份验证 SDK 和库

> **原文地址**：<https://docs.expo.dev/guides/using-authentication/>
>
> 本文档基于 Expo 官方文档翻译整理，最后更新日期为 2026 年 1 月 6 日。

---

## 概述

移动端身份验证（Authentication）涉及以下核心任务：

- **识别用户身份**（Identifying users）：确认正在使用应用的人是谁
- **管理注册与登录流程**（Registration and login flows）：编排用户的注册、登录操作步骤
- **在应用重启和不同设备间维持会话**（Maintaining sessions）：确保用户登录后，即使关闭应用或更换设备，也能保持登录状态

与其自己从零搭建身份验证后端服务，不如利用现有的第三方 SDK（软件开发工具包）来快速集成身份验证功能。Expo 和 React Native 生态中提供了多种成熟的身份验证方案。

> **关键术语解释（面向初学者）**
>
> - **SDK（Software Development Kit）**：软件开发工具包，即一组预先封装好的代码库和工具，帮助开发者快速实现特定功能，无需从头编写。
> - **身份验证（Authentication）**：确认用户身份的过程，通常简称为"Auth"。与"授权（Authorization）"不同——身份验证解决"你是谁"的问题，授权解决"你能做什么"的问题。
> - **会话（Session）**：用户登录后，服务端与客户端之间维持的一个"对话"状态，用于记住用户已登录，避免每次操作都重新输入密码。
> - **Token（令牌）**：一段加密字符串，作为用户身份的凭证。服务器通过验证 Token 来确认请求来自已登录的用户。
> - **Development Build（开发构建）**：Expo 中一种自定义的应用构建方式，允许包含原生代码模块。与 Expo Go 不同，它支持所有原生功能。
> - **Expo Go**：Expo 提供的快速开发预览应用，内置了常用的 Expo 模块，但不支持需要自定义原生代码的第三方库。

---

## 重要警告

> **⚠️ 警告**：部分第三方身份验证服务需要修改原生代码（Native Code），这意味着它们**无法在 Expo Go 中运行**。遇到此类情况，请使用 **Development Build（开发构建）**。

> **关键术语解释（面向初学者）**
>
> - **原生代码（Native Code）**：指使用平台原生语言编写的代码——Android 上使用 Java/Kotlin，iOS 上使用 Swift/Objective-C。Expo Go 是一个通用预览应用，未包含这些自定义原生代码。
> - **Development Build**：你自己编译的 Expo 应用，包含了项目所需的所有原生模块，可以运行任何第三方原生库。

> **基于经验建议**：如果你的项目确定需要使用需要原生代码的身份验证 SDK（如 Google 登录、Facebook 登录等），建议从项目一开始就使用 Development Build 进行开发，而不是先在 Expo Go 中开发再迁移，这样可以避免后期大量重构工作。

---

## 支持的身份验证集成方案

Expo 文档目前提供了以下身份验证方案的详细集成指南：

### 1. Clerk

将身份验证和用户管理功能集成到 Expo 和 React Native 应用中。Clerk 提供了完整的一站式解决方案，包括多因素认证（MFA）、社交登录、用户管理后台等。

> **关键术语解释（面向初学者）**
>
> - **多因素认证（MFA, Multi-Factor Authentication）**：除了密码之外，还要求用户提供第二种验证方式（如手机验证码、指纹等），大幅提高账户安全性。
> - **社交登录（Social Login）**：允许用户使用已有的社交账号（Google、Apple、Facebook 等）登录你的应用，降低注册门槛。

### 2. Facebook 身份验证

使用 `react-native-fbsdk-next` 包实现 Facebook 社交登录功能，同时可以访问 Facebook 原生组件。

> **关键术语解释（面向初学者）**
>
> - **FBSDK**：Facebook SDK 的缩写，即 Facebook 提供的移动端开发工具包，`react-native-fbsdk-next` 是其 React Native 版本的社区维护封装。

### 3. Google 身份验证

使用 `@react-native-google-signin/google-signin` 或 `react-native-nitro-google-signin` 库集成 Google 社交登录。

---

## Clerk 身份验证详细指南

> **基于文档内容推导**：Clerk 是目前 Expo 官方文档中介绍最详细的身份验证方案，提供了从纯 JavaScript 到完全原生 UI 的三种集成路径，适合不同阶段和需求的开发者。

### 支持的版本与特性

- 支持 Expo SDK 53、54 和 55
- 提供 React Hooks 进行状态管理
- 原生 UI 组件使用 Android Jetpack Compose 和 iOS SwiftUI 渲染

### 三种集成方式

| 集成方式 | 描述 | 是否支持 Expo Go | 适用场景 |
|---|---|---|---|
| **纯 JavaScript** | 使用 Hooks 构建完全自定义的界面 | 是 | 快速原型开发或需要完全自定义 UI |
| **JavaScript + 原生社交登录** | 自定义界面搭配原生 Google/Apple 登录按钮 | 否（需要 Development Build） | 想要自定义 UI 同时保留原生社交登录体验 |
| **原生 UI 组件（Beta 测试版）** | 使用预构建的 `<AuthView />` 等组件 | 否（需要 Development Build） | 最快速的完整集成方案 |

> **⚠️ 注意**：原生 UI 组件目前处于 **Beta（测试版）** 阶段，API 可能会在后续版本中发生变化。

### 开始前的准备

1. 在 [Clerk Dashboard](https://dashboard.clerk.com/) 注册账户
2. 启用 Native API
3. 项目使用 Expo SDK 53 或更高版本
4. 如需使用原生功能，需配置 Development Build

### 安装依赖

**安装核心包和安全存储：**

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

> **关键术语解释（面向初学者）**
>
> - **`@clerk/expo`**：Clerk 官方为 Expo 提供的身份验证库，封装了所有身份验证相关的 API 和组件。
> - **`expo-secure-store`**：Expo 的安全存储模块，用于在设备上加密存储敏感数据（如 Token），防止被恶意读取。

**如需 Google 社交登录，额外安装加密支持：**

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

**如需 Apple 社交登录，额外安装：**

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

> **⚠️ 安全警告**：切勿使用 `EXPO_PUBLIC_` 前缀的环境变量来存储私有密钥（Secret Keys）。`EXPO_PUBLIC_` 前缀的变量会被打包到客户端代码中，任何人都可以看到。Publishable Key 是公开的可以安全使用，但 Secret Key 绝不能暴露。

> **基于经验建议**：Apple 的应用商店审核指南规定，如果你的应用提供了任何第三方社交登录选项（如 Google、Facebook 等），则**必须同时提供"使用 Apple 登录"（Sign in with Apple）** 选项，否则应用可能被拒绝上架。

### 配置应用

在项目的应用配置文件（`app.json` 或 `app.config.js`）中注册 Clerk 插件：

```json
{
  "expo": {
    "plugins": ["@clerk/expo"]
  }
}
```

> **关键术语解释（面向初学者）**
>
> - **Config Plugin（配置插件）**：Expo 的预构建系统（Prebuild）使用的一种机制，允许第三方库自动修改原生项目配置（如 Android 的 `build.gradle`、iOS 的 `Info.plist` 等），无需手动编辑原生文件。

在 `.env` 文件中存储你的 Publishable Key：

```text
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
```

### 设置根布局 Provider

使用 `<ClerkProvider>` 包裹你的应用根组件，传入 Publishable Key 和 Token 缓存：

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

> **关键术语解释（面向初学者）**
>
> - **Provider（提供者）**：React 中的一种组件模式，通过 Context API 向其子组件树提供共享数据（如当前登录用户、身份验证状态等）。`<ClerkProvider>` 让应用中的所有子组件都能访问身份验证功能。
> - **tokenCache**：Token 缓存机制，用于安全地存储和检索身份验证令牌，避免用户每次打开应用都需要重新登录。
> - **`<Slot />`**：Expo Router 中的组件，用于渲染当前路由匹配的页面内容，类似于 React Navigation 中的导航容器。

### 方式一：使用原生 UI 组件（需要 Development Build）

**登录界面——`<AuthView />`：**

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

> **关键术语解释（面向初学者）**
>
> - **`useAuth`**：Clerk 提供的 React Hook，返回当前身份验证状态（是否已登录、是否有待处理的验证等）。`treatPendingAsSignedOut` 参数控制当登录状态"待定"时是否将其视为已登出——设为 `false` 可避免在会话同步期间出现无限重定向循环。
> - **`<AuthView />`**：Clerk 提供的原生预构建登录界面，`mode="signInOrUp"` 表示同时支持登录和注册功能。该组件在 Android 上使用 Jetpack Compose 渲染，在 iOS 上使用 SwiftUI 渲染。

**用户头像按钮——`<UserButton />`：**

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

**用户资料管理链接：**

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

### 方式二：JavaScript + 原生社交登录（需要 Development Build）

**自定义 Google 登录按钮：**

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

> **基于经验建议**：代码中 `Platform.OS` 检查确保了只在 iOS 和 Android 平台上显示 Google 登录按钮，因为 Web 平台的社交登录流程通常不同，需要单独处理。

### 方式三：纯 JavaScript（支持 Expo Go）

**邮箱密码登录：**

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
          if (session?.currentTask) return; // let the session task layer handle it
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

**邮箱注册：**

```tsx
await signUp.password({ emailAddress, password });
await signUp.verifications.sendEmailCode();
// ... 收集用户输入的验证码，然后：
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

> **关键术语解释（面向初学者）**
>
> - **`useSignIn`**：Clerk 提供的 Hook，返回 `signIn` 对象和相关状态。`signIn.password()` 使用邮箱密码方式发起登录，`signIn.finalize()` 在登录完成后进行收尾工作（如设置活动会话、跳转页面）。
> - **`signUp`**：注册对象，流程与登录类似——先调用 `signUp.password()` 创建账户，再发送邮箱验证码，最后验证并完成注册。
> - **`decorateUrl`**：Clerk 提供的方法，用于在 URL 中附加会话相关的参数，确保跳转后的页面能正确识别用户身份。

### 获取用户信息和会话管理

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

> **关键术语解释（面向初学者）**
>
> - **`useUser()`**：返回当前已登录用户的信息对象（如姓名、邮箱、头像等）。
> - **`useClerk()`**：返回 Clerk 实例，提供 `signOut()` 等方法来控制会话。
> - **`<Show>`**：Clerk 提供的条件渲染组件，`when="signed-in"` 表示仅在已登录时渲染子内容，`when="signed-out"` 表示仅在未登录时渲染。

> **基于经验建议**：在生产环境构建中，Expo 不会自动内联来自外部包的环境变量。这意味着你必须在 `<ClerkProvider>` 上显式传入 `publishableKey` 属性，而不能依赖库内部自动读取环境变量。

### 注册界面需要验证码组件

在注册页面中，需要包含一个带有 `nativeID="clerk-captcha"` 的视图元素，因为 Clerk 的自动验证码（Captcha）系统会自动激活：

```tsx
// 在你的注册页面中添加以下元素
<View nativeID="clerk-captcha" />
```

### 运行项目

**使用 Development Build 运行（原生功能）：**

```sh
# Android
npx expo run:android

# iOS
npx expo run:ios

# 或通过 EAS Build 构建
eas build --platform ios --profile development
```

**使用 Expo Go 运行（仅纯 JavaScript 模式）：**

```sh
npx expo start
```

### Clerk 更多资源

- [Clerk Expo 快速入门](https://clerk.com/docs/quickstarts/expo)
- [原生组件 API 参考](https://clerk.com/docs/components/native)
- [Google 登录配置](https://clerk.com/docs/authentication/social-connections/google)
- [Apple 登录配置](https://clerk.com/docs/authentication/social-connections/apple)
- [读取用户数据和路由保护](https://clerk.com/docs/references/expo/protecting-routes)
- [生产环境部署指南](https://clerk.com/docs/deployments/overview)

---

## Facebook 身份验证详细指南

> **基于文档内容推导**：Facebook 身份验证使用 `react-native-fbsdk-next` 包实现，该包是 Facebook 官方移动 SDK 的 React Native 封装。由于依赖原生代码，无法在 Expo Go 中使用。

### 使用的库

- **`react-native-fbsdk-next`**：Facebook SDK 的 React Native 社区维护版本，支持登录功能和原生组件访问。

### 前置要求

> **⚠️ 警告**：`react-native-fbsdk-next` 库**无法在 Expo Go 中使用**，因为它需要自定义原生代码。你必须使用 Development Build。

### 安装

安装步骤请参考官方仓库的 Expo 安装说明：
- 仓库地址：<https://github.com/thebergano/react-native-fbsdk-next/>
- Expo 安装指南：<https://github.com/thebergano/react-native-fbsdk-next/#expo-installation>

### Android 平台配置（重点）

Android 平台的 Facebook 配置较为复杂，需要特别注意以下步骤：

> **⚠️ 重要提示**：在 Facebook 开发者后台添加 Android 平台之前，你的应用**必须已经通过 Google Play Store 审核**。这是因为 Facebook 需要一个有效的 Play Store 链接和应用包名（Package Name）。如果跳过此步骤，将会触发错误。

> **基于经验建议**：即使你的应用还在测试阶段，也建议先提交到 Play Store 进行审核（可以先走内部测试通道）。这样你才能获取到正确的 Play Store URL 和包标识符（Package Identifier），用于后续的 Facebook 配置。

#### 第一步：获取 Key Hash（密钥哈希）

Facebook 需要你的应用的 Key Hash 来验证应用身份。获取步骤如下：

1. 登录 [Google Play Console](https://play.google.com/console)
2. 导航到：**Release（发布）** → **Setup（设置）** → **App Integrity（应用完整性）**
3. 找到 **App signing key certificate（应用签名密钥证书）** 部分
4. 复制 **SHA-1 指纹值**

> **关键术语解释（面向初学者）**
>
> - **SHA-1 指纹**：一种加密哈希值，用于唯一标识你的应用签名证书。每个 Android 应用都有一个签名证书，用于证明应用的来源和完整性。
> - **Key Hash**：Facebook 使用的密钥哈希格式（Base64 编码），与 Google Play Console 中的 SHA-1 十六进制格式不同，需要转换。

5. 将 SHA-1 十六进制值转换为 Base64 格式：
   - 使用在线转换工具：<https://base64.guru/converter/encode/hex>
   - 输入 SHA-1 的十六进制值，获取 Base64 编码结果

6. 将转换后的 Base64 字符串粘贴到 Facebook 开发者后台的 **Key Hashes** 区域

#### 第二步：配置包名（Package Name）

在你的应用配置文件（`app.json` 或 `app.config.js`）中找到 `android.package` 属性值，将其填入 Facebook 开发者后台的 Package Name 字段。

例如：`com.myapp.example`

#### 第三步：配置类名（Class Name）

默认类名为 `MainActivity`，需要在前面加上你的包名作为前缀，组成完整路径：

```
com.myapp.example.MainActivity
```

（假设你的包名是 `com.myapp.example`）

#### 第四步：保存配置

点击 **Save changes（保存更改）**。至此，你的 Facebook 项目已完全配置好，可用于 Development Build、Release Build 和生产环境部署。

### 首次 Android 提交参考

- 首次 Android 提交指南：<https://expo.fyi/first-android-submission>

---

## Google 身份验证详细指南

> **基于文档内容推导**：Google 身份验证提供了两个可选库，两者的核心差异在于对 Android Credential Manager 的支持方式。文档推荐优先选择支持现代 Credential Manager 的方案。

### 两个可选库

| 库名 | 特点 | Android Credential Manager |
|---|---|---|
| **`react-native-nitro-google-signin`** | 使用现代原生框架 | 原生内置支持 |
| **`@react-native-google-signin/google-signin`** | 社区热门包 | 仅在付费版本中提供 |

> **关键术语解释（面向初学者）**
>
> - **Android Credential Manager**：Google 推出的新一代身份验证 API，取代了已弃用的旧版 Google Sign-In SDK（`com.google.android.gms:play-services-auth`）。Credential Manager 提供了更统一、更安全的凭据管理体验。
> - **已弃用（Deprecated）**：指某个 API 或技术虽然仍然可用，但官方不再推荐使用，未来版本可能会移除。

> **⚠️ 警告**：旧版 Android Sign-In SDK 已被 Google 标记为弃用。开发者应尽快迁移到新的 Credential Manager 系统。

> **基于文档内容推导**：如果你不需要 `@react-native-google-signin/google-signin` 的付费功能，建议选择 `react-native-nitro-google-signin`，因为它免费内置了 Android Credential Manager 支持。

### 前置要求

> **⚠️ 警告**：两个库都**无法在 Expo Go 中使用**，因为它们都依赖自定义原生模块。你必须使用配置插件（Config Plugin）并编译自定义 Development Build。

### 安装

具体安装步骤请参考各库的官方文档：

- **`react-native-nitro-google-signin`**：<https://react-native-nitro-google-sign-in.github.io/docs/setup/expo#without-firebase-manual-ios-url-scheme>
- **`@react-native-google-signin/google-signin`**：<https://react-native-google-signin.github.io/docs/setting-up/expo#expo-without-firebase>

### Google 后端配置

#### 建议：尽早发布到 Google Play Store

> **基于经验建议**：即使应用处于测试阶段，也强烈建议尽早将应用发布到 Google Play Store。这样可以同时使用 EAS 构建密钥和官方商店签名密钥来测试登录流程，避免在生产发布后才发现签名密钥不匹配导致登录失败的问题。

相关参考：
- 首次 EAS Build 指南
- 应用商店准备指南
- 首次手动上传指南

#### SHA-1 证书哈希配置

Android 配置需要提供 SHA-1 证书哈希值，需要从以下两个来源获取：

1. **上传密钥（Upload Key）**：位于 Google Play Console 的上传密钥部分（你本地/EAS 构建使用的密钥）
2. **应用签名密钥（App Signing Key）**：位于 Play Console 的应用签名密钥部分（生产发布使用的密钥）

> **基于经验建议**：很多开发者只配置了上传密钥的 SHA-1，而忘记配置应用签名密钥的 SHA-1。这会导致通过 Play Store 安装的应用无法完成 Google 登录。务必同时配置两个 SHA-1 值。

#### 方式 A：使用 Firebase 配置

如果选择 Firebase 作为后端：

- 需要确保 `google-services.json`（Android）和 `GoogleService-Info.plist`（iOS）在 EAS Build 期间可用
- 可以将这些文件直接提交到版本控制（Git）中
- 也可以通过安全环境变量（Secrets）进行管理

> **⚠️ 注意**：Firebase 配置文件通常不包含高度敏感数据（如 API 密钥等虽然存在但属于客户端可公开的信息），但如果你对此有安全顾虑，可以选择将其作为环境变量处理。

#### 方式 B：使用 Google Cloud Console 配置（不使用 Firebase）

如果你不想引入 Firebase，可以直接在 Google Cloud Console 中手动配置。具体步骤请参考各库的 "Without Firebase" 文档：

- `react-native-nitro-google-signin` 无 Firebase 指南
- `@react-native-google-signin/google-signin` 无 Firebase 指南

---

## 各方案对比总结

| 特性 | Clerk | Facebook | Google |
|---|---|---|---|
| **支持 Expo Go** | 部分支持（纯 JS 模式） | 不支持 | 不支持 |
| **需要 Development Build** | 原生功能需要 | 是 | 是 |
| **提供完整用户管理** | 是 | 否 | 否 |
| **社交登录** | 支持多种（Google、Apple 等） | Facebook 登录 | Google 登录 |
| **配置复杂度** | 低（API Key 即可） | 中（需要 Facebook 开发者后台配置） | 中高（需要 SHA-1、Firebase/GCP 配置） |
| **适用场景** | 完整身份验证解决方案 | 仅需 Facebook 登录 | 仅需 Google 登录 |

> **基于文档内容推导**：如果你需要一个完整的身份验证系统（包括用户注册、登录、会话管理、多因素认证等），Clerk 是最推荐的方案。如果你只需要特定的社交登录功能，可以直接集成对应的 SDK。实际项目中，Clerk 也可以整合 Google 和 Apple 登录，因此使用 Clerk 作为统一入口通常是最高效的选择。

---

## 常见问题与注意事项

### 环境变量安全

- 以 `EXPO_PUBLIC_` 为前缀的环境变量会被打包到客户端代码中，**任何用户都可以查看其内容**
- 只将公开安全的信息（如 Publishable Key）放在 `EXPO_PUBLIC_` 变量中
- Secret Key、API Secret 等敏感信息绝不能使用 `EXPO_PUBLIC_` 前缀

### Development Build vs Expo Go

- Expo Go 适合快速开发和原型验证，但**不支持需要原生代码的第三方库**
- Development Build 是自定义编译的应用，支持所有原生模块
- 如果你的身份验证方案需要原生支持，从一开始就使用 Development Build

### 生产环境构建注意事项

- 生产构建不会自动内联来自外部包的环境变量，必须显式传递配置属性
- 确保所有必要的 API Key 和配置在生产构建中正确设置
- 建议在 CI/CD 流程中通过环境变量注入敏感配置

> **基于经验建议**：在正式发布前，务必在 Release Build（发布构建）模式下全面测试身份验证流程。Development Build 和 Release Build 在签名密钥、环境变量处理等方面可能存在差异，这些问题只在生产环境中才会暴露。

---

## 文档导航

- **上一页**：[using vexo](./131__using-vexo.md)
- **下一页**：[using clerk](./133__using-clerk.md)
