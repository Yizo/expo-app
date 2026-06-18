> 原文地址：https://docs.expo.dev/router/advanced/platform-specific-modules/

# 平台特定扩展与模块

本指南介绍如何在 Expo Router 中根据操作系统切换模块，利用 React Native 的 `Platform` 模块以及专用文件扩展名来实现跨平台差异化开发。

在应用开发过程中，通常需要针对不同操作系统展示不同的内容。通过使用专用文件后缀名和 `Platform` 工具，可以为每个平台打造更贴合原生体验的界面效果。以下内容将介绍在 Expo Router 中实现这一目标的多种方法。

---

## 关键概念说明（面向初学者）

- **Metro 打包器（Metro Bundler）**：React Native 官方使用的 JavaScript 打包工具，负责将你的源代码编译、打包成可在设备上运行的格式。它会自动识别平台特定的文件后缀名并选择正确的文件。
- **平台特定扩展名（Platform-specific Extensions）**：一种文件命名约定，通过在文件扩展名前添加平台标识（如 `.ios.tsx`、`.android.tsx`、`.web.tsx`、`.native.tsx`），让 Metro 打包器根据运行平台自动选择对应的文件。
- **`Platform` 模块**：React Native 内置的工具模块，用于在运行时检测当前运行的操作系统（iOS、Android 或 Web），以便在代码中编写条件逻辑。
- **深度链接（Deep Link）**：一种通过 URL 直接导航到应用内特定页面的机制。确保所有平台都存在通用路由，才能让深度链接在任意平台上正常工作。

---

## 平台特定扩展名

> **注意：** 对这些专用文件后缀名的支持从 Expo Router **3.5.x** 版本开始引入。如果你使用的是更早的版本，请跳至下方的 [Platform 模块](#platform-模块) 章节。

你可以通过以下两种不同的方式使用平台特定扩展名：

### 在 `src/app` 目录内使用

在 **src/app** 文件夹中工作时，Metro 打包器允许使用如 **.android.tsx**、**.ios.tsx**、**.native.tsx** 或 **.web.tsx** 等平台特定后缀名——但前提是**必须同时存在一个不带平台后缀的通用版本**。这一要求确保了通用路由在所有平台上都能被访问，从而让深度链接在任意环境中均可正常工作。

请看以下目录结构示例：

```text
src
  app
    _layout.tsx
    _layout.web.tsx
    index.tsx
    about.tsx
    about.web.tsx
```

对于上述目录结构的说明：

- **`_layout.web.tsx`** 作为 Web 端的布局组件，而 **`_layout.tsx`** 处理所有其他平台（iOS、Android 等原生平台）的布局。
- **`index.tsx`** 作为所有平台的通用首页。
- **`about.web.tsx`** 作为 Web 端的"关于"页面，而 **`about.tsx`** 覆盖其他平台。

> **基于文档内容推导：** `.native.tsx` 后缀是一个特殊后缀，它会同时匹配 iOS 和 Android 平台（即所有原生平台），但不包括 Web。当你希望为原生平台和 Web 平台分别编写不同代码、但又不想为 iOS 和 Android 单独维护两份文件时，这个后缀非常实用。

> **基于经验建议：** 始终确保每个路由都存在一个不带平台后缀的通用版本文件（如 `index.tsx`）。如果缺少通用版本，某些平台的深度链接可能会出现 404 错误，导致用户无法正常访问页面。

### 在 `src/app` 目录外使用

你也可以在 **src/app** 文件夹**之外**创建带有平台特定后缀名的文件（如 **.android.tsx**、**.ios.tsx**、**.native.tsx** 或 **.web.tsx**），然后在 `src/app` 中导入它们。

请看以下目录结构示例：

```text
src
  app
    _layout.tsx
    index.tsx
    about.tsx
  components
    about.tsx
    about.ios.tsx
    about.web.tsx
```

在这个场景中，设计需求要求每个平台拥有不同的 `about` 页面。你可以在 **src/components** 目录中使用平台特定后缀名，为每个平台构建不同的组件。在导入时，Metro 打包器会**自动选择**与当前运行平台匹配的版本。最后，在 **src/app** 中将其重新导出为页面即可。

```tsx
export { default } from '@/components/about';
```

**代码说明：** 上述代码位于 `src/app/about.tsx` 中，它从 `src/components/about` 导入组件。虽然 `src/components/` 目录下存在 `about.tsx`、`about.ios.tsx` 和 `about.web.tsx` 三个文件，但你**不需要**在导入语句中指定平台——Metro 打包器会根据当前运行的平台自动解析并加载正确的文件。`@/` 是路径别名，通常指向 `src/` 目录。

> **基于经验建议：** 将平台特定组件放在 `src/components` 等外部目录中是更推荐的做法，因为它可以让路由目录（`src/app`）保持简洁，路由文件只负责路由逻辑，而将平台差异化逻辑封装在组件层。这种分离有助于提高代码的可维护性和可读性。

---

## Platform 模块

React Native 的 [`Platform`](https://reactnative.dev/docs/platform-specific-code#platform-module) 工具允许你在运行时识别当前活跃的操作系统，并据此展示相应的内容。例如，你可以在移动端显示 `Tabs`（底部标签栏）界面，而在 Web 端展示自定义的导航设计。

### 完整代码示例

```tsx
import { Platform } from 'react-native';
import { Link, Slot, Tabs } from 'expo-router';

export default function Layout() {
  if (Platform.OS === 'web') {
    // 在 Web 端使用基础的自定义布局
    return (
      <div style={{ flex: 1 }}>
        <header>
          <Link href="/">首页</Link>
          <Link href="/settings">设置</Link>
        </header>
        <Slot />
      </div>
    );
  }
  // 在原生平台（iOS/Android）上使用底部标签栏布局
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="settings" options={{ title: '设置' }} />
    </Tabs>
  );
}
```

**代码逐行说明（面向初学者）：**

1. `import { Platform } from 'react-native'`：从 React Native 导入 `Platform` 模块。`Platform.OS` 的值在 iOS 上为 `'ios'`，在 Android 上为 `'android'`，在浏览器上为 `'web'`。
2. `import { Link, Slot, Tabs } from 'expo-router'`：从 Expo Router 导入导航相关组件。`Link` 用于创建导航链接，`Slot` 用于渲染子路由内容，`Tabs` 用于创建底部标签栏导航。
3. `if (Platform.OS === 'web')`：判断当前是否在 Web 环境运行。
4. Web 端返回一个使用 `<div>` 和 `<header>` 的 HTML 结构布局，配合 Expo Router 的 `<Link>` 组件实现导航，使用 `<Slot />` 渲染当前路由匹配到的页面内容。
5. 原生平台（非 Web）返回 `<Tabs>` 组件，这是一个原生的底部标签栏导航，通过 `<Tabs.Screen>` 定义各个标签页。

> **基于经验建议：** 虽然 `Platform.OS` 的条件判断非常直观方便，但过度使用会导致单个文件内充斥着大量平台分支逻辑，降低代码可读性。当平台差异较大时，优先考虑使用平台特定文件扩展名（如 `.web.tsx`、`.native.tsx`）来分离代码，这样每个文件只需关注一个平台的逻辑，更易于维护和测试。

> **基于文档内容推导：** `Platform` 模块方式和平台特定扩展名方式可以组合使用。例如，你可以用 `.web.tsx` 和 `.native.tsx` 文件来分离大块的 UI 差异，同时在文件内部用 `Platform.OS` 处理 iOS 和 Android 之间的细微差别（如状态栏高度、返回按钮行为等）。

---

## 两种方案对比总结

| 特性 | 平台特定扩展名 | Platform 模块 |
|------|---------------|--------------|
| **分离粒度** | 文件级别——整个文件按平台分离 | 代码级别——可在同一文件内按条件渲染 |
| **适用场景** | 平台间差异较大，整个组件/页面结构不同 | 平台间差异较小，仅部分内容或样式不同 |
| **代码可读性** | 高——每个文件只包含一个平台的逻辑 | 较低——条件分支多时文件会变得复杂 |
| **维护成本** | 需管理多个文件 | 单文件内管理，但分支多时测试成本上升 |
| **版本要求** | Expo Router 3.5.x 及以上 | 无特殊版本要求 |

> **基于经验建议：** 在实际项目中，建议优先使用平台特定扩展名来处理大的结构性差异（如完全不同的导航模式），使用 `Platform` 模块来处理小的细节差异（如图标位置、间距调整等）。两者结合使用可以让代码库既保持清晰的结构，又避免创建过多的平台特定文件。

---

## 常见问题与注意事项

1. **必须保留通用版本文件**：如上所述，缺少通用版本将导致路由解析失败和深度链接失效。这是使用平台特定扩展名时最常见的遗漏错误。

2. **`.native.tsx` 与 `.ios.tsx`/`.android.tsx` 的优先级**：如果同时存在 `.ios.tsx` 和 `.native.tsx`，在 iOS 平台上会优先使用 `.ios.tsx`（更具体的后缀优先级更高）。`.native.tsx` 作为所有原生平台的后备选项。

3. **Web 平台使用 HTML 元素**：在 Web 平台的条件分支中，可以使用标准的 HTML 元素（如 `<div>`、`<header>`），而在原生平台分支中应使用 React Native 组件（如 `View`、`Text`）。

4. **不要在运行时动态切换**：平台特定文件的选择发生在 Metro 打包阶段（构建时），而非运行时。因此不能期望在同一设备上动态切换平台文件。

---

## 文档导航

- **上一页**：[protected](./67__protected.md)
- **下一页**：[native intent](./69__native-intent.md)
