# 创建带 Config Plugin 的 Expo 原生模块

> 对应文档：`https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial.md`（页面修改日期：2026-03-03）

## 教程目标

本文创建 `expo-native-configuration`：Config Plugin 在 `npx expo prebuild` 时把 `apiKey` 写入 Android `AndroidManifest.xml` 和 iOS `Info.plist`，原生模块再读取该值并通过 JavaScript API 返回。

适用于普通 app config 无法表达的原生配置、资源复制或 app extension 等高级原生工程修改。对库作者而言，插件可以让使用者安装库后自动完成原生配置。

## 初始化模块与 example

```sh
npx create-expo-module expo-native-configuration
cd expo-native-configuration
```

教程删除默认视图与 Web 文件，保留只暴露 `getApiKey()` 的 Kotlin、Swift、TypeScript 实现，并在 example 的 `package.json` 中使用 `"file:.."` 依赖当前模块。

```sh
npm run build
cd example
rm -rf node_modules && npm install
npx expo run:android
npx expo run:ios
```

此时返回的还是原生代码中硬编码的 `api-key`，用于先验证模块链路。

## Plugin 与 Mod 的关系

- **Config Plugin**：接收 `ExpoConfig` 并返回修改后的 `ExpoConfig` 的同步函数，惯例以 `with` 开头。
- **Mod**：修改原生源码或 plist/xml 等文件的异步函数，在 code generation 期间执行。

关键时机区别：

- plugin 在 `expo/config` 的 `getConfig` 每次读取配置时调用。
- mod 只在 `npx expo prebuild` 的 syncing 阶段调用。

Plugin 必须同步，返回值除挂载的 mods 外必须可序列化；mods 不会在初次读取后被序列化，因此可在生成阶段执行文件修改。

## Plugin 文件结构

```text
plugin/
├── tsconfig.json
└── src/index.ts
app.plugin.js
```

`plugin/tsconfig.json` 继承 `expo-module-scripts/tsconfig.plugin`，把源码编译到 `plugin/build`。根目录 `app.plugin.js` 是 CommonJS 入口：

```js
module.exports = require('./plugin/build');
```

文档推荐但不强制使用 `expo-module-scripts`，它提供 TypeScript 与 Jest 的默认配置。

运行 `npm run build plugin` 监听编译，并在 `example/app.json` 中注册：

```json
{
  "expo": {
    "plugins": ["../app.plugin.js"]
  }
}
```

`cd example && npx expo prebuild --clean` 会执行插件。

## 写入 AndroidManifest 与 Info.plist

插件接收 `{ apiKey: string }`，组合两个 helper：

- `withInfoPlist`：向 `config.modResults` 写入 `MY_CUSTOM_API_KEY`。
- `withAndroidManifest`：取得 main application，并通过 `AndroidConfig.Manifest.addMetaDataItemToMainApplication` 添加 metadata。

应用配置传参：

```json
{
  "expo": {
    "plugins": [["../app.plugin.js", { "apiKey": "custom_secret_api" }]]
  }
}
```

再次执行 `npx expo prebuild --clean` 后，可在生成的 Manifest 与 Info.plist 中验证键值。

## 原生模块读取配置

Android 通过 `packageManager.getApplicationInfo(..., PackageManager.GET_META_DATA)` 读取 application metadata，再取 `MY_CUSTOM_API_KEY`。

iOS 通过：

```swift
Bundle.main.object(forInfoDictionaryKey: "MY_CUSTOM_API_KEY") as? String
```

最终运行：

```sh
cd example
npx expo prebuild
npx expo run:android
npx expo run:ios
```

## 限制与坑点

- 修改 plugin TypeScript 后要确保 `plugin/build` 已更新，否则 `app.plugin.js` 仍加载旧产物。
- plugin 与 mod 的同步/异步和执行时机不同，不能把依赖原生文件的逻辑放在普通 plugin 读取阶段。
- 原生配置变化需要重新 prebuild 并重新构建应用，不能靠 JavaScript 刷新生效。
- 教程把示例值命名为 API key，但没有说明密钥安全；写入 Manifest/Info.plist 的值会进入应用包，不应视为秘密存储。
- `--clean` 重新生成工程，当前页面未讨论已有手工原生修改的保留策略。

## React Web 开发者易误解点

- Config Plugin 更接近构建期 AST/配置转换器，不是在应用运行时执行的 React 插件。
- `app.json` 的插件参数最终被固化进原生工程，不是浏览器式动态环境变量。
- AndroidManifest 和 Info.plist 是平台级应用配置，类似 Web manifest 与部署配置的结合，但能控制更多系统行为。

## 文档边界

**文档明确说明**：模块脚手架、plugin/mod 定义和时机、文件结构、两端配置注入、原生读取方法与运行命令。

**基于文档内容推导**：适合把安装库所需的确定性原生修改封装进插件，让使用者通过 app config 声明参数，而不是手工编辑生成工程。

**当前文档未涉及**：敏感值管理、插件参数校验、冲突合并、幂等性测试、版本迁移和 EAS Secrets。
