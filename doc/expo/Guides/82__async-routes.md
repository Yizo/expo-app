# 异步路由（Async Routes）

> **原文地址**：<https://docs.expo.dev/router/web/async-routes/>
>
> **最后修改日期**：2026 年中

---

> **警告**：异步路由目前处于 **Alpha（内测）** 阶段。该功能会自动按路由文件拆分 JavaScript 包（bundle），并利用 **React Suspense** 机制来加速开发流程、缩小初始包体积。仅被导航到的路由才会被加载到内存中。

## 概述

异步路由（Async Routes）是 Expo Router 提供的一项实验性功能，其核心思想是将 JavaScript 包按照**路由文件**进行自动拆分（即 route-based bundle splitting），每个路由的代码只在用户实际导航到该页面时才进行加载。这一机制借助 React 的 **Suspense** 边界来实现按需加载，从而带来两方面的好处：

1. **加速开发体验**：开发阶段只需编译当前访问的路由，而非整个应用，显著缩短热更新和初始编译时间。
2. **缩小初始包体积**：生产构建中，用户首次加载时只需下载入口路由的代码，其他路由代码在需要时才拉取。

> **关键术语解释（面向初学者）**：
> - **Bundle Splitting（包拆分/代码分割）**：将一个大型的 JavaScript 打包文件拆分为多个较小的文件（chunk），使应用可以按需加载，减少首次加载时间。
> - **React Suspense**：React 提供的一种机制，允许组件在等待某些异步操作（如代码加载、数据获取）完成时展示"加载中"的占位内容（fallback）。它本质上是一种声明式的异步加载管理方式。
> - **Lazy Loading（懒加载/延迟加载）**：延迟加载资源直到真正需要时才加载，而非在应用启动时一次性加载所有资源。
> - **Chunk（代码块）**：经过包拆分后生成的独立 JavaScript 文件片段，每个 chunk 可以被独立加载。
> - **Hermes Engine**：Meta（原 Facebook）为 React Native 开发的 JavaScript 引擎，具有字节码预编译和内存映射特性，能显著提升原生应用的启动速度和运行时性能。

---

## Hermes 引擎应用的特殊说明

使用 **Hermes 引擎** 的原生应用在包拆分方面的内存收益较少，这是因为 Hermes 已经通过**字节码内存映射（bytecode memory mapping）** 预先优化了内存使用。换言之，Hermes 在启动时并不会将整个 JavaScript 包全部加载到内存中，而是通过操作系统的虚拟内存机制按需映射，因此即使不做路由级别的包拆分，内存占用也已经得到优化。

但即便如此，异步路由在以下场景中仍然有价值：

- **Web 端支持**：Web 环境不使用 Hermes，包拆分可以显著减少初始下载体积。
- **OTA 更新（Over-The-Air Updates）**：拆分后的包可以支持更细粒度的增量更新，只推送变更的路由代码。
- **服务端组件（Server Components）**：为未来的 React Server Components 支持做铺垫。

> **基于文档内容推导**：Hermes 引擎的字节码内存映射机制本质上已经实现了类似"按需加载"的效果，因此对于纯原生应用来说，异步路由带来的内存和性能提升有限。但如果你的应用同时需要支持 Web 端或使用 OTA 更新，异步路由仍然值得启用。

---

## 工作原理

### 核心机制

每个路由文件都被包裹在一个 **Suspense 边界（Suspense Boundary）** 中，实现异步加载。其工作流程如下：

1. **首次访问**某个路由时，加载时间会稍长（因为需要下载该路由对应的代码块）。
2. 加载完成后，代码会被**缓存**，后续再次访问同一路由时几乎是瞬间完成的。
3. 如果某个路由加载失败（例如网络错误），其**父级路由**会通过导出的 `ErrorBoundary` 组件来处理错误展示。

> **关键术语解释**：
> - **Suspense Boundary（Suspense 边界）**：React 中的一个组件边界，当边界内的组件尚未加载完成时，会显示一个回退（fallback）UI。在异步路由中，这个边界包裹了每个路由文件。
> - **ErrorBoundary（错误边界）**：React 中用于捕获子组件树中 JavaScript 错误的组件。它可以展示回退 UI，防止整个应用崩溃。在 Expo Router 中，父路由可以通过导出 `ErrorBoundary` 来处理子路由加载失败的情况。

### 开发环境中的静态分析限制

在开发环境中，**静态分析（static analysis）不可用**，这意味着系统无法在编译时判断一个文件是否导出了默认组件。因此，系统会将**每个文件都视为路由**，无论它是否实际导出了默认的组件。

对于那些没有导出默认组件的文件，系统会在打包后展示一个**回退警告界面（fallback warning）**，提示开发者该文件不是一个有效的路由。

> **关键术语解释**：
> - **静态分析（Static Analysis）**：在不实际运行代码的情况下，分析代码的结构和特性。在这里指的是在编译时判断一个文件是否是一个有效的路由组件。
> - **默认导出（Default Export）**：JavaScript 模块中使用 `export default` 导出的值。在 Expo Router 中，路由文件必须有一个默认导出的组件。

> **基于经验建议**：在开发环境中，确保 `app/` 目录下的每个文件都导出了默认组件，否则可能会看到意外的警告界面。如果某些文件只是工具函数或常量定义，应将它们放在 `app/` 目录之外，或使用 `_` 前缀（如 `_utils.ts`）来让 Expo Router 忽略它们。

### 技术组成

异步路由功能结合了以下三项核心技术：

1. **基于路由的包拆分（Route-based Bundle Splitting）**：每个路由文件被打包为独立的代码块。
2. **开发环境懒加载打包（Lazy Bundling for Development）**：开发阶段仅编译和打包当前访问的路由。
3. **React Suspense**：利用 React 的 Suspense 机制管理异步加载状态。

---

## 配置方法

### 基本配置

要启用异步路由，需要在应用配置文件（`app.json` 或 `app.config.js`）中的 `expo-router` 插件部分设置 `asyncRoutes` 参数。

将 `asyncRoutes` 设置为 `true` 将启用**生产环境**的包拆分：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://acme.com",
          "asyncRoutes": true
        }
      ]
    ]
  }
}
```

> **关键术语解释**：
> - **`asyncRoutes`**：`expo-router` 插件的配置参数，用于控制异步路由功能的启用状态。可接受布尔值（`true`/`false`）或一个平台配置对象。
> - **`origin`**：配置应用的基础 URL 来源。在使用服务端渲染或异步路由时通常需要设置，用于指定资源的来源地址。

### 按平台配置

`asyncRoutes` 支持按平台进行细粒度配置。可以使用一个对象，为 `web`、`android`、`ios` 以及 `default` 分别设置不同的值：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://acme.com",
          "asyncRoutes": {
            "web": true,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

上述配置表示：
- **Web 端**：在生产环境中启用异步路由。
- **其他平台（`default`）**：仅在开发环境（`"development"`）中启用异步路由。

还可以为每个平台单独指定行为：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://acme.com",
          "asyncRoutes": {
            "web": true,
            "android": false,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

上述配置表示：
- **Web 端**：在生产环境中启用异步路由。
- **Android 端**：完全禁用异步路由。
- **其他平台（包括 iOS 等）**：仅在开发环境中启用。

> **关键术语解释**：
> - **`"development"`**：`asyncRoutes` 的一个特殊值，表示仅在开发模式下启用异步路由，生产构建中不启用。这对于只想在开发阶段享受快速编译优势、但不想在生产环境承担不稳定风险的场景非常有用。

> **基于经验建议**：对于大多数项目，推荐的配置策略是：Web 端在生产环境启用（`"web": true`），原生端仅在开发环境启用（`"default": "development"`）。这样可以在 Web 端获得包拆分带来的性能优势，同时在原生开发中享受更快的编译速度，而不会影响原生生产构建的稳定性。

### 清除缓存

在启用异步路由后启动项目时，**必须清除 Metro 缓存**以确保异步加载正确生效。使用以下命令（根据你的包管理器选择）：

```sh
# npm
npx expo start --clear

# yarn
yarn expo start --clear

# pnpm
pnpm expo start --clear

# bun
bun expo start --clear
```

如果需要执行导出操作，同样需要加上 `--clear` 标志：

```sh
# npm
npx expo export --clear

# yarn
yarn expo export --clear

# pnpm
pnpm expo export --clear

# bun
bun expo export --clear
```

> **关键术语解释**：
> - **Metro**：React Native 官方的 JavaScript 打包工具（bundler），负责将项目中的 JavaScript/TypeScript 文件编译和打包。Expo 项目默认使用 Metro。
> - **`--clear` 标志**：命令行参数，指示 Metro 在启动前清除之前的缓存。缓存中可能保存了旧的打包结果，不清除可能导致异步路由配置不生效。

> **基于经验建议**：每次修改 `app.json` 中的 `asyncRoutes` 配置后，都应执行带 `--clear` 标志的命令。否则 Metro 可能会使用旧的缓存配置，导致你误以为异步路由未生效，白白浪费时间排查问题。

---

## 静态渲染（Static Rendering）

在生产环境的 Web 应用中，异步路由支持与**静态渲染**的协同工作。其机制如下：

1. **Node.js 同步解析 Suspense 边界**：在构建阶段，服务器端使用 Node.js 同步地处理所有 Suspense 边界，预先生成 HTML。
2. **异步代码块嵌入 HTML**：根据用户选定的路由，将对应的异步代码块（async chunks）直接连接到生成的 HTML 中。
3. **避免加载状态瀑布（Loading Waterfall）**：通过在 HTML 中预先嵌入所需代码块的引用，避免了在服务端导航时出现一连串的加载状态。

> **关键术语解释**：
> - **静态渲染（Static Rendering）**：在构建阶段预先生成 HTML 文件，部署后由 CDN 或静态服务器直接提供服务。与动态的服务端渲染不同，静态渲染的页面在构建时就已确定内容。
> - **Loading Waterfall（加载瀑布）**：指一连串依次触发的加载状态——首先外层组件展示加载，加载完后内层组件又开始加载，形成"瀑布式"的连续闪烁。通过预先嵌入代码块引用，可以避免这一问题。

### 布局路由的预加载

为了保持一致的初始渲染体验，服务端响应会包含从根到目标**叶子路由**之间的所有**布局路由（layout routes）** 代码。这意味着即使用户直接访问深层页面，所有父级布局的代码也会随初始 HTML 一起加载，确保页面结构和导航框架立即呈现。

### `initialRouteName` 的处理

对于通过 `unstable_settings` 导出了 `initialRouteName` 配置的路由，被指定的初始路由也会被嵌入到初始 HTML 中。这确保了诸如底层模态屏幕（modal screens）等元素能够正确渲染。

```tsx
// 示例：在布局文件中导出 unstable_settings
export const unstable_settings = {
  initialRouteName: 'index',
};
```

> **关键术语解释**：
> - **`unstable_settings`**：Expo Router 中的实验性设置导出，用于配置路由的特定行为。`unstable_` 前缀表示该 API 可能在未来版本中变更。
> - **`initialRouteName`**：指定导航器初始显示的子路由名称。例如在 tabs 布局中，指定哪个标签页作为默认显示页。
> - **布局路由（Layout Route）**：以 `_layout` 命名的路由文件，它定义了子路由的共同布局结构（如导航栏、标签栏等）。布局路由总是会被预加载，因为它决定了页面的整体框架。

> **基于文档内容推导**：静态渲染与异步路由的结合意味着，在 Web 生产环境中，用户可以同时享受到静态站点的首屏加载速度优势和代码分割带来的体积优化。服务端会智能地决定哪些代码块需要预嵌入 HTML，哪些可以延迟加载，实现最佳的性能平衡。

---

## 注意事项与限制（Caveats）

异步路由功能是对未来 **React Server Components（RSC）** 支持的前瞻性预览，因此目前携带了以下限制：

### 1. 原生生产应用不支持

> **警告**：在原生生产构建（native production builds）中，所有 **Suspense 边界将被禁用（disabled）**，这意味着加载指示器（loading indicators）不会显示。原生生产应用目前不支持异步路由的包拆分功能。

> **基于经验建议**：如果你主要为原生平台（iOS/Android）开发，建议在原生端仅启用开发模式的异步路由（`"default": "development"`），以获得开发时的快速编译优势，而不影响生产构建。

### 2. 开发环境的潜在不一致

开发环境中，JavaScript 运行时采用懒加载打包策略，这可能导致 **HTML 内容与可用脚本之间的不匹配（mismatch）**。具体来说，服务端渲染的 HTML 可能在客户端 JavaScript 尚未加载完成时就已经展示给用户，造成短暂的内容不一致。

> **基于文档内容推导**：这种不一致是开发环境特有的问题，主要影响使用服务端渲染的开发调试场景。在生产构建中，静态渲染会同步处理所有边界，因此不会出现此类问题。开发者在开发环境中遇到 HTML/JS 不匹配警告时，不必过度担忧，这是已知的行为限制。

### 3. 自定义 SuspenseFallback 导出被忽略

目前系统会**忽略**自定义的 `SuspenseFallback` 导出。即使你在路由文件中导出了 `SuspenseFallback` 组件，它也不会被使用。框架会使用自己的默认回退行为。

> **关键术语解释**：
> - **`SuspenseFallback`**：在 Expo Router 中，理论上路由文件可以导出一个名为 `SuspenseFallback` 的组件，用于在该路由代码加载期间展示自定义的加载界面。但由于当前版本的限制，该功能不可用。

> **基于经验建议**：如果你需要为特定路由提供自定义的加载状态，可以考虑在路由组件内部使用 React 的 `Suspense` 组件手动包裹内容区域，而不是依赖框架级别的 `SuspenseFallback` 导出。这是一种临时的替代方案，待框架支持后可以迁移。

---

## 完整配置示例

以下是一个综合性的配置示例，展示了在实际项目中如何配置异步路由：

```json
{
  "expo": {
    "name": "my-app",
    "web": {
      "output": "server"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://my-app.example.com",
          "asyncRoutes": {
            "web": true,
            "android": false,
            "ios": false,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

> **基于经验建议**：上述配置的策略是：
> - **Web 端**在生产环境中启用异步路由，充分利用包拆分减少首屏加载时间。
> - **Android 和 iOS** 原生端显式禁用生产环境的异步路由，因为 Hermes 引擎的字节码映射已经优化了内存使用，且原生端对该功能的支持尚不完善。
> - **`default: "development"`** 确保在开发环境中所有平台都能享受懒加载打包带来的快速编译优势。

---

## 总结

| 特性 | Web 端 | 原生端（Hermes） |
|------|--------|------------------|
| 包拆分收益 | 显著减少初始加载体积 | 内存收益有限（字节码已映射） |
| 开发环境加速 | 支持（懒加载编译更快） | 支持（懒加载编译更快） |
| 生产环境支持 | 支持（Alpha） | 不支持（Suspense 被禁用） |
| 静态渲染兼容 | 支持 | 不适用 |
| OTA 更新优化 | 支持细粒度更新 | 支持细粒度更新 |

> **基于文档内容推导**：异步路由是一项面向未来的功能，它为 Web 端带来了明确的性能收益，为原生端则主要提供开发体验的改善。随着 React Server Components 的成熟，异步路由将成为 Expo Router 的核心能力之一。现阶段建议根据项目需求选择性启用，而非盲目在所有平台开启。

---

## 文档导航

- **上一页**：[server rendering](./81__server-rendering.md)
- **下一页**：[error handling](./83__error-handling.md)
