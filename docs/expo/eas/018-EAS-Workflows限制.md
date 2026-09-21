# 018｜EAS Workflows 的限制

**翻页：**[上一页：排查 EAS Workflows](./017-EAS-Workflows故障排查.md) · [目录](./README.md) · [下一页：EAS Workflows 示例总览](./019-EAS-Workflows示例总览.md)

**官方页面：**[EAS Workflows limitations](https://docs.expo.dev/eas/workflows/limitations/)

**版本说明：**限制会随 EAS Workflows 服务升级而变化。访问此页时（2026-09-20），官方列出 workflow / job 复用和 matrix 两项限制。

## 当前限制

### 不能复用整份 job / workflow 配置

当前不能在多个 YAML 文件之间共享整段 workflow 或 job 配置。`Custom functions` 可复用的是 job 步骤或 hook 中的一组自定义 steps；它并不等价于 YAML anchor 或可继承的整套 workflow。

### 不支持 matrix

EAS Workflows 暂不支持 matrix build。因此不能在同一 workflow job 声明多组配置并行展开，例如同时将相同任务按多个平台、地区或运行时版本自动组合。

可把需要的组合显式写成多个 jobs，再用 `needs` 连接依赖；复制参数时要注意日后维护成本：

```yaml
jobs:
  android_preview:
    type: build
    params:
      platform: android
      profile: preview
  ios_preview:
    type: build
    params:
      platform: ios
      profile: preview
```

这只是显式 job 配置示意，不代表 matrix 功能已经提供。若复用的是命令序列，可评估自定义函数；若想收到限制变化通知，官方页面建议订阅 Expo Newsletter。

## 关键名词

- **Matrix build**：把一个 job 的平台 / 配置组合自动展开为多个并行 job 的 CI 模式。
- **Custom function**：复用 workflow 中的步骤序列或 hook；它不能共享整份 workflow 配置。
- **Workflow**：定义触发器和 jobs 的 EAS YAML 文件。

## 官方代码主题覆盖

源页以功能限制说明为主，没有可复制的代码块；本页增加 Android / iOS 两个显式 build job 的重写示例，解释在无 matrix 时如何列出组合，并标明它只是 YAML 结构示意。

## 下一页

页脚 **Next** 从 EAS Workflows 分组切换到 Examples 的 [Introduction](https://docs.expo.dev/eas/workflows/examples/introduction/)，开始进入工作流示例链。

**翻页：**[上一页：排查 EAS Workflows](./017-EAS-Workflows故障排查.md) · [返回目录](./README.md) · [下一页：EAS Workflows 示例总览](./019-EAS-Workflows示例总览.md)
