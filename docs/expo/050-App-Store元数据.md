# 050｜管理 App Store 元数据

**翻页：**[上一页：提交到应用商店](./049-提交到应用商店.md) · [目录](./README.md) · [下一页：发布 OTA 更新](./051-发布OTA更新.md)

**官方页面：**[App stores metadata](https://docs.expo.dev/deploy/app-stores-metadata/)

## EAS Metadata 能做什么

EAS Metadata 通过命令行维护应用商店展示资料，例如标题、副标题、描述、关键词和支持 / 隐私网址；可减少逐个填写 App Store Connect 表单的重复工作，并提前发现部分常见商店资料问题。

官方页面当前将 EAS Metadata 标为 **Beta**，并说明它只支持 Apple App Store。Google Play listing 仍在 Google Play Console 管理。

## store.config.json 示例

在 Expo 项目根目录创建 store.config.json：

~~~json
{
  "configVersion": 0,
  "apple": {
    "info": {
      "en-US": {
        "title": "Awesome App",
        "subtitle": "Your self-made awesome app",
        "description": "The most awesome app you have ever seen",
        "keywords": ["awesome", "app"],
        "marketingUrl": "https://example.com/en/promo",
        "supportUrl": "https://example.com/en/support",
        "privacyPolicyUrl": "https://example.com/en/privacy"
      }
    }
  }
}
~~~

把演示值替换成产品真实文案与链接。configVersion 用于标记元数据 schema 未来不兼容变化的版本。

## 推送元数据

先上传并处理一个新 app binary，再发布元数据配置；在项目根目录运行：

~~~sh
eas metadata:push
~~~

命令会检查 store.config.json。如果发现错误会提示；可以修正后重试，成功后会上传配置到 App Store Connect。更新本地配置后可重复运行推送。

## 开发工具支持

Expo Tools VS Code 扩展能为 store.config.json 提供自动补全、属性提示和警告。更多字段查看官方 EAS Metadata schema。

## 关键名词

- **Store metadata / 商店元数据**：在商店列表展示的标题、关键词、描述、支持网址、隐私政策等资料。
- **Schema version / configVersion**：元数据配置格式版本号，不是 App 版本或 Expo SDK 版本。
- **EAS Metadata**：通过 EAS CLI 管理 App Store Connect 元数据的服务；本页标注处于 Beta。

## 官方代码主题覆盖

本页唯一结构代码为 Apple store.config.json 示例，已用等价字段重写；唯一 CLI 命令 eas metadata:push 已列出。

## 下一页

页脚 Next 指向 [Send over-the-air updates](https://docs.expo.dev/deploy/send-over-the-air-updates/)。

**翻页：**[上一页：提交到应用商店](./049-提交到应用商店.md) · [目录](./README.md) · [下一页：发布 OTA 更新](./051-发布OTA更新.md)

