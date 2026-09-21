# 041｜EAS Custom Builds 入门

**翻页：**[上一页：Apple Developer Program 角色与 EAS Build 权限](./040-Apple-Developer-Program-roles.md) · [目录](./README.md) · [下一页：Custom Build 配置 Schema](./042-Custom-Build-Config-Schema.md)

**官方页面：**[Get started with custom builds](https://docs.expo.dev/custom-builds/get-started/)

**版本边界：**Custom builds 是 EAS Build 的构建配置能力；本页文档未绑定某个 Expo SDK 版本。本地项目 Expo ~56.0.11 若需要自定义原生步骤，需结合 SDK v56 生成的工程结构校对。本文只展示示例 YAML / eas.json 和命令，没有创建配置或实际触发云构建。

## Custom Build 可以做什么

EAS Build 默认根据 profile 执行标准流程。Custom build 允许在这个流程中运行自己的命令或复用 EAS built-in functions。可从 EAS CLI 或 React Native CI/CD（例如 EAS Workflows）触发。

每份 custom build config 放在项目根目录的 .eas/build/ 下，扩展名为 .yml 或 .yaml。目录和后缀对 EAS 识别配置很重要；文件名可以自选。

## 创建最小配置

新建 .eas/build/hello-world.yml，让 build 执行一条 shell 命令：

```yaml
build:
  name: Hello World
  steps:
    - run: echo "Hello, world!"
```

真实自定义 build 通常调用内置 EAS function 来执行 checkout、安装依赖、native build 和 artifact 上传等步骤。只跑 echo 是为了观察配置是否加载，并不会产出完整 App。

## 通过 eas.json 的 profile 引用配置

在 eas.json 的 build 中添加 profile，再通过 config 指定位于 .eas/build/ 的 YAML 配置名：

```json
{
  "build": {
    "test": {
      "config": "hello-world.yml"
    }
  }
}
```

如果 Android 与 iOS 需要不同流程，可以在同一 profile 下分别配置：

```json
{
  "build": {
    "test": {
      "android": {
        "config": "hello-android.yml"
      },
      "ios": {
        "config": "hello-ios.yml"
      }
    }
  }
}
```

这样可以分别控制两个平台的原生步骤，例如 Android Gradle 与 iOS Fastlane / Xcode archive。

## 试跑 Build Profile

用 EAS CLI 选择 Android 平台和 test profile：

```sh
eas build -p android -e test
```

Build 结束后，在 build detail 的日志中确认 Hello World command 确实执行。此处的 -e 选择 eas.json 中的 build profile；它不是运行本地测试的命令，也不会自动部署 App。

## 关键名词

- **Custom build config：**放在 .eas/build 下的 YAML 文件，逐步声明原生构建流程。
- **Build profile：**eas.json 中一组 build 参数和配置选择；可按 development、preview、production 或团队命名。
- **Built-in function：**EAS 提供的可复用工作步骤，例如 checkout、prebuild 或运行 Gradle。
- **Artifact：**构建产物，例如 APK、AAB 或 IPA，可下载、安装或提交商店。

## 官方代码主题覆盖

源页的所有代码 / 命令主题均有示例：在 .eas/build 下创建含 build.name 与 steps.run 的 YAML；eas.json 中 build.test.config 单平台引用；按 Android / iOS 覆盖 config 文件；用 eas build -p android -e test 触发并从构建日志确认命令执行。

## 下一页

官方页脚 **Next** 是 [Custom build configuration schema](https://docs.expo.dev/custom-builds/schema/)，系统列出 YAML 配置、steps、reusable functions 与 EAS 内置函数的可用字段。

**翻页：**[上一页：Apple Developer Program 角色与 EAS Build 权限](./040-Apple-Developer-Program-roles.md) · [返回目录](./README.md) · [下一页：Custom Build 配置 Schema](./042-Custom-Build-Config-Schema.md)
