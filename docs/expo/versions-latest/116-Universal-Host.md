# 116｜Expo UI Universal Host

**翻页：**[上一页：Universal FieldGroup](./115-Universal-FieldGroup.md) · [目录](./README.md) · [下一页：Universal Icon](./117-Universal-Icon.md)

**官方页面：**[Host · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/host/)推荐 `~56.0.26`。Universal 的根组件都应该放进 `Host`。Latest 增加了 `seedColor` 和 `onLayoutContent`；v56 页面还列有其余尺寸、方向、安全区域、主题属性。

## 跨平台原生视图承载容器

`Host` 是连接 React Native 与 Expo UI 原生视图树的容器：Android / iOS 分别承载 Jetpack Compose / SwiftUI 内容；Web 回退为 React Native `View`。因此 Universal Expo UI 子树的根节点使用它。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本用法

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Text, Button } from '@expo/ui';

export default function HostExample() {
  const colorScheme = useColorScheme();

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={12} alignment="center">
        <Text textStyle={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Hello, world!
        </Text>
        <Button label="Press me" onPress={() => alert('Pressed')} />
      </Column>
    </Host>
  );
}
~~~

## 让 Host 跟随内容大小

`matchContents` 让 `Host` 根据底层原生布局的内容尺寸调整 React Native 视图树中的尺寸。可传 `true`，也可分别配置横向和纵向：

~~~tsx
import { Host, Button } from '@expo/ui';

export default function MatchContentsExample() {
  return (
    <Host matchContents>
      <Button label="Sized to content" onPress={() => {}} />
    </Host>
  );
}
~~~

Web 上该属性通过 `alignSelf: 'flex-start'` 使 View 缩至内容大小；`{ horizontal: true }` / `{ vertical: true }` 在 Web 上与布尔形式相同，因为 `alignSelf` 只控制父项交叉轴上的拉伸。

## 指定布局方向

`layoutDirection` 可让整个子树按从左到右或从右到左排布。Web 上会给底层 View 设置 `dir` 属性，让后代继承方向：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Row, Text } from '@expo/ui';

export default function LayoutDirectionExample() {
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host
      layoutDirection="rightToLeft"
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Row spacing={8}>
        <Text textStyle={ink}>First</Text>
        <Text textStyle={ink}>Second</Text>
      </Row>
    </Host>
  );
}
~~~

可选值为 `'leftToRight'` 和 `'rightToLeft'`。省略时跟随 `I18nManager` 当前 locale 方向。

## 监听内容布局完成

Latest 的 `onLayoutContent` 在内容布局完成或尺寸变化时返回宽、高：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Text } from '@expo/ui';

export default function OnLayoutContentExample() {
  const colorScheme = useColorScheme();

  return (
    <Host
      matchContents
      onLayoutContent={({ nativeEvent: { width, height } }) =>
        console.log(`content size: ${width}x${height}`)
      }>
      <Text textStyle={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
        Hello, world!
      </Text>
    </Host>
  );
}
~~~

Android / iOS 将回调传递给平台 Host；Web 基于底层 `View` 的 `onLayout` 计算。该属性未出现在 SDK 56 页面。

## 填满可用视口

当内容需要占用可用视口，例如全屏 `List`，使用 `useViewportSizeMeasurement`：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Text } from '@expo/ui';

export default function UseViewportSizeMeasurementExample() {
  const colorScheme = useColorScheme();

  return (
    <Host useViewportSizeMeasurement>
      <Column spacing={12} alignment="center">
        <Text textStyle={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Fills the viewport
        </Text>
      </Column>
    </Host>
  );
}
~~~

未提供显式尺寸时，Host 会把视口宽高作为布局建议值；显式传入的 `style` 尺寸优先。

## 忽略安全区域

默认会尊重刘海、状态栏边缘、Home 指示条等安全区域。设置 `ignoreSafeArea="all"` 可让内容延伸至屏幕边缘；设置 `"keyboard"` 则保留其他安全区，只忽略键盘 inset：

~~~tsx
import { useColorScheme } from 'react-native';
import { Host, Column, Spacer, Text } from '@expo/ui';

export default function IgnoreSafeAreaExample() {
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <Host ignoreSafeArea="all" style={{ flex: 1 }}>
      <Column style={{ flex: 1 }} alignment="center">
        <Text textStyle={ink}>Behind the status bar</Text>
        <Spacer flexible />
        <Text textStyle={ink}>Behind the home indicator</Text>
      </Column>
    </Host>
  );
}
~~~

该属性只能在组件挂载时设定一次。Web 使用 CSS `env(safe-area-inset-*)` 作为 padding；默认还会纳入启用虚拟键盘 API 页面的键盘 inset。

## 强制深色或浅色外观

`colorScheme` 可以覆盖子级原生视图的颜色外观；`'light'` / `'dark'` 强制模式，省略则跟随系统。在 Web 上忽略：

~~~tsx
import { Host, Button } from '@expo/ui';

export default function HostColorSchemeExample() {
  return (
    <Host colorScheme="dark" matchContents>
      <Button label="Always dark" onPress={() => {}} />
    </Host>
  );
}
~~~

## 属性速查

~~~tsx
import { Host } from '@expo/ui';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | 要放入原生 Host 的 React 内容。 |
| `colorScheme` | `ColorSchemeName`（可选） | `'light'` / `'dark'` 控制子级外观；省略时继承系统。 |
| `ignoreSafeArea` | `'all' \| 'keyboard'`（可选） | 忽略全部安全区或只忽略键盘安全区；只可在挂载时设置。 |
| `layoutDirection` | `'leftToRight' \| 'rightToLeft'`（可选） | 子树布局方向，默认跟随当前 locale。 |
| `matchContents` | `boolean \| { horizontal: boolean, vertical: boolean }`（可选，默认 `false`） | Host 根据内容布局调整尺寸；只可在挂载时设置。 |
| `onLayoutContent` | `(event: { nativeEvent: { height, width } }) => void`（Latest） | 内容完成布局 / 更新尺寸时回调。v56 页面未列出。 |
| `seedColor` | `ColorValue`（Latest） | 为子树生成平台主题色；v56 页面未列出。 |
| `useViewportSizeMeasurement` | `boolean`（可选，默认 `false`） | 没有显式尺寸时使用视口作为布局建议尺寸。 |
| 继承属性 | React Native `ViewProps` | Host 同时支持普通 View 属性。 |

`seedColor` 在 Android 生成 Material 3 调色板，并可由后代 `useMaterialColors()` 读取；iOS 将其用作 SwiftUI tint；Web 生成主色 CSS 变量。省略时回退平台默认主题。

### 新手术语

- **Host**：原生 UI 子树的“宿主 / 桥接容器”；它让一个组件 API 能承载各平台原生控件实现。
- **视口（viewport）**：当前窗口中可用于显示内容的区域。
- **安全区域（safe area）**：设备遮挡或系统手势区域之外适合放置内容的区域。
- **inset**：从屏幕边缘或键盘边缘避让的内边距 / 留白尺寸。
- **种子色（seed color）**：用于衍生一套协调调色板的基础颜色。
- **`ViewProps`**：React Native `View` 支持的一组通用属性，例如布局、无障碍和测试标识。

## 源页代码主题覆盖

已覆盖四种安装命令、官方七种 Host 示例（基础用法、matchContents、方向、内容布局测量、填充 viewport、安全区控制、强制色彩模式）及根入口导入。并比较 Android / iOS 原生容器和 Web View 的行为。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/host/)

**翻页：**[上一页：Universal FieldGroup](./115-Universal-FieldGroup.md) · [目录](./README.md) · [下一页：Universal Icon](./117-Universal-Icon.md)
