# Permissions

## 文档解决的问题

这篇文档讲的是：移动应用在访问用户敏感数据或系统能力之前，除了运行时调用权限 API，还需要在原生层做哪些构建期配置；尤其是 Android 和 iOS 的权限声明分别放哪里、怎么加、怎么改、怎么删。

## 适用场景

- 你要接入相册、相机、定位、通讯录等能力。
- 你已经会调用 JavaScript 权限 API，但不清楚为什么真机上仍然不能弹权限框。
- 你想知道 Expo Go、Development Build、上架包在权限配置上的差异。

## 核心概念

### 运行时权限请求 vs 构建时原生声明

文档明确区分了两层：

- 运行时：例如 `MediaLibrary.requestPermissionsAsync()` 这类 JavaScript API。
- 构建时：Android Manifest 或 iOS `Info.plist` 中的权限声明与说明文案。

在独立应用和 Development Build 中，只有先完成原生构建期声明，运行时请求才有意义。

### Expo Go 的特殊性

文档明确说明：在 Expo Go 中测试时，不需要你自己先配置这些原生权限，因为宿主 App 已经内置了一部分能力。但这不代表正式应用不需要配置。

## 关键流程

### Android 权限流程

1. 安装需要权限的库。
2. 查看库是否已自动通过 config plugin 或包级 `AndroidManifest.xml` 添加权限。
3. 如果还要补额外权限，用 `android.permissions` 添加。
4. 如果要移除某个库自动带入的权限，用 `android.blockedPermissions` 阻止。

### iOS 权限流程

1. 确认要使用的系统能力。
2. 在 `ios.infoPlist` 中设置对应的权限说明文案。
3. 如果库提供自己的 config plugin 配置项，也可以在 plugin 配置里改提示文案。
4. 重新构建原生应用。

### Web 权限流程

文档只强调一点：Web 上某些权限必须在安全上下文中请求，例如 `https://` 或 `http://localhost`。

## 命令、配置、文件说明

### Android 配置

- `android.permissions`
- `android.blockedPermissions`

示例：

```json
{
  "android": {
    "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]
  }
}
```

屏蔽权限示例：

```json
{
  "android": {
    "blockedPermissions": ["android.permission.RECORD_AUDIO"]
  }
}
```

### iOS 配置

- `ios.infoPlist`

示例：

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses the camera to scan barcodes on event tickets."
    }
  }
}
```

### 相关文件

- `app.json` / `app.config.*`
- `AndroidManifest.xml`
- `Info.plist`

### 调试相关命令

文档未提供统一权限调试命令，但明确提到在 Expo Go 中可通过重新安装宿主应用来重测权限流程；在开发中可运行：

```sh
npx expo start
```

然后通过终端 UI 重新安装 Expo Go 测试。

## 注意事项、限制条件和坑点

- 文档明确警告：权限没配好或解释不充分，应用可能被商店拒审或下架。
- Android 某些权限属于危险权限或签名权限，没有正当理由可能被 Google 拒绝。
- iOS 的 `Info.plist` 权限说明不能通过 OTA 更新下发，必须跟随新的原生二进制发布。
- 默认提示文案通常只是模板，直接提交商店往往不够，需要改成与你业务相符的解释。
- 系统层面通常不会无限次重复弹同一权限；测试拒绝流程时可能需要卸载重装 App。

## React Web 开发者容易误解的点

- Web 中很多浏览器权限只要运行时调用就行；移动端还要先在原生包里“声明你有资格请求”。
- Expo Go 能弹权限框，不代表你的正式 App 已经配置正确。
- iOS 权限说明文案不是可选文案，它是原生审核和系统提示的一部分。
- Android“删除某个权限”不是简单从 JS 里不调用，而是要从 Manifest 合并结果里显式去掉。

## 实际开发建议

- 每接入一个原生库时，同步检查它带来了哪些权限。
- iOS 权限文案直接写业务场景，不要只写“需要访问相机”这种空泛语句。
- 在提测前做一次“拒绝权限后的产品流程”检查。
- 基于文档内容推导：权限配置应被视为产品合规与审核的一部分，而不是纯技术细节。

## 文档明确说明

- Standalone 和 Development Build 需要构建期原生权限配置。
- Android 用 `android.permissions` 和 `android.blockedPermissions` 管理权限。
- iOS 用 `ios.infoPlist` 或相关 config plugin 配置权限说明。
- `Info.plist` 变更不能通过 OTA 更新下发。
- Web 端权限需要安全上下文。

## 基于文档内容推导

- 同一个功能在 Expo Go 测试通过，不意味着上架构建一定通过审核。
- 如果团队把权限问题留到发布前才检查，返工成本会很高，因为它往往需要重新出包。
- 当前文档未涉及每个权限 API 的具体运行时调用方式，重点在声明与配置。

<!-- NAVIGATION START -->
---
[← 上一页：Privacy manifests](./5_apple-privacy.md) | [下一页：Environment variables in Expo →](./7_environment-variables.md)
<!-- NAVIGATION END -->
