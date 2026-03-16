"use client";

import { useState, useTransition, useRef } from "react";
import { logEntry } from "@/src/actions/transactions";
import { ShieldCheck, ArrowsClockwise, CheckCircle, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";

interface Area {
	id: string;
	namaArea: string;
	kapasitas: number;
	terisi: number;
}

type VehicleType = "motor" | "mobil" | "lainnya";

const PLATE_MAX_LENGTH = 8;

export const EntryForm = ({ areas }: { areas: Area[] }) => {
	const formRef = useRef<HTMLFormElement>(null);
	const [isPending, startTransition] = useTransition();
	const [selectedArea, setSelectedArea] = useState<string | null>(null);
	const [plateNumber, setPlateNumber] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const resetForm = () => {
		setSuccess(false);
		setSelectedArea(null);
		setPlateNumber("");
		setError(null);
		formRef.current?.reset();
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedArea) {
			setError("Please select a target parking zone.");
			return;
		}

		const formData = new FormData(e.currentTarget);
		const vehicleType = formData.get("vehicleType")?.toString() as VehicleType;

		if (!plateNumber) {
			setError("Plate number required for registry.");
			return;
		}

		if (plateNumber.length > PLATE_MAX_LENGTH) {
			setError(`Plate number must be ${PLATE_MAX_LENGTH} characters or less.`);
			return;
		}

		setError(null);
		startTransition(async () => {
			try {
				await logEntry({
					platNomor: plateNumber,
					jenisKendaraan: vehicleType,
					idArea: parseInt(selectedArea),
				});
				setSuccess(true);
				setTimeout(resetForm, 3000);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Protocol failure. Try again.";
				setError(message);
			}
		});
	};

	return (
		<div className="relative">
			<AnimatePresence mode="wait">
				{success ? (
					<m.div
						key="success"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="flex flex-col items-center justify-center p-12 text-center"
					>
						<div className="mb-6 flex size-20 items-center justify-center rounded-full bg-success/20 text-success shadow-[0_0_20px_rgba(var(--success-rgb),0.2)]">
							<CheckCircle size={48} weight="fill" />
						</div>
						<h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">
							Registration Confirmed
						</h2>
						<p className="mt-2 text-sm font-bold text-text-secondary uppercase tracking-widest opacity-60">
							Vehicle telemetry recorded. Ready for next entry.
						</p>
					</m.div>
				) : (
					<m.form
						key="form"
						ref={formRef}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onSubmit={handleSubmit}
						className="p-(--space-lg) space-y-(--space-xl)"
					>
						{error && (
							<m.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg bg-danger/10 p-3 text-xs font-bold text-danger uppercase tracking-tight"
							>
								{error}
							</m.div>
						)}

						<div className="grid gap-(--space-lg) md:grid-cols-2">
							<div className="space-y-2">
								<label
									htmlFor="plate-number"
									className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
								>
									Registry (Plate Number)
								</label>
								<input
									id="plate-number"
									name="plateNumber"
									type="text"
									required
									value={plateNumber}
									onChange={(e) =>
										setPlateNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
									}
									disabled={isPending}
									maxLength={PLATE_MAX_LENGTH}
									placeholder="ABC1234"
									className="w-full rounded-button border-2 border-border bg-surface-elevated/50 px-4 py-3 text-xl font-black tracking-widest text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all uppercase placeholder:opacity-20"
								/>
								<p className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-tight">
									Max {PLATE_MAX_LENGTH} characters
								</p>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="vehicle-type"
									className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
								>
									Classification
								</label>
								<select
									id="vehicle-type"
									name="vehicleType"
									disabled={isPending}
									className="w-full h-[52px] rounded-button border-2 border-border bg-surface-elevated/50 px-4 py-3 text-sm font-black text-text-primary outline-none focus:border-primary transition-all uppercase appearance-none cursor-pointer"
								>
									<option value="mobil">Four-Wheel Artifact (Car)</option>
									<option value="motor">Two-Wheel Artifact (Cycle)</option>
									<option value="lainnya">General Transit (Other)</option>
								</select>
							</div>
						</div>

						<div className="space-y-4">
							<label
								id="sector-assignment-label"
								className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60"
							>
								Sector Assignment
							</label>
							<div
								role="group"
								aria-labelledby="sector-assignment-label"
								className="grid grid-cols-2 gap-3 sm:grid-cols-4"
							>
								{areas.map((area) => {
									const isFull = area.terisi >= area.kapasitas;
									const isSelected = selectedArea === area.id;

									return (
										<button
											key={area.id}
											type="button"
											disabled={isPending || isFull}
											onClick={() => setSelectedArea(area.id)}
											className={cn(
												"group relative flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all active:scale-95 disabled:opacity-40",
												isSelected
													? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
													: "border-border bg-surface-elevated/50 hover:border-primary/30 hover:bg-primary/2",
											)}
										>
											{isSelected && (
												<div className="absolute top-1 right-1">
													<Check size={12} weight="bold" className="text-primary" />
												</div>
											)}
											<p
												className={cn(
													"text-xs font-black uppercase tracking-tight",
													isSelected ? "text-primary" : "text-text-primary",
												)}
											>
												{area.namaArea}
											</p>
											<p className="mt-1 text-[9px] font-bold text-text-secondary uppercase opacity-60">
												{area.kapasitas - area.terisi} Avail
											</p>
										</button>
									);
								})}
							</div>
						</div>

						<div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-border border-dashed">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-lg bg-surface-elevated text-secondary/60 ring-1 ring-border shadow-inner">
									<ShieldCheck size={20} weight="bold" />
								</div>
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-text-primary">
										Ops Protocol
									</p>
									<p className="text-[9px] font-bold text-text-secondary uppercase opacity-40">
										Verification active
									</p>
								</div>
							</div>

							<button
								type="submit"
								disabled={isPending}
								className="flex items-center justify-center gap-2 rounded-button bg-primary px-10 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-text-inverse shadow-xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
							>
								{isPending ? (
									<>
										<ArrowsClockwise size={18} weight="bold" className="animate-spin" />
										Syncing...
									</>
								) : (
									<>
										<CheckCircle size={18} weight="bold" />
										Record Entry
									</>
								)}
							</button>
						</div>
					</m.form>
				)}
			</AnimatePresence>
		</div>
	);
};
