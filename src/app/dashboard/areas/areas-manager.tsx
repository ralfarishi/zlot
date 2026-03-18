"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	PencilSimple,
	Trash,
	X,
	Check,
	Plus,
	MapPin,
	MagnifyingGlass,
	ArrowsClockwise,
	CaretUp,
	CaretDown,
} from "@phosphor-icons/react";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { deleteArea, updateArea, createArea } from "@/src/actions/parking-areas";
import { useQueryState, parseAsString } from "nuqs";
import { useLocale } from "@/src/components/providers/locale-provider";
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

interface Area {
	id: string;
	namaArea: string;
	kapasitas: number;
	terisi: number;
}

const columnHelper = createColumnHelper<Area>();

export const AreasManager = ({ data }: { data: Area[] }) => {
	const router = useRouter();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [editData, setEditData] = useState({ namaArea: "", kapasitas: "" });
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const { t } = useLocale();

	// nuqs state
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("namaArea").withOptions({ shallow: false }),
	);
	const [order, setOrder] = useQueryState(
		"order",
		parseAsString.withDefault("asc").withOptions({ shallow: false }),
	);

	const toggleSort = (field: string) => {
		if (sort === field) {
			setOrder(order === "asc" ? "desc" : "asc");
		} else {
			setSort(field);
			setOrder("asc");
		}
	};

	const handleEdit = useCallback((area: Area) => {
		setEditData({ namaArea: area.namaArea, kapasitas: area.kapasitas.toString() });
		setEditingId(area.id);
	}, []);

	const handleSave = useCallback(
		async (id: string) => {
			const capacityNum = parseInt(editData.kapasitas);
			if (!editData.namaArea || isNaN(capacityNum)) return;

			startTransition(async () => {
				await updateArea(id, {
					namaArea: editData.namaArea,
					kapasitas: capacityNum,
				});
				setEditingId(null);
				router.refresh();
			});
		},
		[editData, router],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			startTransition(async () => {
				await deleteArea(parseInt(id));
				setDeleteId(null);
				router.refresh();
			});
		},
		[router],
	);

	const handleAdd = useCallback(async () => {
		const capacityNum = parseInt(editData.kapasitas);
		if (!editData.namaArea || isNaN(capacityNum)) return;

		startTransition(async () => {
			await createArea({
				namaArea: editData.namaArea,
				kapasitas: capacityNum,
				terisi: 0,
			});
			setIsAdding(false);
			setEditData({ namaArea: "", kapasitas: "" });
			router.refresh();
		});
	}, [editData, router]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("namaArea", {
				header: t("areas.areaName"),
				cell: (info) => {
					const area = info.row.original;
					const isEditing = editingId === area.id;

					if (isEditing) {
						return (
							<input
								type="text"
								value={editData.namaArea}
								onChange={(e) => setEditData((d) => ({ ...d, namaArea: e.target.value }))}
								className="w-full rounded-button border border-primary bg-surface-elevated px-2 py-1 text-sm outline-none shadow-sm shadow-primary/10"
							/>
						);
					}

					return (
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
								<MapPin size={16} weight="fill" />
							</div>
							<span className="font-bold text-text-primary">{info.getValue()}</span>
						</div>
					);
				},
			}),
			columnHelper.accessor("kapasitas", {
				header: t("areas.capacity"),
				cell: (info) => {
					const area = info.row.original;
					const isEditing = editingId === area.id;

					if (isEditing) {
						return (
							<input
								type="number"
								value={editData.kapasitas}
								onChange={(e) => setEditData((d) => ({ ...d, kapasitas: e.target.value }))}
								className="w-20 rounded-button border border-primary bg-surface-elevated px-2 py-1 text-sm outline-none shadow-sm shadow-primary/10 font-bold"
							/>
						);
					}

					return <span className="font-mono font-bold text-text-secondary">{info.getValue()}</span>;
				},
			}),
			columnHelper.accessor("terisi", {
				header: t("areas.occupancy"),
				cell: (info) => {
					const occupied = info.getValue();
					const total = info.row.original.kapasitas;
					const percentage = total > 0 ? (occupied / total) * 100 : 0;

					return (
						<div className="flex w-full max-w-xs flex-col gap-1.5">
							<div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-tight">
								<span>
									{occupied} / {total} spots
								</span>
								<span>{Math.round(percentage)}%</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
								<m.div
									initial={{ width: 0 }}
									animate={{ width: `${percentage}%` }}
									className={cn(
										"h-full rounded-full transition-colors",
										percentage > 90 ? "bg-danger" : percentage > 70 ? "bg-warning" : "bg-primary",
									)}
								/>
							</div>
						</div>
					);
				},
			}),
			columnHelper.display({
				id: "actions",
				header: () => <div className="text-right">{t("vehicles.actions")}</div>,
				cell: (info) => {
					const area = info.row.original;
					const isEditing = editingId === area.id;

					return (
						<div className="flex items-center justify-end gap-1">
							{isEditing ? (
								<>
									<button
										onClick={() => handleSave(area.id)}
										className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors"
									>
										<Check size={18} weight="bold" />
									</button>
									<button
										onClick={() => setEditingId(null)}
										className="p-1.5 text-text-secondary hover:bg-surface-elevated rounded-lg transition-colors"
									>
										<X size={18} />
									</button>
								</>
							) : (
								<>
									<button
										onClick={() => handleEdit(area)}
										className="p-1.5 text-text-secondary hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
									>
										<PencilSimple size={18} />
									</button>
									<button
										onClick={() => setDeleteId(area.id)}
										className="p-1.5 text-text-secondary hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
									>
										<Trash size={18} />
									</button>
								</>
							)}
						</div>
					);
				},
			}),
		],
		[editingId, editData, handleSave, handleEdit, t],
	);

	// Memoize sorting state to prevent infinite loops
	const sorting = useMemo(
		() => (sort ? [{ id: sort, desc: order === "desc" }] : []),
		[sort, order],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			globalFilter: search,
			sorting,
		},
		onGlobalFilterChange: setSearch,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: "includesString",
	});

	return (
		<div className="space-y-(--space-md)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
				<div>
					<h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
					{t("areas.zoneRegistry")}
				</h3>
				<p className="text-[10px] text-text-secondary uppercase tracking-tight mt-0.5">
					{t("areas.capacityMatrix")}
				</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="relative group">
						<MagnifyingGlass
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors"
						/>
						<input
							type="text"
							placeholder="FILTER BY ZONE..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 w-full sm:w-64 rounded-button border border-border bg-surface pl-9 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
						/>
					</div>
					<button
						onClick={() => setIsAdding(!isAdding)}
						disabled={isPending}
						className="flex h-9 items-center gap-2 rounded-button bg-primary px-4 text-[10px] font-black uppercase tracking-widest text-text-inverse shadow-button transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
					>
						{isAdding ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
					{isAdding ? t("areas.cancel") : t("areas.addZone")}
					</button>
					<div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
						<ArrowsClockwise size={12} className={cn(isPending && "animate-spin")} />
					</div>
				</div>
			</div>

			<AnimatePresence>
				{isAdding && (
					<m.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="overflow-hidden"
					>
						<div className="grid gap-(--space-md) md:grid-cols-3 rounded-card border border-border bg-surface-elevated/30 p-(--space-md) mb-(--space-md)">
							<div className="space-y-1.5">
								<label
									htmlFor="new-area-name"
									className="text-[10px] font-bold uppercase text-text-secondary"
								>
									{t("areas.areaName")}
								</label>
								<input
									id="new-area-name"
									type="text"
									value={editData.namaArea}
									onChange={(e) => setEditData((d) => ({ ...d, namaArea: e.target.value }))}
									placeholder="e.g. Lot A"
									className="w-full rounded-button border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
								/>
							</div>
							<div className="space-y-1.5">
								<label
									htmlFor="new-area-capacity"
									className="text-[10px] font-bold uppercase text-text-secondary"
								>
									{t("areas.capacity")}
								</label>
								<input
									id="new-area-capacity"
									type="number"
									value={editData.kapasitas}
									onChange={(e) => setEditData((d) => ({ ...d, kapasitas: e.target.value }))}
									placeholder="spots"
									className="w-full rounded-button border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
								/>
							</div>
							<div className="flex items-end">
								<button
									onClick={handleAdd}
									className="w-full rounded-button bg-secondary px-3 py-2 text-sm font-bold text-text-inverse shadow-sm hover:opacity-90"
								>
									{t("areas.confirmArea")}
								</button>
							</div>
						</div>
					</m.div>
				)}
			</AnimatePresence>

			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id} className="border-b border-border bg-surface-elevated/50">
									{headerGroup.headers.map((header) => {
										const isAction = header.id === "actions";
										const canSort = header.column.columnDef.header && !isAction;
										const sortField = (header.column.columnDef as { accessorKey?: string })
											.accessorKey;

										return (
											<th
												key={header.id}
												className={cn(
													"px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60",
													canSort && "cursor-pointer hover:text-primary transition-colors",
												)}
												onClick={canSort && sortField ? () => toggleSort(sortField) : undefined}
											>
												<div className="flex items-center gap-2">
													{flexRender(header.column.columnDef.header, header.getContext())}
													{canSort &&
														sort === sortField &&
														(order === "asc" ? <CaretUp size={10} /> : <CaretDown size={10} />)}
												</div>
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<m.tbody
							key={table
								.getRowModel()
								.rows.map((r) => r.id)
								.join()}
							variants={{
								show: { transition: { staggerChildren: 0.05 } },
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
										No parking areas defined yet
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<m.tr
										key={row.id}
										variants={{
											hidden: { opacity: 0, x: -10 },
											show: { opacity: 1, x: 0 },
										}}
										className="group border-b border-border transition-colors last:border-0 hover:bg-primary/2"
									>
										{row.getVisibleCells().map((cell) => (
											<td key={cell.id} className="px-(--space-md) py-4">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</m.tr>
								))
							)}
						</m.tbody>
					</table>
				</div>
			</m.div>

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("areas.deleteTitle")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("areas.deleteDesc")}
					</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>{t("areas.deleteCancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								if (deleteId) handleDelete(deleteId);
							}}
							className="bg-danger text-text-inverse hover:bg-danger/90"
							disabled={isPending}
						>
							{isPending ? t("areas.deleting") : t("areas.deleteZone")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
