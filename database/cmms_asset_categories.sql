-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:28:40.7010
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."asset_categories";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS asset_categories_id_seq;

-- Table Definition
CREATE TABLE "public"."asset_categories" (
    "id" int4 NOT NULL DEFAULT nextval('asset_categories_id_seq'::regclass),
    "name" varchar(100) NOT NULL,
    "description" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."asset_categories" ("id", "name", "description", "created_at", "updated_at") VALUES
(1, 'Engine', 'Power house production unit ', '2025-07-17 16:13:50.998433+03', '2025-07-17 16:15:29.97068+03'),
(2, 'HFO Purifier', 'Purifiying equipment for heavy-fuel Oil', '2025-07-17 16:13:50.998433+03', '2025-07-17 16:15:23.152787+03'),
(3, 'Booster', 'Heavy Fuel oil heating and volume boosting equiment', '2025-07-17 16:13:50.998433+03', '2025-07-17 16:15:23.152787+03'),
(4, 'Air Compressor', 'Starting air and instruments air compressor', '2025-07-17 16:13:50.998433+03', '2025-07-17 16:15:23.152787+03');

