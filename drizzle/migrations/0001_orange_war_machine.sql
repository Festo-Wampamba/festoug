CREATE TYPE "public"."maintenance_plan" AS ENUM('BASIC', 'PRO', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('MONTHLY', 'ANNUAL');--> statement-breakpoint
CREATE TYPE "public"."trial_status" AS ENUM('ACTIVE', 'EXPIRED', 'CONVERTED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('APPROVED', 'PENDING', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'SUSPENDED', 'BANNED');--> statement-breakpoint
CREATE TABLE "banned_email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"reason" text,
	"banned_at" timestamp DEFAULT now() NOT NULL,
	"banned_by" uuid,
	CONSTRAINT "banned_email_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_trial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "maintenance_plan" NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"website_url" text NOT NULL,
	"status" "trial_status" DEFAULT 'ACTIVE' NOT NULL,
	"trial_starts_at" timestamp DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp NOT NULL,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "review_helpful_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" "review_status" DEFAULT 'PENDING' NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trial_id" uuid,
	"plan" "maintenance_plan" NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"ls_subscription_id" text NOT NULL,
	"ls_variant_id" text NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_ls_subscription_id_unique" UNIQUE("ls_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "variant_id" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "testimonial" ADD COLUMN "rating" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "banned_email" ADD CONSTRAINT "banned_email_banned_by_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_trial" ADD CONSTRAINT "maintenance_trial_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_trial_id_maintenance_trial_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."maintenance_trial"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_user_idx" ON "chat_message" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_message_user_time_idx" ON "chat_message" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "trial_user_idx" ON "maintenance_trial" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trial_status_idx" ON "maintenance_trial" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trial_ends_idx" ON "maintenance_trial" USING btree ("trial_ends_at");--> statement-breakpoint
CREATE INDEX "helpful_vote_review_idx" ON "review_helpful_vote" USING btree ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "helpful_vote_user_review_uniq" ON "review_helpful_vote" USING btree ("review_id","user_id");--> statement-breakpoint
CREATE INDEX "review_product_idx" ON "review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_status_idx" ON "review" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "review_user_product_uniq" ON "review" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "sub_user_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sub_status_idx" ON "subscription" USING btree ("status");
