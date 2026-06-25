import useDrawerPage from "@/app/drawer-page/drawer-page-context";
import ScreenShell from "@/components/ui/screen-shell";
import { Stack, useNavigation } from "expo-router";
import type { DrawerNavigationProp } from "expo-router/drawer";
import { Button, Text, View } from "react-native";

export default function DrawerPage() {
	const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();
	const { lastEvent } = useDrawerPage();

	return (
		<>
			<Stack.Screen options={{ title: "抽屉页面" }} />
			<ScreenShell fill>
				<View>
					<Button title="打开抽屉" onPress={() => navigation.openDrawer()} />
					{lastEvent ? <Text>收到抽屉事件：{lastEvent}</Text> : null}
				</View>
			</ScreenShell>
		</>
	);
}
