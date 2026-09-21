# 033｜CI/CD Tutorial：用 EAS Workflows 自动化交付

**翻页：**[上一页：EAS Tutorial 后续学习路径](./032-EAS-Tutorial后续步骤.md) · [目录](./README.md) · [下一页：第一个 EAS Workflows Job](./034-运行首个EAS-Workflow.md)

**官方页面：**[CI/CD Tutorial: Introduction](https://docs.expo.dev/tutorial/cicd/introduction/)

**版本边界：**本页指南 URL 未固定 SDK 版本；工作流属于 EAS 云服务，和 SDK 56 并非同一个版本号。本地项目为 Expo `~56.0.11`，示例项目创建命令按官方当前指南；新建项目可能得到更新 SDK，不能直接假定与现有 SDK 56 项目相同。本文只改写命令和 YAML 示例，没有创建 EAS 项目、登录账号或触发 GitHub 工作流。

## CI/CD 在 Expo 项目中做什么

移动应用交付通常要分别构建 Android 与 iOS、运行自动化测试、发给同事或 QA 验收，最后提交应用商店。**CI/CD（持续集成 / 持续交付）**把重复的检查和发布步骤写成随代码运行的自动流程。

**EAS Workflows** 是 Expo Application Services 提供的云端工作流服务。工作流写成 YAML 文件，放在 Expo 项目根目录的 `.eas/workflows/` 下。下面是一个在 GitHub `main` 分支每次收到 push 时构建 Android development build 的示例：

```yaml
name: Build Android

on:
  push:
    branches: [main]

jobs:
  build:
    type: build
    params:
      platform: android
      profile: development
```

工作流文件不要求自行维护编译服务器。EAS 云环境负责执行构建和提供产物。工作流还可以发布 OTA 更新、提交应用商店以及运行 Maestro 端到端测试。

## 触发时机

EAS Workflows 可以由 GitHub push、pull request、标签或 PR label 事件触发，也可以按 cron 定时运行，或由 EAS CLI 手动触发。触发规则和任务都放在 workflow YAML 中，变更可以随项目版本控制。

## 决定 Build 还是 Update

先判断改动影响的是原生层还是 JS 资源，再选交付方式：

| 目标 | 常用 EAS 服务 | 适用情形 |
| --- | --- | --- |
| App Store / Google Play | EAS Build + EAS Submit | 新版本、原生代码、权限、SDK 升级等需要新 binary 的改动。 |
| 已安装的手机或测试设备 | EAS Update | 纯 TypeScript / JavaScript 或资源改动，且设备上已有兼容的原生运行时。 |
| Web | EAS Hosting | 和原生 App 一起维护的网页或 API Routes。 |

**Build** 会编译原生代码并产生完整应用包，通常需要数分钟。**Update** 只分发 JS 与资源，通常很快；但要求已安装 binary 包含所需原生能力。添加原生依赖、修改权限、升级 SDK 时，先 Build 后 Update。

## Build Profile

EAS Build 默认常见三个 profile，用来表达构建用途：

- `development`：开发期，通常带开发工具并连接 Metro。
- `preview`：预览 / 内部分发，供团队在接近真实的构建上验收。
- `production`：面向发布渠道的生产构建。

profile 是 `eas.json` 中的命名配置，具体行为要结合项目配置；名称本身不会自动保证商店上架或权限设置正确。

## 开始教程前的准备

官方教程要求有 Expo 账号、全局安装 EAS CLI 并登录；已有或新建 Expo 项目；用 `eas build:configure` 将项目连接到 EAS；准备一个 GitHub repository 并在 EAS Dashboard 安装/授权 Expo GitHub App。自动商店提交凭据是后续章节的可选配置。

### 安装并登录 EAS CLI

选一个包管理器安装 CLI，然后登录自己的 Expo 账号：

| 包管理器 | 安装命令 |
| --- | --- |
| npm | `npm install --global eas-cli` |
| Yarn | `yarn global add eas-cli` |
| pnpm | `pnpm add -g eas-cli` |
| Bun | `bun add -g eas-cli` |

```sh
eas login
```

### 新建 Expo 项目

官方当前页面列出以下创建命令；它们面向新项目，可能使用发布时的最新 Expo SDK：

| 包管理器 | 创建命令 |
| --- | --- |
| npm / npx | `npx create-expo-app@latest` |
| Yarn | `yarn create expo-app` |
| pnpm | `pnpm create expo-app` |
| Bun | `bun create expo` |

若继续已有项目，不要重复创建；先确认该项目的 Expo / React Native 版本，再接入后续 EAS 步骤。

新建项目使用 **CNG（Continuous Native Generation，持续原生工程生成）**时，`android/` 与 `ios/` 原生工程通常不作为手工维护源码提交；EAS Build 可以按配置生成构建所需的原生工程。这是一种项目管理方式，并不意味着最终安装包没有原生代码。

### 初始化 EAS 与连接 GitHub

在 Expo 项目根目录运行：

```sh
eas build:configure
```

该命令会生成 `eas.json` 并把本地项目关联到 EAS project。随后在 EAS Dashboard 的项目 GitHub 设置里安装 Expo GitHub App，授权目标 repository 并将它连接到项目。组织 repository 需要相应组织授权与权限。

## 从 GitHub Actions 迁移的认识

EAS Workflow 的文件目录 `.eas/workflows/` 类似 GitHub Actions 的 `.github/workflows/`，`on.push`、`on.pull_request` 等触发字段也很相似。关键差异是 EAS 提供预打包 job：例如 `type: build` 让 EAS 提供构建环境、执行原生编译并上传产物，因此无需像 GitHub Actions 一样写 `runs-on` 和自行配置环境的步骤。

EAS Workflows 可以与 GitHub Actions 并存；GitHub Actions job 也可用 EAS CLI 的 `eas workflow:run` 触发一个 EAS workflow。两种系统可以按项目现有 CI 分工。

## 关键名词

- **YAML：**用缩进组织配置数据的文本格式；缩进层级表达 job、参数和触发条件的包含关系。
- **Job：**工作流里的一个任务，例如 build 或测试。多个 job 默认可并行，依赖关系会决定执行顺序。
- **CNG：**用 app config / config plugin 等定义原生工程，再在需要时生成原生目录的 Expo 工作方式。
- **OTA（Over-the-Air）：**向兼容的已安装 App 无线分发 JS / 资源更新。
- **E2E（End-to-End）：**端到端测试，从用户操作路径检查完整应用行为；页面后续章节使用 Maestro。
- **EAS project：**Expo 账户下的云端项目实体，与本地源代码目录不是同一个概念，需要关联。

## 官方代码主题覆盖

源页代码 / 配置主题均有本页示例覆盖：`on.push` 触发的 Android development build YAML；npm / Yarn / pnpm / Bun 的 EAS CLI 安装命令；`eas login`；四种包管理器创建 Expo app 命令；`eas build:configure`。GitHub repository 关联和 App Store 凭据步骤属于 Dashboard UI / 操作说明，已用文字整理。项目没有因此执行这些命令。

## 下一页

官方 **Next** 是 [Run your first EAS Workflows job](https://docs.expo.dev/tutorial/cicd/first-workflow/)，动手创建 custom job、设置触发器、查看日志并让 job 之间传递输出。

**翻页：**[上一页：EAS Tutorial 后续学习路径](./032-EAS-Tutorial后续步骤.md) · [返回目录](./README.md) · [下一页：第一个 EAS Workflows Job](./034-运行首个EAS-Workflow.md)
