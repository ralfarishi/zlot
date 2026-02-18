import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface Area {
	id: bigint;
	areaName: string;
	capacity: number;
	occupied: number;
}

export const ZoneSaturation = ({ areas }: { areas: Area[] }) => {
	return (
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
							key={area.id.toString()}
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
	);
};
