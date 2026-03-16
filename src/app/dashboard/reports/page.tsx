import { FileText, DownloadSimple, Printer, Funnel } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { getRecentCompletedTransactions } from "@/src/actions/transactions";
import { formatIDR, formatLongDuration } from "@/lib/utils";
import { requireRole } from "@/src/lib/auth-guard";

export const metadata: Metadata = {
	title: "Reports | Zlot",
};

const ReportsPage = async () => {
	await requireRole(["admin", "owner"]);
	const transactions = await getRecentCompletedTransactions(20);

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col justify-between gap-(--space-md) sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
						Financial Ledger
					</h1>
					<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
						Reconciliation records and transaction artifacts
					</p>
				</div>
				<div className="flex gap-2">
					<button className="flex items-center gap-2 rounded-button border border-border bg-surface px-6 py-2 text-xs font-black uppercase tracking-widest text-text-secondary transition-all hover:bg-surface-elevated active:scale-95">
						<DownloadSimple size={16} weight="bold" />
						Export Data
					</button>
					<button className="flex items-center gap-2 rounded-button bg-primary px-8 py-2 text-xs font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
						<Printer size={16} weight="bold" />
						Generate PDF
					</button>
				</div>
			</div>

			<div className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
				<div className="flex flex-col justify-between border-b border-border bg-surface-elevated/50 p-(--space-md) sm:flex-row sm:items-center">
					<div className="flex flex-1 items-center gap-(--space-sm)">
						<div className="relative flex-1 max-w-sm">
							<FileText
								className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
								size={18}
							/>
							<input
								type="text"
								placeholder="Search transactions..."
								className="w-full rounded-button border border-border bg-surface pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
							/>
						</div>
						<button className="flex size-10 items-center justify-center rounded-button border border-border bg-surface text-text-secondary hover:text-text-primary shadow-sm">
							<Funnel size={18} />
						</button>
					</div>
					<div className="mt-4 flex items-center gap-4 text-xs font-medium text-text-secondary sm:mt-0">
						<span>Recent Transactions</span>
						<div className="h-4 w-px bg-border" />
						<span className="text-text-primary">{transactions.length} records</span>
					</div>
				</div>

				<div className="divide-y divide-border">
					{transactions.length === 0 ? (
						<div className="p-(--space-lg) text-center text-sm text-text-secondary italic">
							No completed transactions found
						</div>
					) : (
						transactions.map((tx) => (
							<div
								key={tx.id.toString()}
								className="group flex items-center justify-between p-(--space-md) transition-colors hover:bg-surface-elevated"
							>
								<div className="flex items-center gap-(--space-md)">
									<div className="flex size-10 items-center justify-center rounded-xl bg-accent-1/10 text-accent-1">
										<FileText size={20} weight="duotone" />
									</div>
									<div>
										<p className="text-sm font-bold text-text-primary leading-none">
											{tx.kendaraan.platNomor} - {tx.area.namaArea}
										</p>
										<p className="mt-1 text-xs text-text-secondary">
											{tx.waktuKeluar
												? new Date(tx.waktuKeluar).toLocaleDateString("id-ID", {
														day: "numeric",
														month: "short",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "In progress"}{" "}
											| {formatLongDuration(tx.waktuMasuk, tx.waktuKeluar)} |{" "}
											{formatIDR(tx.totalBiaya ?? 0)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
									<span className="text-sm font-black text-text-primary">
										{formatIDR(tx.totalBiaya ?? 0)}
									</span>
								</div>
							</div>
						))
					)}
				</div>

				{transactions.length > 0 && (
					<div className="bg-surface-elevated/30 p-(--space-md) text-center">
						<span className="text-sm font-bold text-text-secondary/50">
							Showing {transactions.length} most recent completed transactions
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default ReportsPage;
