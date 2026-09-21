# 039｜EAS App Signing：凭据安全与风险边界

**翻页：**[上一页：同步 EAS 远端与本地凭据](./038-同步Credentials.md) · [目录](./README.md) · [下一页：Apple Developer Program 角色与权限](./040-Apple-Developer-Program-roles.md)

**官方页面：**[Security](https://docs.expo.dev/app-signing/security/)

**版本边界：**安全页面说明 Expo 当前凭据处理方式，版本页面可能更新。以下是对 Expo 官方安全说明的中文梳理，不能替代公司安全评估或第三方服务的权限配置。本文没有接收、解密或操作任何真实凭据。

## Expo 如何保存凭据

Expo 文档说明，服务端保存的数据默认由 Google Cloud 做静态加密；签名凭据还通过 KMS 加密。只有构建服务或推送服务在内存中短暂使用时才会解密。数据库、消息队列等持久化位置保存的凭据保持加密。官方说明的账号相关数据可由用户下载或删除；部分材料也能从 Apple Developer / Google 控制台恢复或撤销。

签名密钥、推送密钥、商店 API 凭据和用户设备 token 的权限不同。泄露后的影响通常要看攻击者同时掌握了哪些材料、服务账号拥有哪些权限。

## Android 凭据与风险

| 凭据 | 用途 | 暴露 / 丢失后的影响与恢复 |
| --- | --- | --- |
| FCM Server Key | 为 Firebase 项目中的 Android app 发送 push notification。 | 攻击者还需要设备 token 才能定向发送通知。可在 Firebase Console 删除旧 key；删除会停止依赖它的推送，创建新 key 并上传 Expo 后恢复。丢失时可从 Firebase Console 重新取得。 |
| Keystore + 密码 | 给 Google Play release binary 签名。新应用默认可启用 Google Play App Signing，Google 持有 app signing key，开发者的 keystore 是 upload key。 | 单有 keystore 通常不足以提交到商店，还需 Google Play Console 账号。若 upload key 泄露，可以新建并请求 Google 重置；若使用 Google 代管签名，keystore 丢失可重置。没有 Google Play App Signing 且丢了 app signing key 时，就无法用相同身份更新现有应用。要安全备份 keystore 和密码。 |
| Google Service Account Key | EAS Submit 上传 Android app 到 Google Play。EAS 服务器可加密保存并复用。 | 攻击者能做该 service account 获准的 Play Console 操作；若还拿到 upload keystore，可能提交现有 app 的新版本。新 app 的首个提交仍要从 Google Play 网页端进行。丢失时可从 Google Cloud Console revoke 并创建新 key。 |

Expo 工具不会要求提交你的个人 Google 账号密码。服务账号 key 不等于个人 Google Developer 登录账号。

## iOS 推送与签名凭据

### APNs 推送密钥

Apple 推荐的现代推送方式使用 p8 APNs auth key 和 key ID。每个 Apple Developer account 最多有两个 auth key，单个 key 可以服务账号中的多个 app。泄露的 key 配合设备 token 可用于发送推送；撤销 key 会让依赖它的通知停止，但不会让用户设备上的 token 失效。创建新 key 并上传 Expo 后可恢复。Apple 只在创建时提供下载，所以丢失后通常要 revoke 并新建。

### Distribution Certificate 与 Provisioning Profile

iOS build credentials 包含 production distribution certificate 及密码，以及 provisioning profiles。Expo 说明 profile 本身不是秘密，凭据由 KMS 加密保存。只有 build credential 通常不足以把 app 上传商店；攻击者还需要 Apple Developer account 对应权限。可在 Apple Developer 网站 revoke 证书或 profile，丢失时可以从开发者控制台重新取得。

## Apple Developer 账号凭据

创建 standalone build 或提交 App Store 时，CLI 可能要求登录 Apple Developer。Expo 声明这些个人账号凭据仅由 EAS CLI 在本机使用，不会上传到 Expo 服务器。Apple 强制两步验证；本机 Keychain 默认保存 Apple ID 密码，密码只在本机。ad hoc build 期间会临时保存 Apple session token 用于制作带设备 UDID 的 profile，使用完会销毁。

### 本地 Keychain 设置

macOS Keychain 集成只适用于 macOS。环境变量 EXPO_NO_KEYCHAIN=1 可关闭自动 Keychain 支持，或删除 macOS Keychain Access 中对应 Apple ID 的 deliver 项，再在下次运行 Expo 命令时重新输入密码。若电脑被攻陷，攻击者可能拿到本机账号；Apple 两步验证还要求预先授权的 Apple 设备。若 ad hoc session token 泄露，其权限接近当时已登录会话。丢失个人账号密码可通过 Apple Developer 控制台恢复，不会导致 Expo 服务端的签名密钥丢失。

## iOS App Store 提交凭据

| 凭据 | 默认与存储方式 | 风险和恢复 |
| --- | --- | --- |
| App Store Connect API Key | EAS Submit 推荐且默认的方式；Expo 服务器加密保存以便后续提交。 | 攻击者能执行 API key 权限内的 App Store Connect 操作；若还拥有 build credentials，可能提交现有 App 新版本，但不能任意冒充开发者上传任意 App。丢失可在 App Store Connect revoke 并新建。 |
| Apple app-specific password | 可选的另一种认证方式，不推荐。不会长期存储；提交期间加密保存，结束后保留 24 小时供重试，再删除。 | 泄露可能暴露 iCloud 邮件、联系人、日历等账号数据；结合 build credentials 可向现有 App 提交新版本。丢失可撤销并新建。 |

## Push Token 本身的边界

Expo Push Token 是 Expo 对 Android/iOS 设备 token 的统一抽象。token 会静态加密并由平台定期轮换。只有设备 token 而没有相应平台的推送凭据，攻击者不能单独发出通知；如果 token 丢失，在用户重新打开应用取得新 token 前，服务端可能无法向该设备推送。

## 需要更多控制时

若组织不能接受把签名密钥交由托管 build 服务，可在自己的基础设施运行构建。但使用 Expo push 服务时仍要提供平台推送凭据；若这也不可接受，就需要自行负责推送服务。

## 关键名词

- **KMS：**云端密钥管理服务，用来保护用于加密其他凭据的密钥。
- **静态加密（encryption at rest）：**持久化保存时加密，区别于传输过程中加密或应用内存中临时使用。
- **Service Account Key / API Key：**服务之间的身份凭据；可执行权限由对应账号 / key 的授权范围决定。
- **FCM / APNs：**Google 与 Apple 的设备推送通道；发送时既需要服务端凭据也需要接收设备 token。
- **Apple App-specific password：**为第三方 App 访问 Apple 服务生成的专用密码；Expo 安全指南不推荐用它替代 ASC API key。
- **EXPO_NO_KEYCHAIN：**控制 Expo CLI 是否使用 macOS Keychain 存储本机 Apple 凭据的环境变量。

## 官方代码主题覆盖

源页无大型代码块；唯一显式命令主题为通过 EXPO_NO_KEYCHAIN=1 关闭 Keychain 使用，本页已解释该变量。其余页面主题均覆盖 Android/Apple 推送、签名、商店提交、个人账号、设备 token 的保存方式、泄露影响与可恢复手段。

## 下一页

官方页脚 **Next** 是 [Apple Developer Program roles and permissions](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/)，区分 Apple 团队角色与各类证书操作权限。

**翻页：**[上一页：同步 EAS 远端与本地凭据](./038-同步Credentials.md) · [返回目录](./README.md) · [下一页：Apple Developer Program 角色与权限](./040-Apple-Developer-Program-roles.md)
