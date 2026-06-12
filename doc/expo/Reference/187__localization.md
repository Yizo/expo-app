# Expo Localization 学习文档

`expo-localization` 用于读取用户设备的语言、地区、日历、时区、计量单位等本地化信息，帮助 Expo 和 React Native 应用针对不同语言、地区与文化习惯调整用户体验。

> 本文对应 **Expo 下一版本 SDK** 的未发布文档，原文修改日期为 **2026 年 3 月 18 日**。文档明确指出：当前稳定版本应参考 Expo SDK 56 的 latest 文档。使用本文 API 前，应确认项目实际使用的 Expo SDK 版本。

支持平台：

- Android
- iOS
- tvOS
- Web
- Expo Go

## 这篇文档解决什么问题

它主要回答以下问题：

1. 如何在 Expo 项目中安装和配置 `expo-localization`。
2. 如何读取用户设备的首选语言和地区信息。
3. 如何读取日历、时区、每周起始日和 12/24 小时制等设置。
4. 如何在系统设置变化后更新 React 组件。
5. iOS、Android 和 Web 返回的数据有哪些差异。
6. 每个本地化字段的含义及其可能出现的空值。

适用场景包括：

- 根据设备语言选择应用界面语言。
- 将语言、地区信息提供给 `react-i18next` 等翻译库。
- 判断文本是从左向右还是从右向左显示。
- 根据用户习惯处理货币、数字、小数和分组符号。
- 获取设备时区、日历和 24 小时制偏好。
- 根据地区展示温度或计量单位。
- 构建需要国际化和本地化支持的 Expo、React Native 或 Web 应用。

## 阅读前需要理解的概念

### 国际化与本地化

国际化通常缩写为 i18n，指应用在设计上支持多种语言和地区规则。

本地化通常缩写为 l10n，指针对某个具体语言或地区提供翻译和格式适配，例如：

- 将英文界面翻译成中文。
- 使用 `,` 或 `.` 作为小数分隔符。
- 使用人民币、美元或欧元符号。
- 适配从右向左书写的语言。
- 按用户地区显示摄氏度或华氏度。

`expo-localization` **不是完整的翻译解决方案**。它主要负责读取设备的本地化信息，通常需要配合以下国际化库：

- `lingui-js`
- `react-i18next`
- `react-intl`
- `i18n-js`
- `react-native-intlayer`

可以将它类比为 Web 中的 `navigator.language` 和部分 `Intl` 能力，但它提供了面向原生设备的统一接口和更多设备设置。

### Locale

Locale 是一组语言和地区规则。常见表示方式如下：

```text
en-US
zh-CN
pl-PL
es-419
```

以 `en-US` 为例：

- `en` 是语言代码，表示英语。
- `US` 是地区代码，表示美国。
- 完整值遵循 IETF BCP 47 语言标签规范。

语言和地区不能混为一谈。同一种语言在不同地区可能有不同的日期、货币、拼写和计量习惯。

### Calendar

这里的 Calendar 不是日历 UI 组件，而是设备使用的历法及相关时间偏好，包括：

- 历法类型，例如公历、佛历、伊斯兰历。
- 当前时区。
- 每周从星期几开始。
- 是否使用 24 小时制。

### Expo config plugin 与 CNG

config plugin 用于修改 iOS、Android 原生工程的构建配置。

这与修改 React Web 项目的运行时配置不同：部分原生能力必须在构建 App 二进制文件之前写入原生工程，无法仅靠运行时 JavaScript 修改。

CNG（Continuous Native Generation，持续原生工程生成）是 Expo 根据应用配置生成原生工程的工作流。如果项目使用 CNG，可以通过 `app.json` 中的插件完成配置；如果没有使用 CNG，则需要手动配置对应的原生工程。

## 安装

根据包管理器执行相应命令：

```sh
# npm
npx expo install expo-localization

# yarn
yarn expo install expo-localization

# pnpm
pnpm expo install expo-localization

# bun
bun expo install expo-localization
```

`expo install` 会根据项目使用的 Expo SDK 选择兼容的包版本。它与直接执行 `npm install` 的主要区别，是会考虑 Expo SDK 的版本兼容关系。

如果是在已有的纯 React Native 项目中安装，而不是从 Expo 项目开始，需要先按照 Expo 文档将 `expo` 和 Expo Modules 支持安装到项目中。

## 在应用配置中启用插件

使用 config plugin 和 CNG 的项目可以在 `app.json` 中配置：

```json
{
  "expo": {
    "plugins": ["expo-localization"]
  }
}
```

该插件负责配置无法在运行时设置的原生属性。

需要特别注意：

- 修改 config plugin 配置后，需要重新构建 App 二进制文件才能生效。
- 仅刷新 JavaScript、Fast Refresh 或发布普通 JS 更新不能应用原生配置变化。
- 不使用 CNG 的项目需要手动修改原生工程。
- 当前文档没有列出非 CNG 项目的具体手动配置步骤。

## 获取本地化信息

模块提供两种调用形式：

- 同步方法：适合普通 JavaScript 逻辑和事件处理。
- React Hook：适合组件渲染，并能在系统设置变化后触发重新渲染。

基本导入方式：

```jsx
import { getLocales, getCalendars } from 'expo-localization';
```

## 获取 Locale

### 使用 `getLocales()`

```jsx
import { getLocales } from 'expo-localization';

const locales = getLocales();
const primaryLocale = locales[0];
```

返回类型：

```ts
[Locale, ...Locale[]]
```

这表示数组保证至少包含一个元素。Locale 按用户在设备设置中定义的优先级排列，因此 `locales[0]` 通常是首选语言。

示例结果：

```js
[
  {
    languageTag: 'pl-PL',
    languageCode: 'pl',
    textDirection: 'ltr',
    digitGroupingSeparator: ' ',
    decimalSeparator: ',',
    measurementSystem: 'metric',
    currencyCode: 'PLN',
    currencySymbol: 'zł',
    regionCode: 'PL',
    temperatureUnit: 'celsius'
  }
]
```

### 使用 `useLocales()`

```jsx
import { useLocales } from 'expo-localization';

function Example() {
  const locales = useLocales();
  const primaryLocale = locales[0];

  return null;
}
```

`useLocales()` 与 `getLocales()` 返回相同类型的数据，但它会监听系统设置变化。当操作系统设置发生变化时，使用该 Hook 的组件会获得新数组并重新渲染。

对于需要直接在 UI 中响应语言或地区变化的组件，Hook 通常更符合 React 的数据流。

### Locale 字段说明

| 字段 | 类型 | 含义与开发影响 |
| --- | --- | --- |
| `languageTag` | `string` | 带地区的 BCP 47 语言标签，例如 `en-US`、`es-419`、`pl-PL`。该字段不为空，通常适合作为翻译库选择语言的主要依据。 |
| `languageCode` | `string \| null` | 不含地区的语言代码，例如 `en`、`es`、`pl`。 |
| `languageScriptCode` | `string \| null` | ISO 15924 四字母文字系统代码，例如 `Latn`、`Hans`、`Hebr`。Android 和 Web 在没有相关定义时可能返回 `null`。 |
| `textDirection` | `'ltr' \| 'rtl'` | 文字方向。`ltr` 表示从左到右，`rtl` 表示从右到左。 |
| `regionCode` | `string \| null` | 设备地区代码。iOS 和 Android 从地区设置取得，Web 从 Locale 中解析，因此 Web 上可能为 `null`。 |
| `languageRegionCode` | `string \| null` | 首选语言本身对应的地区。对于 `en-CA` 返回 `CA`；语言没有指定地区时，与 `regionCode` 相同。国际化处理应优先使用 `regionCode`。 |
| `currencyCode` | `string \| null` | 货币代码，例如 `USD`、`EUR`、`PLN`。国际化处理应优先使用该字段。Web 上始终为 `null`。 |
| `currencySymbol` | `string \| null` | `currencyCode` 对应的货币符号，例如 `$`、`€`、`zł`。 |
| `languageCurrencyCode` | `string \| null` | 当前语言 Locale 对应的货币代码。iOS 上与设备地区货币可能不同；Android 上等于 `currencyCode`；Web 上为 `null`。文档建议优先使用 `currencyCode`。 |
| `languageCurrencySymbol` | `string \| null` | `languageCurrencyCode` 对应的符号。文档建议优先使用 `currencySymbol`。 |
| `decimalSeparator` | `string \| null` | 小数分隔符，例如 `.` 或 `,`。 |
| `digitGroupingSeparator` | `string \| null` | 大数字的分组分隔符，例如逗号、句点或空格。 |
| `measurementSystem` | `'metric' \| 'us' \| 'uk' \| null` | 公制、美国制或英国制。Web 上为 `null`。 |
| `temperatureUnit` | `'celsius' \| 'fahrenheit' \| null` | 摄氏度或华氏度。地区代码未知时返回 `null`。 |

### iOS 的地区与语言可能不一致

iOS 允许用户分别设置首选语言和设备地区。因此：

- `currencyCode` 来自“语言与地区”中的设备地区设置。
- `languageCurrencyCode` 来自当前 Locale 列表项对应的语言地区。
- `regionCode` 更适合表达设备当前地区偏好。
- `languageRegionCode` 更适合表达某个语言标签中的地区部分。

例如，用户可能使用英语界面，但将设备地区设为其他国家。此时界面语言和货币地区不一定一致。

Android 没有相同的独立地区选择机制，因此 `languageCurrencyCode` 与 `currencyCode` 相同。

## 获取日历和时间偏好

### 使用 `getCalendars()`

```jsx
import { getCalendars } from 'expo-localization';

const calendars = getCalendars();
const primaryCalendar = calendars[0];
```

返回类型：

```ts
[Calendar, ...Calendar[]]
```

数组保证至少包含一个元素。目前所有平台实际只返回一个 Calendar，但未来某些平台可能返回用户的日历偏好列表。因此，不应假设该 API 永远只有一个元素。

示例：

```js
[
  {
    calendar: 'gregory',
    timeZone: 'Europe/Warsaw',
    uses24hourClock: true,
    firstWeekday: 1
  }
]
```

### 使用 `useCalendars()`

```jsx
import { useCalendars } from 'expo-localization';

function Example() {
  const calendars = useCalendars();
  const primaryCalendar = calendars[0];

  return null;
}
```

当操作系统中的相关设置变化时，`useCalendars()` 会返回新列表并触发组件重新渲染。

### Calendar 字段说明

| 字段 | 类型 | 含义与开发影响 |
| --- | --- | --- |
| `calendar` | `CalendarIdentifier \| null` | Unicode 历法标识，例如 `gregory`。Android 受设备可用历法限制；iOS 会将系统历法标识映射为 Unicode 类型。 |
| `firstWeekday` | `Weekday \| null` | 每周起始日。编号规则见后文。部分浏览器不支持 `Intl.Locale.weekInfo` 时为 `null`。 |
| `timeZone` | `string \| null` | 时区，例如 `America/Los_Angeles`、`Europe/Warsaw`、`GMT+1`。Web 上可能为 `null`。 |
| `uses24hourClock` | `boolean \| null` | 是否使用 24 小时制。部分浏览器不支持 `Intl.Locale.hourCycle` 时为 `null`。 |

## Android 与 iOS 的运行时差异

`getLocales()` 和 `getCalendars()` 都是同步方法，但系统设置变化后的行为存在平台差异。

### iOS

文档明确说明：应用运行期间，方法返回的结果保持不变。

这意味着用户修改语言或地区设置后，当前正在运行的 App 不会通过重新调用方法立即得到新值。不要按照 Web 响应式状态的思路，假定每次调用都能看到最新设置。

### Android

Android 用户可以在不重启 App 的情况下修改 Locale 偏好。为保持数据最新，可以在 App 每次回到前台时重新调用：

```js
getLocales();
getCalendars();
```

React Native 中可以使用 `AppState` 检测应用从后台返回前台。

`AppState` 可以类比为 Web 的页面可见性或窗口生命周期机制，但它反映的是移动 App 的前台、后台状态，而不是浏览器标签页状态。

### Hook 与同步方法的选择

文档明确说明 Hook 会在系统设置变化时重新渲染组件。

基于文档内容推导：

- UI 直接依赖本地化设置时，优先使用 `useLocales()` 或 `useCalendars()`。
- 非 React 模块、初始化逻辑或事件处理需要即时读取时，使用同步方法。
- Android 使用同步方法维护全局国际化状态时，需要结合 `AppState` 主动刷新。
- 不要把模块加载时读取的一次结果永久缓存，否则 Android 设置变化后可能继续使用旧数据。

## 历法标识

`CalendarIdentifier` 对应 Unicode calendar type。公历有两个枚举名称，但值相同：

```js
CalendarIdentifier.GREGORIAN === 'gregory';
CalendarIdentifier.GREGORY === 'gregory';
```

支持的标识如下：

| 枚举 | 值 | 历法 |
| --- | --- | --- |
| `BUDDHIST` | `buddhist` | 泰国佛历 |
| `CHINESE` | `chinese` | 中国传统历法 |
| `COPTIC` | `coptic` | 科普特历 |
| `DANGI` | `dangi` | 韩国传统历法 |
| `ETHIOAA` | `ethioaa` | 埃塞俄比亚 Amete Alem 历 |
| `ETHIOPIC` | `ethiopic` | 埃塞俄比亚 Amete Mihret 历 |
| `GREGORIAN` | `gregory` | 公历别名 |
| `GREGORY` | `gregory` | 公历 |
| `HEBREW` | `hebrew` | 希伯来历 |
| `INDIAN` | `indian` | 印度历 |
| `ISLAMIC` | `islamic` | 伊斯兰历 |
| `ISLAMIC_CIVIL` | `islamic-civil` | 表格式伊斯兰民用历 |
| `ISLAMIC_RGSA` | `islamic-rgsa` | 沙特阿拉伯观测历 |
| `ISLAMIC_TBLA` | `islamic-tbla` | 使用天文纪元的表格式伊斯兰历 |
| `ISLAMIC_UMALQURA` | `islamic-umalqura` | 乌姆库拉历 |
| `ISO8601` | `iso8601` | 使用 ISO 8601 周规则的公历 |
| `JAPANESE` | `japanese` | 日本年号历 |
| `PERSIAN` | `persian` | 波斯历 |
| `ROC` | `roc` | 原文描述为 Civil (algorithmic) Arabic calendar |

平台限制：

- Android 只能返回设备支持的历法类型。
- iOS 会将自己的历法标识映射到 Unicode 类型。
- iOS 没有实现 `dangi` 和 `islamic-rgsa`，因此不会返回这两个值。

## 每周起始日编号

`firstWeekday` 使用以下枚举值：

| 枚举 | 数值 |
| --- | ---: |
| `Weekday.SUNDAY` | `1` |
| `Weekday.MONDAY` | `2` |
| `Weekday.TUESDAY` | `3` |
| `Weekday.WEDNESDAY` | `4` |
| `Weekday.THURSDAY` | `5` |
| `Weekday.FRIDAY` | `6` |
| `Weekday.SATURDAY` | `7` |

这里采用 `1` 到 `7`，并且星期日是 `1`。它不同于 JavaScript `Date.prototype.getDay()` 使用的 `0` 到 `6`：

```js
new Date().getDay(); // 星期日为 0
```

因此，不能直接将 `firstWeekday` 当作 `getDay()` 的结果使用。

## Web 平台限制

虽然该库支持 Web，但浏览器无法提供所有原生设备设置。

文档明确说明：

- `currencyCode` 在 Web 上为 `null`。
- `languageCurrencyCode` 在 Web 上为 `null`。
- `measurementSystem` 在 Web 上为 `null`。
- `regionCode` 从 Locale 解析，可能为 `null`。
- `timeZone` 可能为 `null`。
- 浏览器不支持 `Intl.Locale.weekInfo` 时，`firstWeekday` 为 `null`。
- 浏览器不支持 `Intl.Locale.hourCycle` 时，`uses24hourClock` 为 `null`。

文档提到可以根据地区查表推断 Web 的货币和计量单位，但同时明确指出：通过 Locale 推断计量系统并不可靠，应尽可能询问用户偏好。

因此，类型中的 `null` 不是仅用于兼容 TypeScript 的理论情况。跨平台代码必须准备回退逻辑。

## 容易误解和踩坑的地方

### 它不负责翻译文案

`expo-localization` 提供设备信息，不会：

- 管理翻译文件。
- 根据翻译 key 返回文本。
- 自动切换应用文案。
- 自动格式化全部日期、数字和货币。

应将 `languageTag` 等数据传给专门的国际化库，再由后者负责翻译和格式化。

### 首选语言不等于设备地区

用户可能使用一种语言，同时选择另一个地区。不要仅根据 `languageCode` 推断货币、温度或计量单位。

文档建议进行国际化处理时：

- 优先使用 `regionCode`，而不是 `languageRegionCode`。
- 优先使用 `currencyCode`，而不是 `languageCurrencyCode`。
- 优先使用 `currencySymbol`，而不是 `languageCurrencySymbol`。

### 不要假设数组只有一个元素

`getLocales()` 可能返回多种首选语言，并按用户设置顺序排列。

`getCalendars()` 目前只返回一个元素，但 API 已设计为列表，未来可能返回多个偏好。业务代码可以读取第一个元素作为首选值，但不应把数组结构改造成永久的单值假设。

### 不要忽略平台生命周期

Web 开发者可能习惯在组件首次挂载时读取一次环境信息。Android 允许用户在 App 继续运行时修改 Locale，因此应用返回前台时可能需要更新。

### 不要手工拼接语言标签

`languageTag` 已经是标准 BCP 47 标签。直接使用它通常比自行组合 `languageCode` 和 `regionCode` 更可靠，因为语言标签还可能包含文字系统或特殊地区形式，例如 `es-419`。

### 不要直接按分隔符格式化数字

`decimalSeparator` 和 `digitGroupingSeparator` 描述用户习惯，但手工字符串替换容易产生格式错误。

基于经验建议：实际格式化数字、货币和日期时优先使用 `Intl.NumberFormat`、`Intl.DateTimeFormat` 或国际化库；仅在确实需要了解用户设置时读取这些字段。

### RTL 不只是文本对齐

`textDirection: 'rtl'` 表示从右向左的书写方向。完整 RTL 支持通常还涉及布局方向、图标方向、导航手势和组件排列。

当前 API 文档没有展开 RTL 的具体配置流程，而是指向 Expo Localization 指南。

## 实际开发中的使用方式

一种常见流程是：

1. 安装并配置 `expo-localization`。
2. 通过 `useLocales()` 或 `getLocales()` 获取首选 Locale。
3. 使用 `locales[0].languageTag` 选择国际化库中的翻译资源。
4. 使用 `regionCode`、`currencyCode` 等字段处理地区差异。
5. 对所有声明为可空的字段提供回退值。
6. Android 使用同步方法时，在 App 返回前台后重新读取设置。
7. RTL 应按照 Expo Localization 指南额外配置和测试。

示意代码：

```jsx
import { useLocales } from 'expo-localization';

function LocaleInfo() {
  const [locale] = useLocales();

  return (
    <>
      <Text>语言：{locale.languageTag}</Text>
      <Text>地区：{locale.regionCode ?? '未知'}</Text>
      <Text>文字方向：{locale.textDirection}</Text>
      <Text>货币：{locale.currencyCode ?? '未提供'}</Text>
    </>
  );
}
```

这段代码仅演示数据读取。真实项目还需要将 `languageTag` 传入翻译库，并为设备不支持的语言设计默认语言和回退策略。

## 文档未涉及的内容

当前文档没有提供以下内容的完整实现：

- 翻译资源文件的组织方式。
- `react-i18next` 等第三方库的具体初始化代码。
- 用户在 App 内手动切换语言的状态管理方案。
- RTL 布局的完整配置步骤。
- 不使用 CNG 时的 iOS 和 Android 手动配置细节。
- 日期、货币和数字格式化的完整实现。
- App Store 或 Google Play 中多语言元数据的配置方式。
- Locale 变化后的数据持久化、缓存失效和服务端同步策略。

这些内容不能仅根据当前 API 文档确定，需要参考 Expo Localization 指南、所选国际化库文档及对应平台文档。

## 明确结论与推导结论

### 文档明确说明

- `expo-localization` 用于访问原生设备的本地化信息。
- Locale 和 Calendar API 返回非空数组。
- Hook 会在系统设置变化时触发重新渲染。
- iOS 应用运行期间，同步方法的结果保持不变。
- Android 可以在 App 不重启时修改 Locale，应用返回前台后可重新读取。
- Web 不提供货币和计量系统，部分其他字段也可能为 `null`。
- config plugin 中无法运行时设置的配置，需要重新构建二进制文件。
- `expo-localization` 可以与多种国际化库配合使用。

### 基于文档内容推导

- 组件 UI 直接依赖设备设置时，使用 Hook 比永久缓存同步读取结果更合适。
- Android 上依赖同步方法维护全局 Locale 时，需要将前台恢复纳入刷新流程。
- 跨平台业务模型不能将 Web 上缺失的字段声明为必填。
- 选择翻译资源时，应首先考虑首选 `languageTag`，并为不支持的语言提供回退策略。
- 语言、地区和货币需要作为不同维度处理，不能仅凭界面语言推断全部本地化规则。
- 由于日历 API 已返回数组，即使当前只有一个元素，也应保留未来支持多个偏好的可能性。

## 总结

`expo-localization` 的核心职责是将 iOS、Android、tvOS 和 Web 的本地化设置转换为统一的 JavaScript API。

使用时最重要的原则是：

- 将它作为设备本地化信息来源，而不是翻译框架。
- 区分语言、语言所属地区和设备地区。
- 正确处理 iOS、Android 与 Web 的行为差异。
- 对所有可能为 `null` 的数据提供回退方案。
- 使用 Hook 响应设置变化，或在 Android 返回前台时主动重新读取。
- 原生配置发生变化后重新构建 App。
- 使用稳定 SDK 时，以对应版本文档为准，不要直接假定未发布版本 API 完全适用。

---

## 文档导航

- **上一页**：[local authentication](./186__local-authentication.md)
- **下一页**：[location](./188__location.md)
