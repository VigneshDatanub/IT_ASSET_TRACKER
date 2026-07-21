import config from '../config/env.js';
import pool from '../db/pool.js';
import mockRepository from '../db/mockRepository.js';

async function getAllAssets(filters = {}) {
  if (config.authMode === 'mock') {
    return mockRepository.getAllAssets(filters);
  }
  const { status, categoryId, assignedTo, search } = filters;
  let query = `
    SELECT a.*, c.name AS category_name, u.username AS assigned_username
    FROM assets a
    LEFT JOIN categories c ON c.id = a.category_id
    LEFT JOIN users u ON u.id = a.assigned_to
    WHERE 1 = 1
  `;
  const values = [];
  let index = 1;

  if (status) {
    query += ` AND a.status = $${index}`;
    values.push(status);
    index += 1;
  }

  if (categoryId) {
    query += ` AND a.category_id = $${index}`;
    values.push(categoryId);
    index += 1;
  }

  if (assignedTo) {
    query += ` AND a.assigned_to = $${index}`;
    values.push(assignedTo);
    index += 1;
  }

  if (search) {
    query += ` AND (a.name ILIKE $${index} OR a.asset_id ILIKE $${index} OR a.description ILIKE $${index})`;
    values.push(`%${search}%`);
    index += 1;
  }

  query += ' ORDER BY a.created_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
}

async function getAssetById(id) {
  if (config.authMode === 'mock') {
    return mockRepository.getAssetById(id);
  }

  const result = await pool.query(
    `SELECT a.*, c.name AS category_name, u.username AS assigned_username
     FROM assets a
     LEFT JOIN categories c ON c.id = a.category_id
     LEFT JOIN users u ON u.id = a.assigned_to
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function createAsset(data) {
  if (config.authMode === 'mock') {
    return mockRepository.createAsset(data);
  }

  const result = await pool.query(
    `INSERT INTO assets (
      asset_id, name, description, category_id, purchase_date, purchase_cost, status, assigned_to, location
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [data.asset_id, data.name, data.description, data.category_id, data.purchase_date, data.purchase_cost, data.status, data.assigned_to, data.location]
  );
  return result.rows[0];
}

async function updateAsset(id, data) {
  if (config.authMode === 'mock') {
    return mockRepository.updateAsset(id, data);
  }

  const fields = [];
  const values = [];
  let index = 1;

  const updatableFields = [
    'asset_id',
    'name',
    'description',
    'category_id',
    'purchase_date',
    'purchase_cost',
    'status',
    'assigned_to',
    'location'
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${index}`);
      values.push(data[field]);
      index++;
    }
  }

  if (fields.length === 0) {
    return getAssetById(id);
  }

  values.push(id);
  const query = `
    UPDATE assets
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deleteAsset(id) {
  if (config.authMode === 'mock') {
    return mockRepository.deleteAsset(id);
  }

  const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

async function getAssetsByUser(userId) {
  if (config.authMode === 'mock') {
    return mockRepository.getAssetsByUser(userId);
  }

  const result = await pool.query(
    `SELECT a.*, c.name AS category_name
     FROM assets a
     LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.assigned_to = $1
     ORDER BY a.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getAssetsByUser };
