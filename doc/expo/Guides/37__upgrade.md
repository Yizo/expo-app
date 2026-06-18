# 原生项目升级助手 (Native Project Upgrade Helper)

> **原文地址**：https://docs.expo.dev/bare/upgrade/
>
> **最后更新时间**：2026 年 5 月 5 日

---

## 概述

当你在使用 **Bare Workflow**（裸工作流）的 Expo 项目中手动维护 `ios/` 和 `android/` 原生目录时，每次升级 Expo SDK 都需要对原生代码进行相应的修改。然而，要准确找出"到底需要改哪些文件、改什么内容"往往非常困难。

本页提供了一个**逐文件对比工具**，可以展示从一个 SDK 版本升级到另一个 SDK 版本时，原生目录中所有需要变更的内容。它类似于社区中的 **React Native Upgrade Helper**，但专门针对 Expo 模块生态系统。

### 关键术语解释

| 术语 | 说明 |
|------|------|
| **Bare Workflow（裸工作流）** | Expo 的一种项目模式，开发者直接管理 `ios/` 和 `android/` 原生目录，拥有对原生代码的完全控制权。与之对应的是 **Managed Workflow**（托管工作流），后者由 Expo 自动处理原生层。 |
| **Expo SDK** | Expo 提供的开发工具包，包含一组经过兼容性测试的 React Native 版本和原生模块。每个 SDK 版本（如 SDK 55、SDK 56）都对应特定的依赖版本和原生配置。 |
| **原生目录（native directories）** | 项目中的 `ios/` 和 `android/` 文件夹，包含平台特定的构建配置和原生代码。 |
| **CNG（Continuous Native Generation，持续原生生成）** | Expo 提供的一种机制，通过 `expo prebuild` 命令自动从 `app.json` / `app.config.js` 配置生成原生目录，避免手动维护原生代码。 |
| **Podfile** | iOS 项目中的依赖管理配置文件，用于声明项目所需的第三方原生库（通过 CocoaPods 包管理器安装）。 |
| **Gradle** | Android 平台的构建系统。`gradle-wrapper.properties` 文件指定使用哪个版本的 Gradle 来构建 Android 项目。 |
| **pbxproj** | Xcode 项目的核心配置文件（`project.pbxproj`），存储构建设置、部署目标、链接库等信息。 |
| **Hermes** | Meta（Facebook）开发的 JavaScript 引擎，专为 React Native 优化，能显著提升应用启动速度和内存效率。 |

---

## 使用前提

在开始使用本工具之前，你需要先完成**核心依赖的更新**（即更新 `package.json` 中的 `expo`、`react-native`、`react` 等包版本）。本工具主要帮助你处理**原生目录中的配置文件变更**。

> **基于经验建议**：在执行任何升级操作之前，务必确保你的项目已经完整提交到 Git 版本控制系统中。这样在升级过程中如果出现意外问题，可以随时回退到升级前的状态。

---

## 使用方法

1. **更新核心依赖**：先将 `package.json` 中的 `expo` 等包更新到目标版本。
2. **选择版本范围**：在本页的交互式工具中，通过两个下拉选择器分别选择"起始 SDK 版本"（from SDK version）和"目标 SDK 版本"（to SDK version）。
3. **查看差异**：工具会生成所有需要修改的文件的逐行对比（diff）输出。
4. **应用变更**：根据对比结果，手动修改文件或通过复制粘贴的方式应用变更。

> **基于文档内容推导**：该工具的设计思路是让开发者能够精确了解每次 SDK 升级带来的原生层变化，而不是盲目地覆盖整个原生目录。这种"透明升级"的方式降低了升级风险，也帮助开发者理解底层构建系统的演进。

---

## 提示：考虑使用 CNG 跳过手动原生更新

> **提示**：如果你希望完全跳过手动更新原生目录的繁琐过程，可以了解 **Continuous Native Generation（CNG，持续原生生成）** 机制。通过 `expo prebuild` 命令，Expo 会根据你的配置在每次构建前自动生成 `ios/` 和 `android/` 目录，从而彻底消除手动维护原生代码的需要。

> **基于经验建议**：CNG 特别适合以下场景：(1) 你的项目没有对原生目录进行自定义修改；(2) 所有原生配置都可以通过 `app.json` / `app.config.js` 中的插件（config plugins）来声明。如果你的项目存在大量手动编写的原生代码，在迁移到 CNG 之前需要仔细评估兼容性。

---

## SDK 55 升级到 SDK 56 的完整代码变更

以下是从 SDK 55 升级到 SDK 56 时，所有需要修改的文件的详细对比。共涉及 **7 个文件**的变更。

### 1. Git 忽略规则（.gitignore）

**文件说明**：`.gitignore` 文件告诉 Git 版本控制系统哪些文件/目录不需要被跟踪。

```diff
 *.hprof
   cxx/
+ # generated inline modules
+ app/src/main/java/inline/
  # Bundle artifacts
  *.jsbundle
```

**变更解读**：
- **新增**：忽略 `app/src/main/java/inline/` 目录。这是 SDK 56 新增的**内联模块（inline modules）**生成目录。内联模块是 Expo 在构建时自动生成的 Java 模块，不需要纳入版本控制。
- `.hprof`（Java 堆转储文件）和 `*.jsbundle`（打包后的 JS 文件）仍然保持忽略。

> **基于文档内容推导**：内联模块（inline modules）是 SDK 56 引入的新概念，用于在构建阶段自动生成部分原生桥接代码，减少开发者手动编写的需要。

---

### 2. Gradle Wrapper 属性文件（gradle-wrapper.properties）

**文件说明**：`gradle-wrapper.properties` 指定项目使用的 Gradle 版本。Gradle 是 Android 的标准构建工具。

```diff
 distributionBase=GRADLE_USER_HOME
   distributionPath=wrapper/dists
- distributionUrl=https\://services.gradle.org/distributions/gradle-9.0.0-bin.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-bin.zip
  networkTimeout=10000
  validateDistributionUrl=true
  zipStoreBase=GRADLE_USER_HOME
```

**变更解读**：
- Gradle 版本从 **9.0.0** 升级到 **9.3.1**。
- 此升级通常包含 bug 修复、性能改进和对新版 Android SDK 的兼容支持。

> **基于经验建议**：升级 Gradle 版本后，首次构建可能会比较慢，因为需要下载新版本的 Gradle 发行包。请确保网络连接稳定。

---

### 3. Unix Gradle Wrapper 脚本（gradlew）

**文件说明**：`gradlew` 是 Unix/macOS/Linux 系统下运行 Gradle 构建命令的 Shell 脚本。它确保项目使用正确版本的 Gradle，而不依赖系统全局安装的 Gradle。

```diff
 NONSTOP* )        nonstop=true ;;
   esac
- CLASSPATH="\\\"\\\""
  # Determine the Java command to use to start the JVM.
  # For Cygwin or MSYS, switch paths to Windows format before running java
  if "$cygwin" || "$msys" ; then
    APP_HOME=$( cygpath --path --mixed "$APP_HOME" )
-   CLASSPATH=$( cygpath --path --mixed "$CLASSPATH" )
    JAVACMD=$( cygpath --unix "$JAVACMD" )
    DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
    # Collect all arguments for the java command:
-   #   * DEFAULT_JVM_OPTS, JAVA_OPTS, JAVA_OPTS, and optsEnvironmentVar are not allowed to contain shell fragments,
+   #   * DEFAULT_JVM_OPTS, JAVA_OPTS, and optsEnvironmentVar are not allowed to contain shell fragments,
    #     and any embedded shellness will be escaped.
    #   * For example, A user cannot expect ${Hostname} to be expanded, as it is an environment variable and will be
    #     treated as '${Hostname}' itself on the command line.
    set -- \
      "-Dorg.gradle.appname=$APP_BASE_NAME" \
-     -classpath "$CLASSPATH" \
      -jar "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" \
      "$@"
```

**变更解读**：
- **移除 `CLASSPATH` 变量**：不再手动设置和传递 `CLASSPATH` 环境变量。新版 Gradle Wrapper 直接通过 `-jar` 参数指定入口 JAR 文件，无需显式的 classpath。
- **注释修正**：将重复的 `JAVA_OPTS, JAVA_OPTS` 修正为只出现一次 `JAVA_OPTS`，这是一个文档层面的修正。
- **简化 Java 启动参数**：移除了 `-classpath "$CLASSPATH"` 参数，使启动命令更简洁。

> **基于文档内容推导**：这些变更来自 Gradle 官方对 Wrapper 脚本的改进，目的是简化启动流程并减少潜在的环境变量冲突。

---

### 4. Windows Gradle Wrapper 脚本（gradlew.bat）

**文件说明**：`gradlew.bat` 是 Windows 系统下的 Gradle 构建启动批处理脚本。

```diff
+ @REM Copyright (c) Meta Platforms, Inc. and affiliates.
+ @REM
+ @REM This source code is licensed under the MIT license found in the
+ @REM LICENSE file in the root directory of this source tree.
  @rem
  @rem Copyright 2015 the original author or authors.
  @rem

  :execute
  @rem Setup the command line

- set CLASSPATH=
  @rem Execute Gradle
- "%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" -jar "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" %*
+ "%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -jar "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" %*

  :end
  @rem End local scope for the variables with windows NT shell
```

**变更解读**：
- **新增 Meta Platforms 版权声明**：在文件头部添加了 Meta（Facebook）的 MIT 许可证声明。这是因为 Gradle Wrapper 脚本最初由 Gradle 团队编写，后来被 Meta 修改并用于 React Native 项目。
- **移除 `CLASSPATH` 设置**：与 Unix 脚本一致，不再需要 `CLASSPATH` 环境变量。
- **简化 Java 执行命令**：移除 `-classpath "%CLASSPATH%"` 参数。

---

### 5. iOS 项目配置文件（project.pbxproj）

**文件说明**：`project.pbxproj` 是 Xcode 项目的核心配置文件，存储了所有的构建设置、部署目标、链接的框架库等信息。此文件中通常存在多组构建设置（Debug / Release / 不同 Target），因此同一个设置可能出现多次。

```diff
 "FB_SONARKIT_ENABLED=1",
             );
             INFOPLIST_FILE = HelloWorld/Info.plist;
-            IPHONEOS_DEPLOYMENT_TARGET = 15.1;
+            IPHONEOS_DEPLOYMENT_TARGET = 16.4;
             LD_RUNPATH_SEARCH_PATHS = (
                 "$(inherited)",
                 "@executable_path/Frameworks",
             );
+            MACOSX_DEPLOYMENT_TARGET = 13.4;
             MARKETING_VERSION = 1.0;
             OTHER_LDFLAGS = (
                 "$(inherited)",

             CLANG_ENABLE_MODULES = YES;
             CURRENT_PROJECT_VERSION = 1;
             INFOPLIST_FILE = HelloWorld/Info.plist;
-            IPHONEOS_DEPLOYMENT_TARGET = 15.1;
+            IPHONEOS_DEPLOYMENT_TARGET = 16.4;
             LD_RUNPATH_SEARCH_PATHS = (
                 "$(inherited)",
                 "@executable_path/Frameworks",
             );
+            MACOSX_DEPLOYMENT_TARGET = 13.4;
             MARKETING_VERSION = 1.0;
             OTHER_LDFLAGS = (
                 "$(inherited)",

             GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
             GCC_WARN_UNUSED_FUNCTION = YES;
             GCC_WARN_UNUSED_VARIABLE = YES;
-            IPHONEOS_DEPLOYMENT_TARGET = 15.1;
+            IPHONEOS_DEPLOYMENT_TARGET = 16.4;
             LD_RUNPATH_SEARCH_PATHS = (
                 /usr/lib/swift,
                 "$(inherited)",

             GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
             GCC_WARN_UNUSED_FUNCTION = YES;
             GCC_WARN_UNUSED_VARIABLE = YES;
-            IPHONEOS_DEPLOYMENT_TARGET = 15.1;
+            IPHONEOS_DEPLOYMENT_TARGET = 16.4;
             LD_RUNPATH_SEARCH_PATHS = (
                 /usr/lib/swift,
                 "$(inherited)",
```

**变更解读**：
- **iOS 最低部署版本**：从 **15.1** 提升到 **16.4**。此变更出现在 4 处不同的构建配置中（对应 Debug/Release 以及不同 Target）。意味着你的应用将不再支持 iOS 15.1 ~ 16.3 的设备。
- **新增 macOS 部署目标**：新增 `MACOSX_DEPLOYMENT_TARGET = 13.4`，使应用支持在 macOS 上运行（通过 Mac Catalyst 或 Apple Silicon 原生运行）。

> **基于经验建议**：提升 iOS 最低部署版本是一个重要的决策。在应用之前，请查看你的 App Analytics（应用分析）数据，确认 iOS 15.x ~ 16.3 的用户占比是否在你的可接受范围内。通常 Apple 的用户升级率很高，但仍需谨慎评估。

> **基于文档内容推导**：新增 `MACOSX_DEPLOYMENT_TARGET` 表明 Expo / React Native 在 SDK 56 中增强了对 macOS 平台的支持，这可能与 Apple Silicon（M 系列芯片）生态的推进有关。

---

### 6. iOS Podfile 调整

**文件说明**：`Podfile` 是 CocoaPods（iOS/macOS 的依赖管理工具）的配置文件，声明项目所需的原生库及其版本。

```diff
   end
   ENV['EX_DEV_CLIENT_NETWORK_INSPECTOR'] ||= podfile_properties['EX_DEV_CLIENT_NETWORK_INSPECTOR']

-  ENV['RCT_USE_RN_DEP'] ||= '1' if podfile_properties['ios.buildReactNativeFromSource'] != 'true'
-  ENV['RCT_USE_PREBUILT_RNCORE'] ||= '1' if podfile_properties['ios.buildReactNativeFromSource'] != 'true'
+  ENV['RCT_USE_RN_DEP'] ||= podfile_properties['ios.buildReactNativeFromSource'] == 'true' ? '0' : '1'
+  ENV['RCT_USE_PREBUILT_RNCORE'] ||= podfile_properties['ios.buildReactNativeFromSource'] == 'true' ? '0' : '1'

   ENV['RCT_HERMES_V1_ENABLED'] ||= '1' if podfile_properties['expo.useHermesV1'] == 'true'

-  platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'
+  ENV['EXPO_USE_PRECOMPILED_MODULES'] ||= '1' if podfile_properties['EXPO_USE_PRECOMPILED_MODULES'] != 'false'
+  platform :ios, podfile_properties['ios.deploymentTarget'] || '16.4'

   prepare_react_native_project!
```

**变更解读**：

1. **React Native 依赖逻辑重构**：
   - **旧写法**：当 `ios.buildReactNativeFromSource` 不等于 `'true'` 时，设置环境变量为 `'1'`。
   - **新写法**：使用三元表达式。当从源码构建 React Native 时设为 `'0'`（禁用预构建），否则设为 `'1'`（启用预构建）。逻辑更清晰，行为一致。
   - `RCT_USE_RN_DEP`：控制是否使用 React Native 作为 CocoaPods 依赖。
   - `RCT_USE_PREBUILT_RNCORE`：控制是否使用预构建的 React Native 核心库。

2. **新增预编译模块支持**：
   - 新增 `EXPO_USE_PRECOMPILED_MODULES` 环境变量，默认启用（值为 `'1'`），除非显式设为 `'false'`。
   - 预编译模块（Precompiled Modules）可以显著**加快 iOS 编译速度**，特别是在增量构建（incremental build）场景下。

3. **iOS 平台最低版本提升**：
   - 从 `'15.1'` 提升到 `'16.4'`，与 `pbxproj` 中的变更保持一致。

> **基于经验建议**：`EXPO_USE_PRECOMPILED_MODULES` 是提升 iOS 开发体验的重要改进。首次启用后清理构建缓存（删除 `DerivedData` 目录）并重新构建，以获得最佳效果。如果遇到预编译相关的构建错误，可以临时在 Podfile 的 properties 中将其设为 `'false'` 来排查问题。

---

### 7. 包清单文件（package.json）

**文件说明**：`package.json` 是 Node.js / npm 项目的核心配置文件，声明了项目名称、版本、脚本命令和依赖包等信息。

```diff
   "name": "expo-template-bare-minimum",
   "description": "This bare project template includes a minimal setup for using unimodules with React Native.",
   "license": "0BSD",
-  "version": "55.0.38",
+  "version": "56.0.16",
   "main": "index.js",
   "scripts": {
     "start": "expo start --dev-client",
     "web": "expo start --web"
   },
   "dependencies": {
-    "expo": "~55.0.26",
-    "expo-status-bar": "~55.0.6",
-    "react": "19.2.0",
-    "react-native": "0.83.6"
+    "expo": "~56.0.2",
+    "expo-status-bar": "~56.0.4",
+    "react": "19.2.3",
+    "react-native": "0.85.3"
+  },
+  "publishConfig": {
+    "executableFiles": [
+      "./android/gradlew"
+    ]
   }
```

**变更解读**：

| 依赖包 | SDK 55 版本 | SDK 56 版本 |
|--------|------------|------------|
| 项目版本（version） | 55.0.38 | 56.0.16 |
| expo | ~55.0.26 | ~56.0.2 |
| expo-status-bar | ~55.0.6 | ~56.0.4 |
| react | 19.2.0 | 19.2.3 |
| react-native | 0.83.6 | 0.85.3 |

- **核心依赖全面升级**：Expo 从 55.x 升级到 56.x，React Native 从 0.83.6 升级到 0.85.3（这是一个跨越两个小版本的重大升级），React 从 19.2.0 微调到 19.2.3。
- **新增 `publishConfig`**：添加了 `executableFiles` 配置，将 `./android/gradlew` 标记为可执行文件。这确保在通过 npm 发布和安装模板时，Gradle Wrapper 脚本保持可执行权限，避免在 macOS/Linux 上出现 "Permission denied" 错误。

> **基于经验建议**：`react-native` 从 0.83.6 直接跳到 0.85.3 是一个较大的版本跨度。在升级前，建议同时查阅 [React Native 的更新日志](https://github.com/facebook/react-native/releases) 了解 0.84 和 0.85 版本的 Breaking Changes（破坏性变更）。

> **基于文档内容推导**：`publishConfig.executableFiles` 的添加说明此前版本可能存在 npm 安装后 `gradlew` 丢失执行权限的问题。如果你使用的是自行维护的模板项目，建议也添加此配置。

---

## 升级总结与检查清单

完成上述所有文件变更后，建议执行以下步骤验证升级是否成功：

1. **清理并重新安装 iOS 依赖**：
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

2. **清理并重新构建 Android**：
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **启动开发服务器并测试**：
   ```bash
   npx expo start --dev-client
   ```

4. **分别在 iOS 模拟器和 Android 模拟器上运行应用**，确认基本功能正常。

> **基于经验建议**：升级后务必进行全面的集成测试，特别关注：(1) 应用启动是否正常；(2) 导航是否正常工作；(3) 原生模块（如相机、文件系统、推送通知等）是否能正确调用；(4) 应用是否能正常打包发布（Release build）。

---

## 常见问题

**Q：如果我使用了 CNG（持续原生生成），还需要关注这些变更吗？**
A：不需要。CNG 会根据 `app.json` / `app.config.js` 自动重新生成原生目录，所有原生层面的变更会由 Expo 自动处理。你只需要确保 `package.json` 中的依赖版本正确即可。

**Q：升级后构建失败怎么办？**
A：首先检查是否遗漏了某个文件的变更。其次尝试清理所有构建缓存（iOS 删除 `DerivedData` 和 `Pods`，Android 执行 `./gradlew clean`）。如果问题仍然存在，考虑回退 Git 到升级前状态，逐步排查问题。

**Q：为什么 iOS 最低部署版本要提升到 16.4？**
A：这是因为 React Native 0.85 和 Expo SDK 56 中的原生依赖（如 Hermes 引擎、新架构组件）要求 iOS 16.4 或更高版本才能运行。这是上游依赖的硬性要求。

---

## 文档导航

- **上一页**：[install dev builds in bare](./36__install-dev-builds-in-bare.md)
- **下一页**：[overview](./38__overview.md)
