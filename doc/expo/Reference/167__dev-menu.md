# Expo DevMenu 学习指南

## 文档解决的问题

`expo-dev-menu` 为 React Native 应用的**调试构建**提供开发者菜单。开发者可以通过手势或代码打开菜单，快速执行开发操作，也可以注册自定义菜单项。

它适合以下场景：

- Expo 项目只需要开发者菜单，不需要完整的开发启动器。
- 在现有原生应用中逐步接入 React Native 和 Expo 模块，即 brownfield（棕地）项目。
- 希望把项目专用的调试操作集中到开发者菜单中。
- 需要通过代码主动打开、隐藏或关闭开发者菜单。

> **版本提醒：**原文是“下一个 SDK 版本”的未发布版本文档。文档明确指出，当前最新稳定文档对应 **SDK 56**。实际开发时应以项目使用的 Expo SDK 版本为准，避免直接把未发布版本的 API 说明套用到稳定项目中。

## 阅读前需要理解的背景

### 什么是调试构建

调试构建是面向开发阶段的 App 构建，其中可以包含调试工具、开发菜单和连接开发服务器的能力。

对于 React Web 开发者，可以近似理解为：

- Web 开发服务器提供浏览器页面和调试环境；
- React Native 调试构建则是一个安装在设备或模拟器上的原生 App；
- `expo-dev-menu` 提供的是这个 App 内部的开发工具菜单，而不是浏览器 DevTools。

该库面向调试构建，不应把它理解为提供给最终用户的业务菜单。

### 什么是 Expo 模块

Expo 不仅是一套项目工具，也提供可以接入 React Native 原生工程的模块。`expo-dev-menu` 就是其中一个模块。

如果项目原本是普通 React Native 工程，不能只安装 `expo-dev-menu`：原文明确要求先为项目安装并配置 `expo`，使原生工程具备使用 Expo 模块的能力。

### 什么是 brownfield 应用

brownfield 应用是已经存在的 iOS 或 Android 原生应用，之后再逐步接入 React Native 或 Expo 功能。

这类项目可能只需要开发者菜单，而不需要 `expo-dev-client` 提供的完整启动器，因此特别适合单独使用 `expo-dev-menu`。

## 核心能力

`expo-dev-menu` 支持 Android、iOS 和 tvOS，主要提供三类能力：

1. 可通过摇晃设备或三指长按打开的开发者菜单 UI。
2. 对常用开发操作的快速访问。
3. 可扩展的自定义菜单项。

它可以作为独立库安装在 Expo 项目中，不要求必须同时使用完整的 `expo-dev-client`。

## 安装

根据项目使用的包管理器选择一条命令：

```sh
# npm
npx expo install expo-dev-menu

# yarn
yarn expo install expo-dev-menu

# pnpm
pnpm expo install expo-dev-menu

# bun
bun expo install expo-dev-menu
```

这里使用 `expo install`，而不是直接执行普通的 `npm install`。它会根据项目的 Expo SDK 版本选择兼容的依赖版本。

如果是在已有的普通 React Native 项目中安装，还必须先按照 Expo 的 bare workflow 接入流程安装 `expo`。当前文档只说明了这一前置要求，没有展开原生工程配置步骤。

## 打开开发者菜单

安装完成后，开发者菜单会出现在调试构建中。共有三种打开方式。

### 摇晃设备

在真机上摇晃设备即可打开菜单。

这是移动端特有的开发交互。它不像 React Web 那样依赖浏览器快捷键，而是由运行 App 的设备触发。

### 三指长按

使用三根手指在屏幕上长按，可以打开菜单。

这种方式适用于不方便摇晃设备的情况。原文没有进一步说明不同平台、模拟器或系统手势冲突时的行为。

### 通过代码打开

```tsx
import * as DevMenu from 'expo-dev-menu';

DevMenu.openMenu();
```

这种方式适合：

- 在内部调试页面中放置“打开开发菜单”按钮；
- 设备手势不方便使用时提供替代入口；
- 从项目自定义调试流程中打开菜单。

## 扩展开发者菜单

通过 `registerDevMenuItems` 可以向菜单注册额外按钮：

```tsx
import { registerDevMenuItems } from 'expo-dev-menu';

const devMenuItems = [
  {
    name: 'My Custom Button',
    callback: () => console.log('Hello world!'),
  },
];

registerDevMenuItems(devMenuItems);
```

注册后，开发者菜单会新增一个区域，显示这些自定义按钮。用户点击按钮时，对应的 `callback` 会被调用。

### 菜单项结构

每个菜单项都是一个 `ExpoDevMenuItem` 对象：

| 属性 | 类型 | 是否必需 | 作用 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 菜单项显示的文字 |
| `callback` | `() => void` | 是 | 用户选择菜单项时执行的回调 |
| `shouldCollapse` | `boolean` | 否 | 用户操作后是否收起菜单，默认值为 `false` |

示例：

```tsx
import { registerDevMenuItems } from 'expo-dev-menu';

registerDevMenuItems([
  {
    name: '清空本地调试状态',
    callback: () => {
      console.log('清空调试状态');
    },
    shouldCollapse: true,
  },
]);
```

`shouldCollapse: true` 表示用户点击该项后收起菜单；默认的 `false` 表示菜单不会因为这次交互而自动收起。

### 注册行为的重要限制

> 后续调用 `registerDevMenuItems` 会覆盖此前注册的全部菜单项。

例如：

```tsx
registerDevMenuItems([
  { name: '操作 A', callback: () => {} },
]);

registerDevMenuItems([
  { name: '操作 B', callback: () => {} },
]);
```

最终不应期待菜单同时包含“操作 A”和“操作 B”。第二次调用会覆盖第一次注册的内容。

这和 React Web 中多次向数组追加元素不同。应用如果有多个自定义调试操作，应先将它们合并到同一个数组中，再统一注册：

```tsx
const devMenuItems = [
  { name: '操作 A', callback: () => {} },
  { name: '操作 B', callback: () => {} },
];

registerDevMenuItems(devMenuItems);
```

如果不同模块分别执行注册，它们可能互相覆盖。

## 与 expo-dev-client 的选择

如果项目使用 Expo 的 development build（开发构建），原文建议安装 `expo-dev-client`，而不是只安装 `expo-dev-menu`。

`expo-dev-client` 已经包含 `expo-dev-menu`，并额外提供：

- 可配置的启动器 UI，用于切换开发服务器；
- 更完善的调试工具；
- 加载 EAS Update 更新的能力。

安装命令如下：

```sh
# npm
npx expo install expo-dev-client

# yarn
yarn expo install expo-dev-client

# pnpm
pnpm expo install expo-dev-client

# bun
bun expo install expo-dev-client
```

可以这样理解二者的定位：

| 需求 | 建议选择 |
| --- | --- |
| 只需要开发者菜单 | `expo-dev-menu` |
| brownfield 项目不需要完整启动器 | `expo-dev-menu` |
| 需要开发服务器切换、增强调试和 EAS Update 加载 | `expo-dev-client` |
| 已经使用完整的 Expo development build 工作流 | 按原文建议使用 `expo-dev-client` |

不要同时把两者当作彼此独立、功能并列的工具：`expo-dev-client` 已经包含 `expo-dev-menu`。

## API 说明

完整模块可以通过命名空间导入：

```tsx
import * as DevMenu from 'expo-dev-menu';
```

### `DevMenu.openMenu()`

```tsx
DevMenu.openMenu();
```

- 支持 Android、iOS 和 tvOS。
- 打开开发者菜单。
- 返回值为 `void`。

### `DevMenu.closeMenu()`

```tsx
DevMenu.closeMenu();
```

- 支持 Android、iOS 和 tvOS。
- 关闭开发者菜单。
- 返回值为 `void`。

### `DevMenu.hideMenu()`

```tsx
DevMenu.hideMenu();
```

- 支持 Android、iOS 和 tvOS。
- 隐藏开发者菜单。
- 返回值为 `void`。

原文分别提供了 `closeMenu()` 和 `hideMenu()`，但没有解释二者在生命周期、状态保留或动画行为上的具体差异。因此不能仅根据当前文档断言它们在内部行为上的区别。

### `DevMenu.registerDevMenuItems(items)`

```tsx
await DevMenu.registerDevMenuItems(items);
```

参数类型：

```ts
ExpoDevMenuItem[]
```

- 支持 Android、iOS 和 tvOS。
- 用于设置自定义开发者菜单项。
- 返回 `Promise<void>`。
- 后续调用会替换之前注册的菜单项。

由于它返回 Promise，需要等待注册完成或处理可能出现的异步失败：

```tsx
async function setupDevMenu() {
  await DevMenu.registerDevMenuItems([
    {
      name: '输出调试信息',
      callback: () => console.log('Debug info'),
    },
  ]);
}
```

> **基于文档内容推导：**如果后续逻辑依赖菜单项已经注册完成，应使用 `await`，而不是把它当成同步函数调用。

## React Web 开发者容易误解的地方

### 它不是网页中的开发菜单组件

`expo-dev-menu` 不是一个需要渲染到 JSX 树中的 React 组件，也不是类似 React Developer Tools 的浏览器扩展。

它由原生调试构建提供，通过设备手势或命令式 API 控制，不需要编写：

```tsx
<DevMenu />
```

### 安装依赖后仍然涉及原生构建环境

React Web 项目安装依赖后通常刷新浏览器即可。React Native 中，这类包含原生能力的模块需要存在于 App 的原生构建产物中。

当前文档没有提供重新构建、原生链接或平台工程配置的具体步骤，但明确限定该菜单用于调试构建，并要求普通 React Native 项目先安装 Expo 模块支持。

### development build 不是 Web 开发服务器

development build 是安装到设备或模拟器上的原生应用程序。开发服务器负责提供 JavaScript 代码，而原生构建负责承载 `expo-dev-menu` 等原生能力。

`expo-dev-client` 提供的启动器可以切换开发服务器，单独的 `expo-dev-menu` 则不提供这套完整启动器界面。

### 注册 API 不是累加模式

多次调用 `registerDevMenuItems` 不会逐项追加，而会覆盖之前的全部条目。这是使用该 API 时最需要注意的状态管理规则。

## 注意事项与限制

1. 当前页面是未发布的下一 SDK 版本文档，稳定项目应核对对应 SDK 版本的文档。
2. 该库面向调试构建，当前文档没有说明其在生产构建中的可用性或行为。
3. 普通 React Native 项目必须先接入 `expo`，不能假定安装单个 npm 包就已完成全部原生配置。
4. `registerDevMenuItems` 后续调用会覆盖以前的所有注册结果。
5. `shouldCollapse` 默认是 `false`，菜单项执行后不会默认收起菜单。
6. 当前文档没有解释 `hideMenu()` 与 `closeMenu()` 的具体行为差异。
7. 当前文档没有涉及自定义菜单项的注销 API、图标、排序、禁用状态或分组配置。
8. 当前文档没有说明回调抛出异常、异步回调或重复注册失败时如何处理。
9. 当前文档列出的支持平台只有 Android、iOS 和 tvOS，没有列出 Web。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将所有自定义菜单项集中在一个模块中注册，避免多个模块相互覆盖。
- 只注册开发阶段真正需要的操作，例如清空缓存、切换测试账号、输出诊断信息或进入内部调试页面。
- 对清空数据、重置状态等破坏性操作增加二次确认，避免误触。
- 在应用初始化阶段只注册一次，避免组件重复渲染或重新挂载时反复覆盖菜单项。
- 对 `registerDevMenuItems` 的 Promise 添加错误处理，防止注册失败被静默忽略。
- 不要在开发菜单回调中放置生产业务必须依赖的逻辑，因为该菜单的定位是开发和调试工具。

## 总结

`expo-dev-menu` 是一个面向 Android、iOS 和 tvOS 调试构建的开发者菜单模块。它可以通过摇晃设备、三指长按或 `openMenu()` 打开，并允许通过 `registerDevMenuItems()` 添加项目专用的调试操作。

选择时需要区分两个层级：

- 只需要轻量开发菜单，尤其是 brownfield 项目：使用 `expo-dev-menu`。
- 需要完整开发启动器、开发服务器切换、增强调试和 EAS Update 支持：使用已经包含该菜单的 `expo-dev-client`。

实际使用中最重要的限制是：**每次注册自定义菜单项都会覆盖此前注册的全部条目**，因此应统一管理菜单项列表。

---

## 文档导航

- **上一页**：[devicemotion](./166__devicemotion.md)
- **下一页**：[document picker](./168__document-picker.md)
