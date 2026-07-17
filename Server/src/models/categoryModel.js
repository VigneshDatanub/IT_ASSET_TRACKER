import config from '../config/env.js';
import pool from '../db/pool.js';
import mockRepository from '../db/mockRepository.js';

async function getAllCategories() {
  if (config.authMode === 'mock') {
    return mockRepository.getAllCategories();
  }

  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
}

async function createCategory({ name, description, isActive = true }) {
  if (config.authMode === 'mock') {
    return mockRepository.createCategory({ name, description, isActive });
  }

  const result = await pool.query(
    `INSERT INTO categories (name, description, is_active)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description, isActive]
  );
  return result.rows[0];
}

async function updateCategory(id, { name, description, isActive }) {
  if (config.authMode === 'mock') {
    return mockRepository.updateCategory(id, { name, description, isActive });
  }

  const result = await pool.query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         is_active = COALESCE($3, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [name, description, isActive, id]
  );
  return result.rows[0];
}

async function deleteCategory(id) {
  if (config.authMode === 'mock') {
    return mockRepository.deleteCategory(id);
  }

  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

export { getAllCategories, createCategory, updateCategory, deleteCategory };
