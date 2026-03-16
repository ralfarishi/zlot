import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "petugas", "owner"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["motor", "mobil", "lainnya"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["masuk", "keluar"]);
export const paymentMethodEnum = pgEnum("payment_method", ["QRIS", "TUNAI"]);
