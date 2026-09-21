# 021｜用 EAS Workflows 发布 Preview Updates

**翻页：**[上一页：用 EAS Workflows 创建 Development Builds](./020-自动创建Development-Builds.md) · [目录](./README.md) · [下一页：清理 EAS Update branches](./022-清理EAS-Update-Branches.md)

**官方页面：**[Publish preview updates with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/publish-preview-update/)

**版本说明：**EAS Update / Workflows 属于 Expo 服务，本身不锁定 SDK。SDK56 app 需要先配置 EAS Update、创建兼容当前 native runtime 的 development build；本页只记载服务端发布模板，没有实际发布。

## Preview Update 的使用场景

Preview update 可以让团队通过已有 development build 快速查看某个 commit 的 JavaScript / assets 改动，而不必先拉取最新代码并在本机重新构建。提交后可从 development build UI 或 EAS dashboard 的二维码打开预览。

前置条件：

1. 已对当前 project 配置 EAS Update，初次可运行配置命令：

```sh
eas update:configure
```

2. 每个目标平台已创建 Development Build；Update 不能代替原生二进制所需的构建。

## 每个 GitHub commit 发布一条 Preview

示例监听所有分支的 push，并用 GitHub ref name 作为 EAS Update branch。每个 commit 都会执行一个 type 为 update 的 job：

```yaml
name: Publish preview update

on:
  push:
    branches: ['*']

jobs:
  publish_preview_update:
    name: Publish preview update
    type: update
    params:
      branch: ${{ github.ref_name || 'test' }}
```

这样团队可按 branch 找到预览版本。若要将更新发布给用户，还要单独考虑 EAS Update channel / branch 映射、runtime compatibility 和 release 策略；本页讲的是预览场景。

## 关键名词

- **Preview update**：给团队或评审者查看某次 JS / asset 修改的 OTA 预览。
- **Branch name**：例子用 GitHub 的分支名作为 update branch 名称，每条工作分支可以独立预览。
- **Development build**：含当前项目原生依赖、可载入该 update 的 app binary。
- **Commit**：Git repo 中一个版本节点；本工作流在每次 push commit 时触发。
- **QR code**：EAS dashboard 可提供的扫描入口，便于测试者在设备上打开预览。

## 官方代码主题覆盖

源页代码主题均已改写：初始化 EAS Update 的 CLI 命令；每个平台已有 development build 的前置条件；workflow 的 push trigger 和全分支过滤；type update job；从 GitHub ref name 派生 branch 的表达式。没有提交真实 update。

## 下一页

页脚 **Next** 指向 [Clean up EAS Update branches with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/branch-cleanup/)，在 GitHub branch 删除时清理对应的 EAS Update branch。

**翻页：**[上一页：用 EAS Workflows 创建 Development Builds](./020-自动创建Development-Builds.md) · [返回目录](./README.md) · [下一页：清理 EAS Update branches](./022-清理EAS-Update-Branches.md)
