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
  stripe_customer_id: text("stripe_customer_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
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
  customer_name: text("customer_name"),
  customer_email: text("customer_email"),
  customer_phone: text("customer_phone"),
  pickup_address: text("pickup_address"),
  pickup_date: text("pickup_date"),
  pickup_time: text("pickup_time"),
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

// Products Table (E-Commerce specific)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compare_at_price: decimal("compare_at_price", { precision: 10, scale: 2 }),
  cost_price: decimal("cost_price", { precision: 10, scale: 2 }),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  status: text("status").notNull().default("draft"), // draft, active, archived
  is_physical: boolean("is_physical").default(true).notNull(),
  requires_shipping: boolean("requires_shipping").default(true).notNull(),
  tax_class: text("tax_class"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  weight_unit: text("weight_unit").default("kg"),
  has_variants: boolean("has_variants").default(false).notNull(),
  device_model_id: integer("device_model_id").references(() => deviceModels.id),
  featured: boolean("featured").default(false).notNull(),
  vendor: text("vendor"),
  condition: text("condition"), // excellent, good, fair, poor
  seo_title: text("seo_title"),
  seo_description: text("seo_description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  images: many(productImages),
  categories: many(productCategories),
  tags: many(productTags),
  deviceModel: one(deviceModels, {
    fields: [products.device_model_id],
    references: [deviceModels.id],
  }),
}));

export const insertProductSchema = createInsertSchema(products, {
  price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  compare_at_price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  cost_price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  status: z.enum(["draft", "active", "archived"]),
  condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product Variants Table
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  title: text("title").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compare_at_price: decimal("compare_at_price", { precision: 10, scale: 2 }),
  cost_price: decimal("cost_price", { precision: 10, scale: 2 }),
  position: integer("position").default(0).notNull(),
  inventory_quantity: integer("inventory_quantity").default(0).notNull(),
  inventory_policy: text("inventory_policy").default("deny").notNull(), // deny or continue
  weight: decimal("weight", { precision: 8, scale: 2 }),
  weight_unit: text("weight_unit").default("kg"),
  requires_shipping: boolean("requires_shipping").default(true).notNull(),
  options: json("options").$type<Record<string, string>>().notNull(), // {color: "red", size: "large"}
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.product_id],
    references: [products.id],
  }),
}));

export const insertProductVariantSchema = createInsertSchema(productVariants, {
  price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  compare_at_price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  cost_price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  inventory_policy: z.enum(["deny", "continue"]),
  options: z.record(z.string(), z.string()),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;

// Product Images Table
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  position: integer("position").default(0).notNull(),
  is_primary: boolean("is_primary").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.product_id],
    references: [products.id],
  }),
}));

export const insertProductImageSchema = createInsertSchema(productImages).omit({ id: true, created_at: true, updated_at: true });
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parent_id: integer("parent_id").references(() => categories.id),
  is_visible: boolean("is_visible").default(true).notNull(),
  image: text("image"),
  seo_title: text("seo_title"),
  seo_description: text("seo_description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(productCategories),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, created_at: true, updated_at: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Product-Category Relationship Table
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  category_id: integer("category_id").references(() => categories.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.product_id, t.category_id),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.product_id],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.category_id],
    references: [categories.id],
  }),
}));

// Tags Table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  products: many(productTags),
}));

// Product-Tag Relationship Table
export const productTags = pgTable("product_tags", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  tag_id: integer("tag_id").references(() => tags.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.product_id, t.tag_id),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.product_id],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tag_id],
    references: [tags.id],
  }),
}));

// Discounts Table
export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  discount_type: text("discount_type").notNull(), // fixed_amount, percentage, free_shipping
  value: decimal("value", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"), // active, paused, expired
  min_order_amount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  max_discount_amount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
  usage_limit: integer("usage_limit"),
  usage_count: integer("usage_count").default(0).notNull(),
  starts_at: timestamp("starts_at"),
  ends_at: timestamp("ends_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscountSchema = createInsertSchema(discounts, {
  discount_type: z.enum(["fixed_amount", "percentage", "free_shipping"]),
  status: z.enum(["active", "paused", "expired"]),
  value: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
}).omit({ id: true, created_at: true, updated_at: true });

export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discounts.$inferSelect;

// Checkout Table
export const checkouts = pgTable("checkouts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  shipping_address_id: integer("shipping_address_id"),
  billing_address_id: integer("billing_address_id"),
  shipping_method: text("shipping_method"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping_cost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  discount_code: text("discount_code"),
  payment_status: text("payment_status").default("pending").notNull(), // pending, paid, failed
  notes: text("notes"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const checkoutsRelations = relations(checkouts, ({ one, many }) => ({
  user: one(users, {
    fields: [checkouts.user_id],
    references: [users.id],
  }),
  items: many(checkoutItems),
}));

// Checkout Items Table
export const checkoutItems = pgTable("checkout_items", {
  id: serial("id").primaryKey(),
  checkout_id: integer("checkout_id").references(() => checkouts.id).notNull(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  variant_id: integer("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const checkoutItemsRelations = relations(checkoutItems, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [checkoutItems.checkout_id],
    references: [checkouts.id],
  }),
  product: one(products, {
    fields: [checkoutItems.product_id],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [checkoutItems.variant_id],
    references: [productVariants.id],
  }),
}));

// E-commerce Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  checkout_id: integer("checkout_id").references(() => checkouts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  payment_method: text("payment_method").notNull(), // credit_card, paypal, etc.
  payment_method_details: json("payment_method_details"),
  payment_intent_id: text("payment_intent_id"),
  charge_id: text("charge_id"),
  status: text("status").notNull(), // pending, succeeded, failed
  error_message: text("error_message"),
  refunded: boolean("refunded").default(false).notNull(),
  refunded_amount: decimal("refunded_amount", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [payments.checkout_id],
    references: [checkouts.id],
  }),
}));


