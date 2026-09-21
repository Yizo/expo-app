# 052｜发布 Expo Web 应用

**翻页：**[上一页：发布 OTA 更新](./051-发布OTA更新.md) · [目录](./README.md) · [下一页：监控服务](./053-监控服务.md)

**官方页面：**[Publish your web app](https://docs.expo.dev/deploy/web/)

## EAS Hosting 适合什么项目

EAS Hosting 可部署由 Expo Router / React 构建的 Web app，也支持 Expo API Routes。Expo app config 中 expo.web.output 需设为 static 或 server。

## 导出 Web 项目

先把 Web 项目导出到 dist。代码改动后、再次部署前要重新导出：

| 包管理器 | 命令 |
| --- | --- |
| npm / npx | npx expo export --platform web |
| Yarn | yarn expo export --platform web |
| pnpm | pnpm expo export --platform web |
| Bun | bun expo export --platform web |

## 首次预览部署

运行 EAS CLI：

~~~sh
eas deploy
~~~

第一次执行会提示为项目选择预览子域名；之后 CLI 会显示可打开的预览 URL，例如 test-app--1234.expo.app。

## Production 部署

~~~sh
eas deploy --prod
~~~

EAS CLI 会返回 production URL。预览部署和 production 部署是不同环境入口，可先用预览网址验证，再部署 production。

## 自动部署

EAS Workflows 可以在每次 main branch 提交后自动导出并部署 Web 项目。先配置 EAS project，再于仓库根目录创建 .eas/workflows/deploy-web.yml：

~~~yaml
name: Deploy web

on:
  push:
    branches: ['main']

jobs:
  deploy_web:
    name: Deploy web
    type: deploy
    params:
      prod: true
~~~

手动运行工作流：

~~~sh
eas workflow:run deploy-web.yml
~~~

若项目包含 API Routes、自定义域名或部署别名，需继续配置相应环境、headers 与域名。

## 关键名词

- **Web export**：把 Expo Web 代码打包进 dist 目录，供托管平台部署。
- **Preview subdomain**：EAS 预览环境分配的子域名前缀。
- **Production URL**：给真实用户访问的 production 部署地址。
- **EAS Workflow**：定义自动化的 YAML 工作流。

## 官方代码主题覆盖

本页代码用途均有改写示例：四种包管理器导出 Web、预览部署、production 部署、自动部署 YAML 和手动触发工作流。

## 下一页

页脚 Next 指向 [Monitoring services](https://docs.expo.dev/monitoring/services/)。

**翻页：**[上一页：发布 OTA 更新](./051-发布OTA更新.md) · [目录](./README.md) · [下一页：监控服务](./053-监控服务.md)

