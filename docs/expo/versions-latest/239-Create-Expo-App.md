# 239｜create-expo-app 创建 Expo 项目

**翻页：**[上一页：Expo CLI 命令行工具](./238-Expo-CLI.md) · [目录](./README.md) · [下一页：create-expo-module 原生模块生成器](./240-Create-Expo-Module.md)

**官方页面：**[create-expo-app](https://docs.expo.dev/more/create-expo/)

**版本范围：**官方页面是未版本化的当前工具说明，页面标注更新于 2026-09-03。`create-expo-app` 是 Node.js 命令行工具，不是某个 Expo SDK API；它根据包管理器、模板和项目选项生成新 Expo / React Native 项目。模板可能随 Expo CLI 更新而变化，开始项目时请留意当前模板说明。

## 创建项目

可用 npm、Yarn、pnpm 或 Bun 启动创建向导：

```sh
npx create-expo-app@latest
yarn create expo-app
pnpm create expo-app
bun create expo
```

默认交互会提示输入 App 项目名；这个名称也会成为 app config 的 `name`：

```text
What is your app named? my-app
```

## 选项和模板

| 选项 | 作用 |
| --- | --- |
| `--yes` | 使用默认选项创建，不逐项询问。 |
| `--no-install` | 跳过 npm 依赖和 CocoaPods 安装。 |
| `--no-agents-md` | 不生成 `AGENTS.md`、`CLAUDE.md` 和 `.claude/settings.json`。默认会生成这些 AI agent 提示文件，其中 `AGENTS.md` 会指向项目 SDK 版本匹配的 Expo 文档。 |
| `--template <name>` | 指定项目模板；不传时用默认模板。 |
| `--example [name]` | 用 Expo 官方 examples 仓库中的示例工程作为起点。单独传入时可交互选择。 |
| `--version` | 显示 `create-expo-app` 版本后退出。 |
| `--help` | 显示全部命令选项后退出。 |

下面的命令展示默认模板、示例工程选择、Router / React Navigation 示例，以及查询工具版本和帮助：

```sh
npx create-expo-app --template default
npx create-expo-app --example
npx create-expo-app --example with-router
npx create-expo-app --example with-react-navigation
npx create-expo-app --version
npx create-expo-app --help
```

### 官方模板

| 模板 | 适合场景 |
| --- | --- |
| `default` | 多屏幕 App；预装 Expo CLI、Expo Router 和 TypeScript 设置，适合大多数新项目。 |
| `blank` | 最少必需 npm 依赖，不预设导航。 |
| `blank-typescript` | 空白起点并启用 TypeScript。 |
| `tabs` | Expo Router 文件路由 + TypeScript 的标签页起点。 |
| `bare-minimum` | 空白模板，并在安装期间运行 `npx expo prebuild` 生成原生 `android` / `ios` 目录。 |

`--example` 用于选择展示特定能力或第三方集成的参考项目。官方页举例包括 `with-router` 和 `with-react-navigation`；如使用 AI agent，官方也建议搭配 Expo Skills，帮助 agent 从 Expo examples 学习与 SDK 匹配的实现方式。

## 包管理器设置

创建项目时，`create-expo-app` 会写入所选包管理器所需配置。**创建后从一种包管理器迁移到另一种**时，工程及 EAS Build 可能需要手动改配置，不能只换一个 lockfile。

### npm

npm 随 Node.js 安装。EAS Build 默认会根据项目内 `package-lock.json` 识别并安装 npm 依赖。

### Yarn 1（Classic）

Yarn Classic 通常以 npm 全局依赖安装。EAS Build 根据 `yarn.lock` 识别它。

### Yarn 2+（Modern）

Yarn Modern 使用的 Plug'n'Play（PnP）依赖链接方式与 React Native 不兼容。create-expo-app 默认把 Yarn 设置为 `node-modules` 链接器；在 `.yarnrc.yml` 中可以看到：

```yaml
nodeLinker: node-modules
```

EAS Build 使用 Yarn Modern 时还需要打开 Corepack。在 `eas.json` 的相应 build profile 里设置 `corepack: true`：

```json
{
  "build": {
    "production": {
      "corepack": true
    }
  }
}
```

再将 Yarn 版本锁定到项目 `package.json` 的 `packageManager` 字段。这样 EAS 的 Corepack 会获取指定 Yarn 版本：

```json
{
  "packageManager": "yarn@4.14.1"
}
```

本地执行 `yarn set version <version>` 可以更新该字段；`<version>` 是要固定的 Yarn 版本。

### pnpm

创建项目时 pnpm 默认使用 `hoisted` node linker。`pnpm-workspace.yaml` 中的配置如下：

```yaml
nodeLinker: hoisted
```

SDK 54 及以后支持 isolated installation；若要依赖隔离安装，可以删除 `nodeLinker` 设置。EAS Build 默认可通过 `pnpm-lock.yaml` 识别 pnpm。

### Bun

Bun 可用于创建项目与 EAS Build；官方文档指向 Bun 专页，说明新建项目、从其他包管理器迁移和 EAS 用法。

## 新手名词解释

- **模板（template）：**生成项目时预置的文件与依赖组合。默认模板提供常用工具；blank 模板则从更少配置起步。
- **示例工程（example）：**已实现某项能力的参考 App，例如导航或服务集成；它与空白模板用途不同。
- **npm / Yarn / pnpm / Bun：**Node.js JavaScript 包管理器；它们负责下载依赖并生成各自格式的 lockfile。
- **Lockfile：**精确记录依赖版本的文件。团队与 CI 根据它安装一致的依赖树，也是 EAS 识别默认包管理器的信号。
- **PnP：**Yarn Modern 可选的 Plug'n'Play 模块查找机制；React Native 当前不能使用它，因此 create-expo-app 默认选择传统 `node_modules` 目录。
- **Node linker：**包管理器在磁盘上组织与解析依赖的方式。`node-modules` 与 `hoisted` 分别决定依赖是否放进常见目录或提升到 workspace 可解析的位置。
- **Corepack：**Node.js 附带的包管理器版本代理。通过 `packageManager` 固定 Yarn 版本后，EAS 可自动取得该版本。
- **Workspace：**由一个根工程管理多个子包的仓库结构。pnpm workspace 配置控制整个仓库如何解析依赖。
- **Prebuild：**根据 Expo 配置生成原生 iOS / Android 工程；普通 default 模板不必预先提交原生目录，而 bare-minimum 会在创建时执行它。

## 源页代码主题覆盖

本页覆盖四种包管理器创建命令、App 名称交互输出、默认 / 示例模板命令、查询版本与帮助、Yarn Modern 的 nodeLinker、EAS Corepack 配置、packageManager 版本固定和 pnpm hoisted 配置，共 7 个代码区块。页面其余选项、模板说明、Node 包管理器在 EAS 中的识别方式和 SDK 54+ pnpm 行为均整理为表格和文字说明。

**翻页：**[上一页：Expo CLI 命令行工具](./238-Expo-CLI.md) · [目录](./README.md) · [下一页：create-expo-module 原生模块生成器](./240-Create-Expo-Module.md)

