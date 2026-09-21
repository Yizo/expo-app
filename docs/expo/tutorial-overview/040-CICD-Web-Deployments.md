# 040｜CI/CD Tutorial：部署 Web 版本到 EAS Hosting

**翻页：**[上一页：用 Git Tag 触发生产发布](./039-CICD-Tag-Based-Releases.md) · [目录](./README.md) · [下一页：CI/CD Tutorial 后续步骤](./041-CICD-Tutorial-Next-Steps.md)

**官方页面：**[Deploy web apps to EAS Hosting with EAS Workflows](https://docs.expo.dev/tutorial/cicd/web-deployments/)

**版本边界：**本页使用 EAS Hosting 的 deploy job 和 Expo Web static export 配置。部署服务属于未版本化的 EAS 文档；项目 Expo ~56.0.11 要按 SDK v56 工具链复核 Web 支持。本文没有提交 Git 变更或创建 EAS Hosting 部署。

## EAS Hosting 与 deploy Job

EAS Hosting 可托管 Expo Web 构建。每次部署可得到唯一 URL；项目另有一个固定的 production URL，指向最近一次生产部署。

EAS Workflows 的预打包 deploy job 会执行 Web export，将导出目录上传到 EAS Hosting，并在 workflow 输出中返回 deployment URL：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| prod | boolean，可选 | true 部署到 production URL；省略则创建 preview deployment。 |
| alias | string，可选 | 给部署创建稳定别名，例如 staging 子域名。 |

Preview URL 可以直接发给评审；production URL 是项目对外的正式入口。

## 将 Expo Web 配置为 Static Export

在 app.json 中把 expo.web.output 设为 static：

```json
{
  "expo": {
    "web": {
      "output": "static"
    }
  }
}
```

static 会把网页导出为静态 HTML、JavaScript 与 assets 文件，可由 EAS Hosting 或其他静态托管服务处理。Expo 也支持 single 和 server 输出；本教程的部署步骤使用 static。

## 给 Preview Workflow 加 Web 部署

在已有的 preview.yml 中新增 deploy_web。没有 needs 依赖时，它会与 Android / iOS build job 并行运行；省略 prod 参数表示预览环境：

```yaml
name: Preview builds

jobs:
  # 保留已有 fingerprint、get-build、build_android、build_ios、notify jobs

  deploy_web:
    name: Deploy web (preview)
    type: deploy
```

每个 deployment 都得到独立预览 URL。EAS Workflows 从 GitHub 默认分支读取 workflow，所以配置需要推到 repository default branch 后生效。教程接着用 EAS CLI 手动验证：

```sh
git add .eas/workflows/preview.yml
git commit -m "Add web preview deploy job to preview workflow"
git push origin main
eas workflow:run .eas/workflows/preview.yml
```

在 Dashboard 中查看 deploy_web job 的 URL，打开后检查预览站点。

## 给 Production Workflow 加 Web 部署

前一章的 production workflow 由 v*.*.* 标签触发。增加相同 job，但传入 prod: true，网页就会上线到该项目稳定的 production URL：

```yaml
name: Deploy to production

on:
  push:
    tags: ["v*.*.*"]

jobs:
  # 保留已有 fingerprint、get-build、build、update jobs

  deploy_web:
    name: Deploy web (production)
    type: deploy
    params:
      prod: true
      alias: staging
```

不设置 alias 会使用官方 production URL；配置 alias 则能通过稳定的 staging 名称访问对应 deployment。修改 production.yml 后，先把 workflow 更新推到 main，再打一个版本 tag 触发整条生产流程：

```sh
git add .eas/workflows/production.yml
git commit -m "Add web production deploy to production workflow"
git push origin main
git tag v0.2.0
git push origin v0.2.0
```

完成后原生 Android / iOS release 与 Web production deploy 都由同一 release tag 启动。本文未执行这些命令。

## 关键名词

- **Static export：**将 Web app 导出成静态资源文件，不要求托管端运行 Expo 开发服务器。
- **Preview deployment：**非 production 的独立部署，通常每次有单独 URL。
- **Production URL：**项目固定的生产站点地址，指向最近一次生产部署。
- **deploy job output：**workflow 返回的部署 URL，可用于分享预览或核对生产目标。
- **Alias：**给 deployment 配一个较稳定的别名 URL，例如 staging。

## 官方代码主题覆盖

源页 code / config themes 均覆盖：app.json 的 static 输出配置；deploy job 的 prod 与 alias 参数；preview.yml 省略 prod 部署预览；更新 workflow 的 Git commit/push 与 eas workflow:run；production.yml 的 tag pattern + prod: true；生产 workflow 配置推到 main、创建并推送 v0.2.0 标签。Git、EAS 部署均未执行。

## 下一页

官方页脚 **Next** 是 [Next steps](https://docs.expo.dev/tutorial/cicd/next-steps/)，总结本教程的工作流参考与 EAS 服务后续文档。

**翻页：**[上一页：用 Git Tag 触发生产发布](./039-CICD-Tag-Based-Releases.md) · [返回目录](./README.md) · [下一页：CI/CD Tutorial 后续步骤](./041-CICD-Tutorial-Next-Steps.md)
