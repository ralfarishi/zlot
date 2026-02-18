import Link from "next/link";
import { ArrowUpRight, Clock, ChartLineUp } from "@phosphor-icons/react/dist/ssr";

export const QuickActionProtocol = () => {
	return (
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
	);
};
