# 使用 SwiftUI 扩展 Expo UI

> 原文地址：https://docs.expo.dev/guides/expo-ui-swift-ui/extending/

本文档详细介绍如何在 Apple 平台（iOS / tvOS）上，通过 SwiftUI 构建自定义视图组件和修饰符（Modifier），使它们与 Expo UI 的内置样式生态无缝集成。

---

## 前置条件

在开始之前，你需要满足以下条件：

### 1. 安装 @expo/ui

必须先安装核心 UI 包：

```sh
npx expo install @expo/ui
```

该命令会自动将 `@expo/ui` 添加到项目依赖中，并安装与当前 Expo SDK 版本兼容的包版本。

### 2. 使用开发构建（Development Build）

标准的 Expo Go 客户端**不支持**此功能库。你需要创建一个自定义的开发构建（Development Build）。

> 基于文档内容推导：因为 SwiftUI 扩展涉及原生代码（Swift），Expo Go 作为预编译的通用客户端，无法包含你自定义的原生模块，所以必须使用开发构建。

### 3. 熟悉 Expo Modules API 和 SwiftUI

建议你先了解以下基础知识：

- **Expo Modules API**：Expo 的原生模块架构，用于在 JavaScript 和原生代码之间建立桥接。
- **SwiftUI**：Apple 的声明式 UI 框架，用于构建 iOS / tvOS 原生界面。

---

## 创建自定义组件

本节将引导你从零开始创建一个可在 React Native 中使用的 SwiftUI 自定义视图组件。

### 项目初始化

使用创建脚本在项目工作区中生成本地模块目录：

```sh
npx create-expo-module@latest --local my-ui
```

- `--local` 参数表示创建一个本地模块（而非发布到 npm 的独立包）。
- `my-ui` 是模块名称，会在项目中生成 `modules/my-ui` 目录。

接下来，在 podspec 配置文件中将 ExpoUI 声明为必需依赖：

```ruby
Pod::Spec.new do |s|
  s.name           = 'MyUi'
  s.version        = '1.0.0'
  s.summary        = 'Custom UI components extending Expo UI'
  # ... other config
  # Add ExpoUI dependency
  s.dependency 'ExpoUI'
  # ... other config
end
```

- `s.dependency 'ExpoUI'` 这一行是关键，它确保 CocoaPods 在构建时链接 ExpoUI 框架，使你的 Swift 代码可以访问 `ExpoSwiftUI.View` 等协议和类型。

### 创建 SwiftUI 视图

构建自定义视图需要两个核心部分：

1. **Props 类（属性类）**：继承 `UIBaseViewProps`，自动处理修饰符（Modifiers）的应用。
2. **View 结构体（视图结构）**：遵循 `ExpoSwiftUI.View` 协议，包含一个被观察的属性对象和一个视图渲染体。

```swift
import SwiftUI
import ExpoModulesCore
import ExpoUI

final class MyCustomViewProps: UIBaseViewProps {
  @Field var title: String = ""
}

struct MyCustomView: ExpoSwiftUI.View {
  @ObservedObject public var props: MyCustomViewProps

  var body: some View {
    VStack {
      Text(props.title)
        .font(.headline)
      Children() // Renders React children
    }
  }
}
```

**代码要点说明：**

- `UIBaseViewProps`：基类，提供了对内置修饰符的自动支持（如 padding、background 等）。
- `@Field`：属性包装器，将 Swift 属性与 JavaScript 端传入的 prop 绑定。当 JS 端传递 `title` 值变化时，Swift 端自动更新。
- `@ObservedObject`：SwiftUI 的观察对象，确保属性变化时视图自动重新渲染。
- `ExpoSwiftUI.View`：Expo 定义的视图协议，要求结构体包含 `props` 和 `body`。
- `Children()`：特殊的占位组件，用于渲染 React 端传入的子元素（children）。

### 注册原生视图

通过模块定义中的 `ExpoUIView` 注册视图。这会自动为你的视图包装修饰符支持，并将其暴露给 JavaScript 层：

```swift
import ExpoModulesCore
import ExpoUI

public class MyUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyUi")

    ExpoUIView(MyCustomView.self)
  }
}
```

- `Name("MyUi")`：定义模块名称，JavaScript 端通过此名称引用模块。
- `ExpoUIView(MyCustomView.self)`：注册自定义视图，Expo 框架会自动处理视图的生命周期和修饰符应用。

### 创建 React 包装组件

在 TypeScript 端创建一个包装组件，将修饰符与事件处理正确关联。需要使用 `createViewModifierEventListener` 工具函数，确保手势和生命周期事件能正确作用于自定义元素：

```tsx
import { requireNativeView } from 'expo';
import { type CommonViewModifierProps } from '@expo/ui/swift-ui';
import { createViewModifierEventListener } from '@expo/ui/swift-ui/modifiers';

export interface MyCustomViewProps extends CommonViewModifierProps {
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

**代码要点说明：**

- `requireNativeView('MyUi', 'MyCustomView')`：通过模块名和视图名引入原生视图。第一个参数对应 Swift 端 `Name("MyUi")`，第二个参数对应视图结构体名。
- `CommonViewModifierProps`：类型接口，包含 `modifiers` 属性的类型定义。继承它使你的组件在 TypeScript 层面支持修饰符。
- `createViewModifierEventListener(modifiers)`：将修饰符配置转换为事件监听器，使修饰符的交互行为（如点击、手势）能正确传递到 React 端。
- `...restProps`：将其余属性（如 `title`、`children`）透传给原生视图。

### 使用自定义组件

你的自定义组件现在完全兼容框架提供的所有内置修饰符：

```tsx
import { Host, Text } from '@expo/ui/swift-ui';
import { padding, cornerRadius, background } from '@expo/ui/swift-ui/modifiers';
import { MyCustomView } from './modules/my-ui';

export default function App() {
  return (
    <Host style={{ flex: 1 }}>
      <MyCustomView
        title="Hello World"
        modifiers={[padding({ all: 16 }), cornerRadius(12), background('#f0f0f0')]}>
        <Text>Child content</Text>
      </MyCustomView>
    </Host>
  );
}
```

**代码要点说明：**

- `Host`：SwiftUI 应用的根容器，所有 SwiftUI 组件必须在 `Host` 内渲染。
- `modifiers` 数组中依次应用了三个内置修饰符：
  - `padding({ all: 16 })`：四周 16pt 内边距
  - `cornerRadius(12)`：12pt 圆角
  - `background('#f0f0f0')`：浅灰色背景
- `<Text>Child content</Text>` 作为子元素，会被 SwiftUI 端的 `Children()` 渲染。

---

## 创建自定义修饰符（Custom Modifiers）

除了使用内置修饰符，你还可以创建自定义修饰符，使其可以应用到任何兼容的框架元素上。

> 修饰符（ViewModifier）决定了视图的样式、布局和行为。这是 SwiftUI 的核心概念之一。

### 原生修饰符实现

定义一个同时遵循 `ViewModifier` 和 `Record` 协议的结构体：

```swift
import SwiftUI
import ExpoModulesCore
import ExpoUI

struct CustomBorderModifier: ViewModifier, Record {
  @Field var color: Color = .red
  @Field var width: CGFloat = 2
  @Field var cornerRadius: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .overlay(
        RoundedRectangle(cornerRadius: cornerRadius)
          .stroke(color, lineWidth: width)
      )
  }
}
```

**代码要点说明：**

- `ViewModifier`：SwiftUI 原生协议，定义如何修改视图外观。
- `Record`：Expo Modules API 协议，使结构体可以从 JavaScript 传入的参数自动构造（即参数序列化/反序列化）。
- `@Field`：与组件 Props 中一样，用于绑定 JS 端传入的参数。
- `body(content:)`：修饰符的核心方法。`content` 是被修饰的原始视图，你通过链式调用对其应用样式。
- 本例实现了一个自定义边框效果：使用 `RoundedRectangle` 绘制带圆角的描边覆盖层。

### 在模块中注册修饰符

在模块定义中注册修饰符。**必须在 `OnCreate` 中注册、在 `OnDestroy` 中注销**，以防止渲染线程冲突：

```swift
import ExpoModulesCore
import ExpoUI

public class MyUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyUi")

    OnCreate {
      ViewModifierRegistry.register("customBorder") { params, appContext, _ in
        return try CustomBorderModifier(from: params, appContext: appContext)
      }
    }

    OnDestroy {
      ViewModifierRegistry.unregister("customBorder")
    }

    ExpoUIView(MyCustomView.self)
  }
}
```

**代码要点说明：**

- `ViewModifierRegistry.register("customBorder")`：以字符串名称 `"customBorder"` 注册修饰符，JS 端通过此名称引用它。
- 闭包 `{ params, appContext, _ in ... }`：工厂函数，接收 JS 传入的参数并构造修饰符实例。`from: params` 利用 `Record` 协议自动将字典参数映射到 `@Field` 属性。
- `OnDestroy` 中注销修饰符非常重要——如果遗漏，模块销毁后渲染线程仍可能尝试访问已释放的修饰符，导致崩溃。

> 基于文档内容推导：`OnCreate` / `OnDestroy` 的生命周期管理确保了修饰符的注册与模块的存活期一致，避免了多线程环境下访问已注销资源的问题。

### JavaScript 端修饰符函数

编写一个 TypeScript 函数，生成修饰符所需的配置对象：

```ts
import { createModifier } from '@expo/ui/swift-ui/modifiers';

export const customBorder = (params: { color?: string; width?: number; cornerRadius?: number }) =>
  createModifier('customBorder', params);
```

- `createModifier('customBorder', params)`：第一个参数必须与原生端 `ViewModifierRegistry.register` 注册时的名称完全一致。
- 函数参数使用可选属性，允许调用方只传入需要的参数，未传入的属性将使用 Swift 端定义的默认值。

确保将修饰符函数和组件一起从模块中导出：

```ts
export { MyCustomView, type MyCustomViewProps } from './src/MyCustomView';
export { customBorder } from './src/modifiers';
```

### 使用自定义修饰符

你的自定义修饰符现在可以应用到生态系统中任何兼容的元素上：

```tsx
import { Host, Text, VStack } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';
import { customBorder } from './modules/my-ui';

export default function App() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack
        modifiers={[
          padding({ all: 20 }),
          customBorder({ color: '#FF6B35', width: 3, cornerRadius: 8 }),
        ]}>
        <Text>This has a custom border!</Text>
      </VStack>
    </Host>
  );
}
```

**代码要点说明：**

- 自定义修饰符 `customBorder` 与内置修饰符 `padding` 在同一 `modifiers` 数组中混合使用，体现了良好的互操作性。
- `color: '#FF6B35'`：JS 端的颜色字符串会被自动转换为 Swift 端的 `Color` 类型。
- `width: 3` 和 `cornerRadius: 8`：数字类型直接映射到 Swift 的 `CGFloat`。

---

## 后续步骤

你已经成功使用 SwiftUI 扩展了 Expo UI 框架，创建了自定义视图组件和修饰符，它们与原生样式生态无缝融合。

接下来你可以考虑：

- **探索内置组件**：了解 `@expo/ui` 提供的原生内置组件库。
- **设计应用专属样式模式**：基于自定义修饰符构建适合你项目的样式体系。
- **集成第三方库**：将 SwiftUI 第三方库包装为 Expo 模块，在 React Native 中使用。
- **发布到 npm**：将你的创作发布为共享包，供社区使用。

---

## 文档导航

- **上一页**：[expo ui swift ui](./162__expo-ui-swift-ui.md)
- **下一页**：[extending](./164__extending.md)
