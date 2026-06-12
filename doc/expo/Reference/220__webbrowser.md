# Expo WebBrowser 学习指南

> 文档版本说明：原文修改于 2026 年 1 月 15 日，描述的是 **下一个 Expo SDK 版本**，并非当前稳定版本。原文指出当前最新稳定版本为 **SDK 56**。实际项目应核对所使用 SDK 对应的 API 文档。

## 文档解决的问题

`expo-web-browser` 用来从 Expo / React Native 应用中打开系统浏览器界面，并处理浏览器完成登录后重定向回应用的流程。

它主要适合两类场景：

1. **打开普通网页**
   - 隐私政策
   - 用户协议
   - 帮助中心
   - 外部文章

   使用 `WebBrowser.openBrowserAsync()`。

2. **完成网页登录或 OAuth 认证**
   - 使用 Google、GitHub 等第三方账号登录
   - 在认证服务器完成登录后返回应用
   - Web 端通过弹窗完成认证

   使用 `WebBrowser.openAuthSessionAsync()`。

两种场景虽然都会打开浏览器，但它们的 Cookie、重定向处理方式和返回结果并不相同，不能随意互换。

## 阅读前需要理解的背景知识

### 它不是 WebView

`expo-web-browser` 打开的不是应用自己渲染的网页组件，而是系统提供的浏览器界面：

- Android 使用 Chrome Custom Tabs。
- iOS 普通浏览使用 `SFSafariViewController`。
- iOS 认证使用 `ASWebAuthenticationSession`。
- Web 平台使用浏览器的 `window.open()`。

对 React Web 开发者来说，可以将它理解为“调用操作系统提供的受控浏览器窗口”，而不是在 React Native 组件树中加入一个 `<iframe>`。

因此：

- 不能像普通 React 组件一样直接控制网页 DOM。
- 不能通过 CSS 修改网页内部样式。
- 不同平台的关闭方式、Cookie 行为和返回结果不同。

### Custom Tabs

Chrome Custom Tabs 是 Android 提供的一种应用内浏览体验。页面仍然由浏览器处理，但界面可以保留应用配置的工具栏颜色、标题、分享菜单等。

它兼顾了：

- 浏览器自身的安全和网页兼容能力；
- 比完全跳转到浏览器应用更连贯的用户体验；
- 一定程度的界面定制能力。

### Deep Link

Deep Link 是一种能够打开应用并定位到特定位置的 URL，例如：

```text
demo://auth/callback
```

认证服务器在用户登录完成后跳转到这个地址，操作系统便可以重新唤起应用。

在 iOS 的默认认证流程中，需要在 `app.json` 中声明 URL scheme，例如：

```json
{
  "expo": {
    "scheme": "demo"
  }
}
```

此时认证回调可以使用：

```text
demo://auth/callback
```

如果项目使用 Expo Router，文档说明 Deep Link 会被自动处理。

### Universal Link

Universal Link 使用普通 HTTPS 地址打开应用，例如：

```text
https://example.com/auth/callback
```

它与自定义 scheme 不同，需要 iOS Associated Domains entitlement 等原生配置。

`preferUniversalLinks` 可在 iOS 17.4 及以上版本请求使用 HTTPS Universal Link 回调。

## 安装

```sh
# npm
npx expo install expo-web-browser

# yarn
yarn expo install expo-web-browser

# pnpm
pnpm expo install expo-web-browser

# bun
bun expo install expo-web-browser
```

推荐使用 `expo install`，因为它会选择与当前 Expo SDK 兼容的依赖版本。

如果是在已有的裸 React Native 项目中安装，必须先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 支持。仅安装 `expo-web-browser` 包不足以让原生模块工作。

## 原生配置与重新构建

`expo-web-browser` 内置 config plugin。使用 Continuous Native Generation（CNG）的项目可以通过插件配置不能在运行时修改的原生属性。

需要特别理解：

- React Web 的依赖通常安装后刷新开发服务器即可生效。
- Expo 原生模块的部分配置会进入 iOS / Android 原生工程。
- 此类配置变更后，需要生成并构建新的应用二进制文件。
- 如果项目不使用 CNG，则需要手动修改原生工程。

当前文档没有列出该 config plugin 的具体配置字段，只说明它可以处理必须在构建期设置的属性。因此不能仅根据本文确定完整的插件配置方式。

## 基础用法

```jsx
import { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function App() {
  const [result, setResult] = useState(null);

  const handlePress = async () => {
    const result = await WebBrowser.openBrowserAsync('https://expo.dev');
    setResult(result);
  };

  return (
    <View style={styles.container}>
      <Button title="Open WebBrowser" onPress={handlePress} />
      <Text>{result && JSON.stringify(result)}</Text>
    </View>
  );
}
```

导入方式为：

```js
import * as WebBrowser from 'expo-web-browser';
```

调用方法会返回 Promise，因此应该使用 `await` 或 Promise 回调处理结果。

示例中的 `Button`、`Text`、`View` 和 `StyleSheet` 是 React Native 组件及样式 API，分别可近似理解为 React Web 中的按钮、文本、容器和样式声明，但它们不是 HTML 元素。

原文示例使用了 `Constants.statusBarHeight`，却没有展示 `Constants` 的导入。若直接使用示例，需要自行确认并补充对应依赖和导入。

## 普通浏览与认证浏览的选择

### `openBrowserAsync()`：打开普通网页

```js
const result = await WebBrowser.openBrowserAsync(
  'https://example.com/privacy'
);
```

平台行为：

- Android：通过 Chrome Custom Tab 打开。
- iOS：通过 `SFSafariViewController` 以模态窗口打开。
- Web：打开浏览器窗口。

iOS 11 之后，`SFSafariViewController` 不再与系统 Safari 共享 Cookie。因此，它不适合作为依赖 Safari 登录状态的认证入口。

应当用于：

- 隐私政策；
- 用户协议；
- 帮助页面；
- 不需要认证回调的外部内容。

返回值存在平台差异：

- Android 成功打开后返回 `{ type: 'opened' }`。
- iOS 用户主动关闭时返回 `{ type: 'cancel' }`。
- iOS 调用 `dismissBrowser()` 关闭时返回 `{ type: 'dismiss' }`。

这意味着 Android 上 Promise 返回 `opened` 只表示浏览器已经成功打开，并不表示用户已经看完页面或完成某项业务。

### `openAuthSessionAsync()`：完成认证

```js
const result = await WebBrowser.openAuthSessionAsync(
  'https://example.com/login',
  'demo://auth/callback'
);
```

参数：

| 参数 | 含义 |
| --- | --- |
| `url` | 要打开的登录页面 |
| `redirectUrl` | 登录结束后返回应用或原页面的地址 |
| `options` | 认证会话选项，默认 `{}` |

Android 没有本文所指的原生 AuthSession 实现，因此会使用 Custom Tabs、React Native `AppState` 和 Expo `Linking` 组合实现认证流程。此时继承自 `WebBrowserOpenOptions` 的浏览器参数可以生效。

iOS 使用 `ASWebAuthenticationSession`，系统会询问用户是否允许应用通过指定网站进行认证。存在原生 AuthSession 实现时，普通浏览器界面参数会被忽略。

#### iOS 回调配置

默认情况下，认证服务器配置的回调 URI 应使用 `app.json` 中 `expo.scheme` 对应的协议：

```json
{
  "expo": {
    "scheme": "demo"
  }
}
```

例如使用：

```text
demo://auth/callback
```

而不是直接使用：

```text
https://example.com/auth/callback
```

文档明确说明，这一流程不需要额外注册 `Linking.addEventListener`，强行添加监听反而可能产生副作用。

如果已经配置 Associated Domains，并且目标是 iOS 17.4 及以上版本，可以通过 `preferUniversalLinks: true` 请求使用 HTTPS 回调。

#### 认证结果

`openAuthSessionAsync()` 返回 `WebBrowserAuthSessionResult`，它可能是：

```ts
{ type: 'success', url: string }
```

或者普通的浏览器结果，例如：

```ts
{ type: 'cancel' }
{ type: 'dismiss' }
```

文档列出的情况包括：

- 用户拒绝允许应用进行认证：`cancel`；
- 用户关闭浏览器：`cancel`；
- 通过 `dismissBrowser()` 关闭：`dismiss`；
- 成功重定向：`success`，并包含最终 URL。

业务代码不应只判断 Promise 是否成功返回，而应检查 `result.type`。

## Web 平台认证流程

Web 平台使用 `window.open()` 创建认证窗口。

- 桌面浏览器通常打开弹窗。
- 移动浏览器通常打开新标签页。
- 回调页面需要调用 `maybeCompleteAuthSession()` 完成认证并关闭窗口。

### 必须运行在安全环境中

Web 认证只能运行在：

- `localhost`；
- HTTPS 页面。

否则会抛出：

```text
ERR_WEB_BROWSER_CRYPTO
```

本地测试可使用：

```sh
npx expo start --https
```

### 必须保持相同 Origin

认证开始时，库会生成加密状态并写入当前 Origin 的 `localStorage`。认证回调页面必须与发起认证的页面保持相同 Origin。

Origin 包括：

- 协议；
- 主机名；
- 端口。

例如认证从以下地址开始：

```text
https://localhost:19006
```

则回调也必须回到这个 Origin。下面的地址即使指向同一台电脑，也不是相同 Origin：

```text
https://128.0.0.*:19006
```

若 Origin 不一致，回调页面读取不到缓存状态，可能返回：

```text
No auth session is currently in progress
```

### 回调页面调用 `maybeCompleteAuthSession()`

```js
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
```

这个方法应在认证窗口最终跳转到的页面中执行。

成功时：

- 返回结果的 `type` 为 `success`；
- 父窗口会尝试立即关闭子窗口。

失败时，`type` 为 `failed`，`message` 会说明原因。

常见失败原因：

| 消息 | 含义 |
| --- | --- |
| `Not supported on this platform` | 在 Android 或 iOS 调用了仅供 Web 使用的方法 |
| `Cannot use expo-web-browser in a non-browser environment` | 在 SSR 或 Node.js 环境执行，没有浏览器对象 |
| `No auth session is currently in progress` | `localStorage` 中没有认证状态，常见于 Origin 不一致 |
| 当前 URL 与原始 redirect URL 不匹配 | 实际回调地址和开始认证时的 `returnUrl` 不一致 |

开发期间可以使用：

```js
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: true,
});
```

这会跳过回调地址匹配检查。它降低了验证强度，文档只将其作为开发阶段的处理方式，不应默认用于生产环境。

### 必须紧跟用户交互调用

移动 Web 的 Chrome 和 Safari 会阻止不紧跟用户交互发生的 `window.open()`。

正确的调用位置通常是按钮事件：

```jsx
<Button
  title="登录"
  onPress={() => WebBrowser.openAuthSessionAsync(loginUrl)}
/>
```

下面这种流程可能因前置异步任务耗时过长而被拦截：

```js
const handleLogin = async () => {
  await performLongRunningTask();
  await WebBrowser.openAuthSessionAsync(loginUrl);
};
```

被拦截时会抛出：

```text
ERR_WEB_BROWSER_BLOCKED
```

文档建议提前完成其他加载工作，并在准备完成前禁用用户输入，使打开认证窗口的调用能够直接响应用户操作。

### 窗口关闭检测

Web 端会每 1000 毫秒检查一次认证窗口是否被用户关闭。如果检测到关闭，Promise 会返回：

```js
{ type: 'dismiss' }
```

如果父窗口在认证完成前被刷新，子窗口可能丢失对父窗口的引用并抛出：

```text
ERR_WEB_BROWSER_REDIRECT
```

此时需要用户手动关闭子窗口。

## 浏览器控制方法

### `dismissBrowser()`

仅支持 iOS：

```js
await WebBrowser.dismissBrowser();
```

用于关闭当前展示的普通浏览器，成功后返回：

```js
{ type: 'dismiss' }
```

其他平台没有对应能力时会抛出错误。

### `dismissAuthSession()`

支持 iOS 和 Web：

```js
WebBrowser.dismissAuthSession();
```

- iOS：关闭当前认证会话。
- Web：关闭与认证流程关联的弹窗。
- 返回类型为 `void`。
- 当前环境不支持关闭时会抛出错误。

## Android Custom Tabs 性能与资源管理

以下 API 仅支持 Android，主要用于提前连接浏览器服务、预加载潜在 URL，以及在不再需要时释放连接。

### `warmUpAsync()`

```js
await WebBrowser.warmUpAsync();
```

提前调用浏览器 Custom Tabs 服务的 `warmUp`，减少之后打开浏览器时的准备开销。

也可以指定浏览器包名：

```js
await WebBrowser.warmUpAsync('com.android.chrome');
```

### `mayInitWithUrlAsync()`

```js
await WebBrowser.mayInitWithUrlAsync(
  'https://example.com/login'
);
```

通知浏览器某个 URL 很可能即将被打开。浏览器可以据此提前初始化相关资源，但文档没有保证页面一定会被完整预加载。

### `coolDownAsync()`

```js
await WebBrowser.coolDownAsync();
```

释放由 `warmUpAsync()` 或 `mayInitWithUrlAsync()` 创建的服务绑定。

文档明确建议在不再需要这些绑定时调用，以避免潜在的内存泄漏。应用销毁时系统也会清除绑定，对多数简单场景可能已经足够。

典型组合为：

```js
await WebBrowser.warmUpAsync();
await WebBrowser.mayInitWithUrlAsync(loginUrl);

try {
  await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);
} finally {
  await WebBrowser.coolDownAsync();
}
```

这段组合是**基于文档内容推导**的资源管理方式；原文分别说明了各方法的职责，但没有提供这一完整代码。

### 查询支持 Custom Tabs 的浏览器

```js
const browsers =
  await WebBrowser.getCustomTabsSupportingBrowsersAsync();
```

结果包含：

| 字段 | 含义 |
| --- | --- |
| `browserPackages` | 能处理 Custom Tabs 的浏览器包名 |
| `servicePackages` | 能提供 Custom Tabs Service 的包名 |
| `defaultBrowserPackage` | 用户设置的默认浏览器 |
| `preferredBrowserPackage` | Custom Tabs 客户端优先使用的浏览器 |

该查询并非完全可靠。Android 底层通过 `PackageManager.getResolvingActivities` 查询，设置默认浏览器后，某些浏览器可能不会出现在 `browserPackages` 中。

`preferredBrowserPackage` 只有在浏览器同时出现在 `browserPackages` 和 `servicePackages` 中时才可能被选中。

## `WebBrowserOpenOptions`

这些选项用于控制浏览器界面和启动行为，但并不是所有平台都支持所有字段。

| 配置项 | 平台 | 作用 |
| --- | --- | --- |
| `browserPackage` | Android | 指定处理 Custom Tabs 的浏览器包名 |
| `toolbarColor` | Android、iOS | 工具栏颜色 |
| `controlsColor` | iOS | `SFSafariViewController` 控件颜色 |
| `secondaryToolbarColor` | Android | 次级工具栏颜色 |
| `dismissButtonStyle` | iOS | 关闭按钮样式：`done`、`close` 或 `cancel` |
| `presentationStyle` | iOS | 浏览器模态窗口的展示方式 |
| `readerMode` | iOS | 在可用时进入 Safari 阅读模式 |
| `createTask` | Android | 是否让浏览器使用新的 Android task，默认 `true` |
| `showInRecents` | Android | 是否在最近任务中显示单独条目，要求 `createTask: true` |
| `useProxyActivity` | Android | 是否通过透明代理 Activity 启动，默认 `true` |
| `enableDefaultShareMenuItem` | Android | 是否显示默认分享菜单 |
| `showTitle` | Android | 是否在工具栏显示网页标题 |
| `enableBarCollapsing` | 通用声明 | 滚动时是否收起工具栏 |
| `windowFeatures` | Web | 传递给 `window.open()` 的窗口特性 |
| `windowName` | Web | 弹窗窗口名称 |

颜色字段支持 React Native 的颜色格式，例如：

```js
{
  toolbarColor: '#1a73e8'
}
```

### Android task 相关配置

Android 的 task 可以近似理解为系统最近任务视图中的一个应用活动栈，而不是 JavaScript 异步任务。

相关关系：

- `showInRecents` 只有在 `createTask: true` 时有效。
- `useProxyActivity` 只有在 `createTask: true` 时有效。
- `useProxyActivity: true` 时，`showInRecents` 总会按 `true` 处理。
- 代理 Activity 可以避免应用进入后台时浏览器被销毁。
- `useProxyActivity` 默认值为 `true`。
- 设置为 `false` 会恢复旧的直接启动行为。

## 认证专用选项

`AuthSessionOpenOptions` 继承 `WebBrowserOpenOptions`，并增加以下字段。

### `preferEphemeralSession`

仅支持 iOS，默认值为 `false`：

```js
{
  preferEphemeralSession: true
}
```

用于请求私密认证会话，尽量不在认证会话与用户日常浏览器之间共享 Cookie 或浏览数据。

这只是请求，最终是否遵守由用户的默认浏览器决定。因此不能把它当作绝对的隐私隔离保证。

### `preferUniversalLinks`

仅支持 iOS，默认值为 `false`：

```js
{
  preferUniversalLinks: true
}
```

设置为 `true` 时，会在以下前提下请求使用 HTTPS Universal Link 回调：

- 应用已经为回调域名配置 Associated Domains entitlement；
- 目标系统为 iOS 17.4 或更高版本。

默认的 `false` 使用旧的 `callbackURLScheme` 机制，不要求 Associated Domains 配置。

## iOS 浏览器展示样式

`WebBrowserPresentationStyle` 直接映射到 iOS 的 `UIModalPresentationStyle`。

| 枚举 | 含义 |
| --- | --- |
| `AUTOMATIC` | 由系统决定；旧版 iOS 回退到全屏 |
| `CURRENT_CONTEXT` | 在当前内容上下文上展示 |
| `FORM_SHEET` | 居中表单式窗口 |
| `FULL_SCREEN` | 覆盖整个屏幕 |
| `OVER_CURRENT_CONTEXT` | 覆盖当前内容上下文 |
| `OVER_FULL_SCREEN` | 覆盖全屏内容 |
| `PAGE_SHEET` | 以部分覆盖页面的 sheet 展示 |
| `POPOVER` | 以浮层形式展示 |

默认展示方式是：

```js
WebBrowser.WebBrowserPresentationStyle.OVER_FULL_SCREEN
```

这些样式由 iOS 系统控制，实际视觉表现可能受设备类型和系统版本影响。原文没有提供每种样式的设备适配建议。

## 结果类型

### `WebBrowserResultType`

| 值 | 主要平台 | 含义 |
| --- | --- | --- |
| `cancel` | iOS | 用户取消或关闭 |
| `dismiss` | iOS | 由 API 主动关闭 |
| `opened` | Android | 浏览器已打开 |
| `locked` | 文档未说明具体使用条件 | 锁定状态 |

文档列出了 `LOCKED`，但没有解释它会在哪个流程中返回。开发时不要根据本文自行推断其业务含义。

### Web 认证完成结果

`maybeCompleteAuthSession()` 返回：

```ts
{
  type: 'success' | 'failed';
  message: string;
}
```

它与 `openAuthSessionAsync()` 的异步认证结果不是同一种类型：

- 回调页使用 `maybeCompleteAuthSession()` 判断弹窗认证能否完成；
- 发起页等待 `openAuthSessionAsync()` 的最终结果。

## 错误码

### `ERR_WEB_BROWSER_REDIRECT`

仅限 Web。

父窗口在认证期间被刷新后，子窗口可能失去对父窗口的引用，因而无法完成重定向。此时需要手动关闭子窗口。

### `ERR_WEB_BROWSER_BLOCKED`

仅限 Web。

浏览器阻止了弹窗，常见原因是 `window.open()` 没有紧跟点击等用户输入执行。

异步事件函数本身没有问题，问题在于打开窗口之前不能存在耗时过长的操作。

### `ERR_WEB_BROWSER_CRYPTO`

仅限 Web。

当前环境不支持认证所需的加密能力。通常表示页面没有运行在 `localhost` 或 HTTPS 安全 Origin 下。

## React Web 开发者最容易误解的地方

### Promise 返回不代表业务成功

Android 的 `openBrowserAsync()` 返回 `opened`，只表示浏览器已经打开。认证流程则必须检查 `openAuthSessionAsync()` 返回的 `type` 和成功回调 URL。

### React Native 没有统一的浏览器行为

同一个 API 会调用不同平台的原生能力，参数支持情况和返回结果也不同。不能像使用普通 Web API 一样假设 Android、iOS 和 Web 行为完全一致。

### Web 回调不仅要求 URL 相似

Web 认证状态存储在特定 Origin 的 `localStorage` 中。`localhost` 和局域网 IP 即使指向同一台机器，也属于不同 Origin。

### iOS 普通浏览器不共享 Safari Cookie

`openBrowserAsync()` 使用的 `SFSafariViewController` 在 iOS 11 之后不再与 Safari 共享 Cookie。需要认证时应使用 `openAuthSessionAsync()`。

### 自定义 scheme 不是普通 HTTPS URL

`demo://auth/callback` 需要应用声明 `demo` scheme，并要求认证服务允许该回调地址。它不是可以直接在任意浏览器页面中使用的普通链接。

### 原生配置不能依靠热更新完成

scheme、Associated Domains 和其他构建期配置可能需要重新生成和构建应用。JavaScript 热更新无法改变已经编译进应用的原生配置。

## 实际开发建议

以下为**基于文档内容推导**的使用决策：

| 需求 | 推荐 API |
| --- | --- |
| 打开隐私政策、协议或帮助页 | `openBrowserAsync()` |
| OAuth 或第三方网页登录 | `openAuthSessionAsync()` |
| Web 认证回调页结束认证 | `maybeCompleteAuthSession()` |
| iOS 主动关闭普通浏览器 | `dismissBrowser()` |
| iOS / Web 主动关闭认证窗口 | `dismissAuthSession()` |
| Android 优化首次打开速度 | `warmUpAsync()`、`mayInitWithUrlAsync()` |
| Android 释放 Custom Tabs 服务绑定 | `coolDownAsync()` |

**基于经验建议：**

- 将普通浏览和认证浏览封装成两个独立函数，避免调用方误用。
- 对所有结果使用 `switch (result.type)` 显式处理，不要只写“不是 cancel 就算成功”。
- Web 开发环境固定使用同一个协议、主机名和端口，避免认证前后 Origin 改变。
- 在移动 Web 上，登录按钮触发时立即打开认证窗口，其他准备工作应提前完成。
- 对 `skipRedirectCheck`、自定义 scheme 和 Universal Link 配置进行独立的开发与生产环境验证。
- Android 使用预热 API 时，通过 `try/finally` 保证最终执行 `coolDownAsync()`。

## 文档未涉及的内容

当前文档未详细说明：

- OAuth 的授权码、PKCE、Token 交换等协议细节；
- 具体认证服务商的控制台配置方法；
- `expo-auth-session` 与 `expo-web-browser` 的职责区别；
- Associated Domains 的完整配置步骤；
- Android App Links 的配置流程；
- config plugin 支持的具体配置字段；
- `ServiceActionResult` 的完整字段结构；
- `WebBrowserResultType.LOCKED` 的具体触发条件；
- 自动化测试和异常监控方案。

这些内容不能仅依据本文确定，需要查阅对应 Expo、认证服务商以及 iOS / Android 平台文档。

## 总结

`expo-web-browser` 的关键不是“打开一个网页”，而是根据用途选择正确的系统浏览能力：

- 普通页面使用 `openBrowserAsync()`。
- 登录认证使用 `openAuthSessionAsync()`。
- Web 回调页面使用 `maybeCompleteAuthSession()`。
- Android 可以通过预热和 URL 初始化优化 Custom Tabs，并通过 `coolDownAsync()` 释放绑定。

实际开发中最重要的限制是平台差异：iOS 的 Cookie 与回调机制、Android 的 Custom Tabs 和 task 行为，以及 Web 对 HTTPS、同源和用户交互时机的要求都不同。业务代码必须检查具体结果类型，并在目标平台上分别验证完整的打开、取消、关闭和重定向流程。

---

## 文档导航

- **上一页**：[video thumbnails](./219__video-thumbnails.md)
- **下一页**：[widgets](./221__widgets.md)
