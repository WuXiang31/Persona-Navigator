CREATE TABLE "user_state" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_state_user_id_key_pk" PRIMARY KEY("user_id","key")
);
