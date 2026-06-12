# Expo ScreenOrientation：屏幕方向管理

## 文档解决的问题

`expo-screen-orientation` 是一个用于管理设备**屏幕显示方向**的 Expo 通用库，支持：

- Android
- iOS
- Web
- Expo Go

它主要解决以下问题：

- 获取当前屏幕方向。
- 将界面锁定为横屏或竖屏。
- 恢复系统默认的方向策略。
- 判断设备是否支持某种方向锁定策略。
- 监听横屏与竖屏之间的切换。
- 为不同平台设置原生方向策略。
- 在 Expo Router 中按页面设置方向。

> 本文档对应 Expo 的“下一 SDK 版本”文档。原文提示：当前稳定版本是 SDK 56，实际项目应注意所使用 Expo SDK 版本的 API 是否一致。

## 屏幕方向与设备物理方向

文档所说的 Screen Orientation 是**图形界面被绘制的方向**，不一定等于设备当前的物理朝向。

例如：

- 用户把手机横着拿。
- 应用仍被锁定为竖屏。
- 此时设备物理方向是横向，但屏幕方向仍是竖向。

`expo-screen-orientation` 管理的是屏幕显示方向。如果需要读取设备在现实空间中的物理姿态，应使用 Device Motion 等能力。

对于 React Web 开发者，可以这样理解：

- 屏幕方向类似浏览器当前使用的横屏或竖屏布局状态。
- 物理方向来自陀螺仪、加速度计等传感器。
- 两者经常相关，但不是同一个数据源，也不保证始终一致。

## 系统设置与应用锁定的关系

在 Android 和 iOS 上，应用修改屏幕方向可能覆盖系统设置或用户偏好。

### Android

Android 允许使用某些原生方向策略，在改变屏幕方向时考虑用户偏好。

### iOS

iOS 不向应用开放用户和系统方向偏好的读取能力。因此，应用设置屏幕方向时会直接覆盖现有设置。

这意味着调用方向锁定 API 不只是修改 React 组件布局，而是在请求原生系统改变整个应用界面的方向策略。

### Web

Web 平台对屏幕方向 API 的支持有限，实际能力取决于：

- 浏览器类型和版本。
- 设备类型。
- 当前页面状态。
- 浏览器对 Screen Orientation API 的权限和使用限制。

因此，不应仅因为 API 标记支持 Web，就假设所有桌面和移动浏览器都能可靠锁定方向。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-screen-orientation

# yarn
yarn expo install expo-screen-orientation

# pnpm
pnpm expo install expo-screen-orientation

# bun
bun expo install expo-screen-orientation
```

`expo install` 会根据当前 Expo SDK 选择兼容的包版本。它与直接执行 `npm install` 的关键区别是：Expo CLI 会参与版本匹配。

如果这是一个已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 Expo Modules，也就是原文所说的安装 `expo`。

## iPad Split View 的重要限制

Apple 从 iOS 9 开始支持 iPad Split View，即两个应用并排运行。

这改变了 iPad 的屏幕方向处理方式。原文指出：为了使用该模块锁定 iPad 屏幕方向，需要禁用 Split View 支持，也就是要求应用全屏运行。

在 Expo 配置中可以设置：

```json
{
  "expo": {
    "ios": {
      "requireFullScreen": true
    }
  }
}
```

开发影响如下：

- 启用 `requireFullScreen` 后，应用不能使用 iPad 分屏模式。
- 如果业务必须支持 iPad Split View，就不能假设方向锁定能够按预期工作。
- 这是产品能力之间的取舍，不只是代码层面的配置。

## 构建期配置

`expo-screen-orientation` 提供了内置 Config Plugin，可以在使用 Continuous Native Generation（CNG）的项目中修改原生配置。

对于 React Web 开发者，可以将 Config Plugin 理解成：

> 在生成 iOS、Android 原生工程时，自动修改原生项目配置的构建期插件。

这类配置不能通过应用运行时的 JavaScript 动态修改，变更后需要重新构建 App 二进制文件。

### 配置示例

```json
{
  "expo": {
    "ios": {
      "requireFullScreen": true
    },
    "plugins": [
      [
        "expo-screen-orientation",
        {
          "initialOrientation": "DEFAULT"
        }
      ]
    ]
  }
}
```

配置含义：

- `ios.requireFullScreen`：要求 iOS 应用全屏运行，以便在 iPad 上使用方向锁定。
- `plugins`：启用 `expo-screen-orientation` 的 Config Plugin。
- `initialOrientation`：设置 iOS 应用启动时的初始屏幕方向策略。

### `initialOrientation`

该属性只对 iOS 生效，默认值为 `undefined`。

可选值：

| 值 | 含义 |
| --- | --- |
| `DEFAULT` | 使用默认方向策略 |
| `ALL` | 允许所有方向 |
| `PORTRAIT` | 允许竖屏方向 |
| `PORTRAIT_UP` | 仅允许正向竖屏 |
| `PORTRAIT_DOWN` | 仅允许倒置竖屏 |
| `LANDSCAPE` | 允许横屏方向 |
| `LANDSCAPE_LEFT` | 仅允许左横屏 |
| `LANDSCAPE_RIGHT` | 仅允许右横屏 |

这里使用的是配置文件字符串，不是运行时代码中的枚举表达式。

### 不使用 CNG 的项目

如果项目不使用 CNG，就需要手动修改原生工程。

对于已有 React Native 项目的 iOS 配置：

1. 执行以下命令，用 Xcode 打开 `ios` 原生工程：

   ```sh
   xed ios
   ```

2. 如果项目没有 `ios` 目录，先生成：

   ```sh
   npx expo prebuild -p ios
   ```

3. 在 Xcode 中进入：

   ```text
   Project Target > General > Deployment Info
   ```

4. 勾选 `Requires Full Screen`。

`npx expo prebuild -p ios` 会生成 iOS 原生工程目录。它不是普通的前端构建命令，可能改变项目中的原生工程文件，因此应将生成结果纳入版本管理和变更审查。

## 使用 Expo Router 按页面设置方向

如果项目使用 Expo Router，可以通过 `Stack.Screen` 的 `orientation` 选项为不同页面设置方向：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ orientation: 'portrait' }} />
      <Stack.Screen name="landscape" options={{ orientation: 'landscape' }} />
    </Stack>
  );
}
```

上述配置表示：

- `index` 页面使用竖屏。
- `landscape` 页面使用横屏。

该能力由 `react-native-screens` 提供。对于 Stack 导航器中的逐页面方向控制，这是原文推荐的方案。

这与 React Web 中根据路由在组件挂载时手动执行副作用不同：方向要求成为原生导航页面的配置，由导航层管理页面进入和退出时的行为。

## 导入模块

```ts
import * as ScreenOrientation from 'expo-screen-orientation';
```

模块中的方法都是命名空间成员，例如：

```ts
ScreenOrientation.getOrientationAsync();
ScreenOrientation.lockAsync(...);
ScreenOrientation.unlockAsync();
```

## 查询当前状态

### 获取当前屏幕方向

```ts
const orientation = await ScreenOrientation.getOrientationAsync();
```

`getOrientationAsync()` 返回：

```ts
Promise<ScreenOrientation.Orientation>
```

结果描述界面当前实际显示的方向，例如正向竖屏、左横屏等。

### 获取当前方向锁定策略

```ts
const lock = await ScreenOrientation.getOrientationLockAsync();
```

返回：

```ts
Promise<ScreenOrientation.OrientationLock>
```

它获取的是当前**方向锁定策略**，不是当前实际方向。

例如：

- 当前策略可能是 `LANDSCAPE`，表示允许两种横屏方向。
- 当前实际方向则可能是 `LANDSCAPE_LEFT`。

### 获取平台原生锁定信息

```ts
const info =
  await ScreenOrientation.getPlatformOrientationLockAsync();
```

返回 `PlatformOrientationInfo`，用于读取平台特有的方向策略，而不是统一的跨平台枚举。

## 锁定与解锁屏幕方向

### 使用跨平台策略锁定

```ts
async function changeScreenOrientation() {
  await ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
  );
}
```

`lockAsync()` 接收一个 `OrientationLock`，并在方向设置完成后兑现 `Promise<void>`。

因为方向变更是异步原生操作，应使用 `await`，不能把它当作同步状态赋值。

### 恢复默认策略

```ts
await ScreenOrientation.unlockAsync();
```

`unlockAsync()` 会将方向恢复为：

```ts
ScreenOrientation.OrientationLock.DEFAULT
```

它并不等同于“允许所有方向”。不同平台的默认行为不同：

- iOS：允许除 `PORTRAIT_DOWN` 之外的方向。
- Android：由系统决定最合适的方向。

### 检查设备是否支持某种策略

```ts
const supported =
  await ScreenOrientation.supportsOrientationLockAsync(
    ScreenOrientation.OrientationLock.PORTRAIT_DOWN
  );

if (supported) {
  await ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.PORTRAIT_DOWN
  );
}
```

返回值是 `Promise<boolean>`。

对于设备能力不确定的方向，建议先检查再锁定。原文明确指出，部分设备不支持倒置竖屏，这也会影响组合策略。

## 平台专用方向锁定

需要直接使用平台原生策略时，可以调用：

```ts
await ScreenOrientation.lockPlatformAsync(options);
```

参数类型为 `PlatformOrientationInfo`：

| 属性 | 平台 | 作用 |
| --- | --- | --- |
| `screenOrientationArrayIOS` | iOS | 指定允许的 `Orientation` 数组 |
| `screenOrientationConstantAndroid` | Android | 传入 Android 原生方向常量 |
| `screenOrientationLockWeb` | Web | 传入 Web 方向锁定策略 |

传入无效选项或值时，Promise 会被拒绝，因此调用方需要考虑错误处理。

### Android 示例含义

Android 属性接收数字形式的原生 API 常量。例如原文指出：

```ts
{
  screenOrientationConstantAndroid: -1
}
```

`-1` 对应 Android 的 `SCREEN_ORIENTATION_UNSPECIFIED`。

这种 API 与 Android 原生常量直接耦合，跨平台可读性较弱。只有统一的 `OrientationLock` 无法表达需求时，才有必要使用。

### Web 可用策略

`WebOrientationLock` 与 W3C Screen Orientation 规范对应：

- `ANY`
- `LANDSCAPE`
- `LANDSCAPE_PRIMARY`
- `LANDSCAPE_SECONDARY`
- `NATURAL`
- `PORTRAIT`
- `PORTRAIT_PRIMARY`
- `PORTRAIT_SECONDARY`
- `UNKNOWN`

这些值通过 `lockPlatformAsync()` 使用，而不是传给普通的 `lockAsync()`。

## 监听屏幕方向变化

### 添加监听器

```ts
const subscription =
  ScreenOrientation.addOrientationChangeListener(event => {
    console.log(event.orientationInfo.orientation);
    console.log(event.orientationLock);
  });
```

监听器接收 `OrientationChangeEvent`：

```ts
type OrientationChangeEvent = {
  orientationInfo: ScreenOrientationInfo;
  orientationLock: OrientationLock;
};
```

### 事件触发粒度

该事件只在屏幕方向类别发生以下变化时触发：

- 竖屏变横屏。
- 横屏变竖屏。

以下变化不会触发：

```text
PORTRAIT_UP -> PORTRAIT_DOWN
```

以下变化会触发：

```text
PORTRAIT_UP -> LANDSCAPE_LEFT
```

因此，这个监听器不适合用来追踪每一次精确方向变化。如果业务必须区分同类方向内部的翻转，不能假设该事件会通知。

### 移除监听器

推荐保留订阅对象，并调用：

```ts
subscription.remove();
```

在 React 组件中可以放入 Effect 清理函数：

```tsx
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export function OrientationObserver() {
  useEffect(() => {
    const subscription =
      ScreenOrientation.addOrientationChangeListener(event => {
        console.log(event.orientationInfo.orientation);
      });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
```

旧的移除方式已被标记为废弃：

```ts
ScreenOrientation.removeOrientationChangeListener(subscription);
```

原文说明该函数将在未来版本删除，应自行保存订阅对象并使用 `subscription.remove()`。

还可以调用：

```ts
ScreenOrientation.removeOrientationChangeListeners();
```

它会移除所有方向变化监听器。该方法影响范围较大，可能同时删除其他组件注册的监听器。

> 基于文档内容推导：组件级清理应优先使用当前组件持有的 `subscription.remove()`，避免误删其他模块的监听器。

## 核心数据类型

### `ScreenOrientationInfo`

描述当前屏幕方向信息：

| 属性 | 含义 |
| --- | --- |
| `orientation` | 当前实际屏幕方向 |
| `horizontalSizeClass` | iOS 水平方向 Size Class，可选 |
| `verticalSizeClass` | iOS 垂直方向 Size Class，可选 |

后两个属性是 iOS 特有信息。虽然类型文档整体标记支持 Android、iOS 和 Web，但不能假设平台特有的可选字段在所有平台都存在。

### `Orientation`

`Orientation` 描述当前实际显示方向：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | `0` | 无法确定，例如设备平放在桌面上 |
| `PORTRAIT_UP` | `1` | 正向竖屏 |
| `PORTRAIT_DOWN` | `2` | 倒置竖屏 |
| `LANDSCAPE_LEFT` | `3` | 左横屏 |
| `LANDSCAPE_RIGHT` | `4` | 右横屏 |

业务代码应处理 `UNKNOWN`，不要默认读取结果一定属于四种明确方向之一。

### `OrientationLock`

`OrientationLock` 描述允许或要求使用哪些方向：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `DEFAULT` | `0` | 平台默认策略 |
| `ALL` | `1` | 允许四种方向 |
| `PORTRAIT` | `2` | 允许两种竖屏方向 |
| `PORTRAIT_UP` | `3` | 仅正向竖屏 |
| `PORTRAIT_DOWN` | `4` | 仅倒置竖屏 |
| `LANDSCAPE` | `5` | 允许两种横屏方向 |
| `LANDSCAPE_LEFT` | `6` | 仅左横屏 |
| `LANDSCAPE_RIGHT` | `7` | 仅右横屏 |
| `OTHER` | `8` | 平台特有策略 |
| `UNKNOWN` | `9` | 未知锁定策略 |

`OTHER` 和 `UNKNOWN` 只能用于描述状态，不能作为有效策略传给 `lockAsync()`。

另外：

- 不支持 `PORTRAIT_DOWN` 的设备也不能使用 `ALL`。
- 同样不能使用包含倒置竖屏的 `PORTRAIT` 策略。
- 使用这些组合策略前，可以调用 `supportsOrientationLockAsync()`。

### iOS Size Class

`SizeClassIOS` 用于描述 iOS 界面的可用空间类别：

| 枚举 | 数值 |
| --- | ---: |
| `UNKNOWN` | `0` |
| `COMPACT` | `1` |
| `REGULAR` | `2` |

Size Class 不是简单的横屏或竖屏标记。它是 iOS 用来指导自适应界面设计的空间分类。

对于 React Web 开发者，可以近似理解为原生平台提供的布局环境等级，作用类似媒体查询中的空间区间，但两者不是同一套机制。

### Web 精确方向

`WebOrientation` 包含：

- `LANDSCAPE_PRIMARY`
- `LANDSCAPE_SECONDARY`
- `PORTRAIT_PRIMARY`
- `PORTRAIT_SECONDARY`

其中 primary 和 secondary 表示设备自然方向及其相反方向。它们是 Web 平台使用的方向表达方式。

## React Web 开发者容易误解的地方

### 方向锁定不是 CSS 响应式布局

在 Web 中，通常通过媒体查询响应视口尺寸：

```css
@media (orientation: landscape) {
  /* 调整布局 */
}
```

`lockAsync()` 做的是另一件事：它请求平台限制整个屏幕界面的显示方向。

即使锁定了横屏，页面仍需正确处理：

- 不同设备尺寸。
- 安全区域。
- iPad 等大屏设备。
- 导航栏和状态栏占用。
- 分屏或平台限制。

### 屏幕方向不等于宽高关系

文档中的方向来自平台方向状态，不是简单判断：

```ts
width > height
```

在复杂窗口、多任务和平台布局环境中，两者不应被视为完全等价。

### 配置文件修改需要重新构建

`initialOrientation`、`requireFullScreen` 等原生配置不是前端热更新后立即生效的运行时状态。

修改这些配置通常需要：

1. 重新生成或同步原生配置。
2. 重新构建应用二进制文件。
3. 在模拟器或真机中重新安装和验证。

### Expo Go 支持不代表独立构建无需配置

该库包含在 Expo Go 中，但 iPad 全屏要求、初始方向等构建期配置仍属于独立应用的原生配置。Expo Go 的测试结果不能完全替代正式构建验证。

## 实际开发中的使用方式

### 页面固定方向

如果使用 Expo Router Stack，优先使用页面配置：

```tsx
<Stack.Screen options={{ orientation: 'landscape' }} />
```

这适合视频播放、横版游戏、图表展示等页面级需求。

### 临时锁定方向

没有使用 Expo Router 页面配置，或者方向切换由业务操作触发时，可以使用：

```ts
await ScreenOrientation.lockAsync(
  ScreenOrientation.OrientationLock.LANDSCAPE
);
```

操作结束后恢复默认策略：

```ts
await ScreenOrientation.unlockAsync();
```

### 根据方向调整界面

如果界面只需要响应方向变化，而不需要强制锁定，可以注册监听器，并在组件卸载时清理订阅。

需要注意，该监听器只通知横竖类别之间的切换，不能捕获同类别内部的所有翻转。

### 处理异步失败

> 基于经验建议：方向锁定涉及原生平台和浏览器能力，调用时应使用 `try/catch`，并在必要时先检查支持情况。

```ts
async function lockLandscape() {
  const policy = ScreenOrientation.OrientationLock.LANDSCAPE;

  try {
    const supported =
      await ScreenOrientation.supportsOrientationLockAsync(policy);

    if (!supported) {
      return;
    }

    await ScreenOrientation.lockAsync(policy);
  } catch (error) {
    console.error('无法锁定屏幕方向', error);
  }
}
```

## 限制与坑点汇总

1. Web 对屏幕方向 API 的支持有限，必须在目标浏览器中验证。
2. iOS 上应用无法读取用户和系统的方向偏好，应用锁定会覆盖现有设置。
3. iPad 要可靠锁定方向，需要启用全屏并放弃 Split View。
4. 构建期配置修改后需要重新构建 App。
5. `OrientationLock.ALL` 和 `PORTRAIT` 在不支持倒置竖屏的设备上无效。
6. `OrientationLock.OTHER` 和 `UNKNOWN` 不能传给 `lockAsync()`。
7. 方向变化事件只关注横屏与竖屏类别切换。
8. 应使用 `subscription.remove()` 清理单个监听器。
9. `removeOrientationChangeListener()` 已废弃，未来版本会删除。
10. `removeOrientationChangeListeners()` 会移除全部监听器，容易影响其他模块。
11. 平台专用 API 会增加代码与原生平台常量的耦合。
12. 当前页面是下一 SDK 版本文档，稳定 SDK 中的 API 可能存在差异。

## 当前文档未涉及的内容

当前文档未具体说明：

- 各浏览器允许方向锁定的前置条件。
- 锁定失败时不同平台对应的具体错误类型。
- Android Manifest 手动配置的完整步骤。
- 不同设备对每种方向策略的兼容性列表。
- 模拟器与真机在方向行为上的差异。
- 安全区域、状态栏和布局尺寸的具体适配方案。
- 多个模块同时请求不同方向时的优先级规则。
- 应用进入后台或恢复前台后的方向策略变化。

这些问题需要结合目标 Expo SDK、平台官方文档和真机测试进一步确认，不能仅根据当前文档作出结论。

## 总结

`expo-screen-orientation` 同时提供三种层级的能力：

- 使用 `Orientation` 查询当前实际方向。
- 使用 `OrientationLock` 设置跨平台方向策略。
- 使用 `PlatformOrientationInfo` 设置平台特有策略。

简单的全局或临时方向控制可以使用 `lockAsync()` 和 `unlockAsync()`；Expo Router Stack 中的页面级需求应优先使用 `Stack.Screen` 的 `orientation` 配置。

实际接入时，最重要的限制是 iPad Split View、Web 兼容性、设备对倒置竖屏的支持，以及构建期配置必须重新生成并构建原生应用。

---

## 文档导航

- **上一页**：[screen capture](./201__screen-capture.md)
- **下一页**：[securestore](./203__securestore.md)
