"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	PencilSimple,
	ToggleLeft,
	ToggleRight,
	MagnifyingGlass,
	User,
	IdentificationBadge,
	CaretLeft,
	CaretRight,
	ChartLineUp,
	Calendar,
	Trash,
	ArrowsClockwise,
	CaretUp,
	CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { toggleProfileActive, deleteProfile } from "@/src/actions/profiles";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
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

interface Profile {
	id: string;
	fullName: string;
	role: "admin" | "employee" | "owner";
	isActive: boolean;
	createdAt: Date;
}

const columnHelper = createColumnHelper<Profile>();

const ROLE_COLORS: Record<string, string> = {
	admin: "bg-danger/10 text-danger ring-danger/20",
	employee: "bg-primary/10 text-primary ring-primary/20",
	owner: "bg-secondary/10 text-secondary ring-secondary/20",
};

interface RowActionsProps {
	profile: Profile;
	currentUser?: { id: string; role: string };
}

const RowActions = ({ profile, currentUser }: RowActionsProps) => {
	const [isPending, startTransition] = useTransition();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const isAdmin = currentUser?.role === "admin";
	const isSelf = currentUser?.id === profile.id;
	const canManage = isAdmin && !isSelf;

	const handleToggle = useCallback(() => {
		if (!canManage) return;
		startTransition(async () => {
			await toggleProfileActive(profile.id, !profile.isActive);
		});
	}, [profile.id, profile.isActive, canManage]);

	const handleDelete = useCallback(() => {
		if (!canManage) return;
		startTransition(async () => {
			try {
				await deleteProfile(profile.id);
				setIsDeleteDialogOpen(false);
			} catch (err) {
				console.error("Delete failed", err);
			}
		});
	}, [profile.id, canManage]);

	return (
		<div className="flex items-center justify-end gap-1">
			{isAdmin && (
				<Link
					href={`/dashboard/users/${profile.id}`}
					className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
					aria-label={`Edit ${profile.fullName}`}
				>
					<PencilSimple size={18} weight="duotone" />
				</Link>
			)}
			<button
				type="button"
				onClick={handleToggle}
				disabled={isPending || !canManage}
				className={cn(
					"flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary active:scale-90",
					(isPending || !canManage) && "opacity-30 cursor-not-allowed",
				)}
				title={isSelf ? "Self-deactivation restricted" : !isAdmin ? "Admin access required" : ""}
				aria-label={`${profile.isActive ? "Deactivate" : "Activate"} ${profile.fullName}`}
			>
				{profile.isActive ? (
					<ToggleRight size={24} weight="fill" className="text-success" />
				) : (
					<ToggleLeft size={24} className="text-text-secondary/40" />
				)}
			</button>
			<button
				type="button"
				onClick={() => setIsDeleteDialogOpen(true)}
				disabled={isPending || !canManage}
				className={cn(
					"flex size-9 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-danger/10 hover:text-danger active:scale-90",
					(isPending || !canManage) && "opacity-30 cursor-not-allowed",
				)}
				title={isSelf ? "Self-deletion restricted" : !isAdmin ? "Admin access required" : ""}
				aria-label={`Delete ${profile.fullName}`}
			>
				<Trash size={18} weight="duotone" />
			</button>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl text-danger uppercase tracking-tight font-black">
							Security Protocol: Decommission
						</AlertDialogTitle>
						<AlertDialogDescription className="text-sm font-medium leading-relaxed">
							You are about to terminate all system access for{" "}
							<span className="font-black text-text-primary uppercase tracking-tighter">
								{profile.fullName}
							</span>
							. This action will immediately void their credentials and is terminal.
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
							{isPending ? (
								<ArrowsClockwise size={20} weight="bold" className="animate-spin" />
							) : (
								"Confirm Decommission"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export const UsersTable = ({
	data,
	currentUser,
}: {
	data: Profile[];
	currentUser?: { id: string; role: string };
}) => {
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("fullName").withOptions({ shallow: false }),
	);
	const [order, setOrder] = useQueryState(
		"order",
		parseAsString.withDefault("asc").withOptions({ shallow: false }),
	);
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1).withOptions({ shallow: false }),
	);
	const [isPending] = useTransition();

	const toggleSort = (field: string) => {
		if (sort === field) {
			setOrder(order === "asc" ? "desc" : "asc");
		} else {
			setSort(field);
			setOrder("asc");
		}
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor("fullName", {
				header: () => (
					<div className="flex items-center gap-2">
						<User size={14} weight="bold" />
						Name
					</div>
				),
				cell: (info) => (
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-full bg-surface-elevated font-bold text-text-secondary ring-1 ring-border">
							{info.getValue().charAt(0).toUpperCase()}
						</div>
						<span className="font-bold text-text-primary tracking-tight">{info.getValue()}</span>
					</div>
				),
			}),
			columnHelper.accessor("role", {
				header: () => (
					<div className="flex items-center gap-2">
						<IdentificationBadge size={14} weight="bold" />
						Role
					</div>
				),
				cell: (info) => (
					<span
						className={cn(
							"inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
							ROLE_COLORS[info.getValue()] || "bg-secondary/10 text-secondary",
						)}
					>
						{info.getValue()}
					</span>
				),
			}),
			columnHelper.accessor("isActive", {
				header: () => (
					<div className="flex items-center gap-2">
						<ChartLineUp size={14} weight="bold" />
						Status
					</div>
				),
				cell: (info) => (
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"size-1.5 rounded-full",
								info.getValue() ? "bg-success animate-pulse" : "bg-text-secondary/30",
							)}
						/>
						<span
							className={cn(
								"text-xs font-bold uppercase tracking-tight",
								info.getValue() ? "text-success" : "text-text-secondary/60",
							)}
						>
							{info.getValue() ? "Active" : "Offline"}
						</span>
					</div>
				),
			}),
			columnHelper.accessor("createdAt", {
				header: () => (
					<div className="flex items-center gap-2">
						<Calendar size={14} weight="bold" />
						Joined
					</div>
				),
				cell: (info) => (
					<div className="flex flex-col">
						<span className="text-xs font-bold text-text-primary">
							{new Date(info.getValue()).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
						<span className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-tighter">
							SYSTEM AGENT
						</span>
					</div>
				),
			}),
			columnHelper.display({
				id: "actions",
				header: () => <div className="text-right">Actions</div>,
				cell: (info) => <RowActions profile={info.row.original} currentUser={currentUser} />,
			}),
		],
		[currentUser],
	);

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
			{/* Search & Header */}
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
							placeholder="SCAN PERSONNEL DIRECTORY..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-10 w-full rounded-button border border-border bg-surface pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
						/>
					</div>
				</div>
				<div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border pt-4 lg:border-0 lg:pt-0">
					<div className="flex flex-col items-start lg:items-end">
						<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
							Personnel Count
						</span>
						<span className="text-lg font-black tracking-tighter text-text-primary">
							{data.length}
						</span>
					</div>
					<div className="h-8 w-px bg-border hidden sm:block" />
					<div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
						<ArrowsClockwise size={12} className={cn(isPending && "animate-spin")} />
					</div>
				</div>
			</div>

			{/* Table Container */}
			<motion.div
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
										const columnDef = header.column.columnDef as { accessorKey?: string };
										const sortField = columnDef.accessorKey;
										const isAction = header.id === "actions";
										const canSort = !!sortField && !isAction;

										return (
											<th
												key={header.id}
												onClick={canSort ? () => toggleSort(sortField) : undefined}
												className={cn(
													"px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 hover:text-text-primary transition-colors select-none",
													canSort && "cursor-pointer",
												)}
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
						<motion.tbody
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
										No personnel matching your search
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<motion.tr
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
									</motion.tr>
								))
							)}
						</motion.tbody>
					</table>
				</div>

				{/* Pagination */}
				{table.getPageCount() > 1 && (
					<div className="flex items-center justify-between border-t border-border bg-surface-elevated/30 px-(--space-md) py-3">
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
								disabled={!table.getCanPreviousPage()}
								className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90"
							>
								<CaretLeft size={16} weight="bold" />
							</button>
							<button
								type="button"
								onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
								disabled={!table.getCanNextPage()}
								className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-all hover:bg-surface-elevated disabled:opacity-30 active:scale-90"
							>
								<CaretRight size={16} weight="bold" />
							</button>
						</div>
					</div>
				)}
			</motion.div>
		</div>
	);
};
