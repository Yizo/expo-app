# Create a release build locally 学习整理

## 文档解决的问题

这篇文档讲的是：如何在本地为 Expo 项目生成 Android 和 iOS 的 release / production build，并准备应用商店提交流程所需的签名和打包步骤。

对 React Web 开发者来说，这相当于从“本地开发模式”进入“真正产出可分发二进制”的阶段。这里不再只是构建前端资源，而是要处理 Android keystore、Gradle 签名配置、Xcode 签名与归档。

## 适用场景

- 你要在自己电脑上生成 Android 发布包。
- 你要在本地用 Xcode 生成 iOS 发布包并上传到 App Store Connect。
- 你不依赖云端 EAS Build，而是自己掌控本地构建流程。
- 你需要理解应用商店发布前的原生签名步骤。

## 阅读前需要理解的背景知识

- **release build / production build**：面向发布的构建，和调试版不同。
- **签名**：移动应用发布的必要步骤。Web 站点部署通常不需要这一层，但原生 App 必须有。
- **keystore / upload key**：Android 用于签名上传包的密钥材料。
- **App Store Connect**：Apple 的应用分发和提交流程后台。
- **CNG / prebuild**：如果项目依赖 Expo 生成原生工程，需要先有 `android` / `ios` 目录。

## Android 部分

### 文档要解决的核心问题

Android 本地发布的关键不只是“打包”，而是：

1. 拥有签名所需的 upload key。
2. 把签名信息写进 Gradle 配置。
3. 生成 `.aab` 文件。

### 前置条件

- 已安装 OpenJDK，用于使用 `keytool`。
- 已有 `android` 目录；如果采用 CNG，需要先运行 `npx expo prebuild`。

### 1. 创建或获取 upload key

如果以前已经用 EAS Build 创建过构建，文档建议先通过：

```sh
eas credentials -p android
```

下载已有凭据，然后：

- 下载 `credentials.json`
- 把 `keystore.jks` 移到 `android/app`
- 记录 keystore password、key alias、key password

如果没有现成凭据，则在项目目录执行：

```sh
sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

这会生成 keystore 文件，随后需要把它移动到 `android/app`。

### 2. 在 `gradle.properties` 中写入签名变量

文档要求在 `android/gradle.properties` 末尾添加：

```ruby
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

这些变量分别表示：

- keystore 文件路径
- key alias
- keystore 密码
- key 密码

文档特别提醒：如果你会提交 `android` 目录到 Git，不要把这些敏感信息直接提交进去。更安全的做法是放到本机的 `~/.gradle/gradle.properties`。

### 3. 在 `android/app/build.gradle` 中加入签名配置

文档明确要求这么做，但当前页面内容里**没有展示具体的 `build.gradle` 代码块**。这意味着你知道“需要配置签名”，但必须另外查看 Gradle / Expo 相关具体配置示例。

### 4. 生成 `.aab`

在 `android` 目录执行：

```sh
cd android
./gradlew app:bundleRelease
```

输出文件位置：

- `android/app/build/outputs/bundle/release/app-release.aab`

### 5. 首次提交 Google Play 的限制

文档明确说明：第一次提交 `.aab` 到 Google Play Console，需要手动提交流程。

## iOS 部分

### 文档要解决的核心问题

iOS 本地发布依赖 Xcode 处理签名、归档和上传，核心是让 Xcode 知道：

- 你属于哪个 Apple Developer Team
- 当前 Scheme 的 Build Configuration 是 Release
- 归档后要上传到 App Store Connect

### 前置条件

- 付费 Apple Developer membership
- 已安装 Xcode
- 已有 `ios` 目录；如果用 CNG，需要先 `npx expo prebuild`

### 1. 打开 iOS workspace

命令：

```sh
xed ios
```

这会用 Xcode 打开 iOS 工程。

### 2. 配置签名

文档要求在 Xcode 中：

1. 选中 app workspace
2. 进入 **Signing & Capabilities**
3. 选择 **All** 或 **Release**
4. 在 **Team** 中选择你的 Apple Developer team

Xcode 会自动生成 Provisioning Profile 和 Signing Certificate。

### 3. 配置 Release scheme

在：

- **Product** > **Scheme** > **Edit Scheme**

里，把 **Run** 的 **Build configuration** 改成 **Release**。

### 4. 进行发布构建

菜单路径：

- **Product** > **Build**

这一步只是构建 release 二进制。

### 5. 归档并上传

菜单路径：

1. **Product** > **Archive**
2. 在 **Archives** 中点 **Distribute App**
3. 选择 **App Store Connect**
4. 按提示创建记录并上传

之后就可以在 App Store Connect 里做 TestFlight 测试或正式发布。

## 命令、配置与文件说明

### Android

- `eas credentials -p android`：下载已保存在 EAS 的 Android 签名凭据。
- `keytool -genkey ...`：本地生成 upload key。
- `android/app/`：keystore 所在目录。
- `android/gradle.properties`：保存 Gradle 读取的签名变量。
- `android/app/build.gradle`：应用签名配置的地方。
- `./gradlew app:bundleRelease`：生成 Android App Bundle。

### iOS

- `xed ios`：用 Xcode 打开 iOS 工程。
- `Signing & Capabilities`：配置 Apple Team、签名与权限。
- `Scheme > Run > Build configuration = Release`：确保用 Release 配置构建。
- `Archive`：准备上传到 App Store Connect。

## 注意事项、限制条件与坑点

- Android keystore 文件和密码都是敏感信息，文档明确要求不要提交到版本库。
- 本文只覆盖本地发布流程，不代表你已经完成商店全部上架配置。
- iOS 本地发布需要付费 Apple Developer 会员。
- Android 首次提交 `.aab` 时，Google Play 需要手动提交。
- 当前页面内容没有给出 `build.gradle` 的完整签名配置代码，实际操作时还需要补齐这部分。

## React Web 开发者最容易误解的点

- **误解 1：release 只是“打包更大一点的前端资源”。**
  实际上这里的重点是原生签名、原生工具链和商店分发格式。
- **误解 2：Android 和 iOS 的发布流程差不多。**
  文档里可以看出两边差异很大：Android 更偏 Gradle + keystore，iOS 更偏 Xcode + Apple 平台流程。
- **误解 3：有了二进制文件就能直接上架。**
  文档显示你还要满足各平台的签名和后台提交流程要求。

## 实际开发建议

- 基于经验建议：把签名文件、签名密码和源码仓库分离管理。
- 基于文档内容推导：如果团队没有强需求，本地手工发布流程的维护成本会比较高，尤其是 iOS。
- 基于文档内容推导：Android 的 keystore 与 iOS 的 Team / Profile 都属于“发布基础设施”，应当早建立、早备份、早共享流程。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Android 本地 release 需要 upload key 并生成 `.aab`。
- 可以从 EAS 下载已有 Android 凭据。
- 签名变量应写入 `gradle.properties`。
- iOS 本地发布需要 Xcode 和 Apple Developer membership。
- iOS 发布通过 Xcode 的 Archive + Distribute App + App Store Connect 完成。

### 基于文档内容推导

- 本地发布比本地调试构建更依赖原生平台知识。
- Android 与 iOS 发布链路应分别文档化，不能简单抽象成同一套步骤。
- 对团队而言，签名资产管理和凭据保管本身就是独立工作。

## 当前文档未涉及

- `build.gradle` 的完整签名配置示例
- 应用截图、商店文案、审核材料准备
- iOS 证书问题排查
- Android 多渠道包或 flavor 的发布策略
