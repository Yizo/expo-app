# 082｜开始配置并发布 EAS Update

**翻页：**[上一页：EAS Update Introduction](./081-EAS-Update-Introduction.md) · [目录](./README.md) · [下一页：Preview Updates](./083-EAS-Update-Preview.md)

**官方页面：**[Get started with EAS Update](https://docs.expo.dev/eas-update/getting-started/)

**版本边界：**EAS Update 文档未固定 SDK 版本，项目使用 Expo ~56.0.11。SDK v56.0.0 Expo Updates SDK reference 推荐 expo-updates ~56.0.27；用 expo install 会基于本机 Expo SDK 选择兼容包版本。guide 对 SDK 55+ 的 eas update 命令要求 --environment；SDK 56 项目需要按环境变量配置执行。

## 先判断项目形态

- **CNG / Expo project：**android / ios 目录通常不提交，native 项目在 prebuild 中生成。
- **Existing native project / Bare React Native：**android / ios 原生目录在仓库中维护；接入 EAS Update 还需对应原生改动。

已有 Expo Router / create-expo-app 项目通常已具备 Expo CLI 和 Metro config。若 bare project 没有 Expo modules，要先将项目接入 Expo modules / CLI。

## 安装 EAS CLI 与 expo-updates

如果是纯 RN CLI 项目且没有 Expo modules，用 install-expo-modules 接入模块配置：

```sh
npx install-expo-modules@latest
```

然后按照 SDK 56 选择兼容的 expo-updates 版本，并为 iOS pods 安装原生依赖：

```sh
npx expo install expo-updates
npx pod-install
```

既有 app 若直接使用 AppRegistry.registerComponent，官方建议改由 Expo 的 registerRootComponent 包装注册，让 Expo 可正确加载更新包内 assets；Expo Router 项目通常由 Router 自己注册 root。Bare native project 还需要确认 MainActivity / AppDelegate 使用 main module name。

```ts
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
```

安装并登录 EAS CLI：

```sh
npm install --global eas-cli
eas login
eas whoami
```

EAS CLI 也可经 Yarn / pnpm / Bun 安装；文档推荐 npm 全局安装或 npx eas-cli@latest。

## 初始化 EAS Update

在项目目录运行：

```sh
eas update:configure
```

命令会写入 EAS project ID、update URL 与 runtime version。示意的 Expo app config 结构：

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "<project-id>"
      }
    }
  }
}
```

实际 runtimeVersion 的值 / policy 应与项目 native compatibility strategy 一致，不要原样复用示例版本字符串。

### Bare React Native 工程变更

Android AndroidManifest.xml 要有 updates URL 和 runtime version metadata：

```xml
<meta-data
  android:name="expo.modules.updates.EXPO_UPDATE_URL"
  android:value="https://u.expo.dev/YOUR_PROJECT_ID" />
<meta-data
  android:name="expo.modules.updates.EXPO_RUNTIME_VERSION"
  android:value="@string/expo_runtime_version" />
```

iOS Expo.plist 要加入 URL / runtime version：

```xml
<key>EXUpdatesRuntimeVersion</key>
<string>1.0.0</string>
<key>EXUpdatesURL</key>
<string>https://u.expo.dev/YOUR_PROJECT_ID</string>
```

如果 Xcode 构建 project，要把 Expo.plist 加进 Xcode project；Android 还需对应 strings.xml 的 expo_runtime_version。

## Configure Update Channel

若用 EAS Build，更新 channel 写在 eas.json build profiles。eas update:configure 会为默认 preview / production profile 设置 channel；自定义 profile 需手动补齐：

```json
{
  "build": {
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

不使用 EAS Build 时，CNG 可以在 app config 中设 updates.requestHeaders；prebuild 后写入 native project：

```json
{
  "expo": {
    "updates": {
      "requestHeaders": {
        "expo-channel-name": "preview"
      }
    }
  }
}
```

Bare Android project 设置 expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY meta-data；iOS 在 Expo.plist 用 EXUpdatesRequestHeaders 字典写 expo-channel-name。它们要与发布 channel 对应。

## 为 iOS / Android 创建一份 Preview Build

expo-updates 是原生 library，必须先创建新的 App binary 把该模块、URL、runtimeVersion 与 channel 嵌入，再发布 OTA 更新：

```sh
eas build --profile preview --platform <platform>
```

根据目标分别填 android / ios。创建并安装这个 build 后，用户设备上的 app 才能请求 EAS Update。

## 本地开发并发布 Update

本地启动 development server，可选使用已有 package manager：

```sh
npx expo start
yarn expo start
pnpm expo start
bun expo start
```

对 JavaScript、样式、文本或静态资源做改动后发布：

```sh
eas update --channel <channel-name> --message "<message>" --environment <environment-name>
```

EAS Update SDK 55+ 要求 --environment 选取相应的 EAS environment variables；SDK 56 同样需设置。发布会在本地导出 update bundle / assets，再上传到 EAS。channel 会路由到其关联 branch。

## 测试 Update

- Development build：可从开发客户端 Extensions tab 加载 update。
- Expo Orbit：可安装 / 启动 update 与开发客户端。
- 自定义策略：用 expo-updates JavaScript API / app config 控制检查、下载与应用。
- Preview / Production release build：默认后台下载可用更新；可 force close 并重开最多两次，确认下载后会在重启时应用。

若更新不生效，应检查 project ID / URL、runtimeVersion、channel、branch、EAS environment 和该设备当前 binary 是否兼容。

## 关键名词

- **CNG / Bare：**前者按 Expo app config 生成原生目录；后者直接维护 Android / iOS native project。
- **runtimeVersion：**将 OTA update 限定给有兼容原生代码的 App binary。
- **channel：**写入 build 的更新目标名称。
- **requestHeaders：**不使用 EAS Build 时在 native app 中传递 channel 名的配置。
- **expo-updates：**App binary 中检查并应用 EAS Update 的 library。

## 官方代码主题覆盖

源页所有 code topics 均有示例：create-expo-app 新项目命令为前页已覆盖，当前页展示 bare-only install-expo-modules、expo install / pod-install；EAS CLI install/login；eas update:configure 产生的 Expo app config 与 bare Android / iOS native keys；Build / no-build 的 channel 设置；新建 preview binary；4 种 package manager 的 expo start；eas update channel/message/environment；开发 build 手动 load、release build reopen 测试。指南首页的 agent prompt 被转成流程清单，未照抄整段提示词。

## 下一页

官方页脚 **Next** 是 [Preview updates](https://docs.expo.dev/eas-update/preview/)，介绍在 Development / Preview / Production build 中预览更新的不同办法。

**翻页：**[上一页：EAS Update Introduction](./081-EAS-Update-Introduction.md) · [返回目录](./README.md) · [下一页：Preview Updates](./083-EAS-Update-Preview.md)
