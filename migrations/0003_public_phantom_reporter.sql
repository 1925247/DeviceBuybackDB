CREATE TABLE IF NOT EXISTS "invoice_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"html_template" text NOT NULL,
	"css_styles" text,
	"configuration" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"logo" text,
	"status" text DEFAULT 'active' NOT NULL,
	"specialization" text,
	"regions" json,
	"device_types" json,
	"pin_codes" json,
	"commission_rate" numeric(5, 2) DEFAULT '10' NOT NULL,
	"tenant_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_email_unique" UNIQUE("email"),
	CONSTRAINT "partners_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name"),
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"thumbnail" text,
	"is_default" boolean DEFAULT false,
	"configuration" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false,
	"colors" json,
	"fonts" json,
	"layout" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "region_id" integer;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "pin_code" text;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "staff_id" integer;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "questionnaire_answers" json;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "image_urls" json;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "deductions" json;--> statement-breakpoint
ALTER TABLE "buyback_requests" ADD COLUMN "final_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "condition_answers" ADD COLUMN "deduction_type" text DEFAULT 'percentage' NOT NULL;--> statement-breakpoint
ALTER TABLE "condition_answers" ADD COLUMN "fixed_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "condition_answers" ADD COLUMN "applicable_brands" json;--> statement-breakpoint
ALTER TABLE "condition_answers" ADD COLUMN "applicable_models" json;--> statement-breakpoint
ALTER TABLE "condition_answers" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "condition_questions" ADD COLUMN "brand_id" integer;--> statement-breakpoint
ALTER TABLE "condition_questions" ADD COLUMN "question_type" text DEFAULT 'multiple_choice' NOT NULL;--> statement-breakpoint
ALTER TABLE "condition_questions" ADD COLUMN "required" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "condition_questions" ADD COLUMN "help_text" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "sell_ready" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "partner_sourced" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "regions" json;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "template_id" integer;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "regions" json;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "template_id" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sell_ready" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "refurbished" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "region_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyback_requests" ADD CONSTRAINT "buyback_requests_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyback_requests" ADD CONSTRAINT "buyback_requests_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyback_requests" ADD CONSTRAINT "buyback_requests_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "condition_questions" ADD CONSTRAINT "condition_questions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_template_id_store_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "store_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
