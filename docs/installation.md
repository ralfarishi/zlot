# Project Installation & Setup

This guide provides step-by-step instructions to get the Zlot Parking Management System running on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v20 or higher recommended)
- **npm** or **bun** (bun is recommended for speed)
- **PostgreSQL** (Local or via Supabase)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zlot
```

### 2. Install Dependencies

Using bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and fill in your credentials.

```bash
cp .env.example .env
```

Key variables required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
- `DATABASE_URL`: Your PostgreSQL connection string (Direct connection recommended for migrations).
- `SUPABASE_SERVICE_ROLE_KEY`: Required for administrative auth tasks.

### 4. Supabase Setup (RLS & RPC)

Since Zlot uses Supabase for Auth and Row Level Security, you must execute the SQL scripts found in `src/db/supabase` via the Supabase SQL Editor:

1. Run `rpc-functions.sql` first to create the `get_my_role()` helper and the `handle_new_user()` automation.
2. Run `rls-policies.sql` to enable security on all tables.

### 5. Database Initialization

Generate and apply the database migrations using Drizzle Kit.

```bash
# Generate migrations
npm run db:generate

# Apply migrations to the database
npm run db:migrate
```

### 6. Seed Administrative Access (Required)

To access the dashboard, you **must** seed the initial admin account. This script creates an Auth user in Supabase and promotes their profile to the `admin` role.

```bash
npm run db:seed
```

**Default Credentials:**

- **Email:** `admin@zlot.com`
- **Password:** `password123`

#### Security Recommendation

(Change these credentials immediately after your first login!)

### 7. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the terminal.
