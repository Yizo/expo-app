# 199｜Expo SDK Sharing 系统分享与接收内容

**翻页：**[上一页：Expo SDK Server 服务端运行时与 API 路由](./198-Expo-SDK-Server.md) · [目录](./README.md) · [下一页：Expo SDK SMS](./200-Expo-SDK-SMS.md)

**官方页面：**[Sharing · Latest](https://docs.expo.dev/versions/latest/sdk/sharing/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/sharing/)

**版本与平台：**Latest 推荐 `expo-sharing ~57.0.21`；SDK v56.0.0 推荐 `~56.0.26`。Android、iOS 和 Web 均有分享支持，Expo Go 可用。页面“从其它 app 接收分享”功能仍为 experimental，iOS share extension 行为也有系统兼容性限制。

## 两种不同的分享方向

`expo-sharing` 让你的 app 把文件交给其它 app，也能把其它 app 传来的内容接收进来：

- **分享到其它 app（outgoing share）：**调用 `Sharing.shareAsync(fileUri)` 打开系统 share sheet，让用户选择目标 app。
- **从其它 app 接收（incoming share）：**启用 iOS Share Extension / Android share intent，按 MIME type 声明能接收的内容，然后通过 deep link 导航至处理页面。
- **系统 share sheet：**系统的应用选择面板；Share API 成功打开面板不代表接收 app 已完成导入。
- **MIME type：**描述内容格式的字符串，如 `image/*`、`application/pdf`，操作系统据此筛选可接收的目标 app。
- **Share Extension / intent filter：**iOS / Android 上注册 app 能接收哪些内容的原生配置，改动后需要重建原生包。

## Web 限制

Web 实现基于浏览器 Web Share API，支持的浏览器有限。调用前用 `Sharing.isAvailableAsync()` 查询；Web 还必须在 HTTPS 安全上下文中运行，Expo 文档建议开发时用 `npx expo start --tunnel`。Web 不能直接按本地 file URI 分享文件：先把文件上传，再分享可访问的 URI。

## 安装

```sh
npx expo install expo-sharing
yarn expo install expo-sharing
pnpm expo install expo-sharing
bun expo install expo-sharing
```

已有 React Native 工程需要先集成 `expo`。

## 从 app 分享文件

`shareAsync` 接收本地文件 URI，唤起系统分享面板；不同平台的配置项不同。Web 需要先检查浏览器支持；Web 的本地文件 URI 不可分享：

```tsx
import { Button, Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export function ShareReportButton({ fileUri }: { fileUri: string }) {
  async function shareReport() {
    if (Platform.OS === 'web' && !(await Sharing.isAvailableAsync())) {
      Alert.alert('当前浏览器不支持分享');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Web 不能分享本地文件', '请先上传文件，再分享远程 URL。');
      return;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf', // Android
      UTI: 'com.adobe.pdf', // iOS
    });
  }

  return <Button title="分享报告" onPress={() => void shareReport()} />;
}
```

`SharingOptions` 还可设置 iPad 分享面板的 `anchor` 矩形位置、Android / Web 的 `dialogTitle`。iOS 使用 `UTI`（Uniform Type Identifier），Android 使用 `mimeType`。

## 配置 app 接收文件

接收分享是 experimental 功能。CNG / config plugin 可在 iOS 启用 Share Extension 与 App Group，并在 Android 添加 intent filter。此例让两端接收最多五张图片；所有 plugin 配置改完要重建 app：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sharing",
        {
          "ios": {
            "enabled": true,
            "activationRule": { "supportsImageWithMaxCount": 5 }
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

- `ios.enabled` 默认 false，启用时会生成 share extension target。
- `ios.extensionBundleIdentifier` 默认 `{appBundleIdentifier}.ShareExtension`。
- `ios.appGroupId` 默认 `group.{appBundleIdentifier}`，用于主 app 与 extension 共享数据。
- `ios.activationRule` 可用 `ActivationRuleOptions` 生成标准 predicate，也可传自定义 predicate 字符串。
- `android.enabled` 默认 false，启用后加入 Android manifest intent-filter。
- `android.singleShareMimeTypes` / `multipleShareMimeTypes` 分别配置单文件与多文件分享接受的 MIME types。

## 将 incoming share 导航到处理页面

当用户从其它 app 选择你的 app，系统会把 app 拉到前台；应用需要识别 Expo Sharing 的链接并导航到 handler screen。

### Expo Router

Expo Router 在 `app/+native-intent.ts` 提供 `redirectSystemPath`。检查 URL hostname 是否为 `expo-sharing`，命中时返回处理页面路径；解析失败时回根路由：

```ts
export async function redirectSystemPath({ path }: { path: string; initial: boolean }) {
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

### React Navigation

非 Expo Router 导航需在 `linking` 里拦截初始 URL 和运行中的 URL 事件，并把 `expo-sharing` host 改成应用内 handler route。其余 URL 保持原样：

```tsx
import * as Linking from 'expo-linking';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HandleShare from './HandleShare';

const RootStack = createNativeStackNavigator({
  screens: {
    HandleShare: { screen: HandleShare, linking: { path: '/handle-share' } },
  },
});
const Navigation = createStaticNavigation(RootStack);

function processShareUrl(url: string | null) {
  if (!url) return null;
  if (new URL(url).hostname === 'expo-sharing') return Linking.createURL('/handle-share');
  return url;
}

export default function App() {
  return (
    <Navigation
      linking={{
        prefixes: [Linking.createURL('/')],
        async getInitialURL() {
          return processShareUrl(await Linking.getInitialURL());
        },
        subscribe(listener) {
          const subscription = Linking.addEventListener('url', ({ url }) => {
            listener(processShareUrl(url) ?? url);
          });
          return () => subscription.remove();
        },
      }}
    />
  );
}
```

若 app 没使用导航库，主屏幕可以直接作为分享处理页。

## 读取并显示接收到的图片

导航到 handler screen 后，`useIncomingShare()` 提供原始与解析后的 share payload；`isResolving` 为 true 时先显示 loading UI。下例只展示 image 类型，`expo-image` 用于显示 URI 图片：

```tsx
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useIncomingShare } from 'expo-sharing';

export default function IncomingShareScreen() {
  const { resolvedSharedPayloads, isResolving, error } = useIncomingShare();

  if (isResolving) {
    return <ActivityIndicator size="large" />;
  }
  if (error) {
    return <View><Text>分享内容读取失败：{error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      {resolvedSharedPayloads.map((payload, index) => {
        if (payload.contentType !== 'image' || !payload.contentUri) return null;
        return <Image key={`${payload.contentUri}-${index}`} source={{ uri: payload.contentUri }} style={styles.image} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  image: { width: 300, height: 300, marginBottom: 20, borderRadius: 10 },
});
```

## API 方法与 Hook

| API | 平台 | 用途 |
| --- | --- | --- |
| `useIncomingShare()` | Android、iOS、Web 页面列出 | 返回已分享给 app 的数据；payload 更新时会刷新。接收分享整体仍标为 experimental。 |
| `Sharing.clearSharedPayloads()` | Android、iOS、Web | 清除 app 收到的分享数据。 |
| `Sharing.getResolvedSharedPayloadsAsync()` | Android、iOS，experimental | 读取解析后的 payload；解析被分享 URL 可能需要网络。 |
| `Sharing.getSharedPayloads()` | Android、iOS，experimental | 同步读取原始 payload；无分享时空数组。 |
| `Sharing.isAvailableAsync()` | Android、iOS、Web | 检查平台分享能力，返回 `Promise<boolean>`。 |
| `Sharing.shareAsync(url, options?)` | Android、iOS、Web | 把本地文件交给其它兼容 app，返回 `Promise<void>`。 |

`UseIncomingShareResult` 有 `sharedPayloads`（立即可读的原始数据）、`resolvedSharedPayloads`、`isResolving`、`error`、`refreshSharePayloads()`、`clearSharedPayloads()`。清理后要按产品行为决定 UI 是否需要刷新。

## Share payload 类型

| 类型 | 字段 / 取值 |
| --- | --- |
| `SharePayload`（experimental） | `mimeType?`（默认 `text/plain`）、`shareType?`（默认 `text`）、`value?`（text 是正文、url 是 URL、file/image/video/audio 常是 URI，默认空字符串）。 |
| `BaseResolvedSharePayload` | 原始 share payload 加 `contentMimeType`、`contentSize`、`contentType`、`contentUri`、`originalName`；字段可为 null。 |
| `ContentType`（experimental） | `text`、`audio`、`image`、`video`、`file`、`website`。 |
| `ResolvedSharePayload`（experimental） | `TextBasedResolvedSharePayload \| UriBasedResolvedSharePayload`。 |
| `TextBasedResolvedSharePayload` | `BaseResolvedSharePayload` 扩展；`contentType?: 'text'`。 |
| `UriBasedResolvedSharePayload` | `contentType` 为 audio/file/video/image/website 之一；`contentUri: string`。 |
| `SharingOptions` | iOS `anchor`、`UTI`；Android/Web `dialogTitle`；Android `mimeType`。 |

`anchor` 形如 `{ x, y, width, height }`，用于 iPad 的 popover 位置。

## Config plugin 类型

- `ActivationRule` 是 `ActivationRuleOptions` 或原始 predicate 字符串。
- `ActivationRuleOptions` 可配置：`supportsAttachmentsWithMaxCount?`、`supportsFileWithMaxCount?`、`supportsImageWithMaxCount?`、`supportsMovieWithMaxCount?`、`supportsText?`、`supportsWebPageWithMaxCount?`、`supportsWebUrlWithMaxCount?`。数量设为 0 表示不接收该类内容；`supportsText` 默认 false。
- `IntentFilter` 字段包含 `action`、`category`（Android 默认 category）、`data` 和 `filters`；`MultiIntentFilter` / `SingleIntentFilter` 按 action 类型区分多份 / 单份 share intent。
- `ShareAction` 是 `SingleShareAction \| MultiShareAction`。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐包 | `expo-sharing ~57.0.21` | `~56.0.26` |
| Web 限制、入站分享实验边界、config plugin、API / payload 类型 | 与 v56 页面一致 | 与 Latest 页面一致 |
| 官方页脚 Next | SMS | SMS |

## 官方源页代码主题覆盖

- 安装命令：覆盖 npx、Yarn、pnpm、Bun。
- app config 插件：重写 iOS Share Extension activation rule 和 Android 单 / 多图 MIME intent 配置。
- incoming share 路由：重写 Expo Router `+native-intent.ts` 与 React Navigation `getInitialURL` / `subscribe` 拦截深链代码。
- 展示收到的图片：重写 `useIncomingShare` loading、解析结果、图片 URI 与布局示例。
- 源页没有 outgoing `shareAsync` runnable 块，本文补充等价示例解释对外分享；API 原有所有方法、payload / config plugin 字段均整理在表中。

**翻页：**[上一页：Expo SDK Server 服务端运行时与 API 路由](./198-Expo-SDK-Server.md) · [目录](./README.md) · [下一页：Expo SDK SMS](./200-Expo-SDK-SMS.md)
