# 042｜Custom Build 配置 Schema：从 YAML 到内置函数

**翻页：**[上一页：EAS Custom Builds 入门](./041-Custom-Builds-入门.md) · [目录](./README.md) · [下一页：TypeScript Functions](./043-Custom-Build-TypeScript-Functions.md)

**官方页面：**[Custom build configuration schema](https://docs.expo.dev/custom-builds/schema/)

**版本边界：**这是一篇完整 schema reference，官方会随 EAS Build 服务更新。本文按当前官方页面归纳字段和函数，并重写具有代表性的用法；不要把某个函数参数当成永久不变的 SDK API。项目 Expo ~56.0.11 接入自定义函数时，要与项目实际 EAS CLI / 构建 profile 一起确认。

## 配置文件与顶层结构

Custom build YAML 位于项目根目录 .eas/build/，必须使用 .yml 或 .yaml 扩展名。文件可写两类顶层内容：

- build：一次构建的名称及执行步骤。
- functions：可复用的自定义函数定义。
- import：从其他 YAML 文件导入可复用函数；被导入文件不能再有 build 区块。

最少要有一个 step。run step 执行 shell 命令；内置 EAS functions 则封装 checkout、prebuild、Gradle、Fastlane 等完整或部分阶段：

```yaml
build:
  name: Install and test
  steps:
    - eas/checkout
    - eas/install_node_modules
    - run:
        name: Run test suite
        command: npm test
```

YAML 的缩进决定字段属于哪一个 build、step、function 或 input；数组前的短横线表示一个 step。

## run Step 的字段

| 字段 | 用途 |
| --- | --- |
| name | 在 build log 中显示的 step 名称。 |
| command | 必填，执行的单行 / 多行 shell 命令。 |
| working_directory | 本 step 切换到项目根目录下已有的相对目录。 |
| shell | 指定执行命令的 shell，例如 /bin/sh。 |
| inputs | 将 YAML 输入值插入该 step 的 command 表达式。 |
| outputs | 声明命令用 set-output 产生的值，供其他 step 读取。 |
| id | 为 step 命名，以便其他步骤重复调用或引用它的输出。 |

不同 step 的 shell 是独立进程。一个 step 中 export 的环境变量不会自动进入下一个 step；如需跨 step 传递，用 set-env。set-env 的值对后续 step 可见，但不会替当前进程设置本地变量：

```yaml
build:
  name: Share a value
  steps:
    - run:
        name: Produce step output
        id: create_value
        outputs: [message]
        command: |
          LOCAL_ONLY="this process only"
          export EXPORTED_ONLY="still this process only"
          set-env SHARED_TO_NEXT "available in later steps"
          set-output message "Hello from a previous step"
    - run:
        name: Read a step output
        inputs:
          message: ${ steps.create_value.message }
        working_directory: assets
        shell: /bin/sh
        command: echo "Message: ${ inputs.message }"
```

outputs 可用 required: false 表示可选；必需输出缺失时该函数 / step 会失败。命令可以用 shell 的多行语法。可以在 build.steps 中串行放置多个步骤。

## Reusable Function 自定义函数

自定义 function 适合重复调用的逻辑。每个函数用 command 写 shell 内容，或用 path 指向实现函数的 JS/TS 模块；二者至少要有一个。函数属性：

- name：build log 中显示的标题。
- inputs：数组字段；每项可设 name、required、type、default_value、allowed_values。支持 string、num、json；未声明 type 时按 string 校验。
- outputs：命名返回值；每个输出也可标记 required。
- shell：设定函数默认 shell。
- supported_platforms：限定 darwin 或 linux；默认支持全部平台。

下面定义可复用问候函数，并在 build 中传入名字。命令中的输入占位符在运行时替换：

```yaml
functions:
  greet:
    name: Say hello
    inputs:
      - name: person
        type: string
        default_value: Expo
        allowed_values: [Expo, React Native]
    outputs:
      - name: message
    command: |
      RESULT="Hello, ${ inputs.person }"
      echo "$RESULT"
      set-output message "$RESULT"

build:
  name: Reuse a function
  steps:
    - eas/checkout
    - greet:
        inputs:
          person: Expo
```

函数可重复调用并通过 id 区分输出；也可以把其他 YAML 配置 import 进来，集中维护公共函数。调用函数时能覆盖 working_directory、name 和 shell 三项：

```yaml
import:
  - common-functions.yml

build:
  name: Shared functions
  steps:
    - eas/checkout
    - list_files:
        name: List asset directory
        working_directory: assets
        shell: /bin/sh
```

## 内置 EAS Functions 概览

函数名前带 eas/ 的步骤由 Expo 提供，不需要在 functions 中重新定义。调用 eas/build 会根据 eas.json profile 选择完整的 Android / iOS 构建流程；如果要在中间插入逻辑，就自己按顺序编排其子步骤。

### 项目获取、依赖与缓存

| Function | 作用与主要配置 |
| --- | --- |
| eas/checkout | 取项目源码。可传 ref 为 branch、tag、完整 commit SHA；只支持 Git repository 来源，且要放在会自行 checkout 的 eas/build 之前。 |
| eas/use_npm_token | 读取 EAS secret 中的 NPM_TOKEN 并配置 .npmrc，访问私有 npm / registry package。 |
| eas/install_node_modules | 自动检测 Bun、npm、pnpm 或 Yarn 安装依赖；支持 monorepo。 |
| eas/restore_build_cache | 按 key 恢复指定 path 的缓存，可传 restore_keys 做前缀 fallback。表达式可用文件 hash 构造缓存键。 |
| eas/save_build_cache | 保存指定 path 到 key 对应的缓存，通常与 restore 配对以缩短构建。 |
| eas/resolve_build_config | 在依赖安装后解析并打印最终 build 配置；GitHub integration 构建时也会更新 job / metadata context。 |
| eas/get_credentials_for_build_triggered_by_github_integration | 已弃用，改用 eas/resolve_build_config。 |

### 生成并配置原生工程

| Function | 作用与主要配置 |
| --- | --- |
| eas/resolve_apple_team_id_from_credentials | 仅 iOS；根据凭据输出 apple_team_id，后续 prebuild 可引用。 |
| eas/prebuild | 运行项目的 expo prebuild；clean 可控制是否加 --clean，默认 false；使用 iOS 凭据时可传 apple_team_id。 |
| eas/configure_eas_update | 项目先配置好 EAS Update 后，用 runtime_version 与 channel 配置原生更新信息；缺省继承当前 build profile / app config 值。 |
| eas/inject_android_credentials | 仅 Android；将 keystore 注入构建环境和 Gradle 签名配置。 |
| eas/configure_ios_credentials | 仅 iOS；为 Xcode target 配置 provisioning profiles，可传 build_configuration 与 credentials。 |
| eas/configure_android_version | 仅 Android；写 remote app version management 的 version_code / version_name；省略时沿用 prebuild 后的原生值。 |
| eas/configure_ios_version | 仅 iOS；设置 build_number / app_version；省略时沿用 prebuild 后的原生值。 |

### 调用原生编译工具

| Function | 作用与主要配置 |
| --- | --- |
| eas/run_gradle | 仅 Android；运行 Gradle 构建。command 可覆盖默认选择，否则按 build config 自动解析。 |
| eas/generate_gymfile_from_template | 仅 iOS；生成 Fastlane Gymfile。可提供 credentials、scheme、build_configuration、clean、extra 和自定义 template。 |
| eas/run_fastlane | 仅 iOS；在 ios 目录基于 Gymfile 执行 fastlane gym。 |

### 产物与端到端测试

| Function | 作用与主要配置 |
| --- | --- |
| eas/find_and_upload_build_artifacts | 从标准目录与 buildArtifactPaths 自动搜集 application archive、附加产物和 Xcode 日志，并上传 EAS。 |
| eas/upload_artifact | 上传指定 path、glob 或多行路径；可给 artifact 命名、设 type / metadata / ignore_error。输出 artifact_id，之后可给 eas/download_artifact 使用。每种 artifact type 在一个 build job 只能上传一次；若自动扫描已上传同类产物，后续重复上传会失败。 |
| eas/download_artifact | 从先前步骤或 job 中取回已上传 artifact。 |
| eas/install_maestro | 安装 Maestro；可固定 maestro_version，否则使用最新版本。 |
| eas/start_android_emulator | 仅 Android build；可指定 device_name 和 system_image_package。当前启动 Android Emulator 要求项目使用旧 Build Infrastructure。 |
| eas/start_ios_simulator | 仅 iOS build；可选 device_identifier。可用 simulator 列表随 Xcode build image 改变，通常让 EAS 选择比硬编码 UDID 稳妥。 |
| eas/maestro_test | all-in-one 安装 / 准备模拟器并跑 flow；inputs 包括 flow_path、可选 app_path。Android Emulator 同样受旧 Infrastructure 限制；可把 .apk / .app 安装到目标模拟器，最后上传 Maestro test artifacts。 |

### Slack 与 PostHog

| Function | 作用与主要配置 |
| --- | --- |
| eas/send_slack_message | 发 plain message 或 Slack Block Kit payload。二者只能提供一个；slack_hook_url 可直接给值或从 secret 读取，默认也可用 SLACK_HOOK_URL。支持 always / success / failure 条件，以及构建 URL、Gradle / Fastlane 状态与错误表达式。 |
| eas/posthog_capture_event | 发送 analytics event，能附 properties；省略 distinct_id 时为匿名事件。项目 key 默认来自 eas integrations:posthog:connect 设置的环境变量。 |
| eas/posthog_flag_rollout | 按 flag key 设置 active、rollout_percentage 或 payload / variant；个人 API key 至少需 feature_flag:read 与 feature_flag:write。 |
| eas/posthog_wait_for_metric | 周期运行 HogQL 数值查询，直到 lt/lte/gt/gte/eq + threshold 成立或超时。没有 ignore_error，查询失败或超时会使 step 失败，并输出匹配 metric value。 |
| eas/posthog_wait_for_query | 周期查询，首行首列返回 true 或非零数时继续；无 ignore_error，失败或超时会使 step 失败。 |
| eas/posthog_annotation | 在 PostHog 项目时间轴添加标注，可设文字与 ISO 8601 date_marker。 |
| eas/posthog_upload_sourcemaps | 上传 JS source maps 以符号化 error stack；要在同一 job 先 export --source-maps，并在 bundle 与 source maps 仍位于磁盘时调用。 |

这些 PostHog functions 要先用 Expo 文档列出的连接流程关联 PostHog project。项目 key、个人 API token 及所需 scope 应作为 secret 管理；页面中可选的 ignore_error 只能忽略特定网络 / 返回错误，权限错误仍失败。

## 自己编排 Android / iOS Build

eas/build 是全流程封装。Android 有凭据时典型顺序为 checkout、安装依赖、prebuild、配置 Update、注入签名、Gradle、搜集产物；withoutCredentials 时省略注入签名。iOS Simulator / unsigned 流程会安装 Pods、生成 Gymfile、Fastlane 和上传产物；有签名时额外解析 Apple team、注入 provisioning profile。

以下用于查看步骤顺序，不是可以无条件复制的 production profile。具体 platform 配置由 eas.json 的 config 指向 .eas/build 中的文件：

```yaml
build:
  name: Android with signing
  steps:
    - eas/checkout
    - eas/install_node_modules
    - eas/prebuild
    - eas/configure_eas_update
    - eas/inject_android_credentials
    - eas/configure_android_version
    - eas/run_gradle:
        inputs:
          command: :app:bundleRelease
    - eas/find_and_upload_build_artifacts
```

同一 profile 也可分别指向 Android / iOS 配置。官方 schema 另展示 internal distribution + iOS simulator 组合，以及 production Android Play Store + iOS App Store 组合；自定义流程需保留各平台的证书、profile、Gradle / Fastlane 和 artifact 处理顺序。

## 代表性 Function 示例

### CI/测试与 Artifacts

```yaml
build:
  name: Build and test
  steps:
    - eas/build
    - eas/install_maestro:
        inputs:
          maestro_version: 1.35.0
    - eas/maestro_test:
        inputs:
          flow_path: |
            maestro/sign_in.yml
            maestro/create_post.yml
    - eas/upload_artifact:
        name: Maestro report
        inputs:
          type: build-artifact
          path: artifacts/*.xml
```

若要自选 Android system image 或 iOS Simulator，可以显式插入 start_android_emulator / start_ios_simulator，安装 .apk / .app 并执行 maestro test。Android 示例可用 sdkmanager --list 查可用镜像；EAS VM 使用 x86_64，因此选 x86_64 package。

### Slack 通知

slack_hook_url 应从 EAS secret/environment variables 读取，不要把真实 webhook 写入 YAML。下面只显示参数结构：

```yaml
build:
  name: Build with Slack notification
  steps:
    - eas/build
    - eas/send_slack_message:
        if: ${ always() }
        inputs:
          message: |
            Build result: ${ steps.run_gradle.status_text }
            Build link: ${ eas.job.expoBuildUrl }
```

也可以用 success() / failure() 区分成功与失败通知，或用 payload 描述 Section、Divider、Image、Action Button 等 Slack Block Kit 元素。

### PostHog 事件、门槛与 source maps

PostHog 支持构建事件、feature flag rollout、等待指标 / 查询通过、标记 release 和上传 source map。下面列出几个调用主题；实际 key、scope 和 project id 使用 secret 与环境变量：

```yaml
build:
  name: Build and report
  steps:
    - eas/build
    - eas/posthog_capture_event:
        inputs:
          event: store_build_finished
          properties:
            platform: ios
            profile: production
    - eas/posthog_flag_rollout:
        inputs:
          flag: new-checkout
          rollout_percentage: 25
    - eas/posthog_wait_for_metric:
        inputs:
          query: SELECT count() FROM events WHERE event = '$exception'
          operator: lt
          threshold: 10
    - eas/posthog_annotation:
        inputs:
          content: Published a production build
```

等指标可使用 interval_seconds / timeout_seconds；HogQL query 版本则等待结果为 true 或非零数字。upload_sourcemaps 应在导出 bundle 后，在同一 job 传入 dist 等 source-map 目录。

## 官方代码主题覆盖

源页是一篇长配置参考；所有代码主题按类型整理在本页：顶层 build/name/steps；run 的单步、多步、shell、working_directory、inputs、outputs/required、id、跨步骤 set-env；可复用 function 的输入/输出/command/path/shell/platform 与 import；eas/build 的 Android/iOS 内部步骤和限制；Maestro、checkout ref、私有 npm token、依赖、缓存、配置解析、prebuild、credentials、版本、Gradle、Gymfile、Fastlane、artifact、emulator、simulator、Slack、PostHog 例子；按 platform 自定义 development / production profile；复用函数与覆盖 name / shell / working_directory。数百行函数配置示例已按行为归并重写，没有逐字搬运官方长页。

## 下一页

官方页脚 **Next** 是 [TypeScript functions](https://docs.expo.dev/custom-builds/functions/)，从 YAML shell 函数进一步讲如何编译和调用自定义 JavaScript / TypeScript 模块。

**翻页：**[上一页：EAS Custom Builds 入门](./041-Custom-Builds-入门.md) · [返回目录](./README.md) · [下一页：TypeScript Functions](./043-Custom-Build-TypeScript-Functions.md)
