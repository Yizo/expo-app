# 020｜EAS Tutorial：导言

**翻页：**[上一页：Build with AI：收尾设置](./019-AI教程收尾设置.md) · [目录](./README.md) · [下一页：EAS Tutorial：配置 Development Build](./021-EAS-Tutorial配置Development-Build.md)

**官方页面：**[EAS Tutorial: Introduction](https://docs.expo.dev/tutorial/eas/introduction/)

**版本边界：**EAS Build / Submit / Update 属于 Expo Application Services 云端服务，具体 native build 仍必须匹配应用当前 SDK。本地项目使用 Expo SDK56；教程页面的 EAS 步骤不会自动把项目升级到 SDK57。

## 这条教程会做什么

EAS Tutorial 带读者为 Android / iOS app 建立一套可持续的 Build、Update、Submit 与 CI/CD 流程；官方估算完成时间约两小时。章节将涉及：

- EAS Build 构建 development binary，并在设备 / emulator / simulator 安装运行。
- 和 Expo Go 对比 development build，理解自定义 native dependencies 的支持。
- 与团队、外部评审者分享内部 development build。
- 自动增加 app 的版本号 / build number。
- 同一设备同时安装不同 application variant，例如 development / preview。
- 在开发期用 EAS Update 快速发布 JS / assets 更新。
- 关联 GitHub repository，自动触发 EAS builds。

## 准备一个可构建的 Expo project

跟教程可从三种项目来源选一种：

1. 接着上个 Expo 教程构建的 StickerSmash app。
2. 创建一个新的 Expo 项目：

```sh
npx create-expo-app
```

3. 使用现有 React Native app：先确保它已集成 Expo package；教程指出可使用自动或手动方式完成集成。

还需要能安装 development binary 的设备或模拟器。Expo Orbit 可管理与启动 build；也可分别准备 Android Emulator 或 macOS 上的 iOS Simulator。

## Development / Preview / Production 关系

教程会把 app 的构建 profile 分开：Development 带 developer tools，用来写功能和验证 native 模块；Preview 用内部渠道分享给他人；Production 用商店发布的签名和版本规则。一个 SDK project 可以同时有三种 profile，但要给它们分配彼此一致的 app version、runtime 和 OTA update channel。

## 关键名词

- **EAS Build**：Expo 云端原生编译与构建服务。
- **EAS Submit**：将已经生成的 iOS / Android binary 提交给应用商店。
- **EAS Update**：向符合 runtime 兼容条件的安装版本推送 JavaScript / asset 更新。
- **CI/CD**：代码检查和构建自动执行、发布任务有规则地交付。
- **Application variant**：同一 app 项目生成的不同安装变体；开发 / 预览版可以用不同 application ID 同时装在手机上。
- **Expo Orbit**：桌面 build 管理器，可协助安装 / 启动 EAS 产生的 app。

## 官方代码主题覆盖

本页没有工作流代码块；唯一命令主题是新建 Expo app，已按 source 改写为 npx create-expo-app。其它内容是项目来源、云端工具、设备与教程范围说明；外链的 StickerSmash 仓库下载内容未作为本地依赖。

## 下一页

页脚 **Next** 指向 [Configure a development build in cloud](https://docs.expo.dev/tutorial/eas/configure-development-build/)，介绍安装 expo-dev-client、链接项目到 EAS 并建立 development build profile。

**翻页：**[上一页：Build with AI：收尾设置](./019-AI教程收尾设置.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：配置 Development Build](./021-EAS-Tutorial配置Development-Build.md)
