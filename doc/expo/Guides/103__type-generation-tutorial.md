> 原文地址：https://docs.expo.dev/modules/type-generation-tutorial/

# 模块的类型生成教程

## 概述

本教程介绍如何使用 `expo-type-information` 工具自动为 Expo 模块生成 TypeScript 类型定义。

在开发 Expo 原生模块时，开发者通常需要在 **三种语言**（Swift、Kotlin 和 TypeScript）中手动维护重复的接口定义。这不仅繁琐，还容易导致类型不一致。`expo-type-information` 工具通过直接解析 Swift 源码，自动生成对应的 TypeScript 类型文件，从而消除这一痛点。

> **重要前提**：此工作流 **仅适用于 macOS** 系统。因为其底层依赖的解析工具 `SourceKitten` 不支持其他操作系统。

### 关键术语说明（面向初学者）

| 术语 | 含义 |
|---|---|
| **TypeScript 类型定义** | 描述变量、函数、类的数据结构的声明，让编辑器能提供自动补全和类型检查 |
| **Inline Module（内联模块）** | 直接写在应用项目中的原生模块，无需单独发布为 npm 包 |
| **Standard Module（标准模块）** | 作为独立 npm 包发布的原生模块，例如 `expo-settings` |
| **NativeModule** | Expo 提供的基类，所有原生模块都继承自它，提供与原生代码通信的能力 |
| **NativeView** | Expo 提供的原生视图组件桥接机制 |
| **SourceKitten** | 一个 macOS 上的开源工具，用于解析 Swift 源代码的语法结构 |
| **File Hash（文件哈希）** | 对文件内容计算的加密摘要值，用于检测文件是否被手动修改过 |
| **Generated File（生成文件）** | 工具每次运行时完全覆盖重写的类型文件，不应手动编辑 |
| **Stable File（稳定文件）** | 工具会保留用户手动修改的接口包装文件，通过哈希检测变更 |
| **Watcher（监听器）** | 持续监控文件变化的模式，检测到修改时自动重新生成类型 |

---

## 项目配置

### 第一步：安装 npm 依赖

使用你偏好的包管理器安装 `expo-type-information`：

```bash
npx expo install expo-type-information
```

> 也可以使用 `npm install expo-type-information`、`yarn add expo-type-information`、`pnpm add expo-type-information` 或 `bun add expo-type-information`。

### 第二步：安装 macOS 系统依赖

通过 [Homebrew](https://brew.sh/) 安装 `SourceKitten`——这是解析 Swift 源码所必需的工具：

```bash
brew install sourcekitten
```

> **注意**：`SourceKitten` 是此工具的核心依赖。没有它，工具无法解析 Swift 文件，因此此功能仅限 macOS 使用。

---

## 为内联模块（Inline Modules）生成接口

### 问题背景

在使用 `requireNativeModule()` 或 `requireNativeView()` 等原生引用函数时，返回值的类型默认为 `any`。这意味着：

- **没有自动补全**：编辑器无法提示可用的属性和方法
- **没有类型安全**：运行时才会暴露拼写错误或参数类型不匹配的问题

### 执行生成命令

在项目根目录下运行以下命令来为内联模块生成 TypeScript 接口：

```bash
npx expo-type-information inline-modules-interface --app-json ./app.json --watcher
```

**参数说明：**

| 参数 | 作用 |
|---|---|
| `inline-modules-interface` | 指定要为内联模块生成接口 |
| `--app-json ./app.json` | 指向应用配置文件的路径 |
| `--watcher` | 启用文件监听模式，检测到 Swift 文件变化时自动重新生成 |

> **基于经验建议**：在开发阶段始终加上 `--watcher` 标志，这样每次修改 Swift 代码后无需手动重新执行命令。如果你只需要一次性生成，可以省略此参数。

### 理解生成的文件

该命令会为每个内联模块创建 **两个文件**，它们各有不同用途：

#### 1. 生成文件（Generated File）

- 文件名通常包含 `.generated` 后缀
- **每次运行时完全覆盖重写**
- **绝对不要手动编辑此文件**——你的修改会在下次运行时被清除
- 包含从 Swift 代码解析出的原生类型定义

**模块的生成文件示例：**

```typescript
/* 由 expo-type-information 自动生成。请勿手动编辑。 */
import { ViewProps } from 'react-native';
import { NativeModule } from 'expo';

export declare class FirstInlineModuleNativeModuleType extends NativeModule {
  readonly Hello: string;
}
```

#### 2. 稳定文件（Stable File）

- 这是你可以自定义的接口包装文件
- 工具使用 **文件哈希值**（文件开头的注释中）来检测你是否做了手动修改
- 如果你添加了自定义逻辑，工具在重新生成时会 **保留你的修改**，同时保持原生类型同步

**模块的稳定文件示例：**

```typescript
// File hash: c7729100cc23e11d5d39fcb99fe861f7b03502986ee7becb85731cb631f37000
import { FirstInlineModuleNativeModuleType } from './FirstInlineModule.generated';
import { requireNativeModule, requireNativeView } from 'expo';

const FirstInlineModule: FirstInlineModuleNativeModuleType =
  requireNativeModule<FirstInlineModuleNativeModuleType>('FirstInlineModule');

export const Hello: string = FirstInlineModule.Hello;
```

> **关键理解**：稳定文件开头的 `File hash` 注释至关重要。工具通过比较当前文件内容的哈希值与此注释中记录的哈希值，来判断文件是否被手动修改过。如果哈希不匹配，工具不会覆盖该文件。

### 视图（View）的类型生成与限制

对于原生视图组件，工具同样会生成类型文件。但有一个重要限制：

> **警告**：如果视图的属性使用了复杂类型（例如 `URL`），且工具无法找到基本映射或显式定义，该类型会默认回退为 `unknown`。你需要手动在稳定文件中补充正确的类型。

**视图的生成文件示例：**

```typescript
/* 由 expo-type-information 自动生成。请勿手动编辑。 */
import { ViewProps } from 'react-native';
import { NativeModule } from 'expo';

export type URL = unknown;

export interface ExpoWebViewProps extends ViewProps {
  url: URL;
  onLoad?: (event: any) => void;
}

export declare class FirstInlineViewNativeModuleType extends NativeModule {}
```

> **注意**：`URL` 类型被标记为 `unknown`，因为工具无法自动解析 Swift 中 `URL` 类型到 TypeScript 的映射。你可以在稳定文件中将其替换为 `string` 或自定义类型。

**视图的稳定文件示例：**

稳定视图文件会导出一个默认的包装组件：

```typescript
// File hash: 6eb6c583bee1f61cbb9f6557faadc9d6b7fb51313c05027076431304668f7ac5
import React from 'react';
import { URL, FirstInlineViewNativeModuleType, ExpoWebViewProps } from './FirstInlineView.generated';
import { requireNativeModule, requireNativeView } from 'expo';

const FirstInlineView: FirstInlineViewNativeModuleType =
  requireNativeModule<FirstInlineViewNativeModuleType>('FirstInlineView');

const ExpoWebView = requireNativeView<ExpoWebViewProps>('FirstInlineView', 'ExpoWebView');

export default function ExpoWebViewComponent(props: ExpoWebViewProps) {
  return <ExpoWebView {...props} />;
}
```

> **限制**：由于稳定视图文件使用 `export default`（默认导出），**每个内联模块文件中只能包含一个视图组件**，才能使默认导出正常工作。如果你的模块包含多个视图，需要手动调整导出方式。

### 在项目中使用生成的类型

生成完成后，你可以用稳定文件中的导入替换原来的 `requireNativeModule` / `requireNativeView` 调用：

**替换前**（无类型安全）：

```typescript
const MyModule = requireNativeModule('FirstInlineModule');
const MyView = requireNativeView('FirstInlineView', 'ExpoWebView');
```

**替换后**（完整类型安全）：

```typescript
import { StyleSheet, Text, View } from 'react-native';
import * as React from 'react';
import { Hello } from './FirstInlineModule';
import FirstInlineView from './FirstInlineView';

export default function InlineModulesDemoComponent() {
  return (
    <>
      <View style={styles.textBox}>
        <Text style={styles.text}> {Hello} </Text>
      </View>
      <FirstInlineView style={styles.inlineView} url="https://docs.expo.dev/modules/" />
    </>
  );
}
// ... 样式部分省略
```

> **基于文档内容推导**：替换后，编辑器会对 `Hello` 属性和 `FirstInlineView` 组件的 `props`（如 `url`、`onLoad`）提供完整的自动补全和类型检查。如果传入错误类型的 prop，编辑器会在编译前报错。

---

## 实时文件监听（Watcher 模式）

### 工作原理

保持 `--watcher` 标志启用后，工具会持续监控 Swift 源文件的变化。当检测到修改时，会自动重新生成类型文件。

### 示例：添加新函数

假设你在 Swift 模块中新增了一个字符串拼接函数：

```swift
Function("ConcatStrings") { (str1: String, strings: [String]) -> String in
    return strings.reduce(str1) { $0 + $1 }
}
```

工具会自动检测到这一变化，并立即更新生成文件和稳定文件中的 TypeScript 定义。更新后，你可以在应用中立即使用这个新的类型安全函数。

### 稳定文件未更新的排查

> **警告**：如果稳定文件没有随 Swift 代码的修改而更新，很可能是因为你之前 **手动编辑过该文件**。工具检测到哈希不匹配后会跳过覆盖，以保护你的手动修改。

**解决方法**：删除该稳定文件，然后再次修改 Swift 代码（或重新运行命令），工具会重新生成一个全新的稳定文件。

> **基于经验建议**：如果你需要在稳定文件中添加自定义逻辑，建议将自定义代码放在单独的文件中，然后通过导入的方式引用，而不是直接修改稳定文件。这样可以避免哈希冲突导致自动更新失效。

---

## 为标准模块（Standard Modules）生成接口

### 适用场景

标准模块是指作为独立 npm 包发布的原生模块。例如，一个名为 `expo-settings` 的模块，用于管理应用的主题偏好（包含主题枚举和事件触发器）。

在手动编写 TypeScript 类型文件的情况下，你需要维护 `.types.ts`、`Module.ts` 和 `index.ts` 等多个文件。使用此工具可以自动生成这些文件。

### 执行生成命令

首先，**删除手动编写的类型文件**，然后运行以下命令：

```bash
npx expo-type-information module-interface --module ./expo-settings -w
```

**参数说明：**

| 参数 | 作用 |
|---|---|
| `module-interface` | 指定要为标准模块生成接口 |
| `--module ./expo-settings` | 指向模块包的根目录路径 |
| `-w` | `--watcher` 的缩写，启用文件监听模式 |

### 生成的文件

标准模块会生成 **三个文件**：

#### 1. 类型文件（Types File）

包含从 Swift 解析出的枚举、接口等类型定义：

```typescript
/* 由 expo-type-information 自动生成。请勿手动编辑。 */
import { ViewProps } from 'react-native';
import { NativeModule } from 'expo';

export enum Theme {
  light,
  dark,
  system,
}
```

#### 2. 模块文件（Module File）

声明原生模块类并导出实例：

```typescript
/* 由 expo-type-information 自动生成。请勿手动编辑。 */
import { requireNativeModule, NativeModule } from 'expo';
import { Theme } from './ExpoSettings.types';

export declare class ExpoSettings extends NativeModule {
  setTheme(theme: Theme): void;
  getTheme(): string;
}

const _default: ExpoSettings = requireNativeModule<ExpoSettings>('ExpoSettings');
export default _default;
```

#### 3. 索引文件（Index File）

简单地重新导出模块对象和类型：

```typescript
export type * from './ExpoSettings.types';
export { default as ExpoSettings } from './ExpoSettingsModule';
```

> **基于文档内容推导**：与手动编写时将每个方法包装在独立函数中的方式不同，自动生成的索引文件仅做简单的重新导出。这意味着消费者需要通过 `ExpoSettings.setTheme(...)` 的方式调用方法，而不是直接调用 `setTheme(...)`。

---

## 当前工具限制

> **重要提示**：了解以下限制可以帮助你合理规划工作流，避免在不支持的场景上浪费时间。

| 限制项 | 说明 | 应对方式 |
|---|---|---|
| **仅支持 macOS** | 底层依赖 SourceKitten，该工具不支持 Windows 和 Linux | 在 macOS 上运行生成命令，或考虑使用 CI/CD 环境 |
| **不生成事件类型** | 如果模块包含事件（events），工具不会自动生成对应的事件类型定义 | 需要手动为事件编写类型定义 |
| **内联视图每文件限一个** | 稳定视图文件使用默认导出，因此每个内联模块文件只能包含一个视图 | 将多个视图拆分到不同文件中 |
| **复杂类型回退为 unknown** | 无法自动映射的复杂 Swift 类型会默认为 `unknown` | 在稳定文件中手动替换为正确的 TypeScript 类型 |
| **索引文件仅做重新导出** | 标准模块的索引文件不会将方法包装为独立函数 | 如需要更细粒度的导出，手动修改索引文件 |

---

## 最佳实践总结

1. **开发阶段始终启用 `--watcher`**：避免手动重复执行命令，保持类型定义与 Swift 代码同步
2. **不要编辑 `.generated` 文件**：这些文件每次都会被覆盖，你的修改会丢失
3. **谨慎编辑稳定文件**：手动修改会导致哈希不匹配，阻止自动更新
4. **将自定义逻辑放在独立文件中**：通过导入方式引用，而不是直接修改生成的文件
5. **为 `unknown` 类型补充定义**：检查生成文件中的 `unknown` 类型，在稳定文件中替换为精确类型
6. **手动处理事件类型**：工具不生成事件类型，需要在稳定文件或独立类型文件中补充

---

## 文档导航

- **上一页**：[inline modules tutorial](./102__inline-modules-tutorial.md)
- **下一页**：[config plugin and native module tutorial](./104__config-plugin-and-native-module-tutorial.md)
