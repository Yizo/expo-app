# 074｜SwiftUI DatePicker

**翻页：**[上一页：SwiftUI ControlGroup](./073-SwiftUI-ControlGroup.md) · [目录](./README.md) · [下一页：SwiftUI DisclosureGroup](./075-SwiftUI-DisclosureGroup.md)

**官方页面：**[SwiftUI DatePicker · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/datepicker/)推荐 `~56.0.26`。这是 SwiftUI 日期与时间选择控件，仅支持 iOS，可在 Expo Go 使用。

## 选择日期和时间

Expo UI `DatePicker` 对应 SwiftUI 的原生日期选择控件。它把当前 `Date` 作为 `selection`，在用户调整后通过 `onDateChange` 返回新的 `Date`。`displayedComponents` 用来选择显示日期、时分或两者。控件放入 `Host` 中。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 只选择日期

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';

export default function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

## 只选择时间

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';

export default function TimePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Select a time"
        selection={selectedDate}
        displayedComponents={['hourAndMinute']}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

## 同时选择日期和时间

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';

export default function DateTimePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Select date and time"
        selection={selectedDate}
        displayedComponents={['date', 'hourAndMinute']}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

## 限定可选日期范围

`range.start` 和 `range.end` 限制用户能选择的日期。JavaScript `Date` 构造函数的月份从 0 开始，因此下面的 `0` 表示一月、`11` 表示十二月：

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';

export default function DateRangePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        range={{
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31),
        }}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

## 滚轮与图形日历样式

`datePickerStyle` 可设置 `automatic`、`compact`、`graphical` 或 `wheel`。下面保留官方滚轮与图形日历两个示例：

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

export default function WheelDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        modifiers={[datePickerStyle('wheel')]}
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

export default function GraphicalDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        modifiers={[datePickerStyle('graphical')]}
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => setSelectedDate(date)}
      />
    </Host>
  );
}
~~~

## 禁用选择器

用 `disabled()` modifier 让控件不可交互：

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';

export default function DisabledDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => setSelectedDate(date)}
        modifiers={[disabled()]}
      />
    </Host>
  );
}
~~~

## 指定显示语言

使用 `environment('locale', locale)` modifier 改变日期文字的语言与格式：

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { environment } from '@expo/ui/swift-ui/modifiers';

export default function LocaleDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Sélectionner la date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => setSelectedDate(date)}
        modifiers={[environment('locale', 'fr_FR')]}
      />
    </Host>
  );
}
~~~

## 指定时区

`environment('timeZone', zone)` 接收 IANA 时区名称，例如 `Asia/Tokyo`：

~~~tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';
import { environment } from '@expo/ui/swift-ui/modifiers';

export default function TimeZoneDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <Host style={{ flex: 1 }}>
      <DatePicker
        title="Tokyo time"
        selection={selectedDate}
        displayedComponents={['date', 'hourAndMinute']}
        onDateChange={date => setSelectedDate(date)}
        modifiers={[environment('timeZone', 'Asia/Tokyo')]}
      />
    </Host>
  );
}
~~~

## API 与类型

| 属性 / 类型 | 用途 |
| --- | --- |
| `children?: React.ReactNode` | 可选的自定义标签内容。 |
| `title?: string` | 显示在选择器上的标题 / 标签。 |
| `selection?: Date` | 当前选择的日期时间。 |
| `onDateChange?: (date: Date) => void` | 选择变化时调用。 |
| `displayedComponents?: DatePickerComponent[]` | 显示 `date` 和/或 `hourAndMinute`；默认 `['date']`。 |
| `range?: DateRange` | 限制可选择日期的范围。 |
| `DatePickerComponent` | 字面值类型：`'date' \| 'hourAndMinute'`。 |
| `DateRange.start?: Date` / `DateRange.end?: Date` | 可选的下界 / 上界。 |

该组件继承 `CommonViewModifierProps`，所以也可使用日期选择样式、disabled、locale、timeZone 等 modifier。

### 新手术语

- **JavaScript `Date`**：表示时间点的对象；选择器用同一种类型收发日期和时间。
- **locale**：地区语言设置，决定日期文本和顺序如何本地化。
- **IANA 时区**：标准时区名称，例如 `Asia/Tokyo`、`America/Los_Angeles`。
- **modifier**：对原生控件应用样式或环境行为的 Expo UI 函数。

## 源页代码主题覆盖

已覆盖四种安装命令和官方九种选择器示例：选择日期、时间、日期与时间、日期范围、Wheel / Graphical 样式、禁用状态、自定义语言区域及 IANA 时区。API 表保留 selection、组件类型、日期范围和变更回调。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/datepicker/)

**翻页：**[上一页：SwiftUI ControlGroup](./073-SwiftUI-ControlGroup.md) · [目录](./README.md) · [下一页：SwiftUI DisclosureGroup](./075-SwiftUI-DisclosureGroup.md)
