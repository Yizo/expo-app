# 020｜Jetpack Compose Box

**翻页：**[上一页：Jetpack Compose BasicAlertDialog](./019-Jetpack-Compose-BasicAlertDialog.md) · [目录](./README.md) · [下一页：Jetpack Compose Button](./021-Jetpack-Compose-Button.md)

**官方页面：**[Jetpack Compose Box](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/box/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.14；SDK v56 Expo UI reference 列有 Box component，v56 package 推荐版本为 @expo/ui ~56.0.26。此页为 Android-only Compose control，支持 Expo Go。

## 把子项叠在一个容器里

Jetpack Compose 的 Box 用于将 children 叠在同一区域，并用 contentAlignment 指定默认对齐。以下示例用 Modifier 配置容器尺寸和背景色：

```tsx
import { Box, Host, Text } from '@expo/ui/jetpack-compose';
import {
  background,
  size,
} from '@expo/ui/jetpack-compose/modifiers';

export default function CenteredBox() {
  return (
    <Host matchContents>
      <Box
        contentAlignment="center"
        modifiers={[size(200, 200), background('#E0E0E0')]}>
        <Text>Centered in Box</Text>
      </Box>
    </Host>
  );
}
```

Box 与 React Native View 都能包裹子节点，但 Compose Box 可以直接把多个 native child 叠放，默认布局语义来自 Jetpack Compose。

## API

| Prop | 用途 |
| --- | --- |
| children | Box 内要叠放 / 对齐的 Compose 内容。 |
| contentAlignment | 子节点在 Box 中的对齐方式，例如 center。 |
| floatingToolbarExitAlwaysScrollBehavior | 供相关浮动 toolbar 使用的滚动退出行为。 |

Box 也继承 Compose Primitive 基础 props / modifiers；尺寸、背景和间距可通过 expo/ui 的 modifiers helpers 配置。

## 关键名词

- **Box**：Compose 的单元格叠放容器，多个 children 可占据同一区域。
- **contentAlignment**：为 Box 内 child 指定默认的水平 / 垂直对齐位置。
- **Modifier**：Compose 原生布局 / 绘制修饰链。
- **Host**：将 Compose view tree 嵌入 React Native layout 的容器。

## 官方代码主题覆盖

源页含有的代码主题全部覆盖：@expo/ui 安装的 npm / Yarn / pnpm / Bun 命令、既有 React Native app 先装 Expo package、Host + Box + Text 示例、size / background modifiers、contentAlignment 属性和 floating toolbar 滚动属性。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Button](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/)，比较 filled / tonal / outlined / elevated / text 五种 Android Material button。

**翻页：**[上一页：Jetpack Compose BasicAlertDialog](./019-Jetpack-Compose-BasicAlertDialog.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Button](./021-Jetpack-Compose-Button.md)
