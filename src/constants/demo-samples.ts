import type { Href } from "expo-router";

export type DemoSample = {
	id: string;
	title: string;
	description: string;
	href: Href;
};

/** 在此登记二级样例，并在 demo/_layout 与 app/views 中补齐对应页面。 */
export const DEMO_SAMPLES: DemoSample[] = [];
