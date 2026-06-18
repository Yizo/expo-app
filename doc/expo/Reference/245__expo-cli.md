# Expo CLI 命令行工具

## 文档解决的问题

Expo CLI 是开发者与 Expo 生态中其他工具之间的**主要交互接口**。对于从 React Web 转过来的开发者来说，你可以把它类比为 Create React App 中的 `react-scripts`，或者 Vite 的 `vite` 命令——它是一个统一的命令行入口，负责启动开发服务器、构建应用、管理依赖、生成原生代码等核心开发任务。

这篇文档系统介绍了 `expo` 命令的所有核心能力，帮助你理解在 Expo 项目中日常开发会用到哪些命令、它们各自做什么、以及如何通过环境变量来调整 CLI 的行为。

## 阅读前需要理解的背景知识

- **Expo CLI**：通过 npm 包 `expo` 安装的命令行工具。当你在项目中运行 `npx expo` 时，实际调用的就是它。
- **Prebuild（预构建）**：Expo 的一种工作流，它会根据你的项目配置自动生成 Android 和 iOS 的原生代码目录。如果你之前只用过纯 Web 项目，可以把它理解为"根据配置文件自动生成 `android/` 和 `ios/` 文件夹"。
- **Development Build（开发构建）**：一种包含自定义原生代码的 Expo 应用版本，相比官方的 Expo Go 客户端，它允许你使用第三方原生库。
- **EAS Build**：Expo 提供的云端构建服务，类似于 GitHub Actions 或 Vercel 的 CI 构建，用于在云端编译你的 iOS/Android 应用。
- **Metro**：React Native 的 JavaScript 打包工具（bundler），相当于 Web 开发中的 Webpack 或 Vite。
- **Hermes**：Meta（Facebook）为 React Native 专门优化的 JavaScript 引擎，替代了原先的 JavaScriptCore。

## 核心能力概览

Expo CLI 提供以下核心功能：

| 能力 | 说明 | Web 开发类比 |
|------|------|-------------|
| 启动开发服务器 | 运行 `npx expo start` 启动本地开发服务器 | 类似 `npm start` / `vite dev` |
| 生成原生目录 | 自动生成 `android/` 和 `ios/` 原生工程目录 | Web 项目中无对应概念 |
| 本地构建和运行 | 在连接的设备或模拟器上构建并运行应用 | 类似 `npm run build` + 本地预览 |
| 安装和更新包 | 安装与当前 React Native 版本兼容的依赖包 | 类似 `npm install`，但增加了版本兼容检查 |

你可以通过运行帮助命令查看所有可用命令：

```bash
npx expo --help
```

## 开发服务器详解

运行 `npx expo start` 后，CLI 会启动一个开发服务器，并在终端显示一个**交互式 UI（Terminal UI）**。这个 UI 提供了快捷键来快速执行常见操作。

> **对 Web 开发者的说明**：在 Web 开发中，你启动开发服务器后通常直接在浏览器里打开 `localhost:3000`。但在移动端开发中，你需要将应用"推送"到真实设备或模拟器上，因此终端 UI 提供了快捷操作来完成这些任务。

### 终端 UI 快捷键

| 按键 | 功能 | 说明 |
|------|------|------|
| `A` | 在 Android 设备上启动 | 如果只连了一台设备，直接启动 |
| `Shift+A` | 选择 Android 设备 | 连接了多台设备时，弹出列表让你选择 |
| `I` | 在 iOS 模拟器上启动 | 如果只有一个模拟器，直接启动 |
| `Shift+I` | 选择 iOS 模拟器 | 有多个模拟器时，弹出列表让你选择 |
| `W` | 在浏览器中打开 | 用于 Web 端预览（如果你的项目支持 Web） |
| `R` | 重新加载应用 | 类似浏览器中的刷新 |
| `S` | 切换启动目标 | 在 Expo Go 客户端和 Development Build 之间切换 |
| `M` / `Shift+M` | 打开开发菜单 / 更多设备命令 | 可以触发设备上的调试菜单等 |
| `J` | 启动 React Native DevTools | 针对 Hermes 引擎的调试工具 |
| `O` | 在编辑器中打开代码 | 快速打开项目代码 |
| `E` | 显示二维码 | 用 Expo Go 扫描二维码即可在手机上预览 |
| `?` | 列出所有命令 | 查看所有快捷键 |

### 启动目标与网络模式

**启动目标（Launch Target）**：

- 如果项目中已安装了 Development Build，CLI 会自动使用它作为启动目标
- 你可以通过命令行参数来**强制指定**启动目标（例如强制使用 Expo Go 或 Development Build）

**网络模式**：

- **LAN 模式（默认）**：开发服务器通过局域网提供服务。你的电脑和手机需要连接同一个 Wi-Fi 网络。这和 Web 开发中的 `localhost` 类似，但访问范围扩大到了局域网。
- **Tunnel 模式（隧道）**：通过 ngrok 等工具穿透网络限制。适用于你的设备和电脑不在同一网络、或公司网络有限制的场景。但注意：**隧道模式比本地连接慢**。
- **离线模式**：使用 `--offline` 参数启动，CLI 会避免发出网络请求。适用于无网络环境下开发。

### 本地状态与端点

**本地状态目录**：CLI 会在项目中创建一个隐藏目录（通常是 `.expo/`），存放服务器的本地配置。这个目录：
- 包含服务器运行时的配置信息
- **不应该提交到版本控制**（应加入 `.gitignore`）
- 不应该与他人共享

**外部访问端点**：开发服务器开放了一个 HTTP 端点，允许外部工具通过 GET 和 POST 请求来：
- 查询（introspect）应用中的深度链接（deep links）
- 触发设备上的应用启动

> **深度链接（Deep Link）**：类似于 Web 中的 URL 路由，但用于直接打开移动应用中的特定页面。例如 `myapp://profile/123` 可以直接打开应用中的用户资料页。

## 构建应用

移动应用由两部分组成：**原生运行时（native runtime）**和**静态资源（static assets）**。构建过程比 Web 复杂得多——Web 项目通常只需要打包 JS/CSS/HTML，而移动应用还需要编译原生代码。

### 本地编译

**Android 构建**：

- 支持多种构建变体（variants），如 `debug`（调试版）和 `release`（发布版）
- 构建变体类似于 Web 中 `development` 和 `production` 构建的区别，但还涉及原生代码的编译优化、签名等

**iOS 构建**：

- 需要本地安装 **Xcode**（Apple 的官方 IDE，仅 macOS 可用）
- 支持自定义 Scheme（构建方案）和仅构建工作流
- 生产环境构建**推荐使用 EAS Build**（云端构建服务），因为本地 iOS 构建配置复杂且耗时

CLI 在构建时提供**智能日志解析（smart log parsing）**，能自动识别常见的编译错误并给出提示，这在排查原生代码编译问题时非常有用。

### 导出静态资源

`npx expo export` 命令会将代码转译（transpile）并输出到静态目录，用于生产环境部署。

**关键说明**：

- **子路径托管（Hosting with sub-paths）**：这是一个实验性功能，允许你配置静态资源的前缀路径。例如，如果你的 Web 应用不是部署在域名根目录而是 `example.com/my-app/`，就需要配置这个前缀。
- **Webpack 导出已被弃用**：原先 Expo 支持使用 Webpack 作为 Web 端的打包工具，现在已弃用，改为使用 Metro 统一打包（即"Universal Metro"）。这意味着无论你的目标是移动端还是 Web 端，都使用同一个打包工具。

## Prebuild 与代码检查

### Prebuild（预构建）

`npx expo prebuild` 命令会根据你的项目配置（`app.json` 或 `app.config.js`）自动生成 `android/` 和 `ios/` 目录中的原生代码。

> **对 Web 开发者的说明**：在纯 Web 项目中，你不需要"生成原生代码"这个步骤。但在移动开发中，应用需要原生容器来运行 JavaScript。Prebuild 就是自动生成这些容器的过程。你可以把 `app.json` 理解为"原生工程的配置文件"，Prebuild 会根据它来生成对应的原生代码。

### Lint（代码检查）

`npx expo lint` 命令会运行 ESLint，并附带 Expo 专用的规则配置。它帮助你遵循 React Native / Expo 的最佳实践。

这和你在 Web 项目中使用的 `eslint` 是同一个工具，只是规则集会针对移动端开发的特殊场景进行调整。

## 配置与依赖安装

### 配置评估

CLI 可以读取并评估你的配置文件（`app.json` / `app.config.js`），输出以下数据：

- **Manifest 文件**：用于 OTA（Over-The-Air）更新。OTA 更新允许你向已安装的用户推送 JavaScript 代码更新，而不需要通过应用商店审核。
- **Prebuild 数据**：用于生成原生代码的配置信息。

### 依赖安装

`npx expo install` 命令用于安装依赖包。它和 `npm install` 的核心区别在于：

- **React Native 不向后兼容**：每个 React Native 版本只支持特定版本的依赖包。使用不兼容的版本可能导致运行时错误或编译失败。
- `expo install` 会自动检查并确保安装的包版本与当前项目的 React Native 版本**精确匹配**
- 支持多种包管理器（npm、yarn、pnpm），并能自动检测和修正依赖冲突

> **实际开发建议**：在 Expo 项目中安装新依赖时，优先使用 `npx expo install <package>` 而不是 `npm install <package>`，这样可以避免版本不兼容的问题。

## 认证与自定义

### 认证（Authentication）

Expo CLI 的认证功能用于：

- **代码签名（Code Signing）**：为 Manifest 文件进行签名，确保 OTA 更新的安全性
- **凭证共享**：在多个 CLI 工具之间共享认证凭证

> **代码签名的意义**：类似于 Web 中的 HTTPS 证书，代码签名确保更新包确实来自你，而不是被篡改过的。

### 自定义配置生成

当你使用 Expo CLI 以外的工具时，某些配置文件可能需要手动生成。CLI 可以帮助你生成默认的配置文件，例如 Babel 配置（`babel.config.js`）。

> **Babel**：JavaScript 编译器，用于将新语法转换为旧环境能理解的代码。在 Web 项目中你可能已经在用，React Native 项目同样需要它来处理 JSX 和现代 JavaScript 语法。

## 环境变量配置

Expo CLI 支持通过环境变量来控制行为。以下是按用途分类的环境变量说明：

### 网络相关

| 环境变量 | 说明 | 典型使用场景 |
|----------|------|-------------|
| `HTTP_PROXY` | 设置代理 URL | 在公司网络中需要通过代理访问外网时 |
| `EXPO_OFFLINE` | 跳过所有网络请求 | 无网络环境下开发 |

### Web 与 TypeScript 相关

| 环境变量 | 说明 | 典型使用场景 |
|----------|------|-------------|
| `EXPO_NO_WEB_SETUP` | 阻止自动安装 Web 依赖 | 你的项目不需要 Web 端支持时 |
| `EXPO_NO_TYPESCRIPT_SETUP` | 阻止自动生成 TypeScript 配置 | 你不需要 TypeScript，或想手动配置时 |

### 调试相关

| 环境变量 | 说明 | 典型使用场景 |
|----------|------|-------------|
| `DEBUG=expo:*` | 启用 Expo 的详细日志输出 | 排查 CLI 行为异常时 |
| `EXPO_PROFILE` | 开启 CLI 性能统计 | 分析 CLI 命令执行耗时 |

### CI 与缓存相关

| 环境变量 | 说明 | 典型使用场景 |
|----------|------|-------------|
| `EXPO_NO_CACHE` | 禁用全局缓存 | 在 CI 环境中避免缓存干扰 |
| `CI` | 告知 CLI 当前处于 CI 环境 | CI 环境自动禁用交互式提示，防止构建卡住 |

> **对 Web 开发者的说明**：在 Web CI/CD 中，你通常只需设置 `CI=true`。在 Expo 项目中，CI 环境变量同样重要——如果不设置 `CI=true`，CLI 可能会弹出交互式提示（如"是否要安装这个包？"），导致 CI 构建无限等待。

### 遥测相关

| 环境变量 | 说明 |
|----------|------|
| `EXPO_NO_TELEMETRY` | 禁止匿名使用数据收集 |

### Metro 打包工具相关

| 环境变量 | 说明 |
|----------|------|
| `EXPO_ATLAS` | 启用 Metro 打包分析工具，可视化查看包体积 |
| `EXPO_NO_METRO_LAZY` | 禁用 Metro 的懒加载功能 |

> **EXPO_ATLAS**：类似于 Web 中的 `webpack-bundle-analyzer`，帮助你分析最终打包产物中各模块的体积，找出可以优化的大依赖。

### 实验性功能

| 环境变量 | 说明 |
|----------|------|
| `EXPO_UNSTABLE_TREE_SHAKING` | 启用不稳定的 Tree Shaking（移除未使用的代码） |
| `EXPO_UNSTABLE_LIVE_BINDINGS` | 启用不稳定的 Live Bindings 支持 |

> **注意**：带有 `UNSTABLE` 前缀的环境变量表示功能尚不稳定，可能在后续版本中变更或移除，不建议在生产环境中使用。

## 遥测（Telemetry）

Expo CLI 会收集**匿名的使用数据**，用于改进功能和用户体验。

关键信息：

- 收集的数据是**完全匿名的**，不包含个人信息或项目代码
- 遥测功能是**完全可选的**，你可以通过设置 `EXPO_NO_TELEMETRY=1` 来关闭
- 类似于 VS Code、Next.js 等工具的使用数据收集

## 注意事项、限制条件和坑点

1. **React Native 版本兼容性是硬约束**：不同于 Web 开发中依赖版本通常有较大的兼容范围，React Native 的每个版本对依赖包的版本要求非常严格。使用错误的版本可能导致编译失败或运行时崩溃。**始终使用 `npx expo install` 安装依赖**。

2. **iOS 构建需要 macOS + Xcode**：你无法在 Windows 或 Linux 上本地构建 iOS 应用。如果没有 Mac，需要使用 EAS Build 云端构建服务。

3. **Webpack 已被弃用**：如果你的旧项目使用 Webpack 打包 Web 端，应迁移到 Metro。继续使用 Webpack 可能在未来版本中不再受支持。

4. **隧道模式性能较差**：虽然隧道模式可以绕过网络限制，但速度明显慢于局域网直连。开发时优先使用 LAN 模式。

5. **`.expo/` 目录不要提交到 Git**：这个目录包含本地服务器配置，应该在 `.gitignore` 中排除。

6. **子路径托管是实验性功能**：如果你的 Web 应用需要部署在非根路径下，需要注意这个功能可能在未来版本中变化。

7. **CI 环境必须设置 `CI` 环境变量**：否则交互式提示会导致 CI 构建挂起。

## React Web 开发者需要特别注意的地方

1. **开发服务器的交互模式不同**：Web 开发中启动服务器后你直接打开浏览器，而 Expo 的终端 UI 是一个交互式控制台，你需要通过快捷键将应用推送到设备或模拟器。

2. **"构建"的含义更复杂**：Web 的构建主要是打包 JS/CSS/HTML，而移动应用的构建还涉及原生代码编译、签名、生成 APK/IPA 文件等步骤。

3. **没有热模块替换（HMR）的完全等价物**：React Native 有 Fast Refresh，它在大部分场景下类似 Web 的 HMR，但涉及原生代码变更时需要重新构建。

4. **依赖管理更严格**：Web 项目中 `npm install` 通常不会出问题，但在 Expo/React Native 中，版本不匹配可能导致编译失败。这是 React Web 开发者最容易忽视的陷阱。

5. **Web 端支持是附加能力**：Expo 项目默认面向移动端，Web 支持是附加的。如果你的项目同时需要 Web 和移动端，需要注意某些 API 可能在 Web 端不可用。

## 实际开发建议

1. **日常开发流程**：大多数时候你只需要运行 `npx expo start`，然后通过终端 UI 的快捷键来操作。熟悉快捷键能显著提升开发效率。

2. **安装依赖**：始终使用 `npx expo install <package-name>` 而非 `npm install`。

3. **调试技巧**：遇到 CLI 行为异常时，使用 `DEBUG=expo:*` 环境变量开启详细日志来排查问题。

4. **性能优化**：使用 `EXPO_ATLAS` 分析打包体积，找出可以优化的大依赖。这类似于 Web 开发中使用 `webpack-bundle-analyzer`。

5. **CI/CD 集成**：在 CI 环境中设置 `CI=true` 和 `EXPO_NO_CACHE=1`，确保构建过程不会被交互式提示或缓存问题干扰。

6. **隐私保护**：如果你对数据收集有顾虑，可以在项目中统一设置 `EXPO_NO_TELEMETRY=1`。

## 总结

Expo CLI 是 Expo 开发的核心工具，提供了从开发、构建到部署的完整工作流。对于 React Web 开发者来说，最需要适应的是：移动端开发的构建过程更复杂、依赖版本管理更严格、以及开发服务器的交互模式不同。通过掌握本文介绍的命令、快捷键和环境变量，你可以高效地进行 Expo 项目开发。

---

## 文档导航

- **上一页**：[expo sfv 0](./244__expo-sfv-0.md)
- **下一页**：[create expo](./246__create-expo.md)
