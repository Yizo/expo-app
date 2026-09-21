# 131｜Expo SDK AppIntegrity 应用完整性

**翻页：**[上一页：Expo SDK AgeRange](./130-Expo-SDK-AgeRange.md) · [目录](./README.md) · [下一页：Expo SDK AppleAuthentication](./132-Expo-SDK-AppleAuthentication.md)

**官方页面：**[AppIntegrity · Latest](https://docs.expo.dev/versions/latest/sdk/app-integrity/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/app-integrity/)

**版本边界：**Latest 和 SDK v56 页面都将 `@expo/app-integrity` 标记为 Alpha；底层使用 Google Play Integrity（Android）及 Apple App Attest（iOS）。两版列出的平台流程和主要 API 相同。该库只生成供服务端验证的 token / attestation / assertion；服务器仍需执行解密、校验和风险处置。

## 判断请求是否来自正版 App

App Integrity 用平台推荐的应用证明服务，让后端区分真实 App / 真机与修改过的应用、脚本、模拟器等来源。验证链路由客户端生成证明材料，发送到后端；**不能只因为客户端拿到 token 就信任请求**，后端要按 Google / Apple 的规则完成验签或 token 解密校验。

安装库（选择一种包管理器）：

~~~sh
npx expo install @expo/app-integrity
yarn expo install @expo/app-integrity
pnpm expo install @expo/app-integrity
bun expo install @expo/app-integrity
~~~

已有 React Native 工程还需先安装 `expo` 包。

也可以从已配置该库的示例工程启动：

~~~sh
npx create-expo-app --example with-app-integrity
yarn create expo-app --example with-app-integrity
pnpm create expo-app --example with-app-integrity
bun create expo --example with-app-integrity
~~~

## Android：Google Play Integrity

Android 使用 Play Integrity Standard request flow。先在 Google Cloud / Play Console 配置 Integrity API，之后 App 初始化 token provider，并针对需要保护的操作请求 token，传给自己的 backend 验证。

### 一次性准备 token provider

可以在 App 启动时，或第一次需要 Integrity 检查之前准备 provider：

~~~ts
import * as AppIntegrity from '@expo/app-integrity';

const cloudProjectNumber = 'your-cloud-project-number';
await AppIntegrity.prepareIntegrityTokenProviderAsync(cloudProjectNumber);
~~~

### 在敏感操作时请求 token

`requestHash` 应绑定到正在验证的具体用户操作；不同操作可传不同 hash：

~~~ts
const requestHash = '2cp24z...';
const result = await AppIntegrity.requestIntegrityCheckAsync(requestHash);
~~~

成功后把 `result` 送到服务端解密和校验。token provider 使用时间过长可能过期，后续请求会抛 `ERR_APP_INTEGRITY_PROVIDER_INVALID`；收到该错误时重新调用 `prepareIntegrityTokenProviderAsync()` 再重试。

### Android API 速查

| 方法 | 参数 | 返回 | 用途 |
| --- | --- | --- | --- |
| `prepareIntegrityTokenProviderAsync(cloudProjectNumber)` | Google Cloud project number | `Promise<void>` | 准备 Play Integrity provider。 |
| `requestIntegrityCheckAsync(requestHash)` | 操作对应的 hash 字符串 | `Promise<string>` | 请求完整性 verdict；返回字符串交由服务端处理。 |
| `generateHardwareAttestedKeyAsync(keyAlias, challenge)` | 唯一 key 别名、服务端 challenge | `Promise<void>` | 在 Android Keystore 生成硬件证明密钥，适用于 GrapheneOS 等支持的平台。 |
| `getAttestationCertificateChainAsync(keyAlias)` | key 别名 | `Promise<string[]>` | 获取可由服务端校验的 Base64 X.509 证书链。 |
| `isHardwareAttestationSupportedAsync()` | 无 | `Promise<boolean>` | 检查当前设备是否支持硬件证明。 |

## iOS：Apple App Attest

在 Xcode **Signing & Capabilities** 中添加 **App Attest** capability。App 还需要在 Apple Developer 网站注册的 App ID；服务端要按 Apple 的规则验证 attestation / assertion。

### 检查设备支持情况

并不是每台设备都支持 App Attest。使用 `isSupported` 判断，不支持时跳过该证明流程并继续自己的服务请求：

~~~ts
import * as AppIntegrity from '@expo/app-integrity';

if (AppIntegrity.isSupported) {
  // Perform key generation and attestation.
}
// Continue with your server API access.
~~~

App Attest 不支持 iOS Simulator。大多数 app extension 也不支持；即使某些扩展的 `isSupported` 为 `true`，也应先确认它实际可用。watchOS 9+ 的 WatchKit 扩展是官方文档指出的例外。

### 为每个用户 / 设备生成密钥

每个设备上的每个用户账号应使用独立的硬件加密密钥对：

~~~ts
const keyId = await AppIntegrity.generateKeyAsync();
~~~

把返回的 `keyId` 存进持久化存储。私钥由系统放在 Secure Enclave 内，App 无法直接读取或修改；没有 keyId，之后也无法再访问该 key。不要让同一设备上的多个用户共用一把 key。

若使用 App Clip，应与对应的完整 App 共用同一 keyId，并保存在两个 target 都能访问的共享容器中。

### 从自己的服务端取得一次性 challenge

服务端应生成唯一、一次性的随机 challenge，再发给 App。challenge 至少 16 bytes entropy，避免被猜出或重放。此步骤为服务端流程，Expo AppIntegrity 不会替应用生成 challenge。

### 证明密钥有效

把 `keyId` 和服务端返回的 challenge 传给 Apple App Attest：

~~~ts
const attestationObject = await AppIntegrity.attestKeyAsync(keyId, challenge);
~~~

把 `attestationObject` 和 `keyId` 交给服务端验证。若得到 `ERR_APP_INTEGRITY_SERVER_UNAVAILABLE`，可稍后用相同 key 重试；其他错误时应丢弃旧 keyId，下次重新生成新 key。验证成功后，服务端保存 keyId（不要把 attestation object 当作可重复使用的 key）。

### 对敏感请求生成 assertion

先向后端取得一次性 challenge，把要执行的动作和 challenge 组成请求数据，再用已验证过的 key 签名：

~~~ts
const challenge = 'A string from your server';
const request = {
  action: 'getGameLevel',
  levelId: '1234',
  challenge: challenge,
};
const assertion = await AppIntegrity.generateAssertionAsync(keyId, JSON.stringify(request));
~~~

把 assertion 和原始客户端数据一起发给服务端验证。challenge 能降低重放攻击风险；是否拒绝验证失败的业务操作由服务器决定。通常只对下载付费内容等敏感时刻生成 assertion。

App 更新会保留 key，但重新安装、设备迁移或从备份恢复后密钥会丢失；遇到这些情况要重新生成 key。`attestKeyAsync` 和 `generateAssertionAsync` 都返回 `Promise<string>`。

### iOS API 速查

| API | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `isSupported` | 无 | `boolean` | 当前设备是否提供 App Attest。 |
| `generateKeyAsync()` | 无 | `Promise<string>` | 生成 key 并返回 `keyId`。 |
| `attestKeyAsync(keyId, challenge)` | key ID、服务器 challenge | `Promise<string>` | 请求 Apple 证明 key 有效，返回 attestation data。 |
| `generateAssertionAsync(keyId, challenge)` | key ID、需签名的数据 | `Promise<string>` | 对敏感请求生成 assertion。 |

### Latest / v56 共同 Android API

两版文档都列有 Android 的下列接口：

| API | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `generateHardwareAttestedKeyAsync(keyAlias, challenge)` | key 别名和服务端 challenge | `Promise<void>` | 在 Android Keystore 生成硬件证明 key。 |
| `getAttestationCertificateChainAsync(keyAlias)` | key 别名 | `Promise<string[]>` | 返回 Base64 X.509 证书链。 |
| `isHardwareAttestationSupportedAsync()` | 无 | `Promise<boolean>` | 设备是否支持硬件证明。 |
| `prepareIntegrityTokenProviderAsync(cloudProjectNumber)` | Cloud 项目编号 | `Promise<void>` | 初始化 Google provider。 |
| `requestIntegrityCheckAsync(requestHash)` | 请求 hash | `Promise<string>` | 请求 Play Integrity verdict。 |

## 新手术语

- **App Integrity（应用完整性）：**确认请求来自符合预期的 App / 设备环境的机制。
- **Attestation（证明）：**由平台为某个 App 实例或 key 生成的签名凭据，可供后端验证。
- **Assertion（断言）：**已验证的 App 实例对某个具体请求生成的签名材料。
- **Challenge：**服务端一次性生成的随机挑战值；证明数据绑定到当前请求，并降低重放攻击风险。
- **Secure Enclave：**Apple 设备中隔离保存密钥的硬件安全区域。
- **Secure Keystore：**Android 系统安全存储密钥的设施。
- **Verdict：**Google Play Integrity 返回的设备 / App / 账号完整性判定数据。
- **Backend verification：**服务端解密 / 验证凭据并决定是否允许操作；客户端只负责生成并转交证明数据。
- **Alpha：**仍可能频繁发生破坏性改动的阶段；v56 和 Latest 的 API 都应按项目锁定 SDK 查证。

## 源页代码主题覆盖

已覆盖四种安装命令和 `with-app-integrity` 示例项目命令；重写 Android provider 一次性准备与按操作请求 token，以及 iOS 支持检查、生成 key、attest key、生成 assertion 的全部主要代码段。源页 API 清单中的 Android 硬件 attestation 方法也逐项保留。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/app-integrity/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/app-integrity/)

**翻页：**[上一页：Expo SDK AgeRange](./130-Expo-SDK-AgeRange.md) · [目录](./README.md) · [下一页：Expo SDK AppleAuthentication](./132-Expo-SDK-AppleAuthentication.md)
