import { useCallback, useEffect, useReducer } from "react";
import { Platform } from "react-native";

type StorageState = [boolean, string | null];
type UseStorageState = [StorageState, (value: string | null) => void];
type ExpoSecureStoreModule = {
	deleteValueWithKeyAsync?: (key: string, options?: object) => Promise<void>;
	getValueWithKeyAsync?: (key: string, options?: object) => Promise<string | null>;
	setValueWithKeyAsync?: (
		value: string,
		key: string,
		options?: object,
	) => Promise<void>;
};

const fallbackStorage = new Map<string, string>();
let didWarnAboutFallbackStorage = false;

function useAsyncState(initialValue: StorageState = [true, null]): UseStorageState {
	const [state, dispatch] = useReducer(
		(_state: StorageState, value: string | null = null): StorageState => [
			false,
			value,
		],
		initialValue,
	);

	const setValue = useCallback((value: string | null) => {
		dispatch(value);
	}, []);

	return [state, setValue];
}

function getWebStorageItem(key: string) {
	if (typeof localStorage === "undefined") {
		return null;
	}

	return localStorage.getItem(key);
}

async function getNativeStorageItem(key: string) {
	const SecureStore = getNativeSecureStoreModule();

	if (!SecureStore?.getValueWithKeyAsync) {
		warnAboutFallbackStorage();
		return fallbackStorage.get(key) ?? null;
	}

	return SecureStore.getValueWithKeyAsync(key);
}

export async function setStorageItemAsync(key: string, value: string | null) {
	if (Platform.OS === "web") {
		if (typeof localStorage === "undefined") {
			return;
		}

		if (value === null) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, value);
		}
		return;
	}

	const SecureStore = getNativeSecureStoreModule();

	if (!SecureStore?.setValueWithKeyAsync || !SecureStore.deleteValueWithKeyAsync) {
		warnAboutFallbackStorage();
		if (value === null) {
			fallbackStorage.delete(key);
		} else {
			fallbackStorage.set(key, value);
		}
		return;
	}

	if (value === null) {
		await SecureStore.deleteValueWithKeyAsync(key);
	} else {
		await SecureStore.setValueWithKeyAsync(value, key);
	}
}

function getNativeSecureStoreModule() {
	const expoGlobal = globalThis as typeof globalThis & {
		expo?: { modules?: Record<string, ExpoSecureStoreModule | undefined> };
	};

	return expoGlobal.expo?.modules?.ExpoSecureStore ?? null;
}

function warnAboutFallbackStorage() {
	if (didWarnAboutFallbackStorage) {
		return;
	}

	didWarnAboutFallbackStorage = true;
	console.warn(
		"ExpoSecureStore native module is unavailable. Rebuild the native app/dev client to persist auth sessions securely.",
	);
}

export default function useStorageState(key: string): UseStorageState {
	const [state, setState] = useAsyncState();

	useEffect(() => {
		let isMounted = true;

		async function loadValue() {
			try {
				const value =
					Platform.OS === "web"
						? getWebStorageItem(key)
						: await getNativeStorageItem(key);

				if (isMounted) {
					setState(value);
				}
			} catch (error) {
				console.warn(`Failed to load storage item "${key}".`, error);
				if (isMounted) {
					setState(null);
				}
			}
		}

		void loadValue();

		return () => {
			isMounted = false;
		};
	}, [key, setState]);

	const setValue = useCallback(
		(value: string | null) => {
			setState(value);
			void setStorageItemAsync(key, value).catch((error) => {
				console.warn(`Failed to save storage item "${key}".`, error);
			});
		},
		[key, setState],
	);

	return [state, setValue];
}
