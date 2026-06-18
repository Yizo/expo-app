# 应用商店素材（Store Assets）

> 原文地址：https://docs.expo.dev/guides/store-assets/

在将应用提交到应用商店（Google Play、Apple App Store）之前，你需要准备一系列视觉素材来展示应用的用户体验。这些素材包括应用截图、应用图标、宣传横幅等。本指南将帮助你了解如何设计和准备这些素材。

---

## 关于"应用截图"的常见误区

虽然通常称之为"应用截图"，但这些视觉素材**并不一定**需要是从设备上直接截取的真实屏幕截图。你可以使用 Figma 等设计工具，将真实截图与宣传文字、品牌元素进行组合设计，只要最终产物符合各平台规定的尺寸要求即可。

> **基于文档内容推导**：这意味着你可以充分发挥创意，不必局限于直接使用模拟器或真机截图。许多成功的应用在商店展示中都使用了经过设计的合成图片。

---

## 三种设计策略

文档介绍了三种生成商店视觉素材的方法，从简单到复杂依次为：

### 1. 真实截图（Literal Captures）

直接从设备上截取应用界面。

- **优点**：高度还原真实体验，操作简单
- **缺点**：需要多台不同尺寸的物理设备来截取各平台要求的截图
- **参考案例**：Expo Go 应用的商店截图采用了这种方式

### 2. 嵌入式截图（Embedded Captures）

将真实截图嵌入到更广泛的设计中，并添加额外的宣传文字和说明。

- **优点**：可以在截图中加入营销信息、功能说明等额外内容
- **缺点**：需要使用设计软件（如 Figma）
- **参考案例**：Brex 应用的商店截图采用了这种方式

### 3. 高度风格化（Highly Stylized）

将界面元素与创意品牌设计深度整合。

- **优点**：产出效果有趣且富有品牌特色
- **缺点**：需要专业的设计技能
- **参考案例**：Microsoft Office 应用的商店截图采用了这种方式

> **基于经验建议**：如果你是独立开发者且没有设计背景，建议从"嵌入式截图"方式入手。使用 Figma（免费）搭配简单的文字标注，就能产出专业感较强的商店素材。

---

## Google Play 商店规格要求

Android 应用商店对视觉素材有明确的尺寸和格式要求。你可以参考 [Google Play 官方指南](https://support.google.com/googleplay/android-developer/answer/9866151) 或使用社区提供的 [Figma 设计模板](https://www.figma.com/community/file/1352686667495694112)。

### 必须提交的素材

| 素材类型 | 数量要求 | 尺寸/格式 | 说明 |
|---------|---------|----------|------|
| **应用图标** | 1 个 | 512×512 像素，32 位 PNG（支持透明度），最大 1MB | 与 iOS 不同，Google Play 需要**单独上传**应用图标，不会从编译后的应用中自动提取 |
| **宣传横幅** | 1 个 | 1024×500 像素，JPEG 或 24 位 PNG（无透明度） | 用于商店顶部的特色展示 |
| **应用截图** | 4～10 张 | 最小 1024×500 像素，最大宽度 3840 像素，9:16 比例，JPEG 或 24 位 PNG（无透明度） | 至少需要 4 张截图 |

### 可选素材

- **宣传视频**：可以通过 YouTube URL 链接提供一个宣传视频

> **注意**：Google Play 要求应用图标必须单独上传，这与 iOS 直接从编译后的二进制文件中提取图标的方式不同。请确保你的图标文件满足上述规格。

---

## Apple App Store 规格要求

Apple 对图片和视频的尺寸要求**极其严格**——即使只偏差一个像素，也会导致提交被拒绝。请务必仔细核对 [Apple 截图规格官方文档](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/) 和 [Apple 预览视频规格](https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications/)，或使用社区提供的 [Figma 设计模板](https://www.figma.com/community/file/1352686667495694112)。

### iPhone 截图要求

| 项目 | 说明 |
|------|------|
| **必须提供** | 6.9 英寸机型（带顶部药丸形刘海）的截图 |
| **数量** | 每种语言 2～10 张 |
| **尺寸** | 1320×2868 或 1290×2796 像素 |
| **格式** | JPG 或 PNG（无透明度） |
| **方向** | 纵向或横向均可 |

> **关于尺寸缩放的说明**：如果你没有为某些可选尺寸提供截图，Apple 会自动从最接近的已上传尺寸进行缩小处理。文档原文指出："If specific screenshots are not provided, scaled down screenshots from the closest uploaded size will be used instead."

### iPad 截图要求

| 项目 | 说明 |
|------|------|
| **必须提供** | 13 英寸机型的截图（如果你的应用支持 iPad） |
| **数量** | 每种语言 2～10 张 |
| **尺寸** | 2064×2752 或 2048×2732 像素 |
| **格式** | JPG 或 PNG（无透明度） |

### 预览视频（可选）

- 每种尺寸最多可提供 **3 个**预览视频
- 视频用于展示应用的实际功能
- 具体规格请参阅 [Apple 预览视频规格文档](https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications/)

---

## 最低要求汇总

为了方便快速查阅，以下将两个平台的最低要求进行了汇总对比：

### Android（Google Play）

| 素材 | 最低要求 |
|------|---------|
| 图标 | 1 个，512×512，32 位 PNG（含透明度），≤1MB |
| 横幅 | 1 个，1024×500，JPEG 或 24 位 PNG（无透明度） |
| 截图 | 4～10 张，最小 1024×500，最大宽度 3840px，9:16 比例，JPEG 或 24 位 PNG（无透明度） |

### iOS - iPhone

| 素材 | 最低要求 |
|------|---------|
| 截图 | 2～10 张，适用于带药丸形刘海的机型，1320×2868 或 1290×2796，JPG 或 PNG（无透明度） |

### iOS - iPad

| 素材 | 最低要求 |
|------|---------|
| 截图 | 2～10 张，2064×2752 或 2048×2732，JPG 或 PNG（无透明度） |

---

## 实用资源链接

| 资源 | 链接 |
|------|------|
| Google Play 商店素材官方指南 | https://support.google.com/googleplay/android-developer/answer/9866151 |
| Apple 截图规格官方文档 | https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/ |
| Apple 预览视频规格 | https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications/ |
| 社区 Figma 设计模板 | https://www.figma.com/community/file/1352686667495694112 |

> **基于经验建议**：社区 Figma 模板是一个非常实用的起点。你可以直接复制模板，替换其中的截图和文字内容，即可快速生成符合规格要求的商店素材，省去手动计算像素尺寸的麻烦。

---

## 关键注意事项

1. **像素精度至关重要**：Apple 对截图尺寸的审核极其严格，偏差一个像素就会被拒绝。在导出图片时，请务必确认尺寸完全匹配。

2. **Google Play 需单独上传图标**：不要假设 Google Play 会自动从你的应用中提取图标——你需要准备一个独立的 512×512 PNG 图标文件。

3. **格式限制**：两个平台对 PNG 的位深度有不同要求——Google Play 的截图要求 24 位 PNG（**无透明度**），而图标则要求 32 位 PNG（**含透明度**）。请注意区分。

4. **截图不等于真实截屏**：你完全可以使用设计工具来制作更具吸引力的商店展示图，不必局限于原始截图。

5. **视频是可选的**：两个平台都支持宣传视频/预览视频，但都不是必须的。如果时间和资源有限，优先保证截图质量。

---

## 文档导航

- **上一页**：[editing richtext](./158__editing-richtext.md)
- **下一页**：[local first](./160__local-first.md)
