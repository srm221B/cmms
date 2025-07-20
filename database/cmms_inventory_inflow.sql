-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:30:40.9830
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."inventory_inflow";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS inventory_inflow_id_seq;

-- Table Definition
CREATE TABLE "public"."inventory_inflow" (
    "id" int4 NOT NULL DEFAULT nextval('inventory_inflow_id_seq'::regclass),
    "spare_part_id" int4,
    "location_id" int4,
    "quantity" int4 NOT NULL,
    "received_by" int4,
    "received_date" timestamptz NOT NULL DEFAULT now(),
    "supplier" varchar(100),
    "reference_number" varchar(100),
    "unit_cost" numeric(15,2),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."inventory_inflow" ("id", "spare_part_id", "location_id", "quantity", "received_by", "received_date", "supplier", "reference_number", "unit_cost", "created_at") VALUES
(1, 1, 2, 50, 1, '2025-06-19 15:50:28.722042+03', 'ABC Supplies', 'PO-2024-001', 25.50, '2025-07-19 15:50:28.725926+03'),
(2, 1, 1, 30, 1, '2025-07-04 15:50:28.722051+03', 'XYZ Parts', 'PO-2024-002', 24.75, '2025-07-19 15:50:28.726388+03'),
(3, 2, 2, 10, 1, '2025-06-04 15:50:28.722053+03', 'Industrial Parts Co', 'PO-2024-003', 150.00, '2025-07-19 15:50:28.726678+03'),
(4, 3, 1, 25, 1, '2025-06-29 15:50:28.722055+03', 'Belt Solutions', 'PO-2024-004', 45.75, '2025-07-19 15:50:28.726938+03'),
(5, 4, 3, 100, 1, '2025-07-09 15:50:28.722056+03', 'Bearing World', 'PO-2024-005', 12.25, '2025-07-19 15:50:28.727219+03'),
(6, 5, 2, 5, 1, '2025-05-20 15:50:28.722057+03', 'Valve Systems', 'PO-2024-006', 320.00, '2025-07-19 15:50:28.727462+03'),
(7, 6, 1, 15, 1, '2025-06-24 15:50:28.722058+03', 'Gasket Pro', 'PO-2024-007', 85.00, '2025-07-19 15:50:28.727793+03'),
(8, 7, 3, 20, 1, '2025-07-14 15:50:28.722059+03', 'Sensor Tech', 'PO-2024-008', 75.50, '2025-07-19 15:50:28.728074+03'),
(9, 8, 2, 2, 1, '2025-04-20 15:50:28.72206+03', 'Motor Solutions', 'PO-2024-009', 1200.00, '2025-07-19 15:50:28.728336+03'),
(10, 1, 1, 5, 1, '2024-01-15 10:00:00+03', 'Test Supplier', 'PO-001', 25.50, '2025-07-19 16:33:12.670128+03'),
(11, 1, 2, 100, 1, '2025-07-19 14:13:00+03', 'SRIRAM', '', NULL, '2025-07-19 17:15:30.253265+03'),
(12, 2, 2, 100, 1, '2025-07-19 14:57:00+03', '', '', NULL, '2025-07-19 17:58:25.717033+03'),
(13, 7, 1, 10, 1, '2025-07-19 14:58:00+03', '', '', NULL, '2025-07-19 17:58:54.896129+03'),
(14, 1, 1, 3, 1, '2025-07-19 15:35:00+03', '', '', NULL, '2025-07-19 18:35:34.542879+03');

ALTER TABLE "public"."inventory_inflow" ADD FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;
ALTER TABLE "public"."inventory_inflow" ADD FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;
ALTER TABLE "public"."inventory_inflow" ADD FOREIGN KEY ("spare_part_id") REFERENCES "public"."inventory_master"("id") ON DELETE SET NULL;
