# Expo Font：字体加载、构建时嵌入与运行时使用

> 本文对应 Expo 下一 SDK 版本的未发布文档。文档明确指出：当前最新稳定版本为 **SDK 56**。  
> `expo-font` 支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## 文档解决的问题

`expo-font` 用于将自定义字体加载到 Expo / React Native 应用中，并在 React Native 组件中通过 `fontFamily` 使用。

它主要解决以下问题：

- 将本地字体文件嵌入 Android 和 iOS 应用。
- 在应用运行时加载本地或远程字体。
- 判断字体是否已经加载或正在加载。
- 查询当前可用的字体名称。
- 控制 Web 端字体加载期间的文本显示策略。
- 在 Android 和 iOS 上将文字渲染为图片。

对于 React Web 开发者，可以将它理解为 React Native 环境中的字体资源管理工具：Web 通常通过 CSS `@font-face` 注册字体，而 `expo-font` 提供了一套同时覆盖原生平台和 Web 的 API。

## 两种字体加载方式

文档提供了两种方案。

| 方式 | 适用平台 | 加载时机 | 文档建议 |
| --- | --- | --- | --- |
| Config Plugin | Android、iOS | 构建应用时嵌入 | 原生平台优先推荐 |
| `useFonts` / `loadAsync` | Android、iOS、tvOS、Web | 应用运行时加载 | 无法使用插件或需要跨平台动态加载时使用 |

### 构建时嵌入

Config Plugin 会在原生应用构建过程中把字体文件加入 Android 和 iOS 工程。完成配置并运行 `prebuild` 后，应用启动时可以直接使用字体，不需要等待 JavaScript 异步加载。

这类似于 Web 项目构建时将字体打包进静态资源，但它还会修改生成的 Android / iOS 原生工程配置。

### 运行时加载

`useFonts` 和 `loadAsync` 在应用运行后加载字体。字体准备完成前，应用需要自行处理等待状态。

在 Web 上，`loadAsync` 会在共享样式表中生成 `@font-face`，不需要开发者另外编写 CSS。

> **文档明确建议：**在 Android 和 iOS 上，只要条件允许，应优先使用 Config Plugin，因为构建时嵌入比 `useFonts` 或 `loadAsync` 更高效。

## 安装

根据项目使用的包管理器执行：

```sh
# npm
npx expo install expo-font

# yarn
yarn expo install expo-font

# pnpm
pnpm expo install expo-font

# bun
bun expo install expo-font
```

`expo install` 与普通的 `npm install` 不完全相同：它会根据当前 Expo SDK 选择兼容的软件包版本。

如果是在已有的 React Native 原生项目中安装，而不是由 Expo 创建的项目，需要先为该项目安装并配置 `expo` 模块。

## 使用 Config Plugin 嵌入字体

### 配置示例

在 `app.json` 中注册 `expo-font` 插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./path/to/file.ttf"],
          "android": {
            "fonts": [
              {
                "fontFamily": "Source Serif 4",
                "fontDefinitions": [
                  {
                    "path": "./path/to/SourceSerif4-ExtraBold.ttf",
                    "weight": 800
                  }
                ]
              }
            ]
          }
        }
      ]
    ]
  }
}
```

配置完成后需要运行 Expo 的 `prebuild` 流程，生成或更新 Android、iOS 原生工程。

React Web 项目通常没有这一阶段。Expo 的 Config Plugin 可以理解为“原生工程配置生成器”：它读取 `app.json`，并将声明转换为 Android 和 iOS 工程中的实际配置。

### 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `fonts` | `[]` | 链接到原生工程的通用字体文件列表，路径相对于项目根目录 |
| `android` | `[]` | Android 专用字体定义，支持通过对象语法创建具有自定义家族名的 XML 字体 |
| `ios` | `[]` | iOS 专用字体文件路径列表 |

### Android 与 iOS 的字体名称差异

这是最容易踩坑的地方之一：

- Android 使用通用 `fonts` 配置时，**文件名会成为字体家族名**。
- iOS 的字体家族名来自**字体文件内部的元数据**，不一定等于文件名。
- `fontFamily` 必须使用平台实际注册的名称，而不只是磁盘上的文件名。
- 可以调用 `getLoadedFonts()` 查看当前平台已经注册的字体名称。

例如，文件名是 `SourceSerif4-ExtraBold.ttf`，不代表 iOS 上一定要写：

```tsx
<Text style={{ fontFamily: 'SourceSerif4-ExtraBold' }} />
```

应当以字体内部名称或 `getLoadedFonts()` 的结果为准。

### 已有 React Native 原生项目

如果没有通过 Expo Config Plugin 管理原生工程，文档给出了原生接入方向：

- Android：将字体文件复制到 `android/app/src/main/assets/fonts`。
- iOS：按照 Apple 的“Adding a Custom Font to Your App”流程配置。

这部分涉及直接维护原生工程，不等同于 React Web 中把字体放进 `public` 目录。

## 使用 `useFonts` 运行时加载

当无法使用 Config Plugin 时，可以通过 Hook 加载字体：

```tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }}>
        Inter Black
      </Text>
      <Text style={{ fontSize: 30 }}>Platform Default</Text>
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

### 执行流程

1. `preventAutoHideAsync()` 阻止启动屏自动消失。
2. `useFonts` 开始加载字体，并返回 `[loaded, error]`。
3. 字体仍在加载且没有错误时，组件返回 `null`。
4. 加载成功或失败后，隐藏启动屏。
5. 加载成功时，`Text` 可以使用注册时指定的 `Inter-Black`。
6. 加载失败时，应用仍然继续渲染，避免一直停留在启动屏。

这里的启动屏相当于应用加载阶段的原生占位界面。它不是普通 React 组件，因此需要通过 `expo-splash-screen` 单独控制。

### `useFonts` 的重要限制

`useFonts` 接收字体名称到字体资源的映射：

```tsx
const [loaded, error] = useFonts({
  'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
});
```

其中：

- `loaded` 表示字体是否已经加载完成。
- `error` 用于在开发期间检查加载失败原因。
- 映射键 `Inter-Black` 是之后传给 `fontFamily` 的名称。

> **文档明确说明：**动态修改传给 `useFonts` 的字体映射不会触发字体“重新加载”。因此不要把它当成会随 props 或 state 自动更新的普通数据请求 Hook。

## API 导入方式

需要调用命令式 API 时，可以导入整个模块：

```js
import * as Font from 'expo-font';
```

## 字体状态与加载 API

### `getLoadedFonts()`

```ts
Font.getLoadedFonts(): string[]
```

同步返回当前已经加载或注册的全部字体名称，包括：

- 通过 Config Plugin 在构建时嵌入的字体。
- 通过 `loadAsync` 在运行时加载的字体。

返回的字符串可以直接作为 React Native `Text` 的 `fontFamily`。

该方法特别适合排查 iOS 字体内部名称与文件名不一致的问题。

### `isLoaded(fontFamily)`

```ts
Font.isLoaded(fontFamily: string): boolean
```

同步检查指定字体是否已经加载完成。

参数必须是加载字体时使用的字体家族名称，而不是字体路径。

### `isLoading(fontFamily)`

```ts
Font.isLoading(fontFamily: string): boolean
```

同步检查指定字体是否仍处于加载状态。

### `loadAsync(fontFamilyOrFontMap, source?)`

```ts
Font.loadAsync(fontFamily, source): Promise<void>
Font.loadAsync(fontMap): Promise<void>
```

支持两种调用思路：

```ts
await Font.loadAsync(
  'Inter-Black',
  require('./assets/fonts/Inter-Black.otf')
);
```

或者传入字体映射：

```ts
await Font.loadAsync({
  'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
});
```

第一个参数中的名称会成为 `Text` 使用的 `fontFamily`：

```tsx
<Text style={{ fontFamily: 'Inter-Black' }} />
```

`loadAsync` 可以加载静态资源或远程资源。Promise 会在字体加载完成后兑现。

文档建议使用 `try/catch/finally`，确保字体加载失败时应用仍能继续运行：

```ts
try {
  await Font.loadAsync({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });
} catch (error) {
  console.error(error);
} finally {
  // 结束加载状态或隐藏启动屏
}
```

> **基于文档内容推导：**字体通常属于视觉增强资源。除非产品明确要求字体失败时阻止使用，否则应准备系统字体降级方案，避免下载失败导致应用无法进入主界面。

## 字体资源类型

### `FontSource`

`loadAsync` 接受的字体来源可以是：

```ts
string | number | Asset | FontResource
```

分别可表示：

- URI 字符串。
- `require()` 返回的模块 ID，类型通常表现为数字。
- Expo `Asset`。
- 包含更多加载选项的 `FontResource` 对象。

React Web 开发者需要注意：React Native 的 `require('./font.otf')` 并不等同于浏览器运行时的 CommonJS 模块导入。打包工具会把它解析为原生资源模块 ID。

### `FontResource`

`FontResource` 用于描述传给 `loadAsync` 的字体资源：

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `default` | 通用 | 文档未进一步说明 |
| `uri` | 通用 | 字体资源 URI 或模块 ID |
| `display` | Web | 设置生成的 `@font-face` 中的 `font-display` |
| `testString` | Web | 设置传递给 FontFace Observer 的测试字符串 |

对于 `default` 与 `uri` 的更具体组合规则，当前文档未进一步说明，不应仅根据本页推断。

### `ServerFontResourceDescriptor`

该类型描述服务端字体资源，可表现为两种对象。

内联样式形式：

```ts
{
  css: string;
  id: string;
  type: 'style';
}
```

预加载链接形式：

```ts
{
  as: 'font';
  crossOrigin?: 'anonymous' | 'use-credentials';
  href: string;
  rel: 'preload';
  type: 'link';
}
```

当前文档只列出了类型结构，未说明其具体调用入口和完整使用流程。

## Web 字体显示策略

`FontDisplay` 只对 Web 有直接配置作用。它最终写入生成的 `@font-face` CSS，而不是元素的行内样式，因此不能根据某个元素动态改变。

Web 端默认值为 `FontDisplay.AUTO`。

虽然原生平台设置 `fontDisplay` 不会生效，但文档指出，iOS、Samsung、Pixel 等主流设备的默认表现近似 `SWAP`，OnePlus 设备的默认行为可能不同。

### `AUTO`

```ts
FontDisplay.AUTO = 'auto'
```

由浏览器或平台决定。文档指出，一般会在字体加载前隐藏文字，适合必须使用特定字体效果的按钮或横幅。

### `BLOCK`

```ts
FontDisplay.BLOCK = 'block'
```

字体加载完成前隐藏文字。若加载失败，文字可能完全不显示。

排查“文字消失”问题时，应优先检查是否使用了该策略。

### `FALLBACK`

```ts
FontDisplay.FALLBACK = 'fallback'
```

先提供约 100ms 的不可见等待期。之后可能切换到目标字体，也可能先显示备用字体并继续加载。

文档认为它适合需要自定义字体、但又应尽快供屏幕阅读器访问的按钮。

### `OPTIONAL`

```ts
FontDisplay.OPTIONAL = 'optional'
```

行为接近 `FALLBACK`，但浏览器可以根据慢速网络或关键资源压力决定是否加载该字体。

### `SWAP`

```ts
FontDisplay.SWAP = 'swap'
```

立即使用备用字体显示文本，目标字体加载完成后再替换。它能让内容更快出现，通常是更推荐的方案。

这与 React Web 中的 CSS `font-display: swap` 含义一致。

## 将文字渲染为图片

### `renderToImageAsync(glyphs, options?)`

```ts
Font.renderToImageAsync(glyphs, options)
```

该方法根据传入的文本创建图片。

> **平台限制：**方法说明明确标注仅支持 Android 和 iOS。

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `glyphs` | `string` | 要导出的文字 |
| `options` | `RenderToImageOptions` | 可选的渲染配置 |

可用配置：

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `color` | `'black'` | 字体颜色 |
| `fontFamily` | 系统默认字体 | 字体家族名称 |
| `lineHeight` | 未指定 | 文本行高，单位为 dp |
| `size` | `24` | 字体大小 |

返回结果包含：

| 属性 | 说明 |
| --- | --- |
| `uri` | 图片文件 URI |
| `width` | 图片宽度，单位为 dp |
| `height` | 图片高度，单位为 dp |
| `scale` | 图片缩放系数 |

像素尺寸计算方式为：

```text
像素宽度 = width × scale
像素高度 = height × scale
```

### 什么是 dp

dp 是移动端用于描述视觉尺寸的设备无关单位，作用类似 Web 中抽象后的 CSS 像素。不同像素密度的设备可以使用不同的物理像素数量呈现相近的视觉尺寸。

需要注意，接口章节中的部分相关类型被标注为支持更多平台，但方法本身只标注 Android 和 iOS。实际判断能否调用时，应以方法的平台支持声明为准。

## 错误码

| 错误码 | 含义 | 排查方向 |
| --- | --- | --- |
| `ERR_FONT_API` | `loadAsync` 参数无效 | 检查调用形式和参数结构 |
| `ERR_FONT_SOURCE` | 字体资源类型错误 | 检查是否传入受支持的 `FontSource` |
| `ERR_WEB_ENVIRONMENT` | 浏览器 `document` 不支持注入字体 | 检查 Web 运行环境及 DOM 可用性 |
| `ERR_DOWNLOAD` | 字体资源下载失败 | 检查 URL、网络和资源可访问性 |
| `ERR_FONT_FAMILY` | 字体家族名称无效 | 检查注册名称及字体内部名称 |
| `ERR_UNLOAD` | 尝试卸载尚未加载完成的字体 | 等待加载结束后再执行卸载操作 |

当前文档列出了 `ERR_UNLOAD`，但没有在本页提供对应的字体卸载 API 说明。

## React Web 开发者最容易误解的地方

### `fontFamily` 不一定等于文件名

Web 开发中，`font-family` 名称通常由开发者在 `@font-face` 中定义。原生平台则可能根据文件名或字体内部元数据决定名称，而且 Android 与 iOS 的规则不同。

遇到字体不生效时，应先使用 `getLoadedFonts()` 验证真实名称。

### 安装依赖不等于完成原生配置

仅执行 `expo install expo-font` 只是安装 JavaScript 和原生模块依赖。使用 Config Plugin 时，还需要配置 `app.json` 并执行 `prebuild`，使配置真正进入原生工程。

### `useFonts` 是启动依赖，不只是普通数据请求

字体尚未加载时直接渲染界面，可能出现系统字体短暂显示、布局变化或视觉闪动。示例通过启动屏控制首屏显示时机。

同时必须处理失败状态，否则应用可能一直返回 `null` 或停留在启动屏。

### React Native 样式不是 CSS

字体通过以下方式使用：

```tsx
<Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }} />
```

这里没有 CSS 选择器，也不需要在原生平台手写 `@font-face`。在 Web 平台调用 `loadAsync` 时，`expo-font` 会生成所需的 `@font-face`。

### 平台支持需要按具体 API 判断

`expo-font` 整体支持多个平台，但不是所有方法都支持全部平台。例如 `renderToImageAsync` 仅支持 Android 和 iOS。

不能因为库支持 Web，就认为库中的每个 API 都能在 Web 使用。

## 实际开发中的选择

### Android 和 iOS 固定使用的品牌字体

优先采用 Config Plugin：

- 字体随应用构建产物发布。
- 启动时无需等待 JavaScript 加载。
- 配置完成并执行 `prebuild` 后可以直接渲染。

### 需要同时支持 Web

可以根据需求选择：

- 原生端使用 Config Plugin，Web 端运行时加载。
- 所有平台统一使用 `useFonts` 或 `loadAsync`。

文档明确说明运行时方案覆盖 Web，但没有在本页提供混合方案的完整项目配置示例。

### 字体来自远程服务器

使用 `loadAsync`，并处理：

- 下载失败。
- 加载期间的界面状态。
- 字体失败后的系统字体降级。
- Web 端的 `FontDisplay` 策略。

其中降级方案属于**基于文档内容推导**：文档建议使用 `try/catch/finally` 保证字体失败时应用仍能继续。

### 调试字体不生效

建议按照以下顺序检查：

1. 调用 `getLoadedFonts()`，确认字体是否已经注册。
2. 检查 `fontFamily` 是否与返回名称完全一致。
3. 使用 `isLoading()` 和 `isLoaded()` 检查加载状态。
4. 检查是否出现 `ERR_FONT_SOURCE`、`ERR_DOWNLOAD` 或 `ERR_FONT_FAMILY`。
5. iOS 上不要默认使用字体文件名作为家族名。
6. Web 上检查 `FontDisplay.BLOCK` 是否导致文字不可见。

第 1 至第 5 项直接对应文档提供的 API、错误码和平台命名规则；第 6 项对应文档对 `BLOCK` 行为的警告。

## 文档未涉及的内容

当前文档未详细说明：

- 各字体文件格式在不同平台上的兼容性差异。
- 可变字体的完整配置方式。
- 字体子集化与文件体积优化。
- 字体授权和商业许可要求。
- 远程字体缓存、离线策略及缓存失效机制。
- 服务端渲染环境下的完整接入流程。
- 字体卸载 API 的具体用法。
- 多字重、多字体样式在 iOS 上的完整映射示例。
- `ServerFontResourceDescriptor` 的具体调用入口。

这些问题需要参考 Expo 的 Fonts 指南、相关 API 页面或平台原生文档，不能由本页内容直接得出结论。

## 总结

`expo-font` 的核心不是单纯“导入一个字体文件”，而是处理字体在不同平台上的注册、加载状态和实际家族名称。

实际开发时应优先遵循以下原则：

- Android 和 iOS 的固定字体优先使用 Config Plugin 构建时嵌入。
- 无法使用插件或需要远程字体时，再使用 `useFonts` 或 `loadAsync`。
- 运行时加载必须同时处理成功和失败，避免应用停留在启动状态。
- 不要假设字体文件名就是 `fontFamily`，尤其是在 iOS 上。
- Web 端需要理解 `FontDisplay` 对文字可见性和加载体验的影响。
- 每个 API 的平台支持范围需要单独确认。

---

## 文档导航

- **上一页**：[fingerprint](./171__fingerprint.md)
- **下一页**：[glass effect](./173__glass-effect.md)
