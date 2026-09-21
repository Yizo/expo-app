# 006｜给 AI 代理使用的 Expo Skills

**翻页：**[上一页：AI 与 Expo 概览](./005-AI与Expo概览.md) · [目录](./README.md) · [下一页：Expo MCP Server](./007-Expo-MCP-Server.md)

**官方页面：**[Expo Skills for AI agents](https://docs.expo.dev/skills/)

> 本页列举的是 Expo 当前提供的代理技能，不带 SDK 版本号，可能随 Expo 更新而变化。它们不是应用运行时库；具体 API 仍要遵循项目使用的 SDK。本地项目 Expo 基线为 `~56.0.11`，参考 [SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/)。

## Expo Skills 是什么

Expo Skills 是给 AI 编程代理读取的结构化指令文件，告诉代理如何按 Expo / React Native 的惯例开发、部署和调试。可以把它理解为“给代码助手的专题手册”。它不会直接变成 app 的 JavaScript 依赖，也不等于给项目安装某个 UI 库。

Claude Code、Codex、Cursor 等代理可以使用这些技能。Claude Code 和 Codex 的 Expo 插件也会注册 Expo MCP Server；如果单独使用 Skills CLI，则只安装技能，需要把 MCP 服务另行配置。

## 安装方法

### Claude Code

在命令行安装官方 Expo 插件，也可以在 Claude Code 的交互会话内输入对应插件命令：

```sh
claude plugin install expo@claude-plugins-official
```

```text
/plugin install expo@claude-plugins-official
```

### Codex

```sh
codex plugin add expo@openai-curated
```

也可以在 Codex 的 `/plugins` 界面中，从 `openai-curated` 市场选择 `expo`。

### Cursor 与其它兼容代理

已在 Claude Code 或 Codex 安装的 Skills，较新版本 Cursor 可以自动导入。Cursor 设置中需允许导入第三方插件和技能（默认开启），再到 Settings → Rules, Skills, Subagents → Skills 确认技能列表。

如果没有可自动导入的技能，可用 Skills CLI 安装。Cursor 与其它兼容代理的命令相同：

```sh
npx skills add expo/skills
yarn dlx skills add expo/skills
pnpm dlx skills add expo/skills
bunx skills add expo/skills
```

Skills CLI 只装 Expo Skills；它不会像 Claude Code / Codex 插件一样自动注册 Expo MCP Server。

## 技能目录

页面按技能目标区分 Expo 开源框架（`expo-*`）与 Expo Application Services（`eas-*`）。下表是官方页面技能的中文用途速查：

### Expo 框架与 SDK

| 技能 | 适用任务 |
| --- | --- |
| `expo-animation` | Reanimated、手势、转场、按压反馈和触觉反馈等动效。 |
| `expo-app-clip` | 增加 iOS App Clip，并处理轻量入口、AASA、关联链接等配置。 |
| `expo-brownfield` | 把 Expo / React Native 页面嵌入现有 SwiftUI/UIKit 或 Android 原生应用。 |
| `expo-data-fetching` | 网络请求、React Query / SWR、缓存、离线和 Expo Router 数据加载。 |
| `expo-design-system` | 设计 Token、主题、复用组件约定，以及全应用样式一致性检查。 |
| `expo-dev-client` | 构建和分发带开发工具的自定义 Expo 客户端。 |
| `expo-dom` | 在原生应用里用 DOM / WebView 运行 Web 组件或 Web 库。 |
| `expo-examples` | 查找 Expo 官方集成示例，如地图、支付、数据库、动画等。 |
| `expo-module` | 用 Swift / Kotlin 等创建 Expo 原生模块和原生视图。 |
| `expo-native-ui` | 编写符合 iOS / Android 风格的原生界面、系统控件、图标和视觉效果。 |
| `expo-overview` | Expo / EAS 任务的入口技能：识别 SDK、读取版本文档，再选择细分工作流。 |
| `expo-project-structure` | 新 Expo Router 项目的目录职责和文件放置规则；只用于新项目规划。 |
| `expo-router` | 文件路由、Stack、Tabs、链接、弹窗、导航等路由主题。 |
| `expo-skill-feedback` | 在明确要提交反馈时，提供反馈渠道与匿名使用统计设置流程。 |
| `expo-ui` | 通过 `@expo/ui` 使用 SwiftUI / Jetpack Compose 原生控件。 |
| `expo-upgrade` | 升级 Expo SDK 和处理相应依赖兼容问题。 |
| `expo-web-to-native` | 将 Web React 应用或页面逐步迁移 / 复用到原生 Expo 应用。 |
| `expo-tailwind-setup` | 示例提示中用于在 Expo 项目配置 Tailwind CSS / NativeWind。 |

### EAS 服务

| 技能 | 适用任务 |
| --- | --- |
| `eas-app-stores` | EAS Build、签名、版本号、TestFlight 与 App Store / Google Play 提交。 |
| `eas-hosting` | 发布 Expo Web 应用、Expo Router API Routes、预览环境和域名。 |
| `eas-observe` | 采集并分析启动、路由、交互时间等线上性能指标。 |
| `eas-simulator` | 在 EAS 云端远程运行和操作 iOS / Android 模拟器。 |
| `eas-update` | 配置、发布和调试与当前原生版本兼容的 OTA 更新。 |
| `eas-update-insights` | 查看 OTA 更新采用率、崩溃、安装量、包体大小等健康指标。 |
| `eas-workflows` | 编写 EAS Workflows，自动构建、测试或发布应用。 |

## 用自然语言选择技能

官方页面给出如下提示词与技能对应关系，可用来判断应查哪类知识：

| 需求表达 | 相关技能 |
| --- | --- |
| 做一页原生风格的设置界面 | `expo-native-ui` |
| 增加标签导航和弹窗 | `expo-router` |
| 在 Expo 项目配置 Tailwind | `expo-tailwind-setup` |
| 在原生应用里用 Web 图表代码 | `expo-dom` |
| 添加 SwiftUI Picker 或 Compose Material 3 控件 | `expo-ui` |
| 发布到 Apple App Store | `eas-app-stores` |
| 每次 PR 自动构建 | `eas-workflows` |
| 升级 Expo SDK | `expo-upgrade` |

## 关键名词

- **技能（Skill）**：给代理使用的任务指引与操作习惯，不是 npm 运行时模块。
- **Skills CLI**：独立安装技能的命令行工具；它安装指令文件，但不自动配置 Expo MCP Server。
- **Expo 插件**：面向特定代理的集成包，可以一次安装技能并注册 MCP 服务。安装入口因 Claude Code、Codex、Cursor 而异。
- **EAS**：Expo 提供的云端服务集合。`expo-*` 多数对应开源框架开发，`eas-*` 则聚焦云端构建、更新、托管或监控。

## 官方代码主题覆盖

本页源文中各类安装命令均有示例：Claude Code 插件（CLI 和会话命令）、Codex 插件（CLI 与 UI 入口说明）、Skills CLI（npx、Yarn、pnpm、Bun），以及 Cursor 自动导入配置检查。技能用途列表和示例提示词已按主题改写为上方两张表。

## 下一页

页脚 Next 指向 [Expo MCP Server](https://docs.expo.dev/mcp/)。

**翻页：**[上一页：AI 与 Expo 概览](./005-AI与Expo概览.md) · [目录](./README.md) · [下一页：Expo MCP Server](./007-Expo-MCP-Server.md)
