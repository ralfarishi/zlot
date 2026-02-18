import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTransactions } from "@/src/actions/transactions";
import { HistoryTable } from "./history-table";
import { requireRole } from "@/src/lib/auth-guard";

export const metadata: Metadata = {
	title: "Transaction History | Zlot",
};

const HistoryPage = async () => {
	await requireRole(["admin", "owner"]);
	const transactions = await getAllTransactions();

	interface TransactionRecord {
		id: bigint;
		transactionNumber: string | null;
		entryTime: Date;
		exitTime: Date | null;
		status: "entered" | "exited";
		totalCost: string | null;
		durationHours: string | null;
		paymentMethod: "QRIS" | "CASH" | null;
		cashReceived: string | null;
		cashChange: string | null;
		vehicle: { plateNumber: string; vehicleType: string };
		area: { areaName: string };
		rate: { hourlyRate: string };
		employee: { fullName: string | null };
	}

	const serializedData = (transactions as unknown as TransactionRecord[]).map((tx) => ({
		id: tx.id.toString(),
		transactionNumber: tx.transactionNumber,
		entryTime: tx.entryTime,
		exitTime: tx.exitTime,
		status: tx.status,
		totalCost: tx.totalCost,
		durationHours: tx.durationHours,
		vehicle: {
			plateNumber: tx.vehicle.plateNumber,
			vehicleType: tx.vehicle.vehicleType,
		},
		area: {
			areaName: tx.area.areaName,
		},
		rate: {
			hourlyRate: tx.rate.hourlyRate,
		},
		staffName: tx.employee.fullName,
		paymentMethod: tx.paymentMethod,
		cashReceived: tx.cashReceived || null,
		cashChange: tx.cashChange || null,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col justify-between gap-(--space-md) sm:flex-row sm:items-end">
				<div>
					<Link
						href="/dashboard"
						className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary mb-4"
					>
						<ArrowLeft
							size={14}
							weight="bold"
							className="transition-transform group-hover:-translate-x-1"
						/>
						Back to Console
					</Link>
					<div className="flex items-center gap-4">
						<div>
							<h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
								Archives
							</h1>
							<p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-1">
								Chronological transaction ledger and auditing
							</p>
						</div>
					</div>
				</div>
			</div>

			<HistoryTable data={serializedData} />
		</div>
	);
};

export default HistoryPage;
