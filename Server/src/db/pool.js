import { Pool } from 'pg';
import config from '../config/env.js';

const pool = new Pool(config.db);

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL client error', error);
});

export default pool;
