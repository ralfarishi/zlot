import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { profiles } from "./schema/profiles";
import { eq } from "drizzle-orm";

// ─── Admin Seed Credentials ───────────────────────────────
const ADMIN_EMAIL = "admin@zlot.com";
const ADMIN_PASSWORD = "password123";
const ADMIN_NAME = "Super Admin";
// ──────────────────────────────────────────────────────────

const requiredEnvVars = [
	"NEXT_PUBLIC_SUPABASE_URL",
	"SUPABASE_SERVICE_ROLE_KEY",
	"DATABASE_URL",
] as const;

const validateEnv = () => {
	const missing = requiredEnvVars.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		console.error(`Missing environment variables:\n  ${missing.join("\n  ")}`);
		console.error("\nSee .env.example for reference.");
		process.exit(1);
	}
};

const seed = async () => {
	validateEnv();

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
	const databaseUrl = process.env.DATABASE_URL!;

	// 1. Supabase admin client (bypasses RLS)
	const supabase = createClient(supabaseUrl, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	// 2. Drizzle connection
	const client = postgres(databaseUrl, { prepare: false });
	const db = drizzle(client);

	console.log("Seeding admin user...\n");

	// 3. Idempotency check
	const existing = await db.select().from(profiles).where(eq(profiles.role, "admin")).limit(1);

	if (existing.length > 0) {
		console.log("Admin profile already exists:");
		console.log(`  ID:    ${existing[0].id}`);
		console.log(`  Name:  ${existing[0].fullName}`);
		console.log(`  Role:  ${existing[0].role}`);
		console.log("\nSkipping seed. Delete the existing admin to re-seed.");
		await client.end();
		process.exit(0);
	}

	// 4. Create user in Supabase Auth
	const { data: authData, error: authError } = await supabase.auth.admin.createUser({
		email: ADMIN_EMAIL,
		password: ADMIN_PASSWORD,
		email_confirm: true,
		user_metadata: { full_name: ADMIN_NAME },
	});

	if (authError) {
		console.error("Failed to create auth user:", authError.message);
		await client.end();
		process.exit(1);
	}

	const userId = authData.user.id;
	console.log(`Auth user created: ${userId}`);

	// 5. Update the profile created by the handle_new_user() trigger
	//    The trigger auto-inserts a profile with role='employee'.
	//    We wait briefly for the trigger to complete, then promote to admin.
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const [profile] = await db
		.update(profiles)
		.set({
			fullName: ADMIN_NAME,
			role: "admin",
			isActive: true,
			updatedAt: new Date(),
		})
		.where(eq(profiles.id, userId))
		.returning();

	if (!profile) {
		console.error("Profile not found after auth user creation. Trigger may have failed.");
		await client.end();
		process.exit(1);
	}

	console.log(`Profile updated:  ${profile.id}`);
	console.log("");
	console.log("Admin account ready:");
	console.log(`  Email:    ${ADMIN_EMAIL}`);
	console.log(`  Password: ${ADMIN_PASSWORD}`);
	console.log(`  Role:     ${profile.role}`);
	console.log("");
	console.log("Change the password after first login!");

	await client.end();
	process.exit(0);
};

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
