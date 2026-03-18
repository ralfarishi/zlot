import { notFound } from "next/navigation";
import { getProfiles } from "@/src/actions/profiles";
import { EditUserForm } from "./edit-user-form";
import { requireRole } from "@/src/lib/auth-guard";
import { getTranslator } from "@/src/lib/i18n/server";

const EditUserPage = async ({ params }: { params: Promise<{ id: string }> }) => {
	await requireRole(["admin"]);
	const { id } = await params;
	const profiles = await getProfiles();
	const profile = profiles.find((p) => p.id === id);
	if (!profile) notFound();
	const t = await getTranslator();

	return (
		<div className="mx-auto max-w-lg">
			<h1 className="font-display text-2xl font-bold">{t("users.editTitle")}</h1>
			<p className="mt-[--space-xs] text-sm text-text-secondary">{t("users.editSubtitle")}</p>

			<EditUserForm profile={profile} />
		</div>
	);
};

export default EditUserPage;
