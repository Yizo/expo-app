# 072｜EAS Hosting Introduction

**翻页：**[上一页：用 eas.json 配置 EAS Submit](./071-EAS-Submit-Config.md) · [目录](./README.md) · [下一页：Deploy your first Expo Router and React app](./073-EAS-Hosting-Get-Started.md)

**官方页面：**[Introduction to EAS Hosting](https://docs.expo.dev/eas/hosting/introduction/)

**版本边界：**EAS Hosting guide URL 未固定 Expo SDK 版本，页面同时介绍 current hosting output modes、server functions 与 API routes。项目 Expo ~56.0.11 若使用 server runtime / Router API routes，需再按本地 SDK 56 package compatibility 校对；下面只整理官方当前 service 行为。

## EAS Hosting 是什么

EAS Hosting 是 Expo 对 Expo Router / React Native Web 项目的托管部署服务。它连接 Expo CLI 的 export 与 EAS deploy，可以一起发布静态页面、server functions、API routes 和服务器 assets。

部署会生成唯一 preview URL；项目还拥有固定的 production URL。Expo 希望用同一服务让 native / web release 更容易同步，并集中查看网站和 API route 的部署情况。

## Quick Start

先把 Web bundle 导出到 dist：

```sh
npx expo export --platform web
yarn expo export --platform web
pnpm expo export --platform web
bun expo export --platform web
```

然后部署：

```sh
eas deploy
```

首次部署会要求连接 EAS project，并选择 preview subdomain。成功后 CLI 输出 preview URL 与 Dashboard deployment detail 链接。以上命令没有在本地执行。

使用 eas 命令需要安装 / 登录 EAS CLI：

```sh
npm install --global eas-cli
eas login
eas whoami
```

页面也列出 Yarn / pnpm / Bun 全局安装方式；推荐 npm，或在不能全局安装时用 npx eas-cli@latest 代替 eas 命令。

## Web Output Mode

Expo app config 的 expo.web.output 有三种模式：

| Output | 含义 | 能力 |
| --- | --- | --- |
| single | 导出一个 index.html 的 single-page app。 | 纯前端路由由 SPA 处理。 |
| static | 导出静态生成的页面与文件。 | 适合不需要 request-time server code 的部署。 |
| server | 导出静态页面，并部署 server functions / API routes。 | App Router 的 +api.ts routes 与 server code 由 Workers runtime 运行。 |

入门流程常用单纯 web export；带 API routes 的 Expo Router 项目使用 server output mode。mode 可以后续调整并重新部署。

## 什么项目适合 EAS Hosting

- 有 Expo web build，想要 preview / production URL 而不另建 hosting server。
- Expo Router 项目使用 API routes 或 server functions。
- Android、iOS、Web 共享 build / release 自动化。
- 想通过 EAS Workflows 自动部署。
- 想从 Dashboard 看 server route crashes、logs 和 requests。

移动端纯 native 项目没有网页，不需要此服务；已成熟的 web infrastructure 若已满足需求，也可继续使用现有托管。

## Runtime 边界

EAS Hosting 的 server functions / API routes 运行在 Cloudflare Workers 和 V8 isolates，不是完整 Node.js server process。它为 Node.js modules 提供部分兼容，但不能假设所有 Node API、原生 binaries 或长生命周期背景任务都可用；不兼容时需改成 Workers 支持方式或把服务放在独立后端。

## URLs、Aliases 与 Rollback

每个 EAS Hosting deployment 不可变且有唯一 preview URL。用 alias 可给某次 deployment 一个较稳定名字，例如 staging 或 production。要快速回滚，可把 production alias 指向之前的 deployment ID：

```sh
eas deploy:alias --prod --id=<deploymentId>
```

付费计划可给 production deployment 绑定自定义域名；每个项目可配置一个自定义 domain，支持 apex 与 subdomain。

## Monitoring 与 Caching

EAS Dashboard 提供：

- API route 未捕获 crash，并按相似错误归组。
- API route 的 console.log / console.info / console.error 日志。
- HTTP requests metadata，例如状态、browser、region 与 duration。

API routes 可返回 Cache-Control directives，让 EAS Hosting 通过全局 CDN 缓存响应。静态 assets 默认浏览器缓存时间为 3600 秒。

## EAS Workflows 集成

Workflow 使用预打包 deploy job；production 可由参数控制，也可按 Git branch 条件部署：

```yaml
jobs:
  deploy_web:
    type: deploy
    environment: production
    params:
      prod: true
```

```yaml
jobs:
  deploy:
    type: deploy
    params:
      prod: ${{ github.ref_name == 'main' }}
```

Deploy job 可以放到 build / release 工作流里，发布完成后从输出获取 deployment URL。

## 关键名词

- **Deployment：**一次不可变的 web export 上传记录。
- **Preview URL：**指向某次特定部署的 URL。
- **Production URL：**项目稳定的生产 URL，指向当前生产 deployment。
- **Alias：**自定义稳定名字；可以切换目标以 promote / rollback。
- **Server function / API route：**在 HTTP request 时执行的服务端 JavaScript 代码。
- **Cloudflare Workers：**基于 V8 isolates 的服务端 runtime；仅部分兼容 Node.js。
- **CDN：**分布式缓存网络，用于缩短静态文件 / API response 到用户的传输距离。

## 官方代码主题覆盖

本页全部 code / configuration themes 均有改写：四个包管理器运行 expo export --platform web；eas deploy；EAS CLI 安装、login、whoami；single/static/server 三种 output；alias rollback 命令；API response cache / asset 默认 TTL；EAS Workflow 生产 deploy 及条件部署。未调用 EAS 或 Cloudflare 服务。

## 下一页

官方页脚 **Next** 是 [Deploy your first Expo Router and React app](https://docs.expo.dev/eas/hosting/get-started/)，从创建项目、导出 Web 到第一次 EAS Hosting 部署逐步实操。

**翻页：**[上一页：用 eas.json 配置 EAS Submit](./071-EAS-Submit-Config.md) · [返回目录](./README.md) · [下一页：Deploy your first Expo Router and React app](./073-EAS-Hosting-Get-Started.md)
