# Expo SplashScreen 学习文档

## 文档解决的问题

`expo-splash-screen` 用于控制应用启动时显示的**原生启动屏**（Splash Screen），支持：

- Android
- iOS
- tvOS

它主要解决两个问题：

1. 配置启动屏的背景颜色、图片、暗色模式等原生外观。
2. 控制启动屏何时隐藏，以及隐藏时是否播放淡出动画。

默认情况下，应用准备好后，启动屏会自动隐藏。只有在必须等待字体、接口数据或其他资源加载完成时，才需要手动延迟隐藏。

> 本文对应 Expo 的“下一 SDK 版本”文档，而不是当前稳定版本。原文指出当前最新稳定文档为 SDK 56。实际项目应确认自己使用的 Expo SDK 版本，并查看对应版本的文档。

## React Web 开发者需要先理解的背景

### 启动屏不是普通 React 页面

在 React Web 中，首屏通常由 HTML、CSS 和 React 组件渲染。移动应用的启动屏不同：

1. 用户点击应用图标。
2. iOS 或 Android 先显示由原生工程提供的启动屏。
3. JavaScript 运行环境启动。
4. React Native 应用完成初始化并开始渲染。
5. 原生启动屏被隐藏，用户看到 React Native 界面。

因此，启动屏显示时，React 组件通常还没有完成加载。它不能被当作普通的 React 页面来随意更新。

### 什么是应用二进制文件

文档中的 app binary 可以理解为最终安装到设备上的应用包，例如：

- Android 的 APK 或 AAB
- iOS 的 IPA

启动屏的图片和背景颜色属于原生构建配置。修改这些配置后，通常需要重新构建应用，单纯刷新 JavaScript 代码不会生效。

### 什么是 Expo Go、开发构建和发布构建

- **Expo Go**：Expo 提供的通用开发客户端，用于快速运行项目，但它不是项目最终发布的独立应用。
- **Development build（开发构建）**：包含项目原生配置、面向开发调试的应用构建。
- **Release build（发布构建）**：接近用户最终安装版本的正式构建。
- **Standalone app（独立应用）**：拥有自己应用图标、原生配置和安装包的应用。

从 SDK 52 开始，由于 Expo 需要适配 Android 新版启动屏 API，Expo Go 和开发构建无法完整还原独立应用的启动屏效果：

- Expo Go 会显示应用图标，而不是项目配置的完整启动屏。
- 开发构建不会反映 config plugin 中设置的所有属性。

因此，启动屏最终效果必须在发布构建中验证。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-splash-screen

# yarn
yarn expo install expo-splash-screen

# pnpm
pnpm expo install expo-splash-screen

# bun
bun expo install expo-splash-screen
```

这里使用的是 `expo install`，它会根据当前 Expo SDK 版本选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用该库，还需要先安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

导入方式如下：

```tsx
import * as SplashScreen from 'expo-splash-screen';
```

## 默认用法

大多数应用不需要手动控制启动屏。应用准备完成后，启动屏会自动隐藏。

可以选择配置默认的隐藏动画：

```tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  return <Stack />;
}
```

这段代码表示：

- 隐藏动画持续 `1000` 毫秒。
- 使用淡出效果。
- `Stack` 是 Expo Router 提供的堆栈导航组件，不属于 `expo-splash-screen`。

`setOptions()` 只控制启动屏的隐藏动画，不负责配置启动屏图片和背景颜色。

## 延迟隐藏启动屏

### 适用场景

当应用必须先完成异步初始化，才能安全展示界面时，可以阻止启动屏自动隐藏。例如：

- 加载首屏必需的数据
- 加载字体或本地资源
- 恢复用户登录状态
- 读取影响根界面的持久化配置

文档强调，应当尽可能早地隐藏启动屏，不要把它当作长时间的加载页面。

### 推荐流程

```tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function doAsyncStuff() {
      try {
        // 执行必要的异步初始化
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    doAsyncStuff();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <Stack />;
}
```

完整流程是：

1. 在模块全局作用域调用 `preventAutoHideAsync()`。
2. React 根组件开始执行必要的异步初始化。
3. 初始化期间返回 `null`，避免提前显示不完整界面。
4. 无论初始化成功还是失败，都在 `finally` 中结束等待状态。
5. `isReady` 变为 `true` 后调用 `SplashScreen.hide()`。
6. 根组件渲染正式应用界面。

### 为什么必须尽早调用

文档明确建议：

```tsx
SplashScreen.preventAutoHideAsync();
```

应在模块的全局作用域调用，并且不需要 `await`。不要把它放进组件或 Hook 中，否则调用时可能已经太晚，启动屏已经被系统自动隐藏。

这类似于 React Web 中必须在首次渲染前完成的初始化配置，但移动端还涉及原生启动生命周期，因此时机更加严格。

### 为什么要保证异常时也能结束等待

示例将 `setIsReady(true)` 放在 `finally` 中。这意味着即使异步任务失败，应用也会继续隐藏启动屏，而不是永久停留在启动画面。

文档没有规定异步失败后应展示什么错误界面。实际项目需要自行设计错误状态。

## 使用 Config Plugin 配置外观

### Config Plugin 是什么

Config plugin 会在应用构建期间修改 Android 和 iOS 原生工程配置。

它与运行时 API 的职责不同：

- Config plugin：控制图片、背景颜色、暗色模式等原生外观。
- JavaScript API：控制何时隐藏，以及隐藏动画。

如果项目使用 Continuous Native Generation（CNG），推荐通过 config plugin 配置启动屏。CNG 会根据 Expo 应用配置生成或更新原生工程。

如果项目不使用 CNG，则需要手动配置原生工程。

文档明确指出：

- Config plugin 是推荐方案。
- 其他配置方式已经被视为旧方案。
- 旧方案未来会被移除。

### `app.json` 示例

```json
{
  "expo": {
    "plugins": [
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#232323",
          "image": "./assets/splash-icon.png",
          "dark": {
            "image": "./assets/splash-icon-dark.png",
            "backgroundColor": "#000000"
          },
          "imageWidth": 200
        }
      ]
    ]
  }
}
```

配置含义：

- 普通模式使用深灰色背景和 `splash-icon.png`。
- 设备处于暗色模式时，改用黑色背景和暗色版图片。
- 图片显示宽度设为 `200`。
- 图片路径相对于项目配置文件解析。

这些属性属于构建期配置，修改后需要重新构建应用二进制文件。

## Config Plugin 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `backgroundColor` | `#ffffff` | 启动屏背景颜色，使用十六进制颜色字符串 |
| `image` | `undefined` | 启动屏图片路径，通常使用应用图标或 Logo |
| `dark` | `undefined` | 设备处于暗色模式时使用的图片和背景配置 |
| `imageWidth` | `100` | 启动屏图片的显示宽度 |
| `android` | `undefined` | Android 平台专用配置对象 |
| `ios` | `undefined` | iOS 平台专用配置对象 |
| `resizeMode` | `undefined` | 图片在指定区域中的缩放方式 |
| `enableFullScreenImage_legacy` | `false` | 兼容旧版全屏启动图配置的临时选项，未来会被移除 |

### `dark`

类型为：

```ts
{
  backgroundColor: string;
  image: string;
}
```

用于根据设备的暗色模式显示另一套背景颜色和图片。

### `resizeMode`

可选值：

- `contain`：保持图片比例，完整显示图片，可能出现留白。
- `cover`：保持图片比例并填满区域，图片边缘可能被裁剪。
- `native`：使用原生方式处理图片尺寸。

API 属性说明中给出的默认值是 `contain`，而前面的 config plugin 配置表将默认值列为 `undefined`。原文没有进一步解释两处默认值差异，实际使用时不应据此推断不同平台的最终行为，需以项目对应 SDK 的构建结果为准。

### `enableFullScreenImage_legacy`

该选项用于从旧版全屏启动图配置迁移，并将在未来移除，不适合新项目作为长期方案。

原文的 config plugin 配置表称它仅用于 iOS，但后面的 Props API 区域将支持平台列为 Android、iOS 和 tvOS。原文存在表述不一致，本文不对其实际跨平台支持范围作额外推断。

## 平台专用配置

可以通过以下对象提供平台专用配置：

```json
{
  "android": {},
  "ios": {}
}
```

- `android` 的类型是 `Partial<AndroidSplashConfig>`。
- `ios` 的类型是 `Partial<IOSSplashConfig>`。
- `Partial` 是 TypeScript 工具类型，表示对象中的属性都可以省略。

当前文档没有展开列出 `AndroidSplashConfig` 和 `IOSSplashConfig` 的内部属性，因此不能仅根据本文确定所有平台专用选项。

## 旧版应用配置

文档还列出了以下应用配置入口：

- `splash`
- `android.splash`
- `ios.splash`

它们仍可用于配置 `expo-splash-screen`，但应优先使用 config plugin。旧方法被视为遗留方案，未来会被移除。

如果项目是已有的 React Native 原生项目，则需要按照 `expo-splash-screen` 仓库中的 bare React Native 安装说明，手动配置原生工程。当前文档没有列出这些原生修改步骤。

## 启动屏动画

### 内置淡出动画

```tsx
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
```

`SplashScreenOptions` 包含：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `duration` | `number` | `400` | 淡出动画时长，单位为毫秒 |
| `fade` | `boolean` | `false` | 是否使用淡出动画，文档标注该属性支持 iOS |

需要注意，`setOptions()` 方法本身被标记为支持 Android、iOS 和 tvOS，但 `fade` 属性的类型说明只标注了 iOS。原文没有说明其他平台是否忽略该属性。

### 自定义动画

如果内置淡出动画不能满足需求，可以参考 Expo 的 `with-splash-screen` 示例。

创建对应示例项目的命令是：

```sh
npx create-expo-app --example with-splash-screen
```

当前文档没有直接给出自定义动画的实现代码，只提供了示例项目入口。

## API 方法

### `SplashScreen.hide()`

```tsx
SplashScreen.hide();
```

立即隐藏原生启动屏。

返回值：

```ts
void
```

调用前必须确保应用已经有内容可以显示，否则启动屏消失后可能短暂出现空白页面。

### `SplashScreen.hideAsync()`

```tsx
await SplashScreen.hideAsync();
```

同样用于立即隐藏启动屏，返回：

```ts
Promise<void>
```

该方法仅为向后兼容而保留。新代码可以使用同步的 `hide()`。

### `SplashScreen.preventAutoHideAsync()`

```tsx
SplashScreen.preventAutoHideAsync();
```

阻止系统自动隐藏启动屏，使其保持显示，直到代码主动调用隐藏方法。

返回：

```ts
Promise<boolean>
```

文档的方法描述写的是保持到调用 `hideAsync()`，但 Usage 示例使用的是 `hide()`。结合两处内容可以确认，示例推荐的新写法是通过 `hide()` 结束等待，而 `hideAsync()` 是兼容旧代码的方法。

不要为了等待其 Promise 而延迟后续模块初始化。文档推荐在全局作用域直接调用，不使用 `await`。

### `SplashScreen.setOptions(options)`

```tsx
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
```

配置启动屏的默认隐藏动画行为，返回：

```ts
void
```

它不能修改图片、背景颜色或平台原生布局，这些内容需要通过构建期配置完成。

## 关键限制与坑点

### 开发环境不能代表最终效果

从 SDK 52 开始：

- Expo Go 不会完整展示项目的启动屏。
- 开发构建不会反映 config plugin 的全部属性。
- 必须通过发布构建检查最终效果。

这是本文最重要的测试限制。

### 过晚调用 `preventAutoHideAsync()`

如果在 `useEffect`、组件内部或其他较晚的阶段调用，启动屏可能已经自动隐藏，此后无法通过该调用恢复。

正确位置是应用入口或根布局模块的全局作用域。

### 过早调用 `hide()`

如果 React Native 界面尚未准备好就隐藏启动屏，用户可能短暂看到空白屏。

应当让“资源准备完成”和“正式界面可以渲染”使用同一个明确状态协调。

### 启动屏不应承担长时间加载

文档明确要求尽快隐藏启动屏。它用于遮挡应用初始化过程，而不是替代应用内的加载页。

**基于文档内容推导：** 如果某些数据可能加载很久，更合适的做法是先显示应用基础界面，再在 React Native 页面中展示加载状态，而不是一直保留原生启动屏。

### 配置修改需要重新构建

图片、背景颜色、暗色模式和平台配置由原生工程使用，无法通过 React 热更新或 Fast Refresh 验证最终结果。

### 遗留配置不适合作为新方案

以下方案存在淘汰风险：

- `splash`
- `android.splash`
- `ios.splash`
- `enableFullScreenImage_legacy`

新项目应优先使用 `expo-splash-screen` config plugin。

## React Web 开发者最容易误解的地方

### “应用准备好”不等于所有接口都请求完成

默认自动隐藏表示应用已经可以从原生启动屏切换到 React Native 内容，并不表示所有业务数据都已加载。

只有首屏必须依赖某项资源时，才需要手动阻止隐藏。

### `return null` 不会隐藏原生启动屏

在 Web React 中，组件返回 `null` 只是“不渲染 DOM”。在这里，它同样不会主动控制原生启动屏。

原生启动屏是否保留由以下调用决定：

```tsx
SplashScreen.preventAutoHideAsync();
```

是否隐藏则由以下调用决定：

```tsx
SplashScreen.hide();
```

### JavaScript 样式不能修改原生启动屏

不能像操作普通 React 组件一样，使用 `style`、CSS 或状态更新启动屏图片。启动屏外观需要写入 `app.json` 或其他 Expo 应用配置，并重新构建。

### 启动屏图片不等于响应式 Web 背景图

移动平台对启动屏有各自的系统规则。`imageWidth` 和 `resizeMode` 控制图片显示，但 Expo Go 和开发构建又不能完整模拟最终结果，因此不能只根据开发预览判断图片是否正确。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 默认依赖自动隐藏，只有确实存在首屏阻塞资源时才启用手动控制。
2. 将 `preventAutoHideAsync()` 放在根布局或应用入口模块的顶层。
3. 为初始化流程设置失败兜底，避免异常导致启动屏永久不消失。
4. 不要等待非首屏必需的全部接口；进入应用后再加载次要数据。
5. 修改 config plugin 后执行新的原生构建，不要只依赖 Fast Refresh。
6. 同时验证普通模式和暗色模式。
7. 至少在 Android 和 iOS 的发布构建中分别检查效果，因为平台原生行为可能不同。
8. 如果采用自定义动画，先研究官方 `with-splash-screen` 示例，不要把原生启动屏误当作普通 React Native 视图。

## 文档明确内容与推导内容

### 文档明确说明

- 启动屏默认会在应用准备好后自动隐藏。
- 可以通过 `preventAutoHideAsync()` 和 `hide()` 手动控制显示时间。
- `preventAutoHideAsync()` 应在全局作用域尽早调用，并且不建议等待。
- 启动屏应尽快隐藏。
- config plugin 是推荐配置方式。
- 旧版配置方式未来会被移除。
- Expo Go 和开发构建不能完整复现最终启动屏。
- 应在发布构建中测试最终效果。
- `hideAsync()` 是为向后兼容提供的方法。
- 自定义动画需要参考单独的官方示例。

### 基于文档内容推导

- 启动屏应只等待首屏必需资源，而不是全部业务数据。
- 长耗时任务更适合使用 React Native 应用内的加载界面。
- 启动准备状态应同时控制正式界面渲染与启动屏隐藏，减少空白屏风险。
- 构建期配置和运行时 API 应被视为两套不同职责：前者负责外观，后者负责隐藏时机和动画。

## 当前文档未涉及

当前文档没有详细说明：

- Android 和 iOS 原生工程的手动配置步骤
- `AndroidSplashConfig` 与 `IOSSplashConfig` 的完整字段
- 如何构建 Android 或 iOS 发布版本
- 自定义启动动画的具体实现
- 启动资源加载超时机制
- 异步初始化失败后的错误页面设计
- 启动屏图片的推荐像素尺寸和文件格式
- 不同屏幕尺寸下的完整适配策略

这些内容不能仅根据当前文档确定，需要查阅对应的 Expo 指南、示例项目或原生安装文档。

## 总结

`expo-splash-screen` 同时提供两类能力：

- 通过 config plugin 配置原生启动屏外观。
- 通过运行时 API 控制启动屏隐藏时机和动画。

大多数应用应使用默认自动隐藏。只有首屏依赖关键异步资源时，才在全局作用域调用 `preventAutoHideAsync()`，并在正式界面可以渲染后调用 `hide()`。

对于没有移动端经验的 React Web 开发者，最关键的是认识到：启动屏属于 React Native 界面出现之前的原生阶段。它的外观需要重新构建应用才能生效，开发环境也不能完全代表用户看到的最终效果。

---

## 文档导航

- **上一页**：[speech](./208__speech.md)
- **下一页**：[sqlite](./210__sqlite.md)
