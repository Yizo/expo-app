# 034 Security

**翻页：** [上一页：033 Networking](033-Networking.md) · [目录](README.md) · [下一页：035 Accessibility](035-Accessibility.md)

**官方页面：** [Security · React Native](https://reactnative.dev/docs/security)  
**源页代码覆盖：** 示例 deep link `app://...`、OAuth2 authorization code 与 PKCE 的 `code_verifier`/`code_challenge` 概念；源页没有可直接运行的完整示例代码。

## 安全是多层防护

没有绝对无法攻破的应用。应按数据敏感度、用户量和泄露后的损害配置防护，并尽量减少应用实际请求和保存的数据。官方把安全内容视为可选方案目录，不是能保证“检查完即安全”的清单。

## 不要把密钥打包进客户端

写进 JavaScript、原生源码或 App bundle 的 API 密钥都能被检查安装包的人提取。`react-native-dotenv`、`react-native-config` 这类工具适合不同环境使用的 API 地址等非秘密配置，不能把它们当作服务端 secret vault。

如果移动端必须调用一个要求服务端密钥的资源，常见方案是让你的服务端或 serverless function 代为请求第三方，再把允许公开的结果交给 App。服务端密钥不随移动应用分发。

## 按敏感程度选择本地存储

**持久化（persisted）** 数据写入设备磁盘，App 重启后仍在；**非持久化（unpersisted）** 数据只在运行期间保留。磁盘数据方便离线使用，但泄漏面的时间更长，敏感数据要用安全存储而不是普通键值数据库。

| 存储 | 特点 | 适用内容 |
|---|---|---|
| Async Storage | 社区维护、异步、键值存储、默认不加密；每个应用有独立 sandbox | 非敏感偏好、Redux/GraphQL 缓存等 |
| iOS Keychain | 系统安全存储，适合少量敏感数据 | 凭证、token、密码、证书 |
| Android Encrypted Shared Preferences | 基于 Shared Preferences 并加密键和值 | 需要加密的持久化键值数据 |
| Android Keystore | 存放加密密钥，让密钥更难从设备提取 | 由密钥保护的数据方案 |

RN 核心并没有内置安全存储。可用 Expo SecureStore、React Native Keychain 等经过核对的原生库，也可以自行桥接系统 API。评估其平台覆盖、备份规则、锁屏状态、迁移和当前 RN/Expo 兼容性。

也要避免把敏感表单数据写入全量 Redux persist state，或把 access token、个人信息作为普通日志送往 Sentry/Crashlytics。最安全的数据往往是完全不保存、不打印、也不请求的数据。

## Deep Link 不是可信凭证通道

Deep link（深链接）是外部 URL 直接唤起原生应用并交给它处理。例如：

```text
shopapp://products/42
```

自定义 scheme 没有中央注册表，恶意 App 可以注册相同 scheme 争抢链接。Android 通常让用户在多个处理应用之间选择；iOS 可能自动选择。链接内容应视为不可信输入，绝不要在 query/path 中传密码、token 或其他敏感资料。iOS Universal Links 通过域名验证，可安全地把 HTTPS 链接映射到 App 内容。

## OAuth2 redirect 与 PKCE

OAuth2 / OpenID Connect 原生登录过程中，身份提供商认证后会把验证代码 redirect 回 App。由于自定义 scheme 可能被其他 App 截获，仅靠 redirect code 不够。**PKCE**（Proof Key for Code Exchange）让发起授权的客户端同时持有随机 `code_verifier`，并在开始请求中提交其 SHA-256 摘要 `code_challenge`。取回 redirect code 后，再把原 verifier 发送给授权服务器；服务器重新计算摘要并比对，只有原客户端才能换取 token。

```text
随机生成 code_verifier（保留在当前客户端）
code_challenge = SHA-256(code_verifier)
授权请求携带 code_challenge
收到 redirect code 后，token 请求携带 code_verifier
```

这使被拦截的 authorization code 单独没有价值。官方提到 `react-native-app-auth` 可包装 iOS/Android 原生 AppAuth 库，但只有身份提供商也支持 PKCE 时，PKCE 流程才可用。认证流程和 redirect URI 应按 OAuth/OIDC 提供方要求配置。

## HTTPS 与中间人攻击

所有 API 应使用 HTTPS/TLS，避免数据以明文通过网络。HTTPS 客户端会校验服务器证书链；若设备安装了攻击者控制的根证书，单靠受信 CA 校验仍可能受到中间人攻击。**Certificate pinning（证书固定）** 可以让客户端只接受 App 内预置的受信证书/公钥集合，拒绝其他合法 CA 签发的连接。

证书固定会增加运维责任：证书常需更新，证书过期或轮换后 App 内旧 pin 与服务器不匹配，旧版客户端可能无法连接。若使用 pinning，要准备有效期监控、证书轮换、备用 pin 和强制更新策略，并在目标设备验证失败恢复。不要只因“安全”两个字就盲目加 pinning。

**翻页：** [上一页：033 Networking](033-Networking.md) · [目录](README.md) · [下一页：035 Accessibility](035-Accessibility.md)
