import { createContext, createElement, useContext, useState, type ReactNode } from "react";

type AuthState = {
	isLoggedIn: boolean;
	setIsLoggedIn: (value: boolean) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isLoggedIn, setIsLoggedIn] = useState(true);

	return createElement(AuthContext.Provider, { value: { isLoggedIn, setIsLoggedIn } }, children);
}

export default function useAuthState() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthState must be used within AuthProvider");
	}

	return context;
}
