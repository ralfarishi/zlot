import { requireRole } from "@/src/lib/auth-guard";
import type { Metadata } from "next";
import { getVehicles } from "@/src/actions/vehicles";
import { VehiclesTable } from "./vehicles-table";

export const metadata: Metadata = { title: "Vehicles" };

const VehiclesPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; type?: string; sort?: string; order?: string }>;
}) => {
	await requireRole(["admin", "owner"]);
	const params = await searchParams;
	const q = params.q?.toLowerCase() || "";
	const type = params.type || "all";
	const sort = params.sort || "plateNumber";
	const order = params.order || "asc";

	const vehicles = await getVehicles();

	const filtered = vehicles.filter((v) => {
		const matchesSearch =
			v.plateNumber.toLowerCase().includes(q) || (v.ownerName?.toLowerCase().includes(q) ?? false);
		const matchesType = type === "all" || v.vehicleType === type;
		return matchesSearch && matchesType;
	});

	const sorted = [...filtered].sort((a, b) => {
		let comparison = 0;
		if (sort === "plateNumber") comparison = a.plateNumber.localeCompare(b.plateNumber);
		if (sort === "vehicleType") comparison = a.vehicleType.localeCompare(b.vehicleType);
		if (sort === "ownerName") comparison = (a.ownerName || "").localeCompare(b.ownerName || "");
		if (sort === "createdAt") comparison = a.createdAt.getTime() - b.createdAt.getTime();
		return order === "asc" ? comparison : -comparison;
	});

	const serialized = sorted.map((v) => ({
		id: v.id.toString(),
		plateNumber: v.plateNumber,
		vehicleType: v.vehicleType,
		color: v.color,
		ownerName: v.ownerName,
		createdAt: v.createdAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div>
				<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
					Vehicle Registry
				</h1>
				<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
					Monitor all registered vehicle artifacts in the system
				</p>
			</div>

			<VehiclesTable data={serialized} />
		</div>
	);
};

export default VehiclesPage;
