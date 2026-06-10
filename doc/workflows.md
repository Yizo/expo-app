# Prompt：Expo 文档自动化生成

## 任务目标

从指定起始文档开始，自动递归生成 Expo 教程文档的本地 Markdown 文件。

---

## 初始输入

```text
START_URL = https://docs.expo.dev/tutorial/introduction.md
BASE_URL  = https://docs.expo.dev/tutorial
PROMPT_TEMPLATE = ../Prompt.md
OUTPUT_DIR = ../learn/
```

---

## 执行流程

### 1. 初始化

- currentUrl = START_URL
- visitedUrls = []

---

### 2. 循环处理（直到结束）

对 currentUrl 执行以下步骤：

---

### 2.1 生成文档

- 读取 `PROMPT_TEMPLATE`
- 替换：

```text
{{url}} → currentUrl
```

- 使用该提示词生成 Markdown 内容

---

### 2.2 保存文件

- 从 URL 提取文件名：

```text
https://docs.expo.dev/tutorial/introduction.md
→ introduction.md
```

- 保存到：

```text
../learn/introduction.md
```

---

### 2.3 查找 Next Step

在当前文档中查找包含“Next Step / Next steps”的段落

提取其中的链接，例如：

```md
[Start](/tutorial/create-your-first-app)
```

---

### 2.4 解析下一文档 URL

规则：

1. 提取路径最后一段：

```text
/tutorial/create-your-first-app → create-your-first-app
```

2. 拼接为：

```text
nextUrl = BASE_URL + "/" + path + ".md"
```

示例：

```text
create-your-first-app
→ https://docs.expo.dev/tutorial/create-your-first-app.md
```

---

### 2.5 终止条件

满足任一条件则停止：

- 未找到 Next Step
- nextUrl 已处理过（visitedUrls 中存在）
- nextUrl 解析失败

---

### 2.6 进入下一轮

```text
visitedUrls.push(currentUrl)
currentUrl = nextUrl
```

继续循环

---

## 关键约束

### 1. 不读取子链接内容

只提取 URL，不主动跳转解析（流程控制统一处理）

---

### 2. URL 拼接必须规范

禁止：

```text
...introduction.md/xxx
```

必须：

```text
BASE_URL + "/" + path + ".md"
```

---

### 3. 文件命名规则

```text
URL → 最后一段 + .md
```

---

### 4. 必须去重

防止循环引用导致死循环

---

## 职责划分

- 本流程：控制抓取与递归
- Prompt.md：只负责“单个文档的内容生成”

两者不能混用
