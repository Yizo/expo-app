# 131｜Expo Programmatic Access 与 Access Tokens

**翻页：**[上一页：Expo Account 双重认证](./130-Expo-Two-Factor-Authentication.md) · [目录](./README.md) · [下一页：Organization Single Sign-On](./132-Expo-SSO.md)

**官方页面：**[Programmatic access](https://docs.expo.dev/accounts/programmatic-access/)

**版本边界：**此 Account / EAS CLI 指南未锁 SDK 版本。Token 认证命令适用于 EAS CLI 自动化；token 权限取决于它所属的用户或 Robot user 及其组织角色。EAS CLI 参数和 dashboard 设置会变化，token 应使用当前 Expo 文档生成与管理。

## 为什么脚本不应使用用户名和密码

CI 或管理项目的脚本需要认证，但把 Expo 用户名和密码交给 CI 会让脚本持有整个用户账户的登录凭据。更好的做法是创建专用 access token，让每个自动化入口能被单独撤销。

Access token 和用户密码一样敏感：任何拿到 token 的人 / 程序都能执行 token 权限允许的操作。若泄漏，可在 Expo Dashboard 的 Access tokens 页面删除该 token 来撤销，不需要重置账号密码或踢掉其他登录会话。

## Personal Access Token 与 Robot User

| Token 类型 | 由谁创建 / 代表谁 | 权限特点 |
| --- | --- | --- |
| **Personal access token** | 从 Expo Dashboard 创建，代表个人用户 | 可访问该 Personal account 下资源，以及该用户有权限访问的 Personal / Organization 资源；相当于该用户操作能力。 |
| **Robot user access token** | 组织建立 Robot user 后签发 | 可给 bot 用户分配组织角色，限制自动化可操作范围；Robot user 不能登录 Expo 网站 / Expo Go，也不能独立拥有项目，只能用 access token 认证。 |

跨多个组织、想按职责限制 CI 权限时，优先考虑 Robot user；个人 PAT 则按个人用户当前拥有的访问权限执行。

## 在终端 / CI 中使用 EXPO_TOKEN

先在 Dashboard 创建 token，再将其作为 secret 存在受保护的 shell / CI 环境里。运行 EAS CLI 时无需 `eas login`：

```sh
EXPO_TOKEN=YOUR_TOKEN eas build
```

当 token 与 username/password 同时存在时，`EXPO_TOKEN` 认证优先。不要把真实 token 写进源代码、命令日志或公开配置文件。

## 让项目预先关联 EAS Project

使用 token 的 EAS CLI 命令要求项目已经链接到 EAS project，app config 中有 `extra.eas.projectId`。否则 `eas build` 会报 project 未配置。首次创建 / 绑定项目可显式调用：

```sh
EXPO_TOKEN=YOUR_TOKEN eas init --force --non-interactive
```

此命令会在当前项目初始化 EAS project；确认账户 / 目标项目与项目目录正确后再运行。脚本应确保该 project ID 对应预期账户资源。

## 常见使用场景

- 从 CI 构建或发布，不把 Expo 用户密码交给流水线。
- 定期轮换某一个 token，而不必重置用户密码或结束账号所有会话。
- 只把一次性 / 限定组织角色的 token 给临时脚本或协作者。

如怀疑 token 泄漏，立即到 Dashboard 的 Access tokens 页面删掉对应 token；随后给受影响的 CI secret 换成新 token。

## 关键名词

- **Programmatic access：**由脚本、CI 或服务调用 EAS CLI，而不是人工交互登录。
- **Personal access token：**以个人用户身份调用 Expo / EAS 的长期 credential。
- **Robot user：**供组织自动化使用、可分配角色权限的机器用户，不具备普通交互登录能力。
- **`EXPO_TOKEN`：**EAS CLI 识别的 token 环境变量；有它时不需要 `eas login`。
- **`extra.eas.projectId`：**在 app config 中把本地工程关联到 Expo 云端 project 的 ID。
- **Least privilege：**尽量让自动化身份只有完成工作所需的最小角色与项目权限。

## 官方代码主题覆盖

源页代码主题均已覆盖：用 `EXPO_TOKEN` 运行 `eas build`；第一次初始化时用 token 运行 `eas init --force --non-interactive`；token 认证不需 `eas login` 且优先于密码认证。Personal / Robot user 的权限与 token 撤销方式一并解释。

## 下一页

官方页脚 **Next** 是 [Single Sign-On (SSO)](https://docs.expo.dev/accounts/sso/)，说明组织如何通过身份提供商登录 Expo。

**翻页：**[上一页：Expo Account 双重认证](./130-Expo-Two-Factor-Authentication.md) · [返回目录](./README.md) · [下一页：Organization Single Sign-On](./132-Expo-SSO.md)
