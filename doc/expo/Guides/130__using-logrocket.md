# 使用 LogRocket

> 原文地址：https://docs.expo.dev/guides/using-logrocket/

本指南介绍如何在 Expo 项目中安装和配置 LogRocket，以实现会话回放（Session Replay）和错误监控（Error Monitoring）。

---

## 概述

LogRocket 是一款**会话回放与错误监控**工具，能够记录用户使用应用的全过程，并在用户操作过程中识别和捕获 Bug。通过 LogRocket，开发者可以像"回看录像"一样重现用户的操作场景，从而更高效地定位和修复问题。

LogRocket 在 Expo 项目中的核心能力包括：

| 功能 | 说明 |
|------|------|
| **会话回放（Session Replay）** | 录制用户在应用中的完整操作过程，可以回放查看用户的实际操作路径和界面状态 |
| **错误监控（Bug Tracking）** | 自动捕获应用运行中的错误和异常，帮助开发者快速定位问题 |
| **EAS Update 关联** | 可以按特定的更新标识（Update ID）对回放进行排序和筛选，方便定位某次 OTA 更新引发的问题 |
| **EAS Dashboard 集成** | 将 LogRocket 的外部仪表板与 EAS 平台关联，在 EAS 的部署和更新界面中直接查看最近的会话回放 |

> **术语解释（面向初学者）**：
> - **会话回放（Session Replay）**：将用户在应用中的操作过程像录像一样记录下来，开发者可以事后回放观看，了解用户的具体操作路径和遇到的问题。
> - **错误监控（Error Monitoring / Bug Tracking）**：自动检测并记录应用运行中出现的错误或崩溃，提供错误发生时的上下文信息，帮助开发者快速定位和修复问题。
> - **EAS（Expo Application Services）**：Expo 提供的云端服务套件，包括构建（Build）、更新（Update/OTA）等功能，是 Expo 项目的核心基础设施。
> - **OTA 更新（Over-The-Air Update）**：通过空中下发的方式更新应用的 JavaScript 代码和资源，无需通过应用商店重新发布，用户可以即时获取最新版本。

---

## 前提条件

在开始之前，请确保你的项目满足以下条件：

- 使用 Expo 管理的项目（Expo managed workflow）
- 已注册 [LogRocket](https://logrocket.com/) 账号并创建了项目
- 项目已配置为使用**开发构建（Development Build）**，而非 Expo Go

> **术语解释（面向初学者）**：
> - **开发构建（Development Build）**：通过 EAS Build 或本地构建系统生成的自定义应用二进制文件，包含了你项目所需的所有原生依赖。它允许你自由添加第三方原生模块，是集成 LogRocket 的必要条件。
> - **Expo Go**：Expo 提供的通用预览应用，可以快速运行大部分 Expo 项目，但它只包含预编译的标准原生模块集合，无法加载需要自定义原生代码的第三方库（如 LogRocket）。

> **基于文档内容推导**：由于 LogRocket 的 React Native SDK 需要通过原生插件（Config Plugin）来修改底层原生配置（如 Android 的 `minSdkVersion`），因此它不兼容 Expo Go，必须使用开发构建工作流。

---

## 安装与配置 LogRocket

### 第一步：安装依赖包

使用你常用的包管理器安装 `@logrocket/react-native` 和 `expo-build-properties` 两个包：

```bash
npx expo install @logrocket/react-native expo-build-properties
```

```bash
yarn expo install @logrocket/react-native expo-build-properties
```

```bash
pnpm expo install @logrocket/react-native expo-build-properties
```

```bash
bun expo install @logrocket/react-native expo-build-properties
```

> **术语解释（面向初学者）**：
> - **`@logrocket/react-native`**：LogRocket 官方提供的 React Native SDK 包，用于在 React Native / Expo 项目中实现会话回放和错误监控功能。
> - **`expo-build-properties`**：Expo 官方提供的配置插件（Config Plugin），允许你通过 `app.json` 或 `app.config.js` 来修改原生构建属性（如 Android 的 `minSdkVersion`、iOS 的部署目标等），而无需手动编辑原生代码。
> - **`expo install`**：Expo 提供的安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本进行安装，避免因版本不匹配导致的兼容性问题。

> **基于经验建议**：以上四种包管理器（npm、yarn、pnpm、bun）只需选择你项目中正在使用的那一种执行即可，无需全部运行。如果不确定当前使用的是哪个包管理器，可以查看项目根目录下是否存在 `yarn.lock`（yarn）、`pnpm-lock.yaml`（pnpm）、`bun.lockb`（bun）或 `package-lock.json`（npm）来判断。

### 第二步：配置应用配置文件

在你的应用配置文件（`app.json` 或 `app.config.js`）中注册 LogRocket 插件，并通过 `expo-build-properties` 插件将 Android 的最低 SDK 版本设置为 25：

```json
{
  "plugins": [
    [
      "expo-build-properties",
      {
        "android": {
          "minSdkVersion": 25
        }
      }
    ],
    "@logrocket/react-native"
  ]
}
```

> **术语解释（面向初学者）**：
> - **配置插件（Config Plugin）**：Expo 提供的一种机制，允许你在 `app.json` 或 `app.config.js` 中以声明式的方式修改原生项目配置。当你运行 `npx expo prebuild` 或 EAS Build 时，这些插件会自动应用到原生层。
> - **`minSdkVersion`**：Android 应用支持的最低 API 级别。设置为 25 意味着应用仅支持 Android 7.0（Nougat）及以上版本。LogRocket SDK 要求此最低版本才能正常运行。
> - **插件数组（plugins 数组）**：`app.json` 中的 `plugins` 字段接受一个数组，每个元素可以是一个字符串（简单插件）或一个二元组 `[插件名, 配置选项]`（带配置的插件）。

> **基于经验建议**：`expo-build-properties` 插件的配置项中，`minSdkVersion` 设置为 25 是 LogRocket 的硬性要求。如果你的项目中已经有 `expo-build-properties` 的配置（例如设置了其他属性），只需在现有配置中合并 `android.minSdkVersion` 字段即可，不要创建重复的插件条目。

> **注意**：修改插件配置后，需要重新生成原生项目代码（`npx expo prebuild`）或重新构建开发构建（EAS Build）才能生效。

### 第三步：在应用中初始化 LogRocket

在你的主布局文件（Layout File）或入口文件中，导入必要的模块并调用 LogRocket 的初始化方法。你需要将 `<App ID>` 替换为你在 LogRocket 仪表板中获取的实际应用标识符：

```tsx
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import LogRocket from '@logrocket/react-native';

const App = () => {
  useEffect(() => {
    LogRocket.init('<App ID>', {
      updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
      expoChannel: Updates.channel,
    });
  }, []);
};
```

> **术语解释（面向初学者）**：
> - **`LogRocket.init()`**：LogRocket SDK 的初始化方法，接受你的 App ID 和可选的配置对象。调用后，LogRocket 便开始记录用户会话。
> - **App ID**：LogRocket 为你的应用分配的唯一标识符。你可以在 LogRocket 仪表板的[项目设置页面](https://docs.logrocket.com/reference/getting-started-for-admins#getting-your-app-id)中找到它。
> - **`expo-updates`**：Expo 提供的 OTA 更新模块，用于管理和应用空中更新。代码中使用它来获取当前运行的更新信息。
> - **`Updates.isEmbeddedLaunch`**：一个布尔值，表示当前应用是否以嵌入式（初始打包）的方式启动，而非通过 OTA 更新启动。如果为 `true`，说明应用运行的是初始打包版本，此时 `updateId` 为 `null`。
> - **`Updates.updateId`**：当前正在运行的 OTA 更新的唯一标识符。通过这个 ID，你可以在 LogRocket 仪表板中按特定的更新版本筛选和排序会话回放。
> - **`Updates.channel`**：当前应用所连接的更新通道（Channel）名称，例如 `production`、`staging` 等。通过通道信息，你可以区分不同环境下的会话数据。
> - **`useEffect`**：React 的 Hook 之一，用于在组件挂载时执行副作用操作。此处用于在应用启动时初始化 LogRocket，空依赖数组 `[]` 确保初始化只在组件首次挂载时执行一次。

> **基于经验建议**：`updateId` 和 `expoChannel` 这两个选项是 LogRocket 与 Expo 更新系统深度集成的关键。它们允许你在 LogRocket 仪表板中按 OTA 更新版本和发布通道来过滤会话回放，这对于排查"某个特定更新版本引入的 Bug"非常有用。强烈建议保留这两个配置项，不要省略。

> **基于经验建议**：与许多分析工具类似，建议在生产环境中才启用 LogRocket，以避免开发调试时产生的大量测试数据干扰你的会话回放列表。可以使用 `__DEV__` 全局常量来控制：
>
> ```tsx
> useEffect(() => {
>   if (!__DEV__) {
>     LogRocket.init('<App ID>', {
>       updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
>       expoChannel: Updates.channel,
>     });
>   }
> }, []);
> ```

### 第四步：重新构建项目

由于 LogRocket 使用了**原生模块（Native Modules）**并且修改了原生配置，安装和配置完成后必须重新构建项目，而不能仅依赖热重载（Hot Reload）：

```bash
npx expo run:ios
```

```bash
npx expo run:android
```

或者通过 EAS Build 进行云端构建：

```bash
eas build --platform ios
```

```bash
eas build --platform android
```

> **术语解释（面向初学者）**：
> - **原生模块（Native Modules）**：使用平台原生语言（如 iOS 的 Swift/Objective-C、Android 的 Kotlin/Java）编写的代码模块，可以直接访问设备底层功能。LogRocket 的会话回放和错误捕获功能依赖原生模块来实现。
> - **热重载（Hot Reload / Fast Refresh）**：在不重新编译整个应用的情况下，实时更新 JavaScript 代码的变更。对于原生模块的变更或插件配置的修改，热重载无法生效，必须重新编译。
> - **EAS Build**：Expo 提供的云端构建服务，可以在云端为你的项目生成 iOS 和 Android 的应用二进制文件，无需在本地配置完整的原生开发环境。

---

## 在 EAS Dashboard 上关联 LogRocket

LogRocket 支持与 EAS Dashboard 进行集成关联，关联后可以直接在 EAS 的部署（Builds）和更新（Updates）界面中查看最近的 LogRocket 会话回放，无需跳转到外部仪表板。

### 关联步骤

1. **关联 LogRocket 账号**：前往你的 Expo 账号设置页面中的 [Connections（连接）](https://expo.dev/accounts/-/settings/connections) 区域，找到 LogRocket 并进行身份验证和授权。

2. **关联具体项目**：完成账号关联后，进入你的具体项目页面，在 [项目通用设置（Project General Settings）](https://expo.dev/accounts/-/projects/-/settings/general) 中将对应的 LogRocket 项目与 EAS 项目进行绑定。

3. **验证集成**：关联完成后，在 EAS Dashboard 的原生部署（Native Builds）和更新（Updates）界面中，会出现新的 LogRocket 按钮和最近的会话回放数据，可以直接点击查看详细的会话回放。

> **术语解释（面向初学者）**：
> - **EAS Dashboard**：Expo 提供的 Web 管理界面，用于管理项目的构建、更新、发布等操作。
> - **Connections（连接）**：EAS Dashboard 中的账号设置功能，允许你将 Expo 账号与第三方服务（如 LogRocket、Sentry、Bugsnag 等）进行关联和授权。
> - **Native Builds（原生部署）**：通过 EAS Build 生成的 iOS 或 Android 应用二进制文件的构建记录。
> - **Updates（更新）**：通过 EAS Update 发布的 OTA 更新记录。

> **基于文档内容推导**：EAS Dashboard 集成是 LogRocket 在 Expo 生态中的一大优势。它将原本分散在两个平台（EAS 和 LogRocket）的信息整合在一起，当你排查某个特定构建版本或 OTA 更新的问题时，无需在多个平台之间来回切换，大幅提升了调试效率。

---

## 兼容性说明

| 环境 | 兼容性 | 备注 |
|------|--------|------|
| **自定义开发构建（Custom Development Build）** | 完全兼容 | 需要配置 `expo-build-properties` 插件和 LogRocket 插件 |
| **Expo Go** | 不兼容 | LogRocket 依赖自定义原生代码，Expo Go 环境无法支持 |

> **基于文档内容推导**：如果你的项目当前仍在使用 Expo Go，并且希望引入 LogRocket，你需要先迁移到自定义开发构建工作流。可以参考 Expo 官方文档中关于"从 Expo Go 迁移到开发构建"的相关指南。

---

## 限制与注意事项

1. **不支持 Expo Go**：LogRocket 依赖自定义原生代码和配置插件，无法在 Expo Go 沙盒环境中运行。
2. **需要原生编译**：每次安装或更新 `@logrocket/react-native` 包后，都必须重新编译原生代码。
3. **Android 最低版本要求**：Android 的 `minSdkVersion` 必须设置为 25（Android 7.0 Nougat）或更高。
4. **生产环境优先**：建议使用 `__DEV__` 判断来限制 LogRocket 仅在生产环境中运行，以免开发调试数据干扰会话回放列表。
5. **App ID 必填**：初始化时必须提供正确的 LogRocket App ID，否则 SDK 无法正常工作。

---

## 了解更多

如需了解更多关于 LogRocket 的详细信息、高级配置选项和 API 参考，请参阅以下资源：

- **LogRocket 官网**：[https://logrocket.com/](https://logrocket.com/)
- **LogRocket Expo SDK 文档**：[https://docs.logrocket.com/docs/expo](https://docs.logrocket.com/docs/expo)
- **LogRocket App ID 获取指南**：[https://docs.logrocket.com/reference/getting-started-for-admins](https://docs.logrocket.com/reference/getting-started-for-admins)

---

## 文档导航

- **上一页**：[using bugsnag](./129__using-bugsnag.md)
- **下一页**：[using vexo](./131__using-vexo.md)
