import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "employee" | "owner";

interface Profile {
	id: string;
	role: UserRole;
}

/**
 * Ensures user is authenticated. Returns user object.
 */
export const requireAuth = async () => {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return redirect("/login");
	}

	return user;
};

/**
 * Ensures user has at least one of the required roles.
 * Returns both the auth user and the profile row.
 */
export const requireRole = async (allowedRoles: UserRole[]) => {
	const user = await requireAuth();

	const supabase = await createClient();
	const { data: profile, error } = await supabase
		.from("profiles")
		.select("id, role")
		.eq("id", user.id)
		.single();

	if (error || !profile || !allowedRoles.includes(profile.role as UserRole)) {
		return redirect("/dashboard/unauthorized");
	}

	return { user, profile: profile as Profile };
};

/**
 * Validates Origin/Referer for CSRF protection in Server Actions.
 */
export const validateCSRF = (headers: Headers) => {
	const origin = headers.get("origin");
	const host = headers.get("host");

	if (origin && host && !origin.includes(host)) {
		throw new Error("CSRF detected: Invalid origin");
	}
};
