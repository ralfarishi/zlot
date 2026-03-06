"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COOKIE_NAME = "zlot-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const setThemeCookie = (theme: Theme) => {
	const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
	document.cookie = `${COOKIE_NAME}=${theme};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax${isSecure ? ";Secure" : ""}`;
};

export const ThemeProvider = ({
	initialTheme = "light",
	children,
}: {
	initialTheme?: Theme;
	children: ReactNode;
}) => {
	const [theme, setTheme] = useState<Theme>(initialTheme);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === "light" ? "dark" : "light";
			document.documentElement.setAttribute("data-theme", next);
			setThemeCookie(next);
			return next;
		});
	}, []);

	return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
};

export const useTheme = () => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
};
