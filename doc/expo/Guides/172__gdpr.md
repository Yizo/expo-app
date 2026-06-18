# GDPR 合规与 Expo

> 原文地址：[https://docs.expo.dev/regulatory-compliance/gdpr/](https://docs.expo.dev/regulatory-compliance/gdpr/)
>
> 最后更新时间：2023 年 10 月 6 日

---

## 概述

本文档介绍如何使用 Expo 框架构建符合欧盟《通用数据保护条例》（GDPR）要求的应用程序。GDPR 是欧盟针对数据隐私保护制定的核心法规，适用于所有处理欧盟用户数据的应用和服务。

如果你的应用面向欧盟用户，或者会收集、处理来自欧盟地区用户的个人数据，那么你需要确保应用符合 GDPR 的相关规定。

---

## 使用 Expo 构建的应用能否符合 GDPR？

**答案是：可以！**

你可以使用 Expo 构建符合 GDPR 要求的应用，前提是你需要遵守相关的法规要求。

Expo 平台本身会正确地管理和处理开发者与用户的数据。但需要注意的是，Expo 官方明确指出：

> **我们无法保证使用 Expo 开发应用的开发者自身也会遵循相同的数据隐私实践。**

这意味着：

- **Expo 平台层面**：Expo 会妥善处理其自身服务所涉及的数据（例如 Expo 云服务、EAS 构建服务等）。
- **开发者层面**：你作为开发者，需要自行确保你的应用在数据收集、存储、传输和处理等环节符合 GDPR 的要求。

（基于文档内容推导）换言之，GDPR 合规的责任分为两部分——Expo 负责其平台侧的数据处理合规，而你负责你的应用逻辑和数据处理合规。

---

## 开发者需要注意的事项

虽然本文档内容较为简短，但以下几个关键要点值得重视：

1. **Expo 工具本身不会阻碍你的应用实现 GDPR 合规**——框架层面不存在已知的合规障碍。

2. **合规的主体责任在开发者**——你需要自行审查应用中涉及用户数据的所有环节，确保它们满足 GDPR 的要求。

3. **了解 GDPR 的具体规定**——如需深入了解 GDPR 的详细条款和要求，建议访问欧盟委员会的官方数据保护页面：
   - [欧盟委员会数据保护页面](https://ec.europa.eu/info/law/law-topic/data-protection_en)

---

## 延伸阅读

Expo 文档中与此主题相关的其他合规指南：

- [数据与隐私保护](https://docs.expo.dev/regulatory-compliance/data-and-privacy-protection/)：了解 Expo 如何管理和保护数据的一般性说明。
- [HIPAA 合规](https://docs.expo.dev/regulatory-compliance/hipaa/)：如果你的应用涉及美国医疗健康数据，需要关注 HIPAA 相关要求。

---

## 文档导航

- **上一页**：[data and privacy protection](./171__data-and-privacy-protection.md)
- **下一页**：[hipaa](./173__hipaa.md)
