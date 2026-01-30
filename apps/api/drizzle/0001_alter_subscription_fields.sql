ALTER TABLE "subscription" RENAME COLUMN "current_period_start" TO "period_start";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "current_period_end" TO "period_end";--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "cancel_at_period_end" boolean;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "seats" integer;--> statement-breakpoint
