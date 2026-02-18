import { requireRole } from "@/src/lib/auth-guard";

const UsersLayout = async ({ children }: { children: React.ReactNode }) => {
	await requireRole(["admin"]);
	return <>{children}</>;
};

export default UsersLayout;
