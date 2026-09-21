# 008｜Claude Code 与 Expo

**翻页：**[上一页：Expo MCP Server](./007-Expo-MCP-Server.md) · [目录](./README.md) · [下一页：Codex 与 Expo](./009-Codex与Expo.md)

**官方页面：**[Claude Code and Expo](https://docs.expo.dev/agents/claude/)

> 此页是 Claude Code 工具配置指南，不是某个 SDK 专属 API 指南。本地项目 Expo 基线为 `~56.0.11`，版本化参照见 [SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/)。

## Claude Code 如何帮助 Expo 开发

Claude Code 是 Anthropic 提供的终端编程代理，可以读取项目文件、提议修改并运行开发命令。Expo 项目中的 `CLAUDE.md` 与 `.claude/settings.json` 让 Claude Code 获得项目规则、SDK 文档入口和 Expo 插件设置；Expo Skills 提供实践指引，Expo MCP Server 则提供当前 Expo 文档和 EAS 上下文。

## 快速开始

### 1. 安装 Claude Code

官方页面链接到 Claude Code 安装脚本，命令如下：

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

### 2. 准备 Expo 项目

新项目可由以下任一包管理器创建；已有项目则需要安装当前支持的 `expo` 包：

```sh
npx create-expo-app@latest
yarn create expo-app
pnpm create expo-app
bun create expo
```

项目模板会准备代理读取的项目上下文文件。

### 3. 安装 Expo 插件并登录

```sh
claude plugin install expo@claude-plugins-official
```

插件会同时安装 Expo Skills 并注册 Expo MCP Server。首次使用时，在 Claude Code 会话中输入 `/mcp`，按浏览器提示登录 Expo 账号。

### 4. 在项目目录里启动

```sh
cd my-app
claude
```

从项目根目录启动，可以让 Claude Code 读取根目录的项目说明文件。

### 5. 验证代理读取了 SDK 版本

在会话中提出简短问题，检查它是否能读到 `package.json`：

```text
打开 package.json，告诉我这个项目目标 Expo SDK 是哪个版本。
```

回答应和依赖中的 `expo` 版本相符。

## Claude Code 从哪里读取项目规则

- `CLAUDE.md` 通常只需包含 `@AGENTS.md`，用来把通用项目指令引入 Claude Code。
- Expo 建议把项目级规则和 SDK 文档指针放在 `AGENTS.md`，避免多份规则分叉。
- `.claude/settings.json` 可以为该项目启用官方 Expo 插件；用户在本机仍需安装该插件。
- 项目共享这些上下文文件后，团队成员的代理会从同一份项目规则开始工作。

## 可用的自然语言任务

| 目标 | 可以向代理描述 |
| --- | --- |
| 升级 SDK | 把项目升级到目标 Expo SDK，并修复升级导致的改动。 |
| 增加导航 | 用 Expo Router 添加 Tab 导航和设置页面。 |
| 自动构建 | 创建 PR 时触发的 EAS Workflow。 |
| 排查构建 | 读取最近 iOS 构建日志并指出失败原因。 |
| 通知 | 配置 `expo-notifications` 并在应用启动时展示本地通知。 |
| CI/CD | 为每个 PR 建立构建流程。 |
| 原生 UI | 在 Expo 页面中加入 SwiftUI Picker。 |
| 查看反馈 | 读取 TestFlight 用户反馈。 |
| 验证 UI | 对运行界面截图，并检查某个控件是否正确显示。 |

## 插件未安装时的处理

若项目设置启用了 Expo 插件，但当前开发者的 Claude Code 尚未安装插件，在终端安装并重启 Claude Code：

```sh
# 默认安装到当前用户可用的插件环境
claude plugin install expo@claude-plugins-official

# 也可只为当前项目安装
claude plugin install expo@claude-plugins-official --scope project
```

## 关键名词

- **终端代理**：在命令行项目目录启动的 AI 编程助手；它能够读取当前工作区并执行被授权的本地命令。
- **Expo 插件**：把 Expo Skills 与 MCP 服务注册到代理的集成包。
- **项目规则文件**：`AGENTS.md` 等仓库级说明文件，用来告诉代理当前 SDK、代码约定与限制。
- **MCP 登录**：授权 Claude Code 使用 Expo MCP Server，读取官方文档或项目的 EAS 信息。

## 官方代码主题覆盖

本页所有代码主题均有改写示例：安装 Claude Code、用四类包管理器创建 Expo 项目、安装 Expo 插件、在项目根启动代理、用 `package.json` 版本问题验证上下文，以及全局 / 项目级插件安装。

## 下一页

页脚 Next 指向 [Codex and Expo](https://docs.expo.dev/agents/codex/)。

**翻页：**[上一页：Expo MCP Server](./007-Expo-MCP-Server.md) · [目录](./README.md) · [下一页：Codex 与 Expo](./009-Codex与Expo.md)
