# 176｜Expo SDK Linking 深度链接与 URL 处理

**翻页：**[上一页：Expo SDK LinearGradient 渐变视图](./175-Expo-SDK-LinearGradient.md) · [目录](./README.md) · [下一页：Expo SDK LivePhoto](./177-Expo-SDK-LivePhoto.md)

**官方页面：**[Linking · Latest](https://docs.expo.dev/versions/latest/sdk/linking/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/linking/) · [Expo Linking 指南](https://docs.expo.dev/linking/overview/)

**版本与平台：**Latest 推荐 `expo-linking ~57.0.10`；SDK v56.0.0 推荐 `~56.0.18`。常规 Linking API 支持 Android、iOS、tvOS 和 Web，并可在 Expo Go 使用；`sendIntent` 只支持 Android。

## Linking 解决什么问题

**深度链接（deep link）**是一个能把用户带到应用特定内容的 URL。除了网页常见的 `https://`，手机应用也可以注册自己的 URL scheme，例如 `myshop://product/42`。外部链接启动应用时是“传入链接”；应用调用系统浏览器、电话或其它已安装应用则是“传出链接”。

`expo-linking` 是 React Native Linking API 的 Expo 扩展：它能监听启动应用的 URL、解析 URL、按当前平台拼装指向本应用的 URL，以及把 URL 交给操作系统打开。它是底层 API；使用 Expo Router 的项目通常由路由系统自动为页面处理深度链接。需要手动接入、自定义 URL 或打开其它应用时，再直接使用本模块。

URL 常见部分包括 scheme（`myshop:` 这样的协议）、hostname（域名或主机名）、path（应用内路径）和 query（查询参数）。自定义 scheme 需写入 app config，并打进原生应用；变更 scheme 后要重新生成/安装 development build 才能在设备上验证。Expo Go 的开发 URL 是临时环境地址，不适合作为 OAuth 回调等需要稳定地址的生产配置。

## 安装与导入

Expo 项目建议用 `expo install`，它会选择与当前 Expo SDK 兼容的包版本。官方还列出 yarn、pnpm、bun 的等价命令：

```sh
npx expo install expo-linking
yarn expo install expo-linking
pnpm expo install expo-linking
bun expo install expo-linking
```

如果是在已有的纯 React Native 工程安装，需要先集成 `expo` 包和 Expo 模块环境。模块采用命名空间导入：

```ts
import * as Linking from 'expo-linking';
```

自定义 scheme 在 app config 中声明，例如：

```json
{
  "expo": {
    "scheme": "myshop"
  }
}
```

## 创建本应用的 URL

`Linking.createURL(path, options)` 根据当前运行环境生成可回到本应用的深度链接。不要硬编码 Expo Go 的临时主机地址。`scheme` 可覆写本次生成使用的 scheme；`queryParams` 会被编码到查询字符串；`isTripleSlashed` 控制 `myshop:///path` 与 `myshop://path` 的斜线格式。

```ts
import * as Linking from 'expo-linking';

const productUrl = Linking.createURL('product/42', {
  scheme: 'myshop',
  queryParams: {
    source: 'campaign',
    tags: ['summer', 'featured'],
  },
});

// URL 的具体前缀取决于运行环境；path 和 query 会附加到生成的前缀后。
console.log(productUrl);
```

官方文档列出的前缀形态如下：

| 环境 | URL 形态 |
| --- | --- |
| development / production build | `<scheme>://path`，优先使用传入 scheme，否则取 app config 的 scheme。 |
| Web 开发 | `https://localhost:19006/path`。 |
| Web 生产 | `https://myapp.com/path`，域名由部署环境决定。 |
| Expo Go 开发 | `exp://<开发服务器地址>/--/path`。 |

Expo Go 中已发布更新的 `createURL()` 结果没有稳定保证。若 OAuth、外部服务或回跳地址要求固定值，应使用 development/production build 并明确设置 app scheme；Expo 的 Linking guide 也建议需要稳定地址时不要依赖 Expo Go。

## 接收、读取和解析 URL

### React Hook：监听 URL 的变化

`useLinkingURL()` 返回启动应用的初始链接，并继续随新链接变化而更新；重新加载时也会立即返回初始 URL。没有链接时返回 `null`。`useURL()` 也返回初始值和后续变化，但文档将它标为 deprecated，建议迁移到 `useLinkingURL()`。

```tsx
import * as Linking from 'expo-linking';
import { Text, View } from 'react-native';

export function IncomingLinkStatus() {
  const url = Linking.useLinkingURL();

  return (
    <View>
      <Text>{url ?? '没有通过链接打开'}</Text>
    </View>
  );
}
```

### 命令式读取与解析

`getInitialURL()` 返回 `Promise<string | null>`，适合异步读取首次启动链接；`getLinkingURL()` 返回当前关联的初始 URL 或 `null`。`parse(url)` 把 URL 拆成结构化对象；`parseInitialURLAsync()` 会异步读取并解析启动链接。后者在 Web 上解析当前 `window` URL，无启动链接时字段为 `null`。

```ts
import * as Linking from 'expo-linking';

export async function inspectLaunchLink() {
  const rawUrl = await Linking.getInitialURL();
  const parsed = rawUrl ? Linking.parse(rawUrl) : await Linking.parseInitialURLAsync();

  return {
    rawUrl,
    path: parsed.path,
    productId: parsed.queryParams?.id,
    allQuery: parsed.queryParams,
  };
}
```

`ParsedURL` 包含 `scheme`、`hostname`、`path`、`queryParams`。前几项会是 `string | null`；查询参数对象可能不存在，因此读取时应按空值处理。处理链接后，仍需由应用自己的路由逻辑验证参数和权限，不要把 URL 参数直接当作可信输入。

## 打开外部 URL 与检查可用性

`canOpenURL(url)` 用于询问设备是否有应用能处理 URL，返回 `Promise<boolean>`。Web 没有检测外部协议处理程序的 API，因此始终返回 `true`；Android 可能因无法检查而 reject；iOS 查询某些 scheme 前，需在原生 `Info.plist` 的 `LSApplicationQueriesSchemes` 中声明。它是预检而不是成功保证，实际打开仍可能失败。

`openURL(url)` 让操作系统处理 URL，例如 `https://expo.dev/` 或 `tel:5555555`。成功时 Promise 解析为 `true`；没有已注册的处理应用，或用户取消系统确认对话框时会 reject。打开系统设置用 `openSettings()`，返回 `Promise<void>`。

```tsx
import * as Linking from 'expo-linking';
import { Button } from 'react-native';

export function ContactSupportButton() {
  const openSupport = async () => {
    const url = 'mailto:support@example.com';

    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn('无法打开邮件应用', error);
    }
  };

  return <Button title="联系支持" onPress={openSupport} />;
}
```

`canOpenURL()` 在 Web 不表示用户设备上有邮件客户端；如果对 Web 支持很重要，可直接调用 `openURL()` 并处理失败，或给出网页形式的备用联系方式。

## 订阅传入 URL 事件

在无需 Hook 的命令式代码中，可用 `addEventListener('url', listener)` 订阅 URL 事件。回调的 `event.url` 是新 URL，返回的订阅对象提供 `.remove()`；组件卸载时移除监听，避免重复订阅。新代码优先用 `useLinkingURL()`。

```tsx
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export function useIncomingLink(onUrl: (url: string) => void) {
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      onUrl(url);
    });

    return () => subscription.remove();
  }, [onUrl]);
}
```

事件类型是 `'url'`，不接受其它事件名。回调符合 `URLListener(event: EventType): void`；`EventType` 有字符串 `url`，并可包含原生 `nativeEvent`。

## 其它方法与类型

| API | 作用与返回值 | 平台 / 注意事项 |
| --- | --- | --- |
| `clearInitialURL()` | 清除缓存的启动 URL；直到收到新的深度链接前，`getLinkingURL()` 返回 `null`。 | Latest 新增于本参考链；Web 是 no-op；v56.0.0 页面没有此 API。 |
| `collectManifestSchemes()` | 收集 app manifest 中的 scheme，返回 `string[]`；用于预构建原生应用前的 scheme 收集。 | Android 取值顺序：`scheme → android.scheme → android.package`；iOS：`scheme → ios.scheme → ios.bundleIdentifier`。 |
| `hasConstantsManifest()` | 检查现有 React Native / bare 工程是否已链接 Expo Constants manifest，返回 `boolean`。 | 适合检查已有原生工程集成状态。 |
| `hasCustomScheme()` | 返回是否配置自定义 URL scheme。 | 返回 `boolean`。 |
| `resolveScheme({ isSilent, scheme })` | 根据给定选项解析 scheme，返回 `string`。 | 两版 API 参考均只列出 `{ isSilent: boolean, scheme: string }` 参数签名，未展开具体解析规则。 |
| `sendIntent(action, extras?)` | 带 extras 启动 Android Intent，返回 `Promise<void>`。 | 仅 Android。文档建议使用 `expo-intent-launcher`；这里保留此 API 是为了兼容 React Native Linking。 |

主要类型：

| 类型 | 结构 / 说明 |
| --- | --- |
| `CreateURLOptions` | `isTripleSlashed?: boolean`、`queryParams?: QueryParams`、`scheme?: string`。 |
| `QueryParams` | `Record<string, undefined \| string \| string[]>`。 |
| `ParsedURL` | `hostname`、`path`、`scheme` 为 `string \| null`；`queryParams` 为 `QueryParams \| null`。 |
| `EventType` | `url: string`；可选 `nativeEvent: MessageEvent`。 |
| `URLListener` | 接收 `EventType` 参数、返回 `void` 的函数。 |
| `NativeURLListener` | 接收 `MessageEvent` 参数、返回 `void` 的函数。 |
| `SendIntentExtras` | `{ key: string; value: string \| number \| boolean }`；`sendIntent` 可接收此类型数组。 |
| `EmitterSubscription` | 事件订阅返回值，包含移除监听的 `remove()`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-linking ~57.0.10`，SDK v56.0.0 推荐 `~56.0.18`。代码应按项目 Expo SDK 使用 `npx expo install expo-linking` 安装兼容版本。
- 两版共同支持 `useLinkingURL()`、已弃用的 `useURL()`、URL 创建 / 打开 / 解析、manifest 检查、scheme 解析、URL 事件订阅和 Android `sendIntent()`。
- `clearInitialURL()` 只在 Latest 页面列出；不要在 Expo SDK 56 项目中依赖它。Latest 的事件监听说明推荐 `useLinkingURL()`；v56 页面仍写 `useURL()`，但该 hook 自身也标有弃用提示，应优先采用 `useLinkingURL()`。
- 两版 `createURL()` 的开发、生产、Web 和 Expo Go URL 形态及 Expo Go 稳定性警告一致；两页页脚 Next 都是 LivePhoto。

## 源页代码主题覆盖

- Installation：覆盖官方给出的 `npx`、Yarn、pnpm、Bun 四种 `expo-linking` 安装命令，以及 `import * as Linking` 的命名空间导入。
- `createURL`：重写路径、scheme、query 参数和数组参数示例；列出开发构建、生产构建、Web 和 Expo Go 的 URL 前缀，并说明双斜线 / 三斜线选项与稳定 scheme 的用途。
- URL 接收 / 解析：覆盖 `useLinkingURL`、旧 `useURL`、`getInitialURL`、`getLinkingURL`、`parse`、`parseInitialURLAsync` 和 `ParsedURL` 字段。
- 打开 URL：覆盖 `canOpenURL`、`openURL`、邮箱/电话等 URL scheme、失败处理、Web 与 iOS / Android 检查差异；另说明 `openSettings`。
- 事件与 Android Intent：覆盖 `'url'` 事件、事件对象、订阅清理、`URLListener` 和 `sendIntent` / `SendIntentExtras`。
- API / 类型目录：覆盖 `clearInitialURL`、`collectManifestSchemes`、`hasConstantsManifest`、`hasCustomScheme`、`resolveScheme` 以及各公开参数和返回类型。
- 官方参考页自身只有四种安装命令、模块导入和 API 签名 / URL 形态说明，没有独立的 runnable Usage 代码块；本文根据这些 API 合写可运行场景示例，并将代码主题逐类列明。自定义 scheme JSON 依据官方 Linking into your app 指南补充，便于理解 scheme 配置。

**翻页：**[上一页：Expo SDK LinearGradient 渐变视图](./175-Expo-SDK-LinearGradient.md) · [目录](./README.md) · [下一页：Expo SDK LivePhoto](./177-Expo-SDK-LivePhoto.md)
