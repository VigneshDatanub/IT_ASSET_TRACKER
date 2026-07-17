import app from './app.js';
import config from './config/env.js';
import pool from './db/pool.js';
import initializeDatabase from './db/init.js';
import seedDatabase from './db/seed.js';

function listenOnPort(port) {
  const normalizedPort = Number.parseInt(port, 10);
  const selectedPort = Number.isNaN(normalizedPort) ? 4000 : normalizedPort;
  const server = app.listen(selectedPort, () => {
    console.log(`Server listening on port ${selectedPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = selectedPort + 1;
      console.warn(`Port ${selectedPort} is already in use. Trying ${nextPort}...`);
      server.close(() => listenOnPort(nextPort));
    } else {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  });
}

async function startServer() {
  if (config.authMode === 'mock') {
    console.log('Using mock auth mode; skipping database initialization');
    listenOnPort(config.port);
    return;
  }

  try {
    await pool.query('SELECT 1');
    await initializeDatabase();
    await seedDatabase();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  listenOnPort(config.port);
}

startServer();
