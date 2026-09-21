# 031｜EAS Tutorial：从 GitHub Repository 触发 Build

**翻页：**[上一页：EAS Tutorial：分享 Preview](./030-EAS-Tutorial分享Preview.md) · [目录](./README.md) · [下一页：EAS Tutorial：Next Steps](./032-EAS-Tutorial后续步骤.md)

**官方页面：**[Trigger builds from a GitHub repository](https://docs.expo.dev/tutorial/eas/using-github/)

**版本边界：**Expo GitHub App 会触发 EAS 云构建，不会更改项目 Expo SDK。页面示例目标是前几章设置的 development build；本地 SDK56 项目需按 SDK56 工具链配置构建。本文仅记录步骤，没有安装 App 或操作 GitHub。

## 连接账号与 Repository

Expo GitHub App 是由 EAS 项目调用的 GitHub 集成。教程步骤：

1. 在 Expo account 的 Connections 页面点击 Connect，授权并 Install Expo GitHub App。
2. 授权完成后把 GitHub installation Link 到 Expo account。
3. 在对应 EAS project settings > GitHub 里选择并连接项目 repository。
4. 若 app 源码不在 repository root，设置 project 的 base directory。

安装 App 需要 Expo account Owner / Admin 权限；Expo organization 只能把组织拥有的 GitHub repository link 到该 organization 项目。

## 指定 Build Image 和 PR Label

要用 GitHub App Build，一个前置条件是在 eas.json build profile 设置 android / ios image；如果没有依赖某个定制镜像，可用 latest：

```json
{
  "build": {
    "development": {
      "android": { "image": "latest" },
      "ios": { "image": "latest" }
    }
  }
}
```

接着在 GitHub PR 的 Labels 添加下列格式：

```text
eas-build-[platform]:[profile]
```

platform 可为 android、ios 或 all；profile 填 eas.json 已定义的 build profile。缺省为 all platform / production profile。例如：

```text
eas-build-all:development
```

App 对 PR 指定 build profile 和 platform 后，会由 EAS Build 对 PR 最新 commit 触发构建，并在 PR Checks 与 EAS Dashboard 中显示结果。要同时开发、preview、production variants，可分别给对应 build profile 加标签。

## GitHub Push 自动 Build

不使用 PR label 时，可以把项目接入 EAS Workflows，在 push 到 main 时构建：

```yaml
name: Build

on:
  push:
    branches: [main]

jobs:
  build_android:
    name: Build Android App
    type: build
    params:
      platform: android
  build_ios:
    name: Build iOS App
    type: build
    params:
      platform: ios
```

教程示例还要求先创建一个 dev branch、改一处 JS、提交并推送，再给 PR 添加 label；这些是演练所用 Git 步骤，本地整理过程没有执行它们。

## 旧版 Dashboard Build Triggers

源页还介绍旧的 Dashboard Build Triggers，可设置 branch push、Git tag 或 PR base branch glob；但该功能已 deprecated，且新项目默认禁用。Expo 推荐迁移至 EAS Workflows 或 GitHub PR label 触发。

旧 PR trigger 对外部 contributor 有约束，pull request 作者需要是 repo collaborator。自动提交功能必须另外在 EAS project UI 启用，并由 eas.json submit section 配好 store credentials。

## 关键名词

- **Expo GitHub App**：将 GitHub repository 与 Expo / EAS project 连接的 GitHub 集成。
- **GitHub installation**：被授权的 App installation，允许 Expo 访问选定 repositories。
- **Base directory**：monorepo 中 Expo app 文件夹相对 GitHub repository root 的路径。
- **PR label trigger**：用 label 格式指定 build profile 与平台的触发方式。
- **Build Image**：EAS 云端编译 Android / iOS 原生 project 的工具链版本集合。
- **EAS Workflow**：Expo 云端 CI/CD job runner，可以直接用 YAML 声明 on.push builds。

## 官方代码主题覆盖

源页 code themes 均有重写示例：eas.json 平台 image 字段、Expo / GitHub installation 和 repository / base-directory 设置、PR label pattern 与默认 profile / platform、PR 标签触发 Android / iOS / all build，以及 push main 时 EAS Workflow 创建两平台 jobs。旧 Dashboard trigger 的 deprecated 状态与提交选项也已说明。

## 下一页

页脚 **Next** 指向 [Next steps](https://docs.expo.dev/tutorial/eas/next-steps/)，回顾 EAS Tutorial 并列出 Build、Update、Submit、Hosting 等官方后续文档分支。

**翻页：**[上一页：EAS Tutorial：分享 Preview](./030-EAS-Tutorial分享Preview.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：Next Steps](./032-EAS-Tutorial后续步骤.md)
