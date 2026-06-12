# Expo 核心包学习笔记

> 原文档更新时间：2026 年 5 月 23 日  
> 包名：`expo`  
> 支持平台：Android、iOS、tvOS、Web，并包含在 Expo Go 中

> **版本提醒：**当前页面描述的是“下一版本 SDK”的未发布稳定文档。需要面向生产环境开发时，应以 [最新稳定版本文档（SDK 56）](https://docs.expo.dev/versions/latest/sdk/expo/) 为准。

## 文档解决的问题

`expo` 是 Expo 应用的基础包，提供 Expo 及相关模块共用的：

- 跨平台 Web 标准 API，例如 Fetch、Streams、URL 和文本编码 API。
- React 事件订阅 Hook。
- JavaScript 与原生模块交互的基础类型和方法。
- 原生共享对象及其生命周期管理能力。
- 权限相关的公共类型和 Hook 创建工具。
- 应用根组件注册、应用重载等基础功能。

它不是一个单一业务功能库，而是 Expo 模块体系的公共运行时和基础工具集合。

这篇文档主要适合以下场景：

- 开发 Expo 或 React Native 应用。
- 编写或维护 Expo 原生模块。
- 在 Web、Android、iOS 和 tvOS 之间复用数据处理代码。
- 处理原生模块事件、权限、共享对象或应用入口。
- 将 Expo 模块接入手动维护原生目录的 React Native 项目。

普通 Expo 应用开发者最常直接使用的是跨平台 Web API、事件 Hook、`isRunningInExpoGo()` 和 `registerRootComponent()`。`NativeModuleType`、`SharedObjectType`、`requireNativeModule()` 等 API 更偏向模块作者和底层集成场景。

## 安装与导入

### 安装

根据包管理器执行：

```sh
# npm
npx expo install expo

# yarn
yarn expo install expo

# pnpm
pnpm expo install expo

# bun
bun expo install expo
```

这里使用的是 `expo install`，而不是直接使用 `npm install`。

`expo install` 的作用是根据当前项目使用的 Expo SDK 选择兼容的包版本，降低 Expo SDK、React Native 和原生模块版本不匹配的风险。

### 导入整个模块

```tsx
import * as Expo from 'expo';
```

实际开发中也可以按名称导入需要的 API：

```tsx
import {
  isRunningInExpoGo,
  registerRootComponent,
  useEvent,
} from 'expo';
```

## 跨平台 Web 标准 API

`expo` 在原生平台补充了一批前端开发者熟悉的 Web 标准 API，使同一套数据处理逻辑能够在浏览器和移动端运行。

需要注意：“提供相同 API”不代表所有平台的实现细节完全一致。文档明确列出了部分原生平台限制。

## `expo/fetch`

`expo/fetch` 提供符合 WinterCG 规范的 Fetch API，目标是在 Web 和移动端提供一致的请求体验。

WinterCG 可以理解为一组面向浏览器之外 JavaScript 运行时的 Web API 兼容规范。对 React Web 开发者而言，它意味着这里的 `fetch`、`Response` 和响应流接口尽量遵循熟悉的 Web 标准。

### 流式读取响应

```ts
import { fetch } from 'expo/fetch';

const response = await fetch(
  'https://httpbin.org/drip?numbytes=512&duration=2',
  {
    headers: {
      Accept: 'text/event-stream',
    },
  }
);

const reader = response.body.getReader();
const chunks: Uint8Array[] = [];

while (true) {
  const { done, value } = await reader.read();

  if (done) {
    break;
  }

  chunks.push(value);
}

const totalLength = chunks.reduce(
  (length, chunk) => length + chunk.length,
  0
);

const buffer = new Uint8Array(totalLength);

console.log(buffer.length); // 512
```

这个例子没有等待完整响应一次性返回，而是通过 `response.body.getReader()` 分块读取二进制数据。它适合流式接口、较大响应或需要逐步处理数据的场景。

### 原生平台的全局 `fetch`

文档明确说明：

- 在 Android 和 iOS 上，`expo/fetch` 也会被安装为全局 `fetch`。
- 即使没有显式从 `expo/fetch` 导入，调用 `fetch(...)` 时也会使用 Expo 提供的 WinterCG 兼容实现。
- 如果希望保留 React Native 内置的全局 `fetch`，需要设置环境变量：

```env
EXPO_PUBLIC_USE_RN_FETCH=1
```

设置该变量后：

- 全局 `fetch` 使用 React Native 的实现。
- `import { fetch } from 'expo/fetch'` 仍然使用 Expo 的实现。

这意味着全局实现可以切换，但具名导入不受该环境变量影响。

> **容易踩坑：**第三方库通常直接调用全局 `fetch`。切换 `EXPO_PUBLIC_USE_RN_FETCH` 后，不仅自己的请求代码会受影响，第三方库的网络行为也可能改变。

## 文本编码 API

所有平台都提供以下全局 API：

- `TextEncoder`
- `TextDecoder`
- `TextEncoderStream`
- `TextDecoderStream`

### 基本编码和解码

```ts
const bytes = new TextEncoder().encode('hello');
// Uint8Array [104, 101, 108, 108, 111]

const text = new TextDecoder().decode(bytes);
// "hello"
```

`TextEncoder` 将字符串转换为字节数组，`TextDecoder` 则执行反向转换。它们常用于网络协议、文件内容、加密输入和二进制数据处理。

### 原生平台限制

文档明确说明：

- `TextEncoder` 包含在 Hermes JavaScript 引擎中。
- 原生平台的 `TextDecoder` 不完全符合标准规范。
- 原生平台只支持 UTF-8。
- 如果需要其他字符编码，应使用 `text-encoding` 等 polyfill。

Hermes 是 React Native 常用的 JavaScript 引擎，其作用类似浏览器中的 V8 或 JavaScriptCore，但运行在移动应用内部。

> **React Web 开发者需要注意：**浏览器里的 `TextDecoder` 可能支持多种编码，但不能据此假设 Android 和 iOS 也支持。处理 GBK、Big5 等非 UTF-8 数据时，需要额外方案。

### 流式编码

```ts
const encoder = new TextEncoderStream();

const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});

const reader = stream.pipeThrough(encoder).getReader();

reader.read().then(({ value }) => {
  console.log(value);
  // Uint8Array [72, 101, 108, 108, 111]
});
```

流式版本允许边接收边编码或解码，避免先将全部数据加载到内存。它更适合大文件、持续网络响应等场景。

## Streams API

原生平台全局提供标准 Web Streams API：

- `ReadableStream`：可读取的数据流。
- `WritableStream`：可写入的数据流。
- `TransformStream`：在读取和写入之间转换数据。

EAS Hosting 的服务器运行时也支持这些标准 API。

```js
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
});

const reader = stream.getReader();

reader.read().then(({ value }) => {
  console.log(value); // Hello
});

reader.read().then(({ value }) => {
  console.log(value); // World
});
```

对 React Web 开发者来说，这与浏览器 Streams API 的使用模型一致。但具体 Web 和 Node.js 版本是否支持，仍需检查对应运行时的兼容性。

## URL API

所有平台提供标准的：

```ts
const url = new URL('https://expo.dev');
const params = new URLSearchParams();
```

在原生平台，Expo 内置的 `URL` 和 `URLSearchParams` 会替代 React Native 提供的 shim。

shim 是为了模拟某个标准 API 而提供的兼容实现。这里的替换目的是让原生平台上的 URL 行为更接近 Web 标准。

### 非 ASCII 主机名限制

Expo 的 URL 实现尝试完整遵循标准，但原生平台目前不支持对主机名中的非 ASCII 字符进行标准转换。

```ts
console.log(new URL('http://🥓').toString());
```

不同平台结果如下：

```text
Web、Node.js: http://xn--pr9h/
Android、iOS: http://🥓/
```

因此，包含 Unicode 字符的国际化域名可能在原生平台产生不同结果。

> **基于文档内容推导：**如果业务需要处理国际化域名，不应依赖各平台自动规范化后的结果完全一致。应在跨平台测试中验证 URL 解析、请求和安全校验逻辑。

## `structuredClone`

`structuredClone` 是所有平台都支持的深拷贝函数。与 JSON 序列化方案相比，它可以保留 `Date`、`Map`、`Set` 和 `ArrayBuffer` 等复杂类型。

```ts
const original = {
  name: 'Expo',
  date: new Date(),
};

const clone = structuredClone(original);

console.log(clone);
// { name: 'Expo', date: Date }
```

### 限制

文档明确说明，`ArrayBuffer` 和 TypedArray 的 `transfer` 选项尚未实现。

如果项目已经为 `structuredClone` 添加了自定义 polyfill，应将其移除，以避免重复代码增加产物体积。

## 事件系统与 React Hook

Expo 提供统一的跨平台事件系统。事件可能来自：

- 原生模块。
- 原生共享对象。
- `EventEmitter` 实例。

它和浏览器 DOM 事件并不完全相同，更接近 Node.js 的 `EventEmitter`：通过事件名称订阅，在事件发生时调用监听函数。

## `useEvent`

`useEvent` 监听一个事件，并将最新的事件参数作为 React 状态值返回。事件触发后，组件会得到新值并重新渲染。

```tsx
import { useEvent } from 'expo';
import { VideoPlayer } from 'expo-video';

export function PlayerStatus({
  videoPlayer,
}: {
  videoPlayer: VideoPlayer;
}) {
  const { status } = useEvent(
    videoPlayer,
    'statusChange',
    { status: videoPlayer.status }
  );

  return <Text>{`Player status: ${status}`}</Text>;
}
```

参数含义：

| 参数 | 作用 |
| --- | --- |
| `eventEmitter` | 发出事件的对象 |
| `eventName` | 要监听的事件名称 |
| `initialValue` | 第一次事件发生前使用的初始值，默认为 `null` |

它可以类比为“将事件源同步到 React 状态”，适合事件值直接影响 UI 的情况。

## `useEventListener`

`useEventListener` 在事件发生时执行回调，但不直接返回状态。

```tsx
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export function VideoPlayerView() {
  const player = useVideoPlayer(videoSource);

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    console.log('Player is playing:', isPlaying);
  });

  return <VideoView player={player} />;
}
```

监听器会：

- 在组件首次渲染期间自动注册。
- 在组件卸载时自动移除。

它适合日志记录、触发副作用或调用其他命令，而不是直接把事件值渲染到 UI。

### 两个 Hook 的选择

| 需求 | 推荐 API |
| --- | --- |
| 用最新事件值渲染界面 | `useEvent` |
| 事件发生时执行操作 | `useEventListener` |
| 在 React 组件之外管理事件 | `addListener()` 与 `EventSubscription.remove()` |

## `EventEmitterType`

`EventEmitterType` 提供统一的事件发送和监听 API，其 C++ 实现在所有平台间共用。

事件触发时具有两个重要特征：

1. 同一事件的监听函数会被同步调用。
2. 监听函数的返回值会被忽略。

“同步调用”意味着 `emit()` 会在返回前执行完监听器。如果监听器包含耗时同步工作，会阻塞当前 JavaScript 执行流程。

### 主要方法

| 方法 | 作用 |
| --- | --- |
| `addListener(eventName, listener)` | 添加监听器，并返回订阅对象 |
| `emit(eventName, ...args)` | 同步触发指定事件的全部监听器 |
| `listenerCount(eventName)` | 返回指定事件的监听器数量 |
| `removeListener(eventName, listener)` | 移除指定监听器 |
| `removeAllListeners(eventName)` | 移除指定事件的全部监听器 |
| `startObserving(eventName)` | 添加第一个监听器时自动调用 |
| `stopObserving(eventName)` | 移除最后一个监听器时自动调用 |

`startObserving()` 和 `stopObserving()` 主要供子类重写，可用于按需启动或停止底层原生监听。

### 手动取消订阅

`addListener()` 返回 `EventSubscription`：

```ts
const subscription = emitter.addListener('change', listener);

// 不再需要时
subscription.remove();
```

调用 `remove()` 后，该监听器不会再收到事件。

> **基于经验建议：**在 React 组件中优先使用 `useEvent` 或 `useEventListener`，让卸载清理自动完成。只有在组件外或需要精细控制订阅生命周期时，再手动管理 `EventSubscription`。

## 原生模块与共享对象

这是整篇文档中最偏原生架构的部分。

在 React Web 中，JavaScript 通常直接操作浏览器提供的对象。在 React Native 中，摄像头、视频播放器、原生图片等能力由 Android 或 iOS 对象实现，JavaScript 需要通过原生模块或 JSI 与它们交互。

JSI 是 React Native 中 JavaScript 与 C++、Android、iOS 原生实现直接交互的基础接口。文档中的许多共享对象由 C++ 实现并通过 JSI 安装。

## `NativeModuleType`

`NativeModuleType` 是所有 Expo 原生模块的基础类，并继承 `EventEmitterType`。

因此，原生模块除了暴露方法和属性外，也可以向 JavaScript 发送事件。

## `SharedObjectType`

`SharedObjectType` 是 Expo 共享原生对象的基础类，同样继承事件发送能力。

共享对象通常同时存在两个部分：

- JavaScript 侧的包装对象。
- Android、iOS 等平台中的原生对象。

例如，JavaScript 中的播放器实例可能对应底层原生播放器。底层对象可能占用解码器、位图或二进制内存等资源。

### `release()`

```ts
sharedObject.release();
```

`release()` 会断开 JavaScript 对象与原生对象的联系，使原生对象可以在 JavaScript 垃圾回收之前释放。

调用后，继续调用该对象的原生方法会抛出错误。

文档明确说明：

- 大多数情况下不需要手动调用。
- 只应在明确需要手动管理原生内存的性能敏感场景使用。
- 调用前必须确保之后不会再使用该对象。
- React Hook 创建的共享对象通常会在 effect 清理阶段自动释放。
- `expo-video` 的 `useVideoPlayer()` 和 `expo-image` 的 `useImage()` 都属于自动管理示例。

> **React Web 开发者需要注意：**这不同于普通 JavaScript 对象。普通对象通常交给垃圾回收器即可，而共享对象可能持有大量不受 JavaScript 堆直接管理的原生资源。

### `useReleasingSharedObject`

```ts
const object = useReleasingSharedObject(factory, dependencies);
```

该 Hook 创建并返回共享对象，在组件卸载时自动执行清理。

参数：

| 参数 | 作用 |
| --- | --- |
| `factory` | 创建共享对象的函数 |
| `dependencies` | 与 React effect 类似的依赖数组 |

文档没有提供具体代码示例，也没有进一步说明依赖变化时的完整行为。

## `SharedRefType`

`SharedRefType` 是可以保存任意原生对象引用的 `SharedObject`，用于让彼此独立的原生库直接交换对象。

例如：

- Android 的 `ImageRef` 可以引用 `Drawable`。
- iOS 的 `ImageRef` 可以引用 `UIImage`。
- `expo-image-manipulator` 处理后的图片可以直接传给 `expo-image`。
- 该过程不需要先写入文件系统，再从文件中重新读取。

`nativeRefType` 属性表示原生引用的类型：

```ts
sharedRef.nativeRefType;
```

> **基于文档内容推导：**这种引用传递可以减少文件 I/O 和中间数据复制，对大图片等资源尤其有价值。

## 原生模块加载方法

以下 API 更常用于 Expo 模块开发或底层集成，而不是普通应用页面。

### `requireNativeModule()`

```ts
const module = requireNativeModule('ModuleName');
```

加载指定名称的原生模块。加载顺序为：

1. 尝试从 JSI host object 加载。
2. 如果失败，则回退到 bridge proxy 模块。

通过旧式代理加载的模块可能不支持同步函数等功能。

如果模块不存在，该方法会抛出错误。

### `requireOptionalNativeModule()`

```ts
const module = requireOptionalNativeModule('ModuleName');
```

行为与 `requireNativeModule()` 相同，但找不到模块时返回 `null`，而不是抛出错误。

它适合“有该原生模块就启用功能，没有也可以继续运行”的可选能力。

### `requireNativeView()`

```ts
const NativeView = requireNativeView(
  'ModuleName',
  'ViewName'
);
```

这是 `requireNativeComponent` 的替代方案，用于加载由原生模块提供的 React Native 视图组件。

### `registerWebModule()`

```ts
const instance = registerWebModule(
  ModuleImplementation,
  'ModuleName'
);
```

它将 Web 平台的模块实现注册到：

```ts
globalThis.expo.modules[className]
```

方法返回传入模块类的单例实例。

这使同一个 Expo 模块可以在 Android、iOS 使用原生实现，在 Web 使用对应的 JavaScript 类实现。

## 应用入口与根组件

## `registerRootComponent()`

```tsx
registerRootComponent(App);
```

该方法负责把指定 React 组件注册为应用根组件。

它会执行：

- 在原生平台调用 React Native 的 `AppRegistry.registerComponent`。
- 在 Web 平台调用 React Native Web 的 `AppRegistry.runApplication`，渲染到根 `index.html`。
- 全局补充 `process.nextTick`。

开发环境中还会：

- 添加 Fast Refresh 和代码包拆分指示器。
- 检查 `expo-updates` 是否配置错误。
- 在浏览器运行时检查 `react-native` 是否正确映射到 `react-native-web`。

这些开发检查和指示功能不会进入生产构建。

对 React Web 开发者而言，它相当于应用启动入口，但不等同于 React DOM 项目中的：

```tsx
createRoot(rootElement).render(<App />);
```

React Native 没有浏览器 DOM 根节点，而是把组件注册到原生应用提供的根 React Native 视图。

## 自定义入口文件

### 未使用 Expo Router

可以在 `package.json` 中将 `main` 指向项目中的任意入口文件：

```json
{
  "main": "src/main.jsx"
}
```

然后在该文件中显式注册根组件：

```jsx
import { registerRootComponent } from 'expo';
import { View } from 'react-native';

function App() {
  return <View />;
}

registerRootComponent(App);
```

仅仅使用默认导出是不够的：

```jsx
export default App;
```

当项目使用自定义入口文件时，必须调用 `registerRootComponent(App)`。

### 使用 Expo Router

使用 Expo Router 的项目需要按照 Router 安装文档中的自定义入口流程配置。若希望使用顶层 `src` 目录，应参考 Expo Router 的 `src` 目录说明。

当前文档没有展开 Expo Router 的具体配置步骤。

## 手动管理原生工程时的配置

如果项目手动维护 `android` 和 `ios` 目录，也就是常说的 bare React Native 项目，需要确保原生入口使用组件名 `main`。

### Android

修改：

```text
android/app/src/main/your-package/MainActivity.java
```

确保：

```java
@Override
protected String getMainComponentName() {
  return "main";
}
```

### iOS

修改：

```text
ios/your-project/AppDelegate.m
ios/your-project/AppDelegate.mm
ios/your-project/AppDelegate.swift
```

在创建根视图时，将 `moduleName` 设置为：

```text
main
```

JavaScript 中 `registerRootComponent()` 注册的名称与 Android、iOS 原生入口期待的名称必须一致，否则原生应用无法找到需要启动的 React 组件。

## 应用运行环境与重载

### `isRunningInExpoGo()`

```ts
const inExpoGo = isRunningInExpoGo();
```

返回当前应用是否运行在 Expo Go 中。

Expo Go 是预先集成了一组 Expo 原生模块的通用客户端。它不同于包含项目自定义原生代码的开发构建或正式应用。

此方法适合根据运行容器控制某些功能或提示。

### `reloadAppAsync()`

```ts
await reloadAppAsync('Configuration changed');
```

该方法可以在调试构建和发布构建中重新加载应用。

它只会重新加载当前正在运行的 JavaScript bundle。即使存在新的 OTA 更新，也不会自动切换到新更新。

这与 `Updates.reloadAsync()` 的关键区别是：

- `reloadAppAsync()`：继续使用当前 bundle。
- `Updates.reloadAsync()`：属于更新流程，可能用于切换到新的更新。

## 错误类型

### `CodedError`

`CodedError` 继承 JavaScript 的 `Error`，并保证存在 `code` 字段：

```ts
try {
  // ...
} catch (error) {
  if (error instanceof CodedError) {
    console.log(error.code);
    console.log(error.info);
  }
}
```

属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string` | 用于程序判断的错误代码 |
| `info` | `any`，可选 | 附加错误信息 |

相比只检查错误消息，稳定的错误代码更适合分支处理、日志统计和错误映射。

### `UnavailabilityError`

`UnavailabilityError` 继承 `CodedError`，用于表示某个属性或功能在当前平台上：

- 不可用。
- 不受支持。
- 尚未实现。

跨平台开发不能只看 TypeScript 是否允许调用，还需要考虑运行平台是否真正提供对应能力。

## 权限基础类型

移动端权限用于控制摄像头、麦克风、定位等敏感能力。它与浏览器权限模型相似，但还涉及 Android、iOS 系统设置和原生声明。

### `PermissionStatus`

可能值：

| 枚举 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未选择 |

不能把“不是已授权”全部视为同一种状态。未询问和已拒绝对后续交互的影响不同。

### `PermissionResponse`

权限查询或请求方法会返回：

| 属性 | 含义 |
| --- | --- |
| `status` | 完整权限状态 |
| `granted` | 是否已授权的便捷布尔值 |
| `canAskAgain` | 应用是否还能再次弹出权限请求 |
| `expires` | 权限过期时间 |

当 `canAskAgain` 为 `false` 时，应用不能继续依赖系统权限弹窗，而应引导用户前往系统设置修改权限。

`PermissionExpiration` 的类型是：

```ts
'never' | number
```

文档明确说明，目前所有权限都是永久授予，即当前实际过期值为 `'never'`。

### `createPermissionHook()`

```ts
const usePermission = createPermissionHook(methods);
```

该方法根据给定的权限方法快速创建模块专用的权限 Hook。返回的 Hook 提供：

```ts
[
  permissionResponse,
  requestPermission,
  getPermission
]
```

该 API 主要面向模块作者。当前文档未给出完整示例，也未展开 `PermissionHookBehavior` 和 `Options` 的详细结构。

## 其他公共 API

### `Platform`

`Platform` 提供当前平台及运行环境能力信息：

```ts
{
  canUseEventListeners: boolean;
  canUseViewport: boolean;
  isAsyncDebugging: boolean;
  isDOMAvailable: boolean;
  OS: string;
  select: PlatformSelect;
}
```

其中：

- `OS` 表示当前操作系统。
- `isDOMAvailable` 表示当前环境是否具有浏览器 DOM。
- `select` 用于按平台选择值。
- 其他字段反映事件、视口和调试环境能力。

当前文档只列出了类型，没有提供具体值或示例。

### `uuid`

`uuid` 是一个跨平台 UUID 常量，当前文档未说明其生成时机、稳定性或推荐用途。

### `SharedRef`

`SharedRef` 是跨平台共享原生引用类型。其具体含义对应前文的 `SharedRefType`，当前文档没有为这个常量提供额外示例。

### `createSnapshotFriendlyRef()`

```ts
const ref = createSnapshotFriendlyRef();
```

创建适合快照测试的 React ref。在测试快照中会显示为：

```text
[React.ref]
```

这可以避免 ref 的内部表示让快照产生无意义或不稳定的内容。

### `installOnUIRuntime()`

```ts
installOnUIRuntime();
```

该方法没有参数且返回 `void`。当前文档没有解释其用途、调用时机或限制，因此不应仅根据名称推测使用方式。

### 二进制数组类型

文档提供了若干 TypeScript 联合类型：

| 类型 | 包含内容 |
| --- | --- |
| `IntBasedTypedArray` | `Int8Array`、`Int16Array`、`Int32Array` |
| `UintBasedTypedArray` | `Uint8Array`、`Uint8ClampedArray`、`Uint16Array`、`Uint32Array` |
| `FloatBasedTypedArray` | `Float32Array`、`Float64Array` |
| `TypedArray` | 上述三类的联合类型 |

这些类型用于描述对底层二进制缓冲区的数组视图，常见于图片、音视频、网络流和原生数据交换。

## React Web 开发者最容易误解的地方

### “支持 Web 标准 API”不等于完全没有平台差异

以下 API 在原生平台也存在，但文档明确列出了差异：

- `TextDecoder` 原生端只支持 UTF-8。
- 原生端 URL 不支持标准化包含非 ASCII 字符的主机名。
- `structuredClone` 不支持 TypedArray 和 `ArrayBuffer` 的 `transfer`。
- 通过 bridge proxy 加载的原生模块可能不支持同步函数。

因此，跨平台代码仍然需要在目标平台测试。

### 全局 API 可能由 Expo 替换

Android 和 iOS 的全局 `fetch` 默认使用 Expo 实现，原生平台的 `URL` 和 `URLSearchParams` 也由 Expo 实现替代 React Native shim。

不能仅根据代码中“没有 import”就判断它一定是 JavaScript 引擎或 React Native 原始实现。

### 原生对象存在显式生命周期

`SharedObject` 不只是普通 JavaScript 对象。它可能持有播放器、位图或二进制数据等原生资源。

通常应交给 Expo Hook 自动清理。手动调用 `release()` 后，必须彻底停止使用该对象。

### 应用入口不是浏览器 DOM 入口

React Web 使用 DOM 容器挂载应用；React Native 需要通过 `AppRegistry` 与原生根视图连接。`registerRootComponent()` 封装了这一注册流程。

自定义入口文件时，只导出组件并不能完成注册。

### 事件不是 DOM 事件

Expo 的事件系统是命名事件发射器：

- 事件监听器同步执行。
- 返回值没有意义。
- 组件外手动订阅时必须移除监听器。
- React 组件内可以使用 Hook 自动管理生命周期。

## 实际开发中的使用原则

以下内容属于**基于文档内容推导**或**基于经验建议**：

1. **基于经验建议：**安装 Expo 包时优先使用 `npx expo install`，避免依赖版本与当前 Expo SDK 不兼容。
2. **基于文档内容推导：**跨平台网络代码需要明确使用全局 `fetch` 还是 `expo/fetch`，尤其是在设置了 `EXPO_PUBLIC_USE_RN_FETCH` 的项目中。
3. **基于文档内容推导：**非 UTF-8 文本、国际化域名和 `structuredClone` 转移语义都应进行真机测试。
4. **基于经验建议：**React 组件中优先使用自动清理的事件和资源 Hook，减少监听器泄漏及原生资源未释放的问题。
5. **基于文档内容推导：**只有在功能确实可选时使用 `requireOptionalNativeModule()`；如果模块是应用运行的必要条件，应使用会明确报错的 `requireNativeModule()`。
6. **基于经验建议：**权限判断应同时考虑 `status` 和 `canAskAgain`，不要在无法再次询问时反复触发请求。
7. **基于文档内容推导：**手动维护 Android 和 iOS 工程时，应把 JavaScript 注册名和两个原生入口的组件名统一为 `main`。
8. **基于经验建议：**不要在不了解对象所有引用关系时调用 `release()`；优先使用库提供的资源 Hook。

## 文档未涉及的内容

当前文档未详细说明：

- 如何创建完整的 Expo 项目。
- Expo Go、开发构建和正式构建的完整差异。
- EAS Build、EAS Update 或 EAS Hosting 的具体使用流程。
- Android 和 iOS 权限声明文件的配置方式。
- Expo Router 自定义入口的完整配置步骤。
- 如何开发一个完整的 Expo 原生模块。
- `installOnUIRuntime()` 的具体用途。
- `uuid` 的生成规则和生命周期。
- 各个平台上 `Platform` 字段的具体取值。
- `useReleasingSharedObject()` 在依赖变化时的详细行为。

这些内容不能仅根据当前页面补全，需要查阅对应专题文档。

## 总结

`expo` 包是 Expo 模块体系的公共基础层。它一方面把 Fetch、Streams、URL、文本编码和结构化克隆等 Web 标准能力带到原生平台，另一方面提供原生模块、共享对象、事件、权限和应用入口所需的公共 API。

对 React Web 开发者来说，最重要的认知是：代码形式虽然越来越接近 Web 标准，但移动端仍有独立的原生运行环境、资源生命周期、权限模型和应用启动流程。开发时既可以复用已有的 Web API 知识，也必须关注文档明确列出的平台差异与原生对象清理要求。

---

## 文档导航

- **上一页**：[textinput](./135__textinput.md)
- **下一页**：[accelerometer](./137__accelerometer.md)
