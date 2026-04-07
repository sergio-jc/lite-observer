CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_unix_nano" text NOT NULL,
	"observed_time_unix_nano" text DEFAULT '',
	"severity_number" integer DEFAULT 0 NOT NULL,
	"severity_text" text DEFAULT '',
	"body" text DEFAULT '',
	"trace_id" text,
	"span_id" text,
	"service_name" text DEFAULT 'unknown' NOT NULL,
	"resource_attributes" jsonb DEFAULT '{}'::jsonb,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"scope_name" text DEFAULT '',
	"scope_version" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metric_data_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"unit" text DEFAULT '',
	"type" text NOT NULL,
	"value" double precision,
	"count" integer,
	"sum" double precision,
	"buckets" jsonb,
	"quantiles" jsonb,
	"time_unix_nano" text NOT NULL,
	"start_time_unix_nano" text DEFAULT '',
	"service_name" text DEFAULT 'unknown' NOT NULL,
	"resource_attributes" jsonb DEFAULT '{}'::jsonb,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"scope_name" text DEFAULT '',
	"scope_version" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spans" (
	"id" serial PRIMARY KEY NOT NULL,
	"trace_id" text NOT NULL,
	"span_id" text NOT NULL,
	"parent_span_id" text,
	"name" text NOT NULL,
	"kind" integer DEFAULT 0 NOT NULL,
	"start_time_unix_nano" text NOT NULL,
	"end_time_unix_nano" text NOT NULL,
	"duration_ms" double precision NOT NULL,
	"status_code" integer DEFAULT 0 NOT NULL,
	"status_message" text DEFAULT '',
	"service_name" text DEFAULT 'unknown' NOT NULL,
	"resource_attributes" jsonb DEFAULT '{}'::jsonb,
	"span_attributes" jsonb DEFAULT '{}'::jsonb,
	"events" jsonb DEFAULT '[]'::jsonb,
	"links" jsonb DEFAULT '[]'::jsonb,
	"scope_name" text DEFAULT '',
	"scope_version" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "logs_trace_id_idx" ON "logs" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "logs_service_name_idx" ON "logs" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "logs_severity_idx" ON "logs" USING btree ("severity_number");--> statement-breakpoint
CREATE INDEX "logs_time_idx" ON "logs" USING btree ("time_unix_nano");--> statement-breakpoint
CREATE INDEX "metrics_name_idx" ON "metric_data_points" USING btree ("name");--> statement-breakpoint
CREATE INDEX "metrics_service_name_idx" ON "metric_data_points" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "metrics_time_idx" ON "metric_data_points" USING btree ("time_unix_nano");--> statement-breakpoint
CREATE INDEX "spans_trace_id_idx" ON "spans" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX "spans_service_name_idx" ON "spans" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "spans_start_time_idx" ON "spans" USING btree ("start_time_unix_nano");--> statement-breakpoint
CREATE INDEX "spans_status_code_idx" ON "spans" USING btree ("status_code");