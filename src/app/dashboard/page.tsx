import { requireRole } from "@/src/lib/auth-guard";
import { Garage, Users, CurrencyDollar, Pulse } from "@phosphor-icons/react/dist/ssr";
import { getAreas } from "@/src/actions/parking-areas";
import { db } from "@/src/db";
import { sql } from "drizzle-orm";
import { transactions, profiles, vehicles } from "@/src/db/schema";
import { formatIDR } from "@/src/lib/utils";
import { DashboardStats } from "./_components/DashboardStats";
import { ZoneSaturation } from "./_components/ZoneSaturation";
import { QuickActionProtocol } from "./_components/QuickActionProtocol";

export const metadata = { title: "Mission Control | Zlot" };

const DashboardOverview = async () => {
	await requireRole(["admin", "owner"]);

	// Fetch Dashboard Data
	const [areas, totalPersonnel, totalFleet, dailyRevenue] = await Promise.all([
		getAreas(),
		db
			.select({ count: sql<number>`count(*)` })
			.from(profiles)
			.then((res) => res[0].count),
		db
			.select({ count: sql<number>`count(*)` })
			.from(vehicles)
			.then((res) => res[0].count),
		db
			.select({ sum: sql<string>`coalesce(sum(total_cost), '0')` })
			.from(transactions)
			.where(sql`exit_time >= CURRENT_DATE`)
			.then((res) => res[0].sum),
	]);

	const totalSpots = areas.reduce((acc, a) => acc + a.capacity, 0);
	const occupiedSpots = areas.reduce((acc, a) => acc + Number(a.occupied), 0);
	const occupancyRate = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

	const stats = [
		{
			label: "Ops Load",
			value: `${occupancyRate}%`,
			sub: `${occupiedSpots}/${totalSpots} Active Slots`,
			icon: Garage,
			color: "text-primary",
			bg: "bg-primary/10",
		},
		{
			label: "Daily Yield",
			value: formatIDR(parseFloat(dailyRevenue)),
			sub: "Last 24h Revenue",
			icon: CurrencyDollar,
			color: "text-success",
			bg: "bg-success/10",
		},
		{
			label: "Registry Size",
			value: totalFleet,
			sub: "Verified Units",
			icon: Pulse,
			color: "text-secondary",
			bg: "bg-secondary/10",
		},
		{
			label: "Personnel",
			value: totalPersonnel,
			sub: "Active Operators",
			icon: Users,
			color: "text-accent-2",
			bg: "bg-accent-2/10",
		},
	];

	return (
		<div className="space-y-(--space-lg)">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
						Mission Control
					</h1>
					<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
						Real-time operational telemetry & system state
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-4 py-2 bg-surface border border-border rounded-button shadow-sm flex items-center gap-2">
						<div className="size-2 rounded-full bg-success animate-pulse" />
						<span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
							Live Delta Sync
						</span>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<DashboardStats stats={stats} />

			<div className="grid gap-(--space-lg) lg:grid-cols-3">
				{/* Zone Status */}
				<ZoneSaturation areas={areas} />

				{/* Quick Actions */}
				<QuickActionProtocol />
			</div>
		</div>
	);
};

export default DashboardOverview;
