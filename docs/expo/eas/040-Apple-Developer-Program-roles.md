# 040｜Apple Developer Program 角色与 EAS Build 权限

**翻页：**[上一页：凭据安全与风险边界](./039-Credentials安全.md) · [目录](./README.md) · [下一页：Custom Builds 入门](./041-Custom-Builds-入门.md)

**官方页面：**[Apple Developer Program roles and permissions for EAS Build](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/)

**版本边界：**本页说明 Apple 团队权限如何配合 EAS Build，不是 Expo SDK API。Apple 的角色和控制台界面会变化，实际账号以 Apple 官方当前角色权限为准。本文只整理说明，没有登录 Apple / Expo 账号或生成凭据。

## 谁可以生成 iOS 签名凭据

为 iOS 真机创建 EAS Build，需要 Apple Developer 账号中能创建证书、App ID 与 provisioning profile 的权限。可以由有权用户用 Apple 账号登录 EAS CLI 现场生成，也可以由有权同事先生成并上传至 Expo 项目，让没有 Apple 账号权限的开发者复用。

| Apple 账号类型 | 可生成签名凭据的角色 |
| --- | --- |
| 个人开发者账号 | Account Holder。 |
| 组织账号 | Account Holder 与 Admin 始终可以；App Manager 还需在 App Store Connect 用户权限里开启 Access to Certificates, Identifiers, and Profiles。 |

## Apple 授权成员先准备凭据

负责 Apple 开发者账号的授权成员需要为目标用途准备：

- **Distribution signing certificate：**用于给 iOS development / release device builds 签名。
- **Ad hoc provisioning profile：**用于安装到 Apple App Store 之外的指定测试设备。
- **Distribution provisioning profile：**用于生成提交 App Store 的 build。
- **Push key：**只有使用推送通知服务时才需要。

授权用户先登录 Expo，再通过 EAS CLI 凭据向导选择 build profile 创建或更新证书 / profile。Production build 应生成 distribution profile；测试设备开发构建通常需要 ad hoc profile：

```sh
eas login
eas credentials
```

凭据同步到 Expo project 后，profile 和证书才能供具有 EAS project 权限的团队成员使用。

## 团队开发者复用已有凭据

团队开发者执行 iOS EAS Build 时，CLI 可能询问是否登录 Apple。如果开发者没有 Apple Developer 权限，应选 No 跳过，而不是把个人 Apple 账号误用于组织应用。

```sh
eas build -p ios
```

跳过登录后，CLI 会提醒它无法校验当前 provisioning profile；构建仍可使用该 Expo project 最近一次由 Apple 授权成员上传的证书与 profile。前提是目标凭据确实存在且对该项目适用。

## 上传已在外部生成的凭据

有些团队在 EAS 之外创建 distribution certificate / profile。任何 EAS 项目中 Developer 或更高权限用户，都可以通过 CLI 凭据向导或 Dashboard 的 Project settings → Configuration → Credentials 上传：

- iOS distribution certificate 的 .p12 文件。
- provisioning profile 的 .mobileprovision 文件。
- 创建证书时设置的 password（如果有）。

App 新增 / 删除 entitlement 等 iOS capability 后，或 provisioning profile 每年到期时，需要有 Apple 授权成员重新生成并上传 profile。

## Federated Apple Developer 账号

EAS CLI 使用 Apple 账号邮箱与密码登录，不能通过该登录方式访问联邦账号并修改 distribution certificate / provisioning profile。若现有上传凭据无需更新，可以跳过 Apple 登录并继续使用当前 Expo 凭据。

若构建时必须检查或更新证书，可以按官方步骤提供具有 Admin 权限的 App Store Connect API token。联邦账号仍可按标准 EAS Submit 设置用 ASC token 提交 TestFlight；也可以使用 build 命令的自动提交选项：

```sh
eas build --auto-submit
```

## 关键名词

- **Account Holder：**Apple Developer Program 团队的账号负责人，拥有最高的账号管理权限。
- **Admin：**组织账号中的管理员角色，可管理团队和凭据。
- **App Manager：**可管理 App Store Connect App；只有额外授予证书 / 标识符 / profile 权限时才能创建签名凭据。
- **Ad hoc profile：**把签名 App 与允许安装的注册设备关联起来，供 App Store 外测试分发。
- **Federated account：**由组织身份系统统一登录的 Apple Developer 账号；EAS CLI 不能用普通邮箱密码路径修改签名凭据。
- **ASC API Token：**App Store Connect API 凭据；授权范围取决于 token 的角色权限。

## 官方代码主题覆盖

源页里的命令 / 操作语句都已覆盖：授权人员用 eas login + eas credentials 生成并同步材料；开发者用 eas build -p ios 构建并跳过 Apple 登录来复用已有证书；EAS CLI / Dashboard 上传 .p12、.mobileprovision 和密码；联邦账号在需要更新时提供 Admin ASC API token；构建后自动提交使用 eas build --auto-submit。CLI 提示框的选择 N 也已解释，未执行。

## 下一页

官方页脚 **Next** 转入 [Get started with custom builds](https://docs.expo.dev/custom-builds/get-started/)，介绍如何在 EAS Build 流程的构建前后加入自定义命令。

**翻页：**[上一页：凭据安全与风险边界](./039-Credentials安全.md) · [返回目录](./README.md) · [下一页：Custom Builds 入门](./041-Custom-Builds-入门.md)
