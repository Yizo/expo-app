# 133｜Expo / EAS Audit Logs

**翻页：**[上一页：Expo Organization Single Sign-On](./132-Expo-SSO.md) · [目录](./README.md) · [下一页：Billing 总览](./134-Billing-Overview.md)

**官方页面：**[Audit logs](https://docs.expo.dev/accounts/audit-logs/)

**版本边界：**官方页面标注 Audit Logs 仅向 Enterprise plan account 提供。功能范围、保留时间和计划要求可能调整；本文保存的是官方页面 2026-08-26 时的说明。

## Audit Logs 记录什么

Audit Log 记录账号对 EAS 资源做过的操作：哪些实体被改、修改类型、谁执行、什么时间。日志只能创建，不能改写或删除，用来还原账号内资源的真实变更轨迹。

可从 Account / Organization Settings 的 **Audit logs** 页面阅读，也可用 EAS CLI 查询。官方说明数据保留约 1.5 年；删除账户后其日志约 90 天后清除。

## 主要安全与历史追踪用途

- **Permission monitoring：**看谁邀请新成员、提升某个成员为 Admin，排查成员账号被盗后的权限扩大事件。
- **Access history：**看 Apple team / device 历史上何时被授予或撤销，即使该 device 当前不在团队列表仍可追溯过去访问。

Audit logs 作为不可更改的记录保留，所以排查异常变更时不会依赖事件发起者是否仍有管理权限。

## 当前可审计实体

官方列出的实体包括：

- Account、Account subscription、Project
- User Invitation、User Permission、Organization SSO Configuration
- Android App Credentials、Android Keystore、Google Service Account key
- App Store Connect API key、Apple Device、Apple Distribution Certificate、Apple Provisioning Profile、Apple Team、iOS App Credentials
- EAS Hosting Alias、EAS Hosting Custom Domain、EAS Hosting Deployment
- EAS Update Branch、EAS Update Channel
- LogRocket Organization、LogRocket Project
- Workflow、Workflow Revision

Expo 表示还会继续增加更多实体。

## Audit Log entry 的字段

| 字段 | 含义 |
| --- | --- |
| Actor | 执行该操作的账户成员。 |
| Entity Type | 被修改的实体种类。 |
| Action Type | `CREATE`、`UPDATE` 或 `DELETE`。 |
| Message | 根据本次 Action 生成的描述。 |
| Created At | 操作发生时间。 |

点击 Dashboard 的 row 还可以展开与该 log 相关的 metadata。

## 导出 Dashboard 日志

Organization / Account Settings > Audit logs 中选择 **Export** 并选时间段，最长 30 天。导出成文件后可在 Expo 页面外部留档；导出字段与 dashboard 表格字段类似，但不包含 Message。网站 Export 按钮只在 Expo website 上提供；需要程序化读取则用 EAS CLI。

## 从 EAS CLI 读取

显式提供账户名来读取指定 account；省略账户名时 EAS CLI 会交互式提示选择：

```sh
eas account:audit ACCOUNT_NAME
```

在脚本 / CI 中读取 machine-readable JSON：

```sh
eas account:audit ACCOUNT_NAME --json
```

其余分页与筛选参数参考当前 `eas account:audit --help` 或命令参考。

## 关键名词

- **Immutable log：**只能追加、不能改 / 删除的活动记录；适合作为组织安全审计依据。
- **Entity：**被审计的具体资源类别，例如 Android Keystore、EAS Update channel 或成员权限。
- **Actor：**发起该行为的组织成员 / 账户。
- **Action type：**对实体执行的创建、修改、删除操作。
- **Audit metadata：**点击 audit row 可展开的额外操作上下文。
- **Enterprise plan：**本来源页标记 Audit Logs 的可用计划；当前功能 entitlement 需要以账户套餐为准。

## 官方代码主题覆盖

源页命令主题全部覆盖：通过 `eas account:audit ACCOUNT_NAME` 读取账户活动、用 `--json` 作为脚本输出；页面未提供源码示例。实体清单、日志字段、export 的 30 天限制与 Message 缺席均已说明。

## 下一页

官方页脚 **Next** 是 [Billing: Overview](https://docs.expo.dev/billing/overview/)，概览 EAS 计划、账单、支付记录与 usage based billing 文档入口。

**翻页：**[上一页：Expo Organization Single Sign-On](./132-Expo-SSO.md) · [返回目录](./README.md) · [下一页：Billing 总览](./134-Billing-Overview.md)
