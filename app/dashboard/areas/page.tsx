import type { Metadata } from "next";
import { getAreas } from "@/src/actions/parking-areas";
import { AreasManager } from "./areas-manager";
import { requireRole } from "@/src/lib/auth-guard";

export const metadata: Metadata = { title: "Parking Areas" };

const AreasPage = async () => {
	await requireRole(["admin"]);
	const areas = await getAreas();

	const serialized = areas.map((a) => ({
		id: a.id.toString(),
		areaName: a.areaName,
		capacity: a.capacity,
		occupied: a.occupied,
		updatedAt: a.updatedAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div>
				<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
					Zone Control
				</h1>
				<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
					Configure parking zones and monitor real-time capacity
				</p>
			</div>

			<AreasManager data={serialized} />
		</div>
	);
};

export default AreasPage;
