# Expo AuthSession：浏览器 OAuth / OpenID Connect 认证学习指南

> 本文对应 Expo **下一版本 SDK** 的未发布文档，原文修改日期为 **2026 年 5 月 23 日**。面向当前稳定项目时，应核对 SDK 56 的最新稳定版文档，避免直接依赖尚未发布的 API 行为。

## 文档解决的问题

`expo-auth-session` 是一个跨 Android、iOS 和 Web 的认证库，用来在应用中处理基于浏览器的认证流程，例如：

- 打开身份提供商的登录页面。
- 接收 OAuth 2.0 授权码或令牌。
- 将浏览器重定向重新交给应用。
- 用授权码交换访问令牌。
- 刷新或撤销令牌。
- 通过 OpenID Connect 获取用户信息。

它适合需要接入通用 OAuth 2.0 或 OpenID Connect 提供商的 Expo / React Native 应用。

文档明确建议：如果身份提供商有专用 React Native SDK，应优先使用专用 SDK。例如：

- Google：`@react-native-google-signin/google-signin`
- Facebook：`react-native-fbsdk-next`

这些 SDK 能处理提供商特有的原生配置和认证细节。`expo-auth-session` 更适合通用 OAuth/OIDC 流程，或者没有合适专用 SDK 的提供商。

## React Web 开发者需要先理解的背景

### AuthSession 不是应用内登录表单

在普通 React Web 项目中，OAuth 登录通常表现为：

1. 页面跳转或打开弹窗。
2. 用户在提供商网站登录。
3. 提供商重定向回网站 URL。
4. 前端或后端处理回调参数。

在移动端，整体协议没有改变，但“返回地址”不能简单理解为普通网页路由。应用需要注册一个能够重新唤起自己的 URI，例如：

```text
mycoolredirect://redirect
```

操作系统看到这个 URI 后，会把它交给注册了 `mycoolredirect` scheme 的应用。这种机制称为 **Deep Link（深层链接）**。

### AuthSession 依赖的 Expo 模块

`AuthSession` 内部会使用：

- `expo-web-browser`：打开系统浏览器认证会话。
- `expo-crypto`：生成 PKCE 等认证流程所需的密码学数据。

系统浏览器认证会话通常可以共享系统浏览器的 Cookie。因此，如果用户已经在系统浏览器登录过身份提供商，可能不必再次输入账号密码。

### OAuth 与 OpenID Connect 的分工

可以粗略理解为：

- **OAuth 2.0**：解决“应用可以访问哪些受保护资源”。
- **OpenID Connect（OIDC）**：在 OAuth 2.0 上增加用户身份认证能力。
- **Access Token**：访问提供商 API 的凭据。
- **Refresh Token**：在 Access Token 过期后申请新令牌。
- **ID Token**：OIDC 中描述已认证用户身份的令牌。
- **Authorization Code**：短期授权码，需要进一步交换 Access Token。

## 安装

`expo-crypto` 是 `expo-auth-session` 的 peer dependency，必须一同安装：

```sh
# npm
npx expo install expo-auth-session expo-crypto

# yarn
yarn expo install expo-auth-session expo-crypto

# pnpm
pnpm expo install expo-auth-session expo-crypto

# bun
bun expo install expo-auth-session expo-crypto
```

这里使用 `expo install`，是为了让 Expo 根据项目 SDK 选择兼容的软件包版本。

如果是在已有的普通 React Native 工程，也就是 bare workflow 中安装，还必须先配置 Expo Modules，使该工程能够使用 Expo 原生模块。

## 配置回调地址与 Deep Link

### 注册 URI Scheme

在原生应用中，需要注册一个自定义 scheme。例如，让应用处理：

```text
mycoolredirect://
```

可以执行：

```sh
npx uri-scheme add mycoolredirect
```

查看当前工程注册的全部 scheme：

```sh
npx uri-scheme list
```

启动应用并测试 Deep Link：

```sh
yarn android
yarn ios
npx uri-scheme open mycoolredirect://some/redirect
```

如果配置正确，操作系统应当打开对应应用，并把该 URL 交给应用处理。

### Expo 应用配置

在 Expo app config 中可以这样声明：

```json
{
  "expo": {
    "scheme": "mycoolredirect"
  }
}
```

修改 scheme 后必须重新构建独立应用。它属于原生应用配置，不能仅通过 OTA Update 更新。

如果没有配置 scheme：

- 用户仍可能在浏览器中完成认证。
- 浏览器却无法把认证结果传回应用。
- 用户需要手动关闭认证窗口。
- AuthSession 最终可能得到取消事件，而不是成功结果。

这与 React Web 的重要区别是：Web 回调路由通常由服务器部署决定，而原生 scheme 必须编译进应用，由操作系统进行注册。

## 浏览器认证的完整流程

文档描述的典型流程如下。

### 1. 用户发起登录

用户点击“登录”按钮，应用开始构造 OAuth 授权请求。

请求 URL 通常包含：

- `client_id`
- `redirect_uri`
- `response_type`
- `scope`
- `state`
- PKCE 的 `code_challenge`
- 提供商要求的其他参数

### 2. 打开系统浏览器认证页面

应用打开身份提供商的登录页面。Expo 的 WebBrowser API 负责创建适合认证的浏览器会话，并尽可能共享系统浏览器 Cookie。

这不同于在 Web 页面中直接使用 React Router 跳转，也不同于把登录页放进普通 WebView。

### 3. 提供商重定向

认证成功后，提供商把用户重定向到请求中的 `redirect_uri`。

该 URL 必须预先加入提供商控制台的回调地址 allowlist。否则提供商通常会拒绝请求。

允许列表可以防止攻击者把认证结果重定向到冒充当前应用的地址。

认证数据可能位于：

- URL query
- URL hash
- 两者同时存在

### 4. 应用处理回调

移动操作系统根据 scheme 唤起应用。AuthSession 接收回调 URL、解析参数，并返回 `AuthSessionResult`。

如果使用 Authorization Code Flow，成功结果通常只是授权码，应用还需要把授权码交换为 Token。

## 推荐的 React Hook 使用方式

### `useAuthRequest(config, discovery)`

这是组件中最常用的入口：

```ts
const [request, response, promptAsync] = useAuthRequest(
  {
    clientId,
    redirectUri,
    scopes: ['openid', 'profile'],
  },
  discovery
);
```

返回数组中的内容依次是：

- `request`：已经加载完成的 `AuthRequest`；加载前为 `null`。
- `response`：认证完成后的结果；调用并完成 `promptAsync` 前为 `null`。
- `promptAsync`：打开浏览器并发起认证的方法。

典型按钮需要等待 `request` 准备完成：

```tsx
<Button
  disabled={!request}
  title="登录"
  onPress={() => promptAsync()}
/>
```

在 Web 平台，为了让认证完成后弹窗能够自动关闭，需要调用：

```ts
WebBrowser.maybeCompleteAuthSession();
```

否则认证可能已经成功，但 OAuth 弹窗不会按预期关闭。

如果采用 Implicit Grant，可以把 `response.params` 传给：

```ts
TokenResponse.fromQueryParams(response.params);
```

从而得到便于检查和刷新令牌的 `TokenResponse`。不过文档默认的 `responseType` 是 `Code`。

### `useAutoDiscovery(issuerOrDiscovery)`

如果提供商支持 OpenID Connect Discovery，可以通过 issuer 自动读取端点：

```ts
const discovery = useAutoDiscovery('https://example.com/auth');
```

获取完成前返回 `null`。

Issuer 必须是：

- `https` URL
- 不包含 query
- 不包含 fragment
- 与提供商声明的 Issuer Identifier 一致

### 其他 Hook

- `useAuthRequestResult(request, discovery, customOptions)`：根据已有请求生成认证结果和 `PromptMethod`。
- `useLoadedAuthRequest(config, discovery, AuthRequestInstance)`：加载并返回 `AuthRequest`，完成前返回 `null`。

原文没有为这两个 Hook 提供完整使用场景示例。

## Discovery Document

`DiscoveryDocument` 是身份提供商端点的集合，常见字段包括：

| 字段 | 用途 |
| --- | --- |
| `authorizationEndpoint` | 打开登录与授权页面 |
| `tokenEndpoint` | 用授权码或 Refresh Token 获取 Token |
| `userInfoEndpoint` | 获取 OIDC 用户信息 |
| `revocationEndpoint` | 撤销 Token |
| `endSessionEndpoint` | 请求提供商结束用户会话 |
| `registrationEndpoint` | 动态注册 OAuth/OIDC Client |
| `discoveryDocument` | 提供商返回的完整元数据 |

只发起授权请求时，仅要求 `authorizationEndpoint`。后续交换 Token、刷新 Token、获取用户信息或撤销 Token，则分别需要相应端点。

可以自动发现端点：

```ts
const discovery = await AuthSession.fetchDiscoveryAsync(issuer);
```

也可以使用已有对象：

```ts
const discovery = {
  authorizationEndpoint: 'https://provider.example/authorize',
  tokenEndpoint: 'https://provider.example/token',
  userInfoEndpoint: 'https://provider.example/userinfo',
};
```

`resolveDiscoveryAsync()` 可以统一处理 issuer URL 或已有 `DiscoveryDocument`。

## 创建重定向 URI

推荐使用：

```ts
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'my-scheme',
  path: 'redirect',
});
```

不同环境可能产生不同结果：

```text
Development Build: my-scheme://redirect
Expo Go:          exp://127.0.0.1:8081/--/redirect
Web 开发环境:      https://localhost:19006/redirect
Web 生产环境:      https://yourwebsite.com/redirect
```

相关选项如下：

| 选项 | 作用 |
| --- | --- |
| `scheme` | 原生应用注册的 URI 协议 |
| `path` | 在 URI 后追加路径，但不会追加到 `native` |
| `native` | 手动指定 Bare 或独立原生应用的完整 URI，优先级最高 |
| `isTripleSlashed` | 使用 `scheme:///path` 而不是 `scheme://path` |
| `preferLocalhost` | 尝试把 Expo Server IP 转换成 localhost，仅适合 iOS 模拟器 |
| `queryParams` | 添加查询参数 |

Bare React Native 和独立构建的原生应用不能总是自动推导回调地址，因此需要手动配置 `native` 或正确注册 `scheme`。

Web 生产环境也建议硬编码稳定的回调 URL，避免部署环境变化导致生成值与提供商 allowlist 不一致。

以下旧方法需要注意：

- `getDefaultReturnUrl()` 已废弃，应使用 `makeRedirectUri()`。
- `getRedirectUrl()` 在 Native Bare Workflow 中会抛出异常。

## 授权请求配置

`AuthRequestConfig` 是授权阶段的核心配置。

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `clientId` | 是 | 提供商分配的客户端标识，不是秘密 |
| `redirectUri` | 是 | 认证完成后的返回地址 |
| `scopes` | 否 | 请求的权限范围 |
| `responseType` | 否 | 希望授权端返回什么，默认为 `Code` |
| `state` | 否 | 防止 CSRF |
| `usePKCE` | 否 | 是否使用 PKCE，默认为 `true` |
| `codeChallenge` | 否 | 从 code verifier 派生出的 challenge |
| `codeChallengeMethod` | 否 | challenge 算法，默认并推荐 `S256` |
| `prompt` | 否 | 控制是否重新登录、授权或选择账号 |
| `extraParams` | 否 | 附加到授权 URL 的查询参数 |
| `clientSecret` | 否 | 提供商的客户端密钥，但客户端无法安全保存 |

### `clientId` 与 `clientSecret` 不是同一回事

`clientId` 会暴露给用户和授权服务器，不应被视为秘密。

`clientSecret` 则必须保密。文档明确警告：不存在把密钥安全存放在客户端代码中的方法，包括打包后的 iOS、Android 和 Web 前端代码。

需要密钥的请求应由受控服务器完成，再由服务器向客户端返回必要数据。

### PKCE

PKCE 用来保护 Authorization Code Flow。默认启用：

```ts
usePKCE: true
```

`CodeChallengeMethod.S256` 的处理过程是：

1. 将 code verifier 转换为 ASCII。
2. 使用 SHA-256 生成摘要。
3. 将摘要转换成 Base64 URL 编码。

不要使用：

```ts
CodeChallengeMethod.Plain
```

`Plain` 会直接发送 verifier，文档明确说明其安全性不足。

### `state`

`state` 用于抵御 CSRF。请求与回调中的值应当一致。

虽然字段在类型上是可选的，但它承担安全校验作用，不应把“可选”理解为“通常不需要”。

### `prompt`

`Prompt` 用来控制提供商的交互行为：

| 值 | 行为 |
| --- | --- |
| `Consent` | 再次要求用户确认授权 |
| `Login` | 强制重新认证 |
| `None` | 不允许显示 UI，仅检查已有登录或授权状态 |
| `SelectAccount` | 要求用户选择账号 |

在 iOS 上通常无法随意清除系统浏览器 Cookie，因此需要切换账号时，应使用 `SelectAccount` 或 `Login`，而不是依赖“清 Cookie”。

## 使用 `AuthRequest` 类

Hook 适合 React 组件；`AuthRequest` 类则提供更底层的控制：

```ts
const request = new AuthRequest({ ... });

const result = await request.promptAsync(discovery);
const url = await request.makeAuthUrlAsync(discovery);
const parsed = request.parseReturnUrl('<URL From Server>');
```

常用能力包括：

- `getAuthRequestConfigAsync()`：加载并返回完整请求配置。
- `makeAuthUrlAsync()`：生成授权 URL。
- `promptAsync()`：打开浏览器并请求授权。
- `parseReturnUrl()`：解析提供商返回的 URL。

关键属性包括：

- `state`：CSRF 防护值。
- `codeVerifier`：PKCE verifier。
- `url`：生成的授权 URL，尚未生成时为 `null`。

也可以直接调用：

```ts
const request = await AuthSession.loadAsync(config, issuerOrDiscovery);
```

它会构建并预先加载一个 `AuthRequest`。

## 处理认证结果

`AuthSessionResult` 不是只有“成功”和“失败”，必须根据 `type` 分支处理。

| `type` | 含义 |
| --- | --- |
| `success` | 认证成功 |
| `error` | 提供商返回错误 |
| `cancel` | 用户关闭浏览器认证会话 |
| `dismiss` | 应用调用 `AuthSession.dismiss()` 主动关闭 |
| `opened` / `locked` | 认证会话的其他状态 |

成功或错误结果可能包含：

- `params`：回调 URL 中解析出的参数。
- `url`：打开或返回的认证 URL。
- `authentication`：存在 `access_token` 时生成的 `TokenResponse`。
- `error`：结构化 `AuthError`。
- `errorCode`：已废弃的旧错误字段，不应作为新代码的主要依据。

错误对象可能包含：

- `code`
- `description`
- `uri`
- `params`
- `state`
- `info`

部分提供商不会为错误码提供完整描述，`AuthError` 会补充缺失的说明信息。

## 授权码交换 Token

默认 `ResponseType.Code` 返回授权码，而不是可直接访问 API 的 Access Token。

交换方法如下：

```ts
const tokenResponse = await AuthSession.exchangeCodeAsync(
  {
    clientId,
    code,
    redirectUri,
  },
  discovery
);
```

`AccessTokenRequestConfig` 的关键字段是：

- `code`：授权服务器返回的授权码。
- `redirectUri`：如果授权请求中包含了它，交换时必须提供相同值。
- `clientId`
- 可选的 `scopes`、`extraParams` 和 `extraHeaders`

也可以创建 `AccessTokenRequest` 并调用 `performAsync()`。

> **基于文档内容推导：** 回调 URI 在授权请求、提供商控制台和授权码交换三个位置必须保持一致，否则提供商可能拒绝请求。

## Token 管理

### `TokenResponse`

`TokenResponse` 封装了：

| 字段 | 含义 |
| --- | --- |
| `accessToken` | 调用资源 API 的凭据 |
| `refreshToken` | 换取新 Access Token |
| `idToken` | OIDC 身份令牌 |
| `expiresIn` | Access Token 有效秒数 |
| `issuedAt` | 客户端收到 Token 的时间 |
| `scope` | 实际授予的权限范围 |
| `tokenType` | 通常是 `bearer` |
| `state` | 授权请求中使用的 state |
| `rawResponse` | RFC 标准字段之外的原始响应 |

`rawResponse` 可用于读取提供商返回的自定义字段。

### 判断是否需要刷新

可以使用：

```ts
TokenResponse.isTokenFresh(token, secondsMargin);
```

或者实例方法：

```ts
tokenResponse.shouldRefresh();
```

`secondsMargin` 可用于在真正过期前提前刷新，避免请求发出时 Token 已经过期。

### 刷新 Token

```ts
const nextToken = await AuthSession.refreshAsync(
  {
    clientId,
    refreshToken,
  },
  discovery
);
```

也可以使用：

- `RefreshTokenRequest`
- `TokenResponse.refreshAsync()`

限制条件：

- 提供商没有返回 `refresh_token` 时，可能无法刷新。
- 提供商没有返回 `expires_in` 时，库会假定 Token 不过期。
- 刷新操作要求 Discovery Document 中存在 `tokenEndpoint`。

### 撤销 Token

```ts
const revoked = await AuthSession.revokeAsync(
  {
    token,
    tokenTypeHint: TokenTypeHint.RefreshToken,
  },
  discovery
);
```

撤销成功后 Token 将不可继续使用，通常意味着用户需要重新登录。

限制条件：

- 需要提供商暴露 `revocationEndpoint`。
- 很多提供商不支持撤销接口。
- 接口完成时返回 `true`；端点不存在或请求失败时会抛出错误。

`tokenTypeHint` 可以是：

- `AccessToken`
- `RefreshToken`

不传时，由服务器尝试判断 Token 类型。

### 获取用户信息

如果提供商支持 OIDC UserInfo Endpoint：

```ts
const userInfo = await AuthSession.fetchUserInfoAsync(
  { accessToken },
  discovery
);
```

该方法要求 `userInfoEndpoint` 和有效的 `accessToken`。

## Grant Type 与 Response Type

### Response Type

它表示授权端应当返回什么：

| 枚举 | 返回内容 |
| --- | --- |
| `ResponseType.Code` | Authorization Code，默认值 |
| `ResponseType.Token` | Access Token，即 Implicit Flow |
| `ResponseType.IdToken` | ID Token，文档称其为用于 Google OAuth 的自定义注册类型 |

### Grant Type

它表示客户端通过哪种授权方式获取 Token：

| 枚举 | 用途 |
| --- | --- |
| `AuthorizationCode` | 用授权码交换 Token |
| `RefreshToken` | 用 Refresh Token 获取新 Token |
| `Implicit` | 授权端直接返回 Access Token |
| `ClientCredentials` | 客户端凭据流程 |

> **基于文档内容推导：** 移动应用无法安全保存 `clientSecret`，因此需要秘密凭据的 Client Credentials Flow 不应直接在应用中执行，应放在服务器端。

## 安全要求

### 绝不能把秘密写入客户端

文档最明确的安全警告是：

- 不要把任何 Secret Key 写进应用代码。
- 客户端不存在安全保存这些密钥的方法。
- Secret 应保存在服务器。
- 客户端通过自己的后端接口间接执行需要 Secret 的请求。

以下做法都不能真正保护 Secret：

- 放进 `.env` 后打包到客户端。
- 写入 React Native 原生代码。
- 混淆 JavaScript Bundle。
- 隐藏在 Expo 配置中。

### 回调地址必须加入 allowlist

身份提供商控制台中注册的回调地址，应与应用实际发送的 `redirectUri` 一致。Allowlist 不只是配置要求，也是防止认证结果被重定向到恶意应用的重要安全边界。

### 使用 PKCE 与 S256

文档默认启用 PKCE，并明确反对 `Plain`。对于公开客户端，尤其是无法安全保存 Secret 的移动应用，这是授权码流程中的关键防护。

## Web、Expo Go 与原生构建的差异

| 环境 | 回调特点 |
| --- | --- |
| Web | 基于当前 `window.location` 生成；生产环境建议硬编码 |
| Expo Go | 通常使用 `exp://.../--/...` 地址 |
| Development Build | 使用编译进应用的自定义 scheme |
| Expo 独立应用 | 需要在 app config 中声明 scheme 并重新构建 |
| Bare React Native | 通常需要手动指定 `native` URI 并配置原生 Deep Link |

React Web 开发者最容易误解的是：在 Expo Go 中可用的回调地址，不代表生产构建也能直接使用。不同运行环境生成的 URI 不同，而身份提供商通常要求精确注册回调地址。

## 与应用其他 Deep Link 的协作

认证回调只是应用 Deep Link 的一种。应用可能还要处理：

- 推送通知跳转。
- 营销链接。
- 页面分享链接。
- 普通业务 Deep Link。

AuthSession 默认会在返回 URL 中加入：

```text
+expo-auth-session
```

自定义的 `Linking.addEventListener` 处理器可以检查 URL 是否包含该字符串。如果包含，就忽略该事件，让 AuthSession 负责处理。

如果自行提供 `returnUrl`，文档建议考虑加入类似的可识别标记，以便业务 Deep Link 处理器过滤认证事件。

### React Navigation 的特殊情况

使用 React Navigation Deep Linking 时，仅在 `Linking.addEventListener` 中过滤并不充分，因为 React Navigation 有自己的链接解析流程。

需要在 linking 配置中提供自定义 `getStateFromPath`，并在该阶段过滤 AuthSession URL。

## API 能力速查

| 需求 | 推荐 API |
| --- | --- |
| 在 React 组件中准备认证请求 | `useAuthRequest()` |
| 自动读取 OIDC 配置 | `useAutoDiscovery()` |
| 手动创建请求 | `new AuthRequest()` |
| 打开认证页面 | `promptAsync()` |
| 生成授权 URL | `makeAuthUrlAsync()` |
| 创建跨平台回调地址 | `makeRedirectUri()` |
| 解析回调 URL | `parseReturnUrl()` |
| 用授权码换 Token | `exchangeCodeAsync()` |
| 刷新 Token | `refreshAsync()` |
| 判断 Token 是否新鲜 | `TokenResponse.isTokenFresh()` |
| 获取 OIDC 用户信息 | `fetchUserInfoAsync()` |
| 撤销 Token | `revokeAsync()` |
| 主动关闭认证会话 | `dismiss()` |
| 获取当前秒级时间 | `getCurrentTimeInSeconds()` |
| 解析 issuer 或 discovery 对象 | `resolveDiscoveryAsync()` |

`Request`、`TokenRequest`、`AccessTokenRequest`、`RefreshTokenRequest` 和 `RevokeTokenRequest` 提供更底层的面向对象接口。普通组件接入优先使用 Hook 和顶层方法，只有需要精确控制请求体、请求头或执行过程时再直接使用这些类。

## 已废弃或不推荐的内容

文档标记了以下内容：

- `getDefaultReturnUrl()` 已废弃，改用 `makeRedirectUri()`。
- `AuthSessionResult.errorCode` 已废弃，改用结构化 `error`。
- `FacebookAuthRequestConfig` 已废弃，应参考 Facebook 专用认证方案。
- `GoogleAuthRequestConfig` 已废弃，应参考 Google 专用认证方案。
- `CodeChallengeMethod.Plain` 明确不应使用。
- 对 Google、Facebook 等有成熟专用 SDK 的提供商，不应默认优先选通用 AuthSession。

## 实际开发建议

以下建议属于对文档信息的实施整理；标有“基于经验建议”的内容并非原文直接规定。

1. 优先采用 Authorization Code Flow、PKCE 和 `S256`。
2. 为开发构建、Expo Go、Web 和生产原生应用分别确认实际 `redirectUri`。
3. 在身份提供商控制台逐一注册实际使用的回调地址。
4. 不要在客户端执行任何必须携带 `clientSecret` 的请求。
5. 对 `AuthSessionResult.type` 做完整分支处理，不要只判断 `response !== null`。
6. 在 Web 入口执行 `WebBrowser.maybeCompleteAuthSession()`。
7. 在调用登录按钮前确认 `request` 和 `discovery` 已加载。
8. 交换授权码时复用原授权请求的 `redirectUri`。
9. 调用刷新、撤销和 UserInfo API 前，检查 Discovery Document 是否包含对应端点。
10. **基于经验建议：** Token 持久化应使用适合平台的安全存储方案，不要把敏感 Token 当作普通 React 状态或长期保存在不受保护的存储中。当前文档未说明具体存储 API。
11. **基于经验建议：** 将认证流程封装为独立模块或 Context，统一管理状态、错误、刷新和退出行为，避免不同页面各自实现 OAuth 细节。
12. **基于经验建议：** 在真机和生产构建中验证 Deep Link。仅在 Expo Go 或模拟器中成功，不能证明最终安装包配置正确。

## 文档明确说明与合理推导

### 文档明确说明

- AuthSession 支持 Android、iOS 和 Web，并包含在 Expo Go 中。
- `expo-crypto` 是必须同时安装的 peer dependency。
- 原生应用需要通过 scheme 配置 Deep Link。
- 独立应用修改 scheme 后必须重新构建，不能通过 Update 生效。
- Web 认证弹窗需要 `WebBrowser.maybeCompleteAuthSession()` 才能正确完成关闭。
- `clientSecret` 无法安全保存在客户端。
- `usePKCE` 默认是 `true`，`S256` 是默认且推荐的方法。
- 提供商未返回 `refresh_token` 时，Token 可能无法刷新。
- 提供商未返回 `expires_in` 时，Token 被假定为不过期。
- 很多提供商不支持 Token Revocation。
- React Navigation 需要通过 `getStateFromPath` 过滤 AuthSession 链接。
- Google 和 Facebook 推荐使用各自的专用库。

### 基于文档内容推导

- Expo Go、开发构建、Web 和生产应用的回调地址可能不同，提供商配置不能只验证一种环境。
- 需要 `clientSecret` 的授权步骤应由后端承担。
- 授权请求、提供商 allowlist 和授权码交换使用的 `redirectUri` 应保持一致。
- 应把 Discovery Document 视为认证能力清单：某个端点不存在，相关功能就不能假定可用。
- 应显式处理取消、主动关闭、错误和成功，而不是把所有非成功结果都当成同一种失败。
- 移动端 OAuth 的主要新增复杂度不在 React 组件本身，而在操作系统 Deep Link、原生构建配置和不同运行环境的回调 URI。

## 当前文档未涉及的内容

当前文档没有具体说明：

- 如何在客户端安全持久化 Access Token 或 Refresh Token。
- 如何验证 ID Token 的签名、issuer、audience 和过期时间。
- 如何设计认证后端。
- 如何配置某一个具体身份提供商的管理控制台。
- 如何处理 Token 泄露、轮换和设备丢失。
- 如何在 EAS Build 中配置不同环境的 scheme。
- 如何自动化测试 OAuth 登录流程。
- 如何实现完整退出，包括本地 Token 清理与提供商会话退出。
- 如何将认证状态与 React Navigation 路由守卫结合。

这些问题需要结合 Authentication Guide、Linking 文档、WebBrowser 文档以及具体身份提供商文档继续确认。

## 总结

`expo-auth-session` 把浏览器打开、OAuth 回调解析、OIDC Discovery、授权码交换、Token 刷新和撤销等能力统一为跨平台 API。

对于 React Web 开发者，学习重点不是 Hook 的调用形式，而是以下移动端差异：

- 回调地址需要由操作系统通过 Deep Link 交还应用。
- Scheme 属于原生构建配置。
- Expo Go、Development Build、Bare App 和 Web 的回调 URI 不同。
- 客户端不能安全保存 `clientSecret`。
- 推荐使用 Authorization Code Flow、PKCE 和 `S256`。
- 提供商是否支持刷新、用户信息和撤销，取决于其返回的端点与 Token。
- 有官方或成熟专用 SDK 的提供商，应优先采用专用实现。

---

## 文档导航

- **上一页**：[audio](./143__audio.md)
- **下一页**：[background fetch](./145__background-fetch.md)
