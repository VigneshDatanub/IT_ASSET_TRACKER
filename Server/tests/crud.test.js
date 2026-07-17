import test from 'node:test';
import assert from 'node:assert/strict';
import * as categoryModel from '../src/models/categoryModel.js';
import * as assetModel from '../src/models/assetModel.js';

test('mock category updates should persist changes', async () => {
  const created = await categoryModel.createCategory({ name: 'Monitors', description: 'Display devices', isActive: true });
  const updated = await categoryModel.updateCategory(created.id, { name: 'Monitors Updated', description: 'Updated description', isActive: true });

  assert.ok(created.id, 'category should be created');
  assert.equal(updated.name, 'Monitors Updated');
  assert.equal(updated.description, 'Updated description');
});

test('mock asset creation should return a persisted asset', async () => {
  const created = await assetModel.createAsset({
    asset_id: 'ASSET-2001',
    name: 'Surface Laptop',
    description: 'Portable workstation',
    category_id: 1,
    purchase_date: '2024-06-01',
    purchase_cost: 1800,
    status: 'Available',
    assigned_to: null,
    location: 'HQ'
  });

  assert.equal(created.asset_id, 'ASSET-2001');
  assert.equal(created.name, 'Surface Laptop');
});

test('mock category deletion should remove the item from the repository', async () => {
  const created = await categoryModel.createCategory({ name: 'Printers', description: 'Print devices', isActive: true });
  const deleted = await categoryModel.deleteCategory(created.id);

  assert.ok(deleted, 'category should be deleted');
  assert.equal(deleted.name, 'Printers');
});

test('mock asset deletion should remove the item from the repository', async () => {
  const created = await assetModel.createAsset({
    asset_id: 'ASSET-2002',
    name: 'Docking Station',
    description: 'USB-C dock',
    category_id: 1,
    purchase_date: '2024-07-01',
    purchase_cost: 250,
    status: 'Available',
    assigned_to: null,
    location: 'HQ'
  });

  const deleted = await assetModel.deleteAsset(created.id);

  assert.ok(deleted, 'asset should be deleted');
  assert.equal(deleted.asset_id, 'ASSET-2002');
});
