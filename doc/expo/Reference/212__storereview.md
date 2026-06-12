# Expo StoreReview：应用内评分与商店评论跳转

> 原文档修改日期：2026 年 1 月 15 日  
> 包名：`expo-store-review`  
> 支持平台：Android、iOS、Expo Go

> **版本提示：**原文档属于下一个 Expo SDK 版本的未发布文档。原文明确指出，当前最新稳定文档对应 **SDK 56**。实际项目应优先查看与项目 Expo SDK 版本匹配的文档。

## 文档解决的问题

`expo-store-review` 用于在 React Native / Expo 应用中调用操作系统提供的原生评分能力，让用户尽量不离开应用就可以为应用评分。

它封装了两个平台的原生 API：

- Android 5.0 及以上：`ReviewManager`
- iOS：`SKStoreReviewController`

文档主要说明：

- 如何安装并导入 `expo-store-review`
- 应该在什么时机请求用户评分
- 如何判断当前设备能否发起评分流程
- 如何调用系统原生评分界面
- 如何直接跳转到 App Store 或 Play Store 的评论页面
- 需要配置哪些商店地址
- 请求失败时可能出现的错误码

## 阅读前需要理解的背景

### 应用内评分不等于自定义弹窗

这里的“应用内评分”不是使用 React Native 自己绘制一个包含星星的 Modal，而是请求 iOS 或 Android 显示其系统级评分界面。

可以将它类比为 Web 中调用浏览器提供的原生能力：

```ts
await StoreReview.requestReview();
```

应用只是发出请求，最终是否展示以及以什么形式展示，受操作系统和应用商店机制控制。

### Expo 与 React Native 原生模块

`expo-store-review` 是一个 Expo 原生模块。JavaScript 代码通过它调用 iOS 和 Android 的原生 API。

对于 React Web 开发者，需要注意：

- 它不是浏览器 API。
- 它的主要能力只存在于 Android 和 iOS。
- React 组件渲染成功不代表原生评分功能一定可用。
- 调用结果会受到系统版本、应用分发方式和项目配置影响。

### 评分与撰写评论是两个流程

文档涉及两类操作：

1. **请求应用内评分**  
   调用 `StoreReview.requestReview()`，尝试显示系统原生评分界面。

2. **跳转到商店撰写评论**  
   使用 React Native 的 `Linking.openURL()` 打开 App Store 或 Play Store 页面。

第二种操作会离开当前应用或切换到商店应用，不属于应用内评分。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-store-review

# yarn
yarn expo install expo-store-review

# pnpm
pnpm expo install expo-store-review

# bun
bun expo install expo-store-review
```

`expo install` 会根据当前 Expo SDK 版本选择兼容的依赖版本。它与直接执行 `npm install` 的主要区别是会考虑 Expo SDK 的版本兼容关系。

如果项目是已有的 React Native 原生项目，而不是由 Expo 项目模板创建的，那么需要先在项目中安装并配置 `expo`，使该项目能够使用 Expo Modules。

## 导入 API

```ts
import * as StoreReview from 'expo-store-review';
```

这里采用命名空间导入，之后通过 `StoreReview.requestReview()`、`StoreReview.hasAction()` 等方式调用 API。

## 正确选择评分时机

原文要求遵循：

- Apple 的 Ratings and Reviews Human Interface Guidelines
- Android 的 In-App Review Guidelines

具体包括以下规则。

### 不要将评分请求直接绑定到按钮

不要设计这样的交互：

```tsx
<Button
  title="给应用评分"
  onPress={() => StoreReview.requestReview()}
/>
```

文档建议在用户完成应用中的某个代表性操作后发起评分请求，例如：

- 完成一次核心任务
- 达成一个阶段目标
- 成功使用某项主要功能

评分请求应该结合自然的使用节点，而不是由一个普通按钮直接触发。

### 不要频繁请求

应用不能在用户每次完成操作后都请求评分。频繁打断用户既不符合平台指导原则，也会损害用户体验。

### 不要在时间敏感的操作中请求

例如用户正在导航、处理即时任务或执行不能被打断的流程时，不应展示评分请求。

评分请求可能带来系统界面切换，因此应选择用户当前任务已经结束的时机。

### 不要预先询问用户

不要在展示系统评分卡片之前或期间询问类似问题：

- “你喜欢这个应用吗？”
- “你愿意给五星好评吗？”
- “满意的话可以评分吗？”

应用不应通过前置问题筛选用户，也不应在系统评分界面出现时施加引导。

## 判断评分能力

文档提供了两个容易混淆的判断方法：

- `StoreReview.isAvailableAsync()`
- `StoreReview.hasAction()`

### `StoreReview.isAvailableAsync()`

```ts
const available = await StoreReview.isAvailableAsync();
```

返回类型：

```ts
Promise<boolean>
```

它判断当前平台是否具备使用 `requestReview()` 的原生能力。

不同平台的结果如下：

| 平台 | 返回条件 |
| --- | --- |
| iOS | 除非应用通过 TestFlight 分发，否则返回 `true` |
| Android | Android 5.0 及以上返回 `true` |
| Web | 始终返回 `false` |

TestFlight 是 Apple 用于分发测试版 iOS 应用的平台。根据文档，通过 TestFlight 安装的应用不被视为可使用该评分能力。

### `StoreReview.hasAction()`

```ts
if (await StoreReview.hasAction()) {
  await StoreReview.requestReview();
}
```

返回类型：

```ts
Promise<boolean>
```

它判断 `requestReview()` 是否能够把用户带入某种商店评分流程。

如果同时满足以下条件，它会返回 `false`：

- 原生商店评分能力不可用
- `app.json` 中没有配置对应的商店 URL

因此，`hasAction()` 检查的范围比单纯检查原生能力更广：即使原生评分界面不可用，只要存在可用的商店地址，仍可能有后备操作。

### 两个方法的区别

| 方法 | 关注点 |
| --- | --- |
| `isAvailableAsync()` | 当前平台是否支持原生应用内评分能力 |
| `hasAction()` | `requestReview()` 是否存在任何可执行的评分路径 |

**基于文档内容推导：**如果业务目标是安全地调用 `requestReview()`，优先使用 `hasAction()` 作为调用前判断更贴近最终行为；如果需要区分设备是否支持原生评分能力，则使用 `isAvailableAsync()`。

## 请求应用内评分

```ts
await StoreReview.requestReview();
```

返回类型：

```ts
Promise<void>
```

在理想情况下，它会显示系统原生评分弹窗，用户可以选择星级并将评分提交到应用商店，不需要离开当前应用。

如果 Android 版本低于 5.0，该方法会尝试取得已配置的商店 URL，并将用户跳转到该地址。

### 推荐的基本调用方式

```ts
import * as StoreReview from 'expo-store-review';

async function requestStoreReview() {
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
  }
}
```

调用这个函数的时机应由业务流程决定，例如用户完成一次核心操作之后，而不是直接绑定在“评分”按钮上。

需要注意，`Promise<void>` 只表示该异步调用没有业务返回值。文档没有提供用于确认以下结果的 API：

- 系统评分界面是否实际展示
- 用户是否选择了星级
- 用户最终提交了多少星
- 用户是否取消了操作

因此，不能根据 `requestReview()` 完成就认定用户已经评分。

## 获取配置中的商店地址

```ts
const url = StoreReview.storeUrl();
```

返回类型：

```ts
string | null
```

该方法通过 Expo `Constants` API 获取当前平台的商店地址：

| 平台 | 读取的配置 |
| --- | --- |
| iOS | `Constants.expoConfig.ios.appStoreUrl` |
| Android | `Constants.expoConfig.android.playStoreUrl` |
| Web | 返回 `null` |

对应配置位于 Expo 应用配置中，通常是 `app.json`，也可能由项目使用的动态 Expo 配置文件生成。

概念上的配置结构如下：

```json
{
  "expo": {
    "ios": {
      "appStoreUrl": "iOS App Store 地址"
    },
    "android": {
      "playStoreUrl": "Android Play Store 地址"
    }
  }
}
```

原文档没有提供这些 URL 的完整配置示例，也没有说明动态配置文件的具体写法。

商店 URL 不只是方便业务代码读取，还可能在原生评分能力不可用时作为 `requestReview()` 的后备跳转路径。

## 跳转到商店撰写评论

如果需要让用户明确进入“撰写评论”页面，可以使用 React Native 的 `Linking` API 打开商店链接。

`Linking.openURL()` 类似于 Web 中给 `window.location` 设置外部 URL，但在移动端还可以通过自定义 URL Scheme 直接唤起其他应用。

### Android

Android 没有与 iOS `action=write-review` 完全等价的重定向参数，但可以使用 `showAllReviews=true` 打开 Play Store 的评论区域。

```ts
const androidPackageName = 'host.exp.exponent';

Linking.openURL(
  `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
);

Linking.openURL(
  `market://details?id=${androidPackageName}&showAllReviews=true`
);
```

两种地址的区别：

| 地址形式 | 行为 |
| --- | --- |
| `https://play.google.com/...` | 先按网页地址打开，在 Android 上可重定向到 Play Store |
| `market://details?...` | 使用 Android 商店 URL Scheme，直接尝试打开 Play Store |

`androidPackageName` 是 Android 应用包名，作用类似 Web 应用的唯一部署标识。实际项目必须替换为自己的 Android 包名。

### iOS

iOS 可以使用 `action=write-review` 进入 App Store 的“Write a Review”页面。

```ts
const itunesItemId = 982107779;

Linking.openURL(
  `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`
);

Linking.openURL(
  `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${itunesItemId}?action=write-review`
);
```

两种地址的区别：

| 地址形式 | 行为 |
| --- | --- |
| `https://apps.apple.com/...` | 通过网页地址打开，在 iOS 上可重定向到 App Store |
| `itms-apps://...` | 使用 Apple 的 URL Scheme，直接尝试打开 App Store |

`itunesItemId` 是应用在 App Store 中的数字 ID，不是应用的 iOS Bundle Identifier。实际项目必须替换为自己应用的 App Store ID。

文档没有说明当目标商店应用不可用或 URL 无法打开时应该如何处理。

## 错误处理

文档列出的错误码为：

### `ERR_STORE_REVIEW_FAILED`

当商店评分请求没有成功时，会出现此错误。

可以使用 `try...catch` 捕获调用失败：

```ts
try {
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
  }
} catch (error) {
  // 记录错误，但不要立即反复请求评分
}
```

原文没有进一步列出该错误的具体触发条件，也没有提供错误对象结构或恢复策略。

## 限制与容易踩坑的地方

### Web 平台不支持

虽然代码可以位于跨平台 React Native 项目中，但在 Web 上：

- `isAvailableAsync()` 返回 `false`
- `storeUrl()` 返回 `null`
- 文档没有将 Web 列为相关方法的支持平台

这与 React Web 中通过浏览器打开一个评分页面不是同一套能力。Web 场景需要单独设计外部链接流程。

### TestFlight 环境不可作为正常评分能力验证环境

在 iOS TestFlight 分发环境中，`isAvailableAsync()` 返回 `false`。不能因为 TestFlight 测试时没有评分能力，就直接判断正式 App Store 版本也不可用。

### `requestReview()` 不保证显示评分弹窗

原文使用了“在理想情况下”这一限定，说明调用 API 与实际展示系统弹窗不是同一件事。应用不能依赖评分弹窗一定出现，也不应把它作为完成业务流程的必要步骤。

### 商店 URL 配置会影响后备流程

当原生评分能力不可用时，`requestReview()` 是否还有其他评分路径，可能取决于 `app.json` 中是否配置了：

- `ios.appStoreUrl`
- `android.playStoreUrl`

缺少这些配置时，`hasAction()` 可能返回 `false`。

### 直接跳转需要真实的应用标识

文档示例中的以下值只是示例：

```ts
const androidPackageName = 'host.exp.exponent';
const itunesItemId = 982107779;
```

正式项目需要替换为自己的 Android 包名和 App Store 数字 ID，否则会打开错误的商店页面。

### 原文当前未涉及的内容

当前文档没有说明：

- 系统控制评分弹窗展示频率的具体规则
- 如何判断用户是否已经评分
- 如何获取用户提交的星级
- 如何在模拟器中测试评分流程
- App Store URL 和 Play Store URL 的完整配置示例
- 商店 URL 打开失败时的处理方式
- `ERR_STORE_REVIEW_FAILED` 的详细错误对象结构
- 是否需要额外修改 iOS 或 Android 原生工程文件

对这些内容不能仅根据本文档作出确定结论。

## 面向实际开发的使用方式

一个合理的业务流程可以是：

1. 用户完成应用的核心操作。
2. 应用根据自己的业务条件判断是否适合发起评分。
3. 调用 `StoreReview.hasAction()` 判断是否存在可执行路径。
4. 条件满足时调用 `StoreReview.requestReview()`。
5. 捕获调用错误，但不因为失败而立即重复请求。
6. 不将评分结果作为业务流程是否成功的判断依据。

示例：

```ts
import * as StoreReview from 'expo-store-review';

export async function requestReviewAfterCoreAction() {
  try {
    const hasReviewAction = await StoreReview.hasAction();

    if (!hasReviewAction) {
      return;
    }

    await StoreReview.requestReview();
  } catch (error) {
    console.error('Store review request failed:', error);
  }
}
```

其中，“用户是否刚完成核心操作”“近期是否已经请求过评分”等业务条件，需要由应用自行管理。

**基于经验建议：**可以在本地存储中记录最近一次请求评分的时间或已触发次数，以避免频繁打扰用户。该策略不是当前文档规定的 API 行为，具体规则应结合 Apple 和 Android 的最新平台指南制定。

## React Web 开发者的关键认知转换

在 React Web 中，开发者通常能够控制 Modal 是否显示，并能监听用户点击结果。`expo-store-review` 的工作方式不同：

- 你只能向原生系统发出评分请求。
- 系统评分界面不是 React 组件树的一部分。
- 应用不能完全控制它是否显示。
- API 不会返回用户的评分内容。
- Android、iOS、Web 的行为不同，必须进行平台能力判断。
- 应用商店地址属于原生应用发布配置，不是普通网站路由。

因此，应把 `requestReview()` 视为一个不保证产生可见结果的系统级辅助操作，而不是一个能够精确控制和追踪结果的业务表单。

## 总结

`expo-store-review` 封装了 Android 和 iOS 的原生应用内评分能力。核心方法包括：

- `isAvailableAsync()`：判断原生评分能力是否可用
- `hasAction()`：判断是否存在任何可执行的评分路径
- `requestReview()`：请求系统发起评分流程
- `storeUrl()`：读取 Expo 配置中的应用商店地址

实际使用时，最重要的不是简单调用 API，而是选择合适的触发时机、避免频繁打扰、正确配置商店 URL，并接受系统评分界面不一定展示且无法获知用户评分结果这一限制。

---

## 文档导航

- **上一页**：[status bar](./211__status-bar.md)
- **下一页**：[symbols](./213__symbols.md)
