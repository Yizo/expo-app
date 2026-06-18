# 使用 Expo Atlas 和 Lighthouse 分析 JavaScript 包体积

> 原文地址：https://docs.expo.dev/guides/analyzing-bundles/

**学习目标**：了解如何使用 Expo Atlas 和 Lighthouse 优化 Expo 应用和网站的生产环境 JavaScript 包（bundle）体积。

---

## 前置概念说明

在开始之前，先解释几个本文会反复出现的关键术语：

- **JavaScript Bundle（包）**：应用的所有 JavaScript 代码经过打包工具（如 Metro）处理后，合并生成的一个或多个文件。浏览器或运行时加载的就是这些文件。
- **Bundle Size（包体积）**：打包后 JavaScript 文件的大小（通常以 KB 或 MB 为单位）。包体积越小，下载和解析速度越快，应用启动时间越短。
- **Source Map（源码映射）**：一种将打包/压缩后的代码映射回原始源代码的文件（`.map`），方便调试和分析每个模块占用的空间。
- **Bytecode（字节码）**：一种预编译的二进制格式。Web 浏览器不支持直接运行字节码，所以 Web 端必须下载和解析纯 JavaScript 文本，这使得包体积对 Web 性能影响尤为显著。Hermes 引擎（React Native 在原生平台上使用的 JS 引擎）支持字节码。
- **Metro**：React Native 官方使用的 JavaScript 打包工具（bundler），负责将项目中的所有模块打包成最终产物。
- **Expo Atlas**：Expo 官方提供的包体积可视化分析工具，能以图形化方式展示每个库在最终产物中所占的空间。
- **Lighthouse**：Google 开发的网站质量审计工具，可以评估网页的性能（加载速度）、可访问性（accessibility）、最佳实践等指标。
- **EAS Update**：Expo Application Services 提供的 OTA（Over-The-Air，空中更新）服务，可以在不重新发布应用商店版本的情况下推送 JavaScript 更新。
- **SDK**：Software Development Kit（软件开发工具包），这里指 Expo SDK 的版本号。不同 SDK 版本支持的功能和工具可能不同。
- **npx / yarn dlx / pnpm dlx / bunx**：分别是 npm、yarn、pnpm、bun 四种包管理器提供的"一次性执行"命令，可以直接运行一个 npm 包而无需全局安装。

---

## 为什么包体积很重要？

不同平台的包性能表现不同。例如，**Web 浏览器不支持预编译的字节码**，因此 JavaScript 包体积对于提升启动时间和运行时性能至关重要。**包越小，下载和解析速度越快**。

> **基于文档内容推导**：对于原生平台（iOS/Android），由于 Hermes 引擎会将 JavaScript 预编译为字节码，包体积对启动速度的影响相对较小；但对于 Web 平台，包体积是性能优化的核心指标之一。

---

## 使用 Expo Atlas 分析包体积

项目中使用的**第三方库（libraries）**会直接影响生产环境 JavaScript 包的大小。你可以使用 **Expo Atlas** 来可视化生产包，并识别哪些库占用了较多的空间。

> **术语解释**："可视化"是指以图形（通常是类似树状图/气泡图）的方式展示每个模块/库在最终包中所占的比例，让你一眼看出哪些依赖是"大户"。

### 配合 `npx expo start` 使用 Atlas

你可以在本地开发服务器运行时同时启用 Expo Atlas。这种方式下，每当你修改项目中的代码，Atlas 都会自动更新分析结果。

当你的应用通过本地开发服务器在 Android、iOS 和/或 Web 上运行时，你可以通过**开发者工具插件菜单**（快捷键 `Shift + M`）打开 Atlas。

启动命令如下：

```sh
# npm
EXPO_ATLAS=true npx expo start

# yarn
EXPO_ATLAS=true yarn expo start

# pnpm
EXPO_ATLAS=true pnpm expo start

# bun
EXPO_ATLAS=true bun expo start
```

> **术语解释**：`EXPO_ATLAS=true` 是一个环境变量（environment variable），它告诉 Expo 的开发服务器启用 Atlas 分析功能。等号前面的 `EXPO_ATLAS` 是变量名，`true` 是变量值。

### 将开发模式切换为生产模式

默认情况下，Expo 以**开发模式（development mode）**启动本地开发服务器。开发模式会禁用一些在生产模式中启用的优化措施（如代码压缩、Tree Shaking 等），因此开发模式下看到的包体积**不能**代表真实的生产包体积。

你可以将本地开发服务器切换为**生产模式（production mode）**，以获得更准确的生产包体积：

```sh
# npm
EXPO_ATLAS=true npx expo start --no-dev

# yarn
EXPO_ATLAS=true yarn expo start --no-dev

# pnpm
EXPO_ATLAS=true pnpm expo start --no-dev

# bun
EXPO_ATLAS=true bun expo start --no-dev
```

> **术语解释**：`--no-dev` 参数表示"非开发模式"，即生产模式。在该模式下，Metro 会启用代码压缩（minification）、Tree Shaking（移除未使用的代码）等优化手段，使得分析结果更接近实际发布时的包体积。

### 配合 `npx expo export` 使用 Expo Atlas

你也可以在为应用或 EAS Update 生成生产包时使用 Expo Atlas。Atlas 会在导出过程中生成一个 **`.expo/atlas.jsonl`** 文件，该文件可以独立分享和打开，无需依赖原始项目源码。

```sh
# npm
EXPO_ATLAS=true npx expo export
npx expo-atlas .expo/atlas.jsonl

# yarn
EXPO_ATLAS=true yarn expo export
yarn dlx expo-atlas .expo/atlas.jsonl

# pnpm
EXPO_ATLAS=true pnpm expo export
pnpm dlx expo-atlas .expo/atlas.jsonl

# bun
EXPO_ATLAS=true bun expo export
bunx expo-atlas .expo/atlas.jsonl
```

> **术语解释**：
> - `npx expo export`：将项目导出为生产环境的静态文件（HTML、JS、CSS 等）。
> - `.jsonl` 文件：JSON Lines 格式的文件，每行是一个独立的 JSON 对象，适合存储大量结构化数据。
> - `npx expo-atlas .expo/atlas.jsonl`：用 Expo Atlas 工具打开之前生成的分析数据文件，在浏览器中展示可视化结果。

你也可以使用 `--platform` 选项指定想要分析的平台，Expo Atlas 将**仅收集已导出平台的数据**：

```sh
# 例如，仅分析 Web 平台
EXPO_ATLAS=true npx expo export --platform web
```

### 分析转换后的模块

在 Atlas 的可视化界面中，你可以按住 **⌘ Cmd** 键并点击图表中的节点，查看**转换后的模块详情（transformed module details）**。

此功能可以帮助你了解：
- 一个模块是如何被 **Babel** 转换的
- 该模块导入了（import）哪些其他模块
- 哪些模块导入了该模块

> **术语解释**：
> - **Babel**：一个 JavaScript 编译器/转译器，负责将现代 JavaScript 语法转换为兼容性更好的代码，也会处理 JSX（React 的模板语法）等特殊语法。
> - **模块（module）**：在 JavaScript 中，一个文件通常就是一个模块。模块之间通过 `import`/`export` 语句相互引用。

这可以用来**追溯一个模块在整个依赖图中的来源**——比如你发现某个库占用了很大的空间，通过 Atlas 可以追踪到是哪个模块引入了它。

---

## 使用 source-map-explorer 分析包体积

> **适用版本**：**SDK 50 及更早版本**的替代方法。

如果你使用的是 SDK 50 或更低版本，可以使用 `source-map-explorer` 库来可视化和分析生产环境的 JavaScript 包。

> **术语解释**：`source-map-explorer` 是一个开源工具，它读取 Source Map 文件并生成一个可视化的 HTML 报告，展示每个源文件在最终打包产物中所占的空间大小。

### 安装

运行以下命令安装 `source-map-explorer`：

```sh
# npm
npm install --save-dev source-map-explorer

# yarn
yarn add --dev source-map-explorer

# pnpm
pnpm add --save-dev source-map-explorer

# bun
bun add --dev source-map-explorer
```

> **术语解释**：`--save-dev`（或 `--dev`）表示将该包安装为**开发依赖（devDependency）**，即只在开发和构建阶段使用，不会被包含在最终的生产应用中。

### 配置 package.json 脚本

在 **package.json** 中添加运行脚本。根据你使用的平台和 SDK 版本，可能需要调整输入路径。以下示例假设项目使用 Expo SDK 50，且未使用 Expo Router 的 `server` 输出模式：

```json
{
  "scripts": {
    "analyze:web": "source-map-explorer 'dist/_expo/static/js/web/*.js' 'dist/_expo/static/js/web/*.js.map'",
    "analyze:ios": "source-map-explorer 'dist/_expo/static/js/ios/*.js' 'dist/_expo/static/js/ios/*.js.map'",
    "analyze:android": "source-map-explorer 'dist/_expo/static/js/android/*.js' 'dist/_expo/static/js/android/*.js.map'"
  }
}
```

> **术语解释**：
> - `dist/`：`npx expo export` 命令的默认输出目录，存放所有导出的生产文件。
> - `_expo/static/js/web/*.js`：Web 平台导出的 JavaScript 文件。`*.js` 是通配符，匹配所有 `.js` 文件。
> - `*.js.map`：对应的 Source Map 文件。
> - 三个脚本分别分析 Web、iOS 和 Android 平台的包体积。

如果你使用的是 SDK 50 的 `server` 输出模式来处理 Web 端，则需要使用以下命令来映射 Web 包：

```sh
# npm
npx source-map-explorer 'dist/client/_expo/static/js/web/*.js' 'dist/client/_expo/static/js/web/*.js.map'

# yarn
yarn dlx source-map-explorer 'dist/client/_expo/static/js/web/*.js' 'dist/client/_expo/static/js/web/*.js.map'

# pnpm
pnpm dlx source-map-explorer 'dist/client/_expo/static/js/web/*.js' 'dist/client/_expo/static/js/web/*.js.map'

# bun
bunx source-map-explorer 'dist/client/_expo/static/js/web/*.js' 'dist/client/_expo/static/js/web/*.js.map'
```

> **注意**：Web 包被输出到 **`dist/client`** 子目录下，这是为了防止将服务端代码暴露给客户端。

> **基于文档内容推导**：Expo Router 的 `server` 输出模式支持服务端渲染（SSR），因此产出分为 `client`（客户端）和 `server`（服务端）两部分。分析客户端包时应指向 `dist/client/` 路径。

### 导出生产包并生成 Source Map

导出生产环境的 JavaScript 包时，需要加上 `--source-maps` 标志，以便 source-map-explorer 能够读取映射文件。对于使用 **Hermes** 引擎的原生应用，需要使用 `--no-bytecode` 选项来禁用字节码生成：

```sh
# npm
npx expo export --source-maps --platform web
npx expo export --source-maps --platform ios --no-bytecode

# yarn
yarn expo export --source-maps --platform web
yarn expo export --source-maps --platform ios --no-bytecode

# pnpm
pnpm expo export --source-maps --platform web
pnpm expo export --source-maps --platform ios --no-bytecode

# bun
bun expo export --source-maps --platform web
bun expo export --source-maps --platform ios --no-bytecode
```

> **术语解释**：
> - `--source-maps`：指示 Expo 在导出时同时生成 Source Map 文件。
> - `--platform web`：仅导出 Web 平台的产物。
> - `--no-bytecode`：禁用 Hermes 引擎的字节码预编译。source-map-explorer 需要读取纯 JavaScript 文件和对应的 Source Map，如果生成了字节码，映射关系将不准确。

该命令会在输出中显示 JavaScript 包和 Source Map 的路径。在下一步中，你将把这些路径传递给 source-map-explorer。

> **警告**：避免将 Source Map 发布到生产环境，因为它们可能导致**安全问题**（暴露原始源代码）和**性能问题**（浏览器会下载这些体积较大的映射文件）。

> **基于经验建议**：在 CI/CD 流程中，应该确保 Source Map 文件仅用于内部分析，不会被部署到生产服务器或 CDN 上。可以通过在部署步骤中排除 `.map` 文件来实现。

### 运行分析脚本

运行脚本来分析你的包：

```sh
# npm
npm run analyze:web

# yarn
yarn run analyze:web

# pnpm
pnpm run analyze:web

# bun
bun run analyze:web
```

### 常见问题排查

运行此命令时，你可能会看到以下错误：

```text
You must provide the URL of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer
```

这可能是由于 `source-map-explorer` 在 **Node.js 18 及以上版本**中的一个已知问题。要解决此问题，在运行分析脚本之前设置环境变量 `NODE_OPTIONS=--no-experimental-fetch`：

```sh
NODE_OPTIONS=--no-experimental-fetch npm run analyze:web
```

> **术语解释**：
> - **WebAssembly（.wasm）**：一种低级别的类汇编语言，可在浏览器中以接近原生的速度运行。`source-map-explorer` 内部依赖 WebAssembly 模块来解析 Source Map。
> - **`--no-experimental-fetch`**：Node.js 18 引入了基于 `undici` 的新版全局 `fetch` API（标记为实验性），该实现与某些依赖 WebAssembly 的库存在兼容性问题。此选项强制 Node.js 使用旧版网络实现。

你可能还会遇到类似如下的警告：

> `Unable to map 809/13787 bytes (5.87%)`

这种情况是正常的，因为 Source Map 通常会排除打包工具的运行时定义（例如 `__d(() => {}, [])`）。这个值是固定的，**不需要担心**。

> **术语解释**：`__d(() => {}, [])` 是 Metro 打包器用于定义模块的运行时辅助函数。这些代码在打包时自动注入，不会出现在原始源代码中，因此 Source Map 中没有对应的映射关系。

---

## 使用 Lighthouse 审计网站性能

**Lighthouse** 是评估网站速度、可访问性和性能表现的绝佳工具。你可以使用 Chrome 浏览器内置的 **Audit（审计）** 标签页，或使用 Lighthouse CLI（命令行工具）来测试你的项目。

> **术语解释**：
> - **可访问性（Accessibility，简称 a11y）**：指网站对残障用户（如视障、听障）的友好程度，包括是否支持屏幕阅读器、键盘导航、颜色对比度等。
> - **Audit（审计）**：Lighthouse 对网页进行全面检查后生成的报告，包含性能评分、最佳实践建议等。

在使用 `npx expo export -p web` 创建生产构建并将其部署后（可以使用 `npx serve dist` 本地预览，或通过生产环境部署、自定义服务器托管），运行 Lighthouse 对你的网站 URL 进行审计：

```sh
# npm
npm install --global lighthouse
npx lighthouse <url> --view

# yarn
yarn global add lighthouse
yarn dlx lighthouse <url> --view

# pnpm
pnpm add --global lighthouse
pnpm dlx lighthouse <url> --view

# bun
bun add --global lighthouse
bunx lighthouse <url> --view
```

> **术语解释**：
> - `npm install --global`：将包安装为全局工具，可以在任何目录下使用。
> - `<url>`：替换为你网站的实际 URL，例如 `http://localhost:3000` 或 `https://my-app.example.com`。
> - `--view`：在分析完成后自动在浏览器中打开 Lighthouse 报告。
> - `npx serve dist`：一个轻量级的静态文件服务器，用于在本地预览导出的 Web 构建产物。

> **基于经验建议**：Lighthouse 的评分会受到网络环境、设备性能等因素的影响。建议多次运行取平均值，并在与目标用户相似的网络条件下进行测试。同时，Lighthouse 不仅评估 JavaScript 包体积，还会检查图片优化、CSS 加载策略、缓存配置等多个维度，是一个全面的性能审计工具。

---

## 总结与最佳实践

| 工具 | 适用场景 | SDK 版本 | 输出形式 |
|------|---------|----------|---------|
| **Expo Atlas** | 可视化分析包体积，定位"大户"依赖 | SDK 51+ | 交互式 Web 界面 |
| **source-map-explorer** | 基于 Source Map 分析包体积 | SDK 50 及更早 | HTML 报告 |
| **Lighthouse** | 全面审计网站性能（速度、可访问性等） | 所有版本 | 浏览器报告 |

**基于文档内容推导的核心工作流**：

1. **开发阶段**：使用 `EXPO_ATLAS=true npx expo start --no-dev` 实时观察包体积变化
2. **发布前**：使用 `EXPO_ATLAS=true npx expo export` 生成生产包并分析
3. **部署后**：使用 Lighthouse 对线上网站进行全面审计
4. **追溯依赖**：在 Atlas 中按住 ⌘ Cmd 点击节点，追踪模块的引入来源

---

## 文档导航

- **上一页**：[customizing metro](./27__customizing-metro.md)
- **下一页**：[tree shaking](./29__tree-shaking.md)
