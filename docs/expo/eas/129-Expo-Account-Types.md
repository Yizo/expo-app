# 129｜Expo Account Types

**翻页：**[上一页：EAS Webhooks](./128-EAS-Webhooks.md) · [目录](./README.md) · [下一页：双重认证](./130-Expo-Two-Factor-Authentication.md)

**官方页面：**[Account types](https://docs.expo.dev/accounts/account-types/)

**版本边界：**这是 Expo account / dashboard 管理说明，会随角色权限与页面调整。`expo.owner` app config 属性在 SDK v56.0.0 的官方 app config reference 中存在；账号组织操作本身由当前 Expo dashboard 管理。

## Personal 与 Organization 的差别

Expo account 是放置 Expo projects 的容器，可管理 EAS 服务与协作成员。主要有两类：

| Account 类型 | 适合什么项目 | 主要特性 |
| --- | --- | --- |
| **Personal** | 个人 / hobby project | 注册 Expo 后自动创建，项目初期快速开始。不要与其他人共享个人账号密码。 |
| **Organization** | 公司、团队或多个开发者共用的工作 | 多个成员共享项目与 credentials；可按 Owner / Admin / Developer / Viewer 控制权限；可隔离账单并共享 EAS subscription。 |

当需要团队协作、多个 Owner、项目转让或把费用分开时，应将项目归属到 Organization，而非共用某个人的登录凭据。不同客户可使用不同 Organization 分开管理。

## 在 Dashboard 创建 Organization

登录 Personal account 后，从顶部账号菜单进入 **Create Organization**，填写组织名称与 slug，并可在创建时邀请成员。组织创建后，如需把 app config 中的 project 归属到此 Organization，在 Expo SDK config 的 `expo.owner` 写 organization slug：

```json
{
  "expo": {
    "owner": "company-mobile"
  }
}
```

SDK v56 的 app config reference 中，`owner` 是拥有该 Expo project 的账户名；未指定时默认当前登录用户的 username。

## 将 Personal Account 转成 Organization

如果想保留原有 project、只把个人空间升级为组织，可在 User Settings 使用 **Convert your account into an organization**。官方说明转换设计上保留现有运行关系：EAS Update、Push notifications、保存在 Expo server 的 Android / iOS credentials、Personal access token / webhooks、EAS subscription 和生产 App 均会继续工作。

这不同于邀请同事共用你的个人账号密码；转换后通过成员角色给予每人所需权限。

## 添加、改权限和移除成员

在 Organization Settings > **Members** 页面：

- **邀请成员：**只有 Owner 或 Admin 可以邀请；输入邮箱与初始角色。
- **Owner：**可给成员分配任意角色，包括 Owner。
- **Admin：**可授予 Owner 以外的角色，但不能新增 Owner。
- **改角色 / 移除成员：**操作者须为 Owner 或 Admin，使用对应成员的更多操作菜单。

## 角色权限

| 角色 | 页面给出的主要权限 |
| --- | --- |
| **Owner** | 可执行组织或其项目的所有操作，包括删除项目。 |
| **Admin** | 管理大多数账号设置，可购买付费服务、改成员权限并管理 programmatic access。 |
| **Developer** | 新建项目、创建 builds、发布 updates、管理 credentials。 |
| **Viewer** | 可通过 Expo Go 查看项目，不能修改项目。 |

给团队成员分配能完成工作的最小角色范围；商店凭据、API token 和项目 owner 要按实际职责管理。

## Rename 与 Project Transfer

官方页面说明账户 rename 与 project transfer 都有次数限制，没有在本页给出固定次数。Rename 只能由 Owner 操作；转移 project 时，操作者必须同时是**来源与目标 account 的 Owner 或 Admin**。

目标组织不允许把你加为 Owner / Admin 时，可先新建一个临时 escrow Organization；让最终接收方成为 escrow Owner，把 project 转入 escrow，再由对方从 escrow 转到最终账户。Escrow 是临时中转所有权的安全办法，实际转移仍要遵循双方 account 权限和 transfer 限制。

## Security Activity

Personal User Settings 的 Overview > User Settings 可查看账号安全活动，例如 password、email、2FA 设置变化。发生异常账号变更时，可从此处核对安全时间线。

## 关键名词

- **Organization：**团队共享的 Expo account 容器，不等同于 Apple Developer Team / Google Play developer account。
- **Slug：**account 或 project 的 URL 友好名字；`expo.owner` 使用账号名 / slug 指明项目归属。
- **Role-based access：**按 Owner / Admin / Developer / Viewer 角色发放权限。
- **Programmatic access：**通过 token / API 工具访问 Expo 服务的能力，应按组织权限治理。
- **Escrow Organization：**在转移双方无法直接满足权限要求时的临时组织中转账户。
- **Security activity：**用于查看账号敏感设置变更的记录。

## 官方代码主题覆盖

源页的代码主题是“新建 Organization 后，把 owner 字段写到 app config”的用法；示例与 Expo SDK v56.0.0 官方 app config 中 `expo.owner` 属性一致。账户角色、创建、邀请、transfer 等由 Dashboard UI 操作，原文没有 CLI 或程序化接口代码块。

## 下一页

官方页脚 **Next** 是 [Two-factor authentication](https://docs.expo.dev/accounts/two-factor/)，介绍启用 2FA 保护 Expo account。

**翻页：**[上一页：EAS Webhooks](./128-EAS-Webhooks.md) · [返回目录](./README.md) · [下一页：双重认证](./130-Expo-Two-Factor-Authentication.md)
