# 019 PlatformColor

**翻页：** [上一页：018 Platform](018-Platform.md) · [目录](README.md) · [下一页：020 ReactNativeVersion](020-ReactNativeVersion.md)

**官方页面：** [PlatformColor · React Native](https://reactnative.dev/docs/platformcolor)  
**源页代码覆盖：** 原生系统色 token、默认与 fallback 名称、Android/iOS 命名方式、Platform.OS/Platform.select 平台保护。

## 使用操作系统的系统色

**PlatformColor(...)** 将原生平台的系统颜色 token 映射为 RN 可用颜色。系统色会随主题、高对比度等系统偏好变化，因此能让界面更贴合本平台外观。

可传多个名字：第一个是默认项，其余是 fallback。某个颜色名必须在当前原生系统上存在；跨平台样式应先用 **Platform.OS** 或 **Platform.select** 选取当前端可识别的 token，避免运行时找不到颜色。

    const accent = Platform.select({
      ios: PlatformColor('systemBlue'),
      android: PlatformColor('?attr/colorAccent', '@android:color/holo_blue_light'),
      default: '#2878c8',
    });

    <Text style={{ color: accent }}>使用系统强调色</Text>

Android 常见写法：主题属性前缀 **?attr**，系统颜色资源前缀 **@android:color**。iOS 使用 UIColor 标准色/界面语义色名称。官方页面未给出跨平台统一可用的所有颜色清单，应查对应平台系统颜色列表。

## 代码覆盖清单

已重写默认及 fallback 色名、Platform.select 保护和 Text 样式使用片段；Android/iOS 原生命名体系与主题/高对比变化均有说明。

**翻页：** [上一页：018 Platform](018-Platform.md) · [目录](README.md) · [下一页：020 ReactNativeVersion](020-ReactNativeVersion.md)
