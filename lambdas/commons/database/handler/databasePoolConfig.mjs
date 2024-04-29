import pgPromise from 'pg-promise';
import fs from 'fs';
import path from 'path';
import { DbConfig } from './config.mjs';
import { DBConsumerPool } from './databaseHandler.mjs';

export const setConfig = async () => {

  const cn = {
    host: DbConfig.HOST,
    port: DbConfig.PORT,
    database: DbConfig.DATABASE,
    user: DbConfig.USERNAME,
    password: DbConfig.PASSWORD,
    max: DbConfig.MAX_CONNECTIONS,
    ssl: {
      ca: fs.readFileSync(path.resolve(__dirname, DbConfig.SSL_CERTIFICATE_PATH))
    }
    // "types" - in case you want to set custom type parsers on the pool level
  };

  DBConsumerPool = pgPromise({})(cn);
};
