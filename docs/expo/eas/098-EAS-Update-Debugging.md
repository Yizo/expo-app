# 098｜EAS Update Debugging：定位没有收到 Update 的原因

**翻页：**[上一页：EAS Update Runtime Versions](./097-EAS-Update-Runtime-Versions.md) · [目录](./README.md) · [下一页：EAS Update Error Recovery](./099-EAS-Update-Error-Recovery.md)

**官方页面：**[EAS Update debugging](https://docs.expo.dev/eas-update/debug/)

**版本边界：**本页按 EAS Update 当前 Dashboard / expo-updates 行为排错。SDK 56 项目使用 expo-updates ~56.0.27（SDK v56.0.0 expo-updates 参考快照），channel 与 runtimeVersion 必须和原生 build 完全匹配。下面的命令与诊断步骤未在本机执行。

## 先从 Deployments Dashboard 确认状态

EAS Dashboard 的 Deployments 页面显示 build、channel / branch 与已发布 updates 的对应关系。若项目没有使用 EAS Build，这页不会有完整 deployment 数据，应转为检查 non-EAS native configuration。

常见问题与第一步：

| Dashboard 状态 | 可能原因 | 建议 |
| --- | --- | --- |
| Unexpected channel | binary build 时写入了错误 channel。 | 修正 profile channel 并重新 build。 |
| Unexpected runtime version | binary 的 runtime version 没有按预期生成。 | 修正 runtimeVersion 后新建 build。 |
| Unexpected branch | channel 没有映射到预期 branch。 | 重新设置 channel-to-branch mapping。 |
| Missing updates | branch 没有 update，或 update runtime / platform 和 build 不匹配。 | 向目标 branch publish，并检查 update runtime / platform。 |
| Missing branch | channel 正确但未 link branch。 | 将 channel 关联到实际 branch。 |
| Missing deployment | binary 没配置 EAS Update 或 channel / runtime 缺少。 | 校验 app config、重建带正确配置的 binary。 |

## Build 正确但仍显示旧 Update

如果 channel、runtime、branch、update 都正常，但 App 重启后还显示旧代码，新的 JavaScript 可能在 root component render 之前 crash。expo-updates 会尝试恢复到上一次可用版本；检查 error logs、是否缺环境变量，并发布修复 update。

## Failed to Load All Assets

客户端下载了 update manifest，却没能取完该 update 所需 assets。常见原因：

- 新增很多大图 / 视频，移动网络连接不佳。
- 用户网络不稳定。
- 用户所处网络 / 地区阻断或 throttling EAS Update 使用的 Cloudflare IP。

检查 Dashboard update asset list 与单个资源大小；在本机复现时读 expo-updates native logs。如果接入 crash / log service，可查看受影响用户的网络 / country。

## 校验 Channel 与 Runtime 配置

EAS Build profile 里的 channel 示例：

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

通常 app config 用 runtimeVersion policy 标明兼容关系：

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

修改 channel / runtime 后需重建 binary。publish update 时 CLI 会回显 branch / runtimeVersion，可与 target build 核对：

```sh
eas update
```

如果 channel link 错误，使用 EAS CLI 编辑映射；若 branch 尚不存在，先创建 branch 再发布：

```sh
eas channel:edit production --branch release-1.0
eas branch:create release-1.0
```

## 校验 expo-updates 与 Native Configuration

app config 应有正确 updates.url、runtimeVersion，且 updates.enabled 不能是 false。SDK 56 项目按已锁定 SDK 环境安装 expo-updates：

```sh
npx expo install expo-updates
yarn expo install expo-updates
pnpm expo install expo-updates
bun expo install expo-updates
```

eas update:configure 会补全 app config；无 CNG 原生目录时，先运行 expo prebuild inspect project 生成结果。检查 AndroidManifest.xml 有 EAS Updates URL / Runtime Version metadata；iOS Expo.plist 有 EXUpdatesURL / EXUpdatesRuntimeVersion。Update URL 中 project ID 与当前 EAS project 相同。

## 不使用 EAS Build 时检查 Channel

如果自己使用 Android Studio / Xcode 构建，要手动保证 native channel 正确并存在于 EAS。channel / branch 映射可在 Dashboard 或 CLI 创建、查看：

```sh
eas channel:create production
eas channel:edit production --branch release-1.0
eas update --channel production
```

Branch Detail 页面会列出每个 update 的 platform 与 runtimeVersion。Build 只能获取同 platform 且 runtimeVersion 完全相同的最新 update。

## 检查最终编译进 Binary 的配置

可用 iOS Simulator build 检查最终文件，不要只看生成前的 app config：

1. eas.json 中给诊断 profile 加 ios.simulator: true。
2. 下载 build 后解压 app bundle。
3. 右键 app 选择 Show Package Contents，打开 Expo.plist。
4. 核对 EXUpdatesRequestHeaders、EXUpdatesRuntimeVersion 和 EXUpdatesURL。

模拟器 profile 只作诊断，不是商店 IPA 发行配置。

## 用 Manifest / 网络 Request 诊断

EAS update URL 形如 https://u.expo.dev/your-project-id。加 runtime-version、channel-name、platform query 可观察某条 manifest response：

```text
https://u.expo.dev/YOUR_PROJECT_ID?runtime-version=1.0.0&channel-name=production&platform=android
```

也可用 HTTPS proxy（如 Proxyman / Charles）检查设备网络调用。重点检查：

- Request URL 与响应：u.expo.dev 返回 update manifest。
- Assets：assets.eascdn.net 返回 JS bundle、图片 / 字体等资源。
- Request headers：Expo-Runtime-Version、expo-channel-name、Expo-Platform，应与 build 一致。
- Response code：正常返回通常为 200；没有变更时可能为 304。

## Release 行为与 Debug Build

默认 expo-updates 只在 release build 启动更新机制；普通 debug build 仍从 Metro server 读取 JS。想调试 native configuration 时，可创建启用 updates 的 debug build，SDK CLI 环境变量 EX_UPDATES_NATIVE_DEBUG=1。

Android 本地 debug：

```sh
export EX_UPDATES_NATIVE_DEBUG=1
npx expo run:android
```

iOS 本地 debug 还要用同一环境重新安装 CocoaPods；某些 bare Xcode project 需将 SKIP_BUNDLING 替换成 FORCE_BUNDLING 后再编译。CNG 或 EAS build profile 通常更易重复该设置：

```json
{
  "build": {
    "preview_debug": {
      "env": {
        "EX_UPDATES_NATIVE_DEBUG": "1"
      },
      "channel": "preview_debug",
      "android": {
        "distribution": "internal",
        "withoutCredentials": true,
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true,
        "buildConfiguration": "Debug"
      }
    }
  }
}
```

## Publishing Issue 与快速修复

eas update 会在项目根目录生成 dist，供检查此次实际上传哪些 bundle / assets。可以在 Dashboard 查看 named assets，也可本地列出：

```sh
npx expo export
yarn expo export
pnpm expo export
bun expo export
```

如确认最近发布的 update 有 bug，可以 republish 旧版 group 或选择 branch 上的已知版本：

```sh
eas update:republish --group <update-group-id>
eas update:republish --branch production
```

修复更新优先选经过验证的一版；已拿到问题 update 的用户要联网、重启 App 后才能得到修复，所以 logs 中可能会有一段旧 crash 的长尾。

## 关键名词

- **Deployments Page：**展示 build 所指的 channel、channel 映射和兼容 updates。
- **Runtime mismatch：**binary 和 update 具备不同 runtimeVersion，update 不应发给该 binary。
- **Expo Doctor：**检查 Expo 包和 SDK compatibility 的诊断工具。
- **Manifest：**update 的 metadata 清单，包括 runtime、平台与需要下载的 assets。
- **EX_UPDATES_NATIVE_DEBUG：**在本地 debug build 中启用 native updates 测试路径的变量。

## 官方代码主题覆盖

源页代码 / CLI topics 均覆盖：channel / runtime config；channel:edit / branch:create / eas update；四种 package manager 安装 expo-updates、expo prebuild 检查；manifest URL + request header 检查；debug native update 环境变量；iOS Simulator / Xcode build profile；dist / expo export；update:republish。相关 build / publish 没有执行。

## 下一页

官方页脚 **Next** 是 [Error recovery](https://docs.expo.dev/eas-update/error-recovery/)，描述 JS update 早期崩溃时的自动下载、rollback 与应用重新启动行为。

**翻页：**[上一页：EAS Update Runtime Versions](./097-EAS-Update-Runtime-Versions.md) · [返回目录](./README.md) · [下一页：EAS Update Error Recovery](./099-EAS-Update-Error-Recovery.md)
