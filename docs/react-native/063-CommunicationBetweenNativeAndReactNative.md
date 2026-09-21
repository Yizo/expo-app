# 063 Communication between native and React Native

**翻页：** [上一页：062 Publishing to Google Play Store](062-PublishingGooglePlayStore.md) · [目录](README.md) · [下一页：064 React Native Gradle Plugin](064-ReactNativeGradlePlugin.md)

**官方页面：** [Communication between native and React Native · React Native](https://reactnative.dev/docs/communication-android)  
**源页代码覆盖：** Android Java/Kotlin `ReactActivityDelegate.getLaunchOptions` 初始 Bundle、JS props 消费、`ReactRootView.appProperties` 更新、`@ReactProp` setter、native-to-JS events 与 RN-to-native module 调用。

## 同一 App 有两套 UI 时如何通信

纯 React/RN 组件树使用单向数据流：父组件通过 props 把值传给子组件，子组件通过 callback 请求父级更新状态。混合应用中，还会有原生 Android Activity/View 与 RN view 相互通信，需要把值跨过 JS/native 边界。

本页示例使用较传统的 `ReactActivityDelegate`、`ReactRootView` 和事件/NativeModule 机制；若项目已使用 Fabric/TurboModule，应按该架构的对应 API 实现。本页适合理解数据流种类和边界。

## 原生先把 props 传给 RN

Android 宿主可在自定义 `ReactActivityDelegate.getLaunchOptions()` 返回一个 `Bundle`，Activity 启动 RN 根组件时会收到这些 props。Java 与 Kotlin 做同一件事：

```kotlin
class MainActivity : ReactActivity() {
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    object : ReactActivityDelegate(this, mainComponentName) {
      override fun getLaunchOptions(): Bundle = Bundle().apply {
        putStringArrayList(
          "imageUrls",
          arrayListOf("https://example.com/a.png", "https://example.com/b.png"),
        )
      }
    }
}
```

```java
@Override
protected ReactActivityDelegate createReactActivityDelegate() {
  return new ReactActivityDelegate(this, getMainComponentName()) {
    @Override protected Bundle getLaunchOptions() {
      Bundle props = new Bundle();
      props.putStringArrayList("imageUrls", new ArrayList<>(Arrays.asList(urlA, urlB)));
      return props;
    }
  };
}
```

React 根组件可从 props 读取数据并渲染成 RN Image：

```tsx
function ImageBrowser({ imageUrls }: { imageUrls: string[] }) {
  return (
    <View>
      {imageUrls.map(uri => (
        <Image key={uri} source={{ uri }} style={{ width: 160, height: 100 }} />
      ))}
    </View>
  );
}
```

Bundle 只适合 Android 支持的轻量数据类型；复杂对象要按 RN 可序列化数据格式传输。不要把 token 等敏感值放进可被日志记录的 launch extras。

## 之后更新根 props

传统 `ReactRootView` 有读写 `appProperties`：原生端可取得 Bundle、改值并重新设置；React 根组件会收到新 props 并重渲染。`appProperties` 的更新在 UI main thread 执行，读取则可在任意线程。该 API 更新的是整份 props，需要在宿主封装内自行合并新旧属性，而不是假设“只补某几个字段”。

```kotlin
val nextProps = reactRootView.appProperties ?: Bundle()
nextProps.putStringArrayList("imageUrls", updatedUrls)
runOnUiThread { reactRootView.appProperties = nextProps }
```

## RN props 设置原生组件

当 RN 使用一个原生 UI component 时，原生 ViewManager 可用 `@ReactProp` 标记 setter；React 组件更新 prop 时，setter 把值写进原生 View。Fabric Native Component 的当前写法见前面页面的 Codegen/Fabric guide。

```java
@ReactProp(name = "sourceUrl")
public void setSourceUrl(ReactWebView view, String url) {
  if (url != null) view.loadUrl(url);
}
```

## 回传数据：事件和 Native Modules

Props 主要用于自上而下的值，不适合组件向宿主反馈用户行为。原生端需要通知 JS 时，可发 native event；JS 需要调用原生操作时，使用 Native Module/Turbo Native Module。

**Events（事件）** 可从多个原生地方发送，JS 异步接收，不保证在某个精确时刻执行。它虽然灵活，但容易让模块之间形成隐式全局依赖，事件名共享 namespace 也可能冲突。如果同一 Native Component 有多个实例，要传 instance ID（如原生 View 的 `reactTag`）区分目标。

**Native Module** 则把原生方法/常量以 JS 函数和对象公开。旧架构中通常每个 JS bridge 创建一个模块实例；模块名同样共享 namespace，命名要避免冲突。新项目的 Native Module 应优先用 Turbo Native Module 和 Codegen。

选择方法：初始化配置用 initial props；原生组件输入值用 props；用户操作回传用组件事件；JS 主动请求平台能力用 Native Module。

**翻页：** [上一页：062 Publishing to Google Play Store](062-PublishingGooglePlayStore.md) · [目录](README.md) · [下一页：064 React Native Gradle Plugin](064-ReactNativeGradlePlugin.md)
