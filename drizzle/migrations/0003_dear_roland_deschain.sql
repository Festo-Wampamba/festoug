ALTER TABLE "order" ADD CONSTRAINT "order_external_order_id_unique" UNIQUE("external_order_id");--> statement-breakpoint
-- Grandfather all pre-existing accounts as verified so the new email-verification
-- gate does not lock out users created before this feature shipped. New signups
-- (created after this migration) start unverified and must verify via email.
UPDATE "user" SET "emailVerified" = now() WHERE "emailVerified" IS NULL;