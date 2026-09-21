# 032｜Jetpack Compose FloatingActionButton

**翻页：**[上一页：Jetpack Compose ExposedDropdownMenuBox](./031-Jetpack-Compose-ExposedDropdownMenuBox.md) · [目录](./README.md) · [下一页：Jetpack Compose FlowRow（unversioned）](./033-Jetpack-Compose-FlowRow.md)

**官方页面：**[FloatingActionButton](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/floatingactionbutton/)

**版本边界：**这是官方 Next 链从 Expo SDK Latest 切换到的 unversioned / next SDK 文档；页头明确提示它针对“下一个 SDK 版本”。本地项目是 Expo SDK56，不能把这里出现的新 API 直接当作 v56 可用。可以用页面示例理解 Material 3 FAB 的组件关系，安装与实机使用前需对照本地 SDK / @expo/ui 版本。

## Floating Action Button 的用途

Floating Action Button（FAB）是屏幕中最主要的一项浮动操作，通常用图标表达“新增”“编辑”等核心动作。此页介绍四种 Material 3 样式：

- SmallFloatingActionButton：紧凑按钮。
- FloatingActionButton：标准尺寸。
- LargeFloatingActionButton：更大图标按钮。
- ExtendedFloatingActionButton：图标加文字，能展开 / 收起文字标签。

FAB 属于 Android Jetpack Compose 控件；同一个页面若有多个浮动操作，可以改用 Expo UI 的 HorizontalFloatingToolbar。

## 标准 FAB

FloatingActionButton 使用 Icon slot 放置矢量资源，并通过 onClick 响应操作：

```tsx
import {
  FloatingActionButton,
  Host,
  Icon,
} from '@expo/ui/jetpack-compose';

export default function AddButton() {
  return (
    <Host matchContents>
      <FloatingActionButton onClick={() => console.log('FAB pressed')}>
        <FloatingActionButton.Icon>
          <Icon source={require('./assets/add.xml')} />
        </FloatingActionButton.Icon>
      </FloatingActionButton>
    </Host>
  );
}
```

## Small / Standard / Large 变体

三个紧凑程度不同的 FAB 可以并排比较；这里用 RN View 做横向排版，每个 Compose 控件分别放在 Host 中：

```tsx
import {
  FloatingActionButton,
  Host,
  Icon,
  LargeFloatingActionButton,
  SmallFloatingActionButton,
} from '@expo/ui/jetpack-compose';
import { View } from 'react-native';

export function FabSizes() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Host matchContents>
        <SmallFloatingActionButton onClick={() => {}}>
          <SmallFloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </SmallFloatingActionButton.Icon>
        </SmallFloatingActionButton>
      </Host>
      <Host matchContents>
        <FloatingActionButton onClick={() => {}}>
          <FloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Host>
      <Host matchContents>
        <LargeFloatingActionButton onClick={() => {}}>
          <LargeFloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </LargeFloatingActionButton.Icon>
        </LargeFloatingActionButton>
      </Host>
    </View>
  );
}
```

## 带文字的 Extended FAB

Expanded 控制文字标签是否显示。可以用 React state 在点击后展开 / 收起：

```tsx
import { useState } from 'react';
import {
  ExtendedFloatingActionButton,
  Host,
  Icon,
  Text,
} from '@expo/ui/jetpack-compose';

export function EditFab() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Host matchContents>
      <ExtendedFloatingActionButton
        expanded={expanded}
        onClick={() => setExpanded(value => !value)}>
        <ExtendedFloatingActionButton.Icon>
          <Icon source={require('./assets/edit.xml')} />
        </ExtendedFloatingActionButton.Icon>
        <ExtendedFloatingActionButton.Text>
          <Text>编辑</Text>
        </ExtendedFloatingActionButton.Text>
      </ExtendedFloatingActionButton>
    </Host>
  );
}
```

## 悬浮在可滚动内容上

如果要把 FAB 固定在列表右下角，推荐让背景列表和按钮同处 Compose Box。align 与 offset modifiers 决定浮动位置；这样不需要把 native button 覆盖在另一个独立 RN WebView / Host 之上：

```tsx
import {
  Box,
  FloatingActionButton,
  Host,
  Icon,
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

export function FloatingAddAction() {
  return (
    <Host style={{ flex: 1 }}>
      <Box modifiers={[fillMaxSize()]}>
        <LazyColumn modifiers={[fillMaxSize()]}>
          {items.map(item => (
            <ListItem key={item}>
              <ListItem.HeadlineContent>
                <Text>{item}</Text>
              </ListItem.HeadlineContent>
            </ListItem>
          ))}
        </LazyColumn>

        <FloatingActionButton
          modifiers={[align('bottomEnd'), offset(-16, -16)]}
          onClick={() => console.log('新增')}>
          <FloatingActionButton.Icon>
            <Icon source={require('./assets/add.xml')} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Box>
    </Host>
  );
}
```

## 自定义颜色

Extended FAB 可以通过 containerColor 改变按钮容器背景：

```tsx
import {
  ExtendedFloatingActionButton,
  Host,
  Icon,
  Text,
} from '@expo/ui/jetpack-compose';

export function CustomColorFab() {
  return (
    <Host matchContents>
      <ExtendedFloatingActionButton
        containerColor="#E8DEF8"
        onClick={() => console.log('新增')}>
        <ExtendedFloatingActionButton.Icon>
          <Icon source={require('./assets/add.xml')} />
        </ExtendedFloatingActionButton.Icon>
        <ExtendedFloatingActionButton.Text>
          <Text>新建项目</Text>
        </ExtendedFloatingActionButton.Text>
      </ExtendedFloatingActionButton>
    </Host>
  );
}
```

## API 与属性

四种 FAB 共用 FloatingActionButtonProps：

| 属性 | 含义 |
| --- | --- |
| children | 通过 .Icon / .Text slots 组合按钮内容。 |
| containerColor | 按钮背景色；默认跟随 Material 3 primary container。 |
| modifiers | Compose ModifierConfig[] 布局 / 绘制规则。 |
| onClick | 按钮点击回调。 |
| expanded | 仅 ExtendedFloatingActionButton 使用；显示 / 隐藏文字，默认 true。 |

Small、标准和 Large 版本使用 .Icon slot；Extended 使用 .Icon 与 .Text。所有版本均以 Android Material 3 样式绘制。

## 关键名词

- **FAB / Floating Action Button**：突出显示在页面上的主要悬浮操作按钮。
- **Extended FAB**：在图标旁显示文字标签，可动画展开 / 收起。
- **Slot**：通过组件子节点插入 Icon 或 Text 的指定内容区。
- **Compose Box**：把 children 叠放在同一区域的原生容器。
- **align / offset**：分别配置相对于 Box 的对齐方式与位置偏移。
- **Next SDK / unversioned**：官方针对下一个 SDK 的文档分支，不等同于当前 SDK57 稳定参考。

## 官方代码主题覆盖

源页所有示例均已改写：@expo/ui 安装命令、标准 FAB 与 add icon、Small/standard/Large 变体、Extended FAB 展开状态、Compose Box + LazyColumn 中右下角浮动、Extended FAB 自定义颜色。四类组件的 children / expanded / containerColor / modifiers / onClick props 与对当前 SDK56 的版本边界均有说明。

## 下一页

官方页脚 Next 指向 [Jetpack Compose FlowRow](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/flowrow/)，继续 next SDK 的 Compose 布局组件。

**翻页：**[上一页：Jetpack Compose ExposedDropdownMenuBox](./031-Jetpack-Compose-ExposedDropdownMenuBox.md) · [返回目录](./README.md) · [下一页：Jetpack Compose FlowRow（unversioned）](./033-Jetpack-Compose-FlowRow.md)
