import * as Linking from "expo-linking";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	headerText: {
		fontSize: 30,
		fontWeight: "bold",
		marginBottom: 10,
	},
});

/**
 * 深度链接
 */
export default function LinkingPage() {
	return (
		<ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
			<View style={styles.header}>
				<Text style={styles.headerText}>深度链接</Text>
			</View>
			<Button
				title="打开官网(Linking.openURL)"
				onPress={() => {
					Linking.openURL("https://expo.dev");
				}}
			/>
			<Button
				title="打电话(Linking.openURL)"
				onPress={() => {
					Linking.openURL("tel:10086");
				}}
			/>
			<Button
				title="发短信(Linking.openURL)"
				onPress={() => {
					Linking.openURL("sms:1234567890");
				}}
			/>
			<Link href="https://expo.dev">Go to Expo(Link)</Link>
			<Button
				title="打开网页(百度)(WebBrowser.openBrowserAsync)"
				onPress={() => WebBrowser.openBrowserAsync("https://www.baidu.com")}
			/>
		</ScrollView>
	);
}
