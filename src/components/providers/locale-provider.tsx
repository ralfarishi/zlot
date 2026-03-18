"use client";

import { createContext, useCallback, useContext, useState, useTransition, type ReactNode } from "react";
import { dictionaries, DEFAULT_LOCALE, type Locale } from "@/src/lib/i18n";
import type { TranslationKey } from "@/src/lib/i18n/en";
import { useRouter } from "next/navigation";

interface LocaleContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const COOKIE_NAME = "zlot-locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const setLocaleCookie = (locale: Locale) => {
	const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
	document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax${isSecure ? ";Secure" : ""}`;
};

export const LocaleProvider = ({
	initialLocale = DEFAULT_LOCALE,
	children,
}: {
	initialLocale?: Locale;
	children: ReactNode;
}) => {
	const [locale, setLocaleState] = useState<Locale>(initialLocale);
	const router = useRouter();
	const [, startTransition] = useTransition();

	const setLocale = useCallback(
		(next: Locale) => {
			setLocaleState(next);
			setLocaleCookie(next);
			document.documentElement.setAttribute("lang", next);
			startTransition(() => {
				router.refresh();
			});
		},
		[router],
	);

	const t = useCallback(
		(key: TranslationKey): string => {
			return dictionaries[locale][key] ?? dictionaries["en"][key] ?? key;
		},
		[locale],
	);

	return <LocaleContext value={{ locale, setLocale, t }}>{children}</LocaleContext>;
};

export const useLocale = () => {
	const ctx = useContext(LocaleContext);
	if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
	return ctx;
};
