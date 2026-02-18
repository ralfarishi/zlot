"use client";

import { Sidebar, useSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import type { UserRole } from "@/src/lib/auth-guard";
import { motion } from "framer-motion";

interface DashboardShellProps {
	children: React.ReactNode;
	userName: string;
	userRole: UserRole;
}

export const DashboardShell = ({ children, userName, userRole }: DashboardShellProps) => {
	const { isOpen, open, close } = useSidebar();

	return (
		<div className="flex h-dvh overflow-hidden bg-background">
			<Sidebar role={userRole} isOpen={isOpen} onClose={close} />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Topbar userName={userName} userRole={userRole} onMenuToggle={open} />

				<main className="flex-1 overflow-y-auto p-(--space-md) md:p-(--space-lg)">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						{children}
					</motion.div>
				</main>
			</div>
		</div>
	);
};
