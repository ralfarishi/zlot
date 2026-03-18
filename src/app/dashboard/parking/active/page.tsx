import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveTransactions } from "@/src/actions/transactions";
import { getTranslator } from "@/src/lib/i18n/server";
import { ActiveVehiclesList } from "./active-vehicles-list";

export const metadata: Metadata = {
	title: "Active Vehicles | Zlot",
};

const ActiveVehiclesPage = async () => {
	const activeTransactions = await getActiveTransactions();
	const t = await getTranslator();

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col justify-between gap-(--space-md) sm:flex-row sm:items-end">
				<div>
					<Link
						href="/dashboard/parking"
						className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary mb-4"
					>
						<ArrowLeft
							size={14}
							weight="bold"
							className="transition-transform group-hover:-translate-x-1"
						/>
						{t("active.backToConsole")}
					</Link>
					<h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
						{t("active.title")}
					</h1>
					<p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-1">
						{t("active.subtitle")}
					</p>
				</div>
			</div>

			<ActiveVehiclesList initialData={activeTransactions} />
		</div>
	);
};

export default ActiveVehiclesPage;
