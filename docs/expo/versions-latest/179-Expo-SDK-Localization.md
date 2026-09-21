# 179｜Expo SDK Localization 地区与语言设置

**翻页：**[上一页：Expo SDK LocalAuthentication 本地生物识别](./178-Expo-SDK-LocalAuthentication.md) · [目录](./README.md) · [下一页：Expo SDK Location](./180-Expo-SDK-Location.md)

**官方页面：**[Localization · Latest](https://docs.expo.dev/versions/latest/sdk/localization/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/localization/) · [Expo 本地化指南（含 RTL）](https://docs.expo.dev/guides/localization/)

**版本与平台：**Latest 推荐 `expo-localization ~57.0.2`；SDK v56.0.0 推荐 `~56.0.6`。支持 Android、iOS、tvOS、Web，并可在 Expo Go 使用。

## 这个模块提供什么

**本地化（localization）**是让应用适应用户语言、地区和文化偏好，例如日期格式、货币符号、数字小数点、测量单位和文字方向。`expo-localization` 主要读取操作系统提供的用户设置；它不是翻译文案库，也不会替你把页面中的字符串自动翻译。应用可将设备信息交给 i18n 工具，再用本地字典渲染翻译后的文本。

**Locale（地区语言配置）**和单一“语言”不同。一个 locale 通常含语言、地区、文字方向、货币和度量偏好。例如 `zh-CN` 表示中文（中国地区），`en-CA` 表示英语（加拿大地区）。用户可按优先顺序设置多个 locale，组件返回的数组会保持该顺序。

## 安装与 app config

```sh
npx expo install expo-localization
yarn expo install expo-localization
pnpm expo install expo-localization
bun expo install expo-localization
```

在现有 React Native 工程使用前，还需要接入 `expo`。使用 config plugin / Continuous Native Generation（CNG）时，可在 app config 启用插件：

```json
{
  "expo": {
    "plugins": ["expo-localization"]
  }
}
```

该插件配置需要构建时应用的原生设置；不是 CNG 工程需要按原生工程方式手动完成库的配置。SDK 页面没有列出可传入该插件的额外选项。

## 读取语言与日历偏好

模块可用同步方法读取快照，也有 React Hook 订阅系统偏好：

```tsx
import { useCalendars, useLocales } from 'expo-localization';
import { Text, View } from 'react-native';

export function DevicePreferences() {
  const locales = useLocales();
  const calendars = useCalendars();
  const preferredLocale = locales[0];
  const preferredCalendar = calendars[0];

  return (
    <View>
      <Text>语言：{preferredLocale.languageTag}</Text>
      <Text>地区：{preferredLocale.regionCode ?? '未提供'}</Text>
      <Text>方向：{preferredLocale.textDirection}</Text>
      <Text>日历：{preferredCalendar.calendar ?? '未提供'}</Text>
      <Text>时区：{preferredCalendar.timeZone ?? '未提供'}</Text>
    </View>
  );
}
```

`useLocales()` 返回 `Locale[]`，`useCalendars()` 返回 `Calendar[]`；两者都保证至少有一项。文档目前描述为系统改变时会触发 Hook 更新，但 iOS 的底层本地化结果在应用运行期间保持不变。Android 用户可能在不重启应用的情况下改系统语言 / 区域设置；如果通过命令式方法读取，应在应用回到前台时重新取值。

```ts
import { AppState } from 'react-native';
import { getCalendars, getLocales } from 'expo-localization';

export function refreshDevicePreferences(onChange: (value: unknown) => void) {
  const subscription = AppState.addEventListener('change', state => {
    if (state === 'active') {
      onChange({ locales: getLocales(), calendars: getCalendars() });
    }
  });

  return () => subscription.remove();
}
```

`getLocales()` 和 `getCalendars()` 都是**同步方法**。React 组件内优先考虑 Hook；在普通函数或需要主动刷新快照时使用方法。`AppState` 是 React Native 用来侦测应用前台 / 后台状态的 API；卸载监听时调用 `remove()`。

## 日历对象示例

`useCalendars()` / `getCalendars()` 返回的数组至少有一项，当前平台通常只有一个；文档指出未来某些平台可能提供用户优先列表。一个可能的对象形状如下，实际值由设备设置决定：

```json
[
  {
    "calendar": "gregory",
    "timeZone": "Asia/Shanghai",
    "uses24hourClock": true,
    "firstWeekday": 2
  }
]
```

`firstWeekday` 对应 `Weekday` 枚举，通常 Sunday 是 1、Saturday 是 7；在上例中 2 代表 Monday。不同地区的周起始日可以不同，渲染日历时应使用系统返回值而非写死星期顺序。

## Locale 对象示例

`useLocales()` / `getLocales()` 返回的数组顺序来自用户系统设置；第 0 项是最高优先级 locale。文档示例包含语言、方向、数字格式、度量、货币、地区和温度偏好。以下数据仅演示字段形状：

```json
[
  {
    "languageTag": "zh-CN",
    "languageCode": "zh",
    "textDirection": "ltr",
    "digitGroupingSeparator": ",",
    "decimalSeparator": ".",
    "measurementSystem": "metric",
    "currencyCode": "CNY",
    "currencySymbol": "¥",
    "regionCode": "CN",
    "temperatureUnit": "celsius"
  }
]
```

在 Web 上，部分操作系统没有暴露原生设置：`currencyCode`、`languageCurrencyCode` 和 `measurementSystem` 会是 `null`；`regionCode` 也可能无法解析。不要默认这些可选区域字段一定有值。

## API 方法与 Hook

| API | 返回值 | 行为 |
| --- | --- | --- |
| `useLocales()` | `[Locale, ...Locale[]]` | 订阅并读取 locale 数组；至少一项；系统设置变化时可能重渲染。Web 上货币 / 度量字段可为 `null`。 |
| `useCalendars()` | `[Calendar, ...Calendar[]]` | 订阅并读取日历偏好；至少一项；系统设置变化时可能重渲染。 |
| `getLocales()` | `[Locale, ...Locale[]]` | 同步读取当前 locale 列表，按用户优先级排序。 |
| `getCalendars()` | `[Calendar, ...Calendar[]]` | 同步读取当前日历列表。 |

## `Calendar` 类型

| 属性 | 类型 | 含义与平台差异 |
| --- | --- | --- |
| `calendar` | `CalendarIdentifier \| null` | 日历系统标识。Android 受设备可用日历类型限制；iOS 会把系统标识映射为 Unicode calendar 类型，当前不会返回 iOS 未实现的 `dangi` 与 `islamic-rgsa`。 |
| `firstWeekday` | `Weekday \| null` | 一周第一天，常见值 Sunday 为 `1`、Saturday 为 `7`；不支持 `Intl.Locale.weekInfo` 的浏览器可为 `null`。 |
| `timeZone` | `string \| null` | 时区标识，如 `America/Los_Angeles`、`Europe/Warsaw`、`GMT+1`；Web 可为 `null`。 |
| `uses24hourClock` | `boolean \| null` | 用户是否使用 24 小时制；部分不支持 `Intl.Locale.hourCycle` 的浏览器可为 `null`。 |

## `Locale` 类型

| 属性 | 类型 | 含义与平台差异 |
| --- | --- | --- |
| `currencyCode` | `string \| null` | 当前地区货币代码，如 `USD`、`EUR`、`PLN`。iOS 读取“语言与地区”里的 Region 设置；Android 按 locale 提供；Web 返回 `null`。 |
| `currencySymbol` | `string \| null` | `currencyCode` 对应符号，如 `$`、`€`、`zł`。 |
| `decimalSeparator` | `string \| null` | 小数分隔符，如 `.` 或 `,`。 |
| `digitGroupingSeparator` | `string \| null` | 大数字分组符号，如 `,` 或 `.`。 |
| `languageCode` | `string \| null` | 不含地区部分的语言码，如 `en`、`es`、`pl`。 |
| `languageCurrencyCode` | `string \| null` | 语言 locale 对应的货币；iOS 取当前语言项的货币，Android 与 `currencyCode` 相同，Web 为 `null`。做国际化货币格式化时优先使用 `currencyCode`。 |
| `languageCurrencySymbol` | `string \| null` | `languageCurrencyCode` 对应的符号；优先使用 `currencySymbol`。 |
| `languageRegionCode` | `string \| null` | 首选语言的地区，如语言为 `en-CA` 时为 `CA`；语言没有特定地区时回退到 `regionCode`。官方建议内部国际化用途优先使用 `regionCode`。 |
| `languageScriptCode` | `string \| null` | ISO 15924 四字母文字系统代码，如 `Latn`、`Hans`、`Hebr`；Android / Web 上可能为空。 |
| `languageTag` | `string` | 含地区的 IETF BCP 47 标签，如 `en-US`、`es-419`、`pl-PL`。 |
| `measurementSystem` | `'metric' \| 'us' \| 'uk' \| null` | 公制、美制或英国度量系统。Web 不暴露用户所选系统，返回 `null`；不要只凭地区猜测偏好，合适时让用户选择。 |
| `regionCode` | `string \| null` | 系统 Region 设置；Web 从 locale 解析，可能为 `null`，例如 `US`。 |
| `temperatureUnit` | `'celsius' \| 'fahrenheit' \| null` | 温度单位；地区未知时为 `null`。 |
| `textDirection` | `'ltr' \| 'rtl'` | 从左到右或从右到左文字方向。RTL 是 right-to-left 的缩写，阿拉伯语等语言常用。 |

## `CalendarIdentifier` 枚举

枚举值使用 Unicode 日历类型字符串。`GREGORIAN` 和 `GREGORY` 是同一个 `'gregory'` 值的别名。

| 成员 | 字符串值 | 含义 |
| --- | --- | --- |
| `BUDDHIST` | `'buddhist'` | 泰国佛历。 |
| `CHINESE` | `'chinese'` | 传统中国历。 |
| `COPTIC` | `'coptic'` | 科普特历。 |
| `DANGI` | `'dangi'` | 传统韩国历。 |
| `ETHIOAA` | `'ethioaa'` | 埃塞俄比亚历 Amete Alem 纪元。 |
| `ETHIOPIC` | `'ethiopic'` | 埃塞俄比亚历 Amete Mihret 纪元。 |
| `GREGORIAN` | `'gregory'` | 公历别名。 |
| `GREGORY` | `'gregory'` | 公历。 |
| `HEBREW` | `'hebrew'` | 希伯来历。 |
| `INDIAN` | `'indian'` | 印度历。 |
| `ISLAMIC` | `'islamic'` | 伊斯兰历。 |
| `ISLAMIC_CIVIL` | `'islamic-civil'` | 伊斯兰民用表算法历。 |
| `ISLAMIC_RGSA` | `'islamic-rgsa'` | 沙特阿拉伯观月伊斯兰历。 |
| `ISLAMIC_TBLA` | `'islamic-tbla'` | 伊斯兰天文纪元表算法历。 |
| `ISLAMIC_UMALQURA` | `'islamic-umalqura'` | 乌姆·库拉伊斯兰历。 |
| `ISO8601` | `'iso8601'` | 按 ISO 8601 周规则计算的公历。 |
| `JAPANESE` | `'japanese'` | 日本年号历。 |
| `PERSIAN` | `'persian'` | 波斯历。 |
| `ROC` | `'roc'` | 官方页面注释为民用（算法）阿拉伯历。 |

虽然 API 暴露这些枚举值，实际设备返回哪些值仍由平台支持情况决定。iOS 当前不会返回 `DANGI` 或 `ISLAMIC_RGSA`。

## `Weekday` 枚举

这些数字是 `firstWeekday` 的索引，注意它使用 1–7，而不是 JavaScript 常见的 `Date.getDay()`（0–6）：

| 成员 | 数值 | 星期 |
| --- | ---: | --- |
| `SUNDAY` | `1` | 星期日。 |
| `MONDAY` | `2` | 星期一。 |
| `TUESDAY` | `3` | 星期二。 |
| `WEDNESDAY` | `4` | 星期三。 |
| `THURSDAY` | `5` | 星期四。 |
| `FRIDAY` | `6` | 星期五。 |
| `SATURDAY` | `7` | 星期六。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-localization ~57.0.2`；SDK v56.0.0 推荐 `~56.0.6`。
- 两版页面中的配置插件、四个读取 API、行为说明、Locale / Calendar 类型和两个枚举相同，只有 SDK 推荐的包版本不同。
- 两版页脚 Next 均为 Expo SDK Location。

## 源页代码主题覆盖

- Installation / Config：覆盖四种官方安装命令、已有 React Native 工程需有 Expo，以及完整 `plugins: ["expo-localization"]` app config 示例。
- API import：覆盖 `getLocales` 与 `getCalendars` 命名导入；另在 Hook 示例中展示 `useLocales`、`useCalendars`。
- Hook 示例：覆盖 `useCalendars()` 与 `useLocales()` 的数组返回形态及官方 JSON 对象示例中的日历、时区、24 小时制、周起始日、语言、方向、数字分隔、度量、货币、地区、温度字段。
- 方法示例：覆盖同步 `getCalendars()` / `getLocales()` 与 Android 回到前台时用 AppState 重读的场景；完整字段在上述类型表逐项说明。
- API 类型：列出 `Calendar` 全部属性与平台空值条件、`Locale` 全部 14 个属性及 Web / iOS / Android 差异。
- Enums：列全 19 个 `CalendarIdentifier` 成员及字符串值（含 Gregorian 别名），以及 `Weekday` 的 1–7 值。
- 范围：参考页没有 app 文案翻译示例；它提供系统 locale 元数据，实际字符串资源与 RTL 页面布局需配合应用的国际化实现。

**翻页：**[上一页：Expo SDK LocalAuthentication 本地生物识别](./178-Expo-SDK-LocalAuthentication.md) · [目录](./README.md) · [下一页：Expo SDK Location](./180-Expo-SDK-Location.md)
