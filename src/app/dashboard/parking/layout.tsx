import { requireRole } from "@/src/lib/auth-guard";

const ParkingLayout = async ({ children }: { children: React.ReactNode }) => {
	await requireRole(["admin", "petugas"]);
	return <>{children}</>;
};

export default ParkingLayout;
