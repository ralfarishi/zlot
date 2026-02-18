import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "employee", "owner"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["motorcycle", "car", "other"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["entered", "exited"]);
export const paymentMethodEnum = pgEnum("payment_method", ["QRIS", "CASH"]);
