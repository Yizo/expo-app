# Prompt：Expo 文档自动化生成

## 任务目标

从指定起始文档开始，自动递归生成 Expo 教程文档的本地 Markdown 文件。

该流程的核心目标是：

1. 从当前文档 URL 生成对应的本地 Markdown 学习文档
2. 检查当前文档中是否存在下一篇教程文档
3. 如果存在，则继续处理下一篇文档
4. 如果不存在，则结束循环

---

## 初始输入

```text
START_URL = https://docs.expo.dev/tutorial/introduction.md
BASE_URL = https://docs.expo.dev/tutorial
PROMPT_TEMPLATE = ./Prompt.md
OUTPUT_DIR = ../learn/
```

---

## 核心变量

```text
currentUrl = START_URL
visitedUrls = []
```

---

## 执行流程

### 1. 初始化

设置当前文档地址：

```text
currentUrl = START_URL
```

初始化已处理文档列表：

```text
visitedUrls = []
```

---

### 2. 循环处理当前文档

只要 `currentUrl` 有效，并且没有出现在 `visitedUrls` 中，就执行以下流程。

---

### 2.1 标记当前文档

将当前文档加入已处理列表：

```text
visitedUrls.push(currentUrl)
```

用于防止重复处理和死循环。

---

### 2.2 读取提示词模板

读取提示词模板文件：

```text
./Prompt.md
```

该文件中存在变量：

```text
{{url}}
```

将其中的 `{{url}}` 替换为当前文档地址：

```text
{{url}} → currentUrl
```

---

### 2.3 生成当前文档内容

使用替换后的提示词生成当前文档的 Markdown 学习内容。

生成内容必须来自当前文档本身。

不要混入下一篇文档内容。

---

### 2.4 保存当前文档

从 `currentUrl` 中提取最后一个路径片段作为文件名。

示例：

```text
https://docs.expo.dev/tutorial/introduction.md
→ introduction.md
```

保存到：

```text
../learn/introduction.md
```

完整示例：

```text
../learn/introduction.md
```

---

## 3. 判断是否继续迭代

生成并保存当前文档后，检查当前文档内容中是否存在下一篇教程链接。

---

### 3.1 迭代判断条件

只有同时满足以下条件，才允许继续循环：

1. 当前文档中存在 `Next`
2. `Next` 后面存在括号内容
3. 括号内容中包含 `tutorial` 关键字

示例：

```md
Next ([Start](/tutorial/create-your-first-app))
```

或：

```md
Next: [Start](/tutorial/create-your-first-app)
```

或：

```md
Next step: [Create your first app](/tutorial/create-your-first-app)
```

只要能从 `Next` 后面的括号或 Markdown 链接中提取到包含 `tutorial` 的路径，即认为存在下一篇文档。

---

### 3.2 需要提取的内容

从 `Next` 后面的括号内容中提取包含 `tutorial` 的路径。

示例：

```md
[Start](/tutorial/create-your-first-app)
```

需要提取：

```text
/tutorial/create-your-first-app
```

---

### 3.3 解析下一篇文档路径

从提取到的路径中取最后一个路径片段。

示例：

```text
/tutorial/create-your-first-app
→ create-your-first-app
```

然后按照以下规则拼接下一篇文档 URL：

```text
nextUrl = BASE_URL + "/" + 最后一个路径片段 + ".md"
```

示例：

```text
BASE_URL = https://docs.expo.dev/tutorial
最后一个路径片段 = create-your-first-app

nextUrl = https://docs.expo.dev/tutorial/create-your-first-app.md
```

---

## 4. 终止条件

如果满足以下任一条件，则结束循环：

1. 当前文档中不存在 `Next`
2. `Next` 后面不存在括号内容
3. 括号内容中不包含 `tutorial` 关键字
4. 无法从括号内容中提取有效路径
5. 无法解析出最后一个路径片段
6. 拼接出的 `nextUrl` 已存在于 `visitedUrls`
7. 当前文档读取失败
8. 当前文档生成失败

---

## 5. 进入下一轮循环

如果成功解析出 `nextUrl`，并且 `nextUrl` 不在 `visitedUrls` 中，则：

```text
currentUrl = nextUrl
```

继续执行下一轮循环。

---

## URL 处理规则

### 1. 文件名提取规则

从 URL 最后一段提取文件名。

示例：

```text
https://docs.expo.dev/tutorial/introduction.md
→ introduction.md
```

如果 URL 最后一段没有 `.md` 后缀，则补充 `.md`。

示例：

```text
https://docs.expo.dev/tutorial/create-your-first-app
→ create-your-first-app.md
```

---

### 2. 下一篇文档 URL 拼接规则

必须使用以下规则：

```text
nextUrl = BASE_URL + "/" + 最后一个路径片段 + ".md"
```

示例：

```text
/tutorial/create-your-first-app
→ create-your-first-app
→ https://docs.expo.dev/tutorial/create-your-first-app.md
```

---

### 3. 禁止错误拼接

禁止把下一篇路径拼接到当前 `.md` 文件后面。

错误示例：

```text
https://docs.expo.dev/tutorial/introduction.md/create-your-first-app
```

正确示例：

```text
https://docs.expo.dev/tutorial/create-your-first-app.md
```

---

## 内容生成规则

### 1. 单个文档生成规则

每一轮只处理一个当前文档。

当前文档地址由：

```text
currentUrl
```

决定。

生成内容时，只基于当前文档，不要主动读取下一篇文档内容。

---

### 2. Prompt.md 的职责

`./Prompt.md` 只负责定义“单篇文档如何生成学习文档”。

它不负责：

- 控制循环
- 判断下一篇文档
- 拼接 URL
- 保存文件
- 去重

---

### 3. 本流程的职责

本流程只负责：

- 控制当前文档 URL
- 调用 Prompt.md
- 替换 `{{url}}`
- 生成当前文档内容
- 保存文件
- 判断是否存在下一篇文档
- 拼接下一篇 URL
- 控制循环终止

---

## 去重规则

必须维护：

```text
visitedUrls
```

每处理一个文档，都要加入 `visitedUrls`。

如果下一篇文档 URL 已经存在于 `visitedUrls`，必须结束循环，不能继续处理。

---

## 输出目录规则

所有生成的 Markdown 文件都必须保存到：

```text
../learn/
```

示例：

```text
../learn/introduction.md
../learn/create-your-first-app.md
../learn/add-navigation.md
```

---

## 关键约束

1. 不要读取 Next 链接中的文档内容
2. 只提取 Next 后面括号中的路径
3. 只有括号内容包含 `tutorial` 才继续迭代
4. 下一篇 URL 必须由 `BASE_URL + "/" + 最后一个路径片段 + ".md"` 生成
5. 每轮只生成当前文档
6. 必须防止死循环
7. 不允许把工作流逻辑写入生成的学习文档中
8. 不允许把下一篇文档内容混入当前文档
9. 如果没有满足迭代条件，必须结束 loop

---

## 伪代码说明

```text
currentUrl = START_URL
visitedUrls = []

while currentUrl is valid:
    if currentUrl in visitedUrls:
        break

    visitedUrls.push(currentUrl)

    prompt = read("./Prompt.md")
    prompt = prompt.replace("{{url}}", currentUrl)

    content = generateMarkdown(prompt)

    filename = getLastPathSegment(currentUrl)
    if filename does not end with ".md":
        filename = filename + ".md"

    writeFile("../learn/" + filename, content)

    currentDocument = readCurrentDocument(currentUrl)

    nextMatch = find text after "Next" that contains parentheses or markdown link
    if nextMatch does not exist:
        break

    if nextMatch content does not contain "tutorial":
        break

    tutorialPath = extract path containing "tutorial" from nextMatch
    if tutorialPath is invalid:
        break

    lastPath = getLastPathSegment(tutorialPath)
    if lastPath is empty:
        break

    nextUrl = BASE_URL + "/" + lastPath + ".md"

    if nextUrl in visitedUrls:
        break

    currentUrl = nextUrl
```

---

## 最终要求

请严格按照以上流程执行。

最终结果应该是在 `../learn/` 目录中生成一组 Expo 教程 Markdown 学习文档。

循环是否继续，完全由以下条件决定：

```text
当前文档中存在 Next，并且 Next 后面存在括号，且括号内容包含 tutorial
```

否则立即结束循环。
