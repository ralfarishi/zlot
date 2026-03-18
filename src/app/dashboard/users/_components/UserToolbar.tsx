"use client";

import { MagnifyingGlass, ArrowsClockwise } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";
import { useLocale } from "@/src/components/providers/locale-provider";

interface UserToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	count: number;
	isPending: boolean;
}

export const UserToolbar = ({ search, onSearchChange, count, isPending }: UserToolbarProps) => {
	const { t } = useLocale();
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-1">
			<div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3">
				<div className="relative flex-1 group">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors"
						size={18}
						weight="bold"
					/>
					<input
						type="text"
						placeholder={t("users.searchPlaceholder")}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-10 w-full rounded-button border border-border bg-surface pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border pt-4 lg:border-0 lg:pt-0">
				<div className="flex flex-col items-start lg:items-end">
					<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
					{t("users.personnelCount")}
				</span>
					<span className="text-lg font-black tracking-tighter text-text-primary">{count}</span>
				</div>
				<div className="h-8 w-px bg-border hidden sm:block" />
				<div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
					<ArrowsClockwise size={12} className={cn(isPending && "animate-spin")} />
				</div>
			</div>
		</div>
	);
};
