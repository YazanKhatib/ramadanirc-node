import Knex from 'knex';
import { Model } from 'objection';
import { logger } from 'utils';
import dotenv from 'dotenv';

dotenv.config();

const connection = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: 'src/database/migrations',
  },
  searchPath: ['knex', 'public'],
});

export const initializeDB = async () => {
  try {
    Model.knex(connection);
    connection.migrate.latest().catch((e) => logger.error(e.message));
  } catch (e) {
    logger.error(e.message);
  }
};
