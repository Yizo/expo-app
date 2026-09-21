# 054 Native Modules: Introduction

**翻页：** [上一页：053 Native Platform](053-NativePlatform.md) · [目录](README.md) · [下一页：055 Cross-Platform Native Modules (C++)](055-CrossPlatformNativeModulesCpp.md)

**官方页面：** [Native Modules: Introduction · React Native](https://reactnative.dev/docs/turbo-native-modules-introduction)  
**版本范围：** 本页按 RN 0.87 New Architecture 示例整理。示例是重写后的学习片段，不能替代完整模板；官方教程演示 Android Java/Kotlin 和 iOS Objective-C++。  
**源页代码覆盖：** CLI 初始化、TS/Flow 模块 spec、Codegen 配置与 Android/iOS 触发、JS API 调用、Java/Kotlin SharedPreferences module/Package/Host 注册、iOS Objective-C++ `NSUserDefaults`/JSI provider，以及构建运行命令。

## Native Module 解决什么问题

**Native Module（原生模块）** 为 JavaScript 提供没有 UI 的原生功能。例如系统存储、通知或设备网络能力。只有 RN 核心和社区库都不适合，或者确实要复用既有原生代码时才需要自写。

本教程示例实现一个简化的持久化 `localStorage` API：Android 使用 SharedPreferences，iOS 使用 NSUserDefaults。这里的演示存的是普通偏好值，**不表示这两种默认存储适合保存 token/密钥**；敏感数据需使用安全存储。

该页演示 New Architecture 下的 **Turbo Native Module**，分为：JS 类型规范 → Codegen 生成原生接口 → JS 使用规格 → 原生类实现接口并注册。若还需支持旧架构，要读单独的 backward compatibility 指南。

## 创建 RN 工程与定义规格

示例以 RN 0.87 建立 CLI 工程：

```sh
npx @react-native-community/cli@latest init TurboStorageDemo --version "0.87.0"
```

Turbo Module 要有带类型的 spec。TS 版本放在 `specs/NativeLocalStorage.ts`，名称以 `Native` 开头。方法签名描述 JS 与原生互通的数据类型；这里演示设置、读取、删除一项和清空。

```ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setItem(value: string, key: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeLocalStorage');
```

若工程用 Flow，接口表达相同的 contract，只是 Flow 类型语法不同（可空字符串用 `?string`）：

```js
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setItem(value: string, key: string): void;
  getItem(key: string): ?string;
  removeItem(key: string): void;
  clear(): void;
}
```

`getEnforcing` 假定模块始终已链接，否则会抛错。若模块可选，可用 `TurboModuleRegistry.get<Spec>(...)`，返回可能为 `null` 的模块，JS 调用时需处理模块缺席。

## 配置 Codegen 并生成接口

根 `package.json` 设置名称、模块类型、spec 目录和 Android Java package 名。iOS 用 `modulesProvider` 关联 JS 名和 Obj-C 类名：

```json
{
  "codegenConfig": {
    "name": "NativeLocalStorageSpec",
    "type": "modules",
    "jsSrcsDir": "specs",
    "android": { "javaPackageName": "com.example.nativestorage" },
    "ios": {
      "modulesProvider": {
        "NativeLocalStorage": "RCTNativeLocalStorage"
      }
    }
  }
}
```

Android 的 React Native Gradle Plugin 会在原生构建时自动跑 Codegen；要手动确认输出时，在 `android/` 执行：

```sh
./gradlew generateCodegenArtifactsFromSchema
```

iOS Codegen 由 CocoaPods 添加的脚本阶段触发：

```sh
cd ios
bundle install
bundle exec pod install
```

## JS/React 侧调用模块

App import spec 文件，再用 `useEffect` 读取已保存值；TextInput 维护草稿，按钮分别调用 set/remove/clear。组件的 state 只展示原生 API 返回结果，真正持久化由平台实现负责。

```tsx
function StorageDemo() {
  const [saved, setSaved] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setSaved(NativeLocalStorage.getItem('note'));
  }, []);

  function save() {
    NativeLocalStorage.setItem(draft, 'note');
    setSaved(draft);
  }

  function remove() {
    NativeLocalStorage.removeItem('note');
    setSaved(null);
  }

  function clearAll() {
    NativeLocalStorage.clear();
    setSaved(null);
  }

  return (
    <View>
      <Text>已存内容：{saved ?? '无'}</Text>
      <TextInput value={draft} onChangeText={setDraft} placeholder="输入要保存的内容" />
      <Button title="保存" onPress={save} />
      <Button title="删除一项" onPress={remove} />
      <Button title="清空全部" onPress={clearAll} />
    </View>
  );
}
```

## Android Java/Kotlin 实现与注册

### Module 接口实现

Codegen 生成的 `NativeLocalStorageSpec` 是 Java/Kotlin Module 必须实现的抽象 contract。构造函数拿到 `ReactApplicationContext`，方法转调系统 `SharedPreferences`。`apply()` 异步写入；示例将 key 放在私有 preference file 中。

```java
public final class NativeLocalStorageModule extends NativeLocalStorageSpec {
  static final String NAME = "NativeLocalStorage";

  NativeLocalStorageModule(ReactApplicationContext context) { super(context); }
  @Override public String getName() { return NAME; }

  private SharedPreferences prefs() {
    return getReactApplicationContext()
        .getSharedPreferences("native_storage", Context.MODE_PRIVATE);
  }

  @Override public void setItem(String value, String key) {
    prefs().edit().putString(key, value).apply();
  }
  @Override public String getItem(String key) { return prefs().getString(key, null); }
  @Override public void removeItem(String key) { prefs().edit().remove(key).apply(); }
  @Override public void clear() { prefs().edit().clear().apply(); }
}
```

Kotlin 版使用相同的生成基类与 API，只是用 Kotlin 的属性/表达式形式：

```kotlin
class NativeLocalStorageModule(context: ReactApplicationContext) :
  NativeLocalStorageSpec(context) {
  override fun getName() = NAME
  private fun prefs() = getReactApplicationContext()
    .getSharedPreferences("native_storage", Context.MODE_PRIVATE)

  override fun setItem(value: String, key: String) { prefs().edit().putString(key, value).apply() }
  override fun getItem(key: String): String? = prefs().getString(key, null)
  override fun removeItem(key: String) { prefs().edit().remove(key).apply() }
  override fun clear() { prefs().edit().clear().apply() }

  companion object { const val NAME = "NativeLocalStorage" }
}
```

### BaseReactPackage 注册

自定义 `BaseReactPackage` 按模块名创建 Module，并返回 `ReactModuleInfo` 元数据，其中 `isTurboModule` 标记新架构模块。Java 与 Kotlin 做相同工作：

```kotlin
class NativeLocalStoragePackage : BaseReactPackage() {
  override fun getModule(name: String, context: ReactApplicationContext): NativeModule? =
    if (name == NativeLocalStorageModule.NAME) NativeLocalStorageModule(context) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(NAME to ReactModuleInfo(
      NAME, NAME,
      canOverrideExistingModule = false,
      needsEagerInit = false,
      isCxxModule = false,
      isTurboModule = true,
    ))
  }
}
```

Java 版 Package 同样返回 Manager/Module 实例，并通过 `ReactModuleInfoProvider` 报告 `isTurboModule=true`：

```java
public final class NativeLocalStoragePackage extends BaseReactPackage {
  @Override
  public NativeModule getModule(String name, ReactApplicationContext context) {
    return NativeLocalStorageModule.NAME.equals(name)
        ? new NativeLocalStorageModule(context) : null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> Map.of(NativeLocalStorageModule.NAME,
        new ReactModuleInfo(
            NativeLocalStorageModule.NAME,
            NativeLocalStorageModule.NAME,
            false, false, false, true));
  }
}
```

Java 版同样覆写 `getModule()` 和 `getReactModuleInfoProvider()`，用 `HashMap<String, ReactModuleInfo>` 返回上述字段。然后把 package 添加到 `MainApplication.getPackages()` / Kotlin `getPackages()` 的 `PackageList` 结果中；New Architecture 与 Hermes 初始化沿用应用主配置。日后若该模块发布成 npm package，Gradle autolinking 可替代 App 手工注册。

```kotlin
override fun getPackages(): List<ReactPackage> = PackageList(this).packages.apply {
  add(NativeLocalStoragePackage())
}
```

Java `MainApplication` 在既有 `PackageList` 结果后执行 `packages.add(new NativeLocalStoragePackage())`，并返回新列表；其他 Host、SoLoader、Hermes/New Architecture 初始化复用上一页的 Java/Kotlin 原生工程模板。

## iOS Objective-C++ 实现

教程让开发者在 Xcode 建 Cocoa Touch Class `RCTNativeLocalStorage`，再把 `.m` 改成 `.mm`，因为实现会用 C++ JSI 类型。头文件导入 Codegen 生成的 spec protocol 并声明遵循它：

```objc
#import <Foundation/Foundation.h>
#import <NativeLocalStorageSpec/NativeLocalStorageSpec.h>

@interface RCTNativeLocalStorage : NSObject <NativeLocalStorageSpec>
@end
```

实现用 `NSUserDefaults` suite 存储值；`getTurboModule` 返回 Codegen 创建的 JSI adapter，把 JS 调用连到原生实现。Objective-C 方法名/参数由 spec 映射生成：

```objc
@implementation RCTNativeLocalStorage {
  NSUserDefaults *_store;
}

- (instancetype)init {
  if ((self = [super init])) {
    _store = [[NSUserDefaults alloc] initWithSuiteName:@"native-storage"];
  }
  return self;
}

- (NSString *)getItem:(NSString *)key { return [_store stringForKey:key]; }
- (void)setItem:(NSString *)value key:(NSString *)key { [_store setObject:value forKey:key]; }
- (void)removeItem:(NSString *)key { [_store removeObjectForKey:key]; }
- (void)clear {
  for (NSString *key in _store.dictionaryRepresentation) [_store removeObjectForKey:key];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeLocalStorageSpecJSI>(params);
}

+ (NSString *)moduleName { return @"NativeLocalStorage"; }
@end
```

最后在 `codegenConfig.ios.modulesProvider` 映射 `NativeLocalStorage` 到 `RCTNativeLocalStorage`，重新 `bundle exec pod install`，用 Xcode/模拟器构建验证。这里展示的是 Android SharedPreferences 与 iOS UserDefaults 的教学存储实现，不是加密存储。

## 运行示例

Android 可用 `npm run android` 或 `yarn run android`，iOS 可用 `npm run ios` 或 `yarn run ios`。新原生模块首次添加后需重新编译应用；Fast Refresh 只能更新 JS，不能把尚未编译进原生二进制的 Module 变出来。

**翻页：** [上一页：053 Native Platform](053-NativePlatform.md) · [目录](README.md) · [下一页：055 Cross-Platform Native Modules (C++)](055-CrossPlatformNativeModulesCpp.md)
