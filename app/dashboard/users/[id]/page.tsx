import { getProfileById } from "@/src/actions/profiles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EditUserForm } from "./edit-user-form";

export const metadata: Metadata = { title: "Edit User" };

const EditUserPage = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	const profile = await getProfileById(id);

	if (!profile) notFound();

	return (
		<div className="mx-auto max-w-lg">
			<h1 className="font-display text-2xl font-bold">Edit User</h1>
			<p className="mt-[var(--space-xs)] text-sm text-text-secondary">
				Update user profile details
			</p>

			<EditUserForm profile={profile} />
		</div>
	);
};

export default EditUserPage;
