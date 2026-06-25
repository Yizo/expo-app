import useDrawerPage, { DrawerPageProvider } from "@/hooks/use-drawer-page";
import { Drawer, type DrawerContentComponentProps } from "expo-router/drawer";
import { Button, useWindowDimensions, View } from "react-native";

function DrawerContent(props: DrawerContentComponentProps) {
	const { sendEvent } = useDrawerPage();

	return (
		<View style={{ padding: 16 }}>
			<Button
				title="发送事件"
				onPress={() => {
					sendEvent(`抽屉内容发送事件:${Date.now()}`);
					props.navigation.closeDrawer();
				}}
			/>
			<Button color="red" title="关闭抽屉" onPress={() => props.navigation.closeDrawer()} />
		</View>
	);
}

export default function DrawerLayout() {
	const dimensions = useWindowDimensions();
	const drawerType = dimensions.width > 767 ? "permanent" : "front";

	return (
		<DrawerPageProvider>
			<Drawer
				drawerContent={(props) => <DrawerContent {...props} />}
				defaultStatus="closed"
				screenOptions={{ headerShown: false, drawerType }}
			>
				<Drawer.Screen
					name="index"
					options={{ title: "抽屉页面", drawerLabel: "抽屉页面" }}
				/>
			</Drawer>
		</DrawerPageProvider>
	);
}
