"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	PencilSimple,
	Trash,
	Check,
	X,
	Timer,
	Coin,
	Calendar,
	ArrowsClockwise,
	MagnifyingGlass,
	CaretUp,
	CaretDown,
} from "@phosphor-icons/react";
import { updateRate, deleteRate } from "@/src/actions/rates";
import { m, AnimatePresence } from "framer-motion";
import { cn, formatIDR } from "@/lib/utils";
import { useQueryState, parseAsString } from "nuqs";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Warning } from "@phosphor-icons/react";
import { useLocale } from "@/src/components/providers/locale-provider";

interface Rate {
	id: string;
	jenisKendaraan: string;
	tarifPerJam: string;
	updatedAt: Date;
}

const VEHICLE_COLORS: Record<string, string> = {
	motor: "bg-blue-500/10 text-blue-500",
	mobil: "bg-emerald-500/10 text-emerald-500",
	lainnya: "bg-amber-500/10 text-amber-500",
};

export const RatesManager = ({ data }: { data: Rate[] }) => {
	const router = useRouter();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");
	const [isPending, startTransition] = useTransition();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const { t, locale } = useLocale();

	// nuqs state
	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 300 }),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("jenisKendaraan").withOptions({ shallow: false }),
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

	const startEdit = useCallback((rate: Rate) => {
		setEditingId(rate.id);
		setEditValue(rate.tarifPerJam);
	}, []);

	const cancelEdit = useCallback(() => {
		setEditingId(null);
		setEditValue("");
	}, []);

	const saveEdit = useCallback(
		(id: string) => {
			const val = parseFloat(editValue);
			if (isNaN(val) || val < 0) return;

			startTransition(async () => {
				await updateRate(id, { tarifPerJam: editValue });
				setEditingId(null);
				router.refresh();
			});
		},
		[editValue, router],
	);

	const handleDelete = (id: string) => {
		startTransition(async () => {
			try {
				const res = await deleteRate(Number(id));
				if (typeof res === "object" && res && "success" in res && !res.success) {
					if (res.error === "REFERENCE_EXISTS") {
						setIsAlertOpen(true);
					}
				} else {
					router.refresh();
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "";
				if (message.includes("referenced") || message.includes("23503")) {
					setIsAlertOpen(true);
				}
			}
		});
	};

	return (
		<div className="space-y-(--space-md)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
				<div>
					<h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
						{t("rates.registryDelta")}
					</h3>
					<p className="text-[10px] text-text-secondary uppercase tracking-tight mt-0.5">
						{t("rates.pricingMatrix")}
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
							placeholder={t("rates.filterPlaceholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 w-full sm:w-64 rounded-button border border-border bg-surface pl-9 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
						/>
					</div>
					<div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
						<ArrowsClockwise size={12} className={cn(isPending && "animate-spin")} />
						{isPending ? t("rates.syncing") : t("rates.matrixValid")}
					</div>
				</div>
			</div>

			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="overflow-hidden rounded-card border border-border bg-surface shadow-card backdrop-blur-sm"
			>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-surface-elevated/50">
								<th
									className="px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 cursor-pointer hover:text-primary transition-colors"
									onClick={() => toggleSort("jenisKendaraan")}
								>
									<div className="flex items-center gap-2">
										<Timer size={14} weight="bold" />
										{t("rates.vehicleCategory")}
										{sort === "jenisKendaraan" &&
											(order === "asc" ? <CaretUp size={10} /> : <CaretDown size={10} />)}
									</div>
								</th>
								<th
									className="px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 cursor-pointer hover:text-primary transition-colors"
									onClick={() => toggleSort("tarifPerJam")}
								>
									<div className="flex items-center gap-2">
										<Coin size={14} weight="bold" />
										{t("rates.hourlyRate")}
										{sort === "tarifPerJam" &&
											(order === "asc" ? <CaretUp size={10} /> : <CaretDown size={10} />)}
									</div>
								</th>
								<th
									className="px-(--space-md) py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 cursor-pointer hover:text-primary transition-colors"
									onClick={() => toggleSort("updatedAt")}
								>
									<div className="flex items-center gap-2">
										<Calendar size={14} weight="bold" />
										{t("rates.lastMutation")}
										{sort === "updatedAt" &&
											(order === "asc" ? <CaretUp size={10} /> : <CaretDown size={10} />)}
									</div>
								</th>
								<th className="px-(--space-md) py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
								{t("rates.protocol")}</th>
							</tr>
						</thead>
						<m.tbody
							key={data.map((d) => d.id).join()}
							variants={{
								show: { transition: { staggerChildren: 0.05 } },
							}}
							initial="hidden"
							animate="show"
						>
							{data.length === 0 ? (
								<tr className="border-t border-border">
									<td
										colSpan={4}
										className="px-(--space-md) py-(--space-2xl) text-center text-sm text-text-secondary italic"
									>
										{t("rates.noRates")}</td>
								</tr>
							) : (
								data.map((rate) => (
									<m.tr
										key={rate.id}
										variants={{
											hidden: { opacity: 0, x: -10 },
											show: { opacity: 1, x: 0 },
										}}
										className="group border-b border-border transition-colors last:border-0 hover:bg-primary/2"
									>
										<td className="px-(--space-md) py-4">
											<span
												className={cn(
													"inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ring-current/20",
													VEHICLE_COLORS[rate.jenisKendaraan] || "bg-secondary/10 text-secondary",
												)}
											>
												{rate.jenisKendaraan === "motor"
													? t("rates.motorcycle")
													: rate.jenisKendaraan === "mobil"
													? t("rates.car")
													: t("rates.other")}
											</span>
										</td>
										<td className="px-(--space-md) py-4">
											{editingId === rate.id ? (
												<div className="flex items-center gap-2">
													<m.input
														initial={{ width: 80, opacity: 0 }}
														animate={{ width: 120, opacity: 1 }}
														type="number"
														step="0.01"
														min="0"
														value={editValue}
														onChange={(e) => setEditValue(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === "Enter") saveEdit(rate.id);
															if (e.key === "Escape") cancelEdit();
														}}
														className="rounded-button border border-primary bg-surface-elevated px-3 py-1.5 font-mono text-sm font-bold outline-none shadow-sm shadow-primary/10"
													/>
												</div>
											) : (
												<span className="font-mono text-lg font-black tracking-tighter text-text-primary">
													{formatIDR(rate.tarifPerJam)}
												</span>
											)}
										</td>
										<td className="px-(--space-md) py-4 text-text-secondary">
											<div className="flex flex-col">
												<span className="text-xs font-medium text-text-primary">
													{new Date(rate.updatedAt).toLocaleDateString(
														locale === "id" ? "id-ID" : "en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)}
												</span>
												<span className="text-[10px] text-text-secondary/60 font-bold uppercase tracking-tighter">
													{new Date(rate.updatedAt).toLocaleTimeString(
														locale === "id" ? "id-ID" : "en-US",
														{
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
												</span>
											</div>
										</td>
										<td className="px-(--space-md) py-4">
											<div className="flex items-center justify-end gap-1">
												<AnimatePresence mode="wait">
													{editingId === rate.id ? (
														<m.div
															key="editing"
															initial={{ opacity: 0, scale: 0.8 }}
															animate={{ opacity: 1, scale: 1 }}
															exit={{ opacity: 0, scale: 0.8 }}
															className="flex items-center gap-1"
														>
															<button
																type="button"
																onClick={() => saveEdit(rate.id)}
																disabled={isPending}
																className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success transition-all hover:bg-success/20 active:scale-90 disabled:opacity-50"
																aria-label={t("rates.saveAria")}
															>
																<Check size={18} weight="bold" />
															</button>
															<button
																type="button"
																onClick={cancelEdit}
																className="flex size-8 items-center justify-center rounded-lg bg-surface-elevated text-text-secondary transition-all hover:bg-border active:scale-90"
																aria-label={t("rates.cancelAria")}
															>
																<X size={18} weight="bold" />
															</button>
														</m.div>
													) : (
														<m.div
															key="static"
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															className="flex items-center gap-1"
														>
															<button
																type="button"
																onClick={() => startEdit(rate)}
																className="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
																aria-label={t("rates.editAria").replace(
																	"{type}",
																	rate.jenisKendaraan,
																)}
															>
																<PencilSimple size={18} weight="duotone" />
															</button>
															<button
																type="button"
																onClick={() => handleDelete(rate.id)}
																disabled={isPending}
																className="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-all hover:bg-danger/10 hover:text-danger active:scale-90 disabled:opacity-50"
																aria-label={t("rates.deleteAria").replace(
																	"{type}",
																	rate.jenisKendaraan,
																)}
															>
																<Trash size={18} weight="duotone" />
															</button>
														</m.div>
													)}
												</AnimatePresence>
											</div>
										</td>
									</m.tr>
								))
							)}
						</m.tbody>
					</table>
				</div>
			</m.div>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="rounded-2xl sm:max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-danger">
							<div className="rounded-lg bg-danger/10 p-2 text-danger">
								<Warning size={20} weight="bold" />
							</div>
							{t("rates.immutableProtocol")}
						</AlertDialogTitle>
						<AlertDialogDescription className="pt-2 text-sm font-bold leading-relaxed text-text-secondary uppercase tracking-tight">
							{t("rates.immutableDesc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-4 flex-row gap-2 sm:gap-2">
						<AlertDialogAction className="m-0 h-11 flex-1 rounded-xl bg-danger text-[10px] font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-danger/20 hover:bg-danger/90">
						{t("rates.acknowledge")}
					</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
