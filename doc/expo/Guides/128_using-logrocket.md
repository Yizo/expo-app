# 在 Expo 应用中使用 LogRocket

## 文档解决的问题

LogRocket 用于录制用户会话并识别应用使用过程中的问题。它可以按 EAS Update ID 过滤会话，还能连接 EAS Dashboard，让开发者从部署和更新页面快速查看最近会话。

适合需要 Session Replay、错误监控，以及希望把用户行为与具体原生部署或 OTA 更新关联起来的 Expo 项目。

## 安装与原生配置

安装 SDK 和 Expo 构建属性插件：

```sh
npx expo install @logrocket/react-native expo-build-properties
```

在 app config 中加入两个 config plugin，并把 Android 最低 SDK 设为 25：

```json
{
  "plugins": [
    [
      "expo-build-properties",
      {
        "android": {
          "minSdkVersion": 25
        }
      }
    ],
    "@logrocket/react-native"
  ]
}
```

Config plugin 会在生成/构建原生工程时修改原生配置，并不是 Webpack/Vite 插件。`minSdkVersion: 25` 也意味着应用不再支持低于 Android API 25 的设备。

## 初始化 LogRocket

在顶层文件初始化，例如 Expo Router 项目的 `src/app/_layout.tsx`：

```tsx
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import LogRocket from '@logrocket/react-native';

const App = () => {
  useEffect(() => {
    LogRocket.init('<App ID>', {
      updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
      expoChannel: Updates.channel,
    });
  }, []);
};
```

把 `<App ID>` 替换为 LogRocket 设置页面中的 App ID。

这里的两个更新字段用于建立发布上下文：

- `updateId`：当前是下载的 EAS Update 时记录其 ID；若运行安装包内置版本则传 `null`。
- `expoChannel`：记录当前更新 channel，便于按发布通道分析会话。

## 连接 EAS Dashboard

1. 在 Expo 的 Account settings > Overview > Connections 中连接 LogRocket 账号。
2. 在 Expo 项目的 Project settings > General 中连接对应 LogRocket project。
3. 连接后，Native Deployments 和 Updates 页面会出现 **View on LogRocket**，并展示最近会话。

账号连接与项目连接是两个步骤：前者完成服务授权，后者确定当前 Expo 项目对应哪个 LogRocket 项目。

## 限制、坑点与实践建议

- 初始化应位于应用顶层，否则早期会话和错误可能无法进入同一录制上下文。
- `isEmbeddedLaunch` 不是“是否离线”，而是判断本次启动使用安装包内置更新还是服务器下载的更新。
- 修改 config plugin 或 Android `minSdkVersion` 属于原生构建配置变化，不能只靠热重载验证。
- 文档没有明确说明 Expo Go 支持情况、development build 命令、iOS 额外配置、隐私脱敏、采样策略和用户身份绑定。
- **基于文档内容推导**：排查某次 OTA 更新的问题时，应同时按 `updateId` 和 `expoChannel` 过滤，避免把内置版本或其他通道的会话混入分析。
- **基于经验建议**：启用会话录制前应核对敏感输入和隐私政策；当前文档未给出相关配置细节。

