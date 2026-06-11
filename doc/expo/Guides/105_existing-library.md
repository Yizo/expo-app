# 在现有 React Native 库中集成 Expo Modules API

> 对应文档：`https://docs.expo.dev/modules/existing-library.md`（页面修改日期：2026-05-23）

## 适用场景

当已有 React Native 库需要渐进式改写为 Expo Modules API，或希望使用 Android lifecycle listeners、iOS AppDelegate subscribers 自动完成初始化时，可以在不重建整个库的前提下接入 Expo Modules API。

本文只完成最小接入：让 Expo Autolinking 识别库、添加原生依赖、注册 Swift/Kotlin Module，并从 JavaScript 加载。

## 1. 创建模块配置文件

在库根目录创建 `expo-module.config.json`，初始内容为：

```json
{}
```

此文件是 Expo Autolinking 把该库识别为 Expo module 的必要标记，后续再加入平台模块类。

## 2. 添加原生依赖

Android 的 `build.gradle`：

```groovy
dependencies {
  implementation project(':expo-modules-core')
}
```

iOS 的 podspec：

```ruby
Pod::Spec.new do |s|
  s.dependency 'ExpoModulesCore'
end
```

这些依赖让 Kotlin/Swift 源码能够引用 Expo Modules Core。

## 3. 配置 JavaScript 包依赖

```json
{
  "devDependencies": {
    "expo-modules-core": "^X.Y.Z"
  },
  "peerDependencies": {
    "expo": "*"
  },
  "peerDependenciesMeta": {
    "expo": {
      "optional": true
    }
  }
}
```

文档建议：

- `expo` 放入 peer dependency，并使用 `*`，避免在使用者 `node_modules` 中安装重复 Expo 包。
- 将该 peer 标为 optional。
- `expo-modules-core` 只作为 dev dependency，供库开发和类型/构建使用；消费项目中的兼容 core 已由其 Expo SDK 对应的 `expo` 包提供。

## 4. 创建并注册原生 Module

Kotlin 类继承 `expo.modules.kotlin.modules.Module`，Swift 类继承 `ExpoModulesCore.Module`，两者都在 `definition()` 中声明功能。

在 `expo-module.config.json` 注册：

```json
{
  "ios": {
    "modules": ["MyModule"]
  },
  "android": {
    "modules": ["my.module.package.MyModule"]
  }
}
```

iOS 使用类名，Android 使用含 package 的完整类名。Expo Autolinking 会把这些类链接到使用者项目。

## 5. 验证链接并从 JavaScript 加载

- Android：模块类在构建前由 Gradle task 自动链接。
- iOS：新增类后需要运行 `pod install`。

建议创建单独文件封装加载：

```ts
import { requireNativeModule } from 'expo-modules-core';

export default requireNativeModule('MyModule');
```

其中字符串名称必须与原生模块定义中的名称一致。完成链接后，再逐步实现实际方法、属性、事件或生命周期能力。

## 限制与坑点

- 缺少根级 `expo-module.config.json` 时，Expo Autolinking 不会把库识别为 Expo module。
- Android 配置要求完整限定类名；iOS 只写类名，不能机械复制同一种格式。
- iOS 添加模块类后必须更新 Pods，否则 example 可能仍找不到实现。
- peer dependency 使用 `*` 是文档为避免重复包给出的建议，不代表模块自动兼容所有 Expo SDK；当前页面未讨论 API 版本兼容。
- 此流程允许渐进集成，但不会自动迁移原有 React Native bridge/Turbo Module 实现。

## React Web 开发者易误解点

- `peerDependencies` 在这里不仅影响 npm 警告，还关系到宿主提供哪一版原生 core，避免同一原生运行时出现重复版本。
- Autolinking 不等于 JavaScript 自动 import；它负责把原生类纳入 Gradle/Xcode，JS 仍需 `requireNativeModule` 获取对象。
- podspec 和 Gradle 配置是库发布契约的一部分，类似 package metadata，但直接影响原生编译链接。

## 实践建议与边界

**文档明确说明**：接入动机、配置文件要求、Gradle/podspec 依赖、package.json 依赖策略、模块模板、平台注册格式和链接步骤。

**基于文档内容推导**：渐进迁移时可先建立最小空 Module 和 example 链接验证，再逐项把旧能力移入 Expo Module，降低一次性重写风险。

**当前文档未涉及**：旧架构代码共存细节、生命周期 listener 的实际实现、版本兼容测试、发布流程、Web 支持和迁移完成后的清理步骤。

<!-- NAVIGATION START -->
---
[← 上一页：用 Expo Modules API 包装第三方原生库](./104_third-party-library.md) | [下一页：为 Expo 模块增加 macOS 与 tvOS 支持 →](./106_additional-platform-support.md)
<!-- NAVIGATION END -->
