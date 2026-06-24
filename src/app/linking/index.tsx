import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";

/**
 * 深度链接
 */
export default function LinkingPage() {
	const colors = useTheme();

	return (
		<ScreenShell>
			<Animated.View entering={FadeInDown.duration(320)}>
				<SurfaceCard tone="muted">
					<View style={styles.sectionHeader}>
						<Text style={[styles.sectionTitle, { color: colors.text }]}>深度链接</Text>
					</View>
					<View style={styles.buttonStack}>
						<ActionButton
							label="打开 Expo 官网"
							onPress={() => Linking.openURL("https://expo.dev")}
						/>
						<ActionButton
							label="拨打电话 10086"
							onPress={() => Linking.openURL("tel:10086")}
							variant="secondary"
						/>
						<ActionButton
							label="发送短信"
							onPress={() => Linking.openURL("sms:1234567890")}
							variant="secondary"
						/>
						<ActionButton
							label="浏览器打开百度"
							onPress={() => WebBrowser.openBrowserAsync("https://www.baidu.com")}
							variant="secondary"
						/>
					</View>
				</SurfaceCard>
			</Animated.View>
		</ScreenShell>
	);
}

const styles = StyleSheet.create({
	sectionHeader: {
		marginBottom: 18,
	},
	sectionTitle: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.headline,
		fontWeight: "700",
	},
	buttonStack: {
		gap: 12,
	},
});
