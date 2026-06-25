import { Spacing } from "@/constants/theme";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Bottom padding for scrollable screen content.
 *
 * Tab screens: Native Tabs already adjust scroll content for the tab bar
 * (iOS ScrollView content inset / Android bottom SafeAreaView).
 * Non-tab screens: use the runtime safe-area bottom inset.
 */
export default function useContentBottomInset() {
	const insets = useSafeAreaInsets();
	const segments = useSegments();
	const isInsideTabs = (segments as readonly string[]).includes("(tabs)");

	if (isInsideTabs) {
		return Spacing.four;
	}

	return insets.bottom + Spacing.four;
}
