# 018｜Jetpack Compose BadgedBox

**翻页：**[上一页：Jetpack Compose Badge](./017-Jetpack-Compose-Badge.md) · [目录](./README.md) · [下一页：BasicAlertDialog](./019-Jetpack-Compose-BasicAlertDialog.md)

**官方页面：**[Jetpack Compose BadgedBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badgedbox/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.12；SDK v56 exact reference [BadgedBox](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/badgedbox/) 推荐 ~56.0.26。仅支持 Android，页面标记可在 Expo Go 中使用。

## 把徽标叠加到图标

Badge 负责点 / 数字的绘制；BadgedBox 则是带位置规则的容器，把 Badge slot 叠在主内容上，例如邮件或购物车图标：

```tsx
import { BadgedBox, Badge, Host, Icon, Text } from '@expo/ui/jetpack-compose';

const mailIcon = require('./assets/mail.xml');

export default function UnreadMailIcon() {
  return (
    <Host matchContents>
      <BadgedBox>
        <BadgedBox.Badge>
          <Badge><Text>5</Text></Badge>
        </BadgedBox.Badge>
        <Icon source={mailIcon} size={24} />
      </BadgedBox>
    </Host>
  );
}
```

教程中的 XML 图标资源路径只是示例；Android vector drawable 必须在项目 assets 中存在并按 Expo UI 支持方式引用。

## 交互式计数

业务 count 为 0 时可不显示 badge；点 Button 增加数量并同步更新标签：

```tsx
import { useState } from 'react';
import { Badge, BadgedBox, Button, Column, Host, Icon, Text } from '@expo/ui/jetpack-compose';

const cartIcon = require('./assets/cart.xml');

export default function CartCounter() {
  const [count, setCount] = useState(0);

  return (
    <Host matchContents>
      <Column>
        <BadgedBox>
          <BadgedBox.Badge>
            {count > 0 ? <Badge><Text>{String(count)}</Text></Badge> : null}
          </BadgedBox.Badge>
          <Icon source={cartIcon} size={24} />
        </BadgedBox>
        <Button onClick={() => setCount(value => value + 1)}>
          <Text>Add item</Text>
        </Button>
      </Column>
    </Host>
  );
}
```

注意 Compose Button 使用 onClick；Badge 数字仍是 React state，但外层图标与布局是真正由 Compose 生成的 native UI。

## API

BadgedBox 是 Android Compose 容器。children 中要提供主内容，以及可选的 BadgedBox.Badge slot；modifiers 列表用来设置 Compose layout / drawing modifiers。

## 关键名词

- **BadgedBox**：接收主内容并叠加一个 badge 的 Compose layout。
- **Badge slot**：专门传入 BadgedBox 的角标部分，以便 Compose 决定放置位置。
- **Drawable**：Android 的可缩放矢量或 raster 图像资源。
- **Count badge**：显示数字的小标记；业务决定计数归零时是否隐藏。
- **Host**：将 Compose view tree 嵌入 React Native app 的边界组件。

## 官方代码主题覆盖

源页所有代码主题均已改写：npm / Yarn / pnpm / Bun 安装 @expo/ui、Native asset 导入方式、Host wrapper、Badge slot 覆盖图标、包含数字的 count、用 useState 管理数量以及 Button onClick 增量逻辑。BadgedBox children / modifiers API 也已说明。

## 下一页

页脚 **Next** 指向 [BasicAlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/basicalertdialog/)，介绍可自行排布内容的 Android Compose 对话框。

**翻页：**[上一页：Jetpack Compose Badge](./017-Jetpack-Compose-Badge.md) · [返回目录](./README.md) · [下一页：BasicAlertDialog](./019-Jetpack-Compose-BasicAlertDialog.md)
