# 012｜Argent 与 Expo

**翻页：**[上一页：agent-device 与 Expo](./011-agent-device与Expo.md) · [目录](./README.md) · [下一页：LLMs](./013-LLMs与Expo文档.md)

**官方页面：**[Argent and Expo](https://docs.expo.dev/agents/argent/)

> Argent 是 Software Mansion 维护的第三方代理工具。本页只记录 Expo 官方集成说明；更完整或更新的功能以其当前文档为准。

## Argent 的用途

AI 代理可以阅读代码，但通常不能直接感知运行中应用的界面。Argent 通过 MCP 将代理连接到 Android Emulator 或 iOS Simulator，使代理能操作、调试和分析正在运行的 Expo 应用。

它可以启动应用、点击、滑动、输入、打开深层链接、查看辅助功能树和控制台，也能查看网络请求及响应、React 组件树，或把 React 与原生性能数据关联起来。Expo Skills / Expo MCP Server 提供 Expo 约定和当前官方信息，Argent 负责驱动运行中的 app。

## 环境要求

- Node.js 18 或更新版本。
- 一个正在运行的 Android Emulator 或 iOS Simulator。
- Android 需要 `adb` 可执行，并已安装 Android SDK Platform Tools；iOS 需要 macOS 和 Xcode。

## 安装 Argent

在 Expo 项目根目录运行初始化向导。它会识别编辑器、登记 Argent MCP Server，并把技能 / 代理定义写到工作区：

```sh
npx @swmansion/argent init
yarn dlx @swmansion/argent init
pnpm dlx @swmansion/argent init
bunx @swmansion/argent init
```

编辑器会以 `argent` 命令启动 MCP Server，因此还需要全局安装 CLI 并确保它可在 `PATH` 中找到：

```sh
npm install -g @swmansion/argent
yarn global add @swmansion/argent
pnpm add -g @swmansion/argent
bun add -g @swmansion/argent
```

安装后重启编辑器，让它读取新的 MCP 配置。

## 启动应用并验证

Argent 操作已安装且正在运行的应用。可以在模拟器 / 仿真器上编译 Development Build，或启动 Expo 开发服务器后用 Expo Go 测试：

```sh
# 运行开发构建
npx expo run:android
npx expo run:ios

# 或启动开发服务器并使用 Expo Go
npx expo start
```

在编辑器 Agent 面板可以发出这样的验证请求：“截取当前运行应用的屏幕并描述画面。”如果代理返回截图并说明当前页面，说明它已连到设备。

## 管理 Argent

CLI 提供刷新、查看开关和移除配置的命令：

```sh
# 更新到当前版本并刷新配置
argent update

# 查看功能开关及其状态
argent flags

# 注销 MCP 服务并移除 Argent
argent remove
```

## 示例任务

| 目标 | 可向代理提出 |
| --- | --- |
| 冒烟测试 | 启动应用并逐步完成 onboarding，通过日志指出在哪里卡住。 |
| 验证界面 | 截取首页并确认商品列表已渲染。 |
| 检查网络问题 | 打开购物车页并展示失败请求和响应内容。 |
| 检查 React 状态 | 打开设置页并展示开关行的 React 组件树。 |
| 分析卡顿 | 录制商品列表滚动并定位最慢的 React 提交。 |
| 测试深层链接 | 通过链接启动应用并确认落到正确页面。 |

## 限制与建议

- 当前页面列出的目标是 Android Emulator 与 iOS Simulator。
- 尽量让 Argent 自己启动或重启应用；若手工启动设备，它可能看不到某些系统弹窗或原生模态。
- 在 Expo Go 中可操作界面、读取 React 组件树并运行 React Profiler；需要分析自己的原生代码时用 Development Build，因为 Expo Go 会把原生性能采样落到 Expo Go 宿主进程。
- React 组件树和 Profiler 需要 JavaScript 调试连接，因此开发服务器需要保持运行。

## 官方代码主题覆盖

本页源代码主题均有示例：初始化 Argent（四种包管理器）、全局 CLI 安装（四种包管理器）、运行 Expo app 的平台命令、更新 / 查看 feature flags / 移除 Argent。验证截图的自然语言提示词也已改写。

## 下一页

页脚 Next 指向 [LLMs](https://docs.expo.dev/llms/)。

**翻页：**[上一页：agent-device 与 Expo](./011-agent-device与Expo.md) · [目录](./README.md) · [下一页：LLMs](./013-LLMs与Expo文档.md)
