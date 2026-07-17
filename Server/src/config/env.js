import 'dotenv/config';

function getBoundPostgresCredentials() {
  try {
    const services = JSON.parse(process.env.VCAP_SERVICES || '{}');
    const binding = Object.values(services)
      .flat()
      .find((service) =>
        service.label === 'postgresql-db' ||
        service.tags?.some((tag) => String(tag).toLowerCase().includes('postgres'))
      );

    return binding?.credentials || {};
  } catch {
    return {};
  }
}

function getBoundXsuaaCredentials() {
  try {
    const services = JSON.parse(process.env.VCAP_SERVICES || '{}');
    const binding = Object.values(services)
      .flat()
      .find((service) => service.label === 'xsuaa' || service.tags?.includes('xsuaa'));

    return binding?.credentials || {};
  } catch {
    return {};
  }
}

const postgresCredentials = getBoundPostgresCredentials();
const xsuaaCredentials = getBoundXsuaaCredentials();
const isProduction = process.env.NODE_ENV === 'production';
const postgresSsl = postgresCredentials.sslrootcert
  ? { rejectUnauthorized: true, ca: postgresCredentials.sslrootcert }
  : { rejectUnauthorized: false };

export default {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  authMode: process.env.AUTH_MODE || 'mock',
  xsuaa: xsuaaCredentials,
  db: {
    host: postgresCredentials.hostname || postgresCredentials.host || process.env.DB_HOST || 'localhost',
    port: Number(postgresCredentials.port || process.env.DB_PORT || 5432),
    database: postgresCredentials.dbname || postgresCredentials.database || process.env.DB_NAME || 'it_asset_tracker',
    user: postgresCredentials.username || postgresCredentials.user || process.env.DB_USER || 'postgres',
    password: postgresCredentials.password || process.env.DB_PASSWORD || 'postgres',
    // SAP BTP PostgreSQL requires TLS. Keep this explicit rather than relying
    // on libpq/driver defaults, which can attempt a non-encrypted connection.
    ssl: isProduction ? postgresSsl : undefined
  }
};
