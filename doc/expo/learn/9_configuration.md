# 配置状态栏、启动屏幕和应用图标

> 原文档更新时间：2026 年 3 月 9 日  
> 文档性质：Expo 入门教程中的应用发布前配置章节  
> 内容范围：状态栏、应用图标和启动屏幕

## 文档解决的问题

这篇文档介绍如何在 Expo 项目中完成三项应用外观配置：

1. 设置系统状态栏的显示样式。
2. 指定应用图标。
3. 配置应用启动时显示的启动屏幕。

这些属于应用提交到应用商店前的基础完善工作。

文档所使用的项目默认由 `create-expo-app` 创建，并使用 Expo Router 管理页面结构。

## 适用场景

本文适合以下场景：

- 使用 `create-expo-app` 创建了 Expo 项目。
- 项目使用 `app/_layout.tsx` 作为根布局。
- 准备完善 Android 和 iOS 应用的外观。
- 准备创建预览版本或生产版本。
- 希望了解 Expo 默认项目如何管理应用图标和启动屏幕。

当前文档未涉及：

- 如何设计图标或启动屏幕素材。
- 如何修改 Android、iOS 原生工程文件。
- 应用商店的完整提交流程。
- 状态栏的全部配置属性。
- 启动屏幕的完整配置参数。
- Web 端图标和启动画面的具体行为。

---

## 阅读前需要理解的概念

### 状态栏

状态栏是手机屏幕顶部由操作系统显示的区域，通常包含：

- 时间
- 电量
- 网络状态
- 信号强度

它不属于普通 React 页面内容，而是操作系统界面的一部分。应用可以通过 Expo 提供的组件调整其中图标和文字的显示风格。

对于 React Web 开发者，可以将其理解为：应用正在配置浏览器页面以外的一部分系统 UI。

### 应用图标

应用图标是安装应用后，在手机桌面、应用列表以及部分开发工具中显示的图像。

它不同于 Web 项目中的 favicon：

- favicon 主要显示在浏览器标签页等位置。
- 移动应用图标属于安装包的一部分。
- 不同设备可能需要不同尺寸和格式的图标。

Expo 会在构建阶段根据项目提供的源图片生成适合不同设备的优化版本。

### 启动屏幕

启动屏幕是应用启动后、正式内容加载完成前显示的画面。

文档中的默认启动屏幕使用一个居中的较小图片，例如应用图标。当应用内容准备好后，启动屏幕会隐藏。

它与 React Web 页面中的普通“加载中”组件不同：

- 启动屏幕出现在应用内容显示之前。
- 它由应用构建配置和原生启动流程控制。
- 普通 React 组件通常需要 JavaScript 开始运行后才能显示。

### Config Plugin

文档说明 `expo-splash-screen` 提供了用于配置启动屏幕的 config plugin。

对于 React Web 开发者，可以暂时将 config plugin 理解为：

> Expo 在生成或构建 Android、iOS 应用时，读取项目配置并修改对应原生应用设置的机制。

本文只说明它用于配置启动屏幕，没有进一步介绍其运行原理。

---

## 一、配置状态栏

### 使用的库

状态栏由 `expo-status-bar` 库管理。

该库具有以下特点：

- 通过 `create-expo-app` 创建项目时已经预安装。
- 提供 `StatusBar` React 组件。
- 可以通过组件属性配置状态栏样式。

因此，按照本文的默认项目环境，不需要额外执行安装命令。

### 修改文件

需要修改：

```text
app/_layout.tsx
```

这个文件是示例项目的根布局。现有的 `Stack` 负责页面导航结构，`StatusBar` 则负责系统状态栏。

### 配置代码

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
```

### 代码说明

```tsx
import { StatusBar } from 'expo-status-bar';
```

从 `expo-status-bar` 导入状态栏组件。

```tsx
<>
  ...
</>
```

这是 React Fragment 的简写形式。因为根布局需要同时返回 `Stack` 和 `StatusBar` 两个组件，所以使用 Fragment 将它们组合起来，而不会额外创建一个实际视图容器。

```tsx
<StatusBar style="light" />
```

将状态栏内容设置为浅色样式。

这里的“浅色”指状态栏中的文字和图标采用浅色显示，并不表示状态栏背景一定会自动变成浅色。

### 对开发的影响

`StatusBar` 放在根布局中，意味着它作为应用整体布局的一部分生效。

**基于文档内容推导：** 当页面背景较深时，浅色状态栏内容通常更容易看清。具体颜色选择应与应用顶部背景形成足够对比。

当前文档未说明：

- 如何设置状态栏背景色。
- 如何针对不同页面使用不同状态栏样式。
- `style` 支持哪些其他取值。
- Android 和 iOS 是否存在行为差异。

---

## 二、配置应用图标

### 默认图标文件

项目中的应用图标位于：

```text
assets/images/icon.png
```

文档给出的图标尺寸是：

```text
1024 × 1024 px
```

### `app.json` 配置

应用图标路径由 `app.json` 中的 `"icon"` 属性配置。

新建 Expo 项目默认已经设置为：

```json
{
  "expo": {
    "icon": "./assets/images/icon.png"
  }
}
```

原文没有展示完整配置代码，但明确说明默认路径是：

```text
./assets/images/icon.png
```

如果文件存在且路径没有变化，则不需要修改配置。

### 构建时的处理

当应用最终通过 Expo Application Services（EAS）构建并准备发布到应用商店时，EAS 会使用这张源图片，为不同设备生成经过优化的应用图标。

这意味着开发者提供的是高分辨率源文件，而不是手动制作本文涉及的每一种设备尺寸。

文档还提到，可以在 Expo Go 的部分位置看到该图标，例如 Expo Go 的开发者菜单。

### React Web 开发者容易误解的地方

#### 不是 favicon

不要把 `icon.png` 当作普通网站 favicon。它是移动应用构建配置的一部分。

#### 修改文件后不代表所有环境立即完全更新

**基于文档内容推导：** EAS 在构建阶段才会根据源图标生成设备所需的优化图标，因此最终安装包中的表现应以实际构建结果为准。

#### 路径相对于项目配置

配置中的路径是：

```text
./assets/images/icon.png
```

如果移动或重命名图标文件，必须同步修改 `app.json` 中的 `"icon"` 路径。

---

## 三、配置启动屏幕

### 默认行为

启动屏幕会在应用内容加载完成前显示，并在内容可以展示后隐藏。

文档中的默认方案使用一个居中的较小图片作为启动屏幕图像。

### 使用的库和插件

启动屏幕由 `expo-splash-screen` 负责。

该库具有以下特点：

- 通过 `create-expo-app` 创建项目时已经预安装。
- 提供 config plugin。
- config plugin 用于配置原生启动屏幕。

按照本文的默认项目环境，不需要额外安装该库。

### 启动屏幕素材

默认配置使用：

```text
assets/images/splash-icon.png
```

注意，它与应用图标文件不是同一个文件：

```text
应用图标：assets/images/icon.png
启动屏幕：assets/images/splash-icon.png
```

虽然文档说默认启动屏幕使用应用图标作为启动屏幕图像，但配置中引用的是专门的 `splash-icon.png` 素材。

### `app.json` 配置

文档展示的配置片段如下：

```json
{
  "plugins": [
    ...
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png"
        ...
      }
    ]
  ]
}
```

其中：

- `"expo-splash-screen"`：启用启动屏幕 config plugin。
- `"image"`：指定启动屏幕使用的图像路径。
- `...`：表示原配置中还有其他内容，不能直接作为合法 JSON 写入文件。

默认项目已经完成该配置，因此教程中不要求修改。

### 关键限制：不能在 Expo Go 或开发构建中测试

这是本文最重要的限制之一。

文档明确说明，不能通过以下环境测试启动屏幕：

- Expo Go
- development build，即开发构建

要测试启动屏幕，需要创建：

- preview build，即预览构建；或者
- production build，即生产构建。

### 为什么这一点容易踩坑

React Web 开发者通常习惯通过开发服务器立即验证 UI 修改。但启动屏幕属于应用启动阶段的原生配置，不是普通 React 页面。

**基于文档内容推导：** 即使项目中的 `app.json` 配置正确，在 Expo Go 或开发构建中没有看到预期启动屏幕，也不能据此判断配置失败。应当使用预览构建或生产构建验证。

### 文档推荐的后续资料

原文建议继续阅读：

- 创建启动屏幕图标的指南。
- EAS 内部分发指南，用于创建预览构建。
- Android 生产构建指南。
- iOS 生产构建指南。

当前文档没有展开具体构建命令和操作步骤。

---

## 配置关系总览

| 目标 | 文件或位置 | 使用的库或配置 | 默认是否已准备 |
|---|---|---|---|
| 状态栏样式 | `app/_layout.tsx` | `expo-status-bar` 的 `StatusBar` 组件 | 库已安装，需要添加组件配置 |
| 应用图标 | `assets/images/icon.png` | `app.json` 的 `"icon"` 属性 | 是 |
| 启动屏幕图片 | `assets/images/splash-icon.png` | `expo-splash-screen` config plugin | 是 |
| 启动屏幕测试 | 预览或生产构建 | EAS 构建流程 | 需要另外创建构建 |

---

## React Web 开发者需要特别注意的地方

### React 组件配置与构建配置是两种不同机制

状态栏通过 React 组件配置：

```tsx
<StatusBar style="light" />
```

应用图标和启动屏幕主要通过 `app.json` 配置，并在构建阶段影响移动应用。

可以简单区分为：

| 类型 | 示例 | 生效方式 |
|---|---|---|
| React 运行时配置 | `StatusBar` | 应用运行 React 代码时生效 |
| 应用构建配置 | 图标、启动屏幕 | 构建原生应用时处理 |

### Expo Go 不等于最终应用

Expo Go 可以用于查看部分开发效果，也能在开发者菜单中显示项目图标，但它不能用于验证本文所述的启动屏幕。

最终的原生启动体验需要通过预览或生产构建检查。

### “项目已经预配置”不等于永远不需要修改

本文使用的是 `create-expo-app` 默认项目，因此很多文件和配置已经存在。

如果实际项目中发生以下变化，就需要同步调整：

- 更换图片文件。
- 移动素材目录。
- 修改文件名。
- 改变 `app.json` 中的路径。

---

## 实际开发中的使用方式

可以按照以下顺序完成发布前检查：

1. 在 `app/_layout.tsx` 中加入 `StatusBar`。
2. 根据应用顶部背景选择合适的状态栏样式。
3. 确认 `assets/images/icon.png` 存在且尺寸为 `1024 × 1024 px`。
4. 确认 `app.json` 的 `"icon"` 指向正确文件。
5. 确认 `expo-splash-screen` 插件已经配置。
6. 确认插件的 `"image"` 指向 `splash-icon.png`。
7. 创建预览构建或生产构建。
8. 在实际构建版本中检查启动屏幕。

**基于经验建议：** 更换素材后，应同时检查配置路径和实际构建结果，不要只根据开发服务器或 Expo Go 中的表现判断最终效果。

---

## 明确内容与推导内容

### 文档明确说明

- `expo-status-bar` 默认随 `create-expo-app` 安装。
- `StatusBar` 组件可用于配置状态栏样式。
- 示例将状态栏设置为 `light`。
- 应用图标是 `assets/images/icon.png`。
- 图标尺寸是 `1024 × 1024 px`。
- `app.json` 的 `"icon"` 属性配置图标路径。
- EAS 会根据源图片生成针对不同设备优化的图标。
- `expo-splash-screen` 默认随项目安装。
- 启动屏幕由 config plugin 配置。
- 默认启动屏幕图片是 `assets/images/splash-icon.png`。
- Expo Go 和开发构建不能用于测试启动屏幕。
- 启动屏幕必须通过预览构建或生产构建测试。

### 基于文档内容推导

- 状态栏颜色应与页面顶部背景保持足够对比。
- 应用图标和启动屏幕属于构建配置，不完全等同于普通 React UI。
- 在 Expo Go 中没有看到预期启动屏幕，不代表配置一定错误。
- 移动或重命名图片后，需要同步更新 `app.json` 的路径。
- 最终发布效果应通过真实构建版本验证。

---

## 总结

本章处理了 Expo 应用发布前的三项基础外观配置：

- 使用 `expo-status-bar` 的 React 组件配置系统状态栏。
- 使用 `app.json` 的 `"icon"` 属性指定应用图标。
- 使用 `expo-splash-screen` config plugin 配置启动屏幕。

对 React Web 开发者来说，最关键的是区分普通 React UI 和原生应用构建配置。状态栏可以通过组件控制，而应用图标和启动屏幕依赖 Expo 的应用配置及构建流程。尤其是启动屏幕，不能通过 Expo Go 或开发构建验证，必须创建预览构建或生产构建。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 通用应用中处理平台差异](./8_platform-differences.md) | [下一页：Expo 与 React Native 后续学习资源指南 →](./10_follow-up.md)
<!-- NAVIGATION END -->
