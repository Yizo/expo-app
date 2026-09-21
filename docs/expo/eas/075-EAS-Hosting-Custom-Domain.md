# 075｜为 EAS Hosting 配置 Custom Domain

**翻页：**[上一页：EAS Hosting Deployments 与 Aliases](./074-EAS-Hosting-Deployments-and-Aliases.md) · [目录](./README.md) · [下一页：API Routes Dashboard Monitoring](./076-EAS-Hosting-API-Routes.md)

**官方页面：**[Custom domain](https://docs.expo.dev/eas/hosting/custom-domain/)

**版本边界：**域名、DNS 与 SSL 配置依赖当前 EAS Hosting / Cloudflare 服务。Custom domain 是官方注明的付费功能；DNS provider 的传播时间与控制台 UI 会因厂商变化。本文没有申请域名、改 DNS records 或部署网站。

## 使用前提

- EAS project 已有一份 production deployment；custom domain 一直指向 production alias。
- 你拥有准备配置的 domain。
- 项目计划具备 custom domain 功能；官方页面把它标记为 paid plan feature。

每个 EAS Hosting project 可绑定一个 custom domain，可为 apex domain（example.com）或 subdomain（app.example.com）。

## 在 EAS Dashboard 添加域名

在 EAS project Dashboard 的 Hosting settings 进入 Custom domain，输入要绑定的域名。如果项目尚无 production deployment，先将一个 deployment promote 到 production。接下来 Dashboard 会提供三类 DNS records：

| Record 用途 | 典型类型 | 目的 |
| --- | --- | --- |
| Ownership verification | TXT | 回读随机 token，确认你控制该 domain。 |
| SSL / Domain Control Validation | CNAME | 让证书机构验证 domain 并自动续期 TLS certificate。 |
| Traffic routing | Apex 使用 A record；subdomain 使用 CNAME | 将浏览器请求指向 EAS Hosting production endpoint。 |

示意值（最终以 EAS Dashboard 为准）：

- Apex domain：A record 常指向 172.66.0.241。
- Subdomain：CNAME 常指向 origin.expo.app。
- Domain Control Validation record 位于 domain 下属的验证子域名，不是用户访问站点的 CNAME。

提交 DNS 后在 Dashboard 按 Refresh，直至 ownership、SSL 与 routing checks 全部通过。

## 安排 DNS 切换顺序

要避免切换期间站点 downtime，依次添加：

1. Verification TXT record；Refresh 到 ownership check 通过。
2. SSL CNAME record；Refresh 到证书校验通过。
3. Routing A / CNAME record；最后把访问流量指到 EAS Hosting。

如果短暂 downtime 不重要，也可一次添加全部 records。DNS provider 传播速度可能不同。

## 给 Alias / Wildcard Subdomain 加 DNS

虽然每个 project 只有一个 custom domain，但可以为其他 deployment aliases 配更多子域名记录。例如给 staging alias：

| 自有域名类型 | DNS 记录 | 指向 |
| --- | --- | --- |
| Apex example.com | staging.example.com CNAME | origin.expo.app |
| 子域名 app.example.com | staging.app.example.com CNAME | origin.expo.app |

如果要让所有 alias subdomains 生效，可以使用 wildcard CNAME：

| 自有域名类型 | Wildcard 记录 |
| --- | --- |
| Apex example.com | *.example.com CNAME 到 origin.expo.app |
| app.example.com | *.app.example.com CNAME 到 origin.expo.app |

只要子域名都指向 origin.expo.app，EAS Hosting 会按请求子域名查找匹配 alias。例外是 www：如果没有名为 www 的 alias，www 子域请求会以 HTTP 308 redirect 转回主 custom domain，并指向 production deployment。

## 关键名词

- **Apex Domain：**注册的裸域名本身，例如 example.com。
- **DNS：**将域名映射到 hosting endpoint 的记录系统。
- **Verification TXT：**由 token 证明你拥有该域名的 DNS 控制权。
- **SSL CNAME / DVC：**Domain Control Validation 检查，用于证明你控制 domain 并签发 / 续期 HTTPS 证书。
- **Wildcard CNAME：**以星号匹配所有子域名的 CNAME。
- **SNI：**EAS Hosting 通过请求中的域名识别 project，而不是给每个站点分配独立 IP。

## 官方代码主题覆盖

源页无终端或 app code block；DNS configuration themes 均已整理：TXT 验证、SSL CNAME、apex A / subdomain CNAME、zero-downtime 按顺序添加，以及 alias / wildcard / www redirect 配置。具体 record value 以 EAS Dashboard 生成的项目值为准。

## 下一页

官方页脚 **Next** 是 [API Routes](https://docs.expo.dev/eas/hosting/api-routes/)，介绍在 EAS Hosting Dashboard 里查看 request、server logs 与 route crashes。

**翻页：**[上一页：EAS Hosting Deployments 与 Aliases](./074-EAS-Hosting-Deployments-and-Aliases.md) · [返回目录](./README.md) · [下一页：API Routes Dashboard Monitoring](./076-EAS-Hosting-API-Routes.md)
