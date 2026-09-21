# 010｜EAS Workflows 入门：自动化构建与发布

**翻页：**[上一页：EAS Workflows 简介](./009-EAS-Workflows简介.md) · [目录](./README.md) · [下一页：预打包的 Workflow Jobs](./011-EAS-Workflows预打包任务.md)

**官方页面：**[Get started with EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/)

## 前置条件

入门流程需要 Expo account、Expo 项目和 EAS CLI。官方页面列出 create-expo-app 的 npm / Yarn / pnpm / Bun 命令；本地项目 Expo SDK 为 `~56.0.11`，若从头创建，要检查 CLI 默认模板选择，不能把 `@latest` 推断为 SDK56。

```sh
npx create-expo-app@latest
npm install -g eas-cli
```

## 生成开发构建 Workflow

CLI 可以生成同时为 Android 与 iOS 构建 development client 的 workflow 样板：

```sh
eas workflow:create --template build
eas workflow:run .eas/workflows/build.yml
```

模板输出 `.eas/workflows/build.yml` 并设置项目用于 EAS build。Workflow 完成后可通过 Dashboard 安装，也可把最新产物装到模拟器：

```sh
eas build:run -p android --latest
eas build:run -p ios -e development-ios-simulator --latest
npx expo start
```

本地 Metro 开发服务器运行 JS；development build 则提供项目自己的原生模块运行时。

## Production release workflow

需要商店发布流程时，EAS CLI 可以生成 `deploy` 模板；它准备 EAS Build / Update 配置和应用 ID，并根据项目 native fingerprint 判断编译还是发布兼容 OTA update：

```sh
eas workflow:create --template deploy
```

若只需两个平台的 production build，可维护一个 workflow：

```yaml
name: Create Production Builds

jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: production
  build_ios:
    type: build
    params:
      platform: ios
      profile: production
```

Production build 需要每个平台的签名凭证。官方 CLI 用 `eas credentials:configure-build` 为对应 profile 配置：

```sh
eas credentials:configure-build -p android -e production
eas credentials:configure-build -p ios -e production
eas workflow:run .eas/workflows/create-production-builds.yml
```

## 自动触发

把 GitHub repo 连接到 EAS 项目后，可以声明 push 到 main 时构建：

```yaml
name: Create Production Builds

on:
  push:
    branches: ['main']

jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: production
```

也可监听 App Store Connect app version 状态，例如 review 进入 waiting / ready。官方示例调用 Slack job 通知；下方保留触发事件和环境变量关系，webhook 由实际使用该集成的团队自行配置：

```yaml
name: Store review status notice

on:
  app_store_connect:
    app_version:
      states:
        - ready_for_review
        - waiting_for_review

jobs:
  notify_team:
    type: slack
    environment: production
    params:
      webhook_url: ${{ env.SLACK_WEBHOOK_URL }}
      message: 'App version is ready for review.'
```

## 关键名词

- **Build template**：EAS CLI 生成的一套工作流 YAML 初始文件。
- **Deploy template**：包含 production build / submit / OTA 更新决策的发布流程模板。
- **Fingerprint**：对原生项目状态计算的标识；是否变更可帮助判断需要新 binary 还是能发兼容 update。
- **`eas build:run`**：下载并在本地 Android / iOS Emulator / Simulator 启动最新 EAS build。
- **`needs`**：Workflow job 依赖关系；此页基础样例不需要时可在后续定义。

## 官方代码主题覆盖

源页命令 / YAML 主题全部有等价示例：创建 project / 安装 CLI 的包管理器方向、`workflow:create --template build`、手动运行、模拟器安装与 Expo start、deploy template、production Android / iOS build YAML、签名 credentials 与运行命令、GitHub push trigger、App Store Connect review-state trigger 和通过 environment variable 提供 webhook 配置。示例只写文档，没有执行外部服务操作。

## 下一页

页脚 **Next** 指向 [Pre-packaged jobs in EAS Workflows](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/)，列出 build、deploy、fingerprint 等现成 jobs 的输入和输出。

**翻页：**[上一页：EAS Workflows 简介](./009-EAS-Workflows简介.md) · [返回目录](./README.md) · [下一页：预打包的 Workflow Jobs](./011-EAS-Workflows预打包任务.md)
