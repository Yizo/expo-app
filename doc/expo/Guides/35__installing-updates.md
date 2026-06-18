# 在已有的 React Native 项目中安装 expo-updates

> **原文地址**：https://docs.expo.dev/bare/installing-updates/

---

## 概述

`expo-updates` 是一个库，它使你的应用能够管理**远程更新**（remote updates）——即在不重新发布到应用商店的情况下，通过网络将 JavaScript 代码、资源文件等的更新推送给用户。该库会与配置好的远程更新服务通信，获取可用更新的相关信息。

本指南将讲解如何在一个**裸工作流**（bare workflow）的 React Native 项目中配置 `expo-updates`，使其能够配合 [EAS Update](https://docs.expo.dev/eas-update/introduction/) 使用。EAS Update 是 Expo 提供的**托管远程更新服务**，它附带了一系列工具来简化 `expo-updates` 库的安装和配置。

> **关键术语解释**：
> - **裸工作流（Bare Workflow）**：指使用 React Native CLI（而非 `create-expo-app`）初始化的项目，开发者可以直接访问和修改原生代码（Android 的 Java/Kotlin、iOS 的 Swift/Objective-C）。与之相对的是"托管工作流"（Managed Workflow），后者由 Expo 自动管理原生层。
> - **EAS Update**：Expo Application Services（EAS）的一部分，是一个云端服务，允许你发布 JavaScript 层面的更新，用户打开应用时会自动检查并下载这些更新。
> - **expo-updates**：一个原生模块（Native Module），在应用启动时负责与更新服务器通信、下载更新包、并在下次启动时加载新代码。
> - **Continuous Native Generation（CNG，持续原生代码生成）**：一种工作流，其中 `android/` 和 `ios/` 目录由 Expo 的 prebuild 工具自动管理，每次构建时都会重新生成。如果你的项目使用 CNG，本指南**不适用**，请查阅 [EAS Update "开始使用"](https://docs.expo.dev/eas-update/getting-started/)。

---

## 前提条件

> **注意**：如果你使用 `npx @react-native-community/cli@latest init` 创建了项目，并且没有安装任何其他 Expo 库，你需要先[安装 Expo modules](https://docs.expo.dev/bare/installing-expo-modules/)，然后才能继续本指南的步骤。

> **基于经验建议**：在开始之前，确保你的项目已经能成功编译运行。如果在安装 `expo-updates` 后出现编译错误，先回退到能正常运行的状态，再逐步排查问题。保持 Git 提交干净是一个好习惯。

---

## 安装

首先，安装 `expo-updates` 包：

```sh
# npm
npx expo install expo-updates

# yarn
yarn expo install expo-updates

# pnpm
pnpm expo install expo-updates

# bun
bun expo install expo-updates
```

> **关键术语解释**：
> - **`npx expo install`**：这是 Expo CLI 提供的安装命令，它会根据你的 Expo SDK 版本自动选择兼容的包版本。相比直接使用 `npm install`，它能避免因版本不匹配导致的兼容性问题。
> - **包管理器**：npm、yarn、pnpm、bun 都是 JavaScript 的包管理工具，用于下载和管理项目依赖。你只需选择你项目正在使用的那一个即可。

然后，为 iOS 安装 CocoaPods 依赖：

```sh
# npm
npx pod-install

# yarn
yarn dlx pod-install

# pnpm
pnpm dlx pod-install

# bun
bunx pod-install
```

> **关键术语解释**：
> - **CocoaPods**：iOS/macOS 平台的依赖管理工具，类似于 npm 之于 JavaScript。iOS 项目中的原生依赖（如 `expo-updates` 的原生 iOS 代码）需要通过 CocoaPods 来安装。
> - **`pod-install`**：一个便捷脚本，它会自动进入 `ios/` 目录并执行 `pod install`，安装或更新所有原生依赖。

---

## 配置 expo-updates 库

按照以下各节的 diff 说明，对你的项目进行配置。

> **关键术语解释**：
> - **Diff（差异对比）**：一种展示文件变更的方式。以 `+` 开头的行表示新增的内容，以 `-` 开头的行表示被删除的内容，没有前缀的行表示上下文（未修改的部分）。

### JavaScript 和 JSON 配置

运行以下命令，在 **app.json** 中设置 `updates` URL 和 `projectId`：

```sh
eas update:configure
```

> **关键术语解释**：
> - **`eas update:configure`**：EAS CLI 提供的命令，它会自动在 `app.json` 中写入正确的更新服务 URL 和项目 ID。你不需要手动查找或填写这些值。
> - **`app.json`**：Expo 项目的主配置文件，包含应用的名称、图标、启动画面、更新配置等信息。
> - **`projectId`**：你的项目在 EAS 服务中的唯一标识符。

修改 **app.json** 中的 `expo` 部分。如果你使用 `npx @react-native-community/cli@latest init` 创建了项目，你需要添加以下内容，包括 [`updates` URL](https://docs.expo.dev/versions/latest/config/app/#url)：

```diff
 {
   "displayName": "MyApp",
+  "expo": {
+    "name": "MyApp",
+    "slug": "MyApp",
+    "ios": {
+      "bundleIdentifier": "com.MyApp"
+    },
+    "android": {
+      "package": "com.MyApp"
+    },
+    "runtimeVersion": "1.0.0",
+    "updates": {
+      "url": "https://u.expo.dev/[your-project-id]"
+    },
+    "extra": {
+      "eas": {
+        "projectId": "[your-project-id]"
+      }
+    }
+  }
 }
```

> **说明**：上面示例中的 `updates` URL 和 `projectId` 是配合 EAS Update 使用的。运行 `eas update:configure` 时，EAS CLI 会自动为 EAS Update 服务正确设置此 URL。你需要将 `[your-project-id]` 替换为你实际的项目 ID。

> **关键术语解释**：
> - **`slug`**：项目在 Expo 生态中的 URL 友好标识符，通常与应用名称相同（使用小写字母和连字符）。
> - **`bundleIdentifier`（iOS）**：iOS 应用的唯一标识符，格式为反向域名（如 `com.MyApp`）。它在 App Store 和设备上唯一标识你的应用。
> - **`package`（Android）**：Android 应用的唯一标识符，同样是反向域名格式。
> - **`runtimeVersion`**：运行时版本号，用于确定哪些更新可以应用于当前版本的应用。当原生代码发生变化时（如升级了 React Native 版本），需要更新此值。只有 `runtimeVersion` 匹配的更新才会被推送给用户。

如果你想使用[自定义 `expo-updates` 服务器](https://github.com/expo/custom-expo-updates-server)，请在 **app.json** 中将 `updates.url` 修改为你的 URL：

```diff
   "expo": {
     "name": "MyApp",
-    "updates": {
-      "url": "https://u.expo.dev/[your-project-id]"
-    }
+    "updates": {
+      "url": "http://localhost:3000/api/manifest"
+    }
   }
 }
```

---

### Android 配置

#### 1. 修改 build.gradle

修改 **android/app/build.gradle**，添加对 JS 引擎配置（JSC 或 Hermes）的检查：

```diff
     //
     //   The list of flags to pass to the Hermes compiler. By default is "-O", "-output-source-map"
     // hermesFlags = ["-O", "-output-source-map"]
+    // Override `hermesEnabled` by `expo.jsEngine`
+    ext {
+    hermesEnabled = (findProperty('expo.jsEngine') ?: "hermes") == "hermes"
+    }
+
     entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", rootDir.getAbsoluteFile().getParentFile().getAbsolutePath(), "android", "absolute"].execute(null, rootDir).text.trim())
     cliFile = new File(["node", "--print", "require.resolve('@expo/cli')"].execute(null, rootDir).text.trim())
     bundleCommand = "export:embed"
```

> **关键术语解释**：
> - **Gradle**：Android 项目的构建工具，类似于 npm scripts 之于 JavaScript 项目。`build.gradle` 文件定义了项目的构建配置、依赖和编译选项。
> - **Hermes**：Facebook（现 Meta）为 React Native 开发的 JavaScript 引擎，相比旧的 JSC 引擎，它能显著提升应用启动速度和内存使用效率。从 React Native 0.70 开始，Hermes 是默认引擎。
> - **`hermesEnabled`**：一个 Gradle 属性，控制是否启用 Hermes 引擎。上面的代码让它根据 `expo.jsEngine` 配置来决定，如果没有配置则默认使用 Hermes。
> - **`findProperty`**：Gradle 的内置方法，用于查找配置属性。`?:` 是 Groovy（Gradle 使用的脚本语言）的空值合并操作符。

#### 2. 修改 AndroidManifest.xml

修改 **android/app/src/main/AndroidManifest.xml**，添加 `expo-updates` 的配置 XML，使其与 **app.json** 的内容匹配：

```diff
         <data android:scheme="myapp"/>
       </intent-filter>
     </activity>
+    <meta-data android:name="expo.modules.updates.ENABLED" android:value="true"/>
+    <meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="ALWAYS"/>
+    <meta-data android:name="expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS" android:value="0"/>
+    <meta-data android:name="expo.modules.updates.EXPO_UPDATE_URL" android:value="https://u.expo.dev/[your-project-id]"/>
+    <meta-data android:name="expo.modules.updates.EXPO_RUNTIME_VERSION" android:value="@string/expo_runtime_version"/>
   </application>
 </manifest>
```

> **关键术语解释**：
> - **AndroidManifest.xml**：Android 应用的核心配置文件，声明了应用的所有 Activity（界面）、权限、服务等。`<meta-data>` 标签用于存储键值对形式的配置信息。
> - **`ENABLED`**：启用/禁用更新功能。设为 `true` 表示启用。
> - **`EXPO_UPDATES_CHECK_ON_LAUNCH`**：设为 `ALWAYS` 表示每次应用启动时都会检查更新。也可以设为 `NEVER`（不自动检查）或 `WIFI_ONLY`（仅在 WiFi 下检查）。
> - **`EXPO_UPDATES_LAUNCH_WAIT_MS`**：等待更新下载的最大时间（毫秒）。设为 `0` 表示不等待，立即使用已有的版本启动，后台继续下载更新，下次启动时生效。
> - **`EXPO_UPDATE_URL`**：更新服务的地址。你需要将 `[your-project-id]` 替换为你的实际项目 ID。
> - **`EXPO_RUNTIME_VERSION`**：运行时版本号，这里引用了 `strings.xml` 中定义的字符串资源。

#### 3. 本地开发服务器配置（可选）

如果你使用的是本地非 HTTPS 的更新服务器（例如自定义服务器运行在本机），你需要修改 **android/app/src/main/AndroidManifest.xml**，添加更新服务器 URL 并启用明文流量传输：

```diff
 <application
   android:name=".MainApplication"
   android:label="@string/app_name"
   android:icon="@mipmap/ic_launcher"
   android:roundIcon="@mipmap/ic_launcher_round"
   android:allowBackup="false"
   android:theme="@style/AppTheme"
+  android:usesCleartextTraffic="true"
 >
-  <meta-data android:name="expo.modules.updates.EXPO_UPDATE_URL" android:value="https://u.expo.dev/[your-project-id]" />
+  <meta-data android:name="expo.modules.updates.EXPO_UPDATE_URL" android:value="http://localhost:3000/api/manifest"/>
 </application>
```

> **警告**：`usesCleartextTraffic="true"` 允许应用通过 HTTP（非加密）进行网络通信。这在生产环境中是一个**安全风险**，因为它允许所有明文流量。仅在本地开发时使用此配置，生产环境必须使用 HTTPS。

> **基于经验建议**：如果你只需要为特定域名启用明文流量（更安全的方式），可以在 AndroidManifest.xml 中配置 `networkSecurityConfig` 来指定允许的域名，而不是全局开启 `usesCleartextTraffic`。

#### 4. 添加运行时版本字符串

将 Expo 运行时版本字符串键添加到 **android/app/src/main/res/values/strings.xml**：

```diff
 <resources>
     <string name="app_name">MyApp</string>
+    <string name="expo_runtime_version">1.0.0</string>
 </resources>
```

> **关键术语解释**：
> - **strings.xml**：Android 项目的字符串资源文件，用于集中管理应用中使用的文本字符串。这里将运行时版本号 `1.0.0` 定义为一个可复用的字符串资源，供 AndroidManifest.xml 中的 `@string/expo_runtime_version` 引用。

---

### iOS 配置

#### 1. 创建 Podfile.properties.json

在 **ios** 目录中添加文件 **Podfile.properties.json**：

```json
// ios/Podfile.properties.json
{
  "expo.jsEngine": "hermes"
}
```

> **关键术语解释**：
> - **Podfile.properties.json**：Expo 使用的一个 JSON 配置文件，用于向 Podfile 传递配置参数。这里它指定了 JavaScript 引擎类型。
> - **Podfile**：CocoaPods 的配置文件，定义了 iOS 项目的所有原生依赖。类似于 Android 的 `build.gradle`。

#### 2. 修改 Podfile

修改 **ios/Podfile**，添加对 JS 引擎配置（JSC 或 Hermes）的检查：

```diff
 require Pod::Executable.execute_command('node', ['-p',
     {paths: [process.argv[1]]},
   )', __dir__]).strip

+require 'json'
+podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}
+
 platform :ios, min_ios_version_supported
 prepare_react_native_project!

@@ -28,6 +31,7 @@ target 'myapp' do

   use_react_native!(
     :path => config[:reactNativePath],
+    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
     # An absolute path to your application default.
     :app_path => "#{Pod::Config.instance.installation_root}/.."
   )
```

> **说明**：这段代码做了两件事：
> 1. 引入 `json` 库并读取 `Podfile.properties.json` 文件的内容。`rescue {}` 确保即使文件不存在也不会报错（会返回空哈希）。
> 2. 在 `use_react_native!` 调用中添加 `:hermes_enabled` 参数，逻辑为：如果 `expo.jsEngine` 未设置（`nil`）或设为 `"hermes"`，则启用 Hermes 引擎。

#### 3. 创建 Expo.plist

使用 Xcode，在 **ios/your-project/Supporting** 目录下添加 **Expo.plist** 文件，内容如下（与 **app.json** 的内容匹配）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>EXUpdatesCheckOnLaunch</key>
    <string>ALWAYS</string>
    <key>EXUpdatesEnabled</key>
    <true/>
    <key>EXUpdatesLaunchWaitMs</key>
    <integer>0</integer>
    <key>EXUpdatesRuntimeVersion</key>
    <string>1.0.0</string>
    <key>EXUpdatesURL</key>
    <string>http://localhost:3000/api/manifest</string>
  </dict>
</plist>
```

> **关键术语解释**：
> - **plist（Property List）**：Apple 平台上用于存储配置信息的标准文件格式，基于 XML。iOS 应用使用 plist 文件来存储各种配置，类似于 Android 的 `AndroidManifest.xml` 中的 `<meta-data>`。
> - **`EXUpdatesCheckOnLaunch`**：等同于 Android 的 `EXPO_UPDATES_CHECK_ON_LAUNCH`，设为 `ALWAYS` 表示每次启动都检查更新。
> - **`EXUpdatesEnabled`**：启用/禁用更新功能，等同于 Android 的 `ENABLED`。
> - **`EXUpdatesLaunchWaitMs`**：等同于 Android 的 `EXPO_UPDATES_LAUNCH_WAIT_MS`。
> - **`EXUpdatesRuntimeVersion`**：运行时版本号，必须与 `app.json` 中的 `runtimeVersion` 一致。
> - **`EXUpdatesURL`**：更新服务的 URL。如果你使用 EAS Update，这里应该是 `https://u.expo.dev/[your-project-id]`；如果使用自定义服务器，则填写你的服务器地址。

> **基于文档内容推导**：注意 plist 中的 URL 示例使用的是 `http://localhost:3000/api/manifest`（自定义服务器地址），而非 EAS Update 的默认地址。如果你使用 EAS Update，应确保此处与 `app.json` 中的 `updates.url` 一致，即使用 `https://u.expo.dev/[your-project-id]`。

> **基于经验建议**：通过 Xcode 添加 plist 文件时，右键点击项目导航器中的 Supporting 文件夹 → "Add Files to..." → 创建新的 Property List 文件。确保文件被正确添加到目标（Target）的 "Copy Bundle Resources" 构建阶段中，否则应用运行时将无法读取这些配置。

---

## 配置要点总结

| 配置项 | Android 文件 | iOS 文件 | 作用 |
|---|---|---|---|
| JS 引擎配置 | `build.gradle` | `Podfile.properties.json` + `Podfile` | 确保使用正确的 JavaScript 引擎（Hermes/JSC） |
| 更新开关 | `AndroidManifest.xml`（`ENABLED`） | `Expo.plist`（`EXUpdatesEnabled`） | 启用/禁用远程更新功能 |
| 启动时检查 | `AndroidManifest.xml`（`CHECK_ON_LAUNCH`） | `Expo.plist`（`EXUpdatesCheckOnLaunch`） | 控制每次启动是否检查更新 |
| 启动等待时间 | `AndroidManifest.xml`（`LAUNCH_WAIT_MS`） | `Expo.plist`（`EXUpdatesLaunchWaitMs`） | 等待更新下载的最大时间 |
| 更新服务 URL | `AndroidManifest.xml`（`UPDATE_URL`） | `Expo.plist`（`EXUpdatesURL`） | 更新服务的地址 |
| 运行时版本 | `strings.xml` | `Expo.plist`（`EXUpdatesRuntimeVersion`） | 确定哪些更新适用于当前应用版本 |

---

## 后续步骤

完成上述配置后，你可以继续以下操作：

1. **开始使用 EAS Update 与 EAS Build**：查看 EAS Update 的[入门指南](https://docs.expo.dev/eas-update/getting-started/)，了解如何将 EAS Build（云端构建）与 EAS Update（远程更新）结合使用。

2. **查阅 API 文档**：查看 [`expo-updates` API 参考](https://docs.expo.dev/versions/latest/sdk/updates/)，了解如何在代码中编程式地控制更新行为（例如手动检查更新、下载更新、强制重新加载等）。

3. **本地构建配合 EAS Update**：了解如何[直接使用 EAS Update 配合本地构建](https://docs.expo.dev/eas-update/standalone-service/)，无需通过 EAS Build 即可测试更新功能。

4. **自定义更新服务器**：`expo-updates` 也可以配合实现了 [Expo Updates 协议](https://docs.expo.dev/technical-specs/expo-updates-1/)的自定义服务器使用。参见 [`custom-expo-updates-server` 项目说明](https://github.com/expo/custom-expo-updates-server#readme)。

> **基于经验建议**：在将更新推送到生产环境之前，务必在开发环境和测试环境中充分验证更新流程。特别要注意 `runtimeVersion` 的管理——如果忘记更新它，可能会导致更新无法推送到新版本的用户。建议在 CI/CD 流程中自动化 `runtimeVersion` 的管理。

---

## 文档导航

- **上一页**：[using expo cli](./34__using-expo-cli.md)
- **下一页**：[install dev builds in bare](./36__install-dev-builds-in-bare.md)
