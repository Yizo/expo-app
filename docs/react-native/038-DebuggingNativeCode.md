# 038 Debugging Native Code

**翻页：** [上一页：037 React Native DevTools](037-ReactNativeDevTools.md) · [目录](README.md) · [下一页：039 Debugging Release Builds](039-DebuggingReleaseBuilds.md)

**官方页面：** [Debugging Native Code · React Native](https://reactnative.dev/docs/debugging-native-code)  
**源页代码覆盖：** Android/iOS 日志 CLI、ADB logcat 过滤、Java Log.d、Objective-C NSLog、Swift print，以及 Android Studio/Xcode 附加到运行进程。

## JS 调试和原生调试是两件事

React Native DevTools 适合查看 JavaScript、组件树、JS 网络与 React 性能。当问题出现在原生 Module、Kotlin/Java、Swift/Objective-C、Gradle、Pods 或平台生命周期时，使用 Android Studio 和 Xcode 的断点与原生日志。

## 从终端查看日志

应用运行时，RN CLI 可过滤原生日志：

```sh
npx react-native log-android
npx react-native log-ios
```

iOS Simulator 也可在菜单 Debug > Open System Log 查看。Android 用 Logcat 过滤 React Native tag：

```sh
adb logcat "*:S" ReactNative:V ReactNativeJS:V
```

如果原生模块添加了自定义 tag，可一起过滤。例如 Java/Kotlin 侧用 Android `Log.d` 写入，再在 Logcat 中包含该 tag：

```java
import android.util.Log;

private void log(String message) {
  Log.d("ProfileNativeModule", message);
}
```

```sh
adb logcat "*:S" ReactNative:V ReactNativeJS:V ProfileNativeModule:D
```

iOS 原生代码可用 Objective-C `NSLog` 或 Swift `print`；输出会出现在运行该 App 的 Xcode Console：

```objc
NSLog(@"ProfileNativeModule: %@", message);
```

```swift
print("ProfileNativeModule: \(message)")
```

不要把 access token、密码或个人数据放进原生日志。Debug logs 有时会被保存、转发到 CI 或用户反馈附件。

## 在原生 IDE 中调试

可直接从 Android Studio 或 Xcode 启动 App 并设置原生断点，就像普通原生 App 一样。也可以先用 RN CLI 启动，再让 IDE 附加到已运行进程：Android Studio 选择 Run > Attach to Process；Xcode 在 Debug > Attach to Process 中选当前应用。

本地复现时按原生调用栈查 Java/Obj-C/Swift 错误；JS 层错误仍优先从 DevTools 看。原生 IDE 能访问 RN DevTools 看不到的线程、生命周期和平台模块状态。

**翻页：** [上一页：037 React Native DevTools](037-ReactNativeDevTools.md) · [目录](README.md) · [下一页：039 Debugging Release Builds](039-DebuggingReleaseBuilds.md)
