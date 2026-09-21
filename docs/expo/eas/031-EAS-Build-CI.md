# 031｜从 CI 触发 EAS Build

**翻页：**[上一页：在 EAS Build 中使用 EAS Update](./030-EAS-Build与EAS-Update.md) · [目录](./README.md) · [下一页：从 GitHub App 触发构建](./032-EAS-Build-GitHub-App.md)

**官方页面：**[Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/)

**版本说明：**CI 只负责触发云端 build，构建产物仍由 EAS Build 生成。本页有多个 CI vendor 配置范例；变量名 / GitHub Actions 版本随 CI 平台更新，实施时回到 Expo 当前页面校对。本地不运行 build 或 CI。

## 先完成一次本地配置

要让 CI 的非交互命令工作，先从本机各执行一次想支持的平台 EAS build，让交互式 CLI 初始化必要项目设置：

```sh
eas build --platform all
```

这一步会确保：

- EAS project 已有 projectId。
- 根目录已有 eas.json 和 build profile。
- app config 有 Android / iOS application identifiers。
- 对应平台的 Android keystore / iOS distribution certificate / provisioning profile 已准备好。

之后 CI 通过 EXPO_TOKEN 环境变量认证 EAS owner；token 应放在 CI secret store。EAS Workflows 是同一服务内直接运行 build jobs 的 Expo CI/CD 选择：

```yaml
name: Build
on:
  push:
    branches: [main]
jobs:
  build_android:
    type: build
    params:
      platform: android
  build_ios:
    type: build
    params:
      platform: ios
```

## CI 调用 EAS Build

基础非交互命令：

```sh
npx eas-cli build --platform all --non-interactive --no-wait
```

--no-wait 在成功触发远程 build 后就结束 CI step，不等待云端编译完成；CI job 只确认 build 已成功排队。需要同一 CI workflow 后续步骤等待 artifact 时应移除此参数，再根据 build 完成状态继续。

CI 中的 EXPO_TOKEN 可授权触发 build。iOS 凭证需要修复、ad hoc devices 新增时，可选用 App Store Connect API key 环境变量：

```text
EXPO_ASC_API_KEY_PATH
EXPO_ASC_KEY_ID
EXPO_ASC_ISSUER_ID
EXPO_APPLE_TEAM_ID
EXPO_APPLE_TEAM_TYPE
```

可选的 iOS ad hoc provisioning refresh 要同时传 --non-interactive 和 --refresh-ad-hoc-provisioning-profile。EAS 使用 ASC API key 检查 Apple team 的设备清单；EAS Workflows 可在 build job params 中用 refresh_ad_hoc_provisioning_profile: true。项目需要 internal distribution、EAS-managed credentials，且至少一台设备已登记。

## 其它 CI 平台配置形状

Expo 文档列出 Travis CI、GitLab CI、Bitbucket Pipelines、CircleCI 和 GitHub Actions 的触发例子。它们都做同一件事：checkout repository → 安装依赖 → 在 CI secret 中注入 EXPO_TOKEN → 用 non-interactive EAS CLI 触发 build。比如 GitLab：

```yaml
image: node:alpine

cache:
  key: $CI_COMMIT_REF_SLUG
  paths:
    - .npm

stages: [build]

before_script:
  - npm ci --cache .npm

eas_build:
  stage: build
  script:
    - apk add --no-cache bash
    - npx eas-cli build --platform all --non-interactive --no-wait
```

CircleCI 的配置页需声明 executor / checkout / dependency install / run build step；Bitbucket 则用 pipeline step 和 npm cache；Travis 使用 node_js 和 jobs；都把 token 配在项目 CI secrets，不写入 yaml。

GitHub Actions 示例：

```yaml
name: EAS Build

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform all --non-interactive --no-wait
```

## 关键名词

- **CI provider**：托管或执行自动化的服务，如 GitHub Actions、Travis、GitLab、Bitbucket、CircleCI。
- **EXPO_TOKEN**：CI 用于代表有 EAS 项目权限的用户调用 EAS CLI 的凭证。
- **Non-interactive**：CLI 不等待终端人工回答；触发 build 前配置和凭证都必须准备好。
- **no-wait**：EAS 命令把 job 入队后就退出，不等待云端二进制完成。
- **App Store Connect API key**：CI 自动修复 iOS credential / 更新 ad hoc provisioning 所需的 Apple API 凭证。

## 官方代码主题覆盖

源页代码主题均有重写 / 概括：本地先成功构建以初始化 EAS project；EAS Workflow Android/iOS build job；EXPO_TOKEN 和 ASC key environment variables；non-interactive / no-wait 触发命令；刷新 ad hoc provisioning 的两个配置入口；Travis、GitLab、Bitbucket、CircleCI、GitHub Actions 的安装 / checkout / secret / 触发模式。示例没有执行，也没有将真实 token 写入文件。

## 下一页

页脚 **Next** 指向 [Trigger builds from the Expo GitHub App](https://docs.expo.dev/build/building-from-github/)，用 Expo GitHub App 的 project link、网页 build UI 或 PR labels 触发云构建。

**翻页：**[上一页：在 EAS Build 中使用 EAS Update](./030-EAS-Build与EAS-Update.md) · [返回目录](./README.md) · [下一页：从 GitHub App 触发构建](./032-EAS-Build-GitHub-App.md)
