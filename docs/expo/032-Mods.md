# 032｜Config Plugin 的 Mods

**翻页：**[上一页：创建 Config Plugin](./031-创建Config-Plugin.md) · [目录](./README.md) · [下一页：Dangerous Mods](./033-Dangerous-Mods.md)

**官方页面：**[Mods](https://docs.expo.dev/config-plugins/mods/)

> 此页是 Expo 的未版本化 Config Plugin 概念说明。CNG 中 Mods 的作用是 Prebuild 阶段写入 iOS / Android 原生目录；SDK 56 的版本基线见 [v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)，而具体 mod 导出与类型应以项目依赖为准。

## Mod 与 Mod Plugin 的关系

**Mod** 是 Prebuild 编译过程里的一类原生文件修改任务；它可以读入平台文件，把结构化 `modResults` 交给配置逻辑更新，再把结果写回原生目录。

**Mod Plugin** 是 `expo/config-plugins` 提供的封装 API，屏蔽了底层读写文件细节。开发 config plugin 时优先用这些封装器，而不是直接操作 `mods.android.*` 或 `mods.ios.*`。

## 常用 Mod Plugin

### Android

| Mod Plugin | 修改目标 |
| --- | --- |
| `withAndroidManifest` | `AndroidManifest.xml`（解析为对象后修改）。 |
| `withStringsXml` | Android `strings.xml`。 |
| `withAndroidColors` | 默认颜色资源 XML。 |
| `withAndroidColorsNight` | Android 夜间模式颜色资源。 |
| `withAndroidStyles` | Android `styles.xml`。 |
| `withGradleProperties` | `android/gradle.properties`。 |
| `withMainActivity` | Java / Kotlin MainActivity 源文件。 |
| `withMainApplication` | Java / Kotlin MainApplication 源文件。 |
| `withAppBuildGradle` | `android/app/build.gradle`。 |
| `withProjectBuildGradle` | `android/build.gradle`。 |
| `withSettingsGradle` | `android/settings.gradle`。 |

### iOS

| Mod Plugin | 修改目标 |
| --- | --- |
| `withInfoPlist` | iOS `Info.plist` 的结构化键值。 |
| `withEntitlementsPlist` | 应用 `.entitlements` 文件。 |
| `withExpoPlist` | Expo Updates 等设置用的 `Expo.plist`。 |
| `withXcodeProject` | Xcode 项目对象 / 构建设置。 |
| `withPodfile` | `Podfile` 文本。 |
| `withPodfileProperties` | `Podfile.properties.json`。 |
| `withAppDelegate` | iOS AppDelegate 源文件。 |

## Mod 执行时拿到什么

Mod 插件会收到 `config`，其中包括：

- **`modResults`**：要修改的数据，类型依 mod 而异；例如 Manifest JSON、Info.plist 对象或 Gradle 文件字符串。
- **`modRequest`**：当前项目路径与阶段信息，例如项目根目录、平台原生目录、mod 名、目标平台；iOS 时也可能有 Xcode project name。

Mods 在 `expo prebuild` 原生目录同步阶段才会运行；它们不会作为普通应用数据写进 Expo Updates manifest。若只查询 app config、不生成原生项目，mod 文件操作不会发生。

## 自定义 Mod 示例：改 iOS 产品名

下面示例用 `withXcodeProject` 包装器修改 Xcode 项目中的 product name；无需自行读写 `.pbxproj` 文件：

```ts
import { ConfigPlugin, IOSConfig, withXcodeProject } from 'expo/config-plugins';

const withCustomProductName: ConfigPlugin<string> = (config, customName) =>
  withXcodeProject(config, config => {
    config.modResults = IOSConfig.Name.setProductName(
      { name: customName },
      config.modResults,
    );
    return config;
  });

export default withCustomProductName;
```

由自定义原生文件名或路径拼成的特殊需求，可能需要自定义 Mod；若已有官方 Mod Plugin 能实现，应优先使用它。

## 插件放在哪里

### 应用内本地插件

可以在 app 内维护一个 `.js` / `.ts` 文件，从动态 app config import；也可以在动态 `plugins` 数组里内联配置小函数。内联方式适合测试或极简单场景。写成函数时，序列化 app config 会把函数替换成其名称。

```ts
const withCustom = (config, options) => config;

export default {
  name: 'my app',
  plugins: [
    [withCustom, { mode: 'demo' }],
    withCustom,
  ],
};
```

### 单独发布的插件包

可把可复用插件发布成 npm 包：如果包根目录有 `app.plugin.js`，Expo 首先用它；否则解析 `package.json` 的 `main` 入口。官方不建议直接 import 包的内部构建文件，因为绕过标准解析顺序，升级时可能失效。

`app.plugin.js` 是推荐入口，因为配置插件在 Node.js 环境执行，与 app 运行时代码可能需要不同的转译方式。该入口可以使用 Node 支持的 CommonJS 写法。

## 关键名词

- **Mod**：Prebuild 阶段执行的一次原生文件读写任务。
- **Mod Plugin**：由 `expo/config-plugins` 提供、便于读取和修改原生配置的封装函数。
- **`modResults`**：mod 当前文件的解析内容；修改后要返回新的 config。
- **`modRequest`**：当前 Prebuild 工程、平台与 mod 上下文。
- **`app.plugin.js`**：可复用 Config Plugin npm 包的推荐入口文件。

## 官方代码主题覆盖

本页源代码主题均有覆盖：本地 `mods` 配置形状、`withXcodeProject` 和 `IOSConfig` 修改、动态插件函数写法、包解析顺序，以及常用 Android / iOS Mod Plugin 列表。Mod / Mod Plugin 的生命周期和 `modResults` / `modRequest` 概念也已说明。

## 下一页

页脚 Next 指向 [Using a dangerous mod](https://docs.expo.dev/config-plugins/dangerous-mods/)。

**翻页：**[上一页：创建 Config Plugin](./031-创建Config-Plugin.md) · [目录](./README.md) · [下一页：Dangerous Mods](./033-Dangerous-Mods.md)
