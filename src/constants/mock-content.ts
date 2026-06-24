export type FeedPost = {
	accentLabel: string;
	bullets: string[];
	category: string;
	excerpt: string;
	id: string;
	note: string;
	readTime: string;
	title: string;
};

export const feedPosts: FeedPost[] = [
	{
		id: "123",
		category: "文章",
		accentLabel: "简洁",
		title: "更克制的页面层级",
		excerpt: "保留结构，减少说明和装饰。",
		readTime: "2 分钟",
		note: "首页与设置",
		bullets: ["减少大段说明", "保留主要操作", "统一留白和卡片"],
	},
	{
		id: "207",
		category: "导航",
		accentLabel: "系统感",
		title: "更简单的导航与信息块",
		excerpt: "减少模块数量，让页面更直接。",
		readTime: "2 分钟",
		note: "Feed 与详情",
		bullets: ["减少首屏内容", "突出标题和操作", "列表保持轻量"],
	},
	{
		id: "318",
		category: "账号",
		accentLabel: "表单",
		title: "登录页只保留必要信息",
		excerpt: "标题、输入框、按钮，别加太多解释。",
		readTime: "1 分钟",
		note: "登录与注册",
		bullets: ["保留基本字段", "减少口号文案", "按钮层级更清楚"],
	},
];

export function getFeedPost(postId: string | string[] | undefined) {
	const id = Array.isArray(postId) ? postId[0] : postId;

	return feedPosts.find((post) => post.id === id) ?? feedPosts[0];
}
