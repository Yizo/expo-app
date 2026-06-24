import type { Href } from "expo-router";

export const ROUTES = {
	home: "/",
	authSheet: "/auth-sheet",
	signIn: "/sign-in",
	createAccount: "/create-account",
	linking: "/linking",
	settingsPermissions: "/settings/permissions",
	feed: "/feed",
	stackPage: "/stack-page",
} as const satisfies Record<string, Href>;

export function feedPostPath(postId: string | number): Href {
	return `/feed/${postId}` as Href;
}

const AUTH_ROUTE_PATHS = new Set<string>([ROUTES.authSheet, ROUTES.signIn, ROUTES.createAccount]);

export function isAuthRoute(pathname: string) {
	return AUTH_ROUTE_PATHS.has(pathname);
}
