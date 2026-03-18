import type { Metadata } from "next";
import {
	getAnalyticsStats,
	getRevenueByDay,
	getOccupancyByArea,
	getHourlyLoadData,
	getZonePerformance,
	getRevenueVelocity,
} from "@/src/actions/transactions";
import { requireRole } from "@/src/lib/auth-guard";
import { AnalyticsDashboard } from "./analytics-dashboard";

export const metadata: Metadata = {
	title: "Operational Intelligence | Zlot",
};

const ZONE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const AnalyticsPage = async () => {
	await requireRole(["admin", "owner"]);
	const [stats, revenueData, occupancyData, heatmapData, zonePerformance, revenueVelocity] =
		await Promise.all([
			getAnalyticsStats(),
			getRevenueByDay(7),
			getOccupancyByArea(),
			getHourlyLoadData(),
			getZonePerformance(),
			getRevenueVelocity(),
		]);

	const occupancyChartData = occupancyData.map((a, i) => ({
		...a,
		color: ZONE_COLORS[i % ZONE_COLORS.length],
	}));

	return (
		<div className="space-y-(--space-lg)">
			<AnalyticsDashboard
				stats={stats}
				revenueData={revenueData}
				occupancyChartData={occupancyChartData}
				heatmapData={heatmapData}
				zonePerformance={zonePerformance}
				revenueVelocity={revenueVelocity}
			/>
		</div>
	);
};

export default AnalyticsPage;
