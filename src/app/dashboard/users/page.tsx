import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getProfiles } from "@/src/actions/profiles";
import { UsersTable } from "./users-table";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Users" };

const UsersPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; sort?: string; order?: string }>;
}) => {
	const params = await searchParams;
	const q = params.q?.toLowerCase() || "";
	const sort = params.sort || "namaLengkap";
	const order = params.order || "asc";

	const profiles = await getProfiles();
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const currentUser = profiles.find((p) => p.id === user?.id);

	const filtered = profiles.filter(
		(p) => p.namaLengkap.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
	);

	const sorted = [...filtered].sort((a, b) => {
		let comparison = 0;
		if (sort === "namaLengkap") comparison = a.namaLengkap.localeCompare(b.namaLengkap);
		if (sort === "role") comparison = a.role.localeCompare(b.role);
		if (sort === "isActive") comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
		if (sort === "createdAt") comparison = a.createdAt.getTime() - b.createdAt.getTime();
		return order === "asc" ? comparison : -comparison;
	});

	const serialized = sorted.map((p) => ({
		id: p.id,
		namaLengkap: p.namaLengkap,
		email: p.email ?? "N/A",
		role: p.role as "admin" | "petugas" | "owner",
		isActive: p.isActive,
		createdAt: p.createdAt,
	}));

	return (
		<div className="space-y-(--space-md)">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">
						User Registry
					</h1>
					<p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-0.5">
						Manage system access for personnel & administrators
					</p>
				</div>
				<Link
					href="/dashboard/users/new"
					className="inline-flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-text-inverse shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
				>
					<Plus size={16} weight="bold" />
					Provision User
				</Link>
			</div>

			<UsersTable
				data={serialized}
				currentUser={
					currentUser
						? {
								id: currentUser.id,
								role: currentUser.role,
							}
						: undefined
				}
			/>
		</div>
	);
};

export default UsersPage;
