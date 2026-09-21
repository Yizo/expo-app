# 076 Settings

**翻页：** [上一页：075 DynamicColorIOS](075-DynamicColorIOS.md) · [目录](README.md) · **无后续页面，已到官方 Next 链终点** · [返回目录](README.md)

**官方页面：** [Settings · React Native](https://reactnative.dev/docs/settings)  
**源页代码覆盖：** iOS NSUserDefaults 持久 key-value 存储、get/set、watchKeys/clearWatch 订阅与“忽略 RN 内部 set 变化”限制。

## iOS 持久设置

**Settings** 仅 iOS 使用，是系统 **NSUserDefaults** 持久化 key-value 存储的包装。它适合写入原生侧需要读取的简单偏好。RN app 通用持久化另有 AsyncStorage 等选择；本 API 不跨平台。

**get(key)** 读取当前值；**set(settings)** 可一次写入一个或多个 key/value。

    Settings.set({ onboardingComplete: true, preferredView: 'grid' });
    const completed = Settings.get('onboardingComplete');

## 监听原生侧修改

**watchKeys(keys, callback)** 订阅一个 key 或多个 key；指定 NSUserDefaults 中有值发生变化时触发，返回 watchId。用 **clearWatch(watchId)** 取消订阅。

需要注意：watchKeys 按设计忽略 RN 代码内部 **Settings.set()** 造成的改变；它只对 React Native 代码之外的修改触发 callback。

    const watchId = Settings.watchKeys(
      ['nativeTheme', 'systemRegion'],
      () => refreshNativePreferences(),
    );

    // 组件或服务结束时清理
    Settings.clearWatch(watchId);

## API 速查与链末

| 方法 | 用途 |
|---|---|
| **get(key)** | 读取指定 NSUserDefaults key 当前值。 |
| **set(settings)** | 写入一个或多个 key/value。 |
| **watchKeys(keys, callback)** | 监听一个或多个 key 的外部变化，返回 id。 |
| **clearWatch(watchId)** | 取消对应订阅。 |

## 本模块终点

当前 React Native 官方 footer 的 Settings 页面没有 Next，因此本页为起始 URL AccessibilityInfo 的 Next 单链终点，共 76 个编号页。侧栏中未通过 footer Next 到达的其他 API 不属于本模块遍历范围。

## 代码覆盖清单

源页有 Settings API 示例区但没有完整 HTML 页面；本文重写读写和订阅清理片段，覆盖四个方法及 watchKeys 对内部 set 的特殊限制。

**翻页：** [上一页：075 DynamicColorIOS](075-DynamicColorIOS.md) · [目录](README.md) · **无后续页面，已到官方 Next 链终点** · [返回目录](README.md)
