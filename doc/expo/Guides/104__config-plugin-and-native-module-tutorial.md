# 教程：创建一个带有 Config Plugin 的模块

> 原始文档地址：https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/

---

## 目录

- [概述](#概述)
- [关键概念解释](#关键概念解释)
- [第一步：初始化模块](#第一步初始化模块)
- [第二步：设置工作区](#第二步设置工作区)
- [第三步：运行示例项目](#第三步运行示例项目)
- [第四步：创建 Config Plugin](#第四步创建-config-plugin)
- [第五步：从模块中读取原生值](#第五步从模块中读取原生值)
- [第六步：运行你的模块](#第六步运行你的模块)
- [下一步](#下一步)

---

## 概述

Config Plugin（配置插件）允许开发者自定义 `prebuild` 命令在 **Continuous Native Generation（持续原生生成）** 工作流中生成的 iOS 和 Android 原生项目。它们可以向原生配置中插入属性、传递资产文件，甚至实现复杂的设置（如 App Extension targets）。

- **对于应用开发者**：Config Plugin 用于应用标准 app 配置中不存在的自定义项。
- **对于库开发者**：Config Plugin 可以为库的使用者自动化原生项目的配置过程。

本教程将演示如何从零开始构建一个 Config Plugin，并通过 Expo Module 获取注入到原生清单文件（manifest files）中的自定义值。

---

## 关键概念解释

| 术语 | 解释 |
|------|------|
| **Config Plugin（配置插件）** | 一个同步函数，接收 Expo 配置对象（`ExpoConfig`），返回修改后的配置对象。用于在 `prebuild` 阶段自动修改原生项目配置。 |
| **Mod** | 一种异步函数，可以修改原生项目文件（如源代码、属性列表 plist 等）。Mod 在第一次读取之后不会被序列化，因此可以在代码生成期间执行实际操作。 |
| **prebuild** | Expo CLI 的一个命令，用于根据 Expo 配置生成本地 iOS/Android 原生项目代码。 |
| **Continuous Native Generation（持续原生生成）** | 一种开发工作流，每次需要修改原生代码时都重新生成原生项目，而不是手动修改。这样可以保持原生代码的可重复性。 |
| **Manifest（清单文件）** | Android 的 `AndroidManifest.xml` 文件，包含应用的元数据、权限声明等信息。 |
| **Info.plist** | iOS 的属性列表文件，包含应用的配置信息（如 Bundle ID、权限描述等）。 |
| **Expo Module** | 使用 Expo Modules API 编写的原生模块，可以在 JavaScript 中调用原生平台功能。 |
| **JSI（JavaScript Interface）** | React Native 的 JavaScript 接口层，允许 JavaScript 与原生代码直接通信。 |

> **基于文档内容推导**：Config Plugin 和 Mod 的核心区别在于执行时机和序列化行为。Config Plugin 是同步的、可序列化的，在每次读取配置时都会执行；Mod 是异步的、不可序列化的，仅在 `prebuild` 的同步阶段执行。

---

## 第一步：初始化模块

使用 `create-expo-module` 脚本创建一个新的 Expo 模块项目。该脚本会生成 Android、iOS 和 TypeScript 的基础代码结构，以及一个用于测试的示例应用。

根据你的包管理器执行对应命令：

```sh
# npm
npx create-expo-module expo-native-configuration

# yarn
yarn create expo-module expo-native-configuration

# pnpm
pnpm create expo-module expo-native-configuration

# bun
bun create expo-module expo-native-configuration
```

> **说明**：本教程使用 `expo-native-configuration` 作为项目名称，你可以使用任何你想要的名称。后续代码中涉及的 `ExpoNativeConfiguration` 等标识符也会随之变化。

---

## 第二步：设置工作区

脚手架工具默认会生成一个 View（视图）模块，但本教程不需要它。我们需要删除默认的视图相关文件。

在终端中执行以下命令来删除 Kotlin、Swift 和 TypeScript 的视图相关文件：

```sh
cd expo-native-configuration
rm android/src/main/java/expo/modules/nativeconfiguration/ExpoNativeConfigurationView.kt
rm ios/ExpoNativeConfigurationView.swift
rm src/ExpoNativeConfigurationView.tsx src/ExpoNativeConfiguration.types.ts
rm src/ExpoNativeConfigurationView.web.tsx src/ExpoNativeConfigurationModule.web.ts
```

接下来，查找并替换以下文件的內容为最小化的样板代码：

### Android 模块（Kotlin）

文件路径：`android/src/main/java/expo/modules/nativeconfiguration/ExpoNativeConfigurationModule.kt`

```kotlin
package expo.modules.nativeconfiguration

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNativeConfigurationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeConfiguration")

    Function("getApiKey") {
      return@Function "api-key"
    }
  }
}
```

> **代码说明**：这里定义了一个名为 `ExpoNativeConfiguration` 的原生模块，并暴露了一个 `getApiKey` 函数，暂时返回硬编码的字符串 `"api-key"`。后续我们会让它从 Android 清单文件中读取真实注入的值。

### iOS 模块（Swift）

文件路径：`ios/ExpoNativeConfigurationModule.swift`

```swift
import ExpoModulesCore

public class ExpoNativeConfigurationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeConfiguration")

    Function("getApiKey") { () -> String in
      "api-key"
    }
  }
}
```

> **代码说明**：iOS 端的模块定义与 Android 端功能一致。`Function("getApiKey")` 注册了一个可从 JavaScript 调用的同步函数。

### TypeScript 模块定义

文件路径：`src/ExpoNativeConfigurationModule.ts`

```ts
import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoNativeConfigurationModule extends NativeModule {
  getApiKey(): string;
}

// 这个调用会从 JSI 加载原生模块对象
export default requireNativeModule<ExpoNativeConfigurationModule>('ExpoNativeConfiguration');
```

> **代码说明**：`requireNativeModule` 通过模块名称 `'ExpoNativeConfiguration'` 从原生端加载模块实例。`declare class` 为 TypeScript 提供了类型声明，使得在调用 `getApiKey()` 时能获得类型检查和自动补全。

### 入口文件

文件路径：`src/index.ts`

```ts
import ExpoNativeConfigurationModule from './ExpoNativeConfigurationModule';

export function getApiKey(): string {
  return ExpoNativeConfigurationModule.getApiKey();
}
```

> **代码说明**：这是库的公开 API。它将原生模块的方法包装为一个命名导出函数，使使用者只需 `import { getApiKey } from 'expo-native-configuration'` 即可使用。

### 示例应用组件

文件路径：`example/App.tsx`

```tsx
import * as ExpoNativeConfiguration from 'expo-native-configuration';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>API key: {ExpoNativeConfiguration.getApiKey()}</Text>
    </View>
  );
}
```

> **代码说明**：示例应用简单地调用 `getApiKey()` 并在屏幕上显示返回值。这将帮助我们验证模块是否正常工作。

### 示例应用的依赖配置

文件路径：`example/package.json`

```json
{
  ...
  "dependencies": {
    "expo-native-configuration": "file:.."
    ...
  }
}
```

> **代码说明**：`"file:.."` 表示示例应用依赖的是上一级目录中的本地模块包，这样在开发模块时可以即时看到修改效果。

---

## 第三步：运行示例项目

在项目根目录下，启动 TypeScript 编译器的监视模式（watch mode），以便在代码修改时自动重新编译 JavaScript：

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

> **基于经验建议**：建议在一个独立的终端窗口中运行此命令并保持其运行，这样你在修改 TypeScript 代码时可以自动重新编译，无需每次手动执行。

在**另一个终端**中，编译并启动示例应用。先进入 example 目录，清除并重新安装 node_modules，然后分别运行 Android 和 iOS 构建：

```sh
# npm
cd example
rm -rf node_modules && npm install
npx expo run:android
npx expo run:ios

# yarn
cd example
rm -rf node_modules && yarn install
yarn expo run:android
yarn expo run:ios

# pnpm
cd example
rm -rf node_modules && pnpm install
pnpm expo run:android
pnpm expo run:ios

# bun
cd example
rm -rf node_modules && bun install
bun expo run:android
bun expo run:ios
```

> **说明**：`expo run:android` 和 `expo run:ios` 会先编译原生代码，然后在模拟器或连接的设备上运行应用。首次运行可能需要较长时间来下载和编译所有依赖。

运行成功后，屏幕上应该显示文本：**API key: api-key**。

---

## 第四步：创建 Config Plugin

### 理解 Config Plugin 基础

Config Plugin 是**同步函数**，接收一个 Expo 配置对象并返回修改后的版本。通常以 `with` 作为前缀命名，所以我们将其命名为 `withMyApiKey`。

最基本的 Config Plugin 如下：

```js
const withMyApiKey = config => {
  return config;
};
```

### 理解 Mod（异步修改器）

你还可以使用 **Mod**，这是一种**异步函数**，用于修改原生项目文件（如源代码、属性列表 plist 等）。`config.mods` 对象在第一次读取后不会被序列化，这使得它可以在代码生成阶段执行实际操作。

> **重要提示**：创建 Config Plugin 时需要注意以下规则：
>
> - Config Plugin **必须是同步的**，并且返回值必须是可序列化的（添加的 mod 除外）。
> - Config Plugin 在**每次读取配置时**都会执行，而 mod **仅在 `prebuild` 命令的同步阶段**执行。

> **基于文档内容推导**：这意味着不要在 Config Plugin 中使用 `async/await`、`Promise` 或其他异步操作。如果需要执行异步操作（如读写文件），应该使用 Mod 机制。

> **基于经验建议**：强烈推荐使用 `expo-module-scripts` 包来简化开发。它提供了默认的 TypeScript 配置和 Jest 测试配置，可以让你专注于插件逻辑而无需手动配置工具链。

### 创建插件目录结构

首先，创建一个 `plugin` 目录来存放 TypeScript 代码，并在项目根目录创建一个入口文件。

#### 插件的 TypeScript 配置

文件路径：`plugin/tsconfig.json`

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

> **代码说明**：`extends` 继承自 `expo-module-scripts` 提供的插件专用 TypeScript 配置。`outDir` 设为 `build`，编译后的 JavaScript 文件将输出到此目录。

#### 插件逻辑

文件路径：`plugin/src/index.ts`

```ts
import { ConfigPlugin } from 'expo/config-plugins';

const withMyApiKey: ConfigPlugin = config => {
  console.log('my custom plugin');
  return config;
};

export default withMyApiKey;
```

> **代码说明**：`ConfigPlugin` 类型来自 `expo/config-plugins`，它为插件函数提供了正确的类型签名。此处先添加一个 `console.log` 来验证插件是否被正确加载。

#### 根目录入口文件

文件路径：`app.plugin.js`

```js
// 这个文件配置了你的插件入口文件
module.exports = require('./plugin/build');
```

> **代码说明**：`app.plugin.js` 是 Expo 约定的插件入口文件名。当用户在 `app.json` 的 `plugins` 数组中引用你的包时，Expo 会自动查找此文件。它简单地指向编译后的 TypeScript 输出。

### 测试插件加载

在项目根目录运行插件构建命令（TypeScript 监视模式）：

```sh
npm run build
```

然后将插件添加到示例应用的配置中。

文件路径：`example/app.json`

```json
{
  "expo": {
    ...
    "plugins": ["../app.plugin.js"]
  }
}
```

在 example 目录中执行 clean prebuild 命令：

```sh
# npm
cd example
npx expo prebuild --clean

# yarn
cd example
yarn expo prebuild --clean

# pnpm
cd example
pnpm expo prebuild --clean

# bun
cd example
bun expo prebuild --clean
```

> **说明**：`--clean` 参数会在生成前删除现有的原生项目目录，确保完全重新生成。如果插件加载成功，你应该能在控制台输出中看到 `my custom plugin` 日志。

### 向原生清单文件注入自定义值

要将自定义 API 密钥注入到原生清单文件中，需要使用 `expo/config-plugins` 包提供的 **helper mod**（辅助修改器）。本教程将使用 Android 和 iOS 的专用辅助函数。

#### Android：修改 AndroidManifest.xml

`withAndroidManifest` 辅助函数允许你读取和修改 Android 的清单文件。使用 `AndroidConfig` 配置辅助工具将元数据（metadata）插入到主 application 节点中：

```ts
const withMyApiKey: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
  config = withAndroidManifest(config, config => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'MY_CUSTOM_API_KEY',
      apiKey
    );
    return config;
  });

  return config;
};
```

> **代码说明**：
> - `ConfigPlugin<{ apiKey: string }>` —— 泛型参数定义了插件接收的选项类型。
> - `withAndroidManifest` —— 一个 mod 辅助函数，它会自动处理 AndroidManifest.xml 的读取和写回。
> - `config.modResults` —— 包含已解析的 AndroidManifest.xml 内容。
> - `getMainApplicationOrThrow` —— 获取清单文件中的主 `<application>` 节点，如果不存在则抛出异常。
> - `addMetaDataItemToMainApplication` —— 向主 application 节点添加一个 `<meta-data>` 条目，这在 Android 中常用于存储应用级别的配置信息。

#### iOS：修改 Info.plist

`withInfoPlist` 辅助函数允许你修改 iOS 的属性列表文件。通过 `modResults` 属性直接注入自定义键值对：

```ts
const withMyApiKey: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
  config = withInfoPlist(config, config => {
    config.modResults['MY_CUSTOM_API_KEY'] = apiKey;
    return config;
  });

  return config;
};
```

> **代码说明**：`config.modResults` 在这里是一个表示 Info.plist 内容的 JavaScript 对象。直接赋值即可添加新的键值对，Expo 会在 `prebuild` 阶段将其写回到实际的 plist 文件中。

#### 合并为统一的插件

将 Android 和 iOS 的操作合并为一个完整的插件函数：

文件路径：`plugin/src/index.ts`

```ts
import {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  ConfigPlugin,
} from 'expo/config-plugins';

const withMyApiKey: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
  config = withInfoPlist(config, config => {
    config.modResults['MY_CUSTOM_API_KEY'] = apiKey;
    return config;
  });

  config = withAndroidManifest(config, config => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'MY_CUSTOM_API_KEY',
      apiKey
    );
    return config;
  });

  return config;
};

export default withMyApiKey;
```

### 传递配置参数

更新示例应用的配置，将 API 密钥作为插件选项传入：

文件路径：`example/app.json`

```json
{
  "expo": {
    ...
    "plugins": [["../app.plugin.js", { "apiKey": "custom_secret_api" }]]
  }
}
```

> **代码说明**：当插件需要配置参数时，`plugins` 数组中的条目从简单字符串变为一个二元组（tuple）：第一个元素是插件路径，第二个元素是传递给插件的选项对象。

再次运行 clean prebuild 命令来验证注入效果：

```sh
cd example
npx expo prebuild --clean
```

执行后，插件会将自定义 API 密钥注入到原生文件中。你可以通过检查生成的文件来确认：

- **Android**：检查 `example/android/app/src/main/AndroidManifest.xml`，应该能看到 `<meta-data android:name="MY_CUSTOM_API_KEY" android:value="custom_secret_api" />`
- **iOS**：检查 `example/ios/example/Info.plist`，应该能看到 `MY_CUSTOM_API_KEY` 键及其对应的值

---

## 第五步：从模块中读取原生值

现在原生清单文件中已经注入了自定义值，接下来需要配置原生模块来读取这些注入的字段。

### Android：从 AndroidManifest.xml 读取元数据

在 Android 中，通过 `PackageManager` 类读取 application 的元数据。更新 Kotlin 模块文件：

文件路径：`android/src/main/java/expo/modules/nativeconfiguration/ExpoNativeConfigurationModule.kt`

```kotlin
package expo.modules.nativeconfiguration

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.pm.PackageManager

class ExpoNativeConfigurationModule() : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeConfiguration")

    Function("getApiKey") {
      val applicationInfo = appContext?.reactContext?.packageManager?.getApplicationInfo(
        appContext?.reactContext?.packageName.toString(),
        PackageManager.GET_META_DATA
      )

      return@Function applicationInfo?.metaData?.getString("MY_CUSTOM_API_KEY")
    }
  }
}
```

> **代码说明**：
> - `appContext?.reactContext` —— 获取 React Native 的上下文对象，`?.` 是 Kotlin 的空安全操作符。
> - `packageManager.getApplicationInfo()` —— 通过包管理器获取应用信息，`PackageManager.GET_META_DATA` 标志表示需要包含元数据。
> - `applicationInfo?.metaData?.getString("MY_CUSTOM_API_KEY")` —— 从元数据 Bundle 中读取键为 `MY_CUSTOM_API_KEY` 的字符串值。

### iOS：从 Info.plist 读取值

在 iOS 中，通过 `Bundle.main` 的 `object(forInfoDictionaryKey:)` 方法读取属性列表中的值。更新 Swift 模块文件：

文件路径：`ios/ExpoNativeConfigurationModule.swift`

```swift
import ExpoModulesCore

public class ExpoNativeConfigurationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeConfiguration")

    Function("getApiKey") {
     return Bundle.main.object(forInfoDictionaryKey: "MY_CUSTOM_API_KEY") as? String
    }
  }
}
```

> **代码说明**：
> - `Bundle.main` —— 表示应用的主 bundle（程序包），其中包含了 Info.plist 等资源文件。
> - `object(forInfoDictionaryKey:)` —— 通过键名从 Info.plist 中读取值。
> - `as? String` —— Swift 的条件类型转换，将结果安全地转换为 `String?` 类型。如果值不存在或类型不匹配，将返回 `nil`。

---

## 第六步：运行你的模块

原生模块已经配置为从清单文件中读取注入的字段，现在运行示例应用来验证整个流程。

```sh
# npm
cd example
npx expo prebuild
npx expo run:android
npx expo run:ios

# yarn
cd example
yarn expo prebuild
yarn expo run:android
yarn expo run:ios

# pnpm
cd example
pnpm expo prebuild
pnpm expo run:android
pnpm expo run:ios

# bun
cd example
bun expo prebuild
bun expo run:android
bun expo run:ios
```

> **注意**：这里使用的是 `expo prebuild`（不带 `--clean`），因为之前已经通过 `--clean` 生成过原生项目。不带 `--clean` 时，Expo 只会同步配置变更而不删除已有的原生代码。

运行成功后，屏幕上应该显示：**API key: custom_secret_api** —— 即你在 `app.json` 中配置的自定义 API 密钥值。

> **基于经验建议**：如果看到的仍然是 `api-key` 而不是自定义值，请检查以下几点：
>
> 1. 确认 `app.plugin.js` 入口文件路径正确。
> 2. 确认 `plugin/src/index.ts` 已编译为 `plugin/build/index.js`。
> 3. 确认 `prebuild` 命令执行时没有报错。
> 4. 使用 `--clean` 参数重新生成原生项目，确保旧的缓存不会干扰。

---

## 下一步

恭喜你！你已经成功构建了一个 Config Plugin，它通过 Expo Module 在 Android 和 iOS 平台上实现了双向通信：Config Plugin 将配置注入原生清单文件，Expo Module 则从清单文件中读取这些配置并暴露给 JavaScript 层。

### 进阶挑战

尝试扩展这个插件的功能：

- 让插件接受**任意数量和名称**的配置键值对（而不仅仅是 `apiKey`）。
- 在模块中实现一个通用的读取函数，可以根据传入的键名动态读取任意配置值。

> **基于文档内容推导**：这个挑战的核心在于将 `ConfigPlugin<{ apiKey: string }>` 改为接受一个字典类型（如 `Record<string, string>`），然后在 Android 端遍历字典逐项注入 `<meta-data>`，在 iOS 端逐项写入 Info.plist。模块端则需要将硬编码的键名改为函数参数。

### 相关文档

- 查阅 [Modules API 参考文档](https://docs.expo.dev/modules/module-api/)，深入了解如何创建原生模块。
- 查阅 [额外平台支持文档](https://docs.expo.dev/modules/additional-platform-support/)，了解如何为你的模块添加 macOS 和 tvOS 兼容性支持。

---

## 文档导航

- **上一页**：[type generation tutorial](./103__type-generation-tutorial.md)
- **下一页**：[use standalone expo module in your project](./105__use-standalone-expo-module-in-your-project.md)
