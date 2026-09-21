# 108｜在已有原生 App 中集成 EAS Update

**翻页：**[上一页：估算 EAS Update 带宽用量](./107-估算EAS-Update带宽.md) · [目录](./README.md) · [下一页：EAS Observe 导言](./109-EAS-Observe-Introduction.md)

**官方页面：**[Using EAS Update in an existing native app](https://docs.expo.dev/eas-update/integration-in-existing-native-apps/)

**版本边界：**此未版本化教程面向 Expo SDK 52+、React Native 0.76+ 的 brownfield 原生工程；当前本地 Expo 版本为 ~56.0.11。指南给出 iOS SDK 53+ 与 SDK 52 两条初始化路径，SDK 56 应参考 53+ 路径，但要先用对应版本的 Expo / React Native 文档核对项目的原生入口。示例是集成结构说明，不是已针对本机工程构建验证的可直接粘贴补丁。

## 这页适合什么项目

**Brownfield（已有原生应用集成）**指 iOS / Android App 以 Swift、Objective-C、Kotlin 或 Java 原生宿主为主，在其中嵌入 React Native 屏幕或功能。若从头创建、App 入口本身就是 React Native，应回到 EAS Update Getting Started，不需要本页复杂的原生宿主接入步骤。

指南要求：已有原生项目和 React Native root view；使用 Expo SDK 及其支持的 React Native 版本；移除 CodePush 等其他 OTA 更新 SDK；安装并配置 Expo modules；Metro 使用 `expo/metro-config`；Babel 使用 `babel-preset-expo`；目标平台 `npx expo export -p android` / `-p ios` 能成功。页面说明集成细节会因宿主 App 不同而异，需按项目调整。

## 先完成 EAS Update 基础配置

先按 Getting Started 的安装与配置步骤，准备 `eas-cli`、`expo-updates`、EAS project ID、Update URL 和 runtime version。已有 native project 通常由配置命令改动 AndroidManifest.xml 与 iOS Expo.plist；这会影响 native binary，完成后仍需重新 build。

Brownfield 工程要关闭 expo-updates 针对 greenfield 的自动初始化，再由宿主原生代码控制何时启动 Update 系统。官方页要求 Android 在 `android/gradle.properties` 设置关闭自动初始化的属性；iOS 重新安装 Pods 时使用环境变量。它列出以下包管理器命令：

```sh
EX_UPDATES_CUSTOM_INIT=1 npx pod-install
EX_UPDATES_CUSTOM_INIT=1 yarn dlx pod-install
EX_UPDATES_CUSTOM_INIT=1 pnpm dlx pod-install
EX_UPDATES_CUSTOM_INIT=1 bunx pod-install
```

## Metro 与 JavaScript 入口初始化

Metro 配置需要继承 Expo Metro 默认设置，保留自定义配置时在 `config` 上继续修改：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// 在此继续应用项目需要的 Metro 自定义项。
module.exports = config;
```

自定义 JS 入口优先用 `registerRootComponent`，它会注册 React Native root 并运行 Expo 初始化：

```js
import App from './App';
import { registerRootComponent } from 'expo';

registerRootComponent(App);
```

如果必须保留直接使用 `AppRegistry` 的旧入口，先显式导入 Expo 初始化模块，再注册组件：

```js
import App from './App';
import 'expo/src/Expo.fx';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('App', () => App);
```

## Android：让 Expo React Host 和 Activity Wrapper 管理入口

Kotlin 示例需要改 `MainApplication.kt` 与 `MainActivity.kt`。Application 实现 `ReactApplication`，通过 `ExpoReactHostFactory` 建立 React host，并在原生生命周期初始化 React Native 和 Expo modules。项目若有不能自动链接的 package，可在 `PackageList` 创建后手动添加。

```kotlin
class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages
    )
  }

  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (error: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
```

若上面读取的 release level 不在支持枚举内，官方例子回退到 `ReleaseLevel.STABLE`；真实工程应保留项目当前 New Architecture 配置与异常处理。

Activity 继承 `ReactActivity`，`getMainComponentName()` 必须与 JS 注册的模块名相同，并把 Expo 的 `ReactActivityDelegateWrapper` 包在 `DefaultReactActivityDelegate` 外层：

```kotlin
class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "App"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    ReactActivityDelegateWrapper(
      this,
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      object : DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
      ) {}
    )
}
```

## iOS SDK 53+：由 AppDelegate 和自定义 Factory Delegate 接入

指南为原生 App 的自定义 `UIViewController` 创建一个 React Native root view。AppDelegate 继承 `ExpoAppDelegate`，保存 `AppController`，建立 `ExpoReactNativeFactory`，再调用 `AppController.initializeWithoutStarting()` 延迟启动 Update。自定义 factory delegate 优先返回 Update controller 的 launch asset URL；没有远端更新时使用 App 内的 `main.jsbundle`。

下面展示核心调用位置，窗口生命周期、URL Linking 转发等仍应结合项目现有 AppDelegate 合并：

```swift
@UIApplicationMain
class AppDelegate: ExpoAppDelegate {
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  var updatesController: (any InternalAppControllerInterface)?

  static func shared() -> AppDelegate {
    guard let delegate = UIApplication.shared.delegate as? AppDelegate else {
      fatalError("AppDelegate is unavailable")
    }
    return delegate
  }

  private func prepareReactNative(_ options: [UIApplication.LaunchOptionsKey: Any]?) {
    launchOptions = options
    let factoryDelegate = CustomReactNativeFactoryDelegate()
    let factory = ExpoReactNativeFactory(delegate: factoryDelegate)
    factoryDelegate.dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactoryDelegate = factoryDelegate
    reactNativeFactory = factory
    AppController.initializeWithoutStarting()
  }
}

final class CustomReactNativeFactoryDelegate: ExpoReactNativeFactoryDelegate {
  private let embeddedBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle")

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
    AppDelegate.shared().updatesController?.launchAssetUrl() ?? embeddedBundle
  }
}
```

原生 App 的 `didFinishLaunchingWithOptions` 应保存 launch options、调用上述 prepare 方法、创建 window 与自定义 RN 宿主 ViewController，再将其设为 root view controller 并显示 window。URL Linking 等原生回调仍要转发给 React Native linking manager。下面展示关键 Update / view 生命周期：

```swift
final class UpdateHostViewController: UIViewController, AppControllerDelegate {
  private let appDelegate = AppDelegate.shared()

  convenience init() {
    self.init(nibName: nil, bundle: nil)
    appDelegate.updatesController = AppController.sharedInstance
    AppController.sharedInstance.delegate = self
    AppController.sharedInstance.start()
  }

  func appController(
    _ appController: AppControllerInterface,
    didStartWithSuccess success: Bool
  ) {
    guard success,
          let factory = appDelegate.reactNativeFactory?.rootViewFactory else { return }
    let root = factory.view(
      withModuleName: "main",
      initialProperties: [:],
      launchOptions: appDelegate.launchOptions
    )
    view.addSubview(root)
    root.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      root.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
      root.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
      root.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
      root.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor)
    ])
  }
}
```

生产实现还要保留 Controller 的其他 required initializer 处理。核心顺序是先让 `AppController` 选出已下载或内置 bundle，再创建 RN root view，避免从 App bundle 固定加载而绕过 EAS Update。

## iOS SDK 52：旧入口使用 Wrapper 与 Root View Factory

SDK 52 分支沿用 `EXAppDelegateWrapper`。AppDelegate 需要保存 bundle URL 和 launch options，填写 `moduleName` / `initialProps`，创建 root view factory，并初始化但暂不启动 Update。`bundleURL()` 在远端 launch asset 可用时返回它，否则退回内嵌 `main.jsbundle`：

```swift
@UIApplicationMain
class AppDelegate: EXAppDelegateWrapper {
  let embeddedBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  var updatesController: (any InternalAppControllerInterface)?
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  static func shared() -> AppDelegate {
    guard let delegate = UIApplication.shared.delegate as? AppDelegate else {
      fatalError("AppDelegate is unavailable")
    }
    return delegate
  }

  override func bundleURL() -> URL? {
    updatesController?.launchAssetUrl() ?? embeddedBundle
  }

  private func prepareReactNative(_ options: [UIApplication.LaunchOptionsKey: Any]?) {
    launchOptions = options
    moduleName = "App"
    initialProps = [:]
    rootViewFactory = createRCTRootViewFactory()
    AppController.initializeWithoutStarting()
  }
}
```

SDK 52 的自定义 ViewController 也实现 `AppControllerDelegate`，初始化时设置 AppDelegate 的 updates controller、将自身设为 delegate 并启动 `AppController`。收到启动成功回调后，从 AppDelegate 的 `rootViewFactory` 创建模块名为 `App` 的 view，传入 initial props 与 launch options，加入 controller 并设置 safe area 约束：

```swift
final class UpdateHostViewController: UIViewController, AppControllerDelegate {
  private let appDelegate = AppDelegate.shared()

  convenience init() {
    self.init(nibName: nil, bundle: nil)
    appDelegate.updatesController = AppController.sharedInstance
    AppController.sharedInstance.delegate = self
    AppController.sharedInstance.start()
  }

  func appController(
    _ appController: AppControllerInterface,
    didStartWithSuccess success: Bool
  ) {
    guard success else { return }
    let root = appDelegate.rootViewFactory.view(
      withModuleName: appDelegate.moduleName,
      initialProperties: appDelegate.initialProps,
      launchOptions: appDelegate.launchOptions
    )
    view.addSubview(root)
    root.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      root.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
      root.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
      root.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
      root.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor)
    ])
  }
}
```

AppDelegate 的 application 启动方法还需创建原生 `UIWindow`、以该自定义 controller 作为 root 并调用 `makeKeyAndVisible()`。SDK 53+ 的 factory 创建接口和 SDK 52 的 `rootViewFactory` 接口不要混用。

## 按平台整理集成顺序

1. 在原生工程加入 Expo modules 与 expo-updates 的基础配置，先确认 debug 和 release 均能编译运行。
2. 切换 Metro / Babel 与 JavaScript 入口到 Expo 所需配置。
3. Android 用 Expo React host / activity wrapper；iOS 根据 Expo SDK 版本，采用对应 AppDelegate / custom view controller 生命周期。
4. 确认更新系统先于 RN root view 完成初始化，之后再选取 `launchAssetUrl()` 并挂载 React Native view。
5. 分别对目标平台执行 `npx expo export -p android`、`npx expo export -p ios`，创建启用 EAS Update 的 native build，再按基本指南验证下载更新。

## 关键名词

- **Brownfield：**把 React Native / Expo 加入已有原生 App，而不是从空白项目创建整个 App。
- **Root View：**承载 React Native 界面的原生 View；iOS 中可以作为某个 `UIViewController` 的子 view。
- **AppDelegate：**iOS 进程和应用生命周期入口。React Native/Expo 集成要在正确生命周期启动原生模块。
- **React Host：**Android 侧托管 React Native runtime 的对象；Expo host 会完成 Expo modules 与 update 集成所需配置。
- **`expo-updates` AppController：**负责选择、初始化 EAS Update 下载版本或内置 bundle 的 iOS 控制器。
- **`launchAssetUrl()`：**Update 初始化后返回应启动的 JS bundle URL；不存在远端有效 Update 时回到嵌入包。
- **Custom Init：**关闭自动初始化，让既有原生 App 在适当生命周期显式启动 Updates。
- **SDK 52 / SDK 53+ 分支：**Expo iOS wrapper / factory 的 API 接入点不同；新版本代码不应直接套进旧版工程。

## 官方代码主题覆盖

源页代码主题均已覆盖：Android 原生 `gradle.properties` 关闭自动初始化的要求；iOS 的 `EX_UPDATES_CUSTOM_INIT=1` CocoaPods 命令（npx、Yarn、pnpm、Bun）；Metro 默认配置；两种 JS 自定义入口初始化方式；Android `MainApplication.kt` 的 React host、ReleaseLevel、React Native / Expo lifecycle 与配置变化分发；`MainActivity.kt` 的模块名和 Activity Delegate Wrapper；iOS SDK 53+ 的 ExpoAppDelegate、factory delegate、bundle URL fallback 与 AppController 延迟初始化；SDK 52 的 EXAppDelegateWrapper / rootViewFactory 方案；以及两版自定义 ViewController 的 AppControllerDelegate 生命周期、RN root view 创建和 safe area 布局。

## 下一页

官方页脚 **Next** 离开 EAS Update Reference，进入 [EAS Observe: Introduction](https://docs.expo.dev/eas/observe/introduction/)，开始另一条用于监控应用表现的 EAS 文档链。

**翻页：**[上一页：估算 EAS Update 带宽用量](./107-估算EAS-Update带宽.md) · [返回目录](./README.md) · [下一页：EAS Observe 导言](./109-EAS-Observe-Introduction.md)
