# 010｜Cursor 与 Expo

**翻页：**[上一页：Codex 与 Expo](./009-Codex与Expo.md) · [目录](./README.md) · [下一页：agent-device 与 Expo](./011-agent-device与Expo.md)

**官方页面：**[Cursor and Expo](https://docs.expo.dev/agents/cursor/)

> 此页是 Cursor 使用说明，不是 SDK 专属 API 指南。当前项目 Expo 依赖为 `~56.0.11`；需要查询版本差异时请对应 [SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)。

## Cursor 如何帮助 Expo 开发

Cursor 是基于 VS Code 的 AI 编辑器，可跨文件修改、运行终端命令并通过 Agent 执行开发任务。Expo 项目里的 `AGENTS.md` 向 Cursor 提供项目约定、SDK 文档入口和本项目规则；连接 Expo MCP Server、安装 Expo Skills 后，还能获得当前 Expo / EAS 上下文。

## 快速开始

1. 从 Cursor 官方渠道安装编辑器。
2. 新项目用 `create-expo-app` 创建，或确认已有项目安装了目标 SDK 支持的 `expo` 依赖：

   ```sh
   npx create-expo-app@latest
   yarn create expo-app
   pnpm create expo-app
   bun create expo
   ```

3. 按[Expo Skills](https://docs.expo.dev/skills/)和[Expo MCP Server](https://docs.expo.dev/mcp/)页面分别安装技能、连接远程服务。
4. 在 Cursor 中打开项目，并在 Agent 面板用自然语言描述任务。
5. 检查 Agent 是否能读取项目 SDK：

   ```text
   打开 package.json，告诉我这个项目目标 Expo SDK 是哪个版本。
   ```

## Cursor 读取哪些规则

Cursor 会读取项目根目录和子目录中的 `AGENTS.md`。根文件可指向当前 Expo SDK 的官方文档并承载项目通用指令；更具体的子目录指令可限制局部代码任务。Cursor 也支持在 `.cursor/rules/` 放置 Cursor 专用规则。

## 示例任务

| 目标 | 可以向 Agent 描述 |
| --- | --- |
| 升级 SDK | 升级到目标 Expo SDK，并修复升级导致的改动。 |
| 增加导航 | 添加 Expo Router 标签导航和设置页。 |
| 自动构建 | 创建每个 PR 自动构建的 EAS Workflow。 |
| 排查构建 | 读取最近失败的 iOS EAS 构建日志并分析原因。 |
| 通知 | 配置 `expo-notifications` 并展示本地通知。 |
| CI/CD | 创建 PR 构建工作流。 |
| 原生 UI | 在 Expo 应用中加入 SwiftUI Picker。 |
| 查看反馈 | 查看 TestFlight 用户反馈。 |
| 验证 UI | 截图确认指定界面或控件。 |

## 关键名词

- **Agent 面板**：Cursor 内与编程代理交互的工作区。
- **嵌套 `AGENTS.md`**：对子目录额外约束的项目说明；Cursor 会按文件所在层级读取。
- **`.cursor/rules/`**：Cursor 专用规则目录，与通用 `AGENTS.md` 并存。

## 官方代码主题覆盖

本页有一个代码主题，即新项目初始化命令，npm / Yarn / pnpm / Bun 写法都已列出。SDK 核对提示词也已给出；安装 Cursor、配置 Expo Skills / MCP 与打开 Agent 面板在源页通过文字和链接说明，没有额外命令代码。

## 下一页

页脚 Next 指向 [agent-device and Expo](https://docs.expo.dev/agents/agent-device/)。

**翻页：**[上一页：Codex 与 Expo](./009-Codex与Expo.md) · [目录](./README.md) · [下一页：agent-device 与 Expo](./011-agent-device与Expo.md)
