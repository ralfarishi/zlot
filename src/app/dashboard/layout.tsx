import { requireAuth } from "@/src/lib/auth-guard";
import { createClient } from "@/src/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import type { UserRole } from "@/src/lib/auth-guard";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
	const user = await requireAuth();
	const supabase = await createClient();

	const { data: profile } = await supabase
		.from("profil")
		.select("nama_lengkap, role")
		.eq("id", user.id)
		.single();

	const userName = profile?.nama_lengkap ?? user.email ?? "User";
	const userRole = (profile?.role ?? "petugas") as UserRole;

	return (
		<DashboardShell userName={userName} userRole={userRole}>
			{children}
		</DashboardShell>
	);
};

export default DashboardLayout;
