-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:31:29.0570
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."transfer_header";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS transfer_header_id_seq;

-- Table Definition
CREATE TABLE "public"."transfer_header" (
    "id" int4 NOT NULL DEFAULT nextval('transfer_header_id_seq'::regclass),
    "transfer_date" timestamptz NOT NULL DEFAULT now(),
    "from_location_id" int4,
    "to_location_id" int4,
    "transferred_by" int4,
    "status" varchar(20) NOT NULL DEFAULT 'completed'::character varying,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."transfer_header" ("id", "transfer_date", "from_location_id", "to_location_id", "transferred_by", "status", "notes", "created_at") VALUES
(2, '2024-01-15 10:00:00+03', 1, 2, 1, 'completed', 'Test transfer', '2025-07-19 16:33:08.088933+03'),
(3, '2025-07-19 13:32:00+03', 2, 2, 1, 'completed', '', '2025-07-19 16:34:10.686869+03'),
(4, '2025-07-19 13:34:00+03', 1, 1, 1, 'completed', '', '2025-07-19 16:34:38.603984+03'),
(5, '2025-07-19 13:38:00+03', 2, 1, 1, 'completed', '', '2025-07-19 16:38:29.368845+03'),
(6, '2025-07-19 14:56:00+03', 1, 2, 1, 'completed', '', '2025-07-19 17:57:28.618669+03'),
(7, '2025-07-19 15:36:00+03', 2, 1, 1, 'completed', '', '2025-07-19 18:36:37.371747+03');

ALTER TABLE "public"."transfer_header" ADD FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;
ALTER TABLE "public"."transfer_header" ADD FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;
ALTER TABLE "public"."transfer_header" ADD FOREIGN KEY ("transferred_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;
