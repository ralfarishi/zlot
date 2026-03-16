"use client";

import { useReducer, useTransition, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { findActiveTransactionByPlate, logExit } from "@/src/actions/transactions";
import {
	SteeringWheel,
	CurrencyDollar,
	CreditCard,
	ArrowsClockwise,
	CheckCircle,
	MagnifyingGlass,
	Clock,
	MapPin,
	Receipt,
	QrCode,
} from "@phosphor-icons/react";
import { cn, formatIDR, formatLongDuration } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { ParkingReceipt } from "@/app/dashboard/history/parking-receipt";

interface Vehicle {
	platNomor: string;
	warna: string | null;
	jenisKendaraan: string;
}

interface Rate {
	tarifPerJam: string;
}

interface Area {
	namaArea: string;
}

interface Transaction {
	id: string | bigint;
	nomorTransaksi?: string | null;
	waktuMasuk: Date;
	kendaraan: Vehicle;
	tarif: Rate;
	area: Area;
	petugas: { namaLengkap: string | null };
}

type State = {
	plate: string;
	paymentMethod: "QRIS" | "TUNAI";
	received: string;
	tx: Transaction | null;
	error: string | null;
	success: boolean;
};

type Action =
	| { type: "SET_PLATE"; payload: string }
	| { type: "SET_PAYMENT_METHOD"; payload: "QRIS" | "TUNAI" }
	| { type: "SET_RECEIVED"; payload: string }
	| { type: "SET_TRANSACTION"; payload: Transaction | null }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "SET_SUCCESS"; payload: boolean }
	| { type: "RESET" };

const initialState: State = {
	plate: "",
	paymentMethod: "TUNAI",
	received: "",
	tx: null,
	error: null,
	success: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET_PLATE":
			return { ...state, plate: action.payload.toUpperCase() };
		case "SET_PAYMENT_METHOD":
			return { ...state, paymentMethod: action.payload };
		case "SET_RECEIVED":
			return { ...state, received: action.payload };
		case "SET_TRANSACTION":
			return { ...state, tx: action.payload, error: null };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "SET_SUCCESS":
			return { ...state, success: action.payload };
		case "RESET":
			return initialState;
		default:
			return state;
	}
}

export const ExitForm = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [isPending, startTransition] = useTransition();
	const [isSearching, startSearch] = useTransition();
	const searchParams = useSearchParams();
	const plateParam = searchParams.get("plate");

	const { plate, paymentMethod, received, tx, error, success } = state;

	const handleSearch = useCallback(async (plateToSearch: string) => {
		const trimmed = plateToSearch.replaceAll(" ", "");
		if (!trimmed) return;
		if (trimmed.length > 8) {
			dispatch({ type: "SET_ERROR", payload: "Plate number must be 8 characters or less." });
			return;
		}
		startSearch(async () => {
			try {
				const result = (await findActiveTransactionByPlate(
					plateToSearch,
				)) as unknown as Transaction | null;
				if (!result) {
					dispatch({ type: "SET_ERROR", payload: "No active registry found for this plate." });
					dispatch({ type: "SET_TRANSACTION", payload: null });
				} else {
					dispatch({ type: "SET_TRANSACTION", payload: result });
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Search failed.";
				dispatch({ type: "SET_ERROR", payload: message });
			}
		});
	}, []);

	// Auto-search from URL params
	useEffect(() => {
		if (plateParam && (!tx || tx.kendaraan.platNomor !== plateParam)) {
			const timer = setTimeout(() => handleSearch(plateParam), 0);
			return () => clearTimeout(timer);
		}
	}, [plateParam, handleSearch, tx]);

	const estimatedFee = useMemo(() => {
		if (!tx) return 0;
		const start = new Date(tx.waktuMasuk).getTime();
		const now = new Date().getTime();
		const diffHrs = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60)));
		return diffHrs * Number(tx.tarif.tarifPerJam);
	}, [tx]);

	const handleProcessExit = async () => {
		if (!tx) return;
		if (paymentMethod === "TUNAI" && Number(received) < estimatedFee) {
			dispatch({ type: "SET_ERROR", payload: "Insufficient cash received to settle fee." });
			return;
		}

		const changeAmount =
			paymentMethod === "TUNAI" ? Math.max(0, Number(received) - estimatedFee) : 0;

		startTransition(async () => {
			try {
				await logExit(
					tx.id.toString(),
					paymentMethod,
					paymentMethod === "TUNAI" ? received : undefined,
					paymentMethod === "TUNAI" ? String(changeAmount) : undefined,
				);
				dispatch({ type: "SET_SUCCESS", payload: true });
			} catch (err) {
				const message = err instanceof Error ? err.message : "Exit protocol failed.";
				dispatch({ type: "SET_ERROR", payload: message });
			}
		});
	};

	if (success) {
		return (
			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="min-h-[80vh] flex flex-col items-center justify-center p-(--space-lg) text-center"
			>
				<div className="mb-6 flex size-24 items-center justify-center rounded-full bg-success/20 text-success shadow-[0_0_30px_rgba(var(--success-rgb),0.3)]">
					<CheckCircle size={56} weight="fill" />
				</div>
				<h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter">
					Exit Authorized
				</h2>
				<p className="mt-2 text-sm font-bold text-text-secondary uppercase tracking-[0.2em] opacity-60 max-w-xs">
					Payment processed successfully. Vehicle cleared for departure.
				</p>

				{tx && (
					<div className="mt-10 w-full max-w-lg">
						<ParkingReceipt
							data={{
								id: tx.id.toString(),
								nomorTransaksi: tx.nomorTransaksi,
								platNomor: tx.kendaraan.platNomor,
								jenisKendaraan: tx.kendaraan.jenisKendaraan,
								namaArea: tx.area.namaArea,
								waktuMasuk: tx.waktuMasuk,
								waktuKeluar: new Date(),
								durasiJam: formatLongDuration(tx.waktuMasuk, new Date()),
								totalBiaya: String(estimatedFee),
								tarifPerJam: tx.tarif.tarifPerJam,
								namaPetugas: tx.petugas.namaLengkap,
								metodePembayaran: paymentMethod,
								tunaiDiterima: paymentMethod === "TUNAI" ? received : null,
								kembalian:
									paymentMethod === "TUNAI"
										? String(Math.max(0, Number(received) - estimatedFee))
										: null,
							}}
						/>
					</div>
				)}
			</m.div>
		);
	}

	return (
		<div className="grid gap-(--space-lg) md:grid-cols-5">
			<div className="md:col-span-3 space-y-(--space-lg)">
				<div className="rounded-card border border-border bg-surface shadow-card overflow-hidden backdrop-blur-md">
					<div className="border-b border-border bg-danger/5 p-(--space-lg)">
						<div className="flex items-center gap-(--space-md)">
							<div className="flex size-14 items-center justify-center rounded-2xl bg-danger text-text-inverse shadow-xl shadow-danger/20 ring-4 ring-danger/10">
								<SteeringWheel size={32} weight="bold" />
							</div>
							<div>
								<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
									Vehicle Exit
								</h1>
								<p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-0.5">
									Departure verification & fee processing
								</p>
							</div>
						</div>
					</div>

					<div className="p-(--space-lg) space-y-(--space-lg)">
						<div className="space-y-2">
							<label
								htmlFor="plate-search"
								className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
							>
								Identify Target (Plate / ID)
							</label>
							<div className="flex gap-2">
								<div className="relative flex-1">
									<MagnifyingGlass
										className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/30"
										size={20}
										weight="bold"
									/>
									<input
										id="plate-search"
										type="text"
										value={plate}
										maxLength={8}
										onChange={(e) => dispatch({ type: "SET_PLATE", payload: e.target.value })}
										onKeyDown={(e) => e.key === "Enter" && handleSearch(plate)}
										placeholder="SCAN OR ENTER PLATE"
										className="w-full rounded-button border-2 border-border bg-surface-elevated/50 px-10 py-3.5 text-xl font-black tracking-widest text-text-primary outline-none focus:border-danger focus:ring-4 focus:ring-danger/5 transition-all uppercase placeholder:opacity-20"
									/>
								</div>
								<button
									onClick={() => handleSearch(plate)}
									disabled={isSearching}
									className="flex size-[58px] shrink-0 items-center justify-center rounded-button bg-surface border-2 border-border text-text-primary transition-all hover:bg-surface-elevated active:scale-95 disabled:opacity-50"
								>
									{isSearching ? (
										<ArrowsClockwise size={24} weight="bold" className="animate-spin" />
									) : (
										<CheckCircle size={24} weight="bold" className="text-danger" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className="rounded-lg bg-danger/10 p-3 text-xs font-bold text-danger uppercase tracking-tight">
								{error}
							</div>
						)}

						<AnimatePresence mode="wait">
							{tx ? (
								<m.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="rounded-2xl bg-surface-elevated/80 p-(--space-md) border border-border shadow-inner"
								>
									<div className="mb-4 flex items-center justify-between border-b border-border border-dashed pb-3">
										<h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
											Telemetry Decrypted
										</h3>
										<span className="rounded-full bg-danger/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-danger ring-1 ring-danger/20">
											ACTIVE {tx.nomorTransaksi || `TX-${tx.id.toString()}`}
										</span>
									</div>
									<div className="grid grid-cols-2 gap-y-6 gap-x-4">
										<div className="flex items-start gap-3">
											<div className="flex size-8 items-center justify-center rounded-lg bg-surface text-text-secondary shadow-sm ring-1 ring-border">
												<SteeringWheel size={16} weight="bold" />
											</div>
											<div>
												<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
													Vehicle
												</p>
												<p className="text-xs font-black text-text-primary uppercase tracking-tight">
													{tx.kendaraan.platNomor}
												</p>
												<p className="text-[9px] font-bold text-text-secondary uppercase">
													{tx.kendaraan.warna || "None"} • {tx.kendaraan.jenisKendaraan}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="flex size-8 items-center justify-center rounded-lg bg-surface text-text-secondary shadow-sm ring-1 ring-border">
												<Clock size={16} weight="bold" />
											</div>
											<div>
												<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
													Duration
												</p>
												<p className="text-xs font-black text-text-primary uppercase tracking-tight">
													{formatLongDuration(tx.waktuMasuk, null)}
												</p>
												<p className="text-[9px] font-bold text-text-secondary uppercase">
													Entered{" "}
													{new Date(tx.waktuMasuk).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="flex size-8 items-center justify-center rounded-lg bg-surface text-text-secondary shadow-sm ring-1 ring-border">
												<MapPin size={16} weight="bold" />
											</div>
											<div>
												<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
													Location
												</p>
												<p className="text-xs font-black text-text-primary uppercase tracking-tight">
													{tx.area.namaArea}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="flex size-8 items-center justify-center rounded-lg bg-surface text-text-secondary shadow-sm ring-1 ring-border">
												<CurrencyDollar size={16} weight="bold" />
											</div>
											<div>
												<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
													Rate Applied
												</p>
												<p className="text-xs font-black text-text-primary uppercase tracking-tight">
													{formatIDR(tx.tarif.tarifPerJam)}/HR
												</p>
											</div>
										</div>
									</div>
								</m.div>
							) : (
								<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center opacity-40">
									<MagnifyingGlass size={48} className="mb-4 text-text-secondary" weight="thin" />
									<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
										Awaiting Identification
									</p>
								</div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			<div className="md:col-span-2 flex flex-col gap-(--space-lg)">
				<m.div
					className={cn(
						"rounded-card border-2 p-(--space-lg) shadow-xl relative overflow-hidden transition-all",
						tx
							? "border-secondary bg-surface scale-100"
							: "border-border bg-surface/50 scale-95 opacity-50 pointer-events-none",
					)}
				>
					<div className="absolute top-0 right-0 p-4 opacity-5">
						<CurrencyDollar size={96} className="text-secondary" weight="fill" />
					</div>

					<p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
						Total Outstanding
					</p>
					<h2 className="text-5xl font-black text-text-primary mt-2 tracking-tighter">
						{formatIDR(estimatedFee)}
					</h2>

					{/* Payment Method Selector */}
					<div className="mt-8 space-y-3">
						<label
							htmlFor="payment-method"
							className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
						>
							Settlement Method
						</label>
						<div id="payment-method" className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => dispatch({ type: "SET_PAYMENT_METHOD", payload: "TUNAI" })}
								className={cn(
									"flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 transition-all",
									paymentMethod === "TUNAI"
										? "border-secondary bg-secondary/10 text-secondary"
										: "border-border bg-surface text-text-secondary hover:border-text-secondary/30",
								)}
							>
								<CurrencyDollar size={20} weight={paymentMethod === "TUNAI" ? "fill" : "bold"} />
								<span className="text-[10px] font-black uppercase tracking-widest">CASH</span>
							</button>
							<button
								type="button"
								onClick={() => dispatch({ type: "SET_PAYMENT_METHOD", payload: "QRIS" })}
								className={cn(
									"flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 transition-all",
									paymentMethod === "QRIS"
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-surface text-text-secondary hover:border-text-secondary/30",
								)}
							>
								<QrCode size={20} weight={paymentMethod === "QRIS" ? "fill" : "bold"} />
								<span className="text-[10px] font-black uppercase tracking-widest">QRIS</span>
							</button>
						</div>
					</div>

					{paymentMethod === "TUNAI" && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mt-6 space-y-3 overflow-hidden"
						>
							<label
								htmlFor="cash-received"
								className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
							>
								Cash Handling
							</label>
							<div className="grid grid-cols-2 gap-2">
								<div className="relative">
									<input
										id="cash-received"
										type="text"
										placeholder="RECEIVED"
										value={received}
										onChange={(e) => {
											const val = e.target.value.replace(/\D/g, "");
											dispatch({ type: "SET_RECEIVED", payload: val });
										}}
										className="w-full rounded-xl border-2 border-border bg-surface px-3 py-3 text-sm font-black text-text-primary outline-none focus:border-secondary transition-all"
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-text-secondary/30 uppercase">
										IDR
									</span>
								</div>
								<div className="flex flex-col justify-center rounded-xl bg-surface-elevated/50 px-4 py-2 ring-1 ring-border">
									<span className="text-[9px] font-bold uppercase text-text-secondary/40 leading-none">
										Change Due
									</span>
									<span
										className={cn(
											"text-sm font-black mt-0.5",
											Number(received) >= estimatedFee ? "text-success" : "text-text-secondary/30",
										)}
									>
										{formatIDR(Math.max(0, Number(received) - estimatedFee))}
									</span>
								</div>
							</div>
						</m.div>
					)}

					<div className="mt-6 space-y-3">
						<button
							disabled={!tx || isPending}
							onClick={handleProcessExit}
							className="flex w-full items-center justify-center gap-3 rounded-button bg-secondary py-4 text-xs font-black uppercase tracking-[0.2em] text-text-inverse shadow-xl shadow-secondary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
						>
							{isPending ? (
								<ArrowsClockwise size={20} weight="bold" className="animate-spin" />
							) : (
								<CreditCard size={20} weight="bold" />
							)}
							Process Departure
						</button>
						<p className="text-center text-[9px] font-bold text-text-secondary uppercase opacity-40">
							Final total calculated upon processing
						</p>
					</div>
				</m.div>

				<div className="rounded-card border border-border bg-surface-elevated/50 p-(--space-md) flex items-center gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary shadow-sm ring-1 ring-border">
						<Receipt size={20} weight="duotone" />
					</div>
					<p className="text-[9px] font-bold leading-relaxed text-text-secondary uppercase opacity-60">
						Automated thermal receipt artifacts will be generated following authorized payment
						confirmation.
					</p>
				</div>
			</div>
		</div>
	);
};
