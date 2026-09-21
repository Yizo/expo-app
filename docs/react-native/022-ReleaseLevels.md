# 022 Release Levels

**翻页：** [上一页：021 Strict TypeScript API](021-StrictTypeScriptAPI.md) · [目录](README.md) · [下一页：023 升级到新版本（Upgrading to New Versions）](023-升级到新版本.md)

**官方页面：** [Release Levels · React Native](https://reactnative.dev/docs/release-levels)  
**源页代码覆盖：** Android 新架构入口中的 `releaseLevel` 与 `load()` 顺序，iOS Objective-C / Swift `RCTReactNativeFactory` 初始化参数。

## 什么是 release level

Release level（发布级别）让 RN 应用在稳定发布包含之前试用接近完成的新特性。它会在应用初始化时选择一组 **Feature Flags（功能开关）**，可选 `STABLE`、`CANARY` 或 `EXPERIMENTAL`。

这些级别不是换 React/React Native 包版本，也不是 npm 的 `@canary` 或 `@experimental` 标签。即使 RN 当前安装的是 nightly 包，应用仍通过初始化配置选择特性标志；切到 CANARY/EXPERIMENTAL 也不会自动安装 `react@canary`。

## 何时使用

| 级别 | 适用情况 |
|---|---|
| `STABLE` | 生产应用和不需要提前试用特性的库；stable/nightly 默认均为此级别 |
| `CANARY` | 框架作者或高级开发者，提前测试/采用接近发布的新功能；不推荐用户生产应用 |
| `EXPERIMENTAL` | 早期试验与反馈；不推荐生产或面向用户的应用 |

## 在原生入口选择级别

Android 通过 `DefaultNewArchitectureEntryPoint.releaseLevel` 设置级别，然后初始化新架构入口。选择值要早于 `load()`：

```kotlin
DefaultNewArchitectureEntryPoint.releaseLevel = ReleaseLevel.CANARY
DefaultNewArchitectureEntryPoint.load()
```

iOS 在 `RCTReactNativeFactory` 创建时传 level。官方分别展示 Objective-C 和 Swift 写法：

```objc
RCTReactNativeFactory *factory =
  [[RCTReactNativeFactory alloc] initWithDelegate:delegate releaseLevel:Canary];
```

```swift
let factory = RCTReactNativeFactory(
  delegate: delegate,
  releaseLevel: RCTReleaseLevel.Canary
)
```

同一个 App 实例只能有一个 release level；若创建多个 level 不同的 factory，RN 会触发崩溃。多数应用用默认稳定级别即可。

**翻页：** [上一页：021 Strict TypeScript API](021-StrictTypeScriptAPI.md) · [目录](README.md) · [下一页：023 升级到新版本（Upgrading to New Versions）](023-升级到新版本.md)
