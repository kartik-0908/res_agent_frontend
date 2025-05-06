CREATE TABLE "Subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripeSubscriptionId" varchar(128) NOT NULL,
	"userId" uuid NOT NULL,
	"status" varchar NOT NULL,
	"priceId" varchar(128) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"currentPeriodStart" timestamp NOT NULL,
	"currentPeriodEnd" timestamp NOT NULL,
	"cancelAt" timestamp,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" varchar(64);--> statement-breakpoint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;