# 028 Color Reference

**翻页：** [上一页：027 Images](027-Images.md) · [目录](README.md) · [下一页：029 Handling Touches](029-HandlingTouches.md)

**官方页面：** [Color Reference · React Native](https://reactnative.dev/docs/colors)  
**源页代码覆盖：** PlatformColor/DynamicColorIOS 颜色 API、RGB/RGBA/HSL/HSLA/HWB/十六进制/整数写法、lowercase 命名颜色和透明色。

## RN 颜色和平台系统颜色

RN 的颜色一般写在 JavaScript style 对象里，很多格式与 CSS 相同。若希望跟随系统主题或系统设计色，可使用平台颜色 API：`PlatformColor` 查系统定义的颜色；`DynamicColorIOS` 则让 iOS 在 Light/Dark 外观下选择不同颜色。不同平台的命名色名受操作系统约束，要按平台测试。

```tsx
import { PlatformColor, DynamicColorIOS } from 'react-native';

const systemTint = PlatformColor('systemBlue');
const adaptiveIOS = DynamicColorIOS({ light: '#2459a6', dark: '#9fc3ff' });
```

## 字符串表示法

RN 支持 RGB、带透明度的 RGBA、HSL/HSLA、HWB 和十六进制颜色。逗号分隔和现代空格分隔写法都受支持，alpha 可单独指定：

| 格式 | 示例 | 说明 |
|---|---|---|
| 短十六进制 | `#f0f` | RGB 每通道一位 |
| 十六进制 | `#ff00ff` | `#rrggbb` |
| 含 alpha 短写 | `#f0ff` | `#rgba` |
| 含 alpha | `#ff00ff80` | `#rrggbbaa`，最后两位是透明度 |
| RGB/RGBA | `rgb(255, 0, 255)`、`rgba(255 0 255 / 0.8)` | 颜色通道与 alpha |
| HSL/HSLA | `hsl(300 100% 50%)`、`hsla(300, 100%, 50%, 0.8)` | 色相、饱和度、明度和 alpha |
| HWB | `hwb(300 0% 0%)` | 色相、白度和黑度 |

可把这些值放到常见样式属性中：

```tsx
<View style={{ backgroundColor: '#244f80', borderColor: 'rgba(255 255 255 / 0.7)' }} />
```

## 整数、命名颜色与透明色

RN 也支持整数形式的 RGB 颜色，格式顺序为 `0xrrggbbaa`。它与 Android 原生 `Color` 整数格式看起来相近但顺序不同：Android 通常是 `0xaarrggbb`。跨 JS/原生边界传整数颜色时要确认 alpha 通道位置，不要互换格式。

```ts
const greenOpaque = 0x00ff00ff; // RN: 红、绿、蓝、alpha
```

可使用 CSS3/SVG 规范中的命名颜色，名称只支持小写，例如 `tomato`、`steelblue`、`rebeccapurple`。大写拼法不是有效替代。`transparent` 等同完全透明的黑色 RGBA（`rgba(0, 0, 0, 0)`）。官方参考页列出完整命名颜色和十六进制值，查找特定颜色时以该清单为准。

## 选择方式

- 品牌色或固定颜色：用十六进制或函数式颜色值。
- 跟随系统暗色/浅色：优先平台颜色 API 或在应用主题层切换值。
- 颜色值跨 JS 与 Android 原生传递：检查两侧整数通道顺序。
- 想要 iOS/Android 原生语义色：先查平台设计指南和当前 RN `PlatformColor` API。

**翻页：** [上一页：027 Images](027-Images.md) · [目录](README.md) · [下一页：029 Handling Touches](029-HandlingTouches.md)
