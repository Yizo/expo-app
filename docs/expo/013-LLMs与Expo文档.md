# 013｜让 AI 快速读取 Expo 文档

**翻页：**[上一页：Argent 与 Expo](./012-Argent与Expo.md) · [目录](./README.md) · [下一页：开发工具](./014-开发工具.md)

**官方页面：**[Documentation for AI agents and LLMs](https://docs.expo.dev/llms/)

> 这是一页文档检索方式介绍，不绑定 SDK 版本。查 API 时应选择与项目匹配的版本；本地项目采用 Expo `~56.0.11`，对应 [SDK v56.0.0 参考页](https://docs.expo.dev/versions/v56.0.0/)。

## 如何少量读取所需的文档

Expo 提供几种把官方文档交给 AI 助手的方式。按提问范围选一种即可：

| 方法 | 适用场景 | 用法 |
| --- | --- | --- |
| 单页 Markdown | 只需给助手一篇页面作为上下文。 | 在页面 URL 末尾加 `/index.md` 或 `.md`。 |
| Copy Markdown | 手动复制一篇页面到提问上下文。 | 在页面顶部选择 **Copy page → Copy Markdown**。 |
| 文档总索引 | 让代理按主题发现页面，适合项目规则文件或代理工具配置。 | 把 [`/llms.txt`](https://docs.expo.dev/llms.txt) 加到助手可读取的配置中。 |

示例：开发构建的简介页可以通过以下两种 URL 获取 Markdown 内容：

```text
https://docs.expo.dev/develop/development-builds/introduction/index.md
https://docs.expo.dev/develop/development-builds/introduction.md
```

两种地址得到同一页的轻量 Markdown，适合按需载入一个具体主题，而不是把整站 HTML 都塞进上下文。

Expo 的 `/llms.txt` 索引列出各文档页的 Markdown 链接与简短说明，代理可以先看索引，再只读取与任务有关的页面。

## 关键名词

- **Markdown 版本**：去掉页面导航和装饰的正文文本，便于模型处理，也更节省上下文空间。
- **上下文窗口**：模型一次能参考的信息上限；只提供任务相关页面通常比一次加载整站更有效。
- **`llms.txt`**：帮助 AI 工具发现网站文档内容的索引文件。Expo 的版本会列出文档页链接和摘要。

## 官方代码主题覆盖

本页源文的代码 / URL 示例主题均已覆盖：两种单页 Markdown URL 变体，以及 `/llms.txt` 文档总索引入口。页面其余内容为方法说明，没有应用代码。

## 下一页

页脚 Next 指向 [Tools for development](https://docs.expo.dev/develop/tools/)。

**翻页：**[上一页：Argent 与 Expo](./012-Argent与Expo.md) · [目录](./README.md) · [下一页：开发工具](./014-开发工具.md)
