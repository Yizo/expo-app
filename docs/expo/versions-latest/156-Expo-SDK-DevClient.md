# 156｜Expo SDK DevClient 开发客户端

**翻页：**[上一页：Expo SDK Crypto 哈希、随机数与 AES](./155-Expo-SDK-Crypto.md) · [目录](./README.md) · [下一页：Expo SDK Device 设备信息](./157-Expo-SDK-Device.md)

**官方页面：**[DevClient · Latest](https://docs.expo.dev/versions/latest/sdk/dev-client/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/dev-client/)

**版本与平台：**Latest 推荐 `expo-dev-client ~57.0.19`，SDK v56.0.0 推荐 `~56.0.27`。支持 Android、iOS、tvOS；不支持 Web。两版的安装方式、核心方法和开发客户端概念相同；SDK v56 页面另列了三个 launcher 配置属性及一个 EAS Build profile 示例，Latest 页未列出这些字段。

## 开发客户端是什么

`expo-dev-client` 为 Expo debug build 加入 launcher（项目启动器）、开发者菜单以及网络请求检查等工具。Expo 文档把包含此包的 debug build 称为 **development build（开发构建）**。它是项目自己的原生 app，适合开发需要 Expo Go 未内置的原生模块，或配置自己的启动器和开发菜单。

Launcher 可打开近期使用过的项目、切换开发服务器并启动 PR preview，无需每次更换 JavaScript bundle 都重新编译原生 app。**原生依赖或原生配置改变时仍需要重建 development build**，因为对应代码 / 配置要放进原生二进制。

安装依赖：

```sh
npx expo install expo-dev-client
# 也可以使用：yarn expo install expo-dev-client
# 或：pnpm expo install expo-dev-client
# 或：bun expo install expo-dev-client
```

如果是在已有、手动维护的 React Native 工程里集成，先按 Expo 官方既有工程指南安装 `expo`，再安装 `expo-dev-client`。SDK v56 文档还说明：EAS Build profile 必须把 `developmentClient` 设为 `true`，不然生成的是没有开发工具的 standalone build。典型 profile：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

`distribution: "internal"` 表示该构建用于团队内部安装；development client profile 确保原生包带有开发客户端功能。

## Launcher 配置

CNG 项目用 `expo-dev-client` config plugin 配置 launcher；这些设置需要重新构建原生 app 才会生效。源页 app config 示例设置默认启动方式、fallback URL 和 Android 专属 URL：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-dev-client",
        {
          "launchMode": "most-recent",
          "defaultLaunchURL": "http://localhost:8081",
          "android": {
            "defaultLaunchURL": "http://10.0.0.2:8081"
          }
        }
      ]
    ]
  }
}
```

属性说明：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `launchMode` | `'most-recent'` | `'most-recent'` 尝试打开上一次使用的项目，连不上时退回 launcher；`'launcher'` 每次显示 launcher。 |
| `addGeneratedScheme` | `true` | 是否注册一个自定义 URL scheme 来打开项目；设为 `false` 可关掉自动注册的 scheme。 |
| `defaultLaunchURL` | 未设置 | 未指定最近项目或 launcher 连接失败时，直接打开的 URL；`most-recent` 模式下也作 fallback。 |
| `android.launchMode` | `'most-recent'` | 覆盖全局 `launchMode`，只影响 Android。 |
| `ios.launchMode` | `'most-recent'` | 覆盖全局 `launchMode`，只影响 iOS。 |
| `android.defaultLaunchURL` | 未设置 | 覆盖默认启动 URL，只影响 Android。 |
| `ios.defaultLaunchURL` | 未设置 | 覆盖默认启动 URL，只影响 iOS。 |

### SDK v56 页面额外列出的 launcher 属性

SDK v56.0.0 的 Contacts/DevClient 对照里还列有 `toolsButton`、`skipOnboarding`、`showMenuAtLaunch`。这些字段没有出现在当前 Latest 属性表中，不要将它们当作 Latest 已确认支持的字段。v56 配置示例为：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-dev-client",
        {
          "launchMode": "most-recent",
          "defaultLaunchURL": "http://localhost:8081",
          "android": {
            "defaultLaunchURL": "http://10.0.0.2:8081"
          },
          "toolsButton": true,
          "skipOnboarding": false,
          "showMenuAtLaunch": true
        }
      ]
    ]
  }
}
```

这三个 v56 字段分别控制浮动工具按钮、是否跳过开发菜单首次启动时的引导、启动时是否立即打开开发者菜单。CNG 或原生配置改变后需要重新构建。

## tvOS 支持

Latest 页面说明从 SDK 54 起支持 TV。Android TV 的操作与 Android 手机基本相同；Apple TV 目前支持本地 / 隧道 packager 的基础操作，但还不支持 EAS 登录以及列出 EAS builds / updates。SDK v56 页面说明了同样的 Apple TV 功能范围。

## 开发者菜单 API

```ts
import * as DevClient from 'expo-dev-client';
```

| 方法 | 平台 | 返回 | 作用 |
| --- | --- | --- | --- |
| `DevClient.openMenu()` | Android / iOS / tvOS | `void` | 打开开发者菜单。 |
| `DevClient.closeMenu()` | Android / iOS / tvOS | `void` | 关闭开发者菜单。 |
| `DevClient.hideMenu()` | Android / iOS / tvOS | `void` | 隐藏开发者菜单。 |
| `DevClient.registerDevMenuItems(items)` | Android / iOS / tvOS | `Promise<void>` | 向开发者菜单添加自定义条目。 |

自定义菜单项类型是 `ExpoDevMenuItem`：`name` 是显示标签；`callback: () => void` 是选中时运行的函数；可选 `shouldCollapse` 决定选中后是否收起菜单，默认 `false`。

```tsx
import * as DevClient from 'expo-dev-client';

async function registerTools() {
  await DevClient.registerDevMenuItems([
    {
      name: '刷新本地数据',
      callback: () => refreshLocalData(),
      shouldCollapse: true,
    },
    {
      name: '打印调试信息',
      callback: () => console.log('开发菜单自定义操作'),
    },
  ]);
}

function openDevTools() {
  DevClient.openMenu();
}
```

## 源页代码覆盖与版本差异

- Installation：覆盖 `npx`、Yarn、pnpm、Bun 安装命令。
- Configuration：覆盖 Latest `app.json` 插件例子及 SDK v56 的 `eas.json` development profile；另保留 v56 多出的 `toolsButton`、`skipOnboarding`、`showMenuAtLaunch` 配置例子并标明边界。
- API：覆盖 `import * as DevClient from 'expo-dev-client'`，以及菜单打开 / 关闭 / 隐藏和注册自定义菜单项的改写示例。
- `ExpoDevMenuItem` 类型覆盖 `name`、`callback`、可选 `shouldCollapse` 和默认行为。
- 平台差异：覆盖 TV 从 SDK 54 起的限制、Android TV 与 Apple TV 的功能边界。
- Latest 推荐 `~57.0.19`，SDK v56 推荐 `~56.0.27`。共同 API 相同；v56 页面额外说明 EAS build profile 的 `developmentClient: true` 和三项 launcher 设置，Latest 页面未列出这些字段。

**翻页：**[上一页：Expo SDK Crypto 哈希、随机数与 AES](./155-Expo-SDK-Crypto.md) · [目录](./README.md) · [下一页：Expo SDK Device 设备信息](./157-Expo-SDK-Device.md)
