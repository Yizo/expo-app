# 027｜用 eas.json 配置 EAS Build

**翻页：**[上一页：用 EAS Build 创建第一个 Build](./026-EAS-Build创建首个Build.md) · [目录](./README.md) · [下一页：Internal distribution](./028-EAS-Build内部测试分发.md)

**官方页面：**[Configure EAS Build with eas.json](https://docs.expo.dev/build/eas-json/)

**版本说明：**eas.json 是 EAS CLI / Build 的服务配置，不等同 Expo SDK app config。本文用当前官方字段举例；具体工具版本和平台 option 应按项目当前 SDK / build image 对照。

## 配置文件和 Build Profile

eas.json 放在 package.json 同一项目根目录；首次运行 eas build:configure 可生成初始文件。Build profiles 定义在 build 对象内，每个 profile 是命名配置组，名称也可自定义：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

运行指定 profile：

```sh
eas build --profile preview
```

省略 --profile 时，EAS CLI 默认选名为 production 的 profile（如果存在）。配置可放在 profile 根节点，也可放进 android / ios 子对象；平台专属字段只作用于对应平台，并优先覆盖同名通用值。

## 通过 extends 复用公共字段

Profile 可用 extends 继承另一个 profile。最多串 5 层且不可有循环引用；platform-specific fields 也参与继承：

```json
{
  "build": {
    "base": {
      "node": "22.13.0",
      "env": { "API_ENV": "shared" }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "extends": "base",
      "distribution": "internal"
    },
    "production": {
      "extends": "base"
    }
  }
}
```

profile 命名建议围绕实际构建目标，例如 development、preview、production，也可以拆出 development-simulator 等更细的变体。

## 三类常见 App Build

### Development

developmentClient: true 表示 build 依赖 expo-dev-client 并包含 developer tools；development build 不提交商店。distribution: internal 便于直接安装到 Android / iOS 设备。iOS simulator profile 可新增 ios.simulator: true，或单建子 profile extends development。Android APK 可在手机和 Android Emulator 共用。

### Preview

Preview build 不含 developer tools，供团队 / 外部 stakeholder 测试 production-like app。通常设 distribution: internal；Android preview 可生成 APK，商店 production 则优先 AAB。若需要 iOS simulator，可从 preview 派生专用 simulator profile。

### Production

Production profile 用于 app store release；Android 默认使用 AAB。显式设置 android.buildType: apk 可得到可直接安装产物，但这不是 Google Play store 的推荐上传格式。Store build 应从商店渠道安装；不能当作随意 sideload 的开发 APK。

## build tools 和资源

EAS Build image 决定 Node.js、Yarn、Ruby、Bundler、CocoaPods、Fastlane、Xcode、Android NDK 等工具环境。可按 profile 固定常用工具版本，也能在共用 base profile 声明后继承：

```json
{
  "build": {
    "production-base": {
      "node": "22.13.0",
      "yarn": "1.22.22"
    },
    "production": {
      "extends": "production-base"
    },
    "preview": {
      "extends": "production-base",
      "distribution": "internal"
    }
  }
}
```

resourceClass 配置 cloud worker 的 CPU / RAM。默认 medium 通常适用于多数项目；large worker 可给大型 / 急着完成的 build 更多资源，但要按当前 EAS plan eligibility 查验：

```json
{
  "build": {
    "production": {
      "android": { "resourceClass": "medium" },
      "ios": { "resourceClass": "large" }
    }
  }
}
```

对于 Expo project，EAS Build 会按正在构建的 SDK 选择匹配 dependency 的基础 image；自定义 native project 需要自行确认 image / Xcode / NDK 版本适配。

## CNG 与既有 Native Project 示例

Continuous Native Generation 项目可以把公用工具版本和环境变量放在 base，再让各 profile 覆盖平台参数：

```json
{
  "build": {
    "base": {
      "node": "22.13.0",
      "yarn": "1.22.22",
      "env": { "EXAMPLE_ENV": "shared" },
      "android": { "image": "default", "env": { "PLATFORM": "android" } },
      "ios": { "image": "latest", "env": { "PLATFORM": "ios" } }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "env": { "APP_ENV": "development" },
      "android": { "distribution": "internal", "withoutCredentials": true },
      "ios": { "simulator": true }
    },
    "staging": {
      "extends": "base",
      "env": { "APP_ENV": "staging" },
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "extends": "base",
      "env": { "APP_ENV": "production" }
    }
  }
}
```

既有原生 React Native app 也可分别固定 android image / ndk 与 iOS image / tool versions，再覆盖 Gradle command 或 Xcode buildConfiguration：

```json
{
  "build": {
    "base": {
      "android": { "image": "ubuntu-android-image", "ndk": "<ndk-version>" },
      "ios": { "image": "macos-image", "node": "22.13.0", "yarn": "1.22.22" }
    },
    "development": {
      "extends": "base",
      "android": {
        "distribution": "internal",
        "withoutCredentials": true,
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": { "simulator": true, "buildConfiguration": "Debug" }
    },
    "production": {
      "extends": "base",
      "android": { "gradleCommand": ":app:assembleRelease" }
    }
  }
}
```

这些自定义 command / image 应与 project 的 Gradle、Xcode 和 RN native structure 对齐。

## Environment variables 与 CLI 字段

build profile 的 env 会在本地 eas build 求值 app.config.js 时生效，并传到云构建环境：

```json
{
  "build": {
    "production": {
      "node": "22.13.0",
      "env": { "API_URL": "https://company.example/api" }
    },
    "preview": {
      "extends": "production",
      "distribution": "internal",
      "env": { "API_URL": "https://staging.example/api" }
    }
  }
}
```

profile env 应用于非机密配置；密码、API tokens 等应使用 EAS Environment secrets。CLI 区还可声明 EAS CLI version range、requireCommit、appVersionSource、promptToConfigurePushNotifications。平台 options 可继承 profile 根上的 common fields，平台自身设置优先级更高。

## 关键名词

- **Build profile**：命名的一组编译 / 签名 / 分发字段。
- **extends**：复用另一个 profile 的配置；最多 5 层，不可循环。
- **CNG project**：通过 app config 与 config plugins 生成原生目录的 Expo project。
- **resourceClass**：EAS 云端 build worker 的资源规格。
- **Base image**：配置 Node、CocoaPods、Xcode 等工具默认版本的构建环境镜像。
- **APK / AAB**：Android 可安装包 / Google Play app bundle。
- **Profile env vs secrets**：profile env 在 eas.json 明文配置；敏感值放 EAS secrets。

## 官方代码主题覆盖

源页的配置代码主题均已重写：默认 development / preview / production profiles、运行指定 profile 命令、Android / iOS platform fields、extends 与覆写规则、iOS simulator / internal preview / production APK-AAB 差异、固定 Node / Yarn 等 build tools、resourceClass、base image、eas.json schema、CNG 多 profile、existing RN 多 profile 与 build profile env / app.config 求值范围。完整属性集合仍以官方 schema reference 为准。

## 下一页

页脚 **Next** 指向 [Internal distribution](https://docs.expo.dev/build/internal-distribution/)，讲解 Android APK 与 iOS ad hoc / enterprise builds 的分享方式。

**翻页：**[上一页：用 EAS Build 创建第一个 Build](./026-EAS-Build创建首个Build.md) · [返回目录](./README.md) · [下一页：Internal distribution](./028-EAS-Build内部测试分发.md)
