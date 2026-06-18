# Expo 文档列表自动化生成

## 目标

从文档列表文件中读取 Expo 文档 URL，按列表顺序生成本地 Markdown 学习文档。

---

## 约束条件

> 请严格按照 `doc/workflows.md` 执行，不要扩展或推断未定义的行为。

1. 本地文件读取和写入范围只能限于 `doc/workflows.md` 中明确列举或配置的文件、模板、文档列表和输出目录。
2. 禁止扫描、读取、修改工作流文档未明确声明的其他本地目录或文件。
3. 初始阶段只能访问工作流文档或文档列表中明确给出的互联网文档地址。
4. 如果已访问的互联网文档中包含其他链接，只有在工作流文档明确允许继续访问时，才可以访问。
5. 每个生成文件只能基于当前 URL 对应的文档内容生成，不能混入其他文档内容。
6. 最终只允许在工作流文档配置的输出目录中生成 Markdown 文件，不得创建其他额外文件。
7. Expo版本以互联网文档地址中的版本为主, 不要看本地版本
8. 调用 `../tools/generate-expo-tutorial-docs.js` 脚本来生成, 不要生成额外的脚步工具
9. 每篇生成的 Markdown 必须包含「上一页 / 下一页」导航，顺序以 `DOC_LIST_FILE` 为准
10. 本次生成概览、任务状态、跳过原因等工作流元信息只能输出到控制台或对话回复，**不得写入**生成的 Markdown 文档

## 配置

所有可变配置只在这里写一次，后续流程只能引用变量。

```text
DOC_LIST_FILE = ./Guides/docs-list.txt
PROMPT_TEMPLATE = ./Prompt.md
OUTPUT_DIR = ./expo/Guides
MAX_CONCURRENCY = 20
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
6. 判断每个任务的目标文件 `{{行序号}}__{{文件名}}.md` 是否已存在；已存在则跳过，不读取 URL、不生成、不覆盖。
7. 使用最多 `MAX_CONCURRENCY` 个 agent 并行处理剩余任务。
8. 每个任务只处理一个 URL。
9. 每个任务使用 `PROMPT_TEMPLATE`，将 `{{url}}` 替换为当前 URL。
10. 生成当前 URL 对应的 Markdown 学习文档。
11. 将结果保存到 `OUTPUT_DIR`。
12. 所有任务完成后，在控制台或对话中输出**本次生成概览**（统计新增、跳过、失败等），不得写入任何 Markdown 文档。

---

## 单个任务规则

每个 agent 一次只处理一个文档 URL。

处理逻辑：

```text
lineNumber = currentLineNumberInDocList
slug = lastPathSegment(currentUrl)
outputPath = joinPath(OUTPUT_DIR, lineNumber + "__" + slug + ".md")

if fileExists(outputPath):
  markTaskSkipped(outputPath)
  continue

prompt = read(PROMPT_TEMPLATE)
prompt = prompt.replace("{{url}}", currentUrl)

content = generateMarkdown(prompt)
writeFile(outputPath, content)
```

要求：

1. 生成内容只能来自当前 URL 对应的文档。
2. 不允许读取其他 URL 的文档内容。
3. 不允许把多个文档内容混在一起。
4. 不允许把工作流逻辑、任务状态、本次生成概览写入生成的学习文档。
5. 目标文件已存在时必须跳过，不得覆盖。

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

1. 编号等于 `DOC_LIST_FILE` 中的**行序号**（从 1 开始，空行和 `#` 注释行不计）
2. 以 URL 最后一个 pathname 为文件名，去掉 `.md` 后缀
3. 最后拼接为 `{{行序号}}__{{文件名}}.md`
4. 同一 slug 出现在不同行时，仍按行序号分别编号，**禁止**按 slug 复用旧文件路径
5. 若 `{{行序号}}__{{文件名}}.md` 已存在，跳过该任务，不覆盖

示例：

```text
https://docs.expo.dev/workflow/overview.md
→ 1_overview.md
```

---

## 去重与错误处理

需要维护：

```text
visitedUrls = []
```

规则：

1. 重复 URL 跳过，不终止流程。
2. 目标文件 `{{行序号}}__{{文件名}}.md` 已存在时跳过，不终止流程。
3. 单个 URL 读取失败、生成失败或保存失败，只记录失败并继续处理其他 URL。
4. 不生成空文件。
5. 不用错误信息代替学习文档内容。
6. 只有 `DOC_LIST_FILE` 读取失败、`OUTPUT_DIR` 无法创建等全局错误，才终止整个流程。
7. 全部任务完成后，必须对 `OUTPUT_DIR` 中所有 Markdown 执行一次「文档导航编号」校验；发现错误则按规则修复，不得跳过。

### 本次生成概览（仅输出到控制台或对话）

全部任务结束后输出，**不得写入 Markdown 文档**。建议包含：

1. 列表总行数、已存在跳过数、本次新增生成数、失败数、重复 URL 跳过数。
2. 按 `DOC_LIST_FILE` 顺序列出每条任务的状态：`SKIPPED exists`、`GENERATED`、`FAILED`、`SKIPPED duplicate`。
3. 若有失败项，列出对应行序号、URL 和错误原因。

### 文档导航编号校验与修复

文件名格式为 `{{行序号}}__{{slug}}.md`，其中 `{{行序号}}` 必须与 `DOC_LIST_FILE` 中对应 URL 的行序号一致（从 1 开始，跳过空行和注释行）。

每篇文档末尾的 `## 文档导航` 必须满足：

1. 编号为 `N` 的文件，**上一页**必须指向 `N-1`（`N=1` 时写「无」）。
2. 编号为 `N` 的文件，**下一页**必须指向 `N+1`（`N` 为最大编号时写「无」）。
3. 链接目标文件名中的编号必须与上述规则一致，禁止跳号、禁止指向不存在文件、禁止复用其他编号区间的同名组件文档。
4. 双向一致：若 `A` 的下一页是 `B`，则 `B` 的上一页必须是 `A`。
5. 每篇文档的导航区块只能各包含一行「上一页」和一行「下一页」。

校验提示词：

```text
审查 {{OUTPUT_DIR}} 目录下所有 Markdown 文件的「## 文档导航」区块。

规则：
- 文件名前缀编号为 N（如 137__button.md 的 N=137）
- 上一页：若 N>1，必须链接到 (N-1)__*.md；若 N=1，必须为「无」
- 下一页：若 N 不是最大编号，必须链接到 (N+1)__*.md；若 N 是最大编号，必须为「无」
- 禁止链接到编号不等于 N-1 或 N+1 的文件

请列出所有不符合规则的文档，并修复导航链接。修复时只改「## 文档导航」区块，不要改动正文内容。
修复完成后重新全量校验，直到 0 处错误。
```

修复要求：

1. 只修改 `## 文档导航` 及其下方的上一页 / 下一页行，不得改动正文。
2. 链接文字可使用目标文件 slug（连字符转空格、小写），显示名不一致不影响校验通过。
3. 修复后必须重新全量校验，确认编号链可从 `1` 连续走到最大编号，且双向一致。

请阅读并严格执行 `doc/workflows.md`，根据其中的配置和流程生成本地 Markdown 文件。

## 最终要求

最终应在 `OUTPUT_DIR` 中生成一组 Expo 中文 Markdown 学习文档。

文档范围由 `DOC_LIST_FILE` 决定。

保存目录由 `OUTPUT_DIR` 决定。

并行上限由 `MAX_CONCURRENCY` 决定。
