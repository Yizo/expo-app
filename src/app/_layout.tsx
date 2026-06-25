import NavigationThemeProvider from "@/components/NavigationThemeProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import useAuthState, { AuthProvider } from "@/hooks/useAuthState";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
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

function AppStatusBar() {
	const scheme = useColorScheme();

	return (
		<StatusBar
			animated
			hidden={false}
			style={scheme === "dark" ? "light" : "dark"}
		/>
	);
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
			<AppStatusBar />
			<SplashScreenController />
			<RootNavigator />
		</AuthProvider>
	);
}
