-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:28:10.4320
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."locations";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS locations_id_seq;

-- Table Definition
CREATE TABLE "public"."locations" (
    "id" int4 NOT NULL DEFAULT nextval('locations_id_seq'::regclass),
    "name" varchar(100) NOT NULL,
    "description" text,
    "address" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."locations" ("id", "name", "description", "address", "created_at", "updated_at") VALUES
(1, 'Karbala Power House', 'Karbala plant power production facility', NULL, '2025-07-17 16:13:50.987647+03', '2025-07-17 16:16:27.443383+03'),
(2, 'Karbala warehouse', 'Main parts warehouse for Karbala power plant', NULL, '2025-07-17 16:13:50.987647+03', '2025-07-17 16:16:27.443383+03'),
(3, 'Karbala Chemicals Storage Unit', 'Karbala chemicals storage unit', NULL, '2025-07-17 16:13:50.987647+03', '2025-07-17 16:16:49.861458+03');

