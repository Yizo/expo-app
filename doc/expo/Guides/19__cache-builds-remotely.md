# 远程缓存构建

> 原文地址：https://docs.expo.dev/guides/cache-builds-remotely/

---

## 概述

本文档介绍如何通过**构建缓存提供者（Build Cache Provider）** 来加速本地开发工作流。

### 什么是构建缓存？

**构建缓存**是一种优化机制：将你编译好的应用二进制文件（即构建产物）存储到远程服务器上。下次需要构建时，系统会先检查是否存在相同的缓存，如果有就直接下载使用，而不必重新编译。

> **关键术语解释：**
> - **编译（Compile/Build）**：将你写的源代码转换成设备可以运行的二进制文件的过程。对于 React Native / Expo 项目，这通常包括编译原生代码（Android 的 Java/Kotlin、iOS 的 Swift/Objective-C）。
> - **`npx expo run:android` / `npx expo run:ios`**：Expo 提供的本地构建命令，分别用于在 Android 和 iOS 平台构建并运行你的应用。
> - **指纹（Fingerprint）**：一个哈希值（类似唯一标识符），用于描述项目当前的原生配置状态。如果项目的原生依赖没有变化，指纹就不会变化。系统通过比对指纹来判断缓存是否可用。
> - **二进制文件（Binary）**：编译后生成的可执行文件，例如 Android 的 APK 或 iOS 的 IPA。

### 工作流程

构建缓存的工作流程如下：

1. 运行 `npx expo run:android` 或 `npx expo run:ios`
2. 系统根据项目当前的**指纹（fingerprint）** 搜索远程缓存
3. **如果找到匹配的缓存**：直接下载已编译的二进制文件并运行，跳过编译过程
4. **如果没有找到匹配的缓存**：正常编译项目，然后将生成的二进制文件上传到远程缓存，供后续使用

> **基于文档内容推导：** 这意味着第一次构建不会加速（因为还没有缓存），但从第二次开始，只要项目原生配置没有变化，构建速度将大幅提升。

---

## 使用 EAS 作为构建缓存提供者

EAS（Expo Application Services）是 Expo 官方提供的云服务，可以直接用作构建缓存的后端存储。这是最简单的集成方式。

### 第一步：安装依赖

安装 `eas-build-cache-provider` 包作为开发依赖（devDependency）。

**macOS 和 Linux 环境：**

可以使用你偏好的包管理器（npm、yarn、pnpm 或 bun），命令格式如下：

```bash
# 使用 npm
npm expo install eas-build-cache-provider --dev

# 使用 yarn
yarn expo install eas-build-cache-provider --dev

# 使用 pnpm
pnpm expo install eas-build-cache-provider --dev

# 使用 bun
bun expo install eas-build-cache-provider --dev
```

**Windows 环境：**

Windows 系统需要额外的分隔符：

```bash
# 使用 npm
npm expo install eas-build-cache-provider "--" --dev

# 使用 yarn
yarn expo install eas-build-cache-provider "--" --dev

# 使用 pnpm
pnpm expo install eas-build-cache-provider "--" --dev

# 使用 bun
bun expo install eas-build-cache-provider "--" --dev
```

> **注意：** Windows 上需要添加 `"--"` 分隔符，这是因为 Windows 的命令解析方式不同，该分隔符确保 `--dev` 标志被正确传递给 Expo CLI 而非包管理器本身。

### 第二步：配置 app.json

在项目的 `app.json` 文件中，将 `buildCacheProvider` 设置为 `"eas"`：

```json
{
  "expo": {
    "buildCacheProvider": "eas"
  }
}
```

> **关键术语解释：**
> - **`app.json`**：Expo 项目的核心配置文件，用于声明应用名称、图标、权限、插件等配置信息。所有 Expo 项目都会在根目录包含此文件。

---

## 自定义构建缓存提供者

如果 EAS 不满足你的需求，你可以创建自己的构建缓存提供者插件。这需要实现一个符合特定接口的 TypeScript 插件。

### 插件接口定义

缓存提供者插件的类型定义如下：

```ts
type BuildCacheProviderPlugin<T = any> = {
  // 【必须实现】尝试获取缓存的构建，返回 URL 或 null
  resolveBuildCache(props: ResolveBuildCacheProps, options: T): Promise<string | null>;

  // 【必须实现】上传新的构建到缓存，返回 URL 或 null
  uploadBuildCache(props: UploadBuildCacheProps, options: T): Promise<string | null>;

  // 【可选】自定义指纹哈希的计算方式
  calculateFingerprintHash?: (
    props: CalculateFingerprintHashProps,
    options: T
  ) => Promise<string | null>;
};
```

各属性类型定义如下：

```ts
type ResolveBuildCacheProps = {
  projectRoot: string;        // 项目根目录的绝对路径
  platform: 'android' | 'ios'; // 目标平台
  runOptions: RunOptions;      // 运行命令时的选项参数
  fingerprintHash: string;     // 项目的指纹哈希值
};

type UploadBuildCacheProps = {
  projectRoot: string;        // 项目根目录的绝对路径
  buildPath: string;          // 构建产物的文件路径
  runOptions: RunOptions;     // 运行命令时的选项参数
  fingerprintHash: string;    // 项目的指纹哈希值
  platform: 'android' | 'ios'; // 目标平台
};

type CalculateFingerprintHashProps = {
  projectRoot: string;        // 项目根目录的绝对路径
  platform: 'android' | 'ios'; // 目标平台
  runOptions: RunOptions;      // 运行命令时的选项参数
};
```

> **关键术语解释：**
> - **`resolveBuildCache`**：解析/查找缓存的构建。系统在构建前调用此方法，如果返回一个 URL 字符串，系统将从该地址下载缓存的构建；如果返回 `null`，表示没有找到缓存，将进行完整编译。
> - **`uploadBuildCache`**：上传构建产物到缓存。在完整编译完成后，系统调用此方法将新的二进制文件上传到远程存储。
> - **`calculateFingerprintHash`**：可选方法，允许你自定义指纹的计算逻辑。如果不实现此方法，将使用 Expo 默认的指纹计算方式。
> - **泛型参数 `<T = any>`**：表示 `options` 的类型可以由你自定义，用于传递插件特定的配置参数。

### 实战示例

Expo 官方提供了一个基于 **GitHub Releases** 的构建缓存提供者示例，可以在 "Build Cache Provider Example" 仓库中查看。

> **基于经验建议：** 如果你的团队有自己的 CI/CD 基础设施或对象存储服务（如 AWS S3、阿里云 OSS），可以考虑编写自定义插件将构建缓存存储在自己的服务器上，这样既能利用缓存加速，又无需依赖第三方服务。

---

## 从零创建自定义缓存提供者（完整步骤）

以下是一个完整的教程，教你如何从头搭建一个自定义构建缓存提供者。

### 前置准备

创建项目结构：
- 一个 `provider/` 文件夹，用于存放 TypeScript 插件代码
- 一个 `provider.plugin.js` 入口文件，放在项目根目录

### 步骤 1：创建 `provider/tsconfig.json`

在 `provider/` 目录下创建 TypeScript 配置文件：

```json
{
  "extends": "expo-module-scripts/tsconfig.plugin",
  "compilerOptions": {
    "outDir": "build",
    "rootDir": "src"
  },
  "include": ["./src"],
  "exclude": ["**/__mocks__/*", "**/__tests__/*"]
}
```

> **关键术语解释：**
> - **`tsconfig.json`**：TypeScript 编译器的配置文件，告诉编译器如何处理 `.ts` 文件。
> - **`expo-module-scripts`**：Expo 提供的一套脚本工具，包含了预定义的 TypeScript 配置模板。
> - **`outDir`**：编译后的 JavaScript 文件输出目录。
> - **`rootDir`**：TypeScript 源代码所在的根目录。

### 步骤 2：编写 `provider/src/index.ts`

创建插件的主文件，导入类型定义并实现基本的插件结构：

```ts
import { type BuildCacheProviderPlugin } from '@expo/config';

const plugin: BuildCacheProviderPlugin = {
  resolveBuildCache: async () => {
    console.log('Searching for remote builds...');
    return null;
  },
  uploadBuildCache: async () => {
    console.log('Uploading build to remote...');
    return null;
  },
};

export default plugin;
```

> **说明：** 这只是一个脚手架模板。`resolveBuildCache` 和 `uploadBuildCache` 目前都返回 `null`（即不做任何实际缓存操作），你需要根据自己的存储后端替换这些逻辑。

### 步骤 3：创建根目录入口文件 `provider.plugin.js`

在项目根目录创建入口文件，指向编译后的插件代码：

```js
module.exports = require('./provider/build');
```

### 步骤 4：编译插件

在项目根目录运行以下命令，启动 TypeScript 编译器（监听模式，文件修改后自动重新编译）：

```bash
npm run build provider
```

### 步骤 5：配置示例项目

在 `example/app.json` 中配置 `buildCacheProvider`，指向你的插件文件：

```json
{
  "expo": {
    "buildCacheProvider": {
      "plugin": "./provider.plugin.js"
    }
  }
}
```

### 步骤 6：验证插件

在示例项目文件夹中运行以下命令，观察终端中是否出现你的插件输出的日志信息：

```bash
npx expo run:android
# 或
npx expo run:ios
```

如果看到 `Searching for remote builds...` 和 `Uploading build to remote...` 的输出，说明插件已正确加载。

### 步骤 7：传递自定义参数

如果需要向插件传递额外的配置参数，可以在 `app.json` 的 `buildCacheProvider` 中添加 `options` 对象。这些参数会作为第二个参数传递给你的插件方法：

```json
{
  "expo": {
    "buildCacheProvider": {
      "plugin": "./provider.plugin.js",
      "options": {
        "myCustomKey": "XXX-XXX-XXX"
      }
    }
  }
}
```

> **使用场景举例：** `options` 中可以传递 API 密钥、存储桶名称、服务端点地址等配置信息，让你的插件知道该将构建产物上传到哪里、从哪里获取缓存。

---

## 限制与注意事项

使用构建缓存时，需要注意以下限制：

### 1. 仅适用于本地构建命令

构建缓存机制**仅对本地执行命令生效**（即 `npx expo run:android` 和 `npx expo run:ios`）。

> **重要：** 通过 `eas build` 触发的构建**不受影响**，它们始终会生成新的构建产物，不会查询缓存插件。

> **关键术语解释：**
> - **`eas build`**：Expo 的云端构建服务命令，它在 EAS 的服务器上编译你的应用，与本地构建是完全不同的流程。

### 2. iOS 真机构建不会被缓存

针对 iOS 物理设备（真机）的构建**不会使用缓存**，也不会上传到缓存。

**原因：** 真机构建与设备的**配置文件（provisioning profile）** 绑定。一个真机构建只在与其配置文件匹配的设备上有效。在不同设备之间共享真机构建存在安全风险。

> **关键术语解释：**
> - **Provisioning Profile（配置文件）**：Apple 颁发的一种证书文件，用于授权特定的应用在特定的设备上运行。每个真机调试/发布构建都需要绑定对应的配置文件。
> - **Simulator（模拟器）**：macOS 上的 iOS 模拟环境，不需要配置文件，因此模拟器构建可以安全地共享和缓存。

**结论：** 只有 iOS **模拟器（Simulator）** 构建才会被缓存。

### 3. 远程版本号配置的影响

当你在 `eas.json` 中使用 `"appVersionSource": "remote"` 配置时：

- **`buildNumber`**（iOS 构建号）和 **`versionCode`**（Android 版本号）存储在 EAS 基础设施上，而非你的本地代码库中
- 这些值**不会被纳入指纹计算**
- 本地执行时**不会自动递增**这些版本号
- 因此，缓存的二进制文件将**保留其初始构建号**

> **关键术语解释：**
> - **`eas.json`**：EAS Build 的配置文件，用于定义不同的构建配置（如 development、preview、production）。
> - **`buildNumber`**：iOS 应用的内部版本标识符，每次提交 App Store 时需要递增。
> - **`versionCode`**：Android 应用的内部版本标识符（整数），每次发布到 Google Play 时需要递增。
> - **`appVersionSource: "remote"`**：一种配置模式，让 EAS 服务管理版本号而非本地管理。

> **基于经验建议：** 如果你的项目使用了远程版本号配置，在使用构建缓存时需要注意：缓存的构建可能携带过时的版本号。在发布到应用商店之前，建议通过 `eas build`（不使用缓存）来确保版本号正确。

---

## 总结

| 功能 | 说明 |
|------|------|
| **缓存触发条件** | 运行 `npx expo run:android` 或 `npx expo run:ios` |
| **缓存匹配依据** | 项目指纹（fingerprint hash） |
| **官方缓存提供者** | EAS（设置 `buildCacheProvider: "eas"`） |
| **自定义缓存** | 实现 `BuildCacheProviderPlugin` 接口 |
| **不支持缓存的场景** | `eas build` 命令、iOS 真机构建 |
| **注意事项** | 远程版本号不纳入指纹计算 |

> **基于文档内容推导：** 构建缓存的核心价值在于减少本地开发中重复编译的时间开销。对于频繁修改 JavaScript/TypeScript 代码但不常改动原生配置的开发者来说，这项优化尤为有效——因为只要原生配置不变，指纹就不变，缓存就会持续命中。

---

## 文档导航

- **上一页**：[local app production](./18__local-app-production.md)
- **下一页**：[prebuilt expo modules](./20__prebuilt-expo-modules.md)
