# 创建你的第一个 Expo 应用

> 原文标题：Create your first app  
> 文档修改日期：2026 年 6 月 3 日  
> 本章示例项目：`StickerSmash`  
> 本章教程指定版本：**Expo SDK 54**

## 文档解决的问题

这篇教程介绍如何从零开始创建并运行一个 Expo 项目，主要完成以下任务：

1. 准备开发环境。
2. 使用 `create-expo-app` 创建 React Native 项目。
3. 清理模板中的示例代码。
4. 在 Android、iOS 真机和 Web 浏览器中运行应用。
5. 修改第一个页面。
6. 使用 React Native 核心组件和样式系统。

完成本章后，你会得到一个可以在 Android、iOS 和 Web 上运行的基础应用，并为后续添加导航做好准备。

## 适用场景

这篇文档适合：

- 第一次接触 Expo 或 React Native。
- 已经掌握 React 和 TypeScript，但没有移动端开发经验。
- 希望用一套项目代码同时开发 Android、iOS 和 Web。
- 准备继续学习 Expo Router 文件路由和移动端导航。

当前文档**不涉及**：

- Android Studio、Xcode 等原生开发工具的配置。
- Android 模拟器和 iOS 模拟器的使用。
- 应用打包、签名和发布。
- 原生模块开发。
- 生产环境部署。
- 完整的导航实现。本章只保留了导航所需的基础目录，下一章才会添加导航。

---

## 一、准备开发环境

文档要求准备以下四项内容。

### 1. 在真机上安装 Expo Go

需要在 Android 或 iOS 实体设备上安装 Expo Go。

Expo Go 可以理解为一个预先准备好的“应用运行容器”。开发服务器把项目代码发送给 Expo Go，由 Expo Go 在手机上加载并运行。

对于 React Web 开发者，可以将其类比为：

- 浏览器负责运行 Web 应用；
- Expo Go 负责在手机上加载和运行教程中的 Expo 应用。

这意味着，本章不要求你先创建完整的 Android 或 iOS 原生工程，也不要求你使用 Android Studio 或 Xcode。

> **文档明确说明：**本章使用安装在实体设备上的 Expo Go 测试应用。

### 2. 安装 Node.js LTS

开发机器需要安装 Node.js 的 LTS 版本。

Node.js 用于：

- 执行项目初始化命令；
- 安装和管理依赖；
- 运行 Expo 开发服务器；
- 执行项目脚本。

`LTS` 是 Long-Term Support，即长期支持版本。文档要求使用 LTS，而不是任意 Node.js 版本。

### 3. 安装代码编辑器

可以使用 VS Code，也可以使用其他编辑器或 IDE。

文档没有要求必须使用 VS Code。

### 4. 准备终端环境

支持的开发系统包括：

- macOS
- Linux
- Windows PowerShell
- Windows WSL2

后续的项目初始化、清理模板和启动服务器都需要在终端中执行。

### 需要具备的知识

教程默认读者已经熟悉：

- React
- TypeScript

> **当前文档未涉及：**React 和 TypeScript 的基础教学。原文建议不熟悉的读者先阅读 TypeScript Handbook 和 React 官方教程。

---

## 二、初始化 Expo 项目

### 使用 `create-expo-app`

进入希望存放项目的目录，然后根据所使用的包管理器执行对应命令。

#### npm

```sh
npx create-expo-app@latest StickerSmash
# 在交互提示中选择：SDK 54

cd StickerSmash
```

#### Yarn

```sh
yarn create expo-app StickerSmash
# 在交互提示中选择：SDK 54

cd StickerSmash
```

#### pnpm

```sh
pnpm create expo-app StickerSmash
# 在交互提示中选择：SDK 54

cd StickerSmash
```

#### Bun

```sh
bun create expo StickerSmash
# 在交互提示中选择：SDK 54

cd StickerSmash
```

### 命令分别做了什么

以 npm 为例：

```sh
npx create-expo-app@latest StickerSmash
```

各部分含义如下：

| 内容 | 作用 |
|---|---|
| `npx` | 执行 npm 包提供的命令，不需要预先进行全局安装 |
| `create-expo-app` | Expo 提供的项目初始化工具 |
| `@latest` | 使用该工具的最新版本 |
| `StickerSmash` | 新项目名称，同时也是默认创建的目录名称 |

初始化完成后：

```sh
cd StickerSmash
```

用于进入新创建的项目目录。后面的所有项目命令都应在该目录中执行。

### 必须选择 SDK 54

`create-expo-app@latest` 当前会要求选择 Expo SDK 模板。本教程明确要求选择：

```text
SDK 54
```

原因是本教程按照 SDK 54 模板的文件结构和依赖编写。

> **注意：**`@latest` 表示使用最新版的项目创建工具，不代表应该选择最新的 Expo SDK。本教程要求使用创建工具提供的 **SDK 54 模板**。

这是 React Web 开发者容易忽略的地方。它类似于使用最新版本的脚手架程序创建一个指定框架版本的项目：脚手架版本和项目所使用的 SDK 版本不是同一个概念。

### 默认模板包含什么

命令会使用 Expo SDK 54 的默认模板创建项目。模板已经包含构建应用所需的基础代码和依赖。

默认模板提供：

- 安装了 `expo` 包的 React Native 项目；
- Expo CLI 等推荐工具；
- Expo Router 提供的标签页导航；
- Android、iOS 和 Web 多平台配置；
- 默认的 TypeScript 配置；
- 可以通过 Expo Go 测试的项目结构。

### 关键概念：Expo SDK

Expo SDK 可以理解为一套有版本约束的 Expo 开发能力集合。教程指定 SDK 54，意味着后续代码、依赖和模板结构都以该版本为基准。

> **当前文档未进一步说明：**SDK 版本与 React Native 版本的对应关系，以及如何升级 SDK。

### 关键概念：Expo CLI

Expo CLI 是操作 Expo 项目的命令行工具。本章使用它启动开发服务器：

```sh
npx expo start
```

默认模板已经包含推荐工具，因此本章没有要求全局安装 Expo CLI。

### 关键概念：Expo Router

Expo Router 是项目模板中包含的导航方案。默认模板甚至已经带有标签页导航。

本章为了从基础开始学习文件路由，会先运行 `reset-project` 清理这些模板页面。导航的正式实现将在下一章介绍。

---

## 三、下载并替换教程资源

教程提供了一个资源压缩包，供后续开发 `StickerSmash` 使用。

下载并解压后，需要：

1. 找到项目中的 `assets/images` 目录。
2. 使用压缩包中的资源替换该目录下的默认资源。
3. 使用编辑器或 IDE 打开项目目录。

目录位置为：

```text
StickerSmash/
└── assets/
    └── images/
```

这里的资源通常是应用使用的图片等静态文件。

> **当前文档未涉及：**资源文件的具体名称、图片加载方式、支持格式和构建处理规则。

---

## 四、重置模板项目

默认模板包含示例页面、组件和导航代码。为了从基础开始构建应用，教程要求运行 `reset-project` 脚本。

### 执行命令

#### npm

```sh
npm run reset-project
```

#### Yarn

```sh
yarn run reset-project
```

#### pnpm

```sh
pnpm run reset-project
```

#### Bun

```sh
bun run reset-project
```

### 脚本执行后的结果

执行后，`app` 目录中只保留两个文件：

```text
app/
├── _layout.tsx
└── index.tsx
```

原来位于以下位置的模板代码会被移动到 `app-example`：

- `app`
- `components`
- `constants`
- `hooks`

因此项目结构大致变成：

```text
StickerSmash/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── app-example/
│   └── 原模板示例代码
└── assets/
    └── images/
```

### `reset-project` 的实际作用

该脚本会：

1. 重置项目的 `app` 目录结构。
2. 保留最基础的入口文件。
3. 将原模板样板代码移动到 `app-example`。
4. 让教程可以从简单结构开始逐步添加页面和组件。

`app-example` 不属于主应用结构，文档明确说明可以删除它。

> **注意：**脚本主要是移动和重置模板代码，不是启动项目或清除依赖。

### React Web 开发者需要注意

这和删除一个 Web 项目中的演示页面不完全相同。Expo Router 会根据 `app` 目录中的文件组织页面，因此调整 `app` 目录也会影响应用的路由结构。

> **基于文档内容推导：**不要把 `app-example` 误认为正式页面目录。教程后续使用的是 `app`，而不是 `app-example`。

---

## 五、在移动端和 Web 上运行应用

在项目根目录执行：

#### npm

```sh
npx expo start
```

#### Yarn

```sh
yarn expo start
```

#### pnpm

```sh
pnpm expo start
```

#### Bun

```sh
bun expo start
```

### 启动后发生什么

命令会启动 Expo 开发服务器，并在终端中显示二维码。

开发服务器负责向连接的运行环境提供项目代码。它和 React Web 项目中的开发服务器有相似之处，但这里的客户端不仅可以是浏览器，也可以是手机上的 Expo Go。

### Android 真机运行

1. 打开 Expo Go。
2. 选择 **Scan QR code**。
3. 扫描终端中的二维码。

### iOS 真机运行

1. 打开系统自带的相机应用。
2. 扫描终端中的二维码。
3. 通过扫描结果打开应用。

Android 和 iOS 的扫码方式不同：

| 平台 | 扫码工具 |
|---|---|
| Android | Expo Go 中的 **Scan QR code** |
| iOS | 系统相机 |

### Web 运行

开发服务器启动后，在终端按：

```text
W
```

Expo 会在默认浏览器中打开 Web 版本。

这里的 `W` 是开发服务器运行期间的交互按键，不是一条需要单独执行的 shell 命令。

### 多平台含义

默认模板已经配置为可运行在：

- Android
- iOS
- Web

> **文档明确说明：**同一个项目可以在以上三个平台运行。

> **基于文档内容推导：**“支持多个平台”不等于每个平台的表现永远完全一致。本章只验证基础页面能够运行，没有讨论平台差异或平台专用代码。

### 当前文档没有说明的运行问题

当前文档未涉及：

- 手机与电脑的网络连接要求；
- 二维码无法扫描时如何排查；
- 防火墙或局域网问题；
- 模拟器启动方法；
- 开发服务器的其他模式和参数；
- Expo Go 无法支持某个原生能力时怎么办。

遇到这些情况时，不能仅根据本章得出解决方案。

---

## 六、修改首页

本章修改的文件是：

```text
app/index.tsx
```

最终代码如下：

```tsx
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});
```

### `app/index.tsx` 的作用

文档将它描述为应用的入口页面：

- 定义屏幕上显示的内容；
- 开发服务器启动后会执行该页面；
- 在文件路由结构中代表应用首页。

对于 React Web 开发者，可以暂时把它理解为应用的首页组件，但不要直接等同于传统 React Web 项目的 `src/index.tsx`。

Web 项目的 `src/index.tsx` 往往负责挂载整个 React 应用；这里的 `app/index.tsx` 本身是一个页面文件，其路由身份与文件位置有关。

### React Native 核心组件

代码从 `react-native` 导入了：

```tsx
import { Text, View, StyleSheet } from 'react-native';
```

#### `View`

`View` 是 React Native 中用于布局的基础容器。

对 React Web 开发者，可以近似理解为承担 `<div>` 的布局职责，但它不是浏览器 DOM 的 `<div>`。

#### `Text`

`Text` 用于显示文本。

React Native 不使用 HTML 的 `<p>`、`<span>` 或标题标签来显示普通文字。本例将文字放在 `<Text>` 中：

```tsx
<Text style={styles.text}>Home screen</Text>
```

#### `StyleSheet`

`StyleSheet` 用于创建样式对象：

```tsx
const styles = StyleSheet.create({
  // 样式定义
});
```

组件通过 `style` 属性引用它们：

```tsx
<View style={styles.container}>
```

---

## 七、React Native 样式与 CSS 的区别

React Native 使用 JavaScript 对象定义样式，而不是在本例中编写 CSS 文件。

```tsx
const styles = StyleSheet.create({
  text: {
    color: '#fff',
  },
});
```

### 写法对比

React Web CSS：

```css
.container {
  background-color: #25292e;
  align-items: center;
}
```

React Native：

```tsx
container: {
  backgroundColor: '#25292e',
  alignItems: 'center',
}
```

主要区别包括：

- 属性名使用驼峰形式，如 `backgroundColor`。
- 属性值是 JavaScript 值。
- 样式通过组件的 `style` 属性传入。
- 本例不使用 CSS 类名或 `className`。

文档指出，很多属性会让有 CSS 经验的开发者感到熟悉，但没有声明 React Native 支持所有 CSS 属性。

### 本例样式说明

```tsx
container: {
  flex: 1,
  backgroundColor: '#25292e',
  alignItems: 'center',
  justifyContent: 'center',
}
```

| 属性 | 在本例中的效果 |
|---|---|
| `flex: 1` | 让容器占用可用空间 |
| `backgroundColor` | 将页面背景设置为深色 |
| `alignItems: 'center'` | 将子元素沿一个布局方向居中 |
| `justifyContent: 'center'` | 将子元素沿另一个布局方向居中 |

两个居中属性结合后，`Home screen` 会显示在屏幕中央。

```tsx
text: {
  color: '#fff',
}
```

将文字设置为白色，从而在深色背景上保持可读性。

### 颜色格式

React Native 支持与 Web 相同的常见颜色格式，包括：

- 十六进制颜色，如 `#fff`
- `rgba`
- `hsl`
- 命名颜色，如 `red`、`green`、`blue`
- 其他命名颜色，如 `peru`、`papayawhip`

> **文档明确说明：**`#fff` 是十六进制三位简写格式。

---

## 八、保存后的更新行为

当你保存 `app/index.tsx` 后，修改会发送并应用到连接该开发服务器的运行中应用。

这意味着开发时可以：

1. 保持开发服务器运行。
2. 在手机或浏览器中打开应用。
3. 修改并保存代码。
4. 查看运行中的应用更新。

对于 React Web 开发者，这种体验与 Web 开发服务器的即时更新比较接近。

> **当前文档未说明：**该更新机制的正式名称、触发规则、状态是否保留，以及哪些修改需要重新启动应用。

---

## 九、容易踩坑和误解的地方

### 1. `@latest` 不等于选择最新 SDK

命令使用：

```sh
npx create-expo-app@latest StickerSmash
```

但交互选择必须是：

```text
SDK 54
```

本教程按 SDK 54 编写。创建工具本身使用最新版，与项目模板选择 SDK 54 并不冲突。

### 2. 不要跳过 SDK 选择

如果选择了不同 SDK，生成的模板结构、依赖或默认代码可能与教程不一致。

> **基于文档内容推导：**为了按本教程逐步操作，应避免自行选择其他 SDK。

### 3. 命令必须在正确目录执行

创建项目后需要先进入：

```sh
cd StickerSmash
```

`reset-project` 和 `expo start` 都应在项目目录中运行。

### 4. `app-example` 不是主应用目录

`reset-project` 将模板代码移动到 `app-example`，它只是旧示例代码的存放位置，可以删除。

正式应用仍然使用 `app` 目录。

### 5. `app/index.tsx` 不等于 Web 中的 DOM 挂载入口

它是应用首页文件，并使用 React Native 组件构建界面。不要在其中使用 `<div>`、`<span>` 等 Web DOM 元素替代 `View` 和 `Text`。

### 6. React Native 样式不是完整 CSS

虽然属性看起来类似 CSS，但本例使用的是 JavaScript 对象和 `style` 属性：

```tsx
<View style={styles.container}>
```

不能直接把所有 Web CSS 用法原样搬过来。

### 7. `W` 是终端交互按键

启动开发服务器后按 `W` 打开 Web 版本，不需要执行一个名为 `W` 的命令。

### 8. Expo Go 与最终独立应用不是同一概念

> **基于文档内容推导：**本章描述的是通过 Expo Go 加载开发项目，而不是构建和安装最终发布版本。关于独立应用的构建与发布，当前文档未涉及。

---

## 十、实际开发中的使用方式

按照本文档，可以形成以下基础开发流程：

```text
安装 Node.js LTS 和 Expo Go
        ↓
运行 create-expo-app
        ↓
选择 SDK 54 模板
        ↓
进入 StickerSmash 项目目录
        ↓
替换 assets/images 中的资源
        ↓
运行 reset-project
        ↓
运行 expo start
        ↓
通过二维码在手机上打开
        ↓
按 W 在浏览器中打开
        ↓
修改 app/index.tsx 并保存
        ↓
在运行中的应用中查看更新
```

### 基于经验建议

以下内容不是当前文档的明确要求：

- 开始操作前确认终端当前路径，避免把项目创建到错误位置。
- 不要同时混用 npm、Yarn、pnpm 和 Bun。选择一种与项目一致的包管理器。
- 初学阶段按照教程选择 SDK 54，不要主动升级依赖，否则可能偏离教程环境。
- 在删除 `app-example` 前，可以先确认自己不再需要参考其中的模板代码。
- 同时在真机和 Web 上查看页面，有助于尽早发现平台显示差异。

---

## 十一、文档明确信息与推导信息

### 文档明确说明

- 本章用于创建并运行一个新的 Expo 项目。
- 需要实体 Android 或 iOS 设备，并安装 Expo Go。
- 需要 Node.js LTS、代码编辑器和终端。
- 默认读者熟悉 React 和 TypeScript。
- 使用 `create-expo-app` 创建项目。
- 本教程必须选择 SDK 54 模板。
- 默认模板包含 Expo、Expo CLI、Expo Router 标签页导航、多平台配置和 TypeScript。
- 教程资源需要替换到 `assets/images`。
- `reset-project` 会重置 `app` 并将模板代码移动到 `app-example`。
- `app-example` 可以删除。
- `expo start` 会启动开发服务器并显示二维码。
- Android 通过 Expo Go 扫码，iOS 通过系统相机扫码。
- 按 `W` 可以打开 Web 应用。
- `app/index.tsx` 定义首页内容。
- 本例使用 `View`、`Text` 和 `StyleSheet`。
- React Native 使用 JavaScript 对象定义本例样式。
- 保存代码后，修改会应用到连接开发服务器的应用。
- 下一章将添加栈导航和标签页导航。

### 基于文档内容推导

- `app` 目录的文件结构与 Expo Router 的页面导航有关。
- `app-example` 不应作为后续正式页面的开发目录。
- 使用不同 SDK 可能导致项目结构或依赖与教程不一致。
- Expo Go 在本章中承担移动端开发运行容器的角色。
- 本章运行的是开发项目，并不代表已经构建出可发布的独立应用。
- 多平台支持不代表三个平台的所有表现都必然完全相同。

---

## 总结

本章完成了 Expo 项目的最小开发闭环：

- 使用 `create-expo-app` 创建 SDK 54 项目；
- 了解默认模板提供的 Expo Router、TypeScript 和多平台能力；
- 使用 `reset-project` 清理模板代码；
- 通过 Expo Go 在 Android 或 iOS 真机上运行应用；
- 在浏览器中运行 Web 版本；
- 使用 `View`、`Text` 和 `StyleSheet` 修改首页；
- 理解 React Native 样式对象与 Web CSS 的基本区别。

本章的重点不是构建完整功能，而是确保项目能够成功创建、运行和更新。下一章将在此基础上添加栈导航和标签页导航。

<!-- NAVIGATION START -->
---
[← 上一页：使用 React Native 与 Expo 构建通用应用：教程导读](./0_introduction.md) | [下一页：在 Expo 应用中添加导航 →](./2_add-navigation.md)
<!-- NAVIGATION END -->
