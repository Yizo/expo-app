# 集成方式（Integrated Approach）

> 原文地址：https://docs.expo.dev/brownfield/integrated-approach/

## 什么是集成方式？

**集成方式**（Integrated Approach）是一种将 Expo/React Native 逐步引入已有原生应用（即"棕地应用"，Brownfield App）的策略。

**关键术语解释：**

- **棕地应用（Brownfield App）**：指已经存在并正在运行的原生 Android/iOS 应用，与之对应的是"绿地应用（Greenfield App）"——从零开始构建的全新应用。
- **集成方式 vs. 隔离方式**：集成方式将 Expo 和 React Native 当作普通的依赖库来使用，直接嵌入到现有项目中；而隔离方式（Isolated Approach）则将 Expo 视为一个黑盒，通过独立的工程来管理。
- **增量采用（Incremental Adoption）**：不需要一次性重写整个应用，而是逐步地将 React Native 功能模块添加到已有的原生应用中，避免高风险的大规模重写。

采用集成方式的核心思路是：**将 Expo/React Native 视为现有项目的标准依赖库**，而非一个独立的黑盒系统。这种方式允许你以最小的风险、渐进式地将 React Native 功能集成到已有的原生应用中。

## 前置要求

在开始之前，请确保你的开发环境满足以下条件：

- **Node.js（LTS 版本）**：JavaScript 运行时，用于运行 Expo CLI 和 Metro 打包工具。请安装长期支持（LTS）版本以获得最佳稳定性。
- **Yarn**：JavaScript 包管理器，用于安装和管理 Node.js 依赖包。
- **Ruby 和 CocoaPods**（仅 iOS 需要）：CocoaPods 是 iOS 项目的依赖管理工具，基于 Ruby 运行。

> **基于经验建议**：建议使用 `nvm`（Node Version Manager）来管理 Node.js 版本，方便在不同项目之间切换 Node.js 版本。CocoaPods 可以通过 `sudo gem install cocoapods` 安装，或使用 Homebrew：`brew install cocoapods`。

## 初始化项目

使用你偏好的包管理器，以 SDK 56 默认模板生成一个 Expo 工作空间：

```sh
# npm
npx create-expo-app@latest my-project --template default@sdk-56

# yarn
yarn create expo-app my-project --template default@sdk-56

# pnpm
pnpm create expo-app my-project --template default@sdk-56

# bun
bun create expo my-project --template default@sdk-56
```

> **术语说明**：`create-expo-app` 是 Expo 提供的项目脚手架工具，它会自动创建包含 Expo 配置和依赖的项目结构。`--template default@sdk-56` 指定使用 SDK 56 版本的默认模板。

## 目录结构配置

### 标准目录布局

在标准的集成布局中，需要将原生代码放置在平台对应的子目录中：

```sh
mkdir my-project/android
mv /path/to/your/android-project my-project/android/

mkdir my-project/ios
mv /path/to/your/ios-project my-project/ios/
```

这样做的好处是让 Expo 项目作为根目录，Android 和 iOS 原生项目分别作为其子目录，便于 Expo CLI 自动发现和管理原生代码。

### 使用 Monorepo 替代方案

如果你的原生项目无法移动（例如它属于另一个仓库或是大型项目的一部分），可以使用 **Monorepo**（单一仓库）结构。在根目录的配置文件中定义工作空间（workspaces）：

```json
{
  "version": "1.0.0",
  "private": true,
  "workspaces": ["my-project"]
}
```

> **术语说明**：Monorepo 是一种将多个相关项目放在同一个代码仓库中的管理方式。`workspaces` 字段告诉包管理器（如 Yarn）哪些子目录是独立的包，需要独立管理依赖。

安装依赖后，Node 模块会被正确链接以供原生构建脚本使用。

> **注意**：如果你使用了自定义的项目根目录（custom root），可能还需要进一步调整构建脚本中的路径配置。

## Android 配置

Android 端的集成涉及构建脚本、清单文件和 Activity 的修改。

### Gradle 配置

> **术语说明**：Gradle 是 Android 项目的构建工具，类似于前端的 npm scripts。`settings.gradle(.kts)` 文件用于配置 Gradle 的项目设置和插件管理。

#### 1. 修改 settings.gradle

更新 `settings.gradle`（或 `settings.gradle.kts`）文件，配置自动链接（autolinking）和插件管理：

```groovy
// 配置 React Native Gradle Settings 插件，用于自动链接
pluginManagement {
  def reactNativeGradlePlugin = new File(
    providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")
    }.standardOutput.asText.get().trim()
  ).getParentFile().absolutePath
  includeBuild(reactNativeGradlePlugin)

  def expoPluginsPath = new File(
    providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })")
    }.standardOutput.asText.get().trim(),
    "../android/expo-gradle-plugin"
  ).absolutePath
  includeBuild(expoPluginsPath)
}

plugins {
  id("com.facebook.react.settings")
  id("expo-autolinking-settings")
}

extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
  ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand)
}
expoAutolinking.useExpoModules()

// rootProject.name = 'HelloWorld'

expoAutolinking.useExpoVersionCatalog()

includeBuild(expoAutolinking.reactNativeGradlePlugin)
// 在此处包含你现有的 Gradle 模块
// include(":app")
```

> **术语说明**：
> - **自动链接（Autolinking）**：Expo 和 React Native 的机制，能自动检测并注册已安装的 JavaScript 库中的原生模块，无需手动配置每个库的原生代码。
> - **`pluginManagement`**：Gradle 的插件管理块，用于声明自定义插件的来源路径。
> - **`includeBuild`**：将一个目录作为复合构建（composite build）包含进来，让 Gradle 可以使用其中的插件和模块。

#### 2. 应用顶层插件

在顶层 `build.gradle`（或 `build.gradle.kts`）文件中应用必要的插件。

#### 3. 调整应用级构建脚本

如果使用自定义目录结构，需要在应用级 `build.gradle` 中调整项目根路径。

#### 4. 启用 Hermes 和新架构

在 `gradle.properties` 文件中启用 Hermes 引擎和新架构（New Architecture）：

```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true
```

> **术语说明**：
> - **Hermes**：Meta 专门为 React Native 开发的 JavaScript 引擎，相比默认的 JSC 引擎，它能显著减少应用体积、降低内存占用并加快启动速度。
> - **New Architecture（新架构）**：React Native 的新一代架构，包含 Fabric（新渲染系统）和 TurboModules（新原生模块系统），能提供更好的性能和更灵活的交互方式。
> - **`reactNativeArchitectures`**：指定应用支持的 CPU 架构，`arm64-v8a` 是大多数现代 Android 设备使用的架构。

### 清单文件更新

在 `AndroidManifest.xml` 中授予网络权限。

> **重要**：在调试（Debug）版本的清单文件中，需要允许未加密的本地网络流量（`android:usesCleartextTraffic="true"`），以便应用能与本地开发服务器（Metro Bundler）通信。

> **基于经验建议**：请确保 `usesCleartextTraffic` 仅在 Debug 构建变体中启用，不要在生产版本中开启此选项，否则会有安全风险。可以通过在 `android/app/src/debug/AndroidManifest.xml` 中单独配置来实现。

### 代码集成

#### 1. 初始化 React Native 运行时

在你的主 Application 类（通常继承自 `android.app.Application`）中初始化 Expo/React Native 运行时。

#### 2. 创建 React Activity

创建一个继承自 `ReactActivity` 的 Activity，用于承载 React Native 界面：

```kotlin
// package <your-package-here>

import android.os.Build

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MyReactActivity : ReactActivity() {

  /**
   * 返回从 JavaScript 注册的主组件名称。
   * 用于调度组件的渲染。
   */
  override fun getMainComponentName(): String = "main"

  /**
   * 返回 [ReactActivityDelegate] 的实例。
   * 使用 [DefaultReactActivityDelegate]，
   * 它允许你通过布尔标志 [fabricEnabled] 来启用新架构。
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }
}
```

> **术语说明**：
> - **Activity**：Android 中的界面单元，类似于一个"页面"或"屏幕"。每个 Activity 管理自己的界面和生命周期。
> - **`ReactActivity`**：React Native 提供的基类 Activity，内置了运行 React Native 应用所需的逻辑。
> - **`ReactActivityDelegate`**：一个代理对象，负责实际管理 React Native 的初始化和渲染。`ReactActivityDelegateWrapper` 是 Expo 提供的包装器，增加了 Expo 模块的支持。
> - **`getMainComponentName()`**：返回你在 JavaScript 端通过 `AppRegistry.registerComponent()` 注册的组件名称，这里 `"main"` 应与 JS 端注册的名称一致。

#### 3. 注册 Activity

在 `AndroidManifest.xml` 中注册这个 Activity，并使用一个不带操作栏（ActionBar）的主题：

> **基于经验建议**：推荐使用 `Theme.AppCompat.Light.NoActionBar` 或自定义的 NoActionBar 主题，避免原生操作栏与 React Native 的导航组件冲突。

## iOS 配置

iOS 端的集成涉及 CocoaPods 配置、Xcode 构建设置和属性列表的修改。

### CocoaPods 配置

> **术语说明**：CocoaPods 是 iOS/macOS 项目的依赖管理工具，类似于 npm。`Podfile` 是它的配置文件，定义了项目需要哪些原生依赖库。

在 `Podfile` 中定义依赖和自动链接脚本：

```rb
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")

require 'json'

platform :ios, '15.1'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

target 'HelloWorld' do
  use_expo_modules!

  config_command = [
    'npx',
    'expo-modules-autolinking',
    'react-native-config',
    '--json',
    '--platform',
    'ios'
  ]
  config = use_native_modules!(config_command)

  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    # 应用根目录的绝对路径
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => true,
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
    )
  end
end
```

> **术语说明**：
> - **`use_expo_modules!`**：Expo 提供的 CocoaPods 方法，自动链接所有已安装的 Expo 模块的原生代码。
> - **`use_native_modules!`**：React Native 的自动链接方法，检测 `node_modules` 中需要原生链接的库并自动配置。
> - **`use_react_native!`**：配置 React Native 核心依赖的方法，包括 Hermes 引擎和隐私清单聚合等选项。
> - **`platform :ios, '15.1'`**：指定最低支持的 iOS 版本。
> - **`deterministic_uuids => false`**：禁用确定性 UUID 生成，避免在大型项目中产生 UUID 冲突。

如果使用自定义目录结构，需要调整 `:app_path` 的值指向正确的应用根目录，然后运行：

```sh
cd ios
pod install
```

### Xcode 构建配置

#### 1. 打开工作空间文件

始终通过 `.xcworkspace` 文件打开项目（而非 `.xcodeproj`），因为 CocoaPods 的依赖需要通过工作空间加载。

#### 2. 禁用用户脚本沙箱

在 Xcode 的 Build Settings（构建设置）中，搜索 `User Script Sandboxing` 并将其设置为 **No**。

> **注意**：如果不禁用此选项，构建过程中的脚本（如自动链接脚本）将因沙箱限制而无法执行，导致构建失败。

#### 3. 添加构建脚本阶段

在 Xcode 的 Build Phases（构建阶段）中，在 Pod 嵌入步骤**之前**添加一个新的 Run Script Phase（运行脚本阶段），用于打包 JavaScript 资源：

```sh
if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# 项目根目录默认是 ios 目录的上一级
export PROJECT_ROOT="$PROJECT_DIR"/..

if [[ "$CONFIGURATION" = *Debug* ]]; then
  export SKIP_BUNDLING=1
fi
if [[ -z "$ENTRY_FILE" ]]; then
  # 使用打包工具的入口解析设置 JS 入口文件
  export ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios absolute | tail -n 1)"
fi

if [[ -z "$CLI_PATH" ]]; then
  # 使用 Expo CLI
  export CLI_PATH="$("$NODE_BINARY" --print "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })")"
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  # 默认的 Expo CLI 打包命令
  export BUNDLE_COMMAND="export:embed"
fi

# 如果存在 .xcode.env.updates，则加载它以允许
# 在需要时取消设置 SKIP_BUNDLING
if [[ -f "$PODS_ROOT/../.xcode.env.updates" ]]; then
  source "$PODS_ROOT/../.xcode.env.updates"
fi
# 加载本地变更以允许覆盖配置
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

`"$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"`
```

> **术语说明**：
> - **Build Phases（构建阶段）**：Xcode 中定义的构建步骤序列，包括编译源码、链接库、复制资源、运行自定义脚本等。
> - **`SKIP_BUNDLING`**：在 Debug 配置下跳过打包步骤，因为 Debug 模式下会直接从 Metro 开发服务器加载 JavaScript，无需预先打包。
> - **`export:embed`**：Expo CLI 的打包命令，将 JavaScript 代码和资源打包为可嵌入应用的静态文件。

### 属性列表配置

在 `Info.plist` 中禁用基于视图控制器的状态栏外观（`View controller-based status bar appearance` 设为 `NO`），让 React Native 的 StatusBar 组件能正确控制状态栏样式。

### 代码集成

#### 1. 创建 React Native 视图控制器

实现一个视图控制器（ViewController），用于初始化 React Native 工厂和委托：

```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

class ReactNativeViewController: UIViewController {
  var reactNativeFactory: RCTReactNativeFactory?
  var reactNativeFactoryDelegate: RCTReactNativeFactoryDelegate?

  override func viewDidLoad() {
    super.viewDidLoad()
    reactNativeFactoryDelegate = ReactNativeDelegate()
    reactNativeFactoryDelegate!.dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactory = RCTReactNativeFactory(delegate: reactNativeFactoryDelegate!)
    view = reactNativeFactory!.rootViewFactory.view(withModuleName: "HelloWorld")
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
      self.bundleURL()
    }

    override func bundleURL() -> URL? {
      #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
      #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
      #endif
    }
}
```

> **术语说明**：
> - **`RCTReactNativeFactory`**：React Native 新架构中用于创建和管理 React Native 实例的工厂类。它负责初始化 Bridge（JS 与原生之间的通信桥梁）和渲染系统。
> - **`RCTReactNativeFactoryDelegate`**：工厂的委托协议，提供配置信息，如 JavaScript Bundle 的 URL 来源。
> - **`RCTBridge`**：React Native 的核心通信桥，负责 JavaScript 和原生代码之间的消息传递。在新架构中逐步被 JSI（JavaScript Interface）取代。
> - **`view(withModuleName:)`**：根据在 JavaScript 端注册的模块名称创建对应的原生视图。
> - **`bundleURL()`**：在 Debug 模式下返回 Metro 开发服务器的 URL，实现热重载；在 Release 模式下返回预打包的 `jsbundle` 文件路径。

#### 2. 从原生界面呈现 React Native

从现有的原生视图层级中以模态方式呈现 React Native 控制器：

```swift
import UIKit

class ViewController: UIViewController {

  var reactViewController: ReactViewController?

  override func viewDidLoad() {
    super.viewDidLoad()
    // 加载视图后进行额外设置
    self.view.backgroundColor = .systemBackground

    let button = UIButton()
    button.setTitle("Open React Native", for: .normal)
    button.setTitleColor(.systemBlue, for: .normal)
    button.setTitleColor(.blue, for: .highlighted)
    button.addAction(UIAction { [weak self] _ in
      guard let self else { return }
      if reactViewController == nil {
       reactViewController = ReactViewController()
      }
      present(reactViewController!, animated: true)
    }, for: .touchUpInside)
    self.view.addSubview(button)

    button.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      button.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
      button.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
      button.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
      button.centerYAnchor.constraint(equalTo: self.view.centerYAnchor),
    ])
  }
}
```

> **术语说明**：
> - **模态呈现（Modal Presentation）**：iOS 中一种界面展示方式，新的视图控制器覆盖在当前视图之上，通常带有过渡动画。使用 `present(_:animated:)` 方法实现。
> - **Auto Layout 约束**：代码中的 `NSLayoutConstraint` 部分定义了按钮的布局约束，使其居中显示。`translatesAutoresizingMaskIntoConstraints = false` 是使用代码布局约束的必要设置。
> - **`[weak self]`**：Swift 中的弱引用捕获，用于避免循环引用导致的内存泄漏。

> **基于文档内容推导**：上述示例展示了最基本的集成模式——在现有原生应用中添加一个按钮，点击后以模态方式打开 React Native 界面。实际项目中你可能需要更复杂的导航集成，如将 React Native 视图嵌入到 `UINavigationController` 中，或通过 `UITabBarController` 将 React Native 作为其中一个标签页。

## 验证集成

完成所有配置后，使用你的包管理器启动开发服务器：

```sh
# npm
npm run start

# yarn
yarn run start

# pnpm
pnpm run start

# bun
bun run start
```

启动后，开发服务器会：

1. **编译 TypeScript/JavaScript 代码**
2. **在本地提供 Metro 开发服务器**
3. **在模拟器或真机上启用热重载（Hot Reloading）**

当你导航到集成后的 React Native Activity（Android）或 ViewController（iOS）时，就能在模拟器或真机上看到 React Native 界面，并实时看到代码变更的效果。

> **基于经验建议**：如果启动后遇到"无法连接到开发服务器"的错误，请检查以下几点：
> - Android 模拟器：确保 `adb reverse tcp:8081 tcp:8081` 已执行。
> - iOS 模拟器：通常自动连接，但需确保 Metro 正在运行。
> - 真机：确保设备和开发机器在同一局域网内，并在应用中配置正确的 Metro 服务器 IP 地址。

## 常见问题与注意事项

1. **路径问题**：使用自定义目录结构时，需要相应调整 Gradle、Podfile 和构建脚本中的路径引用。这是集成过程中最常见的错误来源。

2. **版本兼容性**：确保 React Native、Expo SDK 和各原生模块的版本相互兼容。使用 `expo-autolinking` 的版本目录（Version Catalog）功能可以帮助统一管理依赖版本。

3. **构建时间**：首次集成后的首次构建通常需要较长时间，因为需要编译所有原生模块和依赖。后续增量构建会显著加快。

4. **新架构兼容性**：启用新架构后，部分旧版第三方库可能不完全兼容。在集成前建议检查所依赖的库是否已支持新架构。

---

## 文档导航

- **上一页**：[isolated approach](./39__isolated-approach.md)
- **下一页**：[lifecycle listeners](./41__lifecycle-listeners.md)
