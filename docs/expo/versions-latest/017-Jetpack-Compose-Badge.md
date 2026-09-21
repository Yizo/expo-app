# 017｜Jetpack Compose Badge

**翻页：**[上一页：Jetpack Compose AlertDialog](./016-Jetpack-Compose-AlertDialog.md) · [目录](./README.md) · [下一页：Jetpack Compose BadgedBox](./018-Jetpack-Compose-BadgedBox.md)

**官方页面：**[Jetpack Compose Badge](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18；SDK v56 exact reference [Badge](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/badge/) 推荐 ~56.0.26。它是 Android Jetpack Compose 组件并标记 Expo Go 可用。

## 点提示与数量提示

Badge 可作为状态 indicator。没有 children 时呈现一个小圆点；带 Text 时显示计数或标签。以下例子在 Host 中只绘制状态点：

```tsx
import { Badge, Host } from '@expo/ui/jetpack-compose';

export function UnreadIndicator() {
  return (
    <Host matchContents>
      <Badge />
    </Host>
  );
}
```

如果要显示数字，通过 Text children 提供内容；containerColor 改底色，contentColor 改文字 / icon tint：

```tsx
import { Badge, Host, Text } from '@expo/ui/jetpack-compose';

export function MessageCount() {
  return (
    <Host matchContents>
      <Badge containerColor="#EF5350" contentColor="#FFFFFF">
        <Text>3</Text>
      </Badge>
    </Host>
  );
}
```

Badge 本身不负责 overlay 到图标上；若需要图标右上角徽标组合，后续的 BadgedBox 可作为容器。

## API

| 属性 | 用途 |
| --- | --- |
| children | 可选内容；省略时显示 dot indicator，例如数字 Text。 |
| containerColor | Badge 背景颜色，缺省使用 Compose BadgeDefaults。 |
| contentColor | Badge 内文字 / icon tint，缺省使用 Compose 默认值。 |
| modifiers | Jetpack Compose Modifier 配置列表。 |

## 关键名词

- **Badge**：小型状态标记，可是没有文字的圆点或带数字的圆形 / 胶囊标签。
- **Container color**：徽标外层背景色。
- **Content color**：徽标里文字或图标的颜色。
- **Host**：React Native 内容中承载 Compose native UI 的容器。
- **Compose BadgeDefaults**：Jetpack Compose Material 中定义的默认徽标色值。

## 官方代码主题覆盖

源页全部 code themes 均有改写示例：安装 @expo/ui（npm / Yarn / pnpm / Bun）、既有 React Native project 的 Expo module 要求、空 children 的 indicator dot、带数字的 Text badge、containerColor / contentColor 与 Host wrapper。API 表也覆盖 modifiers、default colors 和 Android / Expo Go 平台信息。

## 下一页

页脚 **Next** 指向 [Jetpack Compose BadgedBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badgedbox/)，把 Badge 叠加到图标等主内容上。

**翻页：**[上一页：Jetpack Compose AlertDialog](./016-Jetpack-Compose-AlertDialog.md) · [返回目录](./README.md) · [下一页：Jetpack Compose BadgedBox](./018-Jetpack-Compose-BadgedBox.md)
