# create-expo-app —— Expo 项目初始化工具

## 文档解决的问题

`create-expo-app` 是 Expo 官方提供的终端命令行工具，用于**一键初始化一个全新的 React Native + Expo 项目**。

对于有 React Web 经验的开发者来说，你可以把它类比为 `create-react-app` 或 Vite 的 `create-vite`：它帮你自动完成项目脚手架搭建、依赖安装、基础配置生成等工作，让你无需手动配置 Webpack / Babel / TypeScript 等工具链，直接开始编写业务代码。

不同的是，`create-expo-app` 初始化的是一个**移动端项目**（React Native），它会同时配置好 iOS 和 Android 所需的原生工程文件。

## 阅读前需要理解的背景知识

- **Expo**：一个围绕 React Native 构建的工具链平台，提供开发服务器、构建服务（EAS Build）、OTA 更新等能力。类比 React Web 世界中的 CRA / Vite + 部署平台的组合。
- **React Native**：使用 React 语法编写原生移动应用的框架。你写的 JSX 最终会渲染为 iOS / Android 的原生 UI 组件，而非 DOM 元素。
- **SDK 版本**：Expo 按版本号（如 SDK 54、SDK 56）发布，每个 SDK 版本对应特定的 React Native 版本和一组经过兼容测试的 Expo 库。选择不同 SDK 版本意味着你使用的底层框架版本不同。
- **CocoaPods**：iOS 平台的依赖管理工具，类似于 npm 之于 Node.js。React Native 的 iOS 原生代码依赖需要通过 CocoaPods 安装。
- **Expo Router**：Expo 官方的文件系统路由方案，类似于 Next.js 的 `app/` 目录路由。它基于文件结构自动生成路由配置。
- **EAS（Expo Application Services）**：Expo 提供的云端构建和提交服务，用于在云端编译 iOS / Android 应用，无需本地安装 Xcode 或 Android Studio。

## 核心内容：创建新项目

### 基本用法

在终端中运行以下任一命令即可创建新项目（根据你使用的包管理器选择）：

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

**命令解析：**

- `npx create-expo-app@latest`：通过 npx 执行最新版本的 `create-expo-app` 工具。`npx` 是 npm 自带的命令，用于运行包中的可执行文件，无需全局安装。
- `--template default@sdk-56`：指定使用 `default` 模板，并且基于 SDK 56。这决定了项目使用的 Expo 版本和预装依赖。

> **重要提示：** 在 SDK 56 过渡期间，如果不加 `--template` 参数，默认会创建 SDK 54 版本的项目。如果你需要在真机上通过 Expo Go 应用测试，可以选择 SDK 54（兼容性更好）；如果需要新特性，请显式指定 SDK 56 模板。

**对 React Web 开发者的说明：** 在 Web 开发中，你可能习惯了 `npm create vite@latest` 这样的命令。`create-expo-app` 的工作方式类似，但生成的项目结构面向移动端，包含了 iOS 和 Android 的原生配置。

### 项目名称设置

执行命令后，工具会交互式地询问应用名称：

```sh
"What is your app named?" my-app
```

这个名称会被写入项目的 `app.json`（或 `app.config.js`）配置文件中的 `name` 字段。这个名称将作为应用的标识名，显示在手机桌面上（除非你另外配置了 `displayName`）。

## 命令行参数（Flags）详解

### `--yes`

跳过所有交互式提问，使用默认值直接创建项目。适合 CI/CD 环境或你确定不需要自定义配置时使用。类似于 `npm init -y` 的效果。

### `--no-install`

跳过 CocoaPods 和 Node.js 依赖的自动安装。如果你需要手动调整 `package.json` 后再安装依赖，或者网络环境不便自动安装，可以使用此参数。

**开发影响：** 使用此参数后，项目目录虽然已生成，但 `node_modules/` 和 iOS 的 `Pods/` 目录不会存在。你需要手动执行 `npm install`（以及 iOS 项目需要的 `cd ios && pod install`）后才能运行项目。

### `--no-agents-md`

阻止工具自动生成 AI 助手配置文件（如 `AGENTS.md`、`CLAUDE.md`）。默认情况下，`create-expo-app` 会生成这些文件，为 AI 编码助手提供项目上下文和技能描述。如果你不使用 AI 助手或希望自行配置，可以使用此参数。

### `--template`

选择项目启动模板。这是最常用的参数之一，不同模板适合不同的项目需求：

| 模板名称 | 说明 | 适用场景 |
| --- | --- | --- |
| `default` | 多页面应用模板，包含 Expo Router、TypeScript 和标准开发工具 | **推荐大多数新项目使用。** 开箱即用的路由和类型检查，适合正式项目 |
| `blank` | 最小化安装，不包含导航配置 | 适合你想从零开始搭建路由，或只需要一个最简项目做实验 |
| `blank-typescript` | 与 `blank` 相同，但启用了 TypeScript | 在最小化基础上需要类型安全的场景 |
| `tabs` | 基于 Expo Router 的文件系统路由 + TypeScript | 适合底部 Tab 导航结构的典型移动应用 |
| `bare-minimum` | 生成原生 iOS 和 Android 目录，初始化时执行 prebuild 步骤 | 适合需要直接修改原生代码的高级场景（相当于 "ejected" 模式） |

**对 React Web 开发者的说明：**
- `default` 模板类似于 Next.js 的 `create-next-app` 默认模板——路由、TypeScript、基础工具链都已配好。
- `bare-minimum` 模板暴露了原生 iOS / Android 工程目录，类似于你在 Web 项目中 `eject` CRA 后获得完整的 Webpack 配置控制权。一旦使用 `bare-minimum`，你将需要自行管理原生构建配置。

### `--example`

从 Expo 官方示例仓库中初始化项目。你可以交互式浏览可用示例，也可以直接指定某个示例名称（如路由示例、导航集成示例等）。适合学习和参考特定功能的实现方式。

### `--version` 和 `--help`

分别显示当前 `create-expo-app` 的版本号和所有可用命令行参数。

## 包管理器兼容性

`create-expo-app` 会自动检测你使用的包管理器，并据此调整项目配置。**但需要注意：如果后续更换包管理器，可能需要手动调整配置，特别是在使用 EAS Build 时。**

以下逐一说明各包管理器的注意事项：

### npm

- **本地开发：** npm 随 Node.js 一起安装，无需额外操作。
- **EAS Build：** 当 EAS 检测到 `package-lock.json` 文件时，会自动使用 npm 进行构建。

### Yarn 1（Classic）

- **本地开发：** 通常通过 `npm install -g yarn` 全局安装。
- **EAS Build：** 当 EAS 检测到 `yarn.lock` 文件时，原生支持 Yarn 1。

### Yarn 2+（Berry / Modern）

这是最需要关注的包管理器场景。

**本地开发：** Yarn 2+ 默认使用 PnP（Plug'n'Play）模块解析方式，但 **React Native 不兼容 PnP**。因此 `create-expo-app` 会自动强制将链接器切换为传统的 `node-modules` 模式：

```yaml
# .yarnrc.yml（工具自动生成的配置）
nodeLinker: node-modules
```

**对 React Web 开发者的说明：** 在纯 Web 项目中，Yarn PnP 可以正常工作（不需要原生代码）。但 React Native 需要访问原生模块的 C++ / Objective-C / Java 代码，PnP 的虚拟文件系统结构无法支持这种访问模式，所以必须回退到 `node-modules`。

**EAS Build：** 使用 Yarn 2+ 在云端构建时，需要额外配置：

1. 在 `eas.json` 的构建配置中启用 Corepack（Node.js 的包管理器版本管理工具）：

```json
{
  "build": {
    "production": {
      "corepack": true
    }
  }
}
```

2. 在 `package.json` 中固定 Yarn 版本：

```json
{
  "packageManager": "yarn@4.14.1"
}
```

**开发影响：** 如果你团队使用 Yarn 2+，务必确保以上两处配置正确，否则 EAS Build 可能无法正确解析依赖。

### pnpm

- **本地开发：** 需要安装 Node.js。`create-expo-app` 会默认将链接器设为 `hoisted` 模式：

```yaml
# .npmrc（工具自动生成的配置）
nodeLinker=hoisted
```

**对 React Web 开发者的说明：** pnpm 默认使用严格的依赖隔离（非扁平化的 `node_modules` 结构），但某些 React Native 包假设依赖是扁平的（hoisted），因此需要开启 `hoisted` 模式。

> **注意：** 从 SDK 54 开始，Expo 已支持 pnpm 的隔离依赖模式（isolated dependencies），你可以移除 `hoisted` 设置。但如果你使用的第三方库对依赖结构有要求，建议先测试后再决定是否移除。

- **EAS Build：** 当 EAS 检测到 `pnpm-lock.yaml` 文件时，原生支持 pnpm。

### Bun

Bun 的支持细节请参阅 Expo 官方的 Bun 专题指南，涵盖安装配置、迁移和 EAS 兼容性。

## 注意事项、限制条件和坑点

1. **SDK 版本过渡期的默认行为：** 在 SDK 56 过渡期间，不加 `--template` 参数会默认创建 SDK 54 项目，而非最新的 SDK 56。如果你需要最新特性，必须显式指定 `--template default@sdk-56`。这是最容易踩的坑之一。

2. **Yarn 2+ 的 PnP 不兼容：** 这不是一个可选项，而是硬性限制。React Native 不支持 PnP，必须使用 `node-modules` 链接方式。如果你从纯 Web 项目转过来，习惯了 Yarn PnP 的零安装特性，需要接受 `node_modules` 目录的存在。

3. **pnpm 的 hoisted 模式：** 默认开启是有原因的，贸然关闭可能导致部分第三方 React Native 库无法正常工作。SDK 54+ 虽然支持隔离依赖，但建议充分测试后再切换。

4. **更换包管理器的成本：** 项目初始化后更换包管理器（比如从 npm 切换到 pnpm），不仅涉及 lockfile 的重新生成，还可能需要调整 EAS 构建配置和 `.npmrc` / `.yarnrc.yml` 等文件。建议在项目初始化时就确定包管理器。

5. **`bare-minimum` 模板的隐含成本：** 选择此模板意味着你直接管理原生工程。如果你没有 iOS / Android 原生开发经验，建议从 `default` 模板开始，后续确实需要时再通过 `npx expo prebuild` 命令生成原生目录。

## React Web 开发者需要特别注意的地方

1. **项目初始化 ≠ 只生成前端代码。** 与 `create-vite` 不同，`create-expo-app` 生成的项目包含 iOS 和 Android 的原生构建配置。项目目录下会有 `ios/` 和 `android/` 文件夹（使用 `bare-minimum` 模板时），或至少在构建时需要生成这些文件。

2. **CocoaPods 是必需环节。** 在 Web 开发中，`npm install` 就够了。但在 Expo 项目中，iOS 端还需要 `pod install` 来安装原生依赖。`create-expo-app` 默认会自动执行这一步（除非你使用 `--no-install`）。

3. **模板选择影响深远。** Web 项目中模板主要影响代码结构和预装库。Expo 模板还影响你是否能使用 Expo Go 预览应用、是否需要原生构建环境等。`default` 和 `blank` 系列模板可以配合 Expo Go 使用，而 `bare-minimum` 模板需要完整的原生开发环境。

4. **包管理器不只是 "个人偏好"。** 在 Web 项目中，npm / yarn / pnpm 的切换相对无痛。但在 Expo 项目中，包管理器的选择会影响 EAS 构建配置、原生依赖解析方式等。建议团队统一后在项目初期就固定下来。

## 实际开发建议

1. **新项目推荐命令：**
   ```sh
   npx create-expo-app@latest --template default@sdk-56
   ```
   使用 `default` 模板 + 最新 SDK，获得路由、TypeScript 等开箱即用的支持。

2. **快速原型验证：**
   ```sh
   npx create-expo-app@latest my-prototype --yes --template blank-typescript
   ```
   使用 `--yes` 跳过交互，`blank-typescript` 提供最小但有类型安全的环境。

3. **包管理器决策：** 在项目开始前与团队确认使用哪个包管理器。如果没有特殊需求，npm 是最安全的选择（兼容性最好、配置最少）。使用 Yarn 2+ 或 pnpm 时务必确认上述额外配置。

4. **不要在项目中途更换包管理器，** 除非你有充分理由并准备好处理配置调整。

5. **`bare-minimum` 模板慎重使用。** 如果你不确定是否需要直接操作原生代码，先用 `default` 模板。当需要自定义原生配置时，可以通过 `npx expo prebuild` 按需生成原生目录，而不必从一开始就选择 `bare-minimum`。（基于经验建议）

## 总结

`create-expo-app` 是 Expo 项目的起点工具，功能定位类似于 React Web 生态中的 `create-vite` 或 `create-next-app`。它通过模板系统提供从最小化到全功能的项目脚手架，自动处理包管理器兼容性、原生依赖安装等移动端特有的配置工作。

核心要点：

- 使用 `--template` 参数选择合适的模板，过渡期注意 SDK 版本默认为 SDK 54
- 了解你的包管理器在 React Native 场景下的限制（尤其是 Yarn 2+ 和 pnpm）
- `bare-minimum` 模板暴露原生工程，适合有原生开发经验的开发者
- 初始化时确定包管理器，避免后续切换带来的配置成本

---

## 文档导航

- **上一页**：[expo cli](./245__expo-cli.md)
- **下一页**：[create expo module](./247__create-expo-module.md)
