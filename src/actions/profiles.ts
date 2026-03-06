"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

import { db } from "@/src/db";
import { profiles } from "@/src/db/schema";
import {
	insertProfileSchema,
	updateProfileSchema,
	type InsertProfile,
	type UpdateProfile,
} from "@/src/db/validations";
import { requireAuth, requireRole } from "@/src/lib/auth-guard";
import { logActivity } from "./activity-logs";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getProfiles = async () => {
	await requireRole(["admin", "owner"]);

	const profileList = await db.query.profiles.findMany({
		where: isNull(profiles.deletedAt),
	});

	try {
		const admin = createAdminClient();
		const {
			data: { users },
			error,
		} = await admin.auth.admin.listUsers();

		if (error) throw error;

		return profileList.map((p) => ({
			...p,
			email: users.find((u) => u.id === p.id)?.email ?? "N/A",
		}));
	} catch (err) {
		console.error("Failed to fetch auth emails:", err);
		return profileList.map((p) => ({ ...p, email: "N/A" }));
	}
};

export const getProfileById = async (id: string) => {
	await requireRole(["admin", "owner"]);
	return await db.query.profiles.findFirst({
		where: eq(profiles.id, id),
	});
};

export const createProfile = async (data: InsertProfile) => {
	await requireRole(["admin"]);
	const validated = insertProfileSchema.parse(data);

	const result = await db.insert(profiles).values(validated).returning();
	await logActivity(`Created profile for ${validated.fullName}`);
	revalidatePath("/dashboard/users");
	return result[0];
};

interface CreateUserData {
	email: string;
	password: string;
	fullName: string;
	role: "admin" | "employee" | "owner";
}

import { createAdminClient } from "@/src/lib/supabase/admin";

export const createUserWithProfile = async (data: CreateUserData) => {
	await requireRole(["admin"]);

	const { email, password, fullName, role } = data;
	const admin = createAdminClient();

	if (password.length < 8) {
		throw new Error("Password must be at least 8 characters.");
	}
	if (!/[A-Z]/.test(password)) {
		throw new Error("Password must contain at least one uppercase letter.");
	}
	if (!/[0-9]/.test(password)) {
		throw new Error("Password must contain at least one number.");
	}

	// 1. Create Auth User with auto-confirm enabled
	const { data: authData, error: authError } = await admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: {
			full_name: fullName,
		},
	});

	if (authError || !authData.user) {
		throw new Error(authError?.message || "Failed to create auth user");
	}

	const userId = authData.user.id;

	// 2. Handle Database Trigger
	// The DB trigger handle_new_user() auto-inserts a profile.
	// We wait briefly for the trigger to complete, then update it.
	let retryCount = 0;
	let profile = null;

	while (retryCount < 5 && !profile) {
		await new Promise((resolve) => setTimeout(resolve, 300));
		const [updatedProfile] = await db
			.update(profiles)
			.set({
				fullName,
				role,
				isActive: true,
				updatedAt: new Date(),
			})
			.where(eq(profiles.id, userId))
			.returning();

		profile = updatedProfile;
		retryCount++;
	}

	if (!profile) {
		throw new Error("Target profile artifact not found after provisioning. Check system triggers.");
	}

	await logActivity(`Provisioned system access for ${fullName} (${role})`);
	revalidatePath("/dashboard/users");
	return profile;
};

export const updateProfile = async (id: string, data: UpdateProfile) => {
	await requireRole(["admin"]);
	const validated = updateProfileSchema.parse(data);

	const result = await db
		.update(profiles)
		.set({ ...validated, updatedAt: new Date() })
		.where(eq(profiles.id, id))
		.returning();

	await logActivity(`Updated profile for ${result[0].fullName}`);
	revalidatePath("/dashboard/users");
	return result[0];
};

export const toggleProfileActive = async (id: string, isActive: boolean) => {
	await requireRole(["admin"]);

	const result = await db
		.update(profiles)
		.set({ isActive, updatedAt: new Date() })
		.where(eq(profiles.id, id))
		.returning();

	await logActivity(`${isActive ? "Activated" : "Deactivated"} profile for ${result[0].fullName}`);
	revalidatePath("/dashboard/users");
	return result[0];
};
export const deleteProfile = async (id: string) => {
	await requireRole(["admin"]);

	const result = await db
		.update(profiles)
		.set({ deletedAt: new Date() })
		.where(eq(profiles.id, id))
		.returning();

	await logActivity(`Soft-deleted profile for ${result[0].fullName}`);
	revalidatePath("/dashboard/users");
	return result[0];
};

export const logout = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/login");
};

/**
 * Updates a user's password.
 * Only allowed for:
 * 1. Admin updating any user.
 * 2. User updating their own password.
 */
export const updatePassword = async (targetUserId: string, newPassword: string) => {
	const auth = await requireAuth();
	const supabase = await createClient();

	// Check if admin
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", auth.id)
		.single();

	const isAdmin = profile?.role === "admin";
	const isSelf = auth.id === targetUserId;

	if (!isAdmin && !isSelf) {
		throw new Error("Unauthorized security escalation attempt detected.");
	}

	if (newPassword.length < 8) {
		throw new Error("Password must be at least 8 characters.");
	}
	if (!/[A-Z]/.test(newPassword)) {
		throw new Error("Password must contain at least one uppercase letter.");
	}
	if (!/[0-9]/.test(newPassword)) {
		throw new Error("Password must contain at least one number.");
	}

	if (isAdmin && !isSelf) {
		// Admin updating another user via Admin API
		const admin = createAdminClient();
		const { error } = await admin.auth.admin.updateUserById(targetUserId, {
			password: newPassword,
		});

		if (error) throw new Error(error.message);
		await logActivity(`Admin reset password for user artifact ${targetUserId.slice(-4)}`);
	} else {
		// User updating self via Client API
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) throw new Error(error.message);
		await logActivity(`User updated personal security credentials`);
	}

	return { success: true };
};
