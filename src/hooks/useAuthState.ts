import useStorageState from "@/hooks/use-storage-state";
import { createContext, createElement, useCallback, useContext, type ReactNode } from "react";

const AUTH_SESSION_KEY = "auth.session";
const DEMO_SESSION = "demo-session";

type AuthState = {
	isLoading: boolean;
	isLoggedIn: boolean;
	session: string | null;
	signIn: () => void;
	signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [[isLoading, session], setSession] = useStorageState(AUTH_SESSION_KEY);
	const signIn = useCallback(() => {
		setSession(DEMO_SESSION);
	}, [setSession]);
	const signOut = useCallback(() => {
		setSession(null);
	}, [setSession]);

	return createElement(
		AuthContext.Provider,
		{
			value: {
				isLoading,
				isLoggedIn: !!session,
				session,
				signIn,
				signOut,
			},
		},
		children,
	);
}

export default function useAuthState() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthState must be used within AuthProvider");
	}

	return context;
}
