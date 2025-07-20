-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:32:37.0550
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."work_order_tasks";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS work_order_tasks_id_seq;

-- Table Definition
CREATE TABLE "public"."work_order_tasks" (
    "id" int4 NOT NULL DEFAULT nextval('work_order_tasks_id_seq'::regclass),
    "work_order_id" int4,
    "description" text NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'pending'::character varying,
    "assigned_to" int4,
    "estimated_hours" numeric(8,2),
    "actual_hours" numeric(8,2),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."work_order_tasks" ADD FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL;
ALTER TABLE "public"."work_order_tasks" ADD FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE CASCADE;
