# Android 生命周期监听器（Android Lifecycle Listeners）

> 原文地址：https://docs.expo.dev/modules/android-lifecycle-listeners/

---

## 概述

在 Android 原生开发中，要对特定的系统事件（如配置变更、接收到的 URL 等）做出响应，开发者通常需要在主 Application 和 Activity 的 Java/Kotlin 文件中重写（override）相应的回调方法。然而，标准的 React Native API 并没有为这些原生回调提供内置的钩子（hook），因此第三方库通常需要开发者手动插入原生代码。

Expo 框架解决了这个问题——它提供了一种自动化的方式来拦截（intercept）这些组件的生命周期函数，让开发者无需直接修改原生主文件。

**关键术语解释（面向初学者）：**

- **生命周期（Lifecycle）**：Android 中 Activity（界面）和 Application（应用）从创建到销毁的一系列状态变化过程，例如 `onCreate`（创建）、`onResume`（恢复前台）、`onPause`（进入后台）、`onDestroy`（销毁）等。
- **监听器（Listener）**：一种设计模式，用于在特定事件发生时接收通知。这里指的是"监听"Android 生命周期事件的回调接口。
- **Activity**：Android 中表示一个"界面页面"的组件，类似于一个屏幕窗口。
- **Application**：Android 中表示整个应用程序的全局组件，其生命周期覆盖整个应用运行过程。
- **Package**：Expo 模块系统中的一个接口，用于注册模块的各种监听器和功能。
- **钩子（Hook）**：在程序执行流程的特定节点插入自定义代码的机制。

---

## 快速开始

在开始之前，你需要先创建一个 Expo 模块，或者将该 API 集成到已有的 React Native 库中。在模块内部，创建一个实现了 `Package` 接口的具体类。通常，这需要你定义 Activity 监听器或 Application 监听器的创建方法。

> **基于文档内容推导**：`Package` 接口是 Expo 模块系统的核心注册入口点，通过它 Expo 框架才能自动发现和调用你定义的生命周期监听器。

---

## Activity 生命周期监听器

通过 `ReactActivityLifecycleListener` 可以拦截 Activity 级别的事件。该接口通过 React Native 的委托（delegate）机制来模拟标准的 Android 行为。支持的回调方法包括：

| 回调方法 | 触发时机 |
|---------|---------|
| `onCreate` | Activity 首次创建时 |
| `onResume` | Activity 回到前台时 |
| `onPause` | Activity 进入后台时 |
| `onDestroy` | Activity 被销毁时 |
| `onNewIntent` | 应用已运行时收到新的 Intent |
| `onBackPressed` | 用户按下返回键时 |

**关键术语解释（面向初学者）：**

- **Intent**：Android 中用于在组件之间传递消息的对象，常用于启动新的 Activity 或传递数据（例如深度链接的 URL）。
- **delegate（委托）**：一种设计模式，将某个对象的行为交给另一个对象来处理。Expo 通过 React Native 的委托来拦截 Activity 事件。

### 第一步：在 Package 类中注册 Activity 监听器

在你的 Package 类中实现 Activity 监听器的创建方法。以下是示例代码：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/mylib/MyLibPackage.kt
package expo.modules.mylib

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class MyLibPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(MyLibReactActivityLifecycleListener())
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/mylib/MyLibPackage.java
package expo.modules.mylib;

import android.content.Context;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

import java.util.Collections;
import java.util.List;

public class MyLibPackage implements Package {
  @Override
  public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    return Collections.singletonList(new MyLibReactActivityLifecycleListener());
  }
}
```

### 第二步：创建监听器类并重写生命周期方法

接下来，定义实际的监听器类，重写你需要拦截的生命周期方法。

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/mylib/MyLibReactActivityLifecycleListener.kt
package expo.modules.mylib

import android.app.Activity
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class MyLibReactActivityLifecycleListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    // 在 Activity.onCreate 中执行的自定义代码
    doSomeSetupInActivityOnCreate(activity)
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/mylib/MyLibReactActivityLifecycleListener.java
package expo.modules.mylib;

import android.app.Activity;
import android.os.Bundle;

import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class MyLibReactActivityLifecycleListener implements ReactActivityLifecycleListener {
  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    // 在 Activity.onCreate 中执行的自定义代码
    doSomeSetupInActivityOnCreate(activity);
  }
}
```

### 同时重写多个生命周期方法

你可以同时重写多个方法。以下示例演示了如何处理创建、恢复、暂停、销毁、新 Intent 和返回按钮等多种事件：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/mylib/MyLibReactActivityLifecycleListener.kt
package expo.modules.mylib

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class MyLibReactActivityLifecycleListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
    // Activity 首次创建时调用
    // 在此处进行初始化，例如处理深度链接
    val deepLinkUrl = activity?.intent?.data
    if (deepLinkUrl != null) {
      handleDeepLink(deepLinkUrl.toString())
    }
  }

  override fun onResume(activity: Activity) {
    // Activity 回到前台时调用
    // 例如，追踪用户返回应用的状态
    trackAppStateChange("active")
  }

  override fun onPause(activity: Activity) {
    // Activity 进入后台时调用
    // 例如，暂停正在进行的操作（如分析追踪）
    trackAppStateChange("inactive")
  }

  override fun onDestroy(activity: Activity) {
    // Activity 被销毁时调用
    // 在此处清理资源
    cleanup()
  }

  override fun onNewIntent(intent: Intent?): Boolean {
    // 应用已在运行时收到新 Intent 时调用
    // 例如，在应用打开状态下处理新的深度链接
    val newUrl = intent?.data
    if (newUrl != null) {
      handleDeepLink(newUrl.toString())
      return true
    }
    return false
  }

  override fun onBackPressed(): Boolean {
    // 用户按下返回键时调用
    // 返回 true 以阻止默认的返回行为
    return handleCustomBackNavigation()
  }

  // 你可以在此添加私有函数来处理
  // 深度链接、应用状态追踪、清理等逻辑
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/mylib/MyLibReactActivityLifecycleListener.java
package expo.modules.mylib;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class MyLibReactActivityLifecycleListener implements ReactActivityLifecycleListener {
  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    // Activity 首次创建时调用
    // 在此处进行初始化，例如处理深度链接
    Uri deepLinkUrl = activity.getIntent().getData();
    if (deepLinkUrl != null) {
      handleDeepLink(deepLinkUrl.toString());
    }
  }

  @Override
  public void onResume(Activity activity) {
    // Activity 回到前台时调用
    // 例如，追踪用户返回应用的状态
    trackAppStateChange("active");
  }

  @Override
  public void onPause(Activity activity) {
    // Activity 进入后台时调用
    // 例如，暂停正在进行的操作（如分析追踪）
    trackAppStateChange("inactive");
  }

  @Override
  public void onDestroy(Activity activity) {
    // Activity 被销毁时调用
    // 在此处清理资源
    cleanup();
  }

  @Override
  public boolean onNewIntent(Intent intent) {
    // 应用已在运行时收到新 Intent 时调用
    // 例如，在应用打开状态下处理新的深度链接
    Uri newUrl = intent.getData();
    if (newUrl != null) {
      handleDeepLink(newUrl.toString());
      return true;
    }
    return false;
  }

  @Override
  public boolean onBackPressed() {
    // 用户按下返回键时调用
    // 返回 true 以阻止默认的返回行为
    return handleCustomBackNavigation();
  }

  // 你可以在此添加私有函数来处理
  // 深度链接、应用状态追踪、清理等逻辑
}
```

> **基于经验建议**：只重写你真正需要的生命周期方法，不要为了"预防万一"而重写所有方法。多余的重写会增加维护成本，并可能引入意外副作用。

---

## 生命周期监听器到 JavaScript 的事件流

由于这些监听器以单例（singleton）形式运行，与模块实例相互独立，因此你需要使用观察者模式（observer pattern）来将数据传递到 JavaScript 层。

**关键术语解释（面向初学者）：**

- **单例（Singleton）**：一种设计模式，确保某个类在整个应用中只有一个实例。这里的监听器就是单例——它不随模块的创建/销毁而改变。
- **观察者模式（Observer Pattern）**：一种设计模式，当一个对象的状态发生变化时，所有依赖于它的对象都会收到通知。这里用于将原生层的事件传递给 JavaScript 模块。
- **弱引用（WeakReference）**：一种不会阻止垃圾回收的引用方式。使用弱引用可以避免内存泄漏（memory leak）——即当模块被销毁后，监听器不会阻止其被系统回收。

一个标准的数据流管道包含以下步骤：

1. 捕获系统 Intent（如深度链接 URL）
2. 通知模块中注册的观察者
3. 发送结构化事件到 JavaScript 层
4. 使用弱引用避免内存泄漏
5. 确保 React 端的类型安全

以下通过一个深度链接（deep linking）示例来演示这个桥接过程。

### 模块注册

首先，创建一个 Package 类来注册监听器：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerPackage.kt
package expo.modules.deeplinkhandler

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class DeepLinkHandlerPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> {
    return listOf(DeepLinkHandlerActivityLifecycleListener())
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerPackage.java
package expo.modules.deeplinkhandler;

import android.content.Context;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;
import java.util.Collections;
import java.util.List;

public class DeepLinkHandlerPackage implements Package {
  @Override
  public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    return Collections.singletonList(new DeepLinkHandlerActivityLifecycleListener());
  }
}
```

### 带观察者通知的 Activity 生命周期监听器

创建一个监听器来捕获 URL 并通知已注册的观察者：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerActivityLifecycleListener.kt
package expo.modules.deeplinkhandler

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class DeepLinkHandlerActivityLifecycleListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
    handleIntent(activity?.intent)
  }

  override fun onNewIntent(intent: Intent?): Boolean {
    handleIntent(intent)
    return true
  }

  private fun handleIntent(intent: Intent?) {
    val url = intent?.data
    if (url != null) {
      // 存储初始 URL，供后续获取
      DeepLinkHandlerModule.initialUrl = url

      // 通知所有观察者收到新的深度链接
      DeepLinkHandlerModule.urlReceivedObservers.forEach { observer ->
        observer(url)
      }
    }
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerActivityLifecycleListener.java
package expo.modules.deeplinkhandler;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class DeepLinkHandlerActivityLifecycleListener implements ReactActivityLifecycleListener {
  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    handleIntent(activity.getIntent());
  }

  @Override
  public boolean onNewIntent(Intent intent) {
    handleIntent(intent);
    return true;
  }

  private void handleIntent(Intent intent) {
    if (intent == null) return;

    Uri url = intent.getData();
    if (url != null) {
      // 存储初始 URL，供后续获取
      DeepLinkHandlerModule.initialUrl = url;

      // 通知所有观察者收到新的深度链接
      for (java.util.function.Consumer<Uri> observer : DeepLinkHandlerModule.urlReceivedObservers) {
        observer.accept(url);
      }
    }
  }
}
```

### 发送事件的 Expo 模块

开发负责管理观察者并向 JavaScript 层推送事件的模块：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerModule.kt
package expo.modules.deeplinkhandler

import android.net.Uri
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.ref.WeakReference

class DeepLinkHandlerModule : Module() {
  companion object {
    var initialUrl: Uri? = null
    var urlReceivedObservers: MutableSet<((Uri) -> Unit)> = mutableSetOf()
  }

  private var urlReceivedObserver: ((Uri) -> Unit)? = null

  override fun definition() = ModuleDefinition {
    Name("DeepLinkHandler")

    Events("onUrlReceived")

    Function("getInitialUrl") {
      initialUrl?.toString()
    }

    OnStartObserving("onUrlReceived") {
      val weakModule = WeakReference(this@DeepLinkHandlerModule)
      val observer: (Uri) -> Unit = { uri ->
        weakModule.get()?.sendEvent(
          "onUrlReceived",
          bundleOf(
            "url" to uri.toString(),
            "scheme" to uri.scheme,
            "host" to uri.host,
            "path" to uri.path
          )
        )
      }
      urlReceivedObservers.add(observer)
      urlReceivedObserver = observer
    }

    OnStopObserving("onUrlReceived") {
      urlReceivedObservers.remove(urlReceivedObserver)
    }
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/deeplinkhandler/DeepLinkHandlerModule.java
package expo.modules.deeplinkhandler;

import android.net.Uri;
import androidx.core.os.Bundle;
import expo.modules.kotlin.modules.Module;
import expo.modules.kotlin.modules.ModuleDefinition;
import java.lang.ref.WeakReference;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;

public class DeepLinkHandlerModule extends Module {
  public static Uri initialUrl = null;
  public static Set<Consumer<Uri>> urlReceivedObservers = new HashSet<>();

  private Consumer<Uri> urlReceivedObserver;

  @Override
  public ModuleDefinition definition() {
    return ModuleDefinition.create()
      .name("DeepLinkHandler")
      .events("onUrlReceived")
      .function("getInitialUrl", () -> {
        return initialUrl != null ? initialUrl.toString() : null;
      })
      .onStartObserving("onUrlReceived", () -> {
        WeakReference<DeepLinkHandlerModule> weakModule = new WeakReference<>(this);
        Consumer<Uri> observer = uri -> {
          DeepLinkHandlerModule module = weakModule.get();
          if (module != null) {
            Bundle bundle = new Bundle();
            bundle.putString("url", uri.toString());
            bundle.putString("scheme", uri.getScheme());
            bundle.putString("host", uri.getHost());
            bundle.putString("path", uri.getPath());
            module.sendEvent("onUrlReceived", bundle);
          }
        };
        urlReceivedObservers.add(observer);
        urlReceivedObserver = observer;
      })
      .onStopObserving("onUrlReceived", () -> {
        urlReceivedObservers.remove(urlReceivedObserver);
      });
  }
}
```

> **基于经验建议**：注意 `companion object` 中 `initialUrl` 和 `urlReceivedObservers` 使用了 `static` 变量。这是必要的，因为监听器是单例，无法直接访问模块实例的成员变量。但要小心线程安全问题——如果监听器和模块在不同线程上操作这些共享变量，可能需要添加同步机制。

### TypeScript 接口与 React 使用方式

建立 TypeScript 类型契约，将原生事件与前端连接，并创建一个自定义 Hook 以便在组件中使用：

```ts
import { requireNativeModule, NativeModule } from 'expo-modules-core';

export type DeepLinkEvent = {
  url: string;
  scheme?: string;
  host?: string;
  path?: string;
};

type DeepLinkHandlerModuleEvents = {
  onUrlReceived(event: DeepLinkEvent): void;
};

declare class DeepLinkHandlerNativeModule extends NativeModule<DeepLinkHandlerModuleEvents> {
  getInitialUrl(): string | null;
}

const DeepLinkHandler = requireNativeModule<DeepLinkHandlerNativeModule>('DeepLinkHandler');
export default DeepLinkHandler;
```

自定义 Hook 的实现：

```tsx
import { useEffect, useState } from 'react';
import DeepLinkHandler, { DeepLinkEvent } from './DeepLinkHandler';

export function useDeepLinkHandler(): {
  initialUrl: string | null;
  url: string | null;
  event: DeepLinkEvent | null;
} {
  const [initialUrl] = useState<string | null>(DeepLinkHandler.getInitialUrl());
  const [event, setEvent] = useState<DeepLinkEvent | null>(null);

  useEffect(() => {
    const subscription = DeepLinkHandler.addListener('onUrlReceived', event => {
      setEvent(event);
    });

    return () => subscription.remove();
  }, []);

  return {
    initialUrl,
    url: event?.url ?? initialUrl,
    event,
  };
}
```

在 UI 组件中使用该 Hook：

```tsx
import { Text, View, StyleSheet } from 'react-native';
import { useDeepLinkHandler } from './useDeepLinkHandler';

export function App() {
  const { initialUrl, url, event } = useDeepLinkHandler();

  return (
    <View style={styles.container}>
      <Text>Initial URL: {initialUrl || 'None'}</Text>
      <Text>Current URL: {url || 'None'}</Text>
      {event && (
        <View style={styles.textContainer}>
          <Text>Latest Deep Link:</Text>
          <Text>Scheme: {event.scheme}</Text>
          <Text>Host: {event.host}</Text>
          <Text>Path: {event.path}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 20,
  },
});
```

### 模块配置

最后，在配置文件中将模块与其监听器关联起来：

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.deeplinkhandler.DeepLinkHandlerModule"]
  }
}
```

> **基于文档内容推导**：这个 `expo-module.config.json` 配置文件告诉 Expo 框架在 Android 平台上加载哪个原生模块类。`platforms` 字段指定该模块仅在 Android 上生效，`android.modules` 列出了需要注册的模块全限定类名。

---

## Application 生命周期监听器

通过 `ApplicationLifecycleListener` 可以监听应用级别的事件。目前支持的回调包括：

| 回调方法 | 触发时机 |
|---------|---------|
| `onCreate` | Application 创建时 |
| `onConfigurationChanged` | 设备配置发生变化时（如屏幕旋转、语言切换） |

**关键术语解释（面向初学者）：**

- **Application 级别 vs Activity 级别**：Application 的生命周期覆盖整个应用，而 Activity 只覆盖单个界面页面。如果你需要在应用启动时初始化全局资源（如 SDK、数据库），应该使用 Application 级别的监听器。

### 在 Package 类中注册 Application 监听器

实现 Application 监听器的创建方法：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/mylib/MyLibPackage.kt
package expo.modules.mylib

import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package

class MyLibPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
    return listOf(MyLibApplicationLifecycleListener())
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/mylib/MyLibPackage.java
import android.content.Context;

import java.util.Collections;
import java.util.List;

import expo.modules.core.interfaces.ApplicationLifecycleListener;
import expo.modules.core.interfaces.Package;

public class MyLibPackage implements Package {
  @Override
  public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context context) {
    return Collections.singletonList(new MyLibApplicationLifecycleListener());
  }
}
```

### 创建 Application 监听器子类

创建派生类来重写所需的应用回调方法，以降低维护成本：

#### Kotlin 版本

```kotlin
// android/src/main/java/expo/modules/mylib/MyLibApplicationLifecycleListener.kt
package expo.modules.mylib

import android.app.Application
import expo.modules.core.interfaces.ApplicationLifecycleListener

class MyLibApplicationLifecycleListener : ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    // 在 Application.onCreate 中执行的自定义代码
    doSomeSetupInApplicationOnCreate(application)
  }
}
```

#### Java 版本

```java
// android/src/main/java/expo/modules/mylib/MyLibApplicationLifecycleListener.java
package expo.modules.mylib;

import android.app.Application;

import expo.modules.core.interfaces.ApplicationLifecycleListener;

public class MyLibApplicationLifecycleListener implements ApplicationLifecycleListener {
  @Override
  public void onCreate(Application application) {
    // 在 Application.onCreate 中执行的自定义代码
    doSomeSetupInApplicationOnCreate(application);
  }
}
```

> **基于经验建议**：Application 级别的 `onCreate` 是初始化第三方 SDK（如分析工具、崩溃报告、推送通知服务等）的最佳时机。但要注意不要在 `onCreate` 中执行耗时操作，否则会拖慢应用的冷启动速度。建议将耗时初始化放到后台线程中执行。

---

## 已知问题

### 缺少 Activity 的 onStart 和 onStop 钩子

当前的实现方式是将钩子挂载到 React Native 的委托（delegate）上，而不是直接挂载到主 Activity 上。由于该委托缺少 `onStart` 和 `onStop` 方法，因此这两个特定的回调无法被支持。

> **基于文档内容推导**：这意味着如果你需要在 Activity 可见性变化时执行特定逻辑（例如在 `onStart` 时开始播放视频、在 `onStop` 时暂停），你可能需要寻找替代方案，例如在 JavaScript 层通过 `AppState` API 来监听应用的前后台状态变化。

### 接口一致性（Interface Consistency）

监听器的接口定义可能会在不同 SDK 版本之间发生变化。维护团队通过引入新接口并将旧接口标记为 `@Deprecated`（已弃用）来确保向后兼容性。由于这些接口依赖于默认方法（default methods），开发者应该只重写确实需要的方法，以最小化未来的维护负担。

> **基于经验建议**：在升级 Expo SDK 版本后，务必检查监听器接口是否有变更或弃用通知。优先使用最新推荐的接口，避免依赖已标记为 `@Deprecated` 的方法。

---

## 数据流架构总结

以下是从 Android 原生生命周期事件到 React 组件的完整数据流：

```
Android 系统事件
    ↓
Activity/Application 生命周期回调
    ↓
ReactActivityLifecycleListener / ApplicationLifecycleListener（单例）
    ↓
观察者通知（Observer Pattern）
    ↓
Expo Module（sendEvent）
    ↓
JavaScript/TypeScript 事件监听
    ↓
React 组件状态更新
```

> **基于文档内容推导**：这个架构的核心设计思路是"解耦"——监听器负责捕获原生事件，观察者模式负责跨层传递，模块负责格式化和发送事件，React 组件只关心最终的结构化数据。每一层各司其职，降低了系统耦合度。

---

## 文档导航

- **上一页**：[type generation reference](./111__type-generation-reference.md)
- **下一页**：[appdelegate subscribers](./113__appdelegate-subscribers.md)
