"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Timer, MapPin, MagnifyingGlass, Car, SteeringWheel } from "@phosphor-icons/react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatLongDuration } from "@/lib/utils";
import { useLocale } from "@/src/components/providers/locale-provider";

interface ActiveTransaction {
	id: string | bigint;
	waktuMasuk: Date;
	kendaraan: {
		platNomor: string;
		jenisKendaraan: string;
		warna: string | null;
	};
	area: {
		namaArea: string;
	};
	tarif: {
		tarifPerJam: string;
	};
}

export const ActiveVehiclesList = ({ initialData }: { initialData: ActiveTransaction[] }) => {
	const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
	const { t } = useLocale();

	const filtered = initialData.filter(
		(tx) =>
			tx.kendaraan.platNomor.toLowerCase().includes((search ?? "").toLowerCase()) ||
			tx.area.namaArea.toLowerCase().includes((search ?? "").toLowerCase()),
	);

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col justify-between gap-(--space-md) sm:flex-row sm:items-end px-1">
				<div className="space-y-1">
					<h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
						{t("active.liveTelemetry")}
					</h2>
					<p className="text-sm font-bold text-text-primary uppercase tracking-tighter">
						{filtered.length} {t("active.sessionsDetected")}
					</p>
				</div>
				<div className="relative w-full max-w-sm">
					<MagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40"
						size={18}
						weight="bold"
					/>
					<input
						type="text"
						value={search ?? ""}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t("active.searchPlaceholder")}
						className="w-full rounded-button border border-border bg-surface pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-widest shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:opacity-30"
					/>
				</div>
			</div>

			<div className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-4">
				<AnimatePresence mode="popLayout">
					{filtered.map((tx) => (
						<m.div
							layout
							key={tx.id.toString()}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="group relative overflow-hidden rounded-card border border-border bg-surface p-(--space-md) shadow-card transition-all hover:border-primary/30 hover:shadow-xl"
						>
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="flex flex-col">
										<p className="text-xl font-black tracking-tighter text-text-primary leading-none">
											{tx.kendaraan.platNomor}
										</p>
										<div className="mt-2 flex items-center gap-1.5 shrink-0">
											<span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-text-secondary ring-1 ring-border shadow-inner">
												{tx.kendaraan.jenisKendaraan}
											</span>
											{tx.kendaraan.warna && (
												<span className="text-[9px] font-bold text-text-secondary uppercase opacity-40 italic">
													{tx.kendaraan.warna}
												</span>
											)}
										</div>
									</div>
									<div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
										<MapPin size={14} weight="bold" className="text-primary/40" />
										{tx.area.namaArea}
									</div>
								</div>
								<div className="text-right">
									<div className="flex items-center justify-end gap-1.5 font-black text-xs text-text-primary tracking-tighter">
										<Timer size={16} weight="bold" className="text-secondary" />
										{formatLongDuration(tx.waktuMasuk, null)}
									</div>
									<span className="text-[9px] font-black uppercase tracking-widest text-text-secondary/30 mt-1 block">
										{t("active.liveDuration")}
									</span>
								</div>
							</div>

							<div className="mt-6 flex items-center gap-2">
								<Link
									href={`/dashboard/parking/exit?plate=${tx.kendaraan.platNomor}`}
									className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-elevated/50 border border-border px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-primary transition-all hover:bg-danger/10 hover:text-danger hover:border-danger/20 active:scale-95"
								>
									<SteeringWheel size={14} weight="bold" />
									{t("active.initiateExit")}
								</Link>
							</div>

							<div className="absolute -right-2 -top-2 size-12 opacity-[0.03] transition-transform group-hover:scale-150">
								<Car size={48} weight="fill" />
							</div>
						</m.div>
					))}
				</AnimatePresence>
			</div>

			{filtered.length === 0 && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col items-center justify-center p-16 rounded-card border-2 border-dashed border-border bg-surface-elevated/30"
				>
					<Car size={64} className="text-text-secondary/10 mb-4" weight="duotone" />
					<p className="text-xs font-black uppercase tracking-widest text-text-secondary/40 italic">
						{t("active.noSignals")}
					</p>
				</m.div>
			)}
		</div>
	);
};
