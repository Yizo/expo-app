> 原文地址：https://docs.expo.dev/modules/get-started/

# Expo Modules API 快速入门

Expo Modules API 提供了一套用于创建原生模块（Native Module）的框架，让你可以用 Kotlin（Android）和 Swift（iOS）编写原生代码，并在 JavaScript/TypeScript 中直接调用。

> **关键术语解释（面向初学者）：**
>
> - **Expo Modules API**：Expo 提供的原生模块接口框架，开发者可以用它编写跨平台原生功能，并通过统一的 JS API 暴露给 React Native 应用。
> - **原生模块（Native Module）**：用平台原生语言（Android 用 Kotlin、iOS 用 Swift）编写的功能模块，可被 JavaScript 代码调用。
> - **prebuild**：Expo 的预构建命令，用于生成原生项目目录（`android/` 和 `ios/`），以便进行原生代码编辑。
> - **Pods**：iOS 的依赖管理工具 CocoaPods 管理的依赖单元。iOS 原生模块需要通过 Pods 安装到项目中。
> - **local module（本地模块）**：直接创建在项目内部的模块，不需要发布到 npm，适合开发和测试阶段。

你可以选择**从零初始化一个全新模块**，也可以将 Expo Modules API **集成到已有的原生库**中。本指南聚焦于**创建全新模块**的场景；如果你想将 Expo Modules API 集成到已有库中，请参阅相关文档。

---

## 推荐工作流

Expo 提供了两种主要的工作流来开发原生模块：

1. **将新模块添加到已有的 Expo 应用中** —— 适合在已有项目中测试和开发模块。
2. **独立创建模块并附带示例项目** —— 适合需要在多个项目间复用模块，或打算发布到 npm 的场景。

> **基于经验建议：** 如果你是第一次接触 Expo Modules API，建议选择第一种方式（添加到已有应用中），这样可以更快看到效果，也更容易调试。等你熟悉之后，再考虑使用独立模块的方式来做可复用的库。

---

## 方式一：将新模块添加到已有的 Expo 应用

### 第一步：创建本地 Expo 模块

进入你的项目根目录（即包含 `package.json` 的目录），然后执行以下命令来生成一个本地模块：

```sh
# npm
npx create-expo-module@latest --local

# yarn
yarn create expo-module --local

# pnpm
pnpm create expo-module --local

# bun
bun create expo-module --local
```

> **关键术语解释：**
>
> - `--local` 标志：告诉脚手架工具将模块创建在当前项目内部（通常在 `modules/` 目录下），而不是创建一个独立的包。
> - `create-expo-module`：Expo 官方的模块脚手架工具，会自动生成原生代码目录结构、源文件和配置文件。

执行命令后，按照提示输入模块名称并接受默认选项。该命令会在项目中生成一个新的目录，其中包含：

- 原生代码目录（`android/` 和 `ios/`）
- TypeScript 源文件
- 模块配置文件（`expo-module.config.json`）

**如果项目中尚未生成原生目录（`android/` 或 `ios/`）**，你需要运行 prebuild 命令来生成它们：

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

> **注意：** 如果你的项目根目录下已经存在通过 `npx expo prebuild` 生成的 `ios` 目录，你需要重新安装 CocoaPods 依赖：
>
> ```sh
> npx pod-install
> ```

> **基于经验建议：** `--clean` 参数会清除已有的原生目录后重新生成。如果你的原生目录有手动修改过的代码，请谨慎使用 `--clean`，否则手动修改会被覆盖。建议先做好版本控制（git commit）再执行。

---

### 第二步：在应用中使用本地模块

模块创建完成后，在你的应用入口文件中导入并使用它：

```tsx
import MyModule from '@/modules/my-module';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>{MyModule.hello()}</Text>
    </View>
  );
}
```

> **关键术语解释：**
>
> - `@/modules/my-module`：这是一个使用路径别名（path alias）的导入方式，`@/` 通常映射到项目的 `src/` 或根目录。这种写法比相对路径（如 `../../modules/my-module`）更简洁。
> - `MyModule.hello()`：调用原生模块暴露给 JavaScript 的 `hello` 方法。该方法在原生端（Kotlin/Swift）定义，通过 Expo Modules API 桥接到 JS 端。

启动开发服务器，原生代码的修改会即时反映到应用中：

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

> **提示：** 你也可以使用绝对路径导入模块，具体配置方法请参阅 [Expo 绝对路径配置指南](https://expo.fyi/absolute-path-expo-modules.md)。

---

### 第三步：编辑模块的原生代码

使用对应平台的 IDE（Android Studio / Xcode）来编辑和测试本地模块的原生代码。

#### Android 平台

1. 在 **Android Studio** 中打开项目根目录下的 `android` 目录（该目录由第一步中的 `npx expo prebuild` 生成）。Gradle 同步原生项目可能需要一些时间，请耐心等待。
2. 项目同步完成后，打开以下文件：
   ```
   modules/my-module/android/src/main/java/expo/modules/mymodule/MyModule.kt
   ```
3. 修改 `hello` 函数的返回值，例如改为 `"Hello world! 🌎🤖"`，然后保存文件。
4. 点击顶部菜单栏的 **Run 'app'** 按钮来构建并运行应用，你将看到屏幕上的变化。

> **注意：** 每次修改原生代码后，都必须重新构建（rebuild）应用才能看到变化。这与 JavaScript 代码的热重载（Hot Reload）不同。

#### iOS 平台

1. 通过运行以下命令在 **Xcode** 中打开项目的 `ios` 目录：
   ```sh
   xed ios
   ```
2. 在 Xcode 的项目导航器中，依次展开 **Pods** > **Development Pods** > **MyModule**，打开 `MyModule.swift` 文件。
3. 修改 `hello` 函数的返回值，例如改为 `"Hello world! 🌎🍎"`，然后保存文件。
4. 点击顶部菜单栏的 **Run** 按钮，或按 `⌘ Cmd + R` 快捷键来构建并运行应用，你将看到屏幕上的变化。

> **注意：** 每次修改原生代码后，都必须重新构建应用才能看到变化。

> **提示：** 如果你在模块中添加了新的原生文件，或修改了 `expo-module.config.json` 配置文件，需要使用以下命令重新安装 Pods：
>
> ```sh
> npx pod-install
> ```

> **注意：** Expo 还支持其他方式来并行开发模块和应用，例如使用 monorepo（单一代码仓库）或将模块发布到 npm。更多详情请参阅 [如何使用独立的 Expo 模块](https://docs.expo.dev/modules/use-standalone-expo-module-in-your-project/) 指南。

> **基于经验建议：** iOS 开发中，`xed ios` 是最快捷的打开 Xcode 工作区的方式。如果你手动打开 Xcode，请确保打开的是 `.xcworkspace` 文件而非 `.xcodeproj` 文件，否则 Pods 依赖将无法正确加载。

---

## 方式二：创建带有示例项目的新模块

这种方式会创建一个独立的模块包，并自动生成一个配套的示例应用（example app），适合开发可复用或可发布的模块。

### 第一步：创建 Expo 模块

执行创建脚本（不加 `--local` 标志），生成一个独立的模块及附带的示例项目：

```sh
# npm
npx create-expo-module@latest my-module

# yarn
yarn create expo-module my-module

# pnpm
pnpm create expo-module my-module

# bun
bun create expo-module my-module
```

> **关键术语解释：**
>
> - 不带 `--local` 标志时，脚手架会创建一个完整的独立包，包含自身的 `package.json`、示例项目（`example/` 目录）以及完整的原生代码结构。
> - `my-module`：模块名称，也是生成的目录名称。你可以替换为任意合法的包名。

> **基于文档内容推导：** `--local` 与不带 `--local` 的核心区别在于：前者将模块嵌入到现有项目中作为本地依赖；后者创建一个可以独立存在、独立版本管理、可发布到 npm 的完整包。

---

### 第二步：打开模块并启动开发服务器

进入新创建的模块目录，使用预置的脚本打开对应平台的 IDE：

```sh
# npm
cd my-module
npm run open:android
npm run open:ios

# yarn
cd my-module
yarn run open:android
yarn run open:ios

# pnpm
cd my-module
pnpm run open:android
pnpm run open:ios

# bun
cd my-module
bun run open:android
bun run open:ios
```

> **关键术语解释：**
>
> - `open:android`：在 Android Studio 中打开模块的 Android 原生项目。
> - `open:ios`：在 Xcode 中打开模块的 iOS 原生项目。

然后进入示例项目目录，启动开发服务器：

```sh
# npm
cd example
npx expo start

# yarn
cd example
yarn expo start

# pnpm
cd example
pnpm expo start

# bun
cd example
bun expo start
```

> **注意（Windows 用户）：** 如果你使用的是 Windows 系统，你可以在 Android Studio 中打开 `android` 目录来开发 Android 部分，但**无法打开 iOS 项目文件**（iOS 开发需要 macOS 和 Xcode）。

---

### 第三步：编辑模块的原生代码

#### Android 平台

1. 打开以下 Kotlin 文件：
   ```
   my-module/android/src/main/java/expo/modules/mymodule/MyModule.kt
   ```
2. 修改 `hello` 函数的返回值，例如改为 `"Hello world! 🌎🤖"`，然后保存文件。
3. 点击顶部菜单栏的 **Run 'app'** 按钮来构建并运行示例应用，你将看到屏幕上的变化。

> **注意：** 每次修改原生代码后，都必须重新构建应用。

#### iOS 平台

1. 在 Xcode 中，依次展开 **Pods** > **Development Pods** > **MyModule**，打开 `MyModule.swift` 文件。
2. 修改 `hello` 函数的返回值，例如改为 `"Hello world! 🌎🍎"`，然后保存文件。
3. 点击顶部菜单栏的 **Run** 按钮，或按 `⌘ Cmd + R` 快捷键来构建并运行示例应用，你将看到屏幕上的变化。

> **注意：** 每次修改原生代码后，都必须重新构建应用。

> **提示：** 如果你在模块中添加了新的原生文件，或修改了 `expo-module.config.json` 配置文件，需要使用以下命令重新安装 Pods：
>
> ```sh
> npx pod-install
> ```

> **基于经验建议：** 独立模块的开发流程比本地模块多了一层间接性——你需要同时在模块代码和示例项目之间切换。建议在开发初期就在示例项目中编写全面的测试用例，这样每次修改模块代码后都能快速验证功能是否正常。

---

## 下一步

完成模块的初始化和基本修改后，你可以：

- **进入实战教程**：学习如何构建一个能够持久化存储用户设置（preferences）的原生模块。请参阅 [Native Module Tutorial](./100__native-module-tutorial.md)。
- **查阅 API 参考文档**：深入了解 Expo Modules API 在 Swift 和 Kotlin 中的完整实现细节。

> **基于文档内容推导：** Expo Modules API 的设计思路是让开发者能够以最小化的配置成本，快速搭建跨平台原生模块。无论是本地开发还是独立发布，Expo 都提供了标准化的脚手架和工具链来简化流程。掌握这两种工作流后，你将具备开发任意复杂度的原生模块的基础能力。

---

## 文档导航

- **上一页**：[overview](./98__overview.md)
- **下一页**：[native module tutorial](./100__native-module-tutorial.md)
