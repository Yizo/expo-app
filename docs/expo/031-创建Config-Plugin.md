# 031｜创建和使用 Config Plugin

**翻页：**[上一页：Config Plugin 简介](./030-Config-Plugins简介.md) · [目录](./README.md) · [下一页：Mods](./032-Mods.md)

**官方页面：**[Create and use config plugins](https://docs.expo.dev/config-plugins/plugins/)

> Config Plugin 指南当前未按 SDK 版本标记。它讲的是 CNG / app config 的生成流程；本文以本地 Expo SDK 56 为基准，具体 config plugin 导出与类型应以 [SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)及本地 `expo/config-plugins` 为准。

## 目标：在 Prebuild 时同步写入原生配置

此页用一个练习插件给 Android `AndroidManifest.xml` 和 iOS `Info.plist` 写入同一个 `HelloWorldMessage` 字符串。示例将 Android / iOS 代码分开，再提供一个统一入口。

项目文件大致如下：

```text
plugins/
  withAndroidPlugin.ts  Android 原生配置
  withIosPlugin.ts      iOS 原生配置
  withPlugin.ts         组合入口
app.config.ts           调用本地插件
```

## Android 插件

`withAndroidManifest` 是一个 mod plugin function。它接收 Expo config，在 `config.modResults` 的 Android Manifest JSON 结构里找到主 application，再追加 meta-data：

```ts
import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

const withAndroidPlugin: ConfigPlugin = config => {
  const message = 'Hello from a local Expo config plugin';

  return withAndroidManifest(config, config => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app['meta-data'] ??= [];
      app['meta-data'].push({
        $: {
          'android:name': 'HelloWorldMessage',
          'android:value': message,
        },
      });
    }
    return config;
  });
};

export default withAndroidPlugin;
```

`config.modResults` 是 mod 目前读到的 Manifest 结构；插件返回更新后的同一份 config。

## iOS 插件

`withInfoPlist` 同样是针对 iOS 的 mod plugin。iOS 的 plist 数据已解析成 JavaScript 对象，可以直接加自定义 key：

```ts
import { ConfigPlugin, withInfoPlist } from 'expo/config-plugins';

const withIosPlugin: ConfigPlugin = config => {
  return withInfoPlist(config, config => {
    config.modResults.HelloWorldMessage = 'Hello from a local Expo config plugin';
    return config;
  });
};

export default withIosPlugin;
```

## 统一组合插件

平台实现分文件，顶层插件按顺序将同一个 config 传给 Android 和 iOS 插件：

```ts
import { ConfigPlugin } from 'expo/config-plugins';
import withAndroidPlugin from './withAndroidPlugin';
import withIosPlugin from './withIosPlugin';

const withPlugin: ConfigPlugin = config => {
  config = withAndroidPlugin(config);
  return withIosPlugin(config);
};

export default withPlugin;
```

## 用 TypeScript 写插件

Config Plugin 可以用 TypeScript 获得类型提示，但 app config 最终由 Node.js 执行；需要安装 `tsx` 解释器，并从动态配置入口加载：

| 包管理器 | `tsx` 开发依赖安装命令 |
| --- | --- |
| npm | `npm install --save-dev tsx` |
| Yarn | `yarn add --dev tsx` |
| pnpm | `pnpm add --save-dev tsx` |
| Bun | `bun add --dev tsx` |

把 `app.json` 改为 `app.config.ts`，在首行导入 `tsx/cjs`。然后在 `plugins` 数组里指向本地组合插件：

```ts
import 'tsx/cjs';
import { ExpoConfig } from 'expo/config';

module.exports = ({ config }: { config: ExpoConfig }) => ({
  ...config,
  plugins: [['./plugins/withPlugin.ts']],
});
```

在 CNG 项目里执行 Prebuild 观察原生文件变化；下面列出各包管理器方式：

| 包管理器 | 命令 |
| --- | --- |
| npm / npx | `npx expo prebuild --clean --no-install` |
| Yarn | `yarn expo prebuild --clean --no-install` |
| pnpm | `pnpm expo prebuild --clean --no-install` |
| Bun | `bun expo prebuild --clean --no-install` |

生成的原生配置会包含相当于下面的信息：

```xml
<meta-data android:name="HelloWorldMessage" android:value="Hello from a local Expo config plugin" />
```

```xml
<key>HelloWorldMessage</key>
<string>Hello from a local Expo config plugin</string>
```

## 向插件传入参数

顶层插件的第二个参数可作为 options。用 TypeScript 时，可以声明配置类型、给参数一个默认值，再将同一 options 传给两个平台插件：

```ts
type PluginOptions = { message?: string };

const withAndroidPlugin: ConfigPlugin<PluginOptions> = (config, options = {}) => {
  const message = options.message ?? 'Hello from a local Expo config plugin';
  // 在 AndroidManifest mod 中写入 message
  return withAndroidManifest(config, config => {
    // 追加 meta-data，结构同上
    return config;
  });
};
```

```ts
const withPlugin: ConfigPlugin<PluginOptions> = (config, options = {}) => {
  config = withAndroidPlugin(config, options);
  return withIosPlugin(config, options);
};
```

调用时，在插件路径后附带选项对象：

```ts
plugins: [
  ['./plugins/withPlugin.ts', { message: 'Custom message from app.config.ts' }],
]
```

## 按顺序组合多个插件

`plugins` 数组按从上到下的顺序执行，每个插件取得上一步产生的配置。简单场景可以直接在数组放插件与参数：

```ts
plugins: [
  [withFoo, 'first input'],
  [withBar, 'second input'],
  withDelta,
]
```

如果链较复杂，可用 `withPlugins` 提高可读性：

```ts
import { withPlugins } from 'expo/config-plugins';

const baseConfig = { name: 'my app' };

module.exports = ({ config }) =>
  withPlugins(baseConfig, [
    [withFoo, 'first input'],
    [withBar, 'second input'],
    withDelta,
  ]);
```

## 使用 Expo 库自带的插件

大多数 Expo SDK 库随包提供 config plugin。以 `expo-camera` 为例，按 Expo SDK 对齐安装后，在 `app.json` 的 `plugins` 列表加入包名：

| 包管理器 | 命令 |
| --- | --- |
| npm / npx | `npx expo install expo-camera` |
| Yarn | `yarn expo install expo-camera` |
| pnpm | `pnpm expo install expo-camera` |
| Bun | `bun expo install expo-camera` |

```json
{
  "expo": {
    "plugins": ["expo-camera"]
  }
}
```

想定制权限提示时，可以把包名与 options 放进二元数组：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        { "cameraPermission": "允许 $(PRODUCT_NAME) 使用相机。" }
      ]
    ]
  }
}
```

插件改变原生工程后还需重建原生 app；在 CNG 项目里，EAS Build 或 `npx expo prebuild` 会在 Prebuild 阶段应用它们。

## 关键名词

- **`app.config.ts`**：用 JavaScript / TypeScript 生成动态 app config 的入口，适合需要计算配置或调用本地插件的项目。
- **`expo/config-plugins`**：Expo 提供的插件类型和 mod plugin API 包。
- **`withAndroidManifest` / `withInfoPlist`**：分别修改 Android Manifest / iOS Info.plist 的 mod plugin。
- **Options / 插件参数**：`plugins` 数组里传给插件函数的第二个参数，用于定制插件行为。
- **组合插件**：把多个平台或功能修改串成单个入口，便于 app config 管理。

## 官方代码主题覆盖

本页代码用途均有改写或缩略示例：Android Manifest mod、iOS Info.plist mod、组合插件、TypeScript 配置解析与 `tsx` 安装、动态 app config 调用、Prebuild 命令和生成 XML、插件 options、`withPlugins` 顺序链、`expo-camera` 插件与权限字符串。示例跳过重复的占位代码，但保留了每类操作和最终原生配置形状。

## 下一页

页脚 Next 指向 [Mods](https://docs.expo.dev/config-plugins/mods/)。

**翻页：**[上一页：Config Plugin 简介](./030-Config-Plugins简介.md) · [目录](./README.md) · [下一页：Mods](./032-Mods.md)
