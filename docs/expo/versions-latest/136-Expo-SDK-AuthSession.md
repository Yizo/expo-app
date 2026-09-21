# 136｜Expo SDK AuthSession 浏览器登录

**翻页：**[上一页：Expo SDK Audio](./135-Expo-SDK-Audio.md) · [目录](./README.md) · [下一页：Expo SDK BackgroundFetch](./137-Expo-SDK-BackgroundFetch.md)

**官方页面：**[AuthSession · Latest](https://docs.expo.dev/versions/latest/sdk/auth-session/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/auth-session/)

**版本边界：**Latest 推荐 `expo-auth-session ~57.0.12`；SDK v56.0.0 推荐 `~56.0.19`。两版的主流程、Hook、请求类、类型和方法目录一致。本页按当前文档重写代码示例；SDK 56 项目应采用精确版链接与 `expo install` 配套依赖。

## AuthSession 解决什么问题

`expo-auth-session` 帮 App 通过系统浏览器或 Web 弹窗完成 OAuth / OpenID Connect 登录。它和 Expo 的 `expo-web-browser`、`expo-crypto` 配合：打开身份提供商的登录页，用户授权后浏览器把结果重定向回 App，再让 App 解析授权码或 token。

如果身份提供商有专用 SDK，应优先使用那个 SDK，因为它能处理供应商自己的登录细节。使用通用 OAuth 时，**不要把 client secret 或其他密钥放进 App / Web 前端代码**：安装包和浏览器资源都能被读取。需要 secret 的调用应放到服务端。原生应用属于公开客户端；常见授权码模式默认启用 PKCE，不依赖在客户端保密。

安装 `expo-auth-session` 时也要安装 peer dependency `expo-crypto`：

```sh
npx expo install expo-auth-session expo-crypto
# 也可使用 yarn / pnpm / bun expo install expo-auth-session expo-crypto
```

## 先配置回跳链接（deep link）

**Deep link（深层链接）**是能把用户带到 App 内特定位置的 URL。身份提供商必须把回调 URL 加入允许列表；App 也要注册能接收该 URL 的 URI scheme。Standalone / development build 可在 app config 中设置 `scheme`：

```json
{
  "expo": {
    "scheme": "mycoolredirect"
  }
}
```

新 scheme 会写进原生 App 配置，所以要重新构建 iOS / Android 客户端，不能只靠 OTA 更新添加。使用已有 React Native 原生工程时，可用 `uri-scheme` 工具添加、查看和测试 scheme：

```sh
npx uri-scheme add mycoolredirect
npx uri-scheme list

# 改完原生配置后重建并在模拟器或设备中测试
yarn android
yarn ios
npx uri-scheme open mycoolredirect://some/redirect
```

用 `makeRedirectUri()` 生成当前开发环境或平台的回调地址，并在身份提供商控制台登记对应 URL：

```ts
import * as AuthSession from 'expo-auth-session';

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'mycoolredirect',
  path: 'redirect',
});
// Development Build: mycoolredirect://redirect
// Expo Go 开发地址形式：exp://127.0.0.1:8081/--/redirect
// Web 开发：本地 HTTPS 地址加 /redirect
// Web 生产：固定部署域名加 /redirect

const rootRedirect = AuthSession.makeRedirectUri({
  scheme: 'scheme2',
  preferLocalhost: true,
  isTripleSlashed: true,
});
// 例如原生地址 scheme2:///；Web 地址由当前站点决定。
```

在 Expo Go 中，回调通常带有 Expo 开发服务器地址；开发构建 / 正式原生 App 使用配置的自定义 scheme。生产 Web 应固定设置站点 URL。开发、生产及不同平台的 Redirect URI 都要按身份提供商要求加入 allowlist，并且换取 token 时要沿用授权时同一个 `redirectUri`。

## 一次浏览器认证的顺序

1. 用户点击登录，App 根据身份提供商的 Discovery Document 生成授权 URL。
2. AuthSession 打开系统浏览器或 Web 登录窗口；系统浏览器可以复用已有登录 Cookie。
3. 身份提供商验证用户后，检查允许列表并重定向到 App scheme / Web 回调。
4. App 解析响应中的授权码或错误；授权码模式再向 token endpoint 换取 access token。

**Discovery Document** 是身份提供商公开的端点清单，例如授权、token、用户信息、撤销 token 的 URL。OIDC 的 `issuer` 是服务端声明的 HTTPS 身份地址，应不带 query 和 fragment。Web 登录还需要在应用入口完成 AuthSession 的浏览器弹窗收尾：

```tsx
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Button, Text, View } from 'react-native';

// Web 中需要它来关闭已完成登录的弹窗。
WebBrowser.maybeCompleteAuthSession();

const clientId = 'YOUR_PUBLIC_CLIENT_ID'; // 这是公开标识，不是 client secret
const discoveryUrl = 'https://example.com'; // 替换为提供商 issuer HTTPS 地址

export default function SignInScreen() {
  const discovery = AuthSession.useAutoDiscovery(discoveryUrl);
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'mycoolredirect',
    path: 'redirect',
  });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
    },
    discovery
  );

  return (
    <View>
      <Button
        title="使用浏览器登录"
        disabled={!request}
        onPress={() => promptAsync()}
      />
      <Text>认证状态：{response?.type ?? '尚未开始'}</Text>
      {response?.type === 'success' && (
        <Text>收到回调；按授权码模式继续换取 token。</Text>
      )}
    </View>
  );
}
```

`useAuthRequest(config, discovery)` 返回 `[request, response, promptAsync]`：加载完成前 `request` 为 `null`；打开登录前 `response` 为 `null`；`promptAsync()` 才打开浏览器。结果可能是成功、授权错误、用户取消，或手动 dismiss。Web 需要 `WebBrowser.maybeCompleteAuthSession()` 关闭弹窗。

授权码返回成功后，SDK 提供 `AuthSession.exchangeCodeAsync(config, discovery)` 用 code 向 `tokenEndpoint` 换取 `TokenResponse`。如果使用 PKCE，授权请求产生的 `request.codeVerifier` 必须与 token exchange 对应；要按服务端 OAuth 配置提交。拿到 access token 后，可用 `fetchUserInfoAsync(token, discovery)` 请求 OIDC user-info endpoint（提供商支持时）。页面的核心参考 API：

```ts
const tokenResponse = await AuthSession.exchangeCodeAsync(
  {
    clientId,
    code: authorizationCode,
    redirectUri,
    extraParams: { code_verifier: request.codeVerifier! },
  },
  discovery!
);

const profile = await AuthSession.fetchUserInfoAsync(tokenResponse, discovery!);
```

`AuthRequest` 也可不经 React Hook 直接使用：

```ts
const authRequest = new AuthSession.AuthRequest({
  clientId,
  redirectUri,
  responseType: AuthSession.ResponseType.Code,
  scopes: ['openid', 'profile'],
  usePKCE: true,
});

const result = await authRequest.promptAsync(discovery!);
const authorizationUrl = await authRequest.makeAuthUrlAsync(discovery!);
const parsed = authRequest.parseReturnUrl('mycoolredirect://redirect?code=...');
```

## Hook、类与方法速查

### Hooks

| Hook | 输入 / 返回 | 用途 |
| --- | --- | --- |
| `useAuthRequest(config, discovery)` | `[request, response, promptAsync]` | 组装 OAuth 授权请求并弹出认证窗口。 |
| `useAuthRequestResult(request, discovery, customOptions?)` | `[response, promptAsync]` | 已有 `AuthRequest` 时订阅结果并触发认证。 |
| `useAutoDiscovery(issuerOrDiscovery)` | `DiscoveryDocument \| null` | 从 HTTPS issuer URL 加载 OIDC discovery 信息；加载前为 `null`。 |
| `useLoadedAuthRequest(config, discovery, AuthRequestInstance)` | `AuthRequest \| null` | 预先创建并加载一个 AuthRequest 实例。 |

### 请求 / 响应类

| 类 | 重点能力 |
| --- | --- |
| `AuthRequest` | `codeVerifier`、`state`、`url`；可 `getAuthRequestConfigAsync()`、`makeAuthUrlAsync()`、`parseReturnUrl(url)`、`promptAsync(discovery, options?)`。`state` 可帮助防御 CSRF；`codeVerifier` 是 PKCE 证明材料。 |
| `AccessTokenRequest` | 以授权码换 access token；`performAsync()` 需要带 `tokenEndpoint` 的 discovery。 |
| `RefreshTokenRequest` | 以 refresh token 请求新 access token；provider 必须支持并返回 refresh token。 |
| `RevokeTokenRequest` | 请求吊销 access / refresh token；provider 没有 revocation endpoint 时不支持。 |
| `TokenRequest` / `Request` | 通用网络请求基类；提供请求头、请求体、配置与 `performAsync()`。 |
| `TokenResponse` | 保存 access / refresh token 及有效期；可读 `rawResponse?`，调用 `fromQueryParams()`、`getRequestConfig()`、`isTokenFresh()`、`shouldRefresh()`、`refreshAsync()`。 |
| `AuthError` / `TokenError` / `ResponseError` | 标准化授权或 token 请求错误；可读 `code`、`description?`、`info?`、`params`、`uri?` 等字段。 |

### AuthSession 工具函数

| 函数 | 作用 |
| --- | --- |
| `makeRedirectUri(options?)` | 依平台和构建环境生成 redirect URI；新项目的首选方法。 |
| `fetchDiscoveryAsync(issuer)` / `resolveDiscoveryAsync(issuerOrDiscovery)` / `issuerWithWellKnownUrl(issuer)` | 获取或补全 OpenID Connect 端点元数据。 |
| `exchangeCodeAsync(config, discovery)` | 授权码换 token；返回 `Promise<TokenResponse>`。 |
| `refreshAsync(config, discovery)` | 刷新 token；无 `refresh_token` 就不能刷新。 |
| `fetchUserInfoAsync(token, discovery)` | 调用 provider userInfo endpoint，返回通用资料对象。 |
| `revokeAsync(config, discovery)` | 撤销 token；provider 没有 `revocationEndpoint` 时会失败。 |
| `dismiss()` | 关闭 / 取消当前活跃认证窗口。 |
| `getCurrentTimeInSeconds()` / `requestAsync(url, fetchRequest)` | 获取秒级当前时间，或执行通用请求。 |
| `loadAsync(config, issuerOrDiscovery)` | 建立并加载一个 `AuthRequest`。 |
| `getDefaultReturnUrl()` / `getRedirectUrl(path?)` | 旧回调 URL 辅助 API；`getDefaultReturnUrl` 已弃用，优先 `makeRedirectUri()`。Native Bare 场景下 `getRedirectUrl` 可能抛错。 |

旧方法的文档示例形态如下；新项目应改用上面平台感知的 `makeRedirectUri()`：

```ts
const oldRedirect = AuthSession.getRedirectUrl('redirect');
```

## 配置与结果类型

- `AuthRequestConfig`：必需的 `clientId`、`redirectUri`；可含 `codeChallenge?`、`codeChallengeMethod?`、`extraParams?`、`prompt?`、`responseType?`、`scopes?`、`state?`、`usePKCE?`。默认响应为授权码，PKCE 默认开启，challenge 默认用安全的 `S256`。**不要设置 `clientSecret` 到客户端**。
- `AuthRequestPromptOptions`：浏览器打开配置，如 `url?`、Web 的 `windowFeatures?`；大多数场景不需要手动提供 URL。
- `AuthSessionRedirectUriOptions`：`scheme?`、`path?`、`native?`、`queryParams?`、`preferLocalhost?`、`isTripleSlashed?`。`native` 用于手动原生 scheme，并优先于其他字段；`preferLocalhost` 只适用于 iOS Simulator 测试。
- `AuthSessionResult`：`type` 是 `'success' | 'error' | 'cancel' | 'dismiss' | 'opened' | 'locked'` 等状态；成功时可读 `params`、`url` 和可选 `authentication`；错误时可读 `error`。旧 `errorCode` 字段已弃用。
- `DiscoveryDocument`：包含 `authorizationEndpoint?`、`tokenEndpoint?`、`revocationEndpoint?`、`userInfoEndpoint?`、`endSessionEndpoint?`、`registrationEndpoint?` 及 provider metadata。授权码请求至少要有 authorization endpoint。
- `TokenRequestConfig`：`clientId`、`extraHeaders?`、`extraParams?`、`scopes?`，还定义了不应放客户端的 `clientSecret?`。`AccessTokenRequestConfig` 再要求 `code` 与授权时相同的 `redirectUri`；`RefreshTokenRequestConfig` 增加 refresh token；`RevokeTokenRequestConfig` 增加要撤销的 token 和可选 `tokenTypeHint`。
- `TokenResponseConfig`：`accessToken`、`expiresIn?`、`idToken?`、`issuedAt?`、`refreshToken?`、`scope?`、`state?`、`tokenType?`。原始服务端响应可在 `rawResponse?` 查看；`ServerTokenResponseConfig` 使用 OAuth 响应的 snake_case 字段。
- 错误类型：`AuthErrorConfig` / `ResponseErrorConfig` 描述错误 `code`、`description?`、`uri?`、`state?`、`params` 与附加 `info?`。
- 其他类型：`AuthDiscoveryDocument` 是只保留授权 endpoint 的 discovery 子集；`Issuer` 是无 query / fragment 的 HTTPS URL；`IssuerOrDiscovery` 是 issuer 或已加载 discovery 对象；`PromptMethod` 表示调用 prompt 的异步函数；`Headers` 扩展 `Accept?`、`Authorization?`、`Content-Type`；`ProviderAuthRequestConfig` 可传 `language?`。
- Provider / 辅助类型：`ProviderMetadata` 与 `ProviderMetadataEndpoints` 表示 OIDC 服务能力与 endpoint；`FetchRequest` 包括 `body?`、`dataType?`、`headers?`、`method?`。旧 `FacebookAuthRequestConfig`、`GoogleAuthRequestConfig` / `FetchRequest` 用于 provider 特定集成的方式已标注弃用；参考具体 provider 的官方库。

## 枚举速查

| 枚举 | 值 | 说明 |
| --- | --- | --- |
| `CodeChallengeMethod` | `S256`、`Plain` | 用于 PKCE；`S256` 是默认且推荐的，`Plain` 会原样发送 verifier，安全性不足。 |
| `GrantType` | `authorization_code`、`client_credentials`、`implicit`、`refresh_token` | 标记请求授权类型；client credentials 需要 secret，不适合把 secret 放进 App。 |
| `Prompt` | `consent`、`login`、`none`、`select_account` | 要求重新授权、重新登录、静默检查或选账号。 |
| `ResponseType` | `code`、`id_token`、`token` | 请求授权码或 token；普通移动端登录优先使用 code + PKCE。 |
| `TokenType` | `bearer`、`mac` | 访问 token 的类型字符串。 |
| `TokenTypeHint` | `access_token`、`refresh_token` | 告知撤销 endpoint 目标 token 的类别。 |

## 深层链接事件与 Web 行为

AuthSession 会处理它自己的回调 URL。若 App 也监听通用 URL，可忽略默认回调中包含 `+expo-auth-session` 的事件，避免登录回调被当作普通业务链接再次路由。使用 React Navigation 时需在 linking 的 `getStateFromPath` 中做相同过滤，因为导航库处理深链的路径不同。

```ts
import { Linking } from 'react-native';

const subscription = Linking.addEventListener('url', ({ url }) => {
  if (url.includes('+expo-auth-session')) return;
  handleBusinessDeepLink(url);
});

// 页面不再需要时清理监听器。
subscription.remove();
```

在 Web 上，浏览器登录返回的数据可能来自 URL query 或 hash。使用 `AuthSessionResult.params` 读取回调参数；若采用旧的 implicit flow，`TokenResponse.fromQueryParams(response.params)` 可把参数包装成 `TokenResponse`。这类旧流程不应替代常见 code + PKCE 方案。

## 给 Web React 开发者的新术语

- **OAuth 2.0：**应用通过用户授权拿到访问令牌，再用令牌访问受保护的 API；它通常不负责解释“用户身份”。
- **OpenID Connect（OIDC）：**在 OAuth 授权上增加身份认证约定，常见 scope 包括 `openid`、`profile`、`email`，并可以获取 ID token / user info。
- **Authorization code：**浏览器认证成功后回给客户端的短期授权码；客户端再用它向 token endpoint 换 token。
- **Access token / Refresh token：**access token 用来访问 API，期限短；refresh token 在 provider 支持时用来换新 access token，应按敏感凭据保护。
- **PKCE：**客户端先生成一次性随机 `codeVerifier`，把其哈希形式 `codeChallenge` 发给 provider，换 token 时证明请求来自同一客户端。移动 App 无法安全保存 client secret，因此授权码模式通常启用 PKCE。
- **`state`：**由客户端发出的随机关联值，重定向返回时核对它是否一致，可降低 CSRF / 请求串线风险。
- **URI scheme / redirect allowlist：**scheme 是如 `mycoolredirect://` 的 App 地址协议；provider 必须允许 App 使用的 callback，才能重定向回来。

## 页面代码主题覆盖

已将官方页面代码按主题改写：四种包管理器安装依赖；`uri-scheme` 添加 / 列出 / 打开 scheme 与重建原生 App；standalone `app.json` scheme；`useAuthRequest` 解构与打开浏览器；Web 关闭认证弹窗；`useAutoDiscovery` 发现端点；`AuthRequest` 创建、prompt、生成 URL、解析返回 URL；`makeRedirectUri` 两组平台示例；旧 `getRedirectUrl` 输出示例所表达的用途；换 token 与读取 user-info 的 API 用法；`Linking` 过滤 AuthSession 自己的回调事件；隐式授权结果包装方式。官方 `AuthRequestConfig`、`AuthRequestPromptOptions`、`AuthSessionResult`、token exchange / refresh / revoke 配置及所有枚举也在类型速查中解释。

**来源：**[Expo AuthSession · Latest](https://docs.expo.dev/versions/latest/sdk/auth-session/) · [Expo AuthSession · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/auth-session/)

**翻页：**[上一页：Expo SDK Audio](./135-Expo-SDK-Audio.md) · [目录](./README.md) · [下一页：Expo SDK BackgroundFetch](./137-Expo-SDK-BackgroundFetch.md)
