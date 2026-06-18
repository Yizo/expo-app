# 术语表（Glossary of Terms）

## 文档解决的问题

本文档是 Expo 及跨平台应用开发领域的**术语速查手册**。当你在阅读 Expo 官方文档时遇到不理解的专业术语，可以在这里快速查找含义。

对于 React Web 开发者来说，这份术语表尤为重要——Expo 和 React Native 生态中有大量移动端特有的概念（如原生模块、预构建、模拟器等），这些在 Web 开发中不存在对应物。本文档将帮助你快速建立对这些概念的认知。

## 阅读前需要理解的背景知识

在阅读本术语表之前，需要了解以下基本背景：

- **React Native** 是使用 JavaScript/React 构建移动端应用的框架，与 React Web 共享组件化思想，但渲染目标不同——Web 渲染到 DOM，React Native 渲染到原生平台视图。
- **Expo** 是围绕 React Native 构建的工具和服务生态，简化了移动应用的开发、构建和部署流程。
- **移动端开发** 涉及 iOS（Apple）和 Android（Google）两个主要平台，每个平台都有自己的编程语言、包管理器和构建系统。

## 术语详解

以下按照原文分类，将所有术语按主题组织，便于理解它们之间的关系。

---

### 一、平台与操作系统

#### Android

Google 资助的移动操作系统，运行在 Google 品牌设备及其他厂商设备上。

> **对 Web 开发者的意义**：类似于 Web 开发中的"浏览器运行环境"之一。你需要针对 Android 平台进行构建和测试，就像 Web 开发中需要兼容 Chrome/Firefox 一样。

#### iOS

Apple 的操作系统，运行在 iPhone、iPad 和 Apple TV 上。Expo Go 支持 iPhone 和 iPad 上的 iOS。

> **对 Web 开发者的意义**：另一个主要移动端运行环境。与 Web 中的 Safari 兼容性测试类似，但 iOS 有更严格的审核和签名要求。

#### Apple capabilities（Apple 能力）

Apple 提供的云端服务（如推送通知、iCloud、Apple Pay 等），需要在 Apple 开发者门户中为特定应用手动激活。

> **对 Web 开发者的意义**：在 Web 开发中，启用某个 API（如 Geolocation）通常只需要浏览器支持。而在 iOS 中，你还必须在开发者门户中显式声明你的应用需要哪些能力，否则相关功能无法使用。

---

### 二、开发工具与 CLI

#### Expo CLI

Expo 的命令行界面。当前指的是项目本地安装的版本（Local Expo CLI），历史上曾指全局安装的版本。

> **核心用途**：通过 `npx expo start` 启动开发服务器、通过 `npx expo prebuild` 生成原生目录等。相当于 Web 开发中的 `npm run dev` 和 `npm run build`。

#### Local Expo CLI（本地 Expo CLI）

安装在项目本地的 CLI 包（随 `expo` 包一起安装），取代了已弃用的全局 CLI。

> **为什么重要**：全局 CLI 可能导致版本不一致问题。本地安装确保 CLI 版本与项目 SDK 版本匹配——这类似于 Web 项目中通过 `npx` 调用本地安装的 `webpack` 而非全局版本。

#### EAS CLI

与 EAS（Expo Application Services）服务交互的命令行工具。

> **核心用途**：执行云端构建（`eas build`）、提交应用到商店（`eas submit`）、发布 OTA 更新（`eas update`）等。

#### create-expo-app

用于引导创建新 React Native 应用的独立 CLI 工具，会自动预装 `expo` 包。

> **类比**：相当于 Web 开发中的 `create-react-app` 或 `npx create-next-app`。

#### create-expo-module

用于生成 Expo 原生模块或为已有模块添加平台支持的独立 CLI 工具。

> **用途**：当你需要编写自定义原生代码（Swift/Kotlin）并封装为 React Native 可用模块时使用。

#### create-react-native-app

用于初始化新 React Native 应用的独立 CLI，包含 `expo` 包和生成的原生代码，还支持从示例项目引导创建。

#### Expo Doctor

通过 `npx expo doctor` 执行的项目诊断工具，用于排查项目配置问题。

> **类比**：类似于 Web 开发中的 lint 工具，但专注于检查 Expo 项目的依赖兼容性和配置正确性。

#### Expo Atlas

一个可视化工具，用于检查 JavaScript 包体积并识别贡献体积的库。

> **对 Web 开发者的意义**：类似于 Web 开发中的 `webpack-bundle-analyzer`，帮助你分析哪些库占用了过多的包体积。

#### Expo Orbit

桌面应用程序，可加速在设备和模拟器上安装和启动构建产物、更新或 Snack 项目。

#### Expo MCP server

远程服务器，通过 Model Context Protocol（模型上下文协议）与 AI 工具集成，允许直接与 Expo 项目交互。

---

### 三、构建与部署服务（EAS 生态）

#### Expo Application Services（EAS）

深度集成于 React Native 和 Expo 应用的云服务套件，包括 Build、Submit、Update、Metadata、Insights、Hosting、Workflows 和 Observe。

> **对 Web 开发者的意义**：类似于 Vercel/Netlify 等 Web 部署平台，但专门服务于移动应用的全生命周期——从构建、更新到商店提交。

#### EAS Build

云端编译 Android 和 iOS 二进制文件的服务，可以生成开发构建和独立应用。

> **核心用途**：你不需要在本地安装 Xcode 或 Android Studio 就能构建应用——云端替你完成编译工作。

#### EAS Update

既指托管 OTA（空中下载）更新的云服务，也指用于将静态文件发布到该服务的 CLI 命令。

> **对 Web 开发者的意义**：类似于 Web 中的热部署——你可以通过 OTA 更新推送 JavaScript 代码变更，而无需重新提交应用到应用商店审核。

#### EAS Submit

将应用二进制文件提交到应用商店的服务（文档中在 EAS 概览里提及）。

#### EAS Metadata

以 JSON 格式管理 Apple App Store 元数据的 CLI 工具，简化 iOS 提交流程。

> **用途**：应用商店的应用描述、截图、分类等元数据可以通过配置文件管理，类似于用代码管理基础设施（Infrastructure as Code）的理念。

#### EAS Hosting

专为使用 Expo Router 和 React Native Web 创建的 Web 项目提供快速部署的云服务。

> **对 Web 开发者的意义**：类似于 Vercel/Netlify，但针对 Expo 的 Web 输出做了优化。

#### EAS Insights

通过分析库发送事件，提供性能、使用率和覆盖率分析数据的云服务。

#### EAS Observe

性能监控工具，追踪生产环境中的应用启动时间和可交互时间等指标。

> **类比**：类似于 Web 开发中的 Lighthouse/Web Vitals 监控。

#### EAS Workflows

CI/CD 服务，自动化执行二进制构建、OTA 更新、商店提交和 Web 部署等任务。配置存储在工作流目录中的 YAML 文件中。

> **类比**：类似于 GitHub Actions 或 GitLab CI/CD。

#### EAS Config

即 `eas.json` 文件，用于配置 EAS CLI。定义构建配置文件（如 development、preview、production）等。

#### Store config（商店配置）

配置 EAS Metadata 的文件，可以通过拉取现有 App Store 数据来生成。

---

### 四、项目配置文件

#### App config（应用配置）

位于项目根目录的配置文件，文件名可以是 `app.json`、`app.config.json`、`app.config.js` 或 `app.config.ts`。用于配置 CLI、生成用于更新的公共清单，以及列出影响原生代码生成的插件。

> **对 Web 开发者的意义**：类似于 Web 项目中的 `package.json` + `manifest.json` 的组合，但还额外控制原生代码的生成。这是 Expo 项目的核心配置文件。

#### app.json

应用配置文件的一种具体格式（纯 JSON 格式）。其他格式包括 `.config.js` 和 `.config.ts`，支持动态配置。

#### Expo Module Config（Expo 模块配置）

位于原生模块根目录的模块配置文件，用于声明模块的元数据和平台支持信息。

#### Manifest（清单）

类似于 Web 应用清单（Web App Manifest），向 Expo Go 提供运行应用所需的信息。

#### Slug

项目在你 Expo 账户中的 URL 友好的唯一标识符，在应用配置中定义。

> **类比**：类似于 GitHub 仓库名在 URL 中的作用，如 `expo.dev/@username/slug`。

---

### 五、原生代码与构建流程

#### Prebuild（预构建）

基于应用配置生成临时原生目录的过程，通过 `npx expo prebuild` 命令执行。

> **核心概念**：这是 Expo 的核心工作流之一。你维护应用配置（`app.json`），Prebuild 根据配置自动生成 `ios/` 和 `android/` 目录。这意味着你不需要手动维护原生代码。
>
> **类比**：类似于 Web 开发中的代码生成工具（如 Prisma 根据 schema 生成客户端代码），但生成的是原生项目文件。

#### Prebuild template（预构建模板）

预构建时使用的初始 React Native 项目模板，与 SDK 版本关联。Prebuild 命令会评估应用配置并在克隆的模板上运行 Config Mods。

#### Continuous Native Generation / CNG（持续原生生成）

一个抽象概念，描述从特定输入生成原生项目的过程。在 Expo 中，通过 Prebuild 命令实现。

> **核心理念**：原生目录不再是你手动维护的源代码，而是可以根据配置随时重新生成的产物。这类似于"基础设施即代码"的思想——原生目录是"构建产物"而非"源代码"。

#### Config Plugin（配置插件）

一个 JavaScript 函数，将 Config Mods 附加到应用配置中，用于预构建操作。

> **用途**：当你需要在预构建过程中修改原生代码（如添加权限声明、修改构建配置）时使用。类似于 Web 开发中的 webpack 插件，但作用于原生项目文件。

#### Config Mods（配置修改器）

添加到应用配置中的异步函数，用于预构建时修改各个原生文件。它们来自 config plugins 包并以链式方式执行。

#### Dangerous mods（危险修改器）

在预构建期间执行不稳定原生项目修改的配置修改器。它们不可预测，可能在 SDK 大版本更新时出问题。

> **警告**：应尽量避免使用，除非你完全理解其影响。

#### Config introspection（配置内省）

预构建结果的内存评估过程，不保存代码更改。用于确定自动能力签名所需的权限，以及在 VS Code 扩展中调试 Config Mods。

#### Auto capability signing（自动能力签名）

EAS Build 的一项功能，根据项目的权限文件（entitlements file）自动切换 Apple 能力。

> **对开发的影响**：简化了 iOS 签名流程——你不需要手动在 Apple 开发者门户中逐一启用和配置能力。

#### Native module（原生模块）

用原生语言（Swift/Kotlin）编写的代码，将平台功能暴露给 JavaScript 引擎。通常通过 `NativeModules` 导入访问。

> **对 Web 开发者的意义**：在 Web 中，浏览器 API（如 `navigator.geolocation`）由浏览器直接提供。在 React Native 中，类似的原生功能需要通过原生模块桥接到 JavaScript。Expo SDK 封装了大量常用原生模块。

#### Native directory（原生目录）

指 React Native Directory 网站，帮助开发者发现、评估和筛选生态中数千个库的兼容性。

#### Native runtime（原生运行时）

包含 JavaScript 引擎并能执行 React 应用的应用程序，包括浏览器、Expo Go 和独立构建版本。

---

### 六、开发环境与调试

#### Development build（开发构建）

应用的调试版本，包含 `expo-dev-client` 包。它突破了 Expo Go 的限制，允许使用自定义原生代码，是生产级应用的推荐开发方式。

> **对 Web 开发者的意义**：Expo Go 类似于浏览器（只能运行标准 Web API），而 Development build 类似于一个定制浏览器（支持你自己的浏览器扩展）。当你的应用需要自定义原生代码时，必须使用 Development build。

#### Dev clients（开发客户端）

开发客户端库，用于支持开发构建并包含实用工具。"Custom dev client" 是开发构建的另一种说法。

#### Expo Go

一个沙箱应用，用于实验 React Native 项目。由于无法包含自定义原生代码，生产环境推荐使用开发构建。

> **类比**：类似于 CodeSandbox 或 StackBlitz——一个开箱即用的运行环境，适合快速原型开发，但功能受限于预装的库集合。

#### Development server（开发服务器）

本地运行的服务器，通常通过 `npx expo start` 启动。一般运行在 8081 端口，提供一个清单，客户端通过该清单请求 JavaScript 包。

> **类比**：类似于 Web 开发中的 `webpack-dev-server` 或 Vite 的开发服务器。

#### Expo start

启动本地开发服务器的命令，客户端通过该服务器连接到 Metro bundler。

#### Emulator（模拟器）

在计算机上模拟 Android 设备的软件。iOS 的对应物通常称为 Simulator。

> **对 Web 开发者的意义**：类似于 Web 开发中的浏览器开发者工具的设备模拟功能，但提供完整的操作系统环境，可以安装和运行真实应用。

#### Simulator（模拟器）

运行在 macOS 或 Snack 上的 iOS 模拟器，允许在没有物理 Apple 设备的情况下进行开发。

> **注意**：iOS Simulator 只能在 macOS 上运行，不能在 Windows/Linux 上运行。这是 Web 开发者转向移动开发时常遇到的限制。

#### Snack

基于浏览器的开发环境，无需安装本地工具即可构建 Expo 应用。

> **类比**：类似于 CodeSandbox 或 JSFiddle，但专为 Expo/React Native 设计。

#### Expo export

导出命令，将 JavaScript 和资源打包到一个静态目录中，用于托管服务或离线嵌入原生运行时。

> **类比**：类似于 Web 开发中的 `npm run build`，生成可部署的静态文件。

---

### 七、JavaScript 引擎与打包工具

#### Metro bundler

Meta 的打包工具，将 JavaScript 和资源转换为原生运行时可用的格式，用于 React Native 和 Web 应用。

> **类比**：类似于 Web 开发中的 webpack 或 Vite（打包部分），但专门为 React Native 设计，处理平台特定文件解析等特殊逻辑。

#### Metro config（Metro 配置）

Metro 打包工具的配置文件。使用 Expo CLI 时，应该继承 Expo Metro config 包。

#### Babel

一个转译器，将运行时 JavaScript 引擎不支持的语言特性转换为兼容代码。Metro 内部使用它。项目可以通过 `babel.config.js` 调整配置（使用 CLI 时可选）。Expo 项目应继承默认预设。

> **注意**：在 Web 开发中你可能已经很熟悉 Babel。在 Expo 中，Babel 的配置方式类似，但需要确保继承 Expo 的默认预设，否则可能破坏平台兼容性。

#### Hermes engine

Meta 为 React Native 优化的 JavaScript 引擎，支持提前静态优化和紧凑字节码，提供更好的移动端性能。

> **对 Web 开发者的意义**：Web 中使用 V8（Chrome）或 SpiderMonkey（Firefox）执行 JavaScript。React Native 默认使用 Hermes，它针对移动设备的内存和性能约束做了优化。

#### JavaScriptCore engine

Apple 内置的 iOS JavaScript 引擎，也可用于 Android 以保持跨平台一致性。但缺少 Hermes 或 V8 的高级调试能力。

#### JavaScript engine（JavaScript 引擎）

在设备上执行 JavaScript 的原生包。React Native 主要使用 Meta 的 Hermes，也可使用 Apple 的 JavaScriptCore 和 Google 的 V8 作为替代方案。

#### webpack

已弃用的打包工具，之前 CLI 用它来开发 React Native Web 应用。

> **注意**：已被 Metro 取代。如果你之前的 Web 项目使用 webpack，在 Expo 中应切换到 Metro。

#### Remote Debugging（远程调试）

已弃用的调试方法，在 Chrome web worker 中执行 JavaScript。现代替代方案是使用 Hermes 配合 React Native DevTools。

> **重要**：如果你在网上看到旧教程提到"远程调试"，请注意这种方式已被弃用。应使用 React Native DevTools 进行调试。

---

### 八、包管理与依赖

#### npm

JavaScript 包管理器，也是存储这些包的注册中心。

#### Yarn

Meta 创建的 JavaScript 包管理器，有两个主要版本：Classic（1.x）和 Berry（2.x+）。

#### Bun

JavaScript 运行时，可直接替代 Node.js，同时也作为包管理器使用。

#### pnpm

针对磁盘空间效率优化的 JavaScript 包管理器。

#### Package manager（包管理器）

自动化依赖安装、配置和移除的工具。

> **对 Web 开发者的意义**：这些包管理器你在 Web 开发中应该已经接触过。在 Expo 项目中，你可以选择任何一个，但需注意不同包管理器可能在某些原生依赖安装时表现不同。

#### Expo install

安装命令，添加与当前 `expo` 版本兼容的含原生模块的 npm 包。它包装了全局包管理器。

> **重要**：在 Expo 项目中，安装包含原生代码的包时，应使用 `npx expo install` 而非 `npm install`。它会自动选择与当前 Expo SDK 版本兼容的包版本，避免原生代码不兼容问题。

#### Package manager workspaces（包管理器工作空间）

Expo 推荐的 monorepo 方案，允许使用支持的包管理器配置工作空间。

#### Autolinking（自动链接）

一个跨平台工具，使用原生包管理器自动将原生模块连接到应用。在 Android 上，它在 Gradle 同步期间通过构建文件运行；在 iOS 上，在 `pod install` 期间通过 Podfile 执行。有两个变体：Expo 版本和 Community fork。默认的 prebuild 模板同时支持两者。

> **对 Web 开发者的意义**：在 Web 中，`import` 一个 npm 包就能使用。在 React Native 中，包含原生代码的包还需要"链接"到原生项目中。Autolinking 自动化了这个过程，你只需安装包，它会自动完成原生端的配置。

#### Expo Autolinking

原始的自动链接系统，用于核心模块项目，基于库根目录中的特定配置文件链接模块。

#### Community Autolinking

React Native 社区对 Expo Autolinking 系统的分支。虽然模块链接要求不同，但底层实现相同。

---

### 九、导航与路由

#### Expo Router

基于文件的路由解决方案，适用于 Web 和 React Native 应用，使用共享组件实现跨平台无缝导航。

> **类比**：类似于 Next.js 的文件系统路由，但同时支持移动端和 Web 端。

#### React Navigation

React Native 的首选导航库，由 Expo 团队赞助和开发。

> **注意**：Expo Router 底层使用 React Navigation。如果你直接使用 React Navigation，需要手动配置；如果使用 Expo Router，路由会自动基于文件结构生成。

#### Linking（链接）

可以指应用内的深度链接（deep linking），也可以指原生模块的自动链接过程。

> **对 Web 开发者的意义**：深度链接类似于 Web 中的 URL 路由——允许通过 URL 直接打开应用内的特定页面。

---

### 十、框架与渲染

#### React Native

使用 JavaScript 和 React 声明式组件设计构建移动应用的框架。

> **核心区别**：React Web 将组件渲染为 DOM 元素（`<div>`、`<span>` 等），React Native 将组件渲染为原生平台视图（iOS 的 `UIView`、Android 的 `android.view.View`）。

#### React Native Web

基于 DOM 的抽象层，允许 React Native 基础组件在浏览器中运行。目前驱动 X（Twitter）的主站，Expo 完全支持。

> **对 Web 开发者的意义**：这意味着你可以用 React Native 的组件（如 `View`、`Text`）编写代码，然后通过 React Native Web 在浏览器中运行——实现真正的跨平台代码共享。

#### Fabric

React Native 的渲染系统，负责创建和管理原生视图。

> **类比**：类似于 React 的 Fiber 架构（协调器），但专门处理原生视图的创建和更新。

#### Yoga

原生跨平台库，为 React Native 视图提供 CSS FlexBox 支持，处理屏幕布局和样式。

> **对 Web 开发者的意义**：你在 Web 中使用的 Flexbox 布局（`display: flex`、`flexDirection`、`justifyContent` 等），在 React Native 中通过 Yoga 引擎实现。布局语法非常相似，但 React Native 默认使用 Flexbox（而非 `display: block`）。

#### Entry point（入口点）

加载应用的初始 JavaScript 文件。默认指向 AppEntry 文件，该文件导入根 App 文件并将其注册为起始组件。

> **类比**：类似于 Web 项目中的 `index.js` 或 `main.tsx`。

#### Platform extensions（平台扩展）

Metro bundler 的功能，根据平台特定的文件名替换文件，按特定顺序解析 Android、iOS 和 Web 扩展名。

> **示例**：如果你有三个文件 `Button.tsx`、`Button.ios.tsx`、`Button.android.tsx`，Metro 会根据当前运行平台自动选择正确的文件。类似于 Web 开发中的条件导入，但是自动的、基于文件名的。

---

### 十一、应用发布与更新

#### Publish（发布）

部署应用的同义词，使应用通过持久 URL 可用，或更新独立应用。

#### Standalone app（独立应用）

生产就绪的应用二进制文件，适合提交到应用商店，与 production build（生产构建）同义。

#### Updates（更新）

一种通过 OTA（空中下载）方式推送应用变更的机制，无需向应用商店提交新的二进制文件。

> **对 Web 开发者的意义**：类似于 Web 部署——你推送新的 JavaScript 代码，用户下次打开应用时自动获取更新。这避免了应用商店审核的等待时间。但注意，OTA 更新只能更新 JavaScript 和资源文件，不能更新原生代码。

#### Bare workflow（裸工作流）

已弃用的方式，手动维护原生目录并在 Git 中进行版本控制。这是传统 React Native 应用的典型方式，但维护开销很高。推荐的替代方案是使用应用配置和 Prebuild，通过持续原生生成按需生成原生项目。

> **重要**：如果你之前看到的 React Native 教程涉及手动管理 `ios/` 和 `android/` 目录，那就是裸工作流。Expo 推荐的现代方式是 CNG（持续原生生成），让原生目录成为可再生的构建产物。

---

### 十二、开发者门户与签名

#### Apple Developer Portal（Apple 开发者门户）

Apple 管理代码签名的官方门户。EAS Credentials 会自动处理该站点上大多数典型的开发者任务。

> **对 Web 开发者的意义**：Web 应用通常只需要 SSL 证书。而 iOS 应用需要复杂的代码签名流程——开发者证书、配置文件、设备 UDID 等。Apple Developer Portal 就是管理这些内容的地方。

---

### 十三、开发辅助工具与生态

#### VS Code Expo Tools

VS Code 扩展，为 app、store、module 和 EAS 配置文件提供自动补全，增强开发者体验。

> **推荐安装**：如果你使用 VS Code 开发 Expo 项目，强烈建议安装此扩展，可以大幅提升配置文件编辑效率。

#### FYI

托管在专用子域名上的一组针对复杂问题的专业解决方案，在开发者工具中使用以提升用户体验。

#### Watchman

Meta 维护的文件监视守护进程，Metro 可以用它来爬取项目文件。但全局安装可能导致原生代码问题。

> **注意**：Watchman 在 macOS 上通常通过 Homebrew 安装。如果遇到文件监视相关的问题（如热重载不生效），检查 Watchman 是否正常运行。但不要全局安装，以免干扰原生构建。

#### Monorepo（单一代码仓库）

包含多个关联子项目的项目结构，适合维护跨平台应用的代码库。

> **对 Web 开发者的意义**：如果你在 Web 开发中使用过 monorepo（如 Turborepo、Nx），Expo 也支持类似的 monorepo 结构，使用包管理器工作空间来管理多个子项目。

---

### 十四、Expo SDK 与模块

#### Expo SDK

一组提供设备功能原生模块的 npm 包集合。支持多平台、使用 TypeScript，可安全集成到任何 React Native 应用中。

> **类比**：类似于 Web 开发中的浏览器 API 封装库，但提供的是移动端设备功能（相机、GPS、传感器等）。

#### Expo Modules API

跨平台接口，用于编写 Swift 和 Kotlin 原生模块，由核心 modules 库提供。

#### Sweet API

用于创建 React Native 模块的 Kotlin 和 Swift 接口，由核心 modules 库提供。是 Expo Modules API 的底层实现名称。

#### Expo Fingerprint

一个库，用于对决定项目原生构建的文件和配置进行哈希计算。该哈希确保包与特定构建的兼容性，主要服务于 EAS Update 和 Workflows。

> **用途**：当你发布 OTA 更新时，Fingerprint 帮助判断当前更新是否与用户设备上的原生构建兼容。如果不兼容（例如原生代码已变更），则需要重新构建应用。

---

### 十五、其他概念

#### TypeScript

强类型的 JavaScript 超集，推荐用于 Expo 开发，因为整个 SDK 都用 TypeScript 编写。

> **对 Web 开发者的意义**：如果你在 Web 开发中已经使用 TypeScript，在 Expo 中可以无缝衔接，体验一致。

#### Meta

前身是 Facebook，开发维护 React Native、Metro、Hermes 和 Yoga 等核心项目。Expo 与 Meta 密切合作。

#### Software Mansion

波兰开发机构，维护 React Native 核心库，其承包商组成了 Expo 的平台团队。

#### Experience（体验）

应用的术语，通常暗示较小的、单次使用的或艺术性质的范围。

> **说明**：这是 Expo 社区中的传统用语，在新文档中已较少使用，更多直接使用"app"（应用）。

#### Expo client（Expo 客户端）

Expo Go 应用的旧名称。

---

## 注意事项、限制条件和坑点

### 已弃用 / 不推荐使用的术语和工具

以下工具或方式已被弃用，如果你在网上看到旧教程仍在使用，请注意更新认知：

| 已弃用项 | 替代方案 |
|----------|---------|
| Bare workflow（裸工作流） | CNG（持续原生生成）+ Prebuild |
| Remote Debugging（远程调试） | Hermes + React Native DevTools |
| webpack（作为打包工具） | Metro bundler |
| 全局 Expo CLI | Local Expo CLI（本地安装） |

### 容易混淆的术语对

- **Emulator vs Simulator**：Emulator 指 Android 模拟器，Simulator 指 iOS 模拟器。功能相似但底层实现不同。
- **Expo Go vs Development build**：Expo Go 是受限的沙箱环境，Development build 是完整的开发版本。生产级应用应使用后者。
- **App config vs EAS Config**：App config（`app.json` 等）配置应用本身，EAS Config（`eas.json`）配置 EAS 云服务。
- **Expo SDK vs Expo CLI**：SDK 是功能库的集合（你 `import` 使用的），CLI 是命令行工具（你在终端中运行的）。
- **Publish vs EAS Update**：Publish 是泛指"部署"，EAS Update 是具体的 OTA 更新服务和命令。

---

## React Web 开发者需要特别注意的地方

1. **原生模块的概念**：Web 中的浏览器 API 是标准化的，而移动端需要通过"原生模块"桥接原生功能到 JavaScript。这是移动开发中最核心的差异之一。

2. **包的安装方式**：在 Expo 项目中安装含原生代码的包时，应使用 `npx expo install` 而非 `npm install`，以确保版本兼容性。

3. **构建流程的差异**：Web 项目的构建产物是静态文件（HTML/CSS/JS），而移动应用的构建产物是二进制文件（`.apk`/`.ipa`），构建过程更复杂，涉及代码签名。

4. **OTA 更新的边界**：OTA 更新只能推送 JavaScript 和资源文件的变更。如果修改了原生代码（添加了新的原生模块、修改了原生配置），必须重新构建并重新提交到应用商店。

5. **平台扩展文件名**：Metro 会根据文件名后缀（`.ios.tsx`、`.android.tsx`、`.web.tsx`）自动选择平台特定文件。这在 Web 打包工具中需要额外配置才能实现，但在 Expo 中是内置功能。

6. **模拟器限制**：iOS Simulator 只能在 macOS 上运行。如果你在 Windows/Linux 上开发，无法直接运行 iOS 模拟器（但可以使用 Expo Go 在真机上测试）。

---

## 实际开发建议

1. **日常开发中**，将此文档作为速查手册。遇到不熟悉的 Expo 术语时回来查阅，建立对生态全景的理解。

2. **开始新项目时**，重点关注以下术语及其关系：App config、Prebuild、CNG、EAS Build、Development build、Metro bundler。这些构成了 Expo 开发的核心工作流。

3. **安装依赖时**，始终使用 `npx expo install` 来安装包含原生代码的包，避免手动指定版本号。

4. **调试时**，使用 Hermes + React Native DevTools，不要使用已弃用的 Remote Debugging。

5. **选择开发环境时**：
   - 快速原型/学习 → Expo Go
   - 生产级开发 → Development build
   - 无本地环境 → Snack

---

## 总结

本文档覆盖了 Expo 和跨平台应用开发领域的核心术语，涵盖以下主要方面：

- **平台基础**：Android、iOS 及其生态系统
- **开发工具链**：CLI 工具、Metro 打包工具、Babel 转译器
- **构建与部署**：EAS 全套云服务（Build、Update、Submit 等）
- **原生代码管理**：Prebuild、CNG、Config Plugins 等现代方式
- **JavaScript 引擎**：Hermes（推荐）、JavaScriptCore、V8
- **导航路由**：Expo Router、React Navigation
- **应用发布**：OTA 更新、独立应用、商店提交

对于 React Web 开发者来说，最关键的理解转变是：移动应用涉及原生代码层，而 Expo 通过 CNG 和 Prebuild 等机制，让你尽量不直接接触原生代码，同时保持对原生能力的完全访问。

---

## 文档导航

- **上一页**：[release statuses](./249__release-statuses.md)
- **下一页**：无
