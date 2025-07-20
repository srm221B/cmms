-- -------------------------------------------------------------
-- TablePlus 6.6.8(632)
--
-- https://tableplus.com/
--
-- Database: cmms
-- Generation Time: 2025-07-20 10:30:55.2290
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."inventory_master";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS inventory_master_id_seq;

-- Table Definition
CREATE TABLE "public"."inventory_master" (
    "id" int4 NOT NULL DEFAULT nextval('inventory_master_id_seq'::regclass),
    "part_code" varchar(50) NOT NULL,
    "part_name" varchar(100) NOT NULL,
    "description" text,
    "unit_of_issue" varchar(20) NOT NULL,
    "unit_price" numeric(15,2),
    "minimum_quantity" int4 DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "category" varchar(100),
    "criticality" varchar(50),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."inventory_master" ("id", "part_code", "part_name", "description", "unit_of_issue", "unit_price", "minimum_quantity", "created_at", "updated_at", "category", "criticality") VALUES
(1, 'ENG-001', 'Engine Oil Filter', 'High-quality oil filter for diesel engines', 'PCS', 25.50, 10, '2025-07-19 12:36:20.240008+03', '2025-07-19 12:36:20.240016+03', NULL, NULL),
(2, 'PUMP-002', 'Water Pump Impeller', 'Stainless steel impeller for cooling pumps', 'PCS', 150.00, 5, '2025-07-19 12:36:20.240018+03', '2025-07-19 12:36:20.240019+03', NULL, NULL),
(3, 'BELT-003', 'V-Belt Set', 'Replacement V-belts for motor drives', 'SET', 45.75, 8, '2025-07-19 12:36:20.24002+03', '2025-07-19 12:36:20.24002+03', NULL, NULL),
(4, 'BEARING-004', 'Ball Bearing 6205', 'Standard ball bearing for rotating equipment', 'PCS', 12.25, 20, '2025-07-19 12:36:20.240021+03', '2025-07-19 12:36:20.240022+03', NULL, NULL),
(5, 'VALVE-005', 'Control Valve', 'Pressure control valve for hydraulic systems', 'PCS', 320.00, 3, '2025-07-19 12:36:20.240023+03', '2025-07-19 12:36:20.240023+03', NULL, NULL),
(6, 'GASKET-006', 'Cylinder Head Gasket', 'High-temperature gasket for engine heads', 'PCS', 85.00, 6, '2025-07-19 12:36:20.240024+03', '2025-07-19 12:36:20.240025+03', NULL, NULL),
(7, 'SENSOR-007', 'Temperature Sensor', 'Digital temperature sensor for monitoring', 'PCS', 75.50, 12, '2025-07-19 12:36:20.240026+03', '2025-07-19 12:36:20.240026+03', NULL, NULL),
(8, 'MOTOR-008', 'Electric Motor', '5HP electric motor for industrial use', 'PCS', 1200.00, 2, '2025-07-19 12:36:20.240027+03', '2025-07-19 12:36:20.240028+03', NULL, NULL),
(9, 'BEARING-001', 'Ball Bearing', 'High-quality ball bearing for industrial machinery', 'PCS', 25.50, 10, '2025-07-19 19:25:26.4734+03', '2025-07-19 19:25:26.473404+03', 'Mechanical', 'High'),
(10, 'FILTER-002', 'Oil Filter', 'Premium oil filter for engine protection', 'PCS', 15.75, 20, '2025-07-19 19:25:26.473406+03', '2025-07-19 19:25:26.473406+03', 'Filtration', 'Medium'),
(11, 'PUMP-003', 'Water Pump', 'Industrial water pump for cooling systems', 'PCS', 450.00, 2, '2025-07-19 19:25:26.473407+03', '2025-07-19 19:25:26.473408+03', 'Hydraulic', 'High'),
(12, 'VALVE-004', 'Control Valve', 'Precision control valve for fluid systems', 'PCS', 120.00, 5, '2025-07-19 19:25:26.473409+03', '2025-07-19 19:25:26.47341+03', 'Control', 'Medium'),
(13, 'MOTOR-005', 'Electric Motor', '3HP electric motor for industrial applications', 'PCS', 800.00, 3, '2025-07-19 19:25:26.47341+03', '2025-07-19 19:25:26.473411+03', 'Electrical', 'High');



-- Indices
CREATE UNIQUE INDEX inventory_master_part_code_key ON public.inventory_master USING btree (part_code);
CREATE INDEX idx_inventory_master_part_code ON public.inventory_master USING btree (part_code);
CREATE INDEX idx_inventory_master_category ON public.inventory_master USING btree (category);
CREATE INDEX idx_inventory_master_criticality ON public.inventory_master USING btree (criticality);
