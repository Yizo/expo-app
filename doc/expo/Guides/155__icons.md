# Expo 矢量图标（Vector Icons）

> 原文地址：[https://docs.expo.dev/guides/icons/](https://docs.expo.dev/guides/icons/)

---

## 概述

在 Expo 应用中，开发者可以使用**字体图标集**（如 FontAwesome、Glyphicons、Ionicons 等）来实现各种视觉元素，也可以使用来自 [The Noun Project](https://thenounproject.com/) 的 PNG 图标。

字体图标的优势在于：它们是矢量图形，可以无损缩放、自由着色，且不需要为不同分辨率准备多套图片资源。

---

## `@expo/vector-icons` 库

> **重要提示**：`@expo/vector-icons` 将被弃用，不再推荐使用。如需迁移到 `@react-native-vector-icons`，请参阅官方博客文章：[Moving away from @expo/vector-icons](https://expo.dev/blog/moving-away-from-expo-vector-icons)。

### 基本介绍

`@expo/vector-icons` 是对 [`react-native-vector-icons`](https://github.com/oblador/react-native-vector-icons) 的封装，共享其 API，并提供了大量图标集合。你可以在 [icons.expo.fyi](https://icons.expo.fyi) 上浏览所有可用的图标集和具体图标。

### 基本用法示例

以下示例展示了如何加载 `Ionicons` 图标集并显示一个绿色的对勾图标：

```jsx
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function App() {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={32} color="green" />
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

**代码说明：**

- `import Ionicons from '@expo/vector-icons/Ionicons'`：从 `@expo/vector-icons` 中导入 Ionicons 图标集。你可以替换为其他图标集名称（如 `FontAwesome`、`MaterialIcons` 等）。
- `name="checkmark-circle"`：指定要显示的图标名称。具体可用的名称请查阅 [icons.expo.fyi](https://icons.expo.fyi)。
- `size={32}`：设置图标大小为 32 像素。
- `color="green"`：设置图标颜色为绿色。

### 字体预加载

> 与 Expo 中的任何[自定义字体](/develop/user-interface/fonts.md#use-a-local-font-file)一样，你可以在渲染之前预加载这些图标字体资源。字体对象可以通过组件上的静态属性获取，其值是一个指向具体 TTF 文件的 require 语句（例如 `Ionicons.font`）。

这意味着你可以在应用的启动阶段（如 Splash Screen 期间）使用 `Font.loadAsync` 或 `useFonts` Hook 来预加载图标字体，确保图标在首次渲染时已经准备就绪，避免出现闪烁或空白。

---

## 自定义图标字体

如果你需要使用自己设计的图标字体，需要先导入并加载字体文件，然后创建对应的图标集。关于加载自定义字体的详细说明，请参阅[加载自定义字体文档](/develop/user-interface/fonts.md#handle-expovector-icons-initial-load)。

该库提供了三种创建自定义图标集的方法：

### `createIconSet` — 从映射对象创建图标集

此函数通过一个**映射对象**来创建自定义图标集。映射对象的键（key）是图标名称，值（value）是对应的 UTF-8 字符或 Unicode 编码。

**参数说明：**

| 参数 | 说明 |
|------|------|
| `glyphMap` | 映射对象，键为图标名称，值为 Unicode 编码（数字）或 UTF-8 字符（字符串） |
| `fontFamily` | 字体族名称 |
| `fontFile`（可选） | Android 上的字体文件名 |

```jsx
import createIconSet from '@expo/vector-icons/createIconSet';

const glyphMap = { 'icon-name': 1234, test: '∆' };
const CustomIcon = createIconSet(glyphMap, 'fontFamily', 'custom-icon-font.ttf');

export default function CustomIconExample() {
  return <CustomIcon name="icon-name" size={32} color="red" />;
}
```

**代码说明：**

- `glyphMap`：定义了图标名称到 Unicode 字符的映射关系。`1234` 是十进制的 Unicode 编码，`'∆'` 是直接使用的 UTF-8 字符。
- `createIconSet(glyphMap, 'fontFamily', 'custom-icon-font.ttf')`：用映射对象、字体族名和字体文件名来创建一个可复用的图标组件。
- 创建后的 `CustomIcon` 组件使用方式与内置图标集相同，通过 `name`、`size`、`color` 等属性来控制显示。

> **基于经验建议**：如果你有设计师提供的自定义图标字体文件（.ttf），`createIconSet` 是最直接的集成方式。确保映射对象中的 Unicode 编码与字体文件中的字符编码完全匹配。

---

### `createIconSetFromIcoMoon` — 从 IcoMoon 配置创建图标集

此方法使用 [IcoMoon](https://icomoon.io/) 导出的配置文件来创建图标集。你需要将 **selection.json** 和 **.ttf** 字体文件保存到项目本地，并通过 Expo 的字体 Hook 加载它们。

> **IcoMoon 版本说明**：[新版 IcoMoon 应用](https://icomoon.io/new-app)导出的 JSON 格式与[旧版 IcoMoon 应用](https://icomoon.io/app)不同。当前函数仅支持旧版输出格式。GitHub 上有一个[Pull Request](https://github.com/expo/vector-icons/pull/356)正在处理对新格式的支持，发布后即可生效。

以下示例使用 `useFonts` Hook 来加载字体：

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon';

const Icon = createIconSetFromIcoMoon(
  require('./assets/icomoon/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

export default function App() {
  const [fontsLoaded] = useFonts({
    IcoMoon: require('./assets/icomoon/icomoon.ttf'),
  });

  // 关于如何在字体加载时显示 Splash Screen，请参阅：
  // /develop/user-interface/fonts/#wait-for-fonts-to-load
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Icon name="pacman" size={50} color="red" />
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

**代码说明：**

- `require('./assets/icomoon/selection.json')`：导入 IcoMoon 导出的配置文件，其中包含了图标名称与 Unicode 编码的映射关系。
- `'IcoMoon'`：字体族名称，需要与 `useFonts` 中注册的名称一致。
- `'icomoon.ttf'`：字体文件名（仅文件名，不包含路径）。
- `useFonts` Hook：负责在组件渲染前加载字体文件。`fontsLoaded` 为 `false` 时返回 `null`，避免字体未加载完成时出现空白或乱码。

> **基于经验建议**：使用 IcoMoon 时，请注意区分新版和旧版应用的导出格式。如果你使用的是新版 IcoMoon 应用，可能需要等待官方 PR 合并后才能正常使用，或者手动调整 JSON 格式。

---

### `createIconSetFromFontello` — 从 Fontello 配置创建图标集

此方法使用 [Fontello](http://fontello.com/) 导出的配置文件来创建图标集。与 IcoMoon 类似，你需要将 **config.json** 和 **.ttf** 字体文件保存到项目本地并加载。

```js
// 导入 createIconSetFromFontello 方法
import createIconSetFromFontello from '@expo/vector-icons/createIconSetFromFontello';

// 导入配置文件
import fontelloConfig from './config.json';

// Fontello 导出的字体名称和文件通常都叫做 "fontello"。
// 确保这里是 `fontname.ttf` 文件名，而不是文件路径。
const Icon = createIconSetFromFontello(fontelloConfig, 'fontello', 'fontello.ttf');
```

**代码说明：**

- `fontelloConfig`：Fontello 导出的 `config.json` 配置文件。
- `'fontello'`：字体族名称。Fontello 导出的字体默认名称通常就是 `fontello`。
- `'fontello.ttf'`：字体文件名。注意这里传入的是文件名而非路径。

> **基于经验建议**：Fontello 和 IcoMoon 都是流行的图标字体生成工具，选择哪一个主要取决于你的工作流程偏好。两者的集成方式在 Expo 中非常相似。

---

## Button 组件 — 带图标的按钮

你可以使用 `Font.Button` 语法（挂载在导入的图标集上）来创建带有图标的交互式按钮组件。这些按钮组件接受点击事件处理函数，并且可以包含文本内容。

以下示例使用 `FontAwesome` 创建一个 Facebook 登录按钮：

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function App() {
  const loginWithFacebook = () => {
    console.log('Button pressed');
  };

  return (
    <View style={styles.container}>
      <FontAwesome.Button name="facebook" backgroundColor="#3b5998" onPress={loginWithFacebook}>
        Login with Facebook
      </FontAwesome.Button>
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

**代码说明：**

- `FontAwesome.Button`：通过 `.Button` 属性访问图标集附带的按钮组件。
- `name="facebook"`：指定按钮中显示的图标。
- `backgroundColor="#3b5998"`：设置按钮背景颜色为 Facebook 品牌蓝色。
- `onPress={loginWithFacebook}`：绑定点击事件处理函数。
- `Login with Facebook`：按钮内的文本内容，作为子节点传入。

### Button 组件属性

Button 组件继承了标准的 [Text](http://reactnative.dev/docs/text)、[TouchableHighlight](http://reactnative.dev/docs/touchablehighlight) 和 [TouchableWithoutFeedback](http://reactnative.dev/docs/touchablewithoutfeedback) 的属性，同时还有以下专有属性：

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `color` | 设置文本和图标的颜色。如果需要文本和图标使用不同颜色，可以嵌套 Text 节点或使用特定样式。 | `white` |
| `size` | 设置图标的大小（单位为像素）。 | `20` |
| `iconStyle` | 仅针对图标的样式设置，可用于设置不同的颜色或间距。建议使用此属性来控制间距，以避免布局不稳定。 | `{marginRight: 10}` |
| `backgroundColor` | 设置按钮的背景颜色。 | `#007AFF` |
| `borderRadius` | 控制按钮的圆角大小。设置为 `0` 可以去除圆角。 | `5` |
| `onPress` | 用户点击按钮时触发的回调函数。 | 无 |

> **基于经验建议**：`iconStyle` 属性是调整图标与文本间距的推荐方式。直接修改外层样式可能导致布局偏移或对齐问题，使用 `iconStyle` 可以确保布局稳定性。

---

## 快速参考

### 常用图标集一览

| 图标集名称 | 导入方式 | 图标预览 |
|-----------|---------|---------|
| Ionicons | `import Ionicons from '@expo/vector-icons/Ionicons'` | [icons.expo.fyi](https://icons.expo.fyi) |
| FontAwesome | `import FontAwesome from '@expo/vector-icons/FontAwesome'` | [icons.expo.fyi](https://icons.expo.fyi) |
| MaterialIcons | `import MaterialIcons from '@expo/vector-icons/MaterialIcons'` | [icons.expo.fyi](https://icons.expo.fyi) |

> **基于文档内容推导**：所有图标集的使用方式相同——导入后通过 `name`、`size`、`color` 属性控制显示。你可以在 [icons.expo.fyi](https://icons.expo.fyi) 上搜索和预览所有可用图标。

### 选择图标方案的建议

| 场景 | 推荐方案 |
|------|---------|
| 使用常见图标（如社交、导航、操作按钮） | 直接使用内置图标集（Ionicons、FontAwesome 等） |
| 使用设计师提供的自定义图标 | 通过 IcoMoon 或 Fontello 生成字体文件，使用 `createIconSetFromIcoMoon` 或 `createIconSetFromFontello` |
| 需要完全控制的自定义图标 | 使用 `createIconSet` 配合自定义映射对象 |
| 需要多色图标或复杂图形 | 考虑使用 PNG/SVG 图片（字体图标仅支持单色） |

---

## 文档导航

- **上一页**：[ios developer mode](./154__ios-developer-mode.md)
- **下一页**：[localization](./156__localization.md)
