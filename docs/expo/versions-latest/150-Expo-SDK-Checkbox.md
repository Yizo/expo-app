# 150｜Expo SDK Checkbox 复选框

**翻页：**[上一页：Expo SDK Cellular 蜂窝网络信息](./149-Expo-SDK-Cellular.md) · [目录](./README.md) · [下一页：Expo SDK Clipboard 剪贴板](./151-Expo-SDK-Clipboard.md)

**官方页面：**[Checkbox · Latest](https://docs.expo.dev/versions/latest/sdk/checkbox/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/checkbox/)

**版本与平台：**Latest 推荐 `expo-checkbox ~57.0.0`，SDK v56.0.0 推荐 `~56.0.1`。两版页面中的组件能力和属性基本相同；本篇按项目 SDK 56 可用 API 整理。支持 Android、iOS、tvOS 和 Web，且包含在 Expo Go 中。

## 复选框与受控状态

复选框是一个表示“是 / 否”的输入控件。和 React Web 中的受控 `<input type="checkbox">` 一样，将状态传给 `value`，用户操作后通过 `onValueChange` 更新状态。`expo-checkbox` 是跨平台组件，但实际渲染由各平台实现。

安装时使用 `expo install`，它会按项目 Expo SDK 选择兼容的包版本：

```sh
npx expo install expo-checkbox
# 也可以使用：yarn expo install expo-checkbox
# 或：pnpm expo install expo-checkbox
# 或：bun expo install expo-checkbox
```

官方 Usage 示例的代码主题包括普通状态、依据选中状态设置颜色，以及禁用状态。下面将它们合并在一个可运行的受控示例中：

```tsx
import { useState } from 'react';
import { Checkbox } from 'expo-checkbox';
import { StyleSheet, Text, View } from 'react-native';

export default function CheckboxExamples() {
  const [accepted, setAccepted] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox value={accepted} onValueChange={setAccepted} />
        <Text style={styles.label}>普通复选框：{accepted ? '已选中' : '未选中'}</Text>
      </View>

      <View style={styles.row}>
        <Checkbox
          value={accepted}
          onValueChange={setAccepted}
          color={accepted ? '#4630EB' : undefined}
        />
        <Text style={styles.label}>选中时使用自定义颜色</Text>
      </View>

      <View style={styles.row}>
        <Checkbox value={accepted} onValueChange={setAccepted} disabled />
        <Text style={styles.label}>禁用复选框</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16, marginVertical: 32 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  label: { marginLeft: 8, fontSize: 15 },
});
```

## API 与类型

组件从 `expo-checkbox` 导入：

```ts
import { Checkbox } from 'expo-checkbox';
```

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `value` | `boolean`，默认 `false` | 当前是否选中。用于受控渲染。 |
| `onValueChange` | `(value: boolean) => void` | 用户切换时收到新布尔值；一般用它更新 React state。 |
| `onChange` | 原生 `NativeSyntheticEvent<CheckboxEvent>`；Web 为 React `SyntheticEvent<HTMLInputElement, CheckboxEvent>` | 用户操作时收到事件对象。若只需新选中值，优先用 `onValueChange`。 |
| `color` | React Native `ColorValue` | 设置复选框的色调；也会覆盖禁用状态下默认的半透明样式。 |
| `disabled` | `boolean` | 设为 `true` 后控件不可切换，并显示为较弱的视觉状态。 |
| 继承属性 | `ViewProps` | 还可传入 React Native View 支持的布局、样式和可访问性等属性。 |

`CheckboxEvent` 描述 `onChange` 事件的数据：`value` 是当前布尔选中值；`target` 在原生平台代表触发事件的 `NodeHandle`，在 Web 代表对应 DOM 节点。它们分别是原生视图引用和浏览器元素引用，不应假设两端的 `target` 结构完全相同。

## 源页代码覆盖记录

- Installation：覆盖 `npx`、Yarn、pnpm、Bun 四种安装命令。
- Usage：覆盖普通复选框、基于状态改变颜色、禁用复选框三类示例。
- API import：覆盖 `Checkbox` 的导入方式。
- 其余 API 是属性类型和说明，没有独立代码示例；本篇逐项记录 `value`、`onValueChange`、`onChange`、`color`、`disabled`、继承的 `ViewProps` 及 `CheckboxEvent`。

**版本差异：**v56 和 Latest 对该页所列的属性、平台支持、事件类型及示例行为相同；差异是安装建议版本 `~56.0.1` / `~57.0.0`。请让 `npx expo install` 依当前 SDK 选择依赖，不要为了照抄 Latest 版本而升级项目。

**翻页：**[上一页：Expo SDK Cellular 蜂窝网络信息](./149-Expo-SDK-Cellular.md) · [目录](./README.md) · [下一页：Expo SDK Clipboard 剪贴板](./151-Expo-SDK-Clipboard.md)
