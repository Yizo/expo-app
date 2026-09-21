# 057 Fabric Native Components Introduction

**翻页：** [上一页：056 Advanced Topics on Native Modules Development](056-AdvancedNativeModules.md) · [目录](README.md) · [下一页：058 Advanced Topics on Native Components](058-AdvancedNativeComponents.md)

**官方页面：** [Fabric Native Components Introduction · React Native](https://reactnative.dev/docs/fabric-native-components-introduction)  
**版本范围：** 示例是 RN 0.87 New Architecture/Fabric。  
**源页代码覆盖：** RN CLI init 与目录、TS/Flow WebView Spec、Codegen config、Android Java/Kotlin WebView/Event/Manager/Package/MainApplication、iOS Objective-C++ UIView/props/event/descriptor/WebKit、App.tsx 组件调用和 Android/iOS 构建命令。

## Native Module 与 Native Component

上一页的 Native Module 没有 UI；**Native Component（原生组件）** 把 Android/iOS 平台 View、widget 或 controller 包装成 React 组件。RN 新架构用 Fabric Native Component 表达这层边界：JS 提供类型化 props/events，Codegen 生成 glue，Android/iOS 端创建对应原生 View。

本教程把 Android `WebView` 与 iOS `WKWebView` 包装成一个统一 React `WebView`。New Architecture 为必需条件；需要同时支持 Legacy Architecture 时，RN 官方建议使用兼容性指南。

## 初始化工程结构

官方示例建立 RN 0.87 项目并暂不安装 Pods，然后建 `specs/` 和 Android 原生包目录：

```sh
npx @react-native-community/cli@latest init WebViewDemo --install-pods false
mkdir -p WebViewDemo/specs WebViewDemo/android/app/src/main/java/com/webview
```

`specs/` 保存 Codegen 输入；`android/` 和 `ios/` 分别放原生实现。

## 用 TS/Flow 定义 React 组件规格

Codegen 只把名字符合 `<组件名>NativeComponent.ts|js` 的规范文件识别成组件 spec。spec 要声明组件 props 和事件 payload 类型。这里定义可选 URL 与加载完成事件，事件结果只有 `success`/`error`：

```tsx
import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

type ScriptLoadedEvent = { result: 'success' | 'error' };

export interface NativeProps extends ViewProps {
  sourceURL?: string;
  onScriptLoaded?: CodegenTypes.BubblingEventHandler<ScriptLoadedEvent> | null;
}

export default codegenNativeComponent<NativeProps>(
  'CustomWebView'
) as HostComponent<NativeProps>;
```

Flow spec 表达同一类型契约：`NativeProps` 是只读对象，继承 `ViewProps`，声明 `sourceURL` 和 `CodegenTypes.BubblingEventHandler`，再用 `codegenNativeComponent` 创建 `HostComponent`。事件类型必须描述传回 JS 的数据，组件名需与平台注册名一致。

## Codegen 配置

package.json 选 `type: "components"`，指向 `specs` 文件夹；Android 写生成 Java 的包名，iOS 用 `componentProvider` 把 JS 名 `CustomWebView` 映射到 Obj-C `RCTWebView` 类名。

```json
{
  "codegenConfig": {
    "name": "AppSpec",
    "type": "components",
    "jsSrcsDir": "specs",
    "android": { "javaPackageName": "com.webview" },
    "ios": {
      "componentProvider": { "CustomWebView": "RCTWebView" }
    }
  }
}
```

## Android：原生 WebView、事件和 ViewManager

### 实现 `ReactWebView`

先运行 RN Gradle Plugin 的 Codegen task，生成 Manager interface/delegate：

```sh
cd android
./gradlew generateCodegenArtifactsFromSchema
```

`ReactWebView` 继承 Android `WebView`。构造函数调用统一配置方法，将布局占满父容器，给 `WebViewClient` 设置页面加载回调。在 `onPageFinished` 时构造 `{ result: 'success' }` 并发送给 JS。

事件发送逻辑需要：取得 `ReactContext`、该 View 所属 `surfaceId` 和对应 `EventDispatcher`；创建 `WritableMap` payload，再 dispatch 自定义 Event。Java/Kotlin 都执行这组步骤。概念性 Kotlin 轮廓如下：

```kotlin
class ReactWebView(context: Context) : WebView(context) {
  init {
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    webViewClient = object : WebViewClient() {
      override fun onPageFinished(view: WebView, url: String) {
        emitScriptLoaded("success")
      }
    }
  }

  private fun emitScriptLoaded(result: String) {
    val reactContext = context as ReactContext
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    val payload = Arguments.createMap().apply { putString("result", result) }
    dispatcher?.dispatchEvent(OnScriptLoadedEvent(surfaceId, id, payload))
  }
}
```

自定义 `OnScriptLoadedEvent` 继承 RN `Event`，其 `getEventName()` 返回与 spec 的 prop 对应的事件名；`getEventData()` 返回上面的 payload。实现也包括 success/error enum。Java 版本由 Java `Event` 子类完成同样的 `getEventName` / `getEventData`。

### ViewManager 把 props 映射到原生 View

`ReactWebViewManager` 继承 `SimpleViewManager<ReactWebView>`，实现 Codegen 生成的 `CustomWebViewManagerInterface`，并返回生成的 ManagerDelegate。`getName()` 要和 `codegenNativeComponent('CustomWebView')` 一致；`createViewInstance()` 创建新的 WebView；`@ReactProp(name="sourceUrl")` 将 JS string prop 写到 WebView 的 `loadUrl()`。

```kotlin
class ReactWebViewManager :
  SimpleViewManager<ReactWebView>(),
  CustomWebViewManagerInterface<ReactWebView> {
  private val delegate = CustomWebViewManagerDelegate(this)
  override fun getDelegate() = delegate
  override fun getName() = "CustomWebView"
  override fun createViewInstance(context: ThemedReactContext) = ReactWebView(context)

  @ReactProp(name = "sourceUrl")
  override fun setSourceURL(view: ReactWebView, sourceURL: String?) {
    if (sourceURL == null) view.emitScriptLoaded("error") else view.loadUrl(sourceURL)
  }
}
```

如果事件是 bubbling event，Manager 还要把源事件映射到 `onScriptLoaded`/capture 名称；direct event 则配置对应 direct event constants。页面的 Java 与 Kotlin Manager 都通过同样的接口、delegate、prop setter 和事件映射完成。

### Package 和应用注册

`ReactWebViewPackage` 继承 `BaseReactPackage`，用 `createViewManagers()` 返回 Manager，按名称获取模块/组件，并提供 `ReactModuleInfo` 元数据（New Architecture 标记）。Java 和 Kotlin 两种 package 示例职责一样。随后在 `MainApplication` 的 `getPackages()` 把它加入 `PackageList` 返回值；自动链接库可以由构建系统处理，自定义 App 内组件在此示例中手动添加。

```kotlin
override fun getPackages(): List<ReactPackage> = PackageList(this).packages.apply {
  add(ReactWebViewPackage())
}
```

## iOS：用 WKWebView 实现 Fabric View

### 准备 Xcode

运行 `bundle install` 与 `bundle exec pod install`（Pods build phase 会触发 Codegen），用 Xcode 打开 CocoaPods 生成的 `.xcworkspace`。新增 Obj-C 类 `RCTWebView`，将 `.m` 改为 `.mm`，因为 Fabric 生成接口和 event emitter 使用 C++。WebView 示例还要在 Xcode App Target 链接 WebKit framework。

### 视图、Props 与事件

Header 中的 `RCTWebView` 继承 RN `RCTViewComponentView`；实现类遵循 Codegen 生成的 `RCTCustomWebViewViewProtocol` 和 WebKit 的 `WKNavigationDelegate`。

`init` 创建 `WKWebView`、设置 navigation delegate 并加入子视图。`updateProps:oldProps:` 比较旧/新生成 props；`sourceURL` 变化时转成 NSURL 并加载请求，然后调用 super。`layoutSubviews` 将 WebView frame 设为 Fabric view bounds。`didFinishNavigation` 创建 `OnScriptLoaded` success event 并发送；URL 无效时发 error。最后通过强类型 `eventEmitter` 便利方法发送，并在 `componentDescriptorProvider` 返回 Codegen 生成的 Component Descriptor。

```objc
// RCTWebView.h
@interface RCTWebView : RCTViewComponentView
@end

// RCTWebView.mm 核心职责示意
- (instancetype)init {
  if ((self = [super init])) {
    _webView = [WKWebView new];
    _webView.navigationDelegate = self;
    [self addSubview:_webView];
  }
  return self;
}

- (void)layoutSubviews {
  [super layoutSubviews];
  _webView.frame = self.bounds;
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
  self.eventEmitter.onScriptLoaded(/* Success result */);
}
```

上面是省略的代码轮廓，实际 Props 转换要使用 Codegen 输出的 `CustomWebViewProps`，事件需用生成的 `CustomWebViewEventEmitter`/result 类型。源页也示范 `updateProps` 中比较 `sourceURL`、检查 URL、加载 `NSURLRequest` 和 Component Descriptor 返回值。

## 在 React 中使用并运行

导入 Codegen 生成的 JS Host Component，传 `sourceURL` 和样式，监听 `onScriptLoaded`。页面示例在载入完成时显示 Alert：

```tsx
<WebView
  sourceURL="https://example.com/help"
  style={{ width: '100%', height: '100%' }}
  onScriptLoaded={event => {
    if (event.nativeEvent.result === 'success') Alert.alert('页面已加载');
  }}
/>
```

重新编译原生端后分别运行 `yarn run android` 与 `yarn run ios`。增加原生 ViewManager、Codegen 输出、WebKit framework 等都要求新的 native build；Fast Refresh 只刷新 JS 端。

**翻页：** [上一页：056 Advanced Topics on Native Modules Development](056-AdvancedNativeModules.md) · [目录](README.md) · [下一页：058 Advanced Topics on Native Components](058-AdvancedNativeComponents.md)
