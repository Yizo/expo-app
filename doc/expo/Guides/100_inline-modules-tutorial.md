# 在 Expo 应用内创建 Inline Module

> 对应文档：`https://docs.expo.dev/modules/inline-modules-tutorial.md`（页面修改日期：2026-05-15）

## 能解决什么问题

Inline Module 允许把 Kotlin/Swift 文件直接放在 Expo 应用目录中，不创建独立 package，也不运行 `create-expo-module`。适合能力只属于当前应用、希望减少模块脚手架的场景。

> Inline Module 从 Expo SDK 56 起可用，目前是实验性功能，API 可能发生破坏性变化。

## 启用目录监听

在 app config 中配置：

```json
{
  "expo": {
    "experiments": {
      "inlineModules": {
        "watchedDirectories": ["app"]
      }
    }
  }
}
```

定义 `expo.experiments.inlineModules` 会启用该能力，`watchedDirectories` 指定 Expo 到哪些目录发现内联原生文件。文档提醒并非所有目录都允许，但当前页面没有列出完整规则。

随后生成带内联模块设置的原生工程：

```sh
npx expo prebuild
```

## 创建常量模块

在 `app/` 下分别创建 `FirstInlineModule.kt` 与 `FirstInlineModule.swift`。两端都定义 `FirstInlineModule`，通过 `Constant("Hello")` 返回平台字符串。

TypeScript 侧直接加载：

```tsx
import { requireNativeModule } from 'expo';

const FirstInlineModule = requireNativeModule('FirstInlineModule');
```

然后通过 `FirstInlineModule.Hello` 使用常量。构建运行：

```sh
npx expo run:android
npx expo run:ios
```

这里仍是原生代码编译，不会仅靠 Metro 刷新生效。

## 创建内联原生视图

教程在 `app/` 下增加 `FirstInlineView.kt` 与 `FirstInlineView.swift`，实现一个系统 WebView：

- Module 的 `View(...)` 定义公开 `url` prop 和 `onLoad` 事件。
- Android 视图继承 `ExpoView`，创建 `android.webkit.WebView`，用 `MATCH_PARENT` 铺满，并在 `onPageFinished` 派发事件。
- iOS 视图继承 `ExpoView` 并实现 `WKNavigationDelegate`，在 `layoutSubviews` 中同步 frame，在加载完成回调中派发事件。

TypeScript 使用：

```tsx
import { requireNativeView } from 'expo';

const FirstInlineView = requireNativeView('FirstInlineView');
```

之后可像 React 组件一样传入 `style` 和 `url`。

## 与标准 Expo Module 的区别

| 维度 | Inline Module | 标准模块 |
| --- | --- | --- |
| 位置 | 应用的 watched directory | 独立模块目录/package |
| 脚手架 | 不需要 `create-expo-module` | 通常由脚手架生成 |
| 发现方式 | Expo 自动扫描配置目录 | 模块配置与自动链接 |
| 复用定位 | 当前应用内部 | 可独立复用或发布 |
| 稳定性 | SDK 56 起实验性 | 当前文档未标为实验性 |

## 限制与坑点

- 实验 API 可能破坏性变化，不应把当前形态视为长期稳定契约。
- 必须正确配置 watched directory 并运行 prebuild。
- Kotlin/Swift 文件的类名与 `requireNativeModule`/`requireNativeView` 名称必须对应。
- 示例没有为 `requireNativeModule` 和 `requireNativeView` 提供 TypeScript 泛型，因此直接结果缺少可靠类型；当前页面未解决这一点。
- iOS 与 Android 仍需分别实现，Inline 只减少包结构，不会消除平台差异。

## React Web 开发者易误解点

- “与 app 代码放一起”不表示原生文件能由 JavaScript bundler 编译，它们仍进入 Xcode/Gradle 构建。
- 自动发现类似约定式模块加载，但最终产物是原生二进制的一部分。
- 同名模块在两端提供统一 JS 入口，但内部实现并不是同一份代码。

## 文档边界

**文档明确说明**：SDK 56 起的实验状态、app config 配置、prebuild、常量模块、原生 WebView 以及 JS 加载方式。

**基于文档内容推导**：只服务单个应用且能接受实验性变更时，Inline Module 能降低目录和 package 管理成本；需要跨项目发布时不适合作为默认方案。

**当前文档未涉及**：允许监听目录的完整清单、生产迁移策略、自动类型生成、测试和发布复用方式。
