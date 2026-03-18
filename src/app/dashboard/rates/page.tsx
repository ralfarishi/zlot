import type { Metadata } from "next";
import { getRates } from "@/src/actions/rates";
import { RatesManager } from "./rates-manager";
import { CreateRateForm } from "./create-rate-form";
import { requireRole } from "@/src/lib/auth-guard";
import { getTranslator } from "@/src/lib/i18n/server";

export const metadata: Metadata = { title: "Rates" };

const RatesPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; sort?: string; order?: string }>;
}) => {
	await requireRole(["admin"]);
	const params = await searchParams;
	const t = await getTranslator();
	const q = params.q?.toLowerCase() || "";
	const sort = params.sort || "vehicleType";
	const order = params.order || "asc";

	const rates = await getRates();

	const filtered = rates.filter((r) => r.jenisKendaraan.toLowerCase().includes(q));

	const sorted = [...filtered].sort((a, b) => {
		let comparison = 0;
		if (sort === "jenisKendaraan") comparison = a.jenisKendaraan.localeCompare(b.jenisKendaraan);
		if (sort === "tarifPerJam") comparison = parseFloat(a.tarifPerJam) - parseFloat(b.tarifPerJam);
		if (sort === "updatedAt") comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
		return order === "asc" ? comparison : -comparison;
	});

	const serialized = sorted.map((r) => ({
		id: r.id.toString(),
		jenisKendaraan: r.jenisKendaraan,
		tarifPerJam: r.tarifPerJam,
		updatedAt: r.updatedAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
						{t("rates.title")}
					</h1>
					<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
						{t("rates.subtitle")}
					</p>
				</div>
				<CreateRateForm />
			</div>

			<RatesManager data={serialized} />
		</div>
	);
};

export default RatesPage;
