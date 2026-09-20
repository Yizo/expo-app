import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function DemoLayout() {
	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name="index" options={{ title: "Demo" }} />
		</Stack>
	);
}
