-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:29:26.6070
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."alembic_version";
-- Table Definition
CREATE TABLE "public"."alembic_version" (
    "version_num" varchar(32) NOT NULL,
    PRIMARY KEY ("version_num")
);

INSERT INTO "public"."alembic_version" ("version_num") VALUES
('add_inventory_filters');



-- Indices
CREATE UNIQUE INDEX alembic_version_pkc ON public.alembic_version USING btree (version_num);
