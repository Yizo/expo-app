# 202｜Expo SDK SplashScreen 启动画面

**翻页：**[上一页：Expo SDK Speech 文本转语音](./201-Expo-SDK-Speech.md) · [目录](./README.md) · [下一页：Expo SDK SQLite 本地数据库](./203-Expo-SDK-SQLite.md)

**官方页面：**[SplashScreen · Latest](https://docs.expo.dev/versions/latest/sdk/splash-screen/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/splash-screen/)

**版本与平台：**Latest 推荐 `expo-splash-screen ~57.0.9`；SDK v56.0.0 推荐 `~56.0.15`。Android、iOS、tvOS 提供原生启动画面控制。Expo Go 和开发构建不能完整模拟最终发布包的启动画面，应使用 release build 检查实际效果。

## 启动画面何时出现

启动画面（splash screen）是应用启动、React Native 界面尚未准备好时系统展示的原生画面。通常 Expo 会在应用准备好后自动隐藏；一般项目无需调用额外 API。只有加载关键资源（例如字体或本地配置）时需要延迟进入应用，才手动控制显示时间，并尽快隐藏它。

从 SDK 52 起，Android 启动画面 API 的变化使 Expo Go 和开发构建不能完整还原独立发布包的显示效果：Expo Go 会显示应用图标，开发构建也可能不会反映配置插件的全部属性。因此发布前要用 release build 验证。另见官方[启动图制作指南](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)。

## 安装和官方示例工程

为当前 Expo SDK 安装兼容版本（选择项目使用的包管理器）：

```sh
npx expo install expo-splash-screen
yarn expo install expo-splash-screen
pnpm expo install expo-splash-screen
bun expo install expo-splash-screen
```

也可从官方 `with-splash-screen` 示例创建项目：

```sh
npx create-expo-app --example with-splash-screen
yarn create expo-app --example with-splash-screen
pnpm create expo-app --example with-splash-screen
bun create expo --example with-splash-screen
```

在已有的纯 React Native 项目中使用时，还需要先安装并配置 `expo`。

## 普通用法：设置淡出动画

多数应用使用默认自动隐藏即可。若要设置启动画面的淡出动画，可调用 `SplashScreen.setOptions()`。

### Expo Router：`app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// 设置动画选项（可选）。
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  return <Stack />;
}
```

### 不使用 Expo Router：`App.tsx`

```tsx
import { Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';

// 设置动画选项（可选）。
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>SplashScreen Demo! 👋</Text>
      <Entypo name="rocket" size={30} />
    </View>
  );
}
```

`duration` 是淡出时长（毫秒）。`fade` 在 iOS 控制是否淡出；平台支持和默认值见后面的类型表。自定义复杂动画可参考[官方 with-splash-screen 示例](https://github.com/expo/examples/tree/master/with-splash-screen)。

## 等资源准备好后再隐藏

加载首屏必需资源时，可以阻止自动隐藏并在加载完成后主动隐藏。`preventAutoHideAsync()` 应放在模块全局作用域直接调用，不要等到组件或 Hook 内才调用，也不需要 `await`；否则可能晚于系统自动隐藏。

### Expo Router：`app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// 在资源加载期间保持启动画面可见。
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function doAsyncStuff() {
      try {
        // 在这里加载应用启动所需的资源。
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

### 不使用 Expo Router：`App.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import * as SplashScreen from 'expo-splash-screen';

// 在资源加载期间保持启动画面可见。
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function doAsyncStuff() {
      try {
        // 在这里加载应用启动所需的资源。
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
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>SplashScreen Demo! 👋</Text>
      <Entypo name="rocket" size={30} />
    </View>
  );
}
```

两个入口都用 `isReady` 表示启动资源是否准备完成；未就绪时返回 `null`，让原生启动画面继续覆盖界面。Router 示例用同步 `hide()`，普通 `App.tsx` 示例用兼容旧代码的 `hideAsync()`。界面尚未准备好就隐藏启动画面，可能短暂露出空白。

## 使用 config plugin 配置图片和背景

推荐用 `expo-splash-screen` config plugin 配置需要写入原生项目的属性。Config plugin（配置插件）会在 Expo 生成 iOS / Android 原生项目时修改配置；这类属性不能只靠 JavaScript 在运行时更改，修改后要重新生成并构建原生二进制文件。若项目不使用 CNG（Continuous Native Generation，连续原生生成），则需按库的原生安装说明手动配置。旧配置方式已标记为 legacy，未来会移除。

下面是在 `app.json` 中的官方配置示例。JSON 不允许数组末尾多余逗号；示例保留全部配置值并采用合法 JSON 格式：

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

### 插件属性

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `backgroundColor` | `#ffffff` | 启动画面背景的十六进制颜色。 |
| `image` | 无 | 启动画面图片路径，通常放应用图标或品牌标志。 |
| `enableFullScreenImage_legacy` | `false` | 仅 iOS；兼容旧的全屏启动图，属于过渡属性，未来会移除。 |
| `dark` | 无 | 深色模式配置对象，可设置 `image` 和 `backgroundColor`。 |
| `imageWidth` | `100` | 启动图宽度。 |
| `android` | 无 | Android 专属启动画面配置对象。 |
| `ios` | 无 | iOS 专属启动画面配置对象。 |
| `resizeMode` | 插件表未设置 | 图片如何适配由 `imageWidth` 确定的区域：`contain`、`cover` 或 `native`。 |

## API

```ts
import * as SplashScreen from 'expo-splash-screen';
```

### 配置属性

| 属性 | 类型 | 默认值 / 说明 |
| --- | --- | --- |
| `android` | `Partial<AndroidSplashConfig>` | Android 平台配置。 |
| `backgroundColor` | `string` | Android、iOS、tvOS；默认 `"#ffffff"`。 |
| `dark` | `{ backgroundColor: string; image: string }` | 深色模式属性。 |
| `enableFullScreenImage_legacy` | `boolean` | 默认 `false`；旧版全屏图迁移开关。 |
| `image` | `string` | 启动画面显示的图片路径。 |
| `imageWidth` | `number` | 默认 `100`；图片宽度。 |
| `ios` | `Partial<IOSSplashConfig>` | iOS 平台配置。 |
| `resizeMode` | `'contain' \\| 'cover' \\| 'native'` | 默认 `'contain'`；图片缩放 / 裁剪方式。 |

### 方法

| 方法 | 返回类型 | 作用 |
| --- | --- | --- |
| `SplashScreen.hide()` | `void` | 立即隐藏原生启动画面；隐藏前应确保界面已准备好。 |
| `SplashScreen.hideAsync()` | `Promise<void>` | 立即隐藏启动画面；为向后兼容保留。 |
| `SplashScreen.preventAutoHideAsync()` | `Promise<boolean>` | 阻止自动隐藏，直到调用隐藏方法。建议在全局作用域调用且不等待返回值。 |
| `SplashScreen.setOptions(options)` | `void` | 设置启动画面的默认淡出动画。 |

`preventAutoHideAsync()` 的最小用法（官方示例）：

```tsx
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  // ...
}
```

单独设置动画的示例：

```ts
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
```

### `SplashScreenOptions`

| 字段 | 类型 | 默认值 / 平台 |
| --- | --- | --- |
| `duration` | `number` | 淡出时长，单位毫秒；默认 `400`。 |
| `fade` | `boolean` | iOS 专属；是否淡出；默认 `false`。 |

## 新手名词解释

- **原生启动画面：**在 JavaScript 应用界面启动前由 iOS / Android 系统绘制的过渡页，因此部分属性需要重新构建 App 才会生效。
- **Config plugin（配置插件）：**Expo 在生成原生工程时运行的配置脚本；适合设置启动图、背景色等编译期原生选项。
- **CNG：**Continuous Native Generation，Expo 根据 `app.json` 和插件配置生成 iOS / Android 原生项目的工作流。
- **Release build（发布构建）：**接近商店分发的应用构建；Expo Go / 开发构建无法完整代表它的启动画面效果。
- **自动隐藏与手动隐藏：**默认由系统在应用就绪后自动收起；调用 `preventAutoHideAsync()` 后，应用必须负责在合适时机调用 `hide()` 或 `hideAsync()`。

## 源页代码主题覆盖

- Installation：覆盖 npx、Yarn、pnpm、Bun 安装命令及四种 `with-splash-screen` 示例项目创建命令。
- Usage：覆盖 Expo Router 与普通 `App.tsx` 的动画设置，以及两种入口的延迟隐藏完整示例。
- Configuration：覆盖 `app.json` config plugin 示例、全部插件属性和独立的 `setOptions()` 动画示例。
- API / Methods：覆盖导入语句、`hide()`、`hideAsync()`、`preventAutoHideAsync()` 及其官方最小示例、`setOptions()`。
- Props / Types：覆盖 Android / iOS / 通用启动画面属性和 `SplashScreenOptions` 字段。
- Latest 与 SDK v56 的 API、配置主题和 Next 一致；包版本分别为 `~57.0.9` 与 `~56.0.15`，Expo Go / 开发构建的测试说明同样适用。

**翻页：**[上一页：Expo SDK Speech 文本转语音](./201-Expo-SDK-Speech.md) · [目录](./README.md) · [下一页：Expo SDK SQLite 本地数据库](./203-Expo-SDK-SQLite.md)
