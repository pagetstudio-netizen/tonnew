ALTER TABLE "payment_numbers" ALTER COLUMN "phone" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "payment_numbers" ADD COLUMN IF NOT EXISTS "payment_link" text;