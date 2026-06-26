import useStackHeaderOptions from "@/hooks/use-stack-header-options";
import { Stack } from "expo-router";

export default function AppLayout() {
	const headerOptions = useStackHeaderOptions();

	return (
		<Stack screenOptions={headerOptions}>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="linking" options={{ title: "深度链接" }} />
			<Stack.Screen
				name="stack-page"
				options={{
					title: "Stack页面",
					presentation: "modal",
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="drawer-page"
				options={{
					title: "Drawer页面",
				}}
			/>
		</Stack>
	);
}
