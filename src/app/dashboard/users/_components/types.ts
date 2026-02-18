export interface Profile {
	id: string;
	fullName: string;
	role: "admin" | "employee" | "owner";
	isActive: boolean;
	createdAt: Date;
}
