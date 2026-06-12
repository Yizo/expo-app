# Expo Linking 学习笔记

`expo-linking` 是 Expo 提供的深度链接 API，用于：

- 让应用打开网页、电话链接或其他已安装应用。
- 构造指向当前应用内部页面的深度链接。
- 解析启动应用的链接及其参数。
- 监听应用运行期间收到的新链接。

它扩展了 React Native 自带的 `Linking` API，同时处理 Expo、Expo Go、原生构建和 Web 环境之间的 URL 差异。

> 本页是下一个 Expo SDK 版本的未发布文档。文档明确指出，当前最新稳定版本是 SDK 56。生产项目应优先查阅与项目 SDK 版本对应的文档。

## 深度链接是什么

在 React Web 中，用户可能通过下面的 URL 进入特定页面：

```text
https://example.com/products/42?ref=email
```

移动应用也需要类似能力。例如：

```text
myapp://products/42?ref=email
```

操作系统看到 `myapp://` 后，会尝试找到注册了 `myapp` scheme 的应用，并把 URL 交给它处理。

其中：

- `myapp` 是 scheme，可类比 Web URL 中的 `https`。
- `products/42` 是应用内部路径。
- `ref=email` 是查询参数。
- “打开哪个应用”通常先由操作系统决定。
- “进入应用中的哪个界面”需要应用代码或导航系统继续处理。

`expo-linking` 负责链接的创建、解析、接收和打开，但当前文档没有介绍如何把解析后的路径映射到 React Navigation 或 Expo Router 页面。

## 适用场景

这套 API 适合以下场景：

- 从邮件、短信或网页打开应用中的指定内容。
- 处理 OAuth、登录或支付完成后的回调链接。
- 从当前应用打开电话、浏览器或另一个应用。
- 获取导致应用启动的 URL。
- 在应用运行期间监听后续收到的 URL。
- 在 Android、iOS、tvOS 和 Web 之间统一部分链接处理代码。

需要特别注意：OAuth 等场景通常要求稳定且可预期的回调地址。文档明确说明，不能依赖 Expo Go 中已发布更新所生成的 URL 来完成这种需求。

## 安装与导入

根据项目所使用的包管理器执行：

```sh
# npm
npx expo install expo-linking

# yarn
yarn expo install expo-linking

# pnpm
pnpm expo install expo-linking

# bun
bun expo install expo-linking
```

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本，这与直接运行普通的 `npm install` 不完全相同。

如果是在已有的裸 React Native 工程中安装，还必须先为工程安装并配置 Expo Modules，也就是文档所说的安装 `expo`。普通 Expo 项目通常已经具备这部分基础设施。

导入方式：

```js
import * as Linking from 'expo-linking';
```

之后可通过 `Linking.createURL()`、`Linking.openURL()` 等方法调用 API。

## 配置应用的 Scheme

使用自定义深度链接前，必须在 Expo 应用配置中定义 scheme：

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

也可以分别配置平台 scheme：

```json
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "scheme": "myapp-android"
    },
    "ios": {
      "scheme": "myapp-ios"
    }
  }
}
```

优先级是：

1. `expo.android.scheme` 或 `expo.ios.scheme`
2. 通用的 `expo.scheme`

这里的配置最终需要进入原生应用。它不像 React Web 的运行时路由配置，可以修改 JavaScript 后立即对所有已安装应用生效。

**基于文档内容推导：** 如果修改了原生应用的 scheme，应重新生成并安装相应构建，已有安装包不会因为 JavaScript 更新而自动获得新的原生 URL 注册信息。

## 创建指向当前应用的链接

### `Linking.createURL(path, options?)`

该方法根据当前运行环境创建深度链接：

```js
const url = Linking.createURL('products/42', {
  queryParams: {
    ref: 'email',
  },
});
```

返回结果取决于环境：

| 环境 | 示例 |
| --- | --- |
| 开发构建或生产构建 | `<scheme>://products/42` |
| Web 开发环境 | `https://localhost:19006/products/42` |
| Web 生产环境 | `https://myapp.com/products/42` |
| Expo Go 开发环境 | `exp://128.0.0.1:8081/--/products/42` |

Expo Go URL 中的 `/--/` 用于分隔 Expo 开发服务器地址和应用内部路径。

### `CreateURLOptions`

| 配置项 | 类型 | 作用 |
| --- | --- | --- |
| `scheme` | `string` | 指定要使用的 URI scheme；该 scheme 必须已经构建进原生应用 |
| `queryParams` | `Record<string, undefined \| string \| string[]>` | 将对象转换为 URL 查询字符串 |
| `isTripleSlashed` | `boolean` | 控制生成 `scheme:///path` 还是默认的 `scheme://path` |

例如：

```js
const url = Linking.createURL('callback', {
  scheme: 'myapp',
  isTripleSlashed: false,
  queryParams: {
    result: 'success',
    tag: ['mobile', 'expo'],
  },
});
```

`createURL()` 默认创建双斜杠形式的 URI。

### Expo Go 的重要限制

文档明确说明：Expo Go 对“已发布更新”生成的 URL 行为没有定义。在应用生命周期内，这些 URL 可能既不稳定，也不可预测。

因此，需要稳定 URL 的场景应当：

- 使用正式构建或 development build。
- 在应用配置中提供明确的 scheme。
- 不把 Expo Go 生成的临时地址作为正式回调地址。

这尤其影响 OAuth 授权回调等需要提前向第三方平台注册 URL 的功能。

## 打开外部链接

### `Linking.openURL(url)`

让操作系统尝试使用已安装的应用打开 URL：

```js
await Linking.openURL('https://expo.dev');
await Linking.openURL('tel:5555555');
```

参数可以是普通网页 URL，也可以是操作系统或其他应用支持的 scheme。

返回值是 `Promise<true>`：

- 操作系统成功打开链接时 resolve。
- 用户在系统提示中确认打开时 resolve。
- 没有应用可以处理该 URL 时 reject。
- 用户取消系统对话框时 reject。

因此应处理失败情况：

```js
try {
  await Linking.openURL(url);
} catch (error) {
  // 展示无法打开链接的用户提示
}
```

### `Linking.canOpenURL(url)`

检查是否存在能够处理指定 URL 的应用：

```js
const supported = await Linking.canOpenURL('my-other-app://profile');

if (supported) {
  await Linking.openURL('my-other-app://profile');
}
```

返回 `Promise<boolean>`，但各平台行为不同：

- Android：无法完成检查时，Promise 可能 reject。
- iOS：如果没有在 `Info.plist` 的 `LSApplicationQueriesSchemes` 中声明要查询的 scheme，Promise 可能 reject。
- Web：始终返回 `true`，因为浏览器没有 API 可以可靠判断某个 URL 是否能够打开。

因此，Web 上的 `true` 不能证明设备确实安装了目标应用。

**基于经验建议：** 即使 `canOpenURL()` 返回 `true`，调用 `openURL()` 时仍应捕获异常，因为两个操作之间的环境状态可能变化，用户也可能取消打开。

### `Linking.openSettings()`

打开操作系统的设置应用，并尽可能显示当前应用的自定义设置页面：

```js
await Linking.openSettings();
```

它适合引导用户手动修改权限或应用设置。当前文档没有说明各平台具体会展示哪些设置项。

## 接收启动应用的链接

移动应用接收链接时需要区分两种情况：

1. 应用原本未运行，链接导致应用启动。
2. 应用已经运行，之后又收到新的链接。

这类似于 Web 首次读取 `window.location`，以及之后监听地址变化，但移动端 URL 由操作系统传递给应用。

### `Linking.getInitialURL()`

异步获取导致应用启动的 URL：

```js
const initialURL = await Linking.getInitialURL();
```

如果应用不是通过链接启动，则返回 `null`。文档的签名写作 `Promise<string>`，但返回值说明明确包含 `null`，实际使用时应处理空值。

### `Linking.getLinkingURL()`

同步读取缓存的启动 URL：

```js
const initialURL = Linking.getLinkingURL();
```

返回：

```ts
string | null
```

### `Linking.clearInitialURL()`

清除缓存的启动 URL：

```js
Linking.clearInitialURL();
```

清除后，`getLinkingURL()` 会持续返回 `null`，直到应用收到新的深度链接。

平台行为：

- Android、iOS：清除缓存值。
- Web：不执行任何操作。

该方法返回 `void`。

## 使用 Hook 跟踪 URL

### `useLinkingURL()`

返回初始 URL，并在后续 URL 变化时更新：

```jsx
import * as Linking from 'expo-linking';

export function DeepLinkStatus() {
  const url = Linking.useLinkingURL();

  if (!url) {
    return null;
  }

  return <Text>{url}</Text>;
}
```

返回类型：

```ts
string | null
```

文档强调，它在重新加载时会立即返回初始 URL。

这可以类比 React Web 中把当前地址订阅为组件状态：链接变化后组件重新渲染，不需要手动注册和清理事件监听器。

### `useURL()`

同样返回初始 URL，并跟踪后续变化：

```js
const url = Linking.useURL();
```

当前页面同时列出了 `useLinkingURL()` 和 `useURL()`。页面还出现了“Deprecated: Use `useLinkingURL` hook instead”的提示，但该提示位于 `useLinkingURL()` 段落下，与文字本身存在矛盾。

因此只能确认文档推荐使用 `useLinkingURL()`；当前页面无法可靠说明究竟是哪一个 Hook 被弃用。实际开发时应核对项目 SDK 对应版本的类型提示和稳定版文档。

## 手动监听 URL 事件

### `Linking.addEventListener(type, handler)`

监听应用运行期间收到的链接：

```js
const subscription = Linking.addEventListener('url', event => {
  console.log(event.url);
});

subscription.remove();
```

唯一有效的事件类型是：

```text
url
```

处理函数接收的事件包含：

```ts
{
  url: string;
  nativeEvent?: MessageEvent;
}
```

返回的订阅对象提供 `remove()` 方法。组件卸载时应移除监听：

```jsx
useEffect(() => {
  const subscription = Linking.addEventListener('url', event => {
    handleURL(event.url);
  });

  return () => subscription.remove();
}, []);
```

文档推荐优先使用 `useLinkingURL()`。手动事件监听更适合不依赖组件渲染，或需要集中处理副作用的场景。

## 解析深度链接

### `Linking.parse(url)`

将 URL 解析为结构化数据：

```js
const parsed = Linking.parse(
  'myapp://products/42?ref=email&tag=mobile&tag=expo'
);
```

返回 `ParsedURL`：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `scheme` | `string \| null` | URL scheme，例如 `myapp` |
| `hostname` | `string \| null` | URL 主机名 |
| `path` | `string \| null` | 应用内部路径 |
| `queryParams` | `QueryParams \| null` | 查询参数 |

`QueryParams` 的类型是：

```ts
Record<string, undefined | string | string[]>
```

同名查询参数可能形成字符串数组，因此不要假设每个参数都一定是单个字符串。

### `Linking.parseInitialURLAsync()`

读取导致应用首次打开的 URL，并直接解析：

```js
const parsed = await Linking.parseInitialURLAsync();
```

它相当于组合执行：

1. React Native 的 `Linking.getInitialURL()`。
2. Expo 的 `Linking.parse()`。

如果应用不是由链接打开，返回对象中的所有字段都会是 `null`。

Web 环境下，它解析当前窗口的 URL。

适合需要直接根据启动参数初始化应用状态的场景：

```js
const parsed = await Linking.parseInitialURLAsync();

if (parsed.path === 'products/42') {
  // 继续交给应用路由或业务逻辑处理
}
```

## Scheme 相关辅助方法

### `Linking.collectManifestSchemes()`

收集应用清单中的平台 scheme，返回 `string[]`。

查找顺序如下：

Android：

```text
scheme → android.scheme → android.package
```

iOS：

```text
scheme → ios.scheme → ios.bundleIdentifier
```

该方法基于 `@expo/config-plugins` 中的 Scheme 模块。Expo 在预构建原生应用前也使用这些模块收集 scheme。

### `Linking.resolveScheme(options)`

根据选项解析 scheme：

```ts
Linking.resolveScheme({
  scheme: string,
  isSilent: boolean,
});
```

返回一个字符串。当前文档没有进一步解释 `isSilent` 的具体行为及错误处理方式。

### `Linking.hasCustomScheme()`

检查当前应用是否具有自定义 scheme：

```js
const hasScheme = Linking.hasCustomScheme();
```

返回 `boolean`。当前文档未说明具体检查范围和判定规则。

### `Linking.hasConstantsManifest()`

检查裸工作流中是否已经链接 Expo Constants manifest：

```js
const available = Linking.hasConstantsManifest();
```

返回 `boolean`。

这是面向已有原生 React Native 工程的兼容性检查。普通 React Web 开发者首次接触 Expo 时，一般不需要直接调用它。

## Android Intent

### `Linking.sendIntent(action, extras?)`

仅 Android 支持，用于启动 Android Intent：

```js
await Linking.sendIntent(action, extras);
```

`extras` 是数组，每项结构为：

```ts
{
  key: string;
  value: string | number | boolean;
}
```

Intent 是 Android 的系统消息和操作描述机制，可以请求打开系统页面或调用其他组件。它比 Web URL 导航更接近“向操作系统发出一个带参数的动作请求”。

文档明确建议改用 `expo-intent-launcher`。`sendIntent()` 保留在 `expo-linking` 中只是为了兼容 React Native Linking API，新代码不应优先选择它。

## API 选择指南

| 需求 | 建议 API |
| --- | --- |
| 创建指向当前应用的链接 | `createURL()` |
| 打开网页、电话或其他应用 | `openURL()` |
| 预先检查链接能否打开 | `canOpenURL()` |
| 获取导致应用启动的原始 URL | `getInitialURL()` |
| 同步读取缓存的启动 URL | `getLinkingURL()` |
| 获取并解析启动 URL | `parseInitialURLAsync()` |
| 解析任意应用深度链接 | `parse()` |
| 在 React 组件中跟踪 URL | `useLinkingURL()` |
| 手动监听 URL 事件 | `addEventListener()` |
| 打开当前应用的系统设置 | `openSettings()` |
| 执行 Android Intent | 优先使用 `expo-intent-launcher` |

## React Web 开发者容易误解的地方

### URL 不完全由前端代码控制

Web 应用通常只要服务器和前端路由支持某个路径，就可以处理相应 URL。移动端自定义 scheme 还必须注册到原生应用，由操作系统识别。

仅在 JavaScript 中写：

```js
Linking.createURL('profile', { scheme: 'myapp' });
```

并不能让未注册 `myapp` 的安装包自动支持该 scheme。

### `createURL()` 的结果会随环境变化

它不是简单的字符串拼接函数。Expo Go、开发构建、生产构建和 Web 会生成不同格式的 URL。

因此，不应在测试中无条件把结果写死为某一种形式，也不应把 Expo Go 中观察到的地址直接当作生产回调地址。

### 打开链接不等于应用内路由已经完成

`expo-linking` 可以接收并解析：

```text
myapp://products/42
```

但“把用户导航到商品详情页”仍需要应用的导航方案处理。当前文档没有介绍 React Navigation 或 Expo Router 的映射配置。

### 冷启动和运行中接收链接是两条路径

- 冷启动链接通过 `getInitialURL()`、`getLinkingURL()` 或 `parseInitialURLAsync()` 获取。
- 应用运行期间的新链接通过 Hook 或 URL 事件获取。

只处理其中一种，可能导致某些打开方式失效。

### Web 的 `canOpenURL()` 不具备真实检测能力

Web 平台始终返回 `true`。这只是平台 API 缺失导致的兼容行为，不能当作安装检测结果。

### URI 的双斜杠和三斜杠有区别

`createURL()` 默认生成：

```text
scheme://path
```

通过 `isTripleSlashed` 可以生成：

```text
scheme:///path
```

应按照目标应用或回调协议要求选择，不能仅凭外观认为两者等价。

## 建议的实际处理流程

下面是基于文档 API 整理出的通用流程：

```js
import * as Linking from 'expo-linking';

async function handleURL(url) {
  const parsed = Linking.parse(url);

  if (!parsed.path) {
    return;
  }

  // 校验 path 和 queryParams 后，再交给路由或业务逻辑。
}

export async function initializeLinking() {
  const initialURL = await Linking.getInitialURL();

  if (initialURL) {
    await handleURL(initialURL);
  }

  const subscription = Linking.addEventListener('url', event => {
    void handleURL(event.url);
  });

  return () => subscription.remove();
}
```

这是**基于文档内容推导**的组合方式，不是原文直接给出的完整示例。实际项目还需要接入所使用的路由系统。

处理外部输入时，建议至少做到：

- 对 `path` 建立允许列表。
- 检查查询参数是否存在及类型是否符合预期。
- 不因为 URL 中出现某个参数就直接执行敏感操作。
- 捕获 `openURL()` 和 `canOpenURL()` 的 Promise rejection。
- 在组件卸载或模块销毁时清理手动事件订阅。

其中输入校验和敏感操作保护属于**基于经验建议**。深度链接和普通 Web URL 一样，都属于外部输入，不能默认可信。

## 文档未涉及的内容

当前文档未详细介绍：

- Universal Links 和 Android App Links 的域名验证配置。
- Expo Router 或 React Navigation 的路由映射方式。
- iOS `Info.plist` 的完整配置步骤。
- Android Manifest 中 Intent Filter 的完整配置步骤。
- OAuth 提供方的回调 URL 配置。
- 深度链接的测试命令和调试工具。
- `resolveScheme()`、`hasCustomScheme()` 的详细判定规则。
- 不同平台对 `openSettings()` 的具体页面行为。
- 深度链接安全校验的完整方案。

这些内容不应根据当前 API 页面自行补全，需要继续查阅 Expo 的 Linking 指南及对应路由库文档。

## 总结

`expo-linking` 的核心职责可以归纳为四部分：

1. 使用 `createURL()` 创建指向当前应用的链接。
2. 使用 `openURL()` 和 `canOpenURL()` 与外部应用交互。
3. 使用初始 URL API、Hook 或事件监听接收链接。
4. 使用 `parse()` 将 URL 转换为应用可处理的结构化数据。

对于正式项目，最关键的限制是：scheme 必须进入原生构建，而 Expo Go 的已发布更新 URL 不稳定，不能承担正式授权回调等要求固定地址的任务。应用还必须同时处理冷启动和运行中收到链接两种情况，并把解析结果交给导航或业务层继续处理。

---

## 文档导航

- **上一页**：[linear gradient](./183__linear-gradient.md)
- **下一页**：[live photo](./185__live-photo.md)
