# `expo-module.config.json` 配置参考

## 文件作用

Expo module 使用根目录下的 `expo-module.config.json` 配置自动链接和模块注册。它是给 Expo 原生构建工具读取的模块清单，不是应用运行时配置。

## 顶层字段

### `platforms`

支持平台数组。允许值：

- `android`
- `apple`，或更细的 `ios`、`macos`、`tvos`
- `web`
- `devtools`

如果当前构建平台不在数组中，自动链接会跳过该模块。

### `apple`

Apple 平台专属配置：

- `modules`：Swift 原生模块类名，写入生成的 modules provider。
- `appDelegateSubscribers`：挂接 `ExpoAppDelegate`、接收 AppDelegate 生命周期事件的 Swift 类名。

### `android`

Android 平台专属配置：

- `modules`：Kotlin 原生模块的完整类名，必须包含 package 和 class，写入生成的 package provider。

## 示例

```json
{
  "platforms": ["apple", "android"],
  "apple": {
    "modules": ["MyModule"],
    "appDelegateSubscribers": ["MyAppDelegateSubscriber"]
  },
  "android": {
    "modules": ["expo.modules.mylib.MyModule"]
  }
}
```

## React Web 开发者易误解点

- `platforms` 是构建/链接声明，不等同于 TypeScript 条件导出。
- Apple `modules` 使用 Swift 类名；Android 必须写包限定名。
- `appDelegateSubscribers` 不是 JavaScript 事件订阅列表，而是 iOS 原生生命周期接入类。
- 配置写对只代表类会被注册；类本身仍须存在并能在对应平台编译。

## 建议与信息边界

- **基于文档内容推导：** `platforms` 只声明真实实现的平台，避免链接不存在的原生代码。
- **基于文档内容推导：** 类重命名或移动 Kotlin package 时同步更新配置，否则生成 provider 会引用错误名称。
- 当前文档仅列出这些字段，未涉及 schema、默认值、校验命令、Web/devtools 的进一步配置、配置继承或完整示例工程。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Modules Shared Objects](./113_shared-objects.md) | [下一页：在 Expo Modules 中 Mock 原生调用 →](./115_mocking.md)
<!-- NAVIGATION END -->
