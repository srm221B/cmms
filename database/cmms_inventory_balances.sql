-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:29:56.8590
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."inventory_balances";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS inventory_balances_id_seq;

-- Table Definition
CREATE TABLE "public"."inventory_balances" (
    "id" int4 NOT NULL DEFAULT nextval('inventory_balances_id_seq'::regclass),
    "spare_part_id" int4,
    "location_id" int4,
    "in_stock" int4 NOT NULL DEFAULT 0,
    "total_received" int4 NOT NULL DEFAULT 0,
    "total_consumption" int4 NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."inventory_balances" ("id", "spare_part_id", "location_id", "in_stock", "total_received", "total_consumption") VALUES
(1, 1, 2, 111, 111, 2),
(2, 1, 1, 26, 31, 3),
(3, 1, 3, 41, 58, 17),
(4, 2, 2, 147, 157, 10),
(5, 2, 1, 11, 31, 20),
(6, 2, 3, 45, 55, 10),
(7, 3, 2, 9, 29, 20),
(8, 3, 1, 39, 48, 9),
(9, 3, 3, 18, 19, 1),
(10, 4, 2, 32, 42, 10),
(11, 4, 1, 17, 30, 13),
(12, 4, 3, 32, 48, 16),
(13, 5, 2, 38, 38, 0),
(14, 5, 1, 44, 58, 14),
(15, 5, 3, 42, 47, 5),
(16, 6, 2, 27, 32, 5),
(17, 6, 1, 9, 9, 0),
(18, 6, 3, 28, 34, 6),
(19, 7, 2, 15, 26, 11),
(20, 7, 1, 44, 45, 1),
(21, 7, 3, 11, 14, 3),
(22, 8, 2, 8, 24, 16),
(23, 8, 1, 27, 33, 6),
(24, 8, 3, 23, 23, 0),
(25, 9, 2, 21, 30, 9),
(26, 9, 1, 22, 42, 20),
(27, 9, 3, 17, 21, 4),
(28, 10, 2, 12, 23, 11),
(29, 10, 1, 37, 46, 9),
(30, 10, 3, 34, 47, 13),
(31, 11, 2, 31, 33, 2),
(32, 11, 1, 15, 32, 17),
(33, 11, 3, 31, 46, 15),
(34, 12, 2, 36, 45, 9),
(35, 12, 1, 9, 14, 5),
(36, 12, 3, 5, 17, 12),
(37, 13, 2, 48, 62, 14),
(38, 13, 1, 21, 39, 18),
(39, 13, 3, 24, 43, 19);

ALTER TABLE "public"."inventory_balances" ADD FOREIGN KEY ("spare_part_id") REFERENCES "public"."inventory_master"("id") ON DELETE CASCADE;
ALTER TABLE "public"."inventory_balances" ADD FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX inventory_balances_spare_part_id_location_id_key ON public.inventory_balances USING btree (spare_part_id, location_id);
CREATE INDEX idx_inventory_balances_part_location ON public.inventory_balances USING btree (spare_part_id, location_id);
