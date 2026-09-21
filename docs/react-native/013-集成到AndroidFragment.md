# 013 集成到 Android Fragment（Integration with an Android Fragment）

**翻页：** [上一页：012 集成到现有应用（Integration with Existing Apps）](012-集成到现有应用.md) · [目录](README.md) · [下一页：014 TV 设备支持（Building For TV Devices）](014-TV设备支持.md)

**官方页面：** [Integration with an Android Fragment · React Native](https://reactnative.dev/docs/integration-with-android-fragment)
**源页代码覆盖：** XML `FrameLayout` 容器，Java/Kotlin host Activity 的返回键接口与 FragmentManager 事务，`ReactFragment.Builder` 的组件名和启动参数。

## Fragment 场景

上一页演示用 `ReactActivity` 托管一整屏 RN 页面。已有原生应用如果用 Fragment 管理 tab、底部面板或局部区域，可以将 RN Fragment 插入现有 Activity 的布局中。开始前，先完成“集成到现有应用”页面的 React Native 配置。

## 为 RN Fragment 准备容器

例子把 RN Fragment 放在 Activity 布局中的 `FrameLayout`。容器有稳定 id，之后由 `FragmentManager` 将 RN Fragment 放到这个区域；类似方式可调整为别的原生布局。

```xml
<FrameLayout
    android:id="@+id/react_native_host"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

## Host Activity 的返回键

host Activity 不是 `ReactActivity`，因此要实现 RN 的 `DefaultHardwareBackBtnHandler`，把默认返回请求交给 AndroidX `OnBackPressedDispatcher`。官方页面明确提醒：`Activity.onBackPressed()` 自 API 33 起弃用；目标 Android API 36 的应用不应依赖它。文中 Java/Kotlin 示例都是把 callback 转给 dispatcher。

```kotlin
class MainActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {
  override fun invokeDefaultOnBackPressed() {
    onBackPressedDispatcher.onBackPressed()
  }
}
```

## 创建并装载 RN Fragment

按钮被点按后，可调用 `ReactFragment.Builder`，指定注册过的 JS 根组件名。可选的 launch options 会作为该 React Native 组件的初始 props。随后用 `supportFragmentManager` 开事务，把 Fragment 添加到 XML 容器并提交。

```kotlin
val initialProps = Bundle().apply {
  putString("message", "从原生宿主传来的内容")
}

val fragment = ReactFragment.Builder()
  .setComponentName("EmbeddedScreen")
  .setLaunchOptions(initialProps)
  .build()

supportFragmentManager.beginTransaction()
  .add(R.id.react_native_host, fragment)
  .commit()
```

Java 版本执行相同步骤：创建 `Bundle` 并放入字符串、创建 `ReactFragment.Builder`、设置组件名和 launch options，再通过 `getSupportFragmentManager().beginTransaction().add(...).commit()` 插入容器。JS 端需用相同 `AppRegistry.registerComponent` 名称注册组件。若重复按按钮可能再次 add，生产实现要处理已有 Fragment、生命周期与返回栈。

## 运行验证

启动 Metro（官方示例用 `yarn start`），再从 Android Studio 启动宿主 App，触发包含 RN Fragment 的界面，检查 bundle 能否从开发服务器载入。

**翻页：** [上一页：012 集成到现有应用（Integration with Existing Apps）](012-集成到现有应用.md) · [目录](README.md) · [下一页：014 TV 设备支持（Building For TV Devices）](014-TV设备支持.md)
