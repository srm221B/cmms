-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:32:12.3650
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."users";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "username" varchar(50) NOT NULL,
    "email" varchar(100) NOT NULL,
    "hashed_password" varchar(255) NOT NULL,
    "is_active" bool NOT NULL DEFAULT true,
    "is_superuser" bool NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."users" ("id", "username", "email", "hashed_password", "is_active", "is_superuser", "created_at", "updated_at") VALUES
(1, 'admin', 'admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 't', 't', '2025-07-17 16:13:50.964009+03', '2025-07-17 16:13:50.964009+03');



-- Indices
CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
