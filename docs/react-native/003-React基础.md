# 003 React 基础（React Fundamentals）

**翻页：** [上一页：002 核心组件与原生组件（Core Components and Native Components）](002-核心组件与原生组件.md) · [目录](README.md) · [下一页：004 处理文本输入（Handling Text Input）](004-处理文本输入.md)

**官方页面：** [React Fundamentals · React Native](https://reactnative.dev/docs/intro-react)
**源页代码覆盖：** 组件导入/函数/导出、JSX 表达式、View/TextInput 组合、props/Image source/style 双花括号、useState 与 Button 回调/disabled/title、Fragment 和重复子组件。
**说明：** 本页用中文解释概念；完整示例经重新编写，并把官方页分散展示的组件、JSX、props、state 例子合并成一个小程序。

## 先迁移 React 心智模型

React Native 仍使用 React。组件（component）是可复用的 UI 描述；JSX 用 JavaScript 写组件树；props 是父组件交给子组件的配置；state 保存组件需要记住、并可能随用户操作改变的数据。会 React 的 Web 工程师大多已经掌握这些概念，主要差异在渲染目标和内置组件：RN 屏幕上使用 `View`、`Text`、`Image`、`TextInput`、`Button` 等，而不是 HTML DOM 标签。

## 函数组件和 JSX

组件可以是返回 React 元素的 JavaScript 函数。React 元素描述屏幕应呈现什么；组件被使用时，React 根据它返回的元素树更新界面。JSX 内的 `{...}` 可以嵌入 JavaScript 表达式，例如变量、条件表达式和函数调用。导出组件后，其他模块可以导入并使用。

```tsx
import { Text } from 'react-native';

type GreetingProps = { name: string };

function Greeting({ name }: GreetingProps) {
  const label = `你好，${name}`;
  return <Text>{label}</Text>;
}

export default Greeting;
```

## 组合组件：父组件和子组件

把基础组件嵌套起来，可以定义更高层的自定义组件。渲染其他组件的组件叫父组件，被它渲染的组件是子组件。`View` 是常见布局容器；`Text` 是文本节点；在 RN 中，不能像 HTML 那样把任意字符串直接放进普通 `View`。

```tsx
import { Text, TextInput, View } from 'react-native';

function ProfileForm() {
  return (
    <View>
      <Text>个人介绍</Text>
      <TextInput placeholder="写一点关于自己的内容" />
    </View>
  );
}
```

## Props：给组件传入配置

`props`（properties 的简称）由父组件提供，用于配置子组件如何显示。一般把 props 当作只读输入；子组件不应直接改写父组件传来的值。RN 核心组件也通过 props 接受内容、回调、样式等设置。比如 `Image` 通过 `source` 决定图片，通过 `style` 接收布局样式对象。

JSX 中的花括号用于传入 JavaScript 值；对象本身也要用花括号，所以作为 prop 时会看到双层花括号：外层是 JSX 表达式，内层是对象字面量。

```tsx
import { Image, Text, View } from 'react-native';

function PetCard({ name, photo }: { name: string; photo: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Image
        source={{ uri: photo }}
        style={{ width: 96, height: 96, borderRadius: 48 }}
      />
      <Text>{name}</Text>
    </View>
  );
}

function PetWall() {
  return <PetCard name="小灰" photo="https://example.com/pet.png" />;
}
```

静态图片常用 `require('./pet.png')` 指向打包时已知的文件；远程图片常传 `{ uri: '...' }`。网络图片一般还需要指定显示尺寸。该选择取决于资源来源，不能把 Web 的 `<img src="...">` 原样套用。

## State：组件内部会变化的数据

state（状态）适合存放组件在多次渲染之间要记住的值，尤其是会因输入、点击或异步结果变化的值。`useState(initialValue)` 返回当前值和更新函数。调用更新函数会请求 React 重新渲染组件；下一次渲染时 Hook 提供新值。不要把 state 当普通局部变量赋值，也不要因变量声明为 `const` 就认为状态不能变化。

下面的例子把一个可重复使用的宠物卡片与多个实例组合起来。按钮操作是 RN 的 `onPress`，不是 Web 按钮的 `onClick`。JSX Fragment `<>...</>` 可以把相邻元素包在一起而不增加额外的原生容器。

```tsx
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

type PetProps = { name: string };

function HungryPet({ name }: PetProps) {
  const [hungry, setHungry] = useState(true);

  return (
    <View>
      <Text>{name}：{hungry ? '想吃东西' : '吃饱了'}</Text>
      <Button
        title={hungry ? '喂一点食物' : '已经吃过了'}
        disabled={!hungry}
        onPress={() => setHungry(false)}
      />
    </View>
  );
}

export default function PetCafe() {
  return (
    <>
      <HungryPet name="阿栗" />
      <HungryPet name="豆豆" />
    </>
  );
}
```

两个 `HungryPet` 实例各自保存自己的 state；它们共享同一种组件定义，但互不共享饥饿值。props 适合在渲染时配置组件，state 适合跟踪组件拥有且会变化的数据。

**翻页：** [上一页：002 核心组件与原生组件（Core Components and Native Components）](002-核心组件与原生组件.md) · [目录](README.md) · [下一页：004 处理文本输入（Handling Text Input）](004-处理文本输入.md)
