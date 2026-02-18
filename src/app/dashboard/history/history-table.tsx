"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	useReactTable,
	type SortingState,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { ParkingReceipt } from "./parking-receipt";
import { HistoryTransaction } from "./_components/types";
import { columns } from "./_components/HistoryColumns";
import { HistoryToolbar } from "./_components/HistoryToolbar";
import { HistoryPagination } from "./_components/HistoryPagination";

export const HistoryTable = ({ data }: { data: HistoryTransaction[] }) => {
	const [globalFilter, setGlobalFilter] = useQueryState("search", parseAsString.withDefault(""));
	const [sortingState, setSortingState] = useQueryState("sort", parseAsString.withDefault(""));
	const [pageIndex, setPageIndex] = useQueryState("page", parseAsInteger.withDefault(1));
	const [selectedTransaction, setSelectedTransaction] = useState<HistoryTransaction | null>(null);
	const [isReceiptOpen, setIsReceiptOpen] = useState(false);

	// Memoize derived sorting to keep a stable reference
	const sorting: SortingState = useMemo(
		() =>
			sortingState
				? [{ id: sortingState.split(":")[0], desc: sortingState.split(":")[1] === "desc" }]
				: [],
		[sortingState],
	);

	const onSortingChange = useCallback(
		(updater: SortingState | ((prev: SortingState) => SortingState)) => {
			const next = typeof updater === "function" ? updater(sorting) : updater;
			const sort = next[0];
			setSortingState(sort ? `${sort.id}:${sort.desc ? "desc" : "asc"}` : null);
			setPageIndex(1); // Reset to first page on sort
		},
		[sorting, setSortingState, setPageIndex],
	);

	const [pageSize, setPageSize] = useState(5);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
			pagination: { pageIndex: pageIndex - 1, pageSize },
		},
		onSortingChange,
		onGlobalFilterChange: (val) => {
			setGlobalFilter(val as string);
			setPageIndex(1); // Reset to first page on filter
		},
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				const nextState = updater({ pageIndex: pageIndex - 1, pageSize });
				setPageIndex(nextState.pageIndex + 1);
				setPageSize(nextState.pageSize);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: false,
		meta: {
			onViewReceipt: (tx: HistoryTransaction) => {
				setSelectedTransaction(tx);
				setIsReceiptOpen(true);
			},
		},
	});

	return (
		<div className="space-y-(--space-md)">
			<HistoryToolbar
				globalFilter={globalFilter ?? ""}
				onGlobalFilterChange={setGlobalFilter}
				rowCount={table.getFilteredRowModel().rows.length}
			/>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id} className="border-b border-border bg-surface-elevated/50">
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											onClick={header.column.getToggleSortingHandler()}
											className={cn(
												"cursor-pointer px-(--space-md) py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 hover:text-text-primary transition-colors select-none",
												header.id === "actions" ? "text-right" : "text-left",
											)}
										>
											<div
												className={cn(
													"flex items-center gap-2",
													header.id === "actions" && "justify-end",
												)}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
											</div>
										</th>
									))}
								</tr>
							))}
						</thead>
						<motion.tbody
							key={table
								.getRowModel()
								.rows.map((r) => r.id)
								.join()}
							variants={{
								show: { transition: { staggerChildren: 0.03 } },
							}}
							initial="hidden"
							animate="show"
						>
							{table.getRowModel().rows.length === 0 ? (
								<tr className="border-t border-border">
									<td
										colSpan={columns.length}
										className="px-(--space-md) py-(--space-2xl) text-center text-sm text-text-secondary italic"
									>
										No transactions found in archive
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => {
									return (
										<Fragment key={row.id}>
											<motion.tr
												variants={{
													hidden: { opacity: 0, x: -10 },
													show: { opacity: 1, x: 0 },
												}}
												className={cn(
													"group border-b border-border transition-colors last:border-0 hover:bg-primary/2",
												)}
											>
												{row.getVisibleCells().map((cell) => (
													<td key={cell.id} className="px-(--space-md) py-4">
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</td>
												))}
											</motion.tr>
										</Fragment>
									);
								})
							)}
						</motion.tbody>
					</table>
				</div>

				<HistoryPagination table={table} />
			</motion.div>

			<Dialog
				open={isReceiptOpen}
				onOpenChange={(open) => {
					setIsReceiptOpen(open);
					if (!open) setSelectedTransaction(null);
				}}
			>
				<DialogContent
					className="max-w-md p-0 overflow-hidden border-border/50"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">Parking Receipt Preview</DialogTitle>
					<div>
						{selectedTransaction && (
							<ParkingReceipt
								data={{
									id: selectedTransaction.id.toString(),
									transactionNumber: selectedTransaction.transactionNumber,
									plateNumber: selectedTransaction.vehicle.plateNumber,
									vehicleType: selectedTransaction.vehicle.vehicleType,
									areaName: selectedTransaction.area.areaName,
									entryTime: selectedTransaction.entryTime,
									exitTime: selectedTransaction.exitTime,
									durationHours: selectedTransaction.durationHours,
									totalCost: selectedTransaction.totalCost,
									hourlyRate: selectedTransaction.rate.hourlyRate,
									staffName: selectedTransaction.staffName,
									paymentMethod: selectedTransaction.paymentMethod,
									cashReceived: selectedTransaction.cashReceived,
									cashChange: selectedTransaction.cashChange,
								}}
								onClose={() => setIsReceiptOpen(false)}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
