import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { db } from "./index";
import { profiles } from "./schema";
import { eq } from "drizzle-orm";
import { fileURLToPath } from "url";

export async function seedUsers() {
	console.log("👤 Seeding Users...");

	const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		console.error("❌ Missing Supabase credentials in environment variables.");
		return;
	}

	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	const OWNER_EMAIL = "admin@labalab.com";
	const OWNER_PASSWORD = "password123";
	const OWNER_NAME = "Supreme Architect";

	// 1. Create User in Auth
	let userId: string | null = null;

	const {
		data: { users },
		error: listError,
	} = await supabase.auth.admin.listUsers();

	if (listError) {
		console.error("❌ Failed to list users:", listError.message);
		return;
	}

	const existingUser = users.find((u) => u.email === OWNER_EMAIL);

	if (existingUser) {
		console.log(`ℹ️ User ${OWNER_EMAIL} already exists. ID: ${existingUser.id}`);
		userId = existingUser.id;
	} else {
		console.log(`Creating user ${OWNER_EMAIL}...`);
		const { data, error: createError } = await supabase.auth.admin.createUser({
			email: OWNER_EMAIL,
			password: OWNER_PASSWORD,
			email_confirm: true,
			user_metadata: { full_name: OWNER_NAME },
		});

		if (createError) {
			console.error("❌ Failed to create user:", createError.message);
			return;
		}

		if (data.user) {
			userId = data.user.id;
			console.log(`✅ User created. ID: ${userId}`);
		}
	}

	if (!userId) return;

	// 2. Insert or Update Profile
	// We want to force this user to have OWNER role.

	console.log("Updating profile for Owner...");

	// Check if profile exists
	const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, userId));

	if (existingProfile) {
		if (existingProfile.role !== "owner") {
			await db.update(profiles).set({ role: "owner" }).where(eq(profiles.id, userId));
			console.log("✅ Updated existing profile to owner role.");
		} else {
			console.log("ℹ️ Profile already has owner role.");
		}
	} else {
		await db.insert(profiles).values({
			id: userId,
			fullName: OWNER_NAME,
			role: "owner",
		});
		console.log("✅ Created profile with owner role.");
	}
}

// Allow running this file directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
	seedUsers()
		.then(() => {
			console.log("✅ Users seeding complete!");
			process.exit(0);
		})
		.catch((err) => {
			console.error("❌ Users seeding failed:", err);
			process.exit(1);
		});
}
