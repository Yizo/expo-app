# 环境变量

> 原文地址：https://docs.expo.dev/guides/environment-variables/

本文介绍如何在 Expo 项目中使用环境变量（environment variables）来管理不同部署阶段的配置信息。环境变量是一种**键值对**（key-value）形式的外部配置，用于根据当前的部署环境修改应用的运行时行为。

---

## 什么是环境变量？

> **初学者提示**：环境变量是存储在应用外部的配置值。你可以把它理解为"写在文件里的设置项"，应用启动时会读取这些设置。这样你就可以在不修改代码的情况下，为开发环境和生产环境配置不同的 API 地址、密钥等信息。

在 Expo 中，Expo CLI 会在本地开发时自动从 `.env` 文件（dotenv 文件）中加载带有 `EXPO_PUBLIC_` 前缀的变量，并将它们注入到你的 JavaScript 代码中。

---

## 从 dotenv 文件加载环境变量

### 基本用法

在项目根目录下创建一个 `.env` 文件，写入带有 `EXPO_PUBLIC_` 前缀的变量：

```bash
EXPO_PUBLIC_API_URL=https://staging.example.com
EXPO_PUBLIC_API_KEY=abc123
```

然后在你的应用代码中，通过 `process.env` 对象直接访问这些变量：

```tsx
import { Button } from 'react-native';

function Post() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  async function onPress() {
    await fetch(apiUrl, { ... })
  }

  return <Button onPress={onPress} title="Post" />;
}
```

> **关键术语解释**：
> - **`process.env`**：这是 Node.js 提供的一个全局对象，包含所有环境变量。在 Expo 项目中，Metro 打包器（bundler）会在构建时将代码中的 `process.env.EXPO_PUBLIC_XXX` 替换为实际的字符串值。
> - **Metro 打包器**：Expo/React Native 使用的 JavaScript 打包工具，负责将你的源代码和资源打包成可运行的应用。
> - **内联替换（inlining）**：指在构建阶段，打包器将 `process.env.EXPO_PUBLIC_API_URL` 这样的引用直接替换为实际的字符串值（如 `"https://staging.example.com"`），而不是在运行时动态读取。

### 修改后需要重启

当开发服务器运行时，打包器会在构建阶段将变量引用替换为实际值。因此，**修改 `.env` 文件后需要完全重启应用才能生效**，热更新（hot reload）不会加载新的环境变量值。

> **安全警告**：切勿将敏感信息（如数据库密码、API 密钥等机密数据）存储在带有 `EXPO_PUBLIC_` 前缀的变量中。这些变量会被内联到最终的 JavaScript 打包文件中，任何人都可以查看编译后的代码来获取这些值。请参阅 [React Native 安全指南](https://reactnative.dev/docs/security#storing-sensitive-info) 了解更多信息。

---

## 加载机制

Expo CLI 遵循标准的 [dotenv 文件解析规则](https://github.com/bkeepers/dotenv/blob/c6e583a/README.md#what-other-env-files-can-i-use)。它会在客户端代码中替换带有 `EXPO_PUBLIC_` 前缀的变量引用，但**会忽略 `node_modules` 目录中的依赖包**，这是出于安全考虑的设计。

### 文件加载优先级

项目可以使用多个 `.env` 文件，它们按照以下优先级从高到低加载（高优先级的值会覆盖低优先级的同名变量）：

| 优先级 | 文件 | 说明 |
|--------|------|------|
| 1（最高） | `.env.development.local`、`.env.test.local`、`.env.production.local` | 特定环境的本地覆盖配置 |
| 2 | `.env.local` | 通用本地覆盖配置（`test` 环境除外不加载此文件） |
| 3 | `.env.development`、`.env.test`、`.env.production` | 特定环境的共享配置 |
| 4（最低） | `.env` | 所有环境的基础配置 |

> **基于经验建议**：将 `.env` 和 `.env.development` 等文件提交到版本控制中，供团队共享基础配置。将 `.env*.local` 文件添加到 `.gitignore` 中，因为本地文件通常包含个人化的机器配置（如本地网络地址），不应被提交。

在 `.gitignore` 中添加以下行来排除本地配置文件：

```bash
.env*.local
```

### 变量替换语法

在 `.env` 文件中，你可以使用以下语法：

- **变量引用**：使用 `${VAR}` 或 `$VAR` 引用已定义的其他变量（仅在无引号或双引号字符串中生效，单引号中的 `$` 会被视为普通字符）
- **命令替换**：使用 `$(your_command)` 注入终端命令的输出结果
- **多行值**：在双引号字符串中可以使用实际换行符或 `\n` 字符
- **注释**：使用 `#` 符号标记注释

---

## 访问模式（重要）

访问环境变量时，**必须使用静态的点表示法（dot notation）**，打包器才能正确地内联替换变量值。

### 正确的访问方式

使用标准的属性访问语法：

```tsx
// 正确：使用点表示法
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

### 错误的访问方式

以下写法**无法正常工作**，打包器不会进行内联替换：

```tsx
// 错误：使用中括号表示法（bracket notation）
const apiUrl = process.env['EXPO_PUBLIC_API_URL'];

// 错误：使用解构赋值（destructuring）
const { EXPO_PUBLIC_API_URL } = process.env;
```

> **基于文档内容推导**：这是因为 Metro 打包器在构建时使用静态分析来查找 `process.env.EXPO_PUBLIC_XXX` 这样的模式并进行替换。中括号表示法和解构赋值是动态访问方式，打包器无法在编译时确定要替换哪个变量。

---

## NODE_ENV 与运行模式

`NODE_ENV` 是一个特殊的环境变量，用于标识当前代码的运行模式，通常有以下三个值：

- **`development`**（开发模式）：本地开发时使用
- **`production`**（生产模式）：构建生产版本时使用
- **`test`**（测试模式）：运行测试时使用

### 不要使用 NODE_ENV 来切换配置文件

> **重要提示**：文档明确建议不要依赖 `NODE_ENV` 来切换不同的 `.env` 配置文件。原因如下：
>
> 1. `npx expo export` 命令会**强制将 `NODE_ENV` 设为 `production`**，这意味着你无法在导出时使用 `test` 模式的配置
> 2. EAS Update 也表现出相同的行为
>
> 替代方案：使用 EAS 环境拉取命令（environment pull commands）或自定义脚本来切换本地配置文件。

---

## 禁用环境变量功能

在排查问题时，你可能需要临时禁用环境变量的某些功能。Expo 提供了两个开关：

### 禁用 dotenv 文件加载

设置 `EXPO_NO_DOTENV=1`，可以阻止 Expo CLI 将 `.env` 文件加载到全局 `process.env` 中：

```bash
EXPO_NO_DOTENV=1 npx expo start
```

### 禁用客户端变量内联

设置 `EXPO_NO_CLIENT_ENV_VARS=1`，可以阻止打包器在客户端 JavaScript 代码中内联 `EXPO_PUBLIC_` 变量的值：

```bash
EXPO_NO_CLIENT_ENV_VARS=1 npx expo start
```

> **基于经验建议**：这两个选项主要用于调试和排查问题。如果你怀疑环境变量导致了某些异常行为，可以通过禁用它们来逐步定位问题根源。

---

## 与 EAS（Expo Application Services）的集成

> **关键术语解释**：
> - **EAS Build**：Expo 提供的云端构建服务，用于在远程服务器上构建你的 iOS/Android 应用。
> - **EAS Update**：Expo 提供的 OTA（Over-The-Air）更新服务，可以在不提交到应用商店的情况下向用户推送应用更新。

### EAS Build

EAS Build 使用 Metro 打包器将 `EXPO_PUBLIC_` 变量嵌入到 JavaScript 打包文件中。它支持以下几种配置方式：

- **上传的 `.env` 文件**：构建时会使用项目中的 dotenv 文件
- **`eas.json` 中的构建配置（build profiles）**：可以在 [eas.json](https://docs.expo.dev/build-reference/eas-json/) 的构建配置文件中直接定义环境变量
- **EAS Secrets（密钥管理）**：通过 EAS 的密钥管理系统安全地存储和注入敏感变量

> 更多信息请参阅 [EAS Build 介绍](https://docs.expo.dev/build/introduction/) 和 [EAS 环境变量与密钥](https://docs.expo.dev/eas/environment-variables/)。

### EAS Update

EAS Update 在本地或 CI 环境中打包应用时，会使用当前可用的本地 `.env` 文件进行变量内联。

> 更多信息请参阅 [EAS Update 介绍](https://docs.expo.dev/eas-update/introduction/) 和 [EAS Update 中的环境变量用法](https://docs.expo.dev/eas/environment-variables/usage/#using-environment-variables-with-eas-update)。

---

## 从旧方案迁移

如果你之前使用了其他方式管理环境变量，以下是迁移到 Expo 内置环境变量方案的步骤。

### 从 react-native-config 迁移

[react-native-config](https://github.com/luggit/react-native-config) 是一个常用的第三方库，用于在 React Native 项目中管理环境变量。迁移步骤：

**第一步**：在 `.env` 文件中为变量添加 `EXPO_PUBLIC_` 前缀：

```diff
- API_URL=https://myapi.com
+ EXPO_PUBLIC_API_URL=https://myapi.com
```

**第二步**：如果你的配置文件使用了非标准文件名，需要重命名为标准的 `.env` 格式。

**第三步**：更新应用代码，移除旧的库导入，改用 `process.env`：

```diff
- import Config from 'react-native-config';

- const apiUrl = Config.API_URL;
+ const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

### 从 Babel 内联插件迁移

如果你之前使用 `babel-plugin-transform-inline-environment-variables` 等 Babel 插件来内联环境变量，迁移步骤：

**第一步**：为变量添加 `EXPO_PUBLIC_` 前缀：

```diff
- const apiUrl = process.env.API_URL;
+ const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

**第二步**：从 Babel 配置中移除转换插件：

```diff
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
-    plugins: ['transform-inline-environment-variables'],
  };
};
```

**第三步**：清除缓存以确保更改生效。

> **基于经验建议**：清除缓存可以执行 `npx expo start --clear` 命令，或者手动删除 `.expo` 目录。Babel 插件和 Expo 内置的变量内联机制可能会产生冲突，务必确保旧插件已完全移除。

### 从 direnv 迁移

[direnv](https://direnv.net/) 是一个 shell 级别的环境变量管理工具。如果你之前使用 direnv 来设置环境变量并通过[动态应用配置](https://docs.expo.dev/versions/latest/config/app/)的 `extra` 字段访问，迁移步骤：

**第一步**：将 JavaScript 相关的变量从 shell 配置文件转移到标准的 `.env` 文件中，并添加 `EXPO_PUBLIC_` 前缀。

**第二步**：更新应用代码，不再通过 `expo-constants` 的 `extra` 字段访问：

```diff
- import Constants from 'expo-constants';

- const apiUrl = Constants.expoConfig.extra.apiUrl;
+ const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

> **注意**：direnv 会影响所有进程的环境变量，因此它仍然适用于管理非 JavaScript 相关的配置（如构建工具、脚本等）。

---

## 安全最佳实践

> **安全警告**：最终用户可以轻松查看编译后的应用代码，因此：
>
> - **绝不要**将机密信息（如数据库密码、私钥、付费 API 密钥等）存储在带有 `EXPO_PUBLIC_` 前缀的环境变量中
> - 这些变量会被**内联到客户端 JavaScript 打包文件**中，以明文形式存在
> - 对于需要保密的配置，应使用 EAS Secrets 或在服务器端处理敏感逻辑

> 更多信息请参阅 [React Native 安全指南——存储敏感信息](https://reactnative.dev/docs/security#storing-sensitive-info)。

---

## 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| 修改 `.env` 文件后没有生效 | 需要完全重启应用（非热更新），执行 `npx expo start --clear` |
| `process.env['EXPO_PUBLIC_XXX']` 返回 undefined | 必须使用点表示法 `process.env.EXPO_PUBLIC_XXX` |
| 变量值在打包后未正确替换 | 确认变量名带有 `EXPO_PUBLIC_` 前缀，且未使用解构或中括号语法 |
| 想在 `.env` 文件中引用其他变量 | 使用 `${VAR_NAME}` 语法 |
| 不同环境需要不同配置 | 使用 `.env.development`、`.env.production` 等文件区分 |

---

## 文档导航

- **上一页**：[permissions](./7__permissions.md)
- **下一页**：[overview](./9__overview.md)
