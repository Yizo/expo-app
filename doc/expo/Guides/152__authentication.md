> 原文地址：[https://docs.expo.dev/guides/authentication/](https://docs.expo.dev/guides/authentication/)

# 身份认证（Authentication）

本文档介绍如何在 Expo 项目中实现 OAuth 和 OpenID Connect 身份认证，覆盖 Web、iOS 和 Android 三个平台，核心依赖 `expo-auth-session` 包。

---

## 通用认证准则

在使用认证 API 时，请遵循以下原则：

1. **务必调用浏览器完成方法**：调用 `WebBrowser.maybeCompleteAuthSession()` 以确保弹出窗口能正确关闭。
2. **使用内置工具生成重定向链接**：通过 `makeRedirectUri()` 生成重定向 URI，它内部借助 `expo-linking` 处理了跨平台的复杂性。
3. **使用 Hook 构建认证请求**：使用 `useAuthRequest` 等 Hook 来构建请求，它支持异步初始化，可以防止移动浏览器阻塞。
4. **在请求加载完成前禁用登录按钮**：在 `request` 对象就绪之前，保持登录按钮处于 `disabled` 状态。
5. **Web 环境需要用户主动交互**：在 Web 端，必须由用户主动触发（如点击按钮）才能发起认证弹窗。
6. **Expo Go 不支持自定义 scheme**：标准的 Expo Go 环境缺少自定义 scheme 支持，因此不适合在本地测试 OAuth。请使用 **Development Build**（开发构建）来模拟生产环境的重定向行为。

> **基于文档内容推导**：以上准则适用于所有 OAuth / OpenID Connect 提供商，是后续各具体集成方案的基础。

---

## 获取访问令牌（Access Token）

OAuth 2.0 协议通常用于安全授权。在**授权码许可（Authorization Code Grant）**流程中，身份服务会先颁发一个临时授权码（code），然后用该授权码换取访问令牌（access token）。

**关键安全要点**：由于移动应用的客户端包是不安全的位置（可以被反编译），**不能**在客户端存储客户端密钥（client secret）。因此，授权码换取令牌的操作**必须在后端服务器上执行**。可以使用服务端组件或 API 路由来确保客户端密钥的安全。

> **基于文档内容推导**：这意味着在 Expo 前端应用中，你只能拿到授权码（code），真正的 token 交换需要你的后端配合完成。

---

## 各提供商集成示例

### GitHub 集成

GitHub 使用 OAuth 2.0 协议，支持 PKCE（Proof Key for Code Exchange），但**不支持自动发现（Auto-Discovery）**，因此需要手动指定端点地址。

**注意事项**：
- GitHub 限制每个应用只能配置**一个重定向 URI**，因此 Web 端和原生端需要分别注册不同的应用。
- 原生端的重定向 URI 需要使用双斜杠格式。
- 撤销（revocation）URL 中需要动态拼接你的 `CLIENT_ID`。

```tsx
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

// 确保认证会话的弹出窗口能正确关闭
WebBrowser.maybeCompleteAuthSession();

// 手动定义 GitHub 的 OAuth 端点（GitHub 不支持自动发现）
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/<CLIENT_ID>',
};

export default function App() {
  // useAuthRequest 返回三个值：
  // - request: 认证请求对象（异步初始化，加载完成前为 null）
  // - response: 认证响应结果
  // - promptAsync: 触发认证弹窗的函数
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',       // 替换为你的 GitHub OAuth App 的 Client ID
      scopes: ['identity'],         // 请求的权限范围
      redirectUri: makeRedirectUri({
        scheme: 'your.app'          // 替换为你的应用自定义 scheme
      }),
    },
    discovery
  );

  // 监听认证响应
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // 拿到授权码 code 后，应发送到你的后端服务器换取 access token
    }
  }, [response]);

  return (
    <Button
      disabled={!request}   // request 未就绪时禁用按钮
      title="Login"
      onPress={() => {
        promptAsync();       // 用户点击时触发认证弹窗
      }}
    />
  );
}
```

**代码要点解析**：
- `WebBrowser.maybeCompleteAuthSession()`：在组件顶层调用，用于在 Web 端关闭认证弹窗。
- `discovery` 对象：手动配置 GitHub 的三个端点 URL，因为 GitHub 不提供 `.well-known/openid-configuration` 自动发现接口。
- `makeRedirectUri({ scheme: 'your.app' })`：生成原生端的重定向 URI，格式类似 `your.app://oauthredirect`。
- `useEffect` 监听 `response`：当用户完成认证后，从 `response.params` 中取出 `code`。

---

### Okta 集成

Okta 基于 OpenID Connect 协议，支持 PKCE，并且**支持自动发现（Auto-Discovery）**——只需提供 Okta 域名，SDK 会自动获取所有端点信息。

**注意事项**：
- Okta 会为你分配重定向 URI，**不允许自定义**。

```tsx
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { Button, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  // useAutoDiscovery 会自动从 Okta 域名获取所有 OAuth 端点
  const discovery = useAutoDiscovery('https://<OKTA_DOMAIN>.com/oauth2/default');

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',                    // 替换为你的 Okta 应用的 Client ID
      scopes: ['openid', 'profile'],             // OpenID Connect 标准 scope
      redirectUri: makeRedirectUri({
        native: 'com.okta.<OKTA_DOMAIN>:/callback',  // Okta 分配的原生重定向 URI
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // 将 code 发送到后端换取 token
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Login"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
```

**代码要点解析**：
- `useAutoDiscovery('https://<OKTA_DOMAIN>.com/oauth2/default')`：自动发现 Hook，内部会请求 `/.well-known/openid-configuration` 获取端点信息，省去手动配置的麻烦。
- `makeRedirectUri({ native: 'com.okta.<OKTA_DOMAIN>:/callback' })`：使用 Okta 分配的原生重定向 URI，注意格式中只有一个斜杠（`:/`）。

---

## 重定向 URI 格式说明

原生应用和独立构建（standalone build）通常使用**自定义 scheme** 路径，其中包含一到三个斜杠。

这些 URI 适用于：
- 本地测试
- 应用商店构建
- 使用 prebuild 或 EAS Build 的现有 React Native 项目

**生成方式**：通过 `makeRedirectUri` 的 `native` 参数指定。你可以配置 scheme、路径、三个斜杠的格式、或查询参数。

> **基于文档内容推导**：如果你修改了项目的 scheme，需要在重新构建之前清理并重新生成原生目录（例如删除 `android/` 和 `ios/` 后重新 prebuild）。

配置好重定向 URI 后，将生成的 URI 传递给 `promptAsync` 函数即可触发认证流程。

---

## 优化登录体验

流畅的授权流程对留住用户至关重要。以下策略可以优化安全性和速度。

### 浏览器预热（Browser Pre-initialization）

Android 应用可以在后台预加载浏览器，以加快认证弹窗的弹出速度。

```tsx
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

function App() {
  useEffect(() => {
    // 预热浏览器，减少后续认证弹窗的加载时间
    WebBrowser.warmUpAsync();

    // 组件卸载时释放浏览器资源
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // 后续执行认证逻辑...
}
```

**代码要点解析**：
- `WebBrowser.warmUpAsync()`：在组件挂载时预加载 Android 的 Custom Tabs 浏览器实例。
- `WebBrowser.coolDownAsync()`：在组件卸载时释放预加载的资源，避免内存泄漏。
- 这两个方法只在 Android 上有效果，iOS 和 Web 端会自动忽略。

> **基于经验建议**：建议在应用的根组件或认证页面中尽早调用 `warmUpAsync()`，这样当用户点击登录按钮时，浏览器已经准备就绪，体验更流畅。

---

### 旧式隐式授权流程（Legacy Implicit Flow）

隐式流程（Implicit Flow）历史上允许在没有客户端密钥的情况下直接获取令牌。但由于存在**令牌注入（Token Injection）**等安全漏洞，这种方式**已被弃用**。

现代实现应使用**授权码 + PKCE** 的方式。不过，`expo-auth-session` 库仍然保留了对隐式流程的支持，以兼容旧代码库。

```tsx
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Spotify 的授权端点
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      // 注意：ResponseType.Token 表示使用隐式流程，直接返回 token
      responseType: ResponseType.Token,
      clientId: 'CLIENT_ID',
      scopes: ['user-read-email', 'playlist-modify-public'],
      redirectUri: makeRedirectUri({
        scheme: 'your.app'
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response && response.type === 'success') {
      // 隐式流程中，token 直接在 response.params 中
      const token = response.params.access_token;
    }
  }, [response]);

  return <Button disabled={!request} onPress={() => promptAsync()} title="Login" />;
}
```

**代码要点解析**：
- `responseType: ResponseType.Token`：指定使用隐式流程，响应类型为 token（而非授权码）。
- 与授权码流程的区别：隐式流程直接从 `response.params.access_token` 获取令牌，不需要后端换取。但这意味着令牌暴露在客户端，安全性较低。

> **基于文档内容推导**：除非你维护的是旧项目且无法迁移，否则新项目应始终使用授权码（Authorization Code）+ PKCE 流程。

---

### 安全本地存储（Secure Local Storage）

在移动平台上，可以使用 `expo-secure-store` 对凭证进行加密存储。它利用了原生的 Keychain（iOS）和 SharedPreferences（Android）来实现安全存储，比普通的 `AsyncStorage` **安全得多**。

**注意**：`expo-secure-store` 没有 Web 端的实现，因此需要针对 Web 做特殊处理。

将认证结果安全存储起来，可以避免用户重复登录。

```tsx
import * as SecureStore from 'expo-secure-store';

const MY_SECURE_AUTH_STATE_KEY = 'MySecureAuthStateKey';

function App() {
  const [, response] = useAuthRequest({});

  useEffect(() => {
    if (response && response.type === 'success') {
      const auth = response.params;
      const storageValue = JSON.stringify(auth);

      if (Platform.OS !== 'web') {
        // 在移动设备上使用 SecureStore 安全存储认证信息
        SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, storageValue);
      }
      // Web 端需要使用其他存储方式（如 sessionStorage 或 localStorage）
    }
  }, [response]);

  // 更多登录逻辑...
}
```

**代码要点解析**：
- `SecureStore.setItemAsync(key, value)`：将数据以键值对的形式加密存储到设备的原生安全存储中。
- `Platform.OS !== 'web'`：因为 `expo-secure-store` 仅支持 iOS 和 Android，Web 端需要另外处理。
- 读取时可使用 `SecureStore.getItemAsync(MY_SECURE_AUTH_STATE_KEY)` 恢复存储的认证状态。

> **基于经验建议**：建议在应用启动时读取 `SecureStore` 中保存的认证状态，如果存在有效的 token，可以跳过登录流程直接进入应用，提升用户体验。同时需要注意 token 的过期处理。

---

## 安装依赖

在使用上述代码之前，需要安装相关的 Expo 包：

```bash
npx expo install expo-auth-session expo-web-browser expo-secure-store expo-linking
```

- `expo-auth-session`：核心的认证会话管理库，提供 `useAuthRequest`、`useAutoDiscovery` 等 Hook。
- `expo-web-browser`：管理应用内浏览器，处理 OAuth 弹窗和预热功能。
- `expo-secure-store`：提供加密的本地存储能力（仅 iOS / Android）。
- `expo-linking`：处理深层链接和重定向 URI，`makeRedirectUri` 内部依赖此包。

> **基于文档内容推导**：`expo-linking` 虽然没有在代码示例中直接 import，但它是 `makeRedirectUri` 的内部依赖，建议一并安装。

---

## 文档导航

- **上一页**：[contacts](./151__contacts.md)
- **下一页**：[using hermes](./153__using-hermes.md)
