# 087｜GitHub Actions 自动发布 EAS Update PR Preview

**翻页：**[上一页：Development Build 中预览 Update](./086-EAS-Update-Dev-Client.md) · [目录](./README.md) · [下一页：EAS Update Deployment](./088-EAS-Update-Deployment.md)

**官方页面：**[GitHub Action for PR previews](https://docs.expo.dev/eas-update/github-actions/)

**版本边界：**示例使用 GitHub Actions 与 Expo 官方 Action tag / Node 版本；CI action 与运行环境可能更新。项目 Expo ~56.0.11 需要先完成 EAS Update config 和兼容的 dev / preview binary。此页只记录 workflow 和 secret 配置，没有写入仓库或触发 GitHub Actions。

## PR Preview 自动化在做什么

GitHub Action 是由 GitHub event 触发的 CI job。每个 pull request opened / synchronized 时运行 EAS Update，为当前分支发布 JS / assets preview，并在 PR 评论区给 reviewer 留 update 信息与 QR code。

评论 PR 需要 contents: read 和 pull-requests: write 权限。Workflow 使用 Expo access token 认证；token 应存在 GitHub Repository Actions Secret，不写在 YAML 或日志。

## .github/workflows/preview.yml 示例

```yaml
name: preview

on:
  pull_request:

jobs:
  update:
    name: EAS Update
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Check for EXPO_TOKEN
        run: |
          if [ -z "${{ secrets.EXPO_TOKEN }}" ]; then
            echo "Configure EXPO_TOKEN as a GitHub Actions secret."
            exit 1
          fi

      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: yarn

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: yarn install

      - name: Create preview
        uses: expo/expo-github-action/preview@v8
        with:
          command: eas update --auto
```

preview subaction 会运行 eas update --auto，并向 PR 评论 update 详情和可扫码的 QR code。secret 检查是保护工作流：缺少 EXPO_TOKEN 时尽早失败。

## 设置 GitHub EXPO_TOKEN Secret

1. 在 Expo Developer account 的 Access Tokens 页面创建 Personal Access Token。
2. 进入 GitHub repository Settings > Secrets and variables > Actions。
3. 新建名为 EXPO_TOKEN 的 Repository Secret 并粘贴 token。
4. 检查 repository / organization 是否启用了 GitHub Actions，并允许 workflow 使用 Expo 官方 Action。

以上是官方控制台配置说明，没有创建 token 或更改 GitHub 设置。

## 改用 Bun

如果项目由 Bun 管理，将 Node setup 步骤替换为 Bun setup，并将依赖安装改为 bun install：

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest

- name: Install dependencies
  run: bun install
```

其余 Expo action / EAS Update 命令保持相同。

## 关键名词

- **GitHub Actions：**根据 push / pull request 等事件运行的 CI 平台。
- **Repository Secret：**存放于 GitHub repo settings、仅供 workflow 运行读取的机密值。
- **EXPO_TOKEN：**EAS CLI 的个人访问令牌；CI 无法登录交互时用于 Expo account authentication。
- **Preview subaction：**Expo GitHub Action 中辅助发布 EAS Update 并回写 PR 评论的 action。
- **eas update --auto：**从当前 PR / ref 推断自动发布目标并生成 preview update 的参数。

## 官方代码主题覆盖

源页所有 code / config topics 均有示例：PR trigger、permissions、secrets.EXPO_TOKEN 检查、checkout、Node 24 与 Yarn cache、Expo GitHub Action v8 token、yarn install、preview subaction 的 eas update --auto；Repository Actions Secret 的创建步骤；Bun setup 和 bun install 替换写法。

## 下一页

官方页脚 **Next** 是 [Deploy updates](https://docs.expo.dev/eas-update/deployment/)，从预览进入 EAS Update 的 channels / branches 部署工作流。

**翻页：**[上一页：Development Build 中预览 Update](./086-EAS-Update-Dev-Client.md) · [返回目录](./README.md) · [下一页：EAS Update Deployment](./088-EAS-Update-Deployment.md)
