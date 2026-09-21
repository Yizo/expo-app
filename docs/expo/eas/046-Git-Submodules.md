# 046｜EAS Build 初始化 Git Submodules

**翻页：**[上一页：EAS Build 使用私有 npm Packages](./045-Using-Private-NPM-Packages.md) · [目录](./README.md) · [下一页：Yarn 1 Classic npm Cache](./047-Yarn-Classic-Cache.md)

**官方页面：**[Using Git submodules](https://docs.expo.dev/build-reference/git-submodules/)

**版本边界：**本页是 EAS Build 将源码上传到云端时的 Git submodule 处理说明，和 Expo SDK 版本无关。示例会准备 SSH key 并执行 git submodule update，但这里只记录官方配置方式；没有创建密钥、访问 GitHub 或运行 Git 命令。

## EAS 默认会怎样处理 Submodule

使用 EAS 默认的 Version Control System workflow 时，项目工作目录内容会原样上传到 builder，包含已经检出的 submodule 内容。

如果通过 CI 构建、在 eas.json 中启用 cli.requireCommit，或 submodule 仓库是私有的，则需要在构建机上初始化 submodule；否则上传内容可能只包含空目录。私有 submodule 需要有读取权限的 SSH key。

## 安全准备 SSH Key

先准备只对所需 submodule repository 有读取权限的私钥，将它编码为 Base64 并存成 Expo EAS Secret 环境变量 SSH_KEY_BASE64。Secret 仅用于构建时恢复文件，不要把原始私钥或解码后的文件提交到仓库。

根目录 package.json 的 eas-build-pre-install script 指向项目中的初始化脚本：

```json
{
  "scripts": {
    "eas-build-pre-install": "./eas-build-pre-install.sh"
  }
}
```

## 在构建机创建 SSH 配置并检出

官方 shell hook 的步骤是建立 ~/.ssh、用受限权限解码私钥、从私钥推导 public key、写入 Git host known_hosts，再初始化 submodule：

```sh
#!/usr/bin/env bash

mkdir -p ~/.ssh

# 若 .gitmodules 使用相对 URL，打包流程可能丢掉真实 origin。
# 这种情况下要先恢复远端地址：
# git remote set-url origin git@github.com:example/repo.git

umask 0177
echo "$SSH_KEY_BASE64" | base64 -d > ~/.ssh/id_rsa
umask 0022

ssh-keygen -y -f ~/.ssh/id_rsa > ~/.ssh/id_rsa.pub
ssh-keyscan github.com >> ~/.ssh/known_hosts

git submodule update --init
```

umask 0177 让私钥文件默认只可由当前用户访问；ssh-keyscan 先登记 host key 以供 SSH 校验。仅当 .gitmodules 用相对 URL 且上传打包没有保留 origin 时，才需要把 origin 改回真实 URL。上面的 example/repo.git 是占位路径。

## 关键名词

- **Git Submodule：**主仓库在固定 commit 上引用的另一个 Git repository。
- **.gitmodules：**记录 submodule path 和 URL 的配置文件。
- **SSH Private Key：**用于证明构建环境有权读取私有 Git repository 的身份凭据。
- **SSH Public Key：**私钥对应的公钥；ssh-keygen -y 可从私钥导出。
- **Host Key：**Git 服务器的主机身份，SSH 会根据 known_hosts 校验连接目标。
- **eas-build-pre-install：**EAS Build 安装 npm dependencies 前触发的生命周期脚本。

## 官方代码主题覆盖

源页的所有 code / configuration themes 均覆盖：Base64 SSH private key 存 EAS Secret；package.json hook 调用 shell 脚本；umask 保护文件；从 SSH_KEY_BASE64 解码私钥；恢复相对 submodule URL 所需的 origin；导出公钥、登记 GitHub host key；最后运行 git submodule update --init。示例命令没有执行。

## 下一页

官方页脚 **Next** 是 [Using npm cache with Yarn 1 (Classic)](https://docs.expo.dev/build-reference/yarn-cache/)，说明如何让 EAS Build 缓存 Yarn 1 的依赖安装结果。

**翻页：**[上一页：EAS Build 使用私有 npm Packages](./045-Using-Private-NPM-Packages.md) · [返回目录](./README.md) · [下一页：Yarn 1 Classic npm Cache](./047-Yarn-Classic-Cache.md)
