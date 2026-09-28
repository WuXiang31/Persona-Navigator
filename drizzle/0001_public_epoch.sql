CREATE TABLE "push_subscriptions" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"time_zone" text NOT NULL,
	"hour" integer DEFAULT 20 NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"last_sent_day" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");