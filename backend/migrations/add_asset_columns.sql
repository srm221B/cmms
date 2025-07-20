-- Add new columns to assets table
ALTER TABLE assets ADD COLUMN running_hours DECIMAL(10,2);
ALTER TABLE assets ADD COLUMN power_generation DECIMAL(10,2);
ALTER TABLE assets ADD COLUMN load_factor DECIMAL(5,2);
ALTER TABLE assets ADD COLUMN availability DECIMAL(5,2);
ALTER TABLE assets ADD COLUMN cod DATE;
ALTER TABLE assets ADD COLUMN bim DECIMAL(10,2);

-- Add indexes for better performance on filtered columns
CREATE INDEX idx_assets_running_hours ON assets(running_hours);
CREATE INDEX idx_assets_power_generation ON assets(power_generation);
CREATE INDEX idx_assets_load_factor ON assets(load_factor);
CREATE INDEX idx_assets_availability ON assets(availability);
CREATE INDEX idx_assets_cod ON assets(cod);
CREATE INDEX idx_assets_bim ON assets(bim);
CREATE INDEX idx_assets_status ON assets(status); 