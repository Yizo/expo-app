# 015｜用 EAS Workflows 自动化 CLI 命令

**翻页：**[上一页：Workflow 环境变量与上下文](./014-EAS-Workflows环境变量.md) · [目录](./README.md) · [下一页：EAS Workflows REST API](./016-EAS-Workflows-REST-API.md)

**官方页面：**[Automating EAS CLI commands](https://docs.expo.dev/eas/workflows/automating-eas-cli/)

## 把 EAS 命令映射成 workflow job

使用 CLI 手动构建时，命令通常是 `eas build --platform ios --profile production`。Workflow 里的 `type: build` 等价表达平台和 profile，并能复用构建完成后的 `build_id`。

```yaml
name: iOS production build
on:
  push:
    branches: ['main']
jobs:
  build_ios:
    name: Build iOS
    type: build
    params:
      platform: ios
      profile: production
```

既可由 push trigger 启动，也可用 `eas workflow:run .eas/workflows/build-ios.yml` 手动运行。

## 自动化提交到商店

单独运行 `eas submit --platform ios` 会使用已有 build；若 Workflow 同时创建 binary，就从 Build job output 把 `build_id` 传给 Submit：

```yaml
jobs:
  build_ios:
    type: build
    params:
      platform: ios
      profile: production
  submit_ios:
    needs: [build_ios]
    type: submit
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
      profile: production
```

要提交已存在的 build，可直接提供其 `build_id`，或先用 `get-build` 按 profile / version 动态查找。商店上传仍需要签名凭证和 `eas.json` submit profile。

## 自动发布 OTA Update

手工 CLI 可以跑 `eas update --auto`；Workflow 用 `type: update` 声明 branch / channel，并可用 GitHub branch 名生成 update 路由：

```yaml
name: Publish update
on:
  push:
    branches: ['*']
jobs:
  publish:
    type: update
    environment: production
    params:
      branch: ${{ github.ref_name || 'preview' }}
      message: Update from ${{ github.ref_name }}
```

SDK55+ 在发布 EAS Update 时还需选择 EAS Environment；Build 与 Update 的 environment / channel 应保持更新兼容逻辑一致。

## 适用范围

Automating EAS CLI guide 假设 workflow 能访问关联的 GitHub repository，用分支 push 自动触发；但任何 workflow 都仍可通过 `eas workflow:run` 手工启动。适合重复执行的 Build / Submit / Update 流程，还可串接 Maestro、单元测试和自定义脚本。

## 关键名词

- **Job output**：Build 结束后产生的 `build_id`、app version 等结果。
- **`needs`**：声明当前 job 需要等上游 job 完成，并为下游读出 outputs。
- **EAS Update branch / channel**：update 分支决定逻辑版本线，channel 由 build 订阅并指向 branch。
- **Workflow trigger**：如 `on.push.branches`，满足条件时由 EAS 自动执行工作流。

## 官方代码主题覆盖

本页所有 code themes 都有改写示例：传统 `eas build` 到 Build job、`.eas/workflows` / GitHub push trigger、手动 `eas workflow:run`、Submit job 对 `build_id` 的依赖、已有 build / `get-build` 查找，以及 `eas update --auto` 到 branch-based Update job。SDK55+ `--environment` 兼容要求亦注明。

## 下一页

页脚 **Next** 指向 [EAS Workflows REST API](https://docs.expo.dev/eas/workflows/rest-api/)，介绍通过 HTTP API 管理 workflow runs。

**翻页：**[上一页：Workflow 环境变量与上下文](./014-EAS-Workflows环境变量.md) · [返回目录](./README.md) · [下一页：EAS Workflows REST API](./016-EAS-Workflows-REST-API.md)
