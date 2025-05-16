import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  real,
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
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").default("customer").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  permissions: jsonb("permissions"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partners (Business Partners)
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(),
  gstNumber: text("gst_number").unique(),
  panNumber: text("pan_number").unique(),
  shopActLicense: text("shop_act_license"),
  shopActExpiryDate: date("shop_act_expiry_date"),
  msmeRegistration: text("msme_registration"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  alternatePhone: text("alternate_phone"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  serviceablePincodes: text("serviceable_pincodes"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  accountHolderName: text("account_holder_name"),
  commissionRate: real("commission_rate").default(10),
  status: text("status").default("pending").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  logo: text("logo"),
  documents: jsonb("documents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partner Wallets
export const partnerWallets = pgTable("partner_wallets", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  balance: real("balance").notNull().default(0),
  pendingBalance: real("pending_balance").default(0),
  panNumber: text("pan_number"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  bankName: text("bank_name"),
  accountHolderName: text("account_holder_name"),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wallet Transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id")
    .notNull()
    .references(() => partnerWallets.id),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // credit, debit
  status: text("status").notNull().default("completed"), // pending, completed, failed
  description: text("description").notNull(),
  referenceId: text("reference_id"),
  referenceType: text("reference_type"),
  metadata: jsonb("metadata"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Withdrawal Requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id")
    .notNull()
    .references(() => partnerWallets.id),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, processed
  transactionId: integer("transaction_id").references(
    () => walletTransactions.id
  ),
  paymentMethod: text("payment_method").notNull(), // bank_transfer, upi, etc.
  paymentDetails: jsonb("payment_details"),
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => users.id),
  processedDate: timestamp("processed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Staff Permissions (Role-Based Access Control)
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  resource: text("resource").notNull(), // e.g., 'leads', 'devices', 'orders'
  action: text("action").notNull(), // e.g., 'create', 'read', 'update', 'delete'
  restrictions: jsonb("restrictions"), // Additional restrictions like region, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRoleResource: unique().on(table.role, table.resource, table.action),
}));

// Partner Staff (employees of partners)
export const partnerStaff = pgTable("partner_staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id),
  role: userRoleEnum("role").default("partner_staff").notNull(),
  assignedRegions: jsonb("assigned_regions"), // Array of regions/states
  assignedPincodes: jsonb("assigned_pincodes"), // Array of pincodes
  customPermissions: jsonb("custom_permissions"), // Override default role permissions
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Postal PIN Codes
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
export type InsertDeviceType = z.infer<typeof insertDeviceTypeSchema>;
export type DeviceType = typeof deviceTypes.$inferSelect;

// Brands (e.g. Apple, Samsung, Google)
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Models (e.g. iPhone 13, Galaxy S21)
export const deviceModels = pgTable("device_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  brandId: integer("brand_id").references(() => brands.id),
  deviceTypeId: integer("device_type_id").references(() => deviceTypes.id),
  active: boolean("active").default(true),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueModelPerBrandDeviceType: unique().on(table.slug, table.brandId, table.deviceTypeId),
}));

// Define schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["customer", "admin", "partner", "partner_staff", "partner_manager", "partner_owner"]),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertPartnerSchema = createInsertSchema(partners);
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const insertPartnerStaffSchema = createInsertSchema(partnerStaff);
export type InsertPartnerStaff = z.infer<typeof insertPartnerStaffSchema>;
export type PartnerStaff = typeof partnerStaff.$inferSelect;

export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

export const insertRouteRuleSchema = createInsertSchema(routeRules);
export type InsertRouteRule = z.infer<typeof insertRouteRuleSchema>;
export type RouteRule = typeof routeRules.$inferSelect;

export const insertPartnerWalletSchema = createInsertSchema(partnerWallets);
export type InsertPartnerWallet = z.infer<typeof insertPartnerWalletSchema>;
export type PartnerWallet = typeof partnerWallets.$inferSelect;

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions);
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

export const upsertPartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  businessType: z.string(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  status: z.string().default("pending"),
});
export type UpsertPartner = z.infer<typeof upsertPartnerSchema>;

// Indian specific tables
// Indian States
export const indianStates = pgTable("indian_states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  isUnionTerritory: boolean("is_union_territory").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indian Cities
export const indianCities = pgTable("indian_cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => indianStates.id),
  isMetro: boolean("is_metro").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueNamePerState: unique().on(table.name, table.stateId),
}));

// Indian Postal Codes with extended data
export const indianPostalCodes = pgTable("indian_postal_codes", {
  id: serial("id").primaryKey(),
  pincode: text("pincode").notNull().unique(),
  postOfficeName: text("post_office_name"),
  district: text("district").notNull(),
  stateId: integer("state_id").notNull().references(() => indianStates.id),
  cityId: integer("city_id").references(() => indianCities.id),
  deliveryStatus: text("delivery_status"),
  divisionName: text("division_name"),
  regionName: text("region_name"),
  circleName: text("circle_name"),
  taluk: text("taluk"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GST Configuration
export const gstConfiguration = pgTable("gst_configuration", {
  id: serial("id").primaryKey(),
  taxRate: real("tax_rate").notNull(),
  hsnCode: text("hsn_code").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  active: boolean("active").default(true),
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
}, (table) => ({
  checkConstraint: check(`(state_id IS NOT NULL) OR (city_id IS NOT NULL) OR (pincode IS NOT NULL)`),
}));

// Multi-tenant Configuration
export const tenantConfigurations = pgTable("tenant_configurations", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id).unique(),
  databaseName: text("database_name"),
  databaseHost: text("database_host"),
  databasePort: integer("database_port"),
  databaseUser: text("database_user"),
  databasePassword: text("database_password"),
  settings: jsonb("settings").default({}),
  isMultiTenant: boolean("is_multi_tenant").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenant Customization
export const tenantCustomizations = pgTable("tenant_customizations", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id).unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  invoiceTemplate: text("invoice_template"),
  emailTemplate: text("email_template"),
  smsTemplate: text("sms_template"),
  domain: text("domain"),
  companyDetails: jsonb("company_details"),
  gstin: text("gstin"),
  paymentGatewayConfig: jsonb("payment_gateway_config"),
  termsAndConditions: text("terms_and_conditions"),
  privacyPolicy: text("privacy_policy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define schemas for new tables
export const insertIndianStateSchema = createInsertSchema(indianStates);
export type InsertIndianState = z.infer<typeof insertIndianStateSchema>;
export type IndianState = typeof indianStates.$inferSelect;

export const insertIndianCitySchema = createInsertSchema(indianCities);
export type InsertIndianCity = z.infer<typeof insertIndianCitySchema>;
export type IndianCity = typeof indianCities.$inferSelect;

export const insertIndianPostalCodeSchema = createInsertSchema(indianPostalCodes);
export type InsertIndianPostalCode = z.infer<typeof insertIndianPostalCodeSchema>;
export type IndianPostalCode = typeof indianPostalCodes.$inferSelect;

export const insertGstConfigurationSchema = createInsertSchema(gstConfiguration);
export type InsertGstConfiguration = z.infer<typeof insertGstConfigurationSchema>;
export type GstConfiguration = typeof gstConfiguration.$inferSelect;

export const insertKycDocumentTypeSchema = createInsertSchema(kycDocumentTypes);
export type InsertKycDocumentType = z.infer<typeof insertKycDocumentTypeSchema>;
export type KycDocumentType = typeof kycDocumentTypes.$inferSelect;

export const insertKycDocumentSchema = createInsertSchema(kycDocuments);
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;

export const insertPartnerServiceAreaSchema = createInsertSchema(partnerServiceAreas);
export type InsertPartnerServiceArea = z.infer<typeof insertPartnerServiceAreaSchema>;
export type PartnerServiceArea = typeof partnerServiceAreas.$inferSelect;

export const insertTenantConfigurationSchema = createInsertSchema(tenantConfigurations);
export type InsertTenantConfiguration = z.infer<typeof insertTenantConfigurationSchema>;
export type TenantConfiguration = typeof tenantConfigurations.$inferSelect;

export const insertTenantCustomizationSchema = createInsertSchema(tenantCustomizations);
export type InsertTenantCustomization = z.infer<typeof insertTenantCustomizationSchema>;
export type TenantCustomization = typeof tenantCustomizations.$inferSelect;