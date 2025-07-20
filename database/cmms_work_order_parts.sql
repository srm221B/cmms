-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:32:24.6720
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."work_order_parts";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS work_order_parts_id_seq;

-- Table Definition
CREATE TABLE "public"."work_order_parts" (
    "id" int4 NOT NULL DEFAULT nextval('work_order_parts_id_seq'::regclass),
    "work_order_id" int4,
    "spare_part_id" int4,
    "quantity_used" int4 NOT NULL,
    "location_id" int4,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."work_order_parts" ("id", "work_order_id", "spare_part_id", "quantity_used", "location_id", "created_at") VALUES
(1, 1, 1, 2, 2, '2025-07-19 12:43:12.129901+03'),
(2, 1, 3, 1, 2, '2025-07-19 12:43:12.129905+03'),
(3, 2, 2, 1, 1, '2025-07-19 12:43:12.129907+03'),
(4, 2, 4, 4, 1, '2025-07-19 12:43:12.129908+03'),
(5, 3, 7, 1, 3, '2025-07-19 12:43:12.129909+03'),
(6, 4, 8, 1, 2, '2025-07-19 12:43:12.12991+03'),
(7, 4, 5, 2, 2, '2025-07-19 12:43:12.12991+03'),
(8, 5, 6, 1, 1, '2025-07-19 12:43:12.129911+03'),
(9, 5, 1, 1, 1, '2025-07-19 12:43:12.129912+03');

ALTER TABLE "public"."work_order_parts" ADD FOREIGN KEY ("spare_part_id") REFERENCES "public"."inventory_master"("id") ON DELETE SET NULL;
ALTER TABLE "public"."work_order_parts" ADD FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE CASCADE;
ALTER TABLE "public"."work_order_parts" ADD FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;
