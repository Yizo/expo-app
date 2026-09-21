# 196｜Expo SDK SecureStore 安全键值存储

**翻页：**[上一页：Expo SDK ScreenOrientation 屏幕方向](./195-Expo-SDK-ScreenOrientation.md) · [目录](./README.md) · [下一页：Expo SDK Sensors](./197-Expo-SDK-Sensors.md)

**官方页面：**[SecureStore · Latest](https://docs.expo.dev/versions/latest/sdk/securestore/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)

**版本与平台：**Latest 推荐 `expo-secure-store ~57.0.1`；SDK v56.0.0 推荐 `~56.0.4`。支持 Android、iOS、tvOS，包含在 Expo Go 中；依赖生物识别的 `requireAuthentication` 在 Expo Go 有限制，详见下文。

## 使用范围与存储差异

`expo-secure-store` 用于在设备上加密保存较小的字符串键值，例如 session token、刷新 token 或设备凭据。它不是数据库，也不适合大文件；旧版 iOS 曾拒绝约 2048 字节以上的值，Expo 不在 JS 层统一限制，所以大字符串要捕获原生错误。

- **Android：**数据写入 `SharedPreferences`，由 Android Keystore 加密。卸载应用时数据会删除。
- **iOS：**写入 Keychain 的 generic password 项；同一 bundle ID 重新安装后，Keychain 值可能继续存在，但不应把它视为可靠的账号生命周期保证。
- **项目隔离：**每个 Expo 项目使用自己的存储区域，不能读取其它 Expo 项目的数据。
- **持久性：**重启 / 更新后通常保留，但不要把无法恢复的关键数据只存此处。生物识别设置变化也会令 `requireAuthentication` 值失效。

## 安装

```sh
npx expo install expo-secure-store
yarn expo install expo-secure-store
pnpm expo install expo-secure-store
bun expo install expo-secure-store
```

已有 React Native 项目需先集成 `expo`。Expo CLI 会为当前 SDK 选择兼容的包版本。

## 配置 Face ID 与 Android 备份

使用 CNG / config plugins 时，插件可配置 Face ID 权限说明，以及 Android 自动备份对 SecureStore 的处理：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-secure-store",
        {
          "configureAndroidBackup": true,
          "faceIDPermission": "允许 $(PRODUCT_NAME) 使用 Face ID 保护本地密钥。"
        }
      ]
    ]
  }
}
```

`configureAndroidBackup` 默认 `true`，自动排除不能在新安装中解密的值；`faceIDPermission` 仅 iOS 使用，设置 `NSFaceIDUsageDescription` 文案。插件修改需要重新构建 app binary。已有原生 iOS 项目也可在 `Info.plist` 手动添加：

```xml
<key>NSFaceIDUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 使用 Face ID 保护本地密钥。</string>
```

在 Expo Go 中，设备具备生物识别时 `requireAuthentication: true` 可能因缺少 `NSFaceIDUsageDescription` 而无法工作；要用 development / release build 并配置原生权限说明。

## App Store 加密合规配置

Expo 文档建议在 app config 设置 `ios.config.usesNonExemptEncryption: false`，自动处理 App Store Connect 中的加密类型提示：

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

## 自定义 Android Auto Backup

Android Auto Backup 为 Android 6.0 / API 23 及以上备份 app 数据。SecureStore 的 Android Keystore 密钥会在卸载 app 时删除；因此恢复备份后 SecureStore 加密内容不能解密，必须从备份中排除 `SecureStore` SharedPreferences。

没有自定义备份配置时插件默认帮忙配置。若使用自己的 Auto Backup 规则，设 `configureAndroidBackup: false` 并排除 SecureStore：

Android 12+：

```xml
<data-extraction-rules>
  <cloud-backup>
    <include domain="sharedpref" path="." />
    <exclude domain="sharedpref" path="SecureStore" />
  </cloud-backup>
  <device-transfer>
    <include domain="sharedpref" path="." />
    <exclude domain="sharedpref" path="SecureStore" />
  </device-transfer>
</data-extraction-rules>
```

Android 11 及更早版本：

```xml
<full-backup-content>
  <include domain="sharedpref" path="." />
  <exclude domain="sharedpref" path="SecureStore" />
</full-backup-content>
```

## 保存、读取和删除

SecureStore 只保存字符串。复杂对象需要先 JSON 序列化，读取后再 parse。下面改写了官方 Usage：输入 key / value 后保存，按 key 读取并显示结果，也可删除条目。

```tsx
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function SecureValueScreen() {
  const [key, setKey] = useState('session-token');
  const [value, setValue] = useState('');
  const [lookupKey, setLookupKey] = useState('session-token');

  async function save() {
    try {
      await SecureStore.setItemAsync(key, value);
      setKey('');
      setValue('');
    } catch (error) {
      Alert.alert('保存失败', String(error));
    }
  }

  async function read(storedKey: string) {
    try {
      const storedValue = await SecureStore.getItemAsync(storedKey);
      Alert.alert(
        storedValue === null ? '没有找到值' : '读取到安全值',
        storedValue ?? `键「${storedKey}」下没有存储内容。`,
      );
    } catch (error) {
      Alert.alert('读取失败', String(error));
    }
  }

  async function remove() {
    await SecureStore.deleteItemAsync(lookupKey);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>保存一条安全键值</Text>
      <TextInput style={styles.input} value={key} onChangeText={setKey} placeholder="键" autoCapitalize="none" />
      <TextInput style={styles.input} value={value} onChangeText={setValue} placeholder="值" secureTextEntry />
      <Button title="保存" onPress={() => void save()} />
      <Text style={styles.title}>按键读取</Text>
      <TextInput
        style={styles.input}
        value={lookupKey}
        onChangeText={setLookupKey}
        placeholder="要读取的键"
        onSubmitEditing={event => void read(event.nativeEvent.text)}
        autoCapitalize="none"
      />
      <Button title="读取" onPress={() => void read(lookupKey)} />
      <Button title="删除此键" onPress={() => void remove()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 12, backgroundColor: '#f1f5f9' },
  title: { marginVertical: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  input: { height: 42, marginBottom: 8, borderColor: '#94a3b8', borderWidth: 1, padding: 8 },
});
```

API 也提供同步 `setItem` / `getItem`，但会阻塞 JavaScript 线程；尤其 `requireAuthentication: true` 时，认证期间界面可能暂时失去响应。界面交互一般优先异步方法。

## API 方法

| API | 返回值 | 说明 |
| --- | --- | --- |
| `canUseBiometricAuthentication()` | `boolean` | 检查能否用足够安全的生物识别方式保护值；tvOS 恒为 false。 |
| `isAvailableAsync()` | `Promise<boolean>` | 检查 SecureStore API 是否可用；当前 Android / iOS 为 true，不检查 app 权限。 |
| `setItemAsync(key, value, options?)` | `Promise<void>` | 异步保存字符串 key/value；失败时 reject。 |
| `getItemAsync(key, options?)` | `Promise<string \| null>` | 异步读取；不存在、被系统失效时返回 null，错误时 reject。 |
| `deleteItemAsync(key, options?)` | `Promise<void>` | 删除键值；失败时 reject。 |
| `setItem(key, value, options?)` | `void` | 同步保存，会阻塞 JS 线程。 |
| `getItem(key, options?)` | `string \| null` | 同步读取，会阻塞 JS 线程；认证时可能等待用户操作。 |

key 只允许字母数字、`.`、`-`、`_`。若写入时指定 `keychainService`，后续读值时也要提供相同值。

## `SecureStoreOptions`

| 选项 | 平台 | 含义 |
| --- | --- | --- |
| `accessGroup?` | iOS | Keychain access group，用于一组 app 共享 Keychain 项。 |
| `authenticationPrompt?` | Android、iOS | `requireAuthentication` 开启时呈现给用户的认证文字。 |
| `keychainAccessible?` | iOS | Keychain 条目何时可读；默认 `SecureStore.WHEN_UNLOCKED`。 |
| `keychainService?` | Android、iOS | Android 对应密钥 alias；iOS 对应 Keychain service。读写必须保持一致。 |
| `requireAuthentication?` | Android、iOS | 访问值时要求系统用户认证；Android 每次操作都要求，iOS 新建值时不提示，读取 / 更新既有值才提示。 |

Android 要求 API 23+；iOS 将该选项映射到当前生物识别集。添加指纹或更改 Face ID 后，认证保护的条目可能失效且无法读回。真机认证流程与模拟器不同，应使用真实设备验证。

## iOS Keychain 可访问性常量

这些常量控制设备锁定、重启和迁移时何时能读取 Keychain 值。`KeychainAccessibilityConstant` 类型为 `number`。

| 常量 | 含义 / 迁移行为 |
| --- | --- |
| `AFTER_FIRST_UNLOCK` | 重启后首次解锁前不可读；第一次解锁后，即使之后锁屏也可读取。 |
| `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` | 类似 `AFTER_FIRST_UNLOCK`，但不迁移到备份恢复的新设备；已弃用。 |
| `ALWAYS` | 设备锁定时也能读取，是最不安全的级别；已弃用。 |
| `ALWAYS_THIS_DEVICE_ONLY` | 类似 `ALWAYS`，但不迁移；已弃用。 |
| `WHEN_PASSCODE_SET_THIS_DEVICE_ONLY` | 需要设置设备密码；用户移除密码时条目会删除。 |
| `WHEN_UNLOCKED` | 仅设备解锁时可读，是默认值。 |
| `WHEN_UNLOCKED_THIS_DEVICE_ONLY` | 仅解锁时可读，且不迁移到其它设备。 |

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐包 | `expo-secure-store ~57.0.1` | `~56.0.4` |
| 方法、配置字段、认证与备份说明 | 与 v56 页面一致 | 与 Latest 页面一致 |
| 官方页脚 Next | Sensors | Sensors |

本地 SDK v56 项目应安装 `expo-secure-store ~56.0.4`。SecureStore 可保护设备内凭据，但不保证卸载、设备迁移或生物识别设置变化时仍保留 / 可读；不要将其作为服务器事实或不可恢复数据的唯一来源。

## 官方源页代码主题覆盖

- 安装命令：覆盖 npx、Yarn、pnpm、Bun 四种安装形式。
- Config plugin：重写 `configureAndroidBackup` / `faceIDPermission` app config，补齐 Info.plist 的 Face ID usage description。
- Export compliance：覆盖 `ios.config.usesNonExemptEncryption: false` JSON。
- Android Auto Backup：覆盖 Android 12+ `data-extraction-rules` 和 Android 11 及更早版 `full-backup-content` 两段 SecureStore 排除规则，并说明自定义备份时关闭插件自动规则。
- Usage：重写 key/value 输入、异步 set/get、无值状态、表单重置与 React Native 样式，另加入删除 / 错误处理。
- API 常量、方法、`SecureStoreOptions` 字段、Keychain accessibility 值均已列全；API 表未附其它独立 runnable 示例。

**翻页：**[上一页：Expo SDK ScreenOrientation 屏幕方向](./195-Expo-SDK-ScreenOrientation.md) · [目录](./README.md) · [下一页：Expo SDK Sensors](./197-Expo-SDK-Sensors.md)
