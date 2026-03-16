"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
	IdentificationCard,
	MapPin,
	Calendar,
	Clock,
	CurrencyDollar,
	Tag,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { cn, formatIDR, formatLongDuration } from "@/src/lib/utils";
import { HistoryTransaction } from "./types";
import { HistoryActions } from "./HistoryActions";

const columnHelper = createColumnHelper<HistoryTransaction>();

export const columns = [
	columnHelper.accessor("nomorTransaksi", {
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
					{info.row.original.kendaraan.platNomor.replaceAll(" ", "")}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("area.namaArea", {
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
	columnHelper.accessor("waktuMasuk", {
		header: () => (
			<div className="flex items-center gap-2">
				<Calendar size={14} weight="bold" />
				Timeline
			</div>
		),
		cell: (info) => {
			const entry = info.getValue();
			const exit = info.row.original.waktuKeluar;
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
	columnHelper.accessor("durasiJam", {
		header: () => (
			<div className="flex items-center gap-2">
				<Clock size={14} weight="bold" />
				Duration
			</div>
		),
		cell: (info) => (
			<span className="text-xs font-bold text-text-primary whitespace-nowrap">
				{formatLongDuration(info.row.original.waktuMasuk, info.row.original.waktuKeluar)}
			</span>
		),
	}),
	columnHelper.accessor("totalBiaya", {
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
					info.getValue() === "keluar"
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
