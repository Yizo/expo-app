# AppIntegrity：验证移动应用与设备的真实性

> 本文对应 Expo 下一版本的未发布文档。原文标注：当前最新稳定文档为 SDK 56。  
> `@expo/app-integrity` 目前处于 **Alpha** 阶段，可能频繁出现破坏性变更。

## 文档解决的问题

`@expo/app-integrity` 用于帮助后端判断请求是否来自：

- 正版应用；
- 未被篡改的应用实例；
- 真实设备；
- 合法的用户操作，而不是脚本重放或自动化攻击。

它封装了两个平台提供的应用完整性服务：

| 平台 | 底层服务 |
| --- | --- |
| Android | Google Play Integrity API |
| iOS | Apple App Attest |

需要特别注意：完整性检查的最终判定发生在**后端服务器**，而不是客户端。客户端只负责获取证明数据，并将其提交给后端验证。

对于 React Web 开发者，可以将其类比为一套比浏览器验证码、CSRF Token 或前端签名更底层的安全机制：证明不仅绑定某次请求，还可能绑定应用安装实例、设备硬件和平台签发的证明。

## 适用场景

该库适合保护具有较高安全价值的服务端操作，例如：

- 下载付费内容；
- 领取奖励或兑换权益；
- 游戏关键操作；
- 金融或账户敏感操作；
- 防止篡改版应用调用 API；
- 降低模拟器、自动化脚本或未授权客户端滥用接口的风险。

它不应被理解为通用身份认证方案。文档没有说明它能够替代登录、权限控制、业务风控或服务端参数校验。

> **基于文档内容推导：** 应用完整性证明适合作为后端风险判断的一项输入，而不是唯一安全边界。即使证明有效，后端仍应执行身份认证、授权和业务数据校验。

## 安装

```sh
# npm
npx expo install @expo/app-integrity

# yarn
yarn expo install @expo/app-integrity

# pnpm
pnpm expo install @expo/app-integrity

# bun
bun expo install @expo/app-integrity
```

文档将其标记为支持 Android、iOS，并包含在 Expo Go 中。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先按照 Expo 的说明安装 `expo` 和 Expo Modules 基础设施。

代码中统一使用以下方式导入：

```js
import * as AppIntegrity from '@expo/app-integrity';
```

## Android：Play Integrity 标准请求流程

Android 端使用 Google Play Integrity 的 **Standard request flow**。

整体流程是：

1. 在 Google 侧启用并配置 Play Integrity API。
2. 客户端提前准备 Token Provider。
3. 针对具体用户操作生成 `requestHash`。
4. 客户端请求完整性 Token。
5. 将 Token 发送给业务后端。
6. 后端向 Google 验证并解密结果。
7. 后端根据完整性结论决定是否放行请求。

### 1. 平台配置

需要按照 Google Play Integrity 的设置指南，为应用启用完整性 API。

当前 Expo 文档没有列出 Google Cloud、Google Play Console 或后端验证端的具体配置步骤，而是要求参考 Google 官方文档。

### 2. 准备 Token Provider

在进行完整性检查前，必须先准备 Token Provider：

```js
const cloudProjectNumber = 'your-cloud-project-number';

await AppIntegrity.prepareIntegrityTokenProviderAsync(
  cloudProjectNumber
);
```

参数说明：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `cloudProjectNumber` | `string` | Google Cloud 项目编号 |

返回值为 `Promise<void>`。成功完成表示 Provider 已准备好。

这一步通常只需提前执行一次，可以：

- 在应用启动时执行；
- 在后台提前执行；
- 在真正需要完整性检查之前执行。

这里的“一次”不是永久有效。Provider 可能过期，应用仍需处理重新准备的情况。

### 3. 为具体操作请求 Token

```js
const requestHash = '2cp24z...';
const result =
  await AppIntegrity.requestIntegrityCheckAsync(requestHash);
```

`requestHash` 应当是与本次待验证操作唯一关联的哈希值。不同用户操作可以使用不同的哈希，多次调用检查接口。

调用前必须确保：

```js
prepareIntegrityTokenProviderAsync()
```

已经成功执行，否则后续 Token 请求不具备必要的 Provider。

成功后，`result` 是字符串形式的完整性检查结果。客户端不能自行将其视为“验证通过”，而应将其发送给后端，由后端完成解密和验证。

### 4. 后端验证

Expo 文档没有提供后端实现代码，只要求按照 Google 的标准流程验证 Token。

后端解密、验证后可以获得有关以下对象有效性的结论：

- 设备；
- 应用；
- 账户。

随后由业务后端决定放行、拒绝还是采取额外验证措施。

### 5. Provider 过期处理

如果同一个 Token Provider 使用时间过长，它可能失效。下一次请求会出现：

```text
ERR_APP_INTEGRITY_PROVIDER_INVALID
```

此时应重新调用：

```js
await AppIntegrity.prepareIntegrityTokenProviderAsync(
  cloudProjectNumber
);
```

然后再执行需要的完整性检查。

> **基于经验建议：** 可以将“准备 Provider + 请求 Token”的逻辑封装起来，在遇到该错误时只自动重新准备并重试一次，避免无限重试。

## iOS：App Attest 完整流程

iOS 的 App Attest 流程比 Android 示例更强调长期密钥管理。

完整流程为：

1. 在 Xcode 中添加 App Attest Capability。
2. 检查当前设备是否支持 App Attest。
3. 为每个“设备上的用户账户”生成独立密钥。
4. 持久化保存返回的 `keyId`。
5. 从后端获取一次性 Challenge。
6. 使用密钥和 Challenge 创建 Attestation。
7. 后端验证 Attestation。
8. 后续敏感请求使用该密钥生成 Assertion。
9. 后端验证 Assertion 后决定是否放行。

### 1. Xcode 与 App ID 配置

在 Xcode 中打开：

```text
Signing & Capabilities
```

然后点击：

```text
+ Capability
```

添加：

```text
App Attest
```

Xcode 会自动为应用加入所需的 entitlement。可以将 entitlement 理解为 iOS 应用声明自己有权使用某项系统能力的原生配置。

应用还必须拥有在 Apple Developer 网站注册的 App ID。

这与 React Web 中安装 npm 包不同：移动端系统能力通常不仅需要 JavaScript 依赖，还需要原生工程、开发者账户和应用标识共同配置。

### 2. 检查设备兼容性

不是所有设备都支持 App Attest，因此调用前必须检查：

```js
if (AppIntegrity.isSupported) {
  // 生成密钥并执行证明流程
}

// 继续处理服务端 API 访问
```

`AppIntegrity.isSupported` 是 iOS 平台的布尔常量。

如果不支持，文档要求应用**优雅地绕过** App Attest，而不是因为无法证明就直接崩溃。

明确限制包括：

- iOS Simulator 不支持 App Attest。
- 大多数 App Extension 不支持 App Attest。
- 即使 Extension 中的 `isSupported` 为 `true`，通常也应绕过证明流程。
- 例外是 watchOS 9 或更高版本中的 watchOS Extension，可以依据 `isSupported` 判断。

文档没有规定“不支持时”后端必须放行还是拒绝。这属于应用自己的安全策略。

### 3. 生成密钥

```js
const keyId = await AppIntegrity.generateKeyAsync();
```

该方法会生成一对硬件保护的加密密钥，并返回字符串形式的 `keyId`。

密钥的分工是：

- 私钥由设备保存在 Secure Enclave 中；
- 应用进程无法直接读取或修改私钥；
- `keyId` 是应用以后访问该密钥的标识。

必须持久化保存 `keyId`，因为：

- 没有 `keyId` 就无法继续使用对应密钥；
- 之后无法从系统重新查询出遗失的 `keyId`。

需要保存的是标识符，不是私钥本身。

#### 密钥与用户的关系

文档要求为每台设备上的每个用户账户生成唯一密钥，不能让多个用户共用一个密钥。

错误设计示例：

```text
一台设备只创建一个全局密钥，所有登录用户共用
```

这会削弱风控能力，使后端更难识别“一台已被攻陷的设备为多个远程用户提供服务”的攻击。

#### App Clip 场景

如果在 App Clip 中创建了密钥，对应的完整应用也应使用同一密钥。

因此，`keyId` 必须存放在 App Clip 和完整应用都能访问的共享容器中。文档给出的可选方案包括：

- 使用 `expo-sqlite` 在应用与 Extension 间共享数据库；
- 使用 React Native MMKV 的 App Groups / Extensions 共享存储。

对普通 React Web 开发者而言，App Clip 可以粗略理解为无需安装完整应用即可运行的一小部分 iOS 应用体验；共享容器类似两个独立运行目标之间受系统控制的共享存储。

### 4. 从后端获取一次性 Challenge

客户端需要向后端请求唯一且只能使用一次的 Challenge。

文档要求 Challenge 至少为 **16 字节**，以提供足够熵，降低被猜中的可能性。

Challenge 的作用是防止重放攻击：攻击者即使截获以前的合法证明，也不能在新的请求中重复使用。

Challenge 必须由后端提供。文档没有给出后端生成、存储和失效管理的具体实现。

### 5. 对密钥执行 Attestation

```js
const attestationObject =
  await AppIntegrity.attestKeyAsync(keyId, challenge);
```

参数说明：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `keyId` | `string` | `generateKeyAsync()` 返回的密钥标识 |
| `challenge` | `string` | 后端提供的一次性 Challenge |

成功后，将以下内容发送给后端：

- `attestationObject`；
- `keyId`。

后端验证成功，才能认为该应用实例有效。

#### Attestation 错误处理

如果收到：

```text
ERR_APP_INTEGRITY_SERVER_UNAVAILABLE
```

说明服务暂时不可用，应稍后使用**同一个密钥**重试。

对于其他错误，文档要求：

1. 丢弃当前 `keyId`；
2. 下次尝试时生成新密钥。

这个差异很重要：服务暂时不可用不代表密钥无效，不应该立即创建新密钥。

#### 大规模用户上线

如果应用已经拥有数百万日活用户，不应一次性让全部用户开始调用 `attestKey`。文档要求参考 Apple 的准备指南，逐步扩大使用范围。

文档没有提供具体灰度比例或上线节奏。

### 6. 保存验证后的密钥标识

Attestation 通过后，客户端应持久化保存：

```text
keyId
```

不应将 `attestationObject` 当作以后请求的长期凭据保存。

Attestation Object 用于首次证明密钥有效；后续敏感请求应使用该密钥生成新的 Assertion。

### 7. 为敏感请求生成 Assertion

完成密钥 Attestation 后，后端可以要求客户端在后续请求中证明自身合法性。

示例：

```js
const challenge = 'A string from your server';

const request = {
  action: 'getGameLevel',
  levelId: '1234',
  challenge,
};

const assertion =
  await AppIntegrity.generateAssertionAsync(
    keyId,
    JSON.stringify(request)
  );
```

调用成功后，应把以下内容一起发送给后端：

- Assertion；
- 被签名的客户端数据。

后端必须使用完全对应的客户端数据验证 Assertion。如果验证失败，由业务系统决定拒绝、降级还是执行额外验证。

`generateAssertionAsync()` 的第二个参数在 API 表中名为 `challenge`，但其含义是“使用已证明的私钥签名的字符串”。示例实际传入的是包含 Challenge 和业务字段的序列化请求。

> **基于文档内容推导：** 生成与验证时必须对待签名数据的序列化方式达成一致。字段、顺序或字符串表示发生变化，都可能导致服务端验证失败。

一个密钥生成 Assertion 的次数没有限制。但文档建议将它用于敏感时刻，例如下载高级内容，而不是无差别地应用到所有请求。

### 8. 重装后重新开始

iOS 密钥在普通应用更新后仍然有效，但无法跨越以下事件：

- 卸载并重新安装应用；
- 迁移设备；
- 从设备备份恢复。

发生这些事件后，需要重新生成密钥并从 Attestation 流程开始。

文档还建议仅在以下情况生成新密钥：

- 上述密钥无法保留的事件；
- 新增用户。

保持设备上的密钥数量较少，有助于检测某些欺诈行为。

## Android 硬件证明相关 API

API 列表还提供了一组 Android Keystore 硬件证明方法，主要用于 GrapheneOS 和其他安全 Android 发行版：

```js
await AppIntegrity.isHardwareAttestationSupportedAsync();
```

检查设备是否支持硬件证明，返回 `Promise<boolean>`。

```js
await AppIntegrity.generateHardwareAttestedKeyAsync(
  keyAlias,
  challenge
);
```

在 Android Keystore 中生成经过硬件证明的密钥对：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `keyAlias` | `string` | 密钥的唯一标识 |
| `challenge` | `string` | 后端提供的 Challenge |

该方法成功时返回 `Promise<void>`。

```js
const certificates =
  await AppIntegrity.getAttestationCertificateChainAsync(
    keyAlias
  );
```

获取密钥对应的证明证书链，返回 Base64 编码的 X.509 证书数组。后端可以验证该证书链，以判断设备完整性。

当前文档只提供了这组 API 的用途和签名，**没有说明**：

- 完整的客户端调用顺序；
- 服务端证书链验证代码；
- 它与 Play Integrity 标准流程应如何组合；
- 具体支持哪些 Android 发行版和设备；
- 密钥的删除、轮换和持久化策略。

因此，不应根据当前文档自行假定这些 API 可以直接替代 Play Integrity 流程。

## API 速查

### iOS

| API | 返回值 | 作用 |
| --- | --- | --- |
| `isSupported` | `boolean` | 判断设备是否支持 App Attest |
| `generateKeyAsync()` | `Promise<string>` | 创建密钥并返回 `keyId` |
| `attestKeyAsync(keyId, challenge)` | `Promise<string>` | 请求 Apple 证明密钥有效 |
| `generateAssertionAsync(keyId, challenge)` | `Promise<string>` | 使用已证明的私钥签名数据 |

### Android Play Integrity

| API | 返回值 | 作用 |
| --- | --- | --- |
| `prepareIntegrityTokenProviderAsync(cloudProjectNumber)` | `Promise<void>` | 准备 Token Provider |
| `requestIntegrityCheckAsync(requestHash)` | `Promise<string>` | 请求 Google Play 完整性结果 |

### Android 硬件证明

| API | 返回值 | 作用 |
| --- | --- | --- |
| `isHardwareAttestationSupportedAsync()` | `Promise<boolean>` | 检查硬件证明支持情况 |
| `generateHardwareAttestedKeyAsync(keyAlias, challenge)` | `Promise<void>` | 在 Android Keystore 中生成硬件证明密钥 |
| `getAttestationCertificateChainAsync(keyAlias)` | `Promise<string[]>` | 获取 Base64 编码的 X.509 证明证书链 |

## React Web 开发者容易误解的地方

### 客户端不能完成最终验证

Web 开发中可能习惯在前端判断某个 Token 是否存在，但完整性证明不能只在客户端验证。

客户端代码和客户端判断都可能被篡改。证明数据必须交给后端，并由后端通过 Google 或 Apple 的规则进行验证。

### Challenge 不是普通固定配置

Challenge 不能写成长期固定字符串，也不应由客户端自行决定。它需要由后端生成，具备唯一性和一次性，用于防止旧证明被重放。

### `keyId` 不是私钥

`keyId` 只是访问 Secure Enclave 内私钥的标识符。私钥不会像 Web 项目中的环境变量或 PEM 文件那样由 JavaScript 代码直接读取。

### iOS 模拟器不是有效测试环境

App Attest 不支持 iOS Simulator。模拟器测试失败不一定代表代码错误，真实能力需要在受支持的设备上验证。

### 安装 npm 包不等于完成接入

除了 JavaScript 依赖，还需要：

- Android 的 Google Play Integrity 平台配置；
- iOS 的 Xcode Capability 和 Apple App ID；
- 后端 Challenge 接口；
- 后端证明验证逻辑；
- 客户端密钥或 Provider 生命周期管理。

### Android 与 iOS 不是同一套抽象流程

Android 主要围绕 Provider、`requestHash` 和完整性 Token；iOS 主要围绕长期密钥、首次 Attestation 和后续 Assertion。

不能假设两个平台可以共用完全相同的客户端状态管理代码。

## 限制与风险

1. 该库处于 Alpha 阶段，API 和行为可能频繁发生破坏性变更。
2. 当前页面属于下一版本文档，不是 SDK 56 的稳定版本文档。
3. Android 和 iOS 都依赖平台服务以及后端验证，不能仅通过客户端完成接入。
4. Android Token Provider 会过期，需要处理 `ERR_APP_INTEGRITY_PROVIDER_INVALID`。
5. iOS App Attest 并非所有设备都支持，且不支持 iOS Simulator。
6. 大多数 iOS App Extension 不支持 App Attest。
7. iOS `keyId` 丢失后无法重新获取对应标识。
8. iOS 密钥无法跨越重装、设备迁移或备份恢复。
9. 多个用户共用一个 iOS 密钥会削弱安全保护。
10. Attestation 和 Assertion 使用的一次性 Challenge 必须防止重放。
11. 文档未提供完整服务端实现，需要继续参考 Google 和 Apple 官方文档。
12. 应用已经具有巨大用户规模时，iOS Attestation 需要逐步上线。

## 实际开发建议

以下内容属于**基于经验建议**，不是当前文档直接规定：

- 在后端统一封装 Apple 和 Google 的验证逻辑，对业务层返回规范化的风险结果。
- 将 Challenge 设置为短期有效、一次性消费，并绑定用户、操作和请求上下文。
- 不要在客户端日志中输出完整 Token、Attestation、Assertion 或 Challenge。
- 为 Provider 过期、平台服务不可用、不支持证明和验证失败分别设计处理策略。
- 将 iOS `keyId` 与本机用户账户关联，处理登录切换、注销和新增账户。
- Alpha 阶段升级 Expo SDK 或该依赖时，应重新检查 API 签名、原生配置和后端验证协议。
- 在灰度环境先验证真实设备、应用商店安装包、重装和账户切换等生命周期场景。

## 文档明确内容与推导边界

### 文档明确说明

- Android 使用 Play Integrity Standard request flow。
- iOS 使用 App Attest。
- 最终证明需要发送到后端验证。
- Android 必须先准备 Provider，再请求完整性 Token。
- Android Provider 可能过期，并产生指定错误。
- iOS 必须先检查 `isSupported`。
- iOS 密钥应按设备上的用户账户隔离。
- `keyId` 必须持久化，私钥保存在 Secure Enclave。
- Challenge 应唯一、一次性，并且首次 Attestation 的 Challenge 至少为 16 字节。
- iOS 重装、设备迁移或备份恢复后需要重新生成密钥。
- Assertion 通常用于敏感请求。
- Android 提供额外的硬件证明密钥和证书链 API。

### 当前文档未涉及

- Google 和 Apple 服务端验证的完整代码。
- Challenge 的生成算法、存储结构和过期时间。
- 验证失败后的统一业务策略。
- Token、Assertion 和 Attestation 的网络接口格式。
- Android 硬件证明 API 的完整接入流程。
- 自动重试次数、超时和降级标准。
- 如何将完整性结果与登录认证、权限系统或业务风控整合。
- 生产环境的监控指标和告警方案。

## 总结

`@expo/app-integrity` 的核心价值不是在客户端阻止请求，而是让后端获得由移动平台支持的真实性证明。

Android 的重点是提前准备 Token Provider，并针对具体操作请求 Play Integrity Token；iOS 的重点是管理设备硬件密钥，先完成一次 Attestation，再为敏感请求生成 Assertion。两端都必须配合后端 Challenge、验证逻辑和业务决策才能形成完整安全链路。

由于该库仍处于 Alpha 阶段，并且当前页面面向下一版本 SDK，实际接入时需要固定依赖版本，并同时核对对应版本的 Expo、Google 和 Apple 官方文档。

---

## 文档导航

- **上一页**：[age range](./138__age-range.md)
- **下一页**：[apple authentication](./140__apple-authentication.md)
