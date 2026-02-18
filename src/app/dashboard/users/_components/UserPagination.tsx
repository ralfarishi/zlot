"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";

interface UserPaginationProps<TData> {
	table: Table<TData>;
	onPageChange: (index: number) => void;
}

export const UserPagination = <TData,>({ table, onPageChange }: UserPaginationProps<TData>) => {
	if (table.getPageCount() <= 1) return null;

	return (
		<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
			<div className="flex items-center gap-2">
				<span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</span>
			</div>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(table.getState().pagination.pageIndex - 1)}
					disabled={!table.getCanPreviousPage()}
					className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90"
				>
					<CaretLeft size={16} weight="bold" />
				</button>
				<button
					type="button"
					onClick={() => onPageChange(table.getState().pagination.pageIndex + 1)}
					disabled={!table.getCanNextPage()}
					className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90"
				>
					<CaretRight size={16} weight="bold" />
				</button>
			</div>
		</div>
	);
};
