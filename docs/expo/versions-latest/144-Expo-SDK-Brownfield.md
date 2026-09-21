# 144｜Expo SDK Brownfield 原生工程集成

**翻页：**[上一页：Expo SDK Brightness 屏幕亮度](./143-Expo-SDK-Brightness.md) · [目录](./README.md) · [下一页：Expo SDK BuildProperties](./145-Expo-SDK-BuildProperties.md)

**官方页面：**[Brownfield · Latest](https://docs.expo.dev/versions/latest/sdk/brownfield/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/brownfield/)

**版本边界：**Latest 推荐 `expo-brownfield ~57.0.22`；SDK v56.0.0 推荐 `~56.0.29`。两版都提供原生与 React Native 双向消息、共享状态、导航返回和原生模块构建 CLI。一个可见差异是 `addSharedStateListener` 的回调类型：Latest 文档写 `SharedStateChangeEvent<T> | undefined`，v56 精确版写 `T | undefined`。SDK 56 项目按 v56 页面接收原始共享值。

## 什么叫 Brownfield

**Brownfield（棕地集成）**指已有一个原生 iOS / Android 应用，再把 React Native / Expo 页面嵌入其中，而不是用 React Native 重写整款 App。`expo-brownfield` 提供三类能力：

- React Native 页面与原生宿主之间双向发送消息、同步共享状态，并在需要时返回原生界面。
- Config Plugin 自动在 Expo 工程中生成 brownfield 目标 / 模块。
- CLI 构建 Android Maven 工件和 iOS XCFramework，交由宿主原生工程集成。

安装：

```sh
npx expo install expo-brownfield
# 也可使用 yarn / pnpm / bun expo install expo-brownfield
```

已有 React Native 工程还需先集成 `expo` 包。Brownfield CLI 可以查看为该集成生成的 Android 发布任务：

```sh
npx expo-brownfield [command] [options]
npx expo-brownfield tasks:android
```

## React Native 与宿主原生应用通信

消息是带 `type` 和自定义 `data` 的对象。React Native 侧可主动发给宿主：

```ts
import * as Brownfield from 'expo-brownfield';

Brownfield.sendMessage({
  type: 'AppLanguageChanged',
  data: {
    language: 'zh-CN',
    source: 'expo-screen',
    enabled: true,
  },
});
```

React Native 也可以接收宿主发来的消息，并在组件卸载时取消监听：

```tsx
import * as Brownfield from 'expo-brownfield';
import type { MessageEvent } from 'expo-brownfield';
import { useEffect } from 'react';

function NativeMessageListener() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('原生宿主发来消息：', event);
    };

    const subscription = Brownfield.addMessageListener(handleMessage);
    return () => subscription.remove();
  }, []);

  return null;
}
```

### 原生 Kotlin / Swift 向 React Native 发消息

Android 原生宿主使用 `BrownfieldMessaging.sendMessage()` 发送 Map：

```kotlin
import expo.modules.brownfield.BrownfieldMessaging

BrownfieldMessaging.sendMessage(
  mapOf(
    "type" to "NativeStatusChanged",
    "timestamp" to System.currentTimeMillis(),
    "data" to mapOf("platform" to "android")
  )
)
```

iOS 宿主使用 Swift 字典传递同样的信息：

```swift
import ExpoBrownfield

BrownfieldMessaging.sendMessage([
  "type": "NativeStatusChanged",
  "timestamp": Date().timeIntervalSince1970,
  "data": ["platform": "ios"]
])
```

### 原生宿主监听 React Native 消息

Android / Kotlin 的监听会返回 `listenerId`，需要用同一 id 取消：

```kotlin
import expo.modules.brownfield.BrownfieldMessaging

val listenerId = BrownfieldMessaging.addListener { event ->
  println("React Native 发来消息：$event")
}

// 不再需要时清理
BrownfieldMessaging.removeListener(listenerId)
```

iOS / Swift 同样会返回可供移除的 listener id：

```swift
import ExpoBrownfield

let listenerId = BrownfieldMessaging.addListener { message in
  print("React Native 发来消息：\(message)")
}

// 不再需要时清理
BrownfieldMessaging.removeListener(id: listenerId)
```

## Config Plugin 生成集成目标

CNG 项目可通过 `expo-brownfield` Config Plugin 生成独立的 React Native iOS Target 与 Android library module：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-brownfield",
        {
          "ios": {
            "targetName": "MyBrownfieldTarget",
            "bundleIdentifier": "com.example.brownfield"
          },
          "android": {
            "group": "com.example",
            "libraryName": "brownfield",
            "package": "com.example.brownfield",
            "version": "1.0.0"
          }
        }
      ]
    ]
  }
}
```

| 配置项 | 平台 | 默认 / 说明 |
| --- | --- | --- |
| `ios.targetName` | iOS | `<scheme>brownfield` 或 `<slug>brownfield`；React Native Xcode target 名称。 |
| `ios.bundleIdentifier` | iOS | 原生 App bundle id 的后缀加 target 名，或 `com.example.<targetName>`；要与主 App 唯一。 |
| `ios.buildReactNativeFromSource` | iOS | 默认 `false`；设为 `true` 会从源码构建 React Native，构建时间明显增加。 |
| `android.group` | Android | Maven group id，默认由 Android package 去掉末段得到。 |
| `android.libraryName` | Android | 生成的 library module 名，默认 `brownfield`。 |
| `android.package` | Android | 生成代码包名，默认主 App package 加 `.brownfield`，或 `com.example.brownfield`。 |
| `android.version` | Android | 发布到 Maven 时使用的 library 版本号，默认 `1.0.0`。 |
| `android.publishing` | Android | 发布方式配置，默认 `[{ type: 'localMaven' }]`；支持 local Maven、本地目录、公有远端和私有远端。 |

更改 Config Plugin 后需要通过 prebuild 重新生成原生工程，再按 CLI 产物接入宿主项目。

## Brownfield CLI 命令

| 命令 | 作用 |
| --- | --- |
| `npx expo-brownfield build:android [options]` | 构建 brownfield library，并发布到配置的 Maven 仓库。 |
| `npx expo-brownfield build:ios [options]` | 构建 brownfield XCFramework，并把 Hermes XCFramework 复制到 artifacts 目录。 |
| `npx expo-brownfield tasks:android` | 列出可运行的发布 task 与 Maven repository。 |

```sh
npx expo-brownfield build:android --all
npx expo-brownfield build:ios --release --artifacts ./artifacts
```

### Android 发布参数

| 参数 | 作用 |
| --- | --- |
| `-d, --debug` | 构建 debug 变体。 |
| `-r, --release` | 构建 release 变体。 |
| `-a, --all` | 同时构建 debug 与 release；默认值。 |
| `-l, --library` | 指定 Brownfield library 名称。 |
| `--repo, --repository` | 指定 Maven 发布仓库。 |
| `-t, --task` | 指定 Gradle 发布 task。 |
| `--verbose` | 显示子进程完整日志。 |

### iOS 发布参数

| 参数 | 作用 |
| --- | --- |
| `-d, --debug` | 构建 debug 变体。 |
| `-r, --release` | 构建 release；默认值。 |
| `-a, --artifacts` | artifacts 输出路径，默认 `./artifacts`。 |
| `-s, --scheme` | Xcode scheme 名。 |
| `-x, --xcworkspace` | Xcode workspace 路径。 |
| `-p, --package` | 将产物作为 Swift Package 发布，可选包名。 |
| `--verbose` | 显示子进程完整日志。 |

## 共享状态与导航

`useSharedState(key, initialValue?)` 类似 React `useState`，但状态通过 key 在原生与 React Native 之间共享，返回 `[value, setValue]`。初始值仅在尚无共享值时使用：

```tsx
import * as Brownfield from 'expo-brownfield';
import { Button, Text, View } from 'react-native';

function SharedLanguageSetting() {
  const [language, setLanguage] = Brownfield.useSharedState('language', 'zh-CN');

  return (
    <View>
      <Text>当前语言：{language}</Text>
      <Button title="切换英文" onPress={() => setLanguage('en-US')} />
    </View>
  );
}
```

其他共享状态方法有 `getSharedStateValue(key)`、`setSharedStateValue(key, value)`、`deleteSharedState(key)` 和 `addSharedStateListener(key, callback)`。Native host 也可用同一个 key 读写值。SDK 56 的 shared-state listener 收到 `(value: T | undefined)`；Latest 的签名则是 `(event: SharedStateChangeEvent<T> | undefined)`，升级时应对照对应版本的类型。

`popToNative(animated?)` 会关闭当前 React Native 界面并返回原生宿主，`animated` 只在 iOS 使用且默认 `false`。`setNativeBackEnabled(enabled)` 控制 Android 原生返回键是否回到 native，而非交给 React Navigation 处理。

## API 速查

| API | 作用 |
| --- | --- |
| `sendMessage(message)` | 从 React Native 向宿主原生端发送 `Record<string, any>` 消息。 |
| `addMessageListener(listener)` | 监听宿主发来的 `MessageEvent`；返回 `EventSubscription`。 |
| `removeMessageListener(listener)` / `removeAllMessageListeners()` | 移除单个或全部 RN message listener。 |
| `getMessageListenerCount()` | 获取当前注册的消息监听数量。 |
| `useSharedState(key, initialValue?)` | React Hook 读取 / 更新共享状态。 |
| `getSharedStateValue(key)` / `setSharedStateValue(key, value)` / `deleteSharedState(key)` | 直接读取、设置或删除共享状态。 |
| `addSharedStateListener(key, callback)` | 监听某个 key 的状态变化；回调签名按 SDK 版本区分。 |
| `popToNative(animated?)` | 关闭 RN 视图，回到 host 原生界面。 |
| `setNativeBackEnabled(enabled)` | 启用 / 禁用 Android 原生返回键导航到 host 的行为。 |

`EventSubscription.remove()` 可清理事件订阅。`MessageEvent` 是 `Record<string, any>`，消息通常用 `type` 区分用途，再在 `data` 放业务负载。

## 给 React Web 开发者的术语

- **Host App：**承载 React Native 界面的既有原生 App，通常仍负责启动、原生导航、权限和系统 API。
- **Target / library module：**iOS 的独立 Xcode target 与 Android 的 library module；构建后以原生二进制 / Maven 工件交给宿主集成。
- **双向桥接：**一个方向用 JS API 给原生发送结构化消息，另一个方向用 listener 接收宿主事件；它不是 HTTP 请求。
- **共享状态：**由 Brownfield 按 key 同步给原生和 React Native 的值，适合跨两端共享少量状态；更新较频繁或大数据仍要考虑序列化 / 线程成本。
- **XCFramework / Maven：**XCFramework 是 Apple 平台原生框架分发包；Maven 是 Android 常见的二进制依赖仓库格式。

## 页面代码主题覆盖

官方代码主题已逐项重写：四种包管理器安装；JS 向 native 发送消息；React Native 接收原生事件并清理 listener；Kotlin / Swift 从原生向 RN 发消息及原生侧接收 / 移除 listener；Config Plugin `app.json` 示例；Brownfield CLI 主入口、Android / iOS build 命令和 Android tasks 命令；`useSharedState` Hook；`addMessageListener` subscription 清理。所有配置字段、CLI 参数、API 方法、消息事件类型与 SDK56 / Latest shared-state callback 差异都在页面列明。

**来源：**[Expo Brownfield · Latest](https://docs.expo.dev/versions/latest/sdk/brownfield/) · [Expo Brownfield · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/brownfield/)

**翻页：**[上一页：Expo SDK Brightness 屏幕亮度](./143-Expo-SDK-Brightness.md) · [目录](./README.md) · [下一页：Expo SDK BuildProperties](./145-Expo-SDK-BuildProperties.md)
