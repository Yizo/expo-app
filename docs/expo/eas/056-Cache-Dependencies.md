# 056｜EAS Build 缓存 Dependencies

**翻页：**[上一页：在本机运行 EAS Build](./055-EAS-Build-Locally.md) · [目录](./README.md) · [下一页：Android Build Process](./057-Android-Build-Process.md)

**官方页面：**[Cache dependencies](https://docs.expo.dev/build-reference/caching/)

**版本边界：**EAS 云构建 cache、GitHub Workflows cache 和平台 package registry 配置都可能变化。本地项目 Expo ~56.0.11 可使用对应 EAS CLI / build profile 配置；本文的环境变量和文件缓存示例依官方当前页面，没有运行构建。

## 缓存的作用

构建启动前，项目依赖和原生编译材料必须下载 / 生成。重用成功 build 留下的文件可减少依赖下载和 C / C++ 原生编译时间。

## eas.json 自定义路径缓存

profile 的 cache 配置允许 EAS 在成功构建后保存指定文件 / 目录，并在之后的 build 中恢复。恢复操作不会覆盖当前已经存在的文件。修改 cache.key 会让缓存失效；cache 对象的其他字段变化也会触发失效。

例如缓存 C/C++ 编译器产物、原生 lockfile：

```json
{
  "build": {
    "production": {
      "cache": {
        "key": "native-deps-v1",
        "paths": [
          ".ccache",
          "ios/Podfile.lock"
        ]
      }
    }
  }
}
```

缓存 Android/iOS 项目文件时，确认所填 path 与构建机实际目录一致；恢复缓存不会覆盖已有内容。

## JavaScript Dependencies 与 Lockfile

EAS 提供 npm cache server。npm 与 Yarn 2+ 默认使用；Yarn 1 Classic 的 yarn.lock 固定 registry URL，需要采用上一页的 hook workaround。

在 eas.json 中设置 EAS_BUILD_DISABLE_NPM_CACHE=1 可关闭 npm cache server。EAS Workflows 则在 job 的 env 设置：

```json
{
  "build": {
    "production": {
      "env": {
        "EAS_BUILD_DISABLE_NPM_CACHE": "1"
      }
    }
  }
}
```

默认安装依赖时 EAS 使用严格 lockfile 模式（例如 Yarn frozen lockfile 或 npm ci）。只有确实需要放宽锁文件时才设置 EAS_NO_FROZEN_LOCKFILE=1：

```json
{
  "build": {
    "preview": {
      "env": {
        "EAS_NO_FROZEN_LOCKFILE": "1"
      }
    }
  }
}
```

关闭 frozen lockfile 会允许构建重新解析依赖版本，可能造成 CI 结果与本地 lockfile 不同；只有明确需要此行为时使用。

## Android Maven Dependencies

Android 构建机另有 Maven cache server，可缓存文档列出的 maven-central、google 和 Gradle plugins 仓库依赖。用 EAS_BUILD_DISABLE_MAVEN_CACHE=1 关闭：

```json
{
  "build": {
    "production": {
      "env": {
        "EAS_BUILD_DISABLE_MAVEN_CACHE": "1"
      }
    }
  }
}
```

## C / C++ 编译器 Cache

ccache 会缓存 native compiler 之前的编译结果。EAS 可用以下变量控制：

| 环境变量 | 行为 |
| --- | --- |
| EAS_USE_CACHE=1 | 同时启用构建开始时恢复与结束时保存 cache。 |
| EAS_RESTORE_CACHE=1 或 0 | 单独控制恢复；此项覆盖 EAS_USE_CACHE 的恢复设置。 |
| EAS_SAVE_CACHE=1 或 0 | 单独控制保存；此项覆盖 EAS_USE_CACHE 的保存设置。 |

## EAS Workflows 中使用 Cache

EAS Workflows 提供 eas/restore_build_cache 与 eas/save_build_cache。使用默认步骤时会按 build 配置的依赖锁文件计算 cache key。需要自定义 key / path 时，可使用 restore_cache/save_cache：

```yaml
jobs:
  build_android:
    type: build
    steps:
      - uses: eas/checkout
      - uses: eas/restore_build_cache
      # 或显式指定 key / fallback / path：
      # - uses: eas/restore_cache
      #   with:
      #     key: android-ccache-${{ hashFiles('yarn.lock') }}
      #     restore_keys: android
      #     path: /home/expo/.cache/ccache
      - uses: eas/build
      - uses: eas/save_build_cache
```

自定义 build YAML 也可以按顺序运行 restore / build / save：

```yaml
build:
  name: Compile with ccache
  steps:
    - eas/checkout
    - eas/restore_build_cache
    - eas/build
    - eas/save_build_cache
```

restore_build_cache / save_build_cache 是 EAS 编译缓存内置步骤；自定义的 restore_cache / save_cache 可通过 key、restore_keys 和 path 对任意构建文件建立缓存。

## Cache Key 匹配顺序

恢复时先找 cache.key 的精确匹配。如果没有，按 restore_keys 的声明顺序查找匹配前缀的 cache，并选择该前缀下最近创建的一份。命中精确 key 的缓存较可能完全匹配输入；prefix fallback 可以复用部分依赖材料，但不一定最有效。

例如 cache key 基于 yarn.lock hash，fallback 可先回退到平台前缀，再到更宽的平台 cache：

```yaml
key: android-ccache-${{ hashFiles('yarn.lock') }}
restore_keys:
  - android-ccache-
  - android-
```

## Cache 的隔离和可信来源

- GitHub 触发的 build cache 按 branch 隔离，可恢复当前 branch 和默认分支 main / master 的缓存。
- EAS CLI 手动触发的缓存按执行者 EAS 用户隔离。
- 如果当前用户没有缓存，EAS 会回退到默认分支 GitHub build 产生的 cache。
- 多人共用同一 Expo token / GitHub Actions actor 会共享 user-scoped cache，可能传播不可信或不干净的产物。Production job 应谨慎恢复共享缓存；可把缓存保存限定到可信 branch / job。

一类安全策略是生产构建只保存新 cache，不恢复其他来源的 cache：

```json
{
  "build": {
    "production": {
      "env": {
        "EAS_RESTORE_CACHE": "0",
        "EAS_SAVE_CACHE": "1"
      }
    },
    "preview": {
      "env": {
        "EAS_USE_CACHE": "1"
      }
    }
  }
}
```

Workflow 也可限定 main branch job 保存 cache：

```yaml
jobs:
  build_production:
    type: build
    if: ${{ github.ref_name == 'main' }}
    env:
      EAS_RESTORE_CACHE: "0"
      EAS_SAVE_CACHE: "1"
    params:
      platform: android
      profile: production
```

设置 EAS_SAVE_CACHE 并非唯一可写入缓存的约束；其他 job 如果也设置了相同保存变量，仍可能覆盖数据。

## iOS CocoaPods Cache

EAS Build 通过 CocoaPods cache 服务缓存多数 Pod 下载，改善 pod install 时长与一致性。如果项目提供了自定义 .netrc 或 .curlrc，EAS 会绕过该 cache。EAS_BUILD_DISABLE_COCOAPODS_CACHE=1 可禁用：

```json
{
  "build": {
    "production": {
      "env": {
        "EAS_BUILD_DISABLE_COCOAPODS_CACHE": "1"
      }
    }
  }
}
```

CNG 项目通常在云构建时生成 ios 目录，所以本地开发可能没有 Podfile.lock。把 ios/Podfile.lock 加入 eas.json cache.paths 可让构建 lockfile 缓存，但它可能和本地生成版本不同；一旦错误，可能需要清缓存并重试。

## 关键名词

- **Lockfile：**固定依赖树中具体包版本的文件。
- **Cache Key：**识别一组缓存内容的键；可用 lockfile hash 随依赖变化。
- **Restore Key：**找不到精确缓存时按前缀回退匹配。
- **ccache：**C / C++ compiler cache，通过复用之前的编译结果加快 native 重编译。
- **Maven Cache：**Android Gradle 下载 Java / Android libraries 时使用的依赖缓存。
- **CocoaPods Cache：**iOS 构建的 Pod 下载缓存。
- **缓存隔离：**按 Git branch 或 EAS CLI 用户限制可恢复的缓存来源。

## 官方代码主题覆盖

源页代码 / config topics 全部覆盖：eas.json cache.key/cache.paths；npm / Maven / CocoaPods cache 开关；immutable lockfile 开关；ccache 的 use/restore/save 环境变量；Android / iOS Workflow restore/save 与自定义 key/path；cache prefix 匹配顺序；Production 指定只 save；main branch workflow cache gate；缓存 Podfile.lock 的配置和取舍。

## 下一页

官方页脚 **Next** 是 [Android build process](https://docs.expo.dev/build-reference/android-builds/)，逐步说明 EAS Build 如何从本机打包源码到云端编译 Android 应用。

**翻页：**[上一页：在本机运行 EAS Build](./055-EAS-Build-Locally.md) · [返回目录](./README.md) · [下一页：Android Build Process](./057-Android-Build-Process.md)
