# 164｜Expo SDK Font 字体加载

**翻页：**[上一页：Expo SDK Fingerprint 项目指纹](./163-Expo-SDK-Fingerprint.md) · [目录](./README.md) · [下一页：Expo SDK GlassEffect](./165-Expo-SDK-GlassEffect.md)

**官方页面：**[Font · Latest](https://docs.expo.dev/versions/latest/sdk/font/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/font/)

**版本与平台：**Latest 推荐 `expo-font ~57.0.4`；SDK v56.0.0 推荐 `~56.0.7`。文档支持 Android、iOS、tvOS、Web，并标记可在 Expo Go 中使用。

## 两种加载方式

自定义字体可以在原生构建时打包，也可以在运行时加载：

- **Config plugin（推荐给 Android / iOS）**：字体文件在 Prebuild / 原生构建阶段嵌入 App。应用启动后立即可用，不用等 JS 下载字体，适合固定随 App 发布的字体。更新配置后要重新构建原生 App。
- **运行时加载**：通过 `useFonts` hook 或 `loadAsync()` 加载本地 / 网络字体。适用于 Web、多语言按需下载或不能预先嵌入的场景。字体准备好前可保持 Splash Screen，加载失败时也要放行界面或显示错误状态。

安装：

```sh
npx expo install expo-font
```

## 原生构建时嵌入字体

在 `app.json` 配置 `expo-font` plugin。顶层 `fonts` 可指定字体文件路径；Android 可声明字体家族名称和 weight，iOS 使用字体文件中定义的家族名称。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/Body-Regular.ttf"],
          "android": {
            "fonts": [
              {
                "fontFamily": "Source Serif 4",
                "fontDefinitions": [
                  {
                    "path": "./assets/fonts/SourceSerif4-ExtraBold.ttf",
                    "weight": 800
                  }
                ]
              }
            ]
          },
          "ios": {
            "fonts": ["./assets/fonts/SourceSerif4-ExtraBold.ttf"]
          }
        }
      ]
    ]
  }
}
```

| plugin 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `fonts` | `[]` | 字体定义数组，路径相对项目根目录。Android 默认以文件名作为 family；iOS 从字体文件元数据读取 family，可能与文件名不同。 |
| `android.fonts` | `{}` | Android 字体定义；对象形式可将字体文件组合成自定义 family，并指定 weight 等定义。 |
| `ios.fonts` | `{}` | iOS 要嵌入的字体文件路径数组；family 由字体文件定义。 |

手动维护现有原生工程时，Expo 页面建议将 Android 字体放入 `android/app/src/main/assets/fonts`；iOS 需按原生工程方式加入字体资源。想确认设备实际注册的 `fontFamily` 名称，可用 `Font.getLoadedFonts()` 查询。

## 运行时加载字体

`useFonts(fontMap)` 返回 `[loaded, error]`。加载过程中不要立刻渲染依赖自定义字体的文本；加载完成后显示 UI，加载失败时同样应继续或报告错误，避免无限停留在空白页。示例用 Splash Screen API 隐藏启动画面，并在完成或出错时结束等待：

```tsx
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }}>Inter Black</Text>
      <Text style={{ fontSize: 30 }}>Platform Default</Text>
      {error ? <Text>自定义字体加载失败</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

`fontFamily` 需要使用传给 `useFonts` 的 map key（本例为 `Inter-Black`），它不一定等于磁盘文件名或字体内部 family。字体 map 动态变化时，`useFonts` 不会自动重新加载新 map；新增字体应在加载配置时一并声明。

## API

| API | 用途 |
| --- | --- |
| `useFonts(fontMap)` | React hook，加载一组字体，返回加载完成布尔值和错误值。源页在 API reference 又列出一段单独的 hook 示例，使用方法与上方 App 示例一致。 |
| `Font.getLoadedFonts()` | 同步返回当前已加载 / 构建时嵌入的字体 family 名称数组，可用于 `Text` 的 `fontFamily`。 |
| `Font.isLoaded(fontFamily)` | 同步判断指定 family 是否已经加载完成。 |
| `Font.isLoading(fontFamily)` | 同步判断指定 family 是否正在加载。 |
| `Font.loadAsync(fontFamilyOrFontMap, source?)` | 从静态或远程资源加载字体，返回加载完成的 Promise。Web 会生成共享 stylesheet 中的 `@font-face`，无需手写 CSS；通常优先使用 config plugin。 |
| `Font.renderToImageAsync(glyphs, options?)` | Android / iOS 将文本渲染为图片并返回元数据。 |

加载方法示意（给单独调用 `loadAsync` 的场景使用）：

```ts
import * as Font from 'expo-font';

async function loadBrandFont() {
  try {
    await Font.loadAsync({
      'Brand-Regular': require('./assets/fonts/Brand-Regular.ttf'),
    });
    return Font.isLoaded('Brand-Regular');
  } catch (error) {
    console.error('字体加载失败', error);
    return false;
  }
}
```

## 把文字渲染成图片

`renderToImageAsync` 接受文字与渲染选项，返回本地图片 URI、dp 尺寸和像素缩放因子；此 API 只支持 Android / iOS。

```ts
import * as Font from 'expo-font';

const image = await Font.renderToImageAsync('Expo', {
  color: '#223344',
  fontFamily: 'Brand-Regular',
  lineHeight: 40,
  size: 32,
});

console.log(image.uri, image.width, image.height, image.scale);
```

`RenderToImageOptions` 字段：`color`（默认黑色）、`fontFamily`（默认系统字体）、`lineHeight`（dp）和 `size`（默认 24）。`RenderToImageResult` 含 `width`、`height`（dp）、`scale` 与 `uri`；将 dp 乘以 scale 可得到像素尺寸。

## 字体来源、Web 显示策略与服务端描述

`FontSource` 可以是 URL 字符串、Metro `require()` 返回的资源 ID、Expo `Asset` 或 `FontResource` 对象。后者可提供 `uri`、Web 专属 `display` / `testString`、以及默认样式字符串。`ServerFontResourceDescriptor` 是 Web 服务端渲染相关的资源描述联合：一类是 CSS style 内容（`css` / `id` / `type`），另一类是 font preload link（`href` / `as: 'font'` / `rel: 'preload'` 和可选 `crossOrigin`）。

Web 的 `FontDisplay` 对应 CSS `font-display`：

| 值 | 行为摘要 |
| --- | --- |
| `AUTO` | 交给浏览器 / 平台策略；浏览器一般会在字体载入前隐藏文本。默认值。 |
| `BLOCK` | 等自定义字体加载；失败时文字可能一直不可见。 |
| `FALLBACK` | 先短暂隐藏，超时后使用备用字体显示，并继续等待自定义字体。 |
| `OPTIONAL` | 与 FALLBACK 类似，但浏览器可根据网络或资源优先级决定是否加载自定义字体。 |
| `SWAP` | 立即用备用字体显示，加载成功后切换，通常更有利于首屏内容快速出现。 |

`display` 只影响 Web 生成的 CSS；原生平台忽略该项，运行时默认表现因设备而异。

## 常见错误码

| 错误码 | 含义 |
| --- | --- |
| `ERR_FONT_API` | `loadAsync` 参数无效。 |
| `ERR_FONT_SOURCE` | 字体资源类型不正确。 |
| `ERR_WEB_ENVIRONMENT` | 浏览器 `document` 不支持注入字体。 |
| `ERR_DOWNLOAD` | 字体资源下载失败。 |
| `ERR_FONT_FAMILY` | 字体 family 名称无效。 |
| `ERR_UNLOAD` | 字体尚未加载完成就尝试卸载。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-font ~57.0.4`，SDK v56 推荐 `~56.0.7`。
- 两版的 config plugin、`useFonts`、`loadAsync`、`renderToImageAsync`、Web `FontDisplay`、错误码和 Next 内容基本一致；Latest / v56 footer 均进入 GlassEffect。
- 安装时使用 `npx expo install expo-font`，由本地 SDK 决定依赖版本，不要直接照抄 Latest 推荐值覆盖 v56 项目。

## 源页代码主题覆盖

- Installation：覆盖 `expo-font` 的 Expo 安装命令。
- Config plugin：覆盖通用 `fonts`、Android 自定义 family / `fontDefinitions` / weight、iOS font paths 的 `app.json` 配置；说明路径、家族名和原生构建时机。
- Runtime usage：覆盖 `useFonts`、本地字体 `require`、SplashScreen 阻止自动隐藏、加载 / 错误后的展示状态、React Native Text 的 `fontFamily`。
- API 示例：覆盖单独 `useFonts` map 示例；列出 `getLoadedFonts`、`isLoaded`、`isLoading`、`loadAsync`、`renderToImageAsync` 行为，并给 `loadAsync` / 文本渲染原创用法。
- API types：覆盖 `RenderToImageOptions` / `Result`、`FontResource`、`FontSource`、`ServerFontResourceDescriptor`、全部 `FontDisplay` 策略和错误码。
- Latest / SDK v56 对照：标出版本推荐值并确认 Next 都是 GlassEffect。

**翻页：**[上一页：Expo SDK Fingerprint 项目指纹](./163-Expo-SDK-Fingerprint.md) · [目录](./README.md) · [下一页：Expo SDK GlassEffect](./165-Expo-SDK-GlassEffect.md)
