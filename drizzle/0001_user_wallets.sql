CREATE TABLE IF NOT EXISTS "user_wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"blockchain" text NOT NULL,
	"connection_type" text NOT NULL,
	"chain_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_wallet" ADD CONSTRAINT "user_wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_wallet_user_id_idx" ON "user_wallet" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_wallet_address_idx" ON "user_wallet" ("address");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_wallet_blockchain_idx" ON "user_wallet" ("blockchain");