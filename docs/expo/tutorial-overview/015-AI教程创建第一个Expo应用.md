# 015｜Build with AI：创建第一个 Expo app

**翻页：**[上一页：AI 教程环境准备](./014-AI教程环境准备.md) · [目录](./README.md) · [下一页：Build with AI：构建首页](./016-AI教程构建首页.md)

**官方页面：**[Build with AI: Create your first app](https://docs.expo.dev/tutorial/build-with-ai/create-your-first-app/)

**版本边界：**Expo 当前 AI 教程明确要求 SDK 57 模板，Expo Go 也要匹配 SDK 57；本地项目 Expo 为 `~56.0.11`。不要把教程的 `create-expo-app@latest` 结果直接装进 SDK56 项目；如在 SDK56 环境跟练，需先按 [v56 精确文档](https://docs.expo.dev/versions/v56.0.0/)选择模板 / 开发客户端。

## 第一个可重复的开发循环

本章的目标不是先写复杂界面，而是建立循环：单独建项目目录 → AI agent 创建项目 → 手机打开 → 提出一项视觉改动 → 根据实际现象反馈。Agent 应只在明确打开的项目目录内编辑；开发服务器建议由自己在另一个终端启动和观察。

创建目录并在该目录启动自己使用的 agent：

```sh
mkdir StickerSmash
cd StickerSmash
claude
# 或启动 Codex CLI；Cursor 则打开该文件夹并使用 Agent 面板
codex
```

## 让 Agent 初始化项目

教程提示词要求选择 SDK 57 模板，因为这本教程要用 SDK57 的 Expo Go；随后运行新模板自带的 `reset-project` 脚本，删掉剩余示例目录，但不要启动开发服务器。重写提示词：

```text
在当前目录创建新的 Expo app，选择 SDK 57 模板，以便与 SDK 57 的 Expo Go 配套。
项目生成后，运行模板自己的 reset-project 脚本，让项目回到精简结构，
并清理脚本留下的 example 文件夹。不要启动开发服务器；我会自己启动并检查。
```

模板安装结束后，确认项目结构和依赖安装完成。AI agent 通常会得到一个精简的 `src/app` 目录，后续代码变更会由 Metro 热更新到手机。

## 在手机上打开 app

保留 agent 工作的终端；另开一个终端，启动 Expo CLI：

```sh
cd StickerSmash
npx expo start
```

Android 在 Expo Go 内扫描 QR code；iOS 可用系统相机扫描。一般要求手机和电脑在同一 Wi-Fi。连接失败时可停止服务器并改用 tunnel：

```sh
npx expo start --tunnel
```

Tunnel 会通过可从外部网络访问的转发路径连接开发服务器。另一个方式是手机与终端使用同一 Expo 账号，在 Expo Go 的 Projects 中打开项目。**Expo Go 的 SDK 必须与 app 使用的 SDK 兼容**，因此教程的 SDK57 步骤不自动适用于本地 SDK56 app。

## 做出第一处可见改动

把屏幕颜色、文字和对齐描述清楚，不需要先猜组件或代码位置：

```text
把主页改成深色背景 #25292e，显示白色的“Home screen”，并让它水平、垂直居中。
```

等待 agent 修改完成并观察手机是否重载。后续回合延续相同方式：说明你看见什么、预期是什么，以及错误全文；让 agent 复查并修复自己刚做的变更。

### 常见故障反馈方式

- 把“屏幕还是白的，文字已经居中”这样的实际观察发给 agent；先描述现象，不用编造根因。
- 把终端或手机错误页上的完整信息贴给 agent。
- 如果页面卡住，打开 Expo Go 开发菜单选择 Reload。
- 若服务器连接或 Metro 卡住，停止服务后再次运行 `npx expo start`；必要时切换 `--tunnel`。

## 关键名词

- **Agent 工作目录**：AI 可以读取和编辑的文件范围；开始前应打开正确项目文件夹。
- **Expo CLI / Metro**：CLI 启动开发服务，Metro 将 JS / TS 和资源打包，并在开发时把更新发给手机 app。
- **Expo Go**：用于运行受支持 Expo 项目的通用测试客户端；并非所有任意原生模块都可由它承载。
- **QR code / tunnel**：本地网络下通过扫码发现开发服务器；同网连接失败时可尝试隧道方式。
- **Reset project**：清除入门模板演示内容、保留基础 Expo Router 项目的脚本；实际脚本名和功能以生成模板内的 package scripts 为准。

## 官方代码主题覆盖

本页没有 React / TSX 代码块；所有命令和 prompt 主题均有等价重写：`mkdir` / `cd` 建工作目录、启动 Claude / Codex 或用 Cursor 打开目录、选择 SDK57 模板并运行模板 reset 脚本的 agent prompt、`npx expo start`、Expo Go 扫码步骤、`--tunnel` 命令、主页颜色文字提示，以及出错后的反馈 / Reload / 重启流程。

## 下一页

页脚 **Next** 指向 [Build the home screen](https://docs.expo.dev/tutorial/build-with-ai/build-the-home-screen/)，用 Expo Router 做 tabs，并加入首页图片和图片选择功能。

**翻页：**[上一页：AI 教程环境准备](./014-AI教程环境准备.md) · [返回目录](./README.md) · [下一页：Build with AI：构建首页](./016-AI教程构建首页.md)
