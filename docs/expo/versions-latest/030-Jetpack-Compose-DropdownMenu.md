# 030｜Jetpack Compose DropdownMenu

**翻页：**[上一页：Jetpack Compose DockedSearchBar](./029-Jetpack-Compose-DockedSearchBar.md) · [目录](./README.md) · [下一页：Jetpack Compose ExposedDropdownMenuBox](./031-Jetpack-Compose-ExposedDropdownMenuBox.md)

**官方页面：**[Jetpack Compose DropdownMenu](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dropdownmenu/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；SDK v56 精确 reference [DropdownMenu](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/dropdownmenu/) 推荐 ~56.0.26。Latest 还出现 cornerRadius、长按 combinedClickable 等示例；在项目 SDK56 中采用前需核对当前 @expo/ui 版本。组件面向 Android Compose，在 Expo Go 中可试用。

## 受控的下拉菜单

DropdownMenu 通过 expanded 控制显示 / 隐藏，并由 onDismissRequest 处理点击外部关闭。每个 menu item 的 onClick 通常也会先将 expanded 设为 false，再执行具体动作：

```tsx
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Icon,
  OutlinedButton,
  Text,
} from '@expo/ui/jetpack-compose';

const homeIcon = require('./assets/home.xml');

export default function BasicMenu() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}>
        <DropdownMenu.Trigger>
          <OutlinedButton onClick={() => setExpanded(true)}>
            <Text>显示菜单</Text>
          </OutlinedButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              setExpanded(false);
              console.log('点击了首页');
            }}>
            <DropdownMenuItem.Text><Text>首页</Text></DropdownMenuItem.Text>
            <DropdownMenuItem.LeadingIcon>
              <Icon source={homeIcon} size={24} />
            </DropdownMenuItem.LeadingIcon>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
```

DropdownMenu.Trigger 是菜单锚点，菜单会定位在这个控件周围。DropdownMenu.Items 收集 MenuItem；MenuItem 通过 Text / LeadingIcon 等 slot 组织原生菜单内容。

## 用普通 React Native View 触发

如果要复用 RN Pressable 作为 trigger，需要通过 RNHostView 把原生 React Native view 放进 Compose tree。Expo UI 的 Compose Text 与 RN Text 同名时，可用 import alias 避免冲突：

```tsx
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  RNHostView,
  Text as ComposeText,
} from '@expo/ui/jetpack-compose';
import { Pressable, Text } from 'react-native';

export function NativePressableMenu() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}>
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable
              onPress={() => setExpanded(true)}
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: '#9B59B6',
              }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>
                RN Pressable 打开菜单
              </Text>
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem onClick={() => setExpanded(false)}>
            <DropdownMenuItem.Text><ComposeText>选项一</ComposeText></DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExpanded(false)}>
            <DropdownMenuItem.Text><ComposeText>选项二</ComposeText></DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
```

## 长按打开菜单

Jetpack Compose 没有另一个专门的长按菜单 primitive；可将 controlled DropdownMenu 与 combinedClickable modifier 组合。短按继续执行普通动作，长按设置 expanded=true：

```tsx
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  background,
  combinedClickable,
} from '@expo/ui/jetpack-compose/modifiers';

export function LongPressMenu() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}>
        <DropdownMenu.Trigger>
          <Text
            modifiers={[
              background('#E0E0E0'),
              combinedClickable({
                onClick: () => console.log('短按'),
                onLongClick: () => setExpanded(true),
              }),
            ]}>
            长按打开菜单
          </Text>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem onClick={() => setExpanded(false)}>
            <DropdownMenuItem.Text><Text>复制</Text></DropdownMenuItem.Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            elementColors={{ textColor: '#B3261E' }}
            onClick={() => setExpanded(false)}>
            <DropdownMenuItem.Text><Text>删除</Text></DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
```

Delete 的文字颜色可以通过 menu item 的 elementColors 区分风险操作。Latest 页面给出了此示例；v56 子页面没有同一项长按示例。

## 圆角与样式

Latest API 使用 cornerRadius 设置菜单容器圆角，数值单位是 dp：

```tsx
<DropdownMenu
  expanded={expanded}
  onDismissRequest={() => setExpanded(false)}
  cornerRadius={16}>
  <DropdownMenu.Trigger>
    <OutlinedButton onClick={() => setExpanded(true)}>
      <Text>圆角菜单</Text>
    </OutlinedButton>
  </DropdownMenu.Trigger>
  <DropdownMenu.Items>
    <DropdownMenuItem onClick={() => setExpanded(false)}>
      <DropdownMenuItem.Text><Text>选项</Text></DropdownMenuItem.Text>
    </DropdownMenuItem>
  </DropdownMenu.Items>
</DropdownMenu>
```

## API

| Component / prop | 含义 |
| --- | --- |
| DropdownMenu | 菜单 root；控制 expanded、点击外部关闭并锚定 trigger。 |
| children | Menu trigger、items 和可选 preview 的 Compose content。 |
| color | 菜单项容器颜色。 |
| cornerRadius | 菜单圆角 dp；Latest 页面列出此属性，旧 SDK 要先核对。 |
| expanded | 菜单是否显示。 |
| modifiers | Compose 的布局 / 绘制修饰器。 |
| onDismissRequest | 用户点外部等情况请求关闭菜单的回调。 |
| style | RN ViewStyle，可用于 DropdownMenu 的样式。 |
| DropdownMenu.Trigger | 声明菜单锚点。 |
| DropdownMenu.Items | 菜单条目容器。 |
| DropdownMenu.Preview | 长按时的预览内容；参考标为 iOS only。 |
| DropdownMenuItem | 菜单项；可放入 DropdownMenu.Items 或 ExposedDropdownMenu。 |

expanded=true 时必须能执行 onDismissRequest，否则菜单没有合理的关闭路径。

## 关键名词

- **Dropdown menu**：点击或长按触发、依附于某个控件出现的菜单。
- **Controlled component**：菜单展开状态保存在 React state 中，由 props 控制。
- **Trigger / anchor**：用来定位菜单的触发控件。
- **RNHostView**：Compose 容器里承载 React Native View 子树的桥接组件。
- **combinedClickable**：同时处理 click 与 long-click 的 Compose Modifier。
- **Modifier**：Compose 对布局和交互行为进行组合的修饰器。
- **dp**：Android 的 density-independent pixel 逻辑单位。

## 官方代码主题覆盖

源页全部代码示例均已重写：@expo/ui 包管理器安装与 Expo package 前置条件、受控按钮 trigger / menu items / 图标、RN Pressable + RNHostView、combinedClickable 长按菜单与 item 颜色、cornerRadius 圆角配置。DropdownMenu root 的状态与回调、Trigger / Items / Preview / MenuItem 组件属性和平台边界均已归纳。

## 下一页

页脚 **Next** 指向 [Jetpack Compose ExposedDropdownMenuBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/exposeddropdownmenubox/)，介绍可嵌在输入框中的下拉选项列表。

**翻页：**[上一页：Jetpack Compose DockedSearchBar](./029-Jetpack-Compose-DockedSearchBar.md) · [返回目录](./README.md) · [下一页：Jetpack Compose ExposedDropdownMenuBox](./031-Jetpack-Compose-ExposedDropdownMenuBox.md)
