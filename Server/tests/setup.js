// Keep unit tests deterministic even when a developer has a local .env file
// configured for PostgreSQL.
process.env.NODE_ENV = 'test';
process.env.AUTH_MODE = 'mock';
