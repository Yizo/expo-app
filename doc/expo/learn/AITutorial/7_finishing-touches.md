# 收尾优化：状态栏、启动画面与应用图标

> 原文修改日期：2026 年 6 月 10 日

## 文档解决的问题

应用功能已经可以运行，但还缺少影响完成度的视觉细节。本章指导你通过 AI Agent 完成三项优化：

1. 提升深色背景下状态栏内容的可读性。
2. 配置应用启动时显示的启动画面。
3. 设置独立构建后使用的应用图标。

这篇文档适合已经完成 StickerSmash 主要功能，希望进行发布前视觉收尾的场景。它延续的是 AI 辅助开发流程，不要求读者手动编写代码。

## 阅读前需要理解的概念

### 状态栏

状态栏是手机屏幕最上方显示时间、电量和信号等系统信息的区域。

它不是 React Web 页面中的普通导航栏，而是由移动操作系统控制的界面区域。应用可以通过 Expo 提供的库调整其中图标和文字的明暗样式。

### `expo-status-bar`

`expo-status-bar` 是用于控制移动端状态栏显示效果的 Expo 库。

本章要求将状态栏内容设为浅色，以便时间、电量和信号图标在深色应用背景上保持清晰。

### 启动画面

启动画面（Splash Screen）是应用启动和加载过程中短暂显示的界面。

它不同于 React Web 应用加载后渲染的组件页面：这里的启动画面由应用配置和原生启动流程控制，会在项目内容准备完成前出现。

### 应用图标

应用图标是安装到设备后显示在主屏幕上的图标。

需要特别区分两个概念：

- **Expo Go 的图标**：当前用于承载和运行开发项目的 Expo Go 应用图标。
- **项目自己的图标**：项目被制作成独立应用后使用的图标。

在 Expo Go 中预览项目时，设备主屏幕显示的仍然是 Expo Go 的图标。

### Config Plugin

本章要求使用 `expo-splash-screen` config plugin 配置启动画面。

可以将 Config Plugin 理解为：通过 Expo 应用配置声明原生能力或原生项目设置的机制。它不同于 React Web 中只影响浏览器运行时的组件参数；相关设置通常需要重新启动开发流程，甚至在其他场景下重新生成或构建应用才能生效。

原文没有展示该插件对应的具体配置字段，也没有解释其内部实现。

## 按教程顺序完成收尾工作

### 1. 修复状态栏的可读性

当前应用使用深色背景，而屏幕顶部的时间、电量和信号图标也是深色，因此难以辨认。

向 AI Agent 提交以下提示：

```text
The phone's status bar (the clock and battery icons at the top of the screen) is hard to read against our dark background. Use the expo-status-bar library to make the status bar text light on every screen.
```

这段提示的目标包括：

- 使用 `expo-status-bar` 库。
- 将状态栏内容改成浅色。
- 确保该设置覆盖所有页面，而不只是当前页面。

完成后，预期结果是屏幕顶部的时间、电量和信号图标变为浅色，在深色背景上清晰可见。

#### React Web 开发者容易误解的地方

“在每个页面上生效”不一定意味着要在每个页面组件中重复配置。

原文只明确要求最终效果覆盖所有页面，没有说明 Agent 应将代码放在哪个组件或布局文件中。因此，应通过实际切换页面验证效果，而不能根据某个页面看起来正确就判断任务已经完成。

### 2. 设置应用图标和启动画面

此前下载的资源包中已经包含两个文件：

| 文件 | 用途 |
| --- | --- |
| `assets/images/icon.png` | 应用图标 |
| `assets/images/splash-icon.png` | 启动画面中居中显示的图片 |

向 AI Agent 提交以下提示：

```text
Set the app's icon to assets/images/icon.png, and configure the splash screen using the expo-splash-screen config plugin so it shows assets/images/splash-icon.png centered on a #25292e background on Android, iOS, and web.
```

该提示要求 Agent 完成以下配置：

- 将应用图标设置为 `assets/images/icon.png`。
- 使用 `expo-splash-screen` 的 Config Plugin。
- 在启动画面中央显示 `assets/images/splash-icon.png`。
- 将启动画面背景色设置为 `#25292e`。
- 让配置覆盖 Android、iOS 和 Web。

原文没有给出最终配置文件名称、具体字段或生成代码，因此不能仅根据本章判断 Agent 应如何实现。应检查 Agent 的实际修改，并以运行结果为准。

### 3. 重启开发服务器以应用配置

图标和启动画面属于应用配置。修改完成后，需要重启开发服务器：

1. 在终端按 `Ctrl + C`，停止当前开发服务器。
2. 重新运行：

```bash
npx expo start
```

3. 从 Expo Go 再次打开项目。

重新加载时，应该能短暂看到配置后的启动画面。

#### 命令说明

`npx expo start` 用于启动 Expo 开发服务器，以便通过 Expo Go 或其他目标运行和预览项目。

这里不能只依赖 React 的热更新。原文明确信息是：这些设置位于应用配置中，需要重启开发服务器才能应用。

### 4. 正确认识 Expo Go 中的图标限制

配置图标后，设备主屏幕上的图标不会立即变成 `assets/images/icon.png`。

原因是当前运行的是 Expo Go：

- Expo Go 是一个独立应用。
- 它有自己的主屏幕图标。
- 你的项目只是运行在 Expo Go 内部。
- 项目图标会在创建独立构建后接管应用图标。

因此，在 Expo Go 中“主屏幕图标没有变化”不是配置失败。

原文建议在准备进入下一阶段时了解 development builds，但当前文档没有说明如何创建开发构建或独立构建。

## AI 辅助开发的核心循环

本章不仅是在处理视觉细节，也在总结整个教程使用的开发方式：

```text
提示 → 构建 → 验证 → 重新提示
```

具体含义是：

1. **提示**：向 Agent 描述目标、平台范围和期望效果。
2. **构建**：由 Agent 修改代码或配置。
3. **验证**：在实际应用中检查结果。
4. **重新提示**：如果结果不符合预期，描述你实际看到的现象，让 Agent继续修正。

当结果异常时，不应只说“没有成功”。应告诉 Agent：

- 哪个页面或平台出现问题；
- 实际显示了什么；
- 与预期相比哪里不同。

这是原文明确推荐的问题处理方式。

## 教程完成后的扩展方向

完成本章后，StickerSmash 已具备导航、照片选择、手势驱动的贴纸、保存，以及状态栏、启动画面和应用图标等内容，并可面向 Android、iOS 和 Web。

原文给出了三个可以继续交给 Agent 的需求：

### 支持多个贴纸

```text
Let me place more than one sticker on the photo.
```

### 添加系统分享功能

```text
Add a share button that opens the system share sheet so I can send my creation to friends.
```

这里的“系统分享面板”是移动操作系统提供的分享界面，可以让用户选择消息、邮件或其他已安装应用。它不同于 Web 中简单复制链接或调用浏览器分享能力的固定实现。

### 完善 About 页面

```text
Fill in the About screen: explain what the app does and credit me as the builder.
```

这些提示展示了如何从完整产品需求出发继续迭代，而不是要求开发者先确定具体文件和代码实现。

## 注意事项与限制

### 文档明确说明

- 深色背景下应使用浅色状态栏内容。
- 状态栏效果需要覆盖所有页面。
- 应用图标资源是 `assets/images/icon.png`。
- 启动画面资源是 `assets/images/splash-icon.png`。
- 启动画面图片应居中显示。
- 启动画面背景色应为 `#25292e`。
- 启动画面配置应覆盖 Android、iOS 和 Web。
- 配置完成后必须重启 Expo 开发服务器。
- Expo Go 中的主屏幕图标不会替换成项目图标。
- 项目图标会在创建独立构建后生效。
- 结果不符合预期时，应将实际现象反馈给 Agent，再进行修正。

### 当前文档未涉及

- `expo-status-bar` 的具体 API 和组件代码。
- 状态栏配置应放在哪个文件中。
- `expo-splash-screen` Config Plugin 的具体字段结构。
- 应用主配置文件的名称和完整内容。
- 图片尺寸、格式、分辨率和安全区域要求。
- Android 与 iOS 图标规范的差异。
- 如何创建 development build 或独立构建。
- 如何发布到 App Store 或 Google Play。
- 如何自动隐藏或手动控制启动画面。
- 如何测试不同设备尺寸下的启动画面。
- 各平台系统分享功能的具体实现方式。

这些内容不能仅根据当前文档补全。

## React Web 开发者的实际使用要点

1. 不要把状态栏当成页面内的普通 DOM 元素。它属于移动设备的系统界面，需要使用 Expo 提供的能力控制。
2. 不要把启动画面当成 React 组件中的 Loading 页面。它发生在应用内容准备完成之前，属于应用级配置。
3. 不要认为所有改动都能通过热更新生效。涉及应用配置时，应按照文档要求重启开发服务器。
4. 不要用 Expo Go 的主屏幕图标判断项目图标是否配置成功。Expo Go 是项目的开发容器，不是最终独立应用。
5. AI Agent 完成修改后仍然需要人工验证，尤其要检查多个页面和 Android、iOS、Web 的目标范围。

## 实际开发建议

> **基于文档内容推导：** 验收状态栏修改时，应至少打开不同页面进行检查，因为原文要求它在每个页面上保持浅色。

> **基于文档内容推导：** 验收启动画面时，应重点检查图片是否居中、背景是否为 `#25292e`，而不是只确认“出现过一个加载画面”。

> **基于经验建议：** 在让 Agent 修改前，可以先确认两个图片文件确实存在于指定路径，避免将资源缺失误判为 Expo 配置问题。

> **基于经验建议：** Agent 修改完成后，应查看它改动了哪些配置和依赖。即使当前目标已达到，也需要理解应用配置与运行时代码分别承担什么职责。

## 后续学习方向

原文提供了以下后续入口：

- **Expo Skills**：查看 Agent 可以使用的技能及对应提示示例。
- **Expo MCP Server**：了解 Agent 如何使用 Expo 工具触发构建、读取崩溃报告等。
- **Expo Community Discord**：寻求帮助或分享项目。
- **Expo Tutorial**：学习同一个应用的具体代码实现，理解 Agent 实际编写了什么。

## 总结

本章完成的是应用的视觉收尾：

- 使用 `expo-status-bar` 提升深色背景下状态栏的可读性；
- 使用指定图片和背景色配置跨平台启动画面；
- 配置项目自己的应用图标；
- 理解应用配置需要重启开发服务器；
- 理解 Expo Go 图标与独立应用图标的区别。

更重要的是，本章明确了 AI 辅助开发的持续工作方式：提出需求、让 Agent 修改、运行验证，再根据实际现象继续修正。