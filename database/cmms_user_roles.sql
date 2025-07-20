-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:31:53.1460
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."user_roles";
-- Table Definition
CREATE TABLE "public"."user_roles" (
    "user_id" int4 NOT NULL,
    "role_id" int4 NOT NULL,
    PRIMARY KEY ("user_id","role_id")
);

INSERT INTO "public"."user_roles" ("user_id", "role_id") VALUES
(1, 1);

ALTER TABLE "public"."user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;
