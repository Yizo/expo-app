# 043 Speeding up your Build phase

**翻页：** [上一页：042 Performance Overview](042-PerformanceOverview.md) · [目录](README.md) · [下一页：044 Optimizing FlatList Configuration](044-OptimizingFlatListConfiguration.md)

**官方页面：** [Speeding up your Build phase · React Native](https://reactnative.dev/docs/build-speed)  
**源页代码覆盖：** Android 单 ABI CLI/Gradle/`gradle.properties`、Gradle Configuration Cache、Maven mirror property、ccache 安装/统计/清除、iOS Podfile ccache 配置、CI 与 sccache 建议。

## 什么时候值得优化原生构建

大型工程每次编译 Android/iOS 原生代码可能要几分钟。此页列出的办法涉及 Gradle、Pods 和编译缓存，适合已经了解原生构建的团队；先确认真正的瓶颈，再选择局部优化。

## Android 开发时只构建当前 CPU 架构

ABI（Application Binary Interface）描述 Android native binary 对应的 CPU 架构。发布包通常要支持 `armeabi-v7a`、`arm64-v8a`、`x86`、`x86_64` 等多个 ABI；本机开发只在一台真机/模拟器运行时，可以只构建当前设备支持的架构。

RN CLI 可读取当前设备架构：

```sh
yarn react-native run-android --active-arch-only
```

输出应显示检测到的架构，例如 `arm64-v8a`。直接调 Gradle 时也可明确指定：

```sh
./gradlew :app:assembleDebug -PreactNativeArchitectures=x86_64
```

`reactNativeArchitectures` 属性也能写在顶层 `gradle.properties`，或用 `-P` 在 CLI 覆盖。此设置只适合本机开发；Release APK/AAB 需要恢复所有目标架构，不能把只支持本机 ABI 的包发给用户。

## Gradle Configuration Cache

Gradle 构建有配置阶段（读取并评估 `.gradle` 文件）与执行阶段（运行编译等 task）。从 RN 0.79 起可启用 Configuration Cache，后续构建跳过部分配置阶段；原生文件频繁变化时可能缩短迭代时间。

```properties
org.gradle.configuration-cache=true
```

配置缓存要求 Gradle 脚本和插件兼容；若遇到不可缓存的插件错误，依照 Gradle/RN 当前文档处理，不要屏蔽真正的配置失败。

## Maven 仓库镜像

Gradle 构建会从 Maven Central 和其他仓库下载依赖。公司若运行内部镜像，可在 Android `gradle.properties` 配置 `exclusiveEnterpriseRepository`，让构建只从指定镜像取依赖：

```properties
exclusiveEnterpriseRepository=https://maven.example.org/repository/mobile
```

只有确认镜像完整代理所有所需依赖时才可设置此 exclusive 属性；否则未镜像的库会下载失败。

## Ccache 本地编译缓存

`ccache` 缓存重复的 C++/Objective-C 编译结果，命中时跳过重编。macOS 可用 Homebrew 安装；第一次预热后再次 clean/build 才能看到较多 cache hits。检查缓存命中率和统计：

```sh
brew install ccache
ccache -s
ccache --zero-stats
```

若需要清缓存可以运行 `ccache --clear`，但会失去已有编译结果并让下一次构建变慢。为 iOS/Xcode 开启 RN 支持时，在 `ios/Podfile` 的 `react_native_post_install` 中设置：

```ruby
react_native_post_install(
  installer,
  config[:reactNativePath],
  :mac_catalyst_enabled => false,
  :ccache_enabled => true
)
```

CI 上可保存/恢复 macOS 缓存目录，但每次仍应做干净构建，降低污染缓存的风险。ccache 默认按文件时间戳估算是否重用；CI 每次重新下载源文件时可改用 `compiler_check content` 内容哈希判断。若组织需要团队间共享构建缓存，可评估 sccache 等分布式缓存，并遵循其自身配置指南。

**翻页：** [上一页：042 Performance Overview](042-PerformanceOverview.md) · [目录](README.md) · [下一页：044 Optimizing FlatList Configuration](044-OptimizingFlatListConfiguration.md)
