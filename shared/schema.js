import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  real,
  doublePrecision,
  primaryKey,
  unique,
  varchar,
  json,
  pgEnum,
  date,
  jsonb,
  index as pgIndex,
  check,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
  "partner",
  "partner_staff",
  "partner_manager",
  "partner_owner",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "pending",
  "suspended",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "single_choice",
  "multiple_choice",
  "text_input",
]);

// Sessions for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: pgIndex("IDX_session_expire").on(table.expire),
  })
);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("customer").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  partnerId: integer("partner_id").references(() => partners.id),
  regionId: integer("region_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partners (Business Partners)
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  logo: text("logo"),
  status: text("status").default("active").notNull(),
  specialization: text("specialization"),
  regions: jsonb("regions"),
  deviceTypes: jsonb("device_types"),
  pinCodes: jsonb("pin_codes"),
  commissionRate: real("commission_rate").default(10).notNull(),
  tenantId: text("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partner Wallets for managing commissions and payouts
export const partnerWallets = pgTable("partner_wallets", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  currentBalance: doublePrecision("current_balance").default(0),
  totalEarned: doublePrecision("total_earned").default(0),
  totalWithdrawn: doublePrecision("total_withdrawn").default(0),
  pendingAmount: doublePrecision("pending_amount").default(0),
  currency: text("currency").default("INR"),
  status: text("status").default("active"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wallet Transactions for tracking all financial movements
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id")
    .notNull()
    .references(() => partnerWallets.id),
  transactionType: text("transaction_type").notNull(),
  amount: doublePrecision("amount").notNull(),
  balanceBefore: doublePrecision("balance_before").notNull(),
  balanceAfter: doublePrecision("balance_after").notNull(),
  reference: text("reference"),
  orderId: text("order_id"),
  description: text("description"),
  status: text("status").default("completed"),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Withdrawal Requests for partner payouts
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  walletId: integer("wallet_id")
    .notNull()
    .references(() => partnerWallets.id),
  amount: doublePrecision("amount").notNull(),
  bankDetails: jsonb("bank_details").notNull(),
  status: text("status").default("pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  transactionId: text("transaction_id"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Role Permissions - Define what each role can do
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  conditions: jsonb("conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRoleResourceAction: unique().on(table.role, table.resource, table.action),
}));

// Partner Staff - Staff members working under partners
export const partnerStaff = pgTable("partner_staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  staffRole: text("staff_role").notNull(),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true),
  hiredAt: timestamp("hired_at").defaultNow(),
  terminatedAt: timestamp("terminated_at"),
  salary: doublePrecision("salary"),
  commissionRate: real("commission_rate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserPartner: unique().on(table.userId, table.partnerId),
}));

// Postal Codes for geographic coverage
export const postalCodes = pgTable("postal_codes", {
  id: serial("id").primaryKey(),
  pincode: text("pincode").notNull().unique(),
  officeName: text("office_name"),
  district: text("district"),
  state: text("state").notNull(),
  country: text("country").notNull().default("India"),
  regionId: integer("region_id").references(() => regions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Route Rules
export const routeRules = pgTable("route_rules", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  pincode: text("pincode").notNull(),
  priority: integer("priority").default(0),
  active: boolean("active").default(true),
  languagePreference: text("language_preference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniquePartnerPincode: unique().on(table.partnerId, table.pincode),
}));

// Regions
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Device Types (e.g. Smartphone, Laptop, Tablet)
export const deviceTypes = pgTable("device_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeviceTypeSchema = createInsertSchema(deviceTypes);

// Brands (e.g. Apple, Samsung, Google)
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  logoType: text("logo_type").default("url"), // 'url' or 'upload'
  description: text("description"),
  website: text("website"),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Models (e.g. iPhone 13, Galaxy S21)
export const deviceModels = pgTable("device_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  brand_id: integer("brand_id").notNull().references(() => brands.id),
  device_type_id: integer("device_type_id").notNull().references(() => deviceTypes.id),
  active: boolean("active").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  variants: json("variants"),
  basePrice: real("base_price").default(0),
  specifications: jsonb("specifications"),
  releaseYear: integer("release_year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Device Model Variants - separate storage for each variant configuration
export const deviceModelVariants = pgTable("device_model_variants", {
  id: serial("id").primaryKey(),
  model_id: integer("model_id").notNull().references(() => deviceModels.id),
  variant_name: text("variant_name").notNull(), // e.g., "512GB Space Black"
  storage: text("storage"), // e.g., "512GB"
  color: text("color"), // e.g., "Space Black"
  ram: text("ram"), // e.g., "8GB"
  processor: text("processor"), // e.g., "A17 Pro"
  displaySize: text("display_size"), // e.g., "6.7 inch"
  basePrice: real("base_price").notNull(),
  currentPrice: real("current_price").notNull(),
  marketValue: real("market_value"),
  depreciationRate: real("depreciation_rate").default(0),
  availability: boolean("availability").default(true),
  sku: text("sku").unique(),
  specifications: jsonb("specifications"),
  images: jsonb("images"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueModelVariant: unique().on(table.modelId, table.variantName)
}));

// Brand Device Types (relation table between brands and device types)
export const brandDeviceTypes = pgTable("brand_device_types", {
  id: serial("id").primaryKey(),
  brand_id: integer("brand_id").notNull().references(() => brands.id),
  device_type_id: integer("device_type_id").notNull().references(() => deviceTypes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueBrandDeviceType: unique().on(table.brand_id, table.device_type_id)
}));

export const insertBrandDeviceTypeSchema = createInsertSchema(brandDeviceTypes);

// Device Model Question Mappings - connects device models to assessment questions
export const deviceQuestionMappings = pgTable("device_question_mappings", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => deviceModels.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueModelQuestion: unique().on(table.modelId, table.questionId)
}));

// Product Question Mappings (legacy support)
export const productQuestionMappings = pgTable("product_question_mappings", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => deviceModels.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueProductQuestion: unique().on(table.productId, table.questionId)
}));

// Condition questions matching database structure
export const conditionQuestions = pgTable("condition_questions", {
  id: serial("id").primaryKey(),
  deviceTypeId: integer("device_type_id").notNull().references(() => deviceTypes.id),
  question: text("question").notNull(),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  brandId: integer("brand_id").references(() => brands.id),
  questionType: text("question_type").default("single_choice").notNull(),
  required: boolean("required").default(false).notNull(),
  helpText: text("help_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conditionAnswers = pgTable("condition_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => conditionQuestions.id),
  answer: text("answer").notNull(),
  impact: real("impact").notNull(),
  order: integer("order").default(0),
  deductionType: text("deduction_type").notNull(),
  fixedAmount: real("fixed_amount"),
  applicableBrands: jsonb("applicable_brands"),
  applicableModels: jsonb("applicable_models"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Question Groups for organizing related questions
export const questionGroups = pgTable("question_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  statement: text("statement").notNull(),
  deviceTypeId: integer("device_type_id").references(() => deviceTypes.id),
  icon: text("icon"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions - for device assessment, value calculation, eligibility rules
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").default("single_choice").notNull(),
  groupId: integer("group_id").references(() => questionGroups.id),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  tooltip: text("tooltip"),
  required: boolean("required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Answer choices for questions
export const answerChoices = pgTable("answer_choices", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  answerText: text("answer_text").notNull(),
  icon: text("icon"),
  weightage: real("weightage").default(0), // Percentage impact on final price (e.g., -30%)
  repairCost: real("repair_cost").default(0), // Fixed deduction amount
  isDefault: boolean("is_default").default(false),
  order: integer("order").default(0),
  followUpAction: jsonb("follow_up_action"), // For conditional logic
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Buyback Requests table for tracking device buyback orders
export const buybackRequests = pgTable("buyback_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  deviceType: text("device_type").notNull(),
  deviceBrand: text("device_brand").notNull(),
  deviceModel: text("device_model").notNull(),
  deviceVariant: text("device_variant"),
  conditionAssessment: jsonb("condition_assessment").notNull(),
  estimatedValue: real("estimated_value").notNull(),
  finalValue: real("final_value"),
  status: text("status").default("pending").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: jsonb("address").notNull(),
  preferredPickupDate: timestamp("preferred_pickup_date"),
  actualPickupDate: timestamp("actual_pickup_date"),
  inspectionNotes: text("inspection_notes"),
  rejectionReason: text("rejection_reason"),
  paymentMethod: text("payment_method"),
  paymentDetails: jsonb("payment_details"),
  partnerId: integer("partner_id").references(() => partners.id),
  assignedStaffId: integer("assigned_staff_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deviceImages: json("device_images"),
  pickupNotes: text("pickup_notes"),
  pinCode: text("pin_code"),
  variant: text("variant")
});

// Indian States
export const indianStates = pgTable("indian_states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indian Cities
export const indianCities = pgTable("indian_cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => indianStates.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indian Postal Codes
export const indianPostalCodes = pgTable("indian_postal_codes", {
  pincode: text("pincode").primaryKey(),
  officeName: text("office_name"),
  district: text("district"),
  stateId: integer("state_id").references(() => indianStates.id),
  cityId: integer("city_id").references(() => indianCities.id),
  deliveryStatus: text("delivery_status"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GST Configuration
export const gstConfiguration = pgTable("gst_configuration", {
  id: serial("id").primaryKey(),
  gstRate: real("gst_rate").notNull(),
  applicableFrom: date("applicable_from").notNull(),
  applicableTo: date("applicable_to"),
  productCategory: text("product_category"),
  stateId: integer("state_id").references(() => indianStates.id),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// KYC Document Types
export const kycDocumentTypes = pgTable("kyc_document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  requiredForPartners: boolean("required_for_partners").default(false),
  requiredForCustomers: boolean("required_for_customers").default(false),
  verificationType: text("verification_type").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// KYC Documents
export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentTypeId: integer("document_type_id").notNull().references(() => kycDocumentTypes.id),
  documentNumber: text("document_number").notNull(),
  documentUrl: text("document_url").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  rejectionReason: text("rejection_reason"),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueDocumentPerUser: unique().on(table.userId, table.documentTypeId),
}));

// System Feature Toggles - Admin-controlled feature flags
export const featureToggles = pgTable("feature_toggles", {
  id: serial("id").primaryKey(),
  featureKey: text("feature_key").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  category: text("category").notNull(), // e.g., 'marketplace', 'buyback', 'partners', 'general'
  scope: text("scope").notNull(), // 'global', 'tenant', 'partner', 'region'
  scopeId: integer("scope_id"), // Used for tenant/partner/region-specific toggles
  requiredPermission: text("required_permission"), // Permission required to modify this toggle
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partner Service Areas
export const partnerServiceAreas = pgTable("partner_service_areas", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  stateId: integer("state_id").references(() => indianStates.id),
  cityId: integer("city_id").references(() => indianCities.id),
  pincode: text("pincode").references(() => indianPostalCodes.pincode),
  isPrimary: boolean("is_primary").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Multi-tenant Configuration
export const tenantConfigurations = pgTable("tenant_configurations", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id).unique(),
  domain: text("domain").unique(),
  subdomain: text("subdomain").unique(),
  businessName: text("business_name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#1F2937"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  address: jsonb("address"),
  settings: jsonb("settings"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenant Customizations
export const tenantCustomizations = pgTable("tenant_customizations", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantConfigurations.id),
  pageType: text("page_type").notNull(),
  customContent: jsonb("custom_content"),
  customStyles: jsonb("custom_styles"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueTenantPage: unique().on(table.tenantId, table.pageType),
}));

// Define schemas and validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["customer", "admin", "partner", "partner_staff", "partner_manager", "partner_owner"]),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners);
export const insertPartnerStaffSchema = createInsertSchema(partnerStaff);
export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export const insertRouteRuleSchema = createInsertSchema(routeRules);
export const insertPartnerWalletSchema = createInsertSchema(partnerWallets);
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions);
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);

export const upsertPartnerSchema = z.object({
  name: z.string().min(1),
  businessType: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6).max(6),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
});

export const insertQuestionGroupSchema = createInsertSchema(questionGroups);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertAnswerChoiceSchema = createInsertSchema(answerChoices);
export const insertBuybackRequestSchema = createInsertSchema(buybackRequests);
export const insertConditionQuestionSchema = createInsertSchema(conditionQuestions);
export const insertConditionAnswerSchema = createInsertSchema(conditionAnswers);

// Device Question Mapping schemas
export const insertDeviceQuestionMappingSchema = createInsertSchema(deviceQuestionMappings);

// Product Question Mapping schemas (legacy - replaces interface definitions)
export const insertProductQuestionMappingSchema = createInsertSchema(productQuestionMappings);

export const insertFeatureToggleSchema = createInsertSchema(featureToggles);
export const insertIndianStateSchema = createInsertSchema(indianStates);
export const insertIndianCitySchema = createInsertSchema(indianCities);
export const insertIndianPostalCodeSchema = createInsertSchema(indianPostalCodes);
export const insertGstConfigurationSchema = createInsertSchema(gstConfiguration);
export const insertKycDocumentTypeSchema = createInsertSchema(kycDocumentTypes);
export const insertKycDocumentSchema = createInsertSchema(kycDocuments);
export const insertPartnerServiceAreaSchema = createInsertSchema(partnerServiceAreas);
export const insertTenantConfigurationSchema = createInsertSchema(tenantConfigurations);
export const insertTenantCustomizationSchema = createInsertSchema(tenantCustomizations);