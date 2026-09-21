# 049 Using Hermes

**翻页：** [上一页：048 Timers](048-Timers.md) · [目录](README.md) · [下一页：050 What is Codegen?](050-WhatIsCodegen.md)

**官方页面：** [Using Hermes · React Native](https://reactnative.dev/docs/hermes)  
**源页代码覆盖：** `global.HermesInternal` 检查示例、Android/iOS npm/Yarn Release 构建命令、非标准 bundle 加载时检查 `.hbc` bytecode 的提示。

## Hermes 是什么

Hermes 是开源 JavaScript 引擎，为 React Native 应用优化。官方表示，对很多 App，和 JavaScriptCore 相比 Hermes 能改善启动时间、减少内存占用与包体。RN 默认使用 Hermes，不需要额外开关。

RN 发布包会附带与该 RN 版本兼容的 Hermes 版本；升级 RN 时由对应模板/依赖选择配套引擎。

## 确认运行时和 bytecode

JS 中可检查 `global.HermesInternal` 是否存在：

```ts
const isHermesEnabled = () => Boolean(global.HermesInternal);
```

但如果工程使用非标准方式装载 bundle，这个标志存在也不代表正在加载优化的预编译 bytecode。确认 bundle 输出为 `.hbc`，并通过 Release 构建在目标设备测启动时间和内存；不要只用开发模式测对比。

## 构建 Release 验证

官方给出的命令以 Release 模式构建 Android/iOS 应用：

```sh
# Android
npm run android -- --mode="release"
# 或
yarn android --mode release

# iOS
npm run ios -- --mode="Release"
# 或
yarn ios --mode Release
```

Release 构建会在打包阶段生成 Hermes Bytecode。若工程使用 Expo 或不同的 RN CLI 模板，按该项目命令和 EAS/原生构建配置进行设备基准测试。

## 切换回 JavaScriptCore

React Native 仍支持 JavaScriptCore。官方页面把退出 Hermes 的具体步骤指向 Community 配置仓库，因为它涉及 Android/iOS 构建配置。除非已验证某个引擎兼容问题并了解包体/启动的影响，否则保留模板默认 Hermes 更简单。

**翻页：** [上一页：048 Timers](048-Timers.md) · [目录](README.md) · [下一页：050 What is Codegen?](050-WhatIsCodegen.md)
