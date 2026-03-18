import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import type { Locale } from "@/src/lib/i18n";
import "./globals.css";

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-display",
	weight: ["600", "700"],
	display: "swap",
});

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-body",
	weight: ["400", "500", "600"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Zlot - Smart Parking Management",
		template: "%s | Zlot",
	},
	description:
		"A professional, high-efficiency parking management system for lot operators. Real-time occupancy, automated billing, and actionable analytics.",
};

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { FramerProvider } from "@/components/providers/framer-provider";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
	const cookieStore = await cookies();
	const themeCookie = cookieStore.get("zlot-theme");
	const theme = (themeCookie?.value === "dark" ? "dark" : "light") as "light" | "dark";
	const localeCookie = cookieStore.get("zlot-locale");
	const locale = (localeCookie?.value === "id" ? "id" : "en") as Locale;

	return (
		<html
			lang={locale}
			data-theme={theme}
			className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider initialTheme={theme}>
					<LocaleProvider initialLocale={locale}>
						<QueryProvider>
							<FramerProvider>
								<NuqsAdapter>{children}</NuqsAdapter>
							</FramerProvider>
						</QueryProvider>
					</LocaleProvider>
				</ThemeProvider>
			</body>
		</html>
	);
};

export default RootLayout;
