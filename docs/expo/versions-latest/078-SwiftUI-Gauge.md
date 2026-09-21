# 078｜SwiftUI Gauge

**翻页：**[上一页：SwiftUI Form](./077-SwiftUI-Form.md) · [目录](./README.md) · [下一页：SwiftUI Group](./079-SwiftUI-Group.md)

**官方页面：**[SwiftUI Gauge · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/gauge/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/gauge/)推荐 `~56.0.26`。`Gauge` 是 iOS SwiftUI 控件，可在 Expo Go 中使用。

## 原生仪表盘显示进度或度量值

`Gauge` 用图形指示一个数值在区间中的位置。和只有“完成多少”的进度条类似，但 Gauge 可以显示最小值、最大值、当前值及语义标签，常用于电量、存储、进度或强度。`value` 默认为 0–1 区间，也可用 `min` / `max` 定义其他量程。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本 Gauge

线性 Gauge 会拉伸以填满父容器提供的宽度，因此示例为 `Host` 提供可用空间：

~~~tsx
import { Host, Gauge } from '@expo/ui/swift-ui';

export default function BasicGaugeExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Gauge value={0.5} />
    </Host>
  );
}
~~~

## 提供用途标签

把子视图作为 Gauge 的 `children`，为数值说明用途：

~~~tsx
import { Host, Gauge, Text } from '@expo/ui/swift-ui';

export default function LabelExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Gauge value={0.7}>
        <Text>Progress</Text>
      </Gauge>
    </Host>
  );
}
~~~

## 显示当前值、最小值与最大值标签

`currentValueLabel`、`minimumValueLabel`、`maximumValueLabel` 接收 `Text` 或 `Label` 等视图；本例把量程设为 0–100，当前为 50：

~~~tsx
import { Host, Gauge, Text } from '@expo/ui/swift-ui';

export default function ValueLabelsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Gauge
        value={50}
        min={0}
        max={100}
        currentValueLabel={<Text>50%</Text>}
        minimumValueLabel={<Text>0</Text>}
        maximumValueLabel={<Text>100</Text>}>
        <Text>Usage</Text>
      </Gauge>
    </Host>
  );
}
~~~

## Gauge 外观样式

`gaugeStyle` 支持 `automatic`、`circular`、`circularCapacity`、`linear` 和 `linearCapacity`。官方示例对照展示圆形、圆形容量、线性、线性容量四种样式：

~~~tsx
import { Host, Gauge, Text, VStack } from '@expo/ui/swift-ui';
import { gaugeStyle } from '@expo/ui/swift-ui/modifiers';

export default function GaugeStylesExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <Text>Circular</Text>
        <Gauge value={0.5} modifiers={[gaugeStyle('circular')]}>
          <Text>Circular</Text>
        </Gauge>
        <Text>Circular Capacity</Text>
        <Gauge value={0.5} modifiers={[gaugeStyle('circularCapacity')]}>
          <Text>Circular Capacity</Text>
        </Gauge>
        <Text>Linear</Text>
        <Gauge value={0.5} modifiers={[gaugeStyle('linear')]}>
          <Text>Linear</Text>
        </Gauge>
        <Text>Linear Capacity</Text>
        <Gauge value={0.5} modifiers={[gaugeStyle('linearCapacity')]}>
          <Text>Linear Capacity</Text>
        </Gauge>
      </VStack>
    </Host>
  );
}
~~~

## 修改颜色

用 `tint` modifier 设置 Gauge 颜色；下面分别演示圆形绿色和线性红色：

~~~tsx
import { Host, Gauge, VStack } from '@expo/ui/swift-ui';
import { gaugeStyle, tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedGaugeExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <Gauge
          value={0.7}
          modifiers={[gaugeStyle('circular'), tint('green')]}
        />
        <Gauge
          value={0.3}
          modifiers={[gaugeStyle('linear'), tint('red')]}
        />
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `value` | `number`（必填） | 当前数值。 |
| `min` | `number`，默认 `0` | 量程下界。 |
| `max` | `number`，默认 `1` | 量程上界。 |
| `children` | `React.ReactNode`（可选） | 说明 Gauge 用途的标签。 |
| `currentValueLabel` | `React.ReactNode`（可选） | 当前数值标签。 |
| `minimumValueLabel` | `React.ReactNode`（可选） | 最小值标签。 |
| `maximumValueLabel` | `React.ReactNode`（可选） | 最大值标签。 |

Gauge 还继承 `CommonViewModifierProps`，可应用 `gaugeStyle`、`tint` 等 modifier。

### 新手术语

- **量程 / value range**：仪表允许显示的数值范围，由 `min`、`max` 定义。
- **容量样式**：将从最小值到当前值的已用区间更明显地填充出来。
- **Tint**：影响原生控件强调色的修饰符。

## 源页代码主题覆盖

已覆盖四种安装命令和官方五类示例：基础 Gauge、自定义用途标签、当前 / 最小 / 最大值标签、不同 gaugeStyle 样式及 tint 着色。数值范围和标签属性均列入 API 速查。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/gauge/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/gauge/)

**翻页：**[上一页：SwiftUI Form](./077-SwiftUI-Form.md) · [目录](./README.md) · [下一页：SwiftUI Group](./079-SwiftUI-Group.md)
