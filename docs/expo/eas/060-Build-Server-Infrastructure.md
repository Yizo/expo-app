# 060｜EAS Build Server Infrastructure

**翻页：**[上一页：Build Configuration Process](./059-Build-Configuration-Process.md) · [目录](./README.md) · [下一页：iOS App Extensions](./061-iOS-App-Extensions.md)

**官方页面：**[Build server infrastructure](https://docs.expo.dev/build-reference/infrastructure/)

**版本边界：**本页服务器镜像、IP 列表、Node / Xcode / NDK 版本都是时效信息，Expo 官方会随 SDK 和 App Store 要求更新。项目 Expo ~56.0.11 建议用对应 sdk-56 image，避免不必要地升级原生工具链；此页所列 2026 年 image 详情应以官方页面实时数据为准。未运行构建或设置 IP allowlist。

## Build Runner 的位置与隔离

Expo 提供 build server IP 列表文件，包含 Last-Modified / Expires 时间，供需要防火墙 allowlist 的公司跟踪。Linux runner 由 Google Cloud Platform 托管；macOS runner 位于 Expo 的 macOS cloud。每个 Android / iOS build 使用自己的隔离 VM / container。

## 选择 Build Image

镜像内含 Node、Yarn、CocoaPods、Xcode、Ruby、Fastlane 等 build tool。eas.json 可显式选 image；也可通过 lifecycle hooks 用 apt-get / brew 安装额外系统依赖，但会增加构建时间。

| eas.json image 值 | 选择规则 |
| --- | --- |
| 不写 image | 默认为 auto。 |
| auto | 根据 Expo SDK、React Native 和项目配置选择匹配镜像；构建 log 的 Spin up build environment 阶段会显示最终 image。 |
| latest | 使用最新工具版本镜像，会随镜像发布而变化。 |
| sdk-56 | 使用最适合 SDK 56 的 image alias；其他 sdk-N 同理。SDK alias 会随 Expo SDK 发布更新。 |
| 完整镜像名 | 选择明确 image 名，以稳定构建环境；官方说明仍可能有小幅更新。 |

项目可按平台 pin image：

```json
{
  "build": {
    "production": {
      "android": {
        "image": "sdk-56"
      },
      "ios": {
        "image": "sdk-56"
      }
    }
  }
}
```

## 资源规格与 Gradle 内存

### Android

Android VM 是隔离环境。官方常见资源规格：

| Resource class | CPU | RAM |
| --- | --- | --- |
| medium（默认） | 4 vCPU | 16 GB |
| large | 8 vCPU | 32 GB |

Android runner 集成 npm / Maven cache，Gradle JVM 参数由 EAS 注入。

### iOS

iOS runner 在专用 Mac mini host 上为每次构建分配新 VM：

| Resource class | CPU | RAM | SSD |
| --- | --- | --- | --- |
| medium | 5 performance cores | 20 GiB | 110 GB |
| large | 10 performance cores | 40 GiB | 110 GB |

支持的 Xcode 版本通常涵盖 Apple 允许上传 App Store Connect 的最新稳定版和前一版本。苹果提高 minimum Xcode 要求后，旧版支持会同步调整。

### Gradle JVM Defaults

Android worker 通过 GRADLE_OPTS 设置 Gradle JVM：

- medium 的最大 heap Xmx=4g；large 的最大 heap Xmx=8g。
- Metaspace 上限 1g、heap dump on OOM、UTF-8 file encoding。
- org.gradle.parallel=true；org.gradle.daemon=false。

worker 通过 GRADLE_OPTS 设置的 org.gradle.jvmargs 会覆盖项目 gradle.properties 同名值。可在 eas.json profile env、EAS Workflow job env 或 EAS environment variables 中覆写 GRADLE_OPTS：

```json
{
  "build": {
    "production": {
      "env": {
        "GRADLE_OPTS": "-Xmx6g -XX:MaxMetaspaceSize=1g"
      }
    }
  }
}
```

示例只说明 override 入口。增大 JVM heap 会占用 worker RAM，需要与 medium / large resource class 匹配。

## SDK 56 镜像摘要

| Platform | SDK 56 image | 关键组件（官方页面快照） |
| --- | --- | --- |
| Android | ubuntu-26.04-jdk-17-ndk-r27b（alias sdk-56） | Ubuntu 26.04；Android NDK 27.1.12297006；Node 22.22.2；Bun 1.3.13；Yarn 1.22.22；pnpm 10.33.3；npm 10.9.4；Java 17；node-gyp 12.3.0；Maestro 2.5.1。 |
| iOS | macos-tahoe-26.4-xcode-26.4（alias sdk-56） | macOS Tahoe 26.4.1；Xcode 26.4；Node 22.22.2；Bun 1.3.13；Yarn 1.22.22；pnpm 10.33.3；npm 10.9.4；Fastlane 2.233.1；CocoaPods 1.16.2；Ruby 3.2；node-gyp 12.3.0；Maestro 2.5.1。 |

SDK 57 的 latest 镜像已经使用更新的 Node / package manager / Xcode 组合。SDK 55 及更早版本也有专属和 legacy 镜像；完整旧镜像 / deprecated 标记、完整 GCE image IDs 请以[官方页面](https://docs.expo.dev/build-reference/infrastructure/)列表为准。

## Worker 的 npm 与 Yarn 配置

Android / iOS worker 会自动配置内部 npm cache；以下是结构示例，内网服务 URL 会变化，不应抄进项目自身 .npmrc：

```ini
registry=<EAS npm cache endpoint>
```

Yarn configuration 也会指向该 registry 并允许受控的 HTTP cache endpoint。项目若需要使用公开 npm / private registry，请按 private packages 文档配置，不要把 builder internal hostname 放进仓库。

## iOS CocoaPods Cache

iOS builder 通过 CocoaPods cache 提高 pod install 一致性。项目自己提供 .netrc 或 .curlrc 时会绕过 cache。eas.json 的 EAS_BUILD_DISABLE_COCOAPODS_CACHE=1 可以禁用。

## 关键名词

- **Build Image：**EAS VM 的操作系统和原生开发工具集合。
- **SDK Alias：**指向适配特定 Expo SDK 的 build image 的名字，例如 sdk-56。
- **Resource class：**构建 VM 的 CPU / RAM / SSD 规格。
- **GRADLE_OPTS：**Gradle JVM 参数环境变量；EAS worker 会提供默认内存与并行配置。
- **Infrastructure cache：**runner 上的 npm、Maven、CocoaPods 缓存服务，与项目通过 eas.json 配置的文件 cache 不完全相同。
- **Allowlist：**防火墙仅允许某些 IP 地址访问；EAS 提供官方 build server IP 列表供企业网络规则使用。

## 官方代码主题覆盖

源页配置 / code topics 均覆盖：eas.json android / ios image；auto / latest / sdk-56 镜像选择；GRADLE_OPTS 自定义入口；Android / iOS resource class 与 toolchain 规格；EAS npm / Maven / CocoaPods cache 配置说明及禁用入口。内部 registry URLs 没复制，SDK56 image 版本单独列出。

## 下一页

官方页脚 **Next** 是 [iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)，讲解如何在 EAS Build 中为主应用的 iOS extension targets 配置签名与构建。

**翻页：**[上一页：Build Configuration Process](./059-Build-Configuration-Process.md) · [返回目录](./README.md) · [下一页：iOS App Extensions](./061-iOS-App-Extensions.md)
