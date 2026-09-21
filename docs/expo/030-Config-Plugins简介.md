# 030｜Config Plugin 简介

**翻页：**[上一页：开发构建 FAQ](./029-开发构建FAQ.md) · [目录](./README.md) · [下一页：创建 Config Plugin](./031-创建Config-Plugin.md)

**官方页面：**[Introduction to config plugins](https://docs.expo.dev/config-plugins/introduction/)

> 本页是当前 Expo 的未版本化 CNG / Config Plugin 概念指南，不含 SDK 专属 API 示例。SDK 56 同样使用 Expo Prebuild 与 app config 约定；涉及包版本的配置仍以 [SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)和项目实际依赖为准。

## 为什么有 Config Plugin

Expo 的 **Continuous Native Generation（CNG，连续原生生成）**会根据 Expo app config 生成 Android / iOS 工程。项目如果需要修改系统配置，而默认 app config 属性无法表达，就可以用 Config Plugin 在生成时扩展原生工程。

例如：自动写入应用图标 / 名称、Android `AndroidManifest.xml` 属性、iOS `Info.plist` 内容等。CNG 项目可以把这些改动集中放在 JavaScript 配置文件中，运行 `npx expo prebuild` 或由构建工具自动运行 Prebuild 时再写入原生目录。

在使用 CNG 时直接手改生成出来的 `android/`、`ios/` 文件，后续重新生成可能覆盖这些手工修改。Config Plugin 能让原生配置在多次 Prebuild / CI 构建时保持可重复。

## Config Plugin 的组成

```text
app.json 中的 plugins 数组
        │
        ▼
顶层插件 withMyPlugin
        │
        ├── withAndroidPlugin → withAndroidManifest → AndroidManifest.xml
        └── withIosPlugin     → withInfoPlist       → Info.plist
```

| 名词 | 解释 |
| --- | --- |
| **Config Plugin** | 在 `app.config.js` / `app.json` 的 `plugins` 数组中引用的入口。约定常用 `with` 前缀命名，如 `withMyPlugin`。 |
| **Plugin function** | 插件内部一个可以复用、组合的平台修改函数；也可能直接作为顶层插件使用。拆分后更便于测试与调试。 |
| **Mod plugin function** | `expo/config-plugins` 提供的封装器，让开发者在安全的文件修改阶段操作平台配置。 |
| **Mod** | 实际针对某个平台和文件的修改阶段，如 `mods.android.manifest`、`mods.ios.infoplist`。在 Prebuild 同步原生文件时运行。 |

## 插件的大致执行阶段

一个 Config Plugin 通常是同步函数，接收 `ExpoConfig` 并返回修改过的 `ExpoConfig`；也可选接收第二个 options 参数。插件本身会在 app config 解析阶段执行；`mods` 则只在 Prebuild 同步原生文件时运行。

因此，如果某个配置变化不依赖写入原生文件，直接在插件层更新 `ExpoConfig`；平台文件操作放在相应 mod 中。插件的返回值应该可序列化；mod 持有实际原生修改逻辑。

## 什么时候需要 Config Plugin

- Expo SDK 默认 app config 尚无对应字段。
- 某个原生库需要向 `AndroidManifest.xml`、iOS `Info.plist` 或 Xcode / Gradle 工程添加声明。
- 希望在团队机器与 CI 上重复得到相同原生设置。
- 需要在每次 Prebuild 后再次生成配置，而不是依赖一次性的手工改动。

## 官方代码主题覆盖

本页没有代码块。源页的行内命令仅为 `npx expo prebuild`，已在正文解释；其余代码名是概念标识（如 `plugins`、`mods.android.manifest`）。

## 下一页

页脚 Next 指向 [Create and use config plugins](https://docs.expo.dev/config-plugins/plugins/)。

**翻页：**[上一页：开发构建 FAQ](./029-开发构建FAQ.md) · [目录](./README.md) · [下一页：创建 Config Plugin](./031-创建Config-Plugin.md)
