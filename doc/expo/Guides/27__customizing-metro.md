# 自定义 Metro 配置

> 原文地址：https://docs.expo.dev/guides/customizing-metro/

本文档介绍如何调整 Metro 打包器（bundler）的各项设置。Expo CLI 在开发（development）和导出（export）阶段依赖 Metro 来打包 JavaScript 代码和资源文件。Metro 专为 React Native 优化，能够支撑像 Instagram 这样的大型应用。

---

## 什么是 Metro？

> **初学者说明**：Metro 是 React Native 生态中的 JavaScript 打包工具（bundler），类似于 Web 开发中的 Webpack 或 Vite。它的核心工作是将你编写的模块化代码（多个 `.js`、`.ts`、`.tsx` 文件）合并（bundle）成浏览器或原生运行时能够执行的少量文件，同时处理图片、字体等静态资源。

---

## 自定义 Metro 配置

要修改打包器的行为，需要在项目根目录创建一个 `metro.config.js` 文件。该文件必须导出一个继承自 `expo/metro-config` 包的配置对象，以保持版本一致性。

使用你的包管理器执行以下命令，自动生成配置模板：

```sh
# npm
npx expo customize metro.config.js

# yarn
yarn expo customize metro.config.js

# pnpm
pnpm expo customize metro.config.js

# bun
bun expo customize metro.config.js
```

生成的配置文件内容如下：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

> **关键概念说明**：
> - `getDefaultConfig(__dirname)`：该函数返回 Expo 为当前项目提供的默认 Metro 配置。`__dirname` 是 Node.js 中的全局变量，表示当前文件所在的目录路径，用于让 Metro 知道项目的根目录在哪里。
> - `module.exports`：Node.js 的模块导出语法，将配置对象暴露给 Metro 读取。

> **注意（限制说明）**
>
> Expo 锁定了部分 Metro 配置选项，以防止项目出现不可预期的问题。并非上游 Metro 接受的所有选项都可以自定义或受支持。此外，Expo 不支持从 YAML 文件（上游已弃用的格式）加载 Metro 配置，也不支持加载位于项目仓库外部的 Metro 配置文件。

> **基于经验建议**：修改 `metro.config.js` 后，通常需要重启开发服务器（按 `Ctrl+C` 停止后重新运行 `npx expo start`）才能使更改生效。如果遇到缓存问题，可以尝试运行 `npx expo start --clear` 清除缓存。

---

## 资源文件（Assets）

Metro 将文件分为两大类：**源代码**（source code）和**资源文件**（assets）。

> **初学者说明**：
> - **源代码**：需要被编译/转换的文件，如 `.js`、`.ts`、`.tsx` 文件。Metro 会对它们进行语法转换、模块合并等处理。
> - **资源文件**：不需要被转换的静态文件，如图片（`.png`、`.jpg`）、字体（`.ttf`）、数据库文件（`.db`）等。Metro 会直接复制这些文件到输出目录。

所有文件扩展名必须在打包器启动前通过以下两个配置项显式定义：

- `resolver.sourceExts`：源代码文件的扩展名列表（如 `['js', 'ts', 'tsx', 'jsx']`）
- `resolver.assetExts`：资源文件的扩展名列表（如 `['png', 'jpg', 'ttf', 'db']`）

### 添加资源文件扩展名

一个常见的需求是添加新的资源文件类型。只需将扩展名（不带前导点号 `.`）追加到 `assetExts` 数组中：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // 添加对 `.db` 文件的支持，用于 SQLite 数据库
  'db'
);

module.exports = config;
```

> **基于经验建议**：如果你使用了 `expo-sqlite`、`expo-asset` 等需要加载非标准文件类型的库，通常需要在此处添加对应的扩展名。忘记添加是新手常见的报错原因之一。

---

## 模块别名（Aliases）

模块别名是指将一个模块的导入路径重定向到另一个模块。例如，你可能想把所有对 `old-module` 的引用自动替换为 `new-module`。

> **初学者说明**：在大型项目中，有时需要替换某个依赖库（比如旧库已废弃，需要用新库替代），但又不想逐个文件修改 `import` 语句。模块别名可以统一处理这种重定向。

由于 Metro 同时为多个平台（iOS、Android、Web）打包，推荐使用**自定义解析器**（custom resolver）而非基于代码转换（transform）的方案来实现别名。自定义解析的结果**不会被缓存**，重启服务器后立即生效，无需清除缓存。

### 全局别名示例

```js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const ALIASES = {
  'old-module': 'new-module',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 确保调用默认解析器
  return context.resolveRequest(
    context,
    // 如果存在别名则使用别名，否则使用原始模块名
    ALIASES[moduleName] ?? moduleName,
    platform
  );
};

module.exports = config;
```

> **关键概念说明**：
> - `resolveRequest`：Metro 的模块解析函数，每当遇到 `import` 或 `require` 语句时都会被调用。
> - `context`：包含当前解析上下文信息，其中的 `context.resolveRequest` 是默认解析逻辑。
> - `moduleName`：当前正在解析的模块名称（即 `import` / `require` 中的路径字符串）。
> - `platform`：当前目标平台，可能的值为 `'ios'`、`'android'`、`'web'` 等。
> - `??`（空值合并运算符）：JavaScript 运算符，仅当左侧值为 `null` 或 `undefined` 时才使用右侧的值。这里表示"如果 ALIASES 中有对应别名就用别名，否则用原始模块名"。

### 平台特定别名示例（仅 Web 端生效）

如果只想让别名在特定平台上生效，可以根据 `platform` 参数进行条件判断：

```js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // 该别名仅在打包 Web 端时使用
    return context.resolveRequest(context, ALIASES[moduleName] ?? moduleName, platform);
  }
  // 确保调用默认解析器
  return context.resolveRequest(context, moduleName, platform);
};
```

> **基于文档内容推导**：通过修改条件判断，可以轻松实现"仅在 iOS/Android 上使用别名"或"Web 端使用模块 A，原生端使用模块 B"等更复杂的场景。

修改后重启开发服务器即可生效。与基于代码转换的方案不同，自定义解析的结果不会被缓存，因此无需清除缓存。

---

## 文件监听与文件系统爬取

从 SDK 56 开始，Expo 默认启用了**按需文件系统访问**（on-demand filesystem access）功能。

> **初学者说明**：
> - **文件监听（File Watching）**：Metro 会监控项目文件的变化，当文件被修改时自动重新打包。这在开发过程中实现"热更新"（Hot Reload）。
> - **文件系统爬取（Filesystem Crawling）**：Metro 启动时需要扫描项目目录，建立一个文件映射表（file map），记录所有可用的文件。
> - **符号链接依赖（Symlinked Dependencies）**：在 monorepo（单一代码仓库管理多个包的项目结构）中，某些依赖包可能通过符号链接（symlink）的方式引用，它们的实际位置在项目根目录之外。
> - **watchFolders**：Metro 的一个配置选项，用于指定需要额外监听的目录列表。在旧版本中，你需要手动将所有符号链接指向的目录添加到这个列表中。

该功能由应用配置中的 `experiments.onDemandFilesystem` 标志控制，默认处于启用状态。

启用后的改进：
- `watchFolders` 不再需要包含应用所打包的每一个模块
- 符号链接的外部依赖可以被正确解析，无需手动配置

> **基于经验建议**：如果你在 monorepo 环境中（如使用 pnpm workspace、Yarn workspace 或 Turborepo）遇到"找不到模块"的错误，首先确认 `experiments.onDemandFilesystem` 是否已启用。在 SDK 56 之前，这类问题通常需要手动配置 `watchFolders`。

---

## 代码分割（Bundle Splitting）

Expo CLI 在 Web 端支持通过**异步导入**（async imports）实现自动代码分割。

> **初学者说明**：代码分割是将应用拆分成多个较小的代码块（chunk），使得用户首次加载时只需下载最少的代码。其余代码在需要时才异步加载。这能显著提升首屏加载速度。

当与 **Expo Router**（Expo 的官方路由库）配合使用时，Metro 会自动按 `app` 目录下的路由文件进行代码分割。这意味着：
- 每个路由页面被拆分为独立的代码块
- 只有当前访问的路由对应的 JavaScript 会被立即加载
- 其他路由的 JavaScript 会延迟到用户导航至该页面时才加载

> **基于文档内容推导**：对于原生端（iOS/Android），代码分割的支持取决于平台特性。原生端通常使用单个 bundle 文件，但可以通过手动使用 `React.lazy()` 和 `Suspense` 实现类似的按需加载效果。

---

## 摇树优化（Tree Shaking）

Expo CLI 使用摇树优化来消除生产环境打包中的**无用代码**（dead code）。

> **初学者说明**：摇树优化（Tree Shaking）是一种优化技术，它会分析代码的导入/导出关系，自动移除那些被导入但从未被实际使用的函数、变量或模块。例如，如果你只从 lodash 中使用了 `debounce` 函数，摇树优化会确保 lodash 的其他数百个函数不会被打包进最终产物。

如需了解更多关于摇树优化如何优化生产环境打包的细节，请参阅 Expo 的 [Tree Shaking 指南](https://docs.expo.dev/guides/tree-shaking/)。

---

## 代码压缩（Minification）

Expo CLI 允许自定义 JavaScript 代码的压缩流程。

> **初学者说明**：代码压缩（Minification）是指在生产构建中缩短变量名、移除空白和注释等操作，目的是减小最终产物的文件体积，加快下载和解析速度。

如需了解如何定制 JavaScript 代码压缩流程，请参阅 Expo 的 [Minification 指南](https://docs.expo.dev/guides/minify/)。

---

## Web 端支持

Metro 是 Expo CLI 推荐的通用打包器，同时适用于 Web 项目。这意味着你可以使用同一个打包器来构建 iOS、Android 和 Web 应用。

> **初学者说明**：过去 Expo 使用 Webpack 作为 Web 端的打包器。现在 Webpack 适配器已被弃用（deprecated），官方推荐使用 Metro 作为统一打包器。

如果你正在从已弃用的 Webpack 适配器迁移，请参阅 [Expo Router 迁移指南](https://docs.expo.dev/router/migrate/from-expo-webpack/) 和相关的对比说明。

### 启用 Web 端支持

更新应用配置文件（`app.json` 或 `app.config.js`）：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

### 启动开发服务器

使用以下命令启动 Web 端开发服务器：

```sh
# npm
npx expo start --web

# yarn
yarn expo start --web

# pnpm
pnpm expo start --web

# bun
bun expo start --web
```

也可以在终端交互界面中按 **W** 键来启动 Web 开发服务器。

### 静态文件托管

将静态文件放置在项目根目录的 `public/` 目录下，即可通过开发服务器进行托管。常见用途包括 `favicon.ico` 等文件。

在导出（export）时，`public/` 目录的内容会被复制到 `dist/` 输出目录中，应用可以相对于主机 URL 来获取这些资源。

你还可以通过在 `public/` 目录下创建 `index.html` 文件来覆盖默认的 HTML 入口文件。

> **警告**
>
> Metro 保留了某些路径（如 `/assets`）。请避免在 `public/assets/` 或其他保留路径下放置文件，否则可能导致冲突或不可预期的行为。

> **基于文档内容推导**：目前 `public/` 目录的静态文件托管功能仅适用于 Web 端。文档提到"最终它将跨平台通用"，意味着未来原生端可能也会支持类似机制。

---

## TypeScript 支持

Metro 配置支持读取 `tsconfig.json` 或 `jsconfig.json` 中的以下编译选项：

- `compilerOptions.paths`：定义模块路径映射（别名）
- `compilerOptions.baseUrl`：定义基础路径，用于解析非相对导入

这使得你可以直接使用 TypeScript 的路径别名功能来实现绝对导入（absolute imports）和模块别名，而无需在 Metro 配置中重复定义。

> **初学者说明**：例如，在 `tsconfig.json` 中配置了 `"paths": { "@/*": ["./src/*"] }` 后，你就可以在代码中使用 `import { Button } from '@/components/Button'` 而无需写冗长的相对路径（如 `../../../components/Button`）。

> **注意**：裸工作流（Bare Workflow）项目需要额外的设置步骤。请参阅 Expo 的 [裸工作流 Metro 配置指南](https://docs.expo.dev/versions/latest/config/metro/#bare-workflow-setup)。

> **关键概念说明**：裸工作流（Bare Workflow）是指不使用 Expo 的预构建（Prebuild）机制，而是直接管理 `ios/` 和 `android/` 原生目录的项目结构。这类似于直接使用 React Native CLI 创建的项目。

---

## CSS 支持

Metro 为使用 Expo CLI 打包的网站提供了内置的 CSS 样式支持。

如需了解如何在 Expo CLI 打包的网站中使用 CSS，请参阅 Expo 的 [CSS 配置指南](https://docs.expo.dev/versions/latest/config/metro/#css)。

---

## 完整配置示例

以下是一个整合了多个自定义项的 `metro.config.js` 配置示例：

```js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 添加自定义资源文件扩展名
config.resolver.assetExts.push('db');

// 配置模块别名
const ALIASES = {
  'old-module': 'new-module',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  return context.resolveRequest(
    context,
    ALIASES[moduleName] ?? moduleName,
    platform
  );
};

module.exports = config;
```

> **基于经验建议**：
> 1. 始终从 `getDefaultConfig(__dirname)` 获取默认配置后再进行修改，不要从零开始编写配置。这样可以确保与 Expo SDK 版本的兼容性。
> 2. 每次修改 `metro.config.js` 后，建议运行 `npx expo start --clear` 清除缓存并重启开发服务器。
> 3. 如果配置中使用了 `resolveRequest` 自定义解析器，务必确保在所有条件分支中都调用了 `context.resolveRequest`（默认解析器），否则会导致模块解析失败。
> 4. 在 monorepo 环境中，如果遇到符号链接相关的问题，优先检查 `experiments.onDemandFilesystem` 是否已启用（SDK 56+ 默认启用）。

---

## 文档导航

- **上一页**：[local https development](./26__local-https-development.md)
- **下一页**：[analyzing bundles](./28__analyzing-bundles.md)
