# 在已有的 React Native 项目中安装 Expo 模块

> 原始文档地址：https://docs.expo.dev/bare/installing-expo-modules/
>
> 文档版本：Expo SDK 56（React Native 0.85）

---

## 简介

要在你的应用中使用 Expo 模块（Expo modules），你需要安装并配置 `expo` 核心包。

> **新手须知**
>
> - **Expo 模块（Expo modules）**：Expo SDK 提供的各种功能库的统称。每个模块封装了特定的原生功能（如文件系统访问、字体加载、设备常量获取等），并以 JavaScript/TypeScript 接口的形式供你在代码中调用。例如 `expo-camera` 提供相机功能，`expo-file-system` 提供文件读写功能。
> - **`expo` 核心包**：这是 Expo 模块体系的基础包，体积很小。它只包含几乎所有应用都需要的最小依赖集，以及模块自动链接（autolinking）基础设施。安装好这个包后，你就可以按需添加其他任何 Expo SDK 模块。
> - **自动链接（autolinking）**：React Native 和 Expo 的一种机制，能自动检测项目中安装的含有原生代码的库，并在构建时自动将它们链接到原生工程中，无需你手动编辑原生项目配置文件。
> - **React Native**：一个使用 JavaScript/TypeScript 构建原生移动应用的开源框架，由 Meta（原 Facebook）开发。Expo 是建立在 React Native 之上的增强框架。

`expo` 核心包的体积非常小（small footprint）——它仅包含几乎所有应用中都需要的一组最小依赖包，以及模块和自动链接基础设施，其他 Expo SDK 包正是基于此构建的。一旦 `expo` 包在你的项目中安装并配置完成，你就可以使用 `npx expo install` 命令来添加 SDK 中的任何其他 Expo 模块。

根据你初始化项目的方式不同，安装 Expo 模块有两种方法：**自动安装**（automatic installation）和**手动安装**（manual installation）。

---

## 一、自动安装（Automatic installation）

要安装和使用 Expo 模块，最简单的方式是运行 `install-expo-modules` 命令：

```sh
# 自动安装并配置 expo 包
npx install-expo-modules@latest
```

> **新手须知**
>
> - **`npx`**：Node.js 自带的一个包运行工具，它可以直接运行 npm 包中的命令行程序，而无需全局安装。`npx install-expo-modules@latest` 的意思是"运行最新版本的 `install-expo-modules` 这个工具"。
> - **`@latest`**：npm 的版本标签，表示始终使用最新发布版本。

### 安装结果判断

- **命令执行成功时**：你就可以在应用中添加任何 Expo 模块了！请直接跳到下方的[使用（Usage）](#五使用usage)章节了解更多信息。

- **命令执行失败时**：你需要按照下方的手动安装步骤进行操作。通过程序化方式更新代码可能会很棘手——如果你的项目与默认的 React Native 项目有显著差异（例如你曾大量自定义过原生配置文件），那么自动脚本可能无法正确识别和修改你的代码，此时需要手动安装并根据你的代码库实际情况调整操作步骤。

> **基于经验建议**
>
> 自动安装脚本对标准的、刚创建不久的 React Native 项目效果最好。如果你的项目经过了大量定制（比如修改了 Gradle 构建脚本、自定义了 Podfile、或者使用了非标准的目录结构），建议先尝试自动安装，如果失败再参照手动安装步骤逐步操作。在执行自动安装之前，最好先用 Git 提交当前代码，以便在自动脚本产生意外修改时能够方便回滚。

---

## 二、手动安装（Manual installation）

以下安装步骤适用于 **React Native 0.85** 版本中安装最新版本的 Expo 模块。如果你使用的是更早的 React Native 版本，请查阅 [native upgrade helper（原生升级助手）](https://docs.expo.dev/bare/upgrade) 来查看这些文件应如何自定义。

> **新手须知**
>
> - **native upgrade helper（原生升级助手）**：Expo 提供的一个在线工具，可以展示不同 React Native 版本之间原生代码文件的差异（diff），帮助你了解在特定版本中需要做哪些原生配置变更。

首先，安装 `expo` 包：

```sh
npm install expo
```

安装完成后，按照以下 diff（差异对比）中的改动来配置你项目中的 Expo 模块。整个过程预计大约需要 **五分钟**，具体耗时取决于你项目的自定义程度，你可能需要做一些微调。

> **新手须知**
>
> - **diff（差异对比）**：一种展示代码变更的方式。以 `-` 开头的行表示**删除**的内容，以 `+` 开头的行表示**新增**的内容。没有前缀的行是上下文，帮助你定位改动的位置。

---

### 2.1 Android 配置

以下是对 Android 项目中各文件的修改。请逐一对照并应用这些变更。

> **新手须知**
>
> - **`MainActivity.kt`**：Android 应用的主 Activity 文件（类似于 iOS 的 ViewController），负责管理应用的界面和生命周期。`.kt` 表示使用 Kotlin 语言。
> - **`MainApplication.kt`**：Android 应用的 Application 类，是整个应用的入口点，负责初始化全局配置。
> - **`settings.gradle`**：Gradle 构建系统的项目设置文件，用于配置插件、引入依赖模块等。
> - **`build.gradle`**：Gradle 构建脚本，定义了项目的编译配置、依赖关系等。
> - **Gradle**：Android 使用的构建自动化工具，类似于 iOS 的 Xcode 构建系统。

#### 文件 1：`android/app/src/main/java/com/myapp/MainActivity.kt`

```diff
 package com.myapp
+import expo.modules.ReactActivityDelegateWrapper

 import com.facebook.react.ReactActivity
 import com.facebook.react.ReactActivityDelegate
@@ -18,5 +19,5 @@ class MainActivity : ReactActivity() {
    * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
    */
   override fun createReactActivityDelegate(): ReactActivityDelegate =
-      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
+      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))
 }
```

**变更说明**：将默认的 `DefaultReactActivityDelegate` 包装在 Expo 的 `ReactActivityDelegateWrapper` 中。这个包装器使 Expo 模块能够介入 Activity 的生命周期管理。

> **新手须知**
>
> - **ReactActivityDelegate**：React Native 中负责管理 Activity 与 React Native 运行时之间交互的委托类。
> - **New Architecture（新架构）**：React Native 的新一代架构，使用 Fabric 渲染器和 TurboModules 来提升性能。`BuildConfig.IS_NEW_ARCHITECTURE_ENABLED` 是一个编译时常量，用于判断是否启用了新架构。

#### 文件 2：`android/app/src/main/java/com/myapp/MainApplication.kt`

```diff
 package com.myapp
+import android.content.res.Configuration
+import expo.modules.ApplicationLifecycleDispatcher
+import expo.modules.ExpoReactHostFactory

 import android.app.Application
 import com.facebook.react.PackageList
@@ -10,7 +13,7 @@ import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
 class MainApplication : Application(), ReactApplication {

   override val reactHost: ReactHost by lazy {
-    getDefaultReactHost(
+    ExpoReactHostFactory.getDefaultReactHost(
       context = applicationContext,
       packageList =
         PackageList(this).packages.apply {
@@ -23,5 +26,11 @@ class MainApplication : Application(), ReactApplication {
   override fun onCreate() {
     super.onCreate()
     loadReactNative(this)
+    ApplicationLifecycleDispatcher.onApplicationCreate(this)
+  }
+
+  override fun onConfigurationChanged(newConfig: Configuration) {
+    super.onConfigurationChanged(newConfig)
+    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
   }
 }
```

**变更说明**：
1. 将 `getDefaultReactHost` 替换为 `ExpoReactHostFactory.getDefaultReactHost`，使 Expo 模块能注册到 React Host 中。
2. 在 `onCreate()` 中添加 `ApplicationLifecycleDispatcher.onApplicationCreate(this)`，让 Expo 模块感知应用的创建事件。
3. 新增 `onConfigurationChanged()` 方法，让 Expo 模块感知设备配置变更（如屏幕旋转、语言切换等）。

#### 文件 3：`android/settings.gradle`

```diff
-pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
-plugins { id("com.facebook.react.settings") }
-extensions.configure(com.facebook.react.ReactSettingsExtension){ ex -> ex.autolinkLibrariesFromCommand() }
+pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin")
+  def expoPluginsPath = new File(
+    providers.exec {
+      workingDir(rootDir)
+      commandLine("node", "--print", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })")
+    }.standardOutput.asText.get().trim(),
+    "../android/expo-gradle-plugin"
+  ).absolutePath
+  includeBuild(expoPluginsPath)
+}
+plugins { id("com.facebook.react.settings")
+id("expo-autolinking-settings")
+}
+extensions.configure(com.facebook.react.ReactSettingsExtension){ ex -> ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand) }
 rootProject.name = 'myapp'
 include ':app'
 includeBuild('../node_modules/@react-native/gradle-plugin')
+expoAutolinking.useExpoModules()
+expoAutolinking.useExpoVersionCatalog()
+includeBuild(expoAutolinking.reactNativeGradlePlugin)
```

**变更说明**：
1. 在 `pluginManagement` 中引入 Expo 的 Gradle 插件路径。
2. 添加 `expo-autolinking-settings` 插件。
3. 将自动链接命令改为使用 `expoAutolinking.rnConfigCommand`。
4. 在文件末尾调用 `expoAutolinking.useExpoModules()` 启用 Expo 模块，`expoAutolinking.useExpoVersionCatalog()` 使用 Expo 的版本目录，以及引入 React Native 的 Gradle 插件。

#### 文件 4：`android/build.gradle`

```diff
 apply plugin: "com.facebook.react.rootproject"
+apply plugin: "expo-root-project"
```

**变更说明**：在根项目级别应用 `expo-root-project` 插件，为整个 Android 项目启用 Expo 模块支持。

---

### 2.2 iOS 配置

以下是对 iOS 项目中各文件的修改。

> **新手须知**
>
> - **Podfile**：iOS 项目中使用 CocoaPods（iOS 的依赖管理工具）管理原生依赖的配置文件，类似于 Android 的 `build.gradle`。
> - **AppDelegate.swift**：iOS 应用的委托类，是整个 iOS 应用的入口点，负责管理应用的生命周期事件。
> - **CocoaPods**：iOS/macOS 项目的依赖管理器，通过 `pod install` 命令来安装和管理原生库依赖。

#### 文件 1：`ios/Podfile`

```diff
+require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
 # Resolve react_native_pods.rb with node to allow for hoisting
 require Pod::Executable.execute_command('node', ['-p',
   'require.resolve(
@@ -5,7 +6,7 @@ require Pod::Executable.execute_command('node', ['-p',
     {paths: [process.argv[1]]},
   )', __dir__]).strip

-platform :ios, min_ios_version_supported
+platform :ios, '16.4'
 prepare_react_native_project!

 linkage = ENV['USE_FRAMEWORKS']
@@ -15,7 +16,24 @@ if linkage != nil
 end

 target 'myapp' do
-  config = use_native_modules!
+  use_expo_modules!
+
+  if ENV['EXPO_USE_COMMUNITY_AUTOLINKING'] == '1'
+    config_command = ['node', '-e', "process.argv=['', '', 'config'];require('@react-native-community/cli').run()"];
+  else
+    config_command = [
+      'node',
+      '--no-warnings',
+      '--eval',
+      'require(require.resolve(\'expo-modules-autolinking\', { paths: [require.resolve(\'expo/package.json\')] }))(process.argv.slice(1))',
+      'react-native-config',
+      '--json',
+      '--platform',
+      'ios'
+    ]
+  end
+
+  config = use_native_modules!(config_command)

   use_react_native!(
     :path => config[:reactNativePath],
```

**变更说明**：
1. 在文件顶部引入 Expo 的自动链接脚本。
2. 将 iOS 最低部署版本从 `min_ios_version_supported`（由 React Native 定义的变量）改为固定的 `'16.4'`。
3. 添加 `use_expo_modules!` 指令来启用 Expo 模块的自动链接。
4. 配置自动链接命令，使用 Expo 的 `expo-modules-autolinking` 来获取原生模块配置（同时保留社区自动链接的回退选项）。

#### 文件 2：`ios/myapp/AppDelegate.swift`

```diff
 import UIKit
+internal import Expo
 import React
 import React_RCTAppDelegate
 import ReactAppDependencyProvider

 @main
-class AppDelegate: UIResponder, UIApplicationDelegate {
+class AppDelegate: ExpoAppDelegate {
   var window: UIWindow?

   var reactNativeDelegate: ReactNativeDelegate?
   var reactNativeFactory: RCTReactNativeFactory?

-  func application(
+  override func application(
     _ application: UIApplication,
     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
   ) -> Bool {
     let delegate = ReactNativeDelegate()
-    let factory = RCTReactNativeFactory(delegate: delegate)
+    let factory = ExpoReactNativeFactory(delegate: delegate)
     delegate.dependencyProvider = RCTAppDependencyProvider()

     reactNativeDelegate = delegate
@@ -29,13 +30,14 @@ class AppDelegate: UIResponder, UIApplicationDelegate {
       launchOptions: launchOptions
     )

-    return true
+    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
   }
 }

-class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
+class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
   override func sourceURL(for bridge: RCTBridge) -> URL? {
-    self.bundleURL()
+    // needed to return the correct URL for expo-dev-client.
+    bridge.bundleURL ?? bundleURL()
   }

   override func bundleURL() -> URL? {
```

**变更说明**：
1. 导入 `Expo` 模块。
2. 将 `AppDelegate` 的父类从 `UIResponder, UIApplicationDelegate` 改为 `ExpoAppDelegate`。
3. 将 `RCTReactNativeFactory` 替换为 `ExpoReactNativeFactory`。
4. 将 `application` 方法标记为 `override`，并在末尾调用 `super.application(...)` 以确保 Expo 的生命周期处理能被执行。
5. 将 `ReactNativeDelegate` 的父类从 `RCTDefaultReactNativeFactoryDelegate` 改为 `ExpoReactNativeFactoryDelegate`。
6. 在 `sourceURL(for:)` 方法中优先使用 `bridge.bundleURL`，这是 `expo-dev-client`（Expo 开发客户端）正常工作的必要条件。

#### （可选）添加额外的委托方法

你还可以选择性地在 **AppDelegate.swift** 中添加额外的委托方法。某些 Expo 库可能需要这些方法才能正常工作，因此除非你有充分的理由不加，否则建议添加。

> **基于经验建议**
>
> 即使当前不直接使用某些功能（如深度链接 Deep Linking、Universal Links 等），也建议提前添加这些委托方法，以免日后添加新模块时遗忘而导致功能异常。以下是推荐的额外委托方法（来自 Expo 的 bare-minimum 模板）：

```swift
  // Linking API（处理 URL Scheme 回调，如第三方登录）
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links（处理通用链接）
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
```

参考完整代码：[AppDelegate.swift（Expo bare-minimum 模板）](https://github.com/expo/expo/blob/sdk-54/templates/expo-template-bare-minimum/ios/HelloWorld/AppDelegate.swift#L24-L42)

#### 更新 iOS 部署目标

保存所有更改后，在 Xcode 中将 iOS 部署目标（Deployment Target）更新为 `iOS 16.4`：

1. 在 Xcode 中打开 **你的项目名.xcworkspace** 文件，在左侧边栏中选择你的项目。
2. 选择 **Targets** > **你的项目名** > **Build Settings** > **iOS Deployment Target**，确保设置为 `iOS 16.4`。

> **新手须知**
>
> - **Deployment Target（部署目标）**：你的应用能够运行的最低 iOS 版本。设置为 16.4 意味着你的应用将无法在 iOS 16.4 以下的设备上运行。
> - **`.xcworkspace` vs `.xcodeproj`**：当项目使用 CocoaPods 时，必须打开 `.xcworkspace` 文件（而非 `.xcodeproj`），因为 workspace 文件同时包含了你的项目代码和 CocoaPods 管理的依赖代码。

#### 安装 CocoaPods

最后一步是重新安装项目的 CocoaPods，以便引入 `use_expo_modules!` 指令所检测到的 Expo 模块：

```sh
# 安装 pods
npx pod-install

# 或者，run 命令也会自动帮你安装 pods
npx expo run:ios
```

> **新手须知**
>
> - **`npx pod-install`**：一个便捷命令，它会自动进入 `ios` 目录并执行 `pod install`，安装所有原生依赖。
> - **`npx expo run:ios`**：Expo CLI 提供的命令，用于编译和运行 iOS 项目。它会自动处理 pods 安装。

---

### 2.3 配置 Expo CLI 进行 JavaScript 打包（Android 和 iOS）

> **新手须知**
>
> - **打包（Bundling）**：将你的 JavaScript 代码和静态资源（图片、字体等）合并、转换并编译成可在设备上运行的格式的过程。在 React Native 中，这通常由 Metro（React Native 默认的 JavaScript 打包工具）完成。
> - **Expo CLI**：Expo 提供的命令行工具集，它扩展了 Metro 的功能，增加了对 `package.json` 中 `"main"` 字段的支持（用于 Expo Router），以及更好的资源处理能力。
> - **Expo Router**：Expo 官方提供的基于文件系统的路由库，用于管理应用的页面导航。

我们推荐使用 Expo CLI 及其相关工具配置来打包你的应用 JavaScript 代码和资源。这样可以支持在 **package.json** 中使用 `"main"` 字段来配合 [Expo Router](https://docs.expo.dev/router/introduction/) 库。如果不使用 Expo CLI 进行打包，可能会导致意外行为。更多关于 Expo CLI 的信息，请参阅 [使用 Expo CLI](https://docs.expo.dev/bare/using-expo-cli/)。

#### 2.3.1 在 `babel.config.js` 中使用 `babel-preset-expo`

> **新手须知**
>
> - **Babel**：一个 JavaScript 编译器/转译器，负责将使用了新语法特性的代码转换为向后兼容的版本。在 React Native 中，Babel 用于在代码运行前进行编译。
> - **Preset（预设）**：Babel 中一组预先配置好的插件集合。`babel-preset-expo` 是 Expo 提供的预设，包含了 Expo 和 React Native 所需的所有 Babel 插件。

```diff
 module.exports = {
-  presets: ['module:@react-native/babel-preset'],
+  presets: ['babel-preset-expo'],
 };
```

**变更说明**：将 Babel 预设从 React Native 默认的 `@react-native/babel-preset` 切换为 Expo 的 `babel-preset-expo`。Expo 的预设在 React Native 预设的基础上增加了额外的转换和插件支持。

#### 2.3.2 在 `metro.config.js` 中扩展 `expo/metro-config`

> **新手须知**
>
> - **Metro**：React Native 官方的 JavaScript 打包工具（bundler）。它负责将你的所有 JavaScript 文件打包成单个 bundle，并处理资源文件。`metro.config.js` 是 Metro 的配置文件。

```diff
-const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
+const { getDefaultConfig } = require('expo/metro-config');
+const { mergeConfig } = require('@react-native/metro-config');

 /**
  * Metro configuration
```

**变更说明**：将默认配置的来源从 `@react-native/metro-config` 改为 `expo/metro-config`，以获得 Expo 特有的打包配置（如支持 `package.json` 中的 `"main"` 字段）。`mergeConfig` 仍然从 `@react-native/metro-config` 导入。

#### 2.3.3 配置 Android 项目使用 Expo CLI 打包

> **新手须知**
>
> - **`android/app/build.gradle`**：Android 应用模块级别的 Gradle 构建文件，定义了应用的编译配置、签名信息、依赖关系等。

```diff
     /* Autolinking */
     autolinkLibrariesWithApp()
+    //
+    // Added by install-expo-modules
+    entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", rootDir.getAbsoluteFile().getParentFile().getAbsolutePath(), "android", "absolute"].execute(null, rootDir).text.trim())
+    cliFile = new File(["node", "--print", "require.resolve('@expo/cli')"].execute(null, rootDir).text.trim())
+    bundleCommand = "export:embed"
 }
```

**变更说明**：在 `react {}` 配置块中添加三个属性：
- `entryFile`：使用 Expo 的入口解析脚本来确定 JavaScript 入口文件路径。
- `cliFile`：指定 Expo CLI 的路径。
- `bundleCommand`：使用 `export:embed` 作为打包命令（替代默认的 `bundle` 命令）。

#### 2.3.4 配置 iOS 项目使用 Expo CLI 打包

替换 Xcode 中 **Build Phases** > **Bundle React Native code and images** 下的 shell 脚本为以下内容：

> **新手须知**
>
> - **Build Phases（构建阶段）**：Xcode 项目设置中的一个选项卡，定义了构建过程中依次执行的各个步骤。"Bundle React Native code and images" 是负责打包 JavaScript 代码和资源的阶段。
> - **Shell script（Shell 脚本）**：在 Unix/Linux/macOS 系统上运行的命令行脚本。Xcode 允许在构建阶段中嵌入自定义 shell 脚本。

```sh
if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# The project root by default is one level up from the ios directory
export PROJECT_ROOT="$PROJECT_DIR"/..

if [[ "$CONFIGURATION" = *Debug* ]]; then
  export SKIP_BUNDLING=1
fi
if [[ -z "$ENTRY_FILE" ]]; then
  # Set the entry JS file using the bundler's entry resolution.
  export ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios relative | tail -n 1)"
fi

if [[ -z "$CLI_PATH" ]]; then
  # Use Expo CLI
  export CLI_PATH="$("$NODE_BINARY" --print "require.resolve('@expo/cli')")"
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  # Default Expo CLI command for bundling
  export BUNDLE_COMMAND="export:embed"
fi

`"$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"`
```

**变更说明**：
- 首先加载 `.xcode.env` 和 `.xcode.env.local` 环境变量文件（如果存在）。
- 设置项目根目录为 `ios` 目录的上一级。
- 在 Debug 模式下跳过打包（`SKIP_BUNDLING=1`），因为开发时使用 Metro 开发服务器。
- 使用 Expo 的入口解析脚本确定 JavaScript 入口文件。
- 使用 Expo CLI 作为打包工具。
- 使用 `export:embed` 作为默认打包命令。

然后，修改 **AppDelegate.swift** 以支持 `package.json` 中的 `"main"` 字段：

```diff
   override func bundleURL() -> URL? {
 #if DEBUG
-    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
+    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
 #else
     Bundle.main.url(forResource: "main", withExtension: "jsbundle")
 #endif
   }
```

**变更说明**：将 Metro 开发服务器的入口文件从 `"index"` 改为 `".expo/.virtual-metro-entry"`。这是 Expo 使用的虚拟入口点，它能正确处理 `package.json` 中的 `"main"` 字段解析。

> **基于文档内容推导**
>
> `.expo/.virtual-metro-entry` 是 Expo 在配置过程中自动生成的一个虚拟入口文件。它作为一个中间层，会读取你的 `package.json` 中 `"main"` 字段指定的实际入口文件，从而让 Expo Router 等依赖 `"main"` 字段的库能正常工作。如果你手动改回 `"index"`，Expo Router 的路由功能可能会失效。

---

## 三、安装完成后的配置步骤

在完成上述所有原生代码修改后：

1. **Android**：确保所有 Gradle 文件已保存，然后重新同步 Gradle 项目（在 Android Studio 中点击 "Sync Now" 或在命令行重新构建）。
2. **iOS**：重新运行 `npx pod-install` 以安装新引入的 Expo 原生模块。

---

## 四、验证安装

你可以通过从 `expo-constants` 模块记录一个值来验证安装是否成功。

> **新手须知**
>
> - **`expo-constants`**：一个 Expo 模块，提供关于应用运行环境的各种常量信息，如应用版本号、SDK 版本、设备信息等。

首先安装 `expo-constants`：

```sh
npx expo install expo-constants
```

然后，运行 `npx expo run`，并在你的应用 JavaScript 代码中添加以下内容：

```tsx
import Constants from 'expo-constants';
console.log(Constants.systemFonts);
```

如果安装成功，你应该能在控制台看到系统字体列表的输出。

> **基于经验建议**
>
> 如果运行后没有看到预期的输出，或出现了原生编译错误，常见原因包括：
> - 忘记运行 `npx pod-install`（iOS）
> - iOS 部署目标未设置为 16.4
> - Babel 或 Metro 配置未正确更新
> - Gradle 未重新同步（Android）
>
> 建议逐项检查上述手动安装步骤是否都已正确应用。

---

## 五、使用（Usage）

### 5.1 使用 Expo SDK 包

一旦 `expo` 包在你的项目中安装并配置完成，你就可以使用 `npx expo install` 来添加 SDK 中的任何其他 Expo 模块。更多信息请参阅[使用库（Using Libraries）](https://docs.expo.dev/workflow/using-libraries)。

```sh
# 示例：安装 expo-camera 模块
npx expo install expo-camera

# 示例：安装 expo-location 模块
npx expo install expo-location
```

> **新手须知**
>
> - **`npx expo install`**：Expo CLI 提供的安装命令。与直接使用 `npm install` 相比，它会自动选择与当前 Expo SDK 版本兼容的包版本，避免因版本不匹配导致的原生代码不兼容问题。

### 5.2 `expo` 核心包自动包含的模块

以下 Expo 模块作为 `expo` 包的依赖项被自动引入：

| 模块 | 说明 |
|------|------|
| **[`expo-asset`](https://docs.expo.dev/versions/latest/sdk/asset)** | 一个纯 JavaScript 包，构建在 `expo-file-system` 之上，为所有 Expo 模块提供通用的资源（assets）管理基础。 |
| **[`expo-constants`](https://docs.expo.dev/versions/latest/sdk/constants)** | 提供对应用清单（manifest）的访问，包含应用版本号、SDK 版本等常量信息。 |
| **[`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem)** | 与设备文件系统交互。被 `expo-asset` 和许多其他 Expo 模块使用。开发者在应用代码中也经常直接使用。 |
| **[`expo-font`](https://docs.expo.dev/versions/latest/sdk/font)** | 在运行时加载字体。此模块是可选的，可以安全移除。但如果你使用 `expo-dev-client` 进行开发，或者使用 `@expo/vector-icons`（Expo 的矢量图标库），则必须保留此模块。 |
| **[`expo-keep-awake`](https://docs.expo.dev/versions/latest/sdk/keep-awake)** | 在开发过程中防止设备进入休眠状态。此模块是可选的，可以安全移除。 |

> **基于经验建议**
>
> - `expo-file-system` 和 `expo-constants` 几乎被所有 Expo 模块间接依赖，**不建议**排除它们。
> - `expo-asset` 如果你的应用不使用任何静态资源（图片、音视频等），可以考虑排除，但实际上很少有应用不需要它。
> - `expo-font` 只有在确认不使用自定义字体和矢量图标时才可安全移除。
> - `expo-keep-awake` 是最常被排除的模块，因为它只在开发时有用。

### 5.3 从自动链接中排除特定模块

如果你需要排除那些你未使用、但被其他依赖项间接安装的 Expo 模块的原生代码，可以在 **package.json** 中使用 `expo.autolinking.exclude` 属性：

```json
{
  "name": "...",
  "dependencies": {},
  "expo": {
    "autolinking": {
      "exclude": ["expo-keep-awake"]
    }
  }
}
```

> **新手须知**
>
> - **排除自动链接（exclude from autolinking）**：即使一个 npm 包已安装在你的 `node_modules` 中，通过此配置可以阻止它的原生代码被编译进你的应用。这有助于减小应用体积，并确保不会引入你不需要的原生权限请求。

> **基于经验建议**
>
> 排除模块后，需要重新执行以下步骤才能使更改生效：
> - **iOS**：重新运行 `npx pod-install`
> - **Android**：重新同步 Gradle 项目（clean build）
>
> 如果排除某个模块后应用出现崩溃或异常，说明有其他模块在内部依赖了它，此时应将该模块从排除列表中移除。

---

## 六、常见问题与注意事项

> **基于文档内容推导**

1. **React Native 版本兼容性**：本文档的步骤专门针对 React Native 0.85。如果你使用更早的版本，请参考 [native upgrade helper](https://docs.expo.dev/bare/upgrade) 获取对应版本的配置差异。Expo 模块与 React Native 版本紧密关联，使用不匹配的版本可能导致编译失败。

2. **自动安装 vs 手动安装的选择**：对于全新的或改动较少的 React Native 项目，优先使用自动安装。自动脚本本质上就是帮你执行了上述所有手动 diff 中的修改。

3. **Expo CLI 打包配置的重要性**：文档明确建议使用 Expo CLI 进行打包。不遵守此建议可能导致 Expo Router 无法正确解析路由、静态资源加载失败等问题。

4. **iOS 16.4 最低版本要求**：Expo 模块要求 iOS 最低部署版本为 16.4。如果你的应用需要支持更老的 iOS 版本，需要评估这一限制是否可接受。

---

## 文档导航

- **上一页**：[overview](./32__overview.md)
- **下一页**：[using expo cli](./34__using-expo-cli.md)
