# 035｜Config Plugin 开发与调试

**翻页：**[上一页：为库开发 Config Plugin](./034-为库开发Config-Plugin.md) · [目录](./README.md) · [下一页：patch-project](./036-patch-project.md)

**官方页面：**[Developing and debugging a plugin](https://docs.expo.dev/config-plugins/development-and-debugging/)

**SDK 版本差异：**本页是未版本化指南，但官方 `package.json` 示例当前明确以 `expo ^57.0.0` 开发插件，并声明 `peerDependencies.expo >=57.0.0`。本地项目为 Expo `~56.0.11`，因此保留此示例来说明官方当前的开发依赖 / peer 范围写法，不将它作为 SDK 56 兼容承诺。若要为 SDK 56 开发或使用插件，应以 SDK 56 项目验证后再调整依赖范围。

## 插件开发依赖与 API 入口

库作者可以在开发依赖中使用 Expo 57 类型 / 工具，并把 Expo 声明为 optional peer dependency：

```json
{
  "devDependencies": { "expo": "^57.0.0" },
  "peerDependencies": { "expo": ">=57.0.0" },
  "peerDependenciesMeta": { "expo": { "optional": true } }
}
```

`expo-module-scripts` 可以辅助编译和测试插件，但不是所有简单插件的必需品。`expo/config-plugins` 和 `expo/config` 都从当前 `expo` 包重新导出；建议始终通过它们导入，让用户实际安装的 Expo SDK 决定所用 API 版本。

```ts
import { withAndroidManifest, type ConfigPlugin } from 'expo/config-plugins';
import { type ExpoConfig, type ConfigContext } from 'expo/config';
```

避免单独依赖另一个版本的 config plugin 包或 `expo/config-types`，否则可能和使用者包管理器最终解析出的 Expo 版本不一致。

## 插件参数与版本兼容

Plugin options 必须是 JSON 可序列化的静态值：布尔、数字、字符串、null、数组或对象；不能包含函数或 Promise。给参数提供合适默认值，能减少调用方必须填写的选项，也能让 `expo install`、VS Code 插件等工具较容易检查配置。

Expo Prebuild 针对项目 SDK 的模板生成原生工程。只用结构化静态修改的插件通常较容易跨 SDK；如果依赖正则修改原生源代码，应记录并测试支持的 SDK 范围，因为模板会随 React Native、Android、iOS 版本演进。

## 让 Mod 安全且快速

- 尽量用结构化 Mod Plugin，而不是手写正则改 Android / iOS 源码。
- Mod 里不要做网络请求、安装 Node 依赖或等待交互式终端输入。
- 新建、移动、删除原生文件的操作只放在 Dangerous Mod 中，否则可能打断 introspection。
- 复用 Expo 内置 Mod Plugin 与其 XML / plist 解析器，减少同一文件被重复读取和格式变更造成的差异。

## 调试工具与 Playground

Expo Tools VS Code 扩展可以检查 config plugin 并显示错误提示。插件代码简单时可直接在库中开发；需要 TypeScript / Jest 测试时，官方建议建一个 monorepo playground，在 example app 中像已发布 npm 包一样消费库。

不准备建 monorepo 时，可以把库打成 tarball，放入测试 app 的 `dependencies`，在 `app.json` 注册插件；修改后增加包版本、重新打包并重装。

## AndroidManifest：先试静态 Manifest 合并

库若只需固定权限，可优先使用 Android Manifest merging，让构建阶段合并 `<uses-permission>`；这比用户必须运行 Prebuild 才写入权限更简单。不过静态合并内容不能通过 config introspection 预览。

需要插件时，优先用 Expo helper：

```ts
import { AndroidConfig, withAndroidManifest } from 'expo/config-plugins';

const withMyCustomConfig: ConfigPlugin = config =>
  withAndroidManifest(config, config => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      'my-app-id-key',
      'my-app-id',
    );
    return config;
  });
```

这些 helper 能统一处理主 Application 节点及原生配置格式。

## iOS Info.plist 与 Podfile

`withInfoPlist` 会读取并合并现有 `Info.plist`，避免简单 app config 值覆盖插件配置：

```ts
const withAdIdentifier: ConfigPlugin<string> = (config, id) =>
  withInfoPlist(config, config => {
    config.modResults.GADApplicationIdentifier = id;
    return config;
  });
```

Podfile 是 Ruby 文件，通常不应通过正则直接改写；优先利用 Expo Autolinking hook。确有需要设置静态值时，可写入 `ios/Podfile.properties.json`，并让模板 Podfile 读取该键值。

## 只运行一次的插件与 `pluginHistory`

若插件被库作为自动插件注册，使用 `createRunOncePlugin` 绑定包名和版本，避免同一插件重复运行：

```ts
import { createRunOncePlugin, type ConfigPlugin } from 'expo/config-plugins';

const pkg = require('my-cool-plugin/package.json');
const withMyCoolPlugin: ConfigPlugin = config => config;

export default createRunOncePlugin(withMyCoolPlugin, pkg.name, pkg.version);
```

使用 `expo config --type prebuild` 可以查看 `_internal.pluginHistory`，检查插件来源和版本；尽量避免 `UNVERSIONED` 遗留插件，因为它可能不适配当前 native code。

## Android 启动早期配置：生命周期 Listener

有些原生设置必须在 JS 引擎启动前生效。例如初始化 Activity 时读取静态 XML 值，推荐用 Expo Module 的 `ReactActivityLifecycleListener` 加 `withStringsXml`，而不是危险地用正则改 MainActivity。

结构如下：

```kotlin
class CustomPackage : BasePackage() {
  override fun createReactActivityLifecycleListeners(context: Context) =
    listOf(CustomActivityListener(context))
}

class CustomActivityListener(private val context: Context) : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    val value = context.getString(R.string.expo_custom_value)
    // 在 JavaScript 引擎启动前使用 value 初始化原生 Activity。
  }
}
```

库提供一个默认空的字符串值，插件将 app 端传入值安全写入：

```ts
const withCustom: ConfigPlugin<string> = (config, value) =>
  withStringsXml(config, config => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'expo_custom_value', translatable: 'false' }, _: value }],
      config.modResults,
    );
    return config;
  });
```

app 的 `app.json` 可配置插件参数：

```json
{
  "expo": {
    "plugins": [["expo-custom", "I Love Expo"]]
  }
}
```

## 调试与 Introspection

启用 `EXPO_DEBUG=1` 可打印插件调用栈及 Mod 顺序；`EXPO_CONFIG_PLUGIN_VERBOSE_ERRORS` 用于显示更详细的插件解析错误。以下命令分别运行完整 Prebuild 或只查看插件作用后的 config：

```sh
EXPO_DEBUG=1 npx expo prebuild
npx expo config --type prebuild
npx expo config --type introspect
```

Introspection 只求值支持的安全静态修改，并不写原生文件。它支持 Manifest、`gradleProperties`、Strings、Colors、Styles、InfoPlist、Entitlements、ExpoPlist 和 PodfileProperties 等；通常不适用于 Dangerous Mods / 文件系统修改。

## 采用静态值代替文本修改

- Gradle 值放在 `gradle.properties`，例如 `expo.react.jsEngine=hermes`，再用 Gradle `findProperty(...)` 读取，不改写 build.gradle 文本。
- iOS AppDelegate 事件优先用 AppDelegate Subscribers，而不是 `withAppDelegate` 插入源码。
- Podfile 需要的值优先写 `Podfile.properties.json`，再由 Podfile 读取，不用正则匹配 Ruby 文本。
- 自定义原生文件需要让 Prebuild 接管时，可扩展 Base Mod；这是进阶用法，应注意平台路径和代码生成阶段。

## 官方代码主题覆盖

本页代码主题均已用改写示例覆盖：源页当前 package.json 的 SDK 57 开发 / peer 约束、`expo/config-*` 导入、静态插件 options、Manifest / Info.plist helper、`createRunOncePlugin`、Android lifecycle Listener / Strings XML、debug 与 introspection 命令、Gradle 属性读法，以及 Podfile / AppDelegate 替代方案。SDK 57 的约束只代表未版本化源页当前示例，不代表本地 SDK 56 项目的依赖建议。

## 下一页

页脚 Next 指向 [Using patch-project](https://docs.expo.dev/config-plugins/patch-project/)。

**翻页：**[上一页：为库开发 Config Plugin](./034-为库开发Config-Plugin.md) · [目录](./README.md) · [下一页：patch-project](./036-patch-project.md)
