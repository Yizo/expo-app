# 213｜Expo SDK WebBrowser 系统浏览器

**翻页：**[上一页：Expo SDK VideoThumbnails 视频缩略图](./212-Expo-SDK-VideoThumbnails.md) · [目录](./README.md) · [下一页：Expo SDK Widgets 小组件](./214-Expo-SDK-Widgets.md)

**官方页面：**[WebBrowser · Latest](https://docs.expo.dev/versions/latest/sdk/webbrowser/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/webbrowser/)

**版本与平台：**Latest 推荐 `expo-web-browser ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。库支持 Android、iOS、Web，并包含在 Expo Go 中。Android 使用 Chrome Custom Tabs；iOS 根据 API 使用 `SFSafariViewController` 或 `ASWebAuthenticationSession`。

## 打开普通网页还是登录页面

- 展示隐私政策、帮助页面等普通网页：使用 `openBrowserAsync()`。
- 需要网页登录后回到应用：使用 `openAuthSessionAsync()`，并传入匹配的 deep link 回调地址。

iOS 11 起，`SFSafariViewController` 不再与系统 Safari 共用 Cookie。因此认证应使用 `openAuthSessionAsync()`；普通浏览页面使用 `openBrowserAsync()`。

安装：

```sh
npx expo install expo-web-browser
yarn expo install expo-web-browser
pnpm expo install expo-web-browser
bun expo install expo-web-browser
```

已有的纯 React Native 工程还需要先安装 `expo`。本页没有额外 config plugin 属性需要设置；如果自行维护原生工程，仍应按 Expo 安装说明配置原生模块。

## 打开普通网页

```tsx
import { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

export default function App() {
  const [result, setResult] = useState(null);

  const handlePressButtonAsync = async () => {
    const browserResult = await WebBrowser.openBrowserAsync('https://expo.dev');
    setResult(browserResult);
  };

  return (
    <View style={styles.container}>
      <Button title="Open WebBrowser" onPress={handlePressButtonAsync} />
      <Text>{result && JSON.stringify(result)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
```

## 从浏览器返回应用

Expo Router 会自动处理 deep link。未使用 Expo Router 时，如果想从登录网页把信息带回应用，应在打开浏览器前监听 `Linking` 的 `url` 事件，并在接收到应用 deep link 后调用 `WebBrowser.dismissBrowser()` 关闭浏览器窗口。其它 redirect 行为和普通 deep link 相同。

### `openAuthSessionAsync()` 的平台行为

- **Android：**使用 Chrome Custom Tabs、React Native AppState 和 Linking 处理会话及回调。
- **iOS：**使用 Safari `ASWebAuthenticationSession` 模态页。服务器 redirect URI 的 scheme 必须与 `app.json` 中的 `expo.scheme` 相同，例如使用 `demo://`，不要误用普通的 `https://` 回调。系统负责回跳，所以不必再注册 `Linking.addEventListener`，额外监听反而可能造成副作用。
- **Web：**必须运行在 HTTPS 或 localhost 的安全源；开发时可用 `npx expo start --https`。打开和完成授权必须来自相同网页 origin。移动浏览器的 `window.open()` 必须紧接在用户交互后调用；若长时间等待后才打开，弹窗可能被浏览器拦截。桌面 Web 创建弹窗，移动 Web 打开新标签页。

该方法完成后可能返回 `{ type: 'cancel' }`、`{ type: 'dismiss' }` 或成功的 redirect result；用户取消登录、关闭浏览器与主动关闭会话的结果有区别。

## API

```ts
import * as WebBrowser from 'expo-web-browser';
```

### 方法

| 方法 | 平台 | 返回 / 作用 |
| --- | --- | --- |
| `coolDownAsync(browserPackage?)` | Android | 解除 `warmUpAsync()` / `mayInitWithUrlAsync()` 建立的 Custom Tabs 连接。完成预热后调用可释放绑定。 |
| `dismissAuthSession()` | iOS、Web | 关闭当前认证会话；Web 会关闭关联的弹窗。 |
| `dismissBrowser()` | iOS | 关闭当前展示的 Safari 浏览器页；成功时解析 `{ type: 'dismiss' }`。 |
| `getCustomTabsSupportingBrowsersAsync()` | Android | 查询支持 Custom Tabs 的浏览器包、服务和系统偏好。受 Android `PackageManager` 限制，结果可能不完全可靠。 |
| `maybeCompleteAuthSession(options?)` | Web | 在 redirect 返回页完成网页弹窗授权会话；通常调用于登录回调页面。 |
| `mayInitWithUrlAsync(url, browserPackage?)` | Android | 预建 Custom Tabs session，并提示浏览器即将访问的 URL，以便提前加载。 |
| `openAuthSessionAsync(url, redirectUrl?, options?)` | Android、iOS、Web | 打开登录页面并在 deep link / 回调完成后返回结果。登录优先用它。 |
| `openBrowserAsync(url, options?)` | Android、iOS、Web | 打开普通网页；iOS Safari 模态页不共享 Safari Cookie。 |
| `warmUpAsync(browserPackage?)` | Android | 预热默认或指定 Chrome Custom Tabs 浏览器，缩短后续打开延迟。 |

`maybeCompleteAuthSession()` 在 Web 返回 `{ type: 'success' | 'failed', message }`。成功后父窗口会尝试关闭子窗口；若错误为 `ERR_WEB_BROWSER_REDIRECT`，可能需要用户手动关闭遗留弹窗。

`openBrowserAsync()` 的返回类型是 `WebBrowserResult`：Android 成功打开时为 `{ type: 'opened' }`；iOS 用户关闭页面为 `{ type: 'cancel' }`，通过 `dismissBrowser()` 关闭则为 `{ type: 'dismiss' }`。

## 选项与结果类型

### `WebBrowserOpenOptions`

| 属性 | 平台 / 默认值 | 说明 |
| --- | --- | --- |
| `browserPackage` | Android | 指定用于 Custom Tabs 的浏览器包名。 |
| `controlsColor` | iOS | Safari 控件颜色。 |
| `createTask` | Android；默认 `true` | 是否在新的 Android task 中打开浏览器。 |
| `dismissButtonStyle` | iOS | 关闭按钮外观：`'done'`、`'close'`、`'cancel'`。 |
| `enableBarCollapsing` | 通用 | 页面滚动时是否收起浏览器工具栏。 |
| `enableDefaultShareMenuItem` | Android | 是否显示默认分享菜单项。 |
| `presentationStyle` | iOS；默认 `overFullScreen` | Safari 模态窗口呈现样式，见下表。 |
| `readerMode` | iOS | 如果可用，Safari 是否进入阅读器模式。 |
| `secondaryToolbarColor` | Android | 次级工具栏颜色。 |
| `showInRecents` | Android；默认 `false` | 是否将浏览网页作为单独任务显示在系统最近任务列表中；需要 `createTask: true`。 |
| `showTitle` | Android | 是否在工具栏显示网页标题。 |
| `toolbarColor` | Android / iOS | 工具栏颜色。 |
| `useProxyActivity` | Android；默认 `true` | 是否经透明代理 Activity 打开浏览器；仅 `createTask: true` 有效。启用时浏览器不会因 App 进入后台而被销毁，`showInRecents` 也会视为 `true`。 |
| `windowFeatures` | Web | 传给 `window.open()` 的窗口特征。 |
| `windowName` | Web | 弹出窗口名称。 |

### `AuthSessionOpenOptions`

它扩展 `WebBrowserOpenOptions`，另有以下 iOS 选项：

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `preferEphemeralSession` | `false` | 请求浏览器使用私密认证会话，不与用户常规浏览会话共享 Cookie / 浏览数据；是否接受取决于用户默认浏览器。 |
| `preferUniversalLinks` | `false` | iOS 17.4+ 时优先使用 HTTPS Universal Link 回调；需要为回调 host 配好 Associated Domains entitlement。 |

### 结果和其它类型

| 类型 | 字段 / 取值 |
| --- | --- |
| `WebBrowserAuthSessionResult` | `WebBrowserRedirectResult \| WebBrowserResult`。 |
| `WebBrowserRedirectResult` | `{ type: 'success'; url: string }`。 |
| `WebBrowserResult` | `{ type: WebBrowserResultType }`。 |
| `WebBrowserResultType` | `'cancel'`（iOS）、`'dismiss'`（iOS）、`'locked'`、`'opened'`（Android）。 |
| `WebBrowserCompleteAuthSessionOptions` | `skipRedirectCheck?: boolean`，跳过回调 URL 与已缓存回调 URL 的匹配验证。 |
| `WebBrowserCompleteAuthSessionResult` | `message: string`、`type: 'success' \| 'failed'`。 |
| `WebBrowserCustomTabsResults` | `browserPackages`、`servicePackages`，可选 `defaultBrowserPackage`、`preferredBrowserPackage`。 |
| `WebBrowserCoolDownResult` / `WebBrowserMayInitWithUrlResult` / `WebBrowserWarmUpResult` | `ServiceActionResult`。 |
| `WebBrowserWindowFeatures` | `Record<string, number \| boolean \| string>`。 |

### iOS `WebBrowserPresentationStyle`

| 值 | 呈现方式 |
| --- | --- |
| `automatic` | 系统决定；旧 iOS 版本回退为 `fullScreen`。 |
| `currentContext` / `overCurrentContext` | 在当前 App 内容上方展示。 |
| `formSheet` | 屏幕中央表单页。 |
| `fullScreen` / `overFullScreen` | 覆盖整个屏幕。 |
| `pageSheet` | 部分遮盖底层内容的页面。 |
| `popover` | 弹出浮层。 |

## 常见 Web 错误

| 错误码 | 原因与处理 |
| --- | --- |
| `ERR_WEB_BROWSER_REDIRECT` | 发起弹窗的父窗口已重载或丢失引用，回调无法完成；需要关闭遗留子窗口并检查回调流程。 |
| `ERR_WEB_BROWSER_BLOCKED` | 浏览器拦截了弹窗；移动 Web 尤其要求在用户点击等交互后立即调用 `openAuthSessionAsync()`。 |
| `ERR_WEB_BROWSER_CRYPTO` | 当前源不支持 Web Crypto；使用 HTTPS 或 localhost，例如通过 `npx expo start --https` 启动。 |

## 新手名词解释

- **Chrome Custom Tabs：**Android 在应用内打开网页的 Chrome 浏览器界面；页面在浏览器上下文运行，但显示成定制工具栏的标签页。
- **`SFSafariViewController`：**iOS 在应用内呈现普通网页的 Safari 控制器。它与 Safari 主应用不共享 Cookie。
- **`ASWebAuthenticationSession`：**iOS 为 OAuth 等网页登录设计的认证会话，可安全地处理系统浏览器回调。
- **Deep link（深层链接）：**带有 App URL scheme 或 Universal Link 的 URL；系统可据此把网页认证结果送回应用。
- **Custom Tabs 预热：**`warmUpAsync()` / `mayInitWithUrlAsync()` 让 Android 浏览器提前准备连接或 URL，缩短后续打开时间；用完可 `coolDownAsync()` 释放。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- Usage：覆盖普通网页完整 React Native App 示例；记录 deep link 与 Expo Router / 非 Router 的区别。
- API / Methods：列出冷却、预热、预加载 URL、打开普通网页 / 认证会话、关闭窗口、Web 回调完成和 Custom Tabs 查询。
- Types / Enums：覆盖打开选项、认证专属选项、所有结果对象、浏览器选项以及 iOS 呈现类型全部值。
- Errors：覆盖 `ERR_WEB_BROWSER_REDIRECT`、`ERR_WEB_BROWSER_BLOCKED`、`ERR_WEB_BROWSER_CRYPTO`。
- Latest 与 SDK v56 的平台行为和 API 主题一致；包版本分别为 `~57.0.3` / `~56.0.6`。

**翻页：**[上一页：Expo SDK VideoThumbnails 视频缩略图](./212-Expo-SDK-VideoThumbnails.md) · [目录](./README.md) · [下一页：Expo SDK Widgets 小组件](./214-Expo-SDK-Widgets.md)
