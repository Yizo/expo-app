# 054｜EAS Build 自动同步 iOS Capabilities

**翻页：**[上一页：同一设备安装多个 App Variant](./053-App-Variants.md) · [目录](./README.md) · [下一页：在本机运行 EAS Build](./055-EAS-Build-Locally.md)

**官方页面：**[iOS capabilities](https://docs.expo.dev/build-reference/ios-capabilities/)

**版本边界：**本页按 Expo 当前 EAS Build 对 Apple entitlements 的支持列表整理；Apple capability 与 EAS 支持项会随平台版本更新。项目 Expo ~56.0.11 的 config plugin / entitlements 按 SDK v56 对照。本文只展示配置和 CLI 示例，没有同步 Apple Developer Console 或执行构建。

## Capability 与 Entitlement

Apple capability 是开发者账号里为 App ID 开启的系统服务 / 权限。构建时需要相应 **entitlement（授权声明）** 写入 App，并在 Apple Developer Portal 的 App ID 与 provisioning profile 上开启对应能力。

EAS Build 运行时读取项目 entitlement 配置，将受支持 capability 与 Apple Developer Console 同步：

- entitlement 出现在 App config 或原生 entitlement 文件中：build 时启用远端 capability；已经开启则跳过。
- 远端已开启但本次配置没有 entitlement：build 时会关闭 capability。
- EAS 只自动同步内置支持项；不支持的 entitlement 需要在 Apple Developer Console 手动开通。

## Entitlements 从哪里读取

Expo app 从 app config 的 ios.entitlements 读取；在项目中查看解析后的配置可运行：

```sh
npx expo config --type introspect
```

生成结果中找到 ios.entitlements 对象。已有 React Native 原生项目则从 ios/**/*.entitlements 文件读取。

EAS Build 默认会同步。如果需临时关闭，可在 build 命令前设置：

```sh
EXPO_NO_CAPABILITY_SYNC=1 eas build
```

打开 EXPO_DEBUG=1 可获得 capability sync 的更详细日志。

## EAS Build 支持的 Capability

以下 entitlement 字符串是当前文档列出的内置同步项目。只有声明了对应 entitlement 并具备所需 Apple 账号权限时，EAS 才会尝试自动开启：

| Capability | Entitlement |
| --- | --- |
| Access Wi-Fi Information | com.apple.developer.networking.wifi-info |
| App Attest | com.apple.developer.devicecheck.appattest-environment |
| App Groups | com.apple.security.application-groups |
| Apple Pay Later Merchandising | com.apple.developer.pay-later-merchandising |
| Apple Pay Payment Processing | com.apple.developer.in-app-payments |
| Associated Domains | com.apple.developer.associated-domains |
| AutoFill Credential Provider | com.apple.developer.authentication-services.autofill-credential-provider |
| ClassKit | com.apple.developer.ClassKit-environment |
| Communicates with Drivers | com.apple.developer.driverkit.communicates-with-drivers |
| Communication Notifications | com.apple.developer.usernotifications.communication |
| Custom Network Protocol | com.apple.developer.networking.custom-protocol |
| Data Protection | com.apple.developer.default-data-protection |
| DriverKit Allow Third Party UserClients | com.apple.developer.driverkit.allow-third-party-userclients |
| DriverKit Family Audio (development) | com.apple.developer.driverkit.family.audio |
| DriverKit Family HID Device (development) | com.apple.developer.driverkit.family.hid.device |
| DriverKit Family HID EventService (development) | com.apple.developer.driverkit.family.hid.eventservice |
| DriverKit Family Networking (development) | com.apple.developer.driverkit.family.networking |
| DriverKit Family SCSIController (development) | com.apple.developer.driverkit.family.scsicontroller |
| DriverKit Family Serial (development) | com.apple.developer.driverkit.family.serial |
| DriverKit Transport HID (development) | com.apple.developer.driverkit.transport.hid |
| DriverKit USB Transport (development) | com.apple.developer.driverkit.transport.usb |
| DriverKit for Development | com.apple.developer.driverkit |
| Extended Virtual Address Space | com.apple.developer.kernel.extended-virtual-addressing |
| Family Controls | com.apple.developer.family-controls |
| FileProvider TestingMode | com.apple.developer.fileprovider.testing-mode |
| Fonts | com.apple.developer.user-fonts |
| Group Activities | com.apple.developer.group-session |
| HealthKit | com.apple.developer.healthkit |
| HomeKit | com.apple.developer.homekit |
| Hotspot | com.apple.developer.networking.HotspotConfiguration |
| Increased Memory Limit | com.apple.developer.kernel.increased-memory-limit |
| Inter-App Audio | inter-app-audio |
| Journaling Suggestions | com.apple.developer.journal.allow |
| Low Latency HLS | com.apple.developer.low-latency-streaming |
| MDM Managed Associated Domains | com.apple.developer.associated-domains.mdm-managed |
| Managed App Installation UI | com.apple.developer.managed-app-distribution.install-ui |
| Maps | com.apple.developer.maps |
| Matter Allow Setup Payload | com.apple.developer.matter.allow-setup-payload |
| Media Device Discovery | com.apple.developer.media-device-discovery-extension |
| Messages Collaboration | com.apple.developer.shared-with-you.collaboration |
| Multipath | com.apple.developer.networking.multipath |
| NFC Tag Reading | com.apple.developer.nfc.readersession.formats |
| Network Extensions | com.apple.developer.networking.networkextension |
| 5G Network Slicing | com.apple.developer.networking.slicing.appcategory；com.apple.developer.networking.slicing.trafficcategory |
| On Demand Install Capable for App Clip Extensions | com.apple.developer.on-demand-install-capable |
| Personal VPN | com.apple.developer.networking.vpn.api |
| Push Notifications | aps-environment |
| Push to Talk | com.apple.developer.push-to-talk |
| Recalibrate Estimates | com.apple.developer.healthkit.recalibrate-estimates |
| Sensitive Content Analysis | com.apple.developer.sensitivecontentanalysis.client |
| Shallow Depth and Pressure | com.apple.developer.submerged-shallow-depth-and-pressure |
| Shared with You | com.apple.developer.shared-with-you |
| Sign In with Apple | com.apple.developer.applesignin |
| SiriKit | com.apple.developer.siri |
| System Extension | com.apple.developer.system-extension.install |
| Tap to Pay on iPhone | com.apple.developer.proximity-reader.payment.acceptance |
| Tap to Present ID on iPhone (Display Only) | com.apple.developer.proximity-reader.identity.display |
| TV Services | com.apple.developer.user-management |
| Time Sensitive Notifications | com.apple.developer.usernotifications.time-sensitive |
| Wallet | com.apple.developer.pass-type-identifiers |
| WeatherKit | com.apple.developer.weatherkit |
| Wireless Accessory Configuration | com.apple.external-accessory.wireless-configuration |
| iCloud | com.apple.developer.icloud-container-identifiers |
| HLS Interstitial Previews | 文档目前没有提供 entitlement 字符串 |

内置清单之外的 Apple capability 不会自动同步，仍需手动开通。

## Broadcast Push Notifications

Apple Broadcast 是 Push Notifications capability 的一个选项，没有独立 entitlement。App config 中可以这样请求：

```json
{
  "expo": {
    "ios": {
      "usesBroadcastPushNotifications": true,
      "entitlements": {
        "aps-environment": "development"
      }
    }
  }
}
```

EAS 只有启用 Push Notifications capability 时才会切换 Broadcast；App 仍需 aps-environment entitlement。Apple 将 Broadcast 限定于 iOS 18 及更新系统上的 Live Activities。

如果只在 Apple Developer Console 手动打开 Broadcast，下次 EAS Build 重新同步 push notification capability 时可能恢复默认选项并关掉 Broadcast，APNs channel 管理请求会报 FeatureNotEnabled。

## Merchant ID、App Groups 与 CloudKit Containers

EAS 可自动注册和绑定 Merchant IDs、App Groups、CloudKit Containers。该部分使用 Apple cookies authentication，在开发者机器本地执行，因为 App Store Connect API 尚不提供这些操作。

## 手动开通方式

### 用 Xcode 添加

适合不使用 Expo Prebuild、持续维护 ios/Android 原生目录的项目。打开 ios project，在 Xcode target 的 Signing & Capabilities 中按 Apple 指引添加 capability。若项目还没有 ios 目录，可先生成：

```sh
xed ios
npx expo prebuild -p ios
```

已有可管理的 ios directory 时打开 Xcode；没有时先 prebuild 生成目录，然后再按 Xcode 流程操作。

### 用 Apple Developer Console 添加

1. 在 app 的 entitlements 文件（Expo 项目为 app config）写入 capability 对应 key / value。
2. 登录 Apple Developer Console，进入 Certificates, IDs & Profiles → Identifiers。
3. 选择 bundle identifier 匹配的 App ID，开启 capability 并保存确认。
4. 若 signing provisioning profile 已生成，重新生成 profile 后才可用新的 entitlement 签 production IPA。

配置不匹配时常见 build error 会明确指出 profile 不包含某 capability 或 entitlement，例如 Associated Domains：

```text
Provisioning profile does not support the Associated Domains capability.
Provisioning profile does not include the com.apple.developer.associated-domains entitlement.
```

## 关键名词

- **Capability：**Apple Developer Console / App ID 上启用的 Apple 服务权限。
- **Entitlement：**签名 App 内声明的 capability key / value。
- **Provisioning profile：**把 App ID、签名证书、设备和 capability 组合到构建授权文件中的 Apple 配置。
- **Capability sync：**EAS Build 将项目 entitlements 与 Apple Developer Console 中 App ID 状态对齐。
- **App Group / CloudKit Container / Merchant ID：**需要在 Apple Developer 账号下登记并关联 App 的资源标识。
- **App Store Connect API：**Apple 管理 API；部分 Identifier 资源操作仍需要 Apple cookies 会话。

## 官方代码主题覆盖

源页代码 / command topics 已全部整理：查看 ios.entitlements introspection；支持 entitlement 清单；APP config 开启 Broadcast 并包含 aps-environment；EXPO_NO_CAPABILITY_SYNC 与 EXPO_DEBUG；Xcode / prebuild 手动配置；Console 更新 App ID、确认并重生成 provisioning profile；capability / entitlement 不匹配的错误样例。

## 下一页

官方页脚 **Next** 是 [Run EAS Build locally](https://docs.expo.dev/build-reference/local-builds/)，介绍用 --local 在开发机或自定义基础设施运行 EAS 构建流程。

**翻页：**[上一页：同一设备安装多个 App Variant](./053-App-Variants.md) · [返回目录](./README.md) · [下一页：在本机运行 EAS Build](./055-EAS-Build-Locally.md)
