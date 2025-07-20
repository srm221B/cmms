-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:31:14.7370
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."roles";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS roles_id_seq;

-- Table Definition
CREATE TABLE "public"."roles" (
    "id" int4 NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
    "name" varchar(50) NOT NULL,
    "description" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."roles" ("id", "name", "description", "created_at", "updated_at") VALUES
(1, 'admin', 'System administrator with full access', '2025-07-17 16:13:50.952883+03', '2025-07-17 16:13:50.952883+03'),
(2, 'manager', 'Manager with access to reports and approvals', '2025-07-17 16:13:50.952883+03', '2025-07-17 16:13:50.952883+03'),
(3, 'team leader', 'Team leader who carries out work in site', '2025-07-17 16:13:50.952883+03', '2025-07-17 16:21:48.172251+03'),
(4, 'user', 'Regular user who can report issues', '2025-07-17 16:13:50.952883+03', '2025-07-17 16:13:50.952883+03');



-- Indices
CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);
