# 034｜App credentials：Android 与 iOS 应用凭据

**翻页：**[上一页：Expo Orbit](./033-Expo-Orbit.md) · [目录](./README.md) · [下一页：自动管理凭据](./035-自动管理Credentials.md)

**官方页面：**[App credentials](https://docs.expo.dev/app-signing/app-credentials/)

**版本边界：**签名凭据是 Android / Apple 平台与 EAS Build 之间的发布配置，不绑定某一个 Expo SDK 版本。本文依据 Expo 当前 app-signing 指南；本地项目 SDK 56 若使用新构建流程，仍需检查 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/)和项目中的原生配置。凭据、密钥与证书必须保密，下面的命令只作说明，没有运行。

## 为什么需要签名凭据

**签名（code signing）**是用私钥给应用包签名，用于确认应用的发布者身份，并让平台检测包是否被替换。EAS Build 可以生成已签名或未签名的应用，但向 Google Play / Apple App Store 分发时需要符合平台要求的签名材料。

Android 与 iOS 的证书类型和生命周期不同；EAS 可以代管凭据，也允许开发者自行保管。

## Android：Keystore 与 Google Play App Signing

Android 发布签名通常以 **Keystore** 文件保存私钥及其别名、密码与证书信息。EAS Build 使用当前关联到应用的 keystore，产出已签名的 APK 或 AAB。

启用 Google Play App Signing 时，开发者上传由 upload key 签名的包；Google Play 在服务端用 Play 管理的 app signing key 为商店分发包签名。这样若 upload key 丢失或泄露，可以向 Google 请求重置上传密钥。对于 EAS Build，旧方式和上传证书方式都表现为“用项目当前 keystore 签名构建产物”。

### 下载 EAS 上的 Android 凭据

在终端运行交互命令后，选择 Android、目标 build profile，再进入 credentials.json 的上传/下载选项，选择从 EAS 下载到本地的 JSON 文件。文件通常会引用 keystore 的路径、别名和密码。

```sh
eas credentials
```

Keystore 及其密码是生产密钥，不要提交到 Git repository、公开日志或工单。若需要把证书交给 Google 支持，可按下例从 keystore 导出 PEM 公钥证书；命令中的 alias 与文件路径需要替换成自己的值：

```sh
keytool -export -rfc -alias alias_from_step_1 \
  -file certificate_for_google.pem \
  -keystore ./path/to/keystore.jks
```

PEM 是从 keystore 导出的证书文件；它不应与 keystore 中的私钥混为一谈。

## iOS：三类主要凭据

iOS 凭据关联 Apple Developer account：

| 凭据 | 用途 | 作用范围与生命周期 |
| --- | --- | --- |
| Distribution Certificate（分发证书） | 构建时对 iOS 应用签名。 | 与开发者账号相关，可供多个 App 使用；账号有数量上限。过期或撤销会影响未来上传新版本，但不会让商店里已发布的 App 自动停止运行。 |
| Provisioning Profile（配置描述文件） | 将 App ID、签名证书与允许安装的设备 / 权限组合到一个构建配置中。 | 每个 App 单独配置；与证书关联，过期后下次构建需重新生成。 |
| Apple Push Notification Key（APNs 推送密钥） | 代表应用服务端向 Apple 推送服务发送通知。 | 账号最多可有 2 个，可跨多个 App 使用；撤销会中断依赖此 key 的推送，重新上传 key 不改变用户已有的 Expo Push Token。 |

可以用同一交互命令查看和管理 iOS 凭据：

```sh
eas credentials
```

如果选择自主管理，可在 Apple Developer Console 中创建证书和 profile，再配置到构建。iOS 签名凭据的生成需要 Apple Developer Program 账号。

## 清理和重新签名

在 EAS CLI 中删除凭据只会移除 Expo 服务器保存的副本，不会自动在 Apple Developer Console 撤销该凭据。要彻底删除或释放账号名额，仍需到对应平台的开发者控制台处理。

如果已有 ad hoc `.ipa`，只是要把新测试设备加入 provisioning profile，可以用 EAS 命令选择现有 build 并指定新 profile。这个过程复用所选构建产物再签名，不需要从头重新编译全部原生代码：

```sh
eas build:resign
```

页面也将 `eas build -p ios` 列为需要时重新生成 iOS provisioning profile 的方式。重新生成 profile 与删除 Apple 上的证书是不同操作。

## 关键名词

- **Keystore：**Android 签名密钥容器，包含私钥及其证书元数据。
- **Upload key：**上传到 Google Play 的包使用的签名密钥；启用 Google Play App Signing 后与 Google 保存的 app signing key 分工。
- **Distribution certificate：**Apple 开发者账号用于 iOS 发布构建签名的证书。
- **Provisioning profile：**把 App ID、证书、设备和 capability 等签名条件关联起来的 Apple 文件。
- **APNs：**Apple Push Notification service，接收服务端推送请求并投递给 Apple 设备的服务。
- **Resign：**使用新的签名配置给已有构建产物签名，不等于重新编译源代码。

## 官方代码主题覆盖

源页代码主题已全部覆盖：`eas credentials` 交互式检查/下载/管理凭据；使用 `keytool -export -rfc` 将 Android 证书导出为 PEM；通过 `eas build -p ios` 在需要时重新生成 iOS profile；通过 `eas build:resign` 复用现有 iOS 构建并套用新 profile。凭据路径、别名和平台控制台步骤按源页含义解释，未复制任何密钥数据。

## 下一页

官方页脚 **Next** 是 [Using automatically managed credentials](https://docs.expo.dev/app-signing/managed-credentials/)，介绍首次构建时让 EAS 创建并代管密钥。

**翻页：**[上一页：Expo Orbit](./033-Expo-Orbit.md) · [返回目录](./README.md) · [下一页：自动管理凭据](./035-自动管理Credentials.md)
