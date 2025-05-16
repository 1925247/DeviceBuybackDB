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

/**
 * Tenant configuration table to store tenant-specific settings
 */
export const tenantConfigs = pgTable("tenant_configs", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id)
    .unique(),
  tenantId: text("tenant_id").notNull().unique(),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define schemas for tenant configuration
export const insertTenantConfigSchema = createInsertSchema(tenantConfigs);
export type InsertTenantConfig = z.infer<typeof insertTenantConfigSchema>;
export type TenantConfig = typeof tenantConfigs.$inferSelect;

/**
 * Partner-specific inventory table
 */
export const partnerInventory = pgTable("partner_inventory", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  deviceModelId: integer("device_model_id").notNull(),
  condition: text("condition").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: integer("price").notNull(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define schemas for partner inventory
export const insertPartnerInventorySchema = createInsertSchema(partnerInventory);
export type InsertPartnerInventory = z.infer<typeof insertPartnerInventorySchema>;
export type PartnerInventory = typeof partnerInventory.$inferSelect;

/**
 * Partner-specific price rules
 */
export const partnerPriceRules = pgTable("partner_price_rules", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  deviceModelId: integer("device_model_id").notNull(),
  conditionFactor: integer("condition_factor").notNull().default(100),
  basePrice: integer("base_price").notNull(),
  minPrice: integer("min_price").notNull(),
  maxPrice: integer("max_price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define schemas for partner price rules
export const insertPartnerPriceRuleSchema = createInsertSchema(partnerPriceRules);
export type InsertPartnerPriceRule = z.infer<typeof insertPartnerPriceRuleSchema>;
export type PartnerPriceRule = typeof partnerPriceRules.$inferSelect;

/**
 * Partner-specific leads
 */
export const partnerLeads = pgTable("partner_leads", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  userId: integer("user_id"),
  deviceModelId: integer("device_model_id"),
  estimatedValue: integer("estimated_value"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  assignedStaffId: integer("assigned_staff_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define schemas for partner leads
export const insertPartnerLeadSchema = createInsertSchema(partnerLeads);
export type InsertPartnerLead = z.infer<typeof insertPartnerLeadSchema>;
export type PartnerLead = typeof partnerLeads.$inferSelect;

/**
 * Functions to help with tenant isolation
 */

/**
 * Generate tenant ID from partner ID
 * @param partnerId - The partner ID
 * @returns A standardized tenant ID
 */
export function generateTenantId(partnerId: number): string {
  return `partner_${partnerId}`;
}

/**
 * Helper function to add tenant context to a database query
 * @param query - The base query
 * @param partnerId - The partner ID to filter by
 * @returns The query with tenant filter
 */
export function withTenantContext(query: any, partnerId: number): any {
  // This will depend on the specific ORM and query builder being used
  // For a simple approach, we can just add a partnerId filter
  return query.where({ partnerId });
}