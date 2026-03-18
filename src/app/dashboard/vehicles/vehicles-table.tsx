"use client";

import {
	IdentificationCard,
	Car,
	Palette,
	UserCircle,
	MagnifyingGlass,
	CaretLeft,
	CaretRight,
	CaretUp,
	CaretDown,
	PencilSimple,
	ArrowsClockwise,
	Trash,
} from "@phosphor-icons/react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useState, useTransition, useMemo } from "react";
import { updateVehicle, deleteVehicle } from "@/src/actions/vehicles";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useLocale } from "@/src/components/providers/locale-provider";
import { type TranslationKey } from "@/src/lib/i18n/en";

interface Vehicle {
	id: string;
	platNomor: string;
	jenisKendaraan: string;
	warna: string | null;
	namaPemilik: string | null;
	createdAt: Date;
}

const VEHICLE_COLORS: Record<string, string> = {
	motor: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
	mobil: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
	lainnya: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
};

const columnHelper = createColumnHelper<Vehicle>();

const createColumns = (t: (key: TranslationKey) => string) => [
	columnHelper.accessor("platNomor", {
		header: () => (
			<div className="flex items-center gap-2">
				<IdentificationCard size={14} weight="bold" />
				{t("vehicles.plateNumber")}
			</div>
		),
		cell: (info) => (
			<span className="font-mono text-base font-black tracking-widest text-text-primary">
				{info.getValue().toUpperCase()}
			</span>
		),
	}),
	columnHelper.accessor("jenisKendaraan", {
		header: () => (
			<div className="flex items-center gap-2">
				<Car size={14} weight="bold" />
				{t("vehicles.type")}
			</div>
		),
		cell: (info) => {
			const val = info.getValue();
			const label =
				val === "motor"
					? t("vehicles.motorcycle")
					: val === "mobil"
						? t("vehicles.car")
						: val === "lainnya"
							? t("vehicles.other")
							: val;

			return (
				<span
					className={cn(
						"inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
						VEHICLE_COLORS[val] || "bg-secondary/10 text-secondary ring-secondary/20",
					)}
				>
					{label}
				</span>
			);
		},
	}),
	columnHelper.accessor("warna", {
		header: () => (
			<div className="flex items-center gap-2">
				<Palette size={14} weight="bold" />
				{t("vehicles.aesthetic")}
			</div>
		),
		cell: (info) => {
			const value = info.getValue();
			const isHex = value?.startsWith("#");

			if (!isHex) {
				return (
					<span className="text-xs font-bold uppercase tracking-tight text-text-secondary">
						{value ?? "---"}
					</span>
				);
			}

			return (
				<div
					className="h-5 w-15 rounded-lg ring-1 ring-inset ring-black/10 shadow-sm border border-white/10"
					style={{ backgroundColor: value || undefined }}
					title={value || ""}
				/>
			);
		},
	}),
	columnHelper.accessor("namaPemilik", {
		header: () => (
			<div className="flex items-center gap-2">
				<UserCircle size={14} weight="bold" />
				{t("vehicles.affiliation")}
			</div>
		),
		cell: (info) => (
			<span className="text-sm font-bold text-text-primary tracking-tight">
				{info.getValue() ?? t("vehicles.guestUnit")}
			</span>
		),
	}),
	columnHelper.display({
		id: "actions",
		header: () => (
			<div className="flex items-center justify-end gap-2">{t("vehicles.actions")}</div>
		),
		cell: (info) => (
			<div className="flex justify-end">
				<VehicleRowActions vehicle={info.row.original} />
			</div>
		),
	}),
];

const VehicleRowActions = ({ vehicle }: { vehicle: Vehicle }) => {
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [color, setColor] = useState(vehicle.warna || "");
	const [ownerName, setOwnerName] = useState(vehicle.namaPemilik || "");
	const { t } = useLocale();

	const handleUpdate = () => {
		startTransition(async () => {
			try {
				await updateVehicle(vehicle.id, { warna: color, namaPemilik: ownerName });
				setIsEditOpen(false);
			} catch (err) {
				console.error("Update failed", err);
			}
		});
	};

	const handleDelete = () => {
		startTransition(async () => {
			try {
				await deleteVehicle(vehicle.id.toString());
				setIsDeleteOpen(false);
			} catch (err) {
				console.error("Delete failed", err);
			}
		});
	};

	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => setIsEditOpen(true)}
				className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-primary/5 hover:text-primary active:scale-95 shadow-sm"
				title="Edit Vehicle"
			>
				<PencilSimple size={16} weight="bold" />
			</button>

			<button
				onClick={() => setIsDeleteOpen(true)}
				className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-danger/5 hover:text-danger active:scale-95 shadow-sm"
				title="De-register Vehicle"
			>
				<Trash size={16} weight="bold" />
			</button>

			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className="w-[94vw] sm:max-w-md rounded-2xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
							<div className="p-2 rounded-lg bg-primary/10 text-primary">
								<Car size={20} weight="bold" />
							</div>
							{t("vehicles.registryCalibration")}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="flex flex-col gap-2">
							<Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
								{t("vehicles.registryId")}
							</Label>
							<div className="rounded-2xl bg-surface-elevated p-5 border border-border shadow-inner ring-1 ring-border/50">
								<p className="font-mono text-3xl font-black text-text-primary tracking-[0.2em]">
									{vehicle.platNomor.toUpperCase()}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/20">
										{vehicle.jenisKendaraan}
									</span>
									<span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-tighter">
										DATABASE_ENTRY_{vehicle.id.toString().slice(-4)}
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-5">
							<div className="space-y-2">
								<Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
									{t("vehicles.visualAesthetic")}
								</Label>
								<div className="flex gap-3">
									<div className="relative group/color shrink-0">
										<div
											className="size-12 rounded-xl border-2 border-border shadow-sm transition-all group-hover/color:scale-105 ring-1 ring-black/5"
											style={{
												backgroundColor: color?.startsWith("#") ? color : "#000000",
											}}
										/>
										<input
											type="color"
											value={color?.startsWith("#") ? color : "#000000"}
											onChange={(e) => setColor(e.target.value.toUpperCase())}
											className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
										/>
									</div>
									<Input
										value={color}
										onChange={(e) => setColor(e.target.value.toUpperCase())}
										placeholder="#000000"
										className="h-12 flex-1 rounded-xl border-2 font-bold focus:border-primary transition-all bg-surface-elevated/30 font-mono tracking-widest uppercase"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
									{t("vehicles.affiliationOwner")}
								</Label>
								<Input
									value={ownerName}
									onChange={(e) => setOwnerName(e.target.value)}
									placeholder="e.g. STERLING CORP"
									className="h-12 rounded-xl border-2 font-bold focus:border-primary transition-all bg-surface-elevated/30"
								/>
							</div>
						</div>
					</div>

					<DialogFooter className="flex-row gap-2 sm:gap-2">
						<Button
							variant="outline"
							onClick={() => setIsEditOpen(false)}
							className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 border-2"
						>
							{t("vehicles.abort")}
						</Button>
						<Button
							onClick={handleUpdate}
							disabled={isPending}
							className="flex-1 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20 text-text-inverse"
						>
							{isPending ? (
								<ArrowsClockwise className="animate-spin" size={16} weight="bold" />
							) : (
								t("vehicles.syncRegistry")
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="w-[94vw] sm:max-w-md rounded-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-danger flex items-center gap-2">
							<div className="p-2 rounded-lg bg-danger/10 text-danger">
								<Trash size={20} weight="bold" />
							</div>
							{t("vehicles.deregister")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-sm font-bold text-text-secondary leading-relaxed pt-2">
							{t("vehicles.deregisterDesc")}{" "}
							<span className="font-mono font-black text-text-primary underline decoration-danger/30">
								{vehicle.platNomor}
							</span>{" "}
							{t("vehicles.deregisterDesc2")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-row gap-2 mt-4 sm:gap-2">
						<AlertDialogCancel className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 border-2 m-0 bg-surface">
							{t("vehicles.retainRecord")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isPending}
							className="flex-1 rounded-xl bg-danger hover:bg-danger/90 font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-danger/20 border-none m-0 text-white"
						>
							{isPending ? t("vehicles.purging") : t("vehicles.confirmPurge")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export const VehiclesTable = ({ data }: { data: Vehicle[] }) => {
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [type, setType] = useQueryState(
		"type",
		parseAsString.withDefault("all").withOptions({ shallow: false }),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("platNomor").withOptions({ shallow: false }),
	);
	const [order, setOrder] = useQueryState(
		"order",
		parseAsString.withDefault("asc").withOptions({ shallow: false }),
	);
	const { t } = useLocale();
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false }),
	);

	const columns = useMemo(() => createColumns(t), [t]);

	const toggleSort = (field: string) => {
		if (sort === field) {
			setOrder(order === "asc" ? "desc" : "asc");
		} else {
			setSort(field);
			setOrder("asc");
		}
	};

	const table = useReactTable({
		data,
		columns,
		state: {
			pagination: { pageIndex: page - 1, pageSize: 15 },
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: false,
	});

	const handlePageChange = (index: number) => {
		setPage(index + 1);
	};

	return (
		<div className="space-y-(--space-md)">
			{/* Search & Stats */}
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
							placeholder={t("vehicles.searchPlaceholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-10 w-full rounded-button border border-border bg-surface pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
						/>
					</div>
					<div className="flex items-center justify-between rounded-button border border-border bg-surface p-1">
						{[
							{ id: "all", label: t("vehicles.all") },
							{ id: "mobil", label: t("vehicles.car") },
							{ id: "motor", label: t("vehicles.motorcycle") },
							{ id: "lainnya", label: t("vehicles.other") },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setType(tab.id)}
								className={cn(
									"flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all",
									type === tab.id
										? "bg-primary text-text-inverse shadow-sm"
										: "text-text-secondary hover:text-text-primary",
								)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
				<div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border pt-4 lg:border-0 lg:pt-0">
					<div className="flex flex-col items-start lg:items-end">
						<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							{t("vehicles.registrySize")}
						</span>
						<span className="text-lg font-black tracking-tighter text-text-primary">
							{data.length}
						</span>
					</div>
				</div>
			</div>

			{/* Table Container */}
			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card backdrop-blur-sm"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id} className="border-b border-border bg-surface-elevated/50">
									{headerGroup.headers.map((header) => {
										const sortField = (header.column.columnDef as { accessorKey?: string })
											.accessorKey;
										const canSort = !!sortField;

										return (
											<th
												key={header.id}
												onClick={canSort && sortField ? () => toggleSort(sortField) : undefined}
												className={cn(
													"px-(--space-md) py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 hover:text-text-primary transition-colors select-none",
													canSort && "cursor-pointer",
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
										{t("vehicles.noVehicles")}
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

				{/* Pagination */}
				{table.getPageCount() > 1 && (
					<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
						<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
							{t("vehicles.fleetPartition")} {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
						</div>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
								disabled={!table.getCanPreviousPage()}
								className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90 shadow-sm"
							>
								<CaretLeft size={16} weight="bold" />
							</button>
							<button
								type="button"
								onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
								disabled={!table.getCanNextPage()}
								className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90 shadow-sm"
							>
								<CaretRight size={16} weight="bold" />
							</button>
						</div>
					</div>
				)}
			</m.div>
		</div>
	);
};
