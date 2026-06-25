import NavigationThemeProvider from "@/components/NavigationThemeProvider";
import useAuthState, { AuthProvider } from "@/hooks/useAuthState";
import { Stack } from "expo-router";

function RootNavigator() {
	const { isLoggedIn } = useAuthState();

	return (
		<NavigationThemeProvider>
			<Stack screenOptions={{ headerShown: false }}>
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
			<RootNavigator />
		</AuthProvider>
	);
}
