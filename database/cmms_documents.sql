-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:29:39.5940
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."documents";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS documents_id_seq;

-- Table Definition
CREATE TABLE "public"."documents" (
    "id" int4 NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
    "name" varchar(100) NOT NULL,
    "file_path" varchar(255) NOT NULL,
    "file_type" varchar(50),
    "size" int4,
    "entity_type" varchar(50) NOT NULL,
    "entity_id" int4 NOT NULL,
    "uploaded_by" int4,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."documents" ADD FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;
