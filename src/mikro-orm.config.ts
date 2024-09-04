import { User } from './users';
import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/sqlite';
import { Migrator } from '@mikro-orm/migrations';
import { config } from 'dotenv';

config();

const logger = new Logger('MikroORM');

export default defineConfig({
  port: 5432,
  dbName: 'test.db',
  entities: [User],
  logger: logger.log.bind(logger),
  migrations: {
    snapshot: false,
    pathTs: 'src/migrations',
    path: 'dist/migrations'
  },
  extensions: [Migrator]
});
