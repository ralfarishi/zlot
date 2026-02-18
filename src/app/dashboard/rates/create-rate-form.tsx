"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Coin, ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { createRate } from "@/src/actions/rates";
import { motion, AnimatePresence } from "framer-motion";

export const CreateRateForm = () => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const vehicleType = formData.get("vehicleType")?.toString() as "motorcycle" | "car" | "other";
		const hourlyRate = formData.get("hourlyRate")?.toString() ?? "";

		if (!vehicleType || !hourlyRate) {
			setError("All fields are required");
			return;
		}

		startTransition(async () => {
			try {
				await createRate({ vehicleType, hourlyRate });
				setIsOpen(false);
				setError(null);
				router.refresh();
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to create rate";
				setError(message);
			}
		});
	};

	return (
		<div className="relative">
			<AnimatePresence mode="wait">
				{!isOpen ? (
					<motion.button
						key="add-btn"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						onClick={() => setIsOpen(true)}
						className="flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
					>
						<Plus size={16} weight="bold" />
						Provision Rate
					</motion.button>
				) : (
					<motion.div
						key="form"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className="rounded-card border border-primary/30 bg-surface p-(--space-md) shadow-lg ring-4 ring-primary/5"
					>
						<div className="mb-4 flex items-center justify-between border-b border-border pb-3">
							<div className="flex items-center gap-2">
								<Coin size={18} weight="bold" className="text-primary" />
								<h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary">
									Initialize New Rate Artifact
								</h3>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="text-text-secondary transition-colors hover:text-danger"
							>
								<X size={18} weight="bold" />
							</button>
						</div>

						{error && (
							<p className="mb-4 text-[10px] font-bold uppercase tracking-tight text-danger">
								Error: {error}
							</p>
						)}

						<form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
							<div className="flex-1 space-y-1.5">
								<label className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
									Vehicle Category
								</label>
								<div className="relative">
									<select
										name="vehicleType"
										className="w-full appearance-none rounded-button border border-border bg-surface px-4 py-2 text-xs font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
										defaultValue=""
									>
										<option value="" disabled>
											Select Type...
										</option>
										<option value="car">Car (Standard)</option>
										<option value="motorcycle">Motorcycle / Trike</option>
										<option value="other">Specialized / Other</option>
									</select>
								</div>
							</div>

							<div className="flex-1 space-y-1.5">
								<label className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
									Hourly Tariff (IDR)
								</label>
								<input
									name="hourlyRate"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									className="w-full rounded-button border border-border bg-surface px-4 py-2 text-xs font-mono font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
								/>
							</div>

							<button
								type="submit"
								disabled={isPending}
								className="flex shrink-0 items-center justify-center gap-2 rounded-button bg-primary px-6 py-2 text-xs font-black uppercase tracking-widest text-text-inverse shadow-md shadow-primary/10 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 h-[38px]"
							>
								{isPending ? (
									<ArrowsClockwise size={16} weight="bold" className="animate-spin" />
								) : (
									"Commit Rate"
								)}
							</button>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
