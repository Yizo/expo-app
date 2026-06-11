# 创建第一个 Expo 应用

> 原文档更新时间：2026 年 6 月 10 日

## 文档解决的问题

本章介绍如何借助 AI Agent 完成第一个 Expo 应用的基础开发闭环：

1. 创建独立的项目目录。
2. 让 Agent 初始化 Expo 项目。
3. 在手机上通过 Expo Go 运行应用。
4. 让 Agent 修改首页。
5. 在手机上实时查看修改结果。
6. 在结果错误或应用卡住时进行基本排查。

整个工作流可以概括为：

> 向 Agent 描述需求 → Agent 修改项目 → 手机显示结果 → 根据实际效果继续反馈

这也是后续教程会反复使用的开发方式。

## 适用场景

本文适合以下场景：

- 第一次接触 Expo 或 React Native。
- 希望在真机上快速运行移动应用。
- 使用 Claude、Codex 或 Cursor Agent 辅助开发。
- 暂时不希望直接处理复杂的 iOS 或 Android 原生工程。

当前文档未涉及：

- React Native 组件和样式语法的详细说明。
- iOS、Android 原生工程结构。
- 模拟器的配置与使用。
- 应用打包、签名和发布。
- 自动化测试。
- Expo Go 的安装与账号注册流程。
- 后续页面、导航和图片选择器的具体实现。

## 阅读前需要理解的概念

### Expo

Expo 是用于开发 React Native 应用的工具和开发平台。本章通过 Expo 创建项目并启动开发服务器。

对于 React Web 开发者，可以暂时将它理解为：

- `create-expo-app` 类似于 Web 项目的脚手架工具。
- `expo start` 类似于启动本地前端开发服务器。
- Expo Go 类似于手机上的开发预览容器。

最后一种类比并不完全等价。浏览器直接执行 Web 页面，而 Expo Go 加载的是 Expo 项目，并在手机上显示 React Native 界面。

### Expo Go

Expo Go 是安装在手机上的应用，用来打开和测试 Expo 项目。

本章的运行方式不是先生成一个独立的 Android 或 iOS 安装包，而是：

1. 电脑启动 Expo 开发服务器。
2. 手机通过二维码连接项目。
3. Expo Go 加载并显示应用。

### SDK 54

Expo SDK 可以理解为项目所使用的 Expo 平台版本。本章要求创建使用 **SDK 54** 的项目，因为测试手机上的 Expo Go 使用 SDK 54。

**文档明确说明：**创建项目时必须选择 SDK 54 模板，以便与手机上的 Expo Go 版本匹配。

**基于文档内容推导：**创建项目时不能只关注“最新版”，还必须关注项目 SDK 与 Expo Go 支持版本之间的兼容关系。

### AI Agent

本文中的 Agent 是能够在项目目录中运行命令、创建文件和修改代码的开发助手，例如：

- Claude
- Codex
- Cursor 中的 Agent

Agent 一次在一个文件夹内工作，因此需要先建立专用项目目录，再从该目录启动 Agent。

### 开发服务器与自动刷新

`npx expo start` 会启动开发服务器，并将应用内容传输到手机。开发服务器运行期间，Agent 完成代码修改后，手机通常会在数秒内重新加载并显示结果。

对于 React Web 开发者，这类似于本地开发服务器配合热更新，但最终界面显示在 Expo Go 中，而不是浏览器中。

## 一、创建并进入项目目录

在终端中运行：

```sh
mkdir StickerSmash
cd StickerSmash
```

命令作用：

| 命令 | 作用 |
| --- | --- |
| `mkdir StickerSmash` | 创建名为 `StickerSmash` 的项目目录 |
| `cd StickerSmash` | 进入该目录，使其成为 Agent 的工作目录 |

然后在该目录启动 Agent：

```sh
claude
```

或者：

```sh
codex
```

如果使用 Cursor：

1. 创建名为 `StickerSmash` 的文件夹。
2. 通过 **File > Open Folder** 打开它。
3. 打开 Agent 面板。

### 为什么必须先进入项目目录

Agent 会以当前目录为工作范围。若在错误目录启动，可能会把项目创建到非预期位置，或读取、修改无关文件。

这与 React Web 项目中先进入仓库目录再执行安装和开发命令的习惯一致。

## 二、让 Agent 创建 Expo 应用

将下面的需求交给 Agent：

```text
Create a new Expo app in this folder (the current directory) by running npx create-expo-app@latest and choosing the SDK 54 template — I will test the app with Expo Go on my phone, which uses SDK 54. After it is created, run the project's reset-project script so we start from a minimal app, and delete the app-example folder that the script leaves behind. Don't start the development server; I will run that myself.
```

这段提示词包含五项明确要求：

1. 在当前目录创建 Expo 应用。
2. 使用 `npx create-expo-app@latest`。
3. 选择 SDK 54 模板。
4. 执行项目的 `reset-project` 脚本，得到最小化项目。
5. 删除脚本遗留的 `app-example` 目录。
6. 不由 Agent 启动开发服务器。

### 涉及的命令和目录

#### `npx create-expo-app@latest`

用于下载 Expo 项目模板、创建项目并安装依赖。

- `npx`：临时运行 npm 软件包提供的命令。
- `create-expo-app`：Expo 项目创建工具。
- `@latest`：使用该工具的最新版本。

项目创建和依赖安装可能需要几分钟。

#### `reset-project` 脚本

该脚本用于将初始模板整理成更简洁的起点。

**文档明确说明：**执行后应得到一个最小化的 `app` 目录，其中只包含少量文件。

当前文档没有提供脚本的具体命令、内部实现或被删除内容的完整列表。

#### `app` 目录

这是本教程后续开发使用的主要应用目录。对于 React Web 开发者，可以先将它理解为存放页面或路由入口的目录。

当前文档没有详细解释该目录中的文件及路由规则。

#### `app-example` 目录

`reset-project` 脚本会留下这个目录，因此提示词要求 Agent 将其删除。

当前文档没有解释该目录的具体内容，也没有说明保留它是否会影响应用运行。

### 完成标志

Agent 完成后应报告项目已经准备好，并且项目中存在一个内容精简的 `app` 目录。

## 三、在手机上运行应用

开发服务器由开发者自己启动，而不是交给 Agent。

打开一个新的终端窗口，保留第一个终端中的 Agent，然后运行：

```sh
cd StickerSmash
npx expo start
```

### 为什么使用两个终端

两个终端承担不同职责：

| 终端 | 职责 |
| --- | --- |
| 第一个终端 | 保持 Agent 运行，用于提出需求和修改代码 |
| 第二个终端 | 运行 Expo 开发服务器并查看日志 |

这样可以持续与 Agent 交互，同时保持手机与项目的连接。

### `npx expo start` 的作用

该命令启动 Expo 开发服务器。启动后，终端会显示二维码，手机通过该二维码打开项目。

文档将其描述为整个教程中需要由开发者反复执行的主要命令。

### Android 打开方式

1. 打开 Expo Go。
2. 点击 **Scan QR code**。
3. 扫描终端中的二维码。

### iOS 打开方式

1. 打开系统默认相机。
2. 将相机对准终端中的二维码。
3. 通过识别出的入口打开项目。

成功后，手机上应出现一个基本为空的页面。这说明应用已经运行。

在后续教程中，应保持开发服务器终端开启，并将手机放在附近以便持续预览。

## 四、处理手机无法连接的问题

### 首先检查网络

**文档明确说明：**手机和电脑必须连接到同一个 Wi-Fi 网络。

如果满足该条件但应用仍无法加载：

1. 在开发服务器终端按 `Ctrl + C` 停止服务。
2. 使用 tunnel 模式重新启动：

```sh
npx expo start --tunnel
```

### tunnel 模式

文档说明 tunnel 模式可以跨网络工作，因此它适合局域网连接失败的情况。

当前文档没有解释 tunnel 的技术原理、性能差异或网络安全细节。

### 通过 Expo 账号查找项目

如果手机与终端登录了同一个 Expo 账号，还可以在 Expo Go 的 **Projects** 标签页中找到项目。

这提供了二维码之外的另一种项目访问入口。

## 五、完成第一次界面修改

回到 Agent 所在的终端，要求它修改首页：

```text
Change the home screen so it shows the text "Home screen" in white, centered on a dark background with the color #25292e.
```

该需求包含四个可验证条件：

- 页面显示文本 `Home screen`。
- 文本颜色为白色。
- 文本在页面中居中。
- 页面背景颜色为 `#25292e`。

Agent 完成修改后，手机应在数秒内重新加载，显示深色背景和居中的白色文字。

这一步完成了本章的核心开发循环：

1. 用自然语言描述目标。
2. Agent 修改代码。
3. Expo 开发服务器检测变化。
4. 手机重新加载。
5. 开发者检查结果是否符合要求。

当前文档没有展示 Agent 实际修改的文件、React Native 组件代码或样式代码。

## 六、结果不符合预期时如何处理

出现错误并不意味着必须立即理解其内部原因。本章建议围绕“实际现象”与 Agent 协作。

### 描述现象，不要猜测原因

应明确告诉 Agent：

- 实际看到了什么。
- 原本期望看到什么。

例如：

```text
The text is centered but the background is still white.
```

这种反馈比未经验证地判断代码原因更可靠。

### 完整粘贴错误信息

如果手机显示红色错误页面，或者终端输出错误，应将完整错误信息原样交给 Agent。

不要只提供“运行失败”或截断后的部分消息。完整错误通常包含文件、位置和失败原因等诊断信息。

### 要求 Agent 检查刚才的修改

可以直接要求 Agent 复查并修复：

```text
Something is broken — review the change you just made, find the problem, and fix it.
```

这种方式适用于错误很明显，但开发者暂时无法定位原因的情况。

### 应用卡住时重新加载

如果应用没有响应：

1. 摇动手机。
2. 在出现的菜单中点击 **Reload**。

如果仍然无效：

1. 在服务器终端按 `Ctrl + C`。
2. 重新运行：

```sh
npx expo start
```

## React Web 开发者容易误解的地方

### 1. 预览环境不是浏览器

React Web 通常通过浏览器访问本地 URL。本文的应用则运行在手机的 Expo Go 中，通过二维码建立连接。

因此，最终检查目标应是手机上的实际界面，而不是浏览器页面。

### 2. Expo Go 预览不等于生成安装包

本章只完成开发阶段的真机预览，没有生成可独立安装或发布的 Android、iOS 应用。

应用构建、签名和应用商店发布均未在当前文档中涉及。

### 3. SDK 版本是兼容性条件

提示词明确要求 SDK 54，因为手机上的 Expo Go 使用 SDK 54。不能把版本选择简单理解为“始终选择最新 SDK”。

### 4. `app` 不是传统 Web 的静态资源目录

本文将 `app` 作为主要应用目录，而不是传统 Web 项目中可能用于构建产物或静态文件的目录。

不过，当前文档没有进一步解释其页面和路由机制。

### 5. Agent 与开发服务器是两个独立进程

Agent 负责创建和修改代码，`npx expo start` 负责运行开发服务器。Agent 按提示不会启动服务器，因此必须由开发者在另一个终端执行该命令。

### 6. 移动端重载方式不同

除重启开发服务器外，还可以通过摇动手机打开菜单并点击 **Reload**。这是本章给出的移动端排查方式，在普通 React Web 开发中通常不会出现。

## 注意事项与限制

- Agent 必须从专门创建的项目目录中启动。
- 创建项目时应选择与 Expo Go 匹配的 SDK 54 模板。
- Agent 创建项目后，还应执行 `reset-project` 并删除 `app-example`。
- 不要让 Agent 启动开发服务器；本章要求开发者自行运行。
- 应在新终端启动服务器，同时保持 Agent 所在终端运行。
- 普通连接模式下，手机和电脑必须处于同一个 Wi-Fi 网络。
- 局域网连接失败时，可以改用 `--tunnel`。
- Expo Go 与终端使用同一 Expo 账号时，可以从 **Projects** 标签页查找项目。
- 开发服务器终端需要保持开启。
- 当前流程依赖 Expo Go，不代表所有 Expo 或 React Native 项目都能始终使用相同方式运行。
- 文档没有涉及生产构建、原生模块兼容性或发布限制，因此不能从本章推断这些能力。

## 实际开发中的使用方式

### 文档明确说明的做法

- 将项目创建、清理和代码修改交给 Agent。
- 由开发者运行开发服务器并观察手机结果。
- 使用可直接验证的视觉要求描述修改目标。
- 结果异常时，向 Agent 提供实际现象、预期结果和完整错误信息。
- 应用卡住时先 Reload，再考虑重启开发服务器。

### 基于文档内容推导

- 给 Agent 的需求应包含明确约束，例如目标目录、SDK 版本、需要执行的脚本和禁止执行的操作。
- 界面需求最好拆成可验证条件，例如文本内容、颜色、位置和背景。
- 每次修改后都应在手机上检查，因为 Agent 完成代码修改不等于最终效果一定正确。
- 将 Agent 和开发服务器放在独立终端中，可以减少进程管理混乱，并方便同时查看修改过程和运行日志。

## 总结

本章建立了第一个 Expo 真机开发闭环：

```text
创建项目目录
→ 在目录中启动 Agent
→ 让 Agent 创建并精简 SDK 54 Expo 项目
→ 手动运行 npx expo start
→ 用 Expo Go 在手机上打开项目
→ 让 Agent 修改首页
→ 在手机上验证结果
→ 根据现象或错误继续修复
```

完成本章后，你已经能够创建 Expo 应用、在手机上运行它，并通过自然语言提示让 Agent 完成第一次可见修改。

下一章将基于这个空白页面继续添加导航标签、照片查看器和图片选择器。

<!-- NAVIGATION START -->
---
[← 上一页：配置 Expo AI 开发工具](./2_set-up-your-tools.md) | [下一页：构建 StickerSmash 首页 →](./4_build-the-home-screen.md)
<!-- NAVIGATION END -->
