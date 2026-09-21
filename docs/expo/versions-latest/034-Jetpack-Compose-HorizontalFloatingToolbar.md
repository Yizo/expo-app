# 034｜Jetpack Compose HorizontalFloatingToolbar（next SDK）

**翻页：**[上一页：Jetpack Compose FlowRow（next SDK）](./033-Jetpack-Compose-FlowRow.md) · [目录](./README.md) · [下一页：Jetpack Compose HorizontalPager（next SDK）](./035-Jetpack-Compose-HorizontalPager.md)

**官方页面：**[HorizontalFloatingToolbar · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalfloatingtoolbar/)

**版本边界：**这是从 FlowRow Next 链进入的 Expo unversioned / next SDK 文档。稳定 Latest 对应页面推荐 @expo/ui ~57.0.19，SDK v56 精确 reference 推荐 ~56.0.26；但 Next 链当前指向下一 SDK 预览路径，未来版本字段可能变化。本地 SDK56 使用前要核对已安装包；单个主操作可选 v56 已有的 FloatingActionButton。

## HorizontalFloatingToolbar 的用途

HorizontalFloatingToolbar 是悬浮在内容之上的横向操作栏，可组合多个 IconButton 和一个突出主操作的 FAB slot。它适合列表筛选 / 编辑工具条等多动作场景；只有一个动作时应直接用 FloatingActionButton。

variant 有 standard 与 vibrant 两种外观。工具栏可以用 Compose Box 锚定在滚动内容上，沿列表滚动自动显示 / 隐藏。

## 放在可滚动列表上

下面代码让 FAB 和 IconButton 一起悬浮在 LazyColumn 之上；floatingToolbarExitAlwaysScrollBehavior 负责依据滚动方向调整 toolbar：

```tsx
import {
  Box,
  Host,
  HorizontalFloatingToolbar,
  Icon,
  IconButton,
  LazyColumn,
  ListItem,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  offset,
} from '@expo/ui/jetpack-compose/modifiers';

const items = Array.from({ length: 20 }, (_, index) => 'Item ' + (index + 1));

export default function ToolbarOverList() {
  return (
    <Host style={{ flex: 1 }}>
      <Box
        modifiers={[fillMaxSize()]}
        floatingToolbarExitAlwaysScrollBehavior="bottom">
        <LazyColumn modifiers={[fillMaxSize()]}>
          {items.map(item => (
            <ListItem key={item}>
              <ListItem.HeadlineContent>
                <Text>{item}</Text>
              </ListItem.HeadlineContent>
            </ListItem>
          ))}
        </LazyColumn>
        <HorizontalFloatingToolbar
          variant="vibrant"
          modifiers={[align('bottomCenter'), offset(0, -16)]}>
          <IconButton onClick={() => console.log('编辑')}>
            <Icon source={require('./assets/edit.xml')} />
          </IconButton>
          <HorizontalFloatingToolbar.FloatingActionButton
            onPress={() => console.log('新增')}>
            <Icon source={require('./assets/add.xml')} />
          </HorizontalFloatingToolbar.FloatingActionButton>
        </HorizontalFloatingToolbar>
      </Box>
    </Host>
  );
}
```

这个例子中 Box、LazyColumn 和 toolbar 都留在 Compose view tree，不要再用 RN absolute positioning 覆盖另一层 Native UI。

## 普通 Toolbar 与 FAB slot

IconButton 可作为 toolbar 的直接子项；主按钮必须放进 HorizontalFloatingToolbar.FloatingActionButton，Compose 会把它排在单独强调槽位：

```tsx
import {
  Host,
  HorizontalFloatingToolbar,
  Icon,
  IconButton,
} from '@expo/ui/jetpack-compose';

export function EditShareToolbar() {
  return (
    <Host matchContents>
      <HorizontalFloatingToolbar>
        <IconButton onClick={() => console.log('编辑')}>
          <Icon
            source={require('./assets/edit.xml')}
            contentDescription="编辑"
          />
        </IconButton>
        <IconButton onClick={() => console.log('分享')}>
          <Icon
            source={require('./assets/share.xml')}
            contentDescription="分享"
          />
        </IconButton>
        <HorizontalFloatingToolbar.FloatingActionButton
          onPress={() => console.log('新增')}>
          <Icon
            source={require('./assets/add.xml')}
            contentDescription="新增"
          />
        </HorizontalFloatingToolbar.FloatingActionButton>
      </HorizontalFloatingToolbar>
    </Host>
  );
}
```

给只用图标表达的按钮加 contentDescription，便于读屏用户识别动作。

## 安装

通过 Expo CLI 安装与 SDK 匹配的 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

既有 bare React Native app 需先接入 Expo package。next SDK 示例属性不一定能在 SDK56 / @expo/ui 56.0.26 中调用。

## API

| 属性 / 组件 | 含义 |
| --- | --- |
| HorizontalFloatingToolbar.children | 工具栏项和主 action。 |
| colors | 分别覆写工具栏和 FAB slot 的颜色。 |
| modifiers | Compose ModifierConfig[]，用于对齐和位移。 |
| variant | standard 或 vibrant 外观，默认 standard。 |
| FloatingActionButton.children | FAB slot 内的图标或内容。 |
| FloatingActionButton.onPress | 主操作按钮点击回调。 |

| HorizontalFloatingToolbarColors 字段 | 用途 |
| --- | --- |
| fabContainerColor | 悬浮主按钮背景色。 |
| fabContentColor | FAB 图标 / 文本颜色。 |
| toolbarContainerColor | 工具栏背景色。 |
| toolbarContentColor | 工具栏 icon / 文本颜色。 |

## 关键名词

- **Horizontal floating toolbar**：多枚操作按钮组成的悬浮工具栏。
- **FAB slot**：工具条中单独强调主操作的按钮位置。
- **Scroll behavior**：跟随滚动改变工具条显隐 / 位置的 Compose 行为。
- **variant**：standard 或 vibrant Material 外观。
- **contentDescription**：为无文字图标按钮提供读屏标签。
- **Box / LazyColumn**：Compose 的叠层容器与虚拟化纵向列表。
- **unversioned / next SDK**：Expo 下一 SDK 的预览文档入口，不表示此 API 已进入 SDK56 / SDK57 稳定依赖。

## 官方代码主题覆盖

源页全部使用示例已重写：@expo/ui 包安装、可滚动 LazyColumn 上的 toolbar + FAB、Box 的 scroll exit behavior、align / offset modifiers、IconButton + 主 FAB slot、contentDescription、variant 和 four color tokens。页面的版本提示与“一个主动作优先用 FAB”说明也已保留。

## 下一页

官方页脚 Next 指向 [Jetpack Compose HorizontalPager](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalpager/)，继续 next SDK Compose 导航容器。

**翻页：**[上一页：Jetpack Compose FlowRow（next SDK）](./033-Jetpack-Compose-FlowRow.md) · [返回目录](./README.md) · [下一页：Jetpack Compose HorizontalPager（next SDK）](./035-Jetpack-Compose-HorizontalPager.md)
