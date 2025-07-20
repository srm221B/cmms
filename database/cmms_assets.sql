-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:37:51.8270
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."assets";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS assets_id_seq;

-- Table Definition
CREATE TABLE "public"."assets" (
    "id" int4 NOT NULL DEFAULT nextval('assets_id_seq'::regclass),
    "asset_code" varchar(50) NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "asset_category_id" int4,
    "location_id" int4,
    "installation_date" date,
    "purchase_cost" numeric(15,2),
    "status" varchar(20) NOT NULL DEFAULT 'active'::character varying,
    "warranty_expiry" date,
    "manufacturer" varchar(100),
    "model" varchar(100),
    "serial_number" varchar(100),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "running_hours" numeric(10,2),
    "power_generation" numeric(10,2),
    "load_factor" numeric(5,2),
    "availability" numeric(5,2),
    "cod" date,
    "bim" numeric(10,2),
    "specifications" text,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."assets" ("id", "asset_code", "name", "description", "asset_category_id", "location_id", "installation_date", "purchase_cost", "status", "warranty_expiry", "manufacturer", "model", "serial_number", "created_at", "updated_at", "running_hours", "power_generation", "load_factor", "availability", "cod", "bim", "specifications") VALUES
(1, 'E01', 'Engine 01', NULL, 1, 1, NULL, NULL, 'Operational', NULL, 'MAN', '18V28/32S', NULL, '2025-07-19 09:05:50.710742+03', '2025-07-19 09:34:32.004647+03', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

ALTER TABLE "public"."assets" ADD FOREIGN KEY ("asset_category_id") REFERENCES "public"."asset_categories"("id") ON DELETE SET NULL;
ALTER TABLE "public"."assets" ADD FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;


-- Indices
CREATE UNIQUE INDEX assets_asset_code_key ON public.assets USING btree (asset_code);
CREATE INDEX idx_assets_asset_code ON public.assets USING btree (asset_code);
CREATE INDEX idx_assets_location_id ON public.assets USING btree (location_id);
CREATE INDEX idx_assets_running_hours ON public.assets USING btree (running_hours);
CREATE INDEX idx_assets_power_generation ON public.assets USING btree (power_generation);
CREATE INDEX idx_assets_load_factor ON public.assets USING btree (load_factor);
CREATE INDEX idx_assets_availability ON public.assets USING btree (availability);
CREATE INDEX idx_assets_cod ON public.assets USING btree (cod);
CREATE INDEX idx_assets_bim ON public.assets USING btree (bim);
CREATE INDEX idx_assets_status ON public.assets USING btree (status);
