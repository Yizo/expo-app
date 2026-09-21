# 077｜用 EAS Workflows 自动部署 EAS Hosting

**翻页：**[上一页：EAS Hosting API Routes Monitoring](./076-EAS-Hosting-API-Routes.md) · [目录](./README.md) · [下一页：EAS Hosting Caching](./078-EAS-Hosting-Caching.md)

**官方页面：**[Web deployments with EAS Workflows](https://docs.expo.dev/eas/hosting/workflows/)

**版本边界：**本页使用 EAS Hosting 的 deploy job 和 EAS Workflows trigger，属于未版本化服务功能。项目 Expo ~56.0.11 的 Web Router / server APIs 需确认 SDK56 兼容性。本文只整理 YAML 与 CLI，不连接 GitHub 或创建部署。

## Production Deploy Workflow

EAS Workflows 可在每次更新 main branch 后自动 export Web build、部署至 Hosting 并 promote 到 production。先按 EAS Workflows 入门文档连接 EAS project / GitHub repository，再建立 .eas/workflows/deploy.yml：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    type: deploy
    name: Deploy
    environment: production
    params:
      prod: true
```

deploy job 会使用 production environment variables、export bundle、部署至 Hosting production URL。它可同时部署 website 与 API routes。也可用 CLI 手动运行：

```sh
eas workflow:run .eas/workflows/deploy.yml
```

## PR Preview 部署

如希望 PR 打开 / 更新时产生 preview URL，可另外建 .eas/workflows/pr-preview.yml：

```yaml
name: PR Preview

on:
  pull_request: {}

jobs:
  deploy:
    type: deploy
    name: Deploy PR Preview

  comment:
    needs: [deploy]
    type: github-comment
```

默认不带 prod: true，因此 deploy 产生 Preview URL。pull_request trigger 会在 PR 创建、reopen 或 synchronize 时运行。comment job 在 deploy 后自动发现 deployment 信息并把 preview URL 留在 PR，reviewer 可直接打开测试。

## 关键名词

- **Workflow Trigger：**push、PR 等 event，决定何时启动 automation。
- **production environment：**部署和 server code 可用的 EAS Production 环境变量。
- **Preview Deployment：**每次 PR 单独生成的临时 Web 部署和唯一 URL。
- **github-comment job：**为 GitHub pull request 自动添加工作流运行结果 / deployment 信息的预打包任务。
- **prod 参数：**deploy job 的 true / absent 决定是否部署到正式 Production URL。

## 官方代码主题覆盖

源页代码主题均有等价例子：main push 部署 production 的完整 YAML；手动 eas workflow:run；pull_request preview trigger；不带 prod 的 deploy job；用 needs 依赖 deploy 的 github-comment job。EAS project 和 GitHub integration 仅作说明，没有连接账号。

## 下一页

官方页脚 **Next** 进入 [Caching with EAS Hosting deployments](https://docs.expo.dev/eas/hosting/reference/caching/)，细化 API Route、HTTP Cache-Control、CDN 与静态 assets 的缓存行为。

**翻页：**[上一页：EAS Hosting API Routes Monitoring](./076-EAS-Hosting-API-Routes.md) · [返回目录](./README.md) · [下一页：EAS Hosting Caching](./078-EAS-Hosting-Caching.md)
