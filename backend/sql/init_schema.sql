-- Initial data for CMMS database

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('admin', 'System administrator with full access'),
('manager', 'Manager with access to reports and approvals'),
('technician', 'Maintenance technician who performs work orders'),
('user', 'Regular user who can report issues');

-- Insert admin user (password: admin123)
INSERT INTO users (username, email, hashed_password, is_superuser)
VALUES ('admin', 'admin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1);

-- Insert default locations
INSERT INTO locations (name, description) VALUES
('Main Facility', 'Primary manufacturing facility'),
('Warehouse', 'Storage and inventory management'),
('Office Building', 'Administrative offices');

-- Insert default asset categories
INSERT INTO asset_categories (name, description) VALUES
('Machinery', 'Production equipment and machinery'),
('Vehicles', 'Company vehicles and transportation'),
('IT Equipment', 'Computers, servers, and network devices'),
('Facilities', 'Building systems and infrastructure');

-- Insert default work order types
INSERT INTO work_order_types (name, description) VALUES
('Preventive', 'Scheduled maintenance to prevent failures'),
('Corrective', 'Repairs to fix issues after they occur'),
('Emergency', 'Urgent repairs for critical failures'),
('Installation', 'Setup of new equipment or systems'),
('Inspection', 'Regular checks and evaluations');