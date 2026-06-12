# Expo SecureStore 学习指南

> 本文对应 Expo **下一版本 SDK** 的未发布文档。原文指出，当前最新稳定版本为 **SDK 56**。本文严格依据所提供的 SecureStore 文档整理。

## SecureStore 解决什么问题

`expo-secure-store` 用于在 Android、iOS 和 tvOS 设备本地，以加密方式保存少量字符串键值对。

典型场景包括：

- 保存登录令牌、刷新令牌等敏感凭据
- 保存需要设备认证后才能读取的秘密
- 保存不适合明文写入普通本地存储的数据
- 在应用重启或更新后继续读取少量持久化数据

它可以类比为 React Web 中的 `localStorage` 键值存储，但有几个关键区别：

- 数据由移动操作系统提供的安全设施保护
- API 主要是异步 API
- 可以要求用户通过指纹或面容认证
- Android 和 iOS 的卸载、备份及迁移行为不同
- 它不是跨平台统一实现的 Web Storage，也不是数据库

每个 Expo 项目都有独立的存储空间，不能访问其他 Expo 项目的 SecureStore 数据。

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发移动应用，但最终运行的是移动端原生界面和原生能力，不是浏览器 DOM。

Expo 是围绕 React Native 提供的一套开发工具和原生模块体系。`expo-secure-store` 就是一个调用 Android、iOS 原生安全存储能力的 Expo 模块。

### App binary

App binary 是最终安装到设备上的原生应用包，例如：

- Android 的 APK 或 AAB
- iOS 的 IPA

部分配置必须写入原生工程，因此修改后不能只靠 JavaScript 热更新生效，必须重新构建应用。

### Bundle ID

Bundle ID 是 iOS 应用的唯一标识，例如：

```text
com.example.myapp
```

它不是 npm 包名。iOS 是否把重新安装的应用视为“同一个应用”，与 Bundle ID 有关。

### Config plugin 与 CNG

Config plugin 用于根据 `app.json` 等 Expo 配置修改原生 Android 或 iOS 工程。

CNG，即 Continuous Native Generation，是 Expo 根据应用配置生成原生工程的工作流。使用 CNG 时，可以通过 SecureStore 自带的 config plugin 完成原生配置；不使用 CNG 时，则需要手动修改原生工程。

这与 React Web 中修改运行时配置不同：config plugin 处理的是构建阶段的原生配置。

## 安装

根据项目所使用的包管理器执行：

```sh
# npm
npx expo install expo-secure-store

# yarn
yarn expo install expo-secure-store

# pnpm
pnpm expo install expo-secure-store

# bun
bun expo install expo-secure-store
```

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中安装，而不是标准 Expo 项目，需要先为项目安装 Expo Modules 所需的 `expo` 包。

## 原生构建配置

### 使用 config plugin

在使用 CNG 或其他 config plugin 工作流时，可以在 `app.json` 中配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-secure-store",
        {
          "configureAndroidBackup": true,
          "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
        }
      ]
    ]
  }
}
```

这些属性不能在 JavaScript 运行期间动态设置。修改后需要重新构建 App binary。

### `configureAndroidBackup`

- 平台：Android
- 默认值：`true`
- 作用：自动调整 Android 备份规则，使 SecureStore 数据不会被错误备份和恢复

如果应用没有自定义 Android Auto Backup 配置，应保留默认值。

如果应用已经维护自己的备份规则，则需要：

1. 在自定义规则中排除 `SecureStore`
2. 将 `configureAndroidBackup` 设置为 `false`

### `faceIDPermission`

- 平台：iOS
- 默认值：

```text
Allow $(PRODUCT_NAME) to access your Face ID biometric data.
```

该文本会写入 iOS 的 `NSFaceIDUsageDescription` 权限说明，用于解释应用为什么要访问 Face ID。

`$(PRODUCT_NAME)` 是构建时替换的应用名称变量。

### 不使用 CNG 时的 iOS 配置

已有 React Native 原生工程需要手动在 `Info.plist` 中添加：

```xml
<key>NSFaceIDUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your Face ID biometric data.</string>
```

`Info.plist` 是 iOS 原生应用的配置文件，可类比为一部分浏览器权限声明和构建配置的集合，但它属于原生工程。

## 两个平台如何保存数据

### Android

Android 将值保存在 `SharedPreferences` 中，并使用 Android Keystore 系统完成加密保护。

可以简单理解为：

- `SharedPreferences` 负责本地键值存储
- Android Keystore 负责保护加密所需的密钥

卸载应用时，Android Keystore 中属于该应用的密钥会被删除。因此，即使加密后的数据通过备份恢复回来，也无法再解密。

### iOS

iOS 使用 Keychain Services 保存数据，条目类型为 `kSecClassGenericPassword`。

Keychain 是 iOS 专门保存密码、令牌和密钥等敏感信息的系统服务。SecureStore 还允许通过 `kSecAttrAccessible` 控制数据在设备锁定状态下何时可访问。

iOS Keychain 的重要行为是：应用卸载后，数据可能不会被删除。使用相同 Bundle ID 重新安装应用时，之前的数据可能仍然存在。

文档同时强调，这一行为不能作为可靠保证。

## 数据持久化边界

SecureStore 的目标是让数据在应用重启和更新后继续存在，但不能将其作为不可替代的重要数据的唯一来源。

| 场景 | Android | iOS |
| --- | --- | --- |
| 应用重启 | 通常保留 | 通常保留 |
| 应用更新 | 通常保留 | 通常保留 |
| 卸载应用 | 不保留 | 相同 Bundle ID 重装后可能仍存在 |
| 生物识别信息改变 | 认证保护的数据可能失效 | 认证保护的数据可能失效 |

如果用户添加新指纹，或者修改用于面容识别的面部信息，使用 `requireAuthentication: true` 保存的数据可能无法继续读取。

因此，SecureStore 适合保存敏感凭据，但服务器端账号、业务记录等不可恢复数据仍应保存在可靠的后端系统中。

## Android Auto Backup

Android 6.0，即 API 23 及以上版本，可以通过 Auto Backup 自动备份应用数据。

SecureStore 数据必须排除在备份之外，原因是：

1. 应用卸载后，Android Keystore 中的密钥被删除
2. Auto Backup 可能恢复加密后的 SharedPreferences 数据
3. 恢复后的数据失去了对应密钥，无法解密

没有自定义备份配置时，`expo-secure-store` 会自动排除自己的数据。

### 使用自定义备份规则

Android 12 及以上版本：

```xml
<data-extraction-rules>
  <cloud-backup>
    <include domain="sharedpref" path="."/>
    <exclude domain="sharedpref" path="SecureStore"/>
  </cloud-backup>
  <device-transfer>
    <include domain="sharedpref" path="."/>
    <exclude domain="sharedpref" path="SecureStore"/>
  </device-transfer>
</data-extraction-rules>
```

Android 11 及以下版本：

```xml
<full-backup-content>
  <include domain="sharedpref" path="."/>
  <exclude domain="sharedpref" path="SecureStore"/>
</full-backup-content>
```

这里的含义是：其他 `sharedpref` 数据可以参与备份，但名为 `SecureStore` 的数据必须排除。

自定义以上规则时，还应配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-secure-store",
        {
          "configureAndroidBackup": false
        }
      ]
    ]
  }
}
```

## App Store 加密合规配置

向 App Store 或 TestFlight 提交应用时，App Store Connect 会询问应用实现了哪种加密算法，这属于 Export Compliance Information。

使用 SecureStore 时，可以在 Expo 应用配置中设置：

```json
{
  "expo": {
    "ios": {
      "config": {
        "usesNonExemptEncryption": false
      }
    }
  }
}
```

该设置会自动处理相关合规问题。

文档只说明了使用 SecureStore 时可以这样配置，没有展开其他自定义加密功能是否会改变申报结论。如果应用还实现了其他加密能力，当前文档未涉及应如何判断。

## 基本使用流程

首先导入整个模块：

```js
import * as SecureStore from 'expo-secure-store';
```

### 保存数据

```js
await SecureStore.setItemAsync('authToken', token);
```

### 读取数据

```js
const token = await SecureStore.getItemAsync('authToken');

if (token === null) {
  // 不存在，或者该密钥已经失效
}
```

### 删除数据

```js
await SecureStore.deleteItemAsync('authToken');
```

推荐为读写操作处理异常：

```js
async function saveToken(token) {
  try {
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    // 保存失败，例如原生存储拒绝了过大的值
  }
}

async function readToken() {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    // 也可能是用户取消生物识别，而不是数据损坏
    return null;
  }
}
```

SecureStore 只接受字符串。当前文档没有提供直接保存对象的 API。

**基于文档内容推导：** 如果业务需要保存结构化数据，可以由应用自行使用 `JSON.stringify` 和 `JSON.parse` 转换，但仍应控制数据大小并处理解析失败。

## API 方法

### `setItemAsync(key, value, options?)`

异步保存字符串键值对：

```js
await SecureStore.setItemAsync('session', value, options);
```

- `key` 只能包含字母、数字、`.`、`-` 和 `_`
- `value` 必须是字符串
- 返回 `Promise<void>`
- 无法保存时 Promise 会拒绝

### `getItemAsync(key, options?)`

异步读取数据：

```js
const value = await SecureStore.getItemAsync('session', options);
```

读取结果可能为：

- 字符串：成功读取
- `null`：条目不存在，或者密钥已失效
- Promise 拒绝：读取过程中发生错误，例如认证提示失败

原文返回类型位置写为 `Promise<string>`，但说明明确指出也可能得到 `null`。实际使用时必须处理 `null`。

### `deleteItemAsync(key, options?)`

删除指定键对应的数据：

```js
await SecureStore.deleteItemAsync('session', options);
```

返回 `Promise<void>`；无法删除时 Promise 会拒绝。

### 同步方法

SecureStore 同时提供：

```js
SecureStore.setItem(key, value, options);
const value = SecureStore.getItem(key, options);
```

当启用 `requireAuthentication` 时，同步方法会阻塞 JavaScript 线程，直到用户完成认证。

React Native 的 JavaScript 线程承担 React 更新和事件处理等工作。阻塞它类似于在浏览器主线程执行长时间同步任务：应用界面可能无法交互。

因此，对需要生物识别认证的操作，应优先使用异步方法。

### `isAvailableAsync()`

```js
const available = await SecureStore.isAvailableAsync();
```

用于判断当前设备是否启用了 SecureStore API，但不会检查应用权限。

文档说明目前只会在 Android 和 iOS 上解析为 `true`。这与页面列出的 tvOS API 支持信息存在差异，因此不能把“方法存在”直接理解为 `isAvailableAsync()` 一定会在 tvOS 返回 `true`。

### `canUseBiometricAuthentication()`

```js
const canUseBiometrics =
  SecureStore.canUseBiometricAuthentication();
```

这是同步方法，返回布尔值：

- `true`：设备支持生物识别，且已录入的认证方式达到所需安全等级
- `false`：不满足条件
- tvOS 始终返回 `false`

该方法检查的是能否配合 `requireAuthentication` 保存数据，并不表示一次具体认证必然成功。

## 生物识别保护

通过 `requireAuthentication` 可以要求访问数据时进行设备认证：

```js
await SecureStore.setItemAsync('protectedToken', token, {
  requireAuthentication: true,
  authenticationPrompt: '请验证身份以访问登录凭据'
});
```

### Android 与 iOS 的行为差异

| 平台 | 认证时机 |
| --- | --- |
| Android | 所有相关操作都需要用户认证 |
| iOS | 创建新值时不提示；读取或更新已有值时提示 |

因此，不能根据 Android 上的测试结果推断 iOS 会在相同时机弹出认证界面。

### 认证失败不等于数据损坏

生物识别弹窗可能因为以下原因失败：

- 用户取消或关闭认证
- 设备没有录入生物识别信息
- 生物识别硬件不可用
- 多次失败后用户被暂时锁定
- 认证超时

这些情况下，同步 API 会抛出异常，异步 API 会拒绝 Promise。错误消息来自原生系统，不同平台的文案可能不同。

```js
try {
  return await SecureStore.getItemAsync('protectedToken', {
    requireAuthentication: true
  });
} catch (error) {
  // 将其作为认证流程失败处理，而不是直接判定存储损坏
  return null;
}
```

应用应允许用户重试、取消或退回其他流程，而不是立即清除数据。

### 生物识别变更造成密钥失效

当用户添加新指纹或修改面容信息时，系统可能使原有密钥失效。此后受认证保护的数据将无法读取。

这只影响使用以下配置保存的数据：

```js
{ requireAuthentication: true }
```

如果该数据关系到登录状态，应用需要准备重新登录或重新签发凭据的流程。

### 测试限制

文档明确说明，该功能需要在真实设备上测试。模拟器在读取秘密时不一定像真实 iOS 设备那样要求生物识别，因此不足以验证实际行为。

### Expo Go 限制

设备支持生物识别时，Expo Go 不支持 `requireAuthentication`，原因是其中缺少所需的 `NSFaceIDUsageDescription`。

要完整测试该功能，需要使用配置了 `expo-secure-store` config plugin 的构建版本或相应的原生工程，而不能只依赖 Expo Go。

## `SecureStoreOptions` 配置

### `requireAuthentication`

类型：`boolean`

启用设备认证保护。

- Android 对应原生的 `setUserAuthenticationRequired(true)`
- 要求 Android API 23 及以上版本
- iOS 对应 `biometryCurrentSet`
- 生物识别改变后，数据可能失效

iOS 的完整功能需要新生成的密钥。文档指出，它不能与其他非认证操作所使用的同一个 `keychainService` 组合工作。

### `authenticationPrompt`

类型：`string`

启用 `requireAuthentication` 时，定制展示给用户的认证提示文本。

### `keychainAccessible`

平台：iOS  
默认值：`SecureStore.WHEN_UNLOCKED`

用于设置 iOS Keychain 的 `kSecAttrAccessible`，控制设备处于何种锁定状态时可以访问数据。

### `keychainService`

类型：`string`

- Android：对应公钥/私钥对的 Alias
- iOS：对应 Keychain 条目的 `kSecAttrService`

使用该选项保存条目后，读取时也必须传入相同的 `keychainService`：

```js
const options = {
  keychainService: 'com.example.auth'
};

await SecureStore.setItemAsync('token', token, options);
const tokenAgain = await SecureStore.getItemAsync('token', options);
```

遗漏或改变该配置可能导致无法找到原条目。

### `accessGroup`

平台：iOS

指定 Keychain 条目所属的访问组，可用于在一组应用之间共享 Keychain 条目。

这涉及 iOS 原生签名和权限体系。当前文档只给出了字段用途，没有说明访问组的完整配置流程。

## iOS Keychain 可访问性常量

这些常量通过 `keychainAccessible` 使用。虽然文档同时列出 Android 和 tvOS 支持信息，但其具体语义主要来自 iOS Keychain 的可访问性模型。

### `WHEN_UNLOCKED`

仅在设备已解锁时访问，是默认值：

```js
{
  keychainAccessible: SecureStore.WHEN_UNLOCKED
}
```

### `WHEN_UNLOCKED_THIS_DEVICE_ONLY`

与 `WHEN_UNLOCKED` 类似，但恢复备份到新设备时不会迁移该条目。

### `AFTER_FIRST_UNLOCK`

设备重启后，用户至少解锁过一次，条目才可访问。完成首次解锁后，即使设备再次锁定，也可用于需要锁屏后台访问的场景。

### `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`

与 `AFTER_FIRST_UNLOCK` 类似，但不会通过备份迁移到新设备。

该常量已弃用。文档建议使用能提供一定用户保护的可访问级别，例如 `AFTER_FIRST_UNLOCK`。

### `ALWAYS`

无论设备是否锁定都能访问，是安全性最低的选项。

该常量已弃用。不要在新代码中选择它。

### `ALWAYS_THIS_DEVICE_ONLY`

与 `ALWAYS` 类似，但不会迁移到新设备。由于锁屏时仍可访问，其保护强度仍然较低。

### `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY`

要求用户设置设备密码后才能保存条目：

- 条目不会迁移到新设备
- 用户移除设备密码后，条目会被删除

适合明确要求设备必须启用锁屏密码的敏感数据。

## 重要限制与坑点

### 不适合保存大型数据

底层平台可能拒绝过大的值。历史上一些 iOS 版本会拒绝大约超过 2048 字节的值，但 Expo 本身不强制统一上限。

因此：

- 不要把 SecureStore 当文件系统或数据库使用
- 必须捕获原生保存错误
- 图片、长文档和大型 JSON 不适合直接存入
- 不能将“大约 2048 字节”理解为当前所有设备的固定上限

### 不能作为关键数据的唯一来源

Android 卸载后数据会丢失；iOS 即使可能保留，也不保证一定保留。生物识别变化还可能使受保护数据永久不可读。

SecureStore 适合保存“可重新获取但需要本地安全保护”的数据，例如可由重新登录获得的令牌。

### iOS 卸载不等于清空数据

React Web 开发者可能把“卸载应用”类比为清除站点数据，但 iOS Keychain 可能跨卸载保留条目。

如果业务要求卸载后绝不恢复，不能仅依据当前文档假设 Keychain 会自动清除。

### `null` 与认证异常含义不同

读取返回 `null` 表示：

- 键不存在
- 密钥已经失效

抛出异常或 Promise 拒绝可能只是：

- 用户取消认证
- 认证硬件不可用
- 认证超时或锁定
- 其他原生读取错误

应用不能把这些情况全部归类为“没有保存数据”。

### 配置修改需要重新构建

以下内容属于原生配置，修改后需要生成新的 App binary：

- `faceIDPermission`
- `configureAndroidBackup`
- `NSFaceIDUsageDescription`
- Android 自定义备份规则

它们不能像 React Web 的普通环境变量那样，仅刷新开发服务器就生效。

## React Web 开发者的使用建议

以下建议用于把文档中的平台限制落实到应用设计。

### 为 SecureStore 建立小型封装

**基于经验建议：** 集中管理键名、异常和序列化逻辑，避免组件直接散落调用原生 API。

```js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth.token';

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

### 将读取视为异步启动流程

**基于文档内容推导：** SecureStore 读取通常是异步的，认证还可能等待用户操作。因此不能像读取 `localStorage` 一样，在组件首次渲染时假定结果立即可用。

应用启动状态至少应区分：

- 正在读取凭据
- 已读取且存在凭据
- 不存在或已经失效
- 用户取消认证
- 发生其他存储错误

### 准备重新认证流程

**基于文档内容推导：** 对 `requireAuthentication` 保护的数据，应提前设计：

- 用户取消认证后的返回路径
- 生物识别变更后的重新登录流程
- 设备不支持生物识别时的降级处理
- 多次认证失败或系统锁定时的提示

### 使用真实设备完成验收

模拟器可以验证普通 API 调用，但生物识别提示、锁屏状态和密钥失效行为必须在真实设备上验证。Expo Go 也不能覆盖 Face ID 认证保护的完整流程。

## 当前文档未涉及的内容

原文档没有详细说明：

- SecureStore 的 Web 平台实现或替代方案
- 令牌刷新和登录状态管理的完整架构
- 多个 iOS 应用共享 `accessGroup` 的完整配置步骤
- 具体平台和版本下的统一最大存储容量
- Android 与 iOS 的完整错误码列表
- 如何迁移已有 SecureStore 键名或加密配置
- 应用包含其他加密功能时如何完成出口合规判断
- 如何保证 iOS 卸载后彻底删除 Keychain 数据

这些问题需要结合其他 Expo 文档、原生平台文档或具体业务设计处理。

## 总结

`expo-secure-store` 是面向少量敏感字符串的设备本地安全键值存储。基本操作与 `localStorage` 类似，但其真实行为取决于 Android Keystore、iOS Keychain、生物识别状态、原生构建配置以及系统备份机制。

实际使用时应把握以下原则：

1. 优先使用异步 API，避免阻塞 JavaScript 线程。
2. 只保存少量、可重新获取的敏感数据。
3. 捕获所有原生读写和认证异常。
4. 不依赖卸载后的数据保留行为。
5. Android 备份必须排除 SecureStore 数据。
6. 启用生物识别后，要处理用户取消和密钥失效。
7. Face ID 权限、备份规则等修改后必须重新构建。
8. 生物识别相关功能必须在真实设备和正式构建环境中验证。

---

## 文档导航

- **上一页**：[screen orientation](./202__screen-orientation.md)
- **下一页**：[sensors](./204__sensors.md)
