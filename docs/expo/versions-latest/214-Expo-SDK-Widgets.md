# 214｜Expo SDK Widgets iOS 小组件与实时活动

**翻页：**[上一页：Expo SDK WebBrowser 系统浏览器](./213-Expo-SDK-WebBrowser.md) · [目录](./README.md) · [下一页：Expo Go 支持的第三方库概览](./215-Expo-ThirdParty-Libraries-Overview.md)

**官方页面：**[Widgets · Latest](https://docs.expo.dev/versions/latest/sdk/widgets/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/widgets/)

**版本与平台：**Latest 推荐 `expo-widgets ~57.0.20`；SDK v56.0.0 推荐 `~56.0.27`。本库只支持 iOS，**不包含在 Expo Go 中**，需要使用 development build（开发构建）。两版的主要功能与代码主题一致；Latest 把 `widgetsDirectory` 另列为 API 常量，v56 页面在图片共享 Usage 中说明它。Latest API 将 Widget 公开类型写成 props 与配置两个泛型，v56 的 API 摘要只写 props 泛型，但它的可配置 Widget 示例同样传入两个泛型；以当前项目 SDK 版本匹配的包声明为准。两版都列出部分 iOS 26+ 环境字段，这表示系统运行时能力要求，不代表 Expo SDK 版本。

## 先区分两种系统界面

- **主屏幕 / 锁屏小组件（Widget）：**系统在 App 之外的小型信息卡片。App 把 props 和时间线交给系统，WidgetKit 决定什么时候绘制或刷新。
- **实时活动（Live Activity）：**适合配送进度、比赛比分等持续状态，在锁屏和支持设备的灵动岛展示。它有开始、更新、结束生命周期。
- **开发构建：**包含项目原生模块的自有 iOS App 安装包。Widgets 需要原生扩展，因此不能只用 Expo Go 查看；配置插件变更也要生成新的原生构建。
- **Expo UI：**这里的 Widget 布局使用 `@expo/ui/swift-ui` 组件和 modifier（修饰器）；它们是 SwiftUI 视图的 Expo/React 写法，不是普通 React Native 的 `View` 或 `Text`。

频繁推送 Live Activity 更新可能被 iOS 限流。Info.plist 的 `NSSupportsLiveActivitiesFrequentUpdates` 可请求更高的更新预算，但系统仍可限速，用户也能在系统设置中关闭。

## 安装

以下是文档列出的包管理器命令；新 Expo 项目也可以从 `with-widgets` 示例起步。

```sh
npx expo install expo-widgets
yarn expo install expo-widgets
pnpm expo install expo-widgets
bun expo install expo-widgets
```

```sh
npx create-expo-app --example with-widgets
yarn create expo-app --example with-widgets
pnpm create expo-app --example with-widgets
bun create expo --example with-widgets
```

在已有 React Native 工程中，先将 Expo 集成到项目，再使用此库。

## 在 app config 中声明 Widget

`expo-widgets` 的 config plugin（配置插件）在 prebuild / 原生构建时生成 Widget extension。凡是要求改 Info.plist、entitlement 或原生 target 的设置都不能仅靠热更新生效，修改后需要重新构建 App。

### 最小配置

```json
{
  "expo": {
    "plugins": [
      [
        "expo-widgets",
        {
          "widgets": [
            {
              "name": "CounterWidget",
              "displayName": "计数",
              "description": "展示当前计数",
              "ios": {
                "supportedFamilies": [
                  "systemSmall",
                  "systemMedium",
                  "systemLarge"
                ]
              }
            }
          ]
        }
      ]
    ]
  }
}
```

### 所有主要选项示例

```json
{
  "expo": {
    "plugins": [
      [
        "expo-widgets",
        {
          "bundleIdentifier": "com.example.delivery.widgets",
          "groupIdentifier": "group.com.example.delivery",
          "enablePushNotifications": true,
          "widgets": [
            {
              "name": "StatusWidget",
              "displayName": "状态",
              "description": "一眼查看订单状态",
              "ios": {
                "contentMarginsDisabled": true,
                "supportedFamilies": ["systemSmall", "systemMedium"]
              }
            },
            {
              "name": "WeatherWidget",
              "displayName": "天气",
              "description": "显示用户选择城市的天气",
              "ios": {
                "supportedFamilies": ["systemSmall", "systemMedium"],
                "configuration": {
                  "title": "选择城市",
                  "description": "选择要显示天气的城市",
                  "parameters": {
                    "city": {
                      "title": "城市",
                      "type": "enum",
                      "default": "sf",
                      "values": [
                        { "name": "旧金山", "value": "sf" },
                        { "name": "纽约", "value": "nyc" }
                      ]
                    }
                  }
                }
              }
            },
            {
              "name": "LockScreenWidget",
              "displayName": "快速查看",
              "description": "在锁屏查看信息",
              "ios": {
                "supportedFamilies": [
                  "accessoryCircular",
                  "accessoryRectangular",
                  "accessoryInline"
                ]
              }
            }
          ]
        }
      ]
    ]
  }
}
```

### 配置项解释

| 配置 | 默认 / 含义 |
| --- | --- |
| `bundleIdentifier` | Widget extension 的 bundle id；缺省时由主 App bundle id 加 `.ExpoWidgetsTarget` 生成。 |
| `groupIdentifier` | App Group 标识，供主 App 与 Widget 共享数据；缺省时为 `group.<主 App bundle id>`。如果未配置 `ios.bundleIdentifier`，系统也无法推导它，prebuild 会失败。 |
| `enablePushNotifications` | 默认 `false`。开启后设置 APNs 的 `aps-environment` entitlement 和 `ExpoLiveActivity_EnablePushNotifications` Info.plist 项。 |
| `widgets` | Widget 配置数组；数组中每项会生成一个 Widget kind。 |
| `widgets[].name` | 内部名称，必须是合法 Swift 标识符（不要空格或特殊字符），并与代码中的 `createWidget(name, ...)` 一致。 |
| `displayName` / `description` | 用户在添加 Widget 的系统图库里看到的名称与说明。 |
| `ios.supportedFamilies` | 可选尺寸：`systemSmall`、`systemMedium`、`systemLarge`、仅 iPad 的 `systemExtraLarge`，以及锁屏 `accessoryCircular`、`accessoryRectangular`、`accessoryInline`。 |
| `ios.contentMarginsDisabled` | 默认 `false`。设为 `true` 后系统不自动加内边距，布局必须自行处理各上下文的 padding。 |
| `ios.configuration` | 允许用户长按 Widget 并选择参数。包含编辑界面的 `title` / 可选 `description` 以及 `parameters`。参数有 `title`、`type`、`default`；type 可为 `string`、`number`、`boolean`、`enum`。枚举还需要 `values: { name, value }[]`。 |

旧版顶层 `supportedFamilies` 和 `contentMarginsDisabled` 是已弃用别名，应改用 `ios.supportedFamilies` 和 `ios.contentMarginsDisabled`。

## Usage：Widget 组件的隔离运行时

传入 `createWidget` 或 `createLiveActivity` 的组件必须在函数体开头写 `'widget'` 指令。打包器会把组件函数序列化进独立 JS bundle，在 Widget extension 的隔离运行时中同步执行：

- 只能绘制 `@expo/ui/swift-ui` 提供的视图与 modifier；不能把 React Native DOM 式组件当成 Widget 视图。
- 不可用 React hooks、state、context、异步操作，也不能读取主 App 的内存状态。
- 组件不能依赖函数外的普通变量或 helper。需要的值通过 props 或 `environment` 传入；局部常量应在组件内部声明。
- 可共享图片时，由主 App 把文件放进 App Group 目录，再由 Widget 按路径读取。

下例故意展示错误：函数体被单独打包后，模块顶层 `CITY_NAMES` 不在 Widget bundle 内，会出现找不到变量的运行时错误。

```tsx
import { Text } from '@expo/ui/swift-ui';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

const CITY_NAMES: Record<string, string> = { sf: 'San Francisco' };

const CityWidget = (
  props: object,
  environment: WidgetEnvironment<{ city: string }>
) => {
  'widget';
  // 错误：CITY_NAMES 声明在组件外，隔离 bundle 无法读取。
  return <Text>{CITY_NAMES[environment.configuration.city]}</Text>;
};

export default createWidget('CityWidget', CityWidget);
```

### 创建一个 Widget

`props` 是 App 提供的数据；`WidgetEnvironment` 是系统传入的外部环境信息。代码中的 name 必须与 config plugin 的 `widgets[].name` 相同。

```tsx
import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type CounterProps = {
  count: number;
};

const CounterWidget = (props: CounterProps, environment: WidgetEnvironment) => {
  'widget';

  return (
    <VStack>
      <Text modifiers={[font({ weight: 'bold', size: 16 }), foregroundStyle('#202124')]}>
        当前数量：{props.count}
      </Text>
      <Text>尺寸：{environment.widgetFamily}</Text>
    </VStack>
  );
};

export default createWidget('CounterWidget', CounterWidget);
```

### 立即显示快照

`updateSnapshot` 设置一份立即呈现的数据，不安排后续时间点。

```ts
import CounterWidget from './CounterWidget';

CounterWidget.updateSnapshot({ count: 5 });
```

### 安排时间线

`updateTimeline` 接收一组带日期的 entries。系统到达这些时间点时，可使用对应 props 更新 Widget；这是系统调度，不等同于 App 保证准点后台运行。

```ts
import CounterWidget from './CounterWidget';

CounterWidget.updateTimeline([
  { date: new Date(), props: { count: 1 } },
  { date: new Date(Date.now() + 60 * 60 * 1000), props: { count: 2 } },
  { date: new Date(Date.now() + 2 * 60 * 60 * 1000), props: { count: 3 } },
  { date: new Date(Date.now() + 3 * 60 * 60 * 1000), props: { count: 4 } },
]);
```

### 读取时间线

`getTimeline` 会返回当前已排程的过去和未来条目。

```ts
import CounterWidget from './CounterWidget';

const entries = await CounterWidget.getTimeline();
// 每项包含 date 与 props。
console.log(entries);
```

### 强制重新加载

底层数据变化后，`reload` 请求系统立刻重读 Widget 内容与时间线。

```ts
import CounterWidget from './CounterWidget';

CounterWidget.reload();
```

### 根据 Widget 尺寸调整布局

`widgetFamily` 表示系统当前选择的尺寸 / 家族。小尺寸只显示温度，中尺寸增加天气状况，大尺寸再显示更新时间。

```tsx
import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type WeatherProps = {
  temperature: number;
  condition: string;
};

const WeatherWidget = (props: WeatherProps, environment: WidgetEnvironment) => {
  'widget';

  if (environment.widgetFamily === 'systemSmall') {
    return <VStack><Text>{props.temperature}°</Text></VStack>;
  }

  if (environment.widgetFamily === 'systemMedium') {
    return (
      <HStack>
        <Text>{props.temperature}°</Text>
        <Text>{props.condition}</Text>
      </HStack>
    );
  }

  return (
    <VStack>
      <Text>温度：{props.temperature}°</Text>
      <Text>天气：{props.condition}</Text>
      <Text>更新时间：{environment.date.toLocaleTimeString()}</Text>
    </VStack>
  );
};

const Weather = createWidget('WeatherWidget', WeatherWidget);
export default Weather;

Weather.updateSnapshot({ temperature: 22, condition: '晴' });
```

组件还能读取 `colorScheme`（明 / 暗色）、`widgetRenderingMode`（全彩、锁屏鲜明或系统着色模式）、`isLuminanceReduced`（常亮显示等低亮度情形）、`widgetContentMargins`（系统建议的上下左右边距）和 `showsWidgetLabel`（配件小组件是否显示标签），据此提高可读性。

### 可交互 Widget

iOS 17 及以上支持交互控件。`onPress` 必须同步返回下一份 props；系统会保存并重新渲染 Widget，因此 App 即使未运行，点击也能生效。`target` 是可选的应用侧识别键。

```tsx
import { Button, Text, VStack } from '@expo/ui/swift-ui';
import { createWidget } from 'expo-widgets';

type CounterProps = { count: number };

const CounterWidget = (props: CounterProps) => {
  'widget';

  return (
    <VStack>
      <Text>数量：{props.count}</Text>
      <Button
        label="加一"
        target="increment"
        onPress={() => ({ count: props.count + 1 })}
      />
    </VStack>
  );
};

const Counter = createWidget('CounterWidget', CounterWidget);
export default Counter;

Counter.updateSnapshot({ count: 0 });
```

如果还需要把点击同步到正在运行的 App，可监听事件。该监听只在 App 进程存活时触发；Widget 自身状态已经由 `onPress` 更新，因此监听器适合镜像到 App 状态，而不应作为 Widget 更新的唯一机制。

```ts
import { addUserInteractionListener } from 'expo-widgets';

const subscription = addUserInteractionListener(event => {
  if (event.source === 'CounterWidget' && event.target === 'increment') {
    console.log('收到 Widget 中的加一点击');
  }
});

// 不再需要监听时释放订阅。
subscription.remove();
```

### Widget 与 App 共享图片目录

主 App 沙盒里的文件默认不能被 Widget extension 直接读取。`widgetsDirectory` 是共享 App Group 容器中的 `file://` 目录 URL；把图片写入该目录后，Widget 才能通过路径使用它。未配置 App Group 时它可能为 `null`；`groupIdentifier` 插件选项通常会自动配置。

```ts
import { widgetsDirectory } from 'expo-widgets';

console.log(widgetsDirectory);
```

### 用户可配置 Widget

`ios.configuration` 允许用户长按 Widget 并选择参数；读取值的方式是 `environment.configuration`。配置 Widget 要求 iOS 17+。

```tsx
import { Text, VStack } from '@expo/ui/swift-ui';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type WeatherProps = {
  temperature: number;
};

type WeatherConfiguration = {
  city: string;
};

const WeatherWidget = (
  props: WeatherProps,
  environment: WidgetEnvironment<WeatherConfiguration>
) => {
  'widget';

  return (
    <VStack>
      <Text>城市：{environment.configuration.city}</Text>
      <Text>温度：{props.temperature}°</Text>
    </VStack>
  );
};

export default createWidget<WeatherProps, WeatherConfiguration>(
  'WeatherWidget',
  WeatherWidget
);
```

## Live Activities：实时活动

Live Activity 在锁屏和支持的 Dynamic Island 状态中展示一段持续更新的信息。其布局不是单一屏幕，而是返回多个展示区域：锁屏横幅、灵动岛紧凑 / 最小状态、展开后的各区域。以下组件以 `isLuminanceReduced` 适配常亮显示亮度。

```tsx
import { Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

type DeliveryProps = {
  etaMinutes: number;
  status: string;
};

const DeliveryActivity = (props: DeliveryProps, environment: LiveActivityEnvironment) => {
  'widget';

  const color = environment.isLuminanceReduced ? '#FFFFFF' : '#1473E6';

  return {
    banner: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'bold' }), foregroundStyle(color)]}>
          {props.status}
        </Text>
        <Text>预计送达：{props.etaMinutes} 分钟</Text>
      </VStack>
    ),
    compactLeading: <Image systemName="box.truck.fill" color={color} />,
    compactTrailing: <Text>{props.etaMinutes} 分钟</Text>,
    minimal: <Image systemName="box.truck.fill" color={color} />,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Image systemName="box.truck.fill" color={color} />
        <Text modifiers={[font({ size: 12 })]}>配送中</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'bold', size: 20 })]}>{props.etaMinutes}</Text>
        <Text modifiers={[font({ size: 12 })]}>分钟</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text>订单配送中</Text>
        <Text>点击查看详情</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('DeliveryActivity', DeliveryActivity);
```

布局区域的用途：

| 区域 | 系统显示位置 |
| --- | --- |
| `banner` | 锁屏 / 通知中心主卡片 |
| `bannerSmall` | CarPlay、watchOS 的较小卡片；未提供时回退到 banner |
| `compactLeading` / `compactTrailing` | 灵动岛紧凑状态的左右区域 |
| `minimal` | 灵动岛最小状态 |
| `expandedLeading` / `expandedCenter` / `expandedTrailing` / `expandedBottom` | 灵动岛展开后的各区域 |

`createLiveActivity` 通过库内置的 Live Activity target 在运行时注册，不要把它作为普通 home-screen Widget 填入 config 的 `widgets` 数组。此处文档的 API 表对 name 与 app config 的描述比较笼统；Usage 明确说明 Live Activity 的 name 只需与此处的 `createLiveActivity` 调用一致，不需要额外创建一项 Widget config。

### 启动并打开对应页面

`start(props, url?)` 返回活动实例。用户点活动时系统会用关联 URL 打开 App，可由 Expo Router / Linking 路由到订单详情。App 中的按钮仍可使用普通 React Native 组件：

```tsx
import { Button, View } from 'react-native';
import DeliveryActivity from './DeliveryActivity';

export default function App() {
  const startTracking = () => {
    const activity = DeliveryActivity.start(
      { etaMinutes: 15, status: '配送途中' },
      'myapp://deliveries/12345'
    );

    // 保存 activity，在后续状态变更时使用。
    console.log(activity);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="开始追踪" onPress={startTracking} />
    </View>
  );
}
```

### 更新活动

`instance.update` 会立即用新的 props 更新活动内容。

```ts
import { type LiveActivity } from 'expo-widgets';

function updateDelivery(activity: LiveActivity<DeliveryProps>) {
  activity.update({ etaMinutes: 2, status: '即将送达' });
}
```

### App 重启后恢复活动

Live Activity 可以在启动它的 App 进程退出后继续存在。App 再次启动时，用 factory 的 `getInstances()` 找回该类型的活动，再执行更新或结束。

```ts
import DeliveryActivity from './DeliveryActivity';

const activeActivities = DeliveryActivity.getInstances();

for (const activity of activeActivities) {
  await activity.update({ etaMinutes: 5, status: '快到了' });
}
```

### 结束活动

`end()` 可指定系统何时从锁屏移除活动，并可提供最终内容和内容生成时间。`after(date)` 最多保留到结束后四小时内的指定时间；也可以用 `'default'` 或 `'immediate'`。

```ts
import { after, type LiveActivity } from 'expo-widgets';

async function finishDelivery(activity: LiveActivity<DeliveryProps>) {
  await activity.end(
    after(new Date(Date.now() + 15 * 60 * 1000)),
    { etaMinutes: 0, status: '已送达' },
    new Date()
  );
}
```

### 经 APNs 远程开始和更新

在插件中开启 `enablePushNotifications`，服务端就可以经 Apple Push Notification service（APNs）远程开始或更新活动。监听 app-wide push-to-start token 可用于远程创建；每个活动自己的 push token 用于更新该活动。收到的 token 应发送到你的服务端，并安全关联用户 / 活动。

```ts
import { addPushToStartTokenListener } from 'expo-widgets';
import DeliveryActivity from './DeliveryActivity';

const startTokenSubscription = addPushToStartTokenListener(event => {
  console.log('可远程开始活动的 token：', event.activityPushToStartToken);
});

let activityTokenSubscription: { remove: () => void } | undefined;

async function startAndObserveDelivery() {
  const activity = DeliveryActivity.start({
    etaMinutes: 15,
    status: '配送途中',
  });

  const token = await activity.getPushToken();
  console.log('当前活动 token：', token);

  activityTokenSubscription?.remove();
  activityTokenSubscription = activity.addPushTokenListener(event => {
    console.log('活动 token 已更新：', event.activityId, event.pushToken);
  });
}

function stopListening() {
  activityTokenSubscription?.remove();
  startTokenSubscription.remove();
}
```

远程推送要求 APNs `apns-push-type: liveactivity`，topic 为 `<bundle id>.push-type.liveactivity`。`aps` 中 `event` 是 `start`、`update` 或 `end`，还必须带 Unix 秒时间戳和与组件 props 匹配的 `content-state`。其中 `content-state.name` 是创建活动时的名字，`content-state.props` 是 props 的 JSON 字符串。`apns-priority` 用 `10` 表示尽快送达，`5` 表示较低优先级。以下是三个等价负载形态：

远程开始要求 iOS 17.2+。iOS 18+ 若希望 APNs 同时返回该活动后续更新所需的 token，可在 `aps` 中添加 `input-push-token: 1`。

```json
{
  "aps": {
    "timestamp": 1778832000,
    "event": "start",
    "attributes-type": "LiveActivityAttributes",
    "attributes": {},
    "content-state": {
      "name": "DeliveryActivity",
      "props": "{\"etaMinutes\":15,\"status\":\"配送途中\"}"
    },
    "alert": {
      "title": "配送已开始",
      "body": "订单正在配送"
    }
  }
}
```

```json
{
  "aps": {
    "timestamp": 1778832300,
    "event": "update",
    "content-state": {
      "name": "DeliveryActivity",
      "props": "{\"etaMinutes\":2,\"status\":\"即将送达\"}"
    }
  }
}
```

```json
{
  "aps": {
    "timestamp": 1778832600,
    "event": "end",
    "content-state": {
      "name": "DeliveryActivity",
      "props": "{\"etaMinutes\":0,\"status\":\"已送达\"}"
    },
    "dismissal-date": 1778833200
  }
}
```

## API 速查

```ts
import { createWidget, createLiveActivity } from 'expo-widgets';
```

### 常量

| 名称 | 平台 / 类型 | 说明 |
| --- | --- | --- |
| `widgetsDirectory` | iOS · `string`（无 App Group 时可能为 `null`） | 主 App 和 Widget 都能访问的共享文件夹，适合存放供小组件显示的图片。 |

### 类与实例方法

| API | 返回值 | 作用 |
| --- | --- | --- |
| `LiveActivity.addPushTokenListener(listener)` | `EventSubscription` | 监听某一个活动的 APNs token；事件含 `activityId`、`pushToken`。 |
| `LiveActivity.end(dismissalPolicy?, props?, contentDate?)` | `Promise<void>` | 结束活动，可附最终 props 与数据生成时间。比之前内容时间更旧的更新会被系统忽略。 |
| `LiveActivity.getPushToken()` | `Promise<string | null>` | 获取此活动专属 token；推送未启用或 token 尚未生成时为 `null`。 |
| `LiveActivity.update(props)` | `Promise<void>` | 更新活动 props 并刷新 UI。 |
| `LiveActivityFactory.getInstances()` | `LiveActivity<T>[]` | 获取此类型所有正在显示的活动。 |
| `LiveActivityFactory.start(props, url?)` | `LiveActivity<T>` | 创建并启动活动，可关联 deep link URL。 |
| `Widget.getTimeline()` | `Promise<WidgetTimelineEntry[]>` | 读取现有时间线，含过去与未来条目。 |
| `Widget.reload()` | `void` | 请求立即重新加载 Widget 内容和时间线。 |
| `Widget.updateSnapshot(props)` | `void` | 立即设置当前内容，不安排时间线。 |
| `Widget.updateTimeline(entries)` | `void` | 设置多个按日期生效的内容条目。 |

### 工厂函数与事件订阅

| API | 返回值 | 说明 |
| --- | --- | --- |
| `createWidget(name, widget)` | `Widget<PropsType, ConfigurationType>` | 创建 Widget；`name` 要与插件 `widgets[].name` 相同；组件需带 `'widget'` 指令。 |
| `createLiveActivity(name, component)` | `LiveActivityFactory<PropsType>` | 注册一类 Live Activity 并返回工厂。Usage 说明其名字不必加入 `widgets[]`。 |
| `addPushToStartTokenListener(listener)` | `EventSubscription` | 收到全局远程开始 token 时触发。远程启动至少 iOS 17.2。 |
| `addUserInteractionListener(listener)` | `EventSubscription` | App 仍运行时收到小组件按钮 / 开关的交互事件；完成后调用订阅的 `remove()`。 |

### 核心类型与字段

| 类型 | 字段 / 取值 |
| --- | --- |
| `ExpoWidgetsEvents` | `onExpoWidgetsPushToStartTokenReceived`、`onExpoWidgetsUserInteraction` 两类原生事件监听器。 |
| `LevelOfDetail`（iOS 26+） | `'simplified'`、`'default'`；系统建议组件显示较少细节或保持默认。 |
| `LiveActivityComponent<T>` | `(props: T, environment: LiveActivityEnvironment) => LiveActivityLayout`。 |
| `LiveActivityDismissalPolicy` | `'default'`、`'immediate'`、`after(date)`；日期需在结束后的四小时范围内。 |
| `LiveActivityEnvironment` | `activityFamily`（iOS18+）、`colorScheme`、`isActivityFullscreen`（16.1+）、`isActivityUpdateReduced`（18+）、`isLuminanceReduced`（16+）、`levelOfDetail`（26+）。 |
| `LiveActivityEvents` | `onExpoWidgetsTokenReceived`，接收活动 token 事件。 |
| `LiveActivityLayout` | `banner`、`bannerSmall`、`compactLeading`、`compactTrailing`、`minimal`、`expandedLeading`、`expandedCenter`、`expandedTrailing`、`expandedBottom`；除 `banner` 外可按展示场景选填。 |
| `PushTokenEvent` | `activityId: string`、`pushToken: string`。 |
| `PushToStartTokenEvent` | `activityPushToStartToken: string`。 |
| `UserInteractionEvent` | `source`、`target`、`timestamp: number`、`type: 'ExpoWidgetsUserInteraction'`。 |
| `WidgetEnvironment<ConfigurationType>` | `colorScheme`、`configuration`（iOS17+）、`date`、`isLuminanceReduced`（16+）、`levelOfDetail`（26+）、`showsWidgetLabel`（16+）、`widgetContentMargins`（17+）、`widgetFamily`、`widgetRenderingMode`（16+）。 |
| `WidgetFamily` | `systemSmall`、`systemMedium`、`systemLarge`、`systemExtraLarge`（iPad）、`accessoryCircular`、`accessoryRectangular`、`accessoryInline`。 |
| `WidgetRenderingMode` | `fullColor`、`accented`（iOS18+ tinted / watchOS）、`vibrant`（锁屏）。 |
| `WidgetTimelineEntry<T>` | `date: Date` 与 `props: T`。 |

**注意操作系统版本字段：**`iOS 17+`、`iOS 18+`、`iOS 26+` 指 Apple 系统功能的最低版本，和项目采用的 Expo SDK 版本是两回事。字段标为 optional 时，布局代码应给旧系统或不可用环境保留默认行为。

## 新手名词解释

- **Widget extension：**随 iOS App 安装的独立小组件目标；它有自己的运行上下文，不是把 App 页面缩小后直接显示。
- **WidgetKit 时间线：**开发者提供的“哪些时刻用哪些 props”的计划。系统控制刷新节奏，不能把它当成精确的后台定时器。
- **App Group：**Apple 提供的共享容器能力，让主 App 与扩展安全访问共同文件；不能直接跨越各自的私有沙盒。
- **Config plugin：**将 Expo 配置翻译成 iOS 工程设置的插件。涉及原生 target / entitlement / Info.plist 的改动，需构建新的客户端。
- **Dynamic Island：**部分 iPhone 上的灵动岛界面，Live Activity 可分别提供紧凑、最小和展开布局。
- **APNs token：**Apple 推送服务定位目标设备或某个活动的 token，应发给你的服务端用于定向推送，而不是公开到客户端日志或提交仓库。
- **`'widget'` 指令：**让 Expo 把特定函数变成可单独运行的小组件代码。它不是 React hook；组件必须自包含并同步返回 UI。

## 源页代码主题覆盖

官方 Latest 页有 25 个代码区块，本页逐个用原创 / 改写示例覆盖：安装四种包管理器命令、with-widgets 模板命令、最小插件配置、完整配置选项、错误的模块级常量示例、基础 Widget 组件、快照更新、时间线排程、读取时间线、强制重载、尺寸响应式布局、交互按钮、App 交互监听、共享图片目录、用户配置 Widget、Live Activity 多区域布局、开始活动与 deep link、更新活动、恢复活动、结束活动、push token 监听、远程 start / update / end 三类 APNs JSON payload、API 导入。API 表覆盖常量、两种实例类的主要方法、工厂函数、事件订阅、所有核心环境 / 布局 / token / 时间线类型与系统版本标记。Latest 与 SDK v56 的 25 个代码主题和页脚 Next 一致；SDK v56 页面没有单独的 `widgetsDirectory` API 常量小节，但 Usage、类型和功能均有说明。

**翻页：**[上一页：Expo SDK WebBrowser 系统浏览器](./213-Expo-SDK-WebBrowser.md) · [目录](./README.md) · [下一页：Expo Go 支持的第三方库概览](./215-Expo-ThirdParty-Libraries-Overview.md)
