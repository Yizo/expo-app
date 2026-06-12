import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="linking" options={{ title: "深度链接", headerBackTitle: "返回" }} />
		</Stack>
	);
}
