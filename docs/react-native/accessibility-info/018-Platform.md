# 018 Platform

**翻页：** [上一页：017 PixelRatio](017-PixelRatio.md) · [目录](README.md) · [下一页：019 PlatformColor](019-PlatformColor.md)

**官方页面：** [Platform · React Native](https://reactnative.dev/docs/platform)  
**源页代码覆盖：** OS/version/device constants、平台条件渲染、Platform.select 样式及组件选择、Android/iOS 与 native/default 回退优先级。

## 读取运行平台

**Platform** 是运行环境信息入口，也可按 Android/iOS 选择不同实现。**Platform.OS** 返回 android 或 ios；**Platform.Version** 返回系统版本，Android 是数字、iOS 是字符串。不要拿 RN 版本和 OS 版本混在一起。

设备标志包括 **isPad**（iPad）、**isTV**（电视）、**isVision**（Apple Vision 原生 app）和 **isTesting**。Vision Pro 如果运行的是 Designed for iPad 版本，isVision 为 false、isPad 为 true。

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      useNewAndroidPermissionFlow();
    }

## Platform.select

**Platform.select(config)** 根据当前平台返回最适配项，查找优先级是 android/ios 对应键，然后 native，再到 default。值可以是任意类型，也可返回动态加载的组件 provider。

    const cardStyle = {
      flex: 1,
      ...Platform.select({
        android: { backgroundColor: '#237b52' },
        ios: { backgroundColor: '#a94343' },
        default: { backgroundColor: '#385f91' },
      }),
    };

    const AppSpecificView = Platform.select({
      ios: () => require('./PlatformView.ios').default,
      android: () => require('./PlatformView.android').default,
      native: () => require('./PlatformView.native').default,
      default: () => require('./PlatformView.web').default,
    })();

## constants 平台信息

**Platform.constants** 返回通用和平台特定常量。

| 字段 | 平台与说明 |
|---|---|
| **isTesting** | 是否以测试 flag 运行。 |
| **reactNativeVersion** | RN major/minor/patch 版本号，可有 prerelease。 |
| **Version** | Android OS 数字版本；iOS OS 字符串版本。 |
| **Release** | Android 系统版本字符串。 |
| **Serial** | Android 硬件序列信息。 |
| **Fingerprint** | Android build 唯一标识字符串。 |
| **Model / Brand / Manufacturer** | Android 设备面向用户型号、品牌和制造商信息。 |
| **ServerHost** | Android，可选 Metro/开发服务主机。 |
| **uiMode** | Android：car、desk、normal、tv、watch 或 unknown。 |
| **forceTouchAvailable** | iOS：设备是否有 3D Touch。 |
| **interfaceIdiom** | iOS：设备界面类别。 |
| **osVersion / systemName** | iOS 操作系统版本和系统名。 |

避免把硬件标识作为业务数据持久化或采集；只读取完成当前平台适配所需的字段。

## 代码覆盖清单

已改写源页两个示例主题：按平台选择样式和动态组件。所有平台属性、constants 子字段、select 的 android/ios/native/default 回退顺序与 OS/version 类型差异均已覆盖。

**翻页：** [上一页：017 PixelRatio](017-PixelRatio.md) · [目录](README.md) · [下一页：019 PlatformColor](019-PlatformColor.md)
