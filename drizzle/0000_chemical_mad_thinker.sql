CREATE TABLE "response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"user_id" uuid,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"config" jsonb NOT NULL,
	"visibility" varchar(20) DEFAULT 'private' NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_assignment" ADD CONSTRAINT "survey_assignment_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_assignment" ADD CONSTRAINT "survey_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "response_survey_idx" ON "response" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "response_user_idx" ON "response" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "response_created_idx" ON "response" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "survey_title_idx" ON "survey" USING btree ("title");--> statement-breakpoint
CREATE INDEX "survey_visibility_idx" ON "survey" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "survey_creator_idx" ON "survey" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "assign_survey_idx" ON "survey_assignment" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "assign_user_idx" ON "survey_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assign_unique_survey_user_idx" ON "survey_assignment" USING btree ("survey_id","user_id");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");