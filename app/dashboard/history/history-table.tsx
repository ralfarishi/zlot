"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	useReactTable,
	type SortingState,
} from "@tanstack/react-table";
import {
	IdentificationCard,
	MapPin,
	Calendar,
	MagnifyingGlass,
	CaretLeft,
	CaretRight,
	Clock,
	CurrencyDollar,
	Tag,
	Receipt,
	Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useTransition } from "react";
import { deleteTransaction } from "@/src/actions/transactions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { cn, formatIDR, formatLongDuration } from "@/lib/utils";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ParkingReceipt } from "./parking-receipt";

interface HistoryTransaction {
	id: string;
	transactionNumber: string | null;
	entryTime: Date;
	exitTime: Date | null;
	status: string;
	totalCost: string | null;
	durationHours: string | null;
	vehicle: {
		plateNumber: string;
		vehicleType: string;
	};
	area: {
		areaName: string;
	};
	rate: {
		hourlyRate: string;
	};
	staffName: string | null;
	paymentMethod: string | null;
	cashReceived: string | null;
	cashChange: string | null;
}

const columnHelper = createColumnHelper<HistoryTransaction>();

const columns = [
	columnHelper.accessor("transactionNumber", {
		header: () => (
			<div className="flex items-center gap-2">
				<IdentificationCard size={14} weight="bold" />
				Ref / Plate
			</div>
		),
		cell: (info) => (
			<div className="flex flex-col">
				<span className="text-[10px] font-black text-primary uppercase tracking-widest">
					{info.getValue() || `TX-${info.row.original.id}`}
				</span>
				<span className="font-mono text-xs font-black tracking-[0.2em] text-text-primary uppercase">
					{info.row.original.vehicle.plateNumber.replaceAll(" ", "")}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("area.areaName", {
		header: () => (
			<div className="flex items-center gap-2">
				<MapPin size={14} weight="bold" />
				Zone
			</div>
		),
		cell: (info) => (
			<span className="text-xs font-bold uppercase text-text-secondary">{info.getValue()}</span>
		),
	}),
	columnHelper.accessor("entryTime", {
		header: () => (
			<div className="flex items-center gap-2">
				<Calendar size={14} weight="bold" />
				Timeline
			</div>
		),
		cell: (info) => {
			const entry = info.getValue();
			const exit = info.row.original.exitTime;
			return (
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
						<span className="opacity-40 font-black">IN</span>
						{format(new Date(entry), "MMM d, HH:mm")}
					</div>
					{exit ? (
						<div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
							<span className="opacity-40 font-black">OUT</span>
							{format(new Date(exit), "MMM d, HH:mm")}
						</div>
					) : (
						<span className="text-[9px] font-black uppercase tracking-widest text-success animate-pulse">
							Active Now
						</span>
					)}
				</div>
			);
		},
	}),
	columnHelper.accessor("durationHours", {
		header: () => (
			<div className="flex items-center gap-2">
				<Clock size={14} weight="bold" />
				Duration
			</div>
		),
		cell: (info) => (
			<span className="text-xs font-bold text-text-primary whitespace-nowrap">
				{formatLongDuration(info.row.original.entryTime, info.row.original.exitTime)}
			</span>
		),
	}),
	columnHelper.accessor("totalCost", {
		header: () => (
			<div className="flex items-center gap-2">
				<CurrencyDollar size={14} weight="bold" />
				Total
			</div>
		),
		cell: (info) => (
			<span className="font-mono text-sm font-black text-text-primary">
				{info.getValue() ? formatIDR(info.getValue()!) : formatIDR(0)}
			</span>
		),
	}),
	columnHelper.accessor("status", {
		header: () => (
			<div className="flex items-center gap-2">
				<Tag size={14} weight="bold" />
				Status
			</div>
		),
		cell: (info) => (
			<span
				className={cn(
					"inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
					info.getValue() === "exited"
						? "bg-secondary/10 text-secondary ring-secondary/20"
						: "bg-success/10 text-success ring-success/20",
				)}
			>
				{info.getValue()}
			</span>
		),
	}),
	columnHelper.display({
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: (info) => (
			<HistoryActions
				transaction={info.row.original}
				onViewReceipt={(tx) => {
					const meta = info.table.options.meta as {
						onViewReceipt: (tx: HistoryTransaction) => void;
					};
					meta?.onViewReceipt(tx);
				}}
			/>
		),
	}),
];

const HistoryActions = ({
	transaction,
	onViewReceipt,
}: {
	transaction: HistoryTransaction;
	onViewReceipt: (tx: HistoryTransaction) => void;
}) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				await deleteTransaction(transaction.id.toString());
				setIsDeleteDialogOpen(false);
			} catch (err) {
				console.error("Delete failed", err);
			}
		});
	};

	return (
		<div className="flex justify-end gap-2">
			{transaction.status === "exited" && (
				<button
					onClick={() => onViewReceipt(transaction)}
					className={cn(
						"flex size-8 items-center justify-center rounded-lg border transition-all active:scale-95",
						"border-border bg-surface text-text-secondary hover:bg-surface-elevated hover:text-primary",
					)}
					title="View Receipt"
					aria-label="View receipt"
				>
					<Receipt size={16} weight="bold" />
				</button>
			)}
			<button
				onClick={() => setIsDeleteDialogOpen(true)}
				className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-error/5 hover:text-error active:scale-95"
				title="Delete Transaction"
			>
				<Trash size={16} weight="bold" />
			</button>
			{/* Delete Alert */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl text-danger uppercase tracking-tight">
							Irreversible Deletion
						</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to purge transaction{" "}
							<span className="font-mono font-bold text-text-primary">
								{transaction.transactionNumber}
							</span>{" "}
							from the registry. This action is terminal and cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-8 flex sm:flex-row flex-col gap-3">
						<AlertDialogCancel className="w-full sm:flex-1 rounded-xl bg-surface border-2 border-border h-14 text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-surface-elevated active:scale-95 m-0">
							Abort
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="w-full sm:flex-1 rounded-xl bg-danger h-14 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-danger/20 transition-all hover:bg-danger/90 active:scale-95 disabled:opacity-50 m-0 border-none"
						>
							{isPending ? "Purging..." : "Confirm Purge"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

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
							onChange={(e) => setGlobalFilter(e.target.value)}
							className="w-full rounded-button border border-border bg-surface pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
						/>
					</div>
				</div>
				<div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border pt-4 lg:border-0 lg:pt-0">
					<div className="flex flex-col items-start lg:items-end">
						<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Archived Sessions
						</span>
						<span className="text-lg font-black tracking-tighter text-text-primary">
							{table.getFilteredRowModel().rows.length}
						</span>
					</div>
				</div>
			</div>

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

				{/* Pagination */}
				{table.getPageCount() > 1 && (
					<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
						<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/50">
							Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.previousPage()}
								className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30 shadow-sm"
								aria-label="Previous page"
							>
								<CaretLeft size={14} weight="bold" />
							</button>
							<button
								type="button"
								disabled={!table.getCanNextPage()}
								onClick={() => table.nextPage()}
								className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90 disabled:opacity-30 shadow-sm"
								aria-label="Next page"
							>
								<CaretRight size={14} weight="bold" />
							</button>
						</div>
					</div>
				)}
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
