# 011｜agent-device 与 Expo

**翻页：**[上一页：Cursor 与 Expo](./010-Cursor与Expo.md) · [目录](./README.md) · [下一页：Argent 与 Expo](./012-Argent与Expo.md)

**官方页面：**[agent-device and Expo](https://docs.expo.dev/agents/agent-device/)

> `agent-device` 是 Callstack 维护的开源第三方命令行工具，不是 Expo SDK 内置模块。本页是 Expo 官方集成说明，CLI 的精确支持范围应再看其自身版本匹配的帮助。

## 能解决什么问题

静态代码检查无法证明运行中的应用真的能打开页面、完成操作或发出请求。`agent-device` 让 AI 代理通过终端操作已安装的 app，并用界面状态、截图、日志、网络活动、追踪和性能信息验证结果。

同一套命令可面向 Android Emulator、iOS Simulator、真机、Android TV、tvOS、macOS、Linux 和 Web；本地测试需要相应平台工具链，也可连接设备云或远程设备主机。CLI 可在 Codex、Claude Code、Cursor 等代理的终端中运行，也支持可选 MCP 集成。

## 环境要求

- 本页所述 `agent-device` 当前要求 Node.js 22.12 或更新版本；这是该第三方 CLI 的要求，高于 Expo SDK 56 自身的最低 Node.js 20.19.x。若同时运行 Expo 工具与 agent-device，应满足较高的 Node 版本。
- 本地 Android 测试需要 Android SDK Platform Tools，确保 `adb` 位于 `PATH`。
- 本地 iOS 测试需要 macOS 和 Xcode。
- 若走云端或远程设备主机，可跳过本地模拟器工具链。

## 安装与检查

官方提供全局安装方式，使代理能在终端稳定调用 `agent-device`：

```sh
npm install -g agent-device@latest
yarn global add agent-device@latest
pnpm add -g agent-device@latest
bun add -g agent-device@latest
```

检查本机设备工具并读取 CLI 版本与工作流帮助：

```sh
agent-device doctor
agent-device --version
agent-device help workflow
```

如果代理支持 Skills，可以另外安装 agent-device Skill；不安装也能使用，代理可从 CLI 内置帮助学习当前版本用法：

```sh
npx skills add callstack/agent-device
yarn dlx skills add callstack/agent-device
pnpm dlx skills add callstack/agent-device
bunx skills add callstack/agent-device
```

## 运行 Expo 应用

工具控制的是设备上已安装的应用，不需要把 `agent-device` 作为依赖加进 Expo 项目。可以先安装开发构建，也可以启动开发服务器并用 Expo Go 打开：

```sh
# 在 Android 模拟器 / iOS 仿真器安装并运行开发构建
npx expo run:android
npx expo run:ios

# 或连接已安装的开发构建 / Expo Go
npx expo start
```

随后要求代理验证某条流程。例如：“用 `agent-device` 在 iOS 打开我的设置页，确认它正常加载，并保存一张截图作为证据。”

## 交互循环示例

`agent-device` 先发现应用、打开会话、读取可访问性快照，再用稳定引用操作控件并检查结果。下面是源页操作的改写示例：

```sh
agent-device apps --platform ios
agent-device open MyApp --platform ios
agent-device snapshot -i
# 快照可能包含 @e1 [heading] "Welcome" 和 @e2 [button] "Get Started"
agent-device press @e2 --settle
agent-device screenshot ./artifacts/get-started.png
agent-device close
```

`@e2` 这类引用来自屏幕无障碍快照；`--settle` 等待点击后的界面稳定。比起固定屏幕坐标，控件引用 / `testID` 一般能更好地适应布局变化。

## 可以执行的任务

| 能力 | 说明 |
| --- | --- |
| 操作应用 | 启动应用，点击、输入、滚动、手势、处理弹窗、打开深层链接、切换设备状态。 |
| 调试与排查 | 查看无障碍信息、React 组件与属性、Hooks、重渲染、Metro 上的 JS 调试协议信息、日志和网络请求。 |
| 原生性能观察 | 在平台支持范围内采集 CPU、内存、FPS、卡帧、追踪、崩溃、截图、视频等数据。 |
| 自动化回放 | 将已验证流程保存为 `.ad` 脚本，重复播放或在 CI 运行；支持 Maestro YAML 与互转。 |
| 外部调试器联动 | 对需要原生断点、变量和单步调试的场景，先复现、记录流程，再由 Xcode 或 LLDB 附加进程。 |

页面还给出多种自然语言任务：验证结账流程并截取确认页、在真 Android 设备复现问题、检查无障碍标签、分析长列表滚动卡顿、按设计稿做截图差异迭代、以新用户身份探索并提交分优先级的发现。

## 可选 MCP 配置

若代理更适合使用结构化 MCP 工具，可在其配置中添加以下服务器定义：

```json
{
  "mcpServers": {
    "agent-device": {
      "command": "agent-device",
      "args": ["mcp"]
    }
  }
}
```

即便使用 MCP，仍需在本机保留 CLI，以便代理读取与安装版本匹配的帮助信息、运行仅限终端的初始化命令。

## 可靠性与限制

- 优先使用无障碍标签、role、`testID` 和快照引用；截图适合作为证据或视觉兜底。
- 有状态的操作应在同一会话中顺序执行。CI 里要关闭模拟器时，可用 `agent-device close --shutdown`。
- 屏幕自动化可作用于已安装的 Development Build 或 Expo Go，不必加 Expo app 依赖。
- React 组件检查和 React 性能分析需要开发服务器与兼容的 DevTools 连接。用 Expo Go 做原生 CPU / 内存 / trace 采样时，目标是 Expo Go 宿主应用，评估自己应用的原生代码时应使用 Development Build。
- 日志默认关闭；调试时建议让代理采集一个聚焦的复现时间窗口。
- 真机自动化需要平台配对、签名、权限和信任设置，建议先用模拟器熟悉流程。

## 官方代码主题覆盖

本页代码示例覆盖 CLI 全局安装（四种包管理器）、设备诊断和帮助、Skill 安装（四种包管理器）、Expo 构建 / 启动命令、`agent-device` 发现 / 打开 / 快照 / 点击 / 截图 / 关闭流程、MCP JSON 配置，以及 CI 关闭模拟器的命令。

## 下一页

页脚 Next 指向 [Argent and Expo](https://docs.expo.dev/agents/argent/)。

**翻页：**[上一页：Cursor 与 Expo](./010-Cursor与Expo.md) · [目录](./README.md) · [下一页：Argent 与 Expo](./012-Argent与Expo.md)
