# 在本地创建发布版本（Release Build）

> 原文地址：https://docs.expo.dev/guides/local-app-production/

## 概述

要在本地为你的 Expo 应用创建**发布版本**（也称为生产版本 / Production Build），你需要在计算机上使用原生工具分别完成 Android 和 iOS 的构建步骤。本指南将详细介绍两个平台的完整流程。

> **什么是 Release Build？**
> Release Build 是经过优化、签名后的应用版本，用于提交到应用商店供用户下载使用。它与开发阶段使用的 Debug Build 不同——Debug Build 包含调试信息，体积较大且运行较慢；Release Build 则经过代码压缩和性能优化。

---

## Android

在本地为 Android 创建发布版本，需要使用**上传密钥（Upload Key）**对应用进行签名，并生成 **Android Application Bundle（.aab）** 格式的文件。

> **关键术语解释：**
> - **Upload Key（上传密钥）**：Google Play 用于验证应用身份的加密证书。每个应用在 Google Play 上都有唯一的密钥，防止他人伪造你的应用。
> - **.aab（Android Application Bundle）**：Google Play 要求的应用发布格式。与传统的 .apk 不同，.aab 允许 Google Play 根据用户设备自动生成优化的安装包，减小下载体积。
> - **Keystore（密钥库）**：存储密钥的文件，通常以 `.keystore` 或 `.jks` 为扩展名。

### 前提条件

1. **安装 OpenJDK**：安装 [OpenJDK 发行版](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local#install-watchman-and-jdk) 以便使用 `keytool` 命令。

   > `keytool` 是 Java 开发工具包（JDK）自带的密钥管理工具，用于生成和管理密钥库。

2. **生成 android 目录**：如果你使用的是[持续原生生成（CNG，Continuous Native Generation）](https://docs.expo.dev/workflow/continuous-native-generation/)，需要先运行以下命令生成原生目录：

   ```sh
   npx expo prebuild
   ```

   > **什么是 CNG？** 持续原生生成是 Expo 的一种工作模式——项目的原生代码（android/ 和 ios/ 目录）不直接保存在仓库中，而是每次需要时通过 `npx expo prebuild` 根据配置自动生成。这样可以避免原生代码与 JavaScript 代码之间的同步问题。

---

### 第一步：创建上传密钥

<details>
<summary>如果你之前已经使用 EAS Build 创建过构建，可以下载已有的凭证，跳过此步骤。</summary>

如果你已经通过 EAS Build 创建过构建，可以按照以下步骤下载凭证（其中包含上传密钥及其密码、密钥别名和密钥密码）：

1. 在终端中运行 `eas credentials -p android`，然后选择构建配置文件（build profile）。
2. 选择 **credentials.json** > **Download credentials from EAS to credentials.json**（从 EAS 下载凭证到 credentials.json）。
3. 将下载的 **keystore.jks** 文件移动到 **android/app** 目录。
4. 从 **credentials.json** 中复制上传密钥库密码（upload keystore password）、密钥别名（key alias）和密钥密码（key password）的值，下一步会用到。

> **什么是 EAS Build？** EAS Build 是 Expo 提供的云端构建服务，可以在云端为你编译原生应用，无需本地安装完整的原生开发环境。如果你之前使用过 EAS Build，你的签名凭证已经保存在 EAS 服务器上，可以直接下载复用。

</details>

在你的 Expo 项目目录中，运行以下 `keytool` 命令来创建上传密钥：

```sh
sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

> **命令参数说明：**
> - `-keystore my-upload-key.keystore`：生成的密钥库文件名
> - `-alias my-key-alias`：密钥的别名，后续配置中需要引用
> - `-keyalg RSA`：使用 RSA 加密算法
> - `-keysize 2048`：密钥长度为 2048 位
> - `-validity 10000`：密钥有效期为 10000 天（约 27 年）

运行此命令后，系统会提示你输入一个密码来保护密钥库。**请记住这个密码**，后续步骤中需要使用。

此命令会在项目目录中生成名为 **my-upload-key.keystore** 的文件。将其移动到 **android/app** 目录。

> ⚠️ **警告**：如果你将 **android** 目录提交到 Git 等版本控制系统，**不要提交此密钥库文件**。它包含你的上传密钥，必须保持私密。

---

### 第二步：更新 Gradle 变量

打开 **android/gradle.properties** 文件，在文件末尾添加以下 Gradle 变量。将 `*****` 替换为你在上一步中设置的正确的密钥库密码和密钥密码。

这些变量包含你的上传密钥信息：

```ruby
# 如果你通过 `eas credentials` 命令下载了凭证，请参考下方注释获取每个值的来源。

# 密钥库文件的路径
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
# 替换为 credentials.json 文件中 `keystore.keyAlias` 字段的值
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
# 替换为 credentials.json 文件中 `keystore.password` 字段的值
MYAPP_UPLOAD_STORE_PASSWORD=*****
# 替换为 credentials.json 文件中 `keystore.keyPassword` 字段的值
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

> ⚠️ **警告**：如果你将 **android** 目录提交到 Git 等版本控制系统，**不要提交上述信息**。取而代之的做法是：在你的计算机上创建 **~/.gradle/gradle.properties** 文件，将上述变量添加到该文件中。

> 基于经验建议：`~/.gradle/gradle.properties` 是 Gradle 的用户级配置文件，位于你的主目录下，不会被提交到项目的 Git 仓库中。这是存储敏感信息（如密钥密码）的安全位置。

---

### 第三步：在 build.gradle 中添加签名配置

打开 **android/app/build.gradle** 文件，添加以下配置。

以下是需要添加的变更（以 diff 格式展示，`+` 号开头的行表示需要新增的内容）：

```groovy
android {
    // ... 其他配置 ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        // ✅ 新增 release 签名配置
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
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            // ✅ 新增：为 release 构建类型指定签名配置
            signingConfig signingConfigs.release
            shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

> **代码说明：**
> - `signingConfigs.release`：定义了发布版本的签名配置，引用了第二步中设置的 Gradle 变量。
> - `project.hasProperty('MYAPP_UPLOAD_STORE_FILE')`：这是一个安全检查——只有在变量存在时才使用签名配置。这样即使在其他机器上没有配置密钥库密码，项目仍然可以正常编译（只是不会包含签名）。
> - `signingConfig signingConfigs.release`：将 `release` 构建类型与上面定义的签名配置关联起来。

---

### 第四步：生成发布版 Android Application Bundle（.aab）

进入 **android** 目录，运行 Gradle 的 `bundleRelease` 命令来生成 .aab 格式的发布版本：

```sh
cd android
./gradlew app:bundleRelease
```

此命令会在 **android/app/build/outputs/bundle/release** 目录下生成 **app-release.aab** 文件。

> **什么是 Gradle？** Gradle 是 Android 项目使用的构建工具，负责编译代码、打包应用、管理依赖等。`./gradlew` 是 Gradle Wrapper，它会自动下载正确版本的 Gradle，无需手动安装。

---

### 第五步：手动提交应用到 Google Play Console

Google Play Store 在首次提交 **.aab** 文件时，要求手动提交应用。

> 首次提交需要手动操作，后续版本可以通过自动化工具提交。参考 [手动提交 Android 应用指南](https://expo.fyi/first-android-submission) 了解详细步骤。

---

## iOS

要在本地为 Apple App Store 创建 iOS 发布版本，你需要使用 **Xcode** 来处理签名和通过 App Store Connect 提交应用。

> **关键术语解释：**
> - **Xcode**：Apple 官方的集成开发环境（IDE），用于开发 iOS/macOS 应用。Expo 项目的 iOS 部分需要在 Xcode 中进行签名和发布操作。
> - **App Store Connect**：Apple 提供的 Web 平台，用于管理应用的发布、测试分发（TestFlight）、收入报告等。
> - **TestFlight**：Apple 官方的 Beta 测试平台，允许你在正式发布前将应用分发给测试人员。
> - **Provisioning Profile（描述文件）**：Apple 用来控制应用安装权限的配置文件，包含开发者证书、设备列表和应用标识符。
> - **Release Scheme（发布方案）**：Xcode 中的构建设置，决定了编译时使用 Debug 还是 Release 配置。Release 配置会启用代码优化并移除调试信息。

### 前提条件

1. **Apple 开发者账号**：需要一个付费的 Apple Developer 会员资格来签名和提交 iOS 应用。

2. **安装 Xcode**：在计算机上[安装 Xcode](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local#set-up-xcode-and-watchman)。

3. **生成 ios 目录**：如果你使用的是[持续原生生成（CNG）](https://docs.expo.dev/workflow/continuous-native-generation/)，需要先运行以下命令生成原生目录：

   ```sh
   npx expo prebuild
   ```

---

### 第一步：在 Xcode 中打开 iOS 工作空间

在你的 Expo 项目目录中，运行以下命令来在 Xcode 中打开 `your-project.xcworkspace`：

```sh
xed ios
```

> `xed` 是 Xcode 提供的命令行工具，用于从终端打开 Xcode 项目或工作空间。

在 Xcode 中打开 iOS 项目后：

1. 从左侧边栏选择你的应用的工作空间（workspace）。
2. 进入 **Signing & Capabilities**（签名与功能）选项卡，选择 **All** 或 **Release**。
3. 在 **Signing**（签名）> **Team**（团队）下，确保选择了你的 Apple Developer 团队。Xcode 会自动生成一个自动管理的 Provisioning Profile（描述文件）和 Signing Certificate（签名证书）。

> 基于经验建议：选择"自动管理签名"（Automatically manage signing）是最简单的方式，Xcode 会自动处理描述文件和证书的创建与更新。对于大多数项目来说，这比手动管理要方便得多。

---

### 第二步：配置 Release Scheme（发布方案）

要配置应用的发布方案：

1. 从菜单栏打开 **Product** > **Scheme** > **Edit Scheme**（产品 > 方案 > 编辑方案）。
2. 从侧边栏选择 **Run**（运行），然后将 **Build configuration**（构建配置）的下拉菜单设置为 **Release**。

> **为什么要切换到 Release 配置？** Debug 配置包含调试符号和开发辅助功能，会增大应用体积并降低运行速度。Release 配置会启用编译器优化、移除调试代码，使应用达到最佳性能。

---

### 第三步：构建发布版本

要构建发布版本的应用，从菜单栏打开 **Product** > **Build**（产品 > 构建）。此步骤将为 Release 模式编译应用二进制文件。

---

### 第四步：通过 App Store Connect 提交应用

构建完成后，你可以将应用分发到 TestFlight 或提交到 App Store：

1. 从菜单栏打开 **Product** > **Archive**（产品 > 归档）。

   > **Archive（归档）**是将应用打包为可分发格式的过程。归档后的文件包含应用二进制文件和调试符号，便于后续的发布和问题追踪。

2. 归档完成后，在右侧边栏的 **Archives**（归档列表）中点击 **Distribute App**（分发应用）。

3. 点击 **App Store Connect**，然后按照窗口中的提示操作。此步骤会创建一个 App Store 记录并将你的应用上传到 App Store。

4. 现在你可以前往 App Store Connect 网页端，在 **Apps**（应用）下选择你的应用，然后：
   - 通过 **TestFlight** 提交应用进行测试分发
   - 或按照 App Store Connect 仪表板中的步骤准备最终发布

---

## 完整流程总结

### Android 流程

| 步骤 | 操作 | 产出 |
|------|------|------|
| 1 | 创建上传密钥 | `my-upload-key.keystore` 文件 |
| 2 | 更新 Gradle 变量 | `gradle.properties` 中添加密钥信息 |
| 3 | 添加签名配置 | `build.gradle` 中配置 release 签名 |
| 4 | 生成 AAB | `app-release.aab` 文件 |
| 5 | 提交到 Google Play | 应用上架（首次需手动提交） |

### iOS 流程

| 步骤 | 操作 | 产出 |
|------|------|------|
| 1 | 在 Xcode 中打开工作空间并配置签名 | 自动管理签名证书 |
| 2 | 配置 Release Scheme | 构建模式切换为 Release |
| 3 | 构建应用 | 编译 Release 二进制文件 |
| 4 | 通过 App Store Connect 分发 | 上传到 TestFlight 或 App Store |

---

## 常见问题

### 密钥库文件丢失怎么办？

如果丢失了上传密钥库文件且无法恢复，你需要联系 Google Play 支持团队请求重置上传密钥。这就是为什么强烈建议安全备份密钥库文件的原因。

基于经验建议：将密钥库文件备份到安全的云存储或加密的外部存储设备中，并确保团队中有多人知道备份位置。

### iOS 构建时签名报错怎么办？

基于经验建议：确认以下几点：
- Apple Developer 账号处于有效状态（未过期）
- Xcode 中选择了正确的开发团队
- 网络连接正常（Xcode 需要与 Apple 服务器通信以验证证书）
- 如果使用了自动管理签名，尝试在 Xcode 的 Signing & Capabilities 面板中点击"Fix Issue"按钮

---

## 文档导航

- **上一页**：[local app development](./17__local-app-development.md)
- **下一页**：[cache builds remotely](./19__cache-builds-remotely.md)
