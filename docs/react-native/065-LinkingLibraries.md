# 065 Linking Libraries

**翻页：** [上一页：064 React Native Gradle Plugin](064-ReactNativeGradlePlugin.md) · [目录](README.md) · [下一页：066 Running On Simulator](066-RunningOnSimulator.md)

**官方页面：** [Linking Libraries · React Native](https://reactnative.dev/docs/linking-libraries-ios)  
**平台范围：** iOS library linking。  
**源页代码覆盖：** npm native library 安装命令、autolinking 前提、旧式 Xcode 手动添加 `.xcodeproj`/链接静态库/设置 Header Search Paths 步骤。

## 为什么需要链接 native library

RN 能力分布在很多独立库里，不必把所有原生代码塞进每个 App。部分库纯 JS，安装后直接 import；部分库包含 Java/Objective-C/Swift 原生代码，iOS 工程必须把 Pods/Xcode native dependency 链进最终 App，否则调用时会出现缺模块错误。

RN 当前模板优先 **autolinking（自动链接）**。先把原生库加进 package.json：

```sh
npm install <library-with-native-dependencies>
```

库要放在 `dependencies` 或 `devDependencies`，因为 RN CLI/Gradle/CocoaPods 根据 package.json 查找需要链接的依赖。下次重建 App 时自动链接会添加平台代码。iOS 通常还要在 `ios/` 运行 `pod install`（Expo 工程按 Expo 命令/插件管理）。

## 旧库需要手动 Xcode 链接时

对不支持 autolinking 的旧 native package，源页给出 iOS 手动步骤：

1. 找到库目录里的 `.xcodeproj`，拖进宿主 Xcode 工程的 `Libraries` group。
2. 选主 App target 的 **Build Phases > Link Binary With Libraries**，将库 `Products` 目录生成的静态库加入链接列表。
3. 如果你的原生源码直接引用库的 header，在 Build Settings 的 **Header Search Paths** 中添加包含头文件的目录。

第三步只在 native 源代码需要头文件时才做；只从 JS 使用的库不需要 App 原生代码 include 头文件。RN 页面明确提醒，以前文档曾建议 recursive Header Search Paths，现在不推荐，因为可能造成隐蔽的构建错误，尤其是 CocoaPods 工程。

手动链接页面是旧集成路径；新库优先使用 autolinking/CocoaPods，必要时读该库当前安装说明。

**翻页：** [上一页：064 React Native Gradle Plugin](064-ReactNativeGradlePlugin.md) · [目录](README.md) · [下一页：066 Running On Simulator](066-RunningOnSimulator.md)
