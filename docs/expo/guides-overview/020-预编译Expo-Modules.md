# 020｜预编译 Expo Modules

**翻页：**[上一页：使用构建缓存 Provider](./019-远程构建缓存.md) · [目录](./README.md) · [下一页：用 Expo 开发网站](./021-用Expo开发网站.md)

**官方页面：**[Precompiled Expo Modules](https://docs.expo.dev/guides/prebuilt-expo-modules/)

**版本边界：**页面是未版本化 Guide。它说明 Android 从 SDK53、iOS 从 SDK56 起默认使用预编译 Expo 模块；本地项目为 SDK56。项目如果修改 build-properties 或 autolinking，需再与 [SDK v56 BuildProperties reference](https://docs.expo.dev/versions/v56.0.0/sdk/build-properties/)核对。该参考确有 iOS `usePrecompiledModules` 配置项。

## 预编译减少什么

通常原生构建会从模块源代码重新编译 C++、Swift / Objective-C 或 Kotlin / Java。预编译 Expo Modules 会把已经编译的原生二进制随常规 npm 包发布，Android 以 `.aar` 形式通过 Gradle 链接，iOS 以 `XCFramework` 通过 CocoaPods 链接。

未提供预编译版本的 Expo 模块会自动回退源码构建；同一个项目内预编译与源码构建可以共存。多数项目不用设置即可享受默认行为。当前 Guide 给出的启用时间是：Android SDK53 起默认启用，iOS SDK56 起默认启用；SDK55 iOS 在 EAS Build 默认启用，本机需先设置环境变量显式开启。

## iOS：关闭整个预编译路径

用 `expo-build-properties` 插件在 app config 写 `ios.usePrecompiledModules: false`，此设置同时影响本地和 EAS Build；下次 Prebuild 后生效：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "usePrecompiledModules": false
          }
        }
      ]
    ]
  }
}
```

也可以在运行 CocoaPods 安装时通过环境变量控制。本机需在 `pod install` 或 `npx expo run:ios` 之前设置：

```sh
export EXPO_USE_PRECOMPILED_MODULES=0
npx expo run:ios
```

在 EAS Build 上可创建环境变量并选择要应用的 EAS environment：

```sh
eas env:set --name EXPO_USE_PRECOMPILED_MODULES --value 0 --visibility plaintext
```

SDK v56 BuildProperties reference 同时列出 `ios.usePrecompiledModules` 属性。它是 config plugin 写入的显式 override；如页面描述的默认构建行为与某个项目配置不同，先检查 app config 是否已覆盖。

## 按库选择源码构建

Expo Autolinking 配置位于 package.json 的 `expo.autolinking`。把 `buildFromSource` 设为 `[".*"]` 可要求所有预编译 Expo Modules 从源码编译，也可以只写包名；这项配置可分别设给 Android 和 iOS：

```json
{
  "expo": {
    "autolinking": {
      "android": {
        "buildFromSource": [".*"]
      },
      "ios": {
        "buildFromSource": [".*"]
      }
    }
  }
}
```

通常只有修改模块源码、打补丁，或使用会增删 native dependency 的 config plugin 设置时，才需要指定源码构建。原因是预编译二进制已经按照默认 build options 编译；例如 Expo Camera 的 Android barcode scanner 开关会改原生依赖，可能要求源码重新构建。

## Reanimated / Worklets 的 EAS Build 问题

当前 iOS EAS Build 会自动下载一些第三方库的预编译 XCFramework，例如 Reanimated 和 Worklets；本机 `pod install` 通常从源码编译它们。因此当 `staticFeatureFlags` 在本机与 EAS 上结果不一致，或出现“EAS Build 报 flag 错、本机不报”的情况，可能是二进制和锁定包版本的 flag 列表不同。

Reanimated 与 Worklets 在 native 层相互链接。若需要其中一个源码构建，要在 iOS `buildFromSource` 同时指定两个包，避免一个预编译、一个源码导致找不到对应 framework：

```json
{
  "expo": {
    "autolinking": {
      "ios": {
        "buildFromSource": [
          "react-native-reanimated",
          "react-native-worklets"
        ]
      }
    }
  }
}
```

`worklets.staticFeatureFlags` 或 `reanimated.staticFeatureFlags` 等自定义 feature flags 会在二进制构建时写入；使用预编译 artifact 时，项目 package.json 里的新 override 不会重编写这个二进制。需要自定义这些 flags 时，通过 `EXPO_USE_PRECOMPILED_MODULES=0` 关闭预编译，再重新安装 Pods / 构建。

## 关键名词

- **预编译模块**：已构建的原生库文件，app 链接它而无需本次从源码编译。
- **AAR**：Android 原生库的发布归档格式，由 Gradle 解析链接。
- **XCFramework**：Apple 平台可分发的原生 framework 集合，由 CocoaPods / Xcode 链接。
- **Expo Autolinking**：从 package.json 发现原生依赖并配置 Android / iOS 工程的 Expo 机制。
- **buildFromSource**：选择让指定 Expo 模块退出预编译路径、改用本地源码构建。
- **Feature flag**：控制原生实现行为的编译时选项；已编进预编译 binary 后，JS 配置无法把它重新改写。

## 官方代码主题覆盖

源页所有 code themes 均有等价示例：关闭 iOS 全局预编译的 app config plugin、通过 shell 环境变量关闭、通过 EAS environment 禁用、package.json 的 Android / iOS 全量 buildFromSource 选项、Reanimated + Worklets 同步源码构建、feature flag 配置限制，以及本机 / EAS 排错逻辑。SDK56 的 usePrecompiledModules 配置项由精确版本 API reference 核对。

## 下一页

页脚 **Next** 从 Build locally 分组转到 Web 的 [Develop websites with Expo](https://docs.expo.dev/workflow/web/)，介绍 Expo 的跨平台 Web 构建和运行方式。

**翻页：**[上一页：使用构建缓存 Provider](./019-远程构建缓存.md) · [返回目录](./README.md) · [下一页：用 Expo 开发网站](./021-用Expo开发网站.md)
