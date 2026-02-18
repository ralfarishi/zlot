import { Icon } from "@phosphor-icons/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/src/lib/utils";

interface StatItem {
	label: string;
	value: string | number;
	sub: string;
	icon: Icon;
	color: string;
	bg: string;
}

export const DashboardStats = ({ stats }: { stats: StatItem[] }) => {
	return (
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
	);
};
