import type { Href } from "expo-router";

export const ROUTES = {
	home: "/",
	signIn: "/sign-in",
	createAccount: "/create-account",
	linking: "/linking",
	settingsPermissions: "/settings/permissions",
	feed: "/feed",
	stackPage: "/stack-page",
	drawerPage: "/drawer-page",
} as const satisfies Record<string, Href>;

export function feedPostPath(postId: string | number): Href {
	return `/feed/${postId}` as Href;
}
