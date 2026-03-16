"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	House,
	Users,
	CurrencyDollar,
	MapPin,
	Car,
	ClockCounterClockwise,
	ChartLine,
	FileText,
	Garage,
	CaretLeft,
	CaretRight,
	X,
	User,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { UserRole } from "@/src/lib/auth-guard";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: PhosphorIcon;
	roles: UserRole[];
	group: string;
}

const NAV_ITEMS: NavItem[] = [
	{
		href: "/dashboard",
		label: "Overview",
		icon: House,
		roles: ["admin", "owner"],
		group: "Operations",
	},
	{
		href: "/dashboard/parking",
		label: "Console",
		icon: Garage,
		roles: ["admin", "petugas"],
		group: "Operations",
	},
	{
		href: "/dashboard/vehicles",
		label: "Fleet",
		icon: Car,
		roles: ["admin", "owner"],
		group: "Operations",
	},
	{
		href: "/dashboard/history",
		label: "History",
		icon: ClockCounterClockwise,
		roles: ["admin", "owner"],
		group: "Operations",
	},
	// Intelligence
	{
		href: "/dashboard/analytics",
		label: "Analytics",
		icon: ChartLine,
		roles: ["admin", "owner"],
		group: "Intelligence",
	},
	{
		href: "/dashboard/reports",
		label: "Reports",
		icon: FileText,
		roles: ["admin", "owner"],
		group: "Intelligence",
	},
	// Management
	{
		href: "/dashboard/users",
		label: "Personnel",
		icon: Users,
		roles: ["admin"],
		group: "Management",
	},
	{
		href: "/dashboard/rates",
		label: "Tariffs",
		icon: CurrencyDollar,
		roles: ["admin"],
		group: "Management",
	},
	{
		href: "/dashboard/areas",
		label: "Zones",
		icon: MapPin,
		roles: ["admin"],
		group: "Management",
	},
	// System
	{
		href: "/dashboard/logs",
		label: "Telemetry",
		icon: ClockCounterClockwise,
		roles: ["admin"],
		group: "System",
	},
	{
		href: "/dashboard/profile",
		label: "Identity",
		icon: User,
		roles: ["admin", "owner", "petugas"],
		group: "System",
	},
];

const NavItem = ({
	item,
	isActive,
	collapsed,
	onClose,
}: {
	item: NavItem;
	isActive: boolean;
	collapsed: boolean;
	onClose?: () => void;
}) => {
	const Icon = item.icon;

	return (
		<m.div
			variants={{
				hidden: { opacity: 0, x: -10 },
				show: { opacity: 1, x: 0 },
			}}
		>
			<Link
				href={item.href}
				onClick={onClose}
				className={cn(
					"group relative flex items-center gap-(--space-sm) rounded-button px-(--space-sm) py-2 text-sm font-medium transition-all duration-200",
					isActive
						? "bg-secondary/10 text-secondary"
						: "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
					collapsed && "justify-center px-0",
				)}
			>
				{isActive && (
					<m.div
						layoutId="active-nav"
						className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-secondary"
						initial={false}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					/>
				)}
				<Icon
					size={20}
					weight={isActive ? "fill" : "regular"}
					className={cn(
						"shrink-0 transition-transform duration-200 group-hover:scale-110",
						isActive ? "text-secondary" : "text-text-secondary group-hover:text-text-primary",
					)}
				/>
				{!collapsed && <span className="truncate">{item.label}</span>}
			</Link>
		</m.div>
	);
};

export const Sidebar = ({
	role,
	isOpen,
	onClose,
}: {
	role: UserRole;
	isOpen: boolean;
	onClose: () => void;
}) => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

	const groups = filteredItems.reduce(
		(acc, item) => {
			if (!acc[item.group]) acc[item.group] = [];
			acc[item.group].push(item);
			return acc;
		},
		{} as Record<string, NavItem[]>,
	);

	const isActive = (href: string) => {
		if (href === "/dashboard") return pathname === "/dashboard";
		return pathname.startsWith(href);
	};

	const sidebarContent = (
		<div
			className={cn(
				"flex h-full flex-col border-r border-border bg-surface transition-all duration-(--duration-normal)",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center justify-between border-b border-border px-(--space-md)">
				{!collapsed && (
					<Link
						href="/dashboard"
						className="font-display text-xl font-bold tracking-tight text-primary"
					>
						Zlot
					</Link>
				)}
				<button
					type="button"
					onClick={() => setCollapsed((v) => !v)}
					className="hidden size-8 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary md:flex"
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
				</button>
				{/* Mobile close */}
				<button
					type="button"
					onClick={onClose}
					className="flex size-8 items-center justify-center rounded-button text-text-secondary hover:text-text-primary md:hidden"
					aria-label="Close menu"
				>
					<X size={20} />
				</button>
			</div>

			{/* Nav */}
			<m.nav
				className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-(--space-sm)"
				variants={{
					show: {
						transition: {
							staggerChildren: 0.05,
						},
					},
				}}
				initial="hidden"
				animate="show"
			>
				{Object.entries(groups).map(([group, items]) => (
					<div key={group} className="space-y-1">
						{!collapsed && (
							<h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/40 mb-2">
								{group}
							</h4>
						)}
						<div className="space-y-1">
							{items.map((item) => (
								<NavItem
									key={item.href}
									item={item}
									isActive={isActive(item.href)}
									collapsed={collapsed}
									onClose={onClose}
								/>
							))}
						</div>
					</div>
				))}
			</m.nav>
		</div>
	);

	return (
		<>
			{/* Desktop sidebar */}
			<aside className="hidden h-dvh shrink-0 md:block">{sidebarContent}</aside>

			{/* Mobile overlay */}
			<AnimatePresence>
				{isOpen && (
					<div className="fixed inset-0 z-50 md:hidden">
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/40 backdrop-blur-sm"
							onClick={onClose}
						/>
						<m.aside
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute inset-y-0 left-0 w-64 shadow-2xl"
						>
							{sidebarContent}
						</m.aside>
					</div>
				)}
			</AnimatePresence>
		</>
	);
};

export const useSidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	return { isOpen, open, close };
};
