# 在 Expo 项目中使用 Bun

> 原文地址：[https://docs.expo.dev/guides/using-bun/](https://docs.expo.dev/guides/using-bun/)

---

## 什么是 Bun？

Bun 是一个 ECMAScript（JavaScript/TypeScript）运行时环境，可以替代 Node.js 来运行 Expo 项目。相比 Node.js，Bun 具有以下优势：

- **更快的模块解析速度**：安装依赖包时显著提速
- **更快的启动速度**：本地开发时工具链启动更迅速

简单来说，Bun 能让你在日常开发 Expo 项目时获得更快的体验。

---

## 前提条件

在开始之前，需要完成以下准备工作：

1. **安装 Bun CLI**：在你的系统上安装 Bun 命令行工具。可以参考 Bun 官方文档进行安装。
2. **保留 Node.js LTS 版本**：即使使用 Bun，仍然需要一个 Node.js 长期支持（LTS）版本。这是因为某些初始化和预构建（prebuild）命令依赖 npm 的打包机制来获取模板。

> **基于文档内容推导**：Bun 并不能完全取代 Node.js 在 Expo 生态中的所有角色，部分底层操作仍需 Node.js/npm 支持。

---

## 创建新项目

使用 Bun 创建一个新的 Expo 应用：

```sh
bun create expo-app my-app
```

这条命令会在当前目录下创建一个名为 `my-app` 的新 Expo 项目，功能等同于使用 `npx create-expo-app my-app`。

---

## 运行项目脚本

在项目中运行 `package.json` 里定义的脚本任务时，使用 `bun run` 作为前缀：

```sh
bun run ios
```

这条命令会执行 `package.json` 中 `scripts` 字段下定义的 `ios` 脚本（通常用于在 iOS 模拟器中启动项目）。你可以将 `ios` 替换为其他已定义的脚本名称，例如 `android`、`start`、`web` 等。

---

## 安装 Expo 库

使用 `bun expo install` 来安装 Expo 生态中的库：

```sh
bun expo install expo-audio
```

这条命令会自动选择与当前 Expo SDK 版本兼容的 `expo-audio` 版本进行安装。

> **基于经验建议**：安装 Expo 官方库时，优先使用 `bun expo install` 而不是 `bun add`，因为前者会自动处理版本兼容性问题。

---

## 与 EAS Build（云端构建）集成

### 自动检测包管理器

EAS Build 的构建基础设施会通过项目中的 **lockfile**（锁文件）来自动检测你使用的包管理器。因此，你需要确保项目中存在正确的 Bun 锁文件。

执行以下命令生成锁文件：

```sh
bun install
```

### 锁文件格式说明

Bun 的锁文件格式取决于版本：

- **Bun 1.2 及以上版本**：生成基于文本的 `bun.lock` 文件
- **Bun 1.2 以下版本**：生成二进制格式的 `bun.lockb` 文件

> **基于文档内容推导**：文本格式的锁文件更利于版本控制（Git diff 可读性更好），建议升级到 Bun 1.2+ 以获得更好的开发体验。

### 清理冲突的锁文件

确保你的代码仓库中**不存在其他包管理器的锁文件**（例如 `package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`），以避免构建系统误判包管理器类型。

---

## 指定 Bun 版本

EAS Build 环境默认内置了 Bun，但你可以通过修改构建配置文件（`eas.json`）来固定使用特定版本：

```json
{
  "build": {
    "development": {
      "bun": "1.0.0"
    }
  }
}
```

上述配置表示在 `development` 构建配置中使用 Bun `1.0.0` 版本。你也可以在其他构建配置（如 `production`、`preview`）中做类似设置。

> **基于经验建议**：在团队协作或 CI/CD 环境中，固定 Bun 版本可以避免因版本差异导致的构建不一致问题。

---

## 处理生命周期脚本（Lifecycle Scripts）

### 为什么需要特别处理？

出于**安全考虑**，Bun **不会自动执行生命周期脚本**（如 `postinstall`）。这意味着如果某个依赖包需要在安装后执行额外的脚本（例如编译原生模块、生成类型定义等），你需要手动将其加入信任列表。

### 配置信任依赖

在 `package.json` 中添加 `trustedDependencies` 数组，将需要执行生命周期脚本的包名列出：

```json
{
  "trustedDependencies": ["your-dependency"]
}
```

将 `"your-dependency"` 替换为实际需要信任的包名。

### 重新安装依赖

配置完成后，需要清除现有的 `node_modules` 和锁文件，然后重新安装：

```sh
rm -rf node_modules
rm bun.lock bun.lockb
bun install
```

这几条命令依次执行以下操作：

1. `rm -rf node_modules` — 删除已安装的所有依赖包
2. `rm bun.lock bun.lockb` — 删除锁文件（兼容新旧两种格式）
3. `bun install` — 重新安装所有依赖，此时 `trustedDependencies` 中的包的生命周期脚本会被执行

---

## 常见问题：Sentry 构建失败

### 问题描述

在集成 Sentry 相关工具时，构建可能会失败。原因是 Sentry CLI（`@sentry/cli`）需要通过 `postinstall` 生命周期脚本来启用 source map 上传功能，而 Bun 默认不会执行该脚本。

### 解决方案

将 `@sentry/cli` 添加到 `package.json` 的 `trustedDependencies` 中：

```json
{
  "trustedDependencies": ["@sentry/cli"]
}
```

然后按照上一节的步骤重新安装依赖即可。

---

## 文档导航

- **上一页**：[localization](./156__localization.md)
- **下一页**：[editing richtext](./158__editing-richtext.md)
