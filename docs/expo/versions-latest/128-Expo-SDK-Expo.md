# 128｜Expo SDK：Expo 通用 API

**翻页：**[上一页：Universal TextInput](./127-Universal-TextInput.md) · [目录](./README.md) · [下一页：Expo SDK Accelerometer](./129-Expo-SDK-Accelerometer.md)

**官方页面：**[Expo SDK `Expo` · Latest](https://docs.expo.dev/versions/latest/sdk/expo/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/expo/)

**版本边界：**本页是 `expo` 包的跨平台通用 API 参考，不提供单一的“Recommended version”数字；项目应通过 `npx expo install expo` 与当前 Expo SDK 对齐。Latest 与 SDK v56 页面大多数 fetch、编码、Streams、URL、事件、注册入口示例一致。Latest 比 v56 多列出 `createPermissionHook()` 及 `PermissionExpiration`、`PermissionHookOptions`、`PermissionResponse`、`PermissionStatus` 权限类型。

## Expo 包提供什么

`expo` 包给 Expo 与相关模块提供通用工具：跨端网络 / 编码 / 流 API、事件 Hooks、原生模块与原生视图加载入口、应用根组件注册，以及部分原生对象引用类型。

安装（选择项目正在用的包管理器）：

~~~sh
npx expo install expo
yarn expo install expo
pnpm expo install expo
bun expo install expo
~~~

API 命名空间导入示例：

~~~tsx
import * as Expo from 'expo';
~~~

## `expo/fetch`：跨平台 Fetch

`expo/fetch` 提供符合 WinterCG 服务器端 Web API 规范的 Fetch 实现，可在 Web 和移动端使用同一套标准接口。此示例逐块读取响应体，并拼成总长为 512 bytes 的 `Uint8Array`：

~~~ts
import { fetch } from 'expo/fetch';

const resp = await fetch('https://httpbin.org/drip?numbytes=512&duration=2', {
  headers: { Accept: 'text/event-stream' },
});
const reader = resp.body.getReader();
const chunks = [];
while (true) {
  const { done, value } = await reader.read();
  if (done) {
    break;
  }
  chunks.push(value);
}
const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
console.log(buffer.length); // 512
~~~

在 Android / iOS 中，Expo 也会把这套实现设为全局 `fetch`。若希望全局继续用 React Native 内建 fetch，可设 `EXPO_PUBLIC_USE_RN_FETCH=1`；显式从 `expo/fetch` 导入的具名函数不受该开关影响。

## 编码文本

`TextEncoder` 将文字编码为字节，`TextDecoder` 再把字节解码回文字：

~~~ts
// [104, 101, 108, 108, 111]
const hello = new TextEncoder().encode('hello');

// "hello"
const text = new TextDecoder().decode(hello);
~~~

`TextEncoder` 已内建于 Hermes。原生平台的 `TextDecoder` 目前只支持 UTF-8，并非完整符合所有编码标准；如需更多编码，可使用 polyfill（例如 `text-encoding`）。

### `TextEncoderStream`

流版本会逐段编码数据，适合处理大内容而无需一次载入内存：

~~~ts
const encoder = new TextEncoderStream();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});
const reader = stream.pipeThrough(encoder).getReader();
reader.read().then(({ done, value }) => {
  console.log(value); // Uint8Array [72, 101, 108, 108, 111]
});
~~~

## Streams：逐块处理数据

原生平台也提供 Web Streams 标准的 `ReadableStream`、`WritableStream`、`TransformStream`。下面用 `ReadableStream` 发出两段文字，并逐次读出：

~~~ts
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});
const reader = stream.getReader();
reader.read().then(({ done, value }) => {
  console.log(value); // Hello
});
reader.read().then(({ done, value }) => {
  console.log(value); // World
});
~~~

EAS Hosting 服务端运行环境也支持标准 Web Streams API。

## URL 与 `URLSearchParams`

原生平台的 `URL` / `URLSearchParams` 实现取代 React Native 提供的旧 shim：

~~~ts
const url = new URL('https://expo.dev');

const params = new URLSearchParams();
~~~

`URL` 尽量符合标准，但 Android / iOS 当前不能处理主机名中的非 ASCII 字符：

~~~ts
console.log(new URL('http://🥓').toString());

// Web、Node.js: http://xn--pr9h/
// Android、iOS: http://🥓/
~~~

## `structuredClone`：深拷贝数据

`structuredClone` 可复制包含 `Map`、`Set`、`ArrayBuffer` 等复杂成员的值；但 `ArrayBuffer` 和 TypedArray 的 `transfer` 选项尚未实现：

~~~ts
const original = { name: 'Expo', date: new Date() };
const clone = structuredClone(original);
console.log(clone); // { name: 'Expo', date: Date }
~~~

## Hooks：订阅模块事件

### `useEvent(eventEmitter, eventName, initialValue)`

监听对象发出的事件并返回最新事件参数。在首次收到事件前，返回 `initialValue`；默认值为 `null`：

~~~tsx
import { useEvent } from 'expo';
import { VideoPlayer } from 'expo-video';

export function PlayerStatus({ videoPlayer }: { videoPlayer: VideoPlayer }) {
  const { status } = useEvent(videoPlayer, 'statusChange', { status: videoPlayer.status });

  return <Text>{`Player status: ${status}`}</Text>;
}
~~~

### `useEventListener(eventEmitter, eventName, listener)`

每次事件到达时调用回调；第一次 render 时订阅，组件卸载时自动移除监听：

~~~tsx
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export function VideoPlayerView() {
  const player = useVideoPlayer(videoSource);

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    console.log('Player is playing:', isPlaying);
  });

  return <VideoView player={player} />;
}
~~~

源页在 “Event subscriptions” 部分再次展示了同一个示例，代码如下：

~~~tsx
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export function VideoPlayerView() {
  const player = useVideoPlayer(videoSource);

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    console.log('Player is playing:', isPlaying);
  });

  return <VideoView player={player} />;
}
~~~

## 原生模块的事件类

`EventEmitterType` 是 Expo 模块统一的事件发送 / 监听类；调用 `emit` 时，同名监听器会同步执行，监听器的返回值会丢弃。

| 方法 | 参数 / 返回值 | 用途 |
| --- | --- | --- |
| `addListener(eventName, listener)` | 事件名 + listener；返回 `EventSubscription` | 注册监听器。 |
| `emit(eventName, ...args)` | 事件名 + 任意参数；返回 `void` | 同步触发当前事件的所有监听器。 |
| `listenerCount(eventName)` | 事件名；返回 `number` | 读取监听器数量。 |
| `removeAllListeners(eventName)` | 事件名；返回 `void` | 删除指定事件所有监听器。 |
| `removeListener(eventName, listener)` | 事件名 + listener；返回 `void` | 删除指定监听器。 |
| `startObserving(eventName)` | 事件名；返回 `void` | 第一个监听器加入时调用，可覆写做初始化。 |
| `stopObserving(eventName)` | 事件名；返回 `void` | 最后一个监听器移除时调用，可覆写做清理。 |

其他类：

- `NativeModuleType`：所有原生模块的基类，继承 `EventEmitter`。
- `SharedObjectType`：跨 JS / 原生层共享对象的基类，也继承 `EventEmitter`。`release()` 手动断开 JS 对象与原生对象，让原生内存可提前释放；之后再调用原生方法会报错。Hooks 创建的共享对象通常在 effect cleanup 时自动释放，一般不需手动调用。
- `SharedRefType`：指向原生对象的共享引用，可让不同模块传递相同的原生实例，例如 `expo-image` 的引用可交给 image-manipulator 使用，避免经文件系统额外读写。`nativeRefType: string` 表示引用的原生对象类型。
- `SharedRef`：页面列出的常量 / 类型名，用作共享原生引用。

## `expo` 包方法速查

| API | 参数 / 返回值 | 说明 |
| --- | --- | --- |
| `createPermissionHook(methods)` | 返回 `[permission, requestPermission, getPermission]` 形式的 Hook 工厂 | 将权限查询与请求方法包装成通用 Hook。Latest 有、v56 页面未列出。 |
| `installOnUIRuntime(uiRuntimeHolder)` | 返回 `void` | 将 Expo Modules 安装到 UI worklet runtime；`uiRuntimeHolder` 来自 `react-native-worklets` 的 `getUIRuntimeHolder()`。 |
| `isRunningInExpoGo()` | 返回 `boolean` | 检查当前 App 是否运行在 Expo Go。 |
| `registerRootComponent(component)` | React component；返回 `void` | 注册原生和 Web 根组件，并执行若干开发期检查 / `process.nextTick` polyfill。 |
| `registerWebModule(moduleImplementation, moduleName)` | Web module class + 名称；返回单例模块实例 | 把 Web 实现注册到 `globalThis.expo.modules[name]`。 |
| `reloadAppAsync(reason?)` | 可选重载原因；返回 `Promise<void>` | 使用当前 JS bundle 重启 App；不会像 `Updates.reloadAsync()` 那样切换到新 update。 |
| `requireNativeModule(moduleName)` | 模块名；返回模块对象 | 通过 JSI host object 加载，失败时回退到 bridge proxy。Proxy 可能不支持同步函数等能力。 |
| `requireNativeView(moduleName, viewName?)` | 模块 / 可选 view 名；返回 `ComponentType<P>` | 类似 `requireNativeComponent` 的替代入口。 |
| `requireOptionalNativeModule(moduleName)` | 模块名；返回模块或 `null` | 可选原生模块不存在时返回 `null`，不抛错。 |
| `useEventListener(...)` | 事件对象 / 名称 / callback | 也可从根包事件 API 使用，详见 Hooks 小节。 |

## Latest 权限类型

这些类型出现在 Latest 页面；SDK v56.0.0 的 `Expo` 参考页没有相同的权限类型 / 工厂方法区块：

| 类型 | 用途 |
| --- | --- |
| `PermissionExpiration` | 权限过期描述；可取 `'never'` 或 `number`。当前 Expo 权限均为永久授权。 |
| `PermissionHookOptions` | `PermissionHookBehavior` 或具体模块的额外选项。 |
| `PermissionResponse` | 权限查询 / 请求返回对象，含 `canAskAgain`、`expires`、`granted`、`status`。 |
| `PermissionStatus` | 枚举：`DENIED = "denied"`、`GRANTED = "granted"`、`UNDETERMINED = "undetermined"`。 |

## 常见问题：注册根组件

### 将 Expo 接入手动维护原生目录的项目

Android 的 `MainActivity.java` 中，将根组件名称设置为 `main`：

~~~diff
  @Override
  protected String getMainComponentName() {
+    return "main";
  }
~~~

iOS 的 AppDelegate 则需在 `application:didFinishLaunchingWithOptions:` 内将 `createRootViewWithBridge:bridge moduleName:...` 的模块名设为 `main`；源页以文字描述这处替换，没有单独的 iOS 代码块。

### 自定义 App 入口文件

不使用 Expo Router 时，可以在 `package.json` 里把 `main` 指向项目内任意入口文件；自定义入口文件需调用 `registerRootComponent`：

`package.json`：

~~~json
{
  "main": "src/main.jsx"
}
~~~

`src/main.jsx`：

~~~jsx
import { registerRootComponent } from 'expo';
import { View } from 'react-native';

function App() {
  return <View />;
}

registerRootComponent(App);
~~~

使用 Expo Router 的项目需按 Router 安装指南配置自定义入口；若要采用顶层 `src` 目录，还要按该目录约定摆放路由。

## 新手术语

- **WinterCG：**制定跨 JavaScript 运行环境 Fetch 等 Web API 兼容规范的社区工作组。
- **ReadableStream / 流：**把数据分块传输和消费的接口，不必先把完整内容加载进内存。
- **事件 emitter：**事件发送器；对象触发事件，订阅者收到参数后更新界面或状态。
- **SharedObject / SharedRef：**Expo 用于关联 JavaScript 对象与原生对象的机制；前者可调用原生行为，后者主要持有原生引用。
- **JSI：**React Native 提供的 JavaScript Interface，用于 JS 与原生实现之间直接交互的基础设施。
- **Bridge proxy：**当模块暂时不能通过 JSI host object 直接加载时使用的代理路径；部分同步能力不可用。
- **根组件（root component）：**整个 React Native 树的入口组件。`registerRootComponent` 将它登记给原生 / Web 启动器。
- **polyfill：**用 JavaScript 补齐当前运行环境缺失 API 的兼容实现。
- **Permission / 权限响应：**表示权限状态及其可否再次请求的对象；SDK 版本间 API 可能不同。

## 源页代码覆盖

Latest 和 SDK v56 页面中的代码 / 示例主题已覆盖：四种 Expo 安装命令；`expo` 命名空间导入；流式 fetch；文本编码 / 解码及 encoder stream；ReadableStream；URL / URLSearchParams 与非 ASCII 主机差异；`structuredClone`；`useEvent` / `useEventListener` 两个用法（源页重复的 listener 示例已注明）；Android 根组件名 diff；自定义 `package.json` 主入口与 `registerRootComponent`。完整 API 名称、方法参数 / 返回、SharedObject 类与 Latest 权限类型均列于表中。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/expo/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/expo/)

**翻页：**[上一页：Universal TextInput](./127-Universal-TextInput.md) · [目录](./README.md) · [下一页：Expo SDK Accelerometer](./129-Expo-SDK-Accelerometer.md)
