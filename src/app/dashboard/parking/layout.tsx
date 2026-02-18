import { requireRole } from "@/src/lib/auth-guard";

const ParkingLayout = async ({ children }: { children: React.ReactNode }) => {
	await requireRole(["admin", "employee"]);
	return <>{children}</>;
};

export default ParkingLayout;
