# 如何在项目中使用独立的 Expo 模块

> **原文地址**：https://docs.expo.dev/modules/use-standalone-expo-module-in-your-project/
>
> **适用版本**：Expo SDK 56

---

## 概述

本指南介绍如何将独立创建的 Expo 模块（通过 CLI 工具生成的独立包）集成到现有应用中。主要提供两种方式：

1. **Monorepo（单一仓库）方式** —— 通过工作区（workspace）配置在本地引用模块
2. **发布到 npm 方式** —— 将模块发布到公共注册表后安装使用

> **关键术语说明（面向初学者）**：
> - **Expo 模块（Expo Module）**：一个可复用的原生代码 + JavaScript 代码包，能够为 Expo/React Native 项目提供原生功能（如相机、传感器等）。
> - **独立模块（Standalone Module）**：不依赖于特定项目、可以单独维护和发布的模块。
> - **Monorepo（单一仓库）**：将多个包（packages）放在同一个 Git 仓库中进行管理的代码组织方式。
> - **npm 注册表（npm Registry）**：npm 的公共包托管服务，开发者可以在上面发布和安装 JavaScript 包。

官方推荐的创建 Expo 模块的方式是通过 [Expo 模块入门指南](https://docs.expo.dev/modules/get-started/) 进行操作。本文则侧重于介绍替代方案——如何将模块独立维护或共享给其他项目。

---

## 方式一：使用 Monorepo

> **关键术语说明（面向初学者）**：
> - **工作区（Workspace）**：Monorepo 中的管理单元，允许在同一个仓库中组织多个应用和共享包。
> - **`packages/` 目录**：Monorepo 中用于存放共享库的文件夹。
> - **`apps/` 目录**：Monorepo 中用于存放各个应用项目的文件夹。

使用 Monorepo 方式需要预先建立以下目录结构：

- **`apps/`** 目录 —— 存放应用程序
- **`packages/`** 目录 —— 存放共享库
- 根目录的 **`package.json`** 配置文件 —— 用于工作区管理

更多关于 Monorepo 配置的详细信息，请参阅 [使用 Monorepo 工作](https://docs.expo.dev/guides/monorepos/)。

### 第一步：初始化新模块

建立好目录结构后，在 `packages/` 目录下生成新模块，并使用 `--no-example` 标志跳过示例应用的生成（因为在 Monorepo 中已有独立的应用项目，无需生成示例应用）。

> **`--no-example` 标志**：告诉 `create-expo-module` 工具不要自动生成 `example/` 示例应用目录。在 Monorepo 场景下使用此标志，因为你的主应用就是"示例"。

```sh
# npm
npx create-expo-module packages/expo-settings --no-example

# yarn
yarn create expo-module packages/expo-settings --no-example

# pnpm
pnpm create expo-module packages/expo-settings --no-example

# bun
bun create expo-module packages/expo-settings --no-example
```

> **基于经验建议**：`expo-settings` 只是示例名称，实际项目中请使用有意义且唯一的包名。如果打算将来发布到 npm，建议加上组织前缀（如 `@your-org/expo-settings`）以避免命名冲突。

### 第二步：设置工作区依赖

将新创建的库作为依赖项添加到应用的 `package.json` 配置文件中：

```json
{
  "dependencies": {
    "expo-settings": "*"
  }
}
```

> **说明**：`"*"` 表示接受任何版本。在 Monorepo 的本地工作区中，包管理器会自动解析为本地包。在生产项目中，建议锁定具体版本号或使用语义化版本范围。

### 第三步：构建并运行模块

首先，在库目录下启动编译器以监控文件变更并自动重新编译：

```sh
# npm
cd packages/expo-settings
npm run build

# yarn
cd packages/expo-settings
yarn run build

# pnpm
cd packages/expo-settings
pnpm run build

# bun
cd packages/expo-settings
bun run build
```

然后，在另一个终端窗口中，为使用该库的每个应用执行 prebuild 清理操作：

> **`prebuild --clean` 说明**：`prebuild` 是 Expo 的构建命令，会根据 `app.json`/`app.config.js` 配置生成本地原生项目文件（`android/` 和 `ios/` 目录）。`--clean` 标志会先清除已有的原生构建文件再重新生成，确保新的原生模块变更被正确包含。

```sh
# npm
npx expo prebuild --clean

# yarn
yarn expo prebuild --clean

# pnpm
pnpm expo prebuild --clean

# bun
bun expo prebuild --clean
```

最后，构建并运行应用：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios
```

### 第四步：验证模块可用

修改应用的主界面文件，导入并使用新模块：

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import * as Settings from 'expo-settings';

export default function TabOneScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{Settings.hello()}</Text>
    </View>
  );
}
```

如果一切正常，屏幕上将显示 **"Hello world! 👋"**。

> **基于经验建议**：在 Monorepo 模式下开发时，务必保持库目录下的 `build` 进程持续运行。如果修改了模块代码但界面没有更新，通常是因为编译进程未运行或 `prebuild` 未重新执行。

---

## 方式二：发布模块到 npm

如果你希望将模块公开分享给更广泛的社区，可以将其发布到 npm 公共注册表。

> **关键术语说明（面向初学者）**：
> - **npm publish**：将包发布到 npm 公共注册表的命令，发布后任何人都可以通过 `npm install` 安装使用。
> - **npm login**：登录 npm 账户的命令，发布包之前必须先登录。
> - **npm pack**：将包打包为本地 `.tgz` 文件（不发布），常用于发布前测试。
> - **Verdaccio**：一个开源的轻量级私有 npm 注册表，适合组织内部使用。

### 第一步：初始化新模块

创建一个全新的模块包。注意：由于该包将被公开发布，请选择一个独特且未被占用的包名。

```sh
# npm
npx create-expo-module expo-settings

# yarn
yarn create expo-module expo-settings

# pnpm
pnpm create expo-module expo-settings

# bun
bun create expo-module expo-settings
```

> **基于经验建议**：发布前务必在 [npmjs.com](https://www.npmjs.com/) 上搜索确认包名未被占用。如果包名已被使用，可以考虑使用作用域包名（如 `@your-username/expo-settings`）。

### 第二步：运行示例项目验证

在发布前，先通过示例项目验证模块功能正常。在模块根目录下启动编译器以监控代码变更：

```sh
# npm
npm run build

# yarn
yarn run build

# pnpm
pnpm run build

# bun
bun run build
```

在另一个终端中构建并启动示例应用：

```sh
# npm
cd example
npx expo run:android
npx expo run:ios

# yarn
cd example
yarn expo run:android
yarn expo run:ios

# pnpm
cd example
pnpm expo run:android
pnpm expo run:ios

# bun
cd example
bun expo run:android
bun expo run:ios
```

> **注意**：与 Monorepo 方式不同，通过标准方式创建的模块（不带 `--no-example`）会自动生成 `example/` 目录作为示例应用，可直接用于测试。

### 第三步：发布到 npm

发布前需要一个 npm 账户。如果还没有，请前往 [npm 官网](https://www.npmjs.com/signup) 注册。

首先，在终端中登录 npm：

```sh
npm login
```

然后，进入模块根目录并执行发布命令：

```sh
npm publish
```

发布成功后，你的代码即可被公开安装使用。

> **⚠️ 警告**：`npm publish` 发布后，公开包默认不可撤销删除（unpublish 有严格限制）。请确保代码中不包含敏感信息（如密钥、令牌等），并确认版本号正确。

### 其他分发方式

除了直接发布到 npm 公共注册表，还有以下替代方案：

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| **`npm pack`** | 生成本地 `.tgz` 归档文件 | 发布前本地测试 |
| **Verdaccio** | 搭建本地/组织内部的私有 npm 注册表 | 企业内部共享包 |
| **EAS Build 私有注册表** | 通过 EAS Build 管理安全的私有模块 | 使用 Expo 云服务的项目 |

更多信息请参阅 [使用 EAS Build 配置私有注册表](https://docs.expo.dev/build-reference/private-npm-packages/)。

### 第四步：测试已发布的模块

创建一个全新应用并安装刚发布的模块来验证发布是否成功：

```sh
# npm
npx create-expo-app@latest my-app --template default@sdk-56
cd my-app
npx expo install expo-settings

# yarn
yarn create expo-app my-app --template default@sdk-56
cd my-app
yarn expo install expo-settings

# pnpm
pnpm create expo-app my-app --template default@sdk-56
cd my-app
pnpm expo install expo-settings

# bun
bun create expo my-app --template default@sdk-56
cd my-app
bun expo install expo-settings
```

修改主界面组件以使用导入的模块：

```tsx
import React from 'react';
import * as Settings from 'expo-settings';
import { Text, View } from 'react-native';

export default function TabOneScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{Settings.hello()}</Text>
    </View>
  );
}
```

最后，执行 prebuild 并启动应用：

```sh
# npm
npx expo prebuild --clean
npx expo run:android
npx expo run:ios

# yarn
yarn expo prebuild --clean
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo prebuild --clean
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo prebuild --clean
bun expo run:android
bun expo run:ios
```

应用将渲染显示 **"Hello world! 👋"**。

> **基于经验建议**：测试已发布模块时，建议在一台全新机器或清除了 npm 缓存的环境中进行，以避免本地缓存导致测试结果不准确。可以使用 `npm cache clean --force` 清除缓存。

---

## 两种方式的对比

> **基于文档内容推导**

| 对比维度 | Monorepo 方式 | npm 发布方式 |
|----------|---------------|-------------|
| **适用场景** | 团队内部共享、多应用共用同一模块 | 公开分享、社区发布 |
| **开发体验** | 修改代码后即时生效（需 build 监控） | 每次修改需重新发布版本 |
| **版本管理** | 通过工作区自动解析 | 需严格遵循语义化版本 |
| **初始化参数** | 使用 `--no-example` 跳过示例 | 标准初始化（含示例） |
| **依赖安装** | 工作区内自动链接 | 通过 `npm install` / `expo install` |
| **可见性** | 仅仓库内可用 | 全球公开（除非使用私有注册表） |

---

## 下一步

完成模块集成后，可以继续探索以下主题：

- [**包装第三方原生库**](https://docs.expo.dev/modules/third-party-library/) —— 学习如何将现有的原生 Android/iOS 库封装为 Expo 模块
- [**创建原生模块教程**](https://docs.expo.dev/modules/native-module-tutorial/) —— 通过实战教程学习创建能保存配置数据的原生模块

---

## 文档导航

- **上一页**：[config plugin and native module tutorial](./104__config-plugin-and-native-module-tutorial.md)
- **下一页**：[third party library](./106__third-party-library.md)
