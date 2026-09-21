# 101｜EAS Update Asset Selection 与 Exclusion

**翻页：**[上一页：EAS Update 端到端 Code Signing](./100-EAS-Update-Code-Signing.md) · [目录](./README.md) · [下一页：不使用其他 EAS 服务的 Update](./102-EAS-Update-Without-EAS.md)

**官方页面：**[Asset selection and exclusion](https://docs.expo.dev/eas-update/asset-selection/)

**版本边界：**当前 SDK 52+ 把 asset selection 设为可用能力。项目使用 Expo ~56.0.11，按 SDK v56 Expo Updates app config reference 使用 updates.assetPatternsToBeBundled。模式决定 OTA upload eligibility，不改变原生 binary 内已打包的资源。

## Asset Selection 做什么

默认情况下，Metro bundle 找到的静态 assets 会随 EAS Update manifest 上传。指定 assetPatternsToBeBundled 后，只有匹配规则的资源才会加入 OTA。这样可以减少每次 update 上传 / 下载的文件数和体积。

Asset selection 不会减少 App 首次启动时间或 native binary 大小，也不负责从客户端代码里自动移除引用。

## Expo SDK 配置写法

SDK 52 及更新版本在 expo.updates 下配置一组文件 pattern：

```json
{
  "expo": {
    "updates": {
      "assetPatternsToBeBundled": [
        "app/images/**/*.png"
      ]
    }
  }
}
```

该 pattern 表示 app/images 目录及子目录中的 PNG 图片可以上传。所有仍会被 JS / JSX / TS 引用的图片，要确保匹配至少一条规则或已存在于原生 binary。

SDK 52 以前，官方早期字段位置是 extra.updates.assetPatternsToBeBundled。SDK 56 项目应使用上面的 current location。

## 检查 Update 会包含的资源

Pattern 未匹配的 asset 仍可能被 Metro bundler 解析，却不会上传到 EAS Update CDN。如果它不在已安装的 native build 中，用户就无法加载页面。expo-updates CLI 提供 assets:verify 来对照 export manifest 和 binary build manifest 检查缺失资源：

```sh
npx expo export --dump-assetmap
npx expo-updates assets:verify ./my-app
```

此命令需 expo-updates 版本 >= 0.24.10。验证时要使用相同 runtimeVersion 的 build / manifest；它不会修复 patterns，只输出资源选择检查结果。

## CLI 选项

| 参数 | 意义 |
| --- | --- |
| dir | 项目路径，默认当前目录。 |
| -a, --asset-map-path | expo export --dump-assetmap 生成的 assetmap.json。 |
| -e, --exported-manifest-path | 同一次 export 生成的 metadata.json。 |
| -b, --build-manifest-path | Expo build 生成的 app.manifest，可来自 Android 或 iOS。 |
| -p, --platform | 目标 android 或 ios。 |
| -h, --help | 输出命令用法。 |

将相应文件路径显式传入：

```sh
npx expo-updates assets:verify ./my-app --asset-map-path ./dist/assetmap.json --exported-manifest-path ./dist/metadata.json --build-manifest-path ./app.manifest --platform ios
```

## 关键名词

- **Asset Pattern：**匹配 JS / bundle 静态依赖资源路径的正则形式规则。
- **assetmap.json：**将打包资源与路径映射起来的导出文件。
- **metadata.json：**同一次 export 的更新信息 manifest。
- **app.manifest：**binary build 用于 Update 的原生 manifest。
- **OTA Eligible Asset：**被 pattern 选中，可通过 EAS Update 上传给已有 binary 的资源。

## 官方代码主题覆盖

源页 code topics 全部覆盖：SDK <52 与 SDK 52+ app config 位置差异；patterns 数组与 glob 示例；expo export --dump-assetmap；expo-updates assets:verify；CLI 的 assetmap、metadata、app.manifest、platform、dir / help 参数及资源应内嵌还是 OTA 发布的边界。

## 下一页

官方页脚 **Next** 是 [Using EAS Update without other EAS services](https://docs.expo.dev/eas-update/standalone-service/)，说明独立接入 EAS Update 时需自行准备的 Configure / Build / Channel 内容。

**翻页：**[上一页：EAS Update 端到端 Code Signing](./100-EAS-Update-Code-Signing.md) · [返回目录](./README.md) · [下一页：不使用其他 EAS 服务的 Update](./102-EAS-Update-Without-EAS.md)
