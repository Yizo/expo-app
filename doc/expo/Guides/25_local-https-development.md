# Using local HTTPS development 学习整理

## 文档解决的问题

这篇文档解决的是：如何让 Expo Web 在本地开发时跑在 HTTPS 上，以便测试依赖安全上下文的浏览器 API。

对 React Web 开发者来说，这很像给本地 `localhost` 开发环境补一个受信任证书和 HTTPS 代理层。

## 适用场景

- 你要测试只在安全上下文可用的 Web API。
- 你要验证基于 HTTPS 的认证流程，例如 HTTP-Only Cookies。
- 你希望本地环境更接近生产环境。
- 团队成员需要统一的本地 HTTPS 访问方式。

## 核心概念

### 为什么本地 HTTPS 有必要

文档给出的收益有四个：

- 团队可扩展性：同一套方案适用于所有人
- 认证支持：支持 HTTP-Only Cookies 和 secure contexts
- 生产一致性：更接近线上 HTTPS 环境
- 易于共享：团队能使用统一开发 URL

### `mkcert` 的作用

`mkcert` 是生成本地开发证书的工具。它不是 Expo 专属工具，而是本地 HTTPS 环境里的证书基础设施。

### `local-ssl-proxy` 的作用

它负责把：

- 443 端口的 HTTPS 流量

转发到：

- Expo 开发服务器默认的 8081 端口

所以实际架构是：

`https://localhost:443` -> `http://localhost:8081`

## 关键流程

### 1. 准备项目

文档给出了创建示例项目和进入现有项目的示例命令。可以理解为：你可以新建项目，也可以直接在已有 Expo 项目中操作。

### 2. 启动 Expo Web 开发服务器

```sh
npx expo start --web
```

文档说明它会跑在：

- `http://localhost:8081`

并要求你保持这个终端窗口继续运行。

### 3. 用 `mkcert` 生成 localhost 证书

```sh
mkcert localhost
```

文档还特别提示：

```sh
mkcert -install
```

要先安装本地 CA。

生成的文件是：

- `localhost.pem`
- `localhost-key.pem`

位置在项目根目录。

### 4. 启动本地 HTTPS 代理

```sh
npx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem
```

这一步把 HTTPS 请求代理给 Expo 的 HTTP 开发服务器。

### 5. 在浏览器访问 HTTPS 地址

访问：

- `https://localhost`

此时你的 Expo Web 应用就能通过 HTTPS 打开。

## 命令、配置、文件说明

### 命令

```sh
npx expo start --web
mkcert -install
mkcert localhost
npx local-ssl-proxy --source 443 --target 8081 --cert localhost.pem --key localhost-key.pem
```

### 生成的文件

- `localhost.pem`：证书文件
- `localhost-key.pem`：私钥文件

## 注意事项、限制条件与坑点

- 你需要先安装 `mkcert`，否则无法生成本地证书。
- 文档明确要求 `mkcert -install` 安装本地 CA，这是很多人容易漏掉的一步。
- 需要至少两个终端窗口：一个跑 Expo dev server，一个跑 HTTPS 代理。
- Expo dev server 仍然跑在 `http://localhost:8081`，HTTPS 只是通过代理额外提供。
- 证书文件会出现在项目根目录，需要注意本地文件管理。

## React Web 开发者最容易误解的点

- **误解 1：`expo start --web` 自带 HTTPS。**
  本文正是在说明它默认不是，需要额外搭代理。
- **误解 2：本地 HTTPS 只和“浏览器地址栏更安全”有关。**
  实际上它直接决定某些浏览器 API 是否可用。
- **误解 3：只生成证书就够了。**
  还必须有代理把 HTTPS 入口转发到 Expo 开发服务器。

## 实际开发建议

- 基于经验建议：把 `mkcert -install` 和证书生成步骤写进团队 onboarding 文档，减少新成员踩坑。
- 基于文档内容推导：遇到“线上正常、本地安全 API 不可用”的问题时，优先检查是不是仍在用 `http://localhost:8081` 而不是 `https://localhost`。
- 基于文档内容推导：如果团队经常调试认证、Cookie 或浏览器权限能力，本地 HTTPS 应成为标准开发环境的一部分。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 本地 HTTPS 适合测试 secure browser APIs
- 需要安装 `mkcert`
- Expo Web 开发服务器默认运行在 `http://localhost:8081`
- 用 `local-ssl-proxy` 把 443 转发到 8081
- 最终通过 `https://localhost` 访问

### 基于文档内容推导

- 这套方案的目标不是替换 Expo dev server，而是在其前面补一个 HTTPS 入口。
- 本地 HTTPS 的复杂度主要不在 Expo，而在证书信任与代理转发。
- 对需要模拟生产认证环境的项目，这比单纯跑本地 HTTP 更可靠。

## 当前文档未涉及

- 证书文件是否应加入 `.gitignore`
- 自定义域名、本地域名映射方案
- 反向代理工具的其他替代方案
