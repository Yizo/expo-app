import NavigationThemeProvider from "@/components/NavigationThemeProvider";
import useAuthState, { AuthProvider } from "@/hooks/useAuthState";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync();

function SplashScreenController() {
	const { isLoading } = useAuthState();

	useEffect(() => {
		if (!isLoading) {
			void SplashScreen.hideAsync();
		}
	}, [isLoading]);

	return null;
}

function RootNavigator() {
	const { isLoading, isLoggedIn } = useAuthState();

	if (isLoading) {
		return null;
	}

	return (
		<NavigationThemeProvider>
			<Stack screenOptions={{ headerShown: false, headerBackTitle: "返回" }}>
				<Stack.Protected guard={isLoggedIn}>
					<Stack.Screen name="(app)" options={{ headerShown: false }} />
				</Stack.Protected>
				<Stack.Protected guard={!isLoggedIn}>
					<Stack.Screen name="sign-in" options={{ headerShown: false }} />
					<Stack.Screen name="create-account" options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>
		</NavigationThemeProvider>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<SplashScreenController />
			<RootNavigator />
		</AuthProvider>
	);
}
