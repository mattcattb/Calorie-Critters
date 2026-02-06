CREATE TYPE "public"."sex" AS ENUM('female', 'male', 'intersex', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."weight_unit" AS ENUM('kg', 'lb');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sex" "sex";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "weight" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "weight_unit" "weight_unit";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;