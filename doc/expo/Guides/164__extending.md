# 通过 Jetpack Compose 扩展功能

> 原文地址：https://docs.expo.dev/guides/expo-ui-jetpack-compose/extending/

本指南详细介绍如何为 Android 平台构建自定义的 Jetpack Compose 元素和修饰符（modifier），并将它们与 Expo UI 无缝集成。

---

## 前置要求

在开始之前，请确保满足以下条件：

- **UI 包已安装**：项目中已添加 `@expo/ui` 库。
  ```sh
  npx expo install @expo/ui
  ```
- **自定义构建**：标准托管客户端不包含 UI 支持，因此需要生成自定义开发构建（development build）。
- **知识储备**：你需要了解 Expo Modules API 和 Jetpack Compose 的基础知识。

---

## 构建自定义元素

### 初始配置

首先，在项目目录中生成一个本地模块：

```sh
npx create-expo-module@latest --local my-ui
```

> **说明**：`--local` 参数会在当前项目中创建一个本地模块（而非发布到 npm），方便你进行原生代码开发。

接下来，修改 Android 的 Gradle 构建文件以启用 Compose 并链接所需的 UI 依赖。需要完成以下几步：

1. 将 Kotlin Compose 编译器插件添加到 buildscript 的 classpath 中
2. 应用该插件
3. 在 buildFeatures 中启用 Compose
4. 添加 foundation、ui、material 以及 Expo UI 包的依赖

```groovy
// 引入 Kotlin Compose 编译器插件的 classpath。
buildscript {
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath("org.jetbrains.kotlin.plugin.compose:org.jetbrains.kotlin.plugin.compose.gradle.plugin:${kotlinVersion}")
  }
}

apply plugin: 'com.android.library'
apply plugin: 'expo-module-gradle-plugin'
apply plugin: 'org.jetbrains.kotlin.plugin.compose' // 应用 Compose 编译器插件。

// ... group / version

android {
  // ... namespace, defaultConfig

  // 为该模块启用 Jetpack Compose。
  buildFeatures {
    compose true
  }
}

// 依赖 `expo-ui` 以及你使用的 Compose 库。
dependencies {
  if (findProject(':expo-ui') != null) {
    implementation project(':expo-ui')
  } else {
    implementation 'expo.modules.ui:expo.modules.ui:+'
  }
  implementation 'androidx.compose.foundation:foundation-android:1.10.6'
  implementation 'androidx.compose.ui:ui-android:1.10.6'
  implementation 'androidx.compose.material3:material3:1.5.0-alpha17'
}
```

> **配置说明**：
> - `buildscript` 块中引入 Compose 编译器插件，这是 Kotlin 编译时处理 Compose 注解所必需的。
> - `buildFeatures { compose true }` 告诉 Android Gradle 插件此模块使用 Jetpack Compose。
> - 依赖项中 `findProject(':expo-ui')` 的条件判断确保了无论模块是以本地项目还是远程包的形式存在，都能正确引用。
> - 三个 Compose 依赖分别提供：`foundation`（基础布局和交互）、`ui`（UI 框架核心）、`material3`（Material Design 3 组件）。

---

### 构建视图

你的视图需要两个核心部分：

1. **属性类（Properties Class）**：必须实现 Compose 属性接口，使用优化注解，并包含一个修饰符列表字段。
2. **内容函数（Content Function）**：这是一个可组合的扩展函数，运行在功能作用域上，可以应用已注册的修饰符并渲染嵌套的 React 元素。

```kotlin
package expo.modules.myui

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.UIComposableScope

@OptimizedComposeProps
data class MyCustomViewProps(
  val title: String = "",
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@Composable
fun FunctionalComposableScope.MyCustomViewContent(props: MyCustomViewProps) {
  Column(
    modifier = ModifierRegistry.applyModifiers(
      props.modifiers,
      appContext,
      composableScope,
      globalEventDispatcher
    )
  ) {
    Text(text = props.title, style = MaterialTheme.typography.titleMedium)
    Children(UIComposableScope()) // 渲染 React 子元素
  }
}
```

> **代码解析**：
> - `@OptimizedComposeProps`：优化注解，提升属性更新的性能。
> - `ComposeProps` 接口：让属性类能被 Expo UI 系统识别。
> - `modifiers: ModifierList`：接收来自 JavaScript 端的修饰符列表。
> - `ModifierRegistry.applyModifiers(...)`：将修饰符应用到 Compose 的 `Column` 组件上，使 JavaScript 端传入的样式、布局、事件等修饰符生效。
> - `Children(UIComposableScope())`：渲染从 React 传入的子元素，这是实现嵌套组件的关键。

---

### 注册元素

在模块定义中使用 Expo UI 视图包装器来注册此元素。这会将你的可组合逻辑连接到原生视图架构，使其可以从 JavaScript 端访问：

```kotlin
package expo.modules.myui

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class MyUiModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyUi")

    ExpoUIView<MyCustomViewProps>("MyCustomView") {
      Content { props ->
        MyCustomViewContent(props)
      }
    }
  }
}
```

> **说明**：
> - `ExpoUIView<MyCustomViewProps>("MyCustomView")`：以泛型方式指定属性类型，并命名视图。JavaScript 端通过此名称引用原生视图。
> - `Content { props -> ... }`：定义视图的渲染内容，`props` 即从 JavaScript 传入的属性。

---

### TypeScript 包装器

构建一个 TypeScript 包装器，将修饰符与事件监听器关联起来。有一个专门的工具函数可以让交互式修饰符在你的自定义元素上正常工作：

```tsx
import { type PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';

export interface MyCustomViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeMyCustomView = requireNativeView<MyCustomViewProps>('MyUi', 'MyCustomView');

export function MyCustomView({ modifiers, ...restProps }: MyCustomViewProps) {
  return (
    <NativeMyCustomView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...restProps}
    />
  );
}
```

> **代码解析**：
> - `requireNativeView('MyUi', 'MyCustomView')`：通过模块名和视图名获取原生视图的引用。参数需与 Kotlin 端的 `Name("MyUi")` 和 `"MyCustomView"` 一一对应。
> - `createViewModifierEventListener(modifiers)`：为修饰符创建事件监听器，使点击、手势等交互式修饰符能正常工作。
> - `PrimitiveBaseProps`：继承基础属性类型，包含 `modifiers` 等通用属性。

---

### 使用自定义元素

你新创建的元素现在可以完全兼容 UI 库提供的所有标准修饰符：

```tsx
import { Host, Text } from '@expo/ui/jetpack-compose';
import { background, clip, paddingAll } from '@expo/ui/jetpack-compose/modifiers';
import { MyCustomView } from './modules/my-ui';

export default function App() {
  return (
    <Host style={{ flex: 1 }}>
      <MyCustomView
        title="Hello World"
        modifiers={[
          paddingAll(16),
          background('#f0f0f0'),
          clip({ type: 'roundedCorner', radius: 12 }),
        ]}>
        <Text>Child content</Text>
      </MyCustomView>
    </Host>
  );
}
```

> **说明**：
> - `paddingAll(16)`：设置 16dp 的内边距。
> - `background('#f0f0f0')`：设置背景颜色。
> - `clip({ type: 'roundedCorner', radius: 12 })`：裁剪为圆角矩形，圆角半径 12dp。
> - `<Text>Child content</Text>`：作为子元素传入，会在 Kotlin 端的 `Children(...)` 调用中被渲染。

---

## 设计自定义修饰符

除了自定义元素，你还可以创建独特的修饰符，使其兼容任何 UI 组件。需要注意的是，修饰符控制布局配置，包括尺寸、视觉样式和交互行为。如需深入了解，请参阅 Android 官方文档。

### 原生端实现

首先，使用优化的 record 数据类定义参数，然后编写一个根据这些参数生成修饰符的函数：

```kotlin
package expo.modules.myui

import android.graphics.Color
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.ui.compose

@OptimizedRecord
data class CustomBorderParams(
  @Field val color: Color? = null,
  @Field val width: Int = 2,
  @Field val cornerRadius: Int = 0
) : Record

fun customBorderModifier(params: CustomBorderParams): Modifier {
  return Modifier.border(
    border = BorderStroke(params.width.dp, params.color.compose),
    shape = RoundedCornerShape(params.cornerRadius.dp)
  )
}
```

> **代码解析**：
> - `@OptimizedRecord`：优化注解，提升 JavaScript 到 Kotlin 的数据转换性能。
> - `@Field`：标记每个字段，使其能从 JavaScript 端接收数据。
> - `Record` 接口：让数据类能被 Expo 的 record 系统序列化/反序列化。
> - `.compose`：UI 包提供的 Kotlin 扩展属性，将 Android 的 `Color?` 转换为 Compose API 所需的颜色格式。这意味着 JavaScript 端传入的颜色字符串会被自动转换。

---

### 注册修饰符

在模块的创建生命周期中将修饰符注册到注册表中，并在销毁时注销，以防止重新加载时出现内存泄漏：

```kotlin
package expo.modules.myui

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.recordFromMap
import expo.modules.ui.ExpoUIView
import expo.modules.ui.ModifierRegistry

class MyUiModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyUi")

    OnCreate {
      ModifierRegistry.register("customBorder") { map, _, _, _ ->
        customBorderModifier(recordFromMap<CustomBorderParams>(map))
      }
    }

    OnDestroy {
      ModifierRegistry.unregister("customBorder")
    }

    ExpoUIView<MyCustomViewProps>("MyCustomView") {
      Content { props ->
        MyCustomViewContent(props)
      }
    }
  }
}
```

> **代码解析**：
> - `OnCreate`：模块创建时执行的回调，在此注册自定义修饰符。
> - `ModifierRegistry.register("customBorder")`：以 `"customBorder"` 为键名注册修饰符工厂函数。JavaScript 端通过此名称引用该修饰符。
> - 注册回调接收四个参数：JavaScript 传入的 map、composable 作用域、应用上下文和事件分发器。通常情况下，你只需要将 map 转换为你的 record 类型即可。
> - `recordFromMap<CustomBorderParams>(map)`：将 JavaScript 传入的对象转换为 Kotlin 数据类实例。
> - `OnDestroy`：模块销毁时注销修饰符，**防止内存泄漏**。这在开发热重载时尤为重要。

---

### TypeScript 端实现

编写一个函数，使用 `createModifier` 工具构建配置对象：

```ts
import { createModifier } from '@expo/ui/jetpack-compose/modifiers';
import { type ColorValue } from 'react-native';

export const customBorder = (params: {
  color?: ColorValue;
  width?: number;
  cornerRadius?: number;
}) => createModifier('customBorder', params);
```

> **说明**：
> - `createModifier('customBorder', params)`：第一个参数必须与 Kotlin 端注册的名称 `"customBorder"` 完全一致。`params` 会被序列化后传递给原生端。
> - `ColorValue` 类型来自 `react-native`，支持多种颜色格式（如 `'#FF6B35'`、`'red'` 等）。

确保从模块的入口文件中导出自定义元素和新的修饰符：

```ts
export { MyCustomView, type MyCustomViewProps } from './src/MyCustomView';
export { customBorder } from './src/modifiers';
```

---

### 使用自定义修饰符

你的自定义样式逻辑现在可以附加到任何标准 UI 组件上：

```tsx
import { Column, Host, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';
import { customBorder } from './modules/my-ui';

export default function App() {
  return (
    <Host style={{ flex: 1 }}>
      <Column
        modifiers={[paddingAll(20), customBorder({ color: '#FF6B35', width: 3, cornerRadius: 8 })]}>
        <Text>This has a custom border!</Text>
      </Column>
    </Host>
  );
}
```

> **说明**：
> - 自定义修饰符 `customBorder` 与标准修饰符 `paddingAll` 可以同时使用，它们会按顺序应用。
> - 此例中，`Column` 会先应用 20dp 的内边距，再应用自定义的橙色边框（宽 3dp，圆角 8dp）。

---

## 后续方向

你已经成功地使用原生 Android 元素和样式逻辑扩展了 UI 库。以下是一些可以继续探索的方向：

- **使用框架内置的标准组件**。
- **为你的特定应用需求开发专门的样式规则**。
- **将外部 Compose 库集成到你的 React Native 环境中**。
- **将你的作品发布到包注册表，供社区使用**。

> **基于文档内容推导**：由于自定义修饰符可以注册到全局的 `ModifierRegistry` 中，这意味着你创建的修饰符不仅可以用于自己的组件，也能用于框架提供的任何标准组件——这为构建可复用的样式库提供了基础。

> **基于经验建议**：在开发自定义修饰符时，建议先在单个组件上测试验证效果，确认无误后再推广到整个应用。同时，注意 `OnDestroy` 中的注销逻辑不可省略，否则在开发阶段的热重载过程中可能会出现内存泄漏或修饰符重复注册的问题。

---

## 文档导航

- **上一页**：[extending](./163__extending.md)
- **下一页**：[overview](./165__overview.md)
