# 042｜Jetpack Compose LoadingIndicator（Expo SDK Latest）

**翻页：**[上一页：Jetpack Compose ListItem](./041-Jetpack-Compose-ListItem.md) · [目录](./README.md) · [下一页：Jetpack Compose Material Colors](./043-Jetpack-Compose-Material-Colors.md)

**官方页面：**[Jetpack Compose LoadingIndicator · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/loadingindicator/)

**版本边界：**本页按照 Expo Latest 对应页面整理；页面的推荐版本在可检索到的官方快照中出现过 `@expo/ui ~57.0.12` 与 `~57.0.19` 两个值，具体应以项目的 Expo SDK 兼容版本和 `npx expo install @expo/ui` 结果为准。SDK 56 的 ListItem 文档 Next 直接指向 Material Colors，未列出本组件；因此不将这里的组件视为已确认可用于本项目 SDK 56。

## Material 3 Expressive 加载动画

`LoadingIndicator` 和 `ContainedLoadingIndicator` 是 Android Jetpack Compose 的原生加载状态组件。它们以形状变换动画表示仍在处理；后者在动画外增加一个有背景色的容器。它们属于 Expo UI 的 Android / Jetpack Compose API，需要放在 `<Host>` 里面。

安装 Expo UI：

```sh
npx expo install @expo/ui
# 也可按当前项目包管理器选择：
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

纯 React Native 工程还需安装 Expo 的 `expo` 包，才能使用 Expo UI。

## 不确定具体进度：连续旋转 / 形变

省略 `progress` 属性时，指示器持续动画，但不表达完成百分比。这适用于无法估计剩余时间的工作：

```tsx
import { Host, LoadingIndicator } from '@expo/ui/jetpack-compose';

export default function LoadingIndicatorExample() {
  return (
    <Host matchContents>
      <LoadingIndicator />
    </Host>
  );
}
```

加入容器背景的版本：

```tsx
import {
  Host,
  ContainedLoadingIndicator,
} from '@expo/ui/jetpack-compose';

export default function ContainedLoadingIndicatorExample() {
  return (
    <Host matchContents>
      <ContainedLoadingIndicator />
    </Host>
  );
}
```

也可以并排展示两种不确定进度指示器。`Row` 的 `horizontalArrangement` 设置 16 dp 的水平间隔：

```tsx
import {
  ContainedLoadingIndicator,
  Host,
  LoadingIndicator,
  Row,
} from '@expo/ui/jetpack-compose';

export default function IndeterminateExample() {
  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 16 }}>
        <LoadingIndicator />
        <ContainedLoadingIndicator />
      </Row>
    </Host>
  );
}
```

## 已知进度：determinate

当任务有可计算进度时，将 Expo UI 的 `useNativeState` 返回值传给 `progress`。值范围是 0 到 1：0 表示尚未完成，1 表示完成。示例每 500 毫秒增加 0.05，并用取余让演示循环：

```tsx
import {
  ContainedLoadingIndicator,
  Host,
  LoadingIndicator,
  Row,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { useEffect } from 'react';

export default function DeterminateExample() {
  const progress = useNativeState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      progress.value = (progress.value + 0.05) % 1;
    }, 500);
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 16 }}>
        <LoadingIndicator progress={progress} />
        <ContainedLoadingIndicator progress={progress} />
      </Row>
    </Host>
  );
}
```

这里的 `setInterval` 是循环演示，不适合直接作为真实上传或下载状态。实际场景应将网络 / 文件任务提供的真实完成比例写入 `progress.value`，成功时设置为 1；组件卸载后清理计时器。

## API 属性

```tsx
import {
  LoadingIndicator,
  ContainedLoadingIndicator,
} from '@expo/ui/jetpack-compose';
```

| 组件 / 属性 | 类型 | 说明 |
| --- | --- | --- |
| `LoadingIndicator` | React 组件 | 以变形图形表现加载状态。 |
| `ContainedLoadingIndicator` | React 组件 | 容器背景中的加载指示器。 |
| `color` | `ColorValue`，可选 | 指示器颜色，两种组件共享。 |
| `modifiers` | `ModifierConfig[]`，可选 | 应用于组件的 Compose 修饰器。 |
| `progress` | `ObservableState<number \| null>`，可选 | 进度状态。用 `useNativeState(0)` 创建；省略时为不确定进度。 |
| `containerColor` | `ColorValue`，可选 | `ContainedLoadingIndicator` 背景容器颜色。 |

## `ObservableState` 和 JS / 原生状态同步

`useNativeState(initialValue)` 创建的 `ObservableState` 可以让 JavaScript 组件和 Expo UI 的原生视图共享状态。`.value` 读取或写入当前值；从 JS 线程写入会异步排入 UI 线程，不能假定赋值后立即读到更新值。需要适配 React Compiler 时，文档提供 `.get()` / `.set(value)` 作为 `.value` 的替代读写方式。

官方页面也给出原生 UI runtime 上的变化监听示例。监听回调必须是 worklet，才能在 UI 线程同步执行；属性只有一个 listener，赋值会替换旧 listener：

```tsx
const state = useNativeState(0);

useEffect(() => {
  state.onChange = value => {
    'worklet';
    console.log('changed to', value);
  };
}, []);
```

`onChange` 初始值不会触发监听；官方类型说明建议在组件清理时将其设为 `null`，避免已卸载组件留下 listener。不要在此 UI worklet 里调用只能从普通 JS 线程运行的任意代码。

## 关键名词

- **确定进度 / Determinate**：可以报告任务已完成比例的状态，值介于 0 和 1。
- **不确定进度 / Indeterminate**：只有“仍在处理”这一信息，无法可靠计算百分比，因此省略 `progress`。
- **`ObservableState`**：在 JS 与原生 UI 间同步的共享状态对象。它不是普通 React `useState`；读写的线程与同步时机不同。
- **UI runtime / UI 线程**：原生界面动画和交互运行的环境。由 worklet 标记的代码可在该运行时执行。
- **Worklet**：可被 Reanimated / Expo UI 的 UI runtime 执行的函数；示例中的 `'worklet'` 指令用于标记监听回调。
- **dp**：Android 密度无关布局单位；Row 示例以 dp 指定间隔。
- **Host**：Expo UI 的原生视图承载容器，本组件必须位于 Host 提供的原生子树内。

## 官方代码主题覆盖

保留官方安装命令和全部四类用法：独立 LoadingIndicator、独立 ContainedLoadingIndicator、两者并排的不确定状态、以 `useNativeState` 和定时器展示确定进度。API 覆盖组件导入、共享 `color` / `modifiers` / `progress`、容器专属 `containerColor`，并解释 ObservableState 文档属性和 worklet 监听器。

## 下一页

Latest 文档页脚 **Next** 指向 [Jetpack Compose Material Colors](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/colors/)，介绍 Material 3 调色板及读取主题颜色的方法。

**翻页：**[上一页：Jetpack Compose ListItem](./041-Jetpack-Compose-ListItem.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Material Colors](./043-Jetpack-Compose-Material-Colors.md)
