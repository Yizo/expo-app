import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/hooks/useAuthState";
import { Stack } from "expo-router";

function RootNavigator() {
	return (
		<>
			<Stack
				screenOptions={{
					headerBackTitle: "返回",
					headerBackButtonDisplayMode: "generic",
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
			<AuthModal />
		</>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootNavigator />
		</AuthProvider>
	);
}
