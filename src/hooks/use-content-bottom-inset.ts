import { Spacing } from "@/constants/theme";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * 可滚动页面内容的底部留白。
 *
 * Tab 内页面：Native Tabs 已处理 Tab 栏占位（iOS 的 ScrollView content inset /
 * Android 底部 SafeAreaView），只需固定小间距。
 * 非 Tab 页面：使用运行时安全区 bottom inset，避免内容贴底或被 Home 指示条遮挡。
 */
export default function useContentBottomInset() {
	const insets = useSafeAreaInsets();
	const segments = useSegments();
	// 判断当前路由是否在 (tabs) 分组内
	const isInsideTabs = (segments as readonly string[]).includes("(tabs)");

	if (isInsideTabs) {
		return Spacing.four;
	}

	return insets.bottom + Spacing.four;
}
