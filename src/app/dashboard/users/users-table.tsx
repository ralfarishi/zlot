"use client";

import { useMemo, useTransition } from "react";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { m } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Profile } from "./_components/types";
import { createColumns } from "./_components/UserColumns";
import { UserToolbar } from "./_components/UserToolbar";
import { UserPagination } from "./_components/UserPagination";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import { useLocale } from "@/src/components/providers/locale-provider";

export const UsersTable = ({
	data,
	currentUser,
}: {
	data: Profile[];
	currentUser?: { id: string; role: string };
}) => {
	const { t, locale } = useLocale();
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("namaLengkap").withOptions({ shallow: false }),
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

	const columns = useMemo(() => createColumns(currentUser, t, locale), [currentUser, t, locale]);

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
			<UserToolbar
				search={search}
				onSearchChange={setSearch}
				count={data.length}
				isPending={isPending}
			/>

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
										{t("users.noPersonnel")}
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

				<UserPagination table={table} onPageChange={handlePageChange} />
			</m.div>
		</div>
	);
};
