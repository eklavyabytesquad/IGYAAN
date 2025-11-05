"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }) {
	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const root = document.documentElement;
		root.classList.add("dark");
		root.dataset.theme = "dark";

		if (document.body) {
			document.body.style.colorScheme = "dark";
		}

		if (typeof window !== "undefined") {
			try {
				window.localStorage.setItem("igyan-theme", "dark");
			} catch (error) {
				// ignore storage access issues
			}
		}
	}, []);

	return <>{children}</>;
}

export function useTheme() {
	return {
		theme: "dark",
		resolvedTheme: "dark",
		setTheme: () => {},
		toggleTheme: () => {},
	};
}
