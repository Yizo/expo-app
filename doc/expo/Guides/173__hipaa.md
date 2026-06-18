# HIPAA 合规与 Expo

> 原文地址：[https://docs.expo.dev/regulatory-compliance/hipaa/](https://docs.expo.dev/regulatory-compliance/hipaa/)

---

## 什么是 HIPAA？

HIPAA（Health Insurance Portability and Accountability Act，健康保险可携性与责任法案）是美国的一项联邦法律，旨在保护患者的个人健康信息（PHI，Protected Health Information）不被未经授权的披露或滥用。

如果你的应用涉及处理、存储或传输用户的个人健康数据，那么你的应用就需要遵守 HIPAA 的相关规定。

（基于文档内容推导）

---

## 使用 Expo 构建的应用能否满足 HIPAA 合规？

**可以！只要你遵循相关要求，就可以使用 Expo 构建符合 HIPAA 标准的应用。**

这是 Expo 官方文档给出的明确回答。Expo 框架本身并不会引入 HIPAA 合规方面的问题。

---

## Expo 本身收集哪些数据？

Expo **不会收集任何可单独识别身份的健康数据**（individually identifiable health data）。

你可以访问 Expo 的 [隐私说明页面](https://expo.dev/privacy-explained) 查看 Expo 所收集的全部数据类型。

> **要点**：Expo 框架层面的数据收集不涉及个人健康信息，因此框架本身不会成为 HIPAA 合规的障碍。

---

## 合规的最终责任在谁？

虽然 Expo 框架本身不存在合规问题，但 **你作为应用开发者，对从用户那里收集的数据拥有最终控制权**。

这意味着：

- **Expo 无法保证** 所有基于 Expo 构建的应用都自动满足 HIPAA 合规要求
- **合规的最终责任** 在于你——作为独立应用开发者
- 你需要自行确保应用中的数据收集、存储和传输流程符合 HIPAA 的要求

（基于文档内容推导）

---

## 使用 Expo 是否存在合规风险？

根据文档的说明，**使用 Expo 本身不应该产生合规问题**。

换句话说：

- Expo 框架的设计不会主动违反 HIPAA 规定
- 合规与否取决于你如何在应用中实现数据相关功能
- 框架是中立的工具，关键在于你如何使用它

---

## 更多资源

如需了解有关 HIPAA 合规的更多信息，可以参考以下官方资源：

| 资源 | 说明 | 链接 |
|------|------|------|
| HHS 官方网站 | 美国卫生与公众服务部（HHS）提供的 HIPAA 专业人员指南 | [https://www.hhs.gov/hipaa/for-professionals/index.html](https://www.hhs.gov/hipaa/for-professionals/index.html) |
| Expo 隐私说明 | Expo 收集的所有数据类型详情 | [https://expo.dev/privacy-explained](https://expo.dev/privacy-explained) |

---

## 总结

| 关键点 | 说明 |
|--------|------|
| Expo 能否用于 HIPAA 合规应用？ | 可以，只要遵循相关要求 |
| Expo 是否收集健康数据？ | 不收集可单独识别身份的健康数据 |
| 合规责任归属 | 应用开发者（你）承担最终责任 |
| 使用 Expo 是否有合规风险？ | 框架本身不应产生合规问题 |

（基于经验建议）对于需要 HIPAA 合规的项目，除了关注前端框架层面的数据安全外，还应重点关注后端服务、数据库加密、访问控制、审计日志、数据传输加密（TLS）等方面的合规性。Expo 文档此页面主要聚焦于框架层面，实际项目中的 HIPAA 合规是一个更广泛的系统工程。

---

## 文档导航

- **上一页**：[gdpr](./172__gdpr.md)
- **下一页**：无
