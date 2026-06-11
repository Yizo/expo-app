# 创建持久化设置的 Expo 原生模块

> 对应文档：`https://docs.expo.dev/modules/native-module-tutorial.md`（页面修改日期：2026-05-22）

## 目标与场景

教程创建 `expo-settings`：在 Android 使用 `SharedPreferences`、iOS 使用 `UserDefaults` 持久化用户主题，并通过事件让 React 状态立即响应变化。合法主题被限制为 `system`、`light`、`dark`。

Web 可用 `localStorage` 实现同类能力，但当前教程明确不覆盖 Web 实现。

## 初始化与清理

```sh
npx create-expo-module expo-settings
cd expo-settings
```

教程删除默认生成但不需要的原生视图和 Web 文件，只保留原生模块、TypeScript 接口与 example。核心文件职责如下：

- `android/.../ExpoSettingsModule.kt`：Android 实现。
- `ios/ExpoSettingsModule.swift`：iOS 实现。
- `src/ExpoSettings.types.ts`：事件和主题类型。
- `src/ExpoSettingsModule.ts`：加载 JSI 原生模块并声明接口。
- `src/index.ts`：对使用者公开稳定的函数 API。
- `example/App.tsx`：验证模块。

先启动模块 TypeScript 编译监听，再运行 example：

```sh
npm run build
cd example
npx expo run:android
npx expo run:ios
```

## 原生读写与持久化

模块在两端都注册为 `ExpoSettings`，并暴露同步 `setTheme`、`getTheme`。

### Android

`appContext.reactContext` 提供 Android `Context`。模块用应用包名加 `.settings` 作为 `SharedPreferences` 文件名，以 `theme` 为键：

```kotlin
Function("setTheme") { theme: String ->
  getPreferences().edit().putString("theme", theme).commit()
}

Function("getTheme") {
  return@Function getPreferences().getString("theme", "system")
}
```

### iOS

使用进程标准 `UserDefaults`：

```swift
Function("setTheme") { (theme: String) -> Void in
  UserDefaults.standard.set(theme, forKey: "theme")
}

Function("getTheme") { () -> String in
  UserDefaults.standard.string(forKey: "theme") ?? "system"
}
```

TypeScript 通过 `requireNativeModule<ExpoSettingsModule>('ExpoSettings')` 从 JSI 加载同名原生对象，再由 `src/index.ts` 包装公开函数。

## 为什么设置后界面没有立即变化

仅调用 `Settings.setTheme()` 会改变原生存储，但不会自动改变 React state，也不会触发组件重新渲染。教程随后增加事件通道：

1. Android/iOS 模块声明 `Events("onChangeTheme")`。
2. `setTheme` 写入后调用 `sendEvent`，负载为 `{ theme }`。
3. TypeScript 声明 `onChangeTheme` 类型并用 `addListener` 订阅。
4. React 组件在 `useEffect` 中订阅，收到事件后调用 `setTheme` 更新 state。
5. effect 清理函数调用 `subscription.remove()`。

Android 事件负载使用 `Bundle`/`bundleOf`，iOS 使用字典。JS 层获得统一对象。

## 用枚举约束跨语言参数

只声明 `string` 会允许任意值。教程在三层统一约束：

- Kotlin：`enum class Theme(...) : Enumerable`。
- Swift：`enum Theme: String, Enumerable`。
- TypeScript：`type Theme = 'light' | 'dark' | 'system'`。

这同时提供编译期与运行时保护。TypeScript 会拒绝非法字面量；即使绕过类型检查，原生参数转换仍会抛出 `EnumNoSuchValueException`。

## 关键坑点

- 原生存储更新不等于 React UI 更新；必须建立事件或其他状态同步机制。
- `Name("ExpoSettings")` 必须与 `requireNativeModule('ExpoSettings')` 一致。
- Android 的 `reactContext` 被 `requireNotNull` 获取；教程未讨论上下文尚未就绪时的替代处理。
- 教程使用同步 `Function` 和 Android `commit()`；当前文档未比较异步写入或线程影响。
- TypeScript 类型只是第一层保护，跨 JSI 的运行时类型转换仍然重要。

## React Web 开发者易误解点

- `SharedPreferences`/`UserDefaults` 类似简单键值持久化，而不是 React state，也不是浏览器可观察的 `localStorage` 事件模型。
- 原生事件订阅更像连接外部事件源；必须手动取消订阅，避免泄漏或重复监听。
- 同一 API 要在 Kotlin、Swift、TypeScript 三处保持名称和类型一致。

## 实践建议与边界

**文档明确说明**：脚手架与运行步骤、两端持久化实现、事件通知链路、枚举类型约束，以及非法枚举值的运行时错误。

**基于文档内容推导**：把 `src/index.ts` 作为公开 API 边界，可减少使用者依赖原生对象细节；涉及可变原生状态时，应同时设计读取、写入和通知机制。

**基于经验建议**：生产模块还应考虑写入失败、线程、迁移、测试和多个调用方竞争，但这些不属于当前教程内容。

**当前文档未涉及**：Web 实现、异步 API、错误恢复、数据迁移、安全存储和自动化测试。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Modules API 入门](./97_get-started.md) | [下一页：创建 Expo 原生视图：封装系统 WebView →](./99_native-view-tutorial.md)
<!-- NAVIGATION END -->
