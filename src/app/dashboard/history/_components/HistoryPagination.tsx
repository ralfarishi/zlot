"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Table } from "@tanstack/react-table";
import { useLocale } from "@/src/components/providers/locale-provider";

interface HistoryPaginationProps<TData> {
	table: Table<TData>;
}

export const HistoryPagination = <TData,>({ table }: HistoryPaginationProps<TData>) => {
	const { t } = useLocale();

	if (table.getPageCount() <= 1) return null;

	return (
		<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
			<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/50">
				{t("history.pagination.page")} {table.getState().pagination.pageIndex + 1}{" "}
				{t("history.pagination.of")} {table.getPageCount()}
			</span>
			<div className="flex items-center gap-2">
				<button
					type="button"
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.previousPage()}
					className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30 shadow-sm"
					aria-label={t("history.pagination.prev")}
				>
					<CaretLeft size={14} weight="bold" />
				</button>
				<button
					type="button"
					disabled={!table.getCanNextPage()}
					onClick={() => table.nextPage()}
					className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30 shadow-sm"
					aria-label={t("history.pagination.next")}
				>
					<CaretRight size={14} weight="bold" />
				</button>
			</div>
		</div>
	);
};
