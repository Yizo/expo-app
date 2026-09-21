# 132｜Expo Organization Single Sign-On（SSO）

**翻页：**[上一页：Expo Programmatic Access 与 Access Tokens](./131-Expo-Programmatic-Access.md) · [目录](./README.md) · [下一页：Audit Logs](./133-Expo-Audit-Logs.md)

**官方页面：**[Single Sign-On (SSO)](https://docs.expo.dev/accounts/sso/)

**版本边界：**SSO 需要官方页面所列 Production / Enterprise 计划；可用计划、Identity Provider 支持和页面操作步骤会变。本文依据官方页面 2026-07-28 更新信息。

## SSO 为 Organization 解决什么问题

Single Sign-On 使用公司的 Identity Provider（IdP）统一管理 Expo 组织成员登录。用户不再单独使用一套 Expo 密码，而是先进入公司 IdP 验证身份；Expo 再按 Organization 设置决定该成员账号与角色。

官方列出的 IdP 包括 Okta、OneLogin、Microsoft Entra ID 和 Google Workspace，并基于 OpenID Connect Discovery 1.0；组织若用其他兼容 IdP，可先与 Expo 确认。

启用前须保留至少一个**非 SSO Owner**，由其初次配置 SSO，也作为 IdP 配置损坏或订阅结束时的紧急入口。

## Organization Owner 配置 IdP

1. 先按所用 IdP 的官方配置说明准备 IdP，并取得 Expo 所需信息。
2. 以 Organization Owner 身份登录 EAS Dashboard，打开 Settings > Organization settings > Create SSO configuration for account，再点 Start。
3. 输入 IdP 的 Client ID、Client secret，以及需要时的 subdomain / tenant ID 或 issuer 信息。
4. 提交创建 SSO Configuration。
5. 若 IdP client secret 轮换，回 Organization settings > Overview 更新配置。

Production / Enterprise subscription 是使用 SSO 的前提；组织 Owner 不应因为启用 SSO 删除掉最后一名非 SSO Owner。

## 成员怎么用 SSO 登录

- **浏览器：**打开 `expo.dev/sso-login`，输入 Organization 名称；也可用 `expo.dev/sso-login/org-slug` 预先填好组织名。随后跳转 IdP 并让用户挑选 Expo username。
- **Expo Go：**在登录画面选 **Continue with SSO**，再跟随浏览器 IdP 流程。
- **Expo CLI：**按项目包管理器启动 SSO browser login：

```sh
npx expo login --sso
yarn expo login --sso
pnpm expo login --sso
bun expo login --sso
```

- **EAS CLI：**使用 EAS 专属 SSO 登录命令：

```sh
eas login --sso
```

CLI 打开 Expo 网页完成 IdP 认证后，会回跳到终端继续操作。

## SSO 用户与普通成员的不同限制

SSO 用户只属于其启用 SSO 的 Organization，不能自行建立其他 Organization；离开该 SSO Organization 会删除 SSO user，也不能登录 Expo 论坛或为其个人账号购买 EAS plan。组织可同时保留非 SSO 成员，以便外部贡献者通过普通 Expo account 协作。

## 把已有 Expo 用户切换到 SSO

普通 Expo 用户可能已经属于多个 personal、team、organization account；SSO user 被限制为只属于 SSO Organization，因此现有用户不能原地转换。一般切换步骤为：

1. 先退出普通 Expo 网站登录状态。
2. 到 SSO login page 输入组织名，通过 IdP 创建另一个 SSO identity 并选一个 Expo username。
3. 新 SSO user 默认是 View Only；需要开发 / 管理权限时，请 Organization Admin / Owner 调整 role。
4. 终端重新运行 `eas login --sso` 切到新身份。
5. 项目 Owner 确认交接后，可从 organization members 删除旧的普通 user。

如果还要删除旧个人账号，该账号自己仍须登录并到 User settings 执行删除。个人账号拥有的 Projects 会被一起删除，但 Organization owner 的 projects 不受影响；如果想释放旧 username，可在删除旧账号前先重命名它。

## 撤销 SSO 成员或停止 SSO

- 在 IdP 禁用成员后，Expo 会在 IdP token refresh 周期结束后撤回其 SSO 权限；也可在 Organization Members 页面 **Delete SSO user** 尽早移除。删 SSO user 会删除该成员个人账号与个人数据，Organization 项目数据保留。
- 停用或改 SSO plan 前至少保留非 SSO Owner。官方说明需要 Production / Enterprise plan 保持 SSO；若降级或停止使用，需联系 Expo support。
- 删除已配置 SSO 的 Organization 也需联系 Expo support 手动处理。

## 关键名词

- **Identity Provider（IdP）：**公司身份系统；用户的登录验证由它完成。
- **SSO Organization：**已把 Expo 登录与企业 IdP 关联的 Expo Organization。
- **Issuer / tenant：**IdP 说明身份认证服务地址或租户的信息，用于 Expo 连接正确组织。
- **Non-SSO Owner：**不用企业 SSO 登录但在 Expo Organization 保留 Owner 权限的应急维护用户。
- **SSO user：**经 SSO 专属流程创建、仅属于组织的 Expo 用户，和可跨多个账户的普通 user 不同。

## 官方代码主题覆盖

源页 CLI code topics 全部覆盖：`npx`、Yarn、pnpm、Bun 的 `expo login --sso` 以及 `eas login --sso`。其余身份提供商接入和组织管理通过官方 Dashboard / IdP UI 操作，没有原生 / React 代码块。

## 下一页

官方页脚 **Next** 是 [Audit logs](https://docs.expo.dev/accounts/audit-logs/)，介绍 Organization 可查看的管理操作历史。

**翻页：**[上一页：Expo Programmatic Access 与 Access Tokens](./131-Expo-Programmatic-Access.md) · [返回目录](./README.md) · [下一页：Audit Logs](./133-Expo-Audit-Logs.md)
