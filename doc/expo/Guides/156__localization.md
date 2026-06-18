# 本地化 (Localization)

> 原文地址：https://docs.expo.dev/guides/localization/

本指南介绍如何在 Expo 应用中通过 `expo-localization` 包实现多语言支持的初始配置。将软件适配到不同的文化和语言背景可以提升用户体验——确保用户看到熟悉的货币、翻译内容，以及根据其设备设置正确格式化的数字和列表。

我们将使用 `expo-localization` 包来获取语言偏好设置，并使用 `i18n-js` 来演示多语言实现。

---

## 获取用户的语言设置

要获取当前活跃语言，需要使用 `expo-localization` 包。在终端中执行以下命令进行安装：

```sh
npx expo install expo-localization
```

**命令说明**：`npx expo install` 是 Expo 推荐的包安装方式，它会自动选择与当前 SDK 版本兼容的包版本，避免版本冲突问题。

安装完成后，即可在应用中获取设备的语言信息：

```tsx
import { getLocales } from 'expo-localization';

const deviceLanguage = getLocales()[0].languageCode;
```

**代码说明**：
- `getLocales()` 函数返回一个按用户偏好排序的区域设置列表，列表中始终至少包含一个条目。
- `[0]` 取列表中优先级最高的区域设置。
- `.languageCode` 获取语言代码（如 `en`、`ja`、`zh` 等）。

现代移动操作系统允许为每个应用单独设置语言，因此在大多数情况下无需在应用内实现自定义的语言切换界面。

不过，自定义界面在某些特定场景下仍然有用。一般来说，可以允许用户修改以下内容：

- 度量单位（公制/英制、温度、货币）——如果应用中适度使用这些单位的话。
- 目标平台上没有默认 API 可获取的设置（请查阅相关 API 文档确认）。

### 通过系统设置启用应用级别的语言选择

移动平台允许用户在系统偏好设置中为单个应用选择特定语言。你的应用需要声明所支持的区域才能启用此功能。

通过 `supportedLocales` 属性来配置插件，可以直接传入数组，也可以使用平台特定的键：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-localization",
        {
          "supportedLocales": {
            "ios": ["en", "ja"],
            "android": ["en", "ja"]
          }
        }
      ]
    ]
  }
}
```

**配置说明**：
- `expo.plugins`：Expo 的配置插件数组，用于在预构建（prebuild）阶段修改原生项目配置。
- `supportedLocales`：声明应用支持的区域列表。可以分别为 `ios` 和 `android` 指定不同的列表。
- 对于 **Android**，请参考官方的区域命名规范和常用区域列表。
- 对于 **iOS**，使用 ISO 标识符或语言名称即可。

> （基于经验建议）如果你的应用同时支持中英文，建议将 `supportedLocales` 设置为 `["zh-Hans", "zh-Hant", "en"]`，以覆盖简体中文、繁体中文和英文。

---

## 翻译应用

手动管理多语言字符串非常繁琐，强烈建议使用专门的国际化库。

为了演示英文和日文的支持，我们使用 `i18n-js` 包：

```sh
npx expo install i18n-js
```

后续可以查看其他翻译库来找到最适合你的方案。

接下来，设置应用的语言：

```tsx
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// 设置你想要支持的不同语言的键值对
const i18n = new I18n({
  en: { welcome: 'Hello' },
  ja: { welcome: 'こんにちは' },
});

// 在应用启动时设置一次区域
i18n.locale = getLocales().at(0)?.languageCode ?? 'en'; // 也可以使用 getLocales()[0].languageCode ?? 'en'

console.log(i18n.t('welcome'));
```

**代码说明**：
- `new I18n({...})`：创建 I18n 实例，传入各语言的翻译键值对。
- `i18n.locale`：设置当前使用的区域标识。
- `i18n.t('welcome')`：通过键名获取对应的翻译文本。`t` 是 `translate` 的缩写。
- `?? 'en'`：空值合并运算符，当设备语言代码为 `null` 或 `undefined` 时，回退到英文。

现在你可以在整个项目中使用 `i18n.t` 方法来翻译文本。

对于通用术语（如人名等），只需在基础语言中定义一次，然后通过 `i18n.enableFallback = true;` 启用回退机制。

**平台差异**：
- **Android**：更改设备语言不会重启应用。需要使用 `AppState` API 监听状态变化，并重新获取区域设置。
- **iOS**：更改系统语言会强制重启应用，因此只需在初始时设置语言，无需动态更新组件。

### 完整示例

```tsx
import { View, StyleSheet, Text } from 'react-native';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// 设置你想要支持的不同语言的键值对
const translations = {
  en: { welcome: 'Hello', name: 'Charlie' },
  ja: { welcome: 'こんにちは' },
};
const i18n = new I18n(translations);

// 在应用启动时设置一次区域
i18n.locale = getLocales()[0].languageCode ?? 'en';

// 当某个语言缺少某个键时，会回退到其他包含该键的语言
i18n.enableFallback = true;
// 要查看回退机制，可以取消注释下面这行来强制使用日语
// i18n.locale = 'ja';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {i18n.t('welcome')} {i18n.t('name')}
      </Text>
      <Text>Current locale: {i18n.locale}</Text>
      <Text>Device locale: {getLocales()[0].languageCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 20,
    marginBottom: 16,
  },
});
```

**代码说明**：
- `translations` 对象中，`en` 定义了 `welcome` 和 `name` 两个键，而 `ja` 只定义了 `welcome`。
- 当 `i18n.locale` 为 `ja` 时，调用 `i18n.t('name')` 会因为日语中没有该键而回退到英语的 `"Charlie"`（前提是 `enableFallback = true`）。
- 这是一个很好的演示，说明回退机制如何保证翻译的完整性。

### 其他翻译库

虽然本指南使用 `i18n-js`，但还有许多其他选择。翻译是一项重要的工程，选择工具时应考虑以下因素：

- 与管理平台的兼容性，用于自动化和字符串处理。
- 为字符串提供上下文，以便人工审核和 AI 工具使用。
- 在 React/JSX 环境中的开发体验，包括 ESLint 集成。
- 依赖标准化的 `Intl` API 来格式化日期和数字，而不是手动进行本地化。

以下是可考虑的替代方案：

| 库名 | 特点 |
|------|------|
| **Lingui** | 强大的选项，对 React（包括 RSC）和管理工具集成有出色的兼容性 |
| **fbtee** | 灵活直观的 JavaScript 和 React 国际化框架 |
| **React i18next** | 基于 `i18next` 构建的可靠且活跃维护的解决方案 |
| **Intlayer** | 组件级别的库，具有提取器和 AI 工具，针对性能和包体积进行了优化 |

> （基于经验建议）对于大型项目，推荐使用 Lingui 或 React i18next，它们拥有更完善的工具链和更大的社区支持。对于小型项目，`i18n-js` 已经足够轻量好用。

### 翻译应用元数据

当面向全球分发应用时，需要通过应用配置文件为系统对话框和显示名称提供本地化字符串。首先，在 iOS 的 Info.plist 中启用 `CFBundleAllowMixedLocalizations`，然后在 `locales` 下映射文件路径。

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleAllowMixedLocalizations": true
      }
    },
    "locales": {
      "ja": "./languages/japanese.json"
    }
  }
}
```

**配置说明**：
- `CFBundleAllowMixedLocalizations`：iOS 配置项，允许应用使用多种本地化字符串。
- `locales`：键为语言标识符（2 字母代码，可选带区域如 `en-US`），值为指向 JSON 文件的路径。

JSON 文件的结构如下：

```json
{
  "ios": {
    "CFBundleDisplayName": "こんにちは",
    "NSContactsUsageDescription": "日本語のこれらの言葉",
    "Localizable.strings": {
      "HELLO_NOTIFICATION_KEY": "こんにちは世界"
    }
  },
  "android": {
    "app_name": "こんにちは",
    "HELLO_NOTIFICATION_KEY": "こんにちは世界"
  }
}
```

**字段说明**：
- `CFBundleDisplayName`：iOS 上应用的显示名称。
- `NSContactsUsageDescription`：iOS 系统权限对话框中显示的文本（此处为通讯录访问权限说明）。
- `Localizable.strings`：iOS 原生本地化字符串对象，可用于本地化远程通知等场景。
- `app_name`：Android 上的应用名称。

配置完成后，当设备使用日语时，安装的该应用将显示日语名称。

从 SDK 55 起，iOS 支持 `Localizable.strings` 对象来生成原生文件，这对本地化远程通知非常有用。

---

## 启用 RTL（从右到左）支持

许多文化是从右到左阅读的。正确的本地化需要为这些地区适配布局和文字方向。

通过配置插件将 `extra.supportsRTL` 设为 `true` 来激活 RTL 功能：

```json
{
  "expo": {
    "extra": {
      "supportsRTL": true
    },
    "plugins": ["expo-localization"]
  }
}
```

**配置说明**：
- `extra.supportsRTL`：告知 Expo 框架你的应用支持 RTL 布局。
- `plugins` 中需要添加 `expo-localization` 插件。

此配置会在 Expo Go、开发客户端和 EAS Build 输出中激活 RTL。

应用启动时，框架会检查设备的区域是否需要 RTL 渲染（例如阿拉伯语或希伯来语）。

### 强制 RTL 布局

要测试或将应用专门限制为 RTL 区域，可启用 `extra.forcesRTL` 属性：

```json
{
  "expo": {
    "extra": {
      "supportsRTL": true,
      "forcesRTL": true
    },
    "plugins": ["expo-localization"]
  }
}
```

**说明**：`forcesRTL` 会强制应用使用 RTL 布局，无论设备语言设置如何。这对于 RTL 语言的测试非常有用。

#### 动态覆盖 RTL 设置

如果想通过代码而非静态配置来改变方向检测，可以在代码中进行修改。注意，这在 Expo Go 中无法工作，因为启动器会重置这些偏好设置。

```tsx
import { Text, View, StyleSheet, I18nManager, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

export default function App() {
  const shouldBeRTL = true;

  if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    Updates.reloadAsync();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{I18nManager.isRTL ? ' RTL' : ' LTR'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8,
  },
  paragraph: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    width: '50%',
    backgroundColor: 'pink',
  },
});
```

**代码说明**：
- `I18nManager.isRTL`：读取当前是否为 RTL 布局。
- `I18nManager.allowRTL()`：设置是否允许 RTL 布局。
- `I18nManager.forceRTL()`：强制使用或禁用 RTL 布局。
- `Updates.reloadAsync()`：重新加载应用以使方向变更生效。
- `Platform.OS !== 'web'`：Web 平台不需要此逻辑。

---

## 让应用在 RTL 区域正确运行

### 布局和视图

无需手动调整 `<View>` 的样式。`alignItems` 和 `justifyContent` 等属性会自动适配。

- 在 **LTR**（从左到右）环境中，`start` 和 `end` 分别对应 `left` 和 `right`。
- 在 **RTL**（从右到左）环境中，`start` 和 `end` 分别对应 `right` 和 `left`。

> （基于文档内容推导）这意味着在编写样式时，应尽量使用 `start`/`end` 而非 `left`/`right`，这样布局会自动适配两种方向。更多信息可参考 React Native 官方博客关于 RTL 支持的文章。

#### Web 端支持

浏览器环境下无需修改配置文件来支持 RTL。

由于 Expo 使用 `react-native-web`，需要在根 `<View>` 上添加 `dir` 属性以确保自动适配：

```tsx
import { View } from 'react-native';
import { getLocales } from 'expo-localization';
// ...

return <View dir={getLocales()[0].textDirection || 'ltr'}>...</View>;
```

**代码说明**：
- `dir` 属性接受 `"ltr"` 或 `"rtl"` 值，控制元素的文字方向。
- `getLocales()[0].textDirection`：从设备区域设置中获取文字方向。
- `|| 'ltr'`：如果获取不到方向信息，默认使用从左到右。

> 注意：较旧的浏览器和 Firefox 可能不支持 `textDirection`。如有需要，请实现手动检测。

### 文本对齐

与 flex 属性不同，`textDirection` 属性不接受 `start` 或 `end` 值。取而代之的是，`left` 表现为 `start`（LTR 中左对齐，RTL 中右对齐），`right` 表现为 `end`。

如果不设置 `textDirection`，默认在所有布局中使用绝对左对齐。因此，需要在每个 `<Text>` 元素上显式设置 `textDirection: left` 或 `right` 以实现正确的对齐。

建议将此逻辑封装到一个可复用的自定义组件中：

```tsx
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

const MobileText = (props: RNTextProps) => {
  return <RNText style={{ textAlign: 'left', ...props.style }} {...props} />;
};
export default MobileText;
```

**代码说明**：通过 `textAlign: 'left'` 确保在 RTL 环境下文本也能正确地从"起始"方向对齐，同时通过 `...props.style` 允许外部覆盖样式。

#### Web 端支持

浏览器中的文本元素需要 `lang` 属性匹配当前活跃的区域标识符。可以封装在自定义组件中：

```tsx
import { getLocales } from 'expo-localization';

const deviceLanguage = getLocales()[0].languageCode;

const WebText = (props: RNTextProps) => {
  return <RNText lang={deviceLanguage} {...props} />;
};

export default WebText;
```

根据当前平台选择合适的组件：

```tsx
const Text = Platform.OS === 'web' ? WebText : MobileText;
export default Text;
```

### 根据区域方向选择资源

当需要根据布局方向切换图标或修改样式时，可以查询 `I18nManager.isRTL`：

```tsx
import { I18nManager } from 'react-native';
const isRTL = I18nManager.isRTL;
```

**使用场景**：例如在 RTL 布局中翻转返回箭头图标，或调整某些视觉元素的朝向。

---

## 区域设置和单位

框架提供了读取区域偏好的工具。使用 `getCalendars()` 和 `getLocales()` 等同步方法获取设备设置：

- `getLocales()`：返回按优先级排序的区域偏好列表（始终包含至少一个条目）。
- `getCalendars()`：返回按优先级排序的日历系统列表（始终包含至少一个条目）。

```ts
import { getLocales, getCalendars } from 'expo-localization';

const {
  languageTag,         // 完整的语言标签，如 "en-US"
  languageCode,        // 语言代码，如 "en"
  textDirection,       // 文字方向，"ltr" 或 "rtl"
  digitGroupingSeparator, // 数字分组分隔符，如 ","
  decimalSeparator,    // 小数分隔符，如 "."
  measurementSystem,   // 度量系统，如 "metric" 或 "us"
  currencyCode,        // 货币代码，如 "USD"
  currencySymbol,      // 货币符号，如 "$"
  regionCode,          // 区域代码，如 "US"
} = getLocales()[0];

const {
  calendar,            // 日历类型，如 "gregory"
  timeZone,            // 时区，如 "Asia/Shanghai"
  uses24hourClock,     // 是否使用 24 小时制
  firstWeekday,        // 每周第一天是星期几
} = getCalendars()[0];
```

**代码说明**：以上解构赋值展示了 `getLocales()` 和 `getCalendars()` 返回对象中可用的所有属性，方便开发者根据需要使用各项区域设置信息。

#### 限制

在使用自动偏好检测时，请注意以下限制：

- **温度单位**无法直接从用户设置中读取。Android 需要基于区域的查找表来实现，而 iOS 允许用户在系统偏好设置中覆盖。
- 某些属性在不支持的操作系统上可能返回 `null`。

> （基于经验建议）如果需要处理温度单位，建议在应用中提供手动选择功能，而不是依赖系统 API。

---

## Intl API

运行 Hermes 引擎的应用可以在所有环境中使用标准的 `Intl` API。

该 API 提供了格式化复数形式、单位、货币值、数字、日期和列表等工具函数。

将字符串 `"default"` 作为区域参数传入，可以让 API 自动使用设备设置，无需手动获取 `"en-US"` 等字符串。

```ts
new Intl.NumberFormat('default', { style: 'currency', currency: 'EUR' }).format(5.0);
```

**代码说明**：
- `Intl.NumberFormat`：Intl API 提供的数字格式化器。
- `'default'`：使用设备当前的区域设置，省去手动获取语言标签的步骤。
- `{ style: 'currency', currency: 'EUR' }`：将数字格式化为欧元货币样式。
- `.format(5.0)`：格式化数字 `5.0`，输出类似 `"€5.00"` 的结果（具体格式取决于设备区域设置）。

> **重要提示**：
> - 使用这些标准 API 来格式化值之前，需要先了解用户的期望设置。
> - 这些 API **不会**暴露设备或区域元数据，这意味着无法直接从中提取度量系统、货币或单位信息。
> - 要获取此类数据，请依赖 `expo-localization` 包、Web 端的 JavaScript 或自定义原生实现。

> （基于文档内容推导）推荐的做法是：使用 `expo-localization` 获取设备和区域元数据（如货币代码、度量系统），使用 `Intl` API 进行实际的格式化输出。两者配合使用效果最佳。

---

## 文档导航

- **上一页**：[icons](./155__icons.md)
- **下一页**：[using bun](./157__using-bun.md)
