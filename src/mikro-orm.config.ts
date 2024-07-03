import { User } from './users';
import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { config } from 'dotenv';

config();

const logger = new Logger('MikroORM');

export default defineConfig({
  port: 5432,
  dbName: 'test',
  entities: [User],
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logger: logger.log.bind(logger),
  migrations: {
    snapshot: false,
    pathTs: 'src/migrations',
    path: 'dist/migrations'
  },
  extensions: [Migrator]
});
