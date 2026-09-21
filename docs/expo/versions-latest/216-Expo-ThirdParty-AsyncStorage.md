# 216｜@react-native-async-storage/async-storage 异步键值存储

**翻页：**[上一页：Expo Go 第三方库概览](./215-Expo-ThirdParty-Libraries-Overview.md) · [目录](./README.md) · [下一页：DateTimePicker 日期与时间选择器](./217-Expo-ThirdParty-DateTimePicker.md)

**官方页面：**[AsyncStorage · Latest](https://docs.expo.dev/versions/latest/sdk/async-storage/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/async-storage/) · [库的完整官方文档](https://react-native-async-storage.github.io/async-storage/)

**版本与平台：**Expo Latest 与 SDK v56 页面均推荐 `@react-native-async-storage/async-storage 2.2.0`。支持 Android、iOS、macOS、tvOS、Web，并包含在 Expo Go 中。

## AsyncStorage 是什么

AsyncStorage 是本地异步、未加密、持久化的 key-value（键值）存储 API。可以把它想成应用自己的本机字典：给定一个字符串 key，存入并读取对应的 value。**异步**表示读写操作通常返回 Promise，不会以同步方式立刻拿到结果；**持久化**表示 App 关闭再启动后数据仍可保留；**未加密**表示内容没有自动加密保护。

因此它适合保存普通偏好、非敏感缓存等；不要用它保存密码、访问令牌或其它敏感密钥。需要设备安全存储时应查阅 [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) 文档。

安装与当前 Expo SDK 匹配的版本：

```sh
npx expo install @react-native-async-storage/async-storage
yarn expo install @react-native-async-storage/async-storage
pnpm expo install @react-native-async-storage/async-storage
bun expo install @react-native-async-storage/async-storage
```

纯 React Native 项目还需要安装 Expo；再按 AsyncStorage 库自己的 README 进行安装配置。

## 后续 API 文档

Expo reference 页只概述功能并链接到库的官方文档；具体读写方法、类型、错误处理和平台细节请查看 [AsyncStorage 官方文档](https://react-native-async-storage.github.io/async-storage/)。

## 新手名词解释

- **Key-value（键值对）：**使用字符串 key 作为索引保存与读取 value，例如 `theme → dark`。
- **持久化（Persistent）：**值写入本地存储后不会因为关闭或重启应用就自动丢失。
- **异步（Asynchronous）：**操作稍后完成，以 Promise 等机制返回结果；界面应在结果完成后更新，而不是假定函数调用当下已有数据。
- **未加密（Unencrypted）：**库不替应用加密保存值，不能将它当成系统安全密钥库。
- **Expo Go 内置支持：**当前 Expo Go 已包含此原生库，因此无需为它单独创建 development build。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种包安装命令。
- Expo Latest 与 SDK v56 均将其概括为异步、未加密、持久化 key-value 存储；平台、Expo Go 可用性、版本和 Next 一致。
- Expo reference 页没有读写示例代码；页面链接至 AsyncStorage 库的完整 API 文档。

**翻页：**[上一页：Expo Go 第三方库概览](./215-Expo-ThirdParty-Libraries-Overview.md) · [目录](./README.md) · [下一页：DateTimePicker 日期与时间选择器](./217-Expo-ThirdParty-DateTimePicker.md)
