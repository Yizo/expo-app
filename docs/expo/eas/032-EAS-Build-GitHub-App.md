# 032｜从 Expo GitHub App 触发 EAS Build

**翻页：**[上一页：从 CI 触发 EAS Build](./031-EAS-Build-CI.md) · [目录](./README.md) · [下一页：Expo Orbit](./033-Expo-Orbit.md)

**官方页面：**[Trigger builds from the Expo GitHub App](https://docs.expo.dev/build/building-from-github/)

**版本说明：**本页描述将 GitHub repo 关联 EAS project 后触发云端 build 的 Expo 服务流程。示例中使用 Git / GitHub 操作只作文档说明，没有访问仓库、安装 GitHub App 或触发构建。

## 前置条件

Expo GitHub App 使用 EAS Build profile，所以先满足：

1. 在要从 GitHub 构建的平台 build profile 中设置 image；若没有定制 image 依赖，可选择 latest。
2. 本地对希望支持的平台成功跑过一次 EAS build，使 EAS project、eas.json、application ID 和签名 credentials 完整。
3. 一个有 target repository 访问权限的 Expo organization user 已连接自己的 GitHub account；该账号接受 Expo GitHub App 请求的 repo 权限。

profile 的 image 示例：

```json
{
  "build": {
    "production": {
      "android": {
        "image": "latest"
      },
      "ios": {
        "image": "latest"
      }
    }
  }
}
```

如果 Expo project 根目录不是 GitHub repo 的 root，在 EAS project GitHub settings 中设 Base directory。

## 连接 Expo 与 GitHub

在 Expo Dashboard 账号 Connections 中先 Link GitHub，再 Install and Authorize Expo GitHub App；回到 EAS project settings > GitHub，选择要连接的 repository。将 app 连到 Expo account 后，负责安装 app 的 Expo user 需要 Owner / Admin 权限；Expo organization 只能连接 GitHub organization repo。

## 从网站手动触发

在项目的 EAS Builds 页面选择 Build from GitHub，填一个 branch / commit / tag（Git ref）、平台、build profile 和可选 base directory。Dashboard 展示 build 状态与链接；适合临时给某个 commit 建一份测试 binary。

## 用 Pull Request label 触发

PR label 格式为：

```text
eas-build-[platform]:[profile]
```

platform 可填 android / ios / all；缺省 platform 是 all，缺省 profile 是 production。示例标签 eas-build-android 会按 production profile 构建 Android；eas-build-all:development 则会创建两平台 development build。

Expo GitHub App 监听 PR 的最新 commit，在 PR Checks 中显示 build 状态和 EAS build 详情链接。

## 自动 push 构建与旧版 Build Triggers

推荐使用 EAS Workflows 监听 main branch push：

```yaml
name: Build on main

on:
  push:
    branches: [main]

jobs:
  android:
    type: build
    params:
      platform: android
      profile: production
  ios:
    type: build
    params:
      platform: ios
      profile: production
```

页面也仍列出旧 dashboard Build triggers，可按 branch push / tag / PR pattern 设触发器，但该能力已 deprecated 且新项目不再默认开放。Expo 推荐迁移到 EAS Workflows；旧 PR trigger 如果开放外部 contributor，还要求 PR author 为 repo collaborator。

Build trigger 可勾选 Submit to store after build；该动作要有 eas.json submit profile 和有效 store credentials，实际发布行为要单独 review。

## 关键名词

- **Expo GitHub App**：为 Expo project 安装授权 GitHub repo 的应用集成。
- **Git ref**：可构建的 branch、commit SHA 或 tag。
- **Base directory**：monorepo 中 Expo app 所在的子目录。
- **PR label trigger**：匹配 label 结构后启动指定平台 / profile build 的入口。
- **Build trigger**：旧版 EAS Dashboard 自动触发功能；当前优先选用 EAS Workflows。
- **Build image**：EAS 云构建所用 Android / iOS 工具链镜像。

## 官方代码主题覆盖

源页所有 code / configuration themes 均有等价示例：eas.json 平台 image、已完成本地 build 的初始化条件、Build from GitHub UI 输入、PR label 格式 / 默认 platform-profile / 示例 label、main push 的 EAS Workflows、旧 Build Triggers 已弃用边界以及启用自动提交的 credentials 要求。

## 下一页

页脚 **Next** 指向 [Expo Orbit](https://docs.expo.dev/build/orbit/)，介绍在桌面端查看 simulator、安装和打开 EAS build / update 的一键工具。

**翻页：**[上一页：从 CI 触发 EAS Build](./031-EAS-Build-CI.md) · [返回目录](./README.md) · [下一页：Expo Orbit](./033-Expo-Orbit.md)
