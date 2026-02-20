# ZLOT | Industrial Parking Management System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth/DB-3ECF8E?style=for-the-badge&logo=supabase)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)
[![React Doctor](https://www.react.doctor/share/badge?p=zlot&s=90&e=1&w=52&f=39)](https://www.react.doctor/share?p=zlot&s=90&e=1&w=52&f=39)

Zlot is a premium, high-density parking management terminal built for modern operations. It provides real-time operational telemetry, automated fee calculation, and comprehensive personnel management.

## 🚀 Quick Start

```bash
# Clone and Install
git clone <repo-url>
npm run install

# Configure Environment
cp .env.example .env

# Initialize Database
npm run db:generate
npm run db:migrate

# Launch
npm run dev
```

## 📖 Documentation

For detailed guides, please refer to the following:

- [**Installation Guide**](./docs/installation.md) - Full setup instructions.
- [**System Architecture**](./docs/architecture.md) - Deep dive into the tech stack and data flow.
- [**Feature Catalog**](./docs/features.md) - Detailed overview of operational modules.
- [**Debugging Log**](./docs/DEBUGGING.md) - Retrospective on resolved issues.

## ✨ Key Features

- **Mission Control Dashboard**: Real-time operational load and revenue telemetry.
- **Terminal Entry/Exit**: Blazing fast vehicle logging with automated rate calculation.
- **Zone Saturation Telemetry**: Visual capacity monitoring across multiple parking areas.
- **Role-Based Access**: Secure directory management for Admins, Owners, and Employees.
- **Thermal Receipt Support**: Professional settlement documents with print integration.

## 🛠 Tech Stack

- **Core**: Next.js 16 (App Router), TypeScript.
- **Data**: PostgreSQL, Drizzle ORM, Supabase Auth.
- **UI**: Tailwind CSS v4, Framer Motion, Phosphor Icons, Shadcn/UI.
- **State**: Nuqs (URL state), TanStack Query.

---

Built with absolute precision for high-performance enterprise needs.

