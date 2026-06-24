import AuthModal from "@/components/AuthModal";
import NavigationThemeProvider from "@/components/NavigationThemeProvider";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/hooks/useAuthState";
import { Stack } from "expo-router";

function RootNavigator() {
	const scheme = useColorScheme();
	const themeKey = scheme === "dark" ? "dark" : "light";
	const colors = Colors[themeKey];

	return (
		<NavigationThemeProvider>
			<Stack
				screenOptions={{
					headerBackTitle: "返回",
					headerBackButtonDisplayMode: "generic",
					headerStyle: {
						backgroundColor: colors.surface,
					},
					headerTintColor: colors.text,
					headerTitleStyle: {
						color: colors.text,
					},
					contentStyle: {
						backgroundColor: colors.background,
					},
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="auth-sheet"
					options={{
						title: "",
						presentation: "formSheet",
						headerTransparent: true,
						contentStyle: { backgroundColor: "transparent" },
						sheetGrabberVisible: true,
						sheetAllowedDetents: [0.72, 0.9],
						sheetInitialDetentIndex: 0,
						sheetCornerRadius: 24,
					}}
				/>
				<Stack.Screen name="linking" options={{ title: "深度链接" }} />
				<Stack.Screen name="sign-in" options={{ headerShown: false }} />
				<Stack.Screen name="create-account" options={{ headerShown: false }} />
				<Stack.Screen
					name="stack-page"
					options={{
						title: "Stack页面",
						presentation: "modal",
						headerShown: false,
					}}
				/>
			</Stack>
		</NavigationThemeProvider>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootNavigator />
			<AuthModal />
		</AuthProvider>
	);
}
