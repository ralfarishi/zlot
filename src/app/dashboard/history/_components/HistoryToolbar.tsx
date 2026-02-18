"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

interface HistoryToolbarProps {
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	rowCount: number;
}

export const HistoryToolbar = ({
	globalFilter,
	onGlobalFilterChange,
	rowCount,
}: HistoryToolbarProps) => {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-1">
			<div className="flex flex-1 items-stretch sm:items-center gap-3">
				<div className="relative flex-1 group">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50 group-focus-within:text-primary transition-colors"
						size={18}
						weight="bold"
					/>
					<input
						type="text"
						placeholder="Search archives for plates, zones, or status..."
						value={globalFilter ?? ""}
						onChange={(e) => onGlobalFilterChange(e.target.value)}
						className="w-full rounded-button border border-border bg-surface pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border pt-4 lg:border-0 lg:pt-0">
				<div className="flex flex-col items-start lg:items-end">
					<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
						Archived Sessions
					</span>
					<span className="text-lg font-black tracking-tighter text-text-primary">{rowCount}</span>
				</div>
			</div>
		</div>
	);
};
