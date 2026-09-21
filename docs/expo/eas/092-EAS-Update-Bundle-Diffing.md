# 092｜EAS Update Bundle Diffing

**翻页：**[上一页：EAS Update Rollbacks](./091-EAS-Update-Rollbacks.md) · [目录](./README.md) · [下一页：Optimize Update Assets](./093-EAS-Update-Optimize-Assets.md)

**官方页面：**[Bundle diffing for EAS Update](https://docs.expo.dev/eas-update/bundle-diffing/)

**版本边界：**Bundle diffing 需 Expo SDK 55+；SDK 56 默认启用「更新之间」的 patch。嵌入式 bundle patch 仍为 experimental opt-in。项目 Expo ~56.0.11 可用版本以 [SDK v56.0.0 Updates reference](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)为准。

## Patch 如何减少下载量

新 update 通常有 bundle 和 assets。Bundle diffing 比较设备当前 JS bundle 与新 bundle，若可行，只下载差异 patch，减少网络流量和下载时间。服务端使用 bsdiff 生成差异。

只有在 patch 明显小于完整 bundle 并能高效计算时，EAS 才会返回 patch；否则下载完整 bundle。

## 更新与更新之间的 Patch

SDK 56 及更新版本默认启用 update-to-update diff。SDK 55 可通过 app config 开启；SDK 56 如需关闭则设 false：

```json
{
  "expo": {
    "updates": {
      "enableBsdiffPatchSupport": true
    }
  }
}
```

SDK 56 若想显式禁用：

```json
{
  "expo": {
    "updates": {
      "enableBsdiffPatchSupport": false
    }
  }
}
```

服务默认优先为 channel 最新 update 与第二新的 update 预先计算 patch。其它 base / target 对若未预计算，第一次可能会收到完整 bundle；随后服务会按需计算差分。新 update 发布后 patch 还要数分钟生成，因此刚发布时用户可能暂时下载完整版。

## 对 Embedded Bundle 做首次 Update Patch

默认新安装的 app 第一次 update check 会下载完整新 bundle。若想从用户 build 时内嵌 bundle 直接 patch 到第一次 OTA，官方提供 experimental opt-in：

```json
{
  "build": {
    "production": {
      "env": {
        "EAS_UPDATE_EXPERIMENTAL_UPLOAD_EMBEDDED_BUNDLE": "1"
      }
    }
  }
}
```

Build 完成时 EAS 会上传 embedded bundle，以后同 channel 的 update 可基于它生成 patch。若不用 EAS Build，则需手动上传 native build 产出的 JS bundle 和 app.manifest：

```sh
eas update:embedded:upload +  --platform <platform> +  --bundle <bundle-path> +  --manifest <manifest-path> +  --channel <channel-name>
```

该功能是 experimental，字段 / 行为可能变化。

## 查找或删除 Embedded Bundle

列出 project 里已登记的嵌入 bundle：

```sh
eas update:embedded:list
eas update:embedded:view <id>
eas update:embedded:delete <id>
```

delete 可安全重试。bundle ID 用 list 找到后再查看或删除。

## 验证是否收到 Patch

在 EAS Dashboard 的 Update Details 页面选择平台，可查看 download size / patch 信息。设备端可从 expo-updates logs API 阅读 log entries；应用成功收到 patch 时会出现 “patch successfully applied” 一类日志。

## 限制与关键名词

- **Bundle diff：**基于用户当前 bundle 生成的差异文件，客户端应用后得到新 JS bundle。
- **Embedded Bundle：**跟 App Store / Play Store native binary 一起打包的 JS / assets。
- **bsdiff：**生成 binary 差异的算法。
- **完整 Bundle：**当差异不够小、计算失败、缺少对应 base 等情况，EAS 回退到整包。
- **Fresh install：**未有 previous downloaded update 的首次安装，默认第一次仍会拿完整 update；embedded patch 是针对该场景的实验选项。

## 官方代码主题覆盖

源页代码 / CLI themes 均覆盖：SDK55 启用 diff、SDK56 显式 false；EAS_BUILD_EXPERIMENTAL_UPLOAD_EMBEDDED_BUNDLE；非 EAS Build 的 embedded bundle upload；embedded bundle list/view/delete；通过 Dashboard 与 Updates API log 验证 patch。

## 下一页

官方页脚 **Next** 是 [Optimize assets for EAS Update](https://docs.expo.dev/eas-update/optimize-assets/)，分析 JS / image assets 的传输体积与优化方式。

**翻页：**[上一页：EAS Update Rollbacks](./091-EAS-Update-Rollbacks.md) · [返回目录](./README.md) · [下一页：Optimize Update Assets](./093-EAS-Update-Optimize-Assets.md)
