# Expo Widgets — iOS 主屏幕小组件与实时活动

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/widgets.md

## 文档解决的问题

在 iOS 平台上，用户可以在主屏幕（Home Screen）添加"小组件"（Widgets）来快速查看应用信息，也可以在锁屏界面通过"实时活动"（Live Activities）和"灵动岛"（Dynamic Island）展示实时更新内容。传统上，开发这些功能需要编写 Swift 原生代码，对前端开发者门槛很高。

`expo-widgets` 这个包的作用就是：**让你完全使用 Expo 的 UI 组件（`expo/ui` 提供的 SwiftUI 组件）来构建 iOS 小组件和实时活动，无需手写原生 Swift 代码**。

## 阅读前需要理解的背景知识

### iOS 小组件（Widget）

iOS 小组件是显示在手机主屏幕上的小型信息卡片。与 Web 开发中的"组件"（Component）完全不同——它是操作系统级别的 UI 元素，由 iOS 系统管理和渲染，不是你的 App 进程直接绘制的。你可以把它理解为"App 在主屏幕上的迷你展示窗口"。

小组件支持多种尺寸，例如：
- `systemSmall`：小方块
- `systemMedium`：中等宽度矩形
- `systemLarge`：大尺寸方块
- 锁屏配件（Lock Screen Accessories）：显示在锁屏时钟下方的小型圆形小组件

### 实时活动（Live Activity）与灵动岛（Dynamic Island）

实时活动是 iOS 16.1 引入的功能，允许 App 在锁屏和灵动岛上展示实时更新的动态信息（例如外卖配送进度、比赛比分）。灵动岛是 iPhone 14 Pro 及后续机型屏幕顶部的药丸形区域。

**对 React Web 开发者的类比**：如果说小组件类似于 Web 上的"桌面快捷方式"或"浏览器插件弹出窗口"，那么实时活动更像是"浏览器通知 + 持续更新的悬浮窗"。但它们本质上都是操作系统级别的功能，受 iOS 系统严格管控。

### Development Build

`expo-widgets` **不支持 Expo Go**。Expo Go 是一个预编译的通用客户端，无法包含自定义的原生扩展。你需要使用 **Development Build**（开发构建），即为你的项目单独编译一个包含原生代码的开发版 App。这类似于在 Web 开发中，你不能用一个通用的开发服务器来测试需要自定义浏览器插件的功能。

### App Group（应用组）

iOS 中，主 App 和小组件扩展（Widget Extension）是两个独立的进程，默认不能共享数据。**App Group** 是 iOS 提供的一种机制，允许同一个开发者账号下的多个进程共享文件和数据（类似于 Web 中通过 `localStorage` 在同源页面间共享数据，但配置更加复杂）。

## 安装

使用你偏好的包管理器安装：

```bash
npx expo install expo-widgets
```

> **注意**：如果你在 **Bare React Native** 项目中使用（即不使用 Expo 托管工作流的项目），还需要确保安装了核心的 `expo` 包。这是因为 `expo-widgets` 依赖 Expo 的基础设施。

## App 配置（App Configuration）

安装后，需要在 `app.json` 或 `app.config.js`（Expo 项目的配置文件，类似 Web 项目中的 `package.json` + 构建配置的结合体）中使用内置的 **Config Plugin** 来配置小组件。

Config Plugin 是 Expo 提供的一种机制，让你在 JS/JSON 配置文件中声明原生工程的配置，而不需要直接修改 iOS/Android 原生代码。修改这些配置后，**必须重新生成原生构建**（即执行 `npx expo prebuild` 或重新触发 EAS Build），因为小组件涉及原生层面的变更。

### 配置属性说明

```json
{
  "expo": {
    "plugins": [
      [
        "expo-widgets",
        {
          "bundleIdentifier": "com.example.myapp.widgets",
          "groupIdentifier": "group.com.example.myapp",
          "enablePushNotifications": true,
          "widgets": [
            {
              "name": "MyWidget",
              "displayName": "我的小组件",
              "description": "显示最新数据",
              "contentMarginsDisabled": false,
              "supportedFamilies": ["systemSmall", "systemMedium"],
              "ios": {
                "initialLayout": "./widgets/MyWidgetLayout.json"
              }
            }
          ]
        }
      ]
    ]
  }
}
```

以下是每个配置项的详细说明：

| 属性 | 类型 | 说明 | 开发影响 |
|---|---|---|---|
| `bundleIdentifier` | string | Widget Extension 的 Bundle ID（iOS 用于唯一标识一个应用/扩展的字符串）。默认值是在主 App 的 Bundle ID 后面追加一个后缀。 | 通常不需要手动设置，除非你有特殊的多 Extension 架构需求。 |
| `groupIdentifier` | string | App Group 的标识符，用于主 App 和 Widget Extension 之间的数据共享。默认值是主 App 的 Bundle ID 加上 `"group."` 前缀。 | 如果你需要在主 App 和小组件之间共享数据（几乎必然需要），这个值很重要。保持默认或显式指定均可。 |
| `enablePushNotifications` | boolean | 是否启用实时活动的推送通知支持。启用后会自动添加相关的 iOS Entitlements（权限声明）。 | 只有在你需要使用 Live Activity 的远程推送更新时才需要设为 `true`。 |
| `widgets` | array | 小组件定义数组，每个元素描述一个小组件。 | 一个 App 可以定义多个小组件。 |
| `widgets[].name` | string | 小组件的内部 Swift 标识符，在代码中引用时使用。 | **必须与代码中 `createWidget` 调用时传入的名称一致**。 |
| `widgets[].displayName` | string | 用户在小组件画廊（Widget Gallery）中看到的标题。 | 面向用户的文案，建议简短易懂。 |
| `widgets[].description` | string | 小组件画廊中显示的描述文字。 | 帮助用户理解这个小组件的用途。 |
| `widgets[].contentMarginsDisabled` | boolean | 设为 `true` 时禁用系统自动添加的边距。 | 如果你需要小组件内容占满整个区域，可以设为 `true`；否则保持默认让系统处理边距。 |
| `widgets[].supportedFamilies` | string[] | 小组件支持的尺寸类型数组。可选值包括 `"systemSmall"`、`"systemMedium"`、`"systemLarge"`、`"systemExtraLarge"`、`"accessoryCircular"`、`"accessoryRectangular"`、`"accessoryInline"` 等。 | 决定小组件以哪些尺寸出现在主屏幕或锁屏上。每种尺寸需要对应不同的布局代码。 |
| `widgets[].ios.initialLayout` | string | 初始布局文件的相对路径。这是小组件在 App 首次启动前、尚未有任何数据时在画廊中展示的占位布局。 | 提供一个静态 JSON 布局文件，确保用户在添加小组件时能看到合理的初始界面。 |

## 核心用法

### 一、小组件（Widgets）

#### 1. 创建小组件组件

使用 `'widget'` 指令标记一个组件，它接收 `props`（你定义的数据属性）和 `environment`（系统提供的环境信息对象）：

```tsx
'use widget';

import { Text, VStack } from 'expo/ui/swift-ui';

export default function MyWidget(props: { title: string; count: number }, environment: WidgetEnvironment) {
  return (
    <VStack>
      <Text>{props.title}</Text>
      <Text>{`Count: ${props.count}`}</Text>
    </VStack>
  );
}
```

> **关键理解**：`'use widget'` 是一个特殊指令（类似 React 中 `'use client'` 或 `'use server'` 的作用），告诉编译器这个组件将在 Widget Extension 的上下文中运行，而不是在主 App 进程中。这里的 UI 组件（如 `Text`、`VStack`）来自 `expo/ui/swift-ui`，它们最终会被编译为原生 SwiftUI 视图，而不是 HTML DOM 元素。

#### 2. 注册小组件

使用 `createWidget` 函数注册，名称必须与 `app.json` 中配置的 `widgets[].name` 匹配：

```tsx
import { createWidget } from 'expo-widgets';
import MyWidget from './MyWidget';

const widget = createWidget(MyWidget, 'MyWidget');
```

#### 3. 基础更新（快照更新）

调用 `updateSnapshot` 方法可以立即更新小组件显示的内容。这种方式只展示一条时间线条目（即当前状态）：

```tsx
widget.updateSnapshot({ title: '更新标题', count: 42 });
```

> **类比理解**：`updateSnapshot` 类似于 Web 开发中直接更新一个 DOM 元素的文本内容——它是一次性的、即时的状态更新。

#### 4. 时间线更新（Timeline）

传入一组带有日期标记的 props 数组，iOS 系统会在指定时间自动刷新小组件显示：

```tsx
widget.updateTimeline([
  { date: new Date('2025-01-01T10:00:00Z'), props: { title: '上午', count: 1 } },
  { date: new Date('2025-01-01T12:00:00Z'), props: { title: '中午', count: 2 } },
  { date: new Date('2025-01-01T18:00:00Z'), props: { title: '傍晚', count: 3 } },
]);
```

> **为什么需要时间线？** iOS 小组件不会持续运行你的代码。系统会提前获取一组"时间线条目"，然后在对应时间点自动切换显示。这是 iOS 为了节省电量和内存的设计——与 Web 应用可以随时通过 WebSocket 或轮询来更新 UI 完全不同。

#### 5. 响应式布局

通过 `environment` 参数获取当前小组件的尺寸类型（family），然后条件渲染不同的布局：

```tsx
export default function MyWidget(props, environment) {
  if (environment.family === 'systemSmall') {
    return <Text>简洁视图</Text>;
  }
  return (
    <VStack>
      <Text>详细视图</Text>
      <Text>{props.detail}</Text>
    </VStack>
  );
}
```

### 二、实时活动（Live Activities）

#### 1. 创建实时活动组件

同样使用 `'widget'` 指令，但返回的是一个对象，映射到不同的布局区域（如灵动岛的各种展示形态）：

```tsx
'use widget';

import { Text, HStack } from 'expo/ui/swift-ui';

export default function MyLiveActivity(props: { score: string }) {
  return {
    banner: <Text>{props.score}</Text>,
    compactLeading: <Text>{props.score}</Text>,
    expandedTrailing: <Text>详细: {props.score}</Text>,
  };
}
```

> **布局区域说明**：
> - `banner`：锁屏上的横幅通知样式
> - `compactLeading` / `compactTrailing`：灵动岛紧凑状态下的左右部分
> - `expandedLeading` / `expandedTrailing`：灵动岛展开状态下的左右部分
> - 等等（详见 API 参考中的 `LiveActivityLayout` 类型）

#### 2. 创建工厂并启动

```tsx
import { createLiveActivity } from 'expo-widgets';
import MyLiveActivity from './MyLiveActivity';

const factory = createLiveActivity(MyLiveActivity);

// 启动一个实时活动
const activity = await factory.start(
  { score: '0-0' },         // 初始 props
  'myapp://match/123'       // 可选的 Deep Link URL，用户点击时跳转到 App 对应页面
);
```

#### 3. 更新与结束

```tsx
// 实时更新
await activity.update({ score: '1-0' });

// 结束活动
await activity.end({
  dismissalPolicy: 'default',  // 结束后如何从界面移除
  finalProps: { score: '1-0 (终场)' },
  contentDate: new Date(),     // 防止过期数据被展示
});
```

**`dismissalPolicy` 可选值**：
- `"default"`：系统决定何时移除（通常保留一段时间后自动消失）
- `"immediate"`：立即从界面移除
- 一个 `Date` 对象：在指定时间后移除

#### 4. 推送通知 Token

启用推送通知后（配置 `enablePushNotifications: true`），可以监听推送 Token，用于从服务器远程更新实时活动：

```tsx
import { addPushToStartTokenListener } from 'expo-widgets';

// 监听应用级别的全局启动 Token
addPushToStartTokenListener((event) => {
  console.log('Push to start token:', event.token);
  // 将 token 发送到你的服务器，用于后续远程启动实时活动
});

// 监听实例级别的更新 Token
activity.addPushListener((event) => {
  console.log('Push token for this activity:', event.token);
  // 将 token 发送到你的服务器，用于后续远程更新此实时活动
});
```

## API 参考

### 常量

| 常量 | 说明 |
|---|---|
| `widgetsDirectory` | 一个共享目录路径，主 App 和 Widget Extension 都可以访问。用于存储需要被小组件读取的图片等资源文件。 |

### 工厂函数

| 函数 | 说明 |
|---|---|
| `createWidget(component, name)` | 根据组件和配置名称创建一个 Widget 实例，返回 `Widget` 对象。 |
| `createLiveActivity(component)` | 根据组件创建一个 LiveActivity 工厂，返回 `LiveActivityFactory` 对象。 |

### Widget 类

| 方法 | 说明 |
|---|---|
| `updateSnapshot(props)` | 更新为单条时间线条目（立即显示）。 |
| `updateTimeline(entries)` | 传入带日期的条目数组，安排未来的自动更新。 |
| `reloadAllTimelines()` | 强制重新加载所有时间线。 |
| `getCurrentEntries()` | 获取当前的时间线条目。 |

### LiveActivity 类

| 方法 | 说明 |
|---|---|
| `update(props)` | 更新实时活动的显示内容。 |
| `end(options)` | 结束实时活动，指定移除策略和最终状态。 |
| `getPushToken()` | 获取此实例的推送 Token。 |
| `addPushListener(callback)` | 监听此实例的推送 Token 变化。 |

### LiveActivityFactory 类

| 方法 | 说明 |
|---|---|
| `start(props, url?)` | 启动一个新的实时活动实例。 |
| `getActiveInstances()` | 获取当前所有活跃的实时活动实例。 |

### 事件订阅

| 函数 | 说明 |
|---|---|
| `addPushToStartTokenListener(callback)` | 监听应用级别的全局远程启动 Token 事件。 |
| `addUserInteractionListener(callback)` | 监听用户在小组件/实时活动扩展中的点击和交互事件。 |

### 关键类型定义

#### WidgetEnvironment

系统传入小组件组件的环境信息对象：

| 属性 | 类型 | 说明 |
|---|---|---|
| `date` | Date | 当前时间线条目对应的日期。 |
| `family` | WidgetFamily | 当前小组件的尺寸类型。 |
| `colorScheme` | string | 当前的颜色模式（深色/浅色）。 |
| `renderingMode` | WidgetRenderingMode | 当前的渲染模式。 |

#### WidgetFamily

小组件支持的所有尺寸类型的字符串联合类型：
`"systemSmall"` | `"systemMedium"` | `"systemLarge"` | `"systemExtraLarge"` | `"accessoryCircular"` | `"accessoryRectangular"` | `"accessoryInline"`

#### WidgetRenderingMode

小组件的渲染模式联合类型：
- `"fullColor"`：全彩渲染
- `"accented"`：强调色渲染
- `"vibrant"`：鲜艳色渲染

这些模式由系统根据上下文（如锁屏背景）自动选择，你的组件可以通过 `environment.renderingMode` 感知并调整样式。

#### LiveActivityLayout

定义实时活动各个区域的接口，包括：
- `banner`：锁屏横幅
- `compactLeading` / `compactTrailing`：灵动岛紧凑视图的左右部分
- `expandedLeading` / `expandedTrailing`：灵动岛展开视图的左右部分
- 以及其他区域

#### LiveActivityDismissalPolicy

结束实时活动时的移除策略：
- `"default"`：系统默认行为
- `"immediate"`：立即移除
- `Date`：在指定日期后移除

#### LiveActivityEnvironment

实时活动组件接收的环境对象：

| 属性 | 说明 |
|---|---|
| `colorScheme` | 颜色模式 |
| `family` | 展示形态 |
| `luminance` | 亮度信息 |
| `levelOfDetail` | 细节级别（`"simplified"` 或 `"default"`） |

#### LevelOfDetail

系统建议的视图复杂度。当值为 `"simplified"` 时，建议使用更简洁的布局（例如在较远的观看距离或较小的显示区域时）。

#### UserInteractionEvent

用户交互事件的负载：

| 属性 | 说明 |
|---|---|
| `source` | 交互来源（哪个小组件/实时活动） |
| `target` | 交互目标（用户点击了什么） |
| `timestamp` | 交互时间戳 |

#### PushTokenEvent / PushToStartTokenEvent

推送 Token 事件的负载，包含活动 ID 和对应的推送 Token。

## 注意事项、限制条件和坑点

### 1. 不支持 Expo Go

这是最关键的限制。`expo-widgets` 涉及原生 iOS 扩展的编译，**必须使用 Development Build**。如果你之前一直用 Expo Go 进行开发调试，引入此包后需要切换到自定义开发构建流程。

### 2. 仅限 iOS 平台

此包专门用于 iOS 的小组件和实时活动功能。Android 有自己的 Widget 机制（App Widgets），不在本包的覆盖范围内。如果你的应用需要同时支持 iOS 和 Android 的小组件功能，需要分别处理。

### 3. 组件中不能使用普通 React Native 组件

小组件和实时活动中使用的 UI 组件来自 `expo/ui/swift-ui`，它们最终被编译为 SwiftUI 原生视图。**不能使用** `View`、`Text` 等标准 React Native 组件，也不能使用任何 Web 端 DOM 元素。可用的组件范围比 React Native 主应用更受限。

### 4. 小组件不是实时运行的

iOS 小组件采用"时间线"机制。系统提前获取未来的更新计划，然后在适当时间点切换显示。你不能像 Web 应用那样通过 WebSocket 实时推送更新到小组件。如果需要更频繁的更新，需要使用 Live Activity 或通过 `reloadAllTimelines()` 强制刷新（但系统对刷新频率有限制）。

### 5. 配置变更后必须重新构建

修改 `app.json` 中的 `expo-widgets` 配置后，必须重新生成原生工程（`npx expo prebuild`）或重新触发云端构建。仅仅热重载（Hot Reload）是不够的，因为这些配置影响原生层面的编译目标。

### 6. `createWidget` 的名称必须匹配

`createWidget(component, name)` 中的 `name` 参数必须与 `app.json` 中 `widgets[].name` 的值完全一致，否则小组件无法正确注册和渲染。

### 7. 数据共享依赖 App Group

主 App 和 Widget Extension 运行在不同进程中，不能共享内存状态。如果需要在两者之间传递数据，必须通过 App Group 共享的存储空间（如 `UserDefaults(suiteName:)` 或共享目录中的文件）。`widgetsDirectory` 常量提供了这个共享目录的路径。

## React Web 开发者需要特别注意的地方

1. **`'use widget'` 指令的含义不同于 `'use client'`**：在 Next.js 中，`'use client'` 标记客户端组件。这里的 `'use widget'` 标记的是将在 iOS Widget Extension 进程中运行的组件，它与主 App 是完全隔离的进程。

2. **没有 DOM，没有浏览器 API**：小组件组件中不能使用 `document`、`window`、`fetch`（至少不能像 Web 那样自由使用）等浏览器 API。它是一个受限的渲染环境。

3. **UI 组件来源不同**：不要从 `react-native` 导入 `View`、`Text` 等组件，要从 `expo/ui/swift-ui` 导入。这些组件最终编译为 SwiftUI 视图，而不是 UIView 或 HTML。

4. **状态管理的差异**：小组件不支持 React 的 `useState`、`useEffect` 等 Hooks 的常规使用模式。它更像是一个纯渲染函数——接收 props，输出 UI。数据更新由外部通过时间线机制驱动，而不是组件内部管理。

5. **进程隔离思维**：在 Web 开发中，同一页面的不同组件共享同一个 JS 运行时。而在 iOS 中，主 App 和 Widget Extension 是两个独立的进程，各自有独立的内存空间和生命周期。任何跨进程通信都需要通过系统提供的共享机制。

6. **`initialLayout` 的必要性**：在 Web 中，组件首次渲染前的空白状态通常用 Loading 组件处理。而小组件需要一个静态的 JSON 布局文件作为初始占位，因为小组件在被用户添加到主屏幕时，App 可能还没有运行，无法执行任何 JS 代码来生成布局。

## 实际开发建议

1. **先确定小组件尺寸和布局**：在编码前，先明确你的小组件需要支持哪些尺寸（`supportedFamilies`），并为每种尺寸设计不同的布局。不要试图用一套布局适配所有尺寸。

2. **合理使用时间线**：如果你的数据变化有规律（如每小时更新天气），使用时间线更新（`updateTimeline`）比频繁调用 `updateSnapshot` 更高效，也更符合 iOS 的设计哲学。

3. **Live Activity 适合高时效性场景**：实时活动适用于用户主动关注的、有明确起止时间的短时任务（如打车、外卖、比赛）。不要用它来做无限期的后台信息推送。

4. **及时结束 Live Activity**：实时活动结束后应尽快调用 `end()` 方法，并设置合适的 `dismissalPolicy`。长时间挂起不活跃的实时活动会影响用户体验，也可能被系统强制终止。

5. **测试时使用 Development Build**：确保你的开发环境配置了 Development Build，否则无法测试小组件功能。可以使用 `npx expo run:ios` 在模拟器上运行（但小组件在模拟器上的测试体验不如真机）。

6. **（基于经验建议）推送 Token 务必持久化**：当通过 `addPushToStartTokenListener` 或 `addPushListener` 获取到推送 Token 时，应该立即发送到你的后端服务器并持久化存储。Token 可能会变化，需要在变化时更新服务器端记录。

## 总结

`expo-widgets` 为 Expo 项目提供了构建 iOS 主屏幕小组件和实时活动的能力，核心特点：

- **无需手写 Swift 代码**：使用 `expo/ui/swift-ui` 组件和 `'use widget'` 指令声明式地构建 UI
- **两类功能**：静态小组件（Widgets，用于主屏幕信息展示）和实时活动（Live Activities，用于灵动岛和锁屏的实时更新）
- **配置驱动**：通过 `app.json` 中的 Config Plugin 配置小组件属性，通过代码 API 管理数据更新
- **平台限制严格**：仅限 iOS、不支持 Expo Go、小组件非实时更新、进程隔离

对于 React Web 开发者来说，最大的思维转变在于理解 iOS 小组件的"时间线"更新模型和进程隔离机制——这与 Web 开发的实时交互模型有本质区别。

---

## 文档导航

- **上一页**：[webbrowser](./220__webbrowser.md)
- **下一页**：[third party overview](./222__third-party-overview.md)
