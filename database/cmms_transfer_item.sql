-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:31:42.3610
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."transfer_item";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS transfer_item_id_seq;

-- Table Definition
CREATE TABLE "public"."transfer_item" (
    "id" int4 NOT NULL DEFAULT nextval('transfer_item_id_seq'::regclass),
    "transfer_id" int4,
    "spare_part_id" int4,
    "quantity" int4 NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."transfer_item" ("id", "transfer_id", "spare_part_id", "quantity", "created_at") VALUES
(1, 2, 1, 2, '2025-07-19 16:33:08.197901+03'),
(2, 3, 1, 4, '2025-07-19 16:34:10.693771+03'),
(3, 4, 6, 5, '2025-07-19 16:34:38.608772+03'),
(4, 5, 1, 5, '2025-07-19 16:38:29.375698+03'),
(5, 6, 1, 10, '2025-07-19 17:57:28.63245+03'),
(6, 7, 1, 5, '2025-07-19 18:36:37.385092+03');

ALTER TABLE "public"."transfer_item" ADD FOREIGN KEY ("transfer_id") REFERENCES "public"."transfer_header"("id") ON DELETE CASCADE;
ALTER TABLE "public"."transfer_item" ADD FOREIGN KEY ("spare_part_id") REFERENCES "public"."inventory_master"("id") ON DELETE SET NULL;
