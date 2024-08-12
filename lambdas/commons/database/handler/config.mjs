export const DbConfig = {
  HOST: process.env.db_host,
  PORT: process.env.db_port,
  DATABASE: process.env.db_name,
  SCHEMA: process.env.db_schema,
  USERNAME: process.env.db_username,
  PASSWORD: process.env.db_password,
  MAX_CONNECTIONS: process.env.db_max_connections,
  SSL_CERTIFICATE_PATH: process.env.db_ssl_certificate
};