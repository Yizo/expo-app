# 030 Navigating Between Screens

**翻页：** [上一页：029 Handling Touches](029-HandlingTouches.md) · [目录](README.md) · [下一页：031 Animations](031-Animations.md)

**官方页面：** [Navigating Between Screens · React Native](https://reactnative.dev/docs/navigation)  
**源页代码覆盖：** Expo 导航模板命令、React Navigation 安装和 peer dependencies（Expo/裸 RN 区别）、iOS Pods 命令、Native Stack/静态 Navigation、navigate 参数与 route params。

## 多屏应用需要 Navigator

多数 App 由多个屏幕组成。**Navigator（导航器）** 负责显示屏幕、在屏幕间切换，并提供常见的标题栏、Tab Bar 等导航 UI。React Native 本身不规定唯一导航库；官方页面推荐社区维护的 React Navigation。若把 RN 放进已经有原生导航的应用，或需要另一种原生导航实现，可查看 `react-native-navigation`。

## 用模板开始

新项目可用 React Navigation 模板创建 Expo 工程：

```sh
npx create-expo-app@latest --template react-navigation/template
```

README 页面提供项目后续入门步骤。选择模板之前，确认当前 RN/Expo 版本与导航库版本兼容。

## 安装导航依赖

先安装核心库与 native stack，再根据工程是 Expo 还是裸 RN 安装原生 peer dependencies。裸 RN 的 iOS 工程还需要 CocoaPods。

```sh
npm install @react-navigation/native @react-navigation/native-stack

# Expo 工程：用 Expo 根据 SDK 选择兼容版本
npx expo install react-native-screens react-native-safe-area-context

# 裸 RN 工程：使用 npm 安装 peer dependency
npm install react-native-screens react-native-safe-area-context

# 裸 RN 的 iOS 依赖同步
cd ios && pod install && cd ..
```

安装后重新构建 App。导航器本身用组件形式描述屏幕树，包含各平台屏幕之间的转场逻辑。

## 定义 Native Stack 和屏幕

Stack Navigator 把屏幕组织为一个后进先出的导航栈。下面定义首页和个人资料页，并给首页设置标题。React Navigation 的 Native Stack 使用 iOS `UINavigationController` 与 Android Fragment 等原生 API，使转场更接近平台原生导航。

```tsx
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: { screen: HomeScreen, options: { title: '欢迎' } },
    Profile: { screen: ProfileScreen },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
```

在页面中调用导航方法切换目标屏幕，并可传入 route 参数：

```tsx
function HomeScreen() {
  const navigation = useNavigation();
  return (
    <Button
      title="打开用户资料"
      onPress={() => navigation.navigate('Profile', { name: '林然' })}
    />
  );
}

function ProfileScreen({ route }) {
  return <Text>当前查看：{route.params.name}</Text>;
}
```

实际 TypeScript 项目应按 React Navigation 的类型定义约束 screen name 和 route 参数，避免拼错路由或传错数据。React Navigation 还提供 Tab、Drawer 等 navigator；根据应用结构选择。

**翻页：** [上一页：029 Handling Touches](029-HandlingTouches.md) · [目录](README.md) · [下一页：031 Animations](031-Animations.md)
