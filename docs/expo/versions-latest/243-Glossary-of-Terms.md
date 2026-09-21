# 243｜Expo 术语表

**翻页：**[上一页：Expo 发布状态](./242-Release-Statuses.md) · [目录](./README.md) · [下一页：React Native 中文主文档索引（跨模块）](../../react-native/README.md)

**官方页面：**[Glossary of terms · Expo](https://docs.expo.dev/more/glossary-of-terms/)

**官方链边界：**Expo 术语表的官方 Next 是跨站的 React Native 文档入口。本页整理完后，Expo versions/latest 这条官方 Next 链到此结束；本地阅读可从上方链接的 React Native 主文档索引继续。

## 术语速查

以下释义按 Expo 官方 Glossary 的字母顺序重写；旧术语或容易混淆的概念会标明当前边界。

| 官方术语 | 中文释义与新手提示 |
| --- | --- |
| **Android** | Google 主导的移动操作系统。本地开发常用 Android 模拟器或 Android 真机运行 React Native App。 |
| **App config** | 项目根目录的应用配置，可用 app.json、app.config.json、app.config.js 或 app.config.ts。它影响 Expo CLI、OTA manifest，以及 Prebuild 用来生成原生项目的 config plugins。 |
| **app.json** | 一种静态 App config 文件；需要动态逻辑时可改用 JS / TS 配置文件。 |
| **Apple capabilities** | Apple 提供给 App 的系统云服务或权限能力，例如某些 iCloud / Push 功能；需要在 Apple Developer Portal 为 App 启用并配置 entitlement。 |
| **Apple Developer Portal** | Apple 管理 App 身份、签名证书、Provisioning Profile 与 capabilities 的网站。EAS Credentials 可以自动化常见签名材料的创建与管理。 |
| **Auto capability signing** | EAS Build 根据项目 entitlement 自动开关相应 Apple capability，减少手工维护签名配置。 |
| **Autolinking** | 自动将原生依赖接入 iOS / Android 工程的机制。Android 通过 Gradle 项目同步发现模块；iOS 通过 Podfile 与 pod install 接入。Expo Autolinking 和 Community Autolinking 是两种实现。 |
| **Babel** | JavaScript 转换器，可把当前运行时不支持的语法转换为可运行代码；Metro 内部会用它。使用 Expo CLI 时 babel.config.js 往往可选，若自定义配置应继承 babel-preset-expo。 |
| **Bare workflow（旧术语）** | 旧称：把 ios / android 原生目录提交版本控制并手动维护。Expo 已不再把项目分成 managed / bare；现在所有 Expo 项目都围绕 CNG 工作，需要原生目录时运行 Prebuild。手工维护原生目录仍是接入既有 React Native 工程的一种方式，但维护成本更高。 |
| **Bun** | JavaScript runtime，也可作为 JavaScript 包管理器替代 Node.js / npm；可用于 Expo 项目与 EAS。 |
| **CocoaPods** | iOS 原生依赖管理器。Podfile 描述要链接的模块，pod install 将它们接入 Xcode 工程。 |
| **Community Autolinking** | React Native 社区维护的 Autolinking fork。和 Expo Autolinking 的模块识别要求略有不同，但目标都是让原生包自动接入 App。 |
| **Config introspection** | 在内存里模拟求值 Prebuild 结果，但不写出原生文件。可预览 entitlement / Info.plist 最终样子，或排查 config mods。 |
| **Config Mods** | 由 Expo 配置插件追加的一组异步函数；每个 modifier 修改一个具体原生文件，例如 Info.plist 或 AndroidManifest.xml。多个 mods 会按链式顺序执行。 |
| **Config Plugin** | 配置插件是 JavaScript 函数，用来向 App config 注册 config mods，使 Prebuild 能以可复现方式改原生项目。 |
| **Continuous Native Generation（CNG）** | 根据 App config、插件、依赖等输入生成原生 iOS / Android 工程的理念；Expo 中由 npx expo prebuild 实现。 |
| **create-expo-app** | 新建 Expo / React Native 项目的独立 CLI，会一并设置 Expo 依赖与模板；详见本地 [创建项目页](./239-Create-Expo-App.md)。 |
| **create-expo-module** | 生成 Expo native module，或为已有模块添加平台文件的独立 CLI；详见本地 [模块生成页](./240-Create-Expo-Module.md)。 |
| **create-react-native-app** | 官方术语名：指生成已集成 expo package 并生成原生代码的 React Native 项目 CLI，也支持从 expo/examples 选择示例。当前页面列举的实际命令使用 create-expo-app、yarn create expo-app 或 npm create expo-app。 |
| **Dangerous mods** | Prebuild 阶段直接修改原生项目的低层 modifier，可能依赖不稳定实现并在 SDK 大版本升级时失效；除非普通 config plugin 无法满足，不要优先使用。 |
| **Development build** | 带有 expo-dev-client 的自定义 App 调试构建。它能包含当前项目所需原生模块和开发工具，突破 Expo Go 的固定原生模块限制。Development build 是生产级 Expo App 推荐的开发流程；发布商店时还要另做 production build。 |
| **Dev clients** | expo-dev-client 包及相应自定义开发客户端；有时也作为 development build 的同义说法。 |
| **Development server** | 本机启动的开发服务器，通常运行 npx expo start。默认常见地址为 http://localhost:8081；它提供 manifest，并由客户端请求 Metro 输出的 JavaScript bundle。 |
| **Expo Application Services（EAS）** | Expo 的云服务集合，包括 EAS Build、Submit、Update、Metadata、Insights、Hosting、Workflows、Observe 等服务。 |
| **EAS Build** | 云端编译 iOS / Android App binary 的服务，可构建 development build，也可构建商店生产包。 |
| **EAS CLI** | 从终端管理 EAS 项目、构建、更新、提交和账户等操作的命令行工具。 |
| **EAS Config** | eas.json 配置文件；为 EAS CLI 的 build profile 与自动化参数提供配置。 |
| **EAS Hosting** | 托管 Expo Router Web 项目或 React Native Web 静态站点的 Expo 云服务。 |
| **EAS Insights** | 收集并展示项目使用、性能和触达数据的服务；App 可用 expo-insights 上报事件。 |
| **EAS Metadata** | 通过 EAS CLI 上传 / 下载 App Store Connect 元数据的工具，可减少 iOS 上架资料的手工步骤。 |
| **EAS Observe** | 生产性能监控服务；观察冷 / 热启动、首屏、可交互时间，也可记录自定义事件。 |
| **EAS Update** | 既指托管 OTA（over-the-air）更新的云服务，也指发布静态 JS / asset 内容的 eas update CLI 命令。 |
| **EAS Workflows** | 自动化 build、OTA update、商店提交、Maestro E2E 与 Web 部署等任务的 CI/CD 服务；工作流定义为 .eas/workflows 里的 YAML 文件。 |
| **Emulator** | 通常指电脑上的 Android 软件模拟设备。iOS 对应的模拟设备通常称 Simulator。 |
| **Entry point** | App 首个被加载和注册的 JavaScript 文件。默认 Expo 入口是 node_modules/expo/AppEntry.js，它再引入项目根目录的 App.js 并注册主组件。 |
| **Experience** | 有时用来泛指一个 App，尤其是面向单一任务、范围小或偏创意体验的应用。 |
| **Expo Atlas** | 用图形查看 JavaScript bundle 构成的工具，可分析包体大小以及哪些库占据体积。 |
| **Expo Autolinking** | Expo Modules API 的原生依赖发现机制；通常通过模块根目录的 expo-module.config.json 识别包并写入平台工程。 |
| **Expo CLI** | Expo 项目命令行工具；当前版本随项目 expo 包安装。 |
| **Expo client** | Expo Go 的旧名称。 |
| **Expo Doctor** | 用于诊断 Expo 项目配置和依赖问题的 CLI，可在项目根目录运行 npx expo doctor。 |
| **Expo export** | npx expo export 将 JS 和资源打包到静态目录，可发布为 OTA 更新，也可嵌入原生 runtime 供离线使用。 |
| **Expo Fingerprint** | @expo/fingerprint 根据依赖、原生代码、原生工程与配置计算项目原生层哈希；更新系统可据此判断 JS bundle 是否匹配已有 build。 |
| **Expo Go** | Expo 提供的 iOS / Android 通用学习客户端，包含固定的一组原生模块。它不能塞入任意自定义原生代码，不适合直接作为生产 App 发布；需要额外原生模块时使用 development build。 |
| **Expo install** | npx expo install 会按项目当前 Expo / React Native 版本为常见原生包选择兼容版本。它包装 npm、Yarn、pnpm、Bun 等包管理器；并非所有包都在兼容性数据库中。 |
| **Expo MCP server** | Expo 托管的远程 Model Context Protocol 服务，可让 AI 辅助工具直接访问 Expo 项目相关能力。 |
| **Expo Module Config** | 原生模块根目录里的 expo-module.config.json，供 Autolinking 识别包支持的平台与入口。 |
| **Expo Modules API** | 在 Swift / Kotlin 原生代码中实现跨平台模块的 API；底层由 expo-modules-core 提供，该库随 expo package 安装。 |
| **Expo Orbit** | Expo 桌面工具，帮助在设备 / 模拟器安装或启动来自 EAS、文件或 Snack 的 build / update。 |
| **Expo Router** | Expo 的文件路由系统，为 React Native 和 Web App 管理 screen 导航；可以跨 Android、iOS、Web 复用界面组件。 |
| **Expo SDK** | Expo 官方原生模块 npm 包集合，覆盖相机、推送、联系人、文件等设备能力。包以 TypeScript 提供一致接口，尽可能跨平台；也可在已集成 Expo Modules 的其他 React Native 项目中使用。 |
| **Expo start** | npx expo start 命令；启动本地开发服务器，让客户端连接 Metro 获取代码。 |
| **Fabric** | React Native renderer（渲染系统），将 React 组件布局与更新映射到 Android / iOS 原生 View。 |
| **FYI / Expo FYI** | Expo 为常见复杂配置、签名与排错场景提供的简短解决方案链接集合；CLI 或文档会用这些链接快速引导。 |
| **Gradle** | Android 构建系统，负责编译、测试、打包和发布 App。 |
| **Hermes engine** | Meta 面向 React Native 移动端优化的 JavaScript 引擎；常使用字节码和静态优化，通常是 RN 默认引擎。 |
| **iOS** | Apple 为 iPhone、iPad、Apple TV 等设备提供的操作系统；Expo Go 运行于 iPhone / iPad。 |
| **JavaScript engine** | 在设备上执行 JavaScript 的原生 runtime 组件。React Native 常用 Hermes，也可使用 Apple JavaScriptCore 或 V8。 |
| **JavaScriptCore engine** | Apple 的 JavaScript 引擎，内置于 iOS；Android 也可使用对应实现。调试协议支持不如 Hermes / V8 完整。 |
| **Linking** | 既可能指用 URL deep link 打开 App 页面，也可能泛指原生模块 Autolinking；需按上下文区分。 |
| **Local Expo CLI** | 安装在项目 expo package 中的 @expo/cli，可用 npx expo 执行。它是随 SDK 锁定的本地 CLI，取代已弃用的全局 expo-cli。 |
| **Manifest** | 描述 Expo App 名称、入口、资源、scheme 等启动信息的对象；Expo Go 等客户端会先读取它再加载 bundle。 |
| **Meta** | 原 Facebook 公司。React Native、Metro、Hermes、Yoga 等项目由 Meta 开发维护，并与 Expo 合作。 |
| **Metro bundler** | React Native bundler（打包器），解析 JS 依赖、转换代码和资源，为设备生成可运行 bundle；Web 也可以使用 Metro。 |
| **Metro config** | metro.config.js 配置文件；Expo CLI 项目通常继承 @expo/metro-config，以启用 Expo 的 resolver 与 transformer 约定。 |
| **Monorepo** | 一个仓库管理多个相互关联子项目，并由包管理器 workspace 共享依赖或本地包的组织形式。 |
| **Native directory（React Native Directory）** | 一个用于查找 React Native 社区库的网站，不是项目里的 android / ios 原生源码文件夹。它帮助筛选平台支持与 Expo 兼容的依赖。 |
| **Native module** | 用 Swift、Kotlin 等原生语言实现，再把设备系统能力暴露给 JavaScript 的模块。旧 RN 入口可通过 NativeModules 访问；Expo Modules API 提供另一套跨平台实现方式。 |
| **Native runtime** | 能运行 React 应用的宿主与 JS 引擎组合，包括 Expo Go、development build、商店 production app；浏览器也能作为 Web runtime。 |
| **npm** | JavaScript 包管理器，也是保存 npm package 的公共 registry。 |
| **Package manager** | 安装、升级、移除与锁定项目依赖的工具，如 npm、Yarn、pnpm、Bun。 |
| **Package manager workspaces** | npm / Yarn / pnpm 等管理多个本地 package 的 workspace 功能；Expo 推荐用它组织 monorepo。 |
| **Platform extensions** | Metro 根据文件名后缀为不同平台选择对应文件；例如 Page.ios.tsx 用于 iOS，Page.android.tsx 用于 Android，Page.web.tsx 用于 Web。 |
| **pnpm** | 以磁盘空间效率见长的 JavaScript 包管理器；可通过 workspace 在 monorepo 中组织子包。 |
| **Prebuild** | npx expo prebuild 根据 App config / 插件生成临时或可提交的 ios 与 android 原生目录。 |
| **Prebuild template** | CNG 起始用的原生工程模板，版本与 Expo SDK 对齐。Prebuild 复制模板后，读取 App config 并运行 config mods；可用 --template 换模板，但默认模板含 Prebuild 会依赖的基础设置。 |
| **Publish** | Expo 文档中常作 deploy（部署）的同义词：发布后的 Expo Go 项目可通过固定 URL 访问；Standalone app 则通过发布更新来更新已安装 App。 |
| **React Native** | 用 JavaScript / TypeScript 写声明式组件，再把 UI 显示成 Android / iOS 原生控件的框架；它复用 React 的组件与 state 模型，但不是在手机上运行 DOM。 |
| **React Native Web** | 将 React Native 基础组件映射到浏览器 DOM 的兼容层，让一套组件能在 Web 与原生复用。 |
| **React Navigation** | Expo 团队开发并支持的 React Native 首选导航库；用 Stack、Tab、Drawer 等 Navigator 管理界面跳转。 |
| **Remote Debugging** | 旧版调试方式：把 JS 放到 Chrome worker 执行，再经 WebSocket 发送原生命令；已弃用，优先使用 Hermes 与 React Native DevTools。 |
| **Simulator** | Apple 平台的软件模拟设备，可在 macOS Xcode 中运行；无需实体设备即可安装调试 iOS App。 |
| **Slug** | App config 中对 URL 友好的项目短名，在 Expo 账户内具有唯一性；用于生成一些 Expo URL / scheme。 |
| **Snack** | Expo 浏览器在线开发环境，可在网页中编辑、运行和分享 Expo 示例，无需先在电脑或手机安装开发工具。 |
| **Software Mansion** | 波兰软件开发公司，维护 React Native Gesture Handler、Screens、Reanimated 等重要库；Expo 平台团队也与其合作。 |
| **Standalone app** | 已编译的生产 App binary，可提交 Google Play / Apple App Store 或其他渠道安装；不等同 Expo Go。 |
| **Store config** | store.config.json 文件，为 EAS Metadata 提供商店信息；可从现有 App Store Connect 记录拉取数据生成。 |
| **Sweet API** | Expo Modules API 的 Swift / Kotlin 原生实现接口，用于创建 React Native 原生模块；随 expo 包内的 expo-modules-core 提供。 |
| **TypeScript** | JavaScript 的静态类型扩展，能在编辑阶段检查常见错误并改善补全；Expo SDK 主要使用 TypeScript 编写。 |
| **Updates** | OTA 更新允许发布兼容的 JS / 资源改动，不必每次都向 App Store / Google Play 提交新 binary；原生模块变更通常仍需新 build。 |
| **VS Code Expo Tools** | VS Code 扩展，为 App config、EAS config、Expo Module Config、Store config 提供自动补全与诊断。 |
| **Watchman** | Meta 的文件观察服务；Metro 可用它快速追踪文件变化。全局安装含原生代码，有时会导致版本或环境冲突。 |
| **webpack** | 旧版 Expo Web bundler，现已弃用；新 Expo Web 通常使用 Metro。 |
| **Yarn** | JavaScript 包管理器，常见版本有 Yarn v1 Classic 与 Yarn Modern / Berry；Modern 包管理配置与 RN 依赖解析需要注意 PnP 限制。 |
| **Yoga** | React Native 使用的跨平台布局引擎，按 Flexbox 等样式规则计算原生 View 的位置和尺寸。 |

## 常见命令与代码形态

Glossary 原页没有 fenced code blocks，但以下短命令与导入语句嵌在术语定义中，便于初学者集中辨认。

**Expo CLI 命令：**

```sh
npx expo start
npx expo install expo-camera
npx expo doctor
npx expo export
npx expo prebuild
npx expo prebuild --template /path/to/template
```

**建项目命令：**

```sh
npx create-expo-app
yarn create expo-app
npm create expo-app
```

**旧式 NativeModules 入口：**

```ts
import { NativeModules } from 'react-native';

const { MyModule } = NativeModules;
```

**Prebuild / EAS Metadata 常见文件与命令：**

```text
app.json
app.config.js
babel.config.js
metro.config.js
eas.json
store.config.json
expo-module.config.json
eas metadata:pull
```

**Metro 平台后缀搜索优先级：**

```text
Android: File.android.tsx → File.native.tsx → File.tsx
iOS:     File.ios.tsx     → File.native.tsx → File.tsx
Web:     File.web.tsx     → File.tsx
```

## 源页代码主题覆盖

官方 Glossary 没有 fenced code examples；条目中出现的 Expo CLI 命令、创建项目命令、NativeModules 导入、项目配置文件名、Prebuild template 选项、Store metadata 命令和 Metro 平台后缀均集中重写在 5 个本地代码块中。术语表覆盖官方列出的 95 个词条，并补充 React 前端开发者理解原生运行时、自动链接、CNG、构建渠道和导航时需要的上下文。

**Expo 链终点：**Expo 官方页脚 Next 跨到 React Native 文档。本地继续阅读 [React Native 中文主文档索引](../../react-native/README.md)。

**翻页：**[上一页：Expo 发布状态](./242-Release-Statuses.md) · [目录](./README.md) · [下一页：React Native 中文主文档索引（跨模块）](../../react-native/README.md)
