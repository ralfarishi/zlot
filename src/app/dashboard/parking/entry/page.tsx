import { ArrowLeft, IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { getAreas } from "@/src/actions/parking-areas";
import { EntryForm } from "./entry-form";

export const metadata: Metadata = {
	title: "Vehicle Entry | Zlot",
};

const EntryPage = async () => {
	const areas = await getAreas();

	const serializedAreas = areas.map((a) => ({
		id: a.id.toString(),
		namaArea: a.namaArea,
		kapasitas: a.kapasitas,
		terisi: a.terisi,
	}));

	return (
		<div className="mx-auto max-w-2xl space-y-(--space-lg)">
			<Link
				href="/dashboard/parking"
				className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
			>
				<ArrowLeft
					size={14}
					weight="bold"
					className="transition-transform group-hover:-translate-x-1"
				/>
				Back to Console
			</Link>

			<div className="rounded-card border border-border bg-surface shadow-card overflow-hidden backdrop-blur-md">
				<div className="border-b border-border bg-surface-elevated/50 p-(--space-lg)">
					<div className="flex items-center gap-(--space-md)">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-text-inverse shadow-xl shadow-primary/20 ring-4 ring-primary/10">
							<IdentificationCard size={32} weight="bold" />
						</div>
						<div>
							<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
								Vehicle Entry
							</h1>
							<p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-0.5">
								Telemetry injection for new arrivals
							</p>
						</div>
					</div>
				</div>

				<EntryForm areas={serializedAreas} />
			</div>
		</div>
	);
};

export default EntryPage;
