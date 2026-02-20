"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
	List,
	X,
	House,
	Info,
	Tag,
	EnvelopeSimple,
	SignIn,
	Sun,
	Moon,
	Files,
} from "@phosphor-icons/react";
import { useTheme } from "@/components/providers/theme-provider";
import { m, AnimatePresence, useScroll, useTransform } from "framer-motion";

const NAV_LINKS = [
	{ href: "/about", label: "About", icon: Info },
	{ href: "/pricing", label: "Pricing", icon: Tag },
	{ href: "/contact", label: "Contact", icon: EnvelopeSimple },
	{ href: "/docs/architecture", label: "Docs", icon: Files },
] as const;

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();
	const { scrollY } = useScroll();

	const close = useCallback(() => setIsOpen(false), []);

	// Transform for floating effect
	const navWidth = useTransform(scrollY, [0, 50], ["100%", "95%"]);
	const navTop = useTransform(scrollY, [0, 50], [0, 20]);
	const navBorderRadius = useTransform(scrollY, [0, 50], [0, 24]);
	const navShadow = useTransform(
		scrollY,
		[0, 50],
		["0 0 0 rgba(0,0,0,0)", "0 10px 30px -10px rgba(0,0,0,0.1)"],
	);

	return (
		<m.header
			style={{
				width: navWidth,
				top: navTop,
				borderRadius: navBorderRadius,
				boxShadow: navShadow,
			}}
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
			className="fixed left-1/2 z-50 -translate-x-1/2 border-b border-border/50 bg-surface/80 backdrop-blur-xl transition-colors duration-300"
		>
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-(--space-lg) py-3">
				{/* Logo */}
				<Link href="/" className="group flex items-center gap-2.5" onClick={close}>
					<div className="flex size-9 items-center justify-center rounded-xl bg-primary text-text-inverse transition-all duration-500 group-hover:rotate-360 group-hover:scale-110 shadow-lg shadow-primary/20">
						<House weight="fill" size={20} />
					</div>
					<span className="font-display text-2xl font-black tracking-tighter text-text-primary">
						Zlot<span className="text-secondary">.</span>
					</span>
				</Link>

				{/* Desktop nav */}
				<div className="hidden items-center gap-8 md:flex">
					<div className="flex items-center gap-6">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="group relative flex items-center gap-1.5 py-2 font-body text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
							>
								{link.label}
								<span className="absolute bottom-0 left-0 h-0.5 w-0 bg-secondary transition-all duration-300 group-hover:w-full" />
							</Link>
						))}
					</div>

					<div className="flex items-center gap-4 pl-6 border-l border-border/50">
						<button
							type="button"
							onClick={toggleTheme}
							className="relative flex size-10 items-center justify-center rounded-full bg-surface-elevated/50 text-text-secondary transition-all hover:bg-primary/5 hover:text-primary active:scale-90"
							aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						>
							<AnimatePresence mode="wait">
								<m.div
									key={theme}
									initial={{ scale: 0.95, rotate: -90, opacity: 0 }}
									animate={{ scale: 1, rotate: 0, opacity: 1 }}
									exit={{ scale: 0.95, rotate: 90, opacity: 0 }}
									transition={{ duration: 0.25 }}
								>
									{theme === "light" ? (
										<Moon size={20} weight="duotone" />
									) : (
										<Sun size={20} weight="duotone" />
									)}
								</m.div>
							</AnimatePresence>
						</button>

						<Link
							href="/login"
							className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-2.5 text-sm font-black text-text-inverse transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95"
						>
							<span className="relative z-10">Sign In</span>
							<SignIn
								size={18}
								weight="bold"
								className="relative z-10 transition-transform group-hover:translate-x-1"
							/>
							<div className="absolute inset-0 -translate-x-full bg-secondary transition-transform duration-500 group-hover:translate-x-0" />
						</Link>
					</div>
				</div>

				{/* Mobile toggle */}
				<button
					type="button"
					onClick={() => setIsOpen((v) => !v)}
					className="flex size-10 items-center justify-center rounded-xl bg-surface-elevated/50 text-text-primary hover:bg-primary/5 md:hidden"
					aria-label="Toggle menu"
				>
					<AnimatePresence mode="wait">
						{isOpen ? (
							<m.div
								key="close"
								initial={{ rotate: -90, opacity: 0, scale: 0.95 }}
								animate={{ rotate: 0, opacity: 1, scale: 1 }}
								exit={{ rotate: 90, opacity: 0, scale: 0.95 }}
							>
								<X size={24} weight="bold" />
							</m.div>
						) : (
							<m.div
								key="menu"
								initial={{ rotate: 90, opacity: 0, scale: 0.95 }}
								animate={{ rotate: 0, opacity: 1, scale: 1 }}
								exit={{ rotate: -90, opacity: 0, scale: 0.95 }}
							>
								<List size={24} weight="bold" />
							</m.div>
						)}
					</AnimatePresence>
				</button>
			</nav>

			{/* Mobile drawer */}
			<AnimatePresence>
				{isOpen && (
					<m.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
						className="overflow-hidden border-t border-border/50 bg-surface/90 backdrop-blur-2xl md:hidden"
					>
						<div className="flex flex-col gap-2 px-(--space-lg) pb-8 pt-4">
							{NAV_LINKS.map((link, idx) => (
								<m.div
									key={link.href}
									initial={{ x: -20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: idx * 0.1 }}
								>
									<Link
										href={link.href}
										onClick={close}
										className="flex items-center gap-4 rounded-2xl p-4 text-base font-bold text-text-secondary transition-all hover:bg-primary/5 hover:text-primary active:scale-95"
									>
										<div className="flex size-10 items-center justify-center rounded-xl bg-surface-elevated text-secondary shadow-sm">
											<link.icon size={20} weight="duotone" />
										</div>
										{link.label}
									</Link>
								</m.div>
							))}

							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
								className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-6"
							>
								<div className="flex items-center justify-between rounded-2xl bg-surface-elevated/50 p-4">
									<span className="text-sm font-bold text-text-secondary">Appearance</span>
									<button
										type="button"
										onClick={toggleTheme}
										className="flex h-10 w-20 items-center justify-between rounded-full bg-surface-elevated px-2 ring-1 ring-border/50"
									>
										<div
											className={`flex size-7 items-center justify-center rounded-full transition-all duration-300 ${theme === "light" ? "bg-primary text-text-inverse scale-110 shadow-lg" : "text-text-secondary"}`}
										>
											<Sun size={16} weight="bold" />
										</div>
										<div
											className={`flex size-7 items-center justify-center rounded-full transition-all duration-300 ${theme === "dark" ? "bg-primary text-text-inverse scale-110 shadow-lg" : "text-text-secondary"}`}
										>
											<Moon size={16} weight="bold" />
										</div>
									</button>
								</div>

								<Link
									href="/login"
									onClick={close}
									className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-lg font-black text-text-inverse shadow-xl shadow-primary/20 active:scale-95"
								>
									<span>Sign In to Console</span>
									<SignIn size={22} weight="bold" />
								</Link>
							</m.div>
						</div>
					</m.div>
				)}
			</AnimatePresence>
		</m.header>
	);
};
