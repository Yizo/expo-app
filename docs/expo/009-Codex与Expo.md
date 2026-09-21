# 009｜Codex 与 Expo

**翻页：**[上一页：Claude Code 与 Expo](./008-Claude-Code与Expo.md) · [目录](./README.md) · [下一页：Cursor 与 Expo](./010-Cursor与Expo.md)

**官方页面：**[Codex and Expo](https://docs.expo.dev/agents/codex/)

> 此页是 Codex 使用说明，不是 SDK 专属 API 指南。当前项目 Expo 依赖为 `~56.0.11`，相关版本参考见 [SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/)。

## Codex 如何帮助 Expo 开发

Codex 是 OpenAI 的终端编程代理，可以读取和修改项目文件、运行终端命令并浏览网页。Expo 为新项目生成 `AGENTS.md`，Codex 会读取它，获取项目规则和与当前 SDK 匹配的文档入口；搭配 Expo Skills 与 MCP 后，还能查询 EAS / Expo CLI 信息并使用 Expo 最佳实践。

## 快速开始

### 1. 安装 Codex

Expo 页面给出的安装脚本命令：

```sh
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

### 2. 准备 Expo 项目

新项目可用以下包管理器命令之一；现有项目确认已安装与目标 SDK 匹配的 `expo` 包：

```sh
npx create-expo-app@latest
yarn create expo-app
pnpm create expo-app
bun create expo
```

### 3. 安装 Expo 插件

```sh
codex plugin add expo@openai-curated
codex mcp login expo
```

插件会安装 Expo Skills 并在 Codex 中注册 Expo MCP Server。登录命令会启动 Expo 账号授权流程。

### 4. 在项目根目录打开 Codex

```sh
cd my-app
codex
```

### 5. 验证项目上下文

在 Codex 会话中问它 Expo SDK 版本，并与 `package.json` 的 `expo` 依赖核对：

```text
打开 package.json，告诉我这个项目目标 Expo SDK 是哪个版本。
```

## Codex 如何读取项目规则

Codex 在项目中读取模板生成的根目录 `AGENTS.md`。该文件指向项目正在使用的 Expo SDK 对应文档，并承载项目级指令。团队共享同一份文件后，新会话可以从一致的项目背景开始。

## 可用的自然语言任务

| 目标 | 可以向代理描述 |
| --- | --- |
| 升级 SDK | 升级项目到目标 Expo SDK，处理破坏性改动。 |
| 增加导航 | 使用 Expo Router 添加 Tab 导航与设置页。 |
| 自动构建 | 创建每次 PR 构建应用的 EAS Workflow。 |
| 排查构建 | 检查最近 iOS EAS Build 失败日志并解释原因。 |
| 通知 | 设置 `expo-notifications` 并在启动时发本地通知。 |
| CI/CD | 创建每个 PR 都会执行的构建工作流。 |
| 原生 UI | 添加 SwiftUI Picker 组件。 |
| 查看反馈 | 读取应用的 TestFlight 反馈。 |
| 验证界面 | 截图并确认某个控件是否正确渲染。 |

## 关键名词

- **Codex CLI**：从终端启动、以当前目录作为项目工作区的 Codex 使用方式。
- **`AGENTS.md`**：Codex 可直接读取的项目指令文件；在 Expo 项目中也可指向 SDK 匹配文档。
- **Expo MCP Server**：向代理提供当前官方 Expo 文档和 EAS 数据的远程服务。

## 官方代码主题覆盖

本页源代码用途均已覆盖：Codex 安装脚本、四类包管理器创建项目、Expo 插件安装与 MCP 登录、切换到项目并启动 Codex、询问项目 SDK 版本。示例任务则按类别改写成中文提示词。

## 下一页

页脚 Next 指向 [Cursor and Expo](https://docs.expo.dev/agents/cursor/)。

**翻页：**[上一页：Claude Code 与 Expo](./008-Claude-Code与Expo.md) · [目录](./README.md) · [下一页：Cursor 与 Expo](./010-Cursor与Expo.md)
