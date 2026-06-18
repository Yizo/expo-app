> 原始文档来源：https://docs.expo.dev/workflow/continuous-native-generation/

# 持续原生生成（Continuous Native Generation, CNG）

本文档介绍如何使用持续原生生成（CNG）和预构建（Prebuild）来管理你的原生项目。CNG 是 Expo 工作流中的核心理念，它取代了过时的"从 Expo 弹出（eject）"或"托管工作流 vs 裸工作流（managed vs bare workflow）"等概念。

> **关键术语解释**
>
> - **原生项目（Native Project）**：移动应用需要用平台原生语言编写的代码部分。iOS 使用 Swift/Objective-C，Android 使用 Kotlin/Java。这些代码存放在项目根目录的 `ios/` 和 `android/` 文件夹中。
> - **预构建（Prebuild）**：Expo 提供的一个命令行功能，根据你的应用配置自动生成原生项目目录（`android/` 和 `ios/`）。它是 CNG 的核心执行工具。
> - **配置插件（Config Plugin）**：一种函数式机制，可以在 prebuild 过程中自动修改原生项目的配置（如添加权限、修改构建文件等），而无需手动编辑原生代码。
> - **自动链接（Autolinking）**：React Native 的一项功能，能够自动检测并注册已安装的第三方原生模块，无需手动配置原生代码。
> - **EAS（Expo Application Services）**：Expo 提供的云端服务套件，包括云端构建（EAS Build）、提交（EAS Submit）等功能。

---

## 核心理念

维护跨平台的原生代码库是一项困难的工作。持续原生生成（CNG）通过**仅在需要编译或调试时才生成临时的原生目录**来解决这个问题。开发者维护的是**配置定义**，而非整个原生代码库。

> **基于文档内容推导**：CNG 的核心思想类似于将原生项目视为"可丢弃的构建产物"——就像 `node_modules` 可以随时删除并重新安装一样，`android/` 和 `ios/` 目录也可以随时删除并重新生成。这使得升级框架版本、集成新功能变得更加简单可靠。

---

## CNG 在 React Native 应用中的工作方式

CNG 通过将以下六个要素合并在一起，生成可编译的原生应用：

1. **应用配置文件（Application Configuration）**：即 `app.json` 或 `app.config.js`，定义应用的基本信息（名称、图标、启动画面等）
2. **命令行参数（CLI Arguments）**：运行 prebuild 时传入的标志和选项
3. **已安装的框架版本及其基础模板（Framework Template）**：与当前 Expo SDK 版本对应的最小化原生项目模板
4. **自动链接（Autolinking）**：自动注册已安装的第三方原生模块
5. **原生订阅者（Native Subscribers）**：用于减少对入口文件的副作用修改
6. **EAS 凭证（EAS Credentials）**：用于应用签名的云端凭证管理

> **关键术语解释**
>
> - **应用签名（App Signing）**：移动操作系统要求所有安装到设备上的应用必须经过数字签名，以验证应用的来源和完整性。iOS 使用证书和描述文件，Android 使用密钥库（Keystore）。

---

## 使用方式

### 生成原生目录

要生成 `android/` 和 `ios/` 目录，可以通过你使用的包管理器运行 prebuild 命令：

```bash
# npm
npx expo prebuild

# yarn
yarn expo prebuild

# pnpm
pnpm expo prebuild

# bun
bun expo prebuild
```

> **警告**：不要手动编辑这些生成的目录。如果需要修改原生代码，应使用**配置插件（Config Plugin）**来应用修改。手动编辑会在下次运行 prebuild 时被覆盖。

### 使用 `--clean` 选项

使用 `--clean` 标志会在生成之前**删除现有的原生目录**，这是最安全的做法：

```bash
npx expo prebuild --clean
```

> **注意**：某些配置插件可能不具备**幂等性（Idempotency）**，即多次执行可能产生不同的结果。它们可能使用了风险较高的正则表达式修改器。因此，使用 `--clean` 可以防止出现意外的层叠行为。

> **关键术语解释**
>
> - **幂等性（Idempotency）**：一个操作无论执行多少次，结果都相同。例如，`x = 5` 是幂等的（多次赋值结果一样），但 `x = x + 1` 不是幂等的（每次执行结果不同）。

系统会在检测到原生目录中有未提交的版本控制更改时发出警告。如果你确认要跳过此检查，可以通过环境变量绕过。

---

## 与 EAS Build 配合使用

当使用 EAS Build（云端构建）时，如果 `android/` 和 `ios/` 目录不存在，系统会**自动生成**它们。如果目录已存在，系统会跳过生成步骤，以保护你的手动编辑。

> **基于文档内容推导**：这意味着如果你希望每次云端构建都使用最新的配置生成原生目录，应该将 `android/` 和 `ios/` 加入 `.gitignore`，确保它们不会被推送到代码仓库。

### 管理 `.gitignore`

为了确保云端构建能够每次都重新生成原生目录，需要将原生目录添加到版本控制的忽略文件中。新创建的项目默认已配置好忽略规则。对于已有项目，将以下内容添加到 `.gitignore` 文件：

```diff
+ /android
+ /ios
```

---

## 与 Expo CLI run 命令配合使用

在本地运行应用时，可以使用以下命令直接编译并在设备或模拟器上运行：

```bash
# 在 Android 设备/模拟器上运行
npx expo run:android

# 在 iOS 设备/模拟器上运行
npx expo run:ios
```

如果 `android/` 和 `ios/` 目录不存在，这些命令会**自动生成**它们。后续运行时，建议添加 `--clean` 标志以确保目录与配置保持同步。

---

## 平台支持

CNG 目前仅针对**移动平台**（Android 和 iOS）。Web 浏览器不需要原生编译步骤，因此不涉及 CNG 流程。

你可以使用 `--platform` 标志来限制只生成特定平台的原生目录：

```bash
npx expo prebuild --platform ios
```

---

## 依赖管理

Prebuild 会从与当前 SDK 版本对应的基础模板开始初始化。如果你的 React 版本与模板期望的版本不匹配，系统会显示警告。

你可以使用 `--skip-dependency-update` 标志来跳过特定包的版本更新：

```bash
npx expo prebuild --skip-dependency-update react-native,react
```

### 包管理器

工具会根据项目的**锁文件（lockfile）**自动推断你使用的包管理器。你也可以通过标志强制使用特定的包管理器，或者跳过安装步骤以加快测试速度。

> **关键术语解释**
>
> - **锁文件（Lockfile）**：如 `package-lock.json`（npm）、`yarn.lock`（yarn）、`pnpm-lock.yaml`（pnpm）等。它记录了每个依赖的精确版本，确保团队所有成员使用相同的依赖版本。

---

## 模板（Templates）

Prebuild 从**最小化的 Expo 模板**（bare minimum template）开始生成原生项目。这是默认行为，也是最推荐的方式。

你可以提供自定义的模板归档路径，但**不建议这样做**，因为模板中包含了一些未记录的假设条件，自定义模板可能导致不可预期的行为。

> **注意**：在**网络隔离环境**（airgapped environments）中，即所有包都从私有仓库下载且公共 npm 注册表访问被阻止的情况下，必须提供一个本地可用的模板副本。

> **关键术语解释**
>
> - **网络隔离环境（Airgapped Environment）**：一种与外部互联网物理隔离的网络环境，通常用于安全要求较高的企业或政府机构。在这种环境下，无法直接从公共仓库下载依赖包。

---

## 副作用（Side Effects）

运行 prebuild 会对你的 `package.json` 文件产生以下副作用：

1. **修改脚本（scripts）**：将 `start` 命令替换为 `run` 命令，这会改变本地开发的工作方式
2. **更新依赖（dependencies）**：更新部分依赖包的版本以匹配当前 SDK

脚本修改会影响本地工作流的行为，而其他更改可以提交到版本控制以最小化差异。

---

## 可选性（Optionality）

CNG 是**完全可选的**功能。

> **警告**：对于已有的 React Native 项目，如果原生项目是手动管理的，**不要使用** `npx expo prebuild`，否则会覆盖你的手动修改。

然而，所有 Expo 工具都完全支持手动管理的原生项目设置。如果你已经有一个手动维护的项目，可以继续使用现有的方式，无需切换到 CNG。

---

## 常见问题

### CNG 如何帮助项目升级？

升级过程变得类似于更新一个纯 JavaScript 应用。你只需：

1. 更新 `package.json` 中的版本号
2. 重新生成原生目录（使用 `npx expo prebuild --clean`）

这避免了传统 React Native 升级中繁琐的手动合并原生代码冲突的过程。

### React Native 库作者如何适配 CNG？

库作者可以通过以下几种模式来支持 CNG：

| 模式 | 适用场景 | 说明 |
|------|---------|------|
| **Node 解析（Node Resolution）** | 纯 JavaScript 库 | 无需任何原生配置，依赖标准的模块解析机制 |
| **自动链接（Autolinking）** | 标准原生模块 | 无需额外设置，React Native 自动注册原生代码 |
| **配置插件（Config Plugin）** | 需要安装副作用的库 | 编写配置插件来自动修改原生项目配置 |
| **生命周期监听器（Lifecycle Listener）** | 需要运行时钩子的库 | 使用生命周期监听器，避免修改标准入口文件 |

> **关键术语解释**
>
> - **生命周期监听器（Lifecycle Listener）**：在应用启动或运行过程中的特定时刻执行代码的机制。通过这种方式，库可以在不修改主应用入口文件的情况下注入自定义行为。

### CNG 是否仅限于 React Native 项目？

CNG 的概念并不局限于 React Native，但目前的实现是针对 React Native 和 Expo 生态系统的。

### 社区如何使用 CNG？

社区已经将许多复杂功能简化为基本的 JSON 配置。以下是通过配置插件实现的社区案例：

- **iOS Safari 浏览器扩展**（Safari Extensions）
- **iMessage 贴纸应用**（Sticker Apps）
- **Firebase 分析套件**（Analytics Suite）
- **跨平台主屏幕小组件**（Home Screen Widgets）
- **Apple App Clips**（轻应用）

### CNG 能否用于 Android 和 iOS 以外的操作系统？

目前 CNG 仅支持 Android 和 iOS，不支持其他操作系统。

### 使用 CNG 是否必须使用 Expo？

CNG 是 Expo 工具链的一部分，但它生成的项目是标准的 React Native 原生项目，可以脱离 Expo 工具独立使用。

### CNG 与 Web 开发中的静态站点生成（SSG）有何不同？

两者都是根据输入来生成项目的模式。关键区别在于：

| 特性 | CNG | SSG（静态站点生成） |
|------|-----|-------------------|
| **输出内容** | 原生运行时代码 | 静态 Web 文件（HTML/CSS/JS） |
| **产物去向** | 编译后可丢弃 | 部署到 Web 服务器 |
| **生成时机** | 按需生成（编译前） | 构建时生成 |

### CNG 能否用于已有的棕地（Brownfield）项目？

> **关键术语解释**
>
> - **棕地项目（Brownfield Project）**：指已经存在并运行中的原生应用项目，与"绿地项目（Greenfield）"（从零开始的新项目）相对。

CNG **不适用于**已有的棕地项目，因为它管理的是完整的原生状态。但是，你可以使用 CNG 生成一个全新的原生项目，然后将其集成到已有的应用中。

---

## Prebuild 详解

### Prebuild 如何帮助项目升级？

Prebuild 使得升级过程变得简单直接：更新版本号后重新运行 prebuild，即可生成与新版 SDK 兼容的原生目录，无需手动合并原生代码冲突。

### Prebuild 如何简化跨平台配置？

Prebuild 通过配置插件将复杂的多平台原生配置统一到一个声明式配置中，开发者只需维护一份配置，prebuild 会自动为每个平台生成正确的原生设置。

### 如何使用 Prebuild 管理依赖的副作用？

通过配置插件，可以在 prebuild 过程中自动处理第三方依赖所需的原生配置变更（如添加权限、修改构建脚本等），避免手动操作。

### Prebuild 如何帮助处理孤立代码？

使用 `--clean` 标志重新生成原生目录时，之前不再需要的配置和代码会被清除，避免了原生目录中积累无用代码的问题。

---

## Prebuild 可能不适合的场景

### 平台兼容性

如果你的项目需要支持 Android 和 iOS 以外的平台，CNG 目前无法满足需求。

### 直接修改比模块化和自动化更快

对于快速实验和原型验证，直接手动编辑原生代码可能比编写配置插件更高效。配置插件的开发需要一定的时间投入，对于一次性的修改可能不够划算。

### 社区配置插件支持不足

并非所有第三方包都有社区提供的配置插件。在这种情况下，你可以使用**树外插件仓库（out-of-tree plugin repositories）**，即由社区成员独立维护的非官方插件。

> **基于经验建议**：在决定采用 CNG 工作流之前，先检查项目所依赖的第三方库是否都有可用的配置插件。如果关键依赖缺少插件支持，可能需要自行编写配置插件，或者暂时采用手动管理原生代码的方式。

---

## 文档导航

- **上一页**：[configuration](./3__configuration.md)
- **下一页**：[using libraries](./5__using-libraries.md)
