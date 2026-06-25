import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";

type DrawerPageContextValue = {
	lastEvent: string | null;
	sendEvent: (message: string) => void;
};

const DrawerPageContext = createContext<DrawerPageContextValue | null>(null);

export function DrawerPageProvider({ children }: { children: ReactNode }) {
	const [lastEvent, setLastEvent] = useState<string | null>(null);
	const sendEvent = useCallback((message: string) => {
		setLastEvent(message);
	}, []);

	return (
		<DrawerPageContext.Provider value={{ lastEvent, sendEvent }}>
			{children}
		</DrawerPageContext.Provider>
	);
}

export default function useDrawerPage() {
	const context = useContext(DrawerPageContext);
	if (!context) {
		throw new Error("useDrawerPage must be used within DrawerPageProvider");
	}
	return context;
}
