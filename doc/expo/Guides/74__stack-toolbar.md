# Stack Toolbar（堆栈工具栏）

> **原始文档地址**：https://docs.expo.dev/router/advanced/stack-toolbar

---

> **Alpha API 警告**：`Stack.Toolbar` 目前属于 Alpha（内测）阶段的 API，仅在 **Expo SDK 56 及以上版本的 Android** 和 **Expo SDK 55 及以上版本的 iOS** 上可用。该 API 仍可能发生重大变更（breaking changes），请勿在生产环境中盲目依赖其当前行为。

---

## 概述

`Stack.Toolbar` 是 Expo Router 提供的一项功能，允许你在 Stack 导航的屏幕中添加**原生工具栏项**（native toolbar items）。你可以在**头部工具栏**（header）或**底部工具栏**（bottom toolbar）中放置按钮、菜单和自定义视图。

**关键术语解释（面向初学者）**：

- **Stack 导航**：一种页面导航模式，新页面会"推入"（push）到页面栈的顶部，旧页面被压在下方，用户可以通过"返回"（pop）回到上一个页面。类似于把盘子一个个叠起来。
- **Toolbar（工具栏）**：屏幕上用于放置操作按钮的区域。头部工具栏位于屏幕顶部（导航栏区域），底部工具栏位于屏幕底部。
- **原生（Native）**：指使用 iOS/Android 系统自带的 UI 组件来渲染，而非用 JavaScript 模拟。原生组件通常性能更好、外观更符合平台规范。
- **SF Symbols**：Apple 提供的内置图标库，包含数千个矢量图标，仅可用于 iOS 平台。
- **Material Symbols**：Google 提供的图标库，适用于 Android 平台。

> **基于文档内容推导**：该功能的核心设计理念是让开发者能够在 Expo Router 的 Stack 导航中直接使用平台原生工具栏，而不需要手动通过 `react-native-screens` 或其他底层 API 来配置。这大幅降低了使用原生导航栏按钮的门槛。

---

## 目录

1. [添加头部按钮](#添加头部按钮)
2. [图标系统](#图标系统)
3. [构建操作菜单](#构建操作菜单)
4. [使用底部工具栏](#使用底部工具栏)
5. [间隔器（Spacer）](#间隔器spacer)
6. [为按钮添加角标 Badge（仅 iOS）](#为按钮添加角标-badge仅-ios)
7. [嵌入自定义视图](#嵌入自定义视图)
8. [动态显示与隐藏工具栏项](#动态显示与隐藏工具栏项)
9. [常见问题](#常见问题)
10. [已知限制](#已知限制)

---

## 添加头部按钮

要在头部添加工具栏按钮，需将 `Stack.Toolbar.Button` 放置在 `Stack.Toolbar` 内部，并通过 `placement` 属性指定按钮位于左侧（`left`）还是右侧（`right`）。这非常适合分享、收藏等操作。

### Android 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, Alert } from 'react-native';

export default function NoteScreen() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          // 替换为你自己的图标资源
          icon={isFavorite ? require('./assets/star-filled.png') : require('./assets/star.png')}
          onPress={() => setIsFavorite(!isFavorite)}
        />
        <Stack.Toolbar.Button
          icon={require('./assets/share.png')}
          onPress={() => Alert.alert('Share')}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={require('./assets/sidebar.png')}
          onPress={() => Alert.alert('Sidebar')}
        />
      </Stack.Toolbar>

      <View style={{ flex: 1, padding: 16 }}>
        <Text>Note content...</Text>
      </View>
    </>
  );
}
```

**要点说明**：
- Android 平台的 `icon` 属性接收**图片资源**（通过 `require` 引入本地图片）。
- `placement="right"` 将按钮放在工具栏右侧，`placement="left"` 放在左侧。
- 使用 `useState` 管理收藏状态，点击按钮时切换图标。

### iOS 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, Alert } from 'react-native';

export default function NoteScreen() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={isFavorite ? 'star.fill' : 'star'}
          onPress={() => setIsFavorite(!isFavorite)}
        />
        <Stack.Toolbar.Button icon="square.and.arrow.up" onPress={() => Alert.alert('Share')} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="sidebar.left" onPress={() => Alert.alert('Sidebar')} />
      </Stack.Toolbar>

      <View style={{ flex: 1, padding: 16 }}>
        <Text>Note content...</Text>
      </View>
    </>
  );
}
```

**要点说明**：
- iOS 平台的 `icon` 属性可以直接传入 **SF Symbols 名称字符串**（如 `'star.fill'`、`'square.and.arrow.up'`），无需引入图片资源。
- 这与 Android 使用 `require('./assets/xxx.png')` 的方式形成鲜明对比。

> **基于经验建议**：在实际项目中，建议为 Android 和 iOS 分别准备图标资源，或使用下文介绍的跨平台方案（`process.env.EXPO_OS` 条件判断），避免在运行时出现图标缺失的问题。

---

## 图标系统

按钮在不同平台上接受不同类型的图标：iOS 上支持 SF Symbols，两个平台都支持自定义图片。

### SF Symbols（仅 iOS）

Apple 的内置图标库是 iOS 平台上最简单的方案。直接将图标名称字符串传入 `icon` 属性即可。

> **基于经验建议**：你可以在 Apple 官方提供的 **SF Symbols App**（可从 Mac App Store 免费下载）中浏览和搜索所有可用图标。这对开发者选择合适的图标非常有帮助。

```tsx
<Stack.Toolbar.Button icon="star.fill" onPress={() => {}} />
<Stack.Toolbar.Button icon="square.and.arrow.up" onPress={() => {}} />
<Stack.Toolbar.Menu icon="ellipsis.circle">{/* ... */}</Stack.Toolbar.Menu>
```

### Material Symbols（仅 Android）

对于 Android 平台，官方推荐使用 `@expo/material-symbols` 包。它提供了 Google 的 Material Symbols 图标，每个图标作为独立的子路径（subpath）引入，有助于优化打包体积（tree-shaking）。

使用你偏好的包管理器安装：

```sh
# npm
npx expo install @expo/material-symbols

# yarn
yarn expo install @expo/material-symbols

# pnpm
pnpm expo install @expo/material-symbols

# bun
bun expo install @expo/material-symbols
```

从子路径直接导入图标：

```tsx
import Star from '@expo/material-symbols/star.xml';
import Share from '@expo/material-symbols/share.xml';
import MoreVert from '@expo/material-symbols/more_vert.xml';

<Stack.Toolbar.Button icon={Star} onPress={() => {}} />
<Stack.Toolbar.Button icon={Share} onPress={() => {}} />
<Stack.Toolbar.Menu icon={MoreVert}>{/* ... */}</Stack.Toolbar.Menu>
```

**重要说明**：矢量绘图（Vector drawables）会自动继承工具栏的着色（tint color）。如果你希望保留图标的原始颜色，需要设置 `iconRenderingMode="original"`。

#### 在 Android 和 iOS 上使用相同图标

`icon` 属性同时支持图片资源和 SF Symbols 名称。利用 `process.env.EXPO_OS` 环境变量进行条件分支，为不同平台提供对应的图标值。

> **基于文档内容推导**：`process.env.EXPO_OS` 是 Metro 打包器在**构建时**替换的环境变量，未使用的分支会被 tree-shake 移除，因此不会增加运行时包体积。

```tsx
import Star from '@expo/material-symbols/star.xml';

<Stack.Toolbar.Button
  icon={process.env.EXPO_OS === 'ios' ? 'star.fill' : Star}
  onPress={() => {}}
/>;
```

### 自定义图片

#### Android

将图片资源传入 `icon` 属性。默认情况下，图片会被着色（tinted）为工具栏的主题色。使用 `iconRenderingMode="original"` 可保留多色图标的原始颜色。

**默认着色效果**：

```tsx
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Button icon={require('./assets/expo.png')} onPress={() => {}} />
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

**保留原始颜色**：

```tsx
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Button
          icon={require('./assets/expo.png')}
          iconRenderingMode="original"
          onPress={() => {}}
        />
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

#### iOS

**头部工具栏**可以直接通过 `icon` 属性传入图片资源。**底部工具栏**则需要使用 `expo-image` 的 `useImage` hook，并将结果传给 `image` 属性（而非 `icon`）。

> **注意**：在子菜单（submenus）和头部位置中使用自定义图片，需要 `react-native-screens` **4.24.0 或更高版本**。SDK 55 需要手动升级该依赖，SDK 56 已内置该版本。

**头部工具栏自定义图片**：

```tsx
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={require('./assets/expo.png')} onPress={() => {}} />
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

**底部工具栏自定义图片**：

```tsx
import { Stack } from 'expo-router';
import { useImage } from 'expo-image';

export default function Page() {
  const customIcon = useImage('https://simpleicons.org/icons/expo.svg', {
    maxWidth: 24,
    maxHeight: 24,
  });

  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Button image={customIcon} onPress={() => {}} />
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

> **注意**：`useImage` 配合 `image` 属性用于底部工具栏自定义图片的模式**仅适用于 iOS**，并且这是一个临时 API，未来可能会发生变化。

---

## 构建操作菜单

使用 `Stack.Toolbar.Menu` 和 `Stack.Toolbar.MenuAction` 可以将多个操作分组到菜单中。部分属性为 iOS 专属。

### Android 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';

export default function EmailScreen() {
  const [isArchived, setIsArchived] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon={require('./assets/menu.png')}>
          <Stack.Toolbar.MenuAction
            icon={require('./assets/reply.png')}
            onPress={() => Alert.alert('Reply')}>
            Reply
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon={require('./assets/forward.png')}
            onPress={() => Alert.alert('Forward')}>
            Forward
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon={isArchived ? require('./assets/unarchive.png') : require('./assets/archive.png')}
            isOn={isArchived}
            onPress={() => setIsArchived(!isArchived)}>
            {isArchived ? 'Unarchive' : 'Archive'}
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon={require('./assets/trash.png')}
            destructive
            onPress={() => Alert.alert('Delete')}>
            Delete
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {/* 邮件内容 */}
    </>
  );
}
```

**关键属性说明**：
- `isOn`：布尔值，标记该操作是否处于"激活"状态（如已归档时显示勾选标记）。
- `destructive`：布尔值，标记该操作为破坏性操作（如删除），在 iOS 上通常以红色显示。
- `MenuAction` 的**子元素**（children）作为菜单项的文本标签。

### iOS 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';

export default function EmailScreen() {
  const [isArchived, setIsArchived] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis.circle">
          <Stack.Toolbar.MenuAction
            icon="arrowshape.turn.up.left"
            onPress={() => Alert.alert('Reply')}>
            Reply
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon="arrowshape.turn.up.right"
            onPress={() => Alert.alert('Forward')}>
            Forward
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon={isArchived ? 'tray.full' : 'archivebox'}
            isOn={isArchived}
            onPress={() => setIsArchived(!isArchived)}>
            {isArchived ? 'Unarchive' : 'Archive'}
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction icon="trash" destructive onPress={() => Alert.alert('Delete')}>
            Delete
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {/* 邮件内容 */}
    </>
  );
}
```

### 嵌套子菜单

可以将菜单嵌套以构建复杂的层级结构。`inline` 属性使子菜单项**直接内联显示**，而不是折叠成单独的子页面。

#### Android 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';

export default function EmailScreen() {
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);

  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Menu icon={require('./assets/menu.png')}>
          {/* 内联子菜单 - 选项直接显示在菜单中 */}
          <Stack.Toolbar.Menu inline title="Sort By">
            <Stack.Toolbar.MenuAction isOn={sortBy === 'name'} onPress={() => setSortBy('name')}>
              Name
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction isOn={sortBy === 'date'} onPress={() => setSortBy('date')}>
              Date
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction isOn={sortBy === 'size'} onPress={() => setSortBy('size')}>
              Size
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>

          {/* 嵌套子菜单 - 作为独立菜单打开 */}
          <Stack.Toolbar.Menu title="Preferences">
            <Stack.Toolbar.MenuAction
              isOn={showHiddenFiles}
              onPress={() => setShowHiddenFiles(!showHiddenFiles)}>
              Show Hidden Files
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {/* 邮件内容 */}
    </>
  );
}
```

#### iOS 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';

export default function EmailScreen() {
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);

  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Menu icon="ellipsis.circle">
          {/* 内联子菜单 - 选项直接显示在菜单中 */}
          <Stack.Toolbar.Menu inline title="Sort By">
            <Stack.Toolbar.MenuAction isOn={sortBy === 'name'} onPress={() => setSortBy('name')}>
              Name
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction isOn={sortBy === 'date'} onPress={() => setSortBy('date')}>
              Date
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction isOn={sortBy === 'size'} onPress={() => setSortBy('size')}>
              Size
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>

          {/* 嵌套子菜单 - 作为独立菜单打开 */}
          <Stack.Toolbar.Menu title="Preferences">
            <Stack.Toolbar.MenuAction
              isOn={showHiddenFiles}
              onPress={() => setShowHiddenFiles(!showHiddenFiles)}>
              Show Hidden Files
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      {/* 邮件内容 */}
    </>
  );
}
```

**内联 vs 嵌套的区别**：
- **`inline` 子菜单**（如 `Sort By`）：选项直接显示在父菜单中，用户无需额外点击即可看到所有选项，适合互斥选项（如排序方式）。
- **非 `inline` 子菜单**（如 `Preferences`）：折叠为独立的子页面，用户需要点击才能展开，适合层级较深的设置项。

> **基于经验建议**：菜单层级不宜过深（建议不超过两层），否则会增加用户的操作成本，影响体验。

---

## 使用底部工具栏

省略 `placement` 属性时，工具栏默认出现在**底部**。底部工具栏在 iOS 上常用于放置主要操作按钮。

> **重要限制**：底部工具栏**只能在页面组件**（page components）中使用，**不能在布局文件**（layout files）中使用。

### Android 示例

```tsx
import { Stack } from 'expo-router';
import { Alert } from 'react-native';

export default function PhotosScreen() {
  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Button
          icon={require('./assets/select.png')}
          onPress={() => Alert.alert('Select')}
        />
        <Stack.Toolbar.Spacer width={24} />
        <Stack.Toolbar.Button
          icon={require('./assets/plus.png')}
          onPress={() => Alert.alert('Add')}
        />
      </Stack.Toolbar>
    </>
  );
}
```

### iOS 示例

```tsx
import { Stack } from 'expo-router';
import { Alert } from 'react-native';

export default function PhotosScreen() {
  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.Button icon="photo.on.rectangle" onPress={() => Alert.alert('Select')}>
          Select
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button icon="plus" onPress={() => Alert.alert('Add')}>
          Add
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}
```

**关键差异**：
- iOS 的 `Spacer` 可以不带 `width` 属性，会自动使用**弹性间距**（flexible spacing）将按钮推到两端。
- Android 的 `Spacer` **必须**指定显式的 `width` 值。

---

## 间隔器（Spacer）

`Stack.Toolbar.Spacer` 用于在工具栏项之间创建间距。

| 平台 | 行为 |
|------|------|
| **Android** | **严格要求**显式指定 `width` 属性 |
| **iOS** | 不指定 `width` 时为弹性间距（自动填充剩余空间），指定 `width` 时为固定间距 |

> **基于文档内容推导**：iOS 的弹性 Spacer 行为类似于 CSS 中的 `flex: 1`，可以自动将工具栏项分散到两端，这在设计"左侧取消 + 右侧确认"这类布局时非常有用。

---

## 为按钮添加角标 Badge（仅 iOS）

通过组合 `Stack.Toolbar.Icon`、`Stack.Toolbar.Label` 和 `Stack.Toolbar.Badge`，可以在头部工具栏中显示计数角标。

> **重要限制**：角标（Badge）**仅适用于 iOS 的头部工具栏**，不支持底部工具栏，也不支持 Android 平台。

```tsx
import { Stack } from 'expo-router';

export default function InboxScreen() {
  const unreadCount = 5;

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={() => {}}>
          <Stack.Toolbar.Icon sf="bell" />
          <Stack.Toolbar.Label>Notifications</Stack.Toolbar.Label>
          {unreadCount > 0 && <Stack.Toolbar.Badge>{String(unreadCount)}</Stack.Toolbar.Badge>}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

**组件说明**：
- `Stack.Toolbar.Icon`：通过 `sf` 属性指定 SF Symbol 图标。
- `Stack.Toolbar.Label`：为按钮提供无障碍标签（accessibility label）。
- `Stack.Toolbar.Badge`：显示数字角标，通常用于未读消息计数。

> **基于文档内容推导**：`Badge` 的 children 必须是字符串类型（`String(unreadCount)` 而非直接传入数字），使用时需注意类型转换。

---

## 嵌入自定义视图

当标准的按钮无法满足需求时，可以使用 `Stack.Toolbar.View` 插入**任意 React Native 组件**。

```tsx
import { Stack } from 'expo-router';
import { Pressable, Alert } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function SearchScreen() {
  return (
    <>
      <Stack.Toolbar>
        <Stack.Toolbar.View>
          <Pressable
            style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              Alert.alert('Filter pressed');
            }}>
            <SymbolView
              name={{
                ios: 'line.3.horizontal.decrease.circle',
                android: 'filter_list',
              }}
              size={24}
            />
          </Pressable>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      {/* 屏幕内容 */}
    </>
  );
}
```

**说明**：
- 本示例使用 `expo-symbols` 的 `SymbolView` 组件，它支持通过平台对象为不同平台指定不同的图标名。
- `Stack.Toolbar.View` 提供了最大的灵活性，你可以在其中放置任何 React Native 组件（如自定义动画按钮、输入框等）。

> **基于经验建议**：自定义视图会失去原生工具栏的一些默认行为（如自动着色、无障碍支持等），仅在标准 `Button` / `Menu` 无法满足需求时使用。

---

## 动态显示与隐藏工具栏项

通过 `hidden` 属性结合组件状态，可以动态切换工具栏项的可见性。

### Android 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';

export default function DocumentScreen() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          hidden={isEditing}
          icon={require('./assets/pencil.png')}
          onPress={() => setIsEditing(true)}
        />
        <Stack.Toolbar.Button
          hidden={!isEditing}
          icon={require('./assets/check.png')}
          onPress={() => setIsEditing(false)}
        />
      </Stack.Toolbar>
      {/* 文档内容 */}
    </>
  );
}
```

### iOS 示例

```tsx
import { useState } from 'react';
import { Stack } from 'expo-router';

export default function DocumentScreen() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button hidden={isEditing} icon="pencil" onPress={() => setIsEditing(true)} />
        <Stack.Toolbar.Button hidden={!isEditing} onPress={() => setIsEditing(false)}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      {/* 文档内容 */}
    </>
  );
}
```

**实现逻辑**：
- 未编辑状态：显示"编辑"按钮（铅笔图标），隐藏"完成"按钮。
- 编辑状态：隐藏"编辑"按钮，显示"完成"按钮（勾选图标或 "Done" 文字）。

> **基于经验建议**：使用 `hidden` 属性比条件渲染（`{isEditing ? <Button /> : null}`）更好，因为原生工具栏组件可以正确处理显示/隐藏的过渡动画，而条件渲染可能导致视觉跳跃。

---

## 常见问题

### iOS 26 液态玻璃（Liquid Glass）工具栏按钮在深色模式下闪烁

当默认主题与系统深色模式不匹配时，会出现视觉瑕疵。解决方案是在根布局（root layout）中使用 `expo-router` 提供的 `ThemeProvider` 包裹 `Stack` 组件。

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack />
    </ThemeProvider>
  );
}
```

### 屏幕切换时出现白色背景闪烁

在页面过渡期间出现浅色背景闪烁，说明存在主题不匹配问题。使用与上面相同的 `ThemeProvider` 方案修复：

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack />
    </ThemeProvider>
  );
}
```

> **基于经验建议**：这两个问题的根本原因相同——主题配置缺失。建议在任何使用 Stack 导航的项目中，从第一天起就在根布局中配置 `ThemeProvider`，避免后期出现难以排查的视觉问题。

### 大标题在滚动时不折叠

如果大标题（large title）在滚动时无法折叠缩小，通常是因为**可滚动视图不是直接的第一个子元素**。确保 `ScrollView` 或 `FlatList` 是页面的直接第一个子元素。如果外层有包裹组件，需要在包裹组件上设置 `collapsable={false}`。

**正确用法——ScrollView 为直接第一个子元素**：

```tsx
import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

export default function Home() {
  return (
    <ScrollView>
      <Stack.Title large>Home</Stack.Title>
      <Text>Content here</Text>
    </ScrollView>
  );
}
```

**有包裹组件时——设置 collapsable={false}**：

```tsx
import { Stack } from 'expo-router';
import { ScrollView, View, Text } from 'react-native';

export default function Home() {
  return (
    <View collapsable={false}>
      <ScrollView>
        <Stack.Title large>Home</Stack.Title>
        <Text>Content here</Text>
      </ScrollView>
    </View>
  );
}
```

> **基于文档内容推导**：`collapsable={false}` 告诉 Android 系统不要将该 View 合并到渲染优化中，从而保证 `react-native-screens` 能正确识别可滚动视图的位置关系，实现大标题的折叠效果。

---

## 已知限制

| 限制项 | 说明 |
|--------|------|
| **仅支持原生平台** | Web 平台没有标准工具栏，需要自行实现替代方案 |
| **Android 图标必须为图片资源** | 使用 `ImageSourcePropType` 或 `Stack.Toolbar.Icon` 配合 `src` 属性 |
| **Android 的 Spacer 必须指定 width** | 弹性间距（flexible spacer）仅 iOS 支持 |
| **底部工具栏仅限页面组件** | 必须与特定屏幕内容关联，不能在 layout 文件中使用 |
| **不能嵌套工具栏** | `Stack.Toolbar` 组件之间不能相互嵌套 |
| **Badge 仅限头部工具栏** | 底部工具栏不支持 Badge |
| **Android 不支持 Badge 和 Label 基础组件** | 这些组件在 Android 上会被静默丢弃，需要使用 `Stack.Toolbar.View` 实现自定义 UI |
| **Android 不支持 SearchBarSlot** | 应使用 `Stack.SearchBar` 替代 |

---

## 延伸阅读

完整的属性文档请参阅 `Stack.Toolbar` 的 API 参考文档。

---

## 文档导航

- **上一页**：[custom navigators](./73__custom-navigators.md)
- **下一页**：[zoom transition](./75__zoom-transition.md)
