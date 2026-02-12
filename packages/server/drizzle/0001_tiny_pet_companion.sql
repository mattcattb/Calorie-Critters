CREATE TABLE "user_pet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text DEFAULT 'sprout_fox' NOT NULL,
	"name" text DEFAULT 'Sprout' NOT NULL,
	"stage" text DEFAULT 'baby' NOT NULL,
	"mood" text DEFAULT 'curious' NOT NULL,
	"energy" integer DEFAULT 70 NOT NULL,
	"affection" integer DEFAULT 50 NOT NULL,
	"last_interacted_at" timestamp,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_pet_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pet_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_pet_id" uuid NOT NULL,
	"type" text NOT NULL,
	"route" text,
	"payload" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_pet" ADD CONSTRAINT "user_pet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pet_event" ADD CONSTRAINT "pet_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pet_event" ADD CONSTRAINT "pet_event_user_pet_id_user_pet_id_fk" FOREIGN KEY ("user_pet_id") REFERENCES "public"."user_pet"("id") ON DELETE no action ON UPDATE no action;
