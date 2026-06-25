import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function FeedLayout() {
	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name="index" options={{ title: "Feed" }} />
			<Stack.Screen name="[postId]" options={{ title: "详情" }} />
		</Stack>
	);
}
