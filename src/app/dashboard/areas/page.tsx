import type { Metadata } from "next";
import { getAreas } from "@/src/actions/parking-areas";
import { AreasManager } from "./areas-manager";
import { requireRole } from "@/src/lib/auth-guard";
import { getTranslator } from "@/src/lib/i18n/server";

export const metadata: Metadata = { title: "Parking Areas" };

const AreasPage = async () => {
	await requireRole(["admin"]);
	const areas = await getAreas();
	const t = await getTranslator();

	const serialized = areas.map((a) => ({
		id: a.id.toString(),
		namaArea: a.namaArea,
		kapasitas: a.kapasitas,
		terisi: a.terisi,
		updatedAt: a.updatedAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div>
				<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
					{t("areas.title")}
				</h1>
				<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
					{t("areas.subtitle")}
				</p>
			</div>

			<AreasManager data={serialized} />
		</div>
	);
};

export default AreasPage;
