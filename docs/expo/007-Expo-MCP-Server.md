# 007｜Expo MCP Server

**翻页：**[上一页：Expo Skills](./006-Expo-Skills.md) · [目录](./README.md) · [下一页：Claude Code 与 Expo](./008-Claude-Code与Expo.md)

**官方页面：**[Using Model Context Protocol (MCP) with Expo](https://docs.expo.dev/mcp/)

> 这是当前 Expo 文档中的集成说明页。它所说的本地能力支持 SDK 54 及以上，因此本地项目 SDK 56 落在该范围内。若你使用其它 SDK 或工具版本，安装方式和可用工具应以对应版本文档为准。

## MCP 是什么

**Model Context Protocol（MCP）**是一种让 AI 工具连接外部数据和操作工具的协议。Expo MCP Server 是 Expo 托管的远程 MCP 服务，可让兼容的 AI 助手查询 Expo 官方文档、安装匹配 SDK 的依赖、查看 EAS 构建与工作流信息，以及读取 TestFlight 反馈等。

远程连接后，代理可以按需读取官方指南、建议使用 `npx expo install` 添加兼容依赖，并协助分析构建失败或工作流。连接本地开发服务器后，还可以增加截图、点击界面、打开 React Native DevTools 等能力。

## 前置条件与连接参数

官方页面列出三项前置条件：

1. Expo 账号。
2. Expo 项目，且使用当前文档要求的最新 SDK 版本。
3. 支持远程 MCP Server 的 AI 工具，例如 Claude、Claude Code、Cursor 或 VS Code。

通用连接信息：

| 设置项 | 值 |
| --- | --- |
| Server type | Streamable HTTP |
| URL | `https://mcp.expo.dev/mcp` |
| Authentication | OAuth；按提示用浏览器登录 Expo 账号 |

Claude 网页、桌面和移动端可以通过 Claude Connectors 连接，不需要在本机安装 MCP 客户端。Claude Code、Cursor、VS Code 与 Codex 的安装入口不同，但都使用上述远程地址。

## 配置 MCP 客户端

### Claude Code

如果已通过官方 Expo 插件配置，它会自动注册 Expo MCP Server；在会话中运行 `/mcp` 登录即可。独立配置的命令如下：

```sh
claude mcp add --transport http expo https://mcp.expo.dev/mcp
```

### Cursor

打开 Command Palette（macOS 为 `Cmd + Shift + P`，Windows/Linux 为 `Ctrl + Shift + P`），执行 **MCP: Add Server**，选择 HTTP，再填入 URL `https://mcp.expo.dev/mcp`、名称 `expo`。

### Codex

如果 Expo 插件已注册服务，直接运行登录命令即可。否则可显式添加服务再登录：

```sh
codex mcp add expo --url https://mcp.expo.dev/mcp
codex mcp login expo
```

认证流程会打开浏览器登录 Expo，并自动生成访问令牌。

## 开启本地开发能力

仅连接远程服务就能使用 Expo 文档和 EAS 数据工具。如果还要让代理截图当前模拟器、点击屏幕或打开本地 DevTools，需要启用项目本地能力。

官方页面说明本地能力从 SDK 54 开始支持。进入项目目录，将 `expo-mcp` 作为开发依赖安装；用相同 Expo 账号登录 CLI；再通过环境变量启动 Expo 开发服务器：

| 包管理器 | 安装本地能力 | 检查 / 登录 Expo CLI | 启动带 MCP 本地能力的开发服务器 |
| --- | --- | --- | --- |
| npm / npx | `npx expo install expo-mcp --dev` | `npx expo whoami \|\| npx expo login` | `EXPO_UNSTABLE_MCP_SERVER=1 npx expo start` |
| Yarn | `yarn expo install expo-mcp --dev` | `yarn expo whoami \|\| yarn expo login` | `EXPO_UNSTABLE_MCP_SERVER=1 yarn expo start` |
| pnpm | `pnpm expo install expo-mcp --dev` | `pnpm expo whoami \|\| pnpm expo login` | `EXPO_UNSTABLE_MCP_SERVER=1 pnpm expo start` |
| Bun | `bun expo install expo-mcp --dev` | `bun expo whoami \|\| bun expo login` | `EXPO_UNSTABLE_MCP_SERVER=1 bun expo start` |

```sh
# 进入实际项目目录后，任选表格中与你的包管理器对应的一组命令
cd /path/to/your-project
```

启动或停止开发服务器后，重新连接或重启 AI 工具里的 MCP 会话，确保客户端拿到最新的本地能力列表。

## 远程与本地能力

### 远程服务能力

远程连接不依赖本机开发服务器，主要使用 Expo / EAS 云端数据：

| 类别 | 工具（按官方工具名） | 能做什么 |
| --- | --- | --- |
| 依赖和文档 | `add_library`、`read_documentation`、`search_documentation`、`learn` | 安装 Expo 库、读取单页文档、搜索官方文档、学习指定主题。文档搜索在页面中标注为需要 EAS 付费方案。 |
| EAS 工作流 | `workflow_create`、`workflow_info`、`workflow_list`、`workflow_logs`、`workflow_run`、`workflow_cancel`、`workflow_validate` | 创建 / 校验工作流，查看运行列表、状态和日志，启动或取消运行。 |
| EAS 构建 | `build_list`、`build_info`、`build_logs`、`build_submit`、`build_run`、`build_cancel` | 列出、查看和分析构建；启动或取消构建；将可提交的完成构建上传至对应应用商店。 |
| 测试与反馈 | `testflight_crashes`、`testflight_feedback` | 查询 TestFlight 崩溃信息和用户截图反馈。 |
| App Store | `appstore_reviews`、`appstore_reply_review`、`appstore_delete_review_response` | 读取公开评价；发布、替换或删除公开开发者回复。 |
| Google Play | `playstore_crashes`、`playstore_reviews`、`playstore_reply_review` | 查询 Android 崩溃 / ANR 和商店评价；发布或替换公开回复。 |

有些商店工具会直接改变公开内容：例如发布商店回复，或删除既有回复。因此应先检查拟提交内容及目标评价，再使用这类写入工具。

### 本地开发能力

本地能力连接当前运行的 Expo 开发服务器和模拟器：

| 工具 | 用途 |
| --- | --- |
| `expo_router_sitemap` | 列出 Expo Router 项目的所有路由；需要安装 `expo-router`。 |
| `open_devtools` | 打开 React Native DevTools，调试 JS、查看组件树和控制台；需要 Metro 正在运行。 |
| `collect_app_logs` | 收集短时间窗口内的 Android logcat、iOS 系统日志和 / 或 JS 控制台输出。 |
| `automation_tap` | 按坐标或 `testID` 点击当前运行的应用；官方建议优先用稳定的 `testID`。 |
| `automation_take_screenshot` | 截取整个屏幕或某个 `testID` 对应的视图。 |
| `automation_find_view` | 按 `testID` 查询视图的位置、尺寸和可见状态。 |

AI 工具如果支持 MCP prompts，还可能提供 `expo_router_sitemap` 提示项。

## 当前限制

官方页面注明，MCP 本地能力一次只支持一个开发服务器连接；iOS 本地能力目前限模拟器，且只支持 macOS 主机。

## 数据流与隐私

Expo 表示发送到 Expo MCP Server 的数据不会被 Expo 用来训练 AI 模型；Expo MCP Server 本身也不运行生成式 AI。它向接入的 AI 工具提供工具和提示，实际模型由 Claude、Cursor、VS Code 等客户端或模型服务商提供。

远程工具调用时，MCP 服务会读取完成请求所需的 Expo 账号 / 项目信息（例如构建、工作流、文档或 TestFlight 数据），再将结果返回 MCP 客户端。使用本地能力时，本机数据会经由 Expo MCP Server 中转。例如模拟器截图由本地开发服务器获取，送到 Expo MCP Server，再返回 AI 客户端。

因此需要分别查看 Expo、AI 客户端和模型提供方的数据留存与训练策略。若项目处理受监管或敏感数据，应在启用截图、日志等本地能力前理解这条数据路径。

## 关键名词

- **远程能力**：由 Expo 托管的服务完成，不要求本地 Expo 开发服务器运行。
- **本地能力**：通过项目开发服务器读取本机正在运行的模拟器、Metro 和路由结构。
- **OAuth**：通过浏览器登录授权的机制；页面说明认证令牌由 MCP 服务自动生成。
- **`testID`**：React Native 组件的自动化标识。相较固定屏幕坐标，它通常更能适应布局调整。
- **Metro**：Expo 开发服务器使用的 JavaScript 打包服务。本地调试工具需要连接运行中的 Metro。

## 官方代码主题覆盖

本页代码示例按主题覆盖：Claude Code 与 Codex 远程服务配置、Cursor 的 HTTP 参数、npm/Yarn/pnpm/Bun 四组本地能力安装 / 登录 / 启动命令、项目目录切换。工具名清单涵盖源页列出的远程与本地 MCP 工具；隐私和单机限制也已单独说明。

## 下一页

页脚 Next 指向 [Claude Code and Expo](https://docs.expo.dev/agents/claude/)。

**翻页：**[上一页：Expo Skills](./006-Expo-Skills.md) · [目录](./README.md) · [下一页：Claude Code 与 Expo](./008-Claude-Code与Expo.md)
