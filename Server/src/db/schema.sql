CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'asset_manager', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  purchase_date DATE NOT NULL,
  purchase_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Maintenance', 'Lost', 'Damaged', 'Retired', 'Disposed')),
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_history (
  id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  performed_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  maintenance_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(12,2) DEFAULT 0,
  technician VARCHAR(200),
  completion_date DATE,
  remarks TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance_history(asset_id);

-- Migration: Add missing columns if they do not exist in older tables
ALTER TABLE maintenance_history ADD COLUMN IF NOT EXISTS cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE maintenance_history ADD COLUMN IF NOT EXISTS technician VARCHAR(200);
ALTER TABLE maintenance_history ADD COLUMN IF NOT EXISTS completion_date DATE;
ALTER TABLE maintenance_history ADD COLUMN IF NOT EXISTS remarks TEXT;
