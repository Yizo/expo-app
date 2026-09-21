# 055｜在本机运行 EAS Build

**翻页：**[上一页：EAS Build 自动同步 iOS Capabilities](./054-iOS-Capabilities.md) · [目录](./README.md) · [下一页：Cache Dependencies](./056-Cache-Dependencies.md)

**官方页面：**[Run EAS Build locally with local flag](https://docs.expo.dev/build-reference/local-builds/)

**版本边界：**EAS Build --local 使用当前安装在本机的 EAS CLI 和原生工具链版本，不会与云端 build image 完全一致。本地项目 Expo ~56.0.11 仍应按 SDK v56 版本安装 Node、Xcode / Android SDK 和 app dependencies。本文只介绍命令和变量，没有在本机触发构建。

## 什么时候用 --local

EAS Build 常在 EAS 托管机器构建；加上 --local 可以在当前计算机或自有 CI infrastructure 上运行尽量接近的 EAS build steps：

```sh
eas build --platform android --local
eas build --platform ios --local
```

构建前要先通过 eas login 登录 Expo，或设置 Expo access token 环境变量 EXPO_TOKEN。适合云端失败后本机复现；也可满足企业要求整个构建过程留在自有基础设施的政策。

本地模式仍会联系 EAS 服务检查 project 是否存在；若使用 managed credentials，也会从 EAS 下载签名材料。除这些需要的交互外，编译执行在本地机器。

## 本地 Build 调试变量

EAS Build --local 提供以下变量来保留排错现场、指定工作目录或控制产物位置：

| 环境变量 | 用途 |
| --- | --- |
| EAS_LOCAL_BUILD_SKIP_CLEANUP=1 | 构建结束后不清理临时工作目录。 |
| EAS_LOCAL_BUILD_WORKINGDIR | 指定构建工作目录；默认在平台临时目录内。 |
| EAS_LOCAL_BUILD_ARTIFACTS_DIR | 指定成功后复制 artifacts 的目录；默认复制到当前目录。 |

保留工作目录并指定目录后，iOS build 的 logs 子目录可以查看 Xcode 日志。

## Local Build 的限制

- 只能一次构建一个平台；不能用 all。
- eas.json 中 node、yarn、fastlane、cocoapods、ndk、image 等云端工具链版本字段会被忽略。
- 本地构建不提供 EAS Build 云端 cache。
- EAS Secret visibility 的 environment variables 不会自动下载；需要在本地环境另行设置。
- 开发者要自行安装 Node、Yarn / npm、Android SDK / NDK；iOS 还需要 macOS、Xcode、Fastlane 与 CocoaPods。
- Windows 不属于官方支持的 local build 环境；文档提到可尝试 WSL，但未正式测试。官方支持 macOS 与 Linux。

## expo run 和 eas build --local 的区别

开发中直接编译原生项目通常用 npx expo run:android / npx expo run:ios；CNG 项目可以先 expo prebuild，再用 Android Studio 或 Xcode 构建。此流程适合开发迭代，但步骤与托管 EAS Build 有差异。

使用 eas build --local 会在临时目录复制工程，尽可能复现 EAS build 服务流程。正式 release build 仍需本机装好对应 Android Studio / Xcode 工具链。

## 关键名词

- **Local Build：**EAS CLI 把构建步骤放在当前机器执行，而不是 EAS builder。
- **Managed credentials：**EAS 服务器存储的签名凭据；local build 仍可能需要从云端读取。
- **Secret visibility：**EAS environment variable 的机密级别；local build 不会自动注入这些云端变量。
- **Native toolchain：**Android SDK / NDK 或 Xcode / CocoaPods / Fastlane 等原生编译环境。

## 官方代码主题覆盖

源页所有 code / environment themes 都已覆盖：Android 与 iOS --local 命令；EXPO_TOKEN 认证；三个 local-build 调试变量；平台单选、版本字段 / cache / Secret variable 限制；本机 Node / Android / iOS 工具要求；expo run 与 prebuild 本地开发命令。本地构建和测试都没有执行。

## 下一页

官方页脚 **Next** 是 [Cache dependencies](https://docs.expo.dev/build-reference/caching/)，介绍依赖下载缓存、原生编译缓存与安全范围。

**翻页：**[上一页：EAS Build 自动同步 iOS Capabilities](./054-iOS-Capabilities.md) · [返回目录](./README.md) · [下一页：Cache Dependencies](./056-Cache-Dependencies.md)
