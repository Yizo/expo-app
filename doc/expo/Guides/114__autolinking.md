# 自动链接（Autolinking）

> 原始文档地址：https://docs.expo.dev/modules/autolinking/

本文档详细介绍了 Expo 应用中的**自动链接**系统——一种自动连接原生依赖的机制。借助该系统，开发者无需手动编辑 Gradle（Android）、CocoaPods（iOS）或 SwiftPM 等平台特定的清单文件，只需通过 npm 安装所需的包即可。核心工具 `expo-modules-autolinking` 负责命令行解析、Android Gradle 集成以及 iOS CocoaPods 集成，同时支持 Expo 模块和 React Native 模块。

---

## 什么是自动链接？

**自动链接**是指在构建阶段自动发现、解析并注册原生模块的过程。

**关键术语解释（面向初学者）：**

- **原生模块（Native Module）**：用 Java/Kotlin（Android）或 Swift/Objective-C（iOS）编写的底层代码模块，提供 JavaScript 无法直接实现的功能（如相机、传感器等）。
- **CocoaPods**：iOS/macOS 平台的依赖管理工具，类似于 npm 之于 Node.js。
- **Gradle**：Android 平台的构建和依赖管理系统。
- **SwiftPM**：Swift Package Manager，Apple 官方的 Swift 包管理工具。
- **Podspec**：CocoaPods 的配置文件（`.podspec`），描述了 iOS 库的元数据和构建信息。
- **Monorepo（单仓多包仓库）**：将多个包/项目组织在同一个 Git 仓库中的代码管理方式。

---

## 链接行为

自动链接的解析过程在构建时触发，按以下四个步骤查找候选依赖：

1. **检查 `react-native.config.js`**：查找显式指定的根路径（仅限 React Native 模块）。
2. **扫描 `searchPaths` 配置中的目录**：遍历用户自定义的搜索路径。
3. **查找 `nativeModulesDir`**：默认值为 `./modules/`，用于存放本地开发的模块。
4. **递归解析应用的依赖和 peer 依赖**：模拟 Node.js 的依赖解析算法进行递归查找。

> **基于文档内容推导**：这四步的优先级从高到低排列，意味着 `react-native.config.js` 中显式指定的路径优先级最高，而递归依赖解析作为兜底机制优先级最低。

---

## 配置

自动链接的设置可以在三个位置进行配置，按优先级从低到高排列：

1. `package.json` 中的 `expo.autolinking` 对象
2. 平台特定覆盖项（`android`、`ios`、`apple`）
3. 命令行参数 / Podfile / Gradle 参数

---

### `searchPaths`（搜索路径）

定义模块发现的自定义搜索目录。

```json
{
  "expo": {
    "autolinking": {
      "searchPaths": ["../../packages"]
    }
  }
}
```

> **注意**：在 SDK 54 之前，`searchPaths` 默认包含 `node_modules` 目录。如需恢复旧行为，请显式列出你的 `node_modules` 路径。

---

### `nativeModulesDir`（原生模块目录）

指定本地模块目录，默认值为 `./modules`。

```json
{
  "expo": {
    "autolinking": {
      "nativeModulesDir": "./modules"
    }
  }
}
```

---

### `exclude`（排除模块）

阻止特定包参与链接，以减小二进制产物体积。

```json
{
  "expo": {
    "autolinking": {
      "android": {
        "exclude": ["expo-random", "third-party-expo-module"]
      }
    }
  }
}
```

> **注意**：在 SDK 54 之前，`exclude` 仅影响 Expo 模块。现在，React Native 模块也可以通过 `react-native.config.js` 进行排除。

**React Native 模块排除示例：**

```js
// react-native.config.js
module.exports = {
  dependencies: {
    'library-name': {
      platforms: {
        android: null,  // 设为 null 表示在 Android 平台排除该模块
      },
    },
  },
};
```

---

### `include`（包含模块）

从 SDK 55 开始可用。列出需要验证以进行去重的包。平台特定的列表会与根列表**合并**（而非覆盖）。

```json
{
  "expo": {
    "autolinking": {
      "include": ["third-party-expo-module"],
      "android": {
        "include": ["third-party-android-module"]
      }
    }
  }
}
```

> **基于文档内容推导**：`include` 字段的合并行为意味着根列表中的模块在所有平台生效，而平台特定列表中的模块作为补充，不会覆盖根列表。这种设计避免了在每个平台重复列出相同的模块。

---

### `flags`（编译标志）

仅适用于 iOS。用于向 CocoaPods 传递编译标志，例如 `inhibit_warnings`（抑制警告）。

**通过 Podfile 配置：**

```ruby
use_expo_modules!({
  flags: {
    :inhibit_warnings => false
  }
})
```

**通过 `package.json` 配置：**

```json
{
  "expo": {
    "autolinking": {
      "ios": {
        "flags": {
          "inhibit_warnings": true
        }
      }
    }
  }
}
```

---

### `buildFromSource`（从源码构建）

仅适用于 Android。列出需要绕过预构建版本、改为从源码构建的 Expo 模块包。

> **基于经验建议**：当你需要对某个 Expo 模块进行本地调试或修改其原生代码时，将其加入 `buildFromSource` 列表可以确保使用的是源码而非预编译的 AAR 文件，便于实时查看代码修改的效果。

---

### `legacy_shallowReactNativeLinking`（旧版浅层 React Native 链接）

恢复 SDK 54 之前的行为：仅在直接依赖中搜索 React Native 模块，忽略递归解析。

> **警告**：此选项为向后兼容而保留，不建议在新项目中使用。递归解析能更准确地发现嵌套依赖中的原生模块。

---

## CLI 命令

`expo-modules-autolinking` 提供了多个命令行工具，用于模块搜索、解析、验证等操作。

---

### `search`（搜索）

第一阶段解析，查找 Expo 模块并输出 JSON 格式的结果，同时包含重复模块的警告信息。

```sh
# npm
npx expo-modules-autolinking search

# yarn
yarn dlx expo-modules-autolinking search

# pnpm
pnpm dlx expo-modules-autolinking search

# bun
bunx expo-modules-autolinking search
```

**输出示例：**

```json
{
  "expo-random": {
    "path": "/absolute/path/to/node_modules/expo-random",
    "version": "13.0.0",
    "config": {
      // `expo-module.config.json` 的内容
    },
    "duplicates": [
      // 该模块的冲突重复项列表（优先级较低）
    ]
  }
}
```

---

### `resolve`（解析）

第二阶段解析，为指定平台提供详细信息（如 podspec 路径、Gradle 文件等）。

```sh
# npm
npx expo-modules-autolinking resolve --platform <apple|android>

# yarn
yarn dlx expo-modules-autolinking resolve --platform <apple|android>

# pnpm
pnpm dlx expo-modules-autolinking resolve --platform <apple|android>

# bun
bunx expo-modules-autolinking resolve --platform <apple|android>
```

**Apple 平台输出示例：**

```json
{
  "modules": [
    {
      "packageName": "expo-random",
      "packageVersion": "13.0.0",
      "pods": [
        {
          "podName": "ExpoRandom",
          "podspecDir": "/absolute/path/to/node_modules/expo-random/ios"
        }
      ],
      "swiftModuleNames": ["ExpoRandom"],
      "modules": ["RandomModule"],
      "appDelegateSubscribers": [],
      "reactDelegateHandlers": [],
      "debugOnly": false
    }
  ]
}
```

> **关键术语解释（面向初学者）：**
> - `pods`：CocoaPods 中的库单元，每个 pod 对应一个 iOS 原生库。
> - `podspecDir`：podspec 文件所在的目录路径。
> - `swiftModuleNames`：Swift 模块名称列表，用于 Swift 代码的 `import` 语句。
> - `appDelegateSubscribers`：订阅 AppDelegate 生命周期事件的模块列表。
> - `reactDelegateHandlers`：处理 React 委托的模块列表。
> - `debugOnly`：如果为 `true`，该模块仅在调试构建中包含。

---

### `verify`（验证）

检查是否存在重复的原生模块并显示警告。使用 `--verbose` 标志可查看完整的模块列表。

```sh
# npm
npx expo-modules-autolinking verify

# yarn
yarn dlx expo-modules-autolinking verify

# pnpm
pnpm dlx expo-modules-autolinking verify

# bun
bunx expo-modules-autolinking verify
```

> **基于经验建议**：建议在每次安装新依赖后都运行 `verify` 命令，及早发现重复模块问题，避免在运行时出现难以排查的崩溃。

---

### `react-native-config`（React Native 配置）

以标准 `react-native.config` 格式输出 React Native 模块的详细信息。

```sh
# npm
npx expo-modules-autolinking react-native-config

# yarn
yarn dlx expo-modules-autolinking react-native-config

# pnpm
pnpm dlx expo-modules-autolinking react-native-config

# bun
bunx expo-modules-autolinking react-native-config
```

**输出示例：**

```json
{
  "root": "/absolute/path/to",
  "reactNativePath": "/absolute/path/to/node_modules/react-native",
  "dependencies": {
    "@react-native-async-storage/async-storage": {
      "root": "/absolute/path/to/node_modules/@react-native-async-storage/async-storage",
      "name": "@react-native-async-storage/async-storage",
      "platforms": {
        "ios": {
          "podspecPath": "/absolute/path/to/node_modules/@react-native-async-storage/async-storage/RNCAsyncStorage.podspec",
          "version": "",
          "configurations": [],
          "scriptPhases": []
        }
      }
    }
  }
}
```

---

## 依赖解析与冲突

Node.js、Metro（JavaScript 打包工具）和自动链接三者使用的依赖解析算法存在差异，这在 monorepo 环境中尤其容易引发冲突。

**核心问题**：如果存在重复的原生模块，JavaScript 打包可能包含多个版本的模块代码，而原生应用只能使用其中一个版本，这种不一致会导致运行时崩溃。

**解决方案演进**：

- **SDK 54**：引入了 `experiments.autolinkingModuleResolution` 标志，使 Metro 的模块解析与自动链接保持一致。
- **SDK 55**：对 monorepo 项目自动启用该功能。

> **基于经验建议**：如果你在 monorepo 中遇到原生模块冲突导致的崩溃，首先检查是否启用了 `autolinkingModuleResolution`，然后运行 `expo-modules-autolinking verify` 确认是否还存在重复模块。

---

## 常见问题

### 如何设置自动链接？

通过 `create-expo-app` 生成的应用已自动包含自动链接配置。如果使用其他方式创建的项目，请参考裸机安装指南进行手动配置。

### 模块需要满足什么要求？

包需要包含 `expo-module.config.json` 配置文件，并且必须在其 `platforms` 数组中列出支持的环境。

### 与 React Native CLI 有什么区别？

Expo 版本的自动链接相比 React Native CLI 有以下优势：

- **更好的 monorepo 支持**：针对多包仓库进行了优化。
- **更快的性能**：解析速度更快。
- **重复检测**：自动检测并警告重复的原生模块。
- **深度集成**：与 Expo Modules API 深度整合。

### 如何选择退出（Opt Out）？

从 SDK 52 开始，Expo 默认使用自己的自动链接解析器。如果希望使用社区版 CLI（`@react-native-community/cli`），需要：

1. 设置环境变量：`EXPO_USE_COMMUNITY_AUTOLINKING=1`
2. 安装 `@react-native-community/cli`

> **注意**：即使选择退出，Expo 模块仍然会使用 Expo 自己的解析器进行链接。

---

## 配置速查表

| 配置项 | 适用平台 | SDK 要求 | 说明 |
|--------|----------|----------|------|
| `searchPaths` | 全平台 | — | 自定义模块搜索路径 |
| `nativeModulesDir` | 全平台 | — | 本地模块目录（默认 `./modules`） |
| `exclude` | 全平台 | — | 排除特定模块 |
| `include` | 全平台 | SDK 55+ | 显式包含模块（用于去重验证） |
| `flags` | iOS | — | CocoaPods 编译标志 |
| `buildFromSource` | Android | — | 从源码构建而非使用预编译包 |
| `legacy_shallowReactNativeLinking` | 全平台 | — | 恢复旧版浅层解析行为 |

---

## 文档导航

- **上一页**：[appdelegate subscribers](./113__appdelegate-subscribers.md)
- **下一页**：[shared objects](./115__shared-objects.md)
