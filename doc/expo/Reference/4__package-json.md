# Expo `package.json` 配置参考

## 文档解决的问题

本文介绍可以写入项目根目录 `package.json` 的 **Expo 专用配置**，主要包括：

- 排除特定依赖的 Expo 版本检查
- 配置原生模块自动链接
- 调整 `npx expo-doctor` 的检查行为

这些配置统一放在 `package.json` 顶层的 `expo` 字段中。

本文适合以下场景：

- Expo 推荐的依赖版本与项目实际使用版本不同
- 项目包含自定义原生模块，需要调整模块解析目录
- 需要配置或关闭 Expo Doctor 的特定检查
- 项目中已经存在 `android` 或 `ios` 原生工程目录

> 本文是一份配置项参考，并不是从零创建 Expo 项目的教程。项目初始化、依赖安装、Prebuild 执行方式和原生开发流程，当前文档未涉及。

## 阅读前需要理解的背景知识

### `package.json` 是什么

对于 React Web 开发者，`package.json` 通常用于记录：

- 项目依赖
- npm scripts
- 项目名称和版本等元数据
- 工具链配置

Expo 项目同样使用这个文件。不同之处在于，Expo 允许在顶层增加一个 `expo` 字段，存放 Expo 工具专用的行为配置：

```json
{
  "expo": {
    // Expo 专用配置
  }
}
```

这里的配置主要影响 Expo CLI、Expo Doctor 和原生模块自动链接等工具，不是传递给 React 组件的运行时数据。

### 原生工程目录

React Native 应用最终需要运行在 iOS 或 Android 上，因此项目可能包含：

```text
android/
ios/
```

它们分别是 Android 和 iOS 的原生工程目录，可以理解为 Web 项目构建配置之外的平台工程。

对于没有原生开发经验的 React Web 开发者，需要特别注意：

- 这些目录不是普通的前端源码目录。
- 其中包含 Gradle、Xcode 等原生构建配置。
- Expo 配置是否会自动同步到这些目录，取决于项目的工作流和构建方式。

### Expo Doctor

`npx expo-doctor` 是 Expo 提供的项目诊断命令，用来检查依赖、配置以及项目结构中可能存在的问题。

它类似于针对 Expo/React Native 项目的综合环境检查工具。检查结果通常是警告或问题提示，不等于应用一定无法运行。

### Prebuild

Prebuild 是 Expo 根据应用配置和依赖生成或更新 `android`、`ios` 原生工程的机制。

本文只说明 Expo Doctor 如何判断项目可能使用了 Prebuild，以及相关配置同步警告；Prebuild 的完整流程和使用命令，当前文档未涉及。

---

## `install.exclude`：排除依赖版本检查

### Expo 会在哪些命令中检查版本

以下命令会检查项目已安装依赖的版本，并在版本不同于 Expo 推荐版本时给出警告：

- `npx expo start`
- `npx expo-doctor`
- `npx expo install`

`npx expo install` 只会在以下情况执行相关检查：

- 正在安装该库的新版本
- 使用了 `--check`
- 使用了 `--fix`

这些命令的基本作用如下：

| 命令 | 作用 |
| --- | --- |
| `npx expo start` | 启动 Expo 开发服务器 |
| `npx expo-doctor` | 检查 Expo 项目的依赖、配置和结构 |
| `npx expo install` | 安装与当前 Expo SDK 兼容的依赖版本 |
| `npx expo install --check` | 检查依赖版本是否符合 Expo 的推荐版本 |
| `npx expo install --fix` | 尝试修正不符合推荐范围的依赖版本 |

> `--check` 和 `--fix` 的完整行为细节，当前文档未进一步说明。

### 配置方式

将不希望参与版本检查的库名放入 `expo.install.exclude` 数组：

```json
{
  "expo": {
    "install": {
      "exclude": ["expo-updates", "expo-splash-screen"]
    }
  }
}
```

配置后，`expo-updates` 和 `expo-splash-screen` 将从上述版本检查中排除。

### 开发影响

这项配置只是让 Expo 不再针对这些库执行版本检查或显示相应警告，并不代表：

- Expo 会自动保证这些版本兼容
- 依赖冲突已经被解决
- 原生构建一定能够成功
- 这些库不再参与安装或打包

**基于文档内容推导：** 使用非 Expo 推荐版本时，兼容性验证责任会更多地转移给项目开发者，因此不应只为消除警告而随意加入 `exclude`。

---

## `autolinking`：配置原生模块解析

### 什么是 Autolinking

React Native 中的一些 npm 包不仅包含 JavaScript 代码，还包含 iOS 或 Android 原生代码。原生工程必须识别并连接这些模块，应用才能在设备上使用它们。

Autolinking 即“自动链接”，用于自动发现原生模块，并将它们接入 iOS、Android 原生构建流程。

这与 React Web 中通过以下方式导入 JavaScript 模块并不完全相同：

```js
import something from 'some-package';
```

JavaScript 的 `import` 只解决 JS 模块引用；Autolinking 还涉及 Gradle、Xcode 等原生构建系统对原生模块的识别。

### 配置方式

可以通过 `expo.autolinking` 调整模块解析行为：

```json
{
  "expo": {
    "autolinking": {
      "nativeModulesDir": "./modules"
    }
  }
}
```

其中：

| 配置项 | 含义 |
| --- | --- |
| `nativeModulesDir` | 指定原生模块所在目录 |
| `"./modules"` | 相对于项目目录的模块路径 |

**文档明确说明：** `autolinking` 用于配置模块解析行为。

**基于文档内容推导：** 示例表示项目将自定义原生模块放在 `modules` 目录中，并要求 Expo 的自动链接机制从该目录发现模块。

`autolinking` 的其他配置项、目录结构要求和解析优先级，当前文档未展开说明，需要查阅 Expo 的 Autolinking configuration 完整参考。

---

## `doctor`：配置 Expo Doctor

`expo.doctor` 用于调整 `npx expo-doctor` 的检查行为。本文介绍两个检查项：

1. `reactNativeDirectoryCheck`
2. `appConfigFieldsNotSyncedCheck`

### `reactNativeDirectoryCheck`

#### 检查目的

Expo Doctor 默认会将项目中的包与 [React Native Directory](https://reactnative.directory/) 进行核对。

React Native Directory 是记录 React Native 包及其兼容性、维护状态等信息的目录。对于 React Web 开发者，可以把它理解成一个面向 React Native 生态的包信息索引，而不是 npm registry 的替代品。

当某些包没有包含在 React Native Directory 中时，该检查会给出警告，并列出相关包。

需要注意：包没有被 React Native Directory 收录，并不必然说明它不可用，也可能是：

- 包尚未被该目录收录
- 包是项目内部包
- 包只包含 JavaScript，不需要专门记录 React Native 兼容信息
- 包名符合项目已知但可接受的例外情况

以上可能性属于一般性解释，不是当前文档对未收录原因的明确分类。

#### 配置方式

```json
{
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "enabled": true,
        "exclude": ["/foo/", "bar"],
        "listUnknownPackages": true
      }
    }
  }
}
```

配置项含义：

| 配置项 | 示例 | 作用 |
| --- | --- | --- |
| `enabled` | `true` | 是否启用 React Native Directory 检查 |
| `exclude` | `["/foo/", "bar"]` | 排除不需要检查或报告的包 |
| `listUnknownPackages` | `true` | 是否列出目录中未知的包 |

文档明确说明，默认行为是：

- 检查已启用
- 未知包会被列出

示例中的 `"/foo/"` 看起来具有模式匹配形式，但当前文档没有解释 `exclude` 的具体匹配规则。不能仅根据示例确定它支持哪一种正则表达式语法或匹配范围。

#### 使用场景

适合排除以下已确认无需重复提示的依赖：

- 团队内部维护的包
- 已完成兼容性验证、但未被 React Native Directory 收录的包
- 确认不适合参与该检查的特定依赖

**基于经验建议：** 优先针对具体包配置 `exclude`，不要为了减少警告直接关闭整个检查，否则可能漏掉后来新增的可疑依赖。

### `appConfigFieldsNotSyncedCheck`

#### 检查背景

Expo Doctor 会检查项目是否包含：

```text
android/
ios/
```

如果这些原生目录存在，并且没有被列入以下任一忽略文件：

- `.gitignore`
- `.easignore`

Expo Doctor 会进一步检查项目中是否存在应用配置文件。文档指出，如果应用配置文件存在，意味着该项目被配置为使用 Prebuild。

`.gitignore` 控制 Git 忽略哪些文件或目录；`.easignore` 控制向 EAS Build 上传项目时忽略哪些内容。

#### 为什么会出现警告

当 `android` 或 `ios` 目录已经存在时，EAS Build 不会把应用配置中的属性同步到原生工程。

如果开发者修改了应用配置，却误以为 EAS Build 会自动把变化写入已有的原生工程，最终构建结果就可能和应用配置不一致。满足这些条件时，Expo Doctor 会发出警告。

对于 React Web 开发者，可以把它类比为：

- 你修改了一个声明式配置文件；
- 但实际构建读取的是已经生成并提交的另一套平台配置；
- 构建系统不会自动把前者重新同步到后者。

#### 配置方式

```json
{
  "expo": {
    "doctor": {
      "appConfigFieldsNotSyncedCheck": {
        "enabled": false
      }
    }
  }
}
```

| 配置项 | 作用 |
| --- | --- |
| `enabled: true` | 启用应用配置字段未同步检查 |
| `enabled: false` | 关闭该检查 |

示例将检查关闭。文档说明该检查可以启用或禁用，但没有明确给出其默认值。

#### 关闭检查不等于解决同步问题

`enabled: false` 只会关闭 Expo Doctor 的相关检查，不会：

- 将应用配置同步到原生工程
- 修改 `android` 或 `ios` 中的配置
- 重新执行 Prebuild
- 改变 EAS Build 对现有原生目录的处理方式

**基于文档内容推导：** 只有在团队明确知道原生配置由谁维护，并确认应用配置与原生工程不需要自动同步时，才适合关闭该警告。

---

## 完整配置示例

以下示例将本文中的配置组合在一起：

```json
{
  "expo": {
    "install": {
      "exclude": ["expo-updates", "expo-splash-screen"]
    },
    "autolinking": {
      "nativeModulesDir": "./modules"
    },
    "doctor": {
      "reactNativeDirectoryCheck": {
        "enabled": true,
        "exclude": ["/foo/", "bar"],
        "listUnknownPackages": true
      },
      "appConfigFieldsNotSyncedCheck": {
        "enabled": false
      }
    }
  }
}
```

该配置表示：

1. 不检查 `expo-updates` 和 `expo-splash-screen` 是否符合 Expo 推荐版本。
2. 从 `./modules` 目录解析自定义原生模块。
3. 启用 React Native Directory 检查，但排除指定包或模式。
4. 保持未知包列表可见。
5. 关闭应用配置字段未同步检查。

这只是各配置项的组合展示，不代表所有 Expo 项目都应采用这些设置。

## 注意事项与常见误解

### Expo 专用字段不等于应用配置的全部内容

本文只介绍 `package.json` 中的部分 Expo 工具配置。Expo 应用配置文件的完整结构、可配置字段以及不同配置文件之间的关系，当前文档未涉及。

### 警告被关闭，问题仍可能存在

`install.exclude` 和 `doctor` 中的开关主要影响检查和警告行为。它们不会自动修复：

- 依赖版本不兼容
- 原生模块链接失败
- 应用配置与原生工程不一致

### npm 包不一定只有 JavaScript

这是 React Web 开发者最容易误解的地方。React Native 依赖可能同时包含：

- JavaScript 或 TypeScript 代码
- Android 原生代码
- iOS 原生代码

因此，依赖安装成功、编辑器能够解析 `import`，并不代表 iOS 或 Android 原生工程一定能成功构建。`autolinking` 处理的正是 JS 模块系统之外的原生集成问题。

### `android` 和 `ios` 不是普通构建产物

当这些目录存在并纳入版本管理或 EAS Build 上传范围时，它们可能成为实际构建配置的一部分。此时，修改 Expo 应用配置并不保证原生项目会自动更新。

### 不要根据示例推断未说明的规则

当前文档没有完整说明：

- `autolinking` 的全部配置项
- `nativeModulesDir` 要求的目录结构
- `exclude` 的精确匹配语法
- `appConfigFieldsNotSyncedCheck` 的默认值
- 如何修复应用配置与原生项目不同步
- 如何执行或管理 Prebuild

这些内容需要查阅对应的专项文档，不能仅凭本文示例确定。

## 实际开发中的使用方式

建议把这些配置视为“对 Expo 工具默认行为的例外声明”：

1. 先运行 `npx expo-doctor`，理解警告的具体原因。
2. 如果依赖版本与 Expo 推荐版本不同，先验证兼容性，再决定是否加入 `install.exclude`。
3. 只有项目确实包含自定义原生模块目录时，才配置 `autolinking.nativeModulesDir`。
4. 对未被 React Native Directory 收录但已经确认可用的包，使用精确的 `exclude` 规则。
5. 如果项目提交了 `android` 或 `ios` 目录，应明确应用配置和原生配置分别由什么流程维护。
6. 关闭 Doctor 检查时，在团队文档中记录关闭原因和替代验证方式。

其中第 6 点属于**基于经验建议**，不是原文档的强制要求。

## 总结

Expo 允许通过 `package.json` 顶层的 `expo` 字段配置部分工具行为：

| 配置路径 | 核心用途 |
| --- | --- |
| `expo.install.exclude` | 排除特定库的 Expo 推荐版本检查 |
| `expo.autolinking` | 配置原生模块解析和自动链接 |
| `expo.doctor.reactNativeDirectoryCheck` | 配置 React Native Directory 依赖检查 |
| `expo.doctor.appConfigFieldsNotSyncedCheck` | 检查应用配置是否可能未同步到现有原生工程 |

最重要的原则是：**忽略或关闭检查只会改变工具的报告行为，不会自动解决底层兼容性、原生链接或配置同步问题。**

---

## 文档导航

- **上一页**：[metro](./3__metro.md)
- **下一页**：[router](./5__router.md)
