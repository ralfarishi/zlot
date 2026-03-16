export interface Profile {
	id: string;
	namaLengkap: string;
	email: string;
	role: "admin" | "petugas" | "owner";
	isActive: boolean;
	createdAt: Date;
}
