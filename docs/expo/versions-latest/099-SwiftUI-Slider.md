# 099｜SwiftUI Slider

**翻页：**[上一页：SwiftUI SecureField](./098-SwiftUI-SecureField.md) · [目录](./README.md) · [下一页：SwiftUI Spacer](./100-SwiftUI-Spacer.md)

**官方页面：**[SwiftUI Slider · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/slider/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/slider/)推荐 `~56.0.26`。SwiftUI Slider 仅支持 iOS，可在 Expo Go 使用。需要跨平台滑块请看 Expo UI universal Slider。

## 在区间内拖动选择数值

`Slider` 是连续值输入控件。`value` 表示当前值，`min` / `max` 定义范围，`onValueChange` 在拖动时持续返回新值。`step` 可将连续区间划分成离散档位。滑块横向撑满可用宽度，没有固有宽度；Host 使用 `matchContents` 时需要给 Slider 加 `frame`，或给 Host / Form 提供明确宽度。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本滑块

~~~tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function BasicSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host style={{ flex: 1 }}>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
~~~

## 自定义数值范围

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function CustomRangeSliderExample() {
  const [value, setValue] = useState(75);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

## 以 step 设定离散档位

`step={10}` 表示 0 到 100 间以 10 为间隔选择；设为 `0` 表示不使用固定步长，可连续取值：

~~~tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function SteppedSliderExample() {
  const [value, setValue] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        step={10}
        onValueChange={setValue}
      />
    </Host>
  );
}
~~~

## 添加用途和范围标签

`label` 说明滑块用途；`minimumValueLabel`、`maximumValueLabel` 标出两端值：

~~~tsx
import { useState } from 'react';
import { Host, Slider, Text } from '@expo/ui/swift-ui';

export default function LabeledSliderExample() {
  const [value, setValue] = useState(50);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        label={<Text>Volume</Text>}
        minimumValueLabel={<Text>0</Text>}
        maximumValueLabel={<Text>100</Text>}
        onValueChange={setValue}
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number`（可选） | 当前数值。 |
| `min` / `max` | `number`（可选） | 滑块轨道显示的范围；改变范围不会自动触发 change callback，即使当前 value 超出。 |
| `lowerLimit` / `upperLimit` | `number`（可选） | 限制用户可拖动到的下限 / 上限；显示轨道仍保持完整 `min..max` 范围。 |
| `step` | `number`（可选） | 离散步长；`0` 表示连续值。 |
| `onValueChange` | `(value: number) => void`（可选） | 用户拖动滑块时回调。 |
| `onEditingChanged` | `(isEditing: boolean) => void`（可选） | 用户开始或结束拖动编辑时回调。 |
| `label` | `React.ReactNode`（可选） | 描述滑块用途的标签。 |
| `minimumValueLabel` / `maximumValueLabel` | `React.ReactNode`（可选） | 范围两端的说明内容。 |

组件继承 `CommonViewModifierProps`。

### 新手术语

- **连续值输入**：拖动可以产生细粒度的数值，不限于开 / 关状态。
- **step / 步长**：离散值间距；例如 step 10 表示 20 → 30 → 40。
- **thumb / 滑块拇指点**：轨道上用户拖动的小圆点。
- **lowerLimit / upperLimit**：限制用户拖动边界，但不会改变轨道标尺的 `min` / `max`。

## 源页代码主题覆盖

已覆盖四种安装命令与官方四种滑块示例：基础受控值、自定义 min/max、step 离散档位、用途及最小 / 最大标签；并说明柔性宽度控件与 Host 尺寸的关系。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/slider/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/slider/)

**翻页：**[上一页：SwiftUI SecureField](./098-SwiftUI-SecureField.md) · [目录](./README.md) · [下一页：SwiftUI Spacer](./100-SwiftUI-Spacer.md)
