import { requireRole } from "@/src/lib/auth-guard";
import type { Metadata } from "next";
import { getVehicles } from "@/src/actions/vehicles";
import { VehiclesTable } from "./vehicles-table";
import { getTranslator } from "@/src/lib/i18n/server";

export const metadata: Metadata = { title: "Vehicles" };

const VehiclesPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; type?: string; sort?: string; order?: string }>;
}) => {
	await requireRole(["admin", "owner"]);
	const params = await searchParams;
	const t = await getTranslator();
	const q = params.q?.toLowerCase() || "";
	const type = params.type || "all";
	const sort = params.sort || "platNomor";
	const order = params.order || "asc";

	const vehicles = await getVehicles();

	const filtered = vehicles.filter((v) => {
		const matchesSearch =
			v.platNomor.toLowerCase().includes(q) || (v.namaPemilik?.toLowerCase().includes(q) ?? false);
		const matchesType = type === "all" || v.jenisKendaraan === type;
		return matchesSearch && matchesType;
	});

	const sorted = [...filtered].sort((a, b) => {
		let comparison = 0;
		if (sort === "platNomor") comparison = a.platNomor.localeCompare(b.platNomor);
		if (sort === "jenisKendaraan") comparison = a.jenisKendaraan.localeCompare(b.jenisKendaraan);
		if (sort === "namaPemilik") comparison = (a.namaPemilik || "").localeCompare(b.namaPemilik || "");
		if (sort === "createdAt") comparison = a.createdAt.getTime() - b.createdAt.getTime();
		return order === "asc" ? comparison : -comparison;
	});

	const serialized = sorted.map((v) => ({
		id: v.id.toString(),
		platNomor: v.platNomor,
		jenisKendaraan: v.jenisKendaraan,
		warna: v.warna,
		namaPemilik: v.namaPemilik,
		createdAt: v.createdAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div>
				<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
					{t("vehicles.title")}
				</h1>
				<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
					{t("vehicles.subtitle")}
				</p>
			</div>

			<VehiclesTable data={serialized} />
		</div>
	);
};

export default VehiclesPage;
