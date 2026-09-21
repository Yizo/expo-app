# 074｜EAS Hosting Deployments 与 Aliases

**翻页：**[上一页：部署第一个 Expo Router / React Web 项目](./073-EAS-Hosting-Get-Started.md) · [目录](./README.md) · [下一页：Custom Domain](./075-EAS-Hosting-Custom-Domain.md)

**官方页面：**[Assign aliases and promote to production](https://docs.expo.dev/eas/hosting/deployments-and-aliases/)

**版本边界：**部署与 alias 是 EAS Hosting 当前服务模型；URL 规则和 CLI flags 以官方页面为准。本文只记录官方命令，没有创建 deployment、修改 DNS 或推广 production。

## Immutable Deployment URL

每次 EAS Hosting deploy 都生成一个独立 deployment；创建后内容不可修改，永久可按 ID 访问。URL 由 project preview subdomain 与 deployment ID 构成：

- Preview subdomain：在 EAS Dashboard Hosting settings 设定，也可在第一次 eas deploy 时选择。
- Deployment ID：默认是随机字母 / 数字；EAS 也允许自定义。
- Preview URL：类似 my-app--<deployment-id>.expo.app。
- Production URL：my-app.expo.app，表示当前绑定到 production alias 的 deployment。

同一个项目中，每次部署 ID 不同，旧部署继续可访问。

## Alias 的作用

Alias 是用户定义的 URL 名称，可为 staging、qa 或 production。部署时用 --alias 创建 deployment 并附上别名：

```sh
eas deploy --alias hello
```

它同时生成普通唯一 preview URL 和带 hello 的 alias URL，例如 my-app--hello.expo.app。Alias 名称在同一 project 内唯一；再次给现有 alias 命名会把它重新指向新 deployment。一个 deployment 可有多个 aliases。

也可把 alias 分配给已经存在的 deployment ID：

```sh
eas deploy:alias --id=my-id
```

my-id 来自 preview URL 的 deployment id 部分。

## Promote 与 Roll Back 到 Production

production URL 是一个特殊 alias，不是单独编译出来的 app。部署新版本时可以直接将 deployment promote 到 production：

```sh
eas deploy --prod
```

已有旧 deployment 若要回滚，只需把 production alias 指回对应 ID：

```sh
eas deploy:alias --prod --id=deploymentId
```

因为旧 deployment immutable 并保留，alias 重新指向就能恢复历史 Web 版本。

## Custom Domain 前置关系

项目自带 expo.app Preview / Production URLs。Custom domain 会映射到 production deployment，DNS / SSL 接下来由下一页详细说明。Alias URL 也可以与自定义域名下的子域名关联。

## IP 与 SNI

EAS Hosting 使用 SNI（Server Name Indication）；多个 project 共享入口 IP，不提供专属于单个项目的 dedicated IP 地址。

## 关键名词

- **Immutable Deployment：**创建后内容保持不变的部署快照。
- **Preview Subdomain：**project 的 preview URL 前缀。
- **Deployment ID：**唯一标记一个部署的 ID。
- **Alias：**可重新指向别的 deployment 的稳定名称 / URL。
- **Promote：**把 deployment 指向 production alias。
- **SNI：**客户端通过 TLS 域名选择共享 IP 上的对应站点。

## 官方代码主题覆盖

源页的 CLI themes 全部覆盖：首次部署选择 preview subdomain、eas deploy --alias hello、新建 deployment + alias、用 eas deploy:alias --id 关联现有 ID、eas deploy --prod 推生产，以及 eas deploy:alias --prod --id 回滚。URL 结构、唯一性与无专属 IP 的说明也已覆盖。

## 下一页

官方页脚 **Next** 是 [Custom domain](https://docs.expo.dev/eas/hosting/custom-domain/)，说明如何将自有 domain 绑定到 Production URL 并配置 DNS / SSL。

**翻页：**[上一页：部署第一个 Expo Router / React Web 项目](./073-EAS-Hosting-Get-Started.md) · [返回目录](./README.md) · [下一页：Custom Domain](./075-EAS-Hosting-Custom-Domain.md)
