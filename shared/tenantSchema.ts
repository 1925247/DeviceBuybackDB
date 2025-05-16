import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { partners } from "./schema";

// Tenant configuration table
export const tenantConfigs = pgTable("tenant_configs", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id)
    .unique(),
  schemaName: text("schema_name").notNull().unique(),
  databaseUrl: text("database_url"),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"), // Custom settings for the tenant
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for inserting tenant configurations
export const insertTenantConfigSchema = createInsertSchema(tenantConfigs);
export type InsertTenantConfig = z.infer<typeof insertTenantConfigSchema>;
export type TenantConfig = typeof tenantConfigs.$inferSelect;