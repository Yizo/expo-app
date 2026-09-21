# 014｜Expo UI 概览

**翻页：**[上一页：Expo Router UI](./013-Expo-Router-UI.md) · [目录](./README.md) · [下一页：Jetpack Compose 组件](./015-Jetpack-Compose.md)

**官方页面：**[Expo UI overview](https://docs.expo.dev/versions/latest/sdk/ui/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；SDK v56 exact reference [Expo UI](https://docs.expo.dev/versions/v56.0.0/sdk/ui/) 推荐 ~56.0.26。页面里的 API 属于原生 UI library，具体 component props 必须按安装 SDK 对应的 Jetpack Compose / SwiftUI reference 校对。

## Expo UI 要解决什么

@expo/ui 让 React component 树可以使用真正的原生 UI toolkit：Android 侧为 Jetpack Compose，iOS 侧为 SwiftUI。它适合输入框、菜单、日期 / 颜色选择器等原生交互，而不是把每一种原生控件都画成 RN View。

入口分成三个族：

- **Jetpack Compose**：Android 原生组件。
- **SwiftUI**：iOS 原生组件。
- **Universal**：一份 API 同时在 Android、iOS 和 Web 运行，适合跨平台基础 UI。

页面也列出 popular React Native community libraries 的 drop-in replacements。如果当前 app 已经依赖相似社区库，可比较迁移成本；列表本身不表示所有属性行为逐项完全相同。

## 用 Host 包住 Android 原生组件

Compose 和 SwiftUI view 不是普通 RN View。它们需要各自的原生 Host 容器来挂到 React tree。下面是 Compose 页面介绍的最小按钮模式：

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

export function SaveButton() {
  return (
    <Host matchContents>
      <Button onClick={() => alert('Saved')}>
        Save changes
      </Button>
    </Host>
  );
}
```

这里的 onClick 是 Compose 按钮事件；React Native Button 常用的是 onPress。具体 import 和 props 在接下来的 Jetpack Compose / SwiftUI 分支 reference 里逐项列出。

## 官方组件目录

### Jetpack Compose / Android

AlertDialog、Badge、BadgedBox、BasicAlertDialog、Box、Button、Card、Carousel、Checkbox、Chip、Column、DateTimePicker、Divider、DockedSearchBar、DropdownMenu、ExposedDropdownMenuBox、FloatingActionButton、FlowRow、HorizontalFloatingToolbar、HorizontalPager、Host、Icon、IconButton、LazyColumn、LazyRow、ListItem、LoadingIndicator、Material Colors、ModalBottomSheet、Modifiers、NavigationBar、Progress indicators、PullToRefreshBox、RadioButton、RNHostView、Row、SearchBar、SegmentedButton、Shape、Slider、Snackbar、Spacer、Surface、Switch、Text、TextField、ToggleButton、Tooltip、useNativeState。

### SwiftUI / iOS

AccessoryWidgetBackground、Alert、BottomSheet、Button、ColorPicker、ConfirmationDialog、ContextMenu、ControlGroup、DatePicker、DisclosureGroup、Divider、Form、Gauge、Group、Host、HStack、Image、Label、LazyHStack、LazyVStack、Link、List、Menu、Modifiers、Namespace、Overlay、Picker、Popover、ProgressView、RNHostView、ScrollView、Section、SecureField、Slider、Spacer、SwipeActions、TabView、Text、TextField、Toggle、useNativeState、VStack、ZStack。

### React Native 库的 Drop-in replacements

| Expo UI component | 对应常见社区库 |
| --- | --- |
| BottomSheet | @gorhom/bottom-sheet |
| DateTimePicker | @react-native-community/datetimepicker |
| MaskedView | @react-native-masked-view/masked-view |
| Menu | @react-native-menu/menu |
| PagerView | react-native-pager-view |
| Picker | @react-native-picker/picker |
| SegmentedControl | @react-native-segmented-control/segmented-control |
| Slider | @react-native-community/slider |

### Universal / Android、iOS 与 Web

BottomSheet、Button、Checkbox、Collapsible、Column、FieldGroup、Host、Icon、List、Picker、RNHostView、Row、ScrollView、Slider、Spacer、Switch、Text、TextInput。

## 关键名词

- **Jetpack Compose**：Android 的声明式原生 UI toolkit；Compose component 最终绘制成 Android 原生界面。
- **SwiftUI**：Apple 的声明式 UI toolkit；Expo UI component 可创建 SwiftUI 控件。
- **Host**：把原生 Compose / SwiftUI 子树放到 React Native 页面中的容器。
- **Universal component**：组件 API 同时支持 Android、iOS、Web。
- **Drop-in replacement**：针对已知 React Native community package 提供的近似替代实现；迁移前仍需逐项检查功能和 prop 差异。
- **Material / system control**：由 Android / iOS toolkit 绘制的系统风格控件，而非仅靠 RN stylesheet 模拟。

## 官方代码主题覆盖

Expo UI overview 源页没有独立代码块，只有三类组件导航清单；上文逐项列出 Android Compose、SwiftUI、Universal components 和 8 个 drop-in replacement。另加入来自同一官方页面 Next Compose reference 的最小 Host + Button 预览示例，以便说明“在 React 中挂原生控件”的基本结构。

## 下一页

页脚 **Next** 指向 [Jetpack Compose overview](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/)，介绍 Android 原生 Compose 的安装方式、Host 使用方法和组件列表。

**翻页：**[上一页：Expo Router UI](./013-Expo-Router-UI.md) · [返回目录](./README.md) · [下一页：Jetpack Compose 组件](./015-Jetpack-Compose.md)
