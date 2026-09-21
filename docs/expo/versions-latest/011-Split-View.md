# 011｜Expo Router Split View

**翻页：**[上一页：Expo Router Native Tabs](./010-Native-Tabs.md) · [目录](./README.md) · [下一页：Expo Router Stack](./012-Stack.md)

**官方页面：**[Expo Router Split View](https://docs.expo.dev/versions/latest/sdk/router/split-view/)

**版本边界：**Latest 页面访问时推荐 Expo Router `~57.0.22`。同一 API 在 [SDK v56 reference](https://docs.expo.dev/versions/v56.0.0/sdk/router/split-view/) 仍有记录，v56 页推荐 `~56.2.19`；本地应用应由当前 SDK 与安装版本决定，不要为抄 Latest 示例单独升级。`SplitView` 是 SDK55+ 的 alpha API，并通过 `expo-router/unstable-split-view` 导出。

## 它适合什么界面

Split View 是面向大屏的分栏布局：左侧可放分类或列表，中间显示所选内容，右侧 inspector 显示补充细节。与 Web 的固定 CSS grid 不同，它组合平台导航能力；iPad 能并排显示列，iPhone 会折叠成一个可前后浏览的列。它目前只在 iOS 使用；其他平台会回退成普通 `Slot` navigator。

组件必须位于 Router 根布局层，导航树里不能嵌套另一个 SplitView。直接 children 只能是 `SplitView.Column` 与 `SplitView.Inspector`；每列 header 当前不可自定义。

## 根布局与两列

两个 `Column` 代表分栏前置的导航列，主路由内容由当前路由提供。以下片段用 inbox / sent 作为侧栏 route：

```tsx
import { Link } from 'expo-router';
import { SplitView } from 'expo-router/unstable-split-view';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

export default function RootLayout() {
  return (
    <SplitView>
      <SplitView.Column>
        <SafeAreaView edges={{ top: true, left: true }} style={{ flex: 1 }}>
          <Link href="/inbox"><Text>Inbox</Text></Link>
          <Link href="/sent"><Text>Sent</Text></Link>
        </SafeAreaView>
      </SplitView.Column>
    </SplitView>
  );
}
```

需要第三层分类时，可新增第二个 `SplitView.Column`，并用 route / search params 表示当前选择。以下示例展示三层的分类状态：

```tsx
import { Link, useGlobalSearchParams } from 'expo-router';
import { SplitView } from 'expo-router/unstable-split-view';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

export default function RootLayout() {
  const { section } = useGlobalSearchParams<{ section?: string }>();

  return (
    <SplitView>
      <SplitView.Column>
        <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
          <Link href="/?section=inbox"><Text>Inbox</Text></Link>
          <Link href="/?section=sent"><Text>Sent</Text></Link>
        </SafeAreaView>
      </SplitView.Column>
      <SplitView.Column>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Text>当前分类：{section ?? 'inbox'}</Text>
          <Link href="/inbox/item-1"><Text>打开第一条</Text></Link>
        </SafeAreaView>
      </SplitView.Column>
    </SplitView>
  );
}
```

屏幕窄时可指定折叠后默认显示哪列，也能通过 ref 请求展示某一列：

```tsx
import { useRef } from 'react';
import { Button } from 'react-native';
import { SplitView } from 'expo-router/unstable-split-view';
import type { SplitHostCommands } from 'react-native-screens/experimental';

export default function RootLayout() {
  const splitRef = useRef<SplitHostCommands>(null);

  return (
    <SplitView ref={splitRef} topColumnForCollapsing="primary">
      <SplitView.Column>
        <Button title="显示内容列" onPress={() => splitRef.current?.show('secondary')} />
      </SplitView.Column>
    </SplitView>
  );
}
```

`topColumnForCollapsing` 可设 `primary`、`supplementary`、`secondary`。`.show()` 需要 `react-native-screens 4.24.0` 或更高版本；实际使用前检查 v56 SDK 锁定的库版本。

## Inspector 与动态路由

`Inspector` 是从界面 trailing edge 推入的详情面板，适合元数据或选中项详情；Latest reference 将它标为 iOS 26 及以上：

```tsx
import { SplitView } from 'expo-router/unstable-split-view';
import { Text, View } from 'react-native';

export function ThreePaneLayout() {
  return (
    <SplitView showInspector>
      <SplitView.Column><Text>分类</Text></SplitView.Column>
      <SplitView.Column><Text>条目列表</Text></SplitView.Column>
      <SplitView.Inspector>
        <View style={{ flex: 1, padding: 16 }}><Text>所选条目详情</Text></View>
      </SplitView.Inspector>
    </SplitView>
  );
}
```

官方完整示例还组合文件路由、`Redirect`、分类动态段、详情动态段和 search params。等价的最小文件关系：

```text
app/
  _layout.tsx
  index.tsx
  [category]/
    index.tsx
    [id].tsx
```

下面的列表片段覆盖完整示例里的分类过滤、动态 detail route 和选中项样式。它将 category / id 作为 route 参数驱动 UI；实际项目可将数组换成从数据层读出的记录：

```tsx
import { Link, useGlobalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';

const passkeys = ['GitHub', 'Google'];
const security = ['Admin', 'Root'];
const all = [...passkeys, ...security];

export function EntryList() {
  const { category, id } = useGlobalSearchParams<{ category?: string; id?: string }>();
  const entries = category === 'passkeys' ? passkeys : category === 'security' ? security : all;

  return (
    <ScrollView>
      {entries.map((entry) => {
        const isSelected = id === entry;
        const routeCategory = category ?? 'all';
        return (
          <Link key={entry} href={'/' + routeCategory + '/' + encodeURIComponent(entry)} asChild>
            <Pressable style={{ padding: 12, backgroundColor: isSelected ? '#2563eb' : 'transparent' }}>
              <Text style={{ color: isSelected ? 'white' : 'black' }}>{entry}</Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}
```

```tsx
// app/index.tsx：入口跳到默认分类
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/inbox/" />;
}
```

```tsx
// app/[category]/[id].tsx：动态路由参数决定详情页内容
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function Detail() {
  const { category, id } = useLocalSearchParams<{ category: string; id: string }>();
  return <View><Text>{category}: {id}</Text></View>;
}
```

SDK v56 精确页确认 SplitView / Column / Inspector、响应式折叠、ref 导航及动态路由示例都存在。Latest 完整示例中的 `expo-router` `Color` iOS 颜色 token 不能由 v56 Router reference 确认，所以以上代码用 React Native 普通颜色与文本代替；不要把那个 token 当作 v56 可用 API。

## 关键名词

- **Split View**：在宽屏上并列展示多个路由区域、窄屏上折叠导航的原生多栏界面。
- **Column**：作为侧栏 / 中间列表的前置导航列；主内容仍来自当前 Router route。
- **Inspector**：附加详情列；平台和 iOS 版本支持有要求。
- **Slot**：Expo Router 把匹配到的子 route 放入布局位置的出口；在非 iOS 端可作为回退导航容器。
- **Alpha / unstable submodule**：接口仍可能变化；npm 参考版本与 SDK 配套依赖必须匹配。

## 官方代码主题覆盖

已逐主题改写源页代码：SplitView 与 `topColumnForCollapsing`；ref / `show` API；`SafeAreaView` + Router Link 两栏 sidebar；search params 驱动的三列分类；`Inspector` 与 `showInspector`；动态路由目录、`Redirect`、动态参数 screen、普通样式与 list selection 状态。代码以 v56 也存在的 API 为主，Latest 推荐包版本及 Inspector iOS 26 要求已显式注明。

## 下一页

页脚 **Next** 指向 [Expo Router Stack](https://docs.expo.dev/versions/latest/sdk/router/stack/)，列出原生 Stack 导航、screen 与 header / toolbar 组件。

**翻页：**[上一页：Expo Router Native Tabs](./010-Native-Tabs.md) · [返回目录](./README.md) · [下一页：Expo Router Stack](./012-Stack.md)
