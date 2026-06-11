# 配置 Expo AI 开发工具

> 原文标题：Set up your tools  
> 文档更新时间：2026 年 6 月 10 日

## 文档解决的问题

本章帮助你从零搭建一套由 AI 编码代理驱动的 Expo 开发环境，包括：

1. 安装 Node.js，运行 Expo 开发工具。
2. 安装能够编辑文件、执行命令的 AI 编码代理。
3. 安装 Expo Go，在实体手机上预览应用。
4. 安装 Expo Skills，为 AI 代理补充 Expo 开发规范。
5. 连接 Expo MCP Server，让代理访问 Expo 工具和最新文档。
6. 验证 AI 代理能否正常调用 Expo MCP Server。

这是整个教程中配置内容最多、耗时最长的一章，预计约需 20 分钟。完成后，后续章节将进入应用创建与开发流程。

## 适用场景与前置条件

### 适用场景

本文适合以下情况：

- 第一次接触 Expo 或 React Native。
- 希望使用 AI 编码代理创建 Expo 应用。
- 希望直接在 Android 或 iOS 实体手机上查看开发效果。
- 当前尚未安装 Node.js、Expo Go 或相关 AI 工具。

如果已经使用满足要求的 AI 编码代理，可以跳过代理安装步骤，但仍需完成 Expo Skills、MCP Server 和手机端环境的配置。

### 前置条件

你需要准备：

- 一台运行 macOS、Windows 或 Linux 的电脑。
- 一台 Android 或 iOS 手机。
- 手机和电脑连接到同一个 Wi-Fi 网络。
- 大约 20 分钟。

> 文档明确要求手机与电脑位于同一 Wi-Fi 网络，但本章没有进一步解释网络发现机制或不同网络下的替代连接方式。

## 开始前需要理解的概念

### Expo

Expo 是围绕 React Native 提供的一套开发工具和服务。本章不讲解 Expo 应用代码，而是先配置创建、运行和预览应用所需的环境。

对于 React Web 开发者，可以暂时将 Expo 理解为 React Native 开发中的工具平台，但它不仅是类似 Vite 的构建工具，还涉及手机端预览、原生能力、云端服务和项目管理。

### AI 编码代理

AI 编码代理不只是网页聊天工具。本文要求它至少能够：

- 读取和编辑电脑上的项目文件。
- 在本机执行终端命令。

教程以 Claude Code 为具体示例，但明确说明其他满足上述条件的代理也可以使用。

### Expo Go

Expo Go 是安装在 Android 或 iOS 手机上的免费应用，用来在开发过程中运行和查看 Expo 项目。

它的主要价值是：

- 不需要先发布到应用商店。
- 开发代码发生变化后，手机上的应用通常会在数秒内更新。
- 初学者可以暂时不配置完整的 iOS 或 Android 原生工程。

它并不是浏览器中的开发服务器页面，而是真正在手机环境中运行项目。本文没有介绍 Expo Go 支持范围之外的原生模块或自定义原生代码限制。

### Expo Skills

Expo Skills 是提供给 AI 代理的指令文件，用于告诉代理：

- 应该使用哪些库。
- 应该如何组织应用页面。
- 如何避免常见 Expo 开发错误。

它们不会替代 Node.js、Expo Go 或项目依赖，而是改善 AI 代理生成和修改 Expo 代码时的决策质量。

### Expo MCP Server

MCP Server 是 AI 代理与外部工具之间的连接层。Expo MCP Server 可以让代理直接使用 Expo 提供的能力，例如：

- 查询最新的 Expo 文档。
- 安装合适的软件包。
- 检查当前 Expo 项目。

Expo Skills 与 Expo MCP Server 的职责不同：

| 工具 | 主要作用 |
| --- | --- |
| Expo Skills | 给代理提供 Expo 开发规则和指导 |
| Expo MCP Server | 让代理实际调用 Expo 文档及项目工具 |

## 配置流程

### 1. 打开终端

终端是本教程中与 AI 代理交互、执行开发命令的主要工具。

- macOS：打开系统自带的 **Terminal**。
- Windows：从开始菜单打开 **PowerShell**。
- Linux：使用系统中的终端程序。

本章提供的命令可以直接复制到终端执行。

如果使用 Cursor，教程中的大部分 AI 操作会在其图形化编辑器中完成，但仍然需要终端来运行应用。

> React Web 开发者可以把这一步类比为打开终端运行 `npm install` 和 `npm run dev`，只是后续还会在终端中直接启动 AI 编码代理。

### 2. 安装 Node.js

Node.js 是 Expo 开发工具的运行时。下载并安装 Node.js 的 **LTS（长期支持）版本**，安装时接受默认选项即可。

安装完成后执行：

```sh
node --version
```

该命令用于检查系统能否找到 Node.js。正常情况下会输出版本号。

如果没有输出版本号，说明 Node.js 安装或终端环境尚未正确生效。原文没有提供进一步的故障排查步骤。

> Node.js 在这里主要用于运行 Expo 和 npm 相关工具，并不意味着 React Native 应用本身会在手机上的 Node.js 环境中运行。

### 3. 安装 AI 编码代理

如果已经有能够编辑文件和执行本机命令的 AI 编码代理，可以跳过安装，但后续需要根据所选代理使用相应的 Skills 和 MCP 配置方式。

本文以 Claude Code 为例：

```sh
npm install -g @anthropic-ai/claude-code
```

参数含义：

- `npm install`：通过 npm 安装软件包。
- `-g`：全局安装，使 `claude` 命令可以在不同目录中使用。
- `@anthropic-ai/claude-code`：Claude Code 的 npm 包名。

安装后运行：

```sh
claude
```

然后按照界面提示登录。

> 文档只给出了 Claude Code 的具体安装和配置命令。虽然明确表示其他代理也可以使用，但其他代理的安装、Skills 配置和 MCP 配置命令需要参考对应说明，当前文档未展开。

### 4. 安装 Expo Go 并创建 Expo 账户

按以下顺序操作：

1. 在手机上从 Google Play Store 或 Apple App Store 安装 Expo Go。
2. 在电脑上注册一个免费的 Expo 账户。
3. 在手机上打开 Expo Go。
4. 使用刚才创建的同一个 Expo 账户登录。

同一账户会用于后续 Expo Go 和 Expo MCP Server 的身份认证。

> 代码更新后，Expo Go 中的应用通常会在数秒内刷新。这类似 React Web 的快速刷新体验，但更新目标是手机上的原生应用运行环境，而不是浏览器页面。

### 5. 安装 Expo Skills

先启动 Claude Code：

```sh
claude
```

然后在 Claude Code 内部执行：

```sh
/plugin install expo@claude-plugins-official
```

需要区分两个命令环境：

- `claude` 在系统终端中执行。
- `/plugin install ...` 在已经启动的 Claude Code 会话中执行。

安装 Expo Skills 是本文重点强调的步骤。原文将其描述为提升代理生成结果质量最重要的单项配置。

### 6. 连接 Expo MCP Server

在系统终端中执行：

```sh
claude mcp add --transport http expo https://mcp.expo.dev/mcp
```

各部分作用如下：

| 内容 | 作用 |
| --- | --- |
| `claude mcp add` | 向 Claude Code 添加一个 MCP Server |
| `--transport http` | 使用 HTTP 作为通信方式 |
| `expo` | 为该 MCP 连接指定名称 |
| `https://mcp.expo.dev/mcp` | Expo MCP Server 地址 |

添加完成后：

1. 启动 Claude Code。
2. 在 Claude Code 内执行 `/mcp`。
3. 使用之前创建的 Expo 账户完成登录。

如果没有完成认证，代理可能无法调用 Expo MCP 工具。

### 7. 可选：让代理查看并操作应用

Expo MCP Server 还提供本地能力。完成额外配置后，支持多模态能力的代理可以：

- 截取模拟器中的应用画面。
- 点击应用按钮。
- 自动验证自己的修改。

这项能力有以下条件：

- 需要在电脑上安装并运行模拟器。
- iOS 模拟器仅能在 macOS 上使用。
- 相关配置超出本教程范围。

因此，后续章节默认由开发者本人在实体手机上检查应用，而不是让 AI 代理自动操作模拟器。

当前文档未涉及：

- Android 模拟器的安装方式。
- iOS 模拟器和 Xcode 的配置方式。
- 本地 MCP 能力的具体启用命令。
- AI 自动化测试应用界面的完整流程。

### 8. 测试 MCP 配置

将下面的提示词发送给 AI 代理：

```text
Use the Expo MCP server to search the Expo documentation for "expo-image-picker" and tell me in one sentence what it does.
```

这项测试不是让代理凭已有知识回答，而是要求它明确调用 Expo MCP Server 查询文档。

正常结果应包括：

- 代理调用 Expo 文档工具。
- 代理用一句话说明 `expo-image-picker` 可用于从设备照片库选择图片。

如果出现连接或认证错误，需要重新执行上一阶段的 MCP 登录流程。

## 配置完成后的工具关系

最终环境包含四个主要部分：

| 组成部分 | 运行位置 | 作用 |
| --- | --- | --- |
| Node.js | 电脑 | 运行 Expo 和 npm 开发工具 |
| AI 编码代理 | 电脑 | 编辑代码并执行命令 |
| Expo Skills | AI 代理内部 | 指导代理遵循 Expo 开发方式 |
| Expo MCP Server | 代理连接的 Expo 服务 | 提供文档查询、包安装和项目检查能力 |
| Expo Go | 手机 | 在实体设备上运行和查看应用 |

典型工作过程是：

1. 你向 AI 代理描述开发需求。
2. AI 代理参考 Expo Skills 决定实现方式。
3. 必要时，代理通过 Expo MCP Server 查询文档或处理项目。
4. 代理修改电脑上的项目文件。
5. Expo 开发工具将变更提供给手机。
6. 你在 Expo Go 中检查结果。

其中第 4 步之后的完整项目运行命令和连接流程将在下一章介绍，本章尚未创建应用。

## 注意事项与容易踩坑的地方

### 区分终端命令和代理内部命令

以下命令在系统终端中执行：

```sh
node --version
npm install -g @anthropic-ai/claude-code
claude
claude mcp add --transport http expo https://mcp.expo.dev/mcp
```

以下命令在 Claude Code 会话内部执行：

```text
/plugin install expo@claude-plugins-official
/mcp
```

把 `/plugin` 或 `/mcp` 直接输入 PowerShell、Terminal 或普通 Shell，通常不会产生文档预期的效果。

### Skills 和 MCP 缺一不可替代

安装 Expo Skills 不等于连接了 Expo MCP Server：

- Skills 负责告诉代理“应该怎样做”。
- MCP Server 负责让代理“可以调用哪些 Expo 工具”。

MCP 测试失败时，应优先检查 MCP 连接和 Expo 账户认证，而不是反复安装 Skills。

### 手机与电脑必须位于同一 Wi-Fi

这是本文明确列出的前置条件。开发前应检查：

- 两台设备是否连接了同一个网络。
- 是否有访客网络或网络隔离导致设备无法互相发现。

第二点属于**基于文档内容推导**：文档没有说明网络隔离问题，但既然要求同一 Wi-Fi，网络连通性会直接影响后续手机预览流程。

### Expo Go 不等于应用商店发布

Expo Go 用于开发期间快速测试，不需要先把应用发布到 App Store 或 Google Play。它解决的是开发预览问题，不代表已经完成：

- 正式应用构建。
- 应用签名。
- 商店审核。
- 上架发布。

这些内容当前文档均未涉及。

### 本章默认使用实体手机人工验证

虽然 MCP Server 可以扩展到截图、点击和自动检查，但本教程不配置该能力。后续应由你在手机上确认界面和交互是否正确。

### “任何代理都可以”存在能力前提

文档并不是说任意聊天机器人都能完成教程。代理必须能够：

- 访问并修改本机文件。
- 执行本机命令。

此外，其他代理如何安装 Expo Skills 和连接 MCP Server，当前页面没有给出具体命令。

## React Web 开发者最容易误解的地方

### 手机不是浏览器的替代皮肤

React Native 组件最终面向移动端原生界面，而不是 HTML DOM。Expo Go 提供的是移动应用运行环境，不能将它简单理解为手机上的 Chrome 开发页面。

当前文档没有介绍 JSX 组件、原生组件与 DOM 的具体差异，这些内容需要在后续开发中学习。

### Node.js 负责开发工具，不是手机端运行时

这与 React Web 项目较为相似：Node.js 通常运行开发服务器、包管理器和构建工具，最终应用运行在另一个环境中。

这里的最终运行环境是 Expo Go 所提供的移动端环境，而不是浏览器。

### 快速更新不代表完全没有原生开发约束

本文只说明 Expo Go 能让代码变化在手机上快速呈现，没有说明所有原生功能都能在 Expo Go 中使用。因此，不能从本章推断 Expo Go 可以覆盖任意 iOS 或 Android 原生需求。

### AI 代理仍然需要开发者验收

本教程当前阶段没有让代理自动查看或操作应用。代理完成代码修改后，你需要在手机上检查：

- 界面是否符合预期。
- 按钮是否能够操作。
- 是否出现运行错误。
- 实际设备行为是否正确。

## 实际开发中的使用方式

完成本章后，可以按以下方式开展后续工作：

1. 使用终端进入项目目录并启动 AI 编码代理。
2. 用自然语言向代理描述功能需求。
3. 要求代理优先使用 Expo Skills 中的开发规范。
4. 遇到 Expo API、依赖选择或兼容性问题时，让代理通过 Expo MCP Server 查询文档。
5. 让代理修改代码并运行必要命令。
6. 在 Expo Go 中检查每次变更。

**基于经验建议：** 当代理回答 Expo API 问题时，可以明确要求它先调用 Expo MCP 工具再修改代码。这样更容易确认其依据来自当前文档，而不是模型记忆。

**基于经验建议：** 第一次运行后，应先完成一个很小的界面修改并确认手机能够更新，再开始开发复杂功能，以便尽早发现网络、账户或工具链配置问题。

## 文档明确内容与合理推导

### 文档明确说明

- 本章从零安装 AI 编码代理、Node.js 和 Expo Go。
- 电脑可以运行 macOS、Windows 或 Linux。
- 手机可以是 Android 或 iOS，并需与电脑连接同一 Wi-Fi。
- 建议安装 Node.js LTS 版本。
- AI 代理需要具备编辑文件和执行命令的能力。
- Claude Code 只是教程提供的具体示例，其他代理也可以使用。
- Expo Skills 用于指导代理正确开发 Expo 应用。
- Expo MCP Server 可以查询最新文档、安装合适的软件包和检查项目。
- Expo MCP 的本地应用操作能力是可选项，不属于本教程范围。
- 后续章节由开发者在实体手机上验证应用。
- MCP 连接或认证失败时，应重新执行登录流程。

### 基于文档内容推导

- 同一 Wi-Fi 的要求意味着电脑与手机之间的网络连通性会影响后续预览。
- Expo Skills 和 MCP Server 分别承担开发指导与工具访问职责，不能互相替代。
- MCP 测试的重点是验证工具调用链，而不只是验证代理能否解释 `expo-image-picker`。
- Expo Go 适合本教程的快速开发验证，但本章不足以证明它能够支持所有原生功能。
- 使用其他 AI 代理时，整体流程可以保持一致，但具体安装和配置命令可能不同。

## 总结

本章建立了一条完整的 AI 辅助 Expo 开发链路：

- Node.js 运行开发工具。
- AI 编码代理负责修改项目和执行命令。
- Expo Skills 为代理提供 Expo 开发规范。
- Expo MCP Server 为代理提供 Expo 文档和项目工具。
- Expo Go 让开发者在实体手机上查看和验证应用。

完成最后的 MCP 查询测试后，工具环境即配置完成。下一阶段才会正式创建 Expo 应用并在手机上运行。

<!-- NAVIGATION START -->
---
[← 上一页：使用 AI Agent 构建 Expo 应用：教程导读](./1_introduction.md) | [下一页：创建第一个 Expo 应用 →](./3_create-your-first-app.md)
<!-- NAVIGATION END -->
