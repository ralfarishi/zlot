import { describe, it, expect } from "vitest";
import { insertProfileSchema } from "@/src/db/validations/profiles";

describe("profiles validation", () => {
	it("accepts valid profile", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			fullName: "John Doe",
			role: "admin",
			isActive: true,
		};
		expect(insertProfileSchema.parse(data)).toEqual(data);
	});

	it("fails for invalid ID", () => {
		const data = { id: "invalid-id", fullName: "John", role: "admin" };
		expect(() => insertProfileSchema.parse(data)).toThrow();
	});

	it("fails for short name", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			fullName: "J",
			role: "admin",
		};
		expect(() => insertProfileSchema.parse(data)).toThrow();
	});

	it("fails for invalid role", () => {
		const data = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			fullName: "John Doe",
			role: "super-admin",
		};
		expect(() => insertProfileSchema.parse(data)).toThrow();
	});
});
