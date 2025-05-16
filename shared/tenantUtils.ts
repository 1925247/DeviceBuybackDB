import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { partners } from "./schema";

// Tenant configuration table - keeps track of tenants in our system
export const tenantConfigs = pgTable("tenant_configs", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id)
    .unique(),
  tablePrefix: text("table_prefix").notNull().unique(),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"), // Custom settings for the tenant
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for inserting tenant configurations
export const insertTenantConfigSchema = createInsertSchema(tenantConfigs);
export type InsertTenantConfig = z.infer<typeof insertTenantConfigSchema>;
export type TenantConfig = typeof tenantConfigs.$inferSelect;

/**
 * Helper function to create a table name with tenant prefix
 * @param partnerId - The partner ID for the tenant
 * @param tableName - The base table name
 * @returns The prefixed table name
 */
export function getTenantTableName(tablePrefix: string, tableName: string): string {
  return `${tablePrefix}_${tableName}`;
}

/**
 * Helper function to generate a standard table prefix from partner ID
 * @param partnerId - The partner ID for the tenant
 * @returns A standard table prefix for the tenant
 */
export function generateTablePrefix(partnerId: number): string {
  return `p${partnerId}`;
}