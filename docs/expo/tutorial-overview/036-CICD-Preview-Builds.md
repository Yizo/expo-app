# 036｜CI/CD Tutorial：Preview Builds 与 PR 预览

**翻页：**[上一页：自动化 Development Builds](./035-CICD-Development-Builds.md) · [目录](./README.md) · [下一页：E2E Tests](./037-CICD-E2E-Tests.md)

**官方页面：**[Create preview builds for pull requests with EAS Workflows](https://docs.expo.dev/tutorial/cicd/preview-builds/)

**版本边界：**本页示例涉及 EAS Build profile、EAS Update 与 EAS Workflows，属于未版本化服务指南。项目 Expo ~56.0.11 的 expo-updates 版本与原生模块需用 SDK v56 配套版本安装；安装时可通过 npx expo install 检查。Slack webhook 与 GitHub 命令都只是示例，没有创建第三方 App、设置密钥、提交或触发工作流。

## 两种 Preview 给不同审阅者

- **Preview build：**生成 Android / iOS 内部测试包，适合利益相关者在真实设备上体验接近 production 的应用。
- **PR preview update：**用 EAS Update 发布 JS / 资源变更，并在 Pull Request 自动留言链接或二维码，适合审阅者立即在设备上测试。

Preview build 包含原生模块，可独立安装；PR update 只适用于已安装且 native runtime 兼容的 build。没有添加或变更原生能力时，fingerprint 能跳过重复编译。

## 前置配置 EAS Update

安装 expo-updates 后配置更新 URL、runtime version 和每个 build profile 的 channel，再先构建一份 preview build。当前官方页列出 npm、Yarn、pnpm、Bun 的命令：

```sh
npx expo install expo-updates
yarn dlx expo install expo-updates
pnpm dlx expo install expo-updates
bunx expo install expo-updates
eas update:configure
eas build --profile preview --platform all
```

expo-updates 是原生库，所以 preview build 必须嵌入该原生模块和 eas.json 中配置的 channel。首次构建 profile 时 EAS CLI 也会向导创建签名凭据。

## Preview Build Workflow

preview.yml 复用 development build 教程的 fingerprint 流程，只把 EAS environment 与 build profile 切换为 preview：

```yaml
name: Preview builds

jobs:
  fingerprint:
    name: Fingerprint
    type: fingerprint
    environment: preview

  get_android_build:
    name: Check for existing Android build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}
      profile: preview

  get_ios_build:
    name: Check for existing iOS build
    needs: [fingerprint]
    type: get-build
    params:
      fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}
      profile: preview

  build_android:
    name: Build Android
    needs: [get_android_build]
    if: ${{ !needs.get_android_build.outputs.build_id }}
    type: build
    params:
      platform: android
      profile: preview

  build_ios:
    name: Build iOS
    needs: [get_ios_build]
    if: ${{ !needs.get_ios_build.outputs.build_id }}
    type: build
    params:
      platform: ios
      profile: preview
```

手动运行同一文件：

```sh
eas workflow:run .eas/workflows/preview.yml
```

首次运行会生成 Android 和 iOS build。此后若 native fingerprint 未变，EAS 可跳过 build job；团队成员通过内部测试分发安装对应预览包。

## 可选：完成后通知 Slack

Slack webhook URL 是发送消息的秘密。可在 EAS Dashboard 把它保存为 preview 环境中的 Secret 环境变量 SLACK_WEBHOOK_URL；也能用 EAS CLI 创建。不要将真实 webhook URL写入代码仓库：

```sh
eas env:set --name SLACK_WEBHOOK_URL \
  --value <SLACK_WEBHOOK_URL> \
  --environment preview \
  --visibility secret
```

Slack incoming webhook 的取得步骤是：在 Slack API Apps 创建或选用 app、开启 Incoming Webhooks、将 webhook 绑定到目标 channel 并复制 URL，然后把 URL 存进 EAS Secret 环境变量。

在 build jobs 之后添加 Slack 预打包 job。使用 after 可以等 build_android 与 build_ios 都结束后再发通知；不论 job 成功、失败或被跳过，message 都可报告平台状态：

```yaml
  notify:
    name: Notify on Slack
    after: [build_android, build_ios]
    type: slack
    environment: preview
    params:
      webhook_url: ${{ env.SLACK_WEBHOOK_URL }}
      message: "Preview builds are ready - Android: ${{ after.build_android.status }}, iOS: ${{ after.build_ios.status }}"
```

这里的 environment: preview 让 job 读取预览环境变量。若使用 Slack Block Kit 等富文本，也可以用 payload 参数代替简单 message。

更新 workflow 后可再次运行：

```sh
eas workflow:run .eas/workflows/preview.yml
```

Dashboard 会展示 notify job 状态；同时检查 Slack channel 是否收到通知。

## PR Preview：发布 EAS Update 并留言

Web 常用 Pull Request 部署预览链接。移动端可使用 EAS Update 将兼容的 JavaScript bundle 发给已有应用，然后用 github-comment job 在 PR 留下更新链接或 QR code。workflow 文件必须先合入 GitHub 默认分支，因为 EAS Workflows 从默认分支读取 workflow 文件。

新建 .eas/workflows/pr-preview.yml：

```yaml
name: PR Preview

on:
  pull_request:
    branches: ["*"]

jobs:
  publish_preview:
    name: Publish PR preview update
    type: update
    environment: preview
    params:
      channel: preview

  comment:
    needs: [publish_preview]
    type: github-comment
```

publish_preview 用 update job 往 preview channel 发布；comment 等待更新成功后留言。收到的链接 / 二维码可在设备或模拟器打开。团队应确保 preview build 已装好 EAS Update，并监听同一 channel。

## 测试 PR 预览的命令主题

将 workflow 配置先合到 GitHub 默认分支后，从 main 创建试验分支，再做一个容易看出的 JS 改动并推送 PR：

```sh
git checkout -b test-preview
git add .
git commit -m "Test PR preview"
git push origin test-preview
```

随后在 GitHub 上创建 test-preview 到 main 的 Pull Request。EAS 会依次运行 publish_preview 与 comment。本文只记录这些步骤，没有操作 Git 或 GitHub。

## 关键名词

- **Preview channel：**EAS Update 的发布目标；安装包需配置并监听兼容的 channel。
- **runtime version：**用来判断更新是否与已安装 native runtime 匹配的兼容标识。
- **Webhook：**服务之间的 HTTPS 通知入口；泄露后他人可向关联频道发消息，所以应作为 Secret 保存。
- **after / needs：**after 允许在被观察任务结束（包括失败/跳过）后执行；needs 表示必须等依赖 job 成功后再开始。
- **PR preview update：**给已安装的测试客户端分发该 PR 的 JS / 资源变更，不会替代需要 native 改动时的重新构建。

## 官方代码主题覆盖

源页所有代码主题均有等价示例：四种包管理器安装 expo-updates；eas update:configure 与 preview build；fingerprint/get-build/条件 build 的 Android+iOS preview workflow；手动运行 preview.yml；Secret Slack webhook 的 CLI 设置与 notify job 的 after、environment、webhook_url、message、平台状态表达式；PR pull_request/update/github-comment workflow；test branch 的 checkout、git add/commit/push 主题。外部服务账户和 Git 操作均未执行。

## 下一页

官方页脚 **Next** 是 [E2E tests](https://docs.expo.dev/tutorial/cicd/e2e-tests/)，介绍如何通过 Maestro 为工作流增加端到端测试。

**翻页：**[上一页：自动化 Development Builds](./035-CICD-Development-Builds.md) · [返回目录](./README.md) · [下一页：E2E Tests](./037-CICD-E2E-Tests.md)
