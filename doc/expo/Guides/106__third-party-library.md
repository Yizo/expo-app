# 封装第三方原生库

> 原始文档地址：https://docs.expo.dev/modules/third-party-library/

本文档详细介绍如何通过 Expo 的模块系统（Module System）将外部平台特定的原生包集成到 React Native 应用中。教程将演示如何通过封装两个功能对等的第三方图表库来实现径向图表（Radial Chart）组件：

- **Android 端**：[MPAndroidChart](https://github.com/PhilJay/MPAndroidChart)（作者 PhilJay）
- **iOS 端**：[Charts](https://github.com/danielgindi/Charts)（作者 Daniel Cohen Gindi）

由于 iOS 端的库是 Android 端库的镜像实现，两者具有相似的接口，非常适合用于本教程的演示。

> **基于经验建议**：如果你更喜欢视频学习，Expo 官方提供了配套视频教程 [How to wrap native libraries](https://www.youtube.com/watch?v=M8eNfH1o0eE)，可以结合本文档一起学习。

---

## 关键术语说明

在开始之前，先了解本文涉及的关键概念：

| 术语 | 说明 |
|------|------|
| **Expo Module（Expo 模块）** | Expo 提供的一套标准化机制，用于在 React Native 中创建和使用原生功能。它定义了 JavaScript/TypeScript 与原生代码（Kotlin/Swift）之间的通信桥梁。 |
| **Third-party native library（第三方原生库）** | 指非 React Native 生态的、直接面向 Android 或 iOS 平台开发的原生代码库（如 Java/Kotlin 或 Swift/ObjC 编写的库）。 |
| **Wrap（封装）** | 将原生库的功能通过 Expo Module API 暴露给 JavaScript 层调用的过程，使 React Native 组件能够使用原生 UI 或逻辑。 |
| **Podspec** | iOS 端 CocoaPods 包管理工具的配置文件（`.podspec`），用于声明 iOS 原生依赖。 |
| **build.gradle** | Android 端 Gradle 构建系统的配置文件，用于声明 Android 原生依赖。 |
| **Record** | Expo Modules API 中用于定义可从 JavaScript 传递到原生层的数据结构（类似于数据类/DTO）。 |
| **Prop** | Expo Module 中用于将 JavaScript 属性绑定到原生视图的机制，当 JS 端属性变化时会自动触发原生端的更新回调。 |
| **autolinking（自动链接）** | Expo/React Native 的自动依赖发现和注册机制，无需手动配置即可将原生模块链接到项目中。 |

---

## 创建新模块

你可以选择在现有项目中创建本地模块，也可以创建一个独立的包。

### 在现有 Expo 项目中创建

在当前项目目录下执行以下命令来生成本地模块：

```sh
# npm
npx create-expo-module --local expo-radial-chart

# yarn
yarn create expo-module --local expo-radial-chart

# pnpm
pnpm create expo-module --local expo-radial-chart

# bun
bun create expo-module --local expo-radial-chart
```

执行完毕后，进入新生成的 `modules/expo-radial-chart` 文件夹即可修改平台特定的代码。

> **基于经验建议**：使用 `--local` 参数会在当前项目的 `modules/` 目录下创建模块，该模块仅在当前项目中可用，不会被发布到 npm。适合项目内部使用的封装场景。

### 创建独立模块

如果希望创建一个可以发布到 npm 的独立包，请执行：

```sh
# npm
npx create-expo-module expo-radial-chart

# yarn
yarn create expo-module expo-radial-chart

# pnpm
pnpm create expo-module expo-radial-chart

# bun
bun create expo-module expo-radial-chart
```

> **提示**：如果你不打算发布这个库，在终端提示中直接按回车键接受所有默认值即可。

执行完毕后，进入新生成的 `expo-radial-chart` 文件夹即可修改平台特定的代码。

> **基于文档内容推导**：独立模块与本地模块的主要区别在于：独立模块是一个完整的 npm 包结构，包含 `package.json`、示例应用等，适合开源分享或跨项目复用；本地模块则轻量地嵌入在现有项目中。

---

## 运行示例项目

通过运行示例应用来验证模块的基础设置是否正确。

### 在现有 Expo 项目中

从项目根目录触发构建和启动流程：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios
```

### 在独立模块中

首先启动 TypeScript 编译器以监听文件变更并重新构建 JavaScript：

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

然后在另一个终端窗口中，编译并启动示例应用：

```sh
# npm
cd example-expo-app
npx expo run:android
npx expo run:ios

# yarn
cd example-expo-app
yarn expo run:android
yarn expo run:ios

# pnpm
cd example-expo-app
pnpm expo run:android
pnpm expo run:ios

# bun
cd example-expo-app
bun expo run:android
bun expo run:ios
```

> **基于经验建议**：独立模块开发时需要同时运行两个终端进程：一个用于 TypeScript 编译监听（`build --watch`），另一个用于运行示例应用。确保 TypeScript 编译进程持续运行，否则原生端无法获取最新的 JS 代码。

---

## 添加原生依赖

这是封装第三方库的核心步骤——你需要修改模块的 **android/build.gradle** 和 **ios/ExpoRadialChart.podspec** 配置文件，将外部原生包引入项目。

本教程中需要添加的依赖为：
- **Android**：`com.github.PhilJay:MPAndroidChart`（Gradle 依赖）
- **iOS**：`DGCharts`（CocoaPods 依赖）

### 使用 .aar 依赖文件

`.aar`（Android Archive）是 Android 的二进制库打包格式。如果你需要引入的第三方库以 `.aar` 文件形式提供，请根据你的 Expo SDK 版本选择对应方式：

#### SDK 52 及更高版本

1. 将 `.aar` 文件放入模块的 **android/libs** 目录下
2. 通过 autolinking（自动链接）将其注册为 Gradle 项目
3. 在 `dependencies` 代码块中使用 `${project.name}` 前缀添加依赖

#### SDK 51 及更早版本

1. 将 `.aar` 文件放入模块的 **android/libs** 目录下
2. 将 `libs` 文件夹注册为 Gradle 仓库（repository）
3. 在 `dependencies` 代码块中使用包路径并以 `@aar` 后缀添加依赖

> **基于经验建议**：`.aar` 依赖适用于没有 Maven 仓库发布、仅提供二进制文件的第三方库。如果你的目标库有 Gradle/Maven 仓库发布，优先使用仓库依赖方式，这样可以自动处理传递依赖（transitive dependencies）。

### 使用 .xcframework 或 .framework 依赖

对于 iOS 端，如果第三方库以 `.xcframework` 或 `.framework` 形式提供，请使用 podspec 中的 `vendored_frameworks` 配置项来引入。

> **注意**：用于指定框架路径的文件模式是相对于 podspec 文件位置的，**不支持**使用父目录遍历（`..`），这意味着你必须将框架文件放在 **ios** 目录（或其子目录）内部。

确保 `source_files` 的通配模式不会意外匹配到框架内部的文件。你可以通过将 Swift 源文件（如 `ExpoRadialChartView.swift`）移到一个独立的 **src** 文件夹中，并相应地更新文件匹配模式来解决此问题。最终的目录结构应如下所示：

```text
ios/
  Frameworks/
    MyFramework.framework
  src/
    ExpoRadialChartView.swift
    ExpoRadialChartModule.swift
  ExpoRadialChart.podspec
```

> **基于经验建议**：iOS 的 `.framework` 和 `.xcframework` 是预编译的二进制分发格式。`.xcframework` 是更现代的格式，支持多架构（包括 Apple Silicon 模拟器），推荐优先使用。如果同时需要支持真机和模拟器，`.xcframework` 能避免很多架构兼容性问题。

---

## 定义 API

在编写原生代码之前，先建立 TypeScript 类型定义来描述组件的属性接口。本例中，组件接收一个 `data` 属性，它是一个 `Series` 对象数组，每个对象包含 `color`（颜色）和 `percentage`（百分比）两个字段。

```ts
import { ViewStyle } from 'react-native/types';

export type ChangeEventPayload = {
  value: string;
};

type Series = {
  color: string;
  percentage: number;
};

export type ExpoRadialChartViewProps = {
  style?: ViewStyle;
  data: Series[];
};
```

**关键术语解释**：
- `ViewStyle`：React Native 中视图组件的样式类型定义，包含 `width`、`height`、`flex` 等布局属性。
- `Series`：自定义的数据类型，表示图表中的一个数据系列。
- `ChangeEventPayload`：事件回调的载荷类型，用于定义从原生层传回 JavaScript 层的事件数据结构。

由于本教程不涵盖 Web 端实现，需要将 **src/ExpoRadialChartView.web.tsx** 替换为一个占位组件：

```tsx
import * as React from 'react';

export default function ExpoRadialChartView() {
  return <div>Not implemented</div>;
}
```

> **基于经验建议**：即使你的模块不支持 Web 端，也建议提供一个占位组件而非直接抛出错误，这样在开发阶段可以避免因 Web 端预览（如 Storybook）而导致的崩溃。

---

## Android 端实现

### 原生视图类

使用 Kotlin 构建原生视图和模块逻辑。创建 `PieChart` 实例，配置布局参数，并将其添加到视图层级中。同时创建 `setChartData` 函数来处理从 JavaScript 传入的 `Series` 数组，将其转换为 `PieEntry` 对象并应用颜色。

```kotlin
package expo.modules.radialchart

import android.content.Context
import android.graphics.Color
import androidx.annotation.ColorInt
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ExpoView

class Series : Record {
  @Field
  val color: String = "#ff0000"

  @Field
  val percentage: Float = 0.0f
}

class ExpoRadialChartView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  internal val chartView = PieChart(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    addView(it)
  }

  fun setChartData(data: ArrayList<Series>) {
    val entries: ArrayList<PieEntry> = ArrayList()
    val colors: ArrayList<Int> = ArrayList()
    for (series in data) {
      entries.add(PieEntry(series.percentage))
      colors.add(Color.parseColor(series.color))
    }
    val dataSet = PieDataSet(entries, "DataSet");
    dataSet.colors = colors;
    val pieData = PieData(dataSet);
    chartView.data = pieData;
    chartView.invalidate();

  }
}
```

**代码解析**：

- **`Series : Record`**：实现 Expo 的 `Record` 接口，使得 JavaScript 端的对象可以自动映射为 Kotlin 的数据类。`@Field` 注解标记每个需要从 JS 接收的字段。
- **`ExpoRadialChartView`**：继承自 `ExpoView`（Expo 提供的基础视图类），在其中创建并管理原生 `PieChart` 实例。
- **`setChartData`**：将 JS 传入的 `Series` 数组转换为 MPAndroidChart 所需的 `PieEntry` 列表，设置颜色，并通过 `chartView.invalidate()` 触发重绘。

### 模块定义

使用 `Prop` 函数将 `data` 属性绑定到视图，当 JavaScript 端属性值变化时自动触发原生端的更新方法：

```kotlin
package expo.modules.radialchart

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoRadialChartModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoRadialChart")

    View(ExpoRadialChartView::class) {
      Prop("data") { view: ExpoRadialChartView, prop: ArrayList<Series> ->
        view.setChartData(prop);
      }
    }
  }
}
```

**代码解析**：

- **`Module()`**：所有 Expo 模块的基类，通过 `definition()` 方法声明模块的功能。
- **`Name("ExpoRadialChart")`**：定义模块名称，JavaScript 端通过此名称引用模块。
- **`View(ExpoRadialChartView::class)`**：注册原生视图类，使其可以在 React Native 中作为组件使用。
- **`Prop("data")`**：定义一个名为 `data` 的属性绑定，当 JS 端的 `data` prop 发生变化时，会自动调用回调函数更新视图。

---

## iOS 端实现

### 原生视图类

使用 Swift 构建原生视图和模块逻辑。创建 `PieChartView` 实例，配置裁剪和布局覆盖，并将其添加到视图层级中。创建 `setChartData` 函数来将 `Series` 数组映射为 `PieChartDataSet`。

```swift
import ExpoModulesCore
import DGCharts

struct Series: Record {
  @Field
  var color: UIColor = UIColor.black

  @Field
  var percentage: Double = 0
}

class ExpoRadialChartView: ExpoView {
  let chartView = PieChartView()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    addSubview(chartView)
  }

  override func layoutSubviews() {
    chartView.frame = bounds
  }

  func setChartData(data: [Series]) {
    let set1 = PieChartDataSet(entries: data.map({ (series: Series) -> PieChartDataEntry in
      return PieChartDataEntry(value: series.percentage)
    }))
    set1.colors = data.map({ (series: Series) -> UIColor in
      return series.color
    })
    let chartData: PieChartData = [set1]
    chartView.data = chartData
  }
}
```

**代码解析**：

- **`Series: Record`**：与 Android 端的 `Record` 对应，iOS 端同样使用 `Record` 协议来接收 JS 数据。注意 iOS 端使用 `UIColor` 类型接收颜色，Expo 会自动将 JS 端的颜色字符串（如 `"#ff0000"`）转换为 `UIColor` 对象。
- **`ExpoRadialChartView`**：继承自 `ExpoView`，在其中创建并管理 `PieChartView`（来自 DGCharts 库）。
- **`clipsToBounds = true`**：确保图表内容不会超出视图边界。
- **`layoutSubviews()`**：iOS 的布局回调，在此处更新图表视图的 frame 以匹配父视图大小。
- **`setChartData`**：使用 Swift 的 `map` 高阶函数将 `Series` 数组转换为 `PieChartDataEntry` 数组和颜色数组。

### 模块定义

使用 `Prop` 函数将 `data` 属性绑定到视图，当 JavaScript 端属性值变化时自动触发原生端的更新方法：

```swift
import ExpoModulesCore

public class ExpoRadialChartModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoRadialChart")

    View(ExpoRadialChartView.self) {
      Prop("data") { (view: ExpoRadialChartView, prop: [Series]) in
        view.setChartData(data: prop)
      }
    }
  }
}
```

**代码解析**：

- **`Module`**：所有 Expo iOS 模块的基类。
- **`View(ExpoRadialChartView.self)`**：注册原生视图类。注意 Swift 中使用 `.self` 来传递类型引用。
- **`Prop("data")`**：与 Android 端实现完全对称的属性绑定机制。

> **基于文档内容推导**：对比 Android 和 iOS 的实现，你会发现 Expo Modules API 的设计哲学是让两端代码在结构和概念上保持高度一致——`Module`、`Name`、`View`、`Prop` 等 API 在 Kotlin 和 Swift 中都有对应实现，这大大降低了跨平台封装的心智负担。

---

## 编写示例应用来使用模块

更新应用入口文件，渲染新的图表组件并提供三组示例数据：

```tsx
import { ExpoRadialChartView } from '@/modules/expo-radial-chart';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <ExpoRadialChartView
      style={styles.container}
      data={[
        {
          color: '#ff0000',
          percentage: 0.5,
        },
        {
          color: '#00ff00',
          percentage: 0.2,
        },
        {
          color: '#0000ff',
          percentage: 0.3,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**代码解析**：

- 导入路径 `@/modules/expo-radial-chart` 适用于在现有项目中创建的本地模块（`@/` 通常映射到项目根目录或 `src/` 目录）。
- `data` 数组包含三个数据系列：红色占 50%、绿色占 20%、蓝色占 30%。
- `style={styles.container}` 使用 `flex: 1` 使图表占满整个屏幕。

> **提示**：如果你创建的是独立模块，请确保将导入语句修改为：
> ```tsx
> import { ExpoRadialChartView } from 'expo-radial-chart';
> ```

---

## 重新构建并启动应用

使用前面的构建命令重新编译应用。编译成功后，你将在设备上看到一个渲染好的饼图（Pie Chart），包含红、绿、蓝三个扇区。

```sh
# Android
npx expo run:android

# iOS
npx expo run:ios
```

> **基于经验建议**：如果修改了原生代码（Kotlin/Swift/podspec/build.gradle），必须重新执行 `npx expo run:android/ios` 进行完整编译。仅修改 TypeScript/JavaScript 代码时可以使用 Fast Refresh（快速刷新），但原生层变更需要完整重建。

---

## 完整流程总结

以下是封装第三方原生库的完整工作流程：

```
1. 创建模块 → create-expo-module
2. 添加原生依赖 → 修改 build.gradle / .podspec
3. 定义 TypeScript API → 编写类型定义
4. 实现 Android 端 → Kotlin 视图 + 模块
5. 实现 iOS 端 → Swift 视图 + 模块
6. 编写示例应用 → 在 JS 层使用封装好的组件
7. 构建并验证 → 运行应用查看效果
```

---

## 注意事项与限制

1. **Web 端不支持**：本教程封装的第三方库仅支持 Android 和 iOS 原生平台，Web 端仅提供占位组件。如果需要 Web 支持，需要单独实现基于 Canvas 或 SVG 的 Web 版本。

2. **SDK 版本兼容性**：`.aar` 依赖的引入方式在 SDK 52 前后有所不同，请根据你的 Expo SDK 版本选择正确的方式。

3. **iOS 框架路径限制**：podspec 中的 `vendored_frameworks` 路径不支持父目录遍历（`..`），框架文件必须位于 `ios/` 目录或其子目录内。

4. **`source_files` 冲突**：使用 `vendored_frameworks` 时，务必确保 `source_files` 的通配模式不会匹配到框架内部的源文件，否则会导致编译冲突。

5. **Record 类型的默认值**：在 `Record` 类中定义的默认值（如 `val color: String = "#ff0000"`）会在 JavaScript 端未传递对应字段时使用，这有助于增强组件的健壮性。

---

## 下一步

- [Expo Modules API 参考文档](/modules/module-api.md) — 查阅完整的 API 参考，了解如何在 Kotlin 和 Swift 中构建原生模块。

---

## 文档导航

- **上一页**：[use standalone expo module in your project](./105__use-standalone-expo-module-in-your-project.md)
- **下一页**：[existing library](./107__existing-library.md)
