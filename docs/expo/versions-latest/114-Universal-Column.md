# 114｜Expo UI Universal Column

**翻页：**[上一页：Universal Collapsible](./113-Universal-Collapsible.md) · [目录](./README.md) · [下一页：Universal FieldGroup](./115-Universal-FieldGroup.md)

**官方页面：**[Column · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/column/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/column/)推荐 `~56.0.25`。两个版本都支持 Android、iOS、Web，并可在 Expo Go 中使用；两页的 API 和示例一致。

## 垂直排列的布局容器

`Column` 从上到下排列子视图。iOS 由 SwiftUI `VStack` 实现，Android 对应 Jetpack Compose `Column`，Web 使用 flex `View`。`spacing` 设置相邻子项间距；`alignment` 控制横向（交叉轴）对齐。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本纵向排列

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Text } from '@expo/ui';

export default function ColumnExample() {
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host matchContents>
      <Column spacing={8}>
        <Text textStyle={ink}>First</Text>
        <Text textStyle={ink}>Second</Text>
        <Text textStyle={ink}>Third</Text>
      </Column>
    </Host>
  );
}
~~~

## 横向对齐

`alignment="center"` 让子项沿水平方向居中；可用值还有 `'start'` 和 `'end'`：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Text } from '@expo/ui';

export default function ColumnAlignmentExample() {
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Column spacing={8} alignment="center">
        <Text textStyle={ink}>Centered</Text>
        <Text textStyle={ink}>Centered</Text>
      </Column>
    </Host>
  );
}
~~~

## 属性速查

导入方式：

~~~tsx
import { Column } from '@expo/ui';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `alignment` | `'start' \| 'center' \| 'end'`（可选，默认 `start`） | 子项沿横向交叉轴的位置。 |
| `children` | `ReactNode`（可选） | 容器内的内容。 |
| `disabled` | `boolean`（可选） | 是否禁用组件及其交互。 |
| `hidden` | `boolean`（可选） | 是否隐藏容器。 |
| `modifiers` | `ModifierConfig[]`（可选） | 平台专用原生 modifier。 |
| `onAppear` / `onDisappear` | `() => void`（可选） | 组件进入或移出屏幕时调用。 |
| `onPress` | `() => void`（可选） | 容器被按下时调用。 |
| `spacing` | `number`（可选） | 相邻子项之间的垂直距离，单位为 density-independent pixels（dp）。 |
| `style` | `ViewStyle` 的受限子集（可选） | 跨平台支持的 padding、背景色、边框、透明度、宽高。 |
| `testID` | `string`（可选） | 供端到端测试定位的标识。 |

### 新手术语

- **纵轴（主轴）**：`Column` 中从上到下的排列方向；`spacing` 沿此方向设置间隔。
- **交叉轴**：与主轴垂直的方向。对 `Column` 而言，交叉轴是水平方向。
- **dp（density-independent pixel）**：Android 常用的密度无关长度单位，使布局尺寸不直接受屏幕像素密度影响。
- **`VStack`**：SwiftUI 的纵向堆叠容器，对应 Expo UI 的 `Column`。

## 源页代码主题覆盖

已覆盖四种安装命令、两种官方示例（基础纵向排列与 cross-axis alignment），以及根入口 API 导入；同时列出平台样式和布局相关属性。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/column/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/column/)

**翻页：**[上一页：Universal Collapsible](./113-Universal-Collapsible.md) · [目录](./README.md) · [下一页：Universal FieldGroup](./115-Universal-FieldGroup.md)
