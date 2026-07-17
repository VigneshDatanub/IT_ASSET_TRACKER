const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@ittracker.com', password_hash: '$2a$10$eJ5vf8h3oGm2GbfQ3V4mN.1n9sE4x7QzM3GkF1gZfRr6lP9Y6s5O', role: 'admin', is_active: true },
  { id: 2, username: 'manager', email: 'manager@ittracker.com', password_hash: '$2a$10$VzHrB1W0fHfY4xA.GdCkTO7R4hS9i0pHv4O6Fh3cG0P2Q4x5H8v0C', role: 'asset_manager', is_active: true },
  { id: 3, username: 'user', email: 'user@ittracker.com', password_hash: '$2a$10$r3A9d8m5yO0pV7qJ9CkV0uXnW1f3eU4bOQZ9sU8XvLz3QmK7iP32', role: 'user', is_active: true }
];

const mockCategories = [
  { id: 1, name: 'Laptops', description: 'Portable computing devices', is_active: true },
  { id: 2, name: 'Mobiles', description: 'Mobile phones and tablets', is_active: true },
  { id: 3, name: 'Servers', description: 'Infrastructure servers', is_active: true }
];

const mockAssets = [
  { id: 1, asset_id: 'ASSET-1001', name: 'Dell Latitude 5440', description: 'Business laptop', category_id: 1, purchase_date: '2024-01-10', purchase_cost: 1450.0, status: 'Available', assigned_to: null, location: 'London Office' },
  { id: 2, asset_id: 'ASSET-1002', name: 'iPhone 15', description: 'Executive phone', category_id: 2, purchase_date: '2024-03-15', purchase_cost: 1199.0, status: 'Assigned', assigned_to: 3, location: 'New York Office' },
  { id: 3, asset_id: 'ASSET-1003', name: 'Dell PowerEdge R760', description: 'Data center server', category_id: 3, purchase_date: '2023-11-20', purchase_cost: 8200.0, status: 'Maintenance', assigned_to: null, location: 'Data Center A' }
];

const mockMaintenance = [
  { id: 1, asset_id: 3, performed_by: 2, maintenance_type: 'Firmware Upgrade', description: 'Upgraded server firmware', performed_at: '2024-05-01T10:00:00.000Z' }
];

export { mockUsers, mockCategories, mockAssets, mockMaintenance };
