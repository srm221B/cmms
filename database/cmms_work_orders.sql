-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:32:58.6110
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."work_orders";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS work_orders_id_seq;

-- Table Definition
CREATE TABLE "public"."work_orders" (
    "id" int4 NOT NULL DEFAULT nextval('work_orders_id_seq'::regclass),
    "work_order_number" varchar(20) NOT NULL,
    "title" varchar(100) NOT NULL,
    "description" text,
    "asset_id" int4,
    "type_id" int4,
    "priority" varchar(20) NOT NULL DEFAULT 'medium'::character varying,
    "status" varchar(20) NOT NULL DEFAULT 'open'::character varying,
    "requested_by" int4,
    "assigned_to" int4,
    "requested_date" timestamptz NOT NULL DEFAULT now(),
    "scheduled_date" date,
    "start_date" timestamptz,
    "end_date" timestamptz,
    "estimated_hours" numeric(8,2),
    "actual_hours" numeric(8,2),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."work_orders" ("id", "work_order_number", "title", "description", "asset_id", "type_id", "priority", "status", "requested_by", "assigned_to", "requested_date", "scheduled_date", "start_date", "end_date", "estimated_hours", "actual_hours", "created_at", "updated_at") VALUES
(1, 'WO-2024-0001', 'Engine Maintenance', 'Regular preventive maintenance for Engine 01', 1, 1, 'medium', 'open', 1, NULL, '2025-07-19 15:33:49.095521+03', '2025-07-26', NULL, NULL, 4.00, NULL, '2025-07-19 12:33:49.101161+03', '2025-07-19 12:33:49.101168+03'),
(2, 'WO-2024-0002', 'Emergency Pump Repair', 'Critical pump failure in cooling system', 1, 3, 'critical', 'in_progress', 1, 1, '2025-07-19 15:33:49.097033+03', '2025-07-19', '2025-07-19 15:33:48.994884+03', NULL, 8.00, NULL, '2025-07-19 12:33:49.101184+03', '2025-07-19 12:33:49.101185+03'),
(3, 'WO-2024-0003', 'Equipment Inspection', 'Monthly safety inspection of all equipment', 1, 5, 'low', 'completed', 1, 1, '2025-07-19 15:33:49.098035+03', '2025-07-18', '2025-07-18 13:33:48.994891+03', '2025-07-18 15:33:48.994894+03', 2.00, 1.50, '2025-07-19 12:33:49.101186+03', '2025-07-19 12:33:49.101187+03'),
(4, 'WO-2024-0004', 'New Equipment Installation', 'Install new monitoring system', 1, 4, 'high', 'open', 1, NULL, '2025-07-19 15:33:49.098798+03', '2025-08-02', NULL, NULL, 16.00, NULL, '2025-07-19 12:33:49.101188+03', '2025-07-19 12:33:49.101189+03'),
(5, 'WO-2024-0005', 'Corrective Maintenance', 'Fix vibration issues in motor', 1, 2, 'high', 'open', 1, NULL, '2025-07-19 15:33:49.099199+03', '2025-07-22', NULL, NULL, 6.00, NULL, '2025-07-19 12:33:49.10119+03', '2025-07-19 12:33:49.10119+03');

ALTER TABLE "public"."work_orders" ADD FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL;
ALTER TABLE "public"."work_orders" ADD FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE SET NULL;
ALTER TABLE "public"."work_orders" ADD FOREIGN KEY ("type_id") REFERENCES "public"."work_order_types"("id") ON DELETE SET NULL;
ALTER TABLE "public"."work_orders" ADD FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;


-- Indices
CREATE UNIQUE INDEX work_orders_work_order_number_key ON public.work_orders USING btree (work_order_number);
CREATE INDEX idx_work_orders_number ON public.work_orders USING btree (work_order_number);
CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);
CREATE INDEX idx_work_orders_asset_id ON public.work_orders USING btree (asset_id);
