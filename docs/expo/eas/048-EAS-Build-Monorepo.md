# 048｜在 Monorepo 中配置 EAS Build

**翻页：**[上一页：Yarn 1 Classic 使用 EAS npm Cache](./047-Yarn-Classic-Cache.md) · [目录](./README.md) · [下一页：Android APK for Emulator / Device](./049-Android-APKs.md)

**官方页面：**[Set up EAS Build with a monorepo](https://docs.expo.dev/build-reference/build-with-monorepos/)

**版本边界：**本页讨论多 package repository 中 EAS app 的工作目录定位，不绑定某一个 Expo SDK 版本。项目 Expo ~56.0.11 的 CNG / workspace 依赖还要匹配 SDK 56 的工具链。这里只整理配置思路与命令示例，没有运行 EAS CLI 或构建。

## EAS 项目根目录应指向 App

假设 Git repository 根目录下面有 apps/my-app Expo 项目。执行 EAS CLI 时，从该 App 的目录运行命令：

```sh
cd apps/my-app
eas build
```

EAS Build 相关的 eas.json 与 credentials.json 等文件也应放在 app 根目录，而不是无条件放在 monorepo 仓库根。一个 monorepo 有多个 Expo app 时，每个 app 目录维护自己对应的 EAS 配置。

## CNG Monorepo

如果 Expo app 采用 CNG（Continuous Native Generation）并在 monorepo 中共享 workspace package，具体的 app config、native project 生成与 workspace 处理需要额外参考 Expo 的 [Working with Monorepos](https://docs.expo.dev/guides/monorepos/) 指南。

## Build 前准备其他 Workspace 依赖

某些 monorepo 需要先在仓库根构建共享 package，app 的依赖安装完成后才能正确构建。可在 Expo app 的 package.json 中用 postinstall 调用根目录脚本：

```json
{
  "scripts": {
    "postinstall": "cd ../.. && yarn build"
  }
}
```

示例相对路径假设 apps/my-app 的上两级目录正好是仓库根。若目录结构不同，按 app package.json 的实际相对位置调整。postinstall 在依赖安装后运行，脚本应能在干净 CI 环境中成功。

## 关键名词

- **Monorepo：**一个 Git 仓库管理多个 app、library 或 workspace package 的项目结构。
- **App directory：**monorepo 中单个 Expo app 的项目根目录；EAS 命令和配置按此目录定位。
- **Workspace dependency：**monorepo package manager 管理的其他本地 package，可能需要先编译。
- **postinstall：**安装依赖结束后由 package manager 自动运行的脚本。
- **CNG：**通过 Expo 配置生成 iOS / Android 原生工程的工作方式。

## 官方代码主题覆盖

源页代码主题已覆盖：从 apps/my-app 目录执行 eas build；多个 app 分别保存 eas.json / credentials.json；在 app 根 package.json 配置 postinstall，并以 cd ../.. && yarn build 准备 monorepo workspace 依赖。CNG 项目还要参考 Expo 官方 Monorepo guide。

## 下一页

官方页脚 **Next** 是 [Build APKs for Android Emulators and devices](https://docs.expo.dev/build-reference/apk/)，讲解如何配置 EAS Build 生成 APK 测试包。

**翻页：**[上一页：Yarn 1 Classic 使用 EAS npm Cache](./047-Yarn-Classic-Cache.md) · [返回目录](./README.md) · [下一页：Android APK for Emulator / Device](./049-Android-APKs.md)
