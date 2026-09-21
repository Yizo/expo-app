# 062｜用 .easignore 控制 EAS Build 上传文件

**翻页：**[上一页：EAS Build 使用 iOS App Extensions](./061-iOS-App-Extensions.md) · [目录](./README.md) · [下一页：npx testflight](./063-NPX-TestFlight.md)

**官方页面：**[Ignore files via .easignore](https://docs.expo.dev/build-reference/easignore/)

**版本边界：**本页说明 EAS CLI 如何筛选上传给远端 builder 的源码 archive。它不影响 Expo SDK API，但会影响哪些文件可在云构建时读取。不要遗漏必须构建的 native project / assets，也不要意外包含密钥。

## 忽略文件规则

默认情况下，EAS CLI 读取项目 .gitignore 来判断哪些文件不上传。若项目创建了 .easignore，EAS CLI 会改用它，而不是自动把 .gitignore 规则再合并进来。

所以创建 .easignore 时，先把 .gitignore 中已有规则完整复制进去，再追加只与远端构建相关的忽略项。这样既保持原有敏感文件排除，又能减少无关 docs / test coverage 对上传大小的影响。

示例结构：

```gitignore
# Keep all rules copied from .gitignore above this section.

# Files unnecessary for a build
/docs
/coverage

# For CNG apps, native folders are generated during prebuild.
/android
/ios
```

仅当项目采用 CNG、由 Prebuild 生成 android / ios 文件夹时，才把 native directories 加入忽略清单。若项目手动维护原生目录，不能照抄这两条。

## 创建后检查 Build

将 .easignore 放在项目根目录。确认保留了所有构建所需的 JS 源码、config plugin、锁文件与必要资源，再启动一次 EAS Build：

```sh
eas build --platform ios --profile development
```

这个命令只用于文档演示，没有运行。若云构建报 Metro 无法解析模块，检查相应文件有没有被 .easignore 排除。

## 上传未纳入 Source Control 的临时文件

有时 hook 会在构建前生成临时文件，文件没有 commit、同时又受忽略规则影响。这种场景可在 .easignore 末尾加 ! 前缀重新包含：

```gitignore
/android
/ios

# Re-include a generated file required during build
!temp_file.json
```

感叹号规则要放在冲突忽略规则之后，才能重新包括文件。优先把生成流程和秘密值管理设计清楚；不要用 re-include 规则把 private key / token 打进公开 App archive。

## 关键名词

- **.gitignore：**Git 版本控制中忽略文件的规则。
- **.easignore：**EAS 项目上传 archive 的过滤规则；存在时优先于 .gitignore。
- **Archive / tarball：**EAS CLI 打包并上传到 builder 的源码文件集合。
- **CNG：**云构建阶段根据 app config 生成 android / ios 原生目录；因此项目源码仓库可以不带已生成的 native directories。
- **重新包含规则：**以 ! 开始的 ignore 行可重新 включ入被其他规则排除的文件。

## 官方代码主题覆盖

源页全部 code/config topics 均有示例：复制 .gitignore 内容到 .easignore；增加 docs / coverage / CNG native folder 忽略规则；运行 EAS Build 检查上传；用末尾的 !temp_file.json 重新包含非 Git 文件。示例均未执行。

## 下一页

官方页脚 **Next** 是 [npx testflight command](https://docs.expo.dev/build-reference/npx-testflight/)，介绍单条交互式命令如何组合 EAS Build、签名和 TestFlight 提交。

**翻页：**[上一页：EAS Build 使用 iOS App Extensions](./061-iOS-App-Extensions.md) · [返回目录](./README.md) · [下一页：npx testflight](./063-NPX-TestFlight.md)
