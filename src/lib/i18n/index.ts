import { en } from "./en";
import { id } from "./id";
import type { TranslationKey } from "./en";

export type Locale = "en" | "id";
export type { TranslationKey };

export const LOCALES: Locale[] = ["en", "id"];

export const DEFAULT_LOCALE: Locale = "en";

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, id };
