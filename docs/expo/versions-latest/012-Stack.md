# 012｜Expo Router Stack

**翻页：**[上一页：Expo Router Split View](./011-Split-View.md) · [目录](./README.md) · [下一页：Expo Router UI](./013-Expo-Router-UI.md)

**官方页面：**[Expo Router Stack](https://docs.expo.dev/versions/latest/sdk/router/stack/)

**版本边界：**Latest reference 推荐 Expo Router ~57.0.22；SDK v56 exact reference 推荐 ~56.2.21。Stack navigator、Header、Screen、SearchBar、Title 和 Toolbar 示例都可在 [SDK v56 Stack reference](https://docs.expo.dev/versions/v56.0.0/sdk/router/stack/) 找到。Latest 还标有部分 iOS26 属性；它们同时要求相应 iOS 系统能力，不能仅凭 JS 依赖版本判断。

## Stack 导航基础

Stack（堆栈）把 screen 按打开顺序放在一条导航历史里，通常以 push / 返回的方式浏览。Expo Router 从文件系统生成 route；在布局中渲染一个 Stack 就会为该目录提供原生 stack navigator：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

可在 Stack.Screen 上按 route 设置选项和事件。选项可直接给对象，也可以在 layout 里用 route 算出；函数形式仅支持 layout 场景：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ route }) => ({ title: route.name })}
      />
      <Stack.Screen name="details" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

Stack.Screen 也暴露初始参数、事件监听、redirect、getId（给 screen 实例确定唯一 id）和复用现有 screen 的导航选项等。initialParams、listeners、redirect 在 Layout 中使用；options 不应把 Router route 结构误当作 Web URL history。

## Header、SearchBar 与 Title

Stack.Header 可调整标准 header 的背景、文字 tint、阴影和透明叠层；iOS 可指定 blurEffect。将 asChild 设为 true 时可用自己的 React 组件接管 header：

```tsx
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export function CustomHeader() {
  return (
    <>
      <Stack.Header style={{ backgroundColor: '#20242a', color: 'white' }} />
      <View><Text>Screen content</Text></View>
    </>
  );
}
```

Stack.SearchBar 把系统 search bar 放进 stack header；使用后 header 会自动显示。搜索文本从 native event 取值：

```tsx
import { Stack } from 'expo-router';

export function SearchScreen() {
  return (
    <>
      <Stack.SearchBar
        placeholder="Search notes"
        onChangeText={(event) => {
          const query = event.nativeEvent.text;
          console.log(query);
        }}
      />
      <ScreenContent />
    </>
  );
}
```

Stack.Title 可放 layout 的 Stack.Screen 内，或直接放在页面里；title 可以是文字，也可用 asChild 指定自定义组件。large / largeStyle 是 iOS large title：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index">
        <Stack.Title large>Notes</Stack.Title>
      </Stack.Screen>
      <Stack.Screen name="details">
        <Stack.Title asChild><CustomTitle /></Stack.Title>
      </Stack.Screen>
    </Stack>
  );
}
```

## BackButton 和 Toolbar

Stack.Screen.BackButton 可以设置返回标题、系统 display mode、自定义图片或隐藏按钮；iOS 还支持长按 menu。

Stack.Toolbar 当前标注为 Experimental：可放 Stack header 左侧、右侧或底部。左 / 右 placement 应在 Layout 的 Stack.Screen 内配置；底部 placement 放 page component。下面示例覆盖标题、返回按钮、左右 toolbar、Menu、MenuAction、SF Symbol、Label 与 Badge 等源页代码主题：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index">
        <Stack.Title>Saved notes</Stack.Title>
        <Stack.Screen.BackButton displayMode="minimal">Back</Stack.Screen.BackButton>

        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon="sidebar.left"
            accessibilityLabel="Open sidebar"
            onPress={() => console.log('toggle sidebar')}
          />
        </Stack.Toolbar>

        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu>
            <Stack.Toolbar.Icon sf="ellipsis.circle" />
            <Stack.Toolbar.Label>Options</Stack.Toolbar.Label>
            <Stack.Toolbar.MenuAction onPress={() => console.log('refresh')}>
              Refresh
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      </Stack.Screen>
    </Stack>
  );
}
```

Stack.Toolbar.Button 既可以把 icon 与 onPress 直接传给 button，也可以组合组件 children；这些子组件还可显示文字和 badge：

```tsx
import { Stack } from 'expo-router';

export function DetailScreen() {
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => console.log('favorite')}>
          <Stack.Toolbar.Icon sf="star.fill" />
          <Stack.Toolbar.Label>Favorite</Stack.Toolbar.Label>
          <Stack.Toolbar.Badge>3</Stack.Toolbar.Badge>
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Toolbar>
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button icon="square.and.pencil" onPress={() => {}} />
      </Stack.Toolbar>
      <ScreenContent />
    </>
  );
}
```

底部工具栏可配 SearchBarSlot、Spacer、Button、Menu、View；Stack.Toolbar.View 的 asChild 可让自定义子组件接管 toolbar 槽位。asChild 也能把左 / 右 header 区域替换为自定义组件。Spacer 在左 / 右 placement 需要指定宽度；Android 各 placement 都要求 width，底部不指定则在 iOS 可填充剩余空间。

## API 和平台支持要点

| API | 常见用途 | 平台 / 版本差异 |
| --- | --- | --- |
| Stack | 创建 native stack navigator | Android、iOS、tvOS、Web |
| Stack.Header | 标题栏样式、透明、blur、custom header | 基础属性跨平台；blurEffect 与 largeStyle 为 iOS |
| Stack.Screen | 每个 route 的 options、params、listeners、redirect | route screen options；函数 options 只在 Layout |
| Stack.SearchBar | 头部系统搜索栏 | 会自动显示 header；iOS26+ 可放到底部 Toolbar slot |
| Stack.Title | 标题 / large title / 自定义 title | large title 为 iOS |
| Stack.Screen.BackButton | 返回按钮标题、显示模式、图像与显隐 | 多数跨平台；displayMode / withMenu 为 iOS |
| Stack.Toolbar | 左 / 右 header 操作或底部 toolbar | 实验性；Android / iOS 支持特性不同 |

Toolbar 中常用子组件及差异：

- Button：按钮操作、icon、onPress、selected、tintColor、disabled / hidden、iOS variant。
- Icon：支持图像资源；iOS 还支持 SF Symbol 或 xcassets。Android toolbar root menu action 只显示图像资源。
- Label / Badge：显示标题和短文本角标；Button children 方式可组合三者。
- Menu / MenuAction：显示菜单和具体操作；可设 destructive、disabled、hidden、selected、subtitle 与 accessibility。
- SearchBarSlot：把 SearchBar 接到底部栏；只有 iOS26+ 的部分共用背景选项可配置。
- Spacer：分隔并对齐 toolbar 内容；可设宽度和 hidden。
- View：放自定义 toolbar 内容，可配置背景、显隐、共享背景等。

Android 图片 icon 默认 tint；iOS 图像 icon 在有 tint 时默认 template，没 tint 时默认 original。iOS26+ 还新增部分 hidesSharedBackground、separateBackground 和底部 shared background 行为，使用前要确认系统版本。

## 关键名词

- **Native stack**：平台级 screen 导航栈，负责 push / pop、系统 header 和返回手势。
- **Stack.Screen**：声明单条 Router route 的 header、导航行为和监听器。
- **asChild**：用自定义 React component 替换 Expo 默认 header / toolbar wrapper。
- **SF Symbol / xcassets**：iOS 系统图标名称和 Xcode 资源目录。
- **IME padding**：Android 键盘弹出时底部 toolbar 预留的输入法空间。
- **Experimental**：Toolbar API 还可能变化；请以当前 SDK 文档确认可用属性。

## 官方代码主题覆盖

已覆盖源页各类组件和示例代码主题：导入并渲染 Stack；Header 样式、blur、透明和 custom asChild；Stack.Screen name / options / route callback / redirect / listeners 等配置；SearchBar placeholder 与原生文本 event；Title 字符串、large 和自定义 component；BackButton displayMode / hidden；Toolbar 左右 / bottom placement、Button callback、两种 children 写法、Icon、Label、Badge、Menu、MenuAction、SearchBarSlot、Spacer、View / asChild；图像 / SF Symbol / xcassets 及不同平台限制。Latest 推荐版本与 v56 推荐版本已并列注明。

## 下一页

页脚 **Next** 指向 [Expo Router UI](https://docs.expo.dev/versions/latest/sdk/router/ui/)，介绍自定义 tab layout 使用的无头 Tabs、TabList、TabTrigger、TabSlot 与相关 Hooks。

**翻页：**[上一页：Expo Router Split View](./011-Split-View.md) · [返回目录](./README.md) · [下一页：Expo Router UI](./013-Expo-Router-UI.md)
