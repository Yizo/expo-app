# 020｜用 EAS Workflows 创建 Development Builds

**翻页：**[上一页：EAS Workflows 示例总览](./019-EAS-Workflows示例总览.md) · [目录](./README.md) · [下一页：发布 Preview Updates](./021-发布Preview-Updates.md)

**官方页面：**[Create development builds with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/create-development-builds/)

**版本说明：**EAS Workflow 示例是未按 Expo SDK 路径版本化的服务页面。开发 build 仍需要当前 Expo SDK 对应的 native 依赖与 EAS signing credentials；本地 Expo SDK56 项目应先核对实际 profile 和设备配置。

## Development Build 是什么

Development Build 是包含 Expo developer tools 的项目专属原生 app binary，内含项目使用的 native dependencies。它可以装到实体手机、Android emulator 或 iOS simulator，并提供更接近生产 binary 的测试环境。EAS Workflows 可以一次并行创建多种平台产物，再交给团队用类似 `eas build:dev` 的方式访问。

开始前需要准备 development build 所需的 SDK / 工具环境，配置每个平台的设备或模拟器，并准备 EAS build credentials；然后在 `eas.json` 建立普通设备 profile 和 iOS simulator profile。

## Build profiles

`developmentClient` 开启 Development Client，`distribution: "internal"` 表示把二进制按内部测试方式分发。iOS simulator profile 再声明 `ios.simulator: true`：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "development-simulator": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

Android emulator 与 Android device 使用 `development` profile；iOS 设备也使用 `development`，iOS simulator 则指定 `development-simulator`。

## 并行构建多种平台

在 `.eas/workflows/create-development-builds.yml` 中为 Android、iOS device、iOS simulator 各创建一个 Build job：

```yaml
name: Create development builds

jobs:
  android_development_build:
    name: Build Android
    type: build
    params:
      platform: android
      profile: development

  ios_device_development_build:
    name: Build iOS device
    type: build
    params:
      platform: ios
      profile: development

  ios_simulator_development_build:
    name: Build iOS simulator
    type: build
    params:
      platform: ios
      profile: development-simulator
```

此示例没有 job dependency，EAS 可并行执行这些构建。开发团队可以按目标设备下载相应的 binary；iOS simulator 产物不等同于可安装到实体 iPhone 的签名包。

## 手动触发

本例 workflow 未写自动 event trigger；可从 CLI 手动启动：

```sh
eas workflow:run .eas/workflows/create-development-builds.yml
```

## 关键名词

- **Development Client**：按当前项目 native dependencies 构建、供 Expo 开发使用的专属 app 客户端。
- **Internal distribution**：将 build 供指定测试人员内部安装，而不是作为商店生产版本。
- **Simulator / emulator**：由开发工具模拟 iOS / Android 设备的平台运行环境。
- **Build profile**：`eas.json` 中一组构建参数，Workflow job 通过 profile 名引用它。
- **Parallel jobs**：没有依赖关系的 Workflow jobs 可同时排队构建。

## 官方代码主题覆盖

源页的全部代码主题均有改写示例：`eas.json` 的 development 和 development-simulator profile；Android、iOS device、iOS simulator 三种 profile / platform 组合；用于并行执行的 Workflow build jobs；以及手动 `eas workflow:run` 命令。设备 / 模拟器准备属于前置步骤，未执行真实云端构建。

## 下一页

页脚 **Next** 指向 [Publish preview updates](https://docs.expo.dev/eas/workflows/examples/publish-preview-update/)，让每个分支的 commit 自动发布一条可供团队评审的 preview update。

**翻页：**[上一页：EAS Workflows 示例总览](./019-EAS-Workflows示例总览.md) · [返回目录](./README.md) · [下一页：发布 Preview Updates](./021-发布Preview-Updates.md)
