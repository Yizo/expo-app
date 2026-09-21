# 053｜同一设备安装多个 App Variant

**翻页：**[上一页：排查 EAS Build 错误与应用崩溃](./052-Build-Troubleshooting.md) · [目录](./README.md) · [下一页：iOS Capabilities](./054-iOS-Capabilities.md)

**官方页面：**[Install app variants on the same device](https://docs.expo.dev/build-reference/variants/)

**版本边界：**本文用 APP_VARIANT、Expo app config 和 EAS Build profiles 区分 development / production。文档 URL 未锁 SDK 版本；本地 Expo ~56.0.11 按 SDK v56 生成 native directories。iOS extension、app identifier 与 package 配置必须匹配实际 native project。这里没有运行 prebuild / build / Git 命令。

## 为什么要做 App Variant

同一手机上同时安装 development、preview、production app，能在开发测试、预览下一版本和检查真实生产版之间切换，而不用反复卸载覆盖。

Android 通过 Application ID / package 区分 app；iOS 通过 Bundle Identifier 区分 app。要并装多个 variant，每一个都必须使用唯一标识。

## 从 Expo app.json 起步

单一 variant 的 app config 可从以下基础开始：

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "ios": {
      "bundleIdentifier": "com.example.myapp"
    },
    "android": {
      "package": "com.example.myapp"
    }
  }
}
```

为了按 build profile 切换 identifier，需要用 app.config.js 动态导出配置。下面读取 APP_VARIANT；development 使用另一组名称和 ID，未设置时落到 production：

```js
const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  name: IS_DEV ? "MyApp (Dev)" : "MyApp",
  slug: "my-app",
  ios: {
    bundleIdentifier: IS_DEV ? "com.example.myapp.dev" : "com.example.myapp",
  },
  android: {
    package: IS_DEV ? "com.example.myapp.dev" : "com.example.myapp",
  },
};
```

平台后台（如 Firebase / Google Maps）通常按 App ID 识别项目；若 native ID 变化，对应服务也可能要为 dev / production 分别注册应用配置文件。

## EAS Build profile 设置 Variant

在 development build profile 中设置 APP_VARIANT。EAS 评估 app.config.js 时注入此环境变量：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "production": {}
  }
}
```

运行 eas build --profile development 会得到 com.example.myapp.dev；production profile 没设置 APP_VARIANT，所以回到普通 app ID。

若要确保 Expo CLI 的 QR code / EAS Update scheme 只注册在 dev app 上，可按 variant 配置 expo-dev-client plugin：

```js
const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    plugins: [
      [
        "expo-dev-client",
        {
          addGeneratedScheme: !!IS_DEV,
        },
      ],
    ],
  },
};
```

也可以在本地 dev server script 设置环境变量：

```json
{
  "scripts": {
    "dev": "APP_VARIANT=development npx expo start"
  }
}
```

Windows shell 设置环境变量的写法不同；可使用项目已有的跨平台环境变量工具，或在终端中按 Windows 语法设置。

## 本地运行时切换 Variant

expo run 不会根据 APP_VARIANT 自动重生成已存在的 android / ios 目录。若之前生成过 production native project，随后只在 app config 切换到 development，运行 expo run 仍可能编译旧 identifier。

要改 native app ID，应先用新 variant 做 clean prebuild，再用同样 variant 执行 expo run。Expo CLI 直接模式示例：

```sh
APP_VARIANT=test npx expo prebuild --clean
APP_VARIANT=test npx expo run:ios
```

官方也列出相同操作的 Yarn、pnpm 与 Bun 命令：

```sh
APP_VARIANT=test yarn expo prebuild --clean
APP_VARIANT=test yarn expo run:ios
APP_VARIANT=test pnpm expo prebuild --clean
APP_VARIANT=test pnpm expo run:ios
APP_VARIANT=test bun expo prebuild --clean
APP_VARIANT=test bun expo run:ios
```

APP_VARIANT 只影响 app name 与平台 identifier，不会自动更换原生 build configuration。native directories 由 CNG 管理且在 .gitignore 中时，clean prebuild 可按 config 重新生成。

## 已有 React Native Project

如果项目从 React Native CLI 开始且保留了 android / ios 目录，native project 里的配置通常会优先于 app config。要用 Expo app config 作为 identifier 的 source of truth，需要迁移到 CNG 并把生成的 native directories 忽略；如果项目有自定义原生代码不适合此方案，可显式使用 Android product flavors 与 iOS Xcode schemes。

### Android Product Flavors

在 android/app/build.gradle 中，为每种 profile 创建一个 flavor 并给出独立 applicationId：

```gradle
android {
  flavorDimensions "env"
  productFlavors {
    production {
      dimension "env"
      applicationId "com.example.myapp"
    }
    development {
      dimension "env"
      applicationId "com.example.myapp.dev"
    }
  }
}
```

随后用每个 eas.json profile 的 android.gradleCommand 指定对应 flavor：

```json
{
  "build": {
    "development": {
      "android": {
        "gradleCommand": ":app:assembleDevelopmentDebug"
      }
    },
    "production": {
      "android": {
        "gradleCommand": ":app:bundleProductionRelease"
      }
    }
  }
}
```

若只允许 production-release 与 development-debug 组合，可在 build.gradle 的 variantFilter 排除其余组合：

```gradle
android {
  variantFilter { variant ->
    def validVariants = [
      ["production", "release"],
      ["development", "debug"],
    ]
    def buildTypeName = variant.buildType*.name
    def flavorName = variant.flavors*.name
    def isValid = validVariants.any {
      flavorName.contains(it[0]) && buildTypeName.contains(it[1])
    }
    if (!isValid) {
      setIgnore(true)
    }
  }
}
```

EAS CLI 当前识别 productFlavors 中的 applicationId，不会正确识别 applicationIdSuffix。

每个 variant 可在 android/app/src/<flavor>/ 下有单独资源：

- app 名称：通过该 flavor 的 res/values/strings.xml 中 app_name 覆盖。
- Icon：为 flavor 创建 res/mipmap-* 资源目录。
- Firebase：对应服务配置放在 android/app/src/<flavor>/google-services.json。
- Sentry：打开 flavorAware 并按 flavor / build type 放置属性文件。

### iOS Schemes / Targets

在 eas.json 里给不同 profile 配置 Xcode scheme 与 Debug / Release build configuration：

```json
{
  "build": {
    "development": {
      "ios": {
        "buildConfiguration": "Debug",
        "scheme": "myapp-dev"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "scheme": "myapp"
      }
    }
  }
}
```

若 iOS app 需要多个独立 target，Podfile 可把原有主 target 改为 abstract_target 并将公共配置复用到各 target：

```ruby
abstract_target "common" do
  # Put shared Pods and target configuration here.
  target "myapp" do
  end
  target "myapp-dev" do
  end
end
```

接着在 Xcode 复制现有 target，为新 target 设置唯一 Bundle Identifier 与 shared scheme。官方文档还说明：

1. 复制并重命名 target，例如 myapp-dev。
2. Manage Schemes 中创建同名 scheme 并设置 Shared；如 Xcode 未生成 xcscheme 文件，可切换 Shared checkbox 让其生成。
3. 让 targets 共用合适的 Info.plist，并按 target 改 Product Bundle Identifier。
4. Info.plist 可用 DISPLAY_NAME 变量作显示名称，在 Build Settings 的 User-Defined 部分对每个 target 赋值。
5. 需要不同图标时复制 Asset Catalog image set，并在 target Build Settings 的 Primary App Icon Set Name 指定。

## EAS Update 注意事项

发布 JS update 时也要设正确 APP_VARIANT / environment，并确认更新发往对应 channel。否则开发 variant 可能收到 production update，或反向发生。多个 variant 的 app identifier 应与对应 Firebase / Maps 等服务和 runtime config 一致。

## 关键名词

- **Variant：**同一源码的开发、预览或生产应用变体。
- **Application ID / package：**Android 安装包的唯一标识。
- **Bundle Identifier：**iOS 应用的唯一标识。
- **Product Flavor：**Android Gradle 变体机制，可生成不同 applicationId / 名称 / 资源。
- **Scheme / Target：**Xcode 中选择编译 target 与配置的项目设置。
- **CNG：**用 Expo config 生成 native project 的方式；生成目录可安全重建的前提是手工 native 修改已通过 plugins 纳入。

## 官方代码主题覆盖

源页的代码 / 操作 themes 均覆盖：基准 app.json；app.config.js 的 APP_VARIANT 区分；dev-client scheme 插件；eas.json profile env；本地 dev script 与四个包管理器 prebuild/run 命令；Android flavors、gradleCommand、variantFilter、app_name / icons / google-services / Sentry；iOS build configuration / scheme、Podfile abstract target 和 Xcode 目标 / Info.plist / app icon 配置。示例未经执行。

## 下一页

官方页脚 **Next** 是 [iOS Capabilities](https://docs.expo.dev/build-reference/ios-capabilities/)，说明要在 iOS App 中使用原生 capability 时需要的签名与 profile 配置。

**翻页：**[上一页：排查 EAS Build 错误与应用崩溃](./052-Build-Troubleshooting.md) · [返回目录](./README.md) · [下一页：iOS Capabilities](./054-iOS-Capabilities.md)
