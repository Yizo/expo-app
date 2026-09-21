# 023｜EAS Tutorial：构建 iOS Simulator Development Build

**翻页：**[上一页：EAS Tutorial：构建 Android](./022-EAS-TutorialAndroid-Development-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：构建 iOS 真机](./024-EAS-TutorialiOS-Device-Build.md)

**官方页面：**[Create and run a cloud build for iOS Simulator](https://docs.expo.dev/tutorial/eas/ios-development-build-for-simulators/)

**版本边界：**iOS simulator build 使用 EAS Build 云端工具，但产物只适用于 simulator。此教程未固定 SDK 版本；项目为 Expo SDK56，build profile 和 native module 应使用 SDK56 对应配置。

## Simulator 与 iOS 真机产物

iOS Simulator Development Build 以 `.app` 格式生成，iOS 真机 development build 则使用 `.ipa`。Simulator profile 需要 `ios.simulator: true`；若沿用已配置好的 development profile，可用 `extends` 避免重复写 developmentClient / internal distribution：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "ios-simulator": {
      "extends": "development",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

## 创建并安装 Simulator build

在支持 iOS Simulator 的 macOS 环境配置 EAS CLI 后，运行：

```sh
eas build --platform ios --profile ios-simulator
```

第一次构建时，EAS CLI 会询问 iOS bundle identifier；若 development build profile / app config 未声明，可在这里填写并写入 `ios.bundleIdentifier`。第一次提及 Apple encryption compliance 时，按 app 是否使用加密如实回答。

Dashboard build detail 会显示构建类型、profile、Expo SDK、app version、build number、提交信息和日志；完成后可下载 `.app`。EAS CLI 可询问是否在本机 iOS Simulator 运行；也可在 Dashboard artifact 处点 Open with Expo Orbit。

启动 Metro 并使用 simulator 中已安装的 app：

```sh
npx expo start
yarn expo start
pnpm expo start
bun expo start
```

目标为 iOS Simulator 时，教程要求按 CLI 提示在模拟器中打开 app；真机产物不能安装进 iOS Simulator，反过来 .app simulator build 也不能装到真机。

## 关键名词

- **iOS Simulator**：Xcode 提供的 iOS 模拟运行环境；只能在 macOS 使用。
- **Simulator build (.app)**：供 iOS Simulator 安装的 app bundle。
- **iOS device build (.ipa)**：签名并可分发到实体 iPhone / iPad 的安装包。
- **extends**：从 eas.json 中的另一个 profile 继承设置，再仅覆盖不同的平台字段。
- **Bundle identifier**：Apple app 的唯一标识，常用反向域名形式。
- **Encryption compliance**：Apple 对 app 使用加密能力的合规信息；按实际功能回答。

## 官方代码主题覆盖

源页代码主题均已改写：eas.json 的 ios.simulator profile、继承 development profile、ios simulator build 命令、bundle identifier 首次提示、encryption compliance 提醒、CLI / Orbit 安装路径，以及 Expo start 的 npm / Yarn / pnpm / Bun 命令。没有生成云端 build 或操作 Apple Developer 账户。

## 下一页

页脚 **Next** 指向 [Create and run a cloud build for iOS device](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/)，讲解 Apple 设备登记、provisioning profile 与真机安装包。

**翻页：**[上一页：EAS Tutorial：构建 Android](./022-EAS-TutorialAndroid-Development-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：构建 iOS 真机](./024-EAS-TutorialiOS-Device-Build.md)
