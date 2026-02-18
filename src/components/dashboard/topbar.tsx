"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { List, SignOut, User, Sun, Moon } from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/src/actions/profiles";
import { useTheme } from "@/components/providers/theme-provider";
import type { UserRole } from "@/src/lib/auth-guard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
	userName: string;
	userRole: UserRole;
	onMenuToggle: () => void;
}

export const Topbar = ({ userName, userRole, onMenuToggle }: TopbarProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { theme, toggleTheme } = useTheme();

	const handleLogout = () => {
		startTransition(async () => {
			await logout();
			router.push("/login");
		});
	};

	return (
		<header className="sticky top-0 z-30 h-16 border-b border-border bg-surface/80 backdrop-blur-md">
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between px-(--space-md) md:px-(--space-lg)">
				<div className="flex items-center gap-(--space-sm)">
					<button
						type="button"
						onClick={onMenuToggle}
						className="flex size-9 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary md:hidden"
					>
						<List size={22} weight="bold" />
					</button>

					<div className="hidden flex-col md:flex">
						<p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/60">
							System
						</p>
						<h2 className="text-xs font-bold text-text-primary capitalize">{userRole} Dashboard</h2>
					</div>
				</div>

				<div className="flex items-center gap-(--space-md)">
					<div className="flex items-center gap-(--space-sm) border-r border-border pr-(--space-md)">
						<div className="flex flex-col items-end text-right">
							<p className="text-sm font-bold text-text-primary leading-tight">{userName}</p>
							<p className="text-[10px] font-medium uppercase tracking-tighter text-secondary">
								{userRole}
							</p>
						</div>
						<div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
							<User size={18} weight="bold" />
						</div>
					</div>

					<div className="flex items-center gap-(--space-xs)">
						<button
							type="button"
							onClick={toggleTheme}
							className="flex size-9 items-center justify-center rounded-button text-text-secondary transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
							aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						>
							<AnimatePresence mode="wait">
								<motion.div
									key={theme}
									initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
									animate={{ scale: 1, rotate: 0, opacity: 1 }}
									exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									{theme === "light" ? (
										<Moon size={20} weight="duotone" />
									) : (
										<Sun size={20} weight="duotone" />
									)}
								</motion.div>
							</AnimatePresence>
						</button>

						<button
							type="button"
							disabled={isPending}
							onClick={handleLogout}
							className={cn(
								"flex size-9 items-center justify-center rounded-button text-text-secondary transition-all hover:bg-danger/10 hover:text-danger active:scale-95",
								isPending && "opacity-50",
							)}
							title="Sign out"
						>
							<SignOut size={20} weight="bold" />
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};
