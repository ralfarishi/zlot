"use client";

import { useState, useCallback, useMemo } from "react";
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
import { useLocale } from "@/components/providers/locale-provider";
import type { TranslationKey } from "@/src/lib/i18n/en";

interface NavItem {
	href: string;
	label: string;
	icon: PhosphorIcon;
	roles: UserRole[];
	group: string;
	groupKey: TranslationKey | string;
}

const NavItemComponent = ({
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
	const { t, locale } = useLocale();

	const NAV_ITEMS: NavItem[] = useMemo(
		() => [
			{
				href: "/dashboard",
				label: t("sidebar.nav.overview"),
				icon: House,
				roles: ["admin", "owner"],
				group: t("sidebar.group.operations"),
				groupKey: "sidebar.group.operations",
			},
			{
				href: "/dashboard/parking",
				label: t("sidebar.nav.console"),
				icon: Garage,
				roles: ["admin", "petugas"],
				group: t("sidebar.group.operations"),
				groupKey: "sidebar.group.operations",
			},
			{
				href: "/dashboard/vehicles",
				label: t("sidebar.nav.fleet"),
				icon: Car,
				roles: ["admin", "owner"],
				group: t("sidebar.group.operations"),
				groupKey: "sidebar.group.operations",
			},
			{
				href: "/dashboard/history",
				label: t("sidebar.nav.history"),
				icon: ClockCounterClockwise,
				roles: ["admin", "owner"],
				group: t("sidebar.group.operations"),
				groupKey: "sidebar.group.operations",
			},
			// Intelligence
			{
				href: "/dashboard/analytics",
				label: t("sidebar.nav.analytics"),
				icon: ChartLine,
				roles: ["admin", "owner"],
				group: t("sidebar.group.intelligence"),
				groupKey: "sidebar.group.intelligence",
			},
			{
				href: "/dashboard/reports",
				label: t("sidebar.nav.reports"),
				icon: FileText,
				roles: ["admin", "owner"],
				group: t("sidebar.group.intelligence"),
				groupKey: "sidebar.group.intelligence",
			},
			// Management
			{
				href: "/dashboard/users",
				label: t("sidebar.nav.personnel"),
				icon: Users,
				roles: ["admin"],
				group: t("sidebar.group.management"),
				groupKey: "sidebar.group.management",
			},
			{
				href: "/dashboard/rates",
				label: t("sidebar.nav.tariffs"),
				icon: CurrencyDollar,
				roles: ["admin"],
				group: t("sidebar.group.management"),
				groupKey: "sidebar.group.management",
			},
			{
				href: "/dashboard/areas",
				label: t("sidebar.nav.zones"),
				icon: MapPin,
				roles: ["admin"],
				group: t("sidebar.group.management"),
				groupKey: "sidebar.group.management",
			},
			// System
			{
				href: "/dashboard/logs",
				label: t("sidebar.nav.telemetry"),
				icon: ClockCounterClockwise,
				roles: ["admin"],
				group: t("sidebar.group.system"),
				groupKey: "sidebar.group.system",
			},
			{
				href: "/dashboard/profile",
				label: t("sidebar.nav.identity"),
				icon: User,
				roles: ["admin", "owner", "petugas"],
				group: t("sidebar.group.system"),
				groupKey: "sidebar.group.system",
			},
		],
		[t],
	);

	const filteredItems = useMemo(
		() => NAV_ITEMS.filter((item) => item.roles.includes(role)),
		[NAV_ITEMS, role],
	);

	const groups = useMemo(
		() =>
			filteredItems.reduce(
				(acc, item) => {
					if (!acc[item.groupKey]) acc[item.groupKey] = [];
					acc[item.groupKey].push(item);
					return acc;
				},
				{} as Record<string, NavItem[]>,
			),
		[filteredItems],
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
					aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
				>
					{collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
				</button>
				{/* Mobile close */}
				<button
					type="button"
					onClick={onClose}
					className="flex size-8 items-center justify-center rounded-button text-text-secondary hover:text-text-primary md:hidden"
					aria-label={t("sidebar.close")}
				>
					<X size={20} />
				</button>
			</div>

			{/* Nav */}
			<m.nav
				key={locale}
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
				{Object.entries(groups).map(([groupKey, items]) => (
					<div key={groupKey} className="space-y-1">
						{!collapsed && (
							<h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/40 mb-2">
								{items[0].group}
							</h4>
						)}
						<div className="space-y-1">
							{items.map((item) => (
								<NavItemComponent
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
