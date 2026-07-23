import config from '../config/env.js';
import pool from '../db/pool.js';
import mockRepository from '../db/mockRepository.js';

async function getMaintenanceHistory(filters = {}) {
  if (config.authMode === 'mock') {
    return mockRepository.getMaintenanceHistory(filters);
  }
  const { assetId } = filters;
  let query = `
    SELECT mh.*, a.asset_id, u.username AS performed_by_name
    FROM maintenance_history mh
    LEFT JOIN assets a ON a.id = mh.asset_id
    LEFT JOIN users u ON u.id = mh.performed_by
    WHERE 1 = 1
  `;
  const values = [];
  let index = 1;

  if (assetId) {
    query += ` AND mh.asset_id = $${index}`;
    values.push(assetId);
    index += 1;
  }

  query += ' ORDER BY mh.performed_at DESC';

  const result = await pool.query(query, values);
  return result.rows;
}

async function createMaintenanceRecord(data) {
  if (config.authMode === 'mock') {
    return mockRepository.createMaintenanceRecord(data);
  }

  const result = await pool.query(
    `INSERT INTO maintenance_history (asset_id, performed_by, maintenance_type, description, cost, technician, completion_date, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.asset_id,
      data.performed_by,
      data.maintenance_type,
      data.description,
      data.cost || 0,
      data.technician || '',
      data.completion_date || null,
      data.remarks || ''
    ]
  );
  return result.rows[0];
}

export { getMaintenanceHistory, createMaintenanceRecord };
