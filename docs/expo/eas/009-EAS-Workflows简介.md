# 009｜EAS Workflows 简介

**翻页：**[上一页：EAS 环境变量 FAQ](./008-EAS环境变量FAQ.md) · [目录](./README.md) · [下一页：EAS Workflows 入门](./010-EAS-Workflows入门.md)

**官方页面：**[Introduction to EAS Workflows](https://docs.expo.dev/eas/workflows/introduction/)

## EAS Workflows 做什么

EAS Workflows 是面向 React Native / Expo 项目的 CI/CD 云服务，可自动构建 Android / iOS、发布 OTA update、上传商店、执行 Maestro 端到端测试和部署 Expo Web。它提供为 app 开发准备的托管 macOS / Linux workers 与现成 job 类型。

Workflow 文件是 YAML，放在项目根目录 `.eas/workflows/`。一个文件有 workflow 名、可选触发器和一个或多个 jobs：

```yaml
name: Preview build

on:
  pull_request:

jobs:
  preview:
    type: build
    params:
      platform: ios
      profile: preview
```

## 创建和运行

用 EAS CLI 创建工作流样板：

```sh
eas workflow:create
```

有 GitHub 连接时可以监听 push / pull request / label / branch / tag 等事件，也可用 cron、App Store Connect 事件触发。没有 GitHub 触发器也可手动运行：

```sh
eas workflow:run .eas/workflows/preview.yml
```

## Jobs、并行与依赖

EAS 提供 build、submit、update、Maestro 等预制 jobs；custom jobs 可运行命令和内置 workflow functions。默认没有依赖关系的 jobs 并行执行：

- `needs`：等待所列 job 成功完成后才开始。
- `after`：等待 job 结束，无论前置成功还是失败。

项目与 EAS 项目建立关联后，Build、Update、Submit 和 Workflow 运行结果、日志、产物可在 Expo Dashboard 汇总查看。项目需已能正常使用 EAS Build。

## 环境和执行机器

EAS Workflows 使用 Expo 托管基础设施，Linux worker 用于 Android build / 通用任务，支持 nested virtualization 的 Linux worker 可运行 Android Emulator；iOS Build / Simulator 需 macOS worker。资源规格、容量和计划限制可能调整，以当前官方页面为准。

Workflow 可以直接使用 EAS environment variables 和 YAML 内联 `env`，表达式形式为 `${{ env.VARIABLE_NAME }}`。公开客户端值与 server secrets 仍按上一组环境变量规则处理。

## 与通用 CI 的取舍

Workflows 对手机 app 常见的构建、提交、update 和测试提供预装 jobs，减少自建机器和脚本；需要 Docker、自定义 runner 或特殊外部服务的复杂流水线，通用 CI 可能更灵活。Workflow 限制页当前指出没有共享 workflow 配置，也没有 matrix builds。

## 关键名词

- **CI/CD**：持续集成 / 持续交付，自动检查、构建和发布。
- **Job**：工作流中的一项任务，运行在云端 worker。
- **Trigger**：何时启动 workflow，例如 PR 或定时计划。
- **Maestro**：Expo 文档提及的端到端 UI 测试 job；适合验证用户流程。
- **Managed worker**：由 EAS 提供和维护的构建 / 测试机器。

## 官方代码主题覆盖

源页代码片段是 `eas workflow:create` 命令；本文已覆盖它，并添加等价的 YAML 结构示意和 `eas workflow:run` 手动运行示例来帮助理解文中流程。源页没有长 workflow YAML 样例。

## 下一页

页脚 **Next** 指向 [Get started with EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/)，从先决条件与第一条工作流开始实践。

**翻页：**[上一页：EAS 环境变量 FAQ](./008-EAS环境变量FAQ.md) · [返回目录](./README.md) · [下一页：EAS Workflows 入门](./010-EAS-Workflows入门.md)
