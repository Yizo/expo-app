# Expo UI Jetpack Compose `Switch` 学习指南

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目的 Android 界面中，使用 `@expo/ui` 提供的 Jetpack Compose `Switch` 组件实现布尔状态切换控件，包括：

- 安装 `@expo/ui`
- 创建受控开关
- 自定义开关颜色
- 自定义滑块内部内容
- 使用 `enabled`、`modifiers` 等 API

典型场景包括设置项开关、功能启停、通知权限偏好等只有“开启 / 关闭”两种状态的交互。

> **版本提醒：**原文是下一版本 Expo SDK 的未发布文档，修改日期为 2026 年 5 月 19 日。文档明确指出，当前最新稳定版本是 SDK 56。实际项目应优先核对所用 SDK 对应的文档。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 官方的声明式 UI 工具包。对 React Web 开发者来说，可以将它理解为 Android 原生平台上的声明式组件系统：

- React 使用 JSX 描述 Web UI。
- Jetpack Compose 使用 Kotlin 描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 在 React Native 中封装这些原生 Compose 组件，使其能够通过 React JSX 使用。

本文的 `Switch` 与 Android 官方 Jetpack Compose `Switch` API 对齐，最终渲染的是 Android 原生界面，而不是 HTML `<input type="checkbox">`。

### `Switch` 的界面结构

一个开关主要由以下部分组成：

- **Track**：开关背后的轨道。
- **Thumb**：沿轨道移动的圆形滑块。
- **Border**：轨道边框。
- **Icon**：显示在滑块内部的图标或内容。

组件需要处理以下状态组合：

- 已选中：`checked`
- 未选中：`unchecked`
- 已禁用且选中：`disabledChecked`
- 已禁用且未选中：`disabledUnchecked`

这些状态对应不同的颜色配置。

## 平台与使用范围

原文明确说明：

- 仅支持 Android。
- 包含在 Expo Go 中。
- 组件来自 `@expo/ui`。
- 具体导入路径是 `@expo/ui/jetpack-compose`。
- 该组件匹配 Android 官方 Jetpack Compose `Switch` API。

如果需要跨平台组件，应使用通用版本：

```tsx
import { Switch } from '@expo/ui';
```

具体导入方式应以通用 `Switch` 文档为准。通用组件会根据平台渲染对应的原生实现。

> **容易误解：**安装包名是 `@expo/ui`，但本文 Android 专用组件的导入路径是 `@expo/ui/jetpack-compose`。包名和模块导入路径不是同一个概念。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

`expo install` 与普通 `npm install` 的主要区别是：它会按照当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的纯 React Native 工程中使用，还必须先安装并配置 `expo`，使该工程能够加载 Expo Modules。原文没有展开具体原生工程配置步骤，需要参考“在现有 React Native 项目中安装 Expo Modules”的独立文档。

当前文档未涉及：

- iOS 原生依赖配置
- Android Gradle 配置
- Expo 项目初始化命令
- EAS Build 配置
- 原生工程目录结构

## 基本用法：受控开关

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui/jetpack-compose';

export default function ToggleSwitchExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Switch value={checked} onCheckedChange={setChecked} />
    </Host>
  );
}
```

### 状态变化流程

1. `useState(false)` 创建布尔状态，初始为关闭。
2. `value={checked}` 将当前状态传给原生开关。
3. 用户点击开关后，组件调用 `onCheckedChange`。
4. `setChecked` 接收新的布尔值并更新 React 状态。
5. React 重新渲染，将新值传回 `Switch`。

这与 React Web 中的受控表单组件很接近：

```tsx
<input
  type="checkbox"
  checked={checked}
  onChange={event => setChecked(event.target.checked)}
/>
```

区别在于 React Native 没有 DOM 事件，也没有 `event.target.checked`。`onCheckedChange` 会直接提供新的 `boolean` 值：

```tsx
onCheckedChange={(value: boolean) => {
  setChecked(value);
}}
```

### `Host` 的作用

示例将 `Switch` 放在 `Host` 中，并启用了 `matchContents`。

原文没有单独定义 `Host` 的完整 API。**基于文档内容推导：**它负责承载 Jetpack Compose 原生组件，使 Compose 内容能够嵌入 React Native 组件树；`matchContents` 表示宿主尺寸匹配内部内容。

由于当前文档没有说明 `Host` 的嵌套规则、布局行为及生命周期限制，不应仅凭本页推断其全部用法。

## 自定义颜色

```tsx
<Switch
  value={checked}
  onCheckedChange={setChecked}
  colors={{
    checkedThumbColor: '#6200EE',
    checkedTrackColor: '#EDE9FE',
    uncheckedThumbColor: '#9CA3AF',
    uncheckedTrackColor: '#F3F4F6',
    uncheckedBorderColor: '#D1D5DB',
  }}
/>
```

`colors` 接收 `SwitchColors` 对象。所有颜色字段均为可选项，未设置的字段由组件默认样式处理。

颜色值类型是 React Native 的 `ColorValue`，示例使用十六进制颜色字符串。当前文档未列举 `ColorValue` 支持的全部格式。

### `SwitchColors` 配置表

| 交互状态 | 部位 | 配置项 |
| --- | --- | --- |
| 已选中 | 边框 | `checkedBorderColor` |
| 已选中 | 滑块内部图标 | `checkedIconColor` |
| 已选中 | 滑块 | `checkedThumbColor` |
| 已选中 | 轨道 | `checkedTrackColor` |
| 未选中 | 边框 | `uncheckedBorderColor` |
| 未选中 | 滑块内部图标 | `uncheckedIconColor` |
| 未选中 | 滑块 | `uncheckedThumbColor` |
| 未选中 | 轨道 | `uncheckedTrackColor` |
| 禁用且已选中 | 边框 | `disabledCheckedBorderColor` |
| 禁用且已选中 | 滑块内部图标 | `disabledCheckedIconColor` |
| 禁用且已选中 | 滑块 | `disabledCheckedThumbColor` |
| 禁用且已选中 | 轨道 | `disabledCheckedTrackColor` |
| 禁用且未选中 | 边框 | `disabledUncheckedBorderColor` |
| 禁用且未选中 | 滑块内部图标 | `disabledUncheckedIconColor` |
| 禁用且未选中 | 滑块 | `disabledUncheckedThumbColor` |
| 禁用且未选中 | 轨道 | `disabledUncheckedTrackColor` |

原文没有为这些属性提供单独描述，也没有说明默认色值。

## 自定义滑块内容

`Switch.ThumbContent` 用于在 Thumb 内部渲染自定义元素：

```tsx
import { useState } from 'react';
import { Host, Switch, Box } from '@expo/ui/jetpack-compose';
import {
  size,
  clip,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

export default function ThumbContentExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Switch
        value={checked}
        onCheckedChange={setChecked}
        colors={{
          checkedThumbColor: '#7C3AED',
          checkedTrackColor: '#EDE9FE',
          checkedIconColor: '#7C3AED',
          uncheckedThumbColor: '#9CA3AF',
          uncheckedTrackColor: '#F3F4F6',
          uncheckedBorderColor: '#D1D5DB',
          uncheckedIconColor: '#9CA3AF',
        }}
      >
        <Switch.ThumbContent>
          <Box
            modifiers={[
              size(Switch.DefaultIconSize, Switch.DefaultIconSize),
              clip(Shapes.Circle),
              background(checked ? '#FFFFFF' : '#E5E7EB'),
            ]}
          />
        </Switch.ThumbContent>
      </Switch>
    </Host>
  );
}
```

### 代码含义

- `Switch.ThumbContent` 声明 Thumb 内容插槽。
- `Box` 是作为滑块内部内容的 Compose 布局元素。
- `Switch.DefaultIconSize` 是 Material 3 默认图标尺寸，可让自定义内容适配 Thumb。
- `size(...)` 设置内容宽高。
- `clip(Shapes.Circle)` 将内容裁剪成圆形。
- `background(...)` 根据 `checked` 状态切换背景色。
- `modifiers` 是依次作用于原生 Compose 组件的修饰器数组。

React Web 开发者可以将 `modifiers` 粗略类比为一组具有执行顺序的布局和样式操作，但它不是 CSS，也不是 React Native 的普通 `style` 对象。

> **基于文档内容推导：**由于自定义内容读取了外层的 `checked` 状态，它会随开关状态重新渲染。若只处理 `onCheckedChange` 而不更新 `checked`，开关及自定义内容都不会正确反映新状态。

## API 参考

### `Switch`

```tsx
import { Switch } from '@expo/ui/jetpack-compose';
```

仅支持 Android。

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `value` | `boolean` | 是 | 无 | 表示开关是否已选中 |
| `onCheckedChange` | `(value: boolean) => void` | 否 | 未说明 | 选中状态变化时调用 |
| `enabled` | `boolean` | 否 | `true` | 控制开关能否交互 |
| `colors` | `SwitchColors` | 否 | 未说明 | 配置各状态下的组件颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 未说明 | 为组件应用 Compose 修饰器 |
| `children` | `React.ReactNode` | 否 | 未说明 | 容纳 `ThumbContent` 插槽 |

### `value` 与 `onCheckedChange`

`value` 是必填属性，但 `onCheckedChange` 是可选属性。

这意味着可以渲染一个显示当前状态但不自行更新的开关：

```tsx
<Switch value={checked} />
```

不过，原文没有说明省略回调后组件是否仍会产生可见的短暂交互效果。若开关应当只读，使用明确的禁用状态更容易表达意图：

```tsx
<Switch value={checked} enabled={false} />
```

后一项属于**基于经验建议**，不是原文明确规定。

### `enabled`

```tsx
<Switch
  value={checked}
  enabled={canChangeSetting}
  onCheckedChange={setChecked}
/>
```

`enabled` 默认为 `true`。设为 `false` 后，开关进入禁用状态，相关颜色可通过 `disabledChecked*` 或 `disabledUnchecked*` 配置。

### `SwitchThumbContent`

API 列表还声明了 Android 专用的 `SwitchThumbContent` 组件类型，用于显示 Thumb 内部的自定义内容。使用示例采用的公开写法是：

```tsx
<Switch.ThumbContent>
  {/* 自定义内容 */}
</Switch.ThumbContent>
```

当前文档没有展示直接导入 `SwitchThumbContent` 的方式，因此应遵循示例使用 `Switch.ThumbContent`。

## 注意事项与限制

### 仅支持 Android

本文组件属于 Jetpack Compose 实现，API 明确标记为 Android-only。不能假设它在 iOS 或 Web 上可以运行。

跨平台项目有两种选择：

- 使用通用 `Switch`，让 Expo 按平台选择原生实现。
- 在平台分支或 Android 专用文件中使用 Jetpack Compose 版本。

第二种方式属于**基于经验建议**；当前文档没有介绍平台文件命名或条件渲染方式。

### 当前页面不是稳定版文档

该页面位于 `unversioned` 路径，描述下一 SDK 版本。项目使用 SDK 56 时，应查看 SDK 56 对应页面，而不是直接假设未发布 API 已经可用。

### 组件由外部状态控制

`Switch` 不会替应用保存业务状态。`value` 决定实际显示结果，`onCheckedChange` 只是通知状态变化。

异步保存设置时，还需要自行处理：

- 保存失败后的状态恢复
- 请求进行中是否禁用开关
- 本地状态与服务端状态同步

这些业务流程属于**基于经验建议**，当前文档未涉及。

### 颜色配置应覆盖实际状态

只设置普通状态颜色时，禁用状态会继续使用默认值。若设计系统要求所有状态完全统一，需要同时检查已选中、未选中及各禁用状态的颜色。

当前文档没有说明颜色对比度、暗色模式或无障碍标准。不能根据本页确认自定义颜色是否会自动适配主题。

### Thumb 内容尺寸需要受控

文档专门提供 `Switch.DefaultIconSize`，说明自定义 Thumb 内容需要适配组件预期尺寸。尺寸过大的内容可能不符合 Material 3 的默认布局。

关于内容溢出、裁剪和点击区域的具体行为，当前文档未作说明。

## React Web 开发者最容易误解的地方

1. **这不是 DOM 组件。**没有 HTML 属性、CSS 选择器或浏览器事件对象。
2. **`onCheckedChange` 直接返回布尔值。**不需要读取 `event.target.checked`。
3. **`modifiers` 不是 CSS。**它是 Jetpack Compose 的组件修饰机制，并通过数组表达操作。
4. **安装包与导入路径不同。**安装 `@expo/ui`，Android Compose 组件从 `@expo/ui/jetpack-compose` 导入。
5. **Android 专用不等于 React Native 通用。**React 组件的写法相似，不代表实现天然跨平台。
6. **Expo Go 支持不代表所有构建环境自动兼容。**原文明示组件包含在 Expo Go 中，但对现有 React Native 工程，仍要求先安装 Expo Modules。
7. **`value` 不会自动更新。**必须在回调中更新外部状态，才能形成完整的受控交互。

## 实际开发建议

以下内容均为**基于经验建议**：

- 简单跨平台设置页优先考虑通用 `Switch`。
- 只有确实需要 Android Jetpack Compose 特性时，再使用本文的专用实现。
- 使用 `enabled={false}` 阻止重复提交，而不是只在回调中忽略点击。
- 自定义颜色时同时检查普通、禁用、亮色和暗色场景。
- 自定义 Thumb 内容时优先使用 `Switch.DefaultIconSize`，避免写死一个与 Material 3 不匹配的尺寸。
- 将业务状态保存在上层组件或状态管理层中，不要把服务端保存逻辑与视觉组件过度耦合。
- 项目使用稳定版 Expo SDK 时，按照实际 SDK 版本核对 `@expo/ui` API。

## 文档明确内容与推导内容

### 原文明确说明

- 组件用于实现 Jetpack Compose 开关。
- 仅支持 Android，并包含在 Expo Go 中。
- 组件 API 与官方 Jetpack Compose `Switch` 匹配。
- 跨平台使用应参考通用 `Switch`。
- `@expo/ui` 可通过 `expo install` 安装。
- 现有 React Native 项目需要先安装 `expo`。
- `Switch.ThumbContent` 可自定义 Thumb 内容。
- `Switch.DefaultIconSize` 是 Material 3 默认图标尺寸。
- `value` 必填，其他列出的属性均可选。
- `enabled` 默认值为 `true`。
- `SwitchColors` 提供普通及禁用状态下各部位的颜色字段。

### 基于文档内容推导

- `Switch` 是受控组件，状态更新需要形成“回调更新状态，再由 `value` 回传”的闭环。
- `Host` 是 Jetpack Compose 内容与 React Native 组件树之间的宿主。
- Thumb 自定义内容会随着其读取的 React 状态重新渲染。
- 需要完整视觉控制时，应关注所有普通和禁用状态的颜色。

这些推导用于帮助理解示例，但原文没有提供对应机制的完整技术说明。

## 总结

`@expo/ui/jetpack-compose` 的 `Switch` 允许 React Native 代码直接使用 Android Jetpack Compose 风格的原生开关。最基本的实现模式与 React Web 受控组件相似：通过 `value` 输入当前状态，通过 `onCheckedChange` 接收新布尔值。

开发时最关键的边界是：该组件仅支持 Android，当前页面属于下一 SDK 版本文档。跨平台项目应优先评估通用 `Switch`；需要 Android 专属能力时，才使用 Jetpack Compose 版本，并根据项目实际 Expo SDK 验证 API 可用性。

---

## 文档导航

- **上一页**：[surface](./66__surface.md)
- **下一页**：[text](./68__text.md)
