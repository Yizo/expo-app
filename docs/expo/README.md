# Expo 官方文档中文整理

本目录按 Expo 官方文档页面的文字和代码含义撰写中文学习笔记，面向熟悉 React、但刚开始接触 React Native / Expo 的前端工程师。正文为释义与重写示例，不是官方文档的逐字翻译。

## 范围与版本

- 用户给定入口是 [Expo 文档首页](https://docs.expo.dev/)。首页没有单一的页脚 Next；它显式列出的 Get started 顺序是 Create a project → Set up your environment → Start developing → Next steps。
- 因此，从首页选中第一个入门页 Create a project 开始，并在每页沿用页脚的 **Next** 继续导航。Next steps 的下一页会跨到 AI 分组；本轮会继续沿链读取，而不是将其当成已完成边界。
- 当前项目 `package.json` 使用 Expo `~56.0.11`。项目 `AGENTS.md` 要求阅读精确版本页，因此 SDK / API 基准改为 [Expo SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)：SDK 56 配套 React Native 0.85、React 19.2.3、React Native Web 0.21.0、最低 Node.js 20.19.x；Android 7+、compile / target SDK 36；iOS 16.4+、Xcode 26.4+。
- Expo 首页的 Get started 指南及后续 Guide URL 当前都不带 SDK 版本路径，内容可能更新到较新的 SDK。每篇笔记链接到原始 Expo 页面；显式涉及 SDK 包版本的代码依 v56.0.0 参考页校对。无法从版本化页确认、但当前 Guide 明确使用较新 SDK 的示例，会注明版本差异，避免将最新示例当作 v56 兼容承诺。
- 来源限于 Expo 官方文档站。SDK v56 API 参考页面用于代码版本校对，但不作为连续 Next 链中的编号页面。Expo 侧栏、Guide 内文和其它入口存在大量未串入 Next 链的分支，例如单独的 Expo SDK 模块、Tutorial、EAS 指南和第三方服务指南；本目录不声称覆盖这些分支或整个文档站。

## 已访问的连续前缀

| 顺序 | 本地文件 | 官方页面 | 本页页脚 Next |
| --- | --- | --- | --- |
| 001 | [创建项目](./001-创建项目.md) | [Create a project](https://docs.expo.dev/get-started/create-a-project/) | Set up your environment；命令主题已覆盖 |
| 002 | [搭建开发环境](./002-搭建开发环境.md) | [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/) | Start developing；源页无代码块 |
| 003 | [开始开发](./003-开始开发.md) | [Start developing](https://docs.expo.dev/get-started/start-developing/) | Next steps；启动、隧道、TSX、路由示例已覆盖 |
| 004 | [后续步骤](./004-后续步骤.md) | [Next steps](https://docs.expo.dev/get-started/next-steps/) | AI → Overview，即 AI agents and Expo overview；重置脚本已覆盖 |
| 005 | [AI 与 Expo 概览](./005-AI与Expo概览.md) | [AI agents and Expo overview](https://docs.expo.dev/agents/) | Expo Skills；命令、JSON、导入行和提示词已覆盖 |
| 006 | [Expo Skills](./006-Expo-Skills.md) | [Expo Skills for AI agents](https://docs.expo.dev/skills/) | Expo MCP Server；安装命令与技能目录已覆盖 |
| 007 | [Expo MCP Server](./007-Expo-MCP-Server.md) | [Using Model Context Protocol (MCP) with Expo](https://docs.expo.dev/mcp/) | AI Agents → Claude Code；连接、构建/工作流工具、本地调试与数据流已覆盖 |
| 008 | [Claude Code 与 Expo](./008-Claude-Code与Expo.md) | [Claude Code and Expo](https://docs.expo.dev/agents/claude/) | Codex；安装、项目初始化、插件和提示词示例已覆盖 |
| 009 | [Codex 与 Expo](./009-Codex与Expo.md) | [Codex and Expo](https://docs.expo.dev/agents/codex/) | Cursor；安装、插件、项目上下文和提示词示例已覆盖 |
| 010 | [Cursor 与 Expo](./010-Cursor与Expo.md) | [Cursor and Expo](https://docs.expo.dev/agents/cursor/) | Agent toolkits → agent-device；项目初始化和 SDK 验证提示词已覆盖 |
| 011 | [agent-device 与 Expo](./011-agent-device与Expo.md) | [agent-device and Expo](https://docs.expo.dev/agents/agent-device/) | Argent；CLI、设备操作、调试与 MCP 配置已覆盖 |
| 012 | [Argent 与 Expo](./012-Argent与Expo.md) | [Argent and Expo](https://docs.expo.dev/agents/argent/) | LLMs；初始化、运行、管理命令与限制已覆盖 |
| 013 | [LLMs 与 Expo 文档](./013-LLMs与Expo文档.md) | [Documentation for AI agents and LLMs](https://docs.expo.dev/llms/) | Tools for development；Markdown URL 与 `/llms.txt` 已覆盖 |
| 014 | [开发工具](./014-开发工具.md) | [Tools for development](https://docs.expo.dev/develop/tools/) | Navigation；CLI、EAS、Doctor、Orbit、Snack、Expo Go 与库目录已覆盖 |
| 015 | [导航](./015-导航.md) | [Navigation in Expo and React Native apps](https://docs.expo.dev/develop/app-navigation/) | Splash screen and app icon；源页无代码块 |
| 016 | [启动画面与应用图标](./016-启动画面与应用图标.md) | [Splash screen and app icon](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/) | Safe areas；JSON 配置与旧版命令已覆盖 |
| 017 | [安全区域](./017-安全区域.md) | [Safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/) | System bars；安装、SafeAreaView、Provider、Hook 均已覆盖 |
| 018 | [系统栏](./018-系统栏.md) | [System bars](https://docs.expo.dev/develop/user-interface/system-bars/) | Fonts；状态栏和 Android 导航栏示例已覆盖 |
| 019 | [字体](./019-字体.md) | [Fonts](https://docs.expo.dev/develop/user-interface/fonts/) | Assets；本地字体、Google Fonts、Hook、图标和远程字体已覆盖 |
| 020 | [静态资源](./020-静态资源.md) | [Assets](https://docs.expo.dev/develop/user-interface/assets/) | Color themes；本地、预构建、运行时、远程加载与优化已覆盖 |
| 021 | [颜色主题](./021-颜色主题.md) | [Color themes](https://docs.expo.dev/develop/user-interface/color-themes/) | Animation；app config、原生配置、主题 Hook 和测试步骤已覆盖 |
| 022 | [动画](./022-动画.md) | [Animation](https://docs.expo.dev/develop/user-interface/animation/) | Store data；按 SDK 56 参考补充 Reanimated Worklets |
| 023 | [保存数据](./023-保存数据.md) | [Store data](https://docs.expo.dev/develop/user-interface/store-data/) | User interface → Next steps；存储选型页无代码块 |
| 024 | [界面开发后续步骤](./024-界面开发后续步骤.md) | [Next steps](https://docs.expo.dev/develop/user-interface/next-steps/) | Development builds → Introduction and setup；源页无代码块 |
| 025 | [开发构建简介](./025-开发构建简介.md) | [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/) | Use a development build；安装、构建、重建和 EAS 命令已覆盖 |
| 026 | [使用开发构建](./026-使用开发构建.md) | [Use a development build](https://docs.expo.dev/develop/development-builds/use-development-builds/) | Share a development build with your team；开发服务器命令已覆盖 |
| 027 | [与团队分享开发构建](./027-与团队分享开发构建.md) | [Share a development build with your team](https://docs.expo.dev/develop/development-builds/share-with-your-team/) | Tools, workflows and extensions；EAS CLI 下载与重签主题已覆盖 |
| 028 | [开发构建工具与工作流](./028-开发构建工具与工作流.md) | [Tools, workflows and extensions](https://docs.expo.dev/develop/development-builds/development-workflows/) | Development builds FAQ；Tunnel、更新 URL、Deep Link、QR、菜单插件已覆盖 |
| 029 | [开发构建 FAQ](./029-开发构建FAQ.md) | [Development builds FAQ](https://docs.expo.dev/develop/development-builds/faq/) | Config plugins → Introduction；源页以文字说明为主 |
| 030 | [Config Plugin 简介](./030-Config-Plugins简介.md) | [Introduction to config plugins](https://docs.expo.dev/config-plugins/introduction/) | Create a plugin；Prebuild、插件函数、Mods 概念已说明 |
| 031 | [创建 Config Plugin](./031-创建Config-Plugin.md) | [Create and use config plugins](https://docs.expo.dev/config-plugins/plugins/) | Mods；Android / iOS mod、options、插件链和 `expo-camera` 已覆盖 |
| 032 | [Mods](./032-Mods.md) | [Mods](https://docs.expo.dev/config-plugins/mods/) | Dangerous mods；平台 Mod Plugin 清单与 Xcode 示例已覆盖 |
| 033 | [Dangerous Mods](./033-Dangerous-Mods.md) | [Using a dangerous mod](https://docs.expo.dev/config-plugins/dangerous-mods/) | Plugin development for libraries；正则文件修改与读写骨架已覆盖 |
| 034 | [为库开发 Config Plugin](./034-为库开发Config-Plugin.md) | [Plugin development for libraries](https://docs.expo.dev/config-plugins/development-for-libraries/) | Development and debugging；SDK 版本 caveat、库目录、平台实现、测试已覆盖 |
| 035 | [Config Plugin 开发与调试](./035-Config-Plugin开发与调试.md) | [Developing and debugging a plugin](https://docs.expo.dev/config-plugins/development-and-debugging/) | patch-project；package、Mod 设计、Android lifecycle、调试和 introspection 已覆盖 |
| 036 | [patch-project](./036-patch-project.md) | [Using patch-project](https://docs.expo.dev/config-plugins/patch-project/) | Errors and warnings；Alpha 安装、生成与限制已覆盖 |
| 037 | [错误与警告](./037-错误与警告.md) | [Errors and warnings](https://docs.expo.dev/debugging/errors-and-warnings/) | Runtime issues；日志 API 和堆栈说明已覆盖 |
| 038 | [运行时问题排查](./038-运行时问题排查.md) | [Debugging runtime issues](https://docs.expo.dev/debugging/runtime-issues/) | Tools；开发、原生和生产排错命令已覆盖 |
| 039 | [调试与性能工具](./039-调试与性能工具.md) | [Debugging and profiling tools](https://docs.expo.dev/debugging/tools/) | Dev tools plugins；菜单、DevTools、VS Code 和旧工具边界已覆盖 |
| 040 | [Dev Tools 插件](./040-Dev-Tools插件.md) | [Dev tools plugins](https://docs.expo.dev/debugging/devtools-plugins/) | Create a dev tools plugin；五种工具包和接入模式已覆盖 |
| 041 | [创建 Dev Tools 插件](./041-创建Dev-Tools插件.md) | [Create a dev tools plugin](https://docs.expo.dev/debugging/create-devtools-plugins/) | Database；插件生成、消息 API、生产 no-op 已覆盖 |
| 042 | [数据库](./042-数据库.md) | [Databases in Expo and React Native apps](https://docs.expo.dev/develop/database/) | Authentication；服务比较页无代码块 |
| 043 | [身份验证](./043-身份验证.md) | [Authentication in Expo and React Native apps](https://docs.expo.dev/develop/authentication/) | Unit testing；认证路线、OAuth 和会话概念已覆盖 |
| 044 | [Jest 单元测试](./044-Jest单元测试.md) | [Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/) | Review → App distribution overview；Jest、RNTL、覆盖率与快照示例已覆盖 |
| 045 | [应用审核分发概览](./045-应用审核分发概览.md) | [Overview of distributing apps for review](https://docs.expo.dev/review/overview/) | Share previews with your team；三个评审分发渠道已覆盖 |
| 046 | [与团队分享预览](./046-与团队分享预览.md) | [Share previews with your team](https://docs.expo.dev/review/share-previews-with-your-team/) | Open updates with Orbit；EAS Update 与 Workflow 示例已覆盖 |
| 047 | [用 Expo Orbit 打开更新](./047-使用ExpoOrbit.md) | [How to launch an update using Expo Orbit](https://docs.expo.dev/review/with-orbit/) | Build project for app stores；预览步骤与设备限制已说明 |
| 048 | [构建应用商店版本](./048-构建应用商店版本.md) | [Build your project for app stores](https://docs.expo.dev/deploy/build-project/) | Submit to app stores；EAS / 本机构建和工作流已覆盖 |
| 049 | [提交到应用商店](./049-提交到应用商店.md) | [Submit to app stores](https://docs.expo.dev/deploy/submit-to-app-stores/) | App stores metadata；EAS Submit / workflow / CI 命令已覆盖 |
| 050 | [App Store 元数据](./050-App-Store元数据.md) | [App stores metadata](https://docs.expo.dev/deploy/app-stores-metadata/) | Send over-the-air updates；store.config 与 push 命令已覆盖 |
| 051 | [发布 OTA 更新](./051-发布OTA更新.md) | [Send over-the-air updates](https://docs.expo.dev/deploy/send-over-the-air-updates/) | Publish your web app；EAS 配置、发送与自动工作流已覆盖 |
| 052 | [发布 Expo Web 应用](./052-发布Expo-Web应用.md) | [Publish your web app](https://docs.expo.dev/deploy/web/) | Monitoring services；export、deploy 与 EAS Workflow 已覆盖 |
| 053 | [监控服务](./053-监控服务.md) | [Monitoring services](https://docs.expo.dev/monitoring/services/) | Core concepts；监控平台和指标页无代码块 |
| 054 | [Expo 核心概念](./054-Expo核心概念.md) | [Core concepts](https://docs.expo.dev/core-concepts/) | FAQ；概念与功能分组页无代码块 |
| 055 | [Expo FAQ](./055-Expo-FAQ.md) | [FAQ](https://docs.expo.dev/faq/) | **终点：源页面没有 Next 链接**；行内代码和 React / RN 概念已解释 |

**当前结果：**沿官方页脚 Next 从首页的首个入门页 Create a project 连续遍历，共完成 55 页，编号从 001 到 055。每份文档均有页首与页尾的上一页 / 目录 / 下一页；按用户要求的这条 Next 链，FAQ 页没有 Next，已到终点。每页的“官方代码主题覆盖”注明源页代码主题及改写示例，源页无代码时明确说明。仅为 v56 版本校对而单独打开的 API 参考页未计入这 55 页。侧栏与页内链接指向的其它独立分支仍未遍历。

## 补充文档模块

以下专题从用户给定的四个 Expo 官方入口分别起步，独立编号、独立沿官方页脚 Next 继续。`versions-latest` 使用会滚动更新的 Latest 参考页；访问时最新稳定版本为 SDK 57.0.0，而本项目 Expo 为 `~56.0.11`，因此该模块逐页标出最新示例与 SDK 56 之间的版本边界。

| 模块 | 本地索引 | 官方起点 |
| --- | --- | --- |
| Guides 总览链 | [指南概览索引](./guides-overview/README.md) | [Guides: Overview](https://docs.expo.dev/guides/overview/) |
| EAS 总览链 | [EAS 索引](./eas/README.md) | [Expo Application Services](https://docs.expo.dev/eas/) |
| 最新 SDK 参考链 | [Latest 参考索引](./versions-latest/README.md) | [Expo SDK reference: latest](https://docs.expo.dev/versions/latest/) |
| Expo / EAS 教程链 | [教程概览索引](./tutorial-overview/README.md) | [Overview of Expo and EAS tutorials](https://docs.expo.dev/tutorial/overview/) |
