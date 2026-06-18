# 手动安装 Expo Router

> 原始文档地址：https://docs.expo.dev/router/installation/
>
> 文档版本：Expo SDK 56

---

## 简介

本文档介绍如何将 Expo Router 集成到一个**已有的项目**中。如果你要创建新项目，请参阅介绍指南中的[快速开始（Quick start）](https://docs.expo.dev/router/introduction/#quick-start)部分。

> **新手须知**
>
> - **Expo Router**：Expo 官方提供的文件路由库（file-based router），它基于文件系统的路由结构来自动生成应用的导航（navigation）。你只需在特定目录中创建文件，Expo Router 就会自动将它们映射为应用中的页面和路由，无需手动编写路由配置代码。
> - **文件路由（file-based routing）**：一种路由组织方式，其中文件系统中的目录和文件结构直接对应应用的导航结构。例如，`app/index.tsx` 对应应用的主页路由，`app/profile.tsx` 对应个人资料页面路由。这种方式借鉴了 Next.js 等 Web 框架的理念，使其更易于理解和维护。
> - **深度链接（deep linking）**：一种通过 URL（链接）直接打开应用内特定页面的技术。例如，用户点击 `myapp://profile/123` 链接后，会直接跳转到你应用中的个人资料页面，而不是应用首页。在 app config 中配置的 `scheme` 字段就是用于定义你应用可响应的 URL 协议前缀。

---

## 前置条件

### 配置开发环境

在开始之前，请确保你的电脑已经[配置好运行 Expo 应用所需的开发环境](https://docs.expo.dev/get-started/create-a-project/)。

> **新手须知**
>
> - **开发环境**：指开发移动应用所需的软件工具集合。对于 Expo/React Native 项目，通常需要安装 Node.js、npm（或其他包管理器如 yarn/pnpm/bun）、Android Studio（用于 Android 开发）和 Xcode（用于 iOS 开发，仅限 macOS）等工具。

---

## 一、安装依赖（Install dependencies）

你需要安装以下依赖包：

```sh
# npm
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# yarn
yarn expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# pnpm
pnpm expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# bun
bun expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

上述命令会安装与你项目当前使用的 Expo SDK 版本**兼容**的这些库的版本。

> **新手须知**
>
> - **`npx expo install`**：Expo 提供的安装命令，与普通的 `npm install` 不同，它会自动选择与你当前 Expo SDK 版本兼容的包版本，避免因版本不匹配导致的运行时错误。
> - **`expo-router`**：Expo Router 的核心包，提供文件路由功能。
> - **`react-native-safe-area-context`**：处理安全区域（safe area）的库。安全区域是指屏幕上不被系统 UI 元素（如刘海屏、底部横条、状态栏等）遮挡的可用区域。这个库确保你的内容不会被系统 UI 遮挡。
> - **`react-native-screens`**：提供原生导航容器（native navigation containers）的库，用于优化导航性能和内存使用。它是 React Navigation 的原生底层依赖。
> - **`expo-linking`**：处理深度链接和通用链接（universal links）的 Expo 模块，允许你的应用响应外部 URL 并导航到对应的页面。
> - **`expo-constants`**：提供应用编译时常量的 Expo 模块，包含应用版本号、SDK 版本等信息。Expo Router 使用它来获取应用配置。
> - **`expo-status-bar`**：管理应用状态栏（status bar，即屏幕顶部显示时间、电量、信号等信息的区域）外观和行为的 Expo 模块。
> - **包管理器（package manager）**：管理项目依赖的工具。常见的有 npm（Node.js 默认）、yarn、pnpm 和 bun。你可以根据自己的偏好选择任意一种。

> **基于经验建议**
>
> 如果你不确定使用哪个包管理器，推荐使用 `npm`（Node.js 自带，无需额外安装）。如果你的团队已经在使用 yarn 或 pnpm，则保持一致即可。`bun` 是一个较新的高性能运行时，速度很快但生态成熟度稍逊，建议新手先使用 npm 或 yarn。

---

## 二、配置入口文件（Setup entry point）

在 **package.json** 文件中，将 `main` 属性的值设置为 `expo-router/entry`。初始的客户端文件是 [**src/app/_layout.tsx**](https://docs.expo.dev/router/reference/src-directory/)（如果不使用 **src** 目录，则为 [**app/_layout.tsx**](https://docs.expo.dev/router/basics/navigation-layouts/#root-layout)）。

```json
{
  "main": "expo-router/entry"
}
```

> **新手须知**
>
> - **`package.json`**：Node.js 项目的配置文件，位于项目根目录。它定义了项目的名称、版本、入口文件、依赖包列表以及可运行的脚本命令等信息。
> - **`main` 字段**：指定应用程序的入口文件。当应用启动时，运行时会首先加载这个文件。将其设为 `expo-router/entry` 是让 Expo Router 接管应用路由的关键配置。
> - **`expo-router/entry`**：Expo Router 提供的入口模块，它负责初始化路由系统并加载你的根布局文件（`_layout.tsx`）。
> - **`_layout.tsx`**：Expo Router 中一种特殊的文件名约定（file convention），以下划线开头的文件表示"布局"文件。`_layout.tsx` 定义了一组路由共享的 UI 布局（如导航栏、标签栏等）。根布局（root layout）是整个应用最外层的布局。
> - **`src` 目录**：一种可选的项目组织方式，将源代码放在 `src` 目录下，使项目根目录更加整洁。Expo Router 同时支持 `src/app/` 和 `app/` 两种目录结构。

### 自定义入口文件以初始化并加载副作用（Custom entry point to initialize and load side-effects）

你可以在 Expo Router 项目中创建一个自定义入口文件，在应用加载根布局（**src/app/_layout.tsx**）之前初始化并加载副作用（side-effects）。以下是一些常见的使用场景：

- 初始化全局服务（如分析工具、错误上报等）
- 设置 polyfill（兼容性补丁）
- 使用 `react-native` 的 `LogBox` 忽略特定日志

> **新手须知**
>
> - **副作用（side-effects）**：在程序启动时执行的、不属于组件渲染逻辑的初始化操作。例如：连接后端服务、注册全局错误处理器、加载全局配置等。这些操作需要在 UI 渲染之前完成，以确保应用运行在正确的环境中。
> - **polyfill**：一种兼容性补丁代码，用于在不支持某些新 API 的旧环境中模拟这些 API 的行为。例如，如果你需要在旧版 Android 上使用某些现代 JavaScript 特性，可以通过 polyfill 来填补兼容性差异。
> - **`LogBox`**：React Native 内置的日志控制工具，可以用来过滤或隐藏开发环境中的特定警告和日志信息，让控制台输出更清爽。

**操作步骤：**

**1.** 在项目根目录下创建一个新文件，例如 **index.js**。创建完成后，项目结构应如下所示：

```
src/
  app/
    _layout.tsx
index.js
package.json
其他项目文件...
```

**2.** 在该文件中导入或添加你的自定义配置，然后导入 `expo-router/entry` 来注册应用入口。**务必确保最后导入 `expo-router/entry`**，以保证所有配置在应用渲染之前已正确设置。

```js
// 首先导入副作用和服务
// 例如：import './polyfills';
// 例如：import { initAnalytics } from './analytics';

// 初始化服务
// initAnalytics();

// 通过 Expo Router 注册应用入口（务必放在最后）
import 'expo-router/entry';
```

**3.** 更新 **package.json** 中的 `main` 属性，指向新的入口文件：

```json
{
  "main": "index.js"
}
```

> **基于经验建议**
>
> 对于大多数项目，直接使用 `"main": "expo-router/entry"` 就够了。只有当你确实需要在应用渲染前执行一些全局初始化逻辑（如设置第三方分析 SDK、配置全局错误监控服务等）时，才需要创建自定义入口文件。过早地添加自定义入口文件会增加项目复杂度，建议新手先从默认配置开始。

---

## 三、修改项目配置（Modify project configuration）

在你的[应用配置文件（app config）](https://docs.expo.dev/workflow/configuration/)中添加深度链接的 `scheme` 并启用[类型化路由（typed routes）](https://docs.expo.dev/router/reference/typed-routes/)：

```json
{
  "expo": {
    "scheme": "your-app-scheme",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

> **新手须知**
>
> - **`app.json` / `app.config.js` / `app.config.ts`**：Expo 项目的配置文件，位于项目根目录。它定义了应用的各种元数据和行为配置，如应用名称、图标、启动屏、权限等。这里我们使用 JSON 格式来展示配置，你也可以使用 JS/TS 格式。
> - **`scheme`**：深度链接的 URL 协议标识符。例如设为 `"myapp"` 后，你就可以通过 `myapp://some-path` 这样的链接直接打开应用内的对应页面。请将 `"your-app-scheme"` 替换为你自己的应用标识（建议使用小写字母，如 `"myapp"` 或 `"mycoolapp"`）。
> - **`typedRoutes`（类型化路由）**：一项实验性功能，启用后 Expo Router 会根据你的文件路由结构自动生成 TypeScript 类型定义。这样在使用 `Link` 组件或 `router.push()` 等方法导航时，编辑器可以提供路由路径的自动补全和类型检查，减少拼写错误。
> - **`experiments`**：app config 中的实验性功能配置区域。放在这里的选项代表尚处于实验阶段的功能，可能在未来的版本中有变化。

---

## 四、Web 平台支持

如果你的应用需要支持 Web 平台，需要安装以下依赖：

```sh
# npm
npx expo install react-native-web react-dom

# yarn
yarn expo install react-native-web react-dom

# pnpm
pnpm expo install react-native-web react-dom

# bun
bun expo install react-native-web react-dom
```

然后，在[应用配置文件](https://docs.expo.dev/workflow/configuration/)中启用 [Metro Web](https://docs.expo.dev/guides/customizing-metro/#adding-web-support-to-metro) 支持，添加以下配置：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

> **新手须知**
>
> - **`react-native-web`**：一个将 React Native 组件映射为 Web 组件的库。它使你用 React Native 编写的代码（如 `View`、`Text` 等）能够在浏览器中运行。
> - **`react-dom`**：React 的 DOM 渲染器，负责将 React 组件渲染为浏览器中的 HTML 元素。
> - **`bundler`（打包工具）**：将你的源代码及其依赖打包成浏览器或运行时可以执行的文件的工具。Expo 使用 Metro 作为默认打包工具。将 `web.bundler` 设为 `"metro"` 表示 Web 平台也使用 Metro（而不是 Webpack）来打包，这样可以获得更好的兼容性和一致性。
> - **Metro**：React Native 官方的 JavaScript 打包工具，由 Meta 开发。它专门为 React Native 设计，支持快速的热重载（hot reloading）和增量构建。

> **基于经验建议**
>
> 如果你的应用目前只需要支持移动端（iOS 和 Android），可以暂时跳过 Web 平台的配置步骤。等你的移动端功能稳定后再添加 Web 支持也不迟。但如果你的项目有 Web 端需求，建议尽早配置，因为某些第三方库在 Web 端和移动端的行为可能存在差异，提前测试能避免后期大量返工。

---

## 五、修改 Babel 配置（Modify babel.config.js）

如果你的项目中有 **babel.config.js** 文件，请确保使用 `babel-preset-expo` 作为 `preset`。如果你不需要任何自定义的 Babel 配置，可以**直接删除该文件**：

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

> **新手须知**
>
> - **Babel**：一个 JavaScript 编译器，负责将使用了新语法特性的代码转换为兼容性更好的旧语法代码，以确保在不同环境中都能运行。
> - **`babel-preset-expo`**：Expo 提供的 Babel 预设（preset），它包含了一组预先配置好的 Babel 插件，专门用于处理 Expo/React Native 项目中的代码转换。使用这个预设可以确保 Expo Router 和其他 Expo 模块的代码被正确编译。
> - **`api.cache(true)`**：告诉 Babel 缓存编译结果，以加速后续的构建过程。
> - **`presets`**：Babel 中的预设配置集合，一个预设就是一组插件的集合。你只需要指定预设名称，Babel 就会自动加载其中包含的所有插件。

> **基于经验建议**
>
> 大多数 Expo 项目不需要自定义 Babel 配置。如果你是从旧项目迁移过来的，先检查一下现有的 `babel.config.js` 是否已经使用了 `babel-preset-expo`。如果里面有其他自定义插件，先尝试只保留 `babel-preset-expo`，看看项目是否能正常运行。只有在确认需要额外插件时，才逐步添加。

---

## 六、配置路径别名（Configure path aliases）

如果你使用了 [`src` 目录](https://docs.expo.dev/router/reference/src-directory/)，可以在 **tsconfig.json** 中配置路径别名（path aliases），这样就可以使用简短的导入路径（如 `@/components/button`）来代替冗长的相对路径：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

在上面的示例中，`@/*` 别名映射到了 **src** 目录。

> **新手须知**
>
> - **路径别名（path aliases）**：TypeScript 和构建工具提供的一种机制，允许你为常用的导入路径定义简短的"别名"。例如，配置了 `@/*` 映射到 `./src/*` 后，你可以用 `import { Button } from '@/components/button'` 代替 `import { Button } from '../../../src/components/button'`，代码更加简洁清晰。
> - **`tsconfig.json`**：TypeScript 的配置文件，用于指定编译选项、包含/排除的文件等。
> - **`extends`**：继承另一个配置文件中的配置。`"expo/tsconfig.base"` 是 Expo 提供的基础 TypeScript 配置，包含了推荐的编译选项。
> - **`strict: true`**：启用 TypeScript 的严格类型检查模式，帮助你尽早发现潜在的类型错误。强烈建议保持开启。
> - **`include`**：指定 TypeScript 编译器应该检查的文件范围。`.expo/types/**/*.ts` 包含 Expo 自动生成的类型定义，`expo-env.d.ts` 包含 Expo 环境的全局类型声明。

> **基于经验建议**
>
> 路径别名在中大型项目中非常有用，可以避免深层嵌套的相对路径（如 `../../../../components/Button`），大幅提升代码可读性和重构效率。但如果你的项目很小（只有一个 `app/` 目录，没有使用 `src/`），那么可以暂时跳过这一步，直接使用相对路径。

---

## 七、清除打包缓存（Clear bundler cache）

更新配置后，运行以下命令清除打包工具的缓存：

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

> **新手须知**
>
> - **`--clear` 标志**：告诉 Metro 打包工具清除所有缓存数据后重新启动。当你修改了配置文件（如 `babel.config.js`、`app.json`、`tsconfig.json` 等）后，旧的缓存可能导致新配置不生效，出现莫名其妙的错误。使用 `--clear` 可以确保打包工具基于最新的配置重新构建。
> - **缓存（cache）**：打包工具为了加速构建过程而临时存储的中间数据。虽然缓存能显著加快后续构建速度，但在配置变更后可能会导致使用过时的数据。

> **基于经验建议**
>
> 养成习惯：每次修改配置文件（如 `app.json`、`babel.config.js`、`metro.config.js` 等）后，都使用 `--clear` 重新启动开发服务器。如果不加 `--clear`，你可能会遇到一些难以复现的诡异错误，而问题根源往往就是旧的缓存数据。这在开发中是一个非常常见的坑。

---

## 八、更新依赖解析（Update resolutions）

如果你是从旧版本的 Expo Router 升级过来的，请确保移除 **package.json** 中所有过时的 Yarn resolutions 或 npm overrides。具体来说，需要移除 `metro`、`metro-resolver`、`react-refresh` 相关的解析配置。

> **新手须知**
>
> - **resolutions（Yarn）/ overrides（npm）**：一种强制指定特定依赖包版本的机制。通常在旧版本中，开发者可能需要手动固定 `metro` 或 `react-refresh` 的版本来解决兼容性问题。但在新版本中，这些手动固定的版本可能反而会导致冲突。
> - **`metro-resolver`**：Metro 打包工具的模块解析器，负责确定 `import` 语句实际指向哪个文件。
> - **`react-refresh`**：React 的热重载（hot reload）支持库，使你在修改代码后能看到即时的界面更新，而无需重启应用。

> **基于文档内容推导**
>
> 在旧版本的 Expo Router 中，由于 Metro 打包工具或 React 热重载模块存在兼容性问题，开发者可能需要在 `package.json` 中通过 resolutions/overrides 强制指定特定版本。随着 Expo Router 和 Metro 的版本迭代，这些兼容性问题已在官方层面得到解决，因此手动指定的版本解析反而可能覆盖掉官方推荐的正确版本，导致运行时错误。

> **基于经验建议**
>
> 检查 `package.json` 文件底部的 `"resolutions"`（Yarn）或 `"overrides"`（npm）字段，如果其中包含 `metro`、`metro-resolver` 或 `react-refresh` 的条目，请将它们删除。如果你不确定哪些条目需要移除，可以先备份 `package.json`，然后逐一删除这些条目并重新安装依赖，观察项目是否正常运行。

---

## 安装完成后的验证

完成以上所有步骤后，你可以通过以下方式验证安装是否成功：

1. 在 **src/app/**（或 **app/**）目录下创建一个 `_layout.tsx` 根布局文件和一个 `index.tsx` 首页文件
2. 使用 `npx expo start --clear` 启动开发服务器
3. 在模拟器或真机上查看应用是否正确加载了路由

> **基于经验建议**
>
> 如果启动后遇到白屏或路由不生效的问题，请按照以下顺序排查：
> 1. 检查 `package.json` 中的 `main` 字段是否指向了正确的入口
> 2. 确认 `_layout.tsx` 文件中是否导出了 `Slot` 或 `Stack` 等导航容器组件
> 3. 确认所有依赖都已正确安装（可重新运行安装命令）
> 4. 使用 `--clear` 标志重新启动以清除缓存

---

## 文档导航

- **上一页**：[introduction](./50__introduction.md)
- **下一页**：[core concepts](./52__core-concepts.md)
