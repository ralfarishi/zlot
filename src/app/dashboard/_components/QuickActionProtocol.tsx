import Link from "next/link";
import { ArrowUpRight, Clock, ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { getTranslator } from "@/src/lib/i18n/server";

export const QuickActionProtocol = async () => {
	const t = await getTranslator();
	return (
		<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
			<h3 className="text-sm font-black uppercase tracking-widest text-text-primary mb-6">
				{t("quickAction.title")}
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
						<p className="text-xs font-black uppercase text-text-primary">{t("quickAction.entry.label")}</p>
						<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
							{t("quickAction.entry.sub")}
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
						<p className="text-xs font-black uppercase text-text-primary">{t("quickAction.exit.label")}</p>
						<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
							{t("quickAction.exit.sub")}
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
						<p className="text-xs font-black uppercase text-text-primary">{t("quickAction.logs.label")}</p>
						<p className="text-[10px] font-bold text-text-secondary uppercase opacity-60">
							{t("quickAction.logs.sub")}
						</p>
					</div>
				</Link>
			</div>
		</div>
	);
};
