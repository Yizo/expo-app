# 048｜Jetpack Compose PullToRefreshBox

**翻页：**[上一页：Jetpack Compose Progress indicators](./047-Jetpack-Compose-Progress-Indicators.md) · [目录](./README.md) · [下一页：Jetpack Compose RadioButton](./049-Jetpack-Compose-RadioButton.md)

**官方页面：**[Jetpack Compose PullToRefreshBox · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/pulltorefreshbox/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.12`；[SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/pulltorefreshbox/)推荐 `~56.0.26`，并包含下拉刷新和 indicator 配色用法。跨平台列表场景也可看 Expo UI 通用 `List`，它在 Android 底层由 PullToRefreshBox 提供刷新手势。

## 包裹可滚动内容的下拉刷新容器

`PullToRefreshBox` 包住 LazyColumn 等可滚动内容。用户在列表顶端下拉时，它显示 Material 3 刷新指示器并调用 `onRefresh`。业务通过 `isRefreshing` 告诉组件“请求正在进行 / 已结束”，所以它是一个受控刷新状态。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基础下拉刷新

示例用 React state 表示刷新状态，开始刷新时置为 true，2 秒后置为 false；`LazyColumn` 里放五个 ListItem：

```tsx
import { useState, useCallback } from 'react';
import {
  Host,
  PullToRefreshBox,
  LazyColumn,
  ListItem,
  Text,
} from '@expo/ui/jetpack-compose';

export default function BasicPullToRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <Host style={{ height: 400 }}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={onRefresh}>
        <LazyColumn>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 1</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 2</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 3</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 4</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 5</Text>
            </ListItem.HeadlineContent>
          </ListItem>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
```

这里的计时器只是演示等待。真实业务应在数据刷新 Promise / 请求 `finally` 中把 `refreshing` 恢复为 false，并在请求失败时显示错误状态。Host 给出 400 高度，让纵向滚动容器有确定可视区域。

## 自定义刷新指示器的颜色

`indicator` 属性可以分别设置动画前景颜色和指示器容器颜色：

```tsx
import { useState, useCallback } from 'react';
import {
  Host,
  PullToRefreshBox,
  LazyColumn,
  ListItem,
  Text,
} from '@expo/ui/jetpack-compose';

export default function CustomIndicatorColors() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <Host style={{ height: 400 }}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={onRefresh}
        indicator={{ color: '#6200EE', containerColor: '#F5F5F5' }}>
        <LazyColumn>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 1</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 2</Text>
            </ListItem.HeadlineContent>
          </ListItem>
          <ListItem>
            <ListItem.HeadlineContent>
              <Text>Item 3</Text>
            </ListItem.HeadlineContent>
          </ListItem>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
```

## API 属性

```tsx
import { PullToRefreshBox } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 要支持刷新的内容，通常是滚动容器。 |
| `contentAlignment` | `ContentAlignment`，默认 `topStart` | 内容在 Box 内的对齐方式。 |
| `indicator` | `PullToRefreshIndicatorProps`，可选 | 配置刷新期间展示的指示器。 |
| `isRefreshing` | `boolean`，默认 `false` | 当前刷新状态，需由应用状态管理。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `onRefresh` | `() => void`，可选 | 用户下拉触发刷新时的回调。 |

最新使用示例展示的 indicator 配置包含 `color` 与 `containerColor`；SDK 56 页面上的其他 API 字段保持相同。

## 关键名词

- **Pull to refresh**：手指把列表向下拖动以请求刷新，常用于移动端列表顶部。
- **受控刷新状态**：用户手势触发 `onRefresh`，但“刷新是否仍在进行”由外部 `isRefreshing` 决定。
- **LazyColumn**：Jetpack Compose 的纵向滚动列表组件。Expo UI 说明其 JS 侧节点仍由 React 创建，不能把它等同于 FlashList 的完整 JS 虚拟化。
- **指示器容器 / Indicator container**：刷新动画外部的底色区域；`indicator.color` 和 `containerColor` 分别控制前景与容器。
- **回调 / Callback**：组件在用户交互发生时调用的函数；本例中 onRefresh 内启动异步刷新逻辑。
- **Expo UI 通用 List**：跨平台列表组件；Expo 文档指出 Android 平台底层基于 PullToRefreshBox 实现下拉刷新。

## 官方代码主题覆盖

保留安装命令和两个官方代码示例：带五个条目的基础刷新列表、设置紫色指示器和浅灰容器的自定义配色列表。API 表列出内容、对齐、indicator、受控刷新状态、modifiers、刷新回调六个属性，并解释示例定时器只是占位。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose RadioButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/radiobutton/)，介绍 Material 3 单选按钮。

**翻页：**[上一页：Jetpack Compose Progress indicators](./047-Jetpack-Compose-Progress-Indicators.md) · [返回目录](./README.md) · [下一页：Jetpack Compose RadioButton](./049-Jetpack-Compose-RadioButton.md)
