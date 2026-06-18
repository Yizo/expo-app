# 引导用户跳转到其他应用

> 原文地址：https://docs.expo.dev/linking/into-other-apps/

本文档详细介绍如何在 Expo/React Native 应用中，通过特定的 **URI（统一资源标识符）** 打开设备上的其他应用程序。例如：打开浏览器访问网页、打开邮件客户端发送邮件、打开拨号器拨打电话等。

---

## 前置概念

在开始之前，先了解几个关键术语：

- **URI（Uniform Resource Identifier，统一资源标识符）**：一个用于标识某个资源的字符串。常见的 URL（如 `https://expo.dev`）就是 URI 的一种。URI 还可以包含自定义协议（scheme），比如 `tel:123456` 表示拨打电话，`mailto:test@example.com` 表示发送邮件。
- **Deep Link（深度链接）**：通过特定的 URI 直接打开某个应用的某个具体页面，而不仅仅是打开应用首页。例如 `uber://?action=setPickup&...` 可以直接打开 Uber 应用并预设上车地点。
- **Scheme（协议/方案）**：URI 中冒号前面的部分，定义了如何处理这个链接。例如 `https` 表示网页链接、`mailto` 表示邮件链接、`tel` 表示电话链接。应用也可以注册自己的自定义 scheme。
- **expo-linking**：Expo 提供的链接模块，封装了跨平台的链接处理能力，可以在 iOS、Android 和 Web 上统一使用。
- **expo-router**：Expo 的文件系统路由库，提供类似 Web 开发中的 `<Link>` 组件来处理导航和链接。

---

## 核心方法一：使用 expo-linking 模块

`expo-linking` 是一个跨平台的链接模块，它封装了各操作系统原生的导航方法，使你能够用统一的 API 与外部软件交互。

下面的示例演示如何使用 `Linking.openURL` 方法打开设备的默认浏览器，访问指定网址：

```tsx
import { Button, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

export default function Home() {
  return (
    <View style={styles.container}>
      <Button title="Open a URL" onPress={() => Linking.openURL('https://expo.dev/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**代码说明：**

- `import * as Linking from 'expo-linking'`：导入 Expo 的链接模块。
- `Linking.openURL('https://expo.dev/')`：调用该方法会在系统默认浏览器中打开指定 URL。
- `onPress` 是按钮的点击事件回调函数。

---

## 核心方法二：使用 expo-router 的 Link 组件

如果你的项目使用了 Expo 的文件系统路由（expo-router），可以使用 `<Link>` 组件来打开外部链接。

`<Link>` 组件在不同平台上的表现不同：
- **移动端（iOS/Android）**：渲染为普通文本，点击后通过 `expo-linking` 模块打开链接
- **Web 端**：渲染为标准的 HTML `<a>` 锚点标签

```tsx
import { Button, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Link href="https://expo.dev">Open a URL</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**代码说明：**

- `import { Link } from 'expo-router'`：从 expo-router 中导入 Link 组件。
- `href` 属性指定要打开的目标 URL。
- Link 组件内部依然依赖 `expo-linking` 模块来处理链接打开操作。

---

## 系统内置协议（标准 URI Scheme）

操作系统原生支持以下几种基础协议，可以直接访问设备的核心功能：

| 协议 | 功能 | 效果 |
|------|------|------|
| `https` / `http` | 网页浏览 | 打开系统默认浏览器 |
| `mailto` | 电子邮件 | 打开邮件客户端 |
| `tel` | 电话拨号 | 启动拨号界面，发起通话 |
| `sms` | 短信 | 启动短信应用，开始对话 |

使用示例：
- `Linking.openURL('https://expo.dev')` — 打开浏览器
- `Linking.openURL('mailto:test@example.com')` — 打开邮件客户端
- `Linking.openURL('tel:1234567890')` — 打开拨号界面
- `Linking.openURL('sms:1234567890')` — 打开短信应用

---

## Android 端的特殊配置：queries 声明

### 为什么需要配置？

Android 11（API 级别 30）及以上版本引入了**包可见性（Package Visibility）**限制。这意味着你的应用默认无法"看到"设备上安装的其他应用，也无法直接与它们交互。要解决这个问题，必须在 `AndroidManifest.xml` 中显式声明你的应用需要查询（queries）哪些外部意图（Intent）。

> **术语解释：**
> - **AndroidManifest.xml**：Android 应用的核心配置文件，声明了应用的权限、组件和系统交互方式。
> - **Intent（意图）**：Android 中用于组件间通信的机制。例如 `ACTION_DIAL` 表示拨号意图，`ACTION_SENDTO` 表示发送意图。
> - **Config Plugin（配置插件）**：Expo 提供的一种机制，允许你通过 JavaScript/TypeScript 代码来修改原生项目配置（如 AndroidManifest.xml、Info.plist），而无需直接编辑原生文件。

### 创建自定义 Config Plugin

以下代码创建一个自定义配置插件，自动向 `AndroidManifest.xml` 中添加所需的 `<queries>` 声明：

```ts
import { withAndroidManifest, ConfigPlugin } from 'expo/config-plugins';

const withAndroidQueries: ConfigPlugin = config => {
  return withAndroidManifest(config, config => {
    config.modResults.manifest.queries = [
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.SENDTO' } }],
            data: [{ $: { 'android:scheme': 'mailto' } }],
          },
          {
            action: [{ $: { 'android:name': 'android.intent.action.DIAL' } }],
          },
        ],
      },
    ];

    return config;
  });
};

module.exports = withAndroidQueries;
```

**代码说明：**

- `withAndroidManifest`：Expo 提供的辅助函数，用于安全地修改 AndroidManifest.xml。
- `android.intent.action.SENDTO`：用于发送邮件等操作的意图。配合 `android:scheme: mailto` 使用，表示查询支持 mailto 协议的应用。
- `android.intent.action.DIAL`：用于拨号的意图，表示查询支持拨号的应用。

### 在 app.json 中注册插件

编写好插件后，需要在主配置文件的 `plugins` 数组中注册它：

```json
{
  "expo": {
    "plugins": [
      "./my-plugin.ts"
    ]
  }
}
```

> **提示：** 如果需要在 Android 上打开特定的系统设置页面，可以查阅 `expo-intent-launcher` 模块的文档，它提供了更多可用的系统意图选项。

---

## 自定义协议（第三方应用的 Deep Link）

当你已知目标应用的自定义 URI scheme 时，可以使用前面介绍的任意一种方法（`Linking.openURL` 或 `<Link>` 组件）来启动它。

许多第三方服务会在其文档中公开深度链接的参数格式。例如，Uber 应用支持通过复杂的 URI 参数来预设上车地点和目的地：

```shell
uber://?client_id=<CLIENT_ID>&action=setPickup&pickup[latitude]=37.775818&pickup[longitude]=-122.418028&pickup[nickname]=UberHQ&pickup[formatted_address]=1455%20Market%20St%2C%20San%20Francisco%2C%20CA%2094103&dropoff[latitude]=37.802374&dropoff[longitude]=-122.405818&dropoff[nickname]=Coit%20Tower&dropoff[formatted_address]=1%20Telegraph%20Hill%20Blvd%2C%20San%20Francisco%2C%20CA%2094133&product_id=a1111c8c-c720-46c3-8534-2fcdd730040d&link_text=View%20team%20roster&partner_deeplink=partner%3A%2F%2Fteam%2F9383
```

**这个 URI 的结构解析：**

- `uber://` — Uber 应用的自定义协议
- `client_id` — 你的 API 客户端标识
- `action=setPickup` — 设置上车地点
- `pickup[latitude]` / `pickup[longitude]` — 上车地点的经纬度
- `dropoff[latitude]` / `dropoff[longitude]` — 目的地的经纬度
- 其他参数用于设置昵称、格式化地址等

### 目标应用未安装时的处理

如果用户的设备上未安装目标应用，直接调用 `openURL` 会失败。你应该引导用户前往相应的应用商店进行安装。

社区库 `react-native-app-link` 专门用于处理这种回退场景——它会先检查应用是否已安装，如果未安装则自动跳转到应用商店。

---

## iOS 端的特殊配置：LSApplicationQueriesSchemes

### 为什么需要配置？

在 iOS 上，如果你想检查某个外部应用是否已安装（使用 `Linking.canOpenURL()` 方法），必须在 `Info.plist` 中声明你要查询的协议 scheme。

> **术语解释：**
> - **Info.plist**：iOS 应用的核心配置文件，存储应用的元数据和系统交互设置。
> - **LSApplicationQueriesSchemes**：iOS 的安全机制，要求应用在 Info.plist 中预先声明想要查询的外部应用协议。如果未声明，即使目标应用已安装，`canOpenURL()` 也会返回 `false`。

### 在 app.json 中配置

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["uber"]
      }
    }
  }
}
```

以上配置声明了你的应用需要查询 `uber://` 协议。如果你还需要查询其他应用，将对应的 scheme 添加到数组中即可，例如 `["uber", "twitter", "instagram"]`。

> **重要提示：** 验证此 iOS 配置需要使用**自定义开发构建（custom development build）**，因为标准的 Expo Go 客户端不支持此测试场景。Expo Go 有自己预定义的 `LSApplicationQueriesSchemes` 列表，无法动态添加。

---

## 构建回流地址（createURL）

`Linking.createURL()` 方法可以动态生成一个将用户重定向回你自己应用的地址。这比手动硬编码 URL 更加灵活，它能根据当前运行环境自动适配：

- **生产环境**：生成使用自定义协议（custom scheme）的 URL
- **开发环境（Expo Go）**：生成本地网络 IP 地址配合特殊路由语法的 URL

```tsx
const redirectUrl = Linking.createURL('path/into/app', {
  queryParams: { hello: 'world' },
});
```

**参数说明：**

- 第一个参数 `'path/into/app'`：应用内的路径，表示用户回流后应到达的页面。
- `queryParams`：查询参数对象，会自动拼接到 URL 后面。例如上面的代码会生成类似 `yourapp://path/into/app?hello=world` 的 URL。

> **测试建议：** 如果你的应用需要一致的回流地址（例如处理第三方 OAuth 认证回调），建议使用**自定义开发构建（custom development build）** 而不是 Expo Go。因为 Expo Go 的回流地址指向 Expo Go 本身，而非你的应用，每次重新构建时可能发生变化。

---

## 在应用内展示网页内容（内嵌浏览器）

`expo-linking` 的 `openURL` 方法会启动系统默认浏览器（即完全离开你的应用）。如果你希望在应用内部以模态弹窗的形式展示网页内容（用户关闭弹窗后回到你的应用），可以使用 `expo-web-browser` 模块。

> **术语解释：**
> - **内嵌浏览器（In-app Browser）**：在你的应用内部打开的一个浏览器视图，用户无需离开应用即可浏览网页。在 iOS 上通常是 SFSafariViewController，在 Android 上通常是 Chrome Custom Tabs。
> - **模态（Modal）**：一种覆盖在当前界面之上的弹出层，用户必须关闭它才能回到原来的界面。

这种方式特别推荐用于**安全认证流程（OAuth）**，因为内嵌浏览器可以共享系统浏览器的 Cookie 和登录状态，同时用户不会离开你的应用。

```tsx
import { Button, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export default function Home() {
  return (
    <View style={styles.container}>
      <Button
        title="Open URL with the system browser"
        onPress={() => Linking.openURL('https://expo.dev')}
        style={styles.button}
      />
      <Button
        title="Open URL with an in-app browser"
        onPress={() => WebBrowser.openBrowserAsync('https://expo.dev')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
  },
});
```

**两种方式的对比：**

| 方式 | API | 效果 |
|------|-----|------|
| 系统浏览器 | `Linking.openURL()` | 完全跳转到系统浏览器，离开当前应用 |
| 内嵌浏览器 | `WebBrowser.openBrowserAsync()` | 在应用内弹出浏览器模态窗口，关闭后回到应用 |

---

## 高级浏览器功能

如果你需要启用原生浏览器的高级功能，例如**长按上下文菜单**（context menus）或**链接预览**（hover previews），可以使用以下两种方式：

### 方式一：使用 expo-router 的 Link 组件

```tsx
import { Link } from 'expo-router';

export default function Home() {
  return <Link href="https://expo.dev">Go to Expo</Link>;
}
```

### 方式二：使用 @expo/html-elements 的 A 组件

`@expo/html-elements` 是一个通用 HTML 组件包，其中的 `<A>` 组件在 Web 端渲染为标准 `<a>` 标签，在移动端保持原生链接能力：

```tsx
import { A } from '@expo/html-elements';

export default function Home() {
  return <A href="https://expo.dev">Go to Expo</A>;
}
```

> **基于文档内容推导：** `<Link>` 和 `<A>` 组件在 Web 端会渲染为真正的 `<a>` 标签，因此浏览器可以识别并提供原生交互功能（如右键菜单、链接预览）。而 `Linking.openURL()` 是程序式调用，浏览器无法提供这些增强功能。

---

## 要点总结

| 场景 | 推荐方案 |
|------|----------|
| 简单打开外部链接 | `Linking.openURL()` |
| 使用文件系统路由时 | `<Link>` 组件（expo-router） |
| 在应用内展示网页 | `WebBrowser.openBrowserAsync()` |
| 需要浏览器原生交互 | `<Link>` 或 `<A>` 组件 |
| 生成回流到自己应用的 URL | `Linking.createURL()` |
| 处理应用未安装的回退 | `react-native-app-link`（社区库） |

| 平台配置 | 配置文件 | 关键设置 |
|----------|----------|----------|
| Android 11+ | `AndroidManifest.xml`（通过 Config Plugin） | `<queries>` 声明 |
| iOS | `Info.plist`（通过 app.json） | `LSApplicationQueriesSchemes` |

---

## 文档导航

- **上一页**：[overview](./9__overview.md)
- **下一页**：[into your app](./11__into-your-app.md)
