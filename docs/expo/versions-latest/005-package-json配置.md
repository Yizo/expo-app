# 005｜package.json 中的 Expo 专用配置

**翻页：**[上一页：Metro 配置参考](./004-Metro配置参考.md) · [目录](./README.md) · [下一页：Expo Router API 总览](./006-Expo-Router-API总览.md)

**官方页面：**[`package.json`](https://docs.expo.dev/versions/latest/config/package-json/)

**版本提醒：**来源为 Expo SDK Latest package.json reference（访问时 SDK 57.0.0）；本地项目使用 SDK56。此页具体 Expo fields / Doctor 检查项请对照 [v56 package.json reference](https://docs.expo.dev/versions/v56.0.0/config/package-json/) 再使用。`package.json` 其他 npm 元信息遵循 Node / npm 标准格式。

## Expo 专属字段在哪里

`package.json` 的标准字段包括 name、scripts、dependencies 等；Expo 的项目工具扩展放在顶层 `expo` 下。它可以配置包版本检查例外、native autolinking 搜索目录和 Expo Doctor 行为。

## `expo.install.exclude`

`npx expo install`、`expo-doctor` 和 `expo start` 会检查若干库的版本与当前 SDK 推荐值。第三方包如果刻意固定自定义版本，可排除匹配检查：

```json
{
  "expo": {
    "install": {
      "exclude": ["expo-updates", "expo-splash-screen"]
    }
  }
}
```

排除只是跳过版本警告，不会修复实际 runtime / native 不兼容。若包实际不兼容，运行时错误仍会出现。

## `expo.autolinking`

Autolinking 是构建时扫描依赖并将原生模块连入 Android / iOS 工程的机制。若原生模块存放在自定义目录，可指定：

```json
{
  "expo": {
    "autolinking": {
      "nativeModulesDir": "./modules"
    }
  }
}
```

Autolinking 影响 Prebuild / 原生编译，修改目录后须重新生成或重建 app。

## `expo.doctor`

Expo Doctor 可以检查依赖是否出现在 React Native Directory 中，以及已存在的 `android/` / `ios/` 目录是否与 app config 同步。Latest 文档示例：

```json
{
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "enabled": true,
        "exclude": ["/internal-package/", "forked-native-lib"],
        "listUnknownPackages": true
      },
      "appConfigFieldsNotSyncedCheck": {
        "enabled": false
      }
    }
  }
}
```

`reactNativeDirectoryCheck` 能开关检查、排除包名并决定是否列出未知包。`appConfigFieldsNotSyncedCheck` 对发现已生成的原生目录但 app config 不会同步进去的情况给提醒；关掉会少一个提示，不能代表字段已同步。

## 关键名词

- **Autolinking**：自动把 npm 原生模块接入 Xcode / Gradle 工程。
- **Expo Doctor**：检查项目 SDK、依赖与原生工程配置状态的 CLI 工具。
- **Exclude / 排除**：让工具跳过某项验证；不会转变应用本身兼容性。
- **Native module directory**：项目中放自定义原生模块源码的路径。

## 官方代码主题覆盖

源页代码主题均已覆盖：`expo.install.exclude` 列表、`expo.autolinking.nativeModulesDir`、Expo Doctor 的 `reactNativeDirectoryCheck` 三项和 `appConfigFieldsNotSyncedCheck.enabled`。字段变化点按 Latest 核对，使用前需对照 SDK 56 精确参考页。

## 下一页

页脚 **Next** 指向 [Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)，进入文件路由框架的 API 参考。

**翻页：**[上一页：Metro 配置参考](./004-Metro配置参考.md) · [返回目录](./README.md) · [下一页：Expo Router API 总览](./006-Expo-Router-API总览.md)
