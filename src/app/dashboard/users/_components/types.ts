export interface Profile {
	id: string;
	fullName: string;
	email: string;
	role: "admin" | "employee" | "owner";
	isActive: boolean;
	createdAt: Date;
}
