# 035｜Jetpack Compose HorizontalPager（next SDK）

**翻页：**[上一页：Jetpack Compose HorizontalFloatingToolbar（next SDK）](./034-Jetpack-Compose-HorizontalFloatingToolbar.md) · [目录](./README.md) · [下一页：Jetpack Compose Host（next SDK）](./036-Jetpack-Compose-Host.md)

**官方页面：**[HorizontalPager · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalpager/)

**版本边界：**此页沿 Expo unversioned / next SDK 分支继续。稳定 Latest（SDK57）推荐 @expo/ui ~57.0.18，SDK v56 精确参考推荐 ~56.0.26；本地应用是 SDK56，应按其包版本确认各 API。Latest 页新增 onDragInteraction、onPageScroll、onScrollInProgressChange 等事件，旧版包可能不支持。

## HorizontalPager 的布局基础

HorizontalPager 是水平翻页控件，手势会吸附到单独页面。它不会自己推断高度，父 Host 必须提供有限高度；一般使用 height modifier，宽度则填满父容器。

控件有两种页码概念：

- **currentPage**：此刻最接近吸附位置的一页，用户滑动时可能提前变化。
- **settledPage**：滑动和吸附动画结束后真正停留的一页。

## 非受控滑动

pager 在 Compose 内维护滚动位置。initialPage 只指定首次挂载页，页面滑动时可分别监听实时页码和落定页码：

```tsx
import { useState } from 'react';
import {
  Box,
  Column,
  Host,
  HorizontalPager,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  background,
  fillMaxSize,
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';

function Page({ label, color }: { label: string; color: string }) {
  return (
    <Box modifiers={[fillMaxSize(), background(color)]} contentAlignment="center">
      <Text color="#FFFFFF">{label}</Text>
    </Box>
  );
}

export default function UncontrolledPager() {
  const colors = useMaterialColors();
  const [currentPage, setCurrentPage] = useState(1);
  const [settledPage, setSettledPage] = useState(1);

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
        <Text color={colors.onBackground}>
          currentPage: {currentPage} · settledPage: {settledPage}
        </Text>
        <HorizontalPager
          initialPage={1}
          onCurrentPageChange={setCurrentPage}
          onSettledPageChange={setSettledPage}
          modifiers={[fillMaxWidth(), height(240)]}>
          <Page label="Page 1" color="#6200EE" />
          <Page label="Page 2" color="#03DAC5" />
          <Page label="Page 3" color="#FF5722" />
        </HorizontalPager>
      </Column>
    </Host>
  );
}
```

## 用 ref 编程式翻页

HorizontalPagerHandle 提供 animateScrollToPage（动画滚动）和 scrollToPage（瞬间跳转）。点击按钮导航时需要限制页码范围，防止超过第一页或最后一页：

```tsx
import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Column,
  Host,
  HorizontalPager,
  type HorizontalPagerHandle,
  Row,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  background,
  fillMaxSize,
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';

const pageColors = ['#6200EE', '#03DAC5', '#FF5722', '#4CAF50', '#2196F3'];

function PagerPage({ title, color }: { title: string; color: string }) {
  return (
    <Box modifiers={[fillMaxSize(), background(color)]} contentAlignment="center">
      <Text color="#FFFFFF">{title}</Text>
    </Box>
  );
}

export function PagerWithControls() {
  const pagerRef = useRef<HorizontalPagerHandle>(null);
  const [page, setPage] = useState(0);

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Column verticalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]}>
        <Text>第 {page + 1} 页 / 共 {pageColors.length} 页</Text>
        <HorizontalPager
          ref={pagerRef}
          onSettledPageChange={setPage}
          modifiers={[fillMaxWidth(), height(200)]}>
          {pageColors.map((color, index) => (
            <PagerPage key={index} title={'Page ' + (index + 1)} color={color} />
          ))}
        </HorizontalPager>
        <Row horizontalArrangement={{ spacedBy: 8 }}>
          <Button
            onClick={() =>
              pagerRef.current?.animateScrollToPage(Math.max(0, page - 1))
            }>
            <Text>上一页</Text>
          </Button>
          <Button
            onClick={() =>
              pagerRef.current?.animateScrollToPage(
                Math.min(pageColors.length - 1, page + 1)
              )
            }>
            <Text>下一页</Text>
          </Button>
          <Button onClick={() => pagerRef.current?.scrollToPage(0)}>
            <Text>跳到首页</Text>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}
```

## 页面间距与预览相邻页

pageSpacing 在页与页之间留出空隙；contentPadding 在 pager 可视窗口两侧留白，能够让用户在停稳时看到前后页面的边缘：

```tsx
import { Box, Host, HorizontalPager, Text } from '@expo/ui/jetpack-compose';
import {
  background,
  fillMaxSize,
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';

function PreviewPage({ title, color }: { title: string; color: string }) {
  return (
    <Box modifiers={[fillMaxSize(), background(color)]} contentAlignment="center">
      <Text color="#FFFFFF">{title}</Text>
    </Box>
  );
}

export function PagerWithPeek() {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalPager
        pageSpacing={12}
        contentPadding={{ start: 32, end: 32 }}
        modifiers={[fillMaxWidth(), height(180)]}>
        <PreviewPage title="Page 1" color="#6200EE" />
        <PreviewPage title="Page 2" color="#03DAC5" />
        <PreviewPage title="Page 3" color="#FF5722" />
      </HorizontalPager>
    </Host>
  );
}
```

## API 属性

| 属性 | 默认 / 含义 |
| --- | --- |
| initialPage | 首次挂载的页码，默认 0；之后改变它不会自动重置 pager。 |
| children | 依次渲染的每个页面。 |
| onCurrentPageChange | 最近吸附页变化时触发，可能在手指仍滑动时调用。 |
| onSettledPageChange | 用户手势 / 动画结束且页面落定后触发。 |
| pageSpacing | 页面之间的 dp 间距，默认 0。 |
| contentPadding | pager 两侧留白，可给 dp 数值或各边 padding 对象。 |
| beyondViewportPageCount | 可视区域之外预先组合 / 保留的页面数，默认 0。 |
| userScrollEnabled | 是否允许手势滑动，默认 true。 |
| reverseLayout | 是否反向排列页面，默认 false。 |
| modifiers | Compose ModifierConfig[]。 |
| ref | HorizontalPagerHandle 的 imperative ref。 |
| onScrollInProgressChange | 滚动 / 动画开始或结束时收到 boolean。 |
| onDragInteraction | 接收 start、stop 或 cancel 拖动事件。 |
| onPageScroll | 滑动期间不断收到 currentPage 与 offset fraction。 |

onPageScroll 的 currentPageOffsetFraction 是当前页相对吸附位置的有符号距离，约在 -0.5 到 0.5 之间。callback 用 worklet 标记时会在 UI thread 同步运行，否则作为一般 JS event 异步传递。

HorizontalPagerHandle 提供两个异步方法：

| 方法 | 行为 |
| --- | --- |
| animateScrollToPage(page) | 动画滚动到目标页，结束后 Promise 完成。 |
| scrollToPage(page) | 不播放动画，直接跳到目标页。 |

PaddingValuesRecord 可用 bottom、end、start、top 表达每边 dp padding。HorizontalPagerDragInteraction 的值是 start、stop、cancel。

## 关键名词

- **Pager**：可横向滑动、停下后吸附在独立页面的容器。
- **currentPage**：在拖动期间随吸附目标变化的当前页。
- **settledPage**：手势 / 动画稳定结束后的页码。
- **initialPage**：pager 第一次 mount 时的页码，不是持续受控的 React prop。
- **HorizontalPagerHandle**：用于命令式翻页的 ref API。
- **Page spacing / content padding**：页面缝隙和整个 pager 两侧留白。
- **Offset fraction**：滑动页相对当前吸附位置的比例进度。

## 官方代码主题覆盖

源页代码主题已逐项重写：@expo/ui 安装与 bare RN app 前置条件、非受控滑动及 current / settled 回调、ref + 上一页 / 下一页 / 首页按钮、pageSpacing / contentPadding 的 peek 页面布局。API 的 viewport 额外保留页数、reverseLayout、userScrollEnabled、拖动 / 滑动 / worklet callback、HorizontalPagerHandle 两个方法、PaddingValuesRecord 与 DragInteraction 状态也已总结。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Host](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/host/)，介绍连接 React Native 和 Jetpack Compose 的根容器及内容测量边界。

**翻页：**[上一页：Jetpack Compose HorizontalFloatingToolbar（next SDK）](./034-Jetpack-Compose-HorizontalFloatingToolbar.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Host（next SDK）](./036-Jetpack-Compose-Host.md)
