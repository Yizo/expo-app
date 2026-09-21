# 021｜EAS Tutorial：配置云端 Development Build

**翻页：**[上一页：EAS Tutorial 导言](./020-EAS-Tutorial导言.md) · [目录](./README.md) · [下一页：EAS Tutorial：构建 Android](./022-EAS-TutorialAndroid-Development-Build.md)

**官方页面：**[Configure a development build in cloud](https://docs.expo.dev/tutorial/eas/configure-development-build/)

**版本边界：**本教程通过 `expo-dev-client` 和 EAS CLI 配置项目，并不负责升级 Expo SDK。本地项目仍是 Expo SDK56；安装原生库时选择 SDK56 匹配版本并重新构建。

## Development Build 与 Expo Go

Development Build 是 app 专属的 debug binary，内含 `expo-dev-client` 和项目需要的 native libraries，可测试任意自定义原生依赖及 config plugin；Expo Go 是固定的通用客户端，不能加入项目任意 native module。

教程建议用 development build 做完整 app 开发和团队测试；Expo Go 更适合学习、原型和快速试验。

## 安装 expo-dev-client 并启动 Metro

在项目目录用 Expo CLI 安装 Development Client；启动 Metro server：

```sh
npx expo install expo-dev-client
yarn expo install expo-dev-client
pnpm expo install expo-dev-client
bun expo install expo-dev-client

npx expo start
yarn expo start
pnpm expo start
bun expo start
```

此时 server 已为 development build 运行，但设备还没有安装对应 binary，所以无法直接打开项目。终端仍会显示开发服务器和 QR code 信息。

## 安装 EAS CLI、登录并关联项目

教程建议全局安装 EAS CLI：

```sh
npm install --global eas-cli
yarn global add eas-cli
pnpm add --global eas-cli
bun add --global eas-cli
```

已有 Expo 账号且 Expo CLI 已登录时可跳过登录；否则：

```sh
eas login
```

新项目第一次使用云端 build 前需创建或连接 EAS project：

```sh
eas init
```

命令会确认 project owner、是否新建 EAS project，并生成一个唯一的 project ID 写入 app config 的 `extra.eas.projectId`。它将本机 app 与 Expo / EAS server 上的项目对象关联起来。

## 创建 build profile

使用 EAS Build 前运行：

```sh
eas build:configure
```

选择 Android、iOS 或 All；教程示例选择 All，然后在根目录生成包含 Development、Preview、Production build profile 的 `eas.json`：

```json
{
  "cli": {
    "version": ">= 16.18.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

development profile：

- `developmentClient: true` 用 `expo-dev-client` 构建 debug app，带开发者工具并允许 Metro 热更新 JS。
- `distribution: "internal"` 标记这个 binary 为内部安装与测试用途。

preview 用于内部评审；production profile 自动增加商店版本号；submit production profile 为空配置，后续可按商店凭证添加字段。

## 关键名词

- **Expo Go**：Expo 维护的通用测试 app，里面不包含项目额外 native modules。
- **expo-dev-client**：让项目构建成自己的开发客户端 binary，可插入项目所需原生依赖。
- **EAS project ID**：云端识别一个 app 项目的唯一 ID，保存在 app config 的 extra.eas.projectId。
- **Build profile**：eas.json 中的一组原生编译和分发参数。
- **Internal distribution**：给团队 / 测试设备安装的构建分发方式，不是商店发布。
- **Remote app version source**：将 Android versionCode / iOS buildNumber 放在 EAS 管理。

## 官方代码主题覆盖

源页所有命令 / 配置主题均有改写示例：各 package manager 安装 expo-dev-client、启动 Expo CLI、EAS CLI 全局安装、eas login、eas init、extra.eas.projectId 结构、eas build:configure 的 All 选项、完整默认 eas.json profiles 以及 developmentClient / internal distribution 的意义。没有实际安装 CLI、登录或创建 EAS 项目。

## 下一页

页脚 **Next** 指向 [Create and run a cloud build for Android](https://docs.expo.dev/tutorial/eas/android-development-build/)，生成可装到 Android 实体设备或 emulator 的 development .apk。

**翻页：**[上一页：EAS Tutorial 导言](./020-EAS-Tutorial导言.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：构建 Android](./022-EAS-TutorialAndroid-Development-Build.md)
