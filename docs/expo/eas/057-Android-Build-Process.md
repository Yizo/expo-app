# 057｜EAS Build 的 Android 构建流程

**翻页：**[上一页：EAS Build 缓存 Dependencies](./056-Cache-Dependencies.md) · [目录](./README.md) · [下一页：iOS Build Process](./058-iOS-Build-Process.md)

**官方页面：**[Android build process](https://docs.expo.dev/build-reference/android-builds/)

**版本边界：**本页说明 EAS Build 当前托管 Android builder 的内部阶段；工具版本受 image / profile 影响。项目 Expo ~56.0.11 的原生依赖以 SDK v56 为准。文中 package scripts、Gradle 文件和命令只用于理解构建链，没有提交、build 或其他 Git 操作。

## 两个阶段：本地打包与云端编译

EAS Build 先在开发机由 EAS CLI 准备请求和源码 archive，再上传至云端隔离环境完成 Android 原生编译。

### EAS CLI 本地阶段

1. 如果 eas.json 设置 cli.requireCommit: true，CLI 检查 Git index 是否干净；若仍有未提交变更，可以选择提交或终止构建。
2. 默认准备 Android build credentials；profile 设置 withoutCredentials: true 时跳过。credentialsSource 可从本地 credentials.json 或 EAS remote 获取；remote 尚无 keystore 时会提示创建。
3. 按当前 VCS workflow 把 repository 制成 tarball。
4. 上传到 EAS 私有 Google Cloud Storage bucket，并创建 build request。

### Remote Android Builder 阶段

builder 为每个 build 建立独立 container，装好 Java JDK、Android SDK、NDK 等工具，再下载与展开上传的项目。

大致执行顺序：

1. 有 NPM_TOKEN 时生成 .npmrc。
2. 运行 package.json 中 eas-build-pre-install。
3. 在项目根运行 npm install；若存在 yarn.lock，则运行 yarn install。
4. 运行 npx expo-doctor 检查配置与依赖。
5. CNG 项目运行版本化 Expo CLI 的 npx expo prebuild。
6. 按 profile 的 cache.key 恢复缓存。
7. 运行 eas-build-post-install。
8. 若 build request 包含签名材料，恢复 keystore。
9. 向 Gradle 注入 release signing config。
10. 在 Android 项目下运行 ./gradlew。默认 :app:bundleRelease 生成 AAB；可以用 eas.json 的 android.gradleCommand 覆盖。
11. 项目若定义过时的 eas-build-pre-upload-artifacts hook，会在此位置运行。
12. 保存 build profile 配置的 cache。
13. 上传 APK / AAB。eas.json 的 applicationArchivePath 可以更改归档路径；默认匹配 android/app/build/outputs 下 APK 和 AAB。
14. 成功时运行 eas-build-on-success；失败时运行 eas-build-on-error；最后运行 eas-build-on-complete，并设置 EAS_BUILD_STATUS 为 finished 或 errored。
15. 如果 profile 配置了 buildArtifactPaths，再将指定附加构建文件上传到 GCS。

## Keystore 自动配置

Android release App 必须由对应 keystore 签名。Google Play 用证书判断升级包是否来自同一 app owner，所以 production keystore 与密码不能公开或提交仓库；Play App Signing 可降低上传 keystore 丢失的风险。

EAS Build 会在云端构建期间生成 android/app/eas-build.gradle，从 credentials.json 临时读取 keystore 路径和密码，为 Gradle 注入 signing configuration。示意如下：

```gradle
import java.nio.file.Paths

def credentialsFile = rootProject.file("../credentials.json")
def credentials = new groovy.json.JsonSlurper().parse(credentialsFile)
def keystorePath = Paths.get(credentials.android.keystore.keystorePath)

android {
  signingConfigs {
    release {
      storeFile keystorePath.toFile()
      storePassword credentials.android.keystore.keystorePassword
      keyAlias credentials.android.keystore.keyAlias
      keyPassword credentials.android.keystore.keyPassword
    }
  }

  buildTypes {
    release { signingConfig signingConfigs.release }
    debug { signingConfig signingConfigs.release }
  }
}
```

此文件是在云端自动生成，不要求开发者手写。它会在项目的 android/app/build.gradle 中被应用：

```gradle
apply from: "./eas-build.gradle"
```

签名文件的上传、密钥管理仍按 App Credentials 配置处理；debug keystore 是唯一可能例外于 production keystore 不入库的情形。

## 关键名词

- **Project tarball：**EAS CLI 打包后上传到 cloud builder 的源码副本。
- **Remote builder：**EAS 每个 build 新建的隔离 Docker container。
- **CNG prebuild：**按 app config 与 config plugins 生成 android / ios native project。
- **Gradle Command：**构建 Android 产物的任务名；AAB 常用 bundleRelease，APK 任务不同。
- **Build artifact：**上传后的 APK / AAB，或 profile 指定的其他构建文件。

## 官方代码主题覆盖

源页所有 code / sequence topics 均覆盖：requireCommit、credentialsSource / withoutCredentials、源码上传；NPM_TOKEN、pre-install / post-install / success / error / complete hooks；Expo Doctor / prebuild / cache；Gradle command、archive path、额外 artifacts；Credentials JSON 生成的 eas-build.gradle 与 build.gradle 引用。Git index 只说明流程，没有实际读取或修改。

## 下一页

官方页脚 **Next** 是 [iOS build process](https://docs.expo.dev/build-reference/ios-builds/)，拆解 EAS 云端 iOS 构建的本地准备、Pods 和 Xcode 阶段。

**翻页：**[上一页：EAS Build 缓存 Dependencies](./056-Cache-Dependencies.md) · [返回目录](./README.md) · [下一页：iOS Build Process](./058-iOS-Build-Process.md)
