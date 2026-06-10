# Brownfield 中的生命周期监听机制

## 文档解决的问题

这篇文档解决的是：当 Expo 模块需要响应深链、推送、配置变化等系统事件时，如何把原生应用生命周期事件转发给 Expo Modules API。

## 适用场景

- 你在 brownfield 或自定义原生宿主项目里接入 Expo 模块。
- 某些 Expo 库依赖 `Application`、`Activity` 或 `AppDelegate` 生命周期。
- 你发现模块装上了，但深链、配置变化等事件没有生效。

## 核心概念

- `ApplicationLifecycleDispatcher`：Android 上分发生命周期事件的入口。
- `ReactActivityHandler`：Android 上分发 Activity 生命周期事件的机制。
- `ReactActivityLifecycleListener` / `ApplicationLifecycleListener`：Android 模块注册回调的接口。
- `ExpoAppDelegate`：iOS 上可自动转发生命周期事件的基类。
- `ExpoAppDelegateSubscriber`：iOS 模块订阅 `AppDelegate` 事件的接口。

对 React Web 开发者来说，可以把这理解为“不是所有库都只靠 JS 层监听事件，有些能力必须先在原生入口把系统事件转发出去”。

## 按原文结构整理的核心内容

### 1. 为什么需要生命周期监听

文档明确说，有些 Expo 库要处理：

- deep links
- push notifications
- configuration changes

这些都不是普通 React 组件内部自己就能拿到的事件，而是系统级事件。

### 2. Android 机制

Android 侧需要把 `Application` 和 `Activity` 生命周期事件转发给 Expo Modules API。

文档点名两个关键通道：

- `ApplicationLifecycleDispatcher`
- `ReactActivityHandler`

模块会通过 `Package` 类提供 listener 实现，从而注册回调。

### 3. iOS 机制

iOS 侧由：

- `ExpoAppDelegate`
- `ExpoAppDelegateSubscriber`

这套机制负责把 `AppDelegate` 调用转发给订阅者。

如果你的 `AppDelegate` 没有继承别的类，文档建议可以直接继承 `ExpoAppDelegate`，这样会更省事。

### 4. 如何验证是否接通

文档推荐用 `expo-linking` 做测试：

```sh
npx expo install expo-linking
```

然后在代码里监听 URL 事件，再用 `uri-scheme` 打开 deep link：

```sh
npx uri-scheme open com.example.app://somepath/details --android
npx uri-scheme open myapp://somepath/details --ios
```

如果控制台能打印收到的 URL，说明生命周期转发链路基本正常。

## 关键命令、配置、文件说明

关键命令：

- `npx expo install expo-linking`
- `npx uri-scheme open ... --android`
- `npx uri-scheme open ... --ios`

关键代码：

```jsx
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

useEffect(() => {
  const listener = Linking.addEventListener('url', ({ url }) => {
    console.log('Received deep link:', url);
  });

  return listener.remove;
}, []);
```

关键原生入口：

- Android `Application`
- Android `Activity`
- iOS `AppDelegate`

## 注意事项、限制条件和坑点

- 文档明确说：不是所有可能带来明显副作用的 `UIApplicationDelegate` 方法都被支持。
- 如果你的 iOS `AppDelegate` 已经继承其他类，不能简单无脑改成 `ExpoAppDelegate`，需要按现有结构处理转发。
- 只装模块不转发生命周期，某些能力会“看起来安装成功，实际上不工作”。

## React Web 开发者易误解点

- 容易认为 deep link、推送、配置变化都能像浏览器事件一样直接在 JS 层拿到。这里很多事件先发生在原生宿主层。
- 容易低估 `AppDelegate` / `Application` 入口的重要性。它们在移动端相当于应用级启动与事件分发中心。
- 容易认为模块功能失效一定是 JS 代码问题。当前页说明也可能是原生生命周期没有转发。

## 实际开发建议

- 只要引入依赖系统事件的 Expo 模块，就应检查生命周期转发是否完整。
- 优先用 `expo-linking` 做最小验证，因为 deep link 最直观。
- 基于经验建议：把“生命周期转发是否完成”作为 brownfield 接入检查清单的一项。

## 文档明确说明

- Expo Modules API 提供机制把生命周期事件转发给模块。
- Android 依赖 `ApplicationLifecycleDispatcher` 和 `ReactActivityHandler`。
- iOS 可以通过 `ExpoAppDelegate` 或 subscriber 机制实现。
- `expo-linking` 可用于验证回调是否生效。

## 基于文档内容推导

- 基于文档内容推导：生命周期接线是 brownfield 项目里很多“模块无响应”问题的根因之一。
- 基于文档内容推导：如果未来会接更多系统能力模块，先把这层机制搭稳会显著降低后续接入成本。

## 当前文档未涉及

- 当前文档未给出 Android/iOS 具体完整的原生代码片段。
- 当前文档未涉及推送通知等其他模块的实际业务代码。
