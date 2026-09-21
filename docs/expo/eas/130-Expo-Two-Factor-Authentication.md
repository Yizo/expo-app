# 130｜Expo Account 双重认证（2FA）

**翻页：**[上一页：Expo Account Types](./129-Expo-Account-Types.md) · [目录](./README.md) · [下一页：Programmatic Access](./131-Expo-Programmatic-Access.md)

**官方页面：**[Two-factor authentication](https://docs.expo.dev/accounts/two-factor/)

**版本边界：**该页面主要描述 Expo account 安全设置；Authenticator / SMS 支持状态会变化。本文记录来源页面更新于 2026-05 的设置与恢复流程，实际操作以账号 Settings 当前显示为准。

## 2FA 提供什么保护

开启双重认证后，登录 Expo 网站、Expo Go 或 CLI，除了用户名密码还需要提供一个短时有效的验证码。这样即使密码泄漏，登录者也仍需持有你的 2FA 设备 / 验证方式。

在 Expo **Personal account settings** 中可以启用。Authenticator App 扫描设置时 Expo 展示的 QR code，然后把该应用生成的确认码输入 Expo 完成配置。Expo 接受支持 TOTP（基于时间的一次性密码）的认证器。

## 可配置的第二验证方式

- **Authenticator App：**适用新设置的推荐方式；建议在不同物理设备或设备恢复方案中保留可用的方法。
- **SMS：**官方页面标注已不支持新添加短信 2FA；原有 SMS 配置暂时继续工作，但建议迁移至 authenticator。短信验证码至少在 10 分钟内有效，窗口内可能收到重复验证码；设为默认方法时，需要 2FA 的操作会自动向该号码发短信。
- **Recovery codes：**设置 2FA 时会生成的一次性备用代码；每个 code 只能使用一次。若当时下载了文本文件，会保存为 `expo-recovery-codes.txt`。

## 管理 2FA 设置

在 Personal account settings 里可添加 / 移除认证方式、指定默认方式、重新生成 recovery codes 或关闭 2FA。变更安全设置前需提交一个当前 one-time password。

重新生成 recovery codes 会使之前的 codes 全部失效；应在生成后立即把新 code 存到只有本人可访问的安全位置。

## 丢失 Authenticator 或设备时恢复账户

1. 用未使用过的 recovery code 代替 one-time password 登录。
2. 预先绑定多个 2FA method，并分布在不同物理设备上，降低手机丢失 / 重置导致账号锁定的风险。
3. 如果所有可用方式都无法恢复，可从 Expo account 关联邮箱联系官方 support；Expo 页面说明不能保证手动恢复必然成功。

## 关键名词

- **TOTP：**Time-based One-time Password，根据共享密钥和当前时间生成的一次性验证码。
- **Authenticator App：**本地生成 TOTP 的身份认证应用；与通过 SMS 接码不同，不必依赖运营商短信。
- **One-time password：**在有限时间或有效窗口中使用的一次性验证码，用于登录或修改安全配置。
- **Recovery code：**每条只能使用一次的紧急备用验证码。
- **2FA method：**一个账号可配置的第二身份验证方式；添加多个可降低单设备丢失风险。

## 官方代码主题覆盖

源页没有源代码片段或 CLI 命令。2FA 启用、TOTP QR 确认、SMS deprecation、recovery code 与账户恢复路径均已整理。

## 下一页

官方页脚 **Next** 是 [Programmatic access](https://docs.expo.dev/accounts/programmatic-access/)，介绍如何为自动化脚本或 CI 管理 Expo access token。

**翻页：**[上一页：Expo Account Types](./129-Expo-Account-Types.md) · [返回目录](./README.md) · [下一页：Programmatic Access](./131-Expo-Programmatic-Access.md)
