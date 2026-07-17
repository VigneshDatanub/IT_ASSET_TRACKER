import bcrypt from 'bcryptjs';
import config from '../config/env.js';
import pool from '../db/pool.js';
import mockRepository from '../db/mockRepository.js';

async function getUserByUsername(username) {
  if (config.authMode === 'mock') {
    return mockRepository.getUserByUsername(username);
  }

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id) {
  if (config.authMode === 'mock') {
    return mockRepository.getUserById(id);
  }

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function getUserByEmail(email) {
  if (config.authMode === 'mock') {
    return mockRepository.getUserByEmail(email);
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function createUser({ username, email, password, role = 'user' }) {
  if (config.authMode === 'mock') {
    const passwordHash = await bcrypt.hash(password, 10);
    return mockRepository.createUser({ username, email, role, passwordHash });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role, is_active, created_at, updated_at`,
    [username, email, passwordHash, role]
  );
  return result.rows[0];
}

async function verifyPassword(password, hash, username) {
  if (config.authMode === 'mock') {
    const mockPasswords = {
      admin: 'Admin123!',
      manager: 'Manager123!',
      user: 'User123!'
    };

    if (mockPasswords[username]) {
      return password === mockPasswords[username];
    }

    // Users registered during a mock-mode session have a real bcrypt hash.
    return bcrypt.compare(password, hash);
  }

  return bcrypt.compare(password, hash);
}

export { getUserByUsername, getUserById, getUserByEmail, createUser, verifyPassword };
