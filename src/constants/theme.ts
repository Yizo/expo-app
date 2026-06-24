/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/styles/global.css";

import { Platform } from "react-native";

export const Colors = {
	light: {
		/** 主文本色：用于页面标题、正文和高优先级信息 */
		text: "#101828",
		/** 页面背景色：用于整页背景和大面积底色 */
		background: "#F6F7FB",
		/** 基础表面色：用于卡片、弹层、输入框等主要容器 */
		surface: "#FFFFFF",
		/** 弱化表面色：用于次级卡片、输入区底色和轻量分组 */
		surfaceMuted: "#F8FAFC",
		/** 强调表面色：用于分隔块、禁用态或需要层次对比的区域 */
		surfaceStrong: "#EAECF0",
		/** 元素背景色：用于按钮、标签等独立小组件的底色 */
		backgroundElement: "#FFFFFF",
		/** 选中背景色：用于列表选中态、按下态或高亮块 */
		backgroundSelected: "#EAECF0",
		/** 边框色：用于输入框、卡片、分割线等描边 */
		border: "#EAECF0",
		/** 次文本色：用于说明文案、辅助信息和占位内容 */
		textSecondary: "#475467",
		/** 品牌强调色：用于主按钮、重要链接和关键交互 */
		accent: "#101828",
		/** 强强调色：用于需要更重视觉权重的强调区域 */
		accentStrong: "#111827",
		/** 弱强调底色：用于强调区块的浅色背景或状态承载 */
		accentSoft: "#F2F4F7",
		/** 强调色反差文本：用于深色强调背景上的文字或图标 */
		accentContrast: "#FFFFFF",
		/** 中性暖灰色：用于装饰信息、弱图标或低优先级文本 */
		warm: "#98A2B3",
		/** 成功色：用于成功反馈、完成态和正向状态提示 */
		success: "#2E8B57",
		/** 危险色：用于错误、删除、警告和风险操作提示 */
		danger: "#B42318",
		/** 遮罩色：用于弹窗蒙层、浮层背板和内容压暗效果 */
		overlay: "rgba(0, 0, 0, 0.36)",
	},
	dark: {
		text: "#FFFFFF",
		background: "#0B0F14",
		surface: "#111827",
		surfaceMuted: "#1F2937",
		surfaceStrong: "#344054",
		backgroundElement: "#111827",
		backgroundSelected: "#1F2937",
		border: "#344054",
		textSecondary: "#D0D5DD",
		accent: "#101828",
		accentStrong: "#111827",
		accentSoft: "#1F2937",
		accentContrast: "#FFFFFF",
		warm: "#98A2B3",
		success: "#30D158",
		danger: "#FF453A",
		overlay: "rgba(0, 0, 0, 0.42)",
	},
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type AppTheme = (typeof Colors)["light"];

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "var(--font-display)",
		serif: "var(--font-serif)",
		rounded: "var(--font-rounded)",
		mono: "var(--font-mono)",
	},
});

/**
 * 统一管理应用字号 token。
 * 命名优先表达语义层级，避免在页面中直接写 `12`、`14`、`16` 这类硬编码字号。
 * 页面样式应优先引用这里的常量，便于后续整体调整文字层级与阅读节奏。
 */
export const FontSizes = {
	/** 说明级小字：用于角标、辅助标签、状态 pill 文案 */
	caption: 12,
	/** 脚注级：用于补充说明、次级提示和短注释 */
	footnote: 13,
	/** 小正文：用于描述文案、表单辅助信息和摘要 */
	bodySm: 14,
	/** 标准正文：用于主要段落、卡片正文和常规阅读内容 */
	body: 15,
	/** 强调正文：用于输入内容、按钮标题和更清晰的短文案 */
	callout: 16,
	/** 小标题：用于列表项标题、区块内重点文案 */
	subheading: 17,
	/** 标题：用于普通卡片标题和列表分组标题 */
	title: 18,
	/** 加大标题：用于需要更强识别度的次级页面标题 */
	titleLg: 20,
	/** 区块主标题：用于页面分区标题和重点模块标题 */
	headline: 22,
	/** 页面标题：用于登录、注册等独立页面主标题 */
	display: 24,
	/** 强视觉标题：用于弹层或欢迎区的大标题 */
	hero: 26,
	/** 超大标题：用于空状态、异常页等高识别场景 */
	splash: 28,
	/** 首页头图级标题：用于最强视觉层级的 Banner 标题 */
	jumbo: 30,
} as const;

export const Spacing = {
	half: 2,
	one: 4,
	two: 8,
	three: 16,
	four: 24,
	five: 32,
	six: 64,
} as const;

export const Radii = {
	sm: 14,
	md: 22,
	lg: 30,
	pill: 999,
} as const;

export const Shadows = {
	soft: "0 10px 24px rgba(15, 23, 42, 0.06)",
	card: "0 16px 36px rgba(15, 23, 42, 0.1)",
} as const;

export const MaxContentWidth = 960;
