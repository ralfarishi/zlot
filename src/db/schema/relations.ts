import { relations } from "drizzle-orm";
import { profiles } from "./profiles";
import { vehicles } from "./vehicles";
import { rates } from "./rates";
import { parkingAreas } from "./parking-areas";
import { transactions } from "./transactions";
import { activityLogs } from "./activity-logs";

export const profilesRelations = relations(profiles, ({ many }) => ({
	vehicles: many(vehicles),
	transactions: many(transactions),
	logs: many(activityLogs),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
	owner: one(profiles, { fields: [vehicles.profileId], references: [profiles.id] }),
	transactions: many(transactions),
}));

export const ratesRelations = relations(rates, ({ many }) => ({
	transactions: many(transactions),
}));

export const parkingAreasRelations = relations(parkingAreas, ({ many }) => ({
	transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	vehicle: one(vehicles, { fields: [transactions.vehicleId], references: [vehicles.id] }),
	rate: one(rates, { fields: [transactions.rateId], references: [rates.id] }),
	employee: one(profiles, { fields: [transactions.profileId], references: [profiles.id] }),
	area: one(parkingAreas, { fields: [transactions.areaId], references: [parkingAreas.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	profile: one(profiles, { fields: [activityLogs.profileId], references: [profiles.id] }),
}));
