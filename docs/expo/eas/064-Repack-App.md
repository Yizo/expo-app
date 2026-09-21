# 064｜Repack：复用原生 Build 更新 JS Bundle

**翻页：**[上一页：用 npx testflight 快速构建并提交 iOS TestFlight](./063-NPX-TestFlight.md) · [目录](./README.md) · [下一页：EAS Build Limitations](./065-EAS-Build-Limitations.md)

**官方页面：**[Repack app](https://docs.expo.dev/build-reference/repack/)

**版本边界：**@expo/repack-app 是独立 CLI 工具，repack 当前支持 Android APK 和 iOS IPA / Simulator .app。对项目 Expo ~56.0.11，必须确保 source binary 的原生 runtime 与现有 JS 所需 native APIs 匹配。本文仅整理命令与选项，没有安装工具、签名或产生 artifact。

## Repack 是什么

Repack 把新 JavaScript bundle、静态资源与部分 app metadata 放进已编译的 APK / IPA / .app，不重新编译 native code，因此通常比完整 EAS Build 快。输出格式与输入一致：APK 输入得到 APK，IPA 得到 IPA，Simulator .app 得到 .app。

**Repack 不等于 EAS Update：**

- EAS Update 更新已经安装在用户设备上的 App，用户下次启动时下载 JS / assets。
- Repack 产生一份新的可安装 build artifact，常用于 QA 设备、测试者或 CI smoke test。

Repack 假设 native side 自原 build 后没有变化。添加 native dependency、修改 config plugin、升级 Expo SDK 等需完整 native rebuild。可先比较 source binary 与当前工程 fingerprint：相同才适合 repack；不同就重新 build。Repack 不建议用于 App Store / Google Play 生产发布。

## Standalone CLI Usage

需要一个由 Expo 项目构建的 APK、IPA 或 iOS Simulator .app；若输出必须能安装到实体设备，还需要对应 signing credentials。运行命令时从项目 root 执行，至少提供 platform 和 source app：

```sh
npx @expo/repack-app --platform android --source-app MyApp.apk
npx @expo/repack-app --platform ios --source-app MyApp.ipa
npx @expo/repack-app --platform ios --source-app MyApp.app
```

CLI 底层执行 npx expo export:embed 生成新的 bundle，再替换 source artifact 内容。Simulator .app 不需要签名；Android APK 若没有 keystore 会未签名；iOS IPA 无 signing profile 不能安装在设备上。

## EAS Workflows

EAS Workflows 有预打包 repack job，可管理输入 build 与签名 credentials，适合“对同一个 native fingerprint 的 PR 做多次 JS smoke preview”。具体字段以官方最新 [pre-packaged job reference](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/) 为准。

## Signing

Android device-installable APK 使用 keystore；iOS 目前仅支持 development / ad hoc profile 签名，不能把 repack 当成 App Store distribution pipeline：

```sh
npx @expo/repack-app \
  --platform android \
  --source-app MyApp.apk \
  --ks keystore.jks \
  --ks-key-alias my-alias
```

Android 还可用 ks-pass、ks-key-pass 以及 build-tools directory 选项配置 keystore。iOS 示例：

```sh
npx @expo/repack-app \
  --platform ios \
  --source-app MyApp.ipa \
  --signing-identity "Apple Development: Example" \
  --provisioning-profile /path/to/profile.mobileprovision
```

如需处理 app extensions / multi-target，iOS provisioning profile 参数也可传一个 JSON 结构映射多个 target。

## JavaScript Bundle Only

默认会更新 JS bundle、assets 和 app metadata（App name、version、package name / bundle identifier、expo-updates manifest）。只想改 JavaScript、保持所有原生 metadata 不变时使用：

```sh
npx @expo/repack-app --platform android --source-app MyApp.apk --js-bundle-only
```

## CLI 选项参考

| 参数 | 含义 |
| --- | --- |
| project-root | 可选项目路径；默认当前工作目录。 |
| -p, --platform | 必填：android 或 ios。 |
| --source-app | 必填：Android APK，或 iOS IPA / .app。输出格式跟随输入。 |
| -o, --output | 输出路径；默认项目目录下 repacked.apk / repacked.ipa / repacked.app。 |
| -w, --working-directory | 临时文件工作目录。 |
| --skip-working-dir-cleanup | 运行结束后保留 working directory，用于排查。 |
| -v, --verbose | 打开详细日志。 |
| --js-bundle-only | 仅更新 JS bundle，不改原生 metadata。 |
| --embed-bundle-assets | 强制执行 expo export:embed；debug build 默认可能从 dev server 加载 bundle。 |
| --bundle-assets-sourcemap-output | 指定输出 source map 路径；需要同时启用 embed-bundle-assets。 |
| --ks | Android keystore 文件路径。 |
| --ks-pass | keystore 密码；默认 pass:android；支持 pass:value、env:NAME、file:PATH。 |
| --ks-key-alias | Android keystore alias。 |
| --ks-key-pass | key 密码；支持 pass:value、env:NAME、file:PATH。 |
| --android-build-tools-dir | Android SDK build-tools 路径。 |
| --signing-identity | iOS code-sign identity。 |
| --provisioning-profile | iOS provisioning profile 路径；multi-target 时可传 JSON 映射。 |

## 关键名词

- **Native fingerprint：**衡量 App 原生依赖、配置和 native project 的标识，可用来判断已有 binary 能否承载新 JS。
- **Source artifact：**作为重打包基础的 APK / IPA / Simulator .app。
- **Installable artifact：**已签名且适合目标 device / simulator 安装的构建包。
- **Development / Ad hoc signing：**iOS 内部设备测试签名方式，不等于商店 distribution signing。
- **Metadata：**打包信息，例如 app display name、version、package / bundle ID 或 OTA manifest。

## 官方代码主题覆盖

源页所有 code / CLI themes 已覆盖：Android APK、iOS IPA、Simulator .app input / output；--platform 与 --source-app；自动 export:embed；Android keystore + alias；iOS development / ad hoc identity/profile；--js-bundle-only；output / temp / verbose / sourcemap 参数；ks pass 格式与 build tools 目录；production 的限制。

## 下一页

官方页脚 **Next** 是 [EAS Build limitations](https://docs.expo.dev/build-reference/limitations/)，汇总云 build runner 资源、缓存、超时与 workspace 等服务边界。

**翻页：**[上一页：用 npx testflight 快速构建并提交 iOS TestFlight](./063-NPX-TestFlight.md) · [返回目录](./README.md) · [下一页：EAS Build Limitations](./065-EAS-Build-Limitations.md)
