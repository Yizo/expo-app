# Expo Sharing 学习笔记

> 原文档修改日期：2026 年 5 月 23 日  
> 包名：`expo-sharing`  
> 支持平台：Android、iOS、Web、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；稳定版本请参考 SDK 56 对应文档。

## 文档解决的问题

`expo-sharing` 提供两类能力：

1. **把应用中的文件分享给其他应用**：例如将图片交给微信、邮件或系统文件应用处理。
2. **接收其他应用分享过来的内容**：例如用户从相册分享图片，并选择你的应用作为接收方。

它适合以下场景：

- 导出并分享应用生成的图片、PDF 等文件。
- 让应用出现在 iOS 或 Android 的系统分享面板中。
- 接收其他应用分享的文本、网址、图片、视频、音频或普通文件。
- 根据分享内容将用户导航到专门的处理页面。

需要特别注意：**接收其他应用分享内容目前属于实验性功能**。

## 阅读前需要理解的概念

### 系统分享面板

移动应用通常不会自己实现“选择分享到哪个应用”的完整界面，而是请求操作系统打开分享面板。

`Sharing.shareAsync()` 的作用类似于把一个文件交给操作系统，然后由操作系统列出能够处理该文件的应用。

这和 Web 中调用浏览器的 Web Share API 类似，但移动端能够处理本地文件 URI，Web 则存在明显限制。

### URI 与 URL

文档中的 URI 是内容地址，不一定是公开的 HTTP 链接，也可能是移动设备上的本地文件地址，例如：

```text
file:///path/to/image.png
```

对于 React Web 开发者，可以将其理解为类似浏览器中的资源地址，但移动端 URI 可能指向应用沙盒或系统临时文件，并不意味着互联网中的其他设备能够访问它。

### MIME type

MIME type 用于表示内容格式，例如：

```text
image/*
image/png
video/mp4
text/plain
application/pdf
```

Android 会根据 MIME type 判断：

- 你的应用愿意接收哪些内容；
- 哪些其他应用可以处理你发出的内容。

`image/*` 表示接受所有图片格式。

### Intent

Intent 是 Android 应用之间传递操作请求和数据的机制。

本文涉及两种 Intent：

- `ACTION_SEND`：分享单项内容。
- `ACTION_SEND_MULTIPLE`：一次分享多项内容。

在 React Web 中没有完全对应的概念。可以近似理解为操作系统级的事件和路由协议：应用声明自己能处理某种事件，Android 再将匹配的请求交给它。

### iOS Share Extension

iOS Share Extension 是附加在主应用上的原生扩展目标，使应用可以出现在系统分享面板中。

它不是普通 React 组件，也不是运行时动态开启的功能。启用它会改变 iOS 原生工程，因此必须重新构建应用二进制文件。

### App Group

iOS 主应用和 Share Extension 属于不同运行目标。App Group 用于让它们通过共享容器交换数据。

默认 App Group ID 为：

```text
group.{appBundleIdentifier}
```

其中 `appBundleIdentifier` 是 iOS 应用的唯一标识，例如：

```text
com.example.myapp
```

### Config Plugin 与 CNG

Expo Config Plugin 会根据 `app.json` 或其他应用配置修改 iOS、Android 原生工程。

CNG，即 Continuous Native Generation，是 Expo 根据应用配置持续生成原生工程的工作流。它允许开发者通过 JavaScript 或 JSON 配置管理原生项目设置。

这类配置不同于 React Web 中的运行时配置：

- 修改后不能靠刷新页面生效；
- 通常需要重新生成原生工程；
- 必须重新构建并安装应用。

如果项目不使用 CNG，就需要手动修改 iOS 和 Android 原生工程。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-sharing

# yarn
yarn expo install expo-sharing

# pnpm
pnpm expo install expo-sharing

# bun
bun expo install expo-sharing
```

`expo install` 会按照当前 Expo SDK 选择兼容的软件包版本，因此不应简单地把它等同于普通的 `npm install`。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 `expo`，使项目能够加载 Expo Modules。

## 配置接收分享功能

默认情况下，iOS Share Extension 和 Android 分享 Intent 处理均未启用。

下面的配置允许应用在 Android 和 iOS 上接收单张或多张图片：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sharing",
        {
          "ios": {
            "enabled": true,
            "activationRule": {
              "supportsImageWithMaxCount": 5
            }
          },
          "android": {
            "enabled": true,
            "singleShareMimeTypes": ["image/*"],
            "multipleShareMimeTypes": ["image/*"]
          }
        }
      ]
    ]
  }
}
```

这段配置的实际影响是：

- iOS 工程中新增 Share Extension target。
- iOS 最多接受一次分享的 5 张图片。
- Android Manifest 中新增匹配的 `intent-filter`。
- Android 接受单张或多张图片分享。
- 修改配置后必须重新构建应用。

### iOS 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `ios.enabled` | `false` | 是否添加 iOS Share Extension |
| `ios.extensionBundleIdentifier` | `{appBundleIdentifier}.ShareExtension` | Share Extension 的唯一 Bundle ID |
| `ios.appGroupId` | `group.{appBundleIdentifier}` | 主应用和扩展交换数据所使用的 App Group ID |
| `ios.activationRule` | `{}` | 声明应用能够接收的分享内容类型和数量 |

`ios.activationRule` 可以使用两种形式：

1. `ActivationRuleOptions` 配置对象，由插件生成标准规则。
2. 原始字符串，用来直接编写自定义 predicate，例如 `SUBQUERY(...)`。

对于不熟悉 iOS 原生规则的开发者，应优先使用结构化的 `ActivationRuleOptions`。

#### `ActivationRuleOptions`

| 配置项 | 默认值 | 作用 |
| --- | ---: | --- |
| `supportsAttachmentsWithMaxCount` | `0` | 最多接收多少个附件 |
| `supportsFileWithMaxCount` | `0` | 最多接收多少个普通文件 |
| `supportsImageWithMaxCount` | `0` | 最多接收多少张图片 |
| `supportsMovieWithMaxCount` | `0` | 最多接收多少个视频 |
| `supportsText` | `false` | 是否接收文本 |
| `supportsWebPageWithMaxCount` | `0` | 最多接收多少个网页 |
| `supportsWebUrlWithMaxCount` | `0` | 最多接收多少个 Web URL |

数量配置为 `0` 表示不接受对应类型，而不是不限制数量。

### Android 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `android.enabled` | `false` | 是否在 `AndroidManifest.xml` 中加入分享 Intent 过滤器 |
| `android.singleShareMimeTypes` | `[]` | 通过 `ACTION_SEND` 接受的单项内容 MIME type |
| `android.multipleShareMimeTypes` | `[]` | 通过 `ACTION_SEND_MULTIPLE` 接受的多项内容 MIME type |

单项与多项分享需要分别配置。只配置 `singleShareMimeTypes`，并不代表应用也能接收一次分享的多项内容。

## 从其他应用接收分享

### 功能状态和风险

接收分享当前是实验性功能。

原文档明确指出：iOS Share Extension 会打开主应用，而不是在 Share Extension 自己的 `ViewController` 中处理内容。Apple 并不正式支持这种方式，未来某个 iOS 版本可能使其失效。

因此，这项能力不应被视为稳定的长期平台契约。

### 整体处理流程

其他应用向当前应用分享内容时，处理过程如下：

1. 用户在其他应用中打开系统分享面板。
2. 用户选择当前应用。
3. 操作系统启动当前应用，或将其切换到前台。
4. `expo-sharing` 通过特殊深链接表示这次分享操作。
5. 应用识别主机名为 `expo-sharing` 的链接。
6. 导航系统把用户重定向到分享处理页面。
7. 处理页面读取并解析分享数据。
8. 页面显示、上传、保存或进一步处理这些内容。
9. 处理完成后清除已保存的 payload。

React Web 开发者容易误以为分享数据会直接作为组件 props 传入。实际上，应用首先被系统唤醒，然后需要把**导航处理**和**数据读取**组合起来。

## 配置分享入口导航

### 使用 Expo Router

可以在 `+native-intent.ts` 中检查系统传入的路径，并将分享请求重定向到处理页面：

```tsx
export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (new URL(path).hostname === 'expo-sharing') {
      return '/handle-share';
    }

    return path;
  } catch {
    return '/';
  }
}
```

这里的关键判断是：

```ts
new URL(path).hostname === 'expo-sharing'
```

命中后返回 `/handle-share`，让 Expo Router 打开对应路由。URL 无法解析时回退到根路由，避免启动过程因异常链接中断。

示例签名中包含 `initial`，但文档示例没有使用它。它用于表示当前路径是否来自应用初次启动。

### 使用 React Navigation

React Navigation 需要通过 `linking` 配置同时处理两种情况：

- 应用未运行，由分享操作冷启动；
- 应用已运行，在前台或后台收到新的链接事件。

核心处理函数如下：

```tsx
function processUrl(url: string | null) {
  if (!url) return null;

  const handlerUrl = Linking.createURL('/handle-share');

  if (new URL(url).hostname === 'expo-sharing') {
    return handlerUrl;
  }

  return url;
}
```

对应的两个入口是：

- `getInitialURL()`：读取冷启动时触发应用的初始 URL。
- `subscribe()`：监听应用运行期间收到的新 URL。

处理页面还需要在导航器中声明：

```tsx
HandleShare: {
  screen: HandleShare,
  linking: {
    path: '/handle-share',
  },
}
```

这类似 React Web 路由中的 path-to-component 映射，但移动端还要处理操作系统唤醒应用时传入的链接。

### 不使用导航库

如果应用没有导航库，可以直接让主屏幕承担分享处理页面的职责，无须额外重定向。

## 读取并显示分享内容

重定向到处理页面后，可以使用 `useIncomingShare()` 获取内容：

```tsx
import { Image } from 'expo-image';
import { useIncomingShare } from 'expo-sharing';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export default function ShareReceived() {
  const { resolvedSharedPayloads, isResolving } = useIncomingShare();

  if (isResolving) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {resolvedSharedPayloads.map((payload, index) => {
        if (payload.contentType === 'image') {
          return (
            <Image
              source={{ uri: payload.contentUri }}
              style={styles.image}
              key={index}
            />
          );
        }

        return null;
      })}
    </View>
  );
}
```

关键点包括：

- `isResolving` 表示内容是否还在解析。
- `resolvedSharedPayloads` 是解析后的内容数组。
- 必须根据 `contentType` 判断内容类型。
- 图片通过 `contentUri` 交给 React Native 图片组件显示。
- 一次分享可能包含多个 payload，不能只按单个对象处理。

`resolvedSharedPayloads` 在解析期间或解析失败时都会是空数组，因此不能仅根据数组为空判断“用户没有分享内容”。还应结合 `isResolving` 和 `error`。

## `useIncomingShare()` 返回值

该 Hook 会返回当前分享数据，并在 payload 变化时更新。

| 字段 | 作用 |
| --- | --- |
| `sharedPayloads` | 原始数据；Hook 创建后可同步读取 |
| `resolvedSharedPayloads` | 解析后、适合读取和展示的数据 |
| `isResolving` | 当前是否正在解析 |
| `error` | 解析错误；成功时为 `null` |
| `refreshSharePayloads` | 强制重新读取分享数据 |
| `clearSharedPayloads` | 清除当前分享数据 |

典型 UI 状态应至少区分：

```text
正在解析
解析失败
解析成功但没有数据
解析成功并存在数据
```

## 发送内容到其他应用

### 检查能力

```ts
import * as Sharing from 'expo-sharing';

const available = await Sharing.isAvailableAsync();
```

`isAvailableAsync()` 返回当前应用和平台是否可以使用分享 API。

尤其在 Web 上，必须先检查，因为 Web Share API 的浏览器支持范围有限。

### 打开分享面板

```ts
await Sharing.shareAsync(fileUri, options);
```

该方法接收：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string` | 要分享的本地文件 URI |
| `options` | `SharingOptions` | 可选的平台相关配置 |

调用后，系统会打开能够处理该文件类型的应用选择界面。Promise 返回 `void`，原文档没有说明它会返回用户选择的目标应用或分享结果。

### `SharingOptions`

| 配置项 | 平台 | 作用 |
| --- | --- | --- |
| `anchor` | iOS | 设置 iPad 分享面板的锚点位置和尺寸 |
| `dialogTitle` | Android、Web | 设置分享对话框标题 |
| `mimeType` | Android | 设置 Intent 的 MIME type |
| `UTI` | iOS | 设置目标文件的 Uniform Type Identifier |

`anchor` 的结构为：

```ts
{
  x: number;
  y: number;
  width: number;
  height: number;
}
```

UTI 是 iOS 用来标识文件类型的系统类型标识。它与 MIME type 目的相似，但属于 Apple 平台的类型系统。

## 直接读取和管理接收数据

### `Sharing.getSharedPayloads()`

```ts
const payloads = Sharing.getSharedPayloads();
```

同步返回未经解析的 `SharePayload[]`。没有分享数据时返回空数组。

原始 payload 适合需要立即读取分享值，或者不需要额外解析元数据的场景。

### `Sharing.getResolvedSharedPayloadsAsync()`

```ts
const payloads = await Sharing.getResolvedSharedPayloadsAsync();
```

返回解析后的 `ResolvedSharePayload[]`，仅支持 Android 和 iOS。

解析结果可能补充：

- 可访问的内容 URI；
- 内容类型；
- MIME type；
- 文件大小；
- 原始文件名；
- URL 最终重定向地址；
- 网页内容相关信息。

解析某些内容可能需要网络连接。例如，对分享进来的网页 URL 进行解析时，可能需要访问该地址。

### `Sharing.clearSharedPayloads()`

```ts
Sharing.clearSharedPayloads();
```

清除应用当前保存的分享数据。

**基于文档内容推导：**处理完成后应及时清除 payload，否则处理页面后续刷新或重新进入时，可能继续读到上一轮分享内容。

## 数据类型

### 原始数据 `SharePayload`

`SharePayload` 表示刚接收到、尚未解析的数据：

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| `mimeType` | `'text/plain'` | `value` 内容的 MIME type |
| `shareType` | `'text'` | 分享内容的基本类型 |
| `value` | `""` | 内容的主要值 |

`value` 的含义取决于 `shareType`：

| `shareType` | `value` 的含义 |
| --- | --- |
| `text` | 文本正文 |
| `url` | URL 字符串 |
| `file` | 通常是文件 URI |
| `image` | 通常是图片 URI |
| `video` | 通常是视频 URI |
| `audio` | 通常是音频 URI |

`ShareType` 可取：

```ts
'text' | 'url' | 'audio' | 'image' | 'video' | 'file'
```

### 解析数据 `ResolvedSharePayload`

解析结果是以下两类对象的联合类型：

```ts
UriBasedResolvedSharePayload | TextBasedResolvedSharePayload
```

#### URI 类型内容

适用于音频、文件、视频、图片和网站：

```ts
contentType: 'audio' | 'file' | 'video' | 'image' | 'website';
contentUri: string;
```

#### 文本类型内容

文本 payload 的 `contentType` 为：

```ts
'text'
```

文本解析结果可能没有可使用的 `contentUri`，实际文本仍来自原始 payload 的 `value`。

### 解析后提供的公共字段

| 字段 | 含义 |
| --- | --- |
| `contentMimeType` | `contentUri` 对应内容的 MIME type |
| `contentSize` | 内容大小 |
| `contentType` | 解析后的内容类别 |
| `contentUri` | 可用于访问内容的 URI |
| `originalName` | 建议文件名或 URI 最后一段路径 |
| `mimeType`、`shareType`、`value` | 从原始 `SharePayload` 继承的字段 |

解析 URL 遇到重定向时，`contentUri` 会保存最终目标 URI。

`ContentType` 可取：

```ts
'text' | 'audio' | 'image' | 'video' | 'file' | 'website'
```

注意原始 `ShareType` 使用的是 `url`，解析后的 `ContentType` 使用的是 `website`。二者不是同一套枚举值。

## Web 平台限制

### 浏览器支持有限

Web 实现建立在 Web Share API 之上，而该 API 的浏览器支持仍然有限。调用前必须检查：

```ts
if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(uri);
}
```

这和 React Web 中检测浏览器能力的原则相同：不能因为代码中存在某个 API，就假设所有浏览器都能使用它。

### 必须使用 HTTPS

Web Share API 只有在页面通过 HTTPS 提供时才能使用。

Expo 开发阶段可以执行：

```sh
npx expo start --tunnel
```

该命令通过 tunnel 提供符合要求的访问方式。

### 不能通过 URI 分享本地文件

Android 和 iOS 可以把本地文件 URI 交给系统分享，但 Web 不支持这种方式。

Web 端需要：

1. 先把文件上传到可访问的位置；
2. 获得网络 URI；
3. 分享该 URI。

因此，同一段 `shareAsync(localFileUri)` 逻辑不能假设在三个平台上具有完全相同的效果。

## 限制与容易踩坑的地方

1. 接收分享默认未启用，需要分别配置 iOS 和 Android。
2. 原生配置变化不能通过热更新或刷新生效，必须重新构建应用。
3. 不使用 CNG 时，需要手动配置原生工程。
4. Android 单项分享和多项分享使用不同 Intent，必须分别声明 MIME type。
5. iOS activation rule 中数量为 `0` 表示拒绝对应内容。
6. iOS 接收分享的当前实现属于实验性方案，未来可能受系统版本影响。
7. 接收分享会把应用带到前台，需要正确处理冷启动和运行期间收到链接两种情况。
8. 解析内容可能需要网络，不能把 `getResolvedSharedPayloadsAsync()` 当作纯本地操作。
9. `resolvedSharedPayloads` 为空不一定表示没有数据，也可能表示正在解析或解析失败。
10. Web 必须运行在 HTTPS 环境，并且浏览器可能根本不支持 Web Share API。
11. Web 不能像 Android、iOS 那样直接分享本地文件 URI。
12. `shareAsync()` 的参数名是 `url`，但文档定义的是本地文件 URL，不应将其理解为任意网页链接分享接口。
13. 文档 API 表格中部分项目标注了 Web，但原始和解析 payload 类型的完整接收能力主要明确为 Android、iOS。实现跨平台逻辑时应以具体 API 的平台声明为准。

## React Web 开发者需要特别注意的地方

### 配置会改变原生应用结构

`app.json` 中的插件配置不是普通前端环境变量。它会生成或修改：

- iOS Share Extension target；
- iOS `Info.plist`；
- iOS App Group；
- Android `AndroidManifest.xml`；
- Android `intent-filter`。

因此，“修改配置并重新加载开发服务器”通常不够，必须构建新的原生二进制文件。

### 深链接是系统启动入口

Web 中路由通常从浏览器地址栏开始；这里的链接则可能由操作系统在启动应用时传入。

必须同时考虑：

- 应用尚未启动；
- 应用在后台；
- 应用正在前台。

只监听运行时事件会漏掉冷启动，只处理初始 URL 又会漏掉后续分享。

### 文件 URI 不等于浏览器 Blob URL

移动端的 `contentUri` 或 `file://` URI 可能由系统内容提供器或应用沙盒管理。不能直接套用浏览器中 `File`、`Blob`、`URL.createObjectURL()` 的生命周期和权限模型。

当前文档没有进一步说明 URI 的持久化期限和权限生命周期。

### 分享面板不是普通弹窗

它是操作系统管理的界面。应用只能提供有限的平台选项，不能像 React Web Modal 那样完全控制样式、应用列表和交互结果。

## 实际开发建议

以下内容属于**基于文档内容推导**或**基于经验建议**，不是原文档直接给出的完整实现。

### 建立明确的处理状态

建议将接收页面建模为：

```ts
type ShareScreenState =
  | 'resolving'
  | 'error'
  | 'empty'
  | 'ready';
```

这可以避免把“解析失败”和“没有分享内容”都显示为空白页面。

### 按类型做穷尽处理

建议对 `contentType` 使用 `switch`：

```tsx
switch (payload.contentType) {
  case 'image':
    return renderImage(payload);
  case 'video':
    return renderVideo(payload);
  case 'audio':
    return renderAudio(payload);
  case 'website':
    return renderWebsite(payload);
  case 'file':
    return renderFile(payload);
  case 'text':
    return renderText(payload);
}
```

这样比只判断图片更容易发现未处理的内容类型。

### 处理完成后清除数据

**基于文档内容推导：**在内容已经保存、上传或提交后调用：

```ts
clearSharedPayloads();
```

如果处理失败，则应谨慎决定是否清除，以免用户必须重新发起分享。

### 保持平台分支明确

Web 和移动端的文件分享能力不同，建议显式区分：

```ts
if (Platform.OS === 'web') {
  // 上传文件并分享网络 URI
} else {
  // 分享本地文件 URI
}
```

不要只依赖 TypeScript 类型推断平台行为。

### 真机验证完整流程

**基于经验建议：**分享扩展、Intent、文件权限和应用唤醒属于系统集成能力，应至少验证：

- Android 单项分享；
- Android 多项分享；
- iOS 单项和多项分享；
- 应用冷启动接收；
- 应用后台接收；
- 解析失败和断网场景；
- 处理完成后再次分享；
- Web HTTPS 和不支持 Web Share API 的浏览器。

## 当前文档未涉及的内容

原文档没有明确说明：

- 接收 URI 的有效期限和持久化规则；
- 大文件或大量文件的性能、内存和大小限制；
- 分享上传进度；
- 用户取消分享时如何检测；
- 如何获得用户最终选择的目标应用；
- 如何在后台静默处理分享内容；
- 文件安全扫描与权限校验方案；
- iOS 自定义 Share Extension UI 的实现方式；
- Android 不同厂商系统的兼容差异；
- 自动化测试分享扩展或 Intent 的具体方法；
- App Store 和 Google Play 的审核注意事项。

这些问题需要结合具体平台文档及实际测试另行确认。

## 总结

`expo-sharing` 同时覆盖“分享出去”和“接收进来”两条流程。

分享出去的核心是：

```ts
await Sharing.isAvailableAsync();
await Sharing.shareAsync(fileUri, options);
```

接收进来的核心是：

1. 使用 config plugin 声明 iOS 和 Android 接受的内容类型。
2. 重新构建应用。
3. 识别主机名为 `expo-sharing` 的系统深链接。
4. 导航到专用处理页面。
5. 使用 `useIncomingShare()` 或相关方法读取数据。
6. 根据解析状态和内容类型展示或处理。
7. 完成后清除 payload。

开发时最需要重视三个边界：

- iOS 接收分享目前是实验性功能；
- 原生配置必须通过新构建生效；
- Web 的 HTTPS、浏览器支持和本地文件限制使其无法与移动端完全共用一套逻辑。

---

## 文档导航

- **上一页**：[server](./205__server.md)
- **下一页**：[sms](./207__sms.md)
