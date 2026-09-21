# 062 Publishing to Google Play Store

**翻页：** [上一页：061 Headless JS](061-HeadlessJS.md) · [目录](README.md) · [下一页：063 Communication between native and React Native](063-CommunicationBetweenNativeAndReactNative.md)

**官方页面：** [Publishing to Google Play Store · React Native](https://reactnative.dev/docs/signed-apk-android)  
**版本范围：** 由 RN 0.87 指南整理。Google Play Console 要求会更新，上传前以当前 Play Console/Android 官方说明核对。  
**源页代码覆盖：** Windows/macOS `keytool` 生成 upload keystore、Gradle signing variables/config、AAB release 命令与输出、Release 本机测试、ABI APK split、Proguard 开关和默认权限说明。

## 签名密钥和 Upload Key

Android 发布包必须数字签名。Google Play App Signing 可由 Play 管理最终分发用签名密钥；开发者上传构建产物前仍需 upload key。为应用生成密钥的工具是 JDK 自带的 `keytool`。下面是官方页面的参数轮廓，使用自己的唯一文件名/alias，并在提示中填写强密码：

```sh
# Windows：从 JDK bin 目录的管理员命令行运行
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-upload-key.keystore -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# macOS：找到 JDK 后，进入 JDK bin 目录运行
keytool -genkey -v -storetype PKCS12 \
  -keystore my-upload-key.keystore -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

生成过程会询问密码与证书 Distinguished Name 信息。Keystore 和密码是发布凭证：离线安全备份、限制访问，不要打包进公开源码库或写进截图/日志。丢失或泄漏会影响后续发布，应尽快按 Google Play 官方流程轮换/重置 upload key。

macOS 可用下面命令定位 JDK 根目录，再进入 `bin/` 执行 `keytool`：

```sh
/usr/libexec/java_home
```

## 将密码提供给 Gradle

把 upload keystore 放到 Android App 模块可读取的位置。签名变量可以放在用户级 `~/.gradle/gradle.properties`，减少将密码写入项目 Gradle 文件的机会；也可用本地安全环境/CI secret 注入。

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=<安全保存的store密码>
MYAPP_UPLOAD_KEY_PASSWORD=<安全保存的key密码>
```

不要把 `<...>` 占位符原样运行。官方页面建议用用户 Gradle properties 避免把明文密钥配置加入项目；CI 应用加密 secret 管理。

在 `android/app/build.gradle` 中配置 Release signing：

```gradle
android {
  signingConfigs {
    release {
      if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
      }
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

只有本机/CI 的 release 配置读取到凭证才会完成签名；不要把 debug signing 配置误作商店发布密钥。

## 构建 AAB 与测试 Release

React Native CLI Release build 会调用 Gradle `bundleRelease`，把 JavaScript bundle 与资源一起放入 App Bundle（AAB）。官方命令和输出路径如下：

```sh
npx react-native build-android --mode=release
```

```text
android/app/build/outputs/bundle/release/app-release.aab
```

确认 `gradle.properties` 没有启用旧 `org.gradle.configureondemand=true`，否则构建可能跳过 JS/assets 的 bundling。上传前卸载旧安装包并在设备测试 Release 版本：

```sh
npm run android -- --mode="release"
# 或
yarn android --mode release
```

Release 包已内嵌 JavaScript bundle，不必保持 Metro 运行。若项目用了非默认 JS bundle 文件名/资源目录，需要相应更新 App Gradle 打包配置。

## 其他商店的 APK 架构拆分

AAB/Play 可为不同设备优化交付；若面向其他 market 分发 APK，单个 APK 默认包含多个 ABI，兼容范围大但体积更大。Gradle 可按 ABI 输出多个 APK：

```gradle
android {
  splits {
    abi {
      reset()
      enable true
      universalApk false
      include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
    }
  }
}
```

支持设备定向下载的商店可以选择对应 APK；只支持上传一个 APK 的商店可把 `universalApk` 设为 true 生成通用包。拆分 APK 的 version code 也要按 Android 官方建议设置不同值。

## 可选 Proguard

Proguard/R8 可剔除未使用的 Java bytecode，减小部分 APK 体积。启用需在 Release 构建类型中打开 shrink/minify，并为项目用到的每个原生库配置必要 keep rules。RN 指南提醒启用后要充分测试；若库反射/动态加载代码，规则不完整会造成 Release 运行错误。

```gradle
def enableProguardInReleaseBuilds = true
```

## 发布注意事项

- 页面建议旧工程迁到 Google Play App Signing，便于使用应用签名与设备优化分发。
- `INTERNET` 权限默认会加到 Android App；`SYSTEM_ALERT_WINDOW` 仅 Debug 构建存在，Release 会移除。
- Expo 工程的构建/提交应走 Expo 官方 Play Store 发布指南；本页重点是手工管理 Android Release signing 的裸 RN 流程。

**翻页：** [上一页：061 Headless JS](061-HeadlessJS.md) · [目录](README.md) · [下一页：063 Communication between native and React Native](063-CommunicationBetweenNativeAndReactNative.md)
