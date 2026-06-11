# 用 Expo Modules API 包装第三方原生库

> 对应文档：`https://docs.expo.dev/modules/third-party-library.md`（页面修改日期：2026-05-23）

## 教程目标

本文分别封装 Android 的 MPAndroidChart 与 iOS 的 Charts/DGCharts，向 React Native 暴露统一的径向饼图组件。两套原生库 API 相似，因此适合作为跨平台适配示例。

核心思路不是让一套原生库跨平台运行，而是在两端选择对应库，并用相同的 TypeScript props 屏蔽实现差异。

## 创建并运行本地模块

教程假设模块位于 Expo 项目中。现有项目可执行：

```sh
npx create-expo-module --local expo-radial-chart
```

模块位于 `modules/expo-radial-chart`。先运行宿主应用验证初始脚手架：

```sh
npx expo run:android
npx expo run:ios
```

## 添加原生依赖

- Android 依赖配置位于 `android/build.gradle`。
- iOS 依赖配置位于 `ios/ExpoRadialChart.podspec`。

文档还讨论二进制依赖：

- Android `.aar` 放入 `android/libs`，再通过 Gradle/autolinking 加入依赖。
- iOS `.xcframework` 或 `.framework` 可由 podspec 的 `vendored_frameworks` 声明。
- framework 路径相对 podspec，且不能用 `..` 穿越父目录，因此必须放在 `ios/` 或其子目录。
- `source_files` 不应匹配 framework 内部文件；文档建议把 Swift 源码移到 `ios/src/`，并把匹配范围限制到该目录。

当前页面正文未给出这些二进制依赖配置的完整代码片段。

## 设计统一 TypeScript API

组件接收 `data: Series[]`，每项包含：

```ts
type Series = {
  color: string;
  percentage: number;
};
```

另有可选 `style?: ViewStyle`。示例未实现 Web，`ExpoRadialChartView.web.tsx` 只返回 `Not implemented`。

## Android 实现

`Series` 实现 Expo Modules 的 `Record`，字段用 `@Field` 声明，使 JS 对象能转换成 Kotlin 对象：

- `color` 默认 `#ff0000`。
- `percentage` 默认 `0.0f`。

`ExpoRadialChartView`：

1. 创建 `PieChart`，用 `MATCH_PARENT` 匹配父视图。
2. `addView` 加入原生视图树。
3. `setChartData(ArrayList<Series>)` 把每项转换为 `PieEntry` 和 Android color。
4. 创建 `PieDataSet`、`PieData`，设置给 chart 并调用 `invalidate()` 刷新。

Module 用 `Prop("data")` 在 React prop 变化时调用 `setChartData`。

## iOS 实现

Swift 的 `Series: Record` 用 `@Field` 声明 `UIColor` 和 `Double`。`ExpoRadialChartView`：

1. 创建 `PieChartView` 并 `addSubview`。
2. 设置 `clipsToBounds = true`。
3. 在 `layoutSubviews` 中令 chart frame 等于父视图 bounds。
4. `setChartData` 把 series 转成 `PieChartDataEntry`、颜色和 `PieChartDataSet`，再赋给 chart。

Module 同样以 `Prop("data")` 连接 JS props 与原生 setter。

## 应用侧使用

React Native 只需渲染统一组件并传三组颜色和比例：

```tsx
<ExpoRadialChartView
  style={{ flex: 1 }}
  data={[
    { color: '#ff0000', percentage: 0.5 },
    { color: '#00ff00', percentage: 0.2 },
    { color: '#0000ff', percentage: 0.3 },
  ]}
/>
```

本地模块从项目 alias 导入；独立模块应从 `expo-radial-chart` 包名导入。最后重新构建两端应用。

## 限制与坑点

- 两端第三方库虽相似，但类型、命名与刷新方式不同，适配层必须分别维护。
- 二进制 framework 的目录和 podspec glob 配置错误会导致链接或编译问题。
- `Record` 字段类型必须是 Expo Modules API 能转换的类型；颜色在 Android 从字符串解析，在 iOS 直接转换为 `UIColor`。
- Web 明确未实现，当前 fallback 只是提示文字。
- 教程未验证 percentage 总和、负数、非法颜色或大数据量。

## React Web 开发者易误解点

- 这不是 npm 包的简单 wrapper；Gradle、CocoaPods/podspec 决定原生库是否进入应用二进制。
- React prop 到原生对象之间需要 `Record` 和 `Prop` 做运行时转换。
- `invalidate()` 是 Android 原生视图重绘请求，不等于 React state 更新。

## 文档边界

**文档明确说明**：本地模块创建、原生依赖位置、二进制依赖约束、统一 props、两端视图实现和 example 用法。

**基于文档内容推导**：包装第三方库时应先设计最小公共 TypeScript 契约，再分别实现平台适配，避免把某个平台专有 API 直接泄露给业务代码。

**当前文档未涉及**：完整依赖版本代码、事件交互、错误处理、无障碍、Web 图表实现、许可证评估和自动测试。

<!-- NAVIGATION START -->
---
[← 上一页：在项目中使用独立 Expo Module](./103_use-standalone-expo-module-in-your-project.md) | [下一页：在现有 React Native 库中集成 Expo Modules API →](./105_existing-library.md)
<!-- NAVIGATION END -->
