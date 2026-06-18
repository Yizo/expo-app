# 通过隔离方式（Isolated Approach）集成 Expo

> **原文地址**：https://docs.expo.dev/brownfield/isolated-approach/
>
> **最后更新时间**：2026 年 6 月 3 日

---

## 概述

隔离方式（Isolated Approach）是一种将 Expo / React Native 集成到**已有原生应用**（即"棕地项目"，Brownfield）中的策略。

> **关键术语解释**
>
> - **棕地项目（Brownfield）**：指已经存在并正在运行的原生 Android / iOS 应用，与从零开始创建的"绿地项目（Greenfield）"相对。
> - **隔离方式（Isolated Approach）**：将 JavaScript 代码的开发和构建与原生宿主应用完全分离，JavaScript 团队独立构建 JS 代码并打包成原生库（Android 的 AAR 或 iOS 的 XCFramework），然后像引入第三方 SDK 一样将其集成到宿主应用中。
> - **AAR**：Android Archive，Android 平台的二进制分发包格式，类似于 Java 的 JAR。
> - **XCFramework**：Apple 平台的多架构框架分发格式，可以同时包含真机和模拟器的二进制文件。
> - **宿主应用（Host App）**：指已有的原生 Android/iOS 应用，React Native 的界面将被嵌入其中。

### 核心思路

隔离方式的核心思想是：**JavaScript UI 的构建和开发与宿主应用完全独立**。你将 JS 代码编译为原生格式的库文件，然后像添加任何第三方模块一样将其附加到宿主应用中。

### 适用场景

- 需要**最小化对现有构建流程的影响**
- **不同团队**分别负责原生开发和 JavaScript 开发
- 宿主应用的工程师**不需要安装 Node.js 或 Yarn**，只需消费预编译好的产物

> **基于经验建议**：如果你的团队规模较小，且原生和 JS 开发由同一批人负责，可以考虑另一种方案——[集成方式（Integrated Approach）](./40__integrated-approach.md)，它允许直接在宿主应用中集成 Expo，更适合紧密协作的团队。

---

## 前置要求

在开始之前，请确保已安装以下工具：

| 工具 | 说明 |
|------|------|
| **Node.js（LTS 版本）** | 用于执行 JavaScript 代码和 CLI 工具。LTS 即 Long Term Support（长期支持版），稳定性更好 |
| **Yarn** | JavaScript 包管理器，用于安装和管理 JS 依赖 |

> **关键术语解释**
>
> - **Node.js**：一个 JavaScript 运行时环境，允许在终端/命令行中执行 JavaScript 代码（而不仅仅是在浏览器中）。
> - **Yarn**：由 Facebook 开发的 JavaScript 包管理工具，功能类似于 npm，但速度和一致性更好。
> - **CLI（Command Line Interface）**：命令行界面工具，通过终端输入命令来执行操作。

如需环境配置帮助，请参阅 Expo 官方的环境搭建教程。

---

## 第一步：初始化 JS 应用环境

### 1.1 创建项目

创建一个新目录来存放你的 JavaScript 代码。文档中使用 `my-project` 作为示例名称（你可以自由选择任何名称）。

> **基于经验建议**：该项目可以放在独立的代码仓库（repository）或 monorepo（单体仓库）中，**不需要放在现有原生应用的目录内**。这种物理上的分离正是隔离方式的核心理念。

项目创建时会自动包含一个 TypeScript 起步模板。

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

> **关键术语解释**
>
> - **npx / yarn create / pnpm create / bun create**：分别是 npm、Yarn、pnpm、bun 四种包管理器下用于"创建新项目"的命令。选择你习惯的包管理器执行即可。
> - **create-expo-app**：Expo 官方提供的项目脚手架工具，用于快速创建一个配置好的 Expo 项目。
> - **--template default@sdk-56**：指定使用 SDK 56 版本的默认模板。`@latest` 确保使用最新版本的脚手架。

### 1.2 安装 Brownfield 包

进入刚创建的目录，安装 `expo-brownfield` 包。该包提供了将 JS 代码编译为原生库所需的工具。

```sh
# npm
npx expo install expo-brownfield

# yarn
yarn expo install expo-brownfield

# pnpm
pnpm expo install expo-brownfield

# bun
bun expo install expo-brownfield
```

> **关键术语解释**
>
> - **expo-brownfield**：Expo 官方提供的专门用于棕地集成的包，它包含将 React Native 项目打包为原生库（AAR / XCFramework）的构建脚本和配置插件。

### 1.3 修改配置（可选）

安装 `expo-brownfield` 包后，它会自动向你的应用配置文件（`app.json` 或 `app.config.js`）中注入一个默认的配置插件（plugin）条目。

**默认配置**（适用于大多数场景）：

```json
{
  "expo": {
    "plugins": ["expo-brownfield"]
  }
}
```

> **关键术语解释**
>
> - **Expo Plugin（配置插件）**：Expo 的配置系统扩展机制。插件可以在构建时自动修改原生配置（如 Android 的 `build.gradle`、iOS 的 `Info.plist` 等），无需手动编辑原生文件。
> - **app.json / app.config.js**：Expo 项目的配置文件，定义了应用的名称、版本号、图标、插件等元信息。

#### 自定义配置

如果需要自定义目标名称（target name）、包标识符（bundle identifier）和发布详情，可以传递具体参数：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-brownfield",
        {
          "ios": {
            "targetName": "MyBrownfield",
            "bundleIdentifier": "com.example.mybrownfield"
          },
          "android": {
            "libraryName": "mybrownfield",
            "group": "com.example",
            "package": "com.example.mybrownfield",
            "version": "1.0.0"
          }
        }
      ]
    ]
  }
}
```

> **关键术语解释**
>
> - **targetName**：iOS 构建目标的名称，会出现在 Xcode 的 target 列表中。
> - **bundleIdentifier**：iOS 应用的唯一标识符（如 `com.company.appname`），类似于 Android 的 package name。
> - **libraryName**：Android 生成的库名称。
> - **group**：Maven 坐标中的 groupId，用于在 Maven 仓库中组织库。
> - **package**：Android 的包名，用于在 Java/Kotlin 代码中引用。

如需了解所有可用参数，请查阅 `expo-brownfield` 的 API 文档。

---

## 第二步：编译为原生二进制文件

完成项目初始化后，使用 CLI 将 JS 代码编译为各平台的原生格式。

### 2.1 Android 编译

从项目根目录执行以下命令。该命令会：

1. 构建 **AAR**（Android Archive）文件
2. 将其发布到 **Maven 仓库**（默认是本地 Maven 仓库，也可配置远程仓库）

生成的构件（artifact）名称取决于你在插件配置中的设置。

```sh
# npm
npx expo-brownfield build:android

# yarn
yarn dlx expo-brownfield build:android

# pnpm
pnpm dlx expo-brownfield build:android

# bun
bunx expo-brownfield build:android
```

> **关键术语解释**
>
> - **Maven 仓库**：Java/Android 生态中的包管理仓库，类似于 npm 之于 JavaScript。`mavenLocal()` 指的是本机的 `~/.m2/repository` 目录。
> - **构件（Artifact）**：构建过程生成的最终文件，在这里指 AAR 文件。

### 2.2 iOS 编译

执行 iOS 构建命令会：

1. 为**真机**和**模拟器**两种架构编译 framework
2. 将 framework 打包
3. 复制 **Hermes 引擎**（JavaScript 运行时）

输出文件将放在 `artifacts` 目录中，包含你的项目 framework 和 JS 引擎。

```sh
# npm
npx expo-brownfield build:ios

# yarn
yarn dlx expo-brownfield build:ios

# pnpm
pnpm dlx expo-brownfield build:ios

# bun
bunx expo-brownfield build:ios
```

> **关键术语解释**
>
> - **Hermes**：Meta（Facebook）开发的 JavaScript 引擎，专为 React Native 优化，相比 JSC（JavaScriptCore）启动更快、内存占用更低。
> - **Framework**：iOS 中的动态库分发格式，包含编译后的二进制代码和头文件。

### 2.3 通过 Swift Package 分发（iOS）

如果你希望将 iOS 产物打包为一个独立的 **Swift Package**（而非散落的 framework 文件），可以附加 `--release --package` 参数：

```sh
# npm
npx expo-brownfield build:ios --release --package MyAppPackage

# yarn
yarn dlx expo-brownfield build:ios --release --package MyAppPackage

# pnpm
pnpm dlx expo-brownfield build:ios --release --package MyAppPackage

# bun
bunx expo-brownfield build:ios --release --package MyAppPackage
```

> **关键术语解释**
>
> - **Swift Package**：Apple 官方的包管理方案（Swift Package Manager / SPM）。使用 Swift Package 可以方便地将产物作为本地依赖添加到 Xcode 项目中，无需手动拖拽文件。
> - **--release**：构建发布版本（优化后的二进制），与调试版本（debug）相对。
> - **--package MyAppPackage**：指定 Swift Package 的名称。如果省略，将使用自动生成的名称。

生成的目录结构包含一个 `Package.swift` 清单文件和包含所有必要 framework 的文件夹。

### 2.4 调试原生代码

如果需要调试生成的原生代码，可以使用 `prebuild` 命令来生成底层的原生平台项目：

```sh
# npm
npx expo prebuild

# yarn
yarn expo prebuild

# pnpm
pnpm expo prebuild

# bun
bun expo prebuild
```

该命令会生成：

- **Android**：一个包含宿主管理器（host manager）和活动（activity）的模块
- **iOS**：一个包含视图控制器（view controller）和代理（delegate）的 framework target

> **关键术语解释**
>
> - **prebuild**：Expo 的预构建命令，会根据 `app.json` 配置自动生成 `android/` 和 `ios/` 目录下的原生代码。在隔离方式中，它用于生成可调试的原生项目文件。
> - **Activity**：Android 中的界面组件，代表一个屏幕/页面。
> - **View Controller**：iOS 中的界面控制器，管理一个屏幕的内容和交互。

---

## 第三步：集成到宿主应用

将编译好的二进制文件集成到宿主应用中，并初始化 JavaScript 运行环境。

### 3.1 Android 集成

#### 3.1.1 添加依赖

将编译好的 AAR 模块添加到 Gradle 的依赖配置中。请确保坐标（group:artifact:version）与你的配置一致：

```kotlin
dependencies {
  implementation("com.username.myproject:brownfield:1.0.0")
}
```

> **关键术语解释**
>
> - **Gradle**：Android 项目的构建系统和依赖管理工具，类似于前端的 npm/Yarn。
> - **implementation**：Gradle 的依赖声明方式，表示该依赖在编译和运行时都可用。
> - **坐标（Coordinates）**：Maven 生态中用于唯一标识一个库的字符串，格式为 `groupId:artifactId:version`。

如果使用的是**本地 Maven 仓库**，需要在 `dependencyResolutionManagement` 中添加 `mavenLocal()`：

```kotlin
dependencyResolutionManagement {
  repositories {
    google()
    mavenCentral()
    mavenLocal()
  }
}
```

> **关键术语解释**
>
> - **dependencyResolutionManagement**：Gradle 中用于集中管理依赖仓库来源的配置块。
> - **google()**：Google 的 Maven 仓库，包含 Android SDK 和 Google 相关库。
> - **mavenCentral()**：Maven 中央仓库，最大的 Java/Kotlin 开源库仓库。
> - **mavenLocal()**：本机的 Maven 缓存目录（`~/.m2/repository`），构建产物发布到本地时使用。

#### 3.1.2 显示 React Native 界面

创建一个自定义 Activity，继承 `expo-brownfield` 提供的 `BrownfieldActivity` 基类，然后调用 `showReactNativeFragment()` 扩展函数来显示 React Native 界面：

```kotlin
import android.os.Bundle
import com.example.brownfield.BrownfieldActivity
import com.example.brownfield.showReactNativeFragment

class ExpoActivity : BrownfieldActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showReactNativeFragment()
  }
}
```

> **关键术语解释**
>
> - **BrownfieldActivity**：`expo-brownfield` 提供的基础 Activity 类，它内部封装了 React Native 运行时的初始化和 Fragment 管理逻辑。
> - **Fragment**：Android 中的可复用界面组件，可以嵌入到 Activity 中。这里 React Native 的界面以一个 Fragment 的形式展示。
> - **扩展函数（Extension Function）**：Kotlin 的语言特性，允许为已有类添加新方法，无需修改原始类。

在 `AndroidManifest.xml` 中注册这个 Activity。**注意**：主题必须使用**无 ActionBar** 的样式，并且需要处理配置变更（configChanges）：

```xml
<activity
  android:name=".ExpoActivity"
  android:theme="@style/Theme.AppCompat.Light.NoActionBar"
  android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
/>
```

> **注意**：`configChanges` 属性告诉 Android 系统，当这些配置发生变化时（如旋转屏幕、键盘弹出），**不要销毁并重建 Activity**，而是让 React Native 自行处理。这是 React Native 界面的标准配置，可以避免不必要的重新渲染。

最后，通过 Intent 启动该 Activity：

```kotlin
startActivity(Intent(this, ExpoActivity::class.java))
```

> **基于文档内容推导**：`BrownfieldActivity` 基类会自动处理以下事项：
> - 配置转发（Configuration forwarding）：将宿主应用的配置信息传递给 React Native 运行时
> - 返回按钮逻辑（Back button handling）：确保 React Native 界面内的导航返回行为正确
>
> 因此你不需要手动编写这些逻辑。

### 3.2 iOS 集成

#### 3.2.1 导入产物

根据你的分发方式，有两种导入方法：

**方式一：XCFramework（默认方式）**
1. 将生成的 `.xcframework` 文件拖入 Xcode 的项目导航器（Project Navigator）
2. 确保勾选 **"Copy items if needed"**（需要时复制项目）
3. 在 **Embed & Sign**（嵌入并签名）设置中，将每个 framework 设置为嵌入状态

**方式二：Swift Package**
1. 将生成的目录作为本地依赖添加到 Xcode 中
2. 根据构建配置（Debug / Release）链接对应的配置

> **关键术语解释**
>
> - **Embed & Sign**：Xcode 中的框架嵌入方式。"Embed"表示将 framework 复制到应用的 bundle 中，"Sign"表示使用你的开发者证书对其进行代码签名。两者缺一不可，否则应用在真机上会崩溃。
> - **Project Navigator**：Xcode 左侧面板中的文件树视图，用于管理项目中的所有文件。

#### 3.2.2 初始化 React Native 宿主管理器

在应用启动的早期阶段（通常在 `AppDelegate` 中），初始化 React Native 宿主管理器：

```swift
import UIKit
import MyAppBrownfield // 替换为你的 target 名称

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    ReactNativeHostManager.shared.initialize()
    return true
  }
}
```

> **关键术语解释**
>
> - **AppDelegate**：iOS 应用的入口代理，负责处理应用生命周期事件。`didFinishLaunchingWithOptions` 是应用启动完成后调用的第一个方法。
> - **ReactNativeHostManager**：`expo-brownfield` 提供的单例类，负责管理 React Native 运行时的初始化、JS Bundle 加载和桥接（Bridge）管理。
> - **initialize()**：初始化方法，会启动 Hermes 引擎并预加载 JS Bundle，确保后续打开 React Native 界面时能快速响应。

> **基于经验建议**：`import MyAppBrownfield` 中的模块名取决于你在插件配置中设置的 `targetName`（iOS）或默认的 target 名称。请确保替换为你实际使用的名称。

#### 3.2.3 显示 React Native 界面

**UIKit 方式**

实例化 `expo-brownfield` 提供的 `ReactNativeViewController`，指定模块名称，然后将其推入导航栈：

```swift
import UIKit
import MyAppBrownfield

class ViewController: UIViewController {
  @IBAction func openReactNative(_ sender: Any) {
    let rnViewController = ReactNativeViewController(moduleName: "main")
    navigationController?.pushViewController(rnViewController, animated: true)
  }
}
```

> **关键术语解释**
>
> - **ReactNativeViewController**：`expo-brownfield` 提供的视图控制器，内部封装了 React Native 视图的加载和显示逻辑。
> - **moduleName**：对应你在 JS 代码中通过 `AppRegistry.registerComponent()` 注册的组件名称。通常为 `"main"`。
> - **navigationController**：iOS UIKit 中的导航控制器，管理视图控制器的压栈和弹出（前进/后退）。
> - **pushViewController**：将新的视图控制器压入导航栈，并带动画展示。

`ReactNativeViewController` 还支持传入**初始属性（initialProps）**和**启动选项（launchOptions）**：

```swift
let rnViewController = ReactNativeViewController(
  moduleName: "main",
  initialProps: ["userId": "123"],
  launchOptions: [:]
)
```

> **基于文档内容推导**：`initialProps` 允许你从原生端向 React Native 传递初始数据（如用户 ID、认证令牌等），React Native 组件可以在启动时通过 props 接收这些数据，实现原生端与 JS 端的数据传递。

**SwiftUI 方式**

在 SwiftUI 中，使用 `expo-brownfield` 提供的 `ReactNativeView`，通过 `fullScreenCover` 来全屏展示 React Native 界面：

```swift
import SwiftUI
import MyAppBrownfield

struct ContentView: View {
  @State private var showReactNative = false

  var body: some View {
    Button("Open React Native") {
      showReactNative = true
    }
    .fullScreenCover(isPresented: $showReactNative) {
      ReactNativeView(moduleName: "main")
    }
  }
}
```

> **关键术语解释**
>
> - **SwiftUI**：Apple 在 iOS 13 引入的声明式 UI 框架，与 UIKit 的命令式风格不同。
> - **@State**：SwiftUI 的状态注解，当状态值变化时视图会自动重新渲染。
> - **fullScreenCover**：SwiftUI 的全屏模态展示修饰符，类似于 UIKit 中的 `present(_:animated:)`。
> - **ReactNativeView**：`expo-brownfield` 提供的 SwiftUI 视图封装，内部包装了 React Native 的原生视图。

---

## 第四步：验证集成

### 4.1 调试模式（Debug）

在调试环境下，你需要启动 **Metro 开发服务器**来提供 JavaScript 代码的热重载能力。

**步骤**：

1. 在 JS 项目目录中启动 Metro 打包器：

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

2. 在原生 IDE（Android Studio / Xcode）中构建并运行宿主应用
3. React Native 界面将从开发服务器加载 JS 代码，支持**热重载（Hot Reloading）**

> **关键术语解释**
>
> - **Metro**：React Native 的官方 JavaScript 打包器/开发服务器。它在开发时将 JS 代码实时打包并提供给应用，支持热重载和快速刷新（Fast Refresh）。
> - **热重载（Hot Reloading）**：在修改 JS 代码后，应用会自动更新界面而无需完全重新加载，极大提升开发效率。

### 4.2 发布模式（Release）

在发布/生产环境下：

- JavaScript Bundle 已经**嵌入到编译好的原生二进制文件中**（AAR / XCFramework）
- **不需要启动 Metro 开发服务器**
- 直接以 Release 模式编译宿主应用
- 确认 React Native 界面能正常渲染

> **基于文档内容推导**：隔离方式的一个优点是，发布构建时 JS 代码已经被打包进原生库中，宿主应用的 CI/CD 流程不需要任何 Node.js 环境，这进一步降低了对宿主应用构建流水线的影响。

---

## 进阶阅读

完成基本集成后，可以继续探索以下内容：

- **生命周期监听器（Lifecycle Listeners）**：配置应用生命周期事件的监听，实现更深度的模块集成。例如在 React Native 界面可见/隐藏时触发特定逻辑。
- **JavaScript API 参考**：查阅 `expo-brownfield` 的完整 JS API 文档，了解导航（navigation）和通信（communication）相关的高级功能。

---

## 完整工作流程总结

```
┌─────────────────────────────────────────────────────────┐
│                    JS 项目（独立仓库）                     │
│                                                         │
│  1. create-expo-app 创建项目                             │
│  2. 安装 expo-brownfield                                │
│  3. 配置 app.json                                       │
│  4. build:android → AAR                                 │
│     build:ios     → XCFramework / Swift Package         │
│                                                         │
└────────────────────────┬────────────────────────────────┘
                         │  产物（二进制文件）
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  宿主原生应用                             │
│                                                         │
│  Android:                                              │
│    - Gradle 添加依赖                                     │
│    - 继承 BrownfieldActivity                            │
│    - showReactNativeFragment()                          │
│                                                         │
│  iOS:                                                  │
│    - Xcode 导入 framework / Swift Package               │
│    - AppDelegate 中初始化 HostManager                   │
│    - 展示 ReactNativeViewController / ReactNativeView   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> **基于经验建议**：
>
> 1. **团队协作**：隔离方式最大的优势在于团队解耦——JS 团队可以独立开发和测试 UI，产物通过版本化的包管理（Maven / Swift Package）交付给原生团队。建议在 CI/CD 中自动化构建和发布流程。
> 2. **版本管理**：每次 JS 代码更新后都需要重新编译并发布新版本的 AAR / XCFramework。建议使用语义化版本号（SemVer）来管理产物版本。
> 3. **调试策略**：开发阶段使用 Metro 开发服务器进行热重载调试；集成测试阶段使用 prebuild 生成原生项目进行原生代码调试。

---

## 文档导航

- **上一页**：[overview](./38__overview.md)
- **下一页**：[integrated approach](./40__integrated-approach.md)
