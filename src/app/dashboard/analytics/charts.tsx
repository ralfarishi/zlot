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

export const OperationalHeatmap = ({ data }: { data: { hour: number; count: number }[] }) => {
	// Map 24 hours
	const hours = Array.from({ length: 24 }, (_, i) => ({
		hour: i,
		count: data.find((d) => d.hour === i)?.count || 0,
	}));

	const maxCount = Math.max(...hours.map((h) => h.count), 1);

	return (
		<div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 h-full content-center">
			{hours.map((h) => (
				<div
					key={h.hour}
					className="aspect-square rounded-[4px] border border-white/5 transition-all hover:scale-110 hover:border-primary/50 relative group"
					style={{
						backgroundColor: `rgba(var(--color-primary-rgb, 14, 165, 233), ${Math.max(0.05, h.count / maxCount)})`,
					}}
					title={`${h.hour}:00 - ${h.count} entries avg`}
				>
					<span className="absolute inset-0 flex items-center justify-center text-[8px] font-black opacity-0 group-hover:opacity-100 text-text-inverse pointer-events-none">
						{h.hour}
					</span>
				</div>
			))}
		</div>
	);
};

export const RevenueVelocity = ({ data }: { data: { name: string; revenue: number }[] }) => {
	if (data.length === 0) return null;

	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
						<stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
					</linearGradient>
				</defs>
				<Area
					type="monotone"
					dataKey="revenue"
					stroke="var(--color-primary)"
					strokeWidth={1.5}
					fillOpacity={1}
					fill="url(#colorVelocity)"
					isAnimationActive={false}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};
