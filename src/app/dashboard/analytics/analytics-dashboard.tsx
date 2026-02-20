"use client";

import dynamic from "next/dynamic";
import {
	TrendUp,
	Users as UsersIcon,
	CurrencyDollar,
	Car,
	ArrowUpRight,
	ArrowDownRight,
} from "@phosphor-icons/react";
import { formatIDR } from "@/lib/utils";
import { m } from "framer-motion";

const RevenueTrends = dynamic(() => import("./charts").then((mod) => mod.RevenueTrends), {
	ssr: false,
	loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-surface-elevated/50" />,
});

const OccupancyDistribution = dynamic(
	() => import("./charts").then((mod) => mod.OccupancyDistribution),
	{
		ssr: false,
		loading: () => (
			<div className="h-full w-full animate-pulse rounded-xl bg-surface-elevated/50" />
		),
	},
);

interface Stats {
	dailyRevenue: number;
	revenueChange: number;
	activeVehicles: number;
	occupancyRate: number;
	peakHour: number | null;
}

interface RevenueDataPoint {
	name: string;
	revenue: number;
}

interface OccupancyDataPoint {
	name: string;
	value: number;
	color: string;
	capacity: number;
}

interface AnalyticsDashboardProps {
	stats: Stats;
	revenueData: RevenueDataPoint[];
	occupancyChartData: OccupancyDataPoint[];
}

export const AnalyticsDashboard = ({
	stats,
	revenueData,
	occupancyChartData,
}: AnalyticsDashboardProps) => {
	const statCards = [
		{
			label: "Daily Revenue",
			value: formatIDR(stats.dailyRevenue),
			change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`,
			trend: stats.revenueChange >= 0 ? "up" : "down",
			icon: CurrencyDollar,
			color: "text-success",
			bg: "bg-success/10",
		},
		{
			label: "Active Vehicles",
			value: stats.activeVehicles.toString(),
			change: "",
			trend: "up" as const,
			icon: Car,
			color: "text-secondary",
			bg: "bg-secondary/10",
		},
		{
			label: "Occupancy Rate",
			value: `${stats.occupancyRate}%`,
			change: "",
			trend: "up" as const,
			icon: UsersIcon,
			color: "text-accent-2",
			bg: "bg-accent-2/10",
		},
		{
			label: "Peak Load Time",
			value: stats.peakHour !== null ? `${String(stats.peakHour).padStart(2, "0")}:00` : "--:--",
			change: "",
			trend: "up" as const,
			icon: TrendUp,
			color: "text-accent-1",
			bg: "bg-accent-1/10",
		},
	];

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
						Operational Intelligence
					</h1>
					<p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-1">
						Visual insights & real-time performance telemetry
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 ring-1 ring-border shadow-sm">
					<div className="size-2 animate-pulse rounded-full bg-success" />
					<span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
						Telemetry Active
					</span>
				</div>
			</div>

			<div className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => {
					const Icon = stat.icon;
					return (
						<m.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="group relative overflow-hidden rounded-card border border-border bg-surface p-(--space-md) shadow-card transition-all hover:border-primary/20 hover:shadow-xl"
						>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
										{stat.label}
									</p>
									<p className="text-2xl font-black tracking-tighter text-text-primary">
										{stat.value}
									</p>
								</div>
								<div
									className={`flex size-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform`}
								>
									<Icon size={24} weight="bold" />
								</div>
							</div>
							{stat.change && (
								<div className="mt-4 flex items-center gap-2">
									<div
										className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter ${stat.trend === "up" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
									>
										{stat.trend === "up" ? (
											<ArrowUpRight size={10} weight="bold" />
										) : (
											<ArrowDownRight size={10} weight="bold" />
										)}
										{stat.change}
									</div>
									<span className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-30">
										vs Yesterday
									</span>
								</div>
							)}
						</m.div>
					);
				})}
			</div>

			<div className="grid gap-(--space-lg) lg:grid-cols-3">
				<m.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
					className="lg:col-span-2 rounded-card border border-border bg-surface p-(--space-lg) shadow-card flex flex-col h-[400px]"
				>
					<div className="flex items-center justify-between border-b border-border border-dashed pb-(--space-md) mb-(--space-lg)">
						<div>
							<h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
								Revenue Pipeline
							</h3>
							<p className="text-[9px] font-bold text-text-secondary uppercase opacity-40">
								7-Day Aggregated Stream
							</p>
						</div>
						<div className="flex gap-2">
							<div className="flex items-center gap-1.5">
								<div className="size-2 rounded-full bg-primary" />
								<span className="text-[9px] font-bold text-text-secondary uppercase">Revenue</span>
							</div>
						</div>
					</div>
					<div className="flex-1 min-h-0">
						<RevenueTrends data={revenueData} />
					</div>
				</m.div>

				<m.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.3 }}
					className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card flex flex-col h-[400px]"
				>
					<div className="flex items-center justify-between border-b border-border border-dashed pb-(--space-md) mb-(--space-lg)">
						<div>
							<h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
								Zone Distribution
							</h3>
							<p className="text-[9px] font-bold text-text-secondary uppercase opacity-40">
								Active Occupancy Map
							</p>
						</div>
						<UsersIcon size={16} className="text-text-secondary opacity-40" />
					</div>
					<div className="flex-1 min-h-0">
						<OccupancyDistribution data={occupancyChartData} />
					</div>
					<div className="mt-4 grid grid-cols-2 gap-2 border-t border-border border-dashed pt-4">
						{occupancyChartData.map((item) => (
							<div key={item.name} className="flex items-center gap-2 px-2">
								<div className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
								<span className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter">
									{item.name}
								</span>
							</div>
						))}
					</div>
				</m.div>
			</div>
		</div>
	);
};
