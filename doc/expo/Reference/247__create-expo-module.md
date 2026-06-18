# create-expo-module — Expo 模块脚手架工具

## 文档解决的问题

这篇文档介绍 `create-expo-module` 这个命令行工具。它的核心作用是：**通过终端命令快速生成 Expo 模块的项目骨架**，包括源代码文件、原生代码目录、测试环境和配置文件。

对于 React Web 开发者来说，可以把它类比为 `create-react-app` 或 Vite 的 `create-vite`——但它生成的不是 Web 项目，而是一个包含 iOS / Android 原生代码的 Expo 模块。

> **什么是 Expo 模块？**
> 在 React Web 中，你写一个 npm 包，里面是 JavaScript/TypeScript 代码，浏览器直接运行。
> 在 Expo 中，一个"模块"（Module）是一个可以同时包含 JavaScript/TypeScript 层和原生代码层（Kotlin/Swift）的包。原生代码层用于调用设备能力（摄像头、传感器、文件系统等），这是纯 Web 无法做到的。`create-expo-module` 就是帮你搭好这种双层结构的脚手架。

## 适用场景

- 你想为当前 Expo 项目添加一个**本地模块**，封装某些原生功能，仅在该项目中使用。
- 你想创建一个**独立模块包**，发布到 npm 或在 monorepo 中供多个 Expo 应用共享。
- 你需要为已有模块**追加新平台支持**（例如原来只支持 Android，现在要加上 iOS）。

## 模块的两种类型

`create-expo-module` 生成的模块分为两种，理解它们的区别是正确使用这个工具的前提：

### 本地模块（Local Module）

| 特征 | 说明 |
|---|---|
| 存放位置 | 直接放在当前 Expo 项目内部（默认在 `modules/` 目录下） |
| 依赖管理 | 使用宿主应用（即你的 Expo 项目）的依赖，不需要独立安装 |
| 发布需求 | 不需要发布到 npm |
| 测试环境 | 不生成独立的测试应用 |
| 适用场景 | 只在当前项目中使用的原生功能封装 |

**Web 类比**：类似于在 React Web 项目里新建一个 `src/utils/native-bridge.ts` 目录，只是这个"工具"还包含原生代码。

### 独立模块（Standalone Module）

| 特征 | 说明 |
|---|---|
| 存放位置 | 独立的目录，可以是一个独立仓库或 monorepo 中的子包 |
| 依赖管理 | 有自己的 `package.json`，需要独立安装依赖 |
| 发布需求 | 可以发布到 npm 供其他项目使用 |
| 测试环境 | 自动生成一个 `example/` 目录，内含一个测试用的 Expo 应用 |
| 适用场景 | 要发布到 npm 的开源模块，或在多个应用间共享的模块 |

**Web 类比**：类似于用 `create-react-library` 创建一个独立的 React 组件库项目，自带一个 demo 站点用于调试。

## 生成模块的命令

### 生成本地模块

在你的 Expo 项目根目录下运行：

```sh
npx create-expo-module@latest --local
```

> **命令解读：**
> - `npx`：Node.js 自带的包执行器，会临时下载并运行 `create-expo-module` 这个包，不需要全局安装。
> - `@latest`：确保使用最新版本的工具。
> - `--local`：告诉工具生成"本地模块"而非独立模块。

执行后，工具会交互式地询问你：
1. **模块名称**：你希望给模块取什么名字。
2. **目标平台**：要支持 Android、iOS（Apple）还是 Web。
3. **功能特性**：要包含哪些 API 代码片段（如常量、函数、事件、视图等，详见下文"features 参数"）。

生成的文件默认放在项目的 `modules/` 目录下。如果你的 `app.json` 或 `app.config.js` 中配置了自定义目录，则会放在那个目录。

> 也支持 yarn、pnpm、bun 等包管理器的等价命令，例如 `yarn create expo-module --local`。

### 生成独立模块

```sh
npx create-expo-module@latest my-module
```

> **命令解读：**
> - `my-module`：你指定的目录名，工具会在该目录下生成完整的独立模块项目。

执行后，工具会：
1. 询问包的详细信息（名称、描述、作者、许可证等）。
2. 生成模块代码，包含一个 `example/` 目录作为测试应用。
3. 如果当前目录不在 Git 版本控制下，会自动初始化一个 Git 仓库。
4. 自动安装依赖。
5. 运行 **Prebuild**（预构建）——在 macOS 上还会执行 **CocoaPods** 安装。

> **什么是 Prebuild？**
> 在 React Web 中，`npm install` 之后就可以直接 `npm run dev` 了。但在 Expo 中，原生代码（Android 的 Gradle 项目、iOS 的 Xcode 项目）需要根据你的配置生成一遍，这个过程叫 Prebuild。它是 Expo 将你的 `app.json` 配置翻译成原生工程文件的过程。

> **什么是 CocoaPods？**
> CocoaPods 是 iOS/macOS 生态中的依赖管理工具，类似于 npm。iOS 的原生依赖（用 Swift/Objective-C 写的库）需要通过 CocoaPods 安装。这一步只在 macOS 上自动执行，因为 Xcode 只能在 macOS 上运行。

## 开发工作流

模块生成后，进入模块目录进行开发：

```sh
cd my-module
```

### 打开原生 IDE

```sh
# 在 Android Studio 中打开 Android 项目
npm run open:android

# 在 Xcode 中打开 iOS 项目（仅 macOS 可用）
npm run open:ios
```

> **对 Web 开发者的说明：**
> 在 React Web 中，你通常只需要一个浏览器和 VS Code。但在 Expo 模块开发中，修改原生代码时需要用对应的原生 IDE：Android 代码用 Android Studio（基于 IntelliJ），iOS 代码用 Xcode（仅 macOS）。JavaScript/TypeScript 层仍然可以用你习惯的任何编辑器。

### 启动测试应用

对于独立模块，进入 `example/` 目录启动 Expo 开发服务器：

```sh
cd example
npx expo start
```

这会启动 Metro（Expo 的 JavaScript 打包工具，类比 Web 中的 Webpack/Vite dev server），并在终端显示一个二维码，用 Expo Go 应用或开发构建扫码即可在真机/模拟器上预览。

### 可用的 npm 脚本

独立模块生成后，`package.json` 中包含以下脚本：

| 脚本 | 作用 | 说明 |
|---|---|---|
| `build` | 编译 TypeScript | 将 `.ts`/`.tsx` 文件编译为 JavaScript，类似 Web 项目中的 `tsc` |
| `clean` | 删除构建产物 | 清理 `build/` 或 `dist/` 等输出目录 |
| `test` | 运行测试 | 执行模块的单元测试 |
| `prepare` | 发布前构建 | npm 发布前自动执行的编译步骤（npm 的 lifecycle hook） |
| `open:ios` | 打开 iOS 项目 | 在 Xcode 中打开 iOS 原生工程 |
| `open:android` | 打开 Android 项目 | 在 Android Studio 中打开 Android 原生工程 |

### 热更新的差异

这是 React Web 开发者需要特别注意的一点：

- **JavaScript / TypeScript 代码**修改后会自动刷新（Hot Reload），和 Web 开发体验一致。
- **原生代码**（Kotlin / Swift / Objective-C）修改后，必须**重新构建应用**才能看到变化。这是因为原生代码需要重新编译，无法像 JavaScript 那样热替换。

> 类比：在 Web 中，你改 CSS 或 JS 都能 HMR（热模块替换）。但在 Expo 模块开发中，只有 JS/TS 层享有这个待遇，原生层相当于"改完要重启服务"。

## 配置参数（CLI Flags）

`create-expo-module` 支持丰富的命令行参数来自定义生成行为：

### 基本参数

| 参数 | 说明 |
|---|---|
| `[path]` | 指定模块的目标目录路径。对于独立模块，就是目录名；对于本地模块，可选。 |
| `--local` | 生成本地模块（不含测试应用）。 |
| `--platform` | 指定目标平台。可选值：`android`（Android）、`apple`（iOS/macOS）、`web`（Web）。可多次指定以支持多平台。 |
| `--no-example` | 不生成测试应用目录（`example/`）。仅对独立模块有意义。 |
| `--barrel` | 为本地模块生成一个 `index` 汇总文件（barrel file），方便统一导出。 |

### 功能特性参数（features）

`--features` 参数用于指定模块中要包含的 API 代码片段。这些是 Expo Modules API 提供的各种原生-JS 桥接模式的示例代码：

| 特性名称 | 含义 | Web 类比 |
|---|---|---|
| `Constant` | 从原生层导出一个常量值给 JS 层 | 类似在 Web 中 `export const API_VERSION = "1.0"` |
| `Function` | 导出一个同步函数（原生 → JS） | 类似导出一个普通工具函数 |
| `AsyncFunction` | 导出一个异步函数（原生 → JS） | 类似导出一个返回 Promise 的函数 |
| `Event` | 从原生层向 JS 层发送事件 | 类似 Web 中的 `CustomEvent` / `EventEmitter` |
| `View` | 导出一个原生视图组件给 JS 层使用 | 类似导出一个 React 组件，但底层是原生 UI |
| `ViewEvent` | 原生视图组件上的事件回调 | 类似 React 组件的 `onClick`、`onChange` 等 props |
| `SharedObject` | 原生层的共享对象引用 | Web 中无直接对应，类似于在 JS 和原生间共享一个对象实例 |

使用 `--features all` 可以包含以上所有特性的示例代码。

使用 `--full-example` 等同于包含所有功能特性片段的完整示例。

### 包元数据参数

以下参数用于设置生成模块的 `package.json` 中的元信息，避免交互式提示：

| 参数 | 对应字段 |
|---|---|
| `--name` | 显示名称 |
| `--description` | 包描述 |
| `--package` | npm 包名（如 `@scope/my-module`） |
| `--author-name` | 作者名称 |
| `--author-email` | 作者邮箱 |
| `--author-url` | 作者主页 |
| `--repo` | 仓库地址 |
| `--license` | 许可证（如 MIT） |
| `--module-version` | 模块版本号 |

### 其他参数

| 参数 | 说明 |
|---|---|
| `--package-manager` | 指定包管理器，可选：`npm`、`pnpm`、`yarn`、`bun` |
| `--source` | 指向一个本地自定义模板目录，替代默认模板 |
| `--with-readme` | 生成 README 文档文件 |
| `--with-changelog` | 生成 CHANGELOG 文件 |
| `--version` | 显示工具的版本号 |
| `--help` | 显示帮助信息 |

## 自动化环境（CI）中的行为

当工具检测到以下任一条件时，会自动跳过交互式提示：

1. 运行在 CI（持续集成）环境中（如 GitHub Actions、Jenkins 等）。
2. 标准输入（stdin）不是一个终端（即非交互式环境）。

在自动化模式下：

- 缺少的值会使用**默认值**，同时输出警告。
- 为了获得可预测的结果，应该**通过命令行参数显式传入所有必要信息**，而不是依赖默认值。
- `add-platform-support` 子命令在自动化模式下**必须**通过 `--platform` 参数显式指定平台。

> **对 Web 开发者的说明：**
> 这和 `create-react-app` 在 CI 中的行为类似——可以通过环境变量或参数跳过交互提示。但在 Expo 模块场景中，漏传平台参数会导致生成的模块缺少目标平台的代码。

## 为已有模块追加平台支持

如果一个模块最初只支持某个平台（比如只有 Android），后来需要添加其他平台（比如 iOS），可以使用 `add-platform-support` 子命令：

```sh
npx create-expo-module@latest add-platform-support
```

工具的行为特点：

- **自动检测现有 API 特性**：会尝试识别模块中已有的 API 代码片段，以便在新平台的脚手架中生成匹配的代码。
- **仅追加，不覆盖**：只添加缺失平台的原生目录，不会覆盖已有的原生代码。这对保护你已编写的原生逻辑非常重要。
- **不支持旧格式**：如果模块使用的是旧版格式（没有使用 Expo Modules API 的 DSL），则不支持此命令。
- **手动覆盖**：对于复杂代码库，自动检测可能不准确，可以通过 `--features` 参数手动指定要包含的特性。

该子命令支持的参数：

| 参数 | 说明 |
|---|---|
| `--platform` | 指定要添加的平台（`android`、`apple`、`web`） |
| `--features` | 覆盖自动检测到的特性列表 |
| `--source` | 指向本地自定义模板 |

## 模板版本与环境变量

### 模板选择策略

- **独立模块**：始终使用**最新版本**的模板（从远端获取）。
- **本地模块**：使用与当前项目 SDK 版本匹配的模板，确保兼容性。

### 环境变量

可以通过环境变量控制工具的行为：

| 环境变量 | 作用 | 使用场景 |
|---|---|---|
| `EXPO_BETA` | 启用即将发布的模板版本进行测试 | 你想提前体验或测试新模板特性时 |
| `EXPO_DEBUG` | 输出详细的调试日志 | 排查工具执行异常时 |
| `EXPO_NO_TELEMETRY` | 关闭遥测数据收集 | 注重隐私或在受限网络环境中 |
| `EXPO_NONINTERACTIVE` | 强制进入非交互模式 | 效果等同于 CI 环境检测，跳过所有提示 |

## 注意事项、限制条件和坑点

### 平台限制

1. **iOS 开发需要 macOS + Xcode**：`npm run open:ios` 只能在 macOS 上运行，因为 Xcode 不支持 Windows/Linux。如果你在 Windows 上开发，只能通过 Android Studio 开发 Android 部分。
2. **CocoaPods 仅在 macOS 上自动执行**：生成独立模块时，Prebuild 阶段会在 macOS 上自动运行 `pod install`。如果你在其他系统上，iOS 依赖安装需要后续在 macOS 上手动完成。

### 热更新限制

3. **原生代码修改需要重新构建**：这是最容易让 Web 开发者不适应的地方。改了 Kotlin/Swift 代码后，必须完整重新编译应用，耗时明显长于 JS 层的 HMR。

### 模板兼容性

4. **`add-platform-support` 不支持旧格式模块**：如果你的模块不是用 Expo Modules API 的 DSL（领域特定语言）编写的，这个子命令无法使用。需要手动添加原生代码或重构模块。

### 自动化环境

5. **CI 环境下必须显式传参**：依赖默认值虽然有警告提示，但可能导致生成不符合预期的模块结构。建议在 CI 脚本中列出所有必要的参数。

## React Web 开发者需要特别注意的地方

1. **双层架构思维**：在 Web 中，你只面对一层——JavaScript/TypeScript 运行在浏览器中。Expo 模块有两层：JS/TS 层（运行在 JavaScript 引擎中）和原生层（Kotlin/Swift，运行在操作系统上）。两层之间通过 Expo Modules API 定义的桥接通信。`create-expo-module` 生成的脚手架已经包含了这两层的基础代码和桥接配置。

2. **IDE 切换**：Web 开发通常一个 VS Code 搞定一切。Expo 模块开发中，你需要根据修改的代码层级切换工具——VS Code（或你喜欢的编辑器）写 JS/TS，Android Studio 写 Kotlin，Xcode 写 Swift。

3. **没有"开箱即用的浏览器"**：Web 开发打开 `localhost:3000` 就能看到效果。Expo 模块开发需要在模拟器（Android Emulator / iOS Simulator）或真机上预览。`example/` 目录中的测试应用就是为此而生。

4. **发布流程不同**：Web 的 npm 包发布只需要 `npm publish`。独立 Expo 模块发布前还需要确保原生代码编译通过，并且 `prepare` 脚本中的 TypeScript 编译成功。

5. **版本匹配**：本地模块的模板版本与你当前 Expo SDK 版本绑定。升级 Expo SDK 后，可能需要重新生成或更新本地模块。

## 实际开发建议

1. **从本地模块开始**：如果你不确定需要哪种类型，先用 `--local` 在当前项目中创建本地模块。当确认这个模块有复用价值时，再考虑迁移为独立模块。

2. **善用 `--features` 参数**：不要生成一个空模块然后从零开始写。通过 `--features` 指定你需要的 API 模式（如 `AsyncFunction`、`View`），工具会生成对应的示例代码，你可以在示例基础上修改，大幅减少配置时间。

3. **在 macOS 上开发**：如果你需要同时支持 iOS 和 Android，强烈建议在 macOS 上进行模块开发，这样才能完整使用 Xcode 和 CocoaPods。

4. **CI 脚本显式化**：如果项目有 CI 流程需要自动生成模块，把所有参数都写在命令里，不要依赖默认值和交互提示。例如：
   ```sh
   npx create-expo-module@latest my-module \
     --platform android --platform apple \
     --features AsyncFunction,Event \
     --package-manager npm \
     --name "My Module" \
     --package "@myorg/my-module"
   ```

## 总结

`create-expo-module` 是 Expo 生态中用于快速搭建模块项目骨架的 CLI 工具。它解决了从零配置原生工程 + JS 桥接的复杂性问题，让开发者可以专注于业务逻辑的实现。

核心要点：

- **两种模块类型**：本地模块（项目内使用）和独立模块（可发布/共享），通过 `--local` 参数区分。
- **交互式与自动化**：终端中运行时交互式询问配置，CI 中自动使用默认值（建议显式传参）。
- **开发体验差异**：JS/TS 层支持热更新，原生层修改需要重新构建。
- **可扩展**：通过 `add-platform-support` 为已有模块追加新平台，但仅支持新格式模块。
- **模板匹配**：独立模块用最新模板，本地模块匹配当前 SDK 版本。

---

## 文档导航

- **上一页**：[create expo](./246__create-expo.md)
- **下一页**：[qr codes](./248__qr-codes.md)
