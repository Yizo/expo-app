# Expo KeepAwake 学习文档

`expo-keep-awake` 用于阻止设备屏幕在应用运行期间自动休眠。它提供 React Hook 和命令式函数两种控制方式，支持 Android、iOS、tvOS 和 Web，并包含在 Expo Go 中。

> 本文对应 **Expo 下一 SDK 版本**的文档，不是当前稳定版本。原文指出，最新稳定文档对应 **SDK 56**。实际项目应优先核对所用 Expo SDK 版本的文档。

## 它解决什么问题

移动设备通常会在一段时间没有用户操作后自动关闭屏幕。对于以下场景，这种系统行为可能不符合产品需求：

- 视频、演示文稿或菜谱展示
- 导航、运动记录或计时页面
- 二维码、票据或仪表盘的持续展示
- 自助终端、电视端等需要持续显示的应用

`expo-keep-awake` 可以在指定 React 组件存在期间，或者在业务代码明确要求时，阻止屏幕自动休眠。

它控制的是**屏幕自动休眠**，不是后台任务、应用保活或设备锁屏后的代码执行能力。

## React Web 开发者需要理解的背景

### React Native 组件不是 HTML 元素

示例中的：

```jsx
<View>
  <Text>Hello</Text>
</View>
```

可以暂时类比为 Web 中的：

```jsx
<div>
  <span>Hello</span>
</div>
```

但 `View`、`Text` 和 `Button` 来自 `react-native`，不是 DOM 元素。

### 组件挂载与卸载

React Native 中的组件生命周期概念与 React Web 基本一致：

- 组件进入组件树：挂载
- 组件从组件树移除：卸载

`useKeepAwake()` 会将防休眠状态与调用它的组件生命周期绑定：

- 组件挂载时启用防休眠
- 组件卸载时释放对应的防休眠锁

因此，“离开页面”是否会触发释放，取决于导航框架是否真的卸载了该页面组件。原文没有讨论不同导航框架的页面保留策略。

### Expo Go

Expo Go 是用于运行和调试 Expo 项目的客户端应用。该模块已经包含在 Expo Go 中，因此在 Expo Go 支持的开发流程里可以直接测试它。

这不代表项目完全不需要安装依赖。项目仍应通过包管理命令声明 `expo-keep-awake` 依赖。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install expo-keep-awake

# yarn
yarn expo install expo-keep-awake

# pnpm
pnpm expo install expo-keep-awake

# bun
bun expo install expo-keep-awake
```

`expo install` 与普通的 `npm install` 类似，但它会帮助 Expo 项目选择与当前 Expo SDK 兼容的包版本。

如果是在已有的 React Native 原生项目中使用该模块，需要先按照 Expo 文档将 `expo` 和 Expo Modules 支持安装到项目中。这里的“已有 React Native 项目”通常指不是通过完整 Expo 项目模板创建、并直接管理 iOS/Android 原生工程的项目。

当前文档未涉及：

- iOS Pod 安装步骤
- Android Gradle 配置
- `app.json` 或 `app.config.js` 配置
- 权限声明
- Config Plugin 配置

## 使用 Hook 控制组件生命周期

最直接的方式是在需要持续亮屏的页面组件中调用 `useKeepAwake()`：

```jsx
import { useKeepAwake } from 'expo-keep-awake';
import React from 'react';
import { Text, View } from 'react-native';

export default function KeepAwakeExample() {
  useKeepAwake();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>This screen will never sleep!</Text>
    </View>
  );
}
```

Hook 的签名为：

```ts
useKeepAwake(tag?, options?): void
```

参数说明：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `tag` | `string`，可选 | 标识当前防休眠锁 |
| `options` | `KeepAwakeOptions`，可选 | 提供监听器和 Android 警告抑制选项 |

Hook 不返回数据。它的作用是注册与组件生命周期绑定的副作用。

如果没有提供 `tag`，模块会为调用 Hook 的组件生成唯一 ID，而不是使用公共默认标签。这可以避免不同组件无意中操作同一个防休眠锁。

### 适用场景

Hook 适合“只要页面存在，就必须保持屏幕唤醒”的声明式需求：

```jsx
function NavigationScreen() {
  useKeepAwake();

  return <NavigationContent />;
}
```

这与 React Web 中使用 `useEffect` 注册并清理浏览器副作用的思路接近，但模块已经封装了启用与释放过程，不需要自行编写清理函数。

## 使用函数进行命令式控制

当防休眠状态由按钮、任务状态或其他业务事件决定时，可以使用函数控制：

```jsx
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';

async function startPresentation() {
  await activateKeepAwakeAsync('presentation');
}

async function stopPresentation() {
  await deactivateKeepAwake('presentation');
}
```

### `activateKeepAwakeAsync(tag?)`

```ts
activateKeepAwakeAsync(tag?: string): Promise<void>
```

启用防休眠，直到使用相同的 `tag` 调用 `deactivateKeepAwake()`。

未传入标签时使用默认标签：

```ts
KeepAwake.ExpoKeepAwakeTag
```

该常量的值为：

```ts
'ExpoKeepAwakeDefaultTag'
```

### `activateKeepAwake(tag?)`

```ts
activateKeepAwake(tag?: string): Promise<void>
```

它与异步版本具有相同的防休眠作用，但已经被标记为废弃。新代码应使用：

```ts
activateKeepAwakeAsync()
```

原文的函数示例仍然使用了已废弃的 `activateKeepAwake()`。这是阅读示例时需要特别注意的版本差异。

### `deactivateKeepAwake(tag?)`

```ts
deactivateKeepAwake(tag?: string): Promise<void>
```

释放与指定标签关联的防休眠锁。未传入标签时，释放默认标签对应的锁。

启用和释放必须使用相同标签：

```ts
await activateKeepAwakeAsync('video-player');
await deactivateKeepAwake('video-player');
```

下面的写法不能正确配对：

```ts
await activateKeepAwakeAsync('video-player');
await deactivateKeepAwake('other-feature');
```

## 标签与多个防休眠请求

`tag` 用于区分不同功能创建的防休眠锁。

假设两个功能分别启用了防休眠：

```ts
await activateKeepAwakeAsync('video');
await activateKeepAwakeAsync('navigation');
```

此时只释放其中一个标签，不会让屏幕恢复自动休眠：

```ts
await deactivateKeepAwake('video');
```

还必须释放另一个标签：

```ts
await deactivateKeepAwake('navigation');
```

只有所有相关标签都被释放后，屏幕才会重新允许自动休眠。

这类似于多个模块分别持有同一种共享资源：一个模块不能通过释放自己的锁，覆盖另一个模块仍然存在的需求。

**基于文档内容推导：** 在复杂应用中，应为不同业务功能使用稳定且语义明确的标签，以避免某个功能误释放其他功能创建的锁。

## 检查当前平台是否支持

```ts
const available = await KeepAwake.isAvailableAsync();
```

方法签名：

```ts
isAvailableAsync(): Promise<boolean>
```

除不支持 Wake Lock 的 Web 浏览器外，该方法在其他受支持平台返回 `true`。

在 Web 中，不应仅根据“当前是浏览器环境”就认定功能可用，应先检查：

```ts
if (await KeepAwake.isAvailableAsync()) {
  await KeepAwake.activateKeepAwakeAsync();
}
```

Web 支持程度取决于浏览器对 Wake Lock 能力的支持，原文明确说明其支持有限。

## 监听防休眠状态变化

### `addListener`

```ts
KeepAwake.addListener(tagOrListener, listener?)
```

该 API 用于观察防休眠状态变化，实际支持平台是 Web：

```ts
const subscription = KeepAwake.addListener(({ state }) => {
  // 处理状态变化
});
```

在 Web 中，当用户离开当前活动窗口或标签页时，防休眠状态可能发生变化。原生平台调用该监听 API 不执行实际操作，即 no-op。

返回值为 `EventSubscription`。文档没有进一步展示如何移除该订阅。

### Hook 中传入监听器

也可以通过 `useKeepAwake()` 的 `options` 设置 Web 状态监听器：

```ts
useKeepAwake(undefined, {
  listener: ({ state }) => {
    // 处理状态变化
  },
});
```

`listener` 仅支持 Web。

### 事件结构

事件类型为：

```ts
type KeepAwakeEvent = {
  state: KeepAwakeEventState;
};
```

当前文档列出的状态枚举只有：

```ts
KeepAwakeEventState.RELEASE = 'release'
```

它表示防休眠状态被释放。

当前文档未列出与“已激活”对应的其他枚举值，因此不应根据名称自行假设还存在某个状态。

## `KeepAwakeOptions`

Hook 的可选配置类型包含两个属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `listener` | `KeepAwakeListener` | Web 平台的状态变化回调 |
| `suppressDeactivateWarnings` | `boolean` | 抑制 Android 释放防休眠状态时的未捕获异常 |

### `listener`

回调形式为：

```ts
(event: KeepAwakeEvent) => void
```

它用于处理 Web 中防休眠状态的变化，例如用户切换到其他标签页时发生的状态变化。

### `suppressDeactivateWarnings`

Android 中，如果最初关联的 `Activity` 已经销毁或失活，释放防休眠状态的调用可能产生未处理的 Promise rejection。

可以通过以下配置抑制该未捕获异常：

```ts
useKeepAwake(undefined, {
  suppressDeactivateWarnings: true,
});
```

`Activity` 可以暂时理解为 Android 原生系统中承载一个应用界面及其生命周期的对象。它不是 React 组件，也不完全等同于 Web 页面。

该选项的作用是**抑制异常表现**。原文没有说明它会修复已失效的 Activity，也没有要求所有 Android 项目默认开启。

## 导入方式

文档展示了两种导入方式。

按名称导入：

```ts
import {
  useKeepAwake,
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
```

命名空间导入：

```ts
import * as KeepAwake from 'expo-keep-awake';

await KeepAwake.activateKeepAwakeAsync();
```

二者访问的是同一模块 API，可以根据项目现有代码风格选择。

## 平台支持

| 平台 | 基本防休眠 | 状态监听 |
| --- | --- | --- |
| Android | 支持 | `addListener` 不执行实际操作 |
| iOS | 支持 | `addListener` 不执行实际操作 |
| tvOS | 支持 | `addListener` 不执行实际操作 |
| Web | 有限支持，取决于浏览器 | 支持 |
| Expo Go | 已包含该模块 | 取决于实际运行平台 |

需要区分“包支持 Web”和“所有浏览器都支持”。Web 平台最终仍受浏览器 Wake Lock 能力限制。

## 容易踩坑的地方

### 1. 使用已废弃的激活函数

原文示例使用了：

```ts
activateKeepAwake()
```

但 API 部分明确将其标记为废弃。新代码应改用：

```ts
activateKeepAwakeAsync()
```

### 2. 忽略 Promise

激活、释放和能力检测方法都返回 Promise。涉及后续业务逻辑或错误处理时，应使用 `await`：

```ts
try {
  await KeepAwake.activateKeepAwakeAsync('player');
} catch (error) {
  // 根据项目的错误处理方式记录或展示错误
}
```

原文没有规定具体的错误处理策略。

### 3. 激活和释放使用了不同标签

标签不一致会导致原有锁没有被释放，屏幕仍然保持唤醒。

### 4. 多个标签只释放了一个

每一个已激活标签都需要分别释放。不要把 `deactivateKeepAwake()` 理解成“清除所有防休眠请求”。

### 5. 默认认为 Web 一定可用

Web 支持有限，应通过 `isAvailableAsync()` 检查能力，并考虑浏览器窗口或标签页失去活动状态时锁被释放的情况。

### 6. 把 Hook 当作全局永久开关

`useKeepAwake()` 与组件挂载状态绑定。组件卸载后，该组件对应的防休眠请求会被释放。

### 7. 误以为它能让应用在后台持续运行

当前文档只声明该模块防止屏幕休眠，没有说明它能够：

- 绕过系统后台执行限制
- 让应用被杀死后继续执行
- 阻止用户主动锁屏
- 替代后台任务或前台服务
- 控制屏幕亮度

这些能力不应从 KeepAwake 的功能中推导出来。

## 实际开发中的选择

### 页面存在期间始终亮屏

优先使用 Hook：

```jsx
function RecipeScreen() {
  useKeepAwake();
  return <Recipe />;
}
```

它能自然地跟随组件生命周期，减少忘记释放锁的风险。

### 由业务状态动态控制

使用命令式函数，并保证标签配对：

```ts
const KEEP_AWAKE_TAG = 'active-workout';

async function startWorkout() {
  await KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG);
}

async function finishWorkout() {
  await KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG);
}
```

### 同时存在多个需要亮屏的功能

为每个功能分配不同标签：

```ts
const KEEP_AWAKE_TAGS = {
  video: 'video-playback',
  navigation: 'navigation-session',
};
```

**基于经验建议：** 集中定义标签常量，可以降低字符串拼写错误导致锁无法释放的风险。

### 需要兼容 Web

先检测支持情况，并通过监听器关注锁释放事件：

```ts
const available = await KeepAwake.isAvailableAsync();

if (available) {
  await KeepAwake.activateKeepAwakeAsync('dashboard');
}
```

不要把防休眠作为关键业务正确性的唯一前提，因为浏览器可能不支持或释放 Wake Lock。

## 文档明确说明与合理推导

### 文档明确说明

- 模块提供 Hook 和命令式函数。
- `useKeepAwake()` 在所属组件挂载期间保持屏幕唤醒。
- Hook 未传标签时会使用组件唯一 ID。
- 命令式函数未传标签时使用公共默认标签。
- 激活和释放需要使用相同标签。
- 多个标签必须逐个释放。
- `activateKeepAwake()` 已废弃，应使用 `activateKeepAwakeAsync()`。
- Web 支持有限。
- `isAvailableAsync()` 在不支持 Wake Lock 的浏览器中返回 `false`。
- 状态监听实际用于 Web，在原生平台不执行操作。
- Android 原始 Activity 失效时，释放操作可能产生未处理的 Promise rejection。
- `suppressDeactivateWarnings` 可以抑制该异常。

### 基于文档内容推导

- 简单页面级需求优先使用 Hook，可以减少手动释放遗漏。
- 多业务模块应使用不同且稳定的标签，避免相互干扰。
- Web 项目应将能力检测和状态释放纳入兼容性处理。
- 命令式调用应建立明确的激活与清理路径，避免防休眠锁长期存在。

### 当前文档未涉及

- 防休眠对耗电量的具体影响
- 应用进入后台后的完整行为
- 用户主动锁屏时的行为
- 所需系统权限
- Android 和 iOS 的底层实现机制
- 测试方法和自动化测试方案
- 状态订阅的移除示例
- 浏览器兼容性的具体版本列表
- `RELEASE` 之外的事件状态
- 与视频播放、导航框架或后台任务 API 的集成方式

## 总结

`expo-keep-awake` 是一个职责明确的屏幕防休眠模块：

- 页面生命周期决定亮屏状态时，使用 `useKeepAwake()`。
- 业务事件决定亮屏状态时，使用 `activateKeepAwakeAsync()` 和 `deactivateKeepAwake()`。
- 命令式调用必须使用相同标签成对操作。
- 多个标签创建的锁需要逐个释放。
- Web 使用前应检查能力，并处理窗口或标签页切换造成的状态变化。
- 不要使用已经废弃的 `activateKeepAwake()` 编写新代码。

---

## 文档导航

- **上一页**：[intent launcher](./180__intent-launcher.md)
- **下一页**：[light sensor](./182__light-sensor.md)
