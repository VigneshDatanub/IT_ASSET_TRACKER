import bcrypt from 'bcryptjs';
import pool from './pool.js';

async function seedDatabase() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  await pool.query(`
    INSERT INTO users (username, email, password_hash, role, is_active)
    VALUES
      ('admin', 'admin@ittracker.com', $1, 'admin', true),
      ('manager', 'manager@ittracker.com', $2, 'asset_manager', true),
      ('user', 'user@ittracker.com', $3, 'user', true)
    ON CONFLICT (username) DO NOTHING
  `, [adminPassword, managerPassword, userPassword]);

  await pool.query(`
    INSERT INTO categories (name, description, is_active)
    VALUES
      ('Laptops', 'Portable computing devices', true),
      ('Mobiles', 'Mobile phones and tablets', true),
      ('Servers', 'Infrastructure servers', true)
    ON CONFLICT (name) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO assets (asset_id, name, description, category_id, purchase_date, purchase_cost, status, location)
    SELECT 'ASSET-1001', 'Dell Latitude 5440', 'Business laptop', id, '2024-01-10', 1450.00, 'Available', 'London Office'
    FROM categories WHERE name = 'Laptops'
    ON CONFLICT (asset_id) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO assets (asset_id, name, description, category_id, purchase_date, purchase_cost, status, location, assigned_to)
    SELECT 'ASSET-1002', 'iPhone 15', 'Executive phone', c.id, '2024-03-15', 1199.00, 'Assigned', 'New York Office', u.id
    FROM categories c
    CROSS JOIN users u
    WHERE c.name = 'Mobiles' AND u.username = 'user'
    ON CONFLICT (asset_id) DO NOTHING
  `);

  await pool.query(`
    UPDATE assets 
    SET assigned_to = (SELECT id FROM users WHERE username = 'user')
    WHERE asset_id = 'ASSET-1002' AND assigned_to IS NULL AND status = 'Assigned'
  `);

  await pool.query(`
    INSERT INTO assets (asset_id, name, description, category_id, purchase_date, purchase_cost, status, location)
    SELECT 'ASSET-1003', 'Dell PowerEdge R760', 'Data center server', id, '2023-11-20', 8200.00, 'Maintenance', 'Data Center A'
    FROM categories WHERE name = 'Servers'
    ON CONFLICT (asset_id) DO NOTHING
  `);
}

export default seedDatabase;
