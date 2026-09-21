# 015｜Expo UI：Jetpack Compose

**翻页：**[上一页：Expo UI 概览](./014-Expo-UI概览.md) · [目录](./README.md) · [下一页：AlertDialog](./016-Jetpack-Compose-AlertDialog.md)

**官方页面：**[Jetpack Compose overview](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；SDK v56 exact reference [Jetpack Compose](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/) 推荐 @expo/ui ~56.0.26。这个分支只面向 Android；iOS UI 需跟 SwiftUI reference。

## Jetpack Compose component

Jetpack Compose 是 Android 的声明式原生 UI toolkit。Expo UI 让 React Native 页面调用这些 Android 原生控件，而不是在 React Native layout 中模拟 Android Material widgets。该页面目前标记为可在 Expo Go 使用。

安装 @expo/ui 时通过 Expo CLI 让依赖版本匹配 SDK：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

如果是既有 React Native app，要先安装 expo package / Expo modules。Expo Router 默认模板通常已启用 Expo Router plugin。

Compose UI 必须放在 Host 容器中。Host 是 Compose view tree 的边界；matchContents 表示它根据内部组件测量自然大小：

```tsx
import { Button, Host } from '@expo/ui/jetpack-compose';

export function SaveChangesButton() {
  return (
    <Host matchContents>
      <Button onClick={() => alert('Saved')}>
        Save changes
      </Button>
    </Host>
  );
}
```

注意 Compose Button 用 onClick，而 React Native Pressable 通常用 onPress；Compose components 的嵌套 children 也必须在同一 Host 里。

## Android 组件目录

页面列出 Jetpack Compose component reference：

AlertDialog、Badge、BadgedBox、BasicAlertDialog、Box、Button、Card、Carousel、Checkbox、Chip、Column、DateTimePicker、Divider、DockedSearchBar、DropdownMenu、ExposedDropdownMenuBox、FloatingActionButton、FlowRow、HorizontalFloatingToolbar、HorizontalPager、Host、Icon、IconButton、LazyColumn、LazyRow、ListItem、LoadingIndicator、Material Colors、ModalBottomSheet、Modifiers、NavigationBar、Progress Indicators、PullToRefreshBox、RadioButton、RNHostView、Row、SearchBar、SegmentedButton、Shape、Slider、Snackbar、Spacer、Surface、Switch、Text、TextField、ToggleButton、Tooltip 和 useNativeState。

当前目录页不会逐个 props 介绍这些控件；接下来的 Next 依次打开每个 Android 组件的 API 页面。比如 AlertDialog 的 API 页面会说明对话框 slots、colors 与 dismiss behavior。

## 关键名词

- **Jetpack Compose**：Android 原生声明式 UI 系统。
- **Host**：把 Compose 子树嵌入 React Native UI 的宿主 view。
- **matchContents**：Host 按子节点内容计算所需尺寸；有滚动或填满剩余空间需求时需参考 Host API 选择尺寸策略。
- **Compose component**：由 Kotlin / Compose 绘制的原生控件，但通过 Expo UI API 在 React Native 代码里声明。
- **Expo Go**：当前 reference 将该平台组件标记为 Expo Go 可运行；仍需匹配 SDK 和 @expo/ui 版本。

## 官方代码主题覆盖

源页所有 code themes 均已覆盖：@expo/ui 的 npm / Yarn / pnpm / Bun 安装命令、既有 React Native app 先安装 Expo module 的前置条件、使用 Host + Button 的 React example，以及 Host 的 matchContents 容器属性。源页没有提供每个组件实现代码，只列组件目录，已在上方完整列出。

## 下一页

页脚 **Next** 指向 [AlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/)，讲解由 Compose 绘制的 Android 原生确认 / 提示对话框。

**翻页：**[上一页：Expo UI 概览](./014-Expo-UI概览.md) · [返回目录](./README.md) · [下一页：AlertDialog](./016-Jetpack-Compose-AlertDialog.md)
