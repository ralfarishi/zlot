import {
	SteeringWheel,
	Timer,
	CheckCircle,
	Warning,
	IdentificationCard,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Parking Console | Zlot",
};

import { getAreas } from "@/src/actions/parking-areas";
import { getTranslator } from "@/src/lib/i18n/server";

const ParkingConsolePage = async () => {
	const areas = await getAreas();
	const t = await getTranslator();

	interface ParkingAction {
		label: string;
		description: string;
		href: string;
		icon: React.ElementType;
		iconWeight?: "fill" | "duotone" | "bold" | "light" | "regular" | "thin";
		color: string;
		shadow: string;
	}

	const actions: ParkingAction[] = [
		{
			label: t("parking.action.entry"),
			description: t("parking.action.entry.description"),
			href: "/dashboard/parking/entry",
			icon: IdentificationCard,
			color: "bg-success/10 text-success",
			shadow: "shadow-success/20",
		},
		{
			label: t("parking.action.exit"),
			description: t("parking.action.exit.description"),
			href: "/dashboard/parking/exit",
			icon: SteeringWheel,
			iconWeight: "fill",
			color: "bg-danger/10 text-danger",
			shadow: "shadow-danger/20",
		},
		{
			label: t("parking.action.active"),
			description: t("parking.action.active.description"),
			href: "/dashboard/parking/active",
			icon: Timer,
			color: "bg-accent-2/10 text-accent-2",
			shadow: "shadow-accent-2/20",
		},
	];

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
						{t("parking.title")}
					</h1>
					<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
						{t("parking.subtitle")}
					</p>
				</div>
				<div className="flex items-center gap-3 rounded-button bg-success/5 px-4 py-2 ring-1 ring-success/20">
					<div className="size-2 animate-pulse rounded-full bg-success shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]" />
					<span className="text-[10px] font-black uppercase tracking-widest text-success">
						{t("parking.opsLive")}
					</span>
				</div>
			</div>

			<div className="grid gap-(--space-lg) md:grid-cols-3">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.label}
							href={action.href}
							className="group relative overflow-hidden rounded-card border-2 border-transparent bg-surface p-(--space-lg) shadow-card transition-all hover:border-primary/20 hover:shadow-xl active:scale-95"
						>
							<div
								className={`mb-(--space-md) flex size-14 items-center justify-center rounded-2xl ${action.color} ${action.shadow} transition-transform group-hover:scale-110 group-hover:rotate-3`}
							>
								<Icon size={32} weight={action.iconWeight || "duotone"} />
							</div>
							<h3 className="text-lg font-bold text-text-primary">{action.label}</h3>
							<p className="mt-1 text-sm text-text-secondary">{action.description}</p>
							<div className="absolute -bottom-4 -right-4 size-24 transform opacity-5 transition-transform group-hover:scale-150 group-hover:opacity-10">
								<Icon size={96} weight="fill" />
							</div>
						</Link>
					);
				})}
			</div>

			<div className="rounded-card border border-border bg-surface p-(--space-lg) shadow-card">
				<div className="mb-(--space-md) flex items-center justify-between">
					<h3 className="text-sm font-bold text-text-primary">{t("parking.summary.title")}</h3>
					<span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
						{t("parking.summary.subtitle")}
					</span>
				</div>
				<div className="grid gap-(--space-md) sm:grid-cols-2 lg:grid-cols-4">
					{areas.length === 0 ? (
						<div className="col-span-full py-8 text-center text-xs font-bold text-text-secondary uppercase opacity-20 italic">
							{t("parking.summary.empty")}
						</div>
					) : (
						areas.map((area) => {
							const percentage = (area.terisi / area.kapasitas) * 100;
							const status = percentage > 90 ? "full" : percentage > 70 ? "active" : "stable";

							return (
								<div
									key={area.id.toString()}
									className="flex flex-col gap-2 rounded-xl border border-border bg-surface-elevated/50 p-(--space-md) shadow-sm"
								>
									<div className="flex items-center justify-between">
										<p className="text-xs font-black text-text-primary uppercase tracking-tight">
											{area.namaArea}
										</p>
										{status === "full" ? (
											<Warning size={14} className="text-danger" weight="bold" />
										) : (
											<CheckCircle size={14} className="text-success" />
										)}
									</div>
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
										<div
											className={`h-full transition-all duration-1000 ${percentage > 90 ? "bg-danger" : percentage > 70 ? "bg-warning" : "bg-primary"}`}
											style={{ width: `${percentage}%` }}
										/>
									</div>
									<div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">
										<span>
											{area.terisi} / {area.kapasitas} {t("parking.summary.slot")}
										</span>
										<span>{Math.round(percentage)}%</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
};

export default ParkingConsolePage;
