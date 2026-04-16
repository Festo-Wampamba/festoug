CREATE TABLE "inquiry_payment_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"amount" text,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'INFO' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"link" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_inquiry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"plan" text NOT NULL,
	"timeline" text NOT NULL,
	"vision" text NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "screenshots" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry_payment_log" ADD CONSTRAINT "inquiry_payment_log_inquiry_id_project_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."project_inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plog_inquiry_idx" ON "inquiry_payment_log" USING btree ("inquiry_id");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_read_idx" ON "notification" USING btree ("read");--> statement-breakpoint
CREATE INDEX "inquiry_status_idx" ON "project_inquiry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiry_email_idx" ON "project_inquiry" USING btree ("email");