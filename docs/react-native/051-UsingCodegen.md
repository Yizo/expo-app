# 051 Using Codegen

**翻页：** [上一页：050 What is Codegen?](050-WhatIsCodegen.md) · [目录](README.md) · [下一页：052 The Codegen CLI](052-TheCodegenCLI.md)

**官方页面：** [Using Codegen · React Native](https://reactnative.dev/docs/the-new-architecture/using-codegen)  
**版本范围：** 本页示例由 RN 0.87 Codegen 指南整理。  
**源页代码覆盖：** RN CLI 初始化、`package.json` 的 `codegenConfig` 各字段、Spec 命名约定、Android Gradle task、Android/ iOS 输出文件类型，以及 iOS `generate-codegen-artifacts.js` 参数命令。

## 前置条件和用例

Codegen 必须在 React Native App 工程上下文运行，即便手工调用也需要 RN 项目、安装好的 `react-native` 依赖以及 Turbo Native Module 或 Fabric Native Component spec。新手了解概念即可；日常写纯 JS/TS 屏幕通常不需要自己运行 Codegen。

文档用 RN 0.87 CLI 建立示例工程：

```sh
npx @react-native-community/cli@latest init SampleApp --version 0.87.0
```

Codegen 根据带类型的 JavaScript/TypeScript spec 生成 C++ glue 和平台代码，避免手动写大量重复桥接声明。

## 在 package.json 配置 Codegen

根 `package.json` 的 `codegenConfig` 告诉脚本项目名称、生成模块/组件范围、spec 目录，以及 Android/iOS 特定类名和协议配置：

```json
{
  "codegenConfig": {
    "name": "SampleAppSpec",
    "type": "all",
    "jsSrcsDir": "specs",
    "android": {
      "javaPackageName": "com.example.sampleapp"
    },
    "ios": {
      "modules": {
        "LocalSettings": {
          "className": "LocalSettingsModule",
          "unstableRequiresMainQueueSetup": false,
          "conformsToProtocols": ["RCTURLRequestHandler"]
        }
      },
      "components": {
        "NativeMeter": { "className": "RCTNativeMeter" }
      }
    }
  }
}
```

字段含义：

- `name`：影响生成文件名和生成内容中的配置标识。
- `type`：`modules` 只生成模块、`components` 只生成组件、`all` 两者都生成。
- `jsSrcsDir`：spec 搜索根目录。
- `android.javaPackageName`：Android 生成 Java 类型的包名。
- `ios.modules[moduleName]`：设置 iOS module class、是否需要主线程初始化（该字段带 unstable 标记）和需要声明符合的协议。
- `ios.components[componentName].className`：指定 iOS Fabric 组件实现类名。

Codegen 搜索依赖与应用里的 spec。Turbo Native Module spec 通常以 `Native` 开头，例如 `NativeLocalStorage.ts`；Fabric Native Component spec 以 `NativeComponent` 结尾，例如 `WebViewNativeComponent.ts`。生成规则与具体模板有关，文件名与 spec 类型要同时符合当前指南。

## Android 手动生成

Android Codegen 集成在 React Native Gradle Plugin。自动原生构建已会触发生成；开发者也能进入 `android/` 手动调用 task：

```sh
cd android
./gradlew generateCodegenArtifactsFromSchema
```

此 task 会扫描 App 和链接的 node modules，各自生成代码。项目产物通常写到 `android/app/build/generated/source/codegen/`；依赖模块的生成物在各自 `node_modules/<dependency>/...` 路径。

生成内容分 Java 和 JNI/C++ 两大类：

| 输出区域 | 常见文件/用途 |
|---|---|
| `java/.../NativeLocalStorageSpec.java` | Turbo Module 实现要继承/满足的生成接口 |
| `java/.../viewmanagers/*ManagerDelegate.java` | Fabric View Manager 到自定义 View 的方法委派 |
| `java/.../viewmanagers/*ManagerInterface.java` | View Manager 接口 |
| `jni/<name>-generated.cpp`、`<name>.h` | 模块的 JSI/桥接接口与 glue code |
| `jni/react/renderer/components/<name>/` | Fabric component 的 `ComponentDescriptors`、`EventEmitters`、`Props`、`ShadowNodes`、`States` 等结构 |
| `schema.json` | Codegen 解析后的 schema |

`type: "modules"` 时不会生成 Fabric renderer component 目录；`type: "components"` 时则没有模块相关输出。

## iOS 手动生成

iOS 的 Codegen 使用 RN 包内 Node 脚本，构建时由脚本自动调用。需要直接检查输出时从项目根目录运行：

```sh
node node_modules/react-native/scripts/generate-codegen-artifacts.js \
  --path . \
  --outputPath ios/ \
  --targetPlatform ios
```

脚本还接受 `--help`、`--version`；`--path` 是 App 根目录，`--outputPath` 是输出位置，`--targetPlatform` 支持 `android`、`ios` 或 `all`。

页面示例把输出放在 `ios/build/generated/ios`。常见结果包括：

| 输出 | 用途 |
|---|---|
| `<name>/<name>.h` 与 `<name>-generated.mm` | iOS Turbo Module 接口和 glue code |
| `<name>JSI.h` 及生成文件 | C++ module 与 JS 之间的接口/实现 |
| `FBReactNativeSpec*.h/.mm` | RN 核心 spec 生成声明 |
| `RCTModulesConformingToProtocolsProvider.*` | 收集需符合原生协议的模块 provider |
| `react/renderer/components/<name>/` | Fabric 组件的描述符、事件、props、shadow node、state 等桥接文件 |

`module` 和 `component` 生成文件会根据 `codegenConfig.type` 筛选。生成物是工具产出的 glue code，应修改 spec 或原生实现，而不是手工改 build 目录下的生成文件。

**翻页：** [上一页：050 What is Codegen?](050-WhatIsCodegen.md) · [目录](README.md) · [下一页：052 The Codegen CLI](052-TheCodegenCLI.md)
