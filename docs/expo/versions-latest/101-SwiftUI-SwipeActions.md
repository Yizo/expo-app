# 101｜SwiftUI SwipeActions

**翻页：**[上一页：SwiftUI Spacer](./100-SwiftUI-Spacer.md) · [目录](./README.md) · [下一页：SwiftUI TabView](./102-SwiftUI-TabView.md)

**官方页面：**[SwiftUI SwipeActions · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/swipeactions/)

**版本边界：**Latest 与 [SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/swipeactions/)均建议 `@expo/ui ~57.0.19` / `~56.0.26`。此原生行手势组件仅面向 iOS，官方标注可在 Expo Go 使用。

## 列表行的侧滑操作

`SwipeActions` 对应 SwiftUI swipeActions modifier，可为一行内容添加 leading（阅读方向起始边）或 trailing（结束边）的动作按钮。常见用法是左滑删除、右滑置顶；容器要放在 List 行中。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 左侧 Pin 与右侧 Delete 操作

`SwipeActions.Actions` 声明被滑出时出现的按钮组。leading 组设置 `allowsFullSwipe={false}`，表示不允许滑到底直接触发；trailing 组的 Delete 标为 destructive：

~~~tsx
import {
  Button,
  Host,
  List,
  Section,
  SwipeActions,
  Text,
} from '@expo/ui/swift-ui';

export default function SwipeActionsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section>
          <SwipeActions>
            <Text>Message from Expo</Text>

            <SwipeActions.Actions
              edge="leading"
              allowsFullSwipe={false}>
              <Button
                label="Pin"
                systemImage="pin"
                onPress={() => {}}
              />
            </SwipeActions.Actions>

            <SwipeActions.Actions edge="trailing">
              <Button
                label="Delete"
                systemImage="trash"
                role="destructive"
                onPress={() => {}}
              />
            </SwipeActions.Actions>
          </SwipeActions>
        </Section>
      </List>
    </Host>
  );
}
~~~

## API 与术语

| 组件 / 参数 | 用途 |
| --- | --- |
| `SwipeActions.children` | 正常显示的行内容，以及一个或多个 `SwipeActions.Actions` 操作组。 |
| `SwipeActions.Actions` | 用户从指定边滑动时露出的按钮组。 |
| `edge` | `'leading' \| 'trailing'`，决定从哪边滑出。 |
| `allowsFullSwipe` | 控制是否允许用户完整滑动时触发 SwiftUI 快速动作；例子对 Pin 组关闭该行为。 |

### 新手术语

- **leading / trailing**：相对当前阅读方向的起始边和结束边；比固定说左 / 右更适合 RTL（从右向左）布局。
- **Destructive role**：告诉系统这是删除等破坏性操作，可用警示色突出显示。
- **Full swipe**：把行一路划到尽头；在系统允许时可不点按钮而直接运行默认动作。

## 源页代码主题覆盖

已覆盖四种安装命令和官方完整列表行示例，展示 leading Pin、trailing Delete、全滑行为配置与 `SwipeActions.Actions` 分组；组件结构及 `leading` / `trailing` 类型已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/swipeactions/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/swipeactions/)

**翻页：**[上一页：SwiftUI Spacer](./100-SwiftUI-Spacer.md) · [目录](./README.md) · [下一页：SwiftUI TabView](./102-SwiftUI-TabView.md)
