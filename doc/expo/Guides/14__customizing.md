# 添加自定义原生代码

> 原文地址：https://docs.expo.dev/workflow/customizing/

学习如何在你的 Expo 项目中添加自定义原生代码。

你可以通过以下一种或两种方式添加自定义原生代码：

- [使用包含原生代码的第三方库](#使用包含原生代码的第三方库)
- [自行编写原生代码](#自行编写原生代码)

---

## 使用包含原生代码的第三方库

> **关键术语解释**
>
> - **原生代码（Native Code）**：指直接用平台原生语言（iOS 使用 Swift/Objective-C，Android 使用 Kotlin/Java）编写的代码，与 JavaScript 代码相对。原生代码可以直接访问设备硬件和系统功能。
> - **第三方库（Library）**：由社区或官方维护的可复用代码包，通过 npm 安装。一些库（如 `expo-camera`）底层包含原生代码，用于桥接 JavaScript 与设备硬件之间的通信。
> - **配置插件（Config Plugin）**：一种在 Expo 构建过程中自动修改原生项目配置（如 AndroidManifest.xml 或 Info.plist）的机制，无需手动编辑原生文件。

Expo 和 React Native 开发者通常绝大部分时间都在编写 JavaScript 代码，并使用通过库暴露出来的原生 API 和组件，例如 [`expo-camera`](/versions/latest/sdk/camera.md)、[`react-native-safe-area-context`](/versions/latest/sdk/safe-area-context.md) 以及 `react-native` 本身。这些库允许开发者从 JavaScript 代码中访问和使用设备功能。它们还可能提供对第三方服务 SDK 的访问，这些服务 SDK 是用原生代码实现的（例如 [`@sentry/react-native`](/guides/using-sentry.md)，它为 Android 和 iOS 提供了 Sentry 原生 SDK 的绑定）。

### 使用 Expo Go 的注意事项

> **重要提示**
>
> 如果你正在使用 [Expo Go](http://expo.dev/go)，你**只能访问 Expo SDK 中包含的原生库**，或者不包含任何自定义原生代码的库。[创建开发构建（development build）](/develop/development-builds/introduction.md) 可以让你像在任何其他原生应用中一样修改原生代码或配置。

> **关键术语解释**
>
> - **Expo Go**：Expo 官方提供的沙盒客户端应用，内置了一组预编译的 SDK 库。它适合快速原型开发和学习，但无法加载自定义原生代码。
> - **开发构建（Development Build）**：一种自定义的应用构建，包含了你的项目所需的所有原生代码。与 Expo Go 不同，开发构建支持任意原生库。

### 在开发构建中安装包含自定义原生代码的库

当你使用[开发构建](/develop/development-builds/introduction.md)时，使用包含自定义原生代码的库非常简单：

1. **安装库**：使用 npm 安装，例如：`npx expo install react-native-localize`
2. **配置插件**：如果库包含[配置插件（config plugin）](/config-plugins/introduction.md)，你可以在应用配置（app config）中指定你需要的配置项。
3. **创建新的开发构建**：可以在[本地构建](/guides/local-app-development.md)或使用 [EAS](/develop/development-builds/create-a-build.md) 进行云端构建。

完成以上步骤后，你就可以在应用代码中使用该库了。

### 关键概念与开发工作流

[开发概述文档](/workflow/overview.md)提供了使用 Expo 开发应用的关键概念以及核心开发循环的详细说明。

> **基于文档内容推导**
>
> 对于大多数 Expo 项目，优先使用包含原生代码的第三方库是最高效的方式，只有当现有库无法满足需求时，才需要考虑自行编写原生代码。

---

## 自行编写原生代码

> **关键术语解释**
>
> - **Expo Modules API**：Expo 提供的一套用于编写原生模块的框架和 API。它允许你用 Swift（iOS）和 Kotlin（Android）编写代码，并将其暴露给 JavaScript 层调用。
> - **原生模块（Native Module）**：用原生语言编写并通过桥接（Bridge）暴露给 JavaScript 的功能模块。
> - **原生视图（Native View）**：用原生语言编写的 UI 组件，可以在 JavaScript 中像普通 React Native 组件一样使用。

使用 [Expo Modules API](/modules/overview.md) 编写 Swift 和 Kotlin 代码，通过原生模块和视图为你的应用添加新能力。虽然还有其他工具可以用来构建原生模块，但我们相信使用 Expo Modules API 使得构建和维护几乎所有类型的 React Native 模块变得尽可能简单。我们认为 Expo Modules API 是大多数为应用构建原生模块的开发者的最佳选择。

### 何时应该考虑编写原生代码？

遇到现有库无法完全满足需求的情况是很常见的。例如，库可能没有提供对特定平台功能的访问，或者第三方服务可能没有提供 React Native 的绑定。

### 是否考虑主要用 C++ 编写模块？

如果你打算主要使用 C++ 编写原生模块，你可能需要探索 React Native 提供的 [Turbo Modules API](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/turbo-modules.md)。

> **关键术语解释**
>
> - **Turbo Modules**：React Native 新架构中的一部分，旨在替代旧的桥接机制，提供更高效的 JavaScript 与原生代码通信方式。主要用于 C++ 模块开发。

### 使用 Expo Modules API

以下官方资源可以帮助你入门：

- [Expo Modules API：概述](/modules/overview.md) — Expo 为开发原生模块提供的 API 和工具概述。
- [教程：创建原生模块](/modules/native-module-tutorial.md) — 使用 Expo Modules API 创建一个持久化设置的原生模块教程。
- [教程：创建原生视图](/modules/native-view-tutorial.md) — 使用 Expo Modules API 创建一个渲染原生 WebView 组件的原生视图教程。

### 创建本地模块（Local Module）

如果你打算在单个应用中使用你的原生模块（你随时可以改变主意），我们推荐[使用"本地" Expo 模块](/modules/get-started.md#creating-the-local-expo-module)来编写自定义原生代码。本地 Expo 模块的功能与库开发者和 Expo SDK 中使用的 [Expo 模块](/modules/overview.md)类似（如 `expo-camera`），但它们不会发布到 npm 上。相反，你直接在项目内部创建它们。

创建本地模块会在项目中的 `modules` 目录下生成 Swift 和 Kotlin 模块文件，这些模块会自动链接到你的应用。

```sh
# npm
npx create-expo-module@latest --local
npx expo run

# yarn
yarn create expo-module --local
yarn expo run

# pnpm
pnpm create expo-module --local
pnpm expo run

# bun
bun create expo-module --local
bun expo run
```

> **关键术语解释**
>
> - **本地模块（Local Module）**：直接创建在项目内部的 Expo 模块，不会发布到 npm。适合单个应用使用的场景。
> - **`modules` 目录**：项目根目录下的一个文件夹，用于存放本地 Expo 模块的原生代码文件。
> - **`npx expo run`**：在本地编译并运行应用的命令，会自动生成原生目录并构建应用。

### 在多个应用间共享模块

如果你打算在多个应用中使用你的原生模块，则使用 `npx create-expo-module@latest` 时**省略** `--local` 标志，然后[创建一个独立模块](/modules/use-standalone-expo-module-in-your-project.md)。你可以将包发布到 npm，或者将它放在[monorepo](/guides/monorepos.md) 的 packages 目录中（如果有的话），以[类似本地模块的方式使用它](/modules/use-standalone-expo-module-in-your-project.md)。

> **关键术语解释**
>
> - **独立模块（Standalone Module）**：作为一个独立包存在的 Expo 模块，可以发布到 npm 或在多个项目间共享。
> - **Monorepo**：一种代码仓库组织方式，将多个相关项目（包）放在同一个仓库中管理。

---

## 使用持续原生生成（CNG）时的注意事项

以下建议在使用 [CNG（持续原生生成）](/workflow/continuous-native-generation.md) 时最为重要，但即使你不使用 CNG，也是很好的指导原则。

> **关键术语解释**
>
> - **CNG（Continuous Native Generation，持续原生生成）**：Expo 的一种工作流，项目的原生目录（`android` 和 `ios`）不会保存在源代码管理中，而是在每次构建时根据配置自动生成。这样可以避免原生代码手动维护的复杂性。
> - **Prebuild**：Expo 的一个命令（`npx expo prebuild`），用于根据项目配置自动生成或更新原生项目目录（`android/` 和 `ios/`）。

### 本地构建以获得最佳调试体验和快速反馈

默认情况下，使用 `create-expo-app` 创建的 Expo 项目使用 CNG，在你运行 `npx expo prebuild` 命令之前，项目中不会包含 **android** 或 **ios** 原生目录。使用 CNG 时，开发者通常不会将 **android** 和 **ios** 目录提交到版本控制系统中，也不会在本地生成它们，因为 EAS Build 会在构建过程中自动完成。

尽管如此，在编写自定义原生代码时，生成原生目录并使用 `npx expo run` 在本地构建是很常见的做法，这样可以获得更快的反馈循环，并完整使用 Android Studio / Xcode 中的原生调试工具。

> **基于经验建议**
>
> 当你刚开始学习编写原生代码时，强烈建议在本地构建和调试。使用 Android Studio 或 Xcode 的调试器可以让你设置断点、查看原生日志，这对于理解原生代码的执行流程非常有帮助。

### 使用配置插件进行原生项目配置

如果你的原生代码需要对项目配置进行更改，例如修改项目的 **AndroidManifest.xml** 或 **Info.plist**，你应该[通过配置插件来应用这些更改](/modules/config-plugin-and-native-module-tutorial.md)，而不是直接修改 **android** 和 **ios** 目录中的文件。

> **警告**
>
> 请记住，当你使用 CNG 时，直接对原生项目目录所做的修改将在下次运行 prebuild 时**丢失**。

> **关键术语解释**
>
> - **AndroidManifest.xml**：Android 应用的核心配置文件，定义了应用权限、Activity（界面）、服务等信息。
> - **Info.plist**：iOS 应用的核心配置文件，包含应用的元数据、权限声明、URL Scheme 等信息。

### 使用事件订阅器挂钩应用生命周期事件

如果你需要挂钩 Android 生命周期事件或 `AppDelegate` 方法，请使用 Expo Modules 为 [Android](/modules/android-lifecycle-listeners.md) 和 [iOS](/modules/appdelegate-subscribers.md) 提供的 API 来实现，而不是直接修改原生项目目录中的源文件或使用配置插件来添加代码——后者与其他插件的组合性较差。

> **关键术语解释**
>
> - **生命周期事件（Lifecycle Events）**：应用从启动到关闭过程中经历的一系列状态变化（如创建、恢复、暂停、销毁等）。原生代码常常需要在这些事件中执行特定逻辑。
> - **AppDelegate**：iOS 应用的核心委托类，负责处理应用生命周期事件（如启动、进入后台、回到前台等）。
> - **Android 生命周期监听器（Lifecycle Listeners）**：Expo Modules 提供的 API，用于在不修改原生源文件的情况下监听 Android Activity 的生命周期事件。

> **基于文档内容推导**
>
> 在使用 CNG 工作流时，遵守以上三条原则至关重要：本地构建调试、通过配置插件管理配置、使用事件订阅器处理生命周期。违反这些原则将导致手动修改在 prebuild 时被覆盖，或引发插件之间的冲突问题。

---

## 文档导航

- **上一页**：[ios universal links](./13__ios-universal-links.md)
- **下一页**：[adopting prebuild](./15__adopting-prebuild.md)
