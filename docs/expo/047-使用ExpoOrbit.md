# 047｜用 Expo Orbit 打开 EAS 更新

**翻页：**[上一页：与团队分享预览](./046-与团队分享预览.md) · [目录](./README.md) · [下一页：构建应用商店版本](./048-构建应用商店版本.md)

**官方页面：**[How to launch an update using Expo Orbit](https://docs.expo.dev/review/with-orbit/)

## Orbit 在预览流程里的位置

Expo Orbit 是 macOS、Windows 和 Linux 桌面应用，用来安装 / 启动 EAS 构建和更新。它把更新详情页里的 **Open in Orbit** 变成设备上的安装与启动流程。

## Orbit 如何选择原生构建

启动一条 EAS Update 时，Orbit 会按该更新的 **runtimeVersion** 和目标平台查找最新兼容的 Development Build。若找到，它会把开发构建安装到设备，再用指向更新的 Deep Link 打开目标预览。

如果没有兼容开发构建（例如构建已过期、还未创建 EAS Build、使用本地编译而没有云端产物），Orbit 会询问下一步。若目标设备上已经手动装有兼容构建，可选 **Launch with deep link** 直接打开更新。

## 前置条件

1. 从 [Expo Orbit 下载 / 发布页](https://github.com/expo/orbit/releases)安装桌面工具。
2. 在 Orbit Settings 登录 Expo 账号。
3. 项目已发布一个 EAS Update；尚未发布时先完成发布流程。

## 从 Dashboard 安装预览

1. 打开项目的 **Updates** 标签。
2. 选择想检查的更新并点 **Preview**。
3. 在 Preview 对话框中选择 **Open with Orbit** 和目标平台。
4. Orbit 自动安装兼容构建并打开该 Update。

当前文档说明支持 Android 设备 / 模拟器和 iOS Simulator；不支持在真实 iPhone 上直接用 Orbit 启动更新。

## 关键名词

- **runtimeVersion**：原生 binary 与 JS 更新之间的兼容标签；必须匹配，原生 API 不兼容的更新不能加载到旧 binary。
- **Deep Link**：打开某个 app / 具体更新的 URL；Orbit 用它把安装好的客户端带到选定 Update。
- **EAS Update**：已发布的 JS / 静态资源更新。
- **目标平台**：Android 或 iOS；Orbit 只在支持的设备类型上直接运行。

## 官方代码主题覆盖

本页没有代码块或终端命令。安装、登录、Dashboard 选择和平台限制都以界面步骤说明；预览机制在上一页的 EAS Update / Deep Link 章节解释。

## 下一页

页脚 Next 指向 [Build your project for app stores](https://docs.expo.dev/deploy/build-project/)。

**翻页：**[上一页：与团队分享预览](./046-与团队分享预览.md) · [目录](./README.md) · [下一页：构建应用商店版本](./048-构建应用商店版本.md)
