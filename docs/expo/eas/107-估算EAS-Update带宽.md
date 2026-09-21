# 107｜估算 EAS Update 带宽用量

**翻页：**[上一页：从 Update ID 追踪到 EAS Dashboard](./106-追踪Update-ID.md) · [目录](./README.md) · [下一页：在已有原生应用中集成 EAS Update](./108-已有原生App集成Update.md)

**官方页面：**[Estimate bandwidth usage](https://docs.expo.dev/eas-update/estimate-bandwidth/)

**版本边界：**EAS Update 的计划额度与价格会变化。本文的 MAU / 流量算例按官方页面 2026-06 更新时列出的公式说明，不能替代当前账户用量与价格页面。SDK v56 项目可用 `npx expo export` 检查实际导出；Hermes bundle 体积是估算的一部分，不等于整次更新的必然下载量。

## 哪些内容会消耗 Update 带宽

EAS Update 下发 JavaScript、样式和静态资源。更新下载量主要取决于这次发布里**设备还没有的资源**：如果只是 JS 改动，可能只需要下载新的 JS bundle；如果新增图片、字体等不在 binary 或本地缓存中的文件，则这些也要计入。

Hermes bytecode 等 JS 文件可被 Brotli / Gzip 压缩；图片与图标不会由同样过程自动压缩。用户不一定每次都启动 App，因此不少设备会跳过中间 update，实际下载量通常低于“所有用户下载每个更新”的理论上限。

## 用压缩后 bundle 估算单次下载

官方示例以 10 MB 未压缩 JS bundle 和约 2.6 倍压缩比为例：

```text
未压缩 bundle：10 MB
估计压缩体积：10 MB / 2.6 ≈ 3.85 MB
```

这只是 JS 的估算。若新 update 还有用户设备上不存在的资源，需要把其实际传输体积加进单次更新成本。

## 根据带宽额度估算可下载次数

以官方示例的单位计算：1 TiB = 1,024 GiB = 1,048,576 MiB；示例中另有 10,000 个额外 MAU，每个额外 MAU 增加 40 MiB 带宽，则估算可用量是：

```text
1,048,576 MiB + 10,000 × 40 MiB = 1,448,576 MiB
1,448,576 MiB / 3.85 MiB ≈ 376,254 次下载
```

该值是估算，不是用户数：同一位用户可下载多个更新，且 Android / iOS bundle、资源缓存、压缩格式会影响下载大小。月度额度和额外 MAU 的计费方式要以当前 EAS Pricing / Usage 页面为准。

## 导出当前项目的 Hermes Bundle

在生产配置下导出项目，按当前包管理器执行其中一种命令：

```sh
npx expo export
yarn expo export
pnpm expo export
bun expo export
```

导出目录 `dist/_expo/static/js` 中会有 `android`、`ios` 子目录，各自包含 `.hbc` 文件。`.hbc` 是未压缩的 Hermes bundle；两个平台的 bundle 可能不同。选一个文件后可复制成便于后续命令使用的文件名：

```sh
cp dist/_expo/static/js/ios/APP_HASH.hbc bundle.hbc
```

## 查看 Brotli 与 Gzip 压缩后的文件体积

对导出的 bundle 分别计算两种常见压缩结果，并查看生成文件大小：

```sh
brotli -5 -k bundle.hbc
gzip -9 -k bundle.hbc
ls -lh bundle.hbc.br bundle.hbc.gz
```

`-k` 保留输入文件；压缩输出分别为 `bundle.hbc.br` 与 `bundle.hbc.gz`。这用于估算 EAS Update 实际传输 JS 的体积。导出、重命名和压缩命令都是教程示例，本次未在项目上执行。

## 优化带宽的次序

1. 先看账户的 Update usage metrics，找出流量异常或单次 update 变大的原因。
2. 优化图片、字体、视频等资源体积。
3. 确认前两步仍不足时，再使用 Asset Selection 限制哪些资源可随 OTA update 上传；它是较进阶的控制手段，确保设备已有或能从原生 build 获得被排除资源。

## 关键名词

- **MAU：**Monthly Active User，月活用户。EAS 订阅计划可同时规定 MAU 与 bandwidth 等额度。
- **MiB / GiB / TiB：**二进制存储单位，1 GiB = 1,024 MiB；1 TiB = 1,024 GiB。
- **Hermes bytecode（HBC）：**Hermes 引擎使用的编译后 JavaScript bundle 文件。
- **压缩比：**未压缩体积除以压缩后体积；例如 10 MB / 2.6 ≈ 3.85 MB。
- **Asset Selection：**用文件匹配规则决定资源是否包含在 OTA 更新中；它不等于资源自动压缩。

## 官方代码主题覆盖

源页的代码主题全部覆盖：Hermes bundle 压缩比公式；带宽额度与每 MAU 附加额度换算成下载次数的公式；npx / Yarn / pnpm / Bun 的 `expo export` 命令；从 Android / iOS `.hbc` 导出路径读取 bundle；Brotli、Gzip 与 `ls -lh` 检查文件大小的命令。另补出一条 `cp` 示例用于演示源页所述的重命名步骤。

## 下一页

官方页脚 **Next** 是 [Using EAS Update in an existing native app](https://docs.expo.dev/eas-update/integration-in-existing-native-apps/)，介绍将 Update 系统接入已有的 Android / iOS 原生宿主应用。

**翻页：**[上一页：从 Update ID 追踪到 EAS Dashboard](./106-追踪Update-ID.md) · [返回目录](./README.md) · [下一页：在已有原生应用中集成 EAS Update](./108-已有原生App集成Update.md)
