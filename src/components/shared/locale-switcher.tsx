"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
	className?: string;
	variant?: "icon" | "pill";
}

export const LocaleSwitcher = ({ className, variant = "icon" }: LocaleSwitcherProps) => {
	const { locale, setLocale } = useLocale();

	const toggle = () => setLocale(locale === "en" ? "id" : "en");

	if (variant === "pill") {
		return (
			<div
				className={cn(
					"flex h-10 w-20 items-center justify-between rounded-full bg-surface-elevated px-2 ring-1 ring-border/50 cursor-pointer",
					className,
				)}
				role="button"
				tabIndex={0}
				aria-label={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
				onClick={toggle}
				onKeyDown={(e) => e.key === "Enter" && toggle()}
			>
				{(["en", "id"] as const).map((lang) => (
					<div
						key={lang}
						className={cn(
							"flex size-7 items-center justify-center rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300",
							locale === lang
								? "bg-primary text-text-inverse scale-110 shadow-lg"
								: "text-text-secondary",
						)}
					>
						{lang.toUpperCase()}
					</div>
				))}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
			className={cn(
				"relative flex size-10 items-center justify-center rounded-full bg-surface-elevated/50 text-text-secondary transition-all hover:bg-primary/5 hover:text-primary active:scale-90",
				className,
			)}
		>
			<AnimatePresence mode="wait">
				<m.span
					key={locale}
					initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
					animate={{ scale: 1, opacity: 1, rotate: 0 }}
					exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
					transition={{ duration: 0.2 }}
					className="text-[10px] font-black uppercase tracking-wider"
				>
					{locale === "en" ? "ID" : "EN"}
				</m.span>
			</AnimatePresence>
		</button>
	);
};
