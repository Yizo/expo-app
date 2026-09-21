# 005｜在 Expo 中使用 React Native 与第三方库

**翻页：**[上一页：连续原生生成 CNG](./004-连续原生生成CNG.md) · [目录](./README.md) · [下一页：隐私清单](./006-隐私清单.md)

**官方页面：**[Using Expo SDK, React Native, and third-party libraries](https://docs.expo.dev/workflow/using-libraries/)

**版本说明：**本页是未版本化指南。本地项目使用 Expo `~56.0.11`；检查包的 SDK 兼容性时，要读 v56 参考和对应平台支持表，不能仅凭 npm 包能安装就判断可用于该设备。

## React Native 核心组件

基础组件由 `react-native` 包提供。它们对应移动操作系统的原生视图，不是浏览器 DOM 标签：

```tsx
import { Text, View } from 'react-native';

export default function Greeting() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Hello from a native view</Text>
    </View>
  );
}
```

常见核心组件还有 `ActivityIndicator`、`TextInput` 和 `ScrollView`。它们解决基础 UI；设备系统能力通常使用 Expo SDK 模块。

## Expo SDK 库

Expo SDK 提供相机、音频、联系人、视频、日历、传感器、OAuth、地图、更新等模块。安装时优先用 `npx expo install`，CLI 会选择与项目 Expo SDK 兼容的包版本并提示已知冲突：

```sh
npx expo install expo-device
npx expo install @react-navigation/native
```

API 参考顶部的 **Platform compatibility** 标签表示包支持的平台和运行环境；参考页还会说明是否需要 Config Plugin、安装命令、代码示例和 API 类型。TypeScript 编辑器的自动完成也能显示接口和函数的类型信息。

给既有 RN CLI 工程加入 SDK 前，先按官方流程安装 Expo Modules；与 Prebuild 已配置的 Expo 工程不同，手动原生工程需要自行完成模块接入。

## 选择第三方库

找 React Native 专用库可先查 React Native Directory，再看 npm registry。npm 上许多包针对 Node.js 或浏览器，不一定提供 RN 所需的原生实现。可以到官方目录的 GitHub 链接或 npm 包主页看维护状态、安装步骤、平台支持和 peer dependencies。

比如源页推荐用 `npm-home` 打开 GitHub 或 README：

```sh
npx npm-home --github react-native-localize
npx npm-home @react-navigation/native
```

Yarn / pnpm / Bun 的等价命令分别用 `yarn dlx`、`pnpm dlx`、`bunx` 运行。

## Expo Go 与 Development Build

很多 JS 纯逻辑库不需要额外原生代码；包含自定义原生代码的库能在 Development Build 中集成，但不一定在 Expo Go 里可运行。Expo Go 是固定的一套预装原生模块；Development Build 编译了当前 app 需要的原生依赖，所以更适合 production 项目。

判断库是否需要原生配置，检查：

- npm 包是否包含 `android/` 或 `ios/` 目录；
- README 是否要求 linking；
- 是否要编辑 Manifest、Podfile、Info.plist、Gradle；
- 是否提供 Config Plugin。

任一项需要原生设置，就要生成或更新原生项目并重新构建 Development Build。若在 RN CLI 项目手动维护原生目录，可以直接遵循库 README 做平台设置；若采用 CNG，则应通过库自带或社区 Config Plugin 自动化配置。

## 依赖安装和版本检查例外

通常使用 `npx expo install` 安装兼容版本，而不是直接 `npm install` / `yarn add`。如果某第三方库版本固定且要排除 Expo 的兼容性检查，可在 package.json 中配置排除列表：

```json
{
  "expo": {
    "install": {
      "exclude": ["some-fixed-package"]
    }
  }
}
```

排除只会影响安装 / Doctor 等版本检查，不会让原本不兼容的包突然可运行；使用者仍需自行验证平台和运行时。

## 关键名词

- **Core component**：React Native 自带的基础原生组件，如 `View`、`Text`。
- **Platform compatibility tag**：API reference 对 Android、iOS、Web、Expo Go 等支持情况的标签。
- **Linking / Autolinking**：把原生包注册到 Android / iOS 工程，使 JS bridge 或新架构识别其代码。
- **Config Plugin**：Prebuild 阶段自动设置原生工程参数的插件。
- **Peer dependency**：库声明消费者应安装的宿主框架范围，例如它兼容哪些 Expo / React Native 版本。

## 官方代码主题覆盖

源页所有代码主题均有改写示例：RN `Text` / `View` 组件、安装 SDK 包、用 `npm-home` 找包源码与 README、第三方包安装、Yarn / pnpm / Bun 命令变体，以及 `package.json` 的 `expo.install.exclude`。对“需要 Development Build”的原生库兼容性判断流程也逐项覆盖。

## 下一页

页脚 **Next** 指向 [Privacy manifests](https://docs.expo.dev/app-integrity/privacy-manifest/)，介绍 iOS 隐私清单。

**翻页：**[上一页：连续原生生成 CNG](./004-连续原生生成CNG.md) · [返回目录](./README.md) · [下一页：隐私清单](./006-隐私清单.md)
