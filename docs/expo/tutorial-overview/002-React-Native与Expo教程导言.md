# 002｜React Native 与 Expo 教程导言

**翻页：**[上一页：教程总览](./001-教程总览.md) · [目录](./README.md) · [下一页：创建第一个 Expo app](./003-创建第一个Expo应用.md)

**官方页面：**[Tutorial: Using React Native and Expo](https://docs.expo.dev/tutorial/introduction/)

> 本教程 URL 未锁 SDK。来源当前章节会让读者选 SDK 57；本地项目为 Expo `~56.0.11`，应按下一页版本提醒核对 SDK 选择，并以 v56 API reference 为准。

## 目标：一个多平台贴纸应用

这一系列章节逐步构建 StickerSmash：同一套 React Native / Expo 代码运行在 Android、iOS 与 Web。教程假设读者熟悉 React 和 TypeScript，不是从 JavaScript 语法教起。

九章主题覆盖：默认 TypeScript 模板、Expo Router 两屏底部 Tabs、Flexbox 界面、系统图片选择器、Modal 与 FlatList 表情列表、触摸手势、截图并保存到文件、平台差异、最后配置状态栏 / 启动画面 / 图标。

## 怎么使用教程

教程是自定进度的“边做边学”过程。页面会标出代码与改动处，让读者将步骤逐步应用到自己创建的工程；完整源代码可供对照。源页唯一 Hello World 代码结构如下：

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Hello world!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

这个组件没有 `document`、`div` 或 CSS 文件：`View` 提供布局容器，`Text` 是原生文字组件，样式作为 JavaScript 对象传入 `style` prop。

## 关键名词

- **Universal app**：复用一套代码针对移动平台和浏览器构建的应用。
- **Chapter**：逐步完成一个功能点的教程页；教程按目录有序推进。
- **Flexbox**：React Native 默认布局模型，属性大多与 CSS Flexbox 相似但由 JS 对象传入。
- **Expo Router**：以 `app/` 文件结构描述路由的导航框架。
- **Asset**：图片、字体等静态资源；可随 bundle 打包，也可能由设备运行时读取。

## 官方代码主题覆盖

本页源代码是单个 Hello World Screen；已给出包含 RN 核心组件与 Flexbox 样式的原创改写。其它章节主题在概览中逐项列出，但其实际代码从后续逐章页面开始。

## 下一页

页脚 **Next** 进入 [Create your first app](https://docs.expo.dev/tutorial/create-your-first-app/)，初始化项目并运行第一个页面。

**翻页：**[上一页：教程总览](./001-教程总览.md) · [返回目录](./README.md) · [下一页：创建第一个 Expo app](./003-创建第一个Expo应用.md)
