import AuthModal from "@/components/AuthModal";
import ThemedRootStack from "@/components/ThemedRootStack";
import { AuthProvider } from "@/hooks/useAuthState";

export default function RootLayout() {
	return (
		<AuthProvider>
			<ThemedRootStack />
			<AuthModal />
		</AuthProvider>
	);
}
