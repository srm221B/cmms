-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:32:47.6250
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."work_order_types";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS work_order_types_id_seq;

-- Table Definition
CREATE TABLE "public"."work_order_types" (
    "id" int4 NOT NULL DEFAULT nextval('work_order_types_id_seq'::regclass),
    "name" varchar(50) NOT NULL,
    "description" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."work_order_types" ("id", "name", "description", "created_at", "updated_at") VALUES
(1, 'Preventive', 'Scheduled maintenance to prevent failures', '2025-07-17 16:13:51.009294+03', '2025-07-17 16:13:51.009294+03'),
(2, 'Corrective', 'Repairs to fix issues after they occur', '2025-07-17 16:13:51.009294+03', '2025-07-17 16:13:51.009294+03'),
(3, 'Emergency', 'Urgent repairs for critical failures', '2025-07-17 16:13:51.009294+03', '2025-07-17 16:13:51.009294+03'),
(4, 'Installation', 'Setup of new equipment or systems', '2025-07-17 16:13:51.009294+03', '2025-07-17 16:13:51.009294+03'),
(5, 'Inspection', 'Regular checks and evaluations', '2025-07-17 16:13:51.009294+03', '2025-07-17 16:13:51.009294+03');



-- Indices
CREATE UNIQUE INDEX work_order_types_name_key ON public.work_order_types USING btree (name);
