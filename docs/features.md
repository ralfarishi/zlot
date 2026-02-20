# Feature Catalog

Zlot is a comprehensive parking management solution designed for real-time operational control.

## 🟢 Operations (Core)

- **Vehicle Entry (Injection)**:
  - Real-time plate registration.
  - Automatic zone assignment and rate calculation.
  - QR Code / Reference number generation.
- **Vehicle Exit (Settlement)**:
  - Automatic duration calculation (hourly/flat).
  - Multi-method payment support (QRIS, Cash).
  - Receipt generation and printing support via `react-to-print`.
- **Live Registry**:
  - Filterable list of all currently "Entered" vehicles.
  - One-click exit authorization.

## 📊 Intelligence (Analytics)

- **Mission Control Dashboard**:
  - Real-time Ops Load (Occupancy Rate).
  - Daily Revenue (Yield) tracking.
  - Active operators and fleet registry totals.
- **Zone Saturation**:
  - Visual telemetry of parking area capacity.
  - Color-coded warnings for high-saturation zones.
- **Archival Registry (History)**:
  - Full audit trail of every parking session.
  - Detailed receipt retrieval for past transactions.

## 🛠 Administration (Management)

- **Zone Manager**:
  - Define custom parking areas and their capacities.
- **Rate Engine**:
  - Configure hourly rates and vehicle type multipliers.
- **Personnel Directory**:
  - Full lifecycle management of operator profiles (Create, Update, Deactivate, Delete).
  - Synchronized provisioning with Supabase Auth for unified access.
- **Role-Based Access Control (RBAC)**:
  - Strict enforcement of functional permissions across Server Actions and UI routes.
  - Hierarchical permission matrix ensuring data sovereignty.
- **Vehicle Database**:
  - Centralized registry of all verified units.

## 🔐 RBAC Permission Matrix

Zlot implements a strict Role-Based Access Control system to ensure operational security:

| Feature                     | Admin | Owner | Employee |
| :-------------------------- | :---: | :---: | :------: |
| **Operational Entry/Exit**  |  ✅   |  ✅   |    ✅    |
| **Operational Analytics**   |  ✅   |  ✅   |    ❌    |
| **Manage Personnel/Users**  |  ✅   |  ❌   |    ❌    |
| **Modify Rates/Prices**     |  ✅   |  ❌   |    ❌    |
| **Configure Parking Zones** |  ✅   |  ❌   |    ❌    |
| **View Audit Logs (All)**   |  ✅   |  ✅   |    ❌    |
| **Delete/Edit Records**     |  ✅   |  ❌   |    ❌    |

## 🛡 System Security

- **Supabase Auth**: Secure authentication and session management.
- **CSRF Protection**: Native origin validation for all server actions.
- **Audit Logs**: Automatic logging of critical system events.
