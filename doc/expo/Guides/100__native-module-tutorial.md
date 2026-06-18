> **原始文档来源**：https://docs.expo.dev/modules/native-module-tutorial/
>
> 本文档基于 Expo Modules API 官方教程翻译整理，旨在帮助中文开发者学习如何创建原生模块。

# 教程：创建原生模块（Native Module）

本教程将演示如何使用 **Expo Modules API** 构建一个原生模块，用于存储用户的主题偏好设置（深色 `dark`、浅色 `light`、跟随系统 `system`）。

- **Android 端**：使用 `SharedPreferences`（Android 提供的轻量级键值对持久化存储）来保存主题设置。
- **iOS 端**：使用 `UserDefaults`（iOS 提供的轻量级键值对持久化存储）来保存主题设置。
- **Web 端**：理论上可以使用 `localStorage`，但本教程不涉及 Web 端实现。

> **关键术语解释（面向初学者）**：
> - **Native Module（原生模块）**：用平台原生语言（Kotlin/Swift）编写的代码模块，可以被 JavaScript/TypeScript 调用。它是 React Native 应用与设备原生功能之间的桥梁。
> - **JSI（JavaScript Interface）**：JavaScript 与原生代码之间的通信接口，Expo Modules API 基于 JSI 实现高性能的原生调用。
> - **SharedPreferences**：Android 平台上用于存储简单键值对数据的机制，类似于浏览器的 localStorage。
> - **UserDefaults**：iOS 平台上用于存储简单键值对数据的机制，类似于 Android 的 SharedPreferences。
> - **Enumerable**：Expo Modules API 提供的枚举类型接口，用于限制参数只能接受预定义的值。

---

## 第一步：初始化新模块

首先，使用 `create-expo-module` 工具生成一个名为 `expo-settings` 的新模块：

```sh
# npm
npx create-expo-module expo-settings

# yarn
yarn create expo-module expo-settings

# pnpm
pnpm create expo-module expo-settings

# bun
bun create expo-module expo-settings
```

> **提示**：在交互式提示中选择默认选项即可，因为本教程中不会实际发布此库。

> **基于经验建议**：`create-expo-module` 会自动生成包含 Android（Kotlin）、iOS（Swift）和 TypeScript 层的完整模块脚手架，是创建自定义原生模块的最佳起点。

---

## 第二步：搭建工作区

### 清理默认文件

删除模块生成器创建的默认视图（View）相关文件，因为本教程只需要模块（Module）功能，不需要原生视图：

```sh
cd expo-settings
rm ios/ExpoSettingsView.swift
rm android/src/main/java/expo/modules/settings/ExpoSettingsView.kt
rm src/ExpoSettingsView.tsx
rm src/ExpoSettingsView.web.tsx src/ExpoSettingsModule.web.ts
```

### 替换核心文件内容

将以下最小化样板代码写入各平台的核心模块文件：

**Android 端** — `android/src/main/java/expo/modules/settings/ExpoSettingsModule.kt`：

```kotlin
package expo.modules.settings

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSettingsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSettings")

    Function("getTheme") {
      return@Function "system"
    }
  }
}
```

**iOS 端** — `ios/ExpoSettingsModule.swift`：

```swift
import ExpoModulesCore

public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Function("getTheme") { () -> String in
      "system"
    }
  }
}
```

**TypeScript 类型定义** — `src/ExpoSettings.types.ts`：

```ts
export type ExpoSettingsModuleEvents = {};
```

**TypeScript 模块声明** — `src/ExpoSettingsModule.ts`：

```ts
import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSettingsModuleEvents } from './ExpoSettings.types';

declare class ExpoSettingsModule extends NativeModule<ExpoSettingsModuleEvents> {
  getTheme: () => string;
}

// This call loads the native module object from the JSI.
// 此调用从 JSI 加载原生模块对象。
export default requireNativeModule<ExpoSettingsModule>('ExpoSettings');
```

> **关键术语解释**：
> - `requireNativeModule<ExpoSettingsModule>('ExpoSettings')`：通过名称 `'ExpoSettings'` 查找并加载对应的原生模块实例。该名称必须与原生代码中 `Name("ExpoSettings")` 的定义一致。
> - `NativeModule<Events>`：Expo Modules 提供的基础类型，所有原生模块的 TypeScript 声明都应继承它。泛型参数 `Events` 定义了模块可以发出的事件类型。

**TypeScript 公开 API** — `src/index.ts`：

```ts
import ExpoSettingsModule from './ExpoSettingsModule';

export function getTheme(): string {
  return ExpoSettingsModule.getTheme();
}
```

**示例应用** — `example/App.tsx`：

```tsx
import * as Settings from 'expo-settings';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Theme: {Settings.getTheme()}</Text>
    </View>
  );
}
```

---

## 第三步：运行示例项目

首先，在一个终端中启动 TypeScript 编译器的监听模式：

```sh
# npm
npm run build

# yarn
yarn run build

# pnpm
pnpm run build

# bun
bun run build
```

然后，在另一个终端中启动示例应用：

```sh
# npm
cd example
npx expo run:android
npx expo run:ios

# yarn
cd example
yarn expo run:android
yarn expo run:ios

# pnpm
cd example
pnpm expo run:android
pnpm expo run:ios

# bun
cd example
bun expo run:android
bun expo run:ios
```

应用将在屏幕中央显示 `Theme: system`，这是由原生端同步方法 `getTheme()` 返回的值。

> **基于经验建议**：`expo run:android` 和 `expo run:ios` 会自动执行原生构建（prebuild）并安装到设备/模拟器上。首次运行耗时较长，因为需要完成完整的原生编译过程。

---

## 第四步：获取、设置并持久化主题偏好值

本步骤将实现主题的读取、写入和持久化存储功能。

### Android 原生模块

从 `SharedPreferences` 中读取 `"theme"` 键的值（默认值为 `"system"`）。使用 `reactContext` 来访问 `SharedPreferences`。使用 `edit()` 方法和 `putString()` 方法来更新值。

```kotlin
package expo.modules.settings

import android.content.Context
import android.content.SharedPreferences
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSettingsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSettings")

    Function("setTheme") { theme: String ->
      getPreferences().edit().putString("theme", theme).commit()
    }

    Function("getTheme") {
      return@Function getPreferences().getString("theme", "system")
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getPreferences(): SharedPreferences {
    return context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
  }
}
```

> **关键术语解释**：
> - `appContext.reactContext`：Expo Modules 提供的应用上下文，通过它可以获取到 React Native 的 `Context` 对象。
> - `requireNotNull(...)`：Kotlin 标准库函数，如果值为 `null` 则抛出异常，用于确保 `reactContext` 可用。
> - `Context.MODE_PRIVATE`：Android 文件访问模式，表示该 SharedPreferences 文件仅对当前应用可见。

### iOS 原生模块

从 `UserDefaults` 中读取 `"theme"` 字符串（默认值为 `"system"`）。使用 `set(_:forKey:)` 方法来更新值。

```swift
import ExpoModulesCore

public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Function("setTheme") { (theme: String) -> Void in
      UserDefaults.standard.set(theme, forKey:"theme")
    }

    Function("getTheme") { () -> String in
      UserDefaults.standard.string(forKey: "theme") ?? "system"
    }
  }
}
```

> **关键术语解释**：
> - `UserDefaults.standard`：iOS 的标准默认值存储单例，用于读写轻量级偏好数据。
> - `?? "system"`：Swift 的空合运算符（nil-coalescing operator），如果左侧为 `nil` 则返回右侧的默认值 `"system"`。

### TypeScript 模块

更新模块接口，添加 `setTheme` 方法声明：

```ts
import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSettingsModuleEvents } from './ExpoSettings.types';

declare class ExpoSettingsModule extends NativeModule<ExpoSettingsModuleEvents> {
  setTheme: (theme: string) => void;
  getTheme: () => string;
}

// This call loads the native module object from the JSI.
// 此调用从 JSI 加载原生模块对象。
export default requireNativeModule<ExpoSettingsModule>('ExpoSettings');
```

更新公开 API，导出 `setTheme` 函数：

```ts
import ExpoSettingsModule from './ExpoSettingsModule';

export function getTheme(): string {
  return ExpoSettingsModule.getTheme();
}

export function setTheme(theme: string): void {
  return ExpoSettingsModule.setTheme(theme);
}
```

### 示例应用

在 UI 中实现一个按钮，用于在深色和浅色主题之间切换：

```tsx
import * as Settings from 'expo-settings';
import { Button, Text, View } from 'react-native';

export default function App() {
  const theme = Settings.getTheme();
  // Toggle between dark and light theme
  // 在深色和浅色主题之间切换
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Theme: {Settings.getTheme()}</Text>
      <Button title={`Set theme to ${nextTheme}`} onPress={() => Settings.setTheme(nextTheme)} />
    </View>
  );
}
```

> **注意**：重新构建后你会发现，点击按钮并不会立即更新 UI 上的文字显示。这是因为应用目前缺少响应新值变化后的重新渲染逻辑。下一步将解决这个问题。

---

## 第五步：为主题值变化发出事件通知

为了让开发者能够在主题值变化时做出响应，我们需要发出一个 `onChangeTheme` 事件，携带 `{ theme: string }` 作为事件负载（payload）。需要用到 `Events` 定义、`sendEvent` 方法和 `EventEmitter`。

> **关键术语解释**：
> - **Events（事件）**：原生模块向 JavaScript 层发送通知的机制，类似于 Web 中的自定义事件。
> - **sendEvent**：Expo Modules API 提供的方法，用于从原生端向 JavaScript 端发射事件。
> - **EventSubscription（事件订阅）**：`expo-modules-core` 提供的类型，表示一个事件监听器的订阅句柄，可以通过 `remove()` 方法取消订阅。

### Android 原生模块

使用 `bundleOf` 创建事件负载对象：

```kotlin
package expo.modules.settings

import android.content.Context
import android.content.SharedPreferences
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSettingsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSettings")

    Events("onChangeTheme")

    Function("setTheme") { theme: String ->
      getPreferences().edit().putString("theme", theme).commit()
      this@ExpoSettingsModule.sendEvent("onChangeTheme", bundleOf("theme" to theme))
    }

    Function("getTheme") {
      return@Function getPreferences().getString("theme", "system")
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getPreferences(): SharedPreferences {
    return context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
  }
}
```

> **关键术语解释**：
> - `Events("onChangeTheme")`：在模块定义中声明支持的事件名称。必须先声明事件名，才能通过 `sendEvent` 发出。
> - `bundleOf("theme" to theme)`：Android 的 `Bundle` 工具函数，创建一个包含键值对的 Bundle 对象作为事件数据。
> - `this@ExpoSettingsModule`：Kotlin 的标签引用语法，用于在嵌套作用域中引用外层的 `ExpoSettingsModule` 实例。

### iOS 原生模块

将字典作为参数传递给 `sendEvent`：

```swift
import ExpoModulesCore

public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Events("onChangeTheme")

    Function("setTheme") { (theme: String) -> Void in
      UserDefaults.standard.set(theme, forKey:"theme")
      sendEvent("onChangeTheme", [
        "theme": theme
      ])
    }

    Function("getTheme") { () -> String in
      UserDefaults.standard.string(forKey: "theme") ?? "system"
    }
  }
}
```

### TypeScript 模块

定义事件类型，并创建 `addThemeListener` 封装函数：

**类型定义** — `src/ExpoSettings.types.ts`：

```ts
export type ThemeChangeEvent = {
  theme: string;
};

export type ExpoSettingsModuleEvents = {
  onChangeTheme: (params: ThemeChangeEvent) => void;
};
```

**公开 API** — `src/index.ts`：

```ts
import { EventSubscription } from 'expo-modules-core';
import ExpoSettingsModule from './ExpoSettingsModule';
import { ThemeChangeEvent } from './ExpoSettings.types';

export function addThemeListener(listener: (event: ThemeChangeEvent) => void): EventSubscription {
  return ExpoSettingsModule.addListener('onChangeTheme', listener);
}

export function getTheme(): string {
  return ExpoSettingsModule.getTheme();
}

export function setTheme(theme: string): void {
  return ExpoSettingsModule.setTheme(theme);
}
```

> **关键术语解释**：
> - `EventSubscription`：事件订阅对象，调用其 `remove()` 方法可以取消监听，防止内存泄漏。
> - `addListener(eventName, callback)`：在原生模块上注册一个事件监听器，当事件被触发时执行回调函数。

### 示例应用

使用 React 的 `useState` 和 `useEffect` 来订阅主题变化事件，并触发重新渲染：

```tsx
import * as Settings from 'expo-settings';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function App() {
  const [theme, setTheme] = useState<string>(Settings.getTheme());

  useEffect(() => {
    const subscription = Settings.addThemeListener(({ theme: newTheme }) => {
      setTheme(newTheme);
    });

    return () => subscription.remove();
  }, [setTheme]);

  // Toggle between dark and light theme
  // 在深色和浅色主题之间切换
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Theme: {Settings.getTheme()}</Text>
      <Button title={`Set theme to ${nextTheme}`} onPress={() => Settings.setTheme(nextTheme)} />
    </View>
  );
}
```

> **基于文档内容推导**：`useEffect` 的清理函数 `() => subscription.remove()` 至关重要。当组件卸载时，它会自动取消事件订阅，避免内存泄漏和对已卸载组件的状态更新警告。

---

## 第六步：使用枚举（Enums）提升类型安全性

为了防止任意字符串被传入 API，我们可以将主题值限制为仅接受 `system`、`light` 或 `dark`，通过实现枚举来达成此目标。

> **基于文档内容推导**：枚举机制在两个层面提供了保护——TypeScript 层面在编译时检查类型，原生层面在运行时校验传入值。这种双重保护显著提升了 API 的健壮性。

### Android 原生模块

实现一个遵循 `Enumerable` 接口的 `Theme` 枚举类：

```kotlin
package expo.modules.settings

import android.content.Context
import android.content.SharedPreferences
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.types.Enumerable

class ExpoSettingsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSettings")

    Events("onChangeTheme")

    Function("setTheme") { theme: Theme ->
      getPreferences().edit().putString("theme", theme.value).commit()
      this@ExpoSettingsModule.sendEvent("onChangeTheme", bundleOf("theme" to theme.value))
    }

    Function("getTheme") {
      return@Function getPreferences().getString("theme", Theme.SYSTEM.value)
    }
  }

  private val context
  get() = requireNotNull(appContext.reactContext)

  private fun getPreferences(): SharedPreferences {
    return context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
  }
}

enum class Theme(val value: String) : Enumerable {
  LIGHT("light"),
  DARK("dark"),
  SYSTEM("system")
}
```

> **关键术语解释**：
> - `Enumerable`：Expo Modules API 提供的接口。Kotlin 枚举类实现此接口后，Expo 框架会自动将 JavaScript 传入的字符串与枚举值进行匹配和转换。
> - `enum class Theme(val value: String)`：Kotlin 枚举类，每个枚举常量都关联一个字符串值（如 `LIGHT` 对应 `"light"`）。

### iOS 原生模块

创建一个遵循 `Enumerable` 协议的 Swift 枚举，使用原始字符串值：

```swift
import ExpoModulesCore

public class ExpoSettingsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSettings")

    Events("onChangeTheme")

    Function("setTheme") { (theme: Theme) -> Void in
      UserDefaults.standard.set(theme.rawValue, forKey:"theme")
      sendEvent("onChangeTheme", [
        "theme": theme.rawValue
      ])
    }

    Function("getTheme") { () -> String in
      UserDefaults.standard.string(forKey: "theme") ?? Theme.system.rawValue
    }
  }

  enum Theme: String, Enumerable {
    case light
    case dark
    case system
  }
}
```

> **关键术语解释**：
> - `enum Theme: String, Enumerable`：Swift 枚举声明。`String` 表示原始值类型为字符串，`Enumerable` 是 Expo Modules 的协议，使枚举值可以与 JavaScript 层的字符串自动映射。
> - `rawValue`：Swift 枚举的原始值属性。对于 `String` 类型的原始值枚举，`case light` 的 `rawValue` 就是 `"light"`。

### TypeScript 模块

定义联合类型 `Theme` 并更新模块签名：

**类型定义** — `src/ExpoSettings.types.ts`：

```ts
export type Theme = 'light' | 'dark' | 'system';

export type ThemeChangeEvent = {
  theme: Theme;
};

export type ExpoSettingsModuleEvents = {
  onChangeTheme: (params: ThemeChangeEvent) => void;
};
```

**模块声明** — `src/ExpoSettingsModule.ts`：

```ts
import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSettingsModuleEvents, Theme } from './ExpoSettings.types';

declare class ExpoSettingsModule extends NativeModule<ExpoSettingsModuleEvents> {
  setTheme: (theme: Theme) => void;
  getTheme: () => Theme;
}

// This call loads the native module object from the JSI.
// 此调用从 JSI 加载原生模块对象。
export default requireNativeModule<ExpoSettingsModule>('ExpoSettings');
```

**公开 API** — `src/index.ts`：

```ts
import { EventSubscription } from 'expo-modules-core';

import ExpoSettingsModule from './ExpoSettingsModule';

import { Theme, ThemeChangeEvent } from './ExpoSettings.types';

export function addThemeListener(listener: (event: ThemeChangeEvent) => void): EventSubscription {
  return ExpoSettingsModule.addListener('onChangeTheme', listener);
}

export function getTheme(): Theme {
  return ExpoSettingsModule.getTheme();
}

export function setTheme(theme: Theme): void {
  return ExpoSettingsModule.setTheme(theme);
}
```

### 示例应用

现在如果传入一个无效的字符串（例如 `"not-a-real-theme"`），将会触发 TypeScript 编译错误和运行时异常：

```text
ERROR  Error: FunctionCallException: Calling the 'setTheme' function has failed (at ExpoModulesCore/SyncFunctionComponent.swift:76)
→ Caused by: ArgumentCastException: Argument at index '0' couldn't be cast to type Enum<Theme> (at ExpoModulesCore/JavaScriptUtils.swift:41)
→ Caused by: EnumNoSuchValueException: 'not-a-real-theme' is not present in Theme enum, it must be one of: 'light', 'dark', 'system' (at ExpoModulesCore/Enumerable.swift:37)
```

该错误信息确认了只有定义的枚举值才被允许使用。错误链路清晰地展示了三层校验过程：

1. **FunctionCallException**：函数调用失败
2. **ArgumentCastException**：参数类型转换失败
3. **EnumNoSuchValueException**：具体的枚举值不存在

> **基于经验建议**：在实际项目中，建议对所有有限的字符串参数都使用枚举机制。这不仅能在编译阶段就捕获错误，还能为 API 使用者提供清晰的自动补全提示和文档说明。

---

## 下一步

完成本教程后，你可以继续探索以下内容：

- **Expo Modules API 参考文档**：深入了解所有可用的模块定义选项、事件、异步函数等高级特性。
- **原生视图教程（Native View Tutorial）**：学习如何创建自定义的原生 UI 组件（Native View），而不仅仅是数据模块。

---

## 总结：本教程核心知识点

| 概念 | 说明 |
|------|------|
| `create-expo-module` | 脚手架工具，自动生成包含 Android/iOS/TS 三层的模块结构 |
| `ModuleDefinition` | 模块定义 DSL，用于声明名称、函数、事件等 |
| `Function("name")` | 定义可从 JavaScript 调用的同步原生函数 |
| `Events("name")` | 声明模块支持的事件名称 |
| `sendEvent` | 从原生端向 JavaScript 端发射事件 |
| `requireNativeModule` | 在 TypeScript 中加载原生模块实例 |
| `Enumerable` | 枚举接口，限制参数只能为预定义值 |
| `SharedPreferences` / `UserDefaults` | Android / iOS 平台的轻量级键值对存储 |

---

## 文档导航

- **上一页**：[get started](./99__get-started.md)
- **下一页**：[native view tutorial](./101__native-view-tutorial.md)
