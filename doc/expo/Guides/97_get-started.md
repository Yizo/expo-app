# Expo Modules API 入门

> 对应文档：`https://docs.expo.dev/modules/get-started.md`（页面修改日期：2026-04-28）

## 选择哪种模块形态

文档提供两条推荐路径：

1. **现有应用中的本地模块**：模块只服务当前应用，适合边开发边测试。
2. **带 example 应用的独立模块**：模块需要跨项目复用或发布到 npm。

如果目标是把 Expo Modules API 加入一个已经存在的 React Native 库，当前文档只指向另一篇集成指南，没有展开。

## 在现有 Expo 应用中创建本地模块

在含 `package.json` 的项目根目录执行：

```sh
npx create-expo-module@latest --local
```

按提示命名后，默认会创建类似结构：

```text
modules/my-module/
├── android/
├── ios/
├── src/
├── expo-module.config.json
└── index.ts
```

- `android/`、`ios/`：Kotlin 与 Swift 原生实现。
- `src/`：TypeScript API 或组件包装层。
- `expo-module.config.json`：声明模块及平台信息，供自动链接识别。
- `index.ts`：应用导入模块时使用的入口。

若项目尚无根级 `android/`、`ios/` 原生工程，执行：

```sh
npx expo prebuild --clean
```

如果已有由 prebuild 生成的 `ios/`，需要重新安装 Pods：

```sh
npx pod-install
```

应用可直接导入本地模块并调用，例如 `MyModule.hello()`。随后运行 Metro 开发服务器：

```sh
npx expo start
```

`expo start` 负责 JavaScript 开发服务，但修改 Kotlin/Swift 后仍必须在 Android Studio 或 Xcode 中重新构建原生应用。

## 编辑与验证原生代码

### Android

用 Android Studio 打开应用根目录的 `android/`，等待 Gradle 同步，编辑模块内的 `MyModule.kt`，再运行 app。每次原生代码变化都要重新 build。

### iOS

执行 `xed ios` 打开 Xcode，在 `Pods > Development Pods > MyModule` 中编辑 `MyModule.swift`，使用 Run 或 `Cmd + R` 重新构建。

新增原生文件或修改 `expo-module.config.json` 后，文档提示运行 `npx pod-install`。

## 创建可复用的独立模块

```sh
npx create-expo-module@latest my-module
cd my-module
npm run open:android
npm run open:ios
cd example
npx expo start
```

脚手架同时生成模块和 Android/iOS example 应用。模块根目录运行原生 IDE 打开命令，`example/` 中运行 Metro；修改原生代码后仍需重新构建。

Windows 可以用 Android Studio 打开 Android example，但不能打开 iOS 工程。

## 限制与坑点

- `prebuild --clean` 会重新生成原生工程；文档要求在没有原生目录时运行，但未讨论手工修改原生工程时的覆盖风险。
- Metro 热更新主要面向 JS/TS；Swift/Kotlin 变化不会靠刷新页面生效。
- iOS 的 CocoaPods 链接状态可能因新增文件或配置变化而过期。
- 本地模块与独立模块解决的问题不同，不要为了“以后可能复用”无条件增加独立包和 example 的维护成本。

## React Web 开发者易误解点

- Android Studio/Xcode 在这里不只是编辑器，而是原生构建、依赖解析和设备运行入口。
- `android/`、`ios/` 类似编译目标工程，不等同于 Web 的 `dist/`；模块代码必须被编译进应用二进制。
- `npx expo start` 类似启动开发服务器，但不能编译新加入的原生实现。
- CocoaPods 是 iOS 原生依赖管理与链接机制，可类比包管理器，但它处理的是 Xcode 原生工程依赖。

## 文档边界

**文档明确说明**：两种推荐创建路径、脚手架命令、目录形态、prebuild/Pods 条件、IDE 编辑位置以及原生修改后必须重建。

**基于文档内容推导**：只在单个应用使用时优先本地模块；需要发布、共享或独立演进时再创建独立模块。

**当前文档未涉及**：模块 API 的完整语法、自动链接原理、发布 npm 的具体流程、CI 构建和测试策略。
