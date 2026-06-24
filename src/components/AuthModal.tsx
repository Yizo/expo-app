import { ROUTES, isAuthRoute } from "@/constants/routes";
import useAuthState from "@/hooks/useAuthState";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthModal() {
	const { isLoggedIn } = useAuthState();
	const pathname = usePathname();
	const router = useRouter();
	const onAuthScreen = isAuthRoute(pathname);

	useEffect(() => {
		if (isLoggedIn) {
			return;
		}

		if (!onAuthScreen) {
			router.push(ROUTES.authSheet);
		}
	}, [isLoggedIn, onAuthScreen, router]);

	return null;
}
