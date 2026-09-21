# 055 Cross-Platform Native Modules (C++)

**翻页：** [上一页：054 Native Modules: Introduction](054-NativeModulesIntroduction.md) · [目录](README.md) · [下一页：056 Advanced Topics on Native Modules Development](056-AdvancedNativeModules.md)

**官方页面：** [Cross-Platform Native Modules (C++) · React Native](https://reactnative.dev/docs/the-new-architecture/pure-cxx-modules)  
**版本范围：** 示例为 RN 0.87 New Architecture / Turbo Native Module。  
**源页代码覆盖：** RN CLI 初始化、TS/Flow reverseString spec、Codegen 配置、C++ 模块 h/cpp、Android CMake/Gradle/OnLoad 注册、iOS CocoaPods/Objective-C++ ModuleProvider、`modulesProvider`、JS 文本界面和构建命令。

## 为什么使用 Pure C++ Module

当一个 Native Module 的业务逻辑不依赖 Android 或 iOS 系统 API，可用 C++ 实现一次，让 Android/iOS 共同使用它。JS 与 C++ 之间仍要通过 Turbo Native Module spec、Codegen 生成的 JSI 接口和平台注册代码连接。

教程用字符串反转示例：TS/Flow 声明 `reverseString(input: string): string`，共享 C++ 返回反转后的字符串。模块主体只有一份 C++，平台专属部分负责把它接进构建系统并注册 provider。

## JS Spec：定义公开接口

在 `specs/NativeSampleModule.ts` 写 typed spec，文件名必须以 `Native` 开头。Flow 也可写同样的签名；二者是不同的 JS 类型语法，选项目实际使用的一种。

```tsx
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  reverseString(input: string): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeSampleModule');
```

```js
// Flow 形式的同一接口
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +reverseString: (input: string) => string;
}

export default (TurboModuleRegistry.getEnforcing<Spec>('NativeSampleModule'): Spec);
```

## Codegen 配置

在根 `package.json` 配置 Codegen 输出名、模块类型、spec 搜索目录与 Android 包名：

```json
{
  "codegenConfig": {
    "name": "AppSpecs",
    "type": "modules",
    "jsSrcsDir": "specs",
    "android": { "javaPackageName": "com.example.sampleapp.specs" }
  }
}
```

Codegen 生成 C++/JSI glue 以及供两平台使用的接口；应用构建会按项目配置运行它。

## 共享 C++ 逻辑

在 Android/iOS 共用的 `shared/` 中创建头文件与实现文件。Codegen 生成基类 `NativeSampleModuleCxxSpec<NativeSampleModule>`；C++ 类继承它，并通过 `CallInvoker` 与 JS runtime 协调调用。这里的方法不使用平台 API，因而逻辑可以共享。

```cpp
// shared/NativeSampleModule.h
#pragma once
#include <AppSpecsJSI.h>
#include <memory>
#include <string>

namespace facebook::react {
class NativeSampleModule : public NativeSampleModuleCxxSpec<NativeSampleModule> {
 public:
  explicit NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker);
  std::string reverseString(jsi::Runtime& runtime, std::string input);
};
}
```

```cpp
// shared/NativeSampleModule.cpp
#include "NativeSampleModule.h"

namespace facebook::react {
NativeSampleModule::NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker)
  : NativeSampleModuleCxxSpec(std::move(jsInvoker)) {}

std::string NativeSampleModule::reverseString(jsi::Runtime&, std::string input) {
  return std::string(input.rbegin(), input.rend());
}
}
```

## Android 构建和注册

Android 用 CMake 编译 native C++。在 `android/app/src/main/jni/CMakeLists.txt` 包含 RN application 配置，将共享目录的 `.cpp` 加到 native target，并把头文件目录加入 include path：

```cmake
cmake_minimum_required(VERSION 3.13)
project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../shared/NativeSampleModule.cpp)
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC ../../../../../shared)
```

在 `android/app/build.gradle` 的 `android` 设置里指向这个 CMakeLists：

```gradle
android {
  externalNativeBuild {
    cmake { path "src/main/jni/CMakeLists.txt" }
  }
}
```

接着在 Android `OnLoad.cpp` 注册 C++ module。匹配 spec 名称时创建 C++ 实例，其他模块交给 RN autolinking provider：

```cpp
#include <NativeSampleModule.h>

std::shared_ptr<TurboModule> cxxModuleProvider(
    const std::string& name,
    const std::shared_ptr<CallInvoker>& jsInvoker) {
  if (name == NativeSampleModule::kModuleName) {
    return std::make_shared<NativeSampleModule>(jsInvoker);
  }
  return autolinking_cxxModuleProvider(name, jsInvoker);
}
```

源页通过 `curl` 从 RN 0.87 模板取基础 `OnLoad.cpp`，再加上模块 include 和 provider 判断。项目模板可能变化，应从对应 RN 版本模板检查整个 loader 文件，而不是只替换为这段片段。

```sh
# 在 android/app/src/main/jni 中取模板文件（实际要对照匹配版本）
curl -O https://raw.githubusercontent.com/facebook/react-native/v0.87.0/packages/react-native/ReactAndroid/cmake-utils/default-app-setup/OnLoad.cpp
yarn android
```

## iOS 构建和注册

在 iOS 中 CocoaPods 会运行 Codegen；安装 Pods 后，将 `shared` 文件夹加入 Xcode workspace。创建 `NativeSampleModuleProvider` 类，以 Objective-C++（`.mm`）实现 `RCTModuleProvider`，通过生成的 C++ TurboModule 实例连接模块：

```objc
// NativeSampleModuleProvider.h
#import <Foundation/Foundation.h>
#import <ReactCommon/RCTTurboModule.h>

@interface NativeSampleModuleProvider : NSObject <RCTModuleProvider>
@end
```

```objc
// NativeSampleModuleProvider.mm
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModule.h>
#import "NativeSampleModule.h"

@implementation NativeSampleModuleProvider
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeSampleModule>(params.jsInvoker);
}
@end
```

在 `codegenConfig.ios.modulesProvider` 将 JS spec 名映射到 provider class：

```json
{
  "ios": {
    "modulesProvider": {
      "NativeSampleModule": "NativeSampleModuleProvider"
    }
  }
}
```

更新 mapping 后重新安装 Pods 并打开 workspace；Xcode 将编译共享 C++ 文件与 Objective-C++ provider：

```sh
cd ios
bundle install
bundle exec pod install
open SampleApp.xcworkspace
```

## 从 JS 调用并验证

JS 导入 spec 模块，用户点按钮后调用 `reverseString` 并显示结果。真实工程最好把 spec 放在服务模块封装内，再由 UI 调用本地服务；教程直接在 `App.tsx` import 只为简化演示。

```tsx
const [input, setInput] = useState('');
const [reversed, setReversed] = useState('');

function reverse() {
  setReversed(NativeSampleModule.reverseString(input));
}

return (
  <View>
    <TextInput value={input} onChangeText={setInput} placeholder="输入文字" />
    <Button title="反转" onPress={reverse} />
    <Text>{reversed}</Text>
  </View>
);
```

最后分别用 `npm run android`/`yarn run android` 或 `npm run ios`/`yarn run ios` 构建设备应用。这里 C++ 只共享纯计算；需要调用 SharedPreferences、NSUserDefaults、相机等平台 API 时仍需要平台专用注册代码。

**翻页：** [上一页：054 Native Modules: Introduction](054-NativeModulesIntroduction.md) · [目录](README.md) · [下一页：056 Advanced Topics on Native Modules Development](056-AdvancedNativeModules.md)
