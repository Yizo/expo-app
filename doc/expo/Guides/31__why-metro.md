# 为什么选择 Metro（打包器）

> 原文地址：https://docs.expo.dev/guides/why-metro/
>
> 文档更新日期：2026 年 5 月

---

## 简介

本文介绍为什么 Expo 选择 **Metro** 作为其主要的打包工具（bundler）。由于打包系统涉及大量的设计决策，本文解释了围绕 Metro 构建 Expo 框架的核心原因和基础原理。

> **新手须知 — 关键术语解释**
>
> - **Metro**：React Native 的官方 JavaScript 打包工具（bundler）。它的作用是将你编写的 JavaScript/TypeScript 源代码、样式文件、图片资源等，打包（bundle）成可以在移动设备或浏览器中运行的文件。你可以把它理解为"代码的打包工厂"。
> - **打包器（Bundler）**：一种开发工具，负责将多个源代码文件合并（打包）成一个或多个可以在目标环境中运行的文件。在 Web 开发中，常见的打包器有 Webpack、Vite、esbuild 等；在 React Native 开发中，Metro 是官方指定的打包器。
> - **React Native**：由 Meta（原 Facebook）开发的开源框架，允许你使用 JavaScript/React 来构建原生移动应用（iOS 和 Android）。Expo 就是构建在 React Native 之上的框架。
> - **Expo**：一个基于 React Native 的开源平台，提供了更完善的工具链、开发体验和服务（如云端构建、OTA 更新等），让你更高效地开发跨平台应用。
> - **Hermes**：Meta 为 React Native 专门开发的 JavaScript 引擎（runtime）。与浏览器中的 V8 引擎不同，Hermes 针对移动设备进行了优化，能显著提升应用的启动速度和运行性能。
> - **Expo Router**：Expo 官方的路由/导航库，灵感来源于 Next.js 的文件系统路由，用于管理应用中的页面导航。

---

## 一、Meta 官方支持（Backed by Meta）

Metro 由 React 和 Hermes 的创建者 Meta 公司积极维护，专门用于处理包含数十万个文件的超大规模应用。这种紧密的合作关系确保了 Expo 用户能够**即时获取新兴功能**并享受无缝集成。

### 当前已集成的功能

以下是 Metro 目前已经支持的关键能力：

- **Fast Refresh（快速刷新）**：这项功能最初在 Metro 中推出，后来才扩展到 Web 生态系统。它允许你在开发过程中修改代码后，无需完全重新加载应用即可看到变更效果。
- **将 JavaScript 转换为 Hermes 字节码**：Metro 能够将你的 JavaScript 代码编译为 Hermes 字节码（bytecode），从而实现即时的原生启动速度。
- **原生 DevTools（开发调试工具）**：Metro 提供专有的调试工具，支持网络请求检查和 JavaScript 调试。
- **React Compiler 的 Babel 插件初始兼容**：Metro 已经初步支持通过 Babel 插件使用 React Compiler。

> **新手须知 — 关键术语解释**
>
> - **Fast Refresh（快速刷新）**：React Native 提供的一种开发体验功能。当你保存代码文件后，应用会立即更新对应部分，无需手动刷新。它比传统的"热重载"（Hot Reload）更可靠，能保留组件状态。
> - **字节码（Bytecode）**：一种介于人类可读的源代码和机器可直接执行的机器码之间的中间表示形式。Hermes 引擎可以直接运行字节码，跳过了运行时解析 JavaScript 源码的步骤，因此启动速度更快。
> - **React Compiler**：React 团队正在开发的编译器，旨在自动优化 React 组件的渲染性能，减少不必要的重新渲染。
> - **Babel**：一个广泛使用的 JavaScript 编译器/转译器，能够将新版本的 JavaScript 语法转换为兼容旧环境的代码，也支持通过插件扩展语言功能。

### 即将推出的功能

以下是 Metro 正在开发中的未来功能：

- **Static Hermes（静态 Hermes）**：能够将 Flow 类型标注的代码直接编译为机器码（machine code）。这一功能由 Tzvetan Mikov 在相关技术演讲中详细介绍过。
- **通用 React Server Components（通用 React 服务端组件）**：在所有环境中支持数据获取（data fetching）、流式传输（streaming）和 React Suspense 等特性。这一功能在 React Conf 2024 大会上被重点展示。

> **新手须知 — 关键术语解释**
>
> - **Static Hermes**：Hermes 引擎的一个扩展项目，旨在将带有 Flow 类型标注的 JavaScript 代码直接编译为原生机器码，从而获得接近 C/C++ 级别的运行性能。
> - **Flow**：Meta 开发的 JavaScript 静态类型检查工具，类似于 TypeScript。Meta 内部大量使用 Flow 来标注代码类型。
> - **机器码（Machine Code）**：计算机 CPU 可以直接执行的二进制指令，无需进一步翻译或解释，因此执行速度最快。
> - **React Server Components（React 服务端组件）**：React 18 引入的一种新组件类型，允许组件在服务器上渲染，然后将结果流式传输到客户端，减少客户端的 JavaScript 体积。
> - **React Suspense**：React 提供的一种机制，允许你在数据加载或代码加载时声明"等待状态"（如显示加载动画），让异步操作的 UI 处理更加优雅。

此外，Expo 团队直接与 Meta 合作，在 Metro 之上实现了 Expo Router 的各项功能，包括：

- **基于文件的路由（file-based routing）**
- **Web 兼容性（web support）**
- **包分割（bundle splitting）**
- **Tree shaking（无用代码消除）**
- **CSS 支持**
- **DOM 组件**
- **Server Components（服务端组件）**
- **API Routes（API 路由）**

> **新手须知 — 关键术语解释**
>
> - **基于文件的路由（File-based routing）**：一种路由组织方式——你在文件系统中创建的文件路径会自动映射为应用的页面路由。例如，创建 `app/about.tsx` 文件就自动拥有了 `/about` 这个页面路由。
> - **包分割（Bundle splitting）**：将一个大的打包文件拆分成多个较小的文件（chunk），按需加载，从而减少首次加载时间。
> - **Tree shaking（无用代码消除）**：一种优化技术，打包器会分析代码的依赖关系，自动移除未被使用的代码（dead code），减小最终产物的体积。
> - **DOM 组件**：在 React Native 环境中，将 React 组件渲染为 Web DOM 元素的能力，使得同一个组件可以在原生和 Web 环境中运行。
> - **API Routes（API 路由）**：允许你在前端项目中直接定义后端 API 接口的功能，类似于 Next.js 的 API Routes。

> **基于文档内容推导**：Meta 对 Metro 的深度投入意味着 Metro 不仅仅是一个"够用"的打包器，而是与 React Native 和 Hermes 引擎协同演进的核心基础设施。选择 Metro 的 Expo 项目可以第一时间获得来自 React Native 核心团队的功能支持，这种生态协同优势是其他第三方打包器无法提供的。

---

## 二、大规模验证（Battle-tested at Scale）

几乎所有 React Native 应用都使用 Metro 作为打包器，因此它在企业级项目和业余项目中都经过了充分验证。Metro 内置了**增量打包（delta bundling）** 和**共享远程缓存（shared remote caches）** 功能，专门用于高效管理超大规模的代码库。

> **新手须知 — 关键术语解释**
>
> - **增量打包（Delta bundling）**：一种优化技术，打包器只传输自上次构建以来发生变化的代码部分（"增量"），而不是每次都传输完整的打包文件。这大大缩短了开发时的等待时间。
> - **共享远程缓存（Shared remote caches）**：将编译/打包的中间结果存储在远程服务器上，团队中的其他成员或 CI/CD 服务器可以复用这些缓存结果，避免重复的编译工作。
> - **CI/CD（持续集成/持续交付）**：一种软件工程实践，通过自动化的构建、测试和部署流程，确保代码变更能够快速且可靠地交付给用户。

Meta 内部使用 Metro 来处理超过 **40 万个源文件**的代码库，这充分说明了 Metro 在极端规模下的可靠性。

> **基于文档内容推导**：对于绝大多数开发者来说，你的项目规模远不及 Meta 的内部项目。这意味着 Metro 处理你的代码库将游刃有余，你不必担心随着项目增长而遇到打包性能瓶颈。

---

## 三、按需执行（Deferred Execution / On-demand Processing）

在开发过程中，Metro 会延迟执行平台相关的任务，直到真正需要时才进行处理。结合**激进的缓存策略（aggressive caching）** 和**异步路由（async routes）**，这种设计避免了在同时面向多个操作系统（如 iOS、Android、Web）开发时产生的性能损耗。

> **新手须知 — 关键术语解释**
>
> - **按需执行（On-demand / Deferred execution）**：一种"惰性"策略——不预先处理所有平台的代码，而是只在你实际请求某个平台的构建产物时，才进行该平台相关的处理。例如，如果你只在 iOS 模拟器上开发，Metro 不会浪费时间处理 Android 和 Web 相关的代码。
> - **异步路由（Async routes）**：Expo Router 支持的一种路由加载方式，页面代码不会在应用启动时全部加载，而是在用户实际导航到某个页面时才异步加载对应的代码。

> **基于经验建议**：按需执行的策略对于同时开发 iOS、Android 和 Web 三端的 Expo 项目尤为重要。它意味着你在开发 iOS 版本时，不会为 Android 和 Web 的代码付出额外的编译时间。这对于大型多平台项目来说可以显著缩短开发时的热更新速度。

---

## 四、多维度资源共享（Multi-dimensional / Cross-environment Efficiency）

与为不同目标环境（客户端、服务端、DOM/Web）启动独立打包实例的传统方式不同，Metro 的架构能够在客户端、服务端和 DOM 环境之间**共享资源**，使其非常适合通用（universal）开发。

> **新手须知 — 关键术语解释**
>
> - **通用开发（Universal development）**：指使用同一套代码库同时构建原生移动应用和 Web 应用的开发方式。Expo 天然支持这种模式——你的 React Native 代码可以同时在 iOS、Android 和浏览器中运行。
> - **DOM（Document Object Model）**：浏览器中表示网页结构的编程接口。当 Expo 将你的组件渲染为 Web 页面时，最终生成的就是 DOM 元素。

> **基于文档内容推导**：多维度资源共享是 Metro 相较于 Web 打包器（如 Webpack）的一个架构优势。如果你使用 Webpack 同时构建客户端和服务端代码，通常需要分别配置两个独立的打包实例，而 Metro 从架构层面就支持跨环境共享，减少了配置复杂度和内存占用。

---

## 五、可复用的变换缓存（Reusable Transform Memoization）

Metro 的增量设计会生成**缓存的变换产物（cached transform artifacts）**，这些缓存可以在不同的计算机之间传递。这使得大型团队能够共享编译工作成果，避免每个开发者都在本地重复执行相同的编译任务。

> **新手须知 — 关键术语解释**
>
> - **变换缓存（Transform memoization）**："Memoization"（记忆化）是计算机科学中的一个概念，指的是缓存函数的计算结果，当相同的输入再次出现时直接返回缓存结果，而不重新计算。Metro 利用这个原理，缓存代码文件的编译/变换结果。
> - **变换产物（Transform artifacts）**：代码文件经过 Metro 的编译、转译等处理后生成的中间文件。这些文件可以被缓存和复用。

> **基于经验建议**：如果你的团队使用 CI/CD 流水线进行构建，可以利用 Metro 的远程缓存功能来加速构建过程。例如，Expo 提供的 EAS Build 服务就支持共享远程缓存，团队成员之间的构建产物可以互相复用，大幅减少 CI 构建时间。

---

## 六、为自定义运行时优化（Optimized for Custom Runtimes）

与面向标准浏览器环境（如 Chrome、Firefox）的打包器不同，Metro 拥抱了 React Native 的灵活性。它能够针对 **Hermes 字节码编译（Hermes bytecode compilation）** 生成精确的语言特性，从而加速生产环境的启动速度。这也为未来通过 **Static Hermes** 实现原生机器码编译铺平了道路。

> **新手须知 — 关键术语解释**
>
> - **运行时（Runtime）**：代码实际执行的环境。Web 应用的运行时是浏览器中的 JavaScript 引擎（如 Chrome 的 V8）；React Native 应用的运行时是 Hermes 引擎。不同的运行时具有不同的特性和性能特点。
> - **自定义运行时**：这里特指 React Native 使用的 Hermes 引擎，它与标准的浏览器 JavaScript 引擎不同，拥有自己独特的优化策略（如字节码预编译）。

> **基于文档内容推导**：Web 打包器（如 Webpack、Vite）的目标是生成符合浏览器标准的 JavaScript 代码，因此它们会做大量的 polyfill（兼容性补丁）和降级处理。而 Metro 明确知道目标运行时是 Hermes，因此可以跳过这些兼容性处理，直接生成 Hermes 最优的代码格式，这是性能优势的重要来源。

---

## 七、跨技术桥接（Cross-technology Support / Bridging Technologies）

Expo 利用 Metro 的基础设施来构建 **DOM 组件**，使得原生 React 组件能够动态编译为完整的网站，并使用宿主应用的配置。

> **新手须知 — 关键术语解释**
>
> - **DOM 组件**：Expo Router 提供的一种组件类型，允许你将 React Native 组件渲染为 Web 原生的 DOM 元素。这使得同一个组件既能运行在原生环境中，也能渲染为网页。
> - **宿主应用（Host application）**：指最终运行代码的应用环境。在 Web 场景中，宿主应用就是浏览器；在原生场景中，宿主应用是 iOS 或 Android 系统。

> **基于文档内容推导**：Metro 的跨技术桥接能力是 Expo 实现"一次编写，多端运行"愿景的技术基础。它不仅仅是简单地将 React Native 代码"翻译"成 Web 代码，而是让 Metro 理解两种运行时的差异，并生成各自最优的输出。

---

## 八、原生资源导出（Native Asset Exports / Binary Embedding）

Metro 的配置不仅支持生成可托管的 Web 应用，还允许将打包产物导出为可以直接嵌入独立二进制文件（standalone binaries）的格式，并利用平台特定的优化功能，例如 Apple 的**资源目录（asset catalogs / xcassets）**。

> **新手须知 — 关键术语解释**
>
> - **独立二进制文件（Standalone binaries）**：指打包后的原生应用安装包（如 iOS 的 .ipa 文件和 Android 的 .apk 文件），它们可以独立安装和运行，不依赖开发服务器。
> - **资源目录（Asset Catalogs / xcassets）**：Apple 开发工具（Xcode）中用于管理应用资源（如图片、图标、颜色等）的一种组织方式。使用资源目录可以让系统针对不同设备自动优化资源的加载和显示。
> - **Xcode**：Apple 官方的集成开发环境（IDE），用于开发 iOS、macOS 等 Apple 平台的应用程序。

> **基于经验建议**：当你需要将 Expo 应用构建为可提交到 App Store 或 Google Play 的独立应用时，Metro 的原生资源导出功能确保了你的图片、字体等静态资源能够被正确地打包进安装包，并充分利用各平台的资源优化机制。

---

## 九、并行处理（Concurrent Processing / Parallel Execution）

Metro 会将所有**抽象语法树变换（AST transformations）** 分配到所有可用的硬件线程上同时执行，充分利用多核处理器的计算能力。

> **新手须知 — 关键术语解释**
>
> - **抽象语法树（AST, Abstract Syntax Tree）**：源代码的一种树形结构表示。打包器和编译器会将你的代码解析为 AST，然后对 AST 进行各种变换操作（如代码压缩、语法转译、死代码消除等），最后将变换后的 AST 重新生成为目标代码。
> - **硬件线程（Hardware threads）**：现代 CPU 通常拥有多个核心（core），每个核心可以同时处理多个线程（thread）。Metro 利用所有可用的 CPU 核心来并行处理代码变换，从而加速打包过程。

> **基于经验建议**：如果你在使用 Metro 开发大型项目，确保你的开发机器拥有足够的 CPU 核心数。Metro 的并行处理能力意味着更多的 CPU 核心可以转化为更快的打包速度。对于超大型项目，使用 M 系列芯片的 Mac 可以显著受益于这一特性。

---

## 十、与其他方案的对比（Contrasting Alternative Methods）

虽然 Metro 是为通用应用（universal apps）而构建的，但它经常被拿来与面向 Web 的打包方案进行对比。下面我们来分析两种常见的对比维度。

### 10.1 浏览器 ESM vs. 打包（Browser ESM vs. Bundling）

像 **Vite** 这样的工具依赖于浏览器原生的 **ESM（ES Modules）** 支持，这在中大型项目中会导致**数以千计的级联网络请求（cascading network requests）**，从而严重拖慢开发体验。

> **新手须知 — 关键术语解释**
>
> - **ESM（ES Modules）**：JavaScript 的官方模块系统，使用 `import` 和 `export` 语法来组织代码。现代浏览器原生支持 ESM，可以直接在浏览器中加载模块。
> - **Vite**：一个现代化的 Web 开发构建工具，在开发模式下利用浏览器原生的 ESM 支持来实现快速启动，不进行打包，而是让浏览器按需请求各个模块文件。
> - **级联网络请求（Cascading network requests）**：当一个模块依赖另一个模块，后者又依赖更多模块时，浏览器需要发起一系列相互依赖的网络请求来获取所有代码。模块越多，请求链越长，加载越慢。

Metro 在本地进行完整的打包处理，而不是依赖浏览器的 ESM，这样做有以下优势：

- **开发环境与生产环境保持一致**：打包后的代码结构在开发和生产环境中相同，减少了"在我机器上能跑"（works on my machine）的问题。
- **更好地处理 React Native 的大量模块列表**：React Native 项目通常依赖大量的 npm 包，如果在浏览器中逐个加载这些模块，网络请求数量会非常庞大。

> **基于文档内容推导**：Vite 的"开发时不打包"策略在小型 Web 项目中表现出色（启动快），但随着项目规模增长，级联请求的问题会逐渐显现。Metro 选择"始终打包"的策略虽然在小型项目中看起来"过重"，但在 React Native 和大型项目中，这种策略更加稳健和可扩展。

### 10.2 JavaScript vs. 编译型语言（JavaScript vs. Compiled Languages）

一些竞争性的打包工具选择用 **Rust** 重写其核心代码以追求极致性能，而 Metro 采用了**混合技术栈（hybrid stack）** 来平衡速度与开发者友好性：

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| **核心工具函数** | JS + Flow | 使用 JavaScript 和 Flow 类型标注编写，便于社区理解和贡献 |
| **文件监听（File watching）** | JS 爬虫 或 C++ Watchman | 使用 JavaScript 编写的文件爬虫，或可选地使用 C++ 编写的 Watchman 工具获得更高性能 |
| **解析器（Parser）** | Hermes 解析器（WebAssembly） | 使用 WebAssembly 编译的 Hermes 解析器，兼顾性能和跨平台兼容性 |
| **代码变换（Transformations）** | Babel | 使用 Babel 进行 AST 变换，提供最大的灵活性和插件生态 |
| **代码压缩（Minification）** | Hermes（原生）/ Terser + ESBuild（Web） | 针对原生环境使用 Hermes 内置压缩器，针对 Web 使用 Terser 和 ESBuild |
| **样式表处理（CSS）** | LightningCSS（Rust） | 使用 Rust 编写的 LightningCSS 处理 CSS，获得极致的样式解析性能 |

> **新手须知 — 关键术语解释**
>
> - **Rust**：一种系统级编程语言，以内存安全和高性能著称。近年来被许多构建工具采用（如 SWC、Turbopack）来提升打包速度。
> - **Watchman**：Meta 开发的文件监听服务，能够高效地监控文件系统的变化。Metro 可以选择使用 Watchman 来替代内置的 JavaScript 文件爬虫，在大型项目中获得更好的文件监听性能。
> - **WebAssembly（Wasm）**：一种可移植的二进制指令格式，允许在浏览器或其他运行时中以接近原生的速度执行代码。Metro 使用 WebAssembly 编译的 Hermes 解析器来解析 JavaScript 代码。
> - **Terser**：一个流行的 JavaScript 代码压缩工具，能够将代码体积大幅缩小（移除空格、缩短变量名等）。
> - **ESBuild**：一个用 Go 编写的极快的 JavaScript 打包器和压缩器。
> - **LightningCSS**：一个用 Rust 编写的极快的 CSS 解析器、转换器和压缩器。

这种混合技术栈的策略确保了以下优势：

- **更易调试**：JavaScript 核心部分可以在标准的 JavaScript 调试器中直接调试，无需 Rust 工具链。
- **社区对齐**：React Native 社区主要由 JavaScript/TypeScript 开发者组成，使用 JS 编写核心代码降低了社区贡献的门槛。
- **插件灵活性**：通过 Babel 进行代码变换，开发者可以使用丰富的 Babel 插件生态来自定义代码处理流程。

> **基于经验建议**：完全用 Rust 编写的打包器（如 Turbopack）在原始速度上可能更快，但当你在开发过程中需要自定义打包行为（如编写自定义 Babel 插件）时，Metro 的 JavaScript 核心 + Babel 的组合提供了更大的灵活性。对于大多数 Expo 项目来说，Metro 的性能已经足够好，而灵活性带来的开发效率提升更为重要。

---

## 总结

| 特性 | 说明 |
|------|------|
| **Meta 官方维护** | 与 React Native 和 Hermes 同步演进，第一时间获得新功能 |
| **大规模验证** | 处理 Meta 内部超过 40 万个源文件，支持增量打包和远程缓存 |
| **按需执行** | 仅在需要时处理平台相关任务，避免多平台开发的性能浪费 |
| **多维度资源共享** | 客户端、服务端、Web 环境共享资源，适合通用开发 |
| **可复用变换缓存** | 缓存可在不同机器间传递，适合大型团队协作 |
| **自定义运行时优化** | 针对 Hermes 引擎生成最优代码，加速生产环境启动 |
| **跨技术桥接** | 原生组件可编译为 Web DOM 组件，实现一码多端 |
| **原生资源导出** | 支持嵌入独立二进制文件，利用平台特定的资源优化 |
| **并行处理** | AST 变换在所有可用 CPU 核心上并行执行 |
| **混合技术栈** | JS + C++ + WebAssembly + Rust 的组合，平衡性能与灵活性 |

> **基于文档内容推导**：Metro 的设计哲学是"为 React Native 量身定做"，而不是追求成为通用 Web 打包器。它的每一个设计决策——从按需执行到 Hermes 字节码优化，从多维度资源共享到并行处理——都服务于一个目标：让 React Native（和 Expo）应用在任何规模下都能获得最佳的开发和运行体验。对于 Expo 开发者来说，理解 Metro 的这些设计优势，有助于你在遇到打包问题时更好地定位原因，并充分利用 Metro 提供的各种优化功能。

---

## 文档导航

- **上一页**：[minify](./30__minify.md)
- **下一页**：[overview](./32__overview.md)
