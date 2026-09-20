import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";
import { Platform } from "react-native";

type StorageState = [boolean, string | null];
type UseStorageState = [StorageState, (value: string | null) => void];

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

export async function setStorageItemAsync(key: string, value: string | null) {
	if (Platform.OS === "web") {
		try {
			if (typeof localStorage === "undefined") {
				return;
			}

			if (value === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, value);
			}
		} catch (error) {
			console.warn(`Failed to save storage item "${key}".`, error);
		}
		return;
	}

	if (value === null) {
		await SecureStore.deleteItemAsync(key);
	} else {
		await SecureStore.setItemAsync(key, value);
	}
}

export default function useStorageState(key: string): UseStorageState {
	const [state, setState] = useAsyncState();

	useEffect(() => {
		let isMounted = true;

		async function loadValue() {
			try {
				const value =
					Platform.OS === "web"
						? typeof localStorage === "undefined"
							? null
							: localStorage.getItem(key)
						: await SecureStore.getItemAsync(key);

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
