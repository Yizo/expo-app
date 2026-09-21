# 205｜Expo SDK StoreReview 应用内评分

**翻页：**[上一页：Expo SDK StatusBar 状态栏](./204-Expo-SDK-StatusBar.md) · [目录](./README.md) · [下一页：Expo SDK Symbols 原生符号](./206-Expo-SDK-Symbols.md)

**官方页面：**[StoreReview · Latest](https://docs.expo.dev/versions/latest/sdk/storereview/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/storereview/)

**版本与平台：**Latest 推荐 `expo-store-review ~57.0.3`；SDK v56.0.0 推荐 `~56.0.4`。此库在 Android 和 iOS 调用应用内评价能力，并包含在 Expo Go 中。

## 应用内评价流程

`expo-store-review` 让 iOS 的 `SKStoreReviewController` 和 Android 5.0+ 的 `ReviewManager` 在当前应用内发起商店评价。系统可能自行决定是否展示评价界面；调用成功不代表用户一定看到弹窗或提交了评分。

安装与当前 Expo SDK 兼容的包：

```sh
npx expo install expo-store-review
yarn expo install expo-store-review
pnpm expo install expo-store-review
bun expo install expo-store-review
```

使用评价提示时应遵循系统平台的人机界面指南：不要把 `requestReview()` 直接绑在按钮上，可在用户完成一项有意义的应用内操作后考虑提示；不要频繁打扰用户，不要在导航等时效性操作期间提示，也不要在展示评分按钮或卡片前/期间先向用户提问。

## 跳转到商店“撰写评价”页面

原生应用内评价不可用或用户主动选择撰写评价时，可以用 React Native 的 `Linking.openURL()` 打开商店评价链接。Expo 文档使用 Expo Go 对应的示例包名与 App Store ID；实际应用要换成自己的商店标识。

### Android Google Play

Android 没有和 iOS 完全相同的“撰写评价”重定向方式，可在 Play Store 页面加 `showAllReviews=true` 展示全部评价。可用浏览器链接，或用 `market://` scheme 直接打开 Play Store：

```tsx
import { Linking } from 'react-native';

const androidPackageName = 'host.exp.exponent';

// 在浏览器中打开；Android 上会跳转到 Play Store。
Linking.openURL(
  `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
);

// 直接打开 Android Play Store。
Linking.openURL(`market://details?id=${androidPackageName}&showAllReviews=true`);
```

### iOS App Store

在 App Store URL 上增加 `action=write-review`，可以直接打开对应 App 的“撰写评价”页面：

```tsx
import { Linking } from 'react-native';

const itunesItemId = 982107779;

// 在浏览器中打开；iOS 上会跳转到 App Store。
Linking.openURL(`https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`);

// 使用 iOS App Store scheme 直接打开。
Linking.openURL(
  `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${itunesItemId}?action=write-review`
);
```

## API

```ts
import * as StoreReview from 'expo-store-review';
```

| 方法 | 返回类型 | 作用 / 平台说明 |
| --- | --- | --- |
| `StoreReview.hasAction()` | `Promise<boolean>` | 检查 `requestReview()` 是否具备把用户导向评价流程的能力。若 app config 未配置商店 URL 且原生评价能力不可用，会返回 `false`。 |
| `StoreReview.isAvailableAsync()` | `Promise<boolean>` | 查询平台是否支持 `requestReview()`：iOS 除 TestFlight 外为 `true`；Android 5.0+ 为 `true`；Web 为 `false`。 |
| `StoreReview.requestReview()` | `Promise<void>` | 请求显示原生评价界面。Android 低于 5.0 时会尝试取得商店 URL 并跳转。 |
| `StoreReview.storeUrl()` | `string \| null` | 从 Expo Constants 读取商店 URL；iOS 使用 `ios.appStoreUrl`，Android 使用 `android.playStoreUrl`，Web 返回 `null`。 |

`hasAction()` 的官方示例：

```ts
if (await StoreReview.hasAction()) {
  // 这里可以调用 StoreReview.requestReview()
}
```

`requestReview()` 可能因设备或商店策略而不显示评价界面。若要打开商店评论页，请先按目标平台选择对应 `Linking.openURL()` scheme。

## 错误

| 错误码 | 含义 |
| --- | --- |
| `ERR_STORE_REVIEW_FAILED` | 商店评价请求未成功。 |

## 新手名词解释

- **In-app review（应用内评价）：**由 App Store / Google Play 原生界面在应用内显示的评分请求，不需要先离开应用。
- **ReviewManager：**Android 5.0+ 的应用内评价 API。
- **`SKStoreReviewController`：**iOS 提供的应用内评价 API。
- **Deep link / URL scheme：**用 URL 指向某个应用或系统页面；`market://`、`itms-apps://` 是打开应用商店的 scheme。
- **TestFlight：**Apple 的测试分发服务；本页说明 iOS 通过 TestFlight 分发的应用上 `isAvailableAsync()` 会返回 `false`。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令。
- Usage / Write reviews：保留 Android 两种 Play Store 链接和 iOS 两种 App Store 链接的完整代码。
- API：覆盖导入语句、`hasAction()` 示例、`isAvailableAsync()` 的平台条件、`requestReview()` 与 `storeUrl()`。
- Error codes：列出 `ERR_STORE_REVIEW_FAILED`。
- Latest 与 SDK v56 的功能说明、方法和 Next 顺序一致；包版本分别为 `~57.0.3` / `~56.0.4`。

**翻页：**[上一页：Expo SDK StatusBar 状态栏](./204-Expo-SDK-StatusBar.md) · [目录](./README.md) · [下一页：Expo SDK Symbols 原生符号](./206-Expo-SDK-Symbols.md)
