import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  buyerOrders: many(orders, { relationName: "buyer" }),
  sellerOrders: many(orders, { relationName: "seller" }),
  buybackRequests: many(buybackRequests),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password_hash: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(["user", "admin", "seller"]),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Devices Table
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  specs: text("specs"),
  condition: text("condition").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"),
  listed_date: timestamp("listed_date").defaultNow().notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const devicesRelations = relations(devices, ({ one, many }) => ({
  seller: one(users, {
    fields: [devices.seller_id],
    references: [users.id],
  }),
  images: many(deviceImages),
  marketplaceListing: one(marketplaceListings, {
    fields: [devices.id],
    references: [marketplaceListings.device_id],
  }),
  order: many(orders),
}));

export const insertDeviceSchema = createInsertSchema(devices, {
  name: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  status: z.enum(["active", "pending", "sold"]),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

// Device Images Table
export const deviceImages = pgTable("device_images", {
  id: serial("id").primaryKey(),
  device_id: integer("device_id").references(() => devices.id).notNull(),
  url: text("url").notNull(),
  is_primary: boolean("is_primary").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const deviceImagesRelations = relations(deviceImages, ({ one }) => ({
  device: one(devices, {
    fields: [deviceImages.device_id],
    references: [devices.id],
  }),
}));

export const insertDeviceImageSchema = createInsertSchema(deviceImages).omit({ id: true, created_at: true, updated_at: true });
export type InsertDeviceImage = z.infer<typeof insertDeviceImageSchema>;
export type DeviceImage = typeof deviceImages.$inferSelect;

// Buyback Requests Table
export const buybackRequests = pgTable("buyback_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  device_type: text("device_type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  condition: text("condition").notNull(),
  offered_price: decimal("offered_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const buybackRequestsRelations = relations(buybackRequests, ({ one }) => ({
  user: one(users, {
    fields: [buybackRequests.user_id],
    references: [users.id],
  }),
}));

export const insertBuybackRequestSchema = createInsertSchema(buybackRequests).omit({ id: true, created_at: true, updated_at: true });
export type InsertBuybackRequest = z.infer<typeof insertBuybackRequestSchema>;
export type BuybackRequest = typeof buybackRequests.$inferSelect;

// Marketplace Listings Table
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  device_id: integer("device_id").references(() => devices.id).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  device: one(devices, {
    fields: [marketplaceListings.device_id],
    references: [devices.id],
  }),
}));

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true, created_at: true, updated_at: true });
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyer_id: integer("buyer_id").references(() => users.id).notNull(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  device_id: integer("device_id").references(() => devices.id).notNull(),
  status: text("status").notNull().default("pending"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shipping_address: text("shipping_address"),
  tracking_number: text("tracking_number"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyer_id],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [orders.seller_id],
    references: [users.id],
    relationName: "seller",
  }),
  device: one(devices, {
    fields: [orders.device_id],
    references: [devices.id],
  }),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, created_at: true, updated_at: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
