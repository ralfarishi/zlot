import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./index";
import type { TranslationKey } from "./en";

export const getLocale = async (): Promise<Locale> => {
	const cookieStore = await cookies();
	const localeCookie = cookieStore.get("zlot-locale");
	return (localeCookie?.value === "id" ? "id" : "en") as Locale;
};

export const getTranslator = async () => {
	const locale = await getLocale();
	const dict = dictionaries[locale];
	const fallback = dictionaries.en;

	const t = (key: TranslationKey): string => {
		return dict[key] ?? fallback[key] ?? key;
	};

	return t;
};
