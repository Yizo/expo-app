# 034｜为 React Native 库开发 Config Plugin

**翻页：**[上一页：Dangerous Mods](./033-Dangerous-Mods.md) · [目录](./README.md) · [下一页：Config Plugin 开发与调试](./035-Config-Plugin开发与调试.md)

**官方页面：**[Plugin development for libraries](https://docs.expo.dev/config-plugins/development-for-libraries/)

> 这是当前未版本化的库作者指南。页面的 `package.json` 示意使用 `expo ^56.0.0` 与 `peerDependencies.expo >=56.0.0`，和本地 Expo SDK 56 基线相符；但宽泛的 peer 范围不等于插件已在所有后续 SDK 测试通过。发布库时应按实际测试过的 Expo SDK 设定兼容范围。

## 为什么库需要 Config Plugin

React Native 库经常要求应用手工修改 `AndroidManifest.xml`、`Info.plist`、Gradle 或 Xcode 配置。把所需设置打包为 Config Plugin 后，用户只需在 Expo app config 声明插件，Prebuild 会自动生成原生修改。

这能降低库的安装门槛，也让采用 CNG、没有把 `ios/` 和 `android/` 提交进项目的团队可以正常集成原生库。

## 建议的库目录组织

```text
your-library/
  android/                 Android 原生模块
  ios/                     iOS 原生模块
  src/                     JS / TypeScript 公共 API
  plugin/
    src/
      index.ts             顶层 config plugin
      withAndroid.ts       Android 配置转换
      withIos.ts           iOS 配置转换
    build/                 编译后的插件入口
    __tests__/             插件测试
    tsconfig.json          插件专用 TypeScript 设置
  app.plugin.js            Expo CLI 插件入口
  example/                 测试用 Expo app
```

把 JS API 与原生实现、Config Plugin 分开，能让平台配置按边界测试与维护。

## 依赖与插件构建脚本

开发插件需从 `expo` 包访问 `expo/config-plugins` 类型和 API；`expo-module-scripts` 可编译插件 TypeScript，但不是必需项。Expo CLI 加载库时使用 `app.plugin.js` 指向构建目录：

```json
{
  "scripts": {
    "build": "expo-module build",
    "build:plugin": "expo-module build plugin",
    "clean": "expo-module clean",
    "test": "expo-module test",
    "prepare": "expo-module prepare",
    "prepublishOnly": "expo-module prepublishOnly"
  },
  "devDependencies": {
    "expo": "^56.0.0"
  },
  "peerDependencies": {
    "expo": ">=56.0.0"
  },
  "peerDependenciesMeta": {
    "expo": { "optional": true }
  }
}
```

上面的版本范围用于说明插件开发依赖与消费者兼容范围；实际发布时应收窄到已验证的版本。`app.plugin.js` 用 CommonJS 导出编译后的文件：

```js
module.exports = require('./plugin/build');
```

插件目录的 TypeScript 配置可继承 Expo Module Scripts 提供的 preset：

```json
{
  "extends": "expo-module-scripts/tsconfig.plugin",
  "compilerOptions": { "outDir": "build", "rootDir": "src" },
  "include": ["./src"],
  "exclude": ["**/__mocks__/*", "**/__tests__/*"]
}
```

简单本地依赖示例使用 Expo CLI 与当前包管理器安装兼容依赖，例如 `npx expo install <package>`。

## 插件公共入口与平台实现

顶层插件接收 options 后先转给 Android 修改，再转给 iOS 修改，最后返回合并后的 config：

```ts
import { type ConfigPlugin } from 'expo/config-plugins';

export type YourLibraryPluginProps = {
  customProperty?: string;
  enableFeature?: boolean;
};

const withYourLibrary: ConfigPlugin<YourLibraryPluginProps> = (config, props = {}) => {
  config = withAndroidConfiguration(config, props);
  return withIosConfiguration(config, props);
};

export default withYourLibrary;
```

Android 可用结构化 helper 在主 Application 添加元数据：

```ts
import { AndroidConfig, withAndroidManifest } from 'expo/config-plugins';

export const withAndroidConfiguration: ConfigPlugin<YourLibraryPluginProps> = (config, props) =>
  withAndroidManifest(config, config => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      'your_library_config_key',
      props.customProperty ?? 'default_value',
    );
    return config;
  });
```

iOS 则修改 Info.plist 的结构化属性：

```ts
import { withInfoPlist } from 'expo/config-plugins';

export const withIosConfiguration: ConfigPlugin<YourLibraryPluginProps> = (config, props) =>
  withInfoPlist(config, config => {
    config.modResults.YourLibraryCustomProperty = props.customProperty ?? 'default_value';
    if (props.enableFeature) config.modResults.YourLibraryFeatureEnabled = true;
    return config;
  });
```

尽可能用 Expo 提供的 `AndroidConfig` / `IOSConfig` helper，而不是直接解析原生文件文本；API helper 通常能给出更一致的错误，也较少受 XML 排版变化影响。

## 插件测试

Config Plugin 测试对象是“配置输入经过函数转换后的配置结果”，不是运行时 UI。可用 Jest 构造基础 ExpoConfig，传给插件并断言预期原生配置已加入：

```ts
import withYourLibrary from '../src';

test('writes Android plugin configuration', () => {
  const input = { name: 'test-app', slug: 'test-app', platforms: ['android', 'ios'] };
  const result = withYourLibrary(input, { customProperty: 'test-value' });

  expect(result).toBeDefined();
  expect(result.plugins).toBeDefined();
});
```

对于输入无效、文件不存在等问题，应尽早验证 options 并提供有上下文的异常；不要吞掉会导致构建配置错误的异常：

```ts
const withYourLibrary: ConfigPlugin<YourLibraryPluginProps> = (config, props = {}) => {
  try {
    validateProps(props);
    config = withAndroidConfiguration(config, props);
    return withIosConfiguration(config, props);
  } catch (error) {
    throw new Error(`Failed to configure your library: ${String(error)}`);
  }
};
```

## 不使用 `expo-module-scripts` 时

- 现有 React Native 库可将编译好的插件打包到主库，并让根 `app.plugin.js` 导出它。
- 也可将 Config Plugin 做成单独 npm 包；package.json 指定 `main: "app.plugin.js"`、发布文件列表包含入口和 build 目录，并声明 `expo` 与原生库为 peer dependency。

## 库作者最佳实践

- README 同时记录自动插件和手工原生安装步骤，方便非 CNG 项目或插件失败时处理。
- 写明可选属性、必需属性与合理默认值；尽量让插件在没有额外参数时也能工作。
- 追求幂等：第一次和重复 Prebuild 结果相同。
- 通用插件命名 `withFeatureName`；平台特定用 `withAndroid...` / `withIos...`。
- 先检查 app config 是否已有对应属性，已有时不必重复做插件。
- 按平台拆小函数；对复杂转换编写 Jest 单测，需要模拟文件系统时可以用 memfs。
- TypeScript 通常更适合编写插件，便于检查 Expo config 类型。
- 不要通过 Config Plugin 改 `sdkVersion`；这会影响 `expo install` 等命令。

## 官方代码主题覆盖

本页源代码用途均有改写示例：目录结构、包脚本与 peer dependency、插件编译入口、插件 tsconfig、主入口和 Android / iOS 实现、配置转换测试、异常处理、独立插件包入口与 best practices。页面示例的 Expo 依赖范围为 SDK 56 起，已在顶部注明其和本地基线的关系；范围声明不替代实际兼容性测试。

## 下一页

页脚 Next 指向 [Developing and debugging a plugin](https://docs.expo.dev/config-plugins/development-and-debugging/)。

**翻页：**[上一页：Dangerous Mods](./033-Dangerous-Mods.md) · [目录](./README.md) · [下一页：Config Plugin 开发与调试](./035-Config-Plugin开发与调试.md)
