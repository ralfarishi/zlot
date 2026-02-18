"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatIDR } from "@/lib/utils";

interface RevenueDataPoint {
	name: string;
	revenue: number;
}

interface OccupancyDataPoint {
	name: string;
	value: number;
	color: string;
}

export const RevenueTrends = ({ data }: { data: RevenueDataPoint[] }) => {
	const chartData = data.length > 0 ? data : [{ name: "No data", revenue: 0 }];

	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
				<defs>
					<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
						<stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					vertical={false}
					stroke="var(--color-border)"
					opacity={0.5}
				/>
				<XAxis
					dataKey="name"
					axisLine={false}
					tickLine={false}
					tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "bold" }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "bold" }}
					tickFormatter={(v: number) => formatIDR(v)}
				/>
				<Tooltip
					formatter={(value) => [formatIDR(Number(value)), "Revenue"]}
					contentStyle={{
						backgroundColor: "var(--color-surface)",
						borderColor: "var(--color-border)",
						borderRadius: "12px",
						fontSize: "12px",
						fontWeight: "bold",
						boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
					}}
				/>
				<Area
					type="monotone"
					dataKey="revenue"
					stroke="var(--color-primary)"
					strokeWidth={3}
					fillOpacity={1}
					fill="url(#colorRevenue)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export const OccupancyDistribution = ({ data }: { data: OccupancyDataPoint[] }) => {
	const chartData = data.length > 0 ? data : [{ name: "No zones", value: 1, color: "#6b7280" }];

	return (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={80}
					paddingAngle={5}
					dataKey="value"
				>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				<Tooltip
					formatter={(value) => [`${value} vehicles`]}
					contentStyle={{
						backgroundColor: "var(--color-surface)",
						borderColor: "var(--color-border)",
						borderRadius: "12px",
						fontSize: "12px",
					}}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
};
