> **原始文档地址**：https://docs.expo.dev/router/introduction/

# Expo Router 简介

Expo Router 是一个开源路由库，专为基于 Expo 构建的通用（Universal）React Native 应用而设计。

Expo Router 是一个基于文件系统的路由器，适用于 React Native 和 Web 应用。它允许你管理应用中不同屏幕之间的导航，让用户在应用界面的各个部分之间无缝切换，并且可以在多个平台（Android、iOS 和 Web）上使用相同的组件。

Expo Router 将 Web 领域最优秀的文件系统路由概念引入到通用应用中 —— 让你的路由在每个平台上都能正常工作。当文件被添加到 **app** 目录时，该文件会自动成为导航中的一个路由。

> **关键术语解释（面向初学者）**：
>
> - **路由（Route）**：应用中一个可访问的页面或屏幕。类似于网站中的 URL 路径（如 `/about`），在 Expo Router 中，路由由 `app` 目录下的文件结构自动定义。
> - **通用应用（Universal App）**：指一套代码同时运行在 Android、iOS 和 Web 三个平台上的应用。
> - **基于文件的路由（File-based Routing）**：路由不是通过手写代码定义的，而是根据文件系统中的文件位置自动生成的。例如，`app/profile.tsx` 文件会自动对应 `/profile` 路由。
> - **app 目录**：Expo Router 项目中的核心目录，放置在此目录下的每个文件都会自动变成一个路由页面。

## 快速开始

我们推荐使用 `create-expo-app` 创建一个新的 Expo 应用，该命令会创建一个已经安装并配置好 Expo Router 的项目：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56

# yarn
yarn create expo-app --template default@sdk-56

# pnpm
pnpm create expo-app --template default@sdk-56

# bun
bun create expo --template default@sdk-56
```

> **注意：** 在 SDK 56 过渡期内，不带 `--template` 标志的 `create-expo-app@latest` 会创建一个 SDK 54 项目。如果你计划在物理设备上使用 Expo Go，请使用 SDK 54 项目。否则，请使用 `--template default@sdk-56` 来创建 SDK 56 项目。

> **基于经验建议**：如果你不确定该选哪个 SDK 版本，建议优先使用 SDK 56 模板（即加上 `--template default@sdk-56`），因为新版本通常包含更多功能和修复。只有在必须使用 Expo Go 在真机上调试时才选择 SDK 54。

现在，你可以通过运行以下命令来启动项目：

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

- 要在移动设备上查看你的应用，我们建议先从 [Expo Go](/get-started/set-up-your-environment.md#how-would-you-like-to-develop) 开始。随着应用复杂度的增长，当你需要更多控制时，可以创建 [开发构建（development build）](/develop/development-builds/introduction.md)。
- 在终端 UI 中按 **W** 键可以在 Web 浏览器中打开项目。按 **A** 键打开 Android（需要安装 Android Studio），或按 **I** 键打开 iOS（需要 macOS 系统并安装 Xcode）。

> **关键术语解释（面向初学者）**：
>
> - **Expo Go**：Expo 提供的官方移动端预览工具，可以在手机或模拟器上快速预览你的应用，无需完整的原生构建流程。
> - **开发构建（Development Build）**：一种更接近生产环境的构建方式，允许你使用自定义原生模块，同时保留开发时的热更新等便利功能。

## 学习资源

- [Expo 教程](/tutorial/introduction.md) —— 一步步指导你构建一个可在 Android、iOS 和 Web 上运行的 Expo 应用。
- [Expo Router API 参考](/versions/latest/sdk/router.md) —— API 组件、Hook、方法以及配置选项的完整参考。
- [Expo Router 视频教程播放列表](https://www.youtube.com/playlist?list=PLsXDmrmFV_AT17JDf-otXSNE_eH7s0uDD) —— 从核心概念到更复杂的导航流程的系列教程。

## 核心特性

- **原生性能（Native）**：基于 [React Native Screens](https://github.com/software-mansion/react-native-screens) 构建，Expo Router 的导航默认就是真正原生的、针对各平台优化的。
- **可分享（Shareable）**：应用中的每个页面都自动支持[深度链接（Deep Link）](/linking/overview.md)，使得应用中的任何路由都可以通过链接分享。
- **离线优先（Offline-first）**：应用会被缓存并以离线优先模式运行，当你发布新版本时会自动更新。无需网络连接或服务器即可处理所有传入的原生 URL。
- **性能优化（Optimized）**：路由在生产环境中会通过[懒加载（Lazy-evaluation）](/router/web/async-routes.md)自动优化，在开发环境中则使用延迟打包（deferred bundling）。
- **快速迭代（Iteration）**：在 Android、iOS 和 Web 上支持通用 Fast Refresh（快速刷新），同时打包器中提供构建产物缓存（artifact memoization），让你在大规模开发中依然保持高效。
- **跨平台统一（Universal）**：Android、iOS 和 Web 共享统一的导航结构，同时可以在路由级别按需使用平台特定的 API。
- **可发现性（Discoverable）**：Expo Router 在 Web 端支持构建时[静态渲染（Static Rendering）](/router/web/static-rendering.md)，在原生端支持[通用链接（Universal Linking）](/linking/overview.md)。这意味着你的应用内容可以被搜索引擎收录。

> **关键术语解释（面向初学者）**：
>
> - **深度链接（Deep Link）**：一种特殊的 URL，可以直接打开应用内的特定页面，而不仅仅是应用首页。例如 `myapp://profile/123` 可以直接打开用户资料页面。
> - **懒加载（Lazy-evaluation）**：一种优化技术，只在需要时才加载对应的代码模块，而不是在应用启动时加载所有代码，从而减少初始加载时间。
> - **静态渲染（Static Rendering）**：在构建时将页面预渲染为静态 HTML，有利于搜索引擎优化（SEO）和首屏加载速度。
> - **Fast Refresh（快速刷新）**：React Native 的热更新机制，修改代码后无需完全重新加载应用，即可在设备上看到变更效果。
> - **通用链接（Universal Linking）**：iOS 上的技术，允许用户通过标准 HTTPS 链接直接打开已安装的应用，如果未安装则跳转到网页。Android 上对应的技术叫 App Links。

> **基于文档内容推导**：Expo Router 的设计目标是将 Web 开发的成熟模式（如文件系统路由、静态渲染、懒加载）引入到 React Native 生态中，使移动端开发也能享受现代 Web 框架的便利。

## 使用其他导航库

你可以在 Expo 项目中使用任何其他导航库，例如 [React Navigation](https://reactnavigation.org/docs/getting-started#installation)。但是，如果你正在构建一个新应用，**我们推荐使用 Expo Router，以获得上述所有特性**。使用其他导航库时，你可能需要自己实现某些特性的策略，例如可分享的链接，或者在同一项目中同时处理 Web 和原生导航。

如果你打算使用 [React Native Navigation（Wix 出品）](https://github.com/wix/react-native-navigation)，请注意它不支持 Expo Go，且目前与 `expo-dev-client` 不兼容。我们建议使用 React Navigation 中的 [`createNativeStackNavigator`](https://reactnavigation.org/docs/native-stack-navigator) 来调用 Android 和 iOS 的原生导航 API。

> **基于经验建议**：对于新项目，强烈建议从一开始就使用 Expo Router。后期从手动定义路由迁移到文件系统路由的成本很高，而且你会错失自动深度链接、类型化路由、静态渲染等开箱即用的功能。

## 常见问题

#### Expo Router 与 Expo 与 React Native CLI 的区别

从历史上看，React Native 对应用的构建方式没有做太多约束，这类似于在不使用现代 Web 框架的情况下使用 React。Expo Router 是一个有主张的（opinionated）React Native 框架，类似于 Remix 和 Next.js 之于纯 Web React 的关系。

Expo Router 旨在将最优秀的架构模式带给每一个开发者，确保 React Native 的能力被充分发挥。例如，Expo Router 的 [Async Routes（异步路由）](/router/web/async-routes.md) 功能为所有人启用了懒打包（lazy bundling）。在此之前，懒打包只在 Meta 公司内部用于构建 Facebook 应用。

> **关键术语解释（面向初学者）**：
>
> - **有主张的框架（Opinionated Framework）**：框架对"如何正确地做事"有明确的约定和最佳实践，而不是让开发者自由选择所有实现方式。这降低了决策成本，但也意味着你需要遵循框架的约定。
> - **React Native CLI**：React Native 官方提供的命令行工具，相比 Expo 它提供了更底层的控制，但需要开发者自行处理更多配置和架构决策。
> - **Async Routes（异步路由）**：一种按需加载路由模块的技术，只有在导航到某个页面时才加载对应的代码，从而减小初始包体积。

#### 我可以在已有的 React Native 应用中使用 Expo Router 吗？

可以，Expo Router 是面向通用 React Native 应用的框架。由于路由器和打包器之间有深度关联，Expo Router 仅在使用 Metro 的 Expo CLI 项目中可用。不过好消息是，你也可以在[任何 React Native 项目中使用 Expo CLI](/bare/using-expo-cli.md)！

> **基于经验建议**：如果你有一个旧的 React Native 项目想引入 Expo Router，建议先确保项目已迁移到使用 Expo CLI 和 Metro 打包器。迁移过程需要一定投入，但长远来看文件系统路由带来的维护收益是值得的。

#### 基于文件的路由有哪些优势？

- **易于理解的心智模型**：文件系统是一个众所周知且容易理解的概念。更简单的心智模型使得教育新团队成员和扩展应用变得更容易。
- **最快的用户引导方式**：让用户打开一个通用链接，根据他们是否安装了应用来跳转到正确的页面或网站对应页面。这种技术非常高级，通常只有大型公司才能负担得起在各平台之间维护这种一致性。但通过 Expo 的文件系统路由，你可以开箱即用地拥有这项功能！
- **更容易重构**：你可以随意移动文件，而不需要更新任何导入语句或路由组件。
- **自动类型化路由**：Expo Router 能够自动对路由进行静态类型检查。这确保你只能链接到有效的路由，不会链接到不存在的路由。类型化路由还能在重构时提供帮助 —— 如果链接损坏，你会收到类型错误提示。
- **异步路由（Bundle Splitting）改善开发速度**：异步路由提升了开发速度，尤其在大型项目中效果显著。它们还使升级更容易，因为错误被隔离到单个路由中，这意味着你可以逐页增量更新或重构应用，而不需要像传统 React Native 那样一次性完成所有修改。
- **深度链接始终可用**：深度链接对每个页面都有效。这使得你可以分享应用内任何内容的链接，非常适合推广应用、收集 Bug 报告、端到端测试、自动化截图等场景。
- **深度原生集成**：Expo Head 使用自动链接来启用深层原生集成。诸如 Quick Notes、Handoff、Siri 上下文和通用链接等功能只需要配置设置，无需修改代码。这使得与用户拥有的整个智能设备生态系统实现完美的垂直整合成为可能，带来只有通用应用（Web ⇄ 原生）才能实现的用户体验。
- **Web 端静态渲染**：Expo Router 能够自动在 Web 端对每个页面进行静态渲染，实现真正的 SEO 和应用内容的完整可发现性。这只有基于文件约定才能实现。
- **CLI 推断能力**：**Expo CLI** 在应用遵循已知约定时可以推断出大量信息。例如，可以实现按路由自动拆分 Bundle，或自动为网站生成 Sitemap。当你的应用只有一个入口文件时，这些都是不可能的。
- **重新参与功能更容易集成**：通知和主屏幕小组件等重新参与（Re-engagement）功能更容易集成，因为你可以简单地在应用的任何位置拦截启动事件和深度链接（包括查询参数）。
- **自动化的分析和错误报告**：与 Web 端类似，分析和错误报告可以轻松配置为自动包含路由名称，这对于调试和理解用户行为非常有用。

> **关键术语解释（面向初学者）**：
>
> - **Bundle Splitting（包拆分）**：将应用的 JavaScript 代码按路由拆分成多个较小的包，只在需要时加载对应的包，减小初始加载体积。
> - **Sitemap（站点地图）**：一个列出网站所有页面的文件，帮助搜索引擎更好地抓取和索引网站内容。
> - **Re-engagement（重新参与）**：通过推送通知、小组件等方式重新吸引用户回到应用中的策略。
> - **Handoff**：Apple 生态系统中的一项功能，允许用户在一个设备上开始某项活动，然后在另一个设备上无缝继续。

> **基于文档内容推导**：基于文件的路由的核心优势在于"约定优于配置" —— 通过统一的文件结构约定，大量原本需要手动实现的功能（深度链接、类型检查、SEO、包拆分等）都可以由框架自动完成，大幅降低了开发和维护成本。

#### 为什么选择 Expo Router 而不是 React Navigation？

Expo Router 采用基于文件的方式，路由由 **app** 目录中的文件结构自动派生。它还内置了对类型化路由、自动深度链接和 Web 静态渲染的支持。React Navigation 则让你在代码中手动定义导航器和路由。选择哪种模式取决于你的项目需求。

#### 如何在服务器端渲染 Expo Router 网站？

Expo Router 支持基础的静态渲染（SSG）。服务端渲染（SSR）目前需要自定义的基础设施来实现。

> **关键术语解释（面向初学者）**：
>
> - **SSG（Static Site Generation，静态站点生成）**：在构建时将页面预渲染为静态 HTML 文件，用户访问时直接提供静态文件，速度快且易于部署。
> - **SSR（Server-Side Rendering，服务端渲染）**：在用户请求时由服务器实时渲染页面内容。适合需要动态数据的场景，但需要后端服务器支持。

## 下一步

- [手动安装](/router/installation.md) —— 关于如何开始使用以及将 Expo Router 添加到现有应用的详细说明。
- [Router 101](/router/basics/core-concepts.md) —— 了解核心概念、标记模式、导航布局以及常见导航模式，从 Router 101 部分开始。
- [示例应用](https://github.com/expo/expo/tree/main/templates/expo-template-tabs) —— 在 GitHub 上查看示例应用的源代码。

> **基于经验建议**：建议按照以下顺序学习：先阅读本篇简介了解全貌，再学习 Router 101 掌握核心概念和布局模式，然后参考示例应用的源码理解实际实现。如果遇到安装问题，查阅手动安装指南。

---

## 文档导航

- **上一页**：[react compiler](./49__react-compiler.md)
- **下一页**：[installation](./51__installation.md)
