import type { Metadata } from "next";
import { getAnalyticsStats, getRevenueByDay, getOccupancyByArea } from "@/src/actions/transactions";
import { requireRole } from "@/src/lib/auth-guard";
import { AnalyticsDashboard } from "./analytics-dashboard";

export const metadata: Metadata = {
	title: "Operational Intelligence | Zlot",
};

const ZONE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const AnalyticsPage = async () => {
	await requireRole(["admin", "owner"]);
	const [stats, revenueData, occupancyData] = await Promise.all([
		getAnalyticsStats(),
		getRevenueByDay(7),
		getOccupancyByArea(),
	]);

	const occupancyChartData = occupancyData.map((a, i) => ({
		...a,
		color: ZONE_COLORS[i % ZONE_COLORS.length],
	}));

	return (
		<AnalyticsDashboard
			stats={stats}
			revenueData={revenueData}
			occupancyChartData={occupancyChartData}
		/>
	);
};

export default AnalyticsPage;
