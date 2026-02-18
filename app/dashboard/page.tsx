import { requireRole } from "@/src/lib/auth-guard";
import {
	Garage,
	ChartLineUp,
	Users,
	CurrencyDollar,
	Clock,
	ArrowUpRight,
	Pulse,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { getAreas } from "@/src/actions/parking-areas";
import { db } from "@/src/db";
import { sql } from "drizzle-orm";
import { transactions, profiles, vehicles } from "@/src/db/schema";
import { cn, formatIDR } from "@/lib/utils";

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
			.where(sql`created_at >= now() - interval '24 hours'`)
			.then((res) => res[0].sum),
	]);

	const totalSpots = areas.reduce((acc, a) => acc + a.capacity, 0);
	const occupiedSpots = areas.reduce((acc, a) => acc + a.occupied, 0);
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
			<div className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="group relative overflow-hidden rounded-card border border-border bg-surface p-(--space-md) shadow-card transition-all hover:border-primary/20 hover:shadow-xl"
					>
						<div className="flex items-start justify-between">
							<div className={cn("rounded-xl p-2.5", stat.bg, stat.color)}>
								<stat.icon size={24} weight="duotone" />
							</div>
							<div className="h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
								<ArrowUpRight size={12} weight="bold" />
							</div>
						</div>
						<div className="mt-4">
							<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
								{stat.label}
							</p>
							<h3 className="text-2xl font-black tracking-tighter text-text-primary mt-1">
								{stat.value}
							</h3>
							<p className="text-[10px] font-bold text-text-secondary/40 uppercase mt-1">
								{stat.sub}
							</p>
						</div>
						<div className="absolute -bottom-2 -right-2 size-16 opacity-[0.03] transition-transform group-hover:scale-125">
							<stat.icon size={64} weight="fill" />
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-(--space-lg) lg:grid-cols-3">
				{/* Zone Status */}
				<div className="lg:col-span-2 rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
								Zone Saturation
							</h3>
							<p className="text-[10px] font-bold text-text-secondary uppercase opacity-50">
								Real-time capacity telemetry
							</p>
						</div>
						<Link
							href="/dashboard/areas"
							className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
						>
							Inspect All Zones
						</Link>
					</div>

					<div className="grid gap-(--space-md) sm:grid-cols-2">
						{areas.map((area) => {
							const percent = area.capacity > 0 ? (area.occupied / area.capacity) * 100 : 0;
							return (
								<div
									key={area.id}
									className="p-4 rounded-xl border border-border bg-surface-elevated/30"
								>
									<div className="flex items-center justify-between mb-3">
										<p className="text-xs font-black uppercase tracking-tight text-text-primary">
											{area.areaName}
										</p>
										<span className="text-[10px] font-bold text-text-secondary">
											{area.occupied}/{area.capacity}
										</span>
									</div>
									<div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
										<div
											className={cn(
												"h-full transition-all duration-1000",
												percent > 90 ? "bg-danger" : percent > 70 ? "bg-warning" : "bg-primary",
											)}
											style={{ width: `${percent}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
					<h3 className="text-sm font-black uppercase tracking-widest text-text-primary mb-6">
						Terminal Protocol
					</h3>
					<div className="space-y-3">
						<Link
							href="/dashboard/parking/entry"
							className="flex items-center gap-4 p-4 rounded-xl border border-border bg-success/5 hover:bg-success/10 transition-colors group"
						>
							<div className="size-10 flex items-center justify-center rounded-lg bg-success text-text-inverse shadow-lg shadow-success/20 group-hover:scale-110 transition-transform">
								<ArrowUpRight size={20} weight="bold" />
							</div>
							<div>
								<p className="text-xs font-black uppercase text-text-primary">Inject Entry</p>
								<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
									Log arrival signal
								</p>
							</div>
						</Link>
						<Link
							href="/dashboard/parking/exit"
							className="flex items-center gap-4 p-4 rounded-xl border border-border bg-danger/5 hover:bg-danger/10 transition-colors group"
						>
							<div className="size-10 flex items-center justify-center rounded-lg bg-danger text-text-inverse shadow-lg shadow-danger/20 group-hover:scale-110 transition-transform">
								<Clock size={20} weight="bold" />
							</div>
							<div>
								<p className="text-xs font-black uppercase text-text-primary">Authorize Exit</p>
								<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
									Compute final settlement
								</p>
							</div>
						</Link>
						<Link
							href="/dashboard/logs"
							className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-elevated hover:bg-border transition-colors group"
						>
							<div className="size-10 flex items-center justify-center rounded-lg bg-text-secondary text-text-inverse shadow-lg group-hover:scale-110 transition-transform">
								<ChartLineUp size={20} weight="bold" />
							</div>
							<div>
								<p className="text-xs font-black uppercase text-text-primary">Archival Log</p>
								<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
									Full history registry
								</p>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardOverview;
