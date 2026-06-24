import { ROUTES } from "@/constants/routes";
import useAuthState from "@/hooks/useAuthState";
import { useRouter } from "expo-router";

export default function useAuthActions() {
	const { setIsLoggedIn } = useAuthState();
	const router = useRouter();

	const goToSignIn = () => {
		router.replace(ROUTES.signIn);
	};

	const goToCreateAccount = () => {
		router.replace(ROUTES.createAccount);
	};

	const completeAuth = () => {
		setIsLoggedIn(true);
		router.replace(ROUTES.home);
	};

	return { goToSignIn, goToCreateAccount, completeAuth };
}
