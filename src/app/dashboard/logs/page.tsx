import type { Metadata } from "next";
import { getActivityLogs } from "@/src/actions/activity-logs";
import { LogsList } from "./logs-list";
import { requireRole } from "@/src/lib/auth-guard";
import { getTranslator } from "@/src/lib/i18n/server";

export const metadata: Metadata = { title: "Activity Logs" };

const LOGS_PER_PAGE = 10;

const LogsPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; page?: string }>;
}) => {
	await requireRole(["admin"]);
	const params = await searchParams;
	const q = params.q?.toLowerCase() || "";
	const page = Math.max(1, parseInt(params.page || "1") || 1);
	const offset = (page - 1) * LOGS_PER_PAGE;
	const t = await getTranslator();

	const { data: logs, total } = await getActivityLogs({
		limit: LOGS_PER_PAGE,
		offset,
		search: q,
	});

	const serialized = logs.map((l) => ({
		id: l.id.toString(),
		activity: l.aktifitas,
		profileName: l.petugas?.namaLengkap ?? "System",
		createdAt: l.createdAt,
	}));

	return (
		<div className="space-y-(--space-lg)">
			<div>
				<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
					{t("logs.title")}
				</h1>
				<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
					{t("logs.subtitle")}
				</p>
			</div>

			<LogsList data={serialized} page={page} perPage={LOGS_PER_PAGE} total={total} />
		</div>
	);
};

export default LogsPage;
