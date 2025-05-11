import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey, unique, index, json } from "drizzle-orm/pg-core";
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

// Device Types Table
export const deviceTypes = pgTable("device_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  active: boolean("active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const deviceTypesRelations = relations(deviceTypes, ({ many }) => ({
  brands: many(brandDeviceTypes),
  models: many(deviceModels),
}));

export const insertDeviceTypeSchema = createInsertSchema(deviceTypes, {
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().min(1),
  active: z.boolean(),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertDeviceType = z.infer<typeof insertDeviceTypeSchema>;
export type DeviceType = typeof deviceTypes.$inferSelect;

// Brands Table
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo").notNull(),
  active: boolean("active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  deviceTypes: many(brandDeviceTypes),
  models: many(deviceModels),
}));

export const insertBrandSchema = createInsertSchema(brands, {
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().min(1),
  active: z.boolean(),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

// Brand-DeviceType Relationship Table
export const brandDeviceTypes = pgTable("brand_device_types", {
  id: serial("id").primaryKey(),
  brand_id: integer("brand_id").references(() => brands.id).notNull(),
  device_type_id: integer("device_type_id").references(() => deviceTypes.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.brand_id, t.device_type_id),
}));

export const brandDeviceTypesRelations = relations(brandDeviceTypes, ({ one }) => ({
  brand: one(brands, {
    fields: [brandDeviceTypes.brand_id],
    references: [brands.id],
  }),
  deviceType: one(deviceTypes, {
    fields: [brandDeviceTypes.device_type_id],
    references: [deviceTypes.id],
  }),
}));

// Device Models Table
export const deviceModels = pgTable("device_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  brand_id: integer("brand_id").references(() => brands.id).notNull(),
  device_type_id: integer("device_type_id").references(() => deviceTypes.id).notNull(),
  active: boolean("active").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  variants: json("variants").$type<string[]>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const deviceModelsRelations = relations(deviceModels, ({ one }) => ({
  brand: one(brands, {
    fields: [deviceModels.brand_id],
    references: [brands.id],
  }),
  deviceType: one(deviceTypes, {
    fields: [deviceModels.device_type_id],
    references: [deviceTypes.id],
  }),
}));

export const insertDeviceModelSchema = createInsertSchema(deviceModels, {
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().min(1),
  active: z.boolean(),
  featured: z.boolean(),
  variants: z.array(z.string()).optional(),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertDeviceModel = z.infer<typeof insertDeviceModelSchema>;
export type DeviceModel = typeof deviceModels.$inferSelect;

// Condition Questions Table
export const conditionQuestions = pgTable("condition_questions", {
  id: serial("id").primaryKey(),
  device_type_id: integer("device_type_id").references(() => deviceTypes.id).notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  active: boolean("active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const conditionQuestionsRelations = relations(conditionQuestions, ({ one, many }) => ({
  deviceType: one(deviceTypes, {
    fields: [conditionQuestions.device_type_id],
    references: [deviceTypes.id],
  }),
  answers: many(conditionAnswers),
}));

// Condition Answers Table
export const conditionAnswers = pgTable("condition_answers", {
  id: serial("id").primaryKey(),
  question_id: integer("question_id").references(() => conditionQuestions.id).notNull(),
  answer: text("answer").notNull(),
  impact: decimal("impact", { precision: 5, scale: 2 }).notNull(),
  order: integer("order").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const conditionAnswersRelations = relations(conditionAnswers, ({ one }) => ({
  question: one(conditionQuestions, {
    fields: [conditionAnswers.question_id],
    references: [conditionQuestions.id],
  }),
}));

// Diagnostic Questions Table
export const diagnosticQuestions = pgTable("diagnostic_questions", {
  id: serial("id").primaryKey(),
  device_type_id: integer("device_type_id").references(() => deviceTypes.id).notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  active: boolean("active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const diagnosticQuestionsRelations = relations(diagnosticQuestions, ({ one, many }) => ({
  deviceType: one(deviceTypes, {
    fields: [diagnosticQuestions.device_type_id],
    references: [deviceTypes.id],
  }),
  answers: many(diagnosticAnswers),
}));

// Diagnostic Answers Table
export const diagnosticAnswers = pgTable("diagnostic_answers", {
  id: serial("id").primaryKey(),
  question_id: integer("question_id").references(() => diagnosticQuestions.id).notNull(),
  answer: text("answer").notNull(),
  is_pass: boolean("is_pass").notNull(),
  order: integer("order").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const diagnosticAnswersRelations = relations(diagnosticAnswers, ({ one }) => ({
  question: one(diagnosticQuestions, {
    fields: [diagnosticAnswers.question_id],
    references: [diagnosticQuestions.id],
  }),
}));

// Valuation Table
export const valuations = pgTable("valuations", {
  id: serial("id").primaryKey(),
  device_model_id: integer("device_model_id").references(() => deviceModels.id).notNull(),
  base_price: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  condition_excellent: decimal("condition_excellent", { precision: 5, scale: 2 }).notNull(),
  condition_good: decimal("condition_good", { precision: 5, scale: 2 }).notNull(),
  condition_fair: decimal("condition_fair", { precision: 5, scale: 2 }).notNull(),
  condition_poor: decimal("condition_poor", { precision: 5, scale: 2 }).notNull(),
  variant_multipliers: json("variant_multipliers").$type<Record<string, number>>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const valuationsRelations = relations(valuations, ({ one }) => ({
  deviceModel: one(deviceModels, {
    fields: [valuations.device_model_id],
    references: [deviceModels.id],
  }),
}));

// Devices Table
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  device_model_id: integer("device_model_id").references(() => deviceModels.id),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  specs: text("specs"),
  condition: text("condition").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"),
  listed_date: timestamp("listed_date").defaultNow().notNull(),
  description: text("description"),
  variant: text("variant"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const devicesRelations = relations(devices, ({ one, many }) => ({
  seller: one(users, {
    fields: [devices.seller_id],
    references: [users.id],
  }),
  deviceModel: one(deviceModels, {
    fields: [devices.device_model_id],
    references: [deviceModels.id],
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
  variant: z.string().optional(),
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
  device_model_id: integer("device_model_id").references(() => deviceModels.id),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  condition: text("condition").notNull(),
  offered_price: decimal("offered_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  variant: text("variant"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const buybackRequestsRelations = relations(buybackRequests, ({ one }) => ({
  user: one(users, {
    fields: [buybackRequests.user_id],
    references: [users.id],
  }),
  deviceModel: one(deviceModels, {
    fields: [buybackRequests.device_model_id],
    references: [deviceModels.id],
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
