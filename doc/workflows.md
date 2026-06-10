# Expo 文档列表自动化生成

## 目标

从文档列表文件中读取 Expo 文档 URL，按列表顺序生成本地 Markdown 学习文档。

---

## 配置

所有可变配置只在这里写一次，后续流程只能引用变量。

```text
DOC_LIST_FILE = ./docs-list.txt
PROMPT_TEMPLATE = ./Prompt.md
OUTPUT_DIR = ./expo/Guides/
MAX_CONCURRENCY = 10
```

说明：

- `DOC_LIST_FILE`：文档 URL 列表文件，一行一个 URL
- `PROMPT_TEMPLATE`：单篇文档生成提示词模板
- `OUTPUT_DIR`：Markdown 文件保存目录
- `MAX_CONCURRENCY`：最大并行 agent 数量

---

## 文档列表规则

从 `DOC_LIST_FILE` 读取 URL 列表。

读取后需要：

1. 去除每行前后空格
2. 忽略空行
3. 忽略以 `#` 开头的注释行
4. 保持原始顺序
5. 不自动新增 URL

---

## 执行流程

1. 读取配置。
2. 确保 `OUTPUT_DIR` 存在，不存在则创建。
3. 读取 `DOC_LIST_FILE`。
4. 清理文档列表。
5. 按顺序构建任务队列。
6. 使用最多 `MAX_CONCURRENCY` 个 agent 并行处理任务。
7. 每个任务只处理一个 URL。
8. 每个任务使用 `PROMPT_TEMPLATE`，将 `{{url}}` 替换为当前 URL。
9. 生成当前 URL 对应的 Markdown 学习文档。
10. 将结果保存到 `OUTPUT_DIR`。
11. 所有任务完成后输出结果汇总。

---

## 单个任务规则

每个 agent 一次只处理一个文档 URL。

处理逻辑：

```text
prompt = read(PROMPT_TEMPLATE)
prompt = prompt.replace("{{url}}", currentUrl)

content = generateMarkdown(prompt)

filename = generateFilenameFromUrl(currentUrl)
outputPath = joinPath(OUTPUT_DIR, filename)

writeFile(outputPath, content)
```

要求：

1. 生成内容只能来自当前 URL 对应的文档。
2. 不允许读取其他 URL 的文档内容。
3. 不允许把多个文档内容混在一起。
4. 不允许把工作流逻辑写入生成的学习文档。

---

## 并行规则

可以启用多个 agent 并行生成，但必须遵守：

1. 同时运行的 agent 数量不能超过 `MAX_CONCURRENCY`。
2. 每个 URL 只能被一个 agent 处理。
3. 每个 agent 只能写入自己的输出文件。
4. 不允许多个 agent 写入同一个文件。
5. 并行只影响执行速度，不改变文档列表顺序。
6. 最终汇总结果必须按原始 URL 顺序展示。

实际并发数：

```text
actualConcurrency = min(MAX_CONCURRENCY, taskCount)
```

---

## 文件名规则

为了避免同名覆盖，文件名必须由 URL 路径生成。

规则：

1. 以文档中顺序为编号, 从1开始递增
2. 以URL最后一个pathname为文件名, 去掉.md后缀
3. 最后拼接为`{{序号}}__{{文件名}}.md`

示例：

````text
https://docs.expo.dev/workflow/overview.md
→ 1_overview.md

---

## 去重与错误处理

需要维护：

```text
visitedUrls = []
````

规则：

1. 重复 URL 跳过，不终止流程。
2. 单个 URL 读取失败、生成失败或保存失败，只记录失败并继续处理其他 URL。
3. 不生成空文件。
4. 不用错误信息代替学习文档内容。
5. 只有 `DOC_LIST_FILE` 读取失败、`OUTPUT_DIR` 无法创建等全局错误，才终止整个流程。

## 最终要求

最终应在 `OUTPUT_DIR` 中生成一组 Expo 中文 Markdown 学习文档。

文档范围由 `DOC_LIST_FILE` 决定。

保存目录由 `OUTPUT_DIR` 决定。

并行上限由 `MAX_CONCURRENCY` 决定。
