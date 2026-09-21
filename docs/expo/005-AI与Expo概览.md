# 005｜AI 编程代理与 Expo 概览

**翻页：**[上一页：后续步骤](./004-后续步骤.md) · [目录](./README.md) · [下一页：Expo Skills](./006-Expo-Skills.md)

**官方页面：**[AI agents and Expo overview](https://docs.expo.dev/agents/)

> 这是 Expo 官方当前未版本化的工具说明页，不是 SDK 专属页面。它不介绍某个原生 API；本目录的项目基线为 Expo `~56.0.11`，版本化参考见 [Expo SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/)。

## Expo 项目里的 AI 代理上下文

Claude Code、Codex、Cursor 等编程代理能帮助编写、升级、调试和发布 Expo 项目。为了减少代理猜错 SDK 版本或文件约定，Expo 项目可以同时提供机器可读的文档、可复用的技能，以及代理连接官方工具的通道。

Expo 官方页面把这套支持分成三部分：

| 组成 | 作用 | 面向 React 开发者的理解 |
| --- | --- | --- |
| Expo Skills | 向 AI 代理提供 Expo 的常见做法和任务指引。 | 类似给代码助手安装一套 Expo 专用的工作手册；安装一次后可服务多个项目。 |
| Expo MCP Server | 通过 Model Context Protocol 连接 Expo 远程服务，读取文档、EAS 构建记录、更新渠道和 TestFlight 元数据等。 | 给代理提供可查询的官方实时上下文，而不是只依赖模型训练时的知识。 |
| 项目上下文文件 | 在项目根目录声明当前 SDK 版本、项目规则和工具配置。 | 类似仓库级指令文件，让同一项目的成员和代理共享约定。 |

使用 `create-expo-app` 创建的新项目会预置 `AGENTS.md`、`CLAUDE.md` 和 `.claude/settings.json`。它们分别服务于不同代理的约定，并指向项目所用 SDK 的文档。已有项目也可以按官方说明补上这些文件。

## Claude Code 与 Codex 快速配置

官方提供的安装入口可安装 Expo Skills 并注册 Expo MCP Server：

```sh
# Claude Code
claude plugin install expo@claude-plugins-official
# 安装后在 Claude Code 中运行 /mcp 并登录 Expo 账号

# Codex
codex plugin add expo@openai-curated
codex mcp login expo
```

Cursor 和未提供 Expo 专属插件的代理，需要分别配置 Expo Skills 和 Expo MCP Server。只做普通界面开发时，这些属于可选的代理工具，不是 Expo 应用的运行前置条件。

## 项目指令文件做什么

| 文件 | 主要读取者 | 用途 |
| --- | --- | --- |
| `AGENTS.md` | Codex、Cursor；Claude Code 可经由 `CLAUDE.md` 引入 | 项目说明的主要来源，链接与 SDK 版本对应的 Expo 文档。 |
| `CLAUDE.md` | Claude Code | 可用 `@AGENTS.md` 导入通用项目指令。 |
| `.claude/settings.json` | Claude Code | 为打开项目的人启用 Claude Code 的 Expo 插件。 |

为已有项目下载官方模板中的 `AGENTS.md` 时，官方页面给出如下命令。若项目已经有自己的 `AGENTS.md`，应把相应内容合并进去，而不是覆盖掉现有约定：

```sh
curl -o AGENTS.md https://raw.githubusercontent.com/expo/expo/main/packages/create-expo/template/agent-files/AGENTS.md
```

Claude Code 的导入文件可以只有一行：

```sh
echo '@AGENTS.md' > CLAUDE.md
```

启用 Expo Claude Code 插件的项目设置示例：

```json
{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}
```

团队成员各自在自己的机器上安装代理插件后，可把项目上下文文件一起纳入项目管理；Claude Code 专属的后两项配置仅在使用 Claude Code 时需要。

## 验证代理是否读到项目

在项目目录中启动代理后，可以用一个只读问题确认它看到了 `package.json`：

```text
打开 package.json，告诉我这个项目使用哪个 Expo SDK 版本。
```

如果回答和 `package.json` 中的 `expo` 依赖版本一致，说明代理至少读到了当前项目的 SDK 信息。

## 可选：Agent Toolkit

Expo Skills 和 MCP 让代理了解项目与 Expo 服务；Agent Toolkit 则让代理能实际观察或操作运行中的应用。官方页面举例说明，第三方工具可以在模拟器、仿真器或真机上点击流程、查看日志、检查 React 组件树以及分析性能。

官方列出的示例包括 agent-device 与 Argent。这些是可选的测试 / 调试辅助工具，不是构建基础 Expo 应用的必选依赖。

## 关键名词

- **AI coding agent / AI 编程代理**：能在项目文件中读取、修改代码并调用开发工具的编程助手。
- **MCP（Model Context Protocol）**：一种让 AI 客户端连接外部工具或数据服务的协议。此处 Expo MCP Server 提供 Expo 文档、EAS 和发布信息的上下文。
- **项目上下文**：代理启动后读取的仓库说明、SDK 版本和约束；它能帮助代理在当前项目范围内给出正确做法。
- **Agent Toolkit**：将模拟器控制、日志读取、界面检查等操作能力暴露给代理的工具集。

## 官方代码主题覆盖

本页源文的代码主题均已覆盖：Claude Code / Codex 插件安装与 MCP 登录、下载官方 `AGENTS.md`、`CLAUDE.md` 导入语句、Claude Code 插件 JSON 配置、代理验证提示词。Agent Toolkit 部分在源页以链接卡片介绍，没有需要抄录的代码。

## 下一页

页脚 Next 指向 [Expo Skills](https://docs.expo.dev/skills/)。

**翻页：**[上一页：后续步骤](./004-后续步骤.md) · [目录](./README.md) · [下一页：Expo Skills](./006-Expo-Skills.md)
